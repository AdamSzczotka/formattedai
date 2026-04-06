// ============================================
// FormattedAI — HTML to PDF Converter Logic
// Client-side HTML editor with live preview + PDF export
// ============================================

// Dev: point to local PDF service; prod: relative paths (handled by proxy)
const API_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? 'http://localhost:3001'
  : '';

// --- i18n Translations ---
const translations = {
  pl: {
    subtitle: 'Konwertuj HTML na PDF',
    tabHtml: 'Wklej HTML',
    tabUrl: 'Z adresu URL',
    inputTitle: 'EDYTOR',
    previewTitle: 'PODGL\u0104D',
    clear: 'Wyczy\u015b\u0107',
    formatHtml: 'Formatuj',
    wrapOn: 'Zawijanie w\u0142.',
    wrapOff: 'Zawijanie wy\u0142.',
    privacyBadge: 'Tw\u00f3j HTML nie opuszcza przegl\u0105darki',
    urlLabel: 'Adres strony do konwersji',
    generate: 'Generuj PDF',
    generating: 'Generowanie PDF...',
    downloadPdf: 'Pobierz PDF',
    portrait: 'Pionowo',
    landscape: 'Poziomo',
    moreOptions: 'Wi\u0119cej opcji',
    lessOptions: 'Mniej opcji',
    margins: 'Marginesy',
    scale: 'Skala',
    printBg: 'Drukuj t\u0142a',
    hideHeaders: 'Ukryj nag\u0142\u00f3wki',
    previewEmpty: 'Wklej kod HTML po lewej stronie, a podgl\u0105d pojawi si\u0119 tutaj',
    exportPdf: 'Pobierz PDF',
    printFallback: 'Drukuj / Zapisz jako PDF',
    toastSuccess: 'PDF wygenerowany!',
    toastError: 'B\u0142\u0105d generowania PDF',
    toastCopied: 'Skopiowano!',
    toastLargeDoc: 'Du\u017cy dokument \u2014 podgl\u0105d na \u017c\u0105danie',
    errorEmpty: 'Wklej kod HTML przed eksportem',
    errorUrlInvalid: 'Podaj prawid\u0142owy adres URL (http:// lub https://)',
    errorServerDown: 'Serwer renderowania niedost\u0119pny \u2014 u\u017cyj opcji Drukuj',
    errorTimeout: 'Przekroczono limit czasu \u2014 spr\u00f3buj ponownie',
    errorGeneric: 'Wyst\u0105pi\u0142 b\u0142\u0105d \u2014 spr\u00f3buj ponownie',
    modalTitle: 'HTML to PDF Converter',
    modalDesc: 'Konwertuj kod <strong>HTML</strong> na plik PDF bezpo\u015brednio w przegl\u0105darce. Wklej kod HTML lub podaj adres URL \u2014 ca\u0142o\u015b\u0107 dzia\u0142a po stronie klienta, Twoje dane nigdy nie opuszczaj\u0105 urz\u0105dzenia.',
    modalHowTitle: 'Jak u\u017cywa\u0107',
    modalStep1: 'Wklej kod HTML do edytora lub podaj adres URL strony',
    modalStep2: 'Ustaw format strony, orientacj\u0119 i marginesy',
    modalStep3: 'Kliknij Pobierz PDF lub u\u017cyj funkcji drukowania',
    modalFeaturesTitle: 'Kluczowe funkcje',
    modalFeat1: 'Podgl\u0105d na \u017cywo podczas edycji kodu HTML',
    modalFeat2: 'Formaty: A3, A4, A5, Letter, Legal',
    modalFeat3: 'Orientacja pionowa i pozioma',
    modalFeat4: 'Konfigurowalne marginesy i skala',
    modalFeat5: '100% client-side \u2014 Twoje dane nigdy nie opuszczaj\u0105 urz\u0105dzenia',
    madeBy: 'Stworzone przez',
    footerBadge: '100% client-side',
    editorPlaceholder: 'Wklej tutaj kod HTML...',
    navArticles: 'Artyku\u0142y',
    navAbout: 'O nas',
    navPrivacy: 'Prywatno\u015b\u0107',
    navContact: 'Kontakt',
    seoH1: 'Darmowy konwerter HTML na PDF \u2014 Konwertuj kod HTML do PDF online',
    seoDesc: 'Konwertuj kod HTML na plik PDF bezpo\u015brednio w przegl\u0105darce. Wklej kod HTML do edytora lub podaj adres URL strony, ustaw format i marginesy, a nast\u0119pnie pobierz gotowy PDF. Ca\u0142o\u015b\u0107 dzia\u0142a client-side \u2014 Twoje dane nigdy nie opuszczaj\u0105 urz\u0105dzenia.',
    seoHowTitle: 'Jak to dzia\u0142a',
    seoHow1: 'Wklej kod HTML do edytora lub podaj adres URL strony',
    seoHow2: 'Ustaw format strony (A3, A4, A5, Letter, Legal), orientacj\u0119 i marginesy',
    seoHow3: 'Obejrzyj podgl\u0105d na \u017cywo po prawej stronie',
    seoHow4: 'Kliknij Pobierz PDF lub u\u017cyj funkcji drukowania przegl\u0105darki',
    seoFeaturesTitle: 'Funkcje',
    seoFeat1: 'Podgl\u0105d na \u017cywo \u2014 edytuj HTML i widzisz zmiany natychmiast',
    seoFeat2: 'Formaty stron: A3, A4, A5, Letter, Legal',
    seoFeat3: 'Orientacja pionowa i pozioma',
    seoFeat4: 'Konfigurowalne marginesy (0-20 mm) i skala (50-150%)',
    seoFeat5: 'Formatowanie kodu HTML jednym klikni\u0119ciem',
    seoFeat6: 'Tryb ciemny i jasny',
    seoFeat7: 'Alternatywna opcja drukowania / zapisu jako PDF',
    seoFeat8: '100% client-side \u2014 Twoje dane nigdy nie opuszczaj\u0105 urz\u0105dzenia',
    seoFaqTitle: 'Najcz\u0119\u015bciej zadawane pytania',
    seoFaq1q: 'Jak przekonwertowa\u0107 HTML na PDF?',
    seoFaq1a: 'Wklej kod HTML do edytora lub podaj adres URL strony. Ustaw format strony, orientacj\u0119 i marginesy, a nast\u0119pnie kliknij Pobierz PDF. Konwersja odbywa si\u0119 ca\u0142kowicie w przegl\u0105darce.',
    seoFaq2q: 'Czy moje dane s\u0105 bezpieczne?',
    seoFaq2a: 'Tak. Ca\u0142o\u015b\u0107 dzia\u0142a client-side \u2014 Tw\u00f3j kod HTML nigdy nie jest wysy\u0142any na \u017caden serwer. Konwersja odbywa si\u0119 w 100% w Twojej przegl\u0105darce.',
    seoFaq3q: 'Jakie formaty strony s\u0105 dost\u0119pne?',
    seoFaq3a: 'Dost\u0119pne formaty to A3, A4, A5, Letter i Legal. Mo\u017cesz te\u017c wybra\u0107 orientacj\u0119 (pionowa/pozioma), ustawi\u0107 marginesy od 0 do 20 mm oraz skal\u0119 od 50% do 150%.',
  },
  en: {
    subtitle: 'Convert HTML to PDF',
    tabHtml: 'Paste HTML',
    tabUrl: 'From URL',
    inputTitle: 'EDITOR',
    previewTitle: 'PREVIEW',
    clear: 'Clear',
    formatHtml: 'Format',
    wrapOn: 'Wrap on',
    wrapOff: 'Wrap off',
    privacyBadge: 'Your HTML never leaves the browser',
    urlLabel: 'Website URL to convert',
    generate: 'Generate PDF',
    generating: 'Generating PDF...',
    downloadPdf: 'Download PDF',
    portrait: 'Portrait',
    landscape: 'Landscape',
    moreOptions: 'More options',
    lessOptions: 'Less options',
    margins: 'Margins',
    scale: 'Scale',
    printBg: 'Print backgrounds',
    hideHeaders: 'Hide headers',
    previewEmpty: 'Paste HTML code on the left and the preview will appear here',
    exportPdf: 'Download PDF',
    printFallback: 'Print / Save as PDF',
    toastSuccess: 'PDF generated!',
    toastError: 'PDF generation error',
    toastCopied: 'Copied!',
    toastLargeDoc: 'Large document \u2014 preview on demand',
    errorEmpty: 'Paste HTML code before exporting',
    errorUrlInvalid: 'Enter a valid URL (http:// or https://)',
    errorServerDown: 'Render server unavailable \u2014 use Print option',
    errorTimeout: 'Request timed out \u2014 try again',
    errorGeneric: 'An error occurred \u2014 try again',
    modalTitle: 'HTML to PDF Converter',
    modalDesc: 'Convert <strong>HTML</strong> code to a PDF file directly in your browser. Paste HTML or enter a URL \u2014 everything runs client-side, your data never leaves your device.',
    modalHowTitle: 'How to use',
    modalStep1: 'Paste HTML code into the editor or enter a website URL',
    modalStep2: 'Set page format, orientation and margins',
    modalStep3: 'Click Download PDF or use the print function',
    modalFeaturesTitle: 'Key features',
    modalFeat1: 'Live preview while editing HTML code',
    modalFeat2: 'Formats: A3, A4, A5, Letter, Legal',
    modalFeat3: 'Portrait and landscape orientation',
    modalFeat4: 'Configurable margins and scale',
    modalFeat5: '100% client-side \u2014 your data never leaves your device',
    madeBy: 'Created by',
    footerBadge: '100% client-side',
    editorPlaceholder: 'Paste your HTML code here...',
    navArticles: 'Articles',
    navAbout: 'About',
    navPrivacy: 'Privacy',
    navContact: 'Contact',
    seoH1: 'Free HTML to PDF Converter \u2014 Convert HTML to PDF online',
    seoDesc: 'Convert HTML code to PDF directly in your browser. Paste HTML into the editor or enter a website URL, set format and margins, then download the PDF. Everything runs client-side \u2014 your data never leaves your device.',
    seoHowTitle: 'How it works',
    seoHow1: 'Paste HTML code into the editor or enter a website URL',
    seoHow2: 'Set page format (A3, A4, A5, Letter, Legal), orientation and margins',
    seoHow3: 'View the live preview on the right side',
    seoHow4: 'Click Download PDF or use the browser print function',
    seoFeaturesTitle: 'Features',
    seoFeat1: 'Live preview \u2014 edit HTML and see changes instantly',
    seoFeat2: 'Page formats: A3, A4, A5, Letter, Legal',
    seoFeat3: 'Portrait and landscape orientation',
    seoFeat4: 'Configurable margins (0-20 mm) and scale (50-150%)',
    seoFeat5: 'One-click HTML code formatting',
    seoFeat6: 'Dark and light theme',
    seoFeat7: 'Alternative print / save as PDF option',
    seoFeat8: '100% client-side \u2014 your data never leaves your device',
    seoFaqTitle: 'Frequently asked questions',
    seoFaq1q: 'How to convert HTML to PDF?',
    seoFaq1a: 'Paste HTML code into the editor or enter a website URL. Set page format, orientation and margins, then click Download PDF. Conversion happens entirely in the browser.',
    seoFaq2q: 'Is my data safe?',
    seoFaq2a: 'Yes. Everything runs client-side \u2014 your HTML code is never sent to any server. Conversion happens 100% in your browser.',
    seoFaq3q: 'What page formats are available?',
    seoFaq3a: 'Available formats are A3, A4, A5, Letter and Legal. You can also choose orientation (portrait/landscape), set margins from 0 to 20 mm and scale from 50% to 150%.',
  },
};

// --- Preloaded Example HTML ---
const EXAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a2e; }
    h1 { color: #0891b2; margin-bottom: 8px; }
    .subtitle { color: #666; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f8f9fa; font-weight: 600; }
    .total { font-size: 20px; font-weight: 700; color: #0891b2; text-align: right; margin-top: 24px; }
    .footer { margin-top: 48px; font-size: 13px; color: #999; border-top: 1px solid #e5e5e5; padding-top: 16px; }
  </style>
</head>
<body>
  <h1>Faktura #2024-001</h1>
  <p class="subtitle">Data: 3 kwietnia 2026</p>
  <table>
    <tr><th>Us\u0142uga</th><th>Ilo\u015b\u0107</th><th>Cena</th></tr>
    <tr><td>Projektowanie UI/UX</td><td>40h</td><td>8 000 z\u0142</td></tr>
    <tr><td>Programowanie frontend</td><td>60h</td><td>12 000 z\u0142</td></tr>
    <tr><td>Testy i wdro\u017cenie</td><td>16h</td><td>3 200 z\u0142</td></tr>
  </table>
  <p class="total">Razem: 23 200 z\u0142</p>
  <div class="footer">FormattedAI \u2022 formattedai.pl \u2022 NIP: 000-000-00-00</div>
</body>
</html>`;

// --- Constants ---
const LIVE_PREVIEW_SIZE_LIMIT = 50 * 1024; // 50 KB
const DEBOUNCE_DELAY = 500;

// --- State ---
let currentLang = document.documentElement.lang || 'pl';
let activeTab = 'html';
let wordWrap = false;
let livePreviewEnabled = true;
let urlPdfBlob = null;
let pdfPreviewUrl = null;
let debounceTimer = null;
let serverAvailable = false;

const options = {
  format: 'A4',
  orientation: 'portrait',
  margin: 10,
  scale: 100,
  printBg: true,
  hideHeaders: true,
};

// --- DOM ---
const htmlEditor = document.getElementById('htmlEditor');
const previewFrame = document.getElementById('previewFrame');
const previewEmpty = document.getElementById('previewEmpty');
const previewArea = document.getElementById('previewArea');
const previewBar = document.getElementById('previewBar');
const clearEditorBtn = document.getElementById('clearEditorBtn');
const formatBtn = document.getElementById('formatBtn');
const wrapToggle = document.getElementById('wrapToggle');
const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const printBtn = document.getElementById('printBtn');
const mobileExportBtn = document.getElementById('mobileExportBtn');
const mobileBar = document.getElementById('mobileBar');
const formatSelect = document.getElementById('formatSelect');
const orientationSelect = document.getElementById('orientationSelect');
const moreOptionsBtn = document.getElementById('moreOptionsBtn');
const advancedOptions = document.getElementById('advancedOptions');
const marginSelect = document.getElementById('marginSelect');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const printBgCheck = document.getElementById('printBgCheck');
const hideHeadersCheck = document.getElementById('hideHeadersCheck');
const urlInput = document.getElementById('urlInput');
const generateBtn = document.getElementById('generateBtn');
const urlDownloadBtn = document.getElementById('urlDownloadBtn');
const urlResult = document.getElementById('urlResult');
const urlFilename = document.getElementById('urlFilename');
const urlFileSize = document.getElementById('urlFileSize');
const urlLoader = document.getElementById('urlLoader');
const tabHtmlEl = document.getElementById('tabHtml');
const tabUrlEl = document.getElementById('tabUrl');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');
const aboutTrigger = document.getElementById('aboutTrigger');
const aboutModal = document.getElementById('aboutModal');
const aboutModalClose = document.getElementById('aboutModalClose');
const tabPills = document.querySelectorAll('.tab-pill');

// --- i18n Engine ---
function t(key) {
  return translations[currentLang]?.[key] || translations.pl[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val.includes('<')) { el.innerHTML = val; } else { el.textContent = val; }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // Update orientation select options
  const portraitOpt = orientationSelect.querySelector('option[value="portrait"]');
  const landscapeOpt = orientationSelect.querySelector('option[value="landscape"]');
  if (portraitOpt) portraitOpt.textContent = t('portrait');
  if (landscapeOpt) landscapeOpt.textContent = t('landscape');

  // Update more options button text
  const moreOptSpan = moreOptionsBtn.querySelector('[data-i18n]');
  if (moreOptSpan) {
    const isOpen = !advancedOptions.hidden;
    moreOptSpan.textContent = isOpen ? t('lessOptions') : t('moreOptions');
  }

  localStorage.setItem('formattedai-lang', currentLang);
}

// --- Theme ---
let currentTheme = localStorage.getItem('formattedai-theme') || 'light';

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
function showToast(message) {
  const textEl = toast.querySelector('.toast__text');
  if (textEl) textEl.textContent = message || t('toastSuccess');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- About Modal ---
function openAboutModal() {
  aboutModal.hidden = false;
  requestAnimationFrame(() => aboutModal.classList.add('show'));
}

function closeAboutModal() {
  aboutModal.classList.remove('show');
  setTimeout(() => { aboutModal.hidden = true; }, 200);
}

// --- Helper Functions ---
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function flashSuccess(btn, text) {
  const original = btn.querySelector('span')?.textContent;
  const span = btn.querySelector('span');
  if (span) span.textContent = text;
  btn.classList.add('btn--success');
  setTimeout(() => {
    if (span && original) span.textContent = original;
    btn.classList.remove('btn--success');
  }, 1500);
}

function getOptions() {
  return {
    format: options.format,
    orientation: options.orientation,
    margin: options.margin,
    scale: options.scale / 100,
    printBackground: options.printBg,
    displayHeaderFooter: !options.hideHeaders,
  };
}

// --- Page Size Dimensions (mm) ---
const PAGE_SIZES = {
  A3: { width: 297, height: 420 },
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  Letter: { width: 216, height: 279 },
  Legal: { width: 216, height: 356 },
};

function buildPageStyle() {
  const size = PAGE_SIZES[options.format] || PAGE_SIZES.A4;
  const w = options.orientation === 'landscape' ? size.height : size.width;
  const h = options.orientation === 'landscape' ? size.width : size.height;
  const m = options.margin;
  const s = options.scale / 100;

  return `
    @page {
      size: ${w}mm ${h}mm;
      margin: ${m}mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: ${options.printBg ? 'exact' : 'economy'};
        print-color-adjust: ${options.printBg ? 'exact' : 'economy'};
      }
    }
    html {
      zoom: ${s};
    }
  `;
}

function buildSecureSrcdoc(html) {
  const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\' https: http:; img-src data: blob: https: http:; font-src data: https: http:; script-src \'none\'; connect-src \'none\'; form-action \'none\'; frame-src \'none\';">';
  const pageStyle = buildPageStyle();
  return '<!DOCTYPE html><html><head><meta charset="UTF-8">' + csp + '<style>' + pageStyle + '</style></head><body>' + html + '</body></html>';
}

// --- Tab Switching ---
function switchTab(tab) {
  activeTab = tab;

  tabPills.forEach(pill => {
    const isActive = pill.dataset.tab === tab;
    pill.classList.toggle('tab-pill--active', isActive);
    pill.setAttribute('aria-selected', String(isActive));
  });

  tabHtmlEl.hidden = tab !== 'html';
  tabUrlEl.hidden = tab !== 'url';

  if (tab === 'html') {
    hidePdfPreview();
    updatePreview();
  }
}

// --- HTML Editor ---
function clearEditor() {
  htmlEditor.value = '';
  updatePreview();
}

function formatHtml(html) {
  // Simple HTML prettifier: indent tags on new lines
  if (typeof html_beautify === 'function') {
    return html_beautify(html, { indent_size: 2, wrap_line_length: 120 });
  }

  // Fallback: basic regex-based indentation
  let formatted = '';
  let indent = 0;
  const lines = html
    .replace(/>\s*</g, '>\n<')
    .split('\n');

  const selfClosing = /^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i;
  const closingTag = /^<\//;
  const openingTag = /^<[a-zA-Z]/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (closingTag.test(line)) {
      indent = Math.max(0, indent - 1);
    }

    formatted += '  '.repeat(indent) + line + '\n';

    if (openingTag.test(line) && !selfClosing.test(line) && !closingTag.test(line) && !line.endsWith('/>')) {
      // Check if the line also contains its closing tag
      const tagName = line.match(/^<(\w+)/)?.[1];
      if (tagName && !new RegExp(`</${tagName}>`, 'i').test(line)) {
        indent++;
      }
    }
  }

  return formatted.trim();
}

function toggleWrap() {
  wordWrap = !wordWrap;
  htmlEditor.style.whiteSpace = wordWrap ? 'pre-wrap' : 'pre';
  htmlEditor.style.overflowWrap = wordWrap ? 'break-word' : 'normal';
}

// --- Live Preview ---
function updatePreview() {
  const html = htmlEditor.value;
  const hasContent = html.trim().length > 0;

  previewEmpty.hidden = hasContent;
  previewFrame.hidden = !hasContent;

  if (!hasContent) {
    previewFrame.srcdoc = '';
    return;
  }

  // Check size limit for live preview
  if (html.length > LIVE_PREVIEW_SIZE_LIMIT) {
    if (livePreviewEnabled) {
      livePreviewEnabled = false;
      showToast(t('toastLargeDoc'));
    }
    return;
  }

  livePreviewEnabled = true;

  // Show loading bar
  previewBar.classList.add('preview-bar--active');

  const srcdoc = buildSecureSrcdoc(html);
  previewFrame.srcdoc = srcdoc;

  previewFrame.onload = function () {
    previewBar.classList.remove('preview-bar--active');
  };

  // Fallback: remove bar after timeout
  setTimeout(() => {
    previewBar.classList.remove('preview-bar--active');
  }, 2000);
}

function forceRefreshPreview() {
  // Force update even for large documents
  const html = htmlEditor.value;
  const hasContent = html.trim().length > 0;

  previewEmpty.hidden = hasContent;
  previewFrame.hidden = !hasContent;

  if (!hasContent) {
    previewFrame.srcdoc = '';
    return;
  }

  previewBar.classList.add('preview-bar--active');

  const srcdoc = buildSecureSrcdoc(html);
  previewFrame.srcdoc = srcdoc;

  previewFrame.onload = function () {
    previewBar.classList.remove('preview-bar--active');
  };

  setTimeout(() => {
    previewBar.classList.remove('preview-bar--active');
  }, 2000);
}

function debouncedPreview() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(updatePreview, DEBOUNCE_DELAY);
}

// --- Options Reading ---
function readOptions() {
  options.format = formatSelect.value;
  options.orientation = orientationSelect.value;
  options.margin = Number(marginSelect.value);
  options.scale = Number(scaleSlider.value);
  options.printBg = printBgCheck.checked;
  options.hideHeaders = hideHeadersCheck.checked;
}

// --- Export (Tab HTML) ---
function showExportLoading(loading) {
  const span = exportBtn.querySelector('span');
  if (loading) {
    exportBtn.disabled = true;
    if (span) span.textContent = t('generating');
    exportBtn.classList.add('btn--loading');
  } else {
    exportBtn.disabled = false;
    if (span) span.textContent = t('exportPdf');
    exportBtn.classList.remove('btn--loading');
  }
}

async function exportHtml() {
  const html = htmlEditor.value;
  if (!html.trim()) {
    showToast(t('errorEmpty'));
    return;
  }

  if (!serverAvailable) {
    // Fallback to print
    showToast(t('errorServerDown'));
    printPreview();
    return;
  }

  showExportLoading(true);
  try {
    const res = await fetch(API_BASE + '/api/pdf/from-html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: html, options: getOptions() }),
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    downloadBlob(blob, 'document.pdf');
    showToast(t('toastSuccess'));
    flashSuccess(exportBtn, t('toastSuccess'));
  } catch (err) {
    console.error('Export failed:', err);
    showToast(t('errorServerDown'));
  }
  showExportLoading(false);
}

function printPreview() {
  try {
    if (previewFrame.contentWindow) {
      previewFrame.contentWindow.print();
    }
  } catch (err) {
    console.error('Print failed:', err);
    showToast(t('toastError'));
  }
}

// --- URL Tab ---
function showUrlLoading(loading) {
  urlLoader.hidden = !loading;
  generateBtn.disabled = loading;
  const span = generateBtn.querySelector('span');
  if (span) span.textContent = loading ? t('generating') : t('generate');
}

function showUrlResult(url, size) {
  urlResult.hidden = false;
  try {
    const hostname = new URL(url).hostname;
    urlFilename.textContent = hostname + '.pdf';
  } catch {
    urlFilename.textContent = 'document.pdf';
  }
  urlFileSize.textContent = formatSize(size);
}

function showPdfPreview(blob) {
  if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
  pdfPreviewUrl = URL.createObjectURL(blob);
  previewEmpty.hidden = true;
  previewFrame.hidden = true;
  let pdfEmbed = document.getElementById('pdfPreviewEmbed');
  if (!pdfEmbed) {
    pdfEmbed = document.createElement('embed');
    pdfEmbed.id = 'pdfPreviewEmbed';
    pdfEmbed.type = 'application/pdf';
    pdfEmbed.style.cssText = 'width:100%;flex:1;border:none;background:#fff';
    previewArea.appendChild(pdfEmbed);
  }
  pdfEmbed.hidden = false;
  pdfEmbed.src = pdfPreviewUrl;
}

function hidePdfPreview() {
  const pdfEmbed = document.getElementById('pdfPreviewEmbed');
  if (pdfEmbed) {
    pdfEmbed.hidden = true;
    pdfEmbed.src = '';
  }
  if (pdfPreviewUrl) {
    URL.revokeObjectURL(pdfPreviewUrl);
    pdfPreviewUrl = null;
  }
}

async function generateFromUrl() {
  const url = urlInput.value.trim();
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    showToast(t('errorUrlInvalid'));
    return;
  }

  showUrlLoading(true);
  urlResult.hidden = true;
  try {
    const res = await fetch(API_BASE + '/api/pdf/from-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url, options: getOptions() }),
    });
    if (!res.ok) throw new Error(await res.text());
    const blob = await res.blob();
    urlPdfBlob = blob;
    showUrlResult(url, blob.size);
    showPdfPreview(blob);
  } catch (err) {
    console.error('URL generation failed:', err);
    showToast(t('errorGeneric'));
  }
  showUrlLoading(false);
}

function downloadUrlPdf() {
  if (!urlPdfBlob) return;
  const filename = urlFilename.textContent || 'document.pdf';
  downloadBlob(urlPdfBlob, filename);
  showToast(t('toastSuccess'));
}

// --- API Health Check ---
async function checkApiHealth() {
  try {
    const res = await fetch(API_BASE + '/api/pdf/health', { method: 'GET' });
    serverAvailable = res.ok;
  } catch {
    serverAvailable = false;
  }

  if (!serverAvailable) {
    // Subtle indicator: update export button to suggest print fallback
    console.info('PDF render server unavailable — print fallback active');
  }
}

// --- Event Listeners ---

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// About modal
aboutTrigger.addEventListener('click', openAboutModal);
aboutModalClose.addEventListener('click', closeAboutModal);
aboutModal.addEventListener('click', (e) => {
  if (e.target === aboutModal) closeAboutModal();
});

// Tab switching
tabPills.forEach(pill => {
  pill.addEventListener('click', () => switchTab(pill.dataset.tab));
});

// Editor actions
clearEditorBtn.addEventListener('click', clearEditor);

formatBtn.addEventListener('click', () => {
  htmlEditor.value = formatHtml(htmlEditor.value);
  debouncedPreview();
});

wrapToggle.addEventListener('click', toggleWrap);

// Live preview on input
htmlEditor.addEventListener('input', debouncedPreview);

// Refresh button
refreshBtn.addEventListener('click', forceRefreshPreview);

// Options
formatSelect.addEventListener('change', () => {
  readOptions();
  updatePreview();
});

orientationSelect.addEventListener('change', () => {
  readOptions();
  updatePreview();
});

moreOptionsBtn.addEventListener('click', () => {
  const isHidden = advancedOptions.hidden;
  advancedOptions.hidden = !isHidden;
  const label = moreOptionsBtn.querySelector('[data-i18n]');
  if (label) {
    label.setAttribute('data-i18n', isHidden ? 'lessOptions' : 'moreOptions');
    label.textContent = isHidden ? t('lessOptions') : t('moreOptions');
  }
  // Flip chevron
  const svg = moreOptionsBtn.querySelector('svg');
  if (svg) svg.style.transform = isHidden ? 'rotate(180deg)' : '';
});

marginSelect.addEventListener('change', () => {
  readOptions();
  updatePreview();
});

scaleSlider.addEventListener('input', () => {
  options.scale = Number(scaleSlider.value);
  scaleValue.textContent = scaleSlider.value + '%';
  updatePreview();
});

printBgCheck.addEventListener('change', () => {
  readOptions();
  updatePreview();
});

hideHeadersCheck.addEventListener('change', () => {
  readOptions();
  updatePreview();
});

// Export actions
exportBtn.addEventListener('click', exportHtml);
printBtn.addEventListener('click', printPreview);
if (mobileExportBtn) mobileExportBtn.addEventListener('click', exportHtml);

// URL tab actions
generateBtn.addEventListener('click', generateFromUrl);
urlDownloadBtn.addEventListener('click', downloadUrlPdf);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !aboutModal.hidden) closeAboutModal();
});

// --- Init ---
applyTheme();
applyLanguage();

// Read initial option values from DOM
readOptions();

// Preload example HTML
htmlEditor.value = EXAMPLE_HTML;

// Initial preview
updatePreview();

// Check API availability
checkApiHealth();
