// ============================================
// FormattedAI — SEO & GEO Tag Generator Logic
// ============================================

// --- i18n ---
const translations = {
  pl: {
    subtitle: 'SEO & GEO Tag Generator',
    clear: 'Wyczy\u015B\u0107',
    copyAll: 'Kopiuj wszystko',
    copy: 'Kopiuj',
    inputTitle: 'Generator',
    outputTitle: 'Wynik',
    previewTitle: 'Podgl\u0105d',
    noImage: 'Brak obrazka',
    madeBy: 'Stworzone przez',
    toastCopied: 'Skopiowano!',
    toastCleared: 'Wyczyszczono!',
    labelTitle: 'Tytu\u0142',
    labelDesc: 'Opis',
    labelLang: 'J\u0119zyk',
    labelRobots: 'Robots',
    labelKeywords: 'S\u0142owa kluczowe',
    hintKeywords: 'opcjonalne, rozdzielone przecinkami',
    labelSchemaType: 'Typ Schema',
    labelOrgName: 'Nazwa organizacji',
    labelSiteName: 'Nazwa strony',
    labelSearchAction: 'Dodaj SearchAction (sitelinks)',
    labelAuthor: 'Autor',
    labelProjectName: 'Nazwa projektu (H1)',
    labelSummary: 'Kr\u00F3tki opis (blockquote)',
    labelContext: 'Dodatkowy kontekst',
    labelPreset: 'Preset',
    addFaq: 'Dodaj pytanie',
    addBreadcrumb: 'Dodaj element',
    addSection: 'Dodaj sekcj\u0119',
    editRaw: 'Edytuj r\u0119cznie',
    editForm: 'Wr\u00F3\u0107 do formularza',
    faqHint: 'Dodaj pytania i odpowiedzi. FAQPage ma najwy\u017Csz\u0105 szans\u0119 na cytowanie przez AI.',
    breadcrumbHint: 'Dodaj elementy \u015Bcie\u017Cki nawigacji.',
    llmsHint: 'Plik informuj\u0105cy AI o Twojej stronie. Umieszczany w /llms.txt',
    robotsHint: 'Konfiguracja dost\u0119pu AI crawler\u00F3w do Twojej strony.',
    autofillHint: 'Puste pola uzupe\u0142nia automatycznie z SEO',
    presetAllowAll: 'Pozw\u00F3l wszystkim AI',
    presetBlockTrain: 'Blokuj training, pozw\u00F3l search (rekomendowane)',
    presetBlockAll: 'Blokuj wszystkie AI',
    advancedCrawlers: 'Zaawansowane \u2014 per crawler',
    pageTitle: 'SEO & GEO Tag Generator \u2014 FormattedAI',
    question: 'Pytanie',
    answer: 'Odpowied\u017A',
    name: 'Nazwa',
    url: 'URL',
    sectionTitle: 'Tytu\u0142 sekcji',
    linkName: 'Nazwa linku',
    linkUrl: 'URL linku',
    linkDesc: 'Opis',
    // Modal
    modalTitle: 'SEO & GEO Tag Generator',
    modalDesc: '<strong>SEO</strong> optymalizuje stron\u0119 pod Google. <strong>GEO</strong> optymalizuje pod AI wyszukiwarki (ChatGPT Search, Perplexity, Google AI Overview). To narz\u0119dzie generuje oba zestawy tag\u00F3w z jednego formularza.',
    modalHowTitle: 'Jak u\u017Cywa\u0107',
    modalStep1: 'Wype\u0142nij formularz SEO \u2014 tytu\u0142, opis, URL',
    modalStep2: 'Przejd\u017A do sekcji GEO \u2014 Schema.org, llms.txt, robots.txt',
    modalStep3: 'Skopiuj wygenerowane tagi i wklej do kodu strony',
    modalFeaturesTitle: 'Kluczowe funkcje',
    modalFeat1: 'Meta tagi SEO, Open Graph i Twitter Cards',
    modalFeat2: 'Schema.org JSON-LD (Organization, Article, FAQPage i inne)',
    modalFeat3: 'Generator llms.txt i robots.txt z presetami AI crawler\u00F3w',
    modalFeat4: 'Podgl\u0105d SERP i social media na \u017Cywo',
    modalFeat5: '100% client-side \u2014 Twoje dane nigdy nie opuszczaj\u0105 urz\u0105dzenia',
    // Tooltips
    helpTitle: 'Tytu\u0142 strony wy\u015Bwietlany w karcie przegl\u0105darki i wynikach Google. Optymalnie 50-60 znak\u00F3w.',
    helpDesc: 'Opis strony wy\u015Bwietlany pod tytu\u0142em w wynikach Google. Optymalnie 150-160 znak\u00F3w. Powinien zach\u0119ca\u0107 do klikni\u0119cia.',
    helpRobots: 'Instrukcje dla robot\u00F3w wyszukiwarek. "max-snippet:-1" pozwala Google AI Overview wyci\u0105gn\u0105\u0107 dowoln\u0105 ilo\u015B\u0107 tekstu.',
    helpOgImage: 'Obrazek wy\u015Bwietlany przy udost\u0119pnianiu na Facebooku/LinkedIn. Zalecany rozmiar: 1200\u00D7630px.',
    helpSchema: 'Schema.org to format danych strukturalnych rozumiany przez Google i AI. FAQPage ma najwy\u017Csz\u0105 szans\u0119 na cytowanie przez AI wyszukiwarki.',
    // SEO content section
    seoH1: 'SEO & GEO Tag Generator \u2014 Darmowy generator meta tag\u00F3w, Schema.org i llms.txt',
    seoDescLong: 'Wygeneruj wszystkie tagi potrzebne Twojej stronie do pozycjonowania w Google i cytowania przez AI. Narz\u0119dzie obejmuje klasyczne SEO (meta tagi, Open Graph, Twitter Cards), nowoczesne dane strukturalne (Schema.org JSON-LD) i najnowszy standard GEO (Generative Engine Optimization) z llms.txt i konfiguracj\u0105 AI crawler\u00F3w.',
    seoWhatSeo: 'Czym jest SEO?',
    seoWhatSeoText: 'SEO (Search Engine Optimization) to optymalizacja strony pod wyszukiwarki jak Google. Kluczowe elementy to meta title i description, tagi Open Graph do udost\u0119pniania w mediach spo\u0142eczno\u015Bciowych, Twitter Cards, canonical URL i dane strukturalne. To narz\u0119dzie generuje to wszystko z jednego formularza.',
    seoWhatGeo: 'Czym jest GEO (Generative Engine Optimization)?',
    seoWhatGeoText: 'GEO to nowy standard optymalizacji pod AI wyszukiwarki \u2014 ChatGPT Search, Perplexity AI, Google AI Overview. Zamiast walczy\u0107 o 10 niebieskich link\u00F3w, walczysz o 2-7 slot\u00F3w cytowa\u0144 w odpowiedziach AI. Kluczowe narz\u0119dzia GEO to Schema.org (zw\u0142aszcza FAQPage), plik llms.txt i konfiguracja robots.txt dla AI crawler\u00F3w.',
    seoFeaturesTitle: 'Funkcje',
    seoGeoFeat1: 'Meta tagi SEO z licznikami znak\u00F3w i podpowiedziami',
    seoGeoFeat2: 'Tagi Open Graph z auto-uzupe\u0142nianiem z SEO',
    seoGeoFeat3: 'Generowanie Twitter Cards',
    seoGeoFeat4: 'Schema.org JSON-LD: Organization, WebSite, Article, FAQPage, BreadcrumbList',
    seoGeoFeat5: 'Generator llms.txt z formularzem i edytorem',
    seoGeoFeat6: 'robots.txt z presetami AI crawler\u00F3w',
    seoGeoFeat7: 'Podgl\u0105d SERP i social media na \u017Cywo',
    seoGeoFeat8: 'Kopiowanie per sekcja lub ca\u0142o\u015B\u0107 HTML',
    seoGeoFeat9: 'Auto-zapis do localStorage',
    seoFaqTitle: 'Cz\u0119sto zadawane pytania',
    seoGeoFaq1q: 'Czym jest GEO i dlaczego jest wa\u017Cne?',
    seoGeoFaq1a: 'GEO (Generative Engine Optimization) optymalizuje tre\u015B\u0107 pod AI wyszukiwarki. Ponad 40% zapyta\u0144 w 2026 jest odpowiadanych przez AI. Bez optymalizacji GEO Twoja tre\u015B\u0107 mo\u017Ce by\u0107 niewidoczna dla ChatGPT Search, Perplexity i Google AI Overview.',
    seoGeoFaq2q: 'Czym jest llms.txt?',
    seoGeoFaq2a: 'llms.txt to nowy standard (podobny do robots.txt), kt\u00F3ry informuje modele AI o Twojej stronie. To plik Markdown w katalogu g\u0142\u00F3wnym zawieraj\u0105cy nazw\u0119 projektu, opis i linki do kluczowych tre\u015Bci.',
    seoGeoFaq3q: 'Jak zoptymalizowa\u0107 stron\u0119 pod AI wyszukiwarki?',
    seoGeoFaq3a: 'Trzy kroki: 1) Dodaj dane strukturalne Schema.org \u2014 zw\u0142aszcza FAQPage. 2) Stw\u00F3rz plik llms.txt opisuj\u0105cy Twoj\u0105 stron\u0119. 3) Skonfiguruj robots.txt \u017Ceby blokowa\u0107 AI training ale pozwala\u0107 AI search. To narz\u0119dzie generuje wszystkie trzy.',
  },
  en: {
    subtitle: 'SEO & GEO Tag Generator',
    clear: 'Clear',
    copyAll: 'Copy all',
    copy: 'Copy',
    inputTitle: 'Generator',
    outputTitle: 'Output',
    previewTitle: 'Preview',
    noImage: 'No image',
    madeBy: 'Created by',
    toastCopied: 'Copied!',
    toastCleared: 'Cleared!',
    labelTitle: 'Title',
    labelDesc: 'Description',
    labelLang: 'Language',
    labelRobots: 'Robots',
    labelKeywords: 'Keywords',
    hintKeywords: 'optional, comma-separated',
    labelSchemaType: 'Schema type',
    labelOrgName: 'Organization name',
    labelSiteName: 'Site name',
    labelSearchAction: 'Add SearchAction (sitelinks)',
    labelAuthor: 'Author',
    labelProjectName: 'Project name (H1)',
    labelSummary: 'Short description (blockquote)',
    labelContext: 'Additional context',
    labelPreset: 'Preset',
    addFaq: 'Add question',
    addBreadcrumb: 'Add item',
    addSection: 'Add section',
    editRaw: 'Edit raw',
    editForm: 'Back to form',
    faqHint: 'Add questions and answers. FAQPage has the highest chance of being cited by AI.',
    breadcrumbHint: 'Add breadcrumb navigation items.',
    llmsHint: 'A file that tells AI about your site. Place at /llms.txt',
    robotsHint: 'Configure AI crawler access to your site.',
    autofillHint: 'Empty fields auto-fill from SEO section',
    presetAllowAll: 'Allow all AI',
    presetBlockTrain: 'Block training, allow search (recommended)',
    presetBlockAll: 'Block all AI',
    advancedCrawlers: 'Advanced \u2014 per crawler',
    pageTitle: 'SEO & GEO Tag Generator \u2014 FormattedAI',
    question: 'Question',
    answer: 'Answer',
    name: 'Name',
    url: 'URL',
    sectionTitle: 'Section title',
    linkName: 'Link name',
    linkUrl: 'Link URL',
    linkDesc: 'Description',
    // Modal
    modalTitle: 'SEO & GEO Tag Generator',
    modalDesc: '<strong>SEO</strong> optimizes your page for Google. <strong>GEO</strong> optimizes for AI search engines (ChatGPT Search, Perplexity, Google AI Overview). This tool generates both sets of tags from a single form.',
    modalHowTitle: 'How to use',
    modalStep1: 'Fill in the SEO form \u2014 title, description, URL',
    modalStep2: 'Go to GEO sections \u2014 Schema.org, llms.txt, robots.txt',
    modalStep3: 'Copy generated tags and paste into your page code',
    modalFeaturesTitle: 'Key features',
    modalFeat1: 'SEO meta tags, Open Graph and Twitter Cards',
    modalFeat2: 'Schema.org JSON-LD (Organization, Article, FAQPage and more)',
    modalFeat3: 'llms.txt and robots.txt generator with AI crawler presets',
    modalFeat4: 'Live SERP and social media preview',
    modalFeat5: '100% client-side \u2014 your data never leaves your device',
    // Tooltips
    helpTitle: 'Page title shown in browser tab and Google results. Optimal length: 50-60 characters.',
    helpDesc: 'Page description shown below the title in Google results. Optimal: 150-160 chars. Should encourage clicks.',
    helpRobots: 'Instructions for search engine bots. "max-snippet:-1" lets Google AI Overview extract unlimited text.',
    helpOgImage: 'Image shown when sharing on Facebook/LinkedIn. Recommended size: 1200\u00D7630px.',
    helpSchema: 'Schema.org is a structured data format understood by Google and AI. FAQPage has the highest chance of being cited by AI search engines.',
    // SEO content section
    seoH1: 'SEO & GEO Tag Generator — Free Meta Tags, Schema.org and llms.txt Generator',
    seoDescLong: 'Generate all the tags your website needs to rank in Google and get cited by AI search engines. This tool covers traditional SEO (meta tags, Open Graph, Twitter Cards), modern structured data (Schema.org JSON-LD), and the cutting-edge GEO standard (Generative Engine Optimization) with llms.txt and AI crawler configuration.',
    seoWhatSeo: 'What is SEO?',
    seoWhatSeoText: 'SEO (Search Engine Optimization) is the practice of optimizing your website to rank higher in search engines like Google. Key elements include meta title and description tags, Open Graph tags for social sharing, Twitter Cards, canonical URLs, and structured data. This tool generates all of these from a single form.',
    seoWhatGeo: 'What is GEO (Generative Engine Optimization)?',
    seoWhatGeoText: 'GEO is a new optimization standard for AI-powered search engines — ChatGPT Search, Perplexity AI, Google AI Overview. Instead of competing for 10 blue links, you compete for 2-7 citation slots in AI-generated answers. Key GEO tools include Schema.org structured data (especially FAQPage), the llms.txt file, and robots.txt configuration for AI crawlers.',
    seoFeaturesTitle: 'Features',
    seoGeoFeat1: 'SEO meta tags with character counters and validation hints',
    seoGeoFeat2: 'Open Graph tags with auto-fill from SEO fields',
    seoGeoFeat3: 'Twitter Cards generation',
    seoGeoFeat4: 'Schema.org JSON-LD for Organization, WebSite, Article, FAQPage, BreadcrumbList',
    seoGeoFeat5: 'llms.txt generator with guided form and raw editor',
    seoGeoFeat6: 'robots.txt with AI crawler presets (block training, allow search)',
    seoGeoFeat7: 'Live SERP and social media preview',
    seoGeoFeat8: 'Copy per section or copy all HTML at once',
    seoGeoFeat9: 'Auto-save to localStorage — never lose your work',
    seoFaqTitle: 'Frequently Asked Questions',
    seoGeoFaq1q: 'What is GEO and why does it matter?',
    seoGeoFaq1a: 'GEO (Generative Engine Optimization) optimizes your content for AI search engines. Over 40% of search queries in 2026 are answered by AI. Without GEO optimization, your content may be invisible to ChatGPT Search, Perplexity, and Google AI Overview.',
    seoGeoFaq2q: 'What is llms.txt?',
    seoGeoFaq2a: 'llms.txt is a new standard (similar to robots.txt) that tells AI models about your website. It\'s a Markdown file placed at your site root (/llms.txt) containing your project name, description, and links to key content.',
    seoGeoFaq3q: 'How do I optimize my site for AI search engines?',
    seoGeoFaq3a: 'Three key steps: 1) Add Schema.org structured data — especially FAQPage which has the highest AI citation rate. 2) Create an llms.txt file describing your site. 3) Configure robots.txt to block AI training crawlers but allow AI search crawlers. This tool generates all three.',
  },
};

// --- State ---
let currentLang = localStorage.getItem('formattedai-lang') || 'pl';
let currentTheme = localStorage.getItem('formattedai-theme') || 'light';
const STORAGE_KEY = 'formattedai-seogeo';

// --- AI Crawlers config ---
const AI_CRAWLERS = [
  { name: 'GPTBot', type: 'training', company: 'OpenAI' },
  { name: 'OAI-SearchBot', type: 'search', company: 'OpenAI' },
  { name: 'ChatGPT-User', type: 'user', company: 'OpenAI' },
  { name: 'ClaudeBot', type: 'training', company: 'Anthropic' },
  { name: 'anthropic-ai', type: 'training', company: 'Anthropic' },
  { name: 'PerplexityBot', type: 'search', company: 'Perplexity' },
  { name: 'Google-Extended', type: 'training', company: 'Google' },
];

// --- DOM ---
const langToggle = document.getElementById('langToggle');
const langFlag = document.getElementById('langFlag');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const toast = document.getElementById('toast');
const formArea = document.getElementById('formArea');
const outputArea = document.getElementById('outputArea');

// SEO fields
const seoTitle = document.getElementById('seoTitle');
const seoDesc = document.getElementById('seoDesc');
const seoUrl = document.getElementById('seoUrl');
const seoLang = document.getElementById('seoLang');
const seoKeywords = document.getElementById('seoKeywords');
const robotsIndex = document.getElementById('robotsIndex');
const robotsFollow = document.getElementById('robotsFollow');
const robotsMaxSnippet = document.getElementById('robotsMaxSnippet');
const robotsMaxImage = document.getElementById('robotsMaxImage');

// OG fields
const ogTitle = document.getElementById('ogTitle');
const ogDesc = document.getElementById('ogDesc');
const ogUrl = document.getElementById('ogUrl');
const ogImage = document.getElementById('ogImage');
const ogType = document.getElementById('ogType');
const ogSiteName = document.getElementById('ogSiteName');
const ogLocale = document.getElementById('ogLocale');
const ogArticleFields = document.getElementById('ogArticleFields');
const ogAuthor = document.getElementById('ogAuthor');
const ogPublished = document.getElementById('ogPublished');
const ogModified = document.getElementById('ogModified');

// Twitter fields
const twCard = document.getElementById('twCard');
const twTitle = document.getElementById('twTitle');
const twDesc = document.getElementById('twDesc');
const twImage = document.getElementById('twImage');
const twSite = document.getElementById('twSite');

// Schema fields
const schemaType = document.getElementById('schemaType');

// llms.txt fields
const llmsName = document.getElementById('llmsName');
const llmsSummary = document.getElementById('llmsSummary');
const llmsContext = document.getElementById('llmsContext');
const llmsToggleBtn = document.getElementById('llmsToggleBtn');
const llmsForm = document.getElementById('llmsForm');
const llmsRaw = document.getElementById('llmsRaw');
const llmsRawEditor = document.getElementById('llmsRawEditor');

// Output elements
const outputSeoCode = document.getElementById('outputSeoCode');
const outputOgCode = document.getElementById('outputOgCode');
const outputTwitterCode = document.getElementById('outputTwitterCode');
const outputSchemaCode = document.getElementById('outputSchemaCode');
const outputLlmsCode = document.getElementById('outputLlmsCode');
const outputRobotsCode = document.getElementById('outputRobotsCode');

// Previews
const serpUrl = document.getElementById('serpUrl');
const serpTitle = document.getElementById('serpTitle');
const serpDesc = document.getElementById('serpDesc');
const ogPreviewImg = document.getElementById('ogPreviewImg');
const ogPreviewSite = document.getElementById('ogPreviewSite');
const ogPreviewTitle = document.getElementById('ogPreviewTitle');
const ogPreviewDesc = document.getElementById('ogPreviewDesc');

// Dynamic lists
let faqItems = [];
let breadcrumbItems = [];
let llmsSections = [];
let faqIdCounter = 0;
let breadcrumbIdCounter = 0;
let llmsSectionIdCounter = 0;
let llmsRawMode = false;

// --- i18n ---
function t(key) {
  return translations[currentLang][key] || translations.pl[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');
  langFlag.textContent = currentLang === 'pl' ? 'PL' : 'EN';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val.includes('<')) { el.innerHTML = val; } else { el.textContent = val; }
  });
  localStorage.setItem('formattedai-lang', currentLang);
  generateAll();
}

function toggleLanguage() {
  currentLang = currentLang === 'pl' ? 'en' : 'pl';
  applyLanguage();
}

// --- Theme ---
function applyTheme() {
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('formattedai-theme', currentTheme);
}

function toggleTheme() {
  document.documentElement.classList.add('theme-switching');
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-switching');
    });
  });
}

// --- Toast ---
function showToast(msg) {
  toast.querySelector('.toast__text').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Accordion ---
function setupAccordions() {
  formArea.querySelectorAll('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const isOpen = header.classList.contains('accordion__header--open');
      const body = header.nextElementSibling;
      if (isOpen) {
        header.classList.remove('accordion__header--open');
        header.setAttribute('aria-expanded', 'false');
        body.hidden = true;
      } else {
        header.classList.add('accordion__header--open');
        header.setAttribute('aria-expanded', 'true');
        body.hidden = false;
      }
    });
  });
}

// --- Autofill helpers ---
function getVal(el) { return el.value.trim(); }

function getOrFallback(el, fallbackEl) {
  const val = getVal(el);
  return val || getVal(fallbackEl);
}

// --- Character counter ---
function updateCounter(input) {
  const counterId = input.dataset.counter;
  if (!counterId) return;
  const counter = document.getElementById(counterId);
  if (!counter) return;
  const len = input.value.length;
  const min = parseInt(input.dataset.min) || 0;
  const max = parseInt(input.dataset.max) || 999;
  counter.textContent = `${len} / ${max}`;
  counter.className = 'form-label__counter';
  if (len >= min && len <= max) counter.classList.add('form-label__counter--ok');
  else if (len > max) counter.classList.add('form-label__counter--over');
  else if (len > 0) counter.classList.add('form-label__counter--warn');
}

// --- Escape HTML ---
function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- Generate SEO ---
function generateSeo() {
  const lines = [];
  const title = getVal(seoTitle);
  const desc = getVal(seoDesc);
  const url = getVal(seoUrl);
  const lang = seoLang.value;
  const keywords = getVal(seoKeywords);

  if (title) lines.push(`<title>${esc(title)}</title>`);
  if (desc) lines.push(`<meta name="description" content="${esc(desc)}">`);
  if (url) lines.push(`<link rel="canonical" href="${esc(url)}">`);
  if (keywords) lines.push(`<meta name="keywords" content="${esc(keywords)}">`);

  // robots
  const robotsParts = [];
  robotsParts.push(robotsIndex.checked ? 'index' : 'noindex');
  robotsParts.push(robotsFollow.checked ? 'follow' : 'nofollow');
  if (robotsMaxSnippet.checked) robotsParts.push('max-snippet:-1');
  if (robotsMaxImage.checked) robotsParts.push('max-image-preview:large');
  lines.push(`<meta name="robots" content="${robotsParts.join(', ')}">`);

  lines.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`);

  outputSeoCode.textContent = lines.join('\n');

  // Update previews
  serpTitle.textContent = title || 'Page Title';
  serpDesc.textContent = desc || 'Page description will appear here...';
  serpUrl.textContent = url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'example.com';
}

// --- Generate OG ---
function generateOg() {
  const lines = [];
  const title = getOrFallback(ogTitle, seoTitle);
  const desc = getOrFallback(ogDesc, seoDesc);
  const url = getOrFallback(ogUrl, seoUrl);
  const image = getVal(ogImage);
  const type = ogType.value;
  const siteName = getVal(ogSiteName);
  const locale = getVal(ogLocale);

  if (type) lines.push(`<meta property="og:type" content="${esc(type)}">`);
  if (title) lines.push(`<meta property="og:title" content="${esc(title)}">`);
  if (desc) lines.push(`<meta property="og:description" content="${esc(desc)}">`);
  if (url) lines.push(`<meta property="og:url" content="${esc(url)}">`);
  if (image) lines.push(`<meta property="og:image" content="${esc(image)}">`);
  if (siteName) lines.push(`<meta property="og:site_name" content="${esc(siteName)}">`);
  if (locale) lines.push(`<meta property="og:locale" content="${esc(locale)}">`);

  // Article-specific
  if (type === 'article') {
    const author = getVal(ogAuthor);
    const published = getVal(ogPublished);
    const modified = getVal(ogModified);
    if (author) lines.push(`<meta property="article:author" content="${esc(author)}">`);
    if (published) lines.push(`<meta property="article:published_time" content="${esc(published)}">`);
    if (modified) lines.push(`<meta property="article:modified_time" content="${esc(modified)}">`);
  }

  outputOgCode.textContent = lines.join('\n');

  // Update OG preview
  ogPreviewTitle.textContent = title || 'Page Title';
  ogPreviewDesc.textContent = desc || 'Description';
  ogPreviewSite.textContent = siteName || (url ? url.replace(/^https?:\/\//, '').split('/')[0] : 'example.com');
  if (image) {
    ogPreviewImg.textContent = '';
    ogPreviewImg.style.backgroundImage = `url("${image.replace(/["\\()]/g, '')}")`;
  } else {
    ogPreviewImg.style.backgroundImage = '';
    ogPreviewImg.textContent = t('noImage');
  }
}

// --- Generate Twitter ---
function generateTwitter() {
  const lines = [];
  const card = twCard.value;
  const title = getOrFallback(twTitle, seoTitle);
  const desc = getOrFallback(twDesc, seoDesc);
  const image = getOrFallback(twImage, ogImage);
  const site = getVal(twSite);

  if (card) lines.push(`<meta name="twitter:card" content="${esc(card)}">`);
  if (title) lines.push(`<meta name="twitter:title" content="${esc(title)}">`);
  if (desc) lines.push(`<meta name="twitter:description" content="${esc(desc)}">`);
  if (image) lines.push(`<meta name="twitter:image" content="${esc(image)}">`);
  if (site) lines.push(`<meta name="twitter:site" content="${esc(site)}">`);

  outputTwitterCode.textContent = lines.join('\n');
}

// --- Generate Schema.org ---
function generateSchema() {
  const type = schemaType.value;
  let schema = null;

  if (type === 'Organization') {
    const name = getVal(document.getElementById('orgName'));
    const url = getOrFallback(document.getElementById('orgUrl'), seoUrl);
    const logo = getVal(document.getElementById('orgLogo'));
    const sameAs = getVal(document.getElementById('orgSameAs')).split('\n').map(s => s.trim()).filter(Boolean);
    if (name) {
      schema = { '@context': 'https://schema.org', '@type': 'Organization', name, url: url || undefined, logo: logo || undefined };
      if (sameAs.length) schema.sameAs = sameAs;
    }
  } else if (type === 'WebSite') {
    const name = getOrFallback(document.getElementById('wsName'), ogSiteName);
    const url = getOrFallback(document.getElementById('wsUrl'), seoUrl);
    const hasSearch = document.getElementById('wsSearchAction').checked;
    if (name) {
      schema = { '@context': 'https://schema.org', '@type': 'WebSite', name, url: url || undefined };
      if (hasSearch) {
        const target = getVal(document.getElementById('wsSearchTarget'));
        if (target) {
          schema.potentialAction = { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: target }, 'query-input': 'required name=search_term_string' };
        }
      }
    }
  } else if (type === 'Article') {
    const headline = getOrFallback(document.getElementById('artHeadline'), seoTitle);
    const author = getVal(document.getElementById('artAuthor'));
    const published = getVal(document.getElementById('artPublished'));
    const modified = getVal(document.getElementById('artModified'));
    const image = getOrFallback(document.getElementById('artImage'), ogImage);
    const publisher = getOrFallback(document.getElementById('artPublisher'), ogSiteName);
    const keywords = getOrFallback(document.getElementById('artKeywords'), seoKeywords);
    if (headline) {
      schema = { '@context': 'https://schema.org', '@type': 'Article', headline };
      if (author) schema.author = { '@type': 'Person', name: author };
      if (published) schema.datePublished = published;
      if (modified) schema.dateModified = modified;
      if (image) schema.image = image;
      if (publisher) schema.publisher = { '@type': 'Organization', name: publisher };
      if (keywords) schema.keywords = keywords;
    }
  } else if (type === 'FAQPage') {
    if (faqItems.length) {
      schema = {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqItems.map(faq => ({
          '@type': 'Question', name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        })).filter(q => q.name && q.acceptedAnswer.text)
      };
      if (!schema.mainEntity.length) schema = null;
    }
  } else if (type === 'BreadcrumbList') {
    if (breadcrumbItems.length) {
      schema = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((item, i) => ({
          '@type': 'ListItem', position: i + 1, name: item.name, item: item.url || undefined
        })).filter(el => el.name)
      };
      if (!schema.itemListElement.length) schema = null;
    }
  }

  if (schema) {
    // Remove undefined values
    const clean = JSON.parse(JSON.stringify(schema));
    outputSchemaCode.textContent = `<script type="application/ld+json">\n${JSON.stringify(clean, null, 2)}\n</script>`;
  } else {
    outputSchemaCode.textContent = '';
  }
}

// --- Generate llms.txt ---
function generateLlms() {
  if (llmsRawMode) {
    outputLlmsCode.textContent = llmsRawEditor.value;
    return;
  }

  const lines = [];
  const name = getOrFallback(llmsName, ogSiteName);
  const summary = getVal(llmsSummary);
  const context = getVal(llmsContext);

  if (name) lines.push(`# ${name}`);
  if (summary) lines.push(`\n> ${summary}`);
  if (context) lines.push(`\n${context}`);

  llmsSections.forEach(section => {
    if (section.title) {
      lines.push(`\n## ${section.title}`);
      (section.links || []).forEach(link => {
        if (link.name && link.url) {
          lines.push(`- [${link.name}](${link.url})${link.desc ? ': ' + link.desc : ''}`);
        }
      });
    }
  });

  outputLlmsCode.textContent = lines.join('\n');
}

// --- Generate robots.txt ---
function generateRobots() {
  const preset = document.querySelector('input[name="robotsPreset"]:checked')?.value || 'block-train';
  const lines = ['User-agent: *', 'Allow: /'];

  if (preset === 'allow-all') {
    lines.push('', '# AI Crawlers: All allowed');
  } else if (preset === 'block-train') {
    lines.push('');
    lines.push('# Block AI training crawlers');
    AI_CRAWLERS.filter(c => c.type === 'training').forEach(c => {
      lines.push(`User-agent: ${c.name}`, 'Disallow: /', '');
    });
    lines.push('# Allow AI search crawlers');
    AI_CRAWLERS.filter(c => c.type === 'search').forEach(c => {
      lines.push(`User-agent: ${c.name}`, 'Allow: /', '');
    });
  } else if (preset === 'block-all') {
    lines.push('');
    lines.push('# Block all AI crawlers');
    AI_CRAWLERS.forEach(c => {
      lines.push(`User-agent: ${c.name}`, 'Disallow: /', '');
    });
  }

  const sitemapUrl = getVal(seoUrl);
  if (sitemapUrl) {
    try {
      const origin = new URL(sitemapUrl).origin;
      lines.push(`Sitemap: ${origin}/sitemap.xml`);
    } catch { /* invalid URL, skip sitemap */ }
  }

  outputRobotsCode.textContent = lines.join('\n');
}

// --- Generate All ---
function generateAll() {
  generateSeo();
  generateOg();
  generateTwitter();
  generateSchema();
  generateLlms();
  generateRobots();
  saveToStorage();
}

// --- Schema type switching ---
function switchSchemaType() {
  const type = schemaType.value;
  document.querySelectorAll('.schema-fields').forEach(el => el.hidden = true);
  const target = document.getElementById('schema' + type);
  if (target) target.hidden = false;
  generateSchema();
}

// --- OG type: show article fields ---
function handleOgTypeChange() {
  ogArticleFields.hidden = ogType.value !== 'article';
}

// --- WebSite SearchAction toggle ---
function handleSearchActionToggle() {
  const wsSearchUrl = document.getElementById('wsSearchUrl');
  wsSearchUrl.hidden = !document.getElementById('wsSearchAction').checked;
}

// --- FAQ dynamic list ---
function addFaqItem() {
  const id = ++faqIdCounter;
  faqItems.push({ id, question: '', answer: '' });
  renderFaqList();
}

function removeFaqItem(id) {
  faqItems = faqItems.filter(f => f.id !== id);
  renderFaqList();
  generateAll();
}

function renderFaqList() {
  const container = document.getElementById('faqList');
  container.innerHTML = '';
  faqItems.forEach(faq => {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
      <input class="form-input" type="text" placeholder="${t('question')}" value="${esc(faq.question)}" data-faq="${faq.id}" data-field="question">
      <textarea class="form-input form-input--textarea" rows="2" placeholder="${t('answer')}" data-faq="${faq.id}" data-field="answer">${esc(faq.answer)}</textarea>
      <button class="dynamic-item__remove" type="button" data-remove-faq="${faq.id}">&times;</button>`;
    container.appendChild(div);
  });

  container.querySelectorAll('[data-faq]').forEach(el => {
    el.addEventListener('input', () => {
      const item = faqItems.find(f => f.id === Number(el.dataset.faq));
      if (item) { item[el.dataset.field] = el.value; generateAll(); }
    });
  });

  container.querySelectorAll('[data-remove-faq]').forEach(btn => {
    btn.addEventListener('click', () => removeFaqItem(Number(btn.dataset.removeFaq)));
  });
}

// --- Breadcrumb dynamic list ---
function addBreadcrumbItem() {
  const id = ++breadcrumbIdCounter;
  breadcrumbItems.push({ id, name: '', url: '' });
  renderBreadcrumbList();
}

function removeBreadcrumbItem(id) {
  breadcrumbItems = breadcrumbItems.filter(b => b.id !== id);
  renderBreadcrumbList();
  generateAll();
}

function renderBreadcrumbList() {
  const container = document.getElementById('breadcrumbList');
  container.innerHTML = '';
  breadcrumbItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'dynamic-item';
    div.innerHTML = `
      <input class="form-input" type="text" placeholder="${t('name')}" value="${esc(item.name)}" data-bc="${item.id}" data-field="name">
      <input class="form-input" type="url" placeholder="${t('url')}" value="${esc(item.url)}" data-bc="${item.id}" data-field="url">
      <button class="dynamic-item__remove" type="button" data-remove-bc="${item.id}">&times;</button>`;
    container.appendChild(div);
  });

  container.querySelectorAll('[data-bc]').forEach(el => {
    el.addEventListener('input', () => {
      const item = breadcrumbItems.find(b => b.id === Number(el.dataset.bc));
      if (item) { item[el.dataset.field] = el.value; generateAll(); }
    });
  });

  container.querySelectorAll('[data-remove-bc]').forEach(btn => {
    btn.addEventListener('click', () => removeBreadcrumbItem(Number(btn.dataset.removeBc)));
  });
}

// --- llms.txt sections ---
function addLlmsSection() {
  const id = ++llmsSectionIdCounter;
  llmsSections.push({ id, title: '', links: [{ name: '', url: '', desc: '' }] });
  renderLlmsSections();
}

function renderLlmsSections() {
  const container = document.getElementById('llmsSections');
  container.innerHTML = '';
  llmsSections.forEach(section => {
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    let linksHtml = section.links.map((link, li) => `
      <div class="dynamic-link">
        <input class="form-input" type="text" placeholder="${t('linkName')}" value="${esc(link.name)}" data-llms="${section.id}" data-li="${li}" data-field="name">
        <input class="form-input" type="url" placeholder="${t('linkUrl')}" value="${esc(link.url)}" data-llms="${section.id}" data-li="${li}" data-field="url">
        <input class="form-input" type="text" placeholder="${t('linkDesc')}" value="${esc(link.desc)}" data-llms="${section.id}" data-li="${li}" data-field="desc">
      </div>`).join('');

    div.innerHTML = `
      <div class="dynamic-section__header">
        <input class="form-input" type="text" placeholder="${t('sectionTitle')}" value="${esc(section.title)}" data-llms-title="${section.id}">
        <button class="dynamic-item__remove" type="button" data-remove-llms="${section.id}">&times;</button>
      </div>
      ${linksHtml}
      <button class="btn btn--ghost btn--sm" type="button" data-add-llms-link="${section.id}">+ Link</button>`;
    container.appendChild(div);
  });

  // Bind events
  container.querySelectorAll('[data-llms-title]').forEach(el => {
    el.addEventListener('input', () => {
      const section = llmsSections.find(s => s.id === Number(el.dataset.llmsTitle));
      if (section) { section.title = el.value; generateAll(); }
    });
  });

  container.querySelectorAll('[data-llms]').forEach(el => {
    el.addEventListener('input', () => {
      const section = llmsSections.find(s => s.id === Number(el.dataset.llms));
      if (section && section.links[Number(el.dataset.li)]) {
        section.links[Number(el.dataset.li)][el.dataset.field] = el.value;
        generateAll();
      }
    });
  });

  container.querySelectorAll('[data-remove-llms]').forEach(btn => {
    btn.addEventListener('click', () => {
      llmsSections = llmsSections.filter(s => s.id !== Number(btn.dataset.removeLlms));
      renderLlmsSections();
      generateAll();
    });
  });

  container.querySelectorAll('[data-add-llms-link]').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = llmsSections.find(s => s.id === Number(btn.dataset.addLlmsLink));
      if (section) { section.links.push({ name: '', url: '', desc: '' }); renderLlmsSections(); }
    });
  });
}

// --- llms.txt raw toggle ---
function toggleLlmsMode() {
  llmsRawMode = !llmsRawMode;
  llmsForm.hidden = llmsRawMode;
  llmsRaw.hidden = !llmsRawMode;
  llmsToggleBtn.textContent = llmsRawMode ? t('editForm') : t('editRaw');
  if (llmsRawMode) {
    llmsRawEditor.value = outputLlmsCode.textContent;
  }
  generateAll();
}

// --- Copy ---
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast(t('toastCopied')));
}

function copyAll() {
  const parts = [outputSeoCode, outputOgCode, outputTwitterCode, outputSchemaCode, outputLlmsCode, outputRobotsCode]
    .map(el => el.textContent).filter(Boolean);
  copyText(parts.join('\n\n'));
}

// --- Clear ---
function clearAll() {
  formArea.querySelectorAll('input[type="text"], input[type="url"], input[type="date"], textarea').forEach(el => el.value = '');
  formArea.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
  robotsIndex.checked = true;
  robotsFollow.checked = true;
  robotsMaxSnippet.checked = false;
  robotsMaxImage.checked = false;
  faqItems = [];
  breadcrumbItems = [];
  llmsSections = [];
  renderFaqList();
  renderBreadcrumbList();
  renderLlmsSections();
  localStorage.removeItem(STORAGE_KEY);
  generateAll();
  showToast(t('toastCleared'));
}

// --- localStorage persistence ---
function saveToStorage() {
  const data = {};
  formArea.querySelectorAll('input[type="text"], input[type="url"], input[type="date"], textarea').forEach(el => {
    if (el.id) data[el.id] = el.value;
  });
  formArea.querySelectorAll('select').forEach(el => {
    if (el.id) data[el.id] = el.value;
  });
  data._robotsIndex = robotsIndex.checked;
  data._robotsFollow = robotsFollow.checked;
  data._robotsMaxSnippet = robotsMaxSnippet.checked;
  data._robotsMaxImage = robotsMaxImage.checked;
  data._robotsPreset = document.querySelector('input[name="robotsPreset"]:checked')?.value;
  data._faqItems = faqItems;
  data._breadcrumbItems = breadcrumbItems;
  data._llmsSections = llmsSections;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([key, val]) => {
      if (key.startsWith('_')) return;
      const el = document.getElementById(key);
      if (el) el.value = val || '';
    });
    if (data._robotsIndex !== undefined) robotsIndex.checked = data._robotsIndex;
    if (data._robotsFollow !== undefined) robotsFollow.checked = data._robotsFollow;
    if (data._robotsMaxSnippet !== undefined) robotsMaxSnippet.checked = data._robotsMaxSnippet;
    if (data._robotsMaxImage !== undefined) robotsMaxImage.checked = data._robotsMaxImage;
    if (data._robotsPreset) {
      const radio = document.querySelector(`input[name="robotsPreset"][value="${data._robotsPreset}"]`);
      if (radio) radio.checked = true;
    }
    if (data._faqItems) { faqItems = data._faqItems; faqIdCounter = Math.max(0, ...faqItems.map(f => f.id)); renderFaqList(); }
    if (data._breadcrumbItems) { breadcrumbItems = data._breadcrumbItems; breadcrumbIdCounter = Math.max(0, ...breadcrumbItems.map(b => b.id)); renderBreadcrumbList(); }
    if (data._llmsSections) { llmsSections = data._llmsSections; llmsSectionIdCounter = Math.max(0, ...llmsSections.map(s => s.id)); renderLlmsSections(); }
  } catch { /* ignore corrupt data */ }
}

// --- Crawler list (advanced) ---
function renderCrawlerList() {
  const container = document.getElementById('crawlerList');
  container.innerHTML = '';
  AI_CRAWLERS.forEach(crawler => {
    const div = document.createElement('div');
    div.className = 'form-crawler';
    div.innerHTML = `
      <span class="form-crawler__name">${crawler.name}</span>
      <span class="form-crawler__meta">${crawler.company} &middot; ${crawler.type}</span>`;
    container.appendChild(div);
  });
}

// --- Event Listeners ---
langToggle.addEventListener('click', toggleLanguage);
themeToggle.addEventListener('click', toggleTheme);
clearBtn.addEventListener('click', clearAll);
copyAllBtn.addEventListener('click', copyAll);

// Copy per section
document.querySelectorAll('.btn--copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target && target.textContent) {
      copyText(target.textContent);
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
    }
  });
});

// Schema type switch
schemaType.addEventListener('change', switchSchemaType);

// OG type change
ogType.addEventListener('change', () => { handleOgTypeChange(); generateAll(); });

// WebSite SearchAction toggle
document.getElementById('wsSearchAction').addEventListener('change', () => { handleSearchActionToggle(); generateAll(); });

// FAQ & Breadcrumb add buttons
document.getElementById('addFaqBtn').addEventListener('click', () => { addFaqItem(); generateAll(); });
document.getElementById('addBreadcrumbBtn').addEventListener('click', () => { addBreadcrumbItem(); generateAll(); });

// llms.txt
document.getElementById('addLlmsSectionBtn').addEventListener('click', () => { addLlmsSection(); generateAll(); });
llmsToggleBtn.addEventListener('click', toggleLlmsMode);
llmsRawEditor.addEventListener('input', generateAll);

// Robots preset change
document.querySelectorAll('input[name="robotsPreset"]').forEach(r => {
  r.addEventListener('change', generateAll);
});

// Live generation on any input change
formArea.addEventListener('input', (e) => {
  if (e.target.matches('.form-input, .form-select')) {
    updateCounter(e.target);
    generateAll();
  }
});

formArea.addEventListener('change', (e) => {
  if (e.target.matches('.form-select, input[type="checkbox"], input[type="radio"]')) {
    generateAll();
  }
});

// --- About Modal ---
const aboutTrigger = document.getElementById('aboutTrigger');
const aboutModal = document.getElementById('aboutModal');
const aboutModalClose = document.getElementById('aboutModalClose');

function openAboutModal() {
  aboutModal.hidden = false;
  requestAnimationFrame(() => aboutModal.classList.add('show'));
}

function closeAboutModal() {
  aboutModal.classList.remove('show');
  setTimeout(() => { aboutModal.hidden = true; }, 200);
}

aboutTrigger.addEventListener('click', openAboutModal);
aboutModalClose.addEventListener('click', closeAboutModal);
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) closeAboutModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !aboutModal.hidden) closeAboutModal();
});

// --- Tooltips ---
const tooltipPopup = document.getElementById('tooltipPopup');
const tooltipText = document.getElementById('tooltipText');

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.tooltip-btn');
  if (btn) {
    e.preventDefault();
    const key = btn.dataset.tooltip;
    const text = t(key);
    if (!text || text === key) { tooltipPopup.hidden = true; return; }

    tooltipText.textContent = text;
    tooltipPopup.hidden = false;

    // Position near button
    const rect = btn.getBoundingClientRect();
    tooltipPopup.style.top = `${rect.bottom + 8}px`;
    tooltipPopup.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - 340))}px`;
  } else if (!e.target.closest('.tooltip-popup')) {
    tooltipPopup.hidden = true;
  }
});

// --- Init ---
setupAccordions();
renderCrawlerList();
applyTheme();
loadFromStorage();
applyLanguage();

// Update counters on init
formArea.querySelectorAll('[data-counter]').forEach(updateCounter);
switchSchemaType();
handleOgTypeChange();
handleSearchActionToggle();
