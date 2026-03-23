// ============================================
// FormattedAI — App Logic + i18n + Download
// ============================================

// --- i18n Translations ---
const translations = {
  pl: {
    subtitle: 'Wklej z ChatGPT \u2192 Kopiuj do Docs / Word',
    clear: 'Wyczy\u015B\u0107',
    copy: 'Kopiuj sformatowany',
    download: 'Pobierz',
    preview: 'Podgl\u0105d',
    placeholder: 'Wklej tutaj tekst z ChatGPT...',
    emptyText: 'Tu pojawi si\u0119 sformatowany tekst',
    emptyHint: 'szybkie kopiowanie',
    toast: 'Skopiowano! Wklej do Docs / Word',
    toastDownload: 'Pobrano!',
    madeBy: 'Stworzone przez',
    chars: 'znak\u00F3w',
    pageTitle: 'FormattedAI \u2014 Skopiuj tekst z ChatGPT do Google Docs i Word z idealnym formatowaniem',
    dlHtmlDesc: 'Otw\u00F3rz w przegl\u0105darce',
    dlDocxDesc: 'Microsoft Word',
    dlMdDesc: 'Plik .md',
    aboutTitle: 'Jak to dzia\u0142a?',
    aboutText1: '<strong>Markdown Formatter</strong> konwertuje tekst z ChatGPT, Claude i innych asystent\u00F3w AI na sformatowany dokument gotowy do wklejenia w Google Docs lub Microsoft Word.',
    aboutItem1: 'Wklej tekst markdown w lewym panelu',
    aboutItem2: 'Podgl\u0105d sformatowanego tekstu pojawi si\u0119 po prawej',
    aboutItem3: 'Kliknij "Kopiuj sformatowany" lub u\u017Cyj Ctrl+Shift+C',
    aboutItem4: 'Wklej do Google Docs lub Word \u2014 formatowanie zostanie zachowane',
    seoH1: 'Markdown do Word i Google Docs \u2014 Darmowy konwerter online',
    seoDesc: 'FormattedAI Markdown Formatter to darmowe narz\u0119dzie online, kt\u00F3re konwertuje tekst markdown z ChatGPT, Claude i innych asystent\u00F3w AI na idealnie sformatowany tekst. Wklej tre\u015B\u0107, zobacz podgl\u0105d w czasie rzeczywistym i skopiuj do Google Docs lub Microsoft Word jednym klikni\u0119ciem. Wszystko dzia\u0142a 100% w przegl\u0105darce \u2014 Tw\u00F3j tekst nigdy nie opuszcza urz\u0105dzenia.',
    seoHowTitle: 'Jak to dzia\u0142a',
    seoHow1: 'Wklej tekst markdown z ChatGPT, Claude lub innego asystenta AI w lewym panelu',
    seoHow2: 'Zobacz sformatowany podgl\u0105d po prawej \u2014 wybierz styl Google Docs lub Word',
    seoHow3: 'Kliknij "Kopiuj sformatowany" (lub Ctrl+Shift+C) i wklej do dokumentu \u2014 formatowanie zachowane',
    seoFeaturesTitle: 'Funkcje',
    seoFeat1: 'Konwersja markdown na sformatowany tekst w czasie rzeczywistym',
    seoFeat2: 'Kopiowanie z zachowaniem formatowania do Google Docs i Microsoft Word',
    seoFeat3: 'Eksport do HTML, DOCX i Markdown',
    seoFeat4: 'Presety styl\u00F3w Google Docs i Word',
    seoFeat5: 'Tabele, bloki kodu, listy zada\u0144 i pe\u0142na sk\u0142adnia GFM',
    seoFeat6: '100% client-side \u2014 Twoje dane nigdy nie opuszczaj\u0105 urz\u0105dzenia',
    seoFeat7: 'Dwuj\u0119zyczny interfejs (polski / angielski)',
    seoFaqTitle: 'Cz\u0119sto zadawane pytania',
    seoFaq1q: 'Jak skopiowa\u0107 tekst z ChatGPT do Google Docs z formatowaniem?',
    seoFaq1a: 'Wklej tekst markdown z ChatGPT w lewym panelu. Sformatowany podgl\u0105d pojawi si\u0119 po prawej. Kliknij "Kopiuj sformatowany" lub naci\u015Bnij Ctrl+Shift+C, a nast\u0119pnie wklej do Google Docs \u2014 nag\u0142\u00F3wki, pogrubienia, listy, tabele i bloki kodu zostan\u0105 zachowane.',
    seoFaq2q: 'Czy to narz\u0119dzie wysy\u0142a moje dane na serwer?',
    seoFaq2a: 'Nie. Wszystko dzia\u0142a w Twojej przegl\u0105darce. Tw\u00F3j tekst nigdy nie jest nigdzie wysy\u0142any.',
    seoFaq3q: 'Jakie formaty eksportu s\u0105 dost\u0119pne?',
    seoFaq3a: 'Mo\u017Cesz eksportowa\u0107 jako HTML, DOCX (Microsoft Word) lub Markdown (.md). Mo\u017Cesz te\u017C skopiowa\u0107 sformatowany tekst bezpo\u015Brednio do schowka.',
  },
  en: {
    subtitle: 'Paste from ChatGPT \u2192 Copy to Docs / Word',
    clear: 'Clear',
    copy: 'Copy formatted',
    download: 'Download',
    preview: 'Preview',
    placeholder: 'Paste ChatGPT text here...',
    emptyText: 'Formatted text will appear here',
    emptyHint: 'quick copy',
    toast: 'Copied! Paste into Docs / Word',
    toastDownload: 'Downloaded!',
    madeBy: 'Created by',
    chars: 'chars',
    pageTitle: 'FormattedAI \u2014 Copy ChatGPT text to Google Docs & Word with perfect formatting',
    dlHtmlDesc: 'Open in browser',
    dlDocxDesc: 'Microsoft Word',
    dlMdDesc: '.md file',
    aboutTitle: 'How does it work?',
    aboutText1: '<strong>Markdown Formatter</strong> converts text from ChatGPT, Claude and other AI assistants into a formatted document ready to paste into Google Docs or Microsoft Word.',
    aboutItem1: 'Paste markdown text in the left panel',
    aboutItem2: 'Formatted preview appears on the right',
    aboutItem3: 'Click "Copy formatted" or use Ctrl+Shift+C',
    aboutItem4: 'Paste into Google Docs or Word \u2014 formatting is preserved',
  },
};

// --- State ---
let currentLang = localStorage.getItem('formattedai-lang') || 'pl';
let currentStyle = 'docs';

// --- DOM ---
const markdownInput = document.getElementById('markdownInput');
const preview = document.getElementById('preview');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const charCount = document.getElementById('charCount');
const toast = document.getElementById('toast');
const styleDocsBtn = document.getElementById('styleDocsBtn');
const styleWordBtn = document.getElementById('styleWordBtn');
const langToggle = document.getElementById('langToggle');
const langFlag = document.getElementById('langFlag');
const downloadDropdown = document.getElementById('downloadDropdown');
const downloadBtn = document.getElementById('downloadBtn');
const downloadMenu = document.getElementById('downloadMenu');
const dlHtml = document.getElementById('dlHtml');
const dlDocx = document.getElementById('dlDocx');
const dlMd = document.getElementById('dlMd');

// --- Marked config ---
marked.setOptions({
  breaks: true,
  gfm: true,
});

// --- i18n Engine ---
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
    if (val.includes('<') || key === 'subtitle') { el.innerHTML = val; } else { el.textContent = val; }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = currentLang === 'pl'
      ? 'Darmowe narz\u0119dzie online do konwersji tekstu Markdown z ChatGPT na sformatowany dokument. Wklej, sformatuj i skopiuj do Google Docs lub Microsoft Word jednym klikni\u0119ciem.'
      : 'Free online tool to convert ChatGPT Markdown text into formatted documents. Paste, format and copy to Google Docs or Microsoft Word with one click.';
  }

  renderMarkdown();
  localStorage.setItem('formattedai-lang', currentLang);
}

function toggleLanguage() {
  currentLang = currentLang === 'pl' ? 'en' : 'pl';
  applyLanguage();
}

// --- Render markdown ---
function renderMarkdown() {
  const text = markdownInput.value;

  charCount.textContent = `${text.length} ${t('chars')}`;

  if (!text.trim()) {
    preview.innerHTML = `
      <div class="preview__empty">
        <div class="preview__empty-visual">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <rect x="12" y="8" width="40" height="48" rx="4" stroke="#d0d0d8" stroke-width="2"/>
            <line x1="20" y1="20" x2="44" y2="20" stroke="#e0e0e8" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="28" x2="38" y2="28" stroke="#e0e0e8" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="36" x2="42" y2="36" stroke="#e0e0e8" stroke-width="2" stroke-linecap="round"/>
            <line x1="20" y1="44" x2="34" y2="44" stroke="#e0e0e8" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <p class="preview__empty-text">${t('emptyText')}</p>
        <p class="preview__empty-hint">Ctrl + Shift + C &mdash; ${t('emptyHint')}</p>
      </div>`;
    preview.className = 'preview';
    return;
  }

  preview.innerHTML = DOMPurify.sanitize(marked.parse(text));
  preview.className = `preview style-${currentStyle}`;

  preview.querySelectorAll('li').forEach(li => {
    if (li.querySelector('input[type="checkbox"]')) {
      li.classList.add('task-list-item');
    }
  });
}

// --- Copy as rich text ---
async function copyFormatted() {
  const html = preview.innerHTML;
  if (!html || preview.querySelector('.preview__empty')) return;

  const styledHtml = buildInlineStyledHtml(html);

  try {
    const blob = new Blob([styledHtml], { type: 'text/html' });
    const plainBlob = new Blob([markdownInput.value], { type: 'text/plain' });

    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': blob,
        'text/plain': plainBlob,
      }),
    ]);

    showToast(t('toast'));
    copyBtn.classList.add('btn--success');
    setTimeout(() => copyBtn.classList.remove('btn--success'), 1500);
  } catch (err) {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    showToast(t('toast'));
  }
}

// --- Build inline-styled HTML (Docs/Word compatible) ---
function buildInlineStyledHtml(html) {
  const fontFamily = currentStyle === 'docs'
    ? 'Arial, sans-serif'
    : 'Calibri, Segoe UI, sans-serif';

  const lineHeight = currentStyle === 'docs' ? '1.5' : '1.15';

  const styles = {
    h1: 'font-size: 24pt; font-weight: 700; margin: 24px 0 8px; color: #1a1a1a;',
    h2: 'font-size: 18pt; font-weight: 700; margin: 20px 0 6px; color: #1a1a1a;',
    h3: 'font-size: 14pt; font-weight: 700; margin: 16px 0 4px; color: #333;',
    h4: 'font-size: 12pt; font-weight: 700; margin: 14px 0 4px; color: #444;',
    p: 'margin: 0 0 10px;',
    strong: 'font-weight: 700;',
    a: 'color: #1155cc; text-decoration: underline;',
    ul: 'margin: 6px 0 10px 24px; padding: 0; list-style-type: disc;',
    ol: 'margin: 6px 0 10px 24px; padding: 0;',
    li: 'margin: 3px 0;',
    table: 'width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt;',
    thead: '',
    tbody: '',
    tr: '',
    th: 'border: 1px solid #c0c0c0; padding: 6px 10px; text-align: left; background: #f3f3f3; font-weight: 700;',
    td: 'border: 1px solid #c0c0c0; padding: 6px 10px; text-align: left;',
    blockquote: 'border-left: 3px solid #c0c0c0; margin: 12px 0; padding: 8px 16px; color: #555; background: #f9f9f9;',
    code: 'font-family: Courier New, monospace; background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 10pt;',
    pre: 'background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px 16px; margin: 10px 0; overflow-x: auto;',
    hr: 'border: none; border-bottom: 1px solid #d0d0d0; margin: 16px 0; height: 0;',
  };

  const container = document.createElement('div');
  container.innerHTML = html;

  // Convert <pre><code> blocks to single-cell tables (Google Docs compatible)
  container.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    const text = code ? code.textContent : pre.textContent;
    const table = document.createElement('table');
    table.setAttribute('style', 'width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #e0e0e0;');
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.setAttribute('style', 'background: #f5f5f5; padding: 12px 16px; font-family: Courier New, monospace; font-size: 10pt; line-height: 1.5; white-space: pre; color: #1a1a1a;');
    td.textContent = text;
    tr.appendChild(td);
    table.appendChild(tr);
    pre.replaceWith(table);
  });

  // Apply inline styles to all elements
  for (const [tag, style] of Object.entries(styles)) {
    if (!style) continue;
    container.querySelectorAll(tag).forEach(el => {
      // Skip code-block tables (already styled above)
      if (tag === 'table' && el.querySelector('td[style*="white-space: pre"]')) return;
      if (tag === 'td' && el.getAttribute('style')?.includes('white-space: pre')) return;
      el.setAttribute('style', style);
    });
  }

  return `<html><head><meta charset="utf-8"></head><body>
    <div style="font-family: ${fontFamily}; font-size: 11pt; line-height: ${lineHeight}; color: #1a1a1a;">
      ${container.innerHTML}
    </div>
  </body></html>`;
}

// --- Download helpers ---
function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toastDownload'));
  closeDropdown();
}

function hasContent() {
  return markdownInput.value.trim().length > 0;
}

// Download as HTML
function downloadHtml() {
  if (!hasContent()) return;
  const html = buildInlineStyledHtml(preview.innerHTML);
  const fullHtml = `<!DOCTYPE html>
<html lang="${currentLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FormattedAI Export</title>
  <style>
    body { max-width: 800px; margin: 40px auto; padding: 0 20px; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, 'formattedai-export.html');
}

// Download as DOCX (Word-compatible HTML with .doc extension)
function downloadDocx() {
  if (!hasContent()) return;
  const html = buildInlineStyledHtml(preview.innerHTML);
  // Word opens HTML files with .doc extension natively
  const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta name="ProgId" content="Word.Document">
  <meta name="Generator" content="FormattedAI">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: Calibri, sans-serif; font-size: 11pt; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #c0c0c0; padding: 6px 10px; }
    th { background: #f3f3f3; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  const blob = new Blob([wordHtml], { type: 'application/msword' });
  triggerDownload(blob, 'formattedai-export.doc');
}

// Download as Markdown
function downloadMd() {
  if (!hasContent()) return;
  const blob = new Blob([markdownInput.value], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, 'formattedai-export.md');
}

// --- Dropdown ---
function toggleDropdown() {
  downloadDropdown.classList.toggle('open');
}

function closeDropdown() {
  downloadDropdown.classList.remove('open');
}

// --- Toast ---
function showToast(message) {
  toast.querySelector('.toast__text').textContent = message || t('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Style switching ---
function setStyle(style) {
  currentStyle = style;
  styleDocsBtn.classList.toggle('active', style === 'docs');
  styleWordBtn.classList.toggle('active', style === 'word');
  styleDocsBtn.setAttribute('aria-checked', style === 'docs');
  styleWordBtn.setAttribute('aria-checked', style === 'word');
  renderMarkdown();
}

// --- Clear ---
function clearAll() {
  markdownInput.value = '';
  renderMarkdown();
  markdownInput.focus();
}

// --- Event listeners ---
markdownInput.addEventListener('input', renderMarkdown);
copyBtn.addEventListener('click', copyFormatted);
clearBtn.addEventListener('click', clearAll);
styleDocsBtn.addEventListener('click', () => setStyle('docs'));
styleWordBtn.addEventListener('click', () => setStyle('word'));
langToggle.addEventListener('click', toggleLanguage);

// Download dropdown
downloadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleDropdown();
});

dlHtml.addEventListener('click', downloadHtml);
dlDocx.addEventListener('click', downloadDocx);
dlMd.addEventListener('click', downloadMd);

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!downloadDropdown.contains(e.target)) {
    closeDropdown();
  }
});

// Close dropdown on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDropdown();
  }
});

// Paste handler: auto-strip rich text, insert as plain text
markdownInput.addEventListener('paste', (e) => {
  const text = e.clipboardData.getData('text/plain');
  if (text && e.clipboardData.types.includes('text/html')) {
    e.preventDefault();
    document.execCommand('insertText', false, text);
    renderMarkdown();
  }
});

// Keyboard shortcut: Ctrl+Shift+C
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    copyFormatted();
  }
});

// --- About Banner ---
const aboutBanner = document.getElementById('aboutBanner');
const aboutClose = document.getElementById('aboutClose');
const ABOUT_KEY = 'formattedai-formatter-about-closed';

if (aboutClose) {
  aboutClose.addEventListener('click', () => {
    aboutBanner.hidden = true;
    localStorage.setItem(ABOUT_KEY, '1');
  });
}

// --- Init ---
if (localStorage.getItem(ABOUT_KEY) && aboutBanner) aboutBanner.hidden = true;
applyLanguage();
