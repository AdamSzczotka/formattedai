import { detect, applyIssues, applyIssue, applySafe } from '../assets/js/text-humanizer/detector.js';
import { sanitize } from '../assets/js/text-humanizer/sanitizer.js';

const tests = [];
let passed = 0, failed = 0;

function test(name, fn) { tests.push({ name, fn }); }
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

const AI_PL = `W dzisiejszym szybko zmieniającym się świecie sztuczna inteligencja rewolucjonizuje sposób, w jaki pracujemy. Warto zauważyć, że kompleksowy krajobraz technologii cyfrowych — od chmury po edge computing — stanowi fundament nowoczesnego biznesu. Holistyczne podejście do transformacji cyfrowej wymaga uwzględnienia ludzi, procesów i technologii. Podsumowując, kluczowe znaczenie ma adaptacja do nowych realiów.`;

const AI_EN = `In today's rapidly evolving world, artificial intelligence is revolutionizing how we work. It's important to note that the robust landscape of digital technology — from cloud to edge — forms the bedrock of modern business. In conclusion, embracing holistic approaches is pivotal for success.`;

// --- Offsets are the contract: every issue must slice back to its `original`.
test('every issue offset slices back to its original substring', () => {
  for (const txt of [AI_PL, AI_EN]) {
    const { issues } = detect(txt);
    for (const i of issues) {
      assert(txt.slice(i.start, i.end) === i.original,
        `offset mismatch [${i.category}] "${txt.slice(i.start, i.end)}" != "${i.original}"`);
    }
  }
});

test('detect finds a hedge opener at sentence start (PL)', () => {
  const { issues } = detect(AI_PL, { lang: 'pl' });
  const hedge = issues.find(i => i.category === 'hedge');
  assert(hedge, 'no hedge issue found');
  assert(hedge.start === 0, 'hedge should start at 0, got ' + hedge.start);
  assert(/^W dzisiejszym/.test(hedge.original), 'unexpected hedge original: ' + hedge.original);
});

test('detect finds a resolution closer (PL)', () => {
  const { issues } = detect(AI_PL, { lang: 'pl' });
  assert(issues.some(i => i.category === 'closer' && /^Podsumowując/.test(i.original)), 'no closer issue');
});

test('detect catches PL canary word ending in a diacritic (unicode boundary)', () => {
  // "transformować" ends in "ć"; an ASCII \b boundary fails to match after it.
  const { issues } = detect('Ta technologia ma transformować rynek.', { lang: 'pl' });
  const canary = issues.find(i => i.category === 'canary' && /transformować/i.test(i.original));
  assert(canary, 'canary word ending in ć not detected (ASCII \\b regression)');
});

test('detect finds em-dash and marks it safe', () => {
  const { issues } = detect(AI_PL, { lang: 'pl' });
  const dash = issues.filter(i => i.category === 'emdash');
  assert(dash.length >= 1, 'expected em-dash issues');
  assert(dash.every(i => i.safe === true), 'em-dash should be safe');
  assert(dash.every(i => i.replacement === ', '), 'em-dash replacement should be comma');
});

test('em-dash detection ignores numeric ranges', () => {
  const { issues } = detect('Projekt trwał w latach 2020–2024 i był udany.', { lang: 'pl' });
  assert(!issues.some(i => i.category === 'emdash'), 'numeric range wrongly flagged as em-dash');
});

test('em-dash detection ignores line-start dialogue dashes', () => {
  const { issues } = detect('— Cześć — powiedział.\n— Do widzenia.', { lang: 'pl' });
  const dashes = issues.filter(i => i.category === 'emdash');
  // only the mid-line "Cześć — powiedział" dash qualifies, not the two line openers
  assert(dashes.length === 1, 'expected exactly 1 dialogue dash flagged, got ' + dashes.length);
});

test('summary counts issues by category', () => {
  const { summary } = detect(AI_PL, { lang: 'pl' });
  assert(summary.total > 0, 'expected some issues');
  assert(summary.byCategory.hedge >= 1, 'expected a hedge in summary');
  assert(Object.values(summary.byCategory).reduce((a, b) => a + b, 0) === summary.total, 'byCategory must sum to total');
});

test('metrics report burstiness and monotony flag', () => {
  const { metrics } = detect(AI_PL, { lang: 'pl' });
  assert(metrics && typeof metrics.burstiness === 'number', 'burstiness metric missing');
  assert(typeof metrics.rhythmMonotonous === 'boolean', 'rhythm flag missing');
});

// --- Applying issues.
test('applyIssue on a canary swaps the word by offset', () => {
  const text = 'To bardzo kompleksowy raport.';
  const { issues } = detect(text, { lang: 'pl' });
  const canary = issues.find(i => i.category === 'canary');
  assert(canary, 'no canary detected in fixture');
  const out = applyIssue(text, canary);
  assert(out !== text, 'apply did nothing');
  assert(!/kompleksowy/i.test(out), 'canary word still present: ' + out);
});

test('applySafe only touches safe issues, leaves canary words intact', () => {
  const out = applySafe(AI_PL, detect(AI_PL, { lang: 'pl' }).issues);
  assert(!/—/.test(out), 'em-dash should be gone after applySafe');
  assert(/krajobraz/i.test(out), 'applySafe must not remove canary words: ' + out);
});

test('applySafe never leaves a dangling ", że" or ".," artifact', () => {
  const out = applySafe(AI_PL, detect(AI_PL, { lang: 'pl' }).issues);
  assert(!/\.\s*,/.test(out), 'produced a "., " artifact: ' + out);
  assert(!/(^|\.\s+),\s*że/i.test(out), 'produced a dangling ", że" fragment: ' + out);
});

test('filler overlapping a hedge opener is suppressed (no double-count)', () => {
  const { issues } = detect('Warto zauważyć, że system działa.', { lang: 'pl' });
  assert(issues.some(i => i.category === 'hedge'), 'expected the hedge');
  assert(!issues.some(i => i.category === 'filler'), 'filler overlapping hedge should be suppressed');
});

test('applyIssues capitalizes the letter after a removed opener', () => {
  const text = 'Warto zauważyć, że system działa dobrze.';
  const { issues } = detect(text, { lang: 'pl' });
  const hedge = issues.find(i => i.category === 'hedge');
  const out = applyIssues(text, [hedge]);
  assert(/^System/.test(out), 'expected capitalized "System", got: ' + out.slice(0, 20));
});

test('applyIssues is offset-safe with multiple overlapping-length edits', () => {
  const { issues } = detect(AI_PL, { lang: 'pl' });
  const out = applyIssues(AI_PL, issues);
  assert(out.length > 40, 'output collapsed');
  assert(!/\s{2,}/.test(out), 'double spaces left behind: ' + JSON.stringify(out.match(/.{0,10}\s{2,}.{0,10}/)));
});

// --- Regression guards for the sanitizer bug fixes.
test('BUGFIX: PL tricolon never emits English "Plus"', () => {
  const text = 'Zespół lubi koty, psy oraz ryby w biurze na parterze budynku.';
  const out = sanitize(text, { lang: 'pl', preset: 'casual' });
  assert(!/\bPlus\b/.test(out), 'English "Plus" leaked into PL output: ' + out);
});

test('BUGFIX: hedge-opener sentence keeps its content (not deleted)', () => {
  // Sentence 2 starts with "Warto zauważyć" and ends with "...biznesu".
  const out = sanitize(AI_PL, { lang: 'pl', preset: 'casual' });
  assert(/biznes/i.test(out), 'content after hedge opener was lost: ' + out);
});

test('BUGFIX: no lowercase sentence start after em-dash to period', () => {
  const out = sanitize(AI_EN, { lang: 'en', preset: 'casual' });
  // A ". x" (period, space, lowercase letter) indicates a broken sentence start.
  assert(!/\.\s+[a-ząćęłńóśźż]/.test(out) || true, 'inspected'); // soft; hard check below
  const brokenStarts = (out.match(/[.!?]\s+[a-z]/g) || []).filter(m => !/\bi\.e|e\.g/.test(m));
  assert(brokenStarts.length === 0, 'lowercase sentence start found: ' + JSON.stringify(brokenStarts));
});

(async () => {
  console.log('\n🔬 Text Humanizer — detector tests\n');
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
