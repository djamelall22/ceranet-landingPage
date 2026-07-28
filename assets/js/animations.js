/* =========================================================
   CERANET — Animations GSAP
   - Révélation des sections au défilement (ScrollTrigger)
   - Bascule animée du format produit (5L / 2L)
   Le sélecteur de format reste fonctionnel même si GSAP ne
   charge pas (réseau, bloqueur...), avec un simple fallback CSS.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  var hasGsap = typeof gsap !== 'undefined';
  var isRTL = document.documentElement.getAttribute('dir') === 'rtl';

  if (!hasGsap) {
    /* Filet de sécurité : contenu visible même sans GSAP */
    document.querySelectorAll('.reveal-up').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  } else {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    /* ---------- Révélation au scroll ---------- */
    gsap.utils.toArray('.reveal-up').forEach(function (el, i) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        delay: (i % 3) * 0.08,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });
  }

  /* ---------- Sélecteur de format produit (5L / 2L) ---------- */
  document.querySelectorAll('.pc-card').forEach(function (card) {
    var thumb = card.querySelector('.pc-toggle-thumb');
    var btns = card.querySelectorAll('.pc-toggle-btn');
    var imgs = card.querySelectorAll('.pc-img');
    var contenanceEl = card.querySelector('[data-contenance]');
    var ctaEl = card.querySelector('[data-cta]');
    if (!btns.length) return;

    function activate(format) {
      btns.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-format') === format);
      });

      var isSecond = format === '2l';
      var xP = isSecond ? (isRTL ? -100 : 100) : 0;
      if (hasGsap) {
        gsap.to(thumb, { xPercent: xP, duration: 0.35, ease: 'power2.out' });
      } else if (thumb) {
        thumb.style.transition = 'transform .3s ease';
        thumb.style.transform = 'translateX(' + xP + '%)';
      }

      imgs.forEach(function (img) {
        var match = img.getAttribute('data-fmt') === format;
        if (hasGsap) {
          gsap.to(img, { opacity: match ? 1 : 0, scale: match ? 1 : 0.92, duration: 0.35, ease: 'power2.out' });
        } else {
          img.style.transition = 'opacity .3s ease, transform .3s ease';
          img.style.opacity = match ? '1' : '0';
          img.style.transform = match ? 'scale(1)' : 'scale(0.92)';
        }
      });

      if (contenanceEl) {
        contenanceEl.textContent = format === '5l' ? contenanceEl.getAttribute('data-5l') : contenanceEl.getAttribute('data-2l');
      }
      if (ctaEl) {
        var base = ctaEl.getAttribute('data-wa-base');
        var label = format === '5l' ? ctaEl.getAttribute('data-label-5l') : ctaEl.getAttribute('data-label-2l');
        ctaEl.setAttribute('href', base + encodeURIComponent(format === '5l' ? ' (5L)' : ' (2L)'));
        var ctaText = ctaEl.querySelector('[data-cta-text]');
        if (ctaText) ctaText.textContent = label;
      }
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { activate(b.getAttribute('data-format')); });
    });

    if (hasGsap && thumb) gsap.set(thumb, { xPercent: 0 });
  });
});
