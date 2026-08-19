/*
 * Offline!  —  app-logica
 *
 * Vijf korte schermen (Vandaag, Ontdek, Dagboek, Buurt, Ik) met een vaste
 * balk onderin. Alles wat detail is, komt omhoog in een blad — zo blijft
 * elk scherm kort genoeg om in één blik te overzien.
 */

const STANDAARD = {
  interesses: [],
  plaats: '',
  filters: { tijd: 60, budget: 'gratis', plek: 'egaal', sociaal: 'egaal', energie: 2 },
  favorieten: [],
  gedaan: [],
  gezien: [],
  dagboek: {},
  profiel: { naam: '', foto: '', bio: '', samen: false, straal: 2 },
  plannen: [],
  advertentieToestemming: null,
  account: { uid: '', email: '', naam: '', rechten: {} },
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

/* Lezen en schrijven zit in js/opslag.js; dat is ook de plek waar later het
   account bij komt. Hier staan alleen de twee namen die de rest gebruikt. */

function laad() { return laadState(STANDAARD); }

function bewaar() { bewaarState(state); }

/** Wordt aangeroepen na elke bewaaractie; doet niets zolang er geen cloud is. */
function synchroniseerAlsMogelijk(huidig) {
  if (!cloudActief()) return;
  const gebruiker = huidigeGebruiker();
  if (!gebruiker) return;
  clearTimeout(synchroniseerAlsMogelijk.wacht);
  synchroniseerAlsMogelijk.wacht = setTimeout(() => {
    duwState(gebruiker.uid, huidig).catch(() => { /* volgende keer beter */ });
  }, CLOUD.syncPauze);
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

/** "dinsdag 19 augustus 2026" — voluit, zodat een bladzijde zichzelf verklaart. */
function volleDatum(sleutel) {
  const [j, m, d] = sleutel.split('-').map(Number);
  return new Date(j, m - 1, d).toLocaleDateString('nl-NL',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

/** "19 aug 2026 om 18:42" */
function nettDatumTijd(tijdstip) {
  const d = new Date(tijdstip);
  return `${d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })} om ` +
    d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

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
  if (naam === 'samen') tekenSamen();
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
  verwerkWachtendPlan();
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
  const naam = (state.profiel.naam || '').trim().split(' ')[0];
  $('#vandaagGroet').textContent = naam ? `${groet()}, ${naam}` : groet();
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

  tekenPlanOpVandaag();
  tekenWeerstrip();
}

function tekenPlanOpVandaag() {
  const komend = komendePlannen(state)[0];
  $('#vandaagPlan').innerHTML = komend ? planKaart(komend) : '';
}

function planKaart(plan) {
  const wie = plan.rol === 'gast'
    ? `${veilig(plan.naam || 'Iemand')} nodigde je uit`
    : plan.naam ? 'Jouw uitnodiging' : 'Jouw plan';
  return `
    <button class="plan ${plan.status === 'open' ? 'plan--open' : ''}" data-plan="${plan.id}">
      <span class="plan__wie">${wie}${plan.status === 'open' ? ' · nog niet beantwoord' : ''}</span>
      <span class="plan__titel">${veilig(plan.titel)}</span>
      <span class="plan__wanneer">${veilig(planLabel(plan))}${plan.plaats ? ` · ${veilig(plan.plaats)}` : ''}</span>
    </button>`;
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
    samenVoorkeur: state.profiel.samen,
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
  const kaarten = zichtbareIdeeen().map((s) => ideeKaart(s));
  const reclame = advertentieHtml(state, 'ontdek');
  if (reclame && kaarten.length > ADVERTENTIES.naHoeveelIdeeen) {
    kaarten.splice(ADVERTENTIES.naHoeveelIdeeen, 0, reclame);
  } else if (reclame) {
    kaarten.push(reclame);
  }
  doel.innerHTML = kaarten.join('');
  laadAdvertentieNetwerk(state);
  misschienVraagToestemming();
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
        ${materiaalLinks(a).map((l) =>
          `<a class="chip" href="${l.url}" target="_blank" rel="noopener nofollow sponsored">${veilig(l.label)} ↗</a>`).join('')}
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
      ${magSamen(a) ? `<button class="knop knop--vol" data-samen="${a.id}">Samen doen — nodig iemand uit</button>` : ''}
      ${activiteitLinks(a, state.plaats).map((l) =>
        `<a class="knop knop--vol" href="${l.url}" target="_blank" rel="noopener">${veilig(l.label)} ↗</a>`).join('')}
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
  const nu = new Date();
  state.gedaan = [{
    id: timerData.id, titel: timerData.titel, minuten,
    datum: dagSleutel(nu),
    tijd: `${String(nu.getHours()).padStart(2, '0')}:${String(nu.getMinutes()).padStart(2, '0')}`,
    bijgewerkt: Date.now()
  }, ...state.gedaan].slice(0, 500);
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
  $('#dagVolleDatum').textContent = volleDatum(dagHuidig);
  const nr = paginaNummer(state, dagHuidig);
  $('#dagNummer').textContent = nr ? `bladzijde ${nr}` : 'nieuwe bladzijde';
  $('#dagVolgende').disabled = dagHuidig >= dagSleutel();

  pagina.dank.forEach((tekst, i) => { $(`#dank${i}`).value = tekst; });
  $('#dagNotitie').value = pagina.notitie;
  $('#stemmingen').innerHTML = STEMMINGEN.map((s) =>
    `<button class="stemming ${pagina.stemming === s.waarde ? 'is-aan' : ''}" data-stemming="${s.waarde}"
      title="${s.naam}" aria-label="${s.naam}">${s.emoji}</button>`).join('');

  const gedaan = activiteitenOp(state, dagHuidig);
  const gepland = plannenOp(state, dagHuidig);
  const minuten = gedaan.reduce((som, g) => som + g.minuten, 0);

  const regels = gedaan.map((g) =>
    `<div class="logregel">
       <div>${g.tijd ? `<b class="logregel__tijd">${veilig(g.tijd)}</b> ` : ''}${veilig(g.titel)}</div>
       <span>${g.minuten} min</span>
     </div>`).join('')
    + gepland.map((p) =>
      `<div class="logregel">
         <div>${p.tijd ? `<b class="logregel__tijd">${veilig(p.tijd)}</b> ` : ''}${veilig(p.titel)}</div>
         <span>gepland${p.naam ? ` · met ${veilig(p.naam)}` : ''}</span>
       </div>`).join('');

  $('#dagActiviteiten').innerHTML = regels
    ? regels + (minuten ? `<p class="uitleg">Samen ${meervoud(minuten, 'minuut', 'minuten')} zonder telefoon.</p>` : '')
    : '<p class="uitleg">Nog niets gelogd. Wat je afrondt met de timer komt hier vanzelf te staan.</p>';

  $('#dagGeschreven').textContent = pagina.bijgewerkt
    ? `Geschreven op ${nettDatumTijd(pagina.bijgewerkt)}`
    : '';
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
  const bewaard = leesPagina(state, dagHuidig).bijgewerkt;
  $('#dagGeschreven').textContent = bewaard ? `Geschreven op ${nettDatumTijd(bewaard)}` : '';
  $('#dagNummer').textContent = paginaNummer(state, dagHuidig)
    ? `bladzijde ${paginaNummer(state, dagHuidig)}` : 'nieuwe bladzijde';
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
        data-dag="${sleutel}">
        <div>${stem} ${veilig(datumLabel(sleutel))}<br><span class="uitleg">${veilig(sleutel)}</span></div>
        <span>${stukjes.join(' · ') || 'leeg'}</span></button>`;
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

/* ═══════════════════════════════════════════════ samen ══ */

let buurtCache = [];

function tekenSamen() {
  const plannen = komendePlannen(state);
  $('#plannenLijst').innerHTML = plannen.length
    ? `<div class="lijst">${plannen.map(planKaart).join('')}</div>`
    : `<div class="kaart kaart--zacht">
         <b>Samen is leuker</b>
         <span class="uitleg">Kies een idee en stuur iemand een uitnodiging. Dat is één link —
           de ander hoeft geen account, alleen deze app.</span>
         <button class="knop knop--primair knop--vol" id="knopEersteUitnodiging">Nodig iemand uit</button>
       </div>`;

  const eerste = $('#knopEersteUitnodiging');
  if (eerste) eerste.addEventListener('click', kiesSamenActiviteit);

  $('#buurtPlaats').value = $('#buurtPlaats').value || state.plaats;
  const plaats = ($('#buurtPlaats').value || state.plaats || '').trim();
  buurtCache = buurtTips(plaats, state.interesses);

  $('#buurtRooster').innerHTML = buurtCache.map((t, i) => `
    <button class="tegel" data-buurt="${i}" style="border-left:5px solid ${t.relevant ? 'var(--perzik-diep)' : 'var(--lucht-diep)'}">
      <span class="tegel__emoji">${t.emoji}</span>
      <span class="tegel__titel">${veilig(t.titel)}</span>
      <span class="tegel__sub">${veilig(t.tekst)}</span>
    </button>`).join('');

  $('#samenReclame').innerHTML = advertentieHtml(state, 'samen');
  laadAdvertentieNetwerk(state);

  const aanmeld = partnerAanmeldLink(plaats);
  $('#buurtPartner').innerHTML = PARTNERS.length
    ? PARTNERS.map((p) => `<div class="kaart"><b>${veilig(p.naam)}</b><span class="uitleg">${veilig(p.tekst)}</span>
        <a class="knop knop--primair knop--vol" href="${p.url}" target="_blank" rel="noopener sponsored">Bekijk ↗</a>
        <span class="uitleg">Betaalde plaatsing</span></div>`).join('')
    : `<div class="kaart">
         <b>Organiseer je zelf iets in ${veilig(plaats || 'de buurt')}?</b>
         <span class="uitleg">Workshops, clubs en cursussen kunnen hier opvallen voor mensen die
           precies daarnaar op zoek zijn.</span>
         ${aanmeld ? `<a class="knop knop--vol" href="${aanmeld}">Meld je aan als partner</a>` : ''}
       </div>`;
}

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
  tekenSamen();
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
    tekenSamen();
  } catch (fout) {
    toost(fout.message);
  }
});

$('#knopNieuwPlan').addEventListener('click', kiesSamenActiviteit);

/** Stap 1: waarvoor nodig je iemand uit? */
function kiesSamenActiviteit() {
  const lijst = suggesties(opties({ sociaal: 'samen' })).slice(0, 6);
  openBlad('Wat gaan jullie doen?', lijst.length
    ? `<div class="lijst">${lijst.map((s) => ideeKaart(s)).join('')}</div>
       <p class="uitleg">Kies een idee; in het volgende scherm zet je de dag en de plek erbij.</p>`
    : '<p class="leeg">Verruim je filters bij Ontdek, dan vind ik iets om samen te doen.</p>');
}

/** Stap 2: wanneer en waar? */
function openUitnodiging(activiteitId) {
  const a = ACTIVITEITEN.find((x) => x.id === activiteitId);
  if (!a) return;
  const morgen = verschuifDag(dagSleutel(), 1);

  openBlad('Nodig iemand uit', `
    <p>Voor <b>${veilig(a.titel)}</b>.</p>
    <div class="blad__veld"><span>Wanneer</span>
      <div class="zoekrij">
        <input type="date" class="invoer" id="planDatum" value="${morgen}" min="${dagSleutel()}">
        <input type="time" class="invoer" id="planTijd" value="14:00">
      </div>
    </div>
    <div class="blad__veld"><span>Waar spreken jullie af?</span>
      <input class="invoer" id="planPlaats" value="${veilig(state.plaats)}" placeholder="Bijv. bij mij thuis">
    </div>
    <div class="blad__veld"><span>Berichtje erbij (mag leeg)</span>
      <input class="invoer" id="planNotitie" placeholder="Zin om mee te doen?" maxlength="240">
    </div>
    <div class="knoprij"><button class="knop knop--primair knop--vol" id="planMaak">Maak de uitnodiging</button></div>
    <p class="uitleg">Je krijgt een link om te versturen. Daar staat alleen in wat je hier invult —
      er gaat niets naar een server.</p>`);

  $('#planMaak').addEventListener('click', () => {
    const plan = maakPlan({
      activiteitId: a.id, titel: a.titel,
      datum: $('#planDatum').value || morgen,
      tijd: $('#planTijd').value,
      plaats: $('#planPlaats').value.trim(),
      notitie: $('#planNotitie').value.trim(),
      naam: state.profiel.naam.trim()
    });
    bewaarPlan(state, plan);
    bewaar();
    toonDeelblad(plan);
    tekenVandaag();
  });
}

/** Stap 3: versturen. */
function toonDeelblad(plan) {
  const link = uitnodigingsLink(plan);
  openBlad('Klaar om te versturen', `
    ${planKaart(plan)}
    <div class="knoprij">
      <button class="knop knop--primair knop--vol" id="planDeel">Versturen…</button>
      <button class="knop knop--vol" id="planKopieer">Kopieer de link</button>
    </div>
    <div class="blad__veld"><span>De link</span>
      <input class="invoer" id="planLink" value="${veilig(link)}" readonly></div>
    <p class="uitleg">Stuur hem via WhatsApp, Signal of sms. Wie hem opent ziet jouw uitnodiging
      ${plan.naam ? `van ${veilig(plan.naam)} ` : ''}in zijn eigen app staan.</p>`);

  $('#planDeel').addEventListener('click', async () => {
    const tekst = `${plan.titel} — ${planLabel(plan)}${plan.plaats ? ` bij ${plan.plaats}` : ''}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Offline! samen doen', text: tekst, url: link });
      else await kopieerLink(link);
    } catch { /* gebruiker brak het delen af */ }
  });
  $('#planKopieer').addEventListener('click', () => kopieerLink(link));
}

async function kopieerLink(link) {
  try {
    await navigator.clipboard.writeText(link);
    toost('Link gekopieerd');
  } catch {
    const veld = $('#planLink');
    if (veld) { veld.select(); toost('Kopieer de link uit het veld'); }
  }
}

/** Een uitnodiging die via een link binnenkomt. */
function toonBinnenkomendePlan(plan) {
  openBlad('Je bent uitgenodigd', `
    <p><b>${veilig(plan.naam || 'Iemand')}</b> vraagt of je meedoet:</p>
    ${planKaart(plan)}
    ${plan.notitie ? `<p class="uitleg">“${veilig(plan.notitie)}”</p>` : ''}
    <div class="knoprij">
      <button class="knop knop--primair knop--vol" id="planJa">Ja, ik doe mee</button>
      <button class="knop knop--stil knop--vol" id="planNee">Nu even niet</button>
    </div>
    <p class="uitleg">Zeg je ja, dan staat het in je plannen en op de bladzijde van die dag.
      Laat het de ander zelf even weten — de app stuurt niets rond.</p>`);

  $('#planJa').addEventListener('click', () => {
    plan.status = 'gaat';
    bewaarPlan(state, plan);
    bewaar();
    sluitBlad();
    naarScherm('samen');
    toost('Staat in je plannen');
  });
  $('#planNee').addEventListener('click', sluitBlad);
}

/** Een plan dat al in je lijst staat. */
function openPlan(id) {
  const plan = (state.plannen || []).find((p) => p.id === id);
  if (!plan) return;
  openBlad(plan.titel, `
    ${planKaart(plan)}
    ${plan.notitie ? `<p class="uitleg">“${veilig(plan.notitie)}”</p>` : ''}
    <div class="knoprij">
      ${plan.rol === 'ik' ? `<button class="knop knop--primair knop--vol" data-deel="${plan.id}">Stuur de link nog eens</button>` : ''}
      ${plan.activiteitId ? `<button class="knop knop--vol" data-idee="${plan.activiteitId}">Bekijk het idee</button>` : ''}
      <button class="knop knop--stil knop--vol" data-planweg="${plan.id}">Haal uit mijn plannen</button>
    </div>`);
}

document.addEventListener('click', (e) => {
  const samen = e.target.closest('[data-samen]');
  if (samen) { openUitnodiging(samen.dataset.samen); return; }

  const plan = e.target.closest('[data-plan]');
  if (plan) { openPlan(plan.dataset.plan); return; }

  const deel = e.target.closest('[data-deel]');
  if (deel) {
    const p = (state.plannen || []).find((x) => x.id === deel.dataset.deel);
    if (p) toonDeelblad(p);
    return;
  }

  const weg = e.target.closest('[data-planweg]');
  if (weg) {
    verwijderPlan(state, weg.dataset.planweg);
    bewaar();
    sluitBlad();
    tekenSamen();
    tekenVandaag();
    tekenDagboek();
    toost('Uit je plannen gehaald');
  }
});

/* ══════════════════════════════════════════════════ ik ══ */

function tekenIk() {
  const minuten = state.gedaan.reduce((som, g) => som + (g.minuten || 0), 0);
  $('#cijfers').innerHTML = `
    <div class="cijfer"><b>${minuten}</b><span>${minuten === 1 ? 'minuut' : 'minuten'} offline</span></div>
    <div class="cijfer"><b>${state.gedaan.length}</b><span>gedaan</span></div>
    <div class="cijfer"><b>${reeks(state)}</b><span>${reeks(state) === 1 ? 'dag' : 'dagen'} op rij</span></div>`;

  $('#interesseSamenvatting').textContent = state.interesses.length
    ? `${meervoud(state.interesses.length, 'interesse', 'interesses')} ›`
    : 'kies je smaak ›';

  $('#plaatsInput').value = state.plaats;
  $('#knopInstalleer').hidden = !installPrompt;
  tekenProfiel();
  tekenAccountKaart();
  tekenPlusKaart();
}

/* ═══════════════════════════════════════ account & back-up ══ */

function tekenAccountKaart() {
  const gebruiker = cloudActief() ? huidigeGebruiker() : null;

  $('#accountStatus').textContent = gebruiker
    ? `Ingelogd als ${gebruiker.email}. Je gegevens staan ook in de cloud.`
    : 'Alles staat op dit toestel. Maak een back-up voordat je van telefoon wisselt.';

  // De inlogknop verschijnt pas als er een aanbieder is ingesteld (js/cloud.js).
  $('#accountKnoppen').innerHTML = !cloudActief() ? ''
    : gebruiker
      ? '<button class="knop knop--vol knop--stil" id="knopUitloggen">Uitloggen</button>'
      : '<button class="knop knop--primair knop--vol" id="knopInloggen">Inloggen met Google</button>';

  const inlog = $('#knopInloggen');
  if (inlog) inlog.addEventListener('click', async () => {
    try {
      await meldAanMetGoogle();
      hertekenAlles();
    } catch (fout) { toost(fout.message); }
  });

  const uitlog = $('#knopUitloggen');
  if (uitlog) uitlog.addEventListener('click', async () => {
    try {
      await meldAf();
      state.account = { uid: '', email: '', naam: '', rechten: {} };
      bewaar();
      hertekenAlles();
    } catch (fout) { toost(fout.message); }
  });

  const melding = $('#opslagMelding');
  melding.hidden = !opslagBijnaVol();
  if (!melding.hidden) {
    melding.textContent = 'Je opslag raakt vol. Maak een back-up en overweeg oude bladzijden te bewaren in dat bestand.';
  }
}

$('#knopBackup').addEventListener('click', async () => {
  const gelukt = await bewaarBestand(backupBestandsnaam(), maakBackup(state), 'application/json');
  if (gelukt) toost('Back-up gemaakt');
});

$('#knopHerstel').addEventListener('click', () => $('#backupInvoer').click());

$('#backupInvoer').addEventListener('change', async (e) => {
  const bestand = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!bestand) return;
  try {
    const backup = leesBackup(await bestand.text());
    const telling = voegSamen(state, backup, true);   // eerst alleen tellen
    toonHerstelBlad(backup, telling);
  } catch (fout) {
    toost(fout.message);
  }
});

function toonHerstelBlad(backup, telling) {
  const gemaakt = new Date(backup.gemaakt);
  openBlad('Back-up terugzetten', `
    <p class="uitleg">Gemaakt op ${gemaakt.toLocaleDateString('nl-NL')} om
      ${gemaakt.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}.</p>
    <div class="kaart kaart--zacht">
      <b>${veilig(tellingInWoorden(telling))}</b>
      <span class="uitleg">Wat je hier al hebt, blijft staan. Van een dag die in allebei
        beschreven is, houden we de nieuwste versie.</span>
    </div>
    <div class="knoprij">
      <button class="knop knop--primair knop--vol" id="herstelDoor">Voeg samen</button>
      <button class="knop knop--stil knop--vol" data-sluit>Annuleer</button>
    </div>`);

  $('#herstelDoor').addEventListener('click', () => {
    voegSamen(state, backup);
    bewaar();
    sluitBlad();
    dagHuidig = dagSleutel();
    hertekenAlles();
    tekenDagboek();
    toost('Back-up samengevoegd');
  });
}

/**
 * Schrijft een bestand weg. In de gewone app is dat een download; draait de
 * app in een omgeving die downloads afhandelt (zoals de preview), dan gaat
 * het daarlangs.
 */
async function bewaarBestand(naam, inhoud, type = 'text/plain;charset=utf-8') {
  const viaOmgeving = window.claude && typeof window.claude.use === 'function'
    ? await window.claude.use('downloads').catch(() => null)
    : null;
  if (viaOmgeving) {
    try {
      await viaOmgeving.save({ filename: naam, data: inhoud });
      return true;
    } catch (fout) {
      toost(fout && fout.code === 'declined' ? 'Opslaan geannuleerd' : 'Opslaan lukte niet');
      return false;
    }
  }
  const url = URL.createObjectURL(new Blob([inhoud], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = naam;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

function tekenProfiel() {
  const p = state.profiel;
  $('#naamInput').value = p.naam;
  $('#bioInput').value = p.bio;
  $('#avatarInhoud').innerHTML = p.foto
    ? `<img src="${p.foto}" alt="Jouw profielfoto">`
    : veilig(initialen(p.naam));
  $('#knopFotoWeg').hidden = !p.foto;

  $('#samenAan').checked = Boolean(p.samen);
  $('#samenStraal').hidden = !p.samen;
  $$('[data-veld-straal] .chip').forEach((c) =>
    c.classList.toggle('is-aan', Number(c.dataset.waarde) === p.straal));
}

$('#avatarKnop').addEventListener('click', () => $('#fotoInvoer').click());

$('#fotoInvoer').addEventListener('change', async (e) => {
  const bestand = e.target.files && e.target.files[0];
  if (!bestand) return;
  try {
    state.profiel.foto = await verkleinFoto(bestand);
    bewaar();
    tekenProfiel();
    toost('Foto opgeslagen op dit toestel');
  } catch (fout) {
    toost(fout.message);
  }
  e.target.value = '';
});

$('#knopFotoWeg').addEventListener('click', () => {
  state.profiel.foto = '';
  bewaar();
  tekenProfiel();
});

$('#knopProfielBewaar').addEventListener('click', () => {
  state.profiel.naam = $('#naamInput').value.trim();
  state.profiel.bio = $('#bioInput').value.trim();
  bewaar();
  tekenProfiel();
  tekenVandaag();
  toost('Profiel opgeslagen');
});

$('#samenAan').addEventListener('change', (e) => {
  state.profiel.samen = e.target.checked;
  bewaar();
  $('#samenStraal').hidden = !state.profiel.samen;
  tekenOntdek();
  tekenVandaag();
  toost(state.profiel.samen ? 'Je krijgt nu vaker ideeën om samen te doen' : 'Weer alle ideeën door elkaar');
});

$('[data-veld-straal]').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  state.profiel.straal = Number(chip.dataset.waarde);
  bewaar();
  tekenProfiel();
});

$('#knopInteresses').addEventListener('click', () => {
  openBlad('Wat je leuk vindt', `
    <p class="uitleg">Hoe meer je aanvinkt, hoe persoonlijker de suggesties.</p>
    <div class="chips chips--wikkel">
      ${INTERESSES.map((i) => `<button class="chip ${state.interesses.includes(i.id) ? 'is-aan' : ''}"
        data-mijn-interesse="${i.id}">${i.emoji} ${veilig(i.label)}</button>`).join('')}
    </div>
    <button class="knop knop--primair knop--vol" data-sluit>Klaar</button>`);
});

document.addEventListener('click', (e) => {
  const knop = e.target.closest('[data-mijn-interesse]');
  if (!knop) return;
  const id = knop.dataset.mijnInteresse;
  state.interesses = state.interesses.includes(id)
    ? state.interesses.filter((x) => x !== id) : [...state.interesses, id];
  knop.classList.toggle('is-aan');
  bewaar();
  tekenIk();
  tekenOntdek();
  tekenVandaag();
});

$('#knopPlaatsOpslaan').addEventListener('click', () => {
  state.plaats = $('#plaatsInput').value.trim();
  bewaar();
  weer = null;
  toost(state.plaats ? `Bewaard: ${state.plaats}` : 'Plaats gewist');
});

$('#knopWissen').addEventListener('click', () => {
  const bladzijden = Object.keys(state.dagboek).length;
  const heeftIets = bladzijden || state.gedaan.length || state.plannen.length || state.profiel.naam;

  openBlad('Alles verwijderen', `
    <p>Dit wist alles wat de app van je weet, op dit toestel:</p>
    <div class="kaart">
      <div class="logregel"><div>Dagboekbladzijden</div><span>${bladzijden}</span></div>
      <div class="logregel"><div>Afgeronde activiteiten</div><span>${state.gedaan.length}</span></div>
      <div class="logregel"><div>Plannen</div><span>${state.plannen.length}</span></div>
      <div class="logregel"><div>Bewaarde ideeën</div><span>${state.favorieten.length}</span></div>
      <div class="logregel"><div>Profiel${state.profiel.foto ? ' en foto' : ''}</div>
        <span>${state.profiel.naam ? veilig(state.profiel.naam) : '—'}</span></div>
    </div>
    <p class="uitleg">Er staat niets van jou op een server, dus hierna is het echt weg —
      wij kunnen het niet terughalen.</p>
    <div class="knoprij">
      ${heeftIets ? '<button class="knop knop--primair knop--vol" id="wisEerstBackup">Maak eerst een back-up</button>' : ''}
      <button class="knop knop--vol" id="wisDoor">Verwijder alles</button>
      <button class="knop knop--stil knop--vol" data-sluit>Annuleer</button>
    </div>`);

  const backupKnop = $('#wisEerstBackup');
  if (backupKnop) backupKnop.addEventListener('click', async () => {
    const gelukt = await bewaarBestand(backupBestandsnaam(), maakBackup(state), 'application/json');
    if (gelukt) toost('Back-up gemaakt — je kunt nu veilig verwijderen');
  });

  $('#wisDoor').addEventListener('click', async () => {
    // Is er ooit een account gekoppeld, dan hoort het daar ook weg te gaan.
    const gebruiker = cloudActief() ? huidigeGebruiker() : null;
    if (gebruiker) {
      try {
        await verwijderAccount(gebruiker.uid);
      } catch (fout) {
        toost(fout.message);
        return;
      }
    }
    wisAlles();
    state = laad();
    weer = null;
    dagHuidig = dagSleutel();
    sluitBlad();
    toonWizard();
    toost('Alles verwijderd');
  });
});

$('#knopPrivacy').addEventListener('click', () => {
  openBlad('Privacy en je gegevens', `
    <div class="kaart kaart--zacht">
      <b>Je gegevens staan op dit toestel.</b>
      <span class="uitleg">Geen account, geen server van ons, geen analytics en geen trackers.</span>
    </div>
    <div class="blad__veld"><span>Wat er wordt opgeslagen</span>
      <p class="uitleg">Je profiel, interesses en plaats, je dagboek, wat je afrondde, je plannen
        en of Offline+ actief is. Alles in de opslag van je browser. Wij kunnen daar niet bij.</p>
    </div>
    <div class="blad__veld"><span>Wat er naar buiten gaat — en alleen als jij iets doet</span>
      <p class="uitleg">
        • het weerbericht (je plaats of coördinaten naar Open-Meteo)<br>
        • de plaatsnaam bij je locatie, als je op 📍 tikt<br>
        • zoek- en winkellinks, pas als je erop tikt<br>
        • je licentiesleutel, als je Offline+ activeert<br>
        • advertenties: nu niets; komt er een netwerk, dan vragen we eerst toestemming
      </p>
    </div>
    <div class="blad__veld"><span>Uitnodigingen</span>
      <p class="uitleg">Een uitnodiging is een link die jij zelf verstuurt. Daarin staat alleen wat je
        invulde. Iedereen die de link krijgt kan hem lezen en doorsturen, dus zet er niets in
        wat niet bij een ander mag komen.</p>
    </div>
    <div class="blad__veld"><span>Verwijderen</span>
      <p class="uitleg">Met "Alles verwijderen" hierboven is het in één keer weg, inclusief je foto
        en de apparaatsleutel. Wij hoeven daarna niets te wissen — wij hadden het niet.</p>
    </div>
    <button class="knop knop--vol" id="privacyVolledig">Lees de hele verklaring ↗</button>`);

  $('#privacyVolledig').addEventListener('click', () => {
    window.open('https://github.com/MartinusHH/Experimentation/blob/main/docs/privacy.md', '_blank', 'noopener');
  });
});

$('#knopExport').addEventListener('click', async () => {
  if (!heeftPlus(state)) return openPlusBlad();
  const gelukt = await bewaarBestand(`offline-dagboek-${dagSleutel()}.txt`, exporteerDagboek(state));
  if (gelukt) toost('Dagboek geëxporteerd');
});

/* ═════════════════════════════════════════════ Offline+ ══ */

/** Na een wijziging die overal doorwerkt (plan, profiel, advertenties). */
function hertekenAlles() {
  tekenVandaag(); tekenOntdek(); tekenSamen(); tekenIk();
}

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
      hertekenAlles();
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
      hertekenAlles();
      toost(uitslag.test ? 'Testperiode van 30 dagen geactiveerd' : 'Offline+ is actief. Dank je wel!');
    } catch (fout) {
      melding.textContent = fout.message;
    }
  });
}

/* ═══════════════════════════════════════ advertenties ══ */

let toestemmingGevraagd = false;

/**
 * Een advertentienetwerk zet cookies, dus dat vragen we eerst. Zolang er geen
 * netwerk is ingesteld gebeurt hier niets en zie je alleen eigen advertenties.
 */
function misschienVraagToestemming() {
  if (toestemmingGevraagd || !ADVERTENTIES.actief || !ADVERTENTIES.netwerk) return;
  if (heeftPlus(state) || advertentieToestemming(state)) return;
  toestemmingGevraagd = true;

  openBlad('Advertenties', `
    <p>De gratis versie wordt betaald met advertenties. Het netwerk dat ze levert
      gebruikt daarvoor cookies.</p>
    <div class="knoprij">
      <button class="knop knop--primair knop--vol" data-toestemming="ja">Dat is goed</button>
      <button class="knop knop--vol" data-toestemming="nee">Liever niet</button>
      <button class="knop knop--stil knop--vol" data-plus>Liever helemaal geen advertenties (Offline+)</button>
    </div>
    <p class="uitleg">Zeg je nee, dan zie je alleen advertenties die wij zelf plaatsen —
      zonder cookies en zonder dat er iets over jou wordt doorgegeven.</p>`);
}

document.addEventListener('click', (e) => {
  const knop = e.target.closest('[data-toestemming]');
  if (!knop) return;
  zetAdvertentieToestemming(state, knop.dataset.toestemming);
  bewaar();
  sluitBlad();
  tekenOntdek();
  tekenSamen();
  toost(knop.dataset.toestemming === 'ja' ? 'Dank je — dit houdt de app gratis' : 'Genoteerd');
});

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

let wachtendPlan = planUitLink(location.hash);

function verwerkWachtendPlan() {
  if (!wachtendPlan) return;
  const plan = wachtendPlan;
  wachtendPlan = null;
  history.replaceState(null, '', location.pathname + location.search);
  setTimeout(() => toonBinnenkomendePlan(plan), 400);
}

function start() {
  if (!state.onboarding) {
    toonWizard();
  } else {
    naarScherm('vandaag');
    verwerkWachtendPlan();
    if (state.plaats) haalWeerOp().catch(() => { /* stil: strip blijft staan */ });
  }
}

start();
