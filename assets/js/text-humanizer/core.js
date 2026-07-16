import { sanitize } from './sanitizer.js';
import { burstiness, burstinessLabel, sentenceLengthStats } from './burstiness.js';
import { detectLanguage } from './language-detect.js';
import { wordDiff, renderDiffInto, diffStats } from './diff.js';
import { buildExtractMessages, buildRebuildMessages, validateExtractOutput, validateRebuildOutput, shouldSkipExtract } from './reverse-prompt.js';
import { wordCount } from './sentence-splitter.js';
import {
  createLogger,
  installGlobalHandlers,
  logEnvironment,
  logCssCheck,
  onLog,
  exportLogText,
  getLog,
  clearLog,
} from './logger.js';

const log = createLogger('core');

const t = (key) => {
  const root = document.documentElement;
  const isEN = root.lang === 'en' || root.classList.contains('lang-en');
  const dict = {
    pl: {
      tooShort: 'Tekst zbyt krótki',
      sanitized: 'Quick Sanitize gotowy',
      deepDone: 'Deep Humanizer gotowy',
      generating: 'Generuję...',
      extracting: 'Krok 1/2 — Wyciągam fakty',
      rebuilding: 'Krok 2/2 — Składam tekst od nowa',
      modelLoading: 'Ładuję model AI',
      modelReady: 'Model gotowy',
      cancel: 'Anuluj',
      retry: 'Ponów',
      cancelled: 'Anulowano',
      validationFailed: 'Walidacja wyniku nie powiodła się',
      browserUnsupported: 'Twoja przeglądarka nie wspiera WebGPU',
      noWebGPU: 'WebGPU niedostępne',
      copy: 'Skopiowano',
      tokensPerSec: 't/s',
    },
    en: {
      tooShort: 'Text too short',
      sanitized: 'Quick Sanitize done',
      deepDone: 'Deep Humanizer done',
      generating: 'Generating...',
      extracting: 'Step 1/2 — Extracting facts',
      rebuilding: 'Step 2/2 — Rebuilding text',
      modelLoading: 'Loading AI model',
      modelReady: 'Model ready',
      cancel: 'Cancel',
      retry: 'Retry',
      cancelled: 'Cancelled',
      validationFailed: 'Output validation failed',
      browserUnsupported: 'Your browser does not support WebGPU',
      noWebGPU: 'WebGPU unavailable',
      copy: 'Copied',
      tokensPerSec: 't/s',
    },
  };
  return (isEN ? dict.en : dict.pl)[key] || key;
};

const state = {
  worker: null,
  workerReady: false,
  workerLoading: false,
  modelKey: 'qwen-1.5b',
  currentJob: null,
  devMode: false,
  headerClicks: 0,
  headerClickResetTimer: null,
};

function $(sel, root = document) { return root.querySelector(sel); }

function setText(el, text) { if (el) el.textContent = text; }

function clearChildren(el) {
  if (el) el.replaceChildren();
}

function updateBurstinessUI(text, language, target) {
  const score = burstiness(text, language);
  const label = burstinessLabel(score, language);
  const bar = $(target.bar);
  const labelEl = $(target.label);
  const valueEl = $(target.value);

  if (bar) {
    const w = score === null ? 0 : Math.min(100, Math.round((score / 1.0) * 100));
    bar.style.width = w + '%';
    bar.dataset.tone = label.tone;
  }
  setText(labelEl, label.label);
  setText(valueEl, score === null ? '—' : score.toFixed(2));
}

function updateCounts(textareaSel, wordsSel, charsSel) {
  const ta = $(textareaSel);
  if (!ta) return;
  const txt = ta.value || '';
  setText($(wordsSel), String(wordCount(txt)));
  setText($(charsSel), String(txt.length));
}

function debounce(fn, ms) {
  let h = null;
  return (...args) => {
    clearTimeout(h);
    h = setTimeout(() => fn(...args), ms);
  };
}

function detectLangFromUI(text) {
  const sel = $('#th-language');
  const v = sel ? sel.value : 'auto';
  if (v === 'auto') return detectLanguage(text);
  return v;
}

function notify(msg, tone = 'info') {
  const el = $('#th-notify');
  if (!el) return;
  el.textContent = msg;
  el.dataset.tone = tone;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

function renderDiff(oldText, newText) {
  const panel = $('#th-diff');
  const stats = $('#th-diff-stats');
  if (!panel) return;
  if (!oldText || !newText) {
    clearChildren(panel);
    setText(stats, '');
    return;
  }
  const ops = wordDiff(oldText, newText);
  renderDiffInto(panel, ops);
  const s = diffStats(ops);
  if (stats) {
    stats.textContent = (document.documentElement.lang === 'en')
      ? `+${s.added} chars · -${s.removed} chars`
      : `+${s.added} znaków · -${s.removed} znaków`;
  }
}

function runQuickSanitize() {
  const inputEl = $('#th-input');
  if (!inputEl) {
    log.error('runQuickSanitize: #th-input not found');
    return;
  }
  const text = inputEl.value;
  if (!text || text.trim().length < 30) {
    log.info('sanitize-skip: text too short', { length: text.length });
    notify(t('tooShort'), 'warn');
    return;
  }
  const lang = detectLangFromUI(text);
  const preset = $('#th-style')?.value || 'casual';
  const t0 = performance.now();
  let out;
  try {
    out = sanitize(text, { lang, preset });
  } catch (err) {
    log.error('sanitize threw', err);
    notify('Sanitize error: ' + err.message, 'bad');
    return;
  }
  const dt = (performance.now() - t0).toFixed(1);
  log.info('sanitize-done', { lang, preset, inputLen: text.length, outputLen: out.length, ms: dt });
  $('#th-output').value = out;

  updateBurstinessUI(text, lang, {
    bar: '#th-burst-before-bar',
    label: '#th-burst-before-label',
    value: '#th-burst-before-value',
  });
  updateBurstinessUI(out, lang, {
    bar: '#th-burst-after-bar',
    label: '#th-burst-after-label',
    value: '#th-burst-after-value',
  });
  updateCounts('#th-output', '#th-output-words', '#th-output-chars');
  renderDiff(text, out);
  notify(t('sanitized'), 'good');

  if (state.devMode) {
    const stats = sentenceLengthStats(out, lang);
    console.log('[TextHumanizer:Sanitize]', { lang, preset, stats });
  }
}

async function ensureWorker(modelKey) {
  if (state.worker && state.workerReady && state.modelKey === modelKey) return state.worker;

  if (state.worker) {
    try { state.worker.terminate(); } catch (_) {}
    state.worker = null;
    state.workerReady = false;
  }

  if (!('gpu' in navigator)) {
    log.error('ensureWorker: WebGPU not available');
    notify(t('browserUnsupported'), 'bad');
    throw new Error('no_webgpu');
  }

  const workerUrl = new URL('./text-humanizer-worker.min.js', import.meta.url);
  log.info('ensureWorker: creating worker', { url: workerUrl.toString(), modelKey });

  let w;
  try {
    w = new Worker(workerUrl, { type: 'module' });
  } catch (err) {
    log.error('Worker constructor threw', err);
    throw err;
  }

  state.worker = w;
  state.workerReady = false;
  state.workerLoading = true;
  state.modelKey = modelKey;

  w.addEventListener('error', (e) => {
    log.error('worker.error event', { message: e.message, filename: e.filename, lineno: e.lineno });
  });
  w.addEventListener('messageerror', (e) => {
    log.error('worker.messageerror event', { data: e.data });
  });

  return new Promise((resolve, reject) => {
    const onMsg = (e) => {
      const m = e.data || {};
      switch (m.type) {
        case 'worker-loaded':
          log.info('worker bootstrapped');
          break;
        case 'progress': {
          const pct = Math.round((m.progress || 0) * 100);
          const bar = $('#th-download-progress');
          if (bar) bar.style.width = pct + '%';
          setText($('#th-download-text'), m.text || (pct + '%'));
          if (pct % 10 === 0) log.debug('download progress', { pct, text: m.text });
          break;
        }
        case 'ready':
          log.info('worker ready', { modelId: m.modelId });
          state.workerReady = true;
          state.workerLoading = false;
          $('#th-download-modal')?.classList.remove('open');
          notify(t('modelReady'), 'good');
          resolve(w);
          break;
        case 'error':
          log.error('worker error msg', m);
          state.workerReady = false;
          state.workerLoading = false;
          notify(m.error || 'error', 'bad');
          reject(new Error(m.error || 'init_failed'));
          break;
        case 'token':
          if (state.currentJob) state.currentJob.onToken(m);
          break;
        case 'generation-done':
          log.info('generation done', { requestId: m.requestId, outputLen: m.output?.length });
          if (state.currentJob) state.currentJob.onDone(m);
          break;
        case 'generation-error':
          log.error('generation error', m);
          if (state.currentJob) state.currentJob.onError(m);
          break;
        case 'generation-cancelled':
          log.warn('generation cancelled', { requestId: m.requestId });
          if (state.currentJob) state.currentJob.onCancel(m);
          break;
        default:
          log.debug('worker msg', m);
      }
    };
    w.addEventListener('message', onMsg);
    try {
      w.postMessage({ type: 'init', modelKey });
    } catch (err) {
      log.error('postMessage(init) failed', err);
      reject(err);
    }
  });
}

function workerGenerate(messages, params) {
  return new Promise((resolve, reject) => {
    if (!state.worker || !state.workerReady) {
      log.error('workerGenerate called without ready worker', { hasWorker: !!state.worker, ready: state.workerReady });
      reject(new Error('worker_not_ready'));
      return;
    }
    const requestId = 'r' + Date.now() + Math.random().toString(36).slice(2, 6);
    let aggregated = '';
    const onTokenCb = params.onToken;
    state.currentJob = {
      requestId,
      onToken: (m) => {
        if (m.requestId !== requestId) return;
        aggregated += m.text;
        if (onTokenCb) {
          try { onTokenCb(m.text, aggregated); } catch (err) { log.warn('onToken cb threw', err); }
        }
      },
      onDone: (m) => {
        if (m.requestId !== requestId) return;
        state.currentJob = null;
        resolve(m.output || aggregated);
      },
      onError: (m) => {
        if (m.requestId !== requestId) return;
        state.currentJob = null;
        reject(new Error(m.error || 'generation_error'));
      },
      onCancel: () => {
        state.currentJob = null;
        reject(new Error('cancelled'));
      },
    };

    const serializableParams = {
      temperature: params.temperature,
      top_p: params.top_p,
      max_tokens: params.max_tokens,
    };
    log.info('workerGenerate: sending', { requestId, messagesCount: messages.length, params: serializableParams });

    try {
      state.worker.postMessage({ type: 'generate', messages, params: serializableParams, requestId });
    } catch (err) {
      log.error('postMessage(generate) threw', err);
      state.currentJob = null;
      reject(err);
    }
  });
}

async function runDeepHumanizer() {
  const inputEl = $('#th-input');
  const text = inputEl.value;
  if (!text || text.trim().length < 30) {
    log.info('deep: skip — text too short', { length: text.length });
    notify(t('tooShort'), 'warn');
    return;
  }

  const lang = detectLangFromUI(text);
  const preset = $('#th-style')?.value || 'casual';
  const customPersona = $('#th-custom-persona')?.value?.trim() || null;
  log.info('deep: start', { lang, preset, customPersona: !!customPersona, inputLen: text.length, modelKey: state.modelKey });

  const deepBtn = $('#th-deep-btn');
  const cancelBtn = $('#th-cancel-btn');
  if (deepBtn) deepBtn.disabled = true;
  if (cancelBtn) cancelBtn.hidden = false;

  $('#th-deep-status')?.classList.add('active');
  setText($('#th-deep-stage'), t('extracting'));
  setText($('#th-deep-progress'), '0%');

  try {
    if (!state.workerReady) {
      log.info('deep: worker not ready, calling ensureWorker');
      const modal = $('#th-download-modal');
      if (modal) modal.classList.add('open');
      await ensureWorker(state.modelKey);
    }

    const t0 = performance.now();
    let tokenCount = 0;
    const onToken = () => {
      tokenCount++;
      const elapsed = (performance.now() - t0) / 1000;
      const tps = elapsed > 0 ? (tokenCount / elapsed).toFixed(1) : '0';
      setText($('#th-deep-progress'), tokenCount + ' tok · ' + tps + ' ' + t('tokensPerSec'));
    };

    const skipExtract = shouldSkipExtract(text);
    let rebuildInput;

    if (skipExtract) {
      log.info('deep: input too long — skipping extract step, passing text directly to rebuild', { length: text.length });
      rebuildInput = text;
    } else {
      log.info('deep: building extract messages');
      const extractMessages = buildExtractMessages(text, lang);
      log.info('deep: calling workerGenerate for extract step');
      let extractOutput;
      try {
        extractOutput = await workerGenerate(extractMessages, {
          temperature: 0.3,
          max_tokens: 1024,
          onToken,
        });
      } catch (err) {
        log.error('deep: extract step threw', err);
        throw err;
      }
      log.info('deep: extract output received', { length: extractOutput.length, preview: extractOutput.slice(0, 120) });

      if (!validateExtractOutput(extractOutput)) {
        log.warn('deep: extract output looks weak — falling back to original text', { preview: extractOutput.slice(0, 200) });
        rebuildInput = text;
      } else {
        rebuildInput = extractOutput;
      }

      if (state.devMode) {
        console.group('[TextHumanizer:Deep] Extract step');
        console.log(extractOutput);
        console.groupEnd();
      }
    }

    setText($('#th-deep-stage'), t('rebuilding'));
    tokenCount = 0;

    log.info('deep: building rebuild messages', { skipExtract, rebuildInputLen: rebuildInput.length });
    const rebuildMessages = buildRebuildMessages(rebuildInput, lang, preset, customPersona);
    const maxTokens = Math.min(3000, Math.max(800, Math.ceil(text.length / 2)));
    log.info('deep: calling workerGenerate for rebuild step', { maxTokens });
    let rebuildOutput = await workerGenerate(rebuildMessages, {
      temperature: 0.85,
      max_tokens: maxTokens,
      onToken,
    });
    log.info('deep: rebuild output received', { length: rebuildOutput.length, ratio: (rebuildOutput.length / text.length).toFixed(2) });

    let validation = validateRebuildOutput(rebuildOutput, text);
    let retries = 0;
    let lastValidOutput = rebuildOutput;
    while (!validation.valid && retries < 1) {
      retries++;
      log.warn('deep: rebuild validation failed, retrying', { retry: retries, reason: validation.reason, ratio: validation.ratio });
      const retryOutput = await workerGenerate(rebuildMessages, {
        temperature: 0.9,
        max_tokens: maxTokens,
        onToken,
      });
      const retryValidation = validateRebuildOutput(retryOutput, text);
      if (retryValidation.valid || retryOutput.length > lastValidOutput.length) {
        rebuildOutput = retryOutput;
        validation = retryValidation;
        lastValidOutput = retryOutput;
      }
    }

    if (!validation.valid) {
      log.warn('deep: validation still failed — showing output anyway', { ...validation, outputLen: rebuildOutput.length });
      notify(`${t('validationFailed')}: ${validation.reason}. Pokazuję mimo to.`, 'warn');
    }

    $('#th-output').value = rebuildOutput.trim();

    updateBurstinessUI(text, lang, {
      bar: '#th-burst-before-bar',
      label: '#th-burst-before-label',
      value: '#th-burst-before-value',
    });
    updateBurstinessUI(rebuildOutput, lang, {
      bar: '#th-burst-after-bar',
      label: '#th-burst-after-label',
      value: '#th-burst-after-value',
    });
    updateCounts('#th-output', '#th-output-words', '#th-output-chars');
    renderDiff(text, rebuildOutput);
    notify(t('deepDone'), 'good');

    if (state.devMode) {
      console.group('[TextHumanizer:Deep] Rebuild step');
      console.log(rebuildOutput);
      console.groupEnd();
    }
  } catch (err) {
    log.error('deep: caught error', { message: err.message, stack: err.stack });
    if (err.message === 'cancelled') {
      notify(t('cancelled'), 'warn');
    } else if (err.message !== 'no_webgpu') {
      notify('Error: ' + err.message, 'bad');
    }
  } finally {
    if (deepBtn) deepBtn.disabled = false;
    if (cancelBtn) cancelBtn.hidden = true;
    $('#th-deep-status')?.classList.remove('active');
  }
}

function cancelDeep() {
  if (state.worker) state.worker.postMessage({ type: 'cancel' });
}

function copyOutput() {
  const out = $('#th-output');
  if (!out || !out.value) return;
  navigator.clipboard.writeText(out.value).then(() => notify(t('copy'), 'good'));
}

function clearAll() {
  $('#th-input').value = '';
  $('#th-output').value = '';
  clearChildren($('#th-diff'));
  setText($('#th-diff-stats'), '');
  updateCounts('#th-input', '#th-input-words', '#th-input-chars');
  updateCounts('#th-output', '#th-output-words', '#th-output-chars');
  ['#th-burst-before-bar', '#th-burst-after-bar'].forEach(s => {
    const el = $(s);
    if (el) el.style.width = '0%';
  });
  ['#th-burst-before-label', '#th-burst-after-label', '#th-burst-before-value', '#th-burst-after-value'].forEach(s => setText($(s), '—'));
}

function checkWebGPU() {
  const supported = 'gpu' in navigator;
  const indicator = $('#th-webgpu-indicator');
  if (indicator) {
    indicator.dataset.supported = supported ? 'yes' : 'no';
    setText(indicator, supported ? '✓ WebGPU' : '✕ WebGPU');
  }
  return supported;
}

function setupHeaderDevMode() {
  const header = $('#th-title');
  if (!header) return;
  header.addEventListener('click', () => {
    state.headerClicks++;
    clearTimeout(state.headerClickResetTimer);
    state.headerClickResetTimer = setTimeout(() => { state.headerClicks = 0; }, 2500);
    if (state.headerClicks >= 5) {
      state.devMode = !state.devMode;
      state.headerClicks = 0;
      notify('Dev mode: ' + (state.devMode ? 'ON' : 'OFF'), 'good');
      console.log('%c[TextHumanizer] Dev mode: ' + state.devMode, 'color:#7c6cf0;font-weight:bold');
    }
  });
}

function setupEventListeners() {
  const inputEl = $('#th-input');
  const debouncedInputUpdate = debounce(() => {
    updateCounts('#th-input', '#th-input-words', '#th-input-chars');
    const text = inputEl.value;
    if (text.length > 30) {
      const lang = detectLangFromUI(text);
      updateBurstinessUI(text, lang, {
        bar: '#th-burst-before-bar',
        label: '#th-burst-before-label',
        value: '#th-burst-before-value',
      });
    }
  }, 250);
  inputEl?.addEventListener('input', debouncedInputUpdate);

  $('#th-quick-btn')?.addEventListener('click', runQuickSanitize);
  $('#th-deep-btn')?.addEventListener('click', runDeepHumanizer);
  $('#th-cancel-btn')?.addEventListener('click', cancelDeep);
  $('#th-copy-btn')?.addEventListener('click', copyOutput);
  $('#th-clear-btn')?.addEventListener('click', clearAll);

  $('#th-download-cancel')?.addEventListener('click', () => {
    $('#th-download-modal')?.classList.remove('open');
    if (state.worker) {
      try { state.worker.terminate(); } catch (_) {}
      state.worker = null;
      state.workerReady = false;
      state.workerLoading = false;
    }
  });

  $('#th-model-select')?.addEventListener('change', (e) => {
    state.modelKey = e.target.value;
    if (state.worker) {
      state.worker.postMessage({ type: 'unload' });
      try { state.worker.terminate(); } catch (_) {}
      state.worker = null;
      state.workerReady = false;
    }
  });

  $('#th-advanced-toggle')?.addEventListener('click', () => {
    $('#th-advanced-panel')?.classList.toggle('open');
  });
}

function setupErrorPanel() {
  const panel = document.createElement('div');
  panel.id = 'th-error-panel';
  panel.className = 'th-error-panel';
  panel.hidden = true;

  const summary = document.createElement('button');
  summary.type = 'button';
  summary.className = 'th-error-panel__summary';
  summary.setAttribute('aria-expanded', 'false');

  const dot = document.createElement('span');
  dot.className = 'th-error-panel__dot';
  const count = document.createElement('span');
  count.className = 'th-error-panel__count';
  count.textContent = '0';
  const labelEl = document.createElement('span');
  labelEl.textContent = (document.documentElement.lang === 'en' ? 'logs' : 'logi');
  summary.append(dot, count, document.createTextNode(' '), labelEl);

  const actions = document.createElement('div');
  actions.className = 'th-error-panel__actions';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'th-error-panel__btn';
  copyBtn.textContent = document.documentElement.lang === 'en' ? 'Copy' : 'Kopiuj';
  copyBtn.addEventListener('click', () => {
    const txt = exportLogText();
    navigator.clipboard.writeText(txt).then(
      () => notify(document.documentElement.lang === 'en' ? 'Logs copied' : 'Logi skopiowane', 'good'),
      (err) => { log.error('clipboard write failed', err); notify('clipboard error', 'bad'); }
    );
  });

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'th-error-panel__btn';
  clearBtn.textContent = document.documentElement.lang === 'en' ? 'Clear' : 'Wyczyść';
  clearBtn.addEventListener('click', () => {
    clearLog();
    renderLogList();
    updateBadge();
  });

  actions.append(copyBtn, clearBtn);

  const list = document.createElement('div');
  list.className = 'th-error-panel__list';
  list.hidden = true;

  let expanded = false;
  summary.addEventListener('click', () => {
    expanded = !expanded;
    summary.setAttribute('aria-expanded', String(expanded));
    list.hidden = !expanded;
    panel.classList.toggle('open', expanded);
    if (expanded) renderLogList();
  });

  panel.append(summary, actions, list);
  document.body.appendChild(panel);

  function renderLogList() {
    list.replaceChildren();
    const frag = document.createDocumentFragment();
    for (const entry of getLog().slice(-100)) {
      const row = document.createElement('div');
      row.className = 'th-error-panel__row';
      row.dataset.level = entry.level;
      row.textContent = `[${entry.t.slice(11, 19)}] [${entry.level}] [${entry.scope}] ${entry.msg}`;
      frag.appendChild(row);
    }
    list.appendChild(frag);
    list.scrollTop = list.scrollHeight;
  }

  function updateBadge() {
    const all = getLog();
    const errs = all.filter(e => e.level === 'error').length;
    const warns = all.filter(e => e.level === 'warn').length;
    count.textContent = String(errs || warns || all.length);
    panel.hidden = all.length === 0;
    if (errs > 0) panel.dataset.tone = 'error';
    else if (warns > 0) panel.dataset.tone = 'warn';
    else panel.dataset.tone = 'info';
  }

  onLog(() => {
    updateBadge();
    if (expanded) renderLogList();
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      summary.click();
    }
  });
}

function init() {
  installGlobalHandlers();
  log.info('init: start', { readyState: document.readyState });

  try {
    checkWebGPU();
  } catch (err) { log.error('checkWebGPU failed', err); }

  try {
    setupHeaderDevMode();
  } catch (err) { log.error('setupHeaderDevMode failed', err); }

  try {
    setupEventListeners();
  } catch (err) { log.error('setupEventListeners failed', err); }

  try {
    setupErrorPanel();
  } catch (err) { log.error('setupErrorPanel failed', err); console.error(err); }

  updateCounts('#th-input', '#th-input-words', '#th-input-chars');
  updateCounts('#th-output', '#th-output-words', '#th-output-chars');

  logEnvironment();
  logCssCheck([
    'body',
    '.tool-shell',
    '.th-main',
    '.th',
    '.th__pane',
    '.th__textarea',
    '.th-controls',
    '.th-burst',
    '.tool-head',
    '#th-input',
  ]);

  log.info('init: done');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { runQuickSanitize, runDeepHumanizer };
