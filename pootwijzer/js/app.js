// Pootwijzer — schermen, navigatie en alles aan elkaar knopen.

import { RASSEN, rasById, rassenVoor } from './rassen.js';
import { berekenLeeftijd, energiebehoefte, gramPerDag } from './leeftijd.js';
import { haalWeer, haalLocatie, plaatsnaam, weeradvies, besteMoment, WEERCODES, STANDAARDPLEK } from './weer.js';
import { weetjeVanDeWeek, handboekVoor } from './kennis.js';
import { SOORTEN, HOE_GEVEN, NOOIT, DISCLAIMER, zoekMedicijn } from './medicatie.js';
import { VRAGEN, gokRas, zoekRas } from './rasgok.js';
import { Schuifpuzzel } from './puzzel.js';
import { themaVanDeDag, maakSticker, deel, download } from './fotostudio.js';
import * as opslag from './opslag.js';
import { aiAan } from './ai.js';

// --- Kleine hulpjes ---------------------------------------------------------

const $ = (kies, waar = document) => waar.querySelector(kies);
const $$ = (kies, waar = document) => [...waar.querySelectorAll(kies)];

const veilig = (tekst) => String(tekst ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const datumNL = (d) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

let toastTimer;
function toast(tekst) {
  const el = $('#toast');
  el.textContent = tekst;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
}

const blad = $('#blad');
function openBlad(titel, html, naOpenen) {
  $('#blad-titel').textContent = titel;
  $('#blad-inhoud').innerHTML = html;
  if (!blad.open) blad.showModal();
  naOpenen?.($('#blad-inhoud'));
}
const sluitBlad = () => blad.close();
$('#blad-sluit').addEventListener('click', sluitBlad);
blad.addEventListener('click', (e) => { if (e.target === blad) sluitBlad(); });

const emojiVoor = (soort) => (soort === 'hond' ? '🐶' : '🐱');

function pasfoto(dier, klasse = '') {
  if (dier?.foto) return `<img class="pasfoto ${klasse}" src="${dier.foto}" alt="Foto van ${veilig(dier.naam)}" />`;
  return `<span class="pasfoto ${klasse}" aria-hidden="true">${emojiVoor(dier?.soort)}</span>`;
}

// --- Navigatie --------------------------------------------------------------

const SCHERMEN = ['welkom', 'wizard', 'vandaag', 'handboek', 'spelen', 'plakboek', 'ik'];
const TITELS = { welkom: 'Pootwijzer', wizard: 'Nieuw dier', vandaag: 'Vandaag', handboek: 'Handboek', spelen: 'Spelen', plakboek: 'Plakboek', ik: 'Ik' };
let huidig = 'welkom';

function toon(naam) {
  huidig = naam;
  SCHERMEN.forEach((s) => { $(`#scherm-${s}`).hidden = s !== naam; });
  $('#kop-titel').textContent = TITELS[naam] || 'Pootwijzer';
  $('#knop-terug').classList.toggle('verborgen', naam !== 'wizard' || opslag.dieren().length === 0);
  const heeftDieren = opslag.dieren().length > 0;
  $('#onderbalk').hidden = !heeftDieren || naam === 'wizard';
  $$('#onderbalk button').forEach((b) => {
    if (b.dataset.scherm === naam) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  if (naam === 'vandaag') tekenVandaag();
  if (naam === 'handboek') tekenHandboek();
  if (naam === 'spelen') tekenSpelen();
  if (naam === 'plakboek') tekenPlakboek();
  if (naam === 'ik') tekenIk();
}

$$('#onderbalk button').forEach((b) => b.addEventListener('click', () => toon(b.dataset.scherm)));
$('#knop-terug').addEventListener('click', () => toon(opslag.dieren().length ? 'vandaag' : 'welkom'));

// --- Welkom -----------------------------------------------------------------

function tekenWelkom() {
  $('#soortkeuze').innerHTML = ['hond', 'kat'].map((s) => `
    <button type="button" class="keuze" data-soort="${s}">
      <span class="keuze__emoji" aria-hidden="true">${emojiVoor(s)}</span>
      <span class="keuze__titel">Een ${s}</span>
      <span class="keuze__hint">${s === 'hond' ? 'Wandelen, snuffelen, eten' : 'Klimmen, jagen, slapen'}</span>
    </button>`).join('') + `
    <button type="button" class="keuze" id="knop-later" aria-disabled="true">
      <span class="keuze__emoji" aria-hidden="true">🐰</span>
      <span class="keuze__titel">Konijn, vogel, knaagdier</span>
      <span class="keuze__hint">Nog niet beschikbaar — hond en kat eerst goed doen.</span>
    </button>`;
  $$('#soortkeuze [data-soort]').forEach((b) => b.addEventListener('click', () => startWizard(b.dataset.soort)));
  $('#knop-later')?.addEventListener('click', () => toast('Die komen later. Eerst hond en kat écht goed.'));
}

// --- Wizard: nieuw dier -----------------------------------------------------

let wizard = null;

function startWizard(soort) {
  wizard = { stap: 'ras', soort, antwoorden: {}, rasId: null, gegokt: null };
  toon('wizard');
  tekenWizard();
}

function tekenWizard() {
  const stapnr = wizard.stap === 'details' ? 3 : wizard.stap === 'quiz' ? 2 : 2;
  $('#wizard-stap').textContent = `Stap ${stapnr} van 3 · ${wizard.soort === 'hond' ? 'Hond' : 'Kat'}`;
  const inhoud = $('#wizard-inhoud');

  if (wizard.stap === 'ras') {
    $('#wizard-titel').textContent = `Weet je het ras van je ${wizard.soort}?`;
    inhoud.innerHTML = `
      <div class="keuzes">
        <button type="button" class="keuze" data-actie="weet">
          <span class="keuze__emoji" aria-hidden="true">✅</span>
          <span class="keuze__titel">Ja, dat weet ik</span>
          <span class="keuze__hint">Typ de eerste letters</span>
        </button>
        <button type="button" class="keuze" data-actie="gok">
          <span class="keuze__emoji" aria-hidden="true">🔍</span>
          <span class="keuze__titel">Nee, laten we zoeken</span>
          <span class="keuze__hint">Vijf vragen over hoe hij eruitziet</span>
        </button>
        <button type="button" class="keuze" data-actie="kruising">
          <span class="keuze__emoji" aria-hidden="true">🤷</span>
          <span class="keuze__titel">Kruising / geen idee</span>
          <span class="keuze__hint">Ook prima — je kunt het later aanpassen</span>
        </button>
      </div>`;
    $$('[data-actie]', inhoud).forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.actie === 'kruising') {
        wizard.rasId = wizard.soort === 'hond' ? 'kruising-hond' : 'kruising-kat';
        wizard.stap = 'details';
      } else if (b.dataset.actie === 'weet') wizard.stap = 'zoek';
      else wizard.stap = 'quiz';
      tekenWizard();
    }));
    return;
  }

  if (wizard.stap === 'zoek') {
    $('#wizard-titel').textContent = 'Welk ras is het?';
    inhoud.innerHTML = `
      <label class="veld" for="ras-zoek">
        <span>Begin te typen <span class="veld__hint">bijvoorbeeld "lab"</span></span>
        <input type="search" id="ras-zoek" autocomplete="off" placeholder="Zoek een ras…" />
      </label>
      <div class="keuzes" id="ras-resultaten"></div>
      <p class="klein gedempt" style="margin-top:12px">Staat je ras er niet bij? Kies dan <button type="button" class="knop knop--zacht knop--klein" data-kruising>Kruising / anders</button></p>`;
    const invoer = $('#ras-zoek', inhoud);
    const teken = () => {
      const treffers = invoer.value ? zoekRas(wizard.soort, invoer.value) : rassenVoor(wizard.soort).slice(0, 6);
      $('#ras-resultaten', inhoud).innerHTML = treffers.map((r) => `
        <button type="button" class="keuze" data-ras="${r.id}">
          <span class="keuze__titel">${veilig(r.naam)}</span>
          <span class="keuze__hint">${r.grootte} · vacht ${r.vacht}</span>
        </button>`).join('') || '<p class="gedempt">Niets gevonden.</p>';
      $$('[data-ras]', inhoud).forEach((b) => b.addEventListener('click', () => {
        wizard.rasId = b.dataset.ras; wizard.stap = 'details'; tekenWizard();
      }));
    };
    invoer.addEventListener('input', teken);
    teken();
    invoer.focus();
    $('[data-kruising]', inhoud).addEventListener('click', () => {
      wizard.rasId = wizard.soort === 'hond' ? 'kruising-hond' : 'kruising-kat';
      wizard.stap = 'details'; tekenWizard();
    });
    return;
  }

  if (wizard.stap === 'quiz') {
    $('#wizard-titel').textContent = 'Speurtocht 🔍';
    const beantwoord = VRAGEN.filter((v) => wizard.antwoorden[v.id] !== undefined).length;
    const vraag = VRAGEN.find((v) => wizard.antwoorden[v.id] === undefined);

    if (vraag) {
      inhoud.innerHTML = `
        <p class="klein gedempt">Vraag ${beantwoord + 1} van ${VRAGEN.length}</p>
        <div class="balk" aria-hidden="true" style="margin-bottom:14px"><i style="width:${(beantwoord / VRAGEN.length) * 100}%"></i></div>
        <fieldset>
          <legend>${veilig(vraag.vraag)}</legend>
          <div class="keuzes">
            ${vraag.opties.map((o) => `
              <button type="button" class="keuze" data-waarde="${o.waarde}">
                <span class="keuze__emoji" aria-hidden="true">${o.emoji}</span>
                <span class="keuze__titel">${veilig(o.label)}</span>
                ${o.hint ? `<span class="keuze__hint">${veilig(o.hint)}</span>` : ''}
              </button>`).join('')}
          </div>
        </fieldset>
        <button type="button" class="knop knop--zacht knop--klein" data-sla-over>Weet ik niet, sla over</button>`;
      const zet = (waarde) => {
        wizard.antwoorden[vraag.id] = waarde;
        tekenWizard();
      };
      $$('[data-waarde]', inhoud).forEach((b) => b.addEventListener('click', () => {
        const rauw = b.dataset.waarde;
        zet(Number.isNaN(Number(rauw)) ? rauw : Number(rauw));
      }));
      $('[data-sla-over]', inhoud).addEventListener('click', () => zet(null));
      return;
    }

    const uitslag = gokRas(wizard.soort, wizard.antwoorden);
    inhoud.innerHTML = `
      <p class="gedempt">Dit lijkt er het meest op. Kies wat je herkent — je kunt het altijd aanpassen.</p>
      <div class="keuzes">
        ${uitslag.map((u) => `
          <button type="button" class="keuze" data-ras="${u.ras.id}">
            <span class="keuze__titel">${veilig(u.ras.naam)}</span>
            <span class="keuze__hint">${u.procent}% overeenkomst · ${u.zekerheid === 'hoog' ? 'sterke gelijkenis' : u.zekerheid === 'redelijk' ? 'lijkt erop' : 'zwakke gelijkenis'}</span>
          </button>`).join('')}
        <button type="button" class="keuze" data-ras="${wizard.soort === 'hond' ? 'kruising-hond' : 'kruising-kat'}">
          <span class="keuze__titel">Geen van deze</span>
          <span class="keuze__hint">Dan noemen we het een unieke kruising</span>
        </button>
      </div>
      <p class="klein gedempt" style="margin-top:12px">Dit is een gelijkenis op vijf kenmerken, geen DNA-test.</p>
      <button type="button" class="knop knop--zacht knop--klein" data-opnieuw>Opnieuw beginnen</button>`;
    $$('[data-ras]', inhoud).forEach((b) => b.addEventListener('click', () => {
      wizard.rasId = b.dataset.ras; wizard.stap = 'details'; tekenWizard();
    }));
    $('[data-opnieuw]', inhoud).addEventListener('click', () => { wizard.antwoorden = {}; tekenWizard(); });
    return;
  }

  // Details
  const ras = rasById(wizard.rasId);
  $('#wizard-titel').textContent = 'Bijna klaar 🎉';
  inhoud.innerHTML = `
    <p class="gedempt">Profiel voor een <strong>${veilig(ras?.naam || wizard.soort)}</strong>.</p>
    <form id="detailform" novalidate>
      <label class="veld" for="naam"><span>Hoe heet hij of zij?</span>
        <input type="text" id="naam" name="naam" required maxlength="24" placeholder="Bijvoorbeeld: Bella" autocomplete="off" />
      </label>
      <fieldset>
        <legend>Geslacht</legend>
        <div class="segment" id="geslacht">
          <button type="button" class="keuze" data-geslacht="Mannetje" aria-pressed="false"><span aria-hidden="true">♂️</span> <span class="keuze__titel">Mannetje</span></button>
          <button type="button" class="keuze" data-geslacht="Vrouwtje" aria-pressed="false"><span aria-hidden="true">♀️</span> <span class="keuze__titel">Vrouwtje</span></button>
        </div>
      </fieldset>
      <label class="veld" for="geboortedatum"><span>Geboortedatum <span class="veld__hint">bij benadering mag ook</span></span>
        <input type="date" id="geboortedatum" name="geboortedatum" required max="${new Date().toISOString().split('T')[0]}" />
      </label>
      <label class="veld" for="gewicht"><span>Gewicht in kilo <span class="veld__hint">voor de voerberekening — mag je later invullen</span></span>
        <input type="number" id="gewicht" name="gewicht" min="0.2" max="120" step="0.1" inputmode="decimal" placeholder="${ras ? ras.gewicht[0] : 5}" />
      </label>
      <fieldset>
        <legend>Gecastreerd of gesteriliseerd?</legend>
        <div class="segment" id="geholpen">
          <button type="button" class="keuze" data-geholpen="ja" aria-pressed="false"><span class="keuze__titel">Ja</span></button>
          <button type="button" class="keuze" data-geholpen="nee" aria-pressed="false"><span class="keuze__titel">Nee</span></button>
        </div>
      </fieldset>
      <p class="klein gedempt" id="detailfout" role="alert"></p>
      <button type="submit" class="knop knop--accent knop--vol">Profiel aanmaken ✨</button>
    </form>`;

  let geslacht = ''; let geholpen = null;
  $$('#geslacht [data-geslacht]', inhoud).forEach((b) => b.addEventListener('click', () => {
    geslacht = b.dataset.geslacht;
    $$('#geslacht [data-geslacht]', inhoud).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));
  $$('#geholpen [data-geholpen]', inhoud).forEach((b) => b.addEventListener('click', () => {
    geholpen = b.dataset.geholpen === 'ja';
    $$('#geholpen [data-geholpen]', inhoud).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  }));

  $('#detailform', inhoud).addEventListener('submit', (e) => {
    e.preventDefault();
    const naam = $('#naam', inhoud).value.trim();
    const geboortedatum = $('#geboortedatum', inhoud).value;
    const gewicht = Number($('#gewicht', inhoud).value) || null;
    if (!naam || !geboortedatum) {
      $('#detailfout', inhoud).textContent = 'Vul in ieder geval een naam en een geboortedatum in.';
      return;
    }
    opslag.voegDierToe({
      naam, soort: wizard.soort, rasId: wizard.rasId, geboortedatum,
      geslacht, gewicht, geholpen, conditie: 'goed', kcalPer100g: null, foto: null
    });
    wizard = null;
    toast('Profiel aangemaakt 🎉');
    toon('vandaag');
  });
}

// --- Vandaag ----------------------------------------------------------------

function dierInfo(dier) {
  const ras = rasById(dier.rasId);
  const leeftijd = berekenLeeftijd(dier.soort, dier.geboortedatum, ras);
  return { ras, leeftijd };
}

function tekenDierwissel() {
  const lijst = opslag.dieren();
  const actief = opslag.actiefDier();
  $('#dierwissel').innerHTML = lijst.map((d) => `
    <button type="button" class="keuze" data-dier="${d.id}" aria-pressed="${d.id === actief?.id}">
      ${pasfoto(d)}<span class="keuze__titel">${veilig(d.naam)}</span>
    </button>`).join('') + `
    <button type="button" class="keuze" data-nieuw><span class="keuze__titel">+ Dier</span></button>`;
  $$('#dierwissel [data-dier]').forEach((b) => b.addEventListener('click', () => {
    opslag.kiesDier(b.dataset.dier); tekenVandaag();
  }));
  $('#dierwissel [data-nieuw]').addEventListener('click', kiesNieuwSoort);
  $('#dierwissel').hidden = lijst.length < 1;
}

function kiesNieuwSoort() {
  openBlad('Wat voor dier?', `
    <div class="keuzes">
      ${['hond', 'kat'].map((s) => `
        <button type="button" class="keuze" data-nieuwsoort="${s}">
          <span class="keuze__emoji" aria-hidden="true">${emojiVoor(s)}</span>
          <span class="keuze__titel">Een ${s}</span>
        </button>`).join('')}
    </div>`, (wortel) => {
    $$('[data-nieuwsoort]', wortel).forEach((b) => b.addEventListener('click', () => {
      sluitBlad(); startWizard(b.dataset.nieuwsoort);
    }));
  });
}

function tekenVandaag() {
  const dier = opslag.actiefDier();
  if (!dier) { toon('welkom'); return; }
  tekenDierwissel();
  const { ras, leeftijd } = dierInfo(dier);
  const weetje = weetjeVanDeWeek(dier.soort, new Date(), leeftijd.fase.id);
  const energie = energiebehoefte({
    soort: dier.soort, gewicht: dier.gewicht, faseId: leeftijd.fase.id,
    geholpen: dier.geholpen, conditie: dier.conditie || 'goed'
  });
  const gram = energie && dier.kcalPer100g ? gramPerDag(energie.kcal, dier.kcalPer100g) : null;
  const agenda = opslag.agendaVoor(dier.id);
  const soortklasse = dier.soort === 'hond' ? 'chip--hond' : 'chip--kat';

  $('#vandaag-inhoud').innerHTML = `
    <section class="kaart komt-op">
      <div class="dierkop">
        <label style="cursor:pointer" title="Foto kiezen">
          ${pasfoto(dier, 'pasfoto--groot')}
          <input type="file" accept="image/*" id="fotoinvoer" class="alleen-schermlezer" />
          <span class="alleen-schermlezer">Kies een foto van ${veilig(dier.naam)}</span>
        </label>
        <div>
          <h2 style="margin-bottom:6px">${veilig(dier.naam)}</h2>
          <p class="rij rij--wikkel" style="gap:6px;margin:0">
            <span class="chip ${soortklasse}">${veilig(ras?.naam || dier.soort)}</span>
            <span class="chip">${leeftijd.fase.emoji} ${leeftijd.fase.naam}</span>
          </p>
        </div>
      </div>
      <hr class="streep" />
      <div class="rij rij--tussen">
        <div>
          <p class="klein gedempt" style="margin:0">Leeftijd</p>
          <p class="groot-getal">${leeftijd.jarenHeel} jaar ${leeftijd.restMaanden ? `${leeftijd.restMaanden} mnd` : ''}</p>
        </div>
        <div style="text-align:right">
          <p class="klein gedempt" style="margin:0">In mensenjaren</p>
          <p class="groot-getal">${leeftijd.mensenjaren} 🎈</p>
        </div>
      </div>
      ${leeftijd.volgende ? `
        <p class="klein gedempt" style="margin:12px 0 6px">
          Nog ongeveer ${leeftijd.maandenTotVolgende} maanden ${leeftijd.fase.naam.toLowerCase()} — daarna ${leeftijd.volgende.naam.toLowerCase()}.
        </p>
        <div class="balk"><i style="width:${Math.round(leeftijd.voortgang * 100)}%"></i></div>` : ''}
      <p class="klein gedempt" style="margin-top:12px">
        <button type="button" class="knop knop--zacht knop--klein" data-uitleg-leeftijd>Hoe rekenen we dit uit?</button>
      </p>
    </section>

    <section class="kaart" id="weerkaart" aria-live="polite">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🌤️</span><h2>Vandaag buiten</h2></div>
      <p class="laadt">Het weer ophalen…</p>
    </section>

    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🥣</span><h2>Eten</h2></div>
      <p>${veilig(leeftijd.voeradvies)}</p>
      ${energie ? `
        <div class="advies" style="margin-top:10px">
          <h3>Ongeveer ${energie.kcal} kcal per dag</h3>
          <p class="klein">${gram ? `Dat is ongeveer <strong>${gram} gram</strong> van jouw voer (${dier.kcalPer100g} kcal per 100 g). ` : ''}${veilig(energie.toelichting)}</p>
        </div>` : `
        <p class="klein gedempt">Vul het gewicht in en je ziet meteen hoeveel kcal per dag erbij hoort.</p>`}
      <p style="margin-top:12px"><button type="button" class="knop knop--zacht knop--klein" data-eten>Gewicht en voer aanpassen</button></p>
    </section>

    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">💡</span><h2>Weetje van de week</h2></div>
      <h3>${veilig(weetje.t)}</h3>
      <p class="gedempt">${veilig(weetje.d)}</p>
    </section>

    ${ras && ras.letop?.length ? `
      <section class="kaart">
        <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🔎</span><h2>Bij dit ras let je op</h2></div>
        <ul style="margin:0 0 10px;padding-left:20px">${ras.letop.map((l) => `<li>${veilig(l)}</li>`).join('')}</ul>
        <p class="klein gedempt">${veilig(ras.tip)}</p>
      </section>` : ''}

    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">📅</span><h2>Niet vergeten</h2></div>
      ${agenda.length ? `<ul style="list-style:none;padding:0;margin:0 0 12px">${agenda.map((a) => `
        <li class="rij rij--tussen" style="padding:8px 0;border-bottom:1px solid var(--kaart-rand)">
          <span>${a.soort?.emoji || '🔔'} ${veilig(a.soort?.naam || a.type)}</span>
          <span class="chip" style="background:var(--${a.status === 'over' ? 'pasop' : a.status === 'bijna' ? 'letop' : 'rustig'}-zacht);color:var(--${a.status === 'over' ? 'pasop' : a.status === 'bijna' ? 'letop' : 'rustig'})">
            ${a.dagenTeGaan < 0 ? `${-a.dagenTeGaan} dagen te laat` : a.dagenTeGaan === 0 ? 'vandaag' : `over ${a.dagenTeGaan} dagen`}
          </span>
        </li>`).join('')}</ul>`
      : '<p class="gedempt">Nog niets ingesteld. Handig voor ontworming, vlooienmiddel of de jaarlijkse controle.</p>'}
      <button type="button" class="knop knop--zacht knop--klein" data-agenda>Herinneringen instellen</button>
    </section>`;

  $('#fotoinvoer').addEventListener('change', async (e) => {
    const bestand = e.target.files?.[0];
    if (!bestand) return;
    try {
      const klein = await opslag.verkleinFoto(bestand);
      if (!opslag.werkDierBij(dier.id, { foto: klein })) {
        toast('De opslag zit vol. Verwijder eerst wat stickers.');
        return;
      }
      toast('Foto opgeslagen 📸');
      tekenVandaag();
    } catch (err) { toast(err.message); }
  });
  $('[data-uitleg-leeftijd]').addEventListener('click', () => uitlegLeeftijd(dier, leeftijd));
  $('[data-eten]').addEventListener('click', () => bewerkEten(dier));
  $('[data-agenda]').addEventListener('click', () => bewerkAgenda(dier));

  vulWeerkaart(dier, ras, leeftijd);
}

function uitlegLeeftijd(dier, leeftijd) {
  openBlad('Hoe we de leeftijd berekenen', `
    <p>Het oude "één hondenjaar is zeven mensenjaren" klopt niet. Een hond van één is al bijna volwassen, en daarna gaat het veel langzamer.</p>
    <p>${dier.soort === 'hond'
      ? 'We gebruiken de formule uit onderzoek naar de veroudering van DNA bij honden: <em>mensenjaren ≈ 16 × ln(leeftijd) + 31</em>. Het eerste jaar telt daarin het zwaarst.'
      : 'Voor katten volgen we de veelgebruikte tabel: het eerste jaar telt als 15, het tweede als 9, en elk jaar daarna als ongeveer 4 mensenjaren.'}</p>
    <p>De levensfase komt niet uit een vaste leeftijd maar uit de richtlijnen voor levensfases${dier.soort === 'hond' ? ', waarin de grootte van het ras meetelt: een grote hond is later uitgegroeid en eerder senior' : ' voor katten'}.</p>
    <p class="klein gedempt">${veilig(dier.naam)} is nu ${leeftijd.jarenHeel} jaar en ${leeftijd.restMaanden} maanden, oftewel ongeveer ${leeftijd.mensenjaren} in mensenjaren.</p>
    <p class="voetnoot">De bronnen staan in docs/bronnen.md.</p>`);
}

function bewerkEten(dier) {
  openBlad('Gewicht en voer', `
    <form id="etenform">
      <label class="veld" for="e-gewicht"><span>Gewicht in kilo</span>
        <input type="number" id="e-gewicht" min="0.2" max="120" step="0.1" inputmode="decimal" value="${dier.gewicht ?? ''}" />
      </label>
      <fieldset>
        <legend>Hoe voelt hij aan?</legend>
        <div class="segment" id="e-conditie">
          ${[['temager', 'Te mager', 'ribben duidelijk zichtbaar'], ['goed', 'Goed', 'ribben voelbaar, taille zichtbaar'], ['tezwaar', 'Te zwaar', 'ribben moeilijk te voelen']]
            .map(([w, l, h]) => `<button type="button" class="keuze" data-conditie="${w}" aria-pressed="${(dier.conditie || 'goed') === w}">
              <span class="keuze__titel">${l}</span><span class="keuze__hint">${h}</span></button>`).join('')}
        </div>
      </fieldset>
      <label class="veld" for="e-kcal"><span>Kcal per 100 gram voer <span class="veld__hint">staat op de verpakking, meestal als "ME"</span></span>
        <input type="number" id="e-kcal" min="50" max="600" step="1" inputmode="numeric" value="${dier.kcalPer100g ?? ''}" placeholder="bijv. 380" />
      </label>
      <button type="submit" class="knop knop--accent knop--vol">Opslaan</button>
      <p class="voetnoot" style="margin-top:12px">De rekensom is een startpunt (RER = 70 × kg^0,75, keer een factor voor de levensfase). Het echte antwoord lees je af aan de weegschaal en aan de ribben.</p>
    </form>`, (wortel) => {
    let conditie = dier.conditie || 'goed';
    $$('[data-conditie]', wortel).forEach((b) => b.addEventListener('click', () => {
      conditie = b.dataset.conditie;
      $$('[data-conditie]', wortel).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    $('#etenform', wortel).addEventListener('submit', (e) => {
      e.preventDefault();
      opslag.werkDierBij(dier.id, {
        gewicht: Number($('#e-gewicht', wortel).value) || null,
        kcalPer100g: Number($('#e-kcal', wortel).value) || null,
        conditie
      });
      sluitBlad(); tekenVandaag(); toast('Opgeslagen');
    });
  });
}

function bewerkAgenda(dier) {
  const bestaand = opslag.agendaVoor(dier.id);
  openBlad('Herinneringen', `
    <p class="gedempt">Zet aan wat jij wilt bijhouden. Pootwijzer stuurt geen meldingen — je ziet het op het Vandaag-scherm staan.</p>
    <div class="stapel" id="agendalijst">
      ${opslag.AGENDA_SOORTEN.map((s) => {
        const huidige = bestaand.find((b) => b.type === s.id);
        return `<div class="kaart kaart--vlak">
          <div class="rij rij--tussen">
            <strong>${s.emoji} ${s.naam}</strong>
            ${huidige ? `<button type="button" class="knop knop--zacht knop--klein" data-weg="${huidige.id}">Weghalen</button>` : ''}
          </div>
          <div class="rij rij--wikkel" style="margin-top:8px;gap:8px">
            <label class="klein">Laatst gedaan
              <input type="date" data-laatst="${s.id}" value="${huidige ? String(huidige.laatst).slice(0, 10) : new Date().toISOString().slice(0, 10)}" max="${new Date().toISOString().slice(0, 10)}" />
            </label>
            <label class="klein">Elke … dagen
              <input type="number" data-dagen="${s.id}" min="1" max="730" value="${huidige?.dagen ?? s.standaardDagen}" inputmode="numeric" />
            </label>
          </div>
          <button type="button" class="knop knop--klein" style="margin-top:10px" data-zet="${s.id}">${huidige ? 'Bijwerken' : 'Instellen'}</button>
        </div>`;
      }).join('')}
    </div>`, (wortel) => {
    $$('[data-zet]', wortel).forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.zet;
      const laatst = $(`[data-laatst="${id}"]`, wortel).value;
      const dagen = Number($(`[data-dagen="${id}"]`, wortel).value) || 30;
      if (!laatst) { toast('Vul eerst een datum in.'); return; }
      opslag.zetAgenda(dier.id, id, laatst, dagen);
      toast('Ingesteld ✅');
      sluitBlad(); tekenVandaag();
    }));
    $$('[data-weg]', wortel).forEach((b) => b.addEventListener('click', () => {
      opslag.verwijderAgenda(b.dataset.weg);
      sluitBlad(); tekenVandaag();
    }));
  });
}

async function vulWeerkaart(dier, ras, leeftijd) {
  const kaart = $('#weerkaart');
  if (!kaart) return;
  const inst = opslag.laad().instellingen;
  // We vragen niet uit onszelf om je locatie: zonder toestemming rekenen we met
  // een plek in het midden van het land, en met één tik zet je je eigen plek erin.
  const plek = inst.lat
    ? { lat: inst.lat, lon: inst.lon, plaats: inst.plaats, eigen: true }
    : { ...STANDAARDPLEK, eigen: false };
  try {
    const weer = await haalWeer(plek.lat, plek.lon);
    const advies = weeradvies({ soort: dier.soort, ras, faseId: leeftijd.fase.id, weer });
    const moment = besteMoment(weer, dier.soort);
    const [omschrijving, emoji] = WEERCODES[advies.code] || ['Weer', '🌡️'];

    kaart.innerHTML = `
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">${emoji}</span>
        <h2>${Math.round(advies.temp)} °C · ${omschrijving}</h2></div>
      <p class="klein gedempt">
        ${plek.eigen ? veilig(inst.plaats || 'Jouw plek') : `${veilig(STANDAARDPLEK.plaats)} — nog niet jouw plek`}
        ${weer.verouderd ? ' · laatst bekende bericht, je bent offline' : ''}
      </p>
      <p><button type="button" class="knop knop--zacht knop--klein" data-plaats>📍 ${plek.eigen ? 'Locatie vernieuwen' : 'Gebruik mijn locatie'}</button></p>
      <div style="margin-top:12px">
        ${advies.regels.map((r) => `
          <div class="advies advies--${r.niveau}">
            <p class="advies__label">${r.niveau === 'pas_op' ? 'Pas op' : r.niveau === 'let_op' ? 'Let op' : 'Prima'}</p>
            <h3>${veilig(r.titel)}</h3>
            <p>${veilig(r.tekst)}</p>
          </div>`).join('')}
      </div>
      ${moment ? `<p class="klein gedempt" style="margin-top:12px">🚶 Beste moment om eropuit te gaan: <strong>${veilig(moment.label)}</strong> (${Math.round(moment.temp)} °C, ${moment.regen}% kans op regen).</p>` : ''}`;

    $('[data-plaats]', kaart)?.addEventListener('click', async (e) => {
      e.target.disabled = true;
      e.target.textContent = 'Even zoeken…';
      const nieuw = await haalLocatie();
      if (nieuw.geraden) { toast('Zonder locatie rekenen we met het midden van het land.'); }
      inst.lat = nieuw.lat; inst.lon = nieuw.lon;
      inst.plaats = nieuw.plaats || (await plaatsnaam(nieuw.lat, nieuw.lon)) || '';
      opslag.bewaar();
      tekenVandaag();
    });
  } catch (err) {
    kaart.innerHTML = `
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🌤️</span><h2>Vandaag buiten</h2></div>
      <p class="gedempt">Het weerbericht lukt nu even niet (${veilig(err.message)}). De rest van de app werkt gewoon.</p>`;
  }
}

// --- Handboek ---------------------------------------------------------------

function tekenHandboek() {
  const dier = opslag.actiefDier();
  if (!dier) { toon('welkom'); return; }
  const { leeftijd } = dierInfo(dier);
  $('#handboek-uitleg').textContent =
    `Alles wat je wilt weten over je ${dier.soort}, van A tot Z. De tip in het roze vak hoort bij de fase waar ${dier.naam} nu in zit: ${leeftijd.fase.naam.toLowerCase()}.`;
  const items = handboekVoor(dier.soort, leeftijd.fase.id);
  const zoek = $('#az-zoek').value.trim().toLowerCase();
  const zichtbaar = zoek
    ? items.filter((i) => (i.t + ' ' + i.d).toLowerCase().includes(zoek))
    : items;

  $('#az-lijst').innerHTML = zichtbaar.length ? zichtbaar.map((i, n) => `
    <div class="az__item">
      <button type="button" class="az__knop" aria-expanded="false" aria-controls="az-${i.l}" id="azknop-${i.l}">
        <span class="az__letter" aria-hidden="true">${i.l}</span>
        <span class="az__titel">${veilig(i.t)}</span>
        <span class="az__pijl" aria-hidden="true">›</span>
      </button>
      <div class="az__tekst" id="az-${i.l}" role="region" aria-labelledby="azknop-${i.l}" hidden>
        <p>${veilig(i.d)}</p>
        ${i.extra ? `<p class="az__extra"><strong>${veilig(leeftijd.fase.naam)}:</strong> ${veilig(i.extra)}</p>` : ''}
      </div>
    </div>`).join('') : '<p class="gedempt">Niets gevonden. Probeer een ander woord.</p>';

  $$('#az-lijst .az__knop').forEach((knop) => knop.addEventListener('click', () => {
    const open = knop.getAttribute('aria-expanded') === 'true';
    knop.setAttribute('aria-expanded', String(!open));
    $('#' + knop.getAttribute('aria-controls')).hidden = open;
  }));
}

$('#az-zoek').addEventListener('input', tekenHandboek);
$('#knop-medicijnwijzer').addEventListener('click', () => medicijnwijzer());

function medicijnwijzer(vooraf = '') {
  const dier = opslag.actiefDier();
  openBlad('Medicijnwijzer 💊', `
    <p class="advies advies--let_op"><strong>Let op.</strong> ${veilig(DISCLAIMER)}</p>
    <label class="veld" for="med-zoek"><span>Wat staat er op het doosje?</span>
      <input type="search" id="med-zoek" placeholder="Bijvoorbeeld: Metacam, Milbemax…" value="${veilig(vooraf)}" autocomplete="off" />
    </label>
    <div id="med-uitslag"></div>
    <details style="margin-top:16px">
      <summary style="min-height:44px;display:flex;align-items:center;font-weight:700;cursor:pointer">Hoe geef je een pil aan een ${veilig(dier?.soort || 'huisdier')}?</summary>
      <ol style="padding-left:20px">${(HOE_GEVEN[dier?.soort] || HOE_GEVEN.hond).map((s) => `<li style="margin:8px 0">${veilig(s)}</li>`).join('')}</ol>
    </details>
    <details style="margin-top:8px">
      <summary style="min-height:44px;display:flex;align-items:center;font-weight:700;cursor:pointer">Wat je nooit geeft</summary>
      <ul style="padding-left:20px">${NOOIT.map((n) => `<li style="margin:8px 0"><strong>${veilig(n.t)}</strong> — ${veilig(n.d)}</li>`).join('')}</ul>
    </details>
    <p class="voetnoot" style="margin-top:16px">Pootwijzer noemt bewust geen doseringen: hoeveel en hoe lang staat op het etiket van jóuw dierenarts.</p>`, (wortel) => {
    const invoer = $('#med-zoek', wortel);
    const uitslag = $('#med-uitslag', wortel);
    const zoek = () => {
      const term = invoer.value;
      if (term.trim().length < 2) { uitslag.innerHTML = `
        <p class="klein gedempt">Bekende soorten: ${SOORTEN.map((s) => `<button type="button" class="chip" data-soortmed="${s.id}" style="border:0;cursor:pointer">${s.emoji} ${veilig(s.naam)}</button>`).join(' ')}</p>`;
        $$('[data-soortmed]', uitslag).forEach((b) => b.addEventListener('click', () => {
          toonMedicijn(SOORTEN.find((s) => s.id === b.dataset.soortmed), uitslag);
        }));
        return;
      }
      const treffer = zoekMedicijn(term);
      if (treffer) toonMedicijn(treffer, uitslag);
      else uitslag.innerHTML = `<p class="advies">Dit middel ken ik niet. Kijk op de verpakking naar de <strong>werkzame stof</strong> (de kleine letters) en probeer die, of vraag het bij het afhalen aan je dierenarts.</p>`;
    };
    invoer.addEventListener('input', zoek);
    zoek();
    invoer.focus();
  });
}

function toonMedicijn(soort, waar) {
  if (!soort) return;
  waar.innerHTML = `
    <article class="kaart kaart--vlak komt-op">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">${soort.emoji}</span><h3>${veilig(soort.naam)}</h3></div>
      <p><strong>Wat is het?</strong><br />${veilig(soort.wat)}</p>
      <p><strong>Hoe geef je het?</strong><br />${veilig(soort.geven)}</p>
      <p><strong>Waar let je op?</strong><br />${veilig(soort.letop)}</p>
      <p class="klein gedempt">${veilig(soort.ritme)}</p>
    </article>`;
}

// --- Spelen -----------------------------------------------------------------

let puzzel = null;

function tekenSpelen() {
  const dier = opslag.actiefDier();
  if (!dier) { toon('welkom'); return; }
  const thema = themaVanDeDag();

  $('#spelen-inhoud').innerHTML = `
    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🧩</span><h2>Schuifpuzzel</h2></div>
      ${dier.foto ? `
        <p class="gedempt">Schuif de foto van ${veilig(dier.naam)} weer op zijn plek.</p>
        <div class="rij rij--wikkel" style="margin-bottom:12px">
          <div class="segment" role="group" aria-label="Moeilijkheid">
            <button type="button" class="keuze" data-maat="3" aria-pressed="true"><span class="keuze__titel">Makkelijk</span></button>
            <button type="button" class="keuze" data-maat="4" aria-pressed="false"><span class="keuze__titel">Lastig</span></button>
          </div>
          <button type="button" class="knop knop--zacht knop--klein" data-schud>Opnieuw schudden</button>
        </div>
        <div class="puzzel" id="puzzelbord" role="application" aria-label="Schuifpuzzel: gebruik de pijltjestoetsen of tik op een tegel" tabindex="0"></div>
        <p class="klein gedempt" style="margin-top:10px" aria-live="polite" id="puzzelstand">Nog geen zetten.</p>`
      : `<p class="gedempt">Voor de puzzel is een foto nodig. Kies er een op het Vandaag-scherm — dan puzzel je met je eigen dier.</p>
         <button type="button" class="knop knop--zacht" data-naar-vandaag>Naar Vandaag</button>`}
    </section>

    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">📸</span><h2>Fotostudio</h2></div>
      <p class="gedempt">Elke dag een ander thema. De sticker wordt op je eigen toestel getekend — je foto gaat nergens heen.</p>
      <p class="rij rij--wikkel" style="gap:8px">
        <span class="chip">${thema.sfeer.emoji} ${veilig(thema.sfeer.naam)}</span>
        <span class="chip">${thema.object.emoji} ${veilig(thema.object.naam)}</span>
        ${thema.feestdag ? '<span class="chip">🎉 Feestdag!</span>' : ''}
      </p>
      ${dier.foto
        ? `<button type="button" class="knop knop--accent knop--vol" data-sticker style="margin-top:12px">Maak de sticker van vandaag ✨</button>`
        : `<p class="klein gedempt" style="margin-top:12px">Kies eerst een foto op het Vandaag-scherm.</p>`}
    </section>`;

  $('[data-naar-vandaag]', $('#spelen-inhoud'))?.addEventListener('click', () => toon('vandaag'));

  if (dier.foto) {
    const bord = $('#puzzelbord');
    puzzel = new Schuifpuzzel(bord, {
      opZet: (n) => { $('#puzzelstand').textContent = `${n} ${n === 1 ? 'zet' : 'zetten'}.`; },
      opGewonnen: (n) => winPuzzel(dier, n)
    });
    puzzel.start(dier.foto, 3);
    $$('[data-maat]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-maat]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      puzzel.start(dier.foto, Number(b.dataset.maat));
      $('#puzzelstand').textContent = 'Nog geen zetten.';
    }));
    $('[data-schud]').addEventListener('click', () => {
      puzzel.start(dier.foto, puzzel.maat);
      $('#puzzelstand').textContent = 'Nog geen zetten.';
    });
    $('[data-sticker]')?.addEventListener('click', () => maakEnBewaarSticker(dier, 'Sticker van de dag'));
  }
}

async function winPuzzel(dier, zetten) {
  $('#puzzelstand').textContent = `Opgelost in ${zetten} zetten! 🎉`;
  await maakEnBewaarSticker(dier, `Puzzelkampioen · ${zetten} zetten`);
}

async function maakEnBewaarSticker(dier, titel) {
  const thema = themaVanDeDag();
  try {
    const src = await maakSticker({
      fotoUrl: dier.foto, naam: dier.naam, sfeer: thema.sfeer, object: thema.object,
      tekst: `${thema.sfeer.emoji} ${titel} · ${new Date().toLocaleDateString('nl-NL')}`
    });
    const res = opslag.voegPlakboekToe({ dierId: dier.id, titel, src });
    if (!res.ok) { toast('De opslag zit vol. Verwijder een paar oude stickers.'); return; }
    toast('Sticker in je plakboek geplakt 📒');
    toon('plakboek');
  } catch (err) {
    toast('De sticker maken lukte niet: ' + err.message);
  }
}

// --- Plakboek ---------------------------------------------------------------

function tekenPlakboek() {
  const dier = opslag.actiefDier();
  if (!dier) { toon('welkom'); return; }
  const items = opslag.plakboekVoor(dier.id);
  $('#plakboek-inhoud').innerHTML = items.length ? `
    <div class="plakboek">
      ${items.map((p) => `
        <button type="button" data-sticker-id="${p.id}">
          <figure style="margin:0">
            <img src="${p.src}" alt="${veilig(p.titel)}" loading="lazy" />
            <figcaption><strong>${veilig(p.titel)}</strong><br />${datumNL(p.datum)}</figcaption>
          </figure>
        </button>`).join('')}
    </div>`
    : `<div class="leeg-melding"><span aria-hidden="true">📒</span>
        <p>Je plakboek is nog leeg. Maak een sticker in de Fotostudio of los de schuifpuzzel op.</p>
        <button type="button" class="knop knop--zacht" data-naar-spelen>Naar Spelen</button>
      </div>`;

  $('[data-naar-spelen]', $('#plakboek-inhoud'))?.addEventListener('click', () => toon('spelen'));
  $$('[data-sticker-id]').forEach((b) => b.addEventListener('click', () => {
    const item = items.find((i) => i.id === b.dataset.stickerId);
    bekijkSticker(item);
  }));
}

function bekijkSticker(item) {
  if (!item) return;
  openBlad(item.titel, `
    <img src="${item.src}" alt="${veilig(item.titel)}" style="width:100%;border-radius:var(--rond)" />
    <p class="klein gedempt" style="margin-top:10px">Gemaakt op ${datumNL(item.datum)}</p>
    <div class="stapel" style="margin-top:12px">
      <button type="button" class="knop knop--accent knop--vol" data-deel>Delen 📤</button>
      <button type="button" class="knop knop--zacht knop--vol" data-download>Opslaan op dit toestel ⬇️</button>
      <button type="button" class="knop knop--gevaar knop--vol" data-verwijder>Uit het plakboek halen</button>
    </div>`, (wortel) => {
    $('[data-deel]', wortel).addEventListener('click', async () => {
      const uitkomst = await deel(item.src, item.titel);
      if (uitkomst === 'geen-deelvenster') {
        download(item.src, 'pootwijzer-sticker.jpg');
        toast('Dit toestel heeft geen deelvenster — de sticker is opgeslagen.');
      }
    });
    $('[data-download]', wortel).addEventListener('click', () => download(item.src, 'pootwijzer-sticker.jpg'));
    $('[data-verwijder]', wortel).addEventListener('click', () => {
      opslag.verwijderPlakboek(item.id);
      sluitBlad(); tekenPlakboek(); toast('Verwijderd');
    });
  });
}

// --- Ik ---------------------------------------------------------------------

function tekenIk() {
  const lijst = opslag.dieren();
  $('#ik-inhoud').innerHTML = `
    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🐾</span><h2>Jouw dieren</h2></div>
      <div class="stapel">
        ${lijst.map((d) => {
          const { ras, leeftijd } = dierInfo(d);
          return `<div class="rij rij--tussen" style="padding:8px 0;border-bottom:1px solid var(--kaart-rand)">
            <span class="rij">${pasfoto(d)}<span><strong>${veilig(d.naam)}</strong><br />
              <span class="klein gedempt">${veilig(ras?.naam || d.soort)} · ${leeftijd.fase.naam}</span></span></span>
            <span class="rij" style="gap:6px">
              <button type="button" class="knop knop--zacht knop--klein" data-bewerk="${d.id}">Wijzigen</button>
              <button type="button" class="knop knop--gevaar knop--klein" data-verwijder="${d.id}">Weg</button>
            </span>
          </div>`;
        }).join('')}
      </div>
      <button type="button" class="knop knop--zacht" style="margin-top:12px" data-nieuw>+ Dier toevoegen</button>
    </section>

    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">🔒</span><h2>Je gegevens</h2></div>
      <p class="gedempt">Alles staat op dit toestel: geen account, geen server, geen advertenties. Naar buiten gaat alleen het weerbericht (Open-Meteo) en — alleen als je erop tikt — het opzoeken van je plaatsnaam.</p>
      <div class="stapel">
        <button type="button" class="knop knop--zacht knop--vol" data-backup>Back-up opslaan ⬇️</button>
        <label class="knop knop--zacht knop--vol" style="cursor:pointer">Back-up inlezen ⬆️
          <input type="file" accept="application/json" id="herstelinvoer" class="alleen-schermlezer" />
        </label>
        <button type="button" class="knop knop--gevaar knop--vol" data-wis>Alles verwijderen</button>
      </div>
    </section>

    <section class="kaart">
      <div class="kaart__kop"><span class="kaart__emoji" aria-hidden="true">ℹ️</span><h2>Over Pootwijzer</h2></div>
      <p class="gedempt">De adviezen komen uit richtlijnen van dierenartsenorganisaties en uit vaste rekenregels — niet uit een taalmodel dat ter plekke iets verzint. ${aiAan() ? 'De AI-extra’s staan aan.' : 'De AI-extra’s staan uit.'}</p>
      <p class="klein"><a href="docs/bronnen.md">Waar de adviezen vandaan komen</a> · <a href="docs/privacy.md">Privacy</a> · <a href="docs/ai.md">Over AI in deze app</a></p>
      <p class="advies advies--let_op klein" style="margin-top:12px"><strong>Belangrijk.</strong> Pootwijzer is geen dierenarts. Bij twijfel, pijn of plotselinge verandering bel je de praktijk.</p>
    </section>`;

  $$('[data-bewerk]').forEach((b) => b.addEventListener('click', () => {
    const dier = opslag.dieren().find((d) => d.id === b.dataset.bewerk);
    bewerkDier(dier);
  }));
  $$('[data-verwijder]').forEach((b) => b.addEventListener('click', () => {
    const dier = opslag.dieren().find((d) => d.id === b.dataset.verwijder);
    if (confirm(`${dier.naam} en alles wat erbij hoort verwijderen? Dit kan niet ongedaan gemaakt worden.`)) {
      opslag.verwijderDier(dier.id);
      if (!opslag.dieren().length) toon('welkom'); else tekenIk();
      toast('Verwijderd');
    }
  }));
  $('[data-nieuw]').addEventListener('click', kiesNieuwSoort);

  $('[data-backup]').addEventListener('click', () => {
    const blobUrl = URL.createObjectURL(new Blob([opslag.backup()], { type: 'application/json' }));
    download(blobUrl, `pootwijzer-backup-${new Date().toISOString().slice(0, 10)}.json`);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  });
  $('#herstelinvoer').addEventListener('change', async (e) => {
    const bestand = e.target.files?.[0];
    if (!bestand) return;
    try {
      const tekst = await bestand.text();
      const uitkomst = opslag.herstel(tekst);
      toast(`${uitkomst.dieren} dier(en) erbij`);
      tekenIk();
    } catch (err) { toast('Inlezen mislukte: ' + err.message); }
  });
  $('[data-wis]').addEventListener('click', () => {
    if (confirm('Alles verwijderen: dieren, foto’s, plakboek en herinneringen. Zeker weten?')) {
      opslag.wisAlles();
      toast('Alles is weg.');
      tekenWelkom(); toon('welkom');
    }
  });
}

function bewerkDier(dier) {
  if (!dier) return;
  openBlad(`${dier.naam} wijzigen`, `
    <form id="dierform">
      <label class="veld" for="w-naam"><span>Naam</span>
        <input type="text" id="w-naam" maxlength="24" value="${veilig(dier.naam)}" required />
      </label>
      <label class="veld" for="w-geboorte"><span>Geboortedatum</span>
        <input type="date" id="w-geboorte" value="${dier.geboortedatum}" max="${new Date().toISOString().split('T')[0]}" required />
      </label>
      <label class="veld" for="w-ras"><span>Ras</span>
        <select id="w-ras">
          ${rassenVoor(dier.soort).map((r) => `<option value="${r.id}" ${r.id === dier.rasId ? 'selected' : ''}>${veilig(r.naam)}</option>`).join('')}
        </select>
      </label>
      <button type="submit" class="knop knop--accent knop--vol">Opslaan</button>
    </form>`, (wortel) => {
    $('#dierform', wortel).addEventListener('submit', (e) => {
      e.preventDefault();
      opslag.werkDierBij(dier.id, {
        naam: $('#w-naam', wortel).value.trim() || dier.naam,
        geboortedatum: $('#w-geboorte', wortel).value || dier.geboortedatum,
        rasId: $('#w-ras', wortel).value
      });
      sluitBlad(); tekenIk(); toast('Opgeslagen');
    });
  });
}

// --- Starten ----------------------------------------------------------------

function start() {
  opslag.laad();
  tekenWelkom();
  toon(opslag.dieren().length ? 'vandaag' : 'welkom');

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline werkt dan niet, verder niets aan de hand */ });
  }
}

start();
