/* ═══════════════════════════════════════════════════════════════════
   header.js — премиум-шапка «Гармония».
   Живой статус работы с обратным отсчётом, ближайшая запись, уведомления,
   быстрые действия (поиск, звонок, кабинет, смена филиала), аврора-фон,
   снег зимой, тема по времени суток, компактный режим при скролле.
   Только украшения и удобные ярлыки поверх существующих функций.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var hdr = document.getElementById("appHdr");
  if(!hdr) return;

  function $(id){ return document.getElementById(id); }
  function getCityData(){
    try{ return (cityData && (cityData[currentCity]||cityData.gubkin)) || null; }catch(e){ return null; }
  }

  /* ─────────── Тема шапки по времени суток ─────────── */
  function applyTimeTheme(){
    var h=new Date().getHours(), cls="hdr-day";
    if(h>=5&&h<11) cls="hdr-morning";
    else if(h>=11&&h<17) cls="hdr-day";
    else if(h>=17&&h<22) cls="hdr-evening";
    else cls="hdr-night";
    hdr.classList.remove("hdr-morning","hdr-day","hdr-evening","hdr-night");
    hdr.classList.add(cls);
  }

  /* ─────────── Живой статус работы + обратный отсчёт ─────────── */
  function fmtDur(mins){
    mins=Math.max(0,Math.round(mins));
    var hh=Math.floor(mins/60), mm=mins%60;
    if(hh>0 && mm>0) return hh+" ч "+mm+" мин";
    if(hh>0) return hh+" ч";
    return mm+" мин";
  }
  function nextOpenInfo(cd, now){
    // ближайший рабочий день (Пн–Пт) и время открытия
    var probe=new Date(now.getTime());
    var openMins=cd.openH*60+cd.openM;
    for(var i=0;i<8;i++){
      var dow=probe.getDay();
      var isWeekday=dow>=1&&dow<=5;
      var sameDay=(i===0);
      var curMins=now.getHours()*60+now.getMinutes();
      if(isWeekday && (!sameDay || curMins<openMins)){
        var openAt=new Date(probe.getFullYear(),probe.getMonth(),probe.getDate(),cd.openH,cd.openM,0,0);
        var label = i===0 ? "сегодня" : (i===1 ? "завтра" : ["вс","пн","вт","ср","чт","пт","сб"][openAt.getDay()]);
        return { at:openAt, label:label };
      }
      probe.setDate(probe.getDate()+1);
    }
    return null;
  }
  function renderStatus(){
    var st=$("hdrStatus"); if(!st) return;
    var cd=getCityData(); if(!cd){ return; }
    var now=new Date();
    var dow=now.getDay(), mins=now.getHours()*60+now.getMinutes();
    var openMins=cd.openH*60+cd.openM, closeMins=cd.closeH*60+cd.closeM;
    var isWeekday=dow>=1&&dow<=5;
    var isOpen=isWeekday && mins>=openMins && mins<closeMins;
    var dot=st.querySelector(".hdr-status-dot"), txt=st.querySelector(".hdr-status-txt");
    var closeStr=cd.closeH+":"+String(cd.closeM).padStart(2,"0");
    st.classList.remove("is-open","is-soon","is-closed");
    if(isOpen){
      var toClose=closeMins-mins;
      st.classList.add(toClose<=60?"is-soon":"is-open");
      txt.innerHTML = toClose<=60
        ? "Открыто · закроется через "+fmtDur(toClose)
        : "Открыто · до "+closeStr;
    }else{
      st.classList.add("is-closed");
      var nx=nextOpenInfo(cd,now);
      if(nx){
        var diff=(nx.at-now)/60000;
        var openStr=cd.openH+":"+String(cd.openM).padStart(2,"0");
        txt.innerHTML = diff<=180
          ? "Закрыто · откроется через "+fmtDur(diff)
          : "Закрыто · "+nx.label+" в "+openStr;
      }else{
        txt.textContent="Закрыто";
      }
    }
    // телефон филиала на кнопку звонка
    var call=$("hdrCall");
    if(call && cd.phoneRaw){ call.setAttribute("href","tel:+"+cd.phoneRaw); }
  }

  /* ─────────── Ближайшая запись ─────────── */
  function readHist(key){ try{ return JSON.parse(localStorage.getItem(key)||"[]"); }catch(e){ return []; } }
  function renderNext(){
    var chip=$("hdrNextChip"); if(!chip) return;
    var bh=readHist("bookingsHistory");
    var today=new Date(); today.setHours(0,0,0,0);
    var future=bh.filter(function(b){
      if(!b || !b.visitDate) return false;
      var d=new Date(b.visitDate+"T00:00:00");
      return !isNaN(d) && d>=today;
    }).sort(function(a,b){ return new Date(a.visitDate)-new Date(b.visitDate); });
    if(!future.length){ chip.classList.add("gone"); chip.innerHTML=""; return; }
    var nx=future[0];
    var d=new Date(nx.visitDate+"T00:00:00");
    var isToday=d.getTime()===today.getTime();
    var tmr=new Date(today.getTime()+86400000);
    var isTmr=d.getTime()===tmr.getTime();
    var months=["янв","фев","мар","апр","мая","июн","июл","авг","сен","окт","ноя","дек"];
    var whenLbl=isToday?"сегодня":(isTmr?"завтра":(d.getDate()+" "+months[d.getMonth()]));
    var title="Запись "+whenLbl+" в "+(nx.visitTime||"");
    var sub=(nx.spec||nx.dept||"Приём специалиста");
    chip.innerHTML=
      '<button class="hnc-main" type="button">'
      +'<span class="hnc-ico">📅</span>'
      +'<span class="hnc-txt"><b>'+esc(title)+'</b><span>'+esc(sub)+'</span></span>'
      +'<span class="hnc-arr">→</span>'
      +'</button>'
      +'<button class="hnc-cal" type="button" aria-label="Добавить в календарь" title="Добавить в календарь">'
      +'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
      +'</button>';
    chip.classList.remove("gone");
    chip.querySelector(".hnc-main").onclick=function(){
      if(typeof openOrdersPanel==="function"){ openOrdersPanel(); if(typeof ordFilter==="function"){ var b=document.querySelector('.of-btn[data-f="bookings"]'); if(b)ordFilter("bookings",b); } }
    };
    chip.querySelector(".hnc-cal").onclick=function(ev){ ev.stopPropagation(); addToCalendar(nx); };
  }

  /* ─────────── .ics — добавить запись в календарь ─────────── */
  function addToCalendar(b){
    try{
      var date=(b.visitDate||"").replace(/-/g,"");
      var t=(b.visitTime||"09:00").replace(":","");
      if(date.length!==8){ if(typeof showToast==="function")showToast("Не удалось создать событие"); return; }
      var startH=parseInt(t.slice(0,2),10)||9, startM=parseInt(t.slice(2,4),10)||0;
      var endH=(startH+1)%24;
      var dtStart=date+"T"+String(startH).padStart(2,"0")+String(startM).padStart(2,"0")+"00";
      var dtEnd=date+"T"+String(endH).padStart(2,"0")+String(startM).padStart(2,"0")+"00";
      var summary="Запись — "+(b.spec||b.dept||"приём в «Гармонии»");
      var loc=(typeof currentCityName!=="undefined")?("«Гармония», "+currentCityName):"«Гармония»";
      var uid="garm-"+(b.num||Date.now())+"@garmoniya";
      var ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Garmoniya//CSON//RU","CALSCALE:GREGORIAN","BEGIN:VEVENT",
        "UID:"+uid,"DTSTART:"+dtStart,"DTEND:"+dtEnd,"SUMMARY:"+summary,"LOCATION:"+loc,
        "DESCRIPTION:Напоминание о записи в центр «Гармония»","BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY",
        "DESCRIPTION:Напоминание","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
      var blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});
      var url=URL.createObjectURL(blob);
      var a=document.createElement("a"); a.href=url; a.download="zapis-garmoniya.ics";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(url); },1500);
      if(typeof showToast==="function")showToast("📅 Событие сохранено в календарь");
    }catch(e){ if(typeof showToast==="function")showToast("Не удалось создать событие"); }
  }

  /* ─────────── Аватар → кабинет ─────────── */
  function renderAvatar(){
    var av=$("hdrAvatar"); if(!av) return;
    var photo = (typeof getProfilePhoto==="function") ? getProfilePhoto() : "";
    var name = (typeof clientName!=="undefined" && clientName) ? clientName : "";
    if(photo){
      av.innerHTML='<img src="'+photo+'" alt="">';
    }else{
      var ini=(name||"?").split(" ").filter(Boolean).slice(0,2).map(function(w){return w[0];}).join("").toUpperCase()||"?";
      av.innerHTML='<span class="hdr-ava-init">'+ini+'</span>';
    }
  }

  /* ─────────── Уведомления (лента активности) ─────────── */
  function collectNotifs(){
    var items=[];
    readHist("ordersHistory").forEach(function(o){ items.push({t:o.createdAt||o.date, ico:"🛍️", title:"Заявка "+(o.num||""), sub:(o.status==="new"?"Отправлена":o.status||"")+(o.sum?" · "+o.sum+" ₽":"")}); });
    readHist("bookingsHistory").forEach(function(b){ items.push({t:b.createdAt||b.visitDate, ico:"📅", title:"Запись "+(b.num||""), sub:(b.visitDate||"")+" "+(b.visitTime||"")+" · "+(b.spec||b.dept||"")}); });
    readHist("taxiHistory").forEach(function(x){ items.push({t:x.createdAt||x.date, ico:"🚕", title:"Такси"+(x.date?" "+x.date:""), sub:(x.from||"")+" → "+(x.to||"")}); });
    items.sort(function(a,b){ return new Date(b.t||0)-new Date(a.t||0); });
    return items;
  }
  function notifSeen(){ return parseInt(localStorage.getItem("notifSeenTs")||"0",10); }
  function renderBell(){
    var badge=$("hdrBellBadge"); if(!badge) return;
    var seen=notifSeen();
    var unseen=collectNotifs().filter(function(n){ var ts=new Date(n.t||0).getTime(); return ts>seen; }).length;
    if(unseen>0){ badge.textContent=unseen>9?"9+":String(unseen); badge.classList.remove("gone"); }
    else{ badge.classList.add("gone"); }
  }
  function openNotifs(){
    var list=collectNotifs();
    var ovl=document.createElement("div"); ovl.className="hdr-sheet-ovl";
    ovl.onclick=function(e){ if(e.target===ovl) close(); };
    var rows = list.length ? list.slice(0,40).map(function(n){
      return '<div class="hnf-row"><span class="hnf-ico">'+n.ico+'</span><div class="hnf-txt"><b>'+esc(n.title)+'</b><span>'+esc(n.sub)+'</span></div></div>';
    }).join("") : '<div class="hnf-empty">🔔<div>Пока нет уведомлений</div><span>Здесь появятся статусы ваших заявок, записей и поездок</span></div>';
    ovl.innerHTML='<div class="hdr-sheet"><div class="hdr-sheet-grip"></div>'
      +'<div class="hdr-sheet-hd"><b>Уведомления</b><button class="hdr-sheet-x" aria-label="Закрыть">✕</button></div>'
      +'<div class="hnf-list">'+rows+'</div></div>';
    document.body.appendChild(ovl);
    requestAnimationFrame(function(){ ovl.classList.add("open"); });
    function close(){ ovl.classList.remove("open"); setTimeout(function(){ ovl.remove(); },300); }
    ovl.querySelector(".hdr-sheet-x").onclick=close;
    // всё увидено — гасим бейдж
    localStorage.setItem("notifSeenTs",String(Date.now()));
    renderBell();
  }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];}); }

  /* ─────────── Быстрая смена филиала ─────────── */
  function openCitySheet(){
    var cities=[["gubkin","Губкинский"],["purpe","мкр. Пурпе"],["muravlenko","Муравленко"],["noyabrsk","Ноябрьск"],["tarko","Тарко-Сале"],["urengoy","Уренгой"]];
    var ovl=document.createElement("div"); ovl.className="hdr-sheet-ovl";
    ovl.onclick=function(e){ if(e.target===ovl) close(); };
    var rows=cities.map(function(c){
      var active=(typeof currentCity!=="undefined"&&currentCity===c[0]);
      return '<button class="hcs-row'+(active?" active":"")+'" data-c="'+c[0]+'"><span class="hcs-pin">📍</span><span class="hcs-name">'+c[1]+'</span>'+(active?'<span class="hcs-check">✓</span>':"")+'</button>';
    }).join("");
    ovl.innerHTML='<div class="hdr-sheet"><div class="hdr-sheet-grip"></div>'
      +'<div class="hdr-sheet-hd"><b>Выбор филиала</b><button class="hdr-sheet-x" aria-label="Закрыть">✕</button></div>'
      +'<div class="hcs-list">'+rows+'</div></div>';
    document.body.appendChild(ovl);
    requestAnimationFrame(function(){ ovl.classList.add("open"); });
    function close(){ ovl.classList.remove("open"); setTimeout(function(){ ovl.remove(); },300); }
    ovl.querySelector(".hdr-sheet-x").onclick=close;
    ovl.querySelectorAll(".hcs-row").forEach(function(b){
      b.onclick=function(){ var k=b.dataset.c; close(); if(typeof selectCity==="function") selectCity(k); setTimeout(refreshAll,60); };
    });
  }

  /* ─────────── Поиск ─────────── */
  function openSearch(){
    var bar=$("searchBar"); if(!bar) return;
    if(typeof showServices==="function") showServices();
    bar.classList.remove("gone");
    var inp=$("searchInp"); if(inp){ inp.focus(); }
  }

  /* ─────────── Пасхалка: подмигивание логотипа ─────────── */
  function logoWink(){
    var logo=$("hdrLogo"); if(!logo||reduce) return;
    logo.classList.remove("wink"); void logo.offsetWidth; logo.classList.add("wink");
    var heart=document.createElement("span"); heart.className="hdr-logo-heart"; heart.textContent="💚";
    logo.appendChild(heart);
    setTimeout(function(){ heart.remove(); },900);
  }

  /* ─────────── Снег зимой ─────────── */
  function initSnow(){
    var box=$("hdrSnow"); if(!box||reduce) return;
    var m=new Date().getMonth(); // 0=янв … 11=дек
    var winter=(m>=10 || m<=2); // ноя–мар
    if(!winter) return;
    var n=10, html="";
    for(var i=0;i<n;i++){
      var left=(Math.random()*100).toFixed(1);
      var dur=(5+Math.random()*5).toFixed(1);
      var delay=(-Math.random()*8).toFixed(1);
      var size=(2+Math.random()*3).toFixed(1);
      var op=(0.35+Math.random()*0.4).toFixed(2);
      html+='<i style="left:'+left+'%;width:'+size+'px;height:'+size+'px;opacity:'+op+';animation-duration:'+dur+'s;animation-delay:'+delay+'s"></i>';
    }
    box.innerHTML=html;
  }

  /* --- Компактный режим отключён намеренно: изменение высоты шапки при
     скролле меняло высоту области прокрутки и «отбивало» палец на iOS
     (лента переставала листаться). Шапка остаётся стабильной высоты. --- */

  /* ─────────── Общий рефреш ─────────── */
  function refreshAll(){ try{ applyTimeTheme(); renderStatus(); renderNext(); renderAvatar(); renderBell(); }catch(e){} }
  window.hdrRefresh = refreshAll;              // чтобы другие модули могли обновить шапку
  window.hdrUpdateStatus = function(){ try{ renderStatus(); }catch(e){} };

  /* ─────────── Привязка событий ─────────── */
  function bind(id,fn){ var el=$(id); if(el) el.addEventListener("click",fn); }
  bind("hdrSearchBtn",openSearch);
  bind("hdrBellBtn",openNotifs);
  bind("hdrAvatar",function(){ if(typeof closeAllPanels==="function")closeAllPanels(); if(typeof openProfilePanel==="function")openProfilePanel(); });
  bind("hdrCityBtn",openCitySheet);
  bind("hdrLogo",logoWink);

  /* старт */
  initSnow(); refreshAll();
  document.addEventListener("DOMContentLoaded",refreshAll);
  setTimeout(refreshAll,400);        // после инициализации приложения (имя, фото, история)
  setInterval(renderStatus,30000);   // отсчёт «живой»
  setInterval(refreshAll,120000);    // тема/записи/уведомления раз в 2 мин
  window.addEventListener("focus",refreshAll);
})();
