# AI in Pootwijzer: waarom uit, en hoe je het aanzet

Het prototype waar deze app uit voortkomt liet elk antwoord door een taalmodel
schrijven: het handboek, de weertip, de uitleg bij een medicijn. Dat is
weggehaald. Wat je nu ziet komt uit vaste regels en uit kennis die in de app
zelf staat.

## Waarom

1. **De sleutel is niet te verbergen.** In een pagina die in de browser draait,
   ligt een API-sleutel op straat: iedereen die de bron opent, kan hem kopiëren
   en op jouw rekening gebruiken.
2. **Over gezondheid wil je geen improvisatie.** Een taalmodel dat een dosering
   of een symptoom "aannemelijk" invult, is gevaarlijker dan een kort antwoord
   dat klopt. De regels in `js/kennis.js` en `js/medicatie.js` zijn na te lezen
   en te corrigeren; een gegenereerd antwoord is dat niet.
3. **Het is trager en breekbaarder.** Nu opent elk scherm meteen, ook zonder
   verbinding.

## Wat we ervoor terugkregen

| Vroeger door AI | Nu |
| --- | --- |
| Ras raden uit een open tekstvak | Vijf keuzevragen die matchen op de kenmerken in `js/rassen.js` |
| Weertip laten schrijven | Live weer van Open-Meteo + regels met bron (`js/weer.js`, [bronnen.md](bronnen.md)) |
| A-Z handboek genereren | Een geschreven A-Z dat meebeweegt met de levensfase |
| Uitleg bij een medicijn genereren | Herkenning van bekende merknamen en werkzame stoffen, met uitleg per soort middel |
| Plaatje van een ras genereren voor de puzzel | De puzzel gebruikt de foto van jouw eigen dier |
| Sticker genereren met image-to-image | De sticker wordt met `canvas` op je toestel getekend, met een thema per dag |

## Hoe je het later wél aanzet

Alle AI-aanroepen lopen via één bestand: `js/ai.js`. Zolang `AI.proxyUrl` leeg
is, staat alles uit en verandert er niets aan de app.

1. **Zet een backend neer** (Vercel Function, Cloudflare Worker, Firebase
   Function — één endpoint is genoeg). Die houdt de sleutel vast; de sleutel
   staat dus nooit in de frontend.
2. Laat die backend:
   - alleen POSTs accepteren van jouw eigen domein (CORS);
   - een limiet per bezoeker bijhouden, anders betaal jij de rekening van een
     bot;
   - de systeeminstructie zelf toevoegen, inclusief: geen doseringen, geen
     diagnose, altijd doorverwijzen naar de dierenarts bij twijfel;
   - het antwoord teruggeven als `{ "antwoord": "…" }`.
3. Vul de URL in bij `AI.proxyUrl` in `js/ai.js`.
4. Bouw het schermpje eromheen. `vraagAI(onderwerp, vraag, context)` is er al.

Waar AI daarna echt iets toevoegt (en de app dat niet zelf kan):

- een vraag in eigen woorden stellen over het dossier;
- de tekst van een échte bijsluiter die de gebruiker fotografeert, samenvatten
  in gewone taal;
- een ras schatten uit een foto in plaats van uit vijf vragen.

Zet het pas aan als de disclaimer, de limieten en de logging staan. Een fout
antwoord over een ziek dier is geen bug maar een incident.
