// De AI-naad. Staat uit, en de app werkt volledig zonder.
//
// Waarom uit: een sleutel die in de frontend staat, ligt op straat — iedereen
// die de pagina opent kan hem kopiëren en op jouw rekening gebruiken. En over
// gezondheid van dieren wil je geen verzonnen antwoorden.
//
// Wat er wél staat: één laag waar de rest van de app doorheen praat. Zet je
// later een backend-proxy neer (zie docs/ai.md), dan vul je hieronder de URL in
// en werken de extra's meteen — zonder dat er elders in de app iets verandert.

export const AI = {
  // Vul in wanneer je een eigen proxy hebt draaien, bijvoorbeeld
  // 'https://api.pootwijzer.nl/vraag'. Zolang dit leeg is, is AI uit.
  proxyUrl: '',

  // Wat de app zou gebruiken zodra de naad aanstaat. Elk onderdeel heeft een
  // werkende versie zonder AI; dit zijn extra's, geen vervangers.
  mogelijkheden: {
    vrijeVraag: 'Een vraag stellen over het dossier, in eigen woorden.',
    rasFoto: 'Ras raden op basis van een foto in plaats van vijf vragen.',
    bijsluiter: 'De tekst van een échte bijsluiter samenvatten in gewone taal.',
    plaatje: 'Een illustratie tekenen bij het handboek of een sticker.'
  }
};

export const aiAan = () => Boolean(AI.proxyUrl);

/**
 * Stel een vraag aan de backend. De backend houdt de sleutel vast, kiest het
 * model en zet er zelf de veiligheidsinstructies bij.
 * @returns {Promise<string>} het antwoord als platte tekst
 */
export async function vraagAI(onderwerp, vraag, context = {}) {
  if (!aiAan()) throw new Error('AI staat uit.');
  const res = await fetch(AI.proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ onderwerp, vraag, context })
  });
  if (!res.ok) throw new Error('AI antwoordde niet (' + res.status + ').');
  const data = await res.json();
  return String(data.antwoord || '').trim();
}
