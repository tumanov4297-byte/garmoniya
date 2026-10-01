
(function(){
  "use strict";

  // Вход в админ-панель — только по 6-значному коду. В коде хранится не сам код,
  // а SHA-256 от "garmoniya-admin:<код>". Сменить код: посчитать новый хэш
  //   echo -n "garmoniya-admin:НОВЫЙКОД" | sha256sum
  // и заменить строку ниже.
  const ADMIN_CODE_HASH="8a623844da4d793a79260c2ef7e4de62633d12a55ddf5cc22ae8e695513363f9";
  const ADMIN_CODE_LEN=6;
  const ADMIN_MAX_TRIES=5, ADMIN_LOCK_MS=60*1000;
  const CITY_NAMES={gubkin:"Губкинский",purpe:"мкр. Пурпе",muravlenko:"Муравленко",noyabrsk:"Ноябрьск",tarko:"Тарко-Сале",urengoy:"Уренгой"};
  const CONTACT_FIELDS=[["address","Адрес"],["phone","Телефон (для показа)"],["phoneRaw","Телефон (цифры, для звонка)"],["email","Email"],["orderEmail","Email для приёма заявок (куда улетают заявки)"],["hours","Часы работы"]];
  const TIME_FIELDS=["openH","openM","closeH","closeM"];

  let editCity="gubkin", editTab="overview";
  let svcFilter="", staffFilter="";
  let openCats={}, openDepts={};

  function applyOv(ov){
    if(!ov||typeof ov!=="object")return;
    if(ov.cityData)for(const c in ov.cityData){
      if(cityData[c])Object.assign(cityData[c],ov.cityData[c]);
    }
    if(ov.branchContent)for(const c in ov.branchContent){
      const b=branchContent[c];if(!b)continue;
      const o=ov.branchContent[c];
      if(o.services){b.services.length=0;o.services.forEach(x=>b.services.push(x));}
      if(o.staff){b.staff.length=0;o.staff.forEach(x=>b.staff.push(x));}
    }
    if(ov.newsData&&typeof newsData!=="undefined"){newsData.length=0;ov.newsData.forEach(x=>newsData.push(x));}
    if(ov.eventsData&&typeof eventsData!=="undefined"){eventsData.length=0;ov.eventsData.forEach(x=>eventsData.push(x));}
    if(ov.emailTemplates&&typeof emailTemplates!=="undefined")Object.assign(emailTemplates,ov.emailTemplates);
    if(ov.galleryData&&typeof galleryData!=="undefined"){galleryData.length=0;ov.galleryData.forEach(x=>galleryData.push(x));}
  }
  function applyOverrides(){
    let ov;try{ov=JSON.parse(localStorage.getItem("adminOverrides")||"null");}catch(e){ov=null;}
    applyOv(ov);
  }
  /* Полный снимок редактируемых данных. */
  function snapshot(){
    const ov={cityData:{},branchContent:{}};
    for(const c in cityData){
      ov.cityData[c]={};
      CONTACT_FIELDS.forEach(([f])=>{ov.cityData[c][f]=cityData[c][f];});
      TIME_FIELDS.forEach(f=>{if(cityData[c][f]!=null)ov.cityData[c][f]=cityData[c][f];});
    }
    for(const c in branchContent){
      ov.branchContent[c]={services:branchContent[c].services,staff:branchContent[c].staff};
    }
    if(typeof newsData!=="undefined")ov.newsData=newsData;
    if(typeof eventsData!=="undefined")ov.eventsData=eventsData;
    if(typeof emailTemplates!=="undefined")ov.emailTemplates=emailTemplates;
    if(typeof galleryData!=="undefined")ov.galleryData=galleryData;
    return ov;
  }
  function saveOverrides(){
    try{
      localStorage.setItem("adminOverrides",JSON.stringify(snapshot()));
      return true;
    }catch(e){
      showToast("Не удалось сохранить — слишком много данных (например, тяжёлые фото). Уменьшите количество или размер фото и попробуйте снова.");
      console.error("saveOverrides failed:",e);
      return false;
    }
  }
  function hashStr(str){let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return (h>>>0).toString(36);}

  /* ═══ Публикация для всех пользователей ═══
     Правки в панели сохраняются в браузере администратора. Чтобы их увидели все,
     администратор скачивает файл overrides.json и кладёт его в папку data/ на сайте.
     При запуске приложение загружает этот файл; правки на этом устройстве — поверх. */
  const published={tried:false,loaded:false,at:null,hash:null};
  function loadPublished(){
    if(location.protocol==="file:"){published.tried=true;return;}
    fetch("data/overrides.json?t="+Date.now(),{cache:"no-store"})
      .then(r=>r.ok?r.json():null)
      .then(ov=>{
        published.tried=true;
        if(!ov||typeof ov!=="object"||!ov.branchContent)return;
        published.loaded=true;published.at=ov.publishedAt||null;
        const meta=Object.assign({},ov);delete meta.publishedAt;
        published.hash=hashStr(JSON.stringify(meta));
        applyOv(ov);
        applyOverrides();          /* правки этого устройства важнее */
        refreshActive();
        const fs=document.getElementById("adminFs");if(fs)updateSaveState();
      })
      .catch(()=>{published.tried=true;});
  }

  function isAuthed(){return sessionStorage.getItem("adminAuthed")==="1";}

  function refreshActive(){
    if(typeof currentCity!=="undefined"){
      servicesData=branchContent[currentCity].services;
      staffData=branchContent[currentCity].staff;
    }
  }

  function esc(s){return (s||"").toString().replace(/"/g,"&quot;").replace(/</g,"&lt;");}

  function pickAndResizeImage(cb,maxSize){
    maxSize=maxSize||640;
    const inp=document.createElement("input");
    inp.type="file";inp.accept="image/*";inp.style.display="none";
    document.body.appendChild(inp);
    inp.onchange=()=>{
      const file=inp.files&&inp.files[0];
      inp.remove();
      if(!file)return;
      if(!file.type.startsWith("image/")){showToast("Выберите файл изображения");return;}
      if(file.size>8*1024*1024){showToast("Файл слишком большой (макс. 8 МБ)");return;}
      const reader=new FileReader();
      reader.onload=ev=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1,maxSize/Math.max(img.width,img.height));
          const w=Math.round(img.width*scale),h=Math.round(img.height*scale);
          const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          cb(canvas.toDataURL("image/jpeg",0.85));
        };
        img.src=ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }

  window.openAdmin=function(){
    document.querySelectorAll(".admin-ovl,.admin-fs").forEach(e=>e.remove());
    if(!isAuthed()){
      const ovl=document.createElement("div");ovl.className="admin-ovl";ovl.setAttribute("role","dialog");ovl.setAttribute("aria-modal","true");
      ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
      document.body.appendChild(ovl);
      renderLogin(ovl);
    }else{
      openFullPanel();
    }
  };

  /* SHA-256: через WebCrypto, а если страница открыта не по HTTPS — запасная JS-реализация. */
  function sha256Fallback(str){
    const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const bytes=Array.from(new TextEncoder().encode(str));
    const bitLen=bytes.length*8;
    bytes.push(0x80);while(bytes.length%64!==56)bytes.push(0);
    for(let i=7;i>=0;i--)bytes.push(Math.floor(bitLen/Math.pow(2,i*8))&255);
    let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const r=(x,n)=>(x>>>n)|(x<<(32-n));
    for(let o=0;o<bytes.length;o+=64){
      const W=new Array(64);
      for(let i=0;i<16;i++)W[i]=(bytes[o+i*4]<<24)|(bytes[o+i*4+1]<<16)|(bytes[o+i*4+2]<<8)|bytes[o+i*4+3];
      for(let i=16;i<64;i++){const s0=r(W[i-15],7)^r(W[i-15],18)^(W[i-15]>>>3),s1=r(W[i-2],17)^r(W[i-2],19)^(W[i-2]>>>10);W[i]=(W[i-16]+s0+W[i-7]+s1)|0;}
      let [a,b,c,d,e,f,g,h]=H;
      for(let i=0;i<64;i++){
        const S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+W[i])|0;
        const S0=r(a,2)^r(a,13)^r(a,22),mj=(a&b)^(a&c)^(b&c),t2=(S0+mj)|0;
        h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
      }
      H=[H[0]+a,H[1]+b,H[2]+c,H[3]+d,H[4]+e,H[5]+f,H[6]+g,H[7]+h].map(x=>x|0);
    }
    return H.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("");
  }
  async function sha256Hex(str){
    try{
      if(window.crypto&&crypto.subtle){
        const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
      }
    }catch(e){}
    return sha256Fallback(str);
  }
  function lockLeft(){
    const until=parseInt(localStorage.getItem("admLockUntil")||"0",10);
    return Math.max(0,until-Date.now());
  }

  function renderLogin(ovl){
    ovl.innerHTML=`<div class="admin-card pin-card">
      <div class="pin-ico" aria-hidden="true">🔐</div>
      <h3 class="pin-title">Вход для администратора</h3>
      <p class="pin-sub" id="pinSub">Введите код доступа</p>
      <div class="pin-dots" id="pinDots" aria-hidden="true">${"<span></span>".repeat(ADMIN_CODE_LEN)}</div>
      <input class="pin-hidden" id="pinInp" type="password" inputmode="numeric" autocomplete="one-time-code"
        maxlength="${ADMIN_CODE_LEN}" aria-label="Код доступа, ${ADMIN_CODE_LEN} цифр">
      <div class="pin-pad" role="group" aria-label="Цифровая клавиатура">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" class="pin-key" data-k="${n}">${n}</button>`).join("")}
        <button type="button" class="pin-key pin-key-txt" data-k="cancel">Отмена</button>
        <button type="button" class="pin-key" data-k="0">0</button>
        <button type="button" class="pin-key pin-key-txt" data-k="del" aria-label="Стереть цифру">⌫</button>
      </div>
    </div>`;
    const inp=ovl.querySelector("#pinInp"),dots=ovl.querySelectorAll("#pinDots span"),sub=ovl.querySelector("#pinSub");
    const card=ovl.querySelector(".pin-card");
    let code="",busy=false,lockTimer=null;
    function paint(){
      dots.forEach((d,i)=>d.classList.toggle("on",i<code.length));
      inp.value=code;
    }
    function showLock(){
      const left=lockLeft();
      card.classList.toggle("locked",left>0);
      if(left>0){
        sub.textContent="Слишком много попыток. Повторите через "+Math.ceil(left/1000)+" с";
        clearTimeout(lockTimer);lockTimer=setTimeout(showLock,1000);
      }else{
        sub.textContent="Введите код доступа";
        localStorage.removeItem("admTries");
      }
      return left>0;
    }
    async function check(){
      if(busy)return;busy=true;
      const ok=(await sha256Hex("garmoniya-admin:"+code))===ADMIN_CODE_HASH;
      if(ok){
        localStorage.removeItem("admTries");localStorage.removeItem("admLockUntil");
        sessionStorage.setItem("adminAuthed","1");
        card.classList.add("ok");
        setTimeout(()=>{ovl.remove();openFullPanel();},180);
        return;
      }
      const tries=parseInt(localStorage.getItem("admTries")||"0",10)+1;
      localStorage.setItem("admTries",String(tries));
      if(tries>=ADMIN_MAX_TRIES){localStorage.setItem("admLockUntil",String(Date.now()+ADMIN_LOCK_MS));}
      card.classList.remove("err");void card.offsetWidth;card.classList.add("err");
      if(navigator.vibrate)try{navigator.vibrate(120);}catch(e){}
      setTimeout(()=>{
        code="";paint();busy=false;
        if(!showLock())sub.textContent="Неверный код. Осталось попыток: "+(ADMIN_MAX_TRIES-tries);
      },420);
    }
    function press(k){
      if(k==="cancel"){clearTimeout(lockTimer);ovl.remove();return;}
      if(busy||lockLeft()>0){showLock();return;}
      if(k==="del"){code=code.slice(0,-1);paint();return;}
      if(!/^\d$/.test(k)||code.length>=ADMIN_CODE_LEN)return;
      code+=k;paint();
      if(code.length===ADMIN_CODE_LEN)check();
    }
    ovl.querySelectorAll(".pin-key").forEach(b=>b.onclick=()=>press(b.dataset.k));
    // Физическая клавиатура (ПК) и ввод в скрытое поле
    inp.addEventListener("input",()=>{
      const v=inp.value.replace(/\D/g,"").slice(0,ADMIN_CODE_LEN);
      if(busy||lockLeft()>0){inp.value=code;return;}
      code=v;paint();if(code.length===ADMIN_CODE_LEN)check();
    });
    ovl.addEventListener("keydown",e=>{
      if(e.target===inp)return;
      if(/^\d$/.test(e.key)){press(e.key);e.preventDefault();}
      else if(e.key==="Backspace"){press("del");e.preventDefault();}
      else if(e.key==="Escape"){press("cancel");}
    });
    showLock();
    // На ПК фокус в скрытое поле — можно печатать цифры с клавиатуры.
    // На телефоне не фокусируем, чтобы системная клавиатура не закрыла наш пин-пад.
    if(window.matchMedia&&matchMedia("(pointer:fine)").matches){
      setTimeout(()=>{try{inp.focus({preventScroll:true});}catch(e){}},60);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     ПАНЕЛЬ АДМИНИСТРАТОРА
     • Боковое меню (на телефоне — полоса вкладок сверху).
     • Всё сохраняется само через полсекунды после ввода — кнопок «Сохранить» нет.
     • Удаление можно отменить в течение 6 секунд.
     • Поиск не сбрасывает курсор и не теряет введённое.
     • «Обзор» проверяет данные: услуги без цены, «Морошка» дороже цены,
       дубли, пустые контакты — с кнопкой «Исправить».
     • «Публикация» — как сделать, чтобы правки увидели все.
     ═══════════════════════════════════════════════════════════════ */
  const TABS=[
    ["overview","🏠","Обзор"],
    ["contacts","📍","Контакты",true],
    ["services","📋","Услуги",true],
    ["staff","👥","Сотрудники",true],
    ["news","📰","Новости"],
    ["events","🎟️","Мероприятия"],
    ["gallery","🖼️","Галерея"],
    ["templates","✉️","Шаблоны писем"],
    ["stats","📊","Статистика"],
    ["publish","🚀","Публикация"]
  ];
  let saveTimer=null,saveState="saved",snackTimer=null;

  function openFullPanel(){
    document.querySelectorAll(".admin-fs").forEach(e=>e.remove());
    const fs=document.createElement("div");fs.className="admin-fs adm2";fs.id="adminFs";
    fs.setAttribute("role","dialog");fs.setAttribute("aria-modal","true");fs.setAttribute("aria-label","Панель администратора");
    document.body.appendChild(fs);
    renderShell(fs);
  }
  function closeFullPanel(){
    flushSave();
    const fs=document.getElementById("adminFs");
    if(fs)fs.remove();
    refreshActive();
  }

  /* ─── Автосохранение ─── */
  function touch(){
    saveState="saving";updateSaveState();
    clearTimeout(saveTimer);
    saveTimer=setTimeout(flushSave,500);
  }
  function flushSave(){
    if(!saveTimer)return;
    clearTimeout(saveTimer);saveTimer=null;
    saveState=saveOverrides()?"saved":"error";
    refreshActive();updateSaveState();
  }
  function isUnpublished(){
    if(!published.loaded)return !!localStorage.getItem("adminOverrides");
    return hashStr(JSON.stringify(snapshot()))!==published.hash;
  }
  function updateSaveState(){
    const el=document.getElementById("admSave");if(!el)return;
    const txt={saving:"Сохраняю…",saved:"Сохранено",error:"Ошибка сохранения"}[saveState];
    el.className="adm2-save "+saveState;
    el.innerHTML='<i></i>'+txt+(saveState==="saved"&&isUnpublished()?' <span class="adm2-unpub">· не опубликовано</span>':'');
    const pb=document.querySelector('.adm2-tab[data-tab="publish"] .adm2-dot');
    if(pb)pb.hidden=!isUnpublished();
  }

  /* ─── Отмена удаления ─── */
  function undoable(msg,restore){
    const sn=document.getElementById("admSnack");if(!sn)return;
    clearTimeout(snackTimer);
    sn.innerHTML='<span>'+esc(msg)+'</span><button type="button" id="admUndo">Отменить</button>';
    sn.hidden=false;
    sn.querySelector("#admUndo").onclick=()=>{restore();touch();sn.hidden=true;renderBody();};
    snackTimer=setTimeout(()=>{sn.hidden=true;},6000);
  }

  /* Цена по «Морошке»: −5%, округление «к чётному» — так посчитан действующий прейскурант. */
  function moroshkaOf(p){
    const x=p*0.95,f=Math.floor(x),d=x-f;
    if(Math.abs(d-0.5)<1e-9)return f%2===0?f:f+1;
    return Math.round(x);
  }
  function num(v){const n=parseInt(String(v).replace(/\s/g,""),10);return isNaN(n)?null:n;}
  function autoGrow(t){t.style.height="auto";t.style.height=(t.scrollHeight+2)+"px";}

  function renderShell(fs){
    fs.innerHTML=`
      <header class="adm2-hdr">
        <img src="img/logo-icon.png" class="adm2-logo" alt="" onerror="this.style.display='none'">
        <div class="adm2-ttl"><b>Админпанель</b><span>ГБУ ЯНАО «ЦСОН «Гармония»</span></div>
        <span class="adm2-save saved" id="admSave" role="status" aria-live="polite"></span>
        <button class="adm2-x" id="admFsClose" aria-label="Закрыть панель" title="Закрыть">✕</button>
      </header>
      <div class="adm2-wrap">
        <nav class="adm2-nav" aria-label="Разделы панели">
          <label class="adm2-city"><span>Филиал</span>
            <select id="admCity">${Object.keys(CITY_NAMES).map(c=>`<option value="${c}" ${c===editCity?"selected":""}>${CITY_NAMES[c]}</option>`).join("")}</select>
          </label>
          <div class="adm2-tabs" role="tablist">
            ${TABS.map(([k,ico,l,br])=>`<button type="button" class="adm2-tab${k===editTab?" active":""}" data-tab="${k}" role="tab" aria-selected="${k===editTab}"><span class="adm2-tab-ico" aria-hidden="true">${ico}</span><span class="adm2-tab-l">${l}</span>${br?'<span class="adm2-tab-br">филиал</span>':''}${k==="publish"?'<span class="adm2-dot" hidden></span>':''}</button>`).join("")}
          </div>
          <button type="button" class="adm2-logout" id="admLogout">Выйти из панели</button>
        </nav>
        <main class="adm2-main" id="admBody" tabindex="-1"></main>
      </div>
      <div class="adm2-snack" id="admSnack" role="status" aria-live="polite" hidden></div>
      <input type="file" id="admFile" accept="application/json,.json" style="display:none">
    `;
    fs.querySelector("#admFsClose").onclick=closeFullPanel;
    fs.querySelector("#admCity").onchange=e=>{flushSave();editCity=e.target.value;svcFilter="";staffFilter="";openCats={};openDepts={};renderBody();};
    fs.querySelectorAll(".adm2-tab").forEach(t=>t.onclick=()=>switchTab(t.dataset.tab));
    fs.querySelector("#admFile").onchange=e=>{importJSON(e.target.files[0]);e.target.value="";};
    fs.querySelector("#admLogout").onclick=()=>{flushSave();sessionStorage.removeItem("adminAuthed");closeFullPanel();showToast("Вы вышли из панели");};
    fs.addEventListener("keydown",e=>{if(e.key==="Escape"&&!e.target.closest("input,textarea,select"))closeFullPanel();});
    renderBody();
    updateSaveState();
  }
  function switchTab(tab){
    flushSave();
    editTab=tab;
    document.querySelectorAll(".adm2-tab").forEach(x=>{const on=x.dataset.tab===tab;x.classList.toggle("active",on);x.setAttribute("aria-selected",String(on));});
    renderBody();
    const a=document.querySelector(".adm2-tab.active");if(a&&a.scrollIntoView)a.scrollIntoView({block:"nearest",inline:"center"});
  }
  function jumpTo(city,tab,filter){
    flushSave();
    editCity=city;
    const sel=document.getElementById("admCity");if(sel)sel.value=city;
    if(tab==="services"){svcFilter=filter||"";openCats={};}
    if(tab==="staff"){staffFilter=filter||"";openDepts={};}
    switchTab(tab);
  }
  function renderBody(){
    const body=document.getElementById("admBody");
    if(!body)return;
    body.scrollTop=0;
    ({overview:renderOverview,contacts:renderContacts,services:renderServices,staff:renderStaff,news:renderNews,
      events:renderEvents,gallery:renderGallery,templates:renderTemplates,stats:renderStats,publish:renderPublish}[editTab]||renderOverview)(body);
  }
  function head(title,sub){
    return `<div class="adm2-head"><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</div>`;
  }

  /* ═══ Обзор и проверка данных ═══ */
  function issuesFor(c){
    const out=[],b=branchContent[c],cd=cityData[c]||{};
    if(!cd.phone)out.push(["contacts","Не указан телефон филиала",""]);
    if(!cd.orderEmail)out.push(["contacts","Не указан email для приёма заявок — заявки некуда отправить",""]);
    else if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cd.orderEmail))out.push(["contacts","Email для заявок записан с ошибкой: "+cd.orderEmail,""]);
    if(/уточните/i.test(cd.address||""))out.push(["contacts","Адрес не уточнён: «"+cd.address+"»",""]);
    b.services.forEach(cat=>{
      if(!String(cat.name||"").trim())out.push(["services","Категория без названия",""]);
      const seen={};
      cat.items.forEach(it=>{
        const n=String(it.n||"").trim();
        if(!n)out.push(["services","Услуга без названия в «"+cat.name+"»",""]);
        if(!it.p)out.push(["services","Нет цены: «"+n.slice(0,60)+"»",n.slice(0,30)]);
        if(it.m!=null&&it.p&&it.m>it.p)out.push(["services","Цена по «Морошке» выше обычной: «"+n.slice(0,60)+"»",n.slice(0,30)]);
        const k=n.toLowerCase().replace(/\s+/g," ");
        if(k&&seen[k]!=null&&seen[k]!==it.p)out.push(["services","Одна услуга с разными ценами ("+seen[k]+" и "+it.p+" ₽): «"+n.slice(0,60)+"»",n.slice(0,30)]);
        if(k)seen[k]=it.p;
      });
    });
    b.staff.forEach(p=>{
      if(!String(p.name||"").trim()||p.name==="Новый сотрудник")out.push(["staff","Сотрудник без ФИО",""]);
      else if(!String(p.pos||"").trim())out.push(["staff","Не указана должность: "+p.name,p.name]);
      if(p.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))out.push(["staff","Email с ошибкой: "+p.name,p.name]);
    });
    return out;
  }
  function renderOverview(body){
    let html=head("Обзор","Сводка по филиалам и проверка данных. Нажмите на филиал, чтобы перейти к его услугам.");
    const unpub=isUnpublished();
    html+=`<div class="adm2-banner ${unpub?"warn":"ok"}">
      <span class="adm2-banner-ico">${unpub?"⚠️":"✅"}</span>
      <div><b>${unpub?"Есть изменения, которые видны только на этом устройстве":(published.loaded?"Данные опубликованы":"Изменений нет")}</b>
      <span>${unpub?"Чтобы их увидели все пользователи, опубликуйте файл с данными.":(published.at?"Версия от "+new Date(published.at).toLocaleString("ru-RU"):"Пользователи видят то же, что и вы.")}</span></div>
      ${unpub?'<button type="button" class="adm2-btn" data-go="publish">Как опубликовать</button>':""}
    </div>`;
    html+='<div class="adm2-grid">';
    Object.keys(CITY_NAMES).forEach(c=>{
      const b=branchContent[c];
      const svcCount=b.services.reduce((s,cat)=>s+cat.items.length,0);
      const iss=issuesFor(c).length;
      const empty=!b.services.length&&!b.staff.length;
      html+=`<button type="button" class="adm2-card${c===editCity?" cur":""}" data-jump-city="${c}">
        <div class="adm2-card-top"><b>${CITY_NAMES[c]}</b>
          <span class="adm2-badge ${empty?"off":iss?"warn":"on"}">${empty?"Не заполнен":iss?iss+" "+plural(iss,["замечание","замечания","замечаний"]):"Всё в порядке"}</span></div>
        <div class="adm2-card-stats">
          <span><b>${b.services.length}</b>${plural(b.services.length,["раздел","раздела","разделов"])}</span>
          <span><b>${svcCount}</b>${plural(svcCount,["услуга","услуги","услуг"])}</span>
          <span><b>${b.staff.length}</b>${plural(b.staff.length,["сотрудник","сотрудника","сотрудников"])}</span>
        </div>
      </button>`;
    });
    html+='</div>';
    html+=`<div class="adm2-sub">Общее для всех филиалов</div><div class="adm2-mini">
      <button type="button" data-go="news"><b>${typeof newsData!=="undefined"?newsData.length:0}</b> новостей</button>
      <button type="button" data-go="events"><b>${typeof eventsData!=="undefined"?eventsData.length:0}</b> мероприятий</button>
      <button type="button" data-go="gallery"><b>${typeof galleryData!=="undefined"?galleryData.length:0}</b> фото</button></div>`;
    const all=[];Object.keys(CITY_NAMES).forEach(c=>issuesFor(c).forEach(i=>all.push([c].concat(i))));
    html+=`<div class="adm2-sub">Проверка данных ${all.length?`<span class="adm2-count warn">${all.length}</span>`:'<span class="adm2-count ok">✓</span>'}</div>`;
    if(!all.length)html+='<div class="adm2-empty">Ошибок не найдено.</div>';
    else{
      html+='<div class="adm2-issues">';
      all.slice(0,60).forEach(([c,tab,msg,flt])=>{
        html+=`<div class="adm2-issue"><span class="adm2-issue-city">${CITY_NAMES[c]}</span><span class="adm2-issue-msg">${esc(msg)}</span>
          <button type="button" class="adm2-btn ghost sm" data-fix="${c}|${tab}|${esc(flt)}">Исправить</button></div>`;
      });
      if(all.length>60)html+=`<div class="adm2-empty">…и ещё ${all.length-60}</div>`;
      html+='</div>';
    }
    body.innerHTML=html;
    body.querySelectorAll("[data-jump-city]").forEach(card=>card.onclick=()=>jumpTo(card.dataset.jumpCity,"services"));
    body.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>switchTab(b.dataset.go));
    body.querySelectorAll("[data-fix]").forEach(b=>b.onclick=()=>{const[c,tab,f]=b.dataset.fix.split("|");jumpTo(c,tab,f);});
  }
  function plural(n,f){const a=n%10,b=n%100;return (a===1&&b!==11)?f[0]:(a>=2&&a<=4&&(b<10||b>=20))?f[1]:f[2];}

  /* ═══ Контакты ═══ */
  function renderContacts(body){
    const cd=cityData[editCity];
    const pad=n=>String(n==null?"":n).padStart(2,"0");
    const hint={phone:"Как показывать в приложении, например 8(34936)2-70-77",phoneRaw:"Только цифры, с 7 в начале — для кнопки «Позвонить»",
      orderEmail:"На этот адрес приходят заявки, записи и заказы такси",hours:"Текст для показа, например «Пн–Пт: 08:30–18:00, обед 12:30–14:00»"};
    let html=head("Контакты — "+CITY_NAMES[editCity],"Изменения сохраняются автоматически.");
    html+='<div class="adm2-form">';
    CONTACT_FIELDS.forEach(([f,l])=>{
      html+=`<label class="adm2-fld${f==="address"||f==="hours"?" wide":""}"><span>${l}</span>
        <input class="adm2-inp" data-cf="${f}" value="${esc(cd[f])}" ${f.toLowerCase().includes("email")?'type="email" inputmode="email"':f==="phoneRaw"?'inputmode="numeric"':''}>
        ${f==="phoneRaw"?'<button type="button" class="adm2-link" id="admPhoneRaw">Взять из телефона выше</button>':''}
        ${hint[f]?`<small>${hint[f]}</small>`:""}<em class="adm2-err" data-err="${f}"></em></label>`;
    });
    html+=`<div class="adm2-fld wide"><span>Время работы для статуса «Открыто / Закрыто» в шапке</span>
      <div class="adm2-row"><label class="adm2-inline">с <input class="adm2-inp time" type="time" id="admOpen" value="${pad(cd.openH)}:${pad(cd.openM)}"></label>
      <label class="adm2-inline">до <input class="adm2-inp time" type="time" id="admClose" value="${pad(cd.closeH)}:${pad(cd.closeM)}"></label></div>
      <small>Обеденный перерыв ${typeof WORK_BREAK!=="undefined"?WORK_BREAK.from+"–"+WORK_BREAK.to:""} учитывается автоматически. Сб и Вс — выходные.</small></div>`;
    html+='</div>';
    body.innerHTML=html;
    const check=(f,v)=>{
      const e=body.querySelector(`[data-err="${f}"]`);if(!e)return;
      let m="";
      if(/email/i.test(f)&&v&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))m="Похоже, адрес записан с ошибкой";
      if(f==="phoneRaw"&&v&&!/^7\d{10}$/.test(v))m="Нужно 11 цифр, начиная с 7";
      if(f==="orderEmail"&&!v)m="Без этого адреса заявки не отправятся";
      e.textContent=m;
    };
    body.querySelectorAll("[data-cf]").forEach(inp=>{
      check(inp.dataset.cf,inp.value);
      inp.oninput=()=>{cityData[editCity][inp.dataset.cf]=inp.value.trim();check(inp.dataset.cf,inp.value.trim());touch();};
    });
    body.querySelector("#admPhoneRaw").onclick=()=>{
      let d=String(cityData[editCity].phone||"").replace(/\D/g,"");if(d.length===11&&d[0]==="8")d="7"+d.slice(1);
      const i=body.querySelector('[data-cf="phoneRaw"]');i.value=d;i.oninput();
    };
    const setT=(id,hk,mk)=>{const el=body.querySelector(id);el.onchange=()=>{const[h,m]=el.value.split(":").map(Number);if(!isNaN(h)){cityData[editCity][hk]=h;cityData[editCity][mk]=m||0;touch();}};};
    setT("#admOpen","openH","openM");setT("#admClose","closeH","closeM");
  }

  /* ═══ Услуги ═══ */
  function renderServices(body){
    const svc=branchContent[editCity].services;
    const total=svc.reduce((s,c)=>s+c.items.length,0);
    let html=head("Услуги — "+CITY_NAMES[editCity],`${svc.length} ${plural(svc.length,["раздел","раздела","разделов"])}, ${total} ${plural(total,["услуга","услуги","услуг"])}. Цена «Морошка» пустая — значит без скидки.`);
    html+=`<div class="adm2-toolbar">
      <input class="adm2-inp adm2-search" id="svcSearch" type="search" placeholder="Найти услугу или раздел…" value="${esc(svcFilter)}" aria-label="Поиск услуги">
      <button type="button" class="adm2-btn ghost" id="svcToggleAll">Развернуть все</button>
      <button type="button" class="adm2-btn" id="addCat">+ Раздел</button>
    </div><div id="svcList"></div>`;
    body.innerHTML=html;
    const list=body.querySelector("#svcList");
    const draw=()=>{
      const f=svcFilter.trim().toLowerCase();
      if(!svc.length){list.innerHTML='<div class="adm2-empty">В этом филиале пока нет услуг. Нажмите «+ Раздел», чтобы начать.</div>';return;}
      let h="",shown=0;
      svc.forEach((cat,ci)=>{
        const items=cat.items.map((it,ii)=>({it,ii})).filter(({it})=>!f||String(it.n).toLowerCase().includes(f)||String(cat.name).toLowerCase().includes(f));
        if(f&&!items.length)return;
        shown++;
        const open=f?true:!!openCats[ci];
        h+=`<section class="adm2-sec${open?" open":""}">
          <div class="adm2-sec-head">
            <button type="button" class="adm2-chev" data-tcat="${ci}" aria-expanded="${open}" aria-label="${open?"Свернуть":"Развернуть"} раздел">▸</button>
            <input class="adm2-inp ico" data-cat="${ci}" data-f="icon" value="${esc(cat.icon)}" aria-label="Значок раздела" maxlength="4">
            <input class="adm2-inp grow strong" data-cat="${ci}" data-f="name" value="${esc(cat.name)}" placeholder="Название раздела" aria-label="Название раздела">
            <span class="adm2-count">${cat.items.length}</span>
            <button type="button" class="adm2-icon-btn danger" data-delcat="${ci}" aria-label="Удалить раздел" title="Удалить раздел">🗑</button>
          </div>`;
        if(open){
          h+=`<div class="adm2-items"><div class="adm2-items-head"><span>Название услуги</span><span>Цена, ₽</span><span>«Морошка», ₽</span><span></span></div>`;
          items.forEach(({it,ii})=>{
            const bad=it.m!=null&&it.p&&it.m>it.p;
            h+=`<div class="adm2-item" data-row="${ci}_${ii}">
              <textarea class="adm2-inp grow" rows="1" data-cat="${ci}" data-item="${ii}" data-f="n" placeholder="Название услуги" aria-label="Название услуги">${esc(it.n)}</textarea>
              <label class="adm2-pw"><span class="adm2-m-lbl">Цена, ₽</span><input class="adm2-inp price${it.p?"":" bad"}" inputmode="numeric" data-cat="${ci}" data-item="${ii}" data-f="p" value="${it.p??""}" placeholder="0" aria-label="Цена"></label>
              <div class="adm2-mor"><span class="adm2-m-lbl">«Морошка», ₽</span><input class="adm2-inp price${bad?" bad":""}" inputmode="numeric" data-cat="${ci}" data-item="${ii}" data-f="m" value="${it.m??""}" placeholder="—" aria-label="Цена по карте Морошка">
                <button type="button" class="adm2-mini-btn" data-mor="${ci}_${ii}" title="Посчитать −5% от цены">−5%</button></div>
              <button type="button" class="adm2-icon-btn danger" data-delitem="${ci}_${ii}" aria-label="Удалить услугу" title="Удалить услугу">✕</button>
            </div>`;
          });
          h+=`<div class="adm2-sec-foot"><button type="button" class="adm2-btn ghost sm" data-additem="${ci}">+ Услуга</button>
            <button type="button" class="adm2-btn ghost sm" data-morall="${ci}">Посчитать «Морошку» для пустых</button></div></div>`;
        }
        h+=`</section>`;
      });
      if(!shown)h='<div class="adm2-empty">Ничего не найдено по запросу «'+esc(svcFilter)+'».</div>';
      list.innerHTML=h;
      list.querySelectorAll("textarea").forEach(autoGrow);
      bind();
    };
    const bind=()=>{
      list.querySelectorAll("[data-f]").forEach(inp=>{
        inp.oninput=()=>{
          const ci=+inp.dataset.cat,f=inp.dataset.f;
          if(inp.dataset.item!==undefined){
            const it=svc[ci].items[+inp.dataset.item];if(!it)return;
            if(f==="n"){it.n=inp.value;autoGrow(inp);}
            else{
              const clean=inp.value.replace(/[^\d]/g,"");if(clean!==inp.value)inp.value=clean;
              if(f==="p")it.p=num(clean)||0;else it.m=clean===""?null:num(clean);
              const row=inp.closest(".adm2-item");
              row.querySelector('[data-f="p"]').classList.toggle("bad",!it.p);
              row.querySelector('[data-f="m"]').classList.toggle("bad",it.m!=null&&it.p&&it.m>it.p);
            }
          }else svc[ci][f]=inp.value;
          touch();
        };
      });
      list.querySelectorAll("[data-tcat]").forEach(b=>b.onclick=()=>{const ci=b.dataset.tcat;openCats[ci]=!openCats[ci];draw();});
      list.querySelectorAll("[data-additem]").forEach(b=>b.onclick=()=>{
        const ci=+b.dataset.additem;svc[ci].items.push({n:"",p:0,m:null});touch();draw();
        const rows=list.querySelectorAll(`[data-cat="${ci}"][data-f="n"]`);const last=rows[rows.length-1];if(last)last.focus();
      });
      list.querySelectorAll("[data-mor]").forEach(b=>b.onclick=()=>{
        const[ci,ii]=b.dataset.mor.split("_").map(Number);const it=svc[ci].items[ii];
        if(!it.p){showToast("Сначала укажите цену");return;}
        it.m=moroshkaOf(it.p);b.previousElementSibling.value=it.m;b.previousElementSibling.classList.remove("bad");touch();
      });
      list.querySelectorAll("[data-morall]").forEach(b=>b.onclick=()=>{
        const ci=+b.dataset.morall;let n=0;
        svc[ci].items.forEach(it=>{if(it.m==null&&it.p){it.m=moroshkaOf(it.p);n++;}});
        touch();draw();showToast(n?"Заполнено: "+n:"Пустых цен по «Морошке» нет");
      });
      list.querySelectorAll("[data-delitem]").forEach(b=>b.onclick=()=>{
        const[ci,ii]=b.dataset.delitem.split("_").map(Number);const it=svc[ci].items[ii];
        svc[ci].items.splice(ii,1);touch();draw();
        undoable("Услуга удалена",()=>svc[ci].items.splice(ii,0,it));
      });
      list.querySelectorAll("[data-delcat]").forEach(b=>b.onclick=()=>{
        const ci=+b.dataset.delcat,cat=svc[ci];
        if(cat.items.length&&!confirm("Удалить раздел «"+cat.name+"» вместе с "+cat.items.length+" "+plural(cat.items.length,["услугой","услугами","услугами"])+"?"))return;
        svc.splice(ci,1);openCats={};touch();draw();
        undoable("Раздел удалён",()=>svc.splice(ci,0,cat));
      });
    };
    body.querySelector("#svcSearch").oninput=e=>{svcFilter=e.target.value;draw();};
    body.querySelector("#svcToggleAll").onclick=e=>{
      const anyClosed=svc.some((c,i)=>!openCats[i]);
      svc.forEach((c,i)=>openCats[i]=anyClosed);
      e.target.textContent=anyClosed?"Свернуть все":"Развернуть все";draw();
    };
    body.querySelector("#addCat").onclick=()=>{
      const id=Math.max(0,...svc.map(c=>c.id||0))+1;
      svc.push({id,name:"",icon:"📦",rating:4.8,items:[]});openCats[svc.length-1]=true;svcFilter="";
      body.querySelector("#svcSearch").value="";touch();draw();
      const inps=list.querySelectorAll('[data-f="name"]');const last=inps[inps.length-1];if(last){last.focus();last.scrollIntoView({block:"center"});}
    };
    draw();
  }

  /* ═══ Сотрудники ═══ */
  function renderStaff(body){
    const staff=branchContent[editCity].staff;
    const depts=[...new Set(staff.map(s=>s.dept).filter(Boolean))];
    let html=head("Сотрудники — "+CITY_NAMES[editCity],`${staff.length} ${plural(staff.length,["сотрудник","сотрудника","сотрудников"])}. Сгруппированы по отделениям.`);
    html+=`<div class="adm2-toolbar">
      <input class="adm2-inp adm2-search" id="staffSearch" type="search" placeholder="Найти по ФИО, должности, отделению…" value="${esc(staffFilter)}" aria-label="Поиск сотрудника">
      <button type="button" class="adm2-btn" id="addSt">+ Сотрудник</button>
    </div><datalist id="admDepts">${depts.map(d=>`<option value="${esc(d)}">`).join("")}</datalist><div id="stList"></div>`;
    body.innerHTML=html;
    const list=body.querySelector("#stList");
    const draw=()=>{
      const f=staffFilter.trim().toLowerCase();
      const groups={};
      staff.forEach((s,i)=>{
        if(f&&![s.name,s.pos,s.dept,s.email].some(v=>String(v||"").toLowerCase().includes(f)))return;
        const d=s.dept||"Без отделения";(groups[d]=groups[d]||[]).push(i);
      });
      const keys=Object.keys(groups);
      if(!staff.length){list.innerHTML='<div class="adm2-empty">Сотрудников пока нет. Нажмите «+ Сотрудник».</div>';return;}
      if(!keys.length){list.innerHTML='<div class="adm2-empty">Никого не найдено по запросу «'+esc(staffFilter)+'».</div>';return;}
      let h="";
      keys.forEach(d=>{
        const open=f?true:!!openDepts[d];
        h+=`<section class="adm2-sec${open?" open":""}"><div class="adm2-sec-head">
          <button type="button" class="adm2-chev" data-tdept="${esc(d)}" aria-expanded="${open}">▸</button>
          <span class="adm2-sec-name" data-tdept="${esc(d)}">${esc(d)}</span><span class="adm2-count">${groups[d].length}</span></div>`;
        if(open){
          h+='<div class="adm2-people">';
          groups[d].forEach(i=>{
            const s=staff[i];
            h+=`<div class="adm2-person">
              <label class="adm2-fld"><span>ФИО</span><input class="adm2-inp" data-st="${i}" data-f="name" value="${esc(s.name==="Новый сотрудник"?"":s.name)}" placeholder="Фамилия Имя Отчество"></label>
              <label class="adm2-fld"><span>Должность</span><input class="adm2-inp" data-st="${i}" data-f="pos" value="${esc(s.pos)}" placeholder="Например, психолог"></label>
              <label class="adm2-fld"><span>Отделение</span><input class="adm2-inp" data-st="${i}" data-f="dept" value="${esc(s.dept)}" list="admDepts" placeholder="Выберите или введите"></label>
              <label class="adm2-fld sm"><span>Доб.</span><input class="adm2-inp" data-st="${i}" data-f="ext" value="${esc(s.ext)}" inputmode="numeric" placeholder="—"></label>
              <label class="adm2-fld"><span>Email</span><input class="adm2-inp" data-st="${i}" data-f="email" value="${esc(s.email)}" type="email" placeholder="name@yanao.ru"></label>
              <button type="button" class="adm2-icon-btn danger" data-delst="${i}" aria-label="Удалить сотрудника" title="Удалить">🗑</button>
            </div>`;
          });
          h+=`<div class="adm2-sec-foot"><button type="button" class="adm2-btn ghost sm" data-adddept="${esc(d==="Без отделения"?"":d)}">+ Сотрудник в это отделение</button></div></div>`;
        }
        h+='</section>';
      });
      list.innerHTML=h;
      list.querySelectorAll("[data-st]").forEach(inp=>{
        inp.oninput=()=>{staff[+inp.dataset.st][inp.dataset.f]=inp.value;touch();};
        if(inp.dataset.f==="dept")inp.onchange=()=>draw();
      });
      list.querySelectorAll("[data-tdept]").forEach(b=>b.onclick=()=>{const d=b.dataset.tdept;openDepts[d]=!openDepts[d];draw();});
      list.querySelectorAll("[data-adddept]").forEach(b=>b.onclick=()=>add(b.dataset.adddept));
      list.querySelectorAll("[data-delst]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delst,s=staff[i];staff.splice(i,1);touch();draw();
        undoable("Сотрудник удалён",()=>staff.splice(i,0,s));
      });
    };
    const add=dept=>{
      staff.push({dept:dept||"",name:"",pos:"",ext:"",email:""});
      openDepts[dept||"Без отделения"]=true;staffFilter="";body.querySelector("#staffSearch").value="";touch();draw();
      const names=list.querySelectorAll(`[data-st="${staff.length-1}"][data-f="name"]`);if(names[0]){names[0].focus();names[0].scrollIntoView({block:"center"});}
    };
    body.querySelector("#staffSearch").oninput=e=>{staffFilter=e.target.value;draw();};
    body.querySelector("#addSt").onclick=()=>add("");
    draw();
  }

  /* ═══ Новости ═══ */
  function renderNews(body){
    const TAGS=["Новость","Анонс","Мероприятие","Важно"];
    let html=head("Новости","Видны во всех филиалах. Можно прикрепить несколько фото — покажутся каруселью.");
    html+='<div class="adm2-toolbar"><button type="button" class="adm2-btn" id="addNews">+ Новость</button></div><div id="nList"></div>';
    body.innerHTML=html;
    const list=body.querySelector("#nList");
    const draw=()=>{
      if(!newsData.length){list.innerHTML='<div class="adm2-empty">Новостей пока нет.</div>';return;}
      list.innerHTML=newsData.map((n,i)=>{
        const imgs=(n.images&&n.images.length)?n.images:(n.image?[n.image]:[]);
        return `<article class="adm2-post">
          <div class="adm2-row">
            <select class="adm2-inp" data-ni="${i}" data-f="tag" aria-label="Метка">${TAGS.map(t=>`<option ${n.tag===t?"selected":""}>${t}</option>`).join("")}</select>
            <input type="date" class="adm2-inp date" data-ni="${i}" data-f="date" value="${esc(n.date)}" aria-label="Дата">
            <button type="button" class="adm2-icon-btn danger" data-delnews="${i}" aria-label="Удалить новость" title="Удалить">🗑</button>
          </div>
          <input class="adm2-inp strong" data-ni="${i}" data-f="title" value="${esc(n.title)}" placeholder="Заголовок" aria-label="Заголовок">
          <textarea class="adm2-inp" data-ni="${i}" data-f="text" rows="3" placeholder="Текст новости" aria-label="Текст">${esc(n.text)}</textarea>
          <div class="adm2-thumbs">${imgs.map((src,ii)=>`<div class="adm2-thumb"><img src="${src}" alt=""><button type="button" data-delimg="${i}_${ii}" aria-label="Удалить фото">✕</button></div>`).join("")}
            <button type="button" class="adm2-add-photo" data-addimg="${i}">＋ Фото</button></div>
        </article>`;
      }).join("");
      list.querySelectorAll("textarea").forEach(autoGrow);
      list.querySelectorAll("[data-ni]").forEach(inp=>{
        const h=()=>{newsData[+inp.dataset.ni][inp.dataset.f]=inp.value;if(inp.tagName==="TEXTAREA")autoGrow(inp);touch();};
        inp.oninput=h;inp.onchange=h;
      });
      list.querySelectorAll("[data-delnews]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delnews,n=newsData[i];newsData.splice(i,1);touch();draw();
        undoable("Новость удалена",()=>newsData.splice(i,0,n));
      });
      list.querySelectorAll("[data-addimg]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.addimg;
        pickAndResizeImage(url=>{
          const n=newsData[i];if(!n.images)n.images=n.image?[n.image]:[];delete n.image;
          n.images.push(url);touch();flushSave();draw();
        },480);
      });
      list.querySelectorAll("[data-delimg]").forEach(b=>b.onclick=()=>{
        const[i,ii]=b.dataset.delimg.split("_").map(Number),n=newsData[i];
        let removed;if(n.images)removed=n.images.splice(ii,1)[0];else{removed=n.image;delete n.image;}
        touch();draw();
        undoable("Фото удалено",()=>{if(!n.images)n.images=[];n.images.splice(ii,0,removed);});
      });
    };
    body.querySelector("#addNews").onclick=()=>{
      newsData.unshift({date:taxiIsoSafe(),tag:"Новость",title:"",text:""});touch();draw();
      const t=list.querySelector('[data-f="title"]');if(t)t.focus();
    };
    draw();
  }
  function taxiIsoSafe(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}

  /* ═══ Мероприятия ═══ */
  function renderEvents(body){
    let html=head("Мероприятия","Афиша с записью — видна во всех филиалах.");
    html+='<div class="adm2-toolbar"><button type="button" class="adm2-btn" id="addEvt">+ Мероприятие</button></div><div id="eList"></div>';
    body.innerHTML=html;
    const list=body.querySelector("#eList");
    const split=e=>{const p=String(e.date||"").split(" ");return{d:p[0]||"",t:p[1]||""};};
    const draw=()=>{
      if(!eventsData.length){list.innerHTML='<div class="adm2-empty">Мероприятий пока нет.</div>';return;}
      list.innerHTML=eventsData.map((e,i)=>{const dt=split(e);return `<article class="adm2-post">
        <div class="adm2-row">
          <input type="date" class="adm2-inp date" data-ei="${i}" data-f="d" value="${esc(dt.d)}" aria-label="Дата">
          <input type="time" class="adm2-inp time" data-ei="${i}" data-f="t" value="${esc(dt.t)}" aria-label="Время">
          <label class="adm2-inline">Мест <input class="adm2-inp price" inputmode="numeric" data-ei="${i}" data-f="seats" value="${e.seats||""}" aria-label="Количество мест"></label>
          <button type="button" class="adm2-icon-btn danger" data-delevt="${i}" aria-label="Удалить мероприятие" title="Удалить">🗑</button>
        </div>
        <input class="adm2-inp strong" data-ei="${i}" data-f="title" value="${esc(e.title)}" placeholder="Название мероприятия">
        <input class="adm2-inp" data-ei="${i}" data-f="place" value="${esc(e.place)}" placeholder="Место проведения">
        <textarea class="adm2-inp" data-ei="${i}" data-f="desc" rows="2" placeholder="Описание">${esc(e.desc)}</textarea>
        <div class="adm2-thumbs">${e.image?`<div class="adm2-thumb"><img src="${e.image}" alt=""><button type="button" data-delimg="${i}" aria-label="Удалить фото">✕</button></div>`:""}
          <button type="button" class="adm2-add-photo" data-addimg="${i}">${e.image?"Заменить фото":"＋ Фото"}</button></div>
      </article>`;}).join("");
      list.querySelectorAll("textarea").forEach(autoGrow);
      list.querySelectorAll("[data-ei]").forEach(inp=>{
        const h=()=>{
          const e=eventsData[+inp.dataset.ei],f=inp.dataset.f;
          if(f==="d"||f==="t"){const dt=split(e);if(f==="d")dt.d=inp.value;else dt.t=inp.value;e.date=dt.d+(dt.t?" "+dt.t:"");}
          else if(f==="seats"){const c=inp.value.replace(/\D/g,"");inp.value=c;e.seats=num(c)||0;}
          else e[f]=inp.value;
          if(inp.tagName==="TEXTAREA")autoGrow(inp);
          touch();
        };
        inp.oninput=h;inp.onchange=h;
      });
      list.querySelectorAll("[data-delevt]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delevt,e=eventsData[i];eventsData.splice(i,1);touch();draw();
        undoable("Мероприятие удалено",()=>eventsData.splice(i,0,e));
      });
      list.querySelectorAll("[data-addimg]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.addimg;pickAndResizeImage(url=>{eventsData[i].image=url;touch();flushSave();draw();});
      });
      list.querySelectorAll("[data-delimg]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delimg,img=eventsData[i].image;delete eventsData[i].image;touch();draw();
        undoable("Фото удалено",()=>{eventsData[i].image=img;});
      });
    };
    body.querySelector("#addEvt").onclick=()=>{
      const id="ev"+Date.now().toString(36);
      eventsData.unshift({id,date:taxiIsoSafe(),title:"",place:"",desc:"",seats:0});touch();draw();
      const t=list.querySelector('[data-f="title"]');if(t)t.focus();
    };
    draw();
  }

  /* ═══ Галерея ═══ */
  function renderGallery(body){
    let html=head("Фотогалерея","Видна во всех филиалах. Фото автоматически уменьшаются перед сохранением.");
    html+='<div class="adm2-toolbar"><button type="button" class="adm2-btn" id="addPhoto">📷 Добавить фото</button></div><div id="gList"></div>';
    body.innerHTML=html;
    const list=body.querySelector("#gList");
    const draw=()=>{
      if(!galleryData.length){list.innerHTML='<div class="adm2-empty">Фотографий пока нет.</div>';return;}
      list.innerHTML='<div class="adm2-gallery">'+galleryData.map((g,i)=>`<figure class="adm2-photo">
        <img src="${g.url}" alt="${esc(g.caption)}">
        <input class="adm2-inp" data-gi="${i}" value="${esc(g.caption)}" placeholder="Подпись" aria-label="Подпись к фото">
        <button type="button" class="adm2-icon-btn danger" data-delphoto="${i}" aria-label="Удалить фото" title="Удалить">🗑</button>
      </figure>`).join("")+'</div>';
      list.querySelectorAll("[data-gi]").forEach(inp=>inp.oninput=()=>{galleryData[+inp.dataset.gi].caption=inp.value;touch();});
      list.querySelectorAll("[data-delphoto]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delphoto,g=galleryData[i];galleryData.splice(i,1);touch();draw();
        undoable("Фото удалено",()=>galleryData.splice(i,0,g));
      });
    };
    body.querySelector("#addPhoto").onclick=()=>pickAndResizeImage(url=>{
      galleryData.push({id:"ph"+Date.now(),url:url,caption:""});touch();flushSave();draw();showToast("Фото добавлено");
    },900);
    draw();
  }

  /* ═══ Шаблоны писем ═══ */
  const TPL_DEFAULTS={
    order:{subject:"Заявка: {name} ({city})",intro:"ЗАЯВКА НА СОЦИАЛЬНЫЕ УСЛУГИ"},
    booking:{subject:"Запись: {name} на {date} {time} — {ticket}",intro:"ЗАПИСЬ К СПЕЦИАЛИСТУ"},
    cancelBooking:{subject:"Отмена записи {ticket}",intro:"ОТМЕНА ЗАПИСИ"},
    feedback:{subject:"Отзыв от {name}",intro:"ОТЗЫВ О РАБОТЕ ЦЕНТРА"},
    callback:{subject:"Обратный звонок: {name}",intro:"ЗАЯВКА НА ОБРАТНЫЙ ЗВОНОК"},
    event:{subject:"Запись на мероприятие: {title}",intro:"ЗАПИСЬ НА МЕРОПРИЯТИЕ"}
  };
  function renderTemplates(body){
    const T=[["order","Заявка на услуги (из корзины)",["name","city"]],["booking","Запись к специалисту",["name","date","time","ticket"]],
      ["cancelBooking","Отмена записи",["ticket"]],["feedback","Отзыв о работе центра",["name"]],["callback","Обратный звонок",["name"]],["event","Запись на мероприятие",["title"]]];
    const sample={name:"Иванова Мария Петровна",city:"Губкинский",date:"2026-10-02",time:"10:00",ticket:"482913",title:"Осенний концерт"};
    const fill=s=>String(s||"").replace(/\{(\w+)\}/g,(m,k)=>sample[k]!=null?sample[k]:m);
    let html=head("Шаблоны писем","Тема и заголовок письма, которое уходит на почту филиала. Нажмите на метку в фигурных скобках, чтобы вставить её.");
    T.forEach(([key,label,ph])=>{
      const t=emailTemplates[key]||{subject:"",intro:""};
      html+=`<section class="adm2-sec open"><div class="adm2-sec-head"><span class="adm2-sec-name">${label}</span>
        <button type="button" class="adm2-link" data-reset="${key}">По умолчанию</button></div>
        <div class="adm2-form pad">
          <label class="adm2-fld wide"><span>Тема письма</span><input class="adm2-inp" data-tpl="${key}" data-f="subject" value="${esc(t.subject)}"></label>
          <div class="adm2-chips">${ph.map(p=>`<button type="button" class="adm2-chip" data-ins="${key}" data-ph="{${p}}">{${p}}</button>`).join("")}</div>
          <label class="adm2-fld wide"><span>Заголовок в тексте письма</span><input class="adm2-inp" data-tpl="${key}" data-f="intro" value="${esc(t.intro)}"></label>
          <div class="adm2-preview" data-prev="${key}">Пример темы: <b>${esc(fill(t.subject))}</b></div>
        </div></section>`;
    });
    body.innerHTML=html;
    body.querySelectorAll("[data-tpl]").forEach(inp=>inp.oninput=()=>{
      const k=inp.dataset.tpl;if(!emailTemplates[k])emailTemplates[k]={subject:"",intro:""};
      emailTemplates[k][inp.dataset.f]=inp.value;
      body.querySelector(`[data-prev="${k}"] b`).textContent=fill(emailTemplates[k].subject);
      touch();
    });
    body.querySelectorAll("[data-ins]").forEach(b=>b.onclick=()=>{
      const inp=body.querySelector(`[data-tpl="${b.dataset.ins}"][data-f="subject"]`);
      const pos=inp.selectionStart!=null?inp.selectionStart:inp.value.length;
      inp.value=inp.value.slice(0,pos)+b.dataset.ph+inp.value.slice(pos);inp.focus();inp.oninput();
    });
    body.querySelectorAll("[data-reset]").forEach(b=>b.onclick=()=>{
      const k=b.dataset.reset;emailTemplates[k]=Object.assign({},TPL_DEFAULTS[k]);touch();renderTemplates(body);showToast("Шаблон восстановлен");
    });
  }

  /* ═══ Статистика ═══ */
  function renderStats(body){
    const J=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||d);}catch(e){return JSON.parse(d);}};
    const stats=J("ym_local","{}"),cartS=J("cartStats","{}"),ratings=J("ratings","[]"),orders=J("ordersHistory","[]"),bookings=J("bookingsHistory","[]"),taxi=J("taxiHistory","[]");
    let html=head("Статистика","Только по этому устройству. Полная статистика по всем пользователям — в Яндекс Метрике.");
    let avg="—";if(ratings.length){avg=(ratings.reduce((s,r)=>s+(r.stars||0),0)/ratings.length).toFixed(1)+" ★";}
    html+=`<div class="adm2-kpis"><div><b>${orders.length}</b><span>заявок</span></div><div><b>${bookings.length}</b><span>записей</span></div><div><b>${taxi.length}</b><span>заказов такси</span></div><div><b>${avg}</b><span>оценка (${ratings.length})</span></div></div>`;
    const top=Object.entries(cartS).sort((a,b)=>b[1]-a[1]).slice(0,8);
    if(top.length){
      html+='<div class="adm2-sub">Популярные услуги</div><div class="adm2-bars">';
      top.forEach(([n,v])=>{html+=`<div class="adm2-bar"><span class="adm2-bar-l">${esc(n)}</span><span class="adm2-bar-t"><i style="width:${Math.round(v/top[0][1]*100)}%"></i></span><b>${v}</b></div>`;});
      html+='</div>';
    }
    const days=Object.keys(stats).sort().reverse().slice(0,7);
    if(days.length){
      html+='<div class="adm2-sub">Активность по дням</div><div class="adm2-table-wrap"><table class="adm2-table"><thead><tr><th>Дата</th><th>Входы</th><th>Каталог</th><th>Запись</th><th>Заявки</th><th>Чат-бот</th></tr></thead><tbody>';
      days.forEach(d=>{const s=stats[d]||{};html+=`<tr><td>${d.split("-").reverse().join(".")}</td><td>${s.login||0}</td><td>${s.view_services||0}</td><td>${s.view_booking||0}</td><td>${s.order_sent||0}</td><td>${s.open_assistant||0}</td></tr>`;});
      html+='</tbody></table></div>';
    }
    if(ratings.length){
      html+='<div class="adm2-sub">Последние отзывы</div><div class="adm2-reviews">';
      ratings.slice(-6).reverse().forEach(r=>{html+=`<div class="adm2-review"><span class="adm2-stars">${"★".repeat(r.stars||0)}${"☆".repeat(5-(r.stars||0))}</span><p>${esc(r.comment)||'<i>без комментария</i>'}</p><small>${r.date?new Date(r.date).toLocaleDateString("ru-RU"):""}</small></div>`;});
      html+='</div>';
    }
    if(!top.length&&!days.length&&!ratings.length)html+='<div class="adm2-empty">На этом устройстве пока нет данных.</div>';
    html+='<a href="https://metrika.yandex.ru/dashboard?id=110025020" target="_blank" rel="noopener" class="adm2-btn ghost wide">📊 Открыть Яндекс Метрику</a>';
    body.innerHTML=html;
  }

  /* ═══ Публикация ═══ */
  function renderPublish(body){
    flushSave();
    const unpub=isUnpublished(),local=!!localStorage.getItem("adminOverrides");
    let html=head("Публикация","Как сделать, чтобы изменения увидели все пользователи.");
    html+=`<div class="adm2-banner ${unpub?"warn":"ok"}"><span class="adm2-banner-ico">${unpub?"⚠️":"✅"}</span><div>
      <b>${unpub?"Изменения сохранены только в этом браузере":(published.loaded?"Всё опубликовано":"Изменений нет")}</b>
      <span>${!unpub&&!published.loaded?"Пользователи видят исходные данные приложения. Когда что-то поменяете — опубликуйте по шагам ниже.":published.loaded?("На сайте опубликована версия"+(published.at?" от "+new Date(published.at).toLocaleString("ru-RU"):"")+"."):(location.protocol==="file:"?"Приложение открыто как файл с компьютера — опубликованную версию проверить нельзя. Откройте сайт по адресу GitHub Pages.":"На сайте ещё нет файла с опубликованными данными.")}</span></div></div>`;
    html+=`<ol class="adm2-steps">
      <li><b>Скачайте файл с данными.</b> Он называется <code>overrides.json</code>.
        <button type="button" class="adm2-btn" id="admExport">⬇️ Скачать overrides.json</button></li>
      <li><b>Загрузите его на сайт</b> в папку <code>data</code> репозитория: GitHub → папка <code>data</code> → «Add file» → «Upload files» → «Commit changes». Если файл там уже есть — он заменится.</li>
      <li><b>Подождите 1–2 минуты</b> — GitHub Pages обновит сайт, и все пользователи увидят изменения при следующем открытии.</li>
    </ol>`;
    html+=`<div class="adm2-sub">Другие действия</div><div class="adm2-actions">
      <button type="button" class="adm2-btn ghost" id="admImport">⬆️ Загрузить данные из файла</button>
      ${published.loaded&&local?'<button type="button" class="adm2-btn ghost" id="admTakePub">↩︎ Взять опубликованную версию</button>':''}
      <button type="button" class="adm2-btn danger" id="admReset">Сбросить правки на этом устройстве</button>
    </div><p class="adm2-note">«Сбросить» удаляет только правки в этом браузере — опубликованные данные на сайте остаются.</p>`;
    body.innerHTML=html;
    body.querySelector("#admExport").onclick=exportJSON;
    body.querySelector("#admImport").onclick=()=>document.getElementById("admFile").click();
    const tp=body.querySelector("#admTakePub");
    if(tp)tp.onclick=()=>{if(confirm("Заменить правки этого устройства опубликованной версией?")){localStorage.removeItem("adminOverrides");location.reload();}};
    body.querySelector("#admReset").onclick=()=>{
      if(confirm("Удалить все правки, сделанные в этом браузере? Действие нельзя отменить — сначала можно скачать файл.")){localStorage.removeItem("adminOverrides");location.reload();}
    };
  }

  function exportJSON(){
    flushSave();
    const ov=snapshot();ov.publishedAt=new Date().toISOString();
    const blob=new Blob([JSON.stringify(ov)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download="overrides.json";document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    showToast("Файл overrides.json скачан — загрузите его в папку data на сайте");
  }
  function importJSON(file){
    if(!file)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const ov=JSON.parse(r.result);
        if(!ov||typeof ov!=="object"||(!ov.branchContent&&!ov.cityData))throw new Error("format");
        delete ov.publishedAt;
        localStorage.setItem("adminOverrides",JSON.stringify(ov));
        applyOv(ov);refreshActive();
        showToast("Данные загружены из файла");
        renderShell(document.getElementById("adminFs"));
      }catch(e){showToast("Это не файл данных «Гармонии» или он повреждён");}
    };
    r.readAsText(file);
  }

  applyOverrides();
  loadPublished();
})();
