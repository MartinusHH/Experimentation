# Waar de adviezen vandaan komen

Pootwijzer verzint niets ter plekke. Elke berekening en elk advies in de app
komt uit een vaste regel die hieronder staat, met de richtlijn erbij waarop hij
gebaseerd is. Zo kun je zelf nakijken of je het ermee eens bent — en kan iemand
anders het corrigeren.

> Pootwijzer is geen dierenarts. De app geeft algemene informatie; jouw
> dierenarts kent jouw dier.

## Levensfases

| Fase | Hond | Kat |
| --- | --- | --- |
| Puppy / kitten | tot het einde van de groei: klein ras ± 10 maanden, groot ras ± 15, reus ± 20 | tot 1 jaar |
| Jongvolwassen | van uitgegroeid tot ± 3 jaar | 1 – 6 jaar |
| Volwassen | tot de laatste 25% van de verwachte levensduur | 6 – 10 jaar |
| Senior | de laatste 25% van de verwachte levensduur van het ras | vanaf 10 jaar |

- **Hond:** AAHA Canine Life Stage Guidelines. De kern daarvan is dat een fase
  niet aan een vast aantal jaren hangt maar aan de grootte van het ras en aan de
  verwachte levensduur — een deense dog is eerder senior dan een chihuahua.
  <https://www.aaha.org/resources/2019-aaha-canine-life-stage-guidelines/>
- **Kat:** AAFP/AAHA Feline Life Stage Guidelines (kitten, jong volwassen,
  volwassen, senior). <https://catvets.com/guidelines/practice-guidelines>

De verwachte levensduur per ras staat in `js/rassen.js` (`leeftijdsverwachting`)
en is een gangbare bandbreedte, geen voorspelling voor jouw dier.

## Mensenjaren

- **Hond:** `mensenjaren ≈ 16 × ln(leeftijd in jaren) + 31`. Uit het onderzoek
  van Wang e.a. (2020, *Cell Systems*) naar methylering van DNA bij labradors,
  vergeleken met mensen. Daarom telt het eerste jaar zwaar (een hond van 1 zit
  rond de 31) en gaat het daarna veel langzamer. Onder een kwart jaar schalen we
  lineair, omdat de formule daar wegloopt.
- **Kat:** de veelgebruikte tabel van dierenartsenorganisaties: jaar 1 telt als
  15, jaar 2 als 9, elk jaar daarna als ongeveer 4.

"Eén jaar is zeven mensenjaren" gebruiken we nergens: dat klopt voor geen enkel
ras en geen enkele leeftijd.

## Hoeveel eten

- **Rustbehoefte (RER):** `70 × gewicht^0,75` kcal per dag. Dit is de
  standaardformule uit de voedingsrichtlijnen (WSAVA Global Nutrition
  Guidelines, gebaseerd op het NRC-rapport *Nutrient Requirements of Dogs and
  Cats*). <https://wsava.org/global-guidelines/global-nutrition-guidelines/>
- **Dagbehoefte (MER):** RER × een factor voor de levensfase.
  Hond: puppy ×2,5 · volwassen ×1,6 (geholpen) of ×1,8 · senior ×1,4.
  Kat: kitten ×2,5 · volwassen ×1,2 (geholpen) of ×1,4 · senior ×1,3.
  Bij "te zwaar" rekent de app met een afvalportie (hond ×1,0, kat ×0,8).
- De uitkomst is een **startpunt**, geen recept. Het echte antwoord lees je af
  aan de weegschaal en aan de ribben (body condition score, WSAVA): bij een goed
  gewicht voel je de ribben zoals je de rug van je hand voelt.

## Weeradvies

| Regel | Waarom |
| --- | --- |
| Vanaf 20 °C waarschuwen bij platte snuit, dikke vacht of oud dier; vanaf 25 °C voor iedereen | Onderzoek naar hitteberoerte bij honden laat zien dat het risico al ruim onder tropische temperaturen oploopt, en dat brachycefale, zware en oudere honden het eerst in de problemen komen (Hall e.a., 2020, *Scientific Reports*) |
| Asfalt controleren met de 7-secondenregel bij zon vanaf 22 °C | Donker asfalt in de volle zon wordt tientallen graden warmer dan de lucht; voetzolen verbranden daarop |
| Tekencheck vanaf 7 °C | De teek *Ixodes ricinus* is actief zodra het een paar dagen boven ongeveer 7 °C is — in Nederland vrijwel het hele jaar |
| Extra jas of korter rondje onder 7 °C bij kleine, kortharige, kale, jonge of oude dieren | Minder isolatie en een ongunstiger verhouding tussen lichaamsoppervlak en gewicht |
| Pootjes spoelen bij vorst | Strooizout irriteert en verbrandt tussen de tenen |
| Zonnebrand bij kale of witte dieren bij UV ≥ 5 | Dunbehaarde huid en roze neuzen verbranden en dat is een risicofactor voor huidkanker |

Het weer komt van [Open-Meteo](https://open-meteo.com) (geen sleutel, geen
account), de plaatsnaam van [Nominatim](https://nominatim.openstreetmap.org) —
en die laatste alleen als je er zelf op tikt.

## Gif en gevaar

De waarschuwingen in het handboek (chocola, druiven en rozijnen, ui en knoflook,
xylitol, lelies bij katten, paracetamol bij katten, permethrine bij katten,
blauwalg) zijn de standaardlijst van de vergiftigingscentra voor dieren en van
de dierenartsenverenigingen. Bij een vermoeden van vergiftiging bel je meteen —
wachten tot er symptomen zijn is de meest gemaakte fout.

## Medicijnwijzer

De Medicijnwijzer legt uit wat een *soort* middel doet en hoe je het geeft. Er
staan bewust **geen doseringen** in: hoeveel, hoe vaak en hoe lang hoort bij één
dier, één gewicht en één diagnose, en staat op het etiket van je eigen
dierenarts.

## Gedrag en opvoeding

Voor de opvoedingstips volgen we de lijn van de gedragsorganisaties (o.a. de
positielijst van de American Veterinary Society of Animal Behavior): belonen wat
goed gaat werkt beter en geeft minder stress en angst dan straffen wat fout
gaat.

## Iets gevonden dat niet klopt?

De inhoud staat in `js/kennis.js`, `js/rassen.js` en `js/medicatie.js`. Een
correctie met bron erbij is welkom.
