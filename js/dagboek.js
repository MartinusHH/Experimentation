/*
 * Offline!  —  dagboek & dankbaarheidsdagboek
 *
 * Eén bladzijde per dag. Wat je die dag deed komt er vanzelf bij te staan:
 * elke afgeronde activiteit wordt op de bladzijde van die datum gelogd.
 */

const STEMMINGEN = [
  { waarde: 1, emoji: '😔', naam: 'zwaar' },
  { waarde: 2, emoji: '😕', naam: 'matig' },
  { waarde: 3, emoji: '🙂', naam: 'oké' },
  { waarde: 4, emoji: '😊', naam: 'goed' },
  { waarde: 5, emoji: '🤩', naam: 'top' }
];

const LEGE_PAGINA = { dank: ['', '', ''], stemming: null, notitie: '' };

/** Datumsleutel in lokale tijd — toISOString zou rond middernacht een dag verspringen. */
function dagSleutel(datum = new Date()) {
  const d = new Date(datum);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function verschuifDag(sleutel, dagen) {
  const [j, m, d] = sleutel.split('-').map(Number);
  return dagSleutel(new Date(j, m - 1, d + dagen));
}

function leesPagina(state, sleutel) {
  const opgeslagen = state.dagboek[sleutel];
  return opgeslagen ? { ...LEGE_PAGINA, ...opgeslagen, dank: [...(opgeslagen.dank || ['', '', ''])] } : { ...LEGE_PAGINA, dank: ['', '', ''] };
}

function schrijfPagina(state, sleutel, pagina) {
  if (paginaLeeg(pagina)) delete state.dagboek[sleutel];
  else state.dagboek[sleutel] = { ...pagina, bijgewerkt: Date.now() };
}

function paginaLeeg(pagina) {
  return !pagina.dank.some((d) => d.trim()) && !pagina.notitie.trim() && !pagina.stemming;
}

/** Activiteiten die op deze datum zijn afgerond. */
function activiteitenOp(state, sleutel) {
  return state.gedaan.filter((g) => g.datum === sleutel);
}

/** Elke dag met iets erop telt als beschreven bladzijde. */
function beschrevenDagen(state) {
  const dagen = new Set([...Object.keys(state.dagboek), ...state.gedaan.map((g) => g.datum)]);
  return [...dagen].sort();
}

function paginaNummer(state, sleutel) {
  const index = beschrevenDagen(state).indexOf(sleutel);
  return index < 0 ? null : index + 1;
}

/** Aaneengesloten dagen tot en met vandaag waarop je iets hebt gedaan of geschreven. */
function reeks(state) {
  const dagen = new Set(beschrevenDagen(state));
  let teller = 0;
  let dag = dagSleutel();
  if (!dagen.has(dag)) dag = verschuifDag(dag, -1);   // gisteren telt nog mee
  while (dagen.has(dag)) { teller++; dag = verschuifDag(dag, -1); }
  return teller;
}

function datumLabel(sleutel) {
  const vandaag = dagSleutel();
  if (sleutel === vandaag) return 'Vandaag';
  if (sleutel === verschuifDag(vandaag, -1)) return 'Gisteren';
  const [j, m, d] = sleutel.split('-').map(Number);
  return new Date(j, m - 1, d).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Het hele dagboek als leesbare tekst (Offline+). */
function exporteerDagboek(state) {
  const regels = ['Offline! — mijn dagboek', ''];
  beschrevenDagen(state).reverse().forEach((sleutel) => {
    const p = leesPagina(state, sleutel);
    const gedaan = activiteitenOp(state, sleutel);
    regels.push(`── ${datumLabel(sleutel)} (${sleutel}) ──`);
    const dank = p.dank.filter((d) => d.trim());
    if (dank.length) { regels.push('Dankbaar voor:'); dank.forEach((d, i) => regels.push(`  ${i + 1}. ${d}`)); }
    if (p.stemming) {
      const s = STEMMINGEN.find((x) => x.waarde === p.stemming);
      regels.push(`Stemming: ${s.emoji} ${s.naam}`);
    }
    if (p.notitie.trim()) { regels.push('Notitie:'); regels.push(`  ${p.notitie.replace(/\n/g, '\n  ')}`); }
    if (gedaan.length) {
      regels.push('Gedaan:');
      gedaan.forEach((g) => regels.push(`  • ${g.titel} (${g.minuten} min)`));
    }
    regels.push('');
  });
  return regels.join('\n');
}
