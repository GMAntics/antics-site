// Word-page config for de, German (one page for Germany, Austria and Switzerland), read by ../gen-es-pt-word-pages.mjs.
// Every visible sentence of this language's printable word page lives here;
// the word tables come from the app mirror, never from this file. The
// hreflang lines, the og:locale alternates and the language switcher are NOT
// written here: the generator builds them from every config in this folder.
// Written 10 Oct 2026 from the es config's shape. Searchers call the
// imposter's hint a "Tipp", the app calls it "Hinweis": the page says Tipp
// and names both once.
// Multi-line HTML values are template literals whose indentation is part of
// the page: keep it as it is.
export default {
  lang: 'de', order: 3, hreflang: 'de',
  dealerWords: 'de/imposter-spiel/words.json', wordsId: 'woerter',
  htmlLang: 'de', path: '/de/imposter-woerter/', dir: 'de/imposter-woerter',
  ogLocale: 'de_DE',
  title: 'Imposter-Wörter mit Tipp: Liste zum Ausdrucken | Antics',
  desc: 'Wörter für das Imposter-Spiel, jedes mit einem Tipp für den Imposter, in vier Kategorien. Zum Ausdrucken, für Runden ohne Handy und zu dritt. Kostenlos.',
  ogTitle: 'Wörter für das Imposter-Spiel, jedes mit Tipp',
  crumbLabel: 'Navigationspfad', langHome: '/de/', langName: 'Deutsch',
  crumbGame: 'Imposter-Spiel online', gamePath: '/de/imposter-spiel/', crumbHere: 'Wörter',
  ldGame: 'Imposter-Spiel online', ldHere: 'Wörter für das Imposter-Spiel',
  h1: 'Wörter für das Imposter-Spiel, mit Tipp',
  standfirst: 'Vier komplette Kategorien für das Imposter-Spiel, jedes Wort mit dem Tipp, den der Imposter dafür bekommt. Damit könnt ihr auf Papier spielen, ganz ohne Handy, und beim Ausdrucken kommt jede Kategorie auf ein eigenes Blatt.',
  note: 'Wollt ihr gleich loslegen? <a class="inline" href="/de/imposter-spiel/">Verteilt die Wörter mit einem Handy</a>, kostenlos und ohne Download.',
  ilangLabel: 'Sprache',
  tocLabel: 'Auf dieser Seite',
  tocAfter: [['ohne-handy', 'Ohne Handy'], ['zu-dritt', 'Zu dritt']],
  wordsH2: 'Die Wörter und der Tipp für den Imposter',
  wordsP: 'Jedes Wort auf dieser Seite kommt in der App Antics auf Deutsch vor, mit demselben Tipp. In der App heißt er Imposter-Hinweis: Der Imposter sieht ihn statt des Wortes, und er hilft ihm, ohne die Lösung zu verraten. Auf Papier entscheidet ihr selbst, ob ihr ihn mitgebt.',
  printTip: 'Zum Ausdrucken: am Computer auf Drucken gehen (Strg+P, am Mac Cmd+P). Jede Kategorie kommt auf ein eigenes Blatt.',
  thWord: 'Geheimes Wort', thHint: 'Tipp für den Imposter',
  paperId: 'ohne-handy',
  paperH2: 'Imposter ohne Handy und ohne App spielen',
  paperP: 'Ihr braucht kein Handy und keine App: nur Papier, einen Stift und diese Liste. In jeder Runde verteilt eine Person die Zettel und spielt selbst nicht mit.',
  paperSteps: [
    'Wer verteilt, sucht sich ein Wort aus der Liste aus und verrät es niemandem.',
    'Schneid für jeden Spieler einen Zettel zurecht. Schreib das Wort auf alle außer einen, und auf den schreibst du Imposter. Wenn der Imposter Hilfe bekommen soll, schreib den Tipp dazu.',
    'Faltet die Zettel, mischt sie, und jeder zieht einen, ohne ihn zu zeigen.',
    'Geht einmal reihum: Jeder sagt ein Detail zum Wort, ohne es zu nennen. Der Imposter tut so, als wüsste er es.',
    'Auf drei zeigen alle auf ihren Verdächtigen. Wird der Imposter erwischt, darf er einmal raten, und liegt er richtig, gewinnt er trotzdem.',
    'In der nächsten Runde verteilt die Person links.',
  ],
  paperAfter: 'Ohne Papier geht es auch: Die App Antics zeigt allen das Wort, nur dem Imposter nicht, der bekommt einen Hinweis. So muss keiner aussetzen.',
  threeId: 'zu-dritt',
  threeH2: 'Imposter zu dritt spielen',
  threeP: 'Zu dritt müssen die zwei, die das Wort kennen, einander nur vertrauen, und die Abstimmung ist vorbei, bevor sie anfängt. Mit diesen vier Änderungen wird wieder ein Spiel draus:',
  threeSteps: [
    'Verteilt mit einem Handy statt auf Papier: Zu dritt kann keiner aussetzen, um die Zettel zu schreiben. <a class="inline" href="/de/imposter-spiel/">Das Imposter-Spiel online</a> geht ab drei Spielern.',
    'Nur ein Wort pro Person und nur eine Runde. Dann wird abgestimmt.',
    'Jeder darf anfangen, auch der Imposter. Fängt nie der Imposter an, streichen die anderen den Startspieler sofort von der Liste.',
    'Lasst den Hinweis an und zählt Punkte: Der Imposter bekommt einen Punkt, wenn er die Abstimmung übersteht, und noch einen, wenn er das Wort errät, ob erwischt oder nicht. Die anderen zwei bekommen je einen Punkt, wenn sie auf den Richtigen zeigen. Wer zuerst fünf Punkte hat, gewinnt.',
  ],
  // Copied exactly from the /de/ hub's closing box (tags are this page's own)
  cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Neun Spiele. Ein Handy.</h2>
        <p>Ohne Werbung, ohne Anmeldung, und alle spielen mit.</p>
        <a class="cta" href="/get/?c=site-de-woerter">Antics gratis laden</a>
        <div class="cta-qr">
          <img src="/de/imposter-woerter/qr.png" width="120" height="120" alt="QR-Code, der Antics auf deinem Handy öffnet" loading="lazy">
          <p>Am Laptop? Scann den Code mit der Kamera deines Handys.</p>
        </div>
      </div>`,
  guides: `<nav class="guides tone-cyan" aria-label="Mehr Spiele auf Deutsch">
        <strong>Mehr Spiele auf Deutsch</strong>
        <ul class="link-list">
          <li><a href="/de/imposter-spiel/">Das Imposter-Spiel online, mit nur einem Handy</a></li>
          <li><a href="/de/ich-hab-noch-nie-fragen/">Ich hab noch nie: Fragen und Spielregeln</a></li>
          <li><a href="/de/wahrheit-oder-pflicht-fragen/">Wahrheit oder Pflicht: Fragen und Aufgaben</a></li>
          <li><a href="/de/wuerdest-du-eher-fragen/">Würdest du eher…? Fragen, die die Runde spalten</a></li>
          <li><a href="/de/wer-wuerde-eher-fragen/">Wer würde eher…? Fragen, bei denen alle mit dem Finger zeigen</a></li>
          <li><a href="/de/">Antics auf Deutsch: alle Spiele</a></li>
        </ul>
      </nav>`,
  footer: `<footer class="site-foot">
    <a href="/de/">Antics: Partyspiele</a> · <a href="/privacy.html" hreflang="en">Datenschutz (auf Englisch)</a><br>
    18+ · Passt auf eure Freunde auf.
  </footer>`,
  installbar: `<aside class="installbar" aria-label="App herunterladen">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Partyspiele</span></p>
  <a class="btn btn--sm" href="/get/?c=site-de-woerter-bar">Gratis laden</a>
</aside>`,
  qr: 'https://anticsapp.com/get/?c=site-de-woerter-qr',
};
