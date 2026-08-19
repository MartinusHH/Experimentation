# 🌿 Offline!

Een web-app die je helpt bedenken wát je gaat doen in plaats van scrollen — en
die bijhoudt wat het je oplevert. Je vertelt waar je blij van wordt (kleding,
verf, koken, natuur…), hoeveel tijd je hebt en of het gratis moet zijn; je
krijgt concrete ideeën terug, met een eerste stap waar je meteen mee kunt beginnen.

Geen build-stap, geen dependencies, geen account: gewone HTML, CSS en JavaScript.

## De vijf schermen

| Scherm | Wat je er doet |
| --- | --- |
| **Vandaag** | Het weer in één regel, één idee dat nu past, en of je vandaag al iets hebt geschreven. Drie knoppen voor hoeveel tijd je hebt. |
| **Ontdek** | Alle suggesties. De filters zitten in een blad achter *Verfijn*, zodat het scherm kort blijft. 🎲 geeft één willekeurig idee. |
| **Dagboek** | Eén bladzijde per dag: drie dingen waar je dankbaar voor bent, je stemming, een notitie — en automatisch wat je die dag hebt gedaan. |
| **Buurt** | Zeven ingangen naar wat er in jouw plaats te doen is: uitagenda, workshops, wandelroutes, Repair Café, buurthuis, markten, sportclubs. |
| **Ik** | Je interesses, je plaats, je cijfers, Offline+ en het opruimen van je gegevens. |

Details staan altijd in een blad dat omhoog komt (idee, filters, weer, archief,
Offline+), nooit als extra rij op het scherm zelf. Alle knoppen hebben dezelfde
hoogte, alle chips ook.

## Het dagboek

Elke bladzijde hoort bij een datum en heeft een bladzijdenummer dat meetelt
zodra er iets op staat. Wat je met de timer afrondt, komt vanzelf op de
bladzijde van die dag te staan — je hoeft dus nooit te onthouden wat je deed.
Je reeks (🔥) telt de dagen op rij waarop je iets deed of schreef.

## Wat er online gebeurt

Alles staat op je eigen toestel. Naar buiten gaan alleen:

- **het weerbericht** — [Open-Meteo](https://open-meteo.com), geen sleutel of account;
- **de plaatsnaam bij je locatie** — alleen als je op 📍 tikt;
- **de zoeklinks** — pas als je er zelf op klikt;
- **het activeren van Offline+** — alleen als je een licentiesleutel invoert.

Het weerbericht wordt een half uur bewaard, en als je offline bent gebruikt de
app het laatste bericht dat hij had. Dankzij de service worker (`sw.js`) werkt
de app zelf ook zonder verbinding, en je kunt hem op je beginscherm zetten.

## Draaien en publiceren

```bash
npx http-server . -p 8080     # daarna http://localhost:8080
```

Rechtstreeks `index.html` openen werkt ook, maar dan doet de service worker
niets en weigert de browser je locatie — voor de volledige app heb je `http(s)` nodig.

**Op je telefoon zetten via GitHub Pages** — eenmalig instellen, daarna gaat het vanzelf:

- *Snelste weg, werkt met elke branch:* **Settings → Pages → Source: Deploy from
  a branch**, kies de branch en map `/ (root)`. Na een minuut staat de URL boven
  aan diezelfde pagina.
- *Via Actions:* zet **Source op "GitHub Actions"**. Daarna publiceert
  `.github/workflows/pages.yml` elke push naar `main`. Die ene klik is nodig
  omdat de workflow-token Pages niet zelf mag aanzetten.

Open de URL op je telefoon en kies "Zet op beginscherm".

## Geld verdienen

Drie bronnen, allemaal al ingebouwd en uit te zetten met één regel configuratie
in `js/betaling.js`: affiliate-links op de materialen van een idee, het
abonnement **Offline+** (€2,99 p/m) voor extra pakketten, archief en export, en
betaalde plekken voor lokale workshops in het buurt-scherm.
De afwegingen, de cijfers en de stappen staan in **[docs/verdienmodel.md](docs/verdienmodel.md)**.

## Hoe het in elkaar zit

```
index.html        de vijf schermen, de bladen en de wizard
styles.css        pasteltinten, één maat knoppen, licht én donker
manifest.json     zodat de app op je beginscherm past
sw.js             cache van de app zelf, zodat het offline werkt
js/data.js        91 activiteiten, 18 interesses, 10 Offline+-pakketten
js/engine.js      de suggestie-motor: filtert hard, scoort zacht
js/weer.js        Open-Meteo, het "buiten-gevoel" en het beste moment
js/buurt.js       de bronnen voor activiteiten in de buurt
js/betaling.js    affiliate, Offline+ en de partnerplekken
js/dagboek.js     bladzijden, reeks, archief en export
js/app.js         schermen, bladen, timer en opslag
```

### Zelf een activiteit toevoegen

```js
{
  id: 'unieke-naam',
  titel: 'Wat je gaat doen',
  pitch: 'Eén zin waarom dit leuk is.',
  interesses: ['kleding', 'kunst'],   // ids uit INTERESSES
  tijd: 45,                            // richttijd in minuten
  kosten: 'gratis',                    // 'gratis' | 'klein' | 'investering'
  kostenIndicatie: '€0',
  plek: 'binnen',                      // 'binnen' | 'buiten' | 'beide'
  sociaal: 'alleen',                   // 'alleen' | 'samen' | 'beide'
  energie: 1,                          // 1 rustig … 3 actief
  weerAfhankelijk: false,              // alleen voor buiten-activiteiten
  benodigdheden: ['Naald', 'Draad'],   // worden de materiaal-links
  eersteStap: 'De kleinste stap die je nu kunt zetten.',
  zoek: 'zoekterm voor uitleg',        // leeg laten = geen zoekknop
  plus: false, pakket: ''              // true + pakketnaam = achter Offline+
}
```

De motor filtert eerst hard op tijd, budget, plek en gezelschap, en scoort
daarna op interesse-overlap, hoe goed de duur je tijd vult, energie en het weer.
Een beetje toeval zorgt dat je niet elke keer hetzelfde lijstje ziet.
