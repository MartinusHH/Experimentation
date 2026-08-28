// "Ik weet het ras niet" — de speurtocht.
//
// Vijf keuzevragen met plaatjes in plaats van een open tekstvak: dat is
// sneller, maakt geen typefouten, werkt zonder internet en geeft altijd
// hetzelfde antwoord op dezelfde invoer. De app vergelijkt je antwoorden met
// de kenmerken uit rassen.js en zet de dichtstbijzijnde bovenaan.

import { rassenVoor } from './rassen.js';

export const VRAGEN = [
  {
    id: 'grootte', vraag: 'Hoe groot is het ongeveer?',
    opties: [
      { waarde: 'mini', label: 'Mini', hint: 'past op schoot, tot ~4 kg', emoji: '🐁' },
      { waarde: 'klein', label: 'Klein', hint: 'tot je knie, 4-12 kg', emoji: '🐕' },
      { waarde: 'middel', label: 'Middel', hint: '12-25 kg', emoji: '🐩' },
      { waarde: 'groot', label: 'Groot', hint: '25-45 kg', emoji: '🐕‍🦺' },
      { waarde: 'reus', label: 'Reus', hint: 'meer dan 45 kg', emoji: '🦮' }
    ],
    gewicht: 3
  },
  {
    id: 'vacht', vraag: 'Wat voor vacht?',
    opties: [
      { waarde: 'kort', label: 'Kort en glad', emoji: '✨' },
      { waarde: 'middel', label: 'Halflang, dikke onderlaag', emoji: '🧥' },
      { waarde: 'lang', label: 'Lang en zacht', emoji: '🌾' },
      { waarde: 'krullend', label: 'Krullen of wol', emoji: '🐑' },
      { waarde: 'ruw', label: 'Ruw en stug', emoji: '🧹' },
      { waarde: 'kaal', label: 'Bijna kaal', emoji: '🥚' }
    ],
    gewicht: 3
  },
  {
    id: 'oren', vraag: 'En de oren?',
    opties: [
      { waarde: 'staand', label: 'Rechtop', emoji: '📐' },
      { waarde: 'halfstaand', label: 'Rechtop met een knikje', emoji: '📏' },
      { waarde: 'hang', label: 'Hangend', emoji: '🍃' }
    ],
    gewicht: 2
  },
  {
    id: 'snuit', vraag: 'Hoe ziet de snuit eruit?',
    opties: [
      { waarde: 'kort', label: 'Plat, ingedrukt', emoji: '😤' },
      { waarde: 'normaal', label: 'Gewoon', emoji: '🙂' },
      { waarde: 'lang', label: 'Lang en spits', emoji: '📎' }
    ],
    gewicht: 2
  },
  {
    id: 'energie', vraag: 'Hoe druk is het beestje?',
    opties: [
      { waarde: 1, label: 'Slaapkop', emoji: '😴' },
      { waarde: 2, label: 'Gemiddeld', emoji: '🙂' },
      { waarde: 3, label: 'Altijd aan', emoji: '⚡' }
    ],
    gewicht: 1
  }
];

export function gokRas(soort, antwoorden) {
  const kandidaten = rassenVoor(soort).filter((r) => !r.id.startsWith('kruising'));
  const gesteld = VRAGEN.filter((v) => antwoorden[v.id] !== undefined && antwoorden[v.id] !== null);
  const maximaal = gesteld.reduce((som, v) => som + v.gewicht, 0) || 1;

  const scores = kandidaten.map((ras) => {
    let punten = 0;
    const raakt = [];
    for (const vraag of gesteld) {
      const gegeven = antwoorden[vraag.id];
      const heeft = ras[vraag.id];
      if (vraag.id === 'energie') {
        const verschil = Math.abs(Number(heeft) - Number(gegeven));
        const deel = verschil === 0 ? 1 : verschil === 1 ? 0.5 : 0;
        punten += vraag.gewicht * deel;
        if (deel === 1) raakt.push('energie');
      } else if (vraag.id === 'grootte') {
        const orde = ['mini', 'klein', 'middel', 'groot', 'reus'];
        const verschil = Math.abs(orde.indexOf(heeft) - orde.indexOf(gegeven));
        const deel = verschil === 0 ? 1 : verschil === 1 ? 0.45 : 0;
        punten += vraag.gewicht * deel;
        if (deel === 1) raakt.push('grootte');
      } else {
        const gelijk = heeft === gegeven;
        punten += gelijk ? vraag.gewicht : 0;
        if (gelijk) raakt.push(vraag.id);
      }
    }
    return { ras, score: punten / maximaal, raakt };
  });

  scores.sort((a, b) => b.score - a.score || a.ras.naam.localeCompare(b.ras.naam));
  return scores.slice(0, 3).map((s) => ({
    ...s,
    procent: Math.round(s.score * 100),
    zekerheid: s.score >= 0.85 ? 'hoog' : s.score >= 0.6 ? 'redelijk' : 'laag'
  }));
}

// Zoeken op naam, voor als je het ras wél weet.
export function zoekRas(soort, term) {
  const t = term.trim().toLowerCase();
  if (t.length < 1) return [];
  return rassenVoor(soort)
    .filter((r) => r.naam.toLowerCase().includes(t))
    .slice(0, 6);
}
