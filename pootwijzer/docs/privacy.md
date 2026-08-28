# Privacy

Pootwijzer is gebouwd om zo min mogelijk over je te weten. Er is geen account,
geen server van ons, en geen advertentienetwerk.

## Wat blijft er op je toestel

Alles wat je invult staat in de opslag van je browser (`localStorage`), op dit
toestel:

- de dieren die je aanmaakt: naam, soort, ras, geboortedatum, geslacht,
  gewicht, of hij geholpen is, en de kcal van je voer;
- de foto die je kiest — die wordt op je toestel verkleind tot maximaal 640
  pixels en gaat nergens heen;
- je plakboek met stickers, die ook op je toestel getekend worden;
- je herinneringen;
- de coördinaten en plaatsnaam die je zelf ophaalt voor het weerbericht.

Wij kunnen daar niet bij. Wis je de gegevens van de site in je browser, of tik
je in de app op **Alles verwijderen**, dan is het weg — ook bij ons, want wij
hadden het nooit.

## Wat gaat er wél naar buiten

| Waarheen | Wat | Wanneer |
| --- | --- | --- |
| [Open-Meteo](https://open-meteo.com) | je coördinaten, afgerond op drie decimalen | als het Vandaag-scherm het weer ophaalt (hooguit één keer per half uur; daarna uit de cache) |
| [Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org) | dezelfde coördinaten | alleen als je op **📍 Gebruik mijn locatie** tikt |

Meer niet. Zolang je niet op de locatieknop tikt, rekent de app met een vast
punt in het midden van Nederland en weet niemand waar je bent.

## Je foto's

De foto van je dier en de stickers worden met `canvas` op je eigen toestel
gemaakt. Er wordt niets geüpload, ook niet naar een AI-dienst — zie
[ai.md](ai.md). Deel je een sticker, dan gebeurt dat via het deelvenster van je
eigen toestel, en bepaal je zelf waar hij heen gaat.

## Verhuizen naar een ander toestel

Op het **Ik**-scherm maak je een back-upbestand met alles erin. Dat bestand
staat op jouw toestel; wat je ermee doet is aan jou. Inlezen op een nieuw
toestel **voegt samen** met wat er al staat en gooit niets weg.

## Kinderen

De app is bedoeld voor volwassenen en kinderen samen. Er wordt niets gevraagd
wat naar een persoon te herleiden is: geen naam van de eigenaar, geen mailadres,
geen leeftijd.
