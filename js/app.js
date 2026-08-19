/*
 * Offline!  —  app-logica
 *
 * Vijf korte schermen (Vandaag, Ontdek, Dagboek, Buurt, Ik) met een vaste
 * balk onderin. Alles wat detail is, komt omhoog in een blad — zo blijft
 * elk scherm kort genoeg om in één blik te overzien.
 */

const OPSLAG_SLEUTEL = 'offline-app-v2';

const STANDAARD = {
  interesses: [],
  plaats: '',
  filters: { tijd: 60, budget: 'gratis', plek: 'egaal', sociaal: 'egaal', energie: 2 },
  favorieten: [],
  gedaan: [],
  gezien: [],
  dagboek: {},
  plan: 'gratis',
  plusTot: null,
  proefTot: null,
  onboarding: false,
  weerCache: null
};

let state = laad();
let weer = null;
let toonAantal = 4;
let ontdekLijst = [];
let timerData = null;
let dagHuidig = dagSleutel();
let installPrompt = null;
let dagOpslagTimer = null;

/* ═════════════════════════════════════════════════ opslag ══ */

function laad() {
  try {
    const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
    if (!ruw) return { ...STANDAARD, filters: { ...STANDAARD.filters }, dagboek: {} };
    const opgeslagen = JSON.parse(ruw);
    return {
      ...STANDAARD, ...opgeslagen,
      filters: { ...STANDAARD.filters, ...(opgeslagen.filters || {}) },
      dagboek: opgeslagen.dagboek || {}
    };
  } catch {
    return { ...STANDAARD, filters: { ...STANDAARD.filters }, dagboek: {} };
  }
}

function bewaar() {
  try { localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(state)); } catch { /* privémodus */ }
}

/* ═════════════════════════════════════════════════ helpers ══ */

const $  = (sel, wortel = document) => wortel.querySelector(sel);
const $$ = (sel, wortel = document) => Array.from(wortel.querySelectorAll(sel));

function veilig(tekst) {
  const d = document.createElement('div');
  d.textContent = tekst == null ? '' : tekst;
  return d.innerHTML;
}

function meervoud(aantal, enkel, meer) { return `${aantal} ${aantal === 1 ? enkel : meer}`; }

function toost(tekst) {
  const el = $('#toost');
  el.textContent = tekst;
  el.hidden = false;
  clearTimeout(toost.timer);
  toost.timer = setTimeout(() => { el.hidden = true; }, 2600);
}

const KLEUR_PER_INTERESSE = {
  kleding: 'var(--roze)', kunst: 'var(--lila-diep)', koken: 'var(--perzik-diep)',
  tuin: 'var(--mint-diep)', klussen: 'var(--boter)', muziek: 'var(--lila-diep)',
  schrijven: 'var(--lucht-diep)', fotografie: 'var(--lucht-diep)', sport: 'var(--mint-diep)',
  natuur: 'var(--mint-diep)', techniek: 'var(--lucht-diep)', spellen: 'var(--perzik-diep)',
  lezen: 'var(--boter)', sociaal: 'var(--perzik-diep)', huis: 'var(--mint-diep)',
  dieren: 'var(--boter)', welzijn: 'var(--lila-diep)', cultuur: 'var(--roze)'
};

/* ═════════════════════════════════════════════════ router ══ */

function naarScherm(naam) {
  $$('.scherm').forEach((s) => s.classList.toggle('is-actief', s.id === `scherm-${naam}`));
  $$('.balk__knop').forEach((k) => k.classList.toggle('is-actief', k.dataset.scherm === naam));
  window.scrollTo({ top: 0 });
  if (naam === 'vandaag') tekenVandaag();
  if (naam === 'ontdek') tekenOntdek();
  if (naam === 'dagboek') tekenDagboek();
  if (naam === 'buurt') tekenBuurt();
  if (naam === 'ik') tekenIk();
}

document.addEventListener('click', (e) => {
  const knop = e.target.closest('[data-scherm]');
  if (knop) naarScherm(knop.dataset.scherm);
});

/* ══════════════════════════════════════════════════ blad ══ */

function openBlad(titel, html) {
  $('#bladTitel').textContent = titel;
  $('#bladInhoud').innerHTML = html;
  $('#blad').hidden = false;
  $('#overlay').hidden = false;
  $('#bladSluit').focus();
}

function sluitBlad() {
  $('#blad').hidden = true;
  $('#overlay').hidden = true;
}

$('#bladSluit').addEventListener('click', sluitBlad);
$('#overlay').addEventListener('click', sluitBlad);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') sluitBlad(); });

/* ════════════════════════════════════════════ onboarding ══ */

function toonWizard() {
  $('#wizardInteresses').innerHTML = INTERESSES.map((i) =>
    `<button class="chip" data-interesse="${i.id}">${i.emoji} ${veilig(i.label)}</button>`).join('');
  $('#wizard').hidden = false;
}

$('#wizard').addEventListener('click', (e) => {
  const interesse = e.target.closest('[data-interesse]');
  if (interesse) {
    const id = interesse.dataset.interesse;
    state.interesses = state.interesses.includes(id)
      ? state.interesses.filter((x) => x !== id) : [...state.interesses, id];
    interesse.classList.toggle('is-aan');
    return;
  }
  const verder = e.target.closest('[data-wizard]');
  if (verder) {
    if (verder.dataset.wizard === '4') state.plaats = $('#wizardPlaats').value.trim();
    $$('.wizard__stap').forEach((s) => s.classList.toggle('is-actief', s.dataset.stap === verder.dataset.wizard));
    window.scrollTo({ top: 0 });
  }
  const tijdChip = e.target.closest('[data-filter="tijd"] .chip');
  if (tijdChip) {
    $$('[data-filter="tijd"] .chip', $('#wizard')).forEach((c) => c.classList.remove('is-aan'));
    tijdChip.classList.add('is-aan');
    state.filters.tijd = Number(tijdChip.dataset.waarde);
  }
});

$('#wizardKlaar').addEventListener('click', () => {
  state.onboarding = true;
  bewaar();
  $('#wizard').hidden = true;
  naarScherm('vandaag');
  if (state.plaats) haalWeerOp();
});

/* ═════════════════════════════════════════════ vandaag ══ */

function groet() {
  const uur = new Date().getHours();
  if (uur < 6) return 'Nog wakker?';
  if (uur < 12) return 'Goedemorgen';
  if (uur < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

function tekenVandaag() {
  $('#vandaagDatum').textContent = new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  $('#vandaagGroet').textContent = groet();
  $('#reeksGetal').textContent = reeks(state);

  // De balk heeft drie standen; kies degene die het dichtst bij je keuze ligt.
  const standen = $$('#vandaagTijd .segment__knop');
  const dichtstbij = standen.reduce((beste, k) =>
    Math.abs(Number(k.dataset.waarde) - state.filters.tijd) < Math.abs(Number(beste.dataset.waarde) - state.filters.tijd) ? k : beste);
  standen.forEach((k) => k.classList.toggle('is-aan', k === dichtstbij));

  const beste = suggesties(opties({ tijd: state.filters.tijd }))[0];
  $('#vandaagHero').innerHTML = beste
    ? ideeKaart(beste, { groot: true })
    : '<p class="leeg">Geen idee gevonden. Pas je filters aan bij Ontdek.</p>';

  const pagina = leesPagina(state, dagSleutel());
  const gedaanVandaag = activiteitenOp(state, dagSleutel()).length;
  $('#tegelDagboek').textContent = paginaLeeg(pagina)
    ? (gedaanVandaag ? `${meervoud(gedaanVandaag, 'activiteit', 'activiteiten')} gelogd` : 'nog niets vandaag')
    : 'bladzijde geschreven ✓';
  $('#tegelIdeeen').textContent = state.interesses.length
    ? `${meervoud(state.interesses.length, 'interesse', 'interesses')} ingesteld`
    : 'stel je smaak in';

  tekenWeerstrip();
}

$('#vandaagTijd').addEventListener('click', (e) => {
  const knop = e.target.closest('.segment__knop');
  if (!knop) return;
  state.filters.tijd = Number(knop.dataset.waarde);
  bewaar();
  tekenVandaag();
});

$('#knopReeks').addEventListener('click', () => {
  const dagen = reeks(state);
  const minuten = state.gedaan.reduce((som, g) => som + (g.minuten || 0), 0);
  openBlad('Je reeks', `
    <p>Je bent <b>${meervoud(dagen, 'dag', 'dagen')}</b> op rij bezig met iets anders dan je telefoon.</p>
    <p class="uitleg">In totaal ${meervoud(minuten, 'minuut', 'minuten')} offline, verdeeld over
      ${meervoud(state.gedaan.length, 'activiteit', 'activiteiten')}. Een dag telt mee als je een activiteit
      afrondt of een bladzijde in je dagboek schrijft.</p>
    <button class="knop knop--primair knop--vol" data-scherm="ontdek" data-sluit>Zoek iets voor vandaag</button>`);
});

/* ══════════════════════════════════════════════ ontdek ══ */

function opties(extra = {}) {
  return {
    interesses: state.interesses,
    ...state.filters,
    weer,
    vermijd: state.gezien.slice(-6),
    favorieten: state.favorieten,
    plus: heeftPlus(state),
    ...extra
  };
}

const BUDGET_TEKST = { gratis: 'gratis', klein: 'paar euro', investering: 'mag wat kosten' };
const PLEK_TEKST = { egaal: 'binnen of buiten', binnen: 'binnen', buiten: 'buiten' };
const SOCIAAL_TEKST = { egaal: '', alleen: 'alleen', samen: 'samen' };

function filterSamenvatting() {
  const f = state.filters;
  const delen = [formatteerTijd(f.tijd), BUDGET_TEKST[f.budget], PLEK_TEKST[f.plek]];
  if (SOCIAAL_TEKST[f.sociaal]) delen.push(SOCIAAL_TEKST[f.sociaal]);
  return delen.join(' · ');
}

function tekenOntdek() {
  $('#filterSamenvatting').textContent = filterSamenvatting();
  ontdekLijst = suggesties(opties());
  const doel = $('#ontdekLijst');
  if (!ontdekLijst.length) {
    doel.innerHTML = `<p class="leeg">Met deze combinatie vind ik niets.<br>Probeer meer tijd of een ruimer budget.</p>`;
    $('#knopMeer').hidden = true;
    return;
  }
  doel.innerHTML = zichtbareIdeeen().map((s) => ideeKaart(s)).join('');
  $('#knopMeer').hidden = toonAantal >= ontdekLijst.length;
}

/**
 * Zonder abonnement houden we onderin plek vrij voor één pakket-idee: zo zie
 * je wat Offline+ toevoegt zonder dat het de gewone suggesties wegdrukt.
 */
function zichtbareIdeeen() {
  if (heeftPlus(state)) return ontdekLijst.slice(0, toonAantal);
  const teaser = ontdekLijst.find((s) => s.vergrendeld);
  if (!teaser) return ontdekLijst.slice(0, toonAantal);
  const rest = ontdekLijst.filter((s) => s !== teaser);
  return [...rest.slice(0, Math.max(1, toonAantal - 1)), teaser];
}

function ideeKaart({ activiteit: a, redenen, raak, vergrendeld }, opt = {}) {
  const kleur = KLEUR_PER_INTERESSE[raak[0] || a.interesses[0]] || 'var(--mint-diep)';
  const labels = (opt.groot ? redenen : redenen.slice(0, 3)).map((r) => {
    const soort = /Gratis/.test(r) ? ' label--gratis'
      : /weer|buiten/i.test(r) ? ' label--weer'
      : /min|uur/.test(r) ? ' label--tijd' : '';
    return `<span class="label${soort}">${veilig(r)}</span>`;
  }).join('');
  const favoriet = state.favorieten.includes(a.id);

  return `
  <button class="idee ${opt.groot ? 'idee--groot' : ''}" style="--kleurstreep:${kleur}" data-idee="${a.id}">
    <span class="idee__kop">
      <span class="idee__titel">${veilig(a.titel)}</span>
      <span class="hart" aria-hidden="true">${favoriet ? '💖' : ''}</span>
    </span>
    <span class="idee__pitch">${veilig(a.pitch)}</span>
    <span class="idee__labels">
      ${vergrendeld ? `<span class="label label--plus">Offline+ · ${veilig(a.pakket)}</span>` : ''}
      ${labels}
    </span>
  </button>`;
}

document.addEventListener('click', (e) => {
  const kaart = e.target.closest('[data-idee]');
  if (kaart) openIdee(kaart.dataset.idee);
});

function openIdee(id) {
  const a = ACTIVITEITEN.find((x) => x.id === id);
  if (!a) return;

  if (a.plus && !heeftPlus(state)) { openPlusBlad(a); return; }

  const favoriet = state.favorieten.includes(a.id);
  const spullen = a.benodigdheden.length ? `
    <div class="blad__veld">
      <span>Nodig${affiliateActief() ? ' — tik om te bestellen' : ''}</span>
      <div class="chips chips--wikkel">
        ${a.benodigdheden.map((b) =>
          `<a class="chip" href="${materiaalLink(b)}" target="_blank" rel="noopener nofollow sponsored">${veilig(b)} ↗</a>`).join('')}
      </div>
      ${affiliateActief() ? '<span class="uitleg">Via deze links verdient de app een kleine commissie. Jij betaalt hetzelfde.</span>' : ''}
    </div>` : '';

  openBlad(a.titel, `
    <p>${veilig(a.pitch)}</p>
    <div class="kaart kaart--zacht"><b>Eerste stap</b><span>${veilig(a.eersteStap)}</span></div>
    <div class="blad__veld"><span>Kort samengevat</span>
      <div class="chips chips--wikkel">
        <span class="chip">${formatteerTijd(a.tijd)}</span>
        <span class="chip">${veilig(a.kostenIndicatie)}</span>
        <span class="chip">${PLEK_TEKST[a.plek] || veilig(a.plek)}</span>
        <span class="chip">${a.sociaal === 'beide' ? 'alleen of samen' : veilig(a.sociaal)}</span>
      </div>
    </div>
    ${spullen}
    <div class="knoprij">
      <button class="knop knop--primair knop--vol" data-start="${a.id}">Ik ga dit doen</button>
      ${a.zoek ? `<a class="knop knop--vol" href="${zoekLink(a, state.plaats)}" target="_blank" rel="noopener">Zoek uitleg ↗</a>` : ''}
      <button class="knop knop--vol" data-favoriet="${a.id}">${favoriet ? '💖 Bewaard' : '🤍 Bewaar voor later'}</button>
      <button class="knop knop--stil knop--vol" data-anders="${a.id}">Toon me iets anders</button>
    </div>`);
}

document.addEventListener('click', (e) => {
  const start = e.target.closest('[data-start]');
  if (start) { sluitBlad(); startTimer(start.dataset.start); return; }

  const fav = e.target.closest('[data-favoriet]');
  if (fav) {
    const id = fav.dataset.favoriet;
    const nu = state.favorieten.includes(id);
    state.favorieten = nu ? state.favorieten.filter((x) => x !== id) : [...state.favorieten, id];
    fav.textContent = nu ? '🤍 Bewaar voor later' : '💖 Bewaard';
    bewaar();
    toost(nu ? 'Uit je lijst gehaald' : 'Bewaard voor later');
    tekenOntdek();
    return;
  }

  const anders = e.target.closest('[data-anders]');
  if (anders) {
    state.gezien = [...state.gezien, anders.dataset.anders].slice(-20);
    bewaar();
    sluitBlad();
    tekenOntdek();
    tekenVandaag();
    return;
  }

  if (e.target.closest('[data-sluit]')) sluitBlad();
});

$('#knopMeer').addEventListener('click', () => { toonAantal += 4; tekenOntdek(); });

$('#knopVerras').addEventListener('click', () => {
  const alles = suggesties(opties());
  if (!alles.length) return toost('Geen idee gevonden — verruim je filters.');
  openIdee(alles[Math.floor(Math.random() * Math.min(12, alles.length))].activiteit.id);
});

/* ─────────────────────────────────────────── filterblad ── */

const FILTER_VELDEN = [
  { sleutel: 'tijd', label: 'Hoeveel tijd heb je?', opties: [[15, '15 min'], [30, 'Half uur'], [60, 'Een uur'], [120, 'Paar uur'], [240, 'Hele middag']] },
  { sleutel: 'budget', label: 'Mag het geld kosten?', opties: [['gratis', 'Liever gratis'], ['klein', 'Paar euro'], ['investering', 'Mag wat kosten']] },
  { sleutel: 'plek', label: 'Binnen of buiten?', opties: [['egaal', 'Maakt niet uit'], ['binnen', 'Binnen'], ['buiten', 'Buiten']] },
  { sleutel: 'sociaal', label: 'Alleen of samen?', opties: [['egaal', 'Maakt niet uit'], ['alleen', 'Alleen'], ['samen', 'Samen']] },
  { sleutel: 'energie', label: 'Hoeveel energie heb je?', opties: [[1, 'Weinig 🫖'], [2, 'Gemiddeld 🙂'], [3, 'Veel ⚡']] }
];

$('#knopFilter').addEventListener('click', () => {
  openBlad('Verfijn', FILTER_VELDEN.map((veld) => `
    <div class="blad__veld"><span>${veld.label}</span>
      <div class="chips chips--wikkel" data-veld="${veld.sleutel}">
        ${veld.opties.map(([waarde, tekst]) =>
          `<button class="chip ${state.filters[veld.sleutel] === waarde ? 'is-aan' : ''}" data-waarde="${waarde}">${tekst}</button>`).join('')}
      </div>
    </div>`).join('') + '<button class="knop knop--primair knop--vol" data-sluit>Toon ideeën</button>');
});

$('#bladInhoud').addEventListener('click', (e) => {
  const chip = e.target.closest('[data-veld] .chip');
  if (!chip) return;
  const groep = chip.closest('[data-veld]');
  const sleutel = groep.dataset.veld;
  $$('.chip', groep).forEach((c) => c.classList.remove('is-aan'));
  chip.classList.add('is-aan');
  const ruw = chip.dataset.waarde;
  state.filters[sleutel] = /^\d+$/.test(ruw) ? Number(ruw) : ruw;
  bewaar();
  tekenOntdek();
  tekenVandaag();
});

/* ═══════════════════════════════════════════════ timer ══ */

function startTimer(id) {
  const a = ACTIVITEITEN.find((x) => x.id === id);
  if (!a) return;
  const minuten = Math.max(5, Math.min(a.tijd, state.filters.tijd));
  timerData = { id, titel: a.titel, start: Date.now(), eind: Date.now() + minuten * 60000, duur: minuten * 60000 };
  $('#timerActiviteit').textContent = a.titel;
  $('#timer').hidden = false;
  tikTimer();
  timerData.interval = setInterval(tikTimer, 1000);
}

function tikTimer() {
  if (!timerData) return;
  const over = Math.max(0, timerData.eind - Date.now());
  const uren = Math.floor(over / 3600000);
  const m = Math.floor((over % 3600000) / 60000);
  const s = Math.floor((over % 60000) / 1000);
  $('#timerKlok').textContent = over === 0 ? 'Klaar!'
    : uren ? `${uren}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const omtrek = 327;
  $('#timerVul').style.strokeDashoffset = String(omtrek * (1 - over / timerData.duur));
}

function stopTimer() {
  if (timerData && timerData.interval) clearInterval(timerData.interval);
  timerData = null;
  $('#timer').hidden = true;
}

$('#timerKlaar').addEventListener('click', () => {
  if (!timerData) return stopTimer();
  const minuten = Math.max(1, Math.round((Date.now() - timerData.start) / 60000));
  state.gedaan = [{ id: timerData.id, titel: timerData.titel, minuten, datum: dagSleutel() }, ...state.gedaan].slice(0, 500);
  state.gezien = [...state.gezien, timerData.id].slice(-20);
  bewaar();
  stopTimer();
  dagHuidig = dagSleutel();
  naarScherm('dagboek');
  toost(`${meervoud(minuten, 'minuut', 'minuten')} bijgeschreven`);
});

$('#timerStop').addEventListener('click', stopTimer);

/* ═════════════════════════════════════════════ dagboek ══ */

function tekenDagboek() {
  const pagina = leesPagina(state, dagHuidig);
  $('#dagDatum').textContent = datumLabel(dagHuidig);
  const nr = paginaNummer(state, dagHuidig);
  $('#dagNummer').textContent = nr ? `bladzijde ${nr}` : 'nieuwe bladzijde';
  $('#dagVolgende').disabled = dagHuidig >= dagSleutel();

  pagina.dank.forEach((tekst, i) => { $(`#dank${i}`).value = tekst; });
  $('#dagNotitie').value = pagina.notitie;
  $('#stemmingen').innerHTML = STEMMINGEN.map((s) =>
    `<button class="stemming ${pagina.stemming === s.waarde ? 'is-aan' : ''}" data-stemming="${s.waarde}"
      title="${s.naam}" aria-label="${s.naam}">${s.emoji}</button>`).join('');

  const gedaan = activiteitenOp(state, dagHuidig);
  const minuten = gedaan.reduce((som, g) => som + g.minuten, 0);
  $('#dagActiviteiten').innerHTML = gedaan.length
    ? gedaan.map((g) => `<div class="logregel"><div>${veilig(g.titel)}</div><span>${g.minuten} min</span></div>`).join('')
      + `<p class="uitleg">Samen ${meervoud(minuten, 'minuut', 'minuten')} zonder telefoon.</p>`
    : '<p class="uitleg">Nog niets gelogd. Wat je afrondt met de timer komt hier vanzelf te staan.</p>';
}

function slaDagOp() {
  const pagina = {
    dank: [0, 1, 2].map((i) => $(`#dank${i}`).value),
    notitie: $('#dagNotitie').value,
    stemming: leesPagina(state, dagHuidig).stemming
  };
  const gekozen = $('#stemmingen .is-aan');
  pagina.stemming = gekozen ? Number(gekozen.dataset.stemming) : null;
  schrijfPagina(state, dagHuidig, pagina);
  bewaar();
  $('#dagOpslag').textContent = 'Opgeslagen ✓';
  clearTimeout(dagOpslagTimer);
  dagOpslagTimer = setTimeout(() => { $('#dagOpslag').textContent = ''; }, 1800);
}

['dank0', 'dank1', 'dank2', 'dagNotitie'].forEach((id) => {
  $(`#${id}`).addEventListener('input', () => {
    clearTimeout(slaDagOp.wacht);
    slaDagOp.wacht = setTimeout(slaDagOp, 600);
  });
});

$('#stemmingen').addEventListener('click', (e) => {
  const knop = e.target.closest('[data-stemming]');
  if (!knop) return;
  const aan = knop.classList.contains('is-aan');
  $$('#stemmingen .stemming').forEach((s) => s.classList.remove('is-aan'));
  if (!aan) knop.classList.add('is-aan');
  slaDagOp();
});

$('#dagVorige').addEventListener('click', () => { dagHuidig = verschuifDag(dagHuidig, -1); tekenDagboek(); });
$('#dagVolgende').addEventListener('click', () => {
  if (dagHuidig >= dagSleutel()) return;
  dagHuidig = verschuifDag(dagHuidig, 1);
  tekenDagboek();
});

$('#knopArchief').addEventListener('click', () => {
  const dagen = beschrevenDagen(state).reverse();
  const plus = heeftPlus(state);
  const zichtbaar = plus ? dagen : dagen.slice(0, 7);

  const regels = zichtbaar.length ? zichtbaar.map((sleutel) => {
    const p = leesPagina(state, sleutel);
    const gedaan = activiteitenOp(state, sleutel);
    const stem = p.stemming ? STEMMINGEN.find((s) => s.waarde === p.stemming).emoji : '';
    const stukjes = [];
    if (p.dank.some((d) => d.trim())) stukjes.push('dankbaarheid');
    if (p.notitie.trim()) stukjes.push('notitie');
    if (gedaan.length) stukjes.push(meervoud(gedaan.length, 'activiteit', 'activiteiten'));
    return `<button class="logregel" style="width:100%;background:none;border:none;font:inherit;color:inherit;cursor:pointer"
        data-dag="${sleutel}"><div>${stem} ${veilig(datumLabel(sleutel))}</div><span>${stukjes.join(' · ') || 'leeg'}</span></button>`;
  }).join('') : '<p class="leeg">Je archief vult zich vanzelf.</p>';

  const slot = !plus && dagen.length > 7
    ? `<div class="kaart kaart--plus">
         <b>Nog ${meervoud(dagen.length - 7, 'oudere bladzijde', 'oudere bladzijden')}</b>
         <span class="uitleg">Met Offline+ lees je je hele archief terug en kun je het exporteren.</span>
         <button class="knop knop--primair knop--vol" data-plus>Bekijk Offline+</button>
       </div>` : '';

  openBlad('Archief', regels + slot);
});

$('#bladInhoud').addEventListener('click', (e) => {
  const dag = e.target.closest('[data-dag]');
  if (!dag) return;
  dagHuidig = dag.dataset.dag;
  sluitBlad();
  naarScherm('dagboek');
});

/* ═══════════════════════════════════════════════ buurt ══ */

function tekenBuurt() {
  $('#buurtPlaats').value = $('#buurtPlaats').value || state.plaats;
  const plaats = ($('#buurtPlaats').value || state.plaats || '').trim();
  const tips = buurtTips(plaats, state.interesses);

  $('#buurtRooster').innerHTML = tips.map((t, i) => `
    <button class="tegel" data-buurt="${i}" style="border-left:5px solid ${t.relevant ? 'var(--perzik-diep)' : 'var(--lucht-diep)'}">
      <span class="tegel__emoji">${t.emoji}</span>
      <span class="tegel__titel">${veilig(t.titel)}</span>
      <span class="tegel__sub">${veilig(t.tekst)}</span>
    </button>`).join('');

  const aanmeld = partnerAanmeldLink(plaats);
  $('#buurtPartner').innerHTML = PARTNERS.length
    ? PARTNERS.map((p) => `<div class="kaart"><b>${veilig(p.naam)}</b><span class="uitleg">${veilig(p.tekst)}</span>
        <a class="knop knop--primair knop--vol" href="${p.url}" target="_blank" rel="noopener sponsored">Bekijk ↗</a>
        <span class="uitleg">Betaalde plaatsing</span></div>`).join('')
    : `<div class="kaart kaart--zacht">
         <b>Organiseer je zelf iets in ${veilig(plaats || 'de buurt')}?</b>
         <span class="uitleg">Workshops, clubs en cursussen kunnen hier opvallen voor mensen die
           precies daarnaar op zoek zijn.</span>
         ${aanmeld ? `<a class="knop knop--vol" href="${aanmeld}">Meld je aan als partner</a>` : ''}
       </div>`;

  buurtCache = tips;
}

let buurtCache = [];

$('#buurtRooster').addEventListener('click', (e) => {
  const tegel = e.target.closest('[data-buurt]');
  if (!tegel) return;
  const t = buurtCache[Number(tegel.dataset.buurt)];
  openBlad(`${t.emoji} ${t.titel}`, `
    <p class="uitleg">${veilig(t.tekst)}</p>
    <div class="knoprij">
      ${t.links.map((l) => `<a class="knop knop--vol" href="${l.url}" target="_blank" rel="noopener">${veilig(l.label)} ↗</a>`).join('')}
    </div>`);
});

$('#knopBuurt').addEventListener('click', () => {
  const plaats = $('#buurtPlaats').value.trim();
  if (plaats && !state.plaats) { state.plaats = plaats; bewaar(); }
  tekenBuurt();
});

$('#knopBuurtLocatie').addEventListener('click', async () => {
  try {
    toost('Even je locatie zoeken…');
    const { lat, lon } = await huidigeLocatie();
    const naam = await plaatsBijCoordinaten(lat, lon);
    if (!naam) return toost('Ik kon er geen plaatsnaam bij vinden.');
    $('#buurtPlaats').value = naam;
    if (!state.plaats) state.plaats = naam;
    bewaar();
    tekenBuurt();
  } catch (fout) {
    toost(fout.message);
  }
});

/* ══════════════════════════════════════════════════ ik ══ */

function tekenIk() {
  const minuten = state.gedaan.reduce((som, g) => som + (g.minuten || 0), 0);
  $('#cijfers').innerHTML = `
    <div class="cijfer"><b>${minuten}</b><span>${minuten === 1 ? 'minuut' : 'minuten'} offline</span></div>
    <div class="cijfer"><b>${state.gedaan.length}</b><span>gedaan</span></div>
    <div class="cijfer"><b>${reeks(state)}</b><span>${reeks(state) === 1 ? 'dag' : 'dagen'} op rij</span></div>`;

  $('#interesseKeuze').innerHTML = INTERESSES.map((i) =>
    `<button class="chip ${state.interesses.includes(i.id) ? 'is-aan' : ''}" data-mijn-interesse="${i.id}">
      ${i.emoji} ${veilig(i.label)}</button>`).join('');

  $('#plaatsInput').value = state.plaats;
  $('#knopInstalleer').hidden = !installPrompt;
  tekenPlusKaart();
}

$('#interesseKeuze').addEventListener('click', (e) => {
  const knop = e.target.closest('[data-mijn-interesse]');
  if (!knop) return;
  const id = knop.dataset.mijnInteresse;
  state.interesses = state.interesses.includes(id)
    ? state.interesses.filter((x) => x !== id) : [...state.interesses, id];
  knop.classList.toggle('is-aan');
  bewaar();
});

$('#knopPlaatsOpslaan').addEventListener('click', () => {
  state.plaats = $('#plaatsInput').value.trim();
  bewaar();
  weer = null;
  toost(state.plaats ? `Bewaard: ${state.plaats}` : 'Plaats gewist');
});

$('#knopWissen').addEventListener('click', () => {
  if (!confirm('Alles wissen? Je interesses, dagboek, favorieten en logboek verdwijnen.')) return;
  state = { ...STANDAARD, filters: { ...STANDAARD.filters }, dagboek: {} };
  try { localStorage.removeItem(OPSLAG_SLEUTEL); } catch { /* niets */ }
  weer = null;
  dagHuidig = dagSleutel();
  toonWizard();
});

$('#knopExport').addEventListener('click', () => {
  if (!heeftPlus(state)) return openPlusBlad();
  const tekst = exporteerDagboek(state);
  const bestand = new Blob([tekst], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(bestand);
  const link = document.createElement('a');
  link.href = url;
  link.download = `offline-dagboek-${dagSleutel()}.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toost('Dagboek geëxporteerd');
});

/* ═════════════════════════════════════════════ Offline+ ══ */

function tekenPlusKaart() {
  const plus = heeftPlus(state);
  $('#plusKaart').innerHTML = `
    <div class="kaart ${plus ? '' : 'kaart--plus'}">
      <h2 class="kaart__titel">${plus ? '💜 Offline+' : 'Offline+'}</h2>
      <p class="uitleg">${veilig(planOmschrijving(state))}</p>
      ${plus ? '' : `<button class="knop knop--primair knop--vol" data-plus>Wat krijg ik daarvoor?</button>`}
    </div>`;
}

document.addEventListener('click', (e) => { if (e.target.closest('[data-plus]')) openPlusBlad(); });

function openPlusBlad(activiteit) {
  const kanProeven = !proefGebruikt(state);
  const maand = koopUrl('maand');
  const jaar = koopUrl('jaar');

  openBlad('Offline+', `
    ${activiteit ? `<p><b>${veilig(activiteit.titel)}</b> hoort bij het pakket
      <b>${veilig(activiteit.pakket)}</b>.</p>` : ''}
    <div class="knoprij">
      ${PLUS_VOORDELEN.map(([emoji, titel, tekst]) =>
        `<div class="kaart"><b>${emoji} ${titel}</b><span class="uitleg">${tekst}</span></div>`).join('')}
    </div>
    <div class="knoprij">
      ${maand ? `<a class="knop knop--primair knop--vol" href="${maand}" target="_blank" rel="noopener">${CONFIG.prijsMaand} per maand</a>` : ''}
      ${jaar ? `<a class="knop knop--vol" href="${jaar}" target="_blank" rel="noopener">${CONFIG.prijsJaar} per jaar</a>` : ''}
      ${!maand && !jaar ? `<p class="uitleg">De winkel is nog niet gekoppeld. Probeer het gratis uit,
        of activeer met een licentiesleutel.</p>` : ''}
      ${kanProeven ? `<button class="knop ${maand ? '' : 'knop--primair'} knop--vol" id="knopProef">
        Probeer ${CONFIG.proefDagen} dagen gratis</button>` : ''}
    </div>
    <div class="blad__veld">
      <span>Al een licentiesleutel?</span>
      <div class="zoekrij">
        <input class="invoer" id="licentieInvoer" placeholder="OFFLINE-…">
        <button class="knop knop--primair" id="knopLicentie">Activeer</button>
      </div>
      <span class="uitleg" id="licentieMelding"></span>
    </div>`);

  const proef = $('#knopProef');
  if (proef) proef.addEventListener('click', () => {
    if (startProef(state)) {
      bewaar();
      sluitBlad();
      tekenIk(); tekenOntdek(); tekenVandaag();
      toost(`Je proefperiode van ${CONFIG.proefDagen} dagen loopt`);
    }
  });

  $('#knopLicentie').addEventListener('click', async () => {
    const melding = $('#licentieMelding');
    melding.textContent = 'Even controleren…';
    try {
      const uitslag = await valideerLicentie($('#licentieInvoer').value);
      state.plan = 'plus';
      state.plusTot = uitslag.tot;
      bewaar();
      sluitBlad();
      tekenIk(); tekenOntdek(); tekenVandaag();
      toost(uitslag.test ? 'Testperiode van 30 dagen geactiveerd' : 'Offline+ is actief. Dank je wel!');
    } catch (fout) {
      melding.textContent = fout.message;
    }
  });
}

/* ═══════════════════════════════════════════════ weer ══ */

const WEER_GELDIG = 30 * 60000;   // een half uur

function tekenWeerstrip() {
  const kop = $('#weerstripKop');
  const sub = $('#weerstripSub');
  if (weer) {
    $('#weerstripEmoji').textContent = weer.emoji;
    kop.textContent = `${weer.temperatuur}° · ${weer.korteTekst} in ${weer.plaats}`;
    sub.textContent = weer.advies;
  } else if (!state.plaats) {
    $('#weerstripEmoji').textContent = '📍';
    kop.textContent = 'Weerbericht';
    sub.textContent = 'Vul je plaats in bij Ik, dan weeg ik het weer mee';
  } else {
    $('#weerstripEmoji').textContent = '🌤️';
    kop.textContent = `Weer in ${state.plaats}`;
    sub.textContent = 'Tik om te kijken of buiten nu wat is';
  }
}

async function haalWeerOp(coords) {
  const opgeslagen = state.weerCache;
  if (!coords && opgeslagen && Date.now() - opgeslagen.tijd < WEER_GELDIG) {
    weer = opgeslagen.data;
    tekenWeerstrip();
    return weer;
  }
  try {
    let lat, lon, naam;
    if (coords) {
      ({ lat, lon } = coords);
      naam = (await plaatsBijCoordinaten(lat, lon)) || 'jouw locatie';
    } else {
      const gevonden = await zoekPlaats(state.plaats);
      ({ lat, lon } = gevonden);
      naam = gevonden.naam;
    }
    weer = await haalWeer(lat, lon, naam);
    state.weerCache = { tijd: Date.now(), data: weer };
    bewaar();
    tekenWeerstrip();
    tekenVandaag();
    return weer;
  } catch (fout) {
    if (opgeslagen) {           // liever oude gegevens dan niets
      weer = opgeslagen.data;
      tekenWeerstrip();
    }
    throw fout;
  }
}

$('#weerstrip').addEventListener('click', () => openWeerBlad());

async function openWeerBlad() {
  if (!state.plaats && !navigator.geolocation) {
    naarScherm('ik');
    return toost('Vul eerst je plaats in.');
  }
  openBlad('Weer & buiten', '<p class="uitleg">Even kijken…</p>');
  try {
    if (!state.plaats) {
      const c = await huidigeLocatie();
      await haalWeerOp(c);
    } else {
      await haalWeerOp();
    }
    toonWeerBlad();
  } catch (fout) {
    const offline = !navigator.onLine;
    openBlad('Weer & buiten', `
      <p class="fout">${veilig(offline ? 'Je bent offline — het weerbericht komt van internet.' : fout.message)}</p>
      <p class="uitleg">De rest van de app werkt gewoon door; ideeën worden dan zonder weer gerangschikt.</p>
      <div class="knoprij">
        <button class="knop knop--primair knop--vol" id="knopWeerOpnieuw">Opnieuw proberen</button>
        <button class="knop knop--vol" data-scherm="ik" data-sluit>Plaats aanpassen</button>
      </div>`);
    const opnieuw = $('#knopWeerOpnieuw');
    if (opnieuw) opnieuw.addEventListener('click', () => { state.weerCache = null; openWeerBlad(); });
  }
}

function toonWeerBlad() {
  const w = weer;
  const buitenGoed = w.buitenScore >= 60;
  const lijst = suggesties(opties({ plek: buitenGoed ? 'buiten' : 'binnen' })).slice(0, 3);
  const moment = w.besteMoment
    ? `<p class="uitleg">Beste moment om buiten te zijn: rond <b>${veilig(w.besteMoment.uur)}</b>
       (${w.besteMoment.temp}°, ${w.besteMoment.kans}% kans op regen).</p>` : '';

  openBlad('Weer & buiten', `
    <div class="kaart kaart--zacht">
      <div style="display:flex;align-items:center;gap:.8rem">
        <span style="font-size:2.4rem">${w.emoji}</span>
        <div>
          <b style="font-size:1.5rem">${w.temperatuur}°</b>
          <div>${veilig(w.tekst)} in ${veilig(w.plaats)}</div>
          <div class="uitleg">Voelt als ${w.gevoelstemperatuur}° · wind ${w.wind} km/u ·
            vandaag ${w.min}° tot ${w.max}°${w.zonsondergang ? ` · zon onder ${veilig(w.zonsondergang)}` : ''}</div>
        </div>
      </div>
      <p>${veilig(w.advies)}</p>
      ${moment}
    </div>
    <div class="blad__veld"><span>${buitenGoed ? 'Hier zou ik nu voor gaan' : 'Beter iets binnen'}</span>
      <div class="lijst">${lijst.map((s) => ideeKaart(s)).join('')}</div>
    </div>`);
}

window.addEventListener('online', () => toost('Je bent weer online'));
window.addEventListener('offline', () => toost('Offline — ideeën en dagboek werken gewoon door'));

/* ═══════════════════════════════════════ installeren ══ */

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
  const knop = $('#knopInstalleer');
  if (knop) knop.hidden = false;
});

$('#knopInstalleer').addEventListener('click', async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
  $('#knopInstalleer').hidden = true;
});

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* niet erg */ }));
}

/* ═══════════════════════════════════════════════ start ══ */

function start() {
  if (!state.onboarding) {
    toonWizard();
  } else {
    naarScherm('vandaag');
    if (state.plaats) haalWeerOp().catch(() => { /* stil: strip blijft staan */ });
  }
}

start();
