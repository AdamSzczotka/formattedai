// Articles listing — editorial: pierwszy artykuł duży (cinematic hero), reszta jako lista

const { useState, useEffect } = React;

const Logo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="alg" x1="4" y1="2" x2="28" y2="30">
        <stop stopColor="#a78bfa" />
        <stop offset="1" stopColor="#6c5ce7" />
      </linearGradient>
      <linearGradient id="algf" x1="4" y1="2" x2="28" y2="30">
        <stop stopColor="rgba(108,92,231,0.35)" />
        <stop offset="1" stopColor="rgba(167,139,250,0.12)" />
      </linearGradient>
    </defs>
    <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#alg)" strokeWidth="1.5" fill="url(#algf)" />
    <path d="M10 14L14 18L22 10" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const A_ARTICLES = [
  {
    slug: 'chatgpt-formatowanie-google-docs',
    date: '04 / 2026', dateLong: '12 kwietnia 2026',
    read: '6 min', tag: 'Markdown', category: 'Tekst',
    title: 'ChatGPT i formatowanie w Google Docs',
    desc: 'Dlaczego markdown z AI psuje się w Word i Docs, i jak to naprawić w jednym kliknięciu — bez wysyłania dokumentu na zewnętrzny serwer.',
    excerpt: 'Każdy, kto pracuje z ChatGPT lub Claude, zna ten ból: kopiujesz odpowiedź, wklejasz do Worda i widzisz „# nagłówek", „**pogrubienie**", a tabele rozjeżdżają się po slajdzie. To nie jest błąd narzędzia — markdown po prostu nie jest formatem dokumentu. W tym artykule pokazuję trzy ścieżki: import przez przeglądarkę bez instalowania niczego, automatyzacja w Docs przez Apps Script, oraz prostsza alternatywa — formatter który robi to lokalnie.',
  },
  {
    slug: 'geo-optymalizacja-pod-ai',
    date: '03 / 2026', dateLong: '28 marca 2026',
    read: '8 min', tag: 'SEO', category: 'SEO',
    title: 'GEO — optymalizacja pod AI wyszukiwarki',
    desc: 'Schema.org, llms.txt, robots.txt — co naprawdę robi różnicę dla ChatGPT Search, Perplexity i Google AI Overviews.',
  },
  {
    slug: 'optymalizacja-zdjec-avif',
    date: '02 / 2026', dateLong: '14 lutego 2026',
    read: '5 min', tag: 'Obrazy', category: 'Obrazy',
    title: 'Optymalizacja zdjęć w formacie AVIF',
    desc: '50% mniejsze pliki przy tej samej jakości. Praktyczny przewodnik z benchmarkami na realnych zdjęciach z aparatu i ze stocku.',
  },
  {
    slug: 'pdf-darmowe-narzedzia-online',
    date: '01 / 2026', dateLong: '20 stycznia 2026',
    read: '7 min', tag: 'Dokumenty', category: 'Dokumenty',
    title: 'PDF — darmowe narzędzia online bez serwera',
    desc: 'Łączenie, dzielenie i kompresja PDF w przeglądarce. Test 7 alternatyw — które naprawdę nie wysyłają plików, a które kłamią.',
  },
];

const A_TAGS = ['Wszystkie', 'Tekst', 'Obrazy', 'Dokumenty', 'SEO'];

const ArticlesList = () => {
  const [tag, setTag] = useState('Wszystkie');
  const filtered = tag === 'Wszystkie' ? A_ARTICLES : A_ARTICLES.filter(a => a.category === tag);
  const [hero, ...rest] = filtered;
  return (
    <div style={A.root}>
      <ANav />
      <AHeader />
      <ATagBar tag={tag} setTag={setTag} count={filtered.length} total={A_ARTICLES.length} />
      {hero && <AFeatured a={hero} />}
      <AListSection items={rest} />
      <ASubscribe />
      <AFooter />
    </div>
  );
};

const ANav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header style={{...A.nav, ...(scrolled ? A.navScrolled : {})}}>
      <a href="Home.html" style={A.navBrand}>
        <FALogo size={22} asLink={false} />
        <div style={{fontSize:11, color:'rgba(255,255,255,.4)', fontFamily:'"JetBrains Mono", monospace', marginLeft: 32, marginTop: 2}}>dziennik</div>
      </a>
      <nav style={A.navLinks}>
        <a href="Home.html#tools" style={A.navLink}>Narzędzia</a>
        <a href="Home.html#how" style={A.navLink}>Jak to działa</a>
        <a href="#" style={{...A.navLink, color: '#fff'}}>Dziennik</a>
        <a href="Home.html" style={A.navLink}>O projekcie</a>
      </nav>
      <div style={A.navRight}>
        <a href="#" style={A.navLang}>EN</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={A.navGh}>GitHub</a>
      </div>
    </header>
  );
};

// Header — cinematic, oddychający
const AHeader = () => (
  <section style={A.header}>
    <div style={A.headerBg}>
      <div style={A.headerOrb}></div>
      <div style={A.headerGrid}></div>
    </div>
    <div style={A.headerInner}>
      <div style={A.headerLabel}>/ DZIENNIK · ARCHIWUM 2026</div>
      <h1 style={A.headerTitle}>
        Notatki o tym, jak<br />
        narzędzia powstają<br />
        i <span style={A.headerTitleHl}>dlaczego</span>.
      </h1>
      <p style={A.headerDesc}>
        Długie wpisy o markdown, AI, formatach plików i prywatności w przeglądarce.
        Bez clickbaitu, bez SEO-słupków, bez „10 sposobów żeby&hellip;". Po prostu to,
        co warto wiedzieć, jeśli pracujesz z dokumentami i chcesz robić to mądrzej.
      </p>
      <div style={A.headerMeta}>
        <span><strong style={{color:'#a78bfa'}}>{A_ARTICLES.length}</strong> wpisów</span>
        <span style={A.headerMetaDot}>·</span>
        <span>nowy mniej więcej co miesiąc</span>
        <span style={A.headerMetaDot}>·</span>
        <span><a href="/articles/feed.xml" style={A.headerMetaLink}>RSS ↗</a></span>
      </div>
    </div>
  </section>
);

const ATagBar = ({ tag, setTag, count, total }) => (
  <section style={A.tagbar}>
    <div style={A.tagbarLeft}>
      {A_TAGS.map(t => (
        <button key={t} onClick={() => setTag(t)}
          style={{...A.tagBtn, ...(t === tag ? A.tagBtnActive : {})}}>
          {t}
        </button>
      ))}
    </div>
    <div style={A.tagbarRight}>
      {count === total
        ? <span>{total} wpisów</span>
        : <span>{count} z {total} wpisów</span>}
    </div>
  </section>
);

// Featured — duży, cinematic
const AFeatured = ({ a }) => {
  const [h, setH] = useState(false);
  return (
    <a href={`Article.html?slug=${a.slug}`}
       onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
       style={A.featured}>
      <div style={A.featuredImg}>
        <div style={{...A.featuredImgPattern, opacity: h ? 0.9 : 0.7, transform: h ? 'scale(1.02)' : 'scale(1)'}}></div>
        <span style={A.featuredTag}>{a.tag}</span>
        <span style={A.featuredPlaceholder}>[ {a.tag.toLowerCase()} · hero ]</span>
        <div style={A.featuredImgGrad}></div>
      </div>
      <div style={A.featuredBody}>
        <div style={A.featuredMeta}>
          <span style={A.featuredFresh}>● najnowszy</span>
          <span>{a.dateLong}</span>
          <span style={A.featuredMetaDot}>·</span>
          <span>{a.read} czytania</span>
        </div>
        <h2 style={A.featuredTitle}>{a.title}</h2>
        <p style={A.featuredExcerpt}>{a.excerpt || a.desc}</p>
        <div style={A.featuredFoot}>
          <span style={{...A.featuredCta, color: h ? '#fff' : '#a78bfa'}}>
            Czytaj cały artykuł
            <span style={{display:'inline-block', transform: h ? 'translateX(6px)' : 'none', transition: 'transform .25s'}}> →</span>
          </span>
          <span style={A.featuredAuthor}>Adam Szczotka</span>
        </div>
      </div>
    </a>
  );
};

// Lista
const AListSection = ({ items }) => {
  if (!items.length) return (
    <section style={{...A.list, textAlign: 'center', color: 'rgba(255,255,255,.5)', fontFamily:'"JetBrains Mono", monospace', fontSize: 13}}>
      / brak innych wpisów w tej kategorii
    </section>
  );
  return (
    <section style={A.list}>
      <div style={A.listHead}>
        <span style={A.listLabel}>/ ARCHIWUM</span>
        <span style={A.listSep}></span>
        <span style={A.listCount}>{items.length} wpisów</span>
      </div>
      <ul style={A.listUl}>
        {items.map((a, i) => <AListItem key={a.slug} a={a} idx={i + 2} />)}
      </ul>
    </section>
  );
};

const AListItem = ({ a, idx }) => {
  const [h, setH] = useState(false);
  const num = String(idx).padStart(2, '0');
  return (
    <li>
      <a href={`Article.html?slug=${a.slug}`}
         onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
         style={{...A.listItem, background: h ? 'rgba(124,108,240,.04)' : 'transparent', borderColor: h ? 'rgba(167,139,250,.25)' : 'rgba(255,255,255,.08)'}}>
        <div style={A.listN}>{num}</div>
        <div style={A.listMain}>
          <div style={A.listMeta}>
            <span style={A.listTag}>{a.tag}</span>
            <span style={A.listMetaItem}>{a.date}</span>
            <span style={A.listMetaItem}>{a.read}</span>
          </div>
          <h3 style={{...A.listTitle, color: h ? '#fff' : '#f0f0f4'}}>{a.title}</h3>
          <p style={A.listDesc}>{a.desc}</p>
        </div>
        <div style={{...A.listArrow, color: h ? '#a78bfa' : 'rgba(255,255,255,.25)', transform: h ? 'translateX(6px)' : 'none'}}>→</div>
      </a>
    </li>
  );
};

// Subscribe / RSS
const ASubscribe = () => (
  <section style={A.sub}>
    <div style={A.subInner}>
      <div style={A.subLabel}>/ NIE PRZEGAP</div>
      <h2 style={A.subTitle}>
        Nie ma newslettera.<br />
        <span style={{color:'#a78bfa'}}>Jest RSS i&nbsp;jest llms.txt.</span>
      </h2>
      <p style={A.subDesc}>
        Wpisy ukazują się ~raz w miesiącu. Jeśli używasz czytnika RSS, dodaj feed —
        jeśli używasz AI asystenta, podlinkuj llms.txt, żeby Twój model widział nowe artykuły.
      </p>
      <div style={A.subBtns}>
        <a href="/articles/feed.xml" style={A.subBtnPrimary}>
          <span>📡</span>
          <span>
            <span style={{display:'block', fontSize:11, opacity:.7, fontFamily:'"JetBrains Mono", monospace', letterSpacing:'0.08em'}}>SUBSKRYBUJ</span>
            <span>RSS feed</span>
          </span>
        </a>
        <a href="/llms.txt" style={A.subBtnGhost}>
          <span>🤖</span>
          <span>
            <span style={{display:'block', fontSize:11, opacity:.5, fontFamily:'"JetBrains Mono", monospace', letterSpacing:'0.08em'}}>DLA AI</span>
            <span>llms.txt</span>
          </span>
        </a>
      </div>
    </div>
  </section>
);

const AFooter = () => (
  <footer style={A.footer}>
    <div style={A.footerInner}>
      <a href="Home.html" style={A.footerBrand}>
        <div>
          <FALogo size={26} asLink={false} />
          <div style={{fontSize:12, color:'rgba(255,255,255,.5)', marginTop: 6, marginLeft: 36}}>Narzędzia · 100% client-side</div>
        </div>
      </a>
      <p style={A.footerByline}>
        Stworzone przez{' '}
        <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={{color:'#a78bfa', borderBottom:'1px solid rgba(167,139,250,.3)'}}>
          Adama Szczotkę ↗
        </a>
        {' · '}MIT · zero danych na serwerze
      </p>
      <div style={A.footerLinks}>
        <a href="Home.html" style={A.footerLink}>Strona główna</a>
        <a href="Home.html#tools" style={A.footerLink}>Narzędzia</a>
        <a href="https://github.com/AdamSzczotka/formattedai" target="_blank" rel="noopener" style={A.footerLink}>GitHub ↗</a>
        <a href="/articles/feed.xml" style={A.footerLink}>RSS</a>
        <a href="/llms.txt" style={A.footerLink}>llms.txt</a>
      </div>
    </div>
  </footer>
);

// ============== STYLES ==============
const A = {
  root: { width: '100%', background: '#08080c', color: '#f0f0f4', fontFamily: 'Inter, sans-serif' },

  nav: {
    position: 'sticky', top: 0, zIndex: 100,
    display: 'grid', gridTemplateColumns: '260px 1fr 260px',
    alignItems: 'center', padding: '16px 48px',
    borderBottom: '1px solid rgba(255,255,255,.06)',
    background: 'rgba(8,8,12,0)',
    transition: 'background .25s ease, backdrop-filter .25s ease',
  },
  navScrolled: { background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' },
  navBrand: { display: 'flex', alignItems: 'center', gap: 12 },
  navName: { fontFamily: '"Space Grotesk", sans-serif', fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' },
  navTagline: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '0.06em', marginTop: 1 },
  navLinks: { display: 'flex', justifyContent: 'center', gap: 32 },
  navLink: { fontSize: 14, color: 'rgba(255,255,255,.72)', cursor: 'pointer' },
  navRight: { display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' },
  navLang: { fontSize: 13, color: 'rgba(255,255,255,.7)', padding: '6px 10px', cursor: 'pointer' },
  navGh: { fontSize: 13, padding: '8px 14px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: '#fff', cursor: 'pointer' },

  // Header
  header: { position: 'relative', padding: '120px 48px 80px', overflow: 'hidden' },
  headerBg: { position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' },
  headerOrb: { position: 'absolute', top: '20%', left: '60%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,240,.18), transparent 60%)', filter: 'blur(80px)' },
  headerGrid: { position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px)', backgroundSize: '100% 64px' },
  headerInner: { position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto' },
  headerLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 32 },
  headerTitle: { fontFamily: '"Fraunces", "Space Grotesk", serif', fontSize: 96, lineHeight: 0.96, fontWeight: 400, letterSpacing: '-0.035em', margin: '0 0 36px', maxWidth: 1100 },
  headerTitleHl: { fontStyle: 'italic', background: 'linear-gradient(135deg, #a78bfa, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  headerDesc: { fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', maxWidth: 720, margin: '0 0 32px' },
  headerMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.55)', letterSpacing: '0.04em' },
  headerMetaDot: { color: 'rgba(255,255,255,.25)' },
  headerMetaLink: { color: '#a78bfa', borderBottom: '1px solid rgba(167,139,250,.3)' },

  // Tag bar
  tagbar: { position: 'sticky', top: 73, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', maxWidth: 1280, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', flexWrap: 'wrap', gap: 16 },
  tagbarLeft: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tagBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,.55)', padding: '8px 16px', borderRadius: 99, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' },
  tagBtnActive: { background: 'rgba(124,108,240,.15)', color: '#fff' },
  tagbarRight: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.08em' },

  // Featured
  featured: { display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 0, maxWidth: 1280, margin: '64px auto 96px', padding: '0 48px', cursor: 'pointer' },
  featuredImg: { position: 'relative', aspectRatio: '4/5', background: '#11111a', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.06)' },
  featuredImgPattern: { position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, #15151f 0 18px, #0e0e16 18px 36px), radial-gradient(ellipse at 30% 30%, rgba(124,108,240,.3), transparent 70%)', backgroundBlendMode: 'screen', transition: 'opacity .4s, transform .8s ease-out' },
  featuredImgGrad: { position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(8,8,12,.6) 100%)' },
  featuredTag: { position: 'absolute', top: 24, left: 24, padding: '8px 14px', background: 'rgba(124,108,240,.25)', border: '1px solid rgba(167,139,250,.4)', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#cbb8ff', letterSpacing: '0.1em', backdropFilter: 'blur(12px)', zIndex: 2 },
  featuredPlaceholder: { position: 'absolute', bottom: 28, left: 28, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '0.12em', textTransform: 'uppercase', zIndex: 2 },
  featuredBody: { padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  featuredMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.55)', letterSpacing: '0.05em', marginBottom: 24 },
  featuredFresh: { color: '#22c55e', fontSize: 11 },
  featuredMetaDot: { color: 'rgba(255,255,255,.25)' },
  featuredTitle: { fontFamily: '"Fraunces", serif', fontSize: 56, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.025em', margin: '0 0 24px' },
  featuredExcerpt: { fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,.7)', margin: '0 0 32px' },
  featuredFoot: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  featuredCta: { fontFamily: '"JetBrains Mono", monospace', fontSize: 13, letterSpacing: '0.05em', transition: 'color .25s' },
  featuredAuthor: { fontSize: 13, color: 'rgba(255,255,255,.45)' },

  // List
  list: { maxWidth: 1280, margin: '0 auto', padding: '32px 48px 96px' },
  listHead: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  listLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em' },
  listSep: { flex: 1, height: 1, background: 'rgba(255,255,255,.08)' },
  listCount: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.08em' },
  listUl: { listStyle: 'none', padding: 0, margin: 0 },
  listItem: { display: 'grid', gridTemplateColumns: '64px 1fr 32px', gap: 32, alignItems: 'center', padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,.08)', borderRadius: 12, cursor: 'pointer', transition: 'background .2s, border-color .2s' },
  listN: { fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em' },
  listMain: { minWidth: 0 },
  listMeta: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' },
  listTag: { padding: '3px 10px', background: 'rgba(167,139,250,.12)', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', letterSpacing: '0.08em' },
  listMetaItem: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.45)', letterSpacing: '0.05em' },
  listTitle: { fontFamily: '"Fraunces", serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 8px', transition: 'color .2s' },
  listDesc: { fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.55, margin: 0, maxWidth: 720 },
  listArrow: { fontSize: 22, transition: 'transform .25s, color .25s', textAlign: 'right' },

  // Subscribe
  sub: { padding: '120px 48px', borderTop: '1px solid rgba(255,255,255,.08)', background: '#0a0a14' },
  subInner: { maxWidth: 880, margin: '0 auto', textAlign: 'center' },
  subLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 24 },
  subTitle: { fontFamily: '"Fraunces", serif', fontSize: 64, lineHeight: 1.05, fontWeight: 400, letterSpacing: '-0.03em', margin: '0 0 24px' },
  subDesc: { fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,.65)', margin: '0 0 40px' },
  subBtns: { display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' },
  subBtnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 14, padding: '18px 28px', background: '#7c6cf0', color: '#fff', borderRadius: 12, cursor: 'pointer', boxShadow: '0 12px 40px rgba(124,108,240,.4)', textAlign: 'left', fontSize: 16, fontWeight: 500 },
  subBtnGhost: { display: 'inline-flex', alignItems: 'center', gap: 14, padding: '18px 28px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', fontSize: 16, fontWeight: 500, color: '#fff' },

  // Footer
  footer: { padding: '64px 48px', borderTop: '1px solid rgba(255,255,255,.08)' },
  footerInner: { maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' },
  footerBrand: { display: 'flex', alignItems: 'center', gap: 12 },
  footerByline: { fontSize: 13, color: 'rgba(255,255,255,.55)', margin: 0 },
  footerLinks: { display: 'flex', gap: 24, flexWrap: 'wrap' },
  footerLink: { fontSize: 13, color: 'rgba(255,255,255,.65)', cursor: 'pointer' },
};

window.ArticlesList = ArticlesList;
