// Rassen: de kenmerken waarop de rasgokker matcht, en de dingen waar je bij
// dit ras op let. Alles staat lokaal in de app; er gaat geen vraag naar buiten.
//
// grootte:  mini | klein | middel | groot | reus
// vacht:    kort | middel | lang | krullend | ruw
// oren:     staand | hang | halfstaand
// snuit:    kort | normaal | lang        (kort = brachycefaal: let op ademhaling)
// energie:  1 rustig … 3 altijd aan
// borstel:  1 om de week … 3 elke dag

export const RASSEN = [
  // --- HONDEN ---------------------------------------------------------------
  { id: 'labrador', naam: 'Labrador Retriever', soort: 'hond', grootte: 'groot', gewicht: [25, 36],
    vacht: 'kort', oren: 'hang', snuit: 'normaal', energie: 3, borstel: 2, leeftijdsverwachting: [11, 13],
    kenmerken: ['dikke otterstaart', 'zwemvliezen tussen de tenen', 'altijd trek'],
    letop: ['wordt snel te zwaar', 'heupen en ellebogen', 'oorontsteking door hangoren'],
    tip: 'Weeg het voer af met een weegschaal. Een labrador kijkt je altijd aan alsof hij niets gehad heeft.' },

  { id: 'golden', naam: 'Golden Retriever', soort: 'hond', grootte: 'groot', gewicht: [25, 34],
    vacht: 'middel', oren: 'hang', snuit: 'normaal', energie: 3, borstel: 3, leeftijdsverwachting: [10, 12],
    kenmerken: ['gouden veren aan poten en staart', 'zachte bek', 'wil iets dragen'],
    letop: ['veel haarverlies', 'heupen', 'huid onder de dikke vacht'],
    tip: 'Borstel elke dag even de "broek" en achter de oren; daar zit de klit als eerste.' },

  { id: 'duitseherder', naam: 'Duitse Herder', soort: 'hond', grootte: 'groot', gewicht: [22, 40],
    vacht: 'middel', oren: 'staand', snuit: 'lang', energie: 3, borstel: 3, leeftijdsverwachting: [9, 13],
    kenmerken: ['grote staande oren', 'aflopende rug', 'let overal op'],
    letop: ['heupdysplasie', 'gevoelige darmen', 'verveelt zich snel'],
    tip: 'Deze hond wordt moe van dénken, niet van rennen. Tien minuten zoekwerk doet meer dan een uur bal.' },

  { id: 'chihuahua', naam: 'Chihuahua', soort: 'hond', grootte: 'mini', gewicht: [1, 3],
    vacht: 'kort', oren: 'staand', snuit: 'normaal', energie: 2, borstel: 1, leeftijdsverwachting: [12, 18],
    kenmerken: ['appelrond kopje', 'grote ogen', 'past in een jaszak'],
    letop: ['tandsteen', 'knieschijfjes die schieten', 'heeft het snel koud'],
    tip: 'Poets de tandjes. Kleine honden krijgen het snelst gebitsproblemen.' },

  { id: 'franse-bulldog', naam: 'Franse Bulldog', soort: 'hond', grootte: 'klein', gewicht: [8, 14],
    vacht: 'kort', oren: 'staand', snuit: 'kort', energie: 2, borstel: 1, leeftijdsverwachting: [10, 12],
    kenmerken: ['vleermuisoren', 'platte snuit', 'rimpels in het gezicht'],
    letop: ['ademhaling bij warmte', 'huidplooien', 'rug'],
    tip: 'Boven de 20 °C: wandelen in de ochtend en de avond. Een platte snuit koelt slecht.' },

  { id: 'mopshond', naam: 'Mopshond', soort: 'hond', grootte: 'klein', gewicht: [6, 9],
    vacht: 'kort', oren: 'hang', snuit: 'kort', energie: 1, borstel: 2, leeftijdsverwachting: [12, 15],
    kenmerken: ['krulstaart', 'rimpels', 'snurkt'],
    letop: ['warmte', 'ogen', 'te zwaar worden'],
    tip: 'Maak de plooi in het gezicht droog na het eten; vocht in de plooi geeft ontsteking.' },

  { id: 'jackrussell', naam: 'Jack Russell Terriër', soort: 'hond', grootte: 'klein', gewicht: [6, 8],
    vacht: 'ruw', oren: 'halfstaand', snuit: 'normaal', energie: 3, borstel: 1, leeftijdsverwachting: [13, 16],
    kenmerken: ['wit met bruine of zwarte vlekken', 'stevig, klein en snel', 'graaft'],
    letop: ['verveling geeft blaffen en slopen', 'ogen', 'knieën'],
    tip: 'Geef hem werk: een graafbak of een snuffelmat in plaats van de tuin.' },

  { id: 'border-collie', naam: 'Border Collie', soort: 'hond', grootte: 'middel', gewicht: [14, 20],
    vacht: 'middel', oren: 'halfstaand', snuit: 'lang', energie: 3, borstel: 2, leeftijdsverwachting: [12, 15],
    kenmerken: ['intense blik', 'wit befje', 'wil altijd een taak'],
    letop: ['nooit uit kunnen staan', 'heupen', 'ogen'],
    tip: 'Leer hem ook rust: een kluif op een kleed is net zo belangrijk als de training.' },

  { id: 'teckel', naam: 'Teckel', soort: 'hond', grootte: 'klein', gewicht: [4, 9],
    vacht: 'kort', oren: 'hang', snuit: 'lang', energie: 2, borstel: 1, leeftijdsverwachting: [12, 16],
    kenmerken: ['lange rug, korte pootjes', 'grote hangoren', 'stevige stem'],
    letop: ['rug (hernia)', 'overgewicht drukt op de rug', 'oren'],
    tip: 'Til hem met twee handen: één onder de borst, één onder de billen. Trappen liever niet.' },

  { id: 'beagle', naam: 'Beagle', soort: 'hond', grootte: 'middel', gewicht: [9, 14],
    vacht: 'kort', oren: 'hang', snuit: 'normaal', energie: 3, borstel: 1, leeftijdsverwachting: [12, 15],
    kenmerken: ['tricolor', 'lange zachte oren', 'neus aan de grond'],
    letop: ['loopt weg achter een geur', 'te zwaar', 'oren'],
    tip: 'Zijn neus is zijn hobby. Verstop het voer in de tuin: een half uur snuffelen = een moe hondje.' },

  { id: 'cocker', naam: 'Cocker Spaniël', soort: 'hond', grootte: 'middel', gewicht: [12, 15],
    vacht: 'lang', oren: 'hang', snuit: 'normaal', energie: 2, borstel: 3, leeftijdsverwachting: [12, 15],
    kenmerken: ['lange golvende oren', 'zijdezachte vacht', 'kwispelt met alles'],
    letop: ['oorontsteking', 'klitten', 'ogen'],
    tip: 'Kijk elke week in de oren. Lange oren houden warmte en vocht vast.' },

  { id: 'shih-tzu', naam: 'Shih Tzu', soort: 'hond', grootte: 'klein', gewicht: [4, 8],
    vacht: 'lang', oren: 'hang', snuit: 'kort', energie: 1, borstel: 3, leeftijdsverwachting: [10, 16],
    kenmerken: ['lange vacht tot op de grond', 'platte snuit', 'staart over de rug'],
    letop: ['ogen', 'warmte', 'klitten achter de oren'],
    tip: 'Een kort "puppy trim"-kapsel scheelt elke dag een kwartier borstelen.' },

  { id: 'poedel', naam: 'Poedel', soort: 'hond', grootte: 'middel', gewicht: [3, 25],
    vacht: 'krullend', oren: 'hang', snuit: 'lang', energie: 2, borstel: 3, leeftijdsverwachting: [12, 15],
    kenmerken: ['krullen die niet uitvallen', 'veert bij het lopen', 'leert snel'],
    letop: ['klitten tot op de huid', 'oren', 'trimmen om de 6-8 weken'],
    tip: 'Krullen vallen niet uit maar klitten wél. Borstel tot op de huid, niet alleen de bovenkant.' },

  { id: 'labradoodle', naam: 'Labradoodle / Doodle', soort: 'hond', grootte: 'groot', gewicht: [15, 30],
    vacht: 'krullend', oren: 'hang', snuit: 'normaal', energie: 3, borstel: 3, leeftijdsverwachting: [12, 14],
    kenmerken: ['wollige krul', 'vrolijk en aanhankelijk', 'twee rassen in één'],
    letop: ['klitten', 'oren', 'heupen'],
    tip: 'Twee rassen betekent twee soorten onderhoud. Ga uit van de meest bewerkelijke vacht.' },

  { id: 'staffordshire', naam: 'Staffordshire Terriër', soort: 'hond', grootte: 'middel', gewicht: [11, 17],
    vacht: 'kort', oren: 'halfstaand', snuit: 'normaal', energie: 3, borstel: 1, leeftijdsverwachting: [12, 14],
    kenmerken: ['brede kop', 'gespierd', 'grote glimlach'],
    letop: ['huid en allergie', 'warmte', 'gewrichten'],
    tip: 'Korte vacht, gevoelige huid: spoel na het strand het zout eruit.' },

  { id: 'husky', naam: 'Siberische Husky', soort: 'hond', grootte: 'groot', gewicht: [16, 27],
    vacht: 'middel', oren: 'staand', snuit: 'normaal', energie: 3, borstel: 3, leeftijdsverwachting: [12, 14],
    kenmerken: ['dikke onderwol', 'lichte ogen', 'praat terug'],
    letop: ['hitte', 'ontsnapt uit elke tuin', 'twee keer per jaar verharen'],
    tip: 'Nooit scheren: de onderwol houdt in de zomer júist de hitte tegen.' },

  { id: 'maltezer', naam: 'Maltezer', soort: 'hond', grootte: 'mini', gewicht: [2, 4],
    vacht: 'lang', oren: 'hang', snuit: 'normaal', energie: 2, borstel: 3, leeftijdsverwachting: [12, 15],
    kenmerken: ['witte lange vacht', 'donkere kraaloogjes', 'licht als een veertje'],
    letop: ['traanstrepen', 'gebit', 'knieën'],
    tip: 'Veeg de ooghoeken elke dag met lauw water; dat houdt de bruine streep weg.' },

  { id: 'kruising-hond', naam: 'Unieke kruising', soort: 'hond', grootte: 'middel', gewicht: [5, 30],
    vacht: 'kort', oren: 'halfstaand', snuit: 'normaal', energie: 2, borstel: 2, leeftijdsverwachting: [12, 15],
    kenmerken: ['helemaal van jou', 'onnavolgbaar mengsel'],
    letop: ['kijk naar wat je ziet, niet naar de stamboom'],
    tip: 'Kruisingen zijn gemiddeld robuust. Ga af op wat je hond je laat zien: energie, vacht en gewicht.' },

  // --- KATTEN ---------------------------------------------------------------
  { id: 'europese-korthaar', naam: 'Europese Korthaar (huiskat)', soort: 'kat', grootte: 'middel', gewicht: [3.5, 5.5],
    vacht: 'kort', oren: 'staand', snuit: 'normaal', energie: 2, borstel: 1, leeftijdsverwachting: [13, 18],
    kenmerken: ['alle kleuren mogelijk', 'stevig en gezond', 'goede jager'],
    letop: ['te zwaar bij binnenleven', 'gebit', 'nieren op leeftijd'],
    tip: 'De meest voorkomende kat van Nederland, en meteen de sterkste. Spelen houdt hem slank.' },

  { id: 'maine-coon', naam: 'Maine Coon', soort: 'kat', grootte: 'groot', gewicht: [5, 9],
    vacht: 'lang', oren: 'staand', snuit: 'normaal', energie: 2, borstel: 3, leeftijdsverwachting: [10, 14],
    kenmerken: ['pluimstaart', 'plukjes op de oren', 'praat met trillers'],
    letop: ['hartspierziekte (HCM)', 'klitten in de broek', 'heupen'],
    tip: 'Groeit door tot zijn vierde. Laat het hart bij de dierenarts nakijken.' },

  { id: 'brits-korthaar', naam: 'Brits Korthaar', soort: 'kat', grootte: 'middel', gewicht: [4, 8],
    vacht: 'kort', oren: 'staand', snuit: 'normaal', energie: 1, borstel: 2, leeftijdsverwachting: [12, 17],
    kenmerken: ['rond hoofd', 'pluche vacht', 'rustig karakter'],
    letop: ['overgewicht', 'HCM', 'houdt niet van optillen'],
    tip: 'Rustige kat = snel te dik. Voer op tijden, niet de hele dag een volle bak.' },

  { id: 'ragdoll', naam: 'Ragdoll', soort: 'kat', grootte: 'groot', gewicht: [4, 9],
    vacht: 'lang', oren: 'staand', snuit: 'normaal', energie: 1, borstel: 3, leeftijdsverwachting: [12, 15],
    kenmerken: ['blauwe ogen', 'points aan snuit en poten', 'wordt slap in je armen'],
    letop: ['HCM', 'klitten', 'echte binnenkat'],
    tip: 'Zo mak dat hij gevaar niet ontloopt. Buiten alleen in een veilige tuin.' },

  { id: 'perzisch', naam: 'Pers', soort: 'kat', grootte: 'middel', gewicht: [3, 6],
    vacht: 'lang', oren: 'staand', snuit: 'kort', energie: 1, borstel: 3, leeftijdsverwachting: [12, 17],
    kenmerken: ['platte snuit', 'lange dikke vacht', 'zachte stem'],
    letop: ['traanogen', 'ademhaling', 'klitten — elke dag borstelen'],
    tip: 'Elke dag borstelen én de ogen deppen. Zonder dat wordt de vacht binnen een week één klit.' },

  { id: 'siamees', naam: 'Siamees', soort: 'kat', grootte: 'middel', gewicht: [3, 5],
    vacht: 'kort', oren: 'staand', snuit: 'lang', energie: 3, borstel: 1, leeftijdsverwachting: [12, 20],
    kenmerken: ['blauwe ogen', 'donkere points', 'praat de hele dag'],
    letop: ['verveling', 'gebit', 'gevoelig voor kou'],
    tip: 'Praat terug. Een siamees die genegeerd wordt, gaat harder praten.' },

  { id: 'bengaal', naam: 'Bengaal', soort: 'kat', grootte: 'middel', gewicht: [4, 7],
    vacht: 'kort', oren: 'staand', snuit: 'normaal', energie: 3, borstel: 1, leeftijdsverwachting: [12, 16],
    kenmerken: ['rozetten als een luipaard', 'glanzende vacht', 'houdt van water'],
    letop: ['heeft veel te doen nodig', 'darmen', 'ontsnapt graag'],
    tip: 'Hang planken aan de muur. Een bengaal wil omhoog, niet vooruit.' },

  { id: 'sphynx', naam: 'Sphynx', soort: 'kat', grootte: 'middel', gewicht: [3, 5],
    vacht: 'kaal', oren: 'staand', snuit: 'normaal', energie: 3, borstel: 1, leeftijdsverwachting: [9, 15],
    kenmerken: ['kaal en warm', 'grote oren', 'plakt tegen je aan'],
    letop: ['huidvet — wekelijks wassen', 'kou', 'zonnebrand', 'HCM'],
    tip: 'Geen vacht betekent geen bescherming: warme plek binnen, nooit lang in de volle zon.' },

  { id: 'noorse-boskat', naam: 'Noorse Boskat', soort: 'kat', grootte: 'groot', gewicht: [4, 9],
    vacht: 'lang', oren: 'staand', snuit: 'normaal', energie: 2, borstel: 2, leeftijdsverwachting: [12, 16],
    kenmerken: ['waterafstotende vacht', 'dikke kraag', 'klimt als een eekhoorn'],
    letop: ['verharen in het voorjaar', 'heupen', 'hart'],
    tip: 'De vacht ontklit zichzelf grotendeels; help in maart en april extra mee.' },

  { id: 'kruising-kat', naam: 'Unieke kruising', soort: 'kat', grootte: 'middel', gewicht: [3, 6],
    vacht: 'kort', oren: 'staand', snuit: 'normaal', energie: 2, borstel: 1, leeftijdsverwachting: [13, 18],
    kenmerken: ['helemaal van jou', 'onnavolgbaar mengsel'],
    letop: ['kijk naar wat je ziet, niet naar de stamboom'],
    tip: 'De gewone huiskat is de gezondste kat die er is. Spelen en niet te veel voer, dan komt het goed.' }
];

export const rasById = (id) => RASSEN.find((r) => r.id === id) || null;
export const rassenVoor = (soort) => RASSEN.filter((r) => r.soort === soort);
