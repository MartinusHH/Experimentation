# Privacyverklaring — Offline!

*Laatst bijgewerkt: 19 augustus 2026*

Kort samengevat: **je gegevens staan op je eigen toestel.** Er is geen account,
er is geen server van ons, en er gaat niets naar buiten behalve wat hieronder
staat — en dat gebeurt alleen als jij ergens op tikt.

## Wat de app opslaat, en waar

Alles wat je in de app invult, staat in de opslag van je eigen browser
(`localStorage`):

| Wat | Bijvoorbeeld |
| --- | --- |
| Je profiel | naam, foto, korte bio |
| Je voorkeuren | interesses, plaatsnaam, filters, "ik doe dingen graag samen" |
| Je dagboek | dankbaarheid, stemming, notities, per dag |
| Je activiteiten | wat je afrondde, hoe lang, wanneer |
| Je plannen | uitnodigingen die je maakte of aannam |
| Je abonnement | of Offline+ actief is, en tot wanneer |
| Een apparaatsleutel | een willekeurig nummer, geen naam of e-mailadres |

Wij kunnen daar niet bij. Wis je de app-gegevens of je browsergeschiedenis, dan
is het weg — daarom staat er een back-upknop in de app.

## Wat er wél naar buiten gaat

Vijf dingen, allemaal pas nadat jij iets doet:

1. **Het weerbericht.** Als je het weer opvraagt, gaat je plaatsnaam (of je
   coördinaten, als je daar toestemming voor geeft) naar
   [Open-Meteo](https://open-meteo.com/en/terms). Zij bewaren geen
   persoonsgegevens en vragen geen sleutel.
2. **De plaatsnaam bij je locatie.** Alleen als je op 📍 tikt, gaan je
   coördinaten naar BigDataCloud om er een plaatsnaam bij te zoeken.
3. **Zoeklinks.** Tik je op "Zoek uitleg", "Video bekijken" of een winkel-link,
   dan open je een nieuw tabblad bij die partij (DuckDuckGo, YouTube, bol.com,
   en de bronnen in `js/links.js`). Daar geldt hun privacybeleid, niet dat van ons.
4. **Offline+ activeren.** Voer je een licentiesleutel in, dan gaat alleen die
   sleutel naar de winkel om te controleren of hij geldig is.
5. **Advertenties.** In de gratis versie staat er één advertentieplek per
   scherm. Zolang er geen advertentienetwerk is gekoppeld, wordt er niets van
   buiten geladen. Wordt er wel een netwerk gekoppeld, dan vragen we eerst je
   toestemming; zeg je nee, dan zie je alleen advertenties zonder cookies.

**Wat we níét doen:** geen analytics, geen trackers, geen profielen, geen
verkoop van gegevens, geen nieuwsbrief, geen toegang tot je contacten.

## Uitnodigingen om iets samen te doen

Een uitnodiging is een link die je zelf verstuurt via je eigen app (WhatsApp,
sms, mail). Daarin staat alleen wat je invulde: de activiteit, de dag, de tijd,
de plek, je naam en je berichtje. Er komt geen server aan te pas, en wij zien
niet wie je uitnodigt.

Let op: iedereen die zo'n link krijgt, kan hem lezen en doorsturen. Zet er dus
niets in dat niet bij een ander terecht mag komen.

## Foto's

Je profielfoto wordt op je eigen toestel bijgesneden en verkleind naar 256 × 256
pixels en daarna opgeslagen in je browser. Hij wordt nergens heen geüpload.

## Kinderen

De app is voor iedereen bruikbaar, maar hij is niet gemaakt voor kinderen onder
de 13 en vraagt hun ook niets. Zou er later een buurtprikbord komen waarop je
onbekenden ontmoet, dan geldt daar een leeftijdsgrens van 18 jaar
(zie `docs/samen.md`).

## Je gegevens verwijderen

Op het **Ik**-scherm staat *Alles verwijderen*. Daarmee wis je in één keer je
profiel, je dagboek, je plannen, je favorieten, je foto en je apparaatsleutel.
De app laat eerst zien wat er weggaat en biedt aan om er nog een back-up van te
maken. Er is niets wat wij daarna nog moeten wissen — wij hadden het niet.

## Als er later een account bij komt

Inloggen met Google en synchroniseren zijn voorbereid maar **niet aangesloten**
(zie `docs/account.md`). Zodra dat wél zo is, verandert deze verklaring: dan
staan er gegevens op een server, komt er een verwerkingsgrondslag bij, en moet
"verwijderen" ook dáár gebeuren. Die knop is er dan meteen; dat is bewust zo
gepland.

## Vragen

Deze app is een klein project. Heb je een vraag over je gegevens, dan is het
antwoord bijna altijd: ze staan op je eigen toestel en wij hebben ze niet.
Kom je er niet uit, open dan een issue in de repository.
