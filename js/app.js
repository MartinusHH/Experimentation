/*
 * Offline!  —  app-logica
 *
 * Houdt het profiel bij (in localStorage), tekent de schermen en
 * verbindt de suggestie-motor met het weerbericht en de buurt-tips.
 */

const OPSLAG_SLEUTEL = 'offline-app-v1';

const STANDAARD = {
  interesses: [],
  plaats: '',
  filters: { tijd: 60, budget: 'gratis', plek: 'egaal', sociaal: 'egaal', energie: 2 },
  favorieten: [],
  gedaan: [],
  gezien: []
};

let state = laad();
let weerCache = null;      // laatst opgehaalde weer
let toon = 4;              // aantal zichtbare suggesties
let laatsteLijst = [];
let timerData = null;

/* ═════════════════════════════════════════════════ opslag ══ */

function laad() {
  try {
    const ruw = localStorage.getItem(OPSLAG_SLEUTEL);
    return ruw ? { ...STANDAARD, ...JSON.parse(ruw) } : { ...STANDAARD };
  } catch {
    return { ...STANDAARD };
  }
}

function bewaar() {
  try { localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(state)); } catch { /* privémodus */ }
}

/* ═════════════════════════════════════════════════ helpers ══ */

const $  = (sel, wortel = document) => wortel.querySelector(sel);
const $$ = (sel, wortel = document) => Array.from(wortel.querySelectorAll(sel));

const KLEUR_PER_INTERESSE = {
  kleding: 'var(--roze)', kunst: 'var(--lila-diep)', koken: 'var(--perzik-diep)',
  tuin: 'var(--mint-diep)', klussen: 'var(--boter)', muziek: 'var(--lila-diep)',
  schrijven: 'var(--lucht-diep)', fotografie: 'var(--lucht-diep)', sport: 'var(--mint-diep)',
  natuur: 'var(--mint-diep)', techniek: 'var(--lucht-diep)', spellen: 'var(--perzik-diep)',
  lezen: 'var(--boter)', sociaal: 'var(--perzik-diep)', huis: 'var(--mint-diep)',
  dieren: 'var(--boter)', welzijn: 'var(--lila-diep)', cultuur: 'var(--roze)'
};

function veilig(tekst) {
  const d = document.createElement('div');
  d.textContent = tekst;
  return d.innerHTML;
}

function vandaagISO() { return new Date().toISOString().slice(0, 10); }

/** 1 minuut, 2 minuten — kleine dingen die het minder robotachtig maken. */
function meervoud(aantal, enkel, meer) { return `${aantal} ${aantal === 1 ? enkel : meer}`; }

/* ═════════════════════════════════════════════════ tabs ══ */

function naarTab(naam) {
  $$('.tab').forEach((t) => t.classList.toggle('is-actief', t.dataset.tab === naam));
  $$('.paneel').forEach((p) => p.classList.toggle('is-actief', p.id === `paneel-${naam}`));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (naam === 'logboek') tekenLogboek();
  if (naam === 'buurt') tekenBuurt();
}

$('#tabs').addEventListener('click', (e) => {
  const knop = e.target.closest('.tab');
  if (knop) naarTab(knop.dataset.tab);
});

document.addEventListener('click', (e) => {
  const ga = e.target.closest('[data-ga-naar]');
  if (ga) { e.preventDefault(); naarTab(ga.dataset.gaNaar); }
});

/* ═══════════════════════════════════════════ kop & stats ══ */

function tekenStats() {
  const minuten = state.gedaan.reduce((som, g) => som + (g.minuten || 0), 0);
  const dagen = new Set(state.gedaan.map((g) => g.datum)).size;
  $('#kopStats').innerHTML = `
    <div class="stat"><b>${minuten}</b><span>${minuten === 1 ? 'minuut' : 'minuten'} offline</span></div>
    <div class="stat"><b>${state.gedaan.length}</b><span>gedaan</span></div>
    <div class="stat"><b>${dagen}</b><span>${dagen === 1 ? 'actieve dag' : 'actieve dagen'}</span></div>`;
}

/* ══════════════════════════════════════════════ profiel ══ */

function tekenInteresses() {
  $('#interesseKeuze').innerHTML = INTERESSES.map((i) => `
    <button class="chip ${state.interesses.includes(i.id) ? 'is-aan' : ''}" data-interesse="${i.id}">
      ${i.emoji} ${veilig(i.label)}
    </button>`).join('');
}

$('#interesseKeuze').addEventListener('click', (e) => {
  const knop = e.target.closest('[data-interesse]');
  if (!knop) return;
  const id = knop.dataset.interesse;
  state.interesses = state.interesses.includes(id)
    ? state.interesses.filter((x) => x !== id)
    : [...state.interesses, id];
  knop.classList.toggle('is-aan');
  bewaar();
  toonWelkom();
});

$('#knopPlaatsOpslaan').addEventListener('click', () => {
  state.plaats = $('#plaatsInput').value.trim();
  bewaar();
  $('#plaatsStatus').textContent = state.plaats
    ? `Bewaard: ${state.plaats}. Het weerbericht en de buurt-tips gebruiken dit nu.`
    : 'Plaats gewist.';
  $('#buurtPlaats').value = state.plaats;
});

$('#knopWissen').addEventListener('click', () => {
  if (!confirm('Weet je het zeker? Je interesses, favorieten en logboek worden gewist.')) return;
  state = { ...STANDAARD, filters: { ...STANDAARD.filters } };
  try { localStorage.removeItem(OPSLAG_SLEUTEL); } catch { /* niets */ }
  $('#plaatsInput').value = '';
  $('#buurtPlaats').value = '';
  tekenInteresses(); tekenStats(); tekenSuggesties(); toonWelkom();
  $('#plaatsStatus').textContent = 'Alles gewist.';
});

function toonWelkom() {
  $('#welkom').hidden = state.interesses.length > 0;
}

/* ══════════════════════════════════════════════ filters ══ */

$$('.chips[data-filter]').forEach((groep) => {
  const sleutel = groep.dataset.filter;
  // zet de opgeslagen keuze aan
  $$('.chip', groep).forEach((chip) => {
    const waarde = sleutel === 'tijd' || sleutel === 'energie' ? Number(chip.dataset.waarde) : chip.dataset.waarde;
    chip.classList.toggle('is-aan', state.filters[sleutel] === waarde);
  });
  groep.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', groep).forEach((c) => c.classList.remove('is-aan'));
    chip.classList.add('is-aan');
    const waarde = chip.dataset.waarde;
    state.filters[sleutel] = (sleutel === 'tijd' || sleutel === 'energie') ? Number(waarde) : waarde;
    bewaar();
    tekenSuggesties();
  });
});

/* ═══════════════════════════════════════════ suggesties ══ */

function huidigeOpties(extra = {}) {
  return {
    interesses: state.interesses,
    ...state.filters,
    weer: weerCache,
    vermijd: state.gezien.slice(-6),
    favorieten: state.favorieten,
    ...extra
  };
}

function tekenSuggesties() {
  laatsteLijst = suggesties(huidigeOpties());
  const doel = $('#suggestieLijst');

  if (!laatsteLijst.length) {
    doel.innerHTML = `<p class="leeg">Met deze combinatie vind ik niets. Probeer wat meer tijd,
      een groter budget of "maakt niet uit" bij binnen/buiten.</p>`;
    $('#knopMeer').hidden = true;
    return;
  }

  doel.innerHTML = laatsteLijst.slice(0, toon).map(kaartHtml).join('');
  $('#knopMeer').hidden = toon >= laatsteLijst.length;
  tekenWeerhint();
}

function kaartHtml({ activiteit: a, redenen, raak }) {
  const kleur = KLEUR_PER_INTERESSE[raak[0] || a.interesses[0]] || 'var(--mint-diep)';
  const isFavoriet = state.favorieten.includes(a.id);
  const link = zoekLink(a, state.plaats);

  const labels = redenen.map((r) => {
    const soort = /Gratis/.test(r) ? ' label--gratis'
      : /weer|buiten/i.test(r) ? ' label--weer'
      : /min|uur/.test(r) ? ' label--tijd' : '';
    return `<span class="label${soort}">${veilig(r)}</span>`;
  }).join('');

  return `
  <article class="idee" style="--kleurstreep:${kleur}" data-id="${a.id}">
    <div class="idee__kop">
      <div>
        <h3 class="idee__titel">${veilig(a.titel)}</h3>
      </div>
      <button class="hart ${isFavoriet ? 'is-aan' : ''}" data-favoriet="${a.id}"
        title="Bewaar voor later" aria-label="Bewaar voor later">${isFavoriet ? '💖' : '🤍'}</button>
    </div>
    <p class="idee__pitch">${veilig(a.pitch)}</p>
    <div class="idee__redenen">${labels}</div>
    ${a.benodigdheden.length ? `<p class="idee__detail"><b>Nodig:</b> ${veilig(a.benodigdheden.join(', '))}</p>` : ''}
    <div class="idee__stap"><b>Eerste stap:</b> ${veilig(a.eersteStap)}</div>
    <div class="idee__acties">
      <button class="knop knop--primair knop--klein" data-start="${a.id}">Ik ga dit doen</button>
      ${a.zoek ? `<a class="knop knop--klein" href="${link}" target="_blank" rel="noopener">Zoek uitleg ↗</a>` : ''}
      <button class="knop knop--stil knop--klein" data-anders="${a.id}">Iets anders</button>
    </div>
  </article>`;
}

$('#suggestieLijst').addEventListener('click', (e) => {
  const fav = e.target.closest('[data-favoriet]');
  if (fav) {
    const id = fav.dataset.favoriet;
    state.favorieten = state.favorieten.includes(id)
      ? state.favorieten.filter((x) => x !== id)
      : [...state.favorieten, id];
    fav.classList.toggle('is-aan');
    fav.textContent = state.favorieten.includes(id) ? '💖' : '🤍';
    bewaar();
    return;
  }

  const start = e.target.closest('[data-start]');
  if (start) { startTimer(start.dataset.start); return; }

  const anders = e.target.closest('[data-anders]');
  if (anders) {
    state.gezien = [...state.gezien, anders.dataset.anders].slice(-20);
    bewaar();
    tekenSuggesties();
  }
});

$('#knopSuggesties').addEventListener('click', () => { toon = 4; tekenSuggesties(); });
$('#knopMeer').addEventListener('click', () => { toon += 4; tekenSuggesties(); });

$('#knopVerras').addEventListener('click', () => {
  const alles = suggesties(huidigeOpties());
  if (!alles.length) { tekenSuggesties(); return; }
  const keuze = alles[Math.floor(Math.random() * Math.min(12, alles.length))];
  laatsteLijst = [keuze];
  toon = 1;
  $('#suggestieLijst').innerHTML = kaartHtml(keuze);
  $('#knopMeer').hidden = true;
});

/* ═══════════════════════════════════════════════ timer ══ */

function startTimer(id) {
  const a = ACTIVITEITEN.find((x) => x.id === id);
  if (!a) return;
  const minuten = Math.min(a.tijd, state.filters.tijd);
  timerData = { id, titel: a.titel, eind: Date.now() + minuten * 60000, start: Date.now() };

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
  $('#timerKlok').textContent = uren
    ? `${uren}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  if (over === 0) $('#timerKlok').textContent = 'Klaar! 🎉';
}

function stopTimer() {
  if (timerData && timerData.interval) clearInterval(timerData.interval);
  timerData = null;
  $('#timer').hidden = true;
}

$('#timerKlaar').addEventListener('click', () => {
  if (!timerData) return stopTimer();
  const minuten = Math.max(1, Math.round((Date.now() - timerData.start) / 60000));
  state.gedaan = [{ id: timerData.id, titel: timerData.titel, minuten, datum: vandaagISO() }, ...state.gedaan].slice(0, 200);
  state.gezien = [...state.gezien, timerData.id].slice(-20);
  bewaar();
  stopTimer();
  tekenStats();
  tekenLogboek();
  naarTab('logboek');
});

$('#timerStop').addEventListener('click', stopTimer);

/* ═══════════════════════════════════════════════ weer ══ */

async function toonWeer(coords) {
  const uitslag = $('#weerUitslag');
  uitslag.innerHTML = '<p class="uitleg">Even kijken…</p>';
  try {
    let lat, lon, naam;
    if (coords) {
      ({ lat, lon } = coords);
      naam = 'jouw locatie';
    } else {
      const plaats = ($('#plaatsInput').value || state.plaats || '').trim();
      if (!plaats) {
        uitslag.innerHTML = '<p class="fout">Vul eerst je plaats in bij <b>Jouw smaak</b>, of gebruik je locatie.</p>';
        return;
      }
      const gevonden = await zoekPlaats(plaats);
      ({ lat, lon } = gevonden);
      naam = gevonden.naam;
    }

    weerCache = await haalWeer(lat, lon, naam);
    tekenWeerKaart(weerCache);
    tekenBuitenSuggesties(weerCache);
    tekenWeerhint();
    tekenSuggesties();   // Ontdek weegt het weer nu mee
  } catch (fout) {
    uitslag.innerHTML = `<p class="fout">${veilig(fout.message)} — je kunt gewoon verder,
      de suggesties werken ook zonder weerbericht.</p>`;
  }
}

function tekenWeerKaart(w) {
  const moment = w.besteMoment
    ? `Beste moment om buiten te zijn: rond <b>${veilig(w.besteMoment.uur)}</b> (${w.besteMoment.temp}°, ${w.besteMoment.kans}% kans op regen).`
    : '';
  $('#weerUitslag').innerHTML = `
    <div class="weer__kaart">
      <div class="weer__emoji">${w.emoji}</div>
      <div>
        <div class="weer__temp">${w.temperatuur}°</div>
        <div>${veilig(w.tekst)} in ${veilig(w.plaats)}</div>
        <div class="weer__meta">Voelt als ${w.gevoelstemperatuur}° · wind ${w.wind} km/u · vandaag ${w.min}° tot ${w.max}°${w.zonsondergang ? ` · zon onder ${veilig(w.zonsondergang)}` : ''}</div>
      </div>
    </div>
    <div class="meter"><div class="meter__vul" style="width:${w.buitenScore}%"></div></div>
    <p class="weer__meta">Buiten-gevoel: ${w.buitenScore}/100</p>
    <p class="weer__advies">${veilig(w.advies)}</p>
    ${moment ? `<p class="weer__meta">${moment}</p>` : ''}`;
}

function tekenBuitenSuggesties(w) {
  const buitenGoed = w.buitenScore >= 60;
  const lijst = suggesties(huidigeOpties({
    plek: buitenGoed ? 'buiten' : 'binnen',
    tijd: Math.max(state.filters.tijd, 60)
  })).slice(0, 3);

  $('#buitenSuggesties').innerHTML = `
    <div class="kaart kaart--zacht">
      <h2>${buitenGoed ? 'Naar buiten dus 🚶' : 'Beter iets binnen 🫖'}</h2>
      <p>${buitenGoed
        ? 'Dit past bij dit weer én bij wat jij leuk vindt.'
        : 'Deze passen bij jouw smaak en houden je droog.'}</p>
    </div>` + lijst.map(kaartHtml).join('');
}

function tekenWeerhint() {
  if (!weerCache) {
    $('#weerhint').innerHTML = 'Tip: check eerst het <a href="#" data-ga-naar="weer">weerbericht</a> — dan weegt de app mee of buiten nu een goed idee is.';
    return;
  }
  $('#weerhint').textContent = `${weerCache.emoji} ${weerCache.temperatuur}° in ${weerCache.plaats} — ${weerCache.advies}`;
}

$('#knopWeer').addEventListener('click', () => toonWeer(null));
$('#knopLocatie').addEventListener('click', async () => {
  try {
    const c = await huidigeLocatie();
    toonWeer(c);
  } catch (fout) {
    $('#weerUitslag').innerHTML = `<p class="fout">${veilig(fout.message)}. Vul anders je plaatsnaam in.</p>`;
  }
});

$('#buitenSuggesties').addEventListener('click', (e) => {
  const start = e.target.closest('[data-start]');
  if (start) startTimer(start.dataset.start);
  const fav = e.target.closest('[data-favoriet]');
  if (fav) {
    const id = fav.dataset.favoriet;
    state.favorieten = state.favorieten.includes(id)
      ? state.favorieten.filter((x) => x !== id) : [...state.favorieten, id];
    fav.classList.toggle('is-aan');
    fav.textContent = state.favorieten.includes(id) ? '💖' : '🤍';
    bewaar();
  }
});

/* ═══════════════════════════════════════════════ buurt ══ */

function tekenBuurt() {
  const plaats = ($('#buurtPlaats').value || state.plaats || '').trim();
  const tips = buurtTips(plaats, state.interesses);
  $('#buurtLijst').innerHTML = tips.map((t) => `
    <article class="idee" style="--kleurstreep:${t.relevant ? 'var(--perzik-diep)' : 'var(--lucht-diep)'}">
      <h3 class="idee__titel">${t.emoji} ${veilig(t.titel)}</h3>
      <p class="idee__pitch">${veilig(t.tekst)}</p>
      <div class="idee__acties">
        ${t.links.map((l) => `<a class="knop knop--klein" href="${l.url}" target="_blank" rel="noopener">${veilig(l.label)} ↗</a>`).join('')}
      </div>
    </article>`).join('');
}

$('#knopBuurt').addEventListener('click', () => {
  const plaats = $('#buurtPlaats').value.trim();
  if (plaats && !state.plaats) { state.plaats = plaats; bewaar(); $('#plaatsInput').value = plaats; }
  tekenBuurt();
});

/* ═════════════════════════════════════════════ logboek ══ */

function tekenLogboek() {
  const minuten = state.gedaan.reduce((som, g) => som + (g.minuten || 0), 0);
  const dezeWeek = state.gedaan.filter((g) => {
    const d = new Date(g.datum);
    return (Date.now() - d.getTime()) < 7 * 864e5;
  });

  $('#logboekSamenvatting').innerHTML = `
    <h2>Je hebt ${meervoud(minuten, 'minuut', 'minuten')} niet gescrold</h2>
    <p>${state.gedaan.length
      ? `Dat ${state.gedaan.length === 1 ? 'was' : 'zijn'} ${meervoud(state.gedaan.length, 'activiteit', 'activiteiten')}, waarvan ${dezeWeek.length} deze week. Mooi bezig.`
      : 'Nog niets gelogd. Kies een idee bij Ontdek en druk op "Ik ga dit doen".'}</p>`;

  $('#favorietenLijst').innerHTML = state.favorieten.length
    ? state.favorieten.map((id) => {
        const a = ACTIVITEITEN.find((x) => x.id === id);
        if (!a) return '';
        return `<div class="logregel"><div>${veilig(a.titel)}</div>
          <span>${a.tijd} min · ${veilig(a.kostenIndicatie || '')}</span></div>`;
      }).join('')
    : '<p class="leeg">Nog niets bewaard. Tik op 🤍 bij een idee.</p>';

  $('#gedaanLijst').innerHTML = state.gedaan.length
    ? state.gedaan.slice(0, 30).map((g) => `
        <div class="logregel"><div>${veilig(g.titel)}</div>
        <span>${veilig(g.datum)} · ${g.minuten} min</span></div>`).join('')
    : '<p class="leeg">Nog geen activiteiten afgerond.</p>';
}

/* ═══════════════════════════════════════════════ start ══ */

function start() {
  tekenInteresses();
  tekenStats();
  tekenSuggesties();
  toonWelkom();
  $('#plaatsInput').value = state.plaats;
  $('#buurtPlaats').value = state.plaats;
  tekenWeerhint();
}

start();
