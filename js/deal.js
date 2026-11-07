/* /js/deal.js (7 Nov 2026, Direction A "The Deal"). The shared page script,
   loaded with defer on every page that has a tier card, a closing box or the
   install bar. Vanilla, no dependency; with no script nothing is missing.

   1. THE DEAL-IN (css/site.css section 24). A .tier-card or .cta-block gets
      .is-dealt, once, the first time it comes on screen, and the CSS plays
      the deal. One already on screen when the page loads is never dealt (it
      would blink out and back), and under prefers-reduced-motion: reduce
      this part does nothing at all.

   2. THE INSTALL BAR TUCKS while the closing box (.cta-block) or a word
      list's draw button (.wl-draw) is 40 percent or more on screen, so the
      box's own pink "Get Antics free" is the one pink on screen.
      ONE BAR, SEVERAL OWNERS: js/generator.js, imposter-game/dealer.js and
      the Four Kings table tuck it for their own panels too. Each owner
      writes only its own word in the bar's data-tuck list ("page" is this
      script's), and .is-tucked is on while that list is not empty, so one
      owner can never untuck the bar another still needs tucked. All four
      carry the same small tuck() below. */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

  // Shared with js/generator.js, imposter-game/dealer.js, four-kings-online:
  // `still` sets the change with no slide (a bar that was never there).
  function tuck(bar, why, on, still) {
    var list = (bar.getAttribute('data-tuck') || '').split(' ').filter(Boolean);
    var i = list.indexOf(why);
    if (on && i < 0) list.push(why);
    if (!on && i > -1) list.splice(i, 1);
    if (list.length) bar.setAttribute('data-tuck', list.join(' '));
    else bar.removeAttribute('data-tuck');
    if (bar.classList.contains('is-tucked') === list.length > 0) return;
    if (still) bar.style.transition = 'none';
    bar.classList.toggle('is-tucked', list.length > 0);
    if (still) { void bar.offsetWidth; bar.style.transition = ''; }
  }
  function shown(el) {
    var r = el.getBoundingClientRect();
    if (!r.height) return 0;
    return (Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / r.height;
  }

  // 1. The deal-in
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = document.querySelectorAll('.tier-card, .cta-block');
  if (!calm && cards.length) {
    // "At load" lasts until a moment after the load event, so a reload's
    // restored scroll position counts as on screen at load, not as a deal.
    var armed = false;
    var arm = function () { setTimeout(function () { armed = true; }, 100); };
    if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm);
    var deal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        deal.unobserve(e.target);
        if (armed) e.target.classList.add('is-dealt');
      });
    }, { rootMargin: '0px 0px 24px 0px' });   // dealt just before it shows, so no sliver flashes
    each(cards, function (el) { if (shown(el) <= 0) deal.observe(el); });
  }

  // 2. The install bar
  var bar = document.querySelector('.installbar');
  var spots = document.querySelectorAll('.cta-block, .wl-draw');
  if (bar && spots.length) {
    var inView = [];
    var watch = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var k = inView.indexOf(e.target), on = e.isIntersecting && e.intersectionRatio >= 0.399;
        if (on && k < 0) inView.push(e.target);
        if (!on && k > -1) inView.splice(k, 1);
      });
      tuck(bar, 'page', inView.length > 0);
    }, { threshold: [0, 0.4, 1] });
    each(spots, function (el) {
      if (shown(el) >= 0.4) tuck(bar, 'page', true, true);
      watch.observe(el);
    });
  }
})();
