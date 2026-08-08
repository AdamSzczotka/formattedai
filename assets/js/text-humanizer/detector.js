// Text Humanizer — AI tell detector.
//
// Scans text and returns a flat list of "issues" (AI stylistic tells) with
// character offsets into the ORIGINAL text, plus a suggested replacement for
// each. This is the honest, always-safe core of the tool: it diagnoses rather
// than blindly rewrites. Applying issues is opt-in and user-driven.

import { splitSentences } from './sentence-splitter.js';
import { detectLanguage } from './language-detect.js';
import { burstiness } from './burstiness.js';
import plDict from './dictionaries/pl.json' with { type: 'json' };
import enDict from './dictionaries/en.json' with { type: 'json' };

const DICTS = { pl: plDict, en: enDict };

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(arr, seed) {
  if (!arr.length) return null;
  return arr[seed % arr.length];
}

// Unicode-aware word boundary — JS \b is ASCII-only and breaks on Polish
// diacritics (ł, ą, ć…), silently missing canary words. Lookarounds on
// \p{L}\p{N} give a correct boundary in both languages.
function wordRegex(word) {
  return new RegExp('(?<![\\p{L}\\p{N}])' + esc(word) + '(?![\\p{L}\\p{N}])', 'giu');
}

function compileList(patterns, flags = 'i') {
  return patterns.map(p => new RegExp(p, flags));
}

// Locate each sentence's offset span in the original text. splitSentences
// returns trimmed sentences whose content still appears verbatim, so a moving
// cursor + indexOf recovers offsets even with repeated sentences.
function sentenceSpans(text, lang) {
  const spans = [];
  let cursor = 0;
  for (const s of splitSentences(text, lang)) {
    const idx = text.indexOf(s, cursor);
    if (idx === -1) continue;
    spans.push({ text: s, start: idx, end: idx + s.length });
    cursor = idx + s.length;
  }
  return spans;
}

function tricolonReplacement(a, b, c, isPL, seed) {
  const A = a.trim(), B = b.trim(), C = c.trim();
  const r = seed % 100;
  if (r < 50) return isPL ? `${A} i ${B}. Do tego ${C}` : `${A} and ${B}. Plus ${C}`;
  if (r < 80) return isPL ? `${A}. ${cap(B)}. ${cap(C)} też.` : `${A}. ${cap(B)}. ${cap(C)} too.`;
  return null; // leave unchanged
}

const TRICOLON_RE = /([^,]{3,40}),\s+([^,]{3,40}),\s+(?:and|or|i|oraz|lub|a także)\s+([^.!?,]{3,60})/i;

// Mid-sentence em/en dash used as a rhetorical bridge. Lookarounds keep the
// surrounding non-space chars out of the match (so consecutive dashes are all
// caught) and skip line-start dialogue dashes (newline is whitespace).
const DASH_RE = /(?<=\S)([ \t]*)([—–])([ \t]*)(?=\S)/gu;

function makeIssue(category, severity, start, end, original, replacement, extra = {}) {
  return {
    id: `${category}-${start}-${end}`,
    category,
    severity,
    start,
    end,
    original,
    replacement,
    capitalizeAfter: false,
    safe: false,
    ...extra,
  };
}

function detectCanary(text, dict, issues) {
  for (const [word, synonyms] of Object.entries(dict.canary_words)) {
    const cands = synonyms.filter(Boolean);
    if (!cands.length) continue;
    for (const m of text.matchAll(wordRegex(word))) {
      const original = m[0];
      const start = m.index;
      const seed = hashString(original + start);
      let repl = pick(cands, seed);
      if (original[0] === original[0].toUpperCase()) repl = cap(repl);
      issues.push(makeIssue('canary', 'warn', start, start + original.length, original, repl));
    }
  }
}

function detectSentencePrefix(spans, compiled, category, issues) {
  for (const span of spans) {
    for (const r of compiled) {
      const m = span.text.match(r);
      if (m && m.index === 0) {
        const opener = m[0];
        issues.push(makeIssue(
          category, 'warn',
          span.start, span.start + opener.length,
          opener, '',
          { capitalizeAfter: true }
        ));
        break; // one opener per sentence
      }
    }
  }
}

function detectFiller(text, dict, issues) {
  // Filler is NOT auto-safe: many filler phrases double as sentence-initial
  // hedges ("warto zauważyć, że …"), where removing only the filler leaves a
  // dangling connector. Overlaps with hedge/closer are dropped in detect().
  for (const p of dict.filler_phrases) {
    const re = new RegExp('(?<![\\p{L}])(?:' + p + ')(?![\\p{L}])', 'giu');
    for (const m of text.matchAll(re)) {
      issues.push(makeIssue('filler', 'info', m.index, m.index + m[0].length, m[0], ''));
    }
  }
}

function detectDashes(text, issues) {
  for (const m of text.matchAll(DASH_RE)) {
    const start = m.index;
    const end = start + m[0].length;
    const before = text[start - 1];
    const after = text[end];
    // Numeric range (2020–2024) — not a rhetorical dash.
    if (/\d/.test(before || '') && /\d/.test(after || '')) continue;
    issues.push(makeIssue('emdash', 'info', start, end, m[0], ', ', { safe: true }));
  }
}

function detectTricolons(spans, isPL, issues) {
  for (const span of spans) {
    const m = span.text.match(TRICOLON_RE);
    if (!m) continue;
    const seed = hashString(span.text);
    const repl = tricolonReplacement(m[1], m[2], m[3], isPL, seed);
    if (repl === null) continue;
    const start = span.start + m.index;
    issues.push(makeIssue('tricolon', 'warn', start, start + m[0].length, m[0], repl));
  }
}

export function detect(text, options = {}) {
  const empty = { lang: options.lang || 'pl', issues: [], metrics: null, summary: { total: 0, byCategory: {} } };
  if (!text || !text.trim()) return empty;

  const lang = !options.lang || options.lang === 'auto' ? detectLanguage(text) : options.lang;
  const dict = DICTS[lang] || DICTS.en;
  const spans = sentenceSpans(text, lang);

  const issues = [];
  detectCanary(text, dict, issues);
  detectSentencePrefix(spans, compileList(dict.hedge_openers), 'hedge', issues);
  detectSentencePrefix(spans, compileList(dict.resolution_closers), 'closer', issues);
  detectFiller(text, dict, issues);
  detectDashes(text, issues);
  detectTricolons(spans, lang === 'pl', issues);

  // Sort by position; drop exact-duplicate spans of the same category.
  issues.sort((a, b) => a.start - b.start || b.end - a.end);
  const seen = new Set();
  let deduped = issues.filter(i => {
    const key = `${i.category}:${i.start}:${i.end}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // A filler phrase overlapping a hedge/closer opener is redundant — the opener
  // issue is the better-scoped fix, so suppress the filler.
  const openers = deduped.filter(i => i.category === 'hedge' || i.category === 'closer');
  deduped = deduped.filter(i =>
    i.category !== 'filler' || !openers.some(o => i.start < o.end && i.end > o.start)
  );

  const byCategory = {};
  for (const i of deduped) byCategory[i.category] = (byCategory[i.category] || 0) + 1;

  const b = burstiness(text, lang);
  const metrics = {
    burstiness: b,
    rhythmMonotonous: b !== null && b < 0.35,
    sentenceCount: spans.length,
  };

  return { lang, issues: deduped, metrics, summary: { total: deduped.length, byCategory } };
}

function capFirstLetter(s) {
  return s.replace(/^(\s*)(\p{L})/u, (m, ws, ch) => ws + ch.toUpperCase());
}

function cleanupSpacing(s) {
  return s
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*,/g, ',')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Apply a set of issues to the original text. Offsets always refer to the
// original, so we stitch left-to-right from immutable `text` and skip any
// issue overlapping one already applied.
export function applyIssues(text, issues) {
  if (!issues || !issues.length) return text;

  const sorted = [...issues].sort((a, b) => a.start - b.start || b.end - a.end);
  const chosen = [];
  let lastEnd = -1;
  for (const iss of sorted) {
    if (iss.start < lastEnd) continue; // overlap — skip
    chosen.push(iss);
    lastEnd = iss.end;
  }

  let out = '';
  let cursor = 0;
  let capNext = false;
  for (const iss of chosen) {
    let gap = text.slice(cursor, iss.start);
    // Capitalize the first letter after a removed opener. When the gap has no
    // letter (the next issue is adjacent, e.g. a canary right after a hedge),
    // carry the flag onto that issue's replacement so it isn't left lowercase.
    if (capNext) {
      const capped = capFirstLetter(gap);
      if (capped !== gap) { gap = capped; capNext = false; }
    }
    let repl = iss.replacement;
    if (capNext && repl) {
      const capped = capFirstLetter(repl);
      if (capped !== repl) { repl = capped; capNext = false; }
    }
    out += gap + repl;
    if (iss.capitalizeAfter) capNext = true;
    cursor = iss.end;
  }
  let tail = text.slice(cursor);
  if (capNext) tail = capFirstLetter(tail);
  out += tail;

  return cleanupSpacing(out);
}

export function applyIssue(text, issue) {
  return applyIssues(text, [issue]);
}

// Only the transforms that can't change meaning: em-dash normalization and
// pure filler removal.
export function applySafe(text, issues) {
  return applyIssues(text, issues.filter(i => i.safe));
}
