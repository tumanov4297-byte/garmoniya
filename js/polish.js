/* ═══════════════════════════════════════════════════════════════════
   polish.js — визуальный слой поверх приложения «Гармония».
   Только украшения: не меняет данные, логику и разметку существующих
   экранов. Всё обёрнуто в try/catch и уважает prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var chat = document.getElementById("chat");

  /* ─────────── 1. Появление карточек при прокрутке ─────────── */
  var REVEAL_SEL = ".news-card,.sp-item,.sp-g,.pl-catcard,.ev-card,"
                 + ".staff-card-inline,.pcard,.ord-card,.gcard,.gal-card";
  var io = null;
  if(!reduce && "IntersectionObserver" in window){
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("rv-in"); io.unobserve(e.target); }
      });
    },{ root: chat || null, rootMargin:"0px 0px -6% 0px", threshold:0.05 });
  }
  function armReveals(){
    if(!io || !chat) return;
    try{
      var nodes = chat.querySelectorAll(REVEAL_SEL), batch=[];
      for(var i=0;i<nodes.length;i++){
        var n=nodes[i];
        if(n.dataset.rv) continue;
        if(n.closest(".pl-skel-card,.msg")) continue; // скелетоны и реплики бота не трогаем
        n.dataset.rv="1"; n.classList.add("rv-init"); batch.push(n);
      }
      batch.forEach(function(n,i){
        n.style.setProperty("--rv-d",(Math.min(i,9)*52)+"ms");
        io.observe(n);
        // страховка: если наблюдатель по любой причине не сработает — покажем
        setTimeout(function(){ n.classList.add("rv-in"); },1500);
      });
    }catch(e){}
  }

  /* ─────────── 2. Кросс-фейд при смене раздела ─────────── */
  function triggerViewSwap(){
    if(reduce || !chat) return;
    chat.classList.remove("view-swap"); void chat.offsetWidth; chat.classList.add("view-swap");
  }

  /* Единый наблюдатель: и рефреш появлений, и детект смены вида */
  if(chat && "MutationObserver" in window){
    var pending=false;
    var mo=new MutationObserver(function(records){
      var added=false, removed=false;
      for(var i=0;i<records.length;i++){
        if(records[i].addedNodes.length) added=true;
        if(records[i].removedNodes.length) removed=true;
        if(added&&removed) break;
      }
      if(added && removed) triggerViewSwap();   // контент подменили целиком → фейд
      if(added && !pending){                     // новые узлы → вооружаем появления
        pending=true;
        requestAnimationFrame(function(){ pending=false; armReveals(); tagImages(); });
      }
    });
    mo.observe(chat,{childList:true, subtree:true});
  }

  /* ─────────── 3. Всплеск сердечек на лайке ─────────── */
  function heartBurst(btn){
    if(reduce) return;
    try{
      var r=btn.getBoundingClientRect();
      var cx=r.left+r.width/2, cy=r.top+r.height/2;
      var layer=document.createElement("div"); layer.className="like-burst";
      layer.style.left=cx+"px"; layer.style.top=cy+"px";
      for(var i=0;i<6;i++){
        var h=document.createElement("i");
        var ang=(-90 + (i-2.5)*22) * Math.PI/180;
        var dist=26+Math.random()*22;
        h.style.setProperty("--hx",(Math.cos(ang)*dist).toFixed(1)+"px");
        h.style.setProperty("--hy",(Math.sin(ang)*dist-14).toFixed(1)+"px");
        h.style.setProperty("--hd",(Math.random()*70).toFixed(0)+"ms");
        h.style.setProperty("--hs",(0.7+Math.random()*0.5).toFixed(2));
        layer.appendChild(h);
      }
      document.body.appendChild(layer);
      setTimeout(function(){ layer.remove(); },900);
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
        if(im.closest(".ga-bot-wrap,.asst-live,.onb-bot-live")) continue; // маскот живёт своей жизнью
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
    // минимум 700 мс, чтобы логотип успел «собраться», затем растворяем
    var t0=performance.now();
    function ready(){
      var wait=Math.max(0,700-(performance.now()-t0));
      setTimeout(hide,wait);
    }
    if(document.readyState==="complete") ready();
    else window.addEventListener("load",ready,{once:true});
    setTimeout(hide,3500); // абсолютная страховка
  })();

  /* первичный проход по уже отрисованному контенту */
  if(!reduce){ requestAnimationFrame(function(){ armReveals(); tagImages(); }); }
})();
