# Accounts, cloud-save en het abonnement (Firebase)

De app werkt nu zonder account: alles staat in de browseropslag van één toestel,
en een back-up verhuist je gegevens naar een ander toestel. Dit document
beschrijft hoe je daar inloggen met Google, automatische synchronisatie en een
afdwingbaar abonnement aan vastknoopt.

**Alles wat de code hiervoor nodig heeft, staat al klaar in `js/cloud.js`.**
Zolang `CLOUD.aanbieder` leeg is, geeft elke functie `null` terug en gedraagt de
app zich precies zoals nu — er staat dan ook geen inlogknop in beeld.

---

## Wanneer je hieraan begint

Niet vóór je eerste betalende gebruikers. Een account brengt werk mee dat nooit
meer weggaat: inloggen dat moet blijven werken, gegevens die je op verzoek moet
kunnen verwijderen, en een privacyverklaring. De back-up uit `js/opslag.js` lost
het praktische probleem (verhuizen) vandaag al op.

Wél nu goed om te weten: **het abonnement is pas echt afdwingbaar als de rechten
van de server komen.** Zolang `plan: 'plus'` in de browseropslag staat, kan wie
dat wil het aanzetten. Inloggen en "het abonnement serieus nemen" zijn daarom
hetzelfde project, niet twee losse.

---

## 1. Firebase klaarzetten

1. Maak een project op [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method → Google** aanzetten. Zet je Pages-domein
   (`martinushh.github.io`) bij de geautoriseerde domeinen.
3. **Firestore Database** aanmaken in `europe-west` (dichtbij en binnen de EU).
4. Kopieer de webconfiguratie naar `CLOUD.firebase` in `js/cloud.js` en zet
   `CLOUD.aanbieder = 'firebase'`. Die sleutels zijn niet geheim — de beveiliging
   zit in de regels bij stap 3 hieronder, niet in de sleutel.

## 2. De SDK laden

De app bestaat uit gewone scripts, de Firebase-SDK is een ES-module. Voeg één
bestand toe dat de brug slaat en de functies uit `js/cloud.js` invult:

```html
<!-- in index.html, ná js/cloud.js -->
<script type="module" src="js/cloud-firebase.js"></script>
```

```js
// js/cloud-firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, writeBatch }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app  = initializeApp(CLOUD.firebase);
const auth = getAuth(app);
const db   = getFirestore(app);

let gebruiker = null;
onAuthStateChanged(auth, (u) => {
  gebruiker = u && { uid: u.uid, email: u.email, naam: u.displayName, foto: u.photoURL };
  window.huidigeGebruiker = () => gebruiker;
  if (gebruiker) eersteSynchronisatie(gebruiker.uid);
  tekenAccountKaart();
});

window.meldAanMetGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
window.meldAf = () => signOut(auth);
// duwState, haalState en haalRechten: zie stap 4
```

Twee dingen om te onthouden: de service worker cachet alleen bestanden van je
eigen domein, dus de SDK gaat daar vanzelf langs; en in de Artifact-preview
worden externe scripts geblokkeerd, dus daar blijft de cloud altijd uit — dat is
prima, want die preview is om te kijken, niet om in te loggen.

## 3. Gegevens en regels

Eén document per bladzijde. Dat lijkt omslachtig, maar het maakt samenvoegen
triviaal: je haalt alleen op wat veranderd is, en de regel "nieuwste `bijgewerkt`
wint" werkt per dag in plaats van per gebruiker.

```
gebruikers/{uid}
  profiel:  { naam, bio, foto, samen, straal }
  voorkeur: { interesses, filters, plaats }
  rechten:  { plusTot }          ← alleen de server schrijft hier
  bijgewerkt: <tijdstempel>

gebruikers/{uid}/dagboek/{datum}   { dank[], stemming, notitie, bijgewerkt }
gebruikers/{uid}/plannen/{id}      { titel, datum, tijd, plaats, naam, rol, status, bijgewerkt }
gebruikers/{uid}/gedaan/{id}       { titel, minuten, datum }
```

```js
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gebruikers/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      // de client mag alles schrijven behalve zijn eigen rechten
      allow write: if request.auth != null && request.auth.uid == uid
                   && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['rechten']);

      match /{verzameling}/{document} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

## 4. Synchroniseren

Hergebruik wat er al is: `voegSamen(state, backup)` in `js/opslag.js` is precies
de samenvoegregel die je hier nodig hebt. De cloud levert hetzelfde formaat als
een back-upbestand.

- **Bij inloggen:** `haalState(uid)` → `voegSamen()` → `bewaarState()` → één keer
  `duwState(uid, state)`. Zo raakt niemand iets kwijt, ook niet als er op beide
  kanten geschreven is.
- **Daarna:** `bewaarState()` roept `synchroniseerAlsMogelijk()` al aan; die
  wacht `CLOUD.syncPauze` (15 s) zodat typen in het dagboek niet elke toetsaanslag
  een schrijfactie wordt.
- **Anoniem toestel koppelen:** `apparaatSleutel()` gaat mee als `herkomst` bij de
  eerste push. Handig als iemand later vanaf een tweede toestel inlogt en je wil
  kunnen zien waar iets vandaan kwam.

## 5. Het abonnement afdwingbaar maken

```
Lemon Squeezy  ──webhook──▶  Cloud Function  ──▶  gebruikers/{uid}.rechten.plusTot
                                                        │
                                       de app leest dit alleen maar
```

1. Zet in de Lemon Squeezy-checkout een `custom` veld met de `uid` mee.
2. Cloud Function op `order_created` en `subscription_updated`: controleer de
   handtekening (`X-Signature`) en schrijf `rechten.plusTot`.
3. De app doet niets extra's: `heeftPlus()` in `js/betaling.js` kijkt **eerst**
   naar `state.account.rechten.plusTot` en pas daarna naar de lokale licentie.
   Die volgorde staat er al in.

Zet daarna in `docs/verdienmodel.md` de kanttekening over omzeilen weg — die
klopt vanaf dat moment niet meer.

## 6. Wat het kost en wat het je oplevert aan verplichtingen

Het gratis Firebase-plan geeft 50.000 leesacties en 20.000 schrijfacties per dag.
Met één document per dagboekbladzijde en een pauze van 15 seconden zit je daar met
duizenden gebruikers nog niet aan.

Zodra er gegevens op een server staan, verandert er wel iets:

- je hebt een **privacyverklaring** nodig (welke gegevens, waarom, hoe lang);
- iemand moet zijn account kunnen **laten verwijderen** — bouw dat meteen: één
  knop die het `gebruikers/{uid}`-document met subcollecties weggooit en uitlogt;
- de **profielfoto** staat nu als tekst in de opslag (~30 kB). In Firestore mag
  dat, maar boven de paar duizend gebruikers hoort hij in Firebase Storage;
- houd de **back-upknop** in de app, ook mét cloud. Mensen willen hun dagboek
  kunnen meenemen zonder van jou afhankelijk te zijn.

## Volgorde om aan te houden

1. Firebase-project + Google-login + `js/cloud-firebase.js` → inloggen werkt.
2. `duwState` / `haalState` → cloud-save werkt, met `voegSamen` als scheidsrechter.
3. Verwijderknop en privacyverklaring → je mag het aanzetten voor anderen.
4. Webhook + Cloud Function → het abonnement is echt.
