# Verdienmodel

De app is gratis en werkt zonder account. Er zijn vier inkomstenbronnen, in
volgorde van hoe snel ze geld opleveren. Ze staan allemaal in de code klaar en
worden aangezet door `CONFIG` in `js/betaling.js` en `ADVERTENTIES` in
`js/advertenties.js` in te vullen.

---

## 0. Advertenties in de gratis versie

Eén advertentie per scherm, alleen op **Ontdek** en **Samen**, altijd met het
woord *Advertentie* erboven. Drie regels staan in de code en die zou ik niet
oprekken:

1. **Nooit in het dagboek.** Daar schrijven mensen eerlijke dingen op; reclame
   ernaast kost je het vertrouwen dat je hele app draagt.
2. **Hooguit één per scherm.** Een app die je van je telefoon weg wil houden,
   mag zelf niet gaan schreeuwen.
3. **Geen netwerkscript zonder toestemming.** Zegt iemand nee, dan zie je
   alleen advertenties die je zelf plaatst — zonder cookies.

**Aanzetten:** zet `ADVERTENTIES.netwerk` op `'adsense'` of `'ethical'` en vul
je id in. Let op: voor gepersonaliseerde advertenties in de EU heb je een
erkende toestemmingsbanner (CMP) nodig; het schermpje in de app is de
eerlijke minimumversie, geen certificering. EthicalAds werkt zonder cookies en
zonder CMP, maar accepteert alleen bepaalde soorten sites — voor een app als
deze is dat het proberen waard, juist omdat het bij het karakter past.

`EIGEN_ADVERTENTIES` is de derde weg: daar zet je lokale partners in. Die
betalen meestal beter dan een netwerk én passen bij wat de gebruiker zoekt.

**Wat het ongeveer opbrengt** (RPM = opbrengst per 1.000 schermweergaves; in
Nederland €2–8 voor dit soort inventaris, eigen partners eerder €10–30):

| Actieve gebruikers/maand | Schermen met advertentie | Netwerk (€4 RPM) | Eigen partners (€15 RPM) |
| --- | --- | --- | --- |
| 500 | ~7.500 | ~€30 | ~€110 |
| 5.000 | ~75.000 | ~€300 | ~€1.100 |
| 50.000 | ~750.000 | ~€3.000 | ~€11.000 |

Advertenties zijn ook de motor onder het abonnement: ze geven mensen een reden
om die €3 te betalen.

---

## 1. Affiliate op materialen (werkt vanaf dag één)

Elk idee heeft een lijstje benodigdheden: *borduurring, aquarelverf, sojawas,
kettingolie*. Precies wat iemand gaat kopen zodra hij besluit het te doen. In
het detailscherm zijn die woorden knoppen die naar de winkel gaan.

**Waarom dit het meest kansrijke deel is:** je verdient aan mensen die niets
hoeven te beslissen. Geen abonnement, geen account, geen prijsdrempel — ze
wilden dat garen toch al kopen.

**Aanzetten:**
1. Meld je aan bij het [bol.com Partnerprogramma](https://partnerprogramma.bol.com)
   (gratis, geen minimum omzet, NL/BE).
2. Zet je ADVID in `CONFIG.bolPartnerId`.
3. Klaar — zonder id blijven het gewone zoeklinks, dus de app werkt altijd.

**Wat het ongeveer opbrengt** (bol-commissie 4–8% afhankelijk van categorie):

| Actieve gebruikers/maand | Klikt door naar winkel | Koopt iets | Gem. order | Opbrengst |
| --- | --- | --- | --- | --- |
| 500 | ~8% (40) | ~10% (4) | €25 | €5–8 |
| 5.000 | ~8% (400) | ~10% (40) | €25 | €50–80 |
| 50.000 | ~8% (4.000) | ~10% (400) | €25 | €500–800 |

Bescheiden per gebruiker, maar het schaalt mee en kost je niets.

---

## 2. Donow+ (het abonnement)

**€3,- per maand of €30 per jaar.** Wat je krijgt staat in `PLUS_VOORDELEN`:
géén advertenties, extra activiteitenpakketten (met kinderen, samen, per
seizoen), je hele dagboekarchief in plaats van de laatste 7 dagen, exporteren,
en de weekplanner.

"Weg met die advertenties" is verreweg het sterkste verkoopargument — sterker
dan alle extra's bij elkaar. Dat is precies waarom die twee bij elkaar horen.

Belangrijk: **er is niets weggehaald bij de gratis versie.** De pakketten zijn
erbij gekomen. Een gratis gebruiker ziet steeds één pakket-idee tussen zijn
suggesties staan — genoeg om te weten wat hij mist, te weinig om zich eraan te
storen.

**Aanzetten (zonder eigen server):**
1. Maak een winkel bij [Lemon Squeezy](https://lemonsqueezy.com) of Paddle.
   Beide zijn *merchant of record*: zij dragen de btw af en sturen facturen,
   dus jij hoeft geen btw-administratie per land te doen.
2. Maak twee producten (maand, jaar) met **licentiesleutels** aan.
3. Zet de checkout-links in `CONFIG.winkelMaand` en `CONFIG.winkelJaar`.
4. Klaar. De app valideert ingevoerde sleutels via de publieke
   validatie-API van Lemon Squeezy — dat kan rechtstreeks vanuit de browser.

**Wat het ongeveer opbrengt** (2–4% van actieve gebruikers is normaal voor een
app als deze; met een proefperiode van 14 dagen eerder 4% dan 2%):

| Actieve gebruikers/maand | Betaalt (3%) | Per maand |
| --- | --- | --- |
| 500 | 15 | ~€45 |
| 5.000 | 150 | ~€450 |
| 50.000 | 1.500 | ~€4.500 |

Tel dat op bij de advertenties hierboven: bij 5.000 gebruikers zit je zo rond
de €750–1.500 per maand, zonder één lokale partner.

**Eerlijk over de bescherming:** de app kent nog geen account, dus het plan staat
in de browseropslag. Wie dat wil, kan Donow+ aanzetten zonder te betalen. Bij
€3 is dat voorlopig een prima ruil — een inlogsysteem kost je meer dan wat je aan
omzeilers verliest.

De echte oplossing is rechten die van de server komen, en die is voorbereid:
`heeftPlus()` kijkt eerst naar `state.account.rechten` en pas daarna naar de
licentie op het toestel. Het stappenplan (Firebase, Google-login, webhook van
Lemon Squeezy) staat in [account.md](account.md). Wil je het eerder dichttimmeren
zonder accounts, dan is de kleinste stap: de licentiesleutel bij elke start
opnieuw valideren en het aantal activaties per sleutel beperken — dat kan Lemon
Squeezy zelf.

---

## 3. Lokale partners (het grootste potentieel, de meeste moeite)

Het buurt-scherm brengt mensen samen die *nu* iets willen doen met de
workshops, clubs en cursussen bij hen in de buurt. Dat is precies wat
naaicafés, keramiekstudio's en sportverenigingen zoeken.

- **Model:** €25–75 per maand voor een vaste plek in het buurt-scherm van hun
  gemeente, of een bedrag per aanmelding.
- **Aanzetten:** `CONFIG.partnerMail` invullen; aanmeldingen komen dan binnen
  via de knop onderaan het buurt-scherm. Partners zet je in `PARTNERS`
  (`js/betaling.js`), inclusief het label "Betaalde plaatsing" — dat is
  verplicht en het houdt het vertrouwen heel.
- **Waarom dit het meest kan opleveren:** één studio die €50 per maand betaalt
  is evenveel als ~17 abonnementen. En dit werkt juist gòed in een kleine
  stad, waar je met een paar honderd gebruikers al de moeite waard bent.

---

## Wat je in deze volgorde zou doen

1. **Nu:** bol-partner-id invullen. Kost tien minuten en loopt daarna vanzelf.
2. **Bij ~200 vaste gebruikers:** Lemon Squeezy koppelen en Donow+ aanzetten,
   met de advertenties erbij — die twee versterken elkaar.
3. **Bij ~1.000 gebruikers in één regio:** langs de eerste vijf lokale partners.
   Persoonlijk, met een scherm van de app erbij. Zij vullen meteen het
   buurtprikbord uit [samen.md](samen.md).

## Wat je niet moet doen

- **Meer advertenties dan één per scherm, of advertenties in het dagboek.**
  Dit is een app om van je scherm weg te blijven; ga je schreeuwen, dan
  ondermijn je precies wat je verkoopt.
- **Data verkopen.** Er staat niets op een server, en dat is een verkoopargument.
- **De gratis versie uitkleden.** Iemand die niets betaalt, is je beste kanaal:
  deze app verspreidt zich via mensen die iets moois hebben gemaakt en dat laten zien.

## Regels waar je aan moet voldoen

- **Affiliate-links** moeten herkenbaar zijn. De app zet er automatisch een
  regel bij ("Via deze links verdient de app een kleine commissie") en gebruikt
  `rel="sponsored"`.
- **Betaalde plaatsingen** worden gelabeld als "Betaalde plaatsing".
- **Btw** regelt de merchant of record; bewaar zelf wel de afrekeningen.
- **Privacy:** zolang alles op het toestel blijft, verwerk je geen
  persoonsgegevens. Zodra je accounts of nieuwsbrieven toevoegt, verandert dat
  en heb je een privacyverklaring en een verwerkersregister nodig.
