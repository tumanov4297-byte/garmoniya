/* ═══════════════════════════════════════
   АДМИНПАНЕЛЬ
   ───────────────────────────────────────
   ⚠️ ВАЖНО ПРО БЕЗОПАСНОСТЬ:
   Это клиентская (браузерная) админка для статического сайта.
   • Пароль ниже виден любому, кто откроет исходный код сайта.
     Это НЕ защита, а лишь «мягкий замок» от случайного входа.
   • Правки сохраняются только в браузере администратора (localStorage)
     и НЕ видны другим пользователям.
   Чтобы правки были общими и вход — защищённым, нужен бэкенд
   (Supabase Auth + база, этап 5).

   ПОЛЕЗНЫЙ ОБХОД: кнопка «Экспорт JSON» выгружает все правки в файл.
   Передайте файл разработчику — он вошьёт изменения в проект навсегда.
═══════════════════════════════════════ */
(function(){
  "use strict";

  const ADMIN={email:"iatumanov@yanao.ru",pass:"300897"};
  const CITY_NAMES={gubkin:"Губкинский",muravlenko:"Муравленко",noyabrsk:"Ноябрьск",tarko:"Тарко-Сале",urengoy:"Уренгой"};
  const CONTACT_FIELDS=[["address","Адрес"],["phone","Телефон (для показа)"],["phoneRaw","Телефон (цифры, для звонка)"],["email","Email"],["hours","Часы работы"]];

  let editCity="gubkin", editTab="contacts";

  /* — Применение сохранённых правок при загрузке — */
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
  }

  /* — Сохранение всех правок — */
  function saveOverrides(){
    const ov={cityData:{},branchContent:{}};
    for(const c in cityData){
      ov.cityData[c]={};
      CONTACT_FIELDS.forEach(([f])=>{ov.cityData[c][f]=cityData[c][f];});
    }
    for(const c in branchContent){
      ov.branchContent[c]={services:branchContent[c].services,staff:branchContent[c].staff};
    }
    localStorage.setItem("adminOverrides",JSON.stringify(ov));
  }

  function isAuthed(){return sessionStorage.getItem("adminAuthed")==="1";}

  /* — Точка входа — */
  window.openAdmin=function(){
    document.querySelectorAll(".admin-ovl").forEach(e=>e.remove());
    const ovl=document.createElement("div");ovl.className="admin-ovl";ovl.setAttribute("role","dialog");ovl.setAttribute("aria-modal","true");
    ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
    document.body.appendChild(ovl);
    isAuthed()?renderPanel(ovl):renderLogin(ovl);
  };

  function renderLogin(ovl){
    ovl.innerHTML=`<div class="admin-card">
      <h3>🔐 Вход для администратора</h3>
      <div class="admin-warn">Внимание: это клиентская админка. Правки сохраняются только в этом браузере. Для общих изменений нужен бэкенд.</div>
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
        sessionStorage.setItem("adminAuthed","1");renderPanel(ovl);
      }else{showToast("❌ Неверный email или пароль");}
    };
    ovl.querySelector("#admGo").onclick=go;
    pw.addEventListener("keydown",e=>{if(e.key==="Enter")go();});
    ovl.querySelector("#admCancel").onclick=()=>ovl.remove();
  }

  function renderPanel(ovl){
    const tabs=[["contacts","📍 Контакты"],["services","📋 Услуги"],["staff","👥 Сотрудники"]];
    ovl.innerHTML=`<div class="admin-card wide">
      <div class="admin-head">
        <h3>⚙️ Админпанель</h3>
        <button class="admin-x" id="admClose" aria-label="Закрыть">✕</button>
      </div>
      <div class="admin-warn">Правки сохраняются в этом браузере. Жмите «Экспорт JSON», чтобы передать изменения разработчику для постоянного сохранения.</div>
      <label class="admin-lbl">Филиал для редактирования</label>
      <select class="admin-inp" id="admCity">${Object.keys(CITY_NAMES).map(c=>`<option value="${c}" ${c===editCity?"selected":""}>${CITY_NAMES[c]}</option>`).join("")}</select>
      <div class="admin-tabs">${tabs.map(([k,l])=>`<button class="admin-tab ${k===editTab?"active":""}" data-tab="${k}">${l}</button>`).join("")}</div>
      <div class="admin-body" id="admBody"></div>
      <div class="admin-tools">
        <button class="admin-btn small" id="admExport">⬇️ Экспорт JSON</button>
        <button class="admin-btn small ghost" id="admImport">⬆️ Импорт JSON</button>
        <button class="admin-btn small danger" id="admReset">↺ Сброс</button>
        <button class="admin-btn small ghost" id="admLogout">🚪 Выйти</button>
      </div>
      <input type="file" id="admFile" accept="application/json" style="display:none">
    </div>`;
    ovl.querySelector("#admClose").onclick=()=>ovl.remove();
    ovl.querySelector("#admCity").onchange=e=>{editCity=e.target.value;renderBody(ovl);};
    ovl.querySelectorAll(".admin-tab").forEach(t=>t.onclick=()=>{editTab=t.dataset.tab;renderPanel(ovl);});
    ovl.querySelector("#admExport").onclick=exportJSON;
    ovl.querySelector("#admImport").onclick=()=>ovl.querySelector("#admFile").click();
    ovl.querySelector("#admFile").onchange=e=>importJSON(e.target.files[0],ovl);
    ovl.querySelector("#admReset").onclick=()=>{if(confirm("Сбросить ВСЕ правки и вернуть исходные данные?")){localStorage.removeItem("adminOverrides");location.reload();}};
    ovl.querySelector("#admLogout").onclick=()=>{sessionStorage.removeItem("adminAuthed");ovl.remove();};
    renderBody(ovl);
  }

  function renderBody(ovl){
    const body=ovl.querySelector("#admBody");
    if(editTab==="contacts")renderContacts(body);
    else if(editTab==="services")renderServices(body);
    else renderStaff(body);
  }

  /* — КОНТАКТЫ — */
  function renderContacts(body){
    const cd=cityData[editCity];
    body.innerHTML=CONTACT_FIELDS.map(([f,l])=>
      `<label class="admin-lbl">${l}</label><input class="admin-inp" data-cf="${f}" value="${(cd[f]||"").replace(/"/g,"&quot;")}">`
    ).join("")+`<button class="admin-btn" id="saveContacts">💾 Сохранить контакты</button>`;
    body.querySelector("#saveContacts").onclick=()=>{
      body.querySelectorAll("[data-cf]").forEach(inp=>{
        let v=inp.value;
        if(inp.dataset.cf==="openH"||inp.dataset.cf==="openM")v=parseInt(v)||0;
        cityData[editCity][inp.dataset.cf]=v;
      });
      saveOverrides();showToast("💾 Контакты сохранены");
    };
  }

  /* — УСЛУГИ — */
  function renderServices(body){
    const svc=branchContent[editCity].services;
    let html='<div class="adm-hint">Цена p — обычная, m — по «Морошке» (пусто = без скидки).</div>';
    svc.forEach((cat,ci)=>{
      html+=`<div class="adm-cat">
        <div class="adm-cat-head">
          <input class="admin-inp tiny" data-cat="${ci}" data-f="icon" value="${(cat.icon||"").replace(/"/g,"&quot;")}" style="width:46px;text-align:center;">
          <input class="admin-inp" data-cat="${ci}" data-f="name" value="${(cat.name||"").replace(/"/g,"&quot;")}" placeholder="Название категории">
          <button class="adm-del" data-delcat="${ci}" aria-label="Удалить категорию">🗑</button>
        </div>`;
      cat.items.forEach((it,ii)=>{
        html+=`<div class="adm-item">
          <input class="admin-inp" data-cat="${ci}" data-item="${ii}" data-f="n" value="${(it.n||"").replace(/"/g,"&quot;")}" placeholder="Услуга">
          <input class="admin-inp tiny" type="number" data-cat="${ci}" data-item="${ii}" data-f="p" value="${it.p??""}" placeholder="₽">
          <input class="admin-inp tiny" type="number" data-cat="${ci}" data-item="${ii}" data-f="m" value="${it.m??""}" placeholder="🍊">
          <button class="adm-del" data-delitem="${ci}_${ii}" aria-label="Удалить услугу">✕</button>
        </div>`;
      });
      html+=`<button class="admin-btn small ghost" data-additem="${ci}">+ услуга</button></div>`;
    });
    html+=`<button class="admin-btn small" id="addCat">+ категория</button><button class="admin-btn" id="saveSvc">💾 Сохранить услуги</button>`;
    body.innerHTML=html;

    const collect=()=>{
      body.querySelectorAll("[data-f]").forEach(inp=>{
        const ci=+inp.dataset.cat,f=inp.dataset.f;
        if(inp.dataset.item!==undefined){
          const ii=+inp.dataset.item,it=svc[ci].items[ii];
          if(f==="n")it.n=inp.value;
          else if(f==="p")it.p=parseInt(inp.value)||0;
          else if(f==="m")it.m=inp.value===""?null:(parseInt(inp.value)||0);
        }else{svc[ci][f]=inp.value;}
      });
    };
    body.querySelector("#saveSvc").onclick=()=>{collect();saveOverrides();showToast("💾 Услуги сохранены");refreshActive();};
    body.querySelector("#addCat").onclick=()=>{collect();const id=Math.max(0,...svc.map(c=>c.id||0))+1;svc.push({id,name:"Новая категория",icon:"📦",rating:4.8,items:[]});saveOverrides();renderServices(body);};
    body.querySelectorAll("[data-additem]").forEach(b=>b.onclick=()=>{collect();svc[+b.dataset.additem].items.push({n:"Новая услуга",p:100,m:null});saveOverrides();renderServices(body);});
    body.querySelectorAll("[data-delcat]").forEach(b=>b.onclick=()=>{if(confirm("Удалить категорию целиком?")){collect();svc.splice(+b.dataset.delcat,1);saveOverrides();renderServices(body);}});
    body.querySelectorAll("[data-delitem]").forEach(b=>b.onclick=()=>{collect();const[ci,ii]=b.dataset.delitem.split("_").map(Number);svc[ci].items.splice(ii,1);saveOverrides();renderServices(body);});
  }

  /* — СОТРУДНИКИ — */
  function renderStaff(body){
    const staff=branchContent[editCity].staff;
    const F=[["dept","Отделение"],["name","ФИО"],["pos","Должность"],["ext","Доб."],["email","Email"]];
    let html='';
    staff.forEach((s,i)=>{
      html+=`<div class="adm-staff">${F.map(([f,l])=>
        `<input class="admin-inp" data-st="${i}" data-f="${f}" value="${(s[f]||"").replace(/"/g,"&quot;")}" placeholder="${l}">`
      ).join("")}<button class="adm-del" data-delst="${i}" aria-label="Удалить">🗑</button></div>`;
    });
    if(!staff.length)html+='<div class="adm-hint">Сотрудников пока нет. Добавьте первого.</div>';
    html+=`<button class="admin-btn small" id="addSt">+ сотрудник</button><button class="admin-btn" id="saveSt">💾 Сохранить сотрудников</button>`;
    body.innerHTML=html;
    const collect=()=>{
      const map={};
      body.querySelectorAll("[data-st]").forEach(inp=>{const i=+inp.dataset.st;(map[i]=map[i]||{})[inp.dataset.f]=inp.value;});
      const arr=Object.keys(map).sort((a,b)=>a-b).map(k=>map[k]);
      staff.length=0;arr.forEach(x=>staff.push(x));
    };
    body.querySelector("#saveSt").onclick=()=>{collect();saveOverrides();showToast("💾 Сотрудники сохранены");refreshActive();};
    body.querySelector("#addSt").onclick=()=>{collect();staff.push({dept:"",name:"",pos:"",ext:"",email:""});saveOverrides();renderStaff(body);};
    body.querySelectorAll("[data-delst]").forEach(b=>b.onclick=()=>{collect();staff.splice(+b.dataset.delst,1);saveOverrides();renderStaff(body);});
  }

  // Обновить активные данные текущего города, если редактировали его
  function refreshActive(){
    if(typeof currentCity!=="undefined"){
      servicesData=branchContent[currentCity].services;
      staffData=branchContent[currentCity].staff;
    }
  }

  /* — ЭКСПОРТ / ИМПОРТ — */
  function exportJSON(){
    saveOverrides();
    const data=localStorage.getItem("adminOverrides")||"{}";
    const blob=new Blob([data],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download="garmoniya_data.json";a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    showToast("⬇️ Файл выгружен");
  }
  function importJSON(file,ovl){
    if(!file)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const ov=JSON.parse(r.result);
        localStorage.setItem("adminOverrides",JSON.stringify(ov));
        applyOverrides();refreshActive();
        showToast("✅ Данные загружены");renderPanel(ovl);
      }catch(e){showToast("❌ Ошибка чтения файла");}
    };
    r.readAsText(file);
  }

  // Применяем сохранённые правки сразу при загрузке скрипта
  applyOverrides();
})();
