# Artykul #5 - Draft

## Metadane

- **Slug PL:** `/articles/burstiness-perplexity-detekcja-ai/`
- **Slug EN:** `/en/articles/burstiness-perplexity-detekcja-ai/`
- **Data publikacji:** 2026-08-08
- **Autor:** Adam Szczotka
- **Czas czytania:** 7 min
- **Narzedzie:** Text Humanizer (`/text-humanizer/`)

---

## SEO - wersja PL

- **Title:** Burstiness i perplexity - co naprawde zdradza tekst AI [2026] | FormattedAI
- **Meta description:** Detektory AI nie licza em-dashow. Licza burstiness (zmiennosc dlugosci zdan) i perplexity (przewidywalnosc slow). Wyjasniamy, jak dzialaja i dlaczego podmiana slow ich nie oszuka.
- **Keywords:** burstiness, perplexity, detektor AI, jak dzialaja detektory AI, wykrywanie tekstu AI, GPTZero, Originality.ai, humanizer tekstu, zmiennosc dlugosci zdan, tekst napisany przez AI

## SEO - wersja EN

- **Title:** Burstiness and Perplexity - What Actually Gives Away AI Text [2026] | FormattedAI
- **Meta description:** AI detectors don't count em-dashes. They measure burstiness (sentence-length variation) and perplexity (word predictability). Here's how they work and why swapping words won't fool them.
- **Keywords:** burstiness, perplexity, AI detector, how AI detectors work, AI text detection, GPTZero, Originality.ai, text humanizer, sentence length variation, AI-written text

---

# TEKST PL

## [HERO IMAGE: article_5_hero.jpg]

## Problem, ktory znasz za dobrze

Przepuszczasz tekst przez humanizer. Podmieniasz "zaglebic sie" na "przyjrzec sie", wycinasz kilka myslnikow, zamieniasz "W dzisiejszym swiecie" na cos mniej oczywistego. Wklejasz do GPTZero. I dalej widzisz: **98% AI**.

Frustrujace? Owszem. Ale nie przypadkowe. Wiekszosc poradnikow o "omijaniu detektorow" kaze ci polowac na em-dashe i slowa-wytrychy. Tymczasem detektory w 2026 roku patrza na cos zupelnie innego - na **statystyke calego tekstu**, nie na pojedyncze slowa.

Dwie liczby robia tu najwiecej roboty: **burstiness** (jak bardzo zmienia sie dlugosc twoich zdan) i **perplexity** (jak bardzo przewidywalne sa twoje slowa). Zrozum te dwie metryki, a przestaniesz walczyc z wiatrakami.

---

> **Kluczowy fakt**
>
> Czlowiek pisze z burstiness w okolicach **0.65-0.85** - miesza zdania krotkie i dlugie. Model AI trzyma sie **0.15-0.30** - zdanie za zdaniem po 18-24 slowa. To dzis silniejszy sygnal wykrywalnosci niz jakikolwiek myslnik.

---

> **Nie masz czasu czytac?**
>
> Detektory licza rozklad statystyczny tekstu, nie pojedyncze slowa. Wklej swoj tekst do Text Humanizera - pokaze ci burstiness i wszystkie typowe sygnaly AI, zebys wiedzial, co realnie poprawic (a czego zaden trik nie naprawi).
>
> [BUTTON: Zmierz rytm swojego tekstu →] `/text-humanizer/`

---

## Kogo to dotyczy?

Metryki wykrywalnosci AI dotycza kazdego, kto oddaje tekst tam, gdzie ktos moze go sprawdzic:

- **Studenci i naukowcy** - uczelnie coraz czesciej puszczaja prace przez Turnitin czy GPTZero
- **Copywriterzy i redakcje** - klienci i wydawcy sprawdzaja teksty przez Originality.ai
- **Specjalisci SEO** - chca wiedziec, czy tresc "pachnie AI" i jak brzmi bardziej naturalnie
- **Kazdy, kto pisze z AI** - i chce zrozumiec, dlaczego surowy output modelu widac na kilometr

Wspolny mianownik: wszyscy sadza, ze problem to slownictwo. A problem to **rytm i przewidywalnosc**.

---

## [IMAGE: article_5_before_after.jpg]

## Co licza detektory AI w 2026?

Detektor AI to klasyfikator - model uczony na milionach probek tekstu ludzkiego i maszynowego. Nie szuka slowa "delve" z listy. Liczy cechy statystyczne i pyta: "czy ten rozklad wyglada jak czlowiek, czy jak model?". Trzy rodziny sygnalow wazą najwiecej:

| Sygnal | Co mierzy | Tekst AI | Tekst ludzki |
|---|---|---|---|
| **Burstiness** | zmiennosc dlugosci zdan | niska (rowno) | wysoka (nierowno) |
| **Perplexity** | przewidywalnosc kolejnego slowa | niska (oczywiste) | wyzsza (zaskoczenia) |
| **Fingerprinty** | wstepy, tricolony, klisze | duzo | malo |

Em-dashe, "zaglebic sie" czy "krajobraz" to co najwyzej trzecia kategoria - i najslabsza. Mozesz je wszystkie usunac, a jesli rytm i przewidywalnosc zostana maszynowe, detektor dalej postawi na AI. Dlatego skupianie sie na slownictwie to leczenie objawu, nie przyczyny.

---

## Burstiness - zmiennosc dlugosci zdan

Burstiness to prosta liczba: **odchylenie standardowe dlugosci zdan podzielone przez srednia**. Brzmi technicznie, ale znaczy cos intuicyjnego - jak bardzo twoje zdania roznia sie dlugoscia.

Czlowiek pisze nierowno. Rzuci zdanie na trzy slowa. Potem rozwinie mysl w dlugim, wielokrotnie zlozonym zdaniu, ktore meandruje przez kilka watkow, zanim postawi kropke. Znowu krotko. Ta zmiennosc to naturalny oddech tekstu.

Model AI oddycha inaczej. Domyslnie generuje zdania o podobnej, "wygodnej" dlugosci - najczesciej 18-24 slowa. Akapit za akapitem tego samego rytmu. Dla oka wyglada gladko. Dla detektora to jak metronom - zbyt rowny, zeby byl ludzki.

I tu jest pulapka humanizerow: mozesz podmienic kazde slowo na synonim, a jesli nie ruszysz **struktury zdan**, burstiness sie nie zmieni. Metryka liczy dlugosci, nie slownictwo.

---

## Perplexity - przewidywalnosc slow

Perplexity mierzy, jak bardzo model jest "zaskoczony" twoim tekstem. Niska perplexity znaczy: kazde kolejne slowo jest dokladnie tym, ktorego model by sie spodziewal. Wysoka - tekst skreca tam, gdzie model by nie postawil.

Modele jezykowe z natury generuja tekst o niskiej perplexity, bo wybieraja slowa najbardziej prawdopodobne. "Kluczowe znaczenie ma..." - i model niemal na pewno dopowie "adaptacja" albo "elastycznosc". Czlowiek czesciej wybierze slowo mniej oczywiste, wtraci dygresje, uzyje idiomu spoza schematu.

Perplexity jest trudniejsza do oszukania niz burstiness, bo wymaga prawdziwego przepisania mysli - nie tylko przetasowania zdan. Podmiana synonimu ze slownika czesto wręcz **obniza** naturalnosc, bo wstawia slowo z innego rejestru niz reszta zdania. Detektor to widzi jako kolejny wzorzec, nie jako "ludzki blad".

---

## [IMAGE: article_5_workflow.jpg]

## Dlaczego podmiana slow nie wystarcza?

Tu jest niewygodna prawda o wiekszosci "humanizerow": **podmiana slow ze slownika to dzis osobny, rozpoznawalny sygnal**. Detektory z gornej polki (Pangram, Originality) sa trenowane takze na wyjsciu humanizerow. Uczą sie ich manier: nierowne rejestry, dziwne synonimy, mechaniczne ciecie zdan.

Wyobraz sobie dwa sposoby " humanizacji":

- **Podmiana slow** - "zaglebic sie" → "przyjrzec sie", "krajobraz" → "obszar". Slownictwo sie zmienia, ale zdania maja te sama dlugosc i te sama przewidywalna skladnie. Burstiness i perplexity stoja w miejscu.
- **Przepisanie struktury** - laczysz dwa krotkie zdania, tniesz jedno dlugie na trzy, zmieniasz szyk, dodajesz krotkie wtracenie. Dopiero to rusza metryki, ktore detektor faktycznie liczy.

Zaden dzialajacy w 100% w przegladarce tool nie zagwarantuje ci przejscia przez najlepsze detektory - i uwazaj na kazdy, ktory to obiecuje. Realnie mozesz zdiagnozowac tekst, usunac oczywiste sygnaly AI i **swiadomie przepisac** fragmenty, ktore brzmia maszynowo.

---

## Co realnie mozesz zrobic (i czego nie obiecywac)

Zamiast scigac sie z detektorami, potraktuj je jak lustro. Chcesz wiedziec, gdzie tekst brzmi jak model - i to poprawic recznie, tam gdzie ma sens.

1. **Zmierz, zanim zaczniesz.** Sprawdz burstiness swojego tekstu. Jesli jest ponizej 0.35 - masz maszynowy, rowny rytm i to jest twoj pierwszy problem, nie slownictwo.
2. **Urozmaic rytm zdan.** Polacz dwa krotkie zdania w jedno. Potem obok postaw zdanie na cztery slowa. Celowa nierownosc podnosi burstiness w strone ludzkiej.
3. **Usun oczywiste klisze.** Wstepy typu "W dzisiejszym swiecie", zamkniecia "Podsumowujac", nadmiar myslnikow - to nie zbawi cie przed detektorem, ale poprawia czytelnosc i sa darmowym zyskiem.
4. **Przepisz, nie podmieniaj.** Tam gdzie zdanie brzmi jak model, napisz je od nowa wlasnymi slowami. To jedyne, co realnie rusza perplexity.

Text Humanizer robi krok pierwszy i trzeci za ciebie: skanuje tekst, pokazuje burstiness jako **jeden z sygnalow** (nie jako werdykt) i podswietla wszystkie typowe klisze AT, zebys wiedzial, co poprawic. Kroki drugi i czwarty - urozmaicenie rytmu i przepisanie mysli - zostaja po twojej stronie. I bardzo dobrze: to wlasnie one robia z tekstu twoj tekst.

---

## Prywatnosc - Twoj tekst zostaje u Ciebie

Text Humanizer liczy burstiness i wykrywa sygnaly AI **w 100% w Twojej przegladarce**. To czysty JavaScript - zaden fragment tekstu nie jest wysylany na serwer.

To nie haslo, to architektura. Nie ma backendu, nie ma bazy, nie ma logowania. Swiadomie odrzucilismy model "wyslij tekst do zewnetrznego API" - bo to lamie cala idee prywatnosci. Twoj tekst nigdy nie opuszcza urzadzenia, nawet gdy analizujesz poufny dokument.

---

## Podsumowanie

Detektory AI nie licza em-dashow. Licza burstiness i perplexity - rytm i przewidywalnosc calego tekstu. Dlatego podmiana slownictwa to za malo: metryki, ktore decyduja, zaleza od struktury zdan i toku mysli, a nie od pojedynczych wyrazow.

Najuczciwsze podejscie to nie "omijanie", tylko diagnoza i swiadoma redakcja. Zmierz rytm, usun klisze, przepisz to, co brzmi jak model - i niech tekst zabrzmi jak Ty.

---

> **CTA: Zmierz rytm swojego tekstu**
>
> Text Humanizer pokaze burstiness i wszystkie typowe sygnaly AI w Twoim tekscie. 100% w przegladarce, zero danych na serwerze.
>
> [BUTTON: Otwórz Text Humanizer →] `/text-humanizer/`

---

## FAQ - Najczesciej zadawane pytania

_(Sekcja renderowana jako `<details>`/`<summary>` + FAQ Schema JSON-LD dla Google)_

**Czym rozni sie burstiness od perplexity?**
Burstiness mierzy zmiennosc dlugosci zdan (odchylenie standardowe podzielone przez srednia). Perplexity mierzy przewidywalnosc slow - jak bardzo model jest "zaskoczony" kolejnym wyrazem. Pierwsza dotyczy struktury, druga slownictwa i toku mysli. Detektory patrza na obie.

**Czy wysoki burstiness gwarantuje, ze przejde przez detektor?**
Nie. Burstiness to jeden z sygnalow, nie werdykt. Mozesz miec ludzki rytm, ale niska perplexity albo pelno klisz - i detektor dalej postawi na AI. Dlatego pokazujemy go jako jedna z metryk, a nie jako "wynik AI".

**Czy podmiana slow ze slownika oszuka detektor?**
Zwykle nie, a czesto szkodzi. Detektory z gornej polki sa trenowane na wyjsciu humanizerow i rozpoznaja mechaniczna podmiane synonimow jako osobny wzorzec. Realnie dziala dopiero przepisanie struktury zdan i toku mysli.

**Czy moj tekst jest wysylany na serwer?**
Nie. Text Humanizer liczy burstiness i wykrywa sygnaly AI lokalnie, w czystym JavaScript w Twojej przegladarce. Tekst nigdy nigdzie nie wychodzi - nie mamy backendu ani API, do ktorego cokolwiek trafia.

---
---

# TEKST EN

## [HERO IMAGE: article_5_hero.jpg]

## A Problem You Know Too Well

You run your text through a humanizer. You swap "delve" for "look into," cut a few em-dashes, replace "In today's world" with something less obvious. You paste it into GPTZero. And you still see: **98% AI**.

Frustrating? Sure. But not random. Most "beat the detector" guides tell you to hunt for em-dashes and buzzwords. Meanwhile, detectors in 2026 look at something else entirely - the **statistics of the whole text**, not individual words.

Two numbers do most of the work here: **burstiness** (how much your sentence lengths vary) and **perplexity** (how predictable your words are). Understand these two metrics and you'll stop fighting windmills.

---

> **Key fact**
>
> Humans write with a burstiness around **0.65-0.85** - they mix short and long sentences. An AI model stays at **0.15-0.30** - sentence after sentence of 18-24 words. Today that's a stronger detection signal than any em-dash.

---

> **No time to read?**
>
> Detectors measure the statistical distribution of your text, not single words. Paste your text into Text Humanizer - it shows burstiness and every common AI tell, so you know what to actually fix (and what no trick will fix).
>
> [BUTTON: Measure your text's rhythm →] `/en/text-humanizer/`

---

## Who Does This Affect?

AI detection metrics matter for anyone who hands text somewhere it might get checked:

- **Students and researchers** - universities increasingly run work through Turnitin or GPTZero
- **Copywriters and editors** - clients and publishers check text with Originality.ai
- **SEO specialists** - who want to know whether content "smells like AI" and how to sound more natural
- **Anyone writing with AI** - and wanting to understand why raw model output is visible a mile away

The common thread: everyone assumes the problem is vocabulary. But the problem is **rhythm and predictability**.

---

## [IMAGE: article_5_before_after.jpg]

## What Do AI Detectors Actually Measure in 2026?

An AI detector is a classifier - a model trained on millions of samples of human and machine text. It isn't looking up "delve" on a list. It computes statistical features and asks: "does this distribution look human, or like a model?" Three families of signals weigh the most:

| Signal | What it measures | AI text | Human text |
|---|---|---|---|
| **Burstiness** | sentence-length variation | low (even) | high (uneven) |
| **Perplexity** | next-word predictability | low (obvious) | higher (surprises) |
| **Fingerprints** | openers, tricolons, cliches | many | few |

Em-dashes, "delve," or "tapestry" fall into that third category at best - and the weakest one. You can remove them all, but if rhythm and predictability stay machine-like, the detector still calls it AI. That's why obsessing over vocabulary treats the symptom, not the cause.

---

## Burstiness - Sentence-Length Variation

Burstiness is a simple number: **the standard deviation of sentence lengths divided by the mean**. It sounds technical, but it means something intuitive - how much your sentences differ in length.

Humans write unevenly. They toss out a three-word sentence. Then they develop a thought in a long, multi-clause sentence that meanders through several threads before landing on a period. Then short again. That variation is the natural breathing of text.

An AI model breathes differently. By default it generates sentences of similar, "comfortable" length - most often 18-24 words. Paragraph after paragraph of the same rhythm. To the eye it looks smooth. To a detector it's a metronome - too even to be human.

And here's the humanizer trap: you can swap every word for a synonym, but if you don't touch **sentence structure**, burstiness won't move. The metric counts lengths, not vocabulary.

---

## Perplexity - Word Predictability

Perplexity measures how "surprised" a model is by your text. Low perplexity means: every next word is exactly the one the model would expect. High perplexity means the text turns where the model wouldn't have gone.

Language models naturally produce low-perplexity text, because they pick the most probable words. "The key is..." - and the model will almost certainly add "adaptability" or "flexibility." A human more often picks a less obvious word, throws in a digression, uses an idiom off the beaten path.

Perplexity is harder to fool than burstiness, because it requires genuinely rewriting the thought - not just reshuffling sentences. A dictionary synonym swap often actually **lowers** naturalness, because it drops in a word from a different register than the rest of the sentence. The detector reads that as another pattern, not as a "human quirk."

---

## [IMAGE: article_5_workflow.jpg]

## Why Swapping Words Isn't Enough

Here's the uncomfortable truth about most "humanizers": **dictionary word-swapping is itself a recognizable signal today**. Top-tier detectors (Pangram, Originality) are trained on humanizer output too. They learn its tics: uneven registers, odd synonyms, mechanical sentence-chopping.

Picture two ways to "humanize":

- **Word swapping** - "delve" → "look into," "landscape" → "area." The vocabulary changes, but the sentences keep the same length and the same predictable syntax. Burstiness and perplexity stand still.
- **Structural rewriting** - you merge two short sentences, cut one long one into three, change word order, add a short aside. Only that moves the metrics the detector actually measures.

No tool that runs 100% in the browser can guarantee you'll pass the best detectors - and be wary of any that promises it. Realistically, you can diagnose the text, remove the obvious AI signals, and **deliberately rewrite** the parts that sound machine-made.

---

## What You Can Realistically Do (and What Not to Promise)

Instead of racing the detectors, treat them like a mirror. You want to know where your text sounds like a model - and fix that by hand, where it makes sense.

1. **Measure before you start.** Check your text's burstiness. If it's below 0.35, you have a machine-even rhythm and that's your first problem, not vocabulary.
2. **Vary your sentence rhythm.** Merge two short sentences into one. Then put a four-word sentence right next to it. Deliberate unevenness pushes burstiness toward human.
3. **Cut the obvious cliches.** Openers like "In today's world," closers like "In conclusion," em-dash overuse - they won't save you from a detector, but they improve readability and are a free win.
4. **Rewrite, don't swap.** Where a sentence sounds like a model, write it again in your own words. That's the only thing that genuinely moves perplexity.

Text Humanizer does steps one and three for you: it scans the text, shows burstiness as **one signal** (not a verdict), and highlights every common AI cliche, so you know what to fix. Steps two and four - varying rhythm and rewriting thoughts - stay on your side. And rightly so: those are exactly what make the text yours.

---

## Privacy - Your Text Stays With You

Text Humanizer computes burstiness and detects AI signals **100% in your browser**. It's pure JavaScript - no fragment of text is ever sent to a server.

This isn't a slogan, it's the architecture. No backend, no database, no login. We deliberately rejected the "send text to an external API" model - because it breaks the whole idea of privacy. Your text never leaves your device, even when you analyze a confidential document.

---

## Summary

AI detectors don't count em-dashes. They measure burstiness and perplexity - the rhythm and predictability of the whole text. That's why swapping vocabulary isn't enough: the metrics that decide depend on sentence structure and train of thought, not on individual words.

The most honest approach isn't "beating" anything - it's diagnosis and deliberate editing. Measure the rhythm, cut the cliches, rewrite what sounds like a model - and let the text sound like you.

---

> **CTA: Measure Your Text's Rhythm**
>
> Text Humanizer shows burstiness and every common AI signal in your text. 100% in the browser, zero data on any server.
>
> [BUTTON: Open Text Humanizer →] `/en/text-humanizer/`

---

## FAQ - Frequently Asked Questions

_(Rendered as `<details>`/`<summary>` + FAQ Schema JSON-LD for Google)_

**What's the difference between burstiness and perplexity?**
Burstiness measures sentence-length variation (standard deviation divided by the mean). Perplexity measures word predictability - how "surprised" a model is by the next word. The first is about structure, the second about vocabulary and train of thought. Detectors look at both.

**Does high burstiness guarantee I'll pass a detector?**
No. Burstiness is one signal, not a verdict. You can have a human rhythm but low perplexity or plenty of cliches - and a detector will still call it AI. That's why we show it as one metric, not as an "AI score."

**Will swapping words from a dictionary fool a detector?**
Usually not, and it often hurts. Top-tier detectors are trained on humanizer output and recognize mechanical synonym swaps as a separate pattern. What actually works is rewriting sentence structure and train of thought.

**Is my text sent to a server?**
No. Text Humanizer computes burstiness and detects AI signals locally, in pure JavaScript in your browser. The text never leaves it - we have no backend and no API that anything is sent to.

---
---

# PROMPTY DO GRAFIK (modele AI Google - Imagen / Gemini)

## Styl bazowy (wspolny dla wszystkich)

Kolory brandu FormattedAI:
- Tlo: `#08080c` (near-black)
- Akcent glowny: `#7c6cf0` (purple)
- Akcent jasny: `#a78bfa` (light violet)
- Akcent ciemny: `#6c5ce7` (deep purple)
- Glass morphism: przezroczyste panele z subtelnymi odbiciami
- Detale: circuit board traces, neon glow, particle effects

Styl: futurystyczny, tech-premium, dark mode, glass morphism, minimalistyczny. Bez tekstu na grafice (poza wyraznie wskazanymi etykietami). Wskazowka dla Imagen/Gemini: prompt jest opisowa proza po angielsku, zaczyna sie od typu obrazu i proporcji.

---

## IMAGE 1: Hero

**Plik:** `article_5_hero.jpg` + `article_5_hero.avif`
**Rozmiar:** 1200x630px (16:8.4)

```
A wide 16:9 futuristic digital illustration on a very dark near-black background (#08080c).
Center composition: a large translucent glass panel, tilted slightly in 3D space, displaying
an abstract audio-waveform / bar-chart of text: many vertical bars of very different heights,
representing sentences of varying length. On the left half the bars are highly uneven and
irregular (short, tall, short, very tall) glowing in bright violet (#a78bfa) - labeled subtly
as "human rhythm". On the right half the bars are all nearly the same medium height, flat and
metronome-like, glowing in a dimmer purple (#6c5ce7) - labeled subtly as "AI rhythm".

Behind the panel, faint circuit-board traces and a soft grid. A luminous hexagonal
FormattedAI-style logo mark emits purple light (#7c6cf0). Floating particles and gentle neon
glow. Glass morphism with subtle transparency and reflections. Premium, minimal, tech aesthetic.
No paragraphs of text, only the abstract bars. 16:8.4 aspect ratio.
```

---

## IMAGE 2: Before / After (AI vs ludzki rytm)

**Plik:** `article_5_before_after.jpg` + `article_5_before_after.avif`
**Rozmiar:** 1200x600px (2:1)

```
A clean split-screen infographic on a dark background (#08080c), 2:1 aspect ratio.

LEFT SIDE labeled "AI" at the top in clean white sans-serif text:
A dark glass panel showing five stacked horizontal lines (sentences), all almost exactly the
same length, perfectly aligned like a metronome. A small gauge/meter in the corner points to
a LOW value, glowing dim purple (#6c5ce7). Cool, mechanical, uniform feel.

RIGHT SIDE labeled "HUMAN" at the top in clean white sans-serif text:
A dark glass panel showing five stacked horizontal lines of very different lengths - one very
short, one long, one medium, one very short, one long - visibly irregular. A small gauge/meter
in the corner points to a HIGH value, glowing bright violet (#a78bfa). Lively, organic feel.

Between the two panels, a large glowing purple divider with particle effects (#7c6cf0).
Subtle grid pattern in the background. Modern, minimal, tech aesthetic. Only the labels "AI",
"HUMAN", "LOW", "HIGH" as text. 2:1 aspect ratio.
```

---

## IMAGE 3: Workflow (skaner: zmierz → zdiagnozuj → przepisz)

**Plik:** `article_5_workflow.jpg` + `article_5_workflow.avif`
**Rozmiar:** 1200x500px (12:5)

```
A horizontal 3-step workflow diagram on a dark background (#08080c), 12:5 aspect ratio,
steps connected by glowing purple (#7c6cf0) energy lines with flowing particle effects.

STEP 1 (left): A floating glass panel showing an abstract paragraph of text with a small
magnifying-glass / scanner icon sweeping across it, purple highlight. A "1" badge with purple
glow below. Theme: MEASURE (a small burstiness gauge visible).

STEP 2 (center): A larger floating glass panel showing the same paragraph with several words
and one opener phrase highlighted / underlined in violet, like flagged issues in a list on the
right edge. Sparkle effects. A "2" badge below. Theme: DIAGNOSE (tells highlighted).

STEP 3 (right): A floating glass panel showing the paragraph rewritten - the highlighted parts
replaced, sentence bars now of varied heights (uneven, human). A green checkmark badge and a
"3" badge below. Theme: REWRITE.

Connecting all three: flowing purple energy streams with small glowing dots traveling along the
path. Subtle circuit board traces in the background. Premium tech aesthetic matching the
FormattedAI brand (purple #7c6cf0 / #a78bfa on near-black). Only "1", "2", "3" as text.
12:5 aspect ratio.
```

---

## Podsumowanie plikow graficznych

| Nr | Plik | Rozmiar | Opis |
|----|------|---------|------|
| 1 | `article_5_hero.jpg/.avif` | 1200x630 | Ludzki vs AI rytm zdan - abstrakcyjne slupki |
| 2 | `article_5_before_after.jpg/.avif` | 1200x600 | AI (rowno, low) vs Human (nierowno, high) |
| 3 | `article_5_workflow.jpg/.avif` | 1200x500 | 3 kroki: zmierz → zdiagnozuj → przepisz |
