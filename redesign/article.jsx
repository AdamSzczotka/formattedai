// Article — single article, hybrid: cinematic hero + readable column + sticky ToC
const { useState, useEffect, useRef } = React;

const ART = {
  slug: 'chatgpt-formatowanie-google-docs',
  category: 'Tekst',
  tag: 'Markdown',
  date: '12 kwietnia 2026',
  read: '6 min',
  words: 1247,
  title: 'ChatGPT i formatowanie w Google Docs',
  subtitle: 'Dlaczego markdown z AI psuje się w Word i Docs — i jak to naprawić w jednym kliknięciu, bez wysyłania dokumentu na zewnętrzny serwer.',
  toc: [
    { id: 'problem', label: 'Problem' },
    { id: 'dlaczego', label: 'Dlaczego markdown nie działa' },
    { id: 'rozwiazania', label: 'Trzy rozwiązania' },
    { id: 'browser', label: 'Dlaczego w przeglądarce' },
    { id: 'praktyka', label: 'Workflow w praktyce' },
    { id: 'edge', label: 'Przypadki brzegowe' },
    { id: 'podsumowanie', label: 'Podsumowanie' },
  ],
};

const RELATED = [
  { slug: 'geo-optymalizacja-pod-ai', title: 'GEO — optymalizacja pod AI wyszukiwarki', tag: 'SEO', read: '8 min' },
  { slug: 'optymalizacja-zdjec-avif', title: 'Optymalizacja zdjęć w formacie AVIF', tag: 'Obrazy', read: '5 min' },
];

function Article() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState('problem');
  const articleRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const el = articleRef.current;
      if (el) {
        const start = el.offsetTop;
        const end = start + el.offsetHeight - window.innerHeight;
        const p = Math.max(0, Math.min(1, (window.scrollY - start + 200) / (end - start)));
        setProgress(p);
      }
      // ToC active section
      const sections = ART.toc.map(t => document.getElementById(t.id)).filter(Boolean);
      const y = window.scrollY + 160;
      let cur = sections[0]?.id;
      for (const s of sections) if (s.offsetTop <= y) cur = s.id;
      if (cur) setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={S.page}>
      <Nav scrolled={scrolled} progress={progress} />
      <Hero />
      <main ref={articleRef} style={S.main}>
        <ToC active={active} />
        <article style={S.article}>
          <Body />
          <Author />
          <Related />
        </article>
        <Aside />
      </main>
      <Footer />
    </div>
  );
}

// — Nav —
function Nav({ scrolled, progress }) {
  return (
    <nav style={{...S.nav, ...(scrolled ? S.navScroll : {})}}>
      <div style={S.navInner}>
        <FALogo size={22} />
        <div style={S.navLinks}>
          <a href="Tools.html" style={S.navLink}>Narzędzia</a>
          <a href="Articles.html" style={{...S.navLink, color: '#fff'}}>Dziennik</a>
          <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={S.navLink}>Autor ↗</a>
        </div>
      </div>
      <div style={S.progBar}>
        <div style={{...S.progFill, width: `${progress * 100}%`}}></div>
      </div>
    </nav>
  );
}

// — Hero —
function Hero() {
  return (
    <header style={S.hero}>
      <div style={S.heroBg}></div>
      <div style={S.heroNoise}></div>
      <div style={S.heroInner}>
        <a href="Articles.html" style={S.crumb}>← Dziennik</a>
        <div style={S.heroMeta}>
          <span style={S.heroTag}>{ART.tag}</span>
          <span style={S.dot}>·</span>
          <span>{ART.date}</span>
          <span style={S.dot}>·</span>
          <span>{ART.read} czytania</span>
          <span style={S.dot}>·</span>
          <span>{ART.words} słów</span>
        </div>
        <h1 style={S.heroTitle}>{ART.title}</h1>
        <p style={S.heroSub}>{ART.subtitle}</p>
        <div style={S.heroFoot}>
          <div style={S.heroAuthor}>
            <span style={S.heroAvatar}>AS</span>
            <div>
              <div style={S.heroAuthorName}>Adam Szczotka</div>
              <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={S.heroAuthorLink}>adamszczotka.dev ↗</a>
            </div>
          </div>
          <div style={S.heroActions}>
            <button style={S.heroBtn} onClick={() => navigator.clipboard?.writeText(window.location.href)}>Skopiuj link</button>
            <a href="/formatter/" style={{...S.heroBtn, ...S.heroBtnPrimary}}>Otwórz formatter →</a>
          </div>
        </div>
      </div>
    </header>
  );
}

// — Sticky ToC —
function ToC({ active }) {
  return (
    <aside style={S.toc}>
      <div style={S.tocSticky}>
        <div style={S.tocLabel}>/ SPIS TREŚCI</div>
        <ul style={S.tocList}>
          {ART.toc.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`}
                 style={{...S.tocLink, ...(active === t.id ? S.tocLinkActive : {})}}>
                <span style={S.tocNum}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div style={S.tocFoot}>
          <button style={S.tocTopBtn} onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>↑ Na górę</button>
        </div>
      </div>
    </aside>
  );
}

// — Body —
function Body() {
  return (
    <div style={S.prose}>
      <p style={S.lede}>
        Każdy, kto pracuje z ChatGPT lub Claude, zna ten ból. Kopiujesz odpowiedź,
        wklejasz do Worda — i widzisz <code>#&nbsp;nagłówek</code>, <code>**pogrubienie**</code>,
        a tabele rozjeżdżają się po stronie. Pół godziny formatowania ręcznie. Każdego dnia.
      </p>

      <h2 id="problem" style={S.h2}>Problem</h2>
      <p>
        Modele językowe odpowiadają w Markdown, bo to ich natywny format. Markdown jest świetny
        w terminalu, w GitHubie, w Obsidianie. <strong>Word i Google Docs go nie rozumieją.</strong>
        Skutek: znaki sterujące zostają w tekście jako zwykłe znaki, struktura znika, a ty
        zamiast pisać — sprzątasz.
      </p>

      <Pull>
        Markdown to szyfr, którego Twój dokument tekstowy nie umie odczytać.
      </Pull>

      <h2 id="dlaczego" style={S.h2}>Dlaczego markdown nie działa w Word/Docs</h2>
      <p>
        Word, Google Docs i Pages używają WYSIWYG. Akapit z gwiazdkami to dla nich akapit
        z gwiazdkami — nie semantyka. Nawet "Wklej bez formatowania" nic tu nie zmieni:
        problem nie jest w stylach, tylko w <em>znakach</em>.
      </p>
      <ol style={S.list}>
        <li>Hashe <code>#</code> przed nagłówkami zostają w tekście.</li>
        <li>Gwiazdki <code>**</code> wokół ważnych fragmentów stają się dekoracją.</li>
        <li>Tabele rozpadają się na linie z pionowymi kreskami.</li>
        <li>Bloki kodu tracą wcięcia i podświetlenie.</li>
      </ol>

      <h2 id="rozwiazania" style={S.h2}>Trzy rozwiązania, które działają</h2>
      <p>
        Sprawdziłem siedem narzędzi z pierwszej strony Google'a. Większość była albo
        za wolna, albo prosiła o login, albo wysyłała tekst na obcy serwer. Trzy zostały:
      </p>

      <Compare>
        <CompareCol bad title="Wklejanie ręczne">
          <li>15–30 minut na artykuł 1500 słów</li>
          <li>Pomyłki przy zagnieżdżonych listach</li>
          <li>Tabele i tak trzeba przebudować</li>
        </CompareCol>
        <CompareCol title="Konwerter online (większość)">
          <li>Szybkie, ale tekst leci na serwer</li>
          <li>Limity, captcha, reklamy</li>
          <li>Brak kontroli nad stylami</li>
        </CompareCol>
        <CompareCol good title="Konwerter w przeglądarce">
          <li><strong>0 sekund</strong> — działa lokalnie</li>
          <li>Tekst nigdy nie opuszcza Twojego komputera</li>
          <li>Działa offline po pierwszej wizycie</li>
        </CompareCol>
      </Compare>

      <h2 id="browser" style={S.h2}>Dlaczego w przeglądarce</h2>
      <p>
        FormattedAI używa <code>marked.js</code> i <code>turndown.js</code> w samej przeglądarce.
        To znaczy: kiedy wklejasz tekst, wszystko dzieje się <strong>na Twoim komputerze</strong>.
        Brak żądania sieciowego, brak loga w bazie, brak ryzyka wycieku draftu wewnętrznego.
      </p>
      <CodeBlock>
{`# Markdown                          → ChatGPT
**Tytuł sekcji**                    → "Tytuł sekcji" (bold)
- punkt 1                           → • punkt 1 (lista)
| kolumna | dane |                  → tabela 2×n`}
      </CodeBlock>
      <p>
        Po prawej widzisz, jak każdy fragment trafia do dokumentu po konwersji.
        Sygnatura czasowa konwersji: <strong>4–12&nbsp;ms</strong> dla artykułu 2000 słów.
      </p>

      <h2 id="praktyka" style={S.h2}>Workflow w praktyce</h2>
      <ol style={S.list}>
        <li>Dostajesz odpowiedź z ChatGPT/Claude.</li>
        <li>Kopiujesz w całości (<kbd>⌘A</kbd>, <kbd>⌘C</kbd>).</li>
        <li>Wklejasz do <a href="/formatter/" style={S.link}>formattedai.dev/formatter</a>.</li>
        <li>Wybierasz format docelowy: Word, Docs, HTML, plain.</li>
        <li>Klikasz "Skopiuj sformatowane" — wklejasz do dokumentu.</li>
      </ol>
      <p>Cały proces: 6 sekund. Bez kont, bez limitów, bez serwera.</p>

      <Pull>
        Najlepsze narzędzie to takie, które przestajesz zauważać.
      </Pull>

      <h2 id="edge" style={S.h2}>Przypadki brzegowe, które warto znać</h2>
      <p>
        <strong>Mermaid i diagramy</strong> — nie konwertują się 1:1. Markdown z diagramem
        zostawia kod, bo Word nie ma renderera. Sugerowane: zrzut ekranu z Mermaid Live.
      </p>
      <p>
        <strong>Math (LaTeX)</strong> — Word obsługuje OMML, ale konwersja MathJax → OMML
        jest stratna. Dla wzorów: skopiuj jako obraz albo użyj Word Equation Editor.
      </p>
      <p>
        <strong>Bardzo długie tabele</strong> — powyżej 50 wierszy lepiej importować jako CSV
        (wbudowane w narzędziu, zakładka "Tabele").
      </p>

      <h2 id="podsumowanie" style={S.h2}>Podsumowanie</h2>
      <p>
        Markdown z AI psuje się w Word/Docs, bo to dwa różne języki. Można konwertować
        ręcznie (drogo), online (ryzyko), albo lokalnie (najlepiej).
        Cała filozofia FormattedAI to ten ostatni wybór, podniesiony do rangi reguły:
        <strong> Twój tekst nie wychodzi z Twojej przeglądarki.</strong>
      </p>
      <p style={S.cta}>
        Wklej draft i zobacz różnicę: <a href="/formatter/" style={S.linkBig}>otwórz Markdown Formatter →</a>
      </p>
    </div>
  );
}

// — Pull quote —
const Pull = ({ children }) => (
  <blockquote style={S.pull}>
    <span style={S.pullMark}>"</span>
    <p style={S.pullText}>{children}</p>
  </blockquote>
);

// — Compare grid —
const Compare = ({ children }) => <div style={S.compare}>{children}</div>;
const CompareCol = ({ title, children, bad, good }) => (
  <div style={{...S.compareCol, ...(bad ? S.compareBad : {}), ...(good ? S.compareGood : {})}}>
    <div style={S.compareHead}>
      <span style={{...S.compareIcon, ...(bad ? {color: '#ff6b6b'} : good ? {color: '#22c55e'} : {color: 'rgba(255,255,255,.4)'})}}>
        {bad ? '✕' : good ? '✓' : '○'}
      </span>
      <span style={S.compareTitle}>{title}</span>
    </div>
    <ul style={S.compareList}>{children}</ul>
  </div>
);

// — Code block —
const CodeBlock = ({ children }) => (
  <pre style={S.code}>
    <div style={S.codeHead}>
      <span style={S.codeDot}></span>
      <span style={{...S.codeDot, background: '#ffbd2e'}}></span>
      <span style={{...S.codeDot, background: '#27c93f'}}></span>
      <span style={S.codeLang}>before → after</span>
    </div>
    <code style={S.codeText}>{children}</code>
  </pre>
);

// — Author block —
function Author() {
  return (
    <section style={S.author}>
      <div style={S.authorAv}>AS</div>
      <div style={S.authorBody}>
        <div style={S.authorName}>Adam Szczotka</div>
        <p style={S.authorBio}>
          Buduję narzędzia, które robią jedną rzecz i robią ją dobrze. Bez serwerów, bez kont,
          bez wysyłania Twoich danych nigdzie. Pełna lista projektów na
          {' '}<a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={S.link}>adamszczotka.dev</a>.
        </p>
        <div style={S.authorLinks}>
          <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={S.authorLink}>Strona ↗</a>
          <a href="https://github.com/adamszczotka" target="_blank" rel="noopener" style={S.authorLink}>GitHub ↗</a>
          <a href="/rss.xml" style={S.authorLink}>RSS</a>
        </div>
      </div>
    </section>
  );
}

// — Related —
function Related() {
  return (
    <section style={S.rel}>
      <div style={S.relLabel}>/ CZYTAJ DALEJ</div>
      <div style={S.relGrid}>
        {RELATED.map(r => (
          <a key={r.slug} href={`Article.html?slug=${r.slug}`} style={S.relCard}>
            <div style={S.relMeta}>
              <span style={S.relTag}>{r.tag}</span>
              <span style={S.dot}>·</span>
              <span>{r.read}</span>
            </div>
            <h3 style={S.relTitle}>{r.title}</h3>
            <span style={S.relCta}>Czytaj →</span>
          </a>
        ))}
      </div>
    </section>
  );
}

// — Aside (right column extras) —
function Aside() {
  return (
    <aside style={S.aside}>
      <div style={S.asideSticky}>
        <div style={S.asideCard}>
          <div style={S.asideLabel}>/ NARZĘDZIE OPISYWANE</div>
          <div style={S.asideTool}>
            <div style={S.asideToolHead}>
              <span style={S.asideToolIcon}>M↓</span>
              <div>
                <div style={S.asideToolName}>Markdown Formatter</div>
                <div style={S.asideToolMeta}>Tekst · darmowe · w przeglądarce</div>
              </div>
            </div>
            <a href="/formatter/" style={S.asideToolBtn}>Otwórz →</a>
          </div>
        </div>
        <div style={S.asideCard}>
          <div style={S.asideLabel}>/ PODZIEL SIĘ</div>
          <div style={S.asideShares}>
            <a href="#" style={S.asideShare}>Twitter / X</a>
            <a href="#" style={S.asideShare}>LinkedIn</a>
            <a href="#" style={S.asideShare}>Hacker News</a>
            <button style={S.asideShare} onClick={() => navigator.clipboard?.writeText(window.location.href)}>Kopiuj link</button>
          </div>
        </div>
      </div>
    </aside>
  );
}

// — Footer —
function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.footInner}>
        <div style={S.footLeft}>
          <div style={{marginBottom: 16}}><FALogo size={20} /></div>
          <p style={S.footText}>
            Narzędzia, które działają w Twojej przeglądarce. Bez kont, bez serwera, bez śledzenia.
          </p>
          <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={S.footLink}>
            adamszczotka.dev ↗
          </a>
        </div>
        <div style={S.footCols}>
          <div>
            <div style={S.footColLabel}>Strona</div>
            <a href="Home.html" style={S.footColLink}>Strona główna</a>
            <a href="Tools.html" style={S.footColLink}>Narzędzia</a>
            <a href="Articles.html" style={S.footColLink}>Dziennik</a>
          </div>
          <div>
            <div style={S.footColLabel}>Sieć</div>
            <a href="/rss.xml" style={S.footColLink}>RSS</a>
            <a href="/llms.txt" style={S.footColLink}>llms.txt</a>
            <a href="https://github.com/adamszczotka" style={S.footColLink}>GitHub ↗</a>
          </div>
        </div>
      </div>
      <div style={S.footBottom}>
        <span>© 2026 FormattedAI · Adam Szczotka</span>
        <span>Made in Kraków · żadnych ciasteczek</span>
      </div>
    </footer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const S = {
  page: { background: '#08080c', color: '#f0f0f4', fontFamily: '"Inter", -apple-system, sans-serif', minHeight: '100vh' },

  // Nav
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, transition: 'all .3s', borderBottom: '1px solid transparent' },
  navScroll: { background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(16px)', borderBottomColor: 'rgba(255,255,255,.06)' },
  navInner: { maxWidth: 1440, margin: '0 auto', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' },
  logoMark: { fontFamily: '"Fraunces", serif', fontSize: 22, color: '#a78bfa' },
  logoText: { fontWeight: 600, letterSpacing: '-0.01em' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 32 },
  navLink: { fontSize: 14, color: 'rgba(255,255,255,.6)', textDecoration: 'none', transition: 'color .2s' },
  progBar: { height: 2, background: 'rgba(255,255,255,.04)' },
  progFill: { height: '100%', background: 'linear-gradient(90deg, #7c6cf0, #a78bfa)', transition: 'width .15s linear' },

  // Hero
  hero: { position: 'relative', padding: '180px 48px 100px', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,.06)' },
  heroBg: { position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(124,108,240,.18), transparent 60%), radial-gradient(ellipse 60% 60% at 20% 80%, rgba(167,139,250,.08), transparent 70%), #08080c'
  },
  heroNoise: { position: 'absolute', inset: 0, opacity: 0.4,
    backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,.015) 0 1px, transparent 1px 14px)'
  },
  heroInner: { position: 'relative', maxWidth: 1100, margin: '0 auto' },
  crumb: { display: 'inline-block', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(167,139,250,.8)', textDecoration: 'none', marginBottom: 56, letterSpacing: '0.06em' },
  heroMeta: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.55)', letterSpacing: '0.04em', marginBottom: 32 },
  heroTag: { padding: '6px 12px', background: 'rgba(124,108,240,.15)', border: '1px solid rgba(167,139,250,.3)', borderRadius: 99, color: '#a78bfa', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' },
  dot: { color: 'rgba(255,255,255,.25)' },
  heroTitle: { fontFamily: '"Fraunces", "Space Grotesk", serif', fontSize: 88, lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.035em', margin: '0 0 28px', maxWidth: 1000 },
  heroSub: { fontSize: 22, lineHeight: 1.5, color: 'rgba(255,255,255,.72)', maxWidth: 760, margin: '0 0 56px', fontWeight: 300 },
  heroFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,.08)' },
  heroAuthor: { display: 'flex', alignItems: 'center', gap: 14 },
  heroAvatar: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14, letterSpacing: '0.05em' },
  heroAuthorName: { fontSize: 14, fontWeight: 500, marginBottom: 2 },
  heroAuthorLink: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(167,139,250,.7)', textDecoration: 'none' },
  heroActions: { display: 'flex', gap: 10 },
  heroBtn: { padding: '10px 18px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 99, color: '#f0f0f4', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block' },
  heroBtnPrimary: { background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', borderColor: 'transparent', color: '#fff', fontWeight: 500 },

  // Layout
  main: { display: 'grid', gridTemplateColumns: '240px minmax(0,1fr) 240px', gap: 64, maxWidth: 1440, margin: '0 auto', padding: '80px 48px 120px', alignItems: 'flex-start' },

  // ToC
  toc: { position: 'relative' },
  tocSticky: { position: 'sticky', top: 100 },
  tocLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.18em', marginBottom: 20 },
  tocList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 },
  tocLink: { display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', borderLeft: '2px solid transparent', paddingLeft: 14, marginLeft: -14, transition: 'all .2s' },
  tocLinkActive: { color: '#fff', borderLeftColor: '#a78bfa' },
  tocNum: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(167,139,250,.6)' },
  tocFoot: { marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,.06)' },
  tocTopBtn: { background: 'none', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', padding: '8px 14px', borderRadius: 99, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },

  // Article
  article: { maxWidth: 720, margin: '0 auto', width: '100%' },

  // Prose
  prose: { fontSize: 18, lineHeight: 1.75, color: 'rgba(240,240,244,.88)' },
  lede: { fontSize: 22, lineHeight: 1.6, color: '#f0f0f4', marginBottom: 48, fontWeight: 300, paddingLeft: 16, borderLeft: '2px solid rgba(167,139,250,.4)' },
  h2: { fontFamily: '"Fraunces", serif', fontSize: 36, lineHeight: 1.22, fontWeight: 400, letterSpacing: '-0.02em', color: '#fff', margin: '64px 0 24px', scrollMarginTop: 100 },
  list: { paddingLeft: 24, lineHeight: 1.8, marginBottom: 24 },
  link: { color: '#a78bfa', textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(167,139,250,.4)' },
  linkBig: { color: '#a78bfa', textDecoration: 'none', borderBottom: '2px solid rgba(167,139,250,.4)', paddingBottom: 2 },
  cta: { marginTop: 56, fontSize: 20 },

  // Pull quote
  pull: { margin: '56px -40px', padding: '40px', borderLeft: 'none', position: 'relative', background: 'linear-gradient(135deg, rgba(124,108,240,.06), rgba(167,139,250,.02))', borderRadius: 12 },
  pullMark: { position: 'absolute', top: 0, left: 24, fontFamily: '"Fraunces", serif', fontSize: 96, lineHeight: 1, color: 'rgba(167,139,250,.3)' },
  pullText: { fontFamily: '"Fraunces", serif', fontSize: 32, lineHeight: 1.3, fontWeight: 400, fontStyle: 'italic', color: '#fff', margin: 0, paddingLeft: 56 },

  // Compare
  compare: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '40px -40px' },
  compareCol: { padding: 24, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 },
  compareBad: { borderColor: 'rgba(255,107,107,.15)' },
  compareGood: { borderColor: 'rgba(34,197,94,.2)', background: 'rgba(34,197,94,.03)' },
  compareHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,.06)' },
  compareIcon: { fontSize: 16, fontWeight: 600 },
  compareTitle: { fontSize: 13, fontWeight: 500, color: '#fff' },
  compareList: { listStyle: 'none', padding: 0, margin: 0, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,.7)', display: 'flex', flexDirection: 'column', gap: 8 },

  // Code
  code: { margin: '32px 0', background: '#0c0c14', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, overflow: 'hidden' },
  codeHead: { display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.02)' },
  codeDot: { width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' },
  codeLang: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', marginLeft: 12, letterSpacing: '0.06em' },
  codeText: { display: 'block', padding: 20, fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.7, color: '#f0f0f4', whiteSpace: 'pre' },

  // Author
  author: { display: 'flex', gap: 20, padding: '40px 0', margin: '80px 0 0', borderTop: '1px solid rgba(255,255,255,.08)', borderBottom: '1px solid rgba(255,255,255,.08)' },
  authorAv: { flexShrink: 0, width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, letterSpacing: '0.05em' },
  authorBody: { flex: 1 },
  authorName: { fontSize: 18, fontWeight: 600, marginBottom: 6, color: '#fff' },
  authorBio: { fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,.65)', marginBottom: 14 },
  authorLinks: { display: 'flex', gap: 16, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  authorLink: { color: 'rgba(167,139,250,.7)', textDecoration: 'none' },

  // Related
  rel: { marginTop: 64 },
  relLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.18em', marginBottom: 24 },
  relGrid: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 },
  relCard: { display: 'block', padding: 24, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, textDecoration: 'none', color: '#fff', transition: 'all .25s' },
  relMeta: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.04em', marginBottom: 12 },
  relTag: { color: '#a78bfa' },
  relTitle: { fontFamily: '"Fraunces", serif', fontSize: 22, lineHeight: 1.25, fontWeight: 400, letterSpacing: '-0.015em', margin: '0 0 16px' },
  relCta: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(167,139,250,.7)', letterSpacing: '0.06em' },

  // Aside
  aside: { position: 'relative' },
  asideSticky: { position: 'sticky', top: 100, display: 'flex', flexDirection: 'column', gap: 16 },
  asideCard: { padding: 20, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12 },
  asideLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.18em', marginBottom: 16 },
  asideTool: { display: 'flex', flexDirection: 'column', gap: 14 },
  asideToolHead: { display: 'flex', alignItems: 'center', gap: 12 },
  asideToolIcon: { width: 38, height: 38, borderRadius: 8, background: 'rgba(124,108,240,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#a78bfa' },
  asideToolName: { fontSize: 14, fontWeight: 500, marginBottom: 2 },
  asideToolMeta: { fontSize: 11, color: 'rgba(255,255,255,.5)' },
  asideToolBtn: { display: 'block', textAlign: 'center', padding: '10px', background: 'rgba(124,108,240,.12)', border: '1px solid rgba(167,139,250,.25)', borderRadius: 8, color: '#a78bfa', textDecoration: 'none', fontSize: 13, fontWeight: 500 },
  asideShares: { display: 'flex', flexDirection: 'column', gap: 6 },
  asideShare: { display: 'block', padding: '8px 0', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,.04)', color: 'rgba(255,255,255,.7)', fontSize: 13, textDecoration: 'none', cursor: 'pointer', fontFamily: 'inherit' },

  // Footer
  footer: { borderTop: '1px solid rgba(255,255,255,.06)', padding: '64px 48px 32px', background: '#06060a' },
  footInner: { maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 48, marginBottom: 48 },
  footLeft: { maxWidth: 360 },
  footMark: { fontFamily: '"Fraunces", serif', fontSize: 20, color: '#fff', marginBottom: 16 },
  footText: { fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,.55)', marginBottom: 16 },
  footLink: { fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: '#a78bfa', textDecoration: 'none' },
  footCols: { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 32 },
  footColLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '0.18em', marginBottom: 16 },
  footColLink: { display: 'block', fontSize: 13, color: 'rgba(255,255,255,.65)', textDecoration: 'none', padding: '4px 0' },
  footBottom: { maxWidth: 1440, margin: '0 auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.04)', display: 'flex', justifyContent: 'space-between', fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.35)', letterSpacing: '0.04em' },
};

ReactDOM.createRoot(document.getElementById('root')).render(<Article />);
