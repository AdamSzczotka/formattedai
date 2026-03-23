// ============================================
// FormattedAI — AVIF Converter Logic
// ============================================

// --- i18n Translations ---
const translations = {
  pl: {
    subtitle: 'Konwertuj obrazki na format AVIF',
    clear: 'Wyczy\u015B\u0107',
    convertAll: 'Konwertuj wszystko',
    downloadAll: 'Pobierz ZIP',
    inputTitle: 'Wej\u015Bcie',
    outputTitle: 'Wynik',
    quality: 'Jako\u015B\u0107',
    presetLow: 'Niska',
    presetMedium: '\u015Arednia',
    presetHigh: 'Wysoka',
    presetLossless: 'Bezstratna',
    dropText: 'Przeci\u0105gnij i upu\u015B\u0107 obrazki tutaj',
    browseFiles: 'Przegl\u0105daj pliki',
    addMore: 'Dodaj wi\u0119cej plik\u00F3w',
    metaInfo: 'Metadane EXIF zostan\u0105 usuni\u0119te',
    emptyText: 'Tu pojawi\u0105 si\u0119 skonwertowane obrazki',
    emptyHint: 'Dodaj pliki po lewej stronie',
    toastConverted: 'Konwersja zako\u0144czona!',
    toastDownload: 'Pobrano!',
    toastError: 'B\u0142\u0105d konwersji',
    toastLimitFiles: 'Maksymalnie 20 plik\u00F3w',
    toastLimitSize: 'Plik za du\u017Cy (max 50MB)',
    toastInvalidType: 'Nieobs\u0142ugiwany format pliku',
    madeBy: 'Stworzone przez',
    totalFiles: 'Pliki:',
    originalSize: 'Orygina\u0142:',
    savings: 'Oszcz\u0119dno\u015B\u0107:',
    converting: 'Konwertowanie...',
    downloadSingle: 'Pobierz',
    noSupportTitle: 'Twoja przegl\u0105darka nie obs\u0142uguje kodowania AVIF',
    noSupportText: 'Aby korzysta\u0107 z konwertera AVIF, u\u017Cyj jednej z poni\u017Cszych przegl\u0105darek:',
    backHome: 'Wr\u00F3\u0107 do strony g\u0142\u00F3wnej',
    pageTitle: 'AVIF Converter \u2014 Konwertuj PNG, JPG, WebP na AVIF | FormattedAI',
  },
  en: {
    subtitle: 'Convert images to AVIF format',
    clear: 'Clear',
    convertAll: 'Convert all',
    downloadAll: 'Download ZIP',
    inputTitle: 'Input',
    outputTitle: 'Output',
    quality: 'Quality',
    presetLow: 'Low',
    presetMedium: 'Medium',
    presetHigh: 'High',
    presetLossless: 'Lossless',
    dropText: 'Drag & drop images here',
    browseFiles: 'Browse files',
    addMore: 'Add more files',
    metaInfo: 'EXIF metadata will be removed',
    emptyText: 'Converted images will appear here',
    emptyHint: 'Add files on the left side',
    toastConverted: 'Conversion complete!',
    toastDownload: 'Downloaded!',
    toastError: 'Conversion error',
    toastLimitFiles: 'Maximum 20 files',
    toastLimitSize: 'File too large (max 50MB)',
    toastInvalidType: 'Unsupported file format',
    madeBy: 'Created by',
    totalFiles: 'Files:',
    originalSize: 'Original:',
    savings: 'Savings:',
    converting: 'Converting...',
    downloadSingle: 'Download',
    noSupportTitle: 'Your browser does not support AVIF encoding',
    noSupportText: 'To use the AVIF converter, please use one of the following browsers:',
    backHome: 'Back to home',
    pageTitle: 'AVIF Converter \u2014 Convert PNG, JPG, WebP to AVIF | FormattedAI',
  },
};

// --- State ---
let currentLang = localStorage.getItem('formattedai-lang') || 'pl';
let quality = 65;
let inputFiles = []; // { id, file, objectUrl }
let results = [];    // { id, originalFile, avifBlob, objectUrl, originalSize, avifSize }
let isConverting = false;
let fileIdCounter = 0;

// --- Constants ---
const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

// --- DOM ---
const app = document.getElementById('app');
const avifWarning = document.getElementById('avifWarning');
const langToggle = document.getElementById('langToggle');
const langFlag = document.getElementById('langFlag');
const clearBtn = document.getElementById('clearBtn');
const convertAllBtn = document.getElementById('convertAllBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
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
const summaryAvif = document.getElementById('summaryAvif');
const summarySavings = document.getElementById('summarySavings');
const resultsEmpty = document.getElementById('resultsEmpty');
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

// --- Preset buttons ---
const presetBtns = document.querySelectorAll('.quality-bar__preset');

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
    el.textContent = t(key);
  });

  localStorage.setItem('formattedai-lang', currentLang);
}

function toggleLanguage() {
  currentLang = currentLang === 'pl' ? 'en' : 'pl';
  applyLanguage();
}

// --- Theme sync ---
function syncTheme() {
  const theme = localStorage.getItem('formattedai-theme') || 'light';
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// --- AVIF Support Check ---
async function checkAvifSupport() {
  // Method 1: OffscreenCanvas (most reliable)
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const offscreen = new OffscreenCanvas(1, 1);
      const ctx = offscreen.getContext('2d');
      ctx.fillRect(0, 0, 1, 1);
      const blob = await offscreen.convertToBlob({ type: 'image/avif', quality: 0.5 });
      if (blob && blob.type === 'image/avif' && blob.size > 0) return true;
    } catch {
      // Fall through to method 2
    }
  }

  // Method 2: Regular canvas toBlob
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillRect(0, 0, 1, 1);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/avif', 0.5));
    if (blob && blob.type === 'image/avif' && blob.size > 0) return true;
  } catch {
    // Fall through to method 3
  }

  // Method 3: toDataURL check (fastest, synchronous)
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext('2d').fillRect(0, 0, 1, 1);
    return canvas.toDataURL('image/avif').startsWith('data:image/avif');
  } catch {
    return false;
  }
}

// --- File Size Formatter ---
function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// --- File Name Helpers ---
function getAvifName(originalName) {
  return originalName.replace(/\.[^.]+$/, '.avif');
}

// --- Toast ---
function showToast(message) {
  toast.querySelector('.toast__text').textContent = message || t('toastConverted');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// --- Handle Files ---
function handleFiles(fileListInput) {
  const files = Array.from(fileListInput);

  for (const file of files) {
    if (inputFiles.length >= MAX_FILES) {
      showToast(t('toastLimitFiles'));
      break;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast(t('toastInvalidType'));
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast(t('toastLimitSize'));
      continue;
    }

    const id = ++fileIdCounter;
    const objectUrl = URL.createObjectURL(file);
    inputFiles.push({ id, file, objectUrl });
  }

  renderFileList();
  updateUI();
}

function removeFile(id) {
  const idx = inputFiles.findIndex(f => f.id === id);
  if (idx !== -1) {
    URL.revokeObjectURL(inputFiles[idx].objectUrl);
    inputFiles.splice(idx, 1);
  }
  renderFileList();
  updateUI();
}

function clearAll() {
  inputFiles.forEach(f => URL.revokeObjectURL(f.objectUrl));
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

  inputFiles.forEach(({ id, file, objectUrl }) => {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <div class="file-item__thumb checkerboard">
        <img src="${objectUrl}" alt="${file.name}" loading="lazy">
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

// --- Convert to AVIF ---
async function convertToAvif(file, q) {
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Fallback without orientation option
    bitmap = await createImageBitmap(file);
  }

  // Try OffscreenCanvas first
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const offscreen = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      return await offscreen.convertToBlob({ type: 'image/avif', quality: q / 100 });
    } catch {
      // Fall through to regular canvas
    }
  }

  // Fallback: regular canvas
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error('toBlob failed')),
      'image/avif',
      q / 100
    );
  });
}

// --- Convert All ---
async function convertAll() {
  if (isConverting || inputFiles.length === 0) return;

  isConverting = true;
  updateUI();

  // Clear previous results
  results.forEach(r => { if (r.objectUrl) URL.revokeObjectURL(r.objectUrl); });
  results = [];

  convertAllBtn.querySelector('span').textContent = t('converting');

  for (let i = 0; i < inputFiles.length; i++) {
    const { id, file } = inputFiles[i];

    // Update progress in button
    convertAllBtn.querySelector('span').textContent =
      `${t('converting')} ${i + 1}/${inputFiles.length}`;

    try {
      const avifBlob = await convertToAvif(file, quality);
      const objectUrl = URL.createObjectURL(avifBlob);
      results.push({
        id,
        originalFile: file,
        avifBlob,
        objectUrl,
        originalSize: file.size,
        avifSize: avifBlob.size,
      });
    } catch (err) {
      console.error(`Failed to convert ${file.name}:`, err);
      results.push({
        id,
        originalFile: file,
        avifBlob: null,
        objectUrl: null,
        originalSize: file.size,
        avifSize: 0,
        error: true,
      });
    }
  }

  isConverting = false;
  convertAllBtn.querySelector('span').textContent = t('convertAll');
  renderResults();
  updateUI();
  showToast(t('toastConverted'));
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
  const totalAvif = successResults.reduce((sum, r) => sum + r.avifSize, 0);
  const savingsPercent = totalOriginal > 0
    ? Math.round((1 - totalAvif / totalOriginal) * 100)
    : 0;

  summaryFiles.textContent = String(successResults.length);
  summaryOriginal.textContent = formatSize(totalOriginal);
  summaryAvif.textContent = formatSize(totalAvif);
  summarySavings.textContent = `-${savingsPercent}%`;

  // Render each result
  successResults.forEach(result => {
    const savings = result.originalSize > 0
      ? Math.round((1 - result.avifSize / result.originalSize) * 100)
      : 0;
    const avifName = getAvifName(result.originalFile.name);
    const barWidth = result.originalSize > 0
      ? Math.max(5, Math.round((result.avifSize / result.originalSize) * 100))
      : 100;

    const item = document.createElement('div');
    item.className = 'result-item';
    item.innerHTML = `
      <div class="result-item__thumb checkerboard" data-id="${result.id}">
        <img src="${result.objectUrl}" alt="${avifName}" loading="lazy">
      </div>
      <div class="result-item__info">
        <span class="result-item__name" title="${avifName}">${avifName}</span>
        <div class="result-item__stats">
          <span class="result-item__sizes">${formatSize(result.originalSize)} &rarr; ${formatSize(result.avifSize)}</span>
          <span class="result-item__savings">-${savings}%</span>
        </div>
        <div class="result-item__bar">
          <div class="result-item__bar-fill" style="width: ${barWidth}%"></div>
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
  if (!result || !result.avifBlob) return;

  const a = document.createElement('a');
  a.href = result.objectUrl;
  a.download = getAvifName(result.originalFile.name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// --- Download All ZIP ---
async function downloadAllZip() {
  const successResults = results.filter(r => !r.error && r.avifBlob);
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
      zip.file(getAvifName(result.originalFile.name), result.avifBlob);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avif-converted.zip';
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

  const avifName = getAvifName(result.originalFile.name);
  modalImg.src = result.objectUrl;
  modalImg.alt = avifName;
  modalInfo.textContent = `${avifName} — ${formatSize(result.avifSize)}`;
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
    btn.classList.toggle('quality-bar__preset--active', Number(btn.dataset.quality) === q);
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
langToggle.addEventListener('click', toggleLanguage);
clearBtn.addEventListener('click', clearAll);
convertAllBtn.addEventListener('click', convertAll);
downloadAllBtn.addEventListener('click', downloadAllZip);

browseBtn.addEventListener('click', () => fileInput.click());
dropZoneCompact.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    handleFiles(fileInput.files);
    fileInput.value = '';
  }
});

// Quality slider
qualitySlider.addEventListener('input', () => {
  const val = Number(qualitySlider.value);
  quality = val;
  qualityValue.textContent = val;

  // Update preset active state
  presetBtns.forEach(btn => {
    btn.classList.toggle('quality-bar__preset--active', Number(btn.dataset.quality) === val);
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

// Also allow drop on the entire input area
setupDragDrop(inputArea);

// --- Init ---
async function init() {
  syncTheme();
  applyLanguage();

  const supported = await checkAvifSupport();
  if (!supported) {
    app.hidden = true;
    avifWarning.hidden = false;
    if (mobileBar) mobileBar.hidden = true;
  }
}

init();
