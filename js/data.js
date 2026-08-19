/*
 * Offline!  —  activiteitenbibliotheek
 *
 * Elke activiteit heeft tags waarmee de suggestie-motor (js/engine.js)
 * een match maakt met wat jij leuk vindt, hoeveel tijd je hebt,
 * wat het mag kosten en of je binnen of buiten wil zijn.
 *
 * kosten:  'gratis' | 'klein' (< ~15 euro) | 'investering' (meer, of een aanschaf)
 * plek:    'binnen' | 'buiten' | 'beide'
 * sociaal: 'alleen' | 'samen' | 'beide'
 * energie: 1 (rustig) | 2 (gemiddeld) | 3 (actief)
 * tijd:    richttijd in minuten
 */

const INTERESSES = [
  { id: 'kleding',    label: 'Kleding & naaien',      emoji: '🧵' },
  { id: 'kunst',      label: 'Tekenen & schilderen',  emoji: '🎨' },
  { id: 'koken',      label: 'Koken & bakken',        emoji: '🍳' },
  { id: 'tuin',       label: 'Planten & tuin',        emoji: '🌱' },
  { id: 'klussen',    label: 'Hout & klussen',        emoji: '🔨' },
  { id: 'muziek',     label: 'Muziek',                emoji: '🎧' },
  { id: 'schrijven',  label: 'Schrijven',             emoji: '✏️' },
  { id: 'fotografie', label: 'Fotografie',            emoji: '📷' },
  { id: 'sport',      label: 'Sport & beweging',      emoji: '🏃' },
  { id: 'natuur',     label: 'Natuur & wandelen',     emoji: '🌳' },
  { id: 'techniek',   label: 'Techniek & maken',      emoji: '⚙️' },
  { id: 'spellen',    label: 'Puzzels & spellen',     emoji: '🧩' },
  { id: 'lezen',      label: 'Lezen',                 emoji: '📚' },
  { id: 'sociaal',    label: 'Mensen ontmoeten',      emoji: '☕' },
  { id: 'huis',       label: 'Huis & opruimen',       emoji: '🪴' },
  { id: 'dieren',     label: 'Dieren',                emoji: '🐾' },
  { id: 'welzijn',    label: 'Rust & mindfulness',    emoji: '🧘' },
  { id: 'cultuur',    label: 'Kunst & cultuur',       emoji: '🎭' }
];

const ACTIVITEITEN = [
  /* ---------------------------------------------------------- kleding & naaien */
  {
    id: 'knoop-aanzetten',
    bronnen: ['wikihow'],
    titel: 'Zet een losse knoop weer vast',
    pitch: 'De perfecte eerste naailes: klein, klaar binnen een half uur en je hebt meteen een kledingstuk terug.',
    interesses: ['kleding', 'huis'], tijd: 25, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Naald', 'Draad', 'Schaartje'],
    eersteStap: 'Loop langs je kast en leg het kledingstuk klaar waar al maanden een knoop van los zit.',
    zoek: 'knoop aanzetten uitleg stap voor stap'
  },
  {
    id: 'naaien-leren',
    bronnen: ['wikihow'],
    titel: 'Leer de basissteken met de hand naaien',
    pitch: 'Rijgsteek, stiksteek en overhandse steek. Met die drie kun je bijna alles repareren.',
    interesses: ['kleding'], tijd: 45, kosten: 'klein', kostenIndicatie: '€5–10 voor een naaisetje',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Naaisetje', 'Lapje stof of oude t-shirt'],
    eersteStap: 'Knip een oud t-shirt in vierkantjes om op te oefenen — geen zonde als het mislukt.',
    zoek: 'handmatig naaien basissteken beginners'
  },
  {
    id: 'kledingstuk-vermaken',
    titel: 'Vermaak een kledingstuk dat je nooit meer draagt',
    pitch: 'Mouwen eraf, zoom inkorten, een broek smaller. Uit je kast komt zo een nieuw kledingstuk.',
    interesses: ['kleding', 'kunst'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Naaigerei of naaimachine', 'Spelden'],
    eersteStap: 'Pak het kledingstuk dat je al een jaar niet droeg en bedenk één wijziging.',
    zoek: 'kleding vermaken zelf beginners'
  },
  {
    id: 'zichtbaar-stoppen',
    titel: 'Stop een gat zichtbaar met gekleurd garen',
    pitch: 'Visible mending: een gat wordt een versiering in plaats van iets om te verbergen.',
    interesses: ['kleding', 'kunst'], tijd: 60, kosten: 'klein', kostenIndicatie: '€5 garen',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Borduurgaren', 'Naald', 'Stopei of glas'],
    eersteStap: 'Zoek een trui of sok met een gaatje en kies een kleur die er juist uitspringt.',
    zoek: 'visible mending zichtbaar stoppen uitleg'
  },
  {
    id: 'naaimachine-cursus',
    bronnen: ['volksuniversiteit'],
    titel: 'Volg een naaiworkshop in de buurt',
    pitch: 'Eén avond met iemand die het je voordoet scheelt maanden YouTube.',
    interesses: ['kleding', 'sociaal'], tijd: 150, kosten: 'investering', kostenIndicatie: '€35–75',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Aanmelding'],
    eersteStap: 'Zoek een naaicafé of buurthuis bij jou in de buurt en kijk wanneer de eerstvolgende les is.',
    zoek: 'naaiworkshop beginners'
  },
  {
    id: 'borduren',
    titel: 'Borduur een klein motiefje op een oud shirt',
    pitch: 'Rustgevend, je hoeft niet te kunnen tekenen en het resultaat draag je.',
    interesses: ['kleding', 'kunst', 'welzijn'], tijd: 60, kosten: 'klein', kostenIndicatie: '€8 startset',
    plek: 'beide', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Borduurring', 'Garen', 'Naald'],
    eersteStap: 'Teken met een potlood een simpel bloemetje of streepje op de stof.',
    zoek: 'borduren beginners eenvoudig patroon'
  },

  /* ---------------------------------------------------------- tekenen & schilderen */
  {
    id: 'schetsen-raam',
    titel: 'Teken wat je door het raam ziet',
    pitch: 'Twintig minuten kijken in plaats van scrollen. Het hoeft niet mooi te worden.',
    interesses: ['kunst', 'welzijn'], tijd: 20, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier', 'Potlood'],
    eersteStap: 'Zet een timer op 20 minuten en teken alleen de omtrekken die je ziet.',
    zoek: 'leren schetsen beginners oefening'
  },
  {
    id: 'aquarel',
    titel: 'Probeer aquarelverf uit',
    pitch: 'Water, kleur en toeval. Perfect als je van kleur houdt maar niet van precies werken.',
    interesses: ['kunst'], tijd: 60, kosten: 'klein', kostenIndicatie: '€10–15 startset',
    plek: 'beide', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Aquarelverf', 'Dik papier', 'Kwast'],
    eersteStap: 'Maak eerst een vel vol kleurvlakken zonder plan — alleen om te voelen hoe de verf loopt.',
    zoek: 'aquarelleren beginners oefeningen'
  },
  {
    id: 'muur-schilderen',
    titel: 'Schilder één muur of meubel in een nieuwe kleur',
    pitch: 'Een middag werk en je kamer voelt weken anders.',
    interesses: ['kunst', 'huis', 'klussen'], tijd: 180, kosten: 'investering', kostenIndicatie: '€25–60 verf',
    plek: 'binnen', sociaal: 'beide', energie: 3, niveau: 'starter',
    benodigdheden: ['Verf', 'Roller', 'Afplaktape'],
    eersteStap: 'Kies de muur en haal morgen een testpotje in twee kleuren.',
    zoek: 'muur schilderen stappenplan'
  },
  {
    id: 'handlettering',
    titel: 'Oefen handlettering met één quote',
    pitch: 'Rustig, herhalend werk waar je meteen beter in wordt.',
    interesses: ['kunst', 'schrijven'], tijd: 40, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier', 'Stift of pen'],
    eersteStap: 'Schrijf één woord tien keer op en maak elke keer één letter mooier.',
    zoek: 'handlettering oefenblad beginners'
  },
  {
    id: 'linosnede',
    titel: 'Snijd een linoleum stempel en druk een kaart',
    pitch: 'Je maakt je eigen stempel en drukt er tien kaarten mee af.',
    interesses: ['kunst', 'klussen'], tijd: 120, kosten: 'klein', kostenIndicatie: '€12 startset',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Linoleum', 'Snijgereedschap', 'Blokdrukinkt'],
    eersteStap: 'Teken een simpele vorm (blaadje, maan, hart) op het linoleum.',
    zoek: 'linosnede beginners uitleg'
  },
  {
    id: 'keramiek-workshop',
    bronnen: ['volksuniversiteit'],
    titel: 'Draai een kom op een pottenbakkersschijf',
    pitch: 'Handen in de klei, telefoon vies — dus die blijft in je tas.',
    interesses: ['kunst', 'sociaal'], tijd: 150, kosten: 'investering', kostenIndicatie: '€45–85',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Workshopplek'],
    eersteStap: 'Zoek een keramiekstudio in je stad en kijk of er een losse proefles is.',
    zoek: 'keramiek workshop pottenbakken proefles'
  },

  /* ---------------------------------------------------------- koken & bakken */
  {
    id: 'brood-bakken',
    titel: 'Bak je eigen brood (zonder machine)',
    pitch: 'Kneden, wachten, ruiken. Het wachten is precies de tijd dat je niet op je telefoon zit.',
    interesses: ['koken'], tijd: 180, kosten: 'klein', kostenIndicatie: '€3 ingrediënten',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Bloem', 'Gist', 'Zout', 'Water'],
    eersteStap: 'Kijk of je bloem en gist in huis hebt; zo niet, zet het op je boodschappenlijst.',
    zoek: 'brood bakken zonder machine recept beginners'
  },
  {
    id: 'nieuw-recept',
    titel: 'Kook een gerecht uit een keuken die je nooit maakt',
    pitch: 'Eén onbekend ingrediënt, één nieuw recept, één avond aandacht.',
    interesses: ['koken'], tijd: 75, kosten: 'klein', kostenIndicatie: '€8–15',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Boodschappen'],
    eersteStap: 'Kies een land waarvan je nog nooit iets kookte en zoek er één simpel gerecht bij.',
    zoek: 'eenvoudig recept wereldkeuken'
  },
  {
    id: 'fermenteren',
    titel: 'Zet een pot zuurkool of kimchi op',
    pitch: 'Twintig minuten werk, daarna doet de tijd het werk voor je.',
    interesses: ['koken', 'techniek'], tijd: 40, kosten: 'klein', kostenIndicatie: '€5',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Witte kool', 'Zout', 'Weckpot'],
    eersteStap: 'Weeg de kool, gebruik 2% van dat gewicht aan zout, kneden maar.',
    zoek: 'zuurkool zelf maken pot fermenteren'
  },
  {
    id: 'meal-prep',
    titel: 'Kook een voorraad voor de hele week',
    pitch: 'Eén keer koken, vijf avonden rust — en die avonden hoef je niks te bedenken.',
    interesses: ['koken', 'huis'], tijd: 120, kosten: 'klein', kostenIndicatie: '€15–25',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Bakjes', 'Boodschappen'],
    eersteStap: 'Kies twee gerechten die goed blijven en schrijf het boodschappenlijstje.',
    zoek: 'meal prep weekmenu simpel'
  },
  {
    id: 'bakken-taart',
    titel: 'Bak iets zoets en geef de helft weg',
    pitch: 'Bakken is fijn, maar het langsbrengen bij de buren is het echte plan.',
    interesses: ['koken', 'sociaal'], tijd: 90, kosten: 'klein', kostenIndicatie: '€6',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Basisingrediënten', 'Bakvorm'],
    eersteStap: 'Bedenk aan wie je de helft geeft — dan bak je hem ook echt.',
    zoek: 'makkelijk taart recept'
  },

  /* ---------------------------------------------------------- planten & tuin */
  {
    id: 'stekjes',
    titel: 'Maak stekjes van je kamerplanten',
    pitch: 'Gratis nieuwe planten, en over een paar weken zie je wortels groeien.',
    interesses: ['tuin', 'huis'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Schaar', 'Glaasje water'],
    eersteStap: 'Knip één tak onder een bladknoop af en zet hem in water op de vensterbank.',
    zoek: 'kamerplanten stekken uitleg'
  },
  {
    id: 'kruidentuin',
    bronnen: ['zaaikalender'],
    titel: 'Begin een kruidentuintje op je vensterbank',
    pitch: 'Basilicum, munt en peterselie binnen handbereik — en elke dag even kijken hoe het gaat.',
    interesses: ['tuin', 'koken'], tijd: 45, kosten: 'klein', kostenIndicatie: '€10',
    plek: 'beide', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Potjes', 'Aarde', 'Zaadjes of plantjes'],
    eersteStap: 'Kies de zonnigste vensterbank in huis en meet hoeveel potjes daar passen.',
    zoek: 'kruiden kweken vensterbank beginners'
  },
  {
    id: 'moestuinbak',
    bronnen: ['zaaikalender'],
    titel: 'Zet een moestuinbak op je balkon',
    pitch: 'Een project van maanden dat elke week iets te doen geeft.',
    interesses: ['tuin', 'klussen'], tijd: 150, kosten: 'investering', kostenIndicatie: '€30–70',
    plek: 'buiten', sociaal: 'beide', energie: 3, niveau: 'gevorderd', weerAfhankelijk: true,
    benodigdheden: ['Bak', 'Aarde', 'Zaden'],
    eersteStap: 'Meet je balkon op en kijk hoeveel uur zon het per dag krijgt.',
    zoek: 'moestuin balkon beginnen'
  },
  {
    id: 'zaadbommen',
    titel: 'Maak zaadbommetjes voor bijen',
    pitch: 'Klei, aarde en wilde bloemzaadjes: rommelig werk met een mooi doel.',
    interesses: ['tuin', 'natuur'], tijd: 45, kosten: 'klein', kostenIndicatie: '€5',
    plek: 'beide', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Klei', 'Potgrond', 'Bloemzaad'],
    eersteStap: 'Zoek een saai stukje berm in je straat dat wel wat bloemen kan gebruiken.',
    zoek: 'zaadbommen maken recept'
  },

  /* ---------------------------------------------------------- hout & klussen */
  {
    id: 'plankje-maken',
    bronnen: ['instructables', 'wikihow'],
    titel: 'Maak een wandplankje van steigerhout',
    pitch: 'Zagen, schuren, ophangen. Klaar op één zaterdag en je ziet het elke dag.',
    interesses: ['klussen', 'huis'], tijd: 180, kosten: 'investering', kostenIndicatie: '€20–40',
    plek: 'beide', sociaal: 'beide', energie: 3, niveau: 'starter',
    benodigdheden: ['Plank', 'Schuurpapier', 'Plankdragers', 'Boormachine'],
    eersteStap: 'Meet de muur op en teken met potlood waar het plankje komt.',
    zoek: 'wandplank maken steigerhout stappenplan'
  },
  {
    id: 'meubel-opknappen',
    bronnen: ['kringloop', 'wikihow'],
    titel: 'Knap een tweedehands meubel op',
    pitch: 'Schuren en beitsen: een kringloopkastje wordt jouw kastje.',
    interesses: ['klussen', 'huis', 'kunst'], tijd: 240, kosten: 'investering', kostenIndicatie: '€25–60',
    plek: 'beide', sociaal: 'beide', energie: 3, niveau: 'gevorderd',
    benodigdheden: ['Schuurpapier', 'Beits of verf', 'Kwast'],
    eersteStap: 'Loop deze week één keer door de kringloopwinkel en kijk wat er staat.',
    zoek: 'meubel opknappen schuren beitsen'
  },
  {
    id: 'repareren',
    bronnen: ['wikihow', 'repaircafe'],
    titel: 'Repareer dat ene kapotte ding',
    pitch: 'Die lamp, die la, die fietsbel. Eén ding minder op je "ooit"-lijstje.',
    interesses: ['klussen', 'techniek', 'huis'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0–10',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Gereedschap'],
    eersteStap: 'Loop door je huis en schrijf drie kapotte dingen op. Begin bij de makkelijkste.',
    zoek: 'zelf repareren handleiding'
  },
  {
    id: 'repair-cafe',
    bronnen: ['repaircafe'],
    titel: 'Ga naar een Repair Café met iets kapots',
    pitch: 'Gratis hulp van vrijwilligers, koffie erbij, en je leert het zelf ook.',
    interesses: ['klussen', 'techniek', 'sociaal'], tijd: 120, kosten: 'gratis', kostenIndicatie: '€0 (fooi welkom)',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Iets kapots'],
    eersteStap: 'Zoek het eerstvolgende Repair Café bij jou in de buurt en zet het in je agenda.',
    zoek: 'repair café bij mij in de buurt'
  },

  /* ---------------------------------------------------------- muziek */
  {
    id: 'instrument-leren',
    bronnen: ['akkoorden'],
    titel: 'Leer één liedje op een instrument',
    pitch: 'Vier akkoorden en je kunt honderden nummers spelen.',
    interesses: ['muziek'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0 als je een instrument hebt',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Instrument'],
    eersteStap: 'Kies het liedje dat je écht wil kunnen spelen en zoek de akkoorden op.',
    zoek: 'gitaar akkoorden beginners eerste liedje'
  },
  {
    id: 'plaat-luisteren',
    titel: 'Luister één album van begin tot eind, zonder iets anders te doen',
    pitch: 'Geen shuffle, geen scrollen. Alleen liggen en luisteren, zoals vroeger.',
    interesses: ['muziek', 'welzijn'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Koptelefoon'],
    eersteStap: 'Kies een album dat je nooit helemaal hebt gehoord en leg je telefoon in een andere kamer.',
    zoek: 'albums om helemaal te beluisteren'
  },
  {
    id: 'muziek-maken',
    titel: 'Maak een eigen beat of melodietje',
    pitch: 'Van eerste klik naar een loop van 30 seconden — dat is al een succes.',
    interesses: ['muziek', 'techniek'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0 met gratis software',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Laptop', 'Koptelefoon'],
    eersteStap: 'Installeer een gratis muziekprogramma en maak alleen een drumritme van 8 tellen.',
    zoek: 'muziek maken beginners gratis software'
  },
  {
    id: 'concert-klein',
    titel: 'Ga naar een klein concert in je stad',
    pitch: 'Kleine zaal, onbekende band, tien euro. Vaak leuker dan de grote namen.',
    interesses: ['muziek', 'sociaal', 'cultuur'], tijd: 180, kosten: 'investering', kostenIndicatie: '€8–25',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Kaartje'],
    eersteStap: 'Kijk in de agenda van het poppodium bij jou in de buurt wie er deze week speelt.',
    zoek: 'concertagenda kleine podia'
  },

  /* ---------------------------------------------------------- schrijven & lezen */
  {
    id: 'brief-schrijven',
    titel: 'Schrijf een echte brief aan iemand',
    pitch: 'Pen, papier, postzegel. Niemand krijgt nog post — daarom is het zo leuk om te krijgen.',
    interesses: ['schrijven', 'sociaal'], tijd: 40, kosten: 'klein', kostenIndicatie: '€1 postzegel',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier', 'Pen', 'Postzegel'],
    eersteStap: 'Bedenk wie er blij van zou worden en schrijf de eerste zin op.',
    zoek: 'brief schrijven inspiratie'
  },
  {
    id: 'dagboek',
    titel: 'Schrijf drie pagina’s leeg, ’s ochtends',
    pitch: 'Morning pages: alles wat in je hoofd zit eruit, zonder dat iemand het leest.',
    interesses: ['schrijven', 'welzijn'], tijd: 25, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Schrift', 'Pen'],
    eersteStap: 'Leg vanavond een schrift naast je bed klaar met een pen erop.',
    zoek: 'morning pages uitleg'
  },
  {
    id: 'kort-verhaal',
    titel: 'Schrijf een kort verhaal van één pagina',
    pitch: 'Eén personage, één probleem, één pagina. Meer heb je niet nodig.',
    interesses: ['schrijven'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Papier of laptop'],
    eersteStap: 'Begin met de zin: "Het was de derde keer die week dat..."',
    zoek: 'schrijfoefening kort verhaal'
  },
  {
    id: 'bibliotheek',
    bronnen: ['bibliotheek'],
    titel: 'Loop de bibliotheek in en leen drie boeken op gevoel',
    pitch: 'Niet zoeken, alleen langs de kasten lopen en pakken wat je aanspreekt.',
    interesses: ['lezen', 'cultuur'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0–5 lidmaatschap',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Bibliotheekpas'],
    eersteStap: 'Zoek de openingstijden van je bibliotheek op en prik een moment deze week.',
    zoek: 'bibliotheek openingstijden'
  },
  {
    id: 'leesuur',
    titel: 'Lees een uur met je telefoon in een andere kamer',
    pitch: 'De simpelste ruil: schermtijd voor bladzijden.',
    interesses: ['lezen', 'welzijn'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Boek'],
    eersteStap: 'Leg je telefoon nu in de gang en pak het boek dat half uit is.',
    zoek: 'leestips boeken'
  },

  /* ---------------------------------------------------------- fotografie */
  {
    id: 'fotowandeling',
    titel: 'Maak een fotowandeling met één thema',
    pitch: 'Bijvoorbeeld: alleen deuren, alleen de kleur geel. Je gaat je eigen buurt anders zien.',
    interesses: ['fotografie', 'natuur'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Camera of telefoon'],
    eersteStap: 'Kies je thema voor je de deur uitgaat — dat is de hele oefening.',
    zoek: 'fotowandeling thema ideeën'
  },
  {
    id: 'analoog-fotograferen',
    titel: 'Schiet een rolletje op een analoge camera',
    pitch: '36 foto’s, geen scherm om te checken. Je denkt weer na voor je afdrukt.',
    interesses: ['fotografie'], tijd: 120, kosten: 'investering', kostenIndicatie: '€25–50 rolletje + ontwikkelen',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'gevorderd', weerAfhankelijk: true,
    benodigdheden: ['Analoge camera', 'Filmrolletje'],
    eersteStap: 'Vraag rond of iemand nog een oude camera op zolder heeft liggen.',
    zoek: 'analoog fotograferen beginners rolletje'
  },
  {
    id: 'fotoboek',
    titel: 'Print je mooiste foto’s en maak er een album van',
    pitch: 'Foto’s die alleen op je telefoon staan, bekijkt niemand ooit nog.',
    interesses: ['fotografie', 'huis'], tijd: 90, kosten: 'investering', kostenIndicatie: '€15–40',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Geprinte foto’s', 'Album of plakboek'],
    eersteStap: 'Kies vandaag 24 foto’s van het afgelopen jaar en bestel de afdrukken.',
    zoek: 'foto’s afdrukken fotoalbum maken'
  },

  /* ---------------------------------------------------------- sport & beweging */
  {
    id: 'wandeling-rondje',
    bronnen: ['wandelnet'],
    titel: 'Maak een wandeling zonder route',
    pitch: 'Bij elke kruising links of rechts op gevoel. Telefoon in je zak.',
    interesses: ['natuur', 'sport', 'welzijn'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Schoenen'],
    eersteStap: 'Check eerst even het tabblad Weer & buiten, trek je jas aan en loop de deur uit.',
    zoek: 'wandelroutes in de buurt'
  },
  {
    id: 'lange-wandeling',
    bronnen: ['wandelnet', 'natuurmonumenten', 'staatsbosbeheer'],
    titel: 'Loop een lange route in de natuur',
    pitch: 'Twee tot drie uur buiten doet meer dan welke app dan ook.',
    interesses: ['natuur', 'sport'], tijd: 180, kosten: 'gratis', kostenIndicatie: '€0–10 reiskosten',
    plek: 'buiten', sociaal: 'beide', energie: 3, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Water', 'Goede schoenen'],
    eersteStap: 'Zoek een wandelknooppunt-route bij jou in de buurt en print of teken hem uit.',
    zoek: 'wandelknooppunten route natuurgebied'
  },
  {
    id: 'hardlopen-start',
    titel: 'Begin met hardlopen: 1 minuut rennen, 2 minuten lopen',
    pitch: 'Zo makkelijk dat je geen smoes hebt, en na zes weken loop je 5 kilometer.',
    interesses: ['sport'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 3, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Sportschoenen'],
    eersteStap: 'Doe je schoenen aan en loop tien minuten. Meer hoeft vandaag niet.',
    zoek: 'beginnen met hardlopen schema beginners'
  },
  {
    id: 'zwemmen',
    bronnen: ['zwembad'],
    titel: 'Ga baantjes zwemmen',
    pitch: 'Water, geen telefoon, en je hoofd wordt leeg vanzelf.',
    interesses: ['sport', 'welzijn'], tijd: 75, kosten: 'klein', kostenIndicatie: '€5–8 entree',
    plek: 'binnen', sociaal: 'beide', energie: 3, niveau: 'starter',
    benodigdheden: ['Zwemspullen'],
    eersteStap: 'Zoek de banenzwemtijden van het zwembad bij jou in de buurt.',
    zoek: 'zwembad banenzwemmen tijden'
  },
  {
    id: 'yoga-thuis',
    titel: 'Doe 20 minuten yoga of stretchen',
    pitch: 'Vooral fijn als je de hele dag hebt gezeten.',
    interesses: ['sport', 'welzijn'], tijd: 25, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Matje of handdoek'],
    eersteStap: 'Rol een handdoek uit en begin met alleen je rug rollen.',
    zoek: 'yoga beginners 20 minuten'
  },
  {
    id: 'sportclub',
    titel: 'Doe een proefles bij een sportclub in de buurt',
    pitch: 'Samen sporten houd je veel langer vol dan alleen.',
    interesses: ['sport', 'sociaal'], tijd: 120, kosten: 'klein', kostenIndicatie: '€0–15 proefles',
    plek: 'beide', sociaal: 'samen', energie: 3, niveau: 'starter',
    benodigdheden: ['Sportkleding'],
    eersteStap: 'Zoek twee clubs bij jou in de buurt en mail er één voor een proefles.',
    zoek: 'sportclub proefles in de buurt'
  },
  {
    id: 'fietstocht',
    bronnen: ['fietsknooppunten'],
    titel: 'Fiets een rondje van 20 kilometer',
    pitch: 'Ver genoeg om ergens te komen, kort genoeg om zomaar te doen.',
    interesses: ['sport', 'natuur'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 3, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Fiets'],
    eersteStap: 'Kies een dorp of plek op 10 km afstand en fiets ernaartoe.',
    zoek: 'fietsroutes knooppunten in de buurt'
  },

  /* ---------------------------------------------------------- natuur */
  {
    id: 'vogels-kijken',
    bronnen: ['vogelgeluiden'],
    titel: 'Leer vijf vogels herkennen aan hun geluid',
    pitch: 'Daarna hoor je ze overal — en je luistert in plaats van te scrollen.',
    interesses: ['natuur', 'dieren'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 1, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Oren'],
    eersteStap: 'Ga in het park zitten en probeer alleen het aantal verschillende geluiden te tellen.',
    zoek: 'vogelgeluiden herkennen beginners'
  },
  {
    id: 'zonsopgang',
    titel: 'Kijk een zonsopgang of zonsondergang',
    pitch: 'Eén keer per maand is genoeg om je jaar anders te laten voelen.',
    interesses: ['natuur', 'welzijn'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 1, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Warme jas', 'Thermoskan'],
    eersteStap: 'Zoek het tijdstip op, zet een wekker en bedenk de plek met het verste uitzicht.',
    zoek: 'zonsondergang tijd vandaag'
  },
  {
    id: 'zwerfafval',
    titel: 'Ruim tijdens je wandeling zwerfafval op',
    pitch: 'Plogging: je loopt toch, en je straat wordt er mooier van.',
    interesses: ['natuur', 'sport', 'sociaal'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Vuilniszak', 'Handschoenen'],
    eersteStap: 'Pak een zak uit de keuken en doe de eerste 15 minuten van je rondje.',
    zoek: 'zwerfafval opruimen actie buurt'
  },
  {
    id: 'sterrenkijken',
    bronnen: ['sterrenkaart'],
    titel: 'Ga sterrenkijken op een donkere plek',
    pitch: 'Een half uur naar boven kijken zet alles even in verhouding.',
    interesses: ['natuur', 'welzijn'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'samen', energie: 1, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Warme kleding', 'Kleedje'],
    eersteStap: 'Zoek een plek buiten de stad met weinig lantaarnpalen.',
    zoek: 'donkere plekken sterrenkijken Nederland'
  },

  /* ---------------------------------------------------------- techniek & maken */
  {
    id: 'programmeren-leren',
    titel: 'Bouw je eerste kleine programmaatje',
    pitch: 'Een rekenmachientje of een to-dolijst: klein, af, en van jou.',
    interesses: ['techniek'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Laptop'],
    eersteStap: 'Bedenk het kleinst mogelijke ding dat je zou willen maken.',
    zoek: 'leren programmeren beginners gratis cursus'
  },
  {
    id: 'elektronica',
    titel: 'Knutsel iets met een microcontroller',
    pitch: 'Een lampje dat knippert als het regent — en jij hebt het gemaakt.',
    interesses: ['techniek', 'klussen'], tijd: 150, kosten: 'investering', kostenIndicatie: '€20–40 startset',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Startset', 'Laptop'],
    eersteStap: 'Bestel een startset en begin met het knipperende lampje uit de handleiding.',
    zoek: 'arduino beginners project'
  },
  {
    id: 'fiets-onderhoud',
    titel: 'Onderhoud je fiets zelf',
    pitch: 'Ketting smeren, banden oppompen, remmen afstellen. Rijdt meteen lekkerder.',
    interesses: ['techniek', 'klussen', 'sport'], tijd: 60, kosten: 'klein', kostenIndicatie: '€5–15',
    plek: 'beide', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Kettingolie', 'Pomp', 'Doekje'],
    eersteStap: 'Zet je fiets op de kop en kijk hoe de ketting eruitziet.',
    zoek: 'fiets onderhoud zelf doen uitleg'
  },

  /* ---------------------------------------------------------- puzzels & spellen */
  {
    id: 'legpuzzel',
    bronnen: ['kringloop'],
    titel: 'Leg een puzzel op tafel en laat hem liggen',
    pitch: 'Elke keer als je langsloopt leg je vijf stukjes. Beter dan even je telefoon pakken.',
    interesses: ['spellen', 'welzijn'], tijd: 60, kosten: 'klein', kostenIndicatie: '€3 kringloop',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Puzzel'],
    eersteStap: 'Maak een hoek van de tafel vrij, ook al is dat onhandig.',
    zoek: 'legpuzzel kopen tweedehands'
  },
  {
    id: 'bordspel-avond',
    titel: 'Organiseer een spelletjesavond',
    pitch: 'Drie mensen, twee spellen, iets lekkers. Iedereen zegt ja.',
    interesses: ['spellen', 'sociaal'], tijd: 180, kosten: 'klein', kostenIndicatie: '€10 hapjes',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Spellen', 'Snacks'],
    eersteStap: 'Stuur nu één berichtje naar twee mensen met een datum erin.',
    zoek: 'leuke bordspellen voor een avond'
  },
  {
    id: 'schaken',
    titel: 'Leer schaken (of speel weer eens)',
    pitch: 'Aan een echt bord, tegenover een echt mens.',
    interesses: ['spellen'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0–15 bord',
    plek: 'beide', sociaal: 'samen', energie: 1, niveau: 'starter',
    benodigdheden: ['Schaakbord'],
    eersteStap: 'Vraag iemand of ze zin hebben in een potje deze week.',
    zoek: 'schaken leren beginners openingen'
  },
  {
    id: 'escape-room',
    titel: 'Doe een escape room of stadsspel',
    pitch: 'Twee uur waarin niemand op zijn telefoon kán kijken.',
    interesses: ['spellen', 'sociaal'], tijd: 150, kosten: 'investering', kostenIndicatie: '€20–30 p.p.',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Groepje'],
    eersteStap: 'Vraag in de groepsapp wie er zin in heeft en prik meteen een datum.',
    zoek: 'escape room in de buurt'
  },

  /* ---------------------------------------------------------- sociaal */
  {
    id: 'bellen',
    titel: 'Bel iemand die je lang niet sprak',
    pitch: 'Telefoon gebruiken zoals hij bedoeld was: om te praten.',
    interesses: ['sociaal'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Scroll één keer door je contacten en bel de eerste naam waar je bij glimlacht.',
    zoek: ''
  },
  {
    id: 'vrijwilligerswerk',
    bronnen: ['vrijwilligers', 'nldoet'],
    titel: 'Doe een paar uur vrijwilligerswerk',
    pitch: 'Voedselbank, maatjesproject, natuurwerkdag. Zinvol en je ontmoet mensen.',
    interesses: ['sociaal', 'natuur'], tijd: 180, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Aanmelding'],
    eersteStap: 'Zoek het vrijwilligerspunt van jouw gemeente en kijk welke klus je aanspreekt.',
    zoek: 'vrijwilligerswerk in de buurt vacatures'
  },
  {
    id: 'buurman-koffie',
    titel: 'Drink koffie met een buur',
    pitch: 'De simpelste manier om je straat leuker te maken.',
    interesses: ['sociaal'], tijd: 60, kosten: 'klein', kostenIndicatie: '€0–5',
    plek: 'binnen', sociaal: 'samen', energie: 1, niveau: 'starter',
    benodigdheden: ['Koffie'],
    eersteStap: 'Bak iets kleins en bel aan met de vraag of ze zin hebben in koffie.',
    zoek: ''
  },
  {
    id: 'samen-koken',
    titel: 'Nodig iemand uit om samen te koken',
    pitch: 'Twee mensen, één keuken, geen telefoons want je handen zitten onder het meel.',
    interesses: ['sociaal', 'koken'], tijd: 150, kosten: 'klein', kostenIndicatie: '€10–20',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Boodschappen'],
    eersteStap: 'Stuur een berichtje: "Zin om vrijdag samen te koken?"',
    zoek: 'samen koken recepten voor twee'
  },

  /* ---------------------------------------------------------- huis & rust */
  {
    id: 'lade-opruimen',
    titel: 'Ruim één la of plank helemaal leeg',
    pitch: 'Geen groot opruimproject. Eén la. Vandaag klaar.',
    interesses: ['huis'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Doos voor weg'],
    eersteStap: 'Kies de la waar je zelf het meest van baalt en kieper hem leeg op tafel.',
    zoek: 'opruimen methode stap voor stap'
  },
  {
    id: 'kamer-omgooien',
    titel: 'Zet je kamer helemaal anders neer',
    pitch: 'Gratis verhuizing: dezelfde spullen, een compleet ander gevoel.',
    interesses: ['huis', 'kunst'], tijd: 120, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'beide', energie: 3, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Teken de plattegrond van je kamer en probeer op papier drie andere indelingen.',
    zoek: 'kamer indeling inspiratie'
  },
  {
    id: 'kaarsen-maken',
    titel: 'Giet je eigen kaarsen',
    pitch: 'Was smelten, geur kiezen, wachten tot het hard wordt. Heerlijk traag werk.',
    interesses: ['huis', 'kunst'], tijd: 90, kosten: 'klein', kostenIndicatie: '€12 startset',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Sojawas', 'Lonten', 'Potjes'],
    eersteStap: 'Spaar deze week lege glazen potjes op de vensterbank.',
    zoek: 'kaarsen maken thuis uitleg'
  },
  {
    id: 'digitale-schoonmaak',
    titel: 'Ruim je telefoon op zodat hij saai wordt',
    pitch: 'Scherm op grijstinten, apps van je beginscherm, meldingen uit. De beste investering van 30 minuten.',
    interesses: ['welzijn', 'techniek'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Zet nu alle meldingen uit behalve die van echte mensen.',
    zoek: 'telefoon minder gebruiken instellingen tips'
  },
  {
    id: 'niks-doen',
    titel: 'Doe een kwartier helemaal niets',
    pitch: 'Uit het raam kijken telt. Verveling is waar ideeën vandaan komen.',
    interesses: ['welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Zet een timer op 15 minuten, leg je telefoon weg en ga zitten.',
    zoek: 'niksen verveling voordelen'
  },
  {
    id: 'meditatie',
    titel: 'Mediteer tien minuten zonder app',
    pitch: 'Alleen jij, je adem en een timer.',
    interesses: ['welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Kussen'],
    eersteStap: 'Zet een timer op 10 minuten en tel je ademhalingen tot tien, telkens opnieuw.',
    zoek: 'mediteren beginners ademhaling'
  },
  {
    id: 'bad-boek',
    titel: 'Neem een lang bad of douche met een boek',
    pitch: 'Water en telefoons gaan niet samen. Precies het punt.',
    interesses: ['welzijn', 'lezen'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0–5',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Boek'],
    eersteStap: 'Leg alvast een handdoek en je boek klaar in de badkamer.',
    zoek: ''
  },

  /* ---------------------------------------------------------- dieren */
  {
    id: 'hond-uitlaten',
    titel: 'Laat de hond van iemand anders uit',
    pitch: 'Via een asiel of een buurtapp: jij loopt, de hond is blij.',
    interesses: ['dieren', 'natuur', 'sociaal'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Regenjas'],
    eersteStap: 'Bel het dierenasiel bij jou in de buurt en vraag naar de uitlaatvrijwilligers.',
    zoek: 'hond uitlaten vrijwilliger asiel'
  },
  {
    id: 'vogelhuisje',
    bronnen: ['instructables'],
    titel: 'Timmer een vogelhuisje of insectenhotel',
    pitch: 'Knutselwerk met bewoners: over een paar weken zit er echt iets in.',
    interesses: ['dieren', 'klussen', 'natuur'], tijd: 120, kosten: 'klein', kostenIndicatie: '€10 hout',
    plek: 'beide', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Hout', 'Spijkers', 'Zaag'],
    eersteStap: 'Zoek een bouwtekening en kijk welke restplankjes je al hebt liggen.',
    zoek: 'vogelhuisje maken bouwtekening'
  },

  /* ---------------------------------------------------------- cultuur */
  {
    id: 'museum-uur',
    bronnen: ['musea'],
    titel: 'Ga naar een museum en bekijk maar één zaal',
    pitch: 'Niet alles zien, wel echt kijken. Een uur is genoeg.',
    interesses: ['cultuur', 'kunst'], tijd: 120, kosten: 'investering', kostenIndicatie: '€0–17 (gratis met Museumkaart)',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Kaartje'],
    eersteStap: 'Kijk welk museum bij jou in de buurt zit en wat er nu te zien is.',
    zoek: 'museum tentoonstelling in de buurt'
  },
  {
    id: 'markt-bezoek',
    titel: 'Loop over een rommel- of boerenmarkt',
    pitch: 'Kijken, praten, iets vinden waar je niet naar zocht.',
    interesses: ['cultuur', 'sociaal'], tijd: 90, kosten: 'klein', kostenIndicatie: '€0–15',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Contant geld', 'Tas'],
    eersteStap: 'Zoek op welke dag de markt in jouw buurt is.',
    zoek: 'rommelmarkt boerenmarkt in de buurt'
  },
  {
    id: 'film-bios',
    titel: 'Ga naar een filmhuis in plaats van streamen',
    pitch: 'Twee uur zonder pauzeknop en zonder tweede scherm.',
    interesses: ['cultuur', 'sociaal'], tijd: 150, kosten: 'investering', kostenIndicatie: '€8–14',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Kaartje'],
    eersteStap: 'Kijk in de agenda van het filmhuis bij jou in de buurt wat er deze week draait.',
    zoek: 'filmhuis programma deze week'
  },
  {
    id: 'stadswandeling',
    titel: 'Doe een gratis stadswandeling langs gebouwen die je nooit bekijkt',
    pitch: 'Je eigen stad als toerist: kijk omhoog, boven de winkelpuien.',
    interesses: ['cultuur', 'natuur', 'fotografie'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: [],
    eersteStap: 'Kies een straat waar je nooit komt en begin daar.',
    zoek: 'stadswandeling route gratis'
  },
  {
    id: 'taal-leren',
    titel: 'Leer 20 woorden in een nieuwe taal — op papier',
    pitch: 'Flashcards met de hand geschreven blijven beter hangen dan een app.',
    interesses: ['cultuur', 'schrijven'], tijd: 40, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Kaartjes', 'Pen'],
    eersteStap: 'Kies de taal en schrijf de tien woorden op die je als eerste zou willen kunnen zeggen.',
    zoek: 'taal leren flashcards methode'
  },

  /* ---------------------------------------------------- korte momenten (< 20 min) */
  {
    id: 'rondje-blok',
    titel: 'Loop een rondje om het blok zonder telefoon',
    pitch: 'Tien minuten, geen podcast, geen muziek. Alleen kijken wat er in je straat gebeurt.',
    interesses: ['natuur', 'sport', 'welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'alleen', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: [],
    eersteStap: 'Laat je telefoon op tafel liggen en trek je jas aan.',
    zoek: ''
  },
  {
    id: 'planten-rondje',
    titel: 'Verzorg je planten: water, dood blad, draaien',
    pitch: 'Een klein rondje langs de vensterbanken. Verrassend rustgevend.',
    interesses: ['tuin', 'huis', 'welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Gieter'],
    eersteStap: 'Voel bij elke plant met je vinger of de aarde droog is.',
    zoek: 'kamerplanten verzorging basis'
  },
  {
    id: 'blind-tekenen',
    titel: 'Teken je hand zonder naar je papier te kijken',
    pitch: 'Blind contour drawing: het wordt lelijk en dat is precies de bedoeling.',
    interesses: ['kunst', 'welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier', 'Pen'],
    eersteStap: 'Kijk alleen naar je hand, laat je pen meelopen en kijk niet omlaag.',
    zoek: 'blind contour drawing oefening'
  },
  {
    id: 'akkoord-oefenen',
    bronnen: ['akkoorden'],
    titel: 'Oefen tien minuten één akkoordwissel',
    pitch: 'Elke dag tien minuten hetzelfde stukje: daar word je echt beter van.',
    interesses: ['muziek'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Instrument'],
    eersteStap: 'Zet een timer op tien minuten en wissel steeds tussen twee akkoorden.',
    zoek: 'akkoordwissels oefenen gitaar'
  },
  {
    id: 'kaartje-sturen',
    titel: 'Schrijf een kaartje voor iemand',
    pitch: 'Vijf zinnen, één postzegel, en iemands dag is goed.',
    interesses: ['schrijven', 'sociaal'], tijd: 15, kosten: 'klein', kostenIndicatie: '€1–3',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Kaart', 'Postzegel'],
    eersteStap: 'Kies iemand die geen kaartje verwacht — dat is het leukste.',
    zoek: ''
  },
  {
    id: 'stretchen-kort',
    titel: 'Rek tien minuten je schouders en rug los',
    pitch: 'Precies de plekken waar het telefoonkijken in gaat zitten.',
    interesses: ['sport', 'welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Ga staan, laat je hoofd langzaam naar één schouder zakken en adem uit.',
    zoek: 'stretch oefeningen nek schouders'
  },
  {
    id: 'recept-plannen',
    titel: 'Zoek één nieuw recept uit en schrijf het lijstje',
    pitch: 'Kort klusje nu, leuke avond straks.',
    interesses: ['koken', 'huis'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier'],
    eersteStap: 'Blader door een kookboek in plaats van door je telefoon.',
    zoek: 'kookboek recepten inspiratie'
  },
  {
    id: 'sok-stoppen',
    titel: 'Stop een sok of zet een zoom vast',
    pitch: 'Klein naaiklusje van een kwartier, meteen resultaat.',
    interesses: ['kleding', 'huis'], tijd: 20, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Naald', 'Draad'],
    eersteStap: 'Pak de sok met het gat en een draad die er ongeveer bij past.',
    zoek: 'sok stoppen uitleg'
  },

  /* ═══════════════════════════════ Offline+ pakketten ═══════════════════════
     Deze staan achter het abonnement. Ze zijn erbij gekomen — er is niets
     weggehaald bij de gratis versie. Zie js/betaling.js. */

  /* --- pakket: met kinderen --- */
  {
    id: 'plus-schatkaart',
    titel: 'Maak een echte schatkaart en verstop iets in het park',
    pitch: 'Thee-vlekken, verbrande randen, een kruisje. De middag is zo om.',
    pakket: 'Met kinderen', plus: true,
    interesses: ['spellen', 'kunst', 'natuur'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'samen', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Papier', 'Thee', 'Iets om te verstoppen'],
    eersteStap: 'Zet thee, laat het papier erin weken en leg het te drogen.',
    zoek: 'schatkaart maken kinderen'
  },
  {
    id: 'plus-hut-bouwen',
    titel: 'Bouw een hut van dekens (of van takken buiten)',
    pitch: 'Binnen met de eettafel, buiten met wat je vindt. Daarna erin lezen.',
    pakket: 'Met kinderen', plus: true,
    interesses: ['spellen', 'klussen', 'natuur'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'samen', energie: 3, niveau: 'starter',
    benodigdheden: ['Dekens', 'Wasknijpers'],
    eersteStap: 'Verzamel alle dekens in huis op één plek.',
    zoek: 'hut bouwen kinderen ideeën'
  },
  {
    id: 'plus-kinderkeuken',
    titel: 'Laat de kinderen het avondeten bedenken én koken',
    pitch: 'Jij bent hulpje. Het wordt rommelig en ze eten alles op.',
    pakket: 'Met kinderen', plus: true,
    interesses: ['koken', 'sociaal'], tijd: 90, kosten: 'klein', kostenIndicatie: '€10',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'starter',
    benodigdheden: ['Boodschappen'],
    eersteStap: 'Laat ze een menukaart tekenen voor je naar de winkel gaat.',
    zoek: 'koken met kinderen simpele recepten'
  },

  /* --- pakket: samen --- */
  {
    id: 'plus-blind-date-stad',
    titel: 'Doe een blinde stadsdate: dobbelsteen bepaalt de route',
    pitch: 'Even = links, oneven = rechts. Waar je uitkomt, daar eet je.',
    pakket: 'Samen', plus: true,
    interesses: ['sociaal', 'cultuur', 'natuur'], tijd: 150, kosten: 'klein', kostenIndicatie: '€10–25',
    plek: 'buiten', sociaal: 'samen', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Dobbelsteen', 'Goede schoenen'],
    eersteStap: 'Spreek af bij een halte waar jullie nooit uitstappen.',
    zoek: 'stadswandeling spel ideeën'
  },
  {
    id: 'plus-vragenavond',
    titel: 'Stel elkaar 20 vragen die je nooit stelt',
    pitch: 'Telefoons in een la, één kaars aan, en beginnen bij vraag één.',
    pakket: 'Samen', plus: true,
    interesses: ['sociaal', 'welzijn'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'samen', energie: 1, niveau: 'starter',
    benodigdheden: ['Kaars'],
    eersteStap: 'Schrijf ieder vijf vragen op waar je zelf het antwoord niet van weet.',
    zoek: 'diepe vragen gesprek ideeën'
  },
  {
    id: 'plus-samen-project',
    titel: 'Begin een project dat maanden duurt, samen',
    pitch: 'Een moestuin, een fotoboek, een verbouwing van één hoek. Iets met een einde.',
    pakket: 'Samen', plus: true,
    interesses: ['klussen', 'tuin', 'huis'], tijd: 120, kosten: 'investering', kostenIndicatie: '€25+',
    plek: 'beide', sociaal: 'samen', energie: 2, niveau: 'gevorderd',
    benodigdheden: ['Schrift voor het plan'],
    eersteStap: 'Schrijf ieder drie projecten op en kies de enige die op beide lijstjes staat.',
    zoek: 'samen project ideeën lange termijn'
  },

  /* --- pakket: seizoenen --- */
  {
    id: 'plus-herfstverf',
    titel: 'Maak verf van herfstbladeren en bessen',
    pitch: 'Kleuren uit het bos: pletten, zeven, schilderen.',
    pakket: 'Seizoenen', plus: true,
    interesses: ['kunst', 'natuur', 'tuin'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'beide', energie: 2, niveau: 'gevorderd', weerAfhankelijk: true,
    benodigdheden: ['Vijzel of lepel', 'Zeefje', 'Papier'],
    eersteStap: 'Verzamel op je wandeling drie soorten bladeren met verschillende kleuren.',
    zoek: 'natuurlijke verf maken planten'
  },
  {
    id: 'plus-winterlicht',
    titel: 'Maak lichtjes voor de donkere maanden',
    pitch: 'Waxinelichthouders van glazen potten en oud papier. Kost niets, scheelt veel.',
    pakket: 'Seizoenen', plus: true,
    interesses: ['huis', 'kunst', 'welzijn'], tijd: 60, kosten: 'klein', kostenIndicatie: '€5',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Glazen potjes', 'Vloeipapier', 'Lijm'],
    eersteStap: 'Was drie lege potjes en trek de etiketten eraf.',
    zoek: 'waxinelichthouder maken zelf'
  },
  {
    id: 'plus-zomeravond',
    titel: 'Eet buiten op een plek waar je nooit eet',
    pitch: 'Balkon, park, dak, berm. Een kleedje en wat je in huis hebt.',
    pakket: 'Seizoenen', plus: true,
    interesses: ['koken', 'natuur', 'sociaal'], tijd: 90, kosten: 'klein', kostenIndicatie: '€8',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Kleedje', 'Eten'],
    eersteStap: 'Kijk bij Weer & buiten wanneer het vanavond droog is.',
    zoek: 'picknick ideeën simpel'
  },
  {
    id: 'plus-jaaroverzicht',
    titel: 'Maak een jaaroverzicht van je dagboek',
    pitch: 'Lees je bladzijden terug en kies per maand één zin die blijft.',
    pakket: 'Seizoenen', plus: true,
    interesses: ['schrijven', 'welzijn'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Je dagboek'],
    eersteStap: 'Open je archief en begin bij de oudste bladzijde.',
    zoek: ''
  },

  /* ═══════════════════════════════ tweede ronde activiteiten ═══════════════
     Meer variatie: korte klusjes, dingen met je handen, dingen buiten, en
     een paar die je maar één keer per jaar doet. */

  /* --- kleding & handwerk --- */
  {
    id: 'sokken-breien',
    titel: 'Leer breien met een simpele sjaal',
    pitch: 'Twee naalden, één steek. Je kunt het voor de televisie doen en toch iets maken.',
    interesses: ['kleding', 'welzijn'], tijd: 60, kosten: 'klein', kostenIndicatie: '€10 wol en naalden',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    bronnen: ['wikihow'],
    benodigdheden: ['Breinaalden', 'Bol wol'],
    eersteStap: 'Zet twintig steken op en brei tien rijen — hoe scheef ook.',
    zoek: 'breien voor beginners sjaal'
  },
  {
    id: 'kleding-verven',
    titel: 'Verf een verkleurd kledingstuk opnieuw',
    pitch: 'Die grijs geworden zwarte broek wordt weer zwart. Of juist knalgeel.',
    interesses: ['kleding', 'kunst'], tijd: 90, kosten: 'klein', kostenIndicatie: '€8 textielverf',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Textielverf', 'Zout', 'Emmer'],
    eersteStap: 'Zoek een kledingstuk van katoen op — dat neemt verf het beste aan.',
    zoek: 'kleding verven textielverf uitleg'
  },
  {
    id: 'tas-van-shirt',
    titel: 'Maak een boodschappentas van een oud t-shirt',
    pitch: 'Knippen, onderkant dichtnaaien, klaar. Tien minuten en je hebt een tas.',
    interesses: ['kleding', 'huis'], tijd: 25, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Oud t-shirt', 'Schaar', 'Naald en draad'],
    eersteStap: 'Knip de mouwen en de hals eruit; dat worden de hengsels.',
    zoek: 'tas maken van t-shirt zonder naaimachine'
  },

  /* --- kunst --- */
  {
    id: 'stempel-aardappel',
    titel: 'Snijd stempels uit een aardappel en bedruk papier',
    pitch: 'Kinderlijk eenvoudig, verrassend mooi. Inpakpapier voor het hele jaar.',
    interesses: ['kunst', 'huis'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'samen', energie: 1, niveau: 'starter',
    benodigdheden: ['Aardappel', 'Mesje', 'Verf'],
    eersteStap: 'Snijd een aardappel doormidden en teken er met een mes een vorm in.',
    zoek: 'aardappelstempel maken'
  },
  {
    id: 'collage-tijdschrift',
    titel: 'Maak een collage van oude tijdschriften',
    pitch: 'Scheuren, schuiven, plakken. Geen enkele beslissing is fout.',
    interesses: ['kunst', 'welzijn'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Oude tijdschriften', 'Lijm', 'Karton'],
    eersteStap: 'Scheur twintig stukjes uit zonder na te denken over wat het wordt.',
    zoek: 'collage maken tijdschrift ideeën'
  },
  {
    id: 'krijt-stoep',
    titel: 'Teken iets groots op de stoep met krijt',
    pitch: 'Voor de deur, met of zonder kinderen. Weg met de eerste regen, en dat is prima.',
    interesses: ['kunst', 'sociaal'], tijd: 30, kosten: 'klein', kostenIndicatie: '€3 stoepkrijt',
    plek: 'buiten', sociaal: 'samen', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Stoepkrijt'],
    eersteStap: 'Kijk waar de stoep het grootst en het gladst is.',
    zoek: 'stoepkrijt ideeën tekenen'
  },
  {
    id: 'zentangle',
    titel: 'Vul een vel met patroontjes',
    pitch: 'Streepje voor streepje. Je hoofd wordt er stil van en het staat op papier.',
    interesses: ['kunst', 'welzijn'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier', 'Fijne pen'],
    eersteStap: 'Teken een kronkellijn over het vel en vul elk vak met een ander patroon.',
    zoek: 'zentangle patronen beginners'
  },

  /* --- koken --- */
  {
    id: 'soep-restjes',
    titel: 'Maak soep van alles wat over is',
    pitch: 'Je koelkast leeg, je vriezer vol, en niets weggegooid.',
    interesses: ['koken', 'huis'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Wat er in de koelkast ligt', 'Grote pan'],
    eersteStap: 'Leg alle groente die niet lang meer goed is op het aanrecht.',
    zoek: 'restjes soep recept'
  },
  {
    id: 'pasta-zelf',
    titel: 'Maak pasta van bloem en ei',
    pitch: 'Twee ingrediënten en je handen. Het verschil met een pak is groter dan je denkt.',
    interesses: ['koken'], tijd: 90, kosten: 'klein', kostenIndicatie: '€3',
    plek: 'binnen', sociaal: 'samen', energie: 2, niveau: 'gevorderd',
    bronnen: ['wikihow'],
    benodigdheden: ['Bloem', 'Eieren', 'Deegroller'],
    eersteStap: 'Honderd gram bloem per ei, kneden tot het niet meer plakt.',
    zoek: 'verse pasta maken zonder machine'
  },
  {
    id: 'ontbijt-plannen',
    titel: 'Maak overnight oats voor de hele week',
    pitch: 'Vijf potjes, tien minuten werk, en \'s ochtends geen gedoe.',
    interesses: ['koken', 'welzijn'], tijd: 20, kosten: 'klein', kostenIndicatie: '€5',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Havermout', 'Yoghurt of melk', 'Potjes'],
    eersteStap: 'Zoek vijf schone potjes met een deksel.',
    zoek: 'overnight oats recept variaties'
  },
  {
    id: 'jam-maken',
    titel: 'Kook jam van seizoensfruit',
    pitch: 'De keuken ruikt uren goed, en je hebt maanden ontbijt.',
    interesses: ['koken', 'tuin'], tijd: 90, kosten: 'klein', kostenIndicatie: '€8',
    plek: 'binnen', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Fruit', 'Geleisuiker', 'Weckpotten'],
    eersteStap: 'Kijk op de markt welk fruit nu het goedkoopst is — dat is het fruit van nu.',
    zoek: 'jam maken geleisuiker recept'
  },

  /* --- tuin & natuur --- */
  {
    id: 'tegel-eruit',
    titel: 'Haal een tegel uit je tuin en zet er iets groens voor terug',
    pitch: 'Eén tegel is genoeg om te beginnen. Het regenwater en de bijen merken het.',
    interesses: ['tuin', 'natuur', 'klussen'], tijd: 45, kosten: 'klein', kostenIndicatie: '€5 plantje',
    plek: 'buiten', sociaal: 'beide', energie: 3, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Schep', 'Plantje'],
    eersteStap: 'Zoek de tegel waar toch nooit iemand loopt.',
    zoek: 'tegel eruit plant erin tuin vergroenen'
  },
  {
    id: 'bloembollen',
    titel: 'Poot bloembollen voor het voorjaar',
    pitch: 'Een half uur werk nu, en in maart sta je te kijken.',
    interesses: ['tuin', 'natuur'], tijd: 45, kosten: 'klein', kostenIndicatie: '€8 bollen',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    bronnen: ['zaaikalender'],
    benodigdheden: ['Bloembollen', 'Schepje'],
    eersteStap: 'Kijk welke plek in het voorjaar het eerst zon krijgt.',
    zoek: 'bloembollen planten wanneer hoe diep'
  },
  {
    id: 'paddenstoelen',
    titel: 'Ga paddenstoelen zoeken (om te bekijken)',
    pitch: 'Herfst, bos, en meer soorten dan je dacht. Niets plukken, alleen kijken.',
    interesses: ['natuur', 'fotografie'], tijd: 120, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 2, niveau: 'starter', weerAfhankelijk: true,
    bronnen: ['natuurmonumenten'],
    benodigdheden: ['Laarzen'],
    eersteStap: 'Zoek een bos met veel oude bomen; daar staat het meest.',
    zoek: 'paddenstoelen herkennen beginners'
  },
  {
    id: 'blote-voeten',
    titel: 'Loop een stuk op blote voeten door gras of zand',
    pitch: 'Klinkt zweverig, voelt verrassend goed, kost tien minuten.',
    interesses: ['natuur', 'welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 1, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: [],
    eersteStap: 'Zoek het dichtstbijzijnde stuk gras waar geen honden komen.',
    zoek: ''
  },

  /* --- klussen & techniek --- */
  {
    id: 'gereedschap-ordenen',
    titel: 'Maak één lade of kast waar je gereedschap in past',
    pitch: 'De helft van niet-klussen is niet kunnen vinden wat je nodig hebt.',
    interesses: ['klussen', 'huis'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Doos', 'Doek'],
    eersteStap: 'Kieper alles op de grond en leg drie stapels: houden, weg, hoort ergens anders.',
    zoek: 'gereedschap opbergen ideeën'
  },
  {
    id: 'kraan-repareren',
    titel: 'Repareer een druppelende kraan',
    pitch: 'Een rubbertje van vijftig cent en een half uur. Scheelt liters per dag.',
    interesses: ['klussen', 'techniek', 'huis'], tijd: 45, kosten: 'klein', kostenIndicatie: '€3 leertjes',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'gevorderd',
    bronnen: ['wikihow'],
    benodigdheden: ['Steeksleutel', 'Nieuwe leertjes'],
    eersteStap: 'Draai eerst de hoofdkraan dicht — dat is echt stap één.',
    zoek: 'druppelende kraan repareren leertje vervangen'
  },
  {
    id: 'laptop-schoon',
    titel: 'Maak je laptop of telefoon van binnen en buiten schoon',
    pitch: 'Stof eruit, bestanden opgeruimd, meldingen uit. Voelt als een nieuw apparaat.',
    interesses: ['techniek', 'huis', 'welzijn'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Doekje', 'Perslucht of kwastje'],
    eersteStap: 'Zet hem uit en haal de stekker eruit voor je begint.',
    zoek: 'laptop schoonmaken stof verwijderen'
  },
  {
    id: 'oude-telefoon',
    titel: 'Geef een oude telefoon een tweede leven',
    pitch: 'Als wekker, keukentimer, muziekspeler of babyfoon — zonder simkaart.',
    interesses: ['techniek', 'huis'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Oude telefoon'],
    eersteStap: 'Zoek hem uit de la en zet hem aan de lader.',
    zoek: 'oude telefoon hergebruiken ideeën'
  },

  /* --- muziek, lezen, schrijven --- */
  {
    id: 'afspeellijst-maken',
    titel: 'Maak een afspeellijst voor iemand anders',
    pitch: 'Zoals vroeger een cassettebandje: twaalf nummers en waarom je ze koos.',
    interesses: ['muziek', 'sociaal'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Bedenk voor wie, en schrijf het eerste nummer op papier.',
    zoek: ''
  },
  {
    id: 'voorlezen',
    titel: 'Lees iemand hardop voor',
    pitch: 'Een kind, je partner, of iemand die slecht ziet. Twintig minuten, meer niet.',
    interesses: ['lezen', 'sociaal'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'samen', energie: 1, niveau: 'starter',
    bronnen: ['bibliotheek'],
    benodigdheden: ['Boek'],
    eersteStap: 'Kies een verhaal dat je zelf mooi vindt — dat hoor je.',
    zoek: 'voorleesboeken tips'
  },
  {
    id: 'gedicht-uit-hoofd',
    titel: 'Leer een gedicht uit je hoofd',
    pitch: 'Ouderwets, en je hebt het de rest van je leven bij je.',
    interesses: ['schrijven', 'lezen'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Een gedicht'],
    eersteStap: 'Schrijf het met de hand over; dat helpt meer dan het tien keer lezen.',
    zoek: 'korte gedichten nederlands mooi'
  },
  {
    id: 'levensverhaal',
    titel: 'Vraag iemand van boven de zeventig naar vroeger',
    pitch: 'Neem het op of schrijf het op. Over tien jaar is het onbetaalbaar.',
    interesses: ['schrijven', 'sociaal'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'samen', energie: 1, niveau: 'starter',
    benodigdheden: ['Schrift of recorder'],
    eersteStap: 'Bel op en vraag: "Mag ik langskomen om iets te vragen over vroeger?"',
    zoek: 'levensverhaal interview vragen ouderen'
  },

  /* --- sport & beweging --- */
  {
    id: 'trap-lopen',
    titel: 'Loop tien minuten de trap op en af',
    pitch: 'Geen sportschool, geen weer-excuus, en je merkt het meteen.',
    interesses: ['sport'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 3, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Zet een timer op tien minuten en begin rustig.',
    zoek: 'traptraining thuis oefening'
  },
  {
    id: 'dansen-keuken',
    titel: 'Zet drie nummers op en dans in de keuken',
    pitch: 'Nee, er kijkt niemand. Ja, het werkt.',
    interesses: ['sport', 'muziek', 'welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'beide', energie: 3, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Kies het nummer waar je altijd blij van wordt.',
    zoek: ''
  },
  {
    id: 'buitensport-gratis',
    titel: 'Zoek een gratis buitenfitness of trimbaan',
    pitch: 'In bijna elke gemeente staat er een, en bijna niemand weet het.',
    interesses: ['sport', 'natuur'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'buiten', sociaal: 'beide', energie: 3, niveau: 'starter', weerAfhankelijk: true,
    benodigdheden: ['Sportkleding'],
    eersteStap: 'Zoek op waar het dichtstbijzijnde trimparcours ligt.',
    zoek: 'buitenfitness trimbaan in de buurt'
  },
  {
    id: 'wandelclub',
    titel: 'Sluit je aan bij een wandel- of hardloopgroep',
    pitch: 'Afspraak met anderen is de enige echte reden om toch te gaan.',
    interesses: ['sport', 'sociaal', 'natuur'], tijd: 90, kosten: 'gratis', kostenIndicatie: '€0–5',
    plek: 'buiten', sociaal: 'samen', energie: 3, niveau: 'starter', weerAfhankelijk: true,
    bronnen: ['wandelnet'],
    benodigdheden: ['Schoenen'],
    eersteStap: 'Zoek een groep die deze week loopt en stuur één berichtje.',
    zoek: 'wandelgroep hardloopgroep beginners in de buurt'
  },

  /* --- huis, rust, dieren, cultuur --- */
  {
    id: 'ramen-lappen',
    titel: 'Lap de ramen van één kamer',
    pitch: 'Saai klusje, verbluffend effect. Het licht komt terug.',
    interesses: ['huis'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Emmer', 'Trekker', 'Doek'],
    eersteStap: 'Begin bij het raam waar je het vaakst doorheen kijkt.',
    zoek: 'ramen lappen zonder strepen'
  },
  {
    id: 'kast-doneren',
    titel: 'Zoek tien dingen die weg mogen en breng ze weg',
    pitch: 'Niet op een stapel "voor later". Vandaag in de auto, vandaag weg.',
    interesses: ['huis', 'sociaal'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 2, niveau: 'starter',
    bronnen: ['kringloop'],
    benodigdheden: ['Tas of doos'],
    eersteStap: 'Loop met een tas door één kamer en stop er tien dingen in.',
    zoek: 'spullen doneren kringloop weggeefkast'
  },
  {
    id: 'brievenbus-nee',
    titel: 'Regel de kleine dingen die je al maanden uitstelt',
    pitch: 'Nee-sticker, verzekering, dat ene telefoontje. Zet een timer op 45 minuten.',
    interesses: ['huis', 'welzijn'], tijd: 45, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 2, niveau: 'starter',
    benodigdheden: ['Papier en pen'],
    eersteStap: 'Schrijf vijf dingen op die je al maanden vooruitschuift en begin bij de kortste.',
    zoek: ''
  },
  {
    id: 'ademhaling',
    titel: 'Doe vijf minuten rustige ademhaling',
    pitch: 'Vier tellen in, zes tellen uit. Meer is het niet, en het werkt meteen.',
    interesses: ['welzijn'], tijd: 15, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: [],
    eersteStap: 'Ga zitten, adem in op vier tellen en uit op zes. Tien keer.',
    zoek: 'ademhalingsoefening rust vier zes'
  },
  {
    id: 'dierenasiel-bezoek',
    titel: 'Breng iets langs bij het dierenasiel',
    pitch: 'Oude handdoeken, dekens, voer. Ze kunnen alles gebruiken.',
    interesses: ['dieren', 'sociaal'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0–10',
    plek: 'beide', sociaal: 'beide', energie: 2, niveau: 'starter',
    benodigdheden: ['Oude handdoeken'],
    eersteStap: 'Bel het asiel en vraag wat ze op dit moment nodig hebben.',
    zoek: 'dierenasiel spullen doneren wat nodig'
  },
  {
    id: 'winterse-vogels',
    titel: 'Hang een vetbol of voederhuisje op',
    pitch: 'Binnen een week zit er iets, en dan kijk je elke ochtend uit het raam.',
    interesses: ['dieren', 'natuur', 'tuin'], tijd: 20, kosten: 'klein', kostenIndicatie: '€5',
    plek: 'buiten', sociaal: 'beide', energie: 1, niveau: 'starter',
    bronnen: ['vogelgeluiden'],
    benodigdheden: ['Vetbollen', 'Touw'],
    eersteStap: 'Zoek een tak of haak die je vanaf je keukenraam kunt zien.',
    zoek: 'vogels voeren winter wat mag wel'
  },
  {
    id: 'open-monumenten',
    titel: 'Ga naar een gebouw dat normaal dicht is',
    pitch: 'Open monumentendag, een rondleiding, een kerk of watertoren.',
    interesses: ['cultuur', 'fotografie'], tijd: 120, kosten: 'gratis', kostenIndicatie: '€0–10',
    plek: 'beide', sociaal: 'beide', energie: 2, niveau: 'starter',
    bronnen: ['musea'],
    benodigdheden: [],
    eersteStap: 'Zoek welke gebouwen bij jou in de buurt rondleidingen geven.',
    zoek: 'open monumentendag rondleiding in de buurt'
  },
  {
    id: 'lokale-geschiedenis',
    titel: 'Zoek uit wat er vroeger op jouw straat stond',
    pitch: 'Oude kaarten en foto\'s van je eigen adres. Je loopt er daarna anders.',
    interesses: ['cultuur', 'lezen'], tijd: 60, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'binnen', sociaal: 'alleen', energie: 1, niveau: 'starter',
    bronnen: ['bibliotheek'],
    benodigdheden: [],
    eersteStap: 'Zoek het archief van je gemeente en typ je straatnaam in.',
    zoek: 'oude foto\'s straat gemeentearchief'
  },
  {
    id: 'taal-buurman',
    titel: 'Leer tien woorden in de taal van je buren',
    pitch: 'Turks, Pools, Arabisch, Fries. Eén zin kan een straat veranderen.',
    interesses: ['cultuur', 'sociaal'], tijd: 30, kosten: 'gratis', kostenIndicatie: '€0',
    plek: 'beide', sociaal: 'beide', energie: 1, niveau: 'starter',
    benodigdheden: ['Papier'],
    eersteStap: 'Begin met "goedemorgen", "dank je wel" en "hoe gaat het?".',
    zoek: 'basiswoorden leren taal begroeting'
  },
  {
    id: 'spelletje-alleen',
    titel: 'Doe een kruiswoordpuzzel of sudoku op papier',
    pitch: 'Papier, pen, geen scherm dat je onderbreekt.',
    interesses: ['spellen', 'welzijn'], tijd: 30, kosten: 'klein', kostenIndicatie: '€3 puzzelboekje',
    plek: 'beide', sociaal: 'alleen', energie: 1, niveau: 'starter',
    benodigdheden: ['Puzzelboekje', 'Potlood'],
    eersteStap: 'Haal een puzzelboekje bij de supermarkt en leg het op tafel.',
    zoek: 'puzzelboekje sudoku kruiswoord'
  },
  {
    id: 'kaartspel-leren',
    titel: 'Leer een ouderwets kaartspel',
    pitch: 'Klaverjassen, hartenjagen, patience. Eén pak kaarten, honderd avonden.',
    interesses: ['spellen', 'sociaal'], tijd: 60, kosten: 'klein', kostenIndicatie: '€3 kaarten',
    plek: 'binnen', sociaal: 'beide', energie: 1, niveau: 'starter',
    bronnen: ['wikihow'],
    benodigdheden: ['Pak kaarten'],
    eersteStap: 'Zoek de regels van één spel op en speel de eerste ronde open.',
    zoek: 'kaartspel regels klaverjassen hartenjagen'
  }
];
