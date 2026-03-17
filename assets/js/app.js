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
    if (key === 'subtitle') {
      el.innerHTML = t(key);
    } else {
      el.textContent = t(key);
    }
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

  return `<html><head><meta charset="utf-8"></head><body>
    <div style="font-family: ${fontFamily}; font-size: 11pt; line-height: ${lineHeight}; color: #1a1a1a;">
      ${html
        .replace(/<h1>/g, '<h1 style="font-size: 24pt; font-weight: 700; margin: 24px 0 8px; color: #1a1a1a;">')
        .replace(/<h2>/g, '<h2 style="font-size: 18pt; font-weight: 700; margin: 20px 0 6px; color: #1a1a1a;">')
        .replace(/<h3>/g, '<h3 style="font-size: 14pt; font-weight: 700; margin: 16px 0 4px; color: #333;">')
        .replace(/<h4>/g, '<h4 style="font-size: 12pt; font-weight: 700; margin: 14px 0 4px; color: #444;">')
        .replace(/<p>/g, '<p style="margin: 0 0 10px;">')
        .replace(/<strong>/g, '<strong style="font-weight: 700;">')
        .replace(/<a /g, '<a style="color: #1155cc; text-decoration: underline;" ')
        .replace(/<ul>/g, '<ul style="margin: 6px 0 10px 24px; padding: 0; list-style-type: disc;">')
        .replace(/<ol>/g, '<ol style="margin: 6px 0 10px 24px; padding: 0;">')
        .replace(/<li>/g, '<li style="margin: 3px 0;">')
        .replace(/<table>/g, '<table style="width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10pt;">')
        .replace(/<th>/g, '<th style="border: 1px solid #c0c0c0; padding: 6px 10px; text-align: left; background: #f3f3f3; font-weight: 700;">')
        .replace(/<td>/g, '<td style="border: 1px solid #c0c0c0; padding: 6px 10px; text-align: left;">')
        .replace(/<blockquote>/g, '<blockquote style="border-left: 3px solid #c0c0c0; margin: 12px 0; padding: 8px 16px; color: #555; background: #f9f9f9;">')
        .replace(/<code>/g, '<code style="font-family: Courier New, monospace; background: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 10pt;">')
        .replace(/<pre>/g, '<pre style="background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px 16px; margin: 10px 0; overflow-x: auto;">')
        .replace(/<hr>/g, '<hr style="border: none; border-top: 1px solid #d0d0d0; margin: 16px 0;">')
      }
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

// Paste handler: auto-strip rich text
markdownInput.addEventListener('paste', (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text/plain');
  const start = markdownInput.selectionStart;
  const end = markdownInput.selectionEnd;
  markdownInput.value =
    markdownInput.value.substring(0, start) +
    text +
    markdownInput.value.substring(end);
  markdownInput.selectionStart = markdownInput.selectionEnd = start + text.length;
  renderMarkdown();
});

// Keyboard shortcut: Ctrl+Shift+C
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    copyFormatted();
  }
});

// --- Init ---
applyLanguage();
