// CSS Minifier & Prettifier — utility-first redesign
const { useState, useEffect, useRef, useMemo, useCallback } = React;

const ACCENT = '#22c55e';
const ACCENT_GLOW = 'rgba(34,197,94,.12)';
const ACCENT_BORDER = 'rgba(34,197,94,.32)';

const SAMPLE = `/* example: a button system */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  background: #3b82f6;
  color: #ffffff;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}
.btn--ghost {
  background: transparent;
  color: #3b82f6;
  border: 1px solid currentColor;
}

/* media queries */
@media (max-width: 768px) {
  .btn { padding: 8px 14px; font-size: 14px; }
}`;

// ============== Minify ==============
function cssMinify(src) {
  if (!src.trim()) return '';
  let s = src;
  // remove comments (preserve license comments /*! ... */)
  s = s.replace(/\/\*(?!!)[\s\S]*?\*\//g, '');
  // collapse whitespace
  s = s.replace(/\s+/g, ' ');
  // tighten around { } : ; ,
  s = s.replace(/\s*([{}:;,>+~])\s*/g, '$1');
  // remove trailing ; before }
  s = s.replace(/;}/g, '}');
  // lowercase hex colors and shorten 6→3 where possible
  s = s.replace(/#([0-9a-fA-F]{6})\b/g, (m, hex) => {
    const lower = hex.toLowerCase();
    if (lower[0] === lower[1] && lower[2] === lower[3] && lower[4] === lower[5]) {
      return '#' + lower[0] + lower[2] + lower[4];
    }
    return '#' + lower;
  });
  // 0px -> 0 (only for plain 0 with units)
  s = s.replace(/(^|[\s:,(])0(?:px|em|rem|%|pt|vh|vw|vmin|vmax|cm|mm|in|ex|pc|ch)\b/g, '$10');
  // remove leading zero in decimals
  s = s.replace(/(^|[\s:,(])0\.(\d)/g, '$1.$2');
  return s.trim();
}

// ============== Prettify ==============
function cssPrettify(src) {
  if (!src.trim()) return '';
  // Normalise first
  let s = src.replace(/\/\*[\s\S]*?\*\//g, m => '\u0000' + btoa(unescape(encodeURIComponent(m))) + '\u0001');
  s = s.replace(/\s+/g, ' ').trim();

  let out = '';
  let depth = 0;
  let i = 0;
  const indent = () => '  '.repeat(depth);

  while (i < s.length) {
    const ch = s[i];
    if (ch === '\u0000') {
      // restore comment
      const end = s.indexOf('\u0001', i);
      const enc = s.slice(i + 1, end);
      const comment = decodeURIComponent(escape(atob(enc)));
      out += (out && !out.endsWith('\n') ? '\n' : '') + indent() + comment + '\n';
      i = end + 1;
      // skip space after
      while (s[i] === ' ') i++;
      continue;
    }
    if (ch === '{') {
      out = out.replace(/\s+$/, '') + ' {\n';
      depth++;
      i++;
      while (s[i] === ' ') i++;
      continue;
    }
    if (ch === '}') {
      out = out.replace(/[\s;]+$/, '');
      depth = Math.max(0, depth - 1);
      out += '\n' + indent() + '}\n';
      i++;
      while (s[i] === ' ') i++;
      continue;
    }
    if (ch === ';') {
      out += ';\n';
      i++;
      while (s[i] === ' ') i++;
      // emit indent for next decl unless next is }
      if (s[i] && s[i] !== '}') out += indent();
      continue;
    }
    // start of a declaration / selector — make sure indent is set
    if (out.endsWith('\n')) out += indent();
    // selector segments around ',' should break
    if (ch === ',' && depth === 0) {
      out += ',\n' + indent();
      i++;
      while (s[i] === ' ') i++;
      continue;
    }
    out += ch;
    i++;
  }
  return out.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

const fmtBytes = b => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(2) + ' kB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
};

// ============== Top Nav ==============
const TopNav = () => (
  <nav style={M.nav}>
    <div style={M.navInner}>
      <FALogo size={22} />
      <div style={M.crumbs}>
        <a href="Tools.html" style={M.crumbLink}>Narzędzia</a>
        <span style={M.crumbSep}>/</span>
        <span style={M.crumbDim}>Web</span>
        <span style={M.crumbSep}>/</span>
        <span style={M.crumbCur}>CSS Minifier</span>
      </div>
      <div style={M.navRight}>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={M.navGh}>GitHub ↗</a>
      </div>
    </div>
  </nav>
);

// ============== Top bar (mode + actions + stats) ==============
const ToolBar = ({ mode, setMode, onClear, onPaste, onProcess, hasInput, inSize, outSize }) => {
  const savings = inSize > 0 && outSize > 0 ? ((1 - outSize / inSize) * 100) : 0;
  const isMin = mode === 'minify';

  return (
    <div style={M.toolbar}>
      <div style={M.tbLeft}>
        <div style={M.tbGroup}>
          <span style={M.tbLabel}>TRYB</span>
          <div style={M.segRow}>
            <button onClick={() => setMode('minify')}
              style={{...M.segBtn, ...(isMin ? M.segBtnActive : {})}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14"/><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/>
              </svg>
              Minify
              <span style={M.segKbd}>⌘1</span>
            </button>
            <button onClick={() => setMode('prettify')}
              style={{...M.segBtn, ...(!isMin ? M.segBtnActive : {})}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 5H21"/><path d="M9 12H21"/><path d="M9 19H21"/><path d="M5 5h.01"/><path d="M5 12h.01"/><path d="M5 19h.01"/>
              </svg>
              Prettify
              <span style={M.segKbd}>⌘2</span>
            </button>
          </div>
        </div>

        <button onClick={onPaste} style={M.actionBtn} title="Wklej ze schowka">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          </svg>
          Wklej <span style={M.kbd}>⌘⇧V</span>
        </button>

        <button onClick={onClear} style={M.actionBtn} disabled={!hasInput}>
          Wyczyść <span style={M.kbd}>⌘⇧X</span>
        </button>
      </div>

      <div style={M.tbRight}>
        {hasInput && (
          <>
            <div style={M.statBlock}>
              <div style={M.statLabel}>wejście</div>
              <div style={M.statVal}>{fmtBytes(inSize)}</div>
            </div>
            <div style={M.statBlock}>
              <div style={M.statLabel}>wynik</div>
              <div style={M.statVal}>{fmtBytes(outSize)}</div>
            </div>
            {isMin && outSize > 0 && (
              <div style={M.statBlock}>
                <div style={M.statLabel}>oszczędność</div>
                <div style={{...M.statVal, color: savings > 0 ? ACCENT : '#f59e0b'}}>
                  {savings > 0 ? '−' : '+'}{Math.abs(savings).toFixed(1)}%
                </div>
              </div>
            )}
          </>
        )}
        <button onClick={onProcess} disabled={!hasInput} style={{...M.processBtn, ...(hasInput ? {} : M.processBtnDis)}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
          </svg>
          Przetwórz <span style={M.kbd}>⌘↵</span>
        </button>
      </div>
    </div>
  );
};

// ============== Pane ==============
const Pane = ({ side, title, sub, actions, children }) => (
  <section style={{...M.pane, ...(side === 'output' ? M.paneOut : {})}}>
    <header style={M.paneHead}>
      <div style={M.paneHeadLeft}>
        <div style={M.paneIndex}>{side === 'input' ? '01' : '02'}</div>
        <div>
          <div style={M.paneTitle}>{title}</div>
          {sub && <div style={M.paneSub}>{sub}</div>}
        </div>
      </div>
      <div style={M.paneActions}>{actions}</div>
    </header>
    <div style={M.paneBody}>{children}</div>
  </section>
);

const PaneBtn = ({ onClick, kbd, disabled, children, primary }) => (
  <button onClick={onClick} disabled={disabled}
    style={{...M.paneBtn, ...(primary ? M.paneBtnPrimary : {}), ...(disabled ? M.paneBtnDis : {})}}>
    {children}
    {kbd && <span style={M.paneBtnKbd}>{kbd}</span>}
  </button>
);

// ============== Output empty ==============
const OutputEmpty = ({ mode }) => (
  <div style={M.empty}>
    <div style={M.emptyMark}>↘</div>
    <div style={M.emptyText}>
      Wynik pojawi się tutaj automatycznie. Wklej CSS po lewej —
      narzędzie {mode === 'minify' ? <span style={{color: ACCENT}}>minifikuje</span> : <span style={{color: ACCENT}}>formatuje</span>} na bieżąco.
    </div>
    <div style={M.emptyHints}>
      <span style={M.emptyHint}><kbd style={M.kbdInline}>⌘⇧V</kbd> wklej</span>
      <span style={M.emptyHint}><kbd style={M.kbdInline}>⌘1</kbd> minify</span>
      <span style={M.emptyHint}><kbd style={M.kbdInline}>⌘2</kbd> prettify</span>
      <span style={M.emptyHint}><kbd style={M.kbdInline}>⌘⇧C</kbd> kopiuj</span>
    </div>
  </div>
);

// ============== Main ==============
const App = () => {
  const [mode, setMode] = useState('minify');
  const [input, setInput] = useState('');
  const [auto, setAuto] = useState(true);
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return mode === 'minify' ? cssMinify(input) : cssPrettify(input);
    } catch (e) {
      return '/* error: ' + e.message + ' */';
    }
  }, [input, mode]);

  const inSize = new Blob([input]).size;
  const outSize = new Blob([output]).size;

  // Process trigger (mostly informative — output is auto)
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

  const onClear = () => setInput('');

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
    const ext = mode === 'minify' ? '.min.css' : '.css';
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'styles' + ext; a.click();
    URL.revokeObjectURL(url);
  };

  const onSample = () => setInput(SAMPLE);

  // Keyboard
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
    <div style={M.page}>
      <TopNav />

      <header style={M.header}>
        <div style={M.headerInner}>
          <div style={M.headerEyebrow}>WEB · KOMPRESJA</div>
          <h1 style={M.headerTitle}>CSS Minifier <span style={M.headerSlash}>·</span> Prettifier</h1>
          <p style={M.headerSub}>
            Wklej arkusz, dostań <strong>czystą minifikację</strong> albo <strong>czytelne formatowanie</strong>. Bez serwera.
            <span style={M.headerLock}>● 0 żądań</span>
          </p>
        </div>
      </header>

      <ToolBar
        mode={mode} setMode={setMode}
        onPaste={onPaste} onClear={onClear}
        onProcess={onProcess}
        hasInput={!!input.trim()}
        inSize={inSize} outSize={outSize}
      />

      <main style={M.main}>
        <div style={M.grid}>
          <Pane
            side="input"
            title="Wejście"
            sub="wklej tu CSS — działa na bieżąco"
            actions={
              !input ? (
                <PaneBtn onClick={onSample}>Wczytaj przykład</PaneBtn>
              ) : (
                <>
                  <PaneBtn onClick={onClear}>Wyczyść</PaneBtn>
                </>
              )
            }
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="/* wklej kod CSS tutaj — albo Cmd+⇧+V */"
              style={M.textarea}
              spellCheck={false}
            />
          </Pane>

          <Pane
            side="output"
            title={mode === 'minify' ? 'Zminifikowane' : 'Sformatowane'}
            sub={output ? `${fmtBytes(outSize)} · ${output.split('\n').length} linii` : '—'}
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
            {output ? (
              <pre style={{...M.outputCode, ...(pulse ? M.outputPulse : {})}}>{output}</pre>
            ) : (
              <OutputEmpty mode={mode} />
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
  <div style={M.manifest}>
    <div style={M.manItem}>
      <span style={M.manKey}>Lokalnie</span>
      <span style={M.manVal}>parser działa w przeglądarce, 0 żądań do serwera</span>
    </div>
    <div style={M.manItem}>
      <span style={M.manKey}>Bezpiecznie</span>
      <span style={M.manVal}>zachowuje <code style={M.manCode}>/*! ... */</code> jako licencję, lowercase hex, skraca <code style={M.manCode}>#aabbcc → #abc</code></span>
    </div>
    <div style={M.manItem}>
      <span style={M.manKey}>Open</span>
      <span style={M.manVal}>kod na <a href="https://github.com/AdamSzczotka/formattedai" style={M.manLink} target="_blank" rel="noopener">GitHubie ↗</a></span>
    </div>
  </div>
);

const Footer = () => (
  <footer style={M.foot}>
    <div style={M.footInner}>
      <div style={M.footLeft}>
        <FALogo size={18} />
        <span style={M.footSep}>·</span>
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={M.footLink}>adamszczotka.dev ↗</a>
      </div>
      <div style={M.footRight}>
        <a href="Tools.html" style={M.footLink}>Wszystkie narzędzia</a>
        <a href="Articles.html" style={M.footLink}>Dziennik</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={M.footLink}>GitHub ↗</a>
      </div>
    </div>
  </footer>
);

// ============== Styles ==============
const M = {
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

  header: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(34,197,94,.04), transparent)' },
  headerInner: { maxWidth: 1600, margin: '0 auto', padding: '36px 32px 28px', maxWidth: 1600 },
  headerEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 12 },
  headerTitle: { fontFamily: '"Fraunces", serif', fontSize: 48, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 },
  headerSlash: { color: 'rgba(255,255,255,.3)', fontWeight: 400 },
  headerSub: { fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', marginTop: 12, marginBottom: 0, maxWidth: 720 },
  headerLock: { color: ACCENT, fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginLeft: 10 },

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
  processBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: ACCENT, color: '#0a1f12', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  processBtnDis: { opacity: 0.4, cursor: 'not-allowed' },

  main: { flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto', padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 28 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 'calc(100vh - 360px)' },

  pane: { display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden', minHeight: 480 },
  paneOut: { borderColor: 'rgba(34,197,94,.12)', background: 'rgba(34,197,94,.025)' },
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

  textarea: { flex: 1, width: '100%', padding: '18px 18px', background: 'transparent', border: 'none', outline: 'none', color: '#e8e8ec', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.6, resize: 'none', minHeight: 420 },
  outputCode: { flex: 1, margin: 0, padding: '18px 18px', background: 'transparent', color: '#e8e8ec', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflow: 'auto', minHeight: 420, transition: 'background .25s' },
  outputPulse: { background: 'rgba(34,197,94,.06)' },

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
