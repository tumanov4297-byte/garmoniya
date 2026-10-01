/* ═══════════════════════════════════════════════════════════════════
   botbrain.js — «мозг» чат-бота «Гармония».

   Подключается после chatflow.js и становится первым обработчиком
   сообщений. Порядок разбора:
     1. идущий диалог (такси/заявка) — продолжаем его, но «привет»,
        «спасибо» и «отмена» не принимаются за адрес или ФИО;
     2. разговорные фразы целиком: привет, как дела, спасибо, пока, да/нет…
        Приветствие в начале длинной фразы отрезается, остальное разбирается;
     3. срочные ситуации (плохо, болит, не хочу жить) — 112 и экстренная помощь;
     4. справка о центре: контакты, режим работы, сотрудники по должности,
        «Морошка», льготы, как оформить/отменить, филиалы, настройки;
     5. услуги: точный поиск по прейскуранту филиала с учётом окончаний,
        опечаток и разговорных синонимов («коляска», «шея», «госуслуги»…).
        Рассказ об услуге собирается ТОЛЬКО из данных прейскуранта —
        цена, «Морошка», длительность, формат, возраст, кто проводит,
        как записаться. Ничего не выдумывается;
     6. нет в этом филиале — ищем в других; нет нигде — честно говорим
        и даём телефон. Случайную услугу «наугад» бот больше не предлагает.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if (!window.CFX) return;
  var C = window.CFX, btn = C.btn, row = C.row, esc = C.esc, money = C.money;

  /* ─────────── Текст ─────────── */
  function norm(s){
    return String(s||"").toLowerCase().replace(/ё/g,"е")
      .replace(/[«»"“”„'`’]/g," ").replace(/[^a-zа-я0-9\s\-]/g," ")
      .replace(/-/g," ").replace(/\s+/g," ").trim();
  }
  var ENDS = ["ениями","ением","ировать","ения","ение","ений","ании","ание","ания","ться","тся","ить","ать","ять","еть","уть",
              "иями","ями","ами","ого","его","ому","ему","ыми","ими","ией","иях","ость","ости",
              "ых","их","ой","ей","ий","ый","ая","яя","ое","ее","ые","ие","ам","ям","ом","ем",
              "ую","юю","ов","ев","ах","ях","ия","ья","ье","ии","а","я","о","е","и","ы","у","ю","ь","й"];
  function stem(w){
    if (w.length <= 4) return w;
    for (var i = 0; i < ENDS.length; i++) {
      var e = ENDS[i];
      if (w.length - e.length >= 4 && w.slice(-e.length) === e) return w.slice(0, -e.length);
    }
    return w;
  }
  function lev(a, b){
    if (Math.abs(a.length - b.length) > 2) return 9;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++)
        cur[j] = Math.min(prev[j] + 1, cur[j-1] + 1, prev[j-1] + (a[i-1] === b[j-1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function plural(n, f){ var a=n%10,b=n%100; return (a===1&&b!==11)?f[0]:(a>=2&&a<=4&&(b<10||b>=20))?f[1]:f[2]; }
  function userName(){ return (typeof asstName === "function") ? asstName() : ""; }
  function hi(){ var n = userName(); return n ? ", " + n : ""; }
  function cityName(){ return (typeof currentCityName !== "undefined" && currentCityName) ? currentCityName : ""; }
  function cd(){ return (typeof cityData !== "undefined" && cityData[currentCity]) ? cityData[currentCity] : {}; }
  function svcData(){ return (typeof servicesData !== "undefined" && servicesData) ? servicesData : []; }

  /* Переход на экран из чата: выходим из полноэкранного чата и запоминаем возврат. */
  function go(fn){
    try{
      if (typeof exitAssistantFullscreenMode === "function") exitAssistantFullscreenMode();
      if (typeof pushNav === "function" && typeof openAssistantFullscreen === "function")
        pushNav(function(){ openAssistantFullscreen(); });
    }catch(e){}
    setTimeout(fn, 30);
    return "";
  }
  function navBtn(label, fn, cl){ return btn(label, function(){ return go(fn); }, { cl: cl || "outline" }); }

  /* ─────────── Слова, которые не несут смысла для поиска услуги ─────────── */
  var STOP = {};
  ("а и или но да нет не ни же ли бы то это этот эта эти тот там тут здесь вот как какой какая какое какие каков " +
   "что чем чего кто кому где куда когда зачем почему сколько стоит стоят стоимость цена цены цену ценник прайс " +
   "у в во на по с со к ко о об обо от до за из для при про над под без через мне меня мной мы нам нас вы вам вас " +
   "ты тебя тебе я он она они их его ее мой моя мое мои ваш ваша ваше ваши свой своя наш наша " +
   "есть был была было будет можно нужно надо нужен нужна нужны хочу хотим хотел хотела хотелось бы " +
   "пожалуйста подскажите подскажи скажите скажи расскажите расскажи покажи покажите узнать интересует интересно " +
   "услуга услуги услугу услуг сервис вариант варианты " +
   "записаться записать запиши запишите запись записи заказать закажи заказ оформить оформи заявка заявку заявки " +
   "получить сделать сделайте делаете делают проводите проводят оказываете предоставляете " +
   "имеется имеются бывает бывают также тоже еще ещё уже очень просто все всё весь вся " +
   "такое такой такая подробнее подробно информация инфо про какой-нибудь какую каким " +
   "длится длительность продолжительность времени минут сколько-то ведет ведёт проводит " +
   "лет год года годам годика месяцев месяца делать сделать помочь помогите помощью тест").split(" ")
   .forEach(function(w){ STOP[w] = 1; });

  /* ─────────── Разговорные синонимы → слова из прейскуранта ─────────── */
  var SYN = [
    [/(?:^| )шея|(?:^| )шеи(?= |$)|(?:^| )шею(?= |$)|(?:^| )шейн/, "шейно воротниковой", /^ше[яиюй]/],
    [/(?:^| )ног[иау]?(?= |$)|(?:^| )стоп[ыау]?(?= |$)/, "нижних конечностей стопы", /^(ног|стоп)/],
    [/(?:^| )рук[иау]?(?= |$)/, "верхних конечностей", /^рук/],
    [/(?:^| )поясниц/, "пояснично крестцового", /^поясниц/],
    [/(?:^| )инвалидн[а-яa-z0-9]* кресл|(?:^| )коляск/, "коляска", /^(инвалидн|коляск)/],
    [/(?:^| )палочк/, "трость", /^палочк/],
    [/(?:^| )кровать(?= |$)|(?:^| )кровати(?= |$)|(?:^| )койк/, "кровать многофункциональная", /^(кроват|койк)/],
    [/(?:^| )матрас|(?:^| )матрац/, "матрац противопролежневый", /^матра/],
    [/(?:^| )унитаз|(?:^| )туалет/, "туалет унитаз", /^(унитаз|туалет)/],
    [/(?:^| )подъемник|(?:^| )подъемн|(?:^| )лестничн/, "подъемник подъемное", /^(подъемник|подъемн)/],
    [/(?:^| )прокат|(?:^| )аренд|(?:^| )напрокат/, "прокату технических средств реабилитации", /^(прокат|аренд|напрокат)/],
    [/(?:^| )тсо(?= |$)|(?:^| )тср(?= |$)|(?:^| )средств[ао]? реабилитац/, "прокату технических средств реабилитации", /^(тсо|тср|средств|реабилитац)/],
    [/(?:^| )госуслуг|(?:^| )гос услуг|(?:^| )портал/, "портале государственных услуг электронной", /^(госуслуг|гос|портал)/],
    [/(?:^| )налог|(?:^| )вычет|(?:^| )3 ?ндфл|(?:^| )ндфл/, "декларации ндфл", /^(налог|вычет|ндфл|3)/],
    [/(?:^| )гражданств|(?:^| )паспорт рф/, "гражданство", /^(гражданств)/],
    [/(?:^| )внж(?= |$)|(?:^| )вид на жительство|(?:^| )рвп(?= |$)|(?:^| )временн[а-яa-z0-9]* проживан/, "вида жительство временного проживания", /^(внж|рвп|вид|жительств|временн|проживан)/],
    [/(?:^| )миграц|(?:^| )регистрац/, "миграционный учет регистрацию", /^(миграц|регистрац)/],
    [/(?:^| )иск(?= |$)|(?:^| )исков|(?:^| )в суд(?= |$)/, "исковых заявлений", /^(иск|суд)/],
    [/(?:^| )жалоб|(?:^| )претенз|(?:^| )ходатайств|(?:^| )обращени/, "заявлений жалоб претензий", /^(жалоб|претенз|ходатайств|обращени)/],
    [/(?:^| )юрист|(?:^| )юридич|(?:^| )адвокат|(?:^| )правов/, "правовые", /^(юрист|юридич|адвокат|правов)/],
    [/(?:^| )давлени|(?:^| )тонометр/, "артериального давления", /^(давлени|тонометр)/],
    [/(?:^| )солян|(?:^| )соль(?= |$)|(?:^| )галотерап/, "соляной комнате", /^(солян|соль|галотерап)/],
    [/(?:^| )сауна|(?:^| )саун/, "сауна", /^саун/],
    [/(?:^| )бочк/, "фитобочка", /^бочк/],
    [/(?:^| )коктейл/, "кислородный коктейль", /^коктейл/],
    [/(?:^| )фиточа|(?:^| )травян[а-яa-z0-9]* ча/, "фиточай", /^(фиточа|травян|чай)/],
    [/(?:^| )физиотерап|(?:^| )физиопроцедур/, "физиотерапевтический", /^физио/],
    [/(?:^| )лфк(?= |$)|(?:^| )лечебн[а-яa-z0-9]* физкульт/, "лфк", /^(лфк|лечебн|физкульт)/],
    [/(?:^| )спортзал|(?:^| )физкультур|(?:^| )фитнес/, "спортивном зале физической культурой", /^(спортзал|физкультур|фитнес)/],
    [/(?:^| )тренажерк|(?:^| )тренажерн/, "тренажерном", /^тренажер/],
    [/(?:^| )скандинав/, "скандинавской ходьбе", /^скандинав/],
    [/(?:^| )лошад|(?:^| )иппо/, "иппотерапия", /^(лошад|иппо)/],
    [/(?:^| )психолог/, "психолога психологическое психологические", /^психолог/],
    [/(?:^| )логопед|(?:^| )речь(?= |$)|(?:^| )речи(?= |$)|(?:^| )заика|(?:^| )заикан|(?:^| )не говорит/, "логопедом логопедическая речевого", /^(логопед|речь|речи|заик|говорит)/],
    [/(?:^| )дефектолог/, "дефектолога", /^дефектолог/],
    [/(?:^| )к школе|(?:^| )школ/, "школе школьному", /^школ/],
    [/(?:^| )уроки(?= |$)|(?:^| )домашк|(?:^| )домашн[а-яa-z0-9]* задани/, "домашних заданий", /^(урок|домашк|домашн|задани)/],
    [/(?:^| )компьютер|(?:^| )интернет|(?:^| )смартфон|(?:^| )телефоном пользоват/, "компьютерной грамотности", /^(компьютер|интернет|смартфон)/],
    [/(?:^| )гончар|(?:^| )глин|(?:^| )керамик/, "гончарной мастерской", /^(гончар|глин|керамик)/],
    [/(?:^| )рукодел|(?:^| )творчеств|(?:^| )подел/, "декоративно прикладному творчеству", /^(рукодел|творчеств|подел)/],
    [/(?:^| )арт ?терап|(?:^| )рисован/, "арт терапии арттерапевтических", /^(арт|терап|рисован)/],
    [/(?:^| )опекун|(?:^| )опек|(?:^| )попечител/, "опекунов попечителей", /^(опекун|опек|попечител)/],
    [/(?:^| )выгоран/, "выгорания", /^выгоран/],
    [/(?:^| )сон(?= |$)|(?:^| )бессонниц|(?:^| )уснуть|(?:^| )не сплю|(?:^| )плохо сплю/, "сна", /^(сон|бессонниц|уснуть|сплю)/],
    [/(?:^| )сенсорн|(?:^| )релакс/, "сенсорной релаксации", /^(сенсорн|релакс)/],
    [/(?:^| )iq(?= |$)|(?:^| )ай кью|(?:^| )интеллект/, "iq умственного развития интеллекта", /^(iq|ай|кью|интеллект)/],
    [/(?:^| )профориент|(?:^| )кем стать|(?:^| )професси/, "профориентационная профессиональное самоопределение", /^(профориент|кем|стать|професси)/],
    [/(?:^| )дед[а-яa-z0-9]* мороз|(?:^| )снегуроч|(?:^| )новогодн|(?:^| )новый год/, "деда мороза снегурочки", /^(дед|мороз|снегуроч|новогодн|новый|год)/],
    [/(?:^| )аниматор|(?:^| )день рождени|(?:^| )деньрожден|(?:^| )праздник|(?:^| )поздравлени|(?:^| )юбиле/, "праздничным датам поздравление праздников", /^(аниматор|день|рождени|праздник|поздравлени|юбиле)/],
    [/(?:^| )фотосесс|(?:^| )сфотограф|(?:^| )фотограф|(?:^| )фото(?= |$)/, "фотосессия фотографирование фотографии", /^(фотосесс|сфотограф|фотограф|фото)/],
    [/(?:^| )видео|(?:^| )ролик/, "видеоролика", /^(видео|ролик)/],
    [/(?:^| )сиделк|(?:^| )ухаж|(?:^| )уход за (пожил|бабуш|дедуш|мам|пап|инвалид)/, "сиделки присмотр гражданами пожилого возраста", /^(сиделк|ухаж)/],
    [/(?:^| )нян|(?:^| )посидеть с ребен|(?:^| )присмотр[а-яa-z0-9]* за ребен/, "няня няней", /^(нян|посидеть|присмотр)/],
    [/(?:^| )прогулк|(?:^| )погулять/, "прогулку", /^(прогулк|погулять)/],
    [/(?:^| )паллиатив/, "паллиативным статусом", /^паллиатив/],
    [/(?:^| )гостиниц|(?:^| )переночев|(?:^| )жилье на|(?:^| )пожить|(?:^| )номер на ночь/, "гостиничные краткосрочного проживания", /^(гостиниц|переночев|жилье|пожить|номер|ночь)/],
    [/(?:^| )массажн[а-яa-z0-9]* кресл/, "кресло", /^кресл/],
    [/(?:^| )массажн[а-яa-z0-9]* кроват/, "кровать", /^кроват/],
    [/(?:^| )массажист/, "массаж", /^массажист/],
    [/(?:^| )ребен|(?:^| )ребён|(?:^| )детск|(?:^| )дет[еия](?= |$)|(?:^| )детям|(?:^| )детьми|(?:^| )сын|(?:^| )доч/, "детей детский дети детям детьми ребенка ребенок", /^(ребен|детск|дет|детям|детьми|сын|доч)/],
    [/(?:^| )подрост|(?:^| )школьник|(?:^| )старшеклас/, "подростков старшеклассников 13 старше", /^(подрост|школьник|старшеклас)/],
    [/(?:^| )бабушк|(?:^| )дедушк|(?:^| )пожил|(?:^| )престарел|(?:^| )пенсионер/, "пожилого возраста", /^(бабушк|дедушк|пожил|престарел|пенсионер)/],
    [/(?:^| )пролежн/, "противопролежневый противопролежневая", /^пролежн/],
    [/(?:^| )лежач/, "многофункциональная противопролежневый постели", /^лежач/],
    [/(?:^| )спелео|(?:^| )сильвинит/, "спелеоклиматическая сильвинитовая", /^(спелео|сильвинит)/],
    [/(?:^| )тестирован|(?:^| )проверить интеллект/, "диагностика", /^тестирован/],
    [/(?:^| )взросл/, "взрослого взрослых взрослые", /^взросл/]
  ];

  /* ─────────── Индекс прейскуранта (по филиалу) ─────────── */
  var IDX = {};
  function tokenize(text){
    return norm(text).split(" ").filter(function(w){ return w && !STOP[w] && !/^\d+$/.test(w) && w.length > 1; });
  }
  function buildIndex(services, key){
    if (IDX[key] && IDX[key].src === services) return IDX[key];
    var items = [], df = {};
    (services||[]).forEach(function(cat){
      var catStems = tokenize(cat.name).map(stem);
      (cat.items||[]).forEach(function(it, idx){
        var st = tokenize(it.n).map(stem), uniq = {};
        st.forEach(function(x){ uniq[x] = 1; });
        Object.keys(uniq).forEach(function(x){ df[x] = (df[x]||0) + 1; });
        items.push({ uid: cat.id*1000 + idx, catId: cat.id, catName: cat.name, icon: cat.icon||"", idx: idx,
                     name: String(it.n||"").replace(/\s+/g," ").trim(), price: it.p, mor: (it.m==null?null:it.m),
                     stems: Object.keys(uniq), catStems: catStems });
      });
    });
    var N = items.length || 1, idf = {};
    Object.keys(df).forEach(function(k){ idf[k] = Math.log(1 + N/df[k]); });
    return (IDX[key] = { src: services, items: items, idf: idf, N: N });
  }
  function curIndex(){ return buildIndex(svcData(), "cur:" + (typeof currentCity !== "undefined" ? currentCity : "")); }

  /* Разбор запроса на смысловые единицы (concepts). Синоним — одна единица из нескольких слов. */
  function concepts(text){
    var t = norm(text), toks = t.split(" ").filter(Boolean), used = {}, out = [];
    SYN.forEach(function(r){
      if (!r[0].test(t)) return;
      var group = r[1].split(" ").map(stem);
      toks.forEach(function(w, i){ if (r[2].test(w)) used[i] = 1; });
      out.push({ stems: group, syn: true });
    });
    toks.forEach(function(w, i){
      if (used[i] || STOP[w] || /^\d+$/.test(w) || w.length < 2) return;
      out.push({ stems: [stem(w)], syn: false, raw: w });
    });
    return out;
  }
  function matchStem(q, list){
    var best = null;
    for (var i = 0; i < list.length; i++) {
      var s = list[i], qual = 0;
      if (s === q) qual = 1;
      else {
        var shorter = q.length < s.length ? q : s, longer = shorter === q ? s : q;
        if (shorter.length >= 5 && longer.indexOf(shorter) === 0) qual = 0.85;
        else if (shorter.length >= 4 && longer.indexOf(shorter) === 0 && q.length <= s.length) qual = 0.7;
        else if (q.length >= 5 && s.length >= 5 && lev(q, s) <= 1) qual = 0.75;
        else if (q.length >= 9 && s.length >= 9 && lev(q, s) <= 2) qual = 0.6;
      }
      if (qual && (!best || qual > best.q)) best = { q: qual, s: s };
    }
    return best;
  }
  function search(text, index){
    index = index || curIndex();
    var cs = concepts(text);
    if (!cs.length) return { list: [], n: 0 };
    var res = [];
    index.items.forEach(function(it){
      var score = 0, hit = 0, hitStems = 0;
      cs.forEach(function(c){
        var best = 0;
        c.stems.forEach(function(qs){
          var m = matchStem(qs, it.stems);
          if (m) {
            var w = index.idf[m.s] || 1;
            if (m.s !== qs && index.idf[qs]) w = Math.min(w, index.idf[qs]);
            var v = m.q * w; if (v > best) best = v;
          }
          else {
            var mc = matchStem(qs, it.catStems);
            if (mc && mc.q * 0.6 > best) best = mc.q * 0.6;
          }
        });
        if (best > 0) { score += best; hit++; }
      });
      if (!hit) return;
      cs.forEach(function(c){ c.stems.forEach(function(qs){ if (matchStem(qs, it.stems)) hitStems++; }); });
      var prec = Math.min(1, hitStems / Math.max(1, it.stems.length));
      res.push({ it: it, score: score + prec * 0.8, cov: hit / cs.length });
    });
    res.sort(function(a,b){ return (b.cov - a.cov) || (b.score - a.score) || (a.it.name.length - b.it.name.length); });
    return { list: res, n: cs.length, cs: cs };
  }
  /* Верхняя группа уверенных совпадений. */
  function topGroup(r){
    if (!r.list.length) return [];
    var b = r.list[0];
    var need = r.n <= 2 ? 1 : 0.66;
    if (b.cov < need) return [];
    return r.list.filter(function(x){ return x.cov === b.cov && x.score >= b.score * 0.82; }).map(function(x){ return x.it; });
  }

  /* ─────────── Направления записи (Губкинский, мкр. Пурпе) ─────────── */
  function structAvail(){ return typeof BOOKING_STRUCT !== "undefined" && (currentCity === "gubkin" || currentCity === "purpe"); }
  function stemSet(t){ var o = {}; tokenize(t).map(stem).forEach(function(x){ o[x] = 1; }); return o; }
  function jacc(a, b){ var i = 0, u = 0, k; for (k in a){ u++; if (b[k]) i++; } for (k in b) if (!a[k]) u++; return u ? i/u : 0; }
  function structFor(it){
    if (!structAvail()) return null;
    var dir = BOOKING_STRUCT.find(function(d){ return d.catId === it.catId; });
    if (!dir) return null;
    var A = stemSet(it.name), best = null;
    dir.subs.forEach(function(sub, si){
      sub.items.forEach(function(x, ii){
        var j = jacc(A, stemSet(x.n)) + (x.p === it.price ? 0.15 : 0);
        if (!best || j > best.j) best = { j: j, dir: dir, sub: sub, x: x, si: si, ii: ii };
      });
    });
    return best && best.j >= 0.62 ? best : null;
  }
  function structDirByCat(catId){
    if (!structAvail()) return null;
    return BOOKING_STRUCT.find(function(d){ return d.catId === catId; }) || null;
  }
  function staffByNames(names){
    return (typeof structResolveStaff === "function") ? structResolveStaff(names||[]) : [];
  }

  /* ─────────── Рассказ об услуге — только факты из прейскуранта ─────────── */
  function facts(it){
    var n = it.name, low = n.toLowerCase(), f = [];
    var range = n.match(/от\s*\d+\s*до\s*\d+\s*мин(ут)?/i);
    var dur = range || n.match(/(не более|до|от)?\s*\d+([.,]\d+)?\s*(-?х|-ух)?\s*(ч\.?\s*\d+\s*мин|мин(ут)?|час(а|ов)?|ч)(?=[\s.,);]|$)/i);
    if (dur && !range && /за\s*$/.test(n.slice(Math.max(0, dur.index - 4), dur.index + (dur[0].match(/^\s*/)[0].length)))) dur = null;
    if (dur) f.push(["Длительность", dur[0].replace(/\s+/g," ").replace(/\.$/,"").trim()]);
    var grp = low.match(/(не более|до|не менее)\s*(\d+)\s*-?х?\s*человек/);
    if (/группов|не менее \d+ человек/.test(low)) f.push(["Формат", "групповое" + (grp ? " (" + grp[0] + ")" : "")]);
    else if (/индивидуал/.test(low)) f.push(["Формат", "индивидуально"]);
    else if (grp) f.push(["Формат", grp[0]]);
    var age = n.match(/(для детей[^,()]*|детей от[^,()]*|с детьми от[^,()]*|для взрослых|взрослые|старшеклассников|подростков|от \d+(,\d+)? (лет|мес)[^,()]*)/i);
    if (age) f.push(["Для кого", age[0].trim()]);
    if (/с\s*инструктор/.test(low)) f.push(["Инструктор", "занятие с инструктором"]);
    else if (/без инструктор/.test(low)) f.push(["Инструктор", "без инструктора"]);
    if (/с сопровождением/.test(low)) f.push(["Сопровождение", "с сопровождающим работником центра"]);
    else if (/без сопровождения/.test(low)) f.push(["Сопровождение", "без сопровождающего"]);
    if (/на дому/.test(low)) f.push(["Где", "на дому"]);
    else if (/в учреждении|на территории центра|в полустационар/.test(low)) f.push(["Где", "в центре"]);
    else if (/на территории заказчика/.test(low)) f.push(["Где", "у заказчика"]);
    var unit = low.match(/за\s*10 сеансов|за 1 (месяц|час|человека|челов|раз|единицу|услугу|декларацию|заявление|документ|занятие|сеанс)|\(\s*1 месяц\s*\)|1 \(месяц\)/);
    if (unit) {
      var u = unit[0];
      f.push(["Оплата", /месяц/.test(u) ? "за 1 месяц проката" : /10 сеансов/.test(u) ? "абонемент на 10 сеансов"
              : u.replace(/\(|\)/g,"").replace(/челов$/,"человека").trim()]);
    }
    var incl = n.match(/в т\.?\s*ч\.?\s*:?\s*([^)]+)/i) || n.match(/\(([^()]{25,})\)/);
    if (incl && !/^\s*(не более|до|за|\d)/i.test(incl[1])) f.push(["Что входит", incl[1].replace(/\s+/g," ").trim().replace(/[.,;]$/,"")]);
    return f;
  }
  function catNote(it){
    var c = it.catName.toLowerCase();
    if (/прокат/.test(c)) return "Средство выдаётся во временное пользование, оплата помесячно.";
    if (/перевозк/.test(c)) return "Заказ — через раздел «Такси»: заявку принимают накануне поездки с " + TAXI_RULES.orderFrom + " до " + TAXI_RULES.orderTo + ".";
    return "";
  }
  function serviceCard(it){
    var rows = [["Раздел", esc(it.catName)], ["Цена", money(it.price)]];
    if (it.mor != null && it.mor !== it.price) rows.push(["По карте «Морошка»", money(it.mor) + " (−" + money(it.price - it.mor) + ")"]);
    facts(it).forEach(function(f){ rows.push([f[0], esc(f[1])]); });
    var st = structFor(it);
    if (st) {
      var people = staffByNames(st.x.resp || st.sub.resp || st.dir.resp).filter(function(p){ return p && p.name; });
      if (people.length) rows.push(["Ответственный", people.map(function(p){ return esc(p.name) + (p.pos && p.pos !== "Ответственный специалист" ? " — " + esc(p.pos.toLowerCase()) : ""); }).join("<br>")]);
      if (st.sub.mode === "group") rows.push(["Запись", "в группу, единое время" + (st.sub.cap ? " (до " + st.sub.cap + " мест)" : "")]);
    }
    return '<div class="cf-card"><div class="cf-card-ttl">' + esc(it.name) + "</div>" +
      rows.map(function(r){ return '<div class="cf-row"><span>' + r[0] + "</span><b>" + r[1] + "</b></div>"; }).join("") + "</div>";
  }
  function serviceActions(it){
    var b = [], st = structFor(it), c = it.catName.toLowerCase();
    if (/перевозк/.test(c)) {
      b.push(btn("🚕 Заказать такси", function(){ return C.startTaxi(); }, { echo: "Заказать такси" }));
    } else if (st) {
      b.push(btn("📝 Записаться на время", function(){ return go(function(){ structPickItem(st.dir.catId, st.si, st.ii); }); }));
      b.push(btn("Добавить в заявку", function(){ return C.addService(asSvc(it)); }, { cl: "outline", echo: "Добавить в заявку: " + it.name }));
    } else {
      b.push(btn("Добавить в заявку", function(){ return C.addService(asSvc(it)); }, { echo: "Добавить в заявку: " + it.name }));
    }
    b.push(navBtn("Открыть в прейскуранте", function(){ showCategory(it.catId, it.uid); }));
    return row(b);
  }
  function asSvc(it){ return { uid: it.uid, name: it.name, price: it.price, mor: it.mor, catId: it.catId }; }
  function dupNote(it){
    var same = curIndex().items.filter(function(x){ return x !== it && norm(x.name) === norm(it.name); });
    if (!same.length) return "";
    return "<br><span class=\"cf-mor\">В прейскуранте есть ещё вариант с тем же названием: " +
      same.map(function(x){ return money(x.price); }).join(", ") + ". Уточните у специалиста, какой подходит вам.</span>";
  }
  function answerService(it, lead){
    var note = catNote(it);
    var st = structFor(it);
    var how = /перевозк/i.test(it.catName) ? "" :
      st ? "Можно сразу выбрать дату и время — запись по будням, обед с " + WORK_BREAK.from + " до " + WORK_BREAK.to + "."
         : "Добавьте в заявку — она уйдёт в центр, и специалист свяжется с вами, чтобы согласовать время.";
    return (lead || "Вот всё об этой услуге:") + serviceCard(it) +
      [note, how].filter(Boolean).join(" ") + dupNote(it) + serviceActions(it);
  }

  /* Несколько услуг: сразу показываем цены текстом + кнопки «подробнее». */
  function answerList(items, head, more){
    var shown = items.slice(0, 8);
    var lines = shown.map(function(it){
      return "• " + esc(it.name) + " — <b>" + money(it.price) + "</b>" +
        (it.mor != null && it.mor !== it.price ? ' <span class="cf-mor">(по «Морошке» ' + money(it.mor) + ")</span>" : "");
    }).join("<br>");
    var b = shown.slice(0, 5).map(function(it){
      return btn(esc(shortName(it.name)) + " · " + money(it.price), function(){ return answerService(it); }, { cl: "outline", echo: it.name });
    });
    var tail = items.length > shown.length ? "<br>…и ещё " + (items.length - shown.length) + " " + plural(items.length - shown.length, ["вариант","варианта","вариантов"]) + " в прейскуранте." : "";
    if (more) b.push(more);
    return (head || "Нашёл несколько подходящих услуг:") + "<br>" + lines + tail +
      "<br><br>Нажмите на услугу — расскажу подробно." + row(b);
  }
  function shortName(n){ n = n.replace(/\s+/g," "); return n.length > 60 ? n.slice(0, 57).replace(/\s\S*$/,"") + "…" : n; }

  function answerCategory(cat){
    var items = curIndex().items.filter(function(x){ return x.catId === cat.id; });
    var dir = structDirByCat(cat.id);
    var extra = dir ? btn("📝 Записаться: " + esc(dir.title), function(){ return go(function(){ structGoto(cat.id); }); })
                    : navBtn("Открыть раздел", function(){ showCategory(cat.id); }, "teal");
    return answerList(items, (cat.icon ? cat.icon + " " : "") + "<b>" + esc(cat.name) + "</b> — " + items.length + " " +
      plural(items.length, ["услуга","услуги","услуг"]) + " в филиале «" + esc(cityName()) + "»:", extra);
  }

  /* Ключевые слова → раздел прейскуранта (по названию раздела, чтобы работало во всех филиалах). */
  var CAT_RULES = [
    [/психолог|психотерап|тревог|стресс|депресс/, /психолог/],
    [/логопед|дефектолог|педагог|репетитор|кружк|мастер класс/, /педагогич/],
    [/лфк|тренажер|спортзал|физкультур|инструктор/, /лфк|залах/],
    [/массаж|физиотерап|оздоров|процедур|медицин|медсестр/, /медицин/],
    [/юрист|юридич|правов|адвокат/, /правов/],
    [/прокат|аренд|средств[ао]? реабилитац|тср(?= |$)|тсо(?= |$)/, /прокат/],
    [/праздник|аниматор|дед[а-яa-z0-9]* мороз|поздравлен/, /праздник/],
    [/сиделк|нян|присмотр|уход за/, /сиделк|нян/],
    [/гостиниц|проживан|переночев/, /гостинич/],
    [/фото/, /фотограф/],
    [/видео/, /видеоролик/],
    [/паллиатив/, /паллиатив/]
  ];
  function catByRules(t){
    for (var i = 0; i < CAT_RULES.length; i++) {
      if (!CAT_RULES[i][0].test(t)) continue;
      var cat = svcData().find(function(c){ return CAT_RULES[i][1].test(c.name.toLowerCase()); });
      if (cat) return cat;
      return { missing: true, re: CAT_RULES[i][1] };
    }
    return null;
  }

  /* Поиск в других филиалах. */
  var CITY = { gubkin:"Губкинский", purpe:"мкр. Пурпе", muravlenko:"Муравленко", noyabrsk:"Ноябрьск", tarko:"Тарко-Сале", urengoy:"пгт. Уренгой" };
  function crossBranch(text){
    if (typeof branchContent === "undefined") return null;
    var found = [];
    Object.keys(branchContent).forEach(function(k){
      if (k === currentCity) return;
      var sv = branchContent[k] && branchContent[k].services;
      if (!sv || !sv.length) return;
      var g = topGroup(search(text, buildIndex(sv, "br:" + k)));
      if (g.length) found.push({ city: k, items: g });
    });
    return found.length ? found : null;
  }
  function crossCat(re){
    if (typeof branchContent === "undefined") return [];
    return Object.keys(branchContent).filter(function(k){
      return k !== currentCity && (branchContent[k].services||[]).some(function(c){ return re.test(c.name.toLowerCase()); });
    });
  }
  function switchBtn(k){
    return btn("🏢 Перейти в филиал «" + CITY[k] + "»", function(){ return go(function(){ selectCity(k); }); });
  }

  /* ─────────── Сотрудники по должности ─────────── */
  var ROLES = [
    [/директор|руководител|начальник|главн[а-яa-z0-9]* в центре/, /директор/, "Директор"],
    [/заведующ/, /заведующ/, "Заведующие отделениями"],
    [/психолог/, /психолог/, "Психологи"],
    [/логопед/, /логопед/, "Логопеды"],
    [/дефектолог/, /дефектолог/, "Дефектологи"],
    [/социальн[а-яa-z0-9]* педагог|соц педагог/, /социальный педагог/, "Социальные педагоги"],
    [/педагог доп|допобраз|дополнительн[а-яa-z0-9]* образован/, /доп/, "Педагоги дополнительного образования"],
    [/медсестр|медицинск[а-яa-z0-9]* сестр|медик|медработник/, /медицинск/, "Медицинские сестры"],
    [/воспитател/, /воспитател/, "Воспитатели"],
    [/социальн[а-яa-z0-9]* работник|соцработник/, /социальный работник/, "Социальные работники"],
    [/специалист[а-яa-z0-9]* по социальн|соц[а-яa-z0-9]* специалист/, /специалист по социальной/, "Специалисты по социальной работе"],
    [/юрист|юрисконсульт/, /юрис/, "Юрисконсульты"],
    [/инструктор/, /инструктор|физкульт/, "Инструкторы"],
    [/секретар|приемн/, /секретар/, "Приёмная"]
  ];
  function staffAnswer(t){
    var ask = /(кто|как зовут|фамили|телефон|номер|почт|email|связаться|контакт|найти|позвонить|добавочн)/.test(t);
    if (!ask) return null;
    for (var i = 0; i < ROLES.length; i++) {
      if (!ROLES[i][0].test(t)) continue;
      var list = (typeof staffData !== "undefined" ? staffData : []).filter(function(p){ return ROLES[i][1].test((p.pos||"").toLowerCase()); });
      if (!list.length && catByRules(t) && !catByRules(t).missing) return null; /* расскажем про услуги направления */
      if (!list.length) return ROLES[i][2] + " — в справочнике филиала «" + esc(cityName()) + "» таких сотрудников нет. Позвоните в приёмную: <b>" + esc(cd().phone||"") + "</b>." +
        row([navBtn("👥 Все сотрудники", function(){ showStaff(); }, "teal")]);
      var lines = list.slice(0, 8).map(function(p){
        return "• <b>" + esc(p.name) + "</b> — " + esc(p.pos) + "<br>&nbsp;&nbsp;📞 " + esc(cd().phone||"") + (p.ext ? " доб. " + esc(p.ext) : "") +
               (p.email ? "<br>&nbsp;&nbsp;✉️ " + esc(p.email) : "");
      }).join("<br>");
      return ROLES[i][2] + " — филиал «" + esc(cityName()) + "»:<br>" + lines +
        (list.length > 8 ? "<br>…и ещё " + (list.length - 8) + "." : "") +
        row([navBtn("👥 Все сотрудники", function(){ showStaff(); }, "teal")]);
    }
    return null;
  }

  /* ─────────── Разговорные фразы ─────────── */
  var GREET_RE = /^(привет[а-яa-z0-9]*|приветик|здравствуй[а-яa-z0-9]*|здрасьте|здрасте|здорово|добр[а-яa-z0-9]* (утро|день|вечер|ночи|времени( суток)?)|доброго (дня|утра|вечера|времени( суток)?)|день добрый|вечер добрый|утро доброе|приветствую|хай|хеллоу|hello|hi|салют|алло|ау)(?= |$)/;
  var LEAD_RE = /^(ну|а|и|слушай|слушайте|скажи|скажите|подскажи|подскажите|пожалуйста|бот|гармония|уважаемый|уважаемая|спасибо|благодарю)(?= |$)\s*/;
  function timeHello(){
    var h = new Date().getHours();
    return h < 5 ? "Доброй ночи" : h < 12 ? "Доброе утро" : h < 18 ? "Добрый день" : "Добрый вечер";
  }
  /* Отвечаем тем же приветствием, что написал человек («добрый вечер» → «Добрый вечер»). */
  function helloFor(t){
    var m = t.match(/^(добр[а-яa-z0-9]* (утро|день|вечер)|доброго (утра|дня|вечера)|день добрый|вечер добрый|утро доброе)/);
    if (m) { var w = /утр/.test(m[0]) ? "Доброе утро" : /вечер/.test(m[0]) ? "Добрый вечер" : "Добрый день"; return w; }
    if (/^здравствуй|^здрасьте|^здрасте|^приветствую/.test(t)) return "Здравствуйте";
    if (/^привет/.test(t)) return "Привет";
    return timeHello();
  }
  function capabilities(){
    return "Я помогу:<br>• узнать цену и подробности любой услуги — просто напишите, например, «массаж спины» или «коляска напрокат»;" +
      "<br>• записаться к специалисту на удобное время;<br>• оформить заявку на услуги;<br>• заказать социальное такси;" +
      "<br>• найти телефон сотрудника, адрес и режим работы филиала." + C.row([
        btn("🚕 Заказать такси", function(){ return C.startTaxi(); }, { echo: "Заказать такси" }),
        btn("📝 Записаться к специалисту", function(){ return bookingDirs(); }, { cl: "outline", echo: "Записаться к специалисту" }),
        navBtn("📋 Все услуги и цены", function(){ showServices(); })
      ]);
  }
  /* Полностью разговорная фраза → ответ. Иначе null. */
  function smallTalk(t){
    var n = userName(), h = hi();
    var s = t.replace(/\s*(бот|гармония|пожалуйста)$/,"").trim();
    if (s.split(" ").length < 2 && /(бот|гармония)$/.test(t)) s = t;
    if (GREET_RE.test(s) && !s.replace(GREET_RE, "").trim())
      return helloFor(s) + h + "! 👋 Я чат-бот центра «Гармония». Спросите про любую услугу, цену или запись — отвечу и подскажу, как оформить.";
    if (/^(как (у тебя |у вас |твои |ваши )?(дела|делишки|жизнь|поживаешь|поживаете|настроение|ты|вы|сам|служба|оно))( [а-яa-z0-9]+)?$/.test(s) || /^как дела(?= |$)/.test(s))
      return "Спасибо, что спросили" + h + "! У меня всё хорошо — работаю и готов помочь 🙂 Как ваши дела? Чем могу быть полезен?";
    if (/^(спасибо|благодарю|спс|пасиб[а-яa-z0-9]*|спасибочки|спасибки|мерси|thanks|thank you)( (тебе|вам|большое|огромное|за помощь|за ответ|за информацию|бот|друг))*$/.test(s) ||
        /^(большое|огромное) спасибо( [а-яa-z0-9]+)*$/.test(s))
      return "Пожалуйста" + h + "! Рад помочь 🌿 Если появятся вопросы — пишите.";
    if (/^(пока|покеда|до свидания|досвидания|до свиданья|всего доброго|всего хорошего|до встречи|до завтра|спокойной ночи|прощай|увидимся|бывай)( [а-яa-z0-9]+)?$/.test(s))
      return "Всего доброго" + h + "! Берегите себя 🌿";
    if (/^(да|ага|угу|ок|окей|ok|okay|хорошо|ладно|понятно|ясно|понял|поняла|договорились|принято|супер|класс|отлично|здорово|замечательно|прекрасно|круто|норм|нормально|неплохо)( спасибо)?$/.test(s))
      return "Хорошо" + h + "! Если понадобится — я здесь. Могу рассказать об услуге, записать к специалисту или заказать такси." ;
    if (/^(нет|не|неа|не надо|не нужно|ничего|нет спасибо|не сейчас|потом|позже)( спасибо)?$/.test(s))
      return "Хорошо" + h + ". Если что-то понадобится — просто напишите.";
    if (/^(плохо|так себе|не очень|грустно|тоскливо|устал|устала|паршиво|хуже некуда)$/.test(s))
      return "Сочувствую" + h + " 💛 Если хочется поговорить со специалистом — в центре работают психологи, к ним можно записаться. Если ситуация острая — звоните <b>112</b>." +
        row([btn("🧠 Записаться к психологу", function(){ return catAnswerById(/психолог/); }, { cl: "outline", echo: "Записаться к психологу" }),
             navBtn("🆘 Экстренная помощь", function(){ showEmergency(); })]);
    if (/(кто ты|ты кто|что ты (умеешь|можешь|знаешь)|что умеешь|что можешь|чем (ты )?(можешь )?помочь|чем поможешь|твои возможности|расскажи о себе|что ты такое|ты бот|ты робот|ты человек|ты живой|ты настоящий|ты ии|ты нейросеть)/.test(s))
      return "Я — чат-бот центра «Гармония», программа, а не человек. Знаю весь прейскурант филиала «" + esc(cityName()) + "», режим работы и сотрудников. " + capabilities();
    if (/^(помощь|помоги|помогите|help|меню|начать|старт|start|что дальше|с чего начать|не знаю что спросить)$/.test(s))
      return capabilities();
    if (/(как (тебя|вас) зовут|твое имя|ваше имя)/.test(s))
      return "Меня зовут «Гармония» — я чат-бот центра. А вас" + (n ? " — " + esc(n) + ", верно?" : " как зовут?");
    if (/^(ха)+$|^а?хах[а-яa-z0-9]*$|^лол$|^\)+$|^смешно$/.test(s)) return "🙂 Рад, что настроение хорошее! Чем могу помочь?";
    if (/(дурак|тупой|тупая|глупый|идиот|бесполезн|отстой|ерунд|бред|не понимаешь|плохо работаешь)/.test(s))
      return "Прошу прощения, если ответил не так" + h + ". Попробуйте написать по-другому — например, название услуги: «массаж шеи», «логопед», «прокат коляски». Или позвоните: <b>" + esc(cd().phone||"") + "</b>.";
    if (/(молодец|умница|умничка|ты лучший|ты классный|ты хороший|ты супер|люблю тебя|спасибо тебе большое)/.test(s))
      return "Очень приятно" + h + "! 🌿 Стараюсь быть полезным. Чем ещё помочь?";
    if (/(извини|извините|прости|простите|сорри)$/.test(s)) return "Всё в порядке" + h + " 🙂 Чем могу помочь?";
    if (/^(скучно|скучаю|одиноко|мне одиноко|не с кем поговорить)$/.test(s))
      return "Понимаю" + h + " 🌿 В центре проходят мероприятия, кружки и клубы — хороший повод пообщаться вживую." +
        row([navBtn("🎟️ Мероприятия", function(){ showEvents(); }, "teal"), btn("Кружки и клубы", function(){ return catAnswerById(/педагогич/); }, { cl: "outline", echo: "Кружки и клубы" })]);
    if (/(какая|какой|какое) (сегодня )?(погод|температур)/.test(s) || /^погода/.test(s))
      return "Погоду я не вижу — к прогнозу не подключён 🌤 Но могу помочь с услугами центра.";
    if (/(который час|сколько времени|какое (сегодня )?число|какой (сегодня )?день|какая (сегодня )?дата|какой сегодня|сегодняшн[а-яa-z0-9]* дат)/.test(s)) {
      var d = new Date();
      return "Сейчас " + d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) + ", " +
        d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/\.$/,"") + ".";
    }
    return null;
  }
  /* Срочное — всегда раньше всего остального. */
  function urgent(t){
    if (/(не хочу жить|покончить с собой|покончу|суицид|убить себя|свести счеты|нет смысла жить|хочу умереть)/.test(t))
      return "Мне очень жаль, что вам так тяжело 💛 Пожалуйста, не оставайтесь с этим одни — позвоните прямо сейчас: <b>112</b> (экстренные службы). " +
        "Психологи центра тоже готовы поддержать — их телефоны в разделе «Экстренная помощь»." +
        row([navBtn("🆘 Экстренная помощь", function(){ showEmergency(); }, "red")]);
    if (/(мне плохо|плохо себя чувствую|болит сердце|сердце болит|задыхаюсь|не могу дышать|потерял сознание|упал[аи]? и не|инсульт|инфаркт|высокое давление|скорую|скорая)/.test(t))
      return "Если нужна срочная медицинская помощь — звоните <b>103</b> или <b>112</b> прямо сейчас. Центр «Гармония» не оказывает экстренную медицинскую помощь." +
        row([navBtn("🆘 Экстренная помощь", function(){ showEmergency(); }, "red")]);
    return null;
  }

  /* ─────────── Справка о центре ─────────── */
  function contactsText(){
    var c = cd();
    return "Филиал «" + esc(cityName()) + "»:<br>📍 " + esc(c.address||"") + "<br>📞 " + esc(c.phone||"") +
      "<br>✉️ " + esc(c.email||"") + "<br>🕒 " + esc(c.hours||"");
  }
  function openNow(){
    var c = cd(), now = new Date(), dow = now.getDay(), m = now.getHours()*60 + now.getMinutes();
    if (c.openH == null) return "";
    var o = c.openH*60 + c.openM, cl = c.closeH*60 + c.closeM;
    var hhmm = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
    if (dow === 0 || dow === 6) return "Сегодня выходной.";
    if (m < o || m >= cl) return "Сейчас центр закрыт.";
    if (isBreakTime(hhmm)) return "Сейчас обеденный перерыв, откроемся в " + WORK_BREAK.to + ".";
    return "Сейчас центр открыт.";
  }
  function bookingDirs(){
    if (structAvail()) {
      var b = BOOKING_STRUCT.filter(function(d){ return svcData().some(function(c){ return c.id === d.catId; }); })
        .map(function(d){ return btn(d.icon + " " + esc(d.title), function(){ return go(function(){ structGoto(d.catId); }); }, { cl: "outline" }); });
      b.push(navBtn("👔 Приём у директора", function(){ showBooking(); }));
      return "Выберите направление — покажу услуги, цены и свободное время. Запись по будням, обед с " + WORK_BREAK.from + " до " + WORK_BREAK.to + "." + row(b);
    }
    return "В филиале «" + esc(cityName()) + "» запись к специалисту — через прейскурант или по телефону <b>" + esc(cd().phone||"") + "</b>." +
      row([navBtn("📋 Прейскурант", function(){ showServices(); }, "teal"), navBtn("👔 Приём у директора", function(){ showBooking(); })]);
  }
  function catAnswerById(re){
    var cat = svcData().find(function(c){ return re.test(c.name.toLowerCase()); });
    if (!cat) return "В филиале «" + esc(cityName()) + "» такого раздела нет." ;
    var dir = structDirByCat(cat.id);
    if (dir) { go(function(){ structGoto(cat.id); }); return "Открываю запись: " + esc(dir.title) + "."; }
    return answerCategory(cat);
  }
  function taxiInfo(t){
    var tar = (typeof getTaxiTariffs === "function") ? getTaxiTariffs() : { items: [] };
    if (!tar.items.length) return "В филиале «" + esc(cityName()) + "» социальное такси не предоставляется. Уточните по телефону <b>" + esc(cd().phone||"") + "</b>.";
    var lines = tar.items.map(function(x){
      return "• " + esc(x.label) + " (" + x.duration + " мин) — <b>" + money(x.base) + "</b>" + (x.moroshka != null ? ' <span class="cf-mor">по «Морошке» ' + money(x.moroshka) + "</span>" : "");
    }).join("<br>");
    return "Социальное такси, филиал «" + esc(cityName()) + "»:<br>" + lines +
      "<br>• Льготная поездка — <b>бесплатно</b> для пенсионеров, инвалидов и ветеранов, до " + FREE_TAXI_ANNUAL_LIMIT + " поездок в год (нужен СНИЛС)." +
      "<br><br>Заявку принимают <b>накануне поездки с " + TAXI_RULES.orderFrom + " до " + TAXI_RULES.orderTo + "</b>. Машина работает " + taxiHoursText() + ". Пассажиров — не больше 2." +
      row([btn("🚕 Заказать такси", function(){ return C.startTaxi(); }, { echo: "Заказать такси" })]);
  }

  var FAQ = [
    [/((какие|все|список|перечень|каталог|весь)\s*(у вас\s*)?(есть\s*)?(услуг|направлени|раздел|прейскурант)|^что (у вас )?есть|чем (вы )?занимает|что (вы )?делаете|чем можете помочь|какая помощь)/, function(t){
      if (topGroup(search(t)).length || (catByRules(t) && !catByRules(t).missing)) return null;
      var cats = svcData();
      if (!cats.length) return "В филиале «" + esc(cityName()) + "» прейскурант пока не заполнен. Позвоните: <b>" + esc(cd().phone||"") + "</b>.";
      var b = cats.slice(0, 6).map(function(c){ return btn(c.icon + " " + esc(c.name), function(){ return answerCategory(c); }, { cl: "outline", echo: c.name }); });
      return "В филиале «" + esc(cityName()) + "» " + cats.length + " " + plural(cats.length, ["раздел","раздела","разделов"]) + " услуг:<br>" +
        cats.map(function(c){ return c.icon + " " + esc(c.name) + " — " + c.items.length; }).join("<br>") +
        "<br><br>Нажмите на раздел или напишите, что нужно." + row(b.concat([navBtn("📋 Открыть прейскурант", function(){ showServices(); }, "teal")]));
    }],
    [/(адрес|где (вы|находит|расположен|центр)|как (вас |к вам |до вас )?(найти|добраться|доехать|проехать)|контакт|телефон центра|номер центра|ваш телефон|ваш номер|позвонить в центр|почта центра|email|электронн[а-яa-z0-9]* почт)/, function(){
      return contactsText() + "<br>" + openNow() + row([navBtn("📍 Открыть контакты", function(){ showContacts(); }, "teal")]);
    }],
    [/(режим|график|часы работы|время работы|во сколько|до скольки|до какого часа|когда (вы )?(работает|работаете|открыва|закрыва|открыт)|работаете|работает ли центр|открыты|выходн|в субботу|в воскресенье|обед|перерыв)/, function(){
      return "Режим работы филиала «" + esc(cityName()) + "»: <b>" + esc(cd().hours||"") + "</b>. Суббота и воскресенье — выходные. " + openNow();
    }],
    [/(морошк|единая карта|карта жителя|скидк)/, function(){
      return "Карта жителя Ямала «Морошка» даёт скидку на платные услуги центра — примерно 5%. Цена по карте указана рядом с обычной в прейскуранте и в ответах бота. Карту покажите специалисту при получении услуги." +
        row([navBtn("🍊 О карте «Морошка»", function(){ showMoroshkaInfo(); }, "teal")]);
    }],
    [/(бесплатн|льгот|положено|имею право|субсид|малоимущ)/, function(t){
      if (/такси|поездк/.test(t)) return taxiInfo(t);
      return "Бесплатно в приложении оформляется льготная поездка на социальном такси — для пенсионеров, инвалидов и ветеранов, до " + FREE_TAXI_ANNUAL_LIMIT + " поездок в год. " +
        "Об остальных льготах и мерах поддержки подробно расскажет специалист по социальной работе — по телефону <b>" + esc(cd().phone||"") + "</b> или на приёме." +
        row([btn("🚕 Льготное такси", function(){ return C.startTaxi(); }, { echo: "Заказать такси" }), navBtn("👥 Специалисты", function(){ showStaff(); })]);
    }],
    [/(как (оформить|сделать|подать|отправить) заявк|как заказать услуг|как получить услуг|как это работает|как пользоваться)/, function(){
      return "Как оформить заявку:<br>1. Найдите услугу — в прейскуранте или спросите меня.<br>2. Нажмите «Добавить в заявку».<br>3. В корзине нажмите «Отправить заявку» и проверьте свои данные.<br>4. Откроется почта с готовым письмом — нажмите «Отправить».<br>После этого специалист центра свяжется с вами." +
        row([navBtn("📋 Прейскурант", function(){ showServices(); }, "teal")]);
    }],
    [/(как (записаться|попасть на прием|попасть к)|хочу записаться|запиши меня|записаться на прием|записаться к специалисту|запись к специалисту|запись на прием|на прием)$/, function(){ return bookingDirs(); }],
    [/(отменить запис|отмена запис|отменить заявк|передумал|не смогу прийти|перенести запис)/, function(){
      return "Запись отменяется в разделе «Мои заявки» — кнопка «Отменить запись» под нужной записью. Центр получит письмо об отмене. Чтобы перенести — отмените и запишитесь на другое время." +
        row([navBtn("📋 Мои заявки", function(){ openOrdersPanel(); }, "teal")]);
    }],
    [/(мои заявки|мои записи|мои заказы|статус заявк|статус запис|история заявок|где моя заявка|что с моей заявк)/, function(){
      return "Все ваши заявки, записи и заказы такси — в разделе «Мои заявки». Статус заявки подтверждает специалист центра по телефону или письмом." +
        row([navBtn("📋 Мои заявки", function(){ openOrdersPanel(); }, "teal")]);
    }],
    [/(какие документы|что взять с собой|нужен ли паспорт|паспорт нужен|снилс нужен)/, function(){
      return "Обычно нужны паспорт и СНИЛС. Точный список для конкретной услуги уточнит специалист, когда свяжется по заявке, или по телефону <b>" + esc(cd().phone||"") + "</b>.";
    }],
    [/(сколько ждать|(когда|через сколько|как скоро)[а-яa-z0-9 ]*(позвонят|перезвонят|ответят|свяжутся|обработают)|срок рассмотрения|как быстро)/, function(){
      return "Заявки обрабатываются в рабочее время филиала (" + esc(cd().hours||"") + "). Если ответа долго нет — позвоните: <b>" + esc(cd().phone||"") + "</b>.";
    }],
    [/(перезвон|обратн[а-яa-z0-9]* звонок|позвоните мне|свяжитесь со мной)/, function(){
      return "Оставьте заявку на обратный звонок — специалист перезвонит в удобное время." + row([navBtn("📞 Обратный звонок", function(){ showCallback(); }, "teal")]);
    }],
    [/(оператор|живой человек|живым человеком|поговорить с человеком|написать в центр|написать специалисту)/, function(){
      return "Связаться с центром можно по телефону <b>" + esc(cd().phone||"") + "</b>, по почте " + esc(cd().email||"") + " или в мессенджере." +
        row([navBtn("💬 Способы связи", function(){ showLiveChat(); }, "teal")]);
    }],
    [/(отзыв|оценить работу|поставить оценку|жалоб|недовол|претензи к центру)/, function(){
      return "Оценку и отзыв можно оставить в форме обратной связи — их читает руководство центра." + row([navBtn("⭐ Оставить отзыв", function(){ showFeedback(); }, "teal")]);
    }],
    [/(новост|анонс|объявлен)/, function(){ return "Новости и анонсы центра — в разделе «Новости»." + row([navBtn("📰 Новости", function(){ showNews(); }, "teal")]); }],
    [/(мероприят|афиш|концерт|событи)/, function(){ return "Афиша мероприятий центра — там же можно записаться." + row([navBtn("🎟️ Мероприятия", function(){ showEvents(); }, "teal")]); }],
    [/(фотогалере|фото центра|как выглядит центр)/, function(){ return "Фотографии центра — в фотогалерее." + row([navBtn("🖼️ Фотогалерея", function(){ showGallery(); }, "teal")]); }],
    [/(личный кабинет|мой профиль|мои данные|изменить (мои )?данные|анкет)/, function(t){
      if (/(госуслуг|портал|электрон)/.test(t)) return null;
      return "Личные данные и анкета получателя — в личном кабинете. Анкета заполняется по шагам и сама подставляется в заявки." +
        row([btn("📋 Заполнить анкету", function(){ editQuestionnaire(); return ""; }, { cl: "teal" }), navBtn("👤 Личный кабинет", function(){ openProfilePanel(); })]);
    }],
    [/(корзин|что в заявке|моя заявка)/, function(){
      if (!cart.length) return "Заявка пока пустая. Напишите, какая услуга нужна — найду и добавлю.";
      return null; /* пусть chatflow покажет состав */
    }],
    [/(сменить|поменять|изменить|выбрать|другой) (филиал|город)|(какие|сколько) (у вас )?филиал|филиалы|в каких городах|другие города/, function(){
      var b = Object.keys(CITY).filter(function(k){ return k !== currentCity; }).map(function(k){ return switchBtn(k); });
      return "Центр «Гармония» работает в филиалах: Губкинский, мкр. Пурпе, Муравленко, Ноябрьск, Тарко-Сале, пгт. Уренгой. Сейчас выбран «" + esc(cityName()) + "». Сменить можно здесь или нажав на название города вверху." + row(b);
    }],
    [/(шрифт|крупнее|мелко|не вижу текст|язык интерфейса|сменить язык|на английском|english|удалить (мои )?данные|очистить данные)/, function(){
      return "Размер шрифта, язык, филиал и очистка данных — в личном кабинете, раздел «Настройки»." + row([navBtn("⚙️ Открыть кабинет", function(){ openProfilePanel(); }, "teal")]);
    }],
    [/(персональн[а-яa-z0-9]* данн|мои данные защищ|конфиденциал|безопасно ли)/, function(){
      return "Ваши данные хранятся на этом устройстве и отправляются только в центр — в письме с заявкой, по согласию на обработку персональных данных (152-ФЗ).";
    }],
    [/(оплат|как платить|чем платить|наличн|картой (можно|оплатить)|по карте оплат|безнал)/, function(){
      return "Способ оплаты уточнит специалист центра, когда свяжется по вашей заявке. Можно также спросить по телефону <b>" + esc(cd().phone||"") + "</b>.";
    }]
  ];

  /* Услуги, которых обычно ищут, но в прейскурантах филиалов их нет. */
  var NOT_OFFERED = /(убор|уборк|помыть|помой|мыть|окна|полы|пыль|стирк|стирать|постират|глажк|погладить|химчистк|продукт|лекарств|аптек|покупк|доставк|готов(ить|ка)|приготов|еду(?= |$)|обед привез|парикмахер|подстрич|стрижк|ремонт|сантехник|электрик|дров|снег|огород|выгул|собак|кошк|юридическ[а-яa-z0-9]* защит в суде|кредит|займ|деньги в долг|бассейн|плаван|стоматолог|зуб|окулист|терапевт|анализ|прививк|узи|рентген)/;

  /* ─────────── Главный разбор ─────────── */
  function answer(raw){
    var t = norm(raw);
    if (!t) return "Напишите вопрос словами — например, «сколько стоит массаж шеи» или «как заказать такси».";

    var u = urgent(t); if (u) return u;

    /* Идёт оформление (такси, заявка) */
    if (C.isActive()) {
      if (/^(отмена|отменить|стоп|хватит|отмени|не надо|выход|назад в меню)$/.test(t)) { C.reset(); return "Оформление отменено. Чем ещё помочь?"; }
      var stA = smallTalk(t);
      if (stA && !/^(да|нет|один|двое|1|2)$/.test(t))
        return stA + "<br><br>Мы как раз оформляем " + (C.mode() === "taxi" ? "такси" : "заявку") + " — ответьте на последний вопрос выше или напишите «отмена».";
      if (C.mode() === "order" && C.step() === "pick") {
        /* выбор услуги — нашим точным поиском, а не старым */
        C.reset();
        return coreAnswer(t, raw) || "Не нашёл такую услугу. Напишите по-другому — например «массаж шеи» или «коляска».";
      }
      var step = C.handleStep(raw);
      if (step) return step;
    }
    if (/^(отмена|отменить|стоп|хватит|отмени)$/.test(t)) return "Сейчас ничего не оформляется — отменять нечего. Чем помочь?";

    /* Разговорное целиком */
    var st = smallTalk(t); if (st) return st;

    /* Приветствие/вежливость в начале длинной фразы — отрезаем и отвечаем по сути */
    var greet = "";
    if (GREET_RE.test(t)) { greet = helloFor(t) + hi() + "! "; t = t.replace(GREET_RE, "").trim(); }
    var guard = 0;
    while (LEAD_RE.test(t) && guard++ < 4) t = t.replace(LEAD_RE, "").trim();
    if (!t) return greet + "Чем могу помочь?";
    var core = coreAnswer(t, raw);
    return core ? greet + core : null;
  }

  function coreAnswer(t, raw){
    var u = urgent(t); if (u) return u;

    /* Моя поездка: какая машина, номер, когда приедет */
    if (/(как[а-яa-z0-9]* машин[а-я]* (приедет|будет|подадут)|номер машин|госномер|(когда|через сколько)[а-яa-z0-9 ]*(приедет|подадут|подъедет|такси|машин)|где (машина|такси)|моя поездка|мое такси|какое такси приедет)/.test(t)) {
      var ride = (typeof nextTaxiRide === "function") ? nextTaxiRide() : null;
      if (!ride) return "У вас нет предстоящих поездок на такси." + row([btn("🚕 Заказать такси", function(){ return C.startTaxi(); }, { echo: "Заказать такси" })]);
      return "Ваша поездка № " + esc(ride.num) + ": " + esc(ride.from) + " → " + esc(ride.to) + "." + carCardHtml(ride) +
        "Отследить машину на карте в пути нельзя — диспетчер позвонит перед подачей, если что-то изменится." +
        row([navBtn("📋 Мои заявки", function(){ openOrdersPanel(); }, "teal")]);
    }

    /* Такси: вопросы о правилах/цене — справка; иначе — оформление диалогом */
    if (/(такси|подвез|довез|отвез|поездк|трансфер|перевозк|вызвать машину|заказать машину)/.test(t)) {
      if (/(сколько|цена|стоимост|тариф|правил|когда|за сколько|во сколько|как заказ|можно ли|условия|льгот|бесплатн|кто может)/.test(t)) return taxiInfo(t);
      return C.startTaxi();
    }

    var sa = staffAnswer(t); if (sa) return sa;

    /* Оформить/отправить заявку целиком */
    if (/^(оформ[а-яa-z0-9]*|отправ[а-яa-z0-9]*)( мою| свою)? (заявк[а-яa-z0-9]*|заказ[а-яa-z0-9]*)$|^оформить$|^отправить заявку$/.test(t)) return C.startOrder();

    for (var i = 0; i < FAQ.length; i++) {
      if (FAQ[i][0].test(t)) { var r = FAQ[i][1](t); if (r) return r; }
    }

    /* Запись/заявка на услугу — сценарии chatflow (состав корзины и т.п.) */
    if (/(что в заявке|моя заявка|корзин)/.test(t) && cart.length) return C.route(raw);

    var wantBook = /(запиш|записат|запис|на прием|к специалист|попасть к|хочу к|нужен|нужна|нужно)/.test(t);
    var wantOrder = /(закаж|заказат|оформ|добав|в заявку)/.test(t);
    var wantWho = /(кто (проводит|ведет|ведёт|занимается|делает)|какой специалист|у кого)/.test(t);

    var r1 = search(t), g = topGroup(r1);
    var cat = catByRules(t);

    /* Раздела нет в этом филиале — сначала скажем, где он есть */
    if (cat && cat.missing) {
      var whereC = crossCat(cat.re);
      if (whereC.length) return "В филиале «" + esc(cityName()) + "» такой услуги нет, но она есть в " +
        whereC.map(function(k){ return "«" + CITY[k] + "»"; }).join(", ") + "." + row(whereC.slice(0,3).map(switchBtn));
    }

    /* Запрос про направление («к психологу», «логопед», «массаж»), без конкретной услуги */
    if (cat && !cat.missing) {
      var dir = structDirByCat(cat.id);
      var generic = r1.n <= 1 || g.length > 4 || !g.length;
      if (generic && (wantBook || wantWho) && dir) {
        var people = staffByNames(dir.resp || []);
        return (people.length ? "Направление «" + esc(dir.title) + "» ведёт " + people.map(function(p){ return esc(p.name); }).join(", ") + ". " : "") +
          "Выберите услугу — затем дату и время." +
          row([btn("📝 Записаться: " + esc(dir.title), function(){ return go(function(){ structGoto(cat.id); }); }),
               btn("Показать услуги и цены", function(){ return answerCategory(cat); }, { cl: "outline", echo: "Показать услуги и цены" })]);
      }
      if (generic) {
        var more = dir ? btn("📝 Записаться: " + esc(dir.title), function(){ return go(function(){ structGoto(cat.id); }); }) : null;
        if (g.length > 1) return answerList(g, "Нашёл " + g.length + " " + plural(g.length, ["услугу","услуги","услуг"]) + " — раздел «" + esc(cat.name) + "»:" +
          (wantBook && !dir ? "<br>Выберите услугу и добавьте в заявку — специалист свяжется и назначит время. Или позвоните: <b>" + esc(cd().phone||"") + "</b>." : ""), more);
        if (!g.length) return answerCategory(cat);
      }
    }

    if (g.length === 1 || (g.length > 1 && g.every(function(x){ return norm(x.name) === norm(g[0].name); }))) {
      var it = g[0];
      if (wantOrder && !structFor(it) && !/перевозк/i.test(it.catName)) return C.addService(asSvc(it));
      return answerService(it, wantWho ? "Вот кто и как проводит эту услугу:" : null);
    }
    if (g.length > 1) {
      var head = /(сколько|цена|стоим)/.test(t) ? "Цены по вашему запросу:" : "Нашёл " + g.length + " " + plural(g.length, ["услугу","услуги","услуг"]) + " по запросу:";
      return answerList(g, head);
    }

    /* Раздела нет в этом филиале — подскажем, где есть */
    if (cat && cat.missing) {
      var where = crossCat(cat.re);
      if (where.length) return "В филиале «" + esc(cityName()) + "» такого раздела нет, но он есть в " +
        where.map(function(k){ return "«" + CITY[k] + "»"; }).join(", ") + "." + row(where.slice(0,3).map(switchBtn));
    }

    /* Услуги, которых в центре нет (уборка, продукты, бассейн…) — честно, без «похожих» */
    if (NOT_OFFERED.test(t)) {
      var cbN = crossBranch(t);
      if (cbN) return "В филиале «" + esc(cityName()) + "» такой услуги нет. В филиале «" + CITY[cbN[0].city] + "» есть: <b>" + esc(cbN[0].items[0].name) + "</b> — " + money(cbN[0].items[0].price) + "." + row([switchBtn(cbN[0].city)]);
      return "Такой услуги нет в прейскуранте филиала «" + esc(cityName()) + "». Уточните, пожалуйста, по телефону <b>" + esc(cd().phone||"") + "</b> — подскажут, куда обратиться." +
        row([navBtn("📋 Все услуги и цены", function(){ showServices(); }, "teal"), navBtn("📞 Обратный звонок", function(){ showCallback(); })]);
    }

    /* Есть частичное совпадение — предложим, но честно скажем, что точного нет */
    if (r1.list.length && r1.list[0].cov >= 0.5 && r1.n >= 2) {
      var part = r1.list.filter(function(x){ return x.cov === r1.list[0].cov; }).slice(0, 6).map(function(x){ return x.it; });
      return answerList(part, "Точно такой услуги не нашёл. Возможно, подойдёт что-то из этого:");
    }

    /* В других филиалах */
    var cb = r1.n ? crossBranch(t) : null;
    if (cb) {
      var f = cb[0], x = f.items[0];
      return "В филиале «" + esc(cityName()) + "» такой услуги нет. В филиале «" + CITY[f.city] + "» есть: <b>" + esc(x.name) + "</b> — " + money(x.price) + "." +
        (cb.length > 1 ? " Также есть в: " + cb.slice(1).map(function(c){ return "«" + CITY[c.city] + "»"; }).join(", ") + "." : "") +
        row([switchBtn(f.city)]);
    }

    if (NOT_OFFERED.test(t) || (wantBook || wantOrder || /(сколько|цена|стоим|есть ли|у вас есть)/.test(t)) && r1.n)
      return "Такой услуги нет в прейскуранте филиала «" + esc(cityName()) + "». Уточните, пожалуйста, по телефону <b>" + esc(cd().phone||"") + "</b> — подскажут, куда обратиться." +
        row([navBtn("📋 Все услуги и цены", function(){ showServices(); }, "teal"), navBtn("📞 Обратный звонок", function(){ showCallback(); })]);

    return null;
  }

  function fallback(raw){
    return "Не совсем понял вопрос" + hi() + ". Попробуйте написать проще — например:<br>• «сколько стоит массаж шеи»<br>• «нужна коляска напрокат»<br>• «записаться к логопеду»<br>• «как заказать такси»<br>Или позвоните: <b>" + esc(cd().phone||"") + "</b>." +
      row([navBtn("📋 Все услуги и цены", function(){ showServices(); }, "teal"),
           btn("📝 Записаться к специалисту", function(){ return bookingDirs(); }, { cl: "outline", echo: "Записаться к специалисту" })]);
  }

  /* ─────────── Подключение к чату ─────────── */
  window.askFlow = function(query){
    addMsg(esc(query), false);
    var html = null;
    try { html = answer(query); } catch (e) { console.error("botbrain:", e); }
    C.say(html || fallback(query));
  };

  /* Для отладки и тестов */
  window.BotBrain = { answer: answer, search: function(q){ return search(q).list.slice(0,5).map(function(x){ return [x.it.name, x.cov, +x.score.toFixed(2)]; }); }, facts: facts };
})();
