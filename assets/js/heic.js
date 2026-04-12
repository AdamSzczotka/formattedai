// ============================================
// FormattedAI — HEIC Converter Logic
// Uses heic-to (WASM libheif) for HEIC decoding
// Uses @jsquash/avif for AVIF encoding (lazy loaded)
// ============================================

// --- i18n Translations ---
const translations = {
  pl: {
    subtitle: 'Konwertuj zdj\u0119cia HEIC na JPG, PNG, AVIF',
    clear: 'Wyczy\u015B\u0107',
    convertAll: 'Konwertuj wszystko',
    downloadAll: 'Pobierz ZIP',
    inputTitle: 'Wej\u015Bcie',
    outputTitle: 'Wynik',
    quality: 'Jako\u015B\u0107',
    presetLow: 'Niska',
    presetMedium: '\u015Arednia',
    presetHigh: 'Wysoka',
    presetMax: 'Maksymalna',
    formatJPG: 'JPG',
    formatPNG: 'PNG',
    formatAVIF: 'AVIF',
    pngWarning: 'PNG: pliki b\u0119d\u0105 du\u017Ce (bezstratna kompresja)',
    loadingAvif: '\u0141adowanie encodera AVIF...',
    dropText: 'Przeci\u0105gnij i upu\u015B\u0107 zdj\u0119cia HEIC/HEIF tutaj',
    browseFiles: 'Przegl\u0105daj pliki',
    addMore: 'Dodaj wi\u0119cej plik\u00F3w',
    metaInfo: 'Metadane EXIF zostan\u0105 usuni\u0119te',
    emptyText: 'Tu pojawi\u0105 si\u0119 przekonwertowane zdj\u0119cia',
    emptyHint: 'Dodaj pliki po lewej stronie',
    conversionDone: 'Gotowe! Pliki przekonwertowane pomy\u015Blnie',
    toastConverted: 'Konwersja zako\u0144czona!',
    toastDownload: 'Pobrano!',
    toastError: 'B\u0142\u0105d konwersji',
    toastLimitFiles: 'Maksymalnie 20 plik\u00F3w',
    toastLimitSize: 'Plik za du\u017Cy (max 50MB)',
    toastInvalidType: 'Nieobs\u0142ugiwany format \u2014 wybierz pliki .heic lub .heif',
    madeBy: 'Stworzone przez',
    footerBadge: '100% client-side',
    navArticles: 'Artyku\u0142y',
    navAbout: 'O nas',
    navPrivacy: 'Prywatno\u015B\u0107',
    navContact: 'Kontakt',
    totalFiles: 'Pliki:',
    originalSize: 'Orygina\u0142:',
    outputFormat: 'Wynik:',
    savings: 'Oszcz\u0119dno\u015B\u0107:',
    converting: 'Konwertowanie...',
    downloadSingle: 'Pobierz',
    noSupportTitle: 'Nie uda\u0142o si\u0119 za\u0142adowa\u0107 dekodera HEIC',
    noSupportText: 'Sprawd\u017A po\u0142\u0105czenie z internetem i od\u015Bwie\u017C stron\u0119. Dekoder HEIC wymaga pobrania modu\u0142u WASM.',
    backHome: 'Wr\u00F3\u0107 do strony g\u0142\u00F3wnej',
    pageTitle: 'Konwerter HEIC \u2014 Zmie\u0144 HEIC na JPG, PNG, AVIF | FormattedAI',
    modalTitle: 'HEIC Converter',
    modalDesc: '<strong>HEIC/HEIF</strong> to format obraz\u00F3w u\u017Cywany przez urz\u0105dzenia Apple. Konwertuj zdj\u0119cia z iPhone bezpo\u015Brednio w przegl\u0105darce na JPG, PNG lub AVIF \u2014 Twoje pliki nigdy nie opuszczaj\u0105 urz\u0105dzenia.',
    modalHowTitle: 'Jak u\u017Cywa\u0107',
    modalStep1: 'Przeci\u0105gnij zdj\u0119cia HEIC/HEIF na stron\u0119',
    modalStep2: 'Wybierz format wyj\u015Bciowy (JPG, PNG, AVIF) i ustaw jako\u015B\u0107',
    modalStep3: 'Pobierz przekonwertowane pliki lub ca\u0142y ZIP',
    modalFeaturesTitle: 'Kluczowe funkcje',
    modalFeat1: 'Konwersja na 3 formaty: JPG, PNG, AVIF',
    modalFeat2: 'Presety jako\u015Bci: Niska, \u015Arednia, Wysoka, Maksymalna',
    modalFeat3: 'Konwersja wielu plik\u00F3w jednocze\u015Bnie (batch)',
    modalFeat4: 'Pobieranie pojedynczo lub jako ZIP',
    modalFeat5: '100% client-side \u2014 Twoje pliki nigdy nie opuszczaj\u0105 urz\u0105dzenia',
  },
  en: {
    subtitle: 'Convert HEIC photos to JPG, PNG, AVIF',
    clear: 'Clear',
    convertAll: 'Convert all',
    downloadAll: 'Download ZIP',
    inputTitle: 'Input',
    outputTitle: 'Output',
    quality: 'Quality',
    presetLow: 'Low',
    presetMedium: 'Medium',
    presetHigh: 'High',
    presetMax: 'Maximum',
    formatJPG: 'JPG',
    formatPNG: 'PNG',
    formatAVIF: 'AVIF',
    pngWarning: 'PNG: files will be large (lossless compression)',
    loadingAvif: 'Loading AVIF encoder...',
    dropText: 'Drag & drop HEIC/HEIF photos here',
    browseFiles: 'Browse files',
    addMore: 'Add more files',
    metaInfo: 'EXIF metadata will be removed',
    emptyText: 'Converted photos will appear here',
    emptyHint: 'Add files on the left side',
    conversionDone: 'Done! Files converted successfully',
    toastConverted: 'Conversion complete!',
    toastDownload: 'Downloaded!',
    toastError: 'Conversion error',
    toastLimitFiles: 'Maximum 20 files',
    toastLimitSize: 'File too large (max 50MB)',
    toastInvalidType: 'Unsupported format \u2014 select .heic or .heif files',
    madeBy: 'Created by',
    footerBadge: '100% client-side',
    navArticles: 'Articles',
    navAbout: 'About',
    navPrivacy: 'Privacy',
    navContact: 'Contact',
    totalFiles: 'Files:',
    originalSize: 'Original:',
    outputFormat: 'Output:',
    savings: 'Savings:',
    converting: 'Converting...',
    downloadSingle: 'Download',
    noSupportTitle: 'Failed to load HEIC decoder',
    noSupportText: 'Check your internet connection and refresh the page. The HEIC decoder requires a WASM module download.',
    backHome: 'Back to home',
    pageTitle: 'HEIC Converter \u2014 Convert HEIC to JPG, PNG, AVIF | FormattedAI',
    modalTitle: 'HEIC Converter',
    modalDesc: '<strong>HEIC/HEIF</strong> is the image format used by Apple devices. Convert iPhone photos directly in your browser to JPG, PNG or AVIF \u2014 your files never leave your device.',
    modalHowTitle: 'How to use',
    modalStep1: 'Drag HEIC/HEIF photos onto the page',
    modalStep2: 'Choose output format (JPG, PNG, AVIF) and set quality',
    modalStep3: 'Download converted files or ZIP archive',
    modalFeaturesTitle: 'Key features',
    modalFeat1: 'Convert to 3 formats: JPG, PNG, AVIF',
    modalFeat2: 'Quality presets: Low, Medium, High, Maximum',
    modalFeat3: 'Batch conversion of multiple files at once',
    modalFeat4: 'Download individually or as ZIP',
    modalFeat5: '100% client-side \u2014 your files never leave your device',
  },
};

// --- State ---
let currentLang = document.documentElement.lang || 'pl';
let outputFormat = 'jpg'; // 'jpg' | 'png' | 'avif'
let quality = 85;
let inputFiles = []; // { id, file, objectUrl }
let results = [];    // { id, originalFile, convertedBlob, objectUrl, originalSize, convertedSize }
let isConverting = false;
let fileIdCounter = 0;

// --- Lazy-loaded modules ---
let heicToModule = null;
let avifEncode = null;

// --- Constants ---
const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const HEIC_EXTENSIONS = ['.heic', '.heif'];

// --- DOM ---
const app = document.getElementById('app');
const heicWarning = document.getElementById('heicWarning');
const themeToggle = document.getElementById('themeToggle');
const clearBtn = document.getElementById('clearBtn');
const convertAllBtn = document.getElementById('convertAllBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const divider = document.getElementById('divider');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const presetsArea = document.getElementById('presetsArea');
const sliderArea = document.getElementById('sliderArea');
const pngWarning = document.getElementById('pngWarning');
const dropZone = document.getElementById('dropZone');
const dropZoneCompact = document.getElementById('dropZoneCompact');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileList = document.getElementById('fileList');
const fileCount = document.getElementById('fileCount');
const inputArea = document.getElementById('inputArea');
const resultCount = document.getElementById('resultCount');
const summaryBar = document.getElementById('summaryBar');
const summaryFiles = document.getElementById('summaryFiles');
const summaryOriginal = document.getElementById('summaryOriginal');
const summaryOutput = document.getElementById('summaryOutput');
const summarySavings = document.getElementById('summarySavings');
const resultsEmpty = document.getElementById('resultsEmpty');
const resultsProgress = document.getElementById('resultsProgress');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const progressFile = document.getElementById('progressFile');
const resultsList = document.getElementById('resultsList');
const toast = document.getElementById('toast');
const imageModal = document.getElementById('imageModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalClose = document.getElementById('modalClose');
const modalImg = document.getElementById('modalImg');
const modalInfo = document.getElementById('modalInfo');
const mobileBar = document.getElementById('mobileBar');
const mobileConvertBtn = document.getElementById('mobileConvertBtn');
const mobileDownloadBtn = document.getElementById('mobileDownloadBtn');

// Format & Preset buttons
const formatBtns = document.querySelectorAll('.format-tabs__item');
const presetBtns = document.querySelectorAll('.tool-bar__preset');

// --- i18n Engine ---
function t(key) {
  return translations[currentLang][key] || translations.pl[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.title = t('pageTitle');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val.includes('<')) { el.innerHTML = val; } else { el.textContent = val; }
  });

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

// --- File Size Formatter ---
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// --- File Name Helpers ---
function getOutputName(originalName, format) {
  const ext = format === 'jpg' ? '.jpg' : format === 'png' ? '.png' : '.avif';
  return originalName.replace(/\.[^.]+$/, ext);
}

function getOutputMime(format) {
  if (format === 'jpg') return 'image/jpeg';
  if (format === 'png') return 'image/png';
  return 'image/avif';
}

// --- Validate HEIC file ---
function isHeicFile(file) {
  const name = file.name.toLowerCase();
  return HEIC_EXTENSIONS.some(ext => name.endsWith(ext));
}

// --- Toast ---
function showToast(message) {
  toast.querySelector('.toast__text').textContent = message || t('toastConverted');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Flash success helper ---
function flashSuccess(btn, successText) {
  if (!btn) return;
  var span = btn.querySelector('span');
  if (!span) return;
  var origText = span.textContent;
  btn.classList.add('btn--success');
  span.textContent = successText;
  setTimeout(function() {
    btn.classList.remove('btn--success');
    span.textContent = origText;
  }, 2000);
}

// --- Lazy Load: heic-to ---
async function loadHeicTo() {
  if (heicToModule) return;
  try {
    heicToModule = await import('https://cdn.jsdelivr.net/npm/heic-to@1.4.2/+esm');
  } catch (err) {
    console.error('Failed to load heic-to:', err);
    heicWarning.hidden = false;
    app.hidden = true;
    throw err;
  }
}

// --- Lazy Load: @jsquash/avif ---
async function loadAvifEncoder() {
  if (avifEncode) return;
  const mod = await import('https://esm.sh/@jsquash/avif@2.1.1/encode.js');
  avifEncode = mod.default;
}

// --- Handle Files ---
function handleFiles(fileListInput) {
  const files = Array.from(fileListInput);

  for (const file of files) {
    if (inputFiles.length >= MAX_FILES) {
      showToast(t('toastLimitFiles'));
      break;
    }
    if (!isHeicFile(file)) {
      showToast(t('toastInvalidType'));
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast(t('toastLimitSize'));
      continue;
    }

    const id = ++fileIdCounter;
    inputFiles.push({ id, file, objectUrl: null });
  }

  renderFileList();
  updateUI();
}

function removeFile(id) {
  const idx = inputFiles.findIndex(f => f.id === id);
  if (idx !== -1) {
    if (inputFiles[idx].objectUrl) URL.revokeObjectURL(inputFiles[idx].objectUrl);
    inputFiles.splice(idx, 1);
  }
  renderFileList();
  updateUI();
}

function clearAll() {
  inputFiles.forEach(f => { if (f.objectUrl) URL.revokeObjectURL(f.objectUrl); });
  results.forEach(r => { if (r.objectUrl) URL.revokeObjectURL(r.objectUrl); });
  inputFiles = [];
  results = [];
  renderFileList();
  renderResults();
  updateUI();
}

// --- Render File List ---
function renderFileList() {
  fileList.innerHTML = '';

  inputFiles.forEach(({ id, file }) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-item__thumb">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="4" y="2" width="32" height="36" rx="3" stroke="var(--color-text-dim)" stroke-width="1.5" opacity="0.4"/><text x="20" y="24" text-anchor="middle" fill="var(--color-text-dim)" font-size="8" font-weight="600" opacity="0.6">HEIC</text></svg>
      </div>
      <div class="file-item__info">
        <span class="file-item__name" title="${file.name}">${file.name}</span>
        <span class="file-item__size">${formatSize(file.size)}</span>
      </div>
      <button class="file-item__remove" type="button" aria-label="Remove" data-id="${id}">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      </button>`;
    fileList.appendChild(item);
  });

  // Bind remove buttons
  fileList.querySelectorAll('.file-item__remove').forEach(btn => {
    btn.addEventListener('click', () => removeFile(Number(btn.dataset.id)));
  });

  fileCount.textContent = `${inputFiles.length} / ${MAX_FILES}`;
}

// --- Update UI State ---
function updateUI() {
  const hasFiles = inputFiles.length > 0;
  const hasResults = results.length > 0;

  // Drop zone toggling
  dropZone.hidden = hasFiles;
  dropZoneCompact.hidden = !hasFiles;

  // Format-specific UI
  const isPng = outputFormat === 'png';
  presetsArea.hidden = isPng;
  sliderArea.hidden = isPng;
  pngWarning.hidden = !isPng;

  // Buttons
  convertAllBtn.disabled = !hasFiles || isConverting;
  downloadAllBtn.disabled = !hasResults;

  // Mobile bar
  if (mobileConvertBtn) mobileConvertBtn.disabled = !hasFiles || isConverting;
  if (mobileDownloadBtn) mobileDownloadBtn.disabled = !hasResults;

  // Show/hide mobile bar
  if (mobileBar) {
    mobileBar.hidden = !hasFiles && !hasResults;
  }
}

// --- Format Selection ---
function setFormat(format) {
  outputFormat = format;
  formatBtns.forEach(btn => {
    btn.classList.toggle('format-tabs__item--active', btn.dataset.format === format);
  });
  updateUI();
}

// --- Convert Single File ---
async function convertSingle(file, format, q) {
  // Load HEIC decoder
  await loadHeicTo();

  // Decode HEIC to intermediate format
  const toType = format === 'png' ? 'image/png' : 'image/jpeg';
  const decoded = await heicToModule.heicTo({ blob: file, toType });

  if (format === 'png') {
    // PNG: heic-to already output PNG blob
    return decoded;
  }

  if (format === 'jpg') {
    // JPG: re-encode via Canvas for quality control
    const bitmap = await createImageBitmap(decoded, { imageOrientation: 'from-image' });
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    bitmap.close();
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', q / 100));
  }

  // AVIF: decode to ImageData, then encode with @jsquash/avif
  await loadAvifEncoder();
  const bitmap = await createImageBitmap(decoded, { imageOrientation: 'from-image' });
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const encodeOptions = q === 100
    ? { lossless: true, speed: 2, subsample: 1 }
    : { quality: q, speed: 6, subsample: 1 };

  const avifBuffer = await avifEncode(imageData, encodeOptions);
  return new Blob([avifBuffer], { type: 'image/avif' });
}

// --- Convert All ---
async function convertAll() {
  if (isConverting || inputFiles.length === 0) return;

  isConverting = true;
  updateUI();

  // Show loading spinner on divider
  if (divider) divider.classList.add('divider--loading');

  // Clear previous results
  results.forEach(r => { if (r.objectUrl) URL.revokeObjectURL(r.objectUrl); });
  results = [];

  // Show progress bar, hide empty state and results list
  resultsEmpty.hidden = true;
  summaryBar.hidden = true;
  resultsList.innerHTML = '';
  resultsProgress.hidden = false;
  progressFill.value = 0;
  progressPercent.textContent = '0%';
  progressFile.textContent = '';

  convertAllBtn.querySelector('span').textContent = t('converting');

  for (let i = 0; i < inputFiles.length; i++) {
    const { id, file } = inputFiles[i];

    // Update progress bar (before conversion)
    progressFile.textContent = file.name;
    convertAllBtn.querySelector('span').textContent =
      `${t('converting')} ${i + 1}/${inputFiles.length}`;

    try {
      const convertedBlob = await convertSingle(file, outputFormat, quality);
      const objectUrl = URL.createObjectURL(convertedBlob);
      results.push({
        id,
        originalFile: file,
        convertedBlob,
        objectUrl,
        originalSize: file.size,
        convertedSize: convertedBlob.size,
      });
    } catch (err) {
      console.error(`Failed to convert ${file.name}:`, err);
      results.push({
        id,
        originalFile: file,
        convertedBlob: null,
        objectUrl: null,
        originalSize: file.size,
        convertedSize: 0,
        error: true,
      });
    }

    // Update progress bar (after conversion)
    const percent = Math.round(((i + 1) / inputFiles.length) * 100);
    progressFill.value = percent;
    progressPercent.textContent = `${percent}%`;
    await new Promise(r => requestAnimationFrame(r));
  }

  progressFile.textContent = '';

  isConverting = false;
  if (divider) divider.classList.remove('divider--loading');
  convertAllBtn.querySelector('span').textContent = t('convertAll');

  // Hide progress, show results
  resultsProgress.hidden = true;
  renderResults();
  updateUI();
  showToast(t('toastConverted'));
  flashSuccess(convertAllBtn, t('toastConverted'));
  flashSuccess(mobileConvertBtn, t('toastConverted'));
}

// --- Render Results ---
function renderResults() {
  const successResults = results.filter(r => !r.error);
  const hasResults = successResults.length > 0;

  resultsEmpty.hidden = hasResults;
  summaryBar.hidden = !hasResults;
  resultsList.innerHTML = '';
  resultCount.textContent = String(successResults.length);

  if (!hasResults) return;

  // Summary
  const totalOriginal = successResults.reduce((sum, r) => sum + r.originalSize, 0);
  const totalConverted = successResults.reduce((sum, r) => sum + r.convertedSize, 0);
  const savingsPercent = totalOriginal > 0
    ? Math.round((1 - totalConverted / totalOriginal) * 100)
    : 0;

  summaryFiles.textContent = String(successResults.length);
  summaryOriginal.textContent = formatSize(totalOriginal);
  summaryOutput.textContent = formatSize(totalConverted);
  summarySavings.textContent = savingsPercent >= 0 ? `-${savingsPercent}%` : `+${Math.abs(savingsPercent)}%`;

  // Done banner with download-all button
  const doneBanner = document.createElement('div');
  doneBanner.className = 'results-done-banner';
  doneBanner.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 9.5l2 2 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> <span>${t('conversionDone')}</span> <button type="button" class="results-done-banner__btn">${t('downloadAll')}</button>`;
  doneBanner.querySelector('.results-done-banner__btn').addEventListener('click', downloadAllZip);
  resultsList.appendChild(doneBanner);

  // Render each result
  successResults.forEach(result => {
    const savings = result.originalSize > 0
      ? Math.round((1 - result.convertedSize / result.originalSize) * 100)
      : 0;
    const outName = getOutputName(result.originalFile.name, outputFormat);
    const savingsLabel = savings >= 0 ? `-${savings}%` : `+${Math.abs(savings)}%`;

    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <div class="result-item__thumb checkerboard" data-id="${result.id}">
        <img src="${result.objectUrl}" alt="${outName}" loading="lazy">
      </div>
      <div class="result-item__info">
        <span class="result-item__name" title="${outName}">${outName}</span>
        <div class="result-item__stats">
          <span class="result-item__sizes">${formatSize(result.originalSize)} &rarr; ${formatSize(result.convertedSize)}</span>
          <span class="result-item__savings">${savingsLabel}</span>
        </div>
      </div>
      <button class="btn btn--ghost result-item__download" type="button" data-id="${result.id}" title="${t('downloadSingle')}">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8.5M4.5 7.5L8 11l3.5-3.5M2.5 13h11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>`;
    resultsList.appendChild(item);
  });

  // Bind download buttons
  resultsList.querySelectorAll('.result-item__download').forEach(btn => {
    btn.addEventListener('click', () => downloadSingle(Number(btn.dataset.id)));
  });

  // Bind thumbnail clicks for modal
  resultsList.querySelectorAll('.result-item__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => openModal(Number(thumb.dataset.id)));
  });
}

// --- Download Single ---
function downloadSingle(id) {
  const result = results.find(r => r.id === id);
  if (!result || !result.convertedBlob) return;

  const a = document.createElement('a');
  a.href = result.objectUrl;
  a.download = getOutputName(result.originalFile.name, outputFormat);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- Download All ZIP ---
async function downloadAllZip() {
  const successResults = results.filter(r => !r.error && r.convertedBlob);
  if (successResults.length === 0) return;

  // Single file — download directly
  if (successResults.length === 1) {
    downloadSingle(successResults[0].id);
    showToast(t('toastDownload'));
    return;
  }

  try {
    const zip = new JSZip();
    successResults.forEach(result => {
      zip.file(getOutputName(result.originalFile.name, outputFormat), result.convertedBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heic-converted-${outputFormat}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('toastDownload'));
  } catch (err) {
    console.error('ZIP creation failed:', err);
    showToast(t('toastError'));
  }
}

// --- Modal ---
function openModal(id) {
  const result = results.find(r => r.id === id);
  if (!result || !result.objectUrl) return;

  const outName = getOutputName(result.originalFile.name, outputFormat);
  modalImg.src = result.objectUrl;
  modalImg.alt = outName;
  modalInfo.textContent = `${outName} \u2014 ${formatSize(result.convertedSize)}`;
  imageModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  imageModal.hidden = true;
  modalImg.src = '';
  document.body.style.overflow = '';
}

// --- Quality Presets ---
function setQuality(q) {
  quality = q;
  qualitySlider.value = q;
  qualityValue.textContent = q;

  presetBtns.forEach(btn => {
    btn.classList.toggle('tool-bar__preset--active', Number(btn.dataset.quality) === q);
  });
}

// --- Drag & Drop ---
function setupDragDrop(zone) {
  let dragCounter = 0;

  zone.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  });

  zone.addEventListener('dragenter', e => {
    e.preventDefault();
    dragCounter++;
    zone.classList.add('drop-zone--active');
  });

  zone.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      zone.classList.remove('drop-zone--active');
    }
  });

  zone.addEventListener('drop', e => {
    e.preventDefault();
    dragCounter = 0;
    zone.classList.remove('drop-zone--active');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });
}

// --- Event Listeners ---
themeToggle.addEventListener('click', toggleTheme);
clearBtn.addEventListener('click', clearAll);
convertAllBtn.addEventListener('click', convertAll);
downloadAllBtn.addEventListener('click', downloadAllZip);

// Divider click shortcut
divider.addEventListener('click', convertAll);

browseBtn.addEventListener('click', () => fileInput.click());
dropZoneCompact.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    handleFiles(fileInput.files);
    fileInput.value = '';
  }
});

// Format tabs
formatBtns.forEach(btn => {
  btn.addEventListener('click', () => setFormat(btn.dataset.format));
});

// Quality slider
qualitySlider.addEventListener('input', () => {
  const val = Number(qualitySlider.value);
  quality = val;
  qualityValue.textContent = val;

  presetBtns.forEach(btn => {
    btn.classList.toggle('tool-bar__preset--active', Number(btn.dataset.quality) === val);
  });
});

// Preset buttons
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => setQuality(Number(btn.dataset.quality)));
});

// Modal
modalBackdrop.addEventListener('click', closeModal);
modalClose.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !imageModal.hidden) closeModal();
});

// Mobile buttons
if (mobileConvertBtn) mobileConvertBtn.addEventListener('click', convertAll);
if (mobileDownloadBtn) mobileDownloadBtn.addEventListener('click', downloadAllZip);

// Drag & drop on both zones
setupDragDrop(dropZone);
setupDragDrop(dropZoneCompact);

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

// --- Init ---
applyTheme();
applyLanguage();
