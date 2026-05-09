// Markdown Formatter — utility-first tool
const { useState, useEffect, useRef, useMemo } = React;

const FORMATS = [
  { id: 'word',  label: 'Word',          hint: 'Microsoft Word / .docx', shortcut: '1' },
  { id: 'docs',  label: 'Google Docs',   hint: 'Google Docs (HTML clipboard)', shortcut: '2' },
  { id: 'html',  label: 'HTML',          hint: 'Czysty HTML', shortcut: '3' },
  { id: 'plain', label: 'Plain text',    hint: 'Tekst bez znaczników', shortcut: '4' },
  { id: 'notion',label: 'Notion',        hint: 'Notion-friendly markdown', shortcut: '5' },
];

const EXAMPLES = [
  { id: 'gpt-article', label: 'Artykuł z ChatGPT', desc: 'nagłówki, listy, pogrubienia' },
  { id: 'gpt-table',   label: 'Tabela porównawcza', desc: 'tabela 3×4 + wstęp' },
  { id: 'gpt-code',    label: 'Code review',        desc: 'fragmenty kodu + opisy' },
];

const SAMPLES = {
  'gpt-article': `# Jak pisać dobre prompty

Pisanie dobrych promptów to **rzemiosło**, nie magia. Oto trzy zasady, które naprawdę działają.

## 1. Bądź konkretny

Zamiast "napisz mi coś o marketingu", napisz:

- temat: "marketing B2B w SaaS"
- format: lista 7 punktów
- ton: praktyczny, bez korpomowy

## 2. Daj kontekst

Model nie czyta w myślach. Daj mu kontekst: kim jesteś, kto czyta, co próbujesz osiągnąć.

## 3. Iteruj

Pierwsza odpowiedź to *draft*, nie *finał*. Pytaj o poprawki.`,
  'gpt-table': `# Porównanie formatów obrazów

Wybór formatu zależy od kontekstu. Oto skrót:

| Format | Rozmiar | Wsparcie | Najlepsze do |
|--------|---------|----------|--------------|
| JPEG   | duży    | wszędzie | zdjęcia      |
| PNG    | bardzo duży | wszędzie | grafika z przezroczystością |
| WebP   | mały    | nowoczesne przeglądarki | web ogólnie |
| AVIF   | **najmniejszy** | 95% przeglądarek | nowoczesny web |

**Rekomendacja:** AVIF + WebP fallback dla nowych projektów.`,
  'gpt-code': `# Code review — funkcja parseDate

Funkcja działa, ale ma kilka problemów:

\`\`\`js
function parseDate(s) {
  const d = new Date(s);
  if (isNaN(d)) return null;
  return d;
}
\`\`\`

Problemy:
1. \`new Date(string)\` jest **niedeterministyczne** w różnych przeglądarkach
2. Brak walidacji formatu
3. \`null\` jako error — lepszy byłby Result type

Sugestia: użyj \`date-fns/parseISO\` lub własnego parsera z explicit format.`,
};

// Mini markdown → HTML (placeholder; w realu marked.js)
function mdToHtml(md) {
  if (!md.trim()) return '';
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```([\s\S]+?)```/g, '<pre><code>$1</code></pre>');
  // tables
  html = html.replace(/(\|[^\n]+\|\n\|[\s\-:|]+\|\n(?:\|[^\n]+\|\n?)+)/g, (m) => {
    const lines = m.trim().split('\n');
    const head = lines[0].split('|').slice(1, -1).map(c => c.trim());
    const body = lines.slice(2).map(r => r.split('|').slice(1, -1).map(c => c.trim()));
    return `<table><thead><tr>${head.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${body.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  });
  // lists
  html = html.replace(/(^- .+(\n- .+)*)/gm, m => '<ul>' + m.split('\n').map(l => `<li>${l.replace(/^- /, '')}</li>`).join('') + '</ul>');
  html = html.replace(/(^\d+\. .+(\n\d+\. .+)*)/gm, m => '<ol>' + m.split('\n').map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('') + '</ol>');
  // paragraphs
  html = html.split(/\n{2,}/).map(p => {
    if (/^<(h[1-6]|ul|ol|pre|table|blockquote)/.test(p.trim())) return p;
    return p.trim() ? `<p>${p.replace(/\n/g, '<br>')}</p>` : '';
  }).join('\n');
  return html;
}

function mdToPlain(md) {
  return md
    .replace(/```[\s\S]+?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6} /gm, '')
    .replace(/^[-*] /gm, '• ')
    .replace(/\|/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}

function MarkdownFormatter() {
  const [format, setFormat] = useState('word');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [conversionTime, setConversionTime] = useState(0);
  const inputRef = useRef(null);

  // conversion
  const output = useMemo(() => {
    if (!input.trim()) return '';
    const t0 = performance.now();
    let result;
    if (format === 'plain') result = mdToPlain(input);
    else if (format === 'notion') result = input; // notion eats markdown directly
    else result = mdToHtml(input);
    const t1 = performance.now();
    requestAnimationFrame(() => setConversionTime(Math.max(1, Math.round(t1 - t0))));
    return result;
  }, [input, format]);

  const stats = useMemo(() => {
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input ? input.split('\n').length : 0;
    return { chars, words, lines };
  }, [input]);

  // shortcuts
  useEffect(() => {
    const h = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copyOutput(); }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); setInput(''); inputRef.current?.focus(); }
      if (meta && e.shiftKey && e.key.toLowerCase() === 'v') { e.preventDefault(); pasteFromClipboard(); }
      if (meta && /^[1-5]$/.test(e.key)) {
        e.preventDefault();
        const f = FORMATS[parseInt(e.key) - 1];
        if (f) setFormat(f.id);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      setInput(t);
    } catch {}
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      if (format === 'word' || format === 'docs') {
        const blob = new Blob([output], { type: 'text/html' });
        const txt = new Blob([mdToPlain(input)], { type: 'text/plain' });
        await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob, 'text/plain': txt })]);
      } else {
        await navigator.clipboard.writeText(output);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
    }
  };

  const loadExample = (id) => {
    setInput(SAMPLES[id] || '');
    inputRef.current?.focus();
  };

  return (
    <div style={F.page}>
      <ToolNav />
      <Subnav format={format} setFormat={setFormat} />

      <main style={F.main}>
        <header style={F.head}>
          <div style={F.headTop}>
            <div>
              <h1 style={F.title}>Markdown Formatter</h1>
              <p style={F.tag}>Wklej markdown z ChatGPT lub Claude. Skopiuj jako Word, Docs, HTML lub plain.</p>
            </div>
            <div style={F.statusBar}>
              <Status active={!!input.trim()} />
            </div>
          </div>
        </header>

        <div style={F.workspace}>
          <Pane
            side="input"
            label="Wejście · Markdown"
            extra={`${stats.words} słów · ${stats.chars} znaków · ${stats.lines} linii`}
            actions={
              <>
                <ToolBtn onClick={pasteFromClipboard} kbd="⌘⇧V">Wklej</ToolBtn>
                <ToolBtn onClick={() => setInput('')} kbd="⌘⇧X" disabled={!input}>Wyczyść</ToolBtn>
              </>
            }
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={'Wklej tutaj markdown z ChatGPT/Claude…\n\n# Przykładowy nagłówek\n\nLorem **ipsum** z `kodem`.'}
              spellCheck={false}
              style={F.textarea}
            />
            {!input && <EmptyHint onLoad={loadExample} />}
          </Pane>

          <Pane
            side="output"
            label={`Wyjście · ${FORMATS.find(f=>f.id===format).label}`}
            extra={input ? `${conversionTime}ms · konwersja lokalna` : 'oczekuje na input'}
            actions={
              <>
                <button
                  onClick={copyOutput}
                  disabled={!output}
                  style={{...F.copyBtn, ...(copied ? F.copyBtnOk : {}), ...(output ? {} : F.copyBtnDis)}}
                >
                  {copied ? '✓ Skopiowano' : 'Skopiuj sformatowane'}
                  <kbd style={F.copyKbd}>⌘⇧C</kbd>
                </button>
              </>
            }
          >
            <Output format={format} html={output} raw={input} plain={mdToPlain(input)} />
          </Pane>
        </div>

        {showQuickStart && (
          <QuickStart onClose={() => setShowQuickStart(false)} onLoad={loadExample} />
        )}

        <ManifestStrip />
      </main>

      <ToolFooter />
    </div>
  );
}

// — Top nav (utility-first; lighter than home) —
function ToolNav() {
  return (
    <nav style={F.nav}>
      <div style={F.navInner}>
        <FALogo size={22} />
        <div style={F.crumbs}>
          <a href="Tools.html" style={F.crumbLink}>Narzędzia</a>
          <span style={F.crumbSep}>/</span>
          <span style={F.crumbCur}>Markdown Formatter</span>
        </div>
        <div style={F.navRight}>
          <a href="Tools.html" style={F.navBtn}>Wszystkie narzędzia</a>
        </div>
      </div>
    </nav>
  );
}

// — Format selector strip —
function Subnav({ format, setFormat }) {
  return (
    <div style={F.subnav}>
      <div style={F.subnavInner}>
        <span style={F.subnavLabel}>FORMAT WYJŚCIOWY</span>
        <div style={F.formats}>
          {FORMATS.map(f => (
            <button
              key={f.id}
              onClick={() => setFormat(f.id)}
              title={f.hint}
              style={{...F.formatBtn, ...(format === f.id ? F.formatBtnActive : {})}}
            >
              <span>{f.label}</span>
              <kbd style={F.formatKbd}>⌘{f.shortcut}</kbd>
            </button>
          ))}
        </div>
        <div style={F.subnavRight}>
          <span style={F.lockIcon}>🔒</span>
          <span style={F.subnavMeta}>działa lokalnie · 0 żądań</span>
        </div>
      </div>
    </div>
  );
}

function Status({ active }) {
  return (
    <div style={F.status}>
      <span style={{...F.statusDot, background: active ? '#22c55e' : 'rgba(255,255,255,.2)'}}></span>
      <span>{active ? 'gotowe' : 'czeka na input'}</span>
    </div>
  );
}

// — Pane wrapper (used twice: input + output) —
function Pane({ side, label, extra, actions, children }) {
  return (
    <section style={{...F.pane, ...(side === 'output' ? F.paneOut : {})}}>
      <header style={F.paneHead}>
        <div>
          <div style={F.paneLabel}>{label}</div>
          <div style={F.paneExtra}>{extra}</div>
        </div>
        <div style={F.paneActions}>{actions}</div>
      </header>
      <div style={F.paneBody}>{children}</div>
    </section>
  );
}

const ToolBtn = ({ children, onClick, kbd, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{...F.toolBtn, ...(disabled ? F.toolBtnDis : {})}}>
    {children}
    {kbd && <kbd style={F.toolKbd}>{kbd}</kbd>}
  </button>
);

// — Output area —
function Output({ format, html, raw, plain }) {
  const [view, setView] = useState('rendered'); // rendered | raw
  if (!raw.trim()) return <OutputEmpty />;

  if (format === 'plain') {
    return (
      <pre style={F.outputPlain}>{plain}</pre>
    );
  }
  if (format === 'notion') {
    return (
      <pre style={F.outputCode}>{raw}</pre>
    );
  }

  return (
    <div style={F.outputWrap}>
      <div style={F.outputTabs}>
        <button onClick={() => setView('rendered')} style={{...F.outputTab, ...(view==='rendered'? F.outputTabActive:{})}}>Podgląd</button>
        <button onClick={() => setView('raw')} style={{...F.outputTab, ...(view==='raw'? F.outputTabActive:{})}}>HTML źródłowy</button>
      </div>
      {view === 'rendered'
        ? <div className="preview-zone" style={F.preview} dangerouslySetInnerHTML={{__html: html}} />
        : <pre style={F.outputCode}>{html}</pre>}
    </div>
  );
}

const OutputEmpty = () => (
  <div style={F.empty}>
    <div style={F.emptyMark}>↘</div>
    <div style={F.emptyText}>Wynik pojawi się tutaj automatycznie po wpisaniu lub wklejeniu markdown po lewej.</div>
    <div style={F.emptyHints}>
      <span style={F.emptyHint}><kbd style={F.toolKbd}>⌘⇧V</kbd> wklej</span>
      <span style={F.emptyHint}><kbd style={F.toolKbd}>⌘⇧C</kbd> kopiuj</span>
      <span style={F.emptyHint}><kbd style={F.toolKbd}>⌘1-5</kbd> format</span>
    </div>
  </div>
);

// — Empty hint inside textarea —
const EmptyHint = ({ onLoad }) => (
  <div style={F.inputHint}>
    <div style={F.inputHintLabel}>Albo wczytaj przykład</div>
    <div style={F.inputHintList}>
      {EXAMPLES.map(e => (
        <button key={e.id} onClick={() => onLoad(e.id)} style={F.inputHintBtn}>
          <span>{e.label}</span>
          <span style={F.inputHintDesc}>{e.desc}</span>
        </button>
      ))}
    </div>
  </div>
);

// — Quick start collapsible —
function QuickStart({ onClose, onLoad }) {
  return (
    <section style={F.qs}>
      <header style={F.qsHead}>
        <div>
          <div style={F.qsLabel}>/ JAK TO DZIAŁA · KROK PO KROKU</div>
          <div style={F.qsTitle}>Pierwszy raz tutaj?</div>
        </div>
        <button onClick={onClose} style={F.qsClose}>Ukryj ×</button>
      </header>
      <div style={F.qsGrid}>
        <Step n="1" title="Skopiuj odpowiedź AI">
          Z ChatGPT, Claude, Gemini — zaznacz całość (<kbd style={F.toolKbd}>⌘A</kbd>) i skopiuj (<kbd style={F.toolKbd}>⌘C</kbd>).
        </Step>
        <Step n="2" title="Wklej tutaj">
          <kbd style={F.toolKbd}>⌘V</kbd> w polu po lewej, albo <kbd style={F.toolKbd}>⌘⇧V</kbd> ze schowka.
        </Step>
        <Step n="3" title="Wybierz format">
          Word, Docs, HTML, plain text albo Notion. Konwersja jest natychmiastowa.
        </Step>
        <Step n="4" title="Skopiuj wynik">
          <kbd style={F.toolKbd}>⌘⇧C</kbd> kopiuje sformatowane do schowka. Wklej do dokumentu.
        </Step>
      </div>
      <footer style={F.qsFoot}>
        <span style={F.qsFootLabel}>Brak pomysłu na test? Wczytaj przykład:</span>
        <div style={F.qsExamples}>
          {EXAMPLES.map(e => (
            <button key={e.id} onClick={() => onLoad(e.id)} style={F.qsExBtn}>{e.label}</button>
          ))}
        </div>
      </footer>
    </section>
  );
}

const Step = ({ n, title, children }) => (
  <div style={F.step}>
    <div style={F.stepN}>{n}</div>
    <div style={F.stepTitle}>{title}</div>
    <div style={F.stepDesc}>{children}</div>
  </div>
);

function ManifestStrip() {
  return (
    <div style={F.manifest}>
      <div style={F.manifestItem}><span style={F.manifestKey}>Lokalnie</span><span style={F.manifestVal}>Konwersja w przeglądarce, 0 żądań do serwera</span></div>
      <div style={F.manifestItem}><span style={F.manifestKey}>Bez kont</span><span style={F.manifestVal}>Bez logowania, bez limitów, bez captchy</span></div>
      <div style={F.manifestItem}><span style={F.manifestKey}>Open</span><span style={F.manifestVal}>Kod na <a href="https://github.com/adamszczotka" target="_blank" rel="noopener" style={F.manifestLink}>GitHubie</a></span></div>
    </div>
  );
}

function ToolFooter() {
  return (
    <footer style={F.foot}>
      <div style={F.footInner}>
        <div style={F.footLeft}>
          <FALogo size={18} />
          <span style={F.footSep}>·</span>
          <a href="https://adamszczotka.dev" target="_blank" rel="noopener" style={F.footLink}>adamszczotka.dev ↗</a>
        </div>
        <div style={F.footRight}>
          <a href="Articles.html" style={F.footLink}>Dziennik</a>
          <a href="/rss.xml" style={F.footLink}>RSS</a>
          <a href="/llms.txt" style={F.footLink}>llms.txt</a>
          <a href="https://github.com/adamszczotka" target="_blank" rel="noopener" style={F.footLink}>GitHub</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const F = {
  page: { background: '#08080c', color: '#f0f0f4', fontFamily: '"Inter", -apple-system, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' },

  // Top nav (slim)
  nav: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(8,8,12,.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 30 },
  navInner: { maxWidth: 1600, margin: '0 auto', padding: '14px 32px', display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'center', flexWrap: 'wrap' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#fff' },
  logoMark: { fontFamily: '"Fraunces", serif', fontSize: 20, color: '#a78bfa' },
  logoText: { fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' },
  crumbs: { display: 'flex', alignItems: 'center', gap: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 12 },
  crumbLink: { color: 'rgba(255,255,255,.5)', textDecoration: 'none' },
  crumbSep: { color: 'rgba(255,255,255,.2)' },
  crumbCur: { color: '#fff' },
  navRight: { display: 'flex', alignItems: 'center', gap: 12 },
  navBtn: { padding: '8px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(255,255,255,.75)', fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' },

  // Format strip
  subnav: { borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' },
  subnavInner: { maxWidth: 1600, margin: '0 auto', padding: '12px 32px', display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' },
  subnavLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.16em', whiteSpace: 'nowrap' },
  formats: { display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 },
  formatBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'transparent', border: '1px solid rgba(255,255,255,.06)', borderRadius: 7, color: 'rgba(255,255,255,.65)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s' },
  formatBtnActive: { background: 'rgba(124,108,240,.12)', borderColor: 'rgba(167,139,250,.4)', color: '#fff' },
  formatKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.35)', padding: '1px 5px', background: 'rgba(255,255,255,.04)', borderRadius: 3 },
  subnavRight: { display: 'flex', alignItems: 'center', gap: 8 },
  lockIcon: { fontSize: 12 },
  subnavMeta: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(34,197,94,.7)', whiteSpace: 'nowrap' },

  // Main
  main: { flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto', padding: '32px 32px 64px', display: 'flex', flexDirection: 'column', gap: 24 },

  head: { display: 'flex', flexDirection: 'column', gap: 8 },
  headTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 },
  title: { fontFamily: '"Fraunces", serif', fontSize: 38, lineHeight: 1.1, fontWeight: 400, letterSpacing: '-0.02em', margin: 0, color: '#fff' },
  tag: { fontSize: 15, color: 'rgba(255,255,255,.6)', margin: '6px 0 0', maxWidth: 640 },
  statusBar: { display: 'flex', gap: 12 },
  status: { display: 'flex', alignItems: 'center', gap: 8, fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,.6)', whiteSpace: 'nowrap' },
  statusDot: { width: 8, height: 8, borderRadius: '50%', transition: 'background .25s' },

  // Workspace
  workspace: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, minHeight: 540 },
  pane: { display: 'flex', flexDirection: 'column', background: '#0c0c14', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, overflow: 'hidden' },
  paneOut: { background: '#0a0a12' },
  paneHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,.06)', gap: 16, flexWrap: 'wrap' },
  paneLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  paneExtra: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 4, whiteSpace: 'nowrap' },
  paneActions: { display: 'flex', gap: 6, alignItems: 'center' },
  paneBody: { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' },

  toolBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 7, color: 'rgba(255,255,255,.75)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },
  toolBtnDis: { opacity: 0.4, cursor: 'not-allowed' },
  toolKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '1px 5px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 3, color: 'rgba(255,255,255,.5)' },

  copyBtn: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '9px 16px', background: 'linear-gradient(135deg, #7c6cf0, #5b4bd4)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' },
  copyBtnOk: { background: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  copyBtnDis: { opacity: 0.35, cursor: 'not-allowed' },
  copyKbd: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, padding: '1px 5px', background: 'rgba(255,255,255,.18)', borderRadius: 3, color: 'rgba(255,255,255,.85)' },

  // Textarea
  textarea: { flex: 1, minHeight: 480, width: '100%', padding: '20px 22px', background: 'transparent', border: 'none', outline: 'none', color: '#f0f0f4', fontFamily: '"JetBrains Mono", monospace', fontSize: 14, lineHeight: 1.7, resize: 'none' },

  // Empty hint inside input
  inputHint: { position: 'absolute', bottom: 16, left: 22, right: 22, padding: 14, background: 'rgba(124,108,240,.04)', border: '1px dashed rgba(167,139,250,.2)', borderRadius: 8 },
  inputHintLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(167,139,250,.7)', letterSpacing: '0.14em', marginBottom: 10 },
  inputHintList: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  inputHintBtn: { display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: 'rgba(255,255,255,.85)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', gap: 2 },
  inputHintDesc: { fontSize: 10, color: 'rgba(255,255,255,.45)', fontFamily: '"JetBrains Mono", monospace' },

  // Output
  outputWrap: { flex: 1, display: 'flex', flexDirection: 'column' },
  outputTabs: { display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,.05)', background: 'rgba(255,255,255,.01)' },
  outputTab: { padding: '8px 16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -1 },
  outputTabActive: { color: '#fff', borderBottomColor: '#a78bfa' },
  preview: { flex: 1, padding: '24px 28px', overflowY: 'auto', maxHeight: 480, fontSize: 15, lineHeight: 1.7, color: '#f0f0f4' },
  outputCode: { flex: 1, margin: 0, padding: '20px 22px', fontFamily: '"JetBrains Mono", monospace', fontSize: 13, lineHeight: 1.65, color: 'rgba(240,240,244,.85)', overflowY: 'auto', maxHeight: 480, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  outputPlain: { flex: 1, margin: 0, padding: '20px 22px', fontFamily: '"Inter", sans-serif', fontSize: 14, lineHeight: 1.7, color: '#f0f0f4', overflowY: 'auto', maxHeight: 540, whiteSpace: 'pre-wrap' },

  empty: { padding: '60px 24px', textAlign: 'center', color: 'rgba(255,255,255,.4)' },
  emptyMark: { fontSize: 36, color: 'rgba(167,139,250,.3)', marginBottom: 16, transform: 'rotate(-25deg)' },
  emptyText: { fontSize: 14, lineHeight: 1.6, maxWidth: 360, margin: '0 auto 24px' },
  emptyHints: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  emptyHint: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.5)' },

  // Quick start
  qs: { background: '#0a0a12', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: 24 },
  qsHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  qsLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,.4)', letterSpacing: '0.16em', marginBottom: 8 },
  qsTitle: { fontFamily: '"Fraunces", serif', fontSize: 22, fontWeight: 400, color: '#fff', margin: 0 },
  qsClose: { background: 'transparent', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.5)', fontSize: 12, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' },
  qsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  step: { padding: 16, background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)', borderRadius: 8 },
  stepN: { fontFamily: '"Fraunces", serif', fontSize: 28, color: '#a78bfa', lineHeight: 1, marginBottom: 10 },
  stepTitle: { fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 6 },
  stepDesc: { fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,.6)' },
  qsFoot: { display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.05)', flexWrap: 'wrap' },
  qsFootLabel: { fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,.5)' },
  qsExamples: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  qsExBtn: { padding: '6px 12px', background: 'rgba(124,108,240,.08)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 6, color: '#c4b5fd', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer' },

  // Manifest
  manifest: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: '20px 0', borderTop: '1px solid rgba(255,255,255,.05)' },
  manifestItem: { display: 'flex', flexDirection: 'column', gap: 6 },
  manifestKey: { fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: '#a78bfa', letterSpacing: '0.16em', textTransform: 'uppercase' },
  manifestVal: { fontSize: 13, color: 'rgba(255,255,255,.7)' },
  manifestLink: { color: '#a78bfa', textDecoration: 'underline', textUnderlineOffset: 2 },

  // Footer
  foot: { borderTop: '1px solid rgba(255,255,255,.05)', padding: '20px 32px', background: '#06060a' },
  footInner: { maxWidth: 1600, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 },
  footLeft: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'rgba(255,255,255,.5)' },
  footMark: { fontFamily: '"Fraunces", serif', color: '#fff' },
  footSep: { color: 'rgba(255,255,255,.2)' },
  footLink: { color: 'rgba(255,255,255,.6)', textDecoration: 'none', fontSize: 12 },
  footRight: { display: 'flex', gap: 18 },
};

// Preview content base styles
const previewCSS = `
  #root .md-preview h1 { font-family: 'Fraunces', serif; font-size: 28px; line-height: 1.2; font-weight: 400; margin: 0 0 14px; color: #fff; }
  #root .md-preview h2 { font-family: 'Fraunces', serif; font-size: 22px; line-height: 1.25; font-weight: 400; margin: 22px 0 10px; color: #fff; }
  #root .md-preview h3 { font-size: 16px; font-weight: 600; margin: 18px 0 8px; color: #fff; }
  #root .md-preview p { margin: 0 0 12px; }
  #root .md-preview ul, #root .md-preview ol { padding-left: 22px; margin: 0 0 12px; }
  #root .md-preview li { margin-bottom: 4px; }
  #root .md-preview code { background: rgba(167,139,250,.12); color: #c4b5fd; padding: 2px 6px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 0.88em; }
  #root .md-preview pre { background: #06060a; border: 1px solid rgba(255,255,255,.06); padding: 14px; border-radius: 8px; overflow-x: auto; margin: 0 0 14px; }
  #root .md-preview pre code { background: transparent; color: #f0f0f4; padding: 0; font-size: 12px; }
  #root .md-preview table { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 13px; }
  #root .md-preview th, #root .md-preview td { padding: 8px 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,.08); }
  #root .md-preview th { background: rgba(124,108,240,.08); font-weight: 500; }
  #root .md-preview strong { color: #fff; font-weight: 600; }
  #root .md-preview em { color: rgba(255,255,255,.85); }
`;
const styleEl = document.createElement('style');
styleEl.textContent = previewCSS.replace(/md-preview/g, 'preview-zone');
document.head.appendChild(styleEl);

ReactDOM.createRoot(document.getElementById('root')).render(<MarkdownFormatter />);
