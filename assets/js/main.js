/* =========================================================
   CERANET — Script partagé (index-fr.html / index-ar.html)
   - Menu mobile (hamburger)
   - Slider interactif Avant / Après (souris + tactile)
   Le sens (LTR/RTL) est détecté automatiquement via l'attribut
   dir de <html>, aucune duplication de script entre les 2 pages.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  var isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  /* ---------- Menu mobile ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('menuIconOpen');
  var iconClose = document.getElementById('menuIconClose');

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      menu.classList.toggle('flex');
      iconOpen.classList.toggle('hidden');
      iconClose.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Grille de carreaux (avant/après) — toujours carrés ---------- */
  var baWrap = document.getElementById('baSlider');

  function buildSquareFloor() {
    if (!baWrap) return;
    var w = baWrap.clientWidth;
    var h = baWrap.clientHeight;
    if (!w || !h) return;

    /* Nombre de colonnes cible selon la largeur d'écran, pour garder
       des carreaux ni trop petits ni trop grands à toute taille. */
    var cols = window.innerWidth < 480 ? 6 : (window.innerWidth < 768 ? 8 : 10);
    var tileSize = w / cols;
    var rows = Math.max(1, Math.round(h / tileSize));

    baWrap.style.setProperty('--ba-cols', cols);
    baWrap.style.setProperty('--ba-rows', rows);

    var total = cols * rows;
    baWrap.querySelectorAll('.ba-floor').forEach(function (el) {
      el.innerHTML = '';
      var frag = document.createDocumentFragment();
      for (var i = 0; i < total; i++) {
        frag.appendChild(document.createElement('span'));
      }
      el.appendChild(frag);
    });
  }

  buildSquareFloor();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildSquareFloor, 150);
  });

  /* ---------- Slider Avant / Après ---------- */
  var wrap = baWrap;
  var handle = document.getElementById('baHandle');
  var dragging = false;

  function setPos(clientX) {
    var rect = wrap.getBoundingClientRect();
    var pct;
    if (isRTL) {
      pct = ((rect.right - clientX) / rect.width) * 100;
    } else {
      pct = ((clientX - rect.left) / rect.width) * 100;
    }
    pct = Math.max(0, Math.min(100, pct));
    wrap.style.setProperty('--ba-pos', pct + '%');
  }

  if (wrap && handle) {
    handle.addEventListener('mousedown', function () { dragging = true; });
    window.addEventListener('mouseup', function () { dragging = false; });
    window.addEventListener('mousemove', function (e) { if (dragging) setPos(e.clientX); });

    handle.addEventListener('touchstart', function () { dragging = true; }, { passive: true });
    window.addEventListener('touchend', function () { dragging = false; });
    window.addEventListener('touchmove', function (e) { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });

    wrap.addEventListener('click', function (e) { setPos(e.clientX); });
  }
});
