/*
 * Offline!  —  verdienmodel
 *
 * Drie inkomstenbronnen, oplopend van "werkt vanaf dag één" naar
 * "werkt als de app loopt":
 *
 *   1. Advertenties in de gratis versie (js/advertenties.js), plus affiliate
 *      op materialen: elk idee heeft benodigdheden, en die linken we naar een
 *      winkel met je partner-id erachter.
 *   2. Offline+ (abonnement). Haalt de advertenties weg en geeft extra
 *      activiteitenpakketten, je hele dagboekarchief, export en de weekplanner.
 *   3. Lokale partners. Workshops en clubs die in het buurt-scherm
 *      opvallen; betaald per maand of per aanmelding.
 *
 * Vul CONFIG in om ze te activeren; zonder configuratie valt alles terug op
 * gewone zoeklinks en blijft de app volledig bruikbaar.
 * Zie docs/verdienmodel.md voor de stappen en de cijfers erachter.
 */

const CONFIG = {
  /* Offline+ — checkout draait bij Lemon Squeezy (merchant of record: die
     regelt btw en facturen). Licenties valideren mag vanuit de browser,
     dus je hebt hiervoor geen eigen server nodig. */
  winkelMaand: '',            // bijv. https://jouwwinkel.lemonsqueezy.com/buy/<uuid>
  winkelJaar: '',
  licentieApi: 'https://api.lemonsqueezy.com/v1/licenses/validate',

  /* Affiliate — bol.com Partnerprogramma (NL/BE) */
  bolPartnerId: '',           // je ADVID uit het partnerprogramma

  /* Lokale partners — waar aanmeldingen binnenkomen */
  partnerMail: '',

  prijsMaand: '€3,-',
  prijsJaar: '€30,-',
  proefDagen: 14
};

const PLUS_VOORDELEN = [
  ['🚫', 'Geen advertenties', 'De reclameplekken verdwijnen uit Ontdek en Samen.'],
  ['🎁', 'Extra activiteitenpakketten', 'Met kinderen, samen, per seizoen — nieuwe sets elke maand.'],
  ['📚', 'Je hele dagboekarchief', 'Gratis lees je de laatste 7 dagen terug, met Plus alles.'],
  ['📤', 'Dagboek exporteren', 'Alles als tekstbestand, om te bewaren of te printen.'],
  ['🗓️', 'Weekplanner', 'Zet ideeën vooruit in je week en krijg een seintje.']
];

/* ─────────────────────────────────────────── plan-status ── */

function heeftPlus(state) {
  // Is er een account, dan is de server de baas over de rechten; pas daarna
  // kijken we naar de licentie op dit toestel. Zie js/cloud.js en docs/account.md.
  const rechten = state.account && state.account.rechten;
  if (rechten && rechten.plusTot && new Date(rechten.plusTot) > new Date()) return true;

  if (state.plan === 'plus' && (!state.plusTot || new Date(state.plusTot) > new Date())) return true;
  return proefDagenOver(state) > 0;
}

function proefDagenOver(state) {
  if (!state.proefTot) return 0;
  const over = Math.ceil((new Date(state.proefTot) - Date.now()) / 864e5);
  return Math.max(0, over);
}

function proefGebruikt(state) { return Boolean(state.proefTot); }

function startProef(state) {
  if (proefGebruikt(state)) return false;
  const tot = new Date(Date.now() + CONFIG.proefDagen * 864e5);
  state.proefTot = tot.toISOString();
  return true;
}

function planOmschrijving(state) {
  const rechten = state.account && state.account.rechten;
  if (rechten && rechten.plusTot && new Date(rechten.plusTot) > new Date()) {
    return `Offline+ via je account, tot ${new Date(rechten.plusTot).toLocaleDateString('nl-NL')}`;
  }
  if (state.plan === 'plus') {
    return state.plusTot
      ? `Offline+ actief tot ${new Date(state.plusTot).toLocaleDateString('nl-NL')}`
      : 'Offline+ actief';
  }
  const over = proefDagenOver(state);
  if (over > 0) return `Proefperiode: nog ${over} ${over === 1 ? 'dag' : 'dagen'}`;
  return 'Gratis versie';
}

/* ─────────────────────────────────────────── licenties ── */

/**
 * Controleert een licentiesleutel. Met een gekoppelde winkel gaat dat via de
 * validatie-API van Lemon Squeezy; die verwacht geen geheime sleutel, dus het
 * kan rechtstreeks vanuit de browser.
 */
async function valideerLicentie(sleutel) {
  const code = (sleutel || '').trim();
  if (!code) throw new Error('Vul je licentiesleutel in.');

  if (!CONFIG.winkelMaand && !CONFIG.winkelJaar) {
    // Nog geen winkel gekoppeld: alleen de testcode werkt.
    if (code.toUpperCase() === 'OFFLINE-TEST') {
      return { geldig: true, tot: new Date(Date.now() + 30 * 864e5).toISOString(), test: true };
    }
    throw new Error('Er is nog geen winkel gekoppeld aan deze app. Gebruik OFFLINE-TEST om de Plus-functies te bekijken.');
  }

  const res = await fetch(CONFIG.licentieApi, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ license_key: code })
  });
  if (!res.ok) throw new Error('De winkel reageert niet. Probeer het straks nog eens.');
  const data = await res.json();
  if (!data.valid) throw new Error('Deze sleutel is niet geldig of al verlopen.');

  return { geldig: true, tot: data.license_key && data.license_key.expires_at ? data.license_key.expires_at : null };
}

function koopUrl(periode) {
  return periode === 'jaar' ? CONFIG.winkelJaar : CONFIG.winkelMaand;
}

/* ───────────────────────────────────────────── affiliate ── */

/**
 * Link naar de spullen die je voor een activiteit nodig hebt.
 * Met een partner-id gaat dat naar de winkel, zonder id naar een gewone zoekpagina.
 */
function materiaalLink(term) {
  const zoek = encodeURIComponent(term);
  if (CONFIG.bolPartnerId) {
    return `https://www.bol.com/nl/nl/s/?searchtext=${zoek}&Referrer=ADVID=${encodeURIComponent(CONFIG.bolPartnerId)}`;
  }
  return `https://duckduckgo.com/?q=${zoek}+kopen`;
}

function affiliateActief() { return Boolean(CONFIG.bolPartnerId); }

/* ────────────────────────────────────── lokale partners ── */

/** Betaalde plekken in het buurt-scherm. Leeg tot er echt partners zijn. */
const PARTNERS = [];

function partnerAanmeldLink(plaats) {
  if (CONFIG.partnerMail) {
    const onderwerp = encodeURIComponent(`Aanmelding partner Offline! (${plaats || 'onbekend'})`);
    return `mailto:${CONFIG.partnerMail}?subject=${onderwerp}`;
  }
  return '';
}
