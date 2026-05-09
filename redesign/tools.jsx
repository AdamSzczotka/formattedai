// Tools subpage — hero map (C) + sticky dock + ⌘K palette (B)

const { useState, useEffect, useRef, useMemo } = React;

const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="tlg" x1="4" y1="2" x2="28" y2="30"><stop stopColor="#a78bfa"/><stop offset="1" stopColor="#6c5ce7"/></linearGradient>
      <linearGradient id="tlgf" x1="4" y1="2" x2="28" y2="30"><stop stopColor="rgba(108,92,231,.35)"/><stop offset="1" stopColor="rgba(167,139,250,.12)"/></linearGradient>
    </defs>
    <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#tlg)" strokeWidth="1.5" fill="url(#tlgf)" />
    <path d="M10 14L14 18L22 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TOOLS = [
  { slug: 'formatter',       name: 'Markdown Formatter', cat: 'Tekst', icon: '✎', live: true, badge: 'najczęstsze', desc: 'Wklej tekst z ChatGPT lub Claude — skopiuj idealny dokument do Word lub Docs.', kw: 'markdown md ai chatgpt claude word docs' },
  { slug: 'js-minifier',     name: 'JS Minifier',        cat: 'Tekst', icon: '{ }', live: true, desc: 'Esbuild + Terser w przeglądarce. Minifikacja, formatowanie, podgląd różnic.', kw: 'js javascript minify minifier esbuild terser' },
  { slug: 'css-minifier',    name: 'CSS Minifier',       cat: 'Tekst', icon: '#', live: true, desc: 'CSSO + js-beautify. Zachowuje source map, sprawdza składnię.', kw: 'css minify minifier csso' },
  { slug: 'json-formatter',  name: 'JSON Formatter',     cat: 'Tekst', icon: '[ ]', live: false, desc: 'Walidacja, drzewo, wyszukiwanie po kluczu. W przygotowaniu.', kw: 'json validate tree' },
  { slug: 'avif',            name: 'AVIF Converter',     cat: 'Obrazy', icon: '◧', live: true, badge: 'WASM', desc: 'PNG / JPG / WebP → AVIF. Batch, presety jakości, eksport ZIP.', kw: 'avif png jpg webp convert image batch wasm' },
  { slug: 'heic',            name: 'HEIC Converter',     cat: 'Obrazy', icon: '◐', live: true, desc: 'Zdjęcia z iPhone na JPG, PNG lub AVIF. Bez instalacji.', kw: 'heic iphone jpg png avif photo' },
  { slug: 'ocr',             name: 'OCR',                cat: 'Obrazy', icon: 'A', live: true, desc: 'Rozpoznawanie tekstu z obrazu. Tesseract.js, 100+ języków.', kw: 'ocr tekst tesseract scan' },
  { slug: 'color-palette',   name: 'Color Palette',      cat: 'Obrazy', icon: '◉', live: false, desc: 'Generator harmonijnych palet, HEX/RGB/HSL, kontrast WCAG.', kw: 'color palette hex rgb wcag' },
  { slug: 'pdf',             name: 'PDF Tools',          cat: 'Dokumenty', icon: '▤', live: true, badge: 'top', desc: 'Łącz, dziel, kompresuj, konwertuj obrazki na PDF.', kw: 'pdf merge split compress' },
  { slug: 'html-to-pdf',     name: 'HTML to PDF',        cat: 'Dokumenty', icon: '⤓', live: true, desc: 'Wklej kod lub URL — pobierz gotowy plik PDF.', kw: 'html pdf url' },
  { slug: 'email-signature', name: 'Email Signature',    cat: 'Dokumenty', icon: '✉', live: true, desc: 'Kreator stopek mailowych, eksport HTML do Outlook/Gmail.', kw: 'email signature stopka outlook gmail' },
  { slug: 'seo-geo',         name: 'SEO & GEO Generator',cat: 'SEO', icon: '◎', live: true, badge: 'GEO', desc: 'Meta + OG + Twitter + Schema.org + llms.txt + robots.txt.', kw: 'seo geo meta og schema llms robots' },
];
const CATS = [
  { id: 'Tekst',     n: '01', en: 'Text',      accent: '#a78bfa', body: 'Markdown, kod, dane tekstowe.' },
  { id: 'Obrazy',    n: '02', en: 'Images',    accent: '#7c6cf0', body: 'Konwersja, kompresja, OCR — przez WebAssembly.' },
  { id: 'Dokumenty', n: '03', en: 'Documents', accent: '#9b8ff7', body: 'PDF, HTML, eksport gotowy do wysłania.' },
  { id: 'SEO',       n: '04', en: 'Search',    accent: '#6c5ce7', body: 'Klasyczny SEO + GEO pod AI wyszukiwarki.' },
];
const url = (slug) => `/${slug}/`;

const ToolsPage = () => {
  const [filter, setFilter] = useState('Wszystkie');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const liveCount = TOOLS.filter(t => t.live).length;

  // ⌘K shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(v => !v); }
      else if (e.key === 'Escape') setPaletteOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div>
      <Nav onPalette={() => setPaletteOpen(true)} />
      <Hero count={liveCount} total={TOOLS.length} onPalette={() => setPaletteOpen(true)} />
      <ToolMap />
      <FilterBar filter={filter} setFilter={setFilter} />
      <FullList filter={filter} />
      <Manifest />
      <Footer />
      {paletteOpen && <Palette close={() => setPaletteOpen(false)} />}
    </div>
  );
};

// ============= Nav with sticky dock =============
const Nav = ({ onPalette }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const dockTools = TOOLS.filter(t => t.live).slice(0, 6);
  return (
    <header style={{...css.nav, ...(scrolled ? css.navScrolled : {})}}>
      <a href="Home.html" style={css.navBrand}>
        <FALogo size={22} asLink={false} />
        <div style={{fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:'"JetBrains Mono", monospace', marginLeft: 32, marginTop: 2}}>narzędzia</div>
      </a>
      <div style={css.navDock}>
        {dockTools.map(t => (
          <a key={t.slug} href={url(t.slug)} title={t.name} style={css.navDockItem}>{t.icon}</a>
        ))}
        <span style={css.navDockSep}></span>
        <button onClick={onPalette} style={css.navDockK}>
          <span style={{opacity:.6}}>⌕</span>
          <span>szukaj</span>
          <span style={css.navDockKKbd}>⌘K</span>
        </button>
      </div>
      <div style={css.navRight}>
        <a href="Articles.html" style={css.navLink}>Dziennik</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={css.navGh}>GitHub</a>
      </div>
    </header>
  );
};

// ============= Hero =============
const Hero = ({ count, total, onPalette }) => (
  <section style={css.hero}>
    <div style={css.heroBg}>
      <div style={css.heroOrb}></div>
      <div style={css.heroGrid}></div>
    </div>
    <div style={css.heroInner}>
      <div style={css.heroLabel}>/ KATALOG NARZĘDZI · {count} / {total} AKTYWNYCH</div>
      <h1 style={css.heroTitle}>
        Wszystko, czego potrzebujesz<br />
        do <span style={css.heroTitleHl}>codziennej pracy</span><br />
        z dokumentami.
      </h1>
      <p style={css.heroDesc}>
        Markdown, obrazy, PDF, SEO. Każde narzędzie działa w przeglądarce — bez kont,
        bez uploadu, bez śledzenia. Wybierz z mapy poniżej albo wciśnij <kbd style={css.kbd}>⌘K</kbd> żeby przeszukać.
      </p>
      <div style={css.heroCtas}>
        <button onClick={onPalette} style={css.heroBtn}>
          <span>⌕</span><span>Szukaj narzędzia</span><span style={css.kbd}>⌘K</span>
        </button>
        <a href="#wszystkie" style={css.heroBtnGhost}>Pełna lista ↓</a>
      </div>
    </div>
  </section>
);

// ============= Tool Map (hero-style, all visible) =============
const ToolMap = () => (
  <section style={css.map}>
    {CATS.map(c => {
      const list = TOOLS.filter(t => t.cat === c.id);
      return (
        <div key={c.id} style={css.mapCat}>
          <div style={css.mapCatHead}>
            <div style={{...css.mapCatN, color: c.accent}}>{c.n} · {c.en}</div>
            <h3 style={css.mapCatTitle}>{c.id}</h3>
            <p style={css.mapCatBody}>{c.body}</p>
          </div>
          <div style={css.mapTiles}>
            {list.map(t => <Tile key={t.slug} t={t} accent={c.accent} />)}
          </div>
        </div>
      );
    })}
  </section>
);

const Tile = ({ t, accent }) => {
  const [h, setH] = useState(false);
  const Tag = t.live ? 'a' : 'div';
  return (
    <Tag href={t.live ? url(t.slug) : undefined}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        ...css.tile,
        cursor: t.live ? 'pointer' : 'default',
        opacity: t.live ? 1 : 0.55,
        borderColor: h && t.live ? accent : 'rgba(255,255,255,.08)',
        background: h && t.live ? `linear-gradient(135deg, ${accent}10, transparent 60%)` : '#0c0c14',
        transform: h && t.live ? 'translateY(-2px)' : 'none',
      }}>
      <div style={css.tileTop}>
        <div style={{...css.tileIcon, background: `${accent}22`, color: accent}}>{t.icon}</div>
        {t.badge && <span style={{...css.tileBadge, color: accent, borderColor: `${accent}55`}}>{t.badge}</span>}
        {!t.live && <span style={css.tileSoon}>WKRÓTCE</span>}
      </div>
      <div style={css.tileName}>{t.name}</div>
      <div style={css.tileDesc}>{t.desc}</div>
      {t.live && <div style={{...css.tileArrow, color: h ? accent : 'rgba(255,255,255,.2)', transform: h ? 'translateX(4px)' : 'none'}}>→</div>}
    </Tag>
  );
};

// ============= Filter bar (sticky) =============
const FilterBar = ({ filter, setFilter }) => (
  <div id="wszystkie" style={css.filterAnchor}>
    <div style={css.filter}>
      <span style={css.filterLabel}>FILTRUJ:</span>
      {['Wszystkie', ...CATS.map(c => c.id)].map(t => (
        <button key={t} onClick={() => setFilter(t)} style={{...css.filterBtn, ...(t === filter ? css.filterBtnActive : {})}}>
          {t}
        </button>
      ))}
    </div>
  </div>
);

// ============= Full list =============
const FullList = ({ filter }) => {
  const items = filter === 'Wszystkie' ? TOOLS : TOOLS.filter(t => t.cat === filter);
  return (
    <section style={css.list}>
      <header style={css.listHead}>
        <div style={css.listLabel}>/ {filter === 'Wszystkie' ? 'PEŁNA LISTA' : filter.toUpperCase()}</div>
        <h2 style={css.listTitle}>{items.length} narzędzi w tej kategorii</h2>
      </header>
      <div style={css.listRows}>
        {items.map(t => {
          const cat = CATS.find(c => c.id === t.cat);
          return <ListRow key={t.slug} t={t} accent={cat.accent} catN={cat.n} />;
        })}
      </div>
    </section>
  );
};

const ListRow = ({ t, accent, catN }) => {
  const [h, setH] = useState(false);
  const Tag = t.live ? 'a' : 'div';
  return (
    <Tag href={t.live ? url(t.slug) : undefined}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        ...css.row,
        cursor: t.live ? 'pointer' : 'default',
        background: h && t.live ? 'rgba(124,108,240,.05)' : 'transparent',
        borderLeftColor: h && t.live ? accent : 'transparent',
        opacity: t.live ? 1 : 0.5,
      }}>
      <div style={css.rowN}>{catN}</div>
      <div style={{...css.rowIcon, background: `${accent}22`, color: accent}}>{t.icon}</div>
      <div style={css.rowMain}>
        <div style={css.rowHead}>
          <span style={css.rowName}>{t.name}</span>
          <span style={{...css.rowCat, color: accent}}>{t.cat}</span>
          {t.badge && <span style={{...css.rowBadge, color: accent, borderColor: `${accent}55`}}>{t.badge}</span>}
        </div>
        <div style={css.rowDesc}>{t.desc}</div>
      </div>
      <div style={css.rowSide}>
        {t.live ? <span style={css.rowLive}>● dostępne</span> : <span style={css.rowSoon}>○ wkrótce</span>}
        <span style={{...css.rowArrow, color: h && t.live ? accent : 'rgba(255,255,255,.2)', transform: h && t.live ? 'translateX(4px)' : 'none'}}>→</span>
      </div>
    </Tag>
  );
};

// ============= Command palette =============
const Palette = ({ close }) => {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current && inputRef.current.focus(); }, []);
  const results = useMemo(() => {
    const qq = q.toLowerCase().trim();
    if (!qq) return TOOLS.filter(t => t.live);
    return TOOLS.filter(t => t.live && (t.name.toLowerCase().includes(qq) || t.kw.includes(qq) || t.cat.toLowerCase().includes(qq)));
  }, [q]);
  useEffect(() => { setSel(0); }, [q]);
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && results[sel]) { window.location.href = url(results[sel].slug); }
  };
  return (
    <div onClick={close} style={css.palBg}>
      <div onClick={e => e.stopPropagation()} style={css.pal}>
        <div style={css.palHead}>
          <span style={{color:'rgba(255,255,255,.4)'}}>⌕</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="markdown · avif · pdf · seo …" style={css.palInput} />
          <kbd style={css.kbd}>ESC</kbd>
        </div>
        <div style={css.palBody}>
          {results.length === 0 && <div style={css.palEmpty}>brak wyników dla „{q}"</div>}
          {results.map((t, i) => {
            const cat = CATS.find(c => c.id === t.cat);
            return (
              <a key={t.slug} href={url(t.slug)} onMouseEnter={() => setSel(i)}
                style={{...css.palItem, background: i === sel ? 'rgba(124,108,240,.15)' : 'transparent'}}>
                <span style={{...css.palIcon, background: `${cat.accent}22`, color: cat.accent}}>{t.icon}</span>
                <span style={css.palName}>{t.name}</span>
                <span style={{...css.palCat, color: cat.accent}}>{t.cat}</span>
                <span style={css.palDesc}>{t.desc}</span>
                {i === sel && <span style={css.palEnter}>↵</span>}
              </a>
            );
          })}
        </div>
        <div style={css.palFoot}>
          <span><kbd style={css.kbd}>↑↓</kbd> nawigacja</span>
          <span><kbd style={css.kbd}>↵</kbd> otwórz</span>
          <span><kbd style={css.kbd}>esc</kbd> zamknij</span>
        </div>
      </div>
    </div>
  );
};

// ============= Manifest strip =============
const Manifest = () => (
  <section style={css.man}>
    <div style={css.manInner}>
      <div style={css.manLabel}>/ MANIFEST</div>
      <h2 style={css.manTitle}>
        Każde narzędzie tutaj<br />
        <span style={{color:'#a78bfa'}}>nie wysyła Twoich plików nigdzie.</span>
      </h2>
      <div style={css.manStats}>
        <div style={css.manStat}><span style={css.manStatK}>0</span><span style={css.manStatL}>bajtów na serwerze</span></div>
        <div style={css.manStat}><span style={css.manStatK}>WASM</span><span style={css.manStatL}>natywna prędkość</span></div>
        <div style={css.manStat}><span style={css.manStatK}>MIT</span><span style={css.manStatL}>otwarty kod</span></div>
      </div>
    </div>
  </section>
);

// ============= Footer =============
const Footer = () => (
  <footer style={css.footer}>
    <div style={css.footerInner}>
      <a href="Home.html" style={css.footerBrand}>
        <div>
          <FALogo size={26} asLink={false} />
          <div style={{fontSize:12, color:'rgba(255,255,255,.5)', marginTop: 6, marginLeft: 36}}>Narzędzia · 100% client-side</div>
        </div>
      </a>
      <p style={css.footerByline}>
        Stworzone przez{' '}
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={{color:'#a78bfa', borderBottom:'1px solid rgba(167,139,250,.3)'}}>Adama Szczotkę ↗</a>
        {' · '}MIT
      </p>
      <div style={css.footerLinks}>
        <a href="Home.html" style={css.footerLink}>Strona główna</a>
        <a href="Articles.html" style={css.footerLink}>Dziennik</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={css.footerLink}>GitHub ↗</a>
      </div>
    </div>
  </footer>
);

// ============= Styles =============
const css = {
  // Nav
  nav: { position: 'sticky', top: 0, zIndex: 90, display: 'grid', gridTemplateColumns: '240px 1fr 240px', alignItems: 'center', gap: 24, padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,0)', transition: 'background .25s, backdrop-filter .25s' },
  navScrolled: { background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' },
  navBrand: { display: 'flex', alignItems: 'center', gap: 12 },
  navName: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' },
  navTagline: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '0.06em', marginTop: 1 },
  navDock: { justifySelf: 'center', display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'rgba(124,108,240,.06)', border: '1px solid rgba(124,108,240,.18)', borderRadius: 99 },
  navDockItem: { width: 32, height: 32, borderRadius: 99, background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, cursor: 'pointer', transition: 'background .15s, color .15s' },
  navDockSep: { width: 1, height: 18, background: 'rgba(255,255,255,.12)', margin: '0 4px' },
  navDockK: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 14px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,.7)', fontSize: 12, cursor: 'pointer' },
  navDockKKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 4, color: 'rgba(255,255,255,.6)' },
  navRight: { justifySelf: 'end', display: 'flex', alignItems: 'center', gap: 14 },
  navLink: { fontSize: 13, color: 'rgba(255,255,255,.7)', cursor: 'pointer' },
  navGh: { fontSize: 13, padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: '#fff', cursor: 'pointer' },

  // Hero
  hero: { position: 'relative', padding: '100px 48px 80px', overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' },
  heroOrb: { position: 'absolute', top: '10%', right: '10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,240,.16), transparent 60%)', filter: 'blur(80px)' },
  heroGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '100% 64px' },
  heroInner: { position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' },
  heroLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 28 },
  heroTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 88, lineHeight: 0.96, fontWeight: 500, letterSpacing: '-0.035em', margin: '0 0 28px', maxWidth: 1100 },
  heroTitleHl: { background: 'linear-gradient(135deg, #a78bfa, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc: { fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', maxWidth: 720, margin: '0 0 36px' },
  heroCtas: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  heroBtn: { display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: '#7c6cf0', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,108,240,.4)' },
  heroBtnGhost: { padding: '14px 20px', border: '1px solid rgba(255,255,255,.15)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  kbd: { display: 'inline-block', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 4, color: '#fff' },

  // Map
  map: { padding: '40px 48px 80px', maxWidth: 1280, margin: '0 auto' },
  mapCat: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, padding: '40px 0', borderTop: '1px solid rgba(255,255,255,.06)' },
  mapCatHead: { paddingTop: 4 },
  mapCatN: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.15em', marginBottom: 12 },
  mapCatTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 40, fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 14px' },
  mapCatBody: { fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.55, margin: 0, maxWidth: 240 },
  mapTiles: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },

  tile: { position: 'relative', display: 'block', padding: 22, border: '1px solid', borderRadius: 14, background: '#0c0c14', transition: 'transform .25s, border-color .25s, background .25s' },
  tileTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  tileIcon: { width: 36, height: 36, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 14 },
  tileBadge: { padding: '2px 8px', fontSize: 9, border: '1px solid', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em', textTransform: 'uppercase' },
  tileSoon: { fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.4)', letterSpacing: '0.08em' },
  tileName: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 18, fontWeight: 500, marginBottom: 6, letterSpacing: '-0.01em' },
  tileDesc: { fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.55 },
  tileArrow: { position: 'absolute', top: 22, right: 22, fontSize: 18, transition: 'transform .2s, color .2s' },

  // Filter
  filterAnchor: { borderTop: '1px solid rgba(255,255,255,.06)' },
  filter: { position: 'sticky', top: 64, zIndex: 50, display: 'flex', alignItems: 'center', gap: 8, padding: '16px 48px', background: 'rgba(8,8,12,.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.08)', flexWrap: 'wrap' },
  filterLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.1em', marginRight: 12 },
  filterBtn: { padding: '6px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.65)', borderRadius: 99, fontSize: 13, cursor: 'pointer' },
  filterBtnActive: { background: 'rgba(124,108,240,.15)', borderColor: 'rgba(167,139,250,.4)', color: '#fff' },

  // List
  list: { padding: '60px 48px 100px', maxWidth: 1280, margin: '0 auto' },
  listHead: { marginBottom: 32 },
  listLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 8 },
  listTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 },
  listRows: { borderTop: '1px solid rgba(255,255,255,.08)' },
  row: { display: 'grid', gridTemplateColumns: '40px 56px 1fr auto', gap: 20, alignItems: 'center', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', borderLeft: '2px solid transparent', transition: 'background .2s, border-color .2s' },
  rowN: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em' },
  rowIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 14 },
  rowMain: { minWidth: 0 },
  rowHead: { display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 4 },
  rowName: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' },
  rowCat: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.08em' },
  rowBadge: { padding: '2px 8px', fontSize: 9, border: '1px solid', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em', textTransform: 'uppercase' },
  rowDesc: { fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.5, maxWidth: 720 },
  rowSide: { display: 'flex', alignItems: 'center', gap: 16 },
  rowLive: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#22c55e', letterSpacing: '0.06em' },
  rowSoon: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: '0.06em' },
  rowArrow: { fontSize: 18, transition: 'transform .2s, color .2s' },

  // Palette overlay
  palBg: { position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' },
  pal: { width: '100%', maxWidth: 640, background: '#0c0c14', border: '1px solid rgba(124,108,240,.35)', borderRadius: 14, boxShadow: '0 32px 100px rgba(0,0,0,.6)', overflow: 'hidden' },
  palHead: { display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' },
  palInput: { flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 16, outline: 'none', fontFamily: 'inherit' },
  palBody: { padding: 8, maxHeight: '50vh', overflow: 'auto' },
  palEmpty: { padding: 24, textAlign: 'center', color: 'rgba(255,255,255,.5)', fontSize: 13 },
  palItem: { display: 'grid', gridTemplateColumns: '32px 1fr auto auto auto', gap: 14, alignItems: 'center', padding: '10px 14px', borderRadius: 8, cursor: 'pointer' },
  palIcon: { width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  palName: { fontSize: 14, fontWeight: 500 },
  palCat: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.08em' },
  palDesc: { fontSize: 12, color: 'rgba(255,255,255,.5)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  palEnter: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#a78bfa' },
  palFoot: { display: 'flex', gap: 16, padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,.06)', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '0.06em' },

  // Manifest strip
  man: { padding: '100px 48px', background: '#0a0a14', borderTop: '1px solid rgba(255,255,255,.08)' },
  manInner: { maxWidth: 1100, margin: '0 auto' },
  manLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 24 },
  manTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 56px' },
  manStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.08)' },
  manStat: { display: 'flex', flexDirection: 'column', gap: 8 },
  manStatK: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, fontWeight: 500, color: '#a78bfa', letterSpacing: '-0.03em' },
  manStatL: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.55)', letterSpacing: '0.08em', textTransform: 'uppercase' },

  // Footer
  footer: { padding: '48px', borderTop: '1px solid rgba(255,255,255,.08)' },
  footerInner: { maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' },
  footerBrand: { display: 'flex', alignItems: 'center', gap: 12 },
  footerByline: { fontSize: 13, color: 'rgba(255,255,255,.55)', margin: 0 },
  footerLinks: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  footerLink: { fontSize: 13, color: 'rgba(255,255,255,.65)', cursor: 'pointer' },
};

window.ToolsPage = ToolsPage;
