/* ═══════════════════════════════════════════════════════════════
   desktop.js — версия для ПК (экран от 1100px).
   На телефоне ничего не меняется: всё, что добавляет этот файл,
   скрыто стилями css/desktop.css вне десктопного режима.
   • Боковое меню «Быстрый доступ» под основными вкладками.
   • Затемнение за выезжающими панелями (корзина, заявки, кабинет) —
     клик по нему закрывает панель.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if (window.__garmDesk) return; window.__garmDesk = true;
  var mq = window.matchMedia ? window.matchMedia("(min-width:1100px)") : { matches:false, addEventListener:function(){} };
  var shell = document.getElementById("shell");
  if (!shell) return;

  var LINKS = [
    ["📋", "Услуги и цены", function(){ showServices(); }],
    ["📝", "Записаться", function(){ showBooking(); }],
    ["🚕", "Социальное такси", function(){ showTaxi(); }],
    ["🤖", "Чат-бот", function(){ openAssistantFullscreen(); }],
    ["👥", "Сотрудники", function(){ showStaff(); }],
    ["📰", "Новости", function(){ showNews(); }],
    ["🎟️", "Мероприятия", function(){ showEvents(); }],
    ["📍", "Контакты", function(){ showContacts(); }]
  ];

  var nav = document.createElement("nav");
  nav.className = "desk-nav"; nav.setAttribute("aria-label", "Быстрый доступ");
  nav.innerHTML = '<div class="desk-nav-ttl">Быстрый доступ</div>' + LINKS.map(function(l, i){
    return '<button type="button" class="desk-link" data-i="' + i + '"><span class="desk-link-ico" aria-hidden="true">' + l[0] + '</span><span>' + l[1] + "</span></button>";
  }).join("") + '<div class="desk-nav-foot" id="deskFoot"></div>';
  var tabBar = document.getElementById("tabBar");
  if (tabBar && tabBar.nextSibling) shell.insertBefore(nav, tabBar.nextSibling); else shell.appendChild(nav);

  nav.addEventListener("click", function(e){
    var b = e.target.closest(".desk-link"); if (!b) return;
    if (b.dataset.i !== "3") leaveAssistant();
    ["closeCart","closeOrdersPanel","closeProfilePanel"].forEach(function(f){ try{ if (typeof window[f] === "function") window[f](); }catch(err){} });
    LINKS[+b.dataset.i][2]();
    mark(b);
  });
  function mark(b){
    nav.querySelectorAll(".desk-link").forEach(function(x){ x.classList.toggle("active", x === b); x.toggleAttribute("aria-current", x === b); });
    if (b) document.querySelectorAll("#tabBar .tb").forEach(function(t){ t.classList.remove("active"); t.removeAttribute("aria-current"); });
  }
  /* Ушли из чат-бота через меню слева, вкладки или логотип — выходим из режима чат-бота,
     иначе его заголовок оставался поверх других разделов. */
  function leaveAssistant(){
    if (!shell.classList.contains("assistant-mode")) return;
    try { if (typeof window.closeBot3D === "function") window.closeBot3D(); } catch(err){}
    if (typeof exitAssistantFullscreenMode === "function") exitAssistantFullscreenMode();
  }
  if (tabBar) tabBar.addEventListener("click", function(e){ if (e.target.closest(".tb")) leaveAssistant(); }, true);
  var logo = document.getElementById("hdrLogo");
  if (logo) logo.addEventListener("click", leaveAssistant, true);

  /* Нажали обычную вкладку — снимаем подсветку быстрого доступа */
  if (tabBar) tabBar.addEventListener("click", function(){ mark(null); }, true);

  /* Контакты филиала внизу меню */
  function foot(){
    var f = document.getElementById("deskFoot"); if (!f) return;
    var c = (typeof cityData !== "undefined" && cityData[currentCity]) || {};
    f.innerHTML = '<div class="desk-foot-city">' + (typeof currentCityName !== "undefined" ? "Филиал «" + currentCityName + "»" : "") + "</div>" +
      (c.phone ? '<a class="desk-foot-phone" href="tel:+' + (c.phoneRaw||"") + '">📞 ' + c.phone + "</a>" : "") +
      (c.hours ? '<div class="desk-foot-hours">' + c.hours + "</div>" : "");
  }
  foot();
  var cs = document.getElementById("cityDisplay");
  if (cs && window.MutationObserver) new MutationObserver(foot).observe(cs, { childList:true, characterData:true, subtree:true });

  /* Быстрые действия на главной (видны только на ПК) */
  var QUICK = [
    ["main","📝","Записаться к специалисту","Психолог, логопед, ЛФК, процедуры",function(){ showBooking(); }],
    ["","🚕","Заказать такси","Социальное такси по городу",function(){ showTaxi(); }],
    ["","📋","Услуги и цены","Весь прейскурант филиала",function(){ showServices(); }],
    ["","🤖","Спросить чат-бота","Подскажет услугу и цену",function(){ openAssistantFullscreen(); }]
  ];
  function addQuick(){
    var hv = document.querySelector("#chat .home-view");
    if (!hv || hv.querySelector(".desk-quick")) return;
    var q = document.createElement("div"); q.className = "desk-quick";
    q.innerHTML = QUICK.map(function(x, i){
      return '<button type="button" class="desk-q ' + x[0] + '" data-q="' + i + '"><span class="desk-q-ico" aria-hidden="true">' + x[1] + '</span><span><b>' + x[2] + '</b><small>' + x[3] + "</small></span></button>";
    }).join("");
    q.addEventListener("click", function(e){ var b = e.target.closest(".desk-q"); if (b) QUICK[+b.dataset.q][4](); });
    var g = hv.querySelector(".greet-anim");
    if (g && g.nextSibling) hv.insertBefore(q, g.nextSibling); else hv.appendChild(q);
  }
  var chatEl0 = document.getElementById("chat");
  if (chatEl0 && window.MutationObserver) new MutationObserver(addQuick).observe(chatEl0, { childList:true });
  addQuick();

  /* ── Новости на ПК: «кирпичная» раскладка + сворачивание длинного текста ──
     Сетка с рядами по 4px: каждой карточке задаём столько рядов, сколько
     занимает её высота. Порядок новостей слева направо сохраняется. */
  var ROW = 4, GAP = 20;
  function clampTexts(feed){
    feed.querySelectorAll(".news-card").forEach(function(card){
      var t = card.querySelector(".news-text");
      if (!t || t.dataset.deskClamp) return;
      t.dataset.deskClamp = "1";
      t.classList.add("desk-clamp");
      if (t.scrollHeight <= t.clientHeight + 4) { t.classList.remove("desk-clamp"); return; }
      var more = document.createElement("button");
      more.type = "button"; more.className = "desk-more"; more.textContent = "Читать полностью";
      more.addEventListener("click", function(){
        var open = t.classList.toggle("desk-clamp") === false;
        more.textContent = open ? "Свернуть" : "Читать полностью";
        layoutFeed(feed);
      });
      t.parentNode.insertBefore(more, t.nextSibling);
    });
  }
  function layoutFeed(feed){
    if (!mq.matches) { feed.classList.remove("desk-masonry"); feed.querySelectorAll(".news-card").forEach(function(c){ c.style.gridRowEnd = ""; }); return; }
    feed.classList.add("desk-masonry");
    feed.querySelectorAll(".news-card").forEach(function(c){
      c.style.gridRowEnd = "";
      var h = c.getBoundingClientRect().height;
      c.style.gridRowEnd = "span " + Math.max(1, Math.ceil((h + GAP) / ROW));
    });
  }
  function prepFeed(feed){
    if (!mq.matches) { layoutFeed(feed); return; }
    clampTexts(feed);
    layoutFeed(feed);
    if (feed.dataset.deskObs) return;
    feed.dataset.deskObs = "1";
    feed.querySelectorAll("img").forEach(function(img){ if (!img.complete) img.addEventListener("load", function(){ layoutFeed(feed); }, { once:true }); });
    if (window.ResizeObserver) new ResizeObserver(function(){ layoutFeed(feed); }).observe(feed);
  }
  var nfT = 0;
  function scanFeeds(){
    clearTimeout(nfT);
    nfT = setTimeout(function(){ document.querySelectorAll("#chat .news-feed, #chat .news-list").forEach(prepFeed); }, 60);
  }
  if (chatEl0 && window.MutationObserver) new MutationObserver(scanFeeds).observe(chatEl0, { childList:true, subtree:true });
  if (mq.addEventListener) mq.addEventListener("change", function(){ document.querySelectorAll("#chat .news-feed, #chat .news-list").forEach(function(f){ f.dataset.deskObs = ""; prepFeed(f); }); });
  scanFeeds();

  /* Затемнение за панелями */
  var scrim = document.createElement("div");
  scrim.className = "desk-scrim"; scrim.setAttribute("aria-hidden", "true");
  /* Внутри .shell — в одном «слое» с панелями: затемнение под панелью, а не поверх неё */
  var firstPanel = document.getElementById("cartPanel");
  if (firstPanel) shell.insertBefore(scrim, firstPanel); else shell.appendChild(scrim);
  scrim.addEventListener("click", function(){
    ["closeCart","closeOrdersPanel","closeProfilePanel"].forEach(function(f){ try{ if (typeof window[f] === "function") window[f](); }catch(err){} });
  });
  function syncScrim(){
    var open = mq.matches && !!document.querySelector(".cart-panel.open,.orders-panel.open,.profile-panel.open");
    scrim.classList.toggle("on", open);
  }
  if (window.MutationObserver) ["cartPanel","ordersPanel","profilePanel"].forEach(function(id){
    var el = document.getElementById(id);
    if (el) new MutationObserver(syncScrim).observe(el, { attributes:true, attributeFilter:["class"] });
  });
  if (mq.addEventListener) mq.addEventListener("change", syncScrim);
  document.documentElement.classList.toggle("is-desk", mq.matches);
  if (mq.addEventListener) mq.addEventListener("change", function(){ document.documentElement.classList.toggle("is-desk", mq.matches); });
})();
