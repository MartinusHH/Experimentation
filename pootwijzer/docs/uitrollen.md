# Van deze map naar een echte app

Pootwijzer is bewust een gewone statische site: HTML, CSS en JavaScript-modules,
geen build-stap, geen dependencies. Dat maakt uitrollen kort.

## 1. Zelf draaien

```bash
npx http-server . -p 8080     # daarna http://localhost:8080
```

`index.html` rechtstreeks openen werkt níet: de browser weigert
JavaScript-modules te laden vanaf `file://`, en de service worker en de
locatieknop vragen sowieso om `http(s)`. Elke statische server volstaat, ook
`python3 -m http.server`.

## 2. Als eigen repository

Deze map is compleet en zelfstandig. Naar een eigen repo verhuizen:

```bash
cp -r pootwijzer ../pootwijzer && cd ../pootwijzer
git init && git add . && git commit -m "Pootwijzer"
git remote add origin git@github.com:<jij>/pootwijzer.git
git push -u origin main
```

De workflow in `.github/workflows/pages.yml` publiceert daarna elke push naar
`main` op GitHub Pages. Zet die publicatie één keer aan: **Settings → Pages →
Source: GitHub Actions**. Wil je het zonder Actions: **Deploy from a branch**,
map `/ (root)`.

## 3. Op de telefoon

De app is een PWA: openen in de browser, "Zet op beginscherm", klaar. Hij werkt
daarna offline (behalve het weerbericht, dat het laatste bericht van hooguit een
half uur oud laat zien).

Wil je in de App Store en Play Store staan — nodig zodra je abonnementen wilt
verkopen op iOS — dan verpak je dezelfde bestanden met **Capacitor** of **PWA
Builder**. Reken op een paar dagen werk voor pictogrammen, splashscreens,
storevermeldingen en het inleveren van de eerste versie.

## 4. Betalen (pas nodig bij Pootwijzer+)

- Web: **Mollie** (iDEAL, prettig in Nederland) of **Stripe**.
- In de app-stores ben je verplicht in-app purchases te gebruiken. **RevenueCat**
  neemt het gedoe met bonnetjes en verlengingen weg en houdt web en app gelijk.
- Zolang alles op het toestel staat, heb je geen account-systeem nodig voor een
  licentiesleutel: één code die je lokaal bewaart en periodiek laat verifiëren is
  genoeg om te beginnen.

## 5. Juridisch

- **Disclaimer.** Staat in de app (Ik-scherm) en in [privacy.md](privacy.md):
  Pootwijzer vervangt geen dierenarts.
- **AVG.** Zolang er geen server is, verwerk je nauwelijks persoonsgegevens.
  De privacyverklaring beschrijft wat er wél naar buiten gaat (weer en, op
  verzoek, plaatsnaam). Zodra je accounts of cloud-opslag toevoegt, heb je een
  verwerkersovereenkomst met je hosting nodig en een echte privacyverklaring op
  een vaste URL.
- **Cookies.** De app zet er geen. `localStorage` voor je eigen gegevens is
  functioneel en vraagt geen toestemmingsbanner.
- Ga je adverteren of affiliate-links tonen, dan moet dat herkenbaar zijn.

## 6. Groei

De stickers zijn het beste marketingmiddel dat de app heeft: ze zijn leuk, ze
zijn van je eigen dier, en ze worden gedeeld. Zet één regel onder de sticker
("gemaakt met Pootwijzer") — dat staat er al — en zorg dat de link in het
deelbericht meegaat zodra er een domein is.
