/*
 * Offline!  —  in de buurt
 *
 * Bouwt zoekingangen naar wat er bij jou in de buurt te doen is.
 * Bewust zoeklinks in plaats van één agenda-API: zo werkt het in elke
 * gemeente, en je komt uit bij bronnen die echt worden bijgehouden.
 */

const BUURT_BRONNEN = [
  {
    id: 'agenda', emoji: '📅', titel: 'Dit weekend',
    tekst: 'De uitagenda van je gemeente en de grote evenementensites.',
    zoek: (p) => [
      { label: `Uitagenda ${p}`, q: `uitagenda ${p} deze week` },
      { label: `Evenementen ${p}`, q: `evenementen ${p} dit weekend` },
      { label: 'Eventbrite', url: (pl) => `https://www.eventbrite.nl/d/netherlands--${slug(pl)}/events/` }
    ]
  },
  {
    id: 'workshops', emoji: '🧑‍🏫', titel: 'Workshops en cursussen',
    tekst: 'Eén avond iets nieuws leren, van naaien tot pottenbakken.',
    interesses: ['kleding', 'kunst', 'koken', 'klussen', 'muziek'],
    zoek: (p) => [
      { label: `Workshops ${p}`, q: `workshop ${p} avond beginners` },
      { label: `Volksuniversiteit ${p}`, q: `volksuniversiteit ${p} cursusaanbod` },
      { label: 'Meetup', url: (pl) => `https://www.meetup.com/find/?location=nl--${slug(pl)}` }
    ]
  },
  {
    id: 'natuur', emoji: '🌳', titel: 'Wandel- en fietsroutes',
    tekst: 'Uitgezette routes vanaf je eigen voordeur of vanaf het station.',
    interesses: ['natuur', 'sport', 'fotografie', 'dieren'],
    zoek: (p) => [
      { label: `Wandelroutes ${p}`, q: `wandelroutes ${p} knooppunten` },
      { label: 'Wandelnet', url: () => 'https://www.wandelnet.nl/wandelroutes' },
      { label: 'Natuurmonumenten', url: () => 'https://www.natuurmonumenten.nl/natuurgebieden' }
    ]
  },
  {
    id: 'gratis', emoji: '🫶', titel: 'Gratis in je straat',
    tekst: 'Buurthuis, Repair Café, weggeefkast, buurtmoestuin.',
    zoek: (p) => [
      { label: `Buurthuis ${p}`, q: `buurthuis activiteiten ${p}` },
      { label: 'Repair Café', url: () => 'https://www.repaircafe.org/nl/bezoeken/' },
      { label: `Vrijwilligerswerk ${p}`, q: `vrijwilligerswerk ${p} vacatures` }
    ]
  },
  {
    id: 'cultuur', emoji: '🎭', titel: 'Musea en film',
    tekst: 'Kleine zalen en tentoonstellingen zijn vaak goedkoper én leuker.',
    interesses: ['cultuur', 'muziek', 'kunst', 'lezen'],
    zoek: (p) => [
      { label: `Musea ${p}`, q: `museum ${p} tentoonstelling nu` },
      { label: `Filmhuis ${p}`, q: `filmhuis ${p} programma` },
      { label: `Bibliotheek ${p}`, q: `bibliotheek ${p} activiteiten agenda` }
    ]
  },
  {
    id: 'sport', emoji: '🏃', titel: 'Sporten met anderen',
    tekst: 'Proeflessen, hardloopgroepjes en zwembadtijden.',
    interesses: ['sport', 'sociaal'],
    zoek: (p) => [
      { label: `Sportclubs ${p}`, q: `sportvereniging ${p} proefles` },
      { label: `Hardloopgroep ${p}`, q: `hardloopgroep ${p} beginners` },
      { label: `Zwembad ${p}`, q: `zwembad ${p} banenzwemmen tijden` }
    ]
  },
  {
    id: 'markten', emoji: '🧺', titel: 'Markten',
    tekst: 'Een middag rondlopen, kijken en praten met mensen.',
    interesses: ['koken', 'huis', 'cultuur', 'tuin'],
    zoek: (p) => [
      { label: `Markt ${p}`, q: `weekmarkt ${p} dagen tijden` },
      { label: `Rommelmarkt ${p}`, q: `rommelmarkt vlooienmarkt ${p} agenda` },
      { label: `Kringloop ${p}`, q: `kringloopwinkel ${p}` }
    ]
  }
];

function slug(plaats) {
  return plaats.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Geeft de buurt-kaarten terug, met de best passende bronnen bovenaan. */
function buurtTips(plaats, interesses = []) {
  const p = (plaats || '').trim() || 'jouw plaats';
  return BUURT_BRONNEN
    .map((bron) => {
      const relevant = !bron.interesses || bron.interesses.some((i) => interesses.includes(i));
      return {
        ...bron,
        relevant,
        links: bron.zoek(p).map((l) => ({
          label: l.label,
          url: l.url ? l.url(p) : zoekUrl(l.q)      // zoekUrl komt uit js/links.js
        }))
      };
    })
    .sort((a, b) => Number(b.relevant) - Number(a.relevant));
}
