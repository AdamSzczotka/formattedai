// ============================================
// FormattedAI - klient wspolnego workera minifikacji
// Worker powstaje leniwie przy pierwszej minifikacji. Sciezka jest absolutna,
// zeby dzialala tak samo z / jak i z /en/.
// Gdy przegladarka nie ma Web Workerow, skrypt workera sie nie zaladuje, worker
// przestanie odpowiadac albo padnie w trakcie pracy - zadanie wraca na obecna
// sciezke main-thread i narzedzie dziala dalej.
// ============================================

// Krok "Cache-bust asset URLs" w .github/workflows/deploy.yml stempluje ten adres
// wersja (?v=<sha>) razem z URL-ami w HTML, wiec klient i worker sa po deployu zawsze
// z tego samego builda. Bez tego przegladarka pobralaby nowy jsminifier.min.js /
// cssminifier.min.js, ale zostala przy starym workerze z cache i protokol by sie rozjechal.
const WORKER_URL = '/assets/js/minify-worker.min.js';

// Worker potwierdza przyjecie zadania od razu po odebraniu wiadomosci. Brak ACK
// oznacza, ze skrypt workera w ogole nie wstal albo instancja jest juz martwa.
const ACK_TIMEOUT_MS = 15000;
// Import vendora to jedno pobranie kilkuset kilobajtow, zwykle prosto z cache strony
const LOAD_TIMEOUT_MS = 60000;
// Watchdog na sama minifikacje - worker moze umrzec bez zdarzenia error (ubity przy
// braku pamieci), a wtedy obietnica nigdy by sie nie rozstrzygnela i przycisk zostalby
// zablokowany na stale. Czas pracy skaluje sie wprost z wielkoscia kodu, wiec budzet
// liczymy z rozmiaru wejscia zamiast trzymac sztywna wartosc, ktora przy 5 MB uznalaby
// zywego workera za martwego w polowie roboty.
const MINIFY_BASE_MS = 60000;
const MINIFY_MS_PER_MEGABYTE = 90000;

let worker = null;
let workerBroken = false;
let jobCounter = 0;
const pendingJobs = new Map();

function fallbackError(message, cause) {
  const err = new Error(message);
  err.workerFallback = true;
  if (cause) err.cause = cause;
  return err;
}

function isSupported() {
  return typeof Worker === 'function';
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

function minifyTimeout(code) {
  const megabytes = (code ? code.length : 0) / (1024 * 1024);
  return MINIFY_BASE_MS + Math.ceil(megabytes * MINIFY_MS_PER_MEGABYTE);
}

// allowFallback mowi, czy po przekroczeniu limitu ma sens powtorzenie zadania na main
// thread. Do konca importu vendora praca jest tania i powtarzalna, wiec wynik ratujemy
// fallbackiem.
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

// Timeout w trakcie minifikacji konczy sie bledem tego zadania, a nie fallbackiem:
// powtorka tej samej pracy na main thread trwalaby drugie tyle i zamrozila karte
// dokladnie tak, jak przed przeniesieniem minifikacji do workera.
function timeoutJob(job, id, reason) {
  pendingJobs.delete(id);
  clearJobTimer(job);
  const err = new Error(reason);
  err.code = 'timeout';
  job.reject(err);
  breakWorker(reason);
}

// Skreslamy workera do konca sesji - kolejne minifikacje ida na main thread.
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

  // ACK - worker zyje i wzial zadanie, dalej pilnuje go juz watchdog etapu
  if (data.ack) {
    armJobTimer(job, data.id, LOAD_TIMEOUT_MS, 'Worker job timed out', true);
    return;
  }

  // Meldunek o etapie - worker zyje i pracuje, wiec licznik startuje od nowa
  if (data.stage) {
    const minifying = data.stage === 'minify';
    armJobTimer(
      job,
      data.id,
      minifying ? minifyTimeout(job.code) : LOAD_TIMEOUT_MS,
      'Worker job timed out',
      !minifying,
    );
    return;
  }

  pendingJobs.delete(data.id);
  clearJobTimer(job);

  if (data.ok) {
    job.resolve(data.result);
    return;
  }

  const code = typeof data.code === 'string' ? data.code : 'minify';
  const err = new Error(data.error || 'Worker minification failed');
  err.code = code;

  // Blad minifikacji to werdykt o kodzie uzytkownika (skladnia), a nie awaria: worker
  // uruchomil ten sam bundle vendora z tymi samymi opcjami, wiec main thread doszedlby
  // do identycznego wyniku. Wraca do narzedzia jako zwykly blad i tak jest pokazywany.
  // Fallback nalezy sie tylko awarii infrastruktury - vendor nie wstal w workerze.
  if (code === 'load') {
    err.workerFallback = true;
    breakWorker(err.message);
  }

  job.reject(err);
}

function ensureWorker() {
  if (workerBroken) throw fallbackError('Worker marked as broken');
  if (worker) return worker;
  if (!isSupported()) {
    breakWorker('Web Worker unavailable');
    throw fallbackError('Web Worker unavailable');
  }

  try {
    const instance = new Worker(WORKER_URL);
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

function runWorkerJob(payload) {
  let instance;
  try {
    instance = ensureWorker();
  } catch (err) {
    return Promise.reject(err);
  }

  return new Promise((resolve, reject) => {
    const id = ++jobCounter;
    // kod zostaje przy zadaniu - z jego rozmiaru liczymy budzet czasu na minifikacje
    const job = { resolve, reject, timer: null, code: payload.code };
    pendingJobs.set(id, job);
    armJobTimer(job, id, ACK_TIMEOUT_MS, 'Worker did not acknowledge the job', true);
    try {
      instance.postMessage({ id, kind: payload.kind, code: payload.code, options: payload.options });
    } catch (err) {
      clearJobTimer(job);
      pendingJobs.delete(id);
      breakWorker('postMessage failed');
      reject(fallbackError('postMessage failed', err));
    }
  });
}

// Minifikuje kod w workerze i zwraca tekst wyniku. Gdy worker jest niedostepny, nie
// wstal albo padnie, wykonuje przekazana sciezke main-thread. Bledy samej minifikacji
// (skladnia kodu uzytkownika) i przekroczony budzet czasu przechodza dalej bez fallbacku.
export async function minifyWithWorker(payload, mainThreadTask) {
  if (canUseWorker()) {
    try {
      return await runWorkerJob(payload);
    } catch (err) {
      if (!err || !err.workerFallback) throw err;
      console.warn('Worker minifikacji niedostepny - koncze na main thread:', err);
    }
  }

  return mainThreadTask();
}
