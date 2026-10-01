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
const PLACE_TYPES=[["hospital","🏥","Больница"],["clinic","🩺","Поликлиника"],["pharmacy","💊","Аптека"],["mfc","📄","МФЦ"],
  ["sfr","💰","Соцфонд"],["social","🏢","Соцучреждение"],["other","📍","Другое"]];
function placeIcon(type){const t=PLACE_TYPES.find(function(x){return x[0]===type;});return t?t[1]:"📍";}
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
  const car=tx.car;
  const state=taxiRideState(tx);
  const when=rideDateHuman(tx.date,tx.time);
  if(!car){
    return '<div class="car-card car-none"><div class="car-ico" aria-hidden="true">🚕</div><div class="car-main">'+
      '<b>Машину назначит диспетчер</b><span>Модель и госномер сообщат при подтверждении поездки.</span>'+
      '<span class="car-eta" data-eta="'+tx.num+'">'+(state.eta||("Подача "+when))+'</span></div></div>';
  }
  return '<div class="car-card'+(state.key==="now"?" car-now":"")+'">'+
    '<div class="car-ico" aria-hidden="true">'+(car.wheelchair?"🚐":"🚗")+'</div>'+
    '<div class="car-main"><span class="car-lbl">Ваша машина'+(tx.carConfirmed?"":" · предварительно")+'</span>'+
      '<b class="car-model">'+car.model+(car.color?' <em>'+car.color+'</em>':'')+'</b>'+
      (car.plate?plateHtml(car.plate):'<span class="car-noplate">госномер сообщит диспетчер</span>')+
      (car.wheelchair?'<span class="car-tag">♿ Для колясок</span>':'')+
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
