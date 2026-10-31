// Word-page config for cs, Czech (cs-CZ), read by ../gen-es-pt-word-pages.mjs.
// Every visible sentence of this language's printable word page lives here;
// the word tables come from the app mirror, never from this file. The
// hreflang lines, the og:locale alternates and the language switcher are NOT
// written here: the generator builds them from every config in this folder.
// Written 10 Oct 2026 from es.mjs. The app calls the game Podvodník; Czechs
// search "impostor hra", so the page uses Impostor and names the app's word
// once. Multi-line HTML values are template literals whose indentation is
// part of the page: keep it as it is.
export default {
  lang: 'cs', order: 8, hreflang: 'cs',
  dealerWords: 'cs/impostor-hra/words.json', wordsId: 'slova',
  htmlLang: 'cs', path: '/cs/impostor-hra-slova/', dir: 'cs/impostor-hra-slova',
  ogLocale: 'cs_CZ',
  title: 'Impostor hra: slova s nápovědou, seznam k vytištění',
  desc: 'Slova do hry Impostor s lehkou i těžkou nápovědou: jídlo, slavné osobnosti, místa, předměty, značky, sporty a Vánoce. K vytištění i na hraní bez telefonu.',
  ogTitle: 'Slova do hry Impostor, lehká i těžká',
  crumbLabel: 'Drobečková navigace', langHome: '/cs/', langName: 'Čeština',
  crumbGame: 'Impostor hra online', gamePath: '/cs/impostor-hra/', crumbHere: 'Slova',
  ldGame: 'Impostor hra online', ldHere: 'Slova do hry Impostor',
  h1: 'Slova do hry Impostor',
  standfirst: 'Šest celých kategorií do hry Impostor a k tomu vánoční, s lehkou i těžkou nápovědou, kterou impostor ke každému slovu dostane. Hodí se na hraní na papíře, bez telefonu, a každá kategorie se vytiskne na vlastní stránku.',
  note: 'Chcete hrát hned? <a class="inline" href="/cs/impostor-hra/">Rozdejte slova na jednom telefonu</a>, zdarma a bez stahování.',
  ilangLabel: 'Jazyk',
  tocLabel: 'Na této stránce',
  tocAfter: [['bez-telefonu', 'Bez telefonu'], ['ve-trech', 'Ve třech']],
  wordsH2: 'Slova a nápověda pro impostora',
  wordsP: 'Každé slovo z téhle stránky je i v aplikaci Antics, kde se hra jmenuje Podvodník, a to česky a se stejnými nápovědami. Nápověda je to, co impostor vidí místo slova: něco, co ho k němu postrčí, ale odpověď neprozradí. Lehká je nasnadě, těžká mluví spíš o chvíli nebo náladě, takže impostor musí víc blafovat. Když je těžká prázdná, aplikace dá lehkou. Na papíře si sami rozhodnete, kterou mu dáte, nebo jestli vůbec nějakou.',
  printTip: 'Tisk: na počítači použijte Tisk (Ctrl+P, na Macu Cmd+P). Každá kategorie se vytiskne na vlastní stránku.',
  thWord: 'Tajné slovo', thHint: 'Nápověda pro impostora',
  paperId: 'bez-telefonu',
  paperH2: 'Jak hrát Impostor bez telefonu a bez aplikace',
  paperP: 'Telefon ani aplikace nejsou potřeba: stačí papír, něco na psaní a tenhle seznam. V každém kole jeden člověk rozdává a nehraje.',
  paperSteps: [
    'Kdo rozdává, vybere ze seznamu jedno slovo a nikomu ho neřekne.',
    'Pro každého hráče ustřihne jeden lísteček. Na všechny napíše slovo, jen na jeden ne, a na ten napíše Impostor. Jestli chcete impostorovi pomoct, připíše na jeho lísteček i nápovědu.',
    'Lístečky přeložte, zamíchejte a každý si jeden vytáhne, aniž by ho ukázal.',
    'Jděte dokola: každý řekne jeden detail o slově, ale slovo samotné nevysloví. Impostor dělá, že ho zná.',
    'Na tři všichni ukážou na svého podezřelého. Když impostora chytíte, má jeden pokus uhodnout slovo, a když se trefí, stejně vyhrává.',
    'V dalším kole rozdává ten, kdo sedí vlevo.',
  ],
  paperAfter: 'Jde to i bez papíru: aplikace Antics ukáže slovo všem kromě impostora, který dostane nápovědu, a nikdo tak nemusí zůstat stranou.',
  threeId: 've-trech',
  threeH2: 'Jak hrát Impostor ve třech',
  threeP: 'Ve třech stačí, aby si ti dva, kdo slovo znají, navzájem věřili, a hlasování je rozhodnuté dřív, než začne. S těmihle čtyřmi změnami je to zase hra:',
  threeSteps: [
    'Rozdávejte na telefonu, ne na papíře: ve třech nemůže nikdo zůstat stranou a psát lístečky. <a class="inline" href="/cs/impostor-hra/">Impostor hra online</a> funguje už od tří hráčů.',
    'Každý řekne jen jeden detail a jde se jen jednou dokola. Pak hlasujte.',
    'Začít může kdokoli, i impostor. Kdyby ten, kdo začíná, nikdy nebyl impostor, ostatní by ho hned škrtli.',
    'Nechte nápovědu zapnutou a počítejte body: impostor dostane bod, když přežije hlasování, a další, když uhodne slovo, ať ho chytili, nebo ne. Ostatní dva dostanou každý bod, když ukážou na toho pravého. Vyhrává, kdo první dosáhne pěti bodů.',
  ],
  // The /cs/ hub's closing box (tags are this page's own)
  cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Devět her. Jeden telefon.</h2>
        <p>Bez reklam, bez registrace a hrají všichni.</p>
        <a class="cta" href="/get/?c=site-cs-slova">Stáhni si Antics zdarma</a>
        <div class="cta-qr">
          <img src="/cs/impostor-hra-slova/qr.png" width="120" height="120" alt="QR kód, který otevře Antics v telefonu" loading="lazy">
          <p>Jsi u počítače? Namiř na tenhle kód fotoaparát telefonu.</p>
        </div>
      </div>`,
  guides: `<nav class="guides tone-cyan" aria-label="Další hry v češtině">
        <strong>Další hry v češtině</strong>
        <ul class="link-list">
          <li><a href="/cs/impostor-hra/">Impostor hra online na jednom telefonu</a></li>
          <li><a href="/cs/nikdy-jsem-otazky/">Nikdy jsem: otázky a jak se hraje</a></li>
          <li><a href="/cs/pravda-nebo-ukol-otazky/">Pravda nebo úkol: otázky a úkoly</a></li>
          <li><a href="/cs/co-bys-radsi-otazky/">Co bys radši? Otázky, které rozdělí partu</a></li>
          <li><a href="/cs/kdo-by-spis-otazky/">Kdo by spíš? Otázky, při kterých se ukazuje prstem</a></li>
          <li><a href="/cs/">Antics česky: všechny hry</a></li>
        </ul>
      </nav>`,
  footer: `<footer class="site-foot">
    <a href="/cs/">Antics: párty hry</a> · <a href="/privacy.html" hreflang="en">Ochrana soukromí (anglicky)</a><br>
    18+ · Dávejte na sebe pozor.
  </footer>`,
  installbar: `<aside class="installbar" aria-label="Stáhni si aplikaci">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Párty hry</span></p>
  <a class="btn btn--sm" href="/get/?c=site-cs-slova-bar">Stáhnout zdarma</a>
</aside>`,
  // The fuller page (31 Oct 2026, FINAL.md item 15's second wave in the app
  // repo's ops/research/seo-route-2026-10-29/, the es/pt `more` block of 30
  // Oct): both hint tiers, Brands, Sports and Christmas, and the hard-words
  // section. The {word:...} and {name:...} tokens are filled from the mirror
  // by the generator, never typed here. See the generator's header.
  more: {
    thEasy: 'Lehká nápověda', thHard: 'Těžká nápověda',
    follow: 'V aplikaci Antics se tahle kategorie odemkne zdarma, když budete Antics sledovat na TikToku nebo Instagramu.',
    christmasLine: 'Zdarma v aplikaci Antics od 1. prosince do 1. ledna.',
    christmasToc: 'Vánoce',
    draw: 'Vylosovat slovo',
    hard: {
      id: 'tezka-slova', h2: 'Těžká slova do hry Impostor', toc: 'Těžká slova',
      p: [
        'Těžké slovo je hodně konkrétní: „{word:sports:5}“, „{word:sports:11}“, „{word:brands:16}“ nebo „{word:sports:34}“ mají málo jasných detailů, takže těm, kdo slovo znají, ty bezpečné rychle dojdou.',
        'Pro začátek něco těžkého: {name:everyday-objects}, seznam hned níž. Doma je má každý, ale nikdo je nikdy nepopisoval nahlas.',
        'Každé slovo na téhle stránce bude těžší, když impostorovi dáte těžkou nápovědu místo lehké. Nejlíp to funguje ve skupinách, které už pár her odehrály.',
      ],
    },
  },
  qr: 'https://anticsapp.com/get/?c=site-cs-slova-qr',
};
