/**
 * a11y-modal.js - wspoldzielona warstwa dostepnosci modali FormattedAI.
 *
 * Nadaje modalom role="dialog" + aria-modal + aria-labelledby, przenosi fokus
 * do modala po otwarciu, zamyka fokus w pulapce Tab / Shift+Tab i przywraca go
 * na element sprzed otwarcia. Otwarcie/zamkniecie wykrywa MutationObserver
 * (atrybut hidden lub klasa), wiec logika open/close w modulach narzedzi
 * pozostaje nietknieta. Drugi obserwator pilnuje document.body, dzieki czemu
 * modale tworzone w runtime (PDF: podglad pelnoekranowy, pad podpisu) tez sa
 * obslugiwane - takze te sterowane przez dodanie/usuniecie z DOM.
 * Escape i klikniecie w tlo obsluguja skrypty stron.
 */
(function () {
  'use strict';

  // Wzorce markupu modali w serwisie.
  // openClass = modal sterowany klasa zamiast atrybutu hidden.
  var PATTERNS = [
    { sel: '.about-modal-overlay' },
    { sel: '.image-modal' },
    { sel: '.preview-overlay' },
    { sel: '.t-pal-overlay', openClass: 'is-open' },
    { sel: '.fs-pages-overlay' },
    { sel: '.signature-pad-overlay' }
  ];

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),' +
    'select:not([disabled]),textarea:not([disabled]),iframe,' +
    '[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

  var TITLE = '[data-modal-title],.about-modal__title span,h1,h2,h3';

  var ALL = PATTERNS.map(function (p) { return p.sel; }).join(',');
  var stack = [];
  var seq = 0;
  var lastOutside = null;

  function inModal(node) {
    return !!(node && node.nodeType === 1 && node.closest && node.closest(ALL));
  }

  function focusables(root) {
    var out = [];
    var list = root.querySelectorAll(FOCUSABLE);
    for (var i = 0; i < list.length; i++) {
      if (list[i].getClientRects().length) out.push(list[i]);
    }
    return out;
  }

  function setup(el) {
    // Dialogiem jest overlay, chyba ze markup deklaruje go glebiej.
    var dlg = el.querySelector('[role="dialog"],[role="alertdialog"]') || el;
    if (!dlg.getAttribute('role')) dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    // aria-hidden na samym dialogu klocilby sie z aria-modal.
    if (dlg.getAttribute('aria-hidden') === 'true') dlg.removeAttribute('aria-hidden');
    if (el.getAttribute('aria-hidden') === 'true') el.removeAttribute('aria-hidden');

    var ref = dlg.getAttribute('aria-labelledby');
    if (ref && !document.getElementById(ref)) dlg.removeAttribute('aria-labelledby');
    if (dlg.hasAttribute('aria-label') || dlg.hasAttribute('aria-labelledby')) return;

    var title = el.querySelector(TITLE);
    if (!title) return;
    if (!title.id) title.id = 'a11y-modal-title-' + (++seq);
    dlg.setAttribute('aria-labelledby', title.id);
  }

  function isOpen(m) {
    // Modal usuniety z DOM (np. pad podpisu) jest zamkniety.
    if (m.el.hidden || !m.el.isConnected) return false;
    return !m.openClass || m.el.classList.contains(m.openClass);
  }

  function open(m) {
    if (m.inert) m.el.removeAttribute('inert');
    if (stack.indexOf(m) !== -1) return;
    var ae = document.activeElement;
    m.prev = (ae && ae !== document.body && !inModal(ae)) ? ae : lastOutside;
    stack.push(m);
    // Modul narzedzia mogl juz ustawic fokus (np. na przycisku akcji).
    if (m.el.contains(document.activeElement)) return;
    var target = m.el.querySelector('[autofocus]') || focusables(m.el)[0];
    if (target) { try { target.focus(); } catch (e) { /* noop */ } }
  }

  function close(m) {
    if (m.inert) m.el.setAttribute('inert', '');
    var i = stack.indexOf(m);
    if (i === -1) return;
    stack.splice(i, 1);
    var prev = m.prev;
    m.prev = null;
    var ae = document.activeElement;
    // Nie odbieraj fokusa, jesli uzytkownik jest juz gdzie indziej.
    if (ae && ae !== document.body && !m.el.contains(ae)) return;
    if (!prev || !prev.isConnected) return;
    try { prev.focus(); } catch (e) { /* noop */ }
  }

  document.addEventListener('focusin', function (e) {
    if (!inModal(e.target)) lastOutside = e.target;
  }, true);

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !stack.length) return;
    var m = stack[stack.length - 1];
    var list = focusables(m.el);
    if (!list.length) { e.preventDefault(); return; }
    var first = list[0];
    var last = list[list.length - 1];
    var ae = document.activeElement;
    if (!m.el.contains(ae)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && ae === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && ae === last) {
      e.preventDefault();
      first.focus();
    }
  }, true);

  var obs = new MutationObserver(function (recs) {
    for (var i = 0; i < recs.length; i++) {
      var m = recs[i].target.__a11yModal;
      if (!m) continue;
      if (isOpen(m)) open(m); else close(m);
    }
  });

  function register(el, pattern) {
    var m = el.__a11yModal;
    if (!m) {
      m = {
        el: el,
        openClass: pattern.openClass || null,
        // Modale sterowane klasa nie znikaja z drzewa - poza nimi
        // atrybut hidden i tak usuwa zawartosc z kolejnosci Tab.
        inert: !!pattern.openClass,
        prev: null
      };
      el.__a11yModal = m;
      setup(el);
      obs.observe(el, { attributes: true, attributeFilter: ['hidden', 'class'] });
    }
    if (isOpen(m)) open(m);
    else if (m.inert) el.setAttribute('inert', '');
  }

  // Rejestruje modale w poddrzewie (i sam wezel, jesli pasuje do wzorca).
  function scan(root) {
    for (var p = 0; p < PATTERNS.length; p++) {
      var sel = PATTERNS[p].sel;
      if (root.nodeType === 1 && root.matches && root.matches(sel)) register(root, PATTERNS[p]);
      var nodes = root.querySelectorAll ? root.querySelectorAll(sel) : [];
      for (var i = 0; i < nodes.length; i++) register(nodes[i], PATTERNS[p]);
    }
  }

  // Modal moze zniknac przez usuniecie z DOM - wtedy trzeba zdjac go ze stosu,
  // inaczej pulapka Tab zostalaby aktywna dla odlaczonego elementu.
  function prune() {
    for (var i = stack.length - 1; i >= 0; i--) {
      if (!stack[i].el.isConnected) close(stack[i]);
    }
  }

  var bodyObs = new MutationObserver(function (recs) {
    var removed = false;
    for (var i = 0; i < recs.length; i++) {
      var added = recs[i].addedNodes;
      for (var a = 0; a < added.length; a++) {
        if (added[a].nodeType === 1) scan(added[a]);
      }
      if (recs[i].removedNodes.length) removed = true;
    }
    if (removed) prune();
  });

  function init() {
    scan(document);
    // Modale doklejane do body w runtime (pdf.js) rejestrujemy leniwie.
    if (document.body) bodyObs.observe(document.body, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
