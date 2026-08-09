// ============================================
// FormattedAI - Color Palette
// 3 modes: Harmonie (harmonies) | Skala (scale) | Kontrast (WCAG)
// 100% client-side, no dependencies, no network.
// ============================================
(function () {
  'use strict';

  // ---- language + i18n ----
  var LANG = (document.documentElement.lang || 'pl').toLowerCase().indexOf('en') === 0 ? 'en' : 'pl';
  var I18N = {
    pl: {
      copied: 'Skopiowano do schowka',
      copiedHex: 'Skopiowano: ',
      downloaded: 'Plik pobrany',
      nothing: 'Nie ma czego skopiować',
      locked: 'Próbka zablokowana',
      unlocked: 'Próbka odblokowana',
      lockAria: 'Zablokuj próbkę',
      unlockAria: 'Odblokuj próbkę',
      copyHexAria: 'Kopiuj kolor HEX',
      badHex: 'Nieprawidłowy HEX',
      badRgb: 'Nieprawidłowy RGB',
      badHsl: 'Nieprawidłowy HSL',
      importEmpty: 'Wklej listę kolorów HEX',
      importNone: 'Nie znaleziono żadnego koloru HEX',
      imported: 'Zaimportowano paletę',
      pngSaved: 'Pobrano PNG',
      svgSaved: 'Pobrano SVG',
      eyedropErr: 'Nie udało się pobrać koloru',
      bestBlack: 'Najlepszy tekst: czarny',
      bestWhite: 'Najlepszy tekst: biały',
      fixDarker: 'Sugestia: przyciemnij tekst do ',
      fixLighter: 'Sugestia: rozjaśnij tekst do ',
      fixOk: 'Kontrast spełnia AA dla zwykłego tekstu',
      fixImposs: 'Zmień kolor tła — nie da się osiągnąć AA samą korektą tekstu',
      pass: 'ZAL.',
      fail: 'NIE',
      sampleText: 'Przykładowy tekst Aa 123',
      on: 'na',
      paletteAria: 'Paleta',
      scaleAria: 'Skala odcieni'
    },
    en: {
      copied: 'Copied to clipboard',
      copiedHex: 'Copied: ',
      downloaded: 'File downloaded',
      nothing: 'Nothing to copy',
      locked: 'Swatch locked',
      unlocked: 'Swatch unlocked',
      lockAria: 'Lock swatch',
      unlockAria: 'Unlock swatch',
      copyHexAria: 'Copy HEX color',
      badHex: 'Invalid HEX',
      badRgb: 'Invalid RGB',
      badHsl: 'Invalid HSL',
      importEmpty: 'Paste a list of HEX colors',
      importNone: 'No HEX color found',
      imported: 'Palette imported',
      pngSaved: 'PNG downloaded',
      svgSaved: 'SVG downloaded',
      eyedropErr: 'Could not pick color',
      bestBlack: 'Best text: black',
      bestWhite: 'Best text: white',
      fixDarker: 'Suggestion: darken text to ',
      fixLighter: 'Suggestion: lighten text to ',
      fixOk: 'Contrast passes AA for normal text',
      fixImposs: 'Change the background — AA is unreachable by adjusting the text alone',
      pass: 'PASS',
      fail: 'FAIL',
      sampleText: 'Sample text Aa 123',
      on: 'on',
      paletteAria: 'Palette',
      scaleAria: 'Shade scale'
    }
  };
  function t(k) { return (I18N[LANG] && I18N[LANG][k]) || k; }

  // ---- pluralization (PL: one/few/many; EN: one/other) ----
  var PLURALS = {
    pl: {
      colors: { one: 'kolor', few: 'kolory', many: 'kolorów' },
      swatches: { one: 'próbka', few: 'próbki', many: 'próbek' },
      steps: { one: 'stopień', few: 'stopnie', many: 'stopni' }
    },
    en: {
      colors: { one: 'color', other: 'colors' },
      swatches: { one: 'swatch', other: 'swatches' },
      steps: { one: 'step', other: 'steps' }
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
  function pluralWord(key, n) {
    var forms = (PLURALS[LANG] && PLURALS[LANG][key]) || {};
    return forms[pluralCategory(n)] || forms.other || forms.many || forms.one || '';
  }
  function plural(key, n) { return n + ' ' + pluralWord(key, n); }

  // ---- helpers ----
  function qs(id) { return document.getElementById(id); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function mod(n, m) { return ((n % m) + m) % m; }
  function round(v) { return Math.round(v); }

  var toast = qs('cp-toast');
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
  function downloadFile(data, filename, mime) {
    try {
      var blob = new Blob([data], { type: mime || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { /* ignore */ }
  }

  // ============================================
  // COLOR MATH (hex <-> rgb <-> hsl, luminance, contrast)
  // ============================================
  function hexToRgb(hex) {
    if (typeof hex !== 'string') return null;
    var h = hex.trim().replace(/^#/, '');
    if (/^[0-9a-fA-F]{3}$/.test(h)) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  function chan(v) { var s = clamp(round(v), 0, 255).toString(16); return s.length === 1 ? '0' + s : s; }
  function rgbToHex(rgb) { return '#' + chan(rgb.r) + chan(rgb.g) + chan(rgb.b); }
  function roundRgb(rgb) { return { r: clamp(round(rgb.r), 0, 255), g: clamp(round(rgb.g), 0, 255), b: clamp(round(rgb.b), 0, 255) }; }
  // hex length is "complete" (ready to validate) at 3 or 6 hex digits (# optional)
  function hexLenComplete(v) { var h = String(v).trim().replace(/^#/, ''); return h.length === 3 || h.length === 6; }
  function rgbToHsl(rgb) {
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    var d = max - min;
    if (d !== 0) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: mod(h, 360), s: s * 100, l: l * 100 };
  }
  function hslToRgb(hsl) {
    var h = mod(hsl.h, 360) / 360, s = clamp(hsl.s, 0, 100) / 100, l = clamp(hsl.l, 0, 100) / 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue2rgb = function (p, q, tt) {
        if (tt < 0) tt += 1;
        if (tt > 1) tt -= 1;
        if (tt < 1 / 6) return p + (q - p) * 6 * tt;
        if (tt < 1 / 2) return q;
        if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
  }
  function hslToHex(hsl) { return rgbToHex(hslToRgb(hsl)); }
  function hexToHsl(hex) { var rgb = hexToRgb(hex); return rgb ? rgbToHsl(rgb) : null; }
  function normHsl(hsl) { return { h: mod(round(hsl.h), 360), s: clamp(round(hsl.s), 0, 100), l: clamp(round(hsl.l), 0, 100) }; }

  function rgbStr(rgb) { return round(rgb.r) + ', ' + round(rgb.g) + ', ' + round(rgb.b); }
  function hslStr(hsl) { return round(hsl.h) + ', ' + round(hsl.s) + '%, ' + round(hsl.l) + '%'; }

  // WCAG relative luminance + contrast
  function srgbToLin(c) {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  function relLuminance(rgb) {
    return 0.2126 * srgbToLin(rgb.r) + 0.7152 * srgbToLin(rgb.g) + 0.0722 * srgbToLin(rgb.b);
  }
  function contrastRatio(rgbA, rgbB) {
    var la = relLuminance(rgbA), lb = relLuminance(rgbB);
    var hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }
  // Best readable text (black or white) over a background rgb
  function bestTextHex(bgRgb) {
    var white = { r: 255, g: 255, b: 255 }, black = { r: 0, g: 0, b: 0 };
    return contrastRatio(bgRgb, white) >= contrastRatio(bgRgb, black) ? '#ffffff' : '#000000';
  }

  // ============================================
  // MODE 1: HARMONIE
  // ============================================
  var SCHEME_OFFSETS = {
    complementary: [0, 180],
    analogous: [-30, 0, 30],
    triad: [0, 120, 240],
    'tetrad-rect': [0, 60, 180, 240],
    'tetrad-square': [0, 90, 180, 270],
    'split-complementary': [0, 150, 210],
    monochromatic: [0]
  };
  var LS = 'formattedai-colorpalette-state';

  // Canonical color = RGB (integers 0..255). HSL is derived for display only,
  // and becomes a source solely when the user drags an HSL slider or types HSL.
  var state = {
    base: { r: 167, g: 139, b: 250 }, // #a78bfa
    scheme: 'complementary',
    swatches: [] // {r,g,b,locked}
  };

  // Returns an array of 5 RGB colors. The base color (offset 0, no lightness
  // shift) is emitted EXACTLY as the input base RGB — zero round-trip drift.
  function buildScheme(baseRgb, scheme) {
    baseRgb = roundRgb(baseRgb);
    var baseHsl = rgbToHsl(baseRgb); // float, not rounded
    var out = [];
    if (scheme === 'monochromatic') {
      var ls = [-30, -15, 0, 15, 30];
      for (var i = 0; i < 5; i++) {
        if (ls[i] === 0) { out.push({ r: baseRgb.r, g: baseRgb.g, b: baseRgb.b }); continue; }
        out.push(roundRgb(hslToRgb({ h: baseHsl.h, s: clamp(baseHsl.s + (i - 2) * 4, 20, 96), l: clamp(baseHsl.l + ls[i], 8, 94) })));
      }
      return out;
    }
    var offs = SCHEME_OFFSETS[scheme] || SCHEME_OFFSETS.complementary;
    for (var j = 0; j < 5; j++) {
      var o = offs[j % offs.length];
      var tier = Math.floor(j / offs.length); // 0,0,.. then 1,..
      var lShift = 0;
      if (tier > 0) lShift = (tier % 2 === 1 ? 16 : -16) * Math.ceil(tier / 2);
      if (o === 0 && lShift === 0) { out.push({ r: baseRgb.r, g: baseRgb.g, b: baseRgb.b }); continue; }
      out.push(roundRgb(hslToRgb({ h: mod(baseHsl.h + o, 360), s: baseHsl.s, l: clamp(baseHsl.l + lShift, 10, 92) })));
    }
    return out;
  }

  function applyScheme() {
    var next = buildScheme(state.base, state.scheme);
    if (!state.swatches.length) {
      state.swatches = next.map(function (c) { return { r: c.r, g: c.g, b: c.b, locked: false }; });
    } else {
      for (var i = 0; i < 5; i++) {
        var sw = state.swatches[i] || (state.swatches[i] = { r: 0, g: 0, b: 0, locked: false });
        if (!sw.locked) { sw.r = next[i].r; sw.g = next[i].g; sw.b = next[i].b; }
      }
    }
    renderSwatches();
    save();
  }

  var baseColorInput = qs('cp-base-color');
  var baseHexInput = qs('cp-base-hex');
  var baseRgbInput = qs('cp-base-rgb');
  var baseHslInput = qs('cp-base-hsl');
  var sliderH = qs('cp-slider-h');
  var sliderS = qs('cp-slider-s');
  var sliderL = qs('cp-slider-l');
  var sliderHVal = qs('cp-slider-h-val');
  var sliderSVal = qs('cp-slider-s-val');
  var sliderLVal = qs('cp-slider-l-val');

  function updateBaseInputs(skipId) {
    var rgb = state.base;
    var hex = rgbToHex(rgb);
    var hsl = rgbToHsl(rgb); // float; hslStr rounds for display
    var hi = round(hsl.h), si = round(hsl.s), li = round(hsl.l);
    if (baseColorInput && skipId !== 'cp-base-color') baseColorInput.value = hex;
    if (baseHexInput && skipId !== 'cp-base-hex') baseHexInput.value = hex;
    if (baseRgbInput && skipId !== 'cp-base-rgb') baseRgbInput.value = rgbStr(rgb);
    if (baseHslInput && skipId !== 'cp-base-hsl') baseHslInput.value = hslStr(hsl);
    if (sliderH && skipId !== 'cp-slider-h') sliderH.value = hi;
    if (sliderS && skipId !== 'cp-slider-s') sliderS.value = si;
    if (sliderL && skipId !== 'cp-slider-l') sliderL.value = li;
    if (sliderHVal) sliderHVal.textContent = hi + '°';
    if (sliderSVal) sliderSVal.textContent = si + '%';
    if (sliderLVal) sliderLVal.textContent = li + '%';
  }

  // rgb = canonical RGB the user picked/typed; stored EXACTLY (only integer rounded)
  function setBase(rgb, skipId, noApply) {
    state.base = roundRgb(rgb);
    updateBaseInputs(skipId);
    if (!noApply) applyScheme();
    else save();
  }

  function setBadge(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  // Bind a HEX text field: apply on valid, but suppress the error while the
  // user is mid-typing an incomplete value (error only at full length, blur, Enter).
  function bindHexInput(inputEl, errId, applyFn) {
    if (!inputEl) return;
    function handle(force) {
      var v = inputEl.value;
      var rgb = hexToRgb(v);
      if (rgb) { setBadge(qs(errId), ''); applyFn(rgb); }
      else if (force || hexLenComplete(v)) { setBadge(qs(errId), t('badHex')); }
      else { setBadge(qs(errId), ''); }
    }
    inputEl.addEventListener('input', function () { handle(false); });
    inputEl.addEventListener('blur', function () { handle(true); });
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') handle(true); });
  }

  function renderSwatches() {
    for (var i = 0; i < 5; i++) {
      var sw = state.swatches[i];
      var node = qs('cp-swatch-' + i);
      if (!sw || !node) continue;
      var rgb = { r: sw.r, g: sw.g, b: sw.b };
      var hsl = rgbToHsl(rgb); // float; hslStr rounds for display
      var hex = rgbToHex(rgb);
      var area = node.querySelector('.cp-swatch__area');
      var txt = bestTextHex(rgb);
      if (area) {
        area.style.background = hex;
        area.style.color = txt;
        area.setAttribute('aria-label', t('copyHexAria') + ' ' + hex);
      }
      var hexEl = node.querySelector('.cp-swatch__hex');
      var rgbEl = node.querySelector('.cp-swatch__rgb');
      var hslEl = node.querySelector('.cp-swatch__hsl');
      if (hexEl) hexEl.textContent = hex.toUpperCase();
      if (rgbEl) rgbEl.textContent = 'rgb(' + rgbStr(rgb) + ')';
      if (hslEl) hslEl.textContent = 'hsl(' + hslStr(hsl) + ')';
      var lock = node.querySelector('.cp-swatch__lock');
      if (lock) {
        lock.setAttribute('aria-pressed', sw.locked ? 'true' : 'false');
        lock.setAttribute('aria-label', sw.locked ? t('unlockAria') : t('lockAria'));
        lock.classList.toggle('is-locked', !!sw.locked);
        lock.style.color = txt;
      }
    }
    var pal = qs('cp-palette');
    if (pal) pal.setAttribute('aria-label', t('paletteAria') + ': ' + plural('colors', state.swatches.length));
  }

  function currentHexList() {
    return state.swatches.slice(0, 5).map(function (sw) { return rgbToHex(sw); });
  }

  function randomize() {
    setBase(roundRgb(hslToRgb({
      h: Math.floor(Math.random() * 360),
      s: 45 + Math.floor(Math.random() * 45),
      l: 42 + Math.floor(Math.random() * 26)
    })));
  }

  // ---- base input parsers ----
  function parseRgbStr(str) {
    var m = String(str).match(/-?\d+(?:\.\d+)?/g);
    if (!m || m.length < 3) return null;
    var r = clamp(round(+m[0]), 0, 255), g = clamp(round(+m[1]), 0, 255), b = clamp(round(+m[2]), 0, 255);
    if (!isFinite(r) || !isFinite(g) || !isFinite(b)) return null;
    return { r: r, g: g, b: b };
  }
  function onRgbInput() {
    var rgb = parseRgbStr(baseRgbInput.value);
    if (rgb) { setBadge(qs('cp-base-err'), ''); setBase(rgb, 'cp-base-rgb'); }
    else setBadge(qs('cp-base-err'), t('badRgb'));
  }
  function parseHslStr(str) {
    var m = String(str).match(/-?\d+(?:\.\d+)?/g);
    if (!m || m.length < 3) return null;
    return { h: mod(+m[0], 360), s: clamp(+m[1], 0, 100), l: clamp(+m[2], 0, 100) };
  }
  function onHslInput() {
    var hsl = parseHslStr(baseHslInput.value);
    if (hsl) { setBadge(qs('cp-base-err'), ''); setBase(roundRgb(hslToRgb(hsl)), 'cp-base-hsl'); }
    else setBadge(qs('cp-base-err'), t('badHsl'));
  }

  function bindHarmonie() {
    if (baseColorInput) baseColorInput.addEventListener('input', function () {
      var rgb = hexToRgb(baseColorInput.value);
      if (rgb) setBase(rgb, 'cp-base-color');
    });
    bindHexInput(baseHexInput, 'cp-base-err', function (rgb) { setBase(rgb, 'cp-base-hex'); });
    if (baseRgbInput) baseRgbInput.addEventListener('input', onRgbInput);
    if (baseHslInput) baseHslInput.addEventListener('input', onHslInput);

    // HSL sliders are the ONE case where HSL is authoritative: read the currently
    // displayed HSL, change one channel, convert once to RGB and store as canonical.
    [['cp-slider-h', 'h'], ['cp-slider-s', 's'], ['cp-slider-l', 'l']].forEach(function (pair) {
      var el = qs(pair[0]);
      if (!el) return;
      el.addEventListener('input', function () {
        var hsl = { h: +(sliderH && sliderH.value || 0), s: +(sliderS && sliderS.value || 0), l: +(sliderL && sliderL.value || 0) };
        hsl[pair[1]] = +el.value;
        setBase(roundRgb(hslToRgb(hsl)), pair[0]);
      });
    });

    var schemeSel = qs('cp-scheme');
    if (schemeSel) schemeSel.addEventListener('change', function () {
      state.scheme = schemeSel.value;
      applyScheme();
    });

    // EyeDropper (feature-detected)
    var eyeBtn = qs('cp-eyedropper');
    if (eyeBtn) {
      if (typeof window.EyeDropper === 'function') {
        eyeBtn.hidden = false;
        eyeBtn.addEventListener('click', function () {
          try {
            var ed = new window.EyeDropper();
            ed.open().then(function (res) {
              var rgb = hexToRgb(res.sRGBHex);
              if (rgb) setBase(rgb);
            }, function () { /* user cancelled */ });
          } catch (e) { notify(t('eyedropErr')); }
        });
      } else {
        eyeBtn.hidden = true;
      }
    }

    // swatch interactions (copy + lock)
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var node = qs('cp-swatch-' + idx);
        if (!node) return;
        var area = node.querySelector('.cp-swatch__area');
        if (area) area.addEventListener('click', function () {
          var hex = rgbToHex(state.swatches[idx]).toUpperCase();
          copyText(hex, t('copiedHex') + hex);
        });
        var lock = node.querySelector('.cp-swatch__lock');
        if (lock) lock.addEventListener('click', function () {
          state.swatches[idx].locked = !state.swatches[idx].locked;
          renderSwatches();
          save();
          notify(state.swatches[idx].locked ? t('locked') : t('unlocked'));
        });
      })(i);
    }

    var genBtn = qs('cp-generate');
    if (genBtn) genBtn.addEventListener('click', randomize);

    // spacebar => randomize (only in Harmonie, not while typing)
    document.addEventListener('keydown', function (e) {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (currentMode !== 'harmonie') return;
      var tag = (e.target && e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button') return;
      if (e.target && e.target.isContentEditable) return;
      e.preventDefault();
      randomize();
    });

    bindExport();
  }

  // ============================================
  // EXPORT / IMPORT (Harmonie palette)
  // ============================================
  function exportCSS() {
    var list = currentHexList();
    var lines = [':root {'];
    list.forEach(function (hex, i) { lines.push('  --color-' + (i + 1) + ': ' + hex + ';'); });
    lines.push('}');
    return lines.join('\n');
  }
  function exportJSON() {
    var arr = currentHexList().map(function (hex) {
      var rgb = hexToRgb(hex), hsl = rgbToHsl(rgb);
      return { hex: hex, rgb: 'rgb(' + rgbStr(rgb) + ')', hsl: 'hsl(' + hslStr(normHsl(hsl)) + ')' };
    });
    return JSON.stringify(arr, null, 2);
  }
  function exportListHex() { return currentHexList().map(function (h) { return h.toUpperCase(); }).join('\n'); }

  var exportFormat = 'css';
  var exportOut = qs('cp-export-out');
  function refreshExport() {
    if (!exportOut) return;
    if (exportFormat === 'json') exportOut.value = exportJSON();
    else if (exportFormat === 'list') exportOut.value = exportListHex();
    else exportOut.value = exportCSS();
  }

  function drawCanvas() {
    var list = currentHexList();
    var w = 500, h = 160, labelH = 34;
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    var cw = w / list.length;
    list.forEach(function (hex, i) {
      ctx.fillStyle = hex;
      ctx.fillRect(i * cw, 0, Math.ceil(cw), h);
      var rgb = hexToRgb(hex);
      ctx.fillStyle = bestTextHex(rgb);
      ctx.font = '600 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hex.toUpperCase(), i * cw + cw / 2, h - labelH / 2 + 4);
    });
    return canvas;
  }
  function exportPNG() {
    var canvas = drawCanvas();
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'palette.png';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      notify(t('pngSaved'));
    }, 'image/png');
  }
  function exportSVG() {
    var list = currentHexList();
    var w = 500, h = 160, cw = w / list.length;
    var parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">'];
    list.forEach(function (hex, i) {
      var rgb = hexToRgb(hex);
      parts.push('<rect x="' + (i * cw) + '" y="0" width="' + cw + '" height="' + h + '" fill="' + hex + '"/>');
      parts.push('<text x="' + (i * cw + cw / 2) + '" y="' + (h - 14) + '" font-family="monospace" font-size="13" font-weight="600" text-anchor="middle" fill="' + bestTextHex(rgb) + '">' + hex.toUpperCase() + '</text>');
    });
    parts.push('</svg>');
    downloadFile(parts.join(''), 'palette.svg', 'image/svg+xml;charset=utf-8');
    notify(t('svgSaved'));
  }

  function importHexList() {
    var inp = qs('cp-import-in');
    if (!inp) return;
    var raw = inp.value;
    if (!raw.trim()) { notify(t('importEmpty')); return; }
    var found = raw.match(/#?[0-9a-fA-F]{6}\b|#?[0-9a-fA-F]{3}\b/g) || [];
    var colors = [];
    for (var i = 0; i < found.length && colors.length < 5; i++) {
      var rgb = hexToRgb(found[i]);
      if (rgb) colors.push(rgb);
    }
    if (!colors.length) { notify(t('importNone')); return; }
    for (var j = 0; j < 5; j++) {
      var src = colors[j % colors.length];
      state.swatches[j] = { r: src.r, g: src.g, b: src.b, locked: false };
    }
    // reflect first color as base
    setBase(colors[0], null, true);
    renderSwatches();
    refreshExport();
    save();
    notify(t('imported'));
  }

  function bindExport() {
    document.querySelectorAll('#cp-mode-harmonie [data-export]').forEach(function (b) {
      b.addEventListener('click', function () {
        exportFormat = b.getAttribute('data-export');
        document.querySelectorAll('#cp-mode-harmonie [data-export]').forEach(function (x) {
          var active = x === b;
          x.classList.toggle('is-active', active);
          x.setAttribute('aria-checked', active);
        });
        refreshExport();
      });
    });
    enableRovingRadios(document.querySelector('#cp-mode-harmonie [role="radiogroup"]'));
    var copyBtn = qs('cp-export-copy');
    if (copyBtn) copyBtn.addEventListener('click', function () { copyText(exportOut ? exportOut.value : ''); });
    var dlBtn = qs('cp-export-download');
    if (dlBtn) dlBtn.addEventListener('click', function () {
      if (!exportOut || !exportOut.value) { notify(t('nothing')); return; }
      var name = exportFormat === 'json' ? 'palette.json' : exportFormat === 'list' ? 'palette.txt' : 'palette.css';
      var mime = exportFormat === 'json' ? 'application/json' : exportFormat === 'css' ? 'text/css' : 'text/plain';
      downloadFile(exportOut.value, name, mime + ';charset=utf-8');
      notify(t('downloaded'));
    });
    var pngBtn = qs('cp-export-png');
    if (pngBtn) pngBtn.addEventListener('click', exportPNG);
    var svgBtn = qs('cp-export-svg');
    if (svgBtn) svgBtn.addEventListener('click', exportSVG);
    var importBtn = qs('cp-import-btn');
    if (importBtn) importBtn.addEventListener('click', importHexList);
  }

  // ============================================
  // MODE 2: SKALA (design-token scale 50..900)
  // ============================================
  var SCALE_STEPS = [
    { step: 50, l: 96 }, { step: 100, l: 91 }, { step: 200, l: 82 }, { step: 300, l: 72 },
    { step: 400, l: 62 }, { step: 500, l: 52 }, { step: 600, l: 44 }, { step: 700, l: 35 },
    { step: 800, l: 26 }, { step: 900, l: 17 }
  ];
  var scaleBase = { r: 124, g: 108, b: 240 }; // #7c6cf0 (canonical RGB)
  var scaleColorInput = qs('cp-scale-color');
  var scaleHexInput = qs('cp-scale-hex');
  var scaleGrid = qs('cp-scale-grid');
  var scalePrevLight = qs('cp-scale-prev-light');
  var scalePrevDark = qs('cp-scale-prev-dark');

  function renderScale() {
    if (!scaleGrid) return;
    var baseHsl = rgbToHsl(scaleBase); // float; only H and S feed the ramp
    scaleGrid.innerHTML = '';
    SCALE_STEPS.forEach(function (spec) {
      var rgb = roundRgb(hslToRgb({ h: baseHsl.h, s: baseHsl.s, l: spec.l }));
      var hex = rgbToHex(rgb);
      var txt = bestTextHex(rgb);
      var cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cp-scale__cell';
      cell.setAttribute('role', 'listitem');
      cell.style.background = hex;
      cell.style.color = txt;
      cell.setAttribute('aria-label', t('copyHexAria') + ' ' + hex.toUpperCase());
      var stepEl = document.createElement('span');
      stepEl.className = 'cp-scale__step';
      stepEl.textContent = String(spec.step);
      var hexEl = document.createElement('span');
      hexEl.className = 'cp-scale__hex';
      hexEl.textContent = hex.toUpperCase();
      cell.appendChild(stepEl);
      cell.appendChild(hexEl);
      cell.addEventListener('click', function () {
        var h = hex.toUpperCase();
        copyText(h, t('copiedHex') + h);
      });
      scaleGrid.appendChild(cell);
    });
    if (scaleGrid) scaleGrid.setAttribute('aria-label', t('scaleAria') + ': ' + plural('steps', SCALE_STEPS.length));
    // legibility preview: base color as text on light + dark (exact entered color)
    var baseHex = rgbToHex(scaleBase);
    if (scalePrevLight) {
      scalePrevLight.style.color = baseHex;
      scalePrevLight.textContent = t('sampleText');
    }
    if (scalePrevDark) {
      scalePrevDark.style.color = baseHex;
      scalePrevDark.textContent = t('sampleText');
    }
  }
  function setScaleBase(rgb, skipId) {
    scaleBase = roundRgb(rgb);
    var hex = rgbToHex(scaleBase);
    if (scaleColorInput && skipId !== 'cp-scale-color') scaleColorInput.value = hex;
    if (scaleHexInput && skipId !== 'cp-scale-hex') scaleHexInput.value = hex;
    renderScale();
  }
  function bindScale() {
    if (scaleColorInput) scaleColorInput.addEventListener('input', function () {
      var rgb = hexToRgb(scaleColorInput.value);
      if (rgb) setScaleBase(rgb, 'cp-scale-color');
    });
    bindHexInput(scaleHexInput, 'cp-scale-err', function (rgb) { setScaleBase(rgb, 'cp-scale-hex'); });
  }

  // ============================================
  // MODE 3: KONTRAST (WCAG)
  // ============================================
  var cFg = { r: 255, g: 255, b: 255 };
  var cBg = { r: 124, g: 108, b: 240 };
  var fgColor = qs('cp-fg-color');
  var fgHex = qs('cp-fg-hex');
  var bgColor = qs('cp-bg-color');
  var bgHex = qs('cp-bg-hex');
  var ratioEl = qs('cp-ratio');
  var previewEl = qs('cp-contrast-preview');
  var tipBest = qs('cp-tip-best');
  var tipFix = qs('cp-tip-fix');

  function setBadgeState(id, pass) {
    var el = qs(id);
    if (!el) return;
    el.classList.toggle('is-pass', pass);
    el.classList.toggle('is-fail', !pass);
    var res = el.querySelector('.cp-badge__res');
    if (res) res.textContent = pass ? t('pass') : t('fail');
  }
  function suggestFix(fgRgb, bgRgb) {
    if (contrastRatio(fgRgb, bgRgb) >= 4.5) return { ok: true };
    var fgHsl = rgbToHsl(fgRgb);
    // try darkening
    var darker = null, lighter = null;
    for (var l = Math.round(fgHsl.l); l >= 0; l--) {
      if (contrastRatio(hslToRgb({ h: fgHsl.h, s: fgHsl.s, l: l }), bgRgb) >= 4.5) { darker = l; break; }
    }
    for (var u = Math.round(fgHsl.l); u <= 100; u++) {
      if (contrastRatio(hslToRgb({ h: fgHsl.h, s: fgHsl.s, l: u }), bgRgb) >= 4.5) { lighter = u; break; }
    }
    var cur = Math.round(fgHsl.l);
    var pick = null, dir = null;
    if (darker !== null && lighter !== null) {
      if (cur - darker <= lighter - cur) { pick = darker; dir = 'darker'; }
      else { pick = lighter; dir = 'lighter'; }
    } else if (darker !== null) { pick = darker; dir = 'darker'; }
    else if (lighter !== null) { pick = lighter; dir = 'lighter'; }
    else return { ok: false, impossible: true };
    return { ok: false, dir: dir, hex: hslToHex({ h: fgHsl.h, s: fgHsl.s, l: pick }) };
  }
  function renderContrast() {
    var ratio = contrastRatio(cFg, cBg);
    // Badges must agree with the number on screen: compare thresholds against the
    // SAME rounded value we display, so "4.50:1" can never read FAIL on AA.
    var shown = Math.round(ratio * 100) / 100;
    if (ratioEl) ratioEl.textContent = shown.toFixed(2) + ':1';
    setBadgeState('cp-badge-aa', shown >= 4.5);
    setBadgeState('cp-badge-aa-lg', shown >= 3);
    setBadgeState('cp-badge-aaa', shown >= 7);
    setBadgeState('cp-badge-aaa-lg', shown >= 4.5);
    if (previewEl) {
      previewEl.style.background = rgbToHex(cBg);
      previewEl.style.color = rgbToHex(cFg);
    }
    if (tipBest) tipBest.textContent = bestTextHex(cBg) === '#ffffff' ? t('bestWhite') : t('bestBlack');
    if (tipFix) {
      var fix = suggestFix(cFg, cBg);
      if (fix.ok) tipFix.textContent = t('fixOk');
      else if (fix.impossible) tipFix.textContent = t('fixImposs');
      else tipFix.textContent = (fix.dir === 'darker' ? t('fixDarker') : t('fixLighter')) + fix.hex.toUpperCase();
    }
  }
  function bindContrast() {
    function syncFg(rgb, skipId) {
      cFg = rgb;
      var hex = rgbToHex(rgb);
      if (fgColor && skipId !== 'cp-fg-color') fgColor.value = hex;
      if (fgHex && skipId !== 'cp-fg-hex') fgHex.value = hex;
      renderContrast();
    }
    function syncBg(rgb, skipId) {
      cBg = rgb;
      var hex = rgbToHex(rgb);
      if (bgColor && skipId !== 'cp-bg-color') bgColor.value = hex;
      if (bgHex && skipId !== 'cp-bg-hex') bgHex.value = hex;
      renderContrast();
    }
    if (fgColor) fgColor.addEventListener('input', function () { var r = hexToRgb(fgColor.value); if (r) syncFg(r, 'cp-fg-color'); });
    bindHexInput(fgHex, 'cp-fg-err', function (r) { syncFg(r, 'cp-fg-hex'); });
    if (bgColor) bgColor.addEventListener('input', function () { var r = hexToRgb(bgColor.value); if (r) syncBg(r, 'cp-bg-color'); });
    bindHexInput(bgHex, 'cp-bg-err', function (r) { syncBg(r, 'cp-bg-hex'); });
    var swapBtn = qs('cp-contrast-swap');
    if (swapBtn) swapBtn.addEventListener('click', function () {
      var tmp = cFg; cFg = cBg; cBg = tmp;
      if (fgColor) fgColor.value = rgbToHex(cFg);
      if (fgHex) fgHex.value = rgbToHex(cFg);
      if (bgColor) bgColor.value = rgbToHex(cBg);
      if (bgHex) bgHex.value = rgbToHex(cBg);
      renderContrast();
    });
    var applyBest = qs('cp-apply-best');
    if (applyBest) applyBest.addEventListener('click', function () {
      var best = hexToRgb(bestTextHex(cBg));
      syncFg(best, null);
    });
    // initial values into inputs
    if (fgColor) fgColor.value = rgbToHex(cFg);
    if (fgHex) fgHex.value = rgbToHex(cFg);
    if (bgColor) bgColor.value = rgbToHex(cBg);
    if (bgHex) bgHex.value = rgbToHex(cBg);
  }

  // ============================================
  // PERSISTENCE
  // ============================================
  // Accept both the new RGB format and legacy HSL-shaped stored colors.
  function storedToRgb(o) {
    if (!o) return null;
    if (typeof o.r === 'number') return roundRgb({ r: o.r, g: o.g, b: o.b });
    if (typeof o.h === 'number') return roundRgb(hslToRgb({ h: o.h, s: o.s, l: o.l }));
    return null;
  }
  function save() {
    try {
      localStorage.setItem(LS, JSON.stringify({
        base: state.base,
        scheme: state.scheme,
        swatches: state.swatches.map(function (s) { return { r: round(s.r), g: round(s.g), b: round(s.b), locked: !!s.locked }; })
      }));
    } catch (e) { /* ignore */ }
    refreshExport();
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(LS); } catch (e) { /* ignore */ }
    if (!raw) return false;
    try {
      var data = JSON.parse(raw);
      if (data && data.base) { var rb = storedToRgb(data.base); if (rb) state.base = rb; }
      if (data && SCHEME_OFFSETS[data.scheme]) state.scheme = data.scheme;
      if (data && Array.isArray(data.swatches) && data.swatches.length === 5) {
        state.swatches = data.swatches.map(function (s) { var r = storedToRgb(s) || { r: 0, g: 0, b: 0 }; return { r: r.r, g: r.g, b: r.b, locked: !!s.locked }; });
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  }

  // ============================================
  // MODE SWITCHER
  // ============================================
  // Roving tabindex + arrow-key navigation for an ARIA radiogroup.
  // Reuses each radio's existing click handler for the actual selection.
  function enableRovingRadios(group) {
    if (!group) return;
    var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    if (!radios.length) return;
    function refresh() {
      var anyChecked = false;
      radios.forEach(function (r) {
        var on = r.getAttribute('aria-checked') === 'true';
        if (on) anyChecked = true;
        r.setAttribute('tabindex', on ? '0' : '-1');
      });
      if (!anyChecked) radios[0].setAttribute('tabindex', '0');
    }
    function activate(idx) {
      var target = radios[idx];
      if (!target) return;
      target.click(); // existing handler sets aria-checked / is-active + performs action
      refresh();
      target.focus();
    }
    radios.forEach(function (r, i) {
      r.addEventListener('keydown', function (e) {
        switch (e.key) {
          case 'ArrowRight': case 'ArrowDown': e.preventDefault(); activate((i + 1) % radios.length); break;
          case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); activate((i - 1 + radios.length) % radios.length); break;
          case 'Home': e.preventDefault(); activate(0); break;
          case 'End': e.preventDefault(); activate(radios.length - 1); break;
        }
      });
      r.addEventListener('click', refresh);
    });
    refresh();
  }

  var currentMode = 'harmonie';
  function bindModeSwitcher() {
    var buttons = document.querySelectorAll('.cp-modebar [data-mode]');
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        currentMode = b.getAttribute('data-mode');
        buttons.forEach(function (x) {
          var active = x === b;
          x.classList.toggle('is-active', active);
          x.setAttribute('aria-checked', active ? 'true' : 'false');
        });
        document.querySelectorAll('.cp-mode').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-mode') !== currentMode;
        });
      });
    });
    enableRovingRadios(document.querySelector('.cp-modebar [role="radiogroup"]'));
  }

  // ---- init ----
  function init() {
    bindModeSwitcher();
    var restored = load();
    var schemeSel = qs('cp-scheme');
    if (schemeSel) schemeSel.value = state.scheme;
    bindHarmonie();
    updateBaseInputs();
    if (restored) { renderSwatches(); save(); }
    else applyScheme();
    bindScale();
    setScaleBase(scaleBase);
    bindContrast();
    renderContrast();
    refreshExport();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
