/* Service worker «Гармония».
   Стратегия network-first: всегда сначала сеть (никогда не отдаёт устаревшее,
   пока есть интернет), кэш — только резерв для офлайна. Это безопасно при
   частых обновлениях сайта: свежие файлы подхватываются сразу. */
var CACHE = "garmoniya-v5";
var CORE = [
  "./","./index.html",
  "./css/styles.css",
  "./js/data.js","./js/booking.js","./js/db.js","./js/extras.js",
  "./js/features.js","./js/admin.js","./js/app.js","./js/header.js",
  "./js/polish.js","./js/extra.js","./js/mascot3d.js",
  "./css/enhance.css","./js/enhance.js","./js/tabdrag.js","./js/navfix.js",
  "./manifest.json","./img/logo-icon.png"
];

self.addEventListener("install", function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.allSettled(CORE.map(function(u){ return c.add(u).catch(function(){}); }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return; // внешние (VK, шрифты, карты) не трогаем
  e.respondWith(
    fetch(req).then(function(res){
      if(res && res.status === 200 && res.type === "basic"){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      }
      return res;
    }).catch(function(){
      return caches.match(req).then(function(hit){
        return hit || caches.match("./index.html");
      });
    })
  );
});
