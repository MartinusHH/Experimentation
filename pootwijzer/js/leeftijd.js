// Leeftijd, levensfase en hoeveel je huisdier per dag nodig heeft.
//
// Waar de getallen vandaan komen staat in docs/bronnen.md. Kort:
// - Levensfases hond: AAHA Canine Life Stage Guidelines — de overgangen hangen
//   af van de grootte van het ras, niet van een vast aantal jaren.
// - Levensfases kat: AAFP/AAHA Feline Life Stage Guidelines (kitten, jong
//   volwassen, volwassen, senior).
// - Hondenjaren: Wang e.a. (2020) — mensenleeftijd ≈ 16 × ln(leeftijd) + 31.
//   Dat loopt niet lineair: het eerste jaar telt het zwaarst.
// - Energie: RER = 70 × kg^0,75, keer een factor per levensfase (WSAVA/NRC).

const GROEI_KLAAR_MND = { mini: 10, klein: 10, middel: 12, groot: 15, reus: 20 };

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function leeftijdInMaanden(geboortedatum, nu = new Date()) {
  if (!geboortedatum) return null;
  const geb = new Date(geboortedatum);
  if (Number.isNaN(geb.getTime())) return null;
  let mnd = (nu.getFullYear() - geb.getFullYear()) * 12 + (nu.getMonth() - geb.getMonth());
  if (nu.getDate() < geb.getDate()) mnd--;
  return Math.max(0, mnd);
}

export function mensenjaren(soort, jaren) {
  if (jaren <= 0) return 0;
  if (soort === 'hond') {
    // Onder het kwart jaar loopt de logaritme weg; daar schalen we lineair naar toe.
    if (jaren < 0.25) return Math.max(1, Math.round((jaren / 0.25) * (16 * Math.log(0.25) + 31)));
    return Math.round(16 * Math.log(jaren) + 31);
  }
  if (jaren <= 1) return Math.round(jaren * 15);
  if (jaren <= 2) return Math.round(15 + (jaren - 1) * 9);
  return Math.round(24 + (jaren - 2) * 4);
}

// De fases achter elkaar, met begin- en eindleeftijd in jaren.
function fases(soort, ras) {
  const verwacht = ras?.leeftijdsverwachting
    ? (ras.leeftijdsverwachting[0] + ras.leeftijdsverwachting[1]) / 2
    : (soort === 'hond' ? 12.5 : 15);
  const seniorVanaf = Math.round(verwacht * 0.75 * 10) / 10;

  if (soort === 'hond') {
    const groeiKlaar = (GROEI_KLAAR_MND[ras?.grootte] || 12) / 12;
    const volwassenTot = clamp(groeiKlaar + 2, 2.5, 4);
    return [
      { id: 'puppy', naam: 'Puppy', emoji: '🍼', van: 0, tot: groeiKlaar },
      { id: 'jongvolwassen', naam: 'Jongvolwassen', emoji: '🎾', van: groeiKlaar, tot: volwassenTot },
      { id: 'volwassen', naam: 'Volwassen', emoji: '🦴', van: volwassenTot, tot: seniorVanaf },
      { id: 'senior', naam: 'Senior', emoji: '🛋️', van: seniorVanaf, tot: Infinity }
    ];
  }
  return [
    { id: 'kitten', naam: 'Kitten', emoji: '🍼', van: 0, tot: 1 },
    { id: 'jongvolwassen', naam: 'Jongvolwassen', emoji: '🧶', van: 1, tot: 6 },
    { id: 'volwassen', naam: 'Volwassen', emoji: '🐈', van: 6, tot: 10 },
    { id: 'senior', naam: 'Senior', emoji: '🛋️', van: 10, tot: Infinity }
  ];
}

const VOER = {
  hond: {
    puppy: 'Puppyvoer, over 3 tot 4 maaltijden per dag. Puppy\'s groeien hard en hun maagje is klein.',
    jongvolwassen: 'Stap over naar volwassenvoer zodra de groei klaar is; twee maaltijden per dag.',
    volwassen: 'Compleet volwassenvoer, twee vaste maaltijden. Weeg af, schat niet.',
    senior: 'Seniorvoer: makkelijker verteerbaar en minder calorieën, maar wél genoeg eiwit voor de spieren.'
  },
  kat: {
    kitten: 'Kittenvoer, klein beetje en vaak — een kitten eet gerust vijf keer per dag.',
    jongvolwassen: 'Volwassenvoer. Verdeel het over meerdere kleine porties, liefst uit een snuffelbak.',
    volwassen: 'Let op het gewicht: dit is de leeftijd waarop katten stilletjes te dik worden.',
    senior: 'Seniorvoer met aandacht voor de nieren. Zet meerdere waterbakken neer, ver van de voerbak.'
  }
};

export function berekenLeeftijd(soort, geboortedatum, ras, nu = new Date()) {
  const mnd = leeftijdInMaanden(geboortedatum, nu);
  if (mnd === null) return null;
  const jaren = mnd / 12;
  const lijst = fases(soort, ras);
  const idx = lijst.findIndex((f) => jaren >= f.van && jaren < f.tot);
  const fase = lijst[idx === -1 ? lijst.length - 1 : idx];
  const volgende = lijst[lijst.indexOf(fase) + 1] || null;

  const spanne = fase.tot === Infinity ? null : fase.tot - fase.van;
  const voortgang = spanne ? clamp((jaren - fase.van) / spanne, 0, 1) : 1;

  return {
    maanden: mnd,
    jaren,
    jarenHeel: Math.floor(jaren),
    restMaanden: mnd % 12,
    mensenjaren: mensenjaren(soort, jaren),
    fase,
    volgende,
    voortgang,
    maandenTotVolgende: volgende ? Math.max(0, Math.round((fase.tot - jaren) * 12)) : null,
    voeradvies: VOER[soort][fase.id] || VOER[soort].volwassen
  };
}

// Dagelijkse energiebehoefte in kcal. Een richtlijn, geen recept: het echte
// antwoord lees je af aan het gewicht en de ribben, niet aan de rekensom.
export function energiebehoefte({ soort, gewicht, faseId, geholpen, conditie = 'goed' }) {
  const kg = Number(gewicht);
  if (!kg || kg <= 0) return null;
  const rer = 70 * Math.pow(kg, 0.75);

  let factor;
  if (soort === 'hond') {
    if (faseId === 'puppy') factor = 2.5;
    else if (faseId === 'jongvolwassen') factor = geholpen ? 1.6 : 1.8;
    else if (faseId === 'senior') factor = 1.4;
    else factor = geholpen ? 1.6 : 1.8;
  } else {
    if (faseId === 'kitten') factor = 2.5;
    else if (faseId === 'senior') factor = 1.3;
    else factor = geholpen ? 1.2 : 1.4;
  }
  if (conditie === 'tezwaar') factor = soort === 'hond' ? 1.0 : 0.8;
  if (conditie === 'temager') factor += 0.3;

  return {
    rer: Math.round(rer),
    factor: Math.round(factor * 100) / 100,
    kcal: Math.round(rer * factor),
    toelichting: conditie === 'tezwaar'
      ? 'Dit is een afvalportie. Weeg elke twee weken en overleg met de dierenarts.'
      : 'Richtlijn voor een dag, inclusief snoepjes. Weeg maandelijks en stel bij.'
  };
}

// Hoeveel gram voer hoort daarbij, als je weet hoeveel kcal er in 100 gram zit.
export function gramPerDag(kcal, kcalPer100g) {
  if (!kcal || !kcalPer100g) return null;
  return Math.round((kcal / kcalPer100g) * 100);
}
