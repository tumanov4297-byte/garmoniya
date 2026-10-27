/* admin.bundle.js (панель сотрудника) — собран автоматически из js/*.js (build.py). Не редактировать вручную. */
;
/* Сборка: 2026-10-05 */
;
window.SOCUSLUGI_BUILD="server";
;

/* ───── js/admin-app.js ───── */
/* admin-app.js — отдельная страница админпанели для сотрудников (admin/index.html).
   Подключает вход через домен yg.loc и открывает панель на весь экран. */
window.SOCUSLUGI_ADMIN_APP = true;
var currentCity = "gubkin";
function showToast(msg){
  var t=document.getElementById("toast");
  if(!t){t=document.createElement("div");t.id="toast";t.className="toast";t.setAttribute("role","status");t.setAttribute("aria-live","polite");document.body.appendChild(t);}
  t.textContent=msg;t.classList.add("show");
  clearTimeout(showToast._t);showToast._t=setTimeout(function(){t.classList.remove("show");},3500);
}
/* сломанные картинки (логотип не загрузился) прячем без onerror в разметке — его запрещает CSP панели */
document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.hasAttribute("data-hide-broken"))t.style.display="none";},true);
document.addEventListener("DOMContentLoaded",function(){
  if(typeof openAdmin==="function")openAdmin();
});

;

/* ───── js/icons.js ───── */
/* Единый набор линейных иконок «Гармония».
   Одинаково выглядят на Android, iPhone и Windows — в отличие от эмодзи.
   Использование: ico("taxi")  →  строка с <svg>. */
(function(){
  var P='<svg class="ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var S={
    list:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    taxi:'<path d="M5 17h14M4 17v-4l2-5h12l2 5v4"/><path d="M9 8V5h6v3"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.4.5 4 2.1 4 5"/>',
    phone:'<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.2 2 2 0 0 1 6 3z"/>',
    ticket:'<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"/><path d="M14 6v12"/>',
    news:'<path d="M4 5h12a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5z"/><path d="M18 9h2v8a2 2 0 0 1-2 2"/><path d="M7 9h6M7 13h6M7 16h4"/>',
    pin:'<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5L13 17l3-2.5 4 3.5"/>',
    star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z"/>',
    bag:'<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    user:'<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6"/>',
    chart:'<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6" rx="1"/><rect x="11" y="7" width="3" height="10" rx="1"/><rect x="16" y="13" width="3" height="4" rx="1"/>',
    chat:'<path d="M20 15a3 3 0 0 1-3 3H9l-4 3v-3.6A3 3 0 0 1 4 15V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8z"/>',
    gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    trash:'<path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.6 2.6L16 9.6"/>',
    warn:'<path d="M12 4l9 16H3l9-16z"/><path d="M12 10v4M12 17.2v.1"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.1"/>',
    home:'<path d="M4 11l8-7 8 7"/><path d="M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    cart:'<path d="M3 4h2l2.2 11h10.6L20 7H6.2"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    inbox:'<path d="M4 13l2.5-8h11L20 13v6H4v-6z"/><path d="M4 13h5l1 2h4l1-2h5"/>',
    edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
    heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    leaf:'<path d="M5 19c8 0 14-6 14-14C11 5 5 10 5 16v3z"/><path d="M5 19c3-4 6-6 9-8"/>',
    brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 0 2 2h13v-3"/><path d="M8 7h7"/>',
    scale:'<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-2.5 6a3 3 0 0 0 5 0L5 7zM19 7l-2.5 6a3 3 0 0 0 5 0L19 7z"/>',
    wheelchair:'<circle cx="11" cy="4.5" r="1.6"/><path d="M11 7v6h5l2 5"/><path d="M11 10h5"/><path d="M8 11.5a5 5 0 1 0 7 6"/>',
    dumbbell:'<path d="M6 7v10M3.5 9.5v5M18 7v10M20.5 9.5v5M6 12h12"/>',
    stethoscope:'<path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M10 13v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="11" r="2"/>',
    gift:'<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9v11"/><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z"/>',
    camera:'<path d="M4 8h3l2-3h6l2 3h3v11H4V8z"/><circle cx="12" cy="13" r="3.5"/>',
    video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    baby:'<circle cx="12" cy="8" r="4"/><path d="M6 21c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M10.5 8h.01M13.5 8h.01"/>',
    hands:'<path d="M12 21c-4-2.5-8-5.5-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 4.5-4 7.5-8 10z"/><path d="M9 11.5l2 2 4-4"/>',
    car:'<path d="M5 16h14M4 16v-3l2-5h12l2 5v3"/><path d="M4 13h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>',
    van:'<path d="M3 16V7h11l4 4h3v5"/><path d="M3 16h18M14 7v4h7"/><circle cx="7" cy="16.5" r="1.6"/><circle cx="17" cy="16.5" r="1.6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>',
    lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    shield:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    server:'<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/><path d="M8 7.5h.01M8 16.5h.01"/>',
    send:'<path d="M4 12l16-8-6 16-3-6-7-2z"/><path d="M11 14l9-10"/>',
    history:'<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6"/><path d="M4 4v4.6h4.6M12 8v4l3 2"/>',
    refresh:'<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    building:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    doc:'<path d="M6 3h8l4 4v14H6V3z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    idcard:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h4M14 13h3"/>',
    tag:'<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="7.5" cy="8.5" r="1.3"/>',
    card:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
    sos:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6"/>',
    search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    party:'<path d="M4 20l5-14 9 9-14 5z"/><path d="M14 6l1-3M18 10l3-1M16 8l2-2"/>',
    route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
    download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    x:'<path d="M6 6l12 12M18 6L6 18"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    palette:'<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.9 1.4-1.8l-.3-.9c-.3-.9.4-1.8 1.4-1.8H17a4 4 0 0 0 4-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7" r="1.2"/>',
    bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    bellOff:'<path d="M6 16V11a6 6 0 0 1 9.5-4.9M18 11v5l1.5 2H8"/><path d="M10 20a2 2 0 0 0 4 0M4 4l16 16"/>',
    printer:'<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v6H7z"/>'
  };
  window.ico=function(name,cls){
    var body=S[name]||S.info;
    return P.replace('class="ic"','class="ic'+(cls?' '+cls:'')+'"')+body+'</svg>';
  };
  window.ICONS=S;
  /* Иконка раздела прейскуранта по его названию (вместо эмодзи в данных) */
  var CAT=[[/перевозк|такси|автомобил/,"car"],[/прокат|реабилитац/,"wheelchair"],[/лфк|зал|спорт|физкульт/,"dumbbell"],
    [/психолог/,"brain"],[/педагог|обучен|школ/,"book"],[/правов|юрид/,"scale"],[/медицин|массаж|оздоров/,"stethoscope"],
    [/праздник|мероприят/,"party"],[/фотограф/,"camera"],[/видео/,"video"],[/паллиатив|уход/,"hands"],[/сиделк|нян/,"baby"],
    [/гостинич|проживан/,"building"],[/социально-бытов|быт/,"home"],[/срочн/,"sos"]];
  window.catIco=function(cat,cls){
    var n=String(cat&&cat.name||cat||"").toLowerCase();
    for(var i=0;i<CAT.length;i++)if(CAT[i][0].test(n))return window.ico(CAT[i][1],cls);
    return window.ico("list",cls);
  };
})();

;

/* ───── js/brand-palette.js ───── */
/* Фирменная палитра (создано tools/themeize.py). Эти цвета перекрашиваются в «Оформлении». */
var BRAND_PALETTE=["051c1c", "059669", "081a1a", "0a2828", "0a3232", "0c2330", "0d3a3a", "0d3c3c", "0d6b6b", "0e1e21", "0e4040", "0e5a4e", "0f1919", "0f5555", "10b981", "12282c", "123a3a", "123f4d", "143237", "147575", "155a5a", "156767", "15803d", "166f6f", "16a34a", "182e2e", "186363", "1a5252", "1f2b2d", "21434a", "22543d", "22a5a5", "22c55e", "235660", "239b56", "24555e", "27a89f", "27ae60", "2a9d9d", "2b6570", "2ec4b6", "2f855a", "2fae9e", "34d399", "3d5f64", "3d6f77", "3f8f87", "54cdc1", "58a889", "5b6b74", "5b7a7a", "5baa93", "5e7c80", "5f8a8c", "60c8be", "60dccd", "6db597", "6ee89a", "78c8be", "78ded2", "78e6c8", "7a9294", "7bbe9f", "7ff5d8", "8aa0a0", "94abad", "98b6b4", "9db5b3", "a8f5e0", "a9bdbb", "a9bdbc", "b6d6d5", "bbd3cf", "bdd8d8", "bfdcd7", "c5e8e8", "c6d8d5", "c6e1de", "c7e2de", "c8dcdc", "c9dad7", "cbd9d9", "cde9d7", "dce8e6", "dceae6", "dcf2f2", "ddefea", "dff0ea", "e1f1ec", "e3ece9", "e4efec", "e4f1ee", "e4f3eb", "e6f2f0", "e8f8ef", "e9f4f1", "eaf1ef", "eaf4f1", "eaf4f4", "eaf6ef", "eaf6f6", "eaf7f5", "ecf1ef", "edf3f2", "eef2f1", "eef4f2", "eef6f3", "f0f7f4", "f0fafa", "f2f7f6", "f3f6f5", "f3f7f6", "f3faf8", "f4f8f7", "f4f9f7", "f7fbfa", "f8fcfc"];

;

/* ───── js/brand.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   brand.js — оформление центра: название, логотип, аватар чат-бота,
   цвета и визуальные эффекты. Меняется в панели → «Оформление».

   • Без настроек (по умолчанию) ничего не меняется — «Гармония» выглядит как всегда.
   • Цвета: фирменная палитра в CSS переведена на переменные (tools/themeize.py);
     здесь каждый цвет палитры пересчитывается под новый основной цвет —
     сохраняются светлота и насыщенность оттенков, меняется тон.
   • Название и логотип подставляются во всём интерфейсе, включая ответы чат-бота.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var DEFAULT_BRAND={
    name:"Гармония",                       // короткое название: шапка, чат-бот, заголовки
    nameGen:"Гармонии",                    // в родительном падеже: «центра Гармонии»
    org:"ГБУ ЯНАО «ЦСОН «Гармония»",       // полное название организации
    logo:"",                               // своя картинка логотипа (data: или путь); пусто — стандартный
    botAvatar:"",                          // своё изображение чат-бота; пусто — стандартный робот
    accent:"#3f8f87",                      // основной цвет
    vk:"https://vk.ru/cson_noyabrsk",      // группа ВКонтакте; пусто — разделы ВК скрыты
    vkId:127392806,                        // числовой ID сообщества для виджета новостей (необязательно)
    effects:{animations:true,seasonal:true,decor:true,glass:true}
  };
  var BASE_ACCENT="#3f8f87";
  var STD_LOGO=/img\/logo-(icon\.png|round\.jpg)$/;
  var STD_BOT=/img\/bot-(avatar|tablet|present|meditate|pray|heart|live)\.(jpg|webp)$/;
  var cur=JSON.parse(JSON.stringify(DEFAULT_BRAND));

  function hexToRgb(h){h=String(h).replace("#","");if(h.length===3)h=h.split("").map(function(c){return c+c;}).join("");
    var n=parseInt(h,16);return [n>>16&255,n>>8&255,n&255];}
  function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2;
    if(mx!==mn){var d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
      h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
  function hslToRgb(h,s,l){h=((h%360)+360)%360/360;function f(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}
    if(!s){var v=Math.round(l*255);return [v,v,v];}var q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;
    return [Math.round(f(p,q,h+1/3)*255),Math.round(f(p,q,h)*255),Math.round(f(p,q,h-1/3)*255)];}
  function toHex(c){return "#"+c.map(function(x){return ("0"+Math.max(0,Math.min(255,x)).toString(16)).slice(-2);}).join("");}
  function validHex(h){return /^#?[0-9a-f]{6}$/i.test(String(h||""));}

  /* Перекраска палитры: тон сдвигается к новому цвету, насыщенность масштабируется,
     светлота у светлых оттенков сохраняется, у тёмных — подстраивается под новый цвет. */
  function paletteVars(accent){
    var b=rgbToHsl.apply(null,hexToRgb(BASE_ACCENT)),a=rgbToHsl.apply(null,hexToRgb(accent));
    var dh=a[0]-b[0],ks=b[1]?a[1]/b[1]:1,dl=a[2]-b[2];
    var css="";
    (window.BRAND_PALETTE||[]).forEach(function(hx){
      var c=rgbToHsl.apply(null,hexToRgb(hx));
      var s=Math.max(0,Math.min(1,c[1]*ks));
      var l=c[2];if(l<0.7)l=Math.max(0.05,Math.min(0.92,l+dl*(1-l/0.7)));
      var rgb=hslToRgb(c[0]+dh,s,l);
      css+="--bp-"+hx+":"+toHex(rgb)+";--bpr-"+hx+":"+rgb.join(",")+";";
    });
    return css;
  }

  /* Подстановка названия в тексты интерфейса */
  /* REPL — постоянные замены «стандартное → текущее» (для новых элементов);
     при смене оформления один раз выполняется проход «прежнее → новое», чтобы откатить старое название. */
  var REPL=[],applied=null;
  function pairs(from,to){
    /* длинные строки — первыми; одинаковый источник (имя = род. падеж) заменяется один раз — на имя */
    var cand=[["org","org"],["name","name"],["nameGen","nameGen"]],out=[],seen={};
    cand.forEach(function(k){
      var a=from[k[0]],b=to[k[1]];
      if(a&&b&&a!==b&&!seen[a]){seen[a]=1;out.push([a,b]);}});
    out.sort(function(x,y){return y[0].length-x[0].length;});
    return out;
  }
  function buildRepl(){REPL=pairs(DEFAULT_BRAND,cur);}
  function fixText(s,list){list=list||REPL;for(var i=0;i<list.length;i++)if(s.indexOf(list[i][0])>=0)s=s.split(list[i][0]).join(list[i][1]);return s;}
  function hasAny(s,list){list=list||REPL;for(var i=0;i<list.length;i++)if(s.indexOf(list[i][0])>=0)return true;return false;}
  var ATTRS=["alt","title","placeholder","aria-label"];
  function fixNode(root,list){
    if(!root)return;
    list=list||REPL;
    if(root.nodeType===3){if(list.length&&hasAny(root.nodeValue,list)){var v=fixText(root.nodeValue,list);if(v!==root.nodeValue)root.nodeValue=v;}return;}
    if(root.nodeType!==1)return;
    var tag=root.tagName;if(tag==="SCRIPT"||tag==="STYLE"||tag==="TEXTAREA"||(tag==="INPUT"&&root.type!=="button"))return;
    if(root.closest&&root.closest("[data-brand-raw]"))return;   // поля «Оформления» — без подстановки
    fixImg(root);root.querySelectorAll&&root.querySelectorAll("img").forEach(fixImg);
    if(list.length){
      ATTRS.forEach(function(a){var v=root.getAttribute&&root.getAttribute(a);if(v&&hasAny(v,list))root.setAttribute(a,fixText(v,list));});
      var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n;
      while((n=w.nextNode())){if(hasAny(n.nodeValue,list)&&!(n.parentNode&&n.parentNode.closest&&n.parentNode.closest("textarea,[data-brand-raw]"))){var t=fixText(n.nodeValue,list);if(t!==n.nodeValue)n.nodeValue=t;}}
    }
  }
  function fixImg(img){
    if(!img||img.tagName!=="IMG")return;
    var src=img.getAttribute("src")||"";
    if(img.dataset.brandSrc){                        // уже подменено: вернуть стандартное, если настройку сняли
      var orig=img.dataset.brandSrc;
      var want=(img.hasAttribute("data-brand-logo")||STD_LOGO.test(orig))?cur.logo:(STD_BOT.test(orig)?cur.botAvatar:"");
      if(!want&&src!==orig)img.setAttribute("src",orig);
      else if(want&&src!==want)img.setAttribute("src",want);
      return;
    }
    if(cur.logo&&(STD_LOGO.test(src)||img.hasAttribute("data-brand-logo"))){img.dataset.brandSrc=src;img.setAttribute("src",cur.logo);}
    else if(cur.botAvatar&&STD_BOT.test(src)){img.dataset.brandSrc=src;img.setAttribute("src",cur.botAvatar);img.style.objectFit="cover";}
  }
  var observer=null;
  function watch(){
    if(observer||!window.MutationObserver||!document.body)return;
    observer=new MutationObserver(function(muts){
      if(!REPL.length&&!cur.logo&&!cur.botAvatar)return;
      muts.forEach(function(m){
        if(m.type==="characterData")fixNode(m.target);
        else if(m.type==="attributes"){if(m.target.tagName==="IMG")fixImg(m.target);}
        else m.addedNodes.forEach(fixNode);
      });
    });
    observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["src"]});
  }

  function applyBrand(b){
    var prevName=cur.name;
    cur=JSON.parse(JSON.stringify(DEFAULT_BRAND));
    if(b&&typeof b==="object"){
      ["name","nameGen","org","logo","botAvatar","vk"].forEach(function(k){if(typeof b[k]==="string")cur[k]=b[k].trim();});
      if(b.vkId!==undefined){var n=parseInt(b.vkId,10);cur.vkId=n>0?n:0;}
      else if(typeof b.vk==="string"&&b.vk.trim()!==DEFAULT_BRAND.vk)cur.vkId=0;   /* другая группа — свой ID */
      if(validHex(b.accent))cur.accent=("#"+String(b.accent).replace("#","")).toLowerCase();
      if(b.effects&&typeof b.effects==="object")["animations","seasonal","decor","glass"].forEach(function(k){if(typeof b.effects[k]==="boolean")cur.effects[k]=b.effects[k];});
    }
    if(!cur.name)cur.name=DEFAULT_BRAND.name;
    if(!cur.nameGen)cur.nameGen=cur.name;
    if(!cur.org)cur.org=DEFAULT_BRAND.org;
    /* цвета */
    var st=document.getElementById("brandVars");
    if(cur.accent!==BASE_ACCENT){
      if(!st){st=document.createElement("style");st.id="brandVars";document.head.appendChild(st);}
      st.textContent=":root{"+paletteVars(cur.accent)+"}";
      var tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.setAttribute("content",toHex(hslToRgb(rgbToHsl.apply(null,hexToRgb(cur.accent))[0],0.3,0.97)));
    }else if(st)st.remove();
    /* группа ВКонтакте */
    var vk=String(cur.vk||"").trim();
    if(vk&&!/^https?:\/\//.test(vk))vk="https://"+vk.replace(/^\/+/,"");
    if(typeof VK_GROUP!=="undefined"){
      VK_GROUP.url=vk;VK_GROUP.numericId=vk?(cur.vkId||0):0;
      VK_GROUP.screen=vk?vk.replace(/^https?:\/\/(www\.)?vk\.(com|ru)\//,"").replace(/\/.*$/,""):"";
    }
    document.documentElement.classList.toggle("no-vk",!vk);
    /* эффекты */
    var h=document.documentElement;
    h.classList.toggle("fx-no-anim",!cur.effects.animations);
    h.classList.toggle("fx-no-seasonal",!cur.effects.seasonal);
    h.classList.toggle("fx-no-decor",!cur.effects.decor);
    h.classList.toggle("fx-no-glass",!cur.effects.glass);
    /* название, логотип */
    buildRepl();
    var swap=applied?pairs(applied,cur):REPL;      /* откат прежнего названия на экране */
    applied=JSON.parse(JSON.stringify(cur));
    if(document.title.indexOf(DEFAULT_BRAND.name)>=0||prevName!==cur.name)document.title=cur.name+" — помощник ЦСОН";
    var fav=document.querySelector('link[rel="icon"]');if(fav)fav.setAttribute("href",cur.logo||"img/logo-icon.png");
    if(document.body){fixNode(document.body,swap);watch();}
    else document.addEventListener("DOMContentLoaded",function(){fixNode(document.body,swap);watch();});
  }

  window.GBrand={DEFAULT:DEFAULT_BRAND,apply:applyBrand,get:function(){return JSON.parse(JSON.stringify(cur));},
    preview:paletteVars,hexToRgb:hexToRgb,toHex:toHex,rgbToHsl:rgbToHsl,hslToRgb:hslToRgb};
})();

;

/* ───── js/data.js ───── */

const ORDER_EMAIL="aidavydenko@yanao.ru",ORG_EMAIL="cson-gub@yanao.ru",MAIN_PHONE="8(34936)2-70-77",MAIN_PHONE_RAW="73493627077";

// Общая группа ВКонтакте — одна на все филиалы центра «Гармония».
// numericId нужен для виджета: как получить за 10 секунд —
// откройте vk.com/dev/Widgets → «Виджет сообщества» → впишите cson_noyabrsk →
// в сгенерированном коде будет строка вида VK.Widgets.Group("...", {...}, 123456789) — это и есть id.
const VK_GROUP={numericId:127392806,screen:"cson_noyabrsk",url:"https://vk.ru/cson_noyabrsk"};

const cityData={
  gubkin:{address:"629830, ЯНАО, г. Губкинский, 3-й мкрн, д. 42",phone:MAIN_PHONE,phoneRaw:MAIN_PHONE_RAW,email:ORG_EMAIL,hours:"Пн–Пт: 08:30–18:00, обед 12:30–14:00",openH:8,openM:30,closeH:18,closeM:0,hasStaff:true,hasServices:true},
  purpe:{address:"ЯНАО, мкр. Пурпе (уточните точный адрес здания в админ-панели)",phone:MAIN_PHONE,phoneRaw:MAIN_PHONE_RAW,email:ORG_EMAIL,hours:"Пн–Пт: 08:30–18:00, обед 12:30–14:00",openH:8,openM:30,closeH:18,closeM:0,hasStaff:true,hasServices:true},
  muravlenko:{address:"629605, ЯНАО, г. Муравленко, ул. Нефтяников, д. 12",phone:"8(34938)5-18-00",phoneRaw:"73493851800",email:"cson-mur@yanao.ru",hours:"Пн–Пт: 08:30–17:30, обед 12:30–14:00",openH:8,openM:30,closeH:17,closeM:30,hasStaff:false,hasServices:false},
  noyabrsk:{address:"629806, ЯНАО, г. Ноябрьск, ул. Советская, д. 24",phone:"8(34963)3-40-80",phoneRaw:"73496334080",email:"cson-noy@yanao.ru",hours:"Пн–Пт: 08:30–17:30, обед 12:30–14:00",openH:8,openM:30,closeH:17,closeM:30,hasStaff:true,hasServices:false},
  tarko:{address:"629850, ЯНАО, г. Тарко-Сале, ул. Геологов, д. 8",phone:"8(34997)2-83-08",phoneRaw:"73499728308",email:"cson-tarko@yanao.ru",hours:"Пн–Пт: 08:00–18:30, обед 12:30–14:00",openH:8,openM:0,closeH:18,closeM:30,hasStaff:true,hasServices:true},
  urengoy:{address:"629650, ЯНАО, пгт. Уренгой, ул. Ленина, д. 5",phone:"8(34997)2-83-08",phoneRaw:"73499728308",email:"cson-urengoy@yanao.ru",hours:"Пн–Пт: 08:00–18:30, обед 12:30–14:00",openH:8,openM:0,closeH:18,closeM:30,hasStaff:true,hasServices:true}
};

const GUBKIN_STAFF=[
  {dept:"Административно-управленческий персонал",name:"Донсков Григорий Владимирович",pos:"Директор филиала",ext:"701",email:"gvdonskov@yanao.ru"},
  {dept:"Административно-управленческий персонал",name:"Зуенкова Полина Евгеньевна",pos:"Секретарь руководителя",ext:"702",email:"pezyenkova@yanao.ru"},
  {dept:"Отделение профилактики безнадзорности",name:"Рыбникова Надежда Викторовна",pos:"Заведующий отделением",ext:"707",email:"nvrybnikova@yanao.ru"},
  {dept:"Отделение профилактики безнадзорности",name:"Егармина Екатерина Анатольевна",pos:"Специалист по социальной работе",ext:"",email:"eaegarmina@yanao.ru"},
  {dept:"Отделение профилактики безнадзорности",name:"Лыткова Наталья Владимировна",pos:"Специалист по социальной работе",ext:"",email:"nvlytkova@yanao.ru"},
  {dept:"Отделение профилактики безнадзорности",name:"Шалагинова Екатерина Анатольевна",pos:"Психолог",ext:"705",email:"eashalaginova@yanao.ru"},
  {dept:"Отделение срочного социального обслуживания",name:"Девятирикова Ольга Александровна",pos:"Специалист по социальной работе",ext:"",email:"oadevytirikova@yanao.ru"},
  {dept:"Отделение срочного социального обслуживания",name:"Щербич Екатерина Викторовна",pos:"Специалист по социальной работе",ext:"709",email:"evsherbich@yanao.ru"},
  {dept:"Отделение активного долголетия",name:"Беляева Надежда Ивановна",pos:"Специалист по социальной работе",ext:"",email:"nibelyeva@yanao.ru"},
  {dept:"Отделение соц. обслуживания на дому",name:"Додонова Ауреля Калиновна",pos:"Заведующий отделением",ext:"713",email:"akdodonova@yanao.ru"},
  {dept:"Отделение соц. обслуживания на дому",name:"Абдулаева Индира Нурудиновна",pos:"Социальный работник",ext:"",email:"inabdulayeva@yanao.ru"},
  {dept:"Отделение соц. обслуживания на дому",name:"Асафова Наталья Федоровна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение соц. обслуживания на дому",name:"Врабий Лучия Андреевна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение соц. обслуживания на дому",name:"Корчагина Ольга Александровна",pos:"Социальный работник",ext:"",email:""},
  
  
  
  
  
  
  
  
  
  
  {dept:"Отделение комплексной реабилитации",name:"Васильева Любовь Александровна",pos:"Заведующий отделением",ext:"713",email:"lavasileva@yanao.ru"},
  
  
  
  {dept:"Отделение комплексной реабилитации",name:"Воронцова Ольга Александровна",pos:"Специалист по социальной работе",ext:"",email:"oavoroncova@yanao.ru"},
  {dept:"Отделение комплексной реабилитации",name:"Цыганова Анна Юрьевна",pos:"Специалист по социальной работе",ext:"",email:""},
  
  {dept:"Отделение комплексной реабилитации",name:"Тулякова Лилиана Андреевна",pos:"Социальный педагог",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации",name:"Кушнир Неля Станиславовна",pos:"Социальный педагог",ext:"",email:"nskushnir@yanao.ru"},
  {dept:"Отделение комплексной реабилитации",name:"Леднева Олеся Александровна",pos:"Педагог-психолог",ext:"",email:"oaledneva@yanao.ru"},
  {dept:"Отделение комплексной реабилитации",name:"Руссу Елена Николаевна",pos:"Педагог-психолог",ext:"",email:"enrussu@yanao.ru"},
  {dept:"Отделение комплексной реабилитации",name:"Яговцева Екатерина Ивановна",pos:"Логопед",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации",name:"Фролова Ольга Александровна",pos:"Медицинская сестра",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации",name:"Хрипкова Татьяна Михайловна",pos:"Медицинская сестра",ext:"",email:""},
  
  {dept:"Отделение комплексной реабилитации",name:"Силантьева Людмила Михайловна",pos:"Педагог доп. образования",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации",name:"Авдеева Оксана Леонидовна",pos:"Психолог",ext:"",email:"olavdeeva@yanao.ru"},
  {dept:"Отделение первичного приема семей",name:"Лапикова Елена Юрьевна",pos:"Специалист по социальной работе",ext:"",email:"eylapikova@yanao.ru"},
  {dept:"Отделение первичного приема семей",name:"Соболева Ирина Владимировна",pos:"Специалист по социальной работе",ext:"",email:"ivsoboleva@yanao.ru"},
  {dept:"Отделение экстренной психологической помощи",name:"Сарсембаева Алия Наиловна",pos:"Специалист по социальной работе",ext:"716",email:"ansarsembaeva@yanao.ru"},
  {dept:"Отделение экстренной психологической помощи",name:"Давыденко Алла Иосифовна",pos:"Психолог",ext:"710",email:"aidavydenko@yanao.ru"},
  {dept:"Отделение оказания социальных услуг",name:"Ваганова Алена Александровна",pos:"Специалист по социальной работе",ext:"",email:"aavaganova@yanao.ru"},
  {dept:"Отделение оказания социальных услуг",name:"Кириченко Евгения Васильевна",pos:"Социальный работник",ext:"",email:"evkirichenko@yanao.ru"},
  {dept:"Отделение оказания социальных услуг",name:"Муталова Дильбар Муратовна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг",name:"Идельбаева Альбина Миниваровна",pos:"Воспитатель",ext:"",email:""}
];

const GUBKIN_SERVICES=[
  {id:10,name:"Услуги по перевозке на автомобильном транспорте",icon:"",items:[
    {n:"Перевозка на автотранспорте \"Социальное такси\" с сопровождением работника учреждения социального обслуживания, в рабочие дни 30 мин.",p:930,m:884},
    {n:"Перевозка на автотранспорте \"Социальное такси\" без сопровождения работника учреждения социального обслуживания, в рабочие дни 30 мин.",p:500,m:475},
    {n:"Перевозка на автотранспорте \"Социальное такси\" без сопровождения работника учреждения социального обслуживания в пределах населенного пункта, в рабочие дни 15 мин.",p:250,m:238},
  ]},
  {id:11,name:"Услуги по прокату технических средств реабилитации",icon:"",items:[
    {n:"Трость опорная (за 1 месяц)",p:210,m:200},
    {n:"Сиденье (стул для ванны) (1 месяц)",p:312,m:296},
    {n:"Ступени в ванну (1 месяц)",p:312,m:296},
    {n:"Ходунки (за 1 месяц)",p:416,m:395},
    {n:"Многофункциональная кровать для инвалидов (1 месяц)",p:1585,m:1506},
    {n:"Кровать многофункциональная механическая (1 месяц)",p:655,m:622},
    {n:"Кресло-коляска инвалидная (1 месяц)",p:728,m:692},
    {n:"Кресло-коляска для детей-инвалидов с ДЦП (1 месяц)",p:1270,m:1206},
    {n:"Кресло-коляска без электропривода (1 месяц)",p:880,m:836},
    {n:"Кресло-коляска Лиза (1 месяц)",p:1099,m:1044},
    {n:"Кресло-коляска с электроприводом (1 месяц)",p:1099,m:1044},
    {n:"Кресло-каталка с туалетным устройством с откидными подлокотниками и съемными подножками (1 месяц)",p:330,m:314},
    {n:"Кресло коляска со съемными подлокотниками и подножками поручни под стол ( 1 месяц)",p:175,m:166},
    {n:"Кресло коляска с санитарным устройством (1 месяц)",p:275,m:261},
    {n:"Кресло коляска для детей (1 месяц)",p:1260,m:1197},
    {n:"Матрац противопролежневый (1 месяц)",p:845,m:803},
    {n:"Костыли (локтевые или подмышечные) (за 1 месяц)",p:210,m:200},
    {n:"Прикроватный столик (1 месяц)",p:160,m:152},
    {n:"Пандус переносной (1 месяц)",p:110,m:104},
    {n:"Кресло-стул для душа (1 месяц)",p:165,m:157},
    {n:"Пандус трехсекционный (1 месяц)",p:210,m:200},
    {n:"Подьемное устройство для ванной (1 месяц)",p:545,m:518},
    {n:"Устройство для подьема и перемещения инвалида (1 месяц)",p:1248,m:1186},
    {n:"Захваты активные для лиц с нарушениями функций опорно-двигательного аппарата (1 месяц)",p:210,m:200},
    {n:"Поручень для туалета  (1 месяц)",p:210,m:200},
    {n:"Подъёмник лестничный (1 месяц)",p:660,m:627},
    {n:"Кресло-туалет (1 месяц)",p:160,m:152},
    {n:"Столик надкроватный (1 месяц)",p:312,m:296},
    {n:"Стул для ванны с подьемным устройством (1 месяц)",p:265,m:252},
    {n:"Ходунки для детей с ДЦП (1 месяц)",p:210,m:200},
    {n:"Динамический параподиум (1 месяц)",p:265,m:252},
    {n:"Тренажер вертикализатор (1 месяц)",p:420,m:399},
    {n:"Ванна-простыня для мытья в постели (1 месяц)",p:210,m:200},
    {n:"Пояс для перемещения маломобильных граждан (1 месяц)",p:208,m:198},
    {n:"Устройство для приподнимания (по типу веревочной лестницы), (1 месяц)",p:208,m:198},
    {n:"Скользящая доска для пересаживания (1 месяц)",p:208,m:198},
    {n:"Опора под спину (1 месяц)",p:208,m:198},
    {n:"Вертикализатор (1 месяц)",p:1456,m:1383},
    {n:"Ванна надувная для мытья в кровати, в том числе ванночка надувная для мытья головы (1 месяц)",p:265,m:252},
    {n:"Кресло-стул с санитарным оснащением (1 месяц)",p:728,m:692},
    {n:"Шагающая кресло-коляска Гради-Стандарт (1 месяц)",p:370,m:352},
    {n:"Мобильный лестничный подъемник гусеничного типа",p:600,m:570},
    {n:"Портативная телескопическая рампа",p:230,m:218},
    {n:"Насадка на унитаз 1 (месяц)",p:315,m:299},
    {n:"Противопролежневая система (1 месяц)",p:545,m:518},
    {n:"Доска для пересаживания инвалидов поворотная (за 1 месяц)",p:435,m:413},
  ]},
  {id:12,name:"Занятия в залах ЛФК, тренажерном, спортивном и танцевальном",icon:"",items:[
    {n:"Занятие в зале ЛФК групповое, до 40 мин.(не более 3х человек) без инструктора",p:600,m:570},
    {n:"Занятие в зале ЛФК индивидуальное, до  40 мин. (без инструктора)",p:400,m:380},
    {n:"Занятие в зале ЛФК групповое, до 40 мин.(не более 3х человек) c  инструктором",p:1100,m:1045},
    {n:"Занятие в зале ЛФК индивидуальное, до  40 мин. (c  инструктором)",p:700,m:665},
    {n:"Занятие адаптивной физической культурой индивидуально, до 30 мин. с инструктором",p:700,m:665},
    {n:"Занятие адаптивной физической культурой групповое,  до 30 мин, до 3х человек, с инструктором.",p:800,m:760},
    {n:"Занятие в спортивном зале  групповое ( до 60 мин.), не более 15 человек",p:1600,m:1520},
    {n:"Занятие в тренажерном зале, до 40 мин.индивидуальное, без инструктора",p:400,m:380},
    {n:"Занятие в тренажерном зале, до 40 мин.индивидуальное, с инструктором",p:700,m:665},
  ]},
  {id:13,name:"Психологические услуги",icon:"",items:[
    {n:"Психологическое консультирование взрослого, до 60 мин.",p:1000,m:950},
    {n:"Индивидуальные консультации психолога для детей до 13 лет (не более 30 мин.)",p:600,m:570},
    {n:"Индивидуальные консультации психолога для детей от 13 лет и старше (не более 45 мин.)",p:600,m:570},
    {n:"Индивидуальные консультации психолога семейной пары (не более 1ч.30 мин.)",p:1500,m:1425},
    {n:"Коррекционно-развивающие занятия с психологом (коррекция эмоционально-волевой, когнитивной сферы), до 30 мин.",p:800,m:760},
    {n:"Проведение групповых арттерапевтических занятий, мастер-классов, до 40 мин. (за 1 человека)",p:500,m:475},
    {n:"Сеанс релаксации в сенсорной комнате в сопровождении специалиста, до  40 мин.",p:500,m:475},
    {n:"Психологические тренинги (до 60 мин., не менее 7 человек, цена за 1 человека)",p:300,m:285},
    {n:"Проведение диагностики эмоционально-волевой сферы, до 30 мин.",p:500,m:475},
    {n:"Диагностика психо-эмоционального состояния (не более 2-х часов)",p:545,m:518},
    {n:"Проведение диагностики когнитивной сферы, определение коэффициента умственного развития IQ, до 90 мин.",p:800,m:760},
    {n:"Диагностика и коррекция межличностных отношений, до 120 мин.",p:800,m:760},
    {n:"Диагностика детско-родительских отношений (не более 2-х часов)",p:800,m:760},
    {n:"Прогноз и профилактика проблем обучения, социализация и профессиональное самоопределение старшеклассников, до 180 мин.",p:1000,m:950},
    {n:"Диагностика социального интеллекта, до 60 мин.",p:600,m:570},
    {n:"Диагностика обучаемости ребенка, до 60 мин.",p:600,m:570},
    {n:"Диагностика личностных особенностей (не более 2-ух часов)",p:700,m:665},
    {n:"Профориентационная диагностика (не более 2-ух часов)",p:750,m:712},
    {n:"Диагностика к адддиктивному поведению у подростков (не более 2-х часов)",p:800,m:760},
    {n:"Тренинговые групповые занятия по разработанной программе по обучению преодоления синдрома профессионального выгорания, до 60 мин.(стоимость за 1 человека)",p:310,m:294},
    {n:"Тренинговые групповые занятия по разработанной программе, до 60 мин., (стоимость за 1 человека)",p:310,m:294},
    {n:"Проведение обследования психологического состояния на выявление предпосылок профессионального выгорания (анкетирование, консультирование по результатам анкетирования, за 1 человека), до 40 мин.",p:300,m:285},
    {n:"Коррекция эмоционально-волевой сферы по разработанной программе для работы с признаками эмоционального выгорания возникшего в результате трудовой деятельности, до 30 мин.",p:300,m:285},
    {n:"Проведение групповых релаксационных арттерапевтических занятий по разработанной программе для снятия напряжения возникшего в результате трудовой деятельности, до 40 мин. (за 1 человека)",p:300,m:285},
    {n:"Консультирование психолога по разработанной программе по предотвращению последствий профессионального выгорания, до 1 часа",p:1000,m:950},
    {n:"Аудиовизуальная коррекция избавление от вредный привычек, нормализация сна, очищение организма, развитие когнитивных функций, самопрограммирование, до 30 мин.",p:350,m:332},
    {n:"Готовность к школьному обучению (не более 2-х часов)",p:800,m:760},
    {n:"Коррекционные занятия психолога с детьми от 3 до 7 лет (не более 20 мин.)",p:400,m:380},
    {n:"Коррекционные занятия психолога с детьми от 7 до 13 лет (не более 30 мин.)",p:450,m:428},
    {n:"Коррекционные занятия психолога с детьми от 13 лет и старше (не более 40 мин.)",p:500,m:475},
    {n:"Индивидуальное занятие психолога по подготовке детей к школе (1 сеанс - 30 минут)",p:287,m:273},
    {n:"Психодиагностическое обследование личности",p:545,m:518},
    {n:"Психологическое заключение, по результатам проведенной диагностики",p:545,m:518},
    {n:"Психологическая коррекция",p:545,m:518},
  ]},
  {id:14,name:"Педагогические услуги",icon:"",items:[
    {n:"Педагогическая коррекция речевого развития, до 30 мин.",p:800,m:760},
    {n:"Логопедический массаж, до 20 мин.",p:500,m:475},
    {n:"Зондовый массаж, до 20 мин.",p:500,m:475},
    {n:"Логопедическое консультирование, до 60 мин.",p:800,m:760},
    {n:"Логопедическая диагностика, до 60 мин.",p:900,m:855},
    {n:"Индивидуальное занятие с логопедом с детьми от 7 лет и старше (за 40 мин.)",p:500,m:475},
    {n:"Индивидуальное занятие с логопедом с детьми от 3 до 7 лет (за 20 мин.)",p:400,m:380},
    {n:"Коррекция речевых нарушений с применением интерактивного оборудования, до 30 минут",p:300,m:285},
    {n:"Консультирование логопеда по результатам диагностики, до 30 мин.",p:500,m:475},
    {n:"Диагностика дефектолога, до 60 мин.",p:1000,m:950},
    {n:"Консультирование дефектолога по результатам диагностики, до 30 мин.",p:500,m:475},
    {n:"Обучение функциональным навыкам коммуникации с помощью карточек PECS, до 30 мин.",p:500,m:475},
    {n:"Проведение клубной и кружковой работы по интересам (1 занятие -до  30 мин.)",p:300,m:285},
    {n:"Курс обучения компьютерной грамотности (1 занятие, до 30 мин.)",p:500,m:475},
    {n:"Занятия по арт-терапии (1 занятие, до 30 мин.)",p:400,m:380},
    {n:"Мастер - класс по декоративно - прикладному творчеству (1 занятие, до 30 мин.)",p:315,m:299},
    {n:"Мастер - класс в Гончарной мастерской ( 1 занятие, до 90 мин)",p:1700,m:1615},
    {n:"Подготовка   детей к школе от   5 до 7 лет (развитие памяти, внимания, логического мышления, развития речи, подготовка руки к письму, обучение к чтению).   Не более 1 часа   (1  ребенок)",p:450,m:428},
    {n:"Помощь в выполнении домашних заданий детям от 7 до 11 лет к школе за 1 час, за 1 человека",p:424,m:403},
    {n:"Обучение по программе с изучением темы «Понятие мотивации опекунов и попечителей. Проведение оценки гражданам, выразившим желание стать опекунами или попечителями совершеннолетних недееспособных или не полностью дееспособных граждан, своих способностей обеспечить потребности подопечных»  (1 занятие продолжительностью 45 минут)",p:525,m:499},
    {n:"Обучение по программе с изучением темы «Роль семьи в обеспечении достойного уровня жизни подопечного» (1 занятие продолжительностью 45 минут)",p:529,m:503},
    {n:"Педагогическое обследование личности, выдача характеристики и заключения (60 мин. На одного получателя)",p:1000,m:950},
    {n:"Занятие с детьми от 6 месяцев до 1,5 лет (за 1 занятие продолжительностью 1 час)",p:318,m:302},
    {n:"Занятие с детьми от 1.5 лет до 3 лет (за 1 занятие продолжительностью 1 час)",p:371,m:352},
    {n:"\"Социальная передышка\" для инвалидов от 3-х до 35 лет (1 посещение - не более 3 часов) в т.ч.: формирование позитивных интересов, организация досуга",p:400,m:380},
    {n:"Клуб для молодых инвалидов (18-35л.) «Второе рождение» (1 посещение - 3 часа) в т.ч.: психологическая коррекция, занятия в сенсорной комнате, трудотерапия",p:500,m:475},
    {n:"Консультация и прием учителя-дефектолога",p:1267,m:1204},
    {n:"Занятие с дефектологом",p:950,m:902},
    {n:"Занятие по психолого-педагогической коррекции",p:845,m:803},
  ]},
  {id:16,name:"Правовые услуги",icon:"",items:[
    {n:"Помощь иностранным гражданам в заполнении заявления на гражданство РФ (не более 2 часов)",p:3175,m:3016},
    {n:"Составление декларации 3-НДФЛ (за 1 декларацию)",p:952,m:904},
    {n:"Составление исковых заявлений (1 заявление)",p:2747,m:2610},
    {n:"Помощь иностранным гражданам в заполнении заявления: на разрешение временного проживания в РФ/ на разрешение вида на жительство в РФ (не более 1,5 часов)",p:2114,m:2008},
    {n:"Помощь иностранным гражданам в заполнении уведомления о постановке на миграционный учет/в заполнении документов на регистрацию по месту жительства/ в заполнении уведомления о подтверждении проживания на территории РФ (не более 30 минут)",p:846,m:804},
    {n:"Помощь в получении электронной услуги, из перечня услуг, на портале государственных и муниципальных услуг (не более 30 минут)",p:500,m:475},
    {n:"Помощь в получении электронной услуги, из перечня услуг, на портале государственных и муниципальных услуг (от 30 до 60 минут)",p:700,m:665},
    {n:"Создание личного кабинета на сайте государственных и муниципальных услуг, заведение электронной почты (не более 30 мин.)",p:100,m:95},
    {n:"Подготовка заявлений, жалоб, ходатайств, претензий, обращений, составление деловых писем (за один документ)",p:800,m:760},
  ]},
  {id:17,name:"Услуги в области медицины (прочие)",icon:"",items:[
    {n:"Фитотерапевтические процедуры (кислородный коктейль за 1 единицу)",p:104,m:99},
    {n:"Фитотерапевтические процедуры (фиточай за 1 единицу)",p:50,m:48},
    {n:"Измерение артериального давления (за 1 раз)",p:50,m:48},
    {n:"Кедровая фитобочка горизонтальная (до 30 мин.)",p:600,m:570},
    {n:"Инфракрасная сауна (до 40 мин.)",p:600,m:570},
    {n:"Матрасс электрический Серагем (до 30 мин)",p:275,m:261},
    {n:"Термотерапия на аппарате УВЧ-60 (до 20 мин)",p:212,m:201},
    {n:"Сильвинитовая спелеоклиматическая камера (до 30 мин)",p:275,m:261},
    {n:"Ингаляции (до 10 мин.)",p:200,m:190},
    {n:"Профилактика и оздоровление в \"соляной комнате\" не более 30 минут для детей до 16 лет (за 1 сеанс)",p:156,m:148},
    {n:"Профилактика и оздоровление в \"соляной комнате\" не более 30 минут для детей до 16 лет (за 10 сеансов)",p:1000,m:950},
    {n:"Профилактика и оздоровление в \"соляной комнате\" не более 30 минут для взрослых (за 1 сеанс)",p:208,m:198},
    {n:"Профилактика и оздоровление в \"соляной комнате\" не более 30 минут для взрослых (за 10 сеансов)",p:1500,m:1425},
    {n:"Лампа \"Биоптрон\" ( до 10 мин)",p:117,m:111},
    {n:"Аппарат ультрафиалетовое облучение \"УГН-1\" (до 10 мин)",p:110,m:104},
    {n:"Иппотерапия на тренажере, от 15 до 30 мин.",p:320,m:304},
    {n:"Обучение скандинавской ходьбе, до 30 мин.",p:320,m:304},
    {n:"Ванна жемчужная, до10 мин.",p:380,m:361},
    {n:"Подводный душ-массаж (дети), до 10 мин.",p:1100,m:1045},
    {n:"Подводный душ-массаж (взрослые), до 15 мин.",p:1375,m:1306},
    {n:"Процедура сухой углекислой ванны (до 20 мин)",p:275,m:261},
    {n:"Массаж детский общий от 1 мес. до 3 лет, до 30 мин.",p:1000,m:950},
    {n:"Массаж головы, до 10 мин.",p:260,m:247},
    {n:"Массаж шейно-воротниковой зоны, до 15 мин.",p:450,m:428},
    {n:"Массаж пояснично-крестцового отдела, до 15 мин.",p:430,m:408},
    {n:"Массаж грудного отдела позвоночника, до 15 мин.",p:340,m:323},
    {n:"Массаж нижних конечностей и стоп, до 15 мин.",p:350,m:332},
    {n:"Массаж верхних конечностей, до 15 мин.",p:260,m:247},
    {n:"Массаж спины, до 25 мин.",p:600,m:570},
    {n:"Общий массаж от 3 лет до 15 лет,  до 50 мин.",p:1320,m:1254},
    {n:"Массаж головы, до 15 мин.",p:300,m:285},
    {n:"Массаж лица, до 15 мин.",p:340,m:323},
    {n:"Массаж шейно-воротниковой зоны, до 15 мин.",p:550,m:522},
    {n:"Массаж пояснично-крестцового отдела, до 15 мин.",p:530,m:504},
    {n:"Массаж грудного отдела позвоночника, до 15 мин.",p:360,m:342},
    {n:"Массаж нижних конечностей и стоп, до 15 мин.",p:450,m:428},
    {n:"Массаж верхних конечностей, до 15 мин.",p:360,m:342},
    {n:"Массаж спины, до 25 мин.",p:1000,m:950},
    {n:"Общий массаж (спина, верхние конечности, нижние конечности и стопы),  до 1 часа",p:2500,m:2375},
    {n:"Массаж антицеллюлитный (живот, бедра, ягодицы, спина), до 50 мин.",p:1323,m:1257},
    {n:"Бесконтактный гидромассаж «Акварелакс», до 10 мин.",p:530,m:504},
    {n:"\"Прессотерапия (нижний отдел), до 30 мин.",p:475,m:451},
    {n:"\"Прессотерапия\" (верхний отдел), до 30 мин.",p:300,m:285},
    {n:"\"Массажное кресло\" (до 15 мин.)",p:160,m:152},
    {n:"Аппарат механотерапевтический  \"СERAGEM\" (до 40 мин)",p:385,m:366},
    {n:"Массажная кровать НУГА БЕСТ (38 мин)",p:500,m:475},
    {n:"Массажер для ног",p:160,m:152},
    {n:"Электрофорез с лекарственными средствами, до 20 мин.",p:345,m:328},
    {n:"Лечебное воздействие диадинамическими токами аппаратом ТОНУС-Бр (за 1 услугу) 30 минут",p:328,m:312},
    {n:"Фотохромная терапия (\"Спектр\") (за 1 услугу) 20 минут",p:160,m:152},
    {n:"Аппарат физиотерапевтический ЭЛЭСКУЛАП (до 30 мин)",p:330,m:314},
    {n:"Магнитотерапия, до 10 мин.",p:265,m:252},
    {n:"Магнитолазерная терапия (за 1 услугу)",p:318,m:302},
    {n:"Аппарат магнитотерапевтический \"Полимаг-02М\" (до 20 мин)",p:180,m:171},
    {n:"Комбинированная ультразвуковая терапия на аппарате Intelect Advanced, от 5 до 10 мин.",p:320,m:304},
    {n:"Аппарат физиотерапевтический \"СОНОПУЛЬС\", \"УЗТ-101Ф\" (до 10 мин)",p:220,m:209},
    {n:"Аппарат физиотерапевтический Lasermed (до 10 мин)",p:180,m:171},
    {n:"Электросонтерапия, до 30мин",p:845,m:803},
    {n:"Аппарат ТрансАир-01п (до 30 мин)",p:330,m:314},
    {n:"Проведение сеанса нейросенсорной стимуляции с помощью программно-аппаратного комплекса TalksUp (А. Томатиса), до 60 мин",p:685,m:651},
  ]},
  {id:19,name:"Услуги по проведению детских и семейных праздников",icon:"",items:[
    {n:"Костюмированное поздравление на дому к праздничным датам (программа на 10 мин.),",p:2000,m:1900},
    {n:"Поздравление Деда Мороза и Снегурочки на территории заказчика (до 15 минут)",p:2000,m:1900},
    {n:"Проведение мероприятий к праздничным датам (группа не менее 10 человек) на территории центра, оплата за 1 человека за час",p:335,m:318},
    {n:"Театрализованное поздравление ребенка на дому (2 персонажа) (доставка персонажей на ТС учреждения) (20 мин)",p:1585,m:1506},
  ]},
  {id:20,name:"Услуга в области фотографии",icon:"",items:[
    {n:"Фотографирование и запись фотографий на цифровой носитель учреждения (до 60 мин.)",p:210,m:200},
    {n:"Фотосессия с использованием помещений филиала «Гармония» в г. Губкинский, 1 час",p:500,m:475},
  ]},
  {id:21,name:"Услуги по созданию видеороликов",icon:"",items:[
    {n:"Создание видеоролика на основании материалов видеосъемок мероприятий учреждения (до 10 мин.)",p:500,m:475},
  ]},
  {id:22,name:"Услуги по уходу и присмотру за детьми с установленным паллиативным статусом",icon:"",items:[
    {n:"Услуга по уходу и присмотру за детьми с установленным паллиативным статусом в полустационарной форме социального обслуживания до 3 часов (1 час)",p:500,m:475},
    {n:"Услуга по уходу и присмотру за детьми с установленным паллиативным статусом в форме социального обслуживания на дому до 3 часов (1 час)",p:500,m:475},
  ]},
  {id:24,name:"Услуги сиделки (няни)",icon:"",items:[
    {n:"Услуги сиделки (присмотр за гражданами пожилого возраста и инвалидами) (за 1 час)",p:423,m:402},
    {n:"Няня для ребенка (за 1 час)",p:265,m:252},
    {n:"Присмотр за детьми-инвалидами на дому (с 3-х до 18 лет) (за 1 час)",p:370,m:352},
    {n:"Присмотр за детьми-инвалидами в учреждении (с 3-х до 18 лет) (за 1 час)",p:160,m:152},
    {n:"Сопровождение няней ребенка (в школу, секции и т.д.) (за 1 услугу не более 30 минут)",p:265,m:252},
    {n:"Сопровождение на прогулку (за 1 услугу не более 1 часа)",p:212,m:201},
  ]},
  
  
  
];


const NOYABRSK_STAFF=[
{dept:"Администрация",name:"Никогло Светлана Васильевна",pos:"Директор",ext:"",email:""},
{dept:"Администрация",name:"Лапенко Светлана Викторовна",pos:"Заместитель директора",ext:"",email:""},
{dept:"Администрация",name:"Шишола Елена Николаевна",pos:"Заместитель директора",ext:"",email:""},
{dept:"Администрация",name:"Шуль Кристина Викторовна",pos:"Заместитель директора",ext:"",email:""},
{dept:"Администрация",name:"Мамонтова Екатерина Сергеевна",pos:"Юрисконсульт",ext:"",email:""},
{dept:"Администрация",name:"Рева Анастасия Андреевна",pos:"Секретарь руководителя",ext:"",email:""},
{dept:"Администрация",name:"Шишкина Екатерина Владимировна",pos:"Администратор",ext:"",email:""},
{dept:"Стационарное отделение",name:"Петровна Валентина Тимофеевна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Стационарное отделение",name:"Зинченко Виктория",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Стационарное отделение",name:"Шевчук Татьяна Сергеевна",pos:"Социальный работник",ext:"",email:""},
{dept:"Стационарное отделение",name:"Стеблянко Алина Анатольевна",pos:"Воспитатель",ext:"",email:""},
{dept:"Стационарное отделение",name:"Цапаева Елена Витальевна",pos:"Воспитатель",ext:"",email:""},
{dept:"Стационарное отделение",name:"Верман Евгения Владимировна",pos:"Воспитатель",ext:"",email:""},
{dept:"Стационарное отделение",name:"Шуева Виктория Станиславовна",pos:"Воспитатель",ext:"",email:""},
{dept:"Стационарное отделение",name:"Касияди Татьяна Григорьевна",pos:"Воспитатель",ext:"",email:""},



{dept:"Стационарное отделение",name:"Титаренко Виктория Александровна",pos:"Психолог",ext:"",email:""},
{dept:"Отделение профилактики безнадзорности",name:"Сабирова Венера Кайрулловна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение профилактики безнадзорности",name:"Биктимирова Гульназ Рафиковна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение профилактики безнадзорности",name:"Лысенко Яна Михайловна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение профилактики безнадзорности",name:"Дмитриев Андрей Владимирович",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение профилактики безнадзорности",name:"Джураева Ольга Геннадьевна",pos:"Психолог",ext:"",email:""},
{dept:"Отделение срочного социального обслуживания",name:"Червень Светлана Филипповна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение срочного социального обслуживания",name:"Филимонова Вита Михайловна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение срочного социального обслуживания",name:"Порошин Сергей Александрович",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение срочного социального обслуживания",name:"Рынгач Сергей Фёдорович",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение срочного социального обслуживания",name:"Иконникова Юлия Николаевна",pos:"Диспетчер",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Крижановская Виктория Григорьевна",pos:"Заведующий отделением",ext:"",email:""},





{dept:"Отделение комплексной реабилитации",name:"Глущенко Елена Николаевна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Чурилова Ирина Анатольевна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Киселева Ирина Борисовна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Елинова Инна Вячеславовна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Дмитриева Галина Петровна",pos:"Инструктор по труду",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Наконечная Александра Владимировна",pos:"Педагог-психолог",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Старовойтова Олеся Анатольевна",pos:"Психолог",ext:"",email:""},


{dept:"Отделение комплексной реабилитации",name:"Ковешникова Валентина Алексеевна",pos:"Учитель-дефектолог",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Пономарева Алла Леонидовна",pos:"Социальный педагог",ext:"",email:""},
{dept:"Отделение комплексной реабилитации",name:"Хабарова Елена Васильевна",pos:"Социальный педагог",ext:"",email:""},
{dept:"Отделение первичного приема семей",name:"Фищукова Александра Александровна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение первичного приема семей",name:"Кунгурова Юлия Александровна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение первичного приема семей",name:"Калиевская Маргарита Сергеевна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение экстренной психологической помощи",name:"Хизбуллин Вильдан Ферузович",pos:"Психолог",ext:"",email:""},
{dept:"Отделение экстренной психологической помощи",name:"Субботин Андрей Анатольевич",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение оказания социальных услуг",name:"Корчевная Алла Александровна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение оказания социальных услуг",name:"Моисеева Олеся Михайловна",pos:"Специалист по социальной работе",ext:"",email:""},
{dept:"Отделение оказания социальных услуг",name:"Кий Людмила Васильевна",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение оказания социальных услуг",name:"Шершун Полина Григорьевна",pos:"Воспитатель",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Агасиева Мадина Насировна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Шмурина Татьяна Владимировна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Гулиева Райсат Магомедовна",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Белекбаева Чынаркул Оморовна",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Жданова Яна Васильевна",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Селянкина Лариса Геннадьевна",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Керимова Нежабат Сиражудиновна",pos:"Социальный работник",ext:"",email:""},
{dept:"Отделение соц. обслуживания на дому",name:"Павлова Валерия Александровна",pos:"Социальный работник",ext:"",email:""},












{dept:"Отделение социального сопровождения участников СВО",name:"Фомичева Татьяна Анатольевна",pos:"Заведующий отделением",ext:"",email:""},
{dept:"Отделение социального сопровождения участников СВО",name:"Тимошенко Леся Васильевна",pos:"Юрисконсульт",ext:"",email:""},
{dept:"Отделение социального сопровождения участников СВО",name:"Рябова Екатерина Павловна",pos:"Воспитатель",ext:"",email:""},
{dept:"Отделение социального сопровождения участников СВО",name:"Лебедева Анна Фаритовна",pos:"Медицинский психолог",ext:"",email:""},
{dept:"Отделение социального сопровождения участников СВО",name:"Данченко Наталья Викторовна",pos:"Психолог",ext:"",email:""},
{dept:"Отделение активного долголетия",name:"Цепилов Владимир Юрьевич",pos:"Специалист по социальной работе",ext:"",email:""}
];

const NOYABRSK_SERVICES=[









{id:10,name:"Услуги по перевозке на автомобильном транспорте",icon:"",rating:4.8,items:[{n:"Перевозка на автотранспорте \"Социальное такси\" с сопровождением работника учреждения социального обслуживания, в рабочие дни 30 мин.",p:930,m:884},{n:"Перевозка на автотранспорте \"Социальное такси\" без сопровождения работника учреждения социального обслуживания, в рабочие дни 30 мин.",p:500,m:475},{n:"Перевозка на автотранспорте \"Социальное такси\" без сопровождения работника учреждения социального обслуживания в пределах населенного пункта, в рабочие дни 15 мин.",p:250,m:238}]},

{id:12,name:"Занятия в залах ЛФК, тренажерном, спортивном и танцевальном",icon:"",rating:4.8,items:[{n:"Занятие в зале ЛФК групповое, до 40 мин.(не более 3х человек) без инструктора",p:600,m:570},{n:"Занятие в зале ЛФК индивидуальное, до 40 мин. (без инструктора)",p:400,m:380},{n:"Занятие в зале ЛФК групповое, до 40 мин.(не более 3х человек) c инструктором",p:1100,m:1045},{n:"Занятие в зале ЛФК индивидуальное, до 40 мин. (c инструктором)",p:700,m:665},{n:"Занятие адаптивной физической культурой индивидуально, до 30 мин. с инструктором",p:700,m:665},{n:"Занятие адаптивной физической культурой групповое, до 30 мин, до 3х человек, с инструктором.",p:800,m:760},{n:"Занятие в спортивном зале групповое ( до 60 мин.), не более 15 человек",p:1600,m:1520},{n:"Занятие в тренажерном зале, до 40 мин.индивидуальное, без инструктора",p:400,m:380},{n:"Занятие в тренажерном зале, до 40 мин.индивидуальное, с инструктором",p:700,m:665}]},
{id:13,name:"Психологические услуги",icon:"",rating:4.8,items:[{n:"Психологическое консультирование взрослого, до 60 мин.",p:1000,m:950},{n:"Индивидуальные консультации психолога для детей до 13 лет (не более 30 мин.)",p:600,m:570},{n:"Индивидуальные консультации психолога для детей от 13 лет и старше (не более 45 мин.)",p:600,m:570},{n:"Индивидуальные консультации психолога семейной пары (не более 1ч.30 мин.)",p:1500,m:1425},{n:"Коррекционно-развивающие занятия с психологом (коррекция эмоционально-волевой, когнитивной сферы), до 30 мин.",p:800,m:760},{n:"Проведение групповых арттерапевтических занятий, мастер-классов, до 40 мин. (за 1 человека)",p:500,m:475},{n:"Сеанс релаксации в сенсорной комнате в сопровождении специалиста, до 40 мин.",p:500,m:475},{n:"Психологические тренинги (до 60 мин., не менее 7 человек, цена за 1 человека)",p:300,m:285},{n:"Проведение диагностики эмоционально-волевой сферы, до 30 мин.",p:500,m:475},{n:"Диагностика психо-эмоционального состояния (не более 2-х часов)",p:545,m:518},{n:"Проведение диагностики когнитивной сферы, определение коэффициента умственного развития IQ, до 90 мин.",p:800,m:760},{n:"Диагностика и коррекция межличностных отношений, до 120 мин.",p:800,m:760},{n:"Диагностика детско-родительских отношений (не более 2-х часов)",p:800,m:760},{n:"Прогноз и профилактика проблем обучения, социализация и профессиональное самоопределение старшеклассников, до 180 мин.",p:1000,m:950},{n:"Диагностика социального интеллекта, до 60 мин.",p:600,m:570},{n:"Диагностика обучаемости ребенка, до 60 мин.",p:600,m:570},{n:"Диагностика личностных особенностей (не более 2-ух часов)",p:700,m:665},{n:"Профориентационная диагностика (не более 2-ух часов)",p:750,m:713},{n:"Диагностика к адддиктивному поведению у подростков (не более 2-х часов)",p:800,m:760},{n:"Тренинговые групповые занятия по разработанной программе по обучению преодоления синдрома профессионального выгорания, до 60 мин.(стоимость за 1 человека)",p:310,m:295},{n:"Тренинговые групповые занятия по разработанной программе, до 60 мин., (стоимость за 1 человека)",p:310,m:295},{n:"Проведение обследования психологического состояния на выявление предпосылок профессионального выгорания (анкетирование, консультирование по результатам анкетирования, за 1 человека), до 40 мин.",p:300,m:285},{n:"Коррекция эмоционально-волевой сферы по разработанной программе для работы с признаками эмоционального выгорания возникшего в результате трудовой деятельности, до 30 мин.",p:300,m:285},{n:"Проведение групповых релаксационных арттерапевтических занятий по разработанной программе для снятия напряжения возникшего в результате трудовой деятельности, до 40 мин. (за 1 человека)",p:300,m:285},{n:"Консультирование психолога по разработанной программе по предотвращению последствий профессионального выгорания, до 1 часа",p:1000,m:950},{n:"Аудиовизуальная коррекция избавление от вредный привычек, нормализация сна, очищение организма, развитие когнитивных функций, самопрограммирование, до 30 мин.",p:350,m:333},{n:"Готовность к школьному обучению (не более 2-х часов)",p:800,m:760},{n:"Коррекционные занятия психолога с детьми от 3 до 7 лет (не более 20 мин.)",p:400,m:380},{n:"Коррекционные занятия психолога с детьми от 7 до 13 лет (не более 30 мин.)",p:450,m:428},{n:"Коррекционные занятия психолога с детьми от 13 лет и старше (не более 40 мин.)",p:500,m:475},{n:"Индивидуальное занятие психолога по подготовке детей к школе (1 сеанс - 30 минут)",p:287,m:273},{n:"Психодиагностическое обследование личности",p:545,m:518},{n:"Психологическое заключение, по результатам проведенной диагностики",p:545,m:518},{n:"Психологическая коррекция",p:545,m:518}]},
{id:14,name:"Педагогические услуги",icon:"",rating:4.8,items:[{n:"Педагогическая коррекция речевого развития, до 30 мин.",p:800,m:760},{n:"Логопедический массаж, до 20 мин.",p:500,m:475},{n:"Зондовый массаж, до 20 мин.",p:500,m:475},{n:"Логопедическое консультирование, до 60 мин.",p:800,m:760},{n:"Логопедическая диагностика, до 60 мин.",p:900,m:855},{n:"Индивидуальное занятие с логопедом с детьми от 7 лет и старше (за 40 мин.)",p:500,m:475},{n:"Индивидуальное занятие с логопедом с детьми от 3 до 7 лет (за 20 мин.)",p:400,m:380},{n:"Коррекция речевых нарушений с применением интерактивного оборудования, до 30 минут",p:300,m:285},{n:"Консультирование логопеда по результатам диагностики, до 30 мин.",p:500,m:475},{n:"Диагностика дефектолога, до 60 мин.",p:1000,m:950},{n:"Консультирование дефектолога по результатам диагностики, до 30 мин.",p:500,m:475},{n:"Обучение функциональным навыкам коммуникации с помощью карточек PECS, до 30 мин.",p:500,m:475},{n:"Проведение клубной и кружковой работы по интересам (1 занятие -до 30 мин.)",p:300,m:285},{n:"Курс обучения компьютерной грамотности (1 занятие, до 30 мин.)",p:500,m:475},{n:"Занятия по арт-терапии (1 занятие, до 30 мин.)",p:400,m:380},{n:"Мастер - класс по декоративно - прикладному творчеству (1 занятие, до 30 мин.)",p:315,m:299},{n:"Мастер - класс в Гончарной мастерской ( 1 занятие, до 90 мин)",p:1700,m:1615},{n:"Подготовка детей к школе от 5 до 7 лет (развитие памяти, внимания, логического мышления, развития речи, подготовка руки к письму, обучение к чтению). Не более 1 часа (1 ребенок)",p:450,m:428},{n:"Помощь в выполнении домашних заданий детям от 7 до 11 лет к школе за 1 час, за 1 человека",p:424,m:403},{n:"Обучение по программе с изучением темы «Понятие мотивации опекунов и попечителей. Проведение оценки гражданам, выразившим желание стать опекунами или попечителями совершеннолетних недееспособных или не полностью дееспособных граждан, своих способностей обеспечить потребности подопечных» (1 занятие продолжительностью 45 минут)",p:525,m:499},{n:"Обучение по программе с изучением темы «Роль семьи в обеспечении достойного уровня жизни подопечного» (1 занятие продолжительностью 45 минут)",p:529,m:503},{n:"Педагогическое обследование личности, выдача характеристики и заключения (60 мин. На одного получателя)",p:1000,m:950},{n:"Занятие с детьми от 6 месяцев до 1,5 лет (за 1 занятие продолжительностью 1 час)",p:318,m:302},{n:"Занятие с детьми от 1.5 лет до 3 лет (за 1 занятие продолжительностью 1 час)",p:371,m:352},{n:"\"Социальная передышка\" для инвалидов от 3-х до 35 лет (1 посещение - не более 3 часов) в т.ч.: формирование позитивных интересов, организация досуга",p:400,m:380},{n:"Клуб для молодых инвалидов (18-35л.) «Второе рождение» (1 посещение - 3 часа) в т.ч.: психологическая коррекция, занятия в сенсорной комнате, трудотерапия",p:500,m:475},{n:"Консультация и прием учителя-дефектолога",p:1267,m:1204},{n:"Занятие с дефектологом",p:950,m:903},{n:"Занятие по психолого-педагогической коррекции",p:845,m:803}]},




{id:19,name:"Услуги по проведению детских и семейных праздников",icon:"",rating:4.8,items:[{n:"Костюмированное поздравление на дому к праздничным датам (программа на 10 мин.),",p:2000,m:1900},{n:"Поздравление Деда Мороза и Снегурочки на территории заказчика (до 15 минут)",p:2000,m:1900},{n:"Организация и проведение семейных и детских праздников - написание сценария мероприятия, услуги ведущего (до 60 мин.)",p:3000,m:2850},{n:"Проведение мероприятий к праздничным датам (группа не менее 10 человек) на территории центра, оплата за 1 человека за час",p:335,m:318},{n:"Поздравление с праздничными и знаменательными датами на территории заказчика (60 мин)",p:1575,m:1496},{n:"Театрализованное поздравление ребенка на дому (2 персонажа) (доставка персонажей на ТС учреждения) (20 мин)",p:1585,m:1506}]},



{id:23,name:"Гостиничные услуги (предоставление мест для краткосрочного проживания)",icon:"",rating:4.8,items:[{n:"Предоставление койко-места в социальной гостинице (1 сутки)",p:1100,m:1045}]},




];

// ═══ ПУРОВСКИЙ РАЙОН (Тарко-Сале + пгт. Уренгой — общий филиал) ═══
const PUROVSKY_SERVICES=[
  {id:10,name:"Услуги по перевозке на автомобильном транспорте",icon:"",items:[
    {n:"Перевозка на автотранспорте \"Социальное такси\" с сопровождением работника учреждения социального обслуживания, в рабочие дни 30 мин.",p:930,m:884},
    {n:"Перевозка на автотранспорте \"Социальное такси\" без сопровождения работника учреждения социального обслуживания, в рабочие дни 30 мин.",p:500,m:475},
    {n:"Перевозка на автотранспорте \"Социальное такси\" без сопровождения работника учреждения социального обслуживания в пределах населенного пункта, в рабочие дни 15 мин.",p:250,m:238},
  ]},
  {id:12,name:"Занятия в залах ЛФК, тренажерном, спортивном и танцевальном",icon:"",items:[
    {n:"Занятие в зале ЛФК индивидуальное, до  40 мин. (без инструктора)",p:400,m:380},
    {n:"Занятие в зале ЛФК индивидуальное, до  40 мин. (c  инструктором)",p:700,m:665},
    {n:"Занятие адаптивной физической культурой индивидуально, до 30 мин. с инструктором",p:700,m:665},
    {n:"Занятие в тренажерном зале, до 40 мин.индивидуальное, с инструктором",p:700,m:665},
  ]},
  {id:13,name:"Психологические услуги",icon:"",items:[
    {n:"Психологическое консультирование взрослого, до 60 мин.",p:1000,m:950},
    {n:"Диагностика психо-эмоционального состояния (не более 2-х часов)",p:545,m:518},
    {n:"Коррекционные занятия психолога с детьми от 3 до 7 лет (не более 20 мин.)",p:400,m:380},
    {n:"Коррекционные занятия психолога с детьми от 7 до 13 лет (не более 30 мин.)",p:450,m:428},
    {n:"Коррекционные занятия психолога с детьми от 13 лет и старше (не более 40 мин.)",p:500,m:475},
    {n:"Индивидуальное занятие психолога по подготовке детей к школе (1 сеанс - 30 минут)",p:287,m:273},
    {n:"Психодиагностическое обследование личности",p:545,m:518},
    {n:"Психологическое заключение, по результатам проведенной диагностики",p:545,m:518},
    {n:"Психологическая коррекция",p:545,m:518},
  ]},
  {id:14,name:"Педагогические услуги",icon:"",items:[
    {n:"Педагогическая коррекция речевого развития, до 30 мин.",p:800,m:760},
    {n:"Логопедический массаж, до 20 мин.",p:500,m:475},
    {n:"Логопедическое консультирование, до 60 мин.",p:800,m:760},
    {n:"Логопедическая диагностика, до 60 мин.",p:900,m:855},
    {n:"Диагностика дефектолога, до 60 мин.",p:1000,m:950},
    {n:"Занятие с дефектологом",p:950,m:902},
    {n:"Занятие по психолого-педагогической коррекции",p:845,m:803},
  ]},
  {id:19,name:"Услуги по проведению детских и семейных праздников",icon:"",items:[
    {n:"Поздравление Деда Мороза и Снегурочки на территории заказчика (до 15 минут)",p:2000,m:1900},
    {n:"Организация и проведение семейных и детских праздников - написание сценария мероприятия, услуги ведущего (до 60 мин.)",p:3000,m:2850},
    {n:"Поздравление с праздничными и знаменательными датами на территории заказчика (60 мин)",p:1575,m:1496},
  ]},
  {id:23,name:"Гостиничные услуги (предоставление мест для краткосрочного проживания)",icon:"",items:[
    {n:"Предоставление койко-места в социальной гостинице (1 сутки)",p:1100,m:1045},
  ]},
  
];

const PUROVSKY_STAFF=[
  {dept:"Административно-управленческий персонал",name:"Корб Оксана Ивановна",pos:"Директор филиала",ext:"",email:""},
  {dept:"Административно-управленческий персонал",name:"Рогальская Светлана Геннадьевна",pos:"Заместитель директора филиала",ext:"",email:""},
  {dept:"Административно-управленческий персонал",name:"Мерзлякова Светлана Сергеевна",pos:"Секретарь руководителя",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Остапенко Аким Юрьевич",pos:"Заведующий отделением",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Ходырева Татьяна Валентиновна",pos:"Психолог",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Ермоц Екатерина Геннадьевна",pos:"Воспитатель",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Кузьмина Нина Геннадьевна",pos:"Воспитатель",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Купцова Диана Дмитриевна",pos:"Воспитатель",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Лаптева Наталья Геннадьевна",pos:"Воспитатель",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Щирова Зарина Фаритовна",pos:"Воспитатель",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Думченко Наида Ахмедпашаевна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Морозова Елена Валерьевна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Бокова Светлана Брониславовна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Нахалова Виктория Борисовна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Стационарное отделение",name:"Шардакова Альсина Фанисовна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение профилактики безнадзорности и правонарушений несовершеннолетних",name:"Евсеева Мария Константиновна",pos:"Психолог",ext:"",email:""},
  {dept:"Отделение профилактики безнадзорности и правонарушений несовершеннолетних",name:"Айваседо Виталий Викторович",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение профилактики безнадзорности и правонарушений несовершеннолетних",name:"Балыбердина Светлана Владимировна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение профилактики безнадзорности и правонарушений несовершеннолетних",name:"Михеев Семен Сергеевич",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение профилактики безнадзорности и правонарушений несовершеннолетних",name:"Степанов Игорь Владимирович",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение срочного социального обслуживания",name:"Головский Николай Петрович",pos:"Заведующий отделением",ext:"",email:""},
  {dept:"Отделение срочного социального обслуживания",name:"Грицюк Елена Александровна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение срочного социального обслуживания",name:"Катюшина Ольга Александровна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение срочного социального обслуживания",name:"Артеева Ольга Аглямовна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Нигматуллина Дина Камиловна",pos:"Заведующий отделением",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Петрусевич Алина Владимировна",pos:"Заведующий отделением",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Богомазова Алена Анатольевна 0,5 осн.",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Видрашко Наталья Евгеньевна 0,5 осн.",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Калинина Оксана Владимировна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Айваседо Инна Акалевна 0,5 внутр. совмест.",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Калинина Оксана Владимировна 0,5 внутр. совм.",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение социального обслуживания на дому и долговременного ухода",name:"Няч Дарья Константиновна 0,5 (за Айваседо И.А.)",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение авктивного долголетия и социализации граждан",name:"Шостак Татьяна Ивановна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Платонова Ксения Сергеевна",pos:"Заведующий отделением",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Миханошина Алёна Александровна",pos:"Психолог",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Рябинина Ксения Александровна",pos:"Учитель - дефектолог",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Погрибенко Екатерина Анатольевна",pos:"Инструктор по труду",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Амренова Алия Мусовна",pos:"Педагог-психолог",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Ташниченко Наталья Валентиновна",pos:"Педагог-психолог",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Кунина Олеся Нестеровна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Эбергардт Анна Викторовна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Камышова Татьяна Александровна",pos:"Социальный педагог",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Рябинин Владислав Андреевич",pos:"Инструктор по лечебной физкультуре",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Головский Николай Петрович 0,5 ст.",pos:"Инструктор-методист по лечебной физкультуре",ext:"",email:""},
  {dept:"Отделение комплексной реабилитации и ранней помощи",name:"Скосарева Светлана Васильевна",pos:"Врач-терапевт",ext:"",email:""},
  {dept:"Отделение первичного приема семей",name:"Богдан Лилия Равиловна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение первичного приема семей",name:"Виттих Дарья Александровна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение экстренной психологической помощи и экстреннего реагирования",name:"Балакина Светлана Петровна",pos:"Психолог",ext:"",email:""},
  {dept:"Отделение экстренной психологической помощи и экстреннего реагирования",name:"Волынская Наталья Владимировна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг и социального сопровождения",name:"Корчажникова Марина Александровна",pos:"Заведующий отделением",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг и социального сопровождения",name:"Лахтина Надежда Николаевна",pos:"Воспитатель",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг и социального сопровождения",name:"Кенцало Ирина Александровна",pos:"Социальный работник",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг и социального сопровождения",name:"Бейсекеева Диана Александровна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг и социального сопровождения",name:"Гуляева Анастасия Михайловна",pos:"Специалист по социальной работе",ext:"",email:""},
  {dept:"Отделение оказания социальных услуг и социального сопровождения",name:"Дрегун Виктория Николаевна",pos:"Специалист по социальной работе",ext:"",email:""},
];

const branchContent={
  gubkin:    {services:GUBKIN_SERVICES, staff:GUBKIN_STAFF},
  purpe:     {services:JSON.parse(JSON.stringify(GUBKIN_SERVICES)), staff:JSON.parse(JSON.stringify(GUBKIN_STAFF))},
  muravlenko:{services:[], staff:[]},
  noyabrsk:  {services:NOYABRSK_SERVICES, staff:NOYABRSK_STAFF},
  tarko:     {services:JSON.parse(JSON.stringify(PUROVSKY_SERVICES)), staff:JSON.parse(JSON.stringify(PUROVSKY_STAFF))},
  urengoy:   {services:JSON.parse(JSON.stringify(PUROVSKY_SERVICES)), staff:JSON.parse(JSON.stringify(PUROVSKY_STAFF))}
};

/* Значок пользователя — аватар, пока не загружено фото */
window.USER_ICON='<svg class="ava-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.2" r="3.6"/><path d="M4.8 20c.6-3.7 3.5-6 7.2-6s6.6 2.3 7.2 6"/></svg>';

/* ═══ Реестр филиалов — единственный источник списка филиалов и их названий ═══
   Порядок здесь = порядок в списках приложения и панели. Филиалы можно добавлять
   и удалять в панели (раздел «Филиалы»), реестр сохраняется вместе с данными. */
const BRANCH_REGISTRY=[
  {id:"gubkin",name:"Губкинский"},{id:"purpe",name:"мкр. Пурпе"},{id:"muravlenko",name:"Муравленко"},
  {id:"noyabrsk",name:"Ноябрьск"},{id:"tarko",name:"Тарко-Сале"},{id:"urengoy",name:"пгт. Уренгой"}
];
const BRANCH_NAMES_MAP={};            /* id → название; один объект на всё приложение */
function syncBranchMaps(){
  Object.keys(BRANCH_NAMES_MAP).forEach(function(k){delete BRANCH_NAMES_MAP[k];});
  BRANCH_REGISTRY.forEach(function(b){BRANCH_NAMES_MAP[b.id]=b.name;});
}
function branchIds(){return BRANCH_REGISTRY.map(function(b){return b.id;}).filter(function(id){return cityData[id]&&branchContent[id];});}
function branchName(id){return BRANCH_NAMES_MAP[id]||id;}
function firstBranch(){return branchIds()[0]||"gubkin";}
function curCityData(){return cityData[currentCity]||cityData[firstBranch()]||{};}
function emptyBranchContacts(name){
  return {address:"",phone:"",phoneRaw:"",email:"",hours:"Пн–Пт: 08:30–18:00, обед 12:30–14:00",openH:8,openM:30,closeH:18,closeM:0,name:name};
}
/* Добавить филиал: копия данных другого филиала или пустой */
function addBranch(id,name,copyFrom){
  if(!/^[a-z0-9_-]{2,40}$/.test(id)||cityData[id])return false;
  const src=copyFrom&&branchContent[copyFrom];
  cityData[id]=src?Object.assign({},JSON.parse(JSON.stringify(cityData[copyFrom]))):emptyBranchContacts(name);
  branchContent[id]=src?JSON.parse(JSON.stringify(branchContent[copyFrom])):{services:[],staff:[],fleet:[],shifts:[],places:[]};
  BRANCH_REGISTRY.push({id:id,name:name});syncBranchMaps();
  return true;
}
function removeBranch(id){
  const i=BRANCH_REGISTRY.findIndex(function(b){return b.id===id;});
  if(i<0||BRANCH_REGISTRY.length<2)return false;
  BRANCH_REGISTRY.splice(i,1);delete cityData[id];delete branchContent[id];syncBranchMaps();
  return true;
}
/* Применить реестр из сохранённых данных: создаёт недостающие филиалы, убирает удалённые */
function applyBranchRegistry(list){
  if(!Array.isArray(list)||!list.length)return;
  const clean=list.filter(function(b){return b&&/^[a-z0-9_-]{2,40}$/.test(b.id)&&b.name;});
  if(!clean.length)return;
  const keep={};clean.forEach(function(b){keep[b.id]=1;
    if(!cityData[b.id])cityData[b.id]=emptyBranchContacts(b.name);
    if(!branchContent[b.id])branchContent[b.id]={services:[],staff:[],fleet:[],shifts:[],places:[]};});
  Object.keys(cityData).forEach(function(k){if(!keep[k]){delete cityData[k];delete branchContent[k];}});
  BRANCH_REGISTRY.length=0;clean.forEach(function(b){BRANCH_REGISTRY.push({id:b.id,name:String(b.name)});});
  syncBranchMaps();
}
syncBranchMaps();

/* Чистка текстов прейскуранта: двойные пробелы, пробелы у скобок, латинские буквы,
   случайно набранные внутри русских слов («c инструктором», «СERAGEM»). Иначе их не находит поиск. */
function cleanServiceText(t){
  return String(t==null?"":t)
    .replace(/[\u00A0\t]+/g," ").replace(/ {2,}/g," ")
    .replace(/\( /g,"(").replace(/ \)/g,")").replace(/ ([,.;:])/g,"$1")
    .replace(/(^|[\s(])c(?=\s+[а-яё])/g,"$1с")          // латинская «c» как русский предлог
    .replace(/СERAGEM/g,"CERAGEM")
    .trim();
}
function cleanBranchTexts(){
  Object.keys(branchContent).forEach(function(k){
    (branchContent[k].services||[]).forEach(function(cat){
      cat.name=cleanServiceText(cat.name);
      (cat.items||[]).forEach(function(it){it.n=cleanServiceText(it.n);});
    });
    (branchContent[k].staff||[]).forEach(function(p){p.name=cleanServiceText(p.name);p.pos=cleanServiceText(p.pos);});
  });
}
cleanBranchTexts();
let servicesData = branchContent.gubkin.services;
let staffData    = branchContent.gubkin.staff;



// ═══ ТАКСИ — динамический поиск реальных данных (водители + тарифы) ═══
function getTaxiDrivers(){
  return (staffData||[]).filter(function(s){return s.pos&&s.pos.toLowerCase().indexOf("водитель")>=0;});
}
function getTaxiTariffs(){
  var cat=(servicesData||[]).find(function(c){return c.name.toLowerCase().indexOf("перевозке")>=0||c.name.toLowerCase().indexOf("перевозка")>=0;});
  /* тарифы не заданы в прейскуранте филиала — такси всё равно доступно, стоимость уточнит центр */
  if(!cat||!cat.items.length)return {cat:null,items:[{idx:0,name:"Поездка на социальном такси",label:"Поездка на социальном такси",duration:"30",base:null,moroshka:null}]};
  return {cat:cat,items:cat.items.map(function(it,idx){
    var label=it.n.indexOf("с сопровождением")>=0?"С сопровождением специалиста":
      it.n.indexOf("в пределах населенного пункта")>=0?"По городу (короткая поездка)":
      "Без сопровождения специалиста";
    var duration=it.n.match(/(\d+)\s*мин/);
    return {idx:idx,name:it.n,label:label,duration:duration?duration[1]:"30",base:it.p,moroshka:it.m};
  })};
}

/* Цена поездки для показа: если тариф не задан — «по тарифу центра» */
function taxiPrice(p){return (p===null||p===undefined||p===""||isNaN(p))?"по тарифу центра":p+" ₽";}

// ═══ НОМЕРА ЗАЯВОК ═══
// Случайный 6-значный номер (100000–999999) вместо «ЗАЯ-0001»/«ТАК-0001»:
// по номеру нельзя угадать, сколько заявок было до этой, и он одинаково
// выглядит для заявок, записей и такси. Повтор с уже выданными номерами исключён.
function newTicketNum(){
  var used={};
  ["ordersHistory","bookingsHistory","taxiHistory"].forEach(function(k){
    try{(JSON.parse(localStorage.getItem(k)||"[]")||[]).forEach(function(x){if(x&&x.num)used[String(x.num)]=1;});}catch(e){}
  });
  for(var i=0;i<50;i++){
    var n;
    if(window.crypto&&crypto.getRandomValues){var a=new Uint32Array(1);crypto.getRandomValues(a);n=100000+(a[0]%900000);}
    else n=100000+Math.floor(Math.random()*900000);
    if(!used[String(n)])return String(n);
  }
  return String(Date.now()).slice(-6);
}
// Для показа: «№ 482913». Старые номера вида «ЗАЯ-0101» показываем как есть.
function ticketLabel(num){return num?(/^\d+$/.test(String(num))?"№ "+num:String(num)):"";}

// ═══ РЕЖИМ РАБОТЫ: ОБЕДЕННЫЙ ПЕРЕРЫВ ═══
// Единый перерыв для записи к специалистам, такси и статуса «Открыто/Закрыто».
// Время в интервале [from; to) недоступно: 12:30, 13:00, 13:30 — нельзя, 14:00 — можно.
const WORK_BREAK={from:"12:30",to:"14:00"};
function isBreakTime(hhmm){
  var t=taxiMinutes(hhmm);
  return t>=taxiMinutes(WORK_BREAK.from)&&t<taxiMinutes(WORK_BREAK.to);
}
// Слоты по 30 минут от a до b включительно (строки "ЧЧ:ММ").
function halfHourSlots(a,b){
  var out=[],x=taxiMinutes(a),y=taxiMinutes(b);
  for(var m=x;m<=y;m+=30)out.push(String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"));
  return out;
}

// ═══ ПРАВИЛА СОЦИАЛЬНОГО ТАКСИ ═══
// Заявку принимают в день, предшествующий поездке, с 08:30 до 12:30.
// Машина работает с 08:30 до 18:00 — позже подачи нет. Обед 12:30–14:00 — подачи нет.
const TAXI_RULES={orderFrom:"08:30",orderTo:"12:30",rideFrom:"08:30",rideTo:"18:00",
                  breakFrom:WORK_BREAK.from,breakTo:WORK_BREAK.to};
function taxiMinutes(hhmm){var p=String(hhmm||"").split(":");return parseInt(p[0]||0,10)*60+parseInt(p[1]||0,10);}
function taxiIso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
// Строка с режимом работы машины — одна на все экраны и чат-бот.
function taxiHoursText(){
  return "с "+TAXI_RULES.rideFrom+" до "+TAXI_RULES.rideTo+", перерыв с "+TAXI_RULES.breakFrom+" до "+TAXI_RULES.breakTo;
}
// Открыт ли сейчас приём заявок (08:30–12:30).
function taxiOrderWindowOpen(){
  var n=new Date(),m=n.getHours()*60+n.getMinutes();
  return m>=taxiMinutes(TAXI_RULES.orderFrom)&&m<=taxiMinutes(TAXI_RULES.orderTo);
}
// Самая ранняя дата поездки: завтра, если успеваем подать заявку до 12:30, иначе послезавтра.
function taxiEarliestRideDate(){
  var n=new Date(),m=n.getHours()*60+n.getMinutes();
  var shift=(m<=taxiMinutes(TAXI_RULES.orderTo))?1:2;
  var d=new Date(n.getFullYear(),n.getMonth(),n.getDate()+shift);
  return taxiIso(d);
}
// Проверка даты и времени поездки по всем правилам.
function taxiCheckRide(date,time){
  if(!date||!/^\d{4}-\d{2}-\d{2}$/.test(date))return {ok:false,code:"date",message:"Укажите дату поездки"};
  var min=taxiEarliestRideDate();
  if(date<min)return {ok:false,code:"early",min:min,
    message:"Заявку принимают накануне поездки с "+TAXI_RULES.orderFrom+" до "+TAXI_RULES.orderTo+
            ". Ближайшая доступная дата — "+min.split("-").reverse().slice(0,2).join(".")};
  if(!time||!/^\d{2}:\d{2}$/.test(time))return {ok:false,code:"time",message:"Укажите время подачи"};
  var t=taxiMinutes(time);
  if(t<taxiMinutes(TAXI_RULES.rideFrom)||t>taxiMinutes(TAXI_RULES.rideTo))
    return {ok:false,code:"hours",message:"Машина работает с "+TAXI_RULES.rideFrom+" до "+TAXI_RULES.rideTo+" — выберите время в этом промежутке"};
  if(isBreakTime(time))
    return {ok:false,code:"break",message:"С "+TAXI_RULES.breakFrom+" до "+TAXI_RULES.breakTo+" обеденный перерыв — машину не подают. Выберите время до "+TAXI_RULES.breakFrom+" или с "+TAXI_RULES.breakTo};
  if(typeof taxiSlotsFor==="function"){
    var sl=taxiSlotsFor(date,{wheelchair:!!(arguments[2]&&arguments[2].wheelchair)});
    if(sl!==null&&!sl[time])return {ok:false,code:"noshift",
      message:Object.keys(sl).length?"В "+time+" машин на линии нет. Свободное время: "+Object.keys(sl).slice(0,6).join(", ")+(Object.keys(sl).length>6?"…":""):"На эту дату машин на линии нет — выберите другой день"};
  }
  return {ok:true,min:min};
}
// Слоты подачи по 30 минут от 08:30 до 18:00 (включая обеденные — они показываются неактивными).
function taxiTimeSlots(){return halfHourSlots(TAXI_RULES.rideFrom,TAXI_RULES.rideTo);}
// Только доступные слоты (без обеда).
function taxiFreeTimeSlots(){return taxiTimeSlots().filter(function(t){return !isBreakTime(t);});}

// ═══ Бесплатное такси — лимит 96 поездок в год на человека ═══
const FREE_TAXI_ANNUAL_LIMIT=96;   /* по умолчанию; у центра — «Настройки» */
function freeTaxiLimit(){return window.GSettings?GSettings.get().taxiFreeLimit:FREE_TAXI_ANNUAL_LIMIT;}
// Категории, имеющие право на БЕСПЛАТНУЮ (не льготную) поездку.
// Список ориентировочный — сотрудник ЦСОН должен сверить с актуальным региональным
// порядком предоставления соцтакси и при необходимости скорректировать вручную.
const FREE_TAXI_ELIGIBLE_CATEGORIES=["pensioner","disabled","veteran"];
function getFreeTaxiQuotaKey(){
  var year=new Date().getFullYear();
  var person=(typeof clientPhone!=="undefined"&&clientPhone)?clientPhone:"guest";
  return "freeTaxiQuota_"+person+"_"+year;
}
function getFreeTaxiQuota(){
  var used=parseInt(localStorage.getItem(getFreeTaxiQuotaKey())||"0");
  return {used:used,limit:freeTaxiLimit(),remaining:Math.max(0,freeTaxiLimit()-used)};
}
function useFreeTaxiTrip(){
  var q=getFreeTaxiQuota();
  if(q.remaining<=0)return false;
  localStorage.setItem(getFreeTaxiQuotaKey(),String(q.used+1));
  return true;
}
// Отменили льготную поездку — возвращаем её в годовой лимит.
function refundFreeTaxiTrip(){
  var q=getFreeTaxiQuota();
  if(q.used>0)localStorage.setItem(getFreeTaxiQuotaKey(),String(q.used-1));
}
// over — необязательные данные, введённые прямо в заявке: {snils, category}.
function checkFreeTaxiEligibility(over){
  over=over||{};
  var snils=over.snils||(typeof clientSnils!=="undefined"?clientSnils:"")||"";
  var snilsDigits=snils.replace(/\D/g,"");
  if(snilsDigits.length<11){
    return {eligible:false,reason:"snils_missing",message:"Для бесплатной поездки нужен СНИЛС — укажите его при оформлении поездки."};
  }
  var profile={};
  try{profile=JSON.parse(localStorage.getItem("userProfile")||"{}")||{};}catch(e){}
  if(over.category)profile.category=over.category;
  if(!profile.category){
    return {eligible:false,reason:"category_missing",message:"Укажите категорию получателя — это можно сделать прямо при оформлении поездки."};
  }
  if(FREE_TAXI_ELIGIBLE_CATEGORIES.indexOf(profile.category)<0){
    return {eligible:false,reason:"category_not_eligible",message:"По указанной категории («"+({pensioner:"Пенсионер",disabled:"Инвалид",veteran:"Ветеран",family:"Семья с детьми",large_family:"Многодетная семья",other:"Другое"}[profile.category]||profile.category)+"») бесплатная поездка не положена — доступны платные тарифы."};
  }
  return {eligible:true,reason:"ok",message:"Право на бесплатную поездку подтверждено по СНИЛС."};
}


const newsData=[
  {
    date:"2026-07-20",
    id:"bot_alive",likes:41,
    tag:"Важно",
    title:"Наш чат-бот ожил!",
    text:"Встречайте — «Гармония» больше не просто картинка: логотип и маскот теперь двигаются и встречают вас живой анимацией на главной странице, в чате и при первом знакомстве с приложением. Это только начало: мы уже работаем над настоящей живой 3D-моделью помощника, которая поселится прямо в чате — она будет реагировать на ваши вопросы жестами и эмоциями. Загляните на главную и поздоровайтесь!",
    images:["img/news-logo-live.webp"]
  },
  {
    date:"2026-07-20",
    id:"chatbot_guide",likes:27,
    tag:"Полезное",
    title:"Гид по чат-боту: получайте услуги в пару касаний",
    text:"Собрали в карточках всё, что умеет наш чат-бот: как записаться к специалисту по любому направлению, заказать социальное такси, оформить прокат средств реабилитации, отправить заявку из корзины и настроить профиль с картой «Морошка». А ещё — примеры фраз, которые бот понимает с полуслова: просто напишите «запиши меня к психологу» — и запись откроется сама. Пролистайте карточки и сохраните себе!",
    images:["img/guide_1.jpg","img/guide_2.jpg","img/guide_3.jpg","img/guide_4.jpg","img/guide_5.jpg","img/guide_6.jpg","img/guide_7.jpg","img/guide_8.jpg"]
  },
  {
    date:"2026-07-08",
    id:"welcome",likes:63,
    tag:"Важно",
    title:"Добро пожаловать! Мы запустили виртуального помощника «Гармония»",
    text:"Теперь узнать о наших услугах, записаться к специалисту или оформить заявку можно прямо здесь, без звонков и очередей. Помощник работает круглосуточно и всегда готов подсказать нужный раздел — просто напишите вопрос своими словами. Мы рады встрече с вами и надеемся, что новый бот сделает получение социальных услуг проще и удобнее!",
    image:"img/news-launch.jpg"
  },
  {
    date:"2026-07-16",
    id:"safe_internet",likes:18,
    tag:"Важно",
    title:"Безопасный интернет: лайфхаки от специалиста для родителей",
    text:"Ребёнок остаётся дома один с телефоном или планшетом — как уберечь его от лишнего? Собрали в карточках простые пошаговые настройки: бесплатный родительский контроль на iPhone и Android, безопасный поиск и видео, единый DNS-фильтр для всех устройств дома сразу, а главное — что делать, если настроек недостаточно. Пролистайте карточки до конца: там простые правила безопасности, о которых стоит поговорить с ребёнком уже сегодня. Остались вопросы — специалисты центра «Гармония» всегда готовы помочь с настройкой.",
    images:["img/card_1_oblozhka.jpg","img/card_2_iphone.jpg","img/card_3_android.jpg","img/card_4_poisk.jpg","img/card_5_dns.jpg","img/card_6_doverie.jpg","img/card_7_final.jpg"]
  }
];

const eventsData=[];

let galleryData=[];

;

/* ───── js/booking.js ───── */
// ═══════════════════════════════════════════════════════════════
// СТРУКТУРА ЗАПИСИ НА ПРИЁМ (по ТЗ, прейскурант Губкинский 2026)
// Действует для филиалов: Губкинский и мкр. Пурпе.
// num — пункт прейскуранта; p — цена; m — цена по карте «Морошка»;
// mode: "ind" — индивидуальные слоты, "group" — единое время; cap — мест в группе;
// resp — фамилии ответственных (сопоставляются со справочником сотрудников).
// ═══════════════════════════════════════════════════════════════
const BOOKING_STRUCT=[
 {
  "catId": 12,
  "title": "Занятия с инструктором ЛФК",
  "icon": "",
  "resp": [
   "Хрипкова"
  ],
  "subs": [
   {
    "t": "Групповые занятия (единое время)",
    "mode": "group",
    "cap": 3,
    "items": [
     {
      "num": "12.1",
      "n": "Занятие в зале ЛФК групповое, до 40 мин. (не более 3-х человек) без инструктора",
      "p": 600,
      "m": 570
     },
     {
      "num": "12.3",
      "n": "Занятие в зале ЛФК групповое, до 40 мин. (не более 3-х человек) с инструктором",
      "p": 1100,
      "m": 1045
     },
     {
      "num": "12.6",
      "n": "Занятие адаптивной физической культурой групповое, до 30 мин., до 3-х человек, с инструктором",
      "p": 800,
      "m": 760
     }
    ]
   },
   {
    "t": "Индивидуальные занятия",
    "mode": "ind",
    "items": [
     {
      "num": "12.2",
      "n": "Занятие в зале ЛФК индивидуальное, до 40 мин. (без инструктора)",
      "p": 400,
      "m": 380
     },
     {
      "num": "12.4",
      "n": "Занятие в зале ЛФК индивидуальное, до 40 мин. (с инструктором)",
      "p": 700,
      "m": 665
     },
     {
      "num": "12.5",
      "n": "Занятие адаптивной физической культурой индивидуально, до 30 мин. с инструктором",
      "p": 700,
      "m": 665
     },
     {
      "num": "12.8",
      "n": "Занятие в тренажерном зале, до 40 мин. индивидуальное, без инструктора",
      "p": 400,
      "m": 380
     },
     {
      "num": "12.9",
      "n": "Занятие в тренажерном зале, до 40 мин. индивидуальное, с инструктором",
      "p": 700,
      "m": 665
     }
    ]
   }
  ]
 },
 {
  "catId": 13,
  "title": "Психологические услуги",
  "icon": "",
  "resp": [
   "Леднева",
   "Руссу"
  ],
  "subs": [
   {
    "t": "Услуги психолога (для детей)",
    "mode": "ind",
    "items": [
     {
      "num": "13.2",
      "n": "Индивидуальные консультации психолога для детей до 13 лет (не более 30 мин.)",
      "p": 600,
      "m": 570
     },
     {
      "num": "13.3",
      "n": "Индивидуальные консультации психолога для детей от 13 лет и старше (не более 45 мин.)",
      "p": 600,
      "m": 570
     },
     {
      "num": "13.5",
      "n": "Коррекционные занятия с психологом (коррекция эмоционально-волевой, когнитивной сферы), до 30 мин.",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.7",
      "n": "Сеанс релаксации в сенсорной комнате в сопровождении специалиста, до 40 мин.",
      "p": 500,
      "m": 475
     },
     {
      "num": "13.9",
      "n": "Проведение диагностики эмоционально-волевой сферы, до 30 мин.",
      "p": 500,
      "m": 475
     },
     {
      "num": "13.10",
      "n": "Диагностика психо-эмоционального состояния (не более 2-х часов)",
      "p": 545,
      "m": 518
     },
     {
      "num": "13.11",
      "n": "Проведение диагностики когнитивной сферы, определение коэффициента умственного развития IQ, до 90 мин.",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.12",
      "n": "Диагностика и коррекция межличностных отношений, до 120 мин.",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.13",
      "n": "Диагностика детско-родительских отношений (не более 2-х часов)",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.14",
      "n": "Прогноз и профилактика проблем обучения, социализация и профессиональное самоопределение старшеклассников, до 180 мин.",
      "p": 1000,
      "m": 950
     },
     {
      "num": "13.15",
      "n": "Диагностика социального интеллекта, до 60 мин.",
      "p": 600,
      "m": 570
     },
     {
      "num": "13.16",
      "n": "Диагностика обучаемости ребенка, до 60 мин.",
      "p": 600,
      "m": 570
     },
     {
      "num": "13.17",
      "n": "Диагностика личностных особенностей (не более 2-ух часов)",
      "p": 700,
      "m": 665
     },
     {
      "num": "13.18",
      "n": "Профориентационная диагностика (не более 2-ух часов)",
      "p": 750,
      "m": 713
     },
     {
      "num": "13.19",
      "n": "Диагностика к аддиктивному поведению у подростков (не более 2-х часов)",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.27",
      "n": "Готовность к школьному обучению (не более 2-х часов)",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.28",
      "n": "Коррекционные занятия психолога с детьми от 3 до 7 лет (не более 20 мин.)",
      "p": 400,
      "m": 380
     },
     {
      "num": "13.29",
      "n": "Коррекционные занятия психолога с детьми от 7 до 13 лет (не более 30 мин.)",
      "p": 450,
      "m": 428
     },
     {
      "num": "13.30",
      "n": "Коррекционные занятия психолога с детьми от 13 лет и старше (не более 40 мин.)",
      "p": 500,
      "m": 475
     },
     {
      "num": "13.31",
      "n": "Индивидуальное занятие психолога по подготовке детей к школе (1 сеанс - 30 минут)",
      "p": 287,
      "m": 273
     }
    ]
   },
   {
    "t": "Услуги психолога (для взрослых)",
    "mode": "ind",
    "items": [
     {
      "num": "13.1",
      "n": "Психологическое консультирование взрослого, до 60 мин.",
      "p": 1000,
      "m": 950
     },
     {
      "num": "13.4",
      "n": "Индивидуальные консультации психолога семейной пары (не более 1 ч. 30 мин.)",
      "p": 1500,
      "m": 1425
     },
     {
      "num": "13.7",
      "n": "Сеанс релаксации в сенсорной комнате в сопровождении специалиста, до 40 мин.",
      "p": 500,
      "m": 475
     },
     {
      "num": "13.12",
      "n": "Диагностика и коррекция межличностных отношений, до 120 мин.",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.13",
      "n": "Диагностика детско-родительских отношений (не более 2-х часов)",
      "p": 800,
      "m": 760
     },
     {
      "num": "13.22",
      "n": "Проведение обследования психологического состояния на выявление предпосылок профессионального выгорания (анкетирование, консультирование по результатам анкетирования, за 1 человека), до 40 мин.",
      "p": 300,
      "m": 285
     },
     {
      "num": "13.23",
      "n": "Коррекция эмоционально-волевой сферы по разработанной программе для работы с признаками эмоционального выгорания возникшего в результате трудовой деятельности, до 30 мин.",
      "p": 300,
      "m": 285
     },
     {
      "num": "13.25",
      "n": "Консультирование психолога по разработанной программе по предотвращению последствий профессионального выгорания, до 1 часа",
      "p": 1000,
      "m": 950
     },
     {
      "num": "13.26",
      "n": "Аудиовизуальная коррекция избавление от вредный привычек, нормализация сна, очищение организма, развитие когнитивных функций, самопрограммирование, до 30 мин.",
      "p": 350,
      "m": 333
     }
    ]
   },
   {
    "t": "Тренинговые занятия (групповые)",
    "mode": "group",
    "cap": 10,
    "items": [
     {
      "num": "13.20",
      "n": "Тренинговые групповые занятия по разработанной программе по обучению преодоления синдрома профессионального выгорания, до 60 мин.(стоимость за 1 человека)",
      "p": 310,
      "m": 295
     },
     {
      "num": "13.21",
      "n": "Тренинговые групповые занятия по разработанной программе, до 60 мин., (стоимость за 1 человека)",
      "p": 310,
      "m": 295
     },
     {
      "num": "13.24",
      "n": "Проведение групповых релаксационных арттерапевтических занятий по разработанной программе для снятия напряжения возникшего в результате трудовой деятельности, до 40 мин. (за 1 человека)",
      "p": 300,
      "m": 285
     }
    ]
   }
  ]
 },
 {
  "catId": 14,
  "title": "Педагогические услуги",
  "icon": "",
  "subs": [
   {
    "t": "Услуги логопеда",
    "mode": "ind",
    "resp": [
     "Яговцева"
    ],
    "items": [
     {
      "num": "14.1",
      "n": "Педагогическая коррекция речевого развития, до 30 мин.",
      "p": 800,
      "m": 760
     },
     {
      "num": "14.2",
      "n": "Логопедический массаж, до 20 мин.",
      "p": 500,
      "m": 475
     },
     {
      "num": "14.4",
      "n": "Логопедическое консультирование, до 60 мин.",
      "p": 800,
      "m": 760
     },
     {
      "num": "14.5",
      "n": "Логопедическая диагностика, до 60 мин.",
      "p": 900,
      "m": 855
     },
     {
      "num": "14.6",
      "n": "Индивидуальное занятие с логопедом с детьми от 7 лет и старше (за 40 мин.)",
      "p": 500,
      "m": 475
     },
     {
      "num": "14.7",
      "n": "Индивидуальное занятие с логопедом с детьми от 3 до 7 лет (за 20 мин.)",
      "p": 400,
      "m": 380
     },
     {
      "num": "14.8",
      "n": "Коррекция речевых нарушений с применением интерактивного оборудования, до 30 минут",
      "p": 300,
      "m": 285
     },
     {
      "num": "14.9",
      "n": "Консультирование логопеда по результатам диагностики, до 30 мин.",
      "p": 500,
      "m": 475
     }
    ]
   },
   {
    "t": "Педагогическое консультирование, диагностика, обследование",
    "mode": "ind",
    "items": [
     {
      "num": "14.12",
      "n": "Обучение функциональным навыкам коммуникации с помощью карточек PECS, до 30 мин.",
      "p": 500,
      "m": 475,
      "resp": [
       "Васильева"
      ]
     },
     {
      "num": "14.22",
      "n": "Педагогическое обследование личности, выдача характеристики и заключения (60 мин. На одного получателя)",
      "p": 1000,
      "m": 950,
      "resp": [
       "Ваганова"
      ]
     },
     {
      "num": "14.23",
      "n": "Занятие с детьми от 6 месяцев до 1,5 лет (за 1 занятие продолжительностью 1 час)",
      "p": 318,
      "m": 302,
      "resp": [
       "Ваганова"
      ]
     },
     {
      "num": "14.24",
      "n": "Занятие с детьми от 1,5 лет до 3 лет (за 1 занятие продолжительностью 1 час)",
      "p": 371,
      "m": 352,
      "resp": [
       "Ваганова"
      ]
     }
    ]
   },
   {
    "t": "Педагогические услуги (группа)",
    "mode": "group",
    "items": [
     {
      "num": "14.13",
      "n": "Проведение клубной и кружковой работы по интересам (1 занятие - до 30 мин.)",
      "p": 300,
      "m": 285,
      "resp": [
       "Ваганова"
      ]
     },
     {
      "num": "14.14",
      "n": "Курс обучения компьютерной грамотности (1 занятие, до 30 мин.)",
      "p": 500,
      "m": 475,
      "resp": [
       "Беляева"
      ]
     },
     {
      "num": "14.15",
      "n": "Занятия по арт-терапии (1 занятие, до 30 мин.)",
      "p": 400,
      "m": 380,
      "resp": [
       "Силантьева"
      ]
     },
     {
      "num": "14.16",
      "n": "Мастер-класс по декоративно-прикладному творчеству (1 занятие, до 30 мин.)",
      "p": 315,
      "m": 299,
      "resp": [
       "Силантьева"
      ]
     },
     {
      "num": "14.17",
      "n": "Мастер-класс в Гончарной мастерской (1 занятие, до 90 мин.)",
      "p": 1700,
      "m": 1615,
      "resp": [
       "Силантьева"
      ]
     }
    ]
   },
   {
    "t": "Педагогические услуги (дети-инвалиды, молодые инвалиды)",
    "mode": "group",
    "cap": 2,
    "resp": [
     "Цыганова"
    ],
    "items": [
     {
      "num": "14.25",
      "n": "\"Социальная передышка\" для инвалидов от 3-х до 35 лет (1 посещение - не более 3 часов) в т.ч.: формирование позитивных интересов, организация досуга",
      "p": 400,
      "m": 380
     },
     {
      "num": "14.26",
      "n": "Клуб для молодых инвалидов (18-35л.) «Второе рождение» (1 посещение - 3 часа) в т.ч.: психологическая коррекция, занятия в сенсорной комнате, трудотерапия",
      "p": 500,
      "m": 475
     }
    ]
   }
  ]
 },
 {
  "catId": 16,
  "title": "Правовые услуги",
  "icon": "",
  "subs": [
   {
    "t": "Помощь иностранным гражданам",
    "mode": "ind",
    "resp": [
     "Лапикова"
    ],
    "items": [
     {
      "num": "16.1",
      "n": "Помощь иностранным гражданам в заполнении заявления на гражданство РФ (не более 2 часов)",
      "p": 3175,
      "m": null
     },
     {
      "num": "16.4",
      "n": "Помощь иностранным гражданам в заполнении заявления: на разрешение временного проживания в РФ / на разрешение вида на жительство в РФ (не более 1,5 часов)",
      "p": 2114,
      "m": null
     },
     {
      "num": "16.5",
      "n": "Помощь иностранным гражданам в заполнении уведомления о постановке на миграционный учет / в заполнении документов на регистрацию по месту жительства / в заполнении уведомления о подтверждении проживания на территории РФ (не более 30 минут)",
      "p": 846,
      "m": null
     }
    ]
   },
   {
    "t": "Помощь в получении электронной услуги (Госуслуги)",
    "mode": "ind",
    "resp": [
     "Щербич"
    ],
    "items": [
     {
      "num": "16.6",
      "n": "Помощь в получении электронной услуги, из перечня услуг, на портале государственных и муниципальных услуг (не более 30 минут)",
      "p": 500,
      "m": null
     },
     {
      "num": "16.7",
      "n": "Помощь в получении электронной услуги, из перечня услуг, на портале государственных и муниципальных услуг (от 30 до 60 минут)",
      "p": 700,
      "m": null
     },
     {
      "num": "16.8",
      "n": "Создание личного кабинета на сайте государственных и муниципальных услуг, заведение электронной почты (не более 30 мин.)",
      "p": 100,
      "m": null
     }
    ]
   },
   {
    "t": "Составление декларации 3-НДФЛ",
    "mode": "ind",
    "resp": [
     "Щербич"
    ],
    "items": [
     {
      "num": "16.2",
      "n": "Составление декларации 3-НДФЛ (за 1 декларацию)",
      "p": 952,
      "m": null
     }
    ]
   }
  ]
 },
 {
  "catId": 17,
  "title": "Услуги в области медицины (прочие)",
  "icon": "",
  "subs": [
   {
    "t": "Фитотерапевтические процедуры",
    "mode": "ind",
    "resp": [
     "Фролова"
    ],
    "items": [
     {
      "num": "17.1.1",
      "n": "Фитотерапевтические процедуры (кислородный коктейль, за 1 единицу)",
      "p": 104,
      "m": 99
     }
    ]
   },
   {
    "t": "Услуга теплолечения",
    "mode": "ind",
    "resp": [
     "Фролова"
    ],
    "items": [
     {
      "num": "17.2.2",
      "n": "Инфракрасная сауна (до 40 мин.)",
      "p": 600,
      "m": 570
     }
    ]
   },
   {
    "t": "Галотерапия",
    "mode": "ind",
    "resp": [
     "Фролова"
    ],
    "items": [
     {
      "num": "17.3.2",
      "n": "Ингаляции (до 10 мин.)",
      "p": 200,
      "m": 190
     },
     {
      "num": "17.3.3",
      "n": "Профилактика и оздоровление в «соляной комнате» не более 30 минут для детей до 16 лет (за 1 сеанс)",
      "p": 156,
      "m": 148
     },
     {
      "num": "17.3.4",
      "n": "Профилактика и оздоровление в «соляной комнате» не более 30 минут для детей до 16 лет (за 10 сеансов)",
      "p": 1000,
      "m": 950
     },
     {
      "num": "17.3.5",
      "n": "Профилактика и оздоровление в «соляной комнате» не более 30 минут для взрослых (за 1 сеанс)",
      "p": 208,
      "m": 198
     },
     {
      "num": "17.3.6",
      "n": "Профилактика и оздоровление в «соляной комнате» не более 30 минут для взрослых (за 10 сеансов)",
      "p": 1500,
      "m": 1425
     }
    ]
   },
   {
    "t": "Лечебная физкультура",
    "mode": "ind",
    "resp": [
     "Хрипкова"
    ],
    "items": [
     {
      "num": "17.4.1",
      "n": "Иппотерапия на тренажере, от 15 до 30 мин.",
      "p": 320,
      "m": 304
     }
    ]
   },
   {
    "t": "Механотерапия",
    "mode": "ind",
    "resp": [
     "Фролова"
    ],
    "items": [
     {
      "num": "17.8.1",
      "n": "Бесконтактный гидромассаж «Акварелакс», до 10 мин.",
      "p": 530,
      "m": 504
     },
     {
      "num": "17.8.4",
      "n": "«Массажное кресло» (до 15 мин.)",
      "p": 160,
      "m": 152
     },
     {
      "num": "17.8.6",
      "n": "Массажная кровать НУГА БЕСТ (38 мин.)",
      "p": 500,
      "m": 475
     },
     {
      "num": "17.8.7",
      "n": "Массажер для ног",
      "p": 160,
      "m": 152
     }
    ]
   }
  ]
 },
 {
  "catId": 19,
  "title": "Детские и семейные праздники",
  "icon": "",
  "resp": [
   "Зуенкова"
  ],
  "subs": [
   {
    "t": "Проведение детских и семейных праздников",
    "mode": "ind",
    "items": [
     {
      "num": "19.1",
      "n": "Костюмированное поздравление на дому к праздничным датам (программа на 10 мин.)",
      "p": 2000,
      "m": 1900
     },
     {
      "num": "19.2",
      "n": "Поздравление Деда Мороза и Снегурочки на территории заказчика (до 15 минут)",
      "p": 2000,
      "m": 1900
     },
     {
      "num": "19.4",
      "n": "Проведение мероприятий к праздничным датам (группа не менее 10 человек) на территории центра, оплата за 1 человека за час",
      "p": 335,
      "m": 318
     },
     {
      "num": "19.6",
      "n": "Театрализованное поздравление ребенка на дому (2 персонажа) (доставка персонажей на ТС учреждения) (20 мин)",
      "p": 1585,
      "m": 1506
     }
    ]
   }
  ]
 }
];

/* ═══ Запись к специалистам хранится в данных филиала: branchContent[филиал].booking
   (настраивается в панели → «Запись»). У «Гармонии» для Губкинского и Пурпе по умолчанию —
   прежняя структура; у остальных филиалов и центров — пока не настроена. ═══ */
["gubkin","purpe"].forEach(function(b){
  if(typeof branchContent!=="undefined"&&branchContent[b]&&!Array.isArray(branchContent[b].booking))
    branchContent[b].booking=JSON.parse(JSON.stringify(BOOKING_STRUCT));
});
function bookingStruct(){
  var bc=(typeof branchContent!=="undefined"&&typeof currentCity!=="undefined")?branchContent[currentCity]:null;
  return bc&&Array.isArray(bc.booking)&&bc.booking.length?bc.booking:null;
}
// ─── Флоу записи по структуре ───
function structDirFor(catId){
  return (bookingStruct()||[]).find(function(d){return d.catId===catId;})||null;
}
function structPlural(n,forms){
  var n10=n%10,n100=n%100;
  if(n10===1&&n100!==11)return forms[0];
  if(n10>=2&&n10<=4&&(n100<10||n100>=20))return forms[1];
  return forms[2];
}
function structPriceLine(it){
  if(it.p==null)return "Цена уточняется";
  var s=it.p.toLocaleString("ru-RU")+" ₽";
  if(it.m!=null)s+=" · по «Морошке» "+it.m.toLocaleString("ru-RU")+" ₽";
  return s;
}
// Переход из помощника: сразу в запись направления (Губкинский/Пурпе)
// или в соответствующую категорию прейскуранта в других филиалах.
function structGoto(catId){
  var dir=structDirFor(catId);
  if(dir){openStructBooking(catId);return;}
  var cat=(typeof servicesData!=="undefined"&&servicesData)?servicesData.find(function(c){return c.id===catId;}):null;
  showServices();
  if(cat)setTimeout(function(){plOpenCat(catId);},260);
}
function structResolveStaff(surnames){
  var out=[];
  (surnames||[]).forEach(function(sn){
    var st=(typeof staffData!=="undefined"?staffData:[]).find(function(s){return s.name.toLowerCase().indexOf(sn.toLowerCase())===0;});
    if(st)out.push(st);
    else out.push({name:sn,pos:"Ответственный специалист",ext:"",email:""});
  });
  return out;
}
function openStructBooking(catId){
  var dir=structDirFor(catId);if(!dir)return;
  clearActions();setNav(true);
  chatEl.innerHTML="";
  var w=document.createElement("div");w.className="booking-page";
  var html='<button class="pl-back" onclick="showServices();setTimeout(function(){plOpenCat('+catId+');},220);">← Назад к услугам</button>';
  html+='<h2>'+(typeof catIco==="function"?catIco(dir.title,"ic-inline")+" ":"")+dir.title+'</h2>';
  html+='<div class="bk-progress"><div class="bk-progress-fill" style="width:0%"></div></div>';
  html+='<div class="bk-step-lbl"><span class="taxi-step-num">1</span>Выберите направление</div>';
  html+='<div class="bk-spec-list">';
  dir.subs.forEach(function(sub,si){
    var badge=sub.mode==="group"
      ?'<span class="bk-mode-badge group">Групповое занятие'+(sub.cap?' · до '+sub.cap+' мест':'')+'</span>'
      :'<span class="bk-mode-badge">Индивидуальный приём</span>';
    html+='<button class="bk-spec-card" onclick="structOpenSub('+catId+','+si+')">'
      +'<span class="bk-spec-ava bk-item-ava">'+(sub.mode==="group"?"":"")+'</span>'
      +'<span class="bk-spec-txt"><b>'+sub.t+'</b><span>'+sub.items.length+' '+structPlural(sub.items.length,["услуга","услуги","услуг"])+'</span>'+badge+'</span></button>';
  });
  html+='</div>';
  w.innerHTML=html;chatEl.appendChild(w);
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}
function structOpenSub(catId,si){
  var dir=structDirFor(catId);if(!dir)return;
  var sub=dir.subs[si];if(!sub)return;
  clearActions();setNav(true);
  chatEl.innerHTML="";
  var w=document.createElement("div");w.className="booking-page";
  var html='<button class="pl-back" onclick="openStructBooking('+catId+')">← Назад к направлениям</button>';
  html+='<h2>'+sub.t+'</h2>';
  html+='<div class="bk-progress"><div class="bk-progress-fill" style="width:20%"></div></div>';
  html+='<div class="bk-step-lbl"><span class="taxi-step-num">2</span>Выберите услугу</div>';
  if(sub.mode==="group"){
    html+='<div class="bk-group-note">Занятия проходят в группе'+(sub.cap?' (до '+sub.cap+' мест)':'')+' в одно общее время для всех участников.</div>';
  }
  html+='<div class="bk-spec-list">';
  sub.items.forEach(function(it,ii){
    html+='<button class="bk-spec-card bk-item-card" onclick="structPickItem('+catId+','+si+','+ii+')">'
      +'<span class="bk-spec-ava bk-item-ava"></span>'
      +'<span class="bk-spec-txt"><b>'+it.n+'</b><span>'+structPriceLine(it)+'</span></span></button>';
  });
  html+='</div>';
  w.innerHTML=html;chatEl.appendChild(w);
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}
function structPickItem(catId,si,ii){
  var dir=structDirFor(catId);if(!dir)return;
  var sub=dir.subs[si];if(!sub)return;
  var it=sub.items[ii];if(!it)return;
  var respNames=it.resp||sub.resp||dir.resp||[];
  var specs=structResolveStaff(respNames);
  bkState={
    flow:"struct",catId:catId,subIdx:si,itemIdx:ii,
    catKey:catId,catName:dir.title,subName:sub.t,
    serviceItem:it.n,num:it.num,price:it.p,priceM:it.m,
    mode:sub.mode,cap:sub.cap||null,resp:respNames.join(", "),
    specialists:specs,spec:null,date:null,time:null,comment:""
  };
  if(specs.length===1){
    bkState.spec=specs[0].name;
    showBookingDate();
  }else if(specs.length>1){
    showBookingSpecialist(specs);
  }else{
    showToast("Специалист этого направления сейчас недоступен");
  }
}

;

/* ───── js/settings.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   settings.js — «Настройки центра» (панель → Настройки).
   Правила такси, обед, «Морошка», экстренные телефоны, политика ПДн,
   приветствие и частые вопросы чат-бота, разделы меню, знакомство.
   Без настроек действуют прежние значения «Гармонии» — ничего не меняется.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var DEF={
    lunchFrom:"12:30", lunchTo:"14:00",
    taxiOrderFrom:"08:30", taxiOrderTo:"12:30", taxiRideFrom:"08:30", taxiRideTo:"18:00",
    taxiMaxPax:2, taxiFreeLimit:96,
    moroshkaPercent:5,
    privacyUrl:"",
    botGreeting:"",
    faq:[],                 // [{q:"ключевые слова через запятую", a:"ответ"}]
    emergency:[{name:"Единый номер экстренных служб",phone:"112"},{name:"Скорая медицинская помощь",phone:"103"},
               {name:"Всероссийский телефон доверия (бесплатно)",phone:"8-800-2000-122"}],
    hiddenTiles:[],         // скрытые разделы меню жителя: gallery, events, news, callback, feedback, moroshka, staff, vk
    onboarding:true,
    onboardingSlides:[],    // [{title, text}] — свои слайды знакомства; пусто — стандартные
    bookingFrom:"09:00", bookingTo:"17:30", bookingStep:30, bookingDays:14, bookingWeekends:false,
    categories:[],          // [{key,label,free}] — категории получателей; пусто — стандартные
    greetings:[]            // [{date:"10-01", days:2, text}] — сезонные поздравления; пусто — стандартные
  };
  var cur=JSON.parse(JSON.stringify(DEF)),raw=null;
  var T=/^\d{2}:\d{2}$/;
  function apply(s){
    raw=s&&typeof s==="object"?JSON.parse(JSON.stringify(s)):null;
    cur=JSON.parse(JSON.stringify(DEF));
    if(raw)Object.keys(DEF).forEach(function(k){
      var v=raw[k];if(v===undefined||v===null||v==="")return;
      if(typeof DEF[k]==="string"&&typeof v==="string"&&(!/(From|To)$/.test(k)||T.test(v)))cur[k]=v;
      else if(typeof DEF[k]==="number"){var n=parseFloat(v);if(isFinite(n)&&n>=0)cur[k]=n;}
      else if(typeof DEF[k]==="boolean")cur[k]=!!v;
      else if(Array.isArray(DEF[k])&&Array.isArray(v))cur[k]=v;
    });
    cur.taxiMaxPax=Math.max(1,Math.min(8,Math.round(cur.taxiMaxPax)));
    cur.bookingStep=[10,15,20,30,45,60,90].indexOf(Math.round(cur.bookingStep))>=0?Math.round(cur.bookingStep):30;
    cur.bookingDays=Math.max(1,Math.min(60,Math.round(cur.bookingDays)));
    applyCats();
    cur.moroshkaPercent=Math.max(0,Math.min(50,cur.moroshkaPercent));
    /* общие объекты расписания, которые используют все экраны и чат-бот */
    if(typeof WORK_BREAK!=="undefined"){WORK_BREAK.from=cur.lunchFrom;WORK_BREAK.to=cur.lunchTo;}
    if(typeof TAXI_RULES!=="undefined"){TAXI_RULES.orderFrom=cur.taxiOrderFrom;TAXI_RULES.orderTo=cur.taxiOrderTo;
      TAXI_RULES.rideFrom=cur.taxiRideFrom;TAXI_RULES.rideTo=cur.taxiRideTo;TAXI_RULES.breakFrom=cur.lunchFrom;TAXI_RULES.breakTo=cur.lunchTo;}
    var h=document.documentElement;
    h.setAttribute("data-hide-tiles",(cur.hiddenTiles||[]).join(" "));
  }
  /* категории получателей: общий список RCP_CATS (js/extras.js) меняется на месте */
  var CATS0=null,FREE0=null;
  function applyCats(){
    try{
      if(typeof RCP_CATS==="undefined"||typeof FREE_TAXI_ELIGIBLE_CATEGORIES==="undefined")return;
      if(!CATS0){CATS0=RCP_CATS.map(function(c){return c.slice();});FREE0=FREE_TAXI_ELIGIBLE_CATEGORIES.slice();}
      var list=(cur.categories||[]).filter(function(c){return c&&c.key&&c.label;});
      RCP_CATS.length=0;FREE_TAXI_ELIGIBLE_CATEGORIES.length=0;
      if(list.length){list.forEach(function(c){
          var icon=(CATS0.find(function(x){return x[0]===c.key;})||[])[2]||"user";
          RCP_CATS.push([c.key,c.label,icon]);if(c.free)FREE_TAXI_ELIGIBLE_CATEGORIES.push(c.key);});}
      else{CATS0.forEach(function(c){RCP_CATS.push(c.slice());});FREE0.forEach(function(k){FREE_TAXI_ELIGIBLE_CATEGORIES.push(k);});}
    }catch(e){/* список ещё не загружен — применится после js/extras.js */}
  }
  function slots(){
    var r=[],t=toMin(cur.bookingFrom),e=toMin(cur.bookingTo);
    for(;t<=e;t+=cur.bookingStep)r.push(("0"+Math.floor(t/60)).slice(-2)+":"+("0"+t%60).slice(-2));
    return r;
  }
  function toMin(s){var m=/^(\d{2}):(\d{2})$/.exec(s||"");return m?(+m[1])*60+(+m[2]):0;}
  /* стандартные категории (для панели, где нет js/extras.js) */
  if(!window.RCP_CATS_DEFAULT)window.RCP_CATS_DEFAULT=[{key:"pensioner",label:"Пенсионер",free:true},{key:"disabled",label:"Инвалид",free:true},
    {key:"veteran",label:"Ветеран",free:true},{key:"family",label:"Семья с детьми",free:false},{key:"large_family",label:"Многодетная семья",free:false},{key:"other",label:"Другое",free:false}];
  apply(null);
  window.GSettings={DEF:DEF,apply:apply,applyCats:applyCats,slots:slots,
    /* поздравление на сегодня из своего списка центра (null — список пуст, действуют стандартные) */
    greeting:function(){
      var g=cur.greetings||[];if(!g.length)return null;
      var now=new Date(),y=now.getFullYear();
      for(var i=0;i<g.length;i++){var m=/^(\d{2})-(\d{2})$/.exec(g[i].date||"");if(!m||!g[i].text)continue;
        var start=new Date(y,+m[1]-1,+m[2]),end=new Date(start);end.setDate(end.getDate()+Math.max(1,+g[i].days||1));
        if(now>=start&&now<end)return {emoji:"",text:g[i].text};}
      return {none:true};
    },get:function(){return cur;},raw:function(){return raw?JSON.parse(JSON.stringify(raw)):null;},
    /* цена по «Морошке» из обычной цены */
    moroshka:function(p){return p==null?null:Math.round(p*(100-cur.moroshkaPercent)/100);},
    /* свой ответ центра на вопрос жителя (частые вопросы из панели) */
    faqAnswer:function(text){
      var t=String(text||"").toLowerCase().replace(/ё/g,"е");
      for(var i=0;i<(cur.faq||[]).length;i++){
        var f=cur.faq[i];if(!f||!f.q||!f.a)continue;
        var keys=String(f.q).toLowerCase().replace(/ё/g,"е").split(/[,;]/).map(function(x){return x.trim();}).filter(Boolean);
        if(keys.some(function(k){return k.length>2&&t.indexOf(k)>=0;}))return f.a;
      }
      return null;
    }};
})();

;

/* ───── js/fleet.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   fleet.js — автопарк социального такси.

   • Машины каждого филиала задаются в админпанели (вкладка «Автопарк»):
     модель, госномер, цвет, «для колясок», водитель, «на линии».
   • При заказе машина назначается ПРЕДВАРИТЕЛЬНО по правилу:
     нужна коляска → машина с отметкой «для колясок», иначе — первая
     обычная машина на линии. Диспетчер подтверждает или меняет её.
   • Время до подачи считается по дате и времени заказа — такси
     заказывается накануне. Отслеживать машину в пути (GPS) приложение
     не может: для этого нужен сервер и трекер в машине.
   ═══════════════════════════════════════════════════════════════════ */
const FLEET_PRESETS=[
  {model:"ГАЗель Next",wheelchair:true},
  {model:"Лада Ларгус",wheelchair:false}
];
const PLATE_LETTERS="АВЕКМНОРСТУХ";
const PLATE_LAT={A:"А",B:"В",E:"Е",K:"К",M:"М",H:"Н",O:"О",P:"Р",C:"С",T:"Т",Y:"У",X:"Х"};

function fleetBranch(city){return (typeof branchContent!=="undefined"&&branchContent[city||currentCity])||null;}
function fleetOf(city){
  const b=fleetBranch(city);
  if(!b)return [];
  if(!Array.isArray(b.fleet))b.fleet=[];
  b.fleet.forEach(function(c){if(c&&!c.id)c.id="car_"+Math.random().toString(36).slice(2,8);});
  return b.fleet;
}
function fleetCarById(id,city){return fleetOf(city).find(function(c){return c.id===id;})||null;}

/* ═══ Соцобъекты — быстрые адреса назначения ═══ */
const PLACE_TYPES=[["hospital","","Больница"],["clinic","","Поликлиника"],["pharmacy","","Аптека"],["mfc","","МФЦ"],
  ["sfr","","Соцфонд"],["social","","Соцучреждение"],["other","","Другое"]];
function placeIcon(type){const t=PLACE_TYPES.find(function(x){return x[0]===type;});return t?t[1]:"";}
function placesOf(city){
  const b=fleetBranch(city);if(!b)return [];
  if(!Array.isArray(b.places))b.places=[];
  return b.places;
}

/* ═══ Смены машин ═══
   Смена: {id, car, driver, days:[1..7] (1 — пн) ИЛИ date:"ГГГГ-ММ-ДД", from:"08:30", to:"18:00"}.
   Если в филиале нет ни одной смены — работает обычное расписание такси (08:30–18:00),
   ничего не ломается и заявки не «падают в лист ожидания». */
function shiftsOf(city){
  const b=fleetBranch(city);if(!b)return [];
  if(!Array.isArray(b.shifts))b.shifts=[];
  return b.shifts;
}
function shiftsEnabled(city){
  return shiftsOf(city).some(function(sh){const c=fleetCarById(sh.car,city);return c&&c.active!==false;});
}
function isoDow(iso){const d=new Date(iso+"T00:00:00");const w=d.getDay();return w===0?7:w;}
/* Смены, которые работают в этот день (машина на линии; при нужде в коляске — только такие машины). */
function shiftsOn(iso,opts,city){
  opts=opts||{};
  const dow=isoDow(iso);
  return shiftsOf(city).filter(function(sh){
    const car=fleetCarById(sh.car,city);
    if(!car||car.active===false)return false;
    if(opts.wheelchair&&!car.wheelchair)return false;
    if(sh.date)return sh.date===iso;
    return Array.isArray(sh.days)&&sh.days.indexOf(dow)>=0;
  });
}
function tMin(hhmm){const p=String(hhmm||"").split(":");return (+p[0]||0)*60+(+p[1]||0);}
/* Свободные слоты подачи в этот день по сменам. null — смены не заданы, работает обычное расписание. */
function taxiSlotsFor(iso,opts,city){
  if(!shiftsEnabled(city))return null;
  const list=shiftsOn(iso,opts,city);
  const ok={};
  taxiTimeSlots().forEach(function(t){
    if(isBreakTime(t))return;
    const m=tMin(t);
    if(list.some(function(sh){return m>=tMin(sh.from)&&m<=tMin(sh.to);}))ok[t]=1;
  });
  return ok;
}
function fleetActive(city){return fleetOf(city).filter(function(c){return c&&c.active!==false&&String(c.model||"").trim();});}
function fleetHasWheelchair(city){return fleetActive(city).some(function(c){return c.wheelchair;});}

/* Госномер: латиница → кириллица, без пробелов, верхний регистр. */
function plateNormalize(p){
  return String(p||"").toUpperCase().replace(/[ABEKMHOPCTYX]/g,function(ch){return PLATE_LAT[ch]||ch;}).replace(/[^А-ЯЁ0-9]/g,"");
}
function plateValid(p){
  const n=plateNormalize(p);
  return new RegExp("^["+PLATE_LETTERS+"]\\d{3}["+PLATE_LETTERS+"]{2}\\d{2,3}$").test(n);
}
/* Номер в виде российского знака: «А 123 ВС | 89 RUS». */
function plateHtml(p){
  const n=plateNormalize(p);
  if(!plateValid(n))return n?'<span class="plate plate-raw">'+n+'</span>':"";
  return '<span class="plate" aria-label="Госномер '+n+'"><span class="plate-main">'+n[0]+'<b>'+n.slice(1,4)+'</b>'+n.slice(4,6)+'</span>'+
    '<span class="plate-reg"><b>'+n.slice(6)+'</b><i>RUS</i></span></span>';
}

/* Предварительное назначение машины на заказ. */
function fleetPick(opts,city){
  opts=opts||{};
  /* Есть смены — берём машину, чья смена покрывает время подачи. */
  if(opts.date&&opts.time&&shiftsEnabled(city)){
    const m=tMin(opts.time);
    const cover=shiftsOn(opts.date,{wheelchair:!!opts.wheelchair},city).filter(function(sh){return m>=tMin(sh.from)&&m<=tMin(sh.to);});
    if(cover.length){
      const sh=cover.find(function(x){const c=fleetCarById(x.car,city);return opts.wheelchair||!c.wheelchair;})||cover[0];
      const car=fleetCarById(sh.car,city);
      return {model:car.model,plate:plateNormalize(car.plate),color:car.color||"",wheelchair:!!car.wheelchair,driver:sh.driver||car.driver||"",note:""};
    }
  }
  const list=fleetActive(city);
  if(!list.length)return null;
  let car=null,note="";
  if(opts.wheelchair){
    car=list.find(function(c){return c.wheelchair;});
    if(!car){car=list[0];note="Машины для коляски на линии нет — диспетчер уточнит возможность поездки.";}
  }else{
    car=list.find(function(c){return !c.wheelchair;})||list[0];
  }
  return {model:car.model,plate:plateNormalize(car.plate),color:car.color||"",wheelchair:!!car.wheelchair,driver:car.driver||"",note:note};
}
function carLine(car){
  if(!car)return "";
  return car.model+(car.color?", "+car.color:"")+(car.plate?", госномер "+car.plate:"")+(car.wheelchair?" (для колясок)":"");
}

/* ── Время до подачи ── */
function taxiRideStart(tx){
  const d=new Date(String(tx.date)+"T"+(tx.time||"00:00")+":00");
  return isNaN(d)?null:d;
}
/* Состояние поездки: upcoming / soon / now / done / cancelled */
function taxiRideState(tx,now){
  if(tx.status==="cancelled")return {key:"cancelled",label:"Отменено",eta:""};
  const st=taxiRideStart(tx);if(!st)return {key:"upcoming",label:"Заказано",eta:""};
  now=now||new Date();
  const mins=Math.round((st-now)/60000);
  const dur=parseInt(tx.duration,10)||30;
  if(mins>120)return {key:"upcoming",label:"Заказано",eta:"Подача "+etaHuman(mins)};
  if(mins>0)return {key:"soon",label:"Скоро подача",eta:"Подача "+etaHuman(mins)};
  if(mins>-(dur+15))return {key:"now",label:"Машина подаётся",eta:"Машина должна подъехать к "+tx.time};
  return {key:"done",label:"Поездка прошла",eta:""};
}
function etaHuman(mins){
  if(mins<1)return "сейчас";
  const d=Math.floor(mins/1440),h=Math.floor((mins%1440)/60),m=mins%60;
  if(d>=1)return "через "+d+" "+fleetPlural(d,["день","дня","дней"])+(h?" "+h+" ч":"");
  if(h>=1)return "через "+h+" ч"+(m?" "+m+" мин":"");
  return "через "+m+" мин";
}
function fleetPlural(n,f){const a=n%10,b=n%100;return (a===1&&b!==11)?f[0]:(a>=2&&a<=4&&(b<10||b>=20))?f[1]:f[2];}
function rideDateHuman(date,time){
  const d=new Date(String(date)+"T00:00:00");if(isNaN(d))return date+" "+(time||"");
  const today=new Date();today.setHours(0,0,0,0);
  const diff=Math.round((d-today)/864e5);
  const day=diff===0?"сегодня":diff===1?"завтра":diff===2?"послезавтра":d.toLocaleDateString("ru-RU",{day:"numeric",month:"long",weekday:"short"});
  return day+" в "+(time||"");
}

/* Карточка машины для экрана подтверждения и «Моих заявок». */
function carCardHtml(tx){
  let car=tx.car;
  /* машина не сохранена в заявке (например, смены добавили позже) — показываем предварительную по сменам */
  if(!car&&!tx.carConfirmed&&["cancelled","done","rejected"].indexOf(tx.remoteStatus||tx.status)<0){
    let city=currentCity;
    if(tx.branch)city=String(tx.branch).split(":").pop();
    else if(tx.cityName&&typeof BRANCH_NAMES_MAP!=="undefined"){
      const n=String(tx.cityName).replace(/^(г\.|пгт\.|мкр\.)\s*/,"");
      const id=Object.keys(BRANCH_NAMES_MAP).find(function(k){return String(BRANCH_NAMES_MAP[k]).replace(/^(г\.|пгт\.|мкр\.)\s*/,"")===n;});
      if(id)city=id;
    }
    try{if(branchContent[city])car=fleetPick({date:tx.date,time:tx.time,wheelchair:!!tx.wheelchair},city);}catch(e){car=null;}
  }
  const state=taxiRideState(tx);
  const when=rideDateHuman(tx.date,tx.time);
  if(!car){
    return '<div class="car-card car-none"><div class="car-ico" aria-hidden="true">'+ico("taxi")+'</div><div class="car-main">'+
      '<b>Машину назначит диспетчер</b><span>Модель и госномер сообщат при подтверждении поездки.</span>'+
      '<span class="car-eta" data-eta="'+tx.num+'">'+(state.eta||("Подача "+when))+'</span></div></div>';
  }
  return '<div class="car-card'+(state.key==="now"?" car-now":"")+'">'+
    '<div class="car-ico" aria-hidden="true">'+ico(car.wheelchair?"van":"car")+'</div>'+
    '<div class="car-main"><span class="car-lbl">Ваша машина'+(tx.carConfirmed?"":" · предварительно")+'</span>'+
      '<b class="car-model">'+car.model+(car.color?' <em>'+car.color+'</em>':'')+'</b>'+
      (car.plate?plateHtml(car.plate):'<span class="car-noplate">госномер сообщит диспетчер</span>')+
      (car.wheelchair?'<span class="car-tag">Для колясок</span>':'')+
      (car.driver?'<span class="car-driver">Водитель: '+car.driver+'</span>':'')+
      '<span class="car-eta" data-eta="'+tx.num+'">'+(state.eta||("Подача "+when))+'</span>'+
      (car.note?'<span class="car-note">'+car.note+'</span>':'')+
    '</div></div>';
}

/* Обновление отсчёта «через N мин» на открытом экране раз в 30 секунд. */
setInterval(function(){
  const els=document.querySelectorAll("[data-eta]");if(!els.length)return;
  let hist=[];try{hist=JSON.parse(localStorage.getItem("taxiHistory")||"[]");}catch(e){}
  els.forEach(function(el){
    const tx=hist.find(function(x){return x.num===el.dataset.eta;});if(!tx)return;
    const s=taxiRideState(tx);
    el.textContent=s.eta||("Подача "+rideDateHuman(tx.date,tx.time));
    const badge=document.querySelector('[data-eta-badge="'+tx.num+'"]');
    if(badge){badge.textContent=s.label;badge.className="st-badge st-taxi-"+s.key;}
  });
},30000);

/* Ближайшая предстоящая поездка — для чат-бота. */
function nextTaxiRide(){
  let hist=[];try{hist=JSON.parse(localStorage.getItem("taxiHistory")||"[]");}catch(e){}
  const now=new Date();
  return hist.filter(function(t){const s=taxiRideState(t,now);return s.key==="upcoming"||s.key==="soon"||s.key==="now";})
    .sort(function(a,b){return (taxiRideStart(a)||0)-(taxiRideStart(b)||0);})[0]||null;
}

;

/* ───── js/centers-data.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   centers-data.js — шаблоны центров социального обслуживания ЯНАО
   для платформы «Социальные услуги ЯНАО».

   Названия и адреса взяты из открытых реестров (ЕГРЮЛ-сервисы, dobro.ru)
   и требуют проверки центрами. Услуги, сотрудники и цены НЕ заполнены —
   их вносит каждый центр в своей панели. «Гармония» берётся целиком
   из встроенных данных приложения со своим оформлением.
   ═══════════════════════════════════════════════════════════════════ */
var PLATFORM_BRAND={
  name:"Социальные услуги ЯНАО",
  org:"Центры социального обслуживания Ямало-Ненецкого автономного округа",
  logo:"img/socuslugi-logo.png",
  accent:"#1f5fbf"
};
var CENTER_DEFAULT_LOGO="img/socuslugi-logo.png";
var CENTER_DEFAULT_BOT="img/socuslugi-bot.jpg";

function centerTemplate(id,name,org,accent,branches,logo){
  var cd={},bc={};
  branches.forEach(function(b){
    cd[b.id]={address:b.address||"",phone:b.phone||"",phoneRaw:(b.phone||"").replace(/\D/g,"").replace(/^8/,"7"),email:b.email||"",
      hours:"Пн–Пт: 08:30–18:00, обед 12:30–14:00",openH:8,openM:30,closeH:18,closeM:0};
    bc[b.id]={services:[],staff:[],fleet:[],shifts:[],places:[]};
  });
  return {id:id,template:true,visible:true,
    brand:{name:name,nameGen:name,org:org,logo:logo||CENTER_DEFAULT_LOGO,botAvatar:CENTER_DEFAULT_BOT,accent:accent,vk:"",vkId:0,
      effects:{animations:true,seasonal:true,decor:true,glass:true}},
    branches:branches.map(function(b){return {id:b.id,name:b.name};}),
    cityData:cd,branchContent:bc,newsData:[],eventsData:[],galleryData:[]};
}

var CENTER_TEMPLATES=[
  centerTemplate("doverie","Доверие","ГБУ ЯНАО «ЦСОН «Доверие»","#1f3fa8",[
    {id:"salekhard",name:"г. Салехард",address:"ЯНАО, г. Салехард",email:"doverie.slh@yanao.ru"},
    {id:"labytnangi",name:"г. Лабытнанги",address:"629400, ЯНАО, г. Лабытнанги, ул. Школьная, д. 32а",phone:"8(34992)2-35-77"}],"img/center-doverie.png"),
  centerTemplate("sadko","Садко","ГБУ ЯНАО «ЦСОН «Садко»","#2e7d32",[
    {id:"novy-urengoy",name:"г. Новый Уренгой",address:"629305, ЯНАО, г. Новый Уренгой, мкр. Оптимистов, д. 11, к. 2"}],"img/center-sadko.png"),
  centerTemplate("domashniy-ochag","Домашний очаг","ГБУ ЯНАО «ЦСОН «Домашний очаг»","#c2532b",[
    {id:"nadym",name:"г. Надым",address:"629736, ЯНАО, г. Надым, Ленинградский пр-кт, д. 21"}]),
  centerTemplate("zabota","Забота","ГБУ ЯНАО «ЦСОН «Забота»","#2f6db5",[
    {id:"tazovsky",name:"п. Тазовский",address:"629350, ЯНАО, Тазовский район, п. Тазовский, ул. Ленина, зд. 5"}],"img/center-zabota.png"),
  centerTemplate("miloserdie","Милосердие","ГБУ ЯНАО «ЦСОН «Милосердие»","#c0262d",[
    {id:"krasnoselkup",name:"с. Красноселькуп",address:"ЯНАО, Красноселькупский район, с. Красноселькуп, ул. Строителей, д. 10",phone:"8(34932)2-22-47",email:"miloserdie.selkup@yanao.ru"},
    {id:"tolka",name:"с. Толька",address:"ЯНАО, Красноселькупский район, с. Толька"}],"img/center-miloserdie.png")
];

;

/* ───── js/centers.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   centers.js — платформа «Социальные услуги ЯНАО»: несколько центров в одном
   приложении. Подключается только в сборке socuslugi (build.py --project socuslugi).

   • У каждого центра свои оформление, филиалы, контакты, услуги, сотрудники,
     новости, мероприятия и галерея. Данные центра — тот же формат, что у «Гармонии».
   • Активный центр загружается в общие переменные приложения (cityData, branchContent…),
     поэтому все экраны, чат-бот и админка работают без изменений.
   • Заявки уходят на сервер с филиалом вида «центр:филиал».
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var LS_KEY="socCenter";
  var reg={};            // id → данные центра
  var order=[];          // порядок центров
  var cur=null;          // активный центр
  var applyOne=null,snapshotOne=null;   // из content.js
  var builtin=null;      // встроенные данные «Гармонии» (снимок при запуске)
  var HOME="garmoniya";  // центр с ключами филиалов без префикса — совместимость со старыми заявками и ролями
  var platform={};       // настройки платформы: название, подпись, логотип (панель → «Центры»)

  function clone(x){return JSON.parse(JSON.stringify(x));}
  function list(all){return order.filter(function(id){return reg[id]&&(all||reg[id].visible!==false);}).map(function(id){return reg[id];});}

  /* Очистить общие переменные перед загрузкой другого центра */
  function resetGlobals(){
    Object.keys(cityData).forEach(function(k){delete cityData[k];});
    Object.keys(branchContent).forEach(function(k){delete branchContent[k];});
    BRANCH_REGISTRY.length=0;syncBranchMaps();
    if(typeof newsData!=="undefined")newsData.length=0;
    if(typeof eventsData!=="undefined")eventsData.length=0;
    if(typeof galleryData!=="undefined")galleryData.length=0;
  }
  function loadIntoGlobals(id){
    var c=reg[id];if(!c)return false;
    resetGlobals();
    applyOne(clone({branches:c.branches,cityData:c.cityData,branchContent:c.branchContent,newsData:c.newsData||[],
      eventsData:c.eventsData||[],galleryData:c.galleryData||[]}));
    window.GContent.setBrand(c.brand||null);
    if(window.GSettings)GSettings.apply(c.settings||null);   /* настройки центра: такси, обед, «Морошка», бот… */
    cur=id;
    return true;
  }
  /* Сохранить правки активного центра из общих переменных в реестр */
  function captureCurrent(){
    if(!cur||!reg[cur]||!snapshotOne)return;
    var s=clone(snapshotOne());      /* копия, а не ссылки на живые списки — иначе их очистит смена центра */
    var c=reg[cur];
    c.branches=s.branches;c.cityData=s.cityData;c.branchContent=s.branchContent;
    c.newsData=s.newsData||[];c.eventsData=s.eventsData||[];c.galleryData=s.galleryData||[];
    c.brand=window.GContent.getBrand();
    c.settings=window.GSettings?GSettings.raw():null;
  }

  function init(fnApply,fnSnap){
    applyOne=fnApply;snapshotOne=fnSnap;
    /* «Гармония» — встроенные данные приложения со своим оформлением */
    builtin=clone(snapshotOne());   /* копия: новости, мероприятия, галерея «Гармонии» не потеряются */
    builtin.id="garmoniya";builtin.visible=true;builtin.brand=null;
    reg={garmoniya:builtin};order=["garmoniya"];
    (window.CENTER_TEMPLATES||[]).forEach(function(t){reg[t.id]=clone(t);order.push(t.id);});
    var saved=null;try{saved=localStorage.getItem(LS_KEY);}catch(e){}
    loadIntoGlobals(reg[saved]?saved:"garmoniya");
  }
  /* Данные из админки / сервера: {centers:{…}, centerOrder:[…]} */
  /* Данные прежнего формата (один центр — «Гармония»): переносятся в центр «Гармония» */
  function loadLegacy(ov){
    if(!ov||typeof ov!=="object"||!(ov.branchContent||ov.cityData))return false;
    var keepCur=cur;
    captureCurrent();
    if(!reg[HOME]){reg[HOME]=clone(builtin);order.unshift(HOME);}
    loadIntoGlobals(HOME);resetGlobals();
    applyOne(clone(builtin));                 // встроенная основа
    applyOne(ov);                            // поверх — сохранённые правки «Гармонии»
    window.GContent.setBrand(ov.brand||null);
    cur=HOME;captureCurrent();
    loadIntoGlobals(reg[keepCur]?keepCur:HOME);
    return true;
  }
  function load(ov){
    if(!ov||!ov.centers||typeof ov.centers!=="object")return loadLegacy(ov);
    if(ov.platform&&typeof ov.platform==="object")platform=clone(ov.platform);
    var keepCur=cur;
    reg={};order=[];
    var ids=Array.isArray(ov.centerOrder)?ov.centerOrder.slice():Object.keys(ov.centers);
    Object.keys(ov.centers).forEach(function(id){if(ids.indexOf(id)<0)ids.push(id);});
    ids.forEach(function(id){var c=ov.centers[id];if(c&&/^[a-z0-9_-]{2,40}$/.test(id)){reg[id]=clone(c);reg[id].id=id;order.push(id);}});
    if(!order.length){reg={garmoniya:builtin};order=["garmoniya"];}
    var saved=null;try{saved=localStorage.getItem(LS_KEY);}catch(e){}
    var target=reg[keepCur]?keepCur:(reg[saved]?saved:order[0]);
    loadIntoGlobals(target);
    /* главная уже открыта — обновить карточки центров свежими данными с сервера */
    var open=document.querySelector(".soc-pick");
    if(open&&pickerArgs){var q=(open.querySelector(".soc-pick-q")||{}).value||"",st=open.scrollTop;
      showPicker(pickerArgs[0],pickerArgs[1]);var n=document.querySelector(".soc-pick");
      if(n){n.scrollTop=st;if(q){var i=n.querySelector(".soc-pick-q");i.value=q;i.dispatchEvent(new Event("input"));}}}
    return true;
  }
  function snapshot(){
    captureCurrent();
    var out={centers:{},centerOrder:order.slice(),platform:clone(platform)};
    order.forEach(function(id){out.centers[id]=clone(reg[id]);});
    return out;
  }
  function switchTo(id,opt){
    if(!reg[id])return false;
    captureCurrent();
    loadIntoGlobals(id);
    if(!(opt&&opt.noSave))try{localStorage.setItem(LS_KEY,id);}catch(e){}
    if(typeof selectCity==="function"&&!(opt&&opt.admin)){
      var saved=null,prev=null;try{saved=localStorage.getItem("socBranch:"+id);prev=localStorage.getItem("currentCity");}catch(e){}
      /* филиал, выбранный в этом центре раньше; для «Гармонии» — и филиал из прежней версии */
      selectCity(branchContent[saved]?saved:(branchContent[prev]?prev:firstBranch()),true);
    }
    /* филиал жителя должен существовать в новом центре — иначе первый филиал */
    if(typeof selectCity==="function"&&typeof currentCity!=="undefined"&&!branchContent[currentCity])selectCity(firstBranch(),true);
    if(window.GContent)window.GContent.refreshActive();
    return true;
  }
  function branchKey(b){return cur&&cur!==HOME?cur+":"+b:b;}
  function branchLabel(key){
    var p=String(key).split(":");
    if(p.length<2){var h=reg[HOME];var hb=h&&(h.branches||[]).find(function(x){return x.id===key;});return (h?centerName(h)+" · ":"")+(hb?hb.name:key);}
    var c=reg[p[0]];var br=c&&(c.branches||[]).find(function(x){return x.id===p[1];});
    return (c?centerName(c)+" · ":"")+(br?br.name:p[1]);
  }
  function platformInfo(){var d=window.PLATFORM_BRAND||{};return {name:platform.name||d.name,org:platform.org||d.org,logo:platform.logo||d.logo,title:platform.title||"Центры округа",taxiText:platform.taxiText||"Без регистрации: центр → филиал → заявка"};}
  function centerName(c){return (c.brand&&c.brand.name)||(c.id==="garmoniya"?"Гармония":c.id);}
  function centerLogo(c){return (c.brand&&c.brand.logo)||(c.id==="garmoniya"?"img/logo-icon.png":window.CENTER_DEFAULT_LOGO||"");}
  function centerAccent(c){return (c.brand&&c.brand.accent)||"#3f8f87";}
  function emptyCenter(name){
    var tpl=window.centerTemplate?centerTemplate("x",name,"ГБУ ЯНАО «ЦСОН «"+name+"»","#2f6fd0",[{id:"main",name:"Основной филиал"}]):null;
    if(tpl){delete tpl.id;tpl.template=false;}
    return tpl;
  }
  function addCenter(id,data){
    if(!/^[a-z0-9_-]{2,40}$/.test(id)||reg[id])return false;
    data.id=id;reg[id]=data;order.push(id);return true;
  }
  function removeCenter(id){
    if(!reg[id]||order.length<2)return false;
    var i=order.indexOf(id);order.splice(i,1);var gone=reg[id];delete reg[id];
    if(cur===id)loadIntoGlobals(order[0]);
    return {data:gone,index:i};
  }
  function restoreCenter(id,saved){reg[id]=saved.data;order.splice(saved.index,0,id);}
  function move(id,d){var i=order.indexOf(id),j=i+d;if(i<0||j<0||j>=order.length)return;order[i]=order[j];order[j]=id;}

  /* ── Выбор центра при входе ── */
  /* Главная платформы — выбор центра — показывается при каждом запуске приложения.
     В пределах одного сеанса (обновление страницы) повторно не показывается. */
  function needPick(){
    var s=null,picked=null;
    try{s=localStorage.getItem(LS_KEY);picked=sessionStorage.getItem("socPicked");}catch(e){}
    return !(picked==="1"&&s&&reg[s]);
  }
  function lastCenter(){var s=null;try{s=localStorage.getItem(LS_KEY);}catch(e){}return reg[s]?s:null;}
  function plural(n,f){var a=n%10,b=n%100;return a===1&&b!==11?f[0]:(a>=2&&a<=4&&(b<10||b>=20)?f[1]:f[2]);}
  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");}
  var pickerArgs=null;
  function showPicker(after,canClose){
    pickerArgs=[after,canClose];
    document.querySelectorAll(".soc-pick").forEach(function(e){e.remove();});
    var cs=list(false),last=lastCenter();
    if(last)cs.sort(function(a,b){return (b.id===last)-(a.id===last);});
    var ovl=document.createElement("div");ovl.className="soc-pick";ovl.setAttribute("role","dialog");ovl.setAttribute("aria-modal","true");ovl.setAttribute("aria-label","Выбор центра социального обслуживания");
    var P=platformInfo();
    var nBr=cs.reduce(function(n,c){return n+(c.branches||[]).length;},0);
    function citiesHtml(c){
      var names=(c.branches||[]).map(function(b){return b.name;});
      var shown=names.slice(0,3).map(function(n){return '<i>'+esc(n)+'</i>';}).join("");
      return shown+(names.length>3?'<i class="more">ещё '+(names.length-3)+'</i>':"");
    }
    ovl.innerHTML='<section class="soc-hero" data-brand-raw>'+
        '<div class="soc-aurora" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i><i class="a4"></i></div>'+
        '<div class="soc-stars" aria-hidden="true"></div>'+
        (canClose?'<button type="button" class="soc-pick-x" aria-label="Закрыть">✕</button>':'')+
        '<div class="soc-hero-in">'+
          '<img src="'+esc(P.logo)+'" alt="'+esc(P.name)+'" class="soc-hero-logo">'+
          '<h1>'+esc(P.name)+'</h1>'+
          '<p class="soc-hero-sub">'+esc(P.org)+'</p>'+
          '<button type="button" class="soc-quick" id="socTaxi"><span class="soc-quick-ic"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 16h14M4 16v-3l2-5h12l2 5v3"/><path d="M4 13h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/><path d="M9 8l1-3h4l1 3"/></svg></span>'+
            '<span class="soc-quick-t"><b>Заказать социальное такси</b><small>'+esc(P.taxiText)+'</small></span><span class="soc-quick-go">›</span></button>'+
        '</div></section>'+
      '<div class="soc-body" data-brand-raw>'+
        '<div class="soc-sec"><h2>'+esc(P.title)+'</h2><span>'+cs.length+' '+plural(cs.length,["центр","центра","центров"])+' · '+nBr+' '+plural(nBr,["филиал","филиала","филиалов"])+'</span></div>'+
        '<div class="soc-pick-list">'+cs.map(function(c){
          var cities=(c.branches||[]).map(function(b){return b.name;}).join(" ");
          var filled=(c.branches||[]).some(function(b){var bc=c.branchContent&&c.branchContent[b.id];return bc&&bc.services&&bc.services.length;});
          return '<button type="button" class="soc-card'+(c.id===last?" cur":"")+'" data-cid="'+esc(c.id)+'" data-q="'+esc((centerName(c)+" "+cities+" "+((c.brand&&c.brand.org)||"")).toLowerCase())+'" style="--c:'+esc(centerAccent(c))+'">'+
            '<span class="soc-card-logo"><img src="'+esc(centerLogo(c))+'" alt="" loading="lazy"></span>'+
            '<span class="soc-card-txt">'+(c.id===last?'<span class="soc-card-last">Ваш центр</span>':'')+'<b>'+esc(centerName(c))+'</b>'+
              '<small>'+esc((c.brand&&c.brand.org)||(c.id===HOME?"ГБУ ЯНАО «ЦСОН «Гармония»":""))+'</small>'+
              '<span class="soc-card-cities">'+citiesHtml(c)+'</span>'+
              (filled?'':'<span class="soc-card-soon">скоро</span>')+'</span>'+
            '<span class="soc-card-go" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></span></button>';
        }).join("")+'</div>'+
        '<p class="soc-pick-empty" hidden>Ничего не найдено — попробуйте другое название города или центра.</p>'+
        '<footer class="soc-foot"><img src="'+esc(P.logo)+'" alt=""><span>'+esc(P.name)+'</span></footer>'+
      '</div>';
    document.body.appendChild(ovl);
    var qEl=ovl.querySelector(".soc-pick-q");
    if(qEl)qEl.oninput=function(e){var q=e.target.value.trim().toLowerCase(),vis=0;
      ovl.querySelectorAll(".soc-card").forEach(function(c){c.hidden=!!q&&c.dataset.q.indexOf(q)<0;if(!c.hidden)vis++;});
      ovl.querySelector(".soc-pick-empty").hidden=vis>0;};
    ovl.querySelectorAll(".soc-card").forEach(function(btn){btn.onclick=function(){
      var id=btn.dataset.cid;switchTo(id);ovl.remove();
      try{sessionStorage.setItem("socPicked","1");}catch(e){}
      if(after)after();else{var t=document.querySelector(".tb");if(t)t.click();}
      if(typeof window.hdrRefresh==="function")setTimeout(window.hdrRefresh,50);
    };});
    var x=ovl.querySelector(".soc-pick-x");if(x)x.onclick=function(){ovl.remove();};
    ovl.querySelector("#socTaxi").onclick=function(){taxiWizard(ovl,after);};
  }

  /* Запоминаем филиал отдельно для каждого центра */
  setTimeout(function(){
    if(typeof window.selectCity==="function"&&!window.selectCity.__soc){
      var orig=window.selectCity;
      window.selectCity=function(k){var r=orig.apply(this,arguments);try{if(cur)localStorage.setItem("socBranch:"+cur,k);}catch(e){}return r;};
      window.selectCity.__soc=1;
    }
  },0);

  /* ═══ Быстрый заказ социального такси с главной: центр → филиал → заявка ═══ */
  /* такси доступно во всех центрах и филиалах: без тарифов — стоимость уточнит центр */
  function hasTaxi(c,bid){return !!(c.branchContent&&c.branchContent[bid]);}
  function taxiWizard(pickOvl,after){
    var w=document.createElement("div");w.className="soc-wiz";w.setAttribute("role","dialog");w.setAttribute("aria-modal","true");w.setAttribute("aria-label","Заказ социального такси");
    var st={step:1,cid:null,bid:null};
    function steps(){return '<ol class="soc-wiz-steps">'+["Центр","Филиал","Заявка"].map(function(t,i){return '<li class="'+(i+1<st.step?"done":i+1===st.step?"on":"")+'"><span>'+(i+1)+'</span>'+t+'</li>';}).join("")+'</ol>';}
    function draw(){
      var body="";
      if(st.step===1){
        body='<h3>Выберите центр</h3><div class="soc-wiz-list">'+list(false).map(function(c){
          var any=(c.branches||[]).some(function(b){return hasTaxi(c,b.id);});
          return '<button type="button" class="soc-wiz-item'+(any?"":" off")+'" data-c="'+esc(c.id)+'" style="--c:'+esc(centerAccent(c))+'"><img src="'+esc(centerLogo(c))+'" alt=""><span><b>'+esc(centerName(c))+'</b><small>'+(any?esc((c.branches||[]).map(function(b){return b.name;}).join(", ")):"такси пока не подключено")+'</small></span><i>›</i></button>';}).join("")+'</div>';
      }else if(st.step===2){
        var c=reg[st.cid];
        body='<h3>Выберите филиал</h3><p class="soc-wiz-note">'+esc(centerName(c))+'</p><div class="soc-wiz-list">'+(c.branches||[]).map(function(b){
          var ok=hasTaxi(c,b.id),cd=c.cityData&&c.cityData[b.id]||{};
          return '<button type="button" class="soc-wiz-item'+(ok?"":" off")+'" data-b="'+esc(b.id)+'" style="--c:'+esc(centerAccent(c))+'" '+(ok?"":"disabled")+'><span class="soc-wiz-pin">'+
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/></svg></span><span><b>'+esc(b.name)+'</b><small>'+(ok?esc(cd.address||"Социальное такси доступно"):"такси в этом филиале не подключено")+'</small></span><i>›</i></button>';}).join("")+'</div>';
      }
      w.innerHTML='<div class="soc-wiz-card"><header><button type="button" class="soc-wiz-back" aria-label="Назад">‹</button><b>Социальное такси</b><button type="button" class="soc-wiz-x" aria-label="Закрыть">✕</button></header>'+steps()+'<div class="soc-wiz-body">'+body+'</div></div>';
      w.querySelector(".soc-wiz-x").onclick=function(){w.remove();};
      w.querySelector(".soc-wiz-back").onclick=function(){if(st.step>1){st.step--;draw();}else w.remove();};
      w.querySelectorAll("[data-c]").forEach(function(b){b.onclick=function(){
        if(b.classList.contains("off")){b.classList.add("shake");setTimeout(function(){b.classList.remove("shake");},400);return;}
        st.cid=b.dataset.c;var c=reg[st.cid];var ok=(c.branches||[]).filter(function(x){return hasTaxi(c,x.id);});
        if(ok.length===1){st.bid=ok[0].id;go();}else{st.step=2;draw();}};});
      w.querySelectorAll("[data-b]").forEach(function(b){b.onclick=function(){st.bid=b.dataset.b;go();};});
    }
    function go(){
      st.step=3;draw();
      switchTo(st.cid);
      if(typeof selectCity==="function")selectCity(st.bid,true);
      try{sessionStorage.setItem("socPicked","1");}catch(e){}
      setTimeout(function(){
        w.remove();if(pickOvl)pickOvl.remove();
        var logged=false;try{logged=!!(localStorage.getItem("clientName")&&localStorage.getItem("clientPhone"));}catch(e){}
        if(logged){if(after)after();}
        else if(typeof enterAsGuest==="function"){
          /* без регистрации: сразу форма заказа, ФИО и телефон вводятся в ней */
          enterAsGuest();   /* без приветствия и вопроса о «Морошке» — сразу форма заказа */
        }else if(after)after();
        if(typeof window.hdrRefresh==="function")setTimeout(window.hdrRefresh,50);
        setTimeout(function(){if(typeof showTaxi==="function")showTaxi();},300);
      },450);
    }
    document.body.appendChild(w);draw();
  }
  /* после регистрации — сразу к заявке, если её начинали с главной */
  setTimeout(function(){
    if(typeof window.showWelcome==="function"&&!window.showWelcome.__soc){
      var o=window.showWelcome;
      window.showWelcome=function(){var r=o.apply(this,arguments);if(window.__socAfter==="taxi"){window.__socAfter=null;setTimeout(function(){if(typeof showTaxi==="function")showTaxi();},400);}return r;};
      window.showWelcome.__soc=1;
    }
  },0);

  window.GCenters={init:init,load:load,snapshot:snapshot,switchTo:switchTo,list:list,current:function(){return cur;},
    get:function(id){return reg[id||cur];},branchKey:branchKey,branchLabel:branchLabel,centerName:centerName,centerLogo:centerLogo,
    addCenter:addCenter,removeCenter:removeCenter,restoreCenter:restoreCenter,move:move,needPick:needPick,showPicker:showPicker,
    order:function(){return order.slice();},capture:captureCurrent,HOME:HOME,
    platform:platformInfo,setPlatform:function(p){platform=clone(p||{});},getPlatformRaw:function(){return clone(platform);},
    templates:function(){return (window.CENTER_TEMPLATES||[]).map(clone);},emptyCenter:emptyCenter};
})();

;

/* ───── js/content.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   content.js — данные приложения, общие для жителей и админпанели.

   Откуда берутся данные (по порядку, каждое следующее — поверх):
   1. встроенные в js/data.js (прейскурант, сотрудники по умолчанию);
   2. опубликованные:
        • серверный режим (config.js: api:"/api") — GET /api/content;
        • без сервера — файл опубликованных данных рядом с сайтом;
   3. только демо-режим: правки админки в этом браузере (localStorage).

   Режим задаётся в config.js: window.SOCUSLUGI_CONFIG = { api: "/api" }.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  const CITY_NAMES=BRANCH_NAMES_MAP;   /* реестр филиалов — js/data.js */
  const CONTACT_FIELDS=[["address","Адрес"],["phone","Телефон (для показа)"],["phoneRaw","Телефон (цифры, для звонка)"],["email","Email"],["hours","Часы работы"]];
  const TIME_FIELDS=["openH","openM","closeH","closeM"];

  function api(){
    const c=window.SOCUSLUGI_CONFIG||{};
    return typeof c.api==="string"?c.api.replace(/\/+$/,""):"";
  }

  let brandData=null;   /* оформление центра (название, логотип, цвета, эффекты) — js/brand.js */
  function setBrand(b){brandData=b&&typeof b==="object"?JSON.parse(JSON.stringify(b)):null;if(window.GBrand)GBrand.apply(brandData);}
  function getBrand(){return brandData?JSON.parse(JSON.stringify(brandData)):null;}
  /* Мультицентровый режим (платформа «Социальные услуги ЯНАО»): данные — {centers, centerOrder} */
  const multi=()=>!!(window.SOCUSLUGI_CONFIG&&window.SOCUSLUGI_CONFIG.multi&&window.GCenters);
  function applyOv(ov){
    if(!ov||typeof ov!=="object")return;
    if(multi()){GCenters.load(ov);return;}     /* и новый формат {centers}, и прежний — «Гармония» */
    applyOne(ov);
  }
  function applyOne(ov){
    if(!ov||typeof ov!=="object")return;
    if(ov.brand&&typeof ov.brand==="object")setBrand(ov.brand);
    if(window.GSettings&&ov.settings&&typeof ov.settings==="object")GSettings.apply(ov.settings);
    if(Array.isArray(ov.branches)&&typeof applyBranchRegistry==="function")applyBranchRegistry(ov.branches);
    if(ov.cityData)for(const c in ov.cityData){
      if(cityData[c])Object.assign(cityData[c],ov.cityData[c]);
    }
    if(ov.branchContent)for(const c in ov.branchContent){
      const b=branchContent[c];if(!b)continue;
      const o=ov.branchContent[c];
      if(o.services){b.services.length=0;o.services.forEach(x=>b.services.push(x));}
      if(o.staff){b.staff.length=0;o.staff.forEach(x=>b.staff.push(x));}
      if(Array.isArray(o.fleet))b.fleet=o.fleet.slice();
      if(Array.isArray(o.shifts))b.shifts=o.shifts.slice();
      if(Array.isArray(o.places))b.places=o.places.slice();
      if(Array.isArray(o.booking))b.booking=JSON.parse(JSON.stringify(o.booking));
    }
    if(ov.newsData&&typeof newsData!=="undefined"){newsData.length=0;ov.newsData.forEach(x=>newsData.push(x));}
    if(ov.eventsData&&typeof eventsData!=="undefined"){eventsData.length=0;ov.eventsData.forEach(x=>eventsData.push(x));}
    if(ov.galleryData&&typeof galleryData!=="undefined"){galleryData.length=0;ov.galleryData.forEach(x=>galleryData.push(x));}
    if(typeof cleanBranchTexts==="function")cleanBranchTexts();
  }
  /* Правки админки в этом браузере — только демо-режим. */
  function applyLocal(force){
    if(api()&&!force)return;
    let ov;try{ov=JSON.parse(localStorage.getItem("adminOverrides")||"null");}catch(e){ov=null;}
    applyOv(ov);
  }
  function snapshot(){
    if(multi())return GCenters.snapshot();
    return snapshotOne();
  }
  function snapshotOne(){
    const ov={cityData:{},branchContent:{},branches:BRANCH_REGISTRY.map(b=>({id:b.id,name:b.name}))};
    for(const c in cityData){
      ov.cityData[c]={};
      CONTACT_FIELDS.forEach(([f])=>{ov.cityData[c][f]=cityData[c][f];});
      TIME_FIELDS.forEach(f=>{if(cityData[c][f]!=null)ov.cityData[c][f]=cityData[c][f];});
    }
    for(const c in branchContent){
      const b=branchContent[c];
      ov.branchContent[c]={services:b.services,staff:b.staff,fleet:b.fleet||[],shifts:b.shifts||[],places:b.places||[]};
      if(Array.isArray(b.booking))ov.branchContent[c].booking=b.booking;
    }
    if(typeof newsData!=="undefined")ov.newsData=newsData;
    if(typeof eventsData!=="undefined")ov.eventsData=eventsData;
    if(typeof galleryData!=="undefined")ov.galleryData=galleryData;
    if(brandData)ov.brand=brandData;
    if(window.GSettings&&GSettings.raw())ov.settings=GSettings.raw();
    return ov;
  }
  function hashStr(str){let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;return (h>>>0).toString(36);}
  function refreshActive(){
    if(typeof currentCity!=="undefined"&&typeof branchContent!=="undefined"&&branchContent[currentCity]){
      servicesData=branchContent[currentCity].services;
      staffData=branchContent[currentCity].staff;
    }
  }

  const published={tried:false,loaded:false,at:null,hash:null,version:0};
  const listeners=[];
  function loadPublished(){
    if(location.protocol==="file:"){published.tried=true;return Promise.resolve();}
    const base=api();
    let url=base?base+"/content":"";
    
    if(!url){published.tried=true;return Promise.resolve();}
    /* Сервер недоступен (тестовый режим): берём правки панели из этого же браузера */
    const offline=()=>{
      if(!base||published.loaded)return;
      let ov=null;try{ov=JSON.parse(localStorage.getItem("adminOverrides")||"null");}catch(e){}
      if(!ov)return;
      applyLocal(true);refreshActive();
      listeners.forEach(fn=>{try{fn();}catch(e){}});
    };
    return fetch(url,{cache:"no-store",credentials:"same-origin"})
      .then(r=>{const ct=r.headers.get("content-type")||"";return r.ok&&(!base||/json/i.test(ct))?r.json():null;})
      .then(res=>{
        published.tried=true;
        if(base&&!(res&&res.data)){offline();return;}
        const ov=base?(res&&res.data):res;
        if(!ov||typeof ov!=="object"||!(ov.branchContent||ov.centers))return;
        published.loaded=true;
        published.at=base?(res.publishedAt||null):(ov.publishedAt||null);
        published.version=base?res.version:0;
        const meta=Object.assign({},ov);delete meta.publishedAt;delete meta.__draftVersion;
        published.hash=hashStr(JSON.stringify(meta));
        applyOv(ov);
        applyLocal();
        refreshActive();
        listeners.forEach(fn=>{try{fn();}catch(e){}});
      })
      .catch(()=>{published.tried=true;offline();});
  }

  window.GContent={CITY_NAMES,CONTACT_FIELDS,TIME_FIELDS,api,applyOv,applyOne,applyLocal,snapshot,snapshotOne,hashStr,refreshActive,setBrand,getBrand,
    published,loadPublished,onLoaded:fn=>listeners.push(fn)};

  /* Приложение жителей: применяем данные при загрузке. В админке (admin.html) — загрузка своя. */
  if(multi())GCenters.init(applyOne,snapshotOne);
  if(!window.SOCUSLUGI_ADMIN_APP){
    applyLocal();
    loadPublished();
  }
})();

;

/* ───── js/xlsx-lite.js ───── */
/* ═══════════════════════════════════════════════════════════════════
   xlsx-lite.js — чтение и запись таблиц Excel (.xlsx) и CSV в браузере
   без сторонних библиотек: для загрузки прейскуранта и сотрудников в панели.
   Чтение: первый лист книги → массив строк. Запись: несколько листов, жирная шапка.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var CRC=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(u8){var c=0xFFFFFFFF;for(var i=0;i<u8.length;i++)c=CRC[(c^u8[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
  var enc=new TextEncoder();

  /* ── чтение ZIP ── */
  async function inflateRaw(u8){
    if(typeof DecompressionStream==="undefined")throw new Error("Браузер не умеет распаковывать .xlsx — сохраните таблицу как CSV");
    var ds=new DecompressionStream("deflate-raw");
    var stream=new Blob([u8]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  async function unzip(buf){
    var u8=new Uint8Array(buf),dv=new DataView(buf),files={};
    var eocd=-1;for(var i=u8.length-22;i>=Math.max(0,u8.length-66000);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break;}}
    if(eocd<0)throw new Error("Файл повреждён или это не .xlsx");
    var n=dv.getUint16(eocd+10,true),off=dv.getUint32(eocd+16,true);
    for(var k=0;k<n;k++){
      var method=dv.getUint16(off+10,true),csize=dv.getUint32(off+20,true),nlen=dv.getUint16(off+28,true),elen=dv.getUint16(off+30,true),clen=dv.getUint16(off+32,true),loff=dv.getUint32(off+42,true);
      var name=new TextDecoder().decode(u8.subarray(off+46,off+46+nlen));
      var lnlen=dv.getUint16(loff+26,true),lelen=dv.getUint16(loff+28,true),start=loff+30+lnlen+lelen;
      files[name]={method:method,data:u8.subarray(start,start+csize)};
      off+=46+nlen+elen+clen;
    }
    return {get:async function(name){var f=files[name];if(!f)return null;var d=f.method===8?await inflateRaw(f.data):f.data;return new TextDecoder("utf-8").decode(d);},names:Object.keys(files)};
  }
  function colIndex(ref){var m=/^([A-Z]+)/.exec(ref||"");if(!m)return 0;var n=0;for(var i=0;i<m[1].length;i++)n=n*26+(m[1].charCodeAt(i)-64);return n-1;}
  async function readXlsx(buf){
    var z=await unzip(buf),P=new DOMParser();
    var wb=P.parseFromString(await z.get("xl/workbook.xml")||"","application/xml");
    var first=wb.getElementsByTagName("sheet")[0];if(!first)throw new Error("В книге нет листов");
    var rid=first.getAttribute("r:id")||first.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id");
    var rels=P.parseFromString(await z.get("xl/_rels/workbook.xml.rels")||"","application/xml");
    var target="worksheets/sheet1.xml";
    Array.prototype.forEach.call(rels.getElementsByTagName("Relationship"),function(r){if(r.getAttribute("Id")===rid)target=r.getAttribute("Target");});
    target=target.replace(/^\/?xl\//,"").replace(/^\//,"");
    var ssXml=await z.get("xl/sharedStrings.xml"),ss=[];
    if(ssXml){var sd=P.parseFromString(ssXml,"application/xml");Array.prototype.forEach.call(sd.getElementsByTagName("si"),function(si){
      ss.push(Array.prototype.map.call(si.getElementsByTagName("t"),function(t){return t.textContent;}).join(""));});}
    var sh=P.parseFromString(await z.get("xl/"+target)||"","application/xml");
    var rows=[];
    Array.prototype.forEach.call(sh.getElementsByTagName("row"),function(row){
      var ri=parseInt(row.getAttribute("r"),10)-1;if(isNaN(ri))ri=rows.length;
      var out=[];
      Array.prototype.forEach.call(row.getElementsByTagName("c"),function(c){
        var t=c.getAttribute("t"),v=c.getElementsByTagName("v")[0],val="";
        if(t==="s")val=v?ss[parseInt(v.textContent,10)]||"":"";
        else if(t==="inlineStr"){var is=c.getElementsByTagName("t");val=Array.prototype.map.call(is,function(x){return x.textContent;}).join("");}
        else if(t==="b")val=v&&v.textContent==="1"?"ДА":"";
        else val=v?v.textContent:"";
        out[colIndex(c.getAttribute("r"))]=val;
      });
      for(var i=0;i<out.length;i++)if(out[i]===undefined)out[i]="";
      rows[ri]=out;
    });
    for(var i=0;i<rows.length;i++)if(!rows[i])rows[i]=[];
    return rows;
  }
  /* ── CSV (Excel: «;», UTF-8 или Windows-1251) ── */
  function parseCsv(text){
    text=text.replace(/^\uFEFF/,"");
    var first=text.split(/\r?\n/)[0]||"",delim=(first.split(";").length>=first.split(",").length)?";":",";
    var rows=[],row=[],cell="",q=false;
    for(var i=0;i<text.length;i++){
      var ch=text[i];
      if(q){if(ch==='"'){if(text[i+1]==='"'){cell+='"';i++;}else q=false;}else cell+=ch;continue;}
      if(ch==='"')q=true;else if(ch===delim){row.push(cell);cell="";}
      else if(ch==="\n"||ch==="\r"){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(cell);rows.push(row);row=[];cell="";}
      else cell+=ch;
    }
    if(cell!==""||row.length){row.push(cell);rows.push(row);}
    return rows;
  }
  async function read(file){
    var buf=await file.arrayBuffer();
    var u8=new Uint8Array(buf);
    var rows;
    if(u8[0]===0x50&&u8[1]===0x4B)rows=await readXlsx(buf);
    else if(/\.xls$/i.test(file.name))throw new Error("Старый формат .xls не поддерживается — сохраните как .xlsx");
    else{
      var t=new TextDecoder("utf-8").decode(u8);
      if(t.indexOf("\uFFFD")>=0)try{t=new TextDecoder("windows-1251").decode(u8);}catch(e){}
      rows=parseCsv(t);
    }
    return rows.map(function(r){return (r||[]).map(function(x){return String(x==null?"":x).replace(/\s+/g," ").trim();});})
      .filter(function(r){return r.some(function(x){return x!=="";});});
  }

  /* ── запись .xlsx (zip без сжатия) ── */
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"");}
  function colName(i){var s="";i++;while(i){var m=(i-1)%26;s=String.fromCharCode(65+m)+s;i=Math.floor((i-1)/26);}return s;}
  function sheetXml(rows,widths){
    var cols=widths&&widths.length?"<cols>"+widths.map(function(w,i){return '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>';}).join("")+"</cols>":"";
    var data=rows.map(function(r,ri){return '<row r="'+(ri+1)+'">'+r.map(function(v,ci){
      var ref=colName(ci)+(ri+1),st=ri===0?' s="1"':"";
      if(v===null||v===undefined||v==="")return '<c r="'+ref+'"'+st+'/>';
      if(typeof v==="number"&&isFinite(v))return '<c r="'+ref+'"'+st+'><v>'+v+'</v></c>';
      return '<c r="'+ref+'" t="inlineStr"'+st+'><is><t xml:space="preserve">'+esc(v)+'</t></is></c>';}).join("")+"</row>";}).join("");
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+cols+"<sheetData>"+data+"</sheetData></worksheet>";
  }
  function zip(files){
    var parts=[],central=[],off=0;
    files.forEach(function(f){
      var name=enc.encode(f.name),data=enc.encode(f.data),crc=crc32(data);
      var lh=new DataView(new ArrayBuffer(30));
      lh.setUint32(0,0x04034b50,true);lh.setUint16(4,20,true);lh.setUint16(6,0x0800,true);lh.setUint16(8,0,true);
      lh.setUint32(14,crc,true);lh.setUint32(18,data.length,true);lh.setUint32(22,data.length,true);lh.setUint16(26,name.length,true);
      parts.push(new Uint8Array(lh.buffer),name,data);
      var ch=new DataView(new ArrayBuffer(46));
      ch.setUint32(0,0x02014b50,true);ch.setUint16(4,20,true);ch.setUint16(6,20,true);ch.setUint16(8,0x0800,true);
      ch.setUint32(16,crc,true);ch.setUint32(20,data.length,true);ch.setUint32(24,data.length,true);ch.setUint16(28,name.length,true);ch.setUint32(42,off,true);
      central.push(new Uint8Array(ch.buffer),name);
      off+=30+name.length+data.length;
    });
    var csize=central.reduce(function(a,x){return a+x.length;},0);
    var end=new DataView(new ArrayBuffer(22));
    end.setUint32(0,0x06054b50,true);end.setUint16(8,files.length,true);end.setUint16(10,files.length,true);end.setUint32(12,csize,true);end.setUint32(16,off,true);
    return new Blob(parts.concat(central,[new Uint8Array(end.buffer)]),{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
  }
  function write(sheets){
    var ct='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+
      sheets.map(function(_,i){return '<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';}).join("")+"</Types>";
    var files=[
      {name:"[Content_Types].xml",data:ct},
      {name:"_rels/.rels",data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
      {name:"xl/workbook.xml",data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+sheets.map(function(s,i){return '<sheet name="'+esc(s.name.slice(0,31))+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>';}).join("")+"</sheets></workbook>"},
      {name:"xl/_rels/workbook.xml.rels",data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map(function(_,i){return '<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>';}).join("")+'<Relationship Id="rId'+(sheets.length+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
      {name:"xl/styles.xml",data:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE4F1EE"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs></styleSheet>'}
    ];
    sheets.forEach(function(s,i){files.push({name:"xl/worksheets/sheet"+(i+1)+".xml",data:sheetXml(s.rows,s.widths)});});
    return zip(files);
  }
  function download(blob,name){var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href);},3000);}
  function pickFile(cb){var i=document.createElement("input");i.type="file";i.accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv";i.onchange=function(){if(i.files[0])cb(i.files[0]);};i.click();}
  window.XLite={read:read,write:write,download:download,pickFile:pickFile};
})();

;

/* ───── js/admin.js ───── */

(function(){
  "use strict";

  
  /* Общая работа с данными — в js/content.js (нужна и приложению жителей, и панели). */
  const G=window.GContent;
  const CITY_NAMES=G.CITY_NAMES, CONTACT_FIELDS=G.CONTACT_FIELDS, TIME_FIELDS=G.TIME_FIELDS;
  const applyOv=G.applyOv, applyOverrides=G.applyLocal, snapshot=G.snapshot, hashStr=G.hashStr, refreshActive=G.refreshActive;
  const published=G.published;
  let API=G.api();          /* "" — без сервера (данные в браузере); "/api" — серверный режим */
  const SERVER_BUILD=window.SOCUSLUGI_BUILD==="server";

  let editCity="gubkin", editTab="overview";
  let svcFilter="", staffFilter="";
  let openCats={}, openDepts={};

  function saveOverrides(){
    if(API)return true;       /* в серверном режиме сохраняет apiSaveDraft() */
    try{
      localStorage.setItem("adminOverrides",JSON.stringify(snapshot()));
      return true;
    }catch(e){
      showToast("Не удалось сохранить — слишком много данных (например, тяжёлые фото). Уменьшите количество или размер фото и попробуйте снова.");
      console.error("saveOverrides failed:",e);
      return false;
    }
  }

  function isAuthed(){return sessionStorage.getItem("adminAuthed")==="1";}

  function esc(s){return (s||"").toString().replace(/"/g,"&quot;").replace(/</g,"&lt;");}

  function pickAndResizeImage(cb,maxSize){
    maxSize=maxSize||640;
    const inp=document.createElement("input");
    inp.type="file";inp.accept="image/*";inp.style.display="none";
    document.body.appendChild(inp);
    inp.onchange=()=>{
      const file=inp.files&&inp.files[0];
      inp.remove();
      if(!file)return;
      if(!file.type.startsWith("image/")){showToast("Выберите файл изображения");return;}
      if(file.size>8*1024*1024){showToast("Файл слишком большой (макс. 8 МБ)");return;}
      const reader=new FileReader();
      reader.onload=ev=>{
        const img=new Image();
        img.onload=()=>{
          const scale=Math.min(1,maxSize/Math.max(img.width,img.height));
          const w=Math.round(img.width*scale),h=Math.round(img.height*scale);
          const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
          canvas.getContext("2d").drawImage(img,0,0,w,h);
          cb(canvas.toDataURL("image/jpeg",0.85));
        };
        img.src=ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  }

  window.openAdmin=function(){
    document.querySelectorAll(".admin-ovl,.admin-fs").forEach(e=>e.remove());
    if(API){serverStart();return;}
    if(isAuthed()&&testAccount()){startLocalTest();return;}
    if(!isAuthed()){
      const ovl=document.createElement("div");ovl.className="admin-ovl";ovl.setAttribute("role","dialog");ovl.setAttribute("aria-modal","true");
      ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
      document.body.appendChild(ovl);
      renderLogin(ovl);
    }else{
      openFullPanel();
    }
  };

  /* SHA-256: через WebCrypto, а если страница открыта не по HTTPS — запасная JS-реализация. */
  function sha256Fallback(str){
    const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const bytes=Array.from(new TextEncoder().encode(str));
    const bitLen=bytes.length*8;
    bytes.push(0x80);while(bytes.length%64!==56)bytes.push(0);
    for(let i=7;i>=0;i--)bytes.push(Math.floor(bitLen/Math.pow(2,i*8))&255);
    let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const r=(x,n)=>(x>>>n)|(x<<(32-n));
    for(let o=0;o<bytes.length;o+=64){
      const W=new Array(64);
      for(let i=0;i<16;i++)W[i]=(bytes[o+i*4]<<24)|(bytes[o+i*4+1]<<16)|(bytes[o+i*4+2]<<8)|bytes[o+i*4+3];
      for(let i=16;i<64;i++){const s0=r(W[i-15],7)^r(W[i-15],18)^(W[i-15]>>>3),s1=r(W[i-2],17)^r(W[i-2],19)^(W[i-2]>>>10);W[i]=(W[i-16]+s0+W[i-7]+s1)|0;}
      let [a,b,c,d,e,f,g,h]=H;
      for(let i=0;i<64;i++){
        const S1=r(e,6)^r(e,11)^r(e,25),ch=(e&f)^(~e&g),t1=(h+S1+ch+K[i]+W[i])|0;
        const S0=r(a,2)^r(a,13)^r(a,22),mj=(a&b)^(a&c)^(b&c),t2=(S0+mj)|0;
        h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
      }
      H=[H[0]+a,H[1]+b,H[2]+c,H[3]+d,H[4]+e,H[5]+f,H[6]+g,H[7]+h].map(x=>x|0);
    }
    return H.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("");
  }
  async function sha256Hex(str){
    try{
      if(window.crypto&&crypto.subtle){
        const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
      }
    }catch(e){}
    return sha256Fallback(str);
  }
  
  function renderLogin(){serverStart();}
  /* ── ДЕМО-СБОРКА: вход без сервера, данные только в этом браузере ── */
  function testAccount(){const t=(window.SOCUSLUGI_CONFIG||{}).demo;return t&&t.login&&t.sha256?t:null;}
  function demoDay(n){const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function seedDemo(){
    if(localStorage.getItem("demoSeeded"))return;
    const bc=branchContent.noyabrsk;
    if(bc&&!(bc.fleet||[]).length){
      bc.fleet=[{id:"car1",model:"ГАЗель Next",plate:"А245КМ89",color:"белая",wheelchair:true,driver:"Соколов А. В.",active:true},
        {id:"car2",model:"Лада Ларгус",plate:"В718ОР89",color:"серая",wheelchair:false,driver:"Морозов Д. С.",active:true},
        {id:"car3",model:"Лада Ларгус",plate:"Е503ТН89",color:"белая",wheelchair:false,driver:"Волков П. И.",active:true}];
      saveOverrides();
    }
    const t=demoDay(1),now=Date.now(),car=i=>{const f=bc.fleet[i];return {model:f.model,plate:f.plate,color:f.color,wheelchair:f.wheelchair,driver:f.driver};};
    const P=[["Иванова Галина Петровна","79220001101"],["Сидоров Николай Иванович","79220001102"],["Кравченко Валентина Михайловна","79220001103"],["Ахметов Рустам Ильдарович","79220001104"],
      ["Белова Нина Сергеевна","79220001105"],["Григорьев Виктор Андреевич","79220001106"],["Лаптева Анна Фёдоровна","79220001107"]];
    const R=[];let k=0;const add=(o)=>R.push(Object.assign({num:String(300000+(++k)*7919%600000),branch:"noyabrsk",createdAt:new Date(now-k*3600e3).toISOString()},o));
    [["08:30","ул. Ленина, 41, подъезд 2","Ноябрьская ЦГБ, ул. Магистральная, 5",{wheelchair:true,isFree:true},0,"assigned","Водитель позвонит за 15 минут до подачи"],
     ["09:15","мкр. Вынгапуровский, ул. Энтузиастов, 3","Поликлиника № 1, ул. Ленина, 22",{isFree:true},1,"assigned",""],
     ["10:00","пр. Мира, 72","МФЦ, ул. Советская, 11",{},2,"assigned",""],
     ["11:30","ул. Холмогорская, 9","Пенсионный фонд, ул. Космонавтов, 6",{pax:2,isFree:true},null,"confirmed",""],
     ["15:15","ул. Шмидта, 8","Поликлиника № 1, ул. Ленина, 22",{isFree:true,comment:"Нужна помощь при посадке"},null,"new",""],
     ["16:00","Ноябрьская ЦГБ, ул. Магистральная, 5","ул. Ленина, 41, подъезд 2",{wheelchair:true,isFree:true},0,"assigned",""]]
      .forEach((r,i)=>add({type:"taxi",name:P[i%P.length][0],phone:P[i%P.length][1],scheduledAt:t+" "+r[0],status:r[5],staffNote:r[6],
        assigned:r[4]===null?null:car(r[4]),payload:Object.assign({from:r[1],to:r[2],pax:1,tariff:"Социальное такси"},r[3])}));
    add({type:"order",name:P[2][0],phone:P[2][1],status:"new",payload:{items:[{name:"Занятие в зале ЛФК индивидуальное, до 40 мин. (без инструктора)",qty:1,price:400},{name:"Логопедический массаж, до 20 мин.",qty:1,price:500}],total:900}});
    add({type:"booking",name:P[4][0],phone:P[4][1],status:"confirmed",scheduledAt:demoDay(2)+" 10:00",payload:{dept:"Психологические услуги",spec:"Психолог",service:"Психологическое консультирование взрослого, до 60 мин."}});
    add({type:"callback",name:P[5][0],phone:P[5][1],status:"new",payload:{time:"Утром",topic:"Оформление социального такси"}});
    add({type:"feedback",name:"Не указано",phone:"",status:"new",payload:{rating:5,tags:["Оценка приложения"],comment:"Спасибо водителю, очень аккуратно помог"}});
    localStorage.setItem("staffRequests",JSON.stringify(R));
    localStorage.setItem("demoSeeded","1");
  }
  function startLocalTest(){
    API="";
    me={login:"admin",displayName:"Демо-администратор",roles:["admin"]};
    let ov=null;try{ov=JSON.parse(localStorage.getItem("adminOverrides")||"null");}catch(e){}
    if(ov)applyOv(ov);
    seedDemo();refreshActive();
    sessionStorage.setItem("adminAuthed","1");
    if(!document.querySelector(".adm2-test-banner")){
      const b=document.createElement("div");b.className="adm2-test-banner";
      b.textContent="Демо-версия без сервера — заявки и правки хранятся только в этом браузере";
      document.body.insertBefore(b,document.body.firstChild);
      document.body.classList.add("adm2-testing");
      const fit=()=>document.documentElement.style.setProperty("--adm-tb",b.offsetHeight+"px");fit();window.addEventListener("resize",fit);
    }
    document.querySelectorAll(".admin-ovl").forEach(e=>e.remove());
    editCity=cityData.noyabrsk?"noyabrsk":editCity;editTab="dispatch";if(!dispDay)dispDay=demoDay(1);openFullPanel();
  }
  
  /* ═══════════════════════════════════════════════════════════════
     ПАНЕЛЬ АДМИНИСТРАТОРА
     • Боковое меню (на телефоне — полоса вкладок сверху).
     • Всё сохраняется само через полсекунды после ввода — кнопок «Сохранить» нет.
     • Удаление можно отменить в течение 6 секунд.
     • Поиск не сбрасывает курсор и не теряет введённое.
     • «Обзор» проверяет данные: услуги без цены, «Морошка» дороже цены,
       дубли, пустые контакты — с кнопкой «Исправить».
     • «Публикация» — как сделать, чтобы правки увидели все.
     ═══════════════════════════════════════════════════════════════ */
  const TABS=[
    ["overview","home","Обзор"],
    ["dispatch","taxi","Диспетчерская",true],
    ["requests","inbox","Заявки"],
    ["residents","users","Получатели"],
    ["visits","route","Выезды",true],
    ["myvisits","route","Мои выезды"],
    ["contacts","pin","Контакты",true],
    ["services","list","Услуги",true],
    ["staff","users","Сотрудники",true],
    ["booking","calendar","Запись",true],
    ["fleet","taxi","Соц. такси",true],
    ["news","news","Новости"],
    ["events","ticket","Мероприятия"],
    ["gallery","image","Галерея"],
    ["stats","chart","Статистика"],
    ["centers","grid","Центры"],
    ["branches","building","Филиалы"],
    ["brand","palette","Оформление"],
    ["settings","gear","Настройки"],
    ["publish","send","Публикация"],
    ["audit","history","Журнал"]
  ];
  /* Серверный режим: какие разделы видит роль */
  let me=null,draftVersion=null,pubSourceVersion=null,pubInfo=null;
  const ROLE_TABS={
    admin:["overview","dispatch","requests","residents","visits","stats","contacts","services","staff","booking","fleet","news","events","gallery","centers","branches","brand","settings","publish","audit"],
    dispatcher:["dispatch","requests","residents","stats","fleet","publish"],
    operator:["requests","residents","stats"],
    manager:["visits","stats"],
    worker:["myvisits"]
  };
  function visibleTabs(){
    /* Без сервера (файл с диска) — только редактирование данных, без серверных разделов */
    if(SERVER_BUILD&&!API)return TABS.filter(t=>!["audit","templates","visits","myvisits"].includes(t[0]));
    if(!API)return TABS.filter(t=>!["audit","visits","myvisits","templates"].includes(t[0]));
    const allow=new Set();baseRoles().forEach(r=>(ROLE_TABS[r]||[]).forEach(t=>allow.add(t)));
    /* администратор одного филиала не меняет оформление и список филиалов */
    if(myBranches()){allow.delete("brand");allow.delete("branches");allow.delete("settings");}
    if(myCenters()||!window.GCenters)allow.delete("centers");   /* «Центры» — только администратор всей платформы */
    return TABS.filter(t=>allow.has(t[0]));
  }
  /* Роль в сессии: "dispatcher" или "dispatcher@noyabrsk" (только этот филиал) */
  function baseRoles(){return [...new Set((me&&me.roles||[]).map(r=>String(r).split("@")[0]))];}
  function hasRole(...rs){return baseRoles().some(r=>rs.includes(r));}
  /* Платформа: ключ филиала для сервера («центр:филиал», у «Гармонии» — без префикса) и подпись */
  function brKey(id){return window.GCenters?GCenters.branchKey(id):id;}
  /* Фильтр запроса к серверу: один филиал или все филиалы ТЕКУЩЕГО центра (у каждого центра свои заявки) */
  function scopeQ(p,oneBranch){
    if(oneBranch)p.set("branch",brKey(editCity));
    else if(window.GCenters&&GCenters.current())p.set("center",GCenters.current());
    return p;
  }
  function brLabel(key){return window.GCenters?GCenters.branchLabel(key):(CITY_NAMES[key]||key);}
  function roleScopes(){return (me&&me.roles||[]).map(r=>String(r).split("@")[1]||null);}
  function isCenterId(x){return !!(window.GCenters&&GCenters.get(x));}
  /* Центры, доступные сотруднику: null — все */
  function myCenters(){
    if(!API||!me||!window.GCenters)return null;
    const sc=roleScopes();if(sc.some(x=>!x))return null;
    const H=GCenters.HOME;
    return [...new Set(sc.map(x=>x.includes(":")?x.split(":")[0]:(isCenterId(x)?x:H)))];
  }
  /* Филиалы текущего центра, доступные сотруднику: null — все */
  function myBranches(){
    if(!API||!me)return null;
    const sc=roleScopes();
    if(sc.some(x=>!x))return null;
    const cur=window.GCenters?GCenters.current():null,H=window.GCenters?GCenters.HOME:null;
    if(cur&&sc.includes(cur))return null;
    const out=sc.map(x=>x.includes(":")?(x.split(":")[0]===cur?x.split(":")[1]:null):(!window.GCenters||cur===H)&&!isCenterId(x)?x:null).filter(Boolean);
    return [...new Set(out)];
  }
  /* Полное название текущего центра для документов (путевой лист и т. п.) */
  function orgName(){
    const c=window.GCenters?GCenters.get():null;
    if(c&&c.brand&&c.brand.org)return c.brand.org;
    return "ГБУ ЯНАО «ЦСОН «"+(c?GCenters.centerName(c):"Гармония")+"»";
  }
  function apiCall(method,path,body){
    /* без сервера — заявки этого браузера (тестовый режим и демо) */
    if(!API)return new Promise((ok,fail)=>{try{ok(localApi(method,path,body));}catch(e){fail(e);}});
    return fetch(API+path,{method,credentials:"same-origin",
      headers:Object.assign({"X-Socuslugi":"1"},body!==undefined?{"Content-Type":"application/json"}:{}),
      body:body!==undefined?JSON.stringify(body):undefined})
      .then(async r=>{
        /* отвечать должен API «Социальных услуг» (JSON); иначе — сервера нет (например, обычный веб-сервер отдал страницу) */
        const ct=r.headers.get("content-type")||"";
        if(!/application\/json/i.test(ct)&&r.status!==204){const e=new Error("Сервер панели недоступен");e.status=0;e.noApi=true;throw e;}
        const d=await r.json().catch(()=>({}));
        if(r.status===401&&path!=="/auth/login"&&path!=="/auth/me"){me=null;showServerLogin("Сессия закончилась — войдите снова");}
        if(!r.ok){const e=new Error(d.error||("Ошибка "+r.status));e.status=r.status;throw e;}
        return d;
      });
  }
  function serverStart(){
    if(!API||location.protocol==="file:"){showServerLogin("Демо-версия без сервера. Вход: admin, пароль 12345",true);return;}
    apiCall("GET","/auth/me").then(d=>{if(!d||!d.user||!Array.isArray(d.user.roles)){const e=new Error("no user");e.status=401;throw e;}me=d.user;return loadServerContent();}).then(()=>openFullPanel())
      .catch(e=>{if(e.status===401&&!e.noApi)showServerLogin();else showServerLogin("Сервер панели не отвечает. Проверьте подключение к сети учреждения и обновите страницу.",true);});
  }
  function loadServerContent(){
    if(!me||!hasRole("admin","dispatcher"))return Promise.resolve();
    return apiCall("GET","/admin/content").then(d=>{
      if(d.draft&&d.draft.data)applyOv(d.draft.data);
      draftVersion=d.draft?d.draft.version:null;
      pubSourceVersion=d.published?d.published.sourceVersion:null;
      pubInfo=d.published;
      refreshActive();
    });
  }
  function showServerLogin(msg,offline){
    document.querySelectorAll(".admin-ovl,.admin-fs").forEach(e=>e.remove());
    const ovl=document.createElement("div");ovl.className="admin-ovl adm2-login-ovl";ovl.setAttribute("role","dialog");ovl.setAttribute("aria-modal","true");
    ovl.innerHTML=`<form class="admin-card adm2-login" autocomplete="on">
      <img src="${esc(window.GCenters?GCenters.platform().logo:"img/logo-icon.png")}" alt="" class="adm2-login-logo" data-brand-raw data-hide-broken>
      <h3>${window.GCenters?esc(GCenters.platform().name):"Вход для сотрудников"}</h3><p class="adm2-login-k">Панель сотрудника</p>
      <p class="adm2-login-sub">Войдите учётной записью домена в виде <b>фамилия@yg.loc</b>, например <b>user@yg.loc</b>, — с тем же паролем, что для входа в компьютер.</p>
      <label class="adm2-fld"><span>Учётная запись домена</span><input class="adm2-inp" name="username" id="ldapLogin" autocomplete="username" placeholder="user@yg.loc" required autocapitalize="off" spellcheck="false"></label>
      <label class="adm2-fld"><span>Пароль</span><input class="adm2-inp" name="password" id="ldapPass" type="password" autocomplete="current-password" required></label>
      <div class="adm2-err" id="ldapErr" role="alert">${msg?esc(msg):offline?"Сервер панели недоступен.":""}</div>
      <button type="submit" class="adm2-btn wide" id="ldapBtn">Войти</button>
      <p class="adm2-note">Доступ выдаёт администратор: учётная запись должна быть в группе доступа к панели.</p>
    </form>`;
    document.body.appendChild(ovl);
    const f=ovl.querySelector("form"),btn=ovl.querySelector("#ldapBtn"),err=ovl.querySelector("#ldapErr");
    setTimeout(()=>ovl.querySelector("#ldapLogin").focus(),50);
    f.onsubmit=e=>{
      e.preventDefault();
      const login=ovl.querySelector("#ldapLogin").value.trim(),password=ovl.querySelector("#ldapPass").value;
      if(!login||!password){err.textContent="Введите логин и пароль";return;}
      btn.disabled=true;btn.textContent="Проверяем…";err.textContent="";
      const ta=testAccount();
      if(ta&&!API){
        sha256Hex("socuslugi-test:"+password).then(h=>{
          if(login.toLowerCase()!==String(ta.login).toLowerCase()||h!==ta.sha256){err.textContent="Неверный логин или пароль";btn.disabled=false;btn.textContent="Войти";return;}
          ovl.querySelector("#ldapPass").value="";ovl.remove();startLocalTest();
        });
        return;
      }
      if(location.protocol==="file:"){err.textContent="Панель открыта файлом с диска — откройте её по адресу сайта панели.";btn.disabled=false;btn.textContent="Войти";return;}
      apiCall("POST","/auth/login",{login,password}).then(d=>{
        me=d.user;ovl.querySelector("#ldapPass").value="";
        return loadServerContent().then(()=>{ovl.remove();editTab=visibleTabs()[0]?visibleTabs()[0][0]:"requests";openFullPanel();});
      }).catch(e2=>{err.textContent=e2.message;btn.disabled=false;btn.textContent="Войти";ovl.querySelector("#ldapPass").select();});
    };
  }
  function serverSaveDraft(){
    return apiCall("PUT","/admin/content",{data:snapshot(),baseVersion:draftVersion})
      .then(d=>{draftVersion=d.version;saveState="saved";updateSaveState();})
      .catch(e=>{saveState="error";updateSaveState();showToast(e.status===409?"Данные изменил другой сотрудник — обновите страницу, чтобы не потерять его правки":"Не сохранилось: "+e.message);});
  }
  let saveTimer=null,saveState="saved",snackTimer=null;
  G.onLoaded(()=>{if(document.getElementById("adminFs"))updateSaveState();});

  function openFullPanel(){
    document.querySelectorAll(".admin-fs").forEach(e=>e.remove());
    const fs=document.createElement("div");fs.className="admin-fs adm2";fs.id="adminFs";
    fs.setAttribute("role","dialog");fs.setAttribute("aria-modal","true");fs.setAttribute("aria-label","Панель администратора");
    document.body.appendChild(fs);
    renderShell(fs);
  }
  function closeFullPanel(){
    flushSave();
    const fs=document.getElementById("adminFs");
    if(fs)fs.remove();
    refreshActive();
  }

  /* ─── Автосохранение ─── */
  function touch(){
    saveState="saving";updateSaveState();
    clearTimeout(saveTimer);
    saveTimer=setTimeout(flushSave,500);
  }
  function flushSave(){
    if(!saveTimer)return;
    clearTimeout(saveTimer);saveTimer=null;
    if(API){refreshActive();serverSaveDraft();return;}
    saveState=saveOverrides()?"saved":"error";
    refreshActive();updateSaveState();
  }
  function isUnpublished(){
    if(API)return draftVersion!=null&&draftVersion!==pubSourceVersion;
    if(!published.loaded)return !!localStorage.getItem("adminOverrides");
    return hashStr(JSON.stringify(snapshot()))!==published.hash;
  }
  function updateSaveState(){
    const el=document.getElementById("admSave");if(!el)return;
    const txt={saving:"Сохраняю…",saved:"Сохранено",error:"Ошибка сохранения"}[saveState];
    el.className="adm2-save "+saveState;
    el.innerHTML='<i></i>'+txt+(saveState==="saved"&&isUnpublished()?' <span class="adm2-unpub">· не опубликовано</span>':'');
    const pb=document.querySelector('.adm2-tab[data-tab="publish"] .adm2-dot');
    if(pb)pb.hidden=!isUnpublished();
  }

  /* ─── Отмена удаления ─── */
  function undoable(msg,restore){
    const sn=document.getElementById("admSnack");if(!sn)return;
    clearTimeout(snackTimer);
    sn.innerHTML='<span>'+esc(msg)+'</span><button type="button" id="admUndo">Отменить</button>';
    sn.hidden=false;
    sn.querySelector("#admUndo").onclick=()=>{restore();touch();sn.hidden=true;renderBody();};
    snackTimer=setTimeout(()=>{sn.hidden=true;},6000);
  }

  /* Цена по «Морошке»: −5%, округление «к чётному» — так посчитан действующий прейскурант. */
  function moroshkaOf(p){
    const k=window.GSettings?(100-GSettings.get().moroshkaPercent)/100:0.95;
    const x=p*k,f=Math.floor(x),d=x-f;
    if(Math.abs(d-0.5)<1e-9)return f%2===0?f:f+1;
    return Math.round(x);
  }
  function num(v){const n=parseInt(String(v).replace(/\s/g,""),10);return isNaN(n)?null:n;}
  function autoGrow(t){t.style.height="auto";t.style.height=(t.scrollHeight+2)+"px";}

  function renderShell(fs){
    ensureAllowedCenter();
    if(!cityData[editCity])editCity=firstBranch();
    fs.innerHTML=`
      <header class="adm2-hdr">
        <img src="${window.GCenters?esc(GCenters.platform().logo):"img/logo-icon.png"}" class="adm2-logo" alt="" data-brand-raw data-hide-broken>
        <div class="adm2-ttl" data-brand-raw><b>${window.GCenters?esc(GCenters.platform().name):"Админпанель"}</b><span>${window.GCenters?"Панель сотрудника · "+esc(GCenters.centerName(GCenters.get())):"ГБУ ЯНАО «ЦСОН «Гармония»"}</span></div>
        <span class="adm2-save saved" id="admSave" role="status" aria-live="polite"></span>
        ${window.SOCUSLUGI_ADMIN_APP?"":'<button class="adm2-x" id="admFsClose" aria-label="Закрыть панель" title="Закрыть">✕</button>'}
      </header>
      <div class="adm2-wrap">
        <nav class="adm2-nav" aria-label="Разделы панели">
          ${centerSelectHtml()}
          <label class="adm2-city"><span>Филиал</span>
            <select id="admCity">${Object.keys(CITY_NAMES).filter(c=>!myBranches()||myBranches().includes(c)).map(c=>`<option value="${c}" ${c===editCity?"selected":""}>${CITY_NAMES[c]}</option>`).join("")}</select>
          </label>
          <button type="button" class="adm2-mnav" id="admMnav" aria-expanded="false" aria-controls="admTabs">
            <span class="adm2-mnav-cur">${(()=>{const t=visibleTabs().find(x=>x[0]===editTab)||visibleTabs()[0]||["","list",""];return window.ico(t[1])+"<b>"+esc(t[2])+"</b>";})()}</span>
            <span class="adm2-mnav-all">Разделы ${window.ico("grid")}</span></button>
          <div class="adm2-tabs" role="tablist" id="admTabs">
            ${visibleTabs().map(([k,ico,l,br])=>`<button type="button" class="adm2-tab${k===editTab?" active":""}" data-tab="${k}" role="tab" aria-selected="${k===editTab}"><span class="adm2-tab-ico" aria-hidden="true">${window.ico(ico)}</span><span class="adm2-tab-l">${l}</span>${br?'<span class="adm2-tab-br">филиал</span>':''}${k==="publish"?'<span class="adm2-dot" hidden></span>':''}</button>`).join("")}
          </div>
          ${API&&me?`<div class="adm2-me"><b>${esc(me.displayName||me.login)}</b><span>${esc(me.roles.map(r=>{const[x,b]=String(r).split("@");return (({admin:"администратор",dispatcher:"диспетчер такси",operator:"оператор заявок",manager:"заведующий",worker:"сотрудник"})[x]||x)+(b?" ("+(CITY_NAMES[b]||b)+")":"");}).join(", "))}</span>
            ${hasRole("admin","dispatcher","operator")?`<button type="button" class="adm2-sound" id="admSound" aria-pressed="${soundOn()}" title="Звук о новых заявках">${window.ico(soundOn()?"bell":"bellOff")} Звук: ${soundOn()?"вкл":"выкл"}</button>`:""}</div>`:""}
          <button type="button" class="adm2-logout" id="admLogout">Выйти из панели</button>
        </nav>
        <main class="adm2-main" id="admBody" tabindex="-1"></main>
      </div>
      <div class="adm2-snack" id="admSnack" role="status" aria-live="polite" hidden></div>
      <input type="file" id="admFile" accept="application/json,.json" style="display:none">
    `;
    const xb=fs.querySelector("#admFsClose");if(xb)xb.onclick=closeFullPanel;
    fs.querySelector("#admCity").onchange=e=>{flushSave();editCity=e.target.value;svcFilter="";staffFilter="";openCats={};openDepts={};renderBody();};
    const csel=fs.querySelector("#admCenter");if(csel)csel.onchange=e=>switchCenter(e.target.value);
    const mnav=fs.querySelector("#admMnav");
    if(mnav)mnav.onclick=()=>{const nav=fs.querySelector(".adm2-nav");const open=!nav.classList.contains("menu-open");nav.classList.toggle("menu-open",open);mnav.setAttribute("aria-expanded",String(open));};
    fs.querySelectorAll(".adm2-tab").forEach(t=>t.onclick=()=>switchTab(t.dataset.tab));
    fs.querySelector("#admFile").onchange=e=>{importJSON(e.target.files[0]);e.target.value="";};
    fs.querySelector("#admLogout").onclick=()=>{
      flushSave();
      if(API){if(es){es.close();es=null;}clearInterval(watchTimer);watchTimer=null;apiCall("POST","/auth/logout",{}).catch(()=>{}).then(()=>{me=null;showServerLogin("Вы вышли из панели");});return;}
      sessionStorage.removeItem("adminAuthed");
      if(window.SOCUSLUGI_ADMIN_APP){location.reload();return;}
      closeFullPanel();showToast("Вы вышли из панели");
    };
    if(!window.SOCUSLUGI_ADMIN_APP)fs.addEventListener("keydown",e=>{if(e.key==="Escape"&&!e.target.closest("input,textarea,select"))closeFullPanel();});
    if(!visibleTabs().some(t=>t[0]===editTab))editTab=visibleTabs()[0]?visibleTabs()[0][0]:"overview";
    ensureAllowedCenter();
    if(!cityData[editCity])editCity=firstBranch();
    if(myBranches()&&!myBranches().includes(editCity)){editCity=myBranches()[0];const cs=fs.querySelector("#admCity");if(cs)cs.value=editCity;}
    startRequestWatcher();
    renderBody();
    updateSaveState();
  }
  function switchTab(tab){
    flushSave();
    editTab=tab;
    /* телефон: закрыть меню разделов и показать текущий раздел на кнопке */
    const nav=document.querySelector(".adm2-nav");if(nav)nav.classList.remove("menu-open");
    const mb=document.getElementById("admMnav");
    if(mb){const t=visibleTabs().find(x=>x[0]===tab);if(t)mb.querySelector(".adm2-mnav-cur").innerHTML=window.ico(t[1])+"<b>"+esc(t[2])+"</b>";mb.setAttribute("aria-expanded","false");}
    const mainEl=document.querySelector(".adm2-main");if(mainEl&&window.innerWidth<900)mainEl.scrollTop=0;
    document.querySelectorAll(".adm2-tab").forEach(x=>{const on=x.dataset.tab===tab;x.classList.toggle("active",on);x.setAttribute("aria-selected",String(on));});
    renderBody();
    const a=document.querySelector(".adm2-tab.active");if(a&&a.scrollIntoView)a.scrollIntoView({block:"nearest",inline:"center"});
  }
  function jumpTo(city,tab,filter){
    flushSave();
    editCity=city;
    const sel=document.getElementById("admCity");if(sel)sel.value=city;
    if(tab==="services"){svcFilter=filter||"";openCats={};}
    if(tab==="staff"){staffFilter=filter||"";openDepts={};}
    switchTab(tab);
  }
  function renderBody(){
    const body=document.getElementById("admBody");
    if(!body)return;
    liveHook=null;            /* открытый раздел сам зарегистрирует живое обновление */
    body.scrollTop=0;
    ({overview:renderOverview,contacts:renderContacts,services:renderServices,staff:renderStaff,fleet:renderFleet,news:renderNews,
      events:renderEvents,gallery:renderGallery,publish:API?renderPublishServer:renderPublish,
      requests:renderRequests,audit:renderAudit,stats:renderStatsServer,visits:renderVisits,myvisits:renderMyVisits,
      brand:renderBrand,branches:renderBranches,centers:renderCenters,booking:renderBooking,dispatch:renderDispatch,settings:renderSettings,residents:renderResidents}[editTab]||renderOverview)(body);
  }
  function head(title,sub){
    return `<div class="adm2-head"><h2>${title}</h2>${sub?`<p>${sub}</p>`:""}</div>`;
  }

  /* ═══ Обзор и проверка данных ═══ */
  function issuesFor(c){
    const out=[],b=branchContent[c],cd=cityData[c]||{};
    /* Филиал без данных */
    if(!b.services.length&&!b.staff.length)out.push(["services","Филиал не заполнен: нет ни услуг, ни сотрудников",""]);
    /* Копия другого филиала и общие контакты */
    const sig=x=>JSON.stringify([x.services.map(k=>[k.name,k.items.map(i=>[i.n,i.p])]),x.staff.map(p=>p.name)]);
    const mine=b.services.length||b.staff.length?sig(b):null;
    Object.keys(CITY_NAMES).forEach(o=>{
      if(o===c)return;
      const ob=branchContent[o],od=cityData[o]||{};
      if(mine&&(ob.services.length||ob.staff.length)&&sig(ob)===mine&&Object.keys(CITY_NAMES).indexOf(o)<Object.keys(CITY_NAMES).indexOf(c))
        out.push(["services","Услуги и сотрудники полностью совпадают с филиалом «"+CITY_NAMES[o]+"» — похоже на копию",""]);
      if(cd.phone&&od.phone&&cd.phone.replace(/\D/g,"")===od.phone.replace(/\D/g,""))out.push(["contacts","Тот же телефон, что у филиала «"+CITY_NAMES[o]+"»: "+cd.phone,""]);
    });
    /* Цена по «Морошке» не равна −5% и услуги без длительности (там, где она важна) */
    const noDur=[];
    b.services.forEach(cat=>{
      const needDur=/медицин|психолог|педагог|лфк|зал|массаж/i.test(cat.name);
      cat.items.forEach(it=>{
        const n=String(it.n||"").trim();
        if(it.m!=null&&it.p&&it.m<=it.p&&it.m!==moroshkaOf(it.p)&&Math.abs(it.m-moroshkaOf(it.p))>1)
          out.push(["services","«Морошка» не равна −5% ("+it.p+" → "+it.m+" ₽, ожидалось "+moroshkaOf(it.p)+"): «"+n.slice(0,50)+"»",n.slice(0,30)]);
        if(needDur&&n&&!/\d+\s*(мин|час|ч\.)|сеанс|месяц|занят/i.test(n))noDur.push(n);
      });
    });
    /* длительность — одной строкой на филиал, чтобы не заслонять важные замечания */
    if(noDur.length)out.push(["services","Не указана длительность у "+noDur.length+" "+plural(noDur.length,["услуги","услуг","услуг"])+" (например, «"+noDur[0].slice(0,50)+"»)",noDur[0].slice(0,30)]);
    if(!cd.phone)out.push(["contacts","Не указан телефон филиала",""]);
    else if(!/^7\d{10}$/.test(String(cd.phoneRaw||"")))out.push(["contacts","Телефон для звонка (цифры) записан с ошибкой — нужно 11 цифр с 7",""]);
    if(cd.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cd.email))out.push(["contacts","Email филиала записан с ошибкой: "+cd.email,""]);
    if(/уточните/i.test(cd.address||""))out.push(["contacts","Адрес не уточнён: «"+cd.address+"»",""]);
    b.services.forEach(cat=>{
      if(!String(cat.name||"").trim())out.push(["services","Категория без названия",""]);
      const seen={};
      cat.items.forEach(it=>{
        const n=String(it.n||"").trim();
        if(!n)out.push(["services","Услуга без названия в «"+cat.name+"»",""]);
        if(!it.p)out.push(["services","Нет цены: «"+n.slice(0,60)+"»",n.slice(0,30)]);
        if(it.m!=null&&it.p&&it.m>it.p)out.push(["services","Цена по «Морошке» выше обычной: «"+n.slice(0,60)+"»",n.slice(0,30)]);
        const k=n.toLowerCase().replace(/\s+/g," ");
        if(k&&seen[k]!=null&&seen[k]!==it.p)out.push(["services","Одна услуга с разными ценами ("+seen[k]+" и "+it.p+" ₽): «"+n.slice(0,60)+"»",n.slice(0,30)]);
        if(k)seen[k]=it.p;
      });
    });
    const hasTaxi=b.services.some(cat=>/перевозк/i.test(cat.name)&&cat.items.length);
    const fl=(b.fleet||[]).filter(x=>x.active!==false&&String(x.model||"").trim());
    if(hasTaxi&&!fl.length)out.push(["fleet","Не заполнен автопарк такси — клиенты не видят, какая машина приедет",""]);
    if(hasTaxi&&fl.length&&!(b.shifts||[]).length)out.push(["fleet","Смены такси не заданы — жители видят всё время 08:30–18:00",""]);
    (b.shifts||[]).forEach(sh=>{if(!(b.fleet||[]).some(c=>c.id===sh.car))out.push(["fleet","Смена без машины (машину удалили)",""]);});
    (b.fleet||[]).forEach(x=>{
      if(!String(x.model||"").trim())out.push(["fleet","Машина без модели",""]);
      else if(!x.plate)out.push(["fleet","Нет госномера: "+x.model,""]);
      else if(typeof plateValid==="function"&&!plateValid(x.plate))out.push(["fleet","Госномер записан с ошибкой: "+x.model+" "+x.plate,""]);
    });
    b.staff.forEach(p=>{
      if(!String(p.name||"").trim()||p.name==="Новый сотрудник")out.push(["staff","Сотрудник без ФИО",""]);
      else if(!String(p.pos||"").trim())out.push(["staff","Не указана должность: "+p.name,p.name]);
      if(p.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))out.push(["staff","Email с ошибкой: "+p.name,p.name]);
    });
    return out;
  }
  function renderOverview(body){
    let html=head("Обзор","Сводка по филиалам и проверка данных. Нажмите на филиал, чтобы перейти к его услугам.");
    const unpub=isUnpublished();
    html+=`<div class="adm2-banner ${unpub?"warn":"ok"}">
      <span class="adm2-banner-ico">${window.ico(unpub?"warn":"check")}</span>
      <div><b>${unpub?"Есть изменения, которые видны только на этом устройстве":(published.loaded?"Данные опубликованы":"Изменений нет")}</b>
      <span>${unpub?(API?"Жители увидят их после кнопки «Опубликовать».":SERVER_BUILD?"Тестовый режим: правки только в этом браузере.":"Чтобы их увидели все пользователи, опубликуйте файл с данными."):(published.at?"Версия от "+new Date(published.at).toLocaleString("ru-RU"):"Пользователи видят то же, что и вы.")}</span></div>
      ${unpub?'<button type="button" class="adm2-btn" data-go="publish">'+(API?"К публикации":"Как опубликовать")+'</button>':""}
    </div>`;
    html+='<div class="adm2-grid">';
    Object.keys(CITY_NAMES).forEach(c=>{
      const b=branchContent[c];
      const svcCount=b.services.reduce((s,cat)=>s+cat.items.length,0);
      const iss=issuesFor(c).length;
      const empty=!b.services.length&&!b.staff.length;
      html+=`<button type="button" class="adm2-card${c===editCity?" cur":""}" data-jump-city="${c}">
        <div class="adm2-card-top"><b>${CITY_NAMES[c]}</b>
          <span class="adm2-badge ${empty?"off":iss?"warn":"on"}">${empty?"Не заполнен":iss?iss+" "+plural(iss,["замечание","замечания","замечаний"]):"Всё в порядке"}</span></div>
        <div class="adm2-card-stats">
          <span><b>${b.services.length}</b>${plural(b.services.length,["раздел","раздела","разделов"])}</span>
          <span><b>${svcCount}</b>${plural(svcCount,["услуга","услуги","услуг"])}</span>
          <span><b>${b.staff.length}</b>${plural(b.staff.length,["сотрудник","сотрудника","сотрудников"])}</span>
        </div>
      </button>`;
    });
    html+='</div>';
    html+=`<div class="adm2-sub">Общее для всех филиалов</div><div class="adm2-mini">
      <button type="button" data-go="news"><b>${typeof newsData!=="undefined"?newsData.length:0}</b> новостей</button>
      <button type="button" data-go="events"><b>${typeof eventsData!=="undefined"?eventsData.length:0}</b> мероприятий</button>
      <button type="button" data-go="gallery"><b>${typeof galleryData!=="undefined"?galleryData.length:0}</b> фото</button></div>`;
    const all=[];Object.keys(CITY_NAMES).forEach(c=>issuesFor(c).forEach(i=>all.push([c].concat(i))));
    const RANK={contacts:0,fleet:2,staff:3,services:1};
    all.sort((a,b)=>(RANK[a[1]]??5)-(RANK[b[1]]??5));
    html+=`<div class="adm2-sub">Проверка данных ${all.length?`<span class="adm2-count warn">${all.length}</span>`:'<span class="adm2-count ok">✓</span>'}</div>`;
    if(!all.length)html+='<div class="adm2-empty">Ошибок не найдено.</div>';
    else{
      html+='<div class="adm2-issues">';
      all.slice(0,60).forEach(([c,tab,msg,flt])=>{
        html+=`<div class="adm2-issue"><span class="adm2-issue-city">${CITY_NAMES[c]}</span><span class="adm2-issue-msg">${esc(msg)}</span>
          <button type="button" class="adm2-btn ghost sm" data-fix="${c}|${tab}|${esc(flt)}">Исправить</button></div>`;
      });
      if(all.length>60)html+=`<div class="adm2-empty">…и ещё ${all.length-60}</div>`;
      html+='</div>';
    }
    body.innerHTML=html;
    body.querySelectorAll("[data-jump-city]").forEach(card=>card.onclick=()=>jumpTo(card.dataset.jumpCity,"services"));
    body.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>switchTab(b.dataset.go));
    body.querySelectorAll("[data-fix]").forEach(b=>b.onclick=()=>{const[c,tab,f]=b.dataset.fix.split("|");jumpTo(c,tab,f);});
  }
  function plural(n,f){const a=n%10,b=n%100;return (a===1&&b!==11)?f[0]:(a>=2&&a<=4&&(b<10||b>=20))?f[1]:f[2];}

  /* ═══ Контакты ═══ */
  function renderContacts(body){
    const cd=cityData[editCity];
    const pad=n=>String(n==null?"":n).padStart(2,"0");
    const hint={phone:"Как показывать в приложении, например 8(34936)2-70-77",phoneRaw:"Только цифры, с 7 в начале — для кнопки «Позвонить»",
      hours:"Текст для показа, например «Пн–Пт: 08:30–18:00, обед 12:30–14:00»"};
    let html=head("Контакты — "+CITY_NAMES[editCity],"Изменения сохраняются автоматически.");
    html+='<div class="adm2-form">';
    CONTACT_FIELDS.forEach(([f,l])=>{
      html+=`<label class="adm2-fld${f==="address"||f==="hours"?" wide":""}"><span>${l}</span>
        <input class="adm2-inp" data-cf="${f}" value="${esc(cd[f])}" ${f.toLowerCase().includes("email")?'type="email" inputmode="email"':f==="phoneRaw"?'inputmode="numeric"':''}>
        ${f==="phoneRaw"?'<button type="button" class="adm2-link" id="admPhoneRaw">Взять из телефона выше</button>':''}
        ${hint[f]?`<small>${hint[f]}</small>`:""}<em class="adm2-err" data-err="${f}"></em></label>`;
    });
    html+=`<div class="adm2-fld wide"><span>Время работы для статуса «Открыто / Закрыто» в шапке</span>
      <div class="adm2-row"><label class="adm2-inline">с <input class="adm2-inp time" type="time" id="admOpen" value="${pad(cd.openH)}:${pad(cd.openM)}"></label>
      <label class="adm2-inline">до <input class="adm2-inp time" type="time" id="admClose" value="${pad(cd.closeH)}:${pad(cd.closeM)}"></label></div>
      <small>Обеденный перерыв ${typeof WORK_BREAK!=="undefined"?WORK_BREAK.from+"–"+WORK_BREAK.to:""} учитывается автоматически. Сб и Вс — выходные.</small></div>`;
    html+='</div>';
    body.innerHTML=html;
    const check=(f,v)=>{
      const e=body.querySelector(`[data-err="${f}"]`);if(!e)return;
      let m="";
      if(/email/i.test(f)&&v&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))m="Похоже, адрес записан с ошибкой";
      if(f==="phoneRaw"&&v&&!/^7\d{10}$/.test(v))m="Нужно 11 цифр, начиная с 7";
      e.textContent=m;
    };
    body.querySelectorAll("[data-cf]").forEach(inp=>{
      check(inp.dataset.cf,inp.value);
      inp.oninput=()=>{cityData[editCity][inp.dataset.cf]=inp.value.trim();check(inp.dataset.cf,inp.value.trim());touch();};
    });
    body.querySelector("#admPhoneRaw").onclick=()=>{
      let d=String(cityData[editCity].phone||"").replace(/\D/g,"");if(d.length===11&&d[0]==="8")d="7"+d.slice(1);
      const i=body.querySelector('[data-cf="phoneRaw"]');i.value=d;i.oninput();
    };
    const setT=(id,hk,mk)=>{const el=body.querySelector(id);el.onchange=()=>{const[h,m]=el.value.split(":").map(Number);if(!isNaN(h)){cityData[editCity][hk]=h;cityData[editCity][mk]=m||0;touch();}};};
    setT("#admOpen","openH","openM");setT("#admClose","closeH","closeM");
  }

  /* ═══ Услуги ═══ */
  function renderServices(body){
    const svc=branchContent[editCity].services;
    const total=svc.reduce((s,c)=>s+c.items.length,0);
    let html=head("Услуги — "+CITY_NAMES[editCity],`${svc.length} ${plural(svc.length,["раздел","раздела","разделов"])}, ${total} ${plural(total,["услуга","услуги","услуг"])}. Цена «Морошка» пустая — значит без скидки.`);
    html+=`<div class="adm2-toolbar">
      <input class="adm2-inp adm2-search" id="svcSearch" type="search" placeholder="Найти услугу или раздел…" value="${esc(svcFilter)}" aria-label="Поиск услуги">
      <button type="button" class="adm2-btn ghost" id="svcToggleAll">Развернуть все</button>
      <button type="button" class="adm2-btn ghost" id="xlSvcIn">${window.ico("upload")} Из Excel</button><button type="button" class="adm2-btn ghost" id="xlSvcOut">${window.ico("download")} В Excel</button><button type="button" class="adm2-btn" id="addCat">+ Раздел</button>
    </div><div id="svcList"></div>`;
    body.innerHTML=html;
    const list=body.querySelector("#svcList");
    const draw=()=>{
      const f=svcFilter.trim().toLowerCase();
      if(!svc.length){list.innerHTML='<div class="adm2-empty">В этом филиале пока нет услуг. Нажмите «+ Раздел», чтобы начать.</div>';return;}
      let h="",shown=0;
      svc.forEach((cat,ci)=>{
        const items=cat.items.map((it,ii)=>({it,ii})).filter(({it})=>!f||String(it.n).toLowerCase().includes(f)||String(cat.name).toLowerCase().includes(f));
        if(f&&!items.length)return;
        shown++;
        const open=f?true:!!openCats[ci];
        h+=`<section class="adm2-sec${open?" open":""}">
          <div class="adm2-sec-head">
            <button type="button" class="adm2-chev" data-tcat="${ci}" aria-expanded="${open}" aria-label="${open?"Свернуть":"Развернуть"} раздел">▸</button>
            <span class="adm2-cat-ic" aria-hidden="true">${window.catIco(cat)}</span>
            <input class="adm2-inp grow strong" data-cat="${ci}" data-f="name" value="${esc(cat.name)}" placeholder="Название раздела" aria-label="Название раздела">
            <span class="adm2-count">${cat.items.length}</span>
            <button type="button" class="adm2-icon-btn danger" data-delcat="${ci}" aria-label="Удалить раздел" title="Удалить раздел">${window.ico("trash")}</button>
          </div>`;
        if(open){
          h+=`<div class="adm2-items"><div class="adm2-items-head"><span>Название услуги</span><span>Цена, ₽</span><span>«Морошка», ₽</span><span></span></div>`;
          items.forEach(({it,ii})=>{
            const bad=it.m!=null&&it.p&&it.m>it.p;
            h+=`<div class="adm2-item" data-row="${ci}_${ii}">
              <textarea class="adm2-inp grow" rows="1" data-cat="${ci}" data-item="${ii}" data-f="n" placeholder="Название услуги" aria-label="Название услуги">${esc(it.n)}</textarea>
              <label class="adm2-pw"><span class="adm2-m-lbl">Цена, ₽</span><input class="adm2-inp price${it.p?"":" bad"}" inputmode="numeric" data-cat="${ci}" data-item="${ii}" data-f="p" value="${it.p??""}" placeholder="0" aria-label="Цена"></label>
              <div class="adm2-mor"><span class="adm2-m-lbl">«Морошка», ₽</span><input class="adm2-inp price${bad?" bad":""}" inputmode="numeric" data-cat="${ci}" data-item="${ii}" data-f="m" value="${it.m??""}" placeholder="—" aria-label="Цена по карте Морошка">
                <button type="button" class="adm2-mini-btn" data-mor="${ci}_${ii}" title="Посчитать −5% от цены">−5%</button></div>
              <button type="button" class="adm2-icon-btn danger" data-delitem="${ci}_${ii}" aria-label="Удалить услугу" title="Удалить услугу">✕</button>
            </div>`;
          });
          h+=`<div class="adm2-sec-foot"><button type="button" class="adm2-btn ghost sm" data-additem="${ci}">+ Услуга</button>
            <button type="button" class="adm2-btn ghost sm" data-morall="${ci}">Посчитать «Морошку» для пустых</button></div></div>`;
        }
        h+=`</section>`;
      });
      if(!shown)h='<div class="adm2-empty">Ничего не найдено по запросу «'+esc(svcFilter)+'».</div>';
      list.innerHTML=h;
      list.querySelectorAll("textarea").forEach(autoGrow);
      bind();
    };
    const bind=()=>{
      list.querySelectorAll("[data-f]").forEach(inp=>{
        inp.oninput=()=>{
          const ci=+inp.dataset.cat,f=inp.dataset.f;
          if(inp.dataset.item!==undefined){
            const it=svc[ci].items[+inp.dataset.item];if(!it)return;
            if(f==="n"){it.n=inp.value;autoGrow(inp);}
            else{
              const clean=inp.value.replace(/[^\d]/g,"");if(clean!==inp.value)inp.value=clean;
              if(f==="p")it.p=num(clean)||0;else it.m=clean===""?null:num(clean);
              const row=inp.closest(".adm2-item");
              row.querySelector('[data-f="p"]').classList.toggle("bad",!it.p);
              row.querySelector('[data-f="m"]').classList.toggle("bad",it.m!=null&&it.p&&it.m>it.p);
            }
          }else svc[ci][f]=inp.value;
          touch();
        };
      });
      list.querySelectorAll("[data-tcat]").forEach(b=>b.onclick=()=>{const ci=b.dataset.tcat;openCats[ci]=!openCats[ci];draw();});
      list.querySelectorAll("[data-additem]").forEach(b=>b.onclick=()=>{
        const ci=+b.dataset.additem;svc[ci].items.push({n:"",p:0,m:null});touch();draw();
        const rows=list.querySelectorAll(`[data-cat="${ci}"][data-f="n"]`);const last=rows[rows.length-1];if(last)last.focus();
      });
      list.querySelectorAll("[data-mor]").forEach(b=>b.onclick=()=>{
        const[ci,ii]=b.dataset.mor.split("_").map(Number);const it=svc[ci].items[ii];
        if(!it.p){showToast("Сначала укажите цену");return;}
        it.m=moroshkaOf(it.p);b.previousElementSibling.value=it.m;b.previousElementSibling.classList.remove("bad");touch();
      });
      list.querySelectorAll("[data-morall]").forEach(b=>b.onclick=()=>{
        const ci=+b.dataset.morall;let n=0;
        svc[ci].items.forEach(it=>{if(it.m==null&&it.p){it.m=moroshkaOf(it.p);n++;}});
        touch();draw();showToast(n?"Заполнено: "+n:"Пустых цен по «Морошке» нет");
      });
      list.querySelectorAll("[data-delitem]").forEach(b=>b.onclick=()=>{
        const[ci,ii]=b.dataset.delitem.split("_").map(Number);const it=svc[ci].items[ii];
        svc[ci].items.splice(ii,1);touch();draw();
        undoable("Услуга удалена",()=>svc[ci].items.splice(ii,0,it));
      });
      list.querySelectorAll("[data-delcat]").forEach(b=>b.onclick=()=>{
        const ci=+b.dataset.delcat,cat=svc[ci];
        if(cat.items.length&&!confirm("Удалить раздел «"+cat.name+"» вместе с "+cat.items.length+" "+plural(cat.items.length,["услугой","услугами","услугами"])+"?"))return;
        svc.splice(ci,1);openCats={};touch();draw();
        undoable("Раздел удалён",()=>svc.splice(ci,0,cat));
      });
    };
    body.querySelector("#svcSearch").oninput=e=>{svcFilter=e.target.value;draw();};
    body.querySelector("#svcToggleAll").onclick=e=>{
      const anyClosed=svc.some((c,i)=>!openCats[i]);
      svc.forEach((c,i)=>openCats[i]=anyClosed);
      e.target.textContent=anyClosed?"Свернуть все":"Развернуть все";draw();
    };
    body.querySelector("#xlSvcIn").onclick=()=>xlImport("svc",body);
    body.querySelector("#xlSvcOut").onclick=()=>xlExport("svc");
    body.querySelector("#addCat").onclick=()=>{
      const id=Math.max(0,...svc.map(c=>c.id||0))+1;
      svc.push({id,name:"",icon:"",rating:4.8,items:[]});openCats[svc.length-1]=true;svcFilter="";
      body.querySelector("#svcSearch").value="";touch();draw();
      const inps=list.querySelectorAll('[data-f="name"]');const last=inps[inps.length-1];if(last){last.focus();last.scrollIntoView({block:"center"});}
    };
    draw();
  }

  /* ═══ Сотрудники ═══ */
  function renderStaff(body){
    const staff=branchContent[editCity].staff;
    const depts=[...new Set(staff.map(s=>s.dept).filter(Boolean))];
    let html=head("Сотрудники — "+CITY_NAMES[editCity],`${staff.length} ${plural(staff.length,["сотрудник","сотрудника","сотрудников"])}. Сгруппированы по отделениям.`);
    html+=`<div class="adm2-toolbar">
      <input class="adm2-inp adm2-search" id="staffSearch" type="search" placeholder="Найти по ФИО, должности, отделению…" value="${esc(staffFilter)}" aria-label="Поиск сотрудника">
      <button type="button" class="adm2-btn ghost" id="xlStIn">${window.ico("upload")} Из Excel</button><button type="button" class="adm2-btn ghost" id="xlStOut">${window.ico("download")} В Excel</button>
      <button type="button" class="adm2-btn" id="addSt">+ Сотрудник</button>
    </div><datalist id="admDepts">${depts.map(d=>`<option value="${esc(d)}">`).join("")}</datalist><div id="stList"></div>`;
    body.innerHTML=html;
    body.querySelector("#xlStIn").onclick=()=>xlImport("staff",body);
    body.querySelector("#xlStOut").onclick=()=>xlExport("staff");
    const list=body.querySelector("#stList");
    const draw=()=>{
      const f=staffFilter.trim().toLowerCase();
      const groups={};
      staff.forEach((s,i)=>{
        if(f&&![s.name,s.pos,s.dept,s.email].some(v=>String(v||"").toLowerCase().includes(f)))return;
        const d=s.dept||"Без отделения";(groups[d]=groups[d]||[]).push(i);
      });
      const keys=Object.keys(groups);
      if(!staff.length){list.innerHTML='<div class="adm2-empty">Сотрудников пока нет. Нажмите «+ Сотрудник».</div>';return;}
      if(!keys.length){list.innerHTML='<div class="adm2-empty">Никого не найдено по запросу «'+esc(staffFilter)+'».</div>';return;}
      let h="";
      keys.forEach(d=>{
        const open=f?true:!!openDepts[d];
        h+=`<section class="adm2-sec${open?" open":""}"><div class="adm2-sec-head">
          <button type="button" class="adm2-chev" data-tdept="${esc(d)}" aria-expanded="${open}">▸</button>
          <span class="adm2-sec-name" data-tdept="${esc(d)}">${esc(d)}</span><span class="adm2-count">${groups[d].length}</span></div>`;
        if(open){
          h+='<div class="adm2-people">';
          groups[d].forEach(i=>{
            const s=staff[i];
            h+=`<div class="adm2-person">
              <label class="adm2-fld"><span>ФИО</span><input class="adm2-inp" data-st="${i}" data-f="name" value="${esc(s.name==="Новый сотрудник"?"":s.name)}" placeholder="Фамилия Имя Отчество"></label>
              <label class="adm2-fld"><span>Должность</span><input class="adm2-inp" data-st="${i}" data-f="pos" value="${esc(s.pos)}" placeholder="Например, психолог"></label>
              <label class="adm2-fld"><span>Отделение</span><input class="adm2-inp" data-st="${i}" data-f="dept" value="${esc(s.dept)}" list="admDepts" placeholder="Выберите или введите"></label>
              <label class="adm2-fld sm"><span>Доб.</span><input class="adm2-inp" data-st="${i}" data-f="ext" value="${esc(s.ext)}" inputmode="numeric" placeholder="—"></label>
              <label class="adm2-fld"><span>Email</span><input class="adm2-inp" data-st="${i}" data-f="email" value="${esc(s.email)}" type="email" placeholder="name@yanao.ru"></label>
              <button type="button" class="adm2-icon-btn danger" data-delst="${i}" aria-label="Удалить сотрудника" title="Удалить">${window.ico("trash")}</button>
            </div>`;
          });
          h+=`<div class="adm2-sec-foot"><button type="button" class="adm2-btn ghost sm" data-adddept="${esc(d==="Без отделения"?"":d)}">+ Сотрудник в это отделение</button></div></div>`;
        }
        h+='</section>';
      });
      list.innerHTML=h;
      list.querySelectorAll("[data-st]").forEach(inp=>{
        inp.oninput=()=>{staff[+inp.dataset.st][inp.dataset.f]=inp.value;touch();};
        if(inp.dataset.f==="dept")inp.onchange=()=>draw();
      });
      list.querySelectorAll("[data-tdept]").forEach(b=>b.onclick=()=>{const d=b.dataset.tdept;openDepts[d]=!openDepts[d];draw();});
      list.querySelectorAll("[data-adddept]").forEach(b=>b.onclick=()=>add(b.dataset.adddept));
      list.querySelectorAll("[data-delst]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delst,s=staff[i];staff.splice(i,1);touch();draw();
        undoable("Сотрудник удалён",()=>staff.splice(i,0,s));
      });
    };
    const add=dept=>{
      staff.push({dept:dept||"",name:"",pos:"",ext:"",email:""});
      openDepts[dept||"Без отделения"]=true;staffFilter="";body.querySelector("#staffSearch").value="";touch();draw();
      const names=list.querySelectorAll(`[data-st="${staff.length-1}"][data-f="name"]`);if(names[0]){names[0].focus();names[0].scrollIntoView({block:"center"});}
    };
    body.querySelector("#staffSearch").oninput=e=>{staffFilter=e.target.value;draw();};
    body.querySelector("#addSt").onclick=()=>add("");
    draw();
  }

  /* ═══ Соц. такси: машины, смены, соцобъекты ═══ */
  let taxiSub="cars";
  function renderFleet(body){
    if(typeof fleetOf==="function")fleetOf(editCity); /* выдаём машинам id */
    const subs=[["cars","car","Машины",(branchContent[editCity].fleet||[]).length],["shifts","clock","Смены",(branchContent[editCity].shifts||[]).length],["places","pin","Соцобъекты",(branchContent[editCity].places||[]).length]];
    body.innerHTML=head("Соц. такси — "+CITY_NAMES[editCity],"Машины, смены и быстрые адреса. После изменений опубликуйте данные — жители увидят их в приложении.")+
      `<div><div class="adm2-seg" role="tablist">${subs.map(([k,i,l,n])=>`<button type="button" role="tab" class="adm2-seg-b${k===taxiSub?" on":""}" data-sub="${k}" aria-selected="${k===taxiSub}">${window.ico(i)} ${l}<span class="adm2-count">${n}</span></button>`).join("")}</div></div><div id="taxiSubBody"></div>`;
    body.querySelectorAll("[data-sub]").forEach(b=>b.onclick=()=>{flushSave();taxiSub=b.dataset.sub;renderFleet(body);});
    const sb=body.querySelector("#taxiSubBody");
    if(taxiSub==="shifts")return renderShifts(sb,body);
    if(taxiSub==="places")return renderPlaces(sb);
    renderCars(sb);
  }
  function renderCars(body){
    const b=branchContent[editCity];if(!Array.isArray(b.fleet))b.fleet=[];
    const fleet=b.fleet;
    let html=`<div class="adm2-banner ok" style="margin-bottom:14px"><span class="adm2-banner-ico">${window.ico("info")}</span><div><b>Как назначается машина</b>
      <span>Если клиенту нужна машина для коляски — назначается машина с отметкой «Для колясок». Иначе — первая обычная машина «на линии» (порядок — как в списке). Это предварительное назначение: диспетчер подтверждает его по телефону.</span></div></div>`;
    html+=`<div class="adm2-toolbar">${FLEET_PRESETS.map((p,i)=>`<button type="button" class="adm2-btn ghost" data-preset="${i}">+ ${p.model}</button>`).join("")}
      <button type="button" class="adm2-btn" id="addCar">+ Другая машина</button></div>
      <datalist id="admCarModels">${FLEET_PRESETS.map(p=>`<option value="${p.model}">`).join("")}<option value="Лада Гранта"><option value="Hyundai Solaris"><option value="Volkswagen Caddy"></datalist>
      <div id="flList"></div>`;
    body.innerHTML=html;
    const list=body.querySelector("#flList");
    const draw=()=>{
      if(!fleet.length){list.innerHTML='<div class="adm2-empty">Машин пока нет. Добавьте ГАЗель Next, Ладу Ларгус или другую машину кнопками выше.</div>';return;}
      list.innerHTML=fleet.map((c,i)=>`<article class="adm2-post adm2-car${c.active===false?" off":""}">
        <div class="adm2-car-head">
          <span class="adm2-car-ico">${window.ico(c.wheelchair?"van":"car")}</span>
          <div class="adm2-car-prev">${c.plate&&typeof plateHtml==="function"?plateHtml(c.plate):'<span class="adm2-note">госномер не указан</span>'}</div>
          <div class="adm2-car-moves">
            <button type="button" class="adm2-icon-btn" data-up="${i}" aria-label="Выше" title="Выше — назначается раньше" ${i===0?"disabled":""}>↑</button>
            <button type="button" class="adm2-icon-btn" data-down="${i}" aria-label="Ниже" title="Ниже" ${i===fleet.length-1?"disabled":""}>↓</button>
            <button type="button" class="adm2-icon-btn danger" data-delcar="${i}" aria-label="Удалить машину" title="Удалить">${window.ico("trash")}</button>
          </div>
        </div>
        <div class="adm2-form pad" style="padding:0">
          <label class="adm2-fld"><span>Модель</span><input class="adm2-inp" data-car="${i}" data-f="model" list="admCarModels" value="${esc(c.model)}" placeholder="Например, ГАЗель Next"></label>
          <label class="adm2-fld"><span>Госномер</span><input class="adm2-inp" data-car="${i}" data-f="plate" value="${esc(c.plate)}" placeholder="А123ВС89" autocapitalize="characters">
            <em class="adm2-err" data-err="plate${i}"></em></label>
          <label class="adm2-fld"><span>Цвет</span><input class="adm2-inp" data-car="${i}" data-f="color" value="${esc(c.color)}" placeholder="Например, белый"></label>
          <label class="adm2-fld"><span>Водитель (необязательно)</span><input class="adm2-inp" data-car="${i}" data-f="driver" value="${esc(c.driver)}" placeholder="Фамилия И. О."></label>
          <label class="adm2-check"><input type="checkbox" data-car="${i}" data-f="wheelchair" ${c.wheelchair?"checked":""}> Для инвалидных колясок</label>
          <label class="adm2-check"><input type="checkbox" data-car="${i}" data-f="active" ${c.active!==false?"checked":""}> На линии (можно назначать)</label>
        </div>
      </article>`).join("");
      list.querySelectorAll("[data-car]").forEach(inp=>{
        const i=+inp.dataset.car,f=inp.dataset.f;
        if(inp.type==="checkbox"){inp.onchange=()=>{fleet[i][f]=inp.checked;touch();draw();};return;}
        inp.oninput=()=>{fleet[i][f]=inp.value.trim();if(f==="plate")checkPlate(i,inp.value);touch();};
        if(f==="plate"){
          checkPlate(i,inp.value);
          inp.onblur=()=>{if(inp.value.trim()){const n=plateNormalize(inp.value);inp.value=n;fleet[i].plate=n;touch();draw();}};
        }
      });
      list.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{const i=+b.dataset.up;[fleet[i-1],fleet[i]]=[fleet[i],fleet[i-1]];touch();draw();});
      list.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>{const i=+b.dataset.down;[fleet[i+1],fleet[i]]=[fleet[i],fleet[i+1]];touch();draw();});
      list.querySelectorAll("[data-delcar]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delcar,c=fleet[i];
        const sh=shiftsOf(editCity),gone=sh.filter(x=>x.car===c.id);
        if(gone.length&&!confirm("У машины "+gone.length+" "+plural(gone.length,["смена","смены","смен"])+" — они тоже удалятся. Продолжить?"))return;
        fleet.splice(i,1);for(let k=sh.length-1;k>=0;k--)if(sh[k].car===c.id)sh.splice(k,1);
        touch();draw();
        undoable("Машина удалена",()=>{fleet.splice(i,0,c);gone.forEach(x=>sh.push(x));});
      });
    };
    const checkPlate=(i,v)=>{
      const e=list.querySelector(`[data-err="plate${i}"]`);if(!e)return;
      e.textContent=v.trim()&&!plateValid(v)?"Формат: буква, 3 цифры, 2 буквы, регион — например А123ВС89":"";
    };
    const add=(p)=>{
      fleet.push({model:p?p.model:"",plate:"",color:"",driver:"",wheelchair:p?!!p.wheelchair:false,active:true});touch();draw();
      const inps=list.querySelectorAll(p?'[data-f="plate"]':'[data-f="model"]');const last=inps[inps.length-1];if(last){last.focus();last.scrollIntoView({block:"center"});}
    };
    body.querySelectorAll("[data-preset]").forEach(b=>b.onclick=()=>add(FLEET_PRESETS[+b.dataset.preset]));
    body.querySelector("#addCar").onclick=()=>add(null);
    draw();
  }

  const DOW=["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  function renderShifts(sb,parentBody){
    const b=branchContent[editCity];
    const fleet=fleetOf(editCity),shifts=shiftsOf(editCity);
    if(!fleet.length){sb.innerHTML='<div class="adm2-empty">Сначала добавьте машины во вкладке «Машины».</div>';return;}
    let html=`<div class="adm2-banner ok" style="margin-bottom:14px"><span class="adm2-banner-ico">${window.ico("info")}</span><div><b>Как это работает</b>
      <span>Жителю доступны только дни и часы, когда хотя бы одна машина на линии (обед ${WORK_BREAK.from}–${WORK_BREAK.to} — всегда закрыт). Нужна коляска — только смены машин «для колясок». Смен нет — действует обычное расписание 08:30–18:00.</span></div></div>`;
    html+=`<div class="adm2-post"><b style="font-size:15px">Новая смена</b>
      <div class="adm2-form pad" style="padding:0">
        <label class="adm2-fld"><span>Машина</span><select class="adm2-inp" id="shCar">${fleet.map(c=>`<option value="${c.id}">${esc(c.model)}${c.plate?" · "+esc(c.plate):""}${c.wheelchair?"":""}</option>`).join("")}</select></label>
        <label class="adm2-fld"><span>Водитель (необязательно)</span><input class="adm2-inp" id="shDrv" placeholder="Фамилия И. О."></label>
        <div class="adm2-fld wide"><span>Когда</span>
          <div class="adm2-row"><label class="adm2-check"><input type="radio" name="shKind" value="week" checked> Каждую неделю</label><label class="adm2-check"><input type="radio" name="shKind" value="day"> Один день</label></div>
          <div class="adm2-days" id="shDays">${DOW.map((d,i)=>`<button type="button" class="adm2-day${i<5?" on":""}" data-d="${i+1}" aria-pressed="${i<5}">${d}</button>`).join("")}</div>
          <input type="date" class="adm2-inp date" id="shDate" style="display:none" value="${taxiIsoSafe()}"></div>
        <div class="adm2-fld wide"><span>Время на линии</span><div class="adm2-row">
          <label class="adm2-inline">с <input type="time" class="adm2-inp time" id="shFrom" value="08:30"></label>
          <label class="adm2-inline">до <input type="time" class="adm2-inp time" id="shTo" value="18:00"></label>
          <button type="button" class="adm2-btn" id="shAdd">+ Добавить смену</button></div></div>
      </div></div>`;
    /* Неделя: кто на линии */
    const weekStart=(()=>{const d=new Date();const w=d.getDay()||7;d.setDate(d.getDate()-w+1);return d;})();
    const days=[...Array(7)].map((_,i)=>{const d=new Date(weekStart);d.setDate(d.getDate()+i);return d;});
    const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    const pct=t=>Math.max(0,Math.min(100,(tMin(t)-tMin("08:00"))/(tMin("19:00")-tMin("08:00"))*100));
    html+=`<div class="adm2-sub">Эта неделя — кто на линии</div><div class="adm2-week">`;
    days.forEach(d=>{
      const on=shiftsOn(iso(d),{},editCity);
      html+=`<div class="adm2-wday${iso(d)===taxiIsoSafe()?" today":""}"><div class="adm2-wday-h">${DOW[(d.getDay()+6)%7]} <b>${d.getDate()}</b></div><div class="adm2-wday-bars">`+
        (on.length?on.map(sh=>{const c=fleetCarById(sh.car,editCity);return `<div class="adm2-bar-row" title="${esc(c.model)} ${sh.from}–${sh.to}"><span class="adm2-bar-lbl">${c.wheelchair?"":""}${esc(c.model)}</span><span class="adm2-bar-line"><i style="left:${pct(sh.from)}%;right:${100-pct(sh.to)}%"></i><em style="left:${pct(WORK_BREAK.from)}%;right:${100-pct(WORK_BREAK.to)}%"></em></span><span class="adm2-bar-t">${sh.from}–${sh.to}</span></div>`;}).join("")
          :'<div class="adm2-wday-empty">машин нет</div>')+`</div></div>`;
    });
    html+=`</div>`;
    html+=`<div class="adm2-sub">Все смены</div>`;
    if(!shifts.length)html+='<div class="adm2-empty">Смен пока нет — действует обычное расписание 08:30–18:00.</div>';
    else html+='<div class="adm2-table-wrap"><table class="adm2-table adm2-shifts"><thead><tr><th>Машина</th><th>Когда</th><th>Время</th><th>Водитель</th><th></th></tr></thead><tbody>'+
      shifts.map((sh,i)=>{const c=fleetCarById(sh.car,editCity);return `<tr${c?"":" class=\"bad\""}><td>${c?esc(c.model)+(c.plate?" <small>"+esc(c.plate)+"</small>":""):"<b>машина удалена</b>"}</td>
        <td>${sh.date?new Date(sh.date+"T00:00:00").toLocaleDateString("ru-RU",{day:"numeric",month:"long",weekday:"short"}):(sh.days||[]).map(d=>DOW[d-1]).join(", ")}</td>
        <td>${sh.from}–${sh.to}</td><td>${esc(sh.driver||"—")}</td>
        <td><button type="button" class="adm2-icon-btn danger" data-delsh="${i}" aria-label="Удалить смену">${window.ico("trash")}</button></td></tr>`;}).join("")+'</tbody></table></div>';
    sb.innerHTML=html;
    const kindR=()=>sb.querySelector('input[name="shKind"]:checked').value;
    sb.querySelectorAll('input[name="shKind"]').forEach(r=>r.onchange=()=>{const w=kindR()==="week";sb.querySelector("#shDays").style.display=w?"":"none";sb.querySelector("#shDate").style.display=w?"none":"";});
    sb.querySelectorAll(".adm2-day").forEach(b=>b.onclick=()=>{b.classList.toggle("on");b.setAttribute("aria-pressed",b.classList.contains("on"));});
    sb.querySelector("#shAdd").onclick=()=>{
      const from=sb.querySelector("#shFrom").value,to=sb.querySelector("#shTo").value;
      if(!from||!to||tMin(to)<=tMin(from)){showToast("Время окончания должно быть позже начала");return;}
      const sh={id:"sh_"+Date.now().toString(36),car:sb.querySelector("#shCar").value,driver:sb.querySelector("#shDrv").value.trim(),from,to};
      if(kindR()==="week"){sh.days=[...sb.querySelectorAll(".adm2-day.on")].map(b=>+b.dataset.d);if(!sh.days.length){showToast("Отметьте хотя бы один день");return;}}
      else{sh.date=sb.querySelector("#shDate").value;if(!sh.date){showToast("Укажите дату");return;}}
      /* пересечение смен одной машины */
      const clash=shifts.find(x=>x.car===sh.car&&tMin(x.from)<tMin(sh.to)&&tMin(sh.from)<tMin(x.to)&&
        ((x.date&&sh.date&&x.date===sh.date)||(x.days&&sh.days&&x.days.some(d=>sh.days.includes(d)))||(x.date&&sh.days&&sh.days.includes(isoDow(x.date)))||(sh.date&&x.days&&x.days.includes(isoDow(sh.date)))));
      if(clash&&!confirm("У этой машины уже есть смена в это время ("+clash.from+"–"+clash.to+"). Всё равно добавить?"))return;
      shifts.push(sh);touch();renderFleet(parentBody);showToast("Смена добавлена");
    };
    sb.querySelectorAll("[data-delsh]").forEach(b=>b.onclick=()=>{
      const i=+b.dataset.delsh,sh=shifts[i];shifts.splice(i,1);touch();renderFleet(parentBody);
      undoable("Смена удалена",()=>shifts.splice(i,0,sh));
    });
  }
  function renderPlaces(sb){
    const places=placesOf(editCity);
    let html=`<div class="adm2-banner ok" style="margin-bottom:14px"><span class="adm2-banner-ico">${window.ico("info")}</span><div><b>Быстрые адреса для жителей</b>
      <span>Кнопки под полем «Куда везти» в заказе такси. Нажал — и точный адрес подставился. Пока список пуст, показываются стандартные кнопки (больница, поликлиника, аптека…) с поиском по карте.</span></div></div>`;
    html+=`<div class="adm2-post"><b style="font-size:15px">Новый соцобъект</b><div class="adm2-row">
      <select class="adm2-inp" id="plType" style="max-width:190px" aria-label="Тип">${PLACE_TYPES.map(t=>`<option value="${t[0]}">${t[1]} ${t[2]}</option>`).join("")}</select>
      <input class="adm2-inp grow" id="plName" placeholder="Название, например Городская больница" style="flex:1;min-width:200px">
      <input class="adm2-inp grow" id="plAddr" placeholder="Адрес: улица, дом" style="flex:1;min-width:200px">
      <button type="button" class="adm2-btn" id="plAdd">+ Добавить</button></div></div>`;
    if(!places.length)html+='<div class="adm2-empty">Соцобъектов пока нет.</div>';
    else html+='<div class="adm2-places">'+places.map((pl,i)=>`<div class="adm2-place">
      <select class="adm2-inp" data-pl="${i}" data-f="type" aria-label="Тип">${PLACE_TYPES.map(t=>`<option value="${t[0]}"${pl.type===t[0]?" selected":""}>${t[1]}</option>`).join("")}</select>
      <input class="adm2-inp strong" data-pl="${i}" data-f="name" value="${esc(pl.name)}" aria-label="Название">
      <input class="adm2-inp" data-pl="${i}" data-f="address" value="${esc(pl.address)}" aria-label="Адрес">
      <div class="adm2-car-moves"><button type="button" class="adm2-icon-btn" data-plup="${i}" ${i===0?"disabled":""} aria-label="Выше">↑</button>
      <button type="button" class="adm2-icon-btn danger" data-delpl="${i}" aria-label="Удалить">${window.ico("trash")}</button></div></div>`).join("")+'</div>';
    sb.innerHTML=html;
    sb.querySelector("#plAdd").onclick=()=>{
      const name=sb.querySelector("#plName").value.trim(),address=sb.querySelector("#plAddr").value.trim();
      if(!name||!address){showToast("Укажите название и адрес");return;}
      places.push({type:sb.querySelector("#plType").value,name,address});touch();renderPlaces(sb);
      const cnt=document.querySelector('.adm2-seg-b[data-sub="places"] .adm2-count');if(cnt)cnt.textContent=places.length;
    };
    sb.querySelectorAll("[data-pl]").forEach(inp=>{const h=()=>{places[+inp.dataset.pl][inp.dataset.f]=inp.value.trim();touch();};inp.oninput=h;inp.onchange=h;});
    sb.querySelectorAll("[data-plup]").forEach(b=>b.onclick=()=>{const i=+b.dataset.plup;[places[i-1],places[i]]=[places[i],places[i-1]];touch();renderPlaces(sb);});
    sb.querySelectorAll("[data-delpl]").forEach(b=>b.onclick=()=>{const i=+b.dataset.delpl,pl=places[i];places.splice(i,1);touch();renderPlaces(sb);undoable("Соцобъект удалён",()=>places.splice(i,0,pl));});
  }

  /* ═══ Новости ═══ */
  function renderNews(body){
    const TAGS=["Новость","Анонс","Мероприятие","Важно"];
    let html=head("Новости","Видны во всех филиалах. Можно прикрепить несколько фото — покажутся каруселью.");
    html+='<div class="adm2-toolbar"><button type="button" class="adm2-btn" id="addNews">+ Новость</button></div><div id="nList"></div>';
    body.innerHTML=html;
    const list=body.querySelector("#nList");
    const draw=()=>{
      if(!newsData.length){list.innerHTML='<div class="adm2-empty">Новостей пока нет.</div>';return;}
      list.innerHTML=newsData.map((n,i)=>{
        const imgs=(n.images&&n.images.length)?n.images:(n.image?[n.image]:[]);
        return `<article class="adm2-post">
          <div class="adm2-row">
            <select class="adm2-inp" data-ni="${i}" data-f="tag" aria-label="Метка">${TAGS.map(t=>`<option ${n.tag===t?"selected":""}>${t}</option>`).join("")}</select>
            <input type="date" class="adm2-inp date" data-ni="${i}" data-f="date" value="${esc(n.date)}" aria-label="Дата">
            <button type="button" class="adm2-icon-btn danger" data-delnews="${i}" aria-label="Удалить новость" title="Удалить">${window.ico("trash")}</button>
          </div>
          <input class="adm2-inp strong" data-ni="${i}" data-f="title" value="${esc(n.title)}" placeholder="Заголовок" aria-label="Заголовок">
          <textarea class="adm2-inp" data-ni="${i}" data-f="text" rows="3" placeholder="Текст новости" aria-label="Текст">${esc(n.text)}</textarea>
          <div class="adm2-thumbs">${imgs.map((src,ii)=>`<div class="adm2-thumb"><img src="${src}" alt=""><button type="button" data-delimg="${i}_${ii}" aria-label="Удалить фото">✕</button></div>`).join("")}
            <button type="button" class="adm2-add-photo" data-addimg="${i}">＋ Фото</button></div>
        </article>`;
      }).join("");
      list.querySelectorAll("textarea").forEach(autoGrow);
      list.querySelectorAll("[data-ni]").forEach(inp=>{
        const h=()=>{newsData[+inp.dataset.ni][inp.dataset.f]=inp.value;if(inp.tagName==="TEXTAREA")autoGrow(inp);touch();};
        inp.oninput=h;inp.onchange=h;
      });
      list.querySelectorAll("[data-delnews]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delnews,n=newsData[i];newsData.splice(i,1);touch();draw();
        undoable("Новость удалена",()=>newsData.splice(i,0,n));
      });
      list.querySelectorAll("[data-addimg]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.addimg;
        pickAndResizeImage(url=>{
          const n=newsData[i];if(!n.images)n.images=n.image?[n.image]:[];delete n.image;
          n.images.push(url);touch();flushSave();draw();
        },480);
      });
      list.querySelectorAll("[data-delimg]").forEach(b=>b.onclick=()=>{
        const[i,ii]=b.dataset.delimg.split("_").map(Number),n=newsData[i];
        let removed;if(n.images)removed=n.images.splice(ii,1)[0];else{removed=n.image;delete n.image;}
        touch();draw();
        undoable("Фото удалено",()=>{if(!n.images)n.images=[];n.images.splice(ii,0,removed);});
      });
    };
    body.querySelector("#addNews").onclick=()=>{
      newsData.unshift({date:taxiIsoSafe(),tag:"Новость",title:"",text:""});touch();draw();
      const t=list.querySelector('[data-f="title"]');if(t)t.focus();
    };
    draw();
  }
  function taxiIsoSafe(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}

  /* ═══ Мероприятия ═══ */
  function renderEvents(body){
    let html=head("Мероприятия","Афиша с записью — видна во всех филиалах.");
    html+='<div class="adm2-toolbar"><button type="button" class="adm2-btn" id="addEvt">+ Мероприятие</button></div><div id="eList"></div>';
    body.innerHTML=html;
    const list=body.querySelector("#eList");
    const split=e=>{const p=String(e.date||"").split(" ");return{d:p[0]||"",t:p[1]||""};};
    const draw=()=>{
      if(!eventsData.length){list.innerHTML='<div class="adm2-empty">Мероприятий пока нет.</div>';return;}
      list.innerHTML=eventsData.map((e,i)=>{const dt=split(e);return `<article class="adm2-post">
        <div class="adm2-row">
          <input type="date" class="adm2-inp date" data-ei="${i}" data-f="d" value="${esc(dt.d)}" aria-label="Дата">
          <input type="time" class="adm2-inp time" data-ei="${i}" data-f="t" value="${esc(dt.t)}" aria-label="Время">
          <label class="adm2-inline">Мест <input class="adm2-inp price" inputmode="numeric" data-ei="${i}" data-f="seats" value="${e.seats||""}" aria-label="Количество мест"></label>
          <button type="button" class="adm2-icon-btn danger" data-delevt="${i}" aria-label="Удалить мероприятие" title="Удалить">${window.ico("trash")}</button>
        </div>
        <input class="adm2-inp strong" data-ei="${i}" data-f="title" value="${esc(e.title)}" placeholder="Название мероприятия">
        <input class="adm2-inp" data-ei="${i}" data-f="place" value="${esc(e.place)}" placeholder="Место проведения">
        <textarea class="adm2-inp" data-ei="${i}" data-f="desc" rows="2" placeholder="Описание">${esc(e.desc)}</textarea>
        <div class="adm2-thumbs">${e.image?`<div class="adm2-thumb"><img src="${e.image}" alt=""><button type="button" data-delimg="${i}" aria-label="Удалить фото">✕</button></div>`:""}
          <button type="button" class="adm2-add-photo" data-addimg="${i}">${e.image?"Заменить фото":"＋ Фото"}</button></div>
      </article>`;}).join("");
      list.querySelectorAll("textarea").forEach(autoGrow);
      list.querySelectorAll("[data-ei]").forEach(inp=>{
        const h=()=>{
          const e=eventsData[+inp.dataset.ei],f=inp.dataset.f;
          if(f==="d"||f==="t"){const dt=split(e);if(f==="d")dt.d=inp.value;else dt.t=inp.value;e.date=dt.d+(dt.t?" "+dt.t:"");}
          else if(f==="seats"){const c=inp.value.replace(/\D/g,"");inp.value=c;e.seats=num(c)||0;}
          else e[f]=inp.value;
          if(inp.tagName==="TEXTAREA")autoGrow(inp);
          touch();
        };
        inp.oninput=h;inp.onchange=h;
      });
      list.querySelectorAll("[data-delevt]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delevt,e=eventsData[i];eventsData.splice(i,1);touch();draw();
        undoable("Мероприятие удалено",()=>eventsData.splice(i,0,e));
      });
      list.querySelectorAll("[data-addimg]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.addimg;pickAndResizeImage(url=>{eventsData[i].image=url;touch();flushSave();draw();});
      });
      list.querySelectorAll("[data-delimg]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delimg,img=eventsData[i].image;delete eventsData[i].image;touch();draw();
        undoable("Фото удалено",()=>{eventsData[i].image=img;});
      });
    };
    body.querySelector("#addEvt").onclick=()=>{
      const id="ev"+Date.now().toString(36);
      eventsData.unshift({id,date:taxiIsoSafe(),title:"",place:"",desc:"",seats:0});touch();draw();
      const t=list.querySelector('[data-f="title"]');if(t)t.focus();
    };
    draw();
  }

  /* ═══ Галерея ═══ */
  function renderGallery(body){
    let html=head("Фотогалерея","Видна во всех филиалах. Фото автоматически уменьшаются перед сохранением.");
    html+='<div class="adm2-toolbar"><button type="button" class="adm2-btn" id="addPhoto">Добавить фото</button></div><div id="gList"></div>';
    body.innerHTML=html;
    const list=body.querySelector("#gList");
    const draw=()=>{
      if(!galleryData.length){list.innerHTML='<div class="adm2-empty">Фотографий пока нет.</div>';return;}
      list.innerHTML='<div class="adm2-gallery">'+galleryData.map((g,i)=>`<figure class="adm2-photo">
        <img src="${g.url}" alt="${esc(g.caption)}">
        <input class="adm2-inp" data-gi="${i}" value="${esc(g.caption)}" placeholder="Подпись" aria-label="Подпись к фото">
        <button type="button" class="adm2-icon-btn danger" data-delphoto="${i}" aria-label="Удалить фото" title="Удалить">${window.ico("trash")}</button>
      </figure>`).join("")+'</div>';
      list.querySelectorAll("[data-gi]").forEach(inp=>inp.oninput=()=>{galleryData[+inp.dataset.gi].caption=inp.value;touch();});
      list.querySelectorAll("[data-delphoto]").forEach(b=>b.onclick=()=>{
        const i=+b.dataset.delphoto,g=galleryData[i];galleryData.splice(i,1);touch();draw();
        undoable("Фото удалено",()=>galleryData.splice(i,0,g));
      });
    };
    body.querySelector("#addPhoto").onclick=()=>pickAndResizeImage(url=>{
      galleryData.push({id:"ph"+Date.now(),url:url,caption:""});touch();flushSave();draw();showToast("Фото добавлено");
    },900);
    draw();
  }

  /* ═══ Статистика ═══ */
  
  function renderStats(body){
    body.innerHTML=head("Статистика","Статистика собирается на сервере по всем жителям и филиалам.")+
      '<div class="adm2-empty">В тестовом режиме без сервера статистика недоступна. Войдите доменной учётной записью на сервере.</div>';
  }
  
  /* ═══ Серверный режим: публикация ═══ */
  function renderPublishServer(body){
    flushSave();
    const unpub=isUnpublished();
    const fmt=d=>d?new Date(d).toLocaleString("ru-RU"):"—";
    body.innerHTML=head("Публикация","Изменения в панели сохраняются как черновик. Жители увидят их после публикации.")+
      `<div class="adm2-banner ${unpub?"warn":"ok"}"><span class="adm2-banner-ico">${window.ico(unpub?"warn":"check")}</span><div>
        <b>${unpub?"Есть неопубликованные изменения":"Всё опубликовано"}</b>
        <span>${pubInfo?"Последняя публикация: "+fmt(pubInfo.updatedAt)+" — "+esc(pubInfo.updatedBy||""):"Данные ещё ни разу не публиковались — жители видят встроенный прейскурант."}</span></div>
        ${unpub?'<button type="button" class="adm2-btn" id="srvPublish">Опубликовать</button>':""}</div>
      <div class="adm2-sub">Резервная копия</div>
      <div class="adm2-actions">
        <button type="button" class="adm2-btn ghost" id="admExport">Скачать копию данных</button>
        ${me&&hasRole("admin")?'<button type="button" class="adm2-btn ghost" id="admImport">Загрузить из файла в черновик</button>':""}
      </div>
      <p class="adm2-note">Копия содержит прейскурант, сотрудников, машины, смены и новости (без заявок жителей). Храните её в защищённом месте.</p>`;
    const pb=body.querySelector("#srvPublish");
    if(pb)pb.onclick=()=>{
      pb.disabled=true;pb.textContent="Публикуем…";
      apiCall("POST","/admin/content/publish",{}).then(d=>{
        pubSourceVersion=d.draftVersion;pubInfo={updatedAt:new Date().toISOString(),updatedBy:me.login};
        showToast("Опубликовано — жители увидят изменения при следующем открытии");updateSaveState();renderPublishServer(body);
      }).catch(e=>{showToast(e.message);pb.disabled=false;pb.textContent="Опубликовать";});
    };
    body.querySelector("#admExport").onclick=exportJSON;
    const ib=body.querySelector("#admImport");if(ib)ib.onclick=()=>document.getElementById("admFile").click();
  }

  /* ═══ Серверный режим: заявки жителей ═══ */
  let reqFilter={type:"",status:"active",when:"today",allBranches:false,q:""},reqTimer=null;
  const RQ_TYPE={order:["cart","Заявка на услуги"],booking:["calendar","Запись"],taxi:["taxi","Такси"],callback:["phone","Обратный звонок"],event:["ticket","Мероприятие"],feedback:["star","Отзыв"]};
  const RQ_ST={new:["Новая","warn"],confirmed:["Подтверждена","on"],assigned:["Машина назначена","on"],done:["Выполнена","off"],cancelled:["Отменена","off"],rejected:["Отклонена","off"]};
  function isoDay(off){const d=new Date();d.setDate(d.getDate()+off);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function renderRequests(body){
    clearInterval(reqTimer);clearUnseen();
    const types=(hasRole("admin")?["order","booking","taxi","callback","event","feedback"]:[].concat(hasRole("dispatcher")?["taxi"]:[],hasRole("operator")?["order","booking","callback","event","feedback"]:[]));
    body.innerHTML=head("Заявки жителей",(reqFilter.allBranches?"Все филиалы":"Филиал «"+CITY_NAMES[editCity]+"»")+". Новые заявки и изменения появляются сразу, со звуком.")+
      `<div class="adm2-toolbar adm2-rq-bar">
        <div class="adm2-seg">${[["today","Сегодня"],["tomorrow","Завтра"],["all","Все"]].map(([k,l])=>`<button type="button" class="adm2-seg-b${reqFilter.when===k?" on":""}" data-when="${k}">${l}</button>`).join("")}</div>
        ${types.length>1?`<select class="adm2-inp" id="rqType" style="max-width:190px"><option value="">Все типы</option>${types.map(t=>`<option value="${t}"${reqFilter.type===t?" selected":""}>${RQ_TYPE[t][1]}</option>`).join("")}</select>`:""}
        <select class="adm2-inp" id="rqStatus" style="max-width:200px"><option value="active"${reqFilter.status==="active"?" selected":""}>Новые и в работе</option><option value=""${reqFilter.status===""?" selected":""}>Все статусы</option>${Object.keys(RQ_ST).map(k=>`<option value="${k}"${reqFilter.status===k?" selected":""}>${RQ_ST[k][0]}</option>`).join("")}</select>
        <input class="adm2-inp adm2-search" id="rqQ" type="search" placeholder="№, ФИО или телефон" value="${esc(reqFilter.q)}">
        <label class="adm2-check"><input type="checkbox" id="rqAll"${reqFilter.allBranches?" checked":""}> Все филиалы</label>
        <button type="button" class="adm2-btn ghost" id="rqRefresh">↻ Обновить</button>
        <button type="button" class="adm2-btn ghost" id="rqXlsx">${window.ico("download")} Excel</button>
        ${types.includes("taxi")?`<span class="adm2-wb"><input type="date" class="adm2-inp date" id="rqWbDate" value="${isoDay(reqFilter.when==="tomorrow"?1:0)}" aria-label="Дата путевого листа"><button type="button" class="adm2-btn ghost" id="rqWaybill">${window.ico("printer")} Путевой лист</button></span>`:""}
      </div><div id="rqList"><div class="adm2-empty">Загрузка…</div></div>`;
    const list=body.querySelector("#rqList");
    const load=()=>{
      const p=new URLSearchParams();
      if(reqFilter.type)p.set("type",reqFilter.type);
      if(reqFilter.status)p.set("status",reqFilter.status);   /* «active» — новые и в работе, фильтрует сервер */
      scopeQ(p,!reqFilter.allBranches);
      if(reqFilter.when!=="all")p.set("date",isoDay(reqFilter.when==="today"?0:1));
      if(reqFilter.q)p.set("q",reqFilter.q);
      return apiCall("GET","/admin/requests?"+p.toString()).then(d=>{
        drawList(d.items);
        if(d.limited)list.insertAdjacentHTML("afterbegin",'<div class="adm2-note">Показаны последние '+d.items.length+' — уточните фильтр (дата, статус, поиск), чтобы увидеть остальные.</div>');
      }).catch(e=>{list.innerHTML='<div class="adm2-empty">Не удалось загрузить: '+esc(e.message)+'</div>';});
    };
    const drawList=items=>{
      if(!items.length){list.innerHTML='<div class="adm2-empty">Заявок нет.</div>';return;}
      const fleet=fleetActive(editCity);
      list.innerHTML=items.map(x=>{
        const t=RQ_TYPE[x.type]||["•",x.type],st=RQ_ST[x.status]||[x.status,"off"],p=x.payload||{};
        let what="";
        if(x.type==="taxi")what=`<div class="adm2-rq-route">${esc(p.from)}<br>${esc(p.to)}</div>
          <div class="adm2-rq-meta">${esc(p.tariff||"")}${p.isFree?" · <b>льготная</b>":p.price?" · "+esc(p.price)+" ₽":""} · пассажиров: ${esc(p.pax||1)}${p.wheelchair?' · <b class="adm2-wheel">нужна машина для коляски</b>':""}</div>`;
        else if(x.type==="order")what=`<div class="adm2-rq-meta">${(p.items||[]).map(i=>esc(i.name)+(i.qty>1?" ×"+esc(i.qty):"")).join("<br>")}</div><div class="adm2-rq-meta">Итого: <b>${esc(p.total||0)} ₽</b>${p.moroshka?" · карта «Морошка»":""}${p.address?" · адрес: "+esc(p.address):""}</div>`;
        else if(x.type==="callback")what=`<div class="adm2-rq-meta">Удобное время: <b>${esc(p.time||"")}</b>${p.topic?"<br>Тема: "+esc(p.topic):""}</div>`;
        else if(x.type==="event")what=`<div class="adm2-rq-meta">«${esc(p.title||"")}» · ${esc(p.date||"")}${p.place?" · "+esc(p.place):""}</div>`;
        else if(x.type==="feedback")what=`<div class="adm2-rq-meta"><span class="adm2-stars">${"★".repeat(+p.rating||0)}${"☆".repeat(5-(+p.rating||0))}</span>${(p.tags||[]).length?" · "+esc(p.tags.join(", ")):""}${p.comment?"<br>"+esc(p.comment):""}</div>`;
        else what=`<div class="adm2-rq-meta">${esc(p.dept||"")}${p.spec?" · "+esc(p.spec):""}${p.sub?" · "+esc(p.sub):""}${p.service?"<br>"+esc(p.service):""}${p.item?" · п. "+esc(p.item):""}${p.price!=null&&p.price!==""?" · "+esc(p.price)+" ₽":""}</div>`;
        const car=x.assigned||{};
        return `<article class="adm2-rq${freshIds.has(String(x.id))?" adm2-fresh":""}" data-id="${x.id}">
          <div class="adm2-rq-head"><span class="adm2-rq-type">${window.ico(t[0])} ${t[1]} <b>№ ${esc(x.num)}</b></span>
            <span class="adm2-badge ${st[1]}">${st[0]}</span>
            <span class="adm2-rq-when">${x.scheduled_at?""+esc(x.scheduled_at.slice(8,10)+"."+x.scheduled_at.slice(5,7)+" в "+x.scheduled_at.slice(11)):"создана "+new Date(x.created_at).toLocaleString("ru-RU")}</span>
            ${reqFilter.allBranches?`<span class="adm2-rq-br">${esc(brLabel(x.branch))}</span>`:""}</div>
          <div class="adm2-rq-who"><b>${esc(x.client_name)}</b>${x.client_phone?` · <a href="tel:+${esc(x.client_phone)}">+${esc(x.client_phone)}</a>`:""}</div>
          ${residentHtml(x)}${what}${p.comment?`<div class="adm2-rq-meta">${esc(p.comment)}</div>`:""}
          <div class="adm2-rq-act">
            <label class="adm2-fld"><span>Статус</span><select class="adm2-inp" data-f="status">${Object.keys(RQ_ST).filter(k=>x.type==="taxi"||k!=="assigned").map(k=>`<option value="${k}"${x.status===k?" selected":""}>${RQ_ST[k][0]}</option>`).join("")}</select></label>
            ${x.type==="taxi"?`<label class="adm2-fld"><span>Машина</span><select class="adm2-inp" data-f="car"><option value="">— не назначена —</option>${fleet.map(c=>`<option value="${esc(c.id)}"${car.plate&&plateNormalize(car.plate)===plateNormalize(c.plate)?" selected":""}>${esc(c.model)}${c.plate?" · "+esc(c.plate):""}${c.wheelchair?"":""}</option>`).join("")}</select></label>
              <label class="adm2-fld"><span>Водитель</span><input class="adm2-inp" data-f="driver" value="${esc(car.driver||"")}" placeholder="Фамилия И. О."></label>`:""}
            <label class="adm2-fld wide"><span>Сообщение жителю</span><input class="adm2-inp" data-f="note" value="${esc(x.staff_note||"")}" placeholder="${esc(({taxi:"Например: водитель позвонит за 15 минут до подачи",order:"Например: подойдите в каб. 12 с паспортом и справкой об инвалидности",booking:"Например: приём в каб. 5, возьмите документы",callback:"Например: перезвоним завтра до 12:00",event:"Например: сбор у входа в 10:30",feedback:"Например: спасибо за отзыв, передали руководителю"})[x.type]||"Сообщение жителю")}" maxlength="500"></label>
            <div class="adm2-rq-btns"><button type="button" class="adm2-btn sm" data-save>Сохранить</button><button type="button" class="adm2-btn ghost sm" data-hist>История</button></div>
          </div><div class="adm2-rq-hist" hidden></div>
        </article>`;
      }).join("");
      list.querySelectorAll(".adm2-rq").forEach(card=>{
        const id=card.dataset.id;
        card.querySelector("[data-save]").onclick=ev=>{
          const b={status:card.querySelector('[data-f="status"]').value,staffNote:card.querySelector('[data-f="note"]').value.trim()};
          const cs=card.querySelector('[data-f="car"]');
          if(cs){
            const c=fleetOf(editCity).find(z=>z.id===cs.value);
            b.assigned=c?{model:c.model,plate:plateNormalize(c.plate),color:c.color||"",wheelchair:!!c.wheelchair,driver:card.querySelector('[data-f="driver"]').value.trim()||c.driver||""}:null;
            if(c&&b.status==="new")b.status="assigned";
          }
          ev.target.disabled=true;
          apiCall("PATCH","/admin/requests/"+id,b).then(()=>{showToast("Сохранено — житель увидит изменения");load();}).catch(e=>{showToast(e.message);ev.target.disabled=false;});
        };
        card.querySelector("[data-hist]").onclick=()=>{
          const h=card.querySelector(".adm2-rq-hist");
          if(!h.hidden){h.hidden=true;return;}
          apiCall("GET","/admin/requests/"+id+"/history").then(d=>{
            h.innerHTML=d.items.map(i=>`<div>${new Date(i.at).toLocaleString("ru-RU")} — <b>${esc(i.actor==="resident"?"житель":i.actor)}</b>: ${esc(i.action==="created"?"создана":i.action==="cancelled"?"отменена жителем":i.data&&i.data.status?("статус «"+(RQ_ST[i.data.status[1]]||[i.data.status[1]])[0]+"»"):"изменена")}${i.data&&i.data.assigned&&i.data.assigned.model?" · машина "+esc(i.data.assigned.model):""}</div>`).join("");
            h.hidden=false;
          });
        };
      });
    };
    body.querySelectorAll("[data-when]").forEach(b=>b.onclick=()=>{reqFilter.when=b.dataset.when;renderRequests(body);});
    const ts=body.querySelector("#rqType");if(ts)ts.onchange=()=>{reqFilter.type=ts.value;load();};
    body.querySelector("#rqStatus").onchange=e=>{reqFilter.status=e.target.value;load();};
    body.querySelector("#rqAll").onchange=e=>{reqFilter.allBranches=e.target.checked;renderRequests(body);};
    let qt=0;body.querySelector("#rqQ").oninput=e=>{clearTimeout(qt);qt=setTimeout(()=>{reqFilter.q=e.target.value.trim();load();},350);};
    body.querySelector("#rqRefresh").onclick=load;
    body.querySelector("#rqXlsx").onclick=()=>{
      const p=new URLSearchParams();
      if(reqFilter.type)p.set("type",reqFilter.type);
      if(reqFilter.status)p.set("status",reqFilter.status);   /* «active» — новые и в работе, фильтрует сервер */
      scopeQ(p,!reqFilter.allBranches);
      if(reqFilter.when!=="all")p.set("date",isoDay(reqFilter.when==="today"?0:1));
      downloadFile("/admin/export/requests.xlsx?"+p,"Заявки.xlsx");
    };
    const wb=body.querySelector("#rqWaybill");if(wb)wb.onclick=()=>printWaybill(body.querySelector("#rqWbDate").value||isoDay(0));
    load();setLive(()=>{if(editTab==="requests"&&document.getElementById("rqList"))load();});
    /* запасное автообновление: только если поток событий недоступен */
    reqTimer=setInterval(()=>{
      if(editTab!=="requests"||!document.getElementById("rqList")){clearInterval(reqTimer);return;}
      if(esOk)return;
      if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".adm2-rq"))return;
      load();
    },30000);
  }

  /* ═══ Серверный режим: статистика по базе ═══ */
  let statFilter={days:30,all:true};
  function renderStatsServer(body){
    body.innerHTML=head("Статистика","По заявкам в базе и посещениям приложения. Считается на сервере, без внешних счётчиков.")+
      `<div class="adm2-toolbar"><div class="adm2-seg">${[[1,"Сегодня"],[7,"7 дней"],[30,"30 дней"],[90,"90 дней"]].map(([d,l])=>`<button type="button" class="adm2-seg-b${statFilter.days===d?" on":""}" data-days="${d}">${l}</button>`).join("")}</div>
       <label class="adm2-check"><input type="checkbox" id="stAll"${statFilter.all?" checked":""}> Все филиалы</label>
       <button type="button" class="adm2-btn ghost" id="stXlsx">${window.ico("download")} Excel</button></div><div id="stBody"><div class="adm2-empty">Загрузка…</div></div>`;
    body.querySelectorAll("[data-days]").forEach(b=>b.onclick=()=>{statFilter.days=+b.dataset.days;renderStatsServer(body);});
    body.querySelector("#stAll").onchange=e=>{statFilter.all=e.target.checked;renderStatsServer(body);};
    body.querySelector("#stXlsx").onclick=()=>{const q=new URLSearchParams({days:statFilter.days});scopeQ(q,!statFilter.all);downloadFile("/admin/export/stats.xlsx?"+q,"Статистика.xlsx");};
    const p=new URLSearchParams({days:statFilter.days});scopeQ(p,!statFilter.all);
    apiCall("GET","/admin/stats?"+p).then(d=>{
      const n=k=>d.byType[k]||0,total=Object.values(d.byType).reduce((a,b)=>a+b,0);
      const canc=(d.byStatus.cancelled||0)+(d.byStatus.rejected||0);
      const visits=d.visits.reduce((a,v)=>a+v.n,0);
      const kp=[];
      if(d.types.includes("order"))kp.push([n("order"),"заявок на услуги"]);
      if(d.types.includes("booking"))kp.push([n("booking"),"записей к специалистам"]);
      if(d.types.includes("taxi"))kp.push([n("taxi"),"заказов такси"]);
      if(d.types.includes("callback"))kp.push([n("callback"),"обратных звонков"]);
      if(d.types.includes("event"))kp.push([n("event"),"записей на мероприятия"]);
      if(d.types.includes("feedback"))kp.push([n("feedback"),"отзывов"]);
      kp.push([total?Math.round(canc/total*100)+"%":"—","отменено или отклонено"]);
      kp.push([visits,"посещений приложения"]);
      let h=`<div class="adm2-kpis" style="grid-template-columns:repeat(${kp.length},1fr)">${kp.map(k=>`<div><b>${k[0]}</b><span>${k[1]}</span></div>`).join("")}</div>`;
      /* по дням: заявки и посещения */
      const daysMap={};d.perDay.forEach(x=>{(daysMap[x.day]=daysMap[x.day]||{r:0,v:0}).r=x.n;});d.visits.forEach(x=>{(daysMap[x.day]=daysMap[x.day]||{r:0,v:0}).v=x.n;});
      const dk=Object.keys(daysMap).sort().slice(-31);
      if(dk.length){
        const mx=Math.max(1,...dk.map(k=>Math.max(daysMap[k].r,daysMap[k].v)));
        h+=`<div class="adm2-sub">По дням <span class="adm2-legend"><i class="r"></i>заявки <i class="v"></i>посещения</span></div><div class="adm2-days-chart">${dk.map(k=>`<div class="adm2-dc" title="${k.split("-").reverse().join(".")}: заявок ${daysMap[k].r}, посещений ${daysMap[k].v}"><div class="adm2-dc-bars"><i class="v" style="height:${Math.round(daysMap[k].v/mx*100)}%"></i><i class="r" style="height:${Math.round(daysMap[k].r/mx*100)}%"></i></div><span>${k.slice(8)}</span></div>`).join("")}</div>`;
      }
      const st={new:"Новые",confirmed:"Подтверждены",assigned:"Машина назначена",done:"Выполнены",cancelled:"Отменены",rejected:"Отклонены"};
      if(total)h+=`<div class="adm2-sub">По статусам</div><div class="adm2-bars">${Object.keys(st).filter(k=>d.byStatus[k]).map(k=>`<div class="adm2-bar"><span class="adm2-bar-l">${st[k]}</span><span class="adm2-bar-t"><i style="width:${Math.round(d.byStatus[k]/total*100)}%"></i></span><b>${d.byStatus[k]}</b></div>`).join("")}</div>`;
      if(d.topServices.length){const mt=d.topServices[0].n;h+=`<div class="adm2-sub">Популярные услуги</div><div class="adm2-bars">${d.topServices.map(t=>`<div class="adm2-bar"><span class="adm2-bar-l">${esc(t.name)}</span><span class="adm2-bar-t"><i style="width:${Math.round(t.n/mt*100)}%"></i></span><b>${t.n}</b></div>`).join("")}</div>`;}
      if(d.types.includes("taxi")&&n("taxi")){
        h+=`<div class="adm2-sub">Такси</div><div class="adm2-kpis" style="grid-template-columns:repeat(3,1fr)"><div><b>${d.taxi.free}</b><span>льготных поездок</span></div><div><b>${d.taxi.wheelchair}</b><span>с машиной для коляски</span></div><div><b>${d.cars.reduce((a,c)=>a+c.n,0)}</b><span>с назначенной машиной</span></div></div>`;
        if(d.cars.length)h+=`<div class="adm2-table-wrap" style="margin-top:10px"><table class="adm2-table adm2-shifts"><thead><tr><th>Машина</th><th>Госномер</th><th>Поездок</th></tr></thead><tbody>${d.cars.map(c=>`<tr><td>${esc(c.model)}</td><td>${esc(c.plate||"—")}</td><td>${c.n}</td></tr>`).join("")}</tbody></table></div>`;
      }
      if(statFilter.all&&d.byBranch.length){
        const br={};d.byBranch.forEach(r=>{(br[r.branch]=br[r.branch]||{})[r.type]=r.n;});
        h+=`<div class="adm2-sub">По филиалам</div><div class="adm2-table-wrap"><table class="adm2-table"><thead><tr><th>Филиал</th>${d.types.map(t=>`<th>${({order:"Заявки",booking:"Записи",taxi:"Такси",callback:"Звонки",event:"Мероприятия",feedback:"Отзывы"})[t]||t}</th>`).join("")}</tr></thead><tbody>${Object.keys(br).map(b=>`<tr><td>${esc(brLabel(b))}</td>${d.types.map(t=>`<td>${br[b][t]||0}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      }
      if(!total&&!visits)h+='<div class="adm2-empty" style="margin-top:14px">За выбранный период данных нет.</div>';
      body.querySelector("#stBody").innerHTML=h;
    }).catch(e=>{body.querySelector("#stBody").innerHTML='<div class="adm2-empty">Не удалось загрузить: '+esc(e.message)+'</div>';});
  }

  /* ═══ Звук и уведомления о новых заявках (для сотрудников) ═══ */
  function soundOn(){return localStorage.getItem("grmSound")!=="0";}
  function chime(){
    if(!soundOn())return;
    try{
      const A=window.AudioContext||window.webkitAudioContext;if(!A)return;
      const ctx=chime._c||(chime._c=new A());
      if(ctx.state==="suspended")ctx.resume();
      [[880,0],[1175,0.16],[1568,0.32]].forEach(([f,t])=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.type="sine";o.frequency.value=f;
        g.gain.setValueAtTime(0.0001,ctx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.25,ctx.currentTime+t+0.02);
        g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+t+0.45);
        o.connect(g).connect(ctx.destination);o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+0.5);
      });
    }catch(e){}
  }
  /* ═══ Живые обновления: поток событий сервера (SSE) + запасной опрос ═══
     Новая заявка, отмена жителем, правка коллеги — приходят сразу. Если поток оборвался,
     браузер переподключается сам, а опрос раз в 20 с подстраховывает — заявка не потеряется. */
  let watchTimer=null,lastSeen=null,unseen=0,liveHook=null,liveT=null,es=null,esOk=false;
  const freshIds=new Set();
  const baseTitle=document.title;
  /* раздел, открытый сейчас, регистрирует «перечитать данные» — без полной перерисовки экрана */
  function setLive(fn){liveHook=fn;}
  /* изменённая, но не сохранённая карточка заявки — живое обновление её не перерисует */
  ["input","change"].forEach(t=>document.addEventListener(t,e=>{
    const c=e.target&&e.target.closest&&e.target.closest(".adm2-rq,.adm2-dride");
    if(c&&e.target.matches("select,input,textarea")&&!e.target.matches("[data-nofollow]"))c.dataset.dirty=String(Date.now());
  },true));
  function liveRefresh(delay){
    clearTimeout(liveT);
    liveT=setTimeout(function again(){
      if(!liveHook)return;
      /* сотрудник печатает или изменил поле и ещё не сохранил — подождём, чтобы не потерять ввод */
      const a=document.activeElement;
      if(a&&a.closest&&a.closest(".adm2-rq,.adm2-dride,.adm2-dform")&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)){liveT=setTimeout(again,3000);return;}
      /* несохранённое держим до 2 минут — дальше доска всё равно обновится, чтобы не отставать */
      if([...document.querySelectorAll(".adm2-rq[data-dirty],.adm2-dride[data-dirty]")].some(c=>Date.now()-(+c.dataset.dirty||0)<120000)){liveT=setTimeout(again,3000);return;}
      try{liveHook();}catch(e){}
    },delay==null?250:delay);
  }
  function announceNew(n){
    unseen+=n;
    chime();
    showToast(n===1?"Новая заявка":"Новых заявок: "+n);
    document.title="("+unseen+") "+baseTitle;
    const tb=document.querySelector('.adm2-tab[data-tab="'+(hasRole("admin","operator")?"requests":"dispatch")+'"]');
    if(tb){let bd=tb.querySelector(".adm2-newbadge");if(!bd){bd=document.createElement("span");bd.className="adm2-newbadge";tb.appendChild(bd);}bd.textContent=unseen;}
    if(window.Notification&&Notification.permission==="granted"&&document.hidden){
      try{new Notification("Новая заявка",{body:n===1?"Поступила новая заявка — откройте панель.":"Поступило заявок: "+n,icon:"img/socuslugi-logo.png",tag:"grm-new"});}catch(e){}
    }
  }
  function startRequestWatcher(){
    const btn=document.getElementById("admSound");
    if(btn)btn.onclick=()=>{
      localStorage.setItem("grmSound",soundOn()?"0":"1");
      btn.innerHTML=window.ico(soundOn()?"bell":"bellOff")+" Звук: "+(soundOn()?"вкл":"выкл");btn.setAttribute("aria-pressed",String(soundOn()));
      if(soundOn())chime();
      if(soundOn()&&window.Notification&&Notification.permission==="default")Notification.requestPermission();
    };
    if(watchTimer||(API&&!hasRole("admin","dispatcher","operator")))return;
    /* поток событий */
    if(API&&window.EventSource&&!es){
      es=new EventSource(API+"/admin/stream");
      es.addEventListener("hello",()=>{esOk=true;liveRefresh(0);});     /* после переподключения — сверка */
      es.addEventListener("request",ev=>{
        let d;try{d=JSON.parse(ev.data);}catch(e){return;}
        if(d.action==="created"){freshIds.add(String(d.id));setTimeout(()=>freshIds.delete(String(d.id)),15000);
          if(lastSeen!==null&&d.id>lastSeen)lastSeen=d.id;announceNew(1);}
        else if(d.action==="cancelled")showToast("Житель отменил заявку № "+d.num);
        liveRefresh();
      });
      es.addEventListener("bye",()=>{es.close();es=null;me=null;showServerLogin("Сессия закончилась — войдите снова");});
      es.onerror=()=>{esOk=false;};
    }
    /* запасной опрос: ловит всё, что поток мог пропустить */
    const tick=()=>apiCall("GET","/admin/requests/latest").then(d=>{
      if(lastSeen===null){lastSeen=d.last;return;}
      if(d.last>lastSeen){
        const since=lastSeen;lastSeen=d.last;
        return apiCall("GET","/admin/requests?since="+since+"&limit=200").then(x=>(x.items||[]).length||1).catch(()=>1).then(n=>{announceNew(n);liveRefresh();});
      }
      if(!esOk)liveRefresh();
    }).catch(()=>{});
    tick();watchTimer=setInterval(tick,20000);
    /* без сервера: заявки жителя в соседней вкладке этого браузера — сразу */
    if(!API)window.addEventListener("storage",e=>{if(e.key&&Object.values(LOCAL_KEYS).includes(e.key)){tick();liveRefresh();}});
  }
  function clearUnseen(){unseen=0;document.title=baseTitle;document.querySelectorAll(".adm2-newbadge").forEach(b=>b.remove());}

  /* Скачать файл с сервера (Excel) с учётом сессии */
  function downloadFile(path,name){
    if(!API){if(/requests\.xlsx/.test(path))localXlsx(path);else showToast("Без сервера доступна выгрузка заявок");return;}
    showToast("Готовим файл…");
    fetch(API+path,{credentials:"same-origin"}).then(r=>{if(!r.ok)throw new Error("Ошибка "+r.status);return r.blob();}).then(b=>{
      const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(a.href),2000);
    }).catch(e=>showToast("Не удалось скачать: "+e.message));
  }

  /* ═══ Путевой лист водителя на день ═══ */
  function printWaybill(day,onlyCar){
    const p=new URLSearchParams({type:"taxi",date:day,branch:brKey(editCity)});
    apiCall("GET","/admin/requests?"+p).then(d=>{
      let rides=d.items.filter(x=>!["cancelled","rejected"].includes(x.status));
      if(onlyCar)rides=rides.filter(x=>x.assigned&&plateNormalize(x.assigned.plate||"")===plateNormalize(onlyCar));
      if(!rides.length){showToast("На "+day.split("-").reverse().join(".")+" поездок нет");return;}
      const groups={};
      rides.forEach(x=>{const c=x.assigned&&x.assigned.model?(x.assigned.model+(x.assigned.plate?" · "+x.assigned.plate:"")):"Машина не назначена";(groups[c]=groups[c]||{car:x.assigned||{},items:[]}).items.push(x);});
      const date=day.split("-").reverse().join(".");
      const h=s=>String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
      const html=`<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Путевой лист ${date}</title><style>
        @page{size:A4 landscape;margin:12mm}body{font:12px/1.35 Arial,sans-serif;color:#111;margin:0}
        h1{font-size:18px;margin:0 0 2px}.sub{color:#444;margin-bottom:10px}
        .car{page-break-after:always;margin-bottom:14px}.car:last-child{page-break-after:auto}
        .head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:8px}
        table{width:100%;border-collapse:collapse}th,td{border:1px solid #777;padding:5px 6px;vertical-align:top;text-align:left}
        th{background:#eee;font-size:11px}td.t{white-space:nowrap;font-weight:700;width:52px}td.s{width:120px}
        .sign{display:flex;gap:40px;margin-top:16px}.sign div{flex:1;border-top:1px solid #111;padding-top:3px;font-size:11px;color:#444}
        .noprint{margin:10px 0}@media print{.noprint{display:none}}</style></head><body>
        <div class="noprint"><button type="button" id="wbPrint">Печать / Сохранить в PDF</button></div>
        ${Object.keys(groups).map(k=>{const g=groups[k];return `<section class="car"><div class="head"><div><h1>Путевой лист социального такси</h1>
          <div class="sub">${h(orgName())} · филиал «${h(CITY_NAMES[editCity])}» · ${date}</div></div>
          <div><b>${h(k)}</b><br>Водитель: ${h(g.car.driver||"________________")}</div></div>
          <table><thead><tr><th>Время</th><th>Откуда</th><th>Куда</th><th>Пассажир</th><th>Телефон</th><th>Пасс.</th><th>Особые отметки</th><th class="s">Отметка о выполнении</th></tr></thead><tbody>
          ${g.items.sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at))).map(x=>{const p=x.payload||{};return `<tr><td class="t">${h((x.scheduled_at||"").slice(11))}</td><td>${h(p.from)}</td><td>${h(p.to)}</td>
            <td>${h(x.client_name)}<br><small>№ ${h(x.num)}</small></td><td>+${h(x.client_phone)}</td><td>${h(p.pax||1)}</td>
            <td>${p.wheelchair?"Коляска. ":""}${p.isFree?"Льготная. ":""}${h(p.comment||"")}${x.staff_note?"<br><i>"+h(x.staff_note)+"</i>":""}</td><td></td></tr>`;}).join("")}
          </tbody></table><div class="sign"><div>Выдал (диспетчер)</div><div>Принял (водитель)</div><div>Показания одометра: выезд ______ / возврат ______</div></div></section>`;}).join("")}
        </body></html>`;
      const w=window.open("","_blank");
      if(!w){showToast("Разрешите всплывающие окна для печати путевого листа");return;}
      w.document.open();w.document.write(html);w.document.close();w.focus();
      /* обработчик — из панели: строгий CSP запрещает onclick в разметке */
      const pb=w.document.getElementById("wbPrint");if(pb)pb.addEventListener("click",()=>w.print());
      setTimeout(()=>{try{w.print();}catch(e){}},400);
    }).catch(e=>showToast(e.message));
  }

  /* ═══ Выезды: заведующий планирует, отслеживает выполнение ═══ */
  let visitDay=null;
  const VST_RU={planned:["Запланирован","warn"],done:["Выполнен","on"],missed:["Не выполнен","off"],cancelled:["Отменён","off"]};
  function staffLogin(p){const m=/^([^@\s]+)@/.exec(p.email||"");return m?m[1].toLowerCase():"";}
  function renderVisits(body){
    if(!visitDay)visitDay=isoDay(0);
    const staff=(branchContent[editCity].staff||[]).filter(p=>staffLogin(p));
    body.innerHTML=head("Выезды — "+CITY_NAMES[editCity],"План выездов сотрудников к получателям услуг и отметки о выполнении. Сотрудник видит свой список в разделе «Мои выезды».")+
      `<div class="adm2-toolbar"><div class="adm2-seg">${[[0,"Сегодня"],[1,"Завтра"]].map(([d,l])=>`<button type="button" class="adm2-seg-b${visitDay===isoDay(d)?" on":""}" data-vd="${d}">${l}</button>`).join("")}</div>
        <input type="date" class="adm2-inp date" id="vDay" value="${visitDay}" aria-label="Дата">
        <button type="button" class="adm2-btn ghost" id="vXlsx">${window.ico("download")} Excel</button>
        <button type="button" class="adm2-btn" id="vAddBtn">${window.ico("plus")} Выезд</button></div>
      <div class="adm2-post adm2-vform" id="vForm" hidden>
        <b style="font-size:15px">Новый выезд на ${visitDay.split("-").reverse().join(".")}</b>
        <div class="adm2-form pad" style="padding:0">
          <label class="adm2-fld"><span>Сотрудник</span><select class="adm2-inp" id="vEmp">${staff.map(p=>`<option value="${esc(staffLogin(p))}" data-name="${esc(p.name)}">${esc(p.name)} — ${esc(p.pos)}</option>`).join("")}<option value="">Другой — ввести учётную запись</option></select>
            <input class="adm2-inp" id="vEmpLogin" placeholder="фамилия@yg.loc" ${staff.length?"hidden":""}></label>
          <label class="adm2-fld"><span>Время (необязательно)</span><input type="time" class="adm2-inp time" id="vTime"></label>
          <label class="adm2-fld"><span>Получатель (ФИО)</span><input class="adm2-inp" id="vClient" placeholder="Фамилия Имя Отчество"></label>
          <label class="adm2-fld"><span>Телефон</span><input class="adm2-inp" id="vPhone" inputmode="tel" placeholder="+7 ..."></label>
          <label class="adm2-fld wide"><span>Адрес</span><input class="adm2-inp" id="vAddr" placeholder="мкр., дом, квартира"></label>
          <label class="adm2-fld wide"><span>Что сделать</span><input class="adm2-inp" id="vServ" placeholder="Например: уборка, покупка продуктов, сопровождение в поликлинику"></label>
          <label class="adm2-fld wide"><span>Указания (необязательно)</span><input class="adm2-inp" id="vNote" placeholder="Например: домофон не работает, позвонить заранее"></label>
        </div>
        <div class="adm2-actions"><button type="button" class="adm2-btn" id="vSave">Добавить выезд</button><button type="button" class="adm2-btn ghost" id="vCancel">Отмена</button></div>
      </div>
      <div id="vList"><div class="adm2-empty">Загрузка…</div></div>`;
    body.querySelectorAll("[data-vd]").forEach(b=>b.onclick=()=>{visitDay=isoDay(+b.dataset.vd);renderVisits(body);});
    body.querySelector("#vDay").onchange=e=>{if(e.target.value){visitDay=e.target.value;renderVisits(body);}};
    body.querySelector("#vXlsx").onclick=()=>downloadFile("/admin/export/visits.xlsx?"+new URLSearchParams({from:visitDay,to:visitDay,branch:brKey(editCity)}),"Выезды_"+visitDay+".xlsx");
    const form=body.querySelector("#vForm");
    body.querySelector("#vAddBtn").onclick=()=>{form.hidden=!form.hidden;if(!form.hidden)body.querySelector("#vClient").focus();};
    body.querySelector("#vCancel").onclick=()=>{form.hidden=true;};
    const emp=body.querySelector("#vEmp"),empL=body.querySelector("#vEmpLogin");
    emp.onchange=()=>{empL.hidden=!!emp.value;};
    body.querySelector("#vSave").onclick=()=>{
      const opt=emp.selectedOptions[0];
      const item={branch:brKey(editCity),day:visitDay,time_from:body.querySelector("#vTime").value,employee_login:emp.value||empL.value.trim(),
        employee_name:emp.value?opt.dataset.name:empL.value.trim(),client_name:body.querySelector("#vClient").value.trim(),
        client_phone:body.querySelector("#vPhone").value,client_address:body.querySelector("#vAddr").value.trim(),
        services:body.querySelector("#vServ").value.trim(),note:body.querySelector("#vNote").value.trim()};
      apiCall("POST","/admin/visits",item).then(()=>{showToast("Выезд добавлен");renderVisits(body);}).catch(e=>showToast(e.message));
    };
    apiCall("GET","/admin/visits?"+new URLSearchParams({day:visitDay,branch:brKey(editCity)})).then(d=>{
      const list=body.querySelector("#vList");
      if(!d.items.length){list.innerHTML='<div class="adm2-empty">На '+visitDay.split("-").reverse().join(".")+' выездов нет. Нажмите «+ Выезд».</div>';return;}
      const by={};d.items.forEach(v=>{const k=v.employee_name||v.employee_login;(by[k]=by[k]||[]).push(v);});
      const total=d.items.length,done=d.items.filter(v=>v.status==="done").length,missed=d.items.filter(v=>v.status==="missed").length;
      list.innerHTML=`<div class="adm2-kpis" style="grid-template-columns:repeat(4,1fr);margin-bottom:14px"><div><b>${total}</b><span>выездов</span></div><div><b>${done}</b><span>выполнено</span></div><div><b>${missed}</b><span>не выполнено</span></div><div><b>${total-done-missed-d.items.filter(v=>v.status==="cancelled").length}</b><span>в работе</span></div></div>`+
        Object.keys(by).map(emp=>{const vs=by[emp],dn=vs.filter(v=>v.status==="done").length;return `<section class="adm2-sec open"><div class="adm2-sec-head"><span class="adm2-sec-name">${esc(emp)}</span><span class="adm2-count ${dn===vs.length?"ok":""}">${dn} / ${vs.length}</span></div>
          <div class="adm2-people">${vs.map(v=>`<div class="adm2-visit" data-vid="${v.id}">
            <div class="adm2-visit-t">${esc(v.time_from||"—")}</div>
            <div class="adm2-visit-b"><b>${esc(v.client_name)}</b><span>${window.ico("pin")} ${esc(v.client_address)}${v.client_phone?` · <a href="tel:+${esc(v.client_phone)}">+${esc(v.client_phone)}</a>`:""}</span>
              ${v.services?`<span>${esc(v.services)}</span>`:""}${v.note?`<span class="adm2-visit-note">${esc(v.note)}</span>`:""}
              ${v.result_note?`<span class="adm2-visit-res">Отметка сотрудника: ${esc(v.result_note)}</span>`:""}</div>
            <span class="adm2-badge ${VST_RU[v.status][1]}">${VST_RU[v.status][0]}</span>
            <div class="adm2-visit-act"><select class="adm2-inp" data-vst aria-label="Статус">${Object.keys(VST_RU).map(k=>`<option value="${k}"${v.status===k?" selected":""}>${VST_RU[k][0]}</option>`).join("")}</select>
              <button type="button" class="adm2-icon-btn danger" data-vdel aria-label="Удалить выезд">${window.ico("trash")}</button></div>
          </div>`).join("")}</div></section>`;}).join("");
      list.querySelectorAll("[data-vst]").forEach(sel=>sel.onchange=()=>{const id=sel.closest("[data-vid]").dataset.vid;apiCall("PATCH","/admin/visits/"+id,{status:sel.value}).then(()=>{showToast("Статус изменён");renderVisits(body);}).catch(e=>showToast(e.message));});
      list.querySelectorAll("[data-vdel]").forEach(b=>b.onclick=()=>{if(!confirm("Удалить выезд?"))return;const id=b.closest("[data-vid]").dataset.vid;apiCall("DELETE","/admin/visits/"+id).then(()=>renderVisits(body)).catch(e=>showToast(e.message));});
    }).catch(e=>{body.querySelector("#vList").innerHTML='<div class="adm2-empty">'+esc(e.message)+'</div>';});
  }

  /* ═══ Мои выезды: сотрудник видит свой список и отмечает выполнение ═══ */
  let myDay=null;
  function renderMyVisits(body){
    if(!myDay)myDay=isoDay(0);
    body.innerHTML=head("Мои выезды",(me.displayName||me.login)+" · список получателей на день. Отметьте каждый выезд — заведующий видит отметки сразу.")+
      `<div class="adm2-toolbar"><div class="adm2-seg">${[[0,"Сегодня"],[1,"Завтра"]].map(([d,l])=>`<button type="button" class="adm2-seg-b${myDay===isoDay(d)?" on":""}" data-md="${d}">${l}</button>`).join("")}</div>
        <button type="button" class="adm2-btn ghost" id="mRefresh">↻ Обновить</button></div><div id="mList"><div class="adm2-empty">Загрузка…</div></div>`;
    body.querySelectorAll("[data-md]").forEach(b=>b.onclick=()=>{myDay=isoDay(+b.dataset.md);renderMyVisits(body);});
    body.querySelector("#mRefresh").onclick=()=>renderMyVisits(body);
    apiCall("GET","/admin/visits?"+new URLSearchParams({day:myDay,mine:"1"})).then(d=>{
      const list=body.querySelector("#mList");
      if(!d.items.length){list.innerHTML='<div class="adm2-empty">На этот день выездов нет.</div>';return;}
      list.innerHTML=d.items.map((v,i)=>`<article class="adm2-post adm2-myvisit ${v.status}" data-vid="${v.id}">
        <div class="adm2-row"><span class="adm2-myvisit-n">${i+1}</span><b class="adm2-myvisit-time">${esc(v.time_from||"В течение дня")}</b><span class="adm2-badge ${VST_RU[v.status][1]}" style="margin-left:auto">${VST_RU[v.status][0]}</span></div>
        <div class="adm2-myvisit-name">${esc(v.client_name)}</div>
        <div class="adm2-myvisit-line">${window.ico("pin")} <a href="https://yandex.ru/maps/?text=${encodeURIComponent(v.client_address+", "+(brLabel(v.branch)))}" target="_blank" rel="noopener">${esc(v.client_address)}</a></div>
        ${v.client_phone?`<div class="adm2-myvisit-line">${window.ico("phone")} <a href="tel:+${esc(v.client_phone)}">+${esc(v.client_phone)}</a></div>`:""}
        ${v.services?`<div class="adm2-myvisit-line">${window.ico("list")} ${esc(v.services)}</div>`:""}
        ${v.note?`<div class="adm2-visit-note">${esc(v.note)}</div>`:""}
        <input class="adm2-inp" data-mres value="${esc(v.result_note||"")}" placeholder="Комментарий: что сделано или почему не выполнено">
        <div class="adm2-actions"><button type="button" class="adm2-btn" data-mst="done">${window.ico("check")} Выполнено</button>
          <button type="button" class="adm2-btn ghost" data-mst="missed">Не выполнено</button>${v.status!=="planned"?'<button type="button" class="adm2-btn ghost" data-mst="planned">Вернуть в план</button>':""}</div>
      </article>`).join("");
      list.querySelectorAll("[data-mst]").forEach(b=>b.onclick=()=>{
        const card=b.closest("[data-vid]"),res=card.querySelector("[data-mres]").value.trim();
        if(b.dataset.mst==="missed"&&!res){showToast("Напишите, почему выезд не выполнен");card.querySelector("[data-mres]").focus();return;}
        apiCall("PATCH","/admin/visits/"+card.dataset.vid,{status:b.dataset.mst,result_note:res}).then(()=>{showToast("Отмечено");renderMyVisits(body);}).catch(e=>showToast(e.message));
      });
    }).catch(e=>{body.querySelector("#mList").innerHTML='<div class="adm2-empty">'+esc(e.message)+'</div>';});
  }

  /* ═══ Оформление: название, логотип, аватар бота, цвета, эффекты ═══ */
  const BRAND_PRESETS=[["#3f8f87","Гармония — бирюзовый"],["#2f5fb3","Северный синий"],["#1f7a4d","Таёжный зелёный"],["#8a3a5c","Брусничный"],
    ["#5b4bb7","Сиреневый"],["#b8741a","Янтарный"],["#2b7a9b","Ледяной голубой"],["#7a4a2b","Оленья кожа"]];
  function renderBrand(body){
    const D=window.GBrand.DEFAULT;
    const b=Object.assign({},D,G.getBrand()||{});b.effects=Object.assign({},D.effects,(G.getBrand()||{}).effects||{});
    const save=()=>{G.setBrand(b);touch();};
    body.innerHTML=head("Оформление","Название, логотип, изображение чат-бота, цвета и эффекты. Изменения видны сразу здесь; жители увидят их после публикации.")+
      `<div class="adm2-brand" data-brand-raw>
        <div class="adm2-post"><b class="adm2-h3">Название</b>
          <div class="adm2-form pad" style="padding:0">
            <label class="adm2-fld"><span>Короткое название</span><input class="adm2-inp strong" data-b="name" value="${esc(b.name)}" maxlength="40"><small>В шапке приложения и в имени чат-бота: «Чат-бот «${esc(b.name)}»»</small></label>
            <label class="adm2-fld"><span>В родительном падеже</span><input class="adm2-inp" data-b="nameGen" value="${esc(b.nameGen)}" maxlength="40"><small>Например: «новости центра ${esc(b.nameGen)}»</small></label>
            <label class="adm2-fld wide"><span>Полное название организации</span><input class="adm2-inp" data-b="org" value="${esc(b.org)}" maxlength="160"></label>
            <label class="adm2-fld"><span>Группа ВКонтакте</span><input class="adm2-inp" data-b="vk" value="${esc(b.vk||"")}" placeholder="https://vk.ru/имя_группы" maxlength="120"><small>Пусто — раздел «Группа ВК» у жителей скрыт</small></label>
            <label class="adm2-fld"><span>ID сообщества ВК (число)</span><input class="adm2-inp" data-b="vkId" value="${esc(b.vkId||"")}" inputmode="numeric" maxlength="12" placeholder="Для ленты новостей группы"><small>Без ID жители увидят кнопку «Открыть группу»</small></label>
          </div></div>
        <div class="adm2-post"><b class="adm2-h3">Логотип и чат-бот</b>
          <div class="adm2-brand-imgs">
            <div class="adm2-brand-img"><img src="${esc(b.logo||"img/logo-icon.png")}" alt="" data-bprev="logo"><div><b>Логотип</b><small>Квадратная картинка, лучше PNG с прозрачным фоном</small>
              <div class="adm2-row"><button type="button" class="adm2-btn ghost sm" data-bup="logo">${window.ico("upload")} Загрузить</button>${b.logo?'<button type="button" class="adm2-link" data-breset="logo">Вернуть стандартный</button>':""}</div></div></div>
            <div class="adm2-brand-img"><img src="${esc(b.botAvatar||"img/bot-avatar.jpg")}" alt="" data-bprev="botAvatar" class="round"><div><b>Изображение чат-бота</b><small>Квадратное фото или рисунок помощника</small>
              <div class="adm2-row"><button type="button" class="adm2-btn ghost sm" data-bup="botAvatar">${window.ico("upload")} Загрузить</button>${b.botAvatar?'<button type="button" class="adm2-link" data-breset="botAvatar">Вернуть стандартный</button>':""}</div></div></div>
          </div></div>
        <div class="adm2-post"><b class="adm2-h3">Цвет</b>
          <div class="adm2-swatches">${BRAND_PRESETS.map(([c,l])=>`<button type="button" class="adm2-swatch${b.accent.toLowerCase()===c?" on":""}" data-sw="${c}" title="${esc(l)}" aria-label="${esc(l)}"><i style="background:${c}"></i><span>${esc(l)}</span></button>`).join("")}</div>
          <div class="adm2-row" style="margin-top:6px"><label class="adm2-inline">Свой цвет <input type="color" id="bColor" value="${esc(b.accent)}" aria-label="Свой цвет"></label>
            <input class="adm2-inp" id="bHex" value="${esc(b.accent)}" maxlength="7" style="width:120px;flex:0 0 120px" aria-label="Код цвета">
            <span class="adm2-note">Весь интерфейс перекрашивается в оттенки выбранного цвета.</span></div></div>
        <div class="adm2-post"><b class="adm2-h3">Визуальные эффекты</b>
          ${[["animations","Анимации","плавные появления, анимированный помощник"],["seasonal","Сезонные поздравления","праздничные карточки на главной"],["decor","Декоративные фоны","мягкие цветные пятна и блики"],["glass","Эффект стекла","размытие под панелями (на слабых устройствах лучше выключить)"]].map(([k,l,d])=>
            `<label class="adm2-check adm2-fx"><input type="checkbox" data-fx="${k}"${b.effects[k]?" checked":""}><span><b>${l}</b><small>${d}</small></span></label>`).join("")}
        </div>
        <div class="adm2-actions"><button type="button" class="adm2-btn danger" id="bReset">Вернуть оформление по умолчанию</button></div>
      </div>`;
    body.querySelectorAll("[data-b]").forEach(i=>i.oninput=()=>{b[i.dataset.b]=i.value;save();});
    body.querySelectorAll("[data-bup]").forEach(btn=>btn.onclick=()=>{
      const k=btn.dataset.bup;
      pickAndResizeImage(url=>{b[k]=url;save();flushSave();renderBrand(body);},k==="logo"?256:384);
    });
    body.querySelectorAll("[data-breset]").forEach(btn=>btn.onclick=()=>{b[btn.dataset.breset]="";save();renderBrand(body);});
    const setColor=c=>{if(!/^#[0-9a-f]{6}$/i.test(c))return;b.accent=c.toLowerCase();save();
      body.querySelectorAll(".adm2-swatch").forEach(x=>x.classList.toggle("on",x.dataset.sw===b.accent));
      body.querySelector("#bColor").value=b.accent;body.querySelector("#bHex").value=b.accent;};
    body.querySelectorAll("[data-sw]").forEach(x=>x.onclick=()=>setColor(x.dataset.sw));
    body.querySelector("#bColor").oninput=e=>setColor(e.target.value);
    body.querySelector("#bHex").onchange=e=>{let v=e.target.value.trim();if(v[0]!=="#")v="#"+v;if(/^#[0-9a-f]{6}$/i.test(v))setColor(v);else{showToast("Код цвета: # и 6 знаков, например #2f5fb3");e.target.value=b.accent;}};
    body.querySelectorAll("[data-fx]").forEach(x=>x.onchange=()=>{b.effects[x.dataset.fx]=x.checked;save();});
    body.querySelector("#bReset").onclick=()=>{
      if(!confirm("Вернуть стандартное оформление: название, логотип, цвета и эффекты?"))return;
      const prev=G.getBrand();G.setBrand(null);touch();renderBrand(body);
      undoable("Оформление сброшено",()=>{G.setBrand(prev);});
    };
  }

  /* ═══ Филиалы: добавить, переименовать, упорядочить, удалить ═══ */
  const TRANSLIT={а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"sch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya"};
  function slugify(s){
    let t=String(s||"").toLowerCase().replace(/^(г\.|пгт\.|мкр\.|с\.|п\.)\s*/,"").split("").map(c=>TRANSLIT[c]!==undefined?TRANSLIT[c]:c).join("");
    t=t.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,30);
    if(t.length<2)t="branch";
    let id=t,i=2;while(cityData[id])id=t+"-"+(i++);
    return id;
  }
  function renderBranches(body){
    const ids=BRANCH_REGISTRY.map(b=>b.id);
    body.innerHTML=head("Филиалы","Список филиалов центра. Новый филиал появится у жителей после публикации; контакты, услуги и сотрудников заполните в соответствующих разделах.")+
      `<div class="adm2-post"><b class="adm2-h3">Новый филиал</b><div class="adm2-row">
        <input class="adm2-inp grow" id="brName" placeholder="Название, например: г. Новый Уренгой" style="flex:1;min-width:220px">
        <select class="adm2-inp" id="brCopy" style="max-width:280px" aria-label="Заполнить"><option value="">Пустой филиал</option>${ids.map(id=>`<option value="${id}">Копия данных: ${esc(branchName(id))}</option>`).join("")}</select>
        <button type="button" class="adm2-btn" id="brAdd">${window.ico("plus")} Добавить</button></div>
        <small class="adm2-note">Копия переносит контакты, услуги, сотрудников, машины и смены выбранного филиала — затем их можно поправить.</small></div>
      <div class="adm2-branches">${BRANCH_REGISTRY.map((br,i)=>{const bc=branchContent[br.id]||{services:[],staff:[]};const n=bc.services.reduce((s,c)=>s+c.items.length,0);return `<div class="adm2-branch" data-bid="${br.id}">
        <span class="adm2-cat-ic">${window.ico("building")}</span>
        <input class="adm2-inp strong" data-brn="${br.id}" value="${esc(br.name)}" aria-label="Название филиала">
        <span class="adm2-note">${n} ${plural(n,["услуга","услуги","услуг"])} · ${bc.staff.length} ${plural(bc.staff.length,["сотрудник","сотрудника","сотрудников"])} · код <code>${br.id}</code></span>
        <div class="adm2-car-moves"><button type="button" class="adm2-icon-btn" data-bup2="${i}" ${i===0?"disabled":""} aria-label="Выше">↑</button>
          <button type="button" class="adm2-icon-btn" data-bdown="${i}" ${i===BRANCH_REGISTRY.length-1?"disabled":""} aria-label="Ниже">↓</button>
          <button type="button" class="adm2-icon-btn danger" data-bdel="${br.id}" aria-label="Удалить филиал" ${BRANCH_REGISTRY.length<2?"disabled":""}>${window.ico("trash")}</button></div></div>`;}).join("")}</div>`;
    body.querySelector("#brAdd").onclick=()=>{
      const name=body.querySelector("#brName").value.trim();
      if(name.length<2){showToast("Укажите название филиала");return;}
      if(BRANCH_REGISTRY.some(b=>b.name.toLowerCase()===name.toLowerCase())){showToast("Филиал с таким названием уже есть");return;}
      const id=slugify(name);
      if(!addBranch(id,name,body.querySelector("#brCopy").value||null)){showToast("Не удалось добавить филиал");return;}
      touch();refreshCitySelect();showToast("Филиал «"+name+"» добавлен");renderBranches(body);
    };
    body.querySelectorAll("[data-brn]").forEach(i=>i.oninput=()=>{const b=BRANCH_REGISTRY.find(x=>x.id===i.dataset.brn);if(b&&i.value.trim()){b.name=i.value.trim();syncBranchMaps();touch();refreshCitySelect();}});
    body.querySelectorAll("[data-bup2]").forEach(x=>x.onclick=()=>{const i=+x.dataset.bup2;[BRANCH_REGISTRY[i-1],BRANCH_REGISTRY[i]]=[BRANCH_REGISTRY[i],BRANCH_REGISTRY[i-1]];syncBranchMaps();touch();refreshCitySelect();renderBranches(body);});
    body.querySelectorAll("[data-bdown]").forEach(x=>x.onclick=()=>{const i=+x.dataset.bdown;[BRANCH_REGISTRY[i+1],BRANCH_REGISTRY[i]]=[BRANCH_REGISTRY[i],BRANCH_REGISTRY[i+1]];syncBranchMaps();touch();refreshCitySelect();renderBranches(body);});
    body.querySelectorAll("[data-bdel]").forEach(x=>x.onclick=()=>{
      const id=x.dataset.bdel,br=BRANCH_REGISTRY.find(b=>b.id===id),bc=branchContent[id];
      const n=bc.services.reduce((s,c)=>s+c.items.length,0);
      if(!confirm("Удалить филиал «"+br.name+"»?"+(n||bc.staff.length?"\nВместе с ним удалятся "+n+" услуг и "+bc.staff.length+" сотрудников.":"")+"\nДо публикации удаление можно отменить."))return;
      const pos=BRANCH_REGISTRY.indexOf(br),saved={reg:Object.assign({},br),cd:cityData[id],bc:bc};
      removeBranch(id);if(editCity===id)editCity=firstBranch();
      touch();refreshCitySelect();renderBranches(body);
      undoable("Филиал удалён",()=>{cityData[id]=saved.cd;branchContent[id]=saved.bc;BRANCH_REGISTRY.splice(pos,0,saved.reg);syncBranchMaps();refreshCitySelect();});
    });
  }
  function refreshCitySelect(){
    const sel=document.getElementById("admCity");if(!sel)return;
    if(!cityData[editCity])editCity=firstBranch();
    sel.innerHTML=Object.keys(CITY_NAMES).filter(c=>!myBranches()||myBranches().includes(c)).map(c=>`<option value="${c}" ${c===editCity?"selected":""}>${esc(CITY_NAMES[c])}</option>`).join("");
  }

  /* ═══ Центры платформы «Социальные услуги ЯНАО» ═══ */
  function centerSelectHtml(){
    if(!window.GCenters)return "";
    const allowed=myCenters();
    const ids=GCenters.order().filter(id=>!allowed||allowed.includes(id));
    return `<label class="adm2-city adm2-center"><span>Центр</span>
      <select id="admCenter">${ids.map(id=>`<option value="${id}" ${id===GCenters.current()?"selected":""}>${esc(GCenters.centerName(GCenters.get(id)))}</option>`).join("")}</select></label>`;
  }
  function switchCenter(id){
    flushSave();
    GCenters.switchTo(id,{admin:true,noSave:!!window.SOCUSLUGI_ADMIN_APP});
    editCity=(myBranches()&&myBranches()[0])||firstBranch();
    svcFilter="";staffFilter="";openCats={};openDepts={};
    renderShell(document.getElementById("adminFs"));
  }
  function ensureAllowedCenter(){
    if(!window.GCenters)return;
    const allowed=myCenters();
    if(allowed&&!allowed.includes(GCenters.current())&&GCenters.get(allowed[0]))GCenters.switchTo(allowed[0],{admin:true,noSave:true});
  }
  const C_TRANS=TRANSLIT;
  function centerSlug(name){
    let t=String(name||"").toLowerCase().replace(/цсон|центр|гбу|янао|[«»"]/g," ").split("").map(c=>C_TRANS[c]!==undefined?C_TRANS[c]:c).join("");
    t=t.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,30);if(t.length<2)t="center";
    let id=t,i=2;while(GCenters.get(id))id=t+"-"+(i++);return id;
  }
  function renderCenters(body){
    const P=GCenters.getPlatformRaw(),PI=GCenters.platform();
    const ids=GCenters.order();
    const tpls=GCenters.templates().filter(t=>!GCenters.get(t.id));
    body.innerHTML=head("Центры","Платформа «"+esc(PI.name)+"»: центры социального обслуживания, их порядок и видимость для жителей. Выбранный в боковой панели центр редактируется во всех остальных разделах.")+
      `<div class="adm2-post" data-brand-raw><b class="adm2-h3">Платформа</b>
        <div class="adm2-brand-img" style="margin-bottom:6px"><img src="${esc(PI.logo)}" alt=""><div><b>Логотип платформы</b><small>На экране выбора центра</small>
          <div class="adm2-row"><button type="button" class="adm2-btn ghost sm" id="plLogo">${window.ico("upload")} Загрузить</button>${P.logo?'<button type="button" class="adm2-link" id="plLogoReset">Вернуть стандартный</button>':""}</div></div></div>
        <div class="adm2-form pad" style="padding:0">
          <label class="adm2-fld"><span>Название платформы</span><input class="adm2-inp strong" data-pf="name" value="${esc(PI.name)}" maxlength="60"></label>
          <label class="adm2-fld"><span>Подпись</span><input class="adm2-inp" data-pf="org" value="${esc(PI.org)}" maxlength="120"></label>
          <label class="adm2-fld wide"><span>Заголовок списка центров</span><input class="adm2-inp" data-pf="title" value="${esc(PI.title)}" maxlength="120"></label>
          <label class="adm2-fld wide"><span>Подпись кнопки «Заказать социальное такси»</span><input class="adm2-inp" data-pf="taxiText" value="${esc(PI.taxiText)}" maxlength="80"></label>
        </div></div>
      <div class="adm2-post"><b class="adm2-h3">Новый центр</b><div class="adm2-row">
        <input class="adm2-inp" id="cName" placeholder="Название, например: Забота" style="flex:1;min-width:200px">
        <select class="adm2-inp" id="cSrc" style="max-width:320px" aria-label="Основа">
          <option value="">Пустой центр (один филиал)</option>
          ${tpls.map(t=>`<option value="tpl:${t.id}">Шаблон: ${esc(t.brand.org)}</option>`).join("")}
          ${ids.map(id=>`<option value="copy:${id}">Копия: ${esc(GCenters.centerName(GCenters.get(id)))}</option>`).join("")}
        </select>
        <button type="button" class="adm2-btn" id="cAdd">${window.ico("plus")} Создать</button></div>
        <small class="adm2-note">Шаблоны — реальные центры округа (название и адрес из открытых реестров, проверьте). Услуги, сотрудников и цены каждый центр заполняет сам.</small></div>
      <div class="adm2-branches">${ids.map((id,i)=>{const c=GCenters.get(id);const brs=c.branches||[];
        const n=brs.reduce((s,b)=>{const bc=c.branchContent&&c.branchContent[b.id];return s+(bc?bc.services.reduce((a,k)=>a+k.items.length,0):0);},0);
        return `<div class="adm2-center-row${id===GCenters.current()?" cur":""}" data-cid="${id}">
          <span class="adm2-center-logo" style="--c:${esc((c.brand&&c.brand.accent)||"#3f8f87")}"><img src="${esc(GCenters.centerLogo(c))}" alt=""></span>
          <div class="adm2-center-txt"><b>${esc(GCenters.centerName(c))}</b><small>${esc((c.brand&&c.brand.org)||(id==="garmoniya"?"ГБУ ЯНАО «ЦСОН «Гармония»":""))}</small>
            <small>${brs.length} ${plural(brs.length,["филиал","филиала","филиалов"])} · ${n} ${plural(n,["услуга","услуги","услуг"])} · код <code>${id}</code>${id===GCenters.HOME?" · основной центр":""}</small></div>
          <label class="adm2-check" title="Показывать жителям в списке центров"><input type="checkbox" data-cvis="${id}"${c.visible!==false?" checked":""}> Виден жителям</label>
          <div class="adm2-car-moves">
            <button type="button" class="adm2-btn ghost sm" data-copen="${id}">${id===GCenters.current()?"Редактируется":"Редактировать"}</button>
            <button type="button" class="adm2-icon-btn" data-cup="${id}" ${i===0?"disabled":""} aria-label="Выше">↑</button>
            <button type="button" class="adm2-icon-btn" data-cdown="${id}" ${i===ids.length-1?"disabled":""} aria-label="Ниже">↓</button>
            <button type="button" class="adm2-icon-btn danger" data-cdel="${id}" ${id===GCenters.HOME||ids.length<2?"disabled title=\"Основной центр не удаляется — его можно скрыть\"":""} aria-label="Удалить центр">${window.ico("trash")}</button>
          </div></div>`;}).join("")}</div>`;
    const P2=GCenters.getPlatformRaw();
    body.querySelectorAll("[data-pf]").forEach(i=>i.oninput=()=>{P2[i.dataset.pf]=i.value.trim();GCenters.setPlatform(P2);touch();});
    body.querySelector("#plLogo").onclick=()=>pickAndResizeImage(url=>{P2.logo=url;GCenters.setPlatform(P2);touch();flushSave();renderCenters(body);},256);
    const plr=body.querySelector("#plLogoReset");if(plr)plr.onclick=()=>{delete P2.logo;GCenters.setPlatform(P2);touch();renderCenters(body);};
    body.querySelector("#cAdd").onclick=()=>{
      const name=body.querySelector("#cName").value.trim(),src=body.querySelector("#cSrc").value;
      let data,id;
      if(src.startsWith("tpl:")){data=GCenters.templates().find(t=>t.id===src.slice(4));id=data.id;if(name){data.brand.name=name;data.brand.nameGen=name;}}
      else{
        if(name.length<2){showToast("Укажите название центра");return;}
        if(src.startsWith("copy:")){GCenters.capture();data=JSON.parse(JSON.stringify(GCenters.get(src.slice(5))));data.brand=Object.assign({},data.brand||{},{name:name,nameGen:name,org:"ГБУ ЯНАО «ЦСОН «"+name+"»"});}
        else data=GCenters.emptyCenter(name);
        data.template=false;id=centerSlug(name);
      }
      if(!data||!GCenters.addCenter(id,data)){showToast("Не удалось создать центр");return;}
      touch();showToast("Центр «"+GCenters.centerName(data)+"» добавлен — заполните его разделы");
      switchCenter(id);switchTab("brand");
    };
    body.querySelectorAll("[data-cvis]").forEach(x=>x.onchange=()=>{const c=GCenters.get(x.dataset.cvis);c.visible=x.checked;touch();});
    body.querySelectorAll("[data-copen]").forEach(x=>x.onclick=()=>{if(x.dataset.copen!==GCenters.current()){switchCenter(x.dataset.copen);switchTab("centers");}});
    body.querySelectorAll("[data-cup]").forEach(x=>x.onclick=()=>{GCenters.move(x.dataset.cup,-1);touch();renderCenters(body);});
    body.querySelectorAll("[data-cdown]").forEach(x=>x.onclick=()=>{GCenters.move(x.dataset.cdown,1);touch();renderCenters(body);});
    body.querySelectorAll("[data-cdel]").forEach(x=>x.onclick=()=>{
      const id=x.dataset.cdel,c=GCenters.get(id);
      if(!confirm("Удалить центр «"+GCenters.centerName(c)+"» со всеми филиалами, услугами и сотрудниками?\nДо публикации удаление можно отменить."))return;
      const wasCur=GCenters.current()===id;GCenters.capture();const saved=GCenters.removeCenter(id);if(!saved)return;
      touch();
      if(wasCur){editCity=firstBranch();renderShell(document.getElementById("adminFs"));switchTab("centers");}else renderCenters(body);
      undoable("Центр удалён",()=>{GCenters.restoreCenter(id,saved);});
    });
  }

  /* ═══ Запись к специалистам: направления, услуги, специалисты, формат приёма ═══ */
  const bkOpen=new Set();
  function renderBooking(body){
    const bc=branchContent[editCity];
    if(!Array.isArray(bc.booking))bc.booking=[];
    const B=bc.booking,svc=bc.services,staff=bc.staff;
    const surname=n=>String(n||"").trim().split(/\s+/)[0];
    /* цены в записи берутся из прейскуранта (по названию услуги) */
    B.forEach(d=>{const cat=svc.find(c=>c.id===d.catId);if(!cat)return;(d.subs||[]).forEach(sb=>(sb.items||[]).forEach(it=>{const s=cat.items.find(x=>x.n===it.n);if(s){it.p=s.p;it.m=s.m!=null?s.m:null;}}));});
    body.innerHTML=head("Запись к специалистам — "+CITY_NAMES[editCity],"Жители записываются на время: направление → услуга → специалист → дата и время. Цены берутся из прейскуранта, время — из режима работы филиала (обед учитывается).")+
      (B.length?"":`<div class="adm2-empty adm2-empty-big">${window.ico("calendar")}<b>Запись на время не настроена</b><span>Создайте направления вручную или одной кнопкой — по разделам прейскуранта.</span>
        <div class="adm2-row" style="justify-content:center"><button type="button" class="adm2-btn" id="bkAuto" ${svc.length?"":"disabled"}>Создать по разделам прейскуранта</button></div>
        ${svc.length?"":'<small class="adm2-note">Сначала заполните «Услуги» этого филиала.</small>'}</div>`)+
      `<div id="bkList">${B.map((d,di)=>{const cat=svc.find(c=>c.id===d.catId);return `<section class="adm2-post adm2-bk" data-di="${di}">
        <div class="adm2-row"><span class="adm2-cat-ic">${window.catIco(cat||d.title)}</span>
          <input class="adm2-inp strong" data-bkt="${di}" value="${esc(d.title)}" placeholder="Название направления" style="flex:1">
          <div class="adm2-car-moves"><button type="button" class="adm2-icon-btn" data-bkup="${di}" ${di?"":"disabled"} aria-label="Выше">↑</button><button type="button" class="adm2-icon-btn" data-bkdown="${di}" ${di<B.length-1?"":"disabled"} aria-label="Ниже">↓</button>
          <button type="button" class="adm2-icon-btn danger" data-bkdel="${di}" aria-label="Удалить направление">${window.ico("trash")}</button></div></div>
        <div class="adm2-form pad" style="padding:0">
          <label class="adm2-fld"><span>Раздел прейскуранта</span><select class="adm2-inp" data-bkcat="${di}"><option value="">— выберите —</option>${svc.map(c=>`<option value="${c.id}"${c.id===d.catId?" selected":""}>${esc(c.name)}</option>`).join("")}</select></label>
          <div class="adm2-fld"><span>Специалисты</span><div class="adm2-chips">${staff.length?(()=>{
            /* выбранные — первыми; остальные свёрнуты, чтобы длинный справочник не загромождал экран */
            const on=p=>(d.resp||[]).includes(surname(p.name));
            const list=staff.slice().sort((a,b)=>on(b)-on(a)),open=bkOpen.has(di),lim=Math.max(10,list.filter(on).length);
            const shown=open?list:list.slice(0,lim);
            return shown.map(p=>`<button type="button" class="adm2-chip${on(p)?" on":""}" data-bkresp="${di}" data-sn="${esc(surname(p.name))}" title="${esc(p.pos)}">${esc(p.name.split(/\s+/).slice(0,2).join(" "))}</button>`).join("")+
              (list.length>lim?`<button type="button" class="adm2-chip more" data-bkmore="${di}">${open?"Свернуть":"Ещё "+(list.length-lim)}</button>`:"");})():'<small class="adm2-note">Заполните «Сотрудники» филиала</small>'}</div></div>
        </div>
        ${(d.subs||[]).map((sb,si)=>`<div class="adm2-bk-sub">
          <div class="adm2-row"><input class="adm2-inp" data-bks="${di}:${si}" value="${esc(sb.t)}" placeholder="Подраздел, например: Индивидуальные занятия" style="flex:1">
            <div class="adm2-seg sm"><button type="button" class="adm2-seg-b${sb.mode!=="group"?" on":""}" data-bkm="${di}:${si}:ind">Индивидуально</button><button type="button" class="adm2-seg-b${sb.mode==="group"?" on":""}" data-bkm="${di}:${si}:group">Группа</button></div>
            ${sb.mode==="group"?`<label class="adm2-inline">мест <input type="number" min="2" max="50" class="adm2-inp" data-bkcap="${di}:${si}" value="${sb.cap||3}" style="width:70px"></label>`:""}
            <button type="button" class="adm2-icon-btn danger" data-bksdel="${di}:${si}" aria-label="Удалить подраздел">${window.ico("trash")}</button></div>
          <div class="adm2-bk-items">${cat?cat.items.map(it=>{const on=(sb.items||[]).some(x=>x.n===it.n);return `<label class="adm2-bk-item${on?" on":""}"><input type="checkbox" data-bki="${di}:${si}" data-n="${esc(it.n)}"${on?" checked":""}><span>${esc(it.n)}</span><b>${it.p!=null?esc(it.p)+" ₽":"—"}</b></label>`;}).join(""):'<small class="adm2-note">Выберите раздел прейскуранта — появятся его услуги.</small>'}</div>
        </div>`).join("")}
        <button type="button" class="adm2-btn ghost sm" data-bksadd="${di}">${window.ico("plus")} Подраздел</button>
      </section>`;}).join("")}</div>
      <div class="adm2-actions"><button type="button" class="adm2-btn" id="bkAdd">${window.ico("plus")} Направление</button></div>`;
    const re=()=>{touch();renderBooking(body);};
    const auto=body.querySelector("#bkAuto");
    if(auto)auto.onclick=()=>{
      svc.forEach(c=>{if(!c.items.length||/перевозк|такси|прокат/i.test(c.name))return;
        B.push({catId:c.id,title:c.name,icon:"",resp:[],subs:[{t:"Индивидуальный приём",mode:"ind",items:c.items.map(i=>({n:i.n,p:i.p,m:i.m!=null?i.m:null}))}]});});
      showToast("Направления созданы — отметьте специалистов");re();
    };
    body.querySelector("#bkAdd").onclick=()=>{B.push({catId:svc[0]?svc[0].id:null,title:"Новое направление",icon:"",resp:[],subs:[{t:"Индивидуальный приём",mode:"ind",items:[]}]});re();};
    body.querySelectorAll("[data-bkt]").forEach(i=>i.oninput=()=>{B[+i.dataset.bkt].title=i.value;touch();});
    body.querySelectorAll("[data-bkcat]").forEach(x=>x.onchange=()=>{const d=B[+x.dataset.bkcat];d.catId=x.value?+x.value||x.value:null;
      const c=svc.find(k=>String(k.id)===String(x.value));if(c){d.catId=c.id;if(!d.title||d.title==="Новое направление")d.title=c.name;}(d.subs||[]).forEach(sb=>sb.items=[]);re();});
    body.querySelectorAll("[data-bkmore]").forEach(x=>x.onclick=()=>{const k=+x.dataset.bkmore;if(bkOpen.has(k))bkOpen.delete(k);else bkOpen.add(k);renderBooking(body);});
    body.querySelectorAll("[data-bkresp]").forEach(x=>x.onclick=()=>{const d=B[+x.dataset.bkresp],sn=x.dataset.sn;d.resp=d.resp||[];
      const i=d.resp.indexOf(sn);if(i>=0)d.resp.splice(i,1);else d.resp.push(sn);x.classList.toggle("on",i<0);touch();});
    body.querySelectorAll("[data-bks]").forEach(i=>i.oninput=()=>{const[a,b]=i.dataset.bks.split(":").map(Number);B[a].subs[b].t=i.value;touch();});
    body.querySelectorAll("[data-bkm]").forEach(x=>x.onclick=()=>{const[a,b,m]=x.dataset.bkm.split(":");const sb=B[+a].subs[+b];sb.mode=m;if(m==="group"&&!sb.cap)sb.cap=3;re();});
    body.querySelectorAll("[data-bkcap]").forEach(i=>i.oninput=()=>{const[a,b]=i.dataset.bkcap.split(":").map(Number);B[a].subs[b].cap=Math.max(2,Math.min(50,parseInt(i.value,10)||3));touch();});
    body.querySelectorAll("[data-bki]").forEach(x=>x.onchange=()=>{const[a,b]=x.dataset.bki.split(":").map(Number);const d=B[a],sb=d.subs[b],cat=svc.find(c=>c.id===d.catId);
      const it=cat&&cat.items.find(k=>k.n===x.dataset.n);sb.items=sb.items||[];
      if(x.checked&&it&&!sb.items.some(k=>k.n===it.n))sb.items.push({n:it.n,p:it.p,m:it.m!=null?it.m:null});
      if(!x.checked)sb.items=sb.items.filter(k=>k.n!==x.dataset.n);
      x.closest(".adm2-bk-item").classList.toggle("on",x.checked);touch();});
    body.querySelectorAll("[data-bksadd]").forEach(x=>x.onclick=()=>{B[+x.dataset.bksadd].subs.push({t:"Групповые занятия",mode:"group",cap:3,items:[]});re();});
    body.querySelectorAll("[data-bksdel]").forEach(x=>x.onclick=()=>{const[a,b]=x.dataset.bksdel.split(":").map(Number);const saved=B[a].subs.splice(b,1)[0];re();undoable("Подраздел удалён",()=>{B[a].subs.splice(b,0,saved);});});
    body.querySelectorAll("[data-bkdel]").forEach(x=>x.onclick=()=>{const a=+x.dataset.bkdel;const saved=B.splice(a,1)[0];re();undoable("Направление удалено",()=>{B.splice(a,0,saved);});});
    body.querySelectorAll("[data-bkup]").forEach(x=>x.onclick=()=>{const a=+x.dataset.bkup;[B[a-1],B[a]]=[B[a],B[a-1]];re();});
    body.querySelectorAll("[data-bkdown]").forEach(x=>x.onclick=()=>{const a=+x.dataset.bkdown;[B[a+1],B[a]]=[B[a],B[a+1]];re();});
  }

  /* ═══ Excel: загрузка и выгрузка прейскуранта и сотрудников ═══ */
  const XL_SVC=["Раздел","Услуга","Цена, ₽","Цена по «Морошке», ₽"];
  const XL_STAFF=["ФИО","Должность","Отделение","Телефон","Добавочный","Почта"];
  const xlNum=v=>{const n=parseFloat(String(v||"").replace(/\s/g,"").replace(",","."));return isFinite(n)?Math.round(n):null;};
  /* колонки ищутся по смыслу заголовка: «Цена» — без «Морошки», «Морошка» — отдельно */
  const XL_KEYS={"Раздел":[/раздел|категори/],"Услуга":[/услуг|наименован|название/],"Цена, ₽":[/цен|стоим/,/морошк/],"Цена по «Морошке», ₽":[/морошк/],
    "ФИО":[/фио|сотрудник|фамил/],"Должность":[/должн/],"Отделение":[/отдел|подраздел/],"Телефон":[/телеф/],"Добавочный":[/доб/],"Почта":[/почт|e-?mail/]};
  function findCols(header,names){
    const h=header.map(x=>String(x).toLowerCase());
    return names.map(n=>{const k=XL_KEYS[n]||[new RegExp(n.toLowerCase())];return h.findIndex(x=>k[0].test(x)&&!(k[1]&&k[1].test(x)));});
  }
  function xlExport(kind){
    const bc=branchContent[editCity],nm=CITY_NAMES[editCity];
    if(kind==="svc"){
      const rows=[XL_SVC];bc.services.forEach(c=>c.items.forEach(i=>rows.push([c.name,i.n,i.p==null?"":i.p,i.m==null?"":i.m])));
      XLite.download(XLite.write([{name:"Прейскурант",rows,widths:[40,80,12,20]}]),"Прейскурант — "+nm+".xlsx");
    }else{
      const rows=[XL_STAFF];bc.staff.forEach(p=>rows.push([p.name,p.pos||"",p.dept||"",p.phone||"",p.ext||"",p.email||""]));
      XLite.download(XLite.write([{name:"Сотрудники",rows,widths:[36,40,40,18,12,30]}]),"Сотрудники — "+nm+".xlsx");
    }
  }
  function xlImport(kind,body){
    XLite.pickFile(file=>{
      XLite.read(file).then(rows=>{
        if(rows.length<2)throw new Error("В таблице нет строк с данными");
        const cols=findCols(rows[0],kind==="svc"?XL_SVC:XL_STAFF);
        if(kind==="svc"&&(cols[0]<0||cols[1]<0))throw new Error("Нужны колонки «Раздел» и «Услуга» в первой строке — скачайте образец");
        if(kind==="staff"&&cols[0]<0)throw new Error("Нужна колонка «ФИО» в первой строке — скачайте образец");
        const items=[],errs=[];
        rows.slice(1).forEach((r,i)=>{const g=k=>cols[k]>=0?(r[cols[k]]||""):"";
          if(kind==="svc"){const it={cat:g(0),n:g(1),p:xlNum(g(2)),m:xlNum(g(3)),row:i+2};
            if(!it.cat||!it.n){errs.push(it.row+": нет раздела или названия");return;}
            if(it.p==null)errs.push(it.row+": нет цены — «"+it.n.slice(0,40)+"»");
            if(it.p!=null&&it.m==null)it.m=moroshkaOf(it.p);
            if(it.m!=null&&it.p!=null&&it.m>it.p)errs.push(it.row+": «Морошка» дороже цены");
            items.push(it);}
          else{const p={name:g(0),pos:g(1),dept:g(2),phone:g(3),ext:g(4),email:g(5),row:i+2};
            if(p.name.split(/\s+/).length<2){errs.push(p.row+": ФИО не полностью — «"+p.name+"»");return;}
            if(p.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))errs.push(p.row+": почта с ошибкой — "+p.email);
            items.push(p);}
        });
        xlPreview(kind,items,errs,file.name,body);
      }).catch(e=>showToast(e.message));
    });
  }
  function xlPreview(kind,items,errs,fname,body){
    const ovl=document.createElement("div");ovl.className="admin-ovl adm2-modal-ovl";
    const cats=kind==="svc"?[...new Set(items.map(i=>i.cat))]:[];
    ovl.innerHTML=`<div class="adm2-modal" role="dialog" aria-modal="true" aria-label="Загрузка из таблицы"><div class="adm2-modal-h"><b>${kind==="svc"?"Прейскурант":"Сотрудники"} из файла</b><span>${esc(fname)} → филиал «${esc(CITY_NAMES[editCity])}»</span></div>
      <div class="adm2-kpis" style="grid-template-columns:repeat(${kind==="svc"?3:2},1fr)">${kind==="svc"?`<div><b>${cats.length}</b><span>разделов</span></div>`:""}<div><b>${items.length}</b><span>${kind==="svc"?"услуг":"сотрудников"}</span></div><div><b class="${errs.length?"warn":""}">${errs.length}</b><span>замечаний</span></div></div>
      ${errs.length?`<div class="adm2-xl-errs">${errs.slice(0,8).map(e=>`<div>Строка ${esc(e)}</div>`).join("")}${errs.length>8?`<div>…и ещё ${errs.length-8}</div>`:""}</div>`:""}
      <div class="adm2-table-wrap adm2-xl-prev"><table class="adm2-table"><thead><tr>${(kind==="svc"?["Раздел","Услуга","Цена","Морошка"]:["ФИО","Должность","Отделение","Телефон"]).map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>
        ${items.slice(0,60).map(i=>kind==="svc"?`<tr><td>${esc(i.cat)}</td><td>${esc(i.n)}</td><td>${i.p==null?'<span class="adm2-bad">нет</span>':esc(i.p)}</td><td>${i.m==null?"—":esc(i.m)}</td></tr>`:`<tr><td>${esc(i.name)}</td><td>${esc(i.pos)}</td><td>${esc(i.dept)}</td><td>${esc(i.phone)}</td></tr>`).join("")}
        ${items.length>60?`<tr><td colspan="4" class="adm2-note">…и ещё ${items.length-60}</td></tr>`:""}</tbody></table></div>
      <div class="adm2-seg" style="margin:10px 0"><button type="button" class="adm2-seg-b on" data-xm="add">Добавить к текущим</button><button type="button" class="adm2-seg-b" data-xm="replace">Заменить ${kind==="svc"?"прейскурант":"список"} филиала</button></div>
      <div class="adm2-actions"><button type="button" class="adm2-btn" id="xlApply" ${items.length?"":"disabled"}>Загрузить</button><button type="button" class="adm2-btn ghost" id="xlCancel">Отмена</button></div></div>`;
    document.body.appendChild(ovl);
    let mode="add";
    ovl.querySelectorAll("[data-xm]").forEach(b=>b.onclick=()=>{mode=b.dataset.xm;ovl.querySelectorAll("[data-xm]").forEach(x=>x.classList.toggle("on",x===b));});
    ovl.querySelector("#xlCancel").onclick=()=>ovl.remove();
    ovl.addEventListener("click",e=>{if(e.target===ovl)ovl.remove();});
    ovl.querySelector("#xlApply").onclick=()=>{
      const bc=branchContent[editCity],before=JSON.parse(JSON.stringify(kind==="svc"?bc.services:bc.staff));
      if(kind==="svc"){
        if(mode==="replace")bc.services.length=0;
        let maxId=bc.services.reduce((m,c)=>Math.max(m,+c.id||0),0);
        items.forEach(i=>{let c=bc.services.find(k=>k.name.toLowerCase()===i.cat.toLowerCase());
          if(!c){c={id:++maxId,name:i.cat,icon:"",items:[]};bc.services.push(c);}
          const ex=c.items.find(k=>k.n===i.n);
          if(ex){ex.p=i.p;ex.m=i.m;}else c.items.push({n:i.n,p:i.p,m:i.m});});
      }else{
        if(mode==="replace")bc.staff.length=0;
        items.forEach(i=>{const ex=bc.staff.find(k=>k.name===i.name);const rec={name:i.name,pos:i.pos,dept:i.dept,phone:i.phone,ext:i.ext,email:i.email};
          if(ex)Object.assign(ex,rec);else bc.staff.push(rec);});
      }
      ovl.remove();touch();refreshActive();(kind==="svc"?renderServices:renderStaff)(body);
      showToast("Загружено: "+items.length);
      undoable("Загрузка из таблицы применена",()=>{const arr=kind==="svc"?bc.services:bc.staff;arr.length=0;before.forEach(x=>arr.push(x));refreshActive();});
    };
  }

  /* ═══ Диспетчерская социального такси — всё в одном месте ═══
     • поездки дня по машинам, живое обновление (новая заявка появляется сразу, со звуком и подсветкой);
     • приём поездки по телефону (с подсказкой адресов из прошлых поездок пассажира);
     • назначение машины, подтверждение, выполнение, отмена;
     • перенос времени и уточнение маршрута — житель видит изменения в приложении;
     • быстрые ответы жителю, история поездок пассажира, накладки по машине;
     • путевые листы, маршрут водителю, Excel. */
  let dispDay=null,dispTimer=null,dispForm=false;
  const DISP_NOTES=["Водитель позвонит за 15 минут до подачи","Машина будет у подъезда","Возьмите документы для льготы","Подача может задержаться на 10–15 минут","Поездка подтверждена"];
  function dayShift(day,n){const d=new Date(day+"T12:00:00");d.setDate(d.getDate()+n);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
  function dayHuman(day){const t=isoDay(0);const w=["вс","пн","вт","ср","чт","пт","сб"][new Date(day+"T12:00:00").getDay()];
    return (day===t?"Сегодня":day===isoDay(1)?"Завтра":day===isoDay(-1)?"Вчера":day.split("-").reverse().join("."))+", "+w;}
  const tmin=s=>{const m=/(\d{2}):(\d{2})/.exec(s||"");return m?+m[1]*60+ +m[2]:null;};
  function renderDispatch(body){
    clearInterval(dispTimer);clearUnseen();
    if(!dispDay)dispDay=isoDay(0);
    const fleet=fleetActive(editCity);
    body.innerHTML=head("Диспетчерская — "+CITY_NAMES[editCity],"Поездки на день по машинам. Новые заявки появляются сразу, со звуком. Изменения видит житель в приложении.")+
      `<div class="adm2-toolbar adm2-dnav">
         <button type="button" class="adm2-btn ghost sm" id="dPrev" aria-label="Предыдущий день">‹</button>
         <b class="adm2-dday">${esc(dayHuman(dispDay))}</b>
         <button type="button" class="adm2-btn ghost sm" id="dNext" aria-label="Следующий день">›</button>
         <div class="adm2-seg">${[[0,"Сегодня"],[1,"Завтра"],[2,"Послезавтра"]].map(([d,l])=>`<button type="button" class="adm2-seg-b${dispDay===isoDay(d)?" on":""}" data-dd="${d}">${l}</button>`).join("")}</div>
         <input type="date" class="adm2-inp date" id="dDay" value="${dispDay}" aria-label="Дата">
         <button type="button" class="adm2-btn" id="dNew">${window.ico("plus")} Поездка по телефону</button>
       </div>
       <div class="adm2-toolbar">
         <input class="adm2-inp" id="dFind" placeholder="Поиск: ФИО, телефон, адрес, № заявки" style="flex:1;min-width:200px" aria-label="Поиск поездки">
         <button type="button" class="adm2-btn ghost" id="dPrint">${window.ico("printer")} Путевые листы</button>
         <button type="button" class="adm2-btn ghost" id="dXlsx">${window.ico("download")} Excel</button>
         <button type="button" class="adm2-btn ghost" id="dReload" aria-label="Обновить">${window.ico("refresh")}</button>
       </div>
       <div id="dFormBox"></div>
       <div id="dKpi"></div><div id="dBoard"><div class="adm2-empty">Загрузка…</div></div>
       <div class="adm2-sub">За 7 дней</div><div id="dWeek"><div class="adm2-empty">Загрузка…</div></div>`;
    const go=d=>{dispDay=d;renderDispatch(body);};
    body.querySelectorAll("[data-dd]").forEach(b=>b.onclick=()=>go(isoDay(+b.dataset.dd)));
    body.querySelector("#dPrev").onclick=()=>go(dayShift(dispDay,-1));
    body.querySelector("#dNext").onclick=()=>go(dayShift(dispDay,1));
    body.querySelector("#dDay").onchange=e=>{if(e.target.value)go(e.target.value);};
    body.querySelector("#dPrint").onclick=()=>printWaybill(dispDay);
    body.querySelector("#dReload").onclick=()=>load();
    body.querySelector("#dNew").onclick=()=>{dispForm=!dispForm;drawForm();};
    let rides=[];
    body.querySelector("#dXlsx").onclick=()=>{
      const act=rides.filter(x=>!["cancelled","rejected"].includes(x.status));
      if(!act.length){showToast("На этот день поездок нет");return;}
      const groups={};act.forEach(x=>{const k=x.assigned&&x.assigned.model?(x.assigned.model+" "+(x.assigned.plate||"")).trim():"Без машины";(groups[k]=groups[k]||[]).push(x);});
      const sheets=Object.keys(groups).map(k=>({name:k.slice(0,31).replace(/[\\/?*[\]:]/g," "),widths:[8,34,34,30,16,6,30,24],
        rows:[["Время","Откуда","Куда","Пассажир","Телефон","Пасс.","Отметки","Водитель"]].concat(groups[k].sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at))).map(x=>{const p=x.payload||{};
          return [(x.scheduled_at||"").slice(11),p.from||"",p.to||"",x.client_name,x.client_phone?"+"+x.client_phone:"",p.pax||1,[p.wheelchair?"коляска":"",p.isFree?"льготная":"",p.comment||""].filter(Boolean).join("; "),(x.assigned&&x.assigned.driver)||""];}))}));
      XLite.download(XLite.write(sheets),"Поездки "+dispDay.split("-").reverse().join(".")+" — "+CITY_NAMES[editCity]+".xlsx");
    };

    /* ── Поездка по телефону ── */
    function drawForm(){
      const box=body.querySelector("#dFormBox");
      if(!dispForm){box.innerHTML="";return;}
      const S=window.GSettings?GSettings.get():{};
      box.innerHTML=`<section class="adm2-dform" aria-label="Новая поездка">
        <div class="adm2-dform-h"><b>Новая поездка — ${esc(dayHuman(dispDay))}</b><button type="button" class="adm2-icon-btn" id="fClose" aria-label="Закрыть">${window.ico("x")}</button></div>
        <div class="adm2-dform-g">
          <label class="adm2-fld"><span>Телефон пассажира</span><input class="adm2-inp" id="fPhone" inputmode="tel" placeholder="+7 900 000-00-00" autocomplete="off"></label>
          <label class="adm2-fld"><span>ФИО полностью</span><input class="adm2-inp" id="fName" placeholder="Фамилия Имя Отчество" autocomplete="off"></label>
          <label class="adm2-fld"><span>Время подачи</span><input class="adm2-inp" id="fTime" type="time" step="300" value="09:00"></label>
          <label class="adm2-fld"><span>Пассажиров</span><select class="adm2-inp" id="fPax"><option>1</option><option>2</option><option>3</option></select></label>
          <label class="adm2-fld wide"><span>Откуда</span><input class="adm2-inp" id="fFrom" placeholder="Адрес подачи"></label>
          <label class="adm2-fld wide"><span>Куда</span><input class="adm2-inp" id="fTo" placeholder="Адрес назначения"></label>
          <label class="adm2-fld wide"><span>Комментарий</span><input class="adm2-inp" id="fCom" placeholder="Этаж, подъезд, сопровождающий…" maxlength="300"></label>
        </div>
        <div id="fHist" class="adm2-dhist"></div>
        <div class="adm2-dform-c">
          <label class="adm2-check"><input type="checkbox" id="fWheel"> Нужна машина для коляски</label>
          <label class="adm2-check"><input type="checkbox" id="fFree"> Льготная поездка</label>
          <label class="adm2-check"><input type="checkbox" id="fConf" checked> Сразу подтвердить</label>
        </div>
        <div class="adm2-actions"><button type="button" class="adm2-btn" id="fSave">Создать поездку</button>
          <span class="adm2-note">Машина работает ${esc(S.taxiRideFrom||"08:30")}–${esc(S.taxiRideTo||"18:00")}, обед ${esc(S.lunchFrom||"12:30")}–${esc(S.lunchTo||"14:00")}.</span></div>
      </section>`;
      const $=id=>box.querySelector(id);
      $("#fClose").onclick=()=>{dispForm=false;drawForm();};
      setTimeout(()=>$("#fPhone").focus(),30);
      /* по телефону — прошлые поездки: имя и адреса подставляются одним нажатием */
      let ht=0;
      $("#fPhone").oninput=()=>{clearTimeout(ht);const ph=$("#fPhone").value.replace(/\D/g,"");
        if(ph.length<10){$("#fHist").innerHTML="";return;}
        ht=setTimeout(()=>apiCall("GET","/admin/residents/history?phone="+ph).then(d=>{
          const it=(d.items||[]).filter(x=>x.client_name&&x.client_name!=="(обезличено)");
          if(!it.length){$("#fHist").innerHTML='<span class="adm2-note">Новый пассажир — раньше поездок не было.</span>';return;}
          if(!$("#fName").value)$("#fName").value=it[0].client_name;
          const addr=[...new Set(it.filter(x=>x.type==="taxi").flatMap(x=>[(x.payload||{}).from,(x.payload||{}).to]).filter(Boolean))].slice(0,8);
          $("#fHist").innerHTML=`<span class="adm2-note">Ездил(а) ${it.filter(x=>x.type==="taxi").length} раз. Адреса — нажмите, чтобы подставить:</span>`+
            addr.map(a=>`<button type="button" class="adm2-chip" data-addr="${esc(a)}">${esc(a)}</button>`).join("");
          $("#fHist").querySelectorAll("[data-addr]").forEach(b=>b.onclick=()=>{const t=!$("#fFrom").value?$("#fFrom"):$("#fTo");t.value=b.dataset.addr;});
          const last=it.find(x=>x.type==="taxi");if(last&&(last.payload||{}).wheelchair)$("#fWheel").checked=true;
        }).catch(()=>{}),350);
      };
      $("#fSave").onclick=()=>{
        const name=$("#fName").value.trim().replace(/\s+/g," "),phone=$("#fPhone").value.replace(/\D/g,""),time=$("#fTime").value;
        if(phone.length<10){showToast("Укажите телефон пассажира");$("#fPhone").focus();return;}
        if(name.split(" ").length<2){showToast("Укажите фамилию, имя и отчество");$("#fName").focus();return;}
        if(!/^\d{2}:\d{2}$/.test(time)){showToast("Укажите время подачи");return;}
        if(!$("#fFrom").value.trim()||!$("#fTo").value.trim()){showToast("Укажите, откуда и куда");return;}
        const btn=$("#fSave");btn.disabled=true;
        apiCall("POST","/admin/requests",{type:"taxi",branch:brKey(editCity),name,phone,scheduledAt:dispDay+" "+time,status:$("#fConf").checked?"confirmed":"new",
          payload:{from:$("#fFrom").value.trim(),to:$("#fTo").value.trim(),pax:+$("#fPax").value,wheelchair:$("#fWheel").checked,isFree:$("#fFree").checked,comment:$("#fCom").value.trim()}})
          .then(d=>{showToast("Поездка № "+d.num+" создана");freshIds.add(String(d.id));dispForm=false;drawForm();load();})
          .catch(e=>{showToast(e.message);btn.disabled=false;});
      };
    }
    drawForm();

    /* ── Доска поездок ── */
    const load=()=>apiCall("GET","/admin/requests?"+new URLSearchParams({type:"taxi",date:dispDay,branch:brKey(editCity),limit:"1000"})).then(d=>{
      if(!body.querySelector("#dBoard"))return;
      /* открытые панели (история, ответ, правка) и прокрутка доски переживают обновление */
      const keep=[...body.querySelectorAll(".adm2-dride")].map(c=>{const x=c.querySelector(".adm2-dride-x");return x&&!x.hidden?{id:c.dataset.id,k:x.dataset.k}:null;}).filter(Boolean);
      const bd=body.querySelector(".adm2-dboard"),sl=bd?bd.scrollLeft:0;
      rides=d.items;
      const c=k=>rides.filter(x=>x.status===k).length,act=rides.filter(x=>!["cancelled","rejected"].includes(x.status));
      const carOf=x=>x.assigned&&x.assigned.plate?fleet.find(f=>plateNormalize(f.plate)===plateNormalize(x.assigned.plate)):null;
      /* «Ждут машину» — и поездки с машиной, которой больше нет в автопарке: ни одна не пропадёт с доски */
      const waiting=act.filter(x=>!carOf(x));
      /* накладки: следующая поездка машины раньше, чем закончится предыдущая */
      const clash=new Set();
      fleet.forEach(f=>{const xs=act.filter(x=>carOf(x)===f&&x.status!=="done").sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at)));
        for(let i=1;i<xs.length;i++){const a=tmin(xs[i-1].scheduled_at),b=tmin(xs[i].scheduled_at),dur=+(xs[i-1].payload||{}).duration||60;if(a!=null&&b!=null&&b<a+dur){clash.add(xs[i-1].id);clash.add(xs[i].id);}}});
      body.querySelector("#dKpi").innerHTML=`<div class="adm2-kpis" style="grid-template-columns:repeat(6,1fr)">
        <div><b>${act.length}</b><span>поездок</span></div><div><b class="${waiting.length?"warn":""}">${waiting.length}</b><span>ждут машину</span></div>
        <div><b>${c("assigned")+c("confirmed")}</b><span>в работе</span></div><div><b>${c("done")}</b><span>выполнено</span></div>
        <div><b>${act.filter(x=>(x.payload||{}).wheelchair).length}</b><span>с коляской</span></div><div><b>${act.filter(x=>(x.payload||{}).isFree).length}</b><span>льготных</span></div></div>`+
        (clash.size?`<div class="adm2-banner warn" style="margin-top:10px"><span class="adm2-banner-ico">${window.ico("warn")}</span><div><b>Накладка по времени</b><span>У машины поездки ближе, чем длится предыдущая — проверьте отмеченные карточки.</span></div></div>`:"");
      const cols=[{id:"",title:"Ждут машину",items:waiting}].concat(fleet.map(f=>({id:f.id,title:f.model+(f.plate?" · "+f.plate:""),car:f,items:act.filter(x=>carOf(x)===f)})));
      const cancelled=rides.filter(x=>["cancelled","rejected"].includes(x.status));
      const ST={new:["Новая","warn"],confirmed:["Подтверждена","on"],assigned:["Назначена","on"],done:["Выполнена","off"]};
      const card=x=>{const p=x.payload||{},st=ST[x.status]||[x.status,"on"],ghost=x.assigned&&x.assigned.model&&!carOf(x);
        return `<article class="adm2-dride st-${x.status}${freshIds.has(String(x.id))?" adm2-fresh":""}${clash.has(x.id)?" clash":""}" data-id="${x.id}">
          <div class="adm2-dride-t"><b>${esc((x.scheduled_at||"").slice(11))}</b><small>№ ${esc(x.num)}</small><span class="adm2-badge ${st[1]}">${esc(st[0])}</span></div>
          <div class="adm2-dride-r">${esc(p.from||"")}<br>→ ${esc(p.to||"")}</div>
          <div class="adm2-dride-w">${esc(x.client_name)} · <a href="tel:+${esc(x.client_phone)}">+${esc(x.client_phone)}</a> <button type="button" class="adm2-link" data-dhist>история</button></div>
          ${p.wheelchair||p.isFree||p.comment||p.pax>1||p.source==="phone"||ghost||clash.has(x.id)?`<div class="adm2-dride-f">${p.wheelchair?"<i>коляска</i>":""}${p.isFree?"<i>льготная</i>":""}${p.pax>1?"<i>пассажиров: "+esc(p.pax)+"</i>":""}${p.source==="phone"?"<i class=\"ph\">по телефону</i>":""}${ghost?"<i class=\"bad\">машина «"+esc(x.assigned.model)+"» не в автопарке</i>":""}${clash.has(x.id)?"<i class=\"bad\">накладка</i>":""}${p.comment?"<span>"+esc(p.comment)+"</span>":""}</div>`:""}
          ${x.staff_note?`<div class="adm2-dride-n">Жителю: ${esc(x.staff_note)}</div>`:""}
          <div class="adm2-dride-a"><select class="adm2-inp" data-dcar aria-label="Машина"><option value="">— машина —</option>${fleet.map(f=>`<option value="${esc(f.id)}"${carOf(x)===f?" selected":""}${p.wheelchair&&!f.wheelchair?" disabled":""}>${esc(f.model)}${f.plate?" · "+esc(f.plate):""}${f.wheelchair?" (коляска)":""}</option>`).join("")}</select>
            ${x.status!=="done"?`<button type="button" class="adm2-btn sm adm2-dassign" data-dassign disabled>${carOf(x)?"Назначена":"Назначить"}</button>`:""}</div>
          <div class="adm2-dride-b">
            ${x.status==="new"?`<button type="button" class="adm2-btn ghost sm" data-dst="confirmed">${window.ico("check")} Подтвердить</button>`:""}
            ${x.status!=="done"?`<button type="button" class="adm2-btn ghost sm" data-dst="done" title="Отметить выполненной">${window.ico("check")} Выполнена</button>`:""}
            <button type="button" class="adm2-btn ghost sm" data-dedit>${window.ico("edit")} Изменить</button>
            <button type="button" class="adm2-btn ghost sm" data-dnote>${window.ico("chat")} Ответ</button>
            <button type="button" class="adm2-icon-btn danger" data-dst="cancelled" title="Отменить поездку" aria-label="Отменить поездку">${window.ico("x")}</button>
          </div>
          <div class="adm2-dride-x" hidden></div>
        </article>`;};
      body.querySelector("#dBoard").innerHTML=(rides.length?"":'<div class="adm2-empty">На этот день поездок нет. Нажмите «Поездка по телефону», чтобы записать звонок.</div>')+
        `<div class="adm2-dboard">${cols.map(col=>`<section class="adm2-dcol${col.id?"":" wait"}"><header><b>${esc(col.title)}</b><span>${col.items.length}</span>${col.car&&col.car.wheelchair?'<i title="Для колясок">'+window.ico("wheelchair")+'</i>':""}</header>
          ${col.car&&col.car.driver?`<div class="adm2-note">Водитель: ${esc(col.car.driver)}</div>`:""}
          ${col.car&&col.items.length?`<div class="adm2-dcol-act"><button type="button" class="adm2-btn ghost sm" data-dwb="${esc(col.car.plate||"")}">${window.ico("printer")} Маршрутный лист</button><button type="button" class="adm2-btn ghost sm" data-dsend="${esc(col.id)}">${window.ico("send")} Водителю</button></div>`:""}
          ${col.items.sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at))).map(card).join("")||'<div class="adm2-dcol-empty">Нет поездок</div>'}</section>`).join("")}</div>`+
        (cancelled.length?`<details class="adm2-dcanc"><summary>Отменённые (${cancelled.length})</summary>${cancelled.map(x=>`<div>${esc((x.scheduled_at||"").slice(11))} · ${esc(x.client_name)} · ${esc((x.payload||{}).from||"")} → ${esc((x.payload||{}).to||"")}${x.status==="rejected"?" · отклонена":""}</div>`).join("")}</details>`:"");
      wire();
      if(typeof loadWeek==="function")loadWeek();
      const bd2=body.querySelector(".adm2-dboard");if(bd2)bd2.scrollLeft=sl;
      keep.forEach(k=>{const c=body.querySelector('.adm2-dride[data-id="'+k.id+'"]');const btn=c&&c.querySelector(({h:"[data-dhist]",n:"[data-dnote]",e:"[data-dedit]"})[k.k]);if(btn)btn.click();});
    }).catch(e=>{const b=body.querySelector("#dBoard");if(b)b.innerHTML='<div class="adm2-empty">'+esc(e.message)+'</div>';});

    /* ── Действия на карточках ── */
    const patch=(id,b,ok)=>apiCall("PATCH","/admin/requests/"+id,b).then(()=>{
      showToast(ok);
      const c=body.querySelector('.adm2-dride[data-id="'+id+'"]');
      if(c){delete c.dataset.dirty;const x=c.querySelector(".adm2-dride-x");if(x)x.hidden=true;}   /* сделано — панель закрываем */
      load();
    }).catch(e=>showToast(e.message));
    function wire(){
      const byId=id=>rides.find(r=>String(r.id)===String(id));
      body.querySelectorAll("[data-dwb]").forEach(b=>b.onclick=()=>printWaybill(dispDay,b.dataset.dwb));
      body.querySelectorAll("[data-dsend]").forEach(b=>b.onclick=()=>{
        const f=fleet.find(c=>c.id===b.dataset.dsend);if(!f)return;
        const items=rides.filter(x=>!["cancelled","rejected"].includes(x.status)&&x.assigned&&plateNormalize(x.assigned.plate||"")===plateNormalize(f.plate)).sort((a,b)=>String(a.scheduled_at).localeCompare(String(b.scheduled_at)));
        const txt="Поездки на "+dispDay.split("-").reverse().join(".")+" · "+f.model+(f.plate?" "+f.plate:"")+(f.driver?" · водитель "+f.driver:"")+"\n\n"+
          items.map((x,i)=>{const p=x.payload||{};return (i+1)+". "+(x.scheduled_at||"").slice(11)+" — "+(p.from||"")+" → "+(p.to||"")+"\n   "+x.client_name+", +"+x.client_phone+(p.pax>1?", пассажиров: "+p.pax:"")+(p.wheelchair?", коляска":"")+(p.comment?"\n   "+p.comment:"");}).join("\n\n");
        if(navigator.share)navigator.share({title:"Маршрут на день",text:txt}).catch(()=>{});
        else if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>showToast("Маршрут скопирован — вставьте в сообщение водителю")).catch(()=>prompt("Скопируйте маршрут:",txt));
        else prompt("Скопируйте маршрут:",txt);
      });
      const find=body.querySelector("#dFind");
      if(find){const apply=()=>{const q=find.value.trim().toLowerCase();body.querySelectorAll(".adm2-dride").forEach(c=>{c.hidden=!!q&&!c.innerText.toLowerCase().includes(q);});};find.oninput=apply;apply();}
      body.querySelectorAll("[data-dcar]").forEach(sel=>{const card=sel.closest("[data-id]"),btn=card.querySelector("[data-dassign]");if(!btn)return;
        sel.dataset.orig=sel.value;
        sel.onchange=()=>{const changed=sel.value!==sel.dataset.orig;btn.disabled=!changed;btn.textContent=changed?(sel.value?"Назначить":"Снять машину"):(sel.value?"Назначена":"Назначить");btn.classList.toggle("ready",changed);};});
      body.querySelectorAll("[data-dassign]").forEach(btn=>btn.onclick=()=>{
        const card=btn.closest("[data-id]"),x=byId(card.dataset.id),f=fleet.find(z=>z.id===card.querySelector("[data-dcar]").value);
        btn.disabled=true;
        patch(card.dataset.id,{assigned:f?{model:f.model,plate:plateNormalize(f.plate),color:f.color||"",wheelchair:!!f.wheelchair,driver:f.driver||""}:null,
          status:f?"assigned":(x&&x.status==="assigned"?"confirmed":x?x.status:"new")},f?"Машина назначена — житель получил уведомление":"Машина снята — житель получил уведомление");});
      body.querySelectorAll("[data-dst]").forEach(b=>b.onclick=()=>{
        const id=b.closest("[data-id]").dataset.id,st=b.dataset.dst;
        if(st==="cancelled"&&!confirm("Отменить поездку? Житель увидит статус «Отменена»."))return;
        patch(id,{status:st},({done:"Поездка выполнена",cancelled:"Поездка отменена",confirmed:"Поездка подтверждена — житель получил уведомление"})[st]);});
      body.querySelectorAll("[data-dhist]").forEach(b=>b.onclick=()=>{
        const card=b.closest("[data-id]"),box=card.querySelector(".adm2-dride-x"),x=byId(card.dataset.id);
        if(!box.hidden&&box.dataset.k==="h"){box.hidden=true;return;}
        box.dataset.k="h";box.hidden=false;box.innerHTML='<div class="adm2-note">Загрузка…</div>';
        apiCall("GET","/admin/residents/history?phone="+encodeURIComponent(x.client_phone)).then(d=>{
          const it=(d.items||[]).filter(r=>String(r.id)!==String(x.id));
          box.innerHTML=it.length?`<div class="adm2-dhist-l">${it.slice(0,12).map(r=>{const p=r.payload||{};return `<div><b>${esc((r.scheduled_at||r.created_at||"").slice(0,16).replace("T"," ").split(" ").map((v,i)=>i?v:v.split("-").reverse().join(".")).join(" "))}</b> ${esc(({taxi:"такси",order:"услуги",booking:"запись",callback:"звонок",event:"мероприятие",feedback:"отзыв"})[r.type]||r.type)}${r.type==="taxi"?": "+esc(p.from||"")+" → "+esc(p.to||""):""} · ${esc(({new:"новая",confirmed:"подтв.",assigned:"назначена",done:"выполнена",cancelled:"отменена",rejected:"отклонена"})[r.status]||r.status)}</div>`;}).join("")}</div>`
            :'<div class="adm2-note">Других обращений нет.</div>';
        }).catch(e=>{box.innerHTML='<div class="adm2-note">'+esc(e.message)+'</div>';});
      });
      body.querySelectorAll("[data-dnote]").forEach(b=>b.onclick=()=>{
        const card=b.closest("[data-id]"),box=card.querySelector(".adm2-dride-x"),x=byId(card.dataset.id);
        if(!box.hidden&&box.dataset.k==="n"){box.hidden=true;return;}
        box.dataset.k="n";box.hidden=false;
        box.innerHTML=`<div class="adm2-dhist">${DISP_NOTES.map(t=>`<button type="button" class="adm2-chip" data-qn="${esc(t)}">${esc(t)}</button>`).join("")}</div>
          <textarea class="adm2-inp" data-ntext maxlength="500" rows="2" placeholder="Сообщение жителю — он увидит его в приложении">${esc(x.staff_note||"")}</textarea>
          <div class="adm2-actions"><button type="button" class="adm2-btn sm" data-nsend>Отправить жителю</button></div>`;
        const inp=box.querySelector("[data-ntext]");
        box.querySelectorAll("[data-qn]").forEach(q=>q.onclick=()=>{inp.value=q.dataset.qn;inp.focus();});
        box.querySelector("[data-nsend]").onclick=()=>patch(x.id,{staffNote:inp.value.trim()},"Сообщение отправлено — житель увидит его сразу");
      });
      body.querySelectorAll("[data-dedit]").forEach(b=>b.onclick=()=>{
        const card=b.closest("[data-id]"),box=card.querySelector(".adm2-dride-x"),x=byId(card.dataset.id),p=x.payload||{};
        if(!box.hidden&&box.dataset.k==="e"){box.hidden=true;return;}
        box.dataset.k="e";box.hidden=false;
        box.innerHTML=`<div class="adm2-dform-g sm">
          <label class="adm2-fld wide"><span>Дата</span><input class="adm2-inp" type="date" data-e="day" value="${esc((x.scheduled_at||"").slice(0,10))}"></label>
          <label class="adm2-fld"><span>Время</span><input class="adm2-inp" type="time" step="300" data-e="time" value="${esc((x.scheduled_at||"").slice(11))}"></label>
          <label class="adm2-fld"><span>Пассажиров</span><select class="adm2-inp" data-e="pax">${[1,2,3].map(n=>`<option${(+p.pax||1)===n?" selected":""}>${n}</option>`).join("")}</select></label>
          <label class="adm2-fld wide"><span>Откуда</span><input class="adm2-inp" data-e="from" value="${esc(p.from||"")}"></label>
          <label class="adm2-fld wide"><span>Куда</span><input class="adm2-inp" data-e="to" value="${esc(p.to||"")}"></label>
          <label class="adm2-fld wide"><span>Комментарий</span><input class="adm2-inp" data-e="comment" maxlength="300" value="${esc(p.comment||"")}"></label></div>
          <div class="adm2-dform-c"><label class="adm2-check"><input type="checkbox" data-e="wheelchair"${p.wheelchair?" checked":""}> Коляска</label>
            <label class="adm2-check"><input type="checkbox" data-e="isFree"${p.isFree?" checked":""}> Льготная</label></div>
          <div class="adm2-actions"><button type="button" class="adm2-btn sm" data-esave>Сохранить — житель увидит</button></div>`;
        box.querySelector("[data-esave]").onclick=()=>{
          const g=k=>box.querySelector(`[data-e="${k}"]`);
          const at=g("day").value+" "+g("time").value,b2={details:{from:g("from").value.trim(),to:g("to").value.trim(),pax:+g("pax").value,comment:g("comment").value.trim(),wheelchair:g("wheelchair").checked,isFree:g("isFree").checked}};
          if(at!==x.scheduled_at)b2.scheduledAt=at;
          if(!b2.details.from||!b2.details.to){showToast("Укажите, откуда и куда");return;}
          patch(x.id,b2,b2.scheduledAt&&b2.scheduledAt.slice(0,10)!==dispDay?"Поездка перенесена на "+b2.scheduledAt.slice(0,10).split("-").reverse().join("."):"Изменения сохранены — житель их видит");
        };
      });
    }
    load();setLive(()=>{if(editTab==="dispatch"&&body.querySelector("#dBoard"))load();});
    /* итоги недели — обновляются вместе с доской, но не чаще раза в 10 с */
    let weekAt=0,weekT=null;
    const loadWeek=()=>{const wait=10000-(Date.now()-weekAt);
      if(wait>0){clearTimeout(weekT);weekT=setTimeout(loadWeek,wait);return;}      /* последнее обновление не теряется */
      weekAt=Date.now();
    apiCall("GET","/admin/stats?"+new URLSearchParams({days:7,branch:brKey(editCity)})).then(d=>{
      if(!body.querySelector("#dWeek"))return;
      const n=(d.byType||{}).taxi||0;
      body.querySelector("#dWeek").innerHTML=`<div class="adm2-kpis" style="grid-template-columns:repeat(4,1fr)"><div><b>${n}</b><span>заказов такси</span></div><div><b>${d.taxi.free}</b><span>льготных</span></div><div><b>${d.taxi.wheelchair}</b><span>с коляской</span></div><div><b>${(d.byStatus||{}).cancelled||0}</b><span>отменено</span></div></div>`+
        (d.cars.length?`<div class="adm2-table-wrap" style="margin-top:10px"><table class="adm2-table adm2-shifts"><thead><tr><th>Машина</th><th>Госномер</th><th>Поездок за неделю</th></tr></thead><tbody>${d.cars.map(c=>`<tr><td>${esc(c.model)}</td><td>${esc(c.plate||"—")}</td><td>${c.n}</td></tr>`).join("")}</tbody></table></div>`:"");
    }).catch(()=>{const w=body.querySelector("#dWeek");if(w)w.innerHTML="";});};
    loadWeek();
    /* запасное обновление — только если поток событий недоступен */
    dispTimer=setInterval(()=>{if(editTab!=="dispatch"||!document.getElementById("dBoard")){clearInterval(dispTimer);return;}
      if(esOk)return;
      if(document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".adm2-dride,.adm2-dform"))return;load();},20000);
  }

  /* ═══ Настройки центра: такси, обед, «Морошка», бот, экстренные телефоны, меню, знакомство ═══ */
  function renderSettings(body){
    const D=GSettings.DEF,R=Object.assign({},D,GSettings.raw()||{});
    const save=()=>{GSettings.apply(R);touch();};
    const tm=(k,l)=>`<label class="adm2-fld"><span>${l}</span><input type="time" class="adm2-inp time" data-st="${k}" value="${esc(R[k])}"></label>`;
    const TILES=[["news","Новости"],["events","Мероприятия"],["gallery","Фотогалерея"],["staff","Сотрудники"],["callback","Обратный звонок"],["feedback","Отзыв"],["moroshka","Карта «Морошка»"],["vk","Группа ВК"]];
    body.innerHTML=head("Настройки центра","Правила работы, тексты и разделы приложения для жителей центра «"+esc(window.GCenters?GCenters.centerName(GCenters.get()):"")+"». Пустые поля — значения по умолчанию.")+
      `<div data-brand-raw>
      <div class="adm2-post"><b class="adm2-h3">Обеденный перерыв</b><div class="adm2-form pad" style="padding:0">${tm("lunchFrom","С")}${tm("lunchTo","До")}</div>
        <small class="adm2-note">В это время нет записи к специалистам и подачи такси; статус «Открыто» учитывает обед.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Социальное такси</b><div class="adm2-form pad" style="padding:0">
        ${tm("taxiOrderFrom","Приём заявок с")}${tm("taxiOrderTo","Приём заявок до")}${tm("taxiRideFrom","Подача машины с")}${tm("taxiRideTo","Подача машины до")}
        <label class="adm2-fld"><span>Пассажиров в заявке, не больше</span><input type="number" min="1" max="8" class="adm2-inp" data-stn="taxiMaxPax" value="${R.taxiMaxPax}"></label>
        <label class="adm2-fld"><span>Льготных поездок в год на человека</span><input type="number" min="0" max="999" class="adm2-inp" data-stn="taxiFreeLimit" value="${R.taxiFreeLimit}"></label></div>
        <small class="adm2-note">Заявку принимают накануне поездки в указанные часы.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Карта «Морошка»</b><div class="adm2-form pad" style="padding:0">
        <label class="adm2-fld"><span>Скидка по карте, %</span><input type="number" min="0" max="50" class="adm2-inp" data-stn="moroshkaPercent" value="${R.moroshkaPercent}"></label></div>
        <small class="adm2-note">Используется в кнопке пересчёта цен и проверке данных прейскуранта.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Чат-бот</b>
        <label class="adm2-fld wide"><span>Приветствие (пусто — стандартное)</span><textarea class="adm2-inp" rows="3" data-sts="botGreeting" placeholder="Я чат-бот центра. Помогу узнать цены, записаться и заказать такси.">${esc(R.botGreeting||"")}</textarea></label>
        <div class="adm2-fld"><span>Частые вопросы — свои ответы центра</span></div>
        <div id="stFaq">${(R.faq||[]).map((f,i)=>`<div class="adm2-faq"><input class="adm2-inp" data-fq="${i}" value="${esc(f.q)}" placeholder="Слова через запятую: парковка, где оставить машину"><textarea class="adm2-inp" rows="2" data-fa="${i}" placeholder="Ответ бота">${esc(f.a)}</textarea><button type="button" class="adm2-icon-btn danger" data-fdel="${i}" aria-label="Удалить вопрос">${window.ico("trash")}</button></div>`).join("")}</div>
        <button type="button" class="adm2-btn ghost sm" id="stFaqAdd">${window.ico("plus")} Вопрос и ответ</button>
        <small class="adm2-note">Если в вопросе жителя есть одно из слов — бот отвечает вашим текстом.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Экстренные телефоны</b>
        <div id="stEm">${(R.emergency||[]).map((x,i)=>`<div class="adm2-faq"><input class="adm2-inp" data-en="${i}" value="${esc(x.name)}" placeholder="Название службы"><input class="adm2-inp" data-ep="${i}" value="${esc(x.phone)}" placeholder="Телефон" inputmode="tel" style="max-width:200px"><button type="button" class="adm2-icon-btn danger" data-edel="${i}" aria-label="Удалить телефон">${window.ico("trash")}</button></div>`).join("")}</div>
        <button type="button" class="adm2-btn ghost sm" id="stEmAdd">${window.ico("plus")} Телефон</button>
        <small class="adm2-note">Показываются в разделе «Экстренная помощь».</small></div>
      <div class="adm2-post"><b class="adm2-h3">Разделы приложения</b>
        <div class="adm2-chips">${TILES.map(([k,l])=>`<button type="button" class="adm2-chip${(R.hiddenTiles||[]).includes(k)?"":" on"}" data-tile="${k}">${l}</button>`).join("")}</div>
        <small class="adm2-note">Выключенные разделы не показываются жителям в меню.</small>
        <label class="adm2-check adm2-fx"><input type="checkbox" id="stOnb"${R.onboarding!==false?" checked":""}><span><b>Знакомство с приложением</b><small>слайды при первом входе</small></span></label></div>
      <div class="adm2-post"><b class="adm2-h3">Запись к специалистам</b><div class="adm2-form pad" style="padding:0">
        ${tm("bookingFrom","Приём с")}${tm("bookingTo","Последняя запись в")}
        <label class="adm2-fld"><span>Шаг сетки времени</span><select class="adm2-inp" data-stn="bookingStep">${[10,15,20,30,45,60,90].map(n=>`<option value="${n}"${+R.bookingStep===n?" selected":""}>${n} мин</option>`).join("")}</select></label>
        <label class="adm2-fld"><span>Дней вперёд для записи</span><input type="number" min="1" max="60" class="adm2-inp" data-stn="bookingDays" value="${R.bookingDays}"></label></div>
        <label class="adm2-check"><input type="checkbox" id="stWknd"${R.bookingWeekends?" checked":""}> Запись в выходные дни</label></div>
      <div class="adm2-post"><b class="adm2-h3">Категории получателей</b>
        <div id="stCats">${(R.categories&&R.categories.length?R.categories:(window.RCP_CATS_DEFAULT||[])).map((c,i)=>`<div class="adm2-faq adm2-cat-row"><input class="adm2-inp" data-cl="${i}" value="${esc(c.label)}" placeholder="Название категории"><label class="adm2-check"><input type="checkbox" data-cf="${i}"${c.free?" checked":""}> Льготное такси</label><button type="button" class="adm2-icon-btn danger" data-cdl="${i}" aria-label="Удалить категорию">${window.ico("trash")}</button></div>`).join("")}</div>
        <button type="button" class="adm2-btn ghost sm" id="stCatAdd">${window.ico("plus")} Категория</button>
        <small class="adm2-note">Выбираются в анкете и в заявке. «Льготное такси» — у категории есть бесплатные поездки.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Слайды знакомства</b>
        <div id="stSl">${(R.onboardingSlides||[]).map((x,i)=>`<div class="adm2-faq"><input class="adm2-inp" data-slt="${i}" value="${esc(x.title)}" placeholder="Заголовок"><textarea class="adm2-inp" rows="2" data-slx="${i}" placeholder="Текст слайда">${esc(x.text||"")}</textarea><button type="button" class="adm2-icon-btn danger" data-sld="${i}" aria-label="Удалить слайд">${window.ico("trash")}</button></div>`).join("")}</div>
        <button type="button" class="adm2-btn ghost sm" id="stSlAdd">${window.ico("plus")} Слайд</button>
        <small class="adm2-note">Пусто — стандартные слайды.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Сезонные поздравления</b>
        <div id="stGr">${(R.greetings||[]).map((x,i)=>`<div class="adm2-faq adm2-gr-row"><input class="adm2-inp" data-grd="${i}" value="${esc(x.date?x.date.split("-").reverse().join("."):"")}" placeholder="ДД.ММ" style="max-width:110px"><input type="number" min="1" max="31" class="adm2-inp" data-grn="${i}" value="${x.days||1}" style="max-width:90px" title="Сколько дней показывать"><input class="adm2-inp" data-grt="${i}" value="${esc(x.text)}" placeholder="Текст поздравления"><button type="button" class="adm2-icon-btn danger" data-grx="${i}" aria-label="Удалить">${window.ico("trash")}</button></div>`).join("")}</div>
        <button type="button" class="adm2-btn ghost sm" id="stGrAdd">${window.ico("plus")} Поздравление</button>
        <small class="adm2-note">Дата начала и сколько дней показывать. Пусто — стандартные праздники.</small></div>
      <div class="adm2-post"><b class="adm2-h3">Персональные данные</b>
        <label class="adm2-fld wide"><span>Ссылка на политику обработки персональных данных</span><input class="adm2-inp" data-sts="privacyUrl" value="${esc(R.privacyUrl||"")}" placeholder="https://… (пусто — политика департамента соцзащиты ЯНАО)"></label></div>
      <div class="adm2-actions"><button type="button" class="adm2-btn danger" id="stReset">Вернуть настройки по умолчанию</button></div></div>`;
    body.querySelectorAll("[data-st]").forEach(i=>i.onchange=()=>{if(/^\d{2}:\d{2}$/.test(i.value)){R[i.dataset.st]=i.value;save();}});
    body.querySelectorAll("[data-stn]").forEach(i=>i.oninput=()=>{const n=parseFloat(i.value);if(isFinite(n)){R[i.dataset.stn]=n;save();}});
    body.querySelectorAll("[data-sts]").forEach(i=>i.oninput=()=>{R[i.dataset.sts]=i.value.trim();save();});
    const rf=()=>{save();renderSettings(body);};
    body.querySelectorAll("[data-fq]").forEach(i=>i.oninput=()=>{R.faq[+i.dataset.fq].q=i.value;save();});
    body.querySelectorAll("[data-fa]").forEach(i=>i.oninput=()=>{R.faq[+i.dataset.fa].a=i.value;save();});
    body.querySelectorAll("[data-fdel]").forEach(b=>b.onclick=()=>{R.faq.splice(+b.dataset.fdel,1);rf();});
    body.querySelector("#stFaqAdd").onclick=()=>{R.faq=(R.faq||[]).concat([{q:"",a:""}]);rf();};
    body.querySelectorAll("[data-en]").forEach(i=>i.oninput=()=>{R.emergency[+i.dataset.en].name=i.value;save();});
    body.querySelectorAll("[data-ep]").forEach(i=>i.oninput=()=>{R.emergency[+i.dataset.ep].phone=i.value;save();});
    body.querySelectorAll("[data-edel]").forEach(b=>b.onclick=()=>{R.emergency.splice(+b.dataset.edel,1);rf();});
    body.querySelector("#stEmAdd").onclick=()=>{R.emergency=(R.emergency||[]).concat([{name:"",phone:""}]);rf();};
    body.querySelectorAll("[data-tile]").forEach(b=>b.onclick=()=>{const k=b.dataset.tile;R.hiddenTiles=R.hiddenTiles||[];
      const i=R.hiddenTiles.indexOf(k);if(i>=0)R.hiddenTiles.splice(i,1);else R.hiddenTiles.push(k);b.classList.toggle("on",i>=0);save();});
    body.querySelector("#stOnb").onchange=e=>{R.onboarding=e.target.checked;save();};
    body.querySelectorAll("select[data-stn]").forEach(i=>i.onchange=()=>{R[i.dataset.stn]=+i.value;save();});
    body.querySelector("#stWknd").onchange=e=>{R.bookingWeekends=e.target.checked;save();};
    const cats=()=>{if(!R.categories||!R.categories.length)R.categories=JSON.parse(JSON.stringify(window.RCP_CATS_DEFAULT||[]));return R.categories;};
    body.querySelectorAll("[data-cl]").forEach(i=>i.oninput=()=>{cats()[+i.dataset.cl].label=i.value;save();});
    body.querySelectorAll("[data-cf]").forEach(i=>i.onchange=()=>{cats()[+i.dataset.cf].free=i.checked;save();});
    body.querySelectorAll("[data-cdl]").forEach(b=>b.onclick=()=>{cats().splice(+b.dataset.cdl,1);rf();});
    body.querySelector("#stCatAdd").onclick=()=>{cats().push({key:"c"+Date.now().toString(36),label:"Новая категория",free:false});rf();};
    body.querySelectorAll("[data-slt]").forEach(i=>i.oninput=()=>{R.onboardingSlides[+i.dataset.slt].title=i.value;save();});
    body.querySelectorAll("[data-slx]").forEach(i=>i.oninput=()=>{R.onboardingSlides[+i.dataset.slx].text=i.value;save();});
    body.querySelectorAll("[data-sld]").forEach(b=>b.onclick=()=>{R.onboardingSlides.splice(+b.dataset.sld,1);rf();});
    body.querySelector("#stSlAdd").onclick=()=>{R.onboardingSlides=(R.onboardingSlides||[]).concat([{title:"",text:""}]);rf();};
    const toMD=v=>{const m=/^(\d{1,2})\.(\d{1,2})$/.exec(String(v).trim());return m?("0"+m[2]).slice(-2)+"-"+("0"+m[1]).slice(-2):"";};
    body.querySelectorAll("[data-grd]").forEach(i=>i.onchange=()=>{const v=toMD(i.value);if(!v){showToast("Дата в виде ДД.ММ, например 01.10");return;}R.greetings[+i.dataset.grd].date=v;save();});
    body.querySelectorAll("[data-grn]").forEach(i=>i.oninput=()=>{R.greetings[+i.dataset.grn].days=Math.max(1,+i.value||1);save();});
    body.querySelectorAll("[data-grt]").forEach(i=>i.oninput=()=>{R.greetings[+i.dataset.grt].text=i.value;save();});
    body.querySelectorAll("[data-grx]").forEach(b=>b.onclick=()=>{R.greetings.splice(+b.dataset.grx,1);rf();});
    body.querySelector("#stGrAdd").onclick=()=>{R.greetings=(R.greetings||[]).concat([{date:"",days:1,text:""}]);rf();};
    body.querySelector("#stReset").onclick=()=>{if(!confirm("Вернуть все настройки центра по умолчанию?"))return;const prev=GSettings.raw();GSettings.apply(null);touch();renderSettings(body);undoable("Настройки сброшены",()=>{GSettings.apply(prev);});};
  }

  /* ═══ Тестовый режим без сервера: заявки из этого браузера ═══
     Диспетчерская, «Заявки» и «Статистика» работают на заявках, оформленных в приложении
     на этом же устройстве (localStorage). Изменения статусов сразу видны жителю в «Моих заявках». */
  /* staff — заявки, принятые сотрудником по телефону, и демонстрационные (в формате сервера) */
  const LOCAL_KEYS={taxi:"taxiHistory",order:"ordersHistory",booking:"bookingsHistory",other:"otherRequests",staff:"staffRequests"};
  function localRead(k){try{return JSON.parse(localStorage.getItem(k)||"[]")||[];}catch(e){return [];}}
  function brIdByName(n){n=String(n||"").replace(/^(г\.|пгт\.|мкр\.)\s*/,"");const id=Object.keys(BRANCH_NAMES_MAP).find(k=>String(BRANCH_NAMES_MAP[k]).replace(/^(г\.|пгт\.|мкр\.)\s*/,"")===n);return id||n;}
  function localItems(){
    const out=[],nm=localStorage.getItem("clientName")||"Житель",ph=String(localStorage.getItem("clientPhone")||"").replace(/\D/g,"");
    Object.keys(LOCAL_KEYS).forEach(kind=>{
      localRead(LOCAL_KEYS[kind]).forEach((e,i)=>{
        if(!e||!e.num)return;
        if(kind==="staff"){
          const created=Date.parse(e.createdAt)||1e12+i;
          out.push({id:created,num:e.num,type:e.type,branch:String(e.branch||firstBranch()).split(":").pop(),center:String(e.branch||"").includes(":")?String(e.branch).split(":")[0]:(window.GCenters?GCenters.HOME:""),
            status:e.status||"new",client_name:e.name||"",client_phone:String(e.phone||"").replace(/\D/g,""),scheduled_at:e.scheduledAt||null,
            payload:Object.assign({},e.payload||{}),__res:null,assigned:e.assigned||null,staff_note:e.staffNote||"",created_at:new Date(created).toISOString(),updated_at:e.updatedAt||new Date(created).toISOString(),__k:LOCAL_KEYS.staff});
          return;
        }
        const type=kind==="other"?(e.type||"callback"):kind;
        /* постоянный id: время оформления (createdAt или «дд.мм.гггг, чч:мм:сс»), иначе — от номера заявки */
        let created=e.createdAt?Date.parse(e.createdAt):NaN;
        if(isNaN(created)){const m=/(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(String(e.date||""));
          if(m)created=new Date(+m[3],+m[2]-1,+m[1],+(m[4]||0),+(m[5]||0),+(m[6]||0)).getTime();}
        if(isNaN(created))created=1e12+(parseInt(e.num,10)||i)*1000;
        const st=e.remoteStatus||(e.status==="cancelled"?"cancelled":(e.status==="done"?"done":"new"));
        /* центр заявки: «центр:филиал» — другой центр, без префикса — основной («Гармония») */
        const center=e.branch&&String(e.branch).includes(":")?String(e.branch).split(":")[0]:(window.GCenters?GCenters.HOME:"");
        let br=e.branch?String(e.branch).split(":").pop():brIdByName(e.cityName||e.city);
        if(!br||!cityData[br])br=(typeof currentCity!=="undefined"&&cityData[currentCity])?currentCity:firstBranch();
        out.push({id:created,num:e.num,type,branch:br,center,status:st,
          client_name:(kind==="other"?e.name:"")||(e.recipient&&e.recipient.name)||(e.passengerNames&&e.passengerNames[0])||nm,
          client_phone:(kind==="other"?String(e.phone||"").replace(/\D/g,""):"")||(e.recipient&&String(e.recipient.phone||"").replace(/\D/g,""))||ph,
          scheduled_at:e.visitDate?(e.visitDate+" "+(e.visitTime||"")).trim():(e.date&&/^\d{4}-/.test(e.date)?(e.date+" "+(e.time||"")).trim():null),
          payload:kind==="other"?(e.payload||{}):type==="taxi"?{from:e.from,to:e.to,pax:e.pax,wheelchair:!!e.wheelchair,isFree:!!e.isFree,comment:e.comment||"",tariff:e.tariff,price:e.price}:
            type==="order"?{items:(Array.isArray(e.itemsRaw)?e.itemsRaw:Array.isArray(e.items)?e.items:String(e.items||"").split(/\n|;\s*/).filter(Boolean).map(n=>({name:n,qty:1}))).map(x=>({name:x.name||x.n||String(x),qty:x.qty||x.count||1,price:x.price!=null?x.price:x.p})),total:e.total!=null?e.total:(parseFloat(String(e.sum||"").replace(/\s/g,""))||null)}:
            {dept:e.dept||e.category,spec:e.spec||e.specialist,service:e.service},
          __res:(e.pendingReq&&e.pendingReq.payload&&e.pendingReq.payload.resident)||(e.payload&&e.payload.resident)||null,
          /* у такси на устройстве машина «предварительная», пока её не подтвердил диспетчер */
          assigned:type==="taxi"?(e.carConfirmed?e.car||null:null):(e.car||null),staff_note:e.staffNote||"",created_at:new Date(created).toISOString(),updated_at:new Date(created).toISOString(),__k:LOCAL_KEYS[kind]});
      });
    });
    /* данные получателя: из заявки или из личного кабинета на этом устройстве */
    const prof=window.GRemote&&GRemote.residentInfo?GRemote.residentInfo():(()=>{
      let pr={};try{pr=JSON.parse(localStorage.getItem("userProfile")||"{}")||{};}catch(e){}
      const g=k=>localStorage.getItem(k)||"";
      const r={name:g("clientName"),phone:g("clientPhone"),snils:g("clientSnils"),birthDate:pr.birthDate||"",category:pr.category||"",address:pr.address||"",contactName:pr.contactName||"",contactPhone:pr.contactPhone||"",note:pr.note||""};
      Object.keys(r).forEach(k=>{if(!r[k]||r[k]==="Гость"||r[k]==="—")delete r[k];});return r;})();
    out.forEach(x=>{x.payload=x.payload||{};x.payload.resident=x.__res||prof||{};delete x.__res;});
    return out;
  }
  function localApi(method,path,body){
    const u=new URL(path,"http://x"),sp=u.searchParams,p=u.pathname;
    let items=localItems();
    /* у каждого центра свои заявки */
    if(window.GCenters)items=items.filter(x=>!x.center||x.center===GCenters.current());
    if(method==="GET"&&p==="/admin/requests/latest")return {last:items.reduce((m,x)=>Math.max(m,x.id),0),fresh:items.filter(x=>x.status==="new").length};
    if(method==="GET"&&p==="/admin/requests"){
      if(sp.get("type"))items=items.filter(x=>x.type===sp.get("type"));
      if(sp.get("branch"))items=items.filter(x=>x.branch===sp.get("branch").split(":").pop());
      if(sp.get("status")==="active")items=items.filter(x=>["new","confirmed","assigned"].includes(x.status));
      else if(sp.get("status"))items=items.filter(x=>x.status===sp.get("status"));
      if(sp.get("date"))items=items.filter(x=>(x.scheduled_at||x.created_at).slice(0,10)===sp.get("date"));
      if(sp.get("since"))items=items.filter(x=>x.id>+sp.get("since"));
      if(sp.get("q")){const q=sp.get("q").toLowerCase();items=items.filter(x=>(x.num+" "+x.client_name+" "+x.client_phone).toLowerCase().includes(q));}
      return {items:items.sort((a,b)=>String(a.scheduled_at||a.created_at).localeCompare(String(b.scheduled_at||b.created_at)))};
    }
    let m=/^\/admin\/requests\/(\d+)\/history$/.exec(p);if(m)return {items:[]};
    m=/^\/admin\/requests\/(\d+)$/.exec(p);
    if(m&&method==="PATCH"){
      const it=items.find(x=>x.id===+m[1]);if(!it)throw Object.assign(new Error("Заявка не найдена"),{status:404});
      const arr=localRead(it.__k),e=arr.find(z=>String(z.num)===String(it.num));
      if(e&&it.__k===LOCAL_KEYS.staff){
        if(body.status)e.status=body.status;
        if(body.assigned!==undefined)e.assigned=body.assigned||null;
        if(body.staffNote!==undefined)e.staffNote=body.staffNote;
        if(body.scheduledAt)e.scheduledAt=body.scheduledAt;
        if(body.details)e.payload=Object.assign({},e.payload||{},body.details);
        e.updatedAt=new Date().toISOString();
        localStorage.setItem(it.__k,JSON.stringify(arr));
      }else if(e){
        if(body.status){e.remoteStatus=body.status;if(body.status==="cancelled"||body.status==="rejected")e.status="cancelled";}
        if(body.assigned!==undefined){e.car=body.assigned||null;e.carConfirmed=!!body.assigned;}
        if(body.staffNote!==undefined)e.staffNote=body.staffNote;
        /* перенос и уточнение — житель на этом устройстве видит изменения */
        if(body.scheduledAt){const d=body.scheduledAt.slice(0,10),t=body.scheduledAt.slice(11);if(it.type==="booking"){e.visitDate=d;e.visitTime=t;}else{e.date=d;e.time=t;}}
        if(body.details){["from","to","pax","wheelchair","isFree","comment"].forEach(k=>{if(body.details[k]!==undefined)e[k]=body.details[k];});}
        localStorage.setItem(it.__k,JSON.stringify(arr));
      }
      return {ok:true};
    }
    /* заявка, принятая сотрудником по телефону */
    if(method==="POST"&&p==="/admin/requests"){
      const arr=localRead(LOCAL_KEYS.staff),num=String(100000+Math.floor(Math.random()*900000));
      const ph=String(body.phone||"").replace(/\D/g,"");
      if(ph.length<10)throw Object.assign(new Error("Укажите телефон"),{status:400});
      arr.unshift({num,type:body.type,branch:body.branch,status:body.status==="confirmed"?"confirmed":"new",name:body.name,phone:ph,scheduledAt:body.scheduledAt||null,
        payload:Object.assign({},body.payload||{},{source:"phone"}),createdAt:new Date().toISOString()});
      localStorage.setItem(LOCAL_KEYS.staff,JSON.stringify(arr.slice(0,500)));
      const it=localItems().find(x=>x.num===num);
      return {id:it?it.id:Date.now(),num,status:body.status==="confirmed"?"confirmed":"new"};
    }
    if(method==="GET"&&p==="/admin/residents/history"){
      const ph=String(sp.get("phone")||"").replace(/\D/g,"").slice(-10);
      return {items:items.filter(x=>x.client_phone&&x.client_phone.slice(-10)===ph).sort((a,b)=>b.id-a.id)};
    }
    if(method==="POST"&&p==="/admin/residents/anonymize"){
      const ph=String(body.phone||"").replace(/\D/g,"").slice(-10);let n=0;
      Object.values(LOCAL_KEYS).forEach(k=>{const arr=localRead(k);let ch=false;
        arr.forEach(e=>{const ep=String(e.phone||(e.recipient&&e.recipient.phone)||"").replace(/\D/g,"").slice(-10);
          if(k===LOCAL_KEYS.staff&&ep===ph){e.name="(обезличено)";e.phone="";if(e.payload){delete e.payload.resident;delete e.payload.comment;}n++;ch=true;}});
        if(ch)localStorage.setItem(k,JSON.stringify(arr));});
      return {count:n};
    }
    if(method==="GET"&&p==="/admin/audit")return {items:[]};
    if(method==="GET"&&p==="/admin/stats"){
      const days=+(sp.get("days")||30),from=Date.now()-days*864e5;
      let xs=items.filter(x=>x.id>=from);if(sp.get("branch"))xs=xs.filter(x=>x.branch===sp.get("branch").split(":").pop());
      const cnt=(f)=>xs.reduce((o,x)=>{const k=f(x);o[k]=(o[k]||0)+1;return o;},{});
      const perDay=Object.entries(cnt(x=>x.created_at.slice(0,10))).map(([day,n])=>({day,n})).sort((a,b)=>a.day.localeCompare(b.day));
      const taxi=xs.filter(x=>x.type==="taxi");
      const cars=Object.values(taxi.filter(x=>x.assigned&&x.assigned.model).reduce((o,x)=>{const k=x.assigned.plate||x.assigned.model;(o[k]=o[k]||{model:x.assigned.model,plate:x.assigned.plate,n:0}).n++;return o;},{}));
      const top=Object.entries(xs.filter(x=>x.type==="order").reduce((o,x)=>{(x.payload.items||[]).forEach(i=>{o[i.name]=(o[i.name]||0)+(i.qty||1);});return o;},{})).map(([name,n])=>({name,n})).sort((a,b)=>b.n-a.n).slice(0,10);
      return {days,types:["order","booking","taxi","callback","event","feedback"],byType:cnt(x=>x.type),byStatus:cnt(x=>x.status),
        byBranch:Object.entries(cnt(x=>x.branch+"|"+x.type)).map(([k,n])=>({branch:k.split("|")[0],type:k.split("|")[1],n})),perDay,topServices:top,cars,
        taxi:{free:taxi.filter(x=>x.payload.isFree).length,wheelchair:taxi.filter(x=>x.payload.wheelchair).length},visits:[]};
    }
    throw Object.assign(new Error("В тестовом режиме недоступно — нужен сервер"),{status:0});
  }
  /* Excel без сервера: заявки из этого браузера */
  function localXlsx(path){
    const sp=new URL(path,"http://x").searchParams;
    let items=localApi("GET","/admin/requests?"+sp.toString()).items;
    const TR={order:"Заявка на услуги",booking:"Запись",taxi:"Такси"},SR={new:"Новая",confirmed:"Подтверждена",assigned:"Машина назначена",done:"Выполнена",cancelled:"Отменена",rejected:"Отклонена"};
    const rows=[["№","Создана","Филиал","Тип","Статус","Житель","Телефон","Дата и время","Содержание","Машина","Сообщение центра"]].concat(items.map(x=>{const p=x.payload||{};
      return [x.num,new Date(x.created_at).toLocaleString("ru-RU"),branchName(x.branch),TR[x.type]||x.type,SR[x.status]||x.status,x.client_name,x.client_phone?"+"+x.client_phone:"",x.scheduled_at||"",
        x.type==="taxi"?(p.from||"")+" → "+(p.to||""):x.type==="order"?(p.items||[]).map(i=>i.name).join("; "):[p.dept,p.spec,p.service].filter(Boolean).join(" · "),
        x.assigned&&x.assigned.model?x.assigned.model+" "+(x.assigned.plate||""):"",x.staff_note||""];}));
    XLite.download(XLite.write([{name:"Заявки",rows,widths:[9,18,14,18,16,30,15,17,60,22,40]}]),"Заявки.xlsx");
  }

  /* ═══ Получатели: все жители, обращавшиеся в центр, с их заявками ═══ */
  function catLabel(k){const c=(window.GSettings&&GSettings.get().categories&&GSettings.get().categories.length?GSettings.get().categories:(window.RCP_CATS_DEFAULT||[])).find(x=>x.key===k);return c?c.label:(k||"");}
  function residentHtml(x){
    const r=Object.assign({},(x.payload||{}).resident||{});
    const rows=[["СНИЛС",r.snils],["Дата рождения",r.birthDate?r.birthDate.split("-").reverse().join("."):""],["Категория",catLabel(r.category)],["Адрес",r.address||(x.payload||{}).address],
      ["Доверенное лицо",[r.contactName,r.contactPhone].filter(Boolean).join(", ")],["Примечание",r.note]].filter(v=>v[1]);
    return rows.length?`<div class="adm2-rq-res">${rows.map(v=>`<span><i>${v[0]}</i>${esc(v[1])}</span>`).join("")}</div>`:"";
  }
  const RES_RU={order:"Заявка на услуги",booking:"Запись",taxi:"Такси",callback:"Обратный звонок",event:"Мероприятие",feedback:"Отзыв"};
  const RES_ST={new:"Новая",confirmed:"Подтверждена",assigned:"Машина назначена",done:"Выполнена",cancelled:"Отменена",rejected:"Отклонена"};
  let resQ="",resOpen=null;
  function renderResidents(body){
    body.innerHTML=head("Получатели — "+(window.GCenters?esc(GCenters.centerName(GCenters.get())):"центр"),"Все жители, оформлявшие заявки: данные из личного кабинета, история обращений и статусы.")+
      `<div class="adm2-toolbar"><input class="adm2-inp" id="resFind" placeholder="Поиск: ФИО, телефон, СНИЛС, адрес" value="${esc(resQ)}" style="flex:1;min-width:220px" aria-label="Поиск получателя">
        <label class="adm2-check"><input type="checkbox" id="resAll"${reqFilter.allBranches?" checked":""}> Все филиалы</label>
        <button type="button" class="adm2-btn ghost" id="resXlsx">${window.ico("download")} Excel</button></div>
      <div id="resList"><div class="adm2-empty">Загрузка…</div></div>`;
    const p=new URLSearchParams({limit:"1000"});scopeQ(p,!reqFilter.allBranches);
    apiCall("GET","/admin/requests?"+p).then(d=>{
      const map={};
      (d.items||[]).forEach(x=>{
        const r=(x.payload||{}).resident||{};
        const key=(String(x.client_phone||"").replace(/\D/g,"").slice(-10))||String(x.client_name||"").toLowerCase();
        if(!key)return;
        const m=map[key]||(map[key]={key,name:x.client_name,phone:x.client_phone,res:{},items:[],last:""});
        Object.keys(r).forEach(k=>{if(r[k])m.res[k]=r[k];});
        if(x.client_name&&x.client_name.split(" ").length>=m.name.split(" ").length)m.name=x.client_name;
        m.items.push(x);if(String(x.created_at)>m.last)m.last=String(x.created_at);
      });
      let list=Object.values(map).sort((a,b)=>b.last.localeCompare(a.last));
      const all=list;
      const render=()=>{
        const q=resQ.trim().toLowerCase();
        list=all.filter(m=>!q||[m.name,m.phone,m.res.snils,m.res.address].join(" ").toLowerCase().includes(q));
        const el=body.querySelector("#resList");
        if(!all.length){el.innerHTML='<div class="adm2-empty">Обращений пока нет.</div>';return;}
        el.innerHTML=`<div class="adm2-kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px"><div><b>${all.length}</b><span>получателей</span></div><div><b>${all.reduce((n,m)=>n+m.items.length,0)}</b><span>обращений</span></div><div><b>${all.filter(m=>m.items.some(x=>["new","confirmed","assigned"].includes(x.status))).length}</b><span>с активными заявками</span></div></div>`+
          list.map(m=>{const act=m.items.filter(x=>["new","confirmed","assigned"].includes(x.status)).length;const open=resOpen===m.key;
            return `<section class="adm2-res${open?" open":""}" data-rk="${esc(m.key)}"><button type="button" class="adm2-res-head" data-rtoggle>
              <span class="adm2-res-ava">${window.USER_ICON||""}</span>
              <span class="adm2-res-main"><b>${esc(m.name||"Без имени")}</b><small>${m.phone?"+"+esc(String(m.phone).replace(/^\+/,"")):""}${m.res.category?" · "+esc(catLabel(m.res.category)):""}</small></span>
              <span class="adm2-res-cnt"><b>${m.items.length}</b> ${plural(m.items.length,["обращение","обращения","обращений"])}${act?` · <em>${act} в работе</em>`:""}</span></button>
              ${open?`<div class="adm2-res-body">
                ${residentHtml({payload:{resident:m.res}})||'<div class="adm2-note">Дополнительные данные житель не заполнял.</div>'}
                <div class="adm2-res-hist">${m.items.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at))).map(x=>`<div class="adm2-res-row"><span>${esc(RES_RU[x.type]||x.type)} № ${esc(x.num)}</span><span>${new Date(x.created_at).toLocaleDateString("ru-RU")}${x.scheduled_at?" → "+esc(x.scheduled_at.slice(8,10)+"."+x.scheduled_at.slice(5,7)+" "+x.scheduled_at.slice(11)):""}</span><span class="adm2-badge ${({done:"off",cancelled:"off",rejected:"off",new:"warn"})[x.status]||"on"}">${esc(RES_ST[x.status]||x.status)}</span></div>`).join("")}</div>
                ${m.phone?`<div class="adm2-actions"><a class="adm2-btn ghost sm" href="tel:+${esc(String(m.phone).replace(/\D/g,""))}">${window.ico("phone")} Позвонить</a>${API&&hasRole("admin")?`<button type="button" class="adm2-btn ghost sm danger" data-ranon="${esc(m.phone)}">${window.ico("shield")} Обезличить по заявлению</button>`:""}</div>`:""}
              </div>`:""}</section>`;}).join("")||'<div class="adm2-empty">Никого не найдено.</div>';
        el.querySelectorAll("[data-rtoggle]").forEach(b=>b.onclick=()=>{const k=b.closest("[data-rk]").dataset.rk;resOpen=resOpen===k?null:k;render();});
        /* 152-ФЗ: по заявлению жителя — ФИО, телефон, СНИЛС и адрес удаляются из всех его заявок; заявки остаются в статистике */
        el.querySelectorAll("[data-ranon]").forEach(b=>b.onclick=()=>{
          const reason=prompt("Обезличивание данных жителя по его заявлению.\nУкажите основание (например, «заявление № 12 от 05.10.2026»):","");
          if(reason===null)return;
          if(!reason.trim()){showToast("Укажите основание");return;}
          if(!confirm("Удалить ФИО, телефон, СНИЛС и адрес этого жителя из всех его заявок? Отменить нельзя."))return;
          apiCall("POST","/admin/residents/anonymize",{phone:b.dataset.ranon,confirm:"ОБЕЗЛИЧИТЬ",reason:reason.trim()})
            .then(d=>{showToast("Обезличено заявок: "+d.count);resOpen=null;renderResidents(body);}).catch(e=>showToast(e.message));
        });
      };
      render();
      body.querySelector("#resFind").oninput=e=>{resQ=e.target.value;render();};
      body.querySelector("#resXlsx").onclick=()=>{
        const rows=[["ФИО","Телефон","СНИЛС","Дата рождения","Категория","Адрес","Доверенное лицо","Обращений","В работе","Последнее"]].concat(all.map(m=>[m.name,m.phone?"+"+String(m.phone).replace(/^\+/,""):"",m.res.snils||"",m.res.birthDate||"",catLabel(m.res.category),m.res.address||"",
          [m.res.contactName,m.res.contactPhone].filter(Boolean).join(", "),m.items.length,m.items.filter(x=>["new","confirmed","assigned"].includes(x.status)).length,new Date(m.last).toLocaleDateString("ru-RU")]));
        XLite.download(XLite.write([{name:"Получатели",rows,widths:[34,16,16,14,22,40,30,12,10,14]}]),"Получатели.xlsx");
      };
    }).catch(e=>{body.querySelector("#resList").innerHTML='<div class="adm2-empty">'+esc(e.message)+'</div>';});
    body.querySelector("#resAll").onchange=e=>{reqFilter.allBranches=e.target.checked;renderResidents(body);};
  }

  /* ═══ Серверный режим: журнал действий ═══ */
  function renderAudit(body){
    const ACT={login:"вход",logout:"выход",login_failed:"неудачный вход",login_denied:"вход запрещён (нет группы)",content_publish:"публикация",request_update:"изменение заявки",requests_view:"просмотр заявок",
      export_requests:"выгрузка заявок в Excel",export_stats:"выгрузка статистики",export_visits:"выгрузка выездов",visit_create:"выезд запланирован",visit_update:"выезд изменён",visit_delete:"выезд удалён",
      retention:"обезличивание старых данных (152-ФЗ)"};
    body.innerHTML=head("Журнал действий","Последние 300 записей: входы сотрудников, публикации, изменения заявок.")+'<div id="auList"><div class="adm2-empty">Загрузка…</div></div>';
    apiCall("GET","/admin/audit").then(d=>{
      body.querySelector("#auList").innerHTML='<div class="adm2-table-wrap"><table class="adm2-table adm2-shifts"><thead><tr><th>Когда</th><th>Кто</th><th>Действие</th><th>Объект</th><th>IP</th></tr></thead><tbody>'+
        d.items.map(i=>`<tr${/failed|denied/.test(i.action)?' class="bad"':""}><td>${new Date(i.at).toLocaleString("ru-RU")}</td><td>${esc(i.actor)}</td><td>${esc(ACT[i.action]||i.action)}${i.details&&i.details.reason?" — "+esc(i.details.reason):""}</td><td>${esc(i.object||"")}</td><td>${esc(i.ip||"")}</td></tr>`).join("")+'</tbody></table></div>';
    }).catch(e=>{body.querySelector("#auList").innerHTML='<div class="adm2-empty">'+esc(e.message)+'</div>';});
  }

  /* ═══ Публикация ═══ */
  
  function renderPublish(body){
    flushSave();
    body.innerHTML=head("Публикация","На сервере изменения становятся видны жителям после кнопки «Опубликовать».")+
      `<div class="adm2-banner warn"><span class="adm2-banner-ico">${window.ico("warn")}</span><div><b>Тестовый режим без сервера</b>
        <span>Правки сохраняются только в этом браузере и жителям не видны. Публикация работает при входе доменной учётной записью на сервере.</span></div></div>
      <div class="adm2-sub">Резервная копия</div>
      <div class="adm2-actions">
        <button type="button" class="adm2-btn ghost" id="admExport">Скачать копию данных</button>
        <button type="button" class="adm2-btn ghost" id="admImport">Загрузить из файла</button>
        <button type="button" class="adm2-btn danger" id="admReset">Сбросить тестовые правки</button>
      </div>`;
    body.querySelector("#admExport").onclick=exportJSON;
    body.querySelector("#admImport").onclick=()=>document.getElementById("admFile").click();
    body.querySelector("#admReset").onclick=()=>{if(confirm("Удалить тестовые правки в этом браузере?")){localStorage.removeItem("adminOverrides");location.reload();}};
  }
  
  function exportJSON(){
    flushSave();
    const ov=snapshot();ov.publishedAt=new Date().toISOString();
    const blob=new Blob([JSON.stringify(ov)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);
    a.download="socuslugi-dannye-"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1500);
    showToast("Резервная копия данных скачана");
  }
  function importJSON(file){
    if(!file)return;
    const r=new FileReader();
    r.onload=()=>{
      try{
        const ov=JSON.parse(r.result);
        if(!ov||typeof ov!=="object"||(!ov.branchContent&&!ov.cityData&&!ov.centers))throw new Error("format");
        delete ov.publishedAt;
        if(!API)localStorage.setItem("adminOverrides",JSON.stringify(ov));
        applyOv(ov);refreshActive();
        if(API)serverSaveDraft();
        showToast("Данные загружены из файла");
        renderShell(document.getElementById("adminFs"));
      }catch(e){showToast("Это не файл данных панели или он повреждён");}
    };
    r.readAsText(file);
  }

})();
