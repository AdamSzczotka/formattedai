// Tools section — 4 alternative layouts, side by side

const { useState } = React;

// Shared data
const T_TOOLS = [
  // Tekst
  { name: 'Markdown Formatter', cat: 'Tekst', icon: '✎', live: true, badge: 'najczęstsze', desc: 'Wklej z ChatGPT — skopiuj do Word/Docs.' },
  { name: 'JS Minifier', cat: 'Tekst', icon: '{ }', live: true, desc: 'Esbuild + Terser. Format / minify.' },
  { name: 'CSS Minifier', cat: 'Tekst', icon: '#', live: true, desc: 'CSSO. Source map, walidacja.' },
  { name: 'JSON Formatter', cat: 'Tekst', icon: '[ ]', live: false, desc: 'Drzewo, walidacja, search.' },
  // Obrazy
  { name: 'AVIF Converter', cat: 'Obrazy', icon: '◧', live: true, badge: 'WASM', desc: 'PNG/JPG → AVIF. Batch + ZIP.' },
  { name: 'HEIC Converter', cat: 'Obrazy', icon: '◐', live: true, desc: 'iPhone HEIC → JPG/PNG/AVIF.' },
  { name: 'OCR', cat: 'Obrazy', icon: 'A', live: true, desc: 'Tekst z obrazu, 100+ języków.' },
  { name: 'Color Palette', cat: 'Obrazy', icon: '◉', live: false, desc: 'Generator harmonijnych palet.' },
  // Dokumenty
  { name: 'PDF Tools', cat: 'Dokumenty', icon: '▤', live: true, badge: 'top 1', desc: 'Łącz, dziel, kompresuj, konwertuj.' },
  { name: 'HTML to PDF', cat: 'Dokumenty', icon: '⤓', live: true, desc: 'Kod lub URL → plik PDF.' },
  { name: 'Email Signature', cat: 'Dokumenty', icon: '✉', live: true, desc: 'Stopki HTML do Outlook/Gmail.' },
  // SEO
  { name: 'SEO & GEO Generator', cat: 'SEO', icon: '◎', live: true, badge: 'GEO', desc: 'Meta + OG + Schema + llms.txt.' },
];
const T_CATS = [
  { id: 'Tekst',     n: '01', en: 'Text',      accent: '#a78bfa' },
  { id: 'Obrazy',    n: '02', en: 'Images',    accent: '#7c6cf0' },
  { id: 'Dokumenty', n: '03', en: 'Documents', accent: '#9b8ff7' },
  { id: 'SEO',       n: '04', en: 'Search',    accent: '#6c5ce7' },
];

// Frame (scrollable artboard with dark home bg + nav)
const Frame = ({ children, navContent, scale = 1 }) => (
  <div style={{ width: '100%', height: '100%', background: '#08080c', color: '#f0f0f4', overflow: 'auto', position: 'relative' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 260px', alignItems: 'center', padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.95)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #a78bfa, #6c5ce7)', clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}></div>
        <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 15, fontWeight: 600 }}>Formatted<span style={{color:'#a78bfa'}}>AI</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>
        {navContent || <><span>Narzędzia</span><span>Dziennik</span><span>O projekcie</span></>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, fontSize: 12 }}>
        <span style={{ color: 'rgba(255,255,255,.6)' }}>EN</span>
        <span style={{ padding: '6px 12px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 6 }}>GitHub</span>
      </div>
    </div>
    {children}
  </div>
);

// Diff badge — quick callout
const Diff = ({ children, color = '#22c55e' }) => (
  <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, padding: '6px 12px', background: 'rgba(34,197,94,.12)', border: `1px solid ${color}55`, borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color, letterSpacing: '0.08em' }}>
    {children}
  </div>
);

// =================================================================
// A — Mega Grid (wszystko widoczne, pogrupowane)
// =================================================================
const VariantA = () => (
  <Frame>
    <Diff>★ wszystkie 12 widocznych od razu</Diff>
    <section style={{ padding: '64px 48px' }}>
      <header style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 16 }}>/ NARZĘDZIA · 10 / 12 AKTYWNYCH</div>
        <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', margin: 0 }}>Wszystko, w jednym widoku.</h2>
      </header>
      {T_CATS.map(c => {
        const list = T_TOOLS.filter(t => t.cat === c.id);
        return (
          <div key={c.id} style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: c.accent, letterSpacing: '0.1em' }}>{c.n} · {c.en}</span>
              <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em', margin: 0 }}>{c.id}</h3>
              <span style={{ flex: 1 }}></span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{list.filter(t=>t.live).length} / {list.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {list.map(t => <CardA key={t.name} t={t} accent={c.accent} />)}
            </div>
          </div>
        );
      })}
    </section>
  </Frame>
);

const CardA = ({ t, accent }) => (
  <div style={{ padding: 20, background: t.live ? '#0c0c14' : 'transparent', border: `1px solid ${t.live ? 'rgba(255,255,255,.08)' : 'rgba(255,255,255,.04)'}`, borderRadius: 12, opacity: t.live ? 1 : 0.5, position: 'relative' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: accent, fontFamily: '"JetBrains Mono", monospace' }}>{t.icon}</div>
      {t.badge && <span style={{ padding: '2px 7px', fontSize: 9, color: accent, border: `1px solid ${accent}44`, borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.badge}</span>}
      {!t.live && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.08em' }}>WKRÓTCE</span>}
    </div>
    <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 6 }}>{t.name}</div>
    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{t.desc}</div>
  </div>
);

// =================================================================
// B — Sticky Dock (mini ikony w nav + pełna lista poniżej)
// =================================================================
const VariantB = () => {
  const liveTools = T_TOOLS.filter(t => t.live);
  return (
    <Frame
      navContent={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(124,108,240,.08)', border: '1px solid rgba(124,108,240,.2)', borderRadius: 99 }}>
          {liveTools.slice(0, 6).map(t => (
            <span key={t.name} title={t.name} style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#a78bfa', fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer' }}>{t.icon}</span>
          ))}
          <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,.1)', margin: '0 4px' }}></span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', padding: '0 8px', fontFamily: '"JetBrains Mono", monospace' }}>⌘K</span>
        </div>
      }>
      <Diff>★ dock w nav · ⌘K · zawsze pod ręką</Diff>
      {/* Mini hero hint */}
      <div style={{ padding: '40px 48px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.1em' }}>↑ wszystkie narzędzia zawsze w pasku · skrót ⌘K</div>
      </div>
      <section style={{ padding: '64px 48px' }}>
        <header style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 12 }}>/ NARZĘDZIA · PEŁNA LISTA</div>
          <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 48, fontWeight: 500, letterSpacing: '-0.03em', margin: 0 }}>Dziesięć narzędzi.<br />Jeden manifest.</h2>
        </header>
        {/* Command-palette preview */}
        <div style={{ background: '#0c0c14', border: '1px solid rgba(124,108,240,.3)', borderRadius: 14, padding: 0, marginBottom: 40, boxShadow: '0 24px 80px rgba(0,0,0,.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <span style={{ color: 'rgba(255,255,255,.4)' }}>⌕</span>
            <input readOnly value="markdown" style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit' }} />
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', padding: '3px 8px', background: 'rgba(255,255,255,.05)', borderRadius: 4 }}>ESC</span>
          </div>
          <div style={{ padding: 8 }}>
            {liveTools.slice(0, 5).map((t, i) => (
              <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', borderRadius: 8, background: i === 0 ? 'rgba(124,108,240,.15)' : 'transparent' }}>
                <span style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(167,139,250,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#a78bfa', fontFamily: '"JetBrains Mono", monospace' }}>{t.icon}</span>
                <span style={{ fontSize: 14, fontWeight: i === 0 ? 500 : 400 }}>{t.name}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{t.desc}</span>
                <span style={{ flex: 1 }}></span>
                {i === 0 && <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '0.06em' }}>↵ otwórz</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Inline grouped list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32 }}>
          {T_CATS.map(c => (
            <div key={c.id}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: c.accent, letterSpacing: '0.1em' }}>{c.n}</span>
                <h3 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 18, fontWeight: 500, margin: 0 }}>{c.id}</h3>
              </div>
              {T_TOOLS.filter(t => t.cat === c.id).map(t => (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,.06)', opacity: t.live ? 1 : 0.45 }}>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', color: c.accent, fontSize: 12, width: 16 }}>{t.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{t.name}</span>
                  <span style={{ flex: 1 }}></span>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: t.live ? '#22c55e' : 'rgba(255,255,255,.3)' }}>{t.live ? '●' : '○'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </Frame>
  );
};

// =================================================================
// C — Hero z Tool Map (zamiast demo)
// =================================================================
const VariantC = () => (
  <Frame>
    <Diff>★ hero = mapa narzędzi (demo niżej)</Diff>
    <section style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 40, padding: '80px 48px 100px' }}>
      <div>
        <div style={{ display: 'inline-flex', gap: 8, padding: '6px 14px', border: '1px solid rgba(34,197,94,.25)', background: 'rgba(34,197,94,.08)', borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#22c55e', letterSpacing: '0.08em', marginBottom: 28 }}>● 100% client-side</div>
        <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 76, lineHeight: 0.96, fontWeight: 500, letterSpacing: '-0.035em', margin: '0 0 24px' }}>
          Dziesięć narzędzi.<br />
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Wybierz, czego dziś potrzebujesz.</span>
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,.7)', margin: '0 0 32px', maxWidth: 480 }}>
          Markdown, obrazy, PDF, SEO. Wszystko działa w przeglądarce — bez kont, bez uploadu, bez śledzenia.
        </p>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
          → kliknij narzędzie po prawej, żeby otworzyć
        </div>
      </div>
      {/* Tool map — 10 tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {T_TOOLS.filter(t => t.live).map(t => {
          const cat = T_CATS.find(c => c.id === t.cat);
          return (
            <div key={t.name} style={{ padding: 14, background: '#11111a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, cursor: 'pointer', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ width: 24, height: 24, borderRadius: 5, background: `${cat.accent}22`, color: cat.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>{t.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, fontFamily: '"Space Grotesk", sans-serif' }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.4, marginLeft: 34 }}>{t.desc}</div>
              <span style={{ position: 'absolute', top: 14, right: 12, fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '0.08em' }}>{cat.n}</span>
            </div>
          );
        })}
      </div>
    </section>
    {/* Demo niżej */}
    <section style={{ padding: '60px 48px', borderTop: '1px solid rgba(255,255,255,.08)', background: '#0c0c14' }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 16, textAlign: 'center' }}>/ ZOBACZ JAK DZIAŁA — MARKDOWN FORMATTER</div>
      <div style={{ maxWidth: 900, margin: '0 auto', height: 200, background: '#11111a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
        [ demo: markdown → docs · przełączane między 3 narzędziami ]
      </div>
    </section>
  </Frame>
);

// =================================================================
// D — Stylistic landing + dedykowana podstrona /tools/ z dockiem
// =================================================================
const VariantD = () => {
  const [view, setView] = useState('landing'); // 'landing' | 'tools'
  return (
    <Frame
      navContent={
        <>
          <span onClick={() => setView('landing')} style={{ cursor: 'pointer', color: view === 'landing' ? '#fff' : 'rgba(255,255,255,.7)', borderBottom: view === 'landing' ? '2px solid #a78bfa' : 'none', paddingBottom: 2 }}>Strona główna</span>
          <span onClick={() => setView('tools')} style={{ cursor: 'pointer', color: view === 'tools' ? '#fff' : 'rgba(255,255,255,.7)', borderBottom: view === 'tools' ? '2px solid #a78bfa' : 'none', paddingBottom: 2 }}>Narzędzia →</span>
          <span style={{ color: 'rgba(255,255,255,.7)' }}>Dziennik</span>
        </>
      }>
      <Diff color="#a78bfa">★ landing + osobna /tools/ · kliknij w nav</Diff>
      {view === 'landing' ? <DLanding go={() => setView('tools')} /> : <DTools />}
    </Frame>
  );
};

const DLanding = ({ go }) => (
  <section style={{ position: 'relative', padding: '100px 48px', minHeight: 760 }}>
    <div style={{ position: 'absolute', top: 100, right: 60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,108,240,.18), transparent 60%)', filter: 'blur(60px)' }}></div>
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
      <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.2em', marginBottom: 32 }}>FORMATTEDAI · 2026</div>
      <h1 style={{ fontFamily: '"Fraunces", serif', fontSize: 110, lineHeight: 0.95, fontWeight: 400, letterSpacing: '-0.04em', margin: '0 0 32px' }}>
        Narzędzia, które<br />
        <span style={{ fontStyle: 'italic', background: 'linear-gradient(135deg, #a78bfa, #6c5ce7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>nie widzą</span><br />
        Twoich danych.
      </h1>
      <p style={{ fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,.65)', maxWidth: 560, margin: '0 auto 48px' }}>
        Dziesięć narzędzi w jednym miejscu — markdown, obrazy, PDF, SEO. Wszystko lokalnie w przeglądarce.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 80 }}>
        <button onClick={go} style={{ padding: '18px 28px', background: '#7c6cf0', color: '#fff', borderRadius: 10, fontWeight: 500, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 12px 40px rgba(124,108,240,.4)' }}>
          Otwórz narzędzia →
        </button>
        <button style={{ padding: '18px 28px', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: '#fff', fontSize: 15, background: 'transparent', cursor: 'pointer' }}>
          Manifest
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '0.08em' }}>
        10 ACTIVE · 0 BYTES UPLOADED · MIT
      </div>
    </div>
  </section>
);

const DTools = () => {
  const [active, setActive] = useState('Wszystkie');
  const filtered = active === 'Wszystkie' ? T_TOOLS : T_TOOLS.filter(t => t.cat === active);
  return (
    <section style={{ padding: '60px 48px', position: 'relative' }}>
      {/* sticky dock */}
      <div style={{ position: 'sticky', top: 60, zIndex: 5, padding: '14px 0', background: 'rgba(8,8,12,.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 40, marginLeft: -48, marginRight: -48, paddingLeft: 48, paddingRight: 48, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: '0.1em' }}>FILTR:</span>
        {['Wszystkie', ...T_CATS.map(c => c.id)].map(t => (
          <button key={t} onClick={() => setActive(t)} style={{ padding: '6px 14px', background: active === t ? 'rgba(124,108,240,.18)' : 'transparent', border: '1px solid', borderColor: active === t ? 'rgba(167,139,250,.4)' : 'rgba(255,255,255,.1)', borderRadius: 99, color: active === t ? '#fff' : 'rgba(255,255,255,.65)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t}
          </button>
        ))}
        <span style={{ flex: 1 }}></span>
        <input readOnly placeholder="szukaj… (⌘K)" style={{ padding: '8px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: 13, fontFamily: 'inherit', minWidth: 200 }} />
      </div>
      <header style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#7c6cf0', letterSpacing: '0.18em', marginBottom: 12 }}>/ NARZĘDZIA · {filtered.filter(t=>t.live).length} / {filtered.length}</div>
        <h2 style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, fontWeight: 500, letterSpacing: '-0.03em', margin: 0 }}>{active === 'Wszystkie' ? 'Wszystkie' : active}</h2>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {filtered.map(t => {
          const cat = T_CATS.find(c => c.id === t.cat);
          return (
            <div key={t.name} style={{ padding: 24, background: t.live ? '#0c0c14' : 'transparent', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, opacity: t.live ? 1 : 0.5, position: 'relative', minHeight: 140 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${cat.accent}22`, color: cat.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"JetBrains Mono", monospace', fontSize: 14 }}>{t.icon}</div>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: cat.accent, letterSpacing: '0.08em' }}>{cat.n} · {t.cat}</span>
              </div>
              <div style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{t.name}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>{t.desc}</div>
              {t.badge && <span style={{ position: 'absolute', top: 16, right: 16, padding: '2px 8px', fontSize: 9, color: cat.accent, border: `1px solid ${cat.accent}55`, borderRadius: 99, fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t.badge}</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ===== Canvas =====
const ToolsOptions = () => (
  <DesignCanvas>
    <DCSection id="tools-options" title="Tools — 4 warianty ekspozycji" subtitle="Ten sam content, 4 różne podejścia. Kliknij artboard żeby otworzyć fullscreen.">
      <DCArtboard id="a" label="A · Mega Grid" width={1280} height={1700}>
        <VariantA />
      </DCArtboard>
      <DCArtboard id="b" label="B · Sticky Dock + ⌘K" width={1280} height={1500}>
        <VariantB />
      </DCArtboard>
      <DCArtboard id="c" label="C · Hero = Tool Map" width={1280} height={1100}>
        <VariantC />
      </DCArtboard>
      <DCArtboard id="d" label="D · Landing + /tools/ (klikalne)" width={1280} height={1100}>
        <VariantD />
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

window.ToolsOptions = ToolsOptions;
