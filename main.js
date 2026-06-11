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

  /* ============================================================
     MINI AUDIT ISTANTANEO (pagina contatti)
     Incrocia le 6 risposte e seleziona 1 di 14 profili-audit,
     con budget consigliato calcolato su fatturato e spesa attuale.
     ============================================================ */
  var auditForm = document.getElementById('audit-form');
  if (auditForm) {
    var LABELS = {
      settore: { ecommerce:'E-commerce', locale:'Attività locale', b2b:'B2B / Manifattura', food:'Ristorazione / Food', altro:'Altro settore' },
      dipendenti: { 1:'1–5 dipendenti', 2:'6–20 dipendenti', 3:'21–50 dipendenti', 4:'oltre 50 dipendenti' },
      fatturato: { 1:'fino a 100k €', 2:'100–500k €', 3:'500k–2M €', 4:'oltre 2M €' },
      spesa: { 0:'zero spesa digital', 1:'meno di 500 €/mese', 2:'500–2.000 €/mese', 3:'oltre 2.000 €/mese' },
      obiettivo: { contatti:'più contatti', vendite:'più vendite online', brand:'visibilità e brand', tempo:'risparmiare tempo' },
      presenza: { nulla:'nessun sito', vecchio:'sito vecchio e social fermi', social:'social attivi ma pochi risultati', adv:'campagne adv già attive' }
    };
    var BUDGET = { 1:'400–800 €/mese', 2:'800–1.500 €/mese', 3:'1.500–3.000 €/mese', 4:'3.000 €/mese o più' };

    /* I 14 profili-audit: il primo che combacia vince (dall'alto) */
    var PROFILES = [
      { id:'fondamenta', tag:'Priorità: fondamenta',
        match:function(d){ return d.presenza==='nulla'; },
        title:'Prima il sito. Tutto il resto dopo.',
        diag:function(d){ return 'Un\'attività ' + LABELS.settore[d.settore].toLowerCase() + ' con ' + LABELS.fatturato[d.fatturato] + ' di fatturato e nessun sito sta lasciando per strada chi la cerca ogni giorno. Investire in adv ora significherebbe mandare traffico nel vuoto.'; },
        list:['Sito con una pagina per servizio e form/chiamata in evidenza','Scheda Google Business completa e recensioni attive','Tracciamento di contatti e chiamate fin dal primo giorno'],
        budget:function(d){ return 'Fase 1: solo sito e fondamenta. ADV consigliata dal mese 2–3: <b>' + BUDGET[d.fatturato] + '</b>.'; } },

      { id:'roas', tag:'Priorità: rendimento ADV',
        match:function(d){ return d.settore==='ecommerce' && (d.presenza==='adv' || d.spesa>=2); },
        title:'Le campagne girano. Spremiamole meglio.',
        diag:function(d){ return 'E-commerce con ' + LABELS.spesa[d.spesa] + ' già investiti: a questo livello la differenza non la fa spendere di più, ma creatività, audience e landing. È lì che il ROAS si sblocca.'; },
        list:['Audit di campagne, pixel e tracciamento conversioni','Test creativi sistematici su Meta (3–5 varianti al mese)','Landing page dedicate per le linee di prodotto migliori'],
        budget:function(){ return 'Budget attuale probabilmente sufficiente: prima <b>riallocazione</b>, poi scaling su ciò che rende.'; } },

      { id:'lancio-ecom', tag:'Priorità: prime vendite',
        match:function(d){ return d.settore==='ecommerce'; },
        title:'Il negozio è aperto. Ora portiamoci la gente.',
        diag:function(d){ return 'Un e-commerce senza traffico a pagamento cresce solo per passaparola. Con ' + LABELS.fatturato[d.fatturato] + ' di fatturato c\'è lo spazio per testare la domanda in 60–90 giorni con un budget controllato.'; },
        list:['Meta Ads per creare domanda + Google Shopping per intercettarla','Tracciamento e-commerce completo prima di spendere un euro','Email di recupero carrello: il fatturato più facile che c\'è'],
        budget:function(d){ return 'Budget test consigliato: <b>' + BUDGET[d.fatturato] + '</b> per i primi 90 giorni.'; } },

      { id:'lead-locale', tag:'Priorità: domanda locale',
        match:function(d){ return d.settore==='locale' && d.spesa<=1 && d.obiettivo==='contatti'; },
        title:'Chi ti cerca in zona deve trovare te.',
        diag:function(d){ return 'Attività locale, ' + LABELS.spesa[d.spesa] + ': là fuori c\'è gente che cerca esattamente il tuo servizio nella tua zona, oggi. Google Search locale è il canale con l\'intento d\'acquisto più alto che esista.'; },
        list:['Campagne Google Search sulle ricerche locali ad alto intento','Pagina dedicata con prenotazione o chiamata in un tap','Tracciamento delle chiamate: ogni lead deve avere un costo noto'],
        budget:function(d){ return 'Budget d\'ingresso consigliato: <b>' + BUDGET[d.fatturato] + '</b>, scalabile sui dati.'; } },

      { id:'cpl-locale', tag:'Priorità: costo per lead',
        match:function(d){ return d.settore==='locale' && (d.presenza==='adv' || d.spesa>=2); },
        title:'I lead arrivano. Paghiamoli la metà.',
        diag:function(d){ return 'Attività locale con campagne attive e ' + LABELS.spesa[d.spesa] + ': campagne locali non ottimizzate pagano spesso i lead il 30–50% più del necessario, tra parole chiave generiche e chiamate non tracciate.'; },
        list:['Audit di keyword, corrispondenze e termini di ricerca sprecati','Tracciamento di chiamate e prenotazioni per il costo reale per lead','Landing dedicata al posto della home generica'],
        budget:function(){ return 'Stesso budget, resa diversa: obiettivo <b>−30/40% sul costo per lead</b> in 90 giorni.'; } },

      { id:'b2b-authority', tag:'Priorità: autorevolezza',
        match:function(d){ return d.settore==='b2b' && (d.dipendenti>=3 || d.fatturato>=3); },
        title:'Nel B2B chi sembra grande, vende grande.',
        diag:function(d){ return 'Un\'azienda B2B con ' + LABELS.dipendenti[d.dipendenti] + ' viene valutata online prima di ogni trattativa: buyer e uffici acquisti guardano sito e profili prima di rispondere a una mail. Quella prima impressione pesa sul preventivo.'; },
        list:['Sito autorevole con casi studio e dati di prodotto','Contenuti tecnici costanti, generati con AI e rivisti da persone','Google Search sulle ricerche di settore ad alto valore'],
        budget:function(d){ return 'Mix consigliato: 60% contenuti e sito, 40% ADV — <b>' + BUDGET[d.fatturato] + '</b> lato campagne.'; } },

      { id:'b2b-lead', tag:'Priorità: lead qualificati',
        match:function(d){ return d.settore==='b2b'; },
        title:'Pochi lead, ma quelli giusti.',
        diag:function(d){ return 'Nel B2B il volume conta meno della qualità: 10 richieste da aziende in target valgono più di 100 curiosi. Con ' + LABELS.fatturato[d.fatturato] + ' di fatturato, ogni cliente acquisito ripaga il marketing di mesi.'; },
        list:['Pagine servizio pensate per chi decide gli acquisti','Google Search su ricerche specifiche del tuo settore','Form qualificante: meglio 5 campi giusti che 2 generici'],
        budget:function(d){ return 'Budget d\'ingresso: <b>' + BUDGET[d.fatturato] + '</b>, da valutare sul valore del singolo cliente.'; } },

      { id:'food', tag:'Priorità: community',
        match:function(d){ return d.settore==='food'; },
        title:'Nel food si mangia prima con gli occhi. Sui social.',
        diag:function(){ return 'Ristorazione e food vivono di immagine e costanza: profili fermi comunicano locali vuoti. Con contenuti AI supervisionati si pubblica ogni giorno senza rubare ore alla cucina o alla sala.'; },
        list:['Piano editoriale visivo costante: reel, piatti, dietro le quinte','Meta Ads geolocalizzate su eventi, menu e periodi chiave','Prenotazione o ordine raggiungibile in massimo due tap'],
        budget:function(d){ return 'Mix consigliato: contenuti costanti + <b>' + BUDGET[d.fatturato] + '</b> di ADV locale nei periodi forti.'; } },

      { id:'tempo', tag:'Priorità: tempo',
        match:function(d){ return d.obiettivo==='tempo'; },
        title:'Il tuo tempo vale più di un post.',
        diag:function(d){ return 'Team di ' + LABELS.dipendenti[d.dipendenti] + ' e contenuti fatti "quando avanza tempo": il risultato è incostanza, e l\'incostanza sui social si paga in visibilità. La produzione si può delegare quasi del tutto.'; },
        list:['Pipeline di contenuti AI con revisione umana: pubblicazione costante, zero ore interne','Piano editoriale mensile che approvi in 15 minuti','Report mensile: cosa ha funzionato e cosa pubblicare di più'],
        budget:function(){ return 'Qui il ritorno si misura in <b>ore recuperate</b>: tipicamente 6–10 a settimana che tornano al team.'; } },

      { id:'social', tag:'Priorità: conversione',
        match:function(d){ return d.presenza==='social'; },
        title:'Da follower a clienti: il passo che manca.',
        diag:function(){ return 'Social attivi ma pochi risultati è il sintomo classico: contenuti che intrattengono ma non portano da nessuna parte. Manca il ponte tra il profilo e il fatturato.'; },
        list:['CTA e percorso chiaro da ogni contenuto a una pagina che converte','Retargeting Meta su chi già ti segue e interagisce','Misurazione: quanti contatti reali genera il profilo ogni mese'],
        budget:function(d){ return 'Il retargeting costa poco e rende molto: si parte da <b>' + BUDGET[Math.max(1, d.fatturato - 1)] + '</b>.'; } },

      { id:'restyling', tag:'Priorità: conversione del sito',
        match:function(d){ return d.presenza==='vecchio' && d.obiettivo==='contatti'; },
        title:'Il sito c\'è. Ma non lavora per te.',
        diag:function(){ return 'Sito datato e obiettivo contatti: ogni visita persa su un sito lento o confuso è un cliente regalato ai concorrenti. Il restyling orientato alla conversione di solito ripaga prima di qualsiasi campagna.'; },
        list:['Restyling con un solo obiettivo per pagina: il contatto','Velocità e SEO tecnica: farsi trovare senza pagare ogni click','Form e chiamate tracciati per misurare il prima/dopo'],
        budget:function(d){ return 'Prima il sito, poi le campagne: ADV dal mese 2 con <b>' + BUDGET[d.fatturato] + '</b>.'; } },

      { id:'brand', tag:'Priorità: visibilità',
        match:function(d){ return d.obiettivo==='brand'; },
        title:'Se non ti vedono, non esisti. Rimedio in tre mosse.',
        diag:function(d){ return 'Obiettivo visibilità con ' + LABELS.presenza[d.presenza] + ': il brand si costruisce con costanza e riconoscibilità, non con un post ogni tanto. Serve una linea visiva e un ritmo che non si fermino mai.'; },
        list:['Identità coerente su sito e social: stessa voce, stesso stile','Contenuti AI a ritmo costante con supervisione editoriale','Campagne di copertura Meta sul pubblico giusto, non su tutti'],
        budget:function(d){ return 'La visibilità costa poco se il contenuto è buono: <b>' + BUDGET[Math.max(1, d.fatturato - 1)] + '</b> bastano per iniziare.'; } },

      { id:'potenziale', tag:'Priorità: potenziale inespresso',
        match:function(d){ return d.fatturato>=3 && d.spesa===0; },
        title:'Fatturi bene offline. Online è tutto da prendere.',
        diag:function(){ return 'Fatturato importante con zero spesa digital: il business funziona già senza marketing online. Anche una piccola frazione di quel fatturato, investita bene, può aprire un canale di crescita nuovo.'; },
        list:['Audit del potenziale: quanta domanda online esiste nel tuo mercato','Test controllato di 90 giorni su un solo canale ad alto intento','Tracciamento totale: ogni euro deve avere un ritorno misurato'],
        budget:function(d){ return 'Test iniziale prudente: <b>' + BUDGET[d.fatturato] + '</b> per 90 giorni, poi si decide sui numeri.'; } },

      { id:'regia', tag:'Priorità: regia unica',
        match:function(){ return true; },
        title:'I pezzi ci sono. Manca la regia.',
        diag:function(d){ return 'Profilo ' + LABELS.settore[d.settore].toLowerCase() + ', ' + LABELS.spesa[d.spesa] + ', obiettivo ' + LABELS.obiettivo[d.obiettivo] + ': il quadro tipico di chi ha già qualcosa online, ma con canali che non si parlano. Coordinarli moltiplica il risultato a parità di spesa.'; },
        list:['Audit completo di sito, social e campagne per trovare le dispersioni','Una strategia unica con KPI per ogni canale','Report mensile: si taglia ciò che non rende, si scala ciò che funziona'],
        budget:function(d){ return 'Budget consigliato a regia unica: <b>' + BUDGET[d.fatturato] + '</b> complessivi lato ADV.'; } }
    ];

    auditForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!auditForm.checkValidity()) { auditForm.reportValidity(); return; }
      var raw = {};
      new FormData(auditForm).forEach(function (v, k) { raw[k] = v; });
      var d = {
        settore: raw.settore,
        dipendenti: parseInt(raw.dipendenti, 10),
        fatturato: parseInt(raw.fatturato, 10),
        spesa: parseInt(raw.spesa, 10),
        obiettivo: raw.obiettivo,
        presenza: raw.presenza
      };
      var p = null;
      for (var i = 0; i < PROFILES.length; i++) {
        if (PROFILES[i].match(d)) { p = PROFILES[i]; break; }
      }
      document.getElementById('audit-tag').textContent = p.tag;
      document.getElementById('audit-title').textContent = p.title;
      document.getElementById('audit-diag').textContent = p.diag(d);
      var ul = document.getElementById('audit-list');
      ul.innerHTML = '';
      p.list.forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
      document.getElementById('audit-budget').innerHTML = p.budget(d);
      var empty = document.getElementById('audit-empty');
      if (empty) empty.style.display = 'none';
      var result = document.getElementById('audit-result');
      result.hidden = false;
      result.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest' });

      /* CTA: precompila il form di contatto con il profilo generato */
      var cta = document.getElementById('audit-cta');
      cta.onclick = function () {
        var ta = document.querySelector('#contact-form textarea[name="messaggio"]');
        if (ta) {
          ta.value = 'Richiedo l\'audit completo. Mini audit generato: "' + p.title + '" — ' +
            LABELS.settore[d.settore] + ', ' + LABELS.dipendenti[d.dipendenti] + ', fatturato ' +
            LABELS.fatturato[d.fatturato] + ', ' + LABELS.spesa[d.spesa] + ', obiettivo: ' +
            LABELS.obiettivo[d.obiettivo] + ', presenza attuale: ' + LABELS.presenza[d.presenza] + '.';
        }
        var formSec = document.getElementById('form-contatto');
        if (formSec) formSec.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
        var nome = document.querySelector('#contact-form input[name="nome"]');
        if (nome) setTimeout(function () { nome.focus(); }, reducedMotion ? 0 : 600);
      };
    });
  }
})();
