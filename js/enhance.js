/* ══════════════════════════════════════════════════════════════
   ГАРМОНИЯ — window.garmVT: обёртка для плавных переходов экранов.

   Выполняет смену DOM внутри document.startViewTransition(), если:
   • браузер поддерживает View Transitions,
   • не включён режим .perf-lite (слабые устройства / Android),
   • пользователь не просил уменьшить анимацию.
   Иначе — просто выполняет действие напрямую (полная деградация).

   Подключается в tabGo() (переключение вкладок) и showTyping()
   (открытие любого раздела) через вызов garmVT(fn).
   ══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(window.garmVT) return;

  var docEl = document.documentElement;

  function lite(){ return docEl.classList.contains("perf-lite"); }
  function reduced(){
    try{ return window.matchMedia("(prefers-reduced-motion:reduce)").matches; }
    catch(e){ return false; }
  }
  function supported(){
    return typeof document.startViewTransition === "function"
        && !lite() && !reduced();
  }

  /* run — функция, которая меняет DOM (перерисовывает экран).
     Возвращаемое значение сохраняется для совместимости. */
  window.garmVT = function(run){
    if(typeof run !== "function") return;
    if(!supported()){ run(); return; }
    var ret;
    try{
      // Колбэк вызывается синхронно — DOM обновляется сразу,
      // затем браузер проигрывает переход между кадрами.
      document.startViewTransition(function(){ ret = run(); });
    }catch(e){
      run();
    }
    return ret;
  };
})();

/* ══════════════════════════════════════════════════════════════
   ГАРМОНИЯ — ленивая загрузка внешних ресурсов по требованию.
   Используется, чтобы тяжёлые библиотеки не блокировали первую
   отрисовку, а подтягивались лишь в момент реальной необходимости.
   ══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(window.garmLoadScript) return;

  window.garmLoadScript=function(src){
    return new Promise(function(res,rej){
      if(document.querySelector('script[data-garm="'+src+'"]')){ res(); return; }
      var s=document.createElement("script");
      s.src=src; s.async=true; s.setAttribute("data-garm",src);
      s.onload=function(){ res(); };
      s.onerror=function(){ rej(new Error(src)); };
      document.head.appendChild(s);
    });
  };

  window.garmLoadCSS=function(href){
    return new Promise(function(res){
      if(document.querySelector('link[data-garm="'+href+'"]')){ res(); return; }
      var l=document.createElement("link");
      l.rel="stylesheet"; l.href=href; l.setAttribute("data-garm",href);
      l.onload=res; l.onerror=res;   // стили карты не критичны — не роняем цепочку
      document.head.appendChild(l);
    });
  };

  // Грузит Leaflet (CSS+JS) один раз, отдаёт Promise. Карта маршрута
  // такси вызывает это перед первым использованием L.
  var _leaflet=null;
  window.ensureLeaflet=function(){
    if(typeof window.L!=="undefined") return Promise.resolve();
    if(_leaflet) return _leaflet;
    var base="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/";
    _leaflet=Promise.all([
      window.garmLoadCSS(base+"leaflet.min.css"),
      window.garmLoadScript(base+"leaflet.min.js")
    ]);
    return _leaflet;
  };
})();
