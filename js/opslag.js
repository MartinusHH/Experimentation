/*
 * Offline!  —  opslag
 *
 * Eén plek waar de gegevens van de app vandaan komen en weer heen gaan.
 * Nu is dat de browseropslag van dit toestel; komt er later een account bij
 * (zie js/cloud.js en docs/account.md), dan hoeft alleen deze module te weten
 * dat er ook een tweede bestemming is.
 *
 * De back-up hieronder is niet alleen handig om te verhuizen: het is precies
 * het formaat waarmee de cloud-sync straks werkt, en `voegSamen` is de regel
 * die dan bepaalt wie er wint als twee toestellen dezelfde dag beschreven.
 */

const OPSLAG_SLEUTEL = 'offline-app-v3';
const OUDE_SLEUTELS = ['offline-app-v2', 'offline-app-v1'];
const SCHEMA_VERSIE = 3;
const APPARAAT_SLEUTEL = 'offline-apparaat';

/* ───────────────────────────────────────────── lezen ── */

function laadState(standaard) {
  const ruw = leesRuw(OPSLAG_SLEUTEL) || pakOudeVersieOver();
  if (!ruw) return verseState(standaard);
  try {
    return vulAan(JSON.parse(ruw), standaard);
  } catch {
    return verseState(standaard);
  }
}

function leesRuw(sleutel) {
  try { return localStorage.getItem(sleutel); } catch { return null; }
}

/** Bestaande gebruikers mogen niets kwijtraken als het schema opschuift. */
function pakOudeVersieOver() {
  for (const sleutel of OUDE_SLEUTELS) {
    const ruw = leesRuw(sleutel);
    if (ruw) {
      try { localStorage.setItem(OPSLAG_SLEUTEL, ruw); } catch { /* privémodus */ }
      return ruw;
    }
  }
  return null;
}

function verseState(standaard) {
  return {
    ...standaard,
    versie: SCHEMA_VERSIE,
    filters: { ...standaard.filters },
    profiel: { ...standaard.profiel },
    account: { ...standaard.account },
    dagboek: {}, plannen: [], gedaan: [], favorieten: [], gezien: [], interesses: []
  };
}

function vulAan(opgeslagen, standaard) {
  return {
    ...standaard, ...opgeslagen,
    versie: SCHEMA_VERSIE,
    filters: { ...standaard.filters, ...(opgeslagen.filters || {}) },
    profiel: { ...standaard.profiel, ...(opgeslagen.profiel || {}) },
    account: { ...standaard.account, ...(opgeslagen.account || {}) },
    dagboek: opgeslagen.dagboek || {},
    plannen: opgeslagen.plannen || [],
    gedaan: opgeslagen.gedaan || [],
    favorieten: opgeslagen.favorieten || [],
    gezien: opgeslagen.gezien || [],
    interesses: opgeslagen.interesses || []
  };
}

/* ──────────────────────────────────────────── schrijven ── */

function bewaarState(state) {
  try {
    localStorage.setItem(OPSLAG_SLEUTEL, JSON.stringify(state));
  } catch {
    return false;   // privémodus of vol; de app blijft gewoon werken
  }
  if (typeof synchroniseerAlsMogelijk === 'function') synchroniseerAlsMogelijk(state);
  return true;
}

/** Grofweg hoeveel ruimte de gegevens innemen, in bytes. */
function opslagGrootte() {
  const ruw = leesRuw(OPSLAG_SLEUTEL);
  return ruw ? ruw.length : 0;
}

/** De browseropslag is ~5 MB; hierboven wordt het tijd voor een back-up. */
function opslagBijnaVol() {
  return opslagGrootte() > 4e6;
}

/** Vaste, anonieme sleutel van dit toestel — voor het koppelen aan een account. */
function apparaatSleutel() {
  let sleutel = leesRuw(APPARAAT_SLEUTEL);
  if (!sleutel) {
    sleutel = (crypto.randomUUID && crypto.randomUUID()) ||
      `a-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    try { localStorage.setItem(APPARAAT_SLEUTEL, sleutel); } catch { /* privémodus */ }
  }
  return sleutel;
}

function wisAlles() {
  try {
    localStorage.removeItem(OPSLAG_SLEUTEL);
    localStorage.removeItem(APPARAAT_SLEUTEL);   // ook de anonieme sleutel gaat weg
    OUDE_SLEUTELS.forEach((s) => localStorage.removeItem(s));
  } catch { /* niets */ }
}

/* ─────────────────────────────────────────────── back-up ── */

function maakBackup(state) {
  return JSON.stringify({
    app: 'offline!', versie: SCHEMA_VERSIE,
    gemaakt: new Date().toISOString(),
    apparaat: apparaatSleutel(),
    state
  }, null, 2);
}

function backupBestandsnaam() {
  return `offline-backup-${dagSleutel()}.json`;
}

/** Leest een back-upbestand en zegt in gewone taal wat er mis is. */
function leesBackup(tekst) {
  let data;
  try {
    data = JSON.parse(tekst);
  } catch {
    throw new Error('Dit bestand kon ik niet lezen. Kies het back-upbestand van Offline! (.json).');
  }
  if (!data || data.app !== 'offline!' || !data.state) {
    throw new Error('Dit is geen back-up van Offline!.');
  }
  if (data.versie > SCHEMA_VERSIE) {
    throw new Error('Deze back-up komt uit een nieuwere versie van de app. Werk de app eerst bij.');
  }
  return data;
}

/**
 * Voegt een back-up bij de huidige gegevens. Samenvoegen, niet overschrijven:
 * wie op twee toestellen schreef, raakt niets kwijt.
 * Geeft terug wat er is gebeurd, zodat de gebruiker het vooraf kan zien.
 */
function voegSamen(state, backup, alleenTellen = false) {
  const bron = backup.state || {};
  const telling = { bladzijden: 0, bijgewerkt: 0, activiteiten: 0, plannen: 0, favorieten: 0, interesses: 0 };
  const doel = alleenTellen ? null : state;

  /* dagboek: per datum wint de nieuwste bewerking */
  Object.entries(bron.dagboek || {}).forEach(([datum, pagina]) => {
    const hier = state.dagboek[datum];
    if (!hier) {
      telling.bladzijden++;
      if (doel) doel.dagboek[datum] = pagina;
    } else if ((pagina.bijgewerkt || 0) > (hier.bijgewerkt || 0)) {
      telling.bijgewerkt++;
      if (doel) doel.dagboek[datum] = pagina;
    }
  });

  /* lijsten met een id: samenvoegen op id */
  const voegLijstSamen = (naam, sleutel) => {
    const bestaand = new Set((state[naam] || []).map((x) => x[sleutel]));
    (bron[naam] || []).forEach((item) => {
      if (item && !bestaand.has(item[sleutel])) {
        bestaand.add(item[sleutel]);
        if (naam === 'gedaan') telling.activiteiten++; else telling.plannen++;
        if (doel) doel[naam] = [...doel[naam], item];
      }
    });
  };
  voegLijstSamen('gedaan', 'id');
  voegLijstSamen('plannen', 'id');

  /* verzamelingen: alles wat er nog niet in zat */
  ['favorieten', 'interesses'].forEach((naam) => {
    (bron[naam] || []).forEach((waarde) => {
      if (!state[naam].includes(waarde)) {
        telling[naam]++;
        if (doel) doel[naam] = [...doel[naam], waarde];
      }
    });
  });

  if (doel) {
    /* profiel en instellingen: alleen invullen wat hier nog leeg is */
    ['naam', 'foto', 'bio'].forEach((veld) => {
      if (!doel.profiel[veld] && bron.profiel && bron.profiel[veld]) doel.profiel[veld] = bron.profiel[veld];
    });
    if (!doel.plaats && bron.plaats) doel.plaats = bron.plaats;

    /* een lopend abonnement of proefperiode uit de back-up blijft geldig */
    if (bron.plan === 'plus' && doel.plan !== 'plus') { doel.plan = 'plus'; doel.plusTot = bron.plusTot || null; }
    if (bron.proefTot && !doel.proefTot) doel.proefTot = bron.proefTot;

    /* zodat de dagboekbladzijden ook echt bestaan als de gedaan-lijst groeide */
    doel.gedaan.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
  }

  return telling;
}

/** Eén regel Nederlands over wat er gaat gebeuren. */
function tellingInWoorden(t) {
  const delen = [];
  if (t.bladzijden) delen.push(`${t.bladzijden} nieuwe ${t.bladzijden === 1 ? 'bladzijde' : 'bladzijden'}`);
  if (t.bijgewerkt) delen.push(`${t.bijgewerkt} bijgewerkte ${t.bijgewerkt === 1 ? 'bladzijde' : 'bladzijden'}`);
  if (t.activiteiten) delen.push(`${t.activiteiten} ${t.activiteiten === 1 ? 'activiteit' : 'activiteiten'}`);
  if (t.plannen) delen.push(`${t.plannen} ${t.plannen === 1 ? 'plan' : 'plannen'}`);
  if (t.favorieten) delen.push(t.favorieten === 1 ? '1 bewaard idee' : `${t.favorieten} bewaarde ideeën`);
  if (t.interesses) delen.push(`${t.interesses} ${t.interesses === 1 ? 'interesse' : 'interesses'}`);
  if (!delen.length) return 'Er staat niets in deze back-up wat je hier nog niet hebt.';
  return `Dit komt erbij: ${delen.join(', ')}.`;
}
