// Word-page config for fr, French (France, Belgium, Switzerland: one set,
// hreflang "fr"), read by ../gen-es-pt-word-pages.mjs. Written 10 Oct 2026
// from es.mjs. Every visible sentence of this language's printable word page
// lives here; the word tables come from the app mirror, never from this file.
// The hreflang lines, the og:locale alternates and the language switcher are
// NOT written here: the generator builds them from every config in this folder.
// French typography: N is a no-break space, placed before : ? ! and inside « »
// so the mark never starts a line (the title, description and h1 keep plain
// spaces and straight apostrophes, as people type them).
// Multi-line HTML values are template literals whose indentation is part of
// the page: keep it as it is.
const N = ' ';
export default {
  lang: 'fr', order: 4, hreflang: 'fr',
  dealerWords: 'fr/jeu-imposteur/words.json', wordsId: 'mots',
  htmlLang: 'fr', path: '/fr/mots-jeu-imposteur/', dir: 'fr/mots-jeu-imposteur',
  ogLocale: 'fr_FR',
  title: 'Mots pour le jeu de l\'imposteur : idées et liste à imprimer',
  desc: 'Des idées de mots pour le jeu de l\'imposteur, avec l\'indice de chacun, en quatre catégories. À imprimer pour jouer sans téléphone, et des règles à trois.',
  ogTitle: 'Mots pour le jeu de l\'imposteur, avec l\'indice de chacun',
  crumbLabel: 'Fil d’Ariane', langHome: '/fr/', langName: 'Français',
  crumbGame: 'Jeu de l’imposteur en ligne', gamePath: '/fr/jeu-imposteur/', crumbHere: 'Mots',
  ldGame: 'Jeu de l’imposteur en ligne', ldHere: 'Mots pour le jeu de l’imposteur',
  h1: 'Mots pour le jeu de l’imposteur',
  standfirst: 'Quatre catégories complètes pour le jeu de l’imposteur, avec l’indice que reçoit l’imposteur pour chaque mot. De quoi jouer sur papier, sans téléphone, avec une catégorie par page à l’impression.',
  note: `Vous jouez tout de suite${N}? <a class="inline" href="/fr/jeu-imposteur/">Distribuez les mots sur un seul téléphone</a>, gratuitement et sans rien télécharger.`,
  ilangLabel: 'Langue',
  tocLabel: 'Sur cette page',
  tocAfter: [['sans-telephone', 'Sans téléphone'], ['a-trois', 'À trois']],
  wordsH2: 'Les mots et l’indice de l’imposteur',
  wordsP: `Chaque mot de cette page est dans l’appli Antics en français, avec le même indice. L’indice, c’est ce que voit l’imposteur à la place du mot${N}: de quoi s’en approcher sans avoir la réponse. Sur papier, c’est vous qui décidez de le donner ou non.`,
  printTip: `Pour imprimer${N}: sur ordinateur, faites Imprimer (Ctrl+P, ou Cmd+P sur Mac). Chaque catégorie sort sur sa propre page.`,
  thWord: 'Mot secret', thHint: 'Indice de l’imposteur',
  paperId: 'sans-telephone',
  paperH2: 'Jouer à l’imposteur sans téléphone ni appli',
  paperP: `Pas besoin de téléphone ni d’appli${N}: du papier, un stylo et cette liste suffisent. À chaque manche, une personne distribue et ne joue pas.`,
  paperSteps: [
    'Celui qui distribue choisit un mot dans la liste et ne le dit à personne.',
    `Il découpe un petit papier par joueur. Il écrit le mot sur tous sauf un, et sur celui-là il écrit «${N}Imposteur${N}». Pour aider l’imposteur, il ajoute aussi l’indice.`,
    'Pliez les papiers, mélangez-les, et chacun en tire un sans le montrer.',
    `Faites un tour de table${N}: chacun donne un détail sur le mot, sans le prononcer. L’imposteur fait comme s’il le connaissait.`,
    'On compte jusqu’à trois et tout le monde montre son suspect du doigt. Si l’imposteur est démasqué, il a une chance de deviner le mot, et s’il trouve, il gagne quand même.',
    'À la manche suivante, c’est le voisin de gauche de celui qui a distribué qui prend le relais.',
  ],
  paperAfter: `On peut aussi se passer de papier${N}: l’appli Antics montre le mot à tout le monde sauf à l’imposteur, qui reçoit un indice, et personne n’a besoin de rester sur la touche.`,
  threeId: 'a-trois',
  threeH2: 'Jouer à l’imposteur à 3',
  threeP: `À trois, les deux qui connaissent le mot n’ont qu’à se faire confiance, et le vote est plié avant d’avoir commencé. Avec ces quatre changements, ça redevient un vrai jeu${N}:`,
  threeSteps: [
    `Distribuez sur un téléphone, pas sur papier${N}: à trois, personne ne peut rester sur la touche pour écrire les papiers. <a class="inline" href="/fr/jeu-imposteur/">Le jeu de l’imposteur en ligne</a> marche dès trois joueurs.`,
    'Un seul mot par personne et un seul tour. Ensuite, votez.',
    'N’importe qui peut commencer, l’imposteur aussi. Si celui qui commence n’est jamais l’imposteur, les autres l’écartent d’office.',
    `Laissez l’indice activé et comptez les points${N}: l’imposteur marque un point s’il échappe au vote et un autre s’il devine le mot, démasqué ou pas, et les deux autres marquent un point chacun s’ils désignent le bon suspect. Le premier à cinq gagne.`,
  ],
  // Copied from the /fr/ hub's closing box (tags are this page's own)
  cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Neuf jeux. Un téléphone.</h2>
        <p>Sans pub, sans inscription, et tout le monde joue.</p>
        <a class="cta" href="/get/?c=site-fr-mots">Télécharge Antics gratuitement</a>
        <div class="cta-qr">
          <img src="/fr/mots-jeu-imposteur/qr.png" width="120" height="120" alt="Code QR qui ouvre Antics sur ton téléphone" loading="lazy">
          <p>Sur ordinateur&nbsp;? Vise ce code avec l’appareil photo de ton téléphone.</p>
        </div>
      </div>`,
  guides: `<nav class="guides tone-cyan" aria-label="Plus de jeux en français">
        <strong>Plus de jeux en français</strong>
        <ul class="link-list">
          <li><a href="/fr/jeu-imposteur/">Le jeu de l’imposteur en ligne, sur un seul téléphone</a></li>
          <li><a href="/fr/questions-je-n-ai-jamais/">Je n’ai jamais&nbsp;: questions et règles du jeu</a></li>
          <li><a href="/fr/questions-action-ou-verite/">Action ou vérité&nbsp;: des vérités et des actions entre amis</a></li>
          <li><a href="/fr/questions-tu-preferes/">Tu préfères…&nbsp;? Des dilemmes pour diviser le groupe</a></li>
          <li><a href="/fr/questions-qui-est-le-plus-susceptible-de/">Qui est le plus susceptible de…&nbsp;? Des questions pour montrer du doigt</a></li>
          <li><a href="/fr/">Antics en français&nbsp;: tous les jeux</a></li>
        </ul>
      </nav>`,
  footer: `<footer class="site-foot">
    <a href="/fr/">Antics&nbsp;: jeu de soirée</a> · <a href="/privacy.html" hreflang="en">Confidentialité (en anglais)</a><br>
    18+ · Prenez soin de vos potes.
  </footer>`,
  installbar: `<aside class="installbar" aria-label="Télécharger l’appli">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Jeux de soirée</span></p>
  <a class="btn btn--sm" href="/get/?c=site-fr-mots-bar">Télécharger</a>
</aside>`,
  qr: 'https://anticsapp.com/get/?c=site-fr-mots-qr',
};
