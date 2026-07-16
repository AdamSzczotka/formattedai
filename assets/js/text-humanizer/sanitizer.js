import { splitSentences, joinSentences, wordCount } from './sentence-splitter.js';
import { detectLanguage } from './language-detect.js';
import { getPreset } from './style-presets.js';
import plDict from './dictionaries/pl.json' with { type: 'json' };
import enDict from './dictionaries/en.json' with { type: 'json' };

const DICTS = { pl: plDict, en: enDict };

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDeterministic(arr, seed) {
  if (!arr.length) return null;
  const idx = seed % arr.length;
  return arr[idx];
}

function compileRegexList(patterns, flags = 'i') {
  return patterns.map(p => new RegExp(p, flags));
}

function isHedgeOpener(sentence, dict) {
  const compiled = dict._compiled_hedge || (dict._compiled_hedge = compileRegexList(dict.hedge_openers));
  return compiled.some(r => r.test(sentence));
}

function isResolutionCloser(sentence, dict) {
  const compiled = dict._compiled_closer || (dict._compiled_closer = compileRegexList(dict.resolution_closers));
  return compiled.some(r => r.test(sentence));
}

function trimHedgeOpener(sentence, dict) {
  const compiled = dict._compiled_hedge || (dict._compiled_hedge = compileRegexList(dict.hedge_openers));
  for (const r of compiled) {
    if (r.test(sentence)) {
      const trimmed = sentence.replace(r, '').trim();
      if (trimmed.length < sentence.length * 0.5) return null;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }
  }
  return sentence;
}

function replaceCanaryWords(sentence, dict, aggressiveness) {
  const seedBase = hashString(sentence);
  let out = sentence;
  let replaced = 0;
  const max = Math.max(1, Math.round(aggressiveness * 5));

  for (const [word, synonyms] of Object.entries(dict.canary_words)) {
    if (replaced >= max) break;
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
    if (re.test(out)) {
      const seed = seedBase + hashString(word);
      const choice = pickDeterministic(synonyms, seed);
      if (choice === null) continue;
      out = out.replace(re, (match) => {
        if (!choice) return '';
        if (match[0] === match[0].toUpperCase()) {
          return choice.charAt(0).toUpperCase() + choice.slice(1);
        }
        return choice;
      });
      replaced++;
    }
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

function simplifyEmDashes(sentence, keepRatio) {
  const seedBase = hashString(sentence);
  let dashIdx = 0;
  return sentence.replace(/\s*[—–]\s*/g, (match) => {
    const r = ((seedBase + dashIdx * 31) % 100) / 100;
    dashIdx++;
    if (r < keepRatio) return ' — ';
    if (r < keepRatio + 0.6) return ', ';
    return '. ';
  }).replace(/,\s+,/g, ',').replace(/\.\s*\./g, '.');
}

function breakTricolon(sentence, dict) {
  const seedBase = hashString(sentence);
  const tricolonRe = /([^,]{3,40}),\s+([^,]{3,40}),\s+(?:and|or|i|oraz|lub|a także)\s+([^.!?,]{3,60})/i;
  const m = sentence.match(tricolonRe);
  if (!m) return sentence;

  const r = seedBase % 100;
  const [full, a, b, c] = m;
  let replacement;
  if (r < 50) {
    replacement = `${a.trim()} and ${b.trim()}. Plus ${c.trim()}`.replace(' and ', dict.lang === 'pl' ? ' i ' : ' and ');
    if (dict.lang === 'pl') replacement = `${a.trim()} i ${b.trim()}. Plus ${c.trim()}`;
  } else if (r < 80) {
    replacement = dict.lang === 'pl'
      ? `${a.trim()}. ${b.trim()}. ${c.trim()} też.`
      : `${a.trim()}. ${b.trim()}. ${c.trim()} too.`;
  } else {
    return sentence;
  }
  return sentence.replace(full, replacement);
}

function adjustContractions(sentence, lang, mode) {
  if (lang !== 'en') return sentence;
  if (mode === 'shortened') {
    return sentence
      .replace(/\bdo not\b/g, "don't")
      .replace(/\bdoes not\b/g, "doesn't")
      .replace(/\bdid not\b/g, "didn't")
      .replace(/\bcan not\b/g, "can't")
      .replace(/\bcannot\b/g, "can't")
      .replace(/\bwill not\b/g, "won't")
      .replace(/\bit is\b/g, "it's")
      .replace(/\bthat is\b/g, "that's")
      .replace(/\bwe are\b/g, "we're")
      .replace(/\bthey are\b/g, "they're")
      .replace(/\byou are\b/g, "you're")
      .replace(/\bI am\b/g, "I'm");
  }
  if (mode === 'expanded') {
    return sentence
      .replace(/\bdon't\b/g, 'do not')
      .replace(/\bdoesn't\b/g, 'does not')
      .replace(/\bdidn't\b/g, 'did not')
      .replace(/\bcan't\b/g, 'cannot')
      .replace(/\bwon't\b/g, 'will not')
      .replace(/\bit's\b/g, 'it is')
      .replace(/\bthat's\b/g, 'that is')
      .replace(/\bwe're\b/g, 'we are')
      .replace(/\bthey're\b/g, 'they are')
      .replace(/\byou're\b/g, 'you are')
      .replace(/\bI'm\b/g, 'I am');
  }
  return sentence;
}

function cutFillerPhrases(sentence, dict) {
  const compiled = dict._compiled_filler || (dict._compiled_filler = compileRegexList(dict.filler_phrases.map(p => `\\b${p}\\b`)));
  let out = sentence;
  for (const r of compiled) {
    out = out.replace(r, '').replace(/^\s*[,.\s]+/, '').replace(/\s{2,}/g, ' ');
  }
  return out.trim();
}

function findSplitPoint(sentence) {
  const words = sentence.split(/\s+/);
  if (words.length < 14) return -1;

  const splitWords = ['który', 'która', 'które', 'których', 'gdzie', 'kiedy', 'choć', 'ponieważ', 'jednak', 'natomiast', 'while', 'which', 'where', 'because', 'although', 'however'];
  for (let i = Math.floor(words.length * 0.4); i < Math.floor(words.length * 0.7); i++) {
    const w = words[i].toLowerCase().replace(/[.,;:]/g, '');
    if (splitWords.includes(w)) return i;
  }

  const commaIdx = sentence.indexOf(',', sentence.length * 0.4);
  if (commaIdx > 0 && commaIdx < sentence.length * 0.7) {
    let count = 0;
    for (let i = 0; i <= commaIdx; i++) if (sentence[i] === ' ') count++;
    return count;
  }
  return -1;
}

function splitLongSentence(sentence, lang) {
  const words = sentence.split(/\s+/);
  const splitAt = findSplitPoint(sentence);
  if (splitAt < 5 || splitAt > words.length - 4) return [sentence];
  const first = words.slice(0, splitAt).join(' ').replace(/[,;:]\s*$/, '') + '.';
  let secondStart = words[splitAt];
  if (/^(?:który|która|które|których)$/i.test(secondStart)) {
    secondStart = lang === 'pl' ? 'Ten' : 'It';
    const second = secondStart + ' ' + words.slice(splitAt + 1).join(' ');
    return [first, second.charAt(0).toUpperCase() + second.slice(1)];
  }
  const second = words.slice(splitAt).join(' ');
  return [first, second.charAt(0).toUpperCase() + second.slice(1)];
}

function mergeShortSentences(a, b, lang) {
  const conn = lang === 'pl' ? [', ', ' — ', ' i '] : [', ', ' — ', ' and '];
  const seed = hashString(a + b) % conn.length;
  const trimA = a.replace(/[.!?]+\s*$/, '');
  const lowerB = b.charAt(0).toLowerCase() + b.slice(1);
  return trimA + conn[seed] + lowerB;
}

function rebalanceBurstiness(sentences, lang, target) {
  const lengths = sentences.map(wordCount);
  if (lengths.length < 4) return sentences;
  const out = [...sentences];
  let attempts = 0;

  while (attempts < 4) {
    const lens = out.map(wordCount);
    const mu = lens.reduce((a, b) => a + b, 0) / lens.length;
    const sigma = Math.sqrt(lens.reduce((acc, v) => acc + (v - mu) ** 2, 0) / lens.length);
    const burst = sigma / mu;
    if (burst >= target) break;

    let maxIdx = 0;
    let maxLen = 0;
    for (let i = 0; i < out.length; i++) {
      if (lens[i] > maxLen) { maxLen = lens[i]; maxIdx = i; }
    }
    if (maxLen > 22) {
      const split = splitLongSentence(out[maxIdx], lang);
      if (split.length === 2) {
        out.splice(maxIdx, 1, ...split);
        attempts++;
        continue;
      }
    }

    let minIdx = -1;
    let minLen = Infinity;
    for (let i = 0; i < out.length - 1; i++) {
      const combined = lens[i] + lens[i + 1];
      if (lens[i] < minLen && lens[i] < 11 && combined < 25) {
        minLen = lens[i];
        minIdx = i;
      }
    }
    if (minIdx >= 0) {
      const merged = mergeShortSentences(out[minIdx], out[minIdx + 1], lang);
      out.splice(minIdx, 2, merged);
      attempts++;
      continue;
    }
    break;
  }
  return out;
}

function paragraphize(sentences, maxPerParagraph) {
  if (!maxPerParagraph || maxPerParagraph < 1) return sentences.join(' ');
  const chunks = [];
  for (let i = 0; i < sentences.length; i += maxPerParagraph) {
    chunks.push(sentences.slice(i, i + maxPerParagraph).join(' '));
  }
  return chunks.join('\n\n');
}

export function sanitize(text, options = {}) {
  if (!text || !text.trim()) return text;

  const lang = options.lang === 'auto' || !options.lang
    ? detectLanguage(text)
    : options.lang;
  const dict = DICTS[lang] || DICTS.en;
  const preset = getPreset(options.preset || 'casual');

  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim());
  const allSentences = [];
  for (const para of paragraphs) {
    const ss = splitSentences(para, lang);
    allSentences.push(...ss);
  }

  let sentences = allSentences;

  if (preset.stripHedgeOpeners) {
    sentences = sentences
      .map((s, i) => i === 0 || sentences.length < 5
        ? trimHedgeOpener(s, dict)
        : (isHedgeOpener(s, dict) ? null : s))
      .filter(s => s !== null && s !== '' && s !== undefined);
  }

  if (preset.stripResolutionClosers) {
    sentences = sentences.filter(s => !isResolutionCloser(s, dict));
  }

  sentences = sentences.map(s => {
    let out = s;
    out = replaceCanaryWords(out, dict, preset.aggressiveness);
    out = simplifyEmDashes(out, preset.emDashKeepRatio);
    out = breakTricolon(out, dict);
    out = adjustContractions(out, lang, preset.contractionMode);
    if (preset.cutFiller) out = cutFillerPhrases(out, dict);
    return out;
  }).filter(s => s && s.trim().length > 1);

  sentences = rebalanceBurstiness(sentences, lang, preset.targetBurstiness);

  let output;
  if (preset.shortParagraphs) {
    output = paragraphize(sentences, preset.maxParagraphSentences);
  } else {
    output = sentences.join(' ');
  }

  output = output
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/([,;:])([^\s])/g, '$1 $2')
    .replace(/\.{2,}/g, '.')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return output;
}

export function getDictionary(lang) {
  return DICTS[lang] || DICTS.en;
}
