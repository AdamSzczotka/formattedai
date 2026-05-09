// AVIF Converter — utility-first redesign
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ============== AVIF support detection ==============
const detectAvifEncode = () => new Promise(resolve => {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  c.toBlob(b => resolve(!!b && b.type === 'image/avif'), 'image/avif', 0.5);
});

// ============== File item ==============
const fmtBytes = b => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' kB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
};

const QUALITY_PRESETS = [
  { id: 'low',  label: 'Niska',     value: 30, hint: 'najmniejszy plik' },
  { id: 'med',  label: 'Średnia',   value: 60, hint: 'web · social' },
  { id: 'high', label: 'Wysoka',    value: 80, hint: 'rekomendowana' },
  { id: 'max',  label: 'Maks.',     value: 95, hint: 'archiwa, druk' },
];

// ============== Convert one file ==============
async function convertToAvif(file, quality) {
  const bmp = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bmp, 0, 0);
  bmp.close?.();
  const blob = await new Promise(r => canvas.toBlob(r, 'image/avif', quality / 100));
  if (!blob) throw new Error('encode failed');
  return { blob, width: canvas.width, height: canvas.height };
}

// ============== Component: Drop Zone ==============
const DropZone = ({ onFiles, hasFiles }) => {
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  const onDrop = (e) => {
    e.preventDefault();
    setOver(false);
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
  };

  const onPick = (e) => {
    const files = [...e.target.files].filter(f => f.type.startsWith('image/'));
    if (files.length) onFiles(files);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={{
        ...AV.dropzone,
        ...(over ? AV.dropzoneOver : {}),
        ...(hasFiles ? AV.dropzoneSlim : {}),
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onPick}
        style={{ display: 'none' }}
      />
      {!hasFiles ? (
        <>
          <div style={AV.dropIcon}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div style={AV.dropTitle}>Upuść zdjęcia tutaj</div>
          <div style={AV.dropSub}>JPG · PNG · WEBP · HEIC · GIF · TIFF — wszystko zostaje na Twoim komputerze</div>
          <button onClick={() => inputRef.current?.click()} style={AV.dropBtn}>
            Wybierz pliki
            <span style={AV.kbd}>⌘O</span>
          </button>
        </>
      ) : (
        <button onClick={() => inputRef.current?.click()} style={AV.dropSlimBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Dodaj więcej zdjęć
          <span style={{...AV.kbd, marginLeft: 'auto'}}>⌘O</span>
        </button>
      )}
    </div>
  );
};

// ============== Component: Quality Bar ==============
const QualityBar = ({ quality, setQuality, files, onClearAll, onDownloadAll }) => {
  const activePreset = QUALITY_PRESETS.find(p => p.value === quality);
  const totalIn = files.reduce((s, f) => s + (f.input?.size || 0), 0);
  const totalOut = files.reduce((s, f) => s + (f.output?.size || 0), 0);
  const savings = totalIn ? ((1 - totalOut / totalIn) * 100) : 0;
  const allDone = files.length > 0 && files.every(f => f.status === 'done');

  return (
    <div style={AV.qualityBar}>
      <div style={AV.qualityLeft}>
        <div style={AV.qualityLabel}>JAKOŚĆ</div>
        <div style={AV.presetRow}>
          {QUALITY_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setQuality(p.value)}
              style={{
                ...AV.presetBtn,
                ...(activePreset?.id === p.id ? AV.presetBtnActive : {}),
              }}
              title={p.hint}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={AV.sliderWrap}>
          <input
            type="range" min="1" max="100" value={quality}
            onChange={e => setQuality(+e.target.value)}
            style={AV.slider}
          />
          <div style={AV.sliderVal}>{quality}</div>
        </div>
      </div>

      <div style={AV.qualityRight}>
        {files.length > 0 && (
          <>
            <div style={AV.statBlock}>
              <div style={AV.statLabel}>plików</div>
              <div style={AV.statVal}>{files.length}</div>
            </div>
            {totalOut > 0 && (
              <>
                <div style={AV.statBlock}>
                  <div style={AV.statLabel}>oszczędność</div>
                  <div style={{...AV.statVal, color: '#22c55e'}}>−{savings.toFixed(0)}%</div>
                </div>
                <div style={AV.statBlock}>
                  <div style={AV.statLabel}>razem</div>
                  <div style={AV.statVal}>{fmtBytes(totalIn)} → {fmtBytes(totalOut)}</div>
                </div>
              </>
            )}
            <div style={AV.qualityActions}>
              <button onClick={onClearAll} style={AV.actionBtn}>
                Wyczyść <span style={AV.kbd}>⌘⇧X</span>
              </button>
              <button
                onClick={onDownloadAll}
                disabled={!allDone}
                style={{...AV.actionBtnPrimary, ...(allDone ? {} : AV.actionBtnDisabled)}}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Pobierz wszystko
                <span style={AV.kbd}>⌘D</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============== Component: File row ==============
const FileRow = ({ file, onRemove, onDownload, onPreview }) => {
  const savings = file.output && file.input
    ? ((1 - file.output.size / file.input.size) * 100)
    : 0;
  const isPositive = savings > 0;

  return (
    <div style={AV.row}>
      <div style={AV.rowThumb} onClick={file.output ? onPreview : null}>
        {file.thumb ? (
          <img src={file.thumb} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <div style={AV.rowThumbEmpty}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
        )}
        {file.status === 'pending' && (
          <div style={AV.rowSpinner}>
            <div style={AV.spinner}></div>
          </div>
        )}
      </div>

      <div style={AV.rowInfo}>
        <div style={AV.rowName} title={file.input.name}>{file.input.name}</div>
        <div style={AV.rowMeta}>
          <span style={AV.rowDim}>{file.dim || '—'}</span>
          <span style={AV.rowSep}>·</span>
          <span style={AV.rowSize}>{fmtBytes(file.input.size)}</span>
          {file.output && (
            <>
              <span style={AV.rowArrow}>→</span>
              <span style={AV.rowSizeOut}>{fmtBytes(file.output.size)}</span>
              <span style={{
                ...AV.rowSavings,
                ...(isPositive ? AV.rowSavingsPositive : AV.rowSavingsNegative),
              }}>
                {isPositive ? '−' : '+'}{Math.abs(savings).toFixed(0)}%
              </span>
            </>
          )}
          {file.status === 'pending' && <span style={AV.rowStatus}>konwersja…</span>}
          {file.status === 'error' && <span style={AV.rowStatusErr}>błąd: {file.error}</span>}
        </div>
      </div>

      <div style={AV.rowActions}>
        {file.output && (
          <button onClick={onDownload} style={AV.rowDownload} title="Pobierz">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        )}
        <button onClick={onRemove} style={AV.rowRemove} title="Usuń">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>
      </div>
    </div>
  );
};

// ============== Component: Preview Modal ==============
const PreviewModal = ({ file, onClose }) => {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!file?.output) return null;
  const url = URL.createObjectURL(file.output);
  return (
    <div style={AV.modalBack} onClick={onClose}>
      <div style={AV.modalBox} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={AV.modalClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>
        <img src={url} alt="" style={AV.modalImg} />
        <div style={AV.modalMeta}>
          <span style={AV.modalName}>{file.input.name}</span>
          <span style={AV.modalDim}>{file.dim}</span>
          <span style={AV.modalSize}>{fmtBytes(file.input.size)} → {fmtBytes(file.output.size)}</span>
        </div>
      </div>
    </div>
  );
};

// ============== Empty State ==============
const EmptyState = ({ onLoadDemo }) => (
  <div style={AV.empty}>
    <div style={AV.emptyTitle}>Co tu się dzieje</div>
    <div style={AV.emptyGrid}>
      <div style={AV.emptyStep}>
        <div style={AV.emptyNum}>1</div>
        <div style={AV.emptyHead}>Upuść zdjęcia</div>
        <div style={AV.emptyText}>Wszystko leci do <strong>Twojej przeglądarki</strong>. Nic nie jest wysyłane na żaden serwer.</div>
      </div>
      <div style={AV.emptyStep}>
        <div style={AV.emptyNum}>2</div>
        <div style={AV.emptyHead}>Wybierz jakość</div>
        <div style={AV.emptyText}>80 dla web (oszczędność ~70% bez utraty), 95 do druku, 30 dla miniatur.</div>
      </div>
      <div style={AV.emptyStep}>
        <div style={AV.emptyNum}>3</div>
        <div style={AV.emptyHead}>Pobierz</div>
        <div style={AV.emptyText}>Pojedyncze pliki albo paczka ZIP. Nazwy pozostają, rozszerzenie zmienia się na <code style={AV.code}>.avif</code>.</div>
      </div>
    </div>
    <div style={AV.emptyHint}>
      <span style={AV.emptyHintLabel}>SKRÓTY</span>
      <kbd style={AV.kbdInline}>⌘O</kbd> wybierz <span style={AV.emptyDot}>·</span>
      <kbd style={AV.kbdInline}>⌘D</kbd> pobierz wszystko <span style={AV.emptyDot}>·</span>
      <kbd style={AV.kbdInline}>⌘⇧X</kbd> wyczyść <span style={AV.emptyDot}>·</span>
      <kbd style={AV.kbdInline}>1–4</kbd> presety jakości
    </div>
  </div>
);

// ============== Main ==============
const AvifApp = () => {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [supported, setSupported] = useState(null);
  const [preview, setPreview] = useState(null);

  // Detect AVIF support on mount
  useEffect(() => {
    detectAvifEncode().then(setSupported);
  }, []);

  // Process file (generate thumb + convert)
  const processFile = useCallback(async (id, file, q) => {
    try {
      // Generate thumb
      const thumb = URL.createObjectURL(file);
      const bmp = await createImageBitmap(file);
      const dim = `${bmp.width}×${bmp.height}`;
      bmp.close?.();

      setFiles(prev => prev.map(f => f.id === id ? { ...f, thumb, dim } : f));

      const { blob } = await convertToAvif(file, q);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, output: blob, status: 'done' } : f));
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: e.message } : f));
    }
  }, []);

  // Add files
  const onAddFiles = useCallback((newFiles) => {
    const items = newFiles.map(f => ({
      id: crypto.randomUUID(),
      input: f,
      status: 'pending',
      output: null,
      thumb: null,
      dim: null,
    }));
    setFiles(prev => [...prev, ...items]);
    items.forEach(item => processFile(item.id, item.input, quality));
  }, [quality, processFile]);

  // Re-convert on quality change
  const reconvertAll = useCallback((newQ) => {
    setFiles(prev => {
      const next = prev.map(f => ({ ...f, status: 'pending', output: null }));
      next.forEach(f => processFile(f.id, f.input, newQ));
      return next;
    });
  }, [processFile]);

  const setQualityDebounced = useRef(null);
  const onQualityChange = (q) => {
    setQuality(q);
    if (setQualityDebounced.current) clearTimeout(setQualityDebounced.current);
    setQualityDebounced.current = setTimeout(() => {
      if (files.length > 0) reconvertAll(q);
    }, 250);
  };

  // Remove
  const onRemove = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const onClearAll = () => setFiles([]);

  // Download
  const downloadOne = (file) => {
    if (!file.output) return;
    const url = URL.createObjectURL(file.output);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.input.name.replace(/\.[^.]+$/, '') + '.avif';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    const done = files.filter(f => f.output);
    done.forEach((f, i) => setTimeout(() => downloadOne(f), i * 100));
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); onClearAll(); return; }
      if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); downloadAll(); return; }
      if (meta && e.key.toLowerCase() === 'o') { e.preventDefault(); document.querySelector('input[type=file]')?.click(); return; }
      if (!meta && !e.shiftKey && /^[1-4]$/.test(e.key) && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        onQualityChange(QUALITY_PRESETS[+e.key - 1].value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [files, quality]);

  if (supported === false) {
    // Don't block the whole UI — render with a warning banner instead
  }

  return (
    <div style={AV.app}>
      {/* NAV */}
      <nav style={AV.nav}>
        <div style={AV.navInner}>
          <FALogo size={22} />
          <div style={AV.crumbs}>
            <a href="Tools.html" style={AV.crumbLink}>Narzędzia</a>
            <span style={AV.crumbSep}>/</span>
            <span style={AV.crumbDim}>Obrazy</span>
            <span style={AV.crumbSep}>/</span>
            <span style={AV.crumbCurr}>AVIF Converter</span>
          </div>
          <div style={AV.navRight}>
            <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={AV.navGh}>GitHub ↗</a>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <header style={AV.header}>
        <div style={AV.headerInner}>
          <div style={AV.headerLeft}>
            <div style={AV.headerEyebrow}>OBRAZY · KONWERTER</div>
            <h1 style={AV.headerTitle}>AVIF Converter</h1>
            <p style={AV.headerSub}>
              Zamień JPG/PNG/WEBP na AVIF — format <strong>2-3× mniejszy</strong> bez utraty jakości.
              Wszystko dzieje się w Twojej przeglądarce. <span style={AV.headerLock}>● 0 żądań sieciowych</span>
            </p>
          </div>
        </div>
      </header>

      {supported === false && (
        <div style={AV.unsupBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <span>
            <strong>Ta przeglądarka nie ma encodera AVIF.</strong> Interfejs zostawiamy do podglądu, ale konwersja nie zadziała.
            Wymagane: Chrome 85+ · Edge 121+ · Safari 16.1+.
          </span>
        </div>
      )}

      {/* QUALITY BAR — sticky */}
      <QualityBar
        quality={quality}
        setQuality={onQualityChange}
        files={files}
        onClearAll={onClearAll}
        onDownloadAll={downloadAll}
      />

      {/* WORKSPACE */}
      <main style={AV.workspace}>
        <DropZone onFiles={onAddFiles} hasFiles={files.length > 0} />

        {files.length > 0 ? (
          <div style={AV.list}>
            {files.map(f => (
              <FileRow
                key={f.id}
                file={f}
                onRemove={() => onRemove(f.id)}
                onDownload={() => downloadOne(f)}
                onPreview={() => setPreview(f)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* MANIFEST */}
      <section style={AV.manifest}>
        <div style={AV.manifestInner}>
          <div style={AV.manifestEyebrow}>MANIFEST</div>
          <div style={AV.manifestText}>
            <strong>Twoje zdjęcia nie wychodzą z Twojej przeglądarki.</strong> Encoder AVIF jest wbudowany w Chrome/Edge/Safari.
            Plik wejściowy → Canvas → Blob → Download. Zero serwera. Zero kont. Zero śledzenia.
            <a href="Article.html" style={AV.manifestLink}>Przeczytaj o filozofii →</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={AV.foot}>
        <div style={AV.footInner}>
          <div style={AV.footLeft}>
            <FALogo size={18} />
            <span style={AV.footSep}>·</span>
            <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={AV.footLink}>adamszczotka.dev ↗</a>
          </div>
          <div style={AV.footRight}>
            <a href="Tools.html" style={AV.footLink}>Wszystkie narzędzia</a>
            <a href="Articles.html" style={AV.footLink}>Dziennik</a>
            <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={AV.footLink}>GitHub ↗</a>
          </div>
        </div>
      </footer>

      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
};

// ============== Styles ==============
const ACCENT = '#3b82f6';
const ACCENT_GLOW = 'rgba(59,130,246,.12)';
const ACCENT_BORDER = 'rgba(59,130,246,.28)';

const AV = {
  app: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: '"Inter", sans-serif' },

  // NAV
  nav: { position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(12px)' },
  navInner: { maxWidth: 1600, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
  crumbs: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  crumbLink: { color: 'rgba(255,255,255,.5)', textDecoration: 'none' },
  crumbSep: { color: 'rgba(255,255,255,.25)' },
  crumbDim: { color: 'rgba(255,255,255,.45)' },
  crumbCurr: { color: '#fff' },
  navRight: { display: 'flex', gap: 16, fontSize: 13 },
  navGh: { color: 'rgba(255,255,255,.6)', textDecoration: 'none' },

  // HEADER
  header: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(59,130,246,.04), transparent)' },
  headerInner: { maxWidth: 1600, margin: '0 auto', padding: '40px 32px 32px' },
  headerLeft: { maxWidth: 720 },
  headerEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 14 },
  headerTitle: { fontFamily: '"Fraunces", serif', fontSize: 56, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 },
  headerSub: { fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', marginTop: 14, marginBottom: 0 },
  headerLock: { color: '#22c55e', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginLeft: 8 },

  // QUALITY BAR
  qualityBar: { position: 'sticky', top: 53, zIndex: 25, background: 'rgba(12,12,18,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' },
  qualityLeft: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  qualityLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.18em' },
  presetRow: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' },
  presetBtn: { padding: '6px 12px', borderRadius: 5, border: 'none', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' },
  presetBtnActive: { background: ACCENT_GLOW, color: '#fff', boxShadow: `inset 0 0 0 1px ${ACCENT_BORDER}` },
  sliderWrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' },
  slider: { WebkitAppearance: 'none', appearance: 'none', width: 120, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.1)', outline: 'none', cursor: 'pointer' },
  sliderVal: { fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: ACCENT, minWidth: 26, textAlign: 'right', fontWeight: 600 },

  qualityRight: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  statBlock: { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.15em', textTransform: 'uppercase' },
  statVal: { fontSize: 14, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' },

  qualityActions: { display: 'flex', gap: 8 },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' },
  actionBtnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' },
  actionBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },

  // WORKSPACE
  workspace: { maxWidth: 1600, margin: '0 auto', padding: '24px 32px 80px', display: 'flex', flexDirection: 'column', gap: 16 },

  // DROPZONE
  dropzone: { border: '1.5px dashed rgba(255,255,255,.15)', borderRadius: 16, padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all .2s', background: 'rgba(255,255,255,.015)', cursor: 'default' },
  dropzoneOver: { borderColor: ACCENT, background: ACCENT_GLOW, transform: 'scale(1.005)' },
  dropzoneSlim: { padding: '14px 20px', flexDirection: 'row', borderStyle: 'solid', borderColor: 'rgba(255,255,255,.08)' },
  dropIcon: { color: ACCENT, marginBottom: 4 },
  dropTitle: { fontSize: 22, fontWeight: 500, fontFamily: '"Fraunces", serif', letterSpacing: '-0.01em' },
  dropSub: { fontSize: 13, color: 'rgba(255,255,255,.55)', textAlign: 'center', maxWidth: 480 },
  dropBtn: { marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' },
  dropSlimBtn: { width: '100%', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', color: ACCENT, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', justifyContent: 'flex-start' },

  // ROW
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 16, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, transition: 'all .15s' },
  rowThumb: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,.04)', position: 'relative', cursor: 'pointer' },
  rowThumbEmpty: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.3)' },
  rowSpinner: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 22, height: 22, border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'avifSpin 0.8s linear infinite' },
  rowInfo: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  rowName: { fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowMeta: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: '"JetBrains Mono", monospace', flexWrap: 'wrap' },
  rowDim: { color: 'rgba(255,255,255,.4)' },
  rowSep: { color: 'rgba(255,255,255,.2)' },
  rowSize: { color: 'rgba(255,255,255,.55)' },
  rowArrow: { color: 'rgba(255,255,255,.3)' },
  rowSizeOut: { color: '#fff' },
  rowSavings: { padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 },
  rowSavingsPositive: { background: 'rgba(34,197,94,.15)', color: '#22c55e' },
  rowSavingsNegative: { background: 'rgba(245,158,11,.15)', color: '#f59e0b' },
  rowStatus: { color: ACCENT },
  rowStatusErr: { color: '#ef4444' },
  rowActions: { display: 'flex', gap: 6 },
  rowDownload: { width: 32, height: 32, borderRadius: 8, background: ACCENT_GLOW, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .15s' },
  rowRemove: { width: 32, height: 32, borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .15s' },

  // EMPTY
  empty: { padding: '40px 0' },
  emptyTitle: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.2em', marginBottom: 24 },
  emptyGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 },
  emptyStep: { padding: 24, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 12 },
  emptyNum: { fontFamily: '"Fraunces", serif', fontSize: 44, lineHeight: 1, color: ACCENT, opacity: 0.5, marginBottom: 12 },
  emptyHead: { fontSize: 16, fontWeight: 500, marginBottom: 6 },
  emptyText: { fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.6)' },
  emptyHint: { display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10, fontSize: 12, color: 'rgba(255,255,255,.65)', flexWrap: 'wrap' },
  emptyHintLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.15em', marginRight: 6 },
  emptyDot: { color: 'rgba(255,255,255,.25)' },
  code: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, padding: '1px 5px', background: 'rgba(255,255,255,.06)', borderRadius: 3 },

  // KBD
  kbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 5px', background: 'rgba(255,255,255,.08)', borderRadius: 3, opacity: 0.7, marginLeft: 6 },
  kbdInline: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,.08)', borderRadius: 4, color: '#fff', margin: '0 2px' },

  // MODAL
  modalBack: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  modalBox: { position: 'relative', maxWidth: '90vw', maxHeight: '90vh', background: '#0f0f15', borderRadius: 14, border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden' },
  modalClose: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  modalImg: { display: 'block', maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain' },
  modalMeta: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', flexWrap: 'wrap' },
  modalName: { color: '#fff', fontWeight: 600 },
  modalDim: { color: 'rgba(255,255,255,.5)' },
  modalSize: { color: ACCENT },

  // MANIFEST
  manifest: { borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '32px 0', background: 'rgba(255,255,255,.015)' },
  manifestInner: { maxWidth: 1100, margin: '0 auto', padding: '0 32px' },
  manifestEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 14 },
  manifestText: { fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,.85)', fontFamily: '"Fraunces", serif', fontWeight: 400 },
  manifestLink: { color: ACCENT, textDecoration: 'none', marginLeft: 8, fontFamily: '"Inter", sans-serif', fontSize: 14 },

  // FOOTER
  foot: { borderTop: '1px solid rgba(255,255,255,.06)' },
  footInner: { maxWidth: 1600, margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  footLeft: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.5)' },
  footRight: { display: 'flex', gap: 20, fontSize: 13 },
  footSep: { color: 'rgba(255,255,255,.25)' },
  footLink: { color: 'rgba(255,255,255,.6)', textDecoration: 'none' },

  // UNSUPPORTED
  unsupported: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, background: '#0a0a0f', color: '#fff', textAlign: 'center', gap: 12 },
  unsupTitle: { fontFamily: '"Fraunces", serif', fontSize: 28, fontWeight: 400 },
  unsupText: { fontSize: 14, color: 'rgba(255,255,255,.7)', maxWidth: 480, lineHeight: 1.6 },
  unsupBtn: { marginTop: 16, padding: '10px 18px', background: ACCENT_GLOW, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  unsupBanner: { maxWidth: 1600, margin: '12px auto 0', padding: '12px 18px', display: 'flex', alignItems: 'flex-start', gap: 12, background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 10, color: '#f59e0b', fontSize: 13, lineHeight: 1.5 },
};

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AvifApp />);
