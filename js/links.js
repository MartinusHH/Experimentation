/*
 * Donow  —  links en zoekopdrachten
 *
 * Alle uitgaande links komen hier vandaan, zodat ze op één plek te
 * controleren en te repareren zijn.
 *
 * Twee regels:
 *
 *   1. Een zoekopdracht kan niet verouderen, een deeplink wel. Standaard
 *      sturen we dus naar een zoekresultaat.
 *   2. Waar een vaste bron echt beter is (Repair Café, Wandelnet, de
 *      bibliotheek), staat die in BRONNEN — altijd mét een zoekterm ernaast,
 *      zodat de knop nog steeds ergens uitkomt als die site verhuist.
 *
 * Er wordt niets automatisch geopend: links gaan pas naar buiten als iemand
 * er zelf op tikt.
 */

const ZOEKMACHINE = 'https://duckduckgo.com/?q=';       // geen profiel, geen cookies
const VIDEOZOEK   = 'https://www.youtube.com/results?search_query=';
const KAARTZOEK   = 'https://www.openstreetmap.org/search?query=';

/** Plakt de delen aan elkaar, gooit lege stukken weg en codeert netjes. */
function zoekTerm(...delen) {
  return delen
    .filter(Boolean)
    .map((d) => String(d).trim())
    .filter((d) => d.length)
    .join(' ')
    .replace(/\s+/g, ' ');
}

/**
 * encodeURIComponent laat !'()* ongemoeid. Dat is geldig in een adres, maar
 * het breekt zodra zo'n link in een attribuut of een script belandt — dus
 * coderen we die tekens er zelf bij.
 */
function codeer(tekst) {
  return encodeURIComponent(tekst).replace(/[!'()*]/g, (c) =>
    `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

function zoekUrl(...delen) {
  return ZOEKMACHINE + codeer(zoekTerm(...delen));
}

function videoUrl(...delen) {
  return VIDEOZOEK + codeer(zoekTerm(...delen, 'uitleg'));
}

function kaartUrl(...delen) {
  return KAARTZOEK + codeer(zoekTerm(...delen));
}

/* ═══════════════════════════════════════════════ vaste bronnen ══ */

/**
 * `url`  — de vaste pagina (mag een functie zijn als de plaats meetelt)
 * `zoek` — waar de knop heen gaat als die pagina er niet meer is; ook de
 *          zoekterm die we gebruiken zolang iemand geen plaats heeft ingevuld
 */
const BRONNEN = {
  repaircafe: {
    label: 'Repair Café bij jou',
    url: () => 'https://www.repaircafe.org/nl/bezoeken/',
    zoek: (p) => zoekTerm('repair café', p)
  },
  wandelnet: {
    label: 'Wandelroutes',
    url: () => 'https://www.wandelnet.nl/wandelroutes',
    zoek: (p) => zoekTerm('wandelroutes knooppunten', p)
  },
  natuurmonumenten: {
    label: 'Natuurgebieden',
    url: () => 'https://www.natuurmonumenten.nl/natuurgebieden',
    zoek: (p) => zoekTerm('natuurgebied wandelen', p)
  },
  staatsbosbeheer: {
    label: 'Bossen en duinen',
    url: () => 'https://www.staatsbosbeheer.nl/natuurgebieden',
    zoek: (p) => zoekTerm('staatsbosbeheer gebied', p)
  },
  fietsknooppunten: {
    label: 'Fietsroutes',
    url: () => 'https://www.fietsknoop.nl/',
    zoek: (p) => zoekTerm('fietsroute knooppunten', p)
  },
  bibliotheek: {
    label: 'Bibliotheek',
    url: () => 'https://www.bibliotheek.nl/',
    zoek: (p) => zoekTerm('bibliotheek', p, 'openingstijden')
  },
  musea: {
    label: 'Musea',
    url: () => 'https://www.museum.nl/nl/musea',
    zoek: (p) => zoekTerm('museum', p, 'tentoonstelling')
  },
  vrijwilligers: {
    label: 'Vrijwilligerswerk',
    url: () => 'https://www.nlvoorelkaar.nl/',
    zoek: (p) => zoekTerm('vrijwilligerswerk', p)
  },
  nldoet: {
    label: 'NLdoet',
    url: () => 'https://www.nldoet.nl/',
    zoek: () => zoekTerm('nldoet vrijwilligersklus')
  },
  kringloop: {
    label: 'Kringloopwinkels',
    url: () => 'https://www.marktplaats.nl/',
    zoek: (p) => zoekTerm('kringloopwinkel', p)
  },
  volksuniversiteit: {
    label: 'Cursussen',
    url: () => 'https://www.volksuniversiteit.nl/',
    zoek: (p) => zoekTerm('volksuniversiteit cursus', p)
  },
  akkoorden: {
    label: 'Akkoorden zoeken',
    url: () => 'https://www.ultimate-guitar.com/',
    zoek: (t) => zoekTerm('akkoorden', t)
  },
  instructables: {
    label: 'Bouwtekeningen',
    url: () => 'https://www.instructables.com/',
    zoek: (t) => zoekTerm(t, 'instructable')
  },
  wikihow: {
    label: 'Stap voor stap',
    url: () => 'https://nl.wikihow.com/',
    zoek: (t) => zoekTerm(t, 'stap voor stap uitleg')
  },
  vogelgeluiden: {
    label: 'Vogelgeluiden',
    url: () => 'https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids',
    zoek: () => zoekTerm('vogelgeluiden herkennen beginners')
  },
  zaaikalender: {
    label: 'Zaaikalender',
    url: () => 'https://www.moestuinweetjes.nl/zaaikalender/',
    zoek: () => zoekTerm('zaaikalender moestuin')
  },
  sterrenkaart: {
    label: 'Sterrenhemel vannacht',
    url: () => 'https://stellarium-web.org/',
    zoek: () => zoekTerm('sterrenhemel vannacht zichtbaar')
  },
  zwembad: {
    label: 'Zwembad',
    url: null,
    zoek: (p) => zoekTerm('zwembad', p, 'banenzwemmen tijden')
  }
};

/**
 * Eén bron als knop. Zonder vaste pagina (of als je hem uitzet) wordt het
 * automatisch een zoekopdracht — de knop doet dus altijd iets.
 */
function bronLink(id, context = '') {
  const bron = BRONNEN[id];
  if (!bron) return null;
  const vast = typeof bron.url === 'function' ? bron.url(context) : bron.url;
  return {
    label: bron.label,
    url: vast || zoekUrl(bron.zoek(context)),
    reserve: zoekUrl(bron.zoek(context)),
    vast: Boolean(vast)
  };
}

/* ══════════════════════════════════════ links bij een activiteit ══ */

/**
 * De knoppen onder een idee: eerst uitleg, dan een video, dan de vaste
 * bronnen die bij deze activiteit horen.
 */
function activiteitLinks(activiteit, plaats = '') {
  const links = [];
  const term = activiteit.zoek || activiteit.titel;

  if (activiteit.zoek) {
    // Zoekt iemand iets in de buurt, dan hoort de plaatsnaam erbij.
    const inDeBuurt = /in de buurt|workshop|cursus|club|caf|museum|route|markt|zwembad/i.test(term);
    links.push({
      label: 'Zoek uitleg',
      url: zoekUrl(term.replace(/in de buurt/i, ''), inDeBuurt ? plaats : ''),
      soort: 'zoek'
    });
    links.push({ label: 'Video bekijken', url: videoUrl(term), soort: 'video' });
  }

  (activiteit.bronnen || []).forEach((id) => {
    const link = bronLink(id, /route|markt|club|caf|museum|bibliotheek|zwembad|vrijwillig/i.test(id)
      ? plaats : term);
    if (link) links.push({ label: link.label, url: link.url, soort: 'bron' });
  });

  return links;
}

/** Waar je de spullen koopt — met partner-id als die is ingesteld (js/betaling.js). */
function materiaalLinks(activiteit) {
  return (activiteit.benodigdheden || []).map((b) => ({ label: b, url: materiaalLink(b) }));
}
