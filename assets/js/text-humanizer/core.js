import { detect, applyIssues } from './detector.js';
import { burstiness, burstinessLabel } from './burstiness.js';
import { detectLanguage } from './language-detect.js';
import { wordDiff, renderDiffInto, diffStats } from './diff.js';
import { buildRebuildMessages, buildExtractMessages, validateExtractOutput, validateRebuildOutput, shouldSkipExtract } from './reverse-prompt.js';
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

function uiLang() {
  const root = document.documentElement;
  return (root.lang === 'en' || root.classList.contains('lang-en')) ? 'en' : 'pl';
}

const STR = {
  pl: {
    tooShort: 'Tekst zbyt krótki (min. 30 znaków)',
    scanDone: 'Skan gotowy',
    noIssues: 'Nie znaleziono AI-telli — tekst wygląda naturalnie.',
    tellsFound: 'AI-telli',
    remove: '(usuń)',
    apply: 'Zastosuj',
    undo: 'Cofnij',
    dismiss: 'Pomiń',
    restore: 'Przywróć',
    copied: 'Skopiowano',
    deepDone: 'Deep Humanizer gotowy',
    extracting: 'Krok 1/2 — Wyciągam fakty',
    rebuilding: 'Krok 2/2 — Składam tekst od nowa',
    modelReady: 'Model gotowy',
    cancelled: 'Anulowano',
    validationFailed: 'Walidacja wyniku nie powiodła się',
    browserUnsupported: 'Twoja przeglądarka nie wspiera WebGPU',
    tokensPerSec: 't/s',
    rhythmMono: 'monotonny (jak AI)',
    rhythmVaried: 'zróżnicowany',
  },
  en: {
    tooShort: 'Text too short (min. 30 chars)',
    scanDone: 'Scan complete',
    noIssues: 'No AI tells found — the text reads naturally.',
    tellsFound: 'AI tells',
    remove: '(remove)',
    apply: 'Apply',
    undo: 'Undo',
    dismiss: 'Dismiss',
    restore: 'Restore',
    copied: 'Copied',
    deepDone: 'Deep Humanizer done',
    extracting: 'Step 1/2 — Extracting facts',
    rebuilding: 'Step 2/2 — Rebuilding text',
    modelReady: 'Model ready',
    cancelled: 'Cancelled',
    validationFailed: 'Output validation failed',
    browserUnsupported: 'Your browser does not support WebGPU',
    tokensPerSec: 't/s',
    rhythmMono: 'monotonous (AI-like)',
    rhythmVaried: 'varied',
  },
};

const CATLABEL = {
  pl: { canary: 'Słowo-kanarek', hedge: 'Wstęp-wypełniacz', closer: 'Zamknięcie-klisza', filler: 'Filler', emdash: 'Nadmiar myślnika', tricolon: 'Tricolon' },
  en: { canary: 'AI buzzword', hedge: 'Hedge opener', closer: 'Resolution closer', filler: 'Filler', emdash: 'Em-dash overuse', tricolon: 'Tricolon' },
};

const t = (key) => (STR[uiLang()][key] || key);
const catLabel = (cat) => (CATLABEL[uiLang()][cat] || cat);

const state = {
  originalText: '',
  lang: 'pl',
  issues: [],
  statusById: new Map(), // id -> 'pending' | 'applied' | 'dismissed'
  // Deep Humanizer worker state
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
function setText(el, s) { if (el) el.textContent = s; }
function clearChildren(el) { if (el) el.replaceChildren(); }

function debounce(fn, ms) {
  let h = null;
  return (...args) => { clearTimeout(h); h = setTimeout(() => fn(...args), ms); };
}

function notify(msg, tone = 'info') {
  const el = $('#th-notify');
  if (!el) return;
  el.textContent = msg;
  el.dataset.tone = tone;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

function updateCounts(taSel, wordsSel, charsSel) {
  const ta = $(taSel);
  if (!ta) return;
  const txt = ta.value || '';
  setText($(wordsSel), String(wordCount(txt)));
  setText($(charsSel), String(txt.length));
}

function langFromUI(text) {
  const sel = $('#th-language');
  const v = sel ? sel.value : 'auto';
  return v === 'auto' ? detectLanguage(text) : v;
}

// --- Rhythm (burstiness) readout — one signal among several, not an "AI score".
function updateRhythm(sel, noteSel, text, lang) {
  const score = burstiness(text, lang);
  const info = burstinessLabel(score, lang);
  const el = $(sel);
  if (el) {
    el.textContent = score === null ? '—' : score.toFixed(2);
    el.dataset.tone = info.tone;
  }
  if (noteSel) {
    const note = $(noteSel);
    if (note) {
      const mono = score !== null && score < 0.35;
      setText(note, score === null ? '' : (mono ? t('rhythmMono') : t('rhythmVaried')));
      note.dataset.tone = mono ? 'bad' : 'good';
    }
  }
}

// --- Applied issues, in document order.
function appliedIssues() {
  return state.issues.filter(i => state.statusById.get(i.id) === 'applied');
}

// --- Recompute the output text from the currently-applied subset of issues.
function recompute() {
  const out = applyIssues(state.originalText, appliedIssues());
  const outEl = $('#th-output');
  if (outEl) outEl.value = out;
  updateCounts('#th-output', '#th-output-words', '#th-output-chars');
  updateRhythm('#th-rhythm-after', '#th-rhythm-after-note', out, state.lang);
  renderDiff(state.originalText, out);
  updateAppliedBadge();
}

function updateAppliedBadge() {
  const applied = appliedIssues().length;
  const total = state.issues.length;
  setText($('#th-applied-count'), `${applied}/${total}`);
}

function renderDiff(oldText, newText) {
  const panel = $('#th-diff');
  const stats = $('#th-diff-stats');
  if (!panel) return;
  if (!oldText || oldText === newText) {
    clearChildren(panel);
    setText(stats, '');
    return;
  }
  const ops = wordDiff(oldText, newText);
  renderDiffInto(panel, ops);
  const s = diffStats(ops);
  if (stats) {
    setText(stats, uiLang() === 'en'
      ? `+${s.added} chars · -${s.removed} chars`
      : `+${s.added} znaków · -${s.removed} znaków`);
  }
}

// --- Build one issue row.
function issueRow(issue) {
  const status = state.statusById.get(issue.id) || 'pending';
  const row = document.createElement('div');
  row.className = 'th-issue';
  row.dataset.id = issue.id;
  row.dataset.cat = issue.category;
  row.dataset.status = status;

  const dot = document.createElement('span');
  dot.className = 'th-issue__dot';
  dot.dataset.sev = issue.severity;

  const main = document.createElement('button');
  main.type = 'button';
  main.className = 'th-issue__main';
  main.title = uiLang() === 'en' ? 'Show in text' : 'Pokaż w tekście';

  const cat = document.createElement('span');
  cat.className = 'th-issue__cat';
  cat.textContent = catLabel(issue.category);
  if (issue.safe) cat.dataset.safe = 'yes';

  const textWrap = document.createElement('span');
  textWrap.className = 'th-issue__text';
  const del = document.createElement('del');
  del.textContent = issue.original.length > 60 ? issue.original.slice(0, 57) + '…' : issue.original;
  textWrap.appendChild(del);
  const arrow = document.createElement('span');
  arrow.className = 'th-issue__arrow';
  arrow.textContent = ' → ';
  textWrap.appendChild(arrow);
  const ins = document.createElement('ins');
  ins.textContent = issue.replacement === '' ? t('remove') : issue.replacement;
  if (issue.replacement === '') ins.dataset.remove = 'yes';
  textWrap.appendChild(ins);

  main.append(cat, textWrap);

  const actions = document.createElement('div');
  actions.className = 'th-issue__actions';

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.className = 'th-issue__btn th-issue__apply';
  applyBtn.textContent = status === 'applied' ? t('undo') : t('apply');

  const dismissBtn = document.createElement('button');
  dismissBtn.type = 'button';
  dismissBtn.className = 'th-issue__btn th-issue__dismiss';
  dismissBtn.textContent = status === 'dismissed' ? t('restore') : t('dismiss');

  actions.append(applyBtn, dismissBtn);
  row.append(dot, main, actions);
  return row;
}

function renderIssues() {
  const list = $('#th-issues');
  if (!list) return;
  list.replaceChildren();
  const frag = document.createDocumentFragment();
  for (const issue of state.issues) frag.appendChild(issueRow(issue));
  list.appendChild(frag);
}

function renderSummary() {
  const total = state.issues.length;
  setText($('#th-tell-count'), String(total));

  const byCat = {};
  for (const i of state.issues) byCat[i.category] = (byCat[i.category] || 0) + 1;
  const parts = Object.entries(byCat).map(([c, n]) => `${n} ${catLabel(c).toLowerCase()}`);
  setText($('#th-tell-breakdown'), parts.join(' · '));

  const emptyEl = $('#th-issues-empty');
  if (emptyEl) emptyEl.hidden = total > 0;
}

function setStatus(id, status) {
  state.statusById.set(id, status);
  const row = $(`.th-issue[data-id="${CSS.escape(id)}"]`);
  if (row) {
    row.dataset.status = status;
    const applyBtn = $('.th-issue__apply', row);
    const dismissBtn = $('.th-issue__dismiss', row);
    if (applyBtn) applyBtn.textContent = status === 'applied' ? t('undo') : t('apply');
    if (dismissBtn) dismissBtn.textContent = status === 'dismissed' ? t('restore') : t('dismiss');
  }
  recompute();
}

function focusRange(issue) {
  const ta = $('#th-input');
  if (!ta) return;
  ta.focus();
  try { ta.setSelectionRange(issue.start, issue.end); } catch (_) {}
  // Approximate scroll: proportion of the offset within the text.
  const ratio = issue.start / Math.max(1, state.originalText.length);
  ta.scrollTop = Math.max(0, ta.scrollHeight * ratio - ta.clientHeight / 2);
}

function runScan() {
  const inputEl = $('#th-input');
  if (!inputEl) return;
  const text = inputEl.value;
  if (!text || text.trim().length < 30) {
    notify(t('tooShort'), 'warn');
    return;
  }

  const lang = langFromUI(text);
  let result;
  try {
    result = detect(text, { lang });
  } catch (err) {
    log.error('detect threw', err);
    notify('Scan error: ' + err.message, 'bad');
    return;
  }

  state.originalText = text;
  state.lang = lang;
  state.issues = result.issues;
  state.statusById = new Map(result.issues.map(i => [i.id, 'pending']));

  log.info('scan-done', { lang, tells: result.summary.total, byCategory: result.summary.byCategory });

  $('#th-scan')?.removeAttribute('hidden');
  $('#th-issues-block')?.removeAttribute('hidden');

  renderSummary();
  renderIssues();
  updateRhythm('#th-rhythm-before', '#th-rhythm-before-note', text, lang);
  recompute();
  notify(result.summary.total > 0 ? t('scanDone') : t('noIssues'), 'good');

  if (state.devMode) console.log('[TextHumanizer:Scan]', result);
}

function applyAllSafe() {
  for (const i of state.issues) if (i.safe) state.statusById.set(i.id, 'applied');
  renderIssues();
  recompute();
}

function applyAll() {
  for (const i of state.issues) {
    if (state.statusById.get(i.id) !== 'dismissed') state.statusById.set(i.id, 'applied');
  }
  renderIssues();
  recompute();
}

function resetIssues() {
  for (const i of state.issues) state.statusById.set(i.id, 'pending');
  renderIssues();
  recompute();
}

function copyOutput() {
  const out = $('#th-output');
  if (!out || !out.value) return;
  navigator.clipboard.writeText(out.value).then(() => notify(t('copied'), 'good'));
}

function clearAll() {
  $('#th-input').value = '';
  const outEl = $('#th-output');
  if (outEl) outEl.value = '';
  state.originalText = '';
  state.issues = [];
  state.statusById = new Map();
  clearChildren($('#th-issues'));
  clearChildren($('#th-diff'));
  setText($('#th-diff-stats'), '');
  $('#th-scan')?.setAttribute('hidden', '');
  $('#th-issues-block')?.setAttribute('hidden', '');
  updateCounts('#th-input', '#th-input-words', '#th-input-chars');
  updateCounts('#th-output', '#th-output-words', '#th-output-chars');
  ['#th-rhythm-before', '#th-rhythm-after'].forEach(s => setText($(s), '—'));
}

// ============================================================
// Deep Humanizer (experimental) — WebLLM worker, reverse-prompting.
// ============================================================

async function ensureWorker(modelKey) {
  if (state.worker && state.workerReady && state.modelKey === modelKey) return state.worker;
  if (state.worker) {
    try { state.worker.terminate(); } catch (_) {}
    state.worker = null;
    state.workerReady = false;
  }
  if (!('gpu' in navigator)) {
    notify(t('browserUnsupported'), 'bad');
    throw new Error('no_webgpu');
  }

  const workerUrl = new URL('./text-humanizer-worker.min.js', import.meta.url);
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

  w.addEventListener('error', (e) => log.error('worker.error', { message: e.message, filename: e.filename, lineno: e.lineno }));

  return new Promise((resolve, reject) => {
    const onMsg = (e) => {
      const m = e.data || {};
      switch (m.type) {
        case 'progress': {
          const pct = Math.round((m.progress || 0) * 100);
          const bar = $('#th-download-progress');
          if (bar) bar.style.width = pct + '%';
          setText($('#th-download-text'), m.text || (pct + '%'));
          break;
        }
        case 'ready':
          state.workerReady = true;
          state.workerLoading = false;
          $('#th-download-modal')?.classList.remove('open');
          notify(t('modelReady'), 'good');
          resolve(w);
          break;
        case 'error':
          state.workerReady = false;
          state.workerLoading = false;
          notify(m.error || 'error', 'bad');
          reject(new Error(m.error || 'init_failed'));
          break;
        case 'token':
          if (state.currentJob) state.currentJob.onToken(m);
          break;
        case 'generation-done':
          if (state.currentJob) state.currentJob.onDone(m);
          break;
        case 'generation-error':
          if (state.currentJob) state.currentJob.onError(m);
          break;
        case 'generation-cancelled':
          if (state.currentJob) state.currentJob.onCancel(m);
          break;
        default:
          log.debug('worker msg', m);
      }
    };
    w.addEventListener('message', onMsg);
    try { w.postMessage({ type: 'init', modelKey }); }
    catch (err) { log.error('postMessage(init) failed', err); reject(err); }
  });
}

function workerGenerate(messages, params) {
  return new Promise((resolve, reject) => {
    if (!state.worker || !state.workerReady) { reject(new Error('worker_not_ready')); return; }
    const requestId = 'r' + Date.now() + Math.random().toString(36).slice(2, 6);
    let aggregated = '';
    const onTokenCb = params.onToken;
    state.currentJob = {
      requestId,
      onToken: (m) => {
        if (m.requestId !== requestId) return;
        aggregated += m.text;
        if (onTokenCb) { try { onTokenCb(m.text, aggregated); } catch (_) {} }
      },
      onDone: (m) => { if (m.requestId !== requestId) return; state.currentJob = null; resolve(m.output || aggregated); },
      onError: (m) => { if (m.requestId !== requestId) return; state.currentJob = null; reject(new Error(m.error || 'generation_error')); },
      onCancel: () => { state.currentJob = null; reject(new Error('cancelled')); },
    };
    const serializableParams = { temperature: params.temperature, top_p: params.top_p, max_tokens: params.max_tokens };
    try { state.worker.postMessage({ type: 'generate', messages, params: serializableParams, requestId }); }
    catch (err) { state.currentJob = null; reject(err); }
  });
}

function cancelDeep() {
  if (state.worker) state.worker.postMessage({ type: 'cancel' });
}

async function runDeepHumanizer() {
  const inputEl = $('#th-input');
  const text = inputEl.value;
  if (!text || text.trim().length < 30) { notify(t('tooShort'), 'warn'); return; }

  const lang = langFromUI(text);
  const preset = $('#th-style')?.value || 'casual';
  const customPersona = $('#th-custom-persona')?.value?.trim() || null;

  const deepBtn = $('#th-deep-btn');
  const cancelBtn = $('#th-cancel-btn');
  if (deepBtn) deepBtn.disabled = true;
  if (cancelBtn) cancelBtn.hidden = false;
  $('#th-deep-status')?.classList.add('active');
  setText($('#th-deep-stage'), t('extracting'));
  setText($('#th-deep-progress'), '0%');

  try {
    if (!state.workerReady) {
      $('#th-download-modal')?.classList.add('open');
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

    let rebuildInput;
    if (shouldSkipExtract(text)) {
      rebuildInput = text;
    } else {
      const extractOutput = await workerGenerate(buildExtractMessages(text, lang), { temperature: 0.3, max_tokens: 1024, onToken });
      rebuildInput = validateExtractOutput(extractOutput) ? extractOutput : text;
    }

    setText($('#th-deep-stage'), t('rebuilding'));
    tokenCount = 0;
    const rebuildMessages = buildRebuildMessages(rebuildInput, lang, preset, customPersona);
    const maxTokens = Math.min(3000, Math.max(800, Math.ceil(text.length / 2)));
    let rebuildOutput = await workerGenerate(rebuildMessages, { temperature: 0.85, max_tokens: maxTokens, onToken });

    let validation = validateRebuildOutput(rebuildOutput, text);
    if (!validation.valid) {
      const retry = await workerGenerate(rebuildMessages, { temperature: 0.9, max_tokens: maxTokens, onToken });
      if (validateRebuildOutput(retry, text).valid || retry.length > rebuildOutput.length) rebuildOutput = retry;
    }

    const finalOut = rebuildOutput.trim();
    const outEl = $('#th-output');
    if (outEl) outEl.value = finalOut;
    updateCounts('#th-output', '#th-output-words', '#th-output-chars');
    updateRhythm('#th-rhythm-after', '#th-rhythm-after-note', finalOut, lang);
    renderDiff(text, finalOut);
    notify(t('deepDone'), 'good');
  } catch (err) {
    log.error('deep: error', { message: err.message });
    if (err.message === 'cancelled') notify(t('cancelled'), 'warn');
    else if (err.message !== 'no_webgpu') notify('Error: ' + err.message, 'bad');
  } finally {
    if (deepBtn) deepBtn.disabled = false;
    if (cancelBtn) cancelBtn.hidden = true;
    $('#th-deep-status')?.classList.remove('active');
  }
}

// ============================================================
// Wiring
// ============================================================

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
    }
  });
}

function setupEventListeners() {
  const inputEl = $('#th-input');
  const debouncedInputUpdate = debounce(() => {
    updateCounts('#th-input', '#th-input-words', '#th-input-chars');
    const text = inputEl.value;
    if (text.length > 30) updateRhythm('#th-rhythm-before', '#th-rhythm-before-note', text, langFromUI(text));
  }, 250);
  inputEl?.addEventListener('input', debouncedInputUpdate);

  $('#th-scan-btn')?.addEventListener('click', runScan);
  $('#th-clear-btn')?.addEventListener('click', clearAll);
  $('#th-copy-btn')?.addEventListener('click', copyOutput);
  $('#th-apply-safe')?.addEventListener('click', applyAllSafe);
  $('#th-apply-all')?.addEventListener('click', applyAll);
  $('#th-reset-issues')?.addEventListener('click', resetIssues);

  // Event delegation for the issues list.
  $('#th-issues')?.addEventListener('click', (e) => {
    const row = e.target.closest('.th-issue');
    if (!row) return;
    const issue = state.issues.find(i => i.id === row.dataset.id);
    if (!issue) return;
    const status = state.statusById.get(issue.id) || 'pending';

    if (e.target.closest('.th-issue__apply')) {
      setStatus(issue.id, status === 'applied' ? 'pending' : 'applied');
    } else if (e.target.closest('.th-issue__dismiss')) {
      setStatus(issue.id, status === 'dismissed' ? 'pending' : 'dismissed');
    } else if (e.target.closest('.th-issue__main')) {
      focusRange(issue);
    }
  });

  // Deep Humanizer (experimental)
  $('#th-deep-btn')?.addEventListener('click', runDeepHumanizer);
  $('#th-cancel-btn')?.addEventListener('click', cancelDeep);
  $('#th-download-cancel')?.addEventListener('click', () => {
    $('#th-download-modal')?.classList.remove('open');
    if (state.worker) {
      try { state.worker.terminate(); } catch (_) {}
      state.worker = null; state.workerReady = false; state.workerLoading = false;
    }
  });
  $('#th-model-select')?.addEventListener('change', (e) => {
    state.modelKey = e.target.value;
    if (state.worker) {
      state.worker.postMessage({ type: 'unload' });
      try { state.worker.terminate(); } catch (_) {}
      state.worker = null; state.workerReady = false;
    }
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
  labelEl.textContent = uiLang() === 'en' ? 'logs' : 'logi';
  summary.append(dot, count, document.createTextNode(' '), labelEl);

  const actions = document.createElement('div');
  actions.className = 'th-error-panel__actions';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'th-error-panel__btn';
  copyBtn.textContent = uiLang() === 'en' ? 'Copy' : 'Kopiuj';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(exportLogText()).then(
      () => notify(uiLang() === 'en' ? 'Logs copied' : 'Logi skopiowane', 'good'),
      (err) => { log.error('clipboard write failed', err); notify('clipboard error', 'bad'); }
    );
  });

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'th-error-panel__btn';
  clearBtn.textContent = uiLang() === 'en' ? 'Clear' : 'Wyczyść';
  clearBtn.addEventListener('click', () => { clearLog(); renderLogList(); updateBadge(); });

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
    panel.dataset.tone = errs > 0 ? 'error' : (warns > 0 ? 'warn' : 'info');
  }

  onLog(() => { updateBadge(); if (expanded) renderLogList(); });

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

  try { checkWebGPU(); } catch (err) { log.error('checkWebGPU failed', err); }
  try { setupHeaderDevMode(); } catch (err) { log.error('setupHeaderDevMode failed', err); }
  try { setupEventListeners(); } catch (err) { log.error('setupEventListeners failed', err); }
  try { setupErrorPanel(); } catch (err) { log.error('setupErrorPanel failed', err); }

  updateCounts('#th-input', '#th-input-words', '#th-input-chars');
  updateCounts('#th-output', '#th-output-words', '#th-output-chars');

  logEnvironment();
  logCssCheck(['body', '.th-main', '.th', '.th__pane', '.th__textarea', '.th-issues', '.th-issue', '#th-input']);
  log.info('init: done');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { runScan, runDeepHumanizer };
