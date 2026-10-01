
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

/* Тёмная тема удалена: приложение всегда в светлом оформлении «Гармония IT».
   Имена darkMode/applyTheme/toggleDarkTheme оставлены как заглушки,
   чтобы старый код и сохранённые ссылки ничего не сломали. */
const darkMode=false;
try{ localStorage.removeItem("darkMode"); localStorage.removeItem("themeManual"); }catch(e){}
function applyTheme(){
  document.getElementById("shell")?.classList.remove("dark");
  document.body.classList.remove("dark-body","dark");
}
function toggleDarkTheme(){ applyTheme(); }

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
  showToast(""+p.name);
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
  showToast("Добавлено в календарь");
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
  if(!top.length){showToast("Пока нет данных");return;}
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
    menu_services:"Записаться на услуги",menu_services_sub:"Услуги и цены",
    menu_booking:"Записаться",menu_booking_sub:"Запись к специалисту",
    menu_calc:"Льготы",menu_calc_sub:"Калькулятор льгот",
    menu_home_worker:"Соцработник на дом",menu_home_worker_sub:"Вызвать на дом",
    menu_callback:"Обратный звонок",menu_callback_sub:"Перезвоним вам",
    menu_events:"Мероприятия",menu_events_sub:"Афиша и запись",
    menu_news:"Новости",menu_news_sub:"Анонсы и события",
    menu_staff:"Сотрудники",menu_staff_sub:"Контакты отделений",
    menu_contacts:"Контакты",menu_contacts_sub:"Адрес, телефон, email",
    menu_emergency:"Экстренная помощь",menu_emergency_sub:"Психологическая помощь",
    menu_cart:"Корзина",menu_feedback:"Обратная связь",menu_feedback_sub:"Оценить качество",
    menu_moroshka:"Карта Морошка",menu_moroshka_sub:"Льготы и скидки",
    menu_cabinet:"Мой кабинет",menu_cabinet_sub:"История, талоны",
    menu_gallery:"Фотогалерея",
    sec_services:"Услуги и информация",sec_cabinet:"Кабинет",
    ask_helper:"Спросить чат-бот",ask_helper_sub:"Задайте вопрос — подскажу нужный раздел",
    btn_close:"Закрыть",btn_back:"← Назад",btn_home:"🏠 Главная",
    cart_title:"Корзина заявки",cart_empty:"Корзина пуста",
    cart_send:"📧 Отправить заявку",cart_clear:"🗑 Очистить корзину",
    profile_title:"Личный кабинет",profile_name:"Получатель",profile_phone:"Телефон",
    tab_orders:"Заявки",tab_bookings:"Записи",tab_fav:"Избр.",tab_docs:"Док-ты",
    stat_title:"📊 Популярные услуги",stat_hint:"Что чаще добавляют в корзину",
    profiles_title:"👨‍👩‍👦 Профили получателей",profiles_hint:"Переключайтесь между получателями",
    profiles_add:"➕ Добавить получателя",profiles_active:"Активен",
    switched_to:"📍 Переключено на",how_help:"Чем могу помочь?",
    lang_name:"Русский",
    tb_home:"Главная",tb_menu:"Услуги",tb_cart:"Корзина",tb_orders:"Заявки",
    orders_title:"Мои заявки",orders_filter_all:"Все",orders_filter_orders:"Заявки",orders_filter_bookings:"Записи",orders_filter_taxi:"Такси",
    orders_empty_title:"Пока нет заявок и записей",orders_empty_orders:"Нет заявок на услуги",orders_empty_bookings:"Нет записей к специалистам",
    close_and_return:"Закрыть и вернуться",
    services_title:"Записаться на услуги",services_search_ph:"Поиск услуги по названию...",
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
    settings_font:"Размер шрифта",
    settings_export:"Экспорт моих данных",settings_reset:"Очистить все данные",
    logout_btn:"🚪 Выйти / Сменить пользователя",
    edit_data:"✏️ Изменить данные",quick_orders:"Мои заявки",quick_services:"Записаться на услуги",
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
    menu_emergency:"Emergency",menu_emergency_sub:"Psychological help",
    menu_cart:"Cart",menu_feedback:"Feedback",menu_feedback_sub:"Rate our service",
    menu_moroshka:"Moroshka card",menu_moroshka_sub:"Discounts",
    menu_cabinet:"My account",menu_cabinet_sub:"History, tickets",
    menu_gallery:"Photo gallery",
    sec_services:"Services & Info",sec_cabinet:"Account",
    ask_helper:"Ask assistant",ask_helper_sub:"Ask a question — I'll find the right section",
    btn_close:"Close",btn_back:"← Back",btn_home:"🏠 Home",
    cart_title:"Service cart",cart_empty:"Cart is empty",
    cart_send:"📧 Send request",cart_clear:"🗑 Clear cart",
    profile_title:"My account",profile_name:"Recipient",profile_phone:"Phone",
    tab_orders:"Orders",tab_bookings:"Bookings",tab_fav:"Fav.",tab_docs:"Docs",
    stat_title:"📊 Popular services",stat_hint:"Most frequently added to cart",
    profiles_title:"👨‍👩‍👦 Recipient profiles",profiles_hint:"Switch between recipients",
    profiles_add:"➕ Add recipient",profiles_active:"Active",
    switched_to:"📍 Switched to",how_help:"How can I help?",
    lang_name:"English",
    tb_home:"Home",tb_menu:"Services",tb_cart:"Cart",tb_orders:"Orders",
    orders_title:"My requests",orders_filter_all:"All",orders_filter_orders:"Requests",orders_filter_bookings:"Bookings",orders_filter_taxi:"Taxi",
    orders_empty_title:"No requests or bookings yet",orders_empty_orders:"No service requests",orders_empty_bookings:"No appointments booked",
    close_and_return:"Close and return",
    services_title:"Book services",services_search_ph:"Search services by name...",
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
    settings_font:"Font size",
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
  const map={tbLblHome:"tb_home",tbLblMenu:"tb_menu",tbLblCart:"tb_cart",tbLblOrders:"tb_orders"};
  Object.keys(map).forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.textContent=t(map[id]);
  });
  const staticMap={
    cartTitleH2:"cart_title",cartCloseLbl:"close_and_return",
    ordersTitleH2:"orders_title",ordersCloseLbl:"close_and_return",
    ordFilterAll:"orders_filter_all",ordFilterOrders:"orders_filter_orders",ordFilterBookings:"orders_filter_bookings",ordFilterTaxi:"orders_filter_taxi",
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
  showToast(""+t("lang_name"));
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
      // Поздравление ставим в начало ленты и не уводим экран вниз — главная открывается сверху.
      setTimeout(function(){
        const ch=document.getElementById("chat");if(!ch)return;
        const rows=ch.querySelectorAll(".msg-row");const r=rows[rows.length-1];
        if(r&&ch.firstChild!==r)ch.insertBefore(r,ch.firstChild);
        ch.scrollTo({top:0,behavior:"auto"});
      },80);
    }
  },600);
}

function showOnboarding(){
  if(localStorage.getItem("onboardingDone"))return;
  const steps=[
    {emoji:"👋",title:"Добро пожаловать!",text:"Я — чат-бот центра «Гармония». Помогу с услугами, записью, такси и вопросами."},
    {emoji:"📖",title:"Запись на услуги",text:"В разделе «Записаться на услуги» — все услуги с ценами. Нажмите ★, чтобы добавить в избранное."},
    {emoji:"💬",title:"Чат-бот",text:"Нажмите «Спросить чат-бот» и задайте вопрос своими словами — подскажу нужный раздел."},
    {emoji:"🚕",title:"Такси",text:"Закажите поездку с сопровождением или без. Есть бесплатный тариф для льготных категорий."},
    {emoji:"🛒",title:"Корзина",text:"Добавляйте услуги в корзину кнопкой «+» и отправляйте заявку одним нажатием."},
    {emoji:"🍊",title:"Карта Морошка",text:"Включите тумблер 🍊 в шапке — цены пересчитаются со скидкой 5%."},
    {emoji:"👤",title:"Личный кабинет",text:"В кабинете — история заявок, записи, заказы такси, избранное и документы для скачивания."}
  ];
  let idx=0;
  const ovl=document.createElement("div");ovl.className="onb-ovl";
  function render(){
    const s=steps[idx];
    const isLast=idx===steps.length-1;
    const progress=Math.round(((idx+1)/steps.length)*100);
    const dots=steps.map((_,i)=>`<span class="onb-dot ${i===idx?"active":i<idx?"done":""}"></span>`).join("");
    ovl.innerHTML=`<div class="onb-card">
      <div class="onb-progress"><div class="onb-progress-fill" style="width:${progress}%"></div></div>
      ${idx===0
        ?'<div class="onb-bot-live"><img src="img/bot-live.webp" alt=""></div>'
        :`<div class="onb-emoji-badge"><span class="onb-emoji">${s.emoji}</span></div>`}
      <div class="onb-title">${s.title}</div>
      <div class="onb-text">${s.text}</div>
      <div class="onb-dots">${dots}</div>
      <div class="onb-btns">
        ${idx>0?'<button class="onb-btn ghost" id="onbPrev">← Назад</button>':'<button class="onb-btn ghost" id="onbSkip">Пропустить</button>'}
        <button class="onb-btn" id="onbNext">${isLast?"Начать! 🚀":"Далее →"}</button>
      </div>
    </div>`;
    ovl.querySelector("#onbNext").onclick=()=>{if(isLast){localStorage.setItem("onboardingDone","1");ovl.remove();offerQuestionnaireAfterOnboarding();}else{idx++;render();}};
    const prev=ovl.querySelector("#onbPrev");if(prev)prev.onclick=()=>{idx--;render();};
    const skip=ovl.querySelector("#onbSkip");if(skip)skip.onclick=()=>{localStorage.setItem("onboardingDone","1");ovl.remove();offerQuestionnaireAfterOnboarding();};
  }
  render();
  document.body.appendChild(ovl);
}

// Анкета получателя больше не всплывает после знакомства: нужные данные
// спрашиваются прямо в заявке (карточка «Получатель», см. rcpMount ниже).
function offerQuestionnaireAfterOnboarding(){}

function showLiveChat(){
  if(typeof clearActions==="function")clearActions();
  if(typeof setNav==="function")setNav(true);
  document.getElementById("searchBar")?.classList.add("gone");
  if(typeof addMsg==="function")addMsg("💬 Связаться с оператором. Выберите удобный способ — специалист ответит в рабочее время (Пн–Пт, 08:30–18:00, обед 12:30–14:00).",true);
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

/* ═══ Анкета получателя — пошагово ═══
   Один вопрос на экран, крупные поля, «Далее»/«Назад», необязательные шаги
   можно пропустить, в конце — проверка всего с кнопками «Изменить». */
function fmtBirth(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");return m?m[3]+"."+m[2]+"."+m[1]:(iso||"");
}
function editQuestionnaire(startStep){
  document.querySelectorAll(".mo").forEach(m=>m.remove());
  const prof=rcpProfile();
  const d={
    name:recipientHasName()?clientName:"",
    phone:recipientHasPhone()?formatPhone(clientPhone):"",
    snils:(clientSnils&&clientSnils!=="—")?formatSnils(clientSnils):"",
    birth:fmtBirth(prof.birthDate||""),
    category:prof.category||"",
    address:prof.address||"",
    contactName:prof.contactName||"",contactPhone:prof.contactPhone||"",
    note:prof.note||""
  };
  const STEPS=[
    {key:"who",ico:"🪪",title:"Как вас зовут?",sub:"ФИО и телефон нужны, чтобы специалист мог связаться с вами."},
    {key:"docs",ico:"📇",title:"СНИЛС и дата рождения",sub:"Нужны для льготной поездки на такси и оформления соцуслуг. Можно заполнить позже.",optional:true},
    {key:"cat",ico:"🏷️",title:"К какой категории вы относитесь?",sub:"От категории зависят льготы. Выберите один вариант."},
    {key:"addr",ico:"🏠",title:"Где вы живёте?",sub:"Адрес нужен для услуг на дому и такси.",optional:true},
    {key:"extra",ico:"👤",title:"Кому позвонить, если вы не ответите?",sub:"Родственник или сосед. Можно пропустить.",optional:true},
    {key:"check",ico:"✅",title:"Проверьте данные",sub:"Если что-то не так — нажмите «Изменить»."}
  ];
  // Уже заполненную анкету открываем сразу на проверке — править можно точечно.
  if(startStep===undefined&&d.category&&d.name&&d.phone)startStep=STEPS.length-1;
  let step=Math.max(0,Math.min(STEPS.length-1,startStep|0));
  const ovl=document.createElement("div");ovl.className="mo qz-mo";
  ovl.setAttribute("role","dialog");ovl.setAttribute("aria-modal","true");ovl.setAttribute("aria-label","Анкета получателя");
  ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
  const card=document.createElement("div");card.className="mc qz-mc";ovl.appendChild(card);
  document.body.appendChild(ovl);

  const esc=rcpEsc;
  function fld(key,label,ph,opts){
    opts=opts||{};
    return '<div class="qz-fld"><label class="qz-lbl" for="qz_'+key+'">'+label+'</label>'
      +'<input class="qz-inp" id="qz_'+key+'" data-k="'+key+'" type="'+(opts.type||"text")+'"'
      +(opts.im?' inputmode="'+opts.im+'"':'')+' autocomplete="'+(opts.ac||"off")+'" placeholder="'+esc(ph)+'" value="'+esc(d[key])+'">'
      +'<span class="qz-err" data-err="'+key+'"></span></div>';
  }
  function catName(k){const c=RCP_CATS.find(x=>x[0]===k);return c?c[2]+" "+c[1]:"—";}
  function body(){
    const s=STEPS[step];
    if(s.key==="who")return fld("name","ФИО","Фамилия Имя Отчество",{ac:"name"})
      +fld("phone","Телефон","+7 (___) ___-__-__",{type:"tel",im:"tel",ac:"tel"});
    if(s.key==="docs")return fld("snils","СНИЛС","000-000-000 00",{im:"numeric"})
      +fld("birth","Дата рождения","ДД.ММ.ГГГГ",{im:"numeric",ac:"bday"});
    if(s.key==="cat")return '<div class="qz-cats" role="radiogroup" aria-label="Категория">'
      +RCP_CATS.map(c=>'<button type="button" role="radio" aria-checked="'+(d.category===c[0])+'" class="qz-cat'+(d.category===c[0]?" sel":"")+'" data-cat="'+c[0]+'"><span class="qz-cat-ico">'+c[2]+'</span><span>'+c[1]+'</span></button>').join("")
      +'</div><span class="qz-err" data-err="category"></span>';
    if(s.key==="addr")return fld("address","Адрес","Город, улица, дом, квартира",{ac:"street-address"});
    if(s.key==="extra")return fld("contactName","ФИО контактного лица","Например, дочь — Анна Петровна",{})
      +fld("contactPhone","Его телефон","+7 (___) ___-__-__",{type:"tel",im:"tel"})
      +'<div class="qz-fld"><label class="qz-lbl" for="qz_note">Особые потребности</label><textarea class="qz-inp" id="qz_note" data-k="note" rows="2" placeholder="Например: плохо слышу, нужен пандус">'+esc(d.note)+'</textarea></div>';
    // проверка
    const row=(lbl,val,st)=>'<div class="qz-sum-row"><div><span>'+lbl+'</span><b>'+(val?esc(val):'<i>не указано</i>')+'</b></div><button type="button" class="qz-edit" data-go="'+st+'">Изменить</button></div>';
    return '<div class="qz-sum">'
      +row("ФИО",d.name,0)+row("Телефон",d.phone,0)
      +row("СНИЛС",d.snils,1)+row("Дата рождения",d.birth,1)
      +'<div class="qz-sum-row"><div><span>Категория</span><b>'+esc(catName(d.category))+'</b></div><button type="button" class="qz-edit" data-go="2">Изменить</button></div>'
      +row("Адрес",d.address,3)
      +row("Контактное лицо",[d.contactName,d.contactPhone].filter(Boolean).join(", "),4)
      +'</div>';
  }
  function render(focus){
    const s=STEPS[step],last=step===STEPS.length-1,total=STEPS.length-1;
    card.innerHTML=
      '<div class="qz-top">'
        +(step>0?'<button type="button" class="qz-back" aria-label="Назад">←</button>':'<span class="qz-back-ph"></span>')
        +'<span class="qz-count">'+(last?"Готово":"Шаг "+(step+1)+" из "+total)+'</span>'
        +'<button type="button" class="qz-x" aria-label="Закрыть анкету">✕</button>'
      +'</div>'
      +'<div class="qz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+Math.min(step,total)+'"><i style="width:'+Math.round(Math.min(step+ (last?0:1),total)/total*100)+'%"></i></div>'
      +'<div class="qz-step" data-step="'+s.key+'">'
        +'<div class="qz-ico" aria-hidden="true">'+s.ico+'</div>'
        +'<h3 class="qz-title">'+s.title+'</h3>'
        +'<p class="qz-sub">'+s.sub+'</p>'
        +body()
      +'</div>'
      +'<div class="qz-nav">'
        +(last?'<button type="button" class="eq-save-btn qz-next" data-act="save">Сохранить анкету</button>'
              :'<button type="button" class="eq-save-btn qz-next" data-act="next">Далее</button>')
        +(s.optional?'<button type="button" class="eq-cancel-btn qz-skip">Пропустить этот шаг</button>':'')
      +'</div>';
    bind();
    card.scrollTop=0;
    if(focus!==false&&window.matchMedia&&matchMedia("(pointer:fine)").matches){
      const f=card.querySelector(".qz-inp");if(f)setTimeout(()=>f.focus(),40);
    }
  }
  function read(){card.querySelectorAll("[data-k]").forEach(i=>{d[i.dataset.k]=i.value.trim();});}
  function err(k,msg){
    const i=card.querySelector('[data-k="'+k+'"]');if(i)i.classList.add("bad");
    const e=card.querySelector('[data-err="'+k+'"]');if(e)e.textContent=msg;
  }
  function birthIso(v){
    const m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(v||"");if(!m)return null;
    const dd=+m[1],mm=+m[2],yy=+m[3],dt=new Date(yy,mm-1,dd);
    if(dt.getDate()!==dd||dt.getMonth()!==mm-1)return null;
    const age=(Date.now()-dt)/3.15576e10;
    if(age<0||age>120)return null;
    return m[3]+"-"+m[2]+"-"+m[1];
  }
  function validate(){
    read();const key=STEPS[step].key;let ok=true;
    if(key==="who"){
      if(d.name.split(/\s+/).filter(Boolean).length<2){err("name","Напишите фамилию, имя и отчество");ok=false;}
      d.phone=formatPhone(d.phone);
      if(d.phone.replace(/\D/g,"").length!==11){err("phone","Нужен номер из 11 цифр");ok=false;}
    }
    if(key==="docs"){
      if(d.snils&&!snilsValid(d.snils)){err("snils",d.snils.replace(/\D/g,"").length<11?"СНИЛС — 11 цифр":"Похоже, в СНИЛС опечатка — проверьте цифры");ok=false;}
      if(d.birth&&!birthIso(d.birth)){err("birth","Дата в формате ДД.ММ.ГГГГ, например 05.03.1952");ok=false;}
    }
    if(key==="cat"&&!d.category){err("category","Выберите один вариант");ok=false;}
    if(key==="extra"&&d.contactPhone){
      d.contactPhone=formatPhone(d.contactPhone);
      if(d.contactPhone.replace(/\D/g,"").length!==11){err("contactPhone","Нужен номер из 11 цифр");ok=false;}
    }
    if(!ok){const c=card.querySelector(".qz-step");c.classList.remove("shake");void c.offsetWidth;c.classList.add("shake");}
    return ok;
  }
  function save(){
    clientName=d.name;localStorage.setItem("clientName",clientName);
    clientPhone=d.phone;localStorage.setItem("clientPhone",clientPhone);
    clientSnils=d.snils;localStorage.setItem("clientSnils",clientSnils);
    const data=Object.assign(rcpProfile(),{
      birthDate:birthIso(d.birth)||"",category:d.category,address:d.address,
      contactName:d.contactName,contactPhone:d.contactPhone,note:d.note,filledAt:new Date().toISOString()
    });
    localStorage.setItem("userProfile",JSON.stringify(data));
    localStorage.setItem("questionnaireDone","1");
    showToast("Анкета сохранена — данные подставятся в заявки сами");
    ovl.remove();
    if(typeof renderProfilePanel==="function"&&document.getElementById("profBody"))renderProfilePanel();
    if(typeof window.hdrRefresh==="function")window.hdrRefresh();
    const gaName=document.querySelector(".ga-name");if(gaName)gaName.textContent=clientName;
  }
  function go(n){step=n;render();}
  function bind(){
    card.querySelector(".qz-x").onclick=()=>ovl.remove();
    const back=card.querySelector(".qz-back");if(back)back.onclick=()=>{read();go(step-1);};
    const skip=card.querySelector(".qz-skip");
    if(skip)skip.onclick=()=>{
      // пропуск: введённое на этом шаге не проверяем и не сохраняем частично
      const k=STEPS[step].key;
      if(k==="docs"){d.snils=d.snils&&snilsValid(d.snils)?d.snils:"";d.birth=birthIso(d.birth)?d.birth:"";}
      go(step+1);
    };
    card.querySelector(".qz-next").onclick=function(){
      if(this.dataset.act==="save"){
        // финальная проверка обязательных шагов
        if(d.name.split(/\s+/).filter(Boolean).length<2||d.phone.replace(/\D/g,"").length!==11){go(0);setTimeout(validate,30);return;}
        if(!d.category){go(2);setTimeout(validate,30);return;}
        save();return;
      }
      if(validate())go(step+1);
    };
    card.querySelectorAll(".qz-edit").forEach(b=>b.onclick=()=>go(+b.dataset.go));
    card.querySelectorAll(".qz-cat").forEach(b=>b.onclick=()=>{
      d.category=b.dataset.cat;
      card.querySelectorAll(".qz-cat").forEach(x=>{x.classList.toggle("sel",x===b);x.setAttribute("aria-checked",String(x===b));});
      // выбор категории сразу ведёт дальше — меньше нажатий
      setTimeout(()=>go(step+1),220);
    });
    card.querySelectorAll("[data-k]").forEach(i=>{
      i.addEventListener("input",()=>{
        i.classList.remove("bad");const e=card.querySelector('[data-err="'+i.dataset.k+'"]');if(e)e.textContent="";
        if(i.dataset.k==="snils")i.value=formatSnils(i.value);
        if(i.dataset.k==="birth"){
          const v=i.value.replace(/\D/g,"").slice(0,8);let r=v.slice(0,2);
          if(v.length>2)r+="."+v.slice(2,4);if(v.length>4)r+="."+v.slice(4,8);i.value=r;
        }
      });
      if(i.dataset.k==="phone"||i.dataset.k==="contactPhone")i.addEventListener("blur",()=>{if(i.value)i.value=formatPhone(i.value);});
      if(i.tagName==="INPUT")i.addEventListener("keydown",e=>{
        if(e.key!=="Enter")return;e.preventDefault();
        const all=[...card.querySelectorAll("input.qz-inp")],idx=all.indexOf(i);
        if(idx<all.length-1)all[idx+1].focus();else card.querySelector(".qz-next").click();
      });
    });
  }
  render();
}


/* ═══════════════════════════════════════════════════════════════════
   КАРТОЧКА «ПОЛУЧАТЕЛЬ» В ЗАЯВКАХ
   Вместо анкеты при регистрации данные спрашиваются там, где они нужны:
   корзина — ФИО, телефон, СНИЛС (+ адрес по желанию); запись — ФИО, телефон;
   такси — ФИО, телефон, а для льготной поездки ещё СНИЛС и категория.
   Если всё уже известно — показывается свёрнутая карточка с кнопкой «Изменить».
   ═══════════════════════════════════════════════════════════════════ */
const RCP_CATS=[
  ["pensioner","Пенсионер","👴"],["disabled","Инвалид","♿"],["veteran","Ветеран","🎖️"],
  ["family","Семья с детьми","👨‍👩‍👧"],["large_family","Многодетная семья","👨‍👩‍👧‍👦"],["other","Другое","📋"]
];
function rcpEsc(v){return String(v==null?"":v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");}
function rcpProfile(){try{return JSON.parse(localStorage.getItem("userProfile")||"{}")||{};}catch(e){return {};}}
function recipientHasName(){
  const n=(typeof clientName!=="undefined"&&clientName)?String(clientName).trim():"";
  return n.length>3&&n!=="Гость"&&n.split(/\s+/).length>=2;
}
function recipientHasPhone(){
  const p=(typeof clientPhone!=="undefined"&&clientPhone)?String(clientPhone):"";
  return p.replace(/\D/g,"").length>=11;
}
// +7 (999) 000-00-00 из любых 10–11 цифр
function formatPhone(v){
  let d=String(v||"").replace(/\D/g,"");
  if(d.length===10)d="7"+d;
  if(d.length===11&&d[0]==="8")d="7"+d.slice(1);
  if(d.length!==11)return String(v||"").trim();
  return "+7 ("+d.slice(1,4)+") "+d.slice(4,7)+"-"+d.slice(7,9)+"-"+d.slice(9,11);
}
function formatSnils(v){
  const d=String(v||"").replace(/\D/g,"").slice(0,11);let r="";
  if(d.length>0)r+=d.slice(0,3);if(d.length>3)r+="-"+d.slice(3,6);
  if(d.length>6)r+="-"+d.slice(6,9);if(d.length>9)r+=" "+d.slice(9,11);
  return r;
}
// Проверка контрольного числа СНИЛС (для номеров больше 001-001-998).
function snilsValid(v){
  const d=String(v||"").replace(/\D/g,"");
  if(d.length!==11)return false;
  const num=d.slice(0,9),ctrl=parseInt(d.slice(9),10);
  if(parseInt(num,10)<=1001998)return true;
  let sum=0;for(let i=0;i<9;i++)sum+=parseInt(num[i],10)*(9-i);
  let c=sum<100?sum:(sum===100||sum===101)?0:sum%101;
  if(c===100)c=0;
  return c===ctrl;
}
function rcpInitials(name){
  return String(name||"").trim().split(/\s+/).slice(0,2).map(function(w){return w[0]||"";}).join("").toUpperCase()||"?";
}

/* opts: {snils:bool, address:bool, category:bool, title:string}
   Возвращает контроллер {el, validate(), setOpts(opts)}.
   validate() → {ok:true, data:{name,phone,snils,address,category}} | {ok:false} */
function rcpMount(container,opts){
  opts=Object.assign({snils:false,address:false,category:false},opts||{});
  const prof=rcpProfile();
  const st={
    name:recipientHasName()?clientName:"",
    phone:recipientHasPhone()?formatPhone(clientPhone):"",
    snils:(typeof clientSnils!=="undefined"&&clientSnils&&clientSnils!=="—")?formatSnils(clientSnils):"",
    address:prof.address||"",
    category:prof.category||"",
    remember:true, open:false
  };
  const el=document.createElement("div");el.className="rcp";
  container.appendChild(el);

  function complete(){
    if(!st.name||st.name.split(/\s+/).length<2)return false;
    if(st.phone.replace(/\D/g,"").length<11)return false;
    if(opts.snils&&!snilsValid(st.snils))return false;
    if(opts.category&&!st.category)return false;
    return true;
  }
  function catLabel(k){const c=RCP_CATS.find(function(x){return x[0]===k;});return c?c[1]:"";}
  function readInputs(){
    el.querySelectorAll("[data-rcp]").forEach(function(i){st[i.dataset.rcp]=i.value.trim();});
    const rem=el.querySelector(".rcp-remember input");if(rem)st.remember=rem.checked;
  }
  function render(){
    const done=complete();
    const showForm=st.open||!done;
    const metaParts=[];
    if(st.phone)metaParts.push('<span>📱 '+rcpEsc(st.phone)+'</span>');
    if(opts.snils&&st.snils)metaParts.push('<span>📇 СНИЛС …'+rcpEsc(st.snils.replace(/\D/g,"").slice(-4))+'</span>');
    if(opts.category&&st.category)metaParts.push('<span>🏷️ '+rcpEsc(catLabel(st.category))+'</span>');
    if(opts.address&&st.address)metaParts.push('<span>🏠 '+rcpEsc(st.address)+'</span>');
    let html='<div class="rcp-head">'
      +'<span class="rcp-ava'+(done?"":" empty")+'">'+(st.name?rcpEsc(rcpInitials(st.name)):"👤")+'</span>'
      +'<div class="rcp-id"><span class="rcp-cap">'+rcpEsc(opts.title||"Получатель")+'</span>'
      +(st.name&&done?'<b>'+rcpEsc(st.name)+'</b>':'<b class="rcp-ask">'+rcpEsc(opts.ask||"Укажите ваши данные")+'</b>')
      +(done&&metaParts.length?'<div class="rcp-meta">'+metaParts.join("")+'</div>':'')
      +'</div>'
      +(done?'<button type="button" class="rcp-edit" aria-expanded="'+showForm+'">'+(st.open?"Готово":"Изменить")+'</button>':'')
      +'</div>';
    if(showForm){
      html+='<div class="rcp-form">';
      if(!done&&!st.open)html+='<div class="rcp-hint">Заполняется один раз — в следующих заявках подставится само.</div>';
      html+=rcpField("name","ФИО","Фамилия Имя Отчество",st.name,"text","name");
      html+=rcpField("phone","Телефон для связи","+7 (___) ___-__-__",st.phone,"tel","tel");
      if(opts.snils)html+=rcpField("snils","СНИЛС","000-000-000 00",st.snils,"numeric","off");
      if(opts.category){
        html+='<div class="rcp-fld"><span class="rcp-lbl">Категория получателя</span><div class="rcp-cats" role="radiogroup" aria-label="Категория получателя">'
          +RCP_CATS.map(function(c){return '<button type="button" role="radio" aria-checked="'+(st.category===c[0])+'" class="rcp-cat'+(st.category===c[0]?" sel":"")+'" data-cat="'+c[0]+'"><span>'+c[2]+'</span>'+c[1]+'</button>';}).join("")
          +'</div><span class="rcp-err" data-err="category"></span></div>';
      }
      if(opts.address)html+=rcpField("address","Адрес, где нужна услуга (необязательно)","Город, улица, дом, квартира",st.address,"text","street-address");
      html+='<label class="rcp-remember"><input type="checkbox"'+(st.remember?" checked":"")+'> Запомнить для следующих заявок</label>';
      html+='</div>';
    }
    el.innerHTML=html;
    el.classList.toggle("is-done",done&&!st.open);
    bind();
  }
  function bind(){
    const ed=el.querySelector(".rcp-edit");
    if(ed)ed.onclick=function(){readInputs();st.open=!st.open;render();if(st.open){const f=el.querySelector("[data-rcp]");if(f)f.focus();}};
    const ph=el.querySelector('[data-rcp="phone"]');
    if(ph)ph.addEventListener("blur",function(){ph.value=formatPhone(ph.value);});
    const sn=el.querySelector('[data-rcp="snils"]');
    if(sn)sn.addEventListener("input",function(){sn.value=formatSnils(sn.value);});
    el.querySelectorAll("[data-rcp]").forEach(function(i){
      i.addEventListener("input",function(){i.classList.remove("bad");const e=el.querySelector('[data-err="'+i.dataset.rcp+'"]');if(e)e.textContent="";});
    });
    el.querySelectorAll(".rcp-cat").forEach(function(b){
      b.onclick=function(){
        readInputs();st.category=b.dataset.cat;
        el.querySelectorAll(".rcp-cat").forEach(function(x){x.classList.toggle("sel",x===b);x.setAttribute("aria-checked",String(x===b));});
        const e=el.querySelector('[data-err="category"]');if(e)e.textContent="";
      };
    });
  }
  function setErr(key,msg){
    const i=el.querySelector('[data-rcp="'+key+'"]');if(i)i.classList.add("bad");
    const e=el.querySelector('[data-err="'+key+'"]');if(e)e.textContent=msg;
  }
  function validate(){
    if(el.querySelector(".rcp-form"))readInputs();
    st.phone=formatPhone(st.phone);
    const errs=[];
    if(!st.name||st.name.split(/\s+/).length<2)errs.push(["name","Укажите фамилию, имя и отчество"]);
    if(st.phone.replace(/\D/g,"").length<11)errs.push(["phone","Нужен номер из 11 цифр"]);
    if(opts.snils){
      if(st.snils.replace(/\D/g,"").length<11)errs.push(["snils","СНИЛС — 11 цифр"]);
      else if(!snilsValid(st.snils))errs.push(["snils","Похоже, в СНИЛС опечатка — проверьте цифры"]);
    }
    if(opts.category&&!st.category)errs.push(["category","Выберите категорию"]);
    if(errs.length){
      st.open=true;render();
      errs.forEach(function(e){setErr(e[0],e[1]);});
      el.scrollIntoView({behavior:"smooth",block:"center"});
      el.classList.remove("shake");void el.offsetWidth;el.classList.add("shake");
      return {ok:false,message:errs[0][1]};
    }
    const data={name:st.name.replace(/\s+/g," "),phone:st.phone,snils:st.snils,address:st.address,category:st.category};
    if(st.remember)rcpSave(data,opts);
    st.open=false;render();
    return {ok:true,data:data};
  }
  render();
  return {el:el,validate:validate,setOpts:function(o){readInputs();opts=Object.assign(opts,o);render();}};
}
function rcpField(key,label,ph,val,mode,ac){
  const type=mode==="tel"?"tel":"text";
  const im=mode==="numeric"?' inputmode="numeric"':mode==="tel"?' inputmode="tel"':"";
  const id="rcp_"+key+"_"+Math.random().toString(36).slice(2,7);
  return '<div class="rcp-fld"><label class="rcp-lbl" for="'+id+'">'+label+'</label>'
    +'<input class="rcp-inp" id="'+id+'" data-rcp="'+key+'" type="'+type+'"'+im+' autocomplete="'+ac+'" placeholder="'+rcpEsc(ph)+'" value="'+rcpEsc(val)+'">'
    +'<span class="rcp-err" data-err="'+key+'"></span></div>';
}
function rcpSave(d,opts){
  clientName=d.name;localStorage.setItem("clientName",clientName);
  clientPhone=d.phone;localStorage.setItem("clientPhone",clientPhone);
  if(opts.snils&&d.snils){clientSnils=d.snils;localStorage.setItem("clientSnils",clientSnils);}
  const p=rcpProfile();
  if(opts.address&&d.address)p.address=d.address;
  if(opts.category&&d.category)p.category=d.category;
  if(opts.address||opts.category){p.filledAt=new Date().toISOString();localStorage.setItem("userProfile",JSON.stringify(p));}
  if(typeof window.hdrRefresh==="function")window.hdrRefresh();
  const gaName=document.querySelector(".ga-name");if(gaName)gaName.textContent=clientName;
}
