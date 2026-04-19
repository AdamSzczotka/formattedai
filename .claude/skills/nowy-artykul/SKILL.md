---
name: nowy-artykul
description: Tworzy pelna strukture nowego artykulu blogowego (PL+EN, Schema.org, sitemap, listingi, prompty do grafik)
argument-hint: "<temat artykulu> lub pusty, zeby zapytac"
---

Utworz nowy artykul blogowy na `formattedai.pl` — PL + EN w jednym ciagu, ze zgodnoscia z istniejacymi wzorcami projektu.

Argumenty: `$ARGUMENTS`

## Krok 0 — Brief od uzytkownika

Jesli uzytkownik nie podal tematu, zapytaj o:

1. **Temat** (1 zdanie, problem ktory artykul rozwiazuje)
2. **Narzedzie-target** — ktore nasze narzedzie promuje ten artykul? (`formatter`, `avif`, `pdf`, `html-to-pdf`, `js-minifier`, `css-minifier`, `seo-geo`)
3. **Slug** — krotki, bez polskich znakow, lowercase, myslniki (np. `markdown-tabele-w-wordzie`). Ten sam slug dla PL i EN.
4. **Keywords PL** (6-10) — long-tail, pod wyszukiwania typu "jak...", "darmowy...", "bez rejestracji..."
5. **Keywords EN** (6-10) — odpowiednik po angielsku
6. **Czas czytania** (szacunek w minutach)

Po zebraniu briefu **podsumuj** i **zapytaj o akceptacje** przed rozpoczeciem pracy.

## Krok 1 — Gałąź robocza

1. `git checkout develop && git pull origin develop`
2. Ustal numer artykulu: policz katalogi w `articles/` (pomijajac `index.html`, `data/`). Kolejny numer = N.
3. `git checkout -b feature/article-<N>-<slug>`

## Krok 2 — Czytaj wzorzec

**Nie zaczynaj od zera.** Przeczytaj ostatni artykul jako wzor struktury HTML:

- `articles/chatgpt-formatowanie-google-docs/index.html` — wzorzec PL canonical
- `en/articles/chatgpt-formatowanie-google-docs/index.html` — wzorzec EN canonical
- `articles/chatgpt-formatowanie-google-docs/article-draft.md` — wzorzec draftu

Skopiuj strukture, podmien tresc. **Zachowaj wszystkie**: meta tagi, hreflang, OG, Twitter, Schema.org (Article + BreadcrumbList + FAQPage), navbar, footer, style inline, skrypt theme toggle + reading progress.

## Krok 3 — Draft

Utworz `articles/<slug>/article-draft.md` wg szablonu z artykulu #4. Sekcje:

1. **Metadane** — slug PL/EN, data (YYYY-MM-DD = dzisiaj), autor (Adam Szczotka), czas czytania, narzedzie
2. **SEO PL** — title (max 60 znakow, z sufiksem ` | FormattedAI`), meta description (max 160 znakow), keywords
3. **SEO EN** — to samo po angielsku
4. **TEKST PL** (1500-2500 slow)
5. **TEKST EN** (ta sama struktura co PL, nie-literalne tlumaczenie)
6. **PROMPTY DO GRAFIK** — 3 sztuki (hero, before-after / comparison, workflow)

### Struktura tekstu (wzor artykulu #4)

- `## Problem, ktory znasz za dobrze` — wciagajace otwarcie, konkretny scenariusz
- **Tip box** "Kluczowy fakt" (`.article-tip`) — statystyka / dane
- **TL;DR box** (`.article-tldr`) — dla tych bez czasu + CTA button
- `## Kogo to dotyczy?` — lista person z pogrubieniami
- **IMAGE: before/after** — `.article-compare` z kartami
- `## Jak to naprawic w 3 krokach?` — `.article-steps` numerowane
- **IMAGE: workflow**
- `## Co obsluguje <narzedzie>?` — lista funkcji + tip box technical
- `## Dlaczego nie <oczywiste rozwiazanie>?` — anti-pattern lista
- `## Prywatnosc` — obowiazkowa sekcja, architektura client-side
- `## Podsumowanie` — krotko, z CTA do narzedzia
- `## FAQ` — 4 pytania, wrzucone rowniez do Schema.org FAQPage

## Krok 4 — HTML PL + EN

Utworz `articles/<slug>/index.html`:

- `<html lang="pl">`
- `<title>{{title PL}} - FormattedAI`
- Canonical: `https://formattedai.pl/articles/<slug>/`
- Hreflang: pl → root `/articles/<slug>/`, en → `/en/articles/<slug>/`, x-default → PL
- OG locale `pl`, OG image → `images/article_<N>_hero.jpg` (pelen URL z https://formattedai.pl)
- **Schema.org Article** — `inLanguage: "pl"`, `datePublished`, `author`, `publisher`
- **Schema.org BreadcrumbList** — Home → Artykuly → {{title skrocony}}
- **Schema.org FAQPage** — 4 pytania z sekcji FAQ (PL!)
- `<link rel="stylesheet" href="../../assets/css/articles.css">`
- Inline `<style>.lang-en { display: none !important; }</style>`
- Navbar PL (linki `/`, `/articles/`, `/about/`, `EN` → `https://formattedai.pl/en/articles/<slug>/`)
- Reading progress bar
- Article header z tytulem PL i EN (klasy lang-*)
- Article body PL (`<article class="article-body lang-pl">`)
- Article body EN (`<article class="article-body lang-en">`)
- Article CTA z dwoma tytulami (lang-pl/lang-en) — button do `/<narzedzie>/`
- Footer PL + inline script (theme toggle + reading progress)

Utworz `en/articles/<slug>/index.html`:

- Kopia PL-owego z **zamienionymi** inline-styles: `<style>.lang-pl { display: none !important; }</style>`
- `<html lang="en">`
- Canonical: `/en/articles/<slug>/`
- OG locale `en`
- Schema.org Article `inLanguage: "en"`, URL `/en/`, BreadcrumbList z nazwami EN (Articles)
- FAQPage **po angielsku** (pytania i odpowiedzi EN)
- Navbar EN (linki `/en/`, `/en/articles/`, `/en/about/`, `PL` → root)
- Footer EN
- CSS/favicon paths: `../../assets/css/articles.css`, `../../assets/favicon.svg`

## Krok 5 — Grafiki (prompty + pliki)

Utworz katalog `articles/<slug>/images/`. Dopisz do drafta 3 prompty do generatora obrazkow (Midjourney/DALL-E) wg stylu bazowego z artykulu #4:

- **Styl bazowy**: dark bg `#08080c`, akcenty purple `#7c6cf0` / `#a78bfa` / `#6c5ce7`, glass morphism, circuit traces, neon glow, futuristic tech-premium, no text overlays.
- **Image 1**: `article_<N>_hero.jpg` + `.avif`, 1200x630
- **Image 2**: `article_<N>_before_after.jpg` + `.avif`, 1200x600
- **Image 3**: `article_<N>_workflow.jpg` + `.avif`, 1200x500

**Nie generuj plikow obrazkow** — to manualna robota uzytkownika. W drafcie podaj dokladne prompty i rozmiary.

## Krok 6 — Listing PL

W `articles/index.html`:

1. Zwieksz licznik: `<span class="articles-list__count">N artykulow</span>` (uwaga na odmiane: 1 artykul, 2-4 artykuly, 5+ artykulow).
2. Dodaj nowa karte **na samej gorze** `.articles-list__grid` (najnowsze pierwsze). Skopiuj strukture `.article-card` z istniejacej karty.
3. W karcie: unikalny SVG icon (dopasowany do tematu), tag (np. `Formatter`, `PDF`, `GEO`, `AVIF` — klasy `article-card__tag--live`), tytul PL, opis PL (1-2 zdania), data publikacji, czas czytania.

## Krok 7 — Listing EN

W `en/articles/index.html` — to samo co wyzej, ale:

- Licznik: `N articles`
- Tytul + opis po angielsku
- Czas czytania: `5 min read`
- Link: `/en/articles/<slug>/`

## Krok 8 — Sitemap

W `sitemap.xml` dodaj **dwa nowe wpisy** (PL + EN), wzorujac sie na `/articles/chatgpt-formatowanie-google-docs/`:

```xml
<url>
  <loc>https://formattedai.pl/articles/<slug>/</loc>
  <lastmod>YYYY-MM-DD</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.6</priority>
</url>
```

EN: `https://formattedai.pl/en/articles/<slug>/`, priority `0.5`.

Zaktualizuj takze `<lastmod>` dla `/articles/` i `/en/articles/` (listingi) oraz `/` i `/en/` na date publikacji.

## Krok 9 — Weryfikacja

Przed commitem sprawdz:

- [ ] `articles/<slug>/index.html` ma **odwrotny** inline-style niz `en/articles/<slug>/index.html`
- [ ] Wszystkie linki hreflang (pl/en/x-default) sa w obu plikach
- [ ] Schema.org FAQPage w PL = po polsku, w EN = po angielsku
- [ ] Breadcrumb w EN uzywa `"Articles"`, PL `"Artykuly"`
- [ ] Wszystkie 3 `<picture>` (hero, before-after, workflow) maja `loading="eager"` dla hero, `loading="lazy"` dla reszty
- [ ] OG image = pelen URL (https://formattedai.pl/...) w obu plikach
- [ ] Navbar aktualnej strony ma klase `navbar__link--active` na "Artykuly"/"Articles"
- [ ] Numer kolejny `article_<N>_*.jpg` — N zgodne z drafta
- [ ] Licznik artykulow na listingach zwiekszony
- [ ] Polskie znaki uzyte **tylko w tresci** (nie w slug, nie w nazwach plikow)

## Krok 10 — Raport dla uzytkownika

Po stworzeniu wszystkich plikow:

1. Wyswietl liste utworzonych plikow z sciezkami
2. Przekaz **3 prompty do grafik** gotowe do wklejenia w Midjourney/DALL-E
3. Powiedz co musi zrobic uzytkownik manualnie:
   - wygenerowac 3 grafiki, zapisac jako `article_<N>_{hero,before_after,workflow}.jpg` w `articles/<slug>/images/`
   - skonwertowac do `.avif` (np. wlasnym narzedziem `/avif/` albo `cwebp`/`squoosh`)
   - przejrzec tresc drafta
4. **Nie commituj automatycznie** — poczekaj az uzytkownik potwierdzi graficzne assety i jakosc tekstu.

## WAŻNE

- Wszystkie komunikaty do uzytkownika **po polsku**.
- Nie modyfikuj `templates/` — to szablony historyczne, nie zrodlo artykulow.
- Jesli cos nie pasuje do istniejacej konwencji (np. inna struktura Schema.org, inne klasy CSS) — **zatrzymaj sie i zapytaj**, zamiast improwizowac.
- Draft powinien byc **napisany po polsku natywnie** (nie tlumaczony z angielskiego) — ton konwersacyjny, konkretne przyklady, bez korporacyjnego zargonu.
- Tresc EN to **rownoleglosc, nie translacja** — moze uzyc innych idiomow, tych samych przykladow.
- **Nie oferuj pisania CSS ani JS** — articles.css obsluguje cala stylistyke, nie dotykamy go.
