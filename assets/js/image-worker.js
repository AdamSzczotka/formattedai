// ============================================
// FormattedAI - wspolny worker konwersji obrazow
// Obsluguje oba narzedzia, bo sciezka "dekoduj -> ImageData -> enkoduj AVIF"
// jest w nich identyczna:
//   task 'avif' - AVIF Converter (dekod PNG/JPG/WebP + enkod AVIF)
//   task 'heic' - HEIC Converter (dekod HEIC + zapis do JPG/PNG/AVIF)
// Biblioteki ladowane sa leniwie, z tych samych URL-i i wersji co na main thread,
// wiec import dotyczy tylko tego, co dane zadanie faktycznie wykorzysta.
// ============================================

const AVIF_ENCODER_URL = 'https://esm.sh/@jsquash/avif@2.1.1/encode.js';
const HEIC_DECODER_URL = 'https://cdn.jsdelivr.net/npm/heic-to@1.4.2/+esm';

// OffscreenCanvas jest jedyna droga do ImageData wewnatrz workera
const CANVAS_READY = typeof OffscreenCanvas === 'function' && typeof createImageBitmap === 'function';

let avifEncodePromise = null;
let heicModulePromise = null;

// Nie modyfikujemy oryginalnego bledu - DOMException ma wlasne, tylko do odczytu "code"
function taggedError(code, err) {
  const message = err && err.message ? err.message : String(err || code);
  const error = new Error(message);
  error.code = code;
  return error;
}

function loadAvifEncode() {
  if (!avifEncodePromise) {
    avifEncodePromise = import(AVIF_ENCODER_URL)
      .then(mod => mod.default || mod)
      .catch(err => {
        avifEncodePromise = null;
        throw taggedError('load', err);
      });
  }
  return avifEncodePromise;
}

function loadHeicModule() {
  if (!heicModulePromise) {
    heicModulePromise = import(HEIC_DECODER_URL)
      .catch(err => {
        heicModulePromise = null;
        throw taggedError('load', err);
      });
  }
  return heicModulePromise;
}

// Meldunek o wejsciu w kolejny etap zadania. Klient odswieza wtedy swoj watchdog, a przy
// etapie 'encode' dostaje jeszcze liczbe pikseli, z ktorej liczy budzet czasu - inaczej
// jeden staly limit musialby objac zarowno maly plik, jak i bezstratne 50 Mpx.
function reportStage(id, stage, pixels) {
  self.postMessage({ id, stage, pixels: pixels || 0 });
}

function ensurePixelBudget(width, height, maxPixels) {
  if (maxPixels > 0 && width * height > maxPixels) {
    throw taggedError('megapixels', new Error('Image exceeds the megapixel limit'));
  }
}

function drawToCanvas(bitmap) {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw taggedError('convert', new Error('2D context unavailable'));
  ctx.drawImage(bitmap, 0, 0);
  return { canvas, ctx };
}

function closeBitmap(bitmap) {
  if (bitmap && typeof bitmap.close === 'function') bitmap.close();
}

async function decodeBitmap(source) {
  try {
    return await createImageBitmap(source, { imageOrientation: 'from-image' });
  } catch (err) {
    return await createImageBitmap(source);
  }
}

// --- AVIF Converter ---
async function convertAvif(msg) {
  const encode = await loadAvifEncode();
  reportStage(msg.id, 'decode');

  const bitmap = await decodeBitmap(msg.blob);
  let imageData;
  try {
    ensurePixelBudget(bitmap.width, bitmap.height, msg.maxPixels);
    imageData = drawToCanvas(bitmap).ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    closeBitmap(bitmap);
  }

  reportStage(msg.id, 'encode', imageData.width * imageData.height);
  const buffer = await encode(imageData, msg.encodeOptions);
  return { buffer, mime: 'image/avif' };
}

// --- HEIC Converter ---
// heic-to w wariancie blobowym siega po document.createElement, wiec w workerze
// uzywamy wariantu 'bitmap' - libheif zwraca te same piksele, tylko bez kroku
// przez canvas z DOM.
async function convertHeic(msg) {
  const heicModule = await loadHeicModule();
  reportStage(msg.id, 'decode');

  let bitmap;
  try {
    bitmap = await heicModule.heicTo({ blob: msg.blob, type: 'bitmap' });
  } catch (err) {
    throw taggedError('convert', err);
  }

  try {
    ensurePixelBudget(bitmap.width, bitmap.height, msg.maxPixels);
    const pixels = bitmap.width * bitmap.height;

    if (msg.format === 'avif') {
      const encode = await loadAvifEncode();
      const imageData = drawToCanvas(bitmap).ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      reportStage(msg.id, 'encode', pixels);
      const buffer = await encode(imageData, msg.encodeOptions);
      return { buffer, mime: 'image/avif' };
    }

    const mime = msg.format === 'png' ? 'image/png' : 'image/jpeg';
    const { canvas } = drawToCanvas(bitmap);
    reportStage(msg.id, 'encode', pixels);
    const blob = msg.format === 'png'
      ? await canvas.convertToBlob({ type: mime })
      : await canvas.convertToBlob({ type: mime, quality: msg.quality / 100 });

    return { buffer: await blob.arrayBuffer(), mime };
  } finally {
    closeBitmap(bitmap);
  }
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  const id = msg.id;

  // Potwierdzenie odbioru wysylamy przed jakakolwiek praca - to jedyny dowod dla klienta,
  // ze skrypt workera wstal i instancja zyje. Bez niego klient nie odroznilby dlugiego
  // enkodowania od workera, ktory nigdy sie nie odezwie.
  self.postMessage({ id, ack: true });

  try {
    if (!CANVAS_READY) {
      throw taggedError('load', new Error('OffscreenCanvas unavailable in worker'));
    }

    const result = msg.task === 'heic' ? await convertHeic(msg) : await convertAvif(msg);
    self.postMessage({ id, ok: true, buffer: result.buffer, mime: result.mime }, [result.buffer]);
  } catch (err) {
    // bledy raportujemy jako wiadomosc per plik - nigdy jako wyjatek globalny,
    // ktory ubilby workera na caly batch
    self.postMessage({
      id,
      ok: false,
      code: err && typeof err.code === 'string' ? err.code : 'convert',
      message: err && err.message ? err.message : '',
    });
  }
};
