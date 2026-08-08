import { splitSentences, wordCount } from './sentence-splitter.js';

function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const mu = mean(arr);
  const variance = arr.reduce((acc, v) => acc + (v - mu) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

export function burstiness(text, language = 'pl') {
  if (!text) return null;
  const sentences = splitSentences(text, language);
  if (sentences.length < 3) return null;
  const lengths = sentences.map(wordCount).filter(n => n > 0);
  if (lengths.length < 3) return null;

  const mu = mean(lengths);
  if (mu === 0) return null;
  return stdDev(lengths) / mu;
}

export function burstinessLabel(score, lang = 'pl') {
  const t = (pl, en) => lang === 'en' ? en : pl;
  if (score === null || score === undefined) {
    return { label: t('— (za krótki tekst)', '— (text too short)'), tone: 'muted', percent: 0 };
  }
  const percent = Math.min(100, Math.round((score / 1.0) * 100));
  if (score < 0.30) return { label: t('Niska — jak AI', 'Low — AI-like'), tone: 'bad', percent };
  if (score < 0.50) return { label: t('Średnia', 'Medium'), tone: 'warn', percent };
  if (score < 0.85) return { label: t('Wysoka — naturalna', 'High — natural'), tone: 'good', percent };
  return { label: t('Bardzo wysoka', 'Very high'), tone: 'good', percent };
}

export function sentenceLengthStats(text, language = 'pl') {
  const sentences = splitSentences(text, language);
  const lengths = sentences.map(wordCount).filter(n => n > 0);
  if (!lengths.length) return null;
  return {
    count: lengths.length,
    mean: +mean(lengths).toFixed(2),
    stdDev: +stdDev(lengths).toFixed(2),
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    burstiness: +(stdDev(lengths) / mean(lengths) || 0).toFixed(3),
  };
}
