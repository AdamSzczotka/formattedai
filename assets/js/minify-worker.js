// ============================================
// FormattedAI - wspolny worker minifikacji kodu
// Obsluguje oba narzedzia, bo sciezka "wejscie -> vendor -> tekst wyjsciowy"
// jest w nich identyczna:
//   kind 'js'  - JS Minifier (Terser)
//   kind 'css' - CSS Minifier (csso)
// Worker jest klasyczny (importScripts), bo oba bundle vendorowe to zwykle skrypty
// przypisujace globala (var Terser / var csso) - w module workera nie dalyby sie
// zaimportowac bez przepakowania. Biblioteki ladujemy leniwie i tylko te, ktorych
// dane zadanie faktycznie uzywa, wiec strona JS-owa nie pobiera csso i odwrotnie.
// Sciezki sa absolutne, zeby dzialaly tak samo z / jak i z /en/.
// ============================================

// Krok "Cache-bust asset URLs" w .github/workflows/deploy.yml stempluje te adresy
// wersja (?v=<sha>) razem z URL-ami w HTML, wiec worker uzywa dokladnie tego samego
// builda vendora co main thread - i trafia w ten sam wpis cache, ktory strona juz
// pobrala dla sciezki awaryjnej.
var VENDOR_URLS = {
  js: '/assets/vendor/terser.bundle.js',
  css: '/assets/vendor/csso.bundle.js'
};

var vendorLoaded = { js: false, css: false };

// Nie modyfikujemy oryginalnego bledu - wyjatki vendorow miewaja wlasne, tylko do
// odczytu pola. Kod bledu decyduje po stronie klienta o fallbacku: 'load' to awaria
// infrastruktury (wraca na main thread), 'minify' to werdykt o kodzie uzytkownika.
function taggedError(code, err) {
  var message = err && err.message ? err.message : String(err || code);
  var error = new Error(message);
  error.code = code;
  return error;
}

function vendorReady(kind) {
  if (kind === 'css') {
    return typeof self.csso !== 'undefined' && typeof self.csso.minify === 'function';
  }
  return typeof self.Terser !== 'undefined' && typeof self.Terser.minify === 'function';
}

function ensureVendor(kind) {
  if (vendorLoaded[kind]) return;

  var url = VENDOR_URLS[kind];
  if (!url) throw taggedError('load', new Error('Unknown minify kind: ' + kind));

  try {
    self.importScripts(url);
  } catch (err) {
    throw taggedError('load', err);
  }

  // Skrypt moze sie pobrac, a mimo to nie wystawic globala - np. gdy serwer odda
  // strone bledu z kodem 200. Bez tej kontroli zadanie wywrocilo by sie dopiero na
  // wywolaniu minify i klient uznalby to za blad kodu uzytkownika zamiast awarii.
  if (!vendorReady(kind)) {
    throw taggedError('load', new Error('Vendor global missing after import: ' + kind));
  }

  vendorLoaded[kind] = true;
}

// Meldunek o wejsciu w kolejny etap zadania. Klient odswieza wtedy swoj watchdog -
// import kilkuset kilobajtow vendora i sama minifikacja maja zupelnie inne budzety
// czasu, wiec jeden staly limit nie objalby obu etapow sensownie.
function reportStage(id, stage) {
  self.postMessage({ id: id, stage: stage });
}

function minifyJs(code, options) {
  // Terser zwraca obietnice; starsze wersje zamiast rzucac oddaja blad w polu error
  return Promise.resolve(self.Terser.minify(code, options)).then(function(output) {
    if (output && output.error) throw taggedError('minify', output.error);
    return output.code;
  }, function(err) {
    throw taggedError('minify', err);
  });
}

function minifyCss(code, options) {
  try {
    // Bez opcji wolamy dokladnie tak jak main thread - csso ma wtedy wlasne domyslne
    var output = options ? self.csso.minify(code, options) : self.csso.minify(code);
    return output.css;
  } catch (err) {
    throw taggedError('minify', err);
  }
}

self.onmessage = function(event) {
  var msg = event.data || {};
  var id = msg.id;

  // Potwierdzenie odbioru wysylamy przed jakakolwiek praca - to jedyny dowod dla
  // klienta, ze skrypt workera wstal i instancja zyje. Bez niego klient nie odroznilby
  // dlugiej minifikacji od workera, ktory nigdy sie nie odezwie.
  self.postMessage({ id: id, ack: true });

  Promise.resolve()
    .then(function() {
      reportStage(id, 'load');
      ensureVendor(msg.kind);
      reportStage(id, 'minify');
      return msg.kind === 'css'
        ? minifyCss(msg.code, msg.options)
        : minifyJs(msg.code, msg.options);
    })
    .then(function(result) {
      self.postMessage({ id: id, ok: true, result: result });
    })
    .catch(function(err) {
      // bledy raportujemy jako wiadomosc per zadanie - nigdy jako wyjatek globalny,
      // ktory ubilby workera na cala sesje
      self.postMessage({
        id: id,
        ok: false,
        code: err && typeof err.code === 'string' ? err.code : 'minify',
        error: err && err.message ? err.message : ''
      });
    });
};
