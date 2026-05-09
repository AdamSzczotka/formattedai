// HEIC Converter — utility-first redesign (mirror AVIF pattern, amber accent)
const { useState, useEffect, useRef, useCallback } = React;

const ACCENT = '#f59e0b';
const ACCENT_GLOW = 'rgba(245,158,11,.12)';
const ACCENT_BORDER = 'rgba(245,158,11,.28)';

const fmtBytes = b => {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' kB';
  return (b / 1024 / 1024).toFixed(2) + ' MB';
};

const FORMATS = [
  { id: 'image/jpeg', ext: 'jpg', label: 'JPG', hint: 'uniwersalny' },
  { id: 'image/png',  ext: 'png', label: 'PNG', hint: 'bezstratny' },
  { id: 'image/webp', ext: 'webp', label: 'WEBP', hint: 'mały · web' },
];

const QUALITY_PRESETS = [
  { id: 'low',  label: 'Niska',   value: 40 },
  { id: 'med',  label: 'Średnia', value: 65 },
  { id: 'high', label: 'Wysoka',  value: 85 },
  { id: 'max',  label: 'Maks.',   value: 100 },
];

// Convert HEIC to target format using heic2any
async function convertHeic(file, format, quality) {
  // heic2any returns JPEG/PNG. For WEBP we go via PNG → canvas → WEBP.
  const targetForLib = format === 'image/webp' ? 'image/png' : format;
  let blob;
  try {
    blob = await window.heic2any({
      blob: file,
      toType: targetForLib,
      quality: format === 'image/png' ? undefined : quality / 100,
    });
  } catch (e) {
    // If file is already not HEIC, try direct decode
    if (file.type.startsWith('image/')) {
      blob = file;
    } else {
      throw e;
    }
  }
  // Some versions return an array
  if (Array.isArray(blob)) blob = blob[0];

  if (format === 'image/webp') {
    const bmp = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width; canvas.height = bmp.height;
    canvas.getContext('2d').drawImage(bmp, 0, 0);
    bmp.close?.();
    blob = await new Promise(r => canvas.toBlob(r, 'image/webp', quality / 100));
  }

  // dimensions
  const bmp2 = await createImageBitmap(blob);
  const dim = `${bmp2.width}×${bmp2.height}`;
  bmp2.close?.();

  return { blob, dim };
}

// ==================== Drop Zone ====================
const DropZone = ({ onFiles, hasFiles }) => {
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);

  const onDrop = (e) => {
    e.preventDefault(); setOver(false);
    const files = [...e.dataTransfer.files].filter(f =>
      /\.(heic|heif)$/i.test(f.name) || f.type === 'image/heic' || f.type === 'image/heif'
    );
    if (files.length) onFiles(files);
  };
  const onPick = (e) => {
    const files = [...e.target.files];
    if (files.length) onFiles(files);
    e.target.value = '';
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      style={{ ...HC.dropzone, ...(over ? HC.dropzoneOver : {}), ...(hasFiles ? HC.dropzoneSlim : {}) }}
    >
      <input ref={inputRef} type="file" accept=".heic,.heif,image/heic,image/heif" multiple onChange={onPick} style={{display:'none'}} />
      {!hasFiles ? (
        <>
          <div style={HC.dropIcon}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div style={HC.dropTitle}>Upuść zdjęcia HEIC tutaj</div>
          <div style={HC.dropSub}>Pliki .heic / .heif z iPhone — dekodowanie po stronie przeglądarki, zero serwera</div>
          <button onClick={() => inputRef.current?.click()} style={HC.dropBtn}>
            Wybierz pliki <span style={HC.kbd}>⌘O</span>
          </button>
        </>
      ) : (
        <button onClick={() => inputRef.current?.click()} style={HC.dropSlimBtn}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Dodaj więcej plików HEIC
          <span style={{...HC.kbd, marginLeft:'auto'}}>⌘O</span>
        </button>
      )}
    </div>
  );
};

// ==================== Tool Bar ====================
const ToolBar = ({ format, setFormat, quality, setQuality, files, onClearAll, onDownloadAll }) => {
  const totalIn = files.reduce((s, f) => s + (f.input?.size || 0), 0);
  const totalOut = files.reduce((s, f) => s + (f.output?.size || 0), 0);
  const savings = totalIn ? ((1 - totalOut / totalIn) * 100) : 0;
  const allDone = files.length > 0 && files.every(f => f.status === 'done');
  const isPng = format === 'image/png';

  return (
    <div style={HC.toolbar}>
      <div style={HC.tbLeft}>
        <div style={HC.tbGroup}>
          <div style={HC.tbLabel}>FORMAT</div>
          <div style={HC.segRow}>
            {FORMATS.map(f => (
              <button key={f.id} onClick={() => setFormat(f.id)}
                style={{...HC.segBtn, ...(format === f.id ? HC.segBtnActive : {})}}
                title={f.hint}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={HC.tbGroup}>
          <div style={HC.tbLabel}>JAKOŚĆ</div>
          <div style={HC.presetRow}>
            {QUALITY_PRESETS.map(p => (
              <button key={p.id} onClick={() => setQuality(p.value)}
                disabled={isPng}
                style={{...HC.presetBtn, ...(quality === p.value ? HC.presetBtnActive : {}), ...(isPng ? HC.presetBtnDisabled : {})}}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={HC.sliderWrap}>
            <input type="range" min="1" max="100" value={quality} disabled={isPng}
              onChange={e => setQuality(+e.target.value)} style={HC.slider} />
            <div style={HC.sliderVal}>{isPng ? '—' : quality}</div>
          </div>
        </div>
      </div>

      <div style={HC.tbRight}>
        {files.length > 0 && (
          <>
            <div style={HC.statBlock}>
              <div style={HC.statLabel}>plików</div>
              <div style={HC.statVal}>{files.length}</div>
            </div>
            {totalOut > 0 && (
              <>
                <div style={HC.statBlock}>
                  <div style={HC.statLabel}>{savings >= 0 ? 'oszczędność' : 'przyrost'}</div>
                  <div style={{...HC.statVal, color: savings >= 0 ? '#22c55e' : '#f59e0b'}}>
                    {savings >= 0 ? '−' : '+'}{Math.abs(savings).toFixed(0)}%
                  </div>
                </div>
                <div style={HC.statBlock}>
                  <div style={HC.statLabel}>razem</div>
                  <div style={HC.statVal}>{fmtBytes(totalIn)} → {fmtBytes(totalOut)}</div>
                </div>
              </>
            )}
            <div style={HC.tbActions}>
              <button onClick={onClearAll} style={HC.actionBtn}>
                Wyczyść <span style={HC.kbd}>⌘⇧X</span>
              </button>
              <button onClick={onDownloadAll} disabled={!allDone}
                style={{...HC.actionBtnPrimary, ...(allDone ? {} : HC.actionBtnDisabled)}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Pobierz wszystko <span style={HC.kbd}>⌘D</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==================== File Row ====================
const FileRow = ({ file, format, onRemove, onDownload, onPreview }) => {
  const savings = file.output && file.input ? ((1 - file.output.size / file.input.size) * 100) : 0;
  const isPositive = savings > 0;
  const fmtMeta = FORMATS.find(f => f.id === format);

  return (
    <div style={HC.row}>
      <div style={HC.rowThumb} onClick={file.output ? onPreview : null}>
        {file.thumb ? (
          <img src={file.thumb} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}} />
        ) : (
          <div style={HC.rowThumbEmpty}>
            <span style={HC.heicBadge}>HEIC</span>
          </div>
        )}
        {file.status === 'pending' && (
          <div style={HC.rowSpinner}><div style={HC.spinner}></div></div>
        )}
      </div>
      <div style={HC.rowInfo}>
        <div style={HC.rowName} title={file.input.name}>{file.input.name}</div>
        <div style={HC.rowMeta}>
          <span style={HC.rowDim}>{file.dim || '—'}</span>
          <span style={HC.rowSep}>·</span>
          <span style={HC.rowSize}>{fmtBytes(file.input.size)}</span>
          {file.output && (
            <>
              <span style={HC.rowArrow}>→ {fmtMeta?.label}</span>
              <span style={HC.rowSizeOut}>{fmtBytes(file.output.size)}</span>
              <span style={{...HC.rowSavings, ...(isPositive ? HC.rowSavingsPositive : HC.rowSavingsNegative)}}>
                {isPositive ? '−' : '+'}{Math.abs(savings).toFixed(0)}%
              </span>
            </>
          )}
          {file.status === 'pending' && <span style={HC.rowStatus}>dekodowanie…</span>}
          {file.status === 'error' && <span style={HC.rowStatusErr}>błąd: {file.error}</span>}
        </div>
      </div>
      <div style={HC.rowActions}>
        {file.output && (
          <button onClick={onDownload} style={HC.rowDownload} title="Pobierz">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        )}
        <button onClick={onRemove} style={HC.rowRemove} title="Usuń">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>
      </div>
    </div>
  );
};

// ==================== Preview Modal ====================
const PreviewModal = ({ file, onClose }) => {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  if (!file?.output) return null;
  const url = URL.createObjectURL(file.output);
  return (
    <div style={HC.modalBack} onClick={onClose}>
      <div style={HC.modalBox} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={HC.modalClose}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>
        </button>
        <img src={url} alt="" style={HC.modalImg} />
        <div style={HC.modalMeta}>
          <span style={HC.modalName}>{file.input.name}</span>
          <span style={HC.modalDim}>{file.dim}</span>
          <span style={HC.modalSize}>{fmtBytes(file.input.size)} → {fmtBytes(file.output.size)}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== Empty State ====================
const EmptyState = () => (
  <div style={HC.empty}>
    <div style={HC.emptyTitle}>JAK TO DZIAŁA</div>
    <div style={HC.emptyGrid}>
      <div style={HC.emptyStep}>
        <div style={HC.emptyNum}>1</div>
        <div style={HC.emptyHead}>Upuść .heic / .heif</div>
        <div style={HC.emptyText}>Pliki z iPhone / iPada. Dekoder libheif działa w przeglądarce — żadnego uploadu.</div>
      </div>
      <div style={HC.emptyStep}>
        <div style={HC.emptyNum}>2</div>
        <div style={HC.emptyHead}>Wybierz format</div>
        <div style={HC.emptyText}><strong>JPG</strong> dla pełnej kompatybilności, <strong>WEBP</strong> dla web, <strong>PNG</strong> gdy chcesz bezstratnie.</div>
      </div>
      <div style={HC.emptyStep}>
        <div style={HC.emptyNum}>3</div>
        <div style={HC.emptyHead}>Pobierz</div>
        <div style={HC.emptyText}>Pojedynczo albo paczką. Metadane EXIF nie są przenoszone — to feature, nie bug.</div>
      </div>
    </div>
    <div style={HC.emptyHint}>
      <span style={HC.emptyHintLabel}>SKRÓTY</span>
      <kbd style={HC.kbdInline}>⌘O</kbd> wybierz <span style={HC.emptyDot}>·</span>
      <kbd style={HC.kbdInline}>⌘D</kbd> pobierz wszystko <span style={HC.emptyDot}>·</span>
      <kbd style={HC.kbdInline}>⌘⇧X</kbd> wyczyść <span style={HC.emptyDot}>·</span>
      <kbd style={HC.kbdInline}>1–4</kbd> presety jakości
    </div>
  </div>
);

// ==================== Main ====================
const HeicApp = () => {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(85);
  const [preview, setPreview] = useState(null);

  const processFile = useCallback(async (id, file, fmt, q) => {
    try {
      // Try thumbnail from a quick small JPEG decode (using same heic2any but low quality)
      let thumb = null;
      try {
        const tmpBlob = await window.heic2any({ blob: file, toType: 'image/jpeg', quality: 0.4 });
        thumb = URL.createObjectURL(Array.isArray(tmpBlob) ? tmpBlob[0] : tmpBlob);
      } catch {}
      setFiles(prev => prev.map(f => f.id === id ? { ...f, thumb } : f));

      const { blob, dim } = await convertHeic(file, fmt, q);
      setFiles(prev => prev.map(f => f.id === id ? { ...f, output: blob, dim, status: 'done' } : f));
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'error', error: e.message || 'dekodowanie nieudane' } : f));
    }
  }, []);

  const onAddFiles = useCallback((newFiles) => {
    const items = newFiles.map(f => ({
      id: crypto.randomUUID(),
      input: f, status: 'pending', output: null, thumb: null, dim: null,
    }));
    setFiles(prev => [...prev, ...items]);
    items.forEach(item => processFile(item.id, item.input, format, quality));
  }, [format, quality, processFile]);

  const reconvertAll = useCallback((newFmt, newQ) => {
    setFiles(prev => {
      const next = prev.map(f => ({ ...f, status: 'pending', output: null }));
      next.forEach(f => processFile(f.id, f.input, newFmt, newQ));
      return next;
    });
  }, [processFile]);

  const debounceRef = useRef(null);
  const onFormatChange = (fmt) => {
    setFormat(fmt);
    if (files.length > 0) reconvertAll(fmt, quality);
  };
  const onQualityChange = (q) => {
    setQuality(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (files.length > 0) reconvertAll(format, q);
    }, 300);
  };

  const onRemove = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const onClearAll = () => setFiles([]);

  const downloadOne = (file) => {
    if (!file.output) return;
    const fmtMeta = FORMATS.find(f => f.id === format);
    const url = URL.createObjectURL(file.output);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.input.name.replace(/\.[^.]+$/, '') + '.' + (fmtMeta?.ext || 'jpg');
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadAll = () => {
    files.filter(f => f.output).forEach((f, i) => setTimeout(() => downloadOne(f), i * 120));
  };

  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); onClearAll(); return; }
      if (meta && e.key.toLowerCase() === 'd') { e.preventDefault(); downloadAll(); return; }
      if (meta && e.key.toLowerCase() === 'o') { e.preventDefault(); document.querySelector('input[type=file]')?.click(); return; }
      if (!meta && /^[1-4]$/.test(e.key) && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        onQualityChange(QUALITY_PRESETS[+e.key - 1].value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [files, format, quality]);

  return (
    <div style={HC.app}>
      <nav style={HC.nav}>
        <div style={HC.navInner}>
          <FALogo size={22} />
          <div style={HC.crumbs}>
            <a href="Tools.html" style={HC.crumbLink}>Narzędzia</a>
            <span style={HC.crumbSep}>/</span>
            <span style={HC.crumbDim}>Obrazy</span>
            <span style={HC.crumbSep}>/</span>
            <span style={HC.crumbCurr}>HEIC Converter</span>
          </div>
          <div style={HC.navRight}>
            <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={HC.navGh}>GitHub ↗</a>
          </div>
        </div>
      </nav>

      <header style={HC.header}>
        <div style={HC.headerInner}>
          <div style={HC.headerLeft}>
            <div style={HC.headerEyebrow}>OBRAZY · KONWERTER</div>
            <h1 style={HC.headerTitle}>HEIC Converter</h1>
            <p style={HC.headerSub}>
              Zdjęcia z iPhone na <strong>JPG / PNG / WEBP</strong> — bez instalowania nic, bez uploadu.
              Dekoder libheif w przeglądarce. <span style={HC.headerLock}>● 0 żądań sieciowych</span>
            </p>
          </div>
        </div>
      </header>

      <ToolBar
        format={format} setFormat={onFormatChange}
        quality={quality} setQuality={onQualityChange}
        files={files}
        onClearAll={onClearAll}
        onDownloadAll={downloadAll}
      />

      <main style={HC.workspace}>
        <DropZone onFiles={onAddFiles} hasFiles={files.length > 0} />
        {files.length > 0 ? (
          <div style={HC.list}>
            {files.map(f => (
              <FileRow
                key={f.id} file={f} format={format}
                onRemove={() => onRemove(f.id)}
                onDownload={() => downloadOne(f)}
                onPreview={() => setPreview(f)}
              />
            ))}
          </div>
        ) : <EmptyState />}
      </main>

      <section style={HC.manifest}>
        <div style={HC.manifestInner}>
          <div style={HC.manifestEyebrow}>DLACZEGO TO MA SENS</div>
          <div style={HC.manifestText}>
            <strong>Bo przesyłanie zdjęć z urlopu na czyjś serwer to kiepski deal.</strong> HEIC dekodujemy w Twojej przeglądarce
            przez WebAssembly. Żadne pliki nie opuszczają Twojego urządzenia. Otwierasz, konwertujesz, pobierasz. Koniec historii.
            <a href="Article.html" style={HC.manifestLink}>O filozofii projektu →</a>
          </div>
        </div>
      </section>

      <footer style={HC.foot}>
        <div style={HC.footInner}>
          <div style={HC.footLeft}>
            <FALogo size={18} />
            <span style={HC.footSep}>·</span>
            <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={HC.footLink}>adamszczotka.dev ↗</a>
          </div>
          <div style={HC.footRight}>
            <a href="Tools.html" style={HC.footLink}>Wszystkie narzędzia</a>
            <a href="Articles.html" style={HC.footLink}>Dziennik</a>
            <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={HC.footLink}>GitHub ↗</a>
          </div>
        </div>
      </footer>

      {preview && <PreviewModal file={preview} onClose={() => setPreview(null)} />}
    </div>
  );
};

// ==================== Styles ====================
const HC = {
  app: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: '"Inter", sans-serif' },

  nav: { position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(12px)' },
  navInner: { maxWidth: 1600, margin: '0 auto', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' },
  crumbs: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  crumbLink: { color: 'rgba(255,255,255,.5)', textDecoration: 'none' },
  crumbSep: { color: 'rgba(255,255,255,.25)' },
  crumbDim: { color: 'rgba(255,255,255,.45)' },
  crumbCurr: { color: '#fff' },
  navRight: { display: 'flex', gap: 16, fontSize: 13 },
  navGh: { color: 'rgba(255,255,255,.6)', textDecoration: 'none' },

  header: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(180deg, rgba(245,158,11,.04), transparent)' },
  headerInner: { maxWidth: 1600, margin: '0 auto', padding: '40px 32px 32px' },
  headerLeft: { maxWidth: 720 },
  headerEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 14 },
  headerTitle: { fontFamily: '"Fraunces", serif', fontSize: 56, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.03em', margin: 0 },
  headerSub: { fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', marginTop: 14, marginBottom: 0 },
  headerLock: { color: '#22c55e', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, marginLeft: 8 },

  toolbar: { position: 'sticky', top: 53, zIndex: 25, background: 'rgba(12,12,18,.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,.08)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' },
  tbLeft: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  tbGroup: { display: 'flex', alignItems: 'center', gap: 12 },
  tbLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.18em' },
  segRow: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' },
  segBtn: { padding: '6px 12px', borderRadius: 5, border: 'none', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer', transition: 'all .15s' },
  segBtnActive: { background: ACCENT_GLOW, color: '#fff', boxShadow: `inset 0 0 0 1px ${ACCENT_BORDER}` },
  presetRow: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.06)' },
  presetBtn: { padding: '6px 10px', borderRadius: 5, border: 'none', background: 'transparent', color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' },
  presetBtnActive: { background: ACCENT_GLOW, color: '#fff', boxShadow: `inset 0 0 0 1px ${ACCENT_BORDER}` },
  presetBtnDisabled: { opacity: 0.35, cursor: 'not-allowed' },
  sliderWrap: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' },
  slider: { WebkitAppearance: 'none', appearance: 'none', width: 100, height: 4, borderRadius: 2, background: 'rgba(255,255,255,.1)', outline: 'none', cursor: 'pointer' },
  sliderVal: { fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: ACCENT, minWidth: 26, textAlign: 'right', fontWeight: 600 },

  tbRight: { display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  statBlock: { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.15em', textTransform: 'uppercase' },
  statVal: { fontSize: 14, fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' },
  tbActions: { display: 'flex', gap: 8 },
  actionBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' },
  actionBtnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: ACCENT, color: '#1a1100', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' },
  actionBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },

  workspace: { maxWidth: 1600, margin: '0 auto', padding: '24px 32px 80px', display: 'flex', flexDirection: 'column', gap: 16 },

  dropzone: { border: '1.5px dashed rgba(255,255,255,.15)', borderRadius: 16, padding: '60px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all .2s', background: 'rgba(255,255,255,.015)', cursor: 'default' },
  dropzoneOver: { borderColor: ACCENT, background: ACCENT_GLOW, transform: 'scale(1.005)' },
  dropzoneSlim: { padding: '14px 20px', flexDirection: 'row', borderStyle: 'solid', borderColor: 'rgba(255,255,255,.08)' },
  dropIcon: { color: ACCENT, marginBottom: 4 },
  dropTitle: { fontSize: 22, fontWeight: 500, fontFamily: '"Fraunces", serif', letterSpacing: '-0.01em' },
  dropSub: { fontSize: 13, color: 'rgba(255,255,255,.55)', textAlign: 'center', maxWidth: 480 },
  dropBtn: { marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: ACCENT, color: '#1a1100', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  dropSlimBtn: { width: '100%', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'transparent', color: ACCENT, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer', justifyContent: 'flex-start' },

  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  row: { display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 16, alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 },
  rowThumb: { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,.04)', position: 'relative', cursor: 'pointer' },
  rowThumbEmpty: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heicBadge: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, fontWeight: 700, color: ACCENT, letterSpacing: '0.1em', padding: '3px 6px', background: ACCENT_GLOW, borderRadius: 3 },
  rowSpinner: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 22, height: 22, border: '2px solid rgba(255,255,255,.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'heicSpin 0.8s linear infinite' },
  rowInfo: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  rowName: { fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  rowMeta: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: '"JetBrains Mono", monospace', flexWrap: 'wrap' },
  rowDim: { color: 'rgba(255,255,255,.4)' },
  rowSep: { color: 'rgba(255,255,255,.2)' },
  rowSize: { color: 'rgba(255,255,255,.55)' },
  rowArrow: { color: 'rgba(255,255,255,.35)', fontWeight: 600 },
  rowSizeOut: { color: '#fff' },
  rowSavings: { padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 },
  rowSavingsPositive: { background: 'rgba(34,197,94,.15)', color: '#22c55e' },
  rowSavingsNegative: { background: 'rgba(239,68,68,.15)', color: '#ef4444' },
  rowStatus: { color: ACCENT },
  rowStatusErr: { color: '#ef4444' },
  rowActions: { display: 'flex', gap: 6 },
  rowDownload: { width: 32, height: 32, borderRadius: 8, background: ACCENT_GLOW, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  rowRemove: { width: 32, height: 32, borderRadius: 8, background: 'transparent', color: 'rgba(255,255,255,.4)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },

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

  kbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 5px', background: 'rgba(0,0,0,.2)', borderRadius: 3, opacity: 0.7, marginLeft: 6 },
  kbdInline: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, padding: '2px 6px', background: 'rgba(255,255,255,.08)', borderRadius: 4, color: '#fff', margin: '0 2px' },

  modalBack: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 },
  modalBox: { position: 'relative', maxWidth: '90vw', maxHeight: '90vh', background: '#0f0f15', borderRadius: 14, border: '1px solid rgba(255,255,255,.08)', overflow: 'hidden' },
  modalClose: { position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  modalImg: { display: 'block', maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain' },
  modalMeta: { display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 12, fontFamily: '"JetBrains Mono", monospace', flexWrap: 'wrap' },
  modalName: { color: '#fff', fontWeight: 600 },
  modalDim: { color: 'rgba(255,255,255,.5)' },
  modalSize: { color: ACCENT },

  manifest: { borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '32px 0', background: 'rgba(255,255,255,.015)' },
  manifestInner: { maxWidth: 1100, margin: '0 auto', padding: '0 32px' },
  manifestEyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: ACCENT, letterSpacing: '0.2em', marginBottom: 14 },
  manifestText: { fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,.85)', fontFamily: '"Fraunces", serif', fontWeight: 400 },
  manifestLink: { color: ACCENT, textDecoration: 'none', marginLeft: 8, fontFamily: '"Inter", sans-serif', fontSize: 14 },

  foot: { borderTop: '1px solid rgba(255,255,255,.06)' },
  footInner: { maxWidth: 1600, margin: '0 auto', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  footLeft: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'rgba(255,255,255,.5)' },
  footRight: { display: 'flex', gap: 20, fontSize: 13 },
  footSep: { color: 'rgba(255,255,255,.25)' },
  footLink: { color: 'rgba(255,255,255,.6)', textDecoration: 'none' },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HeicApp />);
