/* ============================================================
   REXOAI® — Cookie consent banner
   Accetta tutti / Rifiuta / Personalizza (essenziali sempre attivi).
   La scelta viene salvata in localStorage (con fallback in memoria
   se il browser lo blocca) e riproposta dopo 12 mesi.
   Per riaprire le preferenze: link "Gestisci cookie" nel footer
   oppure window.rexoConsent.open()
   ============================================================ */
(function () {
  var KEY = 'rexoai_cookie_consent_v1';
  var MAX_AGE_DAYS = 365;
  var memoryStore = null; // fallback se localStorage non è disponibile

  /* ---------- storage con fallback ---------- */
  function readConsent() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return memoryStore;
      var c = JSON.parse(raw);
      if (!c.ts || (Date.now() - c.ts) > MAX_AGE_DAYS * 864e5) return null; // scaduto
      return c;
    } catch (e) { return memoryStore; }
  }
  function saveConsent(c) {
    c.ts = Date.now();
    memoryStore = c;
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* fallback in memoria */ }
  }

  /* ---------- attivazione script in base al consenso ----------
     Gli script di terze parti vanno caricati SOLO qui dentro,
     mai direttamente nelle pagine. */
  function applyConsent(c) {
    if (c.analytics) {
      /* TODO: inserire qui Google Analytics 4, es.:
      var s = document.createElement('script');
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX';
      s.async = true; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date()); gtag('config', 'G-XXXXXXX', { anonymize_ip: true });
      */
    }
    if (c.marketing) {
      /* TODO: inserire qui Meta Pixel / Google Ads tag, es.:
      !function(f,b,e,v,n,t,s){ ... }(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', 'PIXEL_ID'); fbq('track', 'PageView');
      */
    }
  }

  /* ---------- stili ---------- */
  var css = ''
    + '#rexo-cookie{position:fixed;left:18px;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:1500;'
    + 'max-width:520px;margin-inline:auto;background:#000;color:#F2F2F2;text-align:left;'
    + 'border:1px solid rgba(255,255,255,.4);border-radius:16px;padding:26px;'
    + 'font-family:Poppins,system-ui,sans-serif;font-size:.88rem;line-height:1.55;'
    + 'box-shadow:0 30px 80px rgba(0,0,0,.85);transform:translateY(24px);opacity:0;'
    + 'transition:transform .5s cubic-bezier(.22,.8,.3,1),opacity .5s}'
    + '#rexo-cookie.on{transform:none;opacity:1}'
    + '#rexo-cookie h3{font-size:1rem;font-weight:800;text-transform:uppercase;'
    + 'letter-spacing:.04em;margin:0 0 8px;display:flex;align-items:center;gap:8px}'
    + '#rexo-cookie h3 i{font-style:normal;display:inline-block;animation:rexospin 7s linear infinite}'
    + '@keyframes rexospin{to{transform:rotate(360deg)}}'
    + '#rexo-cookie p{margin:0 0 16px;color:#B5B5B5;line-height:1.55}'
    + '#rexo-cookie a{color:#fff;text-decoration:underline}'
    + '.rexo-c-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}'
    + '.rexo-c-btn{font-family:inherit;font-weight:700;font-size:.74rem;'
    + 'letter-spacing:.08em;text-transform:uppercase;border-radius:999px;'
    + 'min-height:46px;padding:0 20px;cursor:pointer;border:none;background:#fff;color:#000;'
    + 'display:inline-flex;align-items:center;justify-content:center;'
    + '-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .12s ease,opacity .15s}'
    + '.rexo-c-btn:active{transform:scale(.96)}'
    + '.rexo-c-btn.ghost{background:transparent;color:#F2F2F2;border:1px solid rgba(255,255,255,.3)}'
    + '.rexo-c-btn.link{background:none;border:none;color:#9B9B9B;text-decoration:underline;padding:0 6px}'
    + '.rexo-c-btn:hover{opacity:.85}'
    + '#rexo-cookie-prefs{display:none;border-top:1px solid rgba(255,255,255,.12);'
    + 'margin-top:16px;padding-top:16px}'
    + '#rexo-cookie.expanded #rexo-cookie-prefs{display:block}'
    + '.rexo-c-opt{display:flex;align-items:center;justify-content:space-between;text-align:left;'
    + 'gap:14px;padding:10px 0;border-bottom:1px dashed rgba(255,255,255,.08)}'
    + '.rexo-c-opt strong{display:block;font-size:.82rem;text-transform:uppercase;letter-spacing:.05em}'
    + '.rexo-c-opt small{color:#9B9B9B;font-size:.78rem;line-height:1.4;display:block}'
    + '.rexo-c-opt input{width:18px;height:18px;accent-color:#fff;margin:0;flex-shrink:0;cursor:pointer}'
    + '.rexo-c-opt input:disabled{cursor:not-allowed}'
    + '@media (max-width:560px){#rexo-cookie{left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));padding:20px}'
    + '.rexo-c-row{flex-direction:column;align-items:stretch}'
    + '.rexo-c-btn{width:100%;min-height:50px}'
    + '.rexo-c-opt input{width:22px;height:22px}}';

  /* ---------- markup ---------- */
  var html = ''
    + '<h3><i>\u2733\uFE0E</i> Cookie</h3>'
    + '<p>Usiamo cookie tecnici per far funzionare il sito e, solo con il tuo consenso, '
    + 'cookie analitici e di marketing. Dettagli nella '
    + '<a href="cookie-policy.html">Cookie Policy</a>.</p>'
    + '<div id="rexo-cookie-prefs">'
    + '  <div class="rexo-c-opt"><div><strong>Essenziali</strong>'
    + '    <small>Necessari al funzionamento del sito e al salvataggio di questa scelta. Sempre attivi.</small></div>'
    + '    <input type="checkbox" checked disabled></div>'
    + '  <div class="rexo-c-opt"><div><strong>Analitici</strong>'
    + '    <small>Statistiche aggregate su visite e pagine per migliorare il sito (es. Google Analytics).</small></div>'
    + '    <input type="checkbox" id="rexo-c-analytics"></div>'
    + '  <div class="rexo-c-opt" style="border-bottom:none"><div><strong>Marketing</strong>'
    + '    <small>Misurazione delle campagne pubblicitarie e annunci personalizzati (es. Meta Pixel, Google Ads).</small></div>'
    + '    <input type="checkbox" id="rexo-c-marketing"></div>'
    + '</div>'
    + '<div class="rexo-c-row" style="margin-top:16px">'
    + '  <button class="rexo-c-btn" id="rexo-c-accept">Accetta tutti</button>'
    + '  <button class="rexo-c-btn ghost" id="rexo-c-reject">Rifiuta</button>'
    + '  <button class="rexo-c-btn link" id="rexo-c-custom">Personalizza</button>'
    + '  <button class="rexo-c-btn ghost" id="rexo-c-save" style="display:none">Salva preferenze</button>'
    + '</div>';

  var banner = null;

  function buildBanner() {
    if (banner) return banner;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    banner = document.createElement('div');
    banner.id = 'rexo-cookie';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferenze cookie');
    banner.innerHTML = html;
    document.body.appendChild(banner);

    var btnCustom = banner.querySelector('#rexo-c-custom');
    var btnSave   = banner.querySelector('#rexo-c-save');

    banner.querySelector('#rexo-c-accept').addEventListener('click', function () {
      decide({ essential: true, analytics: true, marketing: true });
    });
    banner.querySelector('#rexo-c-reject').addEventListener('click', function () {
      decide({ essential: true, analytics: false, marketing: false });
    });
    btnCustom.addEventListener('click', function () {
      banner.classList.add('expanded');
      btnCustom.style.display = 'none';
      btnSave.style.display = 'inline-block';
    });
    btnSave.addEventListener('click', function () {
      decide({
        essential: true,
        analytics: banner.querySelector('#rexo-c-analytics').checked,
        marketing: banner.querySelector('#rexo-c-marketing').checked
      });
    });
    return banner;
  }

  function decide(c) {
    saveConsent(c);
    applyConsent(c);
    hide();
  }
  function show(prefill) {
    buildBanner();
    if (prefill) {
      banner.querySelector('#rexo-c-analytics').checked = !!prefill.analytics;
      banner.querySelector('#rexo-c-marketing').checked = !!prefill.marketing;
    }
    requestAnimationFrame(function(){ banner.classList.add('on'); });
  }
  function hide() {
    if (!banner) return;
    banner.classList.remove('on');
    setTimeout(function(){ if (banner){ banner.remove(); banner = null; } }, 500);
  }

  /* API pubblica: riapri le preferenze da link/footer */
  window.rexoConsent = {
    open: function () { show(readConsent()); },
    get: readConsent
  };

  /* avvio */
  function init() {
    var c = readConsent();
    if (c) { applyConsent(c); } else { show(null); }
    /* link "Gestisci cookie" */
    document.querySelectorAll('[data-cookie-prefs]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); window.rexoConsent.open(); });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
