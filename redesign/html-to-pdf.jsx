// HTML → PDF — utility-first, rose accent
const { useState, useEffect, useRef, useCallback } = React;

const ACCENT = '#fb7185';
const ACCENT_GLOW = 'rgba(251,113,133,.12)';
const ACCENT_BORDER = 'rgba(251,113,133,.32)';

const SAMPLE = `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Georgia, serif; padding: 48px; color: #1a1a1a; max-width: 640px; margin: 0 auto; }
  h1 { font-size: 32px; margin: 0 0 8px; letter-spacing: -0.02em; }
  .meta { color: #888; font-size: 13px; margin-bottom: 32px; border-bottom: 1px solid #eee; padding-bottom: 16px; }
  h2 { font-size: 20px; margin-top: 32px; }
  p { line-height: 1.65; font-size: 15px; }
  blockquote { border-left: 3px solid #fb7185; padding-left: 16px; color: #555; font-style: italic; margin: 24px 0; }
</style>
</head>
<body>
<h1>Faktura FV/2025/11/042</h1>
<div class="meta">Wystawiona 12 listopada 2025 · Termin 26 listopada 2025</div>

<h2>Pozycje</h2>
<p>1× Konsultacja designerska · 8h · 1200 zł</p>
<p>1× Iteracja prototypu · 320 zł</p>

<blockquote>Razem netto: <strong>1520 zł</strong> · VAT 23%: 349,60 zł · Razem brutto: <strong>1869,60 zł</strong></blockquote>

<h2>Dane do przelewu</h2>
<p>Adam Szczotka · PL 12 3456 7890 1234 5678 9012 3456</p>
</body>
</html>`;

const PAPER = {
  a4:     { name: 'A4',     w: 210, h: 297, unit: 'mm' },
  letter: { name: 'Letter', w: 8.5, h: 11,  unit: 'in' },
  a5:     { name: 'A5',     w: 148, h: 210, unit: 'mm' },
};

// ============== Top Nav ==============
const TopNav = () => (
  <nav style={H.nav}>
    <div style={H.navInner}>
      <FALogo size={22} />
      <div style={H.crumbs}>
        <a href="Tools.html" style={H.crumbLink}>Narzędzia</a>
        <span style={H.crumbSep}>/</span>
        <span style={H.crumbDim}>Web</span>
        <span style={H.crumbSep}>/</span>
        <span style={H.crumbCur}>HTML → PDF</span>
      </div>
      <div style={H.navRight}>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={H.navGh}>GitHub ↗</a>
      </div>
    </div>
  </nav>
);

// ============== Tool Bar ==============
const ToolBar = ({ paper, setPaper, orientation, setOrientation, margin, setMargin, scale, setScale, onPaste, onClear, hasInput, onDownload, processing }) => (
  <div style={H.toolbar}>
    <div style={H.tbLeft}>
      <div style={H.tbGroup}>
        <span style={H.tbLabel}>FORMAT</span>
        <div style={H.segRow}>
          {Object.entries(PAPER).map(([k, p]) => (
            <button key={k} onClick={() => setPaper(k)}
              style={{...H.segBtn, ...(paper === k ? H.segBtnActive : {})}}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div style={H.tbGroup}>
        <span style={H.tbLabel}>ORIENT.</span>
        <div style={H.segRow}>
          <button onClick={() => setOrientation('portrait')}
            style={{...H.segBtn, ...(orientation === 'portrait' ? H.segBtnActive : {})}}>
            Portret
          </button>
          <button onClick={() => setOrientation('landscape')}
            style={{...H.segBtn, ...(orientation === 'landscape' ? H.segBtnActive : {})}}>
            Pejzaż
          </button>
        </div>
      </div>

      <div style={H.tbGroup}>
        <span style={H.tbLabel}>MARGINES</span>
        <input type="range" min="0" max="40" step="2" value={margin}
          onChange={e => setMargin(+e.target.value)} style={H.slider} />
        <span style={H.sliderVal}>{margin} mm</span>
      </div>

      <div style={H.tbGroup}>
        <span style={H.tbLabel}>SKALA</span>
        <input type="range" min="0.5" max="1.5" step="0.05" value={scale}
          onChange={e => setScale(+e.target.value)} style={H.slider} />
        <span style={H.sliderVal}>{scale.toFixed(2)}×</span>
      </div>
    </div>

    <div style={H.tbRight}>
      <button onClick={onPaste} style={H.actionBtn}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        </svg>
        Wklej
      </button>
      <button onClick={onClear} style={H.actionBtn} disabled={!hasInput}>Wyczyść</button>
      <button onClick={onDownload} disabled={!hasInput || processing} style={{...H.processBtn, ...(hasInput && !processing ? {} : H.processBtnDis)}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        {processing ? 'Generowanie…' : 'Pobierz PDF'} <span style={H.kbd}>⌘↵</span>
      </button>
    </div>
  </div>
);

// ============== Pane ==============
const Pane = ({ side, title, sub, actions, children }) => (
  <section style={{...H.pane, ...(side === 'output' ? H.paneOut : {})}}>
    <header style={H.paneHead}>
      <div style={H.paneHeadLeft}>
        <div style={H.paneIndex}>{side === 'input' ? '01' : '02'}</div>
        <div>
          <div style={H.paneTitle}>{title}</div>
          {sub && <div style={H.paneSub}>{sub}</div>}
        </div>
      </div>
      <div style={H.paneActions}>{actions}</div>
    </header>
    <div style={H.paneBody}>{children}</div>
  </section>
);

const PaneBtn = ({ onClick, children, primary, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{...H.paneBtn, ...(primary ? H.paneBtnPrimary : {}), ...(disabled ? H.paneBtnDis : {})}}>
    {children}
  </button>
);

// ============== Preview ==============
const Preview = ({ html, paper, orientation }) => {
  const iframeRef = useRef(null);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const f = iframeRef.current;
    if (!f) return;
    const doc = f.contentDocument || f.contentWindow.document;
    doc.open();
    doc.write(html || '<html><body style="font-family:sans-serif;color:#999;padding:32px">Brak zawartości</body></html>');
    doc.close();
    // estimate pages after render
    setTimeout(() => {
      const body = doc.body;
      if (!body) return;
      const p = PAPER[paper];
      const isP = orientation === 'portrait';
      const phys = isP ? p.h : p.w; // mm or inch
      const mmHeight = p.unit === 'in' ? phys * 25.4 : phys;
      const pxPerMm = 3.78; // 96dpi
      const pageHeightPx = mmHeight * pxPerMm;
      const total = Math.max(1, Math.ceil(body.scrollHeight / pageHeightPx));
      setPages(total);
    }, 50);
  }, [html, paper, orientation]);

  const p = PAPER[paper];
  const isP = orientation === 'portrait';
  const w = isP ? p.w : p.h;
  const h = isP ? p.h : p.w;
  const aspect = w / h;

  return (
    <div style={H.previewWrap}>
      <div style={H.previewFrame}>
        <div style={{...H.previewPaper, aspectRatio: `${aspect}`}}>
          <iframe ref={iframeRef} title="preview" sandbox="allow-same-origin" style={H.previewIframe} />
        </div>
      </div>
      <div style={H.previewMeta}>
        <span style={H.previewMetaItem}>{p.name} · {isP ? 'portret' : 'pejzaż'}</span>
        <span style={H.previewMetaSep}>·</span>
        <span style={H.previewMetaItem}>~{pages} {pages === 1 ? 'strona' : pages < 5 ? 'strony' : 'stron'}</span>
        <span style={H.previewMetaSep}>·</span>
        <span style={H.previewMetaItem}>{p.unit === 'mm' ? `${w}×${h} mm` : `${w}×${h} in`}</span>
      </div>
    </div>
  );
};

// ============== Main ==============
const App = () => {
  const [input, setInput] = useState('');
  const [paper, setPaper] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [margin, setMargin] = useState(15);
  const [scale, setScale] = useState(1.0);
  const [processing, setProcessing] = useState(false);

  // debounce input → preview html
  const [debouncedHtml, setDebouncedHtml] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedHtml(input), 200);
    return () => clearTimeout(t);
  }, [input]);

  const onPaste = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setInput(txt);
    } catch {
      alert('Nie udało się odczytać schowka — wklej ręcznie ⌘V w pole.');
    }
  };
  const onClear = () => setInput('');
  const onSample = () => setInput(SAMPLE);

  const onDownload = async () => {
    if (!input.trim()) return;
    if (!window.html2pdf) { alert('html2pdf się nie załadował'); return; }
    setProcessing(true);
    try {
      // Render input HTML to a hidden container
      const container = document.createElement('div');
      container.style.cssText = `position:fixed;left:-99999px;top:0;width:${PAPER[paper].unit === 'mm' ? PAPER[paper].w + 'mm' : PAPER[paper].w + 'in'};background:white;`;
      // strip <html> wrappers — html2pdf expects body content
      let body = input;
      const bodyMatch = input.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (bodyMatch) body = bodyMatch[1];
      const styleMatches = [...input.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[0]).join('\n');
      container.innerHTML = styleMatches + body;
      document.body.appendChild(container);

      const opt = {
        margin: margin,
        filename: 'document.pdf',
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: PAPER[paper].unit, format: paper, orientation },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await window.html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
    } catch (e) {
      console.error(e);
      alert('Błąd generowania: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'Enter') { e.preventDefault(); onDownload(); }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'v') { e.preventDefault(); onPaste(); }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); onClear(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [input, paper, orientation, margin, scale]);

  return (
    <div style={H.page}>
      <TopNav />

      <header style={H.header}>
        <div style={H.headerInner}>
          <div style={H.headerEyebrow}>WEB · EKSPORT</div>
          <h1 style={H.headerTitle}>HTML <span style={H.headerSlash}>→</span> PDF</h1>
          <p style={H.headerSub}>
            Renderuj HTML do PDF-a w przeglądarce. Pełna kontrola formatu, marginesów i orientacji —
            podgląd na żywo, generowanie na <strong>html2pdf.js</strong>.
            <span style={H.headerLock}>● 0 żądań</span>
          </p>
        </div>
      </header>

      <ToolBar
        paper={paper} setPaper={setPaper}
        orientation={orientation} setOrientation={setOrientation}
        margin={margin} setMargin={setMargin}
        scale={scale} setScale={setScale}
        onPaste={onPaste} onClear={onClear}
        onDownload={onDownload}
        hasInput={!!input.trim()}
        processing={processing}
      />

      <main style={H.main}>
        <div style={H.grid}>
          <Pane
            side="input"
            title="HTML"
            sub="wklej dowolny kod HTML (pełny dokument lub fragment)"
            actions={!input ? <PaneBtn onClick={onSample}>Wczytaj przykład</PaneBtn> : <PaneBtn onClick={onClear}>Wyczyść</PaneBtn>}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="<!DOCTYPE html>&#10;<html>&#10;  <body>&#10;    <h1>Cześć</h1>&#10;  </body>&#10;</html>"
              style={H.textarea}
              spellCheck={false}
            />
          </Pane>

          <Pane
            side="output"
            title="Podgląd PDF"
            sub="render na żywo w faktycznym rozmiarze strony"
            actions={input ? (
              <PaneBtn onClick={onDownload} primary disabled={processing}>
                {processing ? '…' : 'Pobierz'}
              </PaneBtn>
            ) : null}
          >
            {input ? (
              <Preview html={debouncedHtml} paper={paper} orientation={orientation} />
            ) : (
              <div style={H.empty}>
                <div style={H.emptyMark}>↘</div>
                <div style={H.emptyText}>
                  Podgląd pojawi się tutaj. Wklej HTML po lewej —
                  zobaczysz go w realnym rozmiarze {PAPER[paper].name.toUpperCase()}.
                </div>
                <div style={H.emptyHints}>
                  <span style={H.emptyHint}><kbd style={H.kbdInline}>⌘⇧V</kbd> wklej</span>
                  <span style={H.emptyHint}><kbd style={H.kbdInline}>⌘↵</kbd> pobierz</span>
                </div>
              </div>
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
  <div style={H.manifest}>
    <div style={H.manItem}>
      <span style={H.manKey}>Lokalnie</span>
      <span style={H.manVal}>html2canvas + jsPDF w przeglądarce, 0 żądań do API</span>
    </div>
    <div style={H.manItem}>
      <span style={H.manKey}>Wiernie</span>
      <span style={H.manVal}>renderuje style, czcionki i obrazki — wspiera <code style={H.manCode}>page-break</code></span>
    </div>
    <div style={H.manItem}>
      <span style={H.manKey}>Open</span>
      <span style={H.manVal}>kod na <a href="https://github.com/AdamSzczotka/formattedai" style={H.manLink} target="_blank" rel="noopener">GitHubie ↗</a></span>
    </div>
  </div>
);

const Footer = () => (
  <footer style={H.foot}>
    <div style={H.footInner}>
      <div style={H.footLeft}>
        <FALogo size={18} />
        <span style={H.footSep}>·</span>
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={H.footLink}>adamszczotka.dev ↗</a>
      </div>
      <div style={H.footRight}>
        <a href="Tools.html" style={H.footLink}>Wszystkie narzędzia</a>
        <a href="Articles.html" style={H.footLink}>Dziennik</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={H.footLink}>GitHub ↗</a>
      </div>
    </div>
  </footer>
);

// ============== Styles ==============
const H = {
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

  header: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(251,113,133,.05), transparent)' },
  headerInner: { maxWidth: 1600, margin: '0 auto', padding: '36px 32px 28px' },
  headerEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 12 },
  headerTitle: { fontFamily: '"Fraunces", serif', fontSize: 48, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 },
  headerSlash: { color: 'rgba(255,255,255,.3)', fontWeight: 400 },
  headerSub: { fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', marginTop: 12, marginBottom: 0, maxWidth: 720 },
  headerLock: { color: '#22c55e', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginLeft: 10 },

  toolbar: { position: 'sticky', top: 53, zIndex: 25, background: 'rgba(12,12,18,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  tbLeft: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 10 },
  tbLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.18em' },
  segRow: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' },
  segBtn: { padding: '6px 12px', borderRadius: 5, border: 'none', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  segBtnActive: { background: ACCENT_GLOW, color: '#fff', boxShadow: `inset 0 0 0 1px ${ACCENT_BORDER}` },
  slider: { width: 90, accentColor: ACCENT, cursor: 'pointer' },
  sliderVal: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.7)', minWidth: 50 },

  actionBtn: { padding: '8px 14px', background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 },
  kbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 5px', background: 'rgba(0,0,0,.25)', borderRadius: 3, opacity: 0.7 },

  tbRight: { display: 'flex', alignItems: 'center', gap: 8 },
  processBtn: { padding: '9px 16px', background: ACCENT, color: '#2e0b14', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8 },
  processBtnDis: { opacity: 0.4, cursor: 'not-allowed' },

  main: { flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto', padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 28 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 'calc(100vh - 360px)' },

  pane: { display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, overflow: 'hidden', minHeight: 480 },
  paneOut: { borderColor: 'rgba(251,113,133,.12)', background: 'rgba(251,113,133,.025)' },
  paneHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 16 },
  paneHeadLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  paneIndex: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '0.15em' },
  paneTitle: { fontSize: 14, fontWeight: 600 },
  paneSub: { fontSize: 11, fontFamily: '"JetBrains Mono", monospace', color: 'rgba(255,255,255,.4)', marginTop: 2 },
  paneActions: { display: 'flex', gap: 6 },
  paneBtn: { padding: '6px 12px', background: 'rgba(255,255,255,.04)', color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' },
  paneBtnPrimary: { background: ACCENT_GLOW, color: ACCENT, borderColor: ACCENT_BORDER },
  paneBtnDis: { opacity: 0.4, cursor: 'not-allowed' },
  paneBody: { flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' },

  textarea: { flex: 1, width: '100%', padding: '18px', background: 'transparent', border: 'none', outline: 'none', color: '#e8e8ec', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.6, resize: 'none', minHeight: 420 },

  previewWrap: { flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, overflow: 'auto' },
  previewFrame: { width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'center' },
  previewPaper: { width: '100%', background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.05)', overflow: 'hidden', borderRadius: 2 },
  previewIframe: { width: '100%', height: '100%', border: 'none', display: 'block' },
  previewMeta: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.05em' },
  previewMetaItem: {},
  previewMetaSep: { color: 'rgba(255,255,255,.25)' },

  empty: { padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'rgba(255,255,255,.55)', textAlign: 'center', flex: 1, justifyContent: 'center' },
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
