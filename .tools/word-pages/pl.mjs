// Word-page config for pl, Polish (pl-PL), read by ../gen-es-pt-word-pages.mjs.
// Every visible sentence of this language's printable word page lives here;
// the word tables come from the app mirror, never from this file. The
// hreflang lines, the og:locale alternates and the language switcher are NOT
// written here: the generator builds them from every config in this folder.
// Written 10 Oct 2026 from the es config's structure. Polish sites call the
// secret word "hasło", the app says "sekretne słowo" / "tajne słowo", so the
// prose uses both.
// Multi-line HTML values are template literals whose indentation is part of
// the page: keep it as it is.
export default {
  lang: 'pl', order: 7, hreflang: 'pl',
  dealerWords: 'pl/gra-w-impostora/words.json', wordsId: 'hasla',
  htmlLang: 'pl', path: '/pl/hasla-do-impostora/', dir: 'pl/hasla-do-impostora',
  ogLocale: 'pl_PL',
  title: 'Hasła do gry w impostora: słowa z podpowiedziami | Antics',
  desc: 'Hasła do gry w impostora z łatwą i trudną podpowiedzią: jedzenie, znane osoby, miejsca, przedmioty, marki, sport i święta. Do druku i do gry bez telefonu.',
  ogTitle: 'Hasła do gry w impostora, łatwe i trudne',
  crumbLabel: 'Ścieżka nawigacji', langHome: '/pl/', langName: 'Polski',
  crumbGame: 'Gra w impostora online', gamePath: '/pl/gra-w-impostora/', crumbHere: 'Hasła',
  ldGame: 'Gra w impostora online', ldHere: 'Hasła do gry w impostora',
  h1: 'Hasła do gry w impostora',
  standfirst: 'Sześć pełnych kategorii haseł do gry w impostora i do tego kategoria świąteczna, z łatwą i trudną podpowiedzią dla impostora do każdego słowa. Przydadzą się do gry na kartkach, bez telefonu, a przy drukowaniu każda kategoria trafia na osobną stronę.',
  note: 'Chcecie zagrać od razu? <a class="inline" href="/pl/gra-w-impostora/">Rozdajcie hasła na jednym telefonie</a>, za darmo i bez pobierania.',
  ilangLabel: 'Język',
  tocLabel: 'Na tej stronie',
  tocAfter: [['bez-telefonu', 'Bez telefonu'], ['we-trojke', 'We trójkę']],
  wordsH2: 'Hasła i podpowiedź dla impostora',
  wordsP: 'Każde hasło (tajne słowo) z tej strony pojawia się w aplikacji Antics po polsku, z tymi samymi podpowiedziami. Podpowiedź jest tym, co impostor widzi zamiast hasła: czymś, co go naprowadza, ale nie zdradza odpowiedzi. Łatwa rzuca się w oczy, a trudna mówi raczej o chwili albo nastroju, więc impostor musi bardziej blefować. Jeśli trudna jest pusta, aplikacja daje łatwą. Na kartkach sami decydujecie, którą mu dać i czy w ogóle.',
  printTip: 'Do druku: na komputerze wybierzcie Drukuj (Ctrl+P albo Cmd+P na Macu). Każda kategoria drukuje się na osobnej stronie.',
  thWord: 'Hasło', thHint: 'Podpowiedź dla impostora',
  paperId: 'bez-telefonu',
  paperH2: 'Jak grać w impostora bez telefonu i bez aplikacji',
  paperP: 'Nie potrzebujecie telefonu ani aplikacji: wystarczą kartki, coś do pisania i ta lista. W każdej rundzie jedna osoba rozdaje i nie gra.',
  paperSteps: [
    'Osoba rozdająca wybiera hasło z listy i nikomu go nie mówi.',
    'Wycina karteczkę dla każdego gracza. Na wszystkich pisze hasło, oprócz jednej, na której pisze „IMPOSTOR”. Jeśli chcecie pomóc impostorowi, dopisuje na niej też podpowiedź.',
    'Złóżcie karteczki, wymieszajcie je i niech każdy wylosuje jedną, nikomu jej nie pokazując.',
    'Zróbcie jedno kółko: każdy po kolei mówi jeden szczegół o haśle, nie wypowiadając go. Impostor udaje, że je zna.',
    'Na trzy wszyscy wskazują swojego podejrzanego. Jeśli złapiecie impostora, ma jedną szansę, żeby odgadnąć hasło, a jeśli trafi, i tak wygrywa.',
    'W następnej rundzie rozdaje osoba po lewej.',
  ],
  paperAfter: 'Bez kartek też się da: aplikacja Antics pokazuje hasło wszystkim oprócz impostora, który dostaje podpowiedź, więc nikt nie musi siedzieć z boku.',
  threeId: 'we-trojke',
  threeH2: 'Jak grać w impostora we trójkę',
  threeP: 'We trójkę dwie osoby, które znają hasło, muszą tylko zaufać sobie nawzajem, a głosowanie kończy się, zanim się zacznie. Te cztery zmiany przywracają grze sens:',
  threeSteps: [
    'Rozdajcie role na telefonie, nie na kartkach: we trójkę nikt nie może usiąść z boku, żeby wypisywać karteczki. <a class="inline" href="/pl/gra-w-impostora/">Gra w impostora online</a> działa już od trzech graczy.',
    'Jedno słowo na osobę i tylko jedno kółko. Potem głosujcie.',
    'Zacząć może każdy, także impostor. Jeśli zaczynająca osoba nigdy nie jest impostorem, pozostali od razu ją skreślają.',
    'Zostawcie podpowiedź włączoną i liczcie punkty: impostor dostaje punkt, jeśli przetrwa głosowanie, i drugi, jeśli odgadnie hasło, niezależnie od tego, czy go złapaliście, a pozostała dwójka dostaje po punkcie, jeśli wskaże właściwą osobę. Wygrywa ten, kto pierwszy zdobędzie pięć punktów.',
  ],
  // Copied exactly from the /pl/ hub's closing box (tags are this page's own)
  cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Dziewięć gier. Jeden telefon.</h2>
        <p>Bez reklam, bez rejestracji i grają wszyscy.</p>
        <a class="cta" href="/get/?c=site-pl-hasla">Pobierz Antics za darmo</a>
        <div class="cta-qr">
          <img src="/pl/hasla-do-impostora/qr.png" width="120" height="120" alt="Kod QR, który otwiera Antics na telefonie" loading="lazy">
          <p>Jesteś przy komputerze? Zeskanuj ten kod aparatem w telefonie.</p>
        </div>
      </div>`,
  guides: `<nav class="guides tone-cyan" aria-label="Więcej gier po polsku">
        <strong>Więcej gier po polsku</strong>
        <ul class="link-list">
          <li><a href="/pl/gra-w-impostora/">Gra w impostora online, na jednym telefonie</a></li>
          <li><a href="/pl/pytania-nigdy-przenigdy/">Nigdy przenigdy: pytania i zasady gry</a></li>
          <li><a href="/pl/pytania-prawda-czy-wyzwanie/">Prawda czy wyzwanie: pytania i wyzwania</a></li>
          <li><a href="/pl/pytania-co-wolisz/">Co wolisz? Pytania, które podzielą grupę</a></li>
          <li><a href="/pl/pytania-kto-z-nas/">Kto z nas najprawdopodobniej…? Pytania do gry</a></li>
          <li><a href="/pl/">Antics po polsku: wszystkie gry</a></li>
        </ul>
      </nav>`,
  footer: `<footer class="site-foot">
    <a href="/pl/">Antics: gry imprezowe</a> · <a href="/privacy.html" hreflang="en">Prywatność (po angielsku)</a><br>
    18+ · Dbajcie o siebie nawzajem.
  </footer>`,
  installbar: `<aside class="installbar" aria-label="Pobierz aplikację">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Gry imprezowe</span></p>
  <a class="btn btn--sm" href="/get/?c=site-pl-hasla-bar">Pobierz za darmo</a>
</aside>`,
  // The fuller page (31 Oct 2026, FINAL.md item 15's second wave in the app
  // repo's ops/research/seo-route-2026-10-29/, the es/pt `more` block of 30
  // Oct): both hint tiers, Brands, Sports and Christmas, and the hard-words
  // section. The {word:...} and {name:...} tokens are filled from the mirror
  // by the generator, never typed here. See the generator's header.
  more: {
    thEasy: 'Łatwa podpowiedź', thHard: 'Trudna podpowiedź',
    follow: 'W aplikacji Antics tę kategorię można odblokować za darmo, obserwując Antics na TikToku albo Instagramie.',
    christmasLine: 'Za darmo w aplikacji Antics od 1 grudnia do 1 stycznia.',
    christmasToc: 'Święta',
    draw: 'Wylosuj hasło',
    hard: {
      id: 'trudne-hasla', h2: 'Trudne hasła do impostora', toc: 'Trudne hasła',
      p: [
        'Trudne hasło jest bardzo konkretne: „{word:sports:5}”, „{word:sports:11}”, „{word:brands:16}” czy „{word:sports:34}” mają niewiele oczywistych szczegółów, więc ci, którzy znają hasło, szybko tracą bezpieczne tropy.',
        'Na początek coś trudnego: {name:everyday-objects}, lista tuż poniżej. Każdy ma te rzeczy w domu, ale nikt nigdy nie opisywał ich na głos.',
        'Każde hasło z tej strony będzie trudniejsze, jeśli dacie impostorowi trudną podpowiedź zamiast łatwej. Najlepiej sprawdza się to w grupach, które grały już kilka razy.',
      ],
    },
  },
  qr: 'https://anticsapp.com/get/?c=site-pl-hasla-qr',
};
