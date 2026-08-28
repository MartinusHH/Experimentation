// De Fotostudio maakt een sticker van de foto van je dier — op je eigen
// toestel, met canvas. Geen upload, geen AI, geen wachttijd: de foto verlaat
// je telefoon niet.
//
// Elke dag een ander thema, afgeleid van de datum. Dat geeft dezelfde
// "kom morgen terug"-verrassing als een gegenereerd plaatje, maar dan gratis
// en offline.

export const SFEREN = [
  { id: 'strand', naam: 'Zonnig strand', emoji: '🏖️', kleuren: ['#ffe29a', '#ffb26b'], confetti: ['🐚', '☀️', '🌊'] },
  { id: 'bos', naam: 'Magisch bos', emoji: '🌲', kleuren: ['#bde7c4', '#4f9d69'], confetti: ['🍃', '🍄', '✨'] },
  { id: 'bergen', naam: 'Besneeuwde bergen', emoji: '🏔️', kleuren: ['#dbeafe', '#7aa2d6'], confetti: ['❄️', '⛄', '✨'] },
  { id: 'ruimte', naam: 'Melkweg', emoji: '🌌', kleuren: ['#4c1d95', '#0f172a'], confetti: ['⭐', '🪐', '🚀'] },
  { id: 'onderwater', naam: 'Onderwaterwereld', emoji: '🐠', kleuren: ['#a5f3fc', '#0e7490'], confetti: ['🫧', '🐠', '🐚'] },
  { id: 'huiskamer', naam: 'Gezellige huiskamer', emoji: '🛋️', kleuren: ['#fde68a', '#f59e0b'], confetti: ['🧶', '☕', '💛'] },
  { id: 'feest', naam: 'Feestje', emoji: '🎈', kleuren: ['#fbcfe8', '#db2777'], confetti: ['🎉', '🎈', '🎊'] },
  { id: 'lente', naam: 'Bloemenveld', emoji: '🌷', kleuren: ['#fecdd3', '#fb7185'], confetti: ['🌸', '🌼', '🐝'] }
];

export const OBJECTEN = [
  { id: 'bal', naam: 'Bal', emoji: '🥎' }, { id: 'kluif', naam: 'Kluif', emoji: '🦴' },
  { id: 'bril', naam: 'Zonnebril', emoji: '😎' }, { id: 'kroon', naam: 'Kroontje', emoji: '👑' },
  { id: 'toverstaf', naam: 'Toverstaf', emoji: '🪄' }, { id: 'hoedje', naam: 'Feesthoedje', emoji: '🥳' },
  { id: 'hart', naam: 'Hartjes', emoji: '💖' }, { id: 'vis', naam: 'Visje', emoji: '🐟' }
];

// Op een paar dagen per jaar wint de feestdag van het rooster.
export const FEESTDAGEN = [
  { van: '12-05', tot: '12-06', sfeer: { id: 'sint', naam: 'Sinterklaas', emoji: '🎁', kleuren: ['#fecaca', '#dc2626'], confetti: ['🎁', '🍬', '⛵'] }, object: { id: 'pepernoot', naam: 'Pepernoot', emoji: '🍪' } },
  { van: '12-20', tot: '12-27', sfeer: { id: 'kerst', naam: 'Kerst', emoji: '🎄', kleuren: ['#bbf7d0', '#166534'], confetti: ['🎄', '❄️', '⭐'] }, object: { id: 'kerstmuts', naam: 'Kerstmuts', emoji: '🎅' } },
  { van: '12-31', tot: '01-01', sfeer: { id: 'nieuwjaar', naam: 'Nieuwjaar', emoji: '🎆', kleuren: ['#c7d2fe', '#1e1b4b'], confetti: ['🎆', '✨', '🥂'] }, object: { id: 'confetti', naam: 'Confetti', emoji: '🎊' } },
  { van: '04-26', tot: '04-27', sfeer: { id: 'koningsdag', naam: 'Koningsdag', emoji: '👑', kleuren: ['#fed7aa', '#ea580c'], confetti: ['🧡', '👑', '🎺'] }, object: { id: 'kroon', naam: 'Kroontje', emoji: '👑' } },
  { van: '10-31', tot: '11-01', sfeer: { id: 'halloween', naam: 'Halloween', emoji: '🎃', kleuren: ['#fdba74', '#431407'], confetti: ['🎃', '🦇', '👻'] }, object: { id: 'spook', naam: 'Spookje', emoji: '👻' } }
];

export function dagnummer(datum = new Date()) {
  const start = new Date(datum.getFullYear(), 0, 0);
  return Math.floor((datum - start) / 86400000);
}

export function themaVanDeDag(datum = new Date()) {
  const md = `${String(datum.getMonth() + 1).padStart(2, '0')}-${String(datum.getDate()).padStart(2, '0')}`;
  const feest = FEESTDAGEN.find((f) => (f.van <= f.tot ? md >= f.van && md <= f.tot : md >= f.van || md <= f.tot));
  if (feest) return { sfeer: feest.sfeer, object: feest.object, feestdag: true };
  const d = dagnummer(datum);
  return { sfeer: SFEREN[d % SFEREN.length], object: OBJECTEN[(d * 3) % OBJECTEN.length], feestdag: false };
}

const laadAfbeelding = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject(new Error('Kon de foto niet laden.'));
  img.src = src;
});

/**
 * Tekent de sticker en geeft een data-URL terug.
 * @param {{fotoUrl:string, naam:string, sfeer:object, object:object, tekst?:string}} opties
 */
export async function maakSticker({ fotoUrl, naam, sfeer, object, tekst = '' }) {
  const M = 720;
  const canvas = document.createElement('canvas');
  canvas.width = M; canvas.height = M;
  const ctx = canvas.getContext('2d');

  // Achtergrond in de kleuren van de sfeer.
  const kleur = ctx.createLinearGradient(0, 0, M, M);
  kleur.addColorStop(0, sfeer.kleuren[0]);
  kleur.addColorStop(1, sfeer.kleuren[1]);
  ctx.fillStyle = kleur;
  ctx.fillRect(0, 0, M, M);

  // Confetti van de sfeer, op vaste plekken zodat het niet rommelig wordt.
  const plekken = [[60, 110], [640, 90], [90, 620], [660, 640], [360, 60], [40, 370], [680, 380]];
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  plekken.forEach(([x, y], i) => {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.font = `${i % 2 ? 46 : 60}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
    ctx.translate(x, y);
    ctx.rotate(((i * 37) % 40 - 20) * Math.PI / 180);
    ctx.fillText(sfeer.confetti[i % sfeer.confetti.length], 0, 0);
    ctx.restore();
  });

  // De foto in een ronde lijst.
  const straal = 232;
  const mid = { x: M / 2, y: 330 };
  const foto = await laadAfbeelding(fotoUrl);
  ctx.save();
  ctx.beginPath();
  ctx.arc(mid.x, mid.y, straal, 0, Math.PI * 2);
  ctx.closePath();
  ctx.shadowColor = 'rgba(0,0,0,.25)';
  ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.clip();
  const schaal = Math.max((straal * 2) / foto.width, (straal * 2) / foto.height);
  const bw = foto.width * schaal; const bh = foto.height * schaal;
  ctx.drawImage(foto, mid.x - bw / 2, mid.y - bh / 2, bw, bh);
  ctx.restore();

  // Witte rand eromheen, zoals bij een uitgeknipte sticker.
  ctx.lineWidth = 16; ctx.strokeStyle = '#fff';
  ctx.beginPath(); ctx.arc(mid.x, mid.y, straal, 0, Math.PI * 2); ctx.stroke();

  // Het object van de dag als "prop" rechtsonder bij de foto.
  ctx.save();
  ctx.font = '150px system-ui, "Apple Color Emoji", "Segoe UI Emoji"';
  ctx.translate(mid.x + straal - 30, mid.y + straal - 40);
  ctx.rotate(-12 * Math.PI / 180);
  ctx.fillText(object.emoji, 0, 0);
  ctx.restore();

  // Naambalk.
  const label = (naam || 'Mijn maatje').slice(0, 20);
  ctx.font = '700 62px system-ui, -apple-system, "Segoe UI", sans-serif';
  const breedte = Math.min(M - 80, ctx.measureText(label).width + 90);
  const balk = { x: (M - breedte) / 2, y: 570, h: 94 };
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.roundRect(balk.x, balk.y, breedte, balk.h, 48);
  ctx.fill();
  ctx.fillStyle = '#1f2937';
  ctx.fillText(label, M / 2, balk.y + balk.h / 2 + 4);

  // Klein regeltje eronder: het thema en de datum.
  ctx.font = '600 26px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillStyle = 'rgba(31,41,55,.75)';
  ctx.fillText(tekst || `${sfeer.emoji} ${sfeer.naam} · ${new Date().toLocaleDateString('nl-NL')}`, M / 2, 692);

  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Delen: eerst het echte deelvenster van het toestel (dan gaat de áfbeelding
 * mee), anders downloaden en een tekstlink naar WhatsApp.
 */
export async function deel(dataUrl, titel) {
  const blob = await (await fetch(dataUrl)).blob();
  const bestand = new File([blob], 'pootwijzer-sticker.jpg', { type: blob.type });
  if (navigator.canShare?.({ files: [bestand] })) {
    try {
      await navigator.share({ files: [bestand], title: titel, text: `${titel} — gemaakt met Pootwijzer 🐾` });
      return 'gedeeld';
    } catch (err) {
      if (err.name === 'AbortError') return 'afgebroken';
    }
  }
  return 'geen-deelvenster';
}

export function download(dataUrl, naam = 'pootwijzer-sticker.jpg') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = naam;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
