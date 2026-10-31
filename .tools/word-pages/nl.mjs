// Word-page config for nl, Dutch (one page for the Netherlands and Flanders), read by ../gen-es-pt-word-pages.mjs.
// Every visible sentence of this language's printable word page lives here;
// the word tables come from the app mirror, never from this file. The
// hreflang lines, the og:locale alternates and the language switcher are NOT
// written here: the generator builds them from every config in this folder.
// Written 10 Oct 2026 from es.mjs. The app calls the game Bedrieger; the page
// says imposter (the searched word) and names the app's word once.
// Multi-line HTML values are template literals whose indentation is part of
// the page: keep it as it is.
export default {
  lang: 'nl', order: 6, hreflang: 'nl',
  dealerWords: 'nl/imposter-spel/words.json', wordsId: 'woorden',
  htmlLang: 'nl', path: '/nl/imposter-woorden/', dir: 'nl/imposter-woorden',
  ogLocale: 'nl_NL',
  title: 'Imposter spel woorden: lijst met hints om te printen',
  desc: 'Imposter woorden met een makkelijke en een moeilijke hint: eten, beroemdheden, locaties, voorwerpen, merken, sport en kerst. Om te printen en zonder telefoon te spelen.',
  ogTitle: 'Woorden voor het imposter spel, met makkelijke en moeilijke hints',
  crumbLabel: 'Kruimelpad', langHome: '/nl/', langName: 'Nederlands',
  crumbGame: 'Imposter spel online', gamePath: '/nl/imposter-spel/', crumbHere: 'Woorden',
  ldGame: 'Imposter spel online', ldHere: 'Woorden voor het imposter spel',
  h1: 'Woorden voor het imposter spel',
  standfirst: 'Zes volledige categorieën voor het imposter spel en de kerstcategorie, met bij elk woord een makkelijke en meestal ook een moeilijke hint voor de imposter. Je kunt er ook op papier mee spelen, zonder telefoon, en je print ze met één categorie per pagina.',
  note: 'Spelen jullie meteen? <a class="inline" href="/nl/imposter-spel/">Deel de woorden uit op één telefoon</a>, gratis en zonder iets te downloaden.',
  ilangLabel: 'Taal',
  tocLabel: 'Op deze pagina',
  tocAfter: [['zonder-telefoon', 'Zonder telefoon'], ['met-3-spelers', 'Met 3 spelers']],
  wordsH2: 'De woorden en de hint voor de imposter',
  wordsP: 'Elk woord op deze pagina staat in de app Antics in het Nederlands, met dezelfde hints. In de app heet het spel Bedrieger. De hint is wat de imposter ziet in plaats van het woord: iets wat in de buurt komt, zonder het antwoord weg te geven. De makkelijke hint ligt voor de hand; de moeilijke gaat meer over het moment of de sfeer, dus de imposter moet meer bluffen. Is de moeilijke hint leeg, dan geeft de app de makkelijke. Op papier bepalen jullie zelf welke hint de imposter krijgt, of helemaal geen.',
  printTip: 'Printen: kies op je computer Afdrukken (Ctrl+P, of Cmd+P op een Mac). Elke categorie komt op een eigen pagina.',
  thWord: 'Geheim woord', thHint: 'Hint voor de imposter',
  paperId: 'zonder-telefoon',
  paperH2: 'Zo speel je het imposter spel zonder telefoon of app',
  paperP: 'Je hebt geen telefoon of app nodig: alleen papier, een pen en deze lijst. Elke ronde deelt één persoon uit, en die speelt zelf niet mee.',
  paperSteps: [
    'Wie uitdeelt, kiest een woord uit de lijst en vertelt het aan niemand.',
    'Knip voor elke speler een papiertje. Schrijf het woord op alle papiertjes behalve één, en schrijf op dat ene papiertje “Imposter”. Wil je de imposter helpen, schrijf dan ook de hint erop.',
    'Vouw de papiertjes dubbel, hussel ze door elkaar en laat iedereen er één pakken zonder het te laten zien.',
    'Ga één keer de kring rond: iedereen noemt één detail van het woord, zonder het te zeggen. De imposter doet alsof die het woord ook kent.',
    'Op drie wijzen jullie allemaal naar je verdachte. Wordt de imposter gesnapt, dan mag die nog één keer raden wat het woord was, en wie goed raadt, wint toch nog.',
    'De volgende ronde deelt degene links van de uitdeler uit.',
  ],
  paperAfter: 'Zonder papier kan het ook: de app Antics laat het woord aan iedereen zien behalve aan de imposter, die een hint krijgt, en zo hoeft niemand aan de kant te blijven.',
  threeId: 'met-3-spelers',
  threeH2: 'Zo speel je het imposter spel met 3 spelers',
  threeP: 'Met z’n drieën hoeven de twee die het woord kennen alleen elkaar te vertrouwen, en is de stemming voorbij voordat die begint. Met deze vier aanpassingen wordt het weer een spel:',
  threeSteps: [
    'Deel uit op een telefoon, niet op papier: met z’n drieën kan niemand aan de kant blijven om de papiertjes te schrijven. <a class="inline" href="/nl/imposter-spel/">Het imposter spel online</a> werkt vanaf drie spelers.',
    'Eén woord per persoon en maar één rondje. Stem daarna.',
    'Iedereen mag beginnen, ook de imposter. Als degene die begint nooit de imposter is, strepen de anderen die persoon meteen weg.',
    'Laat de hint aanstaan en houd de score bij: de imposter krijgt een punt als die de stemming overleeft en nog één als die het woord raadt, gesnapt of niet, en de andere twee krijgen elk een punt als ze de juiste persoon aanwijzen. Wie als eerste vijf punten heeft, wint.',
  ],
  // Copied exactly from the /nl/ hub's closing box (tags are this page's own)
  cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Negen spellen. Eén telefoon.</h2>
        <p>Zonder advertenties, zonder account, en iedereen doet mee.</p>
        <a class="cta" href="/get/?c=site-nl-woorden">Download Antics gratis</a>
        <div class="cta-qr">
          <img src="/nl/imposter-woorden/qr.png" width="120" height="120" alt="QR-code die Antics op je telefoon opent" loading="lazy">
          <p>Zit je achter een laptop? Richt de camera van je telefoon hierop.</p>
        </div>
      </div>`,
  guides: `<nav class="guides tone-cyan" aria-label="Meer spellen in het Nederlands">
        <strong>Meer spellen in het Nederlands</strong>
        <ul class="link-list">
          <li><a href="/nl/imposter-spel/">Imposter spel online, op één telefoon</a></li>
          <li><a href="/nl/ik-heb-nog-nooit-vragen/">Ik heb nog nooit: vragen en hoe je het speelt</a></li>
          <li><a href="/nl/truth-or-dare-vragen/">Truth or dare: vragen en durfopdrachten</a></li>
          <li><a href="/nl/zou-je-liever-vragen/">Zou je liever: dilemma’s die de groep verdelen</a></li>
          <li><a href="/nl/most-likely-to-vragen/">Most likely to vragen: wie zou het eerst…?</a></li>
          <li><a href="/nl/">Antics in het Nederlands: alle spellen</a></li>
        </ul>
      </nav>`,
  footer: `<footer class="site-foot">
    <a href="/nl/">Antics: feestspellen</a> · <a href="/privacy.html" hreflang="en">Privacy (in het Engels)</a><br>
    18+ · Pas goed op elkaar.
  </footer>`,
  installbar: `<aside class="installbar" aria-label="Download de app">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Feestspellen</span></p>
  <a class="btn btn--sm" href="/get/?c=site-nl-woorden-bar">Gratis downloaden</a>
</aside>`,
  // The fuller page (31 Oct 2026, FINAL.md item 15's second wave in the app
  // repo's ops/research/seo-route-2026-10-29/, the es/pt `more` block of 30
  // Oct): both hint tiers, Brands, Sports and Christmas, and the hard-words
  // section. The {word:...} and {name:...} tokens are filled from the mirror
  // by the generator, never typed here. See the generator's header.
  more: {
    thEasy: 'Makkelijke hint', thHard: 'Moeilijke hint',
    follow: 'In de app Antics ontgrendel je deze categorie gratis door Antics te volgen op TikTok of Instagram.',
    christmasLine: 'Gratis in de app Antics van 1 december tot en met 1 januari.',
    christmasToc: 'Kerst',
    draw: 'Trek een willekeurig woord',
    hard: {
      id: 'moeilijke-woorden', h2: 'Moeilijke imposter woorden', toc: 'Moeilijke woorden',
      p: [
        'Een moeilijk woord is heel specifiek. Bij ‘{word:sports:5}’, ‘{word:sports:11}’, ‘{word:brands:16}’ of ‘{word:sports:34}’ zijn er maar weinig voor de hand liggende details, dus wie het woord kent, heeft de veilige details snel opgebruikt.',
        'Meteen moeilijk beginnen? Neem {name:everyday-objects}, de lijst hieronder. Iedereen heeft die dingen in huis, maar niemand heeft ze ooit hardop beschreven.',
        'Elk woord op deze pagina wordt moeilijker als jullie de imposter de moeilijke hint geven in plaats van de makkelijke. Dat werkt het best bij groepen die al een paar keer gespeeld hebben.',
      ],
    },
  },
  qr: 'https://anticsapp.com/get/?c=site-nl-woorden-qr',
};
