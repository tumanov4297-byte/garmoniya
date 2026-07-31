/* ═══════════════════════════════════════════════════════════════════
   extra.js — самодостаточный слой удобств поверх приложения «Гармония».
   Ничего не меняет в логике записи/заявок/услуг — только добавляет.
   Всё в try/catch, уважает prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var chat = document.getElementById("chat");
  function toast(m){ if(typeof showToast==="function") showToast(m); }

  /* ─────────── 1. PWA: установка на экран + офлайн ─────────── */
  if("serviceWorker" in navigator){
    window.addEventListener("load",function(){
      navigator.serviceWorker.register("./sw.js").catch(function(){});
    });
  }

  /* ─────────── 2. Кнопка «Наверх» ─────────── */
  (function(){
    if(!chat) return;
    var btn=document.createElement("button");
    btn.id="backTop"; btn.type="button"; btn.setAttribute("aria-label","Наверх");
    btn.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    var ticking=false;
    chat.addEventListener("scroll",function(){
      if(ticking) return; ticking=true;
      requestAnimationFrame(function(){ btn.classList.toggle("show", chat.scrollTop>620); ticking=false; });
    },{passive:true});
    btn.onclick=function(){ chat.scrollTo({top:0,behavior:reduce?"auto":"smooth"}); };
  })();

  /* ─────────── 3. Тонкая полоса загрузки при переходах ─────────── */
  var progEl=null, progT=0;
  function progStart(){
    if(reduce) return;
    if(!progEl){ progEl=document.createElement("div"); progEl.id="navProgress"; document.body.appendChild(progEl); }
    progEl.classList.remove("done"); progEl.classList.remove("go"); void progEl.offsetWidth; progEl.classList.add("go");
    clearTimeout(progT); progT=setTimeout(progDone,520);
  }
  function progDone(){ if(progEl){ progEl.classList.add("done"); } }
  ["tabGo","goBack","showMainMenu","openCart","openOrdersPanel","openProfilePanel"].forEach(function(n){
    if(typeof window[n]==="function"){ var o=window[n]; window[n]=function(){ progStart(); return o.apply(this,arguments); }; }
  });

  /* ─────────── 4. Плавный кросс-фейд смены темы + автотема ─────────── */
  if(typeof window.toggleDarkTheme==="function"){
    var origTheme=window.toggleDarkTheme;
    window.toggleDarkTheme=function(){
      try{ localStorage.setItem("themeManual","1"); }catch(e){}
      if(reduce){ return origTheme.apply(this,arguments); }
      var ov=document.createElement("div"); ov.className="theme-fade"; document.body.appendChild(ov);
      requestAnimationFrame(function(){ ov.classList.add("show"); });
      setTimeout(function(){ origTheme.call(window); },170);
      setTimeout(function(){ ov.classList.remove("show"); },330);
      setTimeout(function(){ if(ov.parentNode) ov.remove(); },700);
    };
  }
  (function autoTheme(){
    try{
      if(localStorage.getItem("themeManual")==="1") return;   // пользователь выбрал сам — не трогаем
      if(typeof darkMode==="undefined"||typeof applyTheme!=="function") return;
      var h=new Date().getHours();
      var wantDark=(h>=20 || h<7);                            // тёмная после заката
      if(wantDark!==darkMode){
        darkMode=wantDark;
        localStorage.setItem("darkMode",wantDark?"1":"0");
        applyTheme();
        if(typeof window.hdrRefresh==="function") window.hdrRefresh();
      }
    }catch(e){}
  })();

  /* ─────────── 5. Копирование телефона/адреса по тапу ─────────── */
  document.addEventListener("click",function(e){
    var el=e.target && e.target.closest && e.target.closest('a[href^="tel:"],[data-copy]');
    if(!el) return;
    var val=el.getAttribute("data-copy") || (el.getAttribute("href")||"").replace("tel:","").trim();
    if(!val) return;
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(val).then(function(){ toast("📋 Скопировано: "+val); }).catch(function(){});
    }
  },true);

  /* ─────────── 6. Хаптик-отклик на ключевых действиях ─────────── */
  if(navigator.vibrate){
    document.addEventListener("click",function(e){
      var t=e.target && e.target.closest && e.target.closest(".tb,.hdr-ico-btn,.hdr-avatar,.nva-like,.hnc-cal,[data-haptic]");
      if(t){ try{ navigator.vibrate(7); }catch(e2){} }
    },true);
  }

  /* ─────────── 7. Индикатор офлайна ─────────── */
  (function(){
    var bar=document.createElement("div");
    bar.id="offlineBar"; bar.textContent="Нет сети — показываем сохранённое";
    document.body.appendChild(bar);
    function upd(){ bar.classList.toggle("show", !navigator.onLine); }
    window.addEventListener("online",function(){ upd(); toast("🌐 Соединение восстановлено"); });
    window.addEventListener("offline",upd);
    upd();
  })();

  /* ─────────── 8. Ленивая загрузка картинок контента ─────────── */
  function lazify(){
    if(!chat) return;
    try{
      var imgs=chat.querySelectorAll("img:not([data-lz])");
      for(var i=0;i<imgs.length;i++){
        var im=imgs[i];
        if(im.closest(".ga-bot-wrap,.asst-live,.onb-bot-live")||im.classList.contains("ga-bot-img")){ im.setAttribute("data-lz","1"); continue; }
        im.setAttribute("data-lz","1");
        if(!im.hasAttribute("loading")) im.setAttribute("loading","lazy");
        if(!im.hasAttribute("decoding")) im.setAttribute("decoding","async");
      }
    }catch(e){}
  }
  if(chat && "MutationObserver" in window){
    var lzPend=false;
    new MutationObserver(function(){
      if(lzPend) return; lzPend=true;
      requestAnimationFrame(function(){ lzPend=false; lazify(); });
    }).observe(chat,{childList:true,subtree:false});
  }
  lazify();

  /* ─────────── 9. Праздничный акцент в шапке ─────────── */
  (function holiday(){
    var hdr=document.getElementById("appHdr"); if(!hdr) return;
    var now=new Date(), mo=now.getMonth()+1, day=now.getDate(), emo="", cls="";
    if((mo===12&&day>=20)||(mo===1&&day<=10)){ emo="❄️"; cls="hl-ny"; }
    else if(mo===2&&day>=20&&day<=24){ emo="⭐"; cls="hl-def"; }
    else if(mo===3&&day>=6&&day<=8){ emo="🌷"; cls="hl-wom"; }
    else if(mo===5&&day>=1&&day<=9){ emo="🎗️"; cls="hl-vict"; }
    else if(mo===6&&day===8){ emo="💚"; cls="hl-soc"; } // День соцработника
    if(!emo) return;
    hdr.classList.add("hdr-holiday",cls);
    var b=document.createElement("span"); b.className="hdr-holiday-emo"; b.textContent=emo; b.setAttribute("aria-hidden","true");
    hdr.appendChild(b);
  })();

})();
