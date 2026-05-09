// Home — Wariant A: Editorial Cinematic
// Serif italic display, numerowane sekcje, full-bleed bg, bardzo dużo oddechu

const HomeA = () => {
  return (
    <div style={aStyles.root}>
      <ANav />
      <AHero />
      <AManifest />
      <AToolsIntro />
      <AGroup
        n="03"
        label="Tekst"
        intro="Wszystko co dotyczy języka — markdown, AI, pliki tekstowe, kod."
        tools={[
          { name: 'Markdown Formatter', tag: 'AI → Word/Docs', live: true },
          { name: 'JS Minifier', tag: 'minify / format', live: true },
          { name: 'CSS Minifier', tag: 'minify / format', live: true },
          { name: 'JSON Formatter', tag: 'walidacja, podgląd', live: false },
        ]}
      />
      <AGroup
        n="04"
        label="Obrazy"
        intro="Konwersja i kompresja w przeglądarce — zero uploadu."
        dark
        tools={[
          { name: 'AVIF Converter', tag: 'PNG/JPG/WebP → AVIF', live: true },
          { name: 'HEIC Converter', tag: 'iPhone → JPG/PNG', live: true },
          { name: 'Color Palette', tag: 'HEX/RGB/HSL, WCAG', live: false },
        ]}
      />
      <AGroup
        n="05"
        label="Dokumenty"
        intro="PDF i HTML — łączenie, dzielenie, kompresja, eksport."
        tools={[
          { name: 'PDF Tools', tag: 'merge / split / compress', live: true },
          { name: 'HTML to PDF', tag: 'kod / URL → PDF', live: true },
          { name: 'Email Signature', tag: 'kreator stopki', live: true },
        ]}
      />
      <AGroup
        n="06"
        label="SEO"
        intro="Klasyczny SEO + GEO pod AI wyszukiwarki."
        dark
        tools={[
          { name: 'SEO & GEO Generator', tag: 'meta + Schema.org + llms.txt', live: true },
        ]}
      />
      <AArticles />
      <AFooter />
    </div>
  );
};

// ===== Nav =====
const ANav = () => (
  <header style={aStyles.nav}>
    <div style={aStyles.navBrand}>
      <div style={aStyles.navLogo}></div>
      <div>
        <div style={aStyles.navTitle}>Formatted<em style={aStyles.navTitleEm}>AI</em></div>
      </div>
    </div>
    <nav style={aStyles.navLinks}>
      <a style={aStyles.navLink}>Narzędzia</a>
      <a style={aStyles.navLink}>Dziennik</a>
      <a style={aStyles.navLink}>Manifest</a>
      <a style={aStyles.navLinkAlt}>EN</a>
    </nav>
  </header>
);

// ===== Hero =====
const AHero = () => (
  <section style={aStyles.hero}>
    <div style={aStyles.heroBg}>
      <div style={aStyles.heroBgGradient}></div>
      <div style={aStyles.heroBgGrid}></div>
      <div style={aStyles.heroBgOrb1}></div>
      <div style={aStyles.heroBgOrb2}></div>
    </div>
    <div style={aStyles.heroContent}>
      <div style={aStyles.heroEyebrow}>
        <span style={aStyles.heroDot}></span>
        / 01 / PRYWATNOŚĆ JAKO DEFAULT
      </div>
      <h1 style={aStyles.heroTitle}>
        Twoje dane <em style={aStyles.heroEm}>nigdy</em><br />
        nie opuszczają<br />
        <em style={aStyles.heroEm}>urządzenia.</em>
      </h1>
      <div style={aStyles.heroFooter}>
        <div style={aStyles.heroDesc}>
          Darmowe narzędzia dla web developerów<br />
          i twórców treści. Wszystko działa w przeglądarce.
        </div>
        <div style={aStyles.heroScroll}>
          <span>scroll</span>
          <div style={aStyles.heroScrollLine}></div>
        </div>
      </div>
    </div>
  </section>
);

// ===== Manifest =====
const AManifest = () => (
  <section style={aStyles.manifest}>
    <div style={aStyles.manifestEyebrow}>/ 02 / MANIFEST</div>
    <p style={aStyles.manifestText}>
      Tradycyjne narzędzia webowe wysyłają Twoje dane na serwer.
      My działamy <em style={aStyles.manifestEm}>inaczej</em>.
      Całe przetwarzanie odbywa się w przeglądarce — przez JavaScript
      i WebAssembly. <em style={aStyles.manifestEm}>Zero kont.</em>
      &nbsp;Zero cookies. Zero śledzenia.
    </p>
    <div style={aStyles.manifestStats}>
      <Stat n="9" label="aktywnych narzędzi" />
      <Stat n="0" label="bajtów na serwerze" />
      <Stat n="100%" label="open source" />
    </div>
  </section>
);

const Stat = ({ n, label }) => (
  <div style={aStyles.stat}>
    <div style={aStyles.statN}>{n}</div>
    <div style={aStyles.statLabel}>{label}</div>
  </div>
);

// ===== Tools intro =====
const AToolsIntro = () => (
  <section style={aStyles.toolsIntro}>
    <div style={aStyles.toolsIntroNum}>03 — 06</div>
    <h2 style={aStyles.toolsIntroTitle}>
      Narzędzia w czterech<br />
      <em style={aStyles.toolsIntroEm}>rejestrach</em>.
    </h2>
    <div style={aStyles.toolsIntroLine}></div>
  </section>
);

// ===== Group =====
const AGroup = ({ n, label, intro, tools, dark }) => (
  <section style={dark ? aStyles.groupDark : aStyles.group}>
    <div style={aStyles.groupHead}>
      <div style={aStyles.groupNum}>/ {n} /</div>
      <h3 style={aStyles.groupLabel}>{label}</h3>
      <p style={aStyles.groupIntro}>{intro}</p>
    </div>
    <ul style={aStyles.groupList}>
      {tools.map((t, i) => (
        <li key={i} style={aStyles.toolRow}>
          <span style={aStyles.toolIdx}>{String(i + 1).padStart(2, '0')}</span>
          <span style={aStyles.toolName}>{t.name}</span>
          <span style={aStyles.toolTag}>{t.tag}</span>
          <span style={t.live ? aStyles.toolStatus : aStyles.toolStatusSoon}>
            {t.live ? 'Dostępne' : 'Wkrótce'}
          </span>
          <span style={aStyles.toolArrow}>→</span>
        </li>
      ))}
    </ul>
  </section>
);

// ===== Articles teaser =====
const AArticles = () => (
  <section style={aStyles.articles}>
    <div style={aStyles.articlesEyebrow}>/ 07 / DZIENNIK</div>
    <div style={aStyles.articlesGrid}>
      <article style={aStyles.articleBig}>
        <div style={aStyles.articleBigImg}>
          <span style={aStyles.placeholderLabel}>[ hero artykułu ]</span>
        </div>
        <div style={aStyles.articleBigDate}>04 · 2026</div>
        <h3 style={aStyles.articleBigTitle}>
          ChatGPT i formatowanie<br />
          w Google Docs
        </h3>
        <p style={aStyles.articleBigDesc}>
          Dlaczego markdown z AI psuje się w Word i jak to naprawić w jednym kliknięciu.
        </p>
      </article>
      <ul style={aStyles.articleList}>
        <ArticleListItem date="03 · 2026" title="GEO — optymalizacja pod AI" />
        <ArticleListItem date="02 · 2026" title="Optymalizacja zdjęć w AVIF" />
        <ArticleListItem date="01 · 2026" title="PDF — darmowe narzędzia online" />
      </ul>
    </div>
  </section>
);

const ArticleListItem = ({ date, title }) => (
  <li style={aStyles.articleItem}>
    <div style={aStyles.articleItemDate}>{date}</div>
    <div style={aStyles.articleItemTitle}>{title}</div>
    <div style={aStyles.articleItemArrow}>→</div>
  </li>
);

// ===== Footer =====
const AFooter = () => (
  <footer style={aStyles.footer}>
    <div style={aStyles.footerTitle}>Formatted<em style={{fontStyle:'italic',color:'#a78bfa'}}>AI</em></div>
    <div style={aStyles.footerCols}>
      <div>
        <div style={aStyles.footerColTitle}>Narzędzia</div>
        <a style={aStyles.footerLink}>Tekst</a>
        <a style={aStyles.footerLink}>Obrazy</a>
        <a style={aStyles.footerLink}>Dokumenty</a>
        <a style={aStyles.footerLink}>SEO</a>
      </div>
      <div>
        <div style={aStyles.footerColTitle}>Treść</div>
        <a style={aStyles.footerLink}>Dziennik</a>
        <a style={aStyles.footerLink}>O projekcie</a>
        <a style={aStyles.footerLink}>Manifest</a>
      </div>
      <div>
        <div style={aStyles.footerColTitle}>Kontakt</div>
        <a style={aStyles.footerLink}>GitHub</a>
        <a style={aStyles.footerLink}>Email</a>
        <a style={aStyles.footerLink}>RSS</a>
      </div>
    </div>
    <div style={aStyles.footerBottom}>
      <span>© 2026 Adam Szczotka</span>
      <span>Zero danych na serwerze.</span>
    </div>
  </footer>
);

// ===== Styles =====
const aStyles = {
  root: {
    width: '100%',
    background: '#08080c',
    color: '#f4f3f1',
    fontFamily: 'Inter, sans-serif',
  },
  // Nav
  nav: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '32px 64px',
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: 12 },
  navLogo: {
    width: 28, height: 28,
    background: 'linear-gradient(135deg,#a78bfa,#6c5ce7)',
    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  },
  navTitle: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
  },
  navTitleEm: { fontStyle: 'italic', color: '#a78bfa' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 32 },
  navLink: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,.7)', cursor: 'pointer',
  },
  navLinkAlt: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: '#a78bfa', cursor: 'pointer',
    border: '1px solid rgba(167,139,250,.4)',
    padding: '6px 12px', borderRadius: 99,
  },
  // Hero
  hero: {
    position: 'relative',
    minHeight: 980,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '0 64px 80px',
  },
  heroBg: { position: 'absolute', inset: 0, overflow: 'hidden' },
  heroBgGradient: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 30% 40%, rgba(124,108,240,.25) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(167,139,250,.15) 0%, transparent 50%)',
  },
  heroBgGrid: {
    position: 'absolute', inset: 0,
    backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
    backgroundSize: '80px 80px',
  },
  heroBgOrb1: {
    position: 'absolute', top: '20%', right: '15%', width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,108,240,.3), transparent 60%)',
    filter: 'blur(60px)',
  },
  heroBgOrb2: {
    position: 'absolute', bottom: '10%', left: '5%', width: 500, height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(167,139,250,.2), transparent 60%)',
    filter: 'blur(80px)',
  },
  heroContent: { position: 'relative', zIndex: 5, maxWidth: 1200 },
  heroEyebrow: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.18em',
    color: '#a78bfa',
    display: 'inline-flex', alignItems: 'center', gap: 12,
    marginBottom: 64,
  },
  heroDot: { width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' },
  heroTitle: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 168,
    lineHeight: 0.92,
    letterSpacing: '-0.03em',
    fontWeight: 400,
    margin: '0 0 64px',
  },
  heroEm: { fontStyle: 'italic', color: '#a78bfa' },
  heroFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    gap: 64,
    paddingTop: 40,
    borderTop: '1px solid rgba(255,255,255,.1)',
  },
  heroDesc: {
    fontSize: 18, lineHeight: 1.55, color: 'rgba(255,255,255,.75)',
    maxWidth: 480,
  },
  heroScroll: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,.5)',
  },
  heroScrollLine: { width: 1, height: 80, background: 'linear-gradient(to bottom, rgba(255,255,255,.4), transparent)' },
  // Manifest
  manifest: {
    padding: '160px 64px 120px',
    maxWidth: 1280,
    margin: '0 auto',
  },
  manifestEyebrow: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.18em',
    color: '#7c6cf0',
    marginBottom: 64,
  },
  manifestText: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 56,
    lineHeight: 1.18,
    letterSpacing: '-0.01em',
    fontWeight: 400,
    margin: '0 0 80px',
    maxWidth: 1100,
  },
  manifestEm: { fontStyle: 'italic', color: '#a78bfa' },
  manifestStats: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    gap: 32, paddingTop: 40,
    borderTop: '1px solid rgba(255,255,255,.1)',
  },
  stat: {},
  statN: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 88, lineHeight: 0.9, fontStyle: 'italic',
    color: '#fff', marginBottom: 8,
  },
  statLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,.5)',
  },
  // Tools intro
  toolsIntro: {
    padding: '120px 64px 64px',
    maxWidth: 1280, margin: '0 auto',
  },
  toolsIntroNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.18em',
    color: '#7c6cf0', marginBottom: 32,
  },
  toolsIntroTitle: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 120, lineHeight: 0.95, fontWeight: 400,
    letterSpacing: '-0.02em',
    margin: '0 0 48px',
  },
  toolsIntroEm: { fontStyle: 'italic', color: '#a78bfa' },
  toolsIntroLine: { height: 1, background: 'rgba(255,255,255,.1)' },
  // Groups
  group: {
    padding: '100px 64px',
    background: '#08080c',
    borderTop: '1px solid rgba(255,255,255,.06)',
  },
  groupDark: {
    padding: '100px 64px',
    background: '#11111a',
    borderTop: '1px solid rgba(255,255,255,.06)',
  },
  groupHead: {
    maxWidth: 1280, margin: '0 auto 56px',
    display: 'grid', gridTemplateColumns: '120px 1fr 360px', gap: 48,
    alignItems: 'baseline',
  },
  groupNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, color: '#7c6cf0', letterSpacing: '0.12em',
  },
  groupLabel: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 80, fontStyle: 'italic', fontWeight: 400,
    margin: 0, lineHeight: 0.95, letterSpacing: '-0.02em',
  },
  groupIntro: {
    fontSize: 16, lineHeight: 1.55,
    color: 'rgba(255,255,255,.6)',
    margin: 0,
  },
  groupList: {
    listStyle: 'none', padding: 0, margin: '0 auto', maxWidth: 1280,
  },
  toolRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 220px 100px 30px',
    gap: 32, alignItems: 'center',
    padding: '28px 0',
    borderTop: '1px solid rgba(255,255,255,.08)',
    cursor: 'pointer',
  },
  toolIdx: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, color: 'rgba(255,255,255,.4)',
  },
  toolName: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 28, fontWeight: 500, letterSpacing: '-0.01em',
  },
  toolTag: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: '0.05em',
  },
  toolStatus: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: '#22c55e', letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  toolStatusSoon: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  toolArrow: {
    fontSize: 20, color: 'rgba(255,255,255,.3)', textAlign: 'right',
  },
  // Articles
  articles: {
    padding: '160px 64px 100px',
    maxWidth: 1280, margin: '0 auto',
  },
  articlesEyebrow: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.18em',
    color: '#7c6cf0', marginBottom: 48,
  },
  articlesGrid: {
    display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 64,
  },
  articleBig: {},
  articleBigImg: {
    width: '100%', aspectRatio: '4/3',
    background: 'repeating-linear-gradient(135deg, #1a1a26 0 24px, #11111a 24px 48px)',
    border: '1px solid rgba(255,255,255,.08)',
    marginBottom: 24,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  placeholderLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.3)',
    letterSpacing: '0.15em', textTransform: 'uppercase',
  },
  articleBigDate: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: '#7c6cf0', letterSpacing: '0.15em',
    marginBottom: 16,
  },
  articleBigTitle: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 56, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em',
    margin: '0 0 20px',
  },
  articleBigDesc: {
    fontSize: 17, lineHeight: 1.5, color: 'rgba(255,255,255,.65)',
    margin: 0, maxWidth: 480,
  },
  articleList: { listStyle: 'none', padding: 0, margin: 0 },
  articleItem: {
    display: 'grid', gridTemplateColumns: '80px 1fr 30px',
    gap: 20, padding: '32px 0',
    borderTop: '1px solid rgba(255,255,255,.08)',
    alignItems: 'baseline',
    cursor: 'pointer',
  },
  articleItemDate: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.12em',
  },
  articleItemTitle: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
  },
  articleItemArrow: { color: 'rgba(255,255,255,.3)', fontSize: 18 },
  // Footer
  footer: {
    padding: '100px 64px 56px',
    background: '#0a0a14',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },
  footerTitle: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 88, lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em',
    marginBottom: 64,
  },
  footerCols: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
    gap: 64, paddingBottom: 64,
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  footerColTitle: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: '#7c6cf0', letterSpacing: '0.15em',
    textTransform: 'uppercase', marginBottom: 20,
  },
  footerLink: {
    display: 'block',
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 16, color: 'rgba(255,255,255,.7)',
    padding: '8px 0', cursor: 'pointer',
  },
  footerBottom: {
    display: 'flex', justifyContent: 'space-between',
    paddingTop: 32,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.4)',
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
};

window.HomeA = HomeA;
