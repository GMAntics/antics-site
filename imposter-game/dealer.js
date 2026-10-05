// Imposter dealer for anticsapp.com/imposter-game/ (4 Oct 2026).
//
// One phone, passed round, the app's own flow: pass screen, tap to see your
// role, hand it on, talk it out, reveal. After every third finished round a
// wall offers the app (the /play/ pattern), and "Play three more rounds"
// carries on.
//
// WORDS come from /imposter-game/words.json, written by
// ops/export-imposter-web-words.mjs in the app repo: the free app decks the
// site already publishes on its category pages, minus retired words, easy
// hints only. They are fetched as data and only ever reach the page through
// textContent, never as markup or script.
//
// MEASUREMENT: no new event names. play_started (once per block of three
// rounds) and play_wall_reached (when the wall shows), with game 'imposter',
// exactly the beacon /play/ sends. players, deck and hint ride play_started
// as extra props; see the contract delta drafted in the app repo's
// ops/site-imposter-game-2026-10-04.md.
//
// LANGUAGES (5 Oct 2026). /es/juego-del-impostor/ and /pt/jogo-do-impostor/
// load this same file. Each says what it is on the dealer element itself:
// data-lang ('es' or 'pt') picks COPY_INTL below, data-words its word file,
// data-code its default install tag. The English page sets none of them and
// deals exactly as before. Every page now adds `lang` ('en', 'es', 'pt') to
// both beacons, so a read can split the three (ops/site-imposter-es-pt-2026-10-05.md).
(function () {
  'use strict';

  var MIN_PLAYERS = 3;          // the app's MIN_PLAYERS
  var MAX_PLAYERS = 12;         // the app's MAX_PLAYERS
  var ROUNDS_PER_BLOCK = 3;     // the wall comes after the third finished round
  var WORDS_URL = '/imposter-game/words.json';

  // Dynamic copy. Lines marked APP are the app's own strings (strings.en.ts,
  // imposter.*); the rest are new and go to Guy by number with the page copy.
  var COPY = {
    deal: function (n) { return 'Deal the round (' + n + ' players)'; },      // APP deal
    player: function (n) { return 'Player ' + n; },                           // APP playerN
    round: function (n) { return 'Round ' + n; },
    category: function (name) { return 'Category: ' + name; },               // APP categoryOnCard
    yourWord: 'Your secret word',                                             // APP yourWordIs
    youreAt: 'You’re at',                                                // APP youreAt
    wordBody: 'Talk around it without ever saying it. The imposter is listening.',   // APP wordBody
    placeBody: 'Describe it without giving it away. The imposter is listening.',     // APP locationBody
    impTitle: 'You’re the IMPOSTER',                                     // APP imposterTitle
    impBodyWord: 'Everyone else knows it. Blend in and don’t get caught.',      // APP imposterBodyWord
    impBodyPlace: 'Everyone else knows where they are. Blend in and don’t get caught.', // APP imposterBody
    hintTitle: 'Your hint',                                                   // APP hintTitle
    next: 'Pass to the next player',                                          // APP nextPlayer
    allSeen: 'Everyone has seen theirs',                                      // APP everyoneSeen
    talkWord: 'Going round the circle, everyone describes the word, no saying it! When you’ve heard enough: on three, everyone points at their suspect.', // APP discussBodyWord
    talkPlace: 'Going round the circle, everyone describes where they are, no naming it! When you’ve heard enough: on three, everyone points at their suspect.', // APP discussBody
    starts: function (p) { return p + ' starts'; },                           // APP discussStarter
    wasWord: 'The word was',
    wasPlace: 'The place was',
    hintWas: function (h) { return 'The imposter was working from one clue: "' + h + '".'; }, // APP hintWas
    loadFail: 'Couldn’t load the words. Check your signal and refresh the page.'
  };

  // Spanish (es-419) and Brazilian Portuguese, the app's `es` and `pt`
  // dictionaries. Lines marked APP are strings.es.ts / strings.pt.ts,
  // imposter.*, word for word; the rest are new site copy.
  var COPY_INTL = {
    es: {
      deal: function (n) { return 'Repartir la ronda (' + n + ' jugadores)'; },    // APP deal
      player: function (n) { return 'Jugador ' + n; },                             // APP playerN
      round: function (n) { return 'Ronda ' + n; },
      category: function (name) { return 'Categoría: ' + name; },                 // APP categoryOnCard
      yourWord: 'Tu palabra secreta',                                              // APP yourWordIs
      youreAt: 'Estás en',                                                         // APP youreAt
      wordBody: 'Habla alrededor de la palabra sin decirla nunca. El impostor está escuchando.', // APP wordBody
      placeBody: 'Descríbelo sin delatarlo. El impostor está escuchando.',         // APP locationBody
      impTitle: 'Eres el IMPOSTOR',                                                // APP imposterTitle
      impBodyWord: 'Todos los demás la saben. Camúflate y que no te atrapen.',     // APP imposterBodyWord
      impBodyPlace: 'Todos los demás saben dónde están. Camúflate y que no te atrapen.', // APP imposterBody
      hintTitle: 'Tu pista',                                                       // APP hintTitle
      next: 'Pásale al siguiente jugador',                                         // APP nextPlayer
      allSeen: 'Ya todos vieron el suyo',                                          // APP everyoneSeen
      talkWord: 'En círculo, cada quien describe la palabra, ¡sin decirla! Cuando hayan oído suficiente: a las tres, todos señalan a su sospechoso.', // APP discussBodyWord
      talkPlace: 'En círculo, cada quien describe dónde está, ¡sin nombrarlo! Cuando hayan oído suficiente: a las tres, todos señalan a su sospechoso.', // APP discussBody
      starts: function (p) { return 'Empieza ' + p; },                             // APP discussStarter
      wasWord: 'La palabra era',
      wasPlace: 'El lugar era',
      hintWas: function (h) { return 'El impostor solo tenía una pista: "' + h + '".'; }, // APP hintWas
      loadFail: 'No se pudieron cargar las palabras. Revisa tu conexión y recarga la página.'
    },
    pt: {
      deal: function (n) { return 'Distribuir a rodada (' + n + ' jogadores)'; },  // APP deal
      player: function (n) { return 'Jogador ' + n; },                             // APP playerN
      round: function (n) { return 'Rodada ' + n; },
      category: function (name) { return 'Categoria: ' + name; },                 // APP categoryOnCard
      yourWord: 'Sua palavra secreta',                                             // APP yourWordIs
      youreAt: 'Você está em',                                                     // APP youreAt
      wordBody: 'Fale em volta da palavra sem nunca dizê-la. O impostor está ouvindo.', // APP wordBody
      placeBody: 'Descreva sem entregar. O impostor está ouvindo.',                // APP locationBody
      impTitle: 'Você é o IMPOSTOR',                                               // APP imposterTitle
      impBodyWord: 'Todo mundo sabe qual é, menos você. Disfarce e não seja pego.', // APP imposterBodyWord
      impBodyPlace: 'Todo mundo sabe onde está, menos você. Disfarce e não seja pego.', // APP imposterBody
      hintTitle: 'Sua dica',                                                       // APP hintTitle
      next: 'Passe para o próximo jogador',                                        // APP nextPlayer
      allSeen: 'Todo mundo já viu o seu',                                          // APP everyoneSeen
      talkWord: 'Em círculo, cada um descreve a palavra, sem dizer ela! Quando já ouviram o suficiente: no três, todo mundo aponta para o suspeito.', // APP discussBodyWord
      talkPlace: 'Em círculo, cada um descreve onde está, sem dizer o nome! Quando já ouviram o suficiente: no três, todo mundo aponta para o suspeito.', // APP discussBody
      starts: function (p) { return p + ' começa'; },                             // APP discussStarter
      wasWord: 'A palavra era',
      wasPlace: 'O lugar era',
      hintWas: function (h) { return 'O impostor tinha só uma pista: "' + h + '".'; }, // APP hintWas
      loadFail: 'Não deu para carregar as palavras. Confira sua conexão e recarregue a página.'
    }
  };

  function $(id) { return document.getElementById(id); }
  var root = $('idl');
  if (!root) return;

  var LANG = root.getAttribute('data-lang');
  if (!COPY_INTL.hasOwnProperty(LANG)) LANG = 'en';
  else COPY = COPY_INTL[LANG];
  var wordsAttr = root.getAttribute('data-words') || '';
  if (/^\/[a-z0-9\/-]+\.json$/.test(wordsAttr)) WORDS_URL = wordsAttr;
  var codeAttr = root.getAttribute('data-code') || '';
  var DEFAULT_CODE = /^[a-z0-9-]{1,32}$/.test(codeAttr) ? codeAttr : 'site-imposter-play';

  // --- promoter passthrough, exactly as /play/ does it ----------------------
  // /imposter-game/?c=<code>&o=<OFFER> carries a campaign code (and a flyer's
  // free week) onto the wall's install button. Same sanitising and the same
  // sessionStorage key as /play/, so a visitor who came in through a promoter
  // link keeps their offer across both pages. No code: site-imposter-play
  // (site-imposter-es / site-imposter-pt on those pages, from data-code).
  var promo = { code: null, offer: null };
  try {
    var q = location.search.toLowerCase();
    var mc = /[?&]c=([a-z0-9-]{1,32})(&|$)/.exec(q);
    var mo = /[?&]o=([a-z0-9]{1,20})(&|$)/.exec(q);
    if (mc) promo.code = mc[1];
    if (mo) promo.offer = mo[1].toUpperCase();
    if (promo.code || promo.offer) sessionStorage.setItem('anticsPlayPromo', JSON.stringify(promo));
    else { var saved = sessionStorage.getItem('anticsPlayPromo'); if (saved) promo = JSON.parse(saved) || promo; }
  } catch (e) {}
  (function applyPromo() {
    var code = /^[a-z0-9-]{1,32}$/.test(promo.code || '') ? promo.code : null;
    var offer = /^[A-Z0-9]{1,20}$/.test(promo.offer || '') ? promo.offer : null;
    promo.code = code; promo.offer = offer;
    $('idl-get').href = '/get/?c=' + (code || DEFAULT_CODE) + (offer ? '&o=' + offer : '');
    if (offer && /iphone|ipad|ipod/i.test(navigator.userAgent)) $('idl-offer').hidden = false;
  })();

  // --- beacon, the /play/ shape: no identifiers, one random id per visit ----
  var PLAY_SID = 'web-' + Math.random().toString(36).slice(2, 10);
  function beacon(name, props) {
    try {
      fetch('https://amioohsgipjzagmclwle.supabase.co/functions/v1/ingest-events', {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json', 'x-antics-key': '3ee624f1eea2a9e2b1f6aa66955369e4a4942134f46ac504' },
        body: JSON.stringify({ events: [{ name: name, props: props, ts: new Date().toISOString(), sessionId: PLAY_SID, appVersion: 'site', platform: 'web' }] })
      }).catch(function () {});
    } catch (e) {}
  }

  // --- words ---------------------------------------------------------------
  var decks = null;
  var loading = null;
  function isText(s) { return typeof s === 'string' && s.length > 0 && s.length <= 80; }
  function load() {
    if (decks) return Promise.resolve(decks);
    if (loading) return loading;
    loading = fetch(WORDS_URL, { credentials: 'omit' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (data) {
        var out = [];
        (data && data.decks || []).forEach(function (d) {
          if (!d || !isText(d.id) || !isText(d.name) || !Array.isArray(d.words)) return;
          var words = d.words.filter(function (w) {
            return Array.isArray(w) && isText(w[0]) && (w[1] === '' || isText(w[1]));
          });
          if (words.length) out.push({ id: d.id, name: d.name, kind: d.kind === 'place' ? 'place' : 'word', words: words, queue: null });
        });
        if (!out.length) throw new Error('no words');
        decks = out;
        return decks;
      })
      .catch(function (e) { loading = null; throw e; });
    return loading;
  }
  load().catch(function () {});   // start early; a failure is retried on Deal

  function shuffle(n) {
    var a = [];
    for (var i = 0; i < n; i++) a.push(i);
    for (var j = a.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }
  function rand(n) { return Math.floor(Math.random() * n); }

  // No repeats within a visit: each deck deals from its own shuffled queue
  // (null until first used) and reshuffles only once every word has been out.
  function left(deck) { return deck.queue ? deck.queue.length : deck.words.length; }
  function drawFrom(deck) {
    if (!deck.queue || !deck.queue.length) deck.queue = shuffle(deck.words.length);
    return deck.words[deck.queue.pop()];
  }
  // Mix it up: a deck is picked in proportion to the words it has left, so the
  // whole pool goes round once before anything repeats. (The app weights by
  // deck size and keeps its no-repeat memory per deck on the phone.)
  function pickDeck(id) {
    if (id !== 'mix') {
      for (var i = 0; i < decks.length; i++) if (decks[i].id === id) return decks[i];
    }
    var total = 0;
    decks.forEach(function (d) { total += left(d); });
    if (total === 0) {
      decks.forEach(function (d) { d.queue = null; });
      decks.forEach(function (d) { total += left(d); });
    }
    var roll = Math.random() * total;
    for (var j = 0; j < decks.length; j++) {
      roll -= left(decks[j]);
      if (roll < 0) return decks[j];
    }
    return decks[decks.length - 1];
  }

  // --- state ---------------------------------------------------------------
  var state = {
    players: 5,              // the app's default
    deckId: 'mix',
    hintOn: true,            // the app's default
    roundNo: 0,              // rounds dealt this visit
    blockOpen: false,        // a block of three has started and not hit the wall
    blockRounds: 0,          // finished rounds in the open block
    round: null,             // { deck, word, hint, imposter, starter }
    turn: 0
  };

  var screens = ['setup', 'pass', 'secret', 'talk', 'result', 'wall'];
  // DOUBLE-TAP GUARD. A quick second tap on "Pass to the next player" would
  // otherwise land on the next screen's "Tap to see your role" and show the
  // NEXT player's role to the one still holding the phone. Every button on a
  // fresh screen ignores taps for a moment after it appears.
  var shownAt = 0;
  var SETTLE_MS = 450;
  function settled() { return Date.now() - shownAt >= SETTLE_MS; }
  // LAYOUT ONLY (design pass, 5 Oct 2026): where the dealer sits on screen.
  // The visible area ends above the phone install bar when it shows. Once a
  // round is under way the panel is brought to the top of the screen if it
  // starts low or runs past the bottom, so every turn (the role card, the
  // reveal) plays without scrolling. On wide screens the panel is pinned in
  // the right rail and never moves. Back on setup only the old rule applies.
  function visibleBottom() {
    var bar = document.querySelector('.installbar');
    if (bar && bar.getBoundingClientRect().height > 0) return bar.getBoundingClientRect().top - 8;
    return window.innerHeight;
  }
  function show(name, focusId) {
    shownAt = Date.now();
    screens.forEach(function (s) { $('idl-' + s).hidden = (s !== name); });
    var r = root.getBoundingClientRect();
    var bottom = visibleBottom();
    var off = r.top < 0 || r.top > window.innerHeight * 0.6;
    if (name !== 'setup') off = off || r.top > bottom * 0.25 || r.bottom > bottom;
    if (off) {
      try { root.scrollIntoView({ block: 'start' }); } catch (e) { root.scrollIntoView(true); }
    }
    if (focusId) { try { $(focusId).focus({ preventScroll: true }); } catch (e) {} }
  }

  // --- setup -----------------------------------------------------------------
  function renderCount() {
    $('idl-count').textContent = String(state.players);
    $('idl-minus').disabled = state.players <= MIN_PLAYERS;
    $('idl-plus').disabled = state.players >= MAX_PLAYERS;
    $('idl-deal').textContent = COPY.deal(state.players);
  }
  $('idl-minus').addEventListener('click', function () {
    state.players = Math.max(MIN_PLAYERS, state.players - 1); renderCount();
  });
  $('idl-plus').addEventListener('click', function () {
    state.players = Math.min(MAX_PLAYERS, state.players + 1); renderCount();
  });
  Array.prototype.forEach.call(root.querySelectorAll('input[name="idl-deck"]'), function (r) {
    r.addEventListener('change', function () { if (r.checked) state.deckId = r.value; });
    if (r.checked) state.deckId = r.value;   // a restored form keeps its choice
  });
  var hintBox = $('idl-hint');
  state.hintOn = hintBox.checked;
  hintBox.addEventListener('change', function () { state.hintOn = hintBox.checked; });
  renderCount();

  function startBlock() {
    state.blockOpen = true;
    state.blockRounds = 0;
    beacon('play_started', {
      game: 'imposter', names: 'no', code: promo.code || 'none',
      players: state.players, deck: state.deckId, hint: state.hintOn ? 'on' : 'off', lang: LANG
    });
  }

  var dealBtn = $('idl-deal');
  var errEl = $('idl-err');
  dealBtn.addEventListener('click', function () {
    errEl.hidden = true;
    dealBtn.disabled = true;
    load().then(function () {
      dealBtn.disabled = false;
      nextRound();
    }, function () {
      dealBtn.disabled = false;
      errEl.textContent = COPY.loadFail;
      errEl.hidden = false;
    });
  });

  // --- a round ----------------------------------------------------------------
  function dealRound() {
    var deck = pickDeck(state.deckId);
    var pair = drawFrom(deck);
    state.round = {
      deck: deck,
      word: pair[0],
      hint: state.hintOn ? (pair[1] || '') : '',
      imposter: rand(state.players),
      // From everyone, the imposter included (the app's rule, Guy 31 Aug):
      // a starter who can never be the imposter is a free clue to the room.
      starter: rand(state.players)
    };
    state.roundNo++;
    state.turn = 0;
    $('idl-round').textContent = COPY.round(state.roundNo);
    showPass();
  }

  function showPass() {
    $('idl-pass-name').textContent = COPY.player(state.turn + 1);
    show('pass', 'idl-pass-name');
  }

  function line(cls, text) {
    var p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    return p;
  }

  $('idl-peek').addEventListener('click', function () {
    if (!settled()) return;
    var r = state.round;
    var card = $('idl-card');
    while (card.firstChild) card.removeChild(card.firstChild);
    var place = r.deck.kind === 'place';
    if (state.turn === r.imposter) {
      card.className = 'idl-card is-imposter';
      var emoji = line('idl-emoji', '😈');
      emoji.setAttribute('aria-hidden', 'true');
      card.appendChild(emoji);
      card.appendChild(line('idl-imp', COPY.impTitle));
      card.appendChild(line('label', COPY.category(r.deck.name)));
      card.appendChild(line('idl-body', place ? COPY.impBodyPlace : COPY.impBodyWord));
      if (r.hint) {
        card.appendChild(line('label', COPY.hintTitle));
        card.appendChild(line('idl-word', r.hint));
      }
    } else {
      card.className = 'idl-card';
      card.appendChild(line('label', COPY.category(r.deck.name)));
      card.appendChild(line('label', place ? COPY.youreAt : COPY.yourWord));
      card.appendChild(line('idl-word', r.word));
      card.appendChild(line('idl-body', place ? COPY.placeBody : COPY.wordBody));
    }
    $('idl-next').textContent = state.turn + 1 < state.players ? COPY.next : COPY.allSeen;
    show('secret', 'idl-card');
  });

  $('idl-next').addEventListener('click', function () {
    if (!settled()) return;
    // Wipe the card before anything else, so nothing of this role is left
    // in the page for the next player.
    var card = $('idl-card');
    while (card.firstChild) card.removeChild(card.firstChild);
    if (state.turn + 1 < state.players) {
      state.turn++;
      showPass();
      return;
    }
    var r = state.round;
    $('idl-talk-body').textContent = r.deck.kind === 'place' ? COPY.talkPlace : COPY.talkWord;
    $('idl-starter').textContent = COPY.starts(COPY.player(r.starter + 1));
    show('talk', 'idl-talk-title');
  });

  $('idl-reveal').addEventListener('click', function () {
    if (!settled()) return;
    var r = state.round;
    state.blockRounds++;
    $('idl-res-name').textContent = COPY.player(r.imposter + 1);
    $('idl-res-label').textContent = r.deck.kind === 'place' ? COPY.wasPlace : COPY.wasWord;
    $('idl-res-word').textContent = r.word;
    var hintEl = $('idl-res-hint');
    hintEl.hidden = !r.hint;
    hintEl.textContent = r.hint ? COPY.hintWas(r.hint) : '';
    show('result', 'idl-res-name');
  });

  // Every way to the next deal goes through here, so "Change settings" after
  // the third round cannot step round the wall.
  function nextRound() {
    if (!settled()) return;
    if (state.blockOpen && state.blockRounds >= ROUNDS_PER_BLOCK) {
      state.blockOpen = false;
      beacon('play_wall_reached', { game: 'imposter', cards: state.blockRounds, code: promo.code || 'none', reason: 'complete', lang: LANG });
      show('wall', 'idl-wall-title');
      return;
    }
    if (!state.blockOpen) startBlock();
    dealRound();
  }

  $('idl-new').addEventListener('click', nextRound);

  $('idl-settings').addEventListener('click', function () {
    if (!settled()) return;
    renderCount();
    show('setup', null);
  });

  $('idl-more').addEventListener('click', nextRound);   // the block is closed, so this opens a new one
})();
