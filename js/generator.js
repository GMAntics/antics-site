/* Antics web generator: a reusable, embeddable card-draw tool.
   Drop <div id="antics-gen" data-game="nhie"></div> on a page, load
   /js/questions.js then this file. Honours ?embed=1 for iframe use. */
(function () {
  var CFG = {
    nhie: { prefix: 'Never have I ever', label: 'Never Have I Ever', lower: true },
    wyr:  { prefix: 'Would you rather',  label: 'Would You Rather',  lower: true },
    mlt:  { prefix: 'Most likely to',    label: 'Most Likely To',    lower: true },
    tod:  { prefix: '',                  label: 'Truth or Dare',      lower: false },
    odds: { prefix: "What are the odds you'd", label: 'What Are The Odds', lower: true }
  };
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
    return cfg.prefix + ' ' + (cfg.lower ? lc(q) : q);
  }

  function init(root) {
    var game = root.getAttribute('data-game');
    var cfg = CFG[game];
    var pool = (window.ANTICS_QUESTIONS || {})[game] || [];
    if (!cfg || !pool.length) { root.textContent = 'Generator unavailable.'; return; }

    var embed = /[?&]embed=1/.test(location.search);
    var order = shuffle(pool);
    var idx = -1, drawn = 0;
    var total = pool.length;

    root.classList.add('agen');
    if (embed) root.classList.add('agen-embed');
    root.innerHTML =
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
    var current = '';

    function render() {
      if (idx < 0) {
        qEl.textContent = 'Tap below to draw your first ' + cfg.label + ' card.';
        copyBtn.style.visibility = 'hidden';
        countEl.textContent = total + ' free cards. The app has thousands.';
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
      drawn++;
      countEl.textContent = 'Card ' + (idx + 1) + ' of ' + total;
      ctaH.textContent = 'Want thousands more cards and 7 more games?';
    }

    nextBtn.addEventListener('click', function () {
      if (idx >= order.length) { order = shuffle(pool); idx = 0; drawn = 0; nextBtn.textContent = 'Draw a card'; }
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

    render();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-game]');
    for (var i = 0; i < roots.length; i++) if (roots[i].id === 'antics-gen' || roots[i].classList.contains('antics-gen')) init(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
