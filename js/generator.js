/* Antics web generator: a reusable, embeddable card-draw tool.
   Drop <div id="antics-gen" data-game="nhie"></div> on a page, load
   /js/questions.js, /js/questions-clean.js then this file.

   Modes: "party" (default) and "clean" (forfeit only, no drinking,
   safe for workplaces, weddings and family events).
   Pick one with ?mode=clean, data-mode="clean", or the on-page toggle.
   Honours ?embed=1 for iframe use. In an iframe with an explicit ?mode=
   the toggle is hidden, so an embedding site keeps the deck it chose.

   Spanish and Portuguese (5 Oct 2026, /es/ and /pt/ question pages): a mount
   with data-lang="es" or "pt" is handed to initIntl() before any English code
   runs, and deals from window.ANTICS_FREE_ES / ANTICS_FREE_PT instead (load
   /es/cards.js or /pt/cards.js first; both are written by
   ops/export-free-cards.mjs --lang in the app repo: free-tier cards only).
   One deck, no Party/Clean switch, no embed mode. A mount without data-lang,
   or with any other value, is the English widget exactly as before.
   From 10 Oct 2026 the same holds for data-lang="de", "fr", "it", "nl", "pl"
   and "cs" (window.ANTICS_FREE_DE and so on, from /<lang>/cards.js); those
   mounts also carry data-alt="/<lang>/<imposter-slug>/" for the second
   button, which is left out without it. */
(function () {
  var CFG = {
    nhie: { prefix: 'Never have I ever', label: 'Never Have I Ever', lower: true },
    wyr:  { prefix: 'Would you rather',  label: 'Would You Rather',  lower: true },
    mlt:  { prefix: 'Most likely to',    label: 'Most Likely To',    lower: true },
    tod:  { prefix: '',                  label: 'Truth or Dare',      lower: false },
    odds: { prefix: "What are the odds you'd", label: 'What Are The Odds', lower: true, ask: true }
  };
  var MODES = {
    party: { key: 'party', name: 'Party', bank: 'ANTICS_QUESTIONS' },
    clean: { key: 'clean', name: 'Clean', bank: 'ANTICS_QUESTIONS_CLEAN' }
  };
  var STORE = 'antics-gen-mode';
  // Copy for the es and pt widget. The kicker is the app's own label above a
  // card (strings.es.ts / strings.pt.ts: nhie.label, mlt.label, wyr.label,
  // tod.truthLabel / dareLabel), because the mirrored cards are written to
  // sit under it rather than to follow it in one sentence.
  var INTL = {
    es: {
      bank: 'ANTICS_FREE_ES',
      games: {
        nhie: { kicker: 'Yo nunca\u2026' },
        mlt:  { kicker: '\u00bfQui\u00e9n es m\u00e1s probable que\u2026?' },
        wyr:  { kicker: '\u00bfQu\u00e9 prefieres\u2026?' },
        tod:  { kicker: 'Verdad o reto', truth: 'Verdad', dare: 'Reto' }
      },
      or: 'o',
      empty: 'Toca el bot\u00f3n para sacar la primera carta.',
      draw: 'Sacar una carta', next: 'Otra carta', again: 'Empezar de nuevo',
      copy: 'Copiar', copied: 'Copiado', copyTitle: 'Copiar para el grupo',
      deck: function () { return 'Cartas gratis aqu\u00ed. En la app hay miles.'; },
      count: function (i, n) { return 'Carta ' + i + ' de ' + n; },
      end: function () { return 'Esas fueron todas las cartas gratis. En la app hay miles m\u00e1s y otros ocho juegos.'; },
      endCount: 'Ya viste todas las cartas gratis.',
      ctaH: '\u00bfQuieres miles de cartas m\u00e1s y otros ocho juegos?',
      ctaEnd: 'Para que nunca se acaben, descarga Antics gratis:',
      get: 'Descarga Antics gratis',
      alt: 'Juega al impostor gratis',
      altUrl: 'https://anticsapp.com/es/juego-del-impostor/',
      group: 'Cartas',
      via: '(v\u00eda anticsapp.com)',
      none: 'Generador no disponible.'
    },
    pt: {
      bank: 'ANTICS_FREE_PT',
      games: {
        nhie: { kicker: 'Eu nunca\u2026' },
        mlt:  { kicker: 'Quem \u00e9 mais prov\u00e1vel que\u2026?' },
        wyr:  { kicker: 'O que voc\u00ea prefere\u2026?' },
        tod:  { kicker: 'Verdade ou desafio', truth: 'Verdade', dare: 'Desafio' }
      },
      or: 'ou',
      empty: 'Toque no bot\u00e3o para tirar a primeira carta.',
      draw: 'Tirar uma carta', next: 'Outra carta', again: 'Come\u00e7ar de novo',
      copy: 'Copiar', copied: 'Copiado', copyTitle: 'Copiar para o grupo',
      deck: function () { return 'Cartas gr\u00e1tis aqui. No app tem milhares.'; },
      count: function (i, n) { return 'Carta ' + i + ' de ' + n; },
      end: function () { return 'Essas foram todas as cartas gr\u00e1tis. No app tem milhares, e mais oito jogos.'; },
      endCount: 'Voc\u00ea j\u00e1 viu todas as cartas gr\u00e1tis.',
      ctaH: 'Quer milhares de cartas a mais e outros oito jogos?',
      ctaEnd: 'Pra nunca acabar, baixe o Antics gr\u00e1tis:',
      get: 'Baixe o Antics gr\u00e1tis',
      alt: 'Jogue o jogo do impostor gr\u00e1tis',
      altUrl: 'https://anticsapp.com/pt/jogo-do-impostor/',
      group: 'Cartas',
      via: '(via anticsapp.com)',
      none: 'Gerador indispon\u00edvel.'
    },
    // German, French, Italian, Dutch, Polish and Czech (10 Oct 2026), the same
    // shape. Each kicker is the app's own label (strings.<lang>.ts nhie.label,
    // mlt.label, wyr.label, tod.truthLabel / dareLabel, games.truthOrDare.name)
    // in sentence case, as es and pt do; or is the word inside the app's
    // wyr.or divider. The other lines are site copy, for a native read before
    // publishing. altUrl is null on purpose: each page names its own Imposter
    // page on the mount, data-alt="/<lang>/<slug>/", because the slugs belong
    // to the page builders. With no data-alt the second button is left out.
    de: {
      bank: 'ANTICS_FREE_DE',
      games: {
        nhie: { kicker: 'Ich hab noch nie\u2026' },
        mlt:  { kicker: 'Wer w\u00fcrde am ehesten\u2026' },
        wyr:  { kicker: 'Was w\u00e4re dir lieber\u2026' },
        tod:  { kicker: 'Wahrheit oder Pflicht', truth: 'Wahrheit', dare: 'Pflicht' }
      },
      or: 'oder',
      empty: 'Tipp auf den Button, um die erste Karte zu ziehen.',
      draw: 'Karte ziehen', next: 'N\u00e4chste Karte', again: 'Noch mal von vorn',
      copy: 'Kopieren', copied: 'Kopiert', copyTitle: 'F\u00fcr die Gruppe kopieren',
      deck: function () { return 'Hier gibt\u2019s ein paar Karten gratis. In der App sind es Tausende.'; },
      count: function (i, n) { return 'Karte ' + i + ' von ' + n; },
      end: function () { return 'Das waren alle Gratis-Karten. In der App warten Tausende mehr und acht weitere Spiele.'; },
      endCount: 'Du hast alle Gratis-Karten gesehen.',
      ctaH: 'Lust auf Tausende Karten mehr und acht weitere Spiele?',
      ctaEnd: 'Damit die Karten nie ausgehen, hol dir Antics gratis:',
      get: 'Antics gratis laden',
      alt: 'Imposter gratis spielen',
      altUrl: null,
      group: 'Karten',
      via: '(\u00fcber anticsapp.com)',
      none: 'Generator gerade nicht verf\u00fcgbar.'
    },
    fr: {
      bank: 'ANTICS_FREE_FR',
      games: {
        nhie: { kicker: 'Je n\u2019ai jamais\u2026' },
        mlt:  { kicker: 'Qui risque le plus de\u2026' },
        wyr:  { kicker: 'Tu pr\u00e9f\u00e8res\u2026' },
        tod:  { kicker: 'Action ou v\u00e9rit\u00e9', truth: 'V\u00e9rit\u00e9', dare: 'Action' }
      },
      or: 'ou',
      empty: 'Appuie sur le bouton pour tirer la premi\u00e8re carte.',
      draw: 'Tirer une carte', next: 'Carte suivante', again: 'Recommencer',
      copy: 'Copier', copied: 'Copi\u00e9', copyTitle: 'Copier pour le groupe',
      deck: function () { return 'Quelques cartes gratuites ici. Dans l\u2019appli, il y en a des milliers.'; },
      count: function (i, n) { return 'Carte ' + i + ' sur ' + n; },
      end: function () { return 'Tu as tir\u00e9 toutes les cartes gratuites. L\u2019appli en a des milliers d\u2019autres, plus huit autres jeux.'; },
      endCount: 'Tu as vu toutes les cartes gratuites.',
      ctaH: 'Envie de milliers de cartes en plus et de huit autres jeux\u00a0?',
      ctaEnd: 'Pour ne jamais tomber \u00e0 court, t\u00e9l\u00e9charge Antics gratuitement\u00a0:',
      get: 'T\u00e9l\u00e9charge Antics gratuitement',
      alt: 'Joue \u00e0 l\u2019Imposteur gratuitement',
      altUrl: null,
      group: 'Cartes',
      via: '(via anticsapp.com)',
      none: 'G\u00e9n\u00e9rateur indisponible.'
    },
    it: {
      bank: 'ANTICS_FREE_IT',
      games: {
        nhie: { kicker: 'Non ho mai\u2026' },
        mlt:  { kicker: 'Chi \u00e8 pi\u00f9 probabile che\u2026' },
        wyr:  { kicker: 'Preferiresti\u2026' },
        tod:  { kicker: 'Obbligo o verit\u00e0', truth: 'Verit\u00e0', dare: 'Obbligo' }
      },
      or: 'o',
      empty: 'Tocca il pulsante per pescare la prima carta.',
      draw: 'Pesca una carta', next: 'Un\u2019altra carta', again: 'Ricomincia',
      copy: 'Copia', copied: 'Copiato', copyTitle: 'Copia per il gruppo',
      deck: function () { return 'Qui trovi qualche carta gratis. Nell\u2019app ce ne sono migliaia.'; },
      count: function (i, n) { return 'Carta ' + i + ' di ' + n; },
      end: function () { return 'Le carte gratis sono finite. Nell\u2019app ce ne sono migliaia, pi\u00f9 altri otto giochi.'; },
      endCount: 'Hai visto tutte le carte gratis.',
      ctaH: 'Vuoi migliaia di carte in pi\u00f9 e altri otto giochi?',
      ctaEnd: 'Per non restare mai senza carte, scarica Antics gratis:',
      get: 'Scarica Antics gratis',
      alt: 'Gioca all\u2019Impostore gratis',
      altUrl: null,
      group: 'Carte',
      via: '(via anticsapp.com)',
      none: 'Generatore non disponibile.'
    },
    nl: {
      bank: 'ANTICS_FREE_NL',
      games: {
        nhie: { kicker: 'Ik heb nog nooit\u2026' },
        mlt:  { kicker: 'Wie in de groep zou\u2026' },
        wyr:  { kicker: 'Zou je liever\u2026' },
        tod:  { kicker: 'Waarheid of durven', truth: 'Waarheid', dare: 'Durven' }
      },
      or: 'of',
      empty: 'Tik op de knop om de eerste kaart te trekken.',
      draw: 'Trek een kaart', next: 'Volgende kaart', again: 'Opnieuw beginnen',
      copy: 'Kopi\u00ebren', copied: 'Gekopieerd', copyTitle: 'Kopi\u00ebren voor de groepsapp',
      deck: function () { return 'Hier een paar gratis kaarten. In de app zijn het er duizenden.'; },
      count: function (i, n) { return 'Kaart ' + i + ' van ' + n; },
      end: function () { return 'Dat waren alle gratis kaarten. In de app zijn er nog duizenden, plus acht andere spellen.'; },
      endCount: 'Je hebt alle gratis kaarten gezien.',
      ctaH: 'Zin in nog duizenden kaarten en acht andere spellen?',
      ctaEnd: 'Download Antics gratis, dan raken de kaarten nooit op:',
      get: 'Download Antics gratis',
      alt: 'Speel Imposter gratis',
      altUrl: null,
      group: 'Kaarten',
      via: '(via anticsapp.com)',
      none: 'Generator niet beschikbaar.'
    },
    pl: {
      bank: 'ANTICS_FREE_PL',
      games: {
        nhie: { kicker: 'Nigdy przenigdy\u2026' },
        mlt:  { kicker: 'Kto z nas\u2026' },
        wyr:  { kicker: 'Co wolisz\u2026' },
        tod:  { kicker: 'Prawda czy wyzwanie', truth: 'Prawda', dare: 'Wyzwanie' }
      },
      or: 'czy',
      empty: 'Dotknij przycisku, \u017ceby wylosowa\u0107 pierwsz\u0105 kart\u0119.',
      draw: 'Losuj kart\u0119', next: 'Nast\u0119pna karta', again: 'Zacznij od nowa',
      copy: 'Kopiuj', copied: 'Skopiowano', copyTitle: 'Skopiuj dla grupy',
      deck: function () { return 'Tu masz kilka darmowych kart. W aplikacji s\u0105 ich tysi\u0105ce.'; },
      count: function (i, n) { return 'Karta ' + i + ' z ' + n; },
      end: function () { return 'To ju\u017c wszystkie darmowe karty. W aplikacji czekaj\u0105 tysi\u0105ce kolejnych i osiem innych gier.'; },
      endCount: 'Wszystkie darmowe karty ju\u017c za tob\u0105.',
      ctaH: 'Chcesz tysi\u0105ce kolejnych kart i osiem innych gier?',
      ctaEnd: '\u017beby karty nigdy si\u0119 nie sko\u0144czy\u0142y, pobierz Antics za darmo:',
      get: 'Pobierz Antics za darmo',
      alt: 'Zagraj w Impostora za darmo',
      altUrl: null,
      group: 'Karty',
      via: '(z anticsapp.com)',
      none: 'Generator jest niedost\u0119pny.'
    },
    cs: {
      bank: 'ANTICS_FREE_CS',
      games: {
        nhie: { kicker: 'J\u00e1 nikdy\u2026' },
        mlt:  { kicker: 'Kdo by nejsp\u00ed\u0161\u2026' },
        wyr:  { kicker: 'Co bys rad\u0161i\u2026' },
        tod:  { kicker: 'Pravda nebo \u00fakol', truth: 'Pravda', dare: '\u00dakol' }
      },
      or: 'nebo',
      empty: 'Klepni na tla\u010d\u00edtko a vyt\u00e1hni si prvn\u00ed kartu.',
      draw: 'Vyt\u00e1hnout kartu', next: 'Dal\u0161\u00ed karta', again: 'Za\u010d\u00edt znovu',
      copy: 'Kop\u00edrovat', copied: 'Zkop\u00edrov\u00e1no', copyTitle: 'Zkop\u00edrovat pro skupinu',
      deck: function () { return 'Tady m\u00e1\u0161 p\u00e1r karet zdarma. V aplikaci jich jsou tis\u00edce.'; },
      count: function (i, n) { return 'Karta ' + i + ' z ' + n; },
      end: function () { return 'To byly v\u0161echny karty zdarma. V aplikaci jich jsou tis\u00edce a k tomu osm dal\u0161\u00edch her.'; },
      endCount: 'V\u0161echny karty zdarma u\u017e m\u00e1\u0161 za sebou.',
      ctaH: 'Chce\u0161 tis\u00edce karet nav\u00edc a osm dal\u0161\u00edch her?',
      ctaEnd: 'Aby karty nikdy nedo\u0161ly, st\u00e1hni si Antics zdarma:',
      get: 'St\u00e1hni si Antics zdarma',
      alt: 'Zahraj si hru Impostor zdarma',
      altUrl: null,
      group: 'Karty',
      via: '(p\u0159es anticsapp.com)',
      none: 'Gener\u00e1tor nen\u00ed k dispozici.'
    }
  };
  // The CTA buttons go through /get rather than straight at a store, so every
  // install from a generator carries a campaign tag (?c=) and /get still sends
  // each phone to the right store. Absolute, because this widget is embeddable
  // on other sites where a root-relative /get would resolve to their origin.
  var GET = 'https://anticsapp.com/get/';
  function getUrl(tag) { return GET + '?c=' + tag; }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function lc(s) { return s.charAt(0).toLowerCase() + s.slice(1); }
  function phrase(cfg, q) {
    if (!cfg.prefix) return q;
    var body = cfg.lower ? lc(q) : q;
    // The odds prefix turns a statement into a question, so the stop must follow.
    if (cfg.ask && /\.$/.test(body)) body = body.slice(0, -1) + '?';
    return cfg.prefix + ' ' + body;
  }
  function param(name) {
    var m = new RegExp('[?&]' + name + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]).toLowerCase() : null;
  }
  function remember(v) { try { localStorage.setItem(STORE, v); } catch (e) {} }
  function recall() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function poolFor(mode, game) {
    return (window[MODES[mode].bank] || {})[game] || [];
  }

  // es / pt: the free cards of one game as {k: kicker, t: text} items.
  function intlPool(L, game) {
    var bank = window[L.bank] || {};
    var g = L.games[game];
    var out = [];
    function str(x) { return typeof x === 'string' && x.length > 0; }
    function add(list, k, fn) {
      if (!Array.isArray(list)) return;
      for (var i = 0; i < list.length; i++) { var t = fn(list[i]); if (t) out.push({ k: k, t: t }); }
    }
    function plain(x) { return str(x) ? x : null; }
    if (game === 'nhie') add(bank.neverHaveIEver, g.kicker, plain);
    else if (game === 'mlt') add(bank.mostLikelyTo, g.kicker, plain);
    else if (game === 'wyr' && Array.isArray(bank.wouldYouRather)) {
      // Two options with the app's divider between them; t is the one-line
      // form for the copy button and the page list.
      for (var w = 0; w < bank.wouldYouRather.length; w++) {
        var x = bank.wouldYouRather[w];
        if (x && str(x.a) && str(x.b)) out.push({ k: g.kicker, t: x.a + ' ' + L.or + ' ' + lc(x.b), a: x.a, b: lc(x.b) });
      }
    }
    else if (game === 'tod') { add(bank.truths, g.truth, plain); add(bank.dares, g.dare, plain); }
    return out;
  }

  function initIntl(root, game, L) {
    var g = L.games[game];
    var pool = g ? intlPool(L, game) : [];
    if (!pool.length) { root.textContent = L.none; return; }
    var ctaTag = 'site-' + root.getAttribute('data-lang') + '-' + game + '-gen';
    var hostTag = (root.getAttribute('data-cta') || '').toLowerCase();
    if (/^[a-z0-9-]{1,32}$/.test(hostTag)) ctaTag = hostTag;
    var total = pool.length, order = shuffle(pool), idx = -1, current = '';

    root.classList.add('agen');
    root.innerHTML =
      '<div class="agen-card" role="status" aria-live="polite"><p class="agen-k"></p><p class="agen-q"></p></div>' +
      '<div class="agen-controls">' +
        '<button class="agen-next" type="button"></button>' +
        '<button class="agen-copy" type="button"></button>' +
      '</div>' +
      '<p class="agen-count"></p>' +
      '<div class="agen-cta">' +
        '<p class="agen-cta-h"></p>' +
        '<a class="agen-btn agen-btn-get" rel="nofollow"></a>' +
        '<a class="agen-btn agen-btn-alt" rel="nofollow"></a>' +
      '</div>';
    var kEl = root.querySelector('.agen-k');
    var qEl = root.querySelector('.agen-q');
    var nextBtn = root.querySelector('.agen-next');
    var copyBtn = root.querySelector('.agen-copy');
    var countEl = root.querySelector('.agen-count');
    var ctaH = root.querySelector('.agen-cta-h');
    var getA = root.querySelector('.agen-btn-get');
    var altA = root.querySelector('.agen-btn-alt');
    copyBtn.title = L.copyTitle;
    getA.href = getUrl(ctaTag);
    getA.textContent = L.get;
    // data-alt (10 Oct 2026): a root-relative path to the page's own Imposter
    // page overrides altUrl; es and pt set none and keep their fixed URL.
    var altUrl = L.altUrl;
    var altAttr = root.getAttribute('data-alt') || '';
    if (/^\/[a-z0-9\/-]+\/$/.test(altAttr)) altUrl = 'https://anticsapp.com' + altAttr;
    if (altUrl) {
      altA.href = altUrl + '?c=' + ctaTag + '-imp';
      altA.textContent = L.alt;
    } else altA.parentNode.removeChild(altA);

    function render() {
      ctaH.textContent = L.ctaH;
      qEl.classList.toggle('agen-q-empty', idx < 0 || idx >= order.length);
      if (idx < 0) {
        kEl.textContent = g.kicker;
        qEl.textContent = L.empty;
        copyBtn.style.visibility = 'hidden';
        nextBtn.textContent = L.draw;
        countEl.textContent = L.deck(total);
        return;
      }
      if (idx >= order.length) {
        kEl.textContent = g.kicker;
        qEl.textContent = L.end(total);
        nextBtn.textContent = L.again;
        copyBtn.style.visibility = 'hidden';
        countEl.textContent = L.endCount;
        ctaH.textContent = L.ctaEnd;
        current = '';
        return;
      }
      var card = order[idx];
      kEl.textContent = card.k;
      if (card.a) {
        qEl.textContent = '';
        var or = document.createElement('span');
        or.className = 'agen-or';
        or.textContent = L.or;
        qEl.appendChild(document.createTextNode(card.a + ' '));
        qEl.appendChild(or);
        qEl.appendChild(document.createTextNode(' ' + card.b));
      } else qEl.textContent = card.t;
      current = card.k + ' ' + card.t;
      copyBtn.style.visibility = 'visible';
      copyBtn.textContent = L.copy;
      nextBtn.textContent = L.next;
      countEl.textContent = L.count(idx + 1, total);
    }
    nextBtn.addEventListener('click', function () {
      if (idx >= order.length) { order = shuffle(pool); idx = 0; }
      else idx++;
      render();
    });
    copyBtn.addEventListener('click', function () {
      if (!current) return;
      var text = current + '  ' + L.via;
      if (navigator.share) { navigator.share({ text: text }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = L.copied;
        setTimeout(function () { copyBtn.textContent = L.copy; }, 1400);
      });
    });
    render();
  }

  function init(root) {
    var lang = (root.getAttribute('data-lang') || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(INTL, lang)) { initIntl(root, root.getAttribute('data-game'), INTL[lang]); return; }
    var game = root.getAttribute('data-game');
    var cfg = CFG[game];
    if (!cfg) { root.textContent = 'Generator unavailable.'; return; }
    // A page that deals only part of a game's cards can name them (data-label),
    // so the first and last lines describe that page's deck, not the whole
    // free deck: /christmas-truth-or-dare/ says "Christmas Truth or Dare"
    // (30 Oct 2026). Pages without the attribute read exactly as before.
    var label = root.getAttribute('data-label') || cfg.label;

    var embed = /[?&]embed=1/.test(location.search);
    var urlMode = param('mode');
    if (!MODES[urlMode]) urlMode = null;
    var attrMode = (root.getAttribute('data-mode') || '').toLowerCase();
    if (!MODES[attrMode]) attrMode = null;
    var saved = embed ? null : recall();
    if (!MODES[saved]) saved = null;

    var mode = urlMode || attrMode || saved || 'party';
    if (!poolFor(mode, game).length) mode = 'party';
    // An embedding site that asked for one deck keeps it: no visitor toggle.
    var locked = embed && !!(urlMode || attrMode);
    var canSwitch = !locked && poolFor(mode === 'party' ? 'clean' : 'party', game).length > 0;
    // Campaign tag for this widget's CTA. The game key is already lowercase
    // a-z, so the tag matches /get's ?c= rule (a-z, 0-9, hyphen, 32 max).
    // Embedded copies get their own prefix: an install from somebody else's
    // page is a different story from one off our own generator page.
    var ctaTag = (embed ? 'embed-generator-' : 'site-generator-') + game;
    // A page that hosts the widget can name its own tag (data-cta), so an
    // install from the generator INSIDE a question guide is counted against
    // that guide and not against the standalone generator page (30 Sep 2026).
    // Same character rule as /get's ?c=; anything else is ignored.
    var hostTag = (root.getAttribute('data-cta') || '').toLowerCase();
    if (!embed && /^[a-z0-9-]{1,32}$/.test(hostTag)) ctaTag = hostTag;
    // The demo round lives on our own site only; from an embed it is still
    // absolute so it resolves off somebody else's origin.
    var PLAY = 'https://anticsapp.com/play/?c=' + ctaTag + '-play';

    var pool, order, total, idx, current = '';

    function loadMode(next) {
      mode = next;
      pool = poolFor(mode, game);
      order = shuffle(pool);
      total = pool.length;
      idx = -1;
      current = '';
    }
    loadMode(mode);
    if (!total) { root.textContent = 'Generator unavailable.'; return; }

    root.classList.add('agen');
    if (embed) root.classList.add('agen-embed');
    root.innerHTML =
      (canSwitch
        ? '<div class="agen-modes" role="group" aria-label="Question deck">' +
            '<button class="agen-mode" type="button" data-mode="party" aria-pressed="false">Party</button>' +
            '<button class="agen-mode" type="button" data-mode="clean" aria-pressed="false">Clean</button>' +
          '</div>'
        : '') +
      '<div class="agen-card" role="status" aria-live="polite"><p class="agen-q"></p></div>' +
      '<div class="agen-controls">' +
        '<button class="agen-next" type="button">Draw a card</button>' +
        '<button class="agen-copy" type="button" title="Copy for the group chat">Copy</button>' +
      '</div>' +
      '<p class="agen-count"></p>' +
      '<div class="agen-cta">' +
        '<p class="agen-cta-h"></p>' +
        // One store button: /get picks the right store per phone, so two
        // buttons with the same address only mislabelled one of them.
        '<a class="agen-btn agen-btn-get" href="' + getUrl(ctaTag) + '" rel="nofollow">Get Antics free</a>' +
        '<a class="agen-btn agen-btn-alt" href="' + PLAY + '" rel="nofollow">Play a free round</a>' +
      '</div>';

    var qEl = root.querySelector('.agen-q');
    var nextBtn = root.querySelector('.agen-next');
    var copyBtn = root.querySelector('.agen-copy');
    var countEl = root.querySelector('.agen-count');
    var ctaH = root.querySelector('.agen-cta-h');
    var modeBtns = root.querySelectorAll('.agen-mode');

    function ctaLine() {
      return mode === 'clean'
        ? 'From Antics: nine party games on one phone, thousands of cards.'
        : 'Want thousands more cards and a whole stack more games?';
    }
    function deckLine() {
      return mode === 'clean'
        ? 'Free clean cards. Nothing about drinking.'
        : 'Free cards here. The app has thousands.';
    }
    function syncModeBtns() {
      for (var i = 0; i < modeBtns.length; i++) {
        var on = modeBtns[i].getAttribute('data-mode') === mode;
        modeBtns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
        modeBtns[i].classList.toggle('is-on', on);
      }
    }

    function render() {
      ctaH.textContent = ctaLine();
      qEl.classList.toggle('agen-q-empty', idx < 0);
      if (idx < 0) {
        qEl.textContent = 'Tap below to draw your first ' + label + ' card.';
        copyBtn.style.visibility = 'hidden';
        nextBtn.textContent = 'Draw a card';
        countEl.textContent = deckLine();
        return;
      }
      if (idx >= order.length) {
        qEl.textContent = "That's every free " + label + ' card. The app has thousands more, plus eight other games.';
        nextBtn.textContent = 'Start again';
        copyBtn.style.visibility = 'hidden';
        countEl.textContent = 'You have seen every free card.';
        ctaH.textContent = 'Never run dry. Get Antics free:';
        return;
      }
      current = phrase(cfg, order[idx]);
      qEl.textContent = current;
      copyBtn.style.visibility = 'visible';
      copyBtn.textContent = 'Copy';
      countEl.textContent = 'Card ' + (idx + 1) + ' of ' + total;
    }

    nextBtn.addEventListener('click', function () {
      if (idx >= order.length) { order = shuffle(pool); idx = 0; nextBtn.textContent = 'Draw a card'; }
      else idx++;
      if (idx === 0) nextBtn.textContent = 'Next card';
      render();
    });
    copyBtn.addEventListener('click', function () {
      if (!current) return;
      var text = current + '  (via anticsapp.com)';
      if (navigator.share && !embed) { navigator.share({ text: text }).catch(function () {}); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () {
        copyBtn.textContent = 'Copied';
        setTimeout(function () { copyBtn.textContent = 'Copy'; }, 1400);
      });
    });
    for (var i = 0; i < modeBtns.length; i++) {
      modeBtns[i].addEventListener('click', function () {
        var next = this.getAttribute('data-mode');
        if (next === mode || !poolFor(next, game).length) return;
        loadMode(next);
        if (!embed) remember(next);
        syncModeBtns();
        render();
      });
    }

    syncModeBtns();
    render();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-game]');
    for (var i = 0; i < roots.length; i++) if (roots[i].id === 'antics-gen' || roots[i].classList.contains('antics-gen')) init(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
