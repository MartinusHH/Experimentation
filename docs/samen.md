# Samen doen

Twee vragen die vaak door elkaar lopen: *samen iets doen met iemand die je
kent* en *iemand in de buurt vinden die hetzelfde wil*. De eerste kun je
vandaag bouwen zonder server. De tweede kan ook, maar kost een backend en —
belangrijker — een plan tegen leegte en tegen misbruik.

---

## Fase 1 — nu in de app: een uitnodiging is een link

Je kiest een idee, zet er een dag, een tijd en een plek bij, en de app maakt
één link. Die stuur je via WhatsApp, Signal of sms. Wie hem opent, ziet jouw
uitnodiging in zijn eigen app staan en kan hem aannemen; hij komt dan bij zijn
plannen en op de bladzijde van die dag te staan.

```
https://…/#samen=eyJ2IjoxLCJhIjoic2FtZW4ta29rZW4i…
```

In die link zit precies wat jij invulde: de activiteit, de datum, de tijd, de
plek, je naam en je berichtje. Verder niets. Er is geen server, geen account
en geen adresboek — de app leest je contacten niet en verstuurt zelf niets.

**Waarom dit meer is dan een tussenoplossing:** de meeste mensen willen niet
met een vreemde beginnen, maar met de buurvrouw, hun zus of een collega. En
dit werkt vanaf gebruiker nummer één, terwijl matching pas werkt vanaf een paar
honderd in dezelfde stad.

---

## Fase 2 — mensen in de buurt: hoe je dat klein houdt

Het idee: wie in zijn profiel *"ik doe dingen graag samen"* aanzet, kan open
uitnodigingen plaatsen en die van anderen in de buurt zien. Die schakelaar
staat al in de app en bepaalt nu al welke ideeën je krijgt.

### Wat je minimaal nodig hebt

Eén verzameling in dezelfde Firebase die je voor de accounts gebruikt
(zie [account.md](account.md)) — en de aanroepen ervoor staan al klaar in
`js/cloud.js`: `plaatsOpenUitnodiging()` en `zoekInBuurt()`. Meer dan dit heb je
niet nodig:

| veld | inhoud | waarom zo |
| --- | --- | --- |
| `id` | willekeurig | — |
| `titel`, `activiteit_id` | wat jullie gaan doen | uit de bestaande bibliotheek |
| `wanneer` | datum + tijd | alleen toekomst |
| `gebied` | postcode-4 of een geohash-vak van ~2 km | **nooit** een exact adres |
| `plek` | een openbare plek, vrij in te vullen | station, park, buurthuis |
| `naam`, `avatar` | voornaam + optionele foto | geen achternaam nodig |
| `apparaat_sleutel` | `apparaatSleutel()` uit `js/opslag.js` | identiteit zonder inlog |
| `verloopt` | datum + 1 dag | oude berichten ruimen zichzelf op |

Matchen is dan gewoon een zoekopdracht: *geef de open uitnodigingen in mijn
gebiedsvakken, in de komende zeven dagen, bij mijn interesses.* Geen algoritme,
geen aanbevelingsmodel. In Firestore is dat één `where`-query op `gebied` en
`wanneer`. Reken op twee tot vier dagen werk voor deze versie — minder als de
accounts uit [account.md](account.md) er dan al zijn, want dan heb je de
inlog, de regels en de adapter al staan.

### Meedoen zonder chat te bouwen

Chat is de grootste bron van misbruik en van werk. Sla hem over in v1:

1. De gastheer plaatst een uitnodiging met een **openbare plek en een tijd**.
2. Anderen tikken op *"ik kom"*. De gastheer ziet alleen een aantal en de
   voornamen — precies zoals een hardloopgroepje op zaterdagochtend.
3. Wil de gastheer wél contact, dan deelt hij zelf een link uit fase 1.

Zo hoef je geen berichten op te slaan, te modereren of te bewaren.

### Veiligheid — dit is het echte werk, niet de code

- **Alleen openbare plekken** voor afspraken met onbekenden; de app stelt die
  ook voor (park, café, buurthuis) en waarschuwt bij een privéadres.
- **Grof gebied, nooit een exacte locatie**, en nooit iemands positie in beeld.
- **Melden en blokkeren** vanaf dag één, met een e-mailadres waar meldingen
  binnenkomen. Bij deze schaal kan één persoon dat bijhouden.
- **Achttien jaar en ouder** voor het buurtprikbord; uitnodigingen via een link
  hebben die grens niet nodig, want die gaan naar mensen die je kent.
- **Verloopdatum op alles.** Wat weg is, kan niet misbruikt worden.
- **Een schermpje met de spelregels** voordat iemand voor het eerst plaatst.
  Kort, in gewone taal, niet weg te klikken.

### Het echte probleem is niet techniek, maar leegte

Een prikbord met nul uitnodigingen is erger dan geen prikbord. Drie dingen die
daar tegen helpen:

1. **Eén stad tegelijk.** Zet het aan in je eigen gemeente en houd het daar tot
   het loopt. Landelijk uitrollen met tien gebruikers per stad is de zekerste
   manier om te mislukken.
2. **Vul het met partners.** De workshops en clubs uit het buurt-scherm
   (zie [verdienmodel.md](verdienmodel.md)) hebben altijd iets op de agenda.
   Zo staat er iets op het prikbord voordat er gebruikers zijn — en zij hebben
   er zelf belang bij.
3. **Laat fase 1 het werk doen.** Elke uitnodigingslink is een introductie van
   de app bij iemand die hem nog niet heeft. Dat is je groeikanaal én je
   dichtheid.

### Wanneer je hieraan begint

Niet nu. Als je in één stad een paar honderd mensen hebt die de app echt
gebruiken, en je uit de cijfers ziet dat er uitnodigingslinks rondgaan. Tot die
tijd is fase 1 het hele product, en de schakelaar in het profiel je meting: hoeveel
mensen zetten hem eigenlijk aan?
