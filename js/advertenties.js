/*
 * Offline!  —  advertenties
 *
 * De gratis versie toont advertenties, Offline+ haalt ze weg. Drie regels
 * houden het draaglijk, want een app die je van je scherm weg wil houden mag
 * zelf niet gaan schreeuwen:
 *
 *   1. Hooguit één advertentie per scherm.
 *   2. Nooit in het dagboek — dat is de plek waar mensen eerlijk schrijven.
 *   3. Altijd herkenbaar als advertentie.
 *
 * Zonder netwerk in de CONFIG hieronder draait alles op eigen advertenties
 * (bijvoorbeeld van lokale partners) en anders op een uitnodiging voor Plus.
 */

const ADVERTENTIES = {
  actief: true,

  /* Netwerk: '' (alleen eigen advertenties), 'adsense' of 'ethical'.
     Let op: voor gepersonaliseerde advertenties in de EU heb je een erkende
     toestemmingsbanner nodig. Zonder toestemming laadt de app geen enkel
     netwerkscript en val je terug op eigen advertenties. */
  netwerk: '',
  adsenseClient: '',        // ca-pub-…
  adsenseSlot: '',
  ethicalPublisher: '',

  /* Waar advertenties mogen staan. */
  schermen: ['ontdek', 'samen'],
  naHoeveelIdeeen: 3
};

/* Eigen advertenties: lokale partners, of je eigen boodschap.
   { titel, tekst, link, emoji } */
const EIGEN_ADVERTENTIES = [];

let advertentieTeller = 0;

function magAdvertentieTonen(state, scherm) {
  return ADVERTENTIES.actief && !heeftPlus(state) && ADVERTENTIES.schermen.includes(scherm);
}

/** Heeft de bezoeker toestemming gegeven voor advertenties met cookies? */
function advertentieToestemming(state) { return state.advertentieToestemming || null; }

function zetAdvertentieToestemming(state, keuze) {
  state.advertentieToestemming = keuze;   // 'ja' | 'nee'
}

/**
 * De advertentie voor dit scherm, als HTML. Geeft een lege string als er
 * niets te tonen is (Plus, uitgezet, of scherm zonder advertentieplek).
 */
function advertentieHtml(state, scherm) {
  if (!magAdvertentieTonen(state, scherm)) return '';

  const netwerkKlaar = ADVERTENTIES.netwerk && advertentieToestemming(state) === 'ja';
  if (netwerkKlaar) {
    return `<div class="reclame" data-netwerk="${ADVERTENTIES.netwerk}">
      <span class="reclame__label">Advertentie</span>
      <div id="reclameVak"></div>
      <button class="knop knop--stil knop--vol knop--klein" data-plus>Geen advertenties met Offline+</button>
    </div>`;
  }

  if (EIGEN_ADVERTENTIES.length) {
    const ad = EIGEN_ADVERTENTIES[advertentieTeller++ % EIGEN_ADVERTENTIES.length];
    return `<div class="reclame">
      <span class="reclame__label">Advertentie</span>
      <a class="reclame__inhoud" href="${ad.link}" target="_blank" rel="noopener sponsored">
        <span class="reclame__emoji">${ad.emoji || '📣'}</span>
        <span><b>${ad.titel}</b><span class="uitleg">${ad.tekst}</span></span>
      </a>
      <button class="knop knop--stil knop--vol knop--klein" data-plus>Geen advertenties met Offline+</button>
    </div>`;
  }

  /* Niets om te tonen: dan maar eerlijk zeggen waarom die plek er is. */
  return `<div class="reclame">
    <span class="reclame__label">Van ons zelf</span>
    <div class="reclame__inhoud">
      <span class="reclame__emoji">💜</span>
      <span><b>Deze plek is voor advertenties</b>
      <span class="uitleg">Daarmee blijft de app gratis. Met Offline+ (${CONFIG.prijsMaand} per maand)
        verdwijnen ze en krijg je de extra pakketten erbij.</span></span>
    </div>
    <button class="knop knop--vol knop--klein" data-plus>Bekijk Offline+</button>
  </div>`;
}

/**
 * Laadt het advertentienetwerk. Gebeurt pas ná toestemming en pas als er een
 * netwerk is ingesteld — anders wordt er niets van buiten opgehaald.
 */
function laadAdvertentieNetwerk(state) {
  if (!ADVERTENTIES.netwerk || advertentieToestemming(state) !== 'ja') return;
  if (document.getElementById('reclameScript')) return;

  const script = document.createElement('script');
  script.id = 'reclameScript';
  script.async = true;
  script.crossOrigin = 'anonymous';

  if (ADVERTENTIES.netwerk === 'adsense' && ADVERTENTIES.adsenseClient) {
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADVERTENTIES.adsenseClient}`;
  } else if (ADVERTENTIES.netwerk === 'ethical' && ADVERTENTIES.ethicalPublisher) {
    script.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
  } else {
    return;
  }
  document.head.appendChild(script);
}
