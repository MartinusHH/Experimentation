# Verdienmodel

De app is gratis en werkt zonder account. Er zijn drie inkomstenbronnen, in
volgorde van hoe snel ze geld opleveren. Ze staan allemaal in de code klaar en
worden aangezet door `CONFIG` in `js/betaling.js` in te vullen.

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

## 2. Offline+ (het abonnement)

**€2,99 per maand of €24 per jaar.** Wat je krijgt staat in `PLUS_VOORDELEN`:
extra activiteitenpakketten (met kinderen, samen, per seizoen), je hele
dagboekarchief in plaats van de laatste 7 dagen, exporteren, en de weekplanner.

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

**Eerlijk over de bescherming:** de app kent geen account, dus het plan staat in
de browseropslag. Wie dat wil, kan Offline+ aanzetten zonder te betalen. Bij
€2,99 is dat een prima ruil — de kosten van een inlogsysteem en een server zijn
hoger dan wat je aan omzeilers verliest. Wil je het toch dichttimmeren, dan is
de kleinste stap: de licentiesleutel bij elke start opnieuw laten valideren en
het aantal activaties per sleutel beperken (dat kan Lemon Squeezy zelf).

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
2. **Bij ~200 vaste gebruikers:** Lemon Squeezy koppelen en Offline+ aanzetten.
   Eerder heeft het geen zin; je hebt eerst mensen nodig die de app echt gebruiken.
3. **Bij ~1.000 gebruikers in één regio:** langs de eerste vijf lokale partners.
   Persoonlijk, met een scherm van de app erbij.

## Wat je niet moet doen

- **Advertenties.** Dit is een app om van je scherm weg te blijven; banners
  ondermijnen precies wat je verkoopt.
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
