# CLAUDE.md

Dokumentacja dla Claude Code w repozytorium **FormattedAI** (`formattedai.pl`).

## Czym jest projekt

Statyczny serwis z darmowymi narzędziami webowymi. Zdecydowana większość działa **100% client-side** (bez kont, bez telemetrii). Narzędzia: Markdown Formatter, AVIF/HEIC Converter, JS/CSS Minifier, SEO & GEO Tag Generator, OCR, PDF tools, HTML → PDF, Text Humanizer. Strona dwujęzyczna: **PL (root)** + **EN (`/en/`)**.

Dwa świadome wyjątki serwerowe (`api/`): **HTML → PDF** (Puppeteer/Chromium — wierność renderu) i **SEO meta-fetch** (Express + Cheerio proxy — obejście CORS). Oba z zabezpieczeniami: SSRF-guard z walidacją po DNS-resolve, blokada prywatnych IP, helmet, dwuwarstwowy rate-limit, limity body, timeouty.

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
├── sitemap.xml            # Ręcznie utrzymywany
├── robots.txt
├── llms.txt               # Opis dla LLM-ów
└── .claude/skills/        # Custom skille projektu
```

## Konwencje artykułów

Każdy artykuł to **jeden plik `index.html`** z PL i EN wewnątrz - przełączanie językiem przez klasy `.lang-pl` / `.lang-en` i inline `<style>.lang-en { display: none !important; }</style>` w `<head>` PL-owej wersji (odwrotnie w `/en/`).

Pełen zestaw na artykuł:

- `articles/<slug>/article-draft.md` - draft (meta PL+EN, tekst PL, tekst EN, prompty do grafik)
- `articles/<slug>/index.html` - PL canonical
- `en/articles/<slug>/index.html` - EN canonical
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

Logo: heksagon z checkmarkiem. SVG inline w każdym navbarze - nie wyciągaj do zewnętrznego pliku.

Theme toggle czyta/zapisuje `localStorage['formattedai-theme']` (`light` | `dark`). Każda strona ma ten sam inline-script na dole `<body>`.

## Git flow

- `main` - produkcja
- `develop` - integracja feature'ów
- `feature/<skrot>-<opis>` - gałąź robocza z `develop`
- Merge: `feature/*` → `develop` → `main`

Skille projektowe (`.claude/skills/`) automatyzują flow - komunikaty zawsze po polsku.

## Na co uważać

- **`robots.txt` daje pełny dostęp wszystkim botom AI** (`Allow: /` dla GPTBot, ClaudeBot, anthropic-ai, Google-Extended, OAI-SearchBot, PerplexityBot, CCBot, Bytespider i in. — treningowym i search). To świadoma decyzja: USP projektu to GEO, chcemy być indeksowani i cytowani przez modele AI. Jeśli kiedyś trzeba ograniczyć trening — dopiero wtedy dodać `Disallow` dla konkretnego treningowego bota.
- **Sitemap trzymamy ręcznie** — po dodaniu strony/artykułu wpis trzeba dopisać do `sitemap.xml` (PL + EN).
- **`articles/<slug>/index.html` jest ~600+ linii** — kopiujemy z poprzedniego artykułu i podmieniamy treść.
- **Numeracja artykułów** (`article_N_*.jpg`) — kolejna wolna liczba od ostatniego artykułu. Aktualnie #5 = `burstiness-perplexity-detekcja-ai`.
- **Wspólny SCSS artykułów**: `assets/scss/articles.scss` → `assets/css/articles.css`. Nie twórz osobnego SCSS per artykuł.
- **Emoji**: logo/UI bez emoji, SVG inline. Copy w artykułach - polska/angielska, bez emoji.

## Co NIE jest tu

- Backend „ciężki" (bazy, konta, sesje) — nie ma. Operacje narzędzi są klient-side (WASM, parsery, Marked + DOMPurify, jSquash, JSZip, Terser, CSSO, js-beautify). Wyjątek: dwie mikrousługi w `api/` (HTML → PDF, meta-fetch) — patrz sekcja „Na co uważać".
- Analytics / cookie banner — celowo nie ma.
- CI/CD jest: `.github/workflows/deploy.yml` (push na `main` → `npm ci` → `npm run build` → rsync przez SSH na VPS z nginx; sekrety w `secrets.*`). `workflow_dispatch` pozwala odpalić ręcznie.
