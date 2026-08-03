/* ══════════════════════════════════════════════════════════════
   ГАРМОНИЯ — починка навигации «Назад».

   Проблема: разделы открываются разными путями (плитки Главной,
   быстрые действия, поиск, прямые onclick="showTaxi()"), и только
   часть из них клала экран в navHistory. В остальных случаях
   кнопка «← Назад в меню» ничего не делала.

   Решение: оборачиваем функции разделов так, что при входе они
   САМИ запоминают экран, с которого их открыли. Существующие
   вызовы pushNav продолжают работать — дубли не создаются.

   Чистое добавление: ни одна строка старого кода не меняется.
   ══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(window.__garmNavFix) return; window.__garmNavFix=true;

  // Разделы, внутри которых есть кнопка «Назад».
  var SECTIONS=["showServices","showBooking","showTaxi","showStaff","showCallback",
                "showEvents","showNews","showContacts","showFeedback","showGallery",
                "showMoroshkaInfo"];

  function activeTab(){
    var b=document.querySelector(".tb.active");
    if(!b) return "home";
    var m=/tabGo\(['"](\w+)['"]\)/.exec(b.getAttribute("onclick")||"");
    return m?m[1]:"home";
  }

  // Экран, на который логично вернуться из раздела.
  function originScreen(){
    return activeTab()==="menu" && typeof window.showMenuPage==="function"
      ? window.showMenuPage
      : window.showMainMenu;
  }

  function init(){
    if(typeof window.pushNav!=="function") return;

    SECTIONS.forEach(function(name){
      var orig=window[name];
      if(typeof orig!=="function" || orig.__garmWrapped) return;

      var wrapped=function(){
        try{
          var hist=window.navHistory;
          var origin=originScreen();
          // Кладём экран возврата, только если стек пуст — тогда
          // мы пришли напрямую. Если pushNav уже отработал (переход
          // из «Услуг» или вглубь), ничего не трогаем.
          if(Array.isArray(hist) && hist.length===0 && typeof origin==="function"){
            window.pushNav(origin);
          }
        }catch(e){}
        return orig.apply(this, arguments);
      };
      wrapped.__garmWrapped=true;
      window[name]=wrapped;
    });
  }

  // Оборачиваем после того, как все скрипты объявили свои функции.
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
