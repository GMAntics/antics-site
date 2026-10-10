// Word-page config for it, Italian (Italy), read by ../gen-es-pt-word-pages.mjs.
// Every visible sentence of this language's printable word page lives here;
// the word tables come from the app mirror, never from this file. The
// hreflang lines, the og:locale alternates and the language switcher are NOT
// written here: the generator builds them from every config in this folder.
// Written 10 Oct 2026 from the es config, rewritten natively in Italian.
// Multi-line HTML values are template literals whose indentation is part of
// the page: keep it as it is.
export default {
  lang: 'it', order: 5, hreflang: 'it',
  dealerWords: 'it/gioco-dell-impostore/words.json', wordsId: 'parole',
  htmlLang: 'it', path: '/it/parole-gioco-dell-impostore/', dir: 'it/parole-gioco-dell-impostore',
  ogLocale: 'it_IT',
  title: 'Parole per il gioco dell\'impostore: lista da stampare',
  desc: 'Parole per il gioco dell\'impostore con l\'indizio di ognuna, in quattro categorie. Da stampare, per giocare senza telefono e anche in tre. Gratis.',
  ogTitle: 'Parole per il gioco dell\'impostore, con l\'indizio di ognuna',
  crumbLabel: 'Percorso di navigazione', langHome: '/it/', langName: 'Italiano',
  crumbGame: 'Gioco dell\'impostore online', gamePath: '/it/gioco-dell-impostore/', crumbHere: 'Parole',
  ldGame: 'Gioco dell\'impostore online', ldHere: 'Parole per il gioco dell\'impostore',
  h1: 'Parole per il gioco dell\'impostore',
  standfirst: 'Quattro categorie complete del gioco dell\'impostore, con l\'indizio che riceve l\'impostore per ogni parola. Servono per giocare su carta, senza telefono, e si stampano con una categoria per foglio.',
  note: 'Volete giocare subito? <a class="inline" href="/it/gioco-dell-impostore/">Distribuite le parole su un solo telefono</a>, gratis e senza scaricare niente.',
  ilangLabel: 'Lingua',
  tocLabel: 'In questa pagina',
  tocAfter: [['senza-telefono', 'Senza telefono'], ['in-tre', 'In tre']],
  wordsH2: 'Le parole e l\'indizio dell\'impostore',
  wordsP: 'Ogni parola di questa pagina c\'è anche nell\'app Antics in italiano, con lo stesso indizio. L\'indizio è quello che vede l\'impostore al posto della parola: qualcosa che lo avvicina senza regalargli la risposta. Su carta, decidete voi se darglielo o no.',
  printTip: 'Per stampare: al computer, usate Stampa (Ctrl+P, o Cmd+P su Mac). Ogni categoria esce su un foglio a parte.',
  thWord: 'Parola segreta', thHint: 'Indizio dell\'impostore',
  paperId: 'senza-telefono',
  paperH2: 'Come si gioca all\'impostore senza telefono né app',
  paperP: 'Non servono telefono né app: bastano un foglio, una penna e questa lista. A ogni round una persona distribuisce i ruoli e non gioca.',
  paperSteps: [
    'Chi distribuisce sceglie una parola dalla lista e non la dice a nessuno.',
    'Ritaglia un bigliettino per ogni giocatore. Scrivi la parola su tutti tranne uno, e su quello scrivi Impostore. Se volete dare una mano all\'impostore, scrivi anche l\'indizio.',
    'Piegate i bigliettini, mescolateli e ognuno ne pesca uno senza farlo vedere.',
    'Fate un giro: ognuno dice un dettaglio sulla parola, senza dirla. L\'impostore finge di saperla.',
    'Al tre, tutti puntano il dito contro il proprio sospettato. Se beccate l\'impostore, ha un tentativo per indovinare la parola, e se ci azzecca vince lo stesso.',
    'Al round successivo distribuisce chi sta a sinistra.',
  ],
  paperAfter: 'Si può fare anche senza carta: l\'app Antics mostra la parola a tutti tranne all\'impostore, che riceve un indizio, e così nessuno deve restare fuori.',
  threeId: 'in-tre',
  threeH2: 'Come si gioca all\'impostore in tre',
  threeP: 'In tre, i due che conoscono la parola devono solo fidarsi l\'uno dell\'altro, e il voto finisce prima di cominciare. Con queste quattro modifiche torna a essere un gioco:',
  threeSteps: [
    'Distribuite i ruoli sul telefono, non su carta: in tre nessuno può restare fuori a scrivere i bigliettini. <a class="inline" href="/it/gioco-dell-impostore/">Il gioco dell\'impostore online</a> funziona già con tre giocatori.',
    'Una sola parola a testa e un solo giro. Poi votate.',
    'Può iniziare chiunque, anche l\'impostore. Se chi inizia non è mai l\'impostore, gli altri lo escludono subito.',
    'Lasciate l\'indizio attivo e tenete il punteggio: l\'impostore prende un punto se si salva al voto e un altro se indovina la parola, che l\'abbiate beccato o no, e gli altri due prendono un punto a testa se indicano chi era. Vince il primo che arriva a cinque.',
  ],
  // Copied from the /it/ hub's closing box (tags are this page's own)
  cta: `<div class="cta-block">
        <img class="cta-icon" src="/img/icon-192.png" alt="" width="56" height="56" loading="lazy">
        <h2>Nove giochi. Un telefono.</h2>
        <p>Senza pubblicità, senza registrazione, e giocano tutti.</p>
        <a class="cta" href="/get/?c=site-it-parole">Scarica Antics gratis</a>
        <div class="cta-qr">
          <img src="/it/parole-gioco-dell-impostore/qr.png" width="120" height="120" alt="Codice QR che apre Antics sul tuo telefono" loading="lazy">
          <p>Sei al computer? Inquadra il codice con la fotocamera del telefono.</p>
        </div>
      </div>`,
  guides: `<nav class="guides tone-cyan" aria-label="Altri giochi in italiano">
        <strong>Altri giochi in italiano</strong>
        <ul class="link-list">
          <li><a href="/it/gioco-dell-impostore/">Gioco dell'impostore online, su un solo telefono</a></li>
          <li><a href="/it/domande-non-ho-mai/">Non ho mai: domande e come si gioca</a></li>
          <li><a href="/it/domande-obbligo-o-verita/">Obbligo o verità: domande e obblighi</a></li>
          <li><a href="/it/domande-preferiresti/">Preferiresti…? Domande per dividere il gruppo</a></li>
          <li><a href="/it/domande-chi-e-piu-probabile/">Chi è più probabile che…? Domande per puntare il dito</a></li>
          <li><a href="/it/">Antics in italiano: tutti i giochi</a></li>
        </ul>
      </nav>`,
  footer: `<footer class="site-foot">
    <a href="/it/">Antics: giochi di gruppo</a> · <a href="/privacy.html" hreflang="en">Privacy (in inglese)</a><br>
    18+ · Prendetevi cura dei vostri amici.
  </footer>`,
  installbar: `<aside class="installbar" aria-label="Scarica l'app">
  <img src="/img/icon-192.png" alt="" width="40" height="40">
  <p><strong>Antics</strong><span>Giochi di gruppo</span></p>
  <a class="btn btn--sm" href="/get/?c=site-it-parole-bar">Scarica gratis</a>
</aside>`,
  qr: 'https://anticsapp.com/get/?c=site-it-parole-qr',
};
