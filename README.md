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
| **Dagboek** | Eén bladzijde per dag, met de volle datum en een bladzijdenummer: drie dingen waar je dankbaar voor bent, je stemming, een notitie — en automatisch wat je die dag deed, met het tijdstip erbij. |
| **Samen** | Je plannen met anderen, uitnodigingen versturen, en zeven ingangen naar wat er in jouw plaats te doen is: uitagenda, workshops, wandelroutes, Repair Café, buurthuis, markten, sportclubs. |
| **Ik** | Je profiel (naam, foto, bio), je interesses, je plaats, je cijfers en Offline+. |

Details staan altijd in een blad dat omhoog komt (idee, filters, weer, archief,
Offline+), nooit als extra rij op het scherm zelf. Alle knoppen hebben dezelfde
hoogte, alle chips ook.

## Het dagboek

Elke bladzijde hoort bij een datum en heeft een bladzijdenummer dat meetelt
zodra er iets op staat. Wat je met de timer afrondt, komt vanzelf op de
bladzijde van die dag te staan — je hoeft dus nooit te onthouden wat je deed.
Je reeks (🔥) telt de dagen op rij waarop je iets deed of schreef.

## Samen doen

Een uitnodiging is één link. Je kiest een idee, zet er een dag, tijd en plek
bij, en stuurt de link via WhatsApp of sms. Wie hem opent ziet jouw uitnodiging
in zijn eigen app en kan hem aannemen; hij komt dan bij zijn plannen en op de
bladzijde van die dag. Geen server, geen account, geen adresboek — in de link
staat alleen wat je zelf invulde.

Mensen in de buurt vinden die hetzelfde willen, vraagt wél een backend. Hoe je
dat klein en veilig houdt (en waarom je er nog niet aan moet beginnen) staat in
**[docs/samen.md](docs/samen.md)**.

## Je profiel

Naam, foto en één zin over jezelf, op het **Ik**-scherm. Je naam staat op de
uitnodigingen die je verstuurt en in de begroeting; je foto wordt op je toestel
verkleind tot 256 px en gaat nergens heen. De schakelaar *"ik doe dingen graag
samen"* zorgt dat je vaker ideeën krijgt waar een tweede persoon bij hoort.

## Je gegevens meenemen

Er is geen account nodig, dus je gegevens staan op je eigen toestel. Om te
verhuizen maak je op het **Ik**-scherm een back-up: één bestand met je profiel,
je dagboek, je plannen en je favorieten. Op het nieuwe toestel lees je dat
bestand in — de app laat eerst zien wát erbij komt en **voegt het samen** in
plaats van te overschrijven. Beschreef je dezelfde dag op beide toestellen, dan
wint de versie die het laatst is bijgewerkt.

Inloggen met Google, synchroniseren en een abonnement dat van de server komt,
zijn voorbereid maar nog niet aangesloten: alles loopt via één laag
(`js/cloud.js`), en zolang die leeg is verandert er niets aan de app — er staat
dan ook geen inlogknop in beeld. Het stappenplan om het aan te zetten staat in
**[docs/account.md](docs/account.md)**.

## Wat er online gebeurt

Alles staat op je eigen toestel. In de app zelf staat een samenvatting achter
*Privacy en je gegevens*; de volledige verklaring staat in
**[docs/privacy.md](docs/privacy.md)**. Naar buiten gaan alleen:

- **het weerbericht** — [Open-Meteo](https://open-meteo.com), geen sleutel of account;
- **de plaatsnaam bij je locatie** — alleen als je op 📍 tikt;
- **de zoeklinks** — pas als je er zelf op klikt;
- **het activeren van Offline+** — alleen als je een licentiesleutel invoert.

Met *Alles verwijderen* op het **Ik**-scherm is alles in één keer weg: je
dagboek, je plannen, je profiel, je foto en de anonieme apparaatsleutel. De app
laat eerst zien wát er weggaat en biedt aan er nog een back-up van te maken.

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

Vier bronnen, allemaal ingebouwd en aan te zetten met één regel configuratie:

- **Advertenties** in de gratis versie (`js/advertenties.js`) — hooguit één per
  scherm, alleen op Ontdek en Samen, nooit in het dagboek, en geen netwerkscript
  zonder toestemming.
- **Offline+**, €3,- per maand: haalt de advertenties weg en geeft de extra
  pakketten, je hele archief, export en de weekplanner.
- **Affiliate** op de materialen die bij een idee horen.
- **Betaalde plekken** voor lokale workshops en clubs op het Samen-scherm.

De afwegingen, de cijfers en de stappen staan in **[docs/verdienmodel.md](docs/verdienmodel.md)**.

## Hoe het in elkaar zit

```
index.html        de vijf schermen, de bladen en de wizard
styles.css        pasteltinten, één maat knoppen, licht én donker
manifest.json     zodat de app op je beginscherm past
sw.js             cache van de app zelf, zodat het offline werkt
js/data.js        129 activiteiten, 18 interesses, 10 Offline+-pakketten
js/links.js       alle zoekopdrachten en vaste bronnen op één plek
js/engine.js      de suggestie-motor: filtert hard, scoort zacht
js/weer.js        Open-Meteo, het "buiten-gevoel" en het beste moment
js/buurt.js       de bronnen voor activiteiten in de buurt
js/opslag.js      lezen, schrijven, migratie, back-up en samenvoegen
js/cloud.js       de naad voor account, synchronisatie en abonnement (uit)
js/betaling.js    affiliate, Offline+ en de partnerplekken
js/advertenties.js advertentieplekken, toestemming en eigen advertenties
js/samen.js       uitnodigingen als link, plannen en je profielfoto
js/dagboek.js     bladzijden, reeks, archief en export
js/app.js         schermen, bladen, timer en opslag
```

### Links en zoekopdrachten

Alle uitgaande links komen uit `js/links.js`. Uitgangspunt: een zoekopdracht kan
niet verouderen, een deeplink wel — dus standaard sturen we naar een
zoekresultaat. Waar een vaste bron echt beter is (Repair Café, Wandelnet, de
bibliotheek) staat die in `BRONNEN`, altijd met een zoekterm als terugval voor
als die site verhuist. Een activiteit koppelt zich eraan met
`bronnen: ['repaircafe']`.

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
