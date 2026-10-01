/* ═══════════════════════════════════════════════════════════════════
   ui.js — слой удобства навигации и ввода (подключается последним).
   1. Новый раздел всегда открывается с начала, а не с места прошлой прокрутки.
   2. Кнопка «Наверх» не перекрывает кнопки и не видна поверх панелей.
   3. Закрыли корзину/заявки/профиль — подсветка вкладки возвращается.
   4. Карточки-«кнопки» доступны с клавиатуры (Enter/Пробел), Esc закрывает окно.
   5. Защита от двойного нажатия на кнопках отправки (дубли заявок).
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(window.__garmUI) return; window.__garmUI=true;
  var chat=document.getElementById("chat");
  var actions=document.getElementById("actions");
  var tabBar=document.getElementById("tabBar");

  /* ── 1. Прокрутка к началу при смене раздела ── */
  var SCREENS=["showMainMenu","showMenuPage","showServices","showCategory","showTaxi","showTaxiTariff",
    "showTaxiDateTime","showBooking","showServiceBookingItem","showBookingSpecialist","showBookingDate",
    "showBookingTime","showStaff","showContacts","showEmergency","showMoroshkaInfo","showGallery",
    "showFeedback","showNews","showEvents","showCallback","showCityPlaceholder"];
  function toTop(){
    if(chat){ var b=chat.style.scrollBehavior; chat.style.scrollBehavior="auto"; chat.scrollTop=0; chat.style.scrollBehavior=b; }
    var bt=document.getElementById("backTop"); if(bt) bt.classList.remove("show");
  }
  function wrapScreens(){
    SCREENS.forEach(function(n){
      var f=window[n]; if(typeof f!=="function"||f.__uiTop) return;
      var w=function(){ var r=f.apply(this,arguments); toTop(); requestAnimationFrame(toTop); return r; };
      w.__uiTop=true; if(f.__garmWrapped) w.__garmWrapped=true;
      window[n]=w;
    });
  }

  /* ── 2. Высота нижней «док-зоны» (кнопки действий + меню) → CSS-переменная ── */
  function dockH(){
    var h=0;
    if(actions&&actions.offsetParent!==null) h+=actions.getBoundingClientRect().height;
    if(tabBar&&tabBar.offsetParent!==null&&!tabBar.classList.contains("nav-hidden")) h+=tabBar.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--dock-h",Math.round(h)+"px");
  }
  if(window.ResizeObserver){
    var ro=new ResizeObserver(dockH);
    if(actions) ro.observe(actions); if(tabBar) ro.observe(tabBar);
  }
  window.addEventListener("resize",dockH);

  /* ── 3. Вкладки после закрытия панелей ── */
  function restoreTab(){
    var t=window.__screenTab||"home";
    var btn=document.querySelector('.tb[onclick*="\''+t+'\'"]');
    if(!btn) return;
    document.querySelectorAll(".tb").forEach(function(b){b.classList.remove("active");b.removeAttribute("aria-current");});
    btn.classList.add("active"); btn.setAttribute("aria-current","page");
    if(typeof window.movePillTo==="function") window.movePillTo(btn);
  }
  function wrapClose(){
    ["closeCart","closeOrdersPanel","closeProfilePanel"].forEach(function(n){
      var f=window[n]; if(typeof f!=="function"||f.__uiClose) return;
      var w=function(){ var r=f.apply(this,arguments); restoreTab(); return r; };
      w.__uiClose=true; window[n]=w;
    });
  }

  /* ── 4. Клавиатура ── */
  var CLICKABLE=".sp-item,.sp-g,.prof-nav-row,.prof-card,.pl-svc-row[onclick],.news-card[onclick],[data-a][onclick],div[onclick],span[onclick],li[onclick]";
  function tagClickable(root){
    (root||document).querySelectorAll(CLICKABLE).forEach(function(el){
      if(el.tagName==="BUTTON"||el.tagName==="A"||el.hasAttribute("tabindex")) return;
      el.setAttribute("tabindex","0");
      if(!el.hasAttribute("role")) el.setAttribute("role","button");
    });
  }
  document.addEventListener("keydown",function(e){
    var el=e.target;
    if((e.key==="Enter"||e.key===" ")&&el&&el.getAttribute&&el.getAttribute("role")==="button"&&el.tagName!=="BUTTON"){
      e.preventDefault(); el.click(); return;
    }
    if(e.key==="Escape"){
      // Закрываем самый верхний слой: модальное окно → панель.
      var mo=document.querySelectorAll(".mo,.admin-ovl");
      if(mo.length){ var top=mo[mo.length-1]; if(!top.querySelector(".pin-card")) top.remove(); return; }
      var cp=document.getElementById("cartPanel"); if(cp&&cp.classList.contains("open")){ window.closeCart(); return; }
      var op=document.getElementById("ordersPanel"); if(op&&op.classList.contains("open")){ window.closeOrdersPanel(); return; }
      var pp=document.getElementById("profilePanel"); if(pp&&pp.classList.contains("open")&&window.closeProfilePanel){ window.closeProfilePanel(); return; }
    }
  });

  /* ── 5. Двойное нажатие на кнопках отправки ── */
  var SUBMIT=".book-send,.eq-save-btn,.cart-send,.taxi-order-bar-btn,.auth-btn,.fb-send,.admin-btn";
  document.addEventListener("click",function(e){
    var b=e.target&&e.target.closest&&e.target.closest(SUBMIT);
    if(!b||b.classList.contains("qz-next")) return; // шаги анкеты — не отправка, не блокируем
    var now=Date.now(), last=+(b.dataset.uiLast||0);
    if(now-last<900){ e.stopImmediatePropagation(); e.preventDefault(); return; }
    b.dataset.uiLast=String(now);
  },true);

  /* Наблюдаем за изменениями экрана: метки клавиатуры + пересчёт дока */
  var moT=0;
  var mo=new MutationObserver(function(){
    clearTimeout(moT); moT=setTimeout(function(){ tagClickable(document); dockH(); },60);
  });
  function init(){
    wrapScreens(); wrapClose(); tagClickable(document); dockH();
    mo.observe(document.body,{childList:true,subtree:true});
    if(!window.__screenTab) window.__screenTab="home";
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
