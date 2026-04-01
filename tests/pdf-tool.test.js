/**
 * PDF Tool — Automated Test Suite
 * Run: node tests/pdf-tool.test.js
 *
 * Tests: syntax, i18n completeness, Polish chars, tab consistency,
 * function refs, HTML sync, CSS compilation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    failures.push({ name, error: e.message });
    console.log(`  ✗ ${name}`);
    console.log(`    → ${e.message}`);
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// ─── Load sources ───
const pdfJs = fs.readFileSync(path.join(ROOT, 'assets/js/pdf.js'), 'utf-8');
const pdfScss = fs.readFileSync(path.join(ROOT, 'assets/scss/pdf.scss'), 'utf-8');
const htmlPl = fs.readFileSync(path.join(ROOT, 'pdf/index.html'), 'utf-8');
const htmlEn = fs.readFileSync(path.join(ROOT, 'en/pdf/index.html'), 'utf-8');

// ─── Extract translations from JS ───
function extractTranslations(src) {
  // Match the pl: { ... } and en: { ... } objects
  const plMatch = src.match(/translations\s*=\s*\{[\s\S]*?pl:\s*\{([\s\S]*?)\n    \},/);
  const enMatch = src.match(/en:\s*\{([\s\S]*?)\n    \},?\s*\n\s*\};/);

  function parseKeys(block) {
    const keys = [];
    const re = /^\s*(\w+):/gm;
    let m;
    while ((m = re.exec(block)) !== null) {
      keys.push(m[1]);
    }
    return keys;
  }

  return {
    plKeys: plMatch ? parseKeys(plMatch[1]) : [],
    enKeys: enMatch ? parseKeys(enMatch[1]) : [],
  };
}

// ─── Extract tab IDs from JS ───
function extractTabIds(src) {
  const m = src.match(/TAB_IDS\s*=\s*\[([^\]]+)\]/);
  if (!m) return [];
  return m[1].match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
}

// ─── Extract HTML tab buttons ───
function extractHtmlTabs(html) {
  const tabs = [];
  const re = /data-tab="([^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    tabs.push(m[1]);
  }
  return tabs;
}

// ─── Polish character check ───
const POLISH_CHARS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;

function extractPlValues(src) {
  const plMatch = src.match(/pl:\s*\{([\s\S]*?)\n    \},/);
  if (!plMatch) return {};
  const block = plMatch[1];
  const values = {};
  const re = /(\w+):\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    values[m[1]] = m[2];
  }
  return values;
}

// ─── executeAction cases ───
function extractActionCases(src) {
  const m = src.match(/switch\s*\(state\.activeTab\)\s*\{([\s\S]*?)\}/);
  if (!m) return [];
  const cases = [];
  const re = /case\s*'(\w+)'/g;
  let cm;
  while ((cm = re.exec(m[1])) !== null) {
    cases.push(cm[1]);
  }
  return cases;
}

// ─── Functions referenced in executeAction ───
function extractActionFunctions(src) {
  const m = src.match(/switch\s*\(state\.activeTab\)\s*\{([\s\S]*?)\}/);
  if (!m) return [];
  const fns = [];
  const re = /:\s*(\w+)\(\)/g;
  let fm;
  while ((fm = re.exec(m[1])) !== null) {
    fns.push(fm[1]);
  }
  return fns;
}

// ─── dropZoneText map keys ───
function extractDropTextKeys(src) {
  const m = src.match(/var textMap\s*=\s*\{([\s\S]*?)\}/);
  if (!m) return [];
  const keys = [];
  const re = /'(\w+)'/g;
  let km;
  while ((km = re.exec(m[1])) !== null) {
    // Every other match is the value
    keys.push(km[1]);
  }
  // textMap keys are the odd-indexed (0, 2, 4...) — actually it's key: value pairs
  // Let's just get the left-hand keys
  const keys2 = [];
  const re2 = /'(\w+)'\s*:/g;
  let km2;
  while ((km2 = re2.exec(m[1])) !== null) {
    keys2.push(km2[1]);
  }
  return keys2;
}

// ═══════════════════════════════
console.log('\n🔧 PDF Tool Test Suite\n');

// ─── 1. JS Syntax ───
console.log('── JS Syntax ──');
test('pdf.js parses without syntax errors', () => {
  try {
    execSync(`node -c "${path.join(ROOT, 'assets/js/pdf.js')}"`, { stdio: 'pipe' });
  } catch (e) {
    throw new Error(e.stderr.toString().trim());
  }
});

// ─── 2. SCSS Compilation ───
console.log('\n── SCSS Compilation ──');
test('pdf.scss compiles without errors', () => {
  try {
    execSync(`npx sass "${path.join(ROOT, 'assets/scss/pdf.scss')}" --no-source-map --style compressed`, {
      stdio: 'pipe',
      cwd: ROOT,
    });
  } catch (e) {
    throw new Error(e.stderr.toString().trim());
  }
});

// ─── 3. i18n Completeness ───
console.log('\n── i18n Completeness ──');
const { plKeys, enKeys } = extractTranslations(pdfJs);

test('PL translations exist', () => {
  assert(plKeys.length > 0, 'No PL keys found');
});

test('EN translations exist', () => {
  assert(enKeys.length > 0, 'No EN keys found');
});

test('Every PL key has EN equivalent', () => {
  const missing = plKeys.filter(k => !enKeys.includes(k));
  assert(missing.length === 0, `PL keys missing in EN: ${missing.join(', ')}`);
});

test('Every EN key has PL equivalent', () => {
  const missing = enKeys.filter(k => !plKeys.includes(k));
  assert(missing.length === 0, `EN keys missing in PL: ${missing.join(', ')}`);
});

test('PL and EN have same number of keys', () => {
  assert(plKeys.length === enKeys.length,
    `PL has ${plKeys.length} keys, EN has ${enKeys.length} keys`);
});

// ─── 4. Polish Characters ───
console.log('\n── Polish Characters ──');
const plValues = extractPlValues(pdfJs);

// Keys that MUST have Polish diacritics (ąćęłńóśźż)
const MUST_HAVE_DIACRITICS = [
  'pageTitle', 'subtitle', 'dropMerge', 'dropSplit', 'dropCompress',
  'mergeBtnText', 'cropHint', 'errorGeneric',
];

MUST_HAVE_DIACRITICS.forEach(key => {
  test(`PL "${key}" contains Polish diacritics`, () => {
    const val = plValues[key];
    assert(val, `Key "${key}" not found in PL translations`);
    assert(POLISH_CHARS.test(val), `"${key}" = "${val}" — expected Polish diacritics (ąćęłńóśźż)`);
  });
});

// Verify PL translations are actually Polish (not same as EN)
function extractEnValues(src) {
  const enMatch = src.match(/en:\s*\{([\s\S]*?)\n    \},?\s*\n\s*\};/);
  if (!enMatch) return {};
  const values = {};
  const re = /(\w+):\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(enMatch[1])) !== null) { values[m[1]] = m[2]; }
  return values;
}

const enValues = extractEnValues(pdfJs);
const VERIFY_DIFFERENT = [
  'tabSplit', 'tabCompress', 'tabCrop', 'tabForms', 'tabAnnotate',
  'splitBtnText', 'compressBtnText', 'cropBtnText', 'formsBtnText',
  'processing', 'download',
];

VERIFY_DIFFERENT.forEach(key => {
  test(`PL "${key}" differs from EN`, () => {
    const pl = plValues[key];
    const en = enValues[key];
    assert(pl, `Key "${key}" not found in PL`);
    assert(en, `Key "${key}" not found in EN`);
    assert(pl !== en, `PL and EN identical: "${pl}"`);
  });
});

// ─── 5. Tab Consistency ───
console.log('\n── Tab Consistency ──');
const jsTabIds = extractTabIds(pdfJs);
const htmlPlTabs = extractHtmlTabs(htmlPl);
const htmlEnTabs = extractHtmlTabs(htmlEn);

test('TAB_IDS defined in JS', () => {
  assert(jsTabIds.length >= 4, `Only ${jsTabIds.length} tabs found`);
});

test('PL HTML has all JS tabs', () => {
  const missing = jsTabIds.filter(t => !htmlPlTabs.includes(t));
  assert(missing.length === 0, `Tabs missing in PL HTML: ${missing.join(', ')}`);
});

test('EN HTML has all JS tabs', () => {
  const missing = jsTabIds.filter(t => !htmlEnTabs.includes(t));
  assert(missing.length === 0, `Tabs missing in EN HTML: ${missing.join(', ')}`);
});

test('PL and EN HTML have same tabs', () => {
  assert(htmlPlTabs.join(',') === htmlEnTabs.join(','),
    `PL tabs: ${htmlPlTabs.join(',')} vs EN tabs: ${htmlEnTabs.join(',')}`);
});

// ─── 6. Action Dispatcher ───
console.log('\n── Action Dispatcher ──');
const actionCases = extractActionCases(pdfJs);
const actionFns = extractActionFunctions(pdfJs);

test('executeAction covers all tabs', () => {
  const missing = jsTabIds.filter(t => !actionCases.includes(t));
  assert(missing.length === 0, `Tabs missing in executeAction: ${missing.join(', ')}`);
});

test('All action functions exist in source', () => {
  actionFns.forEach(fn => {
    assert(pdfJs.includes(`function ${fn}(`) || pdfJs.includes(`async function ${fn}(`),
      `Function "${fn}" referenced in executeAction but not defined`);
  });
});

// ─── 7. Drop Zone Text Map ───
console.log('\n── Drop Zone Text Map ──');
const dropKeys = extractDropTextKeys(pdfJs);

test('dropZoneText map covers all tabs', () => {
  const missing = jsTabIds.filter(t => !dropKeys.includes(t));
  assert(missing.length === 0, `Tabs missing in textMap: ${missing.join(', ')}`);
});

// ─── 8. HTML Structure ───
console.log('\n── HTML Structure ──');

test('PL HTML has editorArea div', () => {
  assert(htmlPl.includes('id="editorArea"'), 'editorArea missing in PL HTML');
});

test('EN HTML has editorArea div', () => {
  assert(htmlEn.includes('id="editorArea"'), 'editorArea missing in EN HTML');
});

test('PL HTML has SVG icons in tabs', () => {
  const tabsWithSvg = (htmlPl.match(/data-tab="[^"]+[^>]*>.*?<svg/g) || []).length;
  assert(tabsWithSvg >= jsTabIds.length,
    `Only ${tabsWithSvg}/${jsTabIds.length} tabs have SVG icons`);
});

test('EN HTML has SVG icons in tabs', () => {
  const tabsWithSvg = (htmlEn.match(/data-tab="[^"]+[^>]*>.*?<svg/g) || []).length;
  assert(tabsWithSvg >= jsTabIds.length,
    `Only ${tabsWithSvg}/${jsTabIds.length} tabs have SVG icons`);
});

test('Tab buttons wrap text in <span>', () => {
  const tabBtns = htmlPl.match(/<button[^>]*data-tab[^>]*>[\s\S]*?<\/button>/g) || [];
  const withoutSpan = tabBtns.filter(b => !b.includes('<span>'));
  assert(withoutSpan.length === 0,
    `${withoutSpan.length} tab buttons missing <span> wrapper — i18n will wipe SVG icons`);
});

// ─── 9. Key DOM IDs referenced in JS exist in HTML ───
console.log('\n── DOM ID References ──');
const criticalIds = [
  'optionsPanel', 'splitPageGrid', 'splitOptions', 'compressOptions',
  'fileInput', 'addMoreInput', 'dropZone', 'fileListArea', 'fileList',
  'divider', 'actionBtn', 'resultArea', 'progressBar',
];

criticalIds.forEach(id => {
  test(`PL HTML has #${id}`, () => {
    assert(htmlPl.includes(`id="${id}"`), `Missing id="${id}" in PL HTML`);
  });
});

// ─── 10. No stale prompt() calls ───
console.log('\n── No Browser Dialogs ──');
test('No prompt() calls in pdf.js', () => {
  const prompts = (pdfJs.match(/[^a-zA-Z]prompt\s*\(/g) || []);
  assert(prompts.length === 0, `Found ${prompts.length} prompt() calls — should use inline UI`);
});

test('No alert() calls in pdf.js', () => {
  const alerts = (pdfJs.match(/[^a-zA-Z]alert\s*\(/g) || []);
  assert(alerts.length === 0, `Found ${alerts.length} alert() calls`);
});

// ─── 11. Confirm() only in advanced mode ───
console.log('\n── Confirm Usage ──');
test('confirm() only used for advanced mode unlocking', () => {
  const confirms = [];
  const re = /confirm\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(pdfJs)) !== null) {
    confirms.push(m[1].trim());
  }
  const nonAdvanced = confirms.filter(c => !c.includes('advancedUnlock'));
  assert(nonAdvanced.length === 0,
    `Found confirm() not for advanced mode: ${nonAdvanced.join('; ')}`);
});

// ═══════════════════════════════
console.log('\n' + '═'.repeat(40));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach((f, i) => {
    console.log(`  ${i + 1}. ${f.name}`);
    console.log(`     ${f.error}`);
  });
}

console.log('');
process.exit(failed > 0 ? 1 : 0);
