# Text Humanizer — Plan budowy (3 fazy)

Data: 2026-05-10
Status: Zatwierdzony — strategia hybrydowa
Branch: `feature/text-humanizer`
Powiązany dokument: `docs/TEXT_HUMANIZER_PLAN.md` (research i decyzje wstępne)

---

## Zatwierdzone decyzje

| Decyzja | Wartość |
|---|---|
| Strategia | Hybryda: Sanitizer (rule-based) + Deep Humanizer (WebLLM) |
| Technika WebLLM | Reverse-Prompting (Extract → Rebuild z personą) |
| Języki | PL + EN (oba w jednym `index.html`, klasy `.lang-pl` / `.lang-en`) |
| Style preset | Casual / Academic / Direct (Email) |
| Diff view | Side-by-side z highlight (czerwony = usunięte, zielony = dodane) |
| Burstiness Score | Wbudowany w UI (przed/po, vanilla JS, brak modelu detekcyjnego) |
| URL | `/text-humanizer/` + `/en/text-humanizer/` (zgodnie z konwencją root) |
| Faza 1 | MVP rule-based — startujemy od razu |
| Faza 2 | **POMINIĘTA** — case study na LinkedIn wymaga widocznego Deep mode |
| Faza 3 | WebLLM + reverse-prompting — startujemy razem z Fazą 1 |
| BYOK | NIE w MVP. Może w fazie 4 jako mały link "dla devów". |
| CSP | Relaks `wasm-unsafe-eval` **tylko** dla `/text-humanizer/` (Faza 3 wymóg) |
| Service Worker | Dopiero w Fazie 3c (po stabilizacji WebLLM) |
| Akceptacja extract-step | NIE w UX. Zamiast: **Dev Mode** — 5× klik w nagłówek loguje bullety do `console.log` |
| Custom persona | Faza 3c, schowana pod `[+ Zaawansowane]` |

**UWAGA — sprostowanie konwencji:** narzędzia w tym projekcie żyją bezpośrednio w root (`/formatter/`, `/js-minifier/`, `/avif/` itd.). Folder `/narzedzia/` to listing-katalog narzędzi, nie kontener na nie. Dlatego URL = `/text-humanizer/`, nie `/narzedzia/text-humanizer/`. Zmiana zgodna z `js-minifier`, `css-minifier`, `seo-geo`, `pdf` itd.

---

## Architektura wysokopoziomowa

```
┌─────────────────────────────────────────────────────────────┐
│                    UI (text-humanizer/)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Editor (Left)│  │ Diff Panel   │  │ Output (Right)   │  │
│  │ + textarea   │  │ (porównanie) │  │ + textarea       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                              │
│  [ Quick Sanitize ▼ ]   [ Deep Humanizer 🔒 ]  Style: [...]  │
│  Burstiness: 0.18 → 0.72  •  Słowa: 412  •  Język: PL       │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
        ▼                                   ▼
  ┌──────────┐                     ┌────────────────┐
  │ Sanitizer│                     │ Deep Humanizer │
  │ (Faza 1) │                     │ (Faza 3)       │
  │          │                     │                │
  │ pure JS  │                     │ WebLLM Worker  │
  │  ~50 KB  │                     │ Qwen 2.5 1.5B  │
  └────┬─────┘                     └────────┬───────┘
       │                                    │
       ▼                                    ▼
  ┌──────────┐                     ┌────────────────┐
  │ Słowniki │                     │ Reverse Prompt │
  │ pl.json  │                     │ Extract→Rebuild│
  │ en.json  │                     │ + Persona      │
  └──────────┘                     └────────────────┘
```

---

## Struktura plików (do utworzenia)

```
/text-humanizer/
└── index.html                                  # PL canonical, ~600 linii (kopia js-minifier)
/en/text-humanizer/
└── index.html                                  # EN canonical

/assets/scss/
└── text-humanizer.scss                         # SCSS narzędzia

/assets/css/
└── text-humanizer.css                          # build output

/assets/js/text-humanizer/
├── core.js                                     # entry, orkiestracja UI
├── sanitizer.js                                # Faza 1 silnik
├── burstiness.js                               # pomiar burstiness + perplexity-light
├── diff.js                                     # generator diff (LCS)
├── sentence-splitter.js                        # rozbicie na zdania PL/EN
├── language-detect.js                          # detekcja języka (PL vs EN)
├── style-presets.js                            # mapowanie preset → reguły/prompt
├── webllm-worker.js                            # Faza 3, web worker, izolacja
├── reverse-prompt.js                           # Faza 3, builder promptów
└── dictionaries/
    ├── pl.json                                 # AI-słówka, hedgi, closery PL
    └── en.json                                 # AI-słówka, hedgi, closery EN

/assets/js/
├── text-humanizer.js                           # entry (importuje text-humanizer/core.js)
└── text-humanizer.min.js                       # build output

/docs/
└── TEXT_HUMANIZER_BUILD.md                     # ten plik
```

**Modyfikacje:**

```
package.json                                    # +build:text-humanizer, +watch, +build:js entry
sitemap.xml                                     # +PL i +EN URL
narzedzia/index.html                            # +card narzędzia
en/tools/index.html                             # +card narzędzia (EN)
index.html                                      # +link/card na home (oba języki)
en/index.html                                   # +link/card na home EN
llms.txt                                        # +linia o nowym narzędziu
robots.txt                                      # bez zmian (już Allow dla głównych botów)
```

---

# FAZA 1 — Quick Sanitize (Tydzień 1)

## Cel fazy 1
Wyrzucenie strukturalnych fingerprintów AI w czystym JS, bez pobierania jakiegokolwiek modelu. Działa instant. Pasuje do filozofii formattera/minifiera.

## Definition of Done dla fazy 1
- [ ] `/text-humanizer/` i `/en/text-humanizer/` działają, ładują się <1 s.
- [ ] Tekst PL i EN wkleja się do edytora, sanitizer zwraca wynik <300 ms dla 5000 znaków.
- [ ] Diff view kolorowy (usunięte czerwone, dodane zielone, zmienione żółte).
- [ ] Burstiness Score liczy i pokazuje przed/po (np. `0.21 → 0.68`).
- [ ] 3 style preset (Casual/Academic/Direct) mają widoczny wpływ na output.
- [ ] Słowniki PL i EN mają minimum 50 AI-fraz każdy + 30 hedgi + 20 closerów.
- [ ] Build przechodzi: `npm run build:css && npm run build:js`.
- [ ] Smoke test: 3 próbki AI (ChatGPT/Claude/Gemini) PL + EN dają rozsądny output.

## Algorytm Sanitizer (pseudokod)

```js
// sanitizer.js
function sanitize(text, { lang = 'auto', preset = 'casual' } = {}) {
  // 1. Detekcja języka (jeśli auto)
  const language = lang === 'auto' ? detectLang(text) : lang;
  const dict = loadDict(language);  // pl.json lub en.json
  const presetRules = STYLE_PRESETS[preset];

  // 2. Rozbicie na zdania (uważa na PL skróty: p., np., tzw., dr, r.)
  let sentences = splitSentences(text, language);

  // 3. Strip hedge openers (na poziomie tekstu, regex z dict.hedge_openers)
  sentences = sentences.filter(s => !isHedgeOpener(s, dict));

  // 4. Strip resolution closers (usuwa "Podsumowując...", "In conclusion...")
  if (presetRules.stripClosers) {
    sentences = sentences.filter(s => !isResolutionCloser(s, dict));
  }

  // 5. Per-sentence transformacje
  sentences = sentences.map(s => {
    s = replaceAIWords(s, dict.canary_words, presetRules.aggressiveness);
    s = simplifyEmDashes(s);  // 70% em-dash → przecinek/kropka
    s = breakTricolons(s, dict);
    s = adjustContractions(s, language, preset);
    return s;
  });

  // 6. Burstiness rebalancing (split długich, łączenie krótkich)
  sentences = rebalanceBurstiness(sentences, { target: 0.65, language });

  // 7. Złożenie z powrotem + opcjonalnie podział akapitów
  let output = sentences.join(' ');
  if (presetRules.shortParagraphs) {
    output = splitParagraphs(output, { maxSentences: 3 });
  }

  return output;
}
```

### 7 transformacji szczegółowo

#### T1. Strip hedge openers
Słownik PL przykładowo:
```json
"hedge_openers": [
  "W dzisiejszym (szybko zmieniającym się )?świecie",
  "W dobie (cyfrowej |nowoczesnej )?transformacji",
  "Warto (zauważyć|podkreślić|wspomnieć),? że",
  "Nie ulega wątpliwości,? że",
  "(Dziś|Obecnie|Współcześnie),? gdy",
  "W (epoce|erze) ((sztucznej )?inteligencji|AI|cyfryzacji)"
]
```
Regex matchuje początek zdania. Jeśli match — zdanie wycinamy całkowicie albo (Academic preset) trimujemy tylko opener.

#### T2. Strip resolution closers
```json
"resolution_closers": [
  "Podsumowując",
  "Reasumując",
  "Na zakończenie",
  "(Pamiętajmy|Warto pamiętać),? że",
  "W (efekcie|rezultacie|konsekwencji)"
]
```
Wycinamy całe zdanie LUB cały ostatni akapit (zależnie od preset).

#### T3. AI canary words → synonimy
```json
"canary_words": {
  "zagłębić się": ["wejść głębiej", "rozwinąć", "poznać dokładniej"],
  "krajobraz": ["kontekst", "obszar", "scena"],
  "tkanka": ["tło", "fundament", "osnowa"],
  "kompleksowy": ["szeroki", "pełny", "całościowy"],
  "rewolucjonizować": ["zmieniać", "przeorać", "przekształcać"],
  "synergia": ["współgranie", "uzupełnianie się"],
  "holistyczny": ["całościowy", "pełny"],
  "bezprecedensowy": ["niespotykany", "nowy"],
  "transformować": ["zmieniać", "przekształcać"],
  "wpisuje się w": ["pasuje do", "łączy się z"]
}
```
EN słownik analogicznie: `delve`, `tapestry`, `navigate`, `leverage`, `robust`, `unprecedented`, `pivotal`, `holistic`, `seamless`, `cutting-edge`...

**Ważne:** wybór synonimu losowy (deterministyczny per zdanie używając hashy — żeby diff był stabilny przy ponownym uruchomieniu).

#### T4. Em-dash simplification
Reguły:
- Em-dash w środku zdania (np. "tekst — tekst") → przecinek w 70% przypadków, kropka + nowe zdanie w 20%, zostawić w 10%.
- Em-dash po stronie wpadania w nawias → zostawić (rzadko AI).
- Em-dash na początku linii (myślnik dialogu) → zostawić (PL specyficzne).

#### T5. Break tricolons
Detekcja: `[A], [B], (and|or|i|oraz|lub) [C]` gdzie A/B/C są równolegle zbudowane (sprawdzamy czy zaczynają się tym samym verbem/POS).
Transformacje:
- "X, Y, and Z" → "X and Y. Plus Z." (50%)
- "X, Y, and Z" → "X. And Y. Z too." (30%)
- "X, Y, and Z" → bez zmian (20%)

#### T6. Contractions
**Casual EN**: rozszerzamy "do not" → "don't", "it is" → "it's".
**Academic EN**: odwrotnie — "don't" → "do not".
**Direct EN**: bez zmiany.
**PL Casual**: brak skróceń klasycznych, ale "to jest" → "to" w środku zdania.

#### T7. Burstiness rebalancing
Najważniejsza i najtrudniejsza transformacja.

```js
function rebalanceBurstiness(sentences, { target = 0.65, language }) {
  let lengths = sentences.map(wordCount);
  let burst = stdDev(lengths) / mean(lengths);
  let attempts = 0;

  while (burst < target && attempts < 5) {
    // Identyfikuj "monotoniczne" segmenty (3+ zdania o podobnej długości w okolicy 18-24)
    const cluster = findUniformCluster(lengths);
    if (!cluster) break;

    // Wybór akcji: split najdłuższego LUB merge dwóch najkrótszych
    if (cluster.maxLen > 24) {
      sentences = splitLongest(sentences, cluster, language);
    } else if (cluster.minLen < 12) {
      sentences = mergeShortest(sentences, cluster, language);
    }

    lengths = sentences.map(wordCount);
    burst = stdDev(lengths) / mean(lengths);
    attempts++;
  }
  return sentences;
}
```

Splitter dzieli na natural breakpoints (przecinek, średnik, "który/że", "but/and/so"). Nigdy nie łamie w środku frazy nominalnej.

Merger łączy dwa krótkie zdania spójnikiem ("i", "ale", "więc" / "and", "but", "so") lub przecinkiem.

### Style presets (Faza 1)

```js
// style-presets.js
export const STYLE_PRESETS = {
  casual: {
    aggressiveness: 0.7,
    stripClosers: true,
    shortParagraphs: true,
    contractionMode: 'shortened',  // EN: "do not" → "don't"
    targetBurstiness: 0.7,
  },
  academic: {
    aggressiveness: 0.4,
    stripClosers: false,            // academic toleruje "Podsumowując"
    shortParagraphs: false,
    contractionMode: 'expanded',    // EN: "don't" → "do not"
    targetBurstiness: 0.55,
  },
  direct: {                          // email/Slack
    aggressiveness: 0.8,
    stripClosers: true,
    shortParagraphs: true,
    cutFiller: true,                 // tnie zdania ze "warto wspomnieć", "warto zauważyć"
    contractionMode: 'shortened',
    targetBurstiness: 0.75,
    maxParagraphSentences: 2,
  },
};
```

## Burstiness Score — implementacja

```js
// burstiness.js
export function burstiness(text, language = 'auto') {
  const sentences = splitSentences(text, language);
  if (sentences.length < 3) return null; // za mało próbki

  const lengths = sentences.map(s => wordCount(s));
  const mu = mean(lengths);
  const sigma = stdDev(lengths);
  return sigma / mu; // 0.65-0.85 = human, <0.30 = AI
}

export function burstinessLabel(score) {
  if (score === null) return { label: '—', tone: 'muted' };
  if (score < 0.30)   return { label: 'Niska (jak AI)',     tone: 'bad' };
  if (score < 0.50)   return { label: 'Średnia',             tone: 'warn' };
  if (score < 0.85)   return { label: 'Wysoka (naturalna)',  tone: 'good' };
  return { label: 'Bardzo wysoka',                            tone: 'good' };
}
```

UI pokazuje pasek przed/po:
```
Burstiness:  0.21 ━━━━○─────────  0.68
             [Niska — jak AI]   [Wysoka — naturalna]
```

## Diff view — implementacja

Algorytm: **word-level LCS** (Longest Common Subsequence) — bez bibliotek, ~120 linii czystego JS-a (lub `diff` 5KB lib jeśli woli się gotowe; rekomendowany: czysty JS).

```js
// diff.js
export function wordDiff(oldText, newText) {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);
  const lcs = computeLCS(oldWords, newWords);
  return walkLCS(lcs, oldWords, newWords);
  // zwraca: [{type: 'same'|'add'|'del', text}]
}
```

Render w UI: span-y z klasami `.diff-add` (zielony bg), `.diff-del` (czerwony bg, strikethrough), `.diff-same` (neutral).

## Sentence splitter — pułapka PL

Naive `text.split(/[.!?]\s+/)` łamie się w PL na:
- "p." (punkt)
- "np." (na przykład)
- "tzw." (tak zwany)
- "dr", "mgr", "prof." (tytuły)
- "r." (rok)
- "tj.", "itp.", "itd."
- liczbach z kropką dziesiętną

Implementacja: lookahead który wymaga że po `.!?` jest `\s+[A-ZĄĆĘŁŃÓŚŹŻ]` (capital), I poprzedzający token nie jest na liście skrótów.

```js
const PL_ABBR = ['p.', 'np.', 'tzw.', 'dr.', 'mgr.', 'prof.', 'r.', 'tj.', 'itp.', 'itd.', 'ok.', 'ul.', 'św.'];
const EN_ABBR = ['Mr.', 'Mrs.', 'Dr.', 'St.', 'e.g.', 'i.e.', 'etc.', 'vs.', 'Inc.'];
```

## Language detection — minimalna heurystyka

Bez ML. 30 linii kodu:
- Liczymy występowania PL-specyficznych liter `ąćęłńóśźż` w tekście.
- Jeśli >0.5% znaków → PL, inaczej EN.
- Edge case: bardzo krótkie teksty (<50 znaków) → user wybiera ręcznie z dropdown.

## UI — Layout (Faza 1)

```
┌────────────────────────────────────────────────────────────────────┐
│  ◇ FormattedAI         Narzędzia ▼      🌗 [PL] EN                 │
├────────────────────────────────────────────────────────────────────┤
│  Text Humanizer                                                     │
│  Usuń AI-styl z tekstu. Lokalnie, bez wysyłania nigdzie.           │
│                                                                     │
│  ┌─────────────────────────┬─────────────────────────────────────┐ │
│  │ Wklej tekst AI          │ Wynik                                │ │
│  │ [textarea]              │ [textarea readonly + copy button]    │ │
│  │                         │                                      │ │
│  │ Słowa: 412  Znaki: 2890 │ Słowa: 387  Znaki: 2654             │ │
│  └─────────────────────────┴─────────────────────────────────────┘ │
│                                                                     │
│  Język: [Auto ▼]  Styl: [Casual ▼]  [⚡ Quick Sanitize]            │
│                                                                     │
│  Burstiness:  0.21 ━━━━○────────────  ?                            │
│  ↳ po sanitizacji: 0.68 ━━━━━━━━━━━━○──── (Wysoka — naturalna)    │
│                                                                     │
│  ┌─ Diff (kliknij aby pokazać/ukryć) ──────────────────────────┐  │
│  │ W dzisiejszym szybko zmieniającym się świecie, sztuczna     │  │
│  │ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌                │  │
│  │ inteligencja zmienia sposób, w jaki pracujemy.              │  │
│  │ +++++ przekształca +++++                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ FAQ ─────────────────────────────────────────────────────────┐ │
│  │ Czy mój tekst jest wysyłany na serwer?                        │ │
│  │ ⤷ Nie. Wszystko dzieje się w przeglądarce.                   │ │
│  │ Czy ten tekst przejdzie GPTZero/Originality?                  │ │
│  │ ⤷ Quick Sanitize łapie 70% przypadków...                     │ │
│  └────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

W UI Fazy 1 też renderujemy szary, **disabled** przycisk **"Deep Humanizer (Lokalne AI) — wkrótce"** dla fake door testu (Faza 2).

## SCSS — `_tool-shell.scss` reuse

Patrzymy na istniejące narzędzia (formatter, jsminifier) i używamy tych samych zmiennych z `_variables.scss` + `_tool-shell.scss`. Nowych kolorów nie wprowadzamy — paleta zatwierdzona w redesign v3.

## Schema.org

W `<head>` PL i EN:
- **WebApplication** (jak w `js-minifier/index.html`)
- **FAQPage** (3–5 pytań)
- **BreadcrumbList**
- `<link rel="alternate" hreflang>` PL/EN/x-default

## Build pipeline — package.json

```json
"build:text-humanizer": "sass assets/scss/text-humanizer.scss assets/css/text-humanizer.css --style=compressed --no-source-map",
"watch:text-humanizer": "sass assets/scss/text-humanizer.scss assets/css/text-humanizer.css --watch --no-source-map",
```

W `build:css` dopisujemy `&& npm run build:text-humanizer`.
W `build:js` dopisujemy:
```
&& esbuild assets/js/text-humanizer.js --outfile=assets/js/text-humanizer.min.js --bundle --minify --target=es2020 --format=esm
```
W `dev` dopisujemy `& npm run watch:text-humanizer`.

## Sitemap

```xml
<url>
  <loc>https://formattedai.pl/text-humanizer/</loc>
  <lastmod>2026-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://formattedai.pl/en/text-humanizer/</loc>
  <lastmod>2026-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
</url>
```

## Testy fazy 1

`tests/text-humanizer.test.js` — node script (jak `tests/pdf-tool.test.js`):

1. **Sanity**: `sanitize('')` → `''`, nie crashuje.
2. **PL detection**: `detectLang('Czy zagłębić się głębiej?')` → `'pl'`.
3. **Hedge stripping**: `sanitize('W dzisiejszym świecie AI...')` → output bez "W dzisiejszym świecie".
4. **Burstiness up**: `burstiness(input) < burstiness(sanitize(input))` — w 8/10 przypadków.
5. **Em-dash redux**: input z 6 em-dashami → output ma <3.
6. **Tricolon split**: input z "X, Y, and Z" struktura — output ma rozbity tricolon.
7. **Stable diff**: `sanitize(text)` zwraca to samo przy 2× wywołaniu (deterministyczne hashy synonimów).
8. **Smoke EN**: input ChatGPT EN → output bez "delve", "tapestry", "navigate" (jeśli były).
9. **Smoke PL**: input ChatGPT PL → output bez "zagłębić się", "krajobraz", "kompleksowy" (jeśli były).
10. **Performance**: sanitize 5000 znaków <300 ms (CI fail jeśli >1 s).

## Pułapki Fazy 1

- **Halucynacje synonimów**: niektóre PL synonimy mają inne znaczenie ("krajobraz" w sensie ekologicznym ≠ "kontekst"). Walidacja słowników przez native speakera (samego usera) przed merge.
- **Burstiness rebalancing łamie sens**: split zdania może oderwać podmiot od orzeczenia. Rozwiązanie: splittujemy tylko na specyficznych breakpointach (`,` + spójnik + zaimek względny `który/że/by`).
- **Bardzo krótkie teksty (<3 zdania)**: sanitizer ma niewiele co robić. Wyświetlamy info "Tekst zbyt krótki dla pełnej analizy burstiness".
- **Wielokrotne uruchomienie**: każde kolejne `sanitize` na już zhumanizowanym tekście pogarsza jakość. UI musi blokować re-sanitize bez resetu.
- **Słownik pl.json**: brak gotowych zasobów open-source. **MUSI być budowany ręcznie**, kilka godzin researchu (przeglądanie typowych outputów ChatGPT PL).

---

# FAZA 2 — Fake Door Test (Tydzień 2)

## Cel fazy 2
Bez kosztu inżynierskiego sprawdzić, czy użytkownicy chcą trybu "Deep Humanizer". Decyzja go/no-go dla Fazy 3.

## Co dodajemy
W UI Fazy 1 mamy już szary disabled button **"Deep Humanizer (Lokalne AI) — wkrótce"**. W Fazie 2:
1. Robimy go **klikalnym** (ale bez działania).
2. Po kliknięciu: modal z wyjaśnieniem + jedno pytanie "Czy chciałbyś użyć tej funkcji?" + opcjonalnie pole na email do notyfikacji.
3. Klik liczymy **lokalnie w localStorage** + dodajemy event do prostego counter-endpointu (jeśli nie chcemy backendu, można obejść przez `navigator.sendBeacon` na publiczny logger lub po prostu… policzyć ręcznie po jakimś czasie obserwując liczbę osób, które piszą).

### Bez backendu — jak policzyć?
**Opcja A — pasywna**: dodajemy w copy "Funkcja w przygotowaniu — napisz na adam@formattedai.pl jeśli czekasz". Liczymy emaile.
**Opcja B — Plausible/Simple Analytics na 2 tygodnie**: tymczasowo dodajemy lekkie analytics tylko do tego buttona. Po decyzji wyłączamy.
**Opcja C — Self-hosted counter**: prosty endpoint `/api/click-counter` (wymagałby minimalnego backendu — ale projekt nie ma żadnego). Odpada.

**Rekomendacja: A + B na 14 dni.** Po 14 dniach wyłączamy analytics. Jeśli >5% odwiedzających kliknęło → idzie Faza 3.

## Definition of Done dla fazy 2
- [ ] Button "Deep Humanizer" jest klikalny w PL i EN.
- [ ] Modal wyjaśnia: "Pobranie ~900 MB modelu, jednorazowo, działa lokalnie".
- [ ] CTA: "Powiadom mnie gdy będzie gotowe" (mailto link) LUB minimalne analytics.
- [ ] Po 14 dniach decyzja: budujemy Fazę 3 lub porzucamy.

---

# FAZA 3 — Deep Humanizer (WebLLM, 2–3 tygodnie)

## Cel fazy 3
Prawdziwa głęboka humanizacja używająca lokalnego LLM-a + techniki Reverse-Prompting (Extract → Rebuild).

## Wybór modelu

| Model | Rozmiar int4 | PL quality | EN quality | Rekomendacja |
|---|---|---|---|---|
| **Qwen 2.5 1.5B Instruct** | ~900 MB | Dobry | B. dobry | ✅ **Główny** |
| Qwen 2.5 0.5B Instruct | ~350 MB | Słaby | OK | Fallback dla słabych GPU |
| Llama 3.2 1B | ~700 MB | Słaby PL | B. dobry | Tylko EN-mode |
| Phi-3.5 Mini 3.8B | ~2.2 GB | Średni | B. dobry | Power users tylko |
| Gemma 2 2B | ~1.5 GB | Średni | B. dobry | Alternatywa Qwen |

**Decyzja: Qwen 2.5 1.5B Instruct (int4)** jako default.
- Multilingual (29+ języków, w tym PL).
- ~900 MB — duży, ale akceptowalny po informowaniu usera.
- Działa w 2 GB VRAM (większość laptopów ostatnich 4 lat).
- Dostępny w MLC format przez WebLLM od ręki.

Opcjonalnie w UI dropdown: **"Mniejszy model (350 MB, niższa jakość)"** = Qwen 2.5 0.5B.

## Architektura — Web Worker

WebLLM odpalamy w **dedicated worker** żeby UI nie zamarzł podczas inferencji.

```js
// webllm-worker.js (worker)
import { ChatModule } from '@mlc-ai/web-llm';

const chat = new ChatModule();

self.onmessage = async (e) => {
  const { type, payload } = e.data;
  switch (type) {
    case 'init':
      await chat.reload(payload.modelId, undefined, {
        progress_callback: (p) => self.postMessage({ type: 'progress', payload: p })
      });
      self.postMessage({ type: 'ready' });
      break;
    case 'generate':
      const out = await chat.generate(payload.prompt, {
        temperature: payload.temperature ?? 0.85,
        top_p: 0.95,
      });
      self.postMessage({ type: 'result', payload: out });
      break;
  }
};
```

Main thread komunikuje się z worker-em przez `postMessage`.

## Reverse-Prompting — implementacja

### Krok 1: Extract
System prompt **EN**:
```
You are a fact extractor. Read the input text and output ONLY the bare facts as a bulleted list.
Rules:
- One fact per line, prefixed with "- "
- No introductions, no transitions, no summaries
- Strip all rhetorical flourishes
- Keep numbers, names, and technical terms exactly as written
- Output language: same as input
```

System prompt **PL**:
```
Jesteś ekstraktorem faktów. Przeczytaj tekst wejściowy i wypisz TYLKO nagie fakty jako listę punktów.
Zasady:
- Jeden fakt na linię, zaczynający się od "- "
- Bez wstępów, bez ozdobników, bez podsumowań
- Usuń wszystkie retoryczne fillery
- Zachowaj liczby, nazwy własne i terminy techniczne dokładnie
- Język wyjściowy: taki jak wejściowy
```

User prompt: tekst usera.
Output: lista bullet pointów (oczyszczone fakty).

### Krok 2: Rebuild z personą
System prompt EN (Casual):
```
Rewrite the following bullet points as a flowing piece of text in the persona of:
"A tired office worker writing on Slack at 4pm Friday."

Rules:
- Mix short sentences (5-10 words) with longer ones (20-30 words)
- Avoid these AI words: delve, tapestry, navigate, leverage, robust, unprecedented, holistic
- No phrases like "It's important to note", "In today's world", "In conclusion"
- Use occasional contractions ("don't", "it's")
- Don't structure as 3-bullet lists or symmetric paragraphs
- Output ONLY the rewritten text, nothing else
```

Persona dla `casual / academic / direct`:
- **Casual**: "A tired office worker writing on Slack at 4pm Friday" / "Zmęczony pracownik biura piszący na Slacku w piątek o 16"
- **Academic**: "A graduate student writing a thesis section, careful but not flowery" / "Doktorant piszący rozdział pracy — staranny, ale bez ozdobników"
- **Direct**: "A senior engineer writing a one-paragraph email to a busy CEO" / "Senior inżynier piszący jednoakapitowy email do zajętego CEO"

User prompt: bullet points z Kroku 1.
Output: zhumanizowany tekst.

### Walidacja outputu
Po Krok 2 odpalamy automatycznie:
- Burstiness check (musi być >0.55).
- Czy nie ma AI-słówek (lista canary z fazy 1).
- Czy długość outputu jest 0.7–1.3× długości inputu (zabezpieczenie przed halucynacją).

Jeśli walidacja fail → retry z `temperature` +0.1 (max 2 retry).

## UX — Pierwsze uruchomienie

```
┌──────────────────────────────────────────────────────────────┐
│  Aktywuj Deep Humanizer                                       │
│                                                                │
│  Pobranie modelu AI (jednorazowo): ~900 MB                    │
│  Po pobraniu działa **w 100% lokalnie**.                       │
│  Twój tekst nigdy nie opuści przeglądarki.                    │
│                                                                │
│  Wymagania:                                                    │
│  ✓ Chrome 113+ / Edge 113+ / Firefox 121+                     │
│  ✓ WebGPU (większość laptopów po 2021)                        │
│  ✓ ~2 GB wolnego RAM                                           │
│                                                                │
│  Twoja przeglądarka: ✅ Wspierana                              │
│                                                                │
│        [ Anuluj ]    [ Pobierz i aktywuj (900 MB) ]           │
└──────────────────────────────────────────────────────────────┘
```

Po kliknięciu "Pobierz":
```
Pobieram model... 234 MB / 900 MB (26%)
[━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]
Możesz dalej używać Quick Sanitize w międzyczasie.
[ Anuluj pobieranie ]
```

Model trafia do **IndexedDB** (WebLLM robi to natywnie). Przy następnej wizycie ładuje się instant.

## UX — Generacja

```
┌─ Deep Humanizer ─────────────────────────────────────────────┐
│  Wklej tekst...                          Wynik...             │
│  [textarea]                              [pusty]               │
│                                                                │
│  Styl: [Casual ▼]  Persona: [Pracownik biura ▼]  [▶ Humanize] │
│                                                                │
│  Status: 🟢 Model gotowy (Qwen 2.5 1.5B, lokalnie)             │
│                                                                │
│  Generuję... Krok 1/2 (Ekstrakcja faktów) — 14 t/s            │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━]                │
└──────────────────────────────────────────────────────────────┘
```

Status po sukcesie:
- Burstiness: 0.21 → 0.74 ✅
- Czas: 23 s
- Model: Qwen 2.5 1.5B (lokalny)

## Definition of Done dla fazy 3
- [ ] WebLLM zintegrowany przez `@mlc-ai/web-llm`, w worker.
- [ ] Pierwsze pobranie: progress bar, IndexedDB cache, anulowalny.
- [ ] Detekcja WebGPU + komunikat "Twoja przeglądarka nie wspiera" jeśli brak.
- [ ] Reverse-prompting Extract → Rebuild działa dla PL i EN, dla 3 person.
- [ ] Walidacja outputu (burstiness ≥0.55, długość 0.7–1.3×).
- [ ] Auto-retry przy walidacji fail (max 2×).
- [ ] Można anulować generację w trakcie.
- [ ] Deep Humanizer działa offline (po pierwszym pobraniu).
- [ ] Bundle size narzędzia bez modelu: <500 KB JS, <50 KB CSS.

## Pułapki Fazy 3

- **iOS Safari**: WebGPU jest, ale często z ograniczeniami pamięci. Test na iPad M1+. Fallback: pokazać "Aktywuj Deep Humanizer w przeglądarce desktopowej".
- **Quota IndexedDB**: niektóre przeglądarki mają limity per origin. 900 MB może wymagać `navigator.storage.persist()` (PWA-style).
- **Model halucynuje fakty**: extract step może zgubić niuanse, rebuild może wymyślić nowe. Walidacja długościowa nie wystarczy. Rozważyć: pokazać extract output userowi do akceptacji ("Czy te fakty są ok? — TAK/POPRAW/ANULUJ").
- **Token speed**: Qwen 1.5B daje ~10–25 t/s na laptopach M-series, ~5–10 t/s na średnich laptopach Windows. Akapit ~500 tokenów = 30–100 s. UX musi to komunikować (pasek postępu, opcja anulowania).
- **Reverse prompting czasem psuje styl**: persona "tired office worker" może wprowadzić slang. Academic preset musi mieć OSTRO innego personę.
- **Wymagany npm package z dużymi pelfami zależnościami**: `@mlc-ai/web-llm` ciągnie WebAssembly i shadery WGSL. Bundlowanie wymaga uważności (esbuild musi pominąć `external:https://*` jak w avif-converter).

---

# Konwencje projektu (checklist do każdej fazy)

Przy każdym dodawaniu narzędzia trzeba pamiętać:

- [ ] `<html lang="pl">` w PL, `<html lang="en">` w EN.
- [ ] `<link rel="alternate" hreflang="pl|en|x-default">` w obu plikach.
- [ ] Kanonical URL: `https://formattedai.pl/text-humanizer/` PL, `https://formattedai.pl/en/text-humanizer/` EN.
- [ ] Schema.org: WebApplication + FAQPage + BreadcrumbList.
- [ ] Open Graph + Twitter Card.
- [ ] Inline theme-toggle script na dole `<body>` (czyta `localStorage['formattedai-theme']`).
- [ ] Logo SVG inline w navbarze (nie linkowane).
- [ ] Brak emoji w UI/logo. Brak emoji w copy artykułów (ale w copy narzędzia możemy mieć subtle SVG icons).
- [ ] CSS: `_variables.scss` + `_tool-shell.scss` reuse, brak nowych kolorów.
- [ ] Build: `npm run build` przechodzi bez warningów.
- [ ] Sitemap: PL + EN URL dopisane.
- [ ] `narzedzia/index.html` i `en/tools/index.html`: nowy card.
- [ ] `index.html` i `en/index.html`: link na home (lista narzędzi).
- [ ] `llms.txt`: linia o nowym narzędziu.
- [ ] `robots.txt`: bez zmian.
- [ ] Commit po polsku (zgodnie ze skill `commit`).

---

# Roadmapa skondensowana

| Tydzień | Faza | Co | Output |
|---|---|---|---|
| 1 | Faza 1 — Sanitizer | UI, sanitizer, dictionaries, diff, burstiness | `/text-humanizer/` live, działa instant |
| 2 | Faza 2 — Fake door | Klikalny "Deep H." button + zbieranie sygnału | Decyzja go/no-go |
| 3 | Faza 3a — WebLLM int. | Worker, model loader, IndexedDB, UI download | Model się ładuje i odpowiada |
| 4 | Faza 3b — Reverse prompt | Extract+Rebuild, persony, walidacja | Deep Humanizer działa end-to-end |
| 5 | Faza 3c — Polish | Edge cases, testy, performance, dokumentacja | Production-ready |

**Total: 5 tygodni**, z czego 1–2 to twardy MVP, 3–5 to wartość dodana.

---

# Otwarte pytania techniczne (do rozstrzygnięcia w trakcie)

1. **CSP**: czy ostro restrictive CSP (`script-src 'self'`) przeżyje WebLLM (który ładuje WASM)? Test wczesnie w Fazie 3.
2. **Service Worker**: czy potrzebny dla offline? WebLLM cache'uje w IndexedDB, ale assets narzędzia powinny też być offline. Decyzja: SW z cache-first w Fazie 3c.
3. **A/B test ekstraktu**: czy pokazać user-owi pośredni krok (bullet points) do akceptacji? Bezpieczniej tak, ale UX cierpi. Zacząć BEZ akceptacji, dodać jeśli halucynacje będą problemem.
4. **Persona customization**: czy dać user-owi pole "własna persona"? Niska bariera dodania, wysoka wartość dla power users. Dodać w Fazie 3c.
5. **Słownik PL — community**: czy wystawić `dictionaries/pl.json` jako PR-friendly file żeby community dosypywała AI-słówka? Tak — to OSS friendly i daje szansę na Hacker News post.

---

# Następne kroki (do startu po akceptacji planu)

1. **Stworzyć puste pliki** zgodnie z drzewem (`text-humanizer/index.html`, `en/text-humanizer/index.html`, `assets/scss/text-humanizer.scss`, `assets/js/text-humanizer.js` + folder `text-humanizer/`).
2. **Skopiować HTML** z `js-minifier/index.html` jako szablon, podmienić meta + content + układ głównego edytora.
3. **Zbudować słowniki PL/EN** — zebranie 50 AI-fraz, 30 hedgi, 20 closerów per język. Najlepiej w jednym sit-and-think sesji 2–3 h.
4. **Zaimplementować `sentence-splitter.js`** — to fundament wszystkiego, musi działać na PL i EN.
5. **Zaimplementować `burstiness.js`** — niezależny moduł, łatwy do testów.
6. **Zaimplementować `sanitizer.js`** — orkiestruje wszystko.
7. **Diff view + UI** — najwięcej polotu wizualnego.
8. **Testy w `tests/text-humanizer.test.js`** — 10 testów z DoD fazy 1.
9. **Build + smoke test** — uruchomić narzędzie w przeglądarce, ręcznie wkleić 5 próbek z ChatGPT (PL+EN).
10. **Commit + push**, potem decyzja o Fazie 2.

---

**Konkluzja:** plan zachowuje filozofię projektu (zero backendu, 100% client-side), dostarcza realną wartość natychmiast (Faza 1) i pozwala bezpiecznie zwalidować popyt przed inwestycją w Fazę 3. Reverse-Prompting jest kluczowym wyróżnikiem — to nie kolejny humanizer "rephrase this", ale dwustopniowy proces, który realnie burzy fingerprint AI. Plan elastyczny: w każdej fazie można się zatrzymać i mieć działające narzędzie.
