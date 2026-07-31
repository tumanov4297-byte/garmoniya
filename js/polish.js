/* ═══════════════════════════════════════════════════════════════════
   polish.js — визуальный слой поверх приложения «Гармония».
   Только украшения: не меняет данные, логику и разметку экранов.
   Всё в try/catch и уважает prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var chat = document.getElementById("chat");
  var shell = document.getElementById("shell");

  /* ─────────── 1. Появление карточек при заходе на экран ───────────
     Только статические списки-меню. Ленту новостей НЕ трогаем —
     она должна листаться как обычная соцлента, без анимаций на каждой карточке. */
  var REVEAL_SEL = ".sp-item,.sp-g,.pl-catcard,.ev-card,.staff-card-inline,.pcard,.ord-card";
  var io = null;
  if(!reduce && "IntersectionObserver" in window){
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ show(e.target); io.unobserve(e.target); }
      });
    },{ root: chat || null, rootMargin:"0px 0px -4% 0px", threshold:0.04 });
  }
  function show(el){
    el.classList.add("rv-in");
    // после появления снимаем все GPU-подсказки, чтобы не оставлять promoted-слои
    var done=function(){ el.classList.remove("rv-init","rv-in"); el.style.removeProperty("--rv-d"); };
    el.addEventListener("transitionend",done,{once:true});
    setTimeout(done,700);
  }
  function armReveals(){
    if(!io || !chat) return;
    try{
      var nodes=chat.querySelectorAll(REVEAL_SEL), batch=[];
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        if(n.dataset.rv) continue;
        if(n.closest(".pl-skel-card,.msg,.news-carousel-track")) continue;
        n.dataset.rv="1"; n.classList.add("rv-init"); batch.push(n);
      }
      batch.forEach(function(n,i){
        n.style.setProperty("--rv-d",(Math.min(i,8)*45)+"ms");
        io.observe(n);
        setTimeout(function(){ if(!n.classList.contains("rv-in")) show(n); },1400); // страховка
      });
    }catch(e){}
  }

  /* ─────────── 2. Кросс-фейд ТОЛЬКО при реальной смене раздела ─────────── */
  function triggerViewSwap(){
    if(reduce || !chat) return;
    if(shell && shell.classList.contains("assistant-mode")) return; // в чате бота не мигаем
    chat.classList.remove("view-swap"); void chat.offsetWidth; chat.classList.add("view-swap");
  }

  /* Наблюдаем ТОЛЬКО прямых детей #chat (subtree:false).
     Обновление лайка/каруселей — это глубокие изменения, они сюда не долетают,
     поэтому лента больше не мигает от лайка и листается чисто. */
  if(chat && "MutationObserver" in window){
    var pending=false;
    var mo=new MutationObserver(function(records){
      var added=false, removed=false;
      for(var i=0;i<records.length;i++){
        if(records[i].addedNodes.length) added=true;
        if(records[i].removedNodes.length) removed=true;
      }
      if(added && removed) triggerViewSwap();
      if(added && !pending){
        pending=true;
        requestAnimationFrame(function(){ pending=false; armReveals(); tagImages(); });
      }
    });
    mo.observe(chat,{childList:true, subtree:false});
  }

  /* ─────────── 3. Всплеск сердечек на лайке ─────────── */
  function heartBurst(btn){
    if(reduce) return;
    try{
      var r=btn.getBoundingClientRect();
      var layer=document.createElement("div"); layer.className="like-burst";
      layer.style.left=(r.left+r.width/2)+"px"; layer.style.top=(r.top+r.height/2)+"px";
      for(var i=0;i<6;i++){
        var h=document.createElement("i");
        var ang=(-90 + (i-2.5)*22) * Math.PI/180;
        var dist=24+Math.random()*20;
        h.style.setProperty("--hx",(Math.cos(ang)*dist).toFixed(1)+"px");
        h.style.setProperty("--hy",(Math.sin(ang)*dist-12).toFixed(1)+"px");
        h.style.setProperty("--hd",(Math.random()*60).toFixed(0)+"ms");
        h.style.setProperty("--hs",(0.7+Math.random()*0.5).toFixed(2));
        layer.appendChild(h);
      }
      document.body.appendChild(layer);
      setTimeout(function(){ layer.remove(); },850);
    }catch(e){}
  }
  if(typeof window.toggleNewsLike==="function"){
    var _like=window.toggleNewsLike;
    window.toggleNewsLike=function(id,btn){
      var wasLiked = btn && btn.classList.contains("liked");
      var res=_like.apply(this,arguments);
      if(btn && !wasLiked) heartBurst(btn);
      return res;
    };
  }

  /* ─────────── 4. Мягкое проявление картинок ─────────── */
  function tagImages(){
    if(reduce || !chat) return;
    try{
      var imgs=chat.querySelectorAll("img");
      for(var i=0;i<imgs.length;i++){
        var im=imgs[i];
        if(im.dataset.fx) continue;
        if(im.closest(".ga-bot-wrap,.asst-live,.onb-bot-live")) continue;
        if(im.classList.contains("ga-bot-img")) continue;
        im.dataset.fx="1"; im.classList.add("imgfx");
        if(im.complete && im.naturalWidth>0){ im.classList.add("imgfx-in"); }
        else{
          im.addEventListener("load",function(){ this.classList.add("imgfx-in"); },{once:true});
          im.addEventListener("error",function(){ this.classList.add("imgfx-in"); },{once:true});
        }
      }
    }catch(e){}
  }

  /* ─────────── 5. Брендовый сплэш при запуске ─────────── */
  (function splash(){
    var s=document.getElementById("appSplash");
    if(!s) return;
    function hide(){
      if(s.classList.contains("hide")) return;
      s.classList.add("hide");
      setTimeout(function(){ if(s.parentNode) s.remove(); },560);
    }
    var t0=performance.now();
    function ready(){ setTimeout(hide,Math.max(0,700-(performance.now()-t0))); }
    if(document.readyState==="complete") ready();
    else window.addEventListener("load",ready,{once:true});
    setTimeout(hide,3500);
  })();

  if(!reduce){ requestAnimationFrame(function(){ armReveals(); tagImages(); }); }
})();
