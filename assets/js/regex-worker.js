// ============================================
// FormattedAI - Regex Tester: klasyczny Web Worker silnika
// Uruchamia natywny RegExp w osobnym watku, zeby patologiczny wzorzec (ReDoS,
// np. (a+)+$ na dlugim wejsciu) zablokowal wylacznie tego workera, a nie karte.
// Main thread ma watchdog: gdy wynik nie wroci w budzecie czasu, robi terminate()
// i ubija zawieszonego workera. Dlatego worker NIE ma tu wlasnego limitu - jego
// jedynym zadaniem jest policzyc dopasowania i odeslac je.
//
// Bezpieczenstwo: worker odsyla wylacznie DANE (stringi, liczby, tablice). Zadnego
// HTML - podswietlanie i render buduje main thread przez textContent/escapowanie,
// wiec payload w rodzaju <img onerror=...> w tekscie testowym nie ma jak sie wykonac.
// ============================================

// Twardy limit liczby dopasowan - chroni pamiec karty przy wzorcach typu ".*" ze
// spacja na wielomegabajtowym wejsciu. Po przekroczeniu oddajemy to, co mamy, z flaga.
var MAX_MATCHES = 20000;

self.onmessage = function (event) {
  var msg = event.data || {};
  var id = msg.id;

  // ACK: dowod, ze skrypt workera wstal i instancja zyje. Wysylany przed praca -
  // jesli wzorzec sie zawiesi, ACK i tak zdazy dojsc, a watchdog liczy juz wynik.
  self.postMessage({ id: id, ack: true });

  try {
    var out = run(msg);
    self.postMessage({
      id: id,
      ok: true,
      matches: out.matches,
      replaced: out.replaced,
      truncated: out.truncated
    });
  } catch (err) {
    // Blad kompilacji wzorca (SyntaxError) to werdykt o wzorcu uzytkownika, nie awaria.
    self.postMessage({
      id: id,
      ok: false,
      code: 'compile',
      error: err && err.message ? err.message : String(err || 'error')
    });
  }
};

function run(msg) {
  var pattern = typeof msg.pattern === 'string' ? msg.pattern : '';
  var flags = typeof msg.flags === 'string' ? msg.flags : '';
  var text = typeof msg.text === 'string' ? msg.text : '';

  // new RegExp moze rzucic SyntaxError - lapiemy wyzej i oddajemy jako code:'compile'.
  var re = new RegExp(pattern, flags);

  var matches = [];
  var truncated = false;
  var isGlobal = flags.indexOf('g') !== -1 || flags.indexOf('y') !== -1;

  if (!isGlobal) {
    var single = re.exec(text);
    if (single) matches.push(serialize(single));
  } else {
    re.lastIndex = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      matches.push(serialize(m));
      // Dopasowanie zerowej dlugosci nie przesuwa lastIndex - reczny inkrement chroni
      // przed nieskonczona petla (np. wzorzec "" albo "a*" globalnie).
      if (m.index === re.lastIndex) re.lastIndex++;
      if (matches.length >= MAX_MATCHES) { truncated = true; break; }
    }
  }

  var replaced = null;
  if (msg.wantReplace) {
    // String.replace sam zarzadza lastIndex; dla wzorca bez 'g' zamienia tylko pierwsze
    // trafienie - dokladnie jak natywny JS, bez upiekszania.
    re.lastIndex = 0;
    replaced = text.replace(re, typeof msg.replacement === 'string' ? msg.replacement : '');
  }

  return { matches: matches, replaced: replaced, truncated: truncated };
}

// Zamienia natywny wynik exec na czysty, klonowalny obiekt danych.
function serialize(m) {
  var full = m[0];
  var start = m.index;
  var groups = [];
  for (var i = 1; i < m.length; i++) {
    var g = { value: m[i] === undefined ? null : m[i] };
    if (m.indices && m.indices[i]) { g.start = m.indices[i][0]; g.end = m.indices[i][1]; }
    else { g.start = -1; g.end = -1; }
    groups.push(g);
  }
  var named = [];
  if (m.groups) {
    for (var name in m.groups) {
      if (Object.prototype.hasOwnProperty.call(m.groups, name)) {
        var ng = { name: name, value: m.groups[name] === undefined ? null : m.groups[name] };
        if (m.indices && m.indices.groups && m.indices.groups[name]) {
          ng.start = m.indices.groups[name][0]; ng.end = m.indices.groups[name][1];
        } else { ng.start = -1; ng.end = -1; }
        named.push(ng);
      }
    }
  }
  return { match: full, start: start, end: start + full.length, groups: groups, named: named };
}
