
// ═══════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ ПОДКЛЮЧЕНИЯ К СЕРВЕРУ (ИСЗН ЯНАО)
// Сейчас всё работает на локальных данных (js/data.js).
// Когда backend будет готов — переключить REMOTE_API.enabled=true
// и указать реальный BASE_URL. Подробности: docs/ISZN_INTEGRATION.md
// ═══════════════════════════════════════════════════════════
const REMOTE_API={
  enabled:false,               // false = локальные данные (как сейчас), true = запросы на сервер
  baseUrl:"",                  // например: "https://iszn.yanao.ru/api/v1"
  endpoints:{
    branches:"/branches",
    services:"/branches/{city}/services",
    staff:"/branches/{city}/staff",
    orders:"/orders",          // POST — отправка заявки на услуги
    bookings:"/bookings",      // POST — запись к специалисту
    taxiOrders:"/taxi/orders", // POST — заказ такси
    auth:"/auth/login"         // POST — серверная авторизация администратора
  }
};
async function apiRequest(path,options){
  if(!REMOTE_API.enabled)throw new Error("REMOTE_API отключён — используются локальные данные (см. js/data.js)");
  const res=await fetch(REMOTE_API.baseUrl+path,Object.assign({headers:{"Content-Type":"application/json"}},options||{}));
  if(!res.ok)throw new Error("Сервер вернул ошибку "+res.status);
  return res.json();
}

// ═══════════════════════════════════════════════════════════
// КЛЮЧ API ЯНДЕКС.КАРТ (для поиска адресов такси)
// Сейчас пусто → поиск адресов работает через бесплатный OpenStreetMap.
// Чтобы включить Яндекс.Карты (точнее для российских адресов):
//   1. Зайти на https://developer.tech.yandex.ru/
//   2. Создать проект → подключить «API Геосаджеста» (JavaScript API и Геокодер)
//   3. Скопировать выданный ключ сюда — поиск сам переключится на Яндекс.
// Пока ключ пуст — ничего не сломается, работает текущая система (OSM).
// ═══════════════════════════════════════════════════════════
const YANDEX_MAPS_API_KEY="";

const BRANCH_DISPLAY_NAMES={gubkin:"Губкинский",purpe:"мкр. Пурпе",muravlenko:"Муравленко",noyabrsk:"Ноябрьск",tarko:"Тарко-Сале",urengoy:"пгт. Уренгой"};
function cityPrefixed(name){return /^(г\.|пгт\.|мкр\.)/i.test(name)?name:"г. "+name;}
let currentCity="gubkin",currentCityName="Губкинский",hasMoroshka=null;
let navHistory=[],cart=JSON.parse(localStorage.getItem("cart")||"[]");
let clientName="",clientPhone="",clientSnils="",ordersHistory=[],bookingsHistory=[];
let currentCatId=null,currentSvcList=null;
let fbRating=0,fbTags=[];
let serviceRatings=JSON.parse(localStorage.getItem("serviceRatings")||"{}");
const chatEl=document.getElementById("chat"),actionsEl=document.getElementById("actions");
const badgeEl=document.getElementById("cartBadge");
let ticketCounter=parseInt(localStorage.getItem("ticketCounter")||"100");

const BOT_POSES=["img/bot-avatar.jpg","img/bot-tablet.jpg","img/bot-present.jpg","img/bot-meditate.jpg","img/bot-pray.jpg","img/bot-heart.jpg"];
function randomBotPose(){return BOT_POSES[Math.floor(Math.random()*BOT_POSES.length)];}

function addMsg(html,isBot=true){
  const r=document.createElement("div");r.className="msg-row "+(isBot?"bot":"usr")+" msg-enter";
  if(isBot){
    const av=document.createElement("div");av.className="msg-avatar";
    av.innerHTML='<img src="'+randomBotPose()+'" alt="" class="av-img">';
    r.appendChild(av);
  }
  const b=document.createElement("div");b.className="bubble "+(isBot?"bot":"usr");
  b.innerHTML=html;
  const tm=document.createElement("span");tm.className="msg-time";
  var now=new Date();tm.textContent=(now.getHours()<10?"0":"")+now.getHours()+":"+(now.getMinutes()<10?"0":"")+now.getMinutes();
  b.appendChild(tm);
  r.appendChild(b);chatEl.appendChild(r);
  setTimeout(()=>{r.classList.remove("msg-enter");chatEl.scrollTo({top:chatEl.scrollHeight,behavior:"smooth"});},30);
}
function clearActions(){actionsEl.innerHTML="";}
function showTyping(cb,delay=360){
  const r=document.createElement("div");r.className="msg-row bot";r.id="typing";
  const b=document.createElement("div");b.className="typing-bbl";b.setAttribute("aria-label","Печатает...");
  b.innerHTML='<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
  r.appendChild(b);chatEl.appendChild(r);
  setTimeout(()=>{document.getElementById("typing")?.remove();cb();},delay);
}
function showToast(msg,dur=2800){
  const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),dur);
}
function showSuccessAnim(text){
  const ovl=document.createElement("div");ovl.className="success-anim-ovl";
  const colors=["#1B8585","#26b0a8","#ffe8b8","#ffffff","#22a5a0"];
  let confetti="";
  for(let i=0;i<24;i++){
    const c=colors[i%colors.length];
    const left=Math.random()*100;
    const delay=(Math.random()*0.4).toFixed(2);
    const dur=(0.9+Math.random()*0.6).toFixed(2);
    const rot=Math.floor(Math.random()*360);
    confetti+=`<div class="sa-confetti" style="left:${left}%;background:${c};animation-delay:${delay}s;animation-duration:${dur}s;--rot:${rot}deg"></div>`;
  }
  ovl.innerHTML=`<div class="sa-confetti-wrap">${confetti}</div>
    <div class="sa-check-wrap">
      <svg class="sa-check-svg" viewBox="0 0 52 52"><circle class="sa-check-circle" cx="26" cy="26" r="24"/><path class="sa-check-mark" d="M14 27l7 7 17-17"/></svg>
    </div>
    ${text?`<div class="sa-text">${text}</div>`:""}`;
  document.body.appendChild(ovl);
  setTimeout(()=>{ovl.classList.add("sa-fade");setTimeout(()=>ovl.remove(),400);},1600);
}
function flyToCart(sourceEl){
  if(!sourceEl)return;
  const cartTab=document.getElementById("tb_cart");
  if(!cartTab)return;
  const srcRect=sourceEl.getBoundingClientRect();
  const dstRect=cartTab.getBoundingClientRect();
  const flyer=document.createElement("div");flyer.className="fly-to-cart";flyer.textContent="🛒";
  flyer.style.left=(srcRect.left+srcRect.width/2-12)+"px";
  flyer.style.top=(srcRect.top+srcRect.height/2-12)+"px";
  document.body.appendChild(flyer);
  const dx=(dstRect.left+dstRect.width/2)-(srcRect.left+srcRect.width/2);
  const dy=(dstRect.top+dstRect.height/2)-(srcRect.top+srcRect.height/2);
  flyer.style.setProperty("--dx",dx+"px");
  flyer.style.setProperty("--dy",dy+"px");
  requestAnimationFrame(()=>flyer.classList.add("fly-go"));
  setTimeout(()=>flyer.remove(),650);
}
function setNav(showBack){document.getElementById("backBtn").classList.toggle("gone",!showBack);}
function pushNav(fn){navHistory.push(fn);}
function goBack(){if(navHistory.length>0){const fn=navHistory.pop();fn();}}
function exitAssistantFullscreenMode(){
  document.getElementById("shell").classList.remove("assistant-mode");
  document.getElementById("asstFsHdr").classList.add("gone");
}
function openAssistantFullscreen(){
  navHistory=[];
  document.getElementById("shell").classList.add("assistant-mode");
  document.getElementById("asstFsHdr").classList.remove("gone");
  document.getElementById("chat").innerHTML="";
  showAssistant();
}
function closeAssistantFullscreen(){
  exitAssistantFullscreenMode();
  showMainMenu();
}

function updateHoursBanner(){
  const b=document.getElementById("hoursBanner");
  const cd=cityData[currentCity]||cityData.gubkin;
  const now=new Date();const dow=now.getDay();
  const h=now.getHours(),m=now.getMinutes();
  const mins=h*60+m;
  const openMins=cd.openH*60+cd.openM,closeMins=cd.closeH*60+cd.closeM;
  const isWeekday=dow>=1&&dow<=5;
  const isOpen=isWeekday&&mins>=openMins&&mins<closeMins;
  if(isOpen){
    b.className="hours-banner open";
    b.innerHTML='<span class="hb-dot"></span><span class="hb-txt">Открыто до '+cd.closeH+':'+String(cd.closeM).padStart(2,'0')+'</span>';
  }else{
    b.className="hours-banner closed";
    const nextDay=(dow===5||dow===6||dow===0)?"пн":"завтра";
    b.innerHTML='<span class="hb-dot"></span><span class="hb-txt">Закрыто · с '+nextDay+' 08:30</span>';
  }
}

function pHtml(p,m){
  if(hasMoroshka&&m!==null)
    return`<div class="price-wrap"><span class="p-old">${p} ₽</span><span class="p-new">${m} ₽</span><div class="mbadge" aria-label="Скидка Морошка"><img src="img/moroshka-logo.jpg" class="moroshka-ico" alt=""></div></div>`;
  return`<div class="price-wrap"><span class="p-normal">${p} ₽</span></div>`;
}

function rStars(sid,rating){
  const f=Math.round(rating);let s="";
  for(let i=1;i<=5;i++)
    s+=`<span class="star ${i<=f?"filled":"empty"}" role="button" aria-label="Оценить ${i} из 5" tabindex="0" data-r="${i}" data-sid="${sid}">★</span>`;
  return`<div class="rating" role="group" aria-label="Рейтинг">${s}<span class="r-val">${rating.toFixed(1)}</span></div>`;
}
function bindRatings(){
  document.querySelectorAll(".star").forEach(s=>{
    s.onclick=s.onkeydown=function(e){
      if(e.type==="keydown"&&e.key!=="Enter"&&e.key!==" ")return;
      e.stopPropagation();
      const nr=parseInt(this.dataset.r),sid=this.dataset.sid;
      serviceRatings[sid]=nr;localStorage.setItem("serviceRatings",JSON.stringify(serviceRatings));
      showToast(`⭐ Спасибо за оценку: ${nr}/5`);
    };
  });
}

function updateMToggle(){
  const t=document.getElementById("mToggle");
  if(!t)return;
  if(hasMoroshka===null){t.classList.add("gone");return;}
  t.classList.remove("gone");t.classList.toggle("on",hasMoroshka);
  t.setAttribute("aria-checked",String(hasMoroshka));
}
function toggleMoroshka(){
  if(hasMoroshka===null)return;
  hasMoroshka=!hasMoroshka;localStorage.setItem("hasMoroshka",String(hasMoroshka));
  updateMToggle();updateSvcPrices();
  document.querySelectorAll(".pl-add").forEach(function(btn){
    var base=parseInt(btn.dataset.base);
    var mor=btn.dataset.mor!==""?parseInt(btn.dataset.mor):null;
    var p=hasMoroshka&&mor!=null?mor:base;
    var row=btn.closest(".pl-row");if(!row)return;
    var pe=row.querySelector(".pl-price");if(pe)pe.textContent=p+" ₽";
    var sv=row.querySelector(".pl-save");
    if(hasMoroshka&&mor!=null){
      if(!sv){sv=document.createElement("span");sv.className="pl-save";pe.parentNode.appendChild(sv);}
      sv.textContent="Экономия "+(base-mor)+" ₽";
    }else if(sv)sv.remove();
  });
  showToast(hasMoroshka?"🍊 Морошка включена":"Морошка отключена");
}
function updateSvcPrices(){
  if(!currentSvcList||!currentCatId)return;
  const cat=servicesData.find(c=>c.id===currentCatId);if(!cat)return;
  currentSvcList.querySelectorAll(".svc-row").forEach((row,i)=>{
    const svc=cat.items[i];if(!svc)return;
    const pw=row.querySelector(".price-wrap");
    if(pw)pw.outerHTML=pHtml(svc.p,svc.m);
    const btn=row.querySelector(".add-btn");
    if(btn){const rp=(hasMoroshka&&svc.m!==null)?svc.m:svc.p;btn.dataset.price=rp;}
  });
}

function saveCart(){localStorage.setItem("cart",JSON.stringify(cart));}
function updateBadge(){const n=cart.reduce((s,i)=>s+i.qty,0);badgeEl.textContent=n;badgeEl.classList.toggle("gone",n===0);var tb=document.getElementById("tbCartBadge");if(tb){tb.textContent=n;tb.classList.toggle("gone",n===0);}}
function addToCart(id,name,price,btn,base,mor){
  const ex=cart.find(i=>i.id===id);
  if(ex)ex.qty++;else cart.push({id,name,price,qty:1,base:(base!==undefined?base:price),mor:(mor!==undefined?mor:null)});
  if(typeof trackCartAdd==="function")trackCartAdd(name);
  saveCart();updateBadge();renderCart();
  if(btn){btn.classList.add("added");btn.textContent="✓";btn.setAttribute("aria-label","Добавлено");
    setTimeout(()=>{btn.classList.remove("added");btn.textContent="+";btn.setAttribute("aria-label","Добавить в корзину");},900);}
  showToast("✅ Добавлено в корзину");
  var cartBtn=document.querySelector(".icb-wrap .icb");
  if(cartBtn){cartBtn.classList.add("cart-pulse");setTimeout(function(){cartBtn.classList.remove("cart-pulse");},600);}
}
function chgQty(id,d){
  id=typeof id==="string"?parseInt(id):id;
  const it=cart.find(i=>i.id===id);if(!it)return;
  it.qty=Math.max(0,it.qty+d);
  if(it.qty===0)cart=cart.filter(i=>i.id!==id);
  saveCart();updateBadge();renderCart();
}
function openCart(){document.getElementById("cartPanel").classList.add("open");renderCart();}
function closeCart(){document.getElementById("cartPanel").classList.remove("open");}
function clearCart(){cart=[];saveCart();updateBadge();renderCart();closeCart();}

let favorites=JSON.parse(localStorage.getItem("favorites")||"[]");
function saveFav(){localStorage.setItem("favorites",JSON.stringify(favorites));}
function isFav(id){return favorites.some(f=>f.id===id);}
function toggleFav(ev,id,n,p,m,cat){
  if(ev){ev.stopPropagation();}
  const i=favorites.findIndex(f=>f.id===id);
  if(i>=0){favorites.splice(i,1);showToast("☆ Удалено из избранного");}
  else{favorites.push({id,n,p,m:(m===null?null:m),cat});showToast("⭐ Добавлено в избранное");}
  saveFav();
  if(ev&&ev.target){ev.target.classList.toggle("on",isFav(id));}
}
function addFavToCart(id){
  const f=favorites.find(x=>x.id===id);if(!f)return;
  const rp=(hasMoroshka&&f.m!==null)?f.m:f.p;
  addToCart(f.id,f.n,rp,null,f.p,f.m);
}

function repeatOrder(idx){
  const oh=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
  const o=oh[idx];if(!o||!o.itemsRaw){showToast("Не удалось повторить заявку");return;}
  o.itemsRaw.forEach(it=>{
    const ex=cart.find(c=>c.id===it.id);
    if(ex)ex.qty+=it.qty;
    else cart.push({id:it.id,name:it.name,price:(hasMoroshka&&it.mor!=null?it.mor:(it.base!=null?it.base:it.price)),qty:it.qty,base:it.base,mor:it.mor});
  });
  saveCart();updateBadge();
  document.querySelector(".mo")?.remove();
  document.getElementById("ordersPanel").classList.remove("open");
  openCart();
  showToast("🛒 Услуги добавлены в корзину");
}

function cancelBooking(idx){

  const btns=document.querySelectorAll("[data-cancel-idx]");
  const btn=Array.from(btns).find(b=>+b.dataset.cancelIdx===idx);
  if(btn&&!btn.dataset.confirm){
    btn.dataset.confirm="1";
    btn.textContent="⚠️ Точно отменить?";
    btn.classList.add("confirm");
    setTimeout(()=>{if(btn.dataset.confirm){delete btn.dataset.confirm;btn.textContent="✕ Отменить запись";btn.classList.remove("confirm");}},4000);
    return;
  }
  const bh=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
  const b=bh[idx];if(!b)return;
  bh.splice(idx,1);
  localStorage.setItem("bookingsHistory",JSON.stringify(bh));
  bookingsHistory=bh;
  const body=`${emailTemplates.cancelBooking.intro}\nТалон: ${b.num}\nПолучатель: ${clientName}\nТелефон: ${clientPhone}\nБыло запланировано: ${b.visitDate} в ${b.visitTime}\nСпециалист: ${b.spec}`;
  window.location.href=`mailto:${getOrderEmail()}?subject=${encodeURIComponent(fillTemplate(emailTemplates.cancelBooking.subject,{ticket:b.num}))}&body=${encodeURIComponent(body)}`;
  showToast("Запись отменена");
  if(document.getElementById("ordersPanel").classList.contains("open")){
    const activeF=document.querySelector(".of-btn.active");
    renderOrdersPanel(activeF?activeF.dataset.f:"all");
  }else{
    document.querySelector(".mo")?.remove();
    setTimeout(openOrdersPanel,200);
  }
}

function clearAllBookings(){
  const btns=document.querySelectorAll("[data-clear-all]");
  const btn=btns[0];
  if(btn&&!btn.dataset.confirm){
    btn.dataset.confirm="1";
    btn.textContent="⚠️ Удалить все записи?";
    btn.classList.add("confirm");
    setTimeout(()=>{if(btn.dataset.confirm){delete btn.dataset.confirm;btn.textContent="🗑 Очистить список записей";btn.classList.remove("confirm");}},4000);
    return;
  }
  localStorage.setItem("bookingsHistory","[]");
  bookingsHistory=[];
  showToast("Список записей очищен");
  if(document.getElementById("ordersPanel").classList.contains("open")){
    const activeF=document.querySelector(".of-btn.active");
    renderOrdersPanel(activeF?activeF.dataset.f:"all");
  }else{
    document.querySelector(".mo")?.remove();
    setTimeout(openOrdersPanel,200);
  }
}

function clearAllOrders(){
  const btns=document.querySelectorAll("[data-clear-orders]");
  const btn=btns[0];
  if(btn&&!btn.dataset.confirm){
    btn.dataset.confirm="1";
    btn.textContent="⚠️ Удалить все заявки?";
    btn.classList.add("confirm");
    setTimeout(()=>{if(btn.dataset.confirm){delete btn.dataset.confirm;btn.textContent="🗑 Очистить список заявок";btn.classList.remove("confirm");}},4000);
    return;
  }
  localStorage.setItem("ordersHistory","[]");
  ordersHistory=[];
  showToast("Список заявок очищен");
  if(document.getElementById("ordersPanel").classList.contains("open")){
    const activeF=document.querySelector(".of-btn.active");
    renderOrdersPanel(activeF?activeF.dataset.f:"all");
  }else{
    document.querySelector(".mo")?.remove();
    setTimeout(openOrdersPanel,200);
  }
}
function renderCart(){
  const body=document.getElementById("cartBody"),footer=document.getElementById("cartFooter");
  if(cart.length===0){
    body.innerHTML='<div class="cart-empty">'+t("cart_empty")+'<br><span style="font-size:14px;color:#8AA0A0;margin-top:8px;display:block;">'+(currentLang==="en"?"Add services from the price list":"Добавьте услуги из прейскуранта")+'</span></div>';
    footer.innerHTML="";return;
  }
  body.innerHTML=cart.map(it=>`
    <div class="cart-item" role="listitem">
      <div class="ci-name">${it.name}</div>
      <div class="ci-price">${(it.price*it.qty).toLocaleString()} ₽</div>
      <div class="qty-row" role="group" aria-label="Количество">
        <button class="qty-btn" onclick="chgQty(${it.id},-1)" aria-label="Уменьшить">−</button>
        <span class="qty-val" aria-live="polite">${it.qty}</span>
        <button class="qty-btn" onclick="chgQty(${it.id},1)" aria-label="Увеличить">+</button>
      </div>
    </div>`).join("");
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const baseTotal=cart.reduce((s,i)=>s+(i.base!=null?i.base:i.price)*i.qty,0);
  const savings=baseTotal-total;
  const savingsHtml=(hasMoroshka&&savings>0)
    ?`<div class="cart-save"><img src="img/moroshka-logo.jpg" class="moroshka-ico-sm" alt=""> Скидка «Морошка»: −${savings.toLocaleString()} ₽ <span>(без скидки ${baseTotal.toLocaleString()} ₽)</span></div>`
    :"";
  footer.innerHTML=`
    <div class="cart-total"><span>Итого:</span><span aria-live="polite">${total.toLocaleString()} ₽</span></div>
    ${savingsHtml}
    <div class="cart-rcpt">Заявка будет отправлена на <strong>${getOrderEmail()}</strong><br>Получатель: <strong>${clientName||"—"}</strong></div>
    <button class="cart-send" onclick="sendOrder()" aria-label="${t("cart_send")}">${t("cart_send")}</button>
    <button class="cart-clr" onclick="clearCart()">${t("cart_clear")}</button>`;
}
function sendOrder(){
  if(!cart.length)return;
  if(!clientSnils||clientSnils==="—"||clientSnils.replace(/\D/g,"").length<11){
    askSnilsAndSend();return;
  }
  doSendOrder();
}
function askSnilsAndSend(){
  var ovl=document.createElement("div");ovl.className="mo";
  ovl.onclick=function(e){if(e.target===ovl)ovl.remove();};
  ovl.innerHTML='<div class="mc" style="max-width:360px;text-align:center;padding:28px 22px"><h3>Укажите СНИЛС</h3><p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px">Для оформления заявки на социальные услуги необходимо указать СНИЛС получателя</p><input class="auth-inp" id="snilsInput" placeholder="000-000-000 00" inputmode="numeric" style="text-align:center;font-size:18px;letter-spacing:1px"><button class="auth-btn" id="snilsOk" disabled style="margin-top:12px">Продолжить</button><button class="rating-skip" onclick="this.closest(\'.mo\').remove()">Отмена</button></div>';
  document.body.appendChild(ovl);
  var inp=ovl.querySelector("#snilsInput"),btn=ovl.querySelector("#snilsOk");
  inp.oninput=function(){
    var v=inp.value.replace(/\D/g,"").substring(0,11),r="";
    if(v.length>0)r+=v.substring(0,3);if(v.length>3)r+="-"+v.substring(3,6);
    if(v.length>6)r+="-"+v.substring(6,9);if(v.length>9)r+=" "+v.substring(9,11);
    inp.value=r;btn.disabled=v.length<11;
  };
  btn.onclick=function(){
    clientSnils=inp.value.trim();
    localStorage.setItem("clientSnils",clientSnils);
    ovl.remove();doSendOrder();
  };
  inp.focus();
}
function doSendOrder(){
  const cd=cityData[currentCity]||cityData.gubkin;
  const items=cart.map(i=>`• ${i.name} (x${i.qty}) — ${(i.price*i.qty).toLocaleString()} руб.`).join("\n");
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const body=`${emailTemplates.order.intro}\nДата: ${new Date().toLocaleString("ru-RU")}\n\nПОЛУЧАТЕЛЬ\nФИО: ${clientName}\nТелефон: ${clientPhone}\nСНИЛС: ${clientSnils}\nКарта «Морошка»: ${hasMoroshka?"Да":"Нет"}\nФилиал: г. ${currentCityName}\n\nУСЛУГИ\n${items}\n\nИТОГО: ${total.toLocaleString()} руб.`;
  window.location.href=`mailto:${cd.orderEmail||cd.email}?subject=${encodeURIComponent(fillTemplate(emailTemplates.order.subject,{name:clientName,city:currentCityName}))}&body=${encodeURIComponent(body)}`;
  ticketCounter++;localStorage.setItem("ticketCounter",String(ticketCounter));
  const orderNum="ЗАЯ-"+String(ticketCounter).padStart(4,"0");
  ordersHistory.unshift({
    num:orderNum,
    date:new Date().toLocaleString("ru-RU"),
    sum:total.toLocaleString(),
    items:cart.map(i=>`<div class="ord-item-line">${i.name} <span class="ord-item-qty">×${i.qty}</span></div>`).join(""),
    itemsRaw:cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,base:i.base,mor:i.mor})),
    status:"new"
  });
  localStorage.setItem("ordersHistory",JSON.stringify(ordersHistory));

  window.GarmoniyaDB?.saveOrder({
    clientName, clientPhone, cityName:currentCityName, moroshka:hasMoroshka, total,
    items:cart.map(i=>({name:i.name,qty:i.qty,price:i.price}))
  });
  cart=[];saveCart();updateBadge();renderCart();closeCart();
  showSuccessAnim("Заявка отправлена!");
  addMsg("✅ Почтовый клиент открыт. Нажмите «Отправить» — заявка уйдёт специалисту!",true);
  showToast("✅ Заявка сформирована!");
  if(typeof showRating==="function")showRating("order");
}

function tryShare(){
  const data={title:"Гармония — ЦСОН ЯНАО",text:"Чат-бот социального центра «Гармония» (ЯНАО). Услуги, запись, контакты.",url:location.href};
  if(navigator.share){navigator.share(data).catch(()=>{});}
  else{navigator.clipboard?.writeText(location.href);showToast("📋 Ссылка скопирована!");}
}

function initSearch(){
  const inp=document.getElementById("searchInp"),clr=document.getElementById("searchClear");
  inp.oninput=()=>{
    const q=inp.value.trim();clr.classList.toggle("gone",!q);
    if(q.length>1)renderSearchResults(q);else if(!q)renderSearchResults("");
  };
  inp.addEventListener("keydown",e=>{if(e.key==="Escape")clearSearch();});
}
function clearSearch(){
  document.getElementById("searchInp").value="";
  document.getElementById("searchClear").classList.add("gone");
  renderSearchResults("");
}
function renderSearchResults(q){
  if(!q){currentSvcList=null;showServices();return;}
  clearActions();
  const nq=asstNorm(q);
  const qWords=nq.split(" ").filter(w=>w.length>1);
  const results=[];
  servicesData.forEach(cat=>{
    cat.items.forEach((svc,i)=>{
      const nn=asstNorm(svc.n);
      let score=0;
      if(nn.includes(nq))score=1000; // точное вхождение фразы — в приоритете
      else{
        const nameWords=nn.split(" ").filter(w=>w.length>1);
        qWords.forEach(w=>{if(fuzzyTextHasWord(nameWords,w))score+=w.length;});
      }
      if(score>0)results.push({cat,svc,i,score});
    });
  });
  results.sort((a,b)=>b.score-a.score);
  if(results.length===0){actionsEl.innerHTML=`<div class="search-empty">🔍 По запросу «${q}» ничего не найдено</div>`;return;}
  addMsg(`🔍 Найдено: ${results.length} услуг`,true);
  const ul=document.createElement("div");ul.className="svc-list";ul.style.maxHeight="44vh";
  results.forEach(({cat,svc,i})=>{
    const rp=(hasMoroshka&&svc.m!==null)?svc.m:svc.p;
    const id=`${cat.id}_${i}`;
    const escn=svc.n.replace(/'/g,"\\'");
    const mv=svc.m===null?"null":svc.m;
    const row=document.createElement("div");row.className="svc-row";
    row.innerHTML=`<button class="fav-btn ${isFav(id)?"on":""}" aria-label="В избранное" onclick="toggleFav(event,'${id}','${escn}',${svc.p},${mv},${cat.id})">★</button><div class="svc-name"><span style="font-size:11px;color:var(--text-tertiary);display:block;">${cat.icon} ${cat.name}</span>${svc.n}</div>${pHtml(svc.p,svc.m)}<button class="add-btn" aria-label="Добавить «${svc.n}» в корзину" onclick="addToCart('${id}','${escn}',${rp},this,${svc.p},${mv})">+</button>`;
    ul.appendChild(row);
  });
  actionsEl.appendChild(ul);
  const gb=document.createElement("button");gb.className="go-cart-btn";gb.innerHTML="🛒 Посмотреть корзину →";gb.onclick=openCart;actionsEl.appendChild(gb);
}

function greeting(){
  const h=new Date().getHours();
  if(h>=5&&h<12)return t("greeting_morning");
  if(h>=12&&h<17)return t("greeting_day");
  return t("greeting_evening");
}
function timeOfDayClass(){
  const h=new Date().getHours();
  if(h>=5&&h<12)return "ga-morning";
  if(h>=12&&h<17)return "ga-day";
  if(h>=17&&h<22)return "ga-evening";
  return "ga-night";
}
function emptyIllustration(){
  return `<svg class="empty-illust" viewBox="0 0 120 100" aria-hidden="true">
    <ellipse cx="60" cy="88" rx="38" ry="7" fill="#1B8585" opacity=".08"/>
    <rect x="24" y="34" width="72" height="46" rx="12" fill="none" stroke="#1B8585" stroke-width="2.5" stroke-dasharray="6 6" opacity=".35"/>
    <path class="empty-illust-heart" d="M60 46c5 3 9 8 9 14 0 7-6 12-13 12 6 0 10-4 10-10 0-8-6-14-15-16 3-1 6-1 9 0z" fill="#1B8585" opacity=".55"/>
    <circle class="empty-illust-dot" cx="86" cy="30" r="3" fill="#ffb84d" opacity=".7"/>
    <circle class="empty-illust-dot2" cx="30" cy="26" r="2.4" fill="#1B8585" opacity=".5"/>
  </svg>`;
}

function menuCard(it){
  var c=document.createElement("div");c.className="card";
  var icoHtml=it.ico==="moroshka"?'<img src="img/moroshka-logo.jpg" class="moroshka-ico-card" alt="">':it.ico;
  c.innerHTML='<div class="card-ico '+it.cl+'">'+icoHtml+'</div><div class="card-ttl">'+it.ttl+'</div><div class="card-sub">'+it.sub+'</div>';
  c.onclick=it.fn;
  return c;
}
function menuSection(title,items,collapsed){
  var sec=document.createElement("div");sec.className="sec"+(collapsed?" collapsed":"");
  var h=document.createElement("button");h.type="button";h.className="sec-title";
  h.setAttribute("aria-expanded",String(!collapsed));
  h.innerHTML='<span>'+title+'</span><span class="sec-chev">⌄</span>';
  var g=document.createElement("div");g.className="cards";
  items.forEach(function(it){g.appendChild(menuCard(it));});
  h.onclick=function(){var col=sec.classList.toggle("collapsed");h.setAttribute("aria-expanded",String(!col));};
  sec.appendChild(h);sec.appendChild(g);
  return sec;
}
function showMainMenu(){
  document.getElementById("searchBar").classList.add("gone");
  clearActions();navHistory=[];setNav(false);currentSvcList=null;currentCatId=null;
  if(typeof showSeasonalGreeting==="function")showSeasonalGreeting();
  chatEl.innerHTML="";
  var gr=greeting();
  var w=document.createElement("div");w.className="home-view";
  var html='<div class="greet-anim '+timeOfDayClass()+'">'
    +'<div class="ga-blob-field"><div class="ga-blob ga-blob-1"></div><div class="ga-blob ga-blob-2"></div><div class="ga-blob ga-blob-3"></div><div class="ga-blob ga-blob-4"></div></div>'
    +'<div class="ga-rings"></div>'
    +'<div class="ga-body"><span class="ga-hi">'+gr+',</span><div class="ga-name">'+clientName+'</div><span class="ga-name-accent"></span><span class="ga-sub">Чем могу помочь?</span></div>'
    +'<div class="ga-bot-wrap"><div class="ga-bot-halo"></div><div class="ga-bot-ring"></div><img src="img/bot-heart.webp" class="ga-bot-img" alt=""></div></div>';
  html+='<button class="bot-btn" data-act="assistant"><img src="img/bot-present.jpg" class="bb-ava"><div class="bb-txt"><b>Чат-бот «Гармония»</b><span>Задать вопрос</span></div><span class="bb-arr">›</span></button>';
  html+='<div class="news-sec-title">Новости и обновления центра</div>';
  html+=newsTabsHtml("Home",false);
  html+='<div id="newsPanelHomeCenter">';
  html+='<div class="news-feed">';
  if(newsData.length){
    newsData.slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"");}).forEach(function(n,ni){
      var d=new Date(n.date);
      var dateStr=d.toLocaleDateString("ru-RU",{day:"numeric",month:"long"});
      var imgs=(n.images&&n.images.length)?n.images:(n.image?[n.image]:[]);
      var mediaHtml="";
      if(imgs.length===1){
        mediaHtml='<img src="'+imgs[0]+'" class="news-img" alt="">';
      }else if(imgs.length>1){
        mediaHtml='<div class="news-carousel" id="homeNewsCarousel'+ni+'">'
          +'<div class="news-carousel-track" id="homeNewsTrack'+ni+'">'
          +imgs.map(function(src){return '<img src="'+src+'" class="news-carousel-img" alt="" draggable="false">';}).join("")
          +'</div>'
          +'<div class="news-carousel-counter"><span class="ncc-cur">1</span>/'+imgs.length+'</div>'
          +'<div class="news-carousel-dots">'+imgs.map(function(_,di){return '<span class="news-dot'+(di===0?" active":"")+'" onclick="newsCarouselGoById(\'homeNewsTrack'+ni+'\','+di+')"></span>';}).join("")+'</div>'
          +'</div>';
      }
      html+='<div class="news-card news-card-vk">'+newsPostHeader(n,dateStr)+mediaHtml+'<div class="news-title">'+n.title+'</div><div class="news-text">'+n.text+'</div>'+newsActionsBar(n)+'</div>';
    });
  }else{
    html+='<div class="news-empty"><div class="ne-ico">📰</div><b>Новостей пока нет</b><span>Здесь появятся новости и обновления центра</span></div>';
  }
  html+='</div>';
  html+='</div>'; // /newsPanelHomeCenter
  html+='<div id="newsPanelHomeVk" class="gone"><div id="vkWidgetHostHome" class="vk-widget-host"></div></div>';
  w.innerHTML=html;
  chatEl.appendChild(w);
  w.querySelectorAll(".news-carousel").forEach(function(carousel){
    var track=carousel.querySelector(".news-carousel-track");
    if(!track)return;
    track.addEventListener("scroll",function(){
      var idx=Math.round(track.scrollLeft/track.clientWidth);
      carousel.querySelectorAll(".news-dot").forEach(function(d,di){d.classList.toggle("active",di===idx);});
      var cc=carousel.querySelector(".ncc-cur");if(cc)cc.textContent=(idx+1);
    });
    if(typeof attachCarouselDrag==="function")attachCarouselDrag(track);
  });
  w.querySelectorAll("[data-act]").forEach(function(btn){
    if(btn.dataset.act==="assistant")btn.onclick=function(){openAssistantFullscreen();};
  });
  document.querySelectorAll(".bt").forEach(function(t){t.classList.remove("active");});
  var ht=document.getElementById("bt_home");if(ht)ht.classList.add("active");
  if(typeof showOnboarding==="function")showOnboarding();
}

const CAT_GRADIENTS=[
  "linear-gradient(135deg,#1B8585,#2A9D9D)","linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#10b981,#059669)","linear-gradient(135deg,#0F6060,#1B8585)",
  "linear-gradient(135deg,#2A9D9D,#166565)","linear-gradient(135deg,#B07A00,#D4920A)",
  "linear-gradient(135deg,#f43f5e,#e11d48)","linear-gradient(135deg,#14b8a6,#0d9488)",
  "linear-gradient(135deg,#E8A020,#D4920A)","linear-gradient(135deg,#D4920A,#E8A020)",
  "linear-gradient(135deg,#D4920A,#B07A00)","linear-gradient(135deg,#22c55e,#16a34a)"
];
function catColor(id){return CAT_GRADIENTS[id%CAT_GRADIENTS.length];}

function showServices(){
  clearActions();setNav(true);
  if(!servicesData.length){addMsg("Нет данных для этого филиала.",true);return;}
  chatEl.innerHTML="";
  var pg=document.createElement("div");pg.className="pricelist";
  var skHtml='<h2>'+t("services_title")+'</h2><div class="pl-search"><input type="text" placeholder="'+t("services_search_ph")+'" disabled></div><div class="pl-catlist">';
  for(var s=0;s<6;s++)skHtml+='<div class="pl-skel-card"><div class="pl-skel-ico"></div><div class="pl-skel-txt"><div class="pl-skel-line" style="width:70%"></div><div class="pl-skel-line" style="width:40%"></div></div></div>';
  skHtml+='</div>';
  pg.innerHTML=skHtml;
  chatEl.appendChild(pg);
  setTimeout(function(){
    var html='<h2>'+t("services_title")+'</h2><div class="pl-search"><input type="text" id="plSearchInp" placeholder="'+t("services_search_ph")+'" oninput="plFilterGlobal(this.value)" aria-label="'+t("services_search_ph")+'"></div>';
    html+='<div id="plCatList" class="pl-catlist">';
    servicesData.forEach(function(cat){
      html+='<button class="pl-catcard" data-cid="'+cat.id+'" onclick="plOpenCat('+cat.id+')" aria-label="'+cat.name.replace(/"/g,"&quot;")+', '+cat.items.length+' услуг">'
          +'<span class="pl-catcard-ico" style="background:'+catColor(cat.id)+'">'+cat.icon+'</span>'
          +'<span class="pl-catcard-txt"><b>'+cat.name+'</b><span>'+cat.items.length+' '+plWordForm(cat.items.length,["услуга","услуги","услуг"])+'</span></span>'
          +'<span class="pl-catcard-arr">›</span></button>';
    });
    html+='</div>';
    html+='<div id="plSearchResults" class="pl-searchres gone"></div>';
    html+='<div id="plCatDetail" class="pl-catdetail gone"></div>';
    pg.innerHTML=html;
  },160);
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}
function plWordForm(n,forms){
  n=Math.abs(n)%100;var n1=n%10;
  if(n>10&&n<20)return forms[2];
  if(n1>1&&n1<5)return forms[1];
  if(n1===1)return forms[0];
  return forms[2];
}
function plRenderRow(cat,it,ii){
  var uid=cat.id*1000+ii;
  var p=hasMoroshka&&it.m!=null?it.m:it.p;
  var sv=hasMoroshka&&it.m!=null?'<span class="pl-save">Экономия '+(it.p-it.m)+' ₽</span>':"";
  var nameEsc=it.n.replace(/'/g,"\\'").replace(/"/g,"&quot;");
  return '<div class="pl-row" data-row-uid="'+uid+'"><div class="pl-name">'+it.n+'</div><div class="pl-right"><div class="pl-price">'+p+' ₽</div>'+sv+'</div><button class="pl-add" data-uid="'+uid+'" data-name="'+nameEsc+'" data-base="'+it.p+'" data-mor="'+(it.m!=null?it.m:"")+'" onclick="plAddToCart(this)" aria-label="Добавить '+nameEsc+' в корзину">+</button></div>';
}
const SERVICE_BOOKING_MAP=[
  {match:"психологические",pos:"психолог"},
  {match:"педагогические",pos:"педагог"},
  {match:"правовые",pos:"юрис"},
  {match:"занятия в залах лфк",pos:"физкультур"}
];
function plOpenCat(id,highlightUid){
  var cat=servicesData.find(function(c){return c.id===id;});if(!cat)return;
  document.getElementById("plCatList").classList.add("gone");
  document.getElementById("plSearchResults").classList.add("gone");
  document.getElementById("plSearchInp").value="";
  var det=document.getElementById("plCatDetail");
  var isTaxiCat=cat.name.toLowerCase().indexOf("перевозке")>=0||cat.name.toLowerCase().indexOf("перевозка")>=0;
  var html='<button class="pl-back" onclick="plCloseCat()">← Все категории</button>';
  if(isTaxiCat&&highlightUid===undefined){
    html+='<div class="pl-sec-t">'+cat.icon+' '+cat.name+'</div>';
    html+='<div class="taxi-redirect-card"><span class="taxi-redirect-ico">🚕</span><div class="taxi-redirect-txt"><b>Удобнее заказать через раздел «Такси»</b><span>Выбор тарифа, адрес, время и автоматическое назначение водителя — в одном месте</span></div></div>';
    html+='<button class="eq-save-btn" onclick="showTaxi()">🚕 Перейти к заказу такси</button>';
    det.innerHTML=html;
    det.classList.remove("gone");
    det.scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  html+='<div class="pl-sec-t">'+cat.icon+' '+cat.name+'</div>';
  var catNameLower=cat.name.toLowerCase();
  var structDir=(typeof BOOKING_STRUCT!=="undefined"&&(currentCity==="gubkin"||currentCity==="purpe"))?BOOKING_STRUCT.find(function(d){return d.catId===cat.id;}):null;
  if(structDir&&highlightUid===undefined){
    html+='<button class="svc-book-btn" onclick="openStructBooking('+cat.id+')"><span class="svc-book-ico">📅</span><span class="svc-book-txt"><b>Записаться на приём</b><span>Выбор направления, услуги, специалиста, даты и времени</span></span><span class="svc-book-arr">›</span></button>';
    det.innerHTML=html;
    det.classList.remove("gone");
    det.scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  var bookingMatch=SERVICE_BOOKING_MAP.find(function(m){return catNameLower.indexOf(m.match)>=0;});
  var matchedStaff=bookingMatch?(staffData||[]).filter(function(s){return s.pos.toLowerCase().indexOf(bookingMatch.pos)>=0;}):[];
  if(bookingMatch&&matchedStaff.length&&highlightUid===undefined){
    html+='<button class="svc-book-btn" onclick="showServiceBookingItem('+cat.id+')"><span class="svc-book-ico">📅</span><span class="svc-book-txt"><b>Записаться на приём</b><span>Выбор услуги, специалиста, даты и времени</span></span><span class="svc-book-arr">›</span></button>';
    det.innerHTML=html;
    det.classList.remove("gone");
    det.scrollIntoView({behavior:"smooth",block:"start"});
    return;
  }
  cat.items.forEach(function(it,ii){html+=plRenderRow(cat,it,ii);});
  det.innerHTML=html;
  det.classList.remove("gone");
  if(highlightUid!==undefined){
    setTimeout(function(){
      var row=det.querySelector('[data-row-uid="'+highlightUid+'"]');
      if(row){
        row.scrollIntoView({behavior:"smooth",block:"center"});
        row.classList.add("pl-row-highlight");
        setTimeout(function(){row.classList.remove("pl-row-highlight");},2400);
      }else{
        det.scrollIntoView({behavior:"smooth",block:"start"});
      }
    },80);
  }else{
    det.scrollIntoView({behavior:"smooth",block:"start"});
  }
}
function plCloseCat(){
  document.getElementById("plCatDetail").classList.add("gone");
  document.getElementById("plCatList").classList.remove("gone");
}
function plAddToCart(btn){
  var uid=parseInt(btn.dataset.uid);
  var name=btn.dataset.name;
  var base=parseInt(btn.dataset.base);
  var mor=btn.dataset.mor!==""?parseInt(btn.dataset.mor):null;
  var price=hasMoroshka&&mor!=null?mor:base;
  addToCart(uid,name,price,btn,base,mor);
  flyToCart(btn);
  var it=cart.find(function(i){return i.id===uid;});
  if(it&&it.qty>1){
    setTimeout(function(){btn.textContent=it.qty;btn.classList.add("has-qty");},950);
  }
}
function plFilterGlobal(q){
  q=q.toLowerCase().trim();
  var catList=document.getElementById("plCatList");
  var det=document.getElementById("plCatDetail");
  var res=document.getElementById("plSearchResults");
  if(!q){
    res.classList.add("gone");res.innerHTML="";
    det.classList.add("gone");
    catList.classList.remove("gone");
    return;
  }
  det.classList.add("gone");
  catList.classList.add("gone");
  var matches=[];
  servicesData.forEach(function(cat){
    cat.items.forEach(function(it,ii){
      if(it.n.toLowerCase().includes(q))matches.push({cat:cat,it:it,ii:ii});
    });
  });
  var html='<div class="pl-sec-t">Найдено: '+matches.length+' '+plWordForm(matches.length,["услуга","услуги","услуг"])+'</div>';
  if(!matches.length){
    html+='<div class="pl-empty">Ничего не найдено. Попробуйте другой запрос.</div>';
  }else{
    matches.forEach(function(m){html+=plRenderRow(m.cat,m.it,m.ii);});
  }
  res.innerHTML=html;
  res.classList.remove("gone");
}
function showCategory(catId,highlightUid){
  showServices();
  setTimeout(function(){plOpenCat(catId,highlightUid);},220);
}

// ═══════════════════════════════════════
// ТАКСИ — полноценный модуль заказа
// ═══════════════════════════════════════
let taxiState={tariffIdx:null,from:"",to:"",date:"",time:"",comment:""};

let taxiShowMor=hasMoroshka;
let taxiSelectedIdx=null,taxiSelectedIsFree=false;
function showTaxi(keepState,prefillTo){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="taxi-page taxi-page-v2";
  const tariffs=getTaxiTariffs();
  if(!keepState){
    taxiShowMor=hasMoroshka;
    taxiSelectedIdx=null;taxiSelectedIsFree=false;
    taxiState={tariffIdx:null,isFree:false,from:"",to:prefillTo||"",date:"",time:"",comment:"",moroshkaView:taxiShowMor};
    taxiCoords.from=null;taxiCoords.to=null;
  }

  if(!tariffs.items.length){
    w.innerHTML='<div class="ev-empty">'+emptyIllustration()+'<div class="empty-title">Такси недоступно в этом филиале</div><div class="empty-sub">Уточните возможность перевозки по телефону центра</div></div>';
    chatEl.appendChild(w);
    actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
    return;
  }

  w.innerHTML=`
    <div class="taxi-progress"><div class="taxi-progress-fill" style="width:0%"></div></div>
    <div class="taxi-step-lbl"><span class="taxi-step-num">1</span>Маршрут</div>
    <div class="taxi-route-visual">
      <div class="taxi-route-line">
        <span class="taxi-dot taxi-dot-from"></span>
        <span class="taxi-dashes"></span>
        <span class="taxi-dot taxi-dot-to"></span>
      </div>
      <div class="taxi-route-inputs">
        <div class="taxi-addr-wrap">
          <input class="eq-input" id="taxiFrom" placeholder="Откуда забрать (адрес)" autocomplete="off" value="${(taxiState.from||"").replace(/"/g,"&quot;")}">
          <button type="button" class="taxi-geo-btn" id="taxiGeoBtn" title="Использовать моё местоположение">📍</button>
          <div class="taxi-addr-suggest gone" id="taxiFromSuggest"></div>
        </div>
        <div class="taxi-addr-wrap">
          <input class="eq-input" id="taxiTo" placeholder="Куда везти (адрес)" autocomplete="off" value="${(taxiState.to||"").replace(/"/g,"&quot;")}">
          <div class="taxi-addr-suggest gone" id="taxiToSuggest"></div>
        </div>
      </div>
    </div>
    <div class="taxi-quick-dest">
      <div class="taxi-quick-dest-chips" id="taxiQuickDest">
        <button type="button" class="taxi-chip" data-q="Больница">🏥 Больница</button>
        <button type="button" class="taxi-chip" data-q="Поликлиника">🩺 Поликлиника</button>
        <button type="button" class="taxi-chip" data-q="Аптека">💊 Аптека</button>
        <button type="button" class="taxi-chip" data-q="МФЦ">📄 МФЦ</button>
        <button type="button" class="taxi-chip" data-q="Пенсионный фонд">💰 Пенсионный фонд</button>
        <button type="button" class="taxi-chip" data-cson="1">🏢 ЦСОН «Гармония»</button>
      </div>
    </div>
  `;
  chatEl.appendChild(w);

  attachAddressAutocomplete(document.getElementById("taxiFrom"),document.getElementById("taxiFromSuggest"));
  if(!keepState&&prefillTo)showToast("📍 Адрес назначения подставлен из чата — проверьте и уточните при необходимости");
  attachAddressAutocomplete(document.getElementById("taxiTo"),document.getElementById("taxiToSuggest"));
  document.querySelectorAll("#taxiQuickDest .taxi-chip").forEach(function(chip){
    chip.onclick=function(){
      const toInput=document.getElementById("taxiTo");
      const toSuggest=document.getElementById("taxiToSuggest");
      if(chip.dataset.cson){
        const cd=cityData[currentCity]||cityData.gubkin;
        toInput.value=cleanAddressLabel(cd.address);
        toSuggest.classList.add("gone");
      }else{
        toInput.value=chip.dataset.q+" "+currentCityName;
        taxiFetchSuggestions(chip.dataset.q,toSuggest,toInput);
      }
    };
  });
  const geoBtn=document.getElementById("taxiGeoBtn");
  if(geoBtn)geoBtn.onclick=function(){taxiUseMyLocation(document.getElementById("taxiFrom"));};

  actionsEl.innerHTML=`
    <div class="taxi-order-bar" id="taxiOrderBar">
      <button type="button" class="taxi-order-bar-btn" id="taxiNextBtn">Далее →</button>
    </div>
    <button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>
  `;
  document.getElementById("taxiNextBtn").onclick=function(){
    const from=document.getElementById("taxiFrom").value.trim();
    const to=document.getElementById("taxiTo").value.trim();
    if(!from||!to){showToast("⚠️ Укажите адрес отправления и назначения");return;}
    taxiState.from=from;taxiState.to=to;
    showTaxiTariff(tariffs);
  };
}

function showTaxiTariff(tariffs){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="taxi-page taxi-page-v2";
  const quota=getFreeTaxiQuota();
  const eligibility=checkFreeTaxiEligibility();
  const freeDisabled=!eligibility.eligible||quota.remaining<=0;

  w.innerHTML=`
    <button class="pl-back" onclick="showTaxi(true)">← Назад к маршруту</button>
    <div class="taxi-progress"><div class="taxi-progress-fill" style="width:33.3%"></div></div>
    <div class="taxi-step-lbl"><span class="taxi-step-num">2</span>Выберите тариф</div>
    <button type="button" class="taxi-mor-toggle taxi-mor-toggle-main ${taxiShowMor?"on":""}" id="taxiMorToggleMain" aria-pressed="${taxiShowMor}"><img src="img/moroshka-logo.jpg" alt=""><span>Показывать цены по карте «Морошка»</span></button>
    <div class="taxi-select-list" id="taxiSelectList">
      <button type="button" class="taxi-tariff-card taxi-free-card taxi-selectable" data-tidx="free" data-disabled="${freeDisabled}">
        <div class="taxi-tariff-ico free">🎁</div>
        <div class="taxi-tariff-body">
          <div class="taxi-tariff-top"><span class="taxi-tariff-name">Льготная поездка</span><span class="taxi-sel-check">✓</span></div>
          <div class="taxi-tariff-price"><span class="ttp-main free-price">Бесплатно</span></div>
          ${!eligibility.eligible?`<div class="taxi-free-eligibility not-ok"><span>🔒</span> ${eligibility.message}</div>`
            :`<div class="taxi-free-eligibility ok"><span>✅</span> ${quota.remaining>0?"Осталось "+quota.remaining+" из "+quota.limit+" поездок":"Лимит на этот год исчерпан"}</div>`}
        </div>
      </button>
      ${tariffs.items.map(t=>taxiTariffCardHtml(t)).join("")}
    </div>
  `;
  chatEl.appendChild(w);
  if(taxiSelectedIdx!=null||taxiSelectedIsFree){
    const sel=w.querySelector(taxiSelectedIsFree?'[data-tidx="free"]':'[data-tidx="'+taxiSelectedIdx+'"]');
    if(sel)sel.classList.add("selected");
  }

  function selectTariff(idx,isFree,btn){
    if(btn.dataset.disabled==="true"){
      const elig=checkFreeTaxiEligibility();
      showToast(elig.eligible?"⚠️ Лимит бесплатных поездок на этот год исчерпан":"⚠️ "+elig.message);
      return;
    }
    taxiSelectedIdx=isFree?null:idx;taxiSelectedIsFree=isFree;
    document.querySelectorAll(".taxi-tariff-card").forEach(c=>c.classList.remove("selected"));
    btn.classList.add("selected");
    setTimeout(function(){showTaxiDateTime(tariffs);},280);
  }
  document.querySelectorAll(".taxi-select-list .taxi-tariff-card").forEach(function(btn){
    btn.onclick=function(){
      const isFree=btn.dataset.tidx==="free";
      selectTariff(isFree?null:+btn.dataset.tidx,isFree,btn);
    };
  });

  const morBtn=document.getElementById("taxiMorToggleMain");
  if(morBtn)morBtn.onclick=function(){
    taxiShowMor=!taxiShowMor;
    morBtn.classList.toggle("on",taxiShowMor);
    morBtn.setAttribute("aria-pressed",String(taxiShowMor));
    const selList=document.getElementById("taxiSelectList");
    const freeCardHtml=selList.querySelector(".taxi-free-card").outerHTML;
    selList.innerHTML=freeCardHtml+tariffs.items.map(t=>taxiTariffCardHtml(t)).join("");
    document.querySelectorAll(".taxi-select-list .taxi-tariff-card").forEach(function(btn){
      btn.onclick=function(){
        const isFree=btn.dataset.tidx==="free";
        selectTariff(isFree?null:+btn.dataset.tidx,isFree,btn);
      };
    });
  };

  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showTaxiDateTime(tariffs){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="taxi-page taxi-page-v2";
  const today=new Date().toISOString().split("T")[0];

  w.innerHTML=`
    <button class="pl-back" onclick="showTaxiTariff(getTaxiTariffs())">← Назад к тарифу</button>
    <div class="taxi-progress"><div class="taxi-progress-fill" style="width:66.6%"></div></div>
    <div class="taxi-step-lbl"><span class="taxi-step-num">3</span>Когда подать машину</div>
    <div class="taxi-dt-section">
      <div class="taxi-date-scroll" id="taxiDateScroll"></div>
      <div class="taxi-time-grid" id="taxiTimeGrid"></div>
      <input type="hidden" id="taxiDate" value="${today}">
      <input type="hidden" id="taxiTime" value="">
    </div>
    <div class="eq-field"><span class="eq-field-ico">👥</span><div class="eq-field-body"><label class="eq-field-lbl">Количество пассажиров</label>
      <div class="taxi-pax-stepper">
        <button type="button" class="taxi-pax-btn" id="taxiPaxMinus">−</button>
        <span class="taxi-pax-val" id="taxiPaxVal">1</span>
        <button type="button" class="taxi-pax-btn" id="taxiPaxPlus">+</button>
        <span class="taxi-pax-hint">макс. 2 места</span>
      </div>
    </div></div>
    <div class="eq-field"><span class="eq-field-ico">🪪</span><div class="eq-field-body"><label class="eq-field-lbl">Пассажир 1</label><input class="eq-input" id="taxiPax1Name" value="${(clientName||"").replace(/"/g,"&quot;")}" placeholder="ФИО пассажира"></div></div>
    <div class="eq-field gone" id="taxiPax2Field"><span class="eq-field-ico">🪪</span><div class="eq-field-body"><label class="eq-field-lbl">Пассажир 2</label><input class="eq-input" id="taxiPax2Name" placeholder="ФИО второго пассажира"></div></div>
    <div class="eq-field"><span class="eq-field-ico">💬</span><div class="eq-field-body"><label class="eq-field-lbl">Комментарий (необязательно)</label><textarea class="eq-input" id="taxiComment" rows="2" placeholder="Особые пожелания..."></textarea></div></div>
    <input type="hidden" id="taxiPax" value="1">
  `;
  chatEl.appendChild(w);
  taxiRenderDateTimePicker();

  function updatePax(delta){
    const paxVal=document.getElementById("taxiPaxVal");
    let n=parseInt(paxVal.textContent)+delta;
    n=Math.max(1,Math.min(2,n));
    paxVal.textContent=n;
    document.getElementById("taxiPax").value=n;
    document.getElementById("taxiPax2Field").classList.toggle("gone",n<2);
  }
  document.getElementById("taxiPaxMinus").onclick=function(){updatePax(-1);};
  document.getElementById("taxiPaxPlus").onclick=function(){updatePax(1);};

  function updateOrderBar(){
    const bar=document.getElementById("taxiOrderBar");
    let priceText;
    if(taxiSelectedIsFree){priceText="Бесплатно 🎁";}
    else{
      const t=tariffs.items.find(x=>x.idx===taxiSelectedIdx);
      const useMor=taxiShowMor&&t.moroshka!=null;
      priceText=(useMor?t.moroshka:t.base)+" ₽";
    }
    bar.querySelector("#taxiOrderBarPrice").textContent=priceText;
  }

  actionsEl.innerHTML=`
    <div class="taxi-order-bar" id="taxiOrderBar">
      <span class="taxi-order-bar-price" id="taxiOrderBarPrice"></span>
      <button type="button" class="taxi-order-bar-btn" id="taxiSubmit">Заказать такси →</button>
    </div>
    <button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>
  `;
  updateOrderBar();
  document.getElementById("taxiSubmit").onclick=function(){
    taxiConfirmBooking(taxiSelectedIdx,taxiSelectedIsFree);
  };
}
function taxiTariffCardHtml(t){
  const isEscort=t.label.indexOf("сопровожд")>=0&&t.label.toLowerCase().indexOf("без")!==0;
  const isLocal=t.label.indexOf("городу")>=0;
  const badgeClass=isEscort?"gold":isLocal?"green":"teal";
  const icon=isEscort?"🚗":isLocal?"🏙️":"🚕";
  const showMor=taxiShowMor&&t.moroshka!=null;
  return '<button type="button" class="taxi-tariff-card taxi-selectable" data-tidx="'+t.idx+'">'
    +'<div class="taxi-tariff-ico '+badgeClass+'">'+icon+'</div>'
    +'<div class="taxi-tariff-body">'
    +'<div class="taxi-tariff-top"><span class="taxi-tariff-name">'+t.label+'</span><span class="taxi-sel-check">✓</span></div>'
    +'<div class="taxi-tariff-meta"><span class="taxi-tariff-dur">⏱ '+t.duration+' мин</span></div>'
    +'<div class="taxi-tariff-price"><span class="ttp-main">'+(showMor?t.moroshka:t.base)+' ₽</span>'
    +(showMor?'<span class="ttp-old">'+t.base+' ₽</span><img src="img/moroshka-logo.jpg" class="ttp-mor-ico" alt="">':t.moroshka!=null?'<span class="ttp-hint">Со скидкой «Морошка»: '+t.moroshka+' ₽</span>':'')
    +'</div></div></button>';
}
function taxiRenderDateTimePicker(){
  const cd=cityData[currentCity]||cityData.gubkin;
  const dateScroll=document.getElementById("taxiDateScroll");
  const timeGrid=document.getElementById("taxiTimeGrid");
  const dateHidden=document.getElementById("taxiDate");
  const timeHidden=document.getElementById("taxiTime");
  const dayNames=["вс","пн","вт","ср","чт","пт","сб"];
  const monthNames=["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];
  const days=[];
  const now=new Date();
  // Заявки на соцтакси принимаются заранее — не позднее чем за день до поездки,
  // поэтому доступные даты начинаются с завтрашнего дня.
  for(let i=1;i<=14;i++){
    const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i);
    days.push(d);
  }
  if(!document.getElementById("taxiPreNote")){
    dateScroll.insertAdjacentHTML("beforebegin",'<div class="bk-group-note" id="taxiPreNote">🕐 Заявки на поездку принимаются заранее — не позднее чем за день до поездки, единое время подачи — 08:30. Диспетчер свяжется с вами по телефону или пришлёт ответ на почту для уточнения деталей.</div>');
  }
  dateScroll.innerHTML=days.map(function(d,i){
    const iso=d.toISOString().split("T")[0];
    const lbl=i===0?"Завтра":dayNames[d.getDay()];
    return '<button type="button" class="taxi-date-chip'+(i===0?" sel":"")+'" data-iso="'+iso+'"><span class="taxi-date-chip-dow">'+lbl+'</span><span class="taxi-date-chip-num">'+d.getDate()+' '+monthNames[d.getMonth()]+'</span></button>';
  }).join("");
  dateHidden.value=days[0].toISOString().split("T")[0];

  function renderTimeGrid(selectedIso){
    // Время подачи такси фиксировано для всех филиалов — 08:30, единственный слот.
    timeGrid.innerHTML='<button type="button" class="taxi-time-chip sel" data-time="08:30">08:30</button>';
    timeHidden.value="08:30";
  }
  renderTimeGrid(dateHidden.value);

  dateScroll.querySelectorAll(".taxi-date-chip").forEach(function(btn){
    btn.onclick=function(){
      dateScroll.querySelectorAll(".taxi-date-chip").forEach(function(b){b.classList.remove("sel");});
      btn.classList.add("sel");
      dateHidden.value=btn.dataset.iso;
      renderTimeGrid(btn.dataset.iso);
    };
  });
}

// ═══ Автодополнение адресов через OpenStreetMap Nominatim (бесплатно, без ключа) ═══
let taxiAcTimer=null;
function taxiQuickLocalSuggestions(query){
  const q=query.trim();
  const suggestions=[]; // {text, final} — final=true: не отправлять в геокодер, это уже готовый адрес

  // Микрорайон + дом уже указаны — дальше уточняем ТОЛЬКО подъезд, локально,
  // без обращения к карте (OSM не знает про подъезды в малых городах ЯНАО)
  var mkrDomMatch=q.match(/^(\d{1,3})[-–]?й?\s*(?:мк?[рн]?н?|микрорайон)\.?[\s,]+(?:д\.?\s*)?(\d{1,4}[а-яa-z]?)$/i);
  if(mkrDomMatch){
    var mk=mkrDomMatch[1],house=mkrDomMatch[2];
    for(var p=1;p<=3;p++){
      suggestions.push({text:mk+"-й микрорайон, дом "+house+", подъезд "+p,final:true});
    }
    return suggestions;
  }
  // Улица/проспект + дом — аналогично предлагаем подъезд напрямую
  var streetDomMatch=q.match(/^(улица|проспект|переулок|бульвар)\s+([а-яё\s]+?)[\s,]+(?:д\.?\s*)?(\d{1,4}[а-яa-z]?)$/i);
  if(streetDomMatch){
    var stName=streetDomMatch[1]+" "+streetDomMatch[2].trim(),stHouse=streetDomMatch[3];
    for(var p2=1;p2<=3;p2++){
      suggestions.push({text:stName+", дом "+stHouse+", подъезд "+p2,final:true});
    }
    return suggestions;
  }

  // Чисто число — предлагаем частые местные варианты (микрорайон/дом/квартира) — ищем через карту
  if(/^\d{1,3}$/.test(q)){
    suggestions.push({text:q+"-й микрорайон",final:false});
    suggestions.push({text:"дом "+q,final:false});
    suggestions.push({text:"квартира "+q,final:false});
  }
  // "3 мкрн", "3мкрн", "мкрн 3" — расширяем до полной формы (без дома пока — ищем через карту)
  var mkrnMatch=q.match(/^(\d{1,3})\s*мк?[рн]?[рн]?\.?$/i)||q.match(/^мкрн?\.?\s*(\d{1,3})$/i);
  if(mkrnMatch)suggestions.push({text:mkrnMatch[1]+"-й микрорайон",final:false});
  // "3 дом", "д 3", "д.3" — расширяем
  var domMatch=q.match(/^д\.?\s*(\d{1,4})$/i);
  if(domMatch)suggestions.push({text:"дом "+domMatch[1],final:false});
  // Общие сокращения улиц — расширяем аббревиатуру, если ввод начинается с неё
  const abbrevMap={"ул":"улица","пр":"проспект","пр-т":"проспект","пер":"переулок","б-р":"бульвар","мкрн":"микрорайон"};
  Object.keys(abbrevMap).forEach(function(ab){
    var re=new RegExp("^"+ab+"\\.?\\s+(.+)","i");
    var m=q.match(re);
    if(m)suggestions.push({text:abbrevMap[ab]+" "+m[1],final:false});
  });
  const seen=new Set();
  return suggestions.filter(function(s){if(seen.has(s.text))return false;seen.add(s.text);return true;});
}
function attachAddressAutocomplete(inputEl,suggestEl){
  if(!inputEl||!suggestEl)return;
  inputEl.addEventListener("input",function(){
    const q=inputEl.value.trim();
    clearTimeout(taxiAcTimer);
    if(!q){suggestEl.classList.add("gone");suggestEl.innerHTML="";return;}
    const quick=taxiQuickLocalSuggestions(q);
    if(quick.length){
      suggestEl.innerHTML=quick.map(function(s,i){
        const hint=s.final?"— выбрать адрес":"— уточнить";
        return '<button type="button" class="taxi-addr-item taxi-addr-item-quick" data-qidx="'+i+'">✏️ '+s.text+' <span class="taxi-addr-quick-hint">'+hint+'</span></button>';
      }).join("");
      suggestEl.classList.remove("gone");
      suggestEl.querySelectorAll(".taxi-addr-item-quick").forEach(function(btn,i){
        btn.onclick=function(){
          const s=quick[i];
          inputEl.value=s.text;
          if(s.final){
            const key=inputEl.id==="taxiFrom"?"from":"to";
            taxiCoords[key]=null;
            suggestEl.classList.add("gone");
          }else{taxiFetchSuggestions(s.text,suggestEl,inputEl);}
        };
      });
    }
    if(q.length<3){if(!quick.length){suggestEl.classList.add("gone");suggestEl.innerHTML="";}return;}
    if(quick.some(function(s){return s.final;}))return; // готовые варианты уже показаны, живой поиск не нужен
    taxiAcTimer=setTimeout(function(){taxiFetchSuggestions(q,suggestEl,inputEl);},450);
  });
  document.addEventListener("click",function(e){
    if(e.target!==inputEl&&!suggestEl.contains(e.target))suggestEl.classList.add("gone");
  });
}
function cleanAddressLabel(raw){
  if(!raw)return raw;
  const dropWords=/^(россия|russia|ямало-ненецкий автономный округ|янао|тюменская область|уральский федеральный округ)$/i;
  const parts=raw.split(",").map(function(p){return p.trim();}).filter(function(p){
    if(!p)return false;
    if(/^\d{5,6}$/.test(p))return false; // почтовый индекс
    if(dropWords.test(p))return false;   // страна/область/округ — избыточно
    return true;
  });
  return parts.slice(0,4).join(", ");
}

function taxiBuildQueryVariants(query,cityQualifier){
  const variants=[];
  const suffix=" "+cityQualifier+" ЯНАО";
  variants.push(query+suffix);

  // "3-й микрорайон 42" — разбираем на номер мкрн + номер дома, пробуем разные формулировки
  var m=query.match(/^(\d{1,3})[-–]?й?\s*(?:мк?рн?|микрорайон)\.?\s+(\d{1,4}[а-яa-z]?)$/i);
  if(m){
    var mk=m[1],house=m[2];
    variants.push(mk+" микрорайон "+house+suffix);
    variants.push("микрорайон "+mk+" дом "+house+suffix);
    variants.push(mk+"-й микрорайон, дом "+house+suffix);
    variants.push(mk+" мкр "+house+suffix);
    variants.push(mk+" микрорайон"+suffix); // хотя бы район, без дома
  }
  // "3 мкрн" без дома — тоже пробуем несколько формулировок написания
  var m2=query.match(/^(\d{1,3})[-–]?й?\s*(?:мк?рн?|микрорайон)\.?$/i);
  if(m2){
    variants.push(m2[1]+" микрорайон"+suffix);
    variants.push("микрорайон "+m2[1]+suffix);
    variants.push(m2[1]+" мкр"+suffix);
  }
  return [...new Set(variants)];
}
function taxiFetchSuggestions(query,suggestEl,inputEl){
  suggestEl.innerHTML='<div class="taxi-addr-loading">Ищу адрес…</div>';
  suggestEl.classList.remove("gone");
  if(YANDEX_MAPS_API_KEY){
    taxiFetchSuggestionsYandex(query,suggestEl,inputEl);
  }else{
    taxiFetchSuggestionsOSM(query,suggestEl,inputEl);
  }
}
const taxiCoords={from:null,to:null};
function taxiRenderAddrList(list,suggestEl,inputEl){
  if(!list||!list.length){suggestEl.innerHTML='<div class="taxi-addr-empty">Ничего не найдено — впишите адрес вручную</div>';return;}
  suggestEl.innerHTML=list.map(function(item,i){
    const label=(item.label||item).toString();
    return '<button type="button" class="taxi-addr-item" data-idx="'+i+'">📍 '+label+'</button>';
  }).join("");
  suggestEl.querySelectorAll(".taxi-addr-item").forEach(function(btn,i){
    btn.onclick=function(){
      const item=list[i];
      inputEl.value=(item.label||item).toString();
      const key=inputEl.id==="taxiFrom"?"from":"to";
      taxiCoords[key]=(item.lat!=null&&item.lon!=null)?{lat:parseFloat(item.lat),lon:parseFloat(item.lon)}:null;
      suggestEl.classList.add("gone");
    };
  });
}
function taxiFetchSuggestionsYandex(query,suggestEl,inputEl){
  const cityQualifier=currentCityName.replace(/^пгт\.?\s*/i,"");
  const text=query+" "+cityQualifier+" ЯНАО";
  const url="https://suggest-maps.yandex.ru/v1/suggest?apikey="+encodeURIComponent(YANDEX_MAPS_API_KEY)+"&text="+encodeURIComponent(text)+"&lang=ru_RU&results=6&print_address=1";
  fetch(url).then(function(r){return r.json();}).then(function(data){
    const results=data&&data.results||[];
    if(!results.length){taxiFetchSuggestionsOSM(query,suggestEl,inputEl);return;}
    const items=results.map(function(item){
      const title=item.title&&item.title.text||"";
      const subtitle=item.subtitle&&item.subtitle.text||"";
      const pos=item.pos?item.pos.split(" "):null; // pos: "lon lat", если есть
      return {label:cleanAddressLabel(title+(subtitle?", "+subtitle:"")),lat:pos?pos[1]:null,lon:pos?pos[0]:null};
    });
    taxiRenderAddrList(items,suggestEl,inputEl);
  }).catch(function(){
    taxiFetchSuggestionsOSM(query,suggestEl,inputEl); // ключ невалиден/недоступен — откат на OSM
  });
}
function taxiFetchSuggestionsOSM(query,suggestEl,inputEl){
  const cityQualifier=currentCityName.replace(/^пгт\.?\s*/i,"");
  const variants=taxiBuildQueryVariants(query,cityQualifier);

  function tryVariant(idx){
    if(idx>=variants.length){
      suggestEl.innerHTML='<div class="taxi-addr-empty">Ничего не найдено — впишите адрес вручную</div>';
      return;
    }
    const url="https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&countrycodes=ru&q="+encodeURIComponent(variants[idx]);
    fetch(url,{headers:{"Accept-Language":"ru"}}).then(function(r){return r.json();}).then(function(list){
      if(!list||!list.length){tryVariant(idx+1);return;}
      const items=list.map(function(item){return {label:cleanAddressLabel(item.display_name),lat:item.lat,lon:item.lon};});
      taxiRenderAddrList(items,suggestEl,inputEl);
    }).catch(function(){
      suggestEl.innerHTML='<div class="taxi-addr-empty">Не удалось загрузить подсказки — впишите адрес вручную</div>';
    });
  }
  tryVariant(0);
}
function taxiUseMyLocation(inputEl){
  if(!navigator.geolocation){showToast("⚠️ Геолокация не поддерживается браузером");return;}
  showToast("📍 Определяю местоположение…");
  navigator.geolocation.getCurrentPosition(function(pos){
    const lat=pos.coords.latitude,lon=pos.coords.longitude;
    if(YANDEX_MAPS_API_KEY){
      taxiReverseGeocodeYandex(lat,lon,inputEl);
    }else{
      taxiReverseGeocodeOSM(lat,lon,inputEl);
    }
  },function(){showToast("⚠️ Доступ к геолокации не разрешён");},{timeout:8000});
}
function taxiReverseGeocodeYandex(lat,lon,inputEl){
  const url="https://geocode-maps.yandex.ru/1.x/?apikey="+encodeURIComponent(YANDEX_MAPS_API_KEY)+"&geocode="+lon+","+lat+"&format=json&lang=ru_RU&results=1";
  fetch(url).then(function(r){return r.json();}).then(function(data){
    const member=data&&data.response&&data.response.GeoObjectCollection&&data.response.GeoObjectCollection.featureMember;
    const text=member&&member[0]&&member[0].GeoObject&&member[0].GeoObject.metaDataProperty&&member[0].GeoObject.metaDataProperty.GeocoderMetaData&&member[0].GeoObject.metaDataProperty.GeocoderMetaData.text;
    if(text){inputEl.value=cleanAddressLabel(text);showToast("📍 Адрес определён");}
    else taxiReverseGeocodeOSM(lat,lon,inputEl);
  }).catch(function(){taxiReverseGeocodeOSM(lat,lon,inputEl);});
}
function taxiReverseGeocodeOSM(lat,lon,inputEl){
  const url="https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lon+"&addressdetails=1";
  fetch(url,{headers:{"Accept-Language":"ru"}}).then(function(r){return r.json();}).then(function(data){
    if(data&&data.display_name){inputEl.value=cleanAddressLabel(data.display_name);showToast("📍 Адрес определён");}
    else showToast("⚠️ Не удалось определить адрес");
  }).catch(function(){showToast("⚠️ Не удалось определить адрес");});
}

function taxiConfirmBooking(tariffIdx,isFree){
  let t;
  if(isFree){
    t={idx:null,label:"Социальное такси — льготная поездка",duration:"30",base:0,moroshka:null};
  }else{
    const tariffs=getTaxiTariffs();
    t=tariffs.items.find(function(x){return x.idx===tariffIdx;});
    if(!t)return;
  }
  const from=cleanAddressLabel(taxiState.from);
  const to=cleanAddressLabel(taxiState.to);
  const date=document.getElementById("taxiDate").value;
  const time=document.getElementById("taxiTime").value;
  const comment=document.getElementById("taxiComment").value.trim();
  const paxEl=document.getElementById("taxiPax");
  const pax=paxEl?parseInt(paxEl.value)||1:1;
  const pax1Name=(document.getElementById("taxiPax1Name")?.value||clientName||"").trim();
  const pax2Name=pax>1?(document.getElementById("taxiPax2Name")?.value||"").trim():"";
  const passengerNames=[pax1Name,pax2Name].filter(Boolean);
  if(!from||!to){showToast("⚠️ Укажите адрес отправления и назначения");return;}
  if(!date||!time){showToast("⚠️ Укажите дату и время поездки");return;}
  const existingTaxi=JSON.parse(localStorage.getItem("taxiHistory")||"[]");
  const timeConflict=existingTaxi.find(function(o){return o.date===date&&o.time===time&&o.status!=="cancelled";});
  if(timeConflict){
    showToast("⚠️ На это время у вас уже есть заказ такси ("+timeConflict.num+") — выберите другое время");
    return;
  }
  if(isFree){
    const elig=checkFreeTaxiEligibility();
    if(!elig.eligible){showToast("⚠️ "+elig.message);return;}
    const q=getFreeTaxiQuota();
    if(q.remaining<=0){showToast("⚠️ Лимит бесплатных поездок на этот год исчерпан");return;}
  }

  if(isFree)useFreeTaxiTrip();

  ticketCounter++;localStorage.setItem("ticketCounter",String(ticketCounter));
  const ticketNum="ТАК-"+String(ticketCounter).padStart(4,"0");
  const useMor=taxiState.moroshkaView&&t.moroshka!=null;
  const price=useMor?t.moroshka:t.base;
  const cd=cityData[currentCity]||cityData.gubkin;

  const body=`Заказ социального такси\nТалон: ${ticketNum}\nТариф: ${t.label} (${t.duration} мин)\nСтоимость: ${isFree?"Бесплатно (льготная поездка)":price+" ₽"}\nПассажиров: ${pax} (${passengerNames.join(", ")||"—"})\nОткуда: ${from}\nКуда: ${to}\nДата подачи: ${date}, время: ${time}\nКомментарий: ${comment||"—"}\n\nПОЛУЧАТЕЛЬ\nФИО: ${clientName}\nТелефон: ${clientPhone}\n\nЗаявка принята предварительно. Диспетчер свяжется по телефону или пришлёт ответ на эту заявку по почте для подтверждения поездки.`;
  window.location.href=`mailto:${cd.orderEmail||cd.email}?subject=${encodeURIComponent("Заказ такси "+ticketNum+" — "+clientName)}&body=${encodeURIComponent(body)}`;

  const taxiHistory=JSON.parse(localStorage.getItem("taxiHistory")||"[]");
  taxiHistory.unshift({
    num:ticketNum,tariff:t.label,duration:t.duration,price:price,isFree:!!isFree,from:from,to:to,pax:pax,passengerNames:passengerNames,
    date:date,time:time,comment:comment,
    createdAt:new Date().toISOString(),cityName:currentCityName,status:"new"
  });
  localStorage.setItem("taxiHistory",JSON.stringify(taxiHistory));

  chatEl.innerHTML="";
  showSuccessAnim("Заявка на такси отправлена!");
  const freeQuotaAfter=isFree?getFreeTaxiQuota():null;
  const hasRouteCoords=taxiCoords.from&&taxiCoords.to;
  const w=document.createElement("div");w.className="taxi-page";
  w.innerHTML=`
    <div class="taxi-confirm-card">
      <div class="taxi-confirm-check">✅</div>
      <div class="taxi-confirm-title">Заявка отправлена</div>
      <div class="taxi-confirm-ticket">Талон ${ticketNum}</div>
      <div class="taxi-eta-banner"><span class="taxi-eta-ico">📞</span><div><span class="taxi-eta-lbl">Что дальше</span><span class="taxi-eta-val">Диспетчер свяжется с вами по телефону или пришлёт ответ на почту для подтверждения поездки</span></div></div>
      <div class="taxi-confirm-row"><span>Тариф</span><b>${t.label}</b></div>
      <div class="taxi-confirm-row"><span>Стоимость</span><b>${isFree?"Бесплатно 🎁":price+" ₽"}</b></div>
      ${freeQuotaAfter?`<div class="taxi-confirm-row"><span>Осталось поездок</span><b>${freeQuotaAfter.remaining} из ${freeQuotaAfter.limit}</b></div>`:""}
      <div class="taxi-confirm-row"><span>Пассажиров</span><b>${pax}${passengerNames.length?" ("+esc(passengerNames.join(", "))+")":""}</b></div>
      <div class="taxi-confirm-row"><span>Дата и время подачи</span><b>${date}, ${time}</b></div>
      <div class="taxi-confirm-row taxi-confirm-route"><span>Маршрут</span><b>📍 ${esc(from)}<br>🏁 ${esc(to)}</b></div>
      ${hasRouteCoords?'<div class="taxi-route-map" id="taxiRouteMap"></div>':'<div class="taxi-route-map-note">🗺️ Карта маршрута появится, если оба адреса выбраны из подсказок поиска (не введены вручную)</div>'}
    </div>
    <div class="adm-hint">📧 Откроется почтовый клиент — нажмите «Отправить», чтобы заявка ушла в центр.</div>
  `;
  chatEl.appendChild(w);
  actionsEl.innerHTML='<button class="act-btn teal" onclick="showTaxi()" style="width:100%">🚕 Заказать ещё раз</button><button class="act-btn" onclick="showMainMenu()" style="width:100%;margin-top:8px">🏠 Главная</button>';
  if(hasRouteCoords)setTimeout(function(){taxiInitRouteMap(taxiCoords.from,taxiCoords.to);},100);
  function esc(s){return (s||"").replace(/</g,"&lt;");}
}
function taxiInitRouteMap(from,to){
  const el=document.getElementById("taxiRouteMap");
  if(!el||typeof L==="undefined")return;
  try{
    const map=L.map(el,{zoomControl:false,attributionControl:false}).setView([(from.lat+to.lat)/2,(from.lon+to.lon)/2],13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18}).addTo(map);
    const fromIcon=L.divIcon({className:"taxi-map-pin taxi-map-pin-from",html:"📍",iconSize:[26,26]});
    const toIcon=L.divIcon({className:"taxi-map-pin taxi-map-pin-to",html:"🏁",iconSize:[26,26]});
    L.marker([from.lat,from.lon],{icon:fromIcon}).addTo(map);
    L.marker([to.lat,to.lon],{icon:toIcon}).addTo(map);
    L.polyline([[from.lat,from.lon],[to.lat,to.lon]],{color:"#1B8585",weight:3,dashArray:"6 6"}).addTo(map);
    map.fitBounds([[from.lat,from.lon],[to.lat,to.lon]],{padding:[24,24]});
  }catch(e){/* карта не критична — молча пропускаем, если Leaflet недоступен офлайн */}
}
let bkState={catKey:null,catName:null,serviceItem:null,spec:null,date:null,time:null,comment:"",flow:"director"};

function showBooking(){
  clearActions();setNav(true);
  const bookableStaff=staffData.filter(s=>/директор/i.test(s.pos));
  if(!staffData.length){showCityPlaceholder("записи");return;}
  if(!bookableStaff.length){
    chatEl.innerHTML="";
    const w0=document.createElement("div");w0.className="booking-page";
    w0.innerHTML='<h2>📝 Запись на приём</h2><div class="ev-empty">'+emptyIllustration()+'<div class="empty-title">Нет доступных сотрудников для записи</div><div class="empty-sub">Свяжитесь с центром по телефону</div></div>';
    chatEl.appendChild(w0);
    actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
    return;
  }
  bkState={catKey:"director",catName:"Приём у директора",serviceItem:null,spec:null,date:null,time:null,comment:"",flow:"director",specialists:[]};
  showBookingSpecialist(bookableStaff);
}

function showServiceBookingItem(catId){
  const cat=servicesData.find(c=>c.id===catId);if(!cat)return;
  const catNameLower=cat.name.toLowerCase();
  const bookingMatch=SERVICE_BOOKING_MAP.find(m=>catNameLower.indexOf(m.match)>=0);
  if(!bookingMatch)return;
  const specialists=staffData.filter(s=>s.pos.toLowerCase().indexOf(bookingMatch.pos)>=0);
  if(!specialists.length){showToast("⚠️ Специалисты этого профиля сейчас недоступны");return;}

  clearActions();setNav(true);
  bkState={catKey:cat.id,catId:cat.id,catName:cat.name,serviceItem:null,spec:null,date:null,time:null,comment:"",flow:"service",specialists:specialists};
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="booking-page";
  w.innerHTML=`
    <button class="pl-back" onclick="showServices();setTimeout(function(){plOpenCat(${cat.id});},220);">← Назад к услугам</button>
    <h2>📝 ${cat.icon} ${cat.name}</h2>
    <div class="bk-progress"><div class="bk-progress-fill" style="width:0%"></div></div>
    <div class="bk-step-lbl"><span class="taxi-step-num">1</span>Выберите услугу</div>
    <div class="bk-spec-list" id="bkItemList">
      ${cat.items.map((it,idx)=>`<button class="bk-spec-card bk-item-card" data-idx="${idx}"><span class="bk-spec-ava bk-item-ava">📄</span><span class="bk-spec-txt"><b>${it.n}</b><span>${it.p} ₽</span></span></button>`).join("")}
    </div>
  `;
  chatEl.appendChild(w);
  w.querySelectorAll(".bk-item-card").forEach(btn=>{
    btn.onclick=()=>{
      const item=cat.items[+btn.dataset.idx];
      bkState.serviceItem=item.n;
      showBookingSpecialist(specialists);
    };
  });
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showBookingSpecialist(specialists){
  clearActions();setNav(true);
  bkState.specialists=specialists;
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="booking-page";
  const backFn=bkState.flow==="struct"?`structOpenSub(${bkState.catId},${bkState.subIdx})`:(bkState.flow==="service"?`showServiceBookingItem(${bkState.catId})`:"showBooking()");
  const backLabel=(bkState.flow==="service"||bkState.flow==="struct")?"← Назад к услуге":"← Все руководители";
  const isSvcFlow=bkState.flow==="service"||bkState.flow==="struct";
  w.innerHTML=`
    <button class="pl-back" onclick="${backFn}">${backLabel}</button>
    <h2>📝 ${bkState.catName}</h2>
    <div class="bk-progress"><div class="bk-progress-fill" style="width:${isSvcFlow?25:0}%"></div></div>
    <div class="bk-step-lbl"><span class="taxi-step-num">${isSvcFlow?2:1}</span>Выберите специалиста</div>
    <div class="bk-spec-list" id="bkSpecList">
      ${specialists.map(s=>{
        const ini=s.name.split(" ").slice(0,2).map(x=>x[0]).join("").toUpperCase();
        return `<button class="bk-spec-card" data-spec="${s.name.replace(/"/g,"&quot;")}"><span class="bk-spec-ava">${ini}</span><span class="bk-spec-txt"><b>${s.name}</b><span>${s.pos}</span></span></button>`;
      }).join("")}
    </div>
  `;
  chatEl.appendChild(w);
  w.querySelectorAll(".bk-spec-card").forEach(btn=>{
    btn.onclick=()=>{
      bkState.spec=btn.dataset.spec;
      showBookingDate();
    };
  });
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showBookingDate(){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="booking-page";
  const days=[];
  let d=new Date();d.setDate(d.getDate()+1);
  while(days.length<14){
    const dow=d.getDay();
    if(dow!==0&&dow!==6)days.push(new Date(d));
    d.setDate(d.getDate()+1);
  }
  const isService=bkState.flow==="service"||bkState.flow==="struct";
  w.innerHTML=`
    <button class="pl-back" onclick="showBookingSpecialist(bkState.specialists)">← Назад к специалисту</button>
    <h2>📝 ${bkState.spec}</h2>
    <div class="bk-progress"><div class="bk-progress-fill" style="width:${isService?50:33.3}%"></div></div>
    <div class="bk-step-lbl"><span class="taxi-step-num">${isService?3:2}</span>Выберите дату</div>
    <div class="bk-days-scroll" id="bkDays">
      ${days.map(dt=>{
        const iso=dt.toISOString().split("T")[0];
        const dayName=dt.toLocaleDateString("ru-RU",{weekday:"short"});
        const dayNum=dt.getDate();
        const monShort=dt.toLocaleDateString("ru-RU",{month:"short"});
        return `<button class="bk-day-chip" data-date="${iso}"><span class="bk-day-name">${dayName}</span><span class="bk-day-num">${dayNum}</span><span class="bk-day-mon">${monShort}</span></button>`;
      }).join("")}
    </div>
  `;
  chatEl.appendChild(w);
  w.querySelectorAll(".bk-day-chip").forEach(chip=>{
    chip.onclick=()=>{
      bkState.date=chip.dataset.date;
      showBookingTime();
    };
  });
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showBookingTime(){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="booking-page";
  const dObj=new Date(bkState.date);
  const dateStr=dObj.toLocaleDateString("ru-RU",{day:"numeric",month:"long"});
  const isService=bkState.flow==="service"||bkState.flow==="struct";
  const isGroup=bkState.flow==="struct"&&bkState.mode==="group";
  const slots=isGroup?["09:00"]:["09:00","09:30","10:00","10:30","11:00","11:30","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
  const lunchIdxs=isGroup?new Set():new Set([6,7,8]);
  const groupNote=isGroup?`<div class="bk-group-note">👥 Занятие групповое${bkState.cap?" (до "+bkState.cap+" мест)":""}. Единое время начала для всех участников — 09:00.</div>`:"";
  w.innerHTML=`
    <button class="pl-back" onclick="showBookingDate()">← Назад к дате</button>
    <h2>📝 ${dateStr}</h2>
    <div class="bk-progress"><div class="bk-progress-fill" style="width:${isService?75:66.6}%"></div></div>
    <div class="bk-step-lbl"><span class="taxi-step-num">${isService?4:3}</span>${isGroup?"Время занятия — единое для группы":"Выберите время"}</div>
    ${groupNote}
    <div class="bk-time-wrap" id="bkTimeWrap">
      <div class="time-grid" role="group" aria-label="Выберите время приёма">
        ${slots.map((sl,idx)=>{
          const busy=lunchIdxs.has(idx);
          return `<button type="button" class="time-slot${busy?" busy":""}" ${busy?"disabled":""} data-time="${sl}" aria-label="Время ${sl}${busy?" — обед":""}">${sl}</button>`;
        }).join("")}
      </div>
    </div>
    <div class="bk-comment-wrap gone" id="bkCommentWrap">
      <div class="bk-step-lbl">Комментарий (необязательно)</div>
      <textarea class="fb-inp" id="bkComment" placeholder="Цель визита, особые потребности…" style="min-height:70px"></textarea>
    </div>
    <div class="bk-summary gone" id="bkSummary"></div>
  `;
  chatEl.appendChild(w);
  const commentWrapEl=w.querySelector("#bkCommentWrap");
  const summaryEl=w.querySelector("#bkSummary");
  w.querySelectorAll(".time-slot:not(.busy)").forEach(btn=>{
    btn.onclick=()=>{
      w.querySelectorAll(".time-slot").forEach(b=>{b.classList.remove("sel");b.setAttribute("aria-pressed","false");});
      btn.classList.add("sel");btn.setAttribute("aria-pressed","true");
      bkState.time=btn.dataset.time;
      commentWrapEl.classList.remove("gone");
      summaryEl.innerHTML=`
        <div class="bk-sum-title">✅ Проверьте данные записи</div>
        <div class="bk-sum-row"><span>Направление</span><b>${bkState.catName}${bkState.subName?" — "+bkState.subName:""}</b></div>
        ${bkState.serviceItem?`<div class="bk-sum-row"><span>Услуга</span><b>${bkState.serviceItem}</b></div>`:""}
        ${bkState.price!=null?`<div class="bk-sum-row"><span>Цена</span><b>${bkState.price} ₽${bkState.priceM!=null?" · по «Морошке» "+bkState.priceM+" ₽":""}</b></div>`:""}
        <div class="bk-sum-row"><span>Специалист</span><b>${bkState.spec}</b></div>
        <div class="bk-sum-row"><span>Дата и время</span><b>${dateStr}, ${bkState.time}</b></div>
        <button class="book-send" id="bkSendBtn">📧 Подтвердить запись</button>
      `;
      summaryEl.classList.remove("gone");
      summaryEl.scrollIntoView({behavior:"smooth",block:"end"});
      summaryEl.querySelector("#bkSendBtn").onclick=doSendBooking;
    };
  });
  if(isGroup){
    const only=w.querySelector(".time-slot");
    if(only)only.click();
  }
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function doSendBooking(){
  bkState.comment=(document.getElementById("bkComment")||{}).value||"";
  if(!bkState.spec||!bkState.date||!bkState.time){showToast("⚠️ Заполните все поля");return;}
  ticketCounter++;localStorage.setItem("ticketCounter",String(ticketCounter));
  const ticketNum="ТАЛ-"+String(ticketCounter).padStart(4,"0");
  const cd2=cityData[currentCity]||cityData.gubkin;
  const structExtra=bkState.flow==="struct"
    ?`${bkState.subName?"\nПодгруппа: "+bkState.subName:""}${bkState.num?"\nПункт прейскуранта: "+bkState.num:""}${bkState.price!=null?"\nЦена: "+bkState.price+" ₽"+(bkState.priceM!=null?" (по карте «Морошка»: "+bkState.priceM+" ₽)":""):""}\nФормат: ${bkState.mode==="group"?"групповое занятие, общее время"+(bkState.cap?" (до "+bkState.cap+" мест)":""):"индивидуальный приём"}${bkState.resp?"\nОтветственный: "+bkState.resp:""}`
    :"";
  const body=`${emailTemplates.booking.intro}\nТалон: ${ticketNum}\nНаправление: ${bkState.catName}${bkState.serviceItem?"\nУслуга: "+bkState.serviceItem:""}${structExtra}\nДата: ${bkState.date}, Время: ${bkState.time}\n\nПОЛУЧАТЕЛЬ\nФИО: ${clientName}\nТелефон: ${clientPhone}\n\nСПЕЦИАЛИСТ: ${bkState.spec}\nКОММЕНТАРИЙ: ${bkState.comment||"—"}`;
  window.location.href=`mailto:${cd2.orderEmail||cd2.email}?subject=${encodeURIComponent(fillTemplate(emailTemplates.booking.subject,{name:clientName,date:bkState.date,time:bkState.time,ticket:ticketNum}))}&body=${encodeURIComponent(body)}`;
  bookingsHistory=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
  bookingsHistory.unshift({
    num:ticketNum,
    date:new Date().toLocaleString("ru-RU"),
    visitDate:bkState.date,visitTime:bkState.time,
    dept:bkState.catName,spec:bkState.spec,
    comment:bkState.comment
  });
  localStorage.setItem("bookingsHistory",JSON.stringify(bookingsHistory));
  window.GarmoniyaDB?.saveBooking({
    num:ticketNum, clientName, clientPhone, cityName:currentCityName,
    dept:bkState.catName, spec:bkState.spec, visitDate:bkState.date, visitTime:bkState.time,
    comment:bkState.comment
  });
  chatEl.innerHTML="";
  showSuccessAnim("Запись оформлена!");
  addMsg(`✅ Запись оформлена!<br>📋 Талон: <b>${ticketNum}</b><br>📅 <b>${bkState.date}</b> в <b>${bkState.time}</b><br>👤 ${bkState.spec}<br>🏷️ ${bkState.catName}`,true);
  showToast("✅ Талон "+ticketNum+" сохранён!");
  clearActions();
  const calBtn=document.createElement("button");calBtn.type="button";calBtn.className="act-btn teal";
  calBtn.style.width="100%";
  calBtn.textContent="📅 Добавить в календарь";
  calBtn.onclick=()=>exportToCalendar({num:ticketNum,spec:bkState.spec,dept:bkState.catName,visitDate:bkState.date,visitTime:bkState.time});
  actionsEl.appendChild(calBtn);
}

function showStaff(){
  clearActions();setNav(true);
  if(!staffData.length){showCityPlaceholder("списка сотрудников");return;}
  chatEl.innerHTML="";
  var depts=[];var seen={};
  staffData.forEach(function(s){if(!seen[s.dept])seen[s.dept]=0;seen[s.dept]++;});
  var pg=document.createElement("div");pg.className="pricelist";
  var html='<h2>Сотрудники</h2>';
  html+='<div id="stDeptList" class="pl-catlist">';
  Object.keys(seen).forEach(function(dept,i){
    html+='<button class="pl-catcard" data-dept-idx="'+i+'" onclick="stOpenDept('+i+')" aria-label="'+dept.replace(/"/g,"&quot;")+', '+seen[dept]+' '+plWordForm(seen[dept],["сотрудник","сотрудника","сотрудников"])+'">'
        +'<span class="pl-catcard-ico">🏢</span>'
        +'<span class="pl-catcard-txt"><b>'+dept+'</b><span>'+seen[dept]+' '+plWordForm(seen[dept],["сотрудник","сотрудника","сотрудников"])+'</span></span>'
        +'<span class="pl-catcard-arr">›</span></button>';
  });
  html+='</div><div id="stDeptDetail" class="pl-catdetail gone"></div>';
  pg.innerHTML=html;
  chatEl.appendChild(pg);
  window._stDepts=Object.keys(seen);
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}
function stOpenDept(idx){
  var dept=window._stDepts[idx];
  document.getElementById("stDeptList").classList.add("gone");
  var list=staffData.filter(function(s){return s.dept===dept;});
  var html='<button class="pl-back" onclick="stCloseDept()">← Все отделения</button>';
  html+='<div class="pl-sec-t">'+dept+'</div>';
  list.forEach(function(p){
    var ini=p.name.split(" ").slice(0,2).map(function(w){return w[0];}).join("").toUpperCase();
    var ph=p.ext?MAIN_PHONE+' доб. '+p.ext:MAIN_PHONE;
    html+='<div class="staff-card-inline"><div class="si-av">'+ini+'</div><div class="si-info"><b>'+p.name+'</b><span>'+p.pos+'</span><span>📞 '+ph+'</span>'+(p.email?'<span>✉️ '+p.email+'</span>':'')+'</div></div>';
  });
  var det=document.getElementById("stDeptDetail");
  det.innerHTML=html;
  det.classList.remove("gone");
  det.scrollIntoView({behavior:"smooth",block:"start"});
}
function stCloseDept(){
  document.getElementById("stDeptDetail").classList.add("gone");
  document.getElementById("stDeptList").classList.remove("gone");
}

function showContacts(){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  var cd=cityData[currentCity]||cityData.gubkin;
  const w=document.createElement("div");w.className="contacts-page";
  let html='<h2>📍 Контакты — '+cityPrefixed(currentCityName)+'</h2>';
  html+='<div class="pcard">';
  html+='<div class="pinfo-row"><span class="pinfo-ico">🏢</span><span class="pinfo-txt"><span class="pinfo-lbl">Адрес</span><span class="pinfo-val">'+cd.address+'</span></span></div>';
  html+='<div class="pinfo-row"><span class="pinfo-ico">📞</span><span class="pinfo-txt"><span class="pinfo-lbl">Приёмная</span><span class="pinfo-val"><a href="tel:+'+cd.phoneRaw+'">'+cd.phone+'</a></span></span></div>';
  html+='<div class="pinfo-row"><span class="pinfo-ico">✉️</span><span class="pinfo-txt"><span class="pinfo-lbl">Email</span><span class="pinfo-val"><a href="mailto:'+cd.email+'">'+cd.email+'</a></span></span></div>';
  html+='<div class="pinfo-row"><span class="pinfo-ico">🕒</span><span class="pinfo-txt"><span class="pinfo-lbl">Режим работы</span><span class="pinfo-val">'+cd.hours+'</span></span></div>';
  html+='<div class="pinfo-row"><span class="pinfo-ico"><img src="img/vk-icon.png" style="width:20px;height:20px;border-radius:5px;object-fit:contain"></span><span class="pinfo-txt"><span class="pinfo-lbl">Группа ВКонтакте</span><span class="pinfo-val"><a href="'+VK_GROUP.url+'" target="_blank" rel="noopener">'+VK_GROUP.url.replace(/^https?:\/\//,"")+'</a></span></span></div>';
  html+='</div>';
  html+='<div class="pquick-grid contacts-actions"><button class="pquick-btn" onclick="location.href=\'tel:+'+cd.phoneRaw+'\'"><span class="pquick-ico" style="background:linear-gradient(135deg,#10b981,#059669)">📞</span><span>Позвонить</span></button>'
      +'<button class="pquick-btn" onclick="location.href=\'mailto:'+cd.email+'\'"><span class="pquick-ico" style="background:linear-gradient(135deg,#1B8585,#2A9D9D)">✉️</span><span>Написать</span></button>'
      +'<button class="pquick-btn" onclick="window.open(\''+VK_GROUP.url+'\',\'_blank\',\'noopener\')"><span class="pquick-ico sp-g-i-vk"><img src="img/vk-icon.png" style="width:20px;height:20px;object-fit:contain"></span><span>Группа ВК</span></button></div>';
  w.innerHTML=html;
  chatEl.appendChild(w);
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showEmergency(){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  var cd=cityData[currentCity]||cityData.gubkin;
  const w=document.createElement("div");w.className="emergency-page";
  let html='<h2>🆘 Экстренная психологическая помощь</h2>';
  html+='<div class="adm-hint">Если ситуация острая — сразу звоните. Специалисты готовы выслушать и поддержать.</div>';

  const psychologists=(typeof staffData!=="undefined"?staffData:[]).filter(function(s){
    return s.pos&&s.pos.toLowerCase().includes("психолог");
  });

  if(psychologists.length){
    html+='<div class="pcard" style="margin-top:14px">';
    psychologists.forEach(function(p,i){
      const ini=p.name.split(" ").slice(0,2).map(function(x){return x[0];}).join("").toUpperCase();
      const ph=p.ext?cd.phone+" доб. "+p.ext:cd.phone;
      html+='<div class="pinfo-row"'+(i===0?' style="padding-top:0"':'')+'><span class="pinfo-ico" style="background:linear-gradient(135deg,#0F6060,#1B8585);color:#fff">'+ini+'</span><span class="pinfo-txt"><span class="pinfo-val">'+p.name+'</span><span class="pinfo-lbl">'+p.pos+' · 📞 '+ph+(p.email?' · ✉️ '+p.email:'')+'</span></span></div>';
    });
    html+='</div>';
  }else{
    html+='<div class="pcard" style="margin-top:14px"><div class="pinfo-row" style="padding-top:0"><span class="pinfo-ico">📞</span><span class="pinfo-txt"><span class="pinfo-lbl">Свяжитесь с центром</span><span class="pinfo-val">'+cd.phone+'</span></span></div></div>';
  }

  html+='<div class="pquick-grid" style="grid-template-columns:1fr 1fr;margin-top:14px">'
      +'<button class="pquick-btn" onclick="location.href=\'tel:+'+cd.phoneRaw+'\'"><span class="pquick-ico" style="background:linear-gradient(135deg,#ef4444,#dc2626)">📞</span><span>Позвонить в центр</span></button>'
      +'<button class="pquick-btn" onclick="location.href=\'tel:112\'"><span class="pquick-ico" style="background:linear-gradient(135deg,#dc2626,#b91c1c)">🚨</span><span>Экстренная 112</span></button></div>';
  w.innerHTML=html;
  chatEl.appendChild(w);
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showMoroshkaInfo(){
  clearActions();setNav(true);
  addMsg('<img src="img/moroshka-logo.jpg" class="moroshka-ico-sm" alt=""> Карта «Морошка» — Единая карта жителя ЯНАО',true);
  setTimeout(()=>{
    addMsg(`<b>Что даёт карта?</b><br>✅ Скидка ~5% на услуги центра<br>✅ Льготы в транспорте и торговле ЯНАО<br>✅ Привилегии в учреждениях региона<br><br><b>Как получить?</b><br>📍 В любом МФЦ ЯНАО<br>🌐 На портале «Госуслуги ЯНАО»<br>📞 МФЦ: 8-800-200-82-00 (бесплатно)<br><span class="note">Оформление бесплатно для жителей ЯНАО</span>`,true);
    const tog=document.createElement("button");tog.className="act-btn gold";
    tog.innerHTML=hasMoroshka?"<img src=\"img/moroshka-logo.jpg\" class=\"moroshka-ico-sm\" alt=\"\"> Морошка уже активирована ✓":"<img src=\"img/moroshka-logo.jpg\" class=\"moroshka-ico-sm\" alt=\"\"> Активировать скидку";
    if(!hasMoroshka){tog.onclick=()=>{hasMoroshka=true;localStorage.setItem("hasMoroshka","true");updateMToggle();addMsg('<img src="img/moroshka-logo.jpg" class="moroshka-ico-sm" alt=""> Льготные цены активированы!',true);showToast("🍊 Морошка ON");};}
    else{tog.style.opacity="0.6";tog.disabled=true;}
    actionsEl.appendChild(tog);
  },200);
}

function showGallery(){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  const w=document.createElement("div");w.className="gallery-page";
  let html='<h2>🖼️ Фотогалерея центра</h2>';
  if(!galleryData.length){
    html+='<div class="gal-empty">'+emptyIllustration()+'<div class="gal-empty-title">Пока нет фотографий</div><div class="gal-empty-sub">Скоро здесь появятся фото центра «Гармония»</div></div>';
  }else{
    html+='<div class="gal-grid">';
    galleryData.forEach((g,i)=>{
      html+=`<button class="gal-thumb-btn" data-gidx="${i}"><img src="${g.url}" alt="" class="gal-thumb-img">${g.caption?`<span class="gal-thumb-cap">${g.caption}</span>`:""}</button>`;
    });
    html+='</div>';
  }
  w.innerHTML=html;
  chatEl.appendChild(w);
  w.querySelectorAll("[data-gidx]").forEach(btn=>{
    btn.onclick=()=>openGalleryLightbox(+btn.dataset.gidx);
  });
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}
function openGalleryLightbox(idx){
  const g=galleryData[idx];if(!g)return;
  const ovl=document.createElement("div");ovl.className="gal-lightbox";
  ovl.onclick=e=>{if(e.target===ovl)ovl.remove();};
  ovl.innerHTML=`<button class="gal-lb-close" aria-label="Закрыть">✕</button>
    <img src="${g.url}" class="gal-lb-img" alt="">
    ${g.caption?`<div class="gal-lb-cap">${g.caption}</div>`:""}
    ${galleryData.length>1?`<button class="gal-lb-nav gal-lb-prev" aria-label="Предыдущее">‹</button><button class="gal-lb-nav gal-lb-next" aria-label="Следующее">›</button>`:""}`;
  document.body.appendChild(ovl);
  ovl.querySelector(".gal-lb-close").onclick=()=>ovl.remove();
  const prev=ovl.querySelector(".gal-lb-prev"),next=ovl.querySelector(".gal-lb-next");
  if(prev)prev.onclick=()=>{ovl.remove();openGalleryLightbox((idx-1+galleryData.length)%galleryData.length);};
  if(next)next.onclick=()=>{ovl.remove();openGalleryLightbox((idx+1)%galleryData.length);};
}

function showFeedback(){
  clearActions();setNav(true);
  chatEl.innerHTML="";
  fbRating=0;fbTags=[];
  const w=document.createElement("div");w.className="feedback-page";
  const starEmoji=["😞","😕","😐","😊","😍"];
  const tagList=["Вежливый персонал","Быстрое обслуживание","Удобный бот","Большой выбор услуг","Доступные цены","Хорошее расположение"];

  w.innerHTML=`
    <h2>💬 Обратная связь</h2>
    <p class="fb-intro">Нам важно ваше мнение — это поможет сделать центр лучше.</p>

    <div class="fb-step-lbl">Оцените работу центра</div>
    <div class="fb-stars-big" id="fbStarsBig" role="group" aria-label="Оцените работу центра">
      ${starEmoji.map((e,i)=>`<button type="button" class="fb-star-big" data-star="${i+1}" aria-label="Оценка ${i+1} из 5">${e}</button>`).join("")}
    </div>

    <div class="fb-step-lbl">Что понравилось?</div>
    <div class="fb-tag-grid" id="fbTagGrid" role="group" aria-label="Выберите теги">
      ${tagList.map(t=>`<button type="button" class="fb-tag-chip" data-tag="${t}" aria-pressed="false">${t}</button>`).join("")}
    </div>

    <div class="fb-step-lbl">Комментарий (необязательно)</div>
    <textarea class="fb-inp" id="fbComment" placeholder="Напишите пожелания или замечания…" style="min-height:90px"></textarea>

    <button type="button" class="fb-send-big" id="fbSendBtn">📧 Отправить отзыв</button>
  `;
  chatEl.appendChild(w);

  w.querySelectorAll(".fb-star-big").forEach(btn=>{
    btn.onclick=()=>{
      const i=parseInt(btn.dataset.star);
      fbRating=i;
      w.querySelectorAll(".fb-star-big").forEach((x,j)=>x.classList.toggle("sel",j<i));
    };
  });
  w.querySelectorAll(".fb-tag-chip").forEach(btn=>{
    btn.onclick=()=>{
      const t=btn.dataset.tag;
      const on=btn.classList.toggle("sel");
      btn.setAttribute("aria-pressed",String(on));
      if(on)fbTags.push(t);else fbTags=fbTags.filter(x=>x!==t);
    };
  });
  w.querySelector("#fbSendBtn").onclick=()=>{
    if(!fbRating){showToast("⚠️ Поставьте оценку от 1 до 5");return;}
    const cInp=w.querySelector("#fbComment");
    const body=`${emailTemplates.feedback.intro}\nОценка: ${fbRating}/5 ${"★".repeat(fbRating)}\nТеги: ${fbTags.join(", ")||"—"}\nКомментарий: ${cInp.value||"—"}\n\nОтправитель: ${clientName}\nТелефон: ${clientPhone}\nФилиал: г. ${currentCityName}`;
    window.location.href=`mailto:${getOrderEmail()}?subject=${encodeURIComponent(fillTemplate(emailTemplates.feedback.subject,{name:clientName}))}&body=${encodeURIComponent(body)}`;
    chatEl.innerHTML="";
    showSuccessAnim("Спасибо за отзыв!");
    addMsg(`✅ Спасибо за отзыв! ${"⭐".repeat(fbRating)}`,true);
    showToast("💬 Отзыв отправлен!");
    fbRating=0;fbTags=[];
    clearActions();
  };
  actionsEl.innerHTML='<button class="act-btn" onclick="goBack()" style="width:100%">← Назад в меню</button>';
}

function showCityPlaceholder(section){
  const cd=cityData[currentCity]||cityData.gubkin;
  const ph=document.createElement("div");ph.className="city-ph";ph.setAttribute("role","status");
  ph.innerHTML=`<div class="city-ph-ico" aria-hidden="true">🏢</div><h4>${cityPrefixed(currentCityName)}</h4><p>База данных ${section} этого филиала заполняется.</p>`;
  [{ico:"📞",lbl:"ТЕЛЕФОН",val:`<a href="tel:+${cd.phoneRaw}">${cd.phone}</a>`},{ico:"✉️",lbl:"EMAIL",val:`<a href="mailto:${cd.email}">${cd.email}</a>`}].forEach(r=>{
    ph.innerHTML+=`<div class="contact-row" style="margin-bottom:8px;"><div class="c-ico" aria-hidden="true">${r.ico}</div><div><div class="c-lbl">${r.lbl}</div><div class="c-val">${r.val}</div></div></div>`;
  });
  const sw=document.createElement("button");sw.type="button";sw.className="act-btn teal";sw.style.marginTop="6px";
  sw.innerHTML="🏢 Перейти в Губкинский";sw.onclick=()=>selectCity("gubkin");
  actionsEl.appendChild(ph);actionsEl.appendChild(sw);
}

function statusBadge(st){
  const map={new:["Принята","st-new"],progress:["В работе","st-prog"],done:["Выполнена","st-done"]};
  const v=map[st]||map.new;
  return `<span class="st-badge ${v[1]}">${v[0]}</span>`;
}

function openOrdersPanel(){
  const panel=document.getElementById("ordersPanel");
  panel.classList.add("open");
  renderOrdersPanel("all");
}
function closeOrdersPanel(){
  document.getElementById("ordersPanel").classList.remove("open");
}
function ordFilter(f,btn){
  document.querySelectorAll(".of-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  renderOrdersPanel(f);
}
function renderOrdersPanel(filter){
  const oh=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
  const bh=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
  const body=document.getElementById("ordBody");

  const orderCards=oh.map((o,i)=>({
    type:"order",idx:i,date:o.date,sortKey:o.date||"",
    html:`<div class="ord-card">
      <div class="ord-card-top">
        <div class="ord-ico ord-ico-cart">🛒</div>
        <div class="ord-card-main">
          <div class="ord-card-title">${o.num?"Заявка "+o.num:"Заявка на услуги"}</div>
          <div class="ord-card-date">📅 ${o.date}</div>
        </div>
        ${statusBadge(o.status)}
      </div>
      <div class="ord-card-body">
        <div class="ord-card-sum">${o.sum} ₽</div>
        <div class="ord-card-detail">${o.items}</div>
      </div>
      <div class="ord-card-actions">
        ${o.itemsRaw?`<button class="ord-act" onclick="repeatOrder(${i})">🔁 Повторить</button>`:""}
        <button class="ord-act danger" data-clear-single-order="${i}" onclick="removeOneOrder(${i})">🗑 Удалить</button>
      </div>
    </div>`
  }));

  const bookingCards=bh.map((b,i)=>({
    type:"booking",idx:i,date:b.date,sortKey:b.date||"",
    html:`<div class="ord-card">
      <div class="ord-card-top">
        <div class="ord-ico ord-ico-cal">📅</div>
        <div class="ord-card-main">
          <div class="ord-card-title">Талон ${b.num}</div>
          <div class="ord-card-date">Оформлен ${b.date}</div>
        </div>
        <span class="st-badge st-new">Записан</span>
      </div>
      <div class="ord-card-body">
        <div class="ord-card-spec">👤 ${b.spec}</div>
        <div class="ord-card-detail">🕒 ${b.visitDate} в ${b.visitTime}${b.dept?"<br>📍 "+b.dept:""}</div>
      </div>
      <div class="ord-card-actions">
        <button class="ord-act" onclick="exportToCalendar(JSON.parse(localStorage.getItem('bookingsHistory'))[${i}])">📆 В календарь</button>
        <button class="ord-act danger" data-cancel-idx="${i}" onclick="cancelBooking(${i})">✕ Отменить</button>
      </div>
    </div>`
  }));

  const th=JSON.parse(localStorage.getItem("taxiHistory")||"[]");
  const taxiCards=th.map((tx,i)=>({
    type:"taxi",idx:i,date:tx.date,sortKey:(tx.createdAt||tx.date||""),
    html:`<div class="ord-card">
      <div class="ord-card-top">
        <div class="ord-ico ord-ico-taxi">🚕</div>
        <div class="ord-card-main">
          <div class="ord-card-title">Такси ${tx.num}</div>
          <div class="ord-card-date">📅 ${tx.date} в ${tx.time}</div>
        </div>
        <span class="st-badge st-new">Заказано</span>
      </div>
      <div class="ord-card-body">
        <div class="ord-card-sum">${tx.isFree?"Бесплатно 🎁":tx.price+" ₽"} <span class="ord-card-pax">· 👥 ${tx.pax||1}</span></div>
        ${tx.isFree?'<div class="taxi-ord-free-badge">Льготная поездка</div>':""}
        <div class="taxi-ord-route"><span class="taxi-ord-route-from">📍 ${tx.from}</span><span class="taxi-ord-route-to">🏁 ${tx.to}</span></div>
        ${tx.driverName?`<div class="ord-card-detail">🚗 Водитель: ${tx.driverName}</div>`:""}
      </div>
      <div class="ord-card-actions">
        <button class="ord-act danger" onclick="removeTaxiOrder(${i})">🗑 Удалить</button>
      </div>
    </div>`
  }));

  let all=[];
  if(filter==="all"||filter==="orders")all=all.concat(orderCards);
  if(filter==="all"||filter==="bookings")all=all.concat(bookingCards);
  if(filter==="all"||filter==="taxi")all=all.concat(taxiCards);
  all.sort((a,b)=>(b.sortKey||"").localeCompare(a.sortKey||""));

  if(!all.length){
    const emptyMsg=filter==="bookings"?t("orders_empty_bookings"):filter==="orders"?t("orders_empty_orders"):t("orders_empty_title");
    const emptySub=filter==="bookings"?(currentLang==="en"?"Book an appointment via the 'Book visit' section":"Запишитесь к специалисту через раздел «Записаться»"):filter==="orders"?(currentLang==="en"?"Add services from the price list and submit a request":"Добавьте услуги из прейскуранта и оформите заявку"):(currentLang==="en"?"Submit a service request or book an appointment":"Оформите заявку на услуги или запишитесь к специалисту");
    body.innerHTML=`<div class="ord-empty">${emptyIllustration()}<div class="ord-empty-title">${emptyMsg}</div><div class="ord-empty-sub">${emptySub}</div></div>`;
    return;
  }

  let html='<div class="ord-summary">';
  if(filter==="all")html+=`<div class="ord-sum-chip">🛒 ${oh.length} заявок</div><div class="ord-sum-chip">📅 ${bh.length} записей</div>`;
  html+='</div>';
  html+=all.map(c=>c.html).join("");
  if(oh.length&&(filter==="all"||filter==="orders"))html+='<button class="ord-clear-all" data-clear-orders onclick="clearAllOrders()">🗑 Очистить все заявки</button>';
  if(bh.length&&(filter==="all"||filter==="bookings"))html+='<button class="ord-clear-all" data-clear-all onclick="clearAllBookings()">🗑 Очистить все записи</button>';
  body.innerHTML=html;
}
function removeOneOrder(idx){
  const btn=document.querySelector('[data-clear-single-order="'+idx+'"]');
  if(btn&&!btn.dataset.confirm){
    btn.dataset.confirm="1";btn.textContent="⚠️ Точно удалить?";btn.classList.add("confirm");
    setTimeout(()=>{if(btn.dataset.confirm){delete btn.dataset.confirm;btn.textContent="🗑 Удалить";btn.classList.remove("confirm");}},4000);
    return;
  }
  const oh=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
  oh.splice(idx,1);
  localStorage.setItem("ordersHistory",JSON.stringify(oh));
  ordersHistory=oh;
  showToast("Заявка удалена");
  const activeF=document.querySelector(".of-btn.active");
  renderOrdersPanel(activeF?activeF.dataset.f:"all");
}
function removeTaxiOrder(idx){
  const th=JSON.parse(localStorage.getItem("taxiHistory")||"[]");
  th.splice(idx,1);
  localStorage.setItem("taxiHistory",JSON.stringify(th));
  showToast("Заказ такси удалён");
  const activeF=document.querySelector(".of-btn.active");
  renderOrdersPanel(activeF?activeF.dataset.f:"all");
}

function openProfilePanel(){
  const panel=document.getElementById("profilePanel");
  panel.classList.add("open");
  renderProfilePanel();
}
function closeProfilePanel(){
  document.getElementById("profilePanel").classList.remove("open");
}
function getProfilePhoto(){
  return localStorage.getItem("profilePhoto")||"";
}
function triggerPhotoUpload(){
  document.getElementById("photoInput").click();
}
function handlePhotoChange(e){
  const file=e.target.files&&e.target.files[0];
  if(!file)return;
  if(!file.type.startsWith("image/")){showToast("Выберите файл изображения");return;}
  if(file.size>5*1024*1024){showToast("Файл слишком большой (макс. 5 МБ)");return;}
  const reader=new FileReader();
  reader.onload=function(ev){
    const img=new Image();
    img.onload=function(){
      const canvas=document.createElement("canvas");
      const size=320;canvas.width=size;canvas.height=size;
      const ctx=canvas.getContext("2d");
      const scale=Math.max(size/img.width,size/img.height);
      const w=img.width*scale,h=img.height*scale;
      ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
      const dataUrl=canvas.toDataURL("image/jpeg",0.85);
      localStorage.setItem("profilePhoto",dataUrl);
      renderProfilePanel();
      showToast("📸 Фото обновлено");
    };
    img.src=ev.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value="";
}
function removePhoto(){
  localStorage.removeItem("profilePhoto");
  renderProfilePanel();
  showToast("Фото удалено");
}

function renderProfilePanel(){
  const fav=JSON.parse(localStorage.getItem("favorites")||"[]");
  const photo=getProfilePhoto();
  const initials=(clientName||"?").split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const oh=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
  const bh=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
  const th=JSON.parse(localStorage.getItem("taxiHistory")||"[]");
  let userProfile={};try{userProfile=JSON.parse(localStorage.getItem("userProfile")||"{}");}catch(e){}
  const anketaDone=!!(userProfile.category||userProfile.address||userProfile.birthDate);

  const body=document.getElementById("profBody");
  body.innerHTML=`
    <div class="prof-cover">
      <div class="prof-cover-bg"></div>
      <div class="prof-cover-content">
        <div class="prof-ava-wrap">
          <div class="prof-ava" onclick="triggerPhotoUpload()">
            ${photo?`<img src="${photo}" alt="Фото профиля">`:`<span class="prof-ava-init">${initials}</span>`}
          </div>
          ${photo?'<button class="prof-ava-remove" onclick="event.stopPropagation();removePhoto()" aria-label="Удалить фото">✕</button>':""}
        </div>
        <div class="prof-name">${clientName}</div>
        <span class="prof-name-accent"></span>
        <div class="prof-phone">${clientPhone} · ${cityPrefixed(currentCityName)}</div>
      </div>
      <img src="img/bot-live.webp" class="prof-cover-bot" alt="">
    </div>

    <div class="prof-stat-chips">
      <button class="prof-chip" onclick="closeProfilePanel();openOrdersPanel();"><b>${oh.length}</b><span>Заявки</span></button>
      <button class="prof-chip" onclick="closeProfilePanel();pushNav(showMainMenu);showTyping(showBooking);"><b>${bh.length}</b><span>Записи</span></button>
      <button class="prof-chip" onclick="showProfileSection('taxi')"><b>${th.length}</b><span>Такси</span></button>
      <button class="prof-chip" onclick="showProfileSection('favorites')"><b>${fav.length}</b><span>Избранное</span></button>
    </div>

    ${!anketaDone?`<button class="prof-nudge" onclick="editQuestionnaire()"><span class="prof-nudge-ico">📋</span><span class="prof-nudge-txt"><b>Заполните анкету получателя</b><span>Данные сами подставятся в заявки и такси</span></span><span class="prof-nudge-arr">→</span></button>`:""}

    <div class="prof-nav-list">
      <button class="prof-nav-row" onclick="closeProfilePanel();pushNav(showMainMenu);showTyping(showServices);">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#10b981,#059669)">🛍️</span>
        <span class="prof-nav-txt"><b>Записаться на услуги</b><span>Все услуги центра</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
      <button class="prof-nav-row" onclick="showProfileSection('personal')">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#1B8585,#2A9D9D)">🧑‍💼</span>
        <span class="prof-nav-txt"><b>Личные данные и анкета</b><span>${anketaDone?"Заполнена":"Не заполнена"}</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
      <button class="prof-nav-row" onclick="showProfileSection('documents')">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📁</span>
        <span class="prof-nav-txt"><b>Документы</b><span>Заявления, согласия, памятки</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
      <button class="prof-nav-row" onclick="openProfileSwitcher()">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#0F6060,#1B8585)">👨‍👩‍👦</span>
        <span class="prof-nav-txt"><b>Профили</b><span>Переключение между пользователями</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
      <button class="prof-nav-row" onclick="showCartStats()">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#2A9D9D,#166565)">📊</span>
        <span class="prof-nav-txt"><b>Статистика</b><span>Ваша активность в приложении</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
      <button class="prof-nav-row" onclick="closeProfilePanel();pushNav(showMainMenu);showTyping(showFeedback);">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#B07A00,#D4920A)">💬</span>
        <span class="prof-nav-txt"><b>Оставить отзыв</b><span>Оценка работы центра</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
      <button class="prof-nav-row" onclick="showProfileSection('settings')">
        <span class="prof-nav-ico" style="background:linear-gradient(135deg,#3d6b6b,#2d5252)">⚙️</span>
        <span class="prof-nav-txt"><b>Настройки</b><span>Тема, шрифт, данные</span></span>
        <span class="prof-nav-arr">›</span>
      </button>
    </div>

    <button class="prof-logout-row" onclick="doLogout(this)">🚪 Выйти / Сменить пользователя</button>
  `;
}

function showProfileSection(section){
  const body=document.getElementById("profBody");
  const back=`<button class="prof-back-row" onclick="renderProfilePanel()">← Личный кабинет</button>`;

  if(section==="favorites"){
    const fav=JSON.parse(localStorage.getItem("favorites")||"[]");
    const favHtml=fav.length===0
      ?'<div class="hist-empty">'+emptyIllustration()+'<div class="empty-title">Нет избранных</div><div class="empty-sub">Нажмите ★ у любой услуги в прейскуранте</div></div>'
      :fav.map(f=>`<div class="pcard-item"><div class="pcard-item-txt"><b>${f.n}</b><span>${(hasMoroshka&&f.m!=null?f.m:f.p).toLocaleString()} ₽</span></div><button class="pcard-item-act" onclick="addFavToCart('${f.id}')">🛒</button></div>`).join("");
    body.innerHTML=back+`<h2 class="prof-sec-title">⭐ Избранное</h2><div class="pcard">${favHtml}</div>`;
    return;
  }

  if(section==="taxi"){
    const th=JSON.parse(localStorage.getItem("taxiHistory")||"[]");
    const taxiHtml=th.length===0
      ?'<div class="hist-empty">'+emptyIllustration()+'<div class="empty-title">Пока нет заказов такси</div><div class="empty-sub">Закажите поездку в разделе «Такси»</div></div>'
      :th.map(tx=>`<div class="pcard-item"><div class="pcard-item-txt"><b>${tx.isFree?"Бесплатно 🎁":tx.price+" ₽"} · ${tx.date} ${tx.time}</b><span>${tx.from} → ${tx.to}</span></div></div>`).join("");
    body.innerHTML=back+`<h2 class="prof-sec-title">🚕 Мои поездки</h2><div class="pcard">${taxiHtml}</div>`;
    return;
  }

  if(section==="documents"){
    const docsHtml=`<div class="pcard-doclist">
      <button class="pcard-doc" onclick="downloadDoc('application')"><span class="pcard-doc-ico" style="background:linear-gradient(135deg,#1B8585,#2A9D9D)">📄</span><span class="pcard-doc-txt"><b>Заявление на обслуживание</b><span>Заявление на получение социальных услуг</span></span><span class="pcard-doc-dl">⬇</span></button>
      <button class="pcard-doc" onclick="downloadDoc('consent')"><span class="pcard-doc-ico" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🔒</span><span class="pcard-doc-txt"><b>Согласие на обработку данных</b><span>Персональные данные (ФЗ-152)</span></span><span class="pcard-doc-dl">⬇</span></button>
      <button class="pcard-doc" onclick="downloadDoc('moroshka')"><span class="pcard-doc-ico" style="background:linear-gradient(135deg,#10b981,#059669)"><img src="img/moroshka-logo.jpg" class="pcard-doc-img" alt=""></span><span class="pcard-doc-txt"><b>Памятка «Морошка»</b><span>Как оформить и использовать карту</span></span><span class="pcard-doc-dl">⬇</span></button>
      <button class="pcard-doc" onclick="downloadDoc('rights')"><span class="pcard-doc-ico" style="background:linear-gradient(135deg,#2A9D9D,#166565)">📋</span><span class="pcard-doc-txt"><b>Права получателя услуг</b><span>Перечень прав получателя соц. услуг</span></span><span class="pcard-doc-dl">⬇</span></button>
      <button class="pcard-doc" onclick="downloadDoc('complaint')"><span class="pcard-doc-ico" style="background:linear-gradient(135deg,#0F6060,#1B8585)">📝</span><span class="pcard-doc-txt"><b>Бланк жалобы / предложения</b><span>Обращение в администрацию центра</span></span><span class="pcard-doc-dl">⬇</span></button>
    </div>`;
    body.innerHTML=back+`<h2 class="prof-sec-title">📁 Документы</h2><div class="pcard">${docsHtml}</div>`;
    return;
  }

  if(section==="personal"){
    let userProfile={};try{userProfile=JSON.parse(localStorage.getItem("userProfile")||"{}");}catch(e){}
    const catLabels={pensioner:"Пенсионер",disabled:"Инвалид",family:"Семья с детьми",large_family:"Многодетная семья",veteran:"Ветеран",other:"Другое"};
    const anketaBody=(userProfile.category||userProfile.address||userProfile.birthDate)?`
        ${userProfile.category?`<div class="pinfo-row"><span class="pinfo-ico">🏷️</span><span class="pinfo-txt"><span class="pinfo-lbl">Категория</span><span class="pinfo-val">${catLabels[userProfile.category]||userProfile.category}</span></span></div>`:""}
        ${userProfile.birthDate?`<div class="pinfo-row"><span class="pinfo-ico">🎂</span><span class="pinfo-txt"><span class="pinfo-lbl">Дата рождения</span><span class="pinfo-val">${userProfile.birthDate}</span></span></div>`:""}
        ${userProfile.address?`<div class="pinfo-row"><span class="pinfo-ico">🏠</span><span class="pinfo-txt"><span class="pinfo-lbl">Адрес</span><span class="pinfo-val">${userProfile.address}</span></span></div>`:""}
        ${userProfile.contactName?`<div class="pinfo-row"><span class="pinfo-ico">👤</span><span class="pinfo-txt"><span class="pinfo-lbl">Контактное лицо</span><span class="pinfo-val">${userProfile.contactName}${userProfile.contactPhone?" · "+userProfile.contactPhone:""}</span></span></div>`:""}`
      :`<button class="pinfo-fill-btn" onclick="editQuestionnaire()">📋 Заполнить анкету получателя <span class="pinfo-fill-arr">→</span></button>`;
    body.innerHTML=back+`<h2 class="prof-sec-title">🧑‍💼 Личные данные</h2>
      <div class="pcard">
        <div class="pcard-hdr">Основные данные <button class="pcard-hdr-edit" onclick="editMyData()">✏️ Изменить</button></div>
        ${clientSnils&&clientSnils!=="—"&&clientSnils!==""?`<div class="pinfo-row"><span class="pinfo-ico">🪪</span><span class="pinfo-txt"><span class="pinfo-lbl">СНИЛС</span><span class="pinfo-val">${clientSnils}</span></span></div>`:""}
        <div class="pinfo-row"><span class="pinfo-ico">${hasMoroshka?'<img src="img/moroshka-logo.jpg" class="pinfo-moroshka-ico" alt="">':'🍊'}</span><span class="pinfo-txt"><span class="pinfo-lbl">Карта Морошка</span><span class="pinfo-val">${hasMoroshka?"Активна":"Не активна"}</span></span></div>
      </div>
      <div class="pcard">
        <div class="pcard-hdr">Анкета получателя <button class="pcard-hdr-edit" onclick="editQuestionnaire()">✏️ Изменить</button></div>
        ${anketaBody}
      </div>`;
    return;
  }

  if(section==="settings"){
    body.innerHTML=back+`<h2 class="prof-sec-title">⚙️ Настройки</h2>
      <div class="pcard">
        <div class="pcard-hdr">Внешний вид</div>
        <div class="pset-row"><span class="pset-lbl">🔤 Размер шрифта</span><div class="pset-btns"><button class="pset-btn" onclick="changeFontSize(-1)">А−</button><button class="pset-btn" onclick="changeFontSize(1)">А+</button></div></div>
        <div class="pset-row"><span class="pset-lbl">🌙 Тёмная тема</span><button class="pswitch ${darkMode?"on":""}" onclick="toggleDarkTheme();this.classList.toggle('on')" role="switch" aria-checked="${darkMode}"><span class="pswitch-knob"></span></button></div>
      </div>
      <div class="pcard">
        <div class="pcard-hdr">Мои данные</div>
        <div class="pset-row"><span class="pset-lbl">⬇️ Экспорт моих данных</span><button class="pset-btn wide" onclick="exportMyData()">Скачать</button></div>
        <div class="pset-row"><span class="pset-lbl">🗑 Очистить все данные</span><button class="pset-btn wide danger" onclick="if(confirm('Удалить все данные?')){localStorage.clear();location.reload();}">Сброс</button></div>
      </div>`;
    return;
  }
}
function exportMyData(){
  const oh=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
  const bh=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
  const fav=JSON.parse(localStorage.getItem("favorites")||"[]");
  let userProfile={};try{userProfile=JSON.parse(localStorage.getItem("userProfile")||"{}");}catch(e){}
  const lines=[];
  lines.push("МОИ ДАННЫЕ — ГБУ ЯНАО «ЦСОН «Гармония»");
  lines.push("Дата экспорта: "+new Date().toLocaleString("ru-RU"));
  lines.push("");
  lines.push("ФИО: "+clientName);
  lines.push("Телефон: "+clientPhone);
  if(clientSnils&&clientSnils!=="—")lines.push("СНИЛС: "+clientSnils);
  lines.push("Филиал: г. "+currentCityName);
  if(userProfile.category)lines.push("Категория: "+userProfile.category);
  if(userProfile.birthDate)lines.push("Дата рождения: "+userProfile.birthDate);
  if(userProfile.address)lines.push("Адрес: "+userProfile.address);
  lines.push("");
  lines.push("=== ЗАЯВКИ ("+oh.length+") ===");
  oh.forEach(o=>{lines.push((o.num||"Заявка")+" от "+o.date+" — "+o.sum+" ₽ — "+o.status);});
  lines.push("");
  lines.push("=== ЗАПИСИ ("+bh.length+") ===");
  bh.forEach(b=>{lines.push("Талон "+b.num+" — "+b.visitDate+" "+b.visitTime+" — "+b.spec);});
  lines.push("");
  lines.push("=== ИЗБРАННОЕ ("+fav.length+") ===");
  fav.forEach(f=>{lines.push(f.n+" — "+f.p+" ₽");});
  const blob=new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download="my_data_garmoniya.txt";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  showToast("⬇️ Данные экспортированы");
}

function switchTab(which,btn){
  document.querySelectorAll(".h-tab").forEach(t=>{t.classList.remove("active");t.setAttribute("aria-selected","false");});
  btn.classList.add("active");btn.setAttribute("aria-selected","true");
  ["orders","bookings","fav","docs","settings"].forEach(k=>{
    const el=document.getElementById("hist-"+k);if(el)el.style.display=k===which?"":"none";
  });
}

function editMyData(){
  var ovl=document.createElement("div");ovl.className="mo";
  ovl.onclick=function(e){if(e.target===ovl)ovl.remove();};
  ovl.innerHTML='<div class="mc" style="max-width:360px"><h3>✏️ Редактировать данные</h3>'+
    '<label class="admin-lbl">ФИО</label><input class="admin-inp" id="edName" value="'+(clientName||"").replace(/"/g,"&quot;")+'" placeholder="Фамилия Имя Отчество">'+
    '<label class="admin-lbl">Телефон</label><input class="admin-inp" id="edPhone" value="'+(clientPhone||"").replace(/"/g,"&quot;")+'" placeholder="+7..." inputmode="tel">'+
    '<label class="admin-lbl">СНИЛС</label><input class="admin-inp" id="edSnils" value="'+(clientSnils||"").replace(/"/g,"&quot;")+'" placeholder="000-000-000 00" inputmode="numeric">'+
    '<button class="admin-btn" onclick="saveMyData()">💾 Сохранить</button>'+
    '<button class="rating-skip" onclick="this.closest(\'.mo\').remove()">Отмена</button></div>';
  document.body.appendChild(ovl);
  ovl.querySelector("#edName").focus();
}
function saveMyData(){
  var n=document.getElementById("edName"),ph=document.getElementById("edPhone"),s=document.getElementById("edSnils");
  if(n)clientName=n.value.trim();
  if(ph)clientPhone=ph.value.trim();
  if(s)clientSnils=s.value.trim();
  localStorage.setItem("clientName",clientName);
  localStorage.setItem("clientPhone",clientPhone);
  localStorage.setItem("clientSnils",clientSnils);
  showToast("💾 Данные обновлены");
  document.querySelectorAll(".mo").forEach(function(m){m.remove();});
  renderProfilePanel();
}

function downloadDoc(type){
  const templates={
    application:`ЗАЯВЛЕНИЕ\nна предоставление социальных услуг\n\nВ ГБУ ЯНАО «ЦСОН Гармония»\nг. ${currentCityName}\n\nот ___________________________________\n(фамилия, имя, отчество)\n\nДата рождения: __.__.____\nАдрес: ___________________________________\nТелефон: ___________________________________\nСНИЛС: ___________________________________\n\nПрошу предоставить мне следующие социальные услуги:\n___________________________________\n___________________________________\n___________________________________\n\nС порядком и условиями предоставления услуг ознакомлен(а).\n\nДата: __.__.____\nПодпись: ___________`,
    consent:`СОГЛАСИЕ\nна обработку персональных данных\n\nЯ, ___________________________________,\nдата рождения __.__.____,\nадрес ___________________________________,\nдокумент ___________________________________,\n\nдаю согласие ГБУ ЯНАО «ЦСОН Гармония» на обработку\nмоих персональных данных: ФИО, дата рождения, адрес,\nтелефон, СНИЛС, данные о состоянии здоровья, сведения\nо доходах — в целях предоставления социальных услуг.\n\nСогласие действует до момента письменного отзыва.\n\nДата: __.__.____\nПодпись: ___________`,
    moroshka:`ПАМЯТКА\nКарта «Морошка» — единая карта жителя ЯНАО\n\n1. Что это? Электронная карта, подтверждающая проживание в ЯНАО.\n\n2. Как оформить?\n   - В МФЦ (с паспортом и СНИЛС)\n   - На сайте государственных услуг ЯНАО\n\n3. Что даёт в центре «Гармония»?\n   - Скидка 5% на все платные услуги\n   - Скидка применяется автоматически при предъявлении карты\n\n4. Как активировать?\n   Покажите карту специалисту центра или укажите при входе\n   в онлайн-помощник (тумблер «🍊 Морошка» в шапке).`,
    rights:`ПРАВА ПОЛУЧАТЕЛЯ СОЦИАЛЬНЫХ УСЛУГ\n(извлечение из ФЗ №442)\n\n1. Уважительное и гуманное отношение.\n2. Выбор поставщика социальных услуг.\n3. Информация о своих правах и обязанностях.\n4. Информация о видах, сроках и условиях предоставления услуг.\n5. Отказ от предоставления социальных услуг.\n6. Обеспечение условий пребывания, соответствующих санитарно-гигиеническим требованиям.\n7. Свободное посещение законными представителями, адвокатами, нотариусами.\n8. Защита своих прав и законных интересов.\n9. Социальное сопровождение.\n\nПо вопросам — обращайтесь к специалисту центра.`,
    complaint:`ОБРАЩЕНИЕ\nв ГБУ ЯНАО «ЦСОН Гармония»\nг. ${currentCityName}\n\nот ___________________________________\n(фамилия, имя, отчество)\nТелефон: ___________________________________\n\nТип обращения: [ ] Жалоба  [ ] Предложение  [ ] Благодарность\n\nСодержание обращения:\n___________________________________\n___________________________________\n___________________________________\n___________________________________\n___________________________________\n\nДата: __.__.____\nПодпись: ___________`
  };
  const text=templates[type];if(!text)return;
  const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);
  a.download=type+".txt";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  showToast("📄 Документ скачан");
}

function doLogout(btn){

    localStorage.clear();

    clientName = "";
    clientPhone = "";
    clientSnils = "";
    hasMoroshka = null;

    cart = [];
    ordersHistory = [];
    bookingsHistory = [];

    location.reload();
}

function showAuth(){
  document.querySelectorAll(".auth-ovl").forEach(el=>el.remove());
  const n=localStorage.getItem("clientName"),ph=localStorage.getItem("clientPhone");
  if(n&&ph){
    clientName=n;clientPhone=ph;clientSnils=localStorage.getItem("clientSnils")||"";
    ordersHistory=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
    bookingsHistory=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
    const savedCity=localStorage.getItem("currentCity");
    if(savedCity&&branchContent[savedCity])selectCity(savedCity,true);
    showWelcome();return;
  }
  const modal=document.createElement("div");modal.className="auth-ovl";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-label","Вход в систему");
  modal.innerHTML=`<div class="auth-card">
    <div class="auth-logo-wrap">
      <img src="data:image/png;base64,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" alt="Логотип центра Гармония">
    </div>
    <div class="org-name">ГБУ ЯНАО ЦСОН «Гармония»</div>
    <h1 class="auth-h">Добро пожаловать!</h1>
    <p class="auth-sub">Укажите ваши данные, чтобы пользоваться помощником и оформлять заявки на услуги</p>
    <label for="aName" style="position:absolute;opacity:0;pointer-events:none">ФИО</label>
    <input type="text" id="aName" class="auth-inp" placeholder="Фамилия Имя Отчество" autocomplete="name" aria-label="Фамилия Имя Отчество" aria-required="true">
    <label for="aPhone" style="position:absolute;opacity:0;pointer-events:none">Телефон</label>
    <input type="tel" id="aPhone" class="auth-inp" placeholder="+7 (___) ___-__-__" autocomplete="tel" aria-label="Номер телефона" aria-required="true">
    <label for="aCity" style="position:absolute;opacity:0;pointer-events:none">Филиал</label>
    <select id="aCity" class="auth-inp auth-city-sel" aria-label="Ваш филиал">
      <option value="gubkin">🏢 г. Губкинский</option>
      <option value="purpe">🏢 мкр. Пурпе</option>
      <option value="muravlenko">🏢 г. Муравленко</option>
      <option value="noyabrsk">🏢 г. Ноябрьск</option>
      <option value="tarko">🏢 г. Тарко-Сале</option>
      <option value="urengoy">🏢 пгт. Уренгой</option>
    </select>
    <div class="cb-row">
      <input type="checkbox" id="aCb" aria-required="true">
      <label for="aCb">Даю согласие на обработку персональных данных (ФЗ-152) — <a href="https://dszn.yanao.ru/documents/active/45015/" target="_blank" rel="noopener" onclick="event.stopPropagation()">политика обработки</a></label>
    </div>
    <button class="auth-btn" id="aBtn" disabled aria-label="Войти в систему">Войти →</button>
    <button class="auth-esia" type="button" onclick="esiaLogin()" aria-label="Войти через Госуслуги">
      <img src="img/gosuslugi.jpg" alt="Госуслуги" class="esia-logo"> Войти через Госуслуги
    </button>
    <button class="auth-skip" onclick="skipAuth(this)">Войти как Гость</button>
  </div>`;
  document.body.appendChild(modal);
  const ni=modal.querySelector("#aName"),pi=modal.querySelector("#aPhone"),cb=modal.querySelector("#aCb"),btn=modal.querySelector("#aBtn"),ci=modal.querySelector("#aCity");
  const v=()=>{btn.disabled=!(ni.value.trim().length>3&&pi.value.replace(/\D/g,"").length>=11&&cb.checked);};
  pi.oninput=e=>{let m="+7 (___) ___-__-__",i=0,d=m.replace(/\D/g,""),v2=e.target.value.replace(/\D/g,"");if(d.length>=v2.length)v2=d;e.target.value=m.replace(/./g,a=>/[_\d]/.test(a)&&i<v2.length?v2.charAt(i++):i>=v2.length?"":a);v();};
  ni.oninput=v;cb.onchange=v;
  btn.onclick=()=>{
    clientName=ni.value.trim();clientPhone=pi.value.trim();clientSnils="";
    localStorage.setItem("clientName",clientName);localStorage.setItem("clientPhone",clientPhone);
    const chosenCity=ci.value;
    if(branchContent[chosenCity])selectCity(chosenCity,true);
    modal.remove();showWelcome();
  };
  ni.addEventListener("keydown",e=>{if(e.key==="Enter")pi.focus();});
  pi.addEventListener("keydown",e=>{if(e.key==="Enter")btn.click();});
}
function skipAuth(el){
  clientName="Гость";clientPhone="—";clientSnils="";
  el.closest(".auth-ovl").remove();showWelcome();
}

function showWelcome(){
  clearActions();navHistory=[];setNav(false);
  const saved=localStorage.getItem("hasMoroshka");
  if(saved!==null){hasMoroshka=saved==="true";updateMToggle();showMainMenu();return;}
  updateMToggle();
  addMsg(`${greeting()}, <b>${clientName}</b>! Я чат-бот ГБУ ЯНАО «ЦСОН Гармония».`,true);
  setTimeout(()=>{
    addMsg(`У вас есть <b>Единая карта жителя Ямала «Морошка»</b>?<br><span class="note">Карта даёт скидку на социальные услуги центра.</span>`,true);
    setTimeout(()=>{
      clearActions();
      const g=document.createElement("div");g.className="m-grid";
      const yes=document.createElement("button");yes.type="button";yes.className="m-card yes";yes.setAttribute("aria-label","Да, у меня есть карта Морошка");
      yes.innerHTML='<img src="img/moroshka-logo.jpg" class="moroshka-ico-md" alt=""><span>Да, есть карта</span>';
      yes.onclick=()=>{hasMoroshka=true;localStorage.setItem("hasMoroshka","true");updateMToggle();addMsg('<img src="img/moroshka-logo.jpg" class="moroshka-ico-sm" alt=""> Льготные цены активированы!',true);showToast("🍊 Морошка активирована!");setTimeout(showMainMenu,400);};
      const no=document.createElement("button");no.type="button";no.className="m-card no";no.setAttribute("aria-label","Нет, карты нет");
      no.innerHTML='<img src="img/no-moroshka.jpg" class="moroshka-ico-md" alt=""><span>Нет карты</span>';
      no.onclick=()=>{hasMoroshka=false;localStorage.setItem("hasMoroshka","false");updateMToggle();addMsg("Принято. Базовые цены.",true);setTimeout(showMainMenu,400);};
      g.appendChild(yes);g.appendChild(no);actionsEl.appendChild(g);
    },500);
  },500);
}

updateBadge();
updateHoursBanner();
setInterval(updateHoursBanner,60000);
initSearch();
showAuth();
setTimeout(()=>{
  const activeTab=document.querySelector(".tb.active");
  if(activeTab)movePillTo(activeTab);
},400);



(function(){
  let tapCount=0,tapTimer=null,ignoreClickUntil=0;
  let pressTimer=null,longPressFired=false;
  const logo=document.querySelector(".hdr-logo");
  if(!logo)return;
  function registerTap(){
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer=setTimeout(()=>{tapCount=0;},1800);
    if(tapCount>=5){tapCount=0;openAdmin();}
  }
  logo.addEventListener("touchstart",function(){
    longPressFired=false;
    pressTimer=setTimeout(function(){
      longPressFired=true;
      tapCount=0;
      openAdmin();
    },2000);
  },{passive:true});
  logo.addEventListener("touchend",function(e){
    clearTimeout(pressTimer);
    if(longPressFired){ignoreClickUntil=Date.now()+500;return;}
    e.preventDefault();
    ignoreClickUntil=Date.now()+400; // подавляем «призрачный» click, который браузер шлёт после touchend
    registerTap();
  },{passive:false});
  logo.addEventListener("touchcancel",function(){clearTimeout(pressTimer);},{passive:true});
  logo.addEventListener("click",function(){
    if(Date.now()<ignoreClickUntil)return;
    registerTap();
  });
})();

function movePillTo(btn){
  const pill=document.getElementById("tbPill");
  if(!pill||!btn)return;
  const bar=document.getElementById("tabBar");
  const barRect=bar.getBoundingClientRect();
  const btnRect=btn.getBoundingClientRect();
  pill.style.width=btnRect.width+"px";
  pill.style.transform="translate3d("+(btnRect.left-barRect.left)+"px,0,0)";
}
function tabGo(t){
  document.querySelectorAll(".tb").forEach(function(b){b.classList.remove("active");});
  event.currentTarget.classList.add("active");
  movePillTo(event.currentTarget);
  if(t==="home")showMainMenu();
  else if(t==="menu")showMenuPage();
  else if(t==="cart")openCart();
  else if(t==="orders")openOrdersPanel();
  else if(t==="profile")openProfilePanel();
}
window.addEventListener("resize",()=>{
  const active=document.querySelector(".tb.active");
  if(active)movePillTo(active);
});
function showMenuPage(){
  clearActions();chatEl.innerHTML="";setNav(false);
  var w=document.createElement("div");w.className="svc-page";
  w.innerHTML=
    '<h2>Все разделы</h2>'+
    '<div class="sp-item" data-a="services"><span class="sp-ico" style="background:linear-gradient(135deg,#1B8585,#0d6b6b)">📋</span><div class="sp-txt"><b>Записаться на услуги</b><span>Услуги и цены</span></div><span class="sp-arr">›</span></div>'+
    '<div class="sp-item sp-item-taxi" data-a="taxi"><span class="sp-ico sp-ico-taxi" style="background:linear-gradient(135deg,#22c55e,#16a34a)">🚕</span><div class="sp-txt"><b>Такси</b><span>Заказать поездку</span></div><span class="sp-taxi-badge">Новое</span><span class="sp-arr">›</span></div>'+
    '<div class="sp-item" data-a="assistant"><span class="sp-ico sp-ico-photo"><img src="img/bot-tablet.jpg" alt="" class="sp-bot-img"></span><div class="sp-txt"><b>Чат-бот</b><span>Задать вопрос</span></div><span class="sp-arr">›</span></div>'+
    '<div class="sp-more">Услуги и информация</div>'+
    '<div class="sp-grid">'+
    '<div class="sp-g" data-a="booking"><span class="sp-g-i" style="background:linear-gradient(135deg,#f59e0b,#d97706)">📅</span><b>Записаться</b></div>'+
    '<div class="sp-g" data-a="staff"><span class="sp-g-i" style="background:linear-gradient(135deg,#10b981,#059669)">👥</span><b>Сотрудники</b></div>'+
    '<div class="sp-g" data-a="callback"><span class="sp-g-i" style="background:linear-gradient(135deg,#1B8585,#14b8a6)">📞</span><b>Обратная связь</b></div>'+
    '<div class="sp-g" data-a="events"><span class="sp-g-i" style="background:linear-gradient(135deg,#f59e0b,#d97706)">🎟️</span><b>События</b></div>'+
    '<div class="sp-g" data-a="news"><span class="sp-g-i" style="background:linear-gradient(135deg,#D4920A,#E8A020)">📰</span><b>Новости</b></div>'+
    '<div class="sp-g" data-a="contacts"><span class="sp-g-i" style="background:linear-gradient(135deg,#B07A00,#D4920A)">📍</span><b>Контакты</b></div>'+
    '<div class="sp-g" data-a="moroshka"><span class="sp-g-i" style="background:linear-gradient(135deg,#f59e0b,#d97706)"><img src="img/moroshka-logo.jpg" style="width:22px;height:22px;object-fit:contain"></span><b>Морошка</b></div>'+
    '<div class="sp-g" data-a="vk"><span class="sp-g-i sp-g-i-vk"><img src="img/vk-icon.png" style="width:24px;height:24px;border-radius:6px;object-fit:contain"></span><b>Группа ВК</b></div>'+
    '<div class="sp-g" data-a="gallery"><span class="sp-g-i" style="background:linear-gradient(135deg,#166565,#0F6060)">🖼️</span><b>Фотогалерея</b></div>'+
    '<div class="sp-g" data-a="feedback"><span class="sp-g-i" style="background:linear-gradient(135deg,#10b981,#059669)">⭐</span><b>Отзыв</b></div>'+
    '</div>';
  chatEl.appendChild(w);
  var acts={services:showServices,booking:showBooking,taxi:showTaxi,staff:showStaff,callback:showCallback,events:showEvents,news:showNews,contacts:showContacts,moroshka:showMoroshkaInfo,feedback:showFeedback,gallery:showGallery};
  w.querySelectorAll("[data-a]").forEach(function(el){
    var a=el.dataset.a;
    if(a==="assistant"){el.onclick=function(){openAssistantFullscreen();};}
    else if(a==="vk"){
      el.onclick=function(){window.open(VK_GROUP.url,"_blank","noopener");};
    }
    else if(acts[a])el.onclick=function(){pushNav(showMenuPage);showTyping(acts[a]);};
  });
}

function selectCity(cityKey,silent){
  if(!branchContent[cityKey])return;
  const wasSame=currentCity===cityKey;
  currentCity=cityKey;
  currentCityName=BRANCH_DISPLAY_NAMES[cityKey]||cityKey;
  localStorage.setItem("currentCity",currentCity);localStorage.setItem("currentCityName",currentCityName);
  servicesData=branchContent[currentCity].services;
  staffData=branchContent[currentCity].staff;
  const sel=document.getElementById("citySel");if(sel)sel.value=cityKey;
  const cd=document.getElementById("cityDisplay");if(cd)cd.textContent=cityPrefixed(currentCityName);
  updateHoursBanner();
  if(!silent&&!wasSame){
    navHistory=[];currentCatId=null;currentSvcList=null;
    document.getElementById("searchBar").classList.add("gone");
    addMsg(`📍 Переключено на: <b>${cityPrefixed(currentCityName)}</b>`,true);
    showMainMenu();
  }
}


// ═══════════════════════════════════════════════════════════════
// ЖИВОЙ ИНТЕРАКТИВНЫЙ МАСКОТ
// Робот слегка тянется за пальцем/курсором (3D-наклон) и реагирует
// на тап всплеском сердечек и короткой фразой. Чистый CSS/JS,
// без картинок-видео — работает поверх обычных <img> гифок.
// ═══════════════════════════════════════════════════════════════
(function(){
  var reduceMotion=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var PHRASES=["Привет! 👋","Чем помочь?","Я тут 💚","Задайте вопрос!","Рад видеть!","Слушаю вас"];
  var wired=new WeakSet();

  function wrapEl(mascotImg){
    // Поднимаемся до контейнера, который можно безопасно трансформировать
    return mascotImg.closest(".ga-bot-wrap,.asst-live,.onb-bot-live")||mascotImg.parentElement;
  }

  function attachTilt(container,mascotImg){
    if(reduceMotion)return;
    var raf=null,tx=0,ty=0;
    function apply(){
      mascotImg.style.transform="rotateX("+ty+"deg) rotateY("+tx+"deg)";
      raf=null;
    }
    function onMove(clientX,clientY){
      var r=container.getBoundingClientRect();
      if(!r.width||!r.height)return;
      var cx=r.left+r.width/2, cy=r.top+r.height/2;
      var dx=(clientX-cx)/(r.width/2), dy=(clientY-cy)/(r.height/2);
      dx=Math.max(-1,Math.min(1,dx)); dy=Math.max(-1,Math.min(1,dy));
      tx=dx*10; ty=-dy*10; // максимум ~10° наклона
      if(!raf)raf=requestAnimationFrame(apply);
    }
    function onLeave(){
      tx=0;ty=0;
      if(!raf)raf=requestAnimationFrame(apply);
    }
    container.style.perspective="400px";
    mascotImg.style.transition="transform .18s ease-out";
    mascotImg.style.willChange="transform";
    container.addEventListener("pointermove",function(e){onMove(e.clientX,e.clientY);});
    container.addEventListener("pointerleave",onLeave);
    // Плавный «взгляд» за пальцем и на мобильных, без блокировки скролла страницы
    container.addEventListener("touchmove",function(e){
      if(e.touches&&e.touches[0])onMove(e.touches[0].clientX,e.touches[0].clientY);
    },{passive:true});
    container.addEventListener("touchend",onLeave,{passive:true});
  }

  function burstHearts(container){
    var n=reduceMotion?0:4;
    for(var i=0;i<n;i++){
      var p=document.createElement("span");
      p.className="mascot-particle";
      p.textContent=(i%2===0)?"💚":"✨";
      var angle=(Math.random()*140-70)*Math.PI/180;
      var dist=34+Math.random()*22;
      p.style.setProperty("--mpx",(Math.sin(angle)*dist)+"px");
      p.style.setProperty("--mpy",(-Math.cos(angle)*dist-10)+"px");
      p.style.left="50%";p.style.top="38%";
      p.style.animationDelay=(i*45)+"ms";
      container.appendChild(p);
      setTimeout(function(el){el.remove();},900+i*45,p);
    }
  }

  function showBubble(container){
    if(container.querySelector(".mascot-bubble"))return;
    var b=document.createElement("div");
    b.className="mascot-bubble";
    b.textContent=PHRASES[Math.floor(Math.random()*PHRASES.length)];
    container.appendChild(b);
    requestAnimationFrame(function(){b.classList.add("show");});
    setTimeout(function(){b.classList.remove("show");setTimeout(function(){b.remove();},220);},1500);
  }

  function attachTap(container,mascotImg){
    container.style.cursor="pointer";
    container.addEventListener("pointerdown",function(e){
      mascotImg.classList.remove("mascot-poke");
      void mascotImg.offsetWidth; // рестарт CSS-анимации
      mascotImg.classList.add("mascot-poke");
      burstHearts(container);
      showBubble(container);
    });
  }

  function initOne(img){
    if(wired.has(img))return;
    wired.add(img);
    var container=wrapEl(img);
    if(!container)return;
    container.classList.add("mascot-interactive");
    attachTilt(container,img);
    attachTap(container,img);
  }

  function scan(root){
    (root||document).querySelectorAll(".ga-bot-img,.asst-live img,.onb-bot-live img").forEach(initOne);
  }

  var mo=new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes&&m.addedNodes.forEach(function(node){
        if(node.nodeType===1)scan(node);
      });
    });
  });
  document.addEventListener("DOMContentLoaded",function(){
    scan(document);
    if(document.body)mo.observe(document.body,{childList:true,subtree:true});
  });
  if(document.readyState!=="loading"){
    scan(document);
    if(document.body)mo.observe(document.body,{childList:true,subtree:true});
  }
})();
