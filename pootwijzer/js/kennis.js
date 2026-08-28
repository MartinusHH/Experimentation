// De inhoud van het handboek en de weetjes. Alles staat in de app zelf: geen
// vraag naar een server, geen wachttijd, en elke keer hetzelfde antwoord.
// Zie docs/bronnen.md voor waar de adviezen vandaan komen.

// --- Weetje van de week -----------------------------------------------------
// Eén weetje per week, hetzelfde voor iedereen met hetzelfde dier: zo is er
// elke maandag iets nieuws zonder dat er iets gegenereerd hoeft te worden.

export const WEETJES = {
  hond: [
    { t: 'Een hond ruikt in stereo 👃', d: 'Zijn linker- en rechterneusgat werken los van elkaar. Daarom kan hij horen — nou ja, rúiken — uit welke hoek een geur komt.' },
    { t: 'Snuffelen is denkwerk 🧠', d: 'Tien minuten rustig snuffelen maakt een hond net zo moe als een half uur rennen. Laat hem dus vooral zelf de route kiezen.' },
    { t: 'Kwispelen is geen "ja" 🐕', d: 'Een lage, stijve kwispel betekent spanning. Kijk naar het hele lijf: losse oren en een zachte bek horen bij een blije hond.' },
    { t: 'Hij hoort je hartslag 💓', d: 'Honden merken het als jij gestrest bent, aan je stem én aan je geur. Rustig ademen helpt jullie allebei.' },
    { t: 'Hijgen is zijn airco 🥵', d: 'Honden zweten alleen via hun voetzooltjes. Hijgen is dus koelen — hard hijgen bij warmte is een waarschuwing, geen gezelligheid.' },
    { t: 'Puppy\'s slapen 18 uur 😴', d: 'Een puppy die dwars en bijterig wordt, is meestal niet stout maar oververmoeid. Even naar de mand doet wonderen.', fase: ['puppy'] },
    { t: 'Zijn neus is een vingerafdruk 🐾', d: 'Het patroon van rimpeltjes op een hondenneus is bij elke hond anders — in sommige landen kun je er je hond mee registreren.' },
    { t: 'Hij ziet meer dan grijs 🌈', d: 'Honden zien geel en blauw prima. Een rode bal in groen gras is voor hem juist lastig; kies blauw speelgoed.' },
    { t: 'Belonen werkt beter dan straffen 🍖', d: 'Onderzoek laat steeds hetzelfde zien: honden die beloond worden leren sneller en zijn minder gestrest dan honden die gecorrigeerd worden.' },
    { t: 'Likken kan stress zijn 👅', d: 'Even je hand likken is lief. Steeds de eigen poot of lip likken is vaak spanning of jeuk — houd het in de gaten.' },
    { t: 'Ribben voelen, niet zien 🤲', d: 'Bij een goed gewicht voel je de ribben als de rug van je hand. Zie je ze duidelijk, dan is hij te mager; voel je ze niet, dan is hij te zwaar.' },
    { t: 'Gapen betekent "even rustig" 🥱', d: 'Gapen, wegkijken en likkebaarden zijn kalmeersignalen: hij vraagt om ruimte. Handig om te kennen bij kinderen in huis.' },
    { t: 'Hij kan geen chocola 🍫', d: 'In chocola zit theobromine, dat honden slecht afbreken. Pure chocola is het gevaarlijkst. Bel bij twijfel de dierenarts.' },
    { t: 'Zijn slaapplek is zijn eiland 🛏️', d: 'Een hond die op zijn kleed ligt, hoort met rust gelaten te worden. Leer kinderen dat het kleed heilig is.' },
    { t: 'Nagels horen niet te tikken 💅', d: 'Hoor je hem tikken op de vloer, dan zijn de nagels te lang. Dat verandert zijn houding en geeft op den duur pijn in poten en rug.' }
  ],
  kat: [
    { t: 'Spinnen is niet altijd blij 😽', d: 'Katten spinnen ook als ze pijn hebben of onzeker zijn. De trilling zit rond 25 Hz — dat kalmeert hen, een beetje als neuriën.' },
    { t: 'Miauwen is voor jou 🗣️', d: 'Volwassen katten miauwen bijna alleen tegen mensen. Onderling doen ze het met houding, geur en oren.' },
    { t: 'Snorharen meten de ruimte 📏', d: 'Ze voelen luchtstromen en breedtes. Een te smalle voerbak duwt tegen de snorharen — een platte schaal eet daarom prettiger.' },
    { t: 'Hoog zitten is veilig zitten 🪜', d: 'Katten kijken graag van boven. Een plank of kast op hoogte geeft meer rust in huis dan nog een mandje op de grond.' },
    { t: 'Water ver van het eten 💧', d: 'Katten drinken van nature niet bij hun prooi. Zet de waterbak in een andere kamer, dan drinken ze meer — goed voor de nieren.' },
    { t: 'Hij slaapt 16 uur per dag 😴', d: 'Dat is normaal en gezond. Roofdieren sparen energie tussen de jachtmomenten door.' },
    { t: 'De kattenbak is een dagboek 📖', d: 'Verandering in plas of poep is vaak het eerste teken dat er iets is. Schep daarom elke dag, dan zie je het meteen.' },
    { t: 'Een kat kopjes geeft geur 🤗', d: 'Met de klieren op zijn wang zet hij zijn geur op jou. Je bent dan officieel familie.' },
    { t: 'Krabben is rekken en praten 🪵', d: 'Hij scherpt zijn nagels, rekt zijn rug én laat een boodschap achter. Zet de krabpaal dus waar hij graag is, niet in de gang.' },
    { t: 'Geen melk, wel water 🥛', d: 'De meeste volwassen katten verteren melksuiker slecht. Koemelk geeft eerder diarree dan plezier.' },
    { t: 'Jagen in vijf stappen 🎯', d: 'Sluipen, loeren, springen, vangen, "doden". Speel het hele rijtje af met een hengel en laat hem winnen — anders blijft hij gefrustreerd.' },
    { t: 'Langzaam knipperen is een kusje 😌', d: 'Kijk hem aan en knipper traag. Doet hij het terug, dan zegt hij: ik vertrouw je.' },
    { t: 'Lelies zijn levensgevaarlijk 🌷', d: 'Alle delen van de lelie, ook het stuifmeel en het vaaswater, kunnen de nieren van een kat kapotmaken. Zet ze niet in huis.' },
    { t: 'Hij verstopt pijn 🙈', fase: ['volwassen', 'senior'], d: 'Katten laten pas laat merken dat er iets is. Minder springen, minder poetsen of juist veel poetsen op één plek zijn signalen.' },
    { t: 'Zijn neus is koud, en dat zegt niets 👃', d: 'Een warme neus betekent niet dat hij koorts heeft. Kijk naar eten, drinken, spelen en de kattenbak.' }
  ]
};

export function weetjeVanDeWeek(soort, datum = new Date(), faseId = null) {
  const alles = WEETJES[soort] || WEETJES.hond;
  // Weetjes met een fase horen alleen bij die fase; de rest past altijd.
  const lijst = alles.filter((w) => !w.fase || !faseId || w.fase.includes(faseId));
  const start = new Date(datum.getFullYear(), 0, 1);
  const week = Math.floor((datum - start) / (7 * 24 * 60 * 60 * 1000));
  return lijst[(week + datum.getFullYear()) % lijst.length];
}

// --- Het A-Z handboek -------------------------------------------------------
// Per letter één onderwerp. `fase` bevat een extra regel die alleen bij de
// huidige levensfase hoort, zodat het boekje meegroeit met je dier.

export const HANDBOEK = {
  hond: [
    { l: 'A', t: 'Alleen thuis', d: 'Oefen het klein: jas aan, deur uit, tien seconden, weer terug. Bouw het rustig op. Een hond die nooit alleen is geweest, leert het niet vanzelf.',
      fase: { puppy: 'Begin hier in de eerste weken mee, met korte momentjes achter een hekje terwijl jij in beeld blijft.', senior: 'Een oude hond wordt soms opnieuw onzeker. Laat de radio zachtjes aan en houd het kort.' } },
    { l: 'B', t: 'Borstelen', d: 'Kort borstelen is even de vacht doorhalen; lange en wollige vachten borstel je tot op de huid. Maak er een vast momentje van, dan blijft het leuk.',
      fase: { puppy: 'Nu wennen betekent later geen gevecht. Beloon na elke streek.' } },
    { l: 'C', t: 'Chip en registratie', d: 'In Nederland moet je hond gechipt zijn én geregistreerd staan op jouw naam. Verhuis je? Pas het aan — een chip zonder juiste gegevens is een nummer zonder baasje.' },
    { l: 'D', t: 'Drinken', d: 'Altijd schoon water binnen bereik, en op warme dagen ook een bakje mee. Veel drinken en veel plassen zonder reden is een reden om te bellen.' },
    { l: 'E', t: 'Eten', d: 'Twee vaste maaltijden, afgewogen, en snoepjes tellen mee (houd ze onder een tiende van de dag). Verander voer in een week tijd, niet van de ene dag op de andere.',
      fase: { puppy: 'Drie tot vier keer per dag; het maagje is klein en de motor draait hard.', senior: 'Kleinere porties, iets vaker. Warm natvoer ruikt sterker en helpt als de eetlust minder wordt.' } },
    { l: 'F', t: 'Fit blijven', d: 'Niet elke dag hetzelfde rondje: variatie in ondergrond, geuren en tempo houdt spieren en kop soepel. Zwemmen is zacht voor de gewrichten.',
      fase: { puppy: 'Vuistregel bij een puppy: geen lange, geforceerde wandelingen en niet van hoge dingen af springen zolang de groeischijven open zijn.' } },
    { l: 'G', t: 'Gebit', d: 'Poetsen is het enige dat echt werkt, het liefst dagelijks met tandpasta voor honden (nooit die van jou). Slechte adem is geen grapje maar meestal tandvleesontsteking.' },
    { l: 'H', t: 'Hitte', d: 'Honden koelen alleen via hijgen. Wandel vroeg en laat, laat hem nooit in de auto, en ken de alarmsignalen: hevig hijgen, wankelen, felrode tong. Dan direct koelen met lauw water en bellen.' },
    { l: 'I', t: 'Inentingen', d: 'De basisenting beschermt tegen ziektes die dodelijk kunnen zijn. Hoe vaak het daarna moet, verschilt per vaccin — vraag het schema aan je eigen dierenarts.',
      fase: { puppy: 'De pup krijgt een reeks prikken; tot die af is, mijd je plekken waar veel onbekende honden komen.' } },
    { l: 'J', t: 'Jeuk', d: 'Blijft hij krabben, likken of bijten aan zijn poten? Kijk eerst naar vlooien, dan naar voer en pollen. Constant likken aan één plek is nooit "gewoon een gewoonte".' },
    { l: 'K', t: 'Kinderen en honden', d: 'Nooit samen alleen laten, hoe lief ze ook zijn. Leer kinderen: niet knuffelen om de nek, niet storen bij eten of slapen, en altijd de hond naar hén laten komen.' },
    { l: 'L', t: 'Leren', d: 'Belonen wat goed gaat werkt beter en sneller dan straffen wat fout gaat. Korte oefeningen van twee minuten, meerdere keren per dag, blijven het best hangen.' },
    { l: 'M', t: 'Medicijnen', d: 'Alleen wat de dierenarts voor dít dier voorschreef. Menselijke pijnstillers zoals paracetamol en ibuprofen zijn giftig voor honden. Zie de Medicijnwijzer in de app.' },
    { l: 'N', t: 'Nagels', d: 'Tikken de nagels op de vloer, dan zijn ze te lang. Knip een klein stukje per keer, ruim vóór het roze leven, en beloon na elke poot.' },
    { l: 'O', t: 'Oren', d: 'Hangoren wekelijks bekijken en ruiken. Rood, zoetig ruikend of veel bruin smeer is een ontsteking. Nooit met een wattenstaafje naar binnen.' },
    { l: 'P', t: 'Poep als thermometer', d: 'Stevig, glanzend en op te rapen is goed. Twee dagen dun, of slijm en bloed erin, is een reden om te bellen. Neem dan een verse poep mee.' },
    { l: 'Q', t: 'Quarantaine', d: 'Nieuw dier in huis, of een besmettelijk buikje? Houd ze de eerste dagen gescheiden met eigen bakken, en was je handen ertussen. Rustig kennismaken door een hekje werkt het best.' },
    { l: 'R', t: 'Rust', d: 'Een volwassen hond slaapt gerust 14 uur per dag. Te weinig rust maakt een hond opgefokt; een vaste plek waar niemand aan hem zit is geen luxe maar noodzaak.' },
    { l: 'S', t: 'Snuffelen', d: 'De goedkoopste bezigheid die er is: gooi een handje brokken in het gras of gebruik een snuffelmat. Tien minuten zoeken = een tevreden hond.' },
    { l: 'T', t: 'Teken', d: 'Boven de 7 °C zijn teken actief, en dat is in Nederland bijna het hele jaar. Check na elke wandeling oren, hals, oksels en liezen. Draai een teek er met een tekentang in één beweging uit.' },
    { l: 'U', t: 'Uitlaten', d: 'Liever twee keer een rustig rondje met veel snuffelen dan één keer hard rennen. Aan de lijn in het bos in het broedseizoen, en opruimen is geen keuze.' },
    { l: 'V', t: 'Vlooien', d: 'Voor elke vlo die je ziet zitten er tientallen eitjes in huis. Behandel het dier én was de manden en dekens op 60 graden. Vraag welk middel bij dit gewicht en deze leeftijd hoort.' },
    { l: 'W', t: 'Wat mag níet', d: 'Chocola, druiven en rozijnen, ui en knoflook, xylitol (in suikervrije kauwgom en pindakaas), alcohol en gekookte botjes. Bij twijfel: bellen, niet afwachten.' },
    { l: 'X', t: 'Xylitol', d: 'Deze zoetstof staat apart omdat hij zó gevaarlijk is: een klein beetje laat de bloedsuiker van een hond keldern. Kijk op etiketten van "suikervrij" en houd tassen dicht.' },
    { l: 'Y', t: 'Yoghurt en restjes', d: 'Een lepel gewone yoghurt kan meestal wel, maar restjes van tafel zijn de snelste weg naar overgewicht. Wil je delen? Neem een stukje wortel of komkommer.' },
    { l: 'Z', t: 'Zwemmen', d: 'Heerlijk en zacht voor de gewrichten, maar spoel na zout of blauwalg altijd af en droog de oren. Blauwalg (groene drab op het water) is levensgevaarlijk — dan niet het water in.' }
  ],
  kat: [
    { l: 'A', t: 'Aaien', d: 'Wang, kin en hoofd: ja. Buik en staartbasis: meestal niet. Stopt hij met spinnen, trilt de staart of draaien de oren naar achteren, dan stop je ook.' },
    { l: 'B', t: 'Bak (de kattenbak)', d: 'Vuistregel: één bak per kat plus één extra, op rustige plekken en niet naast het eten. Elke dag scheppen. Ongeparfumeerde klontkorrel wordt het best geaccepteerd.',
      fase: { kitten: 'Kies een lage bak waar het kitten zo in kan stappen, en zet er eentje in elke kamer waar hij komt.', senior: 'Een oude kat stapt moeilijker over een hoge rand. Een lage instap voorkomt ongelukjes.' } },
    { l: 'C', t: 'Chip', d: 'Een kat die buiten komt hoort gechipt en geregistreerd te zijn. Het is de enige manier waarop iemand jou kan bellen als hij twee straten verder gevonden wordt.' },
    { l: 'D', t: 'Drinken', d: 'Katten drinken weinig en vaak te weinig. Zet meerdere bakken door het huis, ver van de voerbak, en probeer een fonteintje. Natvoer levert meteen een deel van het vocht.' },
    { l: 'E', t: 'Eten', d: 'Liever vijf kleine porties dan één grote bak: dat past bij een jager. Verander voer geleidelijk in een week. Een kat die een dag níet eet, hoort naar de dierenarts.',
      fase: { kitten: 'Kittenvoer tot ongeveer een jaar; groeien kost veel energie.', senior: 'Warm het natvoer een beetje op, dan ruikt het sterker. Weeg elke maand: onbedoeld afvallen is een signaal.' } },
    { l: 'F', t: 'Fladderspel', d: 'Speel met een hengel, niet met je hand. Laat hem sluipen, springen en vangen, en eindig altijd met een "vangst" en een hapje — anders blijft de jacht onaf.' },
    { l: 'G', t: 'Gebit', d: 'Tandvleesontsteking is heel gewoon bij katten en doet flink pijn. Slechte adem, kwijlen of aan één kant kauwen: laten kijken. Poetsen kan, mits je klein begint met een vingerborsteltje.' },
    { l: 'H', t: 'Hoogte', d: 'Een kat voelt zich veilig van bovenaf. Planken, een kast of een hoge krabpaal geven meer rust in huis dan extra speelgoed op de grond.' },
    { l: 'I', t: 'Inentingen', d: 'Ook een binnenkat wordt geënt: virussen komen mee op schoenen en jassen. Welk schema past, hangt af van of hij naar buiten gaat en van zijn leeftijd.' },
    { l: 'J', t: 'Jagen', d: 'Buiten jagen hoort erbij, hoe vervelend het ook is. Een belletje helpt een beetje; binnenhouden in de schemer helpt meer, want dan zijn vogels en muizen het actiefst.' },
    { l: 'K', t: 'Krabpaal', d: 'Krabben is rekken, nagels onderhouden én een boodschap achterlaten. Zet de paal daarom op een plek waar hij graag is — bij zijn slaapplek of het raam — en niet in de bijkeuken.' },
    { l: 'L', t: 'Liggen', d: 'Bied verschillende plekken: warm en hoog voor overdag, donker en klein voor als hij zich wil terugtrekken. Een kartonnen doos wint het van elk duur mandje.' },
    { l: 'M', t: 'Miauwen', d: 'Miauwen is speciaal voor mensen bedacht. Nieuw of veel harder miauwen, vooral \'s nachts bij een oudere kat, kan wijzen op pijn, honger of een schildklier die te hard werkt.' },
    { l: 'N', t: 'Nagels', d: 'Knip alleen het scherpe puntje, ruim vóór het roze. Bij oudere katten groeien de nagels door omdat ze minder krabben — kijk daar maandelijks naar.' },
    { l: 'O', t: 'Oren', d: 'Zwarte, korrelige smeer met veel krabben wijst op oormijt. Schoonmaken alleen met een middel van de dierenarts, en nooit met een wattenstaafje naar binnen.' },
    { l: 'P', t: 'Plassen buiten de bak', d: 'Dat is nooit koppigheid. Het is stress, een vieze bak, of pijn bij het plassen. Een kater die perst en niets produceert is een spoedgeval — dan meteen bellen.' },
    { l: 'Q', t: 'Quarantaine en kennismaken', d: 'Een nieuwe kat begint in één kamer met eigen bak, eten en schuilplek. Wissel dekens zodat ze elkaar eerst rúiken, daarna zien door een kier. Dagen tot weken, geen uren.' },
    { l: 'R', t: 'Rust', d: 'Zestien uur slaap per dag is normaal. Een kat die zich verstopt op een nieuwe plek en niet meer tevoorschijn komt, voelt zich meestal niet lekker.' },
    { l: 'S', t: 'Snorharen', d: 'Ze voelen breedtes en luchtstromen. Een diepe, smalle voerbak duwt er de hele maaltijd tegenaan; een platte schaal eet daarom prettiger.' },
    { l: 'T', t: 'Teken en vlooien', d: 'Ook een kat die alleen in de tuin komt, komt teken tegen. Gebruik alleen middelen die voor kátten bedoeld zijn: sommige hondenmiddelen (met permethrine) zijn dodelijk voor katten.' },
    { l: 'U', t: 'Uit het raam', d: 'Katten schatten diepte prima in maar springen achter een vogel aan. Een kantelraam is levensgevaarlijk: een kat kan er met zijn heupen in klem raken. Gebruik horren of netten.' },
    { l: 'V', t: 'Vachtverzorging', d: 'Langharige katten dagelijks borstelen, anders vormen zich klitten tot op de huid. Poetst een kat opeens veel meer of juist niet meer, dan is dat een signaal.' },
    { l: 'W', t: 'Water en nieren', d: 'Nierproblemen zijn de meest voorkomende kwaal bij oudere katten. Veel drinken en veel plassen zijn vroege signalen — laat vanaf een jaar of zeven jaarlijks bloed en urine nakijken.' },
    { l: 'X', t: 'Xtra gevaarlijk in huis', d: 'Lelies (elk deel, ook het vaaswater), touwtjes, elastiekjes, kerstslingers en paracetamol. Katten breken paracetamol niet af; één tablet kan dodelijk zijn.' },
    { l: 'Y', t: 'Yoghurt en melk', d: 'Geen melk: de meeste volwassen katten verteren melksuiker slecht. Een likje yoghurt kan meestal wel, maar water is en blijft het beste.' },
    { l: 'Z', t: 'Zon en zomer', d: 'Zorg voor schaduw en meerdere waterplekken. Witte oren en een roze neus verbranden echt — houd hem in de middag binnen of gebruik zonnebrand voor dieren.' }
  ]
};

export function handboekVoor(soort, faseId) {
  return (HANDBOEK[soort] || []).map((item) => ({
    ...item,
    extra: item.fase?.[faseId] || null
  }));
}
