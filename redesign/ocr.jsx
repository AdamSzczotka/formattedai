// OCR — file → text. Drop / paste / browse. Lang chips + mode + confidence.
const { useState, useEffect, useRef, useMemo } = React;

const LANGS = [
  { code: 'pol', label: 'PL', name: 'polski', size: '12 MB' },
  { code: 'eng', label: 'EN', name: 'angielski', size: '11 MB' },
  { code: 'deu', label: 'DE', name: 'niemiecki', size: '13 MB' },
  { code: 'ukr', label: 'UA', name: 'ukraiński', size: '14 MB' },
  { code: 'fra', label: 'FR', name: 'francuski', size: '12 MB' },
  { code: 'spa', label: 'ES', name: 'hiszpański', size: '11 MB' },
];

// Sample text used when "demo" file is processed
const SAMPLE_TEXT = `Faktura VAT nr 2026/04/127

Sprzedawca: FormattedAI Sp. z o.o.
ul. Krakowska 12, 31-066 Kraków
NIP: 6762512345

Nabywca: Adam Szczotka
adamszczotka.dev

Lp.  Nazwa towaru/usługi              Ilość   Cena netto    Wartość
1.   Licencja roczna — pakiet Pro     1       899,00 zł     899,00 zł
2.   Wsparcie techniczne (12 mies.)   1       299,00 zł     299,00 zł
                                                            ─────────
                                              Razem netto:  1 198,00 zł
                                              VAT 23%:        275,54 zł
                                              Do zapłaty:   1 473,54 zł

Termin płatności: 14 dni od daty wystawienia.
Sposób płatności: przelew na konto 12 1234 5678 9012 3456 7890 1234.`;

const FAKE_PROGRESS = [
  { msg: 'wczytywanie obrazu',         t: 0,    p: 6  },
  { msg: 'analiza układu strony',       t: 250,  p: 18 },
  { msg: 'binaryzacja + deskew',        t: 500,  p: 32 },
  { msg: 'rozpoznawanie linii 1/4',     t: 850,  p: 48 },
  { msg: 'rozpoznawanie linii 2/4',     t: 1100, p: 62 },
  { msg: 'rozpoznawanie linii 3/4',     t: 1350, p: 76 },
  { msg: 'rozpoznawanie linii 4/4',     t: 1600, p: 90 },
  { msg: 'post-processing',             t: 1850, p: 100 },
];

function OcrApp() {
  const [files, setFiles] = useState([]); // [{id, name, size, type, url}]
  const [activeLangs, setActiveLangs] = useState(['pol', 'eng']);
  const [mode, setMode] = useState('fast');
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState({ pct: 0, msg: '', file: '' });
  const [result, setResult] = useState({ text: '', confidence: 0, words: 0, ms: 0 });
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const inputRef = useRef(null);
  const cancelRef = useRef({ cancelled: false });

  // — file management
  const addFiles = (incoming) => {
    const arr = Array.from(incoming || []).filter(f =>
      /^(image\/|application\/pdf)/.test(f.type) || /\.(png|jpe?g|webp|gif|bmp|tiff?|pdf)$/i.test(f.name)
    );
    if (!arr.length) return;
    const next = arr.map(f => ({
      id: Math.random().toString(36).slice(2, 9),
      name: f.name,
      size: f.size,
      type: f.type,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setFiles(prev => [...prev, ...next]);
    setShowHelp(false);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll = () => {
    files.forEach(f => f.url && URL.revokeObjectURL(f.url));
    setFiles([]);
    setResult({ text: '', confidence: 0, words: 0, ms: 0 });
    setPhase('idle');
    setShowHelp(true);
  };

  // — drag and drop
  useEffect(() => {
    const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = (e) => { if (e.target === document.documentElement || e.target === document.body) setDragOver(false); };
    const onDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    };
    const onPaste = (e) => {
      const items = e.clipboardData?.items || [];
      const imgs = [];
      for (const it of items) if (it.kind === 'file') imgs.push(it.getAsFile());
      if (imgs.length) addFiles(imgs);
    };
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
      window.removeEventListener('paste', onPaste);
    };
  });

  // — keyboard
  useEffect(() => {
    const h = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'Enter' && files.length) { e.preventDefault(); recognize(); }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'c' && result.text) { e.preventDefault(); copyText(); }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); clearAll(); }
      if (meta && e.key === 'o') { e.preventDefault(); inputRef.current?.click(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  // — fake but realistic OCR (replaced by tesseract.js in production)
  const recognize = async () => {
    if (!files.length) return;
    setPhase('running');
    cancelRef.current.cancelled = false;
    const start = performance.now();
    for (let fi = 0; fi < files.length; fi++) {
      const f = files[fi];
      for (const step of FAKE_PROGRESS) {
        if (cancelRef.current.cancelled) { setPhase('idle'); return; }
        await new Promise(r => setTimeout(r, mode === 'accurate' ? step.t / 6 + 80 : step.t / 12 + 40));
        setProgress({ pct: step.p, msg: step.msg, file: `${f.name} (${fi + 1}/${files.length})` });
      }
    }
    const ms = Math.round(performance.now() - start);
    const conf = mode === 'accurate' ? 96 : 92;
    const words = SAMPLE_TEXT.trim().split(/\s+/).length;
    setResult({ text: SAMPLE_TEXT, confidence: conf, words, ms });
    setPhase('done');
  };

  const cancelRecognition = () => { cancelRef.current.cancelled = true; setPhase('idle'); };

  const toggleLang = (code) => {
    setActiveLangs(p => p.includes(code) ? p.filter(x => x !== code) : [...p, code]);
  };

  const copyText = async () => {
    if (!result.text) return;
    try { await navigator.clipboard.writeText(result.text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  const downloadAs = (kind) => {
    if (!result.text) return;
    const blob = new Blob([result.text], { type: kind === 'txt' ? 'text/plain' : 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `ocr-${Date.now()}.${kind}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const loadDemo = async () => {
    // synth a placeholder image with the receipt text
    const c = document.createElement('canvas');
    c.width = 800; c.height = 1000;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = '#222'; ctx.font = '14px monospace';
    SAMPLE_TEXT.split('\n').forEach((line, i) => ctx.fillText(line, 32, 40 + i * 22));
    const blob = await new Promise(r => c.toBlob(r, 'image/png'));
    const file = new File([blob], 'faktura-demo.png', { type: 'image/png' });
    addFiles([file]);
  };

  const totalSize = files.reduce((s, f) => s + f.size, 0);

  return (
    <div style={O.page}>
      {dragOver && <DragOverlay />}
      <ToolNav crumb="OCR" />
      <Subbar
        files={files}
        activeLangs={activeLangs}
        toggleLang={toggleLang}
        mode={mode}
        setMode={setMode}
        recognize={recognize}
        clearAll={clearAll}
        running={phase === 'running'}
      />

      <main style={O.main}>
        <header style={O.head}>
          <div>
            <div style={O.eyebrow}>NARZĘDZIA / OBRAZ → TEKST</div>
            <h1 style={O.title}>OCR</h1>
            <p style={O.tag}>Wyciągnij tekst ze zdjęcia, skanu lub PDF. Pliki nie wychodzą z Twojej przeglądarki.</p>
          </div>
          <Stats files={files.length} totalSize={totalSize} confidence={result.confidence} ms={result.ms} />
        </header>

        <div style={O.workspace}>
          {/* INPUT */}
          <Pane
            label="WEJŚCIE · obraz / PDF"
            extra={files.length ? `${files.length} ${files.length === 1 ? 'plik' : 'plików'} · ${formatSize(totalSize)}` : 'przeciągnij, wklej lub wybierz'}
            actions={
              <>
                <ToolBtn onClick={() => inputRef.current?.click()} kbd="⌘O">Wybierz</ToolBtn>
                <ToolBtn onClick={clearAll} kbd="⌘⇧X" disabled={!files.length}>Wyczyść</ToolBtn>
              </>
            }
          >
            {!files.length ? (
              <DropZone onPick={() => inputRef.current?.click()} onDemo={loadDemo} />
            ) : (
              <FileList files={files} onRemove={removeFile} onAdd={() => inputRef.current?.click()} />
            )}
            <input ref={inputRef} type="file" multiple hidden
              accept="image/*,.pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff"
              onChange={e => addFiles(e.target.files)}
            />
          </Pane>

          {/* OUTPUT */}
          <Pane
            label={`WYJŚCIE · ${result.confidence ? `${result.confidence}% pewności` : 'rozpoznany tekst'}`}
            extra={result.words ? `${result.words} słów · ${result.ms}ms · tryb ${mode === 'fast' ? 'szybki' : 'dokładny'}` : 'czeka na rozpoznanie'}
            actions={
              <>
                <button onClick={copyText} disabled={!result.text}
                  style={{...O.copyBtn, ...(copied ? O.copyBtnOk : {}), ...(result.text ? {} : O.copyBtnDis)}}>
                  {copied ? '✓ Skopiowano' : 'Skopiuj tekst'}
                  <kbd style={O.copyKbd}>⌘⇧C</kbd>
                </button>
                <DownloadMenu disabled={!result.text} onPick={downloadAs} />
              </>
            }
          >
            {phase === 'idle' && !result.text && <ResultEmpty />}
            {phase === 'running' && <ResultRunning progress={progress} cancel={cancelRecognition} mode={mode} />}
            {phase === 'done' && <ResultText text={result.text} setText={t => setResult(r => ({ ...r, text: t }))} />}
          </Pane>
        </div>

        {showHelp && <Help onClose={() => setShowHelp(false)} onDemo={loadDemo} />}
        <Privacy />
      </main>

      <ToolFooter />
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────────────

const ToolNav = ({ crumb }) => (
  <nav style={O.nav}>
    <div style={O.navInner}>
      <FALogo size={22} asLink={false} />
      <div style={O.crumbs}>
        <a href="Tools.html" style={O.crumbLink}>Narzędzia</a>
        <span style={O.crumbSep}>/</span>
        <span style={O.crumbCur}>{crumb}</span>
      </div>
      <div style={O.navRight}>
        <a href="Tools.html" style={O.navBtn}>Wszystkie narzędzia</a>
      </div>
    </div>
  </nav>
);

const Subbar = ({ files, activeLangs, toggleLang, mode, setMode, recognize, clearAll, running }) => (
  <div style={O.subbar}>
    <div style={O.subbarInner}>
      <div style={O.subGroup}>
        <span style={O.subLabel}>JĘZYKI</span>
        <div style={O.langChips}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => toggleLang(l.code)} title={`${l.name} · ${l.size}`}
              style={{...O.chip, ...(activeLangs.includes(l.code) ? O.chipActive : {})}}>
              {l.label}
              {activeLangs.includes(l.code) && <span style={O.chipDot}>●</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={O.subGroup}>
        <span style={O.subLabel}>TRYB</span>
        <div style={O.modeWrap}>
          <button onClick={() => setMode('fast')} style={{...O.modeBtn, ...(mode === 'fast' ? O.modeActive : {})}}>
            Szybki <span style={O.modeHint}>~2s</span>
          </button>
          <button onClick={() => setMode('accurate')} style={{...O.modeBtn, ...(mode === 'accurate' ? O.modeActive : {})}}>
            Dokładny <span style={O.modeHint}>~6s</span>
          </button>
        </div>
      </div>
      <div style={O.subRight}>
        <span style={{...O.lockMeta}}>🔒 lokalnie · 0 żądań</span>
        <button onClick={recognize} disabled={!files.length || running}
          style={{...O.runBtn, ...((!files.length || running) ? O.runBtnDis : {})}}>
          {running ? <span style={O.spin}></span> : <span style={{fontSize:11}}>▶</span>}
          {running ? 'Rozpoznaję…' : 'Rozpoznaj tekst'}
          <kbd style={O.runKbd}>⌘↵</kbd>
        </button>
      </div>
    </div>
  </div>
);

const Stats = ({ files, totalSize, confidence, ms }) => (
  <div style={O.stats}>
    <div style={O.stat}><span style={O.statN}>{files}</span><span style={O.statL}>plików</span></div>
    <div style={O.stat}><span style={O.statN}>{formatSize(totalSize)}</span><span style={O.statL}>łącznie</span></div>
    <div style={O.stat}><span style={O.statN}>{confidence ? `${confidence}%` : '—'}</span><span style={O.statL}>pewność</span></div>
    <div style={O.stat}><span style={O.statN}>{ms ? `${ms}ms` : '—'}</span><span style={O.statL}>czas</span></div>
  </div>
);

const Pane = ({ label, extra, actions, children }) => (
  <section style={O.pane}>
    <header style={O.paneHead}>
      <div>
        <div style={O.paneLabel}>{label}</div>
        <div style={O.paneExtra}>{extra}</div>
      </div>
      <div style={O.paneActions}>{actions}</div>
    </header>
    <div style={O.paneBody}>{children}</div>
  </section>
);

const ToolBtn = ({ children, onClick, kbd, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{...O.toolBtn, ...(disabled ? O.toolBtnDis : {})}}>
    {children}
    {kbd && <kbd style={O.toolKbd}>{kbd}</kbd>}
  </button>
);

const DropZone = ({ onPick, onDemo }) => (
  <div style={O.dz}>
    <div style={O.dzVisual}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <rect x="8" y="6" width="40" height="44" rx="4" stroke="rgba(167,139,250,.4)" strokeWidth="1.5"/>
        <path d="M16 18h24M16 26h24M16 34h16" stroke="rgba(167,139,250,.3)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="42" cy="42" r="10" fill="#0c0c14" stroke="#a78bfa" strokeWidth="1.5"/>
        <path d="M38 42h8M42 38v8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <div style={O.dzTitle}>Przeciągnij pliki tutaj</div>
    <div style={O.dzSub}>JPG · PNG · WebP · PDF · TIFF · BMP — wiele plików naraz</div>
    <div style={O.dzActions}>
      <button onClick={onPick} style={O.dzBtn}>Wybierz pliki</button>
      <span style={O.dzSep}>albo</span>
      <span style={O.dzPaste}>wklej screenshot <kbd style={O.toolKbd}>⌘V</kbd></span>
    </div>
    <button onClick={onDemo} style={O.dzDemo}>↗ wczytaj próbkę (faktura)</button>
  </div>
);

const FileList = ({ files, onRemove, onAdd }) => (
  <div style={O.fl}>
    <div style={O.flList}>
      {files.map((f, i) => (
        <div key={f.id} style={O.flRow}>
          <div style={O.flThumb}>
            {f.url ? <img src={f.url} alt="" style={O.flImg} />
              : <span style={O.flPdf}>PDF</span>}
          </div>
          <div style={O.flMeta}>
            <div style={O.flName}>{f.name}</div>
            <div style={O.flSize}>{formatSize(f.size)} · {f.type || 'file'}</div>
          </div>
          <div style={O.flIdx}>{String(i + 1).padStart(2, '0')}</div>
          <button onClick={() => onRemove(f.id)} style={O.flRm} title="Usuń">×</button>
        </div>
      ))}
    </div>
    <button onClick={onAdd} style={O.flAdd}>+ dodaj kolejne pliki</button>
  </div>
);

const ResultEmpty = () => (
  <div style={O.empty}>
    <div style={O.emptyMark}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <path d="M4 6h16M4 12h12M4 18h8" stroke="rgba(167,139,250,.35)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
    <div style={O.emptyText}>Tekst pojawi się tutaj po rozpoznaniu.</div>
    <div style={O.emptyHints}>
      <span style={O.emptyHint}><kbd style={O.toolKbd}>⌘O</kbd> wybierz</span>
      <span style={O.emptyHint}><kbd style={O.toolKbd}>⌘V</kbd> wklej</span>
      <span style={O.emptyHint}><kbd style={O.toolKbd}>⌘↵</kbd> uruchom</span>
    </div>
  </div>
);

const ResultRunning = ({ progress, cancel, mode }) => (
  <div style={O.run}>
    <div style={O.runHead}>
      <div style={O.runDots}><span></span><span></span><span></span></div>
      <span style={O.runMode}>tryb {mode === 'fast' ? 'szybki' : 'dokładny'}</span>
    </div>
    <div style={O.runFile}>{progress.file || 'inicjalizacja silnika…'}</div>
    <div style={O.runMsg}>{progress.msg || 'wczytywanie WebAssembly'}</div>
    <div style={O.runBar}>
      <div style={{...O.runBarFill, width: `${progress.pct}%`}}></div>
    </div>
    <div style={O.runFoot}>
      <span style={O.runPct}>{progress.pct}%</span>
      <button onClick={cancel} style={O.runCancel}>Anuluj</button>
    </div>
  </div>
);

const ResultText = ({ text, setText }) => (
  <textarea
    value={text}
    onChange={e => setText(e.target.value)}
    spellCheck={false}
    style={O.textarea}
  />
);

const DownloadMenu = ({ disabled, onPick }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    if (open) { document.addEventListener('click', close); return () => document.removeEventListener('click', close); }
  }, [open]);
  return (
    <div style={{position:'relative'}}>
      <button onClick={(e) => { e.stopPropagation(); !disabled && setOpen(o => !o); }} disabled={disabled}
        style={{...O.toolBtn, ...(disabled ? O.toolBtnDis : {})}}>
        Pobierz ↓
      </button>
      {open && (
        <div style={O.dlMenu}>
          {[['txt', '.txt — plain text'], ['md', '.md — markdown'], ['srt', '.srt — z timecode'], ['docx', '.docx — Word']].map(([k, l]) => (
            <button key={k} onClick={() => { onPick(k); setOpen(false); }} style={O.dlItem}>{l}</button>
          ))}
        </div>
      )}
    </div>
  );
};

const Help = ({ onClose, onDemo }) => (
  <section style={O.help}>
    <header style={O.helpHead}>
      <div>
        <div style={O.helpKicker}>/ JAK ZACZĄĆ · KROK PO KROKU</div>
        <div style={O.helpTitle}>Pierwszy raz tutaj?</div>
      </div>
      <button onClick={onClose} style={O.helpClose}>Ukryj ×</button>
    </header>
    <div style={O.helpGrid}>
      <Step n="1" title="Dodaj plik">Drag &amp; drop, kliknij <strong>Wybierz pliki</strong> lub wklej screenshot z <kbd style={O.toolKbd}>⌘V</kbd>.</Step>
      <Step n="2" title="Wybierz języki">Polski + angielski domyślnie. Każdy dodatkowy język = 10–15 MB modelu (cache w przeglądarce).</Step>
      <Step n="3" title="Tryb">Szybki dla screenshotów i czystych skanów. Dokładny dla zdjęć z telefonu i krzywych skanów.</Step>
      <Step n="4" title="Pobierz">Skopiuj <kbd style={O.toolKbd}>⌘⇧C</kbd> albo pobierz jako .txt / .md / .docx.</Step>
    </div>
    <footer style={O.helpFoot}>
      <span style={O.helpFootLabel}>Bez plików pod ręką?</span>
      <button onClick={onDemo} style={O.helpDemo}>Wczytaj próbkę — faktura ↗</button>
    </footer>
  </section>
);

const Step = ({ n, title, children }) => (
  <div style={O.step}>
    <div style={O.stepN}>{n}</div>
    <div style={O.stepTitle}>{title}</div>
    <div style={O.stepDesc}>{children}</div>
  </div>
);

const Privacy = () => (
  <div style={O.privacy}>
    <div style={O.privItem}>
      <span style={O.privKey}>Lokalnie</span>
      <span style={O.privVal}>Tesseract.js + WebAssembly w Twojej przeglądarce. Pliki nigdy nie idą na serwer.</span>
    </div>
    <div style={O.privItem}>
      <span style={O.privKey}>Modele</span>
      <span style={O.privVal}>Pierwsze użycie pobiera ~10–15 MB / język (cachowane). Kolejne uruchomienia są natychmiastowe.</span>
    </div>
    <div style={O.privItem}>
      <span style={O.privKey}>Pewność</span>
      <span style={O.privVal}>Każde rozpoznanie ma confidence score. &lt;80% — popraw oświetlenie lub przełącz na tryb dokładny.</span>
    </div>
  </div>
);

const ToolFooter = () => (
  <footer style={O.foot}>
    <div style={O.footInner}>
      <div style={O.footL}>
        <FALogo size={18} asLink={false} />
        <span style={O.footSep}>·</span>
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={O.footLink}>adamszczotka.dev ↗</a>
      </div>
      <div style={O.footR}>
        <a href="Articles.html" style={O.footLink}>Dziennik</a>
        <a href="Tools.html" style={O.footLink}>Narzędzia</a>
        <a href="https://github.com/AdamSzczotka" target="_blank" rel="noopener" style={O.footLink}>GitHub</a>
      </div>
    </div>
  </footer>
);

const DragOverlay = () => (
  <div style={O.dragOv}>
    <div style={O.dragInner}>
      <div style={O.dragMark}>+</div>
      <div style={O.dragTitle}>Upuść plik tutaj</div>
      <div style={O.dragSub}>obraz lub PDF · pliki nie idą na serwer</div>
    </div>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────
function formatSize(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

// ─── Styles ──────────────────────────────────────────────────────────
const O = {
  page: { background: '#08080c', color: '#f0f0f4', fontFamily: '"Inter", -apple-system, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' },

  nav: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 },
  navInner: { maxWidth: 1600, margin: '0 auto', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  crumbs: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  crumbLink: { color: 'rgba(255,255,255,.5)', textDecoration: 'none' },
  crumbSep: { color: 'rgba(255,255,255,.2)' },
  crumbCur: { color: '#fff' },
  navRight: { display: 'flex', gap: 12 },
  navBtn: { padding: '8px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(255,255,255,.75)', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' },

  // Sub bar (langs + mode + run)
  subbar: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)', position: 'sticky', top: 53, zIndex: 25 },
  subbarInner: { maxWidth: 1600, margin: '0 auto', padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' },
  subGroup: { display: 'flex', alignItems: 'center', gap: 12 },
  subLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.16em', whiteSpace: 'nowrap' },
  langChips: { display: 'flex', gap: 4 },
  chip: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: 'rgba(255,255,255,.55)', fontSize: 12, fontWeight: 500, fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer', letterSpacing: '0.04em' },
  chipActive: { background: 'rgba(124,108,240,.12)', borderColor: 'rgba(167,139,250,.45)', color: '#fff' },
  chipDot: { fontSize: 6, color: '#22c55e' },
  modeWrap: { display: 'flex', gap: 4 },
  modeBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: 'rgba(255,255,255,.65)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' },
  modeActive: { background: 'rgba(124,108,240,.12)', borderColor: 'rgba(167,139,250,.45)', color: '#fff' },
  modeHint: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)' },
  subRight: { display: 'flex', alignItems: 'center', gap: 14, marginLeft: 'auto' },
  lockMeta: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(34,197,94,.7)', whiteSpace: 'nowrap' },
  runBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' },
  runBtnDis: { opacity: 0.35, cursor: 'not-allowed' },
  runKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '1px 5px', background: 'rgba(255,255,255,.18)', borderRadius: 3, color: 'rgba(255,255,255,.85)' },
  spin: { width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'ocrSpin .7s linear infinite' },

  // Main
  main: { flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto', padding: '32px 32px 64px', display: 'flex', flexDirection: 'column', gap: 24 },

  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 },
  eyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.18em', marginBottom: 14 },
  title: { fontFamily: '"Fraunces", serif', fontSize: 56, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.025em', margin: 0 },
  tag: { fontSize: 15, color: 'rgba(255,255,255,.6)', margin: '10px 0 0', maxWidth: 560 },

  stats: { display: 'flex', gap: 32, padding: '14px 22px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10 },
  stat: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 60 },
  statN: { fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 400, color: '#fff', lineHeight: 1 },
  statL: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' },

  // Workspace
  workspace: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 540 },
  pane: { display: 'flex', flexDirection: 'column', background: '#0c0c14', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, overflow: 'hidden' },
  paneHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 16, flexWrap: 'wrap' },
  paneLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  paneExtra: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4, whiteSpace: 'nowrap' },
  paneActions: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  paneBody: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' },

  toolBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: 'rgba(255,255,255,.75)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },
  toolBtnDis: { opacity: 0.4, cursor: 'not-allowed' },
  toolKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '1px 5px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 3, color: 'rgba(255,255,255,.5)' },

  copyBtn: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' },
  copyBtnOk: { background: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  copyBtnDis: { opacity: 0.35, cursor: 'not-allowed' },
  copyKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '1px 5px', background: 'rgba(255,255,255,.18)', borderRadius: 3, color: 'rgba(255,255,255,.85)' },

  // Drop zone (large)
  dz: { flex: 1, padding: '60px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', minHeight: 480, border: '1px dashed rgba(255,255,255,.08)', borderRadius: 8, margin: 18 },
  dzVisual: { padding: 14, background: 'rgba(124,108,240,.05)', borderRadius: 16 },
  dzTitle: { fontFamily: '"Fraunces", serif', fontSize: 24, fontWeight: 400, color: '#fff' },
  dzSub: { fontSize: 13, color: 'rgba(255,255,255,.5)', maxWidth: 360 },
  dzActions: { display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
  dzBtn: { padding: '10px 18px', background: 'rgba(124,108,240,.15)', border: '1px solid rgba(167,139,250,.4)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' },
  dzSep: { color: 'rgba(255,255,255,.3)', fontSize: 12 },
  dzPaste: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,.55)' },
  dzDemo: { background: 'transparent', border: 'none', color: '#a78bfa', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer', marginTop: 4 },

  // File list
  fl: { padding: 14, display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflowY: 'auto', maxHeight: 540 },
  flList: { display: 'flex', flexDirection: 'column', gap: 6 },
  flRow: { display: 'grid', gridTemplateColumns: '48px 1fr auto auto', gap: 12, alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8 },
  flThumb: { width: 48, height: 48, borderRadius: 6, overflow: 'hidden', background: '#06060a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  flImg: { width: '100%', height: '100%', objectFit: 'cover' },
  flPdf: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', fontWeight: 600 },
  flMeta: { display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 },
  flName: { fontSize: 13, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  flSize: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)' },
  flIdx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.3)' },
  flRm: { width: 28, height: 28, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16, lineHeight: 1 },
  flAdd: { padding: '10px', background: 'transparent', border: '1px dashed rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(167,139,250,.7)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 },

  // Result empty
  empty: { padding: '60px 24px', textAlign: 'center', color: 'rgba(255,255,255,.4)', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 },
  emptyMark: { padding: 16, background: 'rgba(124,108,240,.04)', borderRadius: 12 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,.5)', maxWidth: 360 },
  emptyHints: { display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' },
  emptyHint: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,.4)' },

  // Running
  run: { flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 },
  runHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  runDots: { display: 'flex', gap: 4 },
  runMode: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' },
  runFile: { fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: '#fff' },
  runMsg: { fontSize: 13, color: 'rgba(167,139,250,.85)' },
  runBar: { height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' },
  runBarFill: { height: '100%', background: 'linear-gradient(90deg, #a78bfa, #7c6cf0)', transition: 'width .25s ease', borderRadius: 2 },
  runFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  runPct: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.6)' },
  runCancel: { background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },

  // Textarea result
  textarea: { flex: 1, minHeight: 480, width: '100%', padding: '20px 22px', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0f4', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.65, resize: 'none' },

  // Download menu
  dlMenu: { position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#0c0c14', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, overflow: 'hidden', zIndex: 5, minWidth: 200 },
  dlItem: { display: 'block', width: '100%', padding: '10px 14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,.8)', fontSize: 12, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' },

  // Help
  help: { background: '#0a0a12', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 24 },
  helpHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  helpKicker: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.16em', marginBottom: 8 },
  helpTitle: { fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 400, color: '#fff' },
  helpClose: { background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', fontSize: 12, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' },
  helpGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  step: { padding: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8 },
  stepN: { fontFamily: '"Fraunces", serif', fontSize: 28, color: '#a78bfa', lineHeight: 1, marginBottom: 10 },
  stepTitle: { fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 6 },
  stepDesc: { fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,.6)' },
  helpFoot: { display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)', flexWrap: 'wrap' },
  helpFootLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)' },
  helpDemo: { padding: '6px 12px', background: 'rgba(124,108,240,.08)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 6, color: '#c4b5fd', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },

  // Privacy strip
  privacy: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,.05)' },
  privItem: { display: 'flex', flexDirection: 'column', gap: 6 },
  privKey: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', letterSpacing: '0.16em', textTransform: 'uppercase' },
  privVal: { fontSize: 13, color: 'rgba(255,255,255,.7)' },

  // Footer
  foot: { borderTop: '1px solid rgba(255,255,255,.05)', padding: '20px 32px', background: '#06060a' },
  footInner: { maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  footL: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,.5)' },
  footSep: { color: 'rgba(255,255,255,.2)' },
  footR: { display: 'flex', gap: 18 },
  footLink: { color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 12 },

  // Drag overlay
  dragOv: { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(8,8,12,.92)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  dragInner: { padding: '60px 80px', border: '2px dashed rgba(167,139,250,.6)', borderRadius: 24, textAlign: 'center', background: 'rgba(124,108,240,.08)' },
  dragMark: { fontSize: 64, color: '#a78bfa', lineHeight: 1, marginBottom: 16 },
  dragTitle: { fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 400, color: '#fff', marginBottom: 8 },
  dragSub: { fontSize: 14, color: 'rgba(255,255,255,.6)' },
};

// Spinner keyframes (injected once)
if (!document.getElementById('ocr-anim')) {
  const s = document.createElement('style');
  s.id = 'ocr-anim';
  s.textContent = `@keyframes ocrSpin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

ReactDOM.createRoot(document.getElementById('root')).render(<OcrApp />);
