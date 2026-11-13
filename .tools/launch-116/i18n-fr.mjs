// French copy for the 1.1.6 launch pages. Agent draft 13 Nov 2026, AI language QA pending.
// App names from src/i18n/strings.fr.ts: Blag, Cite 3, Entre nous, Qui a dit ça ?, Mens pour moi. Forfeit = gage.
// French typography: a no-break space (U+00A0) before ? ! : as on the live fr pages.
export default {
  chrome: {
    skip: 'Passer au contenu', crumbAria: 'Fil d’Ariane', langAria: 'Langue', tocLabel: 'Sur cette page',
    footerHome: 'Antics&nbsp;: jeu de soirée', privacy: 'Confidentialité (en anglais)', footerLine: '18+ · Prenez soin de vos potes.',
    installAria: 'Télécharger l’appli', installSub: 'Jeux de soirée', installBtn: 'Télécharger', installBtnLong: 'Télécharger Antics gratuitement',
    appStore: 'Télécharger dans l’App Store', googlePlay: 'Disponible sur Google Play',
    laptop: 'Sur un ordi ?', laptopTail: 'envoie le bon store sur ton téléphone.',
    guidesAria: 'Plus de jeux en français', imposterUrl: '/fr/jeu-imposteur/', imposterText: 'Le jeu de l’imposteur en ligne', hubText: 'Tous les jeux en français',
  },
  hub: { id: 'nouveau', h2: 'Nouveau dans l’appli', blag: 'Bluffer, chacun sur son téléphone', n3: 'Trois réponses avant la fin du chrono' },
  blag: {
    slug: 'jeu-blag', crumb: 'Blag',
    title: 'Blag : le jeu de bluff en soirée, chacun sur son téléphone | Antics',
    desc: 'Blag est le jeu de bluff qui se joue chacun sur son téléphone : une personne dit la vérité, les autres inventent, et tout le monde vote. Une personne ouvre le salon dans l’appli Antics, les autres rejoignent gratuitement dans un navigateur.',
    ogTitle: 'Blag : une vérité, une table pleine de mensonges',
    ogDesc: 'Le jeu de bluff pour le téléphone de chacun. Écris un mensonge qui passe pour la vérité, trouve la vraie réponse et découvre qui ment le mieux dans la bande.',
    linkText: 'Blag : le jeu de bluff sur vos propres téléphones',
    h1: 'Blag : une vérité, une table pleine de mensonges',
    standfirst: 'Le jeu de bluff où chacun joue sur son propre téléphone. Écris un mensonge assez bon pour passer pour la vérité, flaire la vraie réponse et découvre qui ment le mieux dans ta bande.',
    toc: ['Comment jouer', 'Deux façons de jouer', 'Les téléphones, pas la télé', 'Bien mentir', 'Questions'],
    how: {
      h2: 'Comment jouer',
      steps: [
        'Une personne ouvre Blag dans l’appli Antics et crée un salon. L’appli affiche un code court et un lien à partager.',
        'Les autres rejoignent sur leur propre téléphone. Ils ouvrent le lien dans un navigateur et jouent gratuitement, sans rien télécharger et sans compte, ou passent par l’appli Antics s’ils l’ont.',
        'Une question s’affiche. Un joueur y répond sincèrement, tous les autres écrivent une fausse réponse qui lui ressemble trait pour trait. Ensuite toutes les réponses s’affichent mélangées sur chaque téléphone, et chacun vote pour celle qu’il croit vraie.',
      ],
      p: 'Tu pièges quelqu’un avec ton mensonge, tu marques. Tu trouves la vérité, tu marques. Celui qui dit la vérité marque pour chaque personne qui passe à côté, donc il veut une réponse qui sonne inventée. La dernière manche compte double, et les téléphones montrent qui s’est fait avoir par qui.',
    },
    modes: {
      h2: 'Deux façons de jouer',
      aboutH: 'Entre nous',
      aboutP: 'De trois à dix joueurs. À chaque manche, une personne est sous les projecteurs : elle dit la vérité, le reste écrit le mensonge qu’elle pourrait raconter. Un jeu sur à quel point vous vous connaissez, et sur votre talent pour imiter vos potes par écrit.',
      whoH: 'Qui a dit ça ?',
      whoP: 'De quatre à huit joueurs. Tout le monde répond sincèrement à la même question, puis la bande devine qui a écrit quoi. L’astuce, c’est de dire la vérité avec la voix de quelqu’un d’autre.',
      lieH: 'Pas d’idée de mensonge ?',
      lieP1: 'Appuie sur ', lieBtn: 'Mens pour moi', lieP2: ' et la Maison en écrit un pour toi. Fais comme si de rien n’était. Parfois la Maison piège toute la table, ce qui est une honte d’un genre bien à elle.',
    },
    phones: {
      h2: 'Sur les téléphones, pas sur la télé',
      p1: 'Blag n’a besoin ni d’écran dans un coin ni de console. Chaque joueur lit, écrit et vote sur le téléphone qu’il a en main, donc ça marche dans une chambre, une cuisine, un bar ou un long trajet en voiture, partout où il y a du réseau. Seule la personne qui ouvre le salon a besoin de l’appli.',
      p2: 'Les réponses sont tapées, donc le plus discret de la bande a autant de chances que le plus bruyant, et personne ne peut lire sur ton visage quelle réponse est la tienne. C’est tout l’intérêt.',
    },
    lying: {
      h2: 'Bien mentir',
      items: [
        ['Vole son style.', 'S’il écrit toujours "franchement" ou jamais de majuscules, toi non plus.'],
        ['Sois ennuyeux exprès.', 'Une réponse banale et précise passe pour la vérité bien plus souvent qu’une réponse drôle.'],
        ['Ne touche pas à la vérité.', 'Si c’est toi qui la dis, ne la peaufine pas. Les vraies réponses sont souvent le truc le plus bizarre de la liste.'],
        ['Regarde les votes, pas les réponses.', 'Celui qui a l’air très content de lui à la révélation a écrit le mensonge qui a marché.'],
      ],
    },
    faq: {
      h2: 'Les questions qu’on nous pose',
      qa: [
        ['Tout le monde a besoin de l’appli ?', 'Non. Seule la personne qui ouvre le salon a besoin d’Antics. Les autres rejoignent gratuitement dans le navigateur de leur téléphone, avec le code ou le lien du salon.'],
        ['Combien de joueurs ?', 'Entre nous se joue de trois à dix. Qui a dit ça ? se joue de quatre à huit.'],
        ['Blag est gratuit ?', 'Oui. Blag a des cartes gratuites dans l’appli Antics, et rejoindre un salon ne coûte rien. Quand une personne Premium ouvre le salon, toutes les cartes sont débloquées pour toute la bande.'],
        ['C’est un jeu à boire ?', 'Non. On gagne aux points, en mentant bien et en trouvant la vérité.'],
      ],
    },
    cta: { h2: 'Ouvrir un salon', p: 'Blag est dans l’appli Antics. L’un de vous ouvre le salon sur un iPhone, les autres rejoignent sur leur propre téléphone, gratuitement dans un navigateur. Sans pub, sans compte.' },
  },
  n3: {
    slug: 'jeu-cite-3', name: 'Cite 3', crumb: 'Cite 3', kicker: 'Cite 3…',
    title: 'Cite 3 : trois choses en cinq secondes, le jeu de soirée | Antics',
    desc: 'Cite 3 est le jeu de soirée en cinq secondes : lis la catégorie, lance le chrono, cite trois choses avant la fin. Les règles, et un essai gratuit dans ton navigateur.',
    ogTitle: 'Cite 3 : trois choses, cinq secondes',
    ogDesc: 'Lis la catégorie, lance le chrono, cite trois choses avant zéro. Facile sur le canapé, impossible avec toute la bande qui crie.',
    linkText: 'Cite 3 : trois choses, cinq secondes',
    h1: 'Cite 3 : trois choses, cinq secondes',
    standfirst: 'Lis la catégorie. Lance le chrono. Cite trois choses avant zéro. Facile tout seul, impossible avec toute la bande qui te regarde.',
    toc: ['Comment jouer', 'Essayer une manche', 'Règles maison', 'Bonnes catégories', 'Questions'],
    how: {
      h2: 'Comment jouer',
      steps: [
        'Celui qui tient le téléphone lit la catégorie à voix haute : Garnitures de pizza, par exemple, ou Choses qu’on trouve au fond d’un canapé.',
        'Il lance le chrono. Cinq secondes. Cite trois choses de la catégorie avant la fin.',
        'La bande tranche. Trois réponses valables dans les temps, c’est réussi. Un blanc, une répétition ou un chrono à zéro, c’est raté, et raté veut dire gage. Puis le téléphone passe au suivant.',
      ],
      p: 'C’est tout le jeu. Ça marche à deux comme à douze, sans préparation ni stylo, et une manche dure une dizaine de secondes, donc ça se glisse entre tout ce que vous jouez d’autre.',
    },
    tryIt: { h2: 'Essaie une manche ici', p: 'Un essai gratuit avec dix catégories de l’appli Antics. Lis-la à voix haute, appuie sur le chrono et vois jusqu’où tu tiens avec tout le monde qui décompte.' },
    tool: {
      start: 'Lancer le chrono', goAgain: 'Encore', next: 'Catégorie suivante', restart: 'Recommencer', timeUp: 'Temps !',
      countInit: 'Dix catégories gratuites ici. L’appli en a bien plus.',
      count: 'Catégorie {n} sur {of}. L’appli en a bien plus.',
      doneQ: 'C’étaient les dix catégories gratuites. Le jeu complet est dans l’appli.',
      doneCount: 'Tu as vu toutes les catégories gratuites d’ici.',
      ctaH: 'Envie du jeu complet, d’un chrono réglable et d’un gage pour chaque raté ?',
    },
    rules: {
      h2: 'Des règles maison pour rester juste',
      items: [
        ['Qu’est-ce qui compte comme réponse ?', 'Un mot, un nom ou un nom commun court. "Fromage" compte. "Le truc avec les petits bouts rouges", non. Si la bande en débat plus longtemps que la manche n’a duré, c’est raté.'],
        ['On peut répéter une réponse déjà donnée ?', 'Oui, sauf si votre bande en décide autrement. Interdire les répétitions rend les catégories populaires impitoyables dès le troisième tour, et certaines bandes adorent ça.'],
        ['Cinq secondes, c’est trop court', 'Dans l’appli, c’est vous qui réglez le chrono, de trois à dix secondes. Commencez à cinq, passez à quatre quand tout le monde est chaud, et laissez un peu plus à un nouveau venu si vous voulez.'],
        ['Mettre la pression', 'Autorisé. Encouragé, même. Décompter à voix haute face à celui qui joue, c’est la moitié du plaisir, et la raison pour laquelle personne n’arrive à citer trois animaux de la ferme quand tout le monde crie.'],
      ],
    },
    catsSec: {
      h2: 'Ce qui fait une bonne catégorie',
      p1: 'Les meilleures ont l’air faciles. Tout le monde connaît les couleurs, alors quand tu sèches sur Couleurs, toute la bande se régale. Une bonne catégorie a des dizaines de bonnes réponses, et sous pression aucune ne vient.',
      p2: 'L’appli distribue les catégories sans répétition jusqu’à ce que vous les ayez toutes vues, et certaines citent quelqu’un de la bande, donc la bande a son mot à dire sur ce qui compte.',
    },
    faq: {
      h2: 'Les questions qu’on nous pose',
      qa: [
        ['Cite 3, c’est le jeu des cinq secondes ?', 'C’est la même idée : une catégorie, un chrono court et trois réponses. Cite 3, c’est la version de l’appli Antics, avec ses propres catégories et un gage quand tu rates.'],
        ['Il faut combien de joueurs ?', 'Deux ou plus. C’est mieux de quatre à huit, en se passant le téléphone en cercle.'],
        ['Cite 3 est gratuit ?', 'Oui. Cite 3 a des catégories gratuites dans l’appli Antics, et Antics Premium débloque le jeu complet avec tous les autres jeux.'],
        ['C’est un jeu à boire ?', 'Non. Un raté veut dire un gage, donc tout le monde peut jouer, quoi qu’il y ait dans son verre.'],
      ],
    },
    cta: { h2: 'Jouer au jeu complet', p: 'Cite 3 est dans l’appli Antics pour iPhone et Android, avec des catégories gratuites, un chrono que vous réglez et un gage pour chaque raté. Sans pub, sans compte.' },
    cats10: ['Choses dans un frigo', 'Garnitures de pizza', 'Animaux de la ferme', 'Super-héros', 'Films Disney', 'Couleurs', 'Pays qui commencent par S', 'Célébrités qui s’appellent David', 'Pires endroits pour un premier rencard', 'Choses qu’on trouve au fond d’un canapé'],
  },
};
