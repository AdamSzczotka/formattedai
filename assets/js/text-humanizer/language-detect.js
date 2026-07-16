const PL_DIACRITICS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g;
const PL_STOP_WORDS = ['się', 'jest', 'oraz', 'które', 'które', 'tego', 'tym', 'tych', 'tylko', 'jako', 'jeśli', 'gdy', 'czy', 'lub', 'aby', 'dla'];
const EN_STOP_WORDS = ['the', 'and', 'with', 'that', 'this', 'from', 'have', 'been', 'were', 'their', 'which', 'about', 'would', 'there', 'these', 'into'];

export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'pl';
  const trimmed = text.trim();
  if (trimmed.length < 8) return 'pl';

  const sample = trimmed.slice(0, 4000);
  const totalLetters = (sample.match(/[\p{L}]/gu) || []).length;
  if (totalLetters === 0) return 'pl';

  const diacriticCount = (sample.match(PL_DIACRITICS) || []).length;
  const diacriticRatio = diacriticCount / totalLetters;

  if (diacriticRatio > 0.005) return 'pl';

  const lower = ' ' + sample.toLowerCase() + ' ';
  let plHits = 0;
  let enHits = 0;
  for (const w of PL_STOP_WORDS) {
    if (lower.includes(' ' + w + ' ')) plHits++;
  }
  for (const w of EN_STOP_WORDS) {
    if (lower.includes(' ' + w + ' ')) enHits++;
  }

  if (enHits > plHits + 1) return 'en';
  if (plHits > enHits) return 'pl';

  if (diacriticCount > 0) return 'pl';
  return 'en';
}
