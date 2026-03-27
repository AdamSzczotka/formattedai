#!/usr/bin/env node

/**
 * build-i18n.js — Static HTML generator from templates + JSON locale files.
 *
 * Zero npm dependencies. Uses only Node built-in modules (fs, path).
 *
 * Usage:  node scripts/build-i18n.js
 *
 * How it works:
 *   1. Reads all .html files from templates/
 *   2. For each template, for each language (pl, en):
 *      - Replaces {{key}} placeholders with values from locales/[lang].json
 *      - Supports dot notation: {{shared.navTools}} → locales[lang].shared.navTools
 *      - Replaces built-in variables: {{lang}}, {{altLang}}, {{altUrl}}, etc.
 *      - Processes {{#each key}}...{{/each}} blocks for array data
 *   3. Writes output files:
 *      - PL: root directory  (templates/index.html → ./index.html)
 *      - EN: /en/ directory   (templates/index.html → ./en/index.html)
 *
 * Output mapping:
 *   templates/index.html    → ./index.html (PL) + ./en/index.html (EN)
 *   templates/about.html    → ./about/index.html (PL) + ./en/about/index.html (EN)
 *   templates/privacy.html  → ./privacy/index.html (PL) + ./en/privacy/index.html (EN)
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');
const ARTICLES_DATA_DIR = path.join(ROOT_DIR, 'articles', 'data');
const BASE_URL = 'https://formattedai.pl';
const LANGUAGES = ['pl', 'en'];
const DEFAULT_LANG = 'pl';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively resolve a dot-notation key against a data object.
 * Example: resolveKey('shared.navTools', data) → data.shared.navTools
 *
 * Returns undefined if the key path does not exist.
 */
function resolveKey(key, data) {
  return key.split('.').reduce((obj, part) => {
    if (obj == null) return undefined;
    return obj[part];
  }, data);
}

/**
 * Process {{#each key}}...{{/each}} blocks.
 *
 * Inside the block, {{.fieldName}} references a field of the current item,
 * and {{@index}} gives the zero-based iteration index.
 * Plain {{key}} still resolves against the root data object.
 */
function processEachBlocks(template, data) {
  const eachRegex = /\{\{#each\s+([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;

  return template.replace(eachRegex, (match, key, blockContent) => {
    const items = resolveKey(key, data);

    // If the key doesn't resolve to an array, remove the block silently
    if (!Array.isArray(items)) {
      return '';
    }

    return items.map((item, index) => {
      let rendered = blockContent;

      // Replace {{@index}} with the current index
      rendered = rendered.replace(/\{\{@index\}\}/g, String(index));

      // Replace {{.fieldName}} with item properties (supports nested: {{.meta.title}})
      rendered = rendered.replace(/\{\{\.([\w.]+)\}\}/g, (_m, fieldKey) => {
        const value = resolveKey(fieldKey, item);
        return value != null ? String(value) : '';
      });

      // Replace remaining {{key}} placeholders against root data
      rendered = replacePlaceholders(rendered, data);

      return rendered;
    }).join('');
  });
}

/**
 * Replace all {{key}} placeholders in a template string.
 * Looks up keys against the provided data object using dot notation.
 * Unresolved placeholders are left as-is (useful for debugging).
 */
function replacePlaceholders(template, data) {
  return template.replace(/\{\{([\w.]+)\}\}/g, (_match, key) => {
    const value = resolveKey(key, data);
    return value != null ? String(value) : `{{${key}}}`;
  });
}

/**
 * Full template rendering pipeline:
 *   1. Process {{#each}} blocks
 *   2. Replace remaining {{key}} placeholders
 */
function renderTemplate(template, data) {
  let result = template;
  result = processEachBlocks(result, data);
  result = replacePlaceholders(result, data);
  return result;
}

/**
 * Determine the output path for a given template file and language.
 *
 * templates/index.html  → ./index.html (PL)  |  ./en/index.html (EN)
 * templates/about.html  → ./about/index.html  |  ./en/about/index.html
 */
function getOutputPath(templateName, lang) {
  const baseName = path.basename(templateName, '.html');

  // index.html stays as index.html; other pages become {name}/index.html
  const relativePath = baseName === 'index'
    ? 'index.html'
    : path.join(baseName, 'index.html');

  // PL outputs to root, EN outputs to /en/
  if (lang === DEFAULT_LANG) {
    return path.join(ROOT_DIR, relativePath);
  }
  return path.join(ROOT_DIR, lang, relativePath);
}

/**
 * Determine the URL path for a given template file and language.
 * Used to build currentUrl and altUrl.
 *
 * templates/index.html → "/" (PL) | "/en/" (EN)
 * templates/about.html → "/about/" (PL) | "/en/about/" (EN)
 */
function getUrlPath(templateName, lang) {
  const baseName = path.basename(templateName, '.html');
  const pagePath = baseName === 'index' ? '/' : `/${baseName}/`;

  if (lang === DEFAULT_LANG) {
    return pagePath;
  }
  return `/en${pagePath}`;
}

/**
 * Compute the relative path to the assets directory from the output file.
 *
 * Root-level pages (index.html) → "assets"
 * Subpages (about/index.html)   → "../assets"
 * EN subpages (en/about/index.html) → "../../assets"
 */
function getCssPath(templateName, lang) {
  const baseName = path.basename(templateName, '.html');
  const isRoot = baseName === 'index';

  if (lang === DEFAULT_LANG) {
    return isRoot ? 'assets' : '../assets';
  }
  // EN pages are one level deeper (/en/...)
  return isRoot ? '../assets' : '../../assets';
}

/**
 * Build the complete data context for template rendering.
 * Merges locale translations with built-in variables.
 */
function buildContext(locale, lang, templateName) {
  const altLang = lang === 'pl' ? 'en' : 'pl';
  const urlPath = getUrlPath(templateName, lang);
  const altUrlPath = getUrlPath(templateName, altLang);

  return {
    ...locale,
    lang,
    altLang,
    LANG: lang.toUpperCase(),
    ALT_LANG: altLang.toUpperCase(),
    baseUrl: BASE_URL,
    currentUrl: `${BASE_URL}${urlPath}`,
    altUrl: `${BASE_URL}${altUrlPath}`,
    pathPrefix: lang === DEFAULT_LANG ? '' : '/en',
    cssPath: getCssPath(templateName, lang),
  };
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Load and parse a JSON locale file. Exits with an error if the file
 * is missing or contains invalid JSON.
 */
function loadLocale(lang) {
  const filePath = path.join(LOCALES_DIR, `${lang}.json`);

  if (!fs.existsSync(filePath)) {
    console.error(`[ERROR] Locale file not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] Failed to parse ${filePath}: ${err.message}`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Article template processing (future feature)
// ---------------------------------------------------------------------------

/**
 * Process article templates (files matching templates/articles/_*.html).
 * Each article data JSON in articles/data/ generates PL + EN pages.
 *
 * Article data JSON format:
 * {
 *   "slug": "optimizing-images-avif",
 *   "pl": { "title": "...", "content": "..." },
 *   "en": { "title": "...", "content": "..." }
 * }
 *
 * Output:
 *   articles/{slug}/index.html (PL)
 *   en/articles/{slug}/index.html (EN)
 */
function processArticleTemplates(locales) {
  const articlesDir = path.join(TEMPLATES_DIR, 'articles');

  // Skip if no article templates directory exists
  if (!fs.existsSync(articlesDir)) {
    return 0;
  }

  // Find article templates (prefixed with _)
  const articleTemplates = fs.readdirSync(articlesDir)
    .filter(f => f.startsWith('_') && f.endsWith('.html'));

  if (articleTemplates.length === 0) {
    return 0;
  }

  // Check for article data files
  if (!fs.existsSync(ARTICLES_DATA_DIR)) {
    return 0;
  }

  const dataFiles = fs.readdirSync(ARTICLES_DATA_DIR)
    .filter(f => f.endsWith('.json'));

  if (dataFiles.length === 0) {
    return 0;
  }

  let count = 0;

  for (const templateFile of articleTemplates) {
    const templatePath = path.join(articlesDir, templateFile);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    for (const dataFile of dataFiles) {
      const dataPath = path.join(ARTICLES_DATA_DIR, dataFile);
      let articleData;

      try {
        articleData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      } catch (err) {
        console.warn(`[WARN] Skipping invalid article data: ${dataFile} — ${err.message}`);
        continue;
      }

      const slug = articleData.slug || path.basename(dataFile, '.json');

      for (const lang of LANGUAGES) {
        // Merge: locale + article's lang-specific data + built-in vars
        const articleLangData = articleData[lang] || {};
        const context = {
          ...locales[lang],
          ...articleLangData,
          article: articleData,
          lang,
          altLang: lang === 'pl' ? 'en' : 'pl',
          LANG: lang.toUpperCase(),
          ALT_LANG: (lang === 'pl' ? 'en' : 'pl').toUpperCase(),
          baseUrl: BASE_URL,
          currentUrl: lang === DEFAULT_LANG
            ? `${BASE_URL}/articles/${slug}/`
            : `${BASE_URL}/en/articles/${slug}/`,
          altUrl: lang === DEFAULT_LANG
            ? `${BASE_URL}/en/articles/${slug}/`
            : `${BASE_URL}/articles/${slug}/`,
          pathPrefix: lang === DEFAULT_LANG ? '' : '/en',
          cssPath: lang === DEFAULT_LANG ? '../../assets' : '../../../assets',
        };

        const rendered = renderTemplate(templateContent, context);

        const outputPath = lang === DEFAULT_LANG
          ? path.join(ROOT_DIR, 'articles', slug, 'index.html')
          : path.join(ROOT_DIR, 'en', 'articles', slug, 'index.html');

        ensureDir(path.dirname(outputPath));
        fs.writeFileSync(outputPath, rendered, 'utf-8');

        const relOutput = path.relative(ROOT_DIR, outputPath).replace(/\\/g, '/');
        console.log(`  [${lang.toUpperCase()}] ${relOutput}`);
        count++;
      }
    }
  }

  return count;
}

// ---------------------------------------------------------------------------
// Main build
// ---------------------------------------------------------------------------

function main() {
  const startTime = Date.now();
  console.log('');
  console.log('=== build-i18n: Generating static HTML from templates ===');
  console.log('');

  // Verify templates directory
  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`[ERROR] Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  // Load locale files
  const locales = {};
  for (const lang of LANGUAGES) {
    locales[lang] = loadLocale(lang);
  }
  console.log(`Loaded locales: ${LANGUAGES.join(', ')}`);

  // Discover template files (top-level .html files only, not in subdirectories)
  const templateFiles = fs.readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith('.html'));

  if (templateFiles.length === 0) {
    console.warn('[WARN] No .html templates found in templates/ directory.');
    return;
  }

  console.log(`Found ${templateFiles.length} template(s): ${templateFiles.join(', ')}`);
  console.log('');

  let pageCount = 0;

  // Process each template for each language
  for (const templateFile of templateFiles) {
    const templatePath = path.join(TEMPLATES_DIR, templateFile);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    console.log(`Processing: ${templateFile}`);

    for (const lang of LANGUAGES) {
      const context = buildContext(locales[lang], lang, templateFile);
      const rendered = renderTemplate(templateContent, context);

      const outputPath = getOutputPath(templateFile, lang);
      ensureDir(path.dirname(outputPath));
      fs.writeFileSync(outputPath, rendered, 'utf-8');

      const relOutput = path.relative(ROOT_DIR, outputPath).replace(/\\/g, '/');
      console.log(`  [${lang.toUpperCase()}] ${relOutput}`);
      pageCount++;
    }
  }

  // Process article templates (if any)
  const articleCount = processArticleTemplates(locales);
  pageCount += articleCount;

  // Summary
  const elapsed = Date.now() - startTime;
  console.log('');
  console.log(`Done! Generated ${pageCount} page(s) in ${elapsed}ms.`);
  console.log('');
}

main();
