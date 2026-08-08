const BUFFER_LIMIT = 300;
const buffer = [];
const listeners = new Set();

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
let minLevel = LEVELS.debug;

function fmtArg(a) {
  if (a instanceof Error) return a.stack || a.message || String(a);
  if (typeof a === 'object') {
    try { return JSON.stringify(a, null, 2); } catch (_) { return String(a); }
  }
  return String(a);
}

function emit(level, scope, args) {
  if (LEVELS[level] < minLevel) return;
  const entry = {
    t: new Date().toISOString(),
    level,
    scope,
    msg: args.map(fmtArg).join(' '),
  };
  buffer.push(entry);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();

  const tag = `[TH:${scope}]`;
  const fn = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  try { console[fn](tag, ...args); } catch (_) {}

  for (const cb of listeners) {
    try { cb(entry); } catch (_) {}
  }
}

export function createLogger(scope) {
  return {
    debug: (...a) => emit('debug', scope, a),
    info:  (...a) => emit('info',  scope, a),
    warn:  (...a) => emit('warn',  scope, a),
    error: (...a) => emit('error', scope, a),
  };
}

export function getLog() {
  return buffer.slice();
}

export function clearLog() {
  buffer.length = 0;
}

export function onLog(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function exportLogText() {
  return buffer.map(e => `${e.t} [${e.level.toUpperCase()}] [${e.scope}] ${e.msg}`).join('\n');
}

export function setMinLevel(level) {
  if (LEVELS[level] !== undefined) minLevel = LEVELS[level];
}

const globalLog = createLogger('global');

export function installGlobalHandlers() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (e) => {
    const detail = {
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack,
    };
    globalLog.error('window.error', detail);
  });

  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const detail = reason instanceof Error
      ? { message: reason.message, stack: reason.stack }
      : { reason: fmtArg(reason) };
    globalLog.error('unhandledrejection', detail);
  });
}

export function logEnvironment() {
  if (typeof window === 'undefined') return;
  const env = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    viewport: { w: window.innerWidth, h: window.innerHeight },
    devicePixelRatio: window.devicePixelRatio,
    webgpu: 'gpu' in navigator,
    serviceWorker: 'serviceWorker' in navigator,
    theme: document.documentElement.getAttribute('data-theme') || 'unset',
    htmlLang: document.documentElement.lang,
    url: window.location.href,
  };
  globalLog.info('environment', env);
}

export function logCssCheck(selectorSamples) {
  if (typeof window === 'undefined' || !document.body) return;
  const results = {};
  for (const sel of selectorSamples) {
    const el = document.querySelector(sel);
    if (!el) { results[sel] = 'NOT_FOUND'; continue; }
    const cs = window.getComputedStyle(el);
    results[sel] = {
      width: el.offsetWidth,
      height: el.offsetHeight,
      display: cs.display,
      gridTemplateColumns: cs.gridTemplateColumns,
      flexDirection: cs.flexDirection,
      maxWidth: cs.maxWidth,
      padding: cs.padding,
    };
  }
  globalLog.info('css-check', results);
}
