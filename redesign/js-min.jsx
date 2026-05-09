// JS Minifier & Prettifier — utility-first redesign (mirror CSS Minifier, violet accent)
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const ACCENT = '#a78bfa';
const ACCENT_GLOW = 'rgba(167,139,250,.12)';
const ACCENT_BORDER = 'rgba(167,139,250,.32)';

const SAMPLE = `// example: tiny event bus
class EventBus {
  constructor() {
    this.handlers = new Map();
  }
  on(event, fn) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    this.handlers.get(event)?.delete(fn);
  }
  emit(event, payload) {
    this.handlers.get(event)?.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        console.error('handler error', e);
      }
    });
  }
}

const bus = new EventBus();
bus.on('hello', (name) => console.log('hi ' + name));
bus.emit('hello', 'world');
`;

// ============== Engines ==============
async function jsMinify(src) {
  if (!src.trim()) return '';
  if (!window.Terser) throw new Error('Terser nie załadowany');
  const result = await window.Terser.minify(src, {
    compress: { passes: 2 },
    mangle: true,
    format: { comments: /^!/ }, // preserve /*! ... */
  });
  if (result.error) throw result.error;
  return result.code || '';
}

function jsPrettify(src) {
  if (!src.trim()) return '';
  // js-beautify exposes either window.js_beautify or window.beautifier.js (UMD bundle)
  const beautifier = window.js_beautify || (window.beautifier && (window.beautifier.js || window.beautifier.js_beautify));
  if (!beautifier) throw new Error('js-beautify nie załadowany');
  return beautifier(src, {
    indent_size: 2,
    space_in_empty_paren: false,
    preserve_newlines: true,
    max_preserve_newlines: 2,
    end_with_newline: true,
    brace_style: 'collapse',
  });
}

const fmtBytes = b => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(2) + ' kB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
};

// ============== Top Nav ==============
const TopNav = () => (
  <nav style={J.nav}>
    <div style={J.navInner}>
      <FALogo size={22} />
      <div style={J.crumbs}>
        <a href="Tools.html" style={J.crumbLink}>Narzędzia</a>
        <span style={J.crumbSep}>/</span>
        <span style={J.crumbDim}>Web</span>
        <span style={J.crumbSep}>/</span>
        <span style={J.crumbCur}>JS Minifier</span>
      </div>
      <div style={J.navRight}>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={J.navGh}>GitHub ↗</a>
      </div>
    </div>
  </nav>
);

// ============== Tool Bar ==============
const ToolBar = ({ mode, setMode, onClear, onPaste, onProcess, hasInput, inSize, outSize, processing }) => {
  const savings = inSize > 0 && outSize > 0 ? ((1 - outSize / inSize) * 100) : 0;
  const isMin = mode === 'minify';

  return (
    <div style={J.toolbar}>
      <div style={J.tbLeft}>
        <div style={J.tbGroup}>
          <span style={J.tbLabel}>TRYB</span>
          <div style={J.segRow}>
            <button onClick={() => setMode('minify')}
              style={{...J.segBtn, ...(isMin ? J.segBtnActive : {})}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>
              </svg>
              Minify <span style={J.segKbd}>⌘1</span>
            </button>
            <button onClick={() => setMode('prettify')}
              style={{...J.segBtn, ...(!isMin ? J.segBtnActive : {})}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 5H21"/><path d="M9 12H21"/><path d="M9 19H21"/><path d="M5 5h.01"/><path d="M5 12h.01"/><path d="M5 19h.01"/>
              </svg>
              Prettify <span style={J.segKbd}>⌘2</span>
            </button>
          </div>
        </div>

        <button onClick={onPaste} style={J.actionBtn} title="Wklej ze schowka">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          </svg>
          Wklej <span style={J.kbd}>⌘⇧V</span>
        </button>
        <button onClick={onClear} style={J.actionBtn} disabled={!hasInput}>
          Wyczyść <span style={J.kbd}>⌘⇧X</span>
        </button>
      </div>

      <div style={J.tbRight}>
        {hasInput && (
          <>
            <div style={J.statBlock}>
              <div style={J.statLabel}>wejście</div>
              <div style={J.statVal}>{fmtBytes(inSize)}</div>
            </div>
            <div style={J.statBlock}>
              <div style={J.statLabel}>wynik</div>
              <div style={J.statVal}>{processing ? '…' : fmtBytes(outSize)}</div>
            </div>
            {isMin && outSize > 0 && (
              <div style={J.statBlock}>
                <div style={J.statLabel}>oszczędność</div>
                <div style={{...J.statVal, color: savings > 0 ? ACCENT : '#f59e0b'}}>
                  {savings > 0 ? '−' : '+'}{Math.abs(savings).toFixed(1)}%
                </div>
              </div>
            )}
          </>
        )}
        <button onClick={onProcess} disabled={!hasInput || processing} style={{...J.processBtn, ...(hasInput && !processing ? {} : J.processBtnDis)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
          </svg>
          {processing ? 'Przetwarzanie…' : 'Przetwórz'} <span style={J.kbd}>⌘↵</span>
        </button>
      </div>
    </div>
  );
};

// ============== Pane ==============
const Pane = ({ side, title, sub, actions, children }) => (
  <section style={{...J.pane, ...(side === 'output' ? J.paneOut : {})}}>
    <header style={J.paneHead}>
      <div style={J.paneHeadLeft}>
        <div style={J.paneIndex}>{side === 'input' ? '01' : '02'}</div>
        <div>
          <div style={J.paneTitle}>{title}</div>
          {sub && <div style={J.paneSub}>{sub}</div>}
        </div>
      </div>
      <div style={J.paneActions}>{actions}</div>
    </header>
    <div style={J.paneBody}>{children}</div>
  </section>
);

const PaneBtn = ({ onClick, kbd, disabled, children, primary }) => (
  <button onClick={onClick} disabled={disabled}
    style={{...J.paneBtn, ...(primary ? J.paneBtnPrimary : {}), ...(disabled ? J.paneBtnDis : {})}}>
    {children}
    {kbd && <span style={J.paneBtnKbd}>{kbd}</span>}
  </button>
);

const OutputEmpty = ({ mode, libsReady }) => (
  <div style={J.empty}>
    <div style={J.emptyMark}>↘</div>
    <div style={J.emptyText}>
      {!libsReady ? (
        <>Ładowanie silnika <strong style={{color: ACCENT}}>Terser + js-beautify</strong>…</>
      ) : (
        <>Wynik pojawi się tutaj. Wklej JS po lewej —
        narzędzie {mode === 'minify' ? <span style={{color: ACCENT}}>minifikuje (Terser)</span> : <span style={{color: ACCENT}}>formatuje (js-beautify)</span>}.</>
      )}
    </div>
    <div style={J.emptyHints}>
      <span style={J.emptyHint}><kbd style={J.kbdInline}>⌘⇧V</kbd> wklej</span>
      <span style={J.emptyHint}><kbd style={J.kbdInline}>⌘1</kbd> minify</span>
      <span style={J.emptyHint}><kbd style={J.kbdInline}>⌘2</kbd> prettify</span>
      <span style={J.emptyHint}><kbd style={J.kbdInline}>⌘⇧C</kbd> kopiuj</span>
    </div>
  </div>
);

// ============== Main ==============
const App = () => {
  const [mode, setMode] = useState('minify');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [libsReady, setLibsReady] = useState(false);

  // Wait for terser/js-beautify (CDN script load may be after React mounts)
  useEffect(() => {
    let timeout;
    const check = () => {
      const ok = !!window.Terser && !!(window.js_beautify || window.beautifier);
      if (ok) setLibsReady(true);
      else timeout = setTimeout(check, 200);
    };
    check();
    return () => clearTimeout(timeout);
  }, []);

  // Run engine when input/mode changes (debounced)
  const runRef = useRef(null);
  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(null); return; }
    if (!libsReady) return;
    if (runRef.current) clearTimeout(runRef.current);
    setProcessing(true);
    runRef.current = setTimeout(async () => {
      try {
        const result = mode === 'minify' ? await jsMinify(input) : jsPrettify(input);
        setOutput(result);
        setError(null);
      } catch (e) {
        setError(e.message || String(e));
        setOutput('');
      } finally {
        setProcessing(false);
      }
    }, 250);
    return () => clearTimeout(runRef.current);
  }, [input, mode, libsReady]);

  const inSize = new Blob([input]).size;
  const outSize = new Blob([output]).size;

  const onProcess = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  };

  const onPaste = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setInput(txt);
    } catch {
      alert('Nie udało się odczytać schowka — wklej ręcznie ⌘V w pole.');
    }
  };
  const onClear = () => { setInput(''); setOutput(''); setError(null); };
  const onCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  const onDownload = () => {
    if (!output) return;
    const ext = mode === 'minify' ? '.min.js' : '.js';
    const blob = new Blob([output], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'script' + ext; a.click();
    URL.revokeObjectURL(url);
  };
  const onSample = () => setInput(SAMPLE);

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === '1') { e.preventDefault(); setMode('minify'); return; }
      if (meta && e.key === '2') { e.preventDefault(); setMode('prettify'); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'v') { e.preventDefault(); onPaste(); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); onCopy(); return; }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); onClear(); return; }
      if (meta && e.key === 'Enter') { e.preventDefault(); onProcess(); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [output]);

  return (
    <div style={J.page}>
      <TopNav />

      <header style={J.header}>
        <div style={J.headerInner}>
          <div style={J.headerEyebrow}>WEB · KOMPRESJA</div>
          <h1 style={J.headerTitle}>JS Minifier <span style={J.headerSlash}>·</span> Prettifier</h1>
          <p style={J.headerSub}>
            Minifikacja przez <strong>Terser</strong> (compress + mangle), formatowanie przez <strong>js-beautify</strong>.
            Wszystko działa lokalnie w Twojej przeglądarce.
            <span style={J.headerLock}>● 0 żądań</span>
          </p>
        </div>
      </header>

      <ToolBar
        mode={mode} setMode={setMode}
        onPaste={onPaste} onClear={onClear}
        onProcess={onProcess}
        hasInput={!!input.trim()}
        inSize={inSize} outSize={outSize}
        processing={processing}
      />

      <main style={J.main}>
        <div style={J.grid}>
          <Pane
            side="input"
            title="Wejście"
            sub="wklej tu kod JS — działa na bieżąco"
            actions={
              !input ? (
                <PaneBtn onClick={onSample}>Wczytaj przykład</PaneBtn>
              ) : (
                <PaneBtn onClick={onClear}>Wyczyść</PaneBtn>
              )
            }
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="// wklej kod JavaScript tutaj — albo Cmd+⇧+V"
              style={J.textarea}
              spellCheck={false}
            />
          </Pane>

          <Pane
            side="output"
            title={mode === 'minify' ? 'Zminifikowane' : 'Sformatowane'}
            sub={output ? `${fmtBytes(outSize)} · ${output.split('\n').length} linii` : (error ? 'błąd' : '—')}
            actions={
              output ? (
                <>
                  <PaneBtn onClick={onDownload}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Pobierz
                  </PaneBtn>
                  <PaneBtn onClick={onCopy} primary kbd="⌘⇧C">
                    {copied ? '✓ Skopiowano' : 'Kopiuj'}
                  </PaneBtn>
                </>
              ) : null
            }
          >
            {error ? (
              <div style={J.errorBox}>
                <div style={J.errorLabel}>BŁĄD PARSOWANIA</div>
                <pre style={J.errorMsg}>{error}</pre>
                <div style={J.errorHint}>Sprawdź składnię — Terser nie strawi nieprawidłowego JS.</div>
              </div>
            ) : output ? (
              <pre style={{...J.outputCode, ...(pulse ? J.outputPulse : {})}}>{output}</pre>
            ) : (
              <OutputEmpty mode={mode} libsReady={libsReady} />
            )}
          </Pane>
        </div>

        <ManifestStrip />
      </main>

      <Footer />
    </div>
  );
};

const ManifestStrip = () => (
  <div style={J.manifest}>
    <div style={J.manItem}>
      <span style={J.manKey}>Lokalnie</span>
      <span style={J.manVal}>Terser + js-beautify w przeglądarce, 0 żądań do API</span>
    </div>
    <div style={J.manItem}>
      <span style={J.manKey}>Solidnie</span>
      <span style={J.manVal}>compress + mangle (2 passes), zachowuje <code style={J.manCode}>/*! ... */</code></span>
    </div>
    <div style={J.manItem}>
      <span style={J.manKey}>Open</span>
      <span style={J.manVal}>kod na <a href="https://github.com/AdamSzczotka/formattedai" style={J.manLink} target="_blank" rel="noopener">GitHubie ↗</a></span>
    </div>
  </div>
);

const Footer = () => (
  <footer style={J.foot}>
    <div style={J.footInner}>
      <div style={J.footLeft}>
        <FALogo size={18} />
        <span style={J.footSep}>·</span>
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={J.footLink}>adamszczotka.dev ↗</a>
      </div>
      <div style={J.footRight}>
        <a href="Tools.html" style={J.footLink}>Wszystkie narzędzia</a>
        <a href="Articles.html" style={J.footLink}>Dziennik</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={J.footLink}>GitHub ↗</a>
      </div>
    </div>
  </footer>
);

// ============== Styles ==============
const J = {
  page: { minHeight: '100vh', background: '#08080c', color: '#f0f0f4', fontFamily: '"Inter", sans-serif', display: 'flex', flexDirection: 'column' },

  nav: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 },
  navInner: { maxWidth: 1600, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
  crumbs: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  crumbLink: { color: 'rgba(255,255,255,.5)', textDecoration: 'none' },
  crumbSep: { color: 'rgba(255,255,255,.25)' },
  crumbDim: { color: 'rgba(255,255,255,.45)' },
  crumbCur: { color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 },
  navGh: { color: 'rgba(255,255,255,.6)', textDecoration: 'none' },

  header: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(167,139,250,.05), transparent)' },
  headerInner: { maxWidth: 1600, margin: '0 auto', padding: '36px 32px 28px' },
  headerEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 12 },
  headerTitle: { fontFamily: '"Fraunces", serif', fontSize: 48, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 },
  headerSlash: { color: 'rgba(255,255,255,.3)', fontWeight: 400 },
  headerSub: { fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', marginTop: 12, marginBottom: 0, maxWidth: 720 },
  headerLock: { color: '#22c55e', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginLeft: 10 },

  toolbar: { position: 'sticky', top: 53, zIndex: 25, background: 'rgba(12,12,18,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
  tbLeft: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 10 },
  tbLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.18em' },
  segRow: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' },
  segBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 5, border: 'none', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' },
  segBtnActive: { background: ACCENT_GLOW, color: '#fff', boxShadow: `inset 0 0 0 1px ${ACCENT_BORDER}` },
  segKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', marginLeft: 4 },

  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  kbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 5px', background: 'rgba(0,0,0,.25)', borderRadius: 3, opacity: 0.7 },

  tbRight: { display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' },
  statBlock: { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.15em', textTransform: 'uppercase' },
  statVal: { fontSize: 14, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' },
  processBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: ACCENT, color: '#1a0d2e', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  processBtnDis: { opacity: 0.4, cursor: 'not-allowed' },

  main: { flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto', padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 28 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 'calc(100vh - 360px)' },

  pane: { display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden', minHeight: 480 },
  paneOut: { borderColor: 'rgba(167,139,250,.12)', background: 'rgba(167,139,250,.025)' },
  paneHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 16 },
  paneHeadLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  paneIndex: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '0.15em' },
  paneTitle: { fontSize: 14, fontWeight: 600 },
  paneSub: { fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(255,255,255,.4)', marginTop: 2 },
  paneActions: { display: 'flex', gap: 6 },
  paneBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  paneBtnPrimary: { background: ACCENT_GLOW, color: ACCENT, borderColor: ACCENT_BORDER },
  paneBtnDis: { opacity: 0.4, cursor: 'not-allowed' },
  paneBtnKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, opacity: 0.6, marginLeft: 4 },
  paneBody: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' },

  textarea: { flex: 1, width: '100%', padding: '18px', background: 'transparent', border: 'none', outline: 'none', color: '#e8e8ec', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.6, resize: 'none', minHeight: 420 },
  outputCode: { flex: 1, margin: 0, padding: '18px', background: 'transparent', color: '#e8e8ec', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'auto', minHeight: 420, transition: 'background .25s' },
  outputPulse: { background: 'rgba(167,139,250,.06)' },

  errorBox: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 10 },
  errorLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#ef4444', letterSpacing: '0.18em' },
  errorMsg: { margin: 0, padding: '12px 16px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, color: '#fca5a5', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-wrap' },
  errorHint: { fontSize: 12, color: 'rgba(255,255,255,.5)' },

  empty: { padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'rgba(255,255,255,.55)', textAlign: 'center' },
  emptyMark: { fontSize: 44, color: 'rgba(255,255,255,.2)', fontFamily: '"Fraunces", serif' },
  emptyText: { fontSize: 14, lineHeight: 1.55, maxWidth: 380 },
  emptyHints: { display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 },
  emptyHint: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)' },
  kbdInline: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,.08)', borderRadius: 4, color: '#fff' },

  manifest: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,.06)' },
  manItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  manKey: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.15em' },
  manVal: { fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 },
  manCode: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, padding: '1px 5px', background: 'rgba(255,255,255,.06)', borderRadius: 3 },
  manLink: { color: ACCENT, textDecoration: 'none' },

  foot: { borderTop: '1px solid rgba(255,255,255,.06)' },
  footInner: { maxWidth: 1600, margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  footLeft: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.5)' },
  footRight: { display: 'flex', gap: 20, fontSize: 13 },
  footSep: { color: 'rgba(255,255,255,.25)' },
  footLink: { color: 'rgba(255,255,255,.6)', textDecoration: 'none' },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
