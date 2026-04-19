# CLAUDE.md

Dokumentacja dla Claude Code w repozytorium **FormattedAI** (`formattedai.pl`).

## Czym jest projekt

Statyczny serwis z darmowymi narzędziami webowymi działającymi **100% client-side** (bez backendu, bez kont, bez telemetrii). Narzędzia: Markdown Formatter, AVIF Converter, JS/CSS Minifier, SEO & GEO Tag Generator, PDF tools, HTML → PDF. Strona dwujęzyczna: **PL (root)** + **EN (`/en/`)**.

Stack: vanilla HTML/CSS/JS, SCSS → `sass`, JS → `esbuild`. Brak runtime dependencies, brak frameworka.

## Komendy

```bash
npm install           # zależności dev (sass, esbuild, terser, csso, js-beautify)
npm run build         # pełny build CSS + JS
npm run build:css     # tylko SCSS → CSS (compressed, no sourcemap)
npm run build:js      # tylko JS minify/bundle
npm run dev           # watch wszystkich SCSS-ów równolegle
npm run test:pdf      # test PDF tool
```

Każde narzędzie ma osobny entry SCSS (`assets/scss/<tool>.scss`) i osobny `build:<tool>` / `watch:<tool>`.

## Struktura

```
/                          # PL, root
├── index.html             # Home
├── formatter/ avif/ pdf/ html-to-pdf/
├── js-minifier/ css-minifier/ seo-geo/
├── articles/              # Blog PL
│   ├── index.html         # Listing
│   └── <slug>/
│       ├── index.html     # Artykuł (PL i EN w jednym pliku, klasy lang-pl/lang-en)
│       ├── article-draft.md
│       └── images/        # *.jpg + *.avif
├── about/ privacy/
├── en/                    # EN, lustrzana struktura root
├── assets/
│   ├── scss/ css/ js/ vendor/ screenshots/
│   └── favicon.svg
├── templates/             # Szablony HTML (aktualizowane ręcznie)
├── sitemap.xml            # Ręcznie utrzymywany
├── robots.txt
├── llms.txt               # Opis dla LLM-ów
└── .claude/skills/        # Custom skille projektu
```

## Konwencje artykułów

Każdy artykuł to **jeden plik `index.html`** z PL i EN wewnątrz — przełączanie językiem przez klasy `.lang-pl` / `.lang-en` i inline `<style>.lang-en { display: none !important; }</style>` w `<head>` PL-owej wersji (odwrotnie w `/en/`).

Pełen zestaw na artykuł:

- `articles/<slug>/article-draft.md` — draft (meta PL+EN, tekst PL, tekst EN, prompty do grafik)
- `articles/<slug>/index.html` — PL canonical
- `en/articles/<slug>/index.html` — EN canonical
- `articles/<slug>/images/article_N_<name>.jpg` + `.avif` (3 grafiki: hero, before-after, workflow)
- Wpis w `articles/index.html` (card) + `en/articles/index.html`
- Wpis w `sitemap.xml` (PL + EN, `<lastmod>` = data publikacji)

Obowiązkowy zestaw Schema.org w każdym artykule: **Article** + **BreadcrumbList** + **FAQPage**. Plus: `<link rel="alternate" hreflang>` (pl/en/x-default), Open Graph, Twitter card.

Slug musi być **bez polskich diakrytyków**, lowercase, myślniki zamiast spacji. Ten sam slug dla PL i EN.

## Branding

Kolory (dark-first, glass morphism):
- Tło: `#08080c`
- Akcent główny: `#7c6cf0`
- Akcent jasny: `#a78bfa`
- Akcent ciemny: `#6c5ce7`

Logo: heksagon z checkmarkiem. SVG inline w każdym navbarze — nie wyciągaj do zewnętrznego pliku.

Theme toggle czyta/zapisuje `localStorage['formattedai-theme']` (`light` | `dark`). Każdy template ma ten sam inline-script na dole `<body>`.

## Git flow

- `main` — produkcja
- `develop` — integracja feature'ów
- `feature/<skrot>-<opis>` — gałąź robocza z `develop`
- Merge: `feature/*` → `develop` → `main`

Skille projektowe (`.claude/skills/`) automatyzują flow — komunikaty zawsze po polsku.

## Na co uważać

- **`robots.txt` blokuje trening LLM-ów** (GPTBot, ClaudeBot, anthropic-ai, Google-Extended). AI search bots (OAI-SearchBot, PerplexityBot) są `Allow`. Jeżeli ma być cytowana strona przez Claude/ChatGPT w odpowiedziach — trzeba zdjąć `Disallow` dla search botów odpowiedniego modelu; blokada samego trenowania nie wyklucza cytowania przez search variant.
- **Sitemap trzymamy ręcznie** — po dodaniu strony/artykułu wpis trzeba dopisać do `sitemap.xml` (PL + EN).
- **`articles/<slug>/index.html` jest ~600+ linii** — szablon pochodzi z poprzedniego artykułu, nie z `templates/`. Przy nowym artykule kopiujemy poprzedni i podmieniamy treść.
- **Numeracja artykułów** (`article_N_*.jpg`) — kolejna wolna liczba od ostatniego artykułu. Aktualnie #4 = `chatgpt-formatowanie-google-docs`.
- **Wspólny SCSS artykułów**: `assets/scss/articles.scss` → `assets/css/articles.css`. Nie twórz osobnego SCSS per artykuł.
- **Emoji**: logo/UI bez emoji, SVG inline. Copy w artykułach — polska/angielska, bez emoji.

## Co NIE jest tu

- Backend (żaden) — wszystkie tooling-operacje klient-side (WASM, parsery, Marked + DOMPurify, jSquash, JSZip, Terser, CSSO, js-beautify).
- Analytics / cookie banner — celowo nie ma.
- CI/CD — deploy ręczny przez nginx po stronie serwera.
