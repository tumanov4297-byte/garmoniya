
let currentCity="gubkin",currentCityName="Губкинский",hasMoroshka=null;
let navHistory=[],cart=JSON.parse(localStorage.getItem("cart")||"[]");
let clientName="",clientPhone="",clientSnils="",ordersHistory=[],bookingsHistory=[];
let currentCatId=null,currentSvcList=null;
let fbRating=0,fbTags=[];
let serviceRatings=JSON.parse(localStorage.getItem("serviceRatings")||"{}");
const chatEl=document.getElementById("chat"),actionsEl=document.getElementById("actions");
const badgeEl=document.getElementById("cartBadge");
let ticketCounter=parseInt(localStorage.getItem("ticketCounter")||"100");

function addMsg(html,isBot=true){
  const r=document.createElement("div");r.className="msg-row "+(isBot?"bot":"usr");
  const b=document.createElement("div");b.className="bubble "+(isBot?"bot":"usr");
  b.innerHTML=html;r.appendChild(b);chatEl.appendChild(r);
  setTimeout(()=>chatEl.scrollTo({top:chatEl.scrollHeight,behavior:"smooth"}),50);
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
function setNav(showBack){document.getElementById("backBtn").classList.toggle("gone",!showBack);}
function pushNav(fn){navHistory.push(fn);}
function goBack(){if(navHistory.length>0){const fn=navHistory.pop();fn();}}

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
    b.innerHTML='<div class="hours-dot" aria-hidden="true"></div>Сейчас открыто — работаем до '+cd.closeH+':'+String(cd.closeM).padStart(2,'0');
  }else{
    b.className="hours-banner closed";
    const nextDay=(dow===5||dow===6||dow===0)?"в понедельник":"завтра";
    b.innerHTML='<div class="hours-dot" aria-hidden="true"></div>Сейчас закрыто. Откроемся '+nextDay+' в 08:30';
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
  if(hasMoroshka===null){t.classList.add("gone");return;}
  t.classList.remove("gone");t.classList.toggle("on",hasMoroshka);
  t.setAttribute("aria-checked",String(hasMoroshka));
}
function toggleMoroshka(){
  if(hasMoroshka===null)return;
  hasMoroshka=!hasMoroshka;localStorage.setItem("hasMoroshka",String(hasMoroshka));
  updateMToggle();updateSvcPrices();
  addMsg(hasMoroshka?'<img src="img/moroshka-logo.jpg" class="moroshka-ico-sm" alt=""> Морошка включена — льготные цены активированы!':'<img src="img/no-moroshka.jpg" class="moroshka-ico-sm" alt=""> Морошка отключена. Базовые цены.',true);
  showToast(hasMoroshka?"🍊 Морошка ON":"❌ Морошка OFF");
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
function updateBadge(){const n=cart.reduce((s,i)=>s+i.qty,0);badgeEl.textContent=n;badgeEl.classList.toggle("gone",n===0);}
function addToCart(id,name,price,btn,base,mor){
  const ex=cart.find(i=>i.id===id);
  if(ex)ex.qty++;else cart.push({id,name,price,qty:1,base:(base!==undefined?base:price),mor:(mor!==undefined?mor:null)});
  if(typeof trackCartAdd==="function")trackCartAdd(name);
  saveCart();updateBadge();renderCart();
  if(btn){btn.classList.add("added");btn.textContent="✓";btn.setAttribute("aria-label","Добавлено");
    setTimeout(()=>{btn.classList.remove("added");btn.textContent="+";btn.setAttribute("aria-label","Добавить в корзину");},900);}
  showToast("✅ Добавлено в корзину");
}
function chgQty(id,d){
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
  const body=`ОТМЕНА ЗАПИСИ\nТалон: ${b.num}\nПолучатель: ${clientName}\nТелефон: ${clientPhone}\nБыло запланировано: ${b.visitDate} в ${b.visitTime}\nСпециалист: ${b.spec}`;
  window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent("Отмена записи "+b.num)}&body=${encodeURIComponent(body)}`;
  showToast("Запись отменена");
  document.querySelector(".mo")?.remove();
  setTimeout(openProfile,200);
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
  document.querySelector(".mo")?.remove();
  setTimeout(openProfile,200);
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
  document.querySelector(".mo")?.remove();
  setTimeout(openProfile,200);
}
function renderCart(){
  const body=document.getElementById("cartBody"),footer=document.getElementById("cartFooter");
  if(cart.length===0){
    body.innerHTML='<div class="cart-empty">🛒 Корзина пуста<br><span style="font-size:14px;color:#8AA0A0;margin-top:8px;display:block;">Добавьте услуги из прейскуранта</span></div>';
    footer.innerHTML="";return;
  }
  body.innerHTML=cart.map(it=>`
    <div class="cart-item" role="listitem">
      <div class="ci-name">${it.name}</div>
      <div class="ci-price">${(it.price*it.qty).toLocaleString()} ₽</div>
      <div class="qty-row" role="group" aria-label="Количество">
        <button class="qty-btn" onclick="chgQty('${it.id}',-1)" aria-label="Уменьшить">−</button>
        <span class="qty-val" aria-live="polite">${it.qty}</span>
        <button class="qty-btn" onclick="chgQty('${it.id}',1)" aria-label="Увеличить">+</button>
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
    <div class="cart-rcpt">Заявка будет отправлена на <strong>${ORG_EMAIL}</strong><br>Получатель: <strong>${clientName||"—"}</strong></div>
    <button class="cart-send" onclick="sendOrder()" aria-label="Отправить заявку на email">📧 Отправить заявку</button>
    <button class="cart-clr" onclick="clearCart()">🗑 Очистить корзину</button>`;
}
function sendOrder(){
  if(!cart.length)return;
  const cd=cityData[currentCity]||cityData.gubkin;
  const items=cart.map(i=>`• ${i.name} (x${i.qty}) — ${(i.price*i.qty).toLocaleString()} руб.`).join("\n");
  const total=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const body=`ЗАЯВКА НА СОЦИАЛЬНЫЕ УСЛУГИ\nДата: ${new Date().toLocaleString("ru-RU")}\n\nПОЛУЧАТЕЛЬ\nФИО: ${clientName}\nТелефон: ${clientPhone}\nСНИЛС: ${clientSnils}\nКарта «Морошка»: ${hasMoroshka?"Да":"Нет"}\nФилиал: г. ${currentCityName}\n\nУСЛУГИ\n${items}\n\nИТОГО: ${total.toLocaleString()} руб.`;
  window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent(`Заявка: ${clientName} (${currentCityName})`)}&body=${encodeURIComponent(body)}`;
  ticketCounter++;localStorage.setItem("ticketCounter",String(ticketCounter));
  const orderNum="ЗАЯ-"+String(ticketCounter).padStart(4,"0");
  ordersHistory.unshift({
    num:orderNum,
    date:new Date().toLocaleString("ru-RU"),
    sum:total.toLocaleString(),
    items:cart.map(i=>`${i.name} x${i.qty}`).join(", "),
    itemsRaw:cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty,base:i.base,mor:i.mor})),
    status:"new"
  });
  localStorage.setItem("ordersHistory",JSON.stringify(ordersHistory));

  window.GarmoniyaDB?.saveOrder({
    clientName, clientPhone, cityName:currentCityName, moroshka:hasMoroshka, total,
    items:cart.map(i=>({name:i.name,qty:i.qty,price:i.price}))
  });
  cart=[];saveCart();updateBadge();renderCart();closeCart();
  addMsg("✅ Почтовый клиент открыт. Нажмите «Отправить» — заявка уйдёт специалисту!",true);
  showToast("✅ Заявка сформирована!");
  if(typeof showRating==="function")showRating("order");
}

function tryShare(){
  const data={title:"Гармония — ЦСОН ЯНАО",text:"Помощник социального центра «Гармония» (ЯНАО). Услуги, запись, контакты.",url:location.href};
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
  const results=[];
  servicesData.forEach(cat=>{cat.items.forEach((svc,i)=>{if(svc.n.toLowerCase().includes(q.toLowerCase()))results.push({cat,svc,i});});});
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

function menuCard(it){
  const c=document.createElement("div");c.className="card";c.setAttribute("role","button");c.setAttribute("tabindex","0");
  const icoHtml=it.ico==="moroshka"?'<img src="img/moroshka-logo.jpg" class="moroshka-ico-card" alt="">':it.ico;
  c.innerHTML=`<div class="card-ico ${it.cl}" aria-hidden="true">${icoHtml}</div><div class="card-ttl">${it.ttl}</div><div class="card-sub">${it.sub}</div>`;
  c.onclick=it.fn;c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();it.fn();}};
  return c;
}
function menuSection(title,items,collapsed){
  const sec=document.createElement("div");sec.className="sec"+(collapsed?" collapsed":"");
  const h=document.createElement("button");h.type="button";h.className="sec-title";
  h.setAttribute("aria-expanded",String(!collapsed));
  h.innerHTML=`<span>${title}</span><span class="sec-chev" aria-hidden="true">⌄</span>`;
  const g=document.createElement("div");g.className="cards";
  items.forEach(it=>g.appendChild(menuCard(it)));
  h.onclick=()=>{const col=sec.classList.toggle("collapsed");h.setAttribute("aria-expanded",String(!col));};
  sec.appendChild(h);sec.appendChild(g);
  return sec;
}
function showMainMenu(){
  document.getElementById("searchBar").classList.add("gone");
  clearActions();navHistory=[];setNav(false);currentSvcList=null;currentCatId=null;
  addMsg(`${greeting()}, <b>${clientName}</b>! ${t("switched_to")}: <b>${currentCityName}</b>. ${t("how_help")}`,true);
  if(typeof showSeasonalGreeting==="function")showSeasonalGreeting();
  setTimeout(()=>{
    clearActions();
    const dash=document.createElement("div");dash.className="dash";
    const cta=document.createElement("button");cta.type="button";cta.className="asst-fab";
    cta.innerHTML='<span class="fab-ico">🤖</span> '+t("ask_helper");
    cta.onclick=()=>{pushNav(showMainMenu);showTyping(showAssistant);};
    dash.appendChild(cta);

    dash.appendChild(menuSection(t("sec_services"),[
      {ico:"📋",ttl:t("menu_services"),sub:t("menu_services_sub"),cl:"ci-teal",fn:()=>{pushNav(showMainMenu);showTyping(showServices);}},
      {ico:"📝",ttl:t("menu_booking"),sub:t("menu_booking_sub"),cl:"ci-gold",fn:()=>{pushNav(showMainMenu);showTyping(showBooking);}},
      {ico:"🧮",ttl:t("menu_calc"),sub:t("menu_calc_sub"),cl:"ci-green",fn:()=>{pushNav(showMainMenu);showTyping(showEligibility);}},
      {ico:"🏠",ttl:t("menu_home_worker"),sub:t("menu_home_worker_sub"),cl:"ci-teal",fn:()=>{pushNav(showMainMenu);showTyping(showHomeWorker);}},
      {ico:"📞",ttl:t("menu_callback"),sub:t("menu_callback_sub"),cl:"ci-gold",fn:()=>{pushNav(showMainMenu);showTyping(showCallback);}},
      {ico:"🎟️",ttl:t("menu_events"),sub:t("menu_events_sub"),cl:"ci-blue",fn:()=>{pushNav(showMainMenu);showTyping(showEvents);}},
      {ico:"📰",ttl:t("menu_news"),sub:t("menu_news_sub"),cl:"ci-blue",fn:()=>{pushNav(showMainMenu);showTyping(showNews);}},
      {ico:"👥",ttl:t("menu_staff"),sub:t("menu_staff_sub"),cl:"ci-green",fn:()=>{pushNav(showMainMenu);showTyping(showStaff);}},
      {ico:"📍",ttl:t("menu_contacts"),sub:t("menu_contacts_sub"),cl:"ci-teal",fn:()=>{pushNav(showMainMenu);showTyping(showContacts);}},
      {ico:"❓",ttl:t("menu_faq"),sub:t("menu_faq_sub"),cl:"ci-blue",fn:()=>{pushNav(showMainMenu);showTyping(showFAQ);}},
      {ico:"🆘",ttl:t("menu_emergency"),sub:t("menu_emergency_sub"),cl:"ci-red",fn:()=>{pushNav(showMainMenu);showTyping(showEmergency);}},
      {ico:"💬",ttl:"Написать оператору",sub:"Макс, телефон, email",cl:"ci-blue",fn:()=>{pushNav(showMainMenu);showTyping(showLiveChat);}}
    ],false));

    dash.appendChild(menuSection(t("sec_cabinet"),[
      {ico:"🛒",ttl:t("menu_cart"),sub:`${cart.reduce((s,i)=>s+i.qty,0)} услуг`,cl:"ci-teal",fn:openCart},
      {ico:"💬",ttl:t("menu_feedback"),sub:t("menu_feedback_sub"),cl:"ci-green",fn:()=>{pushNav(showMainMenu);showTyping(showFeedback);}},
      {ico:"moroshka",ttl:t("menu_moroshka"),sub:t("menu_moroshka_sub"),cl:"ci-gold",fn:()=>{pushNav(showMainMenu);showTyping(showMoroshkaInfo);}},
      {ico:"👤",ttl:t("menu_cabinet"),sub:t("menu_cabinet_sub"),cl:"ci-blue",fn:openProfile},
      {ico:"👨‍👩‍👦",ttl:"Профили",sub:"Переключить получателя",cl:"ci-green",fn:openProfileSwitcher},
      {ico:"📊",ttl:"Статистика",sub:"Популярные услуги",cl:"ci-teal",fn:showCartStats}
    ],true));

    actionsEl.appendChild(dash);
    const adm=document.createElement("button");adm.type="button";adm.className="admin-link";
    adm.textContent="⚙️ Управление";adm.onclick=openAdmin;
    actionsEl.appendChild(adm);
    if(typeof showOnboarding==="function")showOnboarding();
  },200);
}

function showServices(){
  clearActions();setNav(true);
  const cd=cityData[currentCity];
  if(!servicesData.length){showCityPlaceholder("прейскуранта");return;}
  document.getElementById("searchBar").classList.remove("gone");
  addMsg("Выберите категорию или введите название услуги в поиске:",true);
  setTimeout(()=>{
    const g=document.createElement("div");g.className="cards";
    servicesData.forEach(cat=>{
      const c=document.createElement("div");c.className="card";c.setAttribute("role","button");c.setAttribute("tabindex","0");
      c.innerHTML=`<div class="card-ico ci-teal" aria-hidden="true">${cat.icon}</div><div class="card-ttl">${cat.name}</div><div class="card-sub">${cat.items.length} позиций</div>`;
      c.onclick=()=>{pushNav(showServices);showTyping(()=>showCategory(cat.id));};
      c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pushNav(showServices);showTyping(()=>showCategory(cat.id));}};
      g.appendChild(c);
    });
    actionsEl.appendChild(g);
  },200);
}
function showCategory(catId){
  currentCatId=catId;clearActions();setNav(true);
  document.getElementById("searchBar").classList.remove("gone");
  const cat=servicesData.find(c=>c.id===catId);if(!cat)return;
  const rt=serviceRatings[`c_${catId}`]||cat.rating;
  addMsg(`<b>${cat.icon} ${cat.name}</b>${rStars(`c_${catId}`,rt)}`,true);bindRatings();
  setTimeout(()=>{
    const wrap=document.createElement("div");wrap.className="svc-wrap";
    const ul=document.createElement("div");ul.className="svc-list";ul.setAttribute("role","list");
    cat.items.forEach((svc,i)=>{
      const rp=(hasMoroshka&&svc.m!==null)?svc.m:svc.p;
      const id=`${catId}_${i}`;
      const escn=svc.n.replace(/'/g,"\\'");
      const mv=svc.m===null?"null":svc.m;
      const row=document.createElement("div");row.className="svc-row";row.setAttribute("role","listitem");
      row.innerHTML=`<button class="fav-btn ${isFav(id)?"on":""}" aria-label="В избранное" onclick="toggleFav(event,'${id}','${escn}',${svc.p},${mv},${catId})">★</button><div class="svc-name">${svc.n}</div>${pHtml(svc.p,svc.m)}<button class="add-btn" aria-label="Добавить «${svc.n}» в корзину" onclick="addToCart('${id}','${escn}',${rp},this,${svc.p},${mv})">+</button>`;
      ul.appendChild(row);
    });
    currentSvcList=ul;
    if(cat.items.length>5){
      const f=document.createElement("div");f.className="svc-scroll-hint";f.setAttribute("aria-hidden","true");
      f.innerHTML="<span>↓ листайте вниз ↓</span>";wrap.appendChild(ul);wrap.appendChild(f);
      ul.addEventListener("scroll",()=>{if(ul.scrollTop>20)f.style.opacity="0";},{passive:true});
    }else{wrap.appendChild(ul);}
    const gb=document.createElement("button");gb.className="go-cart-btn";
    gb.innerHTML="🛒 Посмотреть корзину →";gb.onclick=openCart;
    actionsEl.appendChild(wrap);actionsEl.appendChild(gb);
  },200);
}

function showBooking(){
  clearActions();setNav(true);
  const cd=cityData[currentCity];
  if(!staffData.length){showCityPlaceholder("записи");return;}
  addMsg("📝 Запись к специалисту. Заполните форму:",true);
  setTimeout(()=>{
    const depts=[...new Set(staffData.map(s=>s.dept))];
    let selDept="",selSpec="",selDate="",selTime="";
    const form=document.createElement("div");form.className="book-form";
    const dSel=document.createElement("select");dSel.className="book-sel";dSel.setAttribute("aria-label","Отделение");
    dSel.innerHTML='<option value="">— Выберите отделение —</option>'+depts.map(d=>`<option value="${d}">${d}</option>`).join("");
    const sSel=document.createElement("select");sSel.className="book-sel";sSel.setAttribute("aria-label","Специалист");
    sSel.innerHTML='<option value="">— Сначала выберите отделение —</option>';
    dSel.onchange=()=>{
      selDept=dSel.value;
      const list=staffData.filter(s=>s.dept===selDept);
      sSel.innerHTML='<option value="">— Выберите специалиста —</option>'+list.map(s=>`<option value="${s.name}">${s.name} — ${s.pos}</option>`).join("");
    };
    sSel.onchange=()=>{selSpec=sSel.value;};

    const dateInp=document.createElement("input");dateInp.type="date";dateInp.className="book-inp";
    dateInp.setAttribute("aria-label","Дата записи");
    const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
    dateInp.min=tomorrow.toISOString().split("T")[0];
    const maxD=new Date(tomorrow);maxD.setDate(maxD.getDate()+30);
    dateInp.max=maxD.toISOString().split("T")[0];

    const timeWrap=document.createElement("div");
    const timeField=document.createElement("div");timeField.className="book-field";
    const timeLbl=document.createElement("label");timeLbl.className="book-lbl";timeLbl.textContent="Время приёма";
    timeField.appendChild(timeLbl);timeField.appendChild(timeWrap);

    dateInp.onchange=()=>{
      selDate=dateInp.value;selTime="";
      timeWrap.innerHTML="";
      if(!selDate)return;
      const d=new Date(selDate);const dow=d.getDay(); // 0=Вс, 6=Сб
      if(dow===0||dow===6){
        const notice=document.createElement("div");notice.className="weekend-notice";
        notice.setAttribute("role","alert");
        notice.innerHTML="🚫 Центр не работает в субботу и воскресенье.<br>Пожалуйста, выберите рабочий день (пн–пт).";
        timeWrap.appendChild(notice);return;
      }
      const slots=["09:00","09:30","10:00","10:30","11:00","11:30","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30"];
      const lunchIdxs=new Set([6,7,8]);
      const g=document.createElement("div");g.className="time-grid";g.setAttribute("role","group");g.setAttribute("aria-label","Выберите время приёма");
      slots.forEach((sl,idx)=>{
        const btn=document.createElement("button");btn.type="button";btn.className="time-slot";btn.textContent=sl;
        btn.setAttribute("aria-label","Время "+sl);
        if(lunchIdxs.has(idx)){
          btn.classList.add("busy");btn.setAttribute("disabled","");
          btn.setAttribute("aria-disabled","true");btn.setAttribute("aria-label","Время "+sl+" — обед");
        }else{
          btn.onclick=()=>{
            g.querySelectorAll(".time-slot:not(.busy)").forEach(b=>{b.classList.remove("sel");b.setAttribute("aria-pressed","false");});
            btn.classList.add("sel");btn.setAttribute("aria-pressed","true");selTime=sl;
          };
        }
        g.appendChild(btn);
      });
      timeWrap.appendChild(g);
    };

    const cInp=document.createElement("textarea");cInp.className="fb-inp";cInp.style.minHeight="72px";
    cInp.placeholder="Комментарий (цель визита, особые потребности…)";cInp.setAttribute("aria-label","Комментарий к записи");

    const sendBtn=document.createElement("button");sendBtn.type="button";sendBtn.className="book-send";
    sendBtn.textContent="📧 Подтвердить запись";
    sendBtn.onclick=()=>{
      if(!selDept||!selSpec||!selDate||!selTime){showToast("⚠️ Заполните все поля");return;}
      ticketCounter++;localStorage.setItem("ticketCounter",String(ticketCounter));
      const ticketNum="ТАЛ-"+String(ticketCounter).padStart(4,"0");
      const spec=staffData.find(s=>s.name===selSpec);
      const cd2=cityData[currentCity]||cityData.gubkin;
      const body=`ЗАПИСЬ К СПЕЦИАЛИСТУ\nТалон: ${ticketNum}\nДата: ${selDate}, Время: ${selTime}\n\nПОЛУЧАТЕЛЬ\nФИО: ${clientName}\nТелефон: ${clientPhone}\n\nОТДЕЛЕНИЕ: ${selDept}\nСПЕЦИАЛИСТ: ${selSpec}\nКОММЕНТАРИЙ: ${cInp.value||"—"}`;
      window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent(`Запись: ${clientName} на ${selDate} ${selTime} — ${ticketNum}`)}&body=${encodeURIComponent(body)}`;
      bookingsHistory=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
      bookingsHistory.unshift({
        num:ticketNum,
        date:new Date().toLocaleString("ru-RU"),
        visitDate:selDate,visitTime:selTime,
        dept:selDept,spec:selSpec,
        comment:cInp.value||""
      });
      localStorage.setItem("bookingsHistory",JSON.stringify(bookingsHistory));
      window.GarmoniyaDB?.saveBooking({
        num:ticketNum, clientName, clientPhone, cityName:currentCityName,
        dept:selDept, spec:selSpec, visitDate:selDate, visitTime:selTime,
        comment:cInp.value||""
      });
      addMsg(`✅ Запись оформлена!<br>📋 Талон: <b>${ticketNum}</b><br>📅 <b>${selDate}</b> в <b>${selTime}</b><br>👤 ${selSpec}`,true);
      showToast("✅ Талон "+ticketNum+" сохранён!");
      setTimeout(()=>{
        clearActions();
        const calBtn=document.createElement("button");calBtn.type="button";calBtn.className="act-btn teal";
        calBtn.textContent="📅 Добавить в календарь";
        calBtn.onclick=()=>exportToCalendar({num:ticketNum,spec:selSpec,dept:selDept,visitDate:selDate,visitTime:selTime});
        actionsEl.appendChild(calBtn);
      },300);
    };

    [{lbl:"Отделение",el:dSel},{lbl:"Специалист",el:sSel},{lbl:"Дата приёма",el:dateInp},
     {lbl:"",el:timeField},{lbl:"Комментарий (необязательно)",el:cInp}].forEach(({lbl,el})=>{
      if(lbl&&!(el===timeField)){
        const f=document.createElement("div");f.className="book-field";
        const l=document.createElement("label");l.className="book-lbl";l.textContent=lbl;
        f.appendChild(l);f.appendChild(el);form.appendChild(f);
      }else{form.appendChild(el);}
    });
    form.appendChild(sendBtn);
    actionsEl.appendChild(form);
  },200);
}

function showStaff(){
  clearActions();setNav(true);
  const cd=cityData[currentCity];
  if(!staffData.length){showCityPlaceholder("списка сотрудников");return;}
  addMsg("Выберите отделение:",true);
  setTimeout(()=>{
    const g=document.createElement("div");g.className="cards";
    const depts=[...new Set(staffData.map(s=>s.dept))];
    depts.forEach(dept=>{
      const cnt=staffData.filter(s=>s.dept===dept).length;
      const sh=dept.length>22?dept.substring(0,22)+"…":dept;
      const c=document.createElement("div");c.className="card";c.setAttribute("role","button");c.setAttribute("tabindex","0");
      c.innerHTML=`<div class="card-ico ci-gold" aria-hidden="true">📁</div><div class="card-ttl">${sh}</div><div class="card-sub">${cnt} специалистов</div>`;
      c.onclick=()=>{pushNav(showStaff);showTyping(()=>showDept(dept));};
      c.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();pushNav(showStaff);showTyping(()=>showDept(dept));}};
      g.appendChild(c);
    });
    actionsEl.appendChild(g);
  },200);
}
function showDept(dept){
  clearActions();setNav(true);
  const list=staffData.filter(s=>s.dept===dept);
  addMsg(`Специалисты: <b>${dept}</b>`,true);
  setTimeout(()=>{
    list.forEach(p=>{
      const c=document.createElement("div");c.className="staff-card";c.setAttribute("aria-label",`${p.name}, ${p.pos}`);
      const ini=p.name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
      const ph=p.ext?`${MAIN_PHONE} <span class="s-ext">доб. ${p.ext}</span>`:MAIN_PHONE;
      const em=p.email?`<div class="s-email">✉️ <a href="mailto:${p.email}">${p.email}</a></div>`:'<div class="s-email" style="color:var(--text-tertiary);">✉️ email уточняется</div>';
      c.innerHTML=`<div class="staff-row"><div class="staff-av" aria-hidden="true">${ini}</div><div class="staff-info"><div class="s-name">${p.name}</div><div class="s-pos">${p.pos}</div><div class="s-phone">📞 ${ph}</div>${em}</div></div><div class="staff-btns"><button class="s-btn call" onclick="location.href='tel:+${MAIN_PHONE_RAW}'">📞 Позвонить</button><button class="s-btn mail" onclick="location.href='mailto:${p.email||ORG_EMAIL}'">✉️ Написать</button></div>`;
      actionsEl.appendChild(c);
    });
  },200);
}

function showContacts(){
  clearActions();setNav(true);
  addMsg(`📍 Контакты — <b>г. ${currentCityName}</b>`,true);
  const cd=cityData[currentCity]||cityData.gubkin;
  setTimeout(()=>{
    const rows=[
      {ico:"🏢",lbl:"АДРЕС",val:cd.address},
      {ico:"📞",lbl:"ПРИЁМНАЯ",val:`<a href="tel:+${cd.phoneRaw}">${cd.phone}</a>`},
      {ico:"✉️",lbl:"EMAIL",val:`<a href="mailto:${cd.email}">${cd.email}</a>`},
      {ico:"📋",lbl:"ЗАЯВКИ",val:`<a href="mailto:${cd.orderEmail}">${cd.orderEmail}</a>`},
      {ico:"🕒",lbl:"РЕЖИМ РАБОТЫ",val:cd.hours}
    ];
    let html="";
    rows.forEach(r=>{html+=`<div class="contact-row"><div class="c-ico" aria-hidden="true">${r.ico}</div><div><div class="c-lbl">${r.lbl}</div><div class="c-val">${r.val}</div></div></div>`;});
    addMsg(html,true);
    const a=document.createElement("a");a.href=`tel:+${cd.phoneRaw}`;a.className="act-btn green";a.innerHTML="📞 Позвонить в приёмную";a.setAttribute("aria-label","Позвонить "+cd.phone);
    const b=document.createElement("a");b.href=`mailto:${cd.email}`;b.className="act-btn teal";b.style.marginTop="8px";b.innerHTML="✉️ Написать на email";
    actionsEl.appendChild(a);actionsEl.appendChild(b);
  },200);
}

function showFAQ(){
  clearActions();setNav(true);
  addMsg("❓ Часто задаваемые вопросы:",true);
  setTimeout(()=>{
    faqData.forEach((item,i)=>{
      const el=document.createElement("div");el.className="faq-item";
      el.innerHTML=`<div class="faq-q" role="button" tabindex="0" aria-expanded="false" aria-controls="faq-a-${i}">${item.q}<span class="faq-arrow" aria-hidden="true">▼</span></div><div class="faq-a" id="faq-a-${i}">${item.a}</div>`;
      const q=el.querySelector(".faq-q");
      const toggle=()=>{const isOpen=el.classList.toggle("open");q.setAttribute("aria-expanded",String(isOpen));};
      q.onclick=toggle;q.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();}};
      actionsEl.appendChild(el);
    });
  },200);
}

function showEmergency(){
  clearActions();setNav(true);
  addMsg("🆘 Экстренная психологическая помощь",true);
  const cd=cityData[currentCity]||cityData.gubkin;
  setTimeout(()=>{
    if(currentCity==="gubkin"){
      addMsg(`🧠 <b>Давыденко Алла Иосифовна</b><br>📞 ${MAIN_PHONE} доб. 710<br>✉️ aidavydenko@yanao.ru<br><br>🧠 <b>Сарсембаева Алия Наиловна</b><br>📞 ${MAIN_PHONE} доб. 716<br>✉️ ansarsembaeva@yanao.ru`,true);
    }else{
      addMsg(`🧠 Экстренная психологическая помощь<br>📞 ${cd.phone}<br>✉️ ${cd.email}`,true);
    }
    const m=document.createElement("a");m.href=`mailto:${cd.orderEmail}?subject=${encodeURIComponent("Запрос экстренной помощи")}`;
    m.className="act-btn red";m.innerHTML="✉️ Написать экстренное сообщение";
    const p=document.createElement("a");p.href=`tel:+${cd.phoneRaw}`;p.className="act-btn green";p.style.marginTop="8px";p.innerHTML="📞 Позвонить на горячую линию";
    const sos=document.createElement("a");sos.href="tel:112";sos.className="act-btn outline";sos.style.marginTop="8px";sos.innerHTML="🚨 Скорая / полиция — 112";
    actionsEl.appendChild(m);actionsEl.appendChild(p);actionsEl.appendChild(sos);
  },200);
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

function showFeedback(){
  clearActions();setNav(true);
  addMsg("💬 Обратная связь — нам важно ваше мнение!",true);
  setTimeout(()=>{
    const wrap=document.createElement("div");
    const starsRow=document.createElement("div");starsRow.className="fb-stars";starsRow.setAttribute("role","group");starsRow.setAttribute("aria-label","Оцените работу центра");
    const starEmoji=["😞","😕","😐","😊","😍"];
    for(let i=1;i<=5;i++){
      const s=document.createElement("span");s.className="fb-star";s.textContent=starEmoji[i-1];
      s.setAttribute("role","button");s.setAttribute("tabindex","0");s.setAttribute("aria-label",`Оценка ${i} из 5`);
      s.onclick=s.onkeydown=function(e){
        if(e.type==="keydown"&&e.key!=="Enter"&&e.key!==" ")return;
        fbRating=i;starsRow.querySelectorAll(".fb-star").forEach((x,j)=>x.classList.toggle("sel",j<i));
      };
      starsRow.appendChild(s);
    }
    const tagHd=document.createElement("div");tagHd.style.cssText="font-size:13px;font-weight:700;color:var(--text-secondary);margin-bottom:8px;";tagHd.textContent="Что понравилось?";
    const tagRow=document.createElement("div");tagRow.className="fb-rate-row";tagRow.setAttribute("role","group");tagRow.setAttribute("aria-label","Выберите теги");
    ["Вежливый персонал","Быстрое обслуживание","Удобный бот","Большой выбор услуг","Доступные цены","Хорошее расположение","Удобно для инвалидов"].forEach(t=>{
      const btn=document.createElement("button");btn.type="button";btn.className="fb-tag";btn.textContent=t;btn.setAttribute("aria-pressed","false");
      btn.onclick=()=>{const on=btn.classList.toggle("sel");btn.setAttribute("aria-pressed",String(on));if(on)fbTags.push(t);else fbTags=fbTags.filter(x=>x!==t);};
      tagRow.appendChild(btn);
    });
    const cLbl=document.createElement("label");cLbl.htmlFor="fb-comment";cLbl.className="book-lbl";cLbl.textContent="Ваш комментарий";
    const cInp=document.createElement("textarea");cInp.className="fb-inp";cInp.id="fb-comment";cInp.placeholder="Напишите пожелания или замечания…";
    const sendBtn=document.createElement("button");sendBtn.type="button";sendBtn.className="fb-send";sendBtn.textContent="📧 Отправить отзыв";
    sendBtn.onclick=()=>{
      if(!fbRating){showToast("⚠️ Поставьте оценку от 1 до 5");return;}
      const body=`ОТЗЫВ\nОценка: ${fbRating}/5 ${"★".repeat(fbRating)}\nТеги: ${fbTags.join(", ")||"—"}\nКомментарий: ${cInp.value||"—"}\n\nОтправитель: ${clientName}\nТелефон: ${clientPhone}`;
      window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent("Отзыв от "+clientName)}&body=${encodeURIComponent(body)}`;
      addMsg(`✅ Спасибо за отзыв! ${"⭐".repeat(fbRating)}`,true);
      showToast("💬 Отзыв отправлен!");fbRating=0;fbTags=[];
    };
    wrap.appendChild(starsRow);wrap.appendChild(tagHd);wrap.appendChild(tagRow);
    wrap.appendChild(cLbl);wrap.appendChild(cInp);wrap.appendChild(sendBtn);
    actionsEl.appendChild(wrap);
  },200);
}

function showCityPlaceholder(section){
  const cd=cityData[currentCity]||cityData.gubkin;
  const ph=document.createElement("div");ph.className="city-ph";ph.setAttribute("role","status");
  ph.innerHTML=`<div class="city-ph-ico" aria-hidden="true">🏢</div><h4>г. ${currentCityName}</h4><p>База данных ${section} этого филиала заполняется.</p>`;
  [{ico:"📞",lbl:"ТЕЛЕФОН",val:`<a href="tel:+${cd.phoneRaw}">${cd.phone}</a>`},{ico:"✉️",lbl:"EMAIL",val:`<a href="mailto:${cd.email}">${cd.email}</a>`}].forEach(r=>{
    ph.innerHTML+=`<div class="contact-row" style="margin-bottom:8px;"><div class="c-ico" aria-hidden="true">${r.ico}</div><div><div class="c-lbl">${r.lbl}</div><div class="c-val">${r.val}</div></div></div>`;
  });
  const sw=document.createElement("button");sw.type="button";sw.className="act-btn teal";sw.style.marginTop="6px";
  sw.innerHTML="🏢 Перейти в Губкинский";sw.onclick=()=>document.querySelector('.city-btn[data-city="gubkin"]')?.click();
  actionsEl.appendChild(ph);actionsEl.appendChild(sw);
}

function statusBadge(st){
  const map={new:["Принята","st-new"],progress:["В работе","st-prog"],done:["Выполнена","st-done"]};
  const v=map[st]||map.new;
  return `<span class="st-badge ${v[1]}">${v[0]}</span>`;
}
function openProfile(){
  const modal=document.createElement("div");modal.className="mo";modal.setAttribute("role","dialog");modal.setAttribute("aria-modal","true");modal.setAttribute("aria-label","Личный кабинет");
  const oh=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
  const bh=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
  const fav=JSON.parse(localStorage.getItem("favorites")||"[]");

  const ordersHtml=oh.length===0
    ?'<div class="hist-empty">📭 Нет заявок</div>'
    :oh.map((o,i)=>`<div class="history-item"><div class="h-item-top"><span class="h-item-dt">📅 ${o.date}</span>${statusBadge(o.status)}</div><div class="h-item-title">${o.num?o.num+" — ":""}Сумма: ${o.sum} ₽</div><div class="h-item-detail">${o.items}</div>${o.itemsRaw?`<button class="h-act" onclick="repeatOrder(${i})">🔁 Повторить заявку</button>`:""}</div>`).join("")
    +(oh.length?`<button class="h-act-clear" data-clear-orders onclick="clearAllOrders()">🗑 Очистить список заявок</button>`:"");

  const bookingsHtml=bh.length===0
    ?'<div class="hist-empty">📭 Нет записей</div>'
    :bh.map((b,i)=>`<div class="history-item booking-item"><div class="h-item-dt">📋 Талон ${b.num} — оформлен ${b.date}</div><div class="h-item-title">${b.spec}</div><div class="h-item-detail">📅 ${b.visitDate} в ${b.visitTime}<br>${b.dept}</div><div class="h-act-row"><button class="h-act" onclick="exportToCalendar(JSON.parse(localStorage.getItem('bookingsHistory'))[${i}])">📅 В календарь</button><button class="h-act danger" data-cancel-idx="${i}" onclick="cancelBooking(${i})">✕ Отменить</button></div></div>`).join("")
    +(bh.length?`<button class="h-act-clear" data-clear-all onclick="clearAllBookings()">🗑 Очистить список записей</button>`:"");

  const favHtml=fav.length===0
    ?'<div class="hist-empty">⭐ Нет избранных услуг<br><span style="font-size:13px;color:#8AA0A0;">Нажмите ★ у услуги в прейскуранте</span></div>'
    :fav.map(f=>`<div class="history-item"><div class="h-item-title">${f.n}</div><div class="h-item-detail">${(hasMoroshka&&f.m!=null?f.m:f.p).toLocaleString()} ₽</div><button class="h-act" onclick="addFavToCart('${f.id}')">🛒 В корзину</button></div>`).join("");

  const docsHtml=`<div class="docs-list">
    <div class="doc-card" onclick="downloadDoc('application')"><div class="doc-ico">📄</div><div><div class="doc-name">Заявление на обслуживание</div><div class="doc-desc">Заявление на получение социальных услуг</div></div><span class="doc-dl">⬇</span></div>
    <div class="doc-card" onclick="downloadDoc('consent')"><div class="doc-ico">🔒</div><div><div class="doc-name">Согласие на обработку данных</div><div class="doc-desc">Согласие на обработку персональных данных (ФЗ-152)</div></div><span class="doc-dl">⬇</span></div>
    <div class="doc-card" onclick="downloadDoc('moroshka')"><div class="doc-ico"><img src="img/moroshka-logo.jpg" class="moroshka-ico" alt=""></div><div><div class="doc-name">Памятка «Морошка»</div><div class="doc-desc">Как оформить и использовать карту «Морошка»</div></div><span class="doc-dl">⬇</span></div>
    <div class="doc-card" onclick="downloadDoc('rights')"><div class="doc-ico">📋</div><div><div class="doc-name">Права получателя услуг</div><div class="doc-desc">Перечень прав получателя социальных услуг</div></div><span class="doc-dl">⬇</span></div>
    <div class="doc-card" onclick="downloadDoc('complaint')"><div class="doc-ico">📝</div><div><div class="doc-name">Бланк жалобы / предложения</div><div class="doc-desc">Обращение в администрацию центра</div></div><span class="doc-dl">⬇</span></div>
  </div>`;

  modal.innerHTML=`<div class="mc">
    <h3>👤 Личный кабинет</h3>
    <div class="mo-info">
      <p><span class="lbl">Получатель:</span><span class="val">${clientName}</span></p>
      <p><span class="lbl">Телефон:</span><span class="val">${clientPhone}</span></p>
      <p><span class="lbl">СНИЛС:</span><span class="val">${clientSnils}</span></p>
      <p style="margin-bottom:0"><span class="lbl">Морошка:</span><span class="val">${hasMoroshka?"<img src=\"img/moroshka-logo.jpg\" class=\"moroshka-ico-sm\" alt=\"\"> Активна":"<img src=\"img/no-moroshka.jpg\" class=\"moroshka-ico-sm\" alt=\"\"> Нет карты"}</span></p>
    </div>
    <div class="history-tabs" role="tablist">
      <button class="h-tab active" id="tab-orders" role="tab" aria-selected="true" onclick="switchTab('orders',this)">🛒 <span class="htab-text">Заявки</span> (${oh.length})</button>
      <button class="h-tab" id="tab-bookings" role="tab" aria-selected="false" onclick="switchTab('bookings',this)">📋 <span class="htab-text">Записи</span> (${bh.length})</button>
      <button class="h-tab" id="tab-fav" role="tab" aria-selected="false" onclick="switchTab('fav',this)">⭐ <span class="htab-text">Избр.</span> (${fav.length})</button>
      <button class="h-tab" id="tab-docs" role="tab" aria-selected="false" onclick="switchTab('docs',this)">📁 <span class="htab-text">Док-ты</span></button>
    </div>
    <div class="history-list" id="hist-orders" role="tabpanel">${ordersHtml}</div>
    <div class="history-list" id="hist-bookings" role="tabpanel" style="display:none">${bookingsHtml}</div>
    <div class="history-list" id="hist-fav" role="tabpanel" style="display:none">${favHtml}</div>
    <div class="history-list" id="hist-docs" role="tabpanel" style="display:none">${docsHtml}</div>
    <button class="close-mo" onclick="this.closest('.mo').remove()">Закрыть</button>
    <button class="act-btn logout" onclick="doLogout(this)" style="margin-top:10px;">🚪 Выйти / Сменить пользователя</button>
  </div>`;
  modal.onclick=e=>{if(e.target===modal)modal.remove();};
  document.body.appendChild(modal);
}

function switchTab(which,btn){
  document.querySelectorAll(".h-tab").forEach(t=>{t.classList.remove("active");t.setAttribute("aria-selected","false");});
  btn.classList.add("active");btn.setAttribute("aria-selected","true");
  ["orders","bookings","fav","docs"].forEach(k=>{
    const el=document.getElementById("hist-"+k);if(el)el.style.display=k===which?"":"none";
  });
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
  const n=localStorage.getItem("clientName"),ph=localStorage.getItem("clientPhone"),s=localStorage.getItem("clientSnils");
  if(n&&ph&&s){
    clientName=n;clientPhone=ph;clientSnils=s;
    ordersHistory=JSON.parse(localStorage.getItem("ordersHistory")||"[]");
    bookingsHistory=JSON.parse(localStorage.getItem("bookingsHistory")||"[]");
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
    <label for="aSnils" style="position:absolute;opacity:0;pointer-events:none">СНИЛС</label>
    <input type="text" id="aSnils" class="auth-inp" placeholder="СНИЛС: 000-000-000 00" inputmode="numeric" aria-label="СНИЛС" aria-required="true">
    <div class="cb-row">
      <input type="checkbox" id="aCb" aria-required="true">
      <label for="aCb">Даю согласие на обработку персональных данных (ФЗ-152)</label>
    </div>
    <button class="auth-btn" id="aBtn" disabled aria-label="Войти в систему">Войти →</button>
    <button class="auth-esia" type="button" onclick="esiaLogin()" aria-label="Войти через Госуслуги">
      <img src="img/gosuslugi.jpg" alt="Госуслуги" class="esia-logo"> Войти через Госуслуги
    </button>
    <button class="auth-skip" onclick="skipAuth(this)">Пропустить (ограниченный режим)</button>
  </div>`;
  document.body.appendChild(modal);
  const ni=modal.querySelector("#aName"),pi=modal.querySelector("#aPhone"),si=modal.querySelector("#aSnils"),cb=modal.querySelector("#aCb"),btn=modal.querySelector("#aBtn");
  const v=()=>{btn.disabled=!(ni.value.trim().length>3&&pi.value.replace(/\D/g,"").length>=11&&si.value.replace(/\D/g,"").length===11&&cb.checked);};
  pi.oninput=e=>{let m="+7 (___) ___-__-__",i=0,d=m.replace(/\D/g,""),v2=e.target.value.replace(/\D/g,"");if(d.length>=v2.length)v2=d;e.target.value=m.replace(/./g,a=>/[_\d]/.test(a)&&i<v2.length?v2.charAt(i++):i>=v2.length?"":a);v();};
  si.oninput=e=>{let v2=e.target.value.replace(/\D/g,"").substring(0,11),r="";if(v2.length>0)r+=v2.substring(0,3);if(v2.length>3)r+="-"+v2.substring(3,6);if(v2.length>6)r+="-"+v2.substring(6,9);if(v2.length>9)r+=" "+v2.substring(9,11);e.target.value=r;v();};
  ni.oninput=v;cb.onchange=v;
  btn.onclick=()=>{
    clientName=ni.value.trim();clientPhone=pi.value.trim();clientSnils=si.value.trim();
    localStorage.setItem("clientName",clientName);localStorage.setItem("clientPhone",clientPhone);localStorage.setItem("clientSnils",clientSnils);
    modal.remove();showWelcome();
  };
  ni.addEventListener("keydown",e=>{if(e.key==="Enter")pi.focus();});
  pi.addEventListener("keydown",e=>{if(e.key==="Enter")si.focus();});
}
function skipAuth(el){
  clientName="Гость";clientPhone="—";clientSnils="—";
  el.closest(".auth-ovl").remove();showWelcome();
}

function showWelcome(){
  clearActions();navHistory=[];setNav(false);
  const saved=localStorage.getItem("hasMoroshka");
  if(saved!==null){hasMoroshka=saved==="true";updateMToggle();showMainMenu();return;}
  updateMToggle();
  addMsg(`${greeting()}, <b>${clientName}</b>! Я помощник ГБУ ЯНАО «ЦСОН Гармония».`,true);
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

document.getElementById("cities").addEventListener("click",e=>{
  const btn=e.target.closest(".city-btn");if(!btn||btn.classList.contains("active"))return;
  document.querySelectorAll(".city-btn").forEach(b=>{b.classList.remove("active");b.setAttribute("aria-selected","false");});
  btn.classList.add("active");btn.setAttribute("aria-selected","true");
  currentCity=btn.dataset.city;currentCityName=btn.dataset.name;
  servicesData=branchContent[currentCity].services;
  staffData=branchContent[currentCity].staff;
  document.getElementById("cityDisplay").textContent=`г. ${currentCityName}`;
  updateHoursBanner();navHistory=[];currentCatId=null;currentSvcList=null;
  document.getElementById("searchBar").classList.add("gone");
  addMsg(`📍 Переключено на: <b>г. ${currentCityName}</b>`,true);
  showMainMenu();
});

updateBadge();
updateHoursBanner();
setInterval(updateHoursBanner,60000);
initSearch();
showAuth();

(function(){
  let tapCount=0,tapTimer=null;
  const logo=document.querySelector(".hdr-logo");
  if(logo)logo.addEventListener("click",()=>{
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer=setTimeout(()=>{tapCount=0;},1200);
    if(tapCount>=5){tapCount=0;openAdmin();}
  });
})();
