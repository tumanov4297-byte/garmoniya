
(function(){
  "use strict";

  const ADMIN={email:"iatumanov@yanao.ru",pass:"300897"};
  const CITY_NAMES={gubkin:"Губкинский",muravlenko:"Муравленко",noyabrsk:"Ноябрьск",tarko:"Тарко-Сале",urengoy:"Уренгой"};
  const CONTACT_FIELDS=[["address","Адрес"],["phone","Телефон (для показа)"],["phoneRaw","Телефон (цифры, для звонка)"],["email","Email"],["orderEmail","Email для приёма заявок (куда улетают заявки)"],["hours","Часы работы"]];

  let editCity="gubkin", editTab="overview";
  let svcFilter="", staffFilter="";
  let openCats={}, openDepts={};

  function applyOverrides(){
    let ov;try{ov=JSON.parse(localStorage.getItem("adminOverrides")||"null");}catch(e){ov=null;}
    if(!ov)return;
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

  function saveOverrides(){
    const ov={cityData:{},branchContent:{}};
    for(const c in cityData){
      ov.cityData[c]={};
      CONTACT_FIELDS.forEach(([f])=>{ov.cityData[c][f]=cityData[c][f];});
    }
    for(const c in branchContent){
      ov.branchContent[c]={services:branchContent[c].services,staff:branchContent[c].staff};
    }
    if(typeof newsData!=="undefined")ov.newsData=newsData;
    if(typeof eventsData!=="undefined")ov.eventsData=eventsData;
    if(typeof emailTemplates!=="undefined")ov.emailTemplates=emailTemplates;
    if(typeof galleryData!=="undefined")ov.galleryData=galleryData;
    localStorage.setItem("adminOverrides",JSON.stringify(ov));
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

  function renderLogin(ovl){
    ovl.innerHTML=`<div class="admin-card">
      <h3>🔐 Вход для администратора</h3>
      <div class="admin-warn">Внимание: Вход только Администратору!</div>
      <label class="admin-lbl">Email</label>
      <input class="admin-inp" id="admEmail" type="email" placeholder="email@yanao.ru" autocomplete="username">
      <label class="admin-lbl">Пароль</label>
      <input class="admin-inp" id="admPass" type="password" placeholder="••••••" autocomplete="current-password">
      <button class="admin-btn" id="admGo">Войти</button>
      <button class="admin-btn ghost" id="admCancel">Отмена</button>
    </div>`;
    const em=ovl.querySelector("#admEmail"),pw=ovl.querySelector("#admPass");
    const go=()=>{
      if(em.value.trim().toLowerCase()===ADMIN.email&&pw.value===ADMIN.pass){
        sessionStorage.setItem("adminAuthed","1");
        ovl.remove();
        openFullPanel();
      }else{showToast("❌ Неверный email или пароль");}
    };
    ovl.querySelector("#admGo").onclick=go;
    pw.addEventListener("keydown",e=>{if(e.key==="Enter")go();});
    ovl.querySelector("#admCancel").onclick=()=>ovl.remove();
    em.focus();
  }

  function openFullPanel(){
    document.querySelectorAll(".admin-fs").forEach(e=>e.remove());
    const fs=document.createElement("div");fs.className="admin-fs";fs.id="adminFs";
    fs.setAttribute("role","dialog");fs.setAttribute("aria-modal","true");fs.setAttribute("aria-label","Панель администратора");
    document.body.appendChild(fs);
    renderShell(fs);
  }
  function closeFullPanel(){
    const fs=document.getElementById("adminFs");
    if(fs)fs.remove();
  }

  const TABS=[
    ["overview","🏠","Обзор"],
    ["contacts","📍","Контакты"],
    ["services","📋","Услуги"],
    ["staff","👥","Сотрудники"],
    ["news","📰","Новости"],
    ["gallery","🖼️","Галерея"],
    ["templates","✉️","Шаблоны"],
    ["stats","📊","Статистика"]
  ];

  function renderShell(fs){
    fs.innerHTML=`
      <div class="adm-hdr">
        <div class="adm-hdr-title"><span class="adm-hdr-ico">⚙️</span><div><b>Админпанель</b><span>ГБУ ЯНАО «ЦСОН «Гармония»</span></div></div>
        <button class="adm-hdr-x" id="admFsClose" aria-label="Закрыть панель">✕</button>
      </div>
      <div class="adm-toolbar">
        <label class="adm-toolbar-lbl">Филиал</label>
        <select class="adm-city-sel" id="admCity">${Object.keys(CITY_NAMES).map(c=>`<option value="${c}" ${c===editCity?"selected":""}>${CITY_NAMES[c]}</option>`).join("")}</select>
        <button class="adm-logout-sm" id="admLogout">🚪 Выйти</button>
      </div>
      <div class="adm-tabs" id="admTabs" role="tablist">
        ${TABS.map(([k,ico,l])=>`<button class="adm-tab${k===editTab?" active":""}" data-tab="${k}" role="tab" aria-selected="${k===editTab}"><span class="adm-tab-ico">${ico}</span>${l}</button>`).join("")}
      </div>
      <div class="adm-body" id="admBody"></div>
      <div class="adm-footer">
        <button class="adm-foot-btn" id="admExport">⬇️ Экспорт JSON</button>
        <button class="adm-foot-btn" id="admImport">⬆️ Импорт JSON</button>
        <button class="adm-foot-btn danger" id="admReset">↺ Сброс всех правок</button>
      </div>
      <input type="file" id="admFile" accept="application/json" style="display:none">
    `;
    fs.querySelector("#admFsClose").onclick=closeFullPanel;
    fs.querySelector("#admCity").onchange=e=>{editCity=e.target.value;svcFilter="";staffFilter="";openCats={};openDepts={};renderBody();};
    fs.querySelectorAll(".adm-tab").forEach(t=>t.onclick=()=>{
      editTab=t.dataset.tab;
      fs.querySelectorAll(".adm-tab").forEach(x=>{x.classList.remove("active");x.setAttribute("aria-selected","false");});
      t.classList.add("active");t.setAttribute("aria-selected","true");
      renderBody();
    });
    fs.querySelector("#admExport").onclick=exportJSON;
    fs.querySelector("#admImport").onclick=()=>fs.querySelector("#admFile").click();
    fs.querySelector("#admFile").onchange=e=>importJSON(e.target.files[0]);
    fs.querySelector("#admReset").onclick=()=>{
      if(confirm("Сбросить ВСЕ правки и вернуть исходные данные? Это действие необратимо."))
        {localStorage.removeItem("adminOverrides");location.reload();}
    };
    fs.querySelector("#admLogout").onclick=()=>{sessionStorage.removeItem("adminAuthed");closeFullPanel();};
    renderBody();
  }

  function renderBody(){
    const body=document.getElementById("admBody");
    if(!body)return;
    body.scrollTop=0;
    if(editTab==="overview")renderOverview(body);
    else if(editTab==="contacts")renderContacts(body);
    else if(editTab==="services")renderServices(body);
    else if(editTab==="news")renderNews(body);
    else if(editTab==="gallery")renderGallery(body);
    else if(editTab==="templates")renderTemplates(body);
    else if(editTab==="stats")renderStats(body);
    else renderStaff(body);
  }

  function jumpTo(city,tab){
    editCity=city;editTab=tab;
    document.querySelectorAll(".adm-tab").forEach(t=>{
      const on=t.dataset.tab===tab;
      t.classList.toggle("active",on);t.setAttribute("aria-selected",String(on));
    });
    const sel=document.getElementById("admCity");if(sel)sel.value=city;
    renderBody();
  }

  function renderOverview(body){
    let html='<div class="adm-hint">Сводка по всем филиалам. Нажмите на карточку, чтобы перейти к редактированию.</div>';
    html+='<div class="ov-grid">';
    Object.keys(CITY_NAMES).forEach(c=>{
      const b=branchContent[c];
      const catCount=b.services.length;
      const svcCount=b.services.reduce((s,cat)=>s+cat.items.length,0);
      const stCount=b.staff.length;
      const filled=catCount>0||stCount>0;
      html+=`<div class="ov-card${filled?"":" empty"}" data-jump-city="${c}">
        <div class="ov-card-top"><b>${CITY_NAMES[c]}</b><span class="ov-badge ${filled?"on":"off"}">${filled?"Заполнен":"Пусто"}</span></div>
        <div class="ov-stats-row">
          <div class="ov-stat"><span class="ov-stat-v">${catCount}</span><span class="ov-stat-l">категорий</span></div>
          <div class="ov-stat"><span class="ov-stat-v">${svcCount}</span><span class="ov-stat-l">услуг</span></div>
          <div class="ov-stat"><span class="ov-stat-v">${stCount}</span><span class="ov-stat-l">сотрудников</span></div>
        </div>
      </div>`;
    });
    html+='</div>';

    html+='<div class="adm-hint" style="margin-top:18px">Новости и мероприятия (общие для всех филиалов)</div>';
    html+=`<div class="ov-stats-row" style="background:#fff;border-radius:14px;padding:12px;border:1px solid rgba(0,0,0,.05)">
      <div class="ov-stat"><span class="ov-stat-v">${(typeof newsData!=="undefined"?newsData.length:0)}</span><span class="ov-stat-l">новостей</span></div>
      <div class="ov-stat"><span class="ov-stat-v">${(typeof eventsData!=="undefined"?eventsData.length:0)}</span><span class="ov-stat-l">мероприятий</span></div>
    </div>`;

    body.innerHTML=html;
    body.querySelectorAll("[data-jump-city]").forEach(card=>{
      card.onclick=()=>jumpTo(card.dataset.jumpCity,"services");
    });
  }

  function renderContacts(body){
    const cd=cityData[editCity];
    let html=`<div class="adm-section-title">Контакты филиала «${CITY_NAMES[editCity]}»</div>`;
    html+=CONTACT_FIELDS.map(([f,l])=>
      `<label class="admin-lbl">${l}</label><input class="admin-inp" data-cf="${f}" value="${esc(cd[f])}">`
    ).join("");
    html+=`<button class="admin-btn" id="saveContacts">💾 Сохранить контакты</button>`;
    body.innerHTML=html;
    body.querySelector("#saveContacts").onclick=()=>{
      body.querySelectorAll("[data-cf]").forEach(inp=>{
        let v=inp.value;
        if(inp.dataset.cf==="openH"||inp.dataset.cf==="openM")v=parseInt(v)||0;
        cityData[editCity][inp.dataset.cf]=v;
      });
      saveOverrides();showToast("💾 Контакты сохранены");
    };
  }

  function renderServices(body){
    const svc=branchContent[editCity].services;
    let html=`<div class="adm-section-title">Услуги филиала «${CITY_NAMES[editCity]}»</div>`;
    html+=`<div class="adm-search-wrap"><input class="adm-search-inp" id="svcSearch" placeholder="Поиск услуги по названию..." value="${esc(svcFilter)}"></div>`;
    html+='<div class="adm-hint">Цена p — обычная, m — по «Морошке» (пусто = без скидки).</div>';

    if(!svc.length){
      html+='<div class="adm-empty-state">В этом филиале пока нет услуг. Добавьте первую категорию ниже.</div>';
    }

    const filterLower=svcFilter.trim().toLowerCase();

    svc.forEach((cat,ci)=>{
      const matchingItems=filterLower?cat.items.map((it,ii)=>({it,ii})).filter(({it})=>it.n.toLowerCase().includes(filterLower)):cat.items.map((it,ii)=>({it,ii}));
      if(filterLower&&!matchingItems.length&&!cat.name.toLowerCase().includes(filterLower))return;
      const isOpen=filterLower?true:!!openCats[ci];
      html+=`<div class="adm-cat-card">
        <div class="adm-cat-head" data-toggle-cat="${ci}">
          <span class="adm-cat-chevron">${isOpen?"▾":"▸"}</span>
          <input class="admin-inp tiny-ico" data-cat="${ci}" data-f="icon" value="${esc(cat.icon)}" onclick="event.stopPropagation()">
          <input class="admin-inp grow" data-cat="${ci}" data-f="name" value="${esc(cat.name)}" placeholder="Название категории" onclick="event.stopPropagation()">
          <span class="adm-cat-count">${cat.items.length}</span>
          <button class="adm-del" data-delcat="${ci}" aria-label="Удалить категорию" onclick="event.stopPropagation()">🗑</button>
        </div>
        <div class="adm-cat-items" style="${isOpen?"":"display:none"}" data-cat-items="${ci}">`;
      matchingItems.forEach(({it,ii})=>{
        html+=`<div class="adm-item-row">
          <input class="admin-inp grow" data-cat="${ci}" data-item="${ii}" data-f="n" value="${esc(it.n)}" placeholder="Услуга">
          <input class="admin-inp price" type="number" data-cat="${ci}" data-item="${ii}" data-f="p" value="${it.p??""}" placeholder="₽">
          <input class="admin-inp price" type="number" data-cat="${ci}" data-item="${ii}" data-f="m" value="${it.m??""}" placeholder="🍊">
          <button class="adm-del" data-delitem="${ci}_${ii}" aria-label="Удалить услугу">✕</button>
        </div>`;
      });
      html+=`<button class="admin-btn small ghost" data-additem="${ci}">+ добавить услугу</button></div></div>`;
    });

    html+=`<button class="admin-btn small" id="addCat">+ добавить категорию</button><button class="admin-btn" id="saveSvc">💾 Сохранить услуги</button>`;
    body.innerHTML=html;

    const collect=()=>{
      body.querySelectorAll("[data-f]").forEach(inp=>{
        if(inp.dataset.cat===undefined)return;
        const ci=+inp.dataset.cat,f=inp.dataset.f;
        if(inp.dataset.item!==undefined){
          const ii=+inp.dataset.item,it=svc[ci].items[ii];if(!it)return;
          if(f==="n")it.n=inp.value;
          else if(f==="p")it.p=parseInt(inp.value)||0;
          else if(f==="m")it.m=inp.value===""?null:(parseInt(inp.value)||0);
        }else{svc[ci][f]=inp.value;}
      });
    };

    body.querySelector("#svcSearch").oninput=e=>{svcFilter=e.target.value;renderServices(body);};
    body.querySelectorAll("[data-toggle-cat]").forEach(h=>h.onclick=()=>{
      const ci=h.dataset.toggleCat;
      openCats[ci]=!openCats[ci];
      renderServices(body);
    });
    body.querySelector("#saveSvc").onclick=()=>{collect();saveOverrides();showToast("💾 Услуги сохранены");refreshActive();};
    body.querySelector("#addCat").onclick=()=>{collect();const id=Math.max(0,...svc.map(c=>c.id||0))+1;svc.push({id,name:"Новая категория",icon:"📦",rating:4.8,items:[]});openCats[svc.length-1]=true;saveOverrides();renderServices(body);};
    body.querySelectorAll("[data-additem]").forEach(b=>b.onclick=()=>{collect();svc[+b.dataset.additem].items.push({n:"Новая услуга",p:100,m:null});saveOverrides();renderServices(body);});
    body.querySelectorAll("[data-delcat]").forEach(b=>b.onclick=()=>{if(confirm("Удалить категорию целиком?")){collect();svc.splice(+b.dataset.delcat,1);saveOverrides();renderServices(body);}});
    body.querySelectorAll("[data-delitem]").forEach(b=>b.onclick=()=>{collect();const[ci,ii]=b.dataset.delitem.split("_").map(Number);svc[ci].items.splice(ii,1);saveOverrides();renderServices(body);});
  }

  function renderStaff(body){
    const staff=branchContent[editCity].staff;
    let html=`<div class="adm-section-title">Сотрудники филиала «${CITY_NAMES[editCity]}»</div>`;
    html+=`<div class="adm-search-wrap"><input class="adm-search-inp" id="staffSearch" placeholder="Поиск по ФИО или должности..." value="${esc(staffFilter)}"></div>`;

    if(!staff.length){
      html+='<div class="adm-empty-state">Сотрудников пока нет. Добавьте первого ниже.</div>';
    }

    const filterLower=staffFilter.trim().toLowerCase();
    const depts={};
    staff.forEach((s,i)=>{
      if(filterLower&&!(s.name.toLowerCase().includes(filterLower)||s.pos.toLowerCase().includes(filterLower)||s.dept.toLowerCase().includes(filterLower)))return;
      const d=s.dept||"Без отделения";
      (depts[d]=depts[d]||[]).push({s,i});
    });

    Object.keys(depts).forEach(dept=>{
      const isOpen=filterLower?true:!!openDepts[dept];
      html+=`<div class="adm-cat-card">
        <div class="adm-cat-head" data-toggle-dept="${esc(dept)}">
          <span class="adm-cat-chevron">${isOpen?"▾":"▸"}</span>
          <span class="adm-dept-name">${dept}</span>
          <span class="adm-cat-count">${depts[dept].length}</span>
        </div>
        <div class="adm-cat-items" style="${isOpen?"":"display:none"}">`;
      depts[dept].forEach(({s,i})=>{
        html+=`<div class="adm-staff-card">
          <div class="adm-staff-row2">
            <input class="admin-inp grow" data-st="${i}" data-f="name" value="${esc(s.name)}" placeholder="ФИО">
            <button class="adm-del" data-delst="${i}" aria-label="Удалить">🗑</button>
          </div>
          <div class="adm-staff-row2">
            <input class="admin-inp grow" data-st="${i}" data-f="pos" value="${esc(s.pos)}" placeholder="Должность">
          </div>
          <div class="adm-staff-row2">
            <input class="admin-inp" data-st="${i}" data-f="dept" value="${esc(s.dept)}" placeholder="Отделение">
            <input class="admin-inp price" data-st="${i}" data-f="ext" value="${esc(s.ext)}" placeholder="Доб.">
          </div>
          <input class="admin-inp" data-st="${i}" data-f="email" value="${esc(s.email)}" placeholder="Email">
        </div>`;
      });
      html+=`<button class="admin-btn small ghost" data-adddeptst="${esc(dept)}">+ добавить в «${dept}»</button></div></div>`;
    });

    html+=`<button class="admin-btn small" id="addSt">+ добавить сотрудника (новое отделение)</button><button class="admin-btn" id="saveSt">💾 Сохранить сотрудников</button>`;
    body.innerHTML=html;

    const collect=()=>{
      body.querySelectorAll("[data-st]").forEach(inp=>{
        const i=+inp.dataset.st,f=inp.dataset.f;
        if(staff[i])staff[i][f]=inp.value;
      });
    };
    body.querySelector("#staffSearch").oninput=e=>{staffFilter=e.target.value;renderStaff(body);};
    body.querySelectorAll("[data-toggle-dept]").forEach(h=>h.onclick=()=>{
      const d=h.dataset.toggleDept;
      openDepts[d]=!openDepts[d];
      renderStaff(body);
    });
    body.querySelector("#saveSt").onclick=()=>{collect();saveOverrides();showToast("💾 Сотрудники сохранены");refreshActive();};
    body.querySelector("#addSt").onclick=()=>{collect();staff.push({dept:"",name:"Новый сотрудник",pos:"",ext:"",email:""});saveOverrides();renderStaff(body);};
    body.querySelectorAll("[data-adddeptst]").forEach(b=>b.onclick=()=>{
      const dept=b.dataset.adddeptst;
      collect();
      staff.push({dept:dept,name:"Новый сотрудник",pos:"",ext:"",email:""});
      openDepts[dept]=true;
      saveOverrides();
      showToast("👤 Сотрудник добавлен в «"+dept+"»");
      renderStaff(body);
    });
    body.querySelectorAll("[data-delst]").forEach(b=>b.onclick=()=>{collect();staff.splice(+b.dataset.delst,1);saveOverrides();renderStaff(body);});
  }

  function renderNews(body){
    const TAGS=["Новость","Анонс","Мероприятие","Важно"];
    let html='<div class="adm-section-title">Новости и мероприятия</div>';
    html+='<div class="adm-hint">Новости видят все пользователи бота, независимо от филиала.</div>';

    html+='<div class="adm-subsection-title">📰 Новости</div>';
    newsData.forEach((n,i)=>{
      html+=`<div class="adm-news-card">
        <div class="adm-news-row">
          <select class="admin-inp" data-ni="${i}" data-f="tag" style="flex:1">${TAGS.map(t=>`<option ${n.tag===t?"selected":""}>${t}</option>`).join("")}</select>
          <input type="date" class="admin-inp adm-date-inp" data-ni="${i}" data-f="date" value="${esc(n.date)}">
          <button class="adm-del" data-delnews="${i}" aria-label="Удалить">🗑</button>
        </div>
        <input class="admin-inp" data-ni="${i}" data-f="title" value="${esc(n.title)}" placeholder="Заголовок новости">
        <textarea class="admin-inp" data-ni="${i}" data-f="text" rows="2" placeholder="Текст новости">${esc(n.text)}</textarea>
        <div class="adm-news-img-row">
          ${n.image?`<img src="${n.image}" class="adm-news-thumb">`:""}
          <button class="admin-btn small ghost" data-imgnews="${i}">${n.image?"🖼️ Заменить фото":"🖼️ Прикрепить фото"}</button>
          ${n.image?`<button class="adm-del" data-delimgnews="${i}" aria-label="Удалить фото">✕</button>`:""}
        </div>
      </div>`;
    });
    if(!newsData.length)html+='<div class="adm-empty-state">Новостей пока нет. Добавьте первую.</div>';
    html+=`<button class="admin-btn small ghost" id="addNews">+ добавить новость</button>`;

    html+='<div class="adm-subsection-title" style="margin-top:20px">🎟️ Мероприятия (афиша с записью)</div>';
    eventsData.forEach((e,i)=>{
      html+=`<div class="adm-news-card">
        <div class="adm-news-row">
          <input type="date" class="admin-inp adm-date-inp" data-ei="${i}" data-f="date" value="${esc((e.date||"").split(" ")[0])}">
          <input class="admin-inp" data-ei="${i}" data-f="time" value="${esc(e.time||"")}" placeholder="Время (напр. 15:00)" style="max-width:120px">
          <input class="admin-inp price" type="number" data-ei="${i}" data-f="seats" value="${e.seats||""}" placeholder="Мест">
          <button class="adm-del" data-delevt="${i}" aria-label="Удалить">🗑</button>
        </div>
        <input class="admin-inp" data-ei="${i}" data-f="title" value="${esc(e.title)}" placeholder="Название мероприятия">
        <input class="admin-inp" data-ei="${i}" data-f="place" value="${esc(e.place)}" placeholder="Место проведения">
        <textarea class="admin-inp" data-ei="${i}" data-f="desc" rows="2" placeholder="Описание">${esc(e.desc)}</textarea>
        <div class="adm-news-img-row">
          ${e.image?`<img src="${e.image}" class="adm-news-thumb">`:""}
          <button class="admin-btn small ghost" data-imgevt="${i}">${e.image?"🖼️ Заменить фото":"🖼️ Прикрепить фото"}</button>
          ${e.image?`<button class="adm-del" data-delimgevt="${i}" aria-label="Удалить фото">✕</button>`:""}
        </div>
      </div>`;
    });
    if(!eventsData.length)html+='<div class="adm-empty-state">Мероприятий пока нет.</div>';
    html+=`<button class="admin-btn small ghost" id="addEvt">+ добавить мероприятие</button>`;
    html+=`<button class="admin-btn" id="saveNews" style="margin-top:16px">💾 Сохранить новости и мероприятия</button>`;
    body.innerHTML=html;

    const collectNews=()=>{
      const map={};
      newsData.forEach((n,i)=>{map[i]=Object.assign({},n);});
      body.querySelectorAll("[data-ni]").forEach(inp=>{
        const i=+inp.dataset.ni;(map[i]=map[i]||{});
        map[i][inp.dataset.f]=inp.value;
      });
      newsData.length=0;Object.keys(map).sort((a,b)=>a-b).forEach(k=>newsData.push(map[k]));
    };
    const collectEvents=()=>{
      const map={};
      eventsData.forEach((e,i)=>{map[i]=Object.assign({},e);
        const parts=(e.date||"").split(" ");map[i].date=parts[0]||"";map[i].time=parts[1]||"";
      });
      body.querySelectorAll("[data-ei]").forEach(inp=>{
        const i=+inp.dataset.ei;(map[i]=map[i]||{});
        const f=inp.dataset.f;
        map[i][f]=f==="seats"?(parseInt(inp.value)||0):inp.value;
      });
      eventsData.length=0;let id=1;
      Object.keys(map).sort((a,b)=>a-b).forEach(k=>{
        const ev=map[k];
        const dateStr=ev.date&&ev.time?ev.date+" "+ev.time:(ev.date||"");
        const obj={id:"ev"+id++,date:dateStr,title:ev.title,place:ev.place,desc:ev.desc,seats:ev.seats||0};
        if(ev.image)obj.image=ev.image;
        eventsData.push(obj);
      });
    };
    body.querySelector("#saveNews").onclick=()=>{collectNews();collectEvents();saveOverrides();showToast("💾 Новости и мероприятия сохранены");};
    body.querySelector("#addNews").onclick=()=>{collectNews();collectEvents();newsData.push({date:new Date().toISOString().split("T")[0],tag:"Новость",title:"",text:""});saveOverrides();renderNews(body);};
    body.querySelector("#addEvt").onclick=()=>{collectNews();collectEvents();eventsData.push({id:"ev"+(eventsData.length+1),date:new Date().toISOString().split("T")[0],title:"",place:"",desc:"",seats:0});saveOverrides();renderNews(body);};
    body.querySelectorAll("[data-delnews]").forEach(b=>b.onclick=()=>{collectNews();collectEvents();newsData.splice(+b.dataset.delnews,1);saveOverrides();renderNews(body);});
    body.querySelectorAll("[data-delevt]").forEach(b=>b.onclick=()=>{collectNews();collectEvents();eventsData.splice(+b.dataset.delevt,1);saveOverrides();renderNews(body);});
    body.querySelectorAll("[data-imgnews]").forEach(b=>b.onclick=()=>{
      const i=+b.dataset.imgnews;
      pickAndResizeImage(dataUrl=>{
        collectNews();collectEvents();
        newsData[i].image=dataUrl;
        saveOverrides();renderNews(body);
      });
    });
    body.querySelectorAll("[data-delimgnews]").forEach(b=>b.onclick=()=>{
      const i=+b.dataset.delimgnews;
      collectNews();collectEvents();
      delete newsData[i].image;
      saveOverrides();renderNews(body);
    });
    body.querySelectorAll("[data-imgevt]").forEach(b=>b.onclick=()=>{
      const i=+b.dataset.imgevt;
      pickAndResizeImage(dataUrl=>{
        collectNews();collectEvents();
        eventsData[i].image=dataUrl;
        saveOverrides();renderNews(body);
      });
    });
    body.querySelectorAll("[data-delimgevt]").forEach(b=>b.onclick=()=>{
      const i=+b.dataset.delimgevt;
      collectNews();collectEvents();
      delete eventsData[i].image;
      saveOverrides();renderNews(body);
    });
  }

  function renderGallery(body){
    let html='<div class="adm-section-title">Фотогалерея центра</div>';
    html+='<div class="adm-hint">Фото видят все пользователи бота в разделе «Фотогалерея», независимо от филиала.</div>';
    html+='<button class="admin-btn" id="addPhoto">📷 Добавить фото</button>';

    if(!galleryData.length){
      html+='<div class="adm-empty-state" style="margin-top:12px">Пока нет фотографий. Добавьте первую.</div>';
    }else{
      html+='<div class="adm-gallery-grid">';
      galleryData.forEach((g,i)=>{
        html+=`<div class="adm-gallery-item">
          <img src="${g.url}" class="adm-gallery-thumb">
          <input class="admin-inp" data-gi="${i}" placeholder="Подпись к фото" value="${esc(g.caption)}" style="margin-top:6px">
          <button class="adm-del" data-delphoto="${i}" aria-label="Удалить фото" style="width:100%;margin-top:6px;border-radius:10px">🗑 Удалить</button>
        </div>`;
      });
      html+='</div>';
      html+='<button class="admin-btn" id="saveGallery" style="margin-top:14px">💾 Сохранить подписи</button>';
    }
    body.innerHTML=html;

    body.querySelector("#addPhoto").onclick=()=>{
      pickAndResizeImage(dataUrl=>{
        galleryData.push({id:"ph"+Date.now(),url:dataUrl,caption:""});
        saveOverrides();
        showToast("📷 Фото добавлено");
        renderGallery(body);
      },900);
    };
    const saveBtn=body.querySelector("#saveGallery");
    if(saveBtn)saveBtn.onclick=()=>{
      body.querySelectorAll("[data-gi]").forEach(inp=>{galleryData[+inp.dataset.gi].caption=inp.value;});
      saveOverrides();showToast("💾 Подписи сохранены");
    };
    body.querySelectorAll("[data-delphoto]").forEach(b=>b.onclick=()=>{
      body.querySelectorAll("[data-gi]").forEach(inp=>{galleryData[+inp.dataset.gi].caption=inp.value;});
      galleryData.splice(+b.dataset.delphoto,1);
      saveOverrides();renderGallery(body);
    });
  }

  function renderTemplates(body){
    const T=[
      ["order","Заявка на услуги (из корзины)",["name","city"]],
      ["booking","Запись к специалисту",["name","date","time","ticket"]],
      ["cancelBooking","Отмена записи",["ticket"]],
      ["feedback","Отзыв о работе центра",["name"]],
      ["callback","Обратный звонок",["name"]],
      ["event","Запись на мероприятие",["title"]]
    ];
    let html='<div class="adm-section-title">Шаблоны текстов заявок</div>';
    html+='<div class="adm-hint">Эти тексты используются при формировании письма на email филиала. В теме письма можно использовать плейсхолдеры в фигурных скобках — они подставятся автоматически.</div>';
    T.forEach(([key,label,placeholders])=>{
      const t=emailTemplates[key]||{subject:"",intro:""};
      html+=`<div class="adm-cat-card"><div class="adm-cat-items" style="display:flex;flex-direction:column;gap:6px">
        <div class="adm-dept-name" style="margin-bottom:2px">${label}</div>
        <label class="admin-lbl" style="margin-top:0">Тема письма</label>
        <input class="admin-inp" data-tpl="${key}" data-f="subject" value="${esc(t.subject)}">
        <label class="admin-lbl">Заголовок текста (в теле письма)</label>
        <input class="admin-inp" data-tpl="${key}" data-f="intro" value="${esc(t.intro)}">
        <div class="adm-tpl-hint">Доступные плейсхолдеры: ${placeholders.map(p=>"{"+p+"}").join(", ")}</div>
      </div></div>`;
    });
    html+='<button class="admin-btn" id="saveTemplates">💾 Сохранить шаблоны</button>';
    html+='<button class="admin-btn small ghost" id="resetTemplates">↺ Вернуть тексты по умолчанию</button>';
    body.innerHTML=html;

    body.querySelector("#saveTemplates").onclick=()=>{
      body.querySelectorAll("[data-tpl]").forEach(inp=>{
        const key=inp.dataset.tpl,f=inp.dataset.f;
        if(!emailTemplates[key])emailTemplates[key]={subject:"",intro:""};
        emailTemplates[key][f]=inp.value;
      });
      saveOverrides();showToast("💾 Шаблоны сохранены");
    };
    body.querySelector("#resetTemplates").onclick=()=>{
      if(!confirm("Вернуть тексты писем к значениям по умолчанию?"))return;
      emailTemplates.order={subject:"Заявка: {name} ({city})",intro:"ЗАЯВКА НА СОЦИАЛЬНЫЕ УСЛУГИ"};
      emailTemplates.booking={subject:"Запись: {name} на {date} {time} — {ticket}",intro:"ЗАПИСЬ К СПЕЦИАЛИСТУ"};
      emailTemplates.cancelBooking={subject:"Отмена записи {ticket}",intro:"ОТМЕНА ЗАПИСИ"};
      emailTemplates.feedback={subject:"Отзыв от {name}",intro:"ОТЗЫВ О РАБОТЕ ЦЕНТРА"};
      emailTemplates.callback={subject:"Обратный звонок: {name}",intro:"ЗАЯВКА НА ОБРАТНЫЙ ЗВОНОК"};
      emailTemplates.event={subject:"Запись на мероприятие: {title}",intro:"ЗАПИСЬ НА МЕРОПРИЯТИЕ"};
      saveOverrides();showToast("↺ Тексты восстановлены");renderTemplates(body);
    };
  }

  function renderStats(body){
    var stats={};try{stats=JSON.parse(localStorage.getItem("ym_local")||"{}");}catch(e){}
    var cartS={};try{cartS=JSON.parse(localStorage.getItem("cartStats")||"{}");}catch(e){}
    var ratings=[];try{ratings=JSON.parse(localStorage.getItem("ratings")||"[]");}catch(e){}
    var orders=[];try{orders=JSON.parse(localStorage.getItem("ordersHistory")||"[]");}catch(e){}
    var bookings=[];try{bookings=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");}catch(e){}

    var html='<div class="adm-section-title">Статистика</div>';
    html+='<div class="adm-hint">Локальная статистика этого устройства.</div>';
    html+='<div class="stat-cards"><div class="stat-c"><div class="stat-v">'+orders.length+'</div><div class="stat-l">Заявок</div></div>';
    html+='<div class="stat-c"><div class="stat-v">'+bookings.length+'</div><div class="stat-l">Записей</div></div>';
    var avgR="—";if(ratings.length){var sum=0;ratings.forEach(function(r){sum+=r.stars;});avgR=(sum/ratings.length).toFixed(1)+"⭐";}
    html+='<div class="stat-c"><div class="stat-v">'+avgR+'</div><div class="stat-l">Оценка ('+ratings.length+')</div></div></div>';

    var topS=Object.entries(cartS).sort(function(a,b){return b[1]-a[1];}).slice(0,8);
    if(topS.length){
      html+='<div class="adm-subsection-title">Популярные услуги</div>';
      var maxV=topS[0][1];
      topS.forEach(function(s,i){
        var pct=Math.round(s[1]/maxV*100);
        html+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px"><span style="width:18px;font-size:11px;color:var(--text-tertiary);font-weight:800">'+(i+1)+'</span><div style="flex:1;height:26px;background:var(--teal-xlight);border-radius:6px;overflow:hidden;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:'+pct+'%;background:linear-gradient(90deg,var(--teal-light),var(--teal));border-radius:6px"></div><span style="position:relative;padding-left:8px;font-size:11px;font-weight:600;line-height:26px">'+s[0]+'</span></div><span style="width:28px;text-align:right;font-size:11px;font-weight:800;color:var(--teal)">'+s[1]+'</span></div>';
      });
    }

    var days=Object.keys(stats).sort().reverse().slice(0,7);
    if(days.length){
      html+='<div class="adm-subsection-title">Активность по дням</div>';
      html+='<table class="stat-tbl"><tr><th>Дата</th><th>Входы</th><th>Каталог</th><th>Запись</th><th>Заявки</th><th>Помощник</th></tr>';
      days.forEach(function(d){var ds=stats[d]||{};html+='<tr><td>'+d.slice(5)+'</td><td>'+(ds.login||0)+'</td><td>'+(ds.view_services||0)+'</td><td>'+(ds.view_booking||0)+'</td><td>'+(ds.order_sent||0)+'</td><td>'+(ds.open_assistant||0)+'</td></tr>';});
      html+='</table>';
    }

    if(ratings.length){
      html+='<div class="adm-subsection-title">Последние отзывы</div>';
      ratings.slice(-5).reverse().forEach(function(r){
        html+='<div style="padding:8px 0;border-bottom:1px solid rgba(0,0,0,.04);font-size:12px"><span style="color:var(--gold)">'+"★".repeat(r.stars)+"☆".repeat(5-r.stars)+'</span> '+(r.comment||'<span style="color:var(--text-tertiary)">без комментария</span>')+'<span style="float:right;color:var(--text-tertiary);font-size:10px">'+new Date(r.date).toLocaleDateString("ru-RU")+'</span></div>';
      });
    }

    html+='<a href="https://metrika.yandex.ru/dashboard?id=110025020" target="_blank" class="adm-metrika-link">📊 Открыть Яндекс Метрику — полная аналитика</a>';
    body.innerHTML=html;
  }

  function exportJSON(){
    saveOverrides();
    const data=localStorage.getItem("adminOverrides")||"{}";
    const blob=new Blob([data],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download="garmoniya_data.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    showToast("⬇️ Файл выгружен");
  }
  function importJSON(file){
    if(!file)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const ov=JSON.parse(r.result);
        localStorage.setItem("adminOverrides",JSON.stringify(ov));
        applyOverrides();refreshActive();
        showToast("✅ Данные загружены");
        renderShell(document.getElementById("adminFs"));
      }catch(e){showToast("❌ Ошибка чтения файла");}
    };
    r.readAsText(file);
  }

  applyOverrides();
})();
