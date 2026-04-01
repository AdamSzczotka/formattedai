// ============================================
// FormattedAI — PDF Tool Logic
// Merge, Split, Compress, Image-to-PDF
// 100% client-side using pdf-lib, pdfjs-dist, fflate
// ============================================

(function () {
  'use strict';

  // ==================
  // i18n Translations
  // ==================
  var translations = {
    pl: {
      pageTitle: 'Narzędzia PDF — Łącz, dziel, kompresuj PDF online | FormattedAI',
      subtitle: 'Łącz, dziel, kompresuj i konwertuj pliki PDF',
      badgePrivacy: '100% w przeglądarce — Twoje pliki nigdy nie opuszczają urządzenia',
      privacyNote: 'Pliki przetwarzane lokalnie. Zero uploadu na serwer.',
      tabMerge: 'Połącz',
      tabSplit: 'Podziel',
      tabCompress: 'Kompresuj',
      tabImg2Pdf: 'IMG → PDF',
      dropMerge: 'Przeciągnij pliki PDF do połączenia',
      dropTextMerge: 'Przeciągnij pliki PDF do połączenia',
      dropSplit: 'Przeciągnij plik PDF do podziału',
      dropCompress: 'Przeciągnij plik PDF do kompresji',
      dropImg2Pdf: 'Przeciągnij obrazki do konwersji',
      browseFiles: 'Przeglądaj pliki',
      addMore: 'Dodaj więcej plików',
      fileCount: 'Pliki:',
      removeFile: 'Usuń',
      clearAll: 'Wyczyść',
      // Merge
      mergeBtnText: 'Połącz pliki PDF',
      mergeResult: 'Połączony PDF',
      // Split
      splitBtnText: 'Podziel PDF',
      splitSelectAll: 'Zaznacz wszystko',
      splitDeselectAll: 'Odznacz wszystko',
      splitSeparateLabel: 'Pobierz każdą stronę osobno (ZIP)',
      splitPageOf: 'z',
      splitNoPagesSelected: 'Zaznacz przynajmniej jedną stronę',
      splitResult: 'Podzielony PDF',
      splitResultZip: 'Podzielone strony (ZIP)',
      pageLabel: 'Strona',
      // Compress
      compressBtnText: 'Kompresuj PDF',
      compressPresetLight: 'Lekka',
      compressPresetBalanced: 'Zbalansowana',
      compressPresetMaximum: 'Maksymalna',
      compressQualityLabel: 'Jakość obrazków',
      compressStripMeta: 'Usuń metadane',
      compressResult: 'Skompresowany PDF',
      compressBefore: 'Przed:',
      compressAfter: 'Po:',
      compressSavings: 'Oszczędność:',
      compressNoImages: 'Ten PDF nie zawiera obrazków do kompresji. Zastosowano optymalizację struktury.',
      // Image to PDF
      img2PdfBtnText: 'Utwórz PDF',
      img2PdfResult: 'Utworzony PDF',
      // Progress
      processing: 'Przetwarzanie...',
      processingFile: 'Przetwarzanie pliku',
      processingPage: 'Przetwarzanie strony',
      // Results
      download: 'Pobierz',
      resultReady: 'Wynik gotowy',
      originalSize: 'Oryginał:',
      resultSize: 'Wynik:',
      // Errors
      errorGeneric: 'Wystąpił błąd podczas przetwarzania',
      errorCorruptPdf: 'Nie można otworzyć pliku PDF. Plik może być uszkodzony lub zaszyfrowany.',
      errorFileTooLarge: 'Plik za duży (max 100 MB)',
      errorTooManyFiles: 'Za dużo plików (max 20)',
      advancedUnlockFiles: 'Osiągnięto limit 20 plików. Odblokować limit? Duża liczba plików może spowolnić przeglądarkę.',
      advancedUnlockSize: 'Plik przekracza 100 MB. Kontynuować? Duże pliki mogą spowolnić przeglądarkę.',
      advancedUnlockPages: 'PDF ma więcej niż 200 stron. Załadować wszystkie? Może to chwilę potrwać.',
      errorInvalidType: 'Nieobsługiwany format pliku',
      errorNoFiles: 'Dodaj pliki aby kontynuować',
      errorEncryptedPdf: 'PDF jest zaszyfrowany. Odblokuj go przed przetwarzaniem.',
      // Toast
      toastSuccess: 'Gotowe!',
      toastError: 'Błąd przetwarzania',
      toastCopied: 'Skopiowano!',
      // Theme / Nav
      madeBy: 'Stworzone przez',
      footerBadge: '100% client-side',
      navArticles: 'Artykuły',
      navAbout: 'O nas',
      navPrivacy: 'Prywatność',
      navContact: 'Kontakt',
      // About modal
      modalTitle: 'Narzędzia PDF',
      modalDesc: '<strong>Narzędzia PDF</strong> pozwalają łączyć, dzielić, kompresować i konwertować pliki PDF bezpośrednio w przeglądarce — Twoje pliki nigdy nie opuszczają urządzenia.',
      modalHowTitle: 'Jak używać',
      modalStep1: 'Wybierz zakładkę z operacją, którą chcesz wykonać',
      modalStep2: 'Przeciągnij pliki lub kliknij aby wybrać',
      modalStep3: 'Skonfiguruj opcje i kliknij przycisk akcji',
      modalStep4: 'Pobierz wynik',
      modalFeaturesTitle: 'Kluczowe funkcje',
      modalFeat1: 'Łączenie wielu PDF w jeden',
      modalFeat2: 'Dzielenie PDF — wybierz strony do wyodrębnienia',
      modalFeat3: 'Kompresja PDF z presetami jakości',
      modalFeat4: 'Konwersja obrazków (JPG, PNG, WebP, AVIF) na PDF',
      modalFeat5: '100% client-side — Twoje pliki nigdy nie opuszczają urządzenia',
      // HTML data-i18n aliases (used in markup)
      actionMerge: 'Połącz PDF',
      actionSplit: 'Podziel PDF',
      actionCompress: 'Kompresuj PDF',
      actionImg2Pdf: 'Utwórz PDF',
      clear: 'Wyczyść',
      filesProcessed: 'Plików:',
      sizeBefore: 'Przed:',
      sizeAfter: 'Po:',
      savings: 'Oszczędność:',
      processAnother: 'Przetwórz kolejny',
      selectAll: 'Zaznacz wszystko',
      deselectAll: 'Odznacz wszystko',
      presetLight: 'Lekka',
      presetBalanced: 'Zbalansowana',
      presetMaximum: 'Maksymalna',
      stripMetadata: 'Usuń metadane',
      advanced: 'Zaawansowane',
      quality: 'Jakość',
      splitSeparate: 'Pobierz każdą stronę osobno (ZIP)',
      splitReorderHint: 'Przeciągnij strony aby zmienić kolejność',
      mergePageMode: 'Tryb stron',
      mergeFileMode: 'Tryb plików',
      mergePageModeHint: 'Przeciągnij strony aby zmienić kolejność',
      fullscreenOpen: 'Pełny ekran',
      fullscreenClose: 'Zamknij',
      fullscreenTitle: 'Kolejność stron',
      fullscreenHint: 'Przeciągnij strony aby zmienić kolejność. Kliknij ✕ aby usunąć stronę.',
      toastDone: 'Gotowe!',
      inputTitle: 'Pliki',
      outputTitle: 'Wynik',
      emptyResult: 'Tu pojawi się przetworzony PDF',
      emptyHint: 'Dodaj pliki po lewej stronie',
      // SEO
      seoH1: 'Darmowe narzędzia PDF online — Łącz, dziel, kompresuj PDF w przeglądarce',
      seoDesc: 'Łącz, dziel, kompresuj i konwertuj pliki PDF bezpośrednio w przeglądarce. Wszystko działa client-side — Twoje pliki nigdy nie opuszczają urządzenia. Bez rejestracji, bez limitów, za darmo.',
    },
    en: {
      pageTitle: 'PDF Tools — Merge, Split, Compress PDF Online | FormattedAI',
      subtitle: 'Merge, split, compress and convert PDF files',
      badgePrivacy: '100% in-browser — your files never leave your device',
      privacyNote: 'Files processed locally. Zero upload to any server.',
      tabMerge: 'Merge',
      tabSplit: 'Split',
      tabCompress: 'Compress',
      tabImg2Pdf: 'IMG → PDF',
      dropMerge: 'Drag & drop PDF files to merge',
      dropTextMerge: 'Drag & drop PDF files to merge',
      dropSplit: 'Drag & drop a PDF file to split',
      dropCompress: 'Drag & drop a PDF file to compress',
      dropImg2Pdf: 'Drag & drop images to convert',
      browseFiles: 'Browse files',
      addMore: 'Add more files',
      fileCount: 'Files:',
      removeFile: 'Remove',
      clearAll: 'Clear',
      mergeBtnText: 'Merge PDF files',
      mergeResult: 'Merged PDF',
      splitBtnText: 'Split PDF',
      splitSelectAll: 'Select all',
      splitDeselectAll: 'Deselect all',
      splitSeparateLabel: 'Download each page separately (ZIP)',
      splitPageOf: 'of',
      splitNoPagesSelected: 'Select at least one page',
      splitResult: 'Split PDF',
      splitResultZip: 'Split pages (ZIP)',
      pageLabel: 'Page',
      compressBtnText: 'Compress PDF',
      compressPresetLight: 'Light',
      compressPresetBalanced: 'Balanced',
      compressPresetMaximum: 'Maximum',
      compressQualityLabel: 'Image quality',
      compressStripMeta: 'Strip metadata',
      compressResult: 'Compressed PDF',
      compressBefore: 'Before:',
      compressAfter: 'After:',
      compressSavings: 'Savings:',
      compressNoImages: 'This PDF contains no images to compress. Structure optimization applied.',
      img2PdfBtnText: 'Create PDF',
      img2PdfResult: 'Created PDF',
      processing: 'Processing...',
      processingFile: 'Processing file',
      processingPage: 'Processing page',
      download: 'Download',
      resultReady: 'Result ready',
      originalSize: 'Original:',
      resultSize: 'Result:',
      errorGeneric: 'An error occurred during processing',
      errorCorruptPdf: 'Cannot open PDF file. The file may be corrupted or encrypted.',
      errorFileTooLarge: 'File too large (max 100 MB)',
      errorTooManyFiles: 'Too many files (max 20)',
      advancedUnlockFiles: 'Reached 20 file limit. Unlock limit? Large number of files may slow down your browser.',
      advancedUnlockSize: 'File exceeds 100 MB. Continue? Large files may slow down your browser.',
      advancedUnlockPages: 'PDF has more than 200 pages. Load all? This may take a moment.',
      errorInvalidType: 'Unsupported file format',
      errorNoFiles: 'Add files to continue',
      errorEncryptedPdf: 'PDF is encrypted. Unlock it before processing.',
      toastSuccess: 'Done!',
      toastError: 'Processing error',
      toastCopied: 'Copied!',
      madeBy: 'Created by',
      footerBadge: '100% client-side',
      navArticles: 'Articles',
      navAbout: 'About',
      navPrivacy: 'Privacy',
      navContact: 'Contact',
      modalTitle: 'PDF Tools',
      modalDesc: '<strong>PDF Tools</strong> let you merge, split, compress and convert PDF files directly in your browser — your files never leave your device.',
      modalHowTitle: 'How to use',
      modalStep1: 'Select the tab with the operation you want',
      modalStep2: 'Drag files or click to browse',
      modalStep3: 'Configure options and click the action button',
      modalStep4: 'Download the result',
      modalFeaturesTitle: 'Key features',
      modalFeat1: 'Merge multiple PDFs into one',
      modalFeat2: 'Split PDF — select pages to extract',
      modalFeat3: 'Compress PDF with quality presets',
      modalFeat4: 'Convert images (JPG, PNG, WebP, AVIF) to PDF',
      modalFeat5: '100% client-side — your files never leave your device',
      // HTML data-i18n aliases (used in markup)
      actionMerge: 'Merge PDF',
      actionSplit: 'Split PDF',
      actionCompress: 'Compress PDF',
      actionImg2Pdf: 'Create PDF',
      clear: 'Clear',
      filesProcessed: 'Files:',
      sizeBefore: 'Before:',
      sizeAfter: 'After:',
      savings: 'Savings:',
      processAnother: 'Process another',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      presetLight: 'Light',
      presetBalanced: 'Balanced',
      presetMaximum: 'Maximum',
      stripMetadata: 'Strip metadata',
      advanced: 'Advanced',
      quality: 'Quality',
      splitSeparate: 'Download each page separately (ZIP)',
      splitReorderHint: 'Drag pages to reorder',
      mergePageMode: 'Page mode',
      mergeFileMode: 'File mode',
      mergePageModeHint: 'Drag pages to reorder',
      fullscreenOpen: 'Fullscreen',
      fullscreenClose: 'Close',
      fullscreenTitle: 'Page order',
      fullscreenHint: 'Drag pages to reorder. Click ✕ to remove a page.',
      toastDone: 'Done!',
      inputTitle: 'Files',
      outputTitle: 'Result',
      emptyResult: 'Processed PDF will appear here',
      emptyHint: 'Add files on the left',
      seoH1: 'Free Online PDF Tools — Merge, Split, Compress PDF in Browser',
      seoDesc: 'Merge, split, compress and convert PDF files directly in your browser. Everything runs client-side — your files never leave your device. No registration, no limits, free.',
    },
  };

  // ==================
  // Constants
  // ==================
  var MAX_FILES = 20;
  var MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
  var MAX_SPLIT_PAGES = 200;
  var ACCEPTED_PDF = ['application/pdf'];
  var ACCEPTED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  var THUMBNAIL_HEIGHT = 150;
  var TAB_IDS = ['merge', 'split', 'compress', 'img2pdf'];

  // ==================
  // State
  // ==================
  var state = {
    activeTab: 'merge',
    files: [],           // { id, name, size, type, data: Uint8Array }
    splitPages: [],      // { pageNum, selected, thumbnailRendered }
    splitTotalPages: 0,
    processing: false,
    compressPreset: 'balanced',
    compressQuality: 65,
    stripMetadata: true,
    splitSeparate: false,
    result: null,        // { data: Uint8Array, filename, mime, originalSize, resultSize }
    fileIdCounter: 0,
    lastShiftIndex: -1,  // for shift+click range select in split
    mergePageMode: false, // false = file order, true = page order
    mergePages: [],       // { fileIndex, pageNum, thumbnailRendered }
    advancedMode: { files: false, size: false, pages: false },
  };

  // ==================
  // pdfjs-dist loader
  // ==================
  var pdfjsLib = null;
  var pdfjsLoadPromise = null;

  function loadPdfjs() {
    // Check if already loaded (by the HTML module script setting window.pdfjsLib)
    if (pdfjsLib) return Promise.resolve(pdfjsLib);
    if (window.pdfjsLib) {
      pdfjsLib = window.pdfjsLib;
      return Promise.resolve(pdfjsLib);
    }
    if (pdfjsLoadPromise) return pdfjsLoadPromise;

    // Wait for the 'pdfjs-ready' event dispatched by the HTML module script
    pdfjsLoadPromise = new Promise(function (resolve, reject) {
      // If it was set between our check and now
      if (window.pdfjsLib) {
        pdfjsLib = window.pdfjsLib;
        resolve(pdfjsLib);
        return;
      }

      var timeout = setTimeout(function () {
        // Fallback: try dynamic import
        import('../assets/vendor/pdf.min.mjs').then(function (mod) {
          pdfjsLib = mod;
          pdfjsLib.GlobalWorkerOptions.workerSrc = '../assets/vendor/pdf.worker.min.mjs';
          resolve(pdfjsLib);
        }).catch(function () {
          return import('/assets/vendor/pdf.min.mjs').then(function (mod) {
            pdfjsLib = mod;
            pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/vendor/pdf.worker.min.mjs';
            resolve(pdfjsLib);
          });
        }).catch(reject);
      }, 5000);

      window.addEventListener('pdfjs-ready', function () {
        clearTimeout(timeout);
        if (window.pdfjsLib) {
          pdfjsLib = window.pdfjsLib;
          resolve(pdfjsLib);
        }
      });
    });

    return pdfjsLoadPromise;
  }

  // ==================
  // Language & Theme
  // ==================
  var currentLang = document.documentElement.lang || 'pl';

  function t(key) {
    return (translations[currentLang] && translations[currentLang][key]) ||
           translations.pl[key] || key;
  }

  function applyLanguage() {
    document.documentElement.lang = currentLang;
    document.title = t('pageTitle');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val.indexOf('<') !== -1) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    });

    localStorage.setItem('formattedai-lang', currentLang);
    updateDropZoneText();
  }

  var currentTheme = localStorage.getItem('formattedai-theme') || 'light';

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
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.remove('theme-switching');
      });
    });
  }

  // ==================
  // DOM Refs
  // ==================
  var dom = {};

  function cacheDom() {
    dom.app = document.getElementById('app');
    dom.themeToggle = document.getElementById('themeToggle');
    dom.toast = document.getElementById('toast');

    // Tab bar
    dom.tabBtns = document.querySelectorAll('.pdf-tabs__item');

    // Drop zone
    dom.dropZone = document.getElementById('dropZone');
    dom.dropZoneText = document.getElementById('dropZoneText');
    dom.dropZoneInput = document.getElementById('fileInput');
    dom.browseBtn = document.getElementById('browseBtn');

    // File list
    dom.fileListArea = document.getElementById('fileListArea');
    dom.fileList = document.getElementById('fileList');
    dom.fileCountLabel = document.getElementById('fileCount');
    dom.addMoreBtn = document.getElementById('addMoreBtn');
    dom.addMoreInput = document.getElementById('addMoreInput');
    dom.addMoreZone = document.getElementById('addMoreZone');
    dom.clearBtn = document.getElementById('clearBtn');

    // Split-specific
    dom.splitPageGrid = document.getElementById('splitPageGrid');
    dom.splitSelectAll = document.getElementById('selectAllBtn');
    dom.splitDeselectAll = document.getElementById('deselectAllBtn');
    dom.splitSeparateToggle = document.getElementById('splitSeparate');
    dom.splitControls = document.getElementById('splitOptions');

    // Compress-specific
    dom.compressControls = document.getElementById('compressOptions');
    dom.compressPresetBtns = document.querySelectorAll('.options-panel__preset');
    dom.compressQualitySlider = document.getElementById('qualitySlider');
    dom.compressQualityValue = document.getElementById('qualityValue');
    dom.compressStripMeta = document.getElementById('stripMetadata');

    // Action button (divider icon)
    dom.actionBtn = document.getElementById('actionBtn');
    dom.divider = document.getElementById('divider');
    dom.outputEmpty = document.getElementById('outputEmpty');

    // Progress
    dom.progressArea = document.getElementById('progressBar');
    dom.progressFill = document.getElementById('progressFill');
    dom.progressPercent = document.getElementById('progressPercent');
    dom.progressText = document.getElementById('progressText');

    // Result
    dom.resultArea = document.getElementById('resultArea');
    dom.resultFilename = document.getElementById('resultFilename');
    dom.resultOriginalSize = document.getElementById('statBefore');
    dom.resultNewSize = document.getElementById('statAfter');
    dom.resultSavings = document.getElementById('statSavings');
    dom.resultSavingsRow = document.getElementById('resultSavingsRow');
    dom.resultDownloadBtn = document.getElementById('downloadBtn');
    dom.resetBtn = document.getElementById('resetBtn');

    // About modal
    dom.aboutTrigger = document.getElementById('aboutTrigger');
    dom.aboutModal = document.getElementById('aboutModal');
    dom.aboutModalClose = document.getElementById('aboutModalClose');
  }

  // ==================
  // Utility functions
  // ==================
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function generateId() {
    state.fileIdCounter++;
    return state.fileIdCounter;
  }

  function getBaseName(filename) {
    return filename.replace(/\.[^.]+$/, '');
  }

  function showToast(message) {
    if (!dom.toast) return;
    var textEl = dom.toast.querySelector('.toast__text');
    if (textEl) textEl.textContent = message;
    dom.toast.classList.add('show');
    setTimeout(function () { dom.toast.classList.remove('show'); }, 2500);
  }

  function downloadBlob(data, filename, mime) {
    var blob = new Blob([data], { type: mime || 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  // ==================
  // Tab switching
  // ==================
  function switchTab(tabId) {
    if (TAB_IDS.indexOf(tabId) === -1) tabId = 'merge';
    state.activeTab = tabId;

    // Reset merge page mode when switching tabs
    state.mergePageMode = false;
    state.mergePages = [];
    mergePdfDocs = [];
    if (fullscreenOverlay && !fullscreenOverlay.hidden) closeFullscreenPageView();

    // Clear state when switching
    clearFiles();
    hideResult();
    hideProgress();

    // Update tab buttons
    dom.tabBtns.forEach(function (btn) {
      btn.classList.toggle('pdf-tabs__item--active', btn.dataset.tab === tabId);
      btn.setAttribute('aria-selected', btn.dataset.tab === tabId ? 'true' : 'false');
    });

    // Update drop zone accept attribute and text
    updateDropZoneAccept();
    updateDropZoneText();
    updateActionBtnText();

    // Show/hide tab-specific controls
    if (dom.splitControls) dom.splitControls.hidden = tabId !== 'split';
    if (dom.compressControls) dom.compressControls.hidden = tabId !== 'compress';

    // Update URL hash
    history.replaceState(null, '', '#' + tabId);
  }

  function updateDropZoneAccept() {
    var accept = state.activeTab === 'img2pdf' ? '.jpg,.jpeg,.png,.webp,.avif' : '.pdf';
    if (dom.dropZoneInput) dom.dropZoneInput.setAttribute('accept', accept);
    if (dom.addMoreInput) dom.addMoreInput.setAttribute('accept', accept);

    // Update formats hint text
    var formatsEl = document.getElementById('dropZoneFormats');
    if (formatsEl) formatsEl.textContent = state.activeTab === 'img2pdf' ? '.jpg .png .webp .avif' : '.pdf';

    // Multi vs single
    var isMulti = state.activeTab === 'merge' || state.activeTab === 'img2pdf';
    if (dom.dropZoneInput) {
      if (isMulti) dom.dropZoneInput.setAttribute('multiple', '');
      else dom.dropZoneInput.removeAttribute('multiple');
    }
    if (dom.addMoreInput) {
      if (isMulti) dom.addMoreInput.setAttribute('multiple', '');
      else dom.addMoreInput.removeAttribute('multiple');
    }
  }

  function updateDropZoneText() {
    if (!dom.dropZoneText) return;
    var textMap = {
      'merge': 'dropMerge',
      'split': 'dropSplit',
      'compress': 'dropCompress',
      'img2pdf': 'dropImg2Pdf',
    };
    dom.dropZoneText.textContent = t(textMap[state.activeTab] || 'dropMerge');
  }

  function updateActionBtnText() {
    // Divider icon has no text label — tooltip only
    if (dom.divider) {
      var titleMap = {
        'merge': 'mergeBtnText',
        'split': 'splitBtnText',
        'compress': 'compressBtnText',
        'img2pdf': 'img2PdfBtnText',
      };
      dom.divider.title = t(titleMap[state.activeTab] || 'mergeBtnText');
      dom.divider.setAttribute('aria-label', dom.divider.title);
    }
  }

  // ==================
  // File handling
  // ==================
  function getAcceptedTypes() {
    return state.activeTab === 'img2pdf' ? ACCEPTED_IMAGES : ACCEPTED_PDF;
  }

  function isMultiFileTab() {
    return state.activeTab === 'merge' || state.activeTab === 'img2pdf';
  }

  function handleFileInput(fileListInput) {
    var files = Array.from(fileListInput);
    var accepted = getAcceptedTypes();
    var isMulti = isMultiFileTab();

    // Single-file tabs: replace existing file
    if (!isMulti && files.length > 0) {
      files = [files[0]];
      clearFiles();
    }

    for (var i = 0; i < files.length; i++) {
      var file = files[i];

      if (!state.advancedMode.files && state.files.length >= MAX_FILES) {
        if (confirm(t('advancedUnlockFiles'))) {
          state.advancedMode.files = true;
        } else {
          break;
        }
      }

      // Validate type
      if (accepted.indexOf(file.type) === -1) {
        // Fallback: check extension for PDFs without correct MIME
        var ext = file.name.toLowerCase().split('.').pop();
        if (state.activeTab !== 'img2pdf' && ext === 'pdf') {
          // allow
        } else if (state.activeTab === 'img2pdf' && ['jpg', 'jpeg', 'png', 'webp', 'avif'].indexOf(ext) !== -1) {
          // allow
        } else {
          showToast(t('errorInvalidType'));
          continue;
        }
      }

      if (file.size > MAX_FILE_SIZE) {
        if (!state.advancedMode.size) {
          if (confirm(t('advancedUnlockSize'))) {
            state.advancedMode.size = true;
          } else {
            continue;
          }
        }
      }

      (function (f) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var data = new Uint8Array(e.target.result);
          state.files.push({
            id: generateId(),
            name: f.name,
            size: f.size,
            type: f.type,
            data: data,
          });
          renderFileList();
          updateUI();

          // For split/compress: auto-load preview
          if (state.activeTab === 'split' && state.files.length === 1) {
            loadSplitPreview(data);
          }

          // For merge page mode: reload page preview when files change
          if (state.activeTab === 'merge' && state.mergePageMode) {
            loadMergePagePreview();
          }
        };
        reader.readAsArrayBuffer(f);
      })(file);
    }
  }

  function removeFile(id) {
    state.files = state.files.filter(function (f) { return f.id !== id; });
    if (state.activeTab === 'split') {
      state.splitPages = [];
      state.splitTotalPages = 0;
      if (dom.splitPageGrid) dom.splitPageGrid.innerHTML = '';
    }
    if (state.activeTab === 'merge' && state.mergePageMode) {
      if (state.files.length > 0) {
        loadMergePagePreview();
      } else {
        state.mergePages = [];
        mergePdfDocs = [];
        if (dom.splitPageGrid) dom.splitPageGrid.innerHTML = '';
      }
    }
    renderFileList();
    updateUI();
  }

  function clearFiles() {
    state.files = [];
    state.splitPages = [];
    state.splitTotalPages = 0;
    state.lastShiftIndex = -1;
    state.mergePages = [];
    if (dom.splitPageGrid) dom.splitPageGrid.innerHTML = '';
    renderFileList();
    updateMergePageModeUI();
    updateUI();
  }

  // ==================
  // File list rendering
  // ==================
  var dragSrcIndex = null;

  function renderFileList() {
    if (!dom.fileList) return;

    var hasFiles = state.files.length > 0;
    if (dom.fileListArea) dom.fileListArea.hidden = !hasFiles;
    if (dom.dropZone) dom.dropZone.hidden = hasFiles;
    if (dom.fileCountLabel) {
      dom.fileCountLabel.textContent = state.advancedMode.files
        ? state.files.length + ' / ∞'
        : state.files.length + ' / ' + MAX_FILES;
    }

    // Only show "Add more" for multi-file tabs
    if (dom.addMoreBtn) dom.addMoreBtn.hidden = !isMultiFileTab();

    dom.fileList.innerHTML = '';

    state.files.forEach(function (file, index) {
      var item = document.createElement('div');
      item.className = 'pdf-files__item';
      item.dataset.index = index;

      // Draggable for reorder (merge, img-to-pdf)
      if (isMultiFileTab()) {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', onFileDragStart);
        item.addEventListener('dragover', onFileDragOver);
        item.addEventListener('dragenter', onFileDragEnter);
        item.addEventListener('dragleave', onFileDragLeave);
        item.addEventListener('drop', onFileDrop);
        item.addEventListener('dragend', onFileDragEnd);
      }

      // Thumbnail area
      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'pdf-files__thumb';

      if (state.activeTab === 'img2pdf') {
        // Image thumbnail — use object URL
        var img = document.createElement('img');
        var blob = new Blob([file.data], { type: file.type });
        img.src = URL.createObjectURL(blob);
        img.alt = file.name;
        img.loading = 'lazy';
        img.onload = function () { URL.revokeObjectURL(this.src); };
        thumbDiv.appendChild(img);
      } else {
        // PDF thumbnail — render first page
        renderPdfThumbnail(file.data, 0, thumbDiv);
      }

      // Info
      var infoDiv = document.createElement('div');
      infoDiv.className = 'pdf-files__info';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'pdf-files__name';
      nameSpan.title = file.name;
      nameSpan.textContent = file.name;

      var sizeSpan = document.createElement('span');
      sizeSpan.className = 'pdf-files__meta';
      sizeSpan.textContent = formatSize(file.size);

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(sizeSpan);

      // Drag handle for multi-file
      var handleSpan = null;
      if (isMultiFileTab()) {
        handleSpan = document.createElement('span');
        handleSpan.className = 'pdf-files__handle';
        handleSpan.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="4" cy="2" r="1" fill="currentColor"/><circle cx="8" cy="2" r="1" fill="currentColor"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="10" r="1" fill="currentColor"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg>';
        handleSpan.title = 'Drag to reorder';
      }

      // Remove button
      var removeBtn = document.createElement('button');
      removeBtn.className = 'pdf-files__remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', t('removeFile'));
      removeBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
      removeBtn.addEventListener('click', (function (fid) {
        return function () { removeFile(fid); };
      })(file.id));

      item.appendChild(thumbDiv);
      if (handleSpan) item.appendChild(handleSpan);
      item.appendChild(infoDiv);
      item.appendChild(removeBtn);

      dom.fileList.appendChild(item);
    });
  }

  // ==================
  // Drag & Drop reorder (file list)
  // ==================
  function onFileDragStart(e) {
    dragSrcIndex = parseInt(this.dataset.index, 10);
    this.classList.add('pdf-files__item--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragSrcIndex);
  }

  function onFileDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onFileDragEnter(e) {
    e.preventDefault();
    this.classList.add('pdf-files__item--drag-over');
  }

  function onFileDragLeave() {
    this.classList.remove('pdf-files__item--drag-over');
  }

  function onFileDrop(e) {
    e.preventDefault();
    this.classList.remove('pdf-files__item--drag-over');

    var destIndex = parseInt(this.dataset.index, 10);
    if (dragSrcIndex === null || dragSrcIndex === destIndex) return;

    // Reorder files array
    var moved = state.files.splice(dragSrcIndex, 1)[0];
    state.files.splice(destIndex, 0, moved);
    dragSrcIndex = null;

    renderFileList();
  }

  function onFileDragEnd() {
    this.classList.remove('pdf-files__item--dragging');
    dragSrcIndex = null;
    // Remove any lingering dragover classes
    dom.fileList.querySelectorAll('.pdf-files__item--drag-over').forEach(function (el) {
      el.classList.remove('pdf-files__item--drag-over');
    });
  }

  // ==================
  // Drop zone (file upload)
  // ==================
  function setupDropZone() {
    if (!dom.dropZone) return;

    var dragCounter = 0;

    dom.dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    dom.dropZone.addEventListener('dragenter', function (e) {
      e.preventDefault();
      dragCounter++;
      dom.dropZone.classList.add('pdf-drop--hover');
    });

    dom.dropZone.addEventListener('dragleave', function () {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        dom.dropZone.classList.remove('pdf-drop--hover');
      }
    });

    dom.dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dragCounter = 0;
      dom.dropZone.classList.remove('pdf-drop--hover');
      if (e.dataTransfer.files.length > 0) {
        handleFileInput(e.dataTransfer.files);
      }
    });

    // Also handle drops on file list area (for adding more)
    if (dom.fileListArea) {
      dom.fileListArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      dom.fileListArea.addEventListener('drop', function (e) {
        e.preventDefault();
        if (e.dataTransfer.files.length > 0) {
          handleFileInput(e.dataTransfer.files);
        }
      });
    }
  }

  // ==================
  // Thumbnail rendering (pdfjs-dist)
  // ==================
  function renderPdfThumbnail(pdfData, pageNum, container) {
    loadPdfjs().then(function (lib) {
      var loadingTask = lib.getDocument({ data: pdfData.slice() });
      loadingTask.promise.then(function (pdfDoc) {
        pdfDoc.getPage(pageNum + 1).then(function (page) {
          var viewport = page.getViewport({ scale: 1 });
          var scale = THUMBNAIL_HEIGHT / viewport.height;
          var scaledViewport = page.getViewport({ scale: scale });

          var canvas = document.createElement('canvas');
          canvas.width = Math.floor(scaledViewport.width);
          canvas.height = Math.floor(scaledViewport.height);
          var ctx = canvas.getContext('2d');

          page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
            container.innerHTML = '';
            container.appendChild(canvas);
          });
        });
      }).catch(function () {
        // Failed to render thumbnail — show placeholder
        container.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
      });
    });
  }

  // ==================
  // Split: Page preview grid
  // ==================
  function loadSplitPreview(pdfData) {
    if (!dom.splitPageGrid) return;
    dom.splitPageGrid.innerHTML = '';
    state.splitPages = [];
    state.splitTotalPages = 0;

    loadPdfjs().then(function (lib) {
      var loadingTask = lib.getDocument({ data: pdfData.slice() });
      loadingTask.promise.then(function (pdfDoc) {
        var numPages = pdfDoc.numPages;
        if (numPages > MAX_SPLIT_PAGES && !state.advancedMode.pages) {
          if (confirm(t('advancedUnlockPages'))) {
            state.advancedMode.pages = true;
          } else {
            numPages = MAX_SPLIT_PAGES;
          }
        }
        state.splitTotalPages = pdfDoc.numPages;

        for (var i = 0; i < numPages; i++) {
          state.splitPages.push({
            pageNum: i,
            selected: true,
            thumbnailRendered: false,
          });
        }

        renderSplitGrid(pdfDoc);
      }).catch(function () {
        showToast(t('errorCorruptPdf'));
      });
    });
  }

  // Track the pdfDoc reference for split so we can re-render after reorder
  var splitPdfDocRef = null;

  function renderSplitGrid(pdfDoc) {
    if (!dom.splitPageGrid) return;
    dom.splitPageGrid.innerHTML = '';
    splitPdfDocRef = pdfDoc;

    state.splitPages.forEach(function (pageInfo, idx) {
      var card = document.createElement('div');
      card.className = 'pdf-pages__item' + (pageInfo.selected ? ' pdf-pages__item--selected' : '');
      card.dataset.index = idx;
      card.setAttribute('role', 'checkbox');
      card.setAttribute('aria-checked', pageInfo.selected ? 'true' : 'false');
      card.tabIndex = 0;

      // Draggable for reorder
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', onSplitPageDragStart);
      card.addEventListener('dragover', onSplitPageDragOver);
      card.addEventListener('dragenter', onSplitPageDragEnter);
      card.addEventListener('dragleave', onSplitPageDragLeave);
      card.addEventListener('drop', onSplitPageDrop);
      card.addEventListener('dragend', onSplitPageDragEnd);

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'pdf-pages__thumb';

      var label = document.createElement('span');
      label.className = 'pdf-pages__number';
      label.textContent = t('pageLabel') + ' ' + (pageInfo.pageNum + 1);

      var checkbox = document.createElement('div');
      checkbox.className = 'pdf-pages__check';
      checkbox.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      card.appendChild(thumbDiv);
      card.appendChild(label);
      card.appendChild(checkbox);

      // Click handler with shift support
      card.addEventListener('click', function (e) {
        onSplitPageClick(idx, e);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSplitPageClick(idx, e);
        }
      });

      dom.splitPageGrid.appendChild(card);

      // Lazy render thumbnails with IntersectionObserver
      if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !pageInfo.thumbnailRendered) {
              pageInfo.thumbnailRendered = true;
              renderSplitThumbnail(pdfDoc, pageInfo.pageNum, thumbDiv);
              obs.unobserve(entry.target);
            }
          });
        }, { rootMargin: '200px' });
        observer.observe(card);
      } else {
        // Fallback: render immediately
        renderSplitThumbnail(pdfDoc, pageInfo.pageNum, thumbDiv);
        pageInfo.thumbnailRendered = true;
      }
    });
  }

  // ==================
  // Split: Drag & Drop page reorder
  // ==================
  var splitDragSrcIndex = null;

  function onSplitPageDragStart(e) {
    splitDragSrcIndex = parseInt(this.dataset.index, 10);
    this.classList.add('pdf-pages__item--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(splitDragSrcIndex));
  }

  function onSplitPageDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onSplitPageDragEnter(e) {
    e.preventDefault();
    this.classList.add('pdf-pages__item--drag-over');
  }

  function onSplitPageDragLeave() {
    this.classList.remove('pdf-pages__item--drag-over');
  }

  function onSplitPageDrop(e) {
    e.preventDefault();
    this.classList.remove('pdf-pages__item--drag-over');

    var destIndex = parseInt(this.dataset.index, 10);
    if (splitDragSrcIndex === null || splitDragSrcIndex === destIndex) return;

    // Reorder splitPages array
    var moved = state.splitPages.splice(splitDragSrcIndex, 1)[0];
    state.splitPages.splice(destIndex, 0, moved);
    splitDragSrcIndex = null;

    // Reset thumbnail flags — old canvases are destroyed by innerHTML = ''
    state.splitPages.forEach(function (p) { p.thumbnailRendered = false; });

    // Re-render grid
    if (splitPdfDocRef) {
      renderSplitGrid(splitPdfDocRef);
    }
  }

  function onSplitPageDragEnd() {
    this.classList.remove('pdf-pages__item--dragging');
    splitDragSrcIndex = null;
    if (dom.splitPageGrid) {
      dom.splitPageGrid.querySelectorAll('.pdf-pages__item--drag-over').forEach(function (el) {
        el.classList.remove('pdf-pages__item--drag-over');
      });
    }
  }

  function renderSplitThumbnail(pdfDoc, pageNum, container) {
    pdfDoc.getPage(pageNum + 1).then(function (page) {
      var viewport = page.getViewport({ scale: 1 });
      var scale = THUMBNAIL_HEIGHT / viewport.height;
      var scaledViewport = page.getViewport({ scale: scale });

      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(scaledViewport.width);
      canvas.height = Math.floor(scaledViewport.height);
      var ctx = canvas.getContext('2d');

      page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
        container.innerHTML = '';
        container.appendChild(canvas);
      });
    });
  }

  function onSplitPageClick(idx, e) {
    if (e && e.shiftKey && state.lastShiftIndex >= 0) {
      // Range select
      var start = Math.min(state.lastShiftIndex, idx);
      var end = Math.max(state.lastShiftIndex, idx);
      var newState = !state.splitPages[idx].selected;
      for (var i = start; i <= end; i++) {
        state.splitPages[i].selected = newState;
      }
    } else {
      state.splitPages[idx].selected = !state.splitPages[idx].selected;
    }
    state.lastShiftIndex = idx;
    updateSplitGridUI();
  }

  function selectAllSplitPages(selected) {
    state.splitPages.forEach(function (p) { p.selected = selected; });
    updateSplitGridUI();
  }

  function updateSplitGridUI() {
    if (!dom.splitPageGrid) return;
    var cards = dom.splitPageGrid.querySelectorAll('.pdf-pages__item');
    cards.forEach(function (card, idx) {
      if (idx < state.splitPages.length) {
        var isSelected = state.splitPages[idx].selected;
        card.classList.toggle('pdf-pages__item--selected', isSelected);
        card.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      }
    });
  }

  // ==================
  // Merge: Page-level reorder mode
  // ==================
  var mergePdfDocs = []; // cached pdfjs document refs per file

  function toggleMergePageMode() {
    state.mergePageMode = !state.mergePageMode;
    updateMergePageModeUI();
    if (state.mergePageMode && state.files.length > 0) {
      loadMergePagePreview();
    } else {
      state.mergePages = [];
      mergePdfDocs = [];
      if (dom.splitPageGrid) dom.splitPageGrid.innerHTML = '';
    }
    updateUI();
  }

  function updateMergePageModeUI() {
    var toggleBtn = document.getElementById('mergePageModeToggle');
    if (!toggleBtn) return;
    if (state.mergePageMode) {
      toggleBtn.textContent = t('mergeFileMode');
      toggleBtn.title = t('mergePageModeHint');
    } else {
      toggleBtn.textContent = t('mergePageMode');
      toggleBtn.title = '';
    }
  }

  function loadMergePagePreview() {
    if (!dom.splitPageGrid) return;
    dom.splitPageGrid.innerHTML = '';
    state.mergePages = [];
    mergePdfDocs = [];

    loadPdfjs().then(function (lib) {
      var loadPromises = [];
      for (var fi = 0; fi < state.files.length; fi++) {
        (function (fileIndex) {
          var p = lib.getDocument({ data: state.files[fileIndex].data.slice() }).promise.then(function (pdfDoc) {
            return { fileIndex: fileIndex, pdfDoc: pdfDoc };
          });
          loadPromises.push(p);
        })(fi);
      }

      Promise.all(loadPromises).then(function (results) {
        // Sort by fileIndex to maintain file order
        results.sort(function (a, b) { return a.fileIndex - b.fileIndex; });

        mergePdfDocs = [];
        for (var r = 0; r < results.length; r++) {
          mergePdfDocs[results[r].fileIndex] = results[r].pdfDoc;
          var numPages = state.advancedMode.pages ? results[r].pdfDoc.numPages : Math.min(results[r].pdfDoc.numPages, MAX_SPLIT_PAGES);
          for (var p = 0; p < numPages; p++) {
            state.mergePages.push({
              fileIndex: results[r].fileIndex,
              pageNum: p,
              thumbnailRendered: false,
            });
          }
        }

        renderMergePageGrid();
      }).catch(function () {
        showToast(t('errorCorruptPdf'));
      });
    });
  }

  function renderMergePageGrid() {
    if (!dom.splitPageGrid) return;
    dom.splitPageGrid.innerHTML = '';

    state.mergePages.forEach(function (pageInfo, idx) {
      var card = document.createElement('div');
      card.className = 'pdf-pages__item pdf-pages__item--selected';
      card.dataset.index = idx;
      card.tabIndex = 0;

      // Draggable for reorder
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', onMergePageDragStart);
      card.addEventListener('dragover', onMergePageDragOver);
      card.addEventListener('dragenter', onMergePageDragEnter);
      card.addEventListener('dragleave', onMergePageDragLeave);
      card.addEventListener('drop', onMergePageDrop);
      card.addEventListener('dragend', onMergePageDragEnd);

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'pdf-pages__thumb';

      var label = document.createElement('span');
      label.className = 'pdf-pages__number';
      var fileName = state.files[pageInfo.fileIndex] ? state.files[pageInfo.fileIndex].name : '';
      label.textContent = fileName + ' — ' + t('pageLabel') + ' ' + (pageInfo.pageNum + 1);
      label.title = label.textContent;

      card.appendChild(thumbDiv);
      card.appendChild(label);

      dom.splitPageGrid.appendChild(card);

      // Lazy render thumbnails
      var pdfDoc = mergePdfDocs[pageInfo.fileIndex];
      if (pdfDoc) {
        if ('IntersectionObserver' in window) {
          (function (pi, td, doc) {
            var observer = new IntersectionObserver(function (entries, obs) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting && !pi.thumbnailRendered) {
                  pi.thumbnailRendered = true;
                  renderSplitThumbnail(doc, pi.pageNum, td);
                  obs.unobserve(entry.target);
                }
              });
            }, { rootMargin: '200px' });
            observer.observe(card);
          })(pageInfo, thumbDiv, pdfDoc);
        } else {
          renderSplitThumbnail(pdfDoc, pageInfo.pageNum, thumbDiv);
          pageInfo.thumbnailRendered = true;
        }
      }
    });
  }

  // ==================
  // Merge page mode: Drag & Drop reorder
  // ==================
  var mergePageDragSrcIndex = null;

  function onMergePageDragStart(e) {
    mergePageDragSrcIndex = parseInt(this.dataset.index, 10);
    this.classList.add('pdf-pages__item--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(mergePageDragSrcIndex));
  }

  function onMergePageDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onMergePageDragEnter(e) {
    e.preventDefault();
    this.classList.add('pdf-pages__item--drag-over');
  }

  function onMergePageDragLeave() {
    this.classList.remove('pdf-pages__item--drag-over');
  }

  function onMergePageDrop(e) {
    e.preventDefault();
    this.classList.remove('pdf-pages__item--drag-over');

    var destIndex = parseInt(this.dataset.index, 10);
    if (mergePageDragSrcIndex === null || mergePageDragSrcIndex === destIndex) return;

    var moved = state.mergePages.splice(mergePageDragSrcIndex, 1)[0];
    state.mergePages.splice(destIndex, 0, moved);
    mergePageDragSrcIndex = null;

    // Reset thumbnail flags — old canvases are destroyed by innerHTML = ''
    state.mergePages.forEach(function (p) { p.thumbnailRendered = false; });

    renderMergePageGrid();
  }

  function onMergePageDragEnd() {
    this.classList.remove('pdf-pages__item--dragging');
    mergePageDragSrcIndex = null;
    if (dom.splitPageGrid) {
      dom.splitPageGrid.querySelectorAll('.pdf-pages__item--drag-over').forEach(function (el) {
        el.classList.remove('pdf-pages__item--drag-over');
      });
    }
  }

  // ==================
  // Fullscreen page reorder overlay
  // ==================
  var fullscreenOverlay = null;
  var fullscreenGrid = null;
  var fullscreenDragSrcIndex = null;

  function openFullscreenPageView() {
    if (state.mergePages.length === 0) return;
    createFullscreenOverlay();
    renderFullscreenGrid();
    fullscreenOverlay.hidden = false;
    requestAnimationFrame(function () {
      fullscreenOverlay.classList.add('show');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeFullscreenPageView() {
    if (!fullscreenOverlay) return;
    fullscreenOverlay.classList.remove('show');
    setTimeout(function () {
      fullscreenOverlay.hidden = true;
      document.body.style.overflow = '';
    }, 200);
    // Sync back to inline grid
    renderMergePageGrid();
  }

  function createFullscreenOverlay() {
    if (fullscreenOverlay) return;

    fullscreenOverlay = document.createElement('div');
    fullscreenOverlay.className = 'fs-pages-overlay';
    fullscreenOverlay.id = 'fullscreenPagesOverlay';
    fullscreenOverlay.hidden = true;

    var container = document.createElement('div');
    container.className = 'fs-pages';

    // Header
    var header = document.createElement('div');
    header.className = 'fs-pages__header';

    var titleWrap = document.createElement('div');
    titleWrap.className = 'fs-pages__title-wrap';

    var title = document.createElement('h2');
    title.className = 'fs-pages__title';
    title.textContent = t('fullscreenTitle');

    var hint = document.createElement('p');
    hint.className = 'fs-pages__hint';
    hint.textContent = t('fullscreenHint');

    var count = document.createElement('span');
    count.className = 'fs-pages__count';
    count.id = 'fsPageCount';

    titleWrap.appendChild(title);
    titleWrap.appendChild(hint);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'fs-pages__close';
    closeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    closeBtn.title = t('fullscreenClose');
    closeBtn.addEventListener('click', closeFullscreenPageView);

    header.appendChild(titleWrap);
    header.appendChild(count);
    header.appendChild(closeBtn);

    // Grid
    fullscreenGrid = document.createElement('div');
    fullscreenGrid.className = 'fs-pages__grid';

    container.appendChild(header);
    container.appendChild(fullscreenGrid);
    fullscreenOverlay.appendChild(container);

    // Close on overlay click
    fullscreenOverlay.addEventListener('click', function (e) {
      if (e.target === fullscreenOverlay) closeFullscreenPageView();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && fullscreenOverlay && !fullscreenOverlay.hidden) {
        closeFullscreenPageView();
      }
    });

    document.body.appendChild(fullscreenOverlay);
  }

  function renderFullscreenGrid() {
    if (!fullscreenGrid) return;
    fullscreenGrid.innerHTML = '';

    var countEl = document.getElementById('fsPageCount');
    if (countEl) countEl.textContent = state.mergePages.length + ' ' + (currentLang === 'pl' ? 'stron' : 'pages');

    state.mergePages.forEach(function (pageInfo, idx) {
      var card = document.createElement('div');
      card.className = 'fs-pages__item';
      card.dataset.index = idx;
      card.setAttribute('draggable', 'true');

      // Drag events
      card.addEventListener('dragstart', onFsDragStart);
      card.addEventListener('dragover', onFsDragOver);
      card.addEventListener('dragenter', onFsDragEnter);
      card.addEventListener('dragleave', onFsDragLeave);
      card.addEventListener('drop', onFsDrop);
      card.addEventListener('dragend', onFsDragEnd);

      // Card wrapper (contains thumb + badge + remove)
      var cardInner = document.createElement('div');
      cardInner.className = 'fs-pages__card';

      var thumbDiv = document.createElement('div');
      thumbDiv.className = 'fs-pages__thumb';

      var badge = document.createElement('span');
      badge.className = 'fs-pages__badge';
      badge.textContent = (idx + 1);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'fs-pages__remove';
      removeBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
      removeBtn.title = t('removeFile');
      (function (i) {
        removeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          state.mergePages.splice(i, 1);
          renderFullscreenGrid();
        });
      })(idx);

      cardInner.appendChild(thumbDiv);
      cardInner.appendChild(badge);
      cardInner.appendChild(removeBtn);

      // Label (outside card, always visible below)
      var label = document.createElement('span');
      label.className = 'fs-pages__label';
      var fileName = state.files[pageInfo.fileIndex] ? state.files[pageInfo.fileIndex].name : '';
      var shortName = fileName.length > 25 ? fileName.substring(0, 22) + '...' : fileName;
      label.textContent = shortName + ' — ' + t('pageLabel') + ' ' + (pageInfo.pageNum + 1);
      label.title = fileName + ' — ' + t('pageLabel') + ' ' + (pageInfo.pageNum + 1);

      card.appendChild(cardInner);
      card.appendChild(label);
      fullscreenGrid.appendChild(card);

      // Render thumbnail
      var pdfDoc = mergePdfDocs[pageInfo.fileIndex];
      if (pdfDoc) {
        (function (pi, td, doc) {
          var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                renderFsThumbnail(doc, pi.pageNum, td);
                obs.unobserve(entry.target);
              }
            });
          }, { root: fullscreenGrid, rootMargin: '300px' });
          observer.observe(card);
        })(pageInfo, thumbDiv, pdfDoc);
      }
    });
  }

  function renderFsThumbnail(pdfDoc, pageNum, container) {
    pdfDoc.getPage(pageNum + 1).then(function (page) {
      var viewport = page.getViewport({ scale: 1 });
      var scale = 220 / viewport.height;
      var scaledViewport = page.getViewport({ scale: scale });

      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(scaledViewport.width);
      canvas.height = Math.floor(scaledViewport.height);
      var ctx = canvas.getContext('2d');

      page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
        container.innerHTML = '';
        container.appendChild(canvas);
      });
    });
  }

  // Fullscreen drag & drop
  function onFsDragStart(e) {
    fullscreenDragSrcIndex = parseInt(this.dataset.index, 10);
    this.classList.add('fs-pages__item--dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(fullscreenDragSrcIndex));
  }

  function onFsDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function onFsDragEnter(e) {
    e.preventDefault();
    this.classList.add('fs-pages__item--drag-over');
  }

  function onFsDragLeave() {
    this.classList.remove('fs-pages__item--drag-over');
  }

  function onFsDrop(e) {
    e.preventDefault();
    this.classList.remove('fs-pages__item--drag-over');
    var destIndex = parseInt(this.dataset.index, 10);
    if (fullscreenDragSrcIndex === null || fullscreenDragSrcIndex === destIndex) return;

    var moved = state.mergePages.splice(fullscreenDragSrcIndex, 1)[0];
    state.mergePages.splice(destIndex, 0, moved);
    fullscreenDragSrcIndex = null;

    renderFullscreenGrid();
  }

  function onFsDragEnd() {
    this.classList.remove('fs-pages__item--dragging');
    fullscreenDragSrcIndex = null;
    if (fullscreenGrid) {
      fullscreenGrid.querySelectorAll('.fs-pages__item--drag-over').forEach(function (el) {
        el.classList.remove('fs-pages__item--drag-over');
      });
    }
  }

  // ==================
  // Progress UI
  // ==================
  function showProgress(percent, text) {
    if (dom.outputEmpty) dom.outputEmpty.hidden = true;
    if (dom.progressArea) dom.progressArea.hidden = false;
    if (dom.progressFill) dom.progressFill.value = percent;
    if (dom.progressPercent) dom.progressPercent.textContent = Math.round(percent) + '%';
    if (dom.progressText) dom.progressText.textContent = text || t('processing');
    // Loading state on divider
    if (dom.divider) dom.divider.classList.add('divider--loading');
  }

  function hideProgress() {
    if (dom.progressArea) dom.progressArea.hidden = true;
    if (dom.divider) dom.divider.classList.remove('divider--loading');
  }

  // ==================
  // Result UI
  // ==================
  function showResult(data, filename, mime, originalSize) {
    state.result = {
      data: data,
      filename: filename,
      mime: mime || 'application/pdf',
      originalSize: originalSize || 0,
      resultSize: data.byteLength || data.length,
    };

    if (dom.resultArea) dom.resultArea.hidden = false;
    if (dom.outputEmpty) dom.outputEmpty.hidden = true;
    if (dom.resultFilename) dom.resultFilename.textContent = filename;
    if (dom.resultNewSize) dom.resultNewSize.textContent = formatSize(state.result.resultSize);

    if (originalSize && dom.resultOriginalSize) {
      dom.resultOriginalSize.textContent = formatSize(originalSize);
      var savings = originalSize > 0
        ? Math.round((1 - state.result.resultSize / originalSize) * 100)
        : 0;
      if (dom.resultSavings) dom.resultSavings.textContent = (savings >= 0 ? '-' : '+') + Math.abs(savings) + '%';
      if (dom.resultSavingsRow) dom.resultSavingsRow.hidden = false;
    } else {
      if (dom.resultSavingsRow) dom.resultSavingsRow.hidden = true;
    }
  }

  function hideResult() {
    if (dom.resultArea) dom.resultArea.hidden = true;
    if (dom.outputEmpty) dom.outputEmpty.hidden = false;
    state.result = null;
  }

  function downloadResult() {
    if (!state.result) return;
    downloadBlob(state.result.data, state.result.filename, state.result.mime);
    showToast(t('toastSuccess'));
  }

  // ==================
  // UI state update
  // ==================
  function updateUI() {
    var hasFiles = state.files.length > 0;

    // Show/hide options panel
    var optionsPanel = document.getElementById('optionsPanel');
    if (optionsPanel) optionsPanel.hidden = !hasFiles;

    // Show/hide tab-specific controls
    var showSplitControls = (state.activeTab === 'split' && hasFiles) ||
                            (state.activeTab === 'merge' && state.mergePageMode && hasFiles);
    if (dom.splitControls) dom.splitControls.hidden = !showSplitControls;
    if (dom.compressControls) dom.compressControls.hidden = state.activeTab !== 'compress' || !hasFiles;

    // Hide split-only UI elements when in merge page mode
    if (dom.splitControls && state.activeTab === 'merge' && state.mergePageMode) {
      var selectAllBtn = document.getElementById('selectAllBtn');
      var deselectAllBtn = document.getElementById('deselectAllBtn');
      var splitSeparateCb = document.getElementById('splitSeparate');
      if (selectAllBtn) selectAllBtn.hidden = true;
      if (deselectAllBtn) deselectAllBtn.hidden = true;
      if (splitSeparateCb && splitSeparateCb.parentElement) splitSeparateCb.parentElement.hidden = true;
    } else if (dom.splitControls && state.activeTab === 'split') {
      var selectAllBtn2 = document.getElementById('selectAllBtn');
      var deselectAllBtn2 = document.getElementById('deselectAllBtn');
      var splitSeparateCb2 = document.getElementById('splitSeparate');
      if (selectAllBtn2) selectAllBtn2.hidden = false;
      if (deselectAllBtn2) deselectAllBtn2.hidden = false;
      if (splitSeparateCb2 && splitSeparateCb2.parentElement) splitSeparateCb2.parentElement.hidden = false;
    }

    // Divider disabled state
    if (dom.divider) {
      dom.divider.classList.toggle('divider--disabled', !hasFiles || state.processing);
    }

    // Drop zone visibility
    if (dom.dropZone) dom.dropZone.hidden = hasFiles;

    // Output empty state
    if (dom.outputEmpty && dom.resultArea) {
      dom.outputEmpty.hidden = !dom.resultArea.hidden ? true : false;
    }

    // Merge page mode toggle visibility
    ensureMergePageModeToggle();
    var mergeWrap = document.getElementById('mergePageModeWrap');
    if (mergeWrap) {
      mergeWrap.hidden = !(state.activeTab === 'merge' && hasFiles);
    }
    var fsBtn = document.getElementById('mergeFullscreenBtn');
    if (fsBtn) {
      fsBtn.hidden = !(state.mergePageMode && hasFiles);
    }

    // Show split page grid container when in merge page mode
    if (dom.splitPageGrid) {
      if (state.activeTab === 'merge' && state.mergePageMode && hasFiles) {
        dom.splitPageGrid.style.display = '';
      } else if (state.activeTab === 'split' && hasFiles) {
        dom.splitPageGrid.style.display = '';
      } else if (state.activeTab !== 'split') {
        dom.splitPageGrid.style.display = 'none';
      }
    }
  }

  function ensureMergePageModeToggle() {
    if (document.getElementById('mergePageModeToggle')) return;
    var optionsPanel = document.getElementById('optionsPanel');
    if (!optionsPanel) return;

    // Wrapper for both buttons
    var wrap = document.createElement('div');
    wrap.className = 'options-panel__merge-actions';
    wrap.id = 'mergePageModeWrap';
    wrap.hidden = true;

    var toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.id = 'mergePageModeToggle';
    toggleBtn.className = 'options-panel__preset';
    toggleBtn.setAttribute('data-i18n', 'mergePageMode');
    toggleBtn.textContent = t('mergePageMode');
    toggleBtn.addEventListener('click', function () {
      toggleMergePageMode();
    });

    var fsBtn = document.createElement('button');
    fsBtn.type = 'button';
    fsBtn.id = 'mergeFullscreenBtn';
    fsBtn.className = 'options-panel__preset';
    fsBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg> ' + t('fullscreenOpen');
    fsBtn.hidden = true;
    fsBtn.addEventListener('click', function () {
      openFullscreenPageView();
    });

    wrap.appendChild(toggleBtn);
    wrap.appendChild(fsBtn);
    optionsPanel.insertBefore(wrap, optionsPanel.firstChild);
  }

  // ==================
  // MERGE
  // ==================
  async function mergePDFs() {
    if (state.files.length < 1) {
      showToast(t('errorNoFiles'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      showProgress(0, t('processing'));
      var merged = await PDFLib.PDFDocument.create();

      if (state.mergePageMode && state.mergePages.length > 0) {
        // Page-level merge: copy individual pages in user-defined order
        var donorCache = {}; // fileIndex -> PDFDocument
        var totalPages = state.mergePages.length;

        for (var p = 0; p < totalPages; p++) {
          var mp = state.mergePages[p];
          showProgress(
            ((p + 1) / totalPages) * 90,
            t('processingPage') + ' ' + (p + 1) + '/' + totalPages
          );

          if (!donorCache[mp.fileIndex]) {
            try {
              donorCache[mp.fileIndex] = await PDFLib.PDFDocument.load(state.files[mp.fileIndex].data, {
                ignoreEncryption: true,
              });
            } catch (err) {
              console.error('Failed to load PDF:', state.files[mp.fileIndex].name, err);
              showToast(t('errorCorruptPdf'));
              state.processing = false;
              hideProgress();
              updateUI();
              return;
            }
          }

          var donor = donorCache[mp.fileIndex];
          var copiedPages = await merged.copyPages(donor, [mp.pageNum]);
          merged.addPage(copiedPages[0]);

          if (p % 5 === 0) await yieldToMain();
        }
      } else {
        // File-level merge: copy all pages from each file in order
        var totalFiles = state.files.length;

        for (var i = 0; i < totalFiles; i++) {
          showProgress(
            ((i + 1) / totalFiles) * 90,
            t('processingFile') + ' ' + (i + 1) + '/' + totalFiles + ' — ' + state.files[i].name
          );

          var donor2;
          try {
            donor2 = await PDFLib.PDFDocument.load(state.files[i].data, {
              ignoreEncryption: true,
            });
          } catch (err) {
            console.error('Failed to load PDF:', state.files[i].name, err);
            showToast(t('errorCorruptPdf'));
            state.processing = false;
            hideProgress();
            updateUI();
            return;
          }

          var copiedPages2 = await merged.copyPages(donor2, donor2.getPageIndices());
          copiedPages2.forEach(function (page) {
            merged.addPage(page);
          });

          await yieldToMain();
        }
      }

      showProgress(95, t('processing'));
      var mergedBytes = await merged.save();
      showProgress(100, t('processing'));

      var totalOriginalSize = state.files.reduce(function (sum, f) { return sum + f.size; }, 0);
      showResult(mergedBytes, 'merged.pdf', 'application/pdf', totalOriginalSize);
      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Merge error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
  }

  // ==================
  // SPLIT
  // ==================
  async function splitPDF() {
    if (state.files.length === 0) {
      showToast(t('errorNoFiles'));
      return;
    }

    var selectedPages = state.splitPages
      .filter(function (p) { return p.selected; })
      .map(function (p) { return p.pageNum; });

    if (selectedPages.length === 0) {
      showToast(t('splitNoPagesSelected'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      showProgress(0, t('processing'));

      var src;
      try {
        src = await PDFLib.PDFDocument.load(state.files[0].data, {
          ignoreEncryption: true,
        });
      } catch (err) {
        console.error('Failed to load PDF for split:', err);
        showToast(t('errorCorruptPdf'));
        state.processing = false;
        hideProgress();
        updateUI();
        return;
      }

      var baseName = getBaseName(state.files[0].name);

      if (state.splitSeparate) {
        // Create individual PDFs and ZIP them
        var zipFiles = {};
        for (var i = 0; i < selectedPages.length; i++) {
          showProgress(
            ((i + 1) / selectedPages.length) * 90,
            t('processingPage') + ' ' + (selectedPages[i] + 1) + ' ' + t('splitPageOf') + ' ' + state.splitTotalPages
          );

          var singleDoc = await PDFLib.PDFDocument.create();
          var copiedSinglePages = await singleDoc.copyPages(src, [selectedPages[i]]);
          singleDoc.addPage(copiedSinglePages[0]);
          var singleBytes = await singleDoc.save();
          zipFiles['page_' + (selectedPages[i] + 1) + '.pdf'] = new Uint8Array(singleBytes);

          await yieldToMain();
        }

        showProgress(95, t('processing'));
        var zipped = fflate.zipSync(zipFiles);
        showProgress(100, t('processing'));

        var zipFilename = baseName + '_split.zip';
        showResult(zipped, zipFilename, 'application/zip', state.files[0].size);
      } else {
        // Single PDF with selected pages
        showProgress(30, t('processing'));
        var newDoc = await PDFLib.PDFDocument.create();
        var copiedPages = await newDoc.copyPages(src, selectedPages);
        copiedPages.forEach(function (page) {
          newDoc.addPage(page);
        });

        showProgress(80, t('processing'));
        var newBytes = await newDoc.save();
        showProgress(100, t('processing'));

        var pageNums = selectedPages.map(function (p) { return p + 1; }).join('-');
        var splitFilename = baseName + '_pages_' + pageNums + '.pdf';
        // Keep filename manageable
        if (splitFilename.length > 100) {
          splitFilename = baseName + '_split_' + selectedPages.length + 'pages.pdf';
        }
        showResult(newBytes, splitFilename, 'application/pdf', state.files[0].size);
      }

      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Split error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
  }

  // ==================
  // COMPRESS
  // ==================
  async function compressPDF() {
    if (state.files.length === 0) {
      showToast(t('errorNoFiles'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      showProgress(0, t('processing'));

      var originalData = state.files[0].data;
      var originalSize = state.files[0].size;
      var quality = state.compressQuality / 100; // 0-1 for canvas JPEG quality

      // Strategy: try image recompression first, fall back to full-page render
      var compressedBytes = await compressWithImageExtraction(originalData, quality);

      showProgress(100, t('processing'));

      var baseName = getBaseName(state.files[0].name);
      showResult(compressedBytes, baseName + '_compressed.pdf', 'application/pdf', originalSize);
      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Compress error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
  }

  /**
   * Compress PDF by rendering each page to canvas and re-creating the document.
   * This approach always works (loses text selectability but maximizes compression).
   */
  async function compressViaFullPageRender(pdfData, jpegQuality) {
    var lib = await loadPdfjs();
    var loadingTask = lib.getDocument({ data: pdfData.slice() });
    var pdfDoc = await loadingTask.promise;
    var numPages = pdfDoc.numPages;

    var newDoc = await PDFLib.PDFDocument.create();

    for (var i = 1; i <= numPages; i++) {
      showProgress(
        (i / numPages) * 85,
        t('processingPage') + ' ' + i + ' ' + t('splitPageOf') + ' ' + numPages
      );

      var page = await pdfDoc.getPage(i);
      var viewport = page.getViewport({ scale: 1.5 }); // reasonable render quality

      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      var ctx = canvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      // Convert canvas to JPEG
      var jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
      var jpegBytes = dataUrlToUint8Array(jpegDataUrl);

      var img = await newDoc.embedJpg(jpegBytes);
      // Use original page dimensions (in PDF points)
      var origViewport = page.getViewport({ scale: 1 });
      var newPage = newDoc.addPage([origViewport.width, origViewport.height]);
      newPage.drawImage(img, {
        x: 0,
        y: 0,
        width: origViewport.width,
        height: origViewport.height,
      });

      await yieldToMain();
    }

    showProgress(90, t('processing'));
    var savedBytes = await newDoc.save({ useObjectStreams: true });
    return savedBytes;
  }

  /**
   * Compress PDF by extracting and recompressing embedded images.
   * Preserves text selectability. Falls back to full-page render if extraction fails.
   */
  async function compressWithImageExtraction(pdfData, jpegQuality) {
    try {
      var pdfDoc = await PDFLib.PDFDocument.load(pdfData, {
        ignoreEncryption: true,
      });

      var pages = pdfDoc.getPages();
      var totalPages = pages.length;
      var imagesFound = 0;
      var imagesProcessed = 0;

      // Iterate through all pages to find and recompress images
      for (var pageIdx = 0; pageIdx < totalPages; pageIdx++) {
        showProgress(
          ((pageIdx + 1) / totalPages) * 80,
          t('processingPage') + ' ' + (pageIdx + 1) + ' ' + t('splitPageOf') + ' ' + totalPages
        );

        var page = pages[pageIdx];
        var resources = page.node.get(PDFLib.PDFName.of('Resources'));
        if (!resources) continue;

        var xObjects;
        if (resources instanceof PDFLib.PDFDict) {
          xObjects = resources.get(PDFLib.PDFName.of('XObject'));
        } else {
          var resolved = pdfDoc.context.lookup(resources);
          if (resolved instanceof PDFLib.PDFDict) {
            xObjects = resolved.get(PDFLib.PDFName.of('XObject'));
          }
        }

        if (!xObjects) continue;

        var xObjDict;
        if (xObjects instanceof PDFLib.PDFDict) {
          xObjDict = xObjects;
        } else {
          xObjDict = pdfDoc.context.lookup(xObjects);
        }

        if (!(xObjDict instanceof PDFLib.PDFDict)) continue;

        var entries = xObjDict.entries();
        for (var e = 0; e < entries.length; e++) {
          var entry = entries[e];
          var ref = entry[1];
          var stream;

          if (ref instanceof PDFLib.PDFRef) {
            stream = pdfDoc.context.lookup(ref);
          } else {
            stream = ref;
          }

          if (!stream || !stream.dict) continue;

          var subtype = stream.dict.get(PDFLib.PDFName.of('Subtype'));
          if (!subtype || subtype.toString() !== '/Image') continue;

          imagesFound++;

          // Get image properties
          var width = stream.dict.get(PDFLib.PDFName.of('Width'));
          var height = stream.dict.get(PDFLib.PDFName.of('Height'));
          if (!width || !height) continue;

          var imgWidth = width instanceof PDFLib.PDFNumber ? width.asNumber() : parseInt(width.toString(), 10);
          var imgHeight = height instanceof PDFLib.PDFNumber ? height.asNumber() : parseInt(height.toString(), 10);

          if (isNaN(imgWidth) || isNaN(imgHeight) || imgWidth <= 0 || imgHeight <= 0) continue;

          // Try to decode the image data
          try {
            var rawData = stream.getContents ? stream.getContents() : null;
            if (!rawData || rawData.length === 0) continue;

            // Draw onto canvas and re-encode as JPEG
            var imgBlob = new Blob([rawData]);
            var bitmap;
            try {
              bitmap = await createImageBitmap(imgBlob);
            } catch (_) {
              // Can't decode this image format — skip
              continue;
            }

            var canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(bitmap, 0, 0);
            bitmap.close();

            var jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality);
            var jpegBytes = dataUrlToUint8Array(jpegDataUrl);

            // Replace image stream in the PDF
            var newStream = pdfDoc.context.stream(jpegBytes, {
              Width: PDFLib.PDFNumber.of(imgWidth),
              Height: PDFLib.PDFNumber.of(imgHeight),
              ColorSpace: PDFLib.PDFName.of('DeviceRGB'),
              BitsPerComponent: PDFLib.PDFNumber.of(8),
              Filter: PDFLib.PDFName.of('DCTDecode'),
              Subtype: PDFLib.PDFName.of('Image'),
              Type: PDFLib.PDFName.of('XObject'),
            });

            if (ref instanceof PDFLib.PDFRef) {
              pdfDoc.context.assign(ref, newStream);
            }

            imagesProcessed++;
          } catch (imgErr) {
            // Skip individual image errors
            console.warn('Could not recompress image:', imgErr);
          }
        }

        await yieldToMain();
      }

      // Strip metadata if enabled
      if (state.stripMetadata) {
        try {
          stripPdfMetadata(pdfDoc);
        } catch (metaErr) {
          console.warn('Could not strip metadata:', metaErr);
        }
      }

      showProgress(90, t('processing'));
      var savedBytes = await pdfDoc.save({ useObjectStreams: true });

      // If no images were found and recompressed, show info
      if (imagesFound === 0) {
        showToast(t('compressNoImages'));
      }

      // If image extraction approach didn't reduce size much, try full-page render
      if (savedBytes.length >= pdfData.length * 0.95 && imagesProcessed === 0) {
        // Fallback to full-page render for better compression
        showProgress(10, t('processing'));
        savedBytes = await compressViaFullPageRender(pdfData, jpegQuality);
      }

      return savedBytes;
    } catch (err) {
      console.warn('Image extraction failed, falling back to full-page render:', err);
      showProgress(10, t('processing'));
      return await compressViaFullPageRender(pdfData, jpegQuality);
    }
  }

  function stripPdfMetadata(pdfDoc) {
    // Remove standard metadata fields
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    // Try to remove XMP metadata
    try {
      var catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);
      if (catalog instanceof PDFLib.PDFDict) {
        catalog.delete(PDFLib.PDFName.of('Metadata'));
      }
    } catch (_) {
      // Ignore
    }
  }

  function dataUrlToUint8Array(dataUrl) {
    var base64 = dataUrl.split(',')[1];
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // ==================
  // IMAGE TO PDF
  // ==================
  async function imagesToPDF() {
    if (state.files.length === 0) {
      showToast(t('errorNoFiles'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      var totalFiles = state.files.length;
      showProgress(0, t('processing'));

      var doc = await PDFLib.PDFDocument.create();

      for (var i = 0; i < totalFiles; i++) {
        var file = state.files[i];
        showProgress(
          ((i + 1) / totalFiles) * 90,
          t('processingFile') + ' ' + (i + 1) + '/' + totalFiles + ' — ' + file.name
        );

        try {
          var imgData = file.data;
          var imgType = file.type || '';
          var ext = file.name.toLowerCase().split('.').pop();

          // Determine image type
          var isJpeg = imgType === 'image/jpeg' || ext === 'jpg' || ext === 'jpeg';
          var isPng = imgType === 'image/png' || ext === 'png';
          var isWebp = imgType === 'image/webp' || ext === 'webp';
          var isAvif = imgType === 'image/avif' || ext === 'avif';

          var embeddedImg;

          if (isJpeg) {
            embeddedImg = await doc.embedJpg(imgData);
          } else if (isPng) {
            embeddedImg = await doc.embedPng(imgData);
          } else if (isWebp || isAvif) {
            // Convert to PNG via canvas first (pdf-lib only supports JPG/PNG natively)
            var converted = await convertImageToJpegBytes(imgData, imgType);
            embeddedImg = await doc.embedJpg(converted);
          } else {
            // Try JPEG first, then PNG
            try {
              embeddedImg = await doc.embedJpg(imgData);
            } catch (_) {
              embeddedImg = await doc.embedPng(imgData);
            }
          }

          // Create page with image dimensions
          var imgWidth = embeddedImg.width;
          var imgHeight = embeddedImg.height;

          // Optionally fit to A4 if image is very large
          var pageWidth = imgWidth;
          var pageHeight = imgHeight;

          var page = doc.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight,
          });
        } catch (imgErr) {
          console.error('Failed to embed image:', file.name, imgErr);
          // Skip this image but continue with others
        }

        await yieldToMain();
      }

      showProgress(95, t('processing'));
      var pdfBytes = await doc.save();
      showProgress(100, t('processing'));

      var totalOriginalSize = state.files.reduce(function (sum, f) { return sum + f.size; }, 0);
      showResult(pdfBytes, 'images.pdf', 'application/pdf', totalOriginalSize);
      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Image to PDF error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
  }

  /**
   * Convert WebP/AVIF image bytes to JPEG bytes via canvas.
   */
  async function convertImageToJpegBytes(imageData, mimeType) {
    var blob = new Blob([imageData], { type: mimeType });
    var bitmap = await createImageBitmap(blob);

    var canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    var ctx = canvas.getContext('2d');

    // White background for JPEG (no transparency)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    var dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return dataUrlToUint8Array(dataUrl);
  }

  // ==================
  // Action dispatcher
  // ==================
  function executeAction() {
    if (state.processing) return;

    switch (state.activeTab) {
      case 'merge': mergePDFs(); break;
      case 'split': splitPDF(); break;
      case 'compress': compressPDF(); break;
      case 'img2pdf': imagesToPDF(); break;
    }
  }

  // ==================
  // Compress presets
  // ==================
  function setCompressPreset(preset) {
    state.compressPreset = preset;
    var qualityMap = { light: 85, balanced: 65, maximum: 40 };
    state.compressQuality = qualityMap[preset] || 65;

    if (dom.compressQualitySlider) dom.compressQualitySlider.value = state.compressQuality;
    if (dom.compressQualityValue) dom.compressQualityValue.textContent = state.compressQuality;

    if (dom.compressPresetBtns) {
      dom.compressPresetBtns.forEach(function (btn) {
        btn.classList.toggle('options-panel__preset--active', btn.dataset.preset === preset);
      });
    }
  }

  // ==================
  // Yield to main thread
  // ==================
  function yieldToMain() {
    return new Promise(function (resolve) {
      requestAnimationFrame(resolve);
    });
  }

  // ==================
  // About Modal
  // ==================
  function openAboutModal() {
    if (!dom.aboutModal) return;
    dom.aboutModal.hidden = false;
    requestAnimationFrame(function () { dom.aboutModal.classList.add('show'); });
  }

  function closeAboutModal() {
    if (!dom.aboutModal) return;
    dom.aboutModal.classList.remove('show');
    setTimeout(function () { dom.aboutModal.hidden = true; }, 200);
  }

  // ==================
  // Event listeners
  // ==================
  function bindEvents() {
    // Theme toggle
    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', toggleTheme);
    }

    // Tab buttons
    dom.tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.dataset.tab);
      });
    });

    // Browse button
    if (dom.browseBtn) {
      dom.browseBtn.addEventListener('click', function () {
        if (dom.dropZoneInput) dom.dropZoneInput.click();
      });
    }

    // File input
    if (dom.dropZoneInput) {
      dom.dropZoneInput.addEventListener('change', function () {
        if (dom.dropZoneInput.files.length > 0) {
          handleFileInput(dom.dropZoneInput.files);
          dom.dropZoneInput.value = '';
        }
      });
    }

    // Add more button + input
    // Add more: both button and the entire compact zone trigger file input
    if (dom.addMoreZone) {
      dom.addMoreZone.addEventListener('click', function () {
        if (dom.addMoreInput) dom.addMoreInput.click();
      });
    }
    if (dom.addMoreBtn) {
      dom.addMoreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (dom.addMoreInput) dom.addMoreInput.click();
      });
    }
    if (dom.addMoreInput) {
      dom.addMoreInput.addEventListener('change', function () {
        if (dom.addMoreInput.files.length > 0) {
          handleFileInput(dom.addMoreInput.files);
          dom.addMoreInput.value = '';
        }
      });
    }

    // Clear button
    if (dom.clearBtn) {
      dom.clearBtn.addEventListener('click', function () {
        clearFiles();
        hideResult();
      });
    }

    // Action: divider click triggers processing
    if (dom.divider) {
      dom.divider.addEventListener('click', function () {
        if (!dom.divider.classList.contains('divider--disabled')) {
          executeAction();
        }
      });
      dom.divider.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter' || e.key === ' ') && !dom.divider.classList.contains('divider--disabled')) {
          e.preventDefault();
          executeAction();
        }
      });
    }

    // Result download
    if (dom.resultDownloadBtn) {
      dom.resultDownloadBtn.addEventListener('click', downloadResult);
    }

    // Reset button — go back to initial state
    if (dom.resetBtn) {
      dom.resetBtn.addEventListener('click', function () {
        clearFiles();
        hideResult();
        hideProgress();
      });
    }

    // Split controls
    if (dom.splitSelectAll) {
      dom.splitSelectAll.addEventListener('click', function () {
        selectAllSplitPages(true);
      });
    }
    if (dom.splitDeselectAll) {
      dom.splitDeselectAll.addEventListener('click', function () {
        selectAllSplitPages(false);
      });
    }
    if (dom.splitSeparateToggle) {
      dom.splitSeparateToggle.addEventListener('change', function () {
        state.splitSeparate = dom.splitSeparateToggle.checked;
      });
    }

    // Compress controls
    if (dom.compressPresetBtns) {
      dom.compressPresetBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          setCompressPreset(btn.dataset.preset);
        });
      });
    }
    if (dom.compressQualitySlider) {
      dom.compressQualitySlider.addEventListener('input', function () {
        var val = parseInt(dom.compressQualitySlider.value, 10);
        state.compressQuality = val;
        if (dom.compressQualityValue) dom.compressQualityValue.textContent = val;

        // Deselect presets when manually adjusting
        if (dom.compressPresetBtns) {
          dom.compressPresetBtns.forEach(function (btn) {
            var presetVal = { light: 85, balanced: 65, maximum: 40 }[btn.dataset.preset];
            btn.classList.toggle('options-panel__preset--active', presetVal === val);
          });
        }
      });
    }
    if (dom.compressStripMeta) {
      dom.compressStripMeta.addEventListener('change', function () {
        state.stripMetadata = dom.compressStripMeta.checked;
      });
    }

    // About modal
    if (dom.aboutTrigger) {
      dom.aboutTrigger.addEventListener('click', openAboutModal);
    }
    if (dom.aboutModalClose) {
      dom.aboutModalClose.addEventListener('click', closeAboutModal);
    }
    if (dom.aboutModal) {
      dom.aboutModal.addEventListener('click', function (e) {
        if (e.target === dom.aboutModal) closeAboutModal();
      });
    }

    // Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (dom.aboutModal && !dom.aboutModal.hidden) closeAboutModal();
      }
    });

    // Drag & drop on the drop zone
    setupDropZone();
  }

  // ==================
  // Init
  // ==================
  function init() {
    cacheDom();
    applyTheme();

    // Detect lang from localStorage or html attribute
    var savedLang = localStorage.getItem('formattedai-lang');
    if (savedLang && (savedLang === 'pl' || savedLang === 'en')) {
      currentLang = savedLang;
    }
    applyLanguage();

    bindEvents();

    // Parse hash for initial tab
    var hash = window.location.hash.replace('#', '');
    if (TAB_IDS.indexOf(hash) !== -1) {
      switchTab(hash);
    } else {
      switchTab('merge');
    }

    // Pre-load pdfjs in background
    loadPdfjs().catch(function (err) {
      console.warn('pdfjs preload failed:', err);
    });

    // Listen for hash changes
    window.addEventListener('hashchange', function () {
      var newHash = window.location.hash.replace('#', '');
      if (TAB_IDS.indexOf(newHash) !== -1 && newHash !== state.activeTab) {
        switchTab(newHash);
      }
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
