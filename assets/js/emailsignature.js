/* FormattedAI - Email Signature Builder
 * Vanilla ES2020. No deps. Builds canvas WYSIWYG -> email-safe HTML
 * (tables + inline CSS + MSO conditionals + VML buttons).
 */
(function () {
  'use strict';

  // ----------------------------------------
  // i18n
  // ----------------------------------------
  const T = {
    pl: {
      navTools: 'Narzedzia', navArticles: 'Artykuly', navAbout: 'O nas',
      navPrivacy: 'Prywatnosc', navContact: 'Kontakt',
      toolHeaderDesc: 'kreator stopek mailowych - zgodny z Outlook/Gmail/Thunderbird',
      paletteTitle: 'Bloki', paletteLayouts: 'Uklady', paletteTemplates: 'Szablony',
      blockText: 'Tekst', blockImage: 'Obraz', blockButton: 'Przycisk',
      blockDivider: 'Linia', blockSpacer: 'Odstep', blockSocial: 'Social',
      blockColumns2: 'Kolumny 2', blockColumns3: 'Kolumny 3',
      tplBasic: 'Podstawowy', tplWithLogo: 'Z logo', tplCorporate: 'Korporacyjny', tplMinimal: 'Minimalny',
      canvasEmptyTitle: 'Twoja stopka jest pusta',
      canvasEmptySub: 'Kliknij blok po lewej, aby dodac element. Kliknij blok na canvasie, aby edytowac.',
      colEmpty: 'Upusc blok tutaj',
      inspectorEmptyTitle: 'Wybierz blok',
      inspectorEmptySub: 'Kliknij dowolny element na canvasie, aby zmienic jego kolor, tekst, link i odstepy.',
      previewBtn: 'Podglad', copyBtn: 'Kopiuj HTML', downloadBtn: 'Pobierz', resetBtn: 'Wyczysc',
      undoBtn: 'Cofnij', redoBtn: 'Ponow',
      previewTitle: 'Podglad i HTML', tabPreview: 'Podglad', tabCode: 'HTML',
      copySuccess: 'Skopiowano HTML stopki!',
      footerBadge: 'Zero uploadow',
      mobileGateTitle: 'Otworz na komputerze',
      mobileGateSub: 'Kreator stopek wymaga ekranu min. 1024px szerokosci. Otworz strone na laptopie lub komputerze.',
      labelText: 'Tekst', labelColor: 'Kolor', labelBgColor: 'Tlo',
      labelFontSize: 'Rozmiar', labelFontWeight: 'Grubosc',
      labelAlign: 'Wyrownanie', labelLink: 'Link (URL)',
      labelImageUrl: 'URL obrazka', labelImageWidth: 'Szerokosc',
      labelImageAlt: 'Opis (alt)', labelButtonText: 'Tekst przycisku',
      labelPadding: 'Padding', labelHeight: 'Wysokosc', labelThickness: 'Grubosc',
      labelUploadImage: 'Wgraj plik', labelOrUseUrl: 'lub wklej URL',
      labelGradient: 'Gradient', labelGradientStart: 'Kolor 1', labelGradientEnd: 'Kolor 2',
      labelGradientDir: 'Kierunek',
      labelColumns: 'Kolumny', labelColWidth: 'Szerokosc kolumny',
      labelGap: 'Odstep miedzy kolumnami',
      labelFontFamily: 'Czcionka', labelBgImage: 'Tlo (URL obrazka)', labelInnerPad: 'Wewn. padding',
      labelZoom: 'Zoom', labelDevice: 'Widok',
      deviceDesktop: 'Desktop', deviceMobile: 'Mobile',
      canvasSettings: 'Ustawienia stopki', labelWidth: 'Szerokosc',
      canvasInfo: 'Max 600px - powyzej Outlook ucina. Wysokosc rosnie automatycznie z blokow.',
      hintTip: 'Wskazowka',
      hintDrag: 'Przeciagnij blok z palety na canvas, aby dodac w dowolnym miejscu.',
      hintEdit: 'Kliknij blok 2x, zeby edytowac tekst inline.',
      hintResize: 'Zaznaczony blok ma uchwyty na krawedziach - przeciagnij myszka aby zmienic padding.',
      hintArrows: 'Strzalki przesuwaja zaznaczony blok o 1px (Shift = 10px).',
      hintFreeMove: 'Przeciagnij srodek bloku myszka aby przesunac swobodnie. Pasek u gory bloku przeciaga w stack.',
      labelOffsetX: 'Pozycja X', labelPosition: 'Pozycja',
      labelAspectLock: 'Proporcje', aspectLocked: 'Zablokowane', aspectFree: 'Wolne',
      labelColumn: 'Kolumna', labelValign: 'Pionowo',
      valignTop: 'Gora', valignMid: 'Srodek', valignBot: 'Dol',
      labelMinHeight: 'Min. wysokosc', labelMaxHeight: 'Max. wysokosc',
      blockColumns4: 'Kolumny 4',
      bcEditing: 'Edytujesz',
      bcSignature: 'Stopka', bcRow: 'Wiersz', bcCol: 'Kol', bcFrame: 'Ramka',
      warnOverflow: 'Przekracza max:',
      labelMode: 'Tryb', modeStack: 'Stos', modeFree: 'Swobodny',
      modeFreeHint: 'Tryb swobodny: rysuj ramki na canvasie myszka. Email konwertuje na tabele.',
      blockFrame: 'Ramka',
      labelX: 'X', labelY: 'Y',
      labelBgSize: 'Rozmiar tla', bgSizeContain: 'Zmiesc', bgSizeCover: 'Wypelnij', bgSizeAuto: 'Auto',
      sizeWidth: 'szer.', sizeHeight: 'wys.',
      labelSocialPlatforms: 'Platformy', labelStyle: 'Styl',
      labelAddSocial: '+ Dodaj platforme',
      socialStylePill: 'Pille', socialStyleText: 'Tekst',
      base64Warn: 'Pliki >20KB jako base64 moga nie wyswietlic w Outlooku. Uzyj URL.',
      weightNormal: 'Normalny', weightBold: 'Pogrubiony',
      alignLeft: 'Lewo', alignCenter: 'Srodek', alignRight: 'Prawo',
      dirLR: 'L-P', dirTB: 'G-D', dirDiag: 'Skos',
      confirmReset: 'Wyczyscic cala stopke? Tej akcji nie da sie cofnac.',
      confirmTemplate: 'Zastapic obecna stopke szablonem? Tej akcji nie da sie cofnac.',
      cantNestColumns: 'Nie mozna zagnezdzac kolumn w kolumnach.'
    },
    en: {
      navTools: 'Tools', navArticles: 'Articles', navAbout: 'About',
      navPrivacy: 'Privacy', navContact: 'Contact',
      toolHeaderDesc: 'email signature builder - works in Outlook/Gmail/Thunderbird',
      paletteTitle: 'Blocks', paletteLayouts: 'Layouts', paletteTemplates: 'Templates',
      blockText: 'Text', blockImage: 'Image', blockButton: 'Button',
      blockDivider: 'Divider', blockSpacer: 'Spacer', blockSocial: 'Social',
      blockColumns2: 'Columns 2', blockColumns3: 'Columns 3',
      tplBasic: 'Basic', tplWithLogo: 'With logo', tplCorporate: 'Corporate', tplMinimal: 'Minimal',
      canvasEmptyTitle: 'Your signature is empty',
      canvasEmptySub: 'Click a block on the left to add it. Click any block on canvas to edit.',
      colEmpty: 'Drop a block here',
      inspectorEmptyTitle: 'Select a block',
      inspectorEmptySub: 'Click any element on canvas to edit its color, text, link, and spacing.',
      previewBtn: 'Preview', copyBtn: 'Copy HTML', downloadBtn: 'Download', resetBtn: 'Clear',
      undoBtn: 'Undo', redoBtn: 'Redo',
      previewTitle: 'Preview & HTML', tabPreview: 'Preview', tabCode: 'HTML',
      copySuccess: 'Signature HTML copied!',
      footerBadge: 'Zero uploads',
      mobileGateTitle: 'Open on desktop',
      mobileGateSub: 'The signature builder requires a screen at least 1024px wide. Open this page on a laptop or desktop.',
      labelText: 'Text', labelColor: 'Color', labelBgColor: 'Background',
      labelFontSize: 'Size', labelFontWeight: 'Weight',
      labelAlign: 'Alignment', labelLink: 'Link (URL)',
      labelImageUrl: 'Image URL', labelImageWidth: 'Width',
      labelImageAlt: 'Alt text', labelButtonText: 'Button text',
      labelPadding: 'Padding', labelHeight: 'Height', labelThickness: 'Thickness',
      labelUploadImage: 'Upload file', labelOrUseUrl: 'or paste URL',
      labelGradient: 'Gradient', labelGradientStart: 'Color 1', labelGradientEnd: 'Color 2',
      labelGradientDir: 'Direction',
      labelColumns: 'Columns', labelColWidth: 'Column width',
      labelGap: 'Gap between columns',
      labelFontFamily: 'Font family', labelBgImage: 'Background image (URL)', labelInnerPad: 'Inner padding',
      labelZoom: 'Zoom', labelDevice: 'View',
      deviceDesktop: 'Desktop', deviceMobile: 'Mobile',
      canvasSettings: 'Signature settings', labelWidth: 'Width',
      canvasInfo: 'Max 600px - Outlook clips above. Height auto-grows with blocks.',
      hintTip: 'Tip',
      hintDrag: 'Drag a block from the palette onto the canvas to drop it anywhere.',
      hintEdit: 'Double-click a block to edit text inline.',
      hintResize: 'A selected block has edge handles - drag with the mouse to change padding.',
      hintArrows: 'Arrow keys move the selected block by 1px (Shift = 10px).',
      hintFreeMove: 'Drag the body of a block to move it freely. The top bar drags it in the stack.',
      labelOffsetX: 'Position X', labelPosition: 'Position',
      labelAspectLock: 'Aspect ratio', aspectLocked: 'Locked', aspectFree: 'Free',
      labelColumn: 'Column', labelValign: 'V-align',
      valignTop: 'Top', valignMid: 'Middle', valignBot: 'Bottom',
      labelMinHeight: 'Min height', labelMaxHeight: 'Max height',
      blockColumns4: 'Columns 4',
      bcEditing: 'Editing',
      bcSignature: 'Signature', bcRow: 'Row', bcCol: 'Col', bcFrame: 'Frame',
      warnOverflow: 'Exceeds max:',
      labelMode: 'Mode', modeStack: 'Stack', modeFree: 'Free',
      modeFreeHint: 'Free mode: draw frames on the canvas with the mouse. Email converts them to tables.',
      blockFrame: 'Frame',
      labelX: 'X', labelY: 'Y',
      labelBgSize: 'Bg size', bgSizeContain: 'Contain', bgSizeCover: 'Cover', bgSizeAuto: 'Auto',
      sizeWidth: 'w', sizeHeight: 'h',
      labelSocialPlatforms: 'Platforms', labelStyle: 'Style',
      labelAddSocial: '+ Add platform',
      socialStylePill: 'Pills', socialStyleText: 'Text',
      base64Warn: 'Files >20KB as base64 may fail in Outlook. Use a URL instead.',
      weightNormal: 'Normal', weightBold: 'Bold',
      alignLeft: 'Left', alignCenter: 'Center', alignRight: 'Right',
      dirLR: 'L-R', dirTB: 'T-B', dirDiag: 'Diag',
      confirmReset: 'Clear the entire signature? This cannot be undone.',
      confirmTemplate: 'Replace current signature with template? This cannot be undone.',
      cantNestColumns: 'Cannot nest columns inside columns.'
    }
  };
  const lang = (document.documentElement.lang || 'pl').toLowerCase().startsWith('en') ? 'en' : 'pl';
  const t = (k) => (T[lang][k] !== undefined ? T[lang][k] : k);

  // ----------------------------------------
  // Constants
  // ----------------------------------------
  const STORAGE_KEY = 'formattedai-signature-model';
  const HISTORY_LIMIT = 50;
  const MAX_SIG_WIDTH = 600;
  const MIN_SIG_WIDTH = 320;
  const SOCIAL_PRESETS = [
    { id: 'linkedin', label: 'LinkedIn', color: '#0a66c2', urlHint: 'https://linkedin.com/in/...' },
    { id: 'twitter',  label: 'Twitter',  color: '#1da1f2', urlHint: 'https://twitter.com/...' },
    { id: 'x',        label: 'X',        color: '#000000', urlHint: 'https://x.com/...' },
    { id: 'facebook', label: 'Facebook', color: '#1877f2', urlHint: 'https://facebook.com/...' },
    { id: 'instagram',label: 'Instagram',color: '#e4405f', urlHint: 'https://instagram.com/...' },
    { id: 'youtube',  label: 'YouTube',  color: '#ff0000', urlHint: 'https://youtube.com/...' },
    { id: 'github',   label: 'GitHub',   color: '#181717', urlHint: 'https://github.com/...' },
    { id: 'web',      label: 'Web',      color: '#6b7280', urlHint: 'https://example.com' }
  ];
  const GRADIENT_DIRS = [
    { v: 'lr',   l: 'dirLR',   css: 'to right',        deg: '90deg' },
    { v: 'tb',   l: 'dirTB',   css: 'to bottom',       deg: '180deg' },
    { v: 'diag', l: 'dirDiag', css: 'to bottom right', deg: '135deg' }
  ];
  const FONT_STACKS = [
    { v: 'system',    l: 'Segoe UI / Arial', css: "'Segoe UI', Arial, sans-serif" },
    { v: 'arial',     l: 'Arial',            css: "Arial, Helvetica, sans-serif" },
    { v: 'helvetica', l: 'Helvetica',        css: "Helvetica, Arial, sans-serif" },
    { v: 'georgia',   l: 'Georgia',          css: "Georgia, 'Times New Roman', serif" },
    { v: 'times',     l: 'Times',            css: "'Times New Roman', Times, serif" },
    { v: 'verdana',   l: 'Verdana',          css: "Verdana, Geneva, sans-serif" },
    { v: 'tahoma',    l: 'Tahoma',           css: "Tahoma, Verdana, sans-serif" },
    { v: 'trebuchet', l: 'Trebuchet',        css: "'Trebuchet MS', sans-serif" },
    { v: 'courier',   l: 'Courier',          css: "'Courier New', Courier, monospace" }
  ];
  const fontCss = (v) => (FONT_STACKS.find((f) => f.v === v) || FONT_STACKS[0]).css;

  // ----------------------------------------
  // State
  // ----------------------------------------
  const defaultModel = () => ({ width: 600, minHeight: 0, maxHeight: 0, valign: 'top', mode: 'stack', blocks: [] });
  const VALIGN_MAP_FLEX = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };

  let model = loadModel() || defaultModel();
  let selectedId = null;
  let selectedColId = null; // mutually exclusive with selectedId
  let activeColTab = 0;     // active per-column tab inside the columns inspector
  let history = [];
  let historyIdx = -1;
  let dragId = null;
  let suppressClick = false;
  let zoomLevel = (() => {
    const v = parseInt(localStorage.getItem('formattedai-signature-zoom') || '100', 10);
    return (isNaN(v) || v < 50 || v > 150) ? 100 : v;
  })();
  let previewDevice = 'desktop';

  function loadModel() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const m = JSON.parse(raw);
      if (m && Array.isArray(m.blocks)) return migrateModel(m);
    } catch (_) {}
    return null;
  }
  // Older saved models may miss fields added in later phases. Backfill with sensible
  // defaults so the inspector renders all controls even on legacy data.
  function migrateModel(m) {
    if (m.valign === undefined)    m.valign = 'top';
    if (m.minHeight === undefined) m.minHeight = 0;
    if (m.maxHeight === undefined) m.maxHeight = 0;
    if (m.width === undefined)     m.width = 600;
    if (m.mode === undefined)      m.mode = 'stack';
    function visit(blocks) {
      for (const b of blocks) {
        if (b.offsetX === undefined) b.offsetX = 0;
        if (b.type === 'columns') {
          if (b.gap === undefined)       b.gap = 12;
          if (b.bgImage === undefined)   b.bgImage = '';
          if (b.bgColor === undefined)   b.bgColor = '';
          if (b.innerPad === undefined)  b.innerPad = 0;
          if (b.minHeight === undefined) b.minHeight = 0;
          if (Array.isArray(b.cols)) {
            for (const col of b.cols) {
              if (col.bgColor === undefined)   col.bgColor = '';
              if (col.bgImage === undefined)   col.bgImage = '';
              if (col.bgSize === undefined)    col.bgSize = 'contain';
              if (col.valign === undefined)    col.valign = 'top';
              if (col.innerPad === undefined)  col.innerPad = 0;
              if (col.minHeight === undefined) col.minHeight = 0;
              if (Array.isArray(col.blocks)) visit(col.blocks);
            }
          }
        }
      }
    }
    visit(m.blocks);
    return m;
  }
  function saveModel() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(model)); } catch (_) {}
  }
  function uid() { return 'b_' + Math.random().toString(36).slice(2, 10); }
  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  // ----------------------------------------
  // Undo / Redo
  // ----------------------------------------
  function pushHistory() {
    history = history.slice(0, historyIdx + 1);
    history.push(deepClone(model));
    if (history.length > HISTORY_LIMIT) history.shift();
    historyIdx = history.length - 1;
  }
  function undo() {
    if (historyIdx <= 0) return;
    historyIdx--;
    model = deepClone(history[historyIdx]);
    selectedId = null;
    selectedColId = null;
    cancelPendingCommit();
    saveModel();
    renderAll();
  }
  function redo() {
    if (historyIdx >= history.length - 1) return;
    historyIdx++;
    model = deepClone(history[historyIdx]);
    selectedId = null;
    selectedColId = null;
    cancelPendingCommit();
    saveModel();
    renderAll();
  }
  function canUndo() { return historyIdx > 0; }
  function canRedo() { return historyIdx < history.length - 1; }

  // Live edit batching: live mutations (typing, slider drag, arrow keys) flip
  // a dirty flag and update the canvas without saving / pushing history. The
  // commit happens on blur / change / debounced inactivity, producing one
  // history entry per logical edit instead of one per keystroke.
  let dirtyAfterCommit = false;
  let commitDebounceTimer = null;
  function commitMutation() {
    if (commitDebounceTimer) { clearTimeout(commitDebounceTimer); commitDebounceTimer = null; }
    if (!dirtyAfterCommit) return;
    pushHistory();
    saveModel();
    dirtyAfterCommit = false;
    updateUndoRedoButtons();
  }
  function commitMutationDebounced(ms) {
    clearTimeout(commitDebounceTimer);
    commitDebounceTimer = setTimeout(() => { commitDebounceTimer = null; commitMutation(); }, ms || 400);
  }
  function cancelPendingCommit() {
    dirtyAfterCommit = false;
    if (commitDebounceTimer) { clearTimeout(commitDebounceTimer); commitDebounceTimer = null; }
  }
  // Validate that current selection ids still exist - mutation can leave them stale.
  function validateSelection() {
    if (selectedId && !findBlockDeep(selectedId)) selectedId = null;
    if (selectedColId && !findColumnById(selectedColId)) selectedColId = null;
  }

  // ----------------------------------------
  // Recursive helpers
  // ----------------------------------------
  function walkBlocks(blocks, fn) {
    for (let i = 0; i < blocks.length; i++) {
      fn(blocks[i], blocks, i);
      if (blocks[i].type === 'columns') {
        for (const col of blocks[i].cols) {
          walkBlocks(col.blocks, fn);
        }
      }
    }
  }
  function findBlockDeep(id) {
    let found = null;
    walkBlocks(model.blocks, (b) => { if (b.id === id) found = b; });
    return found;
  }
  // Returns [containerArray, index] for given block id, or null
  function findContainer(id) {
    let res = null;
    function scan(blocks) {
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].id === id) { res = [blocks, i]; return; }
        if (blocks[i].type === 'columns') {
          for (const col of blocks[i].cols) {
            scan(col.blocks); if (res) return;
          }
        }
      }
    }
    scan(model.blocks);
    return res;
  }
  // Returns parent block info: { type, container } where type is 'root' or 'column'
  function isInsideColumns(id) {
    let inside = false;
    function scan(blocks, depth) {
      for (const b of blocks) {
        if (b.id === id && depth > 0) { inside = true; return; }
        if (b.type === 'columns') {
          for (const col of b.cols) { scan(col.blocks, depth + 1); if (inside) return; }
        }
      }
    }
    scan(model.blocks, 0);
    return inside;
  }

  // ----------------------------------------
  // Block factory
  // ----------------------------------------
  function createBlock(type) {
    const base = { id: uid(), type, paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, offsetX: 0 };
    if (type === 'text') {
      return Object.assign(base, {
        text: lang === 'pl' ? 'Jan Kowalski\nDyrektor Sprzedazy' : 'John Doe\nSales Director',
        color: '#1f2937', fontSize: 14, fontWeight: 'normal', fontFamily: 'system',
        align: 'left', link: ''
      });
    }
    if (type === 'image') {
      return Object.assign(base, {
        url: '', alt: 'logo', width: 120, height: 120, aspectLocked: true,
        link: '', align: 'left'
      });
    }
    if (type === 'button') {
      return Object.assign(base, {
        text: lang === 'pl' ? 'Skontaktuj sie' : 'Get in touch',
        link: 'https://example.com',
        bgColor: '#f97316', textColor: '#ffffff',
        fontSize: 14, fontWeight: 'bold', fontFamily: 'system',
        paddingV: 10, paddingH: 22, align: 'left',
        gradient: { enabled: false, start: '#f97316', end: '#ea580c', dir: 'lr' }
      });
    }
    if (type === 'divider') {
      return Object.assign(base, { color: '#e5e7eb', thickness: 1 });
    }
    if (type === 'spacer') {
      return Object.assign(base, { height: 16, paddingTop: 0, paddingBottom: 0 });
    }
    if (type === 'social') {
      return Object.assign(base, {
        style: 'pill', // 'pill' | 'text'
        align: 'left',
        gap: 8,
        links: [
          { id: uid(), platform: 'linkedin', url: '' },
          { id: uid(), platform: 'github',   url: '' }
        ]
      });
    }
    if (type === 'frame') {
      return {
        id: uid(), type: 'frame',
        x: 0, y: 0, width: 200, height: 80,
        bgColor: '', bgImage: '', innerPad: 8,
        blocks: []
      };
    }
    if (type === 'columns2') {
      return {
        id: uid(), type: 'columns',
        paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, offsetX: 0,
        gap: 12, bgImage: '', bgColor: '', innerPad: 0, minHeight: 0,
        cols: [makeCol(50), makeCol(50)]
      };
    }
    if (type === 'columns3') {
      return {
        id: uid(), type: 'columns',
        paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, offsetX: 0,
        gap: 8, bgImage: '', bgColor: '', innerPad: 0, minHeight: 0,
        cols: [makeCol(33), makeCol(34), makeCol(33)]
      };
    }
    if (type === 'columns4') {
      return {
        id: uid(), type: 'columns',
        paddingTop: 8, paddingRight: 0, paddingBottom: 8, paddingLeft: 0, offsetX: 0,
        gap: 6, bgImage: '', bgColor: '', innerPad: 0, minHeight: 0,
        cols: [makeCol(25), makeCol(25), makeCol(25), makeCol(25)]
      };
    }
    return base;
  }
  // Column factory - keeps the schema in one place so all columnsN presets stay in sync
  function makeCol(width) {
    return {
      id: uid(),
      width,
      bgColor: '',
      bgImage: '',
      bgSize: 'contain', // 'contain' | 'cover' | 'auto' - logo defaults to contain
      valign: 'top',     // 'top' | 'middle' | 'bottom'
      innerPad: 0,
      minHeight: 0,      // 0 = auto (grows with content)
      blocks: []
    };
  }

  // ----------------------------------------
  // Mutations (every mutation pushes history first)
  // ----------------------------------------
  function addBlock(type, parentArr) {
    pushHistory();
    const b = createBlock(type);
    (parentArr || model.blocks).push(b);
    selectedId = b.id;
    selectedColId = null;
    saveModel(); renderAll();
  }
  // Live update: mutates the model and re-renders the canvas only. Does NOT push
  // history or save - that happens on commitMutation() (blur / change / debounce).
  // Multi-keystroke edits coalesce into one history entry.
  function updateBlock(id, patch) {
    const b = findBlockDeep(id);
    if (!b) return;
    Object.assign(b, patch);
    dirtyAfterCommit = true;
    renderCanvas();
    applyZoom();
    updateSizeBadge();
  }
  // Full update: pushes history, saves, re-renders inspector too. Use when the
  // inspector shape itself needs to change (gradient toggle, column add/remove).
  function updateBlockFull(id, patch) {
    const b = findBlockDeep(id);
    if (!b) return;
    commitMutation(); // flush any pending live edit first
    pushHistory();
    Object.assign(b, patch);
    saveModel(); renderAll();
  }
  // Live column update: mirrors updateBlock semantics for a column inside a columns block.
  function updateColumn(blockId, colIdx, patch) {
    const b = findBlockDeep(blockId);
    if (!b || !b.cols || !b.cols[colIdx]) return;
    Object.assign(b.cols[colIdx], patch);
    dirtyAfterCommit = true;
    renderCanvas();
    applyZoom();
    updateSizeBadge();
  }
  // Live model update: top-level model fields (width, valign, mode, minHeight, maxHeight).
  // Same semantics as updateBlock - commit on blur / button click via commitMutation().
  function mutateModel(patch) {
    Object.assign(model, patch);
    dirtyAfterCommit = true;
    renderCanvas();
    applyZoom();
    updateSizeBadge();
  }
  function deleteBlock(id) {
    const loc = findContainer(id);
    if (!loc) return;
    pushHistory();
    loc[0].splice(loc[1], 1);
    if (selectedId === id) selectedId = null;
    // If a column inside the deleted block was selected, drop that selection too.
    if (selectedColId) {
      const stillExists = !!findColumnById(selectedColId);
      if (!stillExists) selectedColId = null;
    }
    saveModel(); renderAll();
  }
  // Find a column by id across the whole model. Returns the column object or null.
  function findColumnById(colId) {
    for (const b of model.blocks) {
      if (b.type === 'columns') {
        for (const col of b.cols) {
          if (col.id === colId) return col;
        }
      }
    }
    return null;
  }
  // Find the parent columns block + colIdx for a given column id.
  // Returns { rowBlock, col, colIdx } or null.
  function findColumnContext(colId) {
    for (const b of model.blocks) {
      if (b.type === 'columns') {
        for (let i = 0; i < b.cols.length; i++) {
          if (b.cols[i].id === colId) return { rowBlock: b, col: b.cols[i], colIdx: i };
        }
      }
    }
    return null;
  }
  // Find { rowBlock, col, colIdx } when a block lives inside a column. Returns null if top-level.
  function findBlockColumnContext(blockId) {
    for (const b of model.blocks) {
      if (b.type === 'columns') {
        for (let i = 0; i < b.cols.length; i++) {
          if (b.cols[i].blocks.some((x) => x.id === blockId)) {
            return { rowBlock: b, col: b.cols[i], colIdx: i };
          }
        }
      }
    }
    return null;
  }
  function moveBlock(id, dir) {
    const loc = findContainer(id);
    if (!loc) return;
    const [arr, i] = loc;
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    pushHistory();
    const [b] = arr.splice(i, 1);
    arr.splice(j, 0, b);
    saveModel(); renderAll();
  }
  function moveBlockTo(draggedId, targetId, before) {
    if (draggedId === targetId) return;
    const isFromPalette = typeof draggedId === 'string' && draggedId.startsWith('__palette:');
    const dst = findContainer(targetId);
    if (!dst) return;
    const [dstArr, dstIdx] = dst;

    if (isFromPalette) {
      const type = draggedId.slice('__palette:'.length);
      // Don't allow columns inside columns
      const isColumnsType = type === 'columns2' || type === 'columns3';
      if (isColumnsType && isContainerInsideColumns(dstArr)) {
        showToast(t('cantNestColumns'));
        return;
      }
      pushHistory();
      const newBlock = createBlock(type);
      let insertIdx = dstIdx + (before ? 0 : 1);
      if (insertIdx > dstArr.length) insertIdx = dstArr.length;
      if (insertIdx < 0) insertIdx = 0;
      dstArr.splice(insertIdx, 0, newBlock);
      selectedId = newBlock.id;
      selectedColId = null;
      saveModel(); renderAll();
      return;
    }

    const src = findContainer(draggedId);
    if (!src) return;
    const [srcArr, srcIdx] = src;
    const moved = srcArr[srcIdx];
    // Don't allow nesting columns inside columns
    if (moved.type === 'columns' && srcArr !== dstArr && isContainerInsideColumns(dstArr)) {
      showToast(t('cantNestColumns'));
      return;
    }
    pushHistory();
    const targetBlock = dstArr[dstIdx];
    srcArr.splice(srcIdx, 1);
    let insertIdx = dstArr.indexOf(targetBlock);
    if (insertIdx < 0) insertIdx = dstArr.length;
    if (!before) insertIdx++;
    if (insertIdx > dstArr.length) insertIdx = dstArr.length;
    if (insertIdx < 0) insertIdx = 0;
    dstArr.splice(insertIdx, 0, moved);
    saveModel(); renderAll();
  }
  function moveBlockToContainerEnd(draggedId, targetArr) {
    const isFromPalette = typeof draggedId === 'string' && draggedId.startsWith('__palette:');
    if (isFromPalette) {
      const type = draggedId.slice('__palette:'.length);
      const isColumnsType = type === 'columns2' || type === 'columns3';
      if (isColumnsType && isContainerInsideColumns(targetArr)) {
        showToast(t('cantNestColumns'));
        return;
      }
      pushHistory();
      const newBlock = createBlock(type);
      targetArr.push(newBlock);
      selectedId = newBlock.id;
      selectedColId = null;
      saveModel(); renderAll();
      return;
    }
    const src = findContainer(draggedId);
    if (!src) return;
    const [srcArr, srcIdx] = src;
    const moved = srcArr[srcIdx];
    if (moved.type === 'columns' && isContainerInsideColumns(targetArr)) {
      showToast(t('cantNestColumns'));
      return;
    }
    if (srcArr === targetArr) return; // same container, no-op (use moveBlock)
    pushHistory();
    srcArr.splice(srcIdx, 1);
    targetArr.push(moved);
    saveModel(); renderAll();
  }
  function isContainerInsideColumns(arr) {
    let found = false;
    for (const b of model.blocks) {
      if (b.type === 'columns') {
        for (const col of b.cols) {
          if (col.blocks === arr) { found = true; return found; }
        }
      }
    }
    return found;
  }
  function resetModel() {
    if (!confirm(t('confirmReset'))) return;
    pushHistory();
    model = defaultModel();
    selectedId = null;
    selectedColId = null;
    saveModel(); renderAll();
  }

  // ----------------------------------------
  // Templates
  // ----------------------------------------
  const TEMPLATES = {
    basic: () => ({
      width: 600,
      blocks: [
        Object.assign(createBlock('text'), {
          text: lang === 'pl' ? 'Jan Kowalski\nDyrektor Sprzedazy' : 'John Doe\nSales Director',
          color: '#0f172a', fontSize: 16, fontWeight: 'bold', align: 'left',
          paddingTop: 0, paddingBottom: 6
        }),
        Object.assign(createBlock('text'), {
          text: lang === 'pl' ? 'Acme Sp. z o.o.' : 'Acme Inc.',
          color: '#475569', fontSize: 13, fontWeight: 'normal', align: 'left',
          paddingTop: 0, paddingBottom: 10
        }),
        Object.assign(createBlock('divider'), { color: '#e2e8f0', thickness: 1, paddingTop: 4, paddingBottom: 10 }),
        Object.assign(createBlock('text'), {
          text: 'jan@acme.com  ·  +48 601 234 567',
          color: '#64748b', fontSize: 12, align: 'left',
          paddingTop: 0, paddingBottom: 0
        })
      ]
    }),
    withLogo: () => {
      const left = createBlock('image');
      Object.assign(left, { url: 'https://placehold.co/120x120/f97316/fff?text=LOGO', alt: 'logo', width: 110, align: 'left' });
      const nameBlock = Object.assign(createBlock('text'), {
        text: lang === 'pl' ? 'Anna Nowak' : 'Anna Smith',
        color: '#0f172a', fontSize: 17, fontWeight: 'bold', align: 'left',
        paddingTop: 0, paddingBottom: 4
      });
      const titleBlock = Object.assign(createBlock('text'), {
        text: lang === 'pl' ? 'Head of Marketing · Acme' : 'Head of Marketing · Acme',
        color: '#f97316', fontSize: 13, fontWeight: 'bold', align: 'left',
        paddingTop: 0, paddingBottom: 8
      });
      const contactBlock = Object.assign(createBlock('text'), {
        text: 'anna@acme.com\n+48 600 123 456\nacme.com',
        color: '#475569', fontSize: 12, align: 'left',
        paddingTop: 0, paddingBottom: 0
      });
      const cols = createBlock('columns2');
      cols.cols[0].width = 25;
      cols.cols[1].width = 75;
      cols.cols[0].blocks.push(left);
      cols.cols[1].blocks.push(nameBlock, titleBlock, contactBlock);
      return { width: 600, blocks: [cols] };
    },
    corporate: () => {
      const logo = Object.assign(createBlock('image'), {
        url: 'https://placehold.co/180x40/f97316/fff?text=ACME',
        alt: 'Acme', width: 180, align: 'left',
        paddingTop: 0, paddingBottom: 12
      });
      const div1 = Object.assign(createBlock('divider'), { color: '#f97316', thickness: 2, paddingTop: 0, paddingBottom: 12 });
      const left = Object.assign(createBlock('text'), {
        text: lang === 'pl' ? 'Pawel Wisniewski' : 'Paul Wright',
        color: '#0f172a', fontSize: 16, fontWeight: 'bold', align: 'left',
        paddingTop: 0, paddingBottom: 4
      });
      const left2 = Object.assign(createBlock('text'), {
        text: lang === 'pl' ? 'Senior Account Manager' : 'Senior Account Manager',
        color: '#64748b', fontSize: 12, align: 'left',
        paddingTop: 0, paddingBottom: 8
      });
      const left3 = Object.assign(createBlock('text'), {
        text: 'pawel@acme.com\n+48 22 555 12 34',
        color: '#475569', fontSize: 12, align: 'left',
        paddingTop: 0, paddingBottom: 0
      });
      const social = createBlock('social');
      social.links = [
        { id: uid(), platform: 'linkedin', url: 'https://linkedin.com/in/example' },
        { id: uid(), platform: 'twitter',  url: 'https://twitter.com/example' },
        { id: uid(), platform: 'web',      url: 'https://acme.com' }
      ];
      social.align = 'right';
      social.paddingTop = 0;
      const cols = createBlock('columns2');
      cols.cols[0].width = 60;
      cols.cols[1].width = 40;
      cols.cols[0].blocks.push(left, left2, left3);
      cols.cols[1].blocks.push(social);
      const div2 = Object.assign(createBlock('divider'), { color: '#e2e8f0', thickness: 1, paddingTop: 12, paddingBottom: 12 });
      const cta = Object.assign(createBlock('button'), {
        text: lang === 'pl' ? 'Umow spotkanie' : 'Book a meeting',
        link: 'https://calendly.com/example',
        bgColor: '#f97316', textColor: '#ffffff',
        gradient: { enabled: true, start: '#f97316', end: '#ea580c', dir: 'lr' },
        align: 'left', paddingTop: 0, paddingBottom: 0
      });
      return { width: 600, blocks: [logo, div1, cols, div2, cta] };
    },
    minimal: () => ({
      width: 600,
      blocks: [
        Object.assign(createBlock('text'), {
          text: lang === 'pl' ? '— Jan Kowalski' : '— John Doe',
          color: '#1f2937', fontSize: 14, fontWeight: 'bold', align: 'left',
          paddingTop: 0, paddingBottom: 2
        }),
        Object.assign(createBlock('text'), {
          text: lang === 'pl' ? 'jan@example.com' : 'john@example.com',
          color: '#6b7280', fontSize: 13, align: 'left',
          paddingTop: 0, paddingBottom: 0
        })
      ]
    })
  };

  function applyTemplate(name) {
    const fn = TEMPLATES[name];
    if (!fn) return;
    if (model.blocks.length > 0 && !confirm(t('confirmTemplate'))) return;
    pushHistory();
    model = fn();
    selectedId = null;
    selectedColId = null;
    saveModel(); renderAll();
  }

  // ----------------------------------------
  // Canvas rendering
  // ----------------------------------------
  function renderCanvas() {
    const frame = document.getElementById('canvasFrame');
    if (!frame) return;
    frame.innerHTML = '';
    // Apply model width (clamped to email-safe range)
    const W = Math.min(MAX_SIG_WIDTH, Math.max(MIN_SIG_WIDTH, model.width || 600));
    frame.style.maxWidth = W + 'px';
    // Optional global min-height for the whole signature
    frame.style.minHeight = model.minHeight ? model.minHeight + 'px' : '';
    // Hard clip on both axes - "max is max". Content that exceeds the frame is
    // visually cut so the layout problem is obvious. A red badge under the frame
    // appears when the content overflows the user-set maxHeight (see post-render check).
    frame.style.maxHeight = model.maxHeight ? model.maxHeight + 'px' : '';
    frame.style.overflowX = 'hidden';
    frame.style.overflowY = 'hidden';

    // Mode dispatch: stack (rows of blocks) vs free (Paint-like positioning)
    if ((model.mode || 'stack') === 'free') {
      frame.style.display = 'block';
      frame.style.position = 'relative';
      renderCanvasFree(frame);
      return;
    }

    // Stack mode: vertical flex with optional global vertical alignment.
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.justifyContent = VALIGN_MAP_FLEX[model.valign || 'top'];
    frame.style.position = '';

    // Treat "only frame blocks" as empty in stack mode - frames are free-mode artefacts.
    const stackBlockCount = model.blocks.filter((b) => b.type !== 'frame').length;
    if (stackBlockCount === 0) {
      frame.classList.add('is-empty');
      const empty = document.createElement('div');
      empty.className = 'canvas-empty';
      empty.innerHTML = `
        <div class="canvas-empty__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M3 8l9 6 9-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="canvas-empty__title">${esc(t('canvasEmptyTitle'))}</div>
        <div class="canvas-empty__sub">${esc(t('canvasEmptySub'))}</div>
      `;
      frame.appendChild(empty);
      return;
    }
    frame.classList.remove('is-empty');
    setupContainerDrop(frame, model.blocks);
    // Skip frame blocks in stack mode - they're free-mode artefacts that stay in
    // the model so user can switch back without losing data, but shouldn't paint
    // empty wrappers in the stack canvas.
    model.blocks.forEach((b) => {
      if (b.type === 'frame') return;
      const el = renderBlockOnCanvas(b, model.blocks);
      if (el) frame.appendChild(el);
    });
  }

  // ----------------------------------------
  // Free mode rendering (Paint-like absolute positioning)
  // ----------------------------------------
  function renderCanvasFree(frame) {
    setupCanvasDrawTool(frame);
    const frames = model.blocks.filter((b) => b.type === 'frame');
    if (frames.length === 0) {
      frame.classList.add('is-empty');
      const hint = document.createElement('div');
      hint.className = 'canvas-empty';
      hint.innerHTML = `
        <div class="canvas-empty__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 3"/></svg>
        </div>
        <div class="canvas-empty__title">${esc(t('modeFree'))}</div>
        <div class="canvas-empty__sub">${esc(t('modeFreeHint'))}</div>
      `;
      frame.appendChild(hint);
      return;
    }
    frame.classList.remove('is-empty');
    frames.forEach((f) => frame.appendChild(renderFrameOnCanvas(f)));
  }

  // Drag-to-draw a new frame on the empty canvas surface (free mode).
  // Idempotent: renderCanvasFree runs on every renderAll, so guard against
  // attaching multiple listeners (which previously created N frames per drag).
  function setupCanvasDrawTool(frame) {
    if (frame.dataset.drawTool === '1') return;
    frame.dataset.drawTool = '1';
    frame.addEventListener('mousedown', (e) => {
      // Only active in free mode (mode might switch back to stack at runtime).
      if ((model.mode || 'stack') !== 'free') return;
      // Only start drawing on the bare canvas (not on existing frame / handle).
      if (e.target !== frame && !e.target.classList.contains('canvas-empty') && !e.target.closest('.canvas-empty')) return;
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = frame.getBoundingClientRect();
      const z = zoomLevel / 100;
      const startX = (e.clientX - rect.left) / z;
      const startY = (e.clientY - rect.top) / z;

      // Visual rectangle that follows the mouse
      const ghost = document.createElement('div');
      ghost.className = 'frame-draw-ghost';
      ghost.style.left = startX + 'px';
      ghost.style.top = startY + 'px';
      ghost.style.width = '0px';
      ghost.style.height = '0px';
      frame.appendChild(ghost);

      function onMove(ev) {
        const x = (ev.clientX - rect.left) / z;
        const y = (ev.clientY - rect.top) / z;
        const nx = Math.min(startX, x);
        const ny = Math.min(startY, y);
        const nw = Math.abs(x - startX);
        const nh = Math.abs(y - startY);
        ghost.style.left = nx + 'px';
        ghost.style.top = ny + 'px';
        ghost.style.width = nw + 'px';
        ghost.style.height = nh + 'px';
      }
      function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        const x = (ev.clientX - rect.left) / z;
        const y = (ev.clientY - rect.top) / z;
        const nw = Math.abs(x - startX);
        const nh = Math.abs(y - startY);
        if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
        // Ignore tiny drags (<8px) - treated as a click, no frame created
        if (nw < 8 || nh < 8) return;
        const nx = Math.round(Math.min(startX, x));
        const ny = Math.round(Math.min(startY, y));
        pushHistory();
        const f = createBlock('frame');
        f.x = Math.max(0, nx);
        f.y = Math.max(0, ny);
        f.width = Math.round(nw);
        f.height = Math.round(nh);
        model.blocks.push(f);
        selectedId = f.id;
        selectedColId = null;
        saveModel();
        renderAll();
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Single frame: absolute box with content + drag-to-move + corner resize handles.
  function renderFrameOnCanvas(b) {
    const wrap = document.createElement('div');
    wrap.className = 'canvas-frame-block';
    if (b.id === selectedId) wrap.classList.add('is-selected');
    wrap.dataset.id = b.id;
    wrap.style.position = 'absolute';
    wrap.style.left = (b.x || 0) + 'px';
    wrap.style.top = (b.y || 0) + 'px';
    wrap.style.width = (b.width || 100) + 'px';
    wrap.style.height = (b.height || 60) + 'px';
    if (b.bgColor) wrap.style.backgroundColor = b.bgColor;
    if (b.bgImage) {
      wrap.style.backgroundImage = `url("${b.bgImage}")`;
      wrap.style.backgroundSize = 'cover';
      wrap.style.backgroundPosition = 'center';
      wrap.style.backgroundRepeat = 'no-repeat';
    }
    if (b.innerPad) wrap.style.padding = b.innerPad + 'px';
    wrap.style.boxSizing = 'border-box';
    wrap.style.overflow = 'hidden';

    // Handle pill (delete + label)
    const handle = document.createElement('span');
    handle.className = 'canvas-block__handle';
    handle.innerHTML = `<svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" style="opacity:0.7;"><circle cx="2" cy="2" r="1"/><circle cx="2" cy="4.5" r="1"/><circle cx="2" cy="7" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="6" cy="4.5" r="1"/><circle cx="6" cy="7" r="1"/></svg> ${esc(t('blockFrame'))}`;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'canvas-block__delete';
    del.innerHTML = '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    del.addEventListener('click', (e) => { e.stopPropagation(); deleteBlock(b.id); });
    handle.appendChild(del);
    wrap.appendChild(handle);

    // Inner content: stack of child blocks (text/image/etc) inside the frame
    const inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.display = 'flex';
    inner.style.flexDirection = 'column';
    if (b.blocks && b.blocks.length) {
      b.blocks.forEach((cb) => {
        const childEl = renderBlockOnCanvas(cb, b.blocks);
        inner.appendChild(childEl);
      });
    } else {
      const empty = document.createElement('div');
      empty.className = 'canvas-col__empty';
      empty.style.flex = '1';
      empty.style.display = 'flex';
      empty.style.alignItems = 'center';
      empty.style.justifyContent = 'center';
      empty.textContent = t('colEmpty');
      inner.appendChild(empty);
    }
    wrap.appendChild(inner);

    // Selection
    wrap.addEventListener('click', (e) => {
      if (suppressClick) return;
      if (e.target.isContentEditable) return;
      e.stopPropagation();
      if (selectedId !== b.id) {
        selectedId = b.id;
        selectedColId = null;
        renderAll();
      }
    });
    setupFrameMove(wrap, b);
    if (b.id === selectedId) attachFrameResizeHandles(wrap, b);
    return wrap;
  }

  // Drag the frame body to update its (x, y).
  function setupFrameMove(wrap, b) {
    wrap.addEventListener('mousedown', (e) => {
      if (e.target.closest('.canvas-block__handle, .canvas-frame-resize, [contenteditable="true"], button, input, select, textarea, a')) return;
      if (e.button !== 0) return;
      const startX = e.clientX, startY = e.clientY;
      const startBlockX = b.x || 0;
      const startBlockY = b.y || 0;
      let moved = false;
      let dirty = false;

      function onMove(ev) {
        const dx = (ev.clientX - startX) / (zoomLevel / 100);
        const dy = (ev.clientY - startY) / (zoomLevel / 100);
        if (!moved) {
          if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
          moved = true;
          if (selectedId !== b.id) {
            selectedId = b.id; selectedColId = null;
            document.querySelectorAll('.canvas-frame-block.is-selected').forEach((x) => x.classList.remove('is-selected'));
            wrap.classList.add('is-selected');
          }
          document.body.style.cursor = 'move';
          document.body.classList.add('is-moving-block');
        }
        const nx = Math.max(0, Math.round(startBlockX + dx));
        const ny = Math.max(0, Math.round(startBlockY + dy));
        if (nx !== b.x || ny !== b.y) {
          b.x = nx; b.y = ny;
          dirty = true;
          wrap.style.left = nx + 'px';
          wrap.style.top = ny + 'px';
        }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.classList.remove('is-moving-block');
        if (moved) {
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 30);
        }
        if (dirty) { pushHistory(); saveModel(); renderAll(); }
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Four corner handles to resize a frame's width/height.
  function attachFrameResizeHandles(wrap, b) {
    ['nw', 'ne', 'sw', 'se'].forEach((corner) => {
      const h = document.createElement('div');
      h.className = 'canvas-frame-resize canvas-frame-resize--' + corner;
      h.addEventListener('mousedown', (e) => startFrameResize(e, b, corner, wrap));
      h.addEventListener('dragstart', (e) => e.preventDefault());
      wrap.appendChild(h);
    });
  }
  function startFrameResize(e, b, corner, wrap) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startBlockX = b.x || 0;
    const startBlockY = b.y || 0;
    const startW = b.width || 100;
    const startH = b.height || 60;
    const sx = (corner === 'ne' || corner === 'se') ? 1 : -1;
    const sy = (corner === 'sw' || corner === 'se') ? 1 : -1;
    let dirty = false;
    const label = document.createElement('div');
    label.className = 'resize-label';
    document.body.appendChild(label);

    function onMove(ev) {
      const dx = (ev.clientX - startX) / (zoomLevel / 100);
      const dy = (ev.clientY - startY) / (zoomLevel / 100);
      let newW = Math.max(20, Math.round(startW + sx * dx));
      let newH = Math.max(20, Math.round(startH + sy * dy));
      let newX = startBlockX, newY = startBlockY;
      if (sx === -1) newX = startBlockX + (startW - newW); // left edge moves
      if (sy === -1) newY = startBlockY + (startH - newH); // top edge moves
      if (newW !== b.width || newH !== b.height || newX !== b.x || newY !== b.y) {
        b.width = newW; b.height = newH; b.x = Math.max(0, newX); b.y = Math.max(0, newY);
        dirty = true;
        wrap.style.left = b.x + 'px';
        wrap.style.top = b.y + 'px';
        wrap.style.width = newW + 'px';
        wrap.style.height = newH + 'px';
      }
      label.textContent = `${b.width} × ${b.height}`;
      label.style.left = (ev.clientX + 14) + 'px';
      label.style.top = (ev.clientY + 14) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (label.parentNode) label.parentNode.removeChild(label);
      if (dirty) { pushHistory(); saveModel(); renderAll(); }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function renderBlockOnCanvas(b, parentArr) {
    // Frame blocks are free-mode only - don't render them in the stack canvas.
    if (b.type === 'frame') return null;
    const wrap = document.createElement('div');
    wrap.className = 'canvas-block';
    if (b.id === selectedId) wrap.classList.add('is-selected');
    wrap.dataset.id = b.id;
    wrap.style.paddingTop = (b.paddingTop || 0) + 'px';
    wrap.style.paddingRight = (b.paddingRight || 0) + 'px';
    wrap.style.paddingBottom = (b.paddingBottom || 0) + 'px';
    wrap.style.paddingLeft = (b.paddingLeft || 0) + 'px';
    if (b.offsetX) wrap.style.transform = `translateX(${b.offsetX}px)`;

    const handle = document.createElement('span');
    handle.className = 'canvas-block__handle';
    handle.innerHTML = `<svg width="9" height="9" viewBox="0 0 9 9" fill="currentColor" style="opacity:0.7;"><circle cx="2" cy="2" r="1"/><circle cx="2" cy="4.5" r="1"/><circle cx="2" cy="7" r="1"/><circle cx="6" cy="2" r="1"/><circle cx="6" cy="4.5" r="1"/><circle cx="6" cy="7" r="1"/></svg> ${esc(blockLabel(b.type))}`;
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'canvas-block__delete';
    del.innerHTML = '<svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    del.addEventListener('click', (e) => { e.stopPropagation(); deleteBlock(b.id); });
    handle.appendChild(del);
    wrap.appendChild(handle);

    let content;
    if (b.type === 'text') content = renderTextBlock(b);
    else if (b.type === 'image') content = renderImageBlock(b);
    else if (b.type === 'button') content = renderButtonBlock(b);
    else if (b.type === 'divider') content = renderDividerBlock(b);
    else if (b.type === 'spacer') content = renderSpacerBlock(b);
    else if (b.type === 'social') content = renderSocialBlockCanvas(b);
    else if (b.type === 'columns') content = renderColumnsBlockCanvas(b);
    if (content) wrap.appendChild(content);

    wrap.addEventListener('click', (e) => {
      if (suppressClick) return; // free-move drag just ended
      // Allow clicks inside contenteditable to focus without re-selecting
      if (e.target.isContentEditable) return;
      e.stopPropagation();
      if (selectedId !== b.id || selectedColId) {
        selectedId = b.id;
        selectedColId = null;
        renderAll();
      }
    });
    setupBlockDrag(wrap, b);
    setupBlockDrop(wrap, b);
    setupBlockMove(wrap, b);
    if (b.id === selectedId) attachResizeHandles(wrap, b);
    return wrap;
  }

  // Free-move via mouse: drag block body to set offsetX + paddingTop.
  // Threshold of 3px before move starts so a normal click still selects.
  function setupBlockMove(wrap, b) {
    wrap.addEventListener('mousedown', (e) => {
      // Skip non-body areas (handle = HTML5 drag, resize = handle drag, controls, editable)
      if (e.target.closest('.canvas-block__handle, .canvas-block__resize, [contenteditable="true"], button, input, select, textarea, a, .canvas-col__empty')) return;
      if (e.button !== 0) return;
      const startX = e.clientX, startY = e.clientY;
      const startOffsetX = b.offsetX || 0;
      const startPadTop = b.paddingTop || 0;
      let moved = false;
      let dirty = false;
      let moveLabel = null;

      function onMove(ev) {
        const dx = (ev.clientX - startX) / (zoomLevel / 100);
        const dy = (ev.clientY - startY) / (zoomLevel / 100);
        if (!moved) {
          if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
          moved = true;
          // Auto-select on drag start (no full re-render mid-drag)
          if (selectedId !== b.id || selectedColId) {
            selectedId = b.id;
            selectedColId = null;
            document.querySelectorAll('.canvas-block.is-selected, .canvas-col.is-selected').forEach((x) => x.classList.remove('is-selected'));
            wrap.classList.add('is-selected');
          }
          document.body.style.cursor = 'move';
          document.body.classList.add('is-moving-block');
        }
        const newX = Math.max(0, Math.min(400, Math.round(startOffsetX + dx)));
        const newY = Math.max(0, Math.min(200, Math.round(startPadTop + dy)));
        if (newX !== b.offsetX || newY !== b.paddingTop) {
          b.offsetX = newX;
          b.paddingTop = newY;
          dirty = true;
          wrap.style.transform = `translateX(${newX}px)`;
          wrap.style.paddingTop = newY + 'px';
          updateSizeBadge();
          if (!moveLabel) {
            moveLabel = document.createElement('div');
            moveLabel.className = 'resize-label';
            document.body.appendChild(moveLabel);
          }
          moveLabel.textContent = `X ${newX} · Y ${newY}`;
          moveLabel.style.left = (ev.clientX + 14) + 'px';
          moveLabel.style.top = (ev.clientY + 14) + 'px';
        }
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.classList.remove('is-moving-block');
        if (moveLabel && moveLabel.parentNode) moveLabel.parentNode.removeChild(moveLabel);
        if (moved) {
          suppressClick = true;
          setTimeout(() => { suppressClick = false; }, 30);
        }
        if (dirty) {
          pushHistory();
          saveModel();
          renderAll();
        }
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // Resize handles for selected block (drag to change padding)
  function attachResizeHandles(wrap, b) {
    if (b.type === 'spacer') return; // spacer uses height, not padding
    ['top', 'right', 'bottom', 'left'].forEach((dir) => {
      const h = document.createElement('div');
      h.className = 'canvas-block__resize canvas-block__resize--' + dir;
      h.title = 'Drag to change padding';
      h.addEventListener('mousedown', (e) => startPaddingResize(e, b, dir, wrap));
      // Prevent native HTML5 drag from initiating on the handle
      h.addEventListener('dragstart', (e) => e.preventDefault());
      wrap.appendChild(h);
    });
  }
  function startPaddingResize(e, b, dir, wrapEl) {
    e.preventDefault();
    e.stopPropagation();
    const propMap = { top: 'paddingTop', bottom: 'paddingBottom', left: 'paddingLeft', right: 'paddingRight' };
    const prop = propMap[dir];
    const startVal = b[prop] || 0;
    const startCoord = (dir === 'top' || dir === 'bottom') ? e.clientY : e.clientX;
    const sign = (dir === 'top' || dir === 'left') ? -1 : 1;
    let lastVal = startVal;
    let dirty = false;

    const label = document.createElement('div');
    label.className = 'resize-label';
    label.textContent = startVal + 'px';
    document.body.appendChild(label);
    const placeLabel = (ev) => {
      label.style.left = (ev.clientX + 14) + 'px';
      label.style.top = (ev.clientY + 14) + 'px';
    };
    placeLabel(e);

    function onMove(ev) {
      const cur = (dir === 'top' || dir === 'bottom') ? ev.clientY : ev.clientX;
      const delta = (cur - startCoord) / (zoomLevel / 100);
      let v = Math.round(startVal + sign * delta);
      if (v < 0) v = 0;
      if (v > 200) v = 200;
      if (v !== lastVal) {
        b[prop] = v;
        lastVal = v;
        dirty = true;
        if (wrapEl) {
          wrapEl.style.paddingTop = (b.paddingTop || 0) + 'px';
          wrapEl.style.paddingRight = (b.paddingRight || 0) + 'px';
          wrapEl.style.paddingBottom = (b.paddingBottom || 0) + 'px';
          wrapEl.style.paddingLeft = (b.paddingLeft || 0) + 'px';
        }
        updateSizeBadge();
      }
      label.textContent = lastVal + 'px';
      placeLabel(ev);
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (label.parentNode) label.parentNode.removeChild(label);
      if (dirty) {
        // Commit: push history (current model has updated value already), save, re-render to refresh inspector value
        pushHistory();
        saveModel();
        renderAll();
      }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function renderTextBlock(b) {
    const c = document.createElement('div');
    c.style.color = b.color;
    c.style.fontSize = b.fontSize + 'px';
    c.style.fontWeight = b.fontWeight;
    c.style.textAlign = b.align;
    c.style.fontFamily = fontCss(b.fontFamily);
    c.style.whiteSpace = 'pre-wrap';
    c.style.lineHeight = '1.5';
    c.style.outline = 'none';
    c.textContent = b.text;
    if (b.id === selectedId) {
      c.contentEditable = 'true';
      c.spellcheck = false;
      c.classList.add('canvas-text--editable');
      // Commit text without re-rendering the canvas - the DOM is already in sync
      // (user just typed it). Re-rendering would destroy `c` and force a focus blink.
      c.addEventListener('blur', () => {
        const newText = c.innerText;
        if (newText === b.text) return;
        b.text = newText;
        dirtyAfterCommit = true;
        commitMutation();
        updateSizeBadge();
      });
      // Prevent dragstart from contenteditable
      c.addEventListener('dragstart', (e) => { e.preventDefault(); e.stopPropagation(); });
      // Don't bubble click (would re-select) when caret is being placed
      c.addEventListener('mousedown', (e) => e.stopPropagation());
    }
    return c;
  }
  function renderImageBlock(b) {
    const c = document.createElement('div');
    c.style.textAlign = b.align;
    const w = b.width || 120;
    const h = b.height || 120;

    // Inner shell wraps image/placeholder + resize handles. inline-block so handles
    // can be positioned relative to the actual image bounds, not the cell.
    const shell = document.createElement('div');
    shell.className = 'image-shell';
    shell.style.width = w + 'px';
    shell.style.height = h + 'px';
    shell.style.position = 'relative';
    shell.style.display = 'inline-block';

    if (b.url) {
      const img = document.createElement('img');
      img.src = b.url; img.alt = b.alt || '';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      img.draggable = false;
      img.onerror = () => {
        shell.innerHTML = '';
        const ph = buildImagePlaceholder(w, h, '[Image not found]');
        shell.appendChild(ph);
        if (b.id === selectedId) attachImageResizeHandles(shell, b);
      };
      shell.appendChild(img);
    } else {
      shell.appendChild(buildImagePlaceholder(w, h, ''));
    }

    if (b.id === selectedId) attachImageResizeHandles(shell, b);

    c.appendChild(shell);
    return c;
  }

  function buildImagePlaceholder(w, h, errorMsg) {
    const ph = document.createElement('div');
    ph.className = 'image-placeholder';
    ph.style.width = '100%';
    ph.style.height = '100%';
    ph.innerHTML = `
      <svg class="image-placeholder__icon" width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.6"/>
        <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div class="image-placeholder__size">${w} × ${h}</div>
      ${errorMsg ? `<div class="image-placeholder__hint">${esc(errorMsg)}</div>` : ''}
    `;
    return ph;
  }

  function attachImageResizeHandles(shell, b) {
    ['nw', 'ne', 'sw', 'se'].forEach((corner) => {
      const h = document.createElement('div');
      h.className = 'image-resize image-resize--' + corner;
      h.dataset.corner = corner;
      h.addEventListener('mousedown', (e) => startImageResize(e, b, corner, shell));
      h.addEventListener('dragstart', (e) => e.preventDefault());
      shell.appendChild(h);
    });
    // Size badge (visible during select)
    const badge = document.createElement('div');
    badge.className = 'image-size-badge';
    badge.textContent = `${b.width || 0} × ${b.height || 0}`;
    shell.appendChild(badge);
  }

  function startImageResize(e, b, corner, shell) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startW = b.width || 120;
    const startH = b.height || 120;
    const aspect = startW / Math.max(1, startH);
    const sx = (corner === 'ne' || corner === 'se') ? 1 : -1;
    const sy = (corner === 'sw' || corner === 'se') ? 1 : -1;
    let dirty = false;

    const label = document.createElement('div');
    label.className = 'resize-label';
    label.textContent = `${startW} × ${startH}`;
    document.body.appendChild(label);

    function onMove(ev) {
      const dx = (ev.clientX - startX) / (zoomLevel / 100);
      const dy = (ev.clientY - startY) / (zoomLevel / 100);
      // Aspect locked unless Shift held, OR block flag aspectLocked is false
      const lock = b.aspectLocked && !ev.shiftKey;
      let newW = Math.round(startW + sx * dx);
      let newH = Math.round(startH + sy * dy);
      if (lock) {
        // Use the larger axis as the driver
        if (Math.abs(sx * dx) >= Math.abs(sy * dy)) {
          newH = Math.round(newW / aspect);
        } else {
          newW = Math.round(newH * aspect);
        }
      }
      newW = Math.max(20, Math.min(MAX_SIG_WIDTH, newW));
      newH = Math.max(20, Math.min(800, newH));
      if (newW !== b.width || newH !== b.height) {
        b.width = newW; b.height = newH;
        dirty = true;
        // Live update without full re-render to keep handles bound
        shell.style.width = newW + 'px';
        shell.style.height = newH + 'px';
        const sizeEl = shell.querySelector('.image-placeholder__size');
        if (sizeEl) sizeEl.textContent = `${newW} × ${newH}`;
        const badge = shell.querySelector('.image-size-badge');
        if (badge) badge.textContent = `${newW} × ${newH}`;
        updateSizeBadge();
      }
      label.textContent = `${b.width} × ${b.height}` + (lock ? ' 🔒' : '');
      label.style.left = (ev.clientX + 14) + 'px';
      label.style.top = (ev.clientY + 14) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (label.parentNode) label.parentNode.removeChild(label);
      if (dirty) {
        pushHistory(); saveModel(); renderAll();
      }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  function renderButtonBlock(b) {
    const c = document.createElement('div');
    c.style.textAlign = b.align;
    const a = document.createElement('a');
    a.href = '#';
    a.onclick = (e) => e.preventDefault();
    a.style.display = 'inline-block';
    if (b.gradient && b.gradient.enabled) {
      const dir = (GRADIENT_DIRS.find(x => x.v === b.gradient.dir) || GRADIENT_DIRS[0]).css;
      a.style.background = `linear-gradient(${dir}, ${b.gradient.start}, ${b.gradient.end})`;
    } else {
      a.style.background = b.bgColor;
    }
    a.style.color = b.textColor;
    a.style.padding = (b.paddingV || 10) + 'px ' + (b.paddingH || 22) + 'px';
    a.style.fontSize = b.fontSize + 'px';
    a.style.fontWeight = b.fontWeight;
    a.style.fontFamily = fontCss(b.fontFamily);
    a.style.borderRadius = '6px';
    a.style.textDecoration = 'none';
    a.textContent = b.text;
    c.appendChild(a);
    return c;
  }
  function renderDividerBlock(b) {
    const c = document.createElement('div');
    c.style.borderTop = (b.thickness || 1) + 'px solid ' + b.color;
    c.style.height = '0';
    return c;
  }
  function renderSpacerBlock(b) {
    const c = document.createElement('div');
    c.style.height = (b.height || 16) + 'px';
    return c;
  }
  function renderSocialBlockCanvas(b) {
    const c = document.createElement('div');
    c.style.textAlign = b.align || 'left';
    if (!b.links || b.links.length === 0) {
      c.innerHTML = '<div style="padding:10px;border:1px dashed #cbd5e1;color:#94a3b8;font-size:12px;border-radius:6px;text-align:center;">' + esc(t('labelSocialPlatforms')) + '</div>';
      return c;
    }
    const inline = document.createElement('div');
    inline.style.display = 'inline-flex';
    inline.style.flexWrap = 'wrap';
    inline.style.gap = (b.gap || 8) + 'px';
    b.links.forEach((lnk) => {
      const preset = SOCIAL_PRESETS.find((p) => p.id === lnk.platform) || SOCIAL_PRESETS[7];
      const el = document.createElement('span');
      el.style.fontFamily = "'Segoe UI', Arial, sans-serif";
      el.style.fontSize = '12px';
      el.style.fontWeight = '600';
      if (b.style === 'pill') {
        el.style.background = preset.color;
        el.style.color = '#fff';
        el.style.padding = '4px 10px';
        el.style.borderRadius = '999px';
      } else {
        el.style.color = preset.color;
        el.style.textDecoration = 'underline';
      }
      el.textContent = preset.label;
      inline.appendChild(el);
    });
    c.appendChild(inline);
    return c;
  }
  function renderColumnsBlockCanvas(b) {
    const wrapper = document.createElement('div');
    if (b.bgColor) wrapper.style.backgroundColor = b.bgColor;
    if (b.bgImage) {
      wrapper.style.backgroundImage = `url("${b.bgImage}")`;
      wrapper.style.backgroundSize = 'cover';
      wrapper.style.backgroundPosition = 'center';
      wrapper.style.backgroundRepeat = 'no-repeat';
    }
    if (b.innerPad) wrapper.style.padding = b.innerPad + 'px';
    if (b.minHeight) wrapper.style.minHeight = b.minHeight + 'px';
    const c = document.createElement('div');
    c.style.display = 'flex';
    c.style.gap = (b.gap || 12) + 'px';
    c.style.alignItems = 'stretch'; // columns share full row height so per-col bg fills evenly
    const valignMap = { top: 'flex-start', middle: 'center', bottom: 'flex-end' };
    b.cols.forEach((col, idx) => {
      const colEl = document.createElement('div');
      colEl.className = 'canvas-col';
      if (col.id === selectedColId) colEl.classList.add('is-selected');
      // Use flex weight (col.width) with grow/shrink so columns fit inside
      // the canvas WITH the gap (otherwise 4*25% + gap > 100% = horizontal scroll).
      // The actual cell width in email render still uses width="X%".
      colEl.style.flex = (col.width || 1) + ' 1 0';
      colEl.style.minWidth = '0';
      if (col.minHeight) colEl.style.minHeight = col.minHeight + 'px';
      colEl.dataset.colId = col.id;
      // Click on the empty padding area of a column selects the column itself
      // (not the parent columns block, not a child block).
      colEl.addEventListener('click', (e) => {
        if (e.target.closest('.canvas-block, .canvas-col__resize')) return;
        e.stopPropagation();
        selectedId = null;
        selectedColId = col.id;
        renderAll();
      });
      // Per-column bg + padding + valign (backwards compat for old models)
      if (col.bgColor) colEl.style.backgroundColor = col.bgColor;
      if (col.bgImage) {
        colEl.style.backgroundImage = `url("${col.bgImage}")`;
        colEl.style.backgroundSize = col.bgSize || 'contain';
        colEl.style.backgroundPosition = 'center';
        colEl.style.backgroundRepeat = 'no-repeat';
      }
      if (col.innerPad) colEl.style.padding = col.innerPad + 'px';
      colEl.style.display = 'flex';
      colEl.style.flexDirection = 'column';
      colEl.style.justifyContent = valignMap[col.valign || 'top'];

      setupContainerDrop(colEl, col.blocks);
      if (col.blocks.length === 0) {
        // Skip the dashed "drop here" placeholder when the column is already
        // showing a background colour or image - the bg itself signals "this is a column".
        if (!col.bgColor && !col.bgImage) {
          const empty = document.createElement('div');
          empty.className = 'canvas-col__empty';
          empty.textContent = t('colEmpty');
          colEl.appendChild(empty);
        }
      } else {
        col.blocks.forEach((cb) => {
          colEl.appendChild(renderBlockOnCanvas(cb, col.blocks));
        });
      }
      // Column resize handle on right edge (drag to redistribute width with neighbour)
      if (idx < b.cols.length - 1) {
        const handle = document.createElement('div');
        handle.className = 'canvas-col__resize';
        handle.title = 'Drag to resize columns';
        handle.addEventListener('mousedown', (e) => startColumnResize(e, b, idx, c));
        handle.addEventListener('dragstart', (e) => e.preventDefault());
        colEl.appendChild(handle);
      }
      c.appendChild(colEl);
    });
    wrapper.appendChild(c);
    return wrapper;
  }

  // Drag a column edge to redistribute width between this column and the next.
  // Total width of the (left,right) pair is preserved so the rest of the layout
  // stays stable. Live updates DOM only; commits + history on mouseup.
  function startColumnResize(e, b, leftIdx, container) {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startLeft = b.cols[leftIdx].width;
    const startRight = b.cols[leftIdx + 1].width;
    const totalPair = startLeft + startRight;
    const containerWidth = (container.getBoundingClientRect().width / (zoomLevel / 100)) || 1;
    let dirty = false;

    const label = document.createElement('div');
    label.className = 'resize-label';
    label.textContent = `${startLeft}% / ${startRight}%`;
    document.body.appendChild(label);
    document.body.style.cursor = 'ew-resize';

    function onMove(ev) {
      const dx = (ev.clientX - startX) / (zoomLevel / 100);
      const dxPct = (dx / containerWidth) * 100;
      let newLeft = Math.max(5, Math.min(totalPair - 5, Math.round(startLeft + dxPct)));
      let newRight = totalPair - newLeft;
      if (newLeft !== b.cols[leftIdx].width || newRight !== b.cols[leftIdx + 1].width) {
        b.cols[leftIdx].width = newLeft;
        b.cols[leftIdx + 1].width = newRight;
        dirty = true;
        const colEls = container.querySelectorAll(':scope > .canvas-col');
        if (colEls[leftIdx])     colEls[leftIdx].style.flex     = `${newLeft} 1 0`;
        if (colEls[leftIdx + 1]) colEls[leftIdx + 1].style.flex = `${newRight} 1 0`;
      }
      label.textContent = `${b.cols[leftIdx].width}% / ${b.cols[leftIdx + 1].width}%`;
      label.style.left = (ev.clientX + 14) + 'px';
      label.style.top = (ev.clientY + 14) + 'px';
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      if (label.parentNode) label.parentNode.removeChild(label);
      document.body.style.cursor = '';
      if (dirty) { pushHistory(); saveModel(); renderAll(); }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function blockLabel(type) {
    const map = {
      text: t('blockText'), image: t('blockImage'), button: t('blockButton'),
      divider: t('blockDivider'), spacer: t('blockSpacer'),
      social: t('blockSocial'), columns: t('labelColumns'),
      frame: t('blockFrame')
    };
    return map[type] || type;
  }

  // ----------------------------------------
  // Drag-drop
  // ----------------------------------------
  function setupBlockDrag(el, b) {
    // Drag source is the handle, not the entire block (so body click/drag = free move).
    const handle = el.querySelector('.canvas-block__handle');
    if (!handle) return;
    handle.draggable = true;
    handle.addEventListener('mousedown', (e) => e.stopPropagation()); // prevent free-move on handle
    handle.addEventListener('dragstart', (e) => {
      e.stopPropagation();
      dragId = b.id;
      try { e.dataTransfer.setData('text/plain', b.id); } catch (_) {}
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => el.classList.add('is-dragging'), 0);
    });
    handle.addEventListener('dragend', () => {
      dragId = null;
      el.classList.remove('is-dragging');
      document.querySelectorAll('.drop-above, .drop-below').forEach((x) => x.classList.remove('drop-above', 'drop-below'));
      document.querySelectorAll('.canvas-col--drop-target, .canvas-frame--drop-target').forEach((x) => x.classList.remove('canvas-col--drop-target', 'canvas-frame--drop-target'));
    });
  }
  function setupBlockDrop(el, b) {
    el.addEventListener('dragover', (e) => {
      if (!dragId || dragId === b.id) return;
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const isUpper = (e.clientY - rect.top) < rect.height / 2;
      el.classList.toggle('drop-above', isUpper);
      el.classList.toggle('drop-below', !isUpper);
    });
    el.addEventListener('dragleave', () => {
      el.classList.remove('drop-above', 'drop-below');
    });
    el.addEventListener('drop', (e) => {
      if (!dragId || dragId === b.id) return;
      e.preventDefault();
      e.stopPropagation();
      const before = el.classList.contains('drop-above');
      el.classList.remove('drop-above', 'drop-below');
      moveBlockTo(dragId, b.id, before);
      dragId = null;
    });
  }
  function setupContainerDrop(el, containerArr) {
    const isFrame = el.classList.contains('canvas-frame');
    const dropClass = isFrame ? 'canvas-frame--drop-target' : 'canvas-col--drop-target';
    // canvas-frame is persistent across re-renders, so don't stack duplicate
    // listeners. canvas-col is recreated each time so it's fine. Track the
    // current container array on the element so the handler always sees the
    // freshest reference (model arrays can be replaced by undo/redo).
    el._dropContainerArr = containerArr;
    if (isFrame && el.dataset.dropAttached === '1') return;
    if (isFrame) el.dataset.dropAttached = '1';
    el.addEventListener('dragover', (e) => {
      if (!dragId) return;
      // Accept drop only on direct container surface (not on child blocks)
      if (e.target !== el && !e.target.classList.contains('canvas-empty') && !e.target.classList.contains('canvas-col__empty')) return;
      e.preventDefault();
      el.classList.add(dropClass);
    });
    el.addEventListener('dragleave', (e) => {
      if (e.target === el) el.classList.remove(dropClass);
    });
    el.addEventListener('drop', (e) => {
      if (!dragId) return;
      if (e.target !== el && !e.target.classList.contains('canvas-empty') && !e.target.classList.contains('canvas-col__empty')) return;
      e.preventDefault();
      el.classList.remove(dropClass);
      moveBlockToContainerEnd(dragId, el._dropContainerArr || containerArr);
      dragId = null;
    });
  }

  // ----------------------------------------
  // Inspector
  // ----------------------------------------
  // Build the selection breadcrumb shown at the top of the inspector.
  // It tells the user exactly which layer they're editing (signature / row / column / block)
  // and lets them jump up the tree by clicking a parent level.
  function buildBreadcrumb() {
    // 1. Compute the chain of levels for the current selection
    const levels = [{ label: t('bcSignature'), kind: 'signature' }];
    if (selectedColId) {
      const ctx = findColumnContext(selectedColId);
      if (ctx) {
        levels.push({ label: t('bcRow'), kind: 'row', blockId: ctx.rowBlock.id });
        levels.push({ label: `${t('bcCol')} ${ctx.colIdx + 1}`, kind: 'col', colId: ctx.col.id, isCurrent: true });
      }
    } else if (selectedId) {
      const b = findBlockDeep(selectedId);
      if (b) {
        if (b.type === 'columns') {
          levels.push({ label: t('bcRow'), kind: 'row', blockId: b.id, isCurrent: true });
        } else {
          const colCtx = findBlockColumnContext(b.id);
          if (colCtx) {
            levels.push({ label: t('bcRow'), kind: 'row', blockId: colCtx.rowBlock.id });
            levels.push({ label: `${t('bcCol')} ${colCtx.colIdx + 1}`, kind: 'col', colId: colCtx.col.id });
          }
          levels.push({ label: blockLabel(b.type), kind: 'block', blockId: b.id, isCurrent: true });
        }
      }
    }
    if (levels.length === 1) levels[0].isCurrent = true;

    // 2. Render the chain
    const wrap = document.createElement('div');
    wrap.className = 'inspector-bc-wrap';

    const label = document.createElement('span');
    label.className = 'inspector-bc-wrap__label';
    label.textContent = t('bcEditing');
    wrap.appendChild(label);

    const nav = document.createElement('nav');
    nav.className = 'inspector-bc';
    levels.forEach((lv, i) => {
      if (i > 0) {
        const sep = document.createElement('span');
        sep.className = 'inspector-bc__sep';
        sep.textContent = '›';
        nav.appendChild(sep);
      }
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'inspector-bc__btn' + (lv.isCurrent ? ' inspector-bc__btn--active' : '');
      btn.textContent = lv.label;
      if (!lv.isCurrent) {
        btn.addEventListener('click', () => {
          if (lv.kind === 'signature')   { selectedId = null;       selectedColId = null; }
          else if (lv.kind === 'row')    { selectedId = lv.blockId; selectedColId = null; }
          else if (lv.kind === 'col')    { selectedColId = lv.colId; selectedId = null; }
          renderAll();
        });
      }
      nav.appendChild(btn);
    });
    wrap.appendChild(nav);
    return wrap;
  }

  function renderInspector() {
    const body = document.getElementById('inspectorBody');
    if (!body) return;
    body.innerHTML = '';

    // Always show breadcrumb at the top so the user knows what's selected.
    body.appendChild(buildBreadcrumb());

    // ---- Column-only selection ----
    if (selectedColId) {
      const ctx = findColumnContext(selectedColId);
      if (ctx) {
        activeColTab = ctx.colIdx;
        // Tab bar to jump between columns without going back to the row level
        const tabBar = document.createElement('div');
        tabBar.className = 'col-tabs';
        ctx.rowBlock.cols.forEach((col, idx) => {
          const tab = document.createElement('button');
          tab.type = 'button';
          tab.className = 'col-tabs__tab' + (idx === ctx.colIdx ? ' is-active' : '');
          tab.textContent = `${t('bcCol')} ${idx + 1}`;
          tab.addEventListener('click', () => {
            selectedColId = ctx.rowBlock.cols[idx].id;
            selectedId = null;
            activeColTab = idx;
            renderAll();
          });
          tabBar.appendChild(tab);
        });
        body.appendChild(tabBar);
        body.appendChild(buildColumnInspector(ctx.rowBlock, ctx.col, ctx.colIdx));
        return;
      }
      selectedColId = null; // stale id (column was removed)
    }

    const b = selectedId ? findBlockDeep(selectedId) : null;
    if (!b) {
      // No selection - signature-level settings live on the canvas toolbar now,
      // so the inspector empty state shows tips + an info badge.
      const empty = document.createElement('div');
      empty.className = 'inspector-section';
      empty.innerHTML = `<div class="inspector-section__title">${esc(t('inspectorEmptyTitle'))}</div>
        <div class="inspector-empty__sub">${esc(t('inspectorEmptySub'))}</div>`;
      body.appendChild(empty);
      const info = document.createElement('div');
      info.className = 'inspector-info';
      info.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;color:var(--accent);"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 11.5V8M8 5.5h.008" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg> <span>${esc(t('canvasInfo'))}</span>`;
      body.appendChild(info);
      if ((model.mode || 'stack') === 'free') {
        const hint = document.createElement('div');
        hint.className = 'inspector-info';
        hint.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;color:var(--accent);"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 11.5V8M8 5.5h.008" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg> <span>${esc(t('modeFreeHint'))}</span>`;
        body.appendChild(hint);
      }
      const tips = document.createElement('div');
      tips.className = 'inspector-section';
      tips.innerHTML = `<div class="inspector-section__title">${esc(t('hintTip'))}</div>
        <ul class="inspector-tips">
          <li>${esc(t('hintDrag'))}</li>
          <li>${esc(t('hintEdit'))}</li>
          <li>${esc(t('hintFreeMove'))}</li>
          <li>${esc(t('hintArrows'))}</li>
          <li>${esc(t('hintResize'))}</li>
        </ul>`;
      body.appendChild(tips);
      return;
    }

    if (b.type === 'text') {
      body.appendChild(fieldTextarea(t('labelText'), b.text, (v) => updateBlock(b.id, { text: v })));
      body.appendChild(fieldColor(t('labelColor'), b.color, (v) => updateBlock(b.id, { color: v })));
      body.appendChild(fieldFontFamily(b.fontFamily || 'system', (v) => updateBlock(b.id, { fontFamily: v })));
      body.appendChild(fieldRange(t('labelFontSize'), b.fontSize, 10, 32, 'px', (v) => updateBlock(b.id, { fontSize: v })));
      body.appendChild(fieldSelect(t('labelFontWeight'), b.fontWeight, [
        { v: 'normal', l: t('weightNormal') }, { v: 'bold', l: t('weightBold') }
      ], (v) => updateBlock(b.id, { fontWeight: v })));
      body.appendChild(fieldAlign(b.align, (v) => updateBlock(b.id, { align: v })));
      body.appendChild(fieldText(t('labelLink'), b.link, (v) => updateBlock(b.id, { link: v }), 'https://...'));
    } else if (b.type === 'image') {
      body.appendChild(fieldText(t('labelImageUrl'), b.url, (v) => updateBlock(b.id, { url: v }), 'https://...'));
      body.appendChild(fieldImageUpload(b));
      body.appendChild(fieldAspectLock(b));
      // Width + height with cross-sync when aspectLocked. Sync the OTHER slider in
      // place (no inspector re-render) so focus stays on the field user is typing in.
      const wField = fieldRange(t('labelImageWidth'), b.width || 120, 24, MAX_SIG_WIDTH, 'px', (v) => {
        if (b.aspectLocked && b.height && b.width) {
          const aspect = b.width / b.height;
          const newH = Math.max(20, Math.min(800, Math.round(v / aspect)));
          // Live-sync the height field's controls without re-rendering inspector
          if (hField) {
            const hSl = hField.querySelector('.range-control__slider');
            const hNum = hField.querySelector('.range-control__num');
            if (hSl) hSl.value = newH;
            if (hNum && document.activeElement !== hNum) hNum.value = newH;
          }
          updateBlock(b.id, { width: v, height: newH });
        } else {
          updateBlock(b.id, { width: v });
        }
      });
      const hField = fieldRange(t('labelHeight'), b.height || 120, 24, 800, 'px', (v) => {
        if (b.aspectLocked && b.height && b.width) {
          const aspect = b.width / b.height;
          const newW = Math.max(20, Math.min(MAX_SIG_WIDTH, Math.round(v * aspect)));
          if (wField) {
            const wSl = wField.querySelector('.range-control__slider');
            const wNum = wField.querySelector('.range-control__num');
            if (wSl) wSl.value = newW;
            if (wNum && document.activeElement !== wNum) wNum.value = newW;
          }
          updateBlock(b.id, { width: newW, height: v });
        } else {
          updateBlock(b.id, { height: v });
        }
      });
      body.appendChild(wField);
      body.appendChild(hField);
      body.appendChild(fieldText(t('labelImageAlt'), b.alt, (v) => updateBlock(b.id, { alt: v })));
      body.appendChild(fieldAlign(b.align, (v) => updateBlock(b.id, { align: v })));
      body.appendChild(fieldText(t('labelLink'), b.link, (v) => updateBlock(b.id, { link: v }), 'https://...'));
    } else if (b.type === 'button') {
      body.appendChild(fieldText(t('labelButtonText'), b.text, (v) => updateBlock(b.id, { text: v })));
      body.appendChild(fieldText(t('labelLink'), b.link, (v) => updateBlock(b.id, { link: v }), 'https://...'));
      body.appendChild(fieldGradientToggle(b));
      if (b.gradient && b.gradient.enabled) {
        body.appendChild(fieldColor(t('labelGradientStart'), b.gradient.start, (v) => updateBlock(b.id, { gradient: Object.assign({}, b.gradient, { start: v }) })));
        body.appendChild(fieldColor(t('labelGradientEnd'),   b.gradient.end,   (v) => updateBlock(b.id, { gradient: Object.assign({}, b.gradient, { end: v }) })));
        body.appendChild(fieldGradientDir(b.gradient.dir, (v) => updateBlock(b.id, { gradient: Object.assign({}, b.gradient, { dir: v }) })));
      } else {
        body.appendChild(fieldColor(t('labelBgColor'), b.bgColor, (v) => updateBlock(b.id, { bgColor: v })));
      }
      body.appendChild(fieldColor(t('labelColor'), b.textColor, (v) => updateBlock(b.id, { textColor: v })));
      body.appendChild(fieldFontFamily(b.fontFamily || 'system', (v) => updateBlock(b.id, { fontFamily: v })));
      body.appendChild(fieldRange(t('labelFontSize'), b.fontSize, 10, 24, 'px', (v) => updateBlock(b.id, { fontSize: v })));
      body.appendChild(fieldRange(t('labelPadding') + ' V', b.paddingV, 4, 24, 'px', (v) => updateBlock(b.id, { paddingV: v })));
      body.appendChild(fieldRange(t('labelPadding') + ' H', b.paddingH, 8, 40, 'px', (v) => updateBlock(b.id, { paddingH: v })));
      body.appendChild(fieldAlign(b.align, (v) => updateBlock(b.id, { align: v })));
    } else if (b.type === 'divider') {
      body.appendChild(fieldColor(t('labelColor'), b.color, (v) => updateBlock(b.id, { color: v })));
      body.appendChild(fieldRange(t('labelThickness'), b.thickness, 1, 6, 'px', (v) => updateBlock(b.id, { thickness: v })));
    } else if (b.type === 'spacer') {
      body.appendChild(fieldRange(t('labelHeight'), b.height, 4, 80, 'px', (v) => updateBlock(b.id, { height: v })));
    } else if (b.type === 'social') {
      body.appendChild(fieldSelect(t('labelStyle'), b.style, [
        { v: 'pill', l: t('socialStylePill') }, { v: 'text', l: t('socialStyleText') }
      ], (v) => updateBlock(b.id, { style: v })));
      body.appendChild(fieldAlign(b.align, (v) => updateBlock(b.id, { align: v })));
      body.appendChild(fieldRange(t('labelGap'), b.gap, 0, 24, 'px', (v) => updateBlock(b.id, { gap: v })));
      body.appendChild(fieldSocialList(b));
    } else if (b.type === 'frame') {
      body.appendChild(fieldRange(t('labelX'),          b.x || 0,      0, MAX_SIG_WIDTH, 'px', (v) => updateBlock(b.id, { x: v })));
      body.appendChild(fieldRange(t('labelY'),          b.y || 0,      0, 800,           'px', (v) => updateBlock(b.id, { y: v })));
      body.appendChild(fieldRange(t('labelImageWidth'), b.width || 200, 20, MAX_SIG_WIDTH, 'px', (v) => updateBlock(b.id, { width: v })));
      body.appendChild(fieldRange(t('labelHeight'),     b.height || 80, 20, 800,           'px', (v) => updateBlock(b.id, { height: v })));
      body.appendChild(fieldColor(t('labelBgColor'), b.bgColor || '', (v) => updateBlock(b.id, { bgColor: v })));
      body.appendChild(fieldText(t('labelBgImage'), b.bgImage || '', (v) => updateBlock(b.id, { bgImage: v }), 'https://...'));
      body.appendChild(fieldImageUploadFor(b, 'bgImage'));
      body.appendChild(fieldRange(t('labelInnerPad'), b.innerPad || 0, 0, 60, 'px', (v) => updateBlock(b.id, { innerPad: v })));
    } else if (b.type === 'columns') {
      // Wrapper-level (whole columns block / one row)
      body.appendChild(fieldRange(t('labelMinHeight'), b.minHeight || 0, 0, 600, 'px', (v) => updateBlock(b.id, { minHeight: v })));
      body.appendChild(fieldRange(t('labelGap'), b.gap, 0, 32, 'px', (v) => updateBlock(b.id, { gap: v })));
      body.appendChild(fieldRange(t('labelInnerPad'), b.innerPad || 0, 0, 40, 'px', (v) => updateBlock(b.id, { innerPad: v })));
      body.appendChild(fieldText(t('labelBgImage'), b.bgImage || '', (v) => updateBlock(b.id, { bgImage: v }), 'https://...'));
      body.appendChild(fieldImageUploadFor(b, 'bgImage'));
      body.appendChild(fieldColor(t('labelBgColor'), b.bgColor || '', (v) => updateBlock(b.id, { bgColor: v })));
      // Tab bar: avoid stacking 4 column sections one under another
      if (activeColTab >= b.cols.length) activeColTab = 0;
      const tabBar = document.createElement('div');
      tabBar.className = 'col-tabs';
      b.cols.forEach((col, idx) => {
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'col-tabs__tab' + (activeColTab === idx ? ' is-active' : '');
        tab.textContent = `${t('bcCol')} ${idx + 1}`;
        tab.addEventListener('click', () => {
          activeColTab = idx;
          renderAll();
        });
        tabBar.appendChild(tab);
      });
      body.appendChild(tabBar);
      // Active column inspector content
      const activeCol = b.cols[activeColTab];
      if (activeCol) {
        body.appendChild(buildColumnInspector(b, activeCol, activeColTab));
      }
    }

    // Common: padding (skip for spacer and frame - frame uses x/y/w/h instead)
    if (b.type !== 'spacer' && b.type !== 'frame') {
      const pad = document.createElement('div');
      pad.className = 'inspector-section';
      pad.innerHTML = `<div class="inspector-section__title">${esc(t('labelPadding'))}</div>`;
      const grid = document.createElement('div');
      grid.className = 'padding-grid';
      grid.appendChild(fieldRangeMini('Top', b.paddingTop, 0, 200, (v) => updateBlock(b.id, { paddingTop: v })));
      grid.appendChild(fieldRangeMini('Bottom', b.paddingBottom, 0, 200, (v) => updateBlock(b.id, { paddingBottom: v })));
      grid.appendChild(fieldRangeMini('Left', b.paddingLeft, 0, 200, (v) => updateBlock(b.id, { paddingLeft: v })));
      grid.appendChild(fieldRangeMini('Right', b.paddingRight, 0, 200, (v) => updateBlock(b.id, { paddingRight: v })));
      pad.appendChild(grid);
      body.appendChild(pad);

      // Position X (free horizontal offset)
      const pos = document.createElement('div');
      pos.className = 'inspector-section';
      pos.innerHTML = `<div class="inspector-section__title">${esc(t('labelPosition'))}</div>`;
      pos.appendChild(fieldRange(t('labelOffsetX'), b.offsetX || 0, 0, 400, 'px', (v) => updateBlock(b.id, { offsetX: v })));
      body.appendChild(pos);
    }

    // Reorder controls
    const order = document.createElement('div');
    order.className = 'inspector-section';
    const loc = findContainer(b.id);
    const i = loc ? loc[1] : -1;
    const arr = loc ? loc[0] : [];
    order.innerHTML = `
      <div class="inspector-section__title">Reorder</div>
      <div class="inspector-field__row">
        <button type="button" class="hdr-btn hdr-btn--ghost" data-act="up" ${i <= 0 ? 'disabled' : ''}>&uarr;</button>
        <button type="button" class="hdr-btn hdr-btn--ghost" data-act="down" ${i >= arr.length - 1 ? 'disabled' : ''}>&darr;</button>
        <button type="button" class="hdr-btn hdr-btn--ghost" data-act="del" style="color:#ef4444">Delete</button>
      </div>`;
    order.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const a = btn.dataset.act;
      if (a === 'up') moveBlock(b.id, -1);
      else if (a === 'down') moveBlock(b.id, 1);
      else if (a === 'del') deleteBlock(b.id);
    });
    body.appendChild(order);
  }

  // ----------------------------------------
  // Field builders
  // ----------------------------------------
  function fieldText(label, value, onChange, placeholder) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    f.innerHTML = `<label class="inspector-field__label">${esc(label)}</label>
      <input class="inspector-field__input" type="text" value="${attr(value || '')}" placeholder="${attr(placeholder || '')}">`;
    const inp = f.querySelector('input');
    inp.addEventListener('input', (e) => onChange(e.target.value));
    inp.addEventListener('blur', commitMutation);
    return f;
  }
  function fieldTextarea(label, value, onChange) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    f.innerHTML = `<label class="inspector-field__label">${esc(label)}</label>
      <textarea class="inspector-field__textarea">${esc(value || '')}</textarea>`;
    const ta = f.querySelector('textarea');
    ta.addEventListener('input', (e) => onChange(e.target.value));
    ta.addEventListener('blur', commitMutation);
    return f;
  }
  function fieldColor(label, value, onChange) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    const safe = /^#([0-9a-fA-F]{6})$/.test(value || '') ? value : '#000000';
    f.innerHTML = `<label class="inspector-field__label">${esc(label)}</label>
      <div class="color-control">
        <input class="color-control__swatch" type="color" value="${safe}">
        <input class="color-control__hex" type="text" value="${attr(value || '')}" maxlength="7">
      </div>`;
    const sw = f.querySelector('.color-control__swatch');
    const hx = f.querySelector('.color-control__hex');
    sw.addEventListener('input', () => { hx.value = sw.value; onChange(sw.value); });
    sw.addEventListener('change', commitMutation);
    hx.addEventListener('change', () => {
      let v = hx.value.trim();
      if (!v.startsWith('#')) v = '#' + v;
      if (/^#([0-9a-fA-F]{6})$/.test(v)) { sw.value = v; onChange(v); commitMutation(); }
    });
    return f;
  }
  function fieldRange(label, value, min, max, unit, onChange) {
    return makeRangeField(label, value, min, max, unit, onChange, false);
  }
  function fieldRangeMini(label, value, min, max, onChange) {
    return makeRangeField(label, value, min, max, '', onChange, true);
  }
  function makeRangeField(label, value, min, max, unit, onChange, mini) {
    const f = document.createElement('div');
    f.className = 'inspector-field' + (mini ? ' inspector-field--mini' : '');
    const wrapClass = 'range-control' + (mini ? ' range-control--mini' : '');
    f.innerHTML = `<label class="inspector-field__label">${esc(label)}</label>
      <div class="${wrapClass}">
        <input class="range-control__slider" type="range" min="${min}" max="${max}" value="${value}">
        <input class="range-control__num" type="number" min="${min}" max="${max}" value="${value}" inputmode="numeric">
        ${unit ? `<span class="range-control__unit">${unit}</span>` : ''}
      </div>`;
    const sl = f.querySelector('.range-control__slider');
    const num = f.querySelector('.range-control__num');
    // Slider: drag => sync num + emit live; mouseup commits via 'change'.
    sl.addEventListener('input', () => {
      const v = parseInt(sl.value, 10);
      num.value = v;
      onChange(v);
    });
    sl.addEventListener('change', commitMutation);
    // Number input: type => sync slider + emit clamped value WITHOUT mutating num text
    // (so the user can keep typing "100" -> "1", "10", "100" without clobber).
    num.addEventListener('input', () => {
      const raw = num.value;
      if (raw === '' || raw === '-') return; // mid-typing
      const v = parseInt(raw, 10);
      if (isNaN(v)) return;
      const clamped = v < min ? min : (v > max ? max : v);
      sl.value = clamped;
      onChange(clamped);
    });
    // On blur, normalize: empty/invalid -> slider value, out-of-range -> clamp.
    // Also commits the live edit batch.
    num.addEventListener('blur', () => {
      let v = parseInt(num.value, 10);
      if (isNaN(v)) v = parseInt(sl.value, 10);
      if (v < min) v = min;
      if (v > max) v = max;
      num.value = v;
      sl.value = v;
      onChange(v);
      commitMutation();
    });
    // Enter commits + blurs
    num.addEventListener('keydown', (e) => { if (e.key === 'Enter') num.blur(); });
    return f;
  }
  function fieldSelect(label, value, options, onChange) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    const opts = options.map((o) => `<option value="${attr(o.v)}" ${o.v === value ? 'selected' : ''}>${esc(o.l)}</option>`).join('');
    f.innerHTML = `<label class="inspector-field__label">${esc(label)}</label>
      <select class="inspector-field__select">${opts}</select>`;
    f.querySelector('select').addEventListener('change', (e) => { onChange(e.target.value); commitMutation(); });
    return f;
  }
  function fieldAlign(value, onChange) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelAlign'))}</label>
      <div class="toggle-group">
        <button type="button" class="toggle-group__btn ${value === 'left' ? 'is-active' : ''}" data-v="left">${esc(t('alignLeft'))}</button>
        <button type="button" class="toggle-group__btn ${value === 'center' ? 'is-active' : ''}" data-v="center">${esc(t('alignCenter'))}</button>
        <button type="button" class="toggle-group__btn ${value === 'right' ? 'is-active' : ''}" data-v="right">${esc(t('alignRight'))}</button>
      </div>`;
    f.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => { onChange(btn.dataset.v); commitMutation(); }));
    return f;
  }
  function fieldImageUpload(block) {
    return fieldImageUploadFor(block, 'url');
  }
  function fieldImageUploadFor(block, propName) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelUploadImage'))}</label>
      <input type="file" accept="image/*" class="inspector-field__input" style="padding:5px;">`;
    f.querySelector('input').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0]; if (!file) return;
      if (file.size > 20 * 1024) showToast(t('base64Warn'));
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        // For image blocks, auto-detect natural dimensions and scale to fit
        if (propName === 'url' && block.type === 'image') {
          const probe = new Image();
          probe.onload = () => {
            let w = probe.naturalWidth || 120;
            let h = probe.naturalHeight || 120;
            // Cap at 300px to fit a typical 2-3 column layout without overflowing.
            // User can resize bigger via inspector if they want.
            if (w > 300) { h = Math.round(h * 300 / w); w = 300; }
            updateBlockFull(block.id, { url: dataUrl, width: w, height: h });
          };
          probe.onerror = () => updateBlockFull(block.id, { url: dataUrl });
          probe.src = dataUrl;
        } else {
          const patch = {}; patch[propName] = dataUrl;
          updateBlockFull(block.id, patch);
        }
      };
      reader.readAsDataURL(file);
    });
    return f;
  }
  function fieldColumnImageUpload(blockId, colIdx) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelUploadImage'))}</label>
      <input type="file" accept="image/*" class="inspector-field__input" style="padding:5px;">`;
    f.querySelector('input').addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0]; if (!file) return;
      if (file.size > 20 * 1024) showToast(t('base64Warn'));
      const reader = new FileReader();
      reader.onload = () => {
        // Update column bgImage and refresh inspector so the URL field shows the new dataURL
        const blk = findBlockDeep(blockId);
        if (!blk || !blk.cols || !blk.cols[colIdx]) return;
        pushHistory();
        blk.cols[colIdx].bgImage = reader.result;
        saveModel();
        renderAll();
      };
      reader.readAsDataURL(file);
    });
    return f;
  }
  function buildColumnInspector(b, col, idx) {
    const sec = document.createElement('div');
    sec.className = 'inspector-section inspector-section--col';
    sec.innerHTML = `<div class="inspector-section__title">${esc(t('labelColumn'))} ${idx + 1} (${col.width}%)</div>`;

    // Width slider rebalances other columns proportionally
    sec.appendChild(fieldRange(t('labelColWidth'), col.width, 10, 90, '%', (nv) => {
      const newCols = b.cols.map((c) => Object.assign({}, c));
      newCols[idx].width = nv;
      const others = newCols.filter((_, i) => i !== idx);
      const remainder = 100 - nv;
      const otherTotal = others.reduce((s, c) => s + c.width, 0) || 1;
      others.forEach((c) => {
        c.width = Math.max(5, Math.round(c.width / otherTotal * remainder));
      });
      updateBlock(b.id, { cols: newCols });
    }));

    // Vertical alignment toggle
    const va = col.valign || 'top';
    const vaField = document.createElement('div');
    vaField.className = 'inspector-field';
    vaField.innerHTML = `<label class="inspector-field__label">${esc(t('labelValign'))}</label>
      <div class="toggle-group">
        <button type="button" class="toggle-group__btn ${va === 'top' ? 'is-active' : ''}" data-v="top">${esc(t('valignTop'))}</button>
        <button type="button" class="toggle-group__btn ${va === 'middle' ? 'is-active' : ''}" data-v="middle">${esc(t('valignMid'))}</button>
        <button type="button" class="toggle-group__btn ${va === 'bottom' ? 'is-active' : ''}" data-v="bottom">${esc(t('valignBot'))}</button>
      </div>`;
    vaField.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      vaField.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x.dataset.v === btn.dataset.v));
      updateColumn(b.id, idx, { valign: btn.dataset.v });
      commitMutation();
    }));
    sec.appendChild(vaField);

    sec.appendChild(fieldColor(t('labelBgColor'), col.bgColor || '', (v) => updateColumn(b.id, idx, { bgColor: v })));
    sec.appendChild(fieldText(t('labelBgImage'), col.bgImage || '', (v) => updateColumn(b.id, idx, { bgImage: v }), 'https://...'));
    sec.appendChild(fieldColumnImageUpload(b.id, idx));
    // Bg size toggle - only meaningful when there's a bg image
    const bs = col.bgSize || 'contain';
    const bsField = document.createElement('div');
    bsField.className = 'inspector-field';
    bsField.innerHTML = `<label class="inspector-field__label">${esc(t('labelBgSize'))}</label>
      <div class="toggle-group">
        <button type="button" class="toggle-group__btn ${bs === 'contain' ? 'is-active' : ''}" data-v="contain">${esc(t('bgSizeContain'))}</button>
        <button type="button" class="toggle-group__btn ${bs === 'cover' ? 'is-active' : ''}" data-v="cover">${esc(t('bgSizeCover'))}</button>
        <button type="button" class="toggle-group__btn ${bs === 'auto' ? 'is-active' : ''}" data-v="auto">${esc(t('bgSizeAuto'))}</button>
      </div>`;
    bsField.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      bsField.querySelectorAll('button').forEach((x) => x.classList.toggle('is-active', x.dataset.v === btn.dataset.v));
      updateColumn(b.id, idx, { bgSize: btn.dataset.v });
      commitMutation();
    }));
    sec.appendChild(bsField);
    sec.appendChild(fieldRange(t('labelInnerPad'), col.innerPad || 0, 0, 40, 'px', (v) => updateColumn(b.id, idx, { innerPad: v })));
    sec.appendChild(fieldRange(t('labelMinHeight'), col.minHeight || 0, 0, 300, 'px', (v) => updateColumn(b.id, idx, { minHeight: v })));

    return sec;
  }
  function fieldFontFamily(value, onChange) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    const opts = FONT_STACKS.map((fs) =>
      `<option value="${attr(fs.v)}" ${fs.v === value ? 'selected' : ''} style="font-family:${fs.css};">${esc(fs.l)}</option>`
    ).join('');
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelFontFamily'))}</label>
      <select class="inspector-field__select" style="font-family:${fontCss(value)};">${opts}</select>`;
    const sel = f.querySelector('select');
    sel.addEventListener('change', () => {
      sel.style.fontFamily = fontCss(sel.value);
      onChange(sel.value);
      commitMutation();
    });
    return f;
  }
  function fieldGradientToggle(b) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    const on = b.gradient && b.gradient.enabled;
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelGradient'))}</label>
      <div class="toggle-group">
        <button type="button" class="toggle-group__btn ${!on ? 'is-active' : ''}" data-v="off">Solid</button>
        <button type="button" class="toggle-group__btn ${on ? 'is-active' : ''}" data-v="on">Gradient</button>
      </div>`;
    f.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      const next = btn.dataset.v === 'on';
      const grad = Object.assign({ enabled: false, start: '#f97316', end: '#ea580c', dir: 'lr' }, b.gradient || {});
      grad.enabled = next;
      updateBlockFull(b.id, { gradient: grad });
    }));
    return f;
  }
  function fieldGradientDir(value, onChange) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelGradientDir'))}</label>
      <div class="toggle-group">
        ${GRADIENT_DIRS.map(d => `<button type="button" class="toggle-group__btn ${d.v === value ? 'is-active' : ''}" data-v="${d.v}">${esc(t(d.l))}</button>`).join('')}
      </div>`;
    f.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => { onChange(btn.dataset.v); commitMutation(); }));
    return f;
  }
  function fieldAspectLock(b) {
    const f = document.createElement('div');
    f.className = 'inspector-field';
    const locked = b.aspectLocked !== false;
    f.innerHTML = `<label class="inspector-field__label">${esc(t('labelAspectLock'))}</label>
      <div class="toggle-group">
        <button type="button" class="toggle-group__btn ${locked ? 'is-active' : ''}" data-v="locked">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px;"><rect x="2.5" y="5.5" width="7" height="5" rx="0.8" stroke="currentColor" stroke-width="1.2"/><path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" stroke-width="1.2"/></svg>
          ${esc(t('aspectLocked'))}
        </button>
        <button type="button" class="toggle-group__btn ${!locked ? 'is-active' : ''}" data-v="free">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="display:inline-block;vertical-align:middle;margin-right:4px;"><rect x="2.5" y="5.5" width="7" height="5" rx="0.8" stroke="currentColor" stroke-width="1.2"/><path d="M4 5.5V4a2 2 0 013-1.7" stroke="currentColor" stroke-width="1.2"/></svg>
          ${esc(t('aspectFree'))}
        </button>
      </div>`;
    f.querySelectorAll('button').forEach((btn) => btn.addEventListener('click', () => {
      updateBlock(b.id, { aspectLocked: btn.dataset.v === 'locked' });
      commitMutation();
      // Refresh inspector to update active state on toggle
      btn.parentElement.querySelectorAll('.toggle-group__btn').forEach((x) => x.classList.toggle('is-active', x.dataset.v === btn.dataset.v));
    }));
    return f;
  }
  function fieldSocialList(b) {
    const f = document.createElement('div');
    f.className = 'inspector-section';
    f.innerHTML = `<div class="inspector-section__title">${esc(t('labelSocialPlatforms'))}</div>`;
    const list = document.createElement('div');
    list.className = 'social-list';
    b.links.forEach((lnk, idx) => {
      const row = document.createElement('div');
      row.className = 'social-list__row';
      const sel = SOCIAL_PRESETS.map(p => `<option value="${attr(p.id)}" ${p.id === lnk.platform ? 'selected' : ''}>${esc(p.label)}</option>`).join('');
      const preset = SOCIAL_PRESETS.find(p => p.id === lnk.platform) || SOCIAL_PRESETS[7];
      row.innerHTML = `
        <select class="inspector-field__select social-list__platform">${sel}</select>
        <input class="inspector-field__input social-list__url" type="text" value="${attr(lnk.url || '')}" placeholder="${attr(preset.urlHint)}">
        <button type="button" class="social-list__del" aria-label="Delete">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>`;
      const ps = row.querySelector('.social-list__platform');
      const ur = row.querySelector('.social-list__url');
      const del = row.querySelector('.social-list__del');
      ps.addEventListener('change', () => {
        const newLinks = b.links.map((x, i) => i === idx ? Object.assign({}, x, { platform: ps.value }) : x);
        updateBlock(b.id, { links: newLinks });
        commitMutation();
      });
      ur.addEventListener('input', () => {
        const newLinks = b.links.map((x, i) => i === idx ? Object.assign({}, x, { url: ur.value }) : x);
        updateBlock(b.id, { links: newLinks });
      });
      ur.addEventListener('blur', commitMutation);
      del.addEventListener('click', () => {
        const newLinks = b.links.filter((_, i) => i !== idx);
        updateBlockFull(b.id, { links: newLinks });
      });
      list.appendChild(row);
    });
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'hdr-btn hdr-btn--ghost social-list__add';
    addBtn.textContent = t('labelAddSocial');
    addBtn.addEventListener('click', () => {
      const newLinks = b.links.concat([{ id: uid(), platform: 'web', url: '' }]);
      updateBlockFull(b.id, { links: newLinks });
    });
    f.appendChild(list);
    f.appendChild(addBtn);
    return f;
  }

  // ----------------------------------------
  // Email-safe HTML renderer
  // ----------------------------------------
  function renderEmail() {
    const W = Math.min(MAX_SIG_WIDTH, Math.max(MIN_SIG_WIDTH, model.width || 600));
    const minH = model.minHeight || 0;
    const valign = model.valign || 'top';
    const heightAttr = minH ? ` height="${minH}"` : '';
    const minHeightStyle = minH ? ` min-height:${minH}px;` : '';
    // Stack mode skips frame blocks (they belong to free mode); leftover frames
    // from a previous mode session stay in the model but don't pollute the email.
    const blocks = (model.mode || 'stack') === 'free'
      ? renderEmailFree(W)
      : model.blocks.filter((b) => b.type !== 'frame').map(renderEmailBlock).join('\n');
    // Outer table holds height; inner wrap td handles vertical alignment via
    // valign attribute (Outlook) + vertical-align style (webmail). When the
    // signature's minHeight is greater than the content, this is what centers it.
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Signature</title>
<!--[if mso]>
<style type="text/css">
table, td, div, p, a { font-family: 'Segoe UI', Arial, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin:0; padding:0; background:#ffffff;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${W}"${heightAttr} style="border-collapse:collapse; width:${W}px; max-width:${W}px;${minHeightStyle} font-family:'Segoe UI', Arial, sans-serif;">
<tr><td valign="${valign}"${heightAttr} style="vertical-align:${valign};${minHeightStyle}">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
${blocks}
</table>
</td></tr>
</table>
</body>
</html>`;
  }

  function renderEmailBlock(b) {
    const padTop = b.paddingTop || 0;
    const padRight = b.paddingRight || 0;
    const padBottom = b.paddingBottom || 0;
    // offsetX is added to paddingLeft - email layouts cannot do free positioning,
    // so we shift the block right via padding (Outlook/Gmail respect this).
    const padLeft = (b.paddingLeft || 0) + (b.offsetX || 0);
    const padStyle = `padding-top:${padTop}px; padding-right:${padRight}px; padding-bottom:${padBottom}px; padding-left:${padLeft}px;`;

    if (b.type === 'text') {
      const inner = esc(b.text || '').replace(/\n/g, '<br />');
      const styleParts = [
        `font-family:${fontCss(b.fontFamily)}`,
        `font-size:${b.fontSize}px`,
        `font-weight:${b.fontWeight}`,
        `color:${b.color}`,
        `line-height:1.5`,
        `text-align:${b.align}`
      ].join('; ');
      const wrapped = b.link
        ? `<a href="${attr(b.link)}" style="color:${b.color}; text-decoration:none;">${inner}</a>`
        : inner;
      return `<tr><td style="${padStyle} ${styleParts}">${wrapped}</td></tr>`;
    }

    if (b.type === 'image') {
      if (!b.url) return `<tr><td style="${padStyle}">&nbsp;</td></tr>`;
      const heightAttr = b.height ? ` height="${b.height}"` : '';
      const heightStyle = b.height ? `height:${b.height}px;` : 'height:auto;';
      const img = `<img src="${attr(b.url)}" alt="${attr(b.alt || '')}" width="${b.width}"${heightAttr} style="display:block; border:0; outline:none; text-decoration:none; max-width:100%; ${heightStyle}" />`;
      const wrapped = b.link
        ? `<a href="${attr(b.link)}" style="text-decoration:none;">${img}</a>`
        : img;
      return `<tr><td style="${padStyle} text-align:${b.align};" align="${b.align}">${wrapped}</td></tr>`;
    }

    if (b.type === 'button') {
      const href = attr(b.link || '#');
      const txt = esc(b.text || '');
      const w = (b.paddingH * 2) + Math.max(80, (b.text || '').length * 7);
      const h = (b.paddingV * 2) + b.fontSize + 4;
      const useGrad = b.gradient && b.gradient.enabled;
      const cssBg = useGrad
        ? `background:${b.bgColor}; background-image:linear-gradient(${(GRADIENT_DIRS.find(x => x.v === b.gradient.dir) || GRADIENT_DIRS[0]).deg}, ${b.gradient.start}, ${b.gradient.end});`
        : `background-color:${b.bgColor};`;
      const fillColor = useGrad ? b.gradient.start : b.bgColor;
      const ff = fontCss(b.fontFamily);
      const vml = `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:${h}px; v-text-anchor:middle; width:${w}px;" arcsize="12%" stroke="f" fillcolor="${fillColor}">
<w:anchorlock/>
<center style="color:${b.textColor}; font-family:${ff}; font-size:${b.fontSize}px; font-weight:${b.fontWeight};">${txt}</center>
</v:roundrect>
<![endif]-->`;
      const a = `<!--[if !mso]><!-- --><a href="${href}" target="_blank" style="${cssBg} border-radius:6px; color:${b.textColor}; display:inline-block; font-family:${ff}; font-size:${b.fontSize}px; font-weight:${b.fontWeight}; line-height:1.2; padding-top:${b.paddingV}px; padding-right:${b.paddingH}px; padding-bottom:${b.paddingV}px; padding-left:${b.paddingH}px; text-decoration:none; mso-hide:all;">${txt}</a><!--<![endif]-->`;
      return `<tr><td style="${padStyle} text-align:${b.align};" align="${b.align}">${vml}${a}</td></tr>`;
    }

    if (b.type === 'divider') {
      return `<tr><td style="${padStyle}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td style="border-top:${b.thickness}px solid ${b.color}; font-size:0; line-height:0;">&nbsp;</td></tr></table></td></tr>`;
    }

    if (b.type === 'spacer') {
      return `<tr><td style="height:${b.height}px; line-height:${b.height}px; font-size:1px;">&nbsp;</td></tr>`;
    }

    if (b.type === 'social') {
      return renderEmailSocial(b, padStyle);
    }

    if (b.type === 'columns') {
      return renderEmailColumns(b, padStyle);
    }

    return '';
  }

  // Free mode -> stacked email rows. MVP: each frame becomes its own <tr>.
  // padding-top fills the vertical gap to the previous frame, padding-left places
  // it horizontally. Overlapping frames on the same Y axis are still rendered as
  // separate rows (Outlook can't do absolute positioning) - the user sees them
  // stacked in the preview, which is the realistic email constraint.
  function renderEmailFree(canvasWidth) {
    const frames = model.blocks
      .filter((b) => b.type === 'frame')
      .slice()
      .sort((a, b) => (a.y || 0) - (b.y || 0));
    if (frames.length === 0) return '<tr><td style="font-size:1px; line-height:1px;">&nbsp;</td></tr>';
    let lastBottom = 0;
    const rows = frames.map((f) => {
      const fx = Math.max(0, f.x || 0);
      const fy = Math.max(0, f.y || 0);
      const fw = Math.max(20, f.width || 100);
      const fh = Math.max(20, f.height || 60);
      const padTop = Math.max(0, fy - lastBottom);
      const padLeft = fx;
      const padRight = Math.max(0, canvasWidth - fx - fw);
      lastBottom = fy + fh;

      const innerPad = f.innerPad || 0;
      const bgColorAttr = f.bgColor ? ` bgcolor="${attr(f.bgColor)}"` : '';
      const bgImageAttr = f.bgImage ? ` background="${attr(f.bgImage)}"` : '';
      const innerBgStyle = [
        f.bgColor ? `background-color:${f.bgColor};` : '',
        f.bgImage ? `background-image:url('${f.bgImage}');background-size:cover;background-position:center;` : ''
      ].join('');
      // Each frame is wrapped in a fixed-width inner table so its background and height stay correct.
      const inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${fw}" height="${fh}"${bgColorAttr}${bgImageAttr} style="border-collapse:collapse; width:${fw}px; height:${fh}px; ${innerBgStyle}"><tr><td valign="top" style="padding:${innerPad}px;">&nbsp;</td></tr></table>`;
      return `<tr><td style="padding-top:${padTop}px; padding-left:${padLeft}px; padding-right:${padRight}px; padding-bottom:0; line-height:0; font-size:0;">${inner}</td></tr>`;
    });
    return rows.join('\n');
  }

  function renderEmailSocial(b, padStyle) {
    if (!b.links || b.links.length === 0) {
      return `<tr><td style="${padStyle}">&nbsp;</td></tr>`;
    }
    const align = b.align || 'left';
    const cells = b.links.map((lnk) => {
      const preset = SOCIAL_PRESETS.find(p => p.id === lnk.platform) || SOCIAL_PRESETS[7];
      const href = attr(lnk.url || '#');
      const lbl = esc(preset.label);
      if (b.style === 'pill') {
        return `<td style="padding-right:${b.gap || 8}px;"><a href="${href}" target="_blank" style="background-color:${preset.color}; color:#ffffff; display:inline-block; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; font-weight:600; line-height:1; padding:6px 12px; border-radius:999px; text-decoration:none;">${lbl}</a></td>`;
      }
      return `<td style="padding-right:${b.gap || 8}px; font-family:'Segoe UI', Arial, sans-serif; font-size:12px; font-weight:600;"><a href="${href}" target="_blank" style="color:${preset.color}; text-decoration:underline;">${lbl}</a></td>`;
    }).join('');
    return `<tr><td style="${padStyle} text-align:${align};" align="${align}">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; display:inline-table;"><tr>${cells}</tr></table>
</td></tr>`;
  }

  function renderEmailColumns(b, padStyle) {
    const gap = b.gap || 12;
    const cols = b.cols.map((col, idx) => {
      const isLast = idx === b.cols.length - 1;
      const inner = col.blocks.length === 0
        ? '&nbsp;'
        : `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">${col.blocks.map(renderEmailBlock).join('')}</table>`;

      // Per-col padding: own innerPad on each side; gap added to right padding when not last.
      const cp = col.innerPad || 0;
      const padRight = cp + (isLast ? 0 : gap);
      const valign = col.valign || 'top';
      const bgColorAttr = col.bgColor ? ` bgcolor="${attr(col.bgColor)}"` : '';
      const bgImageAttr = col.bgImage ? ` background="${attr(col.bgImage)}"` : '';
      // height attr (Outlook respects this); min-height in style for webmail
      const heightAttr = col.minHeight ? ` height="${col.minHeight}"` : '';
      const styleParts = [
        `width:${col.width}%`,
        `padding-top:${cp}px`,
        `padding-right:${padRight}px`,
        `padding-bottom:${cp}px`,
        `padding-left:${cp}px`,
        col.bgColor ? `background-color:${col.bgColor}` : '',
        col.bgImage ? `background-image:url('${col.bgImage}'); background-size:${col.bgSize || 'contain'}; background-position:center; background-repeat:no-repeat` : '',
        col.minHeight ? `min-height:${col.minHeight}px` : ''
      ].filter(Boolean).join('; ');
      return `<td valign="${valign}" width="${col.width}%"${heightAttr}${bgColorAttr}${bgImageAttr} style="${styleParts};">${inner}</td>`;
    }).join('');

    const innerPad = b.innerPad || 0;
    const minH = b.minHeight || 0;
    const minHAttr = minH ? ` height="${minH}"` : '';
    const minHStyle = minH ? ` min-height:${minH}px;` : '';
    const inner = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr>${cols}</tr></table>`;
    if (b.bgImage || b.bgColor) {
      const bgAttr = b.bgImage ? ` background="${attr(b.bgImage)}"` : '';
      const bgColorAttr = b.bgColor ? ` bgcolor="${attr(b.bgColor)}"` : '';
      const bgStyle = [
        b.bgColor ? `background-color:${b.bgColor};` : '',
        b.bgImage ? `background-image:url('${b.bgImage}');background-size:cover;background-position:center;background-repeat:no-repeat;` : ''
      ].join('');
      return `<tr><td style="${padStyle}">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"${bgAttr}${bgColorAttr} style="border-collapse:collapse;${minHStyle} ${bgStyle}">
    <tr><td${minHAttr} style="padding:${innerPad}px;${minHStyle}">${inner}</td></tr>
  </table>
</td></tr>`;
    }
    return `<tr><td${minHAttr} style="${padStyle}${minHStyle}">${inner}</td></tr>`;
  }

  // ----------------------------------------
  // Preview overlay
  // ----------------------------------------
  function openPreview() {
    const overlay = document.getElementById('previewOverlay');
    const frame = document.getElementById('previewFrame');
    const code = document.getElementById('previewCode');
    if (!overlay || !frame || !code) return;
    const html = renderEmail();
    code.textContent = html;
    frame.srcdoc = html;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('show'));
  }
  function closePreview() {
    const overlay = document.getElementById('previewOverlay');
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => { overlay.hidden = true; }, 200);
  }
  function switchPreviewTab(tabType, device) {
    document.querySelectorAll('.preview-dialog__tab').forEach((b) => {
      const isActive = b.dataset.tab === tabType && (b.dataset.device || '') === (device || '');
      b.classList.toggle('is-active', isActive);
    });
    const wrap = document.getElementById('previewFrameWrap');
    const code = document.getElementById('previewCode');
    if (tabType === 'preview') {
      if (wrap) wrap.style.display = 'flex';
      if (code) code.style.display = 'none';
      if (device) setPreviewDevice(device);
    } else {
      if (wrap) wrap.style.display = 'none';
      if (code) code.style.display = 'block';
    }
  }
  function setPreviewDevice(d) {
    previewDevice = d;
    const wrap = document.getElementById('previewFrameWrap');
    if (!wrap) return;
    wrap.classList.toggle('preview-frame-wrap--mobile', d === 'mobile');
  }

  // ----------------------------------------
  // Zoom
  // ----------------------------------------
  function applyZoom() {
    const frame = document.getElementById('canvasFrame');
    if (!frame) return;
    frame.style.transform = `scale(${zoomLevel / 100})`;
    frame.style.transformOrigin = 'top center';
    const lbl = document.getElementById('zoomLabel');
    if (lbl) lbl.textContent = zoomLevel + '%';
    try { localStorage.setItem('formattedai-signature-zoom', String(zoomLevel)); } catch (_) {}
  }
  function setZoom(v) {
    zoomLevel = Math.max(50, Math.min(150, v));
    applyZoom();
  }

  // ----------------------------------------
  // Copy / Download
  // ----------------------------------------
  function copyHTML() {
    const html = renderEmail();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(html).then(() => showToast(t('copySuccess')));
    } else {
      const ta = document.createElement('textarea');
      ta.value = html; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); showToast(t('copySuccess')); } catch (_) {}
      document.body.removeChild(ta);
    }
  }
  function downloadHTML() {
    const html = renderEmail();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'signature.html';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ----------------------------------------
  // Helpers
  // ----------------------------------------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function attr(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastText');
    if (!toast || !text) return;
    text.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  // ----------------------------------------
  // Render orchestrator
  // ----------------------------------------
  function renderAll() {
    validateSelection();
    renderCanvasToolbar();
    renderCanvas();
    markSelectionAncestors();
    renderInspector();
    updateUndoRedoButtons();
    applyZoom();
    updateSizeBadge();
    checkOverflowWarning();
  }
  // Mark parent layers of the current selection with a ghost outline so the user
  // sees the path: selected (solid orange/blue/green) + ancestors (lavender dashed).
  function markSelectionAncestors() {
    document.querySelectorAll('.is-parent-of-selected')
      .forEach((el) => el.classList.remove('is-parent-of-selected'));
    if (!selectedId) return;
    const ctx = findBlockColumnContext(selectedId);
    if (!ctx) return;
    const rowEl = document.querySelector(`.canvas-block[data-id="${ctx.rowBlock.id}"]`);
    if (rowEl) rowEl.classList.add('is-parent-of-selected');
    const colEl = document.querySelector(`.canvas-col[data-col-id="${ctx.col.id}"]`);
    if (colEl) colEl.classList.add('is-parent-of-selected');
  }

  // Persistent toolbar above the canvas. Shows global signature settings
  // (mode, width, min/max height, vertical alignment) regardless of selection.
  // The user no longer needs to deselect to reach these.
  function renderCanvasToolbar() {
    const tb = document.getElementById('canvasToolbar');
    if (!tb) return;
    tb.innerHTML = '';

    // Mode toggle (Stack | Free) - block kinds differ between modes so we reset selection.
    const mode = model.mode || 'stack';
    tb.appendChild(toolbarToggle(t('labelMode'),
      [{ v: 'stack', l: t('modeStack') }, { v: 'free', l: t('modeFree') }],
      mode,
      (v) => {
        if (model.mode === v) return;
        commitMutation();
        pushHistory();
        model.mode = v;
        selectedId = null; selectedColId = null;
        saveModel();
        renderAll();
      }
    ));

    // Width / minHeight / maxHeight: live-update + clamp on commit.
    tb.appendChild(toolbarNumField(t('labelWidth'), model.width || 600, MIN_SIG_WIDTH, MAX_SIG_WIDTH, 'px',
      (v) => mutateModel({ width: Math.min(MAX_SIG_WIDTH, Math.max(MIN_SIG_WIDTH, v)) })
    ));
    tb.appendChild(toolbarNumField(t('labelMinHeight'), model.minHeight || 0, 0, 600, 'px',
      (v) => mutateModel({ minHeight: Math.max(0, Math.min(600, v)) })
    ));
    tb.appendChild(toolbarNumField(t('labelMaxHeight'), model.maxHeight || 0, 0, 800, 'px',
      (v) => mutateModel({ maxHeight: Math.max(0, Math.min(800, v)) })
    ));

    // Vertical alignment - one-shot button click, commits immediately.
    const valign = model.valign || 'top';
    tb.appendChild(toolbarToggle(t('labelValign'),
      [
        { v: 'top',    l: t('valignTop') },
        { v: 'middle', l: t('valignMid') },
        { v: 'bottom', l: t('valignBot') }
      ],
      valign,
      (v) => { mutateModel({ valign: v }); commitMutation(); renderCanvasToolbar(); }
    ));
  }
  function toolbarToggle(label, options, value, onPick) {
    const wrap = document.createElement('div');
    wrap.className = 'canvas-toolbar__group';
    const lbl = document.createElement('span');
    lbl.className = 'canvas-toolbar__label';
    lbl.textContent = label;
    wrap.appendChild(lbl);
    const grp = document.createElement('div');
    grp.className = 'toggle-group toggle-group--mini';
    options.forEach((opt) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'toggle-group__btn' + (opt.v === value ? ' is-active' : '');
      b.textContent = opt.l;
      b.addEventListener('click', () => onPick(opt.v));
      grp.appendChild(b);
    });
    wrap.appendChild(grp);
    return wrap;
  }
  function toolbarNumField(label, value, min, max, unit, onLive) {
    const wrap = document.createElement('div');
    wrap.className = 'canvas-toolbar__group';
    const lbl = document.createElement('span');
    lbl.className = 'canvas-toolbar__label';
    lbl.textContent = label;
    wrap.appendChild(lbl);
    const num = document.createElement('input');
    num.type = 'number';
    num.className = 'canvas-toolbar__num';
    num.min = min; num.max = max;
    num.value = value;
    num.inputMode = 'numeric';
    num.addEventListener('input', () => {
      const raw = num.value;
      if (raw === '' || raw === '-') return;
      const v = parseInt(raw, 10);
      if (isNaN(v)) return;
      const clamped = v < min ? min : (v > max ? max : v);
      onLive(clamped);
    });
    num.addEventListener('blur', () => {
      let v = parseInt(num.value, 10);
      if (isNaN(v)) v = value;
      if (v < min) v = min;
      if (v > max) v = max;
      num.value = v;
      onLive(v);
      commitMutation();
    });
    num.addEventListener('keydown', (e) => { if (e.key === 'Enter') num.blur(); });
    wrap.appendChild(num);
    if (unit) {
      const u = document.createElement('span');
      u.className = 'canvas-toolbar__unit';
      u.textContent = unit;
      wrap.appendChild(u);
    }
    return wrap;
  }
  // Tells the user when the content is taller than their max-height setting.
  // Visible red border + label under the canvas. No scrollbar - max is max.
  function checkOverflowWarning() {
    const frame = document.getElementById('canvasFrame');
    if (!frame) return;
    if (!model.maxHeight) {
      frame.classList.remove('canvas-frame--overflow');
      frame.removeAttribute('data-warn');
      return;
    }
    const actual = frame.scrollHeight;
    const exceeds = actual > model.maxHeight;
    frame.classList.toggle('canvas-frame--overflow', exceeds);
    if (exceeds) {
      frame.dataset.warn = `${t('warnOverflow')} ${actual} / ${model.maxHeight}px`;
    } else {
      frame.removeAttribute('data-warn');
    }
  }
  function updateSizeBadge() {
    const badge = document.getElementById('sizeBadge');
    const frame = document.getElementById('canvasFrame');
    if (!badge || !frame) return;
    const w = model.width || 600;
    const h = model.blocks.length === 0 ? 'auto' : Math.round(frame.getBoundingClientRect().height / (zoomLevel / 100)) + 'px';
    badge.textContent = w + ' × ' + h;
  }

  function updateUndoRedoButtons() {
    const ub = document.getElementById('undoBtn');
    const rb = document.getElementById('redoBtn');
    if (ub) ub.disabled = !canUndo();
    if (rb) rb.disabled = !canRedo();
  }

  // ----------------------------------------
  // i18n + theme
  // ----------------------------------------
  function applyT() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const k = el.getAttribute('data-i18n');
      if (T[lang][k] !== undefined) el.textContent = T[lang][k];
    });
  }
  function applyTheme(v) {
    document.documentElement.setAttribute('data-theme', v);
    const moon = document.getElementById('iconMoon');
    const sun = document.getElementById('iconSun');
    if (sun && moon) {
      sun.style.display = v === 'dark' ? 'block' : 'none';
      moon.style.display = v === 'dark' ? 'none' : 'block';
    }
  }

  // ----------------------------------------
  // Init
  // ----------------------------------------
  function init() {
    applyT();
    let theme = localStorage.getItem('formattedai-theme') || 'light';
    applyTheme(theme);
    const tt = document.getElementById('themeToggle');
    if (tt) tt.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('formattedai-theme', theme);
      applyTheme(theme);
    });

    // Initial history snapshot
    pushHistory();

    // Palette: click adds to top-level, drag-drop adds at precise position
    document.querySelectorAll('.palette-item[data-block]').forEach((el) => {
      el.addEventListener('click', () => addBlock(el.dataset.block));
      el.draggable = true;
      el.addEventListener('dragstart', (e) => {
        dragId = '__palette:' + el.dataset.block;
        try { e.dataTransfer.setData('text/plain', dragId); } catch (_) {}
        e.dataTransfer.effectAllowed = 'copy';
        el.classList.add('palette-item--dragging');
      });
      el.addEventListener('dragend', () => {
        dragId = null;
        el.classList.remove('palette-item--dragging');
        document.querySelectorAll('.drop-above, .drop-below').forEach((x) => x.classList.remove('drop-above', 'drop-below'));
        document.querySelectorAll('.canvas-col--drop-target, .canvas-frame--drop-target').forEach((x) => x.classList.remove('canvas-col--drop-target', 'canvas-frame--drop-target'));
      });
    });
    // Templates
    document.querySelectorAll('.palette-template[data-template]').forEach((el) => {
      el.addEventListener('click', () => applyTemplate(el.dataset.template));
    });

    // Toolbar
    document.getElementById('previewBtn')?.addEventListener('click', openPreview);
    document.getElementById('copyBtn')?.addEventListener('click', copyHTML);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadHTML);
    document.getElementById('resetBtn')?.addEventListener('click', resetModel);
    document.getElementById('undoBtn')?.addEventListener('click', undo);
    document.getElementById('redoBtn')?.addEventListener('click', redo);

    // Preview overlay
    document.getElementById('previewClose')?.addEventListener('click', closePreview);
    document.getElementById('previewOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'previewOverlay') closePreview();
    });
    document.querySelectorAll('.preview-dialog__tab').forEach((b) => {
      b.addEventListener('click', () => switchPreviewTab(b.dataset.tab, b.dataset.device));
    });

    // Zoom controls
    document.getElementById('zoomIn')?.addEventListener('click', () => setZoom(zoomLevel + 10));
    document.getElementById('zoomOut')?.addEventListener('click', () => setZoom(zoomLevel - 10));
    document.getElementById('zoomLabel')?.addEventListener('click', () => setZoom(100));

    // Click on the bare canvas-frame (not on any col / block) clears selection.
    // canvas-col has its own handler (selects the column), canvas-block too (selects block).
    document.getElementById('canvasFrame')?.addEventListener('click', (e) => {
      if (e.target.id === 'canvasFrame' || e.target.classList.contains('canvas-empty')) {
        selectedId = null;
        selectedColId = null;
        renderAll();
      }
    });

    // Keyboard: Esc deselect / close preview, Del delete, Ctrl+Z undo, Ctrl+Y redo, Arrows nudge
    document.addEventListener('keydown', (e) => {
      const ae = document.activeElement;
      const inField = ae && (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(ae.tagName) ||
        ae.isContentEditable
      );
      if (e.key === 'Escape') {
        const overlay = document.getElementById('previewOverlay');
        if (overlay && !overlay.hidden) closePreview();
        else if (selectedColId) { selectedColId = null; renderAll(); }
        else if (selectedId) { selectedId = null; renderAll(); }
      }
      if (e.key === 'Delete' && selectedId && !inField) {
        deleteBlock(selectedId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!inField) { e.preventDefault(); undo(); }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        if (!inField) { e.preventDefault(); redo(); }
      }
      // Arrow keys nudge selected block (Figma-like). 1px / Shift+10px.
      // Multi-key bursts coalesce into one history entry via debounced commit.
      if (selectedId && !inField &&
          ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const b = findBlockDeep(selectedId);
        if (!b) return;
        if (e.key === 'ArrowLeft')  updateBlock(selectedId, { offsetX:    Math.max(0,   (b.offsetX    || 0) - step) });
        if (e.key === 'ArrowRight') updateBlock(selectedId, { offsetX:    Math.min(400, (b.offsetX    || 0) + step) });
        if (e.key === 'ArrowUp')    updateBlock(selectedId, { paddingTop: Math.max(0,   (b.paddingTop || 0) - step) });
        if (e.key === 'ArrowDown')  updateBlock(selectedId, { paddingTop: Math.min(200, (b.paddingTop || 0) + step) });
        commitMutationDebounced(400);
      }
    });

    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
