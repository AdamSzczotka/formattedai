// PDF Tools — operation rail + input pane (files/pages) + output pane.
// 9 operations: merge, split, compress, img2pdf, rotate, pdf2jpg, crop, forms, annotate.
const { useState, useEffect, useMemo, useRef } = React;

const OPS = [
  { id: 'merge',    label: 'Łącz',          short: 'merge',    accepts: '.pdf',
    desc: 'Połącz wiele PDF-ów w jeden',
    cta: 'Połącz pliki', minFiles: 2,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="6" height="12" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M7 8h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'split',    label: 'Dziel',         short: 'split',    accepts: '.pdf',
    desc: 'Wybierz strony do zachowania',
    cta: 'Podziel PDF', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M5 1L1 5M11 1l4 4M8 6v9M4 10l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'compress', label: 'Kompresuj',     short: 'compress', accepts: '.pdf',
    desc: 'Zmniejsz wagę pliku',
    cta: 'Kompresuj', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 1v14M12 1v14M1 4h4M11 4h4M1 12h4M11 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'img2pdf',  label: 'IMG → PDF',     short: 'img2pdf',  accepts: '.jpg,.jpeg,.png,.webp,.heic,.heif',
    desc: 'Zdjęcia / skany → PDF',
    cta: 'Zbuduj PDF', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="6" r="1.5" fill="currentColor"/><path d="M1 12l4-4 2 2 3-4 5 6" stroke="currentColor" strokeWidth="1.3" fill="none"/></svg> },
  { id: 'rotate',   label: 'Obróć',          short: 'rotate',   accepts: '.pdf',
    desc: 'Obróć strony 90/180/270°',
    cta: 'Zastosuj obrót', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M13.5 2.5A6.5 6.5 0 102.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M1 5.5l1.5 2.5 2.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'pdf2jpg',  label: 'PDF → JPG',     short: 'pdf2jpg',  accepts: '.pdf',
    desc: 'Strony jako pliki JPG',
    cta: 'Eksportuj JPG', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13l4-4 2.5 2.5 3-3.5 4.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 2v4M9 4h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'crop',     label: 'Przytnij',      short: 'crop',     accepts: '.pdf',
    desc: 'Przytnij marginesy stron',
    cta: 'Zastosuj kadrowanie', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 0v12h12M0 4h12v12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'forms',    label: 'Formularze',    short: 'forms',    accepts: '.pdf',
    desc: 'Wypełnij i spłaszcz formularz',
    cta: 'Spłaszcz formularz', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 5h8M4 8h5M4 11h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
  { id: 'annotate', label: 'Adnotacje',     short: 'annotate', accepts: '.pdf',
    desc: 'Tekst, podkreślenia, sygnatura',
    cta: 'Zapisz z adnotacjami', minFiles: 1,
    icon: (s) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M11 1l4 4-9 9H2v-4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M9 3l4 4" stroke="currentColor" strokeWidth="1.3"/></svg> },
];

function PdfApp() {
  const [op, setOp] = useState('merge');
  const [files, setFiles] = useState([]); // {id, name, size, pages}
  const [pages, setPages] = useState([]); // for split/rotate/crop: {file, idx, selected, rotation}
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [progress, setProgress] = useState({ pct: 0, msg: '' });
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);
  const [opts, setOpts] = useState({
    compressPreset: 'balanced',
    stripMeta: true,
    quality: 65,
    rotateAngle: 90,
    jpgQuality: 90,
    jpgDpi: 150,
    splitSeparate: false,
    pageSize: 'A4',
    orientation: 'portrait',
  });
  const inputRef = useRef(null);
  const cur = OPS.find(o => o.id === op);

  // — file management
  const addFiles = (incoming) => {
    const arr = Array.from(incoming || []);
    const next = arr.map(f => ({
      id: Math.random().toString(36).slice(2, 9),
      name: f.name,
      size: f.size,
      pages: Math.floor(Math.random() * 24 + 4),
    }));
    setFiles(prev => [...prev, ...next]);
    // also seed page grid for split-like ops
    setPages(prev => [...prev, ...next.flatMap(f =>
      Array.from({length: f.pages}).map((_, idx) => ({
        fileId: f.id, fileName: f.name, idx: idx + 1,
        selected: true, rotation: 0,
      }))
    )]);
  };
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setPages(prev => prev.filter(p => p.fileId !== id));
  };
  const moveFile = (id, dir) => {
    setFiles(prev => {
      const i = prev.findIndex(f => f.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const togglePage = (i) => setPages(p => p.map((pg, idx) => idx === i ? {...pg, selected: !pg.selected} : pg));
  const rotatePage = (i, d) => setPages(p => p.map((pg, idx) => idx === i ? {...pg, rotation: (pg.rotation + d + 360) % 360} : pg));
  const selectAllPages = (v) => setPages(p => p.map(pg => ({...pg, selected: v})));

  const clearAll = () => {
    setFiles([]); setPages([]); setResult(null); setPhase('idle');
  };

  const switchOp = (newOp) => {
    setOp(newOp);
    setResult(null);
    setPhase('idle');
    // keep files if accept matches, else reset
    const newAccepts = OPS.find(o => o.id === newOp).accepts;
    if (newAccepts === '.pdf' && files.length && files.every(f => /\.pdf$/i.test(f.name))) return;
    if (newOp === 'img2pdf' && files.length && files.every(f => /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name))) return;
    setFiles([]); setPages([]);
  };

  // — drag/drop
  useEffect(() => {
    const dragOver = (e) => { e.preventDefault(); setDrag(true); };
    const dragLeave = (e) => { if (e.target === document.documentElement || e.target === document.body) setDrag(false); };
    const drop = (e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); };
    window.addEventListener('dragover', dragOver);
    window.addEventListener('dragleave', dragLeave);
    window.addEventListener('drop', drop);
    return () => { window.removeEventListener('dragover', dragOver); window.removeEventListener('dragleave', dragLeave); window.removeEventListener('drop', drop); };
  });

  // — fake processing
  const run = async () => {
    if (files.length < cur.minFiles) return;
    setPhase('running');
    const steps = [
      'wczytywanie plików',
      'parsowanie struktury PDF',
      cur.id === 'merge' ? 'budowanie scalonego dokumentu' :
      cur.id === 'split' ? 'wycinanie wybranych stron' :
      cur.id === 'compress' ? 'optymalizacja obrazów + recompress' :
      cur.id === 'img2pdf' ? 'pakowanie obrazów do PDF' :
      cur.id === 'rotate' ? 'aktualizacja macierzy obrotu' :
      cur.id === 'pdf2jpg' ? 'render stron do bitmap' :
      cur.id === 'crop' ? 'aktualizacja MediaBox' :
      cur.id === 'forms' ? 'spłaszczanie pól AcroForm' :
      'zapisywanie warstwy adnotacji',
      'zapisywanie wyniku',
    ];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 350));
      setProgress({ pct: Math.round(((i + 1) / steps.length) * 100), msg: steps[i] });
    }
    const totalSize = files.reduce((s, f) => s + f.size, 0);
    const newSize = cur.id === 'compress' ? totalSize * (opts.compressPreset === 'maximum' ? 0.32 : opts.compressPreset === 'balanced' ? 0.55 : 0.78)
      : cur.id === 'split' ? totalSize * (pages.filter(p => p.selected).length / Math.max(pages.length, 1))
      : cur.id === 'pdf2jpg' ? totalSize * 0.6
      : cur.id === 'img2pdf' ? totalSize * 1.05
      : totalSize;
    setResult({
      filename: outFilename(cur.id, files),
      sizeBefore: totalSize,
      sizeAfter: Math.round(newSize),
      files: files.length,
      pages: pages.length || files.reduce((s,f)=>s+f.pages,0),
    });
    setPhase('done');
  };

  const setOpt = (k, v) => setOpts(o => ({...o, [k]: v}));
  const totalPages = pages.length || files.reduce((s, f) => s + f.pages, 0);
  const selectedPages = pages.filter(p => p.selected).length;

  return (
    <div style={P.page}>
      {drag && <DragOverlay accept={cur.accepts} label={cur.label} />}
      <ToolNav crumb={`PDF / ${cur.label}`} />

      <main style={P.main}>
        <Header op={cur} files={files.length} pages={totalPages} />

        <div style={P.grid}>
          {/* RAIL */}
          <aside style={P.rail}>
            <div style={P.railLabel}>OPERACJE</div>
            <div style={P.railList}>
              {OPS.map(o => (
                <button key={o.id} onClick={() => switchOp(o.id)}
                  style={{...P.railBtn, ...(o.id === op ? P.railBtnActive : {})}}>
                  <span style={{...P.railIcon, ...(o.id === op ? P.railIconActive : {})}}>{o.icon(15)}</span>
                  <span style={P.railTextWrap}>
                    <span style={P.railText}>{o.label}</span>
                    <span style={P.railShort}>{o.short}</span>
                  </span>
                  {o.id === op && <span style={P.railArrow}>›</span>}
                </button>
              ))}
            </div>
            <div style={P.railFoot}>
              <span style={P.railFootDot}>●</span>
              <span>0 żądań sieciowych</span>
            </div>
          </aside>

          {/* INPUT */}
          <section style={P.pane}>
            <header style={P.paneHead}>
              <div>
                <div style={P.paneLabel}>WEJŚCIE · {cur.accepts}</div>
                <div style={P.paneExtra}>
                  {files.length === 0 ? 'przeciągnij lub wybierz pliki' :
                   `${files.length} plików · ${formatSize(files.reduce((s,f)=>s+f.size,0))} · ${totalPages} stron`}
                </div>
              </div>
              <div style={P.paneActions}>
                <button onClick={() => inputRef.current?.click()} style={P.toolBtn}>+ Dodaj</button>
                <button onClick={clearAll} disabled={!files.length}
                  style={{...P.toolBtn, ...(!files.length ? P.toolBtnDis : {})}}>Wyczyść</button>
              </div>
            </header>
            <div style={P.paneBody}>
              {files.length === 0 ? (
                <DropZone op={cur} onPick={() => inputRef.current?.click()} />
              ) : (
                <>
                  {(op === 'merge' || op === 'compress' || op === 'img2pdf' || op === 'forms' || op === 'annotate') && (
                    <FileList op={op} files={files} onRemove={removeFile} onMove={moveFile} />
                  )}
                  {(op === 'split' || op === 'pdf2jpg') && (
                    <PageGrid pages={pages} togglePage={togglePage} selectAll={selectAllPages}
                      mode={op === 'split' ? 'select' : 'preview'} />
                  )}
                  {(op === 'rotate' || op === 'crop') && (
                    <PageGrid pages={pages} mode={op} togglePage={togglePage} rotatePage={rotatePage}
                      defaultRotate={opts.rotateAngle} selectAll={selectAllPages} />
                  )}
                </>
              )}
              <input ref={inputRef} type="file" multiple hidden accept={cur.accepts}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
            </div>
          </section>

          {/* OPTIONS + OUTPUT */}
          <section style={P.pane}>
            <header style={P.paneHead}>
              <div>
                <div style={P.paneLabel}>USTAWIENIA · WYJŚCIE</div>
                <div style={P.paneExtra}>{cur.desc}</div>
              </div>
              <RunBtn op={cur} disabled={files.length < cur.minFiles || phase === 'running'}
                running={phase === 'running'} onRun={run} />
            </header>
            <div style={P.paneBody}>
              <Options op={op} opts={opts} setOpt={setOpt}
                pages={pages} selectedPages={selectedPages} totalPages={totalPages}
                selectAllPages={selectAllPages} />
              <div style={P.outDivider}>
                <span style={P.outDivLabel}>WYNIK</span>
              </div>
              {phase === 'idle' && !result && <OutputEmpty op={cur} files={files.length} />}
              {phase === 'running' && <OutputProgress progress={progress} op={cur} />}
              {phase === 'done' && result && <OutputResult result={result} op={cur} onAgain={() => { setResult(null); setPhase('idle'); }} />}
            </div>
          </section>
        </div>

        <Privacy op={cur} />
      </main>

      <ToolFooter />
    </div>
  );
}

// ───────────────────────────────────────────────────────

const ToolNav = ({ crumb }) => (
  <nav style={P.nav}>
    <div style={P.navInner}>
      <FALogo size={22} asLink={false} />
      <div style={P.crumbs}>
        <a href="Tools.html" style={P.crumbLink}>Narzędzia</a>
        <span style={P.crumbSep}>/</span>
        <span style={P.crumbCur}>{crumb}</span>
      </div>
      <div style={P.navRight}>
        <a href="Tools.html" style={P.navBtn}>Wszystkie narzędzia</a>
      </div>
    </div>
  </nav>
);

const Header = ({ op, files, pages }) => (
  <header style={P.head}>
    <div>
      <div style={P.eyebrow}>NARZĘDZIA / PDF — {op.label.toUpperCase()}</div>
      <h1 style={P.title}>{op.label}<span style={P.titleDot}>.</span></h1>
      <p style={P.tag}>{op.desc}. Wszystko dzieje się lokalnie — pliki nie idą na serwer.</p>
    </div>
    <div style={P.stats}>
      <div style={P.stat}><span style={P.statN}>{files}</span><span style={P.statL}>plików</span></div>
      <div style={P.stat}><span style={P.statN}>{pages}</span><span style={P.statL}>stron</span></div>
      <div style={P.stat}><span style={P.statN}>0</span><span style={P.statL}>żądań</span></div>
      <div style={P.stat}><span style={P.statN}>~{op.id === 'compress' ? 45 : op.id === 'pdf2jpg' ? 60 : 30}%</span><span style={P.statL}>oszczędność</span></div>
    </div>
  </header>
);

const DropZone = ({ op, onPick }) => (
  <div style={P.dz}>
    <div style={P.dzVisual}>
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
        <path d="M16 6h18l10 10v32a4 4 0 01-4 4H16a4 4 0 01-4-4V10a4 4 0 014-4z" stroke="rgba(167,139,250,.4)" strokeWidth="1.5"/>
        <path d="M34 6v10h10" stroke="rgba(167,139,250,.35)" strokeWidth="1.5"/>
        <text x="28" y="38" fontFamily="JetBrains Mono" fontSize="9" fill="rgba(167,139,250,.7)" textAnchor="middle" fontWeight="600">PDF</text>
      </svg>
    </div>
    <div style={P.dzTitle}>Przeciągnij {op.id === 'img2pdf' ? 'obrazki' : 'pliki PDF'} tutaj</div>
    <div style={P.dzSub}>{op.accepts.replaceAll('.', '').replaceAll(',', ' · ').toUpperCase()}{op.id === 'merge' ? ' — wiele plików, drag & drop ustawia kolejność' : ''}</div>
    <button onClick={onPick} style={P.dzBtn}>Wybierz pliki</button>
    <span style={P.dzPrivacy}>🔒 lokalnie · pliki nie wychodzą z przeglądarki</span>
  </div>
);

const FileList = ({ op, files, onRemove, onMove }) => (
  <div style={P.fl}>
    {op === 'merge' && (
      <div style={P.flHint}>
        <span style={P.flHintNum}>↕</span>
        <span>Strzałki zmieniają kolejność łączenia. Pliki będą sklejone w kolejności od góry do dołu.</span>
      </div>
    )}
    {files.map((f, i) => (
      <div key={f.id} style={P.flRow}>
        <div style={P.flIdx}>{String(i + 1).padStart(2, '0')}</div>
        <div style={P.flThumb}>
          <span style={P.flExt}>{f.name.split('.').pop().toUpperCase()}</span>
          <span style={P.flPages}>{f.pages}p</span>
        </div>
        <div style={P.flMeta}>
          <div style={P.flName}>{f.name}</div>
          <div style={P.flSub}>{formatSize(f.size)} · {f.pages} stron · {Math.round(f.size/f.pages/1024)}KB/strona</div>
        </div>
        {op === 'merge' && (
          <div style={P.flMove}>
            <button onClick={() => onMove(f.id, -1)} disabled={i === 0} style={P.flArrow}>↑</button>
            <button onClick={() => onMove(f.id, 1)} disabled={i === files.length - 1} style={P.flArrow}>↓</button>
          </div>
        )}
        <button onClick={() => onRemove(f.id)} style={P.flRm}>×</button>
      </div>
    ))}
  </div>
);

const PageGrid = ({ pages, mode, togglePage, rotatePage, selectAll, defaultRotate }) => {
  const selected = pages.filter(p => p.selected).length;
  return (
    <div style={P.pg}>
      <div style={P.pgBar}>
        <span style={P.pgCount}>
          {mode === 'select' || mode === 'crop' || mode === 'rotate'
            ? <><strong style={{color:'#fff'}}>{selected}</strong>/{pages.length} zaznaczonych</>
            : <>{pages.length} stron do eksportu</>}
        </span>
        {(mode === 'select' || mode === 'rotate' || mode === 'crop') && (
          <div style={P.pgActions}>
            <button onClick={() => selectAll(true)} style={P.pgAct}>Wszystko</button>
            <button onClick={() => selectAll(false)} style={P.pgAct}>Nic</button>
            <button onClick={() => pages.forEach((p,i) => i % 2 === 1 && togglePage(i))} style={P.pgAct}>Co druga</button>
          </div>
        )}
      </div>
      <div style={P.pgGrid}>
        {pages.map((pg, i) => (
          <div key={i} onClick={() => mode !== 'preview' && togglePage(i)}
            style={{...P.pgCard, ...(pg.selected ? P.pgCardOn : P.pgCardOff), ...(mode === 'preview' ? {cursor:'default'} : {})}}>
            <div style={{...P.pgPaper, transform: `rotate(${pg.rotation}deg)`}}>
              <div style={P.pgPaperLine}></div>
              <div style={P.pgPaperLine}></div>
              <div style={{...P.pgPaperLine, width: '60%'}}></div>
              <div style={P.pgPaperLine}></div>
              <div style={{...P.pgPaperLine, width: '70%'}}></div>
              {mode === 'crop' && pg.selected && <div style={P.pgCropBox}></div>}
            </div>
            <div style={P.pgFoot}>
              <span style={P.pgNum}>{String(pg.idx).padStart(2, '0')}</span>
              {pg.rotation > 0 && <span style={P.pgRotBadge}>{pg.rotation}°</span>}
            </div>
            {mode === 'rotate' && (
              <div style={P.pgRotCtrls}>
                <button onClick={(e) => { e.stopPropagation(); rotatePage(i, -90); }} style={P.pgRotBtn}>↺</button>
                <button onClick={(e) => { e.stopPropagation(); rotatePage(i, 90); }} style={P.pgRotBtn}>↻</button>
              </div>
            )}
            {(mode === 'select') && (
              <div style={{...P.pgCheck, ...(pg.selected ? P.pgCheckOn : {})}}>{pg.selected ? '✓' : ''}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const Options = ({ op, opts, setOpt, pages, selectedPages, totalPages, selectAllPages }) => {
  if (op === 'compress') return (
    <div style={P.optBox}>
      <Field label="PRESET">
        <Segmented value={opts.compressPreset} onChange={v => setOpt('compressPreset', v)}
          options={[
            {v:'light', l:'Lekka', s:'~20%'},
            {v:'balanced', l:'Zbalansowana', s:'~45%'},
            {v:'maximum', l:'Maksymalna', s:'~68%'},
          ]} />
      </Field>
      <Field label={`JAKOŚĆ OBRAZÓW · ${opts.quality}`}>
        <Slider value={opts.quality} min={20} max={100} onChange={v => setOpt('quality', v)} />
      </Field>
      <Field label="OPCJE">
        <Check label="Usuń metadane (autor, data, software)" checked={opts.stripMeta} onChange={v => setOpt('stripMeta', v)} />
      </Field>
    </div>
  );
  if (op === 'rotate') return (
    <div style={P.optBox}>
      <Field label="DOMYŚLNY KĄT (klik na stronę)">
        <Segmented value={opts.rotateAngle} onChange={v => setOpt('rotateAngle', v)}
          options={[{v:90, l:'90° ↻'}, {v:180, l:'180°'}, {v:270, l:'270° ↺'}]} />
      </Field>
      <div style={P.hint}>💡 Każda strona ma własny przycisk ↺ / ↻ w siatce po lewej.</div>
    </div>
  );
  if (op === 'pdf2jpg') return (
    <div style={P.optBox}>
      <Field label={`JAKOŚĆ JPG · ${opts.jpgQuality}%`}>
        <Slider value={opts.jpgQuality} min={50} max={100} onChange={v => setOpt('jpgQuality', v)} />
      </Field>
      <Field label={`ROZDZIELCZOŚĆ · ${opts.jpgDpi} DPI`}>
        <Segmented value={opts.jpgDpi} onChange={v => setOpt('jpgDpi', v)}
          options={[{v:72, l:'72', s:'web'}, {v:150, l:'150', s:'standard'}, {v:300, l:'300', s:'print'}]} />
      </Field>
      <div style={P.hint}>📦 {totalPages || 0} stron → ZIP z plikami JPG, ponumerowanymi.</div>
    </div>
  );
  if (op === 'split') return (
    <div style={P.optBox}>
      <Field label="ZAKRES STRON">
        <input type="text" placeholder="np. 1-3, 5, 7-12" style={P.text}
          onChange={e => {
            const sel = parseRange(e.target.value, totalPages);
            if (sel) selectAllPages(false), sel.forEach(i => pages[i-1] && (pages[i-1].selected = true));
          }} />
      </Field>
      <Field label="TRYB">
        <Segmented value={opts.splitSeparate ? 'separate' : 'one'} onChange={v => setOpt('splitSeparate', v === 'separate')}
          options={[{v:'one', l:'Jeden PDF', s:'wybrane strony'}, {v:'separate', l:'ZIP', s:'każda osobno'}]} />
      </Field>
      <div style={P.hint}>📑 {selectedPages}/{totalPages} stron zaznaczonych w siatce po lewej.</div>
    </div>
  );
  if (op === 'crop') return (
    <div style={P.optBox}>
      <Field label="MARGINESY (mm)">
        <div style={P.cropGrid}>
          <NumIn label="góra" v="10" />
          <NumIn label="prawo" v="10" />
          <NumIn label="dół" v="10" />
          <NumIn label="lewo" v="10" />
        </div>
      </Field>
      <Field label="ZASTOSUJ DO">
        <Segmented value="all" options={[{v:'all', l:'Wszystkich'}, {v:'sel', l:'Zaznaczonych'}, {v:'odd', l:'Nieparzystych'}]} onChange={()=>{}} />
      </Field>
    </div>
  );
  if (op === 'img2pdf') return (
    <div style={P.optBox}>
      <Field label="ROZMIAR STRONY">
        <Segmented value={opts.pageSize} onChange={v => setOpt('pageSize', v)}
          options={[{v:'A4', l:'A4'}, {v:'Letter', l:'Letter'}, {v:'fit', l:'Dopasuj'}]} />
      </Field>
      <Field label="ORIENTACJA">
        <Segmented value={opts.orientation} onChange={v => setOpt('orientation', v)}
          options={[{v:'portrait', l:'Pionowo'}, {v:'landscape', l:'Poziomo'}, {v:'auto', l:'Auto'}]} />
      </Field>
      <Field label="OPCJE">
        <Check label="Jedna strona = jeden obrazek" checked />
        <Check label="Margines 10mm wokół" checked={false} />
      </Field>
    </div>
  );
  if (op === 'merge') return (
    <div style={P.optBox}>
      <Field label="OPCJE">
        <Check label="Dodaj zakładki z nazw plików" checked />
        <Check label="Wyczyść metadane wynikowego PDF" checked={false} />
        <Check label="Zachowaj formularze (AcroForm)" checked />
      </Field>
      <div style={P.hint}>📎 {pages.length || 0} łącznie stron → 1 dokument.</div>
    </div>
  );
  if (op === 'forms') return (
    <div style={P.optBox}>
      <Field label="PROCES">
        <Segmented value="flatten" options={[{v:'fill', l:'Wypełnij'}, {v:'flatten', l:'Spłaszcz'}, {v:'extract', l:'Eksport JSON'}]} onChange={()=>{}} />
      </Field>
      <div style={P.hint}>📝 Wykryto <strong style={{color:'#fff'}}>17 pól</strong> w formularzu — kliknij <em>Edytuj pola</em> w siatce.</div>
    </div>
  );
  if (op === 'annotate') return (
    <div style={P.optBox}>
      <Field label="NARZĘDZIE">
        <Segmented value="text" options={[{v:'text', l:'Tekst'}, {v:'mark', l:'Marker'}, {v:'sign', l:'Sygnatura'}]} onChange={()=>{}} />
      </Field>
      <div style={P.hint}>✏️ Kliknij stronę żeby otworzyć edytor adnotacji.</div>
    </div>
  );
  return null;
};

const Field = ({ label, children }) => (
  <div style={P.field}>
    <div style={P.fieldLabel}>{label}</div>
    <div style={P.fieldBody}>{children}</div>
  </div>
);

const Segmented = ({ value, onChange, options }) => (
  <div style={P.seg}>
    {options.map(o => (
      <button key={o.v} onClick={() => onChange(o.v)}
        style={{...P.segBtn, ...(o.v === value ? P.segBtnOn : {})}}>
        <span>{o.l}</span>
        {o.s && <span style={P.segSub}>{o.s}</span>}
      </button>
    ))}
  </div>
);

const Slider = ({ value, min, max, onChange }) => (
  <input type="range" min={min} max={max} value={value} onChange={e => onChange(+e.target.value)} style={P.slider} />
);

const Check = ({ label, checked, onChange }) => {
  const [c, setC] = useState(checked);
  const v = onChange ? checked : c;
  const set = onChange || setC;
  return (
    <label style={P.check}>
      <span style={{...P.checkBox, ...(v ? P.checkBoxOn : {})}}>{v ? '✓' : ''}</span>
      <span style={P.checkLabel}>{label}</span>
      <input type="checkbox" checked={v} onChange={e => set(e.target.checked)} style={{display:'none'}} />
    </label>
  );
};

const NumIn = ({ label, v }) => (
  <div style={P.numIn}>
    <span style={P.numLabel}>{label}</span>
    <input type="number" defaultValue={v} style={P.numField} />
  </div>
);

const RunBtn = ({ op, disabled, running, onRun }) => (
  <button onClick={onRun} disabled={disabled}
    style={{...P.runBtn, ...(disabled ? P.runBtnDis : {})}}>
    {running ? <span style={P.spin}></span> : <span style={{fontSize:11}}>▶</span>}
    {running ? 'Pracuję…' : op.cta}
  </button>
);

const OutputEmpty = ({ op, files }) => (
  <div style={P.empty}>
    <div style={P.emptyMark}>{op.icon(28)}</div>
    <div style={P.emptyTitle}>Wynik pojawi się tutaj</div>
    <div style={P.emptyDesc}>
      {files === 0 ? `Dodaj ${op.id === 'img2pdf' ? 'obrazki' : 'pliki PDF'} po lewej`
        : files < op.minFiles ? `Potrzeba minimum ${op.minFiles} plików`
        : `Kliknij "${op.cta}" żeby przetworzyć ${files} plików`}
    </div>
  </div>
);

const OutputProgress = ({ progress, op }) => (
  <div style={P.prog}>
    <div style={P.progHead}>
      <span style={P.progOp}>{op.label.toUpperCase()}</span>
      <span style={P.progPct}>{progress.pct}%</span>
    </div>
    <div style={P.progMsg}>{progress.msg}</div>
    <div style={P.progBar}>
      <div style={{...P.progBarFill, width: `${progress.pct}%`}}></div>
    </div>
  </div>
);

const OutputResult = ({ result, op, onAgain }) => {
  const savings = result.sizeBefore ? Math.round((1 - result.sizeAfter / result.sizeBefore) * 100) : 0;
  return (
    <div style={P.res}>
      <div style={P.resTopline}>
        <div style={P.resCheck}>✓</div>
        <div>
          <div style={P.resHead}>Gotowe — {op.label.toLowerCase()} zakończone</div>
          <div style={P.resFile}>{result.filename}</div>
        </div>
      </div>
      <div style={P.resStats}>
        <div style={P.resStat}>
          <span style={P.resStatL}>plików</span>
          <span style={P.resStatV}>{result.files}</span>
        </div>
        <div style={P.resStat}>
          <span style={P.resStatL}>stron</span>
          <span style={P.resStatV}>{result.pages}</span>
        </div>
        <div style={P.resStat}>
          <span style={P.resStatL}>przed</span>
          <span style={P.resStatV}>{formatSize(result.sizeBefore)}</span>
        </div>
        <div style={P.resStat}>
          <span style={P.resStatL}>po</span>
          <span style={P.resStatV}>{formatSize(result.sizeAfter)}</span>
        </div>
        {savings > 0 && (
          <div style={{...P.resStat, ...P.resStatHi}}>
            <span style={P.resStatL}>oszczędność</span>
            <span style={{...P.resStatV, color: '#22c55e'}}>−{savings}%</span>
          </div>
        )}
      </div>
      <div style={P.resBars}>
        <div style={P.resBarRow}>
          <span style={P.resBarL}>przed</span>
          <div style={P.resBarTrack}><div style={{...P.resBarFill, width: '100%', background: 'rgba(255,255,255,.2)'}}></div></div>
          <span style={P.resBarV}>{formatSize(result.sizeBefore)}</span>
        </div>
        <div style={P.resBarRow}>
          <span style={P.resBarL}>po</span>
          <div style={P.resBarTrack}><div style={{...P.resBarFill, width: `${(result.sizeAfter/result.sizeBefore)*100}%`, background: 'linear-gradient(90deg, #a78bfa, #7c6cf0)'}}></div></div>
          <span style={P.resBarV}>{formatSize(result.sizeAfter)}</span>
        </div>
      </div>
      <div style={P.resCta}>
        <button style={P.resDl}>↓ Pobierz {result.filename}</button>
        <button onClick={onAgain} style={P.resAgain}>↻ Przetwórz kolejny</button>
      </div>
    </div>
  );
};

const Privacy = ({ op }) => (
  <div style={P.priv}>
    <div style={P.privCol}>
      <span style={P.privKey}>SILNIK</span>
      <span style={P.privVal}>pdf-lib + pdf.js w WebAssembly. Cała operacja {op.label.toLowerCase()} dzieje się w Twojej przeglądarce.</span>
    </div>
    <div style={P.privCol}>
      <span style={P.privKey}>LIMITY</span>
      <span style={P.privVal}>Pliki do ~200MB każdy. Łącznie do 20 plików w jednej operacji. Procesor Twojego laptopa decyduje o czasie.</span>
    </div>
    <div style={P.privCol}>
      <span style={P.privKey}>ŻADEN UPLOAD</span>
      <span style={P.privVal}>Po wynikach: zamknij kartę i wszystko znika. Zero kopii. Zero logów. 0 żądań HTTP do plików.</span>
    </div>
  </div>
);

const ToolFooter = () => (
  <footer style={P.foot}>
    <div style={P.footInner}>
      <div style={P.footL}>
        <FALogo size={18} asLink={false} />
        <span style={P.footSep}>·</span>
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={P.footLink}>adamszczotka.dev ↗</a>
      </div>
      <div style={P.footR}>
        <a href="Articles.html" style={P.footLink}>Dziennik</a>
        <a href="Tools.html" style={P.footLink}>Narzędzia</a>
        <a href="https://github.com/AdamSzczotka" target="_blank" rel="noopener" style={P.footLink}>GitHub</a>
      </div>
    </div>
  </footer>
);

const DragOverlay = ({ accept, label }) => (
  <div style={P.dragOv}>
    <div style={P.dragInner}>
      <div style={P.dragMark}>+</div>
      <div style={P.dragTitle}>Upuść — {label.toLowerCase()}</div>
      <div style={P.dragSub}>{accept.toUpperCase()} · pliki nie idą na serwer</div>
    </div>
  </div>
);

// ─── Helpers ────────────────────────────────────────────────────
function formatSize(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
function outFilename(opId, files) {
  const base = files[0]?.name?.replace(/\.[^.]+$/, '') || 'document';
  if (opId === 'merge') return `merged-${files.length}-files.pdf`;
  if (opId === 'split') return `${base}-pages.pdf`;
  if (opId === 'compress') return `${base}-compressed.pdf`;
  if (opId === 'pdf2jpg') return `${base}-pages.zip`;
  if (opId === 'img2pdf') return `images-${files.length}.pdf`;
  if (opId === 'rotate') return `${base}-rotated.pdf`;
  if (opId === 'crop') return `${base}-cropped.pdf`;
  if (opId === 'forms') return `${base}-flat.pdf`;
  if (opId === 'annotate') return `${base}-annotated.pdf`;
  return `${base}-out.pdf`;
}
function parseRange(s, max) {
  if (!s) return null;
  const out = [];
  for (const part of s.split(',')) {
    const m = part.trim().match(/^(\d+)(?:-(\d+))?$/);
    if (!m) continue;
    const a = +m[1], b = +(m[2] || m[1]);
    for (let i = a; i <= b && i <= max; i++) out.push(i);
  }
  return out;
}

// ─── Styles ─────────────────────────────────────────────────────
const P = {
  page: { background: '#08080c', color: '#f0f0f4', fontFamily: '"Inter", -apple-system, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' },

  nav: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 },
  navInner: { maxWidth: 1700, margin: '0 auto', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
  crumbs: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  crumbLink: { color: 'rgba(255,255,255,.5)', textDecoration: 'none' },
  crumbSep: { color: 'rgba(255,255,255,.2)' },
  crumbCur: { color: '#fff' },
  navRight: { display: 'flex', gap: 12 },
  navBtn: { padding: '8px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(255,255,255,.75)', fontSize: 13, textDecoration: 'none' },

  main: { flex: 1, maxWidth: 1700, width: '100%', margin: '0 auto', padding: '32px 32px 64px', display: 'flex', flexDirection: 'column', gap: 24 },
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 },
  eyebrow: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.18em', marginBottom: 14 },
  title: { fontFamily: '"Fraunces", serif', fontSize: 56, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.025em', margin: 0 },
  titleDot: { color: '#a78bfa' },
  tag: { fontSize: 15, color: 'rgba(255,255,255,.6)', margin: '10px 0 0', maxWidth: 540 },
  stats: { display: 'flex', gap: 28, padding: '14px 22px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 10 },
  stat: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 56 },
  statN: { fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 400, color: '#fff', lineHeight: 1 },
  statL: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' },

  // Grid
  grid: { display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 16, minHeight: 620 },

  // Rail
  rail: { background: '#0a0a12', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
  railLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.16em', padding: '4px 8px' },
  railList: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  railBtn: { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'transparent', border: '1px solid transparent', borderRadius: 7, color: 'rgba(255,255,255,.65)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', position: 'relative' },
  railBtnActive: { background: 'rgba(124,108,240,.1)', borderColor: 'rgba(167,139,250,.3)', color: '#fff' },
  railIcon: { width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', flexShrink: 0 },
  railIconActive: { color: '#a78bfa' },
  railTextWrap: { display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minWidth: 0 },
  railText: { fontSize: 13, fontWeight: 500 },
  railShort: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.3)' },
  railArrow: { color: '#a78bfa' },
  railFoot: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 8px 0', borderTop: '1px solid rgba(255,255,255,.05)', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)' },
  railFootDot: { color: '#22c55e', fontSize: 7 },

  // Pane (input/output)
  pane: { display: 'flex', flexDirection: 'column', background: '#0c0c14', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, overflow: 'hidden' },
  paneHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 16, flexWrap: 'wrap' },
  paneLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' },
  paneExtra: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4 },
  paneActions: { display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  paneBody: { flex: 1, overflowY: 'auto', maxHeight: 720 },
  toolBtn: { padding: '7px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: 'rgba(255,255,255,.75)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },
  toolBtnDis: { opacity: 0.4, cursor: 'not-allowed' },

  runBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' },
  runBtnDis: { opacity: 0.35, cursor: 'not-allowed' },
  spin: { width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'pdfSpin .7s linear infinite' },

  // Drop zone
  dz: { padding: '70px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', minHeight: 520, border: '1px dashed rgba(255,255,255,.08)', borderRadius: 8, margin: 18 },
  dzVisual: { padding: 14, background: 'rgba(124,108,240,.05)', borderRadius: 16 },
  dzTitle: { fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 400, color: '#fff' },
  dzSub: { fontSize: 12, color: 'rgba(255,255,255,.5)', maxWidth: 340, lineHeight: 1.5 },
  dzBtn: { padding: '10px 18px', background: 'rgba(124,108,240,.15)', border: '1px solid rgba(167,139,250,.4)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', marginTop: 4 },
  dzPrivacy: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(34,197,94,.6)', marginTop: 8 },

  // File list
  fl: { padding: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  flHint: { display: 'flex', gap: 10, padding: '10px 12px', background: 'rgba(124,108,240,.06)', border: '1px solid rgba(167,139,250,.15)', borderRadius: 8, fontSize: 12, color: 'rgba(255,255,255,.7)', marginBottom: 4, lineHeight: 1.4 },
  flHintNum: { color: '#a78bfa', fontFamily: '"JetBrains Mono", monospace' },
  flRow: { display: 'grid', gridTemplateColumns: '24px 56px 1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8 },
  flIdx: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)' },
  flThumb: { width: 56, height: 64, borderRadius: 4, background: 'linear-gradient(135deg, rgba(124,108,240,.15), rgba(124,108,240,.05))', border: '1px solid rgba(167,139,250,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 },
  flExt: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', fontWeight: 600 },
  flPages: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.5)' },
  flMeta: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
  flName: { fontSize: 13, color: '#fff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  flSub: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)' },
  flMove: { display: 'flex', flexDirection: 'column', gap: 2 },
  flArrow: { width: 22, height: 22, padding: 0, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, color: 'rgba(255,255,255,.6)', fontSize: 11, cursor: 'pointer' },
  flRm: { width: 28, height: 28, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16 },

  // Page grid
  pg: { padding: 14 },
  pgBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', marginBottom: 10, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8 },
  pgCount: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.65)' },
  pgActions: { display: 'flex', gap: 4 },
  pgAct: { padding: '4px 9px', background: 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 4, color: 'rgba(255,255,255,.6)', fontSize: 10, fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer' },
  pgGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(86px, 1fr))', gap: 8 },
  pgCard: { position: 'relative', aspectRatio: '0.7', display: 'flex', flexDirection: 'column', cursor: 'pointer', overflow: 'hidden', borderRadius: 6, transition: 'all .15s' },
  pgCardOn: { border: '1.5px solid rgba(167,139,250,.6)', background: 'rgba(124,108,240,.05)' },
  pgCardOff: { border: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.01)', opacity: 0.5 },
  pgPaper: { flex: 1, margin: 6, padding: '8px 6px', background: '#fff', borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 3, position: 'relative', transformOrigin: 'center', transition: 'transform .25s' },
  pgPaperLine: { height: 2, background: 'rgba(0,0,0,.15)', borderRadius: 1, width: '100%' },
  pgCropBox: { position: 'absolute', inset: 6, border: '1px dashed #7c6cf0', borderRadius: 2, pointerEvents: 'none' },
  pgFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 6px 6px' },
  pgNum: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.45)' },
  pgRotBadge: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#a78bfa', padding: '1px 4px', background: 'rgba(124,108,240,.15)', borderRadius: 2 },
  pgCheck: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 4, background: 'rgba(8,8,12,.8)', border: '1px solid rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' },
  pgCheckOn: { background: '#7c6cf0', borderColor: '#a78bfa' },
  pgRotCtrls: { position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2, opacity: 0.85 },
  pgRotBtn: { width: 22, height: 22, background: 'rgba(8,8,12,.85)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, color: '#a78bfa', fontSize: 10, cursor: 'pointer', padding: 0 },

  // Options
  optBox: { padding: 18, display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid rgba(255,255,255,.05)' },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  fieldLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.12em' },
  fieldBody: { display: 'flex', flexDirection: 'column', gap: 6 },
  seg: { display: 'flex', gap: 4 },
  segBtn: { flex: 1, padding: '9px 10px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 6, color: 'rgba(255,255,255,.65)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3, lineHeight: 1.2 },
  segBtnOn: { background: 'rgba(124,108,240,.12)', borderColor: 'rgba(167,139,250,.45)', color: '#fff' },
  segSub: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.4)' },
  slider: { width: '100%', accentColor: '#7c6cf0' },
  check: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 0' },
  checkBox: { width: 16, height: 16, border: '1px solid rgba(255,255,255,.2)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' },
  checkBoxOn: { background: '#7c6cf0', borderColor: '#a78bfa' },
  checkLabel: { fontSize: 13, color: 'rgba(255,255,255,.75)' },
  text: { width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#fff', fontSize: 13, fontFamily: '"JetBrains Mono", monospace' },
  cropGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  numIn: { display: 'flex', flexDirection: 'column', gap: 4 },
  numLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '0.1em', textTransform: 'uppercase' },
  numField: { padding: '7px 10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#fff', fontSize: 13, fontFamily: '"JetBrains Mono", monospace' },
  hint: { fontSize: 12, color: 'rgba(255,255,255,.5)', padding: '8px 0', lineHeight: 1.5 },

  // Output region
  outDivider: { padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.01)' },
  outDivLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.16em' },

  empty: { padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  emptyMark: { color: 'rgba(167,139,250,.4)', padding: 14, background: 'rgba(124,108,240,.04)', borderRadius: 12 },
  emptyTitle: { fontSize: 14, color: '#fff', fontWeight: 500 },
  emptyDesc: { fontSize: 12, color: 'rgba(255,255,255,.5)', maxWidth: 320, lineHeight: 1.5 },

  prog: { padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 12 },
  progHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  progOp: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.6)', letterSpacing: '0.1em' },
  progPct: { fontFamily: '"Fraunces", serif', fontSize: 22, color: '#fff' },
  progMsg: { fontSize: 13, color: 'rgba(167,139,250,.85)' },
  progBar: { height: 4, background: 'rgba(255,255,255,.05)', borderRadius: 2, overflow: 'hidden' },
  progBarFill: { height: '100%', background: 'linear-gradient(90deg, #a78bfa, #7c6cf0)', transition: 'width .25s' },

  res: { padding: 24, display: 'flex', flexDirection: 'column', gap: 18 },
  resTopline: { display: 'flex', alignItems: 'center', gap: 14 },
  resCheck: { width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontSize: 18 },
  resHead: { fontSize: 14, color: '#fff', fontWeight: 500 },
  resFile: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 2 },
  resStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: 10, padding: '12px 0' },
  resStat: { display: 'flex', flexDirection: 'column', gap: 4 },
  resStatHi: { padding: '8px 12px', background: 'rgba(34,197,94,.06)', borderRadius: 6 },
  resStatL: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '0.12em', textTransform: 'uppercase' },
  resStatV: { fontFamily: '"Fraunces", serif', fontSize: 18, color: '#fff' },
  resBars: { display: 'flex', flexDirection: 'column', gap: 8 },
  resBarRow: { display: 'grid', gridTemplateColumns: '50px 1fr 80px', alignItems: 'center', gap: 10 },
  resBarL: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)' },
  resBarTrack: { height: 6, background: 'rgba(255,255,255,.04)', borderRadius: 3, overflow: 'hidden' },
  resBarFill: { height: '100%', borderRadius: 3, transition: 'width .4s' },
  resBarV: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fff', textAlign: 'right' },
  resCta: { display: 'flex', gap: 10, marginTop: 4 },
  resDl: { flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer' },
  resAgain: { padding: '12px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(255,255,255,.7)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' },

  // Privacy
  priv: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,.05)' },
  privCol: { display: 'flex', flexDirection: 'column', gap: 6 },
  privKey: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', letterSpacing: '0.16em' },
  privVal: { fontSize: 13, color: 'rgba(255,255,255,.7)' },

  foot: { borderTop: '1px solid rgba(255,255,255,.05)', padding: '20px 32px', background: '#06060a' },
  footInner: { maxWidth: 1700, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  footL: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,.5)' },
  footSep: { color: 'rgba(255,255,255,.2)' },
  footR: { display: 'flex', gap: 18 },
  footLink: { color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 12 },

  dragOv: { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(8,8,12,.92)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' },
  dragInner: { padding: '60px 80px', border: '2px dashed rgba(167,139,250,.6)', borderRadius: 24, textAlign: 'center', background: 'rgba(124,108,240,.08)' },
  dragMark: { fontSize: 64, color: '#a78bfa', lineHeight: 1, marginBottom: 16 },
  dragTitle: { fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 400, color: '#fff', marginBottom: 8 },
  dragSub: { fontSize: 14, color: 'rgba(255,255,255,.6)' },
};

if (!document.getElementById('pdf-anim')) {
  const s = document.createElement('style');
  s.id = 'pdf-anim';
  s.textContent = `@keyframes pdfSpin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}

ReactDOM.createRoot(document.getElementById('root')).render(<PdfApp />);
