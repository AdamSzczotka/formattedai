// Plan / Roadmap document — etap 0 redesignu

const Plan = () => {
  return (
    <div style={planStyles.root}>
      {/* ===== Header ===== */}
      <div style={planStyles.head}>
        <div style={planStyles.eyebrow}>
          <span style={planStyles.dot}></span>
          ROADMAP REDESIGNU · v1 · 09 maja 2026
        </div>
        <h1 style={planStyles.h1}>
          Forma <em style={planStyles.em}>cinematic</em>,<br />
          narzędzia <em style={planStyles.em}>czysto funkcjonalne</em>.
        </h1>
        <p style={planStyles.lead}>
          FormattedAI dostaje dwa rejestry. Strony narracyjne (home, blog, artykuły)
          robią wow efektem. Narzędzia robią pracę — bez ozdóbek, z fokusem na pole robocze,
          stany i shortcuty.
        </p>
      </div>

      {/* ===== Pryncypia ===== */}
      <Block n="01" label="Pryncypia">
        <Principle
          title="Użyteczność > efekt — w narzędziach"
          body="Każdy tool zaczyna się od pola roboczego i jednej oczywistej akcji. Animacje, gradienty, bg-effects schodzą do akcentu. Mobile + klawiatura jako pełnoprawne ścieżki, nie afterthought."
        />
        <Principle
          title="Cinematic — w narracji"
          body="Home, blog i artykuły mogą oddychać, scrollować się sekcjami, mieć duże fotografie/placeholdery i typografię jako bohatera. Tu kompromis kosztem 1-2 dodatkowych sekund — dozwolony."
        />
        <Principle
          title="Jeden system, dwa rejestry"
          body="Wspólna paleta, typografia i komponenty. To samo logo, te same odstępy, ten sam akcent #7c6cf0. Różnica jest w gęstości i tempie — nie w brandzie."
        />
        <Principle
          title="100% client-side jako trzon komunikacji"
          body="Slogan przestaje być etykietą w hero — staje się rytmem strony. Wraca w sekcjach, footerze, pojedynczym artykule. Forma wzmacnia zaufanie."
        />
      </Block>

      {/* ===== Etapy ===== */}
      <Block n="02" label="Kolejność prac">
        <ol style={planStyles.steps}>
          <Step
            num="1"
            title="Strona główna"
            scope="hero, sekcje narzędzi pogrupowane (Tekst / Obrazy / Dokumenty / SEO), manifest, blog teaser, footer"
            today="✓ DZISIAJ — moodboard 3 kierunków"
          />
          <Step
            num="2"
            title="Listing bloga"
            scope="editorial — pierwszy artykuł duży / hero, reszta jako zorganizowana lista; tagi, język PL/EN"
            today="następnie"
          />
          <Step
            num="3"
            title="Pojedynczy artykuł"
            scope="hybrid — czytelna kolumna tekstu, cinematic hero, sticky ToC, breakouty na cytaty i obrazki"
            today="następnie"
          />
          <Step
            num="4"
            title="Każde narzędzie"
            scope="zaczynamy od Markdown Formattera jako wzorca — potem reszta pod ten sam pattern"
            today="finał"
          />
        </ol>
      </Block>

      {/* ===== Co poprawiamy w toolach ===== */}
      <Block n="03" label="Narzędzia — diagnoza i lekarstwo">
        <table style={planStyles.diag}>
          <tbody>
            <Row
              problem="Za małe pole robocze (input/output)"
              fix="Pole zajmuje min. 70% wysokości viewportu. Sticky toolbar, panele opcji się zwijają."
            />
            <Row
              problem="Słabe stany pustej / błędu / sukcesu"
              fix="Każdy tool ma 4 stany jako osobne ekrany: empty, loading, success, error — z konkretną kopią i CTA."
            />
            <Row
              problem="Brak shortcutów klawiaturowych"
              fix="⌘/Ctrl+Enter run, ⌘/Ctrl+K palette, ⌘/Ctrl+C copy result. Cheatsheet w stopce toola."
            />
            <Row
              problem="Słaby mobile"
              fix="Tab-bar zamiast bocznych paneli, akcje sticky w bottom-bar, drag&drop fallbackuje do file picker."
            />
            <Row
              problem="Nieczytelne ustawienia / opcje"
              fix="Opcje schowane do panelu po prawej z ikoną 'Tweak'. Popularne są presetami u góry."
            />
            <Row
              problem="Brak przykładów / quick-start"
              fix={'Przycisk „Wczytaj przykład" w pustym stanie. 1 klik, działa, widać efekt.'}
            />
            <Row
              problem="Brak feedbacku po akcji"
              fix="Toast + zmiana stanu pola. Wszystkie operacje >300ms mają progress bar / spinner."
            />
            <Row
              problem="Niejasny pierwszy krok"
              fix="W każdym empty-state jedno duże CTA. Wszystkie inne opcje są drugorzędne wizualnie."
            />
            <Row
              problem="Za dużo szumu wizualnego"
              fix="Tool = czarne tło, 1 akcent fioletowy, mono labels. Bez orbitujących blob'ów, bez gradientów na CTA."
            />
          </tbody>
        </table>
      </Block>

      {/* ===== System ===== */}
      <Block n="04" label="System wizualny">
        <div style={planStyles.sysGrid}>
          <SysCard title="Typografia" mono>
            <div style={planStyles.typeRow}>
              <div style={{...planStyles.typeSample, fontFamily: '"Instrument Serif", serif', fontSize: 56, lineHeight: 1, fontStyle: 'italic'}}>Aa</div>
              <div>
                <div style={planStyles.typeName}>Instrument Serif</div>
                <div style={planStyles.typeRole}>Display — narracyjne nagłówki, akcenty italic</div>
              </div>
            </div>
            <div style={planStyles.typeRow}>
              <div style={{...planStyles.typeSample, fontFamily: '"Space Grotesk", sans-serif', fontSize: 56, lineHeight: 1, fontWeight: 500}}>Aa</div>
              <div>
                <div style={planStyles.typeName}>Space Grotesk</div>
                <div style={planStyles.typeRole}>Sub-display, sekcje, large UI</div>
              </div>
            </div>
            <div style={planStyles.typeRow}>
              <div style={{...planStyles.typeSample, fontFamily: 'Inter, sans-serif', fontSize: 56, lineHeight: 1}}>Aa</div>
              <div>
                <div style={planStyles.typeName}>Inter</div>
                <div style={planStyles.typeRole}>Body, UI, longform</div>
              </div>
            </div>
            <div style={planStyles.typeRow}>
              <div style={{...planStyles.typeSample, fontFamily: '"JetBrains Mono", monospace', fontSize: 36, lineHeight: 1}}>01</div>
              <div>
                <div style={planStyles.typeName}>JetBrains Mono</div>
                <div style={planStyles.typeRole}>Labels, numeracja sekcji, kod</div>
              </div>
            </div>
          </SysCard>

          <SysCard title="Paleta">
            <Swatch hex="#08080c" name="Ink" role="Tło narracyjne" dark />
            <Swatch hex="#11111a" name="Surface" role="Tło sekcji / kart" dark />
            <Swatch hex="#7c6cf0" name="Accent" role="Akcent główny" />
            <Swatch hex="#a78bfa" name="Accent 2" role="Hover, gradient" />
            <Swatch hex="#f4f3f1" name="Paper" role="Tło artykułów (light)" />
            <Swatch hex="#22c55e" name="Signal" role="100% client-side" />
          </SysCard>

          <SysCard title="Rytm i siatka">
            <KV k="Siatka" v="12-col, 1440 max, 80px gutter na narracyjnych" />
            <KV k="Sekcja" v="min. 100vh w narracji, scroll-snap opcjonalny" />
            <KV k="Spacing" v="8 / 16 / 24 / 40 / 80 / 160 — base 8" />
            <KV k="Radius" v="0 (block), 4 (input), 12 (card), 999 (pill)" />
            <KV k="Numeracja" v="Mono, /00, 01, 02/ — w sekcjach narracji" />
          </SysCard>

          <SysCard title="Ruch">
            <KV k="Reveal" v="opacity + translateY 24px, 600ms ease-out, on scroll" />
            <KV k="Hover (link)" v="underline draw 200ms" />
            <KV k="Hover (card)" v="lift 4px + accent border, 250ms" />
            <KV k="Tool action" v="<150ms — natychmiast, bez animacji" />
            <KV k="Page transition" v="brak — strony static, scroll resetuje" />
          </SysCard>
        </div>
      </Block>

      {/* ===== Co się porównuje na canvasie ===== */}
      <Block n="05" label="Trzy kierunki home — co porównujemy">
        <div style={planStyles.variants}>
          <VariantCard
            letter="A"
            name="Editorial Cinematic"
            tagline="Serif italic + numerowane sekcje"
            best="Nastrojowe. Najbliżej Orano w duchu."
            risk="Może być zbyt 'magazynowe' jak na narzędziownię."
          />
          <VariantCard
            letter="B"
            name="Atelier"
            tagline="Architektoniczny grotesk, mono labels, full-bleed rzędy"
            best="Najczystszy. Bardzo techniczny, deweloperski."
            risk="Mniej emocji, ryzyko bycia 'jeszcze jednym dev tool'."
          />
          <VariantCard
            letter="C"
            name="Hybrid Console"
            tagline="Cinematic hero + live demo + scannable tools"
            best="Najszybciej dowozi wartość — od razu widać co tu działa."
            risk="Trochę mniej 'oddechu', bardziej zatłoczony."
          />
        </div>
      </Block>

      {/* ===== Następne kroki ===== */}
      <Block n="06" label="Po wyborze kierunku">
        <ul style={planStyles.next}>
          <li>Przybiję jeden kierunek (możemy mixować elementy między A/B/C).</li>
          <li>Rozbiję go na klikalny prototyp całej home — sekcja po sekcji.</li>
          <li>Następnie: blog listing pod tym samym językiem wizualnym.</li>
          <li>Potem: artykuł (hybrid hero + sticky ToC) z Twoim realnym contentem.</li>
          <li>Na końcu: Markdown Formatter jako wzorzec narzędzia, reszta pod ten sam pattern.</li>
        </ul>
      </Block>
    </div>
  );
};

// ====== Sub-components ======

const Block = ({ n, label, children }) => (
  <section style={planStyles.block}>
    <header style={planStyles.blockHead}>
      <div style={planStyles.blockNum}>/{n}/</div>
      <div style={planStyles.blockLabel}>{label}</div>
      <div style={planStyles.blockRule}></div>
    </header>
    <div style={planStyles.blockBody}>{children}</div>
  </section>
);

const Principle = ({ title, body }) => (
  <div style={planStyles.principle}>
    <h3 style={planStyles.principleTitle}>{title}</h3>
    <p style={planStyles.principleBody}>{body}</p>
  </div>
);

const Step = ({ num, title, scope, today }) => (
  <li style={planStyles.step}>
    <div style={planStyles.stepNum}>{num}</div>
    <div style={planStyles.stepBody}>
      <div style={planStyles.stepHead}>
        <h3 style={planStyles.stepTitle}>{title}</h3>
        <span style={planStyles.stepStatus}>{today}</span>
      </div>
      <p style={planStyles.stepScope}>{scope}</p>
    </div>
  </li>
);

const Row = ({ problem, fix }) => (
  <tr style={planStyles.row}>
    <td style={planStyles.rowProblem}>
      <span style={planStyles.rowMinus}>—</span> {problem}
    </td>
    <td style={planStyles.rowFix}>
      <span style={planStyles.rowPlus}>+</span> {fix}
    </td>
  </tr>
);

const SysCard = ({ title, children, mono }) => (
  <div style={planStyles.sysCard}>
    <div style={planStyles.sysCardTitle}>{title}</div>
    <div style={mono ? planStyles.sysCardBodyTight : planStyles.sysCardBody}>{children}</div>
  </div>
);

const Swatch = ({ hex, name, role, dark }) => (
  <div style={planStyles.swatchRow}>
    <div style={{...planStyles.swatchChip, background: hex, border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'}}></div>
    <div style={{flex: 1}}>
      <div style={planStyles.swatchName}>{name} <span style={planStyles.swatchHex}>{hex}</span></div>
      <div style={planStyles.swatchRole}>{role}</div>
    </div>
  </div>
);

const KV = ({ k, v }) => (
  <div style={planStyles.kv}>
    <div style={planStyles.kvK}>{k}</div>
    <div style={planStyles.kvV}>{v}</div>
  </div>
);

const VariantCard = ({ letter, name, tagline, best, risk }) => (
  <div style={planStyles.variant}>
    <div style={planStyles.variantLetter}>{letter}</div>
    <div style={planStyles.variantName}>{name}</div>
    <div style={planStyles.variantTagline}>{tagline}</div>
    <div style={planStyles.variantPro}><span style={planStyles.variantPlus}>+</span> {best}</div>
    <div style={planStyles.variantCon}><span style={planStyles.variantMinus}>—</span> {risk}</div>
  </div>
);

// ====== Styles ======

const planStyles = {
  root: {
    width: '100%',
    minHeight: '100%',
    background: '#f4f3f1',
    color: '#0a0a10',
    fontFamily: 'Inter, sans-serif',
    padding: '80px 96px 120px',
    boxSizing: 'border-box',
  },
  head: {
    maxWidth: 980,
    marginBottom: 80,
  },
  eyebrow: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    letterSpacing: '0.18em',
    color: '#5b4bd4',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    textTransform: 'uppercase',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 8px rgba(34,197,94,.5)',
  },
  h1: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 88,
    lineHeight: 1.06,
    letterSpacing: '-0.02em',
    margin: '0 0 44px',
    fontWeight: 400,
  },
  em: {
    fontStyle: 'italic',
    color: '#7c6cf0',
  },
  lead: {
    fontSize: 22,
    lineHeight: 1.45,
    color: '#3a3a44',
    maxWidth: 720,
    margin: 0,
  },
  block: { marginBottom: 80 },
  blockHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    marginBottom: 32,
  },
  blockNum: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    letterSpacing: '0.15em',
    color: '#7c6cf0',
    fontWeight: 600,
  },
  blockLabel: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 13,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    fontWeight: 600,
    color: '#0a0a10',
  },
  blockRule: {
    flex: 1,
    height: 1,
    background: 'rgba(10,10,16,.12)',
  },
  blockBody: {},
  principle: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottom: '1px solid rgba(10,10,16,.08)',
    maxWidth: 980,
  },
  principleTitle: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 26,
    fontWeight: 500,
    margin: '0 0 8px',
    letterSpacing: '-0.01em',
  },
  principleBody: {
    fontSize: 17,
    lineHeight: 1.55,
    color: '#3a3a44',
    margin: 0,
    maxWidth: 760,
  },
  steps: { listStyle: 'none', padding: 0, margin: 0 },
  step: {
    display: 'flex',
    gap: 32,
    padding: '24px 0',
    borderBottom: '1px solid rgba(10,10,16,.08)',
  },
  stepNum: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 64,
    lineHeight: 1,
    fontStyle: 'italic',
    color: '#7c6cf0',
    width: 64,
    flexShrink: 0,
  },
  stepBody: { flex: 1 },
  stepHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 24,
    marginBottom: 6,
  },
  stepTitle: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 28,
    fontWeight: 500,
    margin: 0,
    letterSpacing: '-0.01em',
  },
  stepStatus: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    color: '#5b4bd4',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  stepScope: {
    fontSize: 16,
    color: '#3a3a44',
    margin: 0,
    lineHeight: 1.5,
  },
  diag: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 15,
  },
  row: { borderBottom: '1px solid rgba(10,10,16,.08)' },
  rowProblem: {
    padding: '14px 24px 14px 0',
    width: '40%',
    color: '#71717a',
    verticalAlign: 'top',
    lineHeight: 1.5,
  },
  rowFix: {
    padding: '14px 0',
    color: '#0a0a10',
    verticalAlign: 'top',
    lineHeight: 1.5,
  },
  rowMinus: {
    fontFamily: '"JetBrains Mono", monospace',
    color: '#dc2626',
    marginRight: 8,
    fontWeight: 700,
  },
  rowPlus: {
    fontFamily: '"JetBrains Mono", monospace',
    color: '#22c55e',
    marginRight: 8,
    fontWeight: 700,
  },
  sysGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
  },
  sysCard: {
    background: '#fff',
    border: '1px solid rgba(10,10,16,.08)',
    padding: 32,
  },
  sysCardTitle: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: '#7c6cf0',
    marginBottom: 24,
  },
  sysCardBody: {},
  sysCardBodyTight: {},
  typeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    padding: '16px 0',
    borderBottom: '1px solid rgba(10,10,16,.06)',
  },
  typeSample: { width: 80, color: '#0a0a10' },
  typeName: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 18,
    fontWeight: 500,
  },
  typeRole: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  swatchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '10px 0',
  },
  swatchChip: {
    width: 56,
    height: 56,
    flexShrink: 0,
  },
  swatchName: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 15,
    fontWeight: 500,
    display: 'flex',
    gap: 12,
    alignItems: 'baseline',
  },
  swatchHex: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12,
    color: '#71717a',
    fontWeight: 400,
  },
  swatchRole: {
    fontSize: 13,
    color: '#71717a',
  },
  kv: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: 16,
    padding: '10px 0',
    borderBottom: '1px solid rgba(10,10,16,.06)',
    fontSize: 14,
  },
  kvK: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11,
    color: '#7c6cf0',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  kvV: { color: '#0a0a10', lineHeight: 1.5 },
  variants: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 24,
  },
  variant: {
    background: '#0a0a10',
    color: '#f4f3f1',
    padding: 32,
    minHeight: 240,
    display: 'flex',
    flexDirection: 'column',
  },
  variantLetter: {
    fontFamily: '"Instrument Serif", serif',
    fontSize: 88,
    lineHeight: 0.85,
    fontStyle: 'italic',
    color: '#a78bfa',
    marginBottom: 24,
  },
  variantName: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontSize: 22,
    fontWeight: 500,
    marginBottom: 8,
  },
  variantTagline: {
    fontSize: 14,
    color: '#a1a1aa',
    marginBottom: 24,
    lineHeight: 1.5,
  },
  variantPro: {
    fontSize: 13,
    color: '#bbb',
    marginBottom: 8,
    lineHeight: 1.5,
  },
  variantCon: {
    fontSize: 13,
    color: '#888',
    lineHeight: 1.5,
  },
  variantPlus: {
    fontFamily: '"JetBrains Mono", monospace',
    color: '#22c55e',
    marginRight: 6,
    fontWeight: 700,
  },
  variantMinus: {
    fontFamily: '"JetBrains Mono", monospace',
    color: '#f87171',
    marginRight: 6,
    fontWeight: 700,
  },
  next: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: 17,
    lineHeight: 1.7,
    color: '#3a3a44',
    maxWidth: 880,
  },
};

window.Plan = Plan;
