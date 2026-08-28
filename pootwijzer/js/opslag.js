// Alles wat je invult blijft op je eigen toestel (localStorage). Er is geen
// account en er gaat geen dossier naar een server. Wil je verhuizen naar een
// nieuw toestel, dan maak je een back-upbestand.

const SLEUTEL = 'pootwijzer.v1';

const LEEG = {
  versie: 1,
  dieren: [],
  actiefId: null,
  plakboek: [],
  agenda: [],
  instellingen: { plaats: '', lat: null, lon: null, weerGezien: null }
};

let staat = null;

export function laad() {
  if (staat) return staat;
  try {
    const ruw = localStorage.getItem(SLEUTEL);
    staat = ruw ? { ...LEEG, ...JSON.parse(ruw) } : structuredClone(LEEG);
  } catch {
    staat = structuredClone(LEEG);
  }
  staat.instellingen = { ...LEEG.instellingen, ...(staat.instellingen || {}) };
  return staat;
}

export function bewaar() {
  try {
    localStorage.setItem(SLEUTEL, JSON.stringify(staat));
    return { ok: true };
  } catch (err) {
    // Meestal: de opslag zit vol door foto's.
    return { ok: false, fout: 'vol' };
  }
}

export const dieren = () => laad().dieren;
export const actiefDier = () => laad().dieren.find((d) => d.id === laad().actiefId) || null;

export function kiesDier(id) {
  laad().actiefId = id;
  bewaar();
}

export function voegDierToe(dier) {
  const s = laad();
  const nieuw = { id: 'd' + Date.now().toString(36), aangemaakt: new Date().toISOString(), ...dier };
  s.dieren.push(nieuw);
  s.actiefId = nieuw.id;
  bewaar();
  return nieuw;
}

export function werkDierBij(id, velden) {
  const dier = laad().dieren.find((d) => d.id === id);
  if (!dier) return null;
  Object.assign(dier, velden);
  const res = bewaar();
  return res.ok ? dier : null;
}

export function verwijderDier(id) {
  const s = laad();
  s.dieren = s.dieren.filter((d) => d.id !== id);
  s.plakboek = s.plakboek.filter((p) => p.dierId !== id);
  s.agenda = s.agenda.filter((a) => a.dierId !== id);
  if (s.actiefId === id) s.actiefId = s.dieren[0]?.id || null;
  bewaar();
}

// --- Plakboek ---------------------------------------------------------------

export function plakboekVoor(dierId) {
  return laad().plakboek.filter((p) => p.dierId === dierId);
}

export function voegPlakboekToe(item) {
  const s = laad();
  s.plakboek.unshift({ id: 'p' + Date.now().toString(36), datum: new Date().toISOString(), ...item });
  // Ruim de oudste op als de opslag vol raakt; het plakboek mag de app niet blokkeren.
  let res = bewaar();
  while (!res.ok && s.plakboek.length > 1) {
    s.plakboek.pop();
    res = bewaar();
  }
  return res;
}

export function verwijderPlakboek(id) {
  const s = laad();
  s.plakboek = s.plakboek.filter((p) => p.id !== id);
  bewaar();
}

// --- Agenda: herinneringen die je zelf bijhoudt ------------------------------

export const AGENDA_SOORTEN = [
  { id: 'ontworming', naam: 'Ontworming', emoji: '🪱', standaardDagen: 90 },
  { id: 'vlooien', naam: 'Vlooien- en tekenmiddel', emoji: '🦟', standaardDagen: 30 },
  { id: 'enting', naam: 'Inenting', emoji: '💉', standaardDagen: 365 },
  { id: 'nagels', naam: 'Nagels knippen', emoji: '💅', standaardDagen: 30 },
  { id: 'weging', naam: 'Wegen', emoji: '⚖️', standaardDagen: 30 },
  { id: 'controle', naam: 'Controle dierenarts', emoji: '🩺', standaardDagen: 365 }
];

export function agendaVoor(dierId) {
  const nu = Date.now();
  return laad().agenda
    .filter((a) => a.dierId === dierId)
    .map((a) => {
      const soort = AGENDA_SOORTEN.find((s) => s.id === a.type);
      const volgende = new Date(new Date(a.laatst).getTime() + a.dagen * 86400000);
      const dagenTeGaan = Math.ceil((volgende - nu) / 86400000);
      return { ...a, soort, volgende, dagenTeGaan, status: dagenTeGaan < 0 ? 'over' : dagenTeGaan <= 7 ? 'bijna' : 'ok' };
    })
    .sort((a, b) => a.dagenTeGaan - b.dagenTeGaan);
}

export function zetAgenda(dierId, type, laatst, dagen) {
  const s = laad();
  const bestaand = s.agenda.find((a) => a.dierId === dierId && a.type === type);
  if (bestaand) Object.assign(bestaand, { laatst, dagen });
  else s.agenda.push({ id: 'a' + Date.now().toString(36), dierId, type, laatst, dagen });
  bewaar();
}

export function verwijderAgenda(id) {
  const s = laad();
  s.agenda = s.agenda.filter((a) => a.id !== id);
  bewaar();
}

// --- Back-up en wissen ------------------------------------------------------

export function backup() {
  return JSON.stringify({ app: 'pootwijzer', geexporteerd: new Date().toISOString(), data: laad() }, null, 2);
}

export function herstel(json) {
  const binnen = JSON.parse(json);
  const data = binnen.data || binnen;
  if (!data || !Array.isArray(data.dieren)) throw new Error('Dit bestand hoort niet bij Pootwijzer.');
  const s = laad();
  // Samenvoegen in plaats van overschrijven: bestaande dieren blijven staan.
  const bestaandeIds = new Set(s.dieren.map((d) => d.id));
  const nieuweDieren = data.dieren.filter((d) => !bestaandeIds.has(d.id));
  s.dieren.push(...nieuweDieren);
  const plakIds = new Set(s.plakboek.map((p) => p.id));
  s.plakboek.push(...(data.plakboek || []).filter((p) => !plakIds.has(p.id)));
  const agIds = new Set(s.agenda.map((a) => a.id));
  s.agenda.push(...(data.agenda || []).filter((a) => !agIds.has(a.id)));
  if (!s.actiefId) s.actiefId = s.dieren[0]?.id || null;
  bewaar();
  return { dieren: nieuweDieren.length, plakboek: (data.plakboek || []).length };
}

export function wisAlles() {
  try { localStorage.removeItem(SLEUTEL); } catch { /* niets */ }
  try { localStorage.removeItem('hg.weer.cache'); } catch { /* niets */ }
  staat = structuredClone(LEEG);
}

// --- Foto's kleiner maken vóór ze worden opgeslagen --------------------------

export function verkleinFoto(file, max = 640, kwaliteit = 0.85) {
  return new Promise((resolve, reject) => {
    const lezer = new FileReader();
    lezer.onerror = () => reject(new Error('Kon het bestand niet lezen.'));
    lezer.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Dit lijkt geen foto te zijn.'));
      img.onload = () => {
        const schaal = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * schaal);
        canvas.height = Math.round(img.height * schaal);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', kwaliteit));
      };
      img.src = lezer.result;
    };
    lezer.readAsDataURL(file);
  });
}
