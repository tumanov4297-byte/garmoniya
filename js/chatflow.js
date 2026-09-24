/* ═══════════════════════════════════════════════════════════════════
   chatflow.js — «умная» часть чат-бота «Гармония».

   Что умеет:
   1) Знает весь прейскурант филиала до мелочей: название, цена,
      цена по карте «Морошка», длительность, раздел. Отвечает на
      «сколько стоит…», «что входит в раздел…», «есть ли у вас…».
   2) Оформляет заявку на услуги прямо в переписке: находит услугу,
      кладёт в корзину, собирает ФИО и телефон и отправляет заявку
      тем же путём, что и экран корзины.
   3) Заказывает социальное такси диалогом: откуда, куда, дата,
      время, пассажиры, тариф — и предупреждает, что заказ
      принимается не позднее чем за сутки.

   Файл ничего не удаляет и не переписывает: он только расширяет
   askFlow() и пользуется существующими функциями приложения.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  /* ─────────── Состояние диалога ─────────── */
  var CF = { mode:null, step:null, data:{} };
  function reset(){ CF = { mode:null, step:null, data:{} }; }
  window.cfReset = reset;

  /* ─────────── Кнопки: реестр, чтобы не городить строки в onclick ─────────── */
  var BTNS = [];
  window.cfBtn = function(i){
    var b = BTNS[i];
    if (!b) return;
    if (b.echo) addMsg(b.echo, false);
    var out = b.run();
    if (out) say(out);
  };
  function btn(label, run, opts){
    opts = opts || {};
    BTNS.push({ run:run, echo:opts.echo });
    return '<button type="button" class="act-btn ' + (opts.cl||"teal") + '" ' +
           'onclick="cfBtn(' + (BTNS.length-1) + ')">' + label + '</button>';
  }
  function row(buttons){
    return buttons.length ? '<div class="asst-actions">' + buttons.join("") + '</div>' : "";
  }
  function say(html){
    if (typeof showTyping === "function") showTyping(function(){ addMsg(html, true); });
    else addMsg(html, true);
  }
  function esc(s){ return String(s==null?"":s).replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function norm(s){ return (typeof asstNorm === "function") ? asstNorm(s) : String(s||"").toLowerCase(); }
  function money(n){ return Number(n).toLocaleString("ru-RU") + " ₽"; }

  /* ═══════════ 1. База знаний по услугам ═══════════ */

  /* Плоский индекс: одна запись — одна услуга из прейскуранта филиала. */
  function index(){
    if (typeof servicesData === "undefined" || !servicesData || !servicesData.length) return [];
    var out = [];
    servicesData.forEach(function(cat){
      (cat.items||[]).forEach(function(it, idx){
        var dur = String(it.n||"").match(/(\d+)\s*мин/);
        out.push({
          uid: cat.id*1000 + idx, catId: cat.id, catName: cat.name, icon: cat.icon || "",
          idx: idx, name: it.n, price: it.p, mor: (it.m==null ? null : it.m),
          minutes: dur ? parseInt(dur[1]) : null, key: norm(it.n + " " + cat.name)
        });
      });
    });
    return out;
  }

  /* Поиск услуги по словам запроса.
     Русские окончания гасим сравнением по основе слова (первые 5 букв),
     поэтому «уборку квартиры» находит «Уборка квартиры». */
  var STOP = ["услуга","услуги","услугу","сколько","стоит","цена","стоимость","хочу","нужен","нужна","нужно",
              "закажи","заказать","заказ","оформить","заявка","заявку","запиши","записаться","можно","есть",
              "вас","мне","для","как","что","это","пожалуйста","подскажите","хотел","хотела","бы"];
  function queryWords(q){
    return norm(q).split(" ").filter(function(w){ return w.length > 2 && STOP.indexOf(w) < 0; });
  }

  /* Совпадение по общей основе: «уборку» и «уборка» имеют общее начало «уборк». */
  function commonPrefix(a, b){
    var n = Math.min(a.length, b.length), i = 0;
    while (i < n && a[i] === b[i]) i++;
    return i;
  }
  function matches(word, tokens){
    var best = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t === word) return word.length + 3;                 /* точное слово */
      if (t.length < 4 || word.length < 4) continue;          /* короткие слова не сравниваем */
      var cp = commonPrefix(word, t);
      if (cp >= 4 && cp >= Math.min(word.length, t.length) - 3) best = Math.max(best, cp);
    }
    return best;
  }
  function findServices(q, limit){
    var words = queryWords(q);
    if (!words.length) return [];
    var res = [];
    index().forEach(function(s){
      var tokens = s.key.split(/[^а-яёa-z0-9]+/i).filter(Boolean);
      var score = 0, hits = 0;
      words.forEach(function(w){
        var m = matches(w, tokens);
        if (m) { score += m; hits++; }
      });
      if (hits) res.push({ s:s, score:score, hits:hits });
    });
    /* сначала те, где совпало больше слов запроса */
    res.sort(function(a,b){ return (b.hits - a.hits) || (b.score - a.score); });
    var topHits = res.length ? res[0].hits : 0;
    res = res.filter(function(r){ return r.hits === topHits && r.score >= 4; });
    var out = res.slice(0, limit || 6).map(function(r){ return r.s; });
    /* full = нашлись все значимые слова запроса, а не одно из нескольких */
    out.full = topHits >= words.length;
    return out;
  }

  /* Карточка услуги со всеми подробностями. */
  function serviceCard(s){
    var rows = [
      ["Раздел", esc(s.catName)],
      ["Цена", money(s.price)]
    ];
    if (s.mor != null && s.mor !== s.price) rows.push(["По карте «Морошка»", money(s.mor)]);
    if (s.minutes) rows.push(["Длительность", s.minutes + " мин"]);
    return '<div class="cf-card">' +
      '<div class="cf-card-ttl">' + esc(s.name) + '</div>' +
      rows.map(function(r){
        return '<div class="cf-row"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
      }).join("") +
    '</div>';
  }

  function priceLine(s){
    return "• " + esc(s.name) + " — <b>" + money(s.price) + "</b>" +
           (s.mor != null && s.mor !== s.price ? ' <span class="cf-mor">по «Морошке» ' + money(s.mor) + "</span>" : "");
  }

  /* Ответ про конкретную услугу + кнопки действий. */
  function answerService(s){
    return "Вот что у меня по этой услуге:" + serviceCard(s) +
      row([
        btn("Добавить в заявку", function(){ return addService(s); }, { echo:"Добавить в заявку: " + s.name }),
        btn("Открыть в прейскуранте", function(){ showCategory(s.catId, s.uid); return ""; }, { cl:"outline" })
      ]);
  }

  /* Несколько подходящих услуг — даём выбрать. */
  function answerChoice(list, head){
    var buttons = list.slice(0,5).map(function(s){
      return btn(esc(s.name) + " · " + money(s.price), function(){ return answerService(s); },
                 { cl:"outline", echo:s.name });
    });
    return (head || "Нашёл несколько подходящих услуг — какая нужна?") + row(buttons);
  }

  /* Весь раздел целиком. */
  function answerCategory(cat){
    var lines = (cat.items||[]).slice(0,14).map(function(it, i){
      return priceLine({ name:it.n, price:it.p, mor:(it.m==null?null:it.m) });
    }).join("<br>");
    var more = (cat.items||[]).length > 14 ? "<br>…и ещё " + ((cat.items||[]).length - 14) + " услуг в разделе." : "";
    return "<b>" + esc(cat.name) + "</b> — " + (cat.items||[]).length + " услуг:<br><br>" + lines + more +
      row([ btn("Открыть раздел", function(){ showCategory(cat.id); return ""; }) ]);
  }

  function findCategory(q){
    var nq = norm(q);
    if (typeof servicesData === "undefined") return null;
    var best = null, bs = 0;
    servicesData.forEach(function(c){
      var words = norm(c.name).split(" ").filter(function(w){ return w.length > 3; });
      var sc = 0;
      words.forEach(function(w){ if (nq.indexOf(w) >= 0) sc += w.length; });
      if (sc > bs) { bs = sc; best = c; }
    });
    return bs >= 5 ? best : null;
  }

  /* ═══════════ 2. Заявка на услуги прямо из чата ═══════════ */

  function addService(s){
    addToCart(s.uid, s.name, (hasMoroshka && s.mor != null) ? s.mor : s.price, null, s.price, s.mor);
    var total = cart.reduce(function(a,i){ return a + i.price*i.qty; }, 0);
    return "Добавил в заявку: <b>" + esc(s.name) + "</b>.<br>Сейчас в заявке " + cart.length +
      (cart.length === 1 ? " услуга" : " услуг") + " на " + money(total) + "." +
      row([
        btn("Оформить заявку", function(){ return startOrder(); }, { echo:"Оформить заявку" }),
        btn("Добавить ещё услугу", function(){ CF.mode="order"; CF.step="pick";
              return "Какую услугу добавить? Напишите название или направление — например «уборка» или «массаж»."; },
            { cl:"outline", echo:"Добавить ещё услугу" }),
        btn("Показать заявку", function(){ openCart(); return ""; }, { cl:"outline" })
      ]);
  }

  /* Оформление: проверяем ФИО и телефон, показываем состав, отправляем. */
  function startOrder(){
    if (!cart.length) {
      CF.mode = "order"; CF.step = "pick";
      return "В заявке пока пусто. Напишите, какая услуга нужна — найду её в прейскуранте и добавлю.";
    }
    if (!clientName || clientName === "Гость") { CF.mode="order"; CF.step="name";
      return "Оформляю заявку. Напишите, пожалуйста, <b>фамилию, имя и отчество</b> получателя услуг."; }
    if (!clientPhone) { CF.mode="order"; CF.step="phone";
      return "Остался телефон для связи — напишите номер, например +7 (999) 000-00-00."; }
    return orderSummary();
  }

  function orderSummary(){
    var total = cart.reduce(function(a,i){ return a + i.price*i.qty; }, 0);
    var lines = cart.map(function(i){
      return '<div class="cf-row"><span>' + esc(i.name) + (i.qty>1 ? " ×"+i.qty : "") + "</span><b>" + money(i.price*i.qty) + "</b></div>";
    }).join("");
    CF.mode = "order"; CF.step = "confirm";
    return "Проверьте заявку:" +
      '<div class="cf-card">' + lines +
      '<div class="cf-row cf-total"><span>Итого</span><b>' + money(total) + "</b></div>" +
      '<div class="cf-row"><span>Получатель</span><b>' + esc(clientName) + "</b></div>" +
      '<div class="cf-row"><span>Телефон</span><b>' + esc(clientPhone) + "</b></div>" +
      '<div class="cf-row"><span>Филиал</span><b>' + esc(currentCityName) + "</b></div></div>" +
      row([
        btn("Отправить заявку", function(){ reset(); sendOrder(); return ""; }, { echo:"Отправить заявку" }),
        btn("Изменить состав", function(){ reset(); openCart(); return ""; }, { cl:"outline" })
      ]);
  }

  /* ═══════════ 3. Заказ такси диалогом ═══════════ */

  var MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

  function parseDate(text){
    var t = norm(text), now = new Date();
    function iso(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
    if (t.indexOf("послезавтра") >= 0) { var d2 = new Date(now); d2.setDate(d2.getDate()+2); return iso(d2); }
    if (t.indexOf("завтра") >= 0) { var d1 = new Date(now); d1.setDate(d1.getDate()+1); return iso(d1); }
    if (t.indexOf("сегодня") >= 0) return iso(now);
    var m = t.match(/(\d{1,2})[.\-\/\s](\d{1,2})(?:[.\-\/\s](\d{2,4}))?/);
    if (m) {
      var y = m[3] ? (m[3].length === 2 ? 2000 + parseInt(m[3]) : parseInt(m[3])) : now.getFullYear();
      var d = new Date(y, parseInt(m[2]) - 1, parseInt(m[1]));
      if (!m[3] && d < now) d.setFullYear(y + 1);
      return isNaN(d) ? null : iso(d);
    }
    var m2 = t.match(/(\d{1,2})\s+([а-я]+)/);
    if (m2) {
      var mi = MONTHS.findIndex(function(name){ return name.indexOf(m2[2].slice(0,4)) === 0; });
      if (mi >= 0) {
        var dd = new Date(now.getFullYear(), mi, parseInt(m2[1]));
        if (dd < now) dd.setFullYear(now.getFullYear() + 1);
        return iso(dd);
      }
    }
    return null;
  }

  function parseTime(text){
    var t = norm(text);
    var m = t.match(/(\d{1,2})[:.\s-](\d{2})/);
    if (m) {
      var h = parseInt(m[1]), mi = parseInt(m[2]);
      if (h < 24 && mi < 60) return String(h).padStart(2,"0") + ":" + String(mi).padStart(2,"0");
    }
    var m2 = t.match(/(?:^|\D)(\d{1,2})\s*(?:час|ч|утра|вечера|дня)?\s*$/);
    if (m2) { var h2 = parseInt(m2[1]); if (h2 < 24) return String(h2).padStart(2,"0") + ":00"; }
    return null;
  }

  function fmtDate(iso){
    var p = iso.split("-");
    return p[2] + " " + MONTHS[parseInt(p[1]) - 1];
  }
  function fmtShort(iso){ var p = iso.split("-"); return p[2] + "." + p[1]; }

  /* Ближайшая дата поездки и приёмное окно — из общих правил такси. */
  function earliestRide(){ return taxiEarliestRideDate(); }
  function rulesLine(){
    return "Заявку принимают <b>накануне поездки с " + TAXI_RULES.orderFrom + " до " + TAXI_RULES.orderTo +
           "</b>, машина работает <b>с " + TAXI_RULES.rideFrom + " до " + TAXI_RULES.rideTo + "</b>.";
  }

  function startTaxi(){
    var tar = (typeof getTaxiTariffs === "function") ? getTaxiTariffs() : { items: [] };
    if (!tar.items.length) {
      return "В филиале «" + esc(currentCityName) + "» перевозка не оказывается. Уточните возможность поездки по телефону центра." +
        row([ btn("Контакты центра", function(){ showContacts(); return ""; }, { cl:"outline" }) ]);
    }
    CF.mode = "taxi"; CF.step = "from"; CF.data = {};
    var first = earliestRide();
    var closed = !taxiOrderWindowOpen();
    return '<div class="cf-warn">' + rulesLine() +
      (closed ? " Сейчас приём заявок закрыт, поэтому ближайшая возможная поездка — <b>" + fmtDate(first) + "</b>."
              : " Ближайшая возможная поездка — <b>" + fmtDate(first) + "</b>.") + "</div>" +
      "Оформим заказ по шагам. <b>Откуда вас забрать?</b> Напишите адрес — улицу и дом.";
  }

  function taxiTariffStep(){
    CF.step = "tariff";
    var tar = getTaxiTariffs();
    var buttons = tar.items.map(function(t){
      var price = (hasMoroshka && t.moroshka != null) ? t.moroshka : t.base;
      return btn(esc(t.label) + " · " + money(price), function(){
        CF.data.tariff = t; CF.data.isFree = false; CF.data.price = price;
        return taxiConfirmStep();
      }, { cl:"outline", echo:t.label });
    });
    var elig = (typeof checkFreeTaxiEligibility === "function") ? checkFreeTaxiEligibility() : { eligible:false };
    var quota = (typeof getFreeTaxiQuota === "function") ? getFreeTaxiQuota() : { remaining:0, limit:0 };
    if (elig.eligible && quota.remaining > 0) {
      buttons.unshift(btn("Льготная поездка · бесплатно", function(){
        CF.data.tariff = { idx:null, label:"Социальное такси — льготная поездка", duration:"30", base:0, moroshka:null };
        CF.data.isFree = true; CF.data.price = 0;
        return taxiConfirmStep();
      }, { echo:"Льготная поездка" }));
    }
    return "Остался тариф. " + (elig.eligible && quota.remaining > 0
        ? "У вас есть право на льготные поездки, осталось " + quota.remaining + " из " + quota.limit + " в этом году."
        : "Выберите подходящий:") + row(buttons);
  }

  function taxiConfirmStep(){
    CF.step = "confirm";
    var d = CF.data;
    return "Проверьте заказ:" +
      '<div class="cf-card">' +
      '<div class="cf-row"><span>Откуда</span><b>' + esc(d.from) + "</b></div>" +
      '<div class="cf-row"><span>Куда</span><b>' + esc(d.to) + "</b></div>" +
      '<div class="cf-row"><span>Когда</span><b>' + fmtDate(d.date) + ", " + d.time + "</b></div>" +
      '<div class="cf-row"><span>Пассажиров</span><b>' + (d.pax||1) + "</b></div>" +
      '<div class="cf-row"><span>Тариф</span><b>' + esc(d.tariff.label) + "</b></div>" +
      '<div class="cf-row cf-total"><span>Стоимость</span><b>' + (d.isFree ? "Бесплатно" : money(d.price)) + "</b></div>" +
      '<div class="cf-row"><span>Получатель</span><b>' + esc(clientName) + " · " + esc(clientPhone) + "</b></div></div>" +
      row([
        btn("Отправить заказ", function(){ return taxiSend(); }, { echo:"Отправить заказ" }),
        btn("Отменить", function(){ reset(); return "Отменил. Если понадобится — напишите «такси», начнём заново."; }, { cl:"outline" })
      ]);
  }

  function taxiSend(){
    var d = CF.data;
    var rule = taxiCheckRide(d.date, d.time);
    if (!rule.ok) { CF.step = "date"; return '<div class="cf-warn">' + esc(rule.message) + "</div>Напишите другую дату."; }
    var existing = JSON.parse(localStorage.getItem("taxiHistory") || "[]");
    var clash = existing.find(function(o){ return o.date === d.date && o.time === d.time && o.status !== "cancelled"; });
    if (clash) { CF.step = "time";
      return "На это время у вас уже есть заказ " + esc(clash.num) + ". Напишите другое время поездки."; }
    var res = taxiSubmitOrder({
      tariff:d.tariff, isFree:d.isFree, price:d.price, from:d.from, to:d.to,
      date:d.date, time:d.time, comment:"Заказ оформлен через чат-бота",
      pax:d.pax||1, passengerNames:[clientName].filter(Boolean)
    });
    reset();
    return "Готово! Заказ такси оформлен, талон <b>" + res.ticketNum + "</b>." +
      '<div class="cf-card"><div class="cf-row"><span>Маршрут</span><b>' + esc(d.from) + " → " + esc(d.to) + "</b></div>" +
      '<div class="cf-row"><span>Подача</span><b>' + fmtDate(d.date) + ", " + d.time + "</b></div>" +
      '<div class="cf-row"><span>Стоимость</span><b>' + (d.isFree ? "Бесплатно" : money(d.price)) + "</b></div></div>" +
      "Открылся почтовый клиент — нажмите «Отправить», и заявка уйдёт диспетчеру. Он свяжется с вами для подтверждения." +
      row([ btn("Мои заказы", function(){ openOrdersPanel(); return ""; }, { cl:"outline" }) ]);
  }

  /* ═══════════ Обработка шагов диалога ═══════════ */

  function handleStep(q){
    var t = q.trim();
    if (/^(отмена|стоп|хватит|отменить|назад в меню)$/i.test(t)) { reset(); return "Отменил. Чем ещё помочь?"; }

    if (CF.mode === "order") {
      if (CF.step === "pick") {
        var list = findServices(t, 6);
        if (!list.length) return "Не нашёл такую услугу в прейскуранте филиала «" + esc(currentCityName) +
          "». Попробуйте другое название или откройте полный список." +
          row([ btn("Открыть прейскурант", function(){ reset(); showServices(); return ""; }, { cl:"outline" }) ]);
        reset();
        if (list.length === 1 && list.full) return answerService(list[0]);
        return answerChoice(list, list.full ? null : "Точного совпадения не нашёл. Возможно, подойдёт что-то из этого:");
      }
      if (CF.step === "name") {
        if (t.split(/\s+/).length < 2) return "Напишите фамилию, имя и отчество полностью — так специалист найдёт вас в базе.";
        clientName = t; localStorage.setItem("clientName", clientName);
        if (!clientPhone) { CF.step = "phone"; return "Записал. Теперь номер телефона для связи."; }
        return orderSummary();
      }
      if (CF.step === "phone") {
        var digits = t.replace(/\D/g, "");
        if (digits.length < 10) return "Похоже, в номере не хватает цифр. Напишите телефон полностью, например +7 (999) 000-00-00.";
        clientPhone = t; localStorage.setItem("clientPhone", clientPhone);
        return orderSummary();
      }
      if (CF.step === "confirm") return orderSummary();
    }

    if (CF.mode === "taxi") {
      if (CF.step === "from") {
        if (t.length < 4) return "Напишите адрес подробнее — улицу и номер дома.";
        CF.data.from = t; CF.step = "to";
        return "Записал: <b>" + esc(t) + "</b>.<br><b>Куда едем?</b> Напишите адрес назначения.";
      }
      if (CF.step === "to") {
        if (t.length < 4) return "Напишите адрес назначения подробнее — улицу и номер дома.";
        CF.data.to = t; CF.step = "date";
        var first = earliestRide();
        return "Маршрут: <b>" + esc(CF.data.from) + " → " + esc(t) + "</b>.<br>" +
          "<b>На какую дату?</b> Можно словами — «завтра», «послезавтра» — или числом, например " + fmtShort(first) +
          ". Ближайшая доступная дата — <b>" + fmtDate(first) + "</b>.";
      }
      if (CF.step === "date") {
        var d = parseDate(t);
        if (!d) return "Не разобрал дату. Напишите «завтра», «послезавтра» или в формате 15.10.";
        var chk = taxiCheckRide(d, TAXI_RULES.rideFrom);
        if (!chk.ok && chk.code === "early") {
          return '<div class="cf-warn">' + rulesLine() + "</div>На эту дату оформить не получится. Ближайшая доступная — <b>" +
            fmtDate(chk.min) + "</b>. Напишите другую дату.";
        }
        CF.data.date = d; CF.step = "time";
        return "Дата: <b>" + fmtDate(d) + "</b>.<br><b>Во сколько подать машину?</b> Машина работает с " +
          TAXI_RULES.rideFrom + " до " + TAXI_RULES.rideTo + " — например, 09:30.";
      }
      if (CF.step === "time") {
        var tm = parseTime(t);
        if (!tm) return "Не разобрал время. Напишите в формате 09:30 или просто «10».";
        var check = taxiCheckRide(CF.data.date, tm);
        if (!check.ok) {
          if (check.code === "hours")
            return '<div class="cf-warn">Машина работает с ' + TAXI_RULES.rideFrom + " до " + TAXI_RULES.rideTo +
              ", позже подачи нет.</div>Напишите время в этом промежутке — например, 09:30 или 17:00.";
          CF.step = "date";
          return '<div class="cf-warn">' + esc(check.message) + "</div>Напишите другую дату.";
        }
        CF.data.time = tm; CF.step = "pax";
        return "Подача: <b>" + fmtDate(CF.data.date) + ", " + tm + "</b>.<br><b>Сколько человек поедет?</b>" +
          row([
            btn("Один", function(){ CF.data.pax = 1; return taxiTariffStep(); }, { cl:"outline", echo:"Один" }),
            btn("Двое", function(){ CF.data.pax = 2; return taxiTariffStep(); }, { cl:"outline", echo:"Двое" })
          ]);
      }
      if (CF.step === "pax") {
        var n = parseInt(t.replace(/\D/g, "")) || 1;
        CF.data.pax = Math.min(2, Math.max(1, n));
        return taxiTariffStep();
      }
      if (CF.step === "tariff") return taxiTariffStep();
      if (CF.step === "confirm") return taxiConfirmStep();
    }
    return null;
  }

  /* ═══════════ Разбор нового сообщения ═══════════ */

  function route(q){
    var t = norm(q);

    var stepAnswer = CF.mode ? handleStep(q) : null;
    if (stepAnswer) return stepAnswer;

    /* Такси */
    if (/такси|машин[ау]|довез|подвез|перевозк/.test(t) && !/сколько стоит|цена|тариф[ыи]?$/.test(t)) return startTaxi();

    /* Оформление заявки */
    if (/оформ|заказ|закаж|хочу|нужн[аоы]|добав|запиши|запис/.test(t)) {
      var found = findServices(q, 6);
      if (found.length === 1 && found.full) return answerService(found[0]);
      if (found.length) return answerChoice(found, found.full ? null : "Точного совпадения не нашёл. Возможно, подойдёт что-то из этого:");
      if (/заявк|оформ|заказ/.test(t) && cart.length) return startOrder();
      if (/заявк|оформ|заказ/.test(t)) {
        CF.mode = "order"; CF.step = "pick";
        return "Готов оформить заявку. Напишите, какая услуга нужна — например «уборка квартиры» или «массаж».";
      }
    }

    /* Состав заявки */
    if (/что в заявке|моя заявка|корзин/.test(t)) {
      if (!cart.length) return "Заявка пока пустая. Напишите, какая услуга нужна — найду и добавлю.";
      return orderSummary();
    }

    /* Цена / подробности услуги */
    if (/сколько стоит|цена|стоимость|сколько по времени|длительност|сколько минут|входит ли|есть ли/.test(t)) {
      var byCat = findCategory(q);
      var svc = findServices(q, 6);
      if (svc.length === 1 && svc.full) return answerService(svc[0]);
      if (svc.length) return answerChoice(svc, svc.full ? "Вот что нашлось по вашему запросу — какая услуга нужна?" : "Точного совпадения не нашёл. Возможно, подойдёт что-то из этого:");
      if (byCat) return answerCategory(byCat);
    }

    /* Раздел целиком */
    if (/что входит|какие услуги|что есть в разделе|список|перечень/.test(t)) {
      var cat = findCategory(q);
      if (cat) return answerCategory(cat);
    }

    /* Прямое совпадение с услугой без ключевых слов */
    var direct = findServices(q, 4);
    if (direct.length === 1 && direct.full) return answerService(direct[0]);
    if (direct.length > 1 && direct.full) {
      var cat2 = findCategory(q);
      if (cat2) return answerCategory(cat2);
      return answerChoice(direct, "Вот что нашлось по запросу:");
    }

    return null; /* дальше отвечает обычный smartAsk */
  }

  /* ═══════════ Подключение к чату ═══════════ */

  var baseAskFlow = window.askFlow;
  window.askFlow = function(query){
    addMsg(query, false);
    var html = null;
    try { html = route(query); }
    catch (e) { console.error("chatflow:", e); reset(); }
    if (html) { say(html); return; }
    showTyping(function(){
      var res = smartAsk(query);
      var out = res.answer;
      if (res.actions && res.actions.length) {
        out += '<div class="asst-actions">' + res.actions.map(function(a){
          return '<button type="button" class="act-btn ' + (a.cl||"teal") + '" onclick="asstGo(\'' + a.fn + '\'' +
                 (a.arg !== undefined ? "," + a.arg : "") + (a.arg2 !== undefined ? "," + a.arg2 : "") + ')">' + a.label + "</button>";
        }).join("") + "</div>";
      }
      addMsg(out, true);
    });
  };

  /* Быстрые подсказки под приветствием бота. */
  window.cfHints = function(){
    return row([
      btn("Заказать такси", function(){ return startTaxi(); }, { echo:"Заказать такси" }),
      btn("Оформить заявку", function(){ return startOrder(); }, { cl:"outline", echo:"Оформить заявку" }),
      btn("Что есть в прейскуранте", function(){ reset(); showServices(); return ""; }, { cl:"outline" })
    ]);
  };
})();
