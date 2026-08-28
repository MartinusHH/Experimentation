// De Medicijnwijzer: gewone taal bij het doosje dat je van de dierenarts
// meekreeg. Bewust géén AI en bewust géén doseringen — wat, hoeveel en hoe
// lang staat op het etiket van jóuw dierenarts, en dat is leidend.
//
// De app herkent bekende merknamen en werkzame stoffen en laat dan zien wat
// voor soort middel het is, hoe je het het makkelijkst geeft, en waar je op let.

export const DISCLAIMER =
  'Deze uitleg vervangt geen dierenarts. Volg altijd het etiket en de instructies '
  + 'van je eigen dierenarts, en bel bij twijfel of bij nieuwe klachten.';

export const SOORTEN = [
  {
    id: 'ontworming', naam: 'Ontworming', emoji: '🪱',
    namen: ['milbemax', 'drontal', 'panacur', 'praziquantel', 'milbemycine', 'fenbendazol', 'profender', 'ontworm', 'wormkuur', 'pyrantel'],
    wat: 'Een kuurtje dat wormen in de darmen opruimt. Het werkt op de wormen die er ná de gift zíjn — het is geen bescherming voor de weken erna.',
    geven: 'Meestal een tablet bij een klein beetje eten. Zit er nog een tablet in de verpakking voor later, schrijf de datum dan op de doos.',
    letop: 'Een dag wat slappe ontlasting kan. Blijft het dier suf of blijft het braken, dan bellen.',
    ritme: 'Hoe vaak nodig is, hangt af van jagen, buiten komen en kinderen in huis. Vraag het schema aan je dierenarts.'
  },
  {
    id: 'vlo-teek', naam: 'Vlooien en teken', emoji: '🦟',
    namen: ['frontline', 'advantage', 'advantix', 'bravecto', 'seresto', 'simparica', 'nexgard', 'stronghold', 'fipronil', 'selamectine', 'vlooien', 'teken', 'spot-on', 'pipet'],
    wat: 'Een pipet in de nek, een tablet of een band die vlooien en teken doodt of afweert.',
    geven: 'Pipet: vacht opzij duwen tot je de huid ziet, hoog in de nek waar hij niet bij kan likken. Tablet: bij een maaltijd.',
    letop: 'Twee dagen niet wassen of zwemmen na een pipet. Gebruik bij een kat nóóit een hondenmiddel: middelen met permethrine zijn dodelijk voor katten.',
    ritme: 'Behandel bij vlooien ook het huis: manden en dekens op 60 graden, en stofzuigen (zak meteen weggooien).'
  },
  {
    id: 'antibiotica', naam: 'Antibiotica', emoji: '🦠',
    namen: ['synulox', 'clavaseptin', 'amoxi', 'amoxicilline', 'clavulaan', 'doxycycline', 'metronidazol', 'baytril', 'enrofloxacine', 'antibiotic'],
    wat: 'Middel tegen een bacterie. Werkt niet tegen virussen, dus niet tegen "gewoon een verkoudheid".',
    geven: 'Op vaste tijden, en de kuur helemaal afmaken — ook als het dier zich na drie dagen alweer prima voelt.',
    letop: 'Slappe ontlasting komt vaak voor. Stoppen doe je nooit op eigen houtje; overleg eerst.',
    ritme: 'Zet een alarm op je telefoon voor elke gift; op tijd is bij antibiotica echt belangrijk.'
  },
  {
    id: 'pijnstiller', naam: 'Pijnstiller / ontstekingsremmer', emoji: '💊',
    namen: ['metacam', 'meloxicam', 'meloxidyl', 'rimadyl', 'carprofen', 'onsior', 'robenacoxib', 'previcox', 'firocoxib', 'loxicom', 'pijnstill', 'nsaid'],
    wat: 'Dempt pijn en ontsteking, bijvoorbeeld na een operatie of bij stijve gewrichten.',
    geven: 'Áltijd bij of vlak na het eten — op een lege maag geeft het maagklachten. Vloeistof afmeten met het bijgeleverde spuitje, niet met een lepel.',
    letop: 'Braken, zwarte ontlasting, niet meer willen eten of veel drinken: stoppen en bellen. Nooit twee ontstekingsremmers door elkaar.',
    ritme: 'Geef nooit paracetamol, ibuprofen of aspirine uit je eigen kastje. Voor katten is paracetamol dodelijk.'
  },
  {
    id: 'corticoiden', naam: 'Ontstekingsremmer met hormoon', emoji: '🌡️',
    namen: ['prednisolon', 'prednison', 'dexamethason', 'corticost', 'apoquel', 'oclacitinib', 'cytopoint'],
    wat: 'Zet een overactief afweersysteem zachter, bijvoorbeeld bij hevige jeuk of allergie.',
    geven: 'Bij het eten, en op het tijdstip dat je dierenarts noemt.',
    letop: 'Meer drinken, meer plassen en meer honger zijn bekende bijwerkingen. Nooit ineens stoppen: afbouwen gaat volgens schema.',
    ritme: 'Houd bij hoeveel je dier drinkt; dat is het makkelijkste cijfer om mee terug te komen.'
  },
  {
    id: 'oor', naam: 'Oordruppels', emoji: '👂',
    namen: ['oordruppel', 'otitis', 'surolan', 'easotic', 'canaural', 'osurnia', 'oorreiniger'],
    wat: 'Druppels tegen een ontsteking in de gehoorgang, vaak door gist of bacteriën.',
    geven: 'Til de oorschelp op, druppel in de gehoorgang, en masseer 20 seconden onderaan het oor — je hoort dan een soppend geluid. Daarna mag hij schudden.',
    letop: 'Blijft het rood, stinken of pijnlijk, dan is er iets anders aan de hand. Nooit een wattenstaafje naar binnen.',
    ritme: 'Maak het oor eerst schoon met de reiniger als je dierenarts die erbij gaf, en wacht dan een paar minuten.'
  },
  {
    id: 'oog', naam: 'Oogdruppels of oogzalf', emoji: '👁️',
    namen: ['oogdruppel', 'oogzalf', 'tobramycine', 'chlooramfenicol', 'ocry', 'traanvocht', 'conjunctivitis'],
    wat: 'Druppels of zalf tegen een ontstoken of geïrriteerd oog.',
    geven: 'Kom van achteren of van de zijkant, niet frontaal. Trek het onderooglid iets naar beneden en druppel in de rand — raak het oog niet aan met het tuitje.',
    letop: 'Knijpt het oog dicht, is het troebel of houdt hij het stijf dicht? Datzelfde dag laten kijken; een beschadigd hoornvlies gaat snel.',
    ritme: 'Eerst druppels, dan pas zalf, met vijf minuten ertussen.'
  },
  {
    id: 'maag', naam: 'Maag en misselijkheid', emoji: '🤢',
    namen: ['cerenia', 'maropitant', 'omeprazol', 'antepsin', 'sucralfaat', 'famotidine', 'ranitidine', 'misselijk', 'braken'],
    wat: 'Kalmeert de maag of houdt braken tegen, bijvoorbeeld bij een buikgriepje of autoziekte.',
    geven: 'Sommige juist op een lege maag, andere juist bij het eten — lees het etiket, dit verschilt echt per middel.',
    letop: 'Braken met bloed, een bolle pijnlijke buik of een hond die probeert te braken zonder resultaat: direct bellen, dat kan spoed zijn.',
    ritme: 'Houd bij hoe vaak hij braakt en hoe het eruitziet; dat helpt de dierenarts meer dan "hij was misselijk".'
  },
  {
    id: 'hart', naam: 'Hartmedicatie', emoji: '❤️',
    namen: ['vetmedin', 'pimobendan', 'fortekor', 'benazepril', 'furosemide', 'dimazon', 'spironolacton', 'hartfalen'],
    wat: 'Helpt een hart dat het zwaar heeft beter pompen, of haalt vocht weg dat zich ophoopt.',
    geven: 'Op vaste tijden, meestal elke dag levenslang. Sommige middelen juist een uur vóór het eten.',
    letop: 'Tel thuis eens per week de ademhaling terwijl hij slaapt: het aantal keer dat de borstkas omhoog gaat in een minuut. Loopt dat op, bel dan.',
    ritme: 'Een dier aan plaspillen moet altijd bij water kunnen.'
  },
  {
    id: 'schildklier', naam: 'Schildklier (kat)', emoji: '⚖️',
    namen: ['felimazole', 'thiamazol', 'methimazol', 'vidalta', 'schildklier', 'hyperthyreo'],
    wat: 'Remt een schildklier die te hard werkt — een veelvoorkomende reden waarom oudere katten mager worden maar veel eten.',
    geven: 'Elke dag op hetzelfde tijdstip. Was je handen na het aanpakken van de tablet.',
    letop: 'Gezicht krabben, braken of suf worden in de eerste weken: melden.',
    ritme: 'Na het instellen hoort er periodiek bloedcontrole bij. Zet die afspraak meteen in je agenda.'
  },
  {
    id: 'kalmerend', naam: 'Rust en stress', emoji: '🌙',
    namen: ['zylkene', 'adaptil', 'feliway', 'trazodon', 'gabapentine', 'sileo', 'vuurwerk', 'angst', 'stress'],
    wat: 'Middelen of geurverdampers die spanning verminderen, bijvoorbeeld rond vuurwerk, verhuizen of een bezoek aan de kliniek.',
    geven: 'Verdampers zet je dágen van tevoren aan. Tabletten hebben vaak ook een aanlooptijd — begin dus op tijd, niet pas op oudjaar.',
    letop: 'Sloom of juist onrustig worden komt voor. Bespreek altijd eerst wat er precies gebeurt: de aanpak van geluidsangst is meer dan een pilletje.',
    ritme: 'Combineer met een veilig hol: bench met een deken erover, gordijnen dicht, muziek zachtjes aan.'
  }
];

// Hoe je het praktisch voor elkaar krijgt.
export const HOE_GEVEN = {
  hond: [
    'Verstop de tablet in iets plakkerigs: een klein balletje leverworst, kaas of natvoer. Geef eerst een leeg hapje, dan die met de pil, dan meteen weer een leeg hapje.',
    'Lukt dat niet: zit of sta naast hem, til de snuit iets omhoog, leg de tablet zo ver mogelijk achterop de tong, sluit de bek en aai over de keel tot hij slikt.',
    'Geef daarna een slokje water of nat voer, zodat de tablet niet in de slokdarm blijft plakken.',
    'Bij vloeistof: het spuitje in de wangzak, tussen de kiezen en de wang, en langzaam legen. Niet recht in de keel spuiten.'
  ],
  kat: [
    'Probeer het eerst in natvoer of in een lege "pillenpocket". Katten proeven scherp: gebruik een sterk ruikend hapje.',
    'Lukt dat niet: zet de kat op een handdoek met zijn billen tegen je buik of in een hoek, zodat hij niet achteruit kan.',
    'Til het hoofd zachtjes omhoog tot de neus naar het plafond wijst; dan gaat de onderkaak vanzelf iets open. Leg de tablet achterop de tong of gebruik een pillengever.',
    'Altijd een halve theelepel water of nat voer erachteraan — bij katten kan een tablet anders in de slokdarm blijven steken.',
    'Rol de kat bij verzet los in een handdoek ("kattenburrito") met alleen het hoofd vrij. Rustig en snel is vriendelijker dan lang aanmodderen.'
  ]
};

export const NOOIT = [
  { t: 'Paracetamol', d: 'Voor katten dodelijk, ook een klein stukje. Voor honden alleen als de dierenarts het uitdrukkelijk voorschrijft.' },
  { t: 'Ibuprofen en aspirine', d: 'Geven maagzweren en nierschade bij hond én kat.' },
  { t: 'Medicijnen van een ander dier', d: 'De dosis hoort bij dát gewicht en die diersoort. Restjes van de vorige hond zijn geen oplossing.' },
  { t: 'Hondenmiddel op een kat', d: 'Vlooienmiddelen met permethrine zijn dodelijk voor katten. Lees altijd voor welke diersoort het bedoeld is.' }
];

export function zoekMedicijn(term) {
  const t = term.trim().toLowerCase();
  if (t.length < 2) return null;
  const treffer = SOORTEN.find((s) => s.namen.some((n) => t.includes(n) || n.includes(t)));
  return treffer || null;
}
