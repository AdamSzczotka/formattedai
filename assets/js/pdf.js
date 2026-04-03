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
      // Crop
      tabCrop: 'Przytnij',
      dropCrop: 'Przeciągnij plik PDF do przycięcia',
      dropTextCrop: 'Przeciągnij plik PDF do przycięcia',
      cropBtnText: 'Przytnij PDF',
      cropResult: 'Przycięty PDF',
      cropApplyAll: 'Zastosuj do wszystkich stron',
      cropPageNav: 'Strona',
      cropReset: 'Resetuj zaznaczenie',
      cropHint: 'Zaznacz obszar do przycięcia przeciągając na podglądzie',
      // Forms
      tabForms: 'Formularze',
      dropForms: 'Przeciągnij plik PDF z formularzem',
      dropTextForms: 'Przeciągnij plik PDF z formularzem',
      formsBtnText: 'Zapisz formularz',
      formsResult: 'Wypełniony PDF',
      formsFlatten: 'Zablokuj pola po wypełnieniu (flatten)',
      formsNoFields: 'Ten PDF nie zawiera pól formularza.',
      formsFieldCount: 'Pola formularza:',
      // Annotate
      tabAnnotate: 'Adnotacje',
      dropAnnotate: 'Przeciągnij plik PDF do adnotacji',
      dropTextAnnotate: 'Przeciągnij plik PDF do adnotacji',
      annotateBtnText: 'Zapisz PDF',
      annotateResult: 'PDF z adnotacjami',
      annotateTool_cursor: 'Kursor',
      annotateTool_text: 'Tekst',
      annotateTool_pen: 'Pióro',
      annotateTool_highlight: 'Zakreślacz',
      annotateTool_rect: 'Prostokąt',
      annotateTool_circle: 'Okrąg',
      annotateTool_line: 'Linia',
      annotateTool_arrow: 'Strzałka',
      annotateTool_stamp: 'Stempel',
      annotateTool_signature: 'Podpis',
      annotateTool_image: 'Obrazek',
      annotateUndo: 'Cofnij',
      annotateRedo: 'Ponów',
      annotateColor: 'Kolor',
      annotateStroke: 'Grubość',
      annotateStampDraft: 'WERSJA ROBOCZA',
      annotateStampApproved: 'ZATWIERDZONY',
      annotateStampConfidential: 'POUFNE',
      annotateTextPrompt: 'Wpisz tekst:',
      annotateStampPrompt: 'Wybierz stempel:',
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
      // Crop
      tabCrop: 'Crop',
      dropCrop: 'Drag & drop a PDF file to crop',
      dropTextCrop: 'Drag & drop a PDF file to crop',
      cropBtnText: 'Crop PDF',
      cropResult: 'Cropped PDF',
      cropApplyAll: 'Apply to all pages',
      cropPageNav: 'Page',
      cropReset: 'Reset selection',
      cropHint: 'Draw the crop area by dragging on the preview',
      // Forms
      tabForms: 'Forms',
      dropForms: 'Drag & drop a PDF with form fields',
      dropTextForms: 'Drag & drop a PDF with form fields',
      formsBtnText: 'Save form',
      formsResult: 'Filled PDF',
      formsFlatten: 'Lock fields after filling (flatten)',
      formsNoFields: 'This PDF does not contain form fields.',
      formsFieldCount: 'Form fields:',
      // Annotate
      tabAnnotate: 'Annotate',
      dropAnnotate: 'Drag & drop a PDF to annotate',
      dropTextAnnotate: 'Drag & drop a PDF to annotate',
      annotateBtnText: 'Save PDF',
      annotateResult: 'Annotated PDF',
      annotateTool_cursor: 'Cursor',
      annotateTool_text: 'Text',
      annotateTool_pen: 'Pen',
      annotateTool_highlight: 'Highlight',
      annotateTool_rect: 'Rectangle',
      annotateTool_circle: 'Circle',
      annotateTool_line: 'Line',
      annotateTool_arrow: 'Arrow',
      annotateTool_stamp: 'Stamp',
      annotateTool_signature: 'Signature',
      annotateTool_image: 'Image',
      annotateUndo: 'Undo',
      annotateRedo: 'Redo',
      annotateColor: 'Color',
      annotateStroke: 'Width',
      annotateStampDraft: 'DRAFT',
      annotateStampApproved: 'APPROVED',
      annotateStampConfidential: 'CONFIDENTIAL',
      annotateTextPrompt: 'Enter text:',
      annotateStampPrompt: 'Choose stamp:',
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
  var TAB_IDS = ['merge', 'split', 'compress', 'img2pdf', 'crop', 'forms', 'annotate'];

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
    // Crop state
    cropCurrentPage: 0,
    cropTotalPages: 0,
    cropRect: null,       // { x, y, w, h } in PDF points (relative to page)
    cropApplyAll: true,
    // Forms state
    formsFlatten: false,
    formsFields: [],  // { name, type, widget, rect, pageIndex }
    formsCurrentPage: 0,
    formsTotalPages: 0,
    // Annotate state
    annotateCurrentPage: 0,
    annotateTotalPages: 0,
    annotateTool: 'cursor',
    annotateColor: '#ef4444',
    annotateStroke: 2,
    annotateAnnotations: {},  // { pageIndex: [ { type, points/rect/text, color, stroke, ... } ] }
    annotateUndoStack: [],
    annotateRedoStack: [],
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
      // If element has a child <span>, update only the span (preserve SVG icons)
      var span = el.querySelector(':scope > span');
      if (span) {
        span.textContent = val;
      } else if (val.indexOf('<') !== -1) {
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
    var prevTab = state.activeTab;
    state.activeTab = tabId;

    // Reset merge page mode
    state.mergePageMode = false;
    state.mergePages = [];
    mergePdfDocs = [];
    if (fullscreenOverlay && !fullscreenOverlay.hidden) closeFullscreenPageView();

    // Only clear files when switching between incompatible types (img2pdf <-> pdf tabs)
    var imgTabs = ['img2pdf'];
    var switchingFileType = (imgTabs.indexOf(prevTab) >= 0) !== (imgTabs.indexOf(tabId) >= 0);
    if (switchingFileType) {
      clearFiles();
    }

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
    var cropContainer = document.getElementById('cropContainer');
    if (cropContainer) cropContainer.hidden = tabId !== 'crop';
    var formsContainer = document.getElementById('formsContainer');
    if (formsContainer) formsContainer.hidden = tabId !== 'forms';
    var annotateContainer = document.getElementById('annotateContainer');
    if (annotateContainer) annotateContainer.hidden = tabId !== 'annotate';

    // Auto-load previews for new tab if files already present
    if (state.files.length > 0) {
      var fileData = state.files[0].data;
      if (tabId === 'split' && state.splitPages.length === 0) {
        loadSplitPreview(fileData);
      } else if (tabId === 'crop' && state.cropTotalPages === 0) {
        loadCropPreview(fileData);
      } else if (tabId === 'forms' && state.formsFields.length === 0) {
        loadFormPreview(fileData);
      } else if (tabId === 'annotate' && state.annotateTotalPages === 0) {
        loadAnnotatePreview(fileData);
      } else if (tabId === 'merge' && state.mergePageMode) {
        loadMergePagePreview();
      }
    }

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
      'crop': 'dropCrop',
      'forms': 'dropForms',
      'annotate': 'dropAnnotate',
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
        'crop': 'cropBtnText',
        'forms': 'formsBtnText',
        'annotate': 'annotateBtnText',
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

          // For crop: auto-load preview
          if (state.activeTab === 'crop' && state.files.length === 1) {
            loadCropPreview(data);
          }

          // For forms: auto-load form fields
          if (state.activeTab === 'forms' && state.files.length === 1) {
            loadFormPreview(data);
          }

          // For annotate: auto-load preview
          if (state.activeTab === 'annotate' && state.files.length === 1) {
            loadAnnotatePreview(data);
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
    var isEditorTab = ['crop', 'forms', 'annotate'].indexOf(state.activeTab) >= 0;

    // Editor area: full-panel preview for crop/forms/annotate
    var editorArea = document.getElementById('editorArea');
    var showEditor = isEditorTab && hasFiles;
    if (editorArea) editorArea.hidden = !showEditor;

    // Full-width editor mode: hide divider + right panel
    // When result is ready, exit editor mode to show download panel
    var workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.toggle('workspace--editor', showEditor && !state.result);

    // Hide file list, drop zone & options panel when editor is active
    if (dom.fileListArea && showEditor) dom.fileListArea.hidden = true;
    if (dom.dropZone && showEditor) dom.dropZone.hidden = true;
    var optionsPanel = document.getElementById('optionsPanel');
    if (optionsPanel) optionsPanel.hidden = isEditorTab || !hasFiles;

    // Show/hide tab-specific controls
    var showSplitControls = (state.activeTab === 'split' && hasFiles) ||
                            (state.activeTab === 'merge' && state.mergePageMode && hasFiles);
    if (dom.splitControls) dom.splitControls.hidden = !showSplitControls;
    if (dom.compressControls) dom.compressControls.hidden = state.activeTab !== 'compress' || !hasFiles;

    // Editor sub-container visibility
    var cropContainer = document.getElementById('cropContainer');
    if (cropContainer) cropContainer.hidden = !(state.activeTab === 'crop' && hasFiles);
    var formsContainer = document.getElementById('formsContainer');
    if (formsContainer) formsContainer.hidden = !(state.activeTab === 'forms' && hasFiles);
    var annotateContainer = document.getElementById('annotateContainer');
    if (annotateContainer) annotateContainer.hidden = !(state.activeTab === 'annotate' && hasFiles);

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
  // ANNOTATE
  // ==================
  var annotatePdfDocRef = null; // pdfjs doc
  var annotateCanvasEl = null;
  var annotateDrawCanvas = null;
  var annotateScale = 1;
  var annotateDrawing = false;
  var annotateCurrentPath = [];
  var annotateShapeStart = null;
  var annotateSignaturePad = null;

  var ANNOTATE_TOOLS = ['cursor', 'text', 'pen', 'highlight', 'rect', 'circle', 'line', 'arrow', 'stamp', 'signature', 'image'];
  var ANNOTATE_TOOL_ICONS = {
    cursor: '<path d="M3 3l4 12 2-4 4-2z" stroke="currentColor" stroke-width="1.3" fill="none"/>',
    text: '<text x="4" y="13" font-size="12" font-weight="700" fill="currentColor">T</text>',
    pen: '<path d="M12 2l2 2-9 9-3 1 1-3z" stroke="currentColor" stroke-width="1.3" fill="none"/>',
    highlight: '<rect x="2" y="6" width="12" height="5" rx="1" fill="currentColor" opacity="0.3"/><path d="M2 8.5h12" stroke="currentColor" stroke-width="1"/>',
    rect: '<rect x="3" y="3" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.3" fill="none"/>',
    circle: '<circle cx="8" cy="8" r="5" stroke="currentColor" stroke-width="1.3" fill="none"/>',
    line: '<line x1="3" y1="13" x2="13" y2="3" stroke="currentColor" stroke-width="1.3"/>',
    arrow: '<path d="M3 13L13 3M13 3H7M13 3v6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
    stamp: '<rect x="2" y="9" width="12" height="4" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/><path d="M6 9V6a2 2 0 014 0v3" stroke="currentColor" stroke-width="1.2" fill="none"/>',
    signature: '<path d="M2 12c2-4 3-6 5-6s2 3 3 3 2-2 4-4" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/>',
    image: '<rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="5.5" cy="6.5" r="1.5" fill="currentColor"/><path d="M2 11l3-3 2 2 3-4 4 5" stroke="currentColor" stroke-width="1" fill="none"/>',
  };

  function loadAnnotatePreview(fileData) {
    state.annotateCurrentPage = 0;
    state.annotateTotalPages = 0;
    state.annotateAnnotations = {};
    state.annotateUndoStack = [];
    state.annotateRedoStack = [];

    loadPdfjs().then(function (lib) {
      lib.getDocument({ data: fileData.slice() }).promise.then(function (pdfDoc) {
        annotatePdfDocRef = pdfDoc;
        state.annotateTotalPages = pdfDoc.numPages;
        annotateBaseScale = 0; // reset scale for new file
        annotateUserZoom = 1.0;
        ensureAnnotateUI();
        updateUI();
        var zoomLabel = document.getElementById('annotateZoomLabel');
        if (zoomLabel) zoomLabel.textContent = '100%';
        // Wait for layout to settle before reading container dimensions
        requestAnimationFrame(function () {
          renderAnnotatePage();
          updateAnnotateNav();
        });
      }).catch(function () {
        showToast(t('errorCorruptPdf'));
      });
    });
  }

  function ensureAnnotateUI() {
    if (document.getElementById('annotateContainer')) return;

    var editorArea = document.getElementById('editorArea');
    if (!editorArea) return;

    var container = document.createElement('div');
    container.id = 'annotateContainer';
    container.className = 'annotate-container';
    container.hidden = true;

    // Toolbar
    var toolbar = document.createElement('div');
    toolbar.className = 'annotate-toolbar';

    ANNOTATE_TOOLS.forEach(function (tool) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'annotate-toolbar__btn' + (tool === state.annotateTool ? ' annotate-toolbar__btn--active' : '');
      btn.dataset.tool = tool;
      btn.title = t('annotateTool_' + tool);
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none">' + ANNOTATE_TOOL_ICONS[tool] + '</svg>';
      btn.addEventListener('click', function () {
        setAnnotateTool(tool);
      });
      toolbar.appendChild(btn);
    });

    // Separator
    var sep = document.createElement('span');
    sep.className = 'annotate-toolbar__sep';
    toolbar.appendChild(sep);

    // Undo/Redo
    var undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'annotate-toolbar__btn';
    undoBtn.id = 'annotateUndoBtn';
    undoBtn.title = t('annotateUndo');
    undoBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6h6a3 3 0 010 6H7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/><path d="M6 3L3 6l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    undoBtn.addEventListener('click', annotateUndo);
    toolbar.appendChild(undoBtn);

    var redoBtn = document.createElement('button');
    redoBtn.type = 'button';
    redoBtn.className = 'annotate-toolbar__btn';
    redoBtn.id = 'annotateRedoBtn';
    redoBtn.title = t('annotateRedo');
    redoBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 6H6a3 3 0 000 6h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none"/><path d="M10 3l3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
    redoBtn.addEventListener('click', annotateRedo);
    toolbar.appendChild(redoBtn);

    // Separator
    var sep2 = document.createElement('span');
    sep2.className = 'annotate-toolbar__sep';
    toolbar.appendChild(sep2);

    // Color picker
    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = state.annotateColor;
    colorInput.className = 'annotate-toolbar__color';
    colorInput.title = t('annotateColor');
    colorInput.addEventListener('input', function () {
      state.annotateColor = this.value;
    });
    toolbar.appendChild(colorInput);

    // Stroke width
    var strokeInput = document.createElement('input');
    strokeInput.type = 'range';
    strokeInput.min = '1';
    strokeInput.max = '10';
    strokeInput.value = String(state.annotateStroke);
    strokeInput.className = 'annotate-toolbar__stroke';
    strokeInput.title = t('annotateStroke');
    strokeInput.addEventListener('input', function () {
      state.annotateStroke = parseInt(this.value, 10);
    });
    toolbar.appendChild(strokeInput);

    // Nav bar
    var nav = document.createElement('div');
    nav.className = 'annotate-container__nav';

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn--ghost btn--sm';
    prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    prevBtn.addEventListener('click', function () { annotateNavigate(-1); });

    var pageLabel = document.createElement('span');
    pageLabel.className = 'annotate-container__page-label';
    pageLabel.id = 'annotatePageLabel';

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--ghost btn--sm';
    nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    nextBtn.addEventListener('click', function () { annotateNavigate(1); });

    // Zoom controls
    var zoomWrap = document.createElement('span');
    zoomWrap.className = 'annotate-container__zoom';

    var zoomOut = document.createElement('button');
    zoomOut.type = 'button';
    zoomOut.className = 'btn btn--ghost btn--sm';
    zoomOut.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M10 10l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4 6h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
    zoomOut.addEventListener('click', function () { annotateZoom(-0.25); });

    var zoomLabel = document.createElement('span');
    zoomLabel.className = 'annotate-container__zoom-label';
    zoomLabel.id = 'annotateZoomLabel';
    zoomLabel.textContent = '100%';

    var zoomIn = document.createElement('button');
    zoomIn.type = 'button';
    zoomIn.className = 'btn btn--ghost btn--sm';
    zoomIn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M10 10l3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4 6h4M6 4v4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
    zoomIn.addEventListener('click', function () { annotateZoom(0.25); });

    zoomWrap.appendChild(zoomOut);
    zoomWrap.appendChild(zoomLabel);
    zoomWrap.appendChild(zoomIn);

    nav.appendChild(prevBtn);
    nav.appendChild(pageLabel);
    nav.appendChild(nextBtn);
    nav.appendChild(zoomWrap);

    // Canvas area
    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'annotate-container__canvas-wrap';
    canvasWrap.id = 'annotateCanvasWrap';

    annotateCanvasEl = document.createElement('canvas');
    annotateCanvasEl.className = 'annotate-container__canvas';

    annotateDrawCanvas = document.createElement('canvas');
    annotateDrawCanvas.className = 'annotate-container__draw';
    annotateDrawCanvas.id = 'annotateDrawCanvas';

    // Drawing events
    annotateDrawCanvas.addEventListener('mousedown', onAnnotateMouseDown);
    annotateDrawCanvas.addEventListener('mousemove', onAnnotateMouseMove);
    annotateDrawCanvas.addEventListener('mouseup', onAnnotateMouseUp);
    annotateDrawCanvas.addEventListener('mouseleave', onAnnotateMouseUp);
    annotateDrawCanvas.addEventListener('touchstart', onAnnotateTouchStart, { passive: false });
    annotateDrawCanvas.addEventListener('touchmove', onAnnotateTouchMove, { passive: false });
    annotateDrawCanvas.addEventListener('touchend', onAnnotateMouseUp);

    // Drag-and-drop images onto canvas
    annotateDrawCanvas.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    annotateDrawCanvas.addEventListener('drop', function (e) {
      e.preventDefault();
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      var pos = getAnnotatePos(e);
      var reader = new FileReader();
      reader.onload = function (re) {
        var dataUrl = re.target.result;
        var img = new Image();
        img.onload = function () {
          var w = Math.min(img.width, 200);
          var h = img.height * (w / img.width);
          addAnnotation({ type: 'image', imgEl: img, rect: { x: pos.x, y: pos.y, w: w, h: h }, imgData: dataUrl });
          setAnnotateTool('cursor');
        };
        img.onerror = function () { showToast(t('errorGeneric')); };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });

    // Paste images from clipboard (only register once)
    if (!window._annotatePasteRegistered) {
      document.addEventListener('paste', onAnnotatePaste);
      document.addEventListener('keydown', onAnnotateKeyDown);
      window._annotatePasteRegistered = true;
    }

    // Inner wrapper keeps render + draw canvases aligned even when scrolled
    var canvasInner = document.createElement('div');
    canvasInner.className = 'annotate-container__canvas-inner';
    canvasInner.id = 'annotateCanvasInner';
    canvasInner.appendChild(annotateCanvasEl);
    canvasInner.appendChild(annotateDrawCanvas);
    canvasWrap.appendChild(canvasInner);

    // Hidden file input for image tool
    var imgInput = document.createElement('input');
    imgInput.type = 'file';
    imgInput.accept = 'image/*';
    imgInput.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;opacity:0;';
    imgInput.id = 'annotateImageInput';
    imgInput.addEventListener('change', onAnnotateImageSelected);

    // Save button in toolbar
    var sep3 = document.createElement('span');
    sep3.className = 'annotate-toolbar__sep';
    toolbar.appendChild(sep3);

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'annotate-toolbar__save';
    saveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M3 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> ' + t('download');
    saveBtn.addEventListener('click', function () { saveAnnotatedPDF(); });
    toolbar.appendChild(saveBtn);

    container.appendChild(toolbar);
    container.appendChild(nav);
    container.appendChild(canvasWrap);
    container.appendChild(imgInput);
    editorArea.appendChild(container);
  }

  function setAnnotateTool(tool) {
    state.annotateTool = tool;
    if (tool !== 'cursor') {
      annotateSelectedIndex = -1;
    }
    var btns = document.querySelectorAll('.annotate-toolbar__btn');
    btns.forEach(function (b) {
      b.classList.toggle('annotate-toolbar__btn--active', b.dataset.tool === tool);
    });

    if (annotateDrawCanvas) {
      annotateDrawCanvas.style.cursor = tool === 'cursor' ? 'default' : 'crosshair';
    }

    // Special tools
    if (tool === 'signature') {
      openSignaturePad();
    } else if (tool === 'image') {
      var inp = document.getElementById('annotateImageInput');
      if (inp) inp.click();
    }
  }

  var annotateUserZoom = 1.0;
  var annotateBaseScale = 0;
  var annotateResizeTimer = null;

  function recalcAnnotateBaseScale() {
    annotateBaseScale = 0;
    if (annotatePdfDocRef) renderAnnotatePage();
  }

  window.addEventListener('resize', function () {
    if (!annotatePdfDocRef) return;
    clearTimeout(annotateResizeTimer);
    annotateResizeTimer = setTimeout(recalcAnnotateBaseScale, 200);
  });

  function renderAnnotatePage() {
    if (!annotatePdfDocRef || !annotateCanvasEl) return;

    annotatePdfDocRef.getPage(state.annotateCurrentPage + 1).then(function (page) {
      var viewport = page.getViewport({ scale: 1 });

      // Recompute base scale when reset or on first render
      if (!annotateBaseScale) {
        var container = document.getElementById('annotateContainer');
        var containerW = container ? container.clientWidth - 32 : 600;
        if (containerW < 100) containerW = 600;
        annotateBaseScale = containerW / viewport.width;
      }
      annotateScale = annotateBaseScale * annotateUserZoom;
      var scaledViewport = page.getViewport({ scale: annotateScale });

      var w = Math.floor(scaledViewport.width);
      var h = Math.floor(scaledViewport.height);

      annotateCanvasEl.width = w;
      annotateCanvasEl.height = h;
      annotateDrawCanvas.width = w;
      annotateDrawCanvas.height = h;

      var ctx = annotateCanvasEl.getContext('2d');
      page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
        redrawAnnotations();
      });
    });
  }

  function getPageAnnotations() {
    return state.annotateAnnotations[state.annotateCurrentPage] || [];
  }

  function addAnnotation(ann) {
    var pageIdx = state.annotateCurrentPage;
    if (!state.annotateAnnotations[pageIdx]) state.annotateAnnotations[pageIdx] = [];
    state.annotateAnnotations[pageIdx].push(ann);
    state.annotateUndoStack.push({ action: 'add', pageIdx: pageIdx, index: state.annotateAnnotations[pageIdx].length - 1 });
    state.annotateRedoStack = [];
    redrawAnnotations();
  }

  function annotateUndo() {
    var last = state.annotateUndoStack.pop();
    if (!last) return;
    if (last.action === 'add') {
      var removed = state.annotateAnnotations[last.pageIdx].splice(last.index, 1)[0];
      state.annotateRedoStack.push({ action: 'add', pageIdx: last.pageIdx, annotation: removed });
    } else if (last.action === 'move') {
      var ann = (state.annotateAnnotations[last.pageIdx] || [])[last.index];
      if (ann) {
        var curPos = ann.rect ? { x: ann.rect.x, y: ann.rect.y } : ann.pos ? { x: ann.pos.x, y: ann.pos.y } : null;
        if (ann.rect) { ann.rect.x = last.origPos.x; ann.rect.y = last.origPos.y; }
        else if (ann.pos) { ann.pos.x = last.origPos.x; ann.pos.y = last.origPos.y; }
        state.annotateRedoStack.push({ action: 'move', pageIdx: last.pageIdx, index: last.index, origPos: curPos });
      }
    } else if (last.action === 'resize') {
      var ann2 = (state.annotateAnnotations[last.pageIdx] || [])[last.index];
      if (ann2 && ann2.rect) {
        var curRect = { x: ann2.rect.x, y: ann2.rect.y, w: ann2.rect.w, h: ann2.rect.h };
        ann2.rect.x = last.origRect.x; ann2.rect.y = last.origRect.y;
        ann2.rect.w = last.origRect.w; ann2.rect.h = last.origRect.h;
        state.annotateRedoStack.push({ action: 'resize', pageIdx: last.pageIdx, index: last.index, origRect: curRect });
      }
    } else if (last.action === 'delete') {
      if (!state.annotateAnnotations[last.pageIdx]) state.annotateAnnotations[last.pageIdx] = [];
      state.annotateAnnotations[last.pageIdx].splice(last.index, 0, last.annotation);
      state.annotateRedoStack.push({ action: 'delete', pageIdx: last.pageIdx, index: last.index, annotation: last.annotation });
    }
    redrawAnnotations();
  }

  function annotateRedo() {
    var last = state.annotateRedoStack.pop();
    if (!last) return;
    if (last.action === 'add') {
      if (!state.annotateAnnotations[last.pageIdx]) state.annotateAnnotations[last.pageIdx] = [];
      state.annotateAnnotations[last.pageIdx].push(last.annotation);
      state.annotateUndoStack.push({ action: 'add', pageIdx: last.pageIdx, index: state.annotateAnnotations[last.pageIdx].length - 1 });
    } else if (last.action === 'move') {
      var ann = (state.annotateAnnotations[last.pageIdx] || [])[last.index];
      if (ann) {
        var curPos = ann.rect ? { x: ann.rect.x, y: ann.rect.y } : ann.pos ? { x: ann.pos.x, y: ann.pos.y } : null;
        if (ann.rect) { ann.rect.x = last.origPos.x; ann.rect.y = last.origPos.y; }
        else if (ann.pos) { ann.pos.x = last.origPos.x; ann.pos.y = last.origPos.y; }
        state.annotateUndoStack.push({ action: 'move', pageIdx: last.pageIdx, index: last.index, origPos: curPos });
      }
    } else if (last.action === 'resize') {
      var ann2 = (state.annotateAnnotations[last.pageIdx] || [])[last.index];
      if (ann2 && ann2.rect) {
        var curRect = { x: ann2.rect.x, y: ann2.rect.y, w: ann2.rect.w, h: ann2.rect.h };
        ann2.rect.x = last.origRect.x; ann2.rect.y = last.origRect.y;
        ann2.rect.w = last.origRect.w; ann2.rect.h = last.origRect.h;
        state.annotateUndoStack.push({ action: 'resize', pageIdx: last.pageIdx, index: last.index, origRect: curRect });
      }
    } else if (last.action === 'delete') {
      var removed = state.annotateAnnotations[last.pageIdx].splice(last.index, 1)[0];
      state.annotateUndoStack.push({ action: 'delete', pageIdx: last.pageIdx, index: last.index, annotation: removed });
    }
    redrawAnnotations();
  }

  function redrawAnnotations() {
    if (!annotateDrawCanvas) return;
    var ctx = annotateDrawCanvas.getContext('2d');
    ctx.clearRect(0, 0, annotateDrawCanvas.width, annotateDrawCanvas.height);

    var anns = getPageAnnotations();
    anns.forEach(function (ann) {
      drawAnnotation(ctx, ann);
    });

    // Draw selection handles on selected annotation
    if (annotateSelectedIndex >= 0 && annotateSelectedIndex < anns.length && state.annotateTool === 'cursor') {
      drawSelectionHandles(ctx, anns[annotateSelectedIndex]);
    }
  }

  function drawAnnotation(ctx, ann) {
    var s = annotateScale;
    if (!s || s <= 0) return;
    ctx.save();
    try {
    ctx.strokeStyle = ann.color || '#ef4444';
    ctx.fillStyle = ann.color || '#ef4444';
    ctx.lineWidth = (ann.stroke || 2) * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (ann.type) {
      case 'pen':
        if (ann.points && ann.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(ann.points[0].x * s, ann.points[0].y * s);
          for (var i = 1; i < ann.points.length; i++) {
            ctx.lineTo(ann.points[i].x * s, ann.points[i].y * s);
          }
          ctx.stroke();
        }
        break;
      case 'highlight':
        ctx.globalAlpha = 0.3;
        ctx.fillRect(ann.rect.x * s, ann.rect.y * s, ann.rect.w * s, ann.rect.h * s);
        ctx.globalAlpha = 1;
        break;
      case 'rect':
        ctx.strokeRect(ann.rect.x * s, ann.rect.y * s, ann.rect.w * s, ann.rect.h * s);
        break;
      case 'circle':
        ctx.beginPath();
        var cx = (ann.rect.x + ann.rect.w / 2) * s;
        var cy = (ann.rect.y + ann.rect.h / 2) * s;
        var rx = Math.abs(ann.rect.w / 2) * s;
        var ry = Math.abs(ann.rect.h / 2) * s;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'line':
        ctx.beginPath();
        ctx.moveTo(ann.start.x * s, ann.start.y * s);
        ctx.lineTo(ann.end.x * s, ann.end.y * s);
        ctx.stroke();
        break;
      case 'arrow':
        var ax = ann.start.x * s, ay = ann.start.y * s;
        var bx = ann.end.x * s, by = ann.end.y * s;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        // Arrowhead
        var angle = Math.atan2(by - ay, bx - ax);
        var headLen = 10 * s;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - headLen * Math.cos(angle - 0.4), by - headLen * Math.sin(angle - 0.4));
        ctx.moveTo(bx, by);
        ctx.lineTo(bx - headLen * Math.cos(angle + 0.4), by - headLen * Math.sin(angle + 0.4));
        ctx.stroke();
        break;
      case 'text':
        ctx.font = (ann.fontSize || 14) * s + 'px system-ui, sans-serif';
        ctx.fillText(ann.text, ann.pos.x * s, ann.pos.y * s);
        break;
      case 'stamp':
        var stampText = ann.text;
        ctx.font = 'bold ' + 18 * s + 'px system-ui, sans-serif';
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = 2 * s;
        var tm = ctx.measureText(stampText);
        var px = ann.pos.x * s;
        var py = ann.pos.y * s;
        var pad = 8 * s;
        ctx.strokeRect(px - pad, py - 18 * s - pad / 2, tm.width + pad * 2, 18 * s + pad);
        ctx.fillText(stampText, px, py);
        break;
      case 'image':
      case 'signature':
        if (ann.imgEl && ann.imgEl.complete && ann.imgEl.naturalWidth > 0) {
          ctx.drawImage(ann.imgEl, ann.rect.x * s, ann.rect.y * s, ann.rect.w * s, ann.rect.h * s);
        } else if (ann.imgData && !ann._imgLoading) {
          // Reload image from stored dataURL (guard against repeated calls)
          ann._imgLoading = true;
          var reloadImg = new Image();
          reloadImg.onload = function () {
            ann.imgEl = reloadImg;
            ann._imgLoading = false;
            redrawAnnotations();
          };
          reloadImg.onerror = function () {
            ann._imgLoading = false;
            console.warn('Failed to reload annotation image');
          };
          reloadImg.src = ann.imgData;
        }
        break;
    }
    } catch (err) { console.warn('drawAnnotation error:', err); }
    finally { ctx.restore(); }
  }

  // Mouse/touch handlers for annotate
  function getAnnotatePos(e) {
    if (!annotateDrawCanvas) return { x: 0, y: 0 };
    var rect = annotateDrawCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / annotateScale,
      y: (e.clientY - rect.top) / annotateScale,
    };
  }

  function showAnnotateInlineInput(pos) {
    removeAnnotatePopover();
    var wrap = document.getElementById('annotateCanvasInner') || document.getElementById('annotateCanvasWrap');
    if (!wrap) return;

    var popover = document.createElement('div');
    popover.className = 'annotate-popover';
    popover.id = 'annotatePopover';
    popover.style.left = (pos.x * annotateScale) + 'px';
    popover.style.top = (pos.y * annotateScale) + 'px';

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'annotate-popover__input';
    input.placeholder = t('annotateTextPrompt');
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && input.value.trim()) {
        addAnnotation({ type: 'text', text: input.value.trim(), pos: pos, color: state.annotateColor, fontSize: 14 });
        removeAnnotatePopover();
      } else if (e.key === 'Escape') {
        removeAnnotatePopover();
      }
    });

    var okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'annotate-popover__btn';
    okBtn.textContent = 'OK';
    okBtn.addEventListener('click', function () {
      if (input.value.trim()) {
        addAnnotation({ type: 'text', text: input.value.trim(), pos: pos, color: state.annotateColor, fontSize: 14 });
      }
      removeAnnotatePopover();
    });

    popover.appendChild(input);
    popover.appendChild(okBtn);
    wrap.appendChild(popover);
    input.focus();
  }

  function showAnnotateStampPicker(pos) {
    removeAnnotatePopover();
    var wrap = document.getElementById('annotateCanvasInner') || document.getElementById('annotateCanvasWrap');
    if (!wrap) return;

    var stamps = [
      { key: 'annotateStampDraft', label: t('annotateStampDraft') },
      { key: 'annotateStampApproved', label: t('annotateStampApproved') },
      { key: 'annotateStampConfidential', label: t('annotateStampConfidential') },
    ];

    var popover = document.createElement('div');
    popover.className = 'annotate-popover annotate-popover--stamps';
    popover.id = 'annotatePopover';
    popover.style.left = (pos.x * annotateScale) + 'px';
    popover.style.top = (pos.y * annotateScale) + 'px';

    stamps.forEach(function (s) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'annotate-popover__stamp';
      btn.textContent = s.label;
      btn.addEventListener('click', function () {
        addAnnotation({ type: 'stamp', text: s.label, pos: pos, color: state.annotateColor });
        removeAnnotatePopover();
      });
      popover.appendChild(btn);
    });

    wrap.appendChild(popover);
  }

  function removeAnnotatePopover() {
    var existing = document.getElementById('annotatePopover');
    if (existing) existing.remove();
  }

  // Selection & resize state for annotations
  var annotateDragTarget = null; // { annIndex, offsetX, offsetY, origPos }
  var annotateSelectedIndex = -1; // index of currently selected annotation
  var annotateResizeTarget = null; // { annIndex, handle, origRect, startPos }
  var HANDLE_SIZE = 8; // px in PDF coordinates

  function drawSelectionHandles(ctx, ann) {
    if (!ann.rect) return;
    var s = annotateScale;
    var r = ann.rect;
    var x = r.x * s, y = r.y * s, w = r.w * s, h = r.h * s;
    var hs = HANDLE_SIZE * Math.min(s, 1.5);

    // Dashed selection border
    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    // Resize handles at corners + midpoints
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    var handles = getHandlePositions(r, s, hs);
    handles.forEach(function (hp) {
      ctx.fillRect(hp.sx - hs / 2, hp.sy - hs / 2, hs, hs);
      ctx.strokeRect(hp.sx - hs / 2, hp.sy - hs / 2, hs, hs);
    });
    ctx.restore();
  }

  function getHandlePositions(rect, s, hs) {
    var x = rect.x * s, y = rect.y * s, w = rect.w * s, h = rect.h * s;
    return [
      { id: 'nw', sx: x, sy: y },
      { id: 'ne', sx: x + w, sy: y },
      { id: 'sw', sx: x, sy: y + h },
      { id: 'se', sx: x + w, sy: y + h },
      { id: 'n',  sx: x + w / 2, sy: y },
      { id: 's',  sx: x + w / 2, sy: y + h },
      { id: 'w',  sx: x, sy: y + h / 2 },
      { id: 'e',  sx: x + w, sy: y + h / 2 },
    ];
  }

  function hitTestHandle(pos, ann) {
    if (!ann || !ann.rect) return null;
    var s = annotateScale;
    var hs = HANDLE_SIZE * Math.min(s, 1.5);
    var handles = getHandlePositions(ann.rect, s, hs);
    var px = pos.x * s, py = pos.y * s;
    for (var i = 0; i < handles.length; i++) {
      if (Math.abs(px - handles[i].sx) <= hs && Math.abs(py - handles[i].sy) <= hs) {
        return handles[i].id;
      }
    }
    return null;
  }

  function getCursorForHandle(handle) {
    var map = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize',
                n: 'ns-resize', s: 'ns-resize', w: 'ew-resize', e: 'ew-resize' };
    return map[handle] || 'default';
  }

  function hitTestAnnotation(pos) {
    var anns = getPageAnnotations();
    // Reverse order — top-most first
    for (var i = anns.length - 1; i >= 0; i--) {
      var ann = anns[i];
      if (ann.rect) {
        if (pos.x >= ann.rect.x && pos.x <= ann.rect.x + ann.rect.w &&
            pos.y >= ann.rect.y && pos.y <= ann.rect.y + ann.rect.h) {
          return { annIndex: i, offsetX: pos.x - ann.rect.x, offsetY: pos.y - ann.rect.y };
        }
      } else if (ann.pos) {
        // Text/stamp — hit area ~100x30 from pos
        var tw = 120, th = 30;
        if (pos.x >= ann.pos.x - 5 && pos.x <= ann.pos.x + tw &&
            pos.y >= ann.pos.y - th && pos.y <= ann.pos.y + 5) {
          return { annIndex: i, offsetX: pos.x - ann.pos.x, offsetY: pos.y - ann.pos.y };
        }
      }
    }
    return null;
  }

  function onAnnotateMouseDown(e) {
    var tool = state.annotateTool;
    var pos = getAnnotatePos(e);

    // Cursor tool: select, resize handle, or drag
    if (tool === 'cursor') {
      // Check if clicking a resize handle on the selected annotation
      if (annotateSelectedIndex >= 0) {
        var selAnn = getPageAnnotations()[annotateSelectedIndex];
        if (selAnn && selAnn.rect) {
          var handle = hitTestHandle(pos, selAnn);
          if (handle) {
            annotateResizeTarget = {
              annIndex: annotateSelectedIndex,
              handle: handle,
              origRect: { x: selAnn.rect.x, y: selAnn.rect.y, w: selAnn.rect.w, h: selAnn.rect.h },
              startPos: pos,
            };
            annotateDrawCanvas.style.cursor = getCursorForHandle(handle);
            return;
          }
        }
      }

      var hit = hitTestAnnotation(pos);
      if (hit) {
        annotateSelectedIndex = hit.annIndex;
        var ann = getPageAnnotations()[hit.annIndex];
        hit.origPos = ann.rect
          ? { x: ann.rect.x, y: ann.rect.y }
          : ann.pos ? { x: ann.pos.x, y: ann.pos.y } : null;
        annotateDragTarget = hit;
        annotateDrawCanvas.style.cursor = 'grabbing';
        redrawAnnotations();
      } else {
        annotateSelectedIndex = -1;
        redrawAnnotations();
      }
      return;
    }

    if (tool === 'signature' || tool === 'image') return;

    if (tool === 'text') {
      showAnnotateInlineInput(pos);
      return;
    }

    if (tool === 'stamp') {
      showAnnotateStampPicker(pos);
      return;
    }

    annotateDrawing = true;
    if (tool === 'pen') {
      annotateCurrentPath = [pos];
    } else {
      annotateShapeStart = pos;
    }
  }

  function onAnnotateMouseMove(e) {
    // Handle resize
    if (annotateResizeTarget) {
      var pos = getAnnotatePos(e);
      var rt = annotateResizeTarget;
      var ann = getPageAnnotations()[rt.annIndex];
      if (!ann || !ann.rect) return;
      var dx = pos.x - rt.startPos.x;
      var dy = pos.y - rt.startPos.y;
      var o = rt.origRect;
      var MIN_SIZE = 10;

      switch (rt.handle) {
        case 'se': ann.rect.w = Math.max(MIN_SIZE, o.w + dx); ann.rect.h = Math.max(MIN_SIZE, o.h + dy); break;
        case 'sw': ann.rect.x = o.x + dx; ann.rect.w = Math.max(MIN_SIZE, o.w - dx); ann.rect.h = Math.max(MIN_SIZE, o.h + dy); break;
        case 'ne': ann.rect.w = Math.max(MIN_SIZE, o.w + dx); ann.rect.y = o.y + dy; ann.rect.h = Math.max(MIN_SIZE, o.h - dy); break;
        case 'nw': ann.rect.x = o.x + dx; ann.rect.y = o.y + dy; ann.rect.w = Math.max(MIN_SIZE, o.w - dx); ann.rect.h = Math.max(MIN_SIZE, o.h - dy); break;
        case 'n': ann.rect.y = o.y + dy; ann.rect.h = Math.max(MIN_SIZE, o.h - dy); break;
        case 's': ann.rect.h = Math.max(MIN_SIZE, o.h + dy); break;
        case 'w': ann.rect.x = o.x + dx; ann.rect.w = Math.max(MIN_SIZE, o.w - dx); break;
        case 'e': ann.rect.w = Math.max(MIN_SIZE, o.w + dx); break;
      }
      redrawAnnotations();
      return;
    }

    // Handle drag-to-move
    if (annotateDragTarget) {
      var pos = getAnnotatePos(e);
      var anns = getPageAnnotations();
      var ann = anns[annotateDragTarget.annIndex];
      if (ann) {
        if (ann.rect) {
          ann.rect.x = pos.x - annotateDragTarget.offsetX;
          ann.rect.y = pos.y - annotateDragTarget.offsetY;
        } else if (ann.pos) {
          ann.pos.x = pos.x - annotateDragTarget.offsetX;
          ann.pos.y = pos.y - annotateDragTarget.offsetY;
        }
        redrawAnnotations();
      }
      return;
    }

    if (!annotateDrawing) {
      // Hover cursor update for cursor tool
      if (state.annotateTool === 'cursor' && annotateDrawCanvas) {
        var hPos = getAnnotatePos(e);
        if (annotateSelectedIndex >= 0) {
          var selAnn = getPageAnnotations()[annotateSelectedIndex];
          var hHandle = hitTestHandle(hPos, selAnn);
          if (hHandle) { annotateDrawCanvas.style.cursor = getCursorForHandle(hHandle); return; }
        }
        var hHit = hitTestAnnotation(hPos);
        annotateDrawCanvas.style.cursor = hHit ? 'grab' : 'default';
      }
      return;
    }
    var tool = state.annotateTool;
    var pos = getAnnotatePos(e);

    if (tool === 'pen') {
      annotateCurrentPath.push(pos);
      // Live preview
      var ctx = annotateDrawCanvas.getContext('2d');
      redrawAnnotations();
      ctx.save();
      ctx.strokeStyle = state.annotateColor;
      ctx.lineWidth = state.annotateStroke * annotateScale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(annotateCurrentPath[0].x * annotateScale, annotateCurrentPath[0].y * annotateScale);
      for (var i = 1; i < annotateCurrentPath.length; i++) {
        ctx.lineTo(annotateCurrentPath[i].x * annotateScale, annotateCurrentPath[i].y * annotateScale);
      }
      ctx.stroke();
      ctx.restore();
    } else if (annotateShapeStart) {
      // Live preview shape
      var ctx2 = annotateDrawCanvas.getContext('2d');
      redrawAnnotations();
      var tempAnn = buildShapeAnnotation(tool, annotateShapeStart, pos);
      if (tempAnn) drawAnnotation(ctx2, tempAnn);
    }
  }

  // onAnnotateMouseUp — handles shapes, resize + drag release
  function onAnnotateMouseUp(e) {
    // Release resize — push to undo stack
    if (annotateResizeTarget) {
      var rt = annotateResizeTarget;
      state.annotateUndoStack.push({
        action: 'resize', pageIdx: state.annotateCurrentPage,
        index: rt.annIndex, origRect: rt.origRect,
      });
      state.annotateRedoStack = [];
      annotateResizeTarget = null;
      if (annotateDrawCanvas) annotateDrawCanvas.style.cursor = 'default';
      return;
    }

    // Release drag — push move to undo stack
    if (annotateDragTarget) {
      if (annotateDragTarget.origPos) {
        var pageIdx = state.annotateCurrentPage;
        var idx = annotateDragTarget.annIndex;
        var orig = annotateDragTarget.origPos;
        state.annotateUndoStack.push({ action: 'move', pageIdx: pageIdx, index: idx, origPos: orig });
        state.annotateRedoStack = [];
      }
      annotateDragTarget = null;
      if (annotateDrawCanvas) annotateDrawCanvas.style.cursor = state.annotateTool === 'cursor' ? 'default' : 'crosshair';
      return;
    }

    if (!annotateDrawing) return;
    annotateDrawing = false;
    var tool = state.annotateTool;

    if (tool === 'pen' && annotateCurrentPath.length > 1) {
      addAnnotation({
        type: 'pen',
        points: annotateCurrentPath.slice(),
        color: state.annotateColor,
        stroke: state.annotateStroke,
      });
    } else if (annotateShapeStart && e && e.clientX !== undefined) {
      var pos = getAnnotatePos(e);
      var ann = buildShapeAnnotation(tool, annotateShapeStart, pos);
      if (ann) addAnnotation(ann);
    }

    annotateCurrentPath = [];
    annotateShapeStart = null;
  }

  function buildShapeAnnotation(tool, start, end) {
    if (!start || !end) return null;
    var x = Math.min(start.x, end.x);
    var y = Math.min(start.y, end.y);
    var w = Math.abs(end.x - start.x);
    var h = Math.abs(end.y - start.y);
    if (w < 2 && h < 2) return null;

    var base = { color: state.annotateColor, stroke: state.annotateStroke };

    switch (tool) {
      case 'highlight':
        return Object.assign(base, { type: 'highlight', rect: { x: x, y: y, w: w, h: h } });
      case 'rect':
        return Object.assign(base, { type: 'rect', rect: { x: x, y: y, w: w, h: h } });
      case 'circle':
        return Object.assign(base, { type: 'circle', rect: { x: x, y: y, w: w, h: h } });
      case 'line':
        return Object.assign(base, { type: 'line', start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y } });
      case 'arrow':
        return Object.assign(base, { type: 'arrow', start: { x: start.x, y: start.y }, end: { x: end.x, y: end.y } });
      default:
        return null;
    }
  }

  function onAnnotateTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    onAnnotateMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  }

  function onAnnotateTouchMove(e) {
    e.preventDefault();
    var touch = e.touches[0];
    onAnnotateMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  // Signature pad (simple modal)
  function openSignaturePad() {
    var existing = document.getElementById('signaturePadOverlay');
    if (existing) existing.remove();

    var overlay = document.createElement('div');
    overlay.id = 'signaturePadOverlay';
    overlay.className = 'signature-pad-overlay';

    var pad = document.createElement('div');
    pad.className = 'signature-pad';

    var padCanvas = document.createElement('canvas');
    padCanvas.width = 400;
    padCanvas.height = 200;
    padCanvas.className = 'signature-pad__canvas';

    var padCtx = padCanvas.getContext('2d');
    padCtx.fillStyle = '#fff';
    padCtx.fillRect(0, 0, 400, 200);

    var drawing = false;
    padCanvas.addEventListener('mousedown', function (e) {
      drawing = true;
      var r = padCanvas.getBoundingClientRect();
      padCtx.beginPath();
      padCtx.moveTo(e.clientX - r.left, e.clientY - r.top);
    });
    padCanvas.addEventListener('mousemove', function (e) {
      if (!drawing) return;
      var r = padCanvas.getBoundingClientRect();
      padCtx.strokeStyle = '#000';
      padCtx.lineWidth = 2;
      padCtx.lineCap = 'round';
      padCtx.lineTo(e.clientX - r.left, e.clientY - r.top);
      padCtx.stroke();
    });
    padCanvas.addEventListener('mouseup', function () { drawing = false; });
    padCanvas.addEventListener('mouseleave', function () { drawing = false; });

    var btns = document.createElement('div');
    btns.className = 'signature-pad__btns';

    var clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'btn btn--ghost btn--sm';
    clearBtn.textContent = t('cropReset');
    clearBtn.addEventListener('click', function () {
      padCtx.fillStyle = '#fff';
      padCtx.fillRect(0, 0, 400, 200);
    });

    var okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.className = 'btn btn--ghost btn--sm';
    okBtn.textContent = 'OK';
    okBtn.addEventListener('click', function () {
      padCanvas.toBlob(function (blob) {
        var img = new Image();
        img.onload = function () {
          addAnnotation({
            type: 'signature',
            imgEl: img,
            rect: { x: 50, y: 50, w: 200, h: 100 },
            imgData: padCanvas.toDataURL('image/png'),
          });
          overlay.remove();
          setAnnotateTool('cursor');
        };
        img.src = URL.createObjectURL(blob);
      }, 'image/png');
    });

    var cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn--ghost btn--sm';
    cancelBtn.textContent = t('fullscreenClose');
    cancelBtn.addEventListener('click', function () {
      overlay.remove();
      setAnnotateTool('cursor');
    });

    btns.appendChild(clearBtn);
    btns.appendChild(okBtn);
    btns.appendChild(cancelBtn);

    pad.appendChild(padCanvas);
    pad.appendChild(btns);
    overlay.appendChild(pad);
    document.body.appendChild(overlay);
  }

  function onAnnotateKeyDown(e) {
    if (state.activeTab !== 'annotate' || !annotateDrawCanvas) return;
    // Don't handle when typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Delete/Backspace removes selected annotation
    if ((e.key === 'Delete' || e.key === 'Backspace') && annotateSelectedIndex >= 0) {
      e.preventDefault();
      var anns = getPageAnnotations();
      if (annotateSelectedIndex < anns.length) {
        var removed = anns.splice(annotateSelectedIndex, 1)[0];
        state.annotateUndoStack.push({
          action: 'delete', pageIdx: state.annotateCurrentPage,
          index: annotateSelectedIndex, annotation: removed,
        });
        state.annotateRedoStack = [];
        annotateSelectedIndex = -1;
        redrawAnnotations();
      }
    }

    // Escape deselects
    if (e.key === 'Escape' && annotateSelectedIndex >= 0) {
      annotateSelectedIndex = -1;
      redrawAnnotations();
    }
  }

  function onAnnotatePaste(e) {
    // Only handle paste when annotate tab is active
    if (state.activeTab !== 'annotate' || !annotateDrawCanvas) return;
    var items = (e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {}).items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        e.preventDefault();
        var blob = items[i].getAsFile();
        if (!blob) continue;
        var reader = new FileReader();
        reader.onload = function (re) {
          var dataUrl = re.target.result;
          var img = new Image();
          img.onload = function () {
            var w = Math.min(img.width, 200);
            var h = img.height * (w / img.width);
            addAnnotation({ type: 'image', imgEl: img, rect: { x: 50, y: 50, w: w, h: h }, imgData: dataUrl });
            setAnnotateTool('cursor');
          };
          img.onerror = function () { showToast(t('errorGeneric')); };
          img.src = dataUrl;
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  }

  function onAnnotateImageSelected(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (re) {
      var dataUrl = re.target.result;
      var img = new Image();
      img.onload = function () {
        var w = Math.min(img.width, 200);
        var h = img.height * (w / img.width);
        addAnnotation({
          type: 'image',
          imgEl: img,
          rect: { x: 50, y: 50, w: w, h: h },
          imgData: dataUrl,
        });
        setAnnotateTool('cursor');
      };
      img.onerror = function () { showToast(t('errorGeneric')); };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function annotateZoom(delta) {
    annotateUserZoom = Math.max(0.25, Math.min(4, annotateUserZoom + delta));
    var label = document.getElementById('annotateZoomLabel');
    if (label) label.textContent = Math.round(annotateUserZoom * 100) + '%';
    renderAnnotatePage();
  }

  function annotateNavigate(delta) {
    var newPage = state.annotateCurrentPage + delta;
    if (newPage < 0 || newPage >= state.annotateTotalPages) return;
    state.annotateCurrentPage = newPage;
    annotateSelectedIndex = -1;
    renderAnnotatePage();
    updateAnnotateNav();
  }

  function updateAnnotateNav() {
    var label = document.getElementById('annotatePageLabel');
    if (label) {
      label.textContent = t('cropPageNav') + ' ' + (state.annotateCurrentPage + 1) + ' / ' + state.annotateTotalPages;
    }
  }

  async function saveAnnotatedPDF() {
    if (state.files.length === 0) {
      showToast(t('errorNoFiles'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      showProgress(0, t('processing'));
      var pdfDoc = await PDFLib.PDFDocument.load(state.files[0].data, { ignoreEncryption: true });
      var pages = pdfDoc.getPages();
      var font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      var fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      var totalPages = pages.length;

      for (var pi = 0; pi < totalPages; pi++) {
        showProgress((pi / totalPages) * 80, t('processingPage') + ' ' + (pi + 1) + '/' + totalPages);

        var anns = state.annotateAnnotations[pi];
        if (!anns || anns.length === 0) continue;

        var page = pages[pi];
        var mb = page.getMediaBox();
        var pageH = mb.height;

        for (var ai = 0; ai < anns.length; ai++) {
          var ann = anns[ai];
          var color = hexToRgb(ann.color || '#ef4444');
          var pdfColor = PDFLib.rgb(color.r / 255, color.g / 255, color.b / 255);

          switch (ann.type) {
            case 'pen':
              if (ann.points && ann.points.length > 1) {
                for (var j = 1; j < ann.points.length; j++) {
                  page.drawLine({
                    start: { x: ann.points[j - 1].x, y: pageH - ann.points[j - 1].y },
                    end: { x: ann.points[j].x, y: pageH - ann.points[j].y },
                    thickness: ann.stroke || 2,
                    color: pdfColor,
                  });
                }
              }
              break;
            case 'highlight':
              page.drawRectangle({
                x: ann.rect.x, y: pageH - ann.rect.y - ann.rect.h,
                width: ann.rect.w, height: ann.rect.h,
                color: pdfColor, opacity: 0.3,
              });
              break;
            case 'rect':
              page.drawRectangle({
                x: ann.rect.x, y: pageH - ann.rect.y - ann.rect.h,
                width: ann.rect.w, height: ann.rect.h,
                borderColor: pdfColor, borderWidth: ann.stroke || 2,
              });
              break;
            case 'circle':
              var ecx = ann.rect.x + ann.rect.w / 2;
              var ecy = pageH - ann.rect.y - ann.rect.h / 2;
              page.drawEllipse({
                x: ecx, y: ecy,
                xScale: Math.abs(ann.rect.w / 2), yScale: Math.abs(ann.rect.h / 2),
                borderColor: pdfColor, borderWidth: ann.stroke || 2,
              });
              break;
            case 'line':
            case 'arrow':
              page.drawLine({
                start: { x: ann.start.x, y: pageH - ann.start.y },
                end: { x: ann.end.x, y: pageH - ann.end.y },
                thickness: ann.stroke || 2,
                color: pdfColor,
              });
              if (ann.type === 'arrow') {
                // Arrowhead as two short lines
                var ax2 = ann.end.x, ay2 = pageH - ann.end.y;
                var angle = Math.atan2((pageH - ann.end.y) - (pageH - ann.start.y), ann.end.x - ann.start.x);
                var hl = 10;
                page.drawLine({
                  start: { x: ax2, y: ay2 },
                  end: { x: ax2 - hl * Math.cos(angle - 0.4), y: ay2 - hl * Math.sin(angle - 0.4) },
                  thickness: ann.stroke || 2, color: pdfColor,
                });
                page.drawLine({
                  start: { x: ax2, y: ay2 },
                  end: { x: ax2 - hl * Math.cos(angle + 0.4), y: ay2 - hl * Math.sin(angle + 0.4) },
                  thickness: ann.stroke || 2, color: pdfColor,
                });
              }
              break;
            case 'text':
              page.drawText(ann.text, {
                x: ann.pos.x,
                y: pageH - ann.pos.y,
                size: ann.fontSize || 14,
                font: font,
                color: pdfColor,
              });
              break;
            case 'stamp':
              page.drawText(ann.text, {
                x: ann.pos.x,
                y: pageH - ann.pos.y,
                size: 18,
                font: fontBold,
                color: pdfColor,
              });
              // Stamp border
              var stm = fontBold.widthOfTextAtSize(ann.text, 18);
              page.drawRectangle({
                x: ann.pos.x - 8,
                y: pageH - ann.pos.y - 6,
                width: stm + 16,
                height: 26,
                borderColor: pdfColor, borderWidth: 2,
              });
              break;
            case 'signature':
            case 'image':
              if (ann.imgData) {
                try {
                  var imgEmbed;
                  if (ann.imgData.indexOf('data:image/png') === 0) {
                    var base64 = ann.imgData.split(',')[1];
                    var bytes = Uint8Array.from(atob(base64), function (c) { return c.charCodeAt(0); });
                    imgEmbed = await pdfDoc.embedPng(bytes);
                  } else {
                    var resp = await fetch(ann.imgData);
                    var arrBuf = await resp.arrayBuffer();
                    try {
                      imgEmbed = await pdfDoc.embedPng(new Uint8Array(arrBuf));
                    } catch (_) {
                      imgEmbed = await pdfDoc.embedJpg(new Uint8Array(arrBuf));
                    }
                  }
                  page.drawImage(imgEmbed, {
                    x: ann.rect.x,
                    y: pageH - ann.rect.y - ann.rect.h,
                    width: ann.rect.w,
                    height: ann.rect.h,
                  });
                } catch (imgErr) {
                  console.warn('Could not embed image:', imgErr);
                }
              }
              break;
          }
        }

        if (pi % 5 === 0) await yieldToMain();
      }

      showProgress(90, t('processing'));
      var savedBytes = await pdfDoc.save();
      showProgress(100, t('processing'));

      var originalName = state.files[0].name.replace(/\.pdf$/i, '');
      showResult(savedBytes, originalName + '_annotated.pdf', 'application/pdf', state.files[0].size);
      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Annotate error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : { r: 239, g: 68, b: 68 };
  }

  // ==================
  // FORMS (AcroForm)
  // ==================
  var formsPdfDocRef = null;  // pdfjs doc for preview
  var formsPdfLibDoc = null;  // pdf-lib doc for reading fields
  var formsCanvasEl = null;
  var formsFieldsWrap = null;
  var formsScale = 1;

  function loadFormPreview(fileData) {
    state.formsFields = [];
    state.formsCurrentPage = 0;
    state.formsTotalPages = 0;
    formsPdfLibDoc = null;

    // Load with pdf-lib to inspect form fields
    PDFLib.PDFDocument.load(fileData.slice(), { ignoreEncryption: true }).then(function (pdfLibDoc) {
      formsPdfLibDoc = pdfLibDoc;
      var form;
      try { form = pdfLibDoc.getForm(); } catch (e) { form = null; }

      if (!form) {
        showToast(t('formsNoFields'));
        return;
      }

      var fields = form.getFields();
      if (fields.length === 0) {
        showToast(t('formsNoFields'));
        return;
      }

      // Extract field info
      state.formsFields = [];
      fields.forEach(function (field) {
        var fieldType = null;
        var value = '';

        if (field instanceof PDFLib.PDFTextField) {
          fieldType = 'text';
          value = field.getText() || '';
        } else if (field instanceof PDFLib.PDFCheckBox) {
          fieldType = 'checkbox';
          value = field.isChecked();
        } else if (field instanceof PDFLib.PDFRadioGroup) {
          fieldType = 'radio';
          value = field.getSelected() || '';
        } else if (field instanceof PDFLib.PDFDropdown) {
          fieldType = 'dropdown';
          value = field.getSelected() || [];
        }

        if (!fieldType) return;

        // Get widgets (visual representations on pages)
        var widgets = field.acroField.getWidgets();
        widgets.forEach(function (widget) {
          var rect = widget.getRectangle();
          var pageRef = widget.P();
          var pageIndex = 0;
          if (pageRef) {
            var pages = pdfLibDoc.getPages();
            for (var pi = 0; pi < pages.length; pi++) {
              if (pages[pi].ref === pageRef) { pageIndex = pi; break; }
            }
          }

          state.formsFields.push({
            name: field.getName(),
            type: fieldType,
            value: value,
            rect: rect,
            pageIndex: pageIndex,
            options: fieldType === 'dropdown' ? (field.getOptions ? field.getOptions() : []) : [],
            radioOptions: fieldType === 'radio' ? (field.getOptions ? field.getOptions() : []) : [],
          });
        });
      });

      // Load pdfjs for rendering
      loadPdfjs().then(function (lib) {
        lib.getDocument({ data: fileData.slice() }).promise.then(function (pdfDoc) {
          formsPdfDocRef = pdfDoc;
          state.formsTotalPages = pdfDoc.numPages;
          ensureFormsUI();
          updateUI();
          renderFormsPage();
          updateFormsNav();
        });
      });
    }).catch(function () {
      showToast(t('errorCorruptPdf'));
    });
  }

  function ensureFormsUI() {
    if (document.getElementById('formsContainer')) return;

    var editorArea = document.getElementById('editorArea');
    if (!editorArea) return;

    var container = document.createElement('div');
    container.id = 'formsContainer';
    container.className = 'forms-container';
    container.hidden = true;

    // Nav bar
    var nav = document.createElement('div');
    nav.className = 'forms-container__nav';

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn--ghost btn--sm';
    prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    prevBtn.addEventListener('click', function () { formsNavigate(-1); });

    var pageLabel = document.createElement('span');
    pageLabel.className = 'forms-container__page-label';
    pageLabel.id = 'formsPageLabel';

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--ghost btn--sm';
    nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    nextBtn.addEventListener('click', function () { formsNavigate(1); });

    var fieldCount = document.createElement('span');
    fieldCount.className = 'forms-container__field-count';
    fieldCount.id = 'formsFieldCount';

    nav.appendChild(prevBtn);
    nav.appendChild(pageLabel);
    nav.appendChild(nextBtn);
    nav.appendChild(fieldCount);

    // Canvas wrapper with overlaid fields
    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'forms-container__canvas-wrap';
    canvasWrap.id = 'formsCanvasWrap';

    formsCanvasEl = document.createElement('canvas');
    formsCanvasEl.className = 'forms-container__canvas';

    formsFieldsWrap = document.createElement('div');
    formsFieldsWrap.className = 'forms-container__fields';
    formsFieldsWrap.id = 'formsFieldsOverlay';

    canvasWrap.appendChild(formsCanvasEl);
    canvasWrap.appendChild(formsFieldsWrap);

    // Options row
    var optionsRow = document.createElement('div');
    optionsRow.className = 'forms-container__options';

    var flattenLabel = document.createElement('label');
    flattenLabel.className = 'options-panel__checkbox';
    var flattenCb = document.createElement('input');
    flattenCb.type = 'checkbox';
    flattenCb.id = 'formsFlattenCb';
    flattenCb.addEventListener('change', function () {
      state.formsFlatten = this.checked;
    });
    var flattenText = document.createElement('span');
    flattenText.textContent = t('formsFlatten');
    flattenLabel.appendChild(flattenCb);
    flattenLabel.appendChild(flattenText);

    var formsSaveBtn = document.createElement('button');
    formsSaveBtn.type = 'button';
    formsSaveBtn.className = 'annotate-toolbar__save';
    formsSaveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M3 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> ' + t('formsBtnText');
    formsSaveBtn.addEventListener('click', function () { saveFormPDF(); });

    optionsRow.appendChild(flattenLabel);
    optionsRow.appendChild(formsSaveBtn);

    container.appendChild(nav);
    container.appendChild(canvasWrap);
    container.appendChild(optionsRow);
    editorArea.appendChild(container);
  }

  var formsUserZoom = 1.0;

  function renderFormsPage() {
    if (!formsPdfDocRef || !formsCanvasEl) return;

    formsPdfDocRef.getPage(state.formsCurrentPage + 1).then(function (page) {
      var viewport = page.getViewport({ scale: 1 });
      var wrapEl = document.getElementById('formsCanvasWrap');
      var containerW = wrapEl ? wrapEl.clientWidth : 0;
      if (containerW < 100) containerW = 600;
      formsScale = (containerW / viewport.width) * formsUserZoom;
      var scaledViewport = page.getViewport({ scale: formsScale });

      formsCanvasEl.width = Math.floor(scaledViewport.width);
      formsCanvasEl.height = Math.floor(scaledViewport.height);

      var ctx = formsCanvasEl.getContext('2d');
      page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
        renderFormFields();
      });
    });
  }

  function renderFormFields() {
    if (!formsFieldsWrap) return;
    formsFieldsWrap.innerHTML = '';
    formsFieldsWrap.style.width = formsCanvasEl.width + 'px';
    formsFieldsWrap.style.height = formsCanvasEl.height + 'px';

    var pageFields = state.formsFields.filter(function (f) {
      return f.pageIndex === state.formsCurrentPage;
    });

    // Get page mediaBox for Y coordinate conversion
    if (!formsPdfLibDoc) return;
    var pages = formsPdfLibDoc.getPages();
    var page = pages[state.formsCurrentPage];
    if (!page) return;
    var mb = page.getMediaBox();

    pageFields.forEach(function (field, idx) {
      var r = field.rect;
      // Convert PDF coords (bottom-up) to screen coords (top-down)
      var left = (r.x - mb.x) * formsScale;
      var bottom = (r.y - mb.y) * formsScale;
      var width = r.width * formsScale;
      var height = r.height * formsScale;
      var top = formsCanvasEl.height - bottom - height;

      var el;

      if (field.type === 'text') {
        el = document.createElement('input');
        el.type = 'text';
        el.value = field.value || '';
        el.placeholder = field.name;
        el.className = 'forms-field forms-field--text';
        (function (f) {
          el.addEventListener('input', function () { f.value = this.value; });
        })(field);
      } else if (field.type === 'checkbox') {
        el = document.createElement('input');
        el.type = 'checkbox';
        el.checked = !!field.value;
        el.className = 'forms-field forms-field--checkbox';
        (function (f) {
          el.addEventListener('change', function () { f.value = this.checked; });
        })(field);
      } else if (field.type === 'dropdown') {
        el = document.createElement('select');
        el.className = 'forms-field forms-field--dropdown';
        var emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '—';
        el.appendChild(emptyOpt);
        (field.options || []).forEach(function (opt) {
          var o = document.createElement('option');
          o.value = opt;
          o.textContent = opt;
          if (Array.isArray(field.value) ? field.value.indexOf(opt) >= 0 : field.value === opt) {
            o.selected = true;
          }
          el.appendChild(o);
        });
        (function (f) {
          el.addEventListener('change', function () { f.value = this.value; });
        })(field);
      } else if (field.type === 'radio') {
        el = document.createElement('input');
        el.type = 'radio';
        el.name = 'form_radio_' + field.name;
        el.className = 'forms-field forms-field--radio';
        el.checked = false;
        (function (f) {
          el.addEventListener('change', function () {
            if (this.checked) f.value = f.name;
          });
        })(field);
      }

      if (el) {
        el.style.position = 'absolute';
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.title = field.name;
        formsFieldsWrap.appendChild(el);
      }
    });

    // Update field count
    var countEl = document.getElementById('formsFieldCount');
    if (countEl) {
      countEl.textContent = t('formsFieldCount') + ' ' + state.formsFields.length;
    }
  }

  function formsNavigate(delta) {
    var newPage = state.formsCurrentPage + delta;
    if (newPage < 0 || newPage >= state.formsTotalPages) return;
    state.formsCurrentPage = newPage;
    renderFormsPage();
    updateFormsNav();
  }

  function updateFormsNav() {
    var label = document.getElementById('formsPageLabel');
    if (label) {
      label.textContent = t('cropPageNav') + ' ' + (state.formsCurrentPage + 1) + ' / ' + state.formsTotalPages;
    }
  }

  async function saveFormPDF() {
    if (state.files.length === 0) {
      showToast(t('errorNoFiles'));
      return;
    }
    if (state.formsFields.length === 0) {
      showToast(t('formsNoFields'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      showProgress(0, t('processing'));
      var pdfDoc = await PDFLib.PDFDocument.load(state.files[0].data, { ignoreEncryption: true });
      var form = pdfDoc.getForm();

      showProgress(30, t('processing'));

      // Apply field values
      state.formsFields.forEach(function (fieldInfo) {
        try {
          var field;
          if (fieldInfo.type === 'text') {
            field = form.getTextField(fieldInfo.name);
            if (field) field.setText(fieldInfo.value || '');
          } else if (fieldInfo.type === 'checkbox') {
            field = form.getCheckBox(fieldInfo.name);
            if (field) {
              if (fieldInfo.value) field.check();
              else field.uncheck();
            }
          } else if (fieldInfo.type === 'radio') {
            field = form.getRadioGroup(fieldInfo.name);
            if (field && fieldInfo.value) field.select(fieldInfo.value);
          } else if (fieldInfo.type === 'dropdown') {
            field = form.getDropdown(fieldInfo.name);
            if (field && fieldInfo.value) field.select(fieldInfo.value);
          }
        } catch (e) {
          console.warn('Could not set field:', fieldInfo.name, e);
        }
      });

      showProgress(70, t('processing'));

      if (state.formsFlatten) {
        form.flatten();
      }

      showProgress(90, t('processing'));
      var savedBytes = await pdfDoc.save();
      showProgress(100, t('processing'));

      var originalName = state.files[0].name.replace(/\.pdf$/i, '');
      showResult(savedBytes, originalName + '_filled.pdf', 'application/pdf', state.files[0].size);
      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Forms error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
  }

  // ==================
  // CROP
  // ==================
  var cropPdfDocRef = null;  // pdfjs doc for preview
  var cropCanvasEl = null;
  var cropOverlayEl = null;
  var cropDragging = false;
  var cropStartX = 0, cropStartY = 0;
  var cropScale = 1;

  function loadCropPreview(fileData) {
    state.cropCurrentPage = 0;
    state.cropRect = null;
    state.cropTotalPages = 0;

    loadPdfjs().then(function (lib) {
      lib.getDocument({ data: fileData.slice() }).promise.then(function (pdfDoc) {
        cropPdfDocRef = pdfDoc;
        state.cropTotalPages = pdfDoc.numPages;
        ensureCropUI();
        updateUI();
        renderCropPage();
        updateCropNav();
      }).catch(function () {
        showToast(t('errorCorruptPdf'));
      });
    });
  }

  function ensureCropUI() {
    if (document.getElementById('cropContainer')) return;

    var editorArea = document.getElementById('editorArea');
    if (!editorArea) return;

    var container = document.createElement('div');
    container.id = 'cropContainer';
    container.className = 'crop-container';
    container.hidden = true;

    // Nav bar
    var nav = document.createElement('div');
    nav.className = 'crop-container__nav';

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'btn btn--ghost btn--sm';
    prevBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    prevBtn.addEventListener('click', function () { cropNavigate(-1); });

    var pageLabel = document.createElement('span');
    pageLabel.className = 'crop-container__page-label';
    pageLabel.id = 'cropPageLabel';

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'btn btn--ghost btn--sm';
    nextBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    nextBtn.addEventListener('click', function () { cropNavigate(1); });

    nav.appendChild(prevBtn);
    nav.appendChild(pageLabel);
    nav.appendChild(nextBtn);

    // Hint
    var hint = document.createElement('p');
    hint.className = 'crop-container__hint';
    hint.textContent = t('cropHint');

    // Canvas wrapper (for crop drawing)
    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'crop-container__canvas-wrap';
    canvasWrap.id = 'cropCanvasWrap';

    cropCanvasEl = document.createElement('canvas');
    cropCanvasEl.className = 'crop-container__canvas';
    cropCanvasEl.id = 'cropCanvas';

    cropOverlayEl = document.createElement('canvas');
    cropOverlayEl.className = 'crop-container__overlay';
    cropOverlayEl.id = 'cropOverlay';

    // Mouse/touch events on overlay for drawing crop rect
    cropOverlayEl.addEventListener('mousedown', onCropMouseDown);
    cropOverlayEl.addEventListener('mousemove', onCropMouseMove);
    cropOverlayEl.addEventListener('mouseup', onCropMouseUp);
    cropOverlayEl.addEventListener('mouseleave', onCropMouseUp);
    // Touch
    cropOverlayEl.addEventListener('touchstart', onCropTouchStart, { passive: false });
    cropOverlayEl.addEventListener('touchmove', onCropTouchMove, { passive: false });
    cropOverlayEl.addEventListener('touchend', onCropMouseUp);

    canvasWrap.appendChild(cropCanvasEl);
    canvasWrap.appendChild(cropOverlayEl);

    // Options row
    var optionsRow = document.createElement('div');
    optionsRow.className = 'crop-container__options';

    var applyAllLabel = document.createElement('label');
    applyAllLabel.className = 'options-panel__checkbox';
    var applyAllCb = document.createElement('input');
    applyAllCb.type = 'checkbox';
    applyAllCb.id = 'cropApplyAll';
    applyAllCb.checked = true;
    applyAllCb.addEventListener('change', function () {
      state.cropApplyAll = this.checked;
    });
    var applyAllText = document.createElement('span');
    applyAllText.textContent = t('cropApplyAll');
    applyAllLabel.appendChild(applyAllCb);
    applyAllLabel.appendChild(applyAllText);

    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn--ghost btn--sm';
    resetBtn.textContent = t('cropReset');
    resetBtn.addEventListener('click', function () {
      state.cropRect = null;
      drawCropOverlay();
    });

    var cropSaveBtn = document.createElement('button');
    cropSaveBtn.type = 'button';
    cropSaveBtn.className = 'annotate-toolbar__save';
    cropSaveBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v9M3 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1 12h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> ' + t('cropBtnText');
    cropSaveBtn.addEventListener('click', function () { cropPDF(); });

    optionsRow.appendChild(applyAllLabel);
    optionsRow.appendChild(resetBtn);
    optionsRow.appendChild(cropSaveBtn);

    container.appendChild(nav);
    container.appendChild(hint);
    container.appendChild(canvasWrap);
    container.appendChild(optionsRow);
    editorArea.appendChild(container);
  }

  var cropUserZoom = 1.0;

  function renderCropPage() {
    if (!cropPdfDocRef || !cropCanvasEl) return;

    cropPdfDocRef.getPage(state.cropCurrentPage + 1).then(function (page) {
      var viewport = page.getViewport({ scale: 1 });
      var wrapEl = document.getElementById('cropCanvasWrap');
      var containerW = wrapEl ? wrapEl.clientWidth : 0;
      if (containerW < 100) containerW = 600;
      cropScale = (containerW / viewport.width) * cropUserZoom;
      var scaledViewport = page.getViewport({ scale: cropScale });

      cropCanvasEl.width = Math.floor(scaledViewport.width);
      cropCanvasEl.height = Math.floor(scaledViewport.height);
      cropOverlayEl.width = cropCanvasEl.width;
      cropOverlayEl.height = cropCanvasEl.height;

      var ctx = cropCanvasEl.getContext('2d');
      page.render({ canvasContext: ctx, viewport: scaledViewport }).promise.then(function () {
        drawCropOverlay();
      });
    });
  }

  function drawCropOverlay() {
    if (!cropOverlayEl) return;
    var ctx = cropOverlayEl.getContext('2d');
    var w = cropOverlayEl.width;
    var h = cropOverlayEl.height;
    ctx.clearRect(0, 0, w, h);

    if (!state.cropRect) return;

    // Darken outside crop area
    var r = state.cropRect;
    var sx = r.x * cropScale;
    var sy = r.y * cropScale;
    var sw = r.w * cropScale;
    var sh = r.h * cropScale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    // Top
    ctx.fillRect(0, 0, w, sy);
    // Bottom
    ctx.fillRect(0, sy + sh, w, h - sy - sh);
    // Left
    ctx.fillRect(0, sy, sx, sh);
    // Right
    ctx.fillRect(sx + sw, sy, w - sx - sw, sh);

    // Border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(sx, sy, sw, sh);
    ctx.setLineDash([]);

    // Corner handles
    var hs = 6;
    ctx.fillStyle = '#ef4444';
    [[sx, sy], [sx + sw, sy], [sx, sy + sh], [sx + sw, sy + sh]].forEach(function (p) {
      ctx.fillRect(p[0] - hs / 2, p[1] - hs / 2, hs, hs);
    });

    // Dimensions label
    var cropW = Math.round(r.w * 72 / 72); // already in points
    var cropH = Math.round(r.h * 72 / 72);
    var dimText = cropW + ' × ' + cropH + ' pt';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText(dimText, sx + sw / 2, sy > 18 ? sy - 6 : sy + sh + 16);
  }

  function onCropMouseDown(e) {
    var rect = cropOverlayEl.getBoundingClientRect();
    cropStartX = (e.clientX - rect.left) / cropScale;
    cropStartY = (e.clientY - rect.top) / cropScale;
    cropDragging = true;
    state.cropRect = { x: cropStartX, y: cropStartY, w: 0, h: 0 };
  }

  function onCropMouseMove(e) {
    if (!cropDragging) return;
    var rect = cropOverlayEl.getBoundingClientRect();
    var curX = (e.clientX - rect.left) / cropScale;
    var curY = (e.clientY - rect.top) / cropScale;

    var x = Math.min(cropStartX, curX);
    var y = Math.min(cropStartY, curY);
    var w = Math.abs(curX - cropStartX);
    var h = Math.abs(curY - cropStartY);

    // Clamp to canvas bounds (in PDF points)
    var maxW = cropOverlayEl.width / cropScale;
    var maxH = cropOverlayEl.height / cropScale;
    if (x < 0) { w += x; x = 0; }
    if (y < 0) { h += y; y = 0; }
    if (x + w > maxW) w = maxW - x;
    if (y + h > maxH) h = maxH - y;

    state.cropRect = { x: x, y: y, w: w, h: h };
    drawCropOverlay();
  }

  function onCropMouseUp() {
    cropDragging = false;
    if (state.cropRect && state.cropRect.w < 5 && state.cropRect.h < 5) {
      state.cropRect = null;
      drawCropOverlay();
    }
  }

  function onCropTouchStart(e) {
    e.preventDefault();
    var touch = e.touches[0];
    var rect = cropOverlayEl.getBoundingClientRect();
    cropStartX = (touch.clientX - rect.left) / cropScale;
    cropStartY = (touch.clientY - rect.top) / cropScale;
    cropDragging = true;
    state.cropRect = { x: cropStartX, y: cropStartY, w: 0, h: 0 };
  }

  function onCropTouchMove(e) {
    e.preventDefault();
    if (!cropDragging) return;
    var touch = e.touches[0];
    var fakeEvent = { clientX: touch.clientX, clientY: touch.clientY };
    onCropMouseMove(fakeEvent);
  }

  function cropNavigate(delta) {
    var newPage = state.cropCurrentPage + delta;
    if (newPage < 0 || newPage >= state.cropTotalPages) return;
    state.cropCurrentPage = newPage;
    renderCropPage();
    updateCropNav();
  }

  function updateCropNav() {
    var label = document.getElementById('cropPageLabel');
    if (label) {
      label.textContent = t('cropPageNav') + ' ' + (state.cropCurrentPage + 1) + ' / ' + state.cropTotalPages;
    }
  }

  async function cropPDF() {
    if (state.files.length === 0) {
      showToast(t('errorNoFiles'));
      return;
    }
    if (!state.cropRect || state.cropRect.w < 1 || state.cropRect.h < 1) {
      showToast(t('cropHint'));
      return;
    }

    state.processing = true;
    updateUI();
    hideResult();

    try {
      showProgress(0, t('processing'));
      var pdfDoc = await PDFLib.PDFDocument.load(state.files[0].data, { ignoreEncryption: true });
      var pages = pdfDoc.getPages();
      var totalPages = pages.length;

      for (var i = 0; i < totalPages; i++) {
        showProgress(((i + 1) / totalPages) * 90, t('processingPage') + ' ' + (i + 1) + '/' + totalPages);

        if (state.cropApplyAll || i === state.cropCurrentPage) {
          var page = pages[i];
          var mb = page.getMediaBox();
          var r = state.cropRect;

          // Convert screen coords to PDF coords (PDF Y is bottom-up)
          var pdfX = mb.x + r.x;
          var pdfY = mb.y + (mb.height - r.y - r.h);
          var pdfW = r.w;
          var pdfH = r.h;

          page.setCropBox(pdfX, pdfY, pdfW, pdfH);
        }

        if (i % 10 === 0) await yieldToMain();
      }

      showProgress(95, t('processing'));
      var croppedBytes = await pdfDoc.save();
      showProgress(100, t('processing'));

      var originalName = state.files[0].name.replace(/\.pdf$/i, '');
      showResult(croppedBytes, originalName + '_cropped.pdf', 'application/pdf', state.files[0].size);
      showToast(t('toastSuccess'));
    } catch (err) {
      console.error('Crop error:', err);
      showToast(t('errorGeneric'));
    }

    state.processing = false;
    hideProgress();
    updateUI();
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
      case 'crop': cropPDF(); break;
      case 'forms': saveFormPDF(); break;
      case 'annotate': saveAnnotatedPDF(); break;
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
