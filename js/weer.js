/*
 * Offline!  —  weerbericht
 *
 * Gebruikt Open-Meteo (gratis, geen sleutel nodig) om te kijken of het
 * buiten een beetje te doen is. Werkt de app offline of blokkeert het
 * netwerk, dan valt alles netjes terug op "geen weerdata".
 */

const WMO = {
  0:  ['Helder', '☀️', 100], 1:  ['Overwegend zonnig', '🌤️', 95], 2: ['Half bewolkt', '⛅', 88],
  3:  ['Bewolkt', '☁️', 75],
  45: ['Mist', '🌫️', 55], 48: ['Aanvriezende mist', '🌫️', 40],
  51: ['Lichte motregen', '🌦️', 50], 53: ['Motregen', '🌦️', 42], 55: ['Dichte motregen', '🌧️', 32],
  56: ['IJzel', '🌧️', 20], 57: ['IJzel', '🌧️', 18],
  61: ['Lichte regen', '🌦️', 45], 63: ['Regen', '🌧️', 28], 65: ['Zware regen', '🌧️', 12],
  66: ['IJzelregen', '🌧️', 12], 67: ['Zware ijzel', '🌧️', 8],
  71: ['Lichte sneeuw', '🌨️', 55], 73: ['Sneeuw', '🌨️', 40], 75: ['Zware sneeuw', '❄️', 22],
  77: ['Sneeuwkorrels', '🌨️', 40],
  80: ['Buien', '🌦️', 45], 81: ['Buien', '🌧️', 32], 82: ['Zware buien', '⛈️', 12],
  85: ['Sneeuwbuien', '🌨️', 30], 86: ['Zware sneeuwbuien', '❄️', 18],
  95: ['Onweer', '⛈️', 8], 96: ['Onweer met hagel', '⛈️', 5], 99: ['Zwaar onweer', '⛈️', 5]
};

function weerInfo(code) {
  return WMO[code] || ['Onbekend', '🌡️', 60];
}

/** Zoek coördinaten bij een plaatsnaam. */
async function zoekPlaats(naam) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(naam)}&count=1&language=nl&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Plaats zoeken lukte niet');
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error(`Geen plaats gevonden voor "${naam}"`);
  const p = data.results[0];
  return { naam: p.name, land: p.country, lat: p.latitude, lon: p.longitude };
}

/** Haal het actuele weer plus het beste buitenmoment van vandaag op. */
async function haalWeer(lat, lon, plaatsnaam) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + '&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m'
    + '&hourly=temperature_2m,precipitation_probability,weather_code'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset'
    + '&timezone=auto&forecast_days=2';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weerbericht ophalen lukte niet');
  const data = await res.json();

  const nu = data.current;
  const [tekst, emoji, basis] = weerInfo(nu.weather_code);
  const gevoel = Math.round(nu.apparent_temperature);

  /* Hoe fijn is het nú buiten? 0–100 */
  let score = basis;
  if (gevoel < -2) score -= 35; else if (gevoel < 4) score -= 18; else if (gevoel < 9) score -= 6;
  if (gevoel > 30) score -= 20; else if (gevoel > 26) score -= 8;
  if (nu.wind_speed_10m > 45) score -= 25; else if (nu.wind_speed_10m > 30) score -= 12;
  if (nu.precipitation > 0.4) score -= 20;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    plaats: plaatsnaam,
    temperatuur: Math.round(nu.temperature_2m),
    gevoelstemperatuur: gevoel,
    wind: Math.round(nu.wind_speed_10m),
    korteTekst: tekst.toLowerCase(),
    tekst, emoji,
    buitenScore: score,
    advies: buitenAdvies(score, gevoel, nu.wind_speed_10m),
    besteMoment: besteBuitenmoment(data.hourly),
    zonsondergang: (data.daily.sunset && data.daily.sunset[0] || '').slice(11, 16),
    max: Math.round(data.daily.temperature_2m_max[0]),
    min: Math.round(data.daily.temperature_2m_min[0])
  };
}

function buitenAdvies(score, gevoel, wind) {
  if (score >= 80) return 'Perfect weer om naar buiten te gaan — pak die wandeling.';
  if (score >= 60) return 'Prima om buiten te zijn. Jas mee en gaan.';
  if (score >= 40) {
    if (wind > 30) return 'Het waait stevig. Buiten kan, maar kies een route uit de wind.';
    return 'Wisselvallig. Een korte wandeling zit er wel in tussen de buien door.';
  }
  if (gevoel < 2) return 'Koud buiten. Binnen knutselen is nu waarschijnlijk fijner.';
  return 'Geen weer om lang buiten te zijn — binnen is nu fijner.';
}

/** Zoek in de komende 12 uur het beste blok om buiten te zijn. */
function besteBuitenmoment(hourly) {
  if (!hourly || !hourly.time) return null;
  const nu = new Date();
  const start = hourly.time.findIndex((t) => new Date(t) >= nu);
  if (start < 0) return null;

  let beste = null;
  for (let i = start; i < Math.min(start + 12, hourly.time.length); i++) {
    const kans = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
    const [, , basis] = weerInfo(hourly.weather_code[i]);
    const uurScore = basis - kans;
    if (!beste || uurScore > beste.score) {
      beste = { score: uurScore, uur: hourly.time[i].slice(11, 16), kans, temp: Math.round(hourly.temperature_2m[i]) };
    }
  }
  // blijft het de hele tijd nat, dan is er geen "beste moment" om te noemen
  return beste && beste.score >= 40 && beste.kans <= 45 ? beste : null;
}

/** Zoek de plaatsnaam bij coördinaten, zodat "mijn locatie" een naam krijgt. */
async function plaatsBijCoordinaten(lat, lon) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=nl`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const d = await res.json();
    return d.city || d.locality || d.principalSubdivision || null;
  } catch {
    return null;   // niet erg: dan heet het gewoon "jouw locatie"
  }
}

/** Vraag de browser om je locatie (alleen als de gebruiker erop klikt). */
function huidigeLocatie() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Locatie wordt niet ondersteund'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => reject(new Error('Geen toestemming voor locatie')),
      { timeout: 8000, maximumAge: 600000 }
    );
  });
}
