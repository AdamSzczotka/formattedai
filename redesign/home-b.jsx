// Home — Wariant B: Atelier
// Architektoniczny grotesk, mono labels, full-bleed rzędy z hover-preview
// Najczystszy / najbardziej deweloperski

const HomeB = () => {
  return (
    <div style={bStyles.root}>
      <BNav />
      <BHero />
      <BIndex />
      <BCategory
        n="01"
        cat="Tekst"
        en="Text"
        tools={[
          { name: 'Markdown Formatter', desc: 'Wklej tekst z ChatGPT i skopiuj idealny dokument do Word lub Docs.', live: true },
          { name: 'JS Minifier', desc: 'Minifikuj i formatuj JavaScript. Esbuild + Terser w przeglądarce.', live: true },
          { name: 'CSS Minifier', desc: 'Minifikuj i formatuj CSS. Bez utraty funkcjonalności.', live: true },
          { name: 'JSON Formatter', desc: 'Walidacja, podświetlanie składni, wykrywanie błędów.', live: false },
        ]}
      />
      <BCategory
        n="02"
        cat="Obrazy"
        en="Images"
        tools={[
          { name: 'AVIF Converter', desc: 'PNG/JPG/WebP → AVIF. Batch, presety jakości, ZIP.', live: true },
          { name: 'HEIC Converter', desc: 'Zdjęcia z iPhone na JPG/PNG/AVIF.', live: true },
          { name: 'Color Palette', desc: 'Generator harmonijnych palet, HEX/RGB/HSL, WCAG.', live: false },
        ]}
      />
      <BCategory
        n="03"
        cat="Dokumenty"
        en="Documents"
        tools={[
          { name: 'PDF Tools', desc: 'Łącz, dziel, kompresuj, konwertuj obrazki na PDF.', live: true },
          { name: 'HTML to PDF', desc: 'Kod HTML lub URL strony → gotowy PDF.', live: true },
          { name: 'Email Signature', desc: 'Graficzny kreator stopek, eksport HTML do Outlook/Gmail.', live: true },
        ]}
      />
      <BCategory
        n="04"
        cat="SEO"
        en="Search"
        tools={[
          { name: 'SEO & GEO Generator', desc: 'Meta + OG + Twitter + Schema.org + llms.txt + robots.txt.', live: true },
        ]}
      />
      <BMission />
      <BFooter />
    </div>
  );
};

const BNav = () => (
  <header style={bStyles.nav}>
    <div style={bStyles.navBrand}>
      <div style={bStyles.navMark}>F/AI</div>
    </div>
    <div style={bStyles.navMid}>
      <span style={bStyles.navStatus}>● operacyjne · 9 toolów · v2.6</span>
    </div>
    <nav style={bStyles.navLinks}>
      <span style={bStyles.navLink}>tools</span>
      <span style={bStyles.navLink}>journal</span>
      <span style={bStyles.navLink}>about</span>
      <span style={bStyles.navLink}>en</span>
    </nav>
  </header>
);

const BHero = () => (
  <section style={bStyles.hero}>
    <div style={bStyles.heroLeft}>
      <div style={bStyles.heroLabel}>FORMATTEDAI / 2026 / WARSZAWA</div>
      <h1 style={bStyles.heroTitle}>
        Narzędzia<br />
        bez serwera.<br />
        <span style={bStyles.heroAccent}>Bez kompromisów.</span>
      </h1>
      <p style={bStyles.heroBody}>
        Dziewięć narzędzi do codziennej pracy z plikami, kodem i treścią —
        każde działa wyłącznie w Twojej przeglądarce. Twoje dane nigdy
        nie wychodzą poza urządzenie.
      </p>
      <div style={bStyles.heroCtas}>
        <a style={bStyles.heroCtaPrimary}>Otwórz narzędzia ↓</a>
        <a style={bStyles.heroCtaGhost}>Jak to działa</a>
      </div>
    </div>
    <div style={bStyles.heroRight}>
      <div style={bStyles.heroMeta}>
        <BMeta k="LAT" v="0 ms / serwer" />
        <BMeta k="UPLOAD" v="brak" />
        <BMeta k="ACCOUNTS" v="brak" />
        <BMeta k="COOKIES" v="brak" />
        <BMeta k="LICENSE" v="MIT / open" />
        <BMeta k="STACK" v="WASM + JS" />
      </div>
      <div style={bStyles.heroVisual}>
        <div style={bStyles.heroVisualInner}>
          <div style={bStyles.heroVisualLabel}>[ visual: glyph / wireframe ]</div>
        </div>
      </div>
    </div>
  </section>
);

const BMeta = ({ k, v }) => (
  <div style={bStyles.meta}>
    <div style={bStyles.metaK}>{k}</div>
    <div style={bStyles.metaV}>{v}</div>
  </div>
);

const BIndex = () => (
  <section style={bStyles.index}>
    <div style={bStyles.indexHead}>
      <span style={bStyles.indexNum}>02</span>
      <span style={bStyles.indexLabel}>SPIS / NARZĘDZIA</span>
      <span style={bStyles.indexCount}>09 aktywnych · 02 w przygotowaniu</span>
    </div>
    <div style={bStyles.indexGrid}>
      <BIndexItem n="01" cat="Tekst" count="04" tools="Markdown · JS · CSS · JSON" />
      <BIndexItem n="02" cat="Obrazy" count="03" tools="AVIF · HEIC · Color" />
      <BIndexItem n="03" cat="Dokumenty" count="03" tools="PDF · HTML→PDF · Email" />
      <BIndexItem n="04" cat="SEO" count="01" tools="SEO & GEO Generator" />
    </div>
  </section>
);

const BIndexItem = ({ n, cat, count, tools }) => (
  <div style={bStyles.indexItem}>
    <div style={bStyles.indexItemTop}>
      <span style={bStyles.indexItemNum}>/{n}/</span>
      <span style={bStyles.indexItemCount}>{count}</span>
    </div>
    <div style={bStyles.indexItemCat}>{cat}</div>
    <div style={bStyles.indexItemTools}>{tools}</div>
  </div>
);

const BCategory = ({ n, cat, en, tools }) => (
  <section style={bStyles.cat}>
    <header style={bStyles.catHead}>
      <div style={bStyles.catN}>/{n}/</div>
      <h2 style={bStyles.catTitle}>{cat}</h2>
      <div style={bStyles.catEn}>{en}</div>
    </header>
    <div style={bStyles.catRows}>
      {tools.map((t, i) => (
        <div key={i} style={bStyles.catRow}>
          <div style={bStyles.catRowIdx}>{String(i + 1).padStart(2, '0')}</div>
          <div style={bStyles.catRowMain}>
            <div style={bStyles.catRowName}>{t.name}</div>
            <div style={bStyles.catRowDesc}>{t.desc}</div>
          </div>
          <div style={t.live ? bStyles.catRowStatus : bStyles.catRowStatusSoon}>
            {t.live ? '● dostępne' : '○ wkrótce'}
          </div>
          <div style={bStyles.catRowArrow}>→</div>
        </div>
      ))}
    </div>
  </section>
);

const BMission = () => (
  <section style={bStyles.mission}>
    <div style={bStyles.missionLabel}>/05/ MISJA</div>
    <h2 style={bStyles.missionTitle}>
      Browser-first to nie ograniczenie.<br />
      <span style={bStyles.heroAccent}>To wybór architektoniczny.</span>
    </h2>
    <div style={bStyles.missionCols}>
      <div style={bStyles.missionCol}>
        <div style={bStyles.missionColLabel}>01 — DLACZEGO</div>
        <p style={bStyles.missionColBody}>
          Każde uploadowane Ci dziś narzędzie online to potencjalny lek danych.
          Pliki, dokumenty, zdjęcia — wszystko ląduje na cudzych dyskach.
        </p>
      </div>
      <div style={bStyles.missionCol}>
        <div style={bStyles.missionColLabel}>02 — JAK</div>
        <p style={bStyles.missionColBody}>
          WebAssembly i nowoczesne API przeglądarki pozwalają zrobić w lokalnie
          to, co kiedyś wymagało serwera. Bez kompromisu w jakości.
        </p>
      </div>
      <div style={bStyles.missionCol}>
        <div style={bStyles.missionColLabel}>03 — CO</div>
        <p style={bStyles.missionColBody}>
          Dziewięć narzędzi, jeden manifest. Otwarty kod. Brak telemetrii.
          Brak cookies. Brak plotek o Tobie u trzecich stron.
        </p>
      </div>
    </div>
  </section>
);

const BFooter = () => (
  <footer style={bStyles.footer}>
    <div style={bStyles.footerTop}>
      <div style={bStyles.footerLogo}>F/AI</div>
      <div style={bStyles.footerYear}>MMXXVI</div>
    </div>
    <div style={bStyles.footerCols}>
      <div style={bStyles.footerCol}>
        <div style={bStyles.footerColLabel}>NARZĘDZIA</div>
        <a style={bStyles.footerLink}>Tekst</a>
        <a style={bStyles.footerLink}>Obrazy</a>
        <a style={bStyles.footerLink}>Dokumenty</a>
        <a style={bStyles.footerLink}>SEO</a>
      </div>
      <div style={bStyles.footerCol}>
        <div style={bStyles.footerColLabel}>TREŚĆ</div>
        <a style={bStyles.footerLink}>Journal</a>
        <a style={bStyles.footerLink}>About</a>
        <a style={bStyles.footerLink}>RSS</a>
      </div>
      <div style={bStyles.footerCol}>
        <div style={bStyles.footerColLabel}>KOD</div>
        <a style={bStyles.footerLink}>GitHub</a>
        <a style={bStyles.footerLink}>License</a>
      </div>
      <div style={bStyles.footerCol}>
        <div style={bStyles.footerColLabel}>JĘZYK</div>
        <a style={bStyles.footerLink}>PL</a>
        <a style={bStyles.footerLink}>EN</a>
      </div>
    </div>
    <div style={bStyles.footerBottom}>
      <span>(c) Adam Szczotka</span>
      <span>zero data on server · zero cookies · open source</span>
    </div>
  </footer>
);

const bStyles = {
  root: {
    width: '100%',
    background: '#0a0a0e',
    color: '#e8e8eb',
    fontFamily: '"Space Grotesk", sans-serif',
  },
  nav: {
    display: 'grid', gridTemplateColumns: '160px 1fr auto', alignItems: 'center',
    padding: '24px 48px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    fontFamily: '"JetBrains Mono", monospace',
  },
  navBrand: {},
  navMark: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em',
  },
  navMid: { textAlign: 'center' },
  navStatus: {
    fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.1em',
  },
  navLinks: { display: 'flex', gap: 24 },
  navLink: {
    fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,.7)', cursor: 'pointer',
  },
  hero: {
    display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 80,
    padding: '120px 48px 100px',
    minHeight: 760,
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  heroLeft: { paddingTop: 40 },
  heroLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, letterSpacing: '0.18em', color: '#7c6cf0',
    marginBottom: 56,
  },
  heroTitle: {
    fontSize: 124, lineHeight: 0.92, fontWeight: 500,
    letterSpacing: '-0.04em',
    margin: '0 0 56px',
  },
  heroAccent: { color: '#a78bfa' },
  heroBody: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 19, lineHeight: 1.55,
    color: 'rgba(255,255,255,.7)', maxWidth: 540,
    marginBottom: 40,
  },
  heroCtas: { display: 'flex', gap: 16 },
  heroCtaPrimary: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
    background: '#fff', color: '#000',
    padding: '18px 28px', cursor: 'pointer', fontWeight: 600,
  },
  heroCtaGhost: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase',
    border: '1px solid rgba(255,255,255,.2)',
    padding: '18px 28px', cursor: 'pointer',
    color: 'rgba(255,255,255,.85)',
  },
  heroRight: { display: 'flex', flexDirection: 'column', gap: 32 },
  heroMeta: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    border: '1px solid rgba(255,255,255,.1)',
  },
  meta: {
    padding: '20px 24px',
    borderRight: '1px solid rgba(255,255,255,.08)',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  metaK: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 10, letterSpacing: '0.15em', color: 'rgba(255,255,255,.4)',
    marginBottom: 6,
  },
  metaV: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 14, color: '#a78bfa',
  },
  heroVisual: {
    flex: 1, minHeight: 240,
    background: 'repeating-linear-gradient(45deg, #11111a 0 16px, #0e0e16 16px 32px)',
    border: '1px solid rgba(255,255,255,.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  heroVisualInner: {},
  heroVisualLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: '0.15em',
  },
  index: {
    padding: '80px 48px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  indexHead: {
    display: 'grid', gridTemplateColumns: '60px 1fr auto',
    gap: 32, alignItems: 'baseline',
    paddingBottom: 40,
    borderBottom: '1px solid rgba(255,255,255,.08)',
    marginBottom: 0,
  },
  indexNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, color: '#7c6cf0', letterSpacing: '0.12em',
  },
  indexLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase',
  },
  indexCount: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.1em',
  },
  indexGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
  },
  indexItem: {
    padding: '40px 32px',
    borderRight: '1px solid rgba(255,255,255,.08)',
    minHeight: 200, display: 'flex', flexDirection: 'column',
  },
  indexItemTop: {
    display: 'flex', justifyContent: 'space-between',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, letterSpacing: '0.15em',
    color: 'rgba(255,255,255,.4)', marginBottom: 32,
  },
  indexItemNum: { color: '#7c6cf0' },
  indexItemCount: {},
  indexItemCat: {
    fontSize: 40, fontWeight: 500, letterSpacing: '-0.02em',
    marginBottom: 12,
  },
  indexItemTools: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6,
  },
  cat: {
    padding: '120px 48px 80px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  catHead: {
    display: 'grid', gridTemplateColumns: '120px 1fr auto',
    gap: 40, alignItems: 'end',
    marginBottom: 56,
  },
  catN: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, color: '#7c6cf0', letterSpacing: '0.12em',
    paddingBottom: 16,
  },
  catTitle: {
    fontSize: 144, lineHeight: 0.9, fontWeight: 500,
    letterSpacing: '-0.04em', margin: 0,
  },
  catEn: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,.4)', paddingBottom: 16,
  },
  catRows: {},
  catRow: {
    display: 'grid', gridTemplateColumns: '60px 1fr 140px 30px',
    gap: 32, alignItems: 'center',
    padding: '32px 0',
    borderTop: '1px solid rgba(255,255,255,.08)',
    cursor: 'pointer',
  },
  catRowIdx: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 13, color: 'rgba(255,255,255,.4)',
  },
  catRowMain: {},
  catRowName: {
    fontSize: 30, fontWeight: 500, letterSpacing: '-0.02em',
    marginBottom: 4,
  },
  catRowDesc: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 15, color: 'rgba(255,255,255,.55)',
    lineHeight: 1.5, maxWidth: 600,
  },
  catRowStatus: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: '#22c55e', letterSpacing: '0.1em',
  },
  catRowStatusSoon: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.3)', letterSpacing: '0.1em',
  },
  catRowArrow: { fontSize: 20, color: 'rgba(255,255,255,.3)' },
  mission: {
    padding: '140px 48px 100px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  missionLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, color: '#7c6cf0', letterSpacing: '0.18em',
    marginBottom: 40,
  },
  missionTitle: {
    fontSize: 88, lineHeight: 1, fontWeight: 500,
    letterSpacing: '-0.03em', margin: '0 0 80px', maxWidth: 1200,
  },
  missionCols: {
    display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 64,
    paddingTop: 40,
    borderTop: '1px solid rgba(255,255,255,.08)',
  },
  missionCol: {},
  missionColLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: '#7c6cf0', letterSpacing: '0.15em',
    marginBottom: 16,
  },
  missionColBody: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 16, lineHeight: 1.6,
    color: 'rgba(255,255,255,.7)', margin: 0,
  },
  footer: { padding: '80px 48px 40px' },
  footerTop: {
    display: 'flex', justifyContent: 'space-between',
    paddingBottom: 64,
    borderBottom: '1px solid rgba(255,255,255,.08)',
    marginBottom: 64,
  },
  footerLogo: { fontSize: 64, fontWeight: 600, letterSpacing: '-0.04em' },
  footerYear: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 14, color: 'rgba(255,255,255,.5)', letterSpacing: '0.2em',
  },
  footerCols: {
    display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 48,
    marginBottom: 64,
  },
  footerCol: {},
  footerColLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: '#7c6cf0', letterSpacing: '0.15em',
    marginBottom: 16,
  },
  footerLink: {
    display: 'block', padding: '6px 0',
    fontSize: 14, color: 'rgba(255,255,255,.7)', cursor: 'pointer',
  },
  footerBottom: {
    display: 'flex', justifyContent: 'space-between',
    paddingTop: 24,
    borderTop: '1px solid rgba(255,255,255,.08)',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.1em',
  },
};

window.HomeB = HomeB;
