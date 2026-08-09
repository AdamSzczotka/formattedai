// ============================================
// FormattedAI - JSON Formatter (toolkit)
// 4 modes: Format & Tree | Convert | JSONPath | Diff
// 100% client-side. js-yaml (dump/load) + jsonpath-plus (JSONPath) bundled.
// ============================================
import { dump as yamlDump, load as yamlLoad } from 'js-yaml';
import { JSONPath } from 'jsonpath-plus';

(function () {
  'use strict';

  // ---- language + i18n (tool-specific strings) ----
  var LANG = (document.documentElement.lang || 'pl').toLowerCase().indexOf('en') === 0 ? 'en' : 'pl';
  var I18N = {
    pl: {
      valid: 'Poprawny JSON',
      waiting: 'Czeka na dane',
      errAt: 'Błąd w linii {line}, kolumnie {col}',
      errJson: 'Nieprawidłowy JSON',
      errYaml: 'Nieprawidłowy YAML',
      errCsv: 'Nieprawidłowy CSV',
      errPath: 'Nieprawidłowe zapytanie JSONPath',
      errEmpty: 'Wejście jest puste',
      errNotArray: 'CSV wymaga tablicy obiektów (np. [{...}, {...}])',
      errNoMatch: 'Brak dopasowań dla tego zapytania',
      copied: 'Skopiowano do schowka',
      copiedPath: 'Ścieżka skopiowana: ',
      downloaded: 'Plik pobrany',
      nothing: 'Nie ma czego skopiować',
      identical: 'Struktury są identyczne — brak różnic',
      added: 'Dodane',
      removed: 'Usunięte',
      changed: 'Zmienione'
    },
    en: {
      valid: 'Valid JSON',
      waiting: 'Waiting for input',
      errAt: 'Error at line {line}, column {col}',
      errJson: 'Invalid JSON',
      errYaml: 'Invalid YAML',
      errCsv: 'Invalid CSV',
      errPath: 'Invalid JSONPath query',
      errEmpty: 'Input is empty',
      errNotArray: 'CSV needs an array of objects (e.g. [{...}, {...}])',
      errNoMatch: 'No matches for this query',
      copied: 'Copied to clipboard',
      copiedPath: 'Path copied: ',
      downloaded: 'File downloaded',
      nothing: 'Nothing to copy',
      identical: 'Structures are identical — no differences',
      added: 'Added',
      removed: 'Removed',
      changed: 'Changed'
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }
  function fmt(k, obj) {
    return t(k).replace(/\{(\w+)\}/g, function (_, n) { return obj[n] != null ? obj[n] : ''; });
  }

  // ---- pluralization (PL: one/few/many; EN: one/other) ----
  // Grammatically correct noun/adjective forms selected by count category.
  var PLURALS = {
    pl: {
      elements: { one: 'element', few: 'elementy', many: 'elementów' },
      matches: { one: 'dopasowanie', few: 'dopasowania', many: 'dopasowań' },
      diffAdded: { one: 'dodane', few: 'dodane', many: 'dodanych' },
      diffRemoved: { one: 'usunięte', few: 'usunięte', many: 'usuniętych' },
      diffChanged: { one: 'zmienione', few: 'zmienione', many: 'zmienionych' }
    },
    en: {
      elements: { one: 'element', other: 'elements' },
      matches: { one: 'match', other: 'matches' },
      diffAdded: { one: 'added', other: 'added' },
      diffRemoved: { one: 'removed', other: 'removed' },
      diffChanged: { one: 'changed', other: 'changed' }
    }
  };
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
  // Returns just the inflected word for `key` at count `n`.
  function pluralWord(key, n) {
    var forms = (PLURALS[LANG] && PLURALS[LANG][key]) || {};
    var cat = pluralCategory(n);
    return forms[cat] || forms.other || forms.many || forms.one || '';
  }
  // Returns "<n> <word>" — e.g. "1 element", "5 elementów", "2 dopasowania".
  function plural(key, n) {
    return n + ' ' + pluralWord(key, n);
  }

  // ---- small helpers ----
  function qs(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;';
    });
  }
  function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

  var toast = qs('jf-toast');
  var toastTimer = null;
  function notify(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-show'); }, 2400);
  }

  function copyText(text) {
    if (!text) { notify(t('nothing')); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { notify(t('copied')); }, function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'absolute'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      notify(t('copied'));
    } catch (e) { /* ignore */ }
  }
  function downloadFile(text, filename, mime) {
    try {
      var blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      notify(t('downloaded'));
    } catch (e) { /* ignore */ }
  }

  // ---- JSON parsing with line/col diagnostics ----
  function posToLineCol(str, pos) {
    var line = 1, col = 1;
    var end = Math.min(pos, str.length);
    for (var i = 0; i < end; i++) {
      if (str.charCodeAt(i) === 10) { line++; col = 1; } else { col++; }
    }
    return { line: line, col: col };
  }
  function parseJSON(str) {
    try {
      return { ok: true, value: JSON.parse(str) };
    } catch (e) {
      var msg = e && e.message ? e.message : String(e);
      var loc = null;
      var m = /position (\d+)/.exec(msg);
      if (m) {
        loc = posToLineCol(str, parseInt(m[1], 10));
      } else {
        var lm = /line (\d+) column (\d+)/i.exec(msg);
        if (lm) loc = { line: parseInt(lm[1], 10), col: parseInt(lm[2], 10) };
      }
      return { ok: false, error: msg, loc: loc };
    }
  }

  // ---- deep key sorting ----
  function sortDeep(value) {
    if (Array.isArray(value)) return value.map(sortDeep);
    if (isPlainObject(value)) {
      var out = {};
      Object.keys(value).sort().forEach(function (k) { out[k] = sortDeep(value[k]); });
      return out;
    }
    return value;
  }

  // ---- syntax highlighting for the text view (input already escaped) ----
  function highlightJSON(jsonStr) {
    var escaped = esc(jsonStr);
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = 'jf-num';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'jf-tok-key' : 'jf-tok-str';
        } else if (/true|false/.test(match)) {
          cls = 'jf-tok-bool';
        } else if (/null/.test(match)) {
          cls = 'jf-tok-null';
        } else {
          cls = 'jf-tok-num';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  // ============================================
  // MODE 1: FORMAT & TREE
  // ============================================
  var fInput = qs('jf-input');
  var fValidation = qs('jf-validation');
  var fValidationText = qs('jf-validation-text');
  var fIndent = qs('jf-indent');
  var fSort = qs('jf-sort');
  var fOutputText = qs('jf-output-text');
  var fOutputTree = qs('jf-output-tree');
  var fTreeCount = qs('jf-tree-count');
  var fTreeSearch = qs('jf-tree-search');
  var currentView = 'text';
  var lastValue = undefined;
  var lastValid = false;

  function indentUnit() {
    var v = fIndent ? fIndent.value : '2';
    if (v === 'tab') return '\t';
    return parseInt(v, 10) || 2;
  }

  function validateLive() {
    if (!fInput) return;
    var raw = fInput.value;
    if (!raw.trim()) {
      lastValid = false; lastValue = undefined;
      setValidation('neutral', t('waiting'));
      return;
    }
    var res = parseJSON(raw);
    if (res.ok) {
      lastValid = true; lastValue = res.value;
      setValidation('ok', t('valid'));
    } else {
      lastValid = false; lastValue = undefined;
      setValidation('err', res.loc ? t('errJson') + ' · ' + fmt('errAt', res.loc) : t('errJson'));
    }
  }
  function setValidation(state, text) {
    if (!fValidation) return;
    fValidation.setAttribute('data-state', state);
    if (fValidationText) fValidationText.textContent = text;
  }

  function renderTextView(value) {
    if (!fOutputText) return;
    var indent = indentUnit();
    var src = fSort && fSort.checked ? sortDeep(value) : value;
    var str = JSON.stringify(src, null, indent);
    fOutputText.classList.remove('jf-output--empty');
    if (str.length > 200000) {
      // Skip highlighting for very large output to stay responsive.
      fOutputText.textContent = str;
    } else {
      fOutputText.innerHTML = highlightJSON(str);
    }
  }

  function keyPath(parentPath, key, isIndex) {
    if (isIndex) return parentPath + '[' + key + ']';
    if (/^[A-Za-z_$][\w$]*$/.test(key)) return parentPath + '.' + key;
    return parentPath + "['" + String(key).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "']";
  }
  function countElements(v) {
    if (Array.isArray(v)) {
      var c = v.length;
      for (var i = 0; i < v.length; i++) c += countElements(v[i]);
      return c;
    }
    if (isPlainObject(v)) {
      var keys = Object.keys(v), n = keys.length;
      for (var j = 0; j < keys.length; j++) n += countElements(v[keys[j]]);
      return n;
    }
    return 0;
  }
  function typeOf(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v; // object, string, number, boolean
  }

  // Build one tree node. Returns element or null (when filtered out).
  function buildNode(keyLabel, value, path, isIndex, opts) {
    var q = opts.query;
    var type = typeOf(value);
    var isContainer = type === 'object' || type === 'array';
    var selfMatch = !!(q && keyLabel != null && String(keyLabel).toLowerCase().indexOf(q) !== -1);

    var node = document.createElement('div');
    node.className = 'jf-node' + (isContainer ? '' : ' jf-node--leaf');

    var row = document.createElement('div');
    row.className = 'jf-node__row';

    if (isContainer) {
      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'jf-node__toggle';
      toggle.setAttribute('aria-expanded', 'true');
      toggle.addEventListener('click', function () {
        var collapsed = node.classList.toggle('is-collapsed');
        toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
      row.appendChild(toggle);
    } else {
      var spacer = document.createElement('span');
      spacer.className = 'jf-node__spacer';
      row.appendChild(spacer);
    }

    if (keyLabel != null) {
      var keyEl = document.createElement('span');
      keyEl.className = 'jf-node__key' + (selfMatch ? ' is-match' : '');
      keyEl.textContent = isIndex ? String(keyLabel) : '"' + keyLabel + '"';
      row.appendChild(keyEl);
      var colon = document.createElement('span');
      colon.className = 'jf-node__punct';
      colon.textContent = ':';
      row.appendChild(colon);
    }

    var children = null;
    var visibleChild = false;

    if (isContainer) {
      var entries = [];
      if (type === 'array') {
        for (var ai = 0; ai < value.length; ai++) entries.push({ k: ai, v: value[ai], idx: true });
      } else {
        var keys = Object.keys(value);
        if (opts.sort) keys.sort();
        for (var ki = 0; ki < keys.length; ki++) entries.push({ k: keys[ki], v: value[keys[ki]], idx: false });
      }

      var open = type === 'array' ? '[' : '{';
      var close = type === 'array' ? ']' : '}';

      var openTok = document.createElement('span');
      openTok.className = 'jf-node__punct';
      openTok.textContent = open;
      row.appendChild(openTok);

      var preview = document.createElement('span');
      preview.className = 'jf-node__preview';
      preview.textContent = ' ' + entries.length + ' ' + (type === 'array' ? '' : '') + '… ' + close;
      row.appendChild(preview);

      children = document.createElement('div');
      children.className = 'jf-node__children';

      for (var e = 0; e < entries.length; e++) {
        var childPath = keyPath(path, entries[e].k, entries[e].idx);
        var childEl = buildNode(entries[e].k, entries[e].v, childPath, entries[e].idx, opts);
        if (childEl) { children.appendChild(childEl); visibleChild = true; }
      }

      var closeRow = document.createElement('div');
      closeRow.className = 'jf-node__close';
      closeRow.textContent = close;
      children.appendChild(closeRow);
    } else {
      var valEl = document.createElement('span');
      valEl.className = 'jf-node__val jf-val-' + type;
      valEl.textContent = type === 'string' ? '"' + value + '"' : String(value);
      row.appendChild(valEl);
    }

    // Copy-path button
    var pathBtn = document.createElement('button');
    pathBtn.type = 'button';
    pathBtn.className = 'jf-node__path';
    pathBtn.title = path;
    pathBtn.textContent = path;
    pathBtn.addEventListener('click', function () {
      copyText(path);
    });
    row.appendChild(pathBtn);

    node.appendChild(row);
    if (children) node.appendChild(children);

    // filtering: keep node if self matches, a descendant matches, or no query
    if (q) {
      if (!selfMatch && !(isContainer && visibleChild)) return null;
      if (isContainer && visibleChild) {
        // auto-expand branches that contain matches
        node.classList.remove('is-collapsed');
      }
    }
    return node;
  }

  function renderTreeView(value) {
    if (!fOutputTree) return;
    fOutputTree.innerHTML = '';
    var opts = {
      sort: !!(fSort && fSort.checked),
      query: fTreeSearch && fTreeSearch.value ? fTreeSearch.value.trim().toLowerCase() : ''
    };
    var rootPath = '$';
    var rootEl;
    if (typeOf(value) === 'object' || typeOf(value) === 'array') {
      rootEl = buildNode(null, value, rootPath, false, opts);
    } else {
      // primitive root
      rootEl = buildNode(null, value, rootPath, false, opts);
    }
    if (rootEl) fOutputTree.appendChild(rootEl);
    if (fTreeCount) fTreeCount.textContent = plural('elements', countElements(value));
  }

  function renderOutput() {
    if (!lastValid || lastValue === undefined) return;
    if (currentView === 'text') renderTextView(lastValue);
    else renderTreeView(lastValue);
  }

  function clearFormatOutput() {
    if (fOutputText) fOutputText.innerHTML = '';
    if (fOutputTree) fOutputTree.innerHTML = '';
    if (fTreeCount) fTreeCount.textContent = '';
  }
  function doFormat() {
    validateLive();
    if (!lastValid) { clearFormatOutput(); return; }
    renderOutput();
  }
  function doMinify() {
    validateLive();
    if (!lastValid) { clearFormatOutput(); return; }
    var src = fSort && fSort.checked ? sortDeep(lastValue) : lastValue;
    var str = JSON.stringify(src);
    if (currentView !== 'text') switchView('text');
    if (fOutputText) {
      if (str.length > 200000) fOutputText.textContent = str;
      else fOutputText.innerHTML = highlightJSON(str);
    }
  }

  function switchView(view) {
    currentView = view;
    var textBtn = qs('jf-view-text');
    var treeBtn = qs('jf-view-tree');
    if (textBtn) { textBtn.classList.toggle('is-active', view === 'text'); textBtn.setAttribute('aria-checked', view === 'text'); }
    if (treeBtn) { treeBtn.classList.toggle('is-active', view === 'tree'); treeBtn.setAttribute('aria-checked', view === 'tree'); }
    if (fOutputText) fOutputText.hidden = view !== 'text';
    var treeWrap = qs('jf-output-tree-wrap');
    if (treeWrap) treeWrap.hidden = view !== 'tree';
    renderOutput();
  }

  function bindFormat() {
    if (fInput) fInput.addEventListener('input', function () {
      validateLive();
    });
    var formatBtn = qs('jf-format-btn');
    if (formatBtn) formatBtn.addEventListener('click', doFormat);
    var minifyBtn = qs('jf-minify-btn');
    if (minifyBtn) minifyBtn.addEventListener('click', doMinify);
    if (fSort) fSort.addEventListener('change', function () { if (lastValid) renderOutput(); });
    if (fIndent) fIndent.addEventListener('change', function () { if (lastValid && currentView === 'text') renderTextView(lastValue); });

    var textBtn = qs('jf-view-text');
    var treeBtn = qs('jf-view-tree');
    if (textBtn) textBtn.addEventListener('click', function () { switchView('text'); });
    if (treeBtn) treeBtn.addEventListener('click', function () { switchView('tree'); });

    if (fTreeSearch) fTreeSearch.addEventListener('input', function () {
      if (lastValid && currentView === 'tree') renderTreeView(lastValue);
    });

    var expandAll = qs('jf-expand-all');
    if (expandAll) expandAll.addEventListener('click', function () {
      if (!fOutputTree) return;
      fOutputTree.querySelectorAll('.jf-node.is-collapsed').forEach(function (n) {
        n.classList.remove('is-collapsed');
        var tg = n.querySelector(':scope > .jf-node__row > .jf-node__toggle');
        if (tg) tg.setAttribute('aria-expanded', 'true');
      });
    });
    var collapseAll = qs('jf-collapse-all');
    if (collapseAll) collapseAll.addEventListener('click', function () {
      if (!fOutputTree) return;
      // collapse every container except the root
      var nodes = fOutputTree.querySelectorAll('.jf-node');
      nodes.forEach(function (n, i) {
        if (i === 0) return;
        var tg = n.querySelector(':scope > .jf-node__row > .jf-node__toggle');
        if (tg) { n.classList.add('is-collapsed'); tg.setAttribute('aria-expanded', 'false'); }
      });
    });

    var copyBtn = qs('jf-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      if (!lastValid) { notify(t('nothing')); return; }
      var src = fSort && fSort.checked ? sortDeep(lastValue) : lastValue;
      copyText(JSON.stringify(src, null, indentUnit()));
    });
    var dlBtn = qs('jf-download');
    if (dlBtn) dlBtn.addEventListener('click', function () {
      if (!lastValid) { notify(t('nothing')); return; }
      var src = fSort && fSort.checked ? sortDeep(lastValue) : lastValue;
      downloadFile(JSON.stringify(src, null, indentUnit()), 'formatted.json', 'application/json;charset=utf-8');
    });
    var clearBtn = qs('jf-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (fInput) fInput.value = '';
      lastValid = false; lastValue = undefined;
      if (fOutputText) { fOutputText.innerHTML = ''; }
      if (fOutputTree) fOutputTree.innerHTML = '';
      if (fTreeCount) fTreeCount.textContent = '';
      setValidation('neutral', t('waiting'));
      if (fInput) fInput.focus();
    });

    // format examples
    document.querySelectorAll('#jf-mode-format [data-example]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-example');
        if (fInput && FORMAT_EXAMPLES[k]) {
          fInput.value = FORMAT_EXAMPLES[k];
          validateLive();
          if (lastValid) { doFormat(); }
          fInput.focus();
        }
      });
    });

    validateLive();
    switchView('text');
  }

  var FORMAT_EXAMPLES = {
    object: '{"name":"FormattedAI","version":2.9,"tools":["formatter","avif","json"],"free":true,"meta":{"lang":["pl","en"],"backend":null}}',
    array: '[{"id":1,"title":"Alpha","done":false},{"id":2,"title":"Beta","done":true},{"id":3,"title":"Gamma","done":false}]',
    messy: '{ "a":1,   "nested":{ "deep":{ "value":  [1,2,   3] }},"b":"tekst z \\"cudzysłowami\\"","c":null }'
  };

  // ============================================
  // MODE 2: CONVERT (JSON<->YAML, JSON<->CSV)
  // ============================================
  var convDir = 'json-yaml';
  var cInput = qs('jf-conv-input');
  var cOutput = qs('jf-conv-output');
  var cError = qs('jf-conv-error');

  function convError(msg) {
    if (!cError) return;
    cError.textContent = msg;
    cError.hidden = !msg;
  }

  // ---- CSV (RFC 4180) ----
  function parseCSV(text) {
    var rows = [], row = [], field = '', inQ = false, i = 0, n = text.length;
    while (i < n) {
      var c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        field += c; i++; continue;
      } else {
        if (c === '"') { inQ = true; i++; continue; }
        if (c === ',') { row.push(field); field = ''; i++; continue; }
        if (c === '\r') { i++; continue; }
        if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
        field += c; i++; continue;
      }
    }
    row.push(field); rows.push(row);
    if (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows.pop();
    return rows;
  }
  function coerceCSV(s) {
    if (s === '') return '';
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null') return null;
    if (s.length > 1 && s[0] === '0' && s[1] !== '.') return s; // keep leading-zero strings
    if (/^-?\d+(\.\d+)?([eE][+\-]?\d+)?$/.test(s)) {
      var num = Number(s);
      if (Number.isFinite(num)) return num;
    }
    return s;
  }
  function csvField(v) {
    var s;
    if (v == null) s = '';
    else if (typeof v === 'object') s = JSON.stringify(v);
    else s = String(v);
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function jsonToCSV(arr) {
    if (!Array.isArray(arr)) throw new Error(t('errNotArray'));
    var keys = [];
    var hasObjects = false;
    arr.forEach(function (o) {
      if (isPlainObject(o)) {
        hasObjects = true;
        Object.keys(o).forEach(function (k) { if (keys.indexOf(k) === -1) keys.push(k); });
      }
    });
    if (!hasObjects) {
      // array of scalars -> single "value" column
      var lines2 = ['value'];
      arr.forEach(function (v) { lines2.push(csvField(v)); });
      return lines2.join('\r\n');
    }
    var lines = [keys.map(csvField).join(',')];
    arr.forEach(function (o) {
      lines.push(keys.map(function (k) { return csvField(isPlainObject(o) ? o[k] : ''); }).join(','));
    });
    return lines.join('\r\n');
  }
  function csvToJSON(text) {
    var rows = parseCSV(text);
    if (!rows.length) return [];
    var header = rows[0];
    var out = [];
    for (var r = 1; r < rows.length; r++) {
      var obj = {};
      for (var c = 0; c < header.length; c++) {
        obj[header[c]] = coerceCSV(rows[r][c] != null ? rows[r][c] : '');
      }
      out.push(obj);
    }
    return out;
  }

  function doConvert() {
    convError('');
    if (!cInput) return;
    var raw = cInput.value;
    if (!raw.trim()) { convError(t('errEmpty')); if (cOutput) cOutput.value = ''; return; }
    try {
      var result = '';
      if (convDir === 'json-yaml') {
        var pj = parseJSON(raw);
        if (!pj.ok) { convError(t('errJson') + (pj.loc ? ' · ' + fmt('errAt', pj.loc) : '')); if (cOutput) cOutput.value = ''; return; }
        result = yamlDump(pj.value, { indent: 2, lineWidth: -1, noRefs: true });
      } else if (convDir === 'yaml-json') {
        var y = yamlLoad(raw);
        result = JSON.stringify(y, null, indentUnit());
      } else if (convDir === 'json-csv') {
        var pj2 = parseJSON(raw);
        if (!pj2.ok) { convError(t('errJson') + (pj2.loc ? ' · ' + fmt('errAt', pj2.loc) : '')); if (cOutput) cOutput.value = ''; return; }
        result = jsonToCSV(pj2.value);
      } else if (convDir === 'csv-json') {
        result = JSON.stringify(csvToJSON(raw), null, indentUnit());
      }
      if (cOutput) cOutput.value = result;
    } catch (e) {
      var m = e && e.message ? e.message : String(e);
      var label = convDir === 'yaml-json' ? t('errYaml') : (convDir === 'csv-json' ? t('errCsv') : t('errJson'));
      convError(label + ' · ' + m);
      if (cOutput) cOutput.value = '';
    }
  }

  function convFilename() {
    if (convDir === 'json-yaml') return 'converted.yaml';
    if (convDir === 'json-csv') return 'converted.csv';
    return 'converted.json';
  }
  function convMime() {
    if (convDir === 'json-yaml') return 'text/yaml;charset=utf-8';
    if (convDir === 'json-csv') return 'text/csv;charset=utf-8';
    return 'application/json;charset=utf-8';
  }

  function setConvPlaceholder() {
    if (!cInput) return;
    var ph = {
      'json-yaml': '{ "key": "value" }',
      'yaml-json': 'key: value\nlist:\n  - one\n  - two',
      'json-csv': '[{"id":1,"name":"Ada"},{"id":2,"name":"Linus"}]',
      'csv-json': 'id,name\n1,Ada\n2,Linus'
    };
    cInput.placeholder = ph[convDir] || '';
  }

  function bindConvert() {
    document.querySelectorAll('#jf-mode-convert [data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        convDir = b.getAttribute('data-dir');
        document.querySelectorAll('#jf-mode-convert [data-dir]').forEach(function (x) {
          var active = x === b;
          x.classList.toggle('is-active', active);
          x.setAttribute('aria-checked', active);
        });
        convError('');
        setConvPlaceholder();
      });
    });
    var convBtn = qs('jf-conv-btn');
    if (convBtn) convBtn.addEventListener('click', doConvert);
    var copyBtn = qs('jf-conv-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyText(cOutput ? cOutput.value : ''); });
    var dlBtn = qs('jf-conv-download');
    if (dlBtn) dlBtn.addEventListener('click', function () {
      if (!cOutput || !cOutput.value) { notify(t('nothing')); return; }
      downloadFile(cOutput.value, convFilename(), convMime());
    });
    var clearBtn = qs('jf-conv-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (cInput) cInput.value = '';
      if (cOutput) cOutput.value = '';
      convError('');
      if (cInput) cInput.focus();
    });
    setConvPlaceholder();
  }

  // ============================================
  // MODE 3: JSONPATH
  // ============================================
  var jpInput = qs('jf-jp-input');
  var jpQuery = qs('jf-jp-query');
  var jpOutput = qs('jf-jp-output');
  var jpError = qs('jf-jp-error');
  var jpCount = qs('jf-jp-count');

  var JP_SAMPLE = {
    store: {
      book: [
        { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
        { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', isbn: '0-553-21311-3', price: 8.99 }
      ],
      bicycle: { color: 'red', price: 19.95 }
    }
  };

  function jpErrorMsg(msg) {
    if (!jpError) return;
    jpError.textContent = msg;
    jpError.hidden = !msg;
  }
  // Lightweight syntax pre-check: jsonpath-plus is lenient and returns [] for
  // malformed queries (e.g. "$[[[bad") instead of throwing, which would surface
  // as "no matches". We only flag unambiguously broken structure — unbalanced
  // brackets/parens or an unterminated string — so valid queries never trip it.
  // Brackets/parens inside quoted key names (e.g. $['a[b']) are ignored.
  function jsonPathMalformed(path) {
    var sq = 0, paren = 0, inS = false, inD = false;
    for (var i = 0; i < path.length; i++) {
      var ch = path[i];
      if (inS) { if (ch === '\\') { i++; } else if (ch === "'") { inS = false; } continue; }
      if (inD) { if (ch === '\\') { i++; } else if (ch === '"') { inD = false; } continue; }
      if (ch === "'") { inS = true; }
      else if (ch === '"') { inD = true; }
      else if (ch === '[') { sq++; }
      else if (ch === ']') { if (--sq < 0) return true; }
      else if (ch === '(') { paren++; }
      else if (ch === ')') { if (--paren < 0) return true; }
    }
    return sq !== 0 || paren !== 0 || inS || inD;
  }
  function runJSONPath() {
    jpErrorMsg('');
    if (jpCount) jpCount.textContent = '';
    if (!jpInput || !jpQuery) return;
    var raw = jpInput.value;
    if (!raw.trim()) { jpErrorMsg(t('errEmpty')); if (jpOutput) jpOutput.value = ''; return; }
    var pj = parseJSON(raw);
    if (!pj.ok) { jpErrorMsg(t('errJson') + (pj.loc ? ' · ' + fmt('errAt', pj.loc) : '')); if (jpOutput) jpOutput.value = ''; return; }
    var path = jpQuery.value.trim();
    if (!path) { jpErrorMsg(t('errPath')); if (jpOutput) jpOutput.value = ''; return; }
    if (jsonPathMalformed(path)) { jpErrorMsg(t('errPath')); if (jpOutput) jpOutput.value = ''; if (jpCount) jpCount.textContent = ''; return; }
    try {
      var result = JSONPath({ path: path, json: pj.value, wrap: true });
      if (jpOutput) jpOutput.value = JSON.stringify(result, null, 2);
      if (jpCount) jpCount.textContent = plural('matches', Array.isArray(result) ? result.length : 0);
      if (Array.isArray(result) && result.length === 0) jpErrorMsg(t('errNoMatch'));
    } catch (e) {
      jpErrorMsg(t('errPath') + ' · ' + (e && e.message ? e.message : String(e)));
      if (jpOutput) jpOutput.value = '';
    }
  }
  function bindJSONPath() {
    if (jpInput && !jpInput.value.trim()) jpInput.value = JSON.stringify(JP_SAMPLE, null, 2);
    if (jpQuery && !jpQuery.value.trim()) jpQuery.value = '$.store.book[*].title';
    document.querySelectorAll('#jf-mode-jsonpath [data-path]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (jpQuery) { jpQuery.value = chip.getAttribute('data-path'); runJSONPath(); }
      });
    });
    var runBtn = qs('jf-jp-run');
    if (runBtn) runBtn.addEventListener('click', runJSONPath);
    if (jpQuery) jpQuery.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); runJSONPath(); }
    });
    var copyBtn = qs('jf-jp-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyText(jpOutput ? jpOutput.value : ''); });
    var clearBtn = qs('jf-jp-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (jpInput) jpInput.value = '';
      if (jpQuery) jpQuery.value = '';
      if (jpOutput) jpOutput.value = '';
      jpErrorMsg('');
      if (jpCount) jpCount.textContent = '';
    });
  }

  // ============================================
  // MODE 4: DIFF
  // ============================================
  var dA = qs('jf-diff-a');
  var dB = qs('jf-diff-b');
  var dOutput = qs('jf-diff-output');
  var dError = qs('jf-diff-error');
  var dSummary = qs('jf-diff-summary');

  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (isPlainObject(a) && isPlainObject(b)) {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (var j = 0; j < ka.length; j++) {
        if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
        if (!deepEqual(a[ka[j]], b[ka[j]])) return false;
      }
      return true;
    }
    return false;
  }
  function diffRec(a, b, path, out) {
    if (Array.isArray(a) && Array.isArray(b)) {
      var len = Math.max(a.length, b.length);
      for (var i = 0; i < len; i++) {
        var pi = path + '[' + i + ']';
        if (i >= a.length) out.push({ type: 'added', path: pi, val: b[i] });
        else if (i >= b.length) out.push({ type: 'removed', path: pi, val: a[i] });
        else diffRec(a[i], b[i], pi, out);
      }
    } else if (isPlainObject(a) && isPlainObject(b)) {
      var seen = {};
      Object.keys(a).forEach(function (k) {
        seen[k] = true;
        var pk = keyPath(path, k, false);
        if (!Object.prototype.hasOwnProperty.call(b, k)) out.push({ type: 'removed', path: pk, val: a[k] });
        else diffRec(a[k], b[k], pk, out);
      });
      Object.keys(b).forEach(function (k) {
        if (seen[k]) return;
        out.push({ type: 'added', path: keyPath(path, k, false), val: b[k] });
      });
    } else {
      if (!deepEqual(a, b)) out.push({ type: 'changed', path: path, old: a, val: b });
    }
  }

  function renderDiff(list) {
    if (!dOutput) return;
    dOutput.innerHTML = '';
    if (!list.length) {
      var ok = document.createElement('div');
      ok.className = 'jf-diff__empty';
      ok.textContent = t('identical');
      dOutput.appendChild(ok);
      if (dSummary) dSummary.textContent = '';
      return;
    }
    var counts = { added: 0, removed: 0, changed: 0 };
    list.forEach(function (d) {
      counts[d.type]++;
      var rowEl = document.createElement('div');
      rowEl.className = 'jf-diff__row jf-diff__row--' + d.type;

      var badge = document.createElement('span');
      badge.className = 'jf-diff__badge';
      badge.textContent = d.type === 'added' ? '+' : d.type === 'removed' ? '−' : '~';
      rowEl.appendChild(badge);

      var pathEl = document.createElement('span');
      pathEl.className = 'jf-diff__path';
      pathEl.textContent = d.path;
      rowEl.appendChild(pathEl);

      var valEl = document.createElement('span');
      valEl.className = 'jf-diff__val';
      if (d.type === 'changed') {
        valEl.innerHTML = '<span class="jf-diff__old">' + esc(JSON.stringify(d.old)) + '</span>' +
          '<span class="jf-diff__arrow"> → </span>' +
          '<span class="jf-diff__new">' + esc(JSON.stringify(d.val)) + '</span>';
      } else {
        valEl.textContent = JSON.stringify(d.val);
      }
      rowEl.appendChild(valEl);
      dOutput.appendChild(rowEl);
    });
    if (dSummary) {
      dSummary.textContent =
        plural('diffAdded', counts.added) + ' · ' +
        plural('diffRemoved', counts.removed) + ' · ' +
        plural('diffChanged', counts.changed);
    }
  }

  function doDiff() {
    if (dError) { dError.textContent = ''; dError.hidden = true; }
    if (dSummary) dSummary.textContent = '';
    if (!dA || !dB) return;
    if (!dA.value.trim() || !dB.value.trim()) {
      if (dOutput) dOutput.innerHTML = '';
      if (dError) { dError.textContent = t('errEmpty'); dError.hidden = false; }
      return;
    }
    var pa = parseJSON(dA.value);
    var pb = parseJSON(dB.value);
    if (!pa.ok || !pb.ok) {
      var which = !pa.ok ? 'A' : 'B';
      var res = !pa.ok ? pa : pb;
      if (dOutput) dOutput.innerHTML = '';
      if (dError) {
        dError.textContent = which + ': ' + t('errJson') + (res.loc ? ' · ' + fmt('errAt', res.loc) : '');
        dError.hidden = false;
      }
      return;
    }
    var out = [];
    diffRec(pa.value, pb.value, '$', out);
    renderDiff(out);
  }
  function bindDiff() {
    var btn = qs('jf-diff-btn');
    if (btn) btn.addEventListener('click', doDiff);
    var clearBtn = qs('jf-diff-clear');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      if (dA) dA.value = '';
      if (dB) dB.value = '';
      if (dOutput) dOutput.innerHTML = '';
      if (dSummary) dSummary.textContent = '';
      if (dError) { dError.textContent = ''; dError.hidden = true; }
    });
  }

  // ============================================
  // MODE SWITCHER
  // ============================================
  function bindModeSwitcher() {
    var buttons = document.querySelectorAll('.jf-modebar [data-mode]');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var mode = b.getAttribute('data-mode');
        buttons.forEach(function (x) {
          var active = x === b;
          x.classList.toggle('is-active', active);
          x.setAttribute('aria-checked', active);
        });
        document.querySelectorAll('.jf-mode').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-mode') !== mode;
        });
      });
    });
  }

  // ---- init ----
  function init() {
    bindModeSwitcher();
    bindFormat();
    bindConvert();
    bindJSONPath();
    bindDiff();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
