/* ═══════════════════════════════════════════════════════════════════
   mascot3d.js — 3D-робот «Гармония» в отдельном окне чат-бота.
   Открывается кнопкой openBot3D(): полноэкранная сцена, свободное
   вращение на 360° с инерцией. Three.js и модель грузятся лениво только
   при открытии и только на способных устройствах; при закрытии WebGL
   освобождается. Слабое устройство / нет WebGL / reduced-motion / ошибка
   → показывается 2D-картинка робота. Ничего в данных не меняется.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  function isLite(){ return document.documentElement.classList.contains("perf-lite"); }

  function capable(){
    try{
      if((navigator.deviceMemory||4) < 2) return false;
      var c=document.createElement("canvas");
      return !!(c.getContext("webgl")||c.getContext("experimental-webgl"));
    }catch(e){ return false; }
  }

  var loading=null, cachedScene=null, active=null, overlay=null;

  function loadScript(src){
    return new Promise(function(res,rej){
      var s=document.createElement("script"); s.src=src; s.async=true;
      s.onload=res; s.onerror=function(){ rej(new Error(src)); };
      document.head.appendChild(s);
    });
  }
  function ensureLibs(){
    if(window.THREE && window.THREE.GLTFLoader) return Promise.resolve();
    if(loading) return loading;
    loading = loadScript("js/lib/three.min.js?v=r137")
      .then(function(){ return loadScript("js/lib/GLTFLoader.js?v=r137"); });
    return loading;
  }
  function getModel(){
    return new Promise(function(res,rej){
      if(cachedScene){ res(cachedScene.clone(true)); return; }
      new window.THREE.GLTFLoader().load("models/robot.glb?v=2", function(gltf){
        gltf.scene.traverse(function(o){
          if(o.isMesh && o.material){
            var m=o.material;
            if("metalness" in m) m.metalness=Math.min(m.metalness!=null?m.metalness:0.2,0.25);
            if("roughness" in m) m.roughness=Math.max(m.roughness!=null?m.roughness:0.6,0.5);
            m.needsUpdate=true;
          }
        });
        cachedScene=gltf.scene;
        res(cachedScene.clone(true));
      }, undefined, rej);
    });
  }

  function teardown(){
    if(!active) return;
    var a=active; active=null;
    try{ cancelAnimationFrame(a.raf); }catch(e){}
    try{ window.removeEventListener("resize",a.resize); }catch(e){}
    try{ a.renderer.dispose(); if(a.renderer.forceContextLoss) a.renderer.forceContextLoss(); }catch(e){}
    try{ if(a.renderer.domElement.parentNode) a.renderer.domElement.remove(); }catch(e){}
  }

  function attach(holder,fallback){
    var THREE=window.THREE;
    var w=holder.clientWidth||320, h=holder.clientHeight||360;

    var renderer;
    try{ renderer=new THREE.WebGLRenderer({alpha:true,antialias:!isLite(),powerPreference:"low-power"}); }
    catch(e){ return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, isLite()?1.25:2));
    renderer.setSize(w,h,false);
    if("outputEncoding" in renderer) renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.domElement.className="bot3d-canvas";
    holder.appendChild(renderer.domElement);

    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(30,w/h,0.05,60);
    camera.position.set(0,0.05,2.9);
    scene.add(new THREE.HemisphereLight(0xffffff,0xbfeae6,1.0));
    var key=new THREE.DirectionalLight(0xffffff,1.35); key.position.set(1.6,2.4,2.2); scene.add(key);
    var fill=new THREE.DirectionalLight(0x9fe0da,0.55); fill.position.set(-2.2,0.6,1.2); scene.add(fill);
    var rim=new THREE.DirectionalLight(0xe8c57c,0.6); rim.position.set(-0.6,1.2,-2.4); scene.add(rim);

    var pivot=new THREE.Group(); scene.add(pivot);
    var state={renderer:renderer,raf:0,ready:false,
      dragging:false,lastX:0,lastY:0,rotY:0,rotX:0,velY:0,velX:0,t0:performance.now(),
      zoom:0.72,          // робот меньше по умолчанию
      pointers:{},        // для щипка (pinch)
      pinchDist:0,pinchZoom:0};
    active=state;

    getModel().then(function(model){
      if(active!==state) return;
      var box=new THREE.Box3().setFromObject(model);
      var size=box.getSize(new THREE.Vector3());
      var center=box.getCenter(new THREE.Vector3());
      var maxDim=Math.max(size.x,size.y,size.z)||1;
      var s=1.9/maxDim;
      model.scale.setScalar(s);
      model.position.set(-center.x*s,-center.y*s,-center.z*s);
      pivot.add(model);
      state.model=model; state.baseScale=s;
      state.introStart=performance.now();   // приветственный кивок при появлении
      state.ready=true;
      if(fallback) fallback.style.opacity="0";
      renderer.domElement.classList.add("show");
    }).catch(function(){ teardown(); if(fallback) fallback.style.opacity="1"; });

    var el=renderer.domElement;
    el.style.touchAction="none"; // вся площадь — под вращение (360°) и щипок (масштаб)
    function pcount(){ return Object.keys(state.pointers).length; }
    function pdist(){
      var ks=Object.keys(state.pointers); if(ks.length<2) return 0;
      var a=state.pointers[ks[0]], b=state.pointers[ks[1]];
      return Math.hypot(a.x-b.x,a.y-b.y);
    }
    function clampZoom(z){ return Math.max(0.35,Math.min(2.2,z)); }
    function down(e){
      state.pointers[e.pointerId]={x:e.clientX,y:e.clientY};
      try{el.setPointerCapture(e.pointerId);}catch(x){}
      if(pcount()===1){ state.dragging=true; state.moved=false; state.downT=performance.now(); state.lastX=e.clientX; state.lastY=e.clientY; state.velY=0; state.velX=0; }
      else if(pcount()===2){ state.dragging=false; state.pinchDist=pdist(); state.pinchZoom=state.zoom; } // начали щипок
    }
    function move(e){
      if(!state.pointers[e.pointerId]) return;
      state.pointers[e.pointerId]={x:e.clientX,y:e.clientY};
      if(pcount()>=2){                                  // щипок → масштаб
        var d=pdist();
        if(state.pinchDist>0 && d>0) state.zoom=clampZoom(state.pinchZoom*(d/state.pinchDist));
        return;
      }
      if(!state.dragging)return;                        // одним пальцем → вращение
      var dx=(e.clientX-state.lastX), dy=(e.clientY-state.lastY);
      if(Math.abs(dx)>3||Math.abs(dy)>3) state.moved=true;
      state.rotY+=dx*0.01; state.rotX+=dy*0.01; state.velY=dx*0.01; state.velX=dy*0.01;
      state.lastX=e.clientX; state.lastY=e.clientY;
    }
    function up(e){
      if(state.dragging && !state.moved && (performance.now()-state.downT)<260){ state.hopStart=performance.now(); }
      if(e && e.pointerId!=null) delete state.pointers[e.pointerId];
      if(pcount()<2) state.pinchDist=0;
      if(pcount()===1){ // остался один палец после щипка — переносим точку отсчёта, чтобы не дёрнулось
        var k=Object.keys(state.pointers)[0]; state.lastX=state.pointers[k].x; state.lastY=state.pointers[k].y; state.dragging=true; state.moved=true;
      }
      if(pcount()===0) state.dragging=false;
    }
    el.addEventListener("pointerdown",down);
    el.addEventListener("pointermove",move);
    el.addEventListener("pointerup",up); el.addEventListener("pointercancel",up); el.addEventListener("pointerleave",up);
    // колесо мыши — тоже масштаб (для десктопа/РЕД ОС)
    el.addEventListener("wheel",function(e){ e.preventDefault(); state.zoom=clampZoom(state.zoom - e.deltaY*0.0012); },{passive:false});

    function frame(){
      state.raf=requestAnimationFrame(frame);
      if(!state.ready || document.hidden) return;
      var t=(performance.now()-state.t0)/1000;
      if(state.dragging){
        // тянем напрямую
      }else{
        state.rotY+=state.velY; state.rotX+=state.velX;   // инерция
        state.velY*=0.94; state.velX*=0.94;
        if(Math.abs(state.velY)<0.0002 && Math.abs(state.velX)<0.0002){ state.rotY+=0.005; } // тихое авто-вращение
      }
      pivot.rotation.y=state.rotY;

      // плавный масштаб (щипок/кнопки/колесо)
      if(state.zoomCur==null) state.zoomCur=state.zoom;
      state.zoomCur+=(state.zoom-state.zoomCur)*0.18;
      pivot.scale.setScalar(state.zoomCur);

      // ── «Живость» ──
      var extraX=0, hopY=0, squash=0;
      // приветственный кивок при появлении (затухает за ~1.6 c)
      if(state.introStart){
        var ie=(performance.now()-state.introStart)/1000;
        if(ie<1.7){ extraX+=Math.sin(ie*7)*0.16*Math.exp(-ie*1.9); }
        else state.introStart=0;
      }
      // радостный подскок при тапе (~0.6 c)
      if(state.hopStart){
        var he=(performance.now()-state.hopStart)/1000;
        if(he<0.62){ var k=he/0.62; hopY+=Math.sin(k*Math.PI)*0.14; squash+=Math.sin(k*Math.PI)*0.05; extraX+=Math.sin(k*Math.PI*2)*0.05; }
        else state.hopStart=0;
      }
      pivot.rotation.x=state.rotX+extraX;
      pivot.rotation.z=Math.sin(t*0.7)*0.03;                 // лёгкое покачивание
      pivot.position.y=Math.sin(t*1.3)*0.05 + hopY;          // парение + подскок
      // дыхание корпуса + сжатие при подскоке
      if(state.model && state.baseScale){
        var breathe=1+Math.sin(t*1.8)*0.012;
        state.model.scale.set(state.baseScale*breathe*(1-squash*0.5), state.baseScale*breathe*(1+squash), state.baseScale*breathe*(1-squash*0.5));
      }
      renderer.render(scene,camera);
    }
    state.raf=requestAnimationFrame(frame);

    state.resize=function(){
      var nw=holder.clientWidth||w, nh=holder.clientHeight||h;
      if(nw===w && nh===h) return; w=nw; h=nh;
      camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h,false);
    };
    window.addEventListener("resize",state.resize,{passive:true});
  }

  // ─── Открыть 3D в отдельном окне ───
  window.openBot3D=function(){
    if(overlay) return;
    var theme=("");
    try{ theme=localStorage.getItem("bot3dTheme")||"cosmos"; }catch(e){ theme="cosmos"; }
    overlay=document.createElement("div");
    overlay.className="bot3d-modal bot3d-photos theme-"+theme; overlay.setAttribute("role","dialog"); overlay.setAttribute("aria-modal","true");
    var eqBars=""; for(var i=0;i<7;i++){ eqBars+='<i style="--i:'+i+'"></i>'; }
    var N=38, waveBars="";
    for(var wi=0;wi<N;wi++){ var dd=Math.abs(wi-(N-1)/2)/((N-1)/2); var amp=Math.max(0.12,1-dd*dd); waveBars+='<i style="--i:'+wi+';--amp:'+amp.toFixed(2)+'"></i>'; }
    overlay.innerHTML=
      '<div class="b3m-bg" id="b3mBg"><div class="b3m-photos" id="b3mPhotos"></div><canvas class="b3m-nebula" id="b3mNebula"></canvas><div class="b3m-glow"></div><div class="b3m-scrim"></div></div>'
      +'<div class="b3m-bar"><b>Робот «Гармония»</b>'
        +'<div class="b3m-bar-actions">'
          +'<button class="b3m-theme" id="b3mTheme" aria-label="Сменить фон">'+(theme==="cosmos"?"💠":"🌌")+'</button>'
          +'<button class="b3m-x" aria-label="Закрыть">✕</button>'
        +'</div></div>'
      +'<div class="b3m-stage"><div class="b3m-holder" id="b3mHolder">'
      +'<img src="img/bot-live.webp" class="bot3d-fallback" alt="Робот Гармония"></div>'
      +'<div class="b3m-zoom"><button class="b3z-btn" onclick="bot3dZoom(0.2)" aria-label="Увеличить">＋</button>'
      +'<button class="b3z-btn" onclick="bot3dZoom(-0.2)" aria-label="Уменьшить">－</button></div></div>'
      +'<div class="b3m-foot">'
      +'<div class="ai-panel">'
        +'<div class="ai-panel-hd"><span class="ai-live-dot"></span>Голосовой помощник<span class="ai-soon-tag">в разработке</span></div>'
        +'<div class="ai-wave-wrap">'
          +'<canvas class="ai-wave-canvas" id="aiWaveCanvas"></canvas>'
          +'<button class="ai-mic" id="aiMic" aria-label="Говорить">'
            +'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>'
          +'</button>'
        +'</div>'
        +'<div class="ai-state" id="aiState">Нажмите и начните говорить</div>'
        +'<div class="ai-heard" id="aiHeard" aria-live="polite"></div>'
      +'</div>'
      +'</div>';
    document.body.appendChild(overlay);
    document.body.classList.add("bot3d-lock");
    requestAnimationFrame(function(){ overlay.classList.add("open"); });

    // ── Космический фон робота: гиф — основной, картинки сменяются раз в 10 минут ──
    (function initBotBg(){
      var host=overlay.querySelector("#b3mPhotos"); if(!host) return;
      var LIST=[
        "img/bot-bg/space-main.gif",                                  // основной — анимированный гиф
        "img/bot-bg/space-01.jpg","img/bot-bg/space-02.jpg",
        "img/bot-bg/space-03.jpg","img/bot-bg/space-04.jpg",
        "img/bot-bg/space-05.jpg","img/bot-bg/space-06.jpg"
      ];
      var slides=LIST.map(function(src,i){
        var d=document.createElement("div");
        d.className="b3m-photo"+(i===0?" on":"");
        if(i===0) d.style.backgroundImage="url('"+src+"')";        // основной грузим сразу
        host.appendChild(d);
        return d;
      });
      var idx=0;
      function show(n){
        n=(n+slides.length)%slides.length;
        if(n===idx) return;
        var s=slides[n];
        if(!s.style.backgroundImage) s.style.backgroundImage="url('"+LIST[n]+"')"; // ленивая подгрузка
        slides[idx].classList.remove("on");
        s.classList.add("on");
        idx=n;
      }
      // Каждые 10 минут — плавно следующий фон. Таймер живёт на overlay,
      // чистится в closeBot3D (в т.ч. при закрытии из голосового сценария).
      overlay._bgTimer=setInterval(function(){ show(idx+1); }, 10*60*1000);
    })();

    // ── Туманность (рисуется кодом, статично — без нагрузки на кадр) ──
    function hexA(hex,a){ var n=parseInt(hex.slice(1),16); return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")"; }
    function paintNebula(){
      var cv=overlay.querySelector("#b3mNebula"); if(!cv) return;
      var ctx=cv.getContext("2d"); var dpr=Math.min(window.devicePixelRatio||1, isLite()?1.3:2);
      var W=cv.clientWidth||overlay.clientWidth, Hh=cv.clientHeight||overlay.clientHeight;
      cv.width=Math.max(1,W*dpr); cv.height=Math.max(1,Hh*dpr);
      var w=cv.width, h=cv.height;
      var cosmos=overlay.classList.contains("theme-cosmos");
      var blobs=cosmos
        ? [[0.22,0.26,"#3a6cff"],[0.78,0.22,"#8a4bd8"],[0.6,0.7,"#1ec8be"],[0.12,0.66,"#25306e"],[0.88,0.6,"#5a3aa0"],[0.5,0.42,"#2b6cff"]]
        : [[0.24,0.24,"#2ec3b8"],[0.8,0.22,"#e8c57c"],[0.6,0.72,"#1b8585"],[0.16,0.7,"#33b0a6"],[0.86,0.62,"#7fe0d4"],[0.5,0.4,"#28a79f"]];
      ctx.clearRect(0,0,w,h);
      ctx.globalCompositeOperation="lighter";
      blobs.forEach(function(b){
        var x=b[0]*w, y=b[1]*h, rad=Math.max(w,h)*(0.42+Math.random()*0.16);
        var g=ctx.createRadialGradient(x,y,0,x,y,rad);
        g.addColorStop(0,hexA(b[2],cosmos?0.26:0.22)); g.addColorStop(0.5,hexA(b[2],0.08)); g.addColorStop(1,hexA(b[2],0));
        ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      });
      // звёзды
      ctx.globalCompositeOperation="source-over";
      var stars=Math.min(isLite()?90:220, (w*h)/(dpr*6000));
      for(var i=0;i<stars;i++){
        var sx=Math.random()*w, sy=Math.random()*h, sr=Math.random()*1.5*dpr;
        ctx.beginPath(); ctx.arc(sx,sy,sr,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,"+(0.25+Math.random()*0.65).toFixed(2)+")"; ctx.fill();
      }
    }
    requestAnimationFrame(paintNebula);

    // ── Точечная волна вокруг микрофона (canvas-частицы) ──
    function initWave(){
      var cv=overlay.querySelector("#aiWaveCanvas"); if(!cv) return null;
      var ctx=cv.getContext("2d"); var dpr=Math.min(window.devicePixelRatio||1, isLite()?1.3:2);
      function size(){ cv.width=Math.max(1,(cv.clientWidth||300)*dpr); cv.height=Math.max(1,(cv.clientHeight||100)*dpr); }
      size();
      var lite=isLite(), cols=lite?52:110, t=0, raf=0, stopped=false;
      function render(){
        var w=cv.width, h=cv.height, midY=h*0.5;
        ctx.clearRect(0,0,w,h);
        var listening=overlay.classList.contains("ai-listening");
        var base=(listening?0.46:0.24)*h;
        for(var i=0;i<cols;i++){
          var nx=i/(cols-1)*2-1, env=Math.max(0,1-nx*nx);
          var ph=t + i*0.2;
          var a=Math.sin(ph)*0.6 + Math.sin(ph*0.5+1.3)*0.4;
          var amp=base*env*(0.45+0.55*Math.abs(a));
          var x=(i/(cols-1))*w;
          var dots=2+Math.floor(env*(listening?9:6));
          for(var d=0;d<dots;d++){
            var yy=midY+(d/(Math.max(1,dots-1))-0.5)*2*amp;
            var r=dpr*(0.7+env*1.3), al=0.12+env*0.72;
            ctx.beginPath(); ctx.arc(x,yy,r,0,Math.PI*2);
            ctx.fillStyle="rgba(120,240,225,"+al.toFixed(2)+")"; ctx.fill();
          }
        }
      }
      function loop(){ if(stopped) return; raf=requestAnimationFrame(loop); if(document.hidden) return; t+=0.035; render(); }
      if(lite){ render(); } else { loop(); }         // на слабых — статичная волна
      return { stop:function(){ stopped=true; cancelAnimationFrame(raf); }, resize:function(){ size(); render(); } };
    }
    overlay._wave=initWave();
    overlay._repaintBg=paintNebula;
    overlay._onResize=function(){ if(overlay._repaintBg) overlay._repaintBg(); if(overlay._wave&&overlay._wave.resize) overlay._wave.resize(); };
    window.addEventListener("resize",overlay._onResize,{passive:true});

    // переключение фона
    overlay.querySelector("#b3mTheme").onclick=function(){
      var toCosmos=!overlay.classList.contains("theme-cosmos");
      overlay.classList.toggle("theme-cosmos",toCosmos);
      overlay.classList.toggle("theme-garmoniya",!toCosmos);
      this.textContent=toCosmos?"💠":"🌌";
      try{ localStorage.setItem("bot3dTheme",toCosmos?"cosmos":"garmoniya"); }catch(e){}
      paintNebula();
    };

    // ── Голосовое общение (Web Speech API): слушаем → показываем → отвечаем ──
    var mic=overlay.querySelector("#aiMic"), aiState=overlay.querySelector("#aiState");
    var heard=overlay.querySelector("#aiHeard"), listening=false, rec=null;
    function toast(m){ if(typeof window.showToast==="function") window.showToast(m); }
    function buzz(n){ if(navigator.vibrate){ try{navigator.vibrate(n);}catch(e){} } }

    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;

    function stopListening(){
      listening=false;
      overlay.classList.remove("ai-listening");
      try{ if(rec) rec.stop(); }catch(e){}
    }

    // Произносит ответ вслух — важно для пользователей, которым трудно читать.
    function speak(text){
      try{
        if(!window.speechSynthesis || !text) return;
        window.speechSynthesis.cancel();
        var u=new SpeechSynthesisUtterance(String(text).slice(0,300));
        u.lang="ru-RU"; u.rate=.95; u.pitch=1;
        window.speechSynthesis.speak(u);
      }catch(e){}
    }

    // Отдаём распознанный вопрос боту — он отвечает в чате.
    function ask(q){
      heard.textContent="«"+q+"»";
      aiState.textContent="Секунду…";
      speak("Ищу ответ");
      setTimeout(function(){
        window.closeBot3D();
        if(typeof askFlow==="function") setTimeout(function(){ askFlow(q); },320);
      },620);
    }

    mic.onclick=function(){
      if(listening){ stopListening(); aiState.textContent="Нажмите и говорите"; return; }
      if(!SR){
        toast("Голосовой ввод не поддерживается в этом браузере");
        aiState.textContent="Голос недоступен — напишите вопрос в чате";
        return;
      }
      try{
        rec=new SR();
        rec.lang="ru-RU"; rec.interimResults=true; rec.maxAlternatives=1; rec.continuous=false;
      }catch(e){ toast("Не удалось запустить микрофон"); return; }

      listening=true; heard.textContent="";
      overlay.classList.add("ai-listening");
      aiState.textContent="Слушаю…"; buzz(12);

      rec.onresult=function(ev){
        var txt="",fin=false;
        for(var i=ev.resultIndex;i<ev.results.length;i++){
          txt+=ev.results[i][0].transcript;
          if(ev.results[i].isFinal) fin=true;
        }
        txt=txt.trim();
        if(txt) heard.textContent="«"+txt+"»";
        if(fin && txt){ stopListening(); buzz(8); ask(txt); }
      };
      rec.onerror=function(ev){
        stopListening();
        if(ev && ev.error==="not-allowed"){
          aiState.textContent="Нет доступа к микрофону";
          toast("Разрешите доступ к микрофону в настройках браузера");
        }else if(ev && ev.error==="no-speech"){
          aiState.textContent="Не расслышал — попробуйте ещё раз";
        }else{
          aiState.textContent="Нажмите и говорите";
        }
      };
      rec.onend=function(){
        if(listening){ stopListening(); aiState.textContent="Нажмите и говорите"; }
      };
      try{ rec.start(); }catch(e){ stopListening(); toast("Микрофон занят"); }
    };

    var holder=overlay.querySelector("#b3mHolder");
    var fb=overlay.querySelector(".bot3d-fallback");
    function close(){
      try{ if(window.speechSynthesis) window.speechSynthesis.cancel(); }catch(e){}
      try{ stopListening(); }catch(e){}
      window.closeBot3D();
    }
    overlay.querySelector(".b3m-x").onclick=close;
    overlay.addEventListener("click",function(e){ if(e.target===overlay) close(); });
    document.addEventListener("keydown",escClose);

    if(reduce || !capable()){ /* нет 3D → останется 2D-картинка */ return; }
    ensureLibs().then(function(){ if(overlay) attach(holder,fb); }).catch(function(){});
  };
  function escClose(e){ if(e.key==="Escape") window.closeBot3D(); }
  window.bot3dZoom=function(d){ if(active){ active.zoom=Math.max(0.35,Math.min(2.2,active.zoom+d)); } };
  window.closeBot3D=function(){
    document.removeEventListener("keydown",escClose);
    teardown();
    document.body.classList.remove("bot3d-lock");
    if(overlay){
      var o=overlay; overlay=null;
      try{ if(o._bgTimer) clearInterval(o._bgTimer); }catch(e){}
      try{ if(o._wave) o._wave.stop(); }catch(e){}
      try{ window.removeEventListener("resize",o._onResize); }catch(e){}
      o.classList.remove("open");
      setTimeout(function(){ if(o.parentNode)o.remove(); },300);
    }
  };
})();
