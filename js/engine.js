/*
 * Offline!  —  suggestie-motor
 *
 * Geeft elke activiteit een score op basis van je profiel, je filters
 * en (optioneel) het actuele weer. Hoogste scores komen bovenaan.
 */

const KOSTEN_RANG = { gratis: 0, klein: 1, investering: 2 };
const KOSTEN_LABEL = { gratis: 'Gratis', klein: 'Kleine uitgave', investering: 'Mag wat kosten' };
const ENERGIE_LABEL = { 1: 'Rustig', 2: 'Gemiddeld', 3: 'Actief' };

/**
 * @param {object} opties
 *   interesses  {string[]}  gekozen interesse-ids
 *   tijd        {number}    beschikbare minuten
 *   budget      {'gratis'|'klein'|'investering'}
 *   plek        {'binnen'|'buiten'|'egaal'}
 *   sociaal     {'alleen'|'samen'|'egaal'}
 *   energie     {1|2|3}
 *   weer        {object|null}  resultaat van haalWeer()
 *   vermijd     {string[]}     ids die je net hebt gezien
 *   favorieten  {string[]}
 */
function suggesties(opties) {
  const {
    interesses = [], tijd = 60, budget = 'investering',
    plek = 'egaal', sociaal = 'egaal', energie = 2,
    weer = null, vermijd = [], favorieten = [], plus = false, samenVoorkeur = false
  } = opties;

  const buitenIsFijn = weer ? weer.buitenScore >= 60 : null;

  const gescoord = ACTIVITEITEN.map((a) => {
    let score = 50;
    const redenen = [];

    /* --- harde filters ------------------------------------------------- */
    if (a.tijd > tijd * 1.2) return null;                          // past echt niet in je tijd
    if (KOSTEN_RANG[a.kosten] > KOSTEN_RANG[budget]) return null;  // duurder dan je wil
    if (plek !== 'egaal' && a.plek !== 'beide' && a.plek !== plek) return null;
    if (sociaal !== 'egaal' && a.sociaal !== 'beide' && a.sociaal !== sociaal) return null;

    /* --- interesses ---------------------------------------------------- */
    const raak = a.interesses.filter((i) => interesses.includes(i));
    if (interesses.length) {
      score += Math.min(raak.length, 2) * 30;
      if (raak.length === 0) score -= 25;
      raak.forEach((id) => {
        const info = INTERESSES.find((i) => i.id === id);
        if (info && redenen.length < 2) redenen.push(`${info.emoji} ${info.label}`);
      });
    }

    /* --- tijd ---------------------------------------------------------- */
    const verhouding = a.tijd / tijd;
    if (verhouding <= 1) {
      score += 15 - Math.round((1 - verhouding) * 12);  // liefst een activiteit die je tijd goed vult
      redenen.push(`Past in ${formatteerTijd(a.tijd)}`);
    } else {
      score -= 10;
      redenen.push(`Duurt ~${formatteerTijd(a.tijd)}`);
    }

    /* --- kosten -------------------------------------------------------- */
    if (a.kosten === 'gratis') { score += budget === 'gratis' ? 15 : 6; redenen.push('Gratis'); }
    else redenen.push(a.kostenIndicatie || KOSTEN_LABEL[a.kosten]);

    /* --- energie ------------------------------------------------------- */
    score -= Math.abs(a.energie - energie) * 10;

    /* --- weer ---------------------------------------------------------- */
    if (weer && a.plek !== 'binnen') {
      if (buitenIsFijn) {
        score += a.weerAfhankelijk ? 18 : 8;
        redenen.push(`Nu buiten: ${weer.korteTekst}`);
      } else if (a.plek === 'buiten') {
        score -= a.weerAfhankelijk ? 45 : 30;
        redenen.push(`Weer zit tegen (${weer.korteTekst})`);
      } else if (a.weerAfhankelijk) {
        score -= 20;
      }
    }
    if (weer && a.plek === 'binnen' && buitenIsFijn === false) score += 10;

    /* --- samen doen ---------------------------------------------------- */
    // Wie in zijn profiel aangaf dingen graag samen te doen, krijgt vaker
    // activiteiten waar een tweede persoon bij hoort.
    if (samenVoorkeur && a.sociaal === 'samen') score += 14;

    /* --- Offline+ ------------------------------------------------------ */
    // Pakket-activiteiten blijven zichtbaar zonder abonnement, maar dringen
    // zich niet op: ze staan net iets lager.
    if (a.plus && !plus) score -= 8;

    /* --- variatie ------------------------------------------------------ */
    if (vermijd.includes(a.id)) score -= 45;
    if (favorieten.includes(a.id)) score += 12;
    score += Math.random() * 12;

    return {
      activiteit: a, score, raak,
      redenen: redenen.slice(0, 4),
      vergrendeld: Boolean(a.plus && !plus)
    };
  }).filter(Boolean);

  gescoord.sort((x, y) => y.score - x.score);
  return gescoord;
}

function formatteerTijd(minuten) {
  if (minuten < 60) return `${minuten} min`;
  const uren = minuten / 60;
  return Number.isInteger(uren) ? `${uren} uur` : `${Math.floor(uren)},5 uur`;
}

/** Zoeklink voor "hoe doe ik dit" of "waar kan dit bij mij in de buurt". */
function zoekLink(activiteit, plaats) {
  const term = activiteit.zoek || activiteit.titel;
  const query = plaats && /in de buurt|workshop|café|club|museum|route/i.test(term)
    ? term.replace(/in de buurt/i, plaats) + (term.includes(plaats) ? '' : ` ${plaats}`)
    : term;
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}
