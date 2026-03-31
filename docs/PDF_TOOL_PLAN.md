# PDF Tool — Plan budowy

Data: 2026-03-31
Status: Zatwierdzony po grill-me session

---

## Scope MVP

4 funkcje w pierwszym wdrożeniu:
1. **Merge** — łączenie wielu PDF w jeden
2. **Split** — wycinanie/ekstrakcja wybranych stron
3. **Compress** — kompresja PDF (recompression obrazków + metadata strip)
4. **Image-to-PDF** — konwersja obrazków do PDF

Faza 2 (po MVP):
- Edycja tekstu / adnotacje
- Crop / przycinanie stron
- Wypełnianie formularzy (AcroForm)
- Advanced mode — odblokowane limity (dla użytkowników z mocnym sprzętem)

---

## Architektura

### Stos technologiczny (100% client-side)

| Biblioteka | Rozmiar | Licencja | Rola |
|---|---|---|---|
| **pdf-lib** | ~370 KB | MIT | Edycja, merge, split, create |
| **pdfjs-dist** | ~400 KB + worker ~600 KB | Apache 2.0 | Render podglądu na canvas |
| **fflate** | ~28 KB | MIT | Generowanie ZIP (split osobno) |

### Struktura plików

```
assets/
  vendor/
    pdf-lib.min.js
    pdf.min.mjs
    pdf.worker.min.mjs
    fflate.min.js
  js/
    pdf.js
    pdf.min.js
  scss/
    pdf.scss
  css/
    pdf.css
pdf/
  index.html
en/pdf/
  index.html
```

### Wzorzec kodu

- Vanilla JS, zero bundlera — spójne z resztą codebase
- Vendor libraries ładowane jako lokalne `<script>` (nie CDN)
- Ciężkie operacje w Web Workerze (nie blokujemy UI)

---

## UX Flow

### Jedna strona, 4 taby

URL: `/pdf/` z hash routing (`#merge`, `#split`, `#compress`, `#img-to-pdf`)

Flow: **Najpierw tab → potem pliki**

### Layout strony

```
[Navbar]
[Hero: tytuł + opis + badge "100% client-side"]
[Tab bar: Merge | Split | Compress | IMG→PDF]
─────────────────────────────────────
[Drop zone — kontekstowa per tab]
[Podgląd / lista plików]
[Opcje per tab]
[Przycisk akcji]
[Wynik: download + statystyki]
─────────────────────────────────────
[Footer]
```

### Drop zone per tab

| Tab | Accept | Multi/Single | Tekst |
|---|---|---|---|
| Merge | `.pdf` | Multi | "Przeciągnij pliki PDF do połączenia" |
| Split | `.pdf` | Single | "Przeciągnij plik PDF do podziału" |
| Compress | `.pdf` | Single | "Przeciągnij plik PDF do kompresji" |
| IMG→PDF | `.jpg,.png,.webp,.avif` | Multi | "Przeciągnij obrazki do konwersji" |

---

## Podgląd PDF (pdfjs-dist)

| Tab | Typ podglądu |
|---|---|
| **Merge** | Miniatura 1. strony każdego PDF + drag & drop kolejności |
| **Split** | Miniatury WSZYSTKICH stron — klikalne do zaznaczania |
| **Compress** | Brak podglądu — rozmiar przed → po + procent |
| **Image-to-pdf** | Natywne `<img>` miniatury + drag & drop kolejności |

Split: lazy render miniaturek (Intersection Observer) przy dużych PDF-ach.

---

## Compress — strategia

3 warstwy kompresji:
1. **Recompression obrazków** — canvas API re-encode jako JPEG
2. **Strip metadanych** — XMP, thumbnails, unused objects
3. **Object streams** — pdf-lib `save({ useObjectStreams: true })`

### Presety

| Preset | Jakość | Oczekiwana redukcja |
|---|---|---|
| Lekka | 85% | ~20-30% |
| Zbalansowana | 65% | ~40-60% |
| Maksymalna | 40% | ~60-80% |

Plus checkbox "Usuń metadane" (domyślnie ON).
Slider jakości (0-100) pod "Zaawansowane".

---

## Output — pobieranie wyników

| Tab | Nazwa pliku | Format |
|---|---|---|
| Merge | `merged.pdf` | Jeden PDF |
| Split (jeden) | `{nazwa}_pages_3-5-7.pdf` | Jeden PDF |
| Split (osobno) | `{nazwa}_split.zip` → `page_1.pdf`, `page_2.pdf`... | ZIP |
| Compress | `{nazwa}_compressed.pdf` | Jeden PDF |
| Image-to-pdf | `images.pdf` | Jeden PDF |

Split: toggle "Pobierz każdą stronę osobno (ZIP)" — domyślnie OFF.

---

## Limity

| Parametr | Limit MVP | Faza 2 (Advanced) |
|---|---|---|
| Max rozmiar pliku | 100 MB | Odblokowany (na odpowiedzialność usera) |
| Max plików merge | 20 | Odblokowany |
| Max stron split (podgląd) | 200 | Odblokowany |
| Max obrazków img-to-pdf | 20 | Odblokowany |
| Web Workers | Tak | Tak |
| Progress bar | Tak | Tak |

---

## Prywatność — komunikacja

3 warstwy, subtelnie:
1. **Badge w hero** — "100% w przeglądarce — Twoje pliki nigdy nie opuszczają urządzenia"
2. **Pod drop zone** — ikona kłódki + "Pliki przetwarzane lokalnie. Zero uploadu na serwer."
3. **Tooltip na przycisku** — "Przetwarzanie wyłącznie w Twojej przeglądarce"

---

## SEO / Sitemap

- PL: `/pdf/` + `/articles/` (przyszły artykuł o PDF tools)
- EN: `/en/pdf/`
- Sitemap: dodać oba URL-e
- Meta tagi + Schema.org (SoftwareApplication) przez SEO & GEO Generator

---

## Ryzyko

| Ryzyko | Poziom | Mitygacja |
|---|---|---|
| pdf-lib nie jest aktywnie utrzymywany | Średni | Monitorować @cantoo/pdf-lib fork i LibPDF |
| Złożone PDF-y mogą się nie edytować | Średni | Testować z różnymi real-world PDF-ami wcześnie |
| Duże pliki zamrażają UI | Niski | Web Workers + progress bar + limity |
| Kompresja nie działa na PDF bez obrazków | Niski | Komunikat "Ten PDF nie zawiera obrazków do kompresji" |
