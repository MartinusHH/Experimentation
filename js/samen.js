/*
 * Offline!  —  samen doen
 *
 * Zonder server, zonder account: een uitnodiging is een link. Je kiest een
 * activiteit, een dag en een plek, en stuurt die link via het kanaal dat je
 * toch al gebruikt (WhatsApp, Signal, sms). Wie hem opent ziet de uitnodiging
 * in zijn eigen app staan en kan hem aannemen.
 *
 * Alles wat in die link staat, heb jij er zelf in gezet: je naam, de
 * activiteit, de dag en de plek. Er gaat niets naar een server, en de app
 * weet niet waar je bent.
 *
 * Voor het ontmoeten van onbekenden in de buurt is wél een server nodig;
 * hoe dat er minimaal uit zou zien staat in docs/samen.md.
 */

/* ─────────────────────────────────────────── link-codering ── */

function naarBasis64(tekst) {
  const bytes = new TextEncoder().encode(tekst);
  let ruw = '';
  bytes.forEach((b) => { ruw += String.fromCharCode(b); });
  return btoa(ruw).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function uitBasis64(code) {
  const ruw = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(ruw, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ───────────────────────────────────────────── uitnodiging ── */

function maakPlan({ activiteitId, titel, datum, tijd, plaats, notitie, naam }) {
  return {
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    activiteitId: activiteitId || '',
    titel, datum, tijd: tijd || '',
    plaats: plaats || '', notitie: notitie || '',
    naam: naam || '', rol: 'ik', status: 'gaat'
  };
}

/** De uitnodiging als deelbare link. Alleen wat de gastheer zelf invulde. */
function uitnodigingsLink(plan) {
  const inhoud = naarBasis64(JSON.stringify({
    v: 1, a: plan.activiteitId, t: plan.titel, d: plan.datum,
    u: plan.tijd, p: plan.plaats, n: plan.naam, o: plan.notitie
  }));
  const basis = `${location.origin}${location.pathname}`;
  return `${basis}#samen=${inhoud}`;
}

/** Leest een uitnodiging uit een link. Geeft null als er niets bruikbaars staat. */
function planUitLink(hash) {
  const treffer = /[#&]samen=([A-Za-z0-9\-_]+)/.exec(hash || '');
  if (!treffer) return null;
  try {
    const d = JSON.parse(uitBasis64(treffer[1]));
    if (!d || d.v !== 1 || !d.t || !d.d) return null;
    return {
      id: `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      activiteitId: String(d.a || '').slice(0, 60),
      titel: String(d.t).slice(0, 120),
      datum: String(d.d).slice(0, 10),
      tijd: String(d.u || '').slice(0, 5),
      plaats: String(d.p || '').slice(0, 60),
      notitie: String(d.o || '').slice(0, 240),
      naam: String(d.n || '').slice(0, 40),
      rol: 'gast', status: 'open'
    };
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────── plannen ── */

function bewaarPlan(state, plan) {
  state.plannen = [plan, ...(state.plannen || []).filter((p) => p.id !== plan.id)].slice(0, 100);
}

function verwijderPlan(state, id) {
  state.plannen = (state.plannen || []).filter((p) => p.id !== id);
}

function plannenOp(state, datumsleutel) {
  return (state.plannen || []).filter((p) => p.datum === datumsleutel && p.status !== 'af');
}

/** Alles van vandaag en later, oplopend op datum. */
function komendePlannen(state) {
  const vandaag = dagSleutel();
  return (state.plannen || [])
    .filter((p) => p.datum >= vandaag && p.status !== 'af')
    .sort((a, b) => (a.datum + a.tijd).localeCompare(b.datum + b.tijd));
}

function planLabel(plan) {
  const dag = datumLabel(plan.datum);
  return plan.tijd ? `${dag} om ${plan.tijd}` : dag;
}

/** Activiteiten die zich lenen om samen te doen. */
function magSamen(activiteit) {
  return activiteit.sociaal === 'samen' || activiteit.sociaal === 'beide';
}

/* ─────────────────────────────────────── profiel-helpers ── */

const LEEG_PROFIEL = { naam: '', foto: '', bio: '', samen: false, straal: 2 };

/** Verkleint een gekozen foto tot een vierkant van 256px, zodat hij klein blijft. */
function verkleinFoto(bestand, formaat = 256) {
  return new Promise((klaar, mis) => {
    if (!bestand || !bestand.type.startsWith('image/')) return mis(new Error('Kies een afbeelding.'));
    const lezer = new FileReader();
    lezer.onerror = () => mis(new Error('Deze foto kon ik niet lezen.'));
    lezer.onload = () => {
      const beeld = new Image();
      beeld.onerror = () => mis(new Error('Deze foto kon ik niet openen.'));
      beeld.onload = () => {
        const zijde = Math.min(beeld.width, beeld.height);
        const doek = document.createElement('canvas');
        doek.width = doek.height = formaat;
        const pen = doek.getContext('2d');
        pen.drawImage(beeld, (beeld.width - zijde) / 2, (beeld.height - zijde) / 2, zijde, zijde, 0, 0, formaat, formaat);
        klaar(doek.toDataURL('image/jpeg', 0.82));
      };
      beeld.src = lezer.result;
    };
    lezer.readAsDataURL(bestand);
  });
}

function initialen(naam) {
  const delen = (naam || '').trim().split(/\s+/).filter(Boolean);
  if (!delen.length) return '🙂';
  return delen.slice(0, 2).map((d) => d[0].toUpperCase()).join('');
}
