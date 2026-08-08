// ============================================
// FormattedAI - odczyt wymiarow obrazu z naglowka pliku
// Czyta tylko poczatkowy fragment pliku i parsuje naglowek - nie dekoduje pikseli,
// wiec nie alokuje pamieci proporcjonalnej do rozdzielczosci. Dzieki temu limit
// megapikseli mozna sprawdzic zanim cokolwiek zostanie zaalokowane.
// Gdy formatu nie da sie rozpoznac, zwracamy null - plik przechodzi dalej,
// a limit jest weryfikowany ponownie po dekodzie.
// ============================================

// EXIF/ICC w JPEG potrafi zajac kilkadziesiat KB przed markerem SOF
const HEADER_BYTES = 256 * 1024;

async function readHeader(file) {
  const slice = file.slice(0, Math.min(HEADER_BYTES, file.size));
  const buffer = await slice.arrayBuffer();
  return new DataView(buffer);
}

// PNG: 8B sygnatury + 4B dlugosci + "IHDR", potem szerokosc i wysokosc
function readPngSize(view) {
  if (view.byteLength < 24) return null;
  if (view.getUint32(0) !== 0x89504e47 || view.getUint32(4) !== 0x0d0a1a0a) return null;
  if (view.getUint32(12) !== 0x49484452) return null;
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

// JPEG: przechodzimy po markerach do pierwszego SOFn (poza SOF4/SOF8/SOF12)
function readJpegSize(view) {
  if (view.byteLength < 4) return null;
  if (view.getUint16(0) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 4 <= view.byteLength) {
    if (view.getUint8(offset) !== 0xff) {
      offset++;
      continue;
    }
    const marker = view.getUint8(offset + 1);
    // 0xFF jako wypelniacz przed wlasciwym markerem
    if (marker === 0xff) {
      offset++;
      continue;
    }
    // markery bez pola dlugosci: TEM, RSTn, SOI, EOI
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    // start of scan - dalej ida juz dane obrazu, SOF nie bylo w odczytanym fragmencie
    if (marker === 0xda) return null;

    const length = view.getUint16(offset + 2);
    if (length < 2) return null;

    const isSof = marker >= 0xc0 && marker <= 0xcf
      && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) {
      if (offset + 9 > view.byteLength) return null;
      return { width: view.getUint16(offset + 7), height: view.getUint16(offset + 5) };
    }

    offset += 2 + length;
  }
  return null;
}

// WebP: RIFF + WEBP + chunk VP8 (stratny), VP8L (bezstratny) albo VP8X (rozszerzony)
function readWebpSize(view) {
  if (view.byteLength < 30) return null;
  if (view.getUint32(0) !== 0x52494646) return null;
  if (view.getUint32(8) !== 0x57454250) return null;

  const chunk = view.getUint32(12);

  if (chunk === 0x56503820) {
    if (view.getUint8(23) !== 0x9d || view.getUint8(24) !== 0x01 || view.getUint8(25) !== 0x2a) return null;
    return {
      width: view.getUint16(26, true) & 0x3fff,
      height: view.getUint16(28, true) & 0x3fff,
    };
  }

  if (chunk === 0x5650384c) {
    if (view.getUint8(20) !== 0x2f) return null;
    const bits = view.getUint32(21, true);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  if (chunk === 0x56503858) {
    const width = view.getUint8(24) | (view.getUint8(25) << 8) | (view.getUint8(26) << 16);
    const height = view.getUint8(27) | (view.getUint8(28) << 8) | (view.getUint8(29) << 16);
    return { width: width + 1, height: height + 1 };
  }

  return null;
}

// HEIC/HEIF (ISOBMFF): szukamy boxow "ispe" (ImageSpatialExtentsProperty).
// Plik moze zawierac kilka pozycji (miniatura, kafelki gridu) - bierzemy najwieksza,
// bo to ona odpowiada obrazowi glownemu.
function readHeifSize(view) {
  if (view.byteLength < 32) return null;
  if (view.getUint32(4) !== 0x66747970) return null;

  let best = null;
  for (let i = 4; i + 16 <= view.byteLength; i++) {
    if (view.getUint32(i) !== 0x69737065) continue;
    // box ispe ma stala dlugosc 20 bajtow - to odsiewa przypadkowe trafienia w danych
    if (view.getUint32(i - 4) !== 20) continue;

    const width = view.getUint32(i + 8);
    const height = view.getUint32(i + 12);
    if (!width || !height) continue;
    if (!best || width * height > best.width * best.height) best = { width, height };
  }
  return best;
}

// Zwraca { width, height } albo null, gdy naglowka nie da sie odczytac.
export async function readImageSize(file) {
  try {
    const view = await readHeader(file);
    const size = readPngSize(view)
      || readJpegSize(view)
      || readWebpSize(view)
      || readHeifSize(view);
    if (!size || !(size.width > 0) || !(size.height > 0)) return null;
    return size;
  } catch (err) {
    return null;
  }
}

// Sprawdza limit na podstawie naglowka. Gdy wymiarow nie udalo sie odczytac,
// przepuszczamy plik dalej - limit zostanie sprawdzony po dekodzie.
export async function exceedsPixelLimit(file, maxPixels) {
  if (!(maxPixels > 0)) return false;
  const size = await readImageSize(file);
  if (!size) return false;
  return size.width * size.height > maxPixels;
}
