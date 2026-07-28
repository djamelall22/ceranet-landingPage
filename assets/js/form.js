/* =========================================================
   CERANET — Formulaire de contact
   - Champs obligatoires réellement bloquants (pas juste "required"
     HTML : validation visuelle + focus sur le premier champ manquant)
   - Honeypot anti-bot (champ invisible, reconnu aussi par Web3Forms)
   - Mini-défi anti-robot 100% JS : calcul généré aléatoirement et
     VÉRIFIÉ avant l'envoi (contrairement à une simple case à cocher,
     ça ne peut pas être validé sans lire réellement le nombre affiché)
   - Envoi réel des données via Web3Forms (aucun backend nécessaire)
   - Overlay de confirmation animé (GSAP) + redirection
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var overlay = document.getElementById('successOverlay');
  var redirectTarget = form.getAttribute('data-redirect') || window.location.pathname;
  var honeypot = form.querySelector('.hp-field input');
  var submitBtn = form.querySelector('button[type="submit"]');
  var submitBtnDefaultLabel = submitBtn ? submitBtn.textContent : '';
  var formErrorEl = form.querySelector('[data-form-error]');

  /* ---------- Champs obligatoires ---------- */
  var requiredFields = Array.prototype.slice.call(form.querySelectorAll('[data-required]'));

  function fieldWrap(field) {
    return field.closest('[data-field]');
  }

  function errorElFor(field) {
    var wrap = fieldWrap(field);
    return wrap ? wrap.querySelector('.field-error') : null;
  }

  function isFieldFilled(field) {
    return field.value.trim() !== '';
  }

  function showFieldError(field) {
    field.classList.add('is-invalid');
    var errorEl = errorElFor(field);
    if (errorEl) errorEl.hidden = false;
  }

  function clearFieldError(field) {
    field.classList.remove('is-invalid');
    var errorEl = errorElFor(field);
    if (errorEl) errorEl.hidden = true;
  }

  requiredFields.forEach(function (field) {
    var revalidate = function () {
      if (isFieldFilled(field)) clearFieldError(field);
    };
    field.addEventListener('input', revalidate);
    field.addEventListener('change', revalidate);
    field.addEventListener('blur', function () {
      if (!isFieldFilled(field)) showFieldError(field);
    });
  });

  function validateRequiredFields() {
    var firstInvalid = null;
    requiredFields.forEach(function (field) {
      if (!isFieldFilled(field)) {
        showFieldError(field);
        if (!firstInvalid) firstInvalid = field;
      } else {
        clearFieldError(field);
      }
    });
    return firstInvalid;
  }

  /* ---------- Mini-défi anti-robot (calcul) ---------- */
  var captchaBox = document.getElementById('captchaBox');
  var captchaAEl = document.getElementById('captchaA');
  var captchaBEl = document.getElementById('captchaB');
  var captchaInput = document.getElementById('captchaAnswer');
  var captchaRefresh = document.getElementById('captchaRefresh');
  var captchaExpected = null;

  function newCaptcha() {
    var a = Math.floor(Math.random() * 8) + 2; /* 2 à 9 */
    var b = Math.floor(Math.random() * 8) + 2; /* 2 à 9 */
    captchaExpected = a + b;
    if (captchaAEl) captchaAEl.textContent = a;
    if (captchaBEl) captchaBEl.textContent = b;
    if (captchaInput) captchaInput.value = '';
    if (captchaBox) captchaBox.classList.remove('is-error', 'is-checked');
    var errorEl = document.querySelector('[data-error-for="captchaAnswer"]');
    if (errorEl) errorEl.hidden = true;
  }

  if (captchaInput) {
    newCaptcha();
    captchaInput.addEventListener('input', function () {
      if (captchaBox) captchaBox.classList.remove('is-error');
      var errorEl = document.querySelector('[data-error-for="captchaAnswer"]');
      if (errorEl) errorEl.hidden = true;
      if (parseInt(captchaInput.value, 10) === captchaExpected) {
        captchaBox.classList.add('is-checked');
      } else if (captchaBox) {
        captchaBox.classList.remove('is-checked');
      }
    });
  }

  if (captchaRefresh) {
    captchaRefresh.addEventListener('click', function (e) {
      e.preventDefault();
      newCaptcha();
    });
  }

  function isCaptchaValid() {
    return captchaInput && parseInt(captchaInput.value, 10) === captchaExpected;
  }

  function showCaptchaError() {
    if (captchaBox) captchaBox.classList.add('is-error');
    var errorEl = document.querySelector('[data-error-for="captchaAnswer"]');
    if (errorEl) errorEl.hidden = false;
  }

  /* ---------- Soumission ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (formErrorEl) formErrorEl.hidden = true;

    /* Honeypot rempli => très probablement un bot : on feint le succès
       pour ne pas lui indiquer qu'il a été détecté, sans rien envoyer. */
    if (honeypot && honeypot.value.trim() !== '') {
      showSuccess();
      return;
    }

    var firstInvalid = validateRequiredFields();

    if (!isCaptchaValid()) {
      showCaptchaError();
      if (!firstInvalid) firstInvalid = captchaInput;
    }

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus({ preventScroll: true });
      return;
    }

    submitForm();
  });

  function submitForm() {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = submitBtn.getAttribute('data-sending-label') || submitBtnDefaultLabel;
    }

    var formData = new FormData(form);
    /* Le champ du mini-défi ne doit pas partir dans l'e-mail final */
    formData.delete('captcha_answer');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) {
          showSuccess();
        } else {
          handleSubmitError();
        }
      })
      .catch(function () {
        handleSubmitError();
      });
  }

  function handleSubmitError() {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtnDefaultLabel;
    }
    if (formErrorEl) {
      formErrorEl.hidden = false;
      formErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function showSuccess() {
    if (!overlay) {
      window.location.href = redirectTarget;
      return;
    }
    overlay.classList.add('is-visible');

    if (typeof gsap !== 'undefined') {
      var circle = overlay.querySelector('circle');
      var check = overlay.querySelector('path');
      var content = overlay.querySelectorAll('[data-success-anim]');

      var tl = gsap.timeline();
      tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35 })
        .fromTo(content, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, '-=0.15')
        .to(circle, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .to(check, { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
    } else {
      /* Filet de sécurité sans GSAP : on affiche directement le résultat final */
      var circleFallback = overlay.querySelector('circle');
      var checkFallback = overlay.querySelector('path');
      if (circleFallback) circleFallback.style.strokeDashoffset = '0';
      if (checkFallback) checkFallback.style.strokeDashoffset = '0';
    }

    var countdownEl = overlay.querySelector('[data-countdown]');
    var seconds = 4;
    if (countdownEl) countdownEl.textContent = seconds;
    var interval = setInterval(function () {
      seconds -= 1;
      if (countdownEl) countdownEl.textContent = Math.max(seconds, 0);
      if (seconds <= 0) {
        clearInterval(interval);
        window.location.href = redirectTarget;
      }
    }, 1000);
  }
});
