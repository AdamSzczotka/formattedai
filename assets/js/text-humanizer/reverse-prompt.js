import { getPersona, getRebuildRules } from './style-presets.js';

const EXTRACT_SYSTEM_EN = `You extract facts from text into a plain bullet list.

OUTPUT FORMAT — non-negotiable:
- Start your FIRST line with "- " (dash space)
- Every line is one fact
- NO opening words like "Here are", "Below is", "The following"
- NO closing summary
- NO numbered lists, NO headings, NO explanatory paragraphs

CONTENT:
- Strip AI fluff: no "it's important to note", "in today's world", "delve", "tapestry"
- Keep numbers, names, dates, quotes exactly as written
- If the input is a narrative (story, dialog), extract scene-level facts (who, what, where, what happened) — keep them concrete
- Same language as input
- 5–25 bullets total, never zero`;

const EXTRACT_SYSTEM_PL = `Wyciągasz fakty z tekstu jako prostą listę punktów.

FORMAT WYJŚCIA — bezwzględny:
- Pierwsza linia ZACZYNA SIĘ od "- " (myślnik + spacja)
- Każda linia to jeden fakt
- ŻADNYCH słów wstępnych typu "Oto", "Poniżej", "Następujące"
- ŻADNEGO podsumowania na końcu
- ŻADNYCH numerowanych list, nagłówków, akapitów wyjaśniających

TREŚĆ:
- Wytnij AI-bełkot: nie pisz "warto zauważyć", "w dzisiejszym świecie", "zagłębiać się"
- Zachowaj liczby, nazwy, daty, cytaty dokładnie
- Jeśli wejście to opowiadanie/dialog — wyciągnij fakty na poziomie sceny (kto, co, gdzie, co się stało) — konkretne
- Ten sam język co wejście
- 5–25 punktów łącznie, nigdy zero`;

function buildRebuildSystem(lang, preset, customPersona) {
  const persona = customPersona || getPersona(lang, preset);
  const rules = getRebuildRules(lang);
  const avoidWords = rules.avoidWords.join(', ');
  const avoidPhrases = rules.avoidPhrases.map(p => `"${p}"`).join(', ');

  if (lang === 'pl') {
    return `Przepisz poniższe punkty jako spójny tekst w roli osoby:
"${persona}"

Twarde zasady:
- Mieszaj krótkie zdania (5–10 słów) z dłuższymi (20–30 słów). To kluczowe.
- NIE używaj tych słów: ${avoidWords}
- NIE używaj fraz typu: ${avoidPhrases}
- Bez wstępów typu "W dzisiejszym świecie", bez podsumowań typu "Podsumowując"
- Bez tricolonów (trzech równoległych elementów oddzielonych przecinkami)
- Bez nadmiaru myślników (—)
- Pisz po polsku, naturalnie, jak człowiek
- Zachowaj wszystkie fakty z punktów
- Wypisz TYLKO przepisany tekst, nic więcej`;
  }

  return `Rewrite the following bullet points as a flowing piece of text in the persona of:
"${persona}"

Hard rules:
- Mix short sentences (5–10 words) with longer ones (20–30 words). This is critical.
- DO NOT use these words: ${avoidWords}
- DO NOT use phrases like: ${avoidPhrases}
- No openers like "In today's world", no closers like "In conclusion"
- No tricolons (three parallel comma-separated items)
- No excessive em-dashes (—)
- Write naturally, like a real human
- Preserve all facts from the bullet points
- Output ONLY the rewritten text, nothing else`;
}

export function buildExtractMessages(text, lang) {
  return [
    { role: 'system', content: lang === 'pl' ? EXTRACT_SYSTEM_PL : EXTRACT_SYSTEM_EN },
    { role: 'user', content: text },
  ];
}

export function buildRebuildMessages(bullets, lang, preset, customPersona) {
  return [
    { role: 'system', content: buildRebuildSystem(lang, preset, customPersona) },
    { role: 'user', content: bullets },
  ];
}

export function validateExtractOutput(output) {
  if (!output || typeof output !== 'string') return false;
  const trimmed = output.trim();
  if (trimmed.length < 20) return false;
  const lines = trimmed.split('\n').filter(l => l.trim());
  if (lines.length < 1) return false;
  const bulletLines = lines.filter(l => /^[-*•]\s/.test(l.trim()));
  if (bulletLines.length >= 2) return true;
  return trimmed.length > 80;
}

export function validateRebuildOutput(output, originalText) {
  if (!output || typeof output !== 'string') return { valid: false, reason: 'empty' };
  const trimmed = output.trim();
  if (trimmed.length < 40) return { valid: false, reason: 'too_short' };

  const ratio = trimmed.length / originalText.length;
  if (ratio < 0.2) return { valid: false, reason: 'output_truncated', ratio };
  if (ratio > 3.0) return { valid: false, reason: 'output_bloated', ratio };

  const bulletCount = trimmed.split('\n').filter(l => /^[-*•]\s/.test(l.trim())).length;
  if (bulletCount > 5 && bulletCount / trimmed.split('\n').filter(Boolean).length > 0.7) {
    return { valid: false, reason: 'still_bullet_list', bullets: bulletCount };
  }

  return { valid: true };
}

export function shouldSkipExtract(text) {
  return text.length > 4000;
}

export function getDevModeLog(extractOutput, rebuildOutput) {
  return {
    timestamp: new Date().toISOString(),
    extract: extractOutput,
    rebuild: rebuildOutput,
  };
}
