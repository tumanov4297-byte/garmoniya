
const FONT_STEPS=[0.85,0.925,1,1.125,1.25];
let fontIdx=parseInt(localStorage.getItem("fontIdx"));
if(isNaN(fontIdx)||fontIdx<0||fontIdx>=FONT_STEPS.length)fontIdx=2;
const SUPPORTS_ZOOM=(function(){
  try{const t=document.createElement("div");t.style.zoom="1.1";return t.style.zoom==="1.1";}catch(e){return false;}
})();
function applyFontSize(){
  const scale=FONT_STEPS[fontIdx];
  const shell=document.getElementById("shell");
  if(shell){
    if(SUPPORTS_ZOOM){
      shell.style.zoom=scale;
      shell.style.transform="";
    }else{
      shell.style.transform="scale("+scale+")";
      shell.style.transformOrigin="top center";
      shell.style.width=(100/scale)+"%";
      shell.style.height=(100/scale)+"%";
    }
  }
  document.documentElement.style.setProperty("--fz-base",Math.round(16*scale)+"px");
}
function changeFontSize(dir){
  fontIdx=Math.max(0,Math.min(FONT_STEPS.length-1,fontIdx+dir));
  localStorage.setItem("fontIdx",String(fontIdx));
  applyFontSize();
  showToast(dir>0?"Шрифт увеличен":"Шрифт уменьшен");
}
applyFontSize();

let darkMode=localStorage.getItem("darkMode")==="1";
function applyTheme(){
  document.getElementById("shell")?.classList.toggle("dark",darkMode);
  document.body.classList.toggle("dark-body",darkMode);
  document.body.classList.toggle("dark",darkMode);
  const btn=document.getElementById("themeBtn");
  if(btn)btn.textContent=darkMode?"☀️":"🌙";
}
function toggleDarkTheme(){
  darkMode=!darkMode;
  localStorage.setItem("darkMode",darkMode?"1":"0");
  applyTheme();
}

document.addEventListener("DOMContentLoaded",applyTheme);
setTimeout(applyTheme,0);

function getProfiles(){
  try{return JSON.parse(localStorage.getItem("profiles")||"[]");}catch(e){return [];}
}
function saveProfiles(p){localStorage.setItem("profiles",JSON.stringify(p));}
function getActiveProfileIdx(){return parseInt(localStorage.getItem("activeProfile")||"0");}

function openProfileSwitcher(){
  const profiles=getProfiles();
  const activeIdx=localStorage.getItem("activeProfile");
  const isOnSub=activeIdx!==null;
  const ovl=document.createElement("div");ovl.className="mo";ovl.setAttribute("role","dialog");
  ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
  let mainName=clientName,mainPhone=clientPhone;
  if(isOnSub){try{const m=JSON.parse(localStorage.getItem("mainProfile")||"null");if(m){mainName=m.name;mainPhone=m.phone;}}catch(e){}}
  let html=`<div class="mc"><h3>Профили получателей</h3>
    <div class="profile-hint">Переключайтесь между получателями, не выходя из системы.</div>`;
  html+=`<div class="prof-card ${!isOnSub?"active-prof":""}" ${isOnSub?'onclick="restoreAndRefresh()"':''}><div class="prof-ico">👤</div><div><div class="prof-name">${mainName||"Основной"}</div><div class="prof-sub">${mainPhone||""} · Основной</div></div>${!isOnSub?'<span class="prof-badge">Активен</span>':'<span class="prof-badge" style="color:var(--teal)">Выбрать</span>'}</div>`;
  profiles.forEach((p,i)=>{
    const isActive=isOnSub&&+activeIdx===i;
    html+=`<div class="prof-card ${isActive?"active-prof":""}" ${!isActive?`onclick="activateProfile(${i})"`:""}><div class="prof-ico">${p.icon||"👤"}</div><div><div class="prof-name">${p.name}</div><div class="prof-sub">${p.phone||""} ${p.label?"· "+p.label:""}</div></div>${isActive?'<span class="prof-badge">Активен</span>':`<button class="adm-del" onclick="event.stopPropagation();removeProfile(${i})" aria-label="Удалить">✕</button>`}</div>`;
  });
  html+=`<button class="admin-btn" onclick="addProfileForm()">➕ Добавить получателя</button>
    <div id="profForm"></div>
    <button class="close-mo" onclick="this.closest('.mo').remove()">Закрыть</button></div>`;
  ovl.innerHTML=html;
  document.body.appendChild(ovl);
}

function activateProfile(idx){
  const profiles=getProfiles();
  const p=profiles[idx];if(!p)return;
  if(!localStorage.getItem("mainProfile")){
    localStorage.setItem("mainProfile",JSON.stringify({name:clientName,phone:clientPhone,snils:clientSnils}));
  }
  clientName=p.name;clientPhone=p.phone||"";clientSnils=p.snils||"";
  localStorage.setItem("clientName",clientName);
  localStorage.setItem("clientPhone",clientPhone);
  localStorage.setItem("clientSnils",clientSnils);
  localStorage.setItem("activeProfile",String(idx));
  showToast("👤 "+p.name);
  document.querySelector(".mo")?.remove();
  if(typeof showMainMenu==="function")setTimeout(showMainMenu,200);
}

function restoreAndRefresh(){
  restoreMainProfile();
  document.querySelector(".mo")?.remove();
  if(typeof showMainMenu==="function")setTimeout(showMainMenu,200);
}

function restoreMainProfile(){
  try{
    const m=JSON.parse(localStorage.getItem("mainProfile")||"null");
    if(m){clientName=m.name;clientPhone=m.phone;clientSnils=m.snils||"";
      localStorage.setItem("clientName",clientName);localStorage.setItem("clientPhone",clientPhone);localStorage.setItem("clientSnils",clientSnils);}
  }catch(e){}
  localStorage.removeItem("activeProfile");
  localStorage.removeItem("mainProfile");
}

function addProfileForm(){
  var f=document.getElementById("profForm");if(!f)return;
  f.innerHTML='<div class="prof-form">'+
    '<label class="admin-lbl">Кем приходится</label>'+
    '<div class="prof-icons">'+
    ["👨 Папа","👩 Мама","👴 Дедушка","👵 Бабушка","👦 Сын","👧 Дочь","👤 Другое"].map(function(x){
      var parts=x.split(" ");
      return '<button type="button" class="prof-icon-btn" data-icon="'+parts[0]+'" data-label="'+parts[1]+'" onclick="selectProfIcon(this)">'+parts[0]+'<br><span>'+parts[1]+'</span></button>';
    }).join("")+
    '</div>'+
    '<label class="admin-lbl">ФИО получателя</label>'+
    '<input class="admin-inp" id="profName" placeholder="Фамилия Имя Отчество">'+
    '<label class="admin-lbl">Телефон</label>'+
    '<input class="admin-inp" id="profPhone" placeholder="+7 (___) ___-__-__" inputmode="tel">'+
    '<label class="admin-lbl">СНИЛС</label>'+
    '<input class="admin-inp" id="profSnils" placeholder="000-000-000 00" inputmode="numeric">'+
    '<button class="admin-btn" onclick="saveNewProfile()">Сохранить</button>'+
    '</div>';
}

var _profIcon="👤",_profLabel="";
function selectProfIcon(btn){
  document.querySelectorAll(".prof-icon-btn").forEach(function(b){b.classList.remove("sel");});
  btn.classList.add("sel");
  _profIcon=btn.dataset.icon;
  _profLabel=btn.dataset.label;
}

function saveNewProfile(){
  var nameEl=document.getElementById("profName");
  var phoneEl=document.getElementById("profPhone");
  var snilsEl=document.getElementById("profSnils");
  var name=nameEl?nameEl.value.trim():"";
  var phone=phoneEl?phoneEl.value.trim():"";
  var snils=snilsEl?snilsEl.value.trim():"";
  if(!name){showToast("Укажите ФИО");return;}
  var profiles=getProfiles();
  profiles.push({name:name,phone:phone,snils:snils,icon:_profIcon,label:_profLabel});
  saveProfiles(profiles);
  showToast("Профиль сохранён");
  document.querySelector(".mo")?.remove();
  openProfileSwitcher();
}

function removeProfile(idx){
  var profiles=getProfiles();
  profiles.splice(idx,1);
  saveProfiles(profiles);
  showToast("Профиль удалён");
  document.querySelector(".mo")?.remove();
  openProfileSwitcher();
}

function exportToCalendar(booking){
  if(!booking)return;

  const dp=(booking.visitDate||"").split(".");
  const tp=(booking.visitTime||"09:00").split(":");
  let dt;
  if(dp.length===3){
    dt=new Date(+dp[2],+dp[1]-1,+dp[0],+(tp[0]||9),+(tp[1]||0));
  }else{
    dt=new Date();dt.setHours(9,0,0,0);dt.setDate(dt.getDate()+1);
  }
  const end=new Date(dt.getTime()+60*60000);
  const fmt=d=>{
    const pad=n=>String(n).padStart(2,"0");
    return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"T"+pad(d.getHours())+pad(d.getMinutes())+"00";
  };
  const ics=[
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Garmoniya//RU","CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "DTSTART:"+fmt(dt),
    "DTEND:"+fmt(end),
    "SUMMARY:ЦСОН Гармония — "+( booking.spec||"Визит"),
    "DESCRIPTION:Талон: "+(booking.num||"")+"\\nСпециалист: "+(booking.spec||"")+"\\n"+(booking.dept||""),
    "LOCATION:ЦСОН Гармония\\, г. "+(typeof currentCityName!=="undefined"?currentCityName:""),
    "BEGIN:VALARM","TRIGGER:-PT1H","ACTION:DISPLAY","DESCRIPTION:Напоминание о визите","END:VALARM",
    "END:VEVENT","END:VCALENDAR"
  ].join("\r\n");
  const blob=new Blob([ics],{type:"text/calendar;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=(booking.num||"visit")+".ics";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  showToast("📅 Добавлено в календарь");
}

function trackCartAdd(name){
  try{
    const stats=JSON.parse(localStorage.getItem("cartStats")||"{}");
    stats[name]=(stats[name]||0)+1;
    localStorage.setItem("cartStats",JSON.stringify(stats));
  }catch(e){}
}

function getTopServices(n){
  try{
    const stats=JSON.parse(localStorage.getItem("cartStats")||"{}");
    return Object.entries(stats).sort((a,b)=>b[1]-a[1]).slice(0,n||10);
  }catch(e){return [];}
}

function showCartStats(){
  const top=getTopServices(10);
  if(!top.length){showToast("📊 Пока нет данных");return;}
  const modal=document.createElement("div");modal.className="mo";modal.setAttribute("role","dialog");
  modal.onclick=e=>{if(e.target===modal)modal.remove();};
  const maxVal=top[0][1];
  const bars=top.map(([name,count],i)=>{
    const pct=Math.round(count/maxVal*100);
    return `<div class="stat-row"><span class="stat-pos">${i+1}</span><div class="stat-bar-wrap"><div class="stat-bar" style="width:${pct}%"></div><span class="stat-name">${name}</span></div><span class="stat-count">${count}×</span></div>`;
  }).join("");
  modal.innerHTML=`<div class="mc"><h3>📊 Популярные услуги</h3><div class="stat-hint">Что чаще добавляют в корзину на этом устройстве</div>${bars}<button class="close-mo" onclick="this.closest('.mo').remove()">Закрыть</button></div>`;
  document.body.appendChild(modal);
}

const I18N={
  ru:{
    greeting_morning:"☀️ Доброе утро",greeting_day:"🌤 Добрый день",greeting_evening:"🌙 Добрый вечер",
    menu_services:"Прейскурант",menu_services_sub:"Услуги и цены",
    menu_booking:"Записаться",menu_booking_sub:"Запись к специалисту",
    menu_calc:"Льготы",menu_calc_sub:"Калькулятор льгот",
    menu_home_worker:"Соцработник на дом",menu_home_worker_sub:"Вызвать на дом",
    menu_callback:"Обратный звонок",menu_callback_sub:"Перезвоним вам",
    menu_events:"Мероприятия",menu_events_sub:"Афиша и запись",
    menu_news:"Новости",menu_news_sub:"Анонсы и события",
    menu_staff:"Сотрудники",menu_staff_sub:"Контакты отделений",
    menu_contacts:"Контакты",menu_contacts_sub:"Адрес, телефон, email",
    menu_faq:"Вопросы",menu_faq_sub:"Частые вопросы",
    menu_emergency:"Экстренная помощь",menu_emergency_sub:"Психологическая помощь",
    menu_cart:"Корзина",menu_feedback:"Обратная связь",menu_feedback_sub:"Оценить качество",
    menu_moroshka:"Карта Морошка",menu_moroshka_sub:"Льготы и скидки",
    menu_cabinet:"Мой кабинет",menu_cabinet_sub:"История, талоны",
    menu_gallery:"Фотогалерея",
    sec_services:"Услуги и информация",sec_cabinet:"Кабинет",
    ask_helper:"Спросить помощника",ask_helper_sub:"Задайте вопрос — подскажу нужный раздел",
    btn_close:"Закрыть",btn_back:"← Назад",btn_home:"🏠 Главная",
    cart_title:"🛒 Корзина заявки",cart_empty:"🛒 Корзина пуста",
    cart_send:"📧 Отправить заявку",cart_clear:"🗑 Очистить корзину",
    profile_title:"👤 Личный кабинет",profile_name:"Получатель",profile_phone:"Телефон",
    tab_orders:"Заявки",tab_bookings:"Записи",tab_fav:"Избр.",tab_docs:"Док-ты",
    stat_title:"📊 Популярные услуги",stat_hint:"Что чаще добавляют в корзину",
    profiles_title:"👨‍👩‍👦 Профили получателей",profiles_hint:"Переключайтесь между получателями",
    profiles_add:"➕ Добавить получателя",profiles_active:"Активен",
    switched_to:"📍 Переключено на",how_help:"Чем могу помочь?",
    lang_name:"Русский",
    tb_home:"Главная",tb_menu:"Услуги",tb_cart:"Корзина",tb_orders:"Заявки",tb_profile:"Профиль",
    orders_title:"📋 Мои заявки",orders_filter_all:"Все",orders_filter_orders:"🛒 Заявки",orders_filter_bookings:"📅 Записи",
    orders_empty_title:"Пока нет заявок и записей",orders_empty_orders:"Нет заявок на услуги",orders_empty_bookings:"Нет записей к специалистам",
    close_and_return:"Закрыть и вернуться",
    services_title:"Прейскурант услуг",services_search_ph:"Поиск услуги по названию...",
    staff_title:"Сотрудники",staff_search_ph:"Поиск по ФИО или должности...",
    booking_title:"📝 Запись к специалисту",
    booking_step1:"Выберите отделение",booking_step2:"Выберите специалиста",
    booking_step3:"Выберите дату",booking_step4:"Выберите время",
    booking_comment:"Комментарий (необязательно)",booking_comment_ph:"Цель визита, особые потребности…",
    booking_confirm:"Проверьте данные записи",booking_send:"📧 Подтвердить запись",
    feedback_title:"💬 Обратная связь",feedback_intro:"Нам важно ваше мнение — это поможет сделать центр лучше.",
    feedback_rate:"Оцените работу центра",feedback_like:"Что понравилось?",
    feedback_comment_ph:"Напишите пожелания или замечания…",feedback_send:"📧 Отправить отзыв",
    gallery_title:"🖼️ Фотогалерея центра",gallery_empty:"Пока нет фотографий",
    settings_title:"Настройки",settings_appearance:"Внешний вид",settings_data:"Мои данные",
    settings_font:"Размер шрифта",settings_theme:"Тёмная тема",
    settings_export:"Экспорт моих данных",settings_reset:"Очистить все данные",
    logout_btn:"🚪 Выйти / Сменить пользователя",
    edit_data:"✏️ Изменить данные",quick_orders:"Мои заявки",quick_services:"Прейскурант",
    quick_booking:"Записаться",quick_feedback:"Отзыв"
  },
  en:{
    greeting_morning:"☀️ Good morning",greeting_day:"🌤 Good afternoon",greeting_evening:"🌙 Good evening",
    menu_services:"Services",menu_services_sub:"Prices and catalog",
    menu_booking:"Book visit",menu_booking_sub:"Schedule an appointment",
    menu_calc:"Benefits",menu_calc_sub:"Eligibility calculator",
    menu_home_worker:"Home visit",menu_home_worker_sub:"Social worker at home",
    menu_callback:"Callback",menu_callback_sub:"We will call you",
    menu_events:"Events",menu_events_sub:"Schedule and signup",
    menu_news:"News",menu_news_sub:"Announcements",
    menu_staff:"Staff",menu_staff_sub:"Department contacts",
    menu_contacts:"Contacts",menu_contacts_sub:"Address, phone, email",
    menu_faq:"FAQ",menu_faq_sub:"Frequently asked questions",
    menu_emergency:"Emergency",menu_emergency_sub:"Psychological help",
    menu_cart:"Cart",menu_feedback:"Feedback",menu_feedback_sub:"Rate our service",
    menu_moroshka:"Moroshka card",menu_moroshka_sub:"Discounts",
    menu_cabinet:"My account",menu_cabinet_sub:"History, tickets",
    menu_gallery:"Photo gallery",
    sec_services:"Services & Info",sec_cabinet:"Account",
    ask_helper:"Ask assistant",ask_helper_sub:"Ask a question — I'll find the right section",
    btn_close:"Close",btn_back:"← Back",btn_home:"🏠 Home",
    cart_title:"🛒 Service cart",cart_empty:"🛒 Cart is empty",
    cart_send:"📧 Send request",cart_clear:"🗑 Clear cart",
    profile_title:"👤 My account",profile_name:"Recipient",profile_phone:"Phone",
    tab_orders:"Orders",tab_bookings:"Bookings",tab_fav:"Fav.",tab_docs:"Docs",
    stat_title:"📊 Popular services",stat_hint:"Most frequently added to cart",
    profiles_title:"👨‍👩‍👦 Recipient profiles",profiles_hint:"Switch between recipients",
    profiles_add:"➕ Add recipient",profiles_active:"Active",
    switched_to:"📍 Switched to",how_help:"How can I help?",
    lang_name:"English",
    tb_home:"Home",tb_menu:"Services",tb_cart:"Cart",tb_orders:"Orders",tb_profile:"Profile",
    orders_title:"📋 My requests",orders_filter_all:"All",orders_filter_orders:"🛒 Requests",orders_filter_bookings:"📅 Bookings",
    orders_empty_title:"No requests or bookings yet",orders_empty_orders:"No service requests",orders_empty_bookings:"No appointments booked",
    close_and_return:"Close and return",
    services_title:"Price list",services_search_ph:"Search services by name...",
    staff_title:"Staff",staff_search_ph:"Search by name or position...",
    booking_title:"📝 Book an appointment",
    booking_step1:"Choose department",booking_step2:"Choose specialist",
    booking_step3:"Choose date",booking_step4:"Choose time",
    booking_comment:"Comment (optional)",booking_comment_ph:"Purpose of visit, special needs…",
    booking_confirm:"Review your appointment",booking_send:"📧 Confirm appointment",
    feedback_title:"💬 Feedback",feedback_intro:"Your opinion matters — it helps us improve the center.",
    feedback_rate:"Rate the center's work",feedback_like:"What did you like?",
    feedback_comment_ph:"Write your suggestions or comments…",feedback_send:"📧 Send feedback",
    gallery_title:"🖼️ Photo gallery",gallery_empty:"No photos yet",
    settings_title:"Settings",settings_appearance:"Appearance",settings_data:"My data",
    settings_font:"Font size",settings_theme:"Dark theme",
    settings_export:"Export my data",settings_reset:"Clear all data",
    logout_btn:"🚪 Log out / Switch user",
    edit_data:"✏️ Edit data",quick_orders:"My requests",quick_services:"Price list",
    quick_booking:"Book visit",quick_feedback:"Feedback"
  },
  yrk:{
    greeting_morning:"☀️ Ям яля",greeting_day:"🌤 Ям яля",greeting_evening:"🌙 Пыд яля",
    menu_services:"Ёнарˮма",menu_services_sub:"Нюдяˮ мярˮ",
    menu_booking:"Тохолабцˮ",menu_booking_sub:"Тохолабцˮ хамадабцˮ",
    menu_contacts:"Хаерˮ",menu_contacts_sub:"Тел., email",
    menu_emergency:"Мэнарˮ яляˮ",menu_emergency_sub:"Ненэцяˮ яляˮ",
    btn_close:"Тасˮ",btn_home:"🏠 Нюдяˮ",
    ask_helper:"Тарем ваˮ хэваˮ",ask_helper_sub:"Маняˮ ваˮ тарем",
    how_help:"Маняˮ ханяˮ тарем ваˮ?",
    lang_name:"Ненэцяˮ",
    _note:"Заготовка — дополняет носитель языка"
  },
  kca:{
    greeting_morning:"☀️ Ёмас хӑтәл",greeting_day:"🌤 Ёмас хӑтәл",greeting_evening:"🌙 Ёмас ет",
    menu_services:"Тӑхи",menu_services_sub:"Нэмәт па тыӆ",
    menu_booking:"Хансупсы",menu_booking_sub:"Мир хуща",
    menu_contacts:"Хотәт",menu_contacts_sub:"Тел., email",
    menu_emergency:"Вой мухты",menu_emergency_sub:"Мухты верты",
    btn_close:"Шӑши",btn_home:"🏠 Хот",
    ask_helper:"Ёш пӑта вантэ",ask_helper_sub:"Вӑнтэ па путрэ",
    how_help:"Мўӈ мухты верты?",
    lang_name:"Хӑнты",
    _note:"Заготовка — дополняет носитель языка"
  }
};

let currentLang=localStorage.getItem("lang")||"ru";

function t(key){
  return (I18N[currentLang]&&I18N[currentLang][key])||I18N.ru[key]||key;
}

function applyTabBarLabels(){
  const map={tbLblHome:"tb_home",tbLblMenu:"tb_menu",tbLblCart:"tb_cart",tbLblOrders:"tb_orders",tbLblProfile:"tb_profile"};
  Object.keys(map).forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.textContent=t(map[id]);
  });
  const staticMap={
    cartTitleH2:"cart_title",cartCloseLbl:"close_and_return",
    ordersTitleH2:"orders_title",ordersCloseLbl:"close_and_return",
    ordFilterAll:"orders_filter_all",ordFilterOrders:"orders_filter_orders",ordFilterBookings:"orders_filter_bookings",
    profCloseLbl:"close_and_return"
  };
  Object.keys(staticMap).forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.textContent=t(staticMap[id]);
  });
}
function switchLang(lang){
  currentLang=lang;
  localStorage.setItem("lang",lang);
  const sel=document.getElementById("langSel");
  if(sel)sel.value=lang;
  showToast("🌐 "+t("lang_name"));
  applyTabBarLabels();

  const doc=document;
  if(doc.getElementById("cartPanel")&&doc.getElementById("cartPanel").classList.contains("open")&&typeof renderCart==="function"){
    renderCart();
  }else if(doc.getElementById("ordersPanel")&&doc.getElementById("ordersPanel").classList.contains("open")&&typeof renderOrdersPanel==="function"){
    const activeF=doc.querySelector(".of-btn.active");
    renderOrdersPanel(activeF?activeF.dataset.f:"all");
  }else if(doc.getElementById("profilePanel")&&doc.getElementById("profilePanel").classList.contains("open")&&typeof renderProfilePanel==="function"){
    renderProfilePanel();
  }else if(doc.querySelector(".pricelist")&&typeof showServices==="function"){
    showServices();
  }else if(doc.querySelector(".booking-page")&&typeof showBooking==="function"){
    showBooking();
  }else if(doc.querySelector(".feedback-page")&&typeof showFeedback==="function"){
    showFeedback();
  }else if(doc.querySelector(".svc-page")&&typeof showMenuPage==="function"){
    showMenuPage();
  }else if(doc.querySelector(".gallery-page")&&typeof showGallery==="function"){
    showGallery();
  }else if(doc.querySelector(".home-view")&&typeof showMainMenu==="function"){
    showMainMenu();
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  const sel=document.getElementById("langSel");
  if(sel)sel.value=currentLang;
  applyTabBarLabels();
});

function showRating(context){
  setTimeout(()=>{
    const wrap=document.createElement("div");wrap.className="rating-card";
    wrap.innerHTML=`
      <div class="rating-title">⭐ Оцените удобство оформления</div>
      <div class="rating-stars" id="ratingStars">
        ${[1,2,3,4,5].map(n=>`<button class="star-btn" data-val="${n}" aria-label="${n} звёзд">${n<=0?"☆":"★"}</button>`).join("")}
      </div>
      <div class="rating-label" id="ratingLabel"></div>
      <textarea class="rating-comment" id="ratingComment" placeholder="Комментарий (необязательно)" rows="2"></textarea>
      <button class="rating-send" id="ratingSend" disabled>Отправить отзыв</button>
      <button class="rating-skip" onclick="this.closest('.rating-card').remove()">Пропустить</button>`;
    const labels=["","Плохо","Так себе","Нормально","Хорошо","Отлично!"];
    let selectedVal=0;
    wrap.querySelectorAll(".star-btn").forEach(btn=>{
      btn.onclick=()=>{
        selectedVal=+btn.dataset.val;
        wrap.querySelectorAll(".star-btn").forEach((b,i)=>{
          b.textContent=i<selectedVal?"★":"☆";
          b.classList.toggle("lit",i<selectedVal);
        });
        document.getElementById("ratingLabel").textContent=labels[selectedVal]||"";
        document.getElementById("ratingSend").disabled=false;
      };
    });
    wrap.querySelector("#ratingSend").onclick=()=>{
      const comment=document.getElementById("ratingComment")?.value||"";

      try{
        const ratings=JSON.parse(localStorage.getItem("ratings")||"[]");
        ratings.push({date:new Date().toISOString(),stars:selectedVal,comment,context});
        localStorage.setItem("ratings",JSON.stringify(ratings));
      }catch(e){}
      if(typeof window.GarmoniyaDB?.saveOrder==="function"){
        window.GarmoniyaDB.saveOrder({clientName:typeof clientName!=="undefined"?clientName:"",clientPhone:"",cityName:typeof currentCityName!=="undefined"?currentCityName:"",total:0,
          items:[{name:"Оценка: "+selectedVal+"★ "+(comment?comment.slice(0,50):""),qty:1,price:0}]});
      }
      wrap.innerHTML='<div class="rating-thanks">🙏 Спасибо за отзыв!</div>';
      setTimeout(()=>wrap.remove(),2000);
    };
    if(typeof actionsEl!=="undefined")actionsEl.appendChild(wrap);
  },800);
}

function getSeasonalGreeting(){
  const now=new Date(),d=now.getDate(),m=now.getMonth()+1;

  if((m===12&&d>=25)||(m===1&&d<=8))
    return{emoji:"🎄",text:"С Новым годом и Рождеством! Желаем здоровья, тепла и благополучия вашей семье! 🎉"};

  if(m===2&&d>=22&&d<=24)
    return{emoji:"🎖️",text:"С Днём защитника Отечества! Мира, силы и здоровья! 💪"};

  if(m===3&&d>=7&&d<=9)
    return{emoji:"💐",text:"С Международным женским днём! Красоты, радости и весеннего настроения! 🌷"};

  if(m===5&&d>=8&&d<=10)
    return{emoji:"🎗️",text:"С Днём Победы! Вечная память героям. Мирного неба над головой! 🕊️"};

  if(m===6&&d===1)
    return{emoji:"👶",text:"С Днём защиты детей! Пусть каждый ребёнок будет счастлив и любим! 🌈"};

  if(m===10&&d>=1&&d<=2)
    return{emoji:"🤍",text:"С Днём пожилого человека! Спасибо за мудрость и доброту. Здоровья и долгих лет! 🌿"};

  if(m===12&&d>=2&&d<=4)
    return{emoji:"💙",text:"С Международным днём людей с инвалидностью. Каждый человек достоин уважения и поддержки. 🤝"};

  if(m===6&&d>=7&&d<=9)
    return{emoji:"❤️",text:"С Днём социального работника! Спасибо за ваш труд и заботу о людях! 🌟"};
  return null;
}

function showSeasonalGreeting(){
  const g=getSeasonalGreeting();if(!g)return;
  const key="seasonal_"+new Date().toISOString().slice(0,10);
  if(localStorage.getItem(key))return;
  localStorage.setItem(key,"1");
  setTimeout(()=>{
    if(typeof addMsg==="function"){
      addMsg(`<div class="seasonal-card"><span class="seasonal-emoji">${g.emoji}</span>${g.text}</div>`,true);
    }
  },600);
}

function showOnboarding(){
  if(localStorage.getItem("onboardingDone"))return;
  const steps=[
    {emoji:"👋",title:"Добро пожаловать!",text:"Я — виртуальный помощник центра «Гармония». Помогу с услугами, записью и вопросами."},
    {emoji:"📋",title:"Прейскурант",text:"В разделе «Прейскурант» — все услуги с ценами. Нажмите ★, чтобы добавить в избранное."},
    {emoji:"🤖",title:"Помощник",text:"Нажмите «Спросить помощника» и задайте вопрос своими словами — подскажу нужный раздел."},
    {emoji:"🛒",title:"Корзина",text:"Добавляйте услуги в корзину кнопкой «+» и отправляйте заявку одним нажатием."},
    {emoji:"📝",title:"Запись",text:"Запишитесь к специалисту, закажите обратный звонок или вызовите соцработника на дом."},
    {emoji:"🍊",title:"Карта Морошка",text:"Включите тумблер 🍊 в шапке — цены пересчитаются со скидкой 5%."},
    {emoji:"👤",title:"Личный кабинет",text:"В кабинете — история заявок, записи, избранное и документы для скачивания."},
    {emoji:"🌙",title:"Настройки",text:"Под шапкой: размер шрифта (А−/А+), тёмная тема (🌙) и язык интерфейса."}
  ];
  let idx=0;
  const ovl=document.createElement("div");ovl.className="onb-ovl";
  function render(){
    const s=steps[idx];
    const isLast=idx===steps.length-1;
    const dots=steps.map((_,i)=>`<span class="onb-dot ${i===idx?"active":""}"></span>`).join("");
    ovl.innerHTML=`<div class="onb-card">
      <div class="onb-emoji">${s.emoji}</div>
      <div class="onb-title">${s.title}</div>
      <div class="onb-text">${s.text}</div>
      <div class="onb-dots">${dots}</div>
      <div class="onb-btns">
        ${idx>0?'<button class="onb-btn ghost" id="onbPrev">← Назад</button>':'<button class="onb-btn ghost" id="onbSkip">Пропустить</button>'}
        <button class="onb-btn" id="onbNext">${isLast?"Начать! 🚀":"Далее →"}</button>
      </div>
    </div>`;
    ovl.querySelector("#onbNext").onclick=()=>{if(isLast){localStorage.setItem("onboardingDone","1");ovl.remove();}else{idx++;render();}};
    const prev=ovl.querySelector("#onbPrev");if(prev)prev.onclick=()=>{idx--;render();};
    const skip=ovl.querySelector("#onbSkip");if(skip)skip.onclick=()=>{localStorage.setItem("onboardingDone","1");ovl.remove();};
  }
  render();
  document.body.appendChild(ovl);
}

function showLiveChat(){
  if(typeof clearActions==="function")clearActions();
  if(typeof setNav==="function")setNav(true);
  document.getElementById("searchBar")?.classList.add("gone");
  if(typeof addMsg==="function")addMsg("💬 Связаться с оператором. Выберите удобный способ — специалист ответит в рабочее время (Пн–Пт, 08:30–18:00).",true);
  setTimeout(()=>{
    const cd=(typeof cityData!=="undefined"&&typeof currentCity!=="undefined")?cityData[currentCity]:{};
    const phone=cd.phoneRaw||"73493627077";
    const email=typeof ORG_EMAIL!=="undefined"?ORG_EMAIL:"cson-gub@yanao.ru";
    const wrap=document.createElement("div");wrap.className="chat-channels";
    const channels=[
      {icon:"📞",name:"Позвонить",sub:cd.phone||"8(34936)2-70-77",action:`tel:+${phone}`,cl:"ch-phone"},
      {icon:"💬",name:"Макс",sub:"Мессенджер max.ru",action:`https://max.ru/`,cl:"ch-max"},
      {icon:"📧",name:"Email",sub:email,action:`mailto:${email}?subject=${encodeURIComponent("Обращение из бота «Гармония»")}&body=${encodeURIComponent("Здравствуйте!\n\nИмя: "+(typeof clientName!=="undefined"?clientName:"")+"\nТелефон: "+(typeof clientPhone!=="undefined"?clientPhone:"")+"\n\nМой вопрос:\n")}`,cl:"ch-email"}
    ];
    channels.forEach(ch=>{
      const card=document.createElement("a");card.href=ch.action;card.target="_blank";card.rel="noopener";
      card.className="ch-card "+ch.cl;
      card.innerHTML=`<span class="ch-icon">${ch.icon}</span><div class="ch-info"><div class="ch-name">${ch.name}</div><div class="ch-sub">${ch.sub}</div></div><span class="ch-arrow">→</span>`;
      wrap.appendChild(card);
    });
    if(typeof actionsEl!=="undefined")actionsEl.appendChild(wrap);
  },200);
}

function editQuestionnaire(){
  document.querySelectorAll(".mo").forEach(m=>m.remove());
  let p={};try{p=JSON.parse(localStorage.getItem("userProfile")||"{}");}catch(e){}
  const catLabels={pensioner:"Пенсионер",disabled:"Инвалид",family:"Семья с детьми",large_family:"Многодетная семья",veteran:"Ветеран",other:"Другое"};
  const ovl=document.createElement("div");ovl.className="mo";
  ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
  ovl.innerHTML=`<div class="mc" style="max-width:400px">
    <h3 style="text-align:center">📋 Анкета получателя</h3>
    <p style="font-size:13px;color:var(--text-secondary);text-align:center;margin-bottom:14px">Данные помогают точнее подбирать услуги. Заполнение необязательно.</p>
    <label class="admin-lbl">Дата рождения</label>
    <input type="date" class="admin-inp" id="eqBirth" value="${p.birthDate||""}">
    <label class="admin-lbl">Категория</label>
    <select class="admin-inp" id="eqCat">
      <option value="">Выберите...</option>
      ${Object.entries(catLabels).map(([k,l])=>`<option value="${k}" ${p.category===k?"selected":""}>${l}</option>`).join("")}
    </select>
    <label class="admin-lbl">Адрес проживания</label>
    <input class="admin-inp" id="eqAddr" value="${(p.address||"").replace(/"/g,"&quot;")}" placeholder="Город, улица, дом, квартира">
    <label class="admin-lbl">Особые потребности</label>
    <textarea class="admin-inp" id="eqNote" rows="2" placeholder="Пожелания, особенности...">${p.note||""}</textarea>
    <button class="act-btn teal" id="eqSave" style="width:100%;margin-top:12px;min-height:48px">💾 Сохранить</button>
    <button class="close-mo" style="width:100%;margin-top:6px" onclick="this.closest('.mo').remove()">Отмена</button>
  </div>`;
  document.body.appendChild(ovl);
  ovl.querySelector("#eqSave").onclick=()=>{
    const data={
      birthDate:document.getElementById("eqBirth").value,
      category:document.getElementById("eqCat").value,
      address:document.getElementById("eqAddr").value,
      note:document.getElementById("eqNote").value,
      filledAt:new Date().toISOString()
    };
    localStorage.setItem("userProfile",JSON.stringify(data));
    localStorage.setItem("questionnaireDone","1");
    showToast("💾 Анкета сохранена");
    ovl.remove();
    if(typeof renderProfilePanel==="function"&&document.getElementById("profBody"))renderProfilePanel();
  };
}
