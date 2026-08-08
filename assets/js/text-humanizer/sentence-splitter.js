const PL_ABBR = new Set([
  'p', 'np', 'tzw', 'tj', 'itp', 'itd', 'ok', 'ul', 'św', 'r',
  'dr', 'mgr', 'prof', 'inż', 'mjr', 'gen', 'płk', 'kpt',
  'mln', 'mld', 'tys', 'zł', 'gr', 'cz', 'ws', 'wg', 'm.in',
  'pn', 'wt', 'śr', 'czw', 'pt', 'sb', 'nd',
  'ds', 'wyd', 'zob', 'por', 'fot', 'red', 'tłum'
]);

const EN_ABBR = new Set([
  'mr', 'mrs', 'ms', 'dr', 'st', 'jr', 'sr',
  'e.g', 'i.e', 'etc', 'vs', 'vol', 'fig', 'ed', 'eds', 'al',
  'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
  'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun',
  'a.m', 'p.m'
]);

const EN_PRONOUN_STARTERS = /^(?:He|She|It|They|We|I|You|This|That|These|Those|There|Here|My|Your|His|Her|Our|Their)\b/;

const PL_SENTENCE_START = /^[A-ZĄĆĘŁŃÓŚŹŻ"„'(\[]/;
const EN_SENTENCE_START = /^[A-Z"'(\[]/;

export function splitSentences(text, language = 'pl') {
  if (!text || typeof text !== 'string') return [];
  const trimmed = text.trim();
  if (!trimmed) return [];

  const abbrSet = language === 'en' ? EN_ABBR : PL_ABBR;
  const startPattern = language === 'en' ? EN_SENTENCE_START : PL_SENTENCE_START;

  const sentences = [];
  let buffer = '';
  let i = 0;

  while (i < trimmed.length) {
    const ch = trimmed[i];
    buffer += ch;

    if (ch === '.' || ch === '!' || ch === '?') {
      let j = i + 1;
      while (j < trimmed.length && (trimmed[j] === '.' || trimmed[j] === '!' || trimmed[j] === '?')) {
        buffer += trimmed[j];
        j++;
      }

      let after = j;
      while (after < trimmed.length && /\s/.test(trimmed[after])) {
        after++;
      }

      if (after >= trimmed.length) {
        sentences.push(buffer.trim());
        buffer = '';
        i = after;
        continue;
      }

      const nextChunk = trimmed.slice(after, after + 2);
      const looksLikeStart = startPattern.test(nextChunk);

      if (!looksLikeStart) {
        i = j;
        continue;
      }

      const lastWordMatch = buffer.slice(0, -1).match(/(\S+)$/);
      const lastWord = lastWordMatch ? lastWordMatch[1].toLowerCase().replace(/[.!?]+$/, '') : '';

      const nextTokenStart = trimmed.slice(after);
      const looksLikePronounStart = language === 'en' && EN_PRONOUN_STARTERS.test(nextTokenStart);

      if (abbrSet.has(lastWord) && !looksLikePronounStart) {
        i = j;
        continue;
      }

      const rawLastWord = lastWordMatch ? lastWordMatch[1] : '';
      if (/^[A-Z](\.[A-Z])*$/.test(rawLastWord.replace(/[.!?]+$/, '')) && !looksLikePronounStart) {
        i = j;
        continue;
      }

      if (/^\d+$/.test(lastWord) && language === 'pl') {
        i = j;
        continue;
      }

      sentences.push(buffer.trim());
      buffer = '';
      i = after;
      continue;
    }

    if (ch === '\n') {
      const trimmedBuf = buffer.trim();
      if (trimmedBuf && /\n\s*\n/.test(buffer.slice(-3))) {
        sentences.push(trimmedBuf);
        buffer = '';
      }
    }

    i++;
  }

  if (buffer.trim()) {
    sentences.push(buffer.trim());
  }

  return sentences;
}

export function joinSentences(sentences, separator = ' ') {
  return sentences.filter(s => s && s.trim()).join(separator).replace(/\s+/g, ' ').trim();
}

export function wordCount(sentence) {
  if (!sentence) return 0;
  const matches = sentence.match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu);
  return matches ? matches.length : 0;
}

export function tokenize(text) {
  if (!text) return [];
  const matches = text.matchAll(/(\s+)|([\p{L}\p{N}][\p{L}\p{N}'\-]*)|([^\s\p{L}\p{N}])/gu);
  const tokens = [];
  for (const m of matches) tokens.push(m[0]);
  return tokens;
}
