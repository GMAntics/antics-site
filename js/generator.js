/* Antics web generator: a reusable, embeddable card-draw tool.
   Drop <div id="antics-gen" data-game="nhie"></div> on a page, load
   /js/questions.js, /js/questions-clean.js then this file.

   Modes: "party" (default) and "clean" (forfeit only, no drinking,
   safe for workplaces, classrooms, weddings and family events).
   Pick one with ?mode=clean, data-mode="clean", or the on-page toggle.
   Honours ?embed=1 for iframe use. In an iframe with an explicit ?mode=
   the toggle is hidden, so an embedding site keeps the deck it chose. */
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
  var APPLE = 'https://apps.apple.com/app/id6787743558';
  var PLAY = 'https://play.google.com/store/apps/details?id=com.anticsapp.antics';

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

  function init(root) {
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
        '<a class="agen-btn" href="' + APPLE + '" rel="nofollow">App Store</a>' +
        '<a class="agen-btn" href="' + PLAY + '" rel="nofollow">Google Play</a>' +
      '</div>';

    var qEl = root.querySelector('.agen-q');
    var nextBtn = root.querySelector('.agen-next');
    var copyBtn = root.querySelector('.agen-copy');
    var countEl = root.querySelector('.agen-count');
    var ctaH = root.querySelector('.agen-cta-h');
    var modeBtns = root.querySelectorAll('.agen-mode');

    function ctaLine() {
      return mode === 'clean'
        ? 'From Antics, the 18+ party game app: a stack of games, thousands of cards.'
        : 'Want thousands more cards and a whole stack more games?';
    }
    function deckLine() {
      return mode === 'clean'
        ? total + ' free clean cards. Nothing about drinking.'
        : total + ' free cards. The app has thousands.';
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
      if (idx < 0) {
        qEl.textContent = 'Tap below to draw your first ' + cfg.label + ' card.';
        copyBtn.style.visibility = 'hidden';
        nextBtn.textContent = 'Draw a card';
        countEl.textContent = deckLine();
        return;
      }
      if (idx >= order.length) {
        qEl.textContent = "That's all " + total + ' free ' + cfg.label + ' cards. The app has thousands more, plus seven other games.';
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
