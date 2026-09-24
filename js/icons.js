/* Единый набор линейных иконок «Гармония».
   Одинаково выглядят на Android, iPhone и Windows — в отличие от эмодзи.
   Использование: ico("taxi")  →  строка с <svg>. */
(function(){
  var P='<svg class="ic" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var S={
    list:'<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    taxi:'<path d="M5 17h14M4 17v-4l2-5h12l2 5v4"/><path d="M9 8V5h6v3"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
    users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 15c2.4.5 4 2.1 4 5"/>',
    phone:'<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4 5.2 2 2 0 0 1 6 3z"/>',
    ticket:'<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"/><path d="M14 6v12"/>',
    news:'<path d="M4 5h12a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5z"/><path d="M18 9h2v8a2 2 0 0 1-2 2"/><path d="M7 9h6M7 13h6M7 16h4"/>',
    pin:'<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    image:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M4 17l4.5-4.5L13 17l3-2.5 4 3.5"/>',
    star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z"/>',
    bag:'<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    user:'<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3-6 7-6s7 2.4 7 6"/>',
    chart:'<path d="M4 20h16"/><rect x="6" y="11" width="3" height="6" rx="1"/><rect x="11" y="7" width="3" height="10" rx="1"/><rect x="16" y="13" width="3" height="4" rx="1"/>',
    chat:'<path d="M20 15a3 3 0 0 1-3 3H9l-4 3v-3.6A3 3 0 0 1 4 15V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8z"/>',
    gear:'<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/>',
    trash:'<path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.6 2.6L16 9.6"/>',
    warn:'<path d="M12 4l9 16H3l9-16z"/><path d="M12 10v4M12 17.2v.1"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8v.1"/>'
  };
  window.ico=function(name,cls){
    var body=S[name]||S.info;
    return P.replace('class="ic"','class="ic'+(cls?' '+cls:'')+'"')+body+'</svg>';
  };
  window.ICONS=S;
})();
