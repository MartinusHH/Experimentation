# 🌿 Offline!

Een kleine web-app die je helpt bedenken wát je gaat doen in plaats van scrollen.
Je vertelt waar je blij van wordt (kleding, verf, koken, natuur…), hoeveel tijd je hebt,
of het gratis moet zijn en of je binnen of buiten wil — en je krijgt concrete ideeën terug,
inclusief een eerste stap waar je meteen mee kunt beginnen.

## Wat de app doet

| Scherm | Wat je er vindt |
| --- | --- |
| **Ontdek** | Persoonlijke suggesties op basis van je smaak, je tijd, je budget, binnen/buiten, alleen/samen en je energie. Met "Verras me" voor één willekeurig idee. |
| **Jouw smaak** | 18 interesses aanvinken en je woonplaats invullen. |
| **Weer & buiten** | Actueel weerbericht (Open-Meteo), een "buiten-gevoel" van 0–100, het beste moment van de dag om naar buiten te gaan, en suggesties die daarbij passen. |
| **In de buurt** | Zoekingangen naar uitagenda's, workshops, wandelroutes, Repair Cafés, buurthuizen, markten en sportclubs in jouw plaats. |
| **Logboek** | Telefoonvrije minuten, wat je hebt gedaan en wat je bewaarde voor later. |

Bij elk idee zit een timer ("Ik ga dit doen") die je telefoonvrije tijd bijhoudt en na afloop
in je logboek zet.

## Zelf draaien

Geen build-stap, geen dependencies — het is gewone HTML, CSS en JavaScript.

```bash
# open index.html rechtstreeks in je browser, of:
npx http-server . -p 8080     # daarna http://localhost:8080
```

Wil je het op je telefoon gebruiken: zet de map op GitHub Pages
(*Settings → Pages → Deploy from a branch*) en open de URL op je toestel.
Je kunt hem dan aan je beginscherm toevoegen.

## Privacy

Je interesses, plaats, favorieten en logboek staan in `localStorage` van je eigen browser.
Er is geen server en geen account. Alleen twee dingen gaan naar buiten, en alleen als je
erop klikt: het weerbericht (Open-Meteo, geen sleutel of registratie nodig) en de zoeklinks
die je in een nieuw tabblad opent.

## Hoe het in elkaar zit

```
index.html      de vijf schermen
styles.css      pasteltinten, licht én donker
js/data.js      de activiteitenbibliotheek (81 activiteiten, 18 interesses)
js/engine.js    de suggestie-motor: filtert hard, scoort zacht
js/weer.js      Open-Meteo + het "buiten-gevoel"
js/buurt.js     de bronnen voor activiteiten in de buurt
js/app.js       schermen tekenen, opslag, timer
```

### Zelf een activiteit toevoegen

Zet er een blok bij in `js/data.js`:

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
  benodigdheden: ['Naald', 'Draad'],
  eersteStap: 'De kleinste stap die je nu kunt zetten.',
  zoek: 'zoekterm voor uitleg'         // leeg laten = geen zoekknop
}
```

De motor filtert eerst hard op tijd, budget, plek en gezelschap, en scoort daarna op
interesse-overlap, hoe goed de duur je tijd vult, energie en het weer. Een beetje toeval
zorgt dat je niet elke keer hetzelfde lijstje ziet, en "Iets anders" zet een idee tijdelijk
onderaan.
