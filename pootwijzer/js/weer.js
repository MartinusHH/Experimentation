// Het weer, en wat dat vandaag betekent voor jouw dier.
//
// Live en zonder sleutel: Open-Meteo voor het weer, Nominatim voor de
// plaatsnaam (alleen als je er zelf om vraagt). Het advies komt uit vaste
// regels — geen AI die iets verzint over de gezondheid van je dier.
// De grenswaarden staan met bron in docs/bronnen.md.

const CACHE_MS = 30 * 60 * 1000;
const CACHE_SLEUTEL = 'hg.weer.cache';

export const WEERCODES = {
  0: ['Helder', '☀️'], 1: ['Vrijwel onbewolkt', '🌤️'], 2: ['Half bewolkt', '⛅'], 3: ['Bewolkt', '☁️'],
  45: ['Mist', '🌫️'], 48: ['Aanvriezende mist', '🌫️'],
  51: ['Motregen', '🌦️'], 53: ['Motregen', '🌦️'], 55: ['Motregen', '🌦️'],
  61: ['Lichte regen', '🌧️'], 63: ['Regen', '🌧️'], 65: ['Harde regen', '🌧️'],
  66: ['IJzel', '🧊'], 67: ['IJzel', '🧊'],
  71: ['Lichte sneeuw', '🌨️'], 73: ['Sneeuw', '🌨️'], 75: ['Veel sneeuw', '❄️'], 77: ['Sneeuwkorrels', '🌨️'],
  80: ['Buien', '🌦️'], 81: ['Buien', '🌧️'], 82: ['Zware buien', '⛈️'],
  85: ['Sneeuwbuien', '🌨️'], 86: ['Sneeuwbuien', '❄️'],
  95: ['Onweer', '⛈️'], 96: ['Onweer met hagel', '⛈️'], 99: ['Zwaar onweer', '⛈️']
};

export const STANDAARDPLEK = { lat: 52.09, lon: 5.12, plaats: 'Utrecht' };

const lees = (sleutel) => { try { return JSON.parse(localStorage.getItem(sleutel)); } catch { return null; } };
const schrijf = (sleutel, waarde) => { try { localStorage.setItem(sleutel, JSON.stringify(waarde)); } catch { /* vol of geweigerd */ } };

export async function haalWeer(lat, lon) {
  const bewaard = lees(CACHE_SLEUTEL);
  const zelfdePlek = bewaard && Math.abs(bewaard.lat - lat) < 0.05 && Math.abs(bewaard.lon - lon) < 0.05;
  if (zelfdePlek && Date.now() - bewaard.tijd < CACHE_MS) return { ...bewaard.data, uitCache: true };

  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}`
    + '&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index'
    + '&hourly=temperature_2m,apparent_temperature,precipitation_probability,uv_index,weather_code'
    + '&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max'
    + '&forecast_days=2&timezone=auto';

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('weer ' + res.status);
    const data = await res.json();
    schrijf(CACHE_SLEUTEL, { lat, lon, tijd: Date.now(), data });
    return data;
  } catch (err) {
    if (bewaard) return { ...bewaard.data, uitCache: true, verouderd: true };
    throw err;
  }
}

// Alleen als de gebruiker er zelf om vraagt. Blijft het toestemmingsvenster
// open staan, dan geven we na tien seconden de standaardplek terug — anders
// blijft de kaart eeuwig "laden".
export function haalLocatie() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ ...STANDAARDPLEK, geraden: true });
    let klaar = false;
    const af = (waarde) => { if (!klaar) { klaar = true; resolve(waarde); } };
    setTimeout(() => af({ ...STANDAARDPLEK, geraden: true }), 10000);
    navigator.geolocation.getCurrentPosition(
      (pos) => af({ lat: pos.coords.latitude, lon: pos.coords.longitude, plaats: '' }),
      () => af({ ...STANDAARDPLEK, geraden: true }),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

export async function plaatsnaam(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=13&lat=${lat}&lon=${lon}`);
    const data = await res.json();
    const a = data.address || {};
    return a.city || a.town || a.village || a.municipality || a.county || '';
  } catch { return ''; }
}

// --- Het advies -------------------------------------------------------------

function niveau(...regels) {
  const orde = { rustig: 0, let_op: 1, pas_op: 2 };
  return regels.reduce((hoogste, r) => (orde[r.niveau] > orde[hoogste] ? r.niveau : hoogste), 'rustig');
}

export function weeradvies({ soort, ras, faseId, weer }) {
  const nu = weer.current || {};
  const temp = nu.temperature_2m ?? 15;
  const gevoel = nu.apparent_temperature ?? temp;
  const code = nu.weather_code ?? 0;
  const uv = nu.uv_index ?? 0;
  const wind = nu.wind_speed_10m ?? 0;
  const nat = code >= 51;
  const zon = code <= 2;

  const kortesnuit = ras?.snuit === 'kort';
  const dikkevacht = ras?.vacht === 'lang' || ras?.id === 'husky' || ras?.id === 'noorse-boskat';
  const kaal = ras?.vacht === 'kaal';
  const klein = ras?.grootte === 'mini' || ras?.grootte === 'klein';
  const kortevacht = ras?.vacht === 'kort';
  const oud = faseId === 'senior';
  const jong = faseId === 'puppy' || faseId === 'kitten';

  const regels = [];
  const add = (n, titel, tekst) => regels.push({ niveau: n, titel, tekst });

  // Warmte. Het risico op oververhitting begint bij honden al ruim onder de
  // tropische dagen; platte snuiten, dikke vachten en oude dieren eerst.
  if (temp >= 25) {
    add('pas_op', 'Te warm om te rennen',
      `${Math.round(temp)} °C. Wandel alleen vroeg of laat, houd het kort en neem water mee. Rennen en ballen slaan we vandaag over.`);
  } else if (temp >= 20 && (kortesnuit || dikkevacht || oud || soort === 'hond')) {
    add(kortesnuit || dikkevacht || oud ? 'pas_op' : 'let_op', 'Rustig aan met de warmte',
      kortesnuit ? 'Een platte snuit koelt slecht: bij deze temperatuur is hijgen al hard werken. Kort rondje in de schaduw.'
        : dikkevacht ? 'Met die dikke vacht is dit al een warme dag. Zoek schaduw en water.'
          : oud ? 'Een oud dier koelt minder goed af. Houd het rondje kort en rustig.'
            : 'Prima weer, maar niet voor een uur ballen. Neem water mee.');
  }

  // Asfalt. Zwart asfalt in de volle zon wordt veel warmer dan de lucht.
  if (soort === 'hond' && zon && temp >= 22) {
    add(temp >= 26 ? 'pas_op' : 'let_op', 'Voel eerst aan de stoep',
      'Leg je handrug 7 seconden op het asfalt. Houd je dat niet vol, dan kan je hond er niet op lopen. Loop in het gras of wacht tot de avond.');
  }

  // Kou.
  if (temp <= 0) {
    add('pas_op', 'Vriezen',
      soort === 'hond'
        ? `${Math.round(temp)} °C: kort rondje. Spoel de pootjes na met lauw water tegen het strooizout, dat brandt tussen de tenen.`
        : 'Laat je kat naar binnen kunnen. Klop op de motorkap voordat je wegrijdt — katten kruipen bij de warme motor.');
  } else if (temp <= 7 && (klein || kortevacht || kaal || jong || oud)) {
    add('let_op', 'Frisjes voor dit dier',
      kaal ? 'Een kale kat heeft binnen een warme mand of een truitje nodig.'
        : klein || kortevacht ? 'Kleine of kortharige dieren koelen snel af. Een jasje of een korter rondje helpt.'
          : 'Jong of oud koelt sneller af: houd het kort en warm.');
  }

  // Teken worden actief zodra het een paar dagen boven een graad of zeven is.
  if (temp >= 7 && (weer.daily?.temperature_2m_max?.[0] ?? temp) >= 8) {
    add('let_op', 'Tekencheck vanavond',
      'Boven de 7 °C zijn teken actief. Voel na de wandeling de oren, hals, oksels en liezen na.');
  }

  // Zon op een kale of witte huid.
  if (uv >= 5 && (kaal || ras?.id === 'maltezer')) {
    add('let_op', 'Zon op de huid',
      'Weinig of geen vacht: houd de volle zon tussen 12 en 15 uur kort, of gebruik zonnebrand voor dieren op oren en neus.');
  }

  // Nat en wind.
  if (nat) {
    add('rustig', 'Het regent',
      soort === 'hond'
        ? 'Kort naar buiten voor de plas, en binnen een snuffelspel: dat maakt net zo moe als een half uur lopen.'
        : 'Kattenweer voor binnen. Een propje papier aan een touwtje wint het vandaag van de tuin.');
  }
  if (wind >= 45) add('let_op', 'Harde wind', 'Mijd het bos: takken waaien uit de bomen. Loop liever in de luwte van de straat.');

  // Onweer.
  if (code >= 95) add('pas_op', 'Onweer op komst',
    'Zet een veilig hol klaar (bench met een deken, kastje open) en doe de gordijnen dicht. Niet troostend overdrijven, gewoon rustig doen.');

  if (!regels.length) {
    add('rustig', 'Perfect weer',
      soort === 'hond'
        ? 'Niets aan de hand: dit is een dag om lekker lang te lopen en te snuffelen.'
        : 'Fijne dag om de tuin of het balkon te delen met je kat. Zet wat vers water buiten.');
  }

  return { niveau: niveau(...regels), regels, temp, gevoel, uv, wind, code };
}

// Het beste moment om te wandelen: kijk vooruit in de uren van vandaag en
// morgenochtend, en scoor op temperatuur en kans op regen.
export function besteMoment(weer, soort = 'hond') {
  const h = weer.hourly;
  if (!h?.time) return null;
  const nu = new Date();
  // Zonop en zononder horen bij de dág van het uur dat we bekijken.
  const daglicht = (t) => {
    const dagen = weer.daily?.time || [];
    const i = dagen.indexOf(t.toISOString().slice(0, 10));
    const op = weer.daily?.sunrise?.[i] ? new Date(weer.daily.sunrise[i]) : null;
    const onder = weer.daily?.sunset?.[i] ? new Date(weer.daily.sunset[i]) : null;
    if (!op || !onder) return t.getHours() >= 8 && t.getHours() <= 18;
    return t >= op && t <= onder;
  };

  let beste = null;
  for (let i = 0; i < h.time.length; i++) {
    const t = new Date(h.time[i]);
    if (t <= nu || t - nu > 20 * 60 * 60 * 1000) continue;
    const uur = t.getHours();
    if (uur < 6 || uur > 22) continue;

    const temp = h.apparent_temperature?.[i] ?? h.temperature_2m?.[i] ?? 15;
    const regen = h.precipitation_probability?.[i] ?? 0;
    const licht = daglicht(t);

    // Ideaal ligt rond de 14 graden; verder daarvandaan is minder fijn.
    let score = 100 - Math.abs(temp - 14) * 4 - regen * 0.8;
    if (temp >= 25 || temp <= 0) score -= 30;
    if (soort === 'hond' && !licht) score -= 10;
    if (beste === null || score > beste.score) beste = { score, tijd: t, temp, regen, licht };
  }
  if (!beste) return null;
  return {
    ...beste,
    label: beste.tijd.toLocaleString('nl-NL', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
  };
}
