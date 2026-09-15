/* =========================================================
   CERANET — script principal (FR + AR)
   Aucune dépendance externe : plus de GSAP, plus de Tailwind.
   Le sens de lecture est déduit de l'attribut dir de <html>.
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.add('js');
  var rtl = document.documentElement.dir === 'rtl';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Menu mobile ---------- */
    var burger = document.getElementById('burger');
    var mobileNav = document.getElementById('navMobile');

    if (burger && mobileNav) {
      burger.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
      mobileNav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mobileNav.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* ---------- Démonstration avant / après ----------
       La grille de carreaux est générée pour rester carrée
       quelle que soit la largeur de l'écran. */
    var ba = document.getElementById('ba');

    if (ba) {
      var handle = document.getElementById('baHandle');

      function buildTiles() {
        var w = ba.clientWidth, h = ba.clientHeight;
        if (!w || !h) return;
        var cols = window.innerWidth < 480 ? 6 : (window.innerWidth < 768 ? 8 : 10);
        var rows = Math.max(1, Math.round(h / (w / cols)));
        ba.style.setProperty('--cols', cols);
        ba.style.setProperty('--rows', rows);

        var markup = new Array(cols * rows + 1).join('<span></span>');
        ba.querySelectorAll('.ba-floor').forEach(function (floor) {
          floor.innerHTML = markup;
        });
      }

      function setPosition(pct) {
        pct = Math.max(0, Math.min(100, pct));
        ba.style.setProperty('--pos', pct + '%');
        if (handle) handle.setAttribute('aria-valuenow', Math.round(pct));
      }

      var dragging = false;
      var grabX = 0;        /* position du pointeur au moment de la saisie */
      var grabPos = 50;     /* position du curseur au même instant */

      /* On saisit le curseur et on le déplace d'autant que le pointeur :
         cliquer ne le fait plus sauter à l'endroit du clic, ce qui donnait
         l'impression que l'image basculait d'un côté à l'autre. Le geste
         part de n'importe quel point de l'image, pas seulement du rond. */
      ba.addEventListener('pointerdown', function (e) {
        dragging = true;
        grabX = e.clientX;
        grabPos = parseFloat(handle && handle.getAttribute('aria-valuenow')) || 50;
        ba.setPointerCapture(e.pointerId);
        /* Pas de focus() ici : la poignée fait 0 px de large sur toute la
           hauteur, son contour de focus se dessinerait en deux traits
           verticaux. Le clavier reste accessible par la touche Tab. */
        e.preventDefault();
      });

      ba.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var travelled = ((e.clientX - grabX) / ba.getBoundingClientRect().width) * 100;
        setPosition(grabPos + (rtl ? -travelled : travelled));
      });

      function release(e) {
        if (!dragging) return;
        dragging = false;
        if (ba.hasPointerCapture(e.pointerId)) ba.releasePointerCapture(e.pointerId);
      }
      ba.addEventListener('pointerup', release);
      ba.addEventListener('pointercancel', release);

      /* Pilotage au clavier : le curseur est un vrai slider accessible */
      if (handle) {
        handle.addEventListener('keydown', function (e) {
          var current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
          var back = rtl ? 'ArrowRight' : 'ArrowLeft';
          var fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
          if (e.key === back) { setPosition(current - 4); }
          else if (e.key === fwd) { setPosition(current + 4); }
          else if (e.key === 'Home') { setPosition(0); }
          else if (e.key === 'End') { setPosition(100); }
          else { return; }
          e.preventDefault();
        });
      }

      buildTiles();
      var timer;
      window.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(buildTiles, 150);
      });
    }

    /* ---------- Sélecteur de format 5 L / 2 L ---------- */
    document.querySelectorAll('[data-product]').forEach(function (card) {
      var buttons = card.querySelectorAll('.sizes button');
      var shots = card.querySelectorAll('[data-size]');
      var volume = card.querySelector('[data-volume]');
      var cta = card.querySelector('[data-cta]');
      if (!buttons.length) return;

      function select(size) {
        buttons.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.dataset.for === size));
        });
        shots.forEach(function (shot) {
          shot.classList.toggle('is-shown', shot.dataset.size === size);
        });
        if (volume) volume.textContent = volume.dataset[size];
        if (cta) {
          cta.href = cta.dataset.wa + encodeURIComponent(' (' + size.toUpperCase() + ')');
          var text = cta.querySelector('[data-cta-text]');
          if (text) text.textContent = cta.dataset[size];
        }
      }

      buttons.forEach(function (b) {
        b.addEventListener('click', function () { select(b.dataset.for); });
      });
    });

    /* ---------- Apparition au défilement ----------
       Un seul effet, sur les blocs principaux, et rien si
       l'utilisateur a demandé à réduire les animations. */
    var blocks = document.querySelectorAll('.reveal');
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!('IntersectionObserver' in window) || calm) {
      blocks.forEach(function (el) { el.classList.add('seen'); });
    } else {
      var watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('seen');
          watcher.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px' });
      blocks.forEach(function (el) { watcher.observe(el); });
    }
  });
})();
