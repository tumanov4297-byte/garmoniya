/* ══════════════════════════════════════════════════════════════
   ГАРМОНИЯ — перетаскиваемый ползунок нижнего меню.

   Тянешь «пилюлю» пальцем вдоль таб-бара — она следует за пальцем,
   подсвечивая вкладку под ней; на отпускании пружиной доводится
   до ближайшей вкладки и открывает её. Обычный тап работает как
   раньше (порог THRESHOLD отделяет тап от перетаскивания).

   Чистое добавление: existing-код не меняется, всё через globals.
   ══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(window.__garmTabDrag) return; window.__garmTabDrag=true;

  var THRESHOLD = 6; // px — дальше этого жест считается перетаскиванием

  function init(){
    var bar = document.getElementById("tabBar");
    var pill = document.getElementById("tbPill");
    if(!bar || !pill) return;

    var down=false, moved=false, justDragged=false;
    var slots=[], pillW=0, minX=0, maxX=0, barLeft=0, barClientLeft=0;
    var downX=0, lastX=0, pointerId=null;

    // Ближайшая вкладка к экранной координате X.
    function nearest(clientX){
      var best=slots[0], bd=Infinity;
      for(var i=0;i<slots.length;i++){
        var d=Math.abs(slots[i].cx-clientX);
        if(d<bd){bd=d;best=slots[i];}
      }
      return best;
    }

    // Замер геометрии в момент касания (layout статичен во время жеста).
    function measure(){
      var br=bar.getBoundingClientRect();
      barLeft=br.left; barClientLeft=bar.clientLeft;
      slots=[];
      bar.querySelectorAll(".tb").forEach(function(btn){
        var r=btn.getBoundingClientRect();
        slots.push({
          btn:btn,
          x:r.left-br.left-barClientLeft+3,   // та же формула, что в movePillTo
          w:r.width-6,
          cx:r.left+r.width/2
        });
      });
      if(!slots.length) return false;
      pillW=slots[0].w;
      minX=slots[0].x;
      maxX=slots[slots.length-1].x;
      return true;
    }

    // Ставит пилюлю по центру под палец, с ограничением по краям.
    function setPill(clientX){
      var x=clientX-barLeft-barClientLeft-pillW/2;
      if(x<minX)x=minX;
      if(x>maxX)x=maxX;
      pill.style.transition="none";
      pill.style.width=pillW+"px";
      pill.style.transform="translate3d("+x+"px,0,0) scale(1.05)";
    }

    // Живая подсветка вкладки под пальцем.
    function highlight(clientX){
      var n=nearest(clientX);
      bar.querySelectorAll(".tb").forEach(function(b){b.classList.remove("active");});
      n.btn.classList.add("active");
    }

    // Открыть конкретную вкладку без опоры на event (аналог tabGo).
    function activate(btn){
      var oc=btn.getAttribute("onclick")||"";
      var m=/tabGo\(['"](\w+)['"]\)/.exec(oc);
      var t=m?m[1]:null;
      bar.classList.remove("nav-hidden");
      bar.querySelectorAll(".tb").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");
      if(typeof window.movePillTo==="function") window.movePillTo(btn);
      var run=function(){
        if(t==="home"&&window.showMainMenu)showMainMenu();
        else if(t==="menu"&&window.showMenuPage)showMenuPage();
        else if(t==="cart"&&window.openCart)openCart();
        else if(t==="orders"&&window.openOrdersPanel)openOrdersPanel();
        else if(t==="profile"&&window.openProfilePanel)openProfilePanel();
      };
      if((t==="home"||t==="menu")&&window.garmVT) window.garmVT(run);
      else run();
    }

    bar.addEventListener("pointerdown",function(e){
      if(e.button && e.button!==0) return;   // только основная кнопка/палец
      if(!measure()) return;
      down=true; moved=false;
      downX=e.clientX; lastX=e.clientX; pointerId=e.pointerId;
      try{ bar.setPointerCapture(e.pointerId); }catch(_){}
    });

    bar.addEventListener("pointermove",function(e){
      if(!down) return;
      lastX=e.clientX;
      if(!moved){
        if(Math.abs(e.clientX-downX) < THRESHOLD) return; // ещё тап, не тянем
        moved=true;
        pill.classList.add("tb-pill-drag");
      }
      setPill(e.clientX);
      highlight(e.clientX);
      e.preventDefault();
    });

    function end(){
      if(!down) return;
      down=false;
      try{ if(pointerId!=null) bar.releasePointerCapture(pointerId); }catch(_){}
      pointerId=null;
      if(moved){
        moved=false;
        pill.classList.remove("tb-pill-drag");
        pill.style.transition="";   // вернуть CSS-пружину; transform/width
                                    // перезапишет movePillTo внутри activate()
        justDragged=true;           // проглотить следующий синтетический click
        setTimeout(function(){ justDragged=false; },400);
        activate(nearest(lastX).btn);
      }
      // moved=false — это был тап: пилюлю не трогаем, сработает штатный onclick
    }
    bar.addEventListener("pointerup",end);
    bar.addEventListener("pointercancel",end);

    // После настоящего перетаскивания гасим ровно один click,
    // чтобы вкладка не открылась дважды.
    bar.addEventListener("click",function(e){
      if(justDragged){ e.stopPropagation(); e.preventDefault(); justDragged=false; }
    },true);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
