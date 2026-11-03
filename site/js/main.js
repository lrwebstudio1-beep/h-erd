// Hotel Erdano — booking form + lazy videos. The page works without this file;
// it only pre-fills the WhatsApp/email message with the chosen dates.
(function () {
  'use strict';

  var PHONE = '355684950566';
  var EMAIL = 'hotelerdano2025@gmail.com';
  var DAY = 86400000;

  var dataEl = document.getElementById('i18n');
  var t = null;
  try { t = dataEl ? JSON.parse(dataEl.textContent) : null; } catch (e) { t = null; }

  var ci = document.getElementById('ci');
  var co = document.getElementById('co');
  var gu = document.getElementById('gu');
  var wa = document.getElementById('wa-book');
  var mail = document.getElementById('mail-book');
  var note = document.getElementById('nights');

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  // Local calendar date as YYYY-MM-DD (toISOString would give the UTC date).
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(v, n) { var p = v.split('-'); return iso(new Date(+p[0], p[1] - 1, +p[2] + n)); }
  function fmt(v) { var p = v.split('-'); return p[2] + '.' + p[1] + '.' + p[0]; }

  // Only well-formed values ever reach the outgoing message, whatever the DOM was tampered to hold.
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function validDate(v) { return DATE_RE.test(v) ? v : ''; }
  function validGuests(v) { var n = parseInt(v, 10); return n >= 1 && n <= 4 ? String(n) : '2'; }

  function update() {
    var inV = validDate(ci.value), outV = validDate(co.value), guests = validGuests(gu.value);
    var nights = 0;
    if (inV && outV) {
      var diff = (new Date(outV) - new Date(inV)) / DAY;
      nights = diff > 0 && diff <= 365 ? Math.round(diff) : 0;
    }
    var dates = nights > 0
      ? t.waIn + ': ' + fmt(inV) + '\n' + t.waOut + ': ' + fmt(outV)
      : t.waNoDates;
    var msg = t.waHello + '\n' + dates + '\n' + t.waG + ': ' + guests;

    wa.href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
    mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Hotel Erdano') + '&body=' + encodeURIComponent(msg);
    note.textContent = nights > 0
      ? nights + ' ' + (nights === 1 ? t.night : t.nights) + ' · ' + guests + ' ' + t.guests + '.'
      : t.pickDates;
  }

  if (t && ci && co && gu && wa && mail && note) {
    var today = iso(new Date());
    ci.min = today;
    co.min = addDays(today, 1);
    ci.addEventListener('change', function () {
      if (!validDate(ci.value)) return;
      var next = addDays(ci.value, 1);
      co.min = next;
      if (co.value && co.value < next) co.value = next;
    });
    [ci, co, gu].forEach(function (el) { el.addEventListener('change', update); });
    update();
  }

  // Burger menu (below 860px). Without JS the button stays hidden.
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  if (burger && menu) {
    var isOpen = function () { return burger.getAttribute('aria-expanded') === 'true'; };
    var setOpen = function (open) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('open', open);
    };
    burger.hidden = false;
    burger.addEventListener('click', function () { setOpen(!isOpen()); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (e) {
      if (isOpen() && !menu.contains(e.target) && !burger.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); burger.focus(); }
    });
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 861px)');
      var onWide = function () { if (wide.matches) setOpen(false); };
      if (wide.addEventListener) wide.addEventListener('change', onWide);
    }
  }

  // Google Maps loads only when the visitor asks for it: no Google requests or cookies before the click.
  // The URL is fixed here (not read from the page), and the CSP allows frames from www.google.com only.
  var MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3062.2944895082524!2d20.015556699999998!3d39.867641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b1598723f0d31%3A0x188df0521bb6e759!2sHOTEL%20RESTORANT%20ERDANO!5e0!3m2!1sen!2s!4v1793736494711!5m2!1sen!2s';
  var mapBox = document.getElementById('map');
  var mapBtn = mapBox && mapBox.querySelector('button');
  if (mapBtn) {
    mapBtn.hidden = false;
    mapBtn.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = MAP_SRC;
      f.title = mapBox.getAttribute('data-title') || 'Google Maps';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allowFullscreen = true;
      mapBox.replaceChildren(f);
    });
  }

  // Videos carry data-src so their megabytes load only when scrolled near.
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var videos = [].slice.call(document.querySelectorAll('video[data-src]'));
  if (reduce || !videos.length) return;

  function start(v) {
    var src = v.getAttribute('data-src');
    // Same-site relative paths only: never load media from another origin or a javascript:/data: URL.
    if (!/^(\.\.\/)?video\/[\w-]+\.mp4$/.test(src)) return;
    v.src = src;
    v.removeAttribute('data-src');
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!('IntersectionObserver' in window)) { videos.forEach(start); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { io.unobserve(e.target); start(e.target); }
    });
  }, { rootMargin: '300px 0px' });
  videos.forEach(function (v) { io.observe(v); });
})();
