// ============================================
// FormattedAI — JS Minifier & Prettifier Logic
// Vendor globals: Terser, js_beautify_mod
// ============================================

(function() {
  'use strict';

  // --- Vendor resolution ---
  var beautify = (typeof js_beautify_mod !== 'undefined')
    ? (js_beautify_mod.js_beautify || js_beautify_mod.default || js_beautify_mod)
    : null;

  // --- State ---
  var mode = 'minify'; // 'minify' or 'prettify'
  var vendorReady = false;

  // --- DOM refs ---
  var codeInput       = document.getElementById('codeInput');
  var codeOutput      = document.getElementById('codeOutput');
  var processBtn      = document.getElementById('processBtn');
  var copyBtn         = document.getElementById('copyBtn');
  var downloadBtn     = document.getElementById('downloadBtn');
  var clearBtn        = document.getElementById('clearBtn');
  var modeMinifyBtn   = document.getElementById('modeMinifyBtn');
  var modePrettifyBtn = document.getElementById('modePrettifyBtn');
  var inputSize       = document.getElementById('inputSize');
  var outputSize      = document.getElementById('outputSize');
  var savingsBadge    = document.getElementById('savingsBadge');
  var charCount       = document.getElementById('charCount');
  var toast           = document.getElementById('toast');

  // --- Vendor readiness ---
  function checkVendor() {
    var terserOk = (typeof Terser !== 'undefined' && typeof Terser.minify === 'function');
    var beautifyOk = (typeof beautify === 'function');

    if (!beautifyOk && typeof js_beautify_mod !== 'undefined') {
      beautify = js_beautify_mod.js_beautify || js_beautify_mod.default || js_beautify_mod;
      beautifyOk = (typeof beautify === 'function');
    }

    vendorReady = terserOk && beautifyOk;
    return vendorReady;
  }

  function waitForVendor() {
    if (checkVendor()) {
      enableUI();
      return;
    }

    processBtn.disabled = true;
    processBtn.setAttribute('aria-busy', 'true');

    var attempts = 0;
    var maxAttempts = 50; // 5 seconds max
    var poll = setInterval(function() {
      attempts++;
      if (checkVendor()) {
        clearInterval(poll);
        enableUI();
      } else if (attempts >= maxAttempts) {
        clearInterval(poll);
        processBtn.setAttribute('aria-busy', 'false');
        // Leave disabled — vendors failed to load
      }
    }, 100);
  }

  function enableUI() {
    processBtn.disabled = false;
    processBtn.setAttribute('aria-busy', 'false');
  }

  // --- Mode toggle ---
  function setMode(newMode) {
    mode = newMode;
    modeMinifyBtn.classList.toggle('active', mode === 'minify');
    modePrettifyBtn.classList.toggle('active', mode === 'prettify');
    modeMinifyBtn.setAttribute('aria-checked', mode === 'minify');
    modePrettifyBtn.setAttribute('aria-checked', mode === 'prettify');

    // Re-process if there's input and output already exists
    if (codeInput.value.trim() && codeOutput.value) {
      processCode();
    }
  }

  // --- Process function ---
  async function processCode() {
    var input = codeInput.value.trim();
    if (!input) return;
    if (!vendorReady) return;

    processBtn.disabled = true;
    processBtn.setAttribute('aria-busy', 'true');

    try {
      var result;

      if (mode === 'minify') {
        var output = await Terser.minify(input, {
          compress: true,
          mangle: true,
          output: { comments: false }
        });
        if (output.error) throw output.error;
        result = output.code;
      } else {
        result = beautify(input, {
          indent_size: 2,
          space_in_empty_paren: true,
          preserve_newlines: true,
          max_preserve_newlines: 2
        });
      }

      codeOutput.value = result;
      updateStats(input, result);
    } catch (err) {
      codeOutput.value = '// Error: ' + (err.message || String(err));
      updateStats(input, '');
    } finally {
      processBtn.disabled = false;
      processBtn.setAttribute('aria-busy', 'false');
    }
  }

  // --- Stats ---
  function updateStats(input, output) {
    var inputBytes = input ? new Blob([input]).size : 0;
    var outputBytes = output ? new Blob([output]).size : 0;
    var savings = (inputBytes > 0 && outputBytes > 0)
      ? ((1 - outputBytes / inputBytes) * 100).toFixed(1)
      : '0.0';

    if (inputSize) inputSize.textContent = formatSize(inputBytes);
    if (outputSize) outputSize.textContent = formatSize(outputBytes);

    if (savingsBadge) {
      var savingsNum = parseFloat(savings);
      if (inputBytes > 0 && outputBytes > 0) {
        savingsBadge.textContent = (savingsNum >= 0 ? '-' : '+') + Math.abs(savingsNum) + '%';
        savingsBadge.hidden = false;
      } else {
        savingsBadge.textContent = '';
        savingsBadge.hidden = true;
      }
    }

    if (charCount) {
      charCount.textContent = (input ? input.length : 0) + ' ' + t('chars');
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  // --- Copy ---
  async function copyOutput() {
    var text = codeOutput.value;
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      codeOutput.select();
      document.execCommand('copy');
    }

    showToast(t('copySuccess'));
    if (copyBtn) {
      copyBtn.classList.add('btn--success');
      setTimeout(function() { copyBtn.classList.remove('btn--success'); }, 1500);
    }
  }

  // --- Download ---
  function downloadOutput() {
    var text = codeOutput.value;
    if (!text) return;

    var ext = (mode === 'minify') ? '.min.js' : '.js';
    var blob = new Blob([text], { type: 'text/javascript' });
    triggerDownload(blob, 'output' + ext);
    showToast(t('downloadSuccess'));
  }

  function triggerDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Clear ---
  function clearAll() {
    codeInput.value = '';
    codeOutput.value = '';
    updateStats('', '');
    codeInput.focus();
  }

  // --- Drag & Drop ---
  function setupDragDrop() {
    var dragCounter = 0;

    codeInput.addEventListener('dragover', function(e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });

    codeInput.addEventListener('dragenter', function(e) {
      e.preventDefault();
      dragCounter++;
      codeInput.classList.add('textarea--dragover');
    });

    codeInput.addEventListener('dragleave', function() {
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        codeInput.classList.remove('textarea--dragover');
      }
    });

    codeInput.addEventListener('drop', function(e) {
      e.preventDefault();
      dragCounter = 0;
      codeInput.classList.remove('textarea--dragover');

      var files = e.dataTransfer.files;
      if (files.length === 0) return;

      var file = files[0];
      // Accept .js, .mjs, .cjs, .ts, .jsx, .tsx and text files
      var validExts = ['.js', '.mjs', '.cjs', '.ts', '.jsx', '.tsx', '.txt'];
      var fileName = file.name.toLowerCase();
      var isValid = validExts.some(function(ext) {
        return fileName.endsWith(ext);
      });

      if (!isValid && !file.type.startsWith('text/')) {
        showToast(t('invalidFileType'));
        return;
      }

      // Limit file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        showToast(t('fileTooLarge'));
        return;
      }

      var reader = new FileReader();
      reader.onload = function(ev) {
        codeInput.value = ev.target.result;
        updateStats(ev.target.result, '');
      };
      reader.readAsText(file);
    });
  }

  // --- Toast ---
  function showToast(message) {
    if (!toast) return;
    var toastText = toast.querySelector('.toast__text');
    if (toastText) toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2500);
  }

  // --- About Modal ---
  function setupAboutModal() {
    var aboutTrigger = document.getElementById('aboutTrigger');
    var aboutModal = document.getElementById('aboutModal');
    var aboutModalClose = document.getElementById('aboutModalClose');

    if (!aboutTrigger || !aboutModal) return;

    function openAboutModal() {
      aboutModal.hidden = false;
      requestAnimationFrame(function() { aboutModal.classList.add('show'); });
    }

    function closeAboutModal() {
      aboutModal.classList.remove('show');
      setTimeout(function() { aboutModal.hidden = true; }, 200);
    }

    aboutTrigger.addEventListener('click', openAboutModal);
    if (aboutModalClose) {
      aboutModalClose.addEventListener('click', closeAboutModal);
    }
    aboutModal.addEventListener('click', function(e) {
      if (e.target === aboutModal) closeAboutModal();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !aboutModal.hidden) closeAboutModal();
    });
  }

  // --- Event Listeners ---
  processBtn.addEventListener('click', processCode);

  if (copyBtn) copyBtn.addEventListener('click', copyOutput);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadOutput);
  if (clearBtn) clearBtn.addEventListener('click', clearAll);

  modeMinifyBtn.addEventListener('click', function() { setMode('minify'); });
  modePrettifyBtn.addEventListener('click', function() { setMode('prettify'); });

  // Update char count on input
  codeInput.addEventListener('input', function() {
    var text = codeInput.value;
    if (charCount) {
      charCount.textContent = text.length + ' ' + t('chars');
    }
  });

  // Keyboard shortcut: Ctrl+Enter to process
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      processCode();
    }
  });

  // --- Setup ---
  setupDragDrop();
  setupAboutModal();

  // --- Init ---
  setMode('minify');
  updateStats('', '');
  waitForVendor();
})();
