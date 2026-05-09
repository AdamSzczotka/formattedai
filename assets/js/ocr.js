// ============================================
// FormattedAI — OCR Tool Logic
// Uses Tesseract.js (UMD, loaded as window.Tesseract)
// PDF rendering via local pdf.js (vendor)
// ============================================

// --- i18n Translations ---
const translations = {
  pl: {
    subtitle: 'Wyciagnij tekst z obrazka i PDF',
    languages: 'Jezyki',
    mode: 'Tryb',
    modeFast: 'Szybki',
    modeAccurate: 'Dokladny',
    clear: 'Wyczysc',
    recognize: 'Rozpoznaj tekst',
    inputTitle: 'Wejscie',
    outputTitle: 'Wynik',
    confidence: 'Pewnosc',
    words: 'slow',
    dropText: 'Przeciagnij i upusc obrazek lub PDF',
    browseFiles: 'Przegladaj pliki',
    addMore: 'Dodaj wiecej plikow',
    pasteHint: 'lub wklej screenshot (Ctrl+V)',
    emptyText: 'Wyciagniety tekst pojawi sie tutaj',
    emptyHint: 'Dodaj plik po lewej, kliknij Rozpoznaj',
    processing: 'Przetwarzanie...',
    loadingEngine: 'Pobieram silnik OCR...',
    loadingLang: 'Pobieram jezyk',
    recognizing: 'Rozpoznaje tekst',
    detectingOrientation: 'Wykrywam orientacje',
    extractingPdf: 'Czytam tekst z PDF',
    page: 'Strona',
    cancel: 'Anuluj',
    copy: 'Kopiuj',
    toastDone: 'Gotowe!',
    toastCopied: 'Skopiowano do schowka',
    toastError: 'Blad rozpoznawania',
    toastInvalidType: 'Nieobslugiwany format pliku',
    toastTooLarge: 'Plik za duzy (max 100 MB)',
    toastDocxSoon: 'Eksport .docx wkrotce',
    toastNoLang: 'Wybierz przynajmniej jeden jezyk',
    toastEncryptedPdf: 'PDF zabezpieczony haslem — nie mozna otworzyc',
    toastCorruptedPdf: 'Nie mozna otworzyc PDF (uszkodzony lub niewspierany format)',
    toastCancelled: 'Anulowano',
    modeFastTitle: 'Szybciej, dla dobrej jakosci skanow i screenshotow',
    modeAccurateTitle: 'Wolniej, ale lepiej dla obroconych, krzywych lub niewyraznych skanow',
    madeBy: 'Stworzone przez',
    footerBadge: '100% client-side',
    navArticles: 'Artykuly',
    navAbout: 'O nas',
    navPrivacy: 'Prywatnosc',
    navContact: 'Kontakt',
  },
  en: {
    subtitle: 'Extract text from images and PDF',
    languages: 'Languages',
    mode: 'Mode',
    modeFast: 'Fast',
    modeAccurate: 'Accurate',
    clear: 'Clear',
    recognize: 'Recognize text',
    inputTitle: 'Input',
    outputTitle: 'Output',
    confidence: 'Confidence',
    words: 'words',
    dropText: 'Drag & drop an image or PDF',
    browseFiles: 'Browse files',
    addMore: 'Add more files',
    pasteHint: 'or paste a screenshot (Ctrl+V)',
    emptyText: 'Recognized text will appear here',
    emptyHint: 'Add a file on the left, click Recognize',
    processing: 'Processing...',
    loadingEngine: 'Downloading OCR engine...',
    loadingLang: 'Downloading language',
    recognizing: 'Recognizing text',
    detectingOrientation: 'Detecting orientation',
    extractingPdf: 'Reading PDF text',
    page: 'Page',
    cancel: 'Cancel',
    copy: 'Copy',
    toastDone: 'Done!',
    toastCopied: 'Copied to clipboard',
    toastError: 'Recognition error',
    toastInvalidType: 'Unsupported file format',
    toastTooLarge: 'File too large (max 100 MB)',
    toastDocxSoon: '.docx export coming soon',
    toastNoLang: 'Select at least one language',
    toastEncryptedPdf: 'PDF is password-protected — cannot open',
    toastCorruptedPdf: 'Cannot open PDF (corrupted or unsupported format)',
    toastCancelled: 'Cancelled',
    modeFastTitle: 'Faster, fine for good quality scans and screenshots',
    modeAccurateTitle: 'Slower but better for rotated, skewed, or low-quality scans',
    madeBy: 'Created by',
    footerBadge: '100% client-side',
    navArticles: 'Articles',
    navAbout: 'About',
    navPrivacy: 'Privacy',
    navContact: 'Contact',
  },
};

const lang = (document.documentElement.lang || 'pl').toLowerCase().startsWith('en') ? 'en' : 'pl';
const t = (key) => translations[lang][key] ?? key;

// --- Config ---
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const SUPPORTED_IMAGE = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
const SUPPORTED_PDF = ['application/pdf'];

// --- State ---
const state = {
  files: [],          // [{ id, file, name, size, type, thumbUrl }]
  activeLangs: lang === 'en' ? ['eng', 'pol'] : ['pol', 'eng'],
  mode: 'fast',
  busy: false,
  worker: null,
  workerKey: '',      // joined langs + '|' + mode currently configured
  cancelRequested: false,
};

// --- DOM helpers ---
const $ = (id) => document.getElementById(id);
const setBusy = (busy) => {
  state.busy = busy;
  const noWork = state.files.length === 0 || state.activeLangs.length === 0;
  $('recognizeBtn').disabled = busy || noWork;
  $('mobileRecognizeBtn').disabled = busy || state.files.length === 0;
  $('clearBtn').disabled = busy;
  const divider = $('divider');
  if (divider) {
    divider.classList.toggle('divider--loading', busy);
    divider.style.cursor = noWork || busy ? 'default' : 'pointer';
    divider.setAttribute('role', 'button');
    divider.setAttribute('aria-label', lang === 'en' ? 'Recognize text' : 'Rozpoznaj tekst');
  }
  const cancelBtn = $('cancelBtn');
  if (cancelBtn) {
    if (busy) cancelBtn.removeAttribute('hidden');
    else cancelBtn.setAttribute('hidden', '');
    cancelBtn.disabled = false;
  }
  // Disable language/mode pickers while running
  document.querySelectorAll('.lang-chip, .mode-btn').forEach(el => {
    el.classList.toggle('is-disabled', busy);
  });
};

const showToast = (message, type = 'success') => {
  const toast = $('toast');
  const text = toast.querySelector('.toast__text');
  text.textContent = message;
  toast.classList.toggle('toast--error', type === 'error');
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
};

// --- i18n apply ---
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key] !== undefined) {
      if (el.children.length === 0) el.textContent = translations[lang][key];
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (translations[lang][key] !== undefined) {
      el.setAttribute('title', translations[lang][key]);
    }
  });
}

// --- Theme ---
function initTheme() {
  const saved = localStorage.getItem('formattedai-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  $('themeToggle').addEventListener('click', () => {
    document.documentElement.classList.add('theme-switching');
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('formattedai-theme', next);
    setTimeout(() => document.documentElement.classList.remove('theme-switching'), 300);
  });
}

// --- About modal ---
function initAboutModal() {
  const modal = $('aboutModal');
  const open = () => {
    modal.removeAttribute('hidden');
    requestAnimationFrame(() => modal.classList.add('show'));
  };
  const close = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.setAttribute('hidden', ''), 220);
  };
  $('aboutTrigger').addEventListener('click', open);
  $('aboutModalClose').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hasAttribute('hidden')) close();
  });
}

// --- File handling ---
function addFiles(files) {
  if (state.busy) return;
  let added = 0;
  for (const file of files) {
    if (!isSupported(file)) {
      showToast(t('toastInvalidType'), 'error');
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      showToast(t('toastTooLarge'), 'error');
      continue;
    }
    const id = Math.random().toString(36).slice(2);
    const isImg = SUPPORTED_IMAGE.includes(file.type);
    const thumbUrl = isImg ? URL.createObjectURL(file) : null;
    state.files.push({ id, file, name: file.name, size: file.size, type: file.type, thumbUrl, isImg });
    added++;
  }
  if (added > 0) renderFileList();
}

function isSupported(file) {
  if (SUPPORTED_IMAGE.includes(file.type)) return true;
  if (SUPPORTED_PDF.includes(file.type)) return true;
  // Some browsers report empty type — allow by extension
  const name = (file.name || '').toLowerCase();
  if (/\.(png|jpe?g|webp|gif|bmp|tiff?)$/.test(name)) return true;
  if (name.endsWith('.pdf')) return true;
  return false;
}

function removeFile(id) {
  const idx = state.files.findIndex(f => f.id === id);
  if (idx === -1) return;
  if (state.files[idx].thumbUrl) URL.revokeObjectURL(state.files[idx].thumbUrl);
  state.files.splice(idx, 1);
  renderFileList();
}

function renderFileList() {
  const list = $('fileList');
  const dropZone = $('dropZone');
  const dropZoneCompact = $('dropZoneCompact');
  const fileCount = $('fileCount');

  fileCount.textContent = state.files.length;

  if (state.files.length === 0) {
    list.innerHTML = '';
    dropZone.removeAttribute('hidden');
    dropZoneCompact.setAttribute('hidden', '');
  } else {
    dropZone.setAttribute('hidden', '');
    dropZoneCompact.removeAttribute('hidden');
    list.innerHTML = state.files.map(f => `
      <div class="file-item" data-id="${f.id}">
        <div class="file-item__thumb">
          ${f.isImg
            ? `<img src="${f.thumbUrl}" alt="">`
            : `<svg width="20" height="20" viewBox="0 0 16 16" fill="none"><path d="M4 1.5h5l3 3V14a.5.5 0 01-.5.5h-7A.5.5 0 014 14V1.5z" stroke="currentColor" stroke-width="1.3"/><path d="M9 1.5V4.5h3" stroke="currentColor" stroke-width="1.3"/></svg>`
          }
        </div>
        <div class="file-item__info">
          <div class="file-item__name">${escapeHtml(f.name)}</div>
          <div class="file-item__meta">${formatSize(f.size)} ${f.type === 'application/pdf' ? '· PDF' : ''}</div>
        </div>
        <button class="file-item__remove" type="button" data-remove="${f.id}" aria-label="Remove">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
      </div>
    `).join('');
  }

  setBusy(state.busy);
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// --- Drop zone, browse, paste ---
function initInputs() {
  const dropZone = $('dropZone');
  const dropZoneCompact = $('dropZoneCompact');
  const fileInput = $('fileInput');
  const browseBtn = $('browseBtn');

  const triggerBrowse = () => fileInput.click();
  browseBtn.addEventListener('click', (e) => { e.stopPropagation(); triggerBrowse(); });
  dropZone.addEventListener('click', triggerBrowse);
  dropZoneCompact.addEventListener('click', triggerBrowse);

  fileInput.addEventListener('change', (e) => {
    addFiles(e.target.files);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach(ev => {
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      dropZone.classList.add('drop-zone--active');
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    document.addEventListener(ev, (e) => {
      e.preventDefault();
      if (ev === 'dragleave' && e.relatedTarget) return;
      dropZone.classList.remove('drop-zone--active');
    });
  });
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  });

  // Clipboard paste — screenshots
  document.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const pastedFiles = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) {
          // Give pasted files a friendly name
          if (!f.name || f.name === 'image.png') {
            const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const named = new File([f], `screenshot-${ts}.png`, { type: f.type });
            pastedFiles.push(named);
          } else {
            pastedFiles.push(f);
          }
        }
      }
    }
    if (pastedFiles.length) {
      e.preventDefault();
      addFiles(pastedFiles);
    }
  });

  // Remove file
  $('fileList').addEventListener('click', (e) => {
    const removeId = e.target.closest('[data-remove]')?.getAttribute('data-remove');
    if (removeId) removeFile(removeId);
  });

  // Clear
  $('clearBtn').addEventListener('click', clearAll);
}

function clearAll() {
  if (state.busy) return;
  for (const f of state.files) if (f.thumbUrl) URL.revokeObjectURL(f.thumbUrl);
  state.files = [];
  renderFileList();
  resetOutput();
}

// --- Language picker ---
function initLangPicker() {
  const picker = $('langPicker');
  picker.addEventListener('click', (e) => {
    const chip = e.target.closest('.lang-chip');
    if (!chip || state.busy) return;
    const code = chip.getAttribute('data-lang');
    const idx = state.activeLangs.indexOf(code);
    if (idx > -1) {
      // Don't allow removing last language
      if (state.activeLangs.length === 1) {
        showToast(t('toastNoLang'), 'error');
        return;
      }
      state.activeLangs.splice(idx, 1);
      chip.classList.remove('lang-chip--active');
    } else {
      state.activeLangs.push(code);
      chip.classList.add('lang-chip--active');
    }
    setBusy(state.busy);
  });
}

// --- Mode picker ---
function initModePicker() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.busy) return;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('mode-btn--active'));
      btn.classList.add('mode-btn--active');
      state.mode = btn.getAttribute('data-mode');
    });
  });
}

// --- Output rendering ---
function showProgress(text, percent, fileLabel = '') {
  $('resultsEmpty').setAttribute('hidden', '');
  $('resultsOutput').setAttribute('hidden', '');
  $('resultsProgress').removeAttribute('hidden');
  $('progressText').textContent = text;
  $('progressPercent').textContent = `${Math.round(percent)}%`;
  $('progressFill').value = percent;
  $('progressFile').textContent = fileLabel;
}

function showOutput(text, confidence, words) {
  $('resultsEmpty').setAttribute('hidden', '');
  $('resultsProgress').setAttribute('hidden', '');
  $('resultsOutput').removeAttribute('hidden');
  $('textOutput').value = text;
  $('confidenceBadge').removeAttribute('hidden');
  $('confidenceValue').textContent = `${Math.round(confidence)}%`;
  $('wordCount').removeAttribute('hidden');
  $('wordCountValue').textContent = words;
}

function resetOutput() {
  $('resultsProgress').setAttribute('hidden', '');
  $('resultsOutput').setAttribute('hidden', '');
  $('resultsEmpty').removeAttribute('hidden');
  $('confidenceBadge').setAttribute('hidden', '');
  $('wordCount').setAttribute('hidden', '');
  $('textOutput').value = '';
}

// --- Tesseract worker ---
async function ensureWorker() {
  const langString = state.activeLangs.join('+');
  const key = `${langString}|${state.mode}`;
  if (state.worker && state.workerKey === key) return state.worker;

  // Same langs but mode changed — keep worker, just update params
  if (state.worker && state.workerKey.split('|')[0] === langString) {
    await applyTesseractParams(state.worker);
    state.workerKey = key;
    return state.worker;
  }

  if (state.worker) {
    try { await state.worker.terminate(); } catch {}
    state.worker = null;
  }

  if (typeof Tesseract === 'undefined') {
    throw new Error('Tesseract not loaded');
  }

  showProgress(t('loadingEngine'), 5);
  const worker = await Tesseract.createWorker(state.activeLangs, 1, {
    logger: (m) => {
      const pct = (m.progress ?? 0) * 100;
      let label = m.status || '';
      if (label.includes('loading language')) label = `${t('loadingLang')}...`;
      else if (label.includes('recognizing')) label = t('recognizing') + '...';
      else if (label.includes('initializing')) label = t('loadingEngine');
      showProgress(label, Math.max(5, pct), $('progressFile').textContent);
    },
  });
  await applyTesseractParams(worker);
  state.worker = worker;
  state.workerKey = key;
  return worker;
}

async function applyTesseractParams(worker) {
  // PSM (Page Segmentation Mode):
  //   3 = fully automatic, no OSD (default — fast)
  //   1 = automatic + OSD orientation/script detection (slower, more robust)
  // preserve_interword_spaces helps with table-like layouts
  await worker.setParameters({
    tessedit_pageseg_mode: state.mode === 'accurate' ? '1' : '3',
    preserve_interword_spaces: '1',
  });
}

// --- PDF rendering (lazy import pdf.js) ---
let pdfjsModule = null;
async function getPdfJs() {
  if (pdfjsModule) return pdfjsModule;
  pdfjsModule = await import('../vendor/pdf.min.mjs');
  pdfjsModule.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdf.worker.min.mjs', import.meta.url).href;
  return pdfjsModule;
}

// Render PDF page to canvas at target DPI (default 200; accurate mode bumps to 300)
async function renderPdfPage(page, scale) {
  const viewport = page.getViewport({ scale });
  // Cap dimensions to avoid runaway memory on huge pages
  const MAX_DIM = 4096;
  const factor = Math.min(1, MAX_DIM / Math.max(viewport.width, viewport.height));
  const finalScale = scale * factor;
  const finalViewport = page.getViewport({ scale: finalScale });
  const canvas = document.createElement('canvas');
  canvas.width = finalViewport.width;
  canvas.height = finalViewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport: finalViewport }).promise;
  return canvas;
}

// Extract embedded text layer from PDF page (works for digital PDFs).
// Returns trimmed string — empty/short means likely a scan, fallback to OCR.
async function extractPdfPageText(page) {
  try {
    const content = await page.getTextContent();
    if (!content?.items?.length) return '';
    // Reconstruct lines using item Y positions
    const items = content.items.filter(it => typeof it.str === 'string');
    if (!items.length) return '';
    items.sort((a, b) => {
      const ay = a.transform?.[5] ?? 0;
      const by = b.transform?.[5] ?? 0;
      if (Math.abs(ay - by) > 4) return by - ay; // Y descending (PDF origin bottom-left)
      return (a.transform?.[4] ?? 0) - (b.transform?.[4] ?? 0); // X ascending
    });
    const lines = [];
    let lastY = null;
    let buf = [];
    for (const it of items) {
      const y = it.transform?.[5] ?? 0;
      if (lastY === null || Math.abs(y - lastY) <= 4) {
        buf.push(it.str);
      } else {
        lines.push(buf.join(' ').replace(/\s+/g, ' ').trim());
        buf = [it.str];
      }
      lastY = y;
    }
    if (buf.length) lines.push(buf.join(' ').replace(/\s+/g, ' ').trim());
    return lines.filter(Boolean).join('\n').trim();
  } catch {
    return '';
  }
}

// Greyscale + Otsu adaptive binarization (accurate mode).
// Otsu picks the threshold that minimizes intra-class variance — robust to
// uneven lighting, gradients, and faded prints where a fixed contrast curve fails.
function preprocessCanvas(canvas) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = img.data;
  const n = canvas.width * canvas.height;

  // Pass 1: convert to greyscale, build 256-bin histogram
  const hist = new Uint32Array(256);
  const grey = new Uint8ClampedArray(n);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const g = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) | 0;
    grey[j] = g;
    hist[g]++;
  }

  // Pass 2: Otsu's threshold
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0, wB = 0, maxVar = 0, threshold = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = n - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) { maxVar = between; threshold = t; }
  }

  // Pass 3: apply with a slight soft margin (avoid speckle around the threshold)
  const lo = threshold - 8;
  const hi = threshold + 8;
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const g = grey[j];
    let v;
    if (g <= lo) v = 0;
    else if (g >= hi) v = 255;
    else v = ((g - lo) / (hi - lo)) * 255;
    data[i] = v; data[i + 1] = v; data[i + 2] = v;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// Rotate canvas by 0/90/180/270 degrees clockwise. Returns new canvas.
function rotateCanvas(canvas, deg) {
  const d = ((deg % 360) + 360) % 360;
  if (d === 0) return canvas;
  const out = document.createElement('canvas');
  const swap = d === 90 || d === 270;
  out.width = swap ? canvas.height : canvas.width;
  out.height = swap ? canvas.width : canvas.height;
  const ctx = out.getContext('2d');
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((d * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return out;
}

// Detect text orientation via Tesseract OSD and rotate canvas to upright.
// Tesseract's `orientation_degrees` is the angle (CW) the page must be rotated to be upright.
async function autoRotateCanvas(worker, canvas) {
  try {
    const { data } = await worker.detect(canvas);
    const deg = data?.orientation_degrees ?? 0;
    const conf = data?.orientation_confidence ?? 0;
    // Skip if rotation is small or detection unreliable
    if (deg === 0 || conf < 1) return canvas;
    return rotateCanvas(canvas, deg);
  } catch {
    // OSD fails on tiny / text-poor images — keep original
    return canvas;
  }
}

// Convert image File to canvas (so preprocess can run before OCR in accurate mode)
async function fileToCanvas(file) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return canvas;
}

// Resolve a PDF file into per-page inputs.
// Each input is either a ready-to-use embedded text block or a canvas to OCR.
// `needsBinarize` is deferred — we want to binarize AFTER rotation to keep the
// thresholding analysis aligned with upright text.
async function pdfToInputs(file, scale) {
  const pdfjs = await getPdfJs();
  const buf = await file.arrayBuffer();
  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data: buf }).promise;
  } catch (err) {
    if (err?.name === 'PasswordException' || /password/i.test(err?.message || '')) {
      const e = new Error(t('toastEncryptedPdf'));
      e.userFacing = true;
      throw e;
    }
    const e = new Error(t('toastCorruptedPdf'));
    e.userFacing = true;
    throw e;
  }
  const inputs = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    if (state.cancelRequested) break;
    const page = await pdf.getPage(i);
    const directText = await extractPdfPageText(page);
    const label = `${t('page')} ${i}/${pdf.numPages}`;
    if (directText && directText.length >= 50) {
      inputs.push({ kind: 'text', text: directText, label });
    } else {
      const canvas = await renderPdfPage(page, scale);
      // Defer preprocessing — recognizeAll runs auto-rotate first when accurate
      inputs.push({ kind: 'image', src: canvas, label, needsAccuratePrep: true });
    }
  }
  return inputs;
}

// Build inputs for a single file entry (image or PDF) honoring current mode.
// Image preprocessing (auto-rotate + Otsu) is deferred to the recognize loop so
// the worker is available when we need OSD detection.
async function buildInputs(entry) {
  const isPdf = entry.type === 'application/pdf' || /\.pdf$/i.test(entry.name);
  if (isPdf) {
    const scale = state.mode === 'accurate' ? 3.0 : 2.0;
    return pdfToInputs(entry.file, scale);
  }
  // Plain image — convert to canvas only when accurate (need it for rotate + binarize)
  if (state.mode === 'accurate') {
    const canvas = await fileToCanvas(entry.file);
    return [{ kind: 'image', src: canvas, label: '', needsAccuratePrep: true }];
  }
  // Fast: hand the File directly to Tesseract
  return [{ kind: 'image', src: entry.file, label: '', needsAccuratePrep: false }];
}

// --- Recognize all queued files ---
async function recognizeAll() {
  if (state.busy || state.files.length === 0) return;
  if (state.activeLangs.length === 0) {
    showToast(t('toastNoLang'), 'error');
    return;
  }
  state.cancelRequested = false;
  setBusy(true);

  const cancelled = () => state.cancelRequested;

  try {
    const worker = await ensureWorker();
    if (cancelled()) throw new CancelledError();

    const allText = [];
    let totalConfidence = 0;
    let confidenceCount = 0;
    let totalWords = 0;
    const totalFiles = state.files.length;

    for (let i = 0; i < state.files.length; i++) {
      if (cancelled()) throw new CancelledError();
      const entry = state.files[i];
      const baseLabel = `${entry.name} (${i + 1}/${totalFiles})`;
      $('progressFile').textContent = baseLabel;

      let inputs;
      try {
        inputs = await buildInputs(entry);
      } catch (err) {
        if (err?.userFacing) {
          showToast(`${entry.name}: ${err.message}`, 'error');
          continue; // skip this file but keep going
        }
        throw err;
      }

      const fileTextParts = [];
      for (let p = 0; p < inputs.length; p++) {
        if (cancelled()) throw new CancelledError();
        const input = inputs[p];
        $('progressFile').textContent = inputs.length > 1
          ? `${baseLabel} — ${input.label}`
          : baseLabel;

        let pageText = '';
        if (input.kind === 'text') {
          pageText = input.text;
          totalConfidence += 100;
          confidenceCount++;
          totalWords += pageText.split(/\s+/).filter(Boolean).length;
        } else {
          // Accurate mode: auto-rotate (OSD) then Otsu binarize
          let src = input.src;
          if (state.mode === 'accurate' && input.needsAccuratePrep) {
            if (src instanceof HTMLCanvasElement) {
              showProgress(t('detectingOrientation') + '...', $('progressFill').value || 5, $('progressFile').textContent);
              src = await autoRotateCanvas(worker, src);
              if (cancelled()) throw new CancelledError();
              src = preprocessCanvas(src);
            }
          }

          const { data } = await recognizeWithRetry(worker, src);
          if (data.confidence != null) {
            totalConfidence += data.confidence;
            confidenceCount++;
          }
          if (data.words?.length) totalWords += data.words.length;
          pageText = (data.text || '').trim();
        }

        const pageHeader = inputs.length > 1 ? `--- ${input.label} ---\n` : '';
        fileTextParts.push(pageHeader + pageText);
      }

      const fileHeader = totalFiles > 1 ? `=== ${entry.name} ===\n` : '';
      allText.push(fileHeader + fileTextParts.join('\n\n'));
    }

    const finalText = allText.join('\n\n').trim();
    const avgConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    const wordsCount = totalWords || finalText.split(/\s+/).filter(Boolean).length;

    showOutput(finalText, avgConfidence, wordsCount);
    showToast(t('toastDone'));
  } catch (err) {
    if (err instanceof CancelledError) {
      // Worker is in unknown state after a partial recognize — drop it
      try { await state.worker?.terminate(); } catch {}
      state.worker = null;
      state.workerKey = '';
      resetOutput();
      showToast(t('toastCancelled'));
    } else if (err?.userFacing) {
      resetOutput();
      showToast(err.message, 'error');
    } else {
      console.error('OCR error', err);
      resetOutput();
      showToast(`${t('toastError')}: ${err.message || ''}`.trim(), 'error');
    }
  } finally {
    state.cancelRequested = false;
    setBusy(false);
  }
}

class CancelledError extends Error {
  constructor() { super('cancelled'); this.name = 'CancelledError'; }
}

// Single-retry wrapper around worker.recognize — recovers from transient WASM hiccups
async function recognizeWithRetry(worker, src) {
  try {
    return await worker.recognize(src);
  } catch (err) {
    // Retry once after a brief pause; second failure surfaces to caller
    await new Promise(r => setTimeout(r, 250));
    return await worker.recognize(src);
  }
}

// --- Output actions ---
function initOutputActions() {
  $('copyBtn').addEventListener('click', async () => {
    const text = $('textOutput').value;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast(t('toastCopied'));
    } catch {
      // Fallback
      $('textOutput').select();
      document.execCommand('copy');
      showToast(t('toastCopied'));
    }
  });

  $('downloadTxtBtn').addEventListener('click', () => {
    const text = $('textOutput').value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `ocr-${timestamp()}.txt`);
  });

  $('downloadDocxBtn').addEventListener('click', () => {
    // .docx export coming in next iteration
    showToast(t('toastDocxSoon'));
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// --- Recognize button ---
function initRecognize() {
  $('recognizeBtn').addEventListener('click', recognizeAll);
  $('mobileRecognizeBtn').addEventListener('click', recognizeAll);
  $('divider').addEventListener('click', () => {
    if (state.busy || state.files.length === 0 || state.activeLangs.length === 0) return;
    recognizeAll();
  });
  $('cancelBtn')?.addEventListener('click', () => {
    if (!state.busy) return;
    state.cancelRequested = true;
    $('cancelBtn').disabled = true; // prevent double-click during teardown
  });
}

// --- Boot ---
function boot() {
  applyI18n();
  initTheme();
  initAboutModal();
  initInputs();
  initLangPicker();
  initModePicker();
  initOutputActions();
  initRecognize();
  renderFileList();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
