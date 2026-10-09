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
   or with any other value, is the English widget exactly as before. */
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
    altA.href = L.altUrl + '?c=' + ctaTag + '-imp';
    altA.textContent = L.alt;

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
        qEl.textContent = 'Tap below to draw your first ' + cfg.label + ' card.';
        copyBtn.style.visibility = 'hidden';
        nextBtn.textContent = 'Draw a card';
        countEl.textContent = deckLine();
        return;
      }
      if (idx >= order.length) {
        qEl.textContent = "That's every free " + cfg.label + ' card. The app has thousands more, plus eight other games.';
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
