/* ============================================================
   REXOAI® — script condiviso
   Ogni funzionalità si attiva solo se il relativo elemento
   esiste nella pagina corrente.
   ============================================================ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Anno corrente nel footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Menu mobile (hamburger) ---------- */
  var burger = document.getElementById('nav-burger');
  var mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
      document.documentElement.classList.toggle('lock', open);
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.documentElement.classList.remove('lock');
      });
    });
  }

  /* ---------- Intro / sipario (solo dove presente) ---------- */
  var intro = document.getElementById('intro');
  if (intro) {
    /* Failsafe: qualunque cosa accada, dopo 4,5s il sipario sparisce
       e lo scroll viene sbloccato */
    var introFailsafe = setTimeout(function () {
      document.documentElement.classList.remove('lock');
      if (intro.parentNode) intro.remove();
    }, 4500);
    try {
      var fill = document.getElementById('intro-fill');
      var count = document.getElementById('intro-count');
      if (reducedMotion || !fill || !count) {
        clearTimeout(introFailsafe);
        intro.remove();
      } else {
        document.documentElement.classList.add('lock');
        var p = 0;
        var iv = setInterval(function () {
          p = Math.min(p + 4 + Math.ceil(Math.random() * 8), 100);
          count.textContent = p + '%';
          fill.style.clipPath = 'inset(0 ' + (100 - p) + '% 0 0)';
          if (p === 100) {
            clearInterval(iv);
            setTimeout(function () {
              intro.classList.add('done');
              document.documentElement.classList.remove('lock');
              setTimeout(function () {
                clearTimeout(introFailsafe);
                if (intro.parentNode) intro.remove();
              }, 900);
            }, 220);
          }
        }, 52);
      }
    } catch (err) {
      document.documentElement.classList.remove('lock');
      if (intro.parentNode) intro.remove();
    }
  }
  /* Tornando alla home dalla cache del browser (tasto indietro),
     niente sipario e niente scroll bloccato */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var i = document.getElementById('intro');
      if (i) i.remove();
      document.documentElement.classList.remove('lock');
    }
  });

  /* ---------- Manifesto: parole che si accendono ---------- */
  var manifestoP = document.getElementById('manifesto-text');
  var manifestoWords = [];
  if (manifestoP) {
    var words = manifestoP.textContent.trim().split(/\s+/);
    manifestoP.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'w';
      s.textContent = w;
      manifestoP.appendChild(s);
      manifestoWords.push(s);
      if (i < words.length - 1) manifestoP.appendChild(document.createTextNode(' '));
    });
  }

  /* ---------- Scroll unificato: barra, parallasse, manifesto, kinetic ---------- */
  var progress = document.getElementById('progress');
  var stage = document.querySelector('.scene-stage');
  var kinSection = document.querySelector('.kinetic');
  var kinLines = document.querySelectorAll('.kin-line');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement;
      var vh = window.innerHeight;
      if (progress) {
        var max = h.scrollHeight - h.clientHeight;
        progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      }
      if (!reducedMotion) {
        if (stage) {
          var y = Math.min(window.scrollY, 600);
          stage.style.transform = 'translateY(' + (y * -0.1) + 'px)';
        }
        if (manifestoWords.length) {
          var r = manifestoP.getBoundingClientRect();
          var prog = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.45), 0), 1);
          var n = Math.floor(prog * manifestoWords.length);
          manifestoWords.forEach(function (w, i) { w.classList.toggle('on', i < n); });
        }
        if (kinSection) {
          var kr = kinSection.getBoundingClientRect();
          var kp = Math.min(Math.max(1 - kr.top / vh, 0), 1.6);
          kinLines.forEach(function (line) {
            var drift = parseFloat(line.dataset.drift || 0);
            line.style.transform = 'translateX(' + ((kp - 0.8) * drift) + 'px)';
          });
        }
      }
      ticking = false;
    });
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Spotlight ---------- */
  var spotStage = document.getElementById('spot-stage');
  var spotReveal = document.getElementById('spot-reveal');
  if (spotStage && spotReveal && !reducedMotion) {
    if (finePointer) {
      spotStage.addEventListener('pointermove', function (e) {
        var r = spotStage.getBoundingClientRect();
        spotReveal.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        spotReveal.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    } else {
      var t = 0;
      (function orbit() {
        t += 0.012;
        var r = spotStage.getBoundingClientRect();
        spotReveal.style.setProperty('--mx', (r.width / 2 + Math.cos(t) * r.width * 0.32) + 'px');
        spotReveal.style.setProperty('--my', (r.height / 2 + Math.sin(t * 1.4) * r.height * 0.34) + 'px');
        requestAnimationFrame(orbit);
      })();
    }
  }

  /* ---------- Cursore custom ---------- */
  var dot = document.getElementById('cursor');
  var ring = document.getElementById('cursor-ring');
  if (dot && ring) {
    if (!reducedMotion && finePointer) {
      document.documentElement.classList.add('has-cursor');
      var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
      addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; });
      (function loop() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();
      document.addEventListener('pointerover', function (e) {
        if (e.target.closest('a, button, .flip, input, textarea')) ring.classList.add('grow');
      });
      document.addEventListener('pointerout', function (e) {
        if (e.target.closest('a, button, .flip, input, textarea')) ring.classList.remove('grow');
      });
    } else { dot.remove(); ring.remove(); }
  }

  /* ---------- Bottoni magnetici ---------- */
  if (!reducedMotion && finePointer) {
    document.querySelectorAll('[data-magnet]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.18) + 'px,' + (dy * 0.3) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Contatori animati ---------- */
  function formatNum(value, dec, sep) {
    if (sep) return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return value.toFixed(dec).replace('.', ',');
  }
  function animateCount(el) {
    var val = parseFloat(el.dataset.val);
    var dec = parseInt(el.dataset.dec || 0, 10);
    var sep = el.dataset.sep === '1';
    if (reducedMotion) { el.textContent = formatNum(val, dec, sep); return; }
    var dur = 1500, t0 = performance.now();
    (function tick(t) {
      var p = Math.min(((t || performance.now()) - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatNum(val * eased, dec, sep);
      if (p < 1) requestAnimationFrame(tick);
    })();
  }

  /* ---------- Reveal 3D allo scroll ---------- */
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        entry.target.querySelectorAll('.num').forEach(animateCount);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.fade').forEach(function (el) { observer.observe(el); });

  /* ---------- Tilt 3D ---------- */
  if (!reducedMotion && finePointer) {
    var MAX_DEG = 7;
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(900px) rotateY(' + (px * MAX_DEG * 2) +
          'deg) rotateX(' + (-py * MAX_DEG * 2) + 'deg) translateZ(6px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Flip card su touch ---------- */
  if (!window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.flip').forEach(function (card) {
      card.addEventListener('click', function () { card.classList.toggle('flipped'); });
    });
  }

  /* ---------- Form contatti → info@rexoai.it ----------
     Invio via FormSubmit; al primo invio dal dominio arriverà a
     info@rexoai.it una mail di attivazione (un click, una volta sola).
     In caso di errore si apre il client di posta dell'utente. */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var formMsg = document.getElementById('form-msg');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) { contactForm.reportValidity(); return; }
      var data = {};
      new FormData(contactForm).forEach(function (v, k) { data[k] = v; });
      if (data._honey) return;
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Invio in corso…';
      fetch('https://formsubmit.co/ajax/info@rexoai.it', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          'Nome e cognome': data.nome,
          'Email': data.email,
          'Azienda': data.azienda || '-',
          'Messaggio': data.messaggio,
          _subject: 'Nuova richiesta dal sito RexoAI',
          _template: 'table',
          _captcha: 'false'
        })
      }).then(function (res) {
        if (!res.ok) throw new Error('send failed');
        formMsg.textContent = 'Richiesta inviata. Ti rispondiamo entro 24 ore lavorative.';
        formMsg.style.display = 'block';
        contactForm.reset();
      }).catch(function () {
        var body = encodeURIComponent('Nome: ' + data.nome + '\nEmail: ' + data.email +
          '\nAzienda: ' + (data.azienda || '-') + '\n\n' + data.messaggio);
        window.location.href = 'mailto:info@rexoai.it?subject=' +
          encodeURIComponent('Richiesta dal sito RexoAI') + '&body=' + body;
        formMsg.textContent = "Si è aperto il tuo programma di posta per completare l'invio a info@rexoai.it.";
        formMsg.style.display = 'block';
      }).finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      });
    });
  }
})();
