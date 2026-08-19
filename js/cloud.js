/*
 * Offline!  —  cloud (nog niet aangesloten)
 *
 * Alles waarvoor een server nodig is, loopt via deze ene laag: inloggen,
 * je gegevens op meerdere toestellen, het abonnement, en later het
 * buurtprikbord uit docs/samen.md.
 *
 * Zolang CLOUD.aanbieder leeg is, geeft elke functie hieronder netjes null
 * terug en gedraagt de app zich precies zoals nu: alles op je eigen toestel,
 * geen account, geen verkeer. Er staan dus ook geen knoppen in beeld die
 * niets doen — de account-kaart op het Ik-scherm kijkt naar `cloudActief()`.
 *
 * Aanzetten: vul CLOUD in volgens het stappenplan in docs/account.md. Daar
 * staat ook welke Firebase-modules je laadt, hoe de gegevens eruitzien en
 * welke beveiligingsregels erbij horen.
 */

const CLOUD = {
  aanbieder: '',            // '' | 'firebase'
  firebase: {
    apiKey: '', authDomain: '', projectId: '', appId: ''
  },
  /* Hoe vaak we hooguit omhoog synchroniseren, in milliseconden. */
  syncPauze: 15000
};

function cloudActief() {
  return CLOUD.aanbieder === 'firebase' && Boolean(CLOUD.firebase.apiKey);
}

/* ─────────────────────────────────────────── inloggen ── */

/** @returns {Promise<{uid,email,naam,foto}|null>} */
async function meldAanMetGoogle() {
  if (!cloudActief()) return null;
  throw new Error('Inloggen is nog niet aangesloten. Zie docs/account.md.');
}

async function meldAf() {
  if (!cloudActief()) return null;
  throw new Error('Uitloggen is nog niet aangesloten. Zie docs/account.md.');
}

/** De ingelogde gebruiker, of null. Mag synchroon blijven: de app leest dit vaak. */
function huidigeGebruiker() {
  return null;
}

/* ─────────────────────────────────────────── abonnement ── */

/**
 * De rechten van dit account. De server is hierin de baas — de app mag ze
 * alleen lezen. Zo is Offline+ niet meer te omzeilen door de opslag aan te
 * passen, wat nu nog wel kan (zie docs/verdienmodel.md).
 * @returns {Promise<{plusTot: string|null}|null>}
 */
async function haalRechten(uid) {
  if (!cloudActief() || !uid) return null;
  return null;
}

/* ────────────────────────────────────── gegevens synchroniseren ── */

/**
 * Omhoog en omlaag. Het formaat is hetzelfde als dat van de back-up
 * (js/opslag.js), en samenvoegen doet `voegSamen` — dus twee toestellen die
 * allebei schreven, raken niets kwijt.
 */
async function duwState(uid, state) {
  if (!cloudActief() || !uid) return null;
  return null;
}

async function haalState(uid) {
  if (!cloudActief() || !uid) return null;
  return null;
}

/**
 * Alles van dit account weggooien: het document, de subcollecties en het
 * inlogaccount zelf. Verplicht zodra er gegevens op een server staan — de
 * knop in de app roept dit aan zodra er een account is.
 */
async function verwijderAccount(uid) {
  if (!cloudActief() || !uid) return null;
  throw new Error('Verwijderen in de cloud is nog niet aangesloten. Zie docs/account.md.');
}

/* ──────────────────────────────────────── buurtprikbord ── */

/** Open uitnodigingen plaatsen en zoeken. Ontwerp: docs/samen.md. */
async function plaatsOpenUitnodiging(plan, gebied) {
  if (!cloudActief()) return null;
  return null;
}

async function zoekInBuurt(gebied, straal) {
  if (!cloudActief()) return [];
  return [];
}
