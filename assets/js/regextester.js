// ============================================
// FormattedAI - Regex Tester
// Silnik: natywny RegExp uruchamiany w Web Workerze (regex-worker) z watchdogiem
// na main thread. Zawieszony wzorzec (ReDoS) konczy sie terminate() + ostrzezeniem,
// karta zyje dalej. Podswietlanie budowane wylacznie przez textContent/createTextNode -
// tekst testowy i trafienia od uzytkownika NIGDY nie trafiaja do innerHTML.
// 100% client-side, brak zaleznosci, brak sieci.
// ============================================
(function () {
  'use strict';

  // ---- language + i18n ----
  var LANG = (document.documentElement.lang || 'pl').toLowerCase().indexOf('en') === 0 ? 'en' : 'pl';
  var I18N = {
    pl: {
      copied: 'Skopiowano do schowka',
      nothing: 'Nie ma czego skopiowac',
      noMatches: 'Brak dopasowan',
      calculating: 'Licze...',
      invalidPattern: 'Nieprawidlowy wzorzec: ',
      redos: 'Wzorzec dziala zbyt dlugo i zostal przerwany (mozliwy ReDoS). Uprosc wzorzec lub skroc tekst.',
      workerErr: 'Silnik dopasowania nie odpowiedzial - sprobuj ponownie.',
      truncated: 'Pokazano pierwsze ',
      truncated2: ' dopasowan (limit ochronny).',
      textTooLong: 'Tekst testowy skrocono do limitu ',
      emptyPattern: 'Wpisz wzorzec, aby zobaczyc dopasowania.',
      matchList: 'Lista dopasowan',
      groupsLabel: 'Grupy',
      noGroups: 'brak grup przechwytujacych',
      unnamed: 'grupa',
      loaded: 'Wczytano przyklad',
      cleared: 'Wyczyszczono',
      pos: 'poz.',
      len: 'dl.',
      full: 'trafienie',
      nullGroup: '(nie dopasowano)',
      explainEmpty: 'Wpisz wzorzec, aby zobaczyc wyjasnienie token po tokenie.',
      explainUnknown: 'Nie potrafie wyjasnic tego fragmentu.',
      copySnippet: 'Skopiowano snippet JS',
      copyJson: 'Skopiowano JSON',
      copyReplace: 'Skopiowano wynik zamiany',
      matchesOne: 'dopasowanie', matchesFew: 'dopasowania', matchesMany: 'dopasowan',
      matchOne: 'match', matchOther: 'matches'
    },
    en: {
      copied: 'Copied to clipboard',
      nothing: 'Nothing to copy',
      noMatches: 'No matches',
      calculating: 'Calculating...',
      invalidPattern: 'Invalid pattern: ',
      redos: 'The pattern ran too long and was aborted (possible ReDoS). Simplify the pattern or shorten the text.',
      workerErr: 'The matching engine did not respond - please try again.',
      truncated: 'Showing the first ',
      truncated2: ' matches (safety limit).',
      textTooLong: 'Test text was trimmed to the limit of ',
      emptyPattern: 'Enter a pattern to see matches.',
      matchList: 'Match list',
      groupsLabel: 'Groups',
      noGroups: 'no capturing groups',
      unnamed: 'group',
      loaded: 'Example loaded',
      cleared: 'Cleared',
      pos: 'pos',
      len: 'len',
      full: 'match',
      nullGroup: '(not matched)',
      explainEmpty: 'Enter a pattern to see a token-by-token explanation.',
      explainUnknown: 'I can’t explain this fragment.',
      copySnippet: 'JS snippet copied',
      copyJson: 'JSON copied',
      copyReplace: 'Replacement result copied',
      matchesOne: 'match', matchesFew: 'matches', matchesMany: 'matches',
      matchOne: 'match', matchOther: 'matches'
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }

  // ---- pluralization (PL: one/few/many ; EN: one/other) ----
  function pluralCategory(n) {
    n = Math.abs(n);
    if (LANG === 'pl') {
      if (n === 1) return 'one';
      var m10 = n % 10, m100 = n % 100;
      if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return 'few';
      return 'many';
    }
    return n === 1 ? 'one' : 'other';
  }
  // "1 dopasowanie / 2 dopasowania / 5 dopasowan" ; "1 match / 2 matches"
  function matchesLabel(n) {
    var cat = pluralCategory(n);
    var word;
    if (LANG === 'pl') {
      word = cat === 'one' ? t('matchesOne') : cat === 'few' ? t('matchesFew') : t('matchesMany');
    } else {
      word = cat === 'one' ? t('matchOne') : t('matchOther');
    }
    return n + ' ' + word;
  }

  // ---- helpers ----
  function qs(id) { return document.getElementById(id); }
  var toast = qs('rx-toast');
  var toastTimer = null;
  function notify(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2200);
  }
  function copyText(text, okMsg) {
    if (!text) { notify(t('nothing')); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { notify(okMsg || t('copied')); }, function () { fallbackCopy(text, okMsg); });
    } else { fallbackCopy(text, okMsg); }
  }
  function fallbackCopy(text, okMsg) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'absolute'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      notify(okMsg || t('copied'));
    } catch (e) { /* ignore */ }
  }

  // ============================================
  // WORKER CLIENT + WATCHDOG (ReDoS guard)
  // ============================================
  var WORKER_URL = '/assets/js/regex-worker.min.js';
  // Dwustopniowy watchdog. Etap 1 (BOOT): worker musi ozyc i przyslac ACK
  // (fetch skryptu ~1.4kb z tej samej domeny + start watku). Etap 2 (COMPUTE):
  // dopiero po ACK mierzymy czas samego dopasowania - zdrowy wzorzec na
  // kilkudziesieciu KB konczy w kilka ms, a przekroczenie 600 ms traktujemy
  // jak zawieszenie (ReDoS) i ubijamy workera. Rozdzielenie budzetow sprawia,
  // ze wolny cold-start nie jest liczony do budzetu obliczen.
  var BOOT_MS = 4000;    // budzet na start workera i przyslanie ACK
  var WATCHDOG_MS = 600; // budzet na samo dopasowanie (po ACK)
  var MAX_TEXT_LEN = 200000; // twardy limit dlugosci tekstu testowego

  var worker = null;
  var jobId = 0;
  var pending = null; // {id, resolve, reject, timer, acked}

  function killWorker() {
    if (worker) { try { worker.terminate(); } catch (_) {} worker = null; }
  }
  function onWorkerMessage(e) {
    var d = e.data || {};
    // ACK biezacego joba: worker ozyl i podjal zadanie - przelacz z budzetu
    // BOOT na budzet COMPUTE (od teraz watchdog mierzy juz tylko obliczenia).
    if (d.ack) {
      if (!pending || pending.id !== d.id || pending.acked) return;
      pending.acked = true;
      clearTimeout(pending.timer);
      var acked = pending;
      acked.timer = setTimeout(function () {
        if (pending !== acked) return;
        pending = null;
        killWorker(); // ubij zawieszony watek - kolejny run stworzy nowego workera
        var e2 = new Error('redos'); e2.code = 'redos'; acked.reject(e2);
      }, WATCHDOG_MS);
      return;
    }
    // Wynik (ok:true albo ok:false z code:'compile'). Odporne takze na wynik
    // ktory dotarl bez ACK - i tak czyscimy aktualnie uzbrojony timer.
    if (!pending || pending.id !== d.id) return;
    clearTimeout(pending.timer);
    var job = pending; pending = null;
    if (d.ok) job.resolve(d);
    else { var err = new Error(d.error || 'compile'); err.code = d.code || 'compile'; job.reject(err); }
  }
  function ensureWorker() {
    if (worker) return worker;
    var w = new Worker(WORKER_URL);
    w.onmessage = onWorkerMessage;
    w.onerror = function () {
      if (pending) {
        clearTimeout(pending.timer);
        var j = pending; pending = null;
        killWorker();
        var e = new Error('worker'); e.code = 'worker'; j.reject(e);
      } else { killWorker(); }
    };
    worker = w;
    return w;
  }
  function runInWorker(payload) {
    return new Promise(function (resolve, reject) {
      // Poprzedni job wciaz w locie: jego worker jest zajety - moze zawieszony
      // przez ReDoS - i nie obsluzy nowego zapytania (watek jest jednobiezny).
      // Ubijamy go, zeby nowy run dostal swiezy, odpowiadajacy watek. To tez
      // natychmiast reapuje zawieszony wzorzec, zamiast czekac na BOOT_MS.
      // Zdrowy worker miedzy zapytaniami ma pending === null, wiec jest wznawiany.
      if (pending) { clearTimeout(pending.timer); pending = null; killWorker(); }
      var instance;
      try { instance = ensureWorker(); }
      catch (e) { reject(e); return; }
      var id = ++jobId;
      var job = { id: id, resolve: resolve, reject: reject, timer: null, acked: false };
      pending = job;
      try {
        instance.postMessage({ id: id, pattern: payload.pattern, flags: payload.flags, text: payload.text, wantReplace: payload.wantReplace, replacement: payload.replacement });
      } catch (e) {
        pending = null; killWorker();
        reject(e);
        return;
      }
      // Etap 1: watchdog BOOT. Jesli ACK nie dotrze - worker nie ozyl
      // (np. 404 skryptu / blad parsowania nie zlapany przez onerror).
      job.timer = setTimeout(function () {
        if (pending !== job) return;
        pending = null;
        killWorker();
        var err = new Error('worker'); err.code = 'worker'; reject(err);
      }, BOOT_MS);
    });
  }

  // Awaryjna sciezka gdy przegladarka nie ma Web Workerow (skrajnie rzadkie przy es2020).
  // Bez watchdoga, ale z limitem tekstu; sama logika identyczna jak w workerze.
  function runOnMainThread(payload) {
    var re = new RegExp(payload.pattern, payload.flags); // moze rzucic SyntaxError
    var matches = [];
    var truncated = false;
    var isGlobal = payload.flags.indexOf('g') !== -1 || payload.flags.indexOf('y') !== -1;
    var text = payload.text;
    if (!isGlobal) {
      var single = re.exec(text);
      if (single) matches.push(serializeLocal(single));
    } else {
      re.lastIndex = 0;
      var m;
      while ((m = re.exec(text)) !== null) {
        matches.push(serializeLocal(m));
        if (m.index === re.lastIndex) re.lastIndex++;
        if (matches.length >= 20000) { truncated = true; break; }
      }
    }
    var replaced = null;
    if (payload.wantReplace) { re.lastIndex = 0; replaced = text.replace(re, payload.replacement || ''); }
    return { ok: true, matches: matches, replaced: replaced, truncated: truncated };
  }
  function serializeLocal(m) {
    var groups = [];
    for (var i = 1; i < m.length; i++) {
      var g = { value: m[i] === undefined ? null : m[i] };
      if (m.indices && m.indices[i]) { g.start = m.indices[i][0]; g.end = m.indices[i][1]; } else { g.start = -1; g.end = -1; }
      groups.push(g);
    }
    var named = [];
    if (m.groups) {
      for (var name in m.groups) {
        if (Object.prototype.hasOwnProperty.call(m.groups, name)) {
          var ng = { name: name, value: m.groups[name] === undefined ? null : m.groups[name] };
          if (m.indices && m.indices.groups && m.indices.groups[name]) { ng.start = m.indices.groups[name][0]; ng.end = m.indices.groups[name][1]; }
          else { ng.start = -1; ng.end = -1; }
          named.push(ng);
        }
      }
    }
    return { match: m[0], start: m.index, end: m.index + m[0].length, groups: groups, named: named };
  }
  var HAS_WORKER = typeof Worker === 'function';

  // ============================================
  // STATE + DOM
  // ============================================
  var LS = 'formattedai-regextester-state';
  var ALL_FLAGS = ['g', 'i', 'm', 's', 'u', 'y', 'd'];
  var state = {
    pattern: '',
    flags: { g: true, i: false, m: false, s: false, u: false, y: false, d: false },
    text: '',
    replacement: '',
    replaceOn: false
  };

  var patternInput = qs('rx-pattern');
  var patternErr = qs('rx-pattern-err');
  var testInput = qs('rx-test-text');
  var highlight = qs('rx-highlight');
  var replaceInput = qs('rx-replace');
  var replacePreview = qs('rx-replace-preview');
  var replaceToggle = qs('rx-replace-toggle');
  var replacePanel = qs('rx-replace-panel');
  var countEl = qs('rx-count');
  var matchListEl = qs('rx-match-list');
  var explainEl = qs('rx-explain');
  var noticeEl = qs('rx-notice');

  // feature-detect flag 'd' (hasIndices) - es2022; disable chip if unsupported
  var D_SUPPORTED = (function () { try { new RegExp('a', 'd'); return true; } catch (e) { return false; } })();

  function flagString() {
    var s = '';
    ALL_FLAGS.forEach(function (f) { if (state.flags[f]) s += f; });
    return s;
  }

  // ============================================
  // PERSISTENCE
  // ============================================
  function save() {
    try {
      localStorage.setItem(LS, JSON.stringify({
        pattern: state.pattern, flags: state.flags, text: state.text,
        replacement: state.replacement, replaceOn: state.replaceOn
      }));
    } catch (e) { /* ignore */ }
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(LS); } catch (e) { return; }
    if (!raw) return;
    try {
      var d = JSON.parse(raw);
      if (typeof d.pattern === 'string') state.pattern = d.pattern;
      if (typeof d.text === 'string') state.text = d.text;
      if (typeof d.replacement === 'string') state.replacement = d.replacement;
      if (typeof d.replaceOn === 'boolean') state.replaceOn = d.replaceOn;
      if (d.flags && typeof d.flags === 'object') {
        ALL_FLAGS.forEach(function (f) { if (typeof d.flags[f] === 'boolean') state.flags[f] = d.flags[f]; });
      }
      if (!D_SUPPORTED) state.flags.d = false;
    } catch (e) { /* ignore */ }
  }

  // ============================================
  // HIGHLIGHT (XSS-safe: only text nodes + <mark>, never innerHTML on user data)
  // ============================================
  function renderHighlight(text, matches) {
    if (!highlight) return;
    while (highlight.firstChild) highlight.removeChild(highlight.firstChild);
    var frag = document.createDocumentFragment();
    var pos = 0;
    var colorIdx = 0;
    for (var i = 0; i < matches.length; i++) {
      var mm = matches[i];
      var s = mm.start, e = mm.end;
      if (s < pos) continue; // ochrona przed nakladaniem (nie powinno wystapic)
      if (s > pos) frag.appendChild(document.createTextNode(text.slice(pos, s)));
      var mark = document.createElement('mark');
      mark.className = 'rx-hl__mark rx-hl__mark--c' + (colorIdx % 5);
      if (e === s) {
        mark.className += ' rx-hl__mark--zero'; // dopasowanie zerowej dlugosci -> znacznik CSS
      } else {
        mark.textContent = text.slice(s, e); // textContent = zero XSS
      }
      frag.appendChild(mark);
      pos = e;
      colorIdx++;
    }
    if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
    // domykajaca linia: gdy tekst konczy sie \n, dodatkowy \n odtwarza pusta linie,
    // ktora textarea pokazuje na dole - inaczej overlay i pole rozjechalyby sie o linie
    if (text.length && text.charAt(text.length - 1) === '\n') {
      frag.appendChild(document.createTextNode('\n'));
    }
    highlight.appendChild(frag);
    syncScroll();
  }
  function syncScroll() {
    if (!highlight || !testInput) return;
    highlight.scrollTop = testInput.scrollTop;
    highlight.scrollLeft = testInput.scrollLeft;
  }

  // ============================================
  // MATCH LIST + GROUPS (all values via textContent)
  // ============================================
  function cell(cls, text) {
    var el = document.createElement('span');
    el.className = cls;
    el.textContent = text;
    return el;
  }
  function renderMatchList(matches) {
    if (!matchListEl) return;
    while (matchListEl.firstChild) matchListEl.removeChild(matchListEl.firstChild);
    if (!matches.length) {
      matchListEl.appendChild(cell('rx-empty', t('noMatches')));
      return;
    }
    for (var i = 0; i < matches.length; i++) {
      var mm = matches[i];
      var item = document.createElement('div');
      item.className = 'rx-match';

      var head = document.createElement('div');
      head.className = 'rx-match__head';
      head.appendChild(cell('rx-match__idx', '#' + (i + 1)));
      head.appendChild(cell('rx-match__val', mm.match));
      head.appendChild(cell('rx-match__meta', t('pos') + ' ' + mm.start + '–' + mm.end + ' · ' + t('len') + ' ' + (mm.end - mm.start)));
      item.appendChild(head);

      var hasGroups = (mm.groups && mm.groups.length) || (mm.named && mm.named.length);
      if (hasGroups) {
        var gl = document.createElement('div');
        gl.className = 'rx-match__groups';
        var gi;
        for (gi = 0; gi < mm.groups.length; gi++) {
          gl.appendChild(groupRow('$' + (gi + 1), mm.groups[gi]));
        }
        if (mm.named) {
          for (gi = 0; gi < mm.named.length; gi++) {
            gl.appendChild(groupRow('<' + mm.named[gi].name + '>', mm.named[gi]));
          }
        }
        item.appendChild(gl);
      }
      matchListEl.appendChild(item);
    }
  }
  function groupRow(label, g) {
    var row = document.createElement('div');
    row.className = 'rx-group';
    row.appendChild(cell('rx-group__key', label));
    if (g.value === null) {
      row.appendChild(cell('rx-group__val rx-group__val--null', t('nullGroup')));
    } else {
      row.appendChild(cell('rx-group__val', g.value));
      if (g.start >= 0) row.appendChild(cell('rx-group__pos', t('pos') + ' ' + g.start + '–' + g.end));
    }
    return row;
  }

  // ============================================
  // NOTICES / ERRORS
  // ============================================
  function setPatternError(msg) {
    if (!patternErr) return;
    patternErr.textContent = msg || '';
    patternErr.hidden = !msg;
    if (patternInput) patternInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function setNotice(msg, kind) {
    if (!noticeEl) return;
    noticeEl.textContent = msg || '';
    noticeEl.hidden = !msg;
    noticeEl.className = 'rx-notice' + (kind ? ' rx-notice--' + kind : '');
  }

  // ============================================
  // MAIN RUN (debounced)
  // ============================================
  var debounceTimer = null;
  function scheduleRun() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runNow, 150);
  }

  // Rosnacy token: kazde runNow dostaje wlasny numer. Wynik/blad z workera stosujemy
  // tylko gdy nalezy do najswiezszego zapytania - inaczej stary wynik nadpisalby "Licze...".
  var runToken = 0;
  function setCalculating(on) {
    if (!countEl) return;
    if (on) { countEl.textContent = t('calculating'); countEl.classList.add('is-calculating'); }
    else { countEl.classList.remove('is-calculating'); }
  }

  function runNow() {
    var pattern = state.pattern;
    var flags = flagString();
    var text = state.text;

    var token = ++runToken;

    // always refresh explainer (synchronous, cheap)
    renderExplain(pattern);

    if (!pattern) {
      setCalculating(false);
      setPatternError('');
      setNotice(t('emptyPattern'), 'info');
      renderHighlight(text, []);
      renderMatchList([]);
      if (countEl) countEl.textContent = matchesLabel(0);
      updateReplacePreview(text, null, '');
      save();
      return;
    }

    var payload = {
      pattern: pattern, flags: flags, text: text,
      wantReplace: state.replaceOn, replacement: state.replacement
    };

    // zapytanie w drodze - subtelny stan "Licze..." zanim wroci wynik/blad
    setCalculating(true);

    var runner = HAS_WORKER
      ? runInWorker(payload)
      : new Promise(function (res, rej) { try { res(runOnMainThread(payload)); } catch (e) { rej(e); } });

    runner.then(function (d) {
      if (token !== runToken) return; // przedawniony wynik - nowszy run juz w toku
      setCalculating(false);
      setPatternError('');
      var matches = d.matches || [];
      renderHighlight(text, matches);
      renderMatchList(matches);
      if (countEl) countEl.textContent = matchesLabel(matches.length);
      if (d.truncated) setNotice(t('truncated') + '20000' + t('truncated2'), 'warn');
      else setNotice('', '');
      updateReplacePreview(text, d.replaced, pattern);
      save();
    }, function (err) {
      if (token !== runToken) return; // przedawniony blad - nowszy run juz w toku
      setCalculating(false);
      var code = err && err.code;
      if (code === 'redos') {
        setNotice(t('redos'), 'error');
      } else if (code === 'worker') {
        setNotice(t('workerErr'), 'error');
      } else {
        // compile / SyntaxError - werdykt o wzorcu
        setPatternError(t('invalidPattern') + (err && err.message ? err.message : ''));
      }
      renderHighlight(text, []);
      renderMatchList([]);
      if (countEl) countEl.textContent = matchesLabel(0);
      save();
    });
  }

  function updateReplacePreview(text, replaced, pattern) {
    if (!replacePreview) return;
    if (!state.replaceOn) return;
    if (replaced === null || !pattern) { replacePreview.value = text; return; }
    replacePreview.value = replaced;
  }

  // ============================================
  // EXPLAINER - wlasny tokenizer wzorca
  // ============================================
  // Zwraca liste tokenow {raw, desc} lub {raw, unknown:true}. Skanuje wzorzec liniowo.
  function tokenizePattern(src) {
    var tokens = [];
    var i = 0, n = src.length;
    var litBuf = '';
    function flushLit() {
      if (litBuf) { tokens.push({ raw: litBuf, desc: describeLiteral(litBuf) }); litBuf = ''; }
    }
    while (i < n) {
      var c = src.charAt(i);

      if (c === '\\') {
        flushLit();
        var esc2 = parseEscape(src, i);
        if (esc2) { tokens.push(esc2.token); i = esc2.next; continue; }
        // lone backslash at end
        tokens.push({ raw: '\\', unknown: true }); i++; continue;
      }

      if (c === '[') {
        flushLit();
        var cls = parseCharClass(src, i);
        if (cls) { tokens.push(cls.token); i = cls.next; continue; }
        tokens.push({ raw: '[', unknown: true }); i++; continue;
      }

      if (c === '(') {
        flushLit();
        var grp = parseGroupOpen(src, i);
        tokens.push(grp.token); i = grp.next; continue;
      }
      if (c === ')') { flushLit(); tokens.push({ raw: ')', desc: L('Koniec grupy', 'End of group') }); i++; continue; }

      if (c === '|') { flushLit(); tokens.push({ raw: '|', desc: L('Alternacja - dopasuj wariant po lewej albo po prawej', 'Alternation - match the left or the right side') }); i++; continue; }

      if (c === '^') { flushLit(); tokens.push({ raw: '^', desc: L('Poczatek tekstu (z flaga m - poczatek linii)', 'Start of input (with flag m - start of line)') }); i++; continue; }
      if (c === '$') { flushLit(); tokens.push({ raw: '$', desc: L('Koniec tekstu (z flaga m - koniec linii)', 'End of input (with flag m - end of line)') }); i++; continue; }

      if (c === '.') { flushLit(); tokens.push({ raw: '.', desc: L('Dowolny znak oprocz nowej linii (z flaga s - takze nowa linia)', 'Any character except newline (with flag s - newline too)') }); i++; continue; }

      if (c === '*' || c === '+' || c === '?' || c === '{') {
        var q = parseQuantifier(src, i);
        if (q) { flushLit(); tokens.push(q.token); i = q.next; continue; }
        // '{' that is not a valid quantifier is treated as literal
      }

      // literal char
      litBuf += c; i++;
    }
    flushLit();
    return tokens;
  }

  function L(pl, en) { return LANG === 'en' ? en : pl; }

  function describeLiteral(s) {
    if (s.length === 1) return L('Literal - dopasuj dokladnie znak ', 'Literal - match the exact character ') + '"' + s + '"';
    return L('Literaly - dopasuj dokladnie ciag ', 'Literals - match the exact sequence ') + '"' + s + '"';
  }

  var ESC_CLASS = {
    'd': L('Cyfra [0-9]', 'A digit [0-9]'),
    'D': L('Znak niebedacy cyfra', 'A non-digit'),
    'w': L('Znak slowa [A-Za-z0-9_]', 'A word character [A-Za-z0-9_]'),
    'W': L('Znak niebedacy znakiem slowa', 'A non-word character'),
    's': L('Bialy znak (spacja, tab, nowa linia...)', 'Whitespace (space, tab, newline...)'),
    'S': L('Znak niebedacy bialym znakiem', 'A non-whitespace character'),
    'b': L('Granica slowa', 'A word boundary'),
    'B': L('Brak granicy slowa', 'A non-word-boundary'),
    'n': L('Nowa linia (LF)', 'Newline (LF)'),
    'r': L('Powrot karetki (CR)', 'Carriage return (CR)'),
    't': L('Tabulacja', 'Tab'),
    'f': L('Wysuw strony (FF)', 'Form feed (FF)'),
    'v': L('Tabulacja pionowa', 'Vertical tab'),
    '0': L('Znak NUL', 'NUL character')
  };
  function parseEscape(src, i) {
    // i points at '\'
    var c = src.charAt(i + 1);
    if (c === '') return null;
    // \xHH
    if (c === 'x' && /^[0-9a-fA-F]{2}$/.test(src.substr(i + 2, 2))) {
      var hx = src.substr(i + 2, 2);
      return { token: { raw: '\\x' + hx, desc: L('Znak o kodzie szesnastkowym 0x', 'Character with hex code 0x') + hx }, next: i + 4 };
    }
    // \uHHHH
    if (c === 'u' && /^[0-9a-fA-F]{4}$/.test(src.substr(i + 2, 4))) {
      var un = src.substr(i + 2, 4);
      return { token: { raw: '\\u' + un, desc: L('Znak Unicode U+', 'Unicode character U+') + un.toUpperCase() }, next: i + 6 };
    }
    // \u{...}
    if (c === 'u' && src.charAt(i + 2) === '{') {
      var close = src.indexOf('}', i + 3);
      if (close > 0 && /^[0-9a-fA-F]+$/.test(src.slice(i + 3, close))) {
        var cp = src.slice(i + 3, close);
        return { token: { raw: src.slice(i, close + 1), desc: L('Punkt kodowy Unicode U+', 'Unicode code point U+') + cp.toUpperCase() + L(' (wymaga flagi u)', ' (needs flag u)') }, next: close + 1 };
      }
    }
    // \k<name> backreference
    if (c === 'k' && src.charAt(i + 2) === '<') {
      var kclose = src.indexOf('>', i + 3);
      if (kclose > 0) {
        var kn = src.slice(i + 3, kclose);
        return { token: { raw: src.slice(i, kclose + 1), desc: L('Odwolanie do nazwanej grupy ', 'Backreference to named group ') + '"' + kn + '"' }, next: kclose + 1 };
      }
    }
    // \1..\9 numeric backreference
    if (/[1-9]/.test(c)) {
      var num = c;
      var j = i + 2;
      while (j < src.length && /[0-9]/.test(src.charAt(j))) { num += src.charAt(j); j++; }
      return { token: { raw: '\\' + num, desc: L('Odwolanie do grupy nr ', 'Backreference to group #') + num }, next: j };
    }
    // known shorthand
    if (ESC_CLASS.hasOwnProperty(c)) {
      return { token: { raw: '\\' + c, desc: ESC_CLASS[c] }, next: i + 2 };
    }
    // escaped metacharacter / any other char -> literal
    return { token: { raw: '\\' + c, desc: L('Znak doslowny ', 'Literal character ') + '"' + c + '"' }, next: i + 2 };
  }

  function parseCharClass(src, i) {
    // i points at '['
    var j = i + 1;
    var negated = false;
    if (src.charAt(j) === '^') { negated = true; j++; }
    var body = '';
    var closed = false;
    // ']' as first char is literal
    if (src.charAt(j) === ']') { body += ']'; j++; }
    while (j < src.length) {
      var ch = src.charAt(j);
      if (ch === '\\') { body += src.substr(j, 2); j += 2; continue; }
      if (ch === ']') { closed = true; j++; break; }
      body += ch; j++;
    }
    if (!closed) return null;
    return {
      token: { raw: src.slice(i, j), desc: describeClass(body, negated) },
      next: j
    };
  }
  function describeClass(body, negated) {
    var parts = [];
    var k = 0;
    while (k < body.length) {
      var ch = body.charAt(k);
      if (ch === '\\') {
        var nx = body.charAt(k + 1);
        if (ESC_CLASS.hasOwnProperty(nx)) parts.push(ESC_CLASS[nx]);
        else parts.push('"' + nx + '"');
        k += 2; continue;
      }
      // range a-z
      if (body.charAt(k + 1) === '-' && k + 2 < body.length && body.charAt(k + 2) !== '\\') {
        parts.push(L('zakres ', 'range ') + ch + '–' + body.charAt(k + 2));
        k += 3; continue;
      }
      parts.push('"' + ch + '"');
      k++;
    }
    var joined = parts.join(', ');
    if (negated) return L('Klasa znakow (negacja) - jeden znak NIEbedacy zadnym z: ', 'Character class (negated) - a single character that is NONE of: ') + joined;
    return L('Klasa znakow - jeden znak z: ', 'Character class - a single character from: ') + joined;
  }

  function parseGroupOpen(src, i) {
    // i points at '('
    var two = src.substr(i, 2);
    var three = src.substr(i, 3);
    var four = src.substr(i, 4);
    if (four === '(?<=') return { token: { raw: '(?<=', desc: L('Lookbehind dodatni - poprzedza to, co pasuje w srodku', 'Positive lookbehind - preceded by the inner pattern') }, next: i + 4 };
    if (four === '(?<!') return { token: { raw: '(?<!', desc: L('Lookbehind ujemny - NIE poprzedza tego, co w srodku', 'Negative lookbehind - not preceded by the inner pattern') }, next: i + 4 };
    if (three === '(?=') return { token: { raw: '(?=', desc: L('Lookahead dodatni - po tym nastepuje to, co w srodku', 'Positive lookahead - followed by the inner pattern') }, next: i + 3 };
    if (three === '(?!') return { token: { raw: '(?!', desc: L('Lookahead ujemny - po tym NIE nastepuje to, co w srodku', 'Negative lookahead - not followed by the inner pattern') }, next: i + 3 };
    if (three === '(?:') return { token: { raw: '(?:', desc: L('Grupa nieprzechwytujaca - grupuje bez zapamietywania', 'Non-capturing group - groups without capturing') }, next: i + 3 };
    if (three === '(?<') {
      var close = src.indexOf('>', i + 3);
      if (close > 0) {
        var name = src.slice(i + 3, close);
        return { token: { raw: src.slice(i, close + 1), desc: L('Grupa nazwana ', 'Named group ') + '"' + name + '"' }, next: close + 1 };
      }
    }
    return { token: { raw: '(', desc: L('Grupa przechwytujaca - zapamietuje dopasowanie', 'Capturing group - captures the match') }, next: i + 1 };
  }

  function parseQuantifier(src, i) {
    var c = src.charAt(i);
    var raw = '', next = i, base = '';
    if (c === '*') { base = L('zero lub wiecej razy', 'zero or more times'); raw = '*'; next = i + 1; }
    else if (c === '+') { base = L('jeden lub wiecej razy', 'one or more times'); raw = '+'; next = i + 1; }
    else if (c === '?') { base = L('zero lub jeden raz (opcjonalnie)', 'zero or one time (optional)'); raw = '?'; next = i + 1; }
    else if (c === '{') {
      var m = /^\{(\d+)(,(\d*)?)?\}/.exec(src.slice(i));
      if (!m) return null;
      raw = m[0];
      next = i + m[0].length;
      if (m[2] === undefined) base = L('dokladnie ', 'exactly ') + m[1] + L(' razy', ' times');
      else if (m[3] === '' || m[3] === undefined) base = L('co najmniej ', 'at least ') + m[1] + L(' razy', ' times');
      else base = L('od ', 'from ') + m[1] + L(' do ', ' to ') + m[3] + L(' razy', ' times');
    } else return null;

    // lazy modifier
    var lazy = '';
    if (src.charAt(next) === '?') { lazy = L(' (leniwie - jak najmniej)', ' (lazy - as few as possible)'); raw += '?'; next += 1; }
    else if (src.charAt(next) === '+') { lazy = L(' (zachlannie bez nawrotow)', ' (possessive - no backtracking)'); raw += '+'; next += 1; }

    return { token: { raw: raw, desc: L('Kwantyfikator - powtorz poprzedni element ', 'Quantifier - repeat the previous element ') + base + lazy }, next: next };
  }

  function renderExplain(pattern) {
    if (!explainEl) return;
    while (explainEl.firstChild) explainEl.removeChild(explainEl.firstChild);
    if (!pattern) {
      explainEl.appendChild(cell('rx-explain__empty', t('explainEmpty')));
      return;
    }
    var tokens = tokenizePattern(pattern);
    for (var i = 0; i < tokens.length; i++) {
      var tk = tokens[i];
      var row = document.createElement('div');
      row.className = 'rx-explain__row' + (tk.unknown ? ' rx-explain__row--unknown' : '');
      row.appendChild(cell('rx-explain__tok', tk.raw));
      row.appendChild(cell('rx-explain__desc', tk.unknown ? t('explainUnknown') : tk.desc));
      explainEl.appendChild(row);
    }
  }

  // ============================================
  // FLAGS UI
  // ============================================
  function bindFlags() {
    var chips = document.querySelectorAll('.rx-flag');
    chips.forEach(function (chip) {
      var f = chip.getAttribute('data-flag');
      if (f === 'd' && !D_SUPPORTED) { chip.disabled = true; chip.setAttribute('aria-disabled', 'true'); chip.title = 'flag d unsupported'; return; }
      chip.setAttribute('aria-pressed', state.flags[f] ? 'true' : 'false');
      chip.classList.toggle('is-on', !!state.flags[f]);
      chip.addEventListener('click', function () {
        state.flags[f] = !state.flags[f];
        chip.setAttribute('aria-pressed', state.flags[f] ? 'true' : 'false');
        chip.classList.toggle('is-on', state.flags[f]);
        scheduleRun();
      });
    });
  }

  // ============================================
  // EXAMPLES LIBRARY
  // ============================================
  // Wzorce i flagi wspolne dla PL/EN; teksty testowe zlokalizowane (text_pl / text_en),
  // aby na /en/regex-tester/ przyklad nie wstrzykiwal polskich slow.
  var EXAMPLES = {
    email: {
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: { g: true },
      text_pl: 'Kontakt: adam@euforia.sc, biuro@example.com, zle@@adres, jan.kowalski+news@firma.co.uk',
      text_en: 'Contact: adam@euforia.sc, office@example.com, bad@@address, john.smith+news@company.co.uk'
    },
    url: {
      pattern: 'https?:\\/\\/[^\\s/$.?#][^\\s]*', flags: { g: true, i: true },
      text_pl: 'Zobacz https://formattedai.pl/regex-tester/ oraz http://example.com/path?x=1#hash, ale nie ftp://serwer.',
      text_en: 'See https://formattedai.pl/en/regex-tester/ and http://example.com/path?x=1#hash, but not ftp://server.'
    },
    ipv4: {
      pattern: '\\b(?:(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)\\b', flags: { g: true },
      text_pl: 'Hosty: 192.168.0.1, 10.0.0.255, 8.8.8.8, 256.300.1.1 (nieprawidlowy).',
      text_en: 'Hosts: 192.168.0.1, 10.0.0.255, 8.8.8.8, 256.300.1.1 (invalid).'
    },
    phone: {
      pattern: '(?:\\+48\\s?)?(?:\\d{3}[\\s-]?){2}\\d{3}', flags: { g: true },
      text_pl: 'Telefon: +48 512 345 678, 500-600-700, 123456789, 12 34 (za krotki).',
      text_en: 'Phone: +48 512 345 678, 500-600-700, 123456789, 12 34 (too short).'
    },
    date: {
      pattern: '\\b(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})\\b', flags: { g: true },
      text_pl: 'Daty: 2026-08-10, 1999-12-31, 2026/08/10 (inny format), 20260810.',
      text_en: 'Dates: 2026-08-10, 1999-12-31, 2026/08/10 (other format), 20260810.'
    },
    hex: {
      pattern: '#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b', flags: { g: true },
      text_pl: 'Kolory: #7c6cf0, #a78bfa, #fff, #GG0011 (bledny), rgb(0,0,0).',
      text_en: 'Colors: #7c6cf0, #a78bfa, #fff, #GG0011 (invalid), rgb(0,0,0).'
    },
    slug: {
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: { g: true, m: true },
      text_pl: 'moj-pierwszy-post\nInny_Slug\nregex-tester\n--zle--\nok-123',
      text_en: 'my-first-post\nInvalid_Slug\nregex-tester\n--bad--\nok-123'
    }
  };
  function loadExample(id) {
    var ex = EXAMPLES[id];
    if (!ex) return;
    state.pattern = ex.pattern;
    state.text = ex['text_' + LANG] || ex.text_pl;
    ALL_FLAGS.forEach(function (f) { state.flags[f] = !!ex.flags[f]; });
    if (!D_SUPPORTED) state.flags.d = false;
    if (patternInput) patternInput.value = state.pattern;
    if (testInput) testInput.value = state.text;
    syncFlagChips();
    notify(t('loaded'));
    runNow();
  }
  function syncFlagChips() {
    document.querySelectorAll('.rx-flag').forEach(function (chip) {
      var f = chip.getAttribute('data-flag');
      if (f === 'd' && !D_SUPPORTED) return;
      chip.setAttribute('aria-pressed', state.flags[f] ? 'true' : 'false');
      chip.classList.toggle('is-on', !!state.flags[f]);
    });
  }
  function bindExamples() {
    document.querySelectorAll('[data-example]').forEach(function (b) {
      b.addEventListener('click', function () { loadExample(b.getAttribute('data-example')); });
    });
  }

  // ============================================
  // EXPORT (JS snippet, matches JSON)
  // ============================================
  // literal-notation body: escape unescaped forward slashes so /.../ stays valid
  function patternLiteralBody() {
    var body = state.pattern.replace(/\\.|\//g, function (m) { return m === '/' ? '\\/' : m; });
    return body === '' ? '(?:)' : body;
  }
  function jsSnippet() {
    return 'const re = /' + patternLiteralBody() + '/' + flagString() + ';';
  }
  function matchesJSON(matches) {
    var arr = matches.map(function (m) {
      var o = { match: m.match, start: m.start, end: m.end };
      if (m.groups && m.groups.length) o.groups = m.groups.map(function (g) { return g.value; });
      if (m.named && m.named.length) {
        o.named = {};
        m.named.forEach(function (g) { o.named[g.name] = g.value; });
      }
      return o;
    });
    return JSON.stringify(arr, null, 2);
  }
  var lastMatches = [];

  function bindExport() {
    var snip = qs('rx-copy-snippet');
    if (snip) snip.addEventListener('click', function () { copyText(jsSnippet(), t('copySnippet')); });
    var jsonBtn = qs('rx-copy-json');
    if (jsonBtn) jsonBtn.addEventListener('click', function () {
      if (!lastMatches.length) { notify(t('nothing')); return; }
      copyText(matchesJSON(lastMatches), t('copyJson'));
    });
    var repCopy = qs('rx-copy-replace');
    if (repCopy) repCopy.addEventListener('click', function () { copyText(replacePreview ? replacePreview.value : '', t('copyReplace')); });
  }

  // keep lastMatches updated by wrapping renderMatchList
  var _renderMatchList = renderMatchList;
  renderMatchList = function (matches) { lastMatches = matches || []; _renderMatchList(matches); };

  // ============================================
  // REPLACE PANEL
  // ============================================
  function bindReplace() {
    if (replaceToggle) {
      replaceToggle.setAttribute('aria-expanded', state.replaceOn ? 'true' : 'false');
      if (replacePanel) replacePanel.hidden = !state.replaceOn;
      replaceToggle.classList.toggle('is-on', state.replaceOn);
      replaceToggle.addEventListener('click', function () {
        state.replaceOn = !state.replaceOn;
        replaceToggle.setAttribute('aria-expanded', state.replaceOn ? 'true' : 'false');
        replaceToggle.classList.toggle('is-on', state.replaceOn);
        if (replacePanel) replacePanel.hidden = !state.replaceOn;
        scheduleRun();
      });
    }
    if (replaceInput) replaceInput.addEventListener('input', function () {
      state.replacement = replaceInput.value; scheduleRun();
    });
  }

  // ============================================
  // BIND CORE INPUTS
  // ============================================
  function bindInputs() {
    if (patternInput) {
      patternInput.addEventListener('input', function () { state.pattern = patternInput.value; scheduleRun(); });
    }
    if (testInput) {
      testInput.addEventListener('input', function () {
        if (testInput.value.length > MAX_TEXT_LEN) {
          testInput.value = testInput.value.slice(0, MAX_TEXT_LEN);
          notify(t('textTooLong') + MAX_TEXT_LEN);
        }
        state.text = testInput.value;
        scheduleRun();
      });
      testInput.addEventListener('scroll', syncScroll);
    }
    var clearBtn = qs('rx-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      state.pattern = ''; state.text = ''; state.replacement = '';
      if (patternInput) patternInput.value = '';
      if (testInput) testInput.value = '';
      if (replaceInput) replaceInput.value = '';
      notify(t('cleared'));
      runNow();
    });
    var copyPattern = qs('rx-copy-pattern');
    if (copyPattern) copyPattern.addEventListener('click', function () {
      copyText('/' + patternLiteralBody() + '/' + flagString());
    });
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    load();
    if (patternInput) patternInput.value = state.pattern;
    if (testInput) testInput.value = state.text;
    if (replaceInput) replaceInput.value = state.replacement;
    bindFlags();
    bindInputs();
    bindReplace();
    bindExamples();
    bindExport();
    runNow();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
