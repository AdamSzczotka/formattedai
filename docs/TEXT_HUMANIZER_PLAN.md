# Text Humanizer — Plan & Research

Data: 2026-05-10
Status: Research — do decyzji architektonicznej
Branch: `feature/text-humanizer`

---

## Cel narzędzia

Narzędzie, które przyjmuje tekst wygenerowany przez AI (ChatGPT, Claude, Gemini) i przekształca go tak, aby:
- Brzmiał jak napisany przez człowieka.
- Przechodził detektory AI (GPTZero, ZeroGPT, Pangram, Originality.ai, Quillbot).
- Zachowywał oryginalne znaczenie i fakty.
- Obsługiwał **wiele języków** (minimum: PL + EN; cel: PL/EN/DE/ES/FR/IT).

Filozofia projektu: **100% client-side, bez backendu, bez kont, bez telemetrii.**

---

## Co wykrywają detektory AI (2026)

Zanim wybierzemy podejście, trzeba wiedzieć przed czym uciekamy. Detektory liczą głównie dwie rzeczy:

### 1. Burstiness (zmienność długości zdań)
- Wzór: `std_dev(długości_zdań) / mean(długości_zdań)`.
- Człowiek: **0.65–0.85** (mieszane krótkie + długie zdania).
- AI: **0.15–0.30** (zdania 18–24 słowa jedno za drugim).
- **To jest najsilniejszy sygnał wykrywalności w 2026 r.** — silniejszy niż em-dashy.

### 2. Perplexity (przewidywalność słów)
- Mierzy ile słów to "oczywisty wybór" dla LLM-a.
- Im niższa perplexity, tym bardziej AI-owy tekst.
- Trudniejsze do oszukania regułami — wymaga prawdziwego rephrasingu.

### 3. Strukturalne fingerprinty (82% postów AI)
- **Hedge openery**: "In today's rapidly evolving landscape...", "W dzisiejszym szybko zmieniającym się świecie..."
- **Tricolony**: trzy równoległe elementy jako fałszywa kompletność.
- **Em-dash connectory**: nadmiar `—` jako retorycznych mostów.
- **Resolution closery**: "In conclusion...", "Podsumowując..."
- **Słownictwo-kanarki**: "delve", "tapestry", "navigate", "leverage", "robust", "zagłębić się", "krajobraz".

### 4. Stylometria
- Jednolitość rytmu (cadence uniformity).
- Brak literówek i nieregularności.
- Idealna gramatyka i interpunkcja.
- Symetryczne wyliczanki (zawsze 3 punkty, zawsze paralelnie).

**Wniosek:** dobry humanizer musi (1) zwiększyć burstiness, (2) zmienić strukturę zdań, (3) wymienić AI-słówka, (4) opcjonalnie wprowadzić ludzkie nieregularności.

---

## Ścieżka A — Rule-based / heurystyki (czysty JS)

### Jak działa
Zestaw regex-ów + słowników + transformacji zdaniowych:
1. **Detekcja AI-fraz** → wymiana ze słownika synonimów.
2. **Łączenie/dzielenie zdań** → losowo splitujemy długie zdania (kropka, średnik) i mergujemy krótkie (przecinek, "i", "oraz") → buduje burstiness.
3. **Em-dash → przecinek/kropka** w 70% przypadków.
4. **Tricolony**: detekcja "X, Y, and Z" → losowo dzieli na "X and Y. Z too." lub "X. Plus Y and Z."
5. **Hedge openery i resolution closery**: wycinamy lub przepisujemy z listy alternatyw.
6. **Skrócenia/rozszerzenia**: "do not" ↔ "don't", "to jest" ↔ "to" (w PL).
7. **Opcjonalnie**: wstawianie subtelnych ludzkich nieregularności (luźniejsza interpunkcja, "no, well, so" w EN).

### Plusy
- **Zero downloadu** modelu — działa od razu, kilka KB JS-a.
- **Idealnie pasuje do filozofii projektu** (tak działa formatter, minifier itd.).
- **Deterministyczne** — łatwe w testowaniu i debugowaniu.
- **Wielojęzyczność = osobny pakiet słowników per język** (PL/EN/DE/...).
- **Działa offline, na każdym urządzeniu**, w każdej przeglądarce.

### Minusy
- **Nie tworzy nowych konstrukcji** — przekształca istniejące, nie pisze nowych.
- Detektory ML mogą rozpoznać znaczki regularnych podstawień jako kolejny pattern.
- Wymaga utrzymania słowników per język (najwięcej pracy w PL — mało gotowych zasobów).
- **Burstiness można podnieść tylko częściowo** — bez prawdziwego rephrasingu wciąż widać AI-owy "skelet".

### Realistyczna jakość
Tekst przechodzi proste detektory (GPTZero), ale top-tier (Pangram, Originality) może go wciąż łapać. **Dobry punkt startowy, słaby ostateczny rezultat.**

### Wielojęzyczność
Świetna — każdy język to osobny `dictionaries/<lang>.json`. Bez ograniczenia rozmiarem.

### Co trzeba zbudować
- `assets/js/humanizer/core.js` — silnik transformacji.
- `assets/js/humanizer/dictionaries/pl.json` + `en.json` — słowniki.
- `assets/js/humanizer/sentence-splitter.js` — dzielenie zdań (PL: trudniejsze przez "p." "np." "tzw.").
- `assets/js/humanizer/burstiness.js` — pomiar i celowe wprowadzanie zmienności.
- UI tab/strona w `narzedzia/text-humanizer/`.

**Stack: vanilla JS, ~30–60 KB minified. Brak zewnętrznych dependencies.**

---

## Ścieżka B — Lokalny LLM przez WebLLM (WebGPU)

### Jak działa
[WebLLM](https://webllm.mlc.ai/) ładuje pełnoprawny LLM (np. **Phi-3.5 Mini 3.8B** lub **Qwen 2.5 1.5B**) do przeglądarki, używa WebGPU do akceleracji. User wpisuje tekst → LLM dostaje prompt typu "Rephrase this text to sound more human, preserve meaning" → output.

### Plusy
- **Najlepsza jakość** rephrasingu spośród opcji client-side.
- Prawdziwie zmienia strukturę zdań — burstiness i perplexity rosną naturalnie.
- **Multijęzyczność za darmo** — Qwen 2.5 wspiera 29+ języków (w tym polski).
- Filozofia projektu zachowana: prywatność absolutna, działa offline po pierwszym pobraniu.

### Minusy
- **Pierwsze pobranie modelu = 1.5–2.5 GB** (Phi-3.5 Mini int4) lub ~600–900 MB (Qwen 2.5 1.5B int4). Niedopuszczalne dla przypadkowego użytkownika narzędzia online.
- **Wymaga WebGPU** — tylko nowoczesne Chrome/Edge/Firefox z włączoną flagą. Brak Safari na iOS w pełnej wersji (w 2026 częściowo; sprawdzić).
- **Pamięć VRAM**: 2 GB minimum dla mini-modeli. Wycina słabsze laptopy i wszystkie telefony.
- **Inferencja kilka–kilkanaście tokenów/s** na cienkim sprzęcie — humanizacja akapitu może trwać 30–90 s.
- **Złożoność UX**: ekran pobierania modelu, progress bar, ostrzeżenia o pamięci, fallback.
- **Bundle size narzędzia**: WebLLM lib ~3–5 MB JS-a (z WebAssembly).

### Realistyczna jakość
Wysoka — porównywalna z komercyjnymi humanizerami (które używają większych modeli serwerowo).

### Wielojęzyczność
Bardzo dobra — Qwen 2.5 i Llama 3.2 wspierają polski natywnie. Multilingual mT5 mniejszy ale słabszy.

### Co trzeba zbudować
- Integracja `@mlc-ai/web-llm` (npm).
- UI z gating-iem: pobierz model (z ostrzeżeniem o rozmiarze) → cache w IndexedDB → użyj.
- Worker w tle (żeby UI nie blokował się przy inferencji).
- Prompt template per język (system prompt po PL/EN/...).
- Fallback dla braku WebGPU (np. komunikat "Twoja przeglądarka nie wspiera").

**Stack: WebLLM + WebGPU + IndexedDB + Web Worker. ~5 MB JS + 0.6–2.5 GB model.**

---

## Ścieżka C — Lokalny mały model przez Transformers.js (WASM/WebGPU)

### Jak działa
[Transformers.js](https://huggingface.co/docs/transformers.js) (Hugging Face) ładuje mały model ONNX. Kandydaci:
- **Qwen 2.5 0.5B Instruct** (~300–500 MB int4/int8) — multijęzyczny.
- **mT5-small** (~300 MB) — multijęzyczny ale słabszy w generacji.
- **DistilGPT2** (~80 MB) — tylko EN, trudno użyć do parafrazy.
- **Qwen3 0.6B ONNX** (~400 MB) — nowszy, lepiej skomprymowany.

### Plusy
- **Mniejszy model = szybsze pobranie** (300–500 MB vs 2 GB).
- **Działa nawet bez WebGPU** (fallback na WASM, wolniejszy ale uniwersalny).
- Kompatybilność szersza niż WebLLM (Safari iOS może działać przez WASM).
- Podejście "pomiędzy" rule-based a pełnym WebLLM.

### Minusy
- **Jakość mniejszych modeli (0.5–0.6B) jest słaba** do parafrazy z zachowaniem znaczenia. W praktyce → halucynacje, gubienie faktów, błędy gramatyczne.
- W polskim mini-modele są szczególnie słabe.
- Wciąż 300–500 MB do pobrania → spora bariera.
- Inferencja na WASM = jeszcze wolniejsza niż WebLLM/WebGPU.

### Realistyczna jakość
**Średnia.** Lepsza niż rule-based dla EN, gorsza dla PL. Może gubić znaczenie. W praktyce często rozczarowuje.

### Wielojęzyczność
Ograniczona dla mini-modeli. Qwen 2.5 0.5B obsługuje 29 języków, ale jakość PL jest słaba.

### Co trzeba zbudować
- Integracja `@huggingface/transformers` (npm).
- Hosting modelu ONNX (CDN HF lub własny — to ~500 MB plików).
- UI z progress barem ładowania.
- Worker do inferencji.

**Stack: Transformers.js + ONNX Runtime Web. ~2 MB JS + 300–500 MB model.**

---

## Ścieżka D — BYOK (Bring Your Own Key) — API zewnętrzne

### Jak działa
User wkleja swój klucz API (OpenAI / Anthropic / Gemini / OpenRouter) → klucz zapisany w `localStorage` → narzędzie woła API z przeglądarki → zwraca rephrase.

### Plusy
- **Najwyższa jakość** rephrasingu (GPT-5, Claude 4.7, Gemini 2.5).
- **Zero kosztu po naszej stronie** — user płaci za swoje requesty.
- **Wielojęzyczność za darmo** — top-tier modele rozumieją wszystko.
- Nie ma backendu — klucz zostaje u usera (localStorage).
- Lekki bundle (kilka KB).

### Minusy
- **Wymaga klucza API** — bariera dla 99% użytkowników (kto ma klucz OpenAI?).
- **Klucz w localStorage to ryzyko**: XSS u nas = leak klucza. Trzeba bardzo dbać o CSP.
- **CORS**: nie wszystkie API pozwalają na browser-side calls. OpenAI ma "dangerously-allow-browser", Anthropic — tak samo. Gemini — tak. OpenRouter — tak. Ale to zawsze otwarcie powierzchni ataku.
- **Filozofia projektu**: nasze tooly są "dla wszystkich, bez wymagań". BYOK łamie tę filozofię.
- Klucz wycieka łatwo: jak ktoś nas zhackuje, mamy odpowiedzialność.

### Realistyczna jakość
**Top-tier.** Lepiej niż wszystkie inne opcje.

### Wielojęzyczność
Doskonała — każdy duży model rozumie 100+ języków.

### Co trzeba zbudować
- UI do wprowadzenia klucza API + wyboru providera.
- Walidacja klucza (test request).
- Wybór modelu w obrębie providera.
- Prompt template z systemem (PL/EN/...).
- Estymacja kosztów per request (live counter tokenów).
- CSP nagłówki + sanitization (klucz API nigdy nie powinien wyciec do logów/error reportów).

**Stack: vanilla JS + fetch. ~10 KB.**

---

## Ścieżka E — Hybryda (rule-based domyślnie + opcjonalny upgrade)

### Jak działa
1. **Domyślnie**: rule-based (Ścieżka A) — działa instant, bez pobrań, dla wszystkich.
2. **"Tryb premium"** (jeden klik): user może włączyć:
   - **Lokalny LLM** (WebLLM, Ścieżka B) — pełna prywatność, jakość wysoka, wymaga pobrania.
   - lub **BYOK API** (Ścieżka D) — najwyższa jakość, wymaga klucza.

UI: przełącznik trybu, ostrzeżenia o wymaganiach, fallback do rule-based.

### Plusy
- **Każdy użytkownik dostaje coś** — rule-based działa od razu.
- **Power-userzy mają opcję upgrade** do prawdziwej jakości.
- **Filozofia projektu zachowana** — żadna opcja nie wymaga backendu.
- Pozwala iterować: najpierw rule-based MVP, potem dodać WebLLM, potem BYOK.

### Minusy
- **Najwięcej kodu** do napisania i utrzymania.
- **UX kompleksowy** — trzeba dobrze wytłumaczyć użytkownikowi różnice.
- Większy bundle (zwłaszcza jeśli WebLLM jest lazy-loaded → trzeba zarządzać code-splittingiem).

### Realistyczna jakość
Zależy od trybu — od średniej (rule-based) do top-tier (BYOK).

### Wielojęzyczność
Dobra dla każdej warstwy.

---

## Porównanie stron skrótowo

| Kryterium | A: Reguły | B: WebLLM | C: Transformers.js | D: BYOK | E: Hybryda |
|---|---|---|---|---|---|
| Pobranie | 0 | 0.6–2.5 GB | 300–500 MB | 0 | 0 (tier 1) |
| Jakość PL | ★★ | ★★★★ | ★★ | ★★★★★ | ★★ → ★★★★★ |
| Jakość EN | ★★★ | ★★★★ | ★★★ | ★★★★★ | ★★★ → ★★★★★ |
| Działa od razu | ✅ | ❌ (download) | ❌ (download) | ❌ (klucz) | ✅ (tier 1) |
| Privacy | ★★★★★ | ★★★★★ | ★★★★★ | ★★★ | ★★★★★ |
| Mobile | ✅ | ❌ (VRAM) | ⚠️ | ✅ | ⚠️ |
| Czas budowy | 1 tydz | 1–2 tyg | 1 tydz | 3–5 dni | 2–3 tyg |
| Filozofia projektu | ★★★★★ | ★★★★ | ★★★★ | ★★ | ★★★★★ |

---

## Rekomendacja

**Iteracyjnie: Ścieżka A → potem ewentualnie Ścieżka E.**

### Faza 1 (MVP): czyste reguły (A)
- 1 tydzień pracy.
- Słowniki PL + EN na start.
- Algorytm wymiany AI-fraz + dzielenia/łączenia zdań pod burstiness.
- Wynik: użyteczny dla 70% przypadków, działa wszędzie, zero pobrań.

### Faza 2 (po MVP, jeśli ma sens): hybryda (E)
- Dodajemy WebLLM jako "pro mode" za przełącznikiem.
- Gating: ostrzeżenie o pobraniu 1.5 GB, IndexedDB cache, dialog "tylko desktop z WebGPU".
- Opcjonalnie BYOK jako trzeci poziom.

### Dlaczego nie Ścieżka B/C/D od razu
- **B (WebLLM)**: 1.5 GB pobrania to anti-pattern dla statycznego narzędzia. Większość userów nie poczeka.
- **C (Transformers.js mini)**: jakość PL jest realnie słaba. Dostarczy gorszy efekt niż dobre reguły.
- **D (BYOK)**: 99% użytkowników nie ma klucza API. Niszowe.
- **A (Reguły)**: pasuje 1:1 do reszty projektu (formatter, minifier — wszystko regułowe).

---

## Otwarte pytania do decyzji

1. **Języki na start**: tylko PL+EN, czy od razu DE/ES/FR/IT?
2. **Tryby**: jeden globalny "humanize", czy wybór intensywności (lekki/średni/agresywny)?
3. **Diff view**: pokazujemy oryginał vs zhumanizowany side-by-side?
4. **Style preset**: "casual", "academic", "corporate", "blog" — różne reguły per styl?
5. **Detektor wbudowany**: czy dodać wewnętrzny score burstiness/perplexity, żeby user widział "AI score: 87% → 23%"?
6. **Gdzie URL**: `narzedzia/text-humanizer/` czy `text-humanizer/`? (Konwencja: nowe narzędzia idą do `narzedzia/`).
7. **Faza 2 (WebLLM)**: budujemy ją w ogóle, czy wystarczy reguły + ewentualnie BYOK?

---

## Risks i pułapki

- **Polskie słowniki AI-fraz**: brak gotowych zasobów open-source. Trzeba ręcznie zebrać 100–200 fraz typu "warto zauważyć", "w dzisiejszym świecie", "kluczowe znaczenie". Praca researchersko-redakcyjna.
- **Sentence splitter dla PL**: skróty ("p.", "np.", "tzw.", "dr", "r.") łamią naive split-by-period. Potrzebny lepszy splitter (lista skrótów lub lib jak `compromise` — ale ona ma kiepskie PL).
- **Burstiness vs sens**: agresywne dzielenie zdań może łamać znaczenie. Trzeba walidatora.
- **Detektory ewoluują**: to co dziś przejdzie GPTZero, jutro nie przejdzie Pangrama. Plan musi być iteracyjny.
- **Etyka**: narzędzie do "obejścia detektorów AI" jest na granicy. Warto w copy podkreślić: "popraw styl tekstu", "przepisz dla naturalności", a nie "oszukaj detektor".

---

## Źródła (research)

- [WebLLM GitHub](https://github.com/mlc-ai/web-llm) — silnik LLM w przeglądarce na WebGPU.
- [WebLLM Docs](https://webllm.mlc.ai/docs/) — modele, API, OpenAI compat.
- [Transformers.js](https://huggingface.co/docs/transformers.js/en/index) — ONNX models w przeglądarce.
- [Bloomberry Research: Sentence-Level AI Patterns](https://www.bloomberry.ai/research/how-ai-detects-your-writing) — 4 strukturalne fingerprinty 82% tekstów AI.
- [Quillbot: Burstiness & Perplexity](https://quillbot.com/blog/ai-writing-tools/burstiness-and-perplexity/) — definicje metryk detekcji.
- [Sean Goedecke: Why AI uses em-dashes](https://www.seangoedecke.com/em-dashes/) — em-dash to słaby sygnał, nie skupiać się.
- [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) — kompendium AI-stylistic markers.
- [Qwen 2.5 0.5B Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct) — najmniejszy multijęzyczny LLM (29+ języków).
- [Cleverhumanizer: How AI Humanizer Works](https://cleverhumanizer.ai/how-does-ai-humanizer-work) — porównanie rule-based vs LLM-based humanizerów.
