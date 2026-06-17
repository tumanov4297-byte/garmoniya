
function asstNorm(s){
  return (s||"").toLowerCase().replace(/ё/g,"е").replace(/[^a-zа-я0-9 ]/gi," ").replace(/\s+/g," ").trim();
}

const ASST_INTENTS=[
  {kw:["записа","запис","талон","прием","приём","к специалист","к врач","на прием"],
   answer:"Чтобы записаться к специалисту, выберите отделение, специалиста, дату и время. Открываю форму записи 👇",
   actions:[{label:"📝 Записаться к специалисту",fn:"showBooking",cl:"gold"}]},
  {kw:["психолог","депресс","тяжело","трудно","стресс","тревог","одинок","плохо на душе","поддержк"],
   answer:"Психологическую помощь можно получить очно или экстренно по телефону. Если ситуация острая — есть экстренная линия.",
   actions:[{label:"🆘 Экстренная помощь",fn:"showEmergency",cl:"red"},{label:"🧠 Психологические услуги",fn:"showCategory",arg:12,cl:"teal"}]},
  {kw:["убор","помыть","помой","мытье","мытьё","окна","полы","пыль","чисто","прибрат"],
   answer:"Уборкой и мытьём занимается раздел «Чистка и уборка жилых помещений».",
   actions:[{label:"🧹 Чистка и уборка",fn:"showCategory",arg:2,cl:"teal"}]},
  {kw:["такси","довез","доехать","отвез","перевоз","транспорт","до больниц","до поликлин"],
   answer:"Поездки выполняет «Социальное такси» — с сопровождением или без, по заявке за 1 рабочий день.",
   actions:[{label:"🚗 Социальное такси",fn:"showCategory",arg:7,cl:"teal"}]},
  {kw:["сиделк","няня","няню","присмотр","ухаживать","уход за","посидеть с реб"],
   answer:"Услуги по присмотру и уходу — в разделе «Услуги сиделки и няни».",
   actions:[{label:"🤱 Сиделка и няня",fn:"showCategory",arg:19,cl:"teal"}]},
  {kw:["коляск","ходунк","кровать","костыл","трость","прокат","оборудован","матрац","инвалид"],
   answer:"Технические средства можно взять напрокат: коляски, ходунки, кровати и др.",
   actions:[{label:"🏥 Прокат оборудования",fn:"showCategory",arg:10,cl:"teal"}]},
  {kw:["логопед","речь","заика","занятия с реб","коррекц","развит реб"],
   answer:"Логопед, коррекционные и развивающие занятия — в разделе «Педагогические услуги».",
   actions:[{label:"📚 Педагогические услуги",fn:"showCategory",arg:13,cl:"teal"}]},
  {kw:["продукт","лекарств","аптек","доставк","купить","покупк","оплат жку","коммунал"],
   answer:"Покупка продуктов, лекарств, оплата ЖКУ и сопровождение — в «Дополнительных социальных услугах».",
   actions:[{label:"🛒 Доп. социальные услуги",fn:"showCategory",arg:1,cl:"teal"}]},
  {kw:["стирк","глажк","погладить","постират","химчист"],
   answer:"Стирка, глажка и химчистка — отдельный раздел прейскуранта.",
   actions:[{label:"👕 Стирка и глажка",fn:"showCategory",arg:3,cl:"teal"}]},
  {kw:["цена","стоит","стоимость","прайс","прейскур","сколько","тариф"],
   answer:"Все услуги и цены собраны в прейскуранте. Можно листать категории или искать по названию.",
   actions:[{label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"}]},
  {kw:["бесплат","льгот","положено","имею право","субсид","малоимущ"],
   answer:"Проверить право на бесплатное обслуживание можно с помощью короткого опроса.",
   actions:[{label:"🧮 Калькулятор льгот",fn:"showEligibility",cl:"green"}]},
  {kw:["морошк","скидк","карт жител","единая карт"],
   answer:"Карта «Морошка» даёт скидку на услуги центра. Подробнее — в разделе карты.",
   actions:[{label:"🍊 Карта Морошка",fn:"showMoroshkaInfo",cl:"gold"}]},
  {kw:["телефон","адрес","email","почт","связат","позвонить","как найти","режим работ","часы работ","график"],
   answer:"Адрес, телефон, email и режим работы филиала — в разделе «Контакты».",
   actions:[{label:"📍 Контакты центра",fn:"showContacts",cl:"teal"}]},
  {kw:["сотрудник","специалист","кто работает","директор","заведующ","персонал","доб ","добавочн"],
   answer:"Список сотрудников по отделениям с контактами — в разделе «Сотрудники».",
   actions:[{label:"👥 Сотрудники",fn:"showStaff",cl:"teal"}]},
  {kw:["новост","анонс","объявлен","что нового","свеж"],
   answer:"Свежие новости и объявления центра 👇",
   actions:[{label:"📰 Новости",fn:"showNews",cl:"teal"}]},
  {kw:["массаж","сауна","коктейл","оздоров","физкультур","лфк","тренаж","ингаляц"],
   answer:"Оздоровительные процедуры и занятия есть в нескольких разделах прейскуранта.",
   actions:[{label:"💊 Медицинские и оздоровительные",fn:"showCategory",arg:15,cl:"teal"},{label:"🏋️ ЛФК и тренажёрный зал",fn:"showCategory",arg:11,cl:"teal"}]},
  {kw:["перезвон","обратный звонок","перезвоните","свяжитесь","позвоните мне"],
   answer:"Оформлю обратный звонок — специалист перезвонит в удобное время.",
   actions:[{label:"📞 Заказать обратный звонок",fn:"showCallback",cl:"gold"}]},
  {kw:["документ","бланк","заявлен","скачать","памятк","согласие","жалоб","образец"],
   answer:"В личном кабинете во вкладке «Документы» можно скачать заявления, согласия и памятки.",
   actions:[{label:"👤 Открыть кабинет",fn:"openProfile",cl:"teal"}]},
  {kw:["оператор","живой","человек","написать","связат","чат с","позвонить","макс","max","мессенджер","max.ru"],
   answer:"Связаться с оператором можно через мессенджер Макс (max.ru), по телефону или email.",
   actions:[{label:"💬 Написать оператору",fn:"showLiveChat",cl:"blue"}]},
  {kw:["на дом","соцработ","соц работ","социальн работ","выезд","вызвать на дом","прийти домой","надомн"],
   answer:"Можно вызвать социального работника на дом — оформим заявку.",
   actions:[{label:"🏠 Соцработник на дом",fn:"showHomeWorker",cl:"teal"}]},
  {kw:["меропри","афиша","концерт","записаться на","мастер класс","мастер-класс","событие","ходьба"],
   answer:"Вот афиша ближайших мероприятий — на любое можно записаться.",
   actions:[{label:"🎟️ Мероприятия",fn:"showEvents",cl:"teal"}]}
];

function findServiceCategory(q){
  if(typeof servicesData==="undefined")return null;
  for(const cat of servicesData){
    const nameWords=asstNorm(cat.name).split(" ").filter(w=>w.length>3);
    if(nameWords.some(w=>q.includes(w)))return cat;
    for(const it of cat.items){
      const words=asstNorm(it.n).split(" ").filter(w=>w.length>4);
      if(words.some(w=>q.includes(w)))return cat;
    }
  }
  return null;
}

function asstName(){
  if(typeof clientName==="undefined")return "";
  const n=(clientName||"").trim();
  if(!n||n==="Гость"||n==="—")return "";
  const parts=n.split(/\s+/);
  return parts.length>=3?(parts[1]+" "+parts[2]):n;
}

function smallTalk(q){
  const nm=asstName();const hi=nm?(", "+nm):"";
  if(/(привет|здравству|добрый день|доброе утро|добрый вечер|доброго времени|здравий|приветствую)/.test(q))
    return{answer:`Здравствуйте${hi}! 👋 Я помощник центра «Гармония». Спросите про услуги, запись, льготы или мероприятия — подскажу нужный раздел.`,actions:[]};
  if(/(как дела|как ты|как поживаешь|че как|как сам)/.test(q))
    return{answer:`Спасибо${hi}, у меня всё хорошо — я всегда готов помочь 🙂 Чем могу быть полезен?`,actions:[]};
  if(/(спасибо|благодар|спс|пасибо)/.test(q))
    return{answer:`Пожалуйста${hi}! Обращайтесь в любое время 🌿`,actions:[]};
  if(/(пока|до свидан|досвидан|прощай|всего доброго|до встречи)/.test(q))
    return{answer:`Всего доброго${hi}! Берегите себя 🌿`,actions:[]};
  if(/(кто ты|что ты умеешь|что умеешь|ты бот|ты человек|чем поможешь|что ты можешь)/.test(q))
    return{answer:`Я — виртуальный помощник центра «Гармония». Подскажу услуги и цены, помогу записаться к специалисту, проверю право на льготы, расскажу о мероприятиях и отвечу на частые вопросы.`,actions:[
      {label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"},{label:"🧮 Калькулятор льгот",fn:"showEligibility",cl:"green"}]};
  return null;
}

function faqAnswer(q){
  if(typeof faqData==="undefined")return null;
  let best=null,bestScore=0;
  faqData.forEach(f=>{
    const words=asstNorm(f.q).split(" ").filter(w=>w.length>3);
    let score=0;words.forEach(w=>{if(q.includes(w))score++;});
    if(score>bestScore){bestScore=score;best=f;}
  });
  if(best&&bestScore>=2)return{answer:best.a,actions:[{label:"❓ Другие частые вопросы",fn:"showFAQ",cl:"outline"}]};
  return null;
}

function smartAsk(query){
  const q=asstNorm(query);

  const st=smallTalk(q);if(st)return st;

  let best=null,bestScore=0;
  ASST_INTENTS.forEach(it=>{
    let score=0;
    it.kw.forEach(k=>{if(q.includes(k))score+=k.length>=5?2:1;});
    if(score>bestScore){bestScore=score;best=it;}
  });
  if(best&&bestScore>=2)return{answer:best.answer,actions:best.actions};

  const fq=faqAnswer(q);if(fq)return fq;

  if(best&&bestScore>0)return{answer:best.answer,actions:best.actions};

  const hit=findServiceCategory(q);
  if(hit)return{answer:`Кажется, вам подойдёт раздел «${hit.name}». Открыть его?`,
    actions:[{label:`${hit.icon} ${hit.name}`,fn:"showCategory",arg:hit.id,cl:"teal"}]};

  const nm=asstName();
  return{answer:`Не уверен, что верно понял вопрос${nm?(", "+nm):""} 🙈 Вот основные разделы — выберите ближайший, или позвоните нам: <b>${typeof MAIN_PHONE!=="undefined"?MAIN_PHONE:""}</b>`,
    actions:[
      {label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"},
      {label:"📝 Записаться",fn:"showBooking",cl:"gold"},
      {label:"📍 Контакты",fn:"showContacts",cl:"outline"}
    ]};
}

function asstGo(fnName,arg){
  if(typeof window[fnName]==="function"){
    pushNav(showAssistant);
    showTyping(()=>{arg!==undefined?window[fnName](arg):window[fnName]();});
  }
}

const ASST_SUGGESTED=[
  "Как записаться к психологу?",
  "Сколько стоит уборка квартиры?",
  "Кому положено бесплатное обслуживание?",
  "Как заказать социальное такси?",
  "Прокат инвалидной коляски",
  "Контакты и режим работы"
];

function showAssistant(){
  clearActions();setNav(true);
  document.getElementById("searchBar").classList.add("gone");
  const nm=asstName();
  addMsg(`🤖 Здравствуйте${nm?", "+nm:""}! Я помогу сориентироваться. Спросите своими словами — например «как записаться к психологу» или «сколько стоит уборка». Или выберите частый вопрос ниже.`,true);
  setTimeout(()=>{
    clearActions();
    const wrap=document.createElement("div");wrap.className="asst-wrap";
    const chips=document.createElement("div");chips.className="asst-chips";
    ASST_SUGGESTED.forEach(qt=>{
      const b=document.createElement("button");b.type="button";b.className="asst-chip";b.textContent=qt;
      b.onclick=()=>askFlow(qt);
      chips.appendChild(b);
    });
    const row=document.createElement("div");row.className="asst-input-row";
    const inp=document.createElement("input");inp.type="text";inp.className="asst-input";
    inp.placeholder="Напишите свой вопрос…";inp.setAttribute("aria-label","Вопрос помощнику");
    const send=document.createElement("button");send.type="button";send.className="asst-send";
    send.setAttribute("aria-label","Отправить вопрос");send.textContent="➤";
    const go=()=>{const v=inp.value.trim();if(v){inp.value="";askFlow(v);}};
    send.onclick=go;
    inp.addEventListener("keydown",e=>{if(e.key==="Enter")go();});
    row.appendChild(inp);row.appendChild(send);
    wrap.appendChild(chips);wrap.appendChild(row);
    actionsEl.appendChild(wrap);
    inp.focus();
  },200);
}

function askFlow(query){
  addMsg(query,false);
  showTyping(()=>{
    const res=smartAsk(query);
    let html=res.answer;
    if(res.actions&&res.actions.length){
      html+='<div class="asst-actions">'+res.actions.map(a=>
        `<button type="button" class="act-btn ${a.cl||"teal"}" onclick="asstGo('${a.fn}'${a.arg!==undefined?","+a.arg:""})">${a.label}</button>`
      ).join("")+"</div>";
    }
    addMsg(html,true);
  });
}

function showNews(){
  clearActions();setNav(true);
  document.getElementById("searchBar").classList.add("gone");
  addMsg("📰 Новости и анонсы центра «Гармония»:",true);
  setTimeout(()=>{
    const list=document.createElement("div");list.className="news-list";
    const items=(typeof newsData!=="undefined")?newsData:[];
    if(!items.length){
      addMsg("Пока новостей нет. Загляните позже!",true);return;
    }
    items.forEach(n=>{
      const c=document.createElement("div");c.className="news-card";
      c.innerHTML=`<div class="news-top"><span class="news-tag">${n.tag||"Анонс"}</span><span class="news-date">${n.date||""}</span></div>`+
        `<div class="news-ttl">${n.title}</div><div class="news-text">${n.text}</div>`;
      list.appendChild(c);
    });
    actionsEl.appendChild(list);
  },200);
}

function showEligibility(){
  clearActions();setNav(true);
  document.getElementById("searchBar").classList.add("gone");
  addMsg("🧮 Проверим, положено ли вам бесплатное социальное обслуживание. Ответьте на несколько вопросов.<br><span class=\"note\">Это предварительная оценка — окончательное решение принимает специалист центра.</span>",true);

  const ask=(text,options)=>{
    showTyping(()=>{
      addMsg(text,true);
      clearActions();
      const g=document.createElement("div");g.className="elig-opts";
      options.forEach(o=>{
        const b=document.createElement("button");b.type="button";b.className="elig-btn";b.textContent=o.label;
        b.onclick=()=>{addMsg(o.label,false);clearActions();o.next();};
        g.appendChild(b);
      });
      actionsEl.appendChild(g);
    });
  };

  const verdict=(free,reason)=>{
    showTyping(()=>{
      clearActions();
      if(free){
        addMsg(`✅ <b>Скорее всего, вам положено бесплатное обслуживание.</b><br>${reason}<br><span class="note">Точное решение примет специалист после проверки документов.</span>`,true);
      }else{
        addMsg(`ℹ️ <b>Бесплатное обслуживание, вероятно, не предусмотрено.</b> Но вы можете пользоваться услугами на платной основе — со скидкой по карте «Морошка».<br>${reason}`,true);
      }
      const g=document.createElement("div");g.className="elig-opts";
      const b1=document.createElement("button");b1.type="button";b1.className="act-btn teal";b1.textContent="📝 Записаться к специалисту";
      b1.onclick=()=>{pushNav(showMainMenu);showTyping(showBooking);};
      const b2=document.createElement("button");b2.type="button";b2.className="act-btn outline";b2.textContent="📋 Посмотреть услуги";
      b2.onclick=()=>{pushNav(showMainMenu);showTyping(showServices);};
      g.appendChild(b1);g.appendChild(b2);actionsEl.appendChild(g);
    });
  };

  const askIncome=(reasonIfYes)=>{
    ask("Ваш среднедушевой доход ниже 1,5 прожиточного минимума по ЯНАО?",[
      {label:"Да, ниже",next:()=>verdict(true,reasonIfYes||"При доходе ниже 1,5 прожиточного минимума обслуживание предоставляется бесплатно.")},
      {label:"Нет / не знаю",next:()=>verdict(false,"При доходе выше 1,5 прожиточного минимума обслуживание обычно платное. Точные цифры подскажет специалист.")}
    ]);
  };
  const askAlone=()=>{
    ask("Вы проживаете одиноко (нет родственников, обязанных оказывать помощь)?",[
      {label:"Да, проживаю один(одна)",next:()=>askIncome("Одиноко проживающим пенсионерам с невысоким доходом обслуживание предоставляется бесплатно.")},
      {label:"Нет, есть близкие родственники",next:()=>askIncome()}
    ]);
  };
  const askAge=()=>{
    ask("Вам 65 лет или больше?",[
      {label:"Да, 65 и старше",next:()=>askAlone()},
      {label:"Нет, младше 65",next:()=>verdict(false,"Льгота для пенсионеров по возрасту обычно действует с 65 лет.")}
    ]);
  };

  ask("К какой категории вы относитесь?",[
    {label:"Ветеран Великой Отечественной войны",next:()=>verdict(true,"Ветеранам ВОВ социальное обслуживание предоставляется бесплатно.")},
    {label:"Инвалид I или II группы",next:()=>askIncome("Инвалидам I и II группы с доходом ниже 1,5 прожиточного минимума обслуживание бесплатное.")},
    {label:"Пенсионер по возрасту",next:()=>askAge()},
    {label:"Другое / не уверен(а)",next:()=>verdict(false,"Ваша ситуация не подходит под типовые льготы, но возможны индивидуальные основания — уточните у специалиста.")}
  ]);
}

function esiaLogin(){
  showToast("🔐 Скоро!");

}

function showCallback(){
  clearActions();setNav(true);
  document.getElementById("searchBar").classList.add("gone");
  addMsg("📞 Обратный звонок. Оставьте удобное время — специалист перезвонит вам.",true);
  setTimeout(()=>{
    const f=document.createElement("div");f.className="book-form";
    const phone=document.createElement("input");phone.type="tel";phone.className="book-inp";
    phone.value=(typeof clientPhone!=="undefined"&&clientPhone&&clientPhone!=="—")?clientPhone:"";
    phone.placeholder="+7 (___) ___-__-__";phone.setAttribute("aria-label","Телефон для звонка");
    const time=document.createElement("select");time.className="book-sel";time.setAttribute("aria-label","Удобное время");
    time.innerHTML='<option value="В рабочее время">В любое рабочее время</option><option value="Утром (9:00–12:00)">Утром (9:00–12:00)</option><option value="Днём (12:00–15:00)">Днём (12:00–15:00)</option><option value="После 15:00">После 15:00</option>';
    const topic=document.createElement("textarea");topic.className="fb-inp";topic.style.minHeight="64px";
    topic.placeholder="Тема обращения (необязательно)";topic.setAttribute("aria-label","Тема обращения");
    const send=document.createElement("button");send.type="button";send.className="book-send";send.textContent="📞 Заказать звонок";
    send.onclick=()=>{
      const ph=phone.value.trim();if(ph.replace(/\D/g,"").length<7){showToast("⚠️ Укажите телефон");return;}
      const body=`ОБРАТНЫЙ ЗВОНОК\nИмя: ${clientName}\nТелефон: ${ph}\nУдобное время: ${time.value}\nТема: ${topic.value||"—"}\nФилиал: г. ${currentCityName}`;
      window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent("Обратный звонок: "+clientName)}&body=${encodeURIComponent(body)}`;
      window.GarmoniyaDB?.saveOrder?.({clientName,clientPhone:ph,cityName:currentCityName,total:0,items:[{name:"Обратный звонок ("+time.value+")",qty:1,price:0}]});
      addMsg("✅ Заявка на звонок сформирована. Мы перезвоним в указанное время!",true);
      showToast("✅ Звонок заказан");
    };
    [["Телефон",phone],["Удобное время",time],["Тема",topic]].forEach(([lbl,el])=>{
      const fld=document.createElement("div");fld.className="book-field";
      const l=document.createElement("label");l.className="book-lbl";l.textContent=lbl;
      fld.appendChild(l);fld.appendChild(el);f.appendChild(fld);
    });
    f.appendChild(send);actionsEl.appendChild(f);
  },200);
}

function showHomeWorker(){
  clearActions();setNav(true);
  document.getElementById("searchBar").classList.add("gone");
  addMsg("🏠 Вызов социального работника на дом. Опишите, какая помощь нужна.",true);
  setTimeout(()=>{
    const f=document.createElement("div");f.className="book-form";
    const addr=document.createElement("input");addr.type="text";addr.className="book-inp";
    addr.placeholder="Адрес (улица, дом, квартира)";addr.setAttribute("aria-label","Адрес");
    const need=document.createElement("textarea");need.className="fb-inp";need.style.minHeight="80px";
    need.placeholder="Что требуется: покупка продуктов, уборка, сопровождение…";need.setAttribute("aria-label","Какая помощь нужна");
    const date=document.createElement("input");date.type="date";date.className="book-inp";date.setAttribute("aria-label","Желаемая дата");
    const tm=new Date();tm.setDate(tm.getDate()+1);date.min=tm.toISOString().split("T")[0];
    const send=document.createElement("button");send.type="button";send.className="book-send";send.textContent="🏠 Отправить заявку";
    send.onclick=()=>{
      if(!addr.value.trim()||!need.value.trim()){showToast("⚠️ Заполните адрес и описание");return;}
      const body=`ВЫЗОВ СОЦРАБОТНИКА НА ДОМ\nИмя: ${clientName}\nТелефон: ${clientPhone}\nАдрес: ${addr.value}\nЖелаемая дата: ${date.value||"по согласованию"}\nЧто требуется: ${need.value}\nФилиал: г. ${currentCityName}`;
      window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent("Соцработник на дом: "+clientName)}&body=${encodeURIComponent(body)}`;
      window.GarmoniyaDB?.saveOrder?.({clientName,clientPhone,cityName:currentCityName,total:0,items:[{name:"Соцработник на дом: "+need.value.slice(0,60),qty:1,price:0}]});
      addMsg("✅ Заявка на соцработника отправлена! С вами свяжутся для уточнения.",true);
      showToast("✅ Заявка отправлена");
    };
    [["Адрес",addr],["Желаемая дата",date],["Какая помощь нужна",need]].forEach(([lbl,el])=>{
      const fld=document.createElement("div");fld.className="book-field";
      const l=document.createElement("label");l.className="book-lbl";l.textContent=lbl;
      fld.appendChild(l);fld.appendChild(el);f.appendChild(fld);
    });
    f.appendChild(send);actionsEl.appendChild(f);
  },200);
}

function showEvents(){
  clearActions();setNav(true);
  document.getElementById("searchBar").classList.add("gone");
  addMsg("🎟️ Афиша мероприятий. Нажмите «Записаться» — мы подтвердим участие.",true);
  setTimeout(()=>{
    const list=document.createElement("div");list.className="news-list";
    const items=(typeof eventsData!=="undefined")?eventsData:[];
    if(!items.length){addMsg("Пока мероприятий нет.",true);return;}
    items.forEach(e=>{
      const c=document.createElement("div");c.className="event-card";
      c.innerHTML=`<div class="news-top"><span class="ev-date">🗓 ${e.date}</span><span class="ev-seats">мест: ${e.seats}</span></div>`+
        `<div class="news-ttl">${e.title}</div><div class="ev-place">📍 ${e.place}</div><div class="news-text">${e.desc}</div>`;
      const b=document.createElement("button");b.type="button";b.className="act-btn teal";b.style.marginTop="10px";
      b.textContent="✅ Записаться";b.onclick=()=>signupEvent(e.id);
      c.appendChild(b);list.appendChild(c);
    });
    actionsEl.appendChild(list);
  },200);
}
function signupEvent(id){
  const e=(typeof eventsData!=="undefined"?eventsData:[]).find(x=>x.id===id);if(!e)return;
  const body=`ЗАПИСЬ НА МЕРОПРИЯТИЕ\nМероприятие: ${e.title}\nКогда: ${e.date}\nМесто: ${e.place}\n\nУчастник: ${clientName}\nТелефон: ${clientPhone}\nФилиал: г. ${currentCityName}`;
  window.location.href=`mailto:${ORG_EMAIL}?subject=${encodeURIComponent("Запись на мероприятие: "+e.title)}&body=${encodeURIComponent(body)}`;
  window.GarmoniyaDB?.saveBooking?.({num:"МЕР-"+id,clientName,clientPhone,cityName:currentCityName,dept:"Мероприятие",spec:e.title,visitDate:e.date,visitTime:"",comment:e.place});
  addMsg(`✅ Заявка на участие в «${e.title}» отправлена!`,true);
  showToast("✅ Вы записаны");
}
