/* =========================================================
   CERANET — formulaire de commande
   - Validation bloquante avec message sous le champ fautif
   - Champ piège (honeypot) reconnu par Web3Forms
   - Mini-défi arithmétique réellement vérifié avant l'envoi
   - Envoi via Web3Forms, sans serveur
   ========================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('orderForm');
    if (!form) return;

    var sent = document.getElementById('sent');
    var honeypot = form.querySelector('.honeypot input');
    var submit = form.querySelector('button[type="submit"]');
    var submitLabel = submit ? submit.textContent : '';
    var globalError = form.querySelector('.form-error');
    var redirect = form.dataset.redirect || window.location.pathname;

    /* ---------- Champs obligatoires ---------- */
    var required = Array.prototype.slice.call(form.querySelectorAll('[data-required]'));

    function errorFor(field) {
      return form.querySelector('[data-error-for="' + field.id + '"]');
    }

    function mark(field, invalid) {
      field.classList.toggle('invalid', invalid);
      field.setAttribute('aria-invalid', String(invalid));
      var message = errorFor(field);
      if (message) message.hidden = !invalid;
    }

    required.forEach(function (field) {
      var recheck = function () { if (field.value.trim()) mark(field, false); };
      field.addEventListener('input', recheck);
      field.addEventListener('change', recheck);
      field.addEventListener('blur', function () {
        if (!field.value.trim()) mark(field, true);
      });
    });

    function firstEmptyField() {
      var first = null;
      required.forEach(function (field) {
        var empty = !field.value.trim();
        mark(field, empty);
        if (empty && !first) first = field;
      });
      return first;
    }

    /* ---------- Mini-défi arithmétique ---------- */
    var box = document.getElementById('challenge');
    var termA = document.getElementById('challengeA');
    var termB = document.getElementById('challengeB');
    var answer = document.getElementById('challengeAnswer');
    var renew = document.getElementById('challengeRenew');
    var expected = null;

    function newChallenge() {
      var a = Math.floor(Math.random() * 8) + 2;
      var b = Math.floor(Math.random() * 8) + 2;
      expected = a + b;
      if (termA) termA.textContent = a;
      if (termB) termB.textContent = b;
      if (answer) answer.value = '';
      if (box) box.classList.remove('ok', 'ko');
      var message = document.querySelector('[data-error-for="challengeAnswer"]');
      if (message) message.hidden = true;
    }

    function challengePassed() {
      return answer && parseInt(answer.value, 10) === expected;
    }

    if (answer) {
      newChallenge();
      answer.addEventListener('input', function () {
        var message = document.querySelector('[data-error-for="challengeAnswer"]');
        if (message) message.hidden = true;
        box.classList.remove('ko');
        box.classList.toggle('ok', challengePassed());
      });
    }

    if (renew) {
      renew.addEventListener('click', newChallenge);
    }

    /* ---------- Envoi ---------- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (globalError) globalError.hidden = true;

      /* Champ piège rempli : c'est un robot. On affiche la confirmation
         sans rien envoyer, pour ne pas lui signaler qu'il a été repéré. */
      if (honeypot && honeypot.value.trim()) { showConfirmation(); return; }

      var target = firstEmptyField();

      if (!challengePassed()) {
        if (box) box.classList.add('ko');
        var message = document.querySelector('[data-error-for="challengeAnswer"]');
        if (message) message.hidden = false;
        if (!target) target = answer;
      }

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
        return;
      }

      send();
    });

    function send() {
      if (submit) {
        submit.disabled = true;
        submit.textContent = submit.dataset.sending || submitLabel;
      }

      var data = new FormData(form);
      data.delete('challenge_answer');   /* ne doit pas partir dans l'e-mail */

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      })
        .then(function (r) { return r.json(); })
        .then(function (r) { r && r.success ? showConfirmation() : failed(); })
        .catch(failed);
    }

    function failed() {
      if (submit) {
        submit.disabled = false;
        submit.textContent = submitLabel;
      }
      if (globalError) {
        globalError.hidden = false;
        globalError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function showConfirmation() {
      if (!sent) { window.location.href = redirect; return; }
      sent.classList.add('show');

      var counter = sent.querySelector('[data-countdown]');
      var left = 5;
      if (counter) counter.textContent = left;

      var tick = setInterval(function () {
        left -= 1;
        if (counter) counter.textContent = Math.max(left, 0);
        if (left <= 0) {
          clearInterval(tick);
          window.location.href = redirect;
        }
      }, 1000);
    }
  });
})();
