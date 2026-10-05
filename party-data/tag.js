// /party-data/: a pitch link such as /party-data/?c=pitch-data-tab carries its
// tag through to every /get/ link on the page, so an install that started in a
// pitch email shows up under that tag on get_visit, as on /play/. Same rule as
// /get/index.html: lowercase a-z, digits and hyphens, 32 characters at most.
(function () {
  var m = /[?&]c=([a-z0-9-]{1,32})(&|$)/.exec(location.search.toLowerCase());
  if (!m) return;
  var links = document.querySelectorAll('a[href^="/get/"]');
  for (var i = 0; i < links.length; i++) links[i].setAttribute('href', '/get/?c=' + m[1]);
})();
