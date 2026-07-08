
function asstNorm(s){
  return (s||"").toLowerCase().replace(/ё/g,"е").replace(/[^a-zа-я0-9 ]/gi," ").replace(/\s+/g," ").trim();
}

const ASST_INTENTS=[
  // ═══ Прямые команды открытия разделов ═══
  {kw:["открой главн","на главную","домой","в меню","главное меню","вернись на главн"],
   answer:"Открываю главную страницу.",actions:[{label:"🏠 Главная",fn:"showMainMenu",cl:"teal"}]},
  {kw:["открой прейскурант","покажи прейскурант","открой услуги","покажи услуги","весь прейскурант","список услуг","все услуги","каталог услуг"],
   answer:"Открываю полный прейскурант услуг.",actions:[{label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"}]},
  {kw:["открой запись","хочу записаться","запиши меня","открой форму записи","запись к специалисту"],
   answer:"Открываю форму записи к специалисту.",actions:[{label:"📝 Записаться",fn:"showBooking",cl:"gold"}]},
  {kw:["открой сотрудник","покажи сотрудник","список сотрудник","кто работает в центре","весь персонал"],
   answer:"Открываю справочник сотрудников по отделениям.",actions:[{label:"👥 Сотрудники",fn:"showStaff",cl:"teal"}]},
  {kw:["открой корзин","моя корзина","что в корзине","покажи корзину"],
   answer:"Открываю корзину заявки.",actions:[{label:"🛒 Открыть корзину",fn:"openCart",cl:"gold"}]},
  {kw:["мои заявки","мои записи","история заявок","история записей","статус заявки","статус записи","мои талоны"],
   answer:"Открываю ваши заявки и записи — там же можно отменить запись или повторить заявку.",actions:[{label:"📋 Мои заявки",fn:"openOrdersPanel",cl:"teal"}]},
  {kw:["открой кабинет","личный кабинет","мой профиль","мои данные","изменить данные","моё избранное","загрузить фото","фото профиля"],
   answer:"Открываю личный кабинет — там данные, избранное, документы и настройки.",actions:[{label:"👤 Личный кабинет",fn:"openProfilePanel",cl:"teal"}]},
  {kw:["открой новост","что нового в центре","покажи анонсы"],
   answer:"Вот новости и анонсы центра.",actions:[{label:"📰 Новости",fn:"showNews",cl:"teal"}]},
  {kw:["открой мероприят","афиша событий","что за мероприятия"],
   answer:"Открываю афишу мероприятий.",actions:[{label:"🎟️ Мероприятия",fn:"showEvents",cl:"teal"}]},
  {kw:["открой контакт","адрес центра","как до вас добраться","где вы находитесь","где находится центр"],
   answer:"Открываю контакты филиала.",actions:[{label:"📍 Контакты",fn:"showContacts",cl:"teal"}]},
  {kw:["открой вопросы","частые вопросы","открой faq"],
   answer:"Открываю частые вопросы и ответы.",actions:[{label:"❓ Вопросы и ответы",fn:"showFAQ",cl:"outline"}]},

  // ═══ Тематические намерения (категории — динамический поиск по названию) ═══
  {kw:["записа","запис","талон","прием","приём","к специалист","к врач","на прием"],
   answer:"Чтобы записаться к специалисту, выберите отделение, специалиста, дату и время. Открываю форму записи 👇",
   actions:[{label:"📝 Записаться к специалисту",fn:"showBooking",cl:"gold"}]},
  {kw:["психолог","депресс","тяжело","трудно","стресс","тревог","одинок","плохо на душе","поддержк","грустно","переживан","не справляюсь"],
   answer:"Понимаю, это непросто 💛 Психологическую помощь можно получить очно или экстренно по телефону. Если ситуация острая — есть экстренная линия прямо сейчас.",
   actions:[{label:"🆘 Экстренная помощь",fn:"showEmergency",cl:"red"},{label:"📝 Записаться к психологу",fn:"showBooking",cl:"gold"}]},
  {kw:["убор","помыть","помой","мытье","мытьё","окна","полы","пыль","чисто","прибрат"],
   answer:"Уборкой и мытьём занимается раздел «Чистка и уборка жилых помещений».",
   hint:["чистке и уборке","уборке жилых"]},
  {kw:["такси","довез","доехать","отвез","перевоз","транспорт","до больниц","до поликлин"],
   answer:"Поездки выполняет «Социальное такси» — с сопровождением или без, по заявке за 1 рабочий день.",
   hint:["перевозке на автомобильном"]},
  {kw:["сиделк","няня","няню","присмотр детьми","посидеть с реб"],
   answer:"Услуги по присмотру и уходу — в разделе «Услуги сиделки и няни».",
   hint:["услуги сиделки"]},
  {kw:["коляск","ходунк","кровать медицин","костыл","трость","прокат","матрац противопролеж"],
   answer:"Технические средства можно взять напрокат: коляски, ходунки, кровати и др.",
   hint:["прокату предметов"]},
  {kw:["логопед","заика","коррекц","развит реб","дефектолог"],
   answer:"Логопед, коррекционные и развивающие занятия — в разделе «Педагогические услуги».",
   hint:["педагогические услуги"]},
  {kw:["продукт","лекарств","аптек","доставк","купить","покупк","оплат жку","коммунал"],
   answer:"Покупка продуктов, лекарств, оплата ЖКУ и сопровождение — в «Дополнительных социальных услугах».",
   hint:["дополнительные социальные"]},
  {kw:["стирк","глажк","погладить","постират","химчист"],
   answer:"Стирка, глажка и химчистка — отдельный раздел прейскуранта.",
   hint:["стирке","химической чистке"]},
  {kw:["цена","стоит","стоимость","прайс","прейскур","сколько","тариф"],
   answer:"Все услуги и цены собраны в прейскуранте. Можно листать категории или искать по названию.",
   actions:[{label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"}]},
  {kw:["бесплат","льгот","положено","имею право","субсид","малоимущ"],
   answer:"У нас пока нет отдельного калькулятора льгот — но специалист по социальной работе подробно расскажет о ваших правах на приёме или по телефону.",
   actions:[{label:"📍 Контакты центра",fn:"showContacts",cl:"teal"},{label:"👥 Сотрудники",fn:"showStaff",cl:"outline"}]},
  {kw:["морошк","скидк","карт жител","единая карт"],
   answer:"Карта «Морошка» даёт скидку на услуги центра. Включите тумблер в шапке — цены в прейскуранте сразу пересчитаются.",
   actions:[{label:"🍊 Карта Морошка",fn:"showMoroshkaInfo",cl:"gold"}]},
  {kw:["телефон","адрес","email","почт","связат","позвонить","как найти","режим работ","часы работ","график","во сколько откр","до скольки работ"],
   answer:"Адрес, телефон, email и режим работы филиала — в разделе «Контакты».",
   actions:[{label:"📍 Контакты центра",fn:"showContacts",cl:"teal"}]},
  {kw:["сотрудник","специалист","кто работает","персонал","доб ","добавочн"],
   answer:"Список сотрудников по отделениям с контактами — в разделе «Сотрудники».",
   actions:[{label:"👥 Сотрудники",fn:"showStaff",cl:"teal"}]},
  {kw:["новост","анонс","объявлен","что нового","свеж"],
   answer:"Свежие новости и объявления центра 👇",
   actions:[{label:"📰 Новости",fn:"showNews",cl:"teal"}]},
  {kw:["массаж","оздоров","физкультур","лфк","тренаж","ингаляц","залах лфк"],
   answer:"Занятия в залах ЛФК, тренажёрном и спортивном — отдельный раздел прейскуранта.",
   hint:["залах лфк","тренажерном"]},
  {kw:["перезвон","обратный звонок","перезвоните","свяжитесь","позвоните мне"],
   answer:"Оформлю обратный звонок — специалист перезвонит в удобное время.",
   actions:[{label:"📞 Заказать обратный звонок",fn:"showCallback",cl:"gold"}]},
  {kw:["документ","бланк","заявлен на обслуж","скачать бланк","памятк","согласие на обработку"],
   answer:"В личном кабинете во вкладке «Документы» можно скачать заявления, согласия и памятки.",
   actions:[{label:"👤 Открыть кабинет",fn:"openProfilePanel",cl:"teal"}]},
  {kw:["жалоб","недоволен","плохое обслуживан","претензи","некачественн"],
   answer:"Жалобу или предложение можно оставить через бланк обращения в документах, либо напрямую написать оператору.",
   actions:[{label:"📁 Бланк обращения",fn:"openProfilePanel",cl:"teal"},{label:"💬 Написать оператору",fn:"showLiveChat",cl:"blue"}]},
  {kw:["оценит работу","оставить отзыв","поставить оценку","как оценить","обратная связь"],
   answer:"Буду рад вашей оценке! Форма обратной связи откроется ниже.",
   actions:[{label:"⭐ Оставить отзыв",fn:"showFeedback",cl:"gold"}]},
  {kw:["оператор","живой","человек","написать","связат","чат с","позвонить","макс","max","мессенджер","max.ru"],
   answer:"Связаться с оператором можно через мессенджер Макс (max.ru), по телефону или email.",
   actions:[{label:"💬 Написать оператору",fn:"showLiveChat",cl:"blue"}]},
  {kw:["на дом","соцработ","соц работ","социальн работ","выезд специалист","вызвать на дом","прийти домой","надомн"],
   answer:"Можно вызвать социального работника на дом — оформим заявку.",
   actions:[{label:"🏠 Соцработник на дом",fn:"showHomeWorker",cl:"teal"}]},
  {kw:["меропри","афиша","концерт","записаться на событ","мастер класс","мастер-класс","событие"],
   answer:"Вот афиша ближайших мероприятий — на любое можно записаться.",
   actions:[{label:"🎟️ Мероприятия",fn:"showEvents",cl:"teal"}]},
  {kw:["праздник","день рождения","юбилей","детский праздник","семейный праздник"],
   answer:"Организацией детских и семейных праздников занимается отдельный раздел прейскуранта.",
   hint:["детских и семейных праздник"]},
  {kw:["фотограф","фотосесси","профессиональное фото"],
   answer:"Услуги фотографа есть в прейскуранте отдельным разделом.",
   hint:["области фотографии"]},
  {kw:["видеоролик","видео сним","видеосъемк","видеосъёмк"],
   answer:"Создание видеороликов — отдельная услуга прейскуранта.",
   hint:["созданию видеороликов"]},
  {kw:["ремонт одежд","зашить","подшить","молни","пуговиц"],
   answer:"Мелкий ремонт одежды и текстильных изделий — отдельный раздел прейскуранта.",
   hint:["ремонту одежды"]},
  {kw:["ремонт мебел","почин мебел","стул","табурет","табуретк"],
   answer:"Мелкий ремонт малогабаритной мебели есть в прейскуранте.",
   hint:["малогабаритной мебели"]},
  {kw:["готовить","приготовить","обед сварить","еду сготов","приготовление пищ"],
   answer:"Приготовление пищи на дому — отдельная услуга.",
   hint:["приготовлению пищевых"]},
  {kw:["гигиен","помыться","душ принять","ванн","подстричь","стрижк"],
   answer:"Гигиенические процедуры — отдельный раздел прейскуранта.",
   hint:["гигиенические процедуры"]},
  {kw:["юрист","юридическ","консультац юрист","составить иск","исковое"],
   answer:"Правовые услуги — консультации юриста, составление документов.",
   hint:["правовые услуги"]},
  {kw:["распечатать","ксерокс","скан","копи документ"],
   answer:"Копирование и печать документов — отдельная услуга.",
   hint:["копированию и печатанию"]},
  {kw:["животн","собак","кошк","питомц","выгул"],
   answer:"Уход за домашними животными доступен в некоторых филиалах — проверьте раздел прейскуранта.",
   hint:["уход за домашними животными"]},
  {kw:["гостиниц","переночевать","временное проживан","краткосрочн проживан"],
   answer:"Гостиничные услуги (краткосрочное проживание) доступны в некоторых филиалах.",
   hint:["гостиничные услуги"]},
  {kw:["полуфабрикат","заморозк еды"],
   answer:"Изготовление полуфабрикатов есть в некоторых филиалах.",
   hint:["изготовление полуфабрикатов"]},
  {kw:["салат","питание готовое","доставка питания"],
   answer:"Услуги по предоставлению питания и салаты доступны в некоторых филиалах.",
   hint:["предоставлению питания","салаты"]},

  // ═══ Личный кабинет и возможности приложения ═══
  {kw:["избранн","звёздочк","звездочк","отмеченные услуги"],
   answer:"Избранные услуги отмечаются звёздочкой ★ в прейскуранте и хранятся в личном кабинете.",
   actions:[{label:"⭐ Открыть избранное",fn:"openProfilePanel",cl:"teal"}]},
  {kw:["сменить пользовател","выйти из аккаунт","другой получатель","профили получателей","добавить члена семьи"],
   answer:"Переключать профили получателей (например, для родственников) можно в личном кабинете.",
   actions:[{label:"👤 Личный кабинет",fn:"openProfilePanel",cl:"teal"}]},
  {kw:["тёмная тема","темная тема","светлая тема","ночной режим"],
   answer:"Тёмную тему можно включить кнопкой 🌙 в верхней панели или в настройках личного кабинета.",
   actions:[{label:"👤 Настройки",fn:"openProfilePanel",cl:"teal"}]},
  {kw:["размер шрифта","крупный шрифт","увеличить текст","плохо вижу текст"],
   answer:"Размер шрифта регулируется кнопками «А−» / «А+» в верхней панели.",
   actions:[]},
  {kw:["сменить язык","на английском","на английский","change language","другой язык"],
   answer:"Язык интерфейса можно сменить в выпадающем списке рядом с выбором филиала вверху экрана.",
   actions:[]},
  {kw:["сменить филиал","другой город","изменить филиал","переключить филиал","другой филиал"],
   answer:"Чтобы сменить филиал, выберите нужный город в выпадающем списке вверху экрана — данные, услуги и сотрудники обновятся автоматически.",
   actions:[]},
  {kw:["сколько филиалов","какие филиалы","другие города","другие филиалы","есть ли у вас в","работаете ли вы в","филиал в другом городе"],
   answer:"Центр «Гармония» работает в пяти городах ЯНАО: Губкинский, Муравленко, Ноябрьск, Тарко-Сале и посёлок Уренгой. Выбрать филиал можно в выпадающем списке вверху экрана.",
   actions:[]},

  // ═══ Директор / руководство (динамический поиск по должности) ═══
  {kw:["кто директор","кто заведующий","кто руководитель","директор центра"],
   answer:"__STAFF_LOOKUP__директор"},
  {kw:["кто психолог","найти психолога","какой психолог работает"],
   answer:"__STAFF_LOOKUP__психолог"},
  {kw:["кто юрист","юрисконсульт кто"],
   answer:"__STAFF_LOOKUP__юрисконсульт"},

  // ═══ Практические вопросы ═══
  {kw:["сколько ждать заявку","как быстро обработают","срок рассмотрения","когда ответят"],
   answer:"Заявки обычно обрабатываются в течение 1 рабочего дня. Специалист свяжется с вами по указанному телефону.",actions:[]},
  {kw:["как отменить запись","отменить талон","передумал записыв"],
   answer:"Отменить запись можно в разделе «Мои заявки» — кнопка «Отменить» рядом с записью.",
   actions:[{label:"📋 Мои заявки",fn:"openOrdersPanel",cl:"teal"}]},
  {kw:["как повторить заявку","заказать снова","та же услуга ещё раз"],
   answer:"Повторить заявку можно в разделе «Мои заявки» — кнопка «Повторить» добавит те же услуги в корзину.",
   actions:[{label:"📋 Мои заявки",fn:"openOrdersPanel",cl:"teal"}]},
  {kw:["какие документы нужны","что взять с собой","паспорт нужен","снилс нужен"],
   answer:"Обычно нужны паспорт и СНИЛС. Точный список для вашей услуги уточнит специалист по телефону.",
   actions:[{label:"📍 Контакты",fn:"showContacts",cl:"teal"}]},
  {kw:["какое сегодня число","который час","какой сегодня день","текущая дата"],
   answer:"__DATETIME__"},
];


const BRANCH_NAMES={gubkin:"Губкинский",muravlenko:"Муравленко",noyabrsk:"Ноябрьск",tarko:"Тарко-Сале",urengoy:"Уренгой"};

function findServiceCategory(q){
  if(typeof servicesData==="undefined"||!servicesData.length)return null;
  var best=null,bestScore=0;
  servicesData.forEach(function(cat){
    var nameWords=asstNorm(cat.name).split(" ").filter(function(w){return w.length>3;});
    var score=0;
    nameWords.forEach(function(w){if(q.includes(w))score+=1;});
    cat.items.forEach(function(it){
      var words=asstNorm(it.n).split(" ").filter(function(w){return w.length>4;});
      words.forEach(function(w){if(q.includes(w))score+=2;});
    });
    if(score>bestScore){bestScore=score;best=cat;}
  });
  return bestScore>=2?best:null;
}

function findCatByHint(hints){
  if(typeof servicesData==="undefined"||!servicesData.length)return null;
  for(var i=0;i<hints.length;i++){
    var h=asstNorm(hints[i]);
    for(var j=0;j<servicesData.length;j++){
      var cat=servicesData[j];
      if(asstNorm(cat.name).includes(h))return cat;
    }
  }
  return null;
}

function findStaffByPosition(hint){
  if(typeof staffData==="undefined"||!staffData.length)return null;
  var h=asstNorm(hint);
  for(var i=0;i<staffData.length;i++){
    var p=staffData[i];
    if(asstNorm(p.pos).includes(h))return p;
  }
  return null;
}

function findServiceAcrossBranches(q){
  if(typeof branchContent==="undefined")return null;
  var results=[];
  Object.keys(branchContent).forEach(function(cityKey){
    if(cityKey===currentCity)return;
    var branch=branchContent[cityKey];
    if(!branch||!branch.services||!branch.services.length)return;
    var bestCat=null,bestScore=0,bestItem=null;
    branch.services.forEach(function(cat){
      cat.items.forEach(function(it){
        var words=asstNorm(it.n).split(" ").filter(function(w){return w.length>4;});
        var score=0;
        words.forEach(function(w){if(q.includes(w))score+=2;});
        if(score>bestScore){bestScore=score;bestCat=cat;bestItem=it;}
      });
    });
    if(bestScore>=2)results.push({city:cityKey,cityName:BRANCH_NAMES[cityKey]||cityKey,cat:bestCat,item:bestItem});
  });
  return results.length?results[0]:null;
}

function findStaffAcrossBranches(q){
  if(typeof branchContent==="undefined")return null;
  var found=[];
  Object.keys(branchContent).forEach(function(cityKey){
    if(cityKey===currentCity)return;
    var branch=branchContent[cityKey];
    if(!branch||!branch.staff||!branch.staff.length)return;
    branch.staff.forEach(function(p){
      var nameWords=asstNorm(p.name).split(" ").filter(function(w){return w.length>2;});
      if(nameWords.some(function(w){return q.includes(w);})){
        found.push({city:cityKey,cityName:BRANCH_NAMES[cityKey]||cityKey,person:p});
      }
    });
  });
  return found.length?found[0]:null;
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
  if(/(привет|здравству|добрый день|доброе утро|добрый вечер|доброго времени|здравий|приветствую|хай\b)/.test(q))
    return{answer:`Здравствуйте${hi}! 👋 Я помощник центра «Гармония». Спросите про услуги, запись, сотрудников или мероприятия — подскажу и открою нужный раздел.`,actions:[]};
  if(/(как дела|как ты|как поживаешь|че как|как сам|как настроение)/.test(q))
    return{answer:`Спасибо${hi}, у меня всё хорошо — я всегда готов помочь 🙂 А у вас как дела? Чем могу быть полезен?`,actions:[]};
  if(/(спасибо|благодар|спс|пасибо|отлично|супер|класс|здорово|хорошо получилось)/.test(q))
    return{answer:`Пожалуйста${hi}! Рад был помочь 🌿 Обращайтесь в любое время.`,actions:[]};
  if(/(пока|до свидан|досвидан|прощай|всего доброго|до встречи|увидимся)/.test(q))
    return{answer:`Всего доброго${hi}! Берегите себя 🌿`,actions:[]};
  if(/(кто ты|что ты умеешь|что умеешь|ты бот|ты человек|чем поможешь|что ты можешь|расскажи о себе|твои возможности)/.test(q))
    return{answer:`Я — виртуальный помощник центра «Гармония». Подскажу услуги и цены, помогу записаться к специалисту, найти сотрудника, расскажу о мероприятиях и отвечу на частые вопросы. Просто спрашивайте своими словами!`,actions:[
      {label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"},{label:"📝 Записаться",fn:"showBooking",cl:"gold"}]};
  if(/(извини|прости|сорри)/.test(q))
    return{answer:`Ничего страшного${hi}! Всё в порядке 😊 Чем могу помочь?`,actions:[]};
  if(/(люблю тебя|ты хороший|ты молодец|ты классный|ты лучший)/.test(q))
    return{answer:`Очень приятно это слышать${hi}! 🌿 Стараюсь быть полезным. Чем ещё помочь?`,actions:[]};
  if(/(шутк|анекдот|рассмеши|развесели)/.test(q))
    return{answer:`Я больше по серьёзным вопросам — помогаю с услугами и записью 😊 Но обещаю, что с заявками у нас всё быстро и без бюрократии!`,actions:[]};
  if(/(не понимаешь|тупой|глупый бот|бесполезн)/.test(q))
    return{answer:`Прошу прощения, если запутал${hi}. Попробуйте переформулировать вопрос, или загляните в раздел «Вопросы и ответы» — там собраны частые темы.`,actions:[{label:"❓ Вопросы и ответы",fn:"showFAQ",cl:"outline"}]};
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

function findCatAcrossBranches(hints){
  if(typeof branchContent==="undefined")return null;
  for(var ci=0;ci<hints.length;ci++){
    var h=asstNorm(hints[ci]);
    var cityKeys=Object.keys(branchContent);
    for(var k=0;k<cityKeys.length;k++){
      var cityKey=cityKeys[k];
      if(cityKey===currentCity)continue;
      var branch=branchContent[cityKey];
      if(!branch||!branch.services||!branch.services.length)continue;
      for(var j=0;j<branch.services.length;j++){
        var cat=branch.services[j];
        if(asstNorm(cat.name).includes(h))return{city:cityKey,cityName:BRANCH_NAMES[cityKey]||cityKey,cat:cat};
      }
    }
  }
  return null;
}

function resolveIntentResult(it){
  // Спец-маркеры в ответе
  if(it.answer==="__DATETIME__"){
    const now=new Date();
    const dateStr=now.toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
    const timeStr=now.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"});
    return{answer:`Сегодня ${dateStr}, сейчас ${timeStr}.`,actions:[]};
  }
  if(it.answer&&it.answer.indexOf("__STAFF_LOOKUP__")===0){
    const posHint=it.answer.replace("__STAFF_LOOKUP__","");
    const person=findStaffByPosition(posHint);
    if(person){
      const ph=person.ext?MAIN_PHONE+" доб. "+person.ext:MAIN_PHONE;
      return{answer:`${posHint.charAt(0).toUpperCase()+posHint.slice(1)} в филиале «${currentCityName}»: <b>${person.name}</b>${person.email?"<br>✉️ "+person.email:""}<br>📞 ${ph}`,
        actions:[{label:"👥 Все сотрудники",fn:"showStaff",cl:"teal"}]};
    }
    return{answer:`В филиале «${currentCityName}» такая должность сейчас не указана в справочнике. Уточните на общем телефоне центра.`,
      actions:[{label:"📍 Контакты",fn:"showContacts",cl:"teal"},{label:"👥 Сотрудники",fn:"showStaff",cl:"outline"}]};
  }
  // Действия с hint — резолвим категорию динамически (безопасно для любого филиала)
  if(it.hint){
    const cat=findCatByHint(it.hint);
    if(cat)return{answer:it.answer,actions:[{label:`${cat.icon} ${cat.name}`,fn:"showCategory",arg:cat.id,cl:"teal"}]};
    const cross=findCatAcrossBranches(it.hint);
    if(cross)return{answer:it.answer+` В филиале «${currentCityName}» этой услуги нет, но она есть в филиале <b>${cross.cityName}</b>. Переключиться?`,
      actions:[{label:"🏢 Перейти в "+cross.cityName,fn:"switchBranchByKey",arg:"'"+cross.city+"'",cl:"teal"}]};
    return{answer:it.answer+" В вашем филиале эта категория сейчас недоступна — полный список в прейскуранте.",
      actions:[{label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"}]};
  }
  return{answer:it.answer,actions:it.actions||[]};
}

function smartAsk(query){
  const q=asstNorm(query);

  const st=smallTalk(q);if(st)return st;

  let best=null,bestScore=0;
  ASST_INTENTS.forEach(it=>{
    let score=0;
    it.kw.forEach(k=>{const nk=asstNorm(k);if(q.includes(nk))score+=Math.max(1,nk.length);});
    if(score>bestScore){bestScore=score;best=it;}
  });
  if(best&&bestScore>=2)return resolveIntentResult(best);

  const hit=findServiceCategory(q);
  if(hit)return{answer:`Кажется, вам подойдёт раздел «${hit.name}». Открыть его?`,
    actions:[{label:`${hit.icon} ${hit.name}`,fn:"showCategory",arg:hit.id,cl:"teal"}]};

  if(best&&bestScore>0)return resolveIntentResult(best);

  const fq=faqAnswer(q);if(fq)return fq;

  // Честный кросс-филиальный поиск — если не нашли в текущем филиале
  const crossSvc=findServiceAcrossBranches(q);
  if(crossSvc){
    const priceStr=crossSvc.item.p+" ₽"+(crossSvc.item.m!=null?" (по «Морошке» "+crossSvc.item.m+" ₽)":"");
    return{answer:`В филиале «${currentCityName}» такой услуги не нашлось. Но в филиале <b>${crossSvc.cityName}</b> есть услуга «${crossSvc.item.n}» — ${priceStr}. Хотите переключиться на этот филиал?`,
      actions:[{label:"🏢 Перейти в "+crossSvc.cityName,fn:"switchBranchByKey",arg:"'"+crossSvc.city+"'",cl:"teal"}]};
  }
  const crossStaff=findStaffAcrossBranches(q);
  if(crossStaff){
    return{answer:`В филиале «${currentCityName}» такого сотрудника нет, но в филиале <b>${crossStaff.cityName}</b> работает ${crossStaff.person.name} (${crossStaff.person.pos}). Переключиться на этот филиал?`,
      actions:[{label:"🏢 Перейти в "+crossStaff.cityName,fn:"switchBranchByKey",arg:"'"+crossStaff.city+"'",cl:"teal"}]};
  }

  const nm=asstName();
  return{answer:`Не уверен, что верно понял вопрос${nm?(", "+nm):""} 🙈 Вот основные разделы — выберите ближайший, или позвоните нам: <b>${typeof MAIN_PHONE!=="undefined"?MAIN_PHONE:""}</b>`,
    actions:[
      {label:"📋 Прейскурант услуг",fn:"showServices",cl:"teal"},
      {label:"📝 Записаться",fn:"showBooking",cl:"gold"},
      {label:"📍 Контакты",fn:"showContacts",cl:"outline"}
    ]};
}

function switchBranchByKey(cityKey){
  selectCity(cityKey);
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
  addMsg(`🤖 Здравствуйте${nm?", "+nm:""}! Я помогу сориентироваться. Спросите своими словами — например «как записаться к психологу» или «сколько стоит уборка». Задайте вопрос.`,true);
  setTimeout(()=>{
    clearActions();
    const wrap=document.createElement("div");wrap.className="asst-wrap";
    const chips=document.createElement("div");chips.className="gone";
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
  showToast("🔐 Скоро...");

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
