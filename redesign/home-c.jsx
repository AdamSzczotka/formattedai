// Home — Wariant C: Hybrid Console (production prototype)
// Realny content, realne linki, interakcje (rotating demo, hover, kategorie)

const { useState, useEffect } = React;

// Real logo (hexagon + checkmark)
const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="lg" x1="4" y1="2" x2="28" y2="30">
        <stop stopColor="#a78bfa" />
        <stop offset="1" stopColor="#6c5ce7" />
      </linearGradient>
      <linearGradient id="lgf" x1="4" y1="2" x2="28" y2="30">
        <stop stopColor="rgba(108,92,231,0.35)" />
        <stop offset="1" stopColor="rgba(167,139,250,0.12)" />
      </linearGradient>
    </defs>
    <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#lg)" strokeWidth="1.5" fill="url(#lgf)" />
    <path d="M10 14L14 18L22 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// === Data ===
const TOOLS = {
  Tekst: [
    { name: 'Markdown Formatter', href: '/formatter/', desc: 'Wklej tekst z ChatGPT lub Claude — skopiuj idealny dokument do Word lub Docs.', live: true, badge: 'najczęściej używane' },
    { name: 'JS Minifier', href: '/js-minifier/', desc: 'Esbuild + Terser w przeglądarce. Minifikacja, formatowanie, podgląd różnic.', live: true },
    { name: 'CSS Minifier', href: '/css-minifier/', desc: 'CSSO + js-beautify. Zachowuje source map, sprawdza składnię.', live: true },
    { name: 'JSON Formatter', href: '#', desc: 'Walidacja, drzewo, wyszukiwanie po kluczu. W przygotowaniu.', live: false },
  ],
  Obrazy: [
    { name: 'AVIF Converter', href: '/avif/', desc: 'PNG / JPG / WebP → AVIF. Batch, presety jakości, eksport ZIP.', live: true, badge: 'WASM' },
    { name: 'HEIC Converter', href: '/heic/', desc: 'Zdjęcia z iPhone na JPG, PNG lub AVIF. Bez instalacji.', live: true },
    { name: 'OCR', href: '/ocr/', desc: 'Rozpoznawanie tekstu z obrazu. Tesseract.js, 100+ języków.', live: true },
    { name: 'Color Palette', href: '#', desc: 'Generator harmonijnych palet, HEX/RGB/HSL, kontrast WCAG.', live: false },
  ],
  Dokumenty: [
    { name: 'PDF Tools', href: '/pdf/', desc: 'Łącz, dziel, kompresuj, konwertuj obrazki na PDF.', live: true, badge: 'najpopularniejsze' },
    { name: 'HTML to PDF', href: '/html-to-pdf/', desc: 'Wklej kod lub URL — pobierz gotowy plik PDF.', live: true },
    { name: 'Email Signature', href: '/email-signature/', desc: 'Kreator stopek mailowych, eksport HTML do Outlook/Gmail.', live: true },
  ],
  SEO: [
    { name: 'SEO & GEO Generator', href: '/seo-geo/', desc: 'Meta + OG + Twitter + Schema.org + llms.txt + robots.txt.', live: true, badge: 'GEO ready' },
  ],
};
const CAT_ORDER = ['Tekst', 'Obrazy', 'Dokumenty', 'SEO'];
const CAT_META = {
  Tekst:      { n: '01', en: 'Text',      accent: '#a78bfa', body: 'Markdown, kod, dane tekstowe.' },
  Obrazy:     { n: '02', en: 'Images',    accent: '#7c6cf0', body: 'Konwersja, kompresja, OCR — przez WebAssembly.' },
  Dokumenty:  { n: '03', en: 'Documents', accent: '#9b8ff7', body: 'PDF, HTML, eksport gotowy do wysłania.' },
  SEO:        { n: '04', en: 'Search',    accent: '#6c5ce7', body: 'Klasyczny SEO + GEO pod AI wyszukiwarki.' },
};

const ARTICLES = [
  { slug: 'chatgpt-formatowanie-google-docs', date: '04 / 2026', read: '6 min', tag: 'Markdown', title: 'ChatGPT i formatowanie w Google Docs', desc: 'Dlaczego markdown z AI psuje się w Word i jak to naprawić w jednym kliknięciu.', featured: true },
  { slug: 'geo-optymalizacja-pod-ai',         date: '03 / 2026', read: '8 min', tag: 'SEO',      title: 'GEO — optymalizacja pod AI wyszukiwarki', desc: 'Schema.org, llms.txt, robots.txt — co naprawdę robi różnicę dla ChatGPT Search i Perplexity.' },
  { slug: 'optymalizacja-zdjec-avif',         date: '02 / 2026', read: '5 min', tag: 'Obrazy',   title: 'Optymalizacja zdjęć w formacie AVIF', desc: '50% mniejsze pliki przy tej samej jakości. Praktyczny przewodnik.' },
  { slug: 'pdf-darmowe-narzedzia-online',     date: '01 / 2026', read: '7 min', tag: 'Dokumenty',title: 'PDF — darmowe narzędzia online bez serwera', desc: 'Łączenie, dzielenie i kompresja PDF w przeglądarce. Test 7 alternatyw.' },
];

// Demo-specific styles (declared BEFORE DEMOS because DEMOS literals reference them)
const demoStyles = {
  code: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, lineHeight: 1.65, color: 'rgba(255,255,255,.85)', margin: 0, whiteSpace: 'pre-wrap' },
  docOut: { background: '#fff', color: '#1a1a24', padding: 14, borderRadius: 6, fontSize: 11, lineHeight: 1.5 },
  docH3: { fontSize: 16, margin: '0 0 8px', fontWeight: 700 },
  docH4: { fontSize: 13, margin: '8px 0 6px', fontWeight: 600 },
  docUl: { fontSize: 11, paddingLeft: 18, margin: '0 0 8px' },
  docQ: { fontSize: 11, fontStyle: 'italic', borderLeft: '3px solid #7c6cf0', padding: '2px 0 2px 10px', margin: '8px 0', color: '#555' },
  docTable: { fontSize: 10, borderCollapse: 'collapse', width: '100%', marginTop: 8 },
  docTh: { border: '1px solid #e5e5e9', padding: '4px 8px', background: '#f4f3f1', fontWeight: 600 },
  docTd: { border: '1px solid #e5e5e9', padding: '4px 8px' },
  fileList: { display: 'flex', flexDirection: 'column', gap: 6 },
  fileRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 6, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fff' },
  fileIcon: { width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontWeight: 700 },
  fileSize: { color: 'rgba(255,255,255,.5)', fontSize: 10 },
  fileDelta: { color: '#22c55e', fontSize: 10 },
  opLog: { padding: '12px 0', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.5)', lineHeight: 1.7 },
};

const FileRow = ({ name, size, delta, done }) => (
  <div style={demoStyles.fileRow}>
    <div style={demoStyles.fileIcon}>{done ? '✓' : '·'}</div>
    <div style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{name}</div>
    <div style={demoStyles.fileSize}>{size}</div>
    {delta && <div style={done ? demoStyles.fileDelta : demoStyles.fileSize}>{delta}</div>}
  </div>
);

// === Demos for hero ===
const DEMOS = {
  markdown: {
    label: 'Markdown Formatter',
    href: '/formatter/',
    inLabel: 'INPUT · Markdown z ChatGPT',
    outLabel: 'OUTPUT · Word / Docs',
    inputJsx: (
      <pre style={demoStyles.code}>
{`# Plan tygodnia

## Poniedziałek
- [ ] Briefing redakcyjny
- [ ] **Spotkanie** o 14:00
- [x] Code review

> "Dobre formatowanie to oszczędność
> czasu." — Adam

| Dzień | Status |
|-------|--------|
| Pn    | gotowe |
| Wt    | trwa   |`}
      </pre>
    ),
    output: (
      <div style={demoStyles.docOut}>
        <h3 style={demoStyles.docH3}>Plan tygodnia</h3>
        <h4 style={demoStyles.docH4}>Poniedziałek</h4>
        <ul style={demoStyles.docUl}>
          <li>☐ Briefing redakcyjny</li>
          <li>☐ <strong>Spotkanie</strong> o 14:00</li>
          <li>☑ Code review</li>
        </ul>
        <blockquote style={demoStyles.docQ}>„Dobre formatowanie to oszczędność czasu." — Adam</blockquote>
        <table style={demoStyles.docTable}>
          <tbody>
            <tr><td style={demoStyles.docTh}>Dzień</td><td style={demoStyles.docTh}>Status</td></tr>
            <tr><td style={demoStyles.docTd}>Pn</td><td style={demoStyles.docTd}>gotowe</td></tr>
            <tr><td style={demoStyles.docTd}>Wt</td><td style={demoStyles.docTd}>trwa</td></tr>
          </tbody>
        </table>
      </div>
    ),
  },
  avif: {
    label: 'AVIF Converter',
    href: '/avif/',
    inLabel: 'INPUT · 4 pliki PNG · 12.4 MB',
    outLabel: 'OUTPUT · AVIF · 3.1 MB · −75%',
    inputJsx: (
      <div style={demoStyles.fileList}>
        <FileRow name="hero-shot.png" size="4.2 MB" />
        <FileRow name="product-01.png" size="3.1 MB" />
        <FileRow name="product-02.png" size="2.8 MB" />
        <FileRow name="lifestyle.png" size="2.3 MB" />
      </div>
    ),
    output: (
      <div style={demoStyles.fileList}>
        <FileRow name="hero-shot.avif" size="1.0 MB" delta="−76%" done />
        <FileRow name="product-01.avif" size="0.8 MB" delta="−74%" done />
        <FileRow name="product-02.avif" size="0.7 MB" delta="−75%" done />
        <FileRow name="lifestyle.avif" size="0.6 MB" delta="−74%" done />
      </div>
    ),
  },
  pdf: {
    label: 'PDF Tools',
    href: '/pdf/',
    inLabel: 'INPUT · 3 pliki PDF',
    outLabel: 'OUTPUT · merged.pdf · 124 stron',
    inputJsx: (
      <div style={demoStyles.fileList}>
        <FileRow name="raport-q1.pdf" size="2.1 MB · 42 strony" />
        <FileRow name="raport-q2.pdf" size="2.6 MB · 51 stron" />
        <FileRow name="zalaczniki.pdf" size="1.8 MB · 31 stron" />
      </div>
    ),
    output: (
      <div style={demoStyles.fileList}>
        <FileRow name="merged-2026-04.pdf" size="6.2 MB · 124 strony" delta="ready" done />
        <div style={demoStyles.opLog}>
          <div>· łączenie zachowuje zakładki</div>
          <div>· kompresja: 6.5 MB → 6.2 MB</div>
          <div>· numeracja stron: spójna</div>
        </div>
      </div>
    ),
  },
};
const DEMO_ORDER = ['markdown', 'avif', 'pdf'];

// === Main ===
const HomeC = () => {
  return (
    <div style={S.root}>
      <CNav />
      <CHero />
      <CTrustBar />
      <CTools />
      <CHowItWorks />
      <CBlogStrip />
      <CManifest />
      <CFooter />
    </div>
  );
};

// ===== Nav =====
const CNav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header style={{...S.nav, ...(scrolled ? S.navScrolled : {})}}>
      <a href="/" style={S.navBrand}>
        <FALogo size={22} asLink={false} />
      </a>
      <nav style={S.navLinks}>
        <NavLink href="Tools.html">Narzędzia</NavLink>
        <NavLink href="#how">Jak to działa</NavLink>
        <NavLink href="/articles/">Dziennik</NavLink>
        <NavLink href="/about/">O projekcie</NavLink>
      </nav>
      <div style={S.navRight}>
        <a href="/en/" style={S.navLang}>EN</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={S.navGh}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
      </div>
    </header>
  );
};
const NavLink = ({ href, children }) => {
  const [h, setH] = useState(false);
  return (
    <a href={href} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
       style={{...S.navLink, color: h ? '#fff' : 'rgba(255,255,255,.72)'}}>
      {children}
    </a>
  );
};

// ===== Hero =====
const CHero = () => {
  const [demo, setDemo] = useState('markdown');
  return (
    <section style={S.hero}>
      <div style={S.heroBg}>
        <div style={S.heroBgMesh}></div>
        <div style={S.heroBgGrid}></div>
        <div style={S.heroBgOrb}></div>
      </div>
      <div style={S.heroLeft}>
        <div style={S.heroBadge}>
          <span style={S.heroBadgeDot}></span>
          100% client-side · zero uploadu
        </div>
        <h1 style={S.heroTitle}>
          Narzędzia, które<br />
          nie widzą<br />
          <span style={S.heroTitleHl}>Twoich danych.</span>
        </h1>
        <p style={S.heroDesc}>
          Markdown formatter, konwertery obrazów, narzędzia PDF, generator SEO &amp; GEO.
          Wszystko działa w przeglądarce — bez kont, bez cookies, bez śledzenia.
        </p>
        <div style={S.heroCtas}>
          <a href="/formatter/" style={S.ctaPrimary}>
            Otwórz Markdown Formatter
            <span style={{fontSize:18}}>→</span>
          </a>
          <a href="Tools.html" style={S.ctaGhost}>Wszystkie narzędzia →</a>
        </div>
        <div style={S.heroProof}>
          <span style={S.heroProofK}>10</span> aktywnych ·{' '}
          <span style={S.heroProofK}>0</span> bajtów na serwerze ·{' '}
          <span style={S.heroProofK}>MIT</span> open source
        </div>
      </div>
      <div style={S.heroRight}>
        <div style={S.demoTabs}>
          {DEMO_ORDER.map(k => (
            <button key={k} onClick={() => setDemo(k)}
              style={{...S.demoTab, ...(demo === k ? S.demoTabActive : {})}}>
              {DEMOS[k].label}
            </button>
          ))}
        </div>
        <CDemoCard cfg={DEMOS[demo]} />
      </div>
    </section>
  );
};

const CDemoCard = ({ cfg }) => (
  <div style={S.demo}>
    <div style={S.demoChrome}>
      <div style={S.demoDots}>
        <span style={{...S.demoDot, background: '#ff5f57'}}></span>
        <span style={{...S.demoDot, background: '#febc2e'}}></span>
        <span style={{...S.demoDot, background: '#28c840'}}></span>
      </div>
      <div style={S.demoUrl}>formattedai.pl{cfg.href}</div>
      <div style={S.demoSecure}>● client-side</div>
    </div>
    <div style={S.demoBody}>
      <div style={S.demoPanel}>
        <div style={S.demoPanelHead}>
          <span>{cfg.inLabel}</span>
        </div>
        {cfg.inputJsx}
      </div>
      <div style={S.demoArrow}>→</div>
      <div style={S.demoPanel}>
        <div style={S.demoPanelHead}>
          <span>{cfg.outLabel}</span>
          <span style={{color:'#a78bfa'}}>⌘C kopia</span>
        </div>
        {cfg.output}
      </div>
    </div>
  </div>
);

// ===== Trust =====
const CTrustBar = () => (
  <section style={S.trust}>
    <TrustItem k="0" l="bajtów wysłanych na serwer" />
    <TrustItem k="10 / 12" l="narzędzi w produkcji" />
    <TrustItem k="100%" l="kod otwarty na GitHubie" />
    <TrustItem k="WASM" l="natywna szybkość lokalnie" />
  </section>
);
const TrustItem = ({ k, l }) => (
  <div style={S.trustItem}>
    <div style={S.trustK}>{k}</div>
    <div style={S.trustL}>{l}</div>
  </div>
);

// ===== Tools =====
const CTools = () => {
  const [active, setActive] = useState('Tekst');
  const meta = CAT_META[active];
  const list = TOOLS[active];
  const total = Object.values(TOOLS).flat().length;
  const live = Object.values(TOOLS).flat().filter(t => t.live).length;
  return (
    <section id="tools" style={S.tools}>
      <header style={S.toolsHead}>
        <div style={S.toolsLabel}>/ NARZĘDZIA · {live}/{total} aktywnych</div>
        <h2 style={S.toolsTitle}>Cztery rejestry. Jeden manifest.</h2>
        <p style={S.toolsSub}>Pogrupowane tematycznie — wybierz kategorię, żeby zawęzić listę.</p>
      </header>
      <div style={S.tabs}>
        {CAT_ORDER.map(c => {
          const m = CAT_META[c];
          const isActive = c === active;
          return (
            <button key={c} onClick={() => setActive(c)}
              style={{...S.tab, ...(isActive ? {...S.tabActive, borderColor: m.accent} : {})}}>
              <span style={{...S.tabN, color: isActive ? m.accent : 'rgba(255,255,255,.5)'}}>{m.n}</span>
              <span style={S.tabName}>{c}</span>
              <span style={S.tabCount}>{TOOLS[c].length}</span>
            </button>
          );
        })}
      </div>
      <div style={S.catBody}>
        <div style={S.catSidebar}>
          <div style={{...S.catSidebarN, color: meta.accent}}>{meta.n} · {meta.en}</div>
          <h3 style={S.catSidebarTitle}>{active}</h3>
          <p style={S.catSidebarDesc}>{meta.body}</p>
          <div style={S.catSidebarStat}>
            <span>{list.filter(t=>t.live).length} aktywnych</span>
            <span style={{color:'rgba(255,255,255,.4)'}}>·</span>
            <span>{list.filter(t=>!t.live).length} w przygotowaniu</span>
          </div>
        </div>
        <div style={S.catList}>
          {list.map(t => <ToolRow key={t.name} t={t} accent={meta.accent} />)}
        </div>
      </div>
    </section>
  );
};

const ToolRow = ({ t, accent }) => {
  const [h, setH] = useState(false);
  const Tag = t.live ? 'a' : 'div';
  return (
    <Tag href={t.live ? t.href : undefined}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        ...S.toolRow,
        background: h && t.live ? 'rgba(124,108,240,.06)' : 'transparent',
        borderColor: h && t.live ? accent : 'rgba(255,255,255,.08)',
        cursor: t.live ? 'pointer' : 'default',
      }}>
      <div style={S.toolRowMain}>
        <div style={S.toolRowHead}>
          <span style={S.toolRowName}>{t.name}</span>
          {t.badge && <span style={{...S.toolRowBadge, color: accent, borderColor: 'rgba(167,139,250,.3)'}}>{t.badge}</span>}
        </div>
        <div style={S.toolRowDesc}>{t.desc}</div>
      </div>
      <div style={S.toolRowSide}>
        {t.live
          ? <span style={S.toolRowStatusLive}>● dostępne</span>
          : <span style={S.toolRowStatusSoon}>○ wkrótce</span>}
        <span style={{...S.toolRowArrow, color: t.live ? accent : 'rgba(255,255,255,.2)', transform: h ? 'translateX(4px)' : 'none'}}>→</span>
      </div>
    </Tag>
  );
};

// ===== How =====
const CHowItWorks = () => (
  <section id="how" style={S.how}>
    <div style={S.howInner}>
      <div style={S.howLabel}>/ JAK TO DZIAŁA</div>
      <h2 style={S.howTitle}>
        Twój plik nigdy nie wychodzi<br />
        poza tę kartę przeglądarki.
      </h2>
      <div style={S.howSteps}>
        <CStep n="01" title="Wczytujesz" body="Drag &amp; drop, paste lub file picker. Pliki ładują się do pamięci przeglądarki — nigdzie więcej." />
        <CStep n="02" title="Przetwarzamy lokalnie" body="JavaScript + WebAssembly robi robotę procesora natywnie. Zero żądań sieciowych." />
        <CStep n="03" title="Pobierasz wynik" body="Jeden klik, pełna jakość, nazewnictwo zachowane. Możesz zamknąć kartę bez śladów." />
      </div>
      <div style={S.howNetwork}>
        <div style={S.howNetTitle}>Co wysyłamy na serwer:</div>
        <div style={S.howNetBig}>nic.</div>
        <div style={S.howNetSub}>Dosłownie. Devtools → Network: jedyne requesty to pierwsze załadowanie strony i fontów Google.</div>
      </div>
    </div>
  </section>
);
const CStep = ({ n, title, body }) => (
  <div style={S.step}>
    <div style={S.stepN}>{n}</div>
    <div style={S.stepTitle}>{title}</div>
    <p style={S.stepBody}>{body}</p>
  </div>
);

// ===== Blog =====
const CBlogStrip = () => {
  const [hero, ...rest] = ARTICLES;
  return (
    <section style={S.blog}>
      <div style={S.blogHead}>
        <div>
          <div style={S.blogLabel}>/ DZIENNIK · 4 wpisy</div>
          <h2 style={S.blogTitle}>Co się ostatnio działo</h2>
        </div>
        <a href="/articles/" style={S.blogAll}>Wszystkie wpisy →</a>
      </div>
      <div style={S.blogGrid}>
        <a href={`/articles/${hero.slug}/`} style={S.blogFeatured}>
          <div style={S.blogFeaturedImg}>
            <span style={S.blogFeaturedTag}>{hero.tag}</span>
            <span style={S.placeholderLabel}>[ hero · {hero.tag.toLowerCase()} ]</span>
          </div>
          <div style={S.blogFeaturedBody}>
            <div style={S.blogFeaturedMeta}>{hero.date} · {hero.read} czytania</div>
            <h3 style={S.blogFeaturedTitle}>{hero.title}</h3>
            <p style={S.blogFeaturedDesc}>{hero.desc}</p>
            <span style={S.blogReadMore}>Czytaj artykuł →</span>
          </div>
        </a>
        <ul style={S.blogList}>
          {rest.map(a => (
            <li key={a.slug}>
              <a href={`/articles/${a.slug}/`} style={S.blogItem}>
                <div style={S.blogItemMeta}>{a.date} · {a.read}</div>
                <div style={S.blogItemTitle}>{a.title}</div>
                <div style={S.blogItemDesc}>{a.desc}</div>
                <div style={S.blogItemTag}>{a.tag}</div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// ===== Manifest =====
const CManifest = () => (
  <section style={S.manifest}>
    <div style={S.manifestInner}>
      <div style={S.manifestLabel}>/ MANIFEST</div>
      <h2 style={S.manifestTitle}>
        Tradycyjne narzędzia online widzą wszystko.<br />
        <span style={{color:'#a78bfa'}}>Nasze nie widzą niczego.</span>
      </h2>
      <div style={S.manifestCols}>
        <div style={S.manifestCol}>
          <div style={S.manifestColLabel}>01 — DLACZEGO</div>
          <p style={S.manifestColBody}>Każde uploadowane Ci dziś narzędzie online to potencjalny lek danych. Dokumenty, faktury, zdjęcia — wszystko ląduje na cudzych dyskach.</p>
        </div>
        <div style={S.manifestCol}>
          <div style={S.manifestColLabel}>02 — JAK</div>
          <p style={S.manifestColBody}>WebAssembly i nowoczesne API przeglądarki pozwalają zrobić lokalnie to, co kiedyś wymagało serwera. Bez kompromisu w jakości i szybkości.</p>
        </div>
        <div style={S.manifestCol}>
          <div style={S.manifestColLabel}>03 — CO</div>
          <p style={S.manifestColBody}>Jedno miejsce, otwarty kod na GitHubie. Brak telemetrii, cookies i plotek o Tobie u trzecich stron.</p>
        </div>
      </div>
    </div>
  </section>
);

// ===== Footer =====
const CFooter = () => (
  <footer style={S.footer}>
    <div style={S.footerCta}>
      <h2 style={S.footerCtaTitle}>
        Zacznij od narzędzia,<br />
        którego najczęściej potrzebujesz.
      </h2>
      <div style={S.footerCtaList}>
        <a href="/formatter/" style={S.footerCtaPill}>Markdown Formatter</a>
        <a href="/avif/" style={S.footerCtaPill}>AVIF Converter</a>
        <a href="/pdf/" style={S.footerCtaPill}>PDF Tools</a>
        <a href="/seo-geo/" style={S.footerCtaPill}>SEO &amp; GEO</a>
      </div>
    </div>
    <div style={S.footerCols}>
      <div style={S.footerCol}>
        <a href="/" style={S.footerBrand}>
          <div>
            <FALogo size={26} asLink={false} />
            <div style={{fontSize:12, color:'rgba(255,255,255,.5)', marginTop: 6, marginLeft: 36}}>Narzędzia • 100% client-side</div>
          </div>
        </a>
        <p style={S.footerByline}>
          Stworzone przez{' '}
          <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={S.footerBylineLink}>
            Adama Szczotkę ↗
          </a>
        </p>
      </div>
      <div style={S.footerCol}>
        <div style={S.footerColLabel}>Narzędzia</div>
        <a href="/formatter/" style={S.footerLink}>Markdown Formatter</a>
        <a href="/avif/" style={S.footerLink}>AVIF Converter</a>
        <a href="/heic/" style={S.footerLink}>HEIC Converter</a>
        <a href="/pdf/" style={S.footerLink}>PDF Tools</a>
        <a href="/html-to-pdf/" style={S.footerLink}>HTML to PDF</a>
        <a href="/seo-geo/" style={S.footerLink}>SEO &amp; GEO</a>
      </div>
      <div style={S.footerCol}>
        <div style={S.footerColLabel}>Treść</div>
        <a href="/articles/" style={S.footerLink}>Dziennik</a>
        <a href="/about/" style={S.footerLink}>O projekcie</a>
        <a href="/articles/feed.xml" style={S.footerLink}>RSS</a>
        <a href="/llms.txt" style={S.footerLink}>llms.txt</a>
      </div>
      <div style={S.footerCol}>
        <div style={S.footerColLabel}>Kod &amp; kontakt</div>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={S.footerLink}>GitHub ↗</a>
        <a href="https://github.com/AdamSzczotka/formattedai/issues" target="_blank" rel="noopener" style={S.footerLink}>Issues ↗</a>
        <a href="mailto:adam.szczotka0@gmail.com" style={S.footerLink}>Email</a>
        <a href="/privacy/" style={S.footerLink}>Prywatność</a>
        <a href="/en/" style={S.footerLink}>English</a>
      </div>
    </div>
    <div style={S.footerBottom}>
      <span>© 2026 Adam Szczotka · MIT · <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={{color:'#a78bfa'}}>adamszczotka.dev</a></span>
      <span>zero danych na serwerze · zero cookies · zero śledzenia</span>
    </div>
  </footer>
);

// ============== STYLES ==============
const S = {
  root: { width: '100%', background: '#08080c', color: '#f0f0f4', fontFamily: 'Inter, sans-serif' },

  // Nav
  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'grid', gridTemplateColumns: '260px 1fr 260px',
    alignItems: 'center', padding: '16px 48px',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    background: 'rgba(8,8,12,.0)',
    transition: 'background .25s ease, backdrop-filter .25s ease',
  },
  navScrolled: {
    background: 'rgba(8,8,12,.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: 12 },
  navName: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' },
  navTagline: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '0.06em', marginTop: 1 },
  navLinks: { display: 'flex', justifyContent: 'center', gap: 32 },
  navLink: { fontSize: 14, transition: 'color .15s', cursor: 'pointer' },
  navRight: { display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' },
  navLang: { fontSize: 13, color: 'rgba(255,255,255,.7)', padding: '6px 10px', cursor: 'pointer' },
  navGh: { display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: '#fff', cursor: 'pointer' },

  // Hero
  hero: { position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 48, padding: '100px 48px 140px', overflow: 'hidden' },
  heroBg: { position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' },
  heroBgMesh: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 30%, rgba(124,108,240,.18) 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, rgba(167,139,250,.1) 0%, transparent 50%)' },
  heroBgGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px)', backgroundSize: '100% 64px' },
  heroBgOrb: { position: 'absolute', top: '40%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,240,.15), transparent 60%)', filter: 'blur(80px)' },
  heroLeft: { position: 'relative', zIndex: 2, paddingTop: 32 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 16px', border: '1px solid rgba(34,197,94,.25)', background: 'rgba(34,197,94,.08)', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#22c55e', letterSpacing: '0.08em', marginBottom: 32 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' },
  heroTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 88, lineHeight: 0.96, fontWeight: 500, letterSpacing: '-0.035em', margin: '0 0 28px' },
  heroTitleHl: { background: 'linear-gradient(135deg, #a78bfa, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  heroDesc: { fontSize: 19, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', margin: '0 0 40px', maxWidth: 540 },
  heroCtas: { display: 'flex', gap: 16, marginBottom: 40 },
  ctaPrimary: { display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 24px', background: '#7c6cf0', color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 10, cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,108,240,.4)' },
  ctaGhost: { padding: '16px 24px', border: '1px solid rgba(255,255,255,.15)', color: '#fff', fontSize: 15, fontWeight: 500, borderRadius: 10, cursor: 'pointer' },
  heroProof: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '0.05em' },
  heroProofK: { color: '#a78bfa', fontWeight: 600 },

  heroRight: { position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 12 },
  demoTabs: { display: 'flex', gap: 4, padding: 4, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, alignSelf: 'flex-start' },
  demoTab: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,.6)', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.05em' },
  demoTabActive: { background: 'rgba(124,108,240,.18)', color: '#fff' },
  demo: { background: '#11111a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, boxShadow: '0 24px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(124,108,240,.08)', overflow: 'hidden' },
  demoChrome: { display: 'grid', gridTemplateColumns: '80px 1fr 110px', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#0c0c14', borderBottom: '1px solid rgba(255,255,255,.06)' },
  demoDots: { display: 'flex', gap: 6 },
  demoDot: { width: 11, height: 11, borderRadius: '50%' },
  demoUrl: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', textAlign: 'center', background: 'rgba(255,255,255,.05)', padding: '4px 12px', borderRadius: 6 },
  demoSecure: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#22c55e', textAlign: 'right', letterSpacing: '0.08em' },
  demoBody: { display: 'grid', gridTemplateColumns: '1fr 24px 1fr' },
  demoArrow: { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#7c6cf0', borderLeft: '1px solid rgba(255,255,255,.06)', borderRight: '1px solid rgba(255,255,255,.06)' },
  demoPanel: { padding: 18, minHeight: 360 },
  demoPanelHead: { display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,.06)' },

  // Trust
  trust: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', background: '#0c0c14', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' },
  trustItem: { padding: '40px 32px', borderRight: '1px solid rgba(255,255,255,.06)', textAlign: 'center' },
  trustK: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', color: '#a78bfa', marginBottom: 8 },
  trustL: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.08em', textTransform: 'uppercase' },

  // Tools
  tools: { padding: '120px 48px' },
  toolsHead: { textAlign: 'center', marginBottom: 48, maxWidth: 900, margin: '0 auto 48px' },
  toolsLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 20 },
  toolsTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 16px' },
  toolsSub: { fontSize: 17, color: 'rgba(255,255,255,.6)', margin: 0 },
  tabs: { display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 56, flexWrap: 'wrap' },
  tab: { display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 24px', background: '#0c0c14', border: '1px solid rgba(255,255,255,.08)', borderRadius: 99, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .2s, background .2s' },
  tabActive: { background: 'rgba(124,108,240,.08)' },
  tabN: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: '0.1em' },
  tabName: { fontSize: 15, fontWeight: 500 },
  tabCount: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)' },

  catBody: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: 48, maxWidth: 1280, margin: '0 auto' },
  catSidebar: { paddingTop: 12 },
  catSidebarN: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, letterSpacing: '0.15em', marginBottom: 16 },
  catSidebarTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 16px' },
  catSidebarDesc: { fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.55, margin: '0 0 24px', maxWidth: 280 },
  catSidebarStat: { display: 'flex', gap: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#a78bfa', letterSpacing: '0.05em' },

  catList: { display: 'flex', flexDirection: 'column' },
  toolRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, padding: '24px 28px', borderTop: '1px solid rgba(255,255,255,.08)', borderRadius: 0, transition: 'background .2s, border-color .2s' },
  toolRowMain: { flex: 1 },
  toolRowHead: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 },
  toolRowName: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' },
  toolRowBadge: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '2px 8px', border: '1px solid', borderRadius: 99, letterSpacing: '0.08em', textTransform: 'uppercase' },
  toolRowDesc: { fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, maxWidth: 640 },
  toolRowSide: { display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 },
  toolRowStatusLive: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#22c55e', letterSpacing: '0.08em' },
  toolRowStatusSoon: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: '0.08em' },
  toolRowArrow: { fontSize: 20, transition: 'transform .2s, color .2s', minWidth: 16 },

  // How
  how: { padding: '120px 48px', background: '#0c0c14', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' },
  howInner: { maxWidth: 1280, margin: '0 auto' },
  howLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 20, textAlign: 'center' },
  howTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 48, lineHeight: 1.08, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 auto 80px', textAlign: 'center', maxWidth: 1000 },
  howSteps: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, marginBottom: 64 },
  step: { border: '1px solid rgba(255,255,255,.06)', borderRadius: 14, padding: 32, background: '#08080c' },
  stepN: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#a78bfa', letterSpacing: '0.15em', marginBottom: 24 },
  stepTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 12 },
  stepBody: { fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,.65)', margin: 0 },
  howNetwork: { background: '#08080c', border: '1px solid rgba(124,108,240,.2)', borderRadius: 14, padding: '40px 48px', textAlign: 'center' },
  howNetTitle: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.6)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' },
  howNetBig: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 88, fontWeight: 500, color: '#a78bfa', letterSpacing: '-0.04em', lineHeight: 1, margin: '8px 0 16px' },
  howNetSub: { fontSize: 14, color: 'rgba(255,255,255,.55)', maxWidth: 640, margin: '0 auto', lineHeight: 1.5 },

  // Blog
  blog: { padding: '120px 48px', maxWidth: 1280, margin: '0 auto' },
  blogHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 },
  blogLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 12 },
  blogTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', margin: 0 },
  blogAll: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#a78bfa', cursor: 'pointer', letterSpacing: '0.05em' },
  blogGrid: { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32 },
  blogFeatured: { display: 'block', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, overflow: 'hidden', background: '#0c0c14', cursor: 'pointer', transition: 'border-color .2s' },
  blogFeaturedImg: { position: 'relative', aspectRatio: '16/9', background: 'repeating-linear-gradient(135deg, #15151f 0 18px, #11111a 18px 36px)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  blogFeaturedTag: { position: 'absolute', top: 24, left: 24, padding: '6px 12px', background: 'rgba(124,108,240,.2)', border: '1px solid rgba(167,139,250,.4)', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#a78bfa', letterSpacing: '0.08em' },
  blogFeaturedBody: { padding: 32 },
  blogFeaturedMeta: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.1em', marginBottom: 16 },
  blogFeaturedTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 12px' },
  blogFeaturedDesc: { fontSize: 15, color: 'rgba(255,255,255,.65)', lineHeight: 1.55, margin: '0 0 20px' },
  blogReadMore: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#a78bfa', letterSpacing: '0.05em' },
  blogList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' },
  blogItem: { display: 'block', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,.08)', cursor: 'pointer' },
  blogItemMeta: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.1em', marginBottom: 8 },
  blogItemTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 19, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 6 },
  blogItemDesc: { fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.5, marginBottom: 8 },
  blogItemTag: { display: 'inline-block', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', letterSpacing: '0.1em' },
  placeholderLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '0.12em', textTransform: 'uppercase' },

  // Manifest
  manifest: { padding: '120px 48px', background: '#08080c' },
  manifestInner: { maxWidth: 1280, margin: '0 auto' },
  manifestLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 24 },
  manifestTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, lineHeight: 1.1, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 80px', maxWidth: 1100 },
  manifestCols: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 48, paddingTop: 48, borderTop: '1px solid rgba(255,255,255,.08)' },
  manifestCol: {},
  manifestColLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.15em', marginBottom: 16 },
  manifestColBody: { fontSize: 16, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', margin: 0 },

  // Footer
  footer: { padding: '120px 48px 40px', background: '#0a0a12', borderTop: '1px solid rgba(255,255,255,.06)' },
  footerCta: { textAlign: 'center', maxWidth: 900, margin: '0 auto 100px' },
  footerCtaTitle: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 40px' },
  footerCtaList: { display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 },
  footerCtaPill: { padding: '14px 24px', border: '1px solid rgba(167,139,250,.3)', borderRadius: 99, fontSize: 14, fontWeight: 500, color: '#a78bfa', cursor: 'pointer' },
  footerCols: { display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,.06)' },
  footerCol: {},
  footerBrand: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  footerByline: { fontSize: 14, color: 'rgba(255,255,255,.55)', maxWidth: 280, lineHeight: 1.55, margin: 0 },
  footerBylineLink: { color: '#a78bfa', borderBottom: '1px solid rgba(167,139,250,.3)' },
  footerColLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' },
  footerLink: { display: 'block', padding: '6px 0', fontSize: 14, color: 'rgba(255,255,255,.7)', cursor: 'pointer' },
  footerBottom: { display: 'flex', justifyContent: 'space-between', paddingTop: 32, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.08em', flexWrap: 'wrap', gap: 16 },
};

window.HomeC = HomeC;
