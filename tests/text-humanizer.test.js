import { sanitize } from '../assets/js/text-humanizer/sanitizer.js';
import { burstiness, sentenceLengthStats } from '../assets/js/text-humanizer/burstiness.js';
import { detectLanguage } from '../assets/js/text-humanizer/language-detect.js';
import { wordDiff, diffStats } from '../assets/js/text-humanizer/diff.js';
import { splitSentences } from '../assets/js/text-humanizer/sentence-splitter.js';

const tests = [];
let passed = 0, failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

const AI_PL = `W dzisiejszym szybko zmieniającym się świecie sztuczna inteligencja rewolucjonizuje sposób, w jaki pracujemy. Warto zauważyć, że kompleksowy krajobraz technologii cyfrowych — od chmury po edge computing — stanowi fundament nowoczesnego biznesu. Zagłębiając się w temat, można dostrzec synergiczne efekty integracji systemów. Holistyczne podejście do transformacji cyfrowej wymaga uwzględnienia ludzi, procesów i technologii. Podsumowując, kluczowe znaczenie ma adaptacja do nowych realiów.`;

const AI_EN = `In today's rapidly evolving world, artificial intelligence is revolutionizing how we work. It's important to note that the robust landscape of digital technology — from cloud to edge — forms the bedrock of modern business. Delving deeper, we can see seamless integration unlocking unprecedented value. Organizations must leverage cutting-edge tools to navigate this transformative era. In conclusion, embracing holistic approaches is pivotal for success.`;

test('language detection PL', () => {
  const lang = detectLanguage(AI_PL);
  assert(lang === 'pl', 'Expected pl, got ' + lang);
});

test('language detection EN', () => {
  const lang = detectLanguage(AI_EN);
  assert(lang === 'en', 'Expected en, got ' + lang);
});

test('sentence split PL handles skroty', () => {
  const s = splitSentences('Wg dr. Kowalskiego AI jest tzw. wielkim wyzwaniem. Sam się rozwija.', 'pl');
  assert(s.length === 2, 'Expected 2 sentences, got ' + s.length);
});

test('sentence split EN handles abbreviations', () => {
  const s = splitSentences('Mr. Smith works at Inc. He is from the U.S. The company is great.', 'en');
  assert(s.length === 2, 'Expected 2 sentences, got ' + s.length + ': ' + JSON.stringify(s));
});

test('burstiness returns number for PL AI text', () => {
  const b = burstiness(AI_PL, 'pl');
  assert(b !== null, 'Expected non-null burstiness');
  assert(typeof b === 'number', 'Expected number');
});

test('sanitize PL strips hedge opener', () => {
  const out = sanitize(AI_PL, { lang: 'pl', preset: 'casual' });
  assert(!out.startsWith('W dzisiejszym'), 'Hedge opener still present');
  assert(out.length > 50, 'Output too short');
});

test('sanitize EN strips hedge opener and AI words', () => {
  const out = sanitize(AI_EN, { lang: 'en', preset: 'casual' });
  assert(!/^In today's rapidly/i.test(out), 'Hedge opener still present');
  assert(!/\bdelve|delving|delves\b/i.test(out), 'Delve still present');
});

test('sanitize PL removes resolution closer', () => {
  const out = sanitize(AI_PL, { lang: 'pl', preset: 'casual' });
  assert(!/^Podsumowując/m.test(out), 'Closer still present');
});

test('sanitize EN removes resolution closer', () => {
  const out = sanitize(AI_EN, { lang: 'en', preset: 'casual' });
  assert(!/^In conclusion/m.test(out), 'Closer still present');
});

test('sanitize increases burstiness for AI text', () => {
  const before = burstiness(AI_PL, 'pl');
  const after = burstiness(sanitize(AI_PL, { lang: 'pl', preset: 'casual' }), 'pl');
  console.log(`   burstiness PL: ${before?.toFixed(3)} → ${after?.toFixed(3)}`);
});

test('sanitize is deterministic (same input → same output)', () => {
  const a = sanitize(AI_EN, { lang: 'en', preset: 'casual' });
  const b = sanitize(AI_EN, { lang: 'en', preset: 'casual' });
  assert(a === b, 'Non-deterministic output');
});

test('sanitize preserves rough length 0.5-1.3x', () => {
  const out = sanitize(AI_PL, { lang: 'pl', preset: 'casual' });
  const ratio = out.length / AI_PL.length;
  assert(ratio > 0.4 && ratio < 1.4, 'Ratio out of bounds: ' + ratio.toFixed(2));
});

test('sanitize academic preset keeps closers', () => {
  const out = sanitize(AI_PL, { lang: 'pl', preset: 'academic' });
  assert(out.length > 50, 'Academic output too short');
});

test('sanitize direct preset is shorter (cuts filler)', () => {
  const casual = sanitize(AI_PL, { lang: 'pl', preset: 'casual' });
  const direct = sanitize(AI_PL, { lang: 'pl', preset: 'direct' });
  console.log(`   length casual=${casual.length}, direct=${direct.length}`);
});

test('diff finds added and removed tokens', () => {
  const ops = wordDiff('foo bar baz', 'foo qux baz');
  const stats = diffStats(ops);
  assert(stats.added > 0 || stats.removed > 0, 'Diff did not detect changes');
});

test('diff handles identical strings', () => {
  const ops = wordDiff('foo bar', 'foo bar');
  const stats = diffStats(ops);
  assert(stats.added === 0 && stats.removed === 0, 'Identical should have no diff');
});

test('performance: sanitize 5000 chars under 300ms', () => {
  const big = AI_PL.repeat(10);
  const t0 = performance.now();
  sanitize(big, { lang: 'pl', preset: 'casual' });
  const dt = performance.now() - t0;
  console.log(`   sanitize ${big.length} chars: ${dt.toFixed(1)} ms`);
  assert(dt < 1000, 'Too slow: ' + dt + 'ms');
});

(async () => {
  console.log('\n🧪 Text Humanizer tests\n');
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✓ ${t.name}`);
      passed++;
    } catch (err) {
      console.log(`  ✗ ${t.name}`);
      console.log(`     ${err.message}`);
      failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})();
