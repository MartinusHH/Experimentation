# 🐾 Pootwijzer

Een web-app voor mensen met een hond of kat. Hij rekent uit hoe oud je dier
eigenlijk is en hoeveel het hoort te eten, kijkt wat het weer van vandaag voor
jóuw dier betekent, en heeft een handboek van A tot Z dat meegroeit met de
levensfase. In gewone taal, zonder medisch jargon.

Geen build-stap, geen dependencies, geen account: gewone HTML, CSS en
JavaScript-modules. Alles wat je invult blijft op je eigen toestel.

> Pootwijzer is geen dierenarts. Bij twijfel, pijn of plotselinge verandering
> bel je de praktijk.

## De vijf schermen

| Scherm | Wat je er doet |
| --- | --- |
| **Vandaag** | Je dier in één blik: leeftijd en mensenjaren, levensfase met hoever hij is, het weeradvies van nu, hoeveel kcal er vandaag in de bak hoort, het weetje van de week en waar je bij dit ras op let. |
| **Handboek** | Van A tot Z, met per letter een tip die zich aanpast aan de fase waar je dier in zit. Plus de Medicijnwijzer: wat zit er in het doosje van de dierenarts, en hoe krijg je het naar binnen? |
| **Spelen** | Een schuifpuzzel van de foto van je eigen dier (3×3 of 4×4) en de Fotostudio, die er een sticker van maakt met het thema van vandaag. |
| **Plakboek** | Alle stickers bij elkaar, met delen en opslaan. |
| **Ik** | Je dieren beheren, herinneringen instellen, back-up maken of inlezen, en alles in één keer verwijderen. |

## Wat het uitrekent

- **Leeftijd en mensenjaren.** Niet "één jaar is zeven mensenjaren" (dat klopt
  nergens), maar de logaritmische curve uit het DNA-onderzoek bij honden en de
  gangbare tabel bij katten.
- **Levensfase.** Puppy, jongvolwassen, volwassen of senior — bij honden hangt
  dat af van de grootte van het ras: een grote hond is later uitgegroeid en
  eerder senior.
- **Hoeveel eten.** `70 × kg^0,75` maal een factor voor de levensfase, en als je
  invult hoeveel kcal er in 100 gram van jouw voer zit, hoeveel gram dat is.
- **Het weer voor dít dier.** Een platte snuit krijgt eerder een
  hittewaarschuwing dan een husky; een kale kat krijgt bij UV 5 een tip over
  zonnebrand; boven de 7 °C komt de tekencheck erbij.

Alle grenswaarden en formules staan met bron in **[docs/bronnen.md](docs/bronnen.md)**.

## Geen AI, wel slim

Het prototype waar deze app uit voortkomt liet elk antwoord door een taalmodel
schrijven. Dat is eruit: de sleutel is in een browser-app niet te verbergen, en
over de gezondheid van een dier wil je geen geïmproviseerde antwoorden. Wat
ervoor in de plaats kwam:

- **Ras onbekend?** Vijf keuzevragen (grootte, vacht, oren, snuit, energie) die
  matchen tegen de kenmerken in `js/rassen.js`, met een percentage overeenkomst.
- **Het weer** komt live van Open-Meteo; het advies komt uit regels met bron.
- **De puzzel** gebruikt de foto van je eigen dier — leuker dan een gegenereerd
  plaatje, en meteen klaar.
- **De sticker** wordt met `canvas` op je toestel getekend, met elke dag een
  ander thema en een verrassing op feestdagen.

De naad om AI later alsnog aan te zetten zit er wel: alles loopt via
`js/ai.js`, en zolang `proxyUrl` leeg is verandert er niets. Het stappenplan
staat in **[docs/ai.md](docs/ai.md)**.

## Wat er online gebeurt

Alles staat op je eigen toestel. Naar buiten gaat alleen:

- **het weerbericht** — [Open-Meteo](https://open-meteo.com), geen sleutel, geen account;
- **de plaatsnaam bij je locatie** — alleen als je zelf op 📍 tikt.

Meer niet: geen account, geen server van ons, geen advertentienetwerk. De
volledige verklaring staat in **[docs/privacy.md](docs/privacy.md)**.

## Draaien en publiceren

```bash
npx http-server . -p 8080     # daarna http://localhost:8080
```

Een servertje is hier echt nodig: de app bestaat uit JavaScript-modules, en die
weigert de browser te laden vanaf `file://`. Elke statische server volstaat
(`npx http-server`, `python3 -m http.server`, de Live Server-extensie).

Deze map is zelfstandig: je kunt hem los kopiëren naar een eigen repository.
`.github/workflows/pages.yml` publiceert dan elke push naar `main` op GitHub
Pages. Het volledige stappenplan (PWA, app-stores, betalingen, juridisch) staat
in **[docs/uitrollen.md](docs/uitrollen.md)**, het verdienmodel in
**[docs/verdienmodel.md](docs/verdienmodel.md)**.

## Hoe het in elkaar zit

```
index.html          de vijf schermen, de bladen en de wizard
styles.css          tokens voor licht én donker, één maat knoppen (48 px)
manifest.json       zodat de app op je beginscherm past
sw.js               cache van de app zelf, zodat het offline werkt
js/app.js           schermen, navigatie en alles aan elkaar
js/rassen.js        28 rassen met kenmerken, aandachtspunten en levensverwachting
js/leeftijd.js      leeftijd, mensenjaren, levensfase en de voerberekening
js/weer.js          Open-Meteo, de adviesregels en het beste wandelmoment
js/kennis.js        het A-Z handboek en de weetjes van de week
js/medicatie.js     de Medicijnwijzer: soorten middelen, geven, waar op letten
js/rasgok.js        de vijf vragen en het matchen op kenmerken
js/puzzel.js        de schuifpuzzel (altijd oplosbaar, ook met het toetsenbord)
js/fotostudio.js    stickers tekenen met canvas, thema per dag, delen
js/opslag.js        opslaan, back-up, samenvoegen en alles wissen
js/ai.js            de naad voor AI (uit)
```

### Zelf een ras toevoegen

```js
{
  id: 'uniek-id',
  naam: 'Naam van het ras',
  soort: 'hond',                    // 'hond' | 'kat'
  grootte: 'middel',                // mini | klein | middel | groot | reus
  gewicht: [12, 18],                // volwassen richtgewicht in kg
  vacht: 'kort',                    // kort | middel | lang | krullend | ruw | kaal
  oren: 'hang',                     // staand | halfstaand | hang
  snuit: 'normaal',                 // kort (= platte snuit) | normaal | lang
  energie: 2,                       // 1 rustig … 3 altijd aan
  borstel: 2,                       // 1 om de week … 3 elke dag
  leeftijdsverwachting: [12, 15],   // bepaalt wanneer 'senior' begint
  kenmerken: ['waaraan je hem herkent'],
  letop: ['waar dit ras gevoelig voor is'],
  tip: 'Eén concrete tip voor de eigenaar.'
}
```

De rasgokker gebruikt `grootte`, `vacht`, `oren`, `snuit` en `energie`; een
nieuw ras doet daar automatisch aan mee.
