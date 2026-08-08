// ============================================
// FormattedAI - klient wspolnego workera konwersji obrazow
// Worker powstaje leniwie przy pierwszej konwersji. Sciezka jest absolutna,
// zeby dzialala tak samo z / jak i z /en/.
// Gdy przegladarka nie ma Web Workerow, skrypt workera sie nie zaladuje, worker
// przestanie odpowiadac albo padnie w trakcie batcha - zadanie wraca na obecna
// sciezke main-thread i narzedzie dziala dalej.
// ============================================

// Krok "Cache-bust asset URLs" w .github/workflows/deploy.yml stempluje ten adres
// wersja (?v=<sha>) razem z URL-ami w HTML, wiec klient i worker sa po deployu zawsze
// z tego samego builda. Bez tego przegladarka pobralaby nowy avif.min.js/heic.min.js,
// ale zostala przy starym workerze z cache i protokol by sie rozjechal.
const WORKER_URL = '/assets/js/image-worker.min.js';

// Worker potwierdza przyjecie zadania od razu po odebraniu wiadomosci. Brak ACK
// oznacza, ze skrypt workera w ogole nie wstal albo instancja jest juz martwa.
const ACK_TIMEOUT_MS = 15000;
// Watchdog na etap zadania - worker moze umrzec bez zdarzenia error (ubity przy braku
// pamieci, zawieszony import z CDN), a wtedy obietnica nigdy by sie nie rozstrzygnela
// i UI zostalby zablokowany na stale. Worker melduje kazdy etap (import bibliotek,
// dekod, enkod), a kazdy meldunek odswieza ten limit - dzieki temu jeden staly timer
// nie musi pokrywac calej, bardzo zmiennej dlugosci zadania.
const PHASE_TIMEOUT_MS = 180000;
// Enkodowanie to jedyny etap, ktory skaluje sie wprost z rozdzielczoscia, a przy
// presecie bezstratnym potrafi trwac wielokrotnie dluzej niz stratny - 50 Mpx bez strat
// to na przecietnym sprzecie kilkanascie minut. Dlatego limit tego etapu liczymy z
// liczby megapikseli zamiast trzymac sztywna wartosc, ktora uznalaby zywego workera
// za martwego w polowie pracy.
const ENCODE_BASE_MS = 60000;
const ENCODE_MS_PER_MEGAPIXEL = 5000;
const LOSSLESS_FACTOR = 4;
// Ile razy weryfikujemy werdykt jeszcze niesprawdzonego workera na main thread.
// Gdy obie sciezki wywroca sie na tym samym pliku, wina lezy po stronie pliku -
// po dwoch takich zgodnych werdyktach przestajemy dublowac prace.
const MAX_PROBES = 2;

let worker = null;
let workerBroken = false;
// worker uznajemy za sprawdzony po pierwszym udanym zadaniu albo po tym, jak jego
// werdykt o bledzie potwierdzi sie na main thread
let workerTrusted = false;
let probeCount = 0;
let jobCounter = 0;
const pendingJobs = new Map();

function fallbackError(message, cause) {
  const err = new Error(message);
  err.workerFallback = true;
  if (cause) err.cause = cause;
  return err;
}

function isSupported() {
  return typeof Worker === 'function'
    && typeof OffscreenCanvas === 'function'
    && typeof createImageBitmap === 'function';
}

function canUseWorker() {
  return !workerBroken && isSupported();
}

function clearJobTimer(job) {
  if (job.timer) {
    clearTimeout(job.timer);
    job.timer = null;
  }
}

// Budzet etapu enkodowania: baza na rozruch encodera plus czas proporcjonalny do
// liczby pikseli, pomnozony przy trybie bezstratnym. Gdy worker nie zdazyl podac
// wymiarow, zostajemy przy zwyklym limicie etapu.
function encodeTimeout(payload, pixels) {
  if (!pixels || pixels <= 0) return PHASE_TIMEOUT_MS;

  const options = payload && payload.encodeOptions;
  const toAvif = payload && (payload.task === 'avif' || payload.format === 'avif');
  const perMegapixel = toAvif && options && options.lossless
    ? ENCODE_MS_PER_MEGAPIXEL * LOSSLESS_FACTOR
    : ENCODE_MS_PER_MEGAPIXEL;

  return ENCODE_BASE_MS + Math.ceil((pixels / 1000000) * perMegapixel);
}

// allowFallback mowi, czy po przekroczeniu limitu ma sens powtorzenie zadania na main
// thread. Do konca dekodu praca jest tania i powtarzalna, wiec plik ratujemy fallbackiem.
function armJobTimer(job, id, delay, reason, allowFallback) {
  clearJobTimer(job);
  job.timer = setTimeout(() => {
    if (pendingJobs.get(id) !== job) return;
    if (allowFallback) {
      breakWorker(reason);
      return;
    }
    timeoutJob(job, id, reason);
  }, delay);
}

// Timeout w trakcie enkodowania konczy sie bledem tego jednego pliku, a nie fallbackiem:
// powtorka tej samej pracy na main thread trwalaby drugie tyle i zamrozila UI dokladnie
// tak, jak przed przeniesieniem konwersji do workera. Reszta batcha idzie main threadem,
// bo workera po przekroczeniu limitu uznajemy za martwego.
function timeoutJob(job, id, reason) {
  pendingJobs.delete(id);
  clearJobTimer(job);
  const err = new Error(reason);
  err.code = 'timeout';
  job.reject(err);
  breakWorker(reason);
}

// Skreslamy workera do konca sesji - reszta batcha idzie na main thread.
function breakWorker(reason) {
  workerBroken = true;

  if (worker) {
    try { worker.terminate(); } catch (err) { /* worker moze byc juz martwy */ }
    worker = null;
  }

  if (pendingJobs.size > 0) {
    const err = fallbackError(reason);
    pendingJobs.forEach(job => {
      clearJobTimer(job);
      job.reject(err);
    });
    pendingJobs.clear();
  }
}

function handleMessage(event) {
  const data = event.data || {};
  const job = pendingJobs.get(data.id);
  if (!job) return;

  // ACK - worker zyje i wzial zadanie, dalej pilnuje go juz dlugi watchdog
  if (data.ack) {
    armJobTimer(job, data.id, PHASE_TIMEOUT_MS, 'Worker job timed out', true);
    return;
  }

  // Meldunek o etapie - worker zyje i pracuje, wiec licznik startuje od nowa
  if (data.stage) {
    const encoding = data.stage === 'encode';
    armJobTimer(
      job,
      data.id,
      encoding ? encodeTimeout(job.payload, data.pixels) : PHASE_TIMEOUT_MS,
      'Worker job timed out',
      !encoding,
    );
    return;
  }

  pendingJobs.delete(data.id);
  clearJobTimer(job);

  if (data.ok) {
    workerTrusted = true;
    job.resolve(data);
    return;
  }

  const code = typeof data.code === 'string' ? data.code : 'convert';
  const err = new Error(data.message || 'Worker conversion failed');
  err.code = code;

  if (code === 'load') {
    // biblioteki nie wstaly w workerze - awaria infrastruktury, a nie pliku
    err.workerFallback = true;
    breakWorker(err.message);
  } else if (code !== 'megapixels' && !workerTrusted) {
    // Przekroczony limit megapikseli to werdykt o pliku, a nie awaria - nigdy nie wraca
    // na main thread, bo powtorka dekodu bylaby dokladnie ta alokacja, przed ktora limit
    // ma chronic. Przy zwyklym bledzie konwersji z jeszcze niesprawdzonego workera nie
    // wiemy, czy winny jest plik czy worker - sprawdzamy to na main thread, ale instancje
    // zostawiamy przy zyciu: odtwarzanie workera na kazdy bledny plik to ponowny import
    // kilku MB bibliotek i skok pamieci.
    err.workerFallback = true;
    err.workerProbe = true;
  }

  job.reject(err);
}

function ensureWorker() {
  if (workerBroken) throw fallbackError('Worker marked as broken');
  if (worker) return worker;
  if (!isSupported()) {
    breakWorker('Web Worker or OffscreenCanvas unavailable');
    throw fallbackError('Web Worker or OffscreenCanvas unavailable');
  }

  try {
    const instance = new Worker(WORKER_URL, { type: 'module' });
    instance.onmessage = handleMessage;
    // blad ladowania skryptu workera albo nieobsluzony wyjatek w srodku
    instance.onerror = () => breakWorker('Worker script error');
    instance.onmessageerror = () => breakWorker('Worker message error');
    worker = instance;
    return worker;
  } catch (err) {
    breakWorker('Worker init failed');
    throw fallbackError('Worker init failed', err);
  }
}

// Blob/File wysylamy bez transferu - struktura klonowana jest przez referencje do
// danych, wiec kopii i tak nie ma. Transfer dotyczy odpowiedzi: gotowy ArrayBuffer
// wraca z workera bez kopiowania.
function runWorkerJob(payload) {
  let instance;
  try {
    instance = ensureWorker();
  } catch (err) {
    return Promise.reject(err);
  }

  return new Promise((resolve, reject) => {
    const id = ++jobCounter;
    // payload zostaje przy zadaniu - z niego liczymy budzet czasu na enkodowanie
    const job = { resolve, reject, timer: null, payload };
    pendingJobs.set(id, job);
    armJobTimer(job, id, ACK_TIMEOUT_MS, 'Worker did not acknowledge the job', true);
    try {
      instance.postMessage(Object.assign({}, payload, { id }));
    } catch (err) {
      clearJobTimer(job);
      pendingJobs.delete(id);
      breakWorker('postMessage failed');
      reject(fallbackError('postMessage failed', err));
    }
  });
}

// Konwertuje plik w workerze i zwraca Bloba. Gdy worker jest niedostepny albo padnie,
// wykonuje przekazana sciezke main-thread. Bledy pojedynczego pliku (przekroczony limit
// megapikseli, przekroczony budzet czasu na enkodowanie) przechodza dalej bez fallbacku.
export async function convertWithWorker(payload, mainThreadTask) {
  if (canUseWorker()) {
    try {
      const result = await runWorkerJob(payload);
      return new Blob([result.buffer], { type: result.mime });
    } catch (err) {
      if (!err || !err.workerFallback) throw err;
      console.warn('Worker konwersji niedostepny - dokanczam na main thread:', err);
      try {
        const blob = await mainThreadTask();
        // main thread poradzil sobie z plikiem, ktorego worker nie przerobil - to worker
        // jest zepsuty, reszte batcha robimy bez niego
        if (err.workerProbe) breakWorker('Worker failed a file the main thread converted');
        return blob;
      } catch (mainErr) {
        // obie sciezki wywrocily sie tak samo - wina lezy po stronie pliku, nie workera
        if (err.workerProbe && ++probeCount >= MAX_PROBES) workerTrusted = true;
        throw mainErr;
      }
    }
  }

  return mainThreadTask();
}
