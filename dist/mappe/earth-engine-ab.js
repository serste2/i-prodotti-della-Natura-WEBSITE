/**
 * i prodotti della Natura
 * Evidenze satellitari 2019-oggi: umidita, copertura, resilienza, LST
 *
 * Google Earth Engine Code Editor (JavaScript).
 * Incollare l'intero file in https://code.earthengine.google.com/
 *
 * IMPORT OPZIONALE MA RACCOMANDATO
 * --------------------------------
 * Il perimetro aziendale usato in ogni calcolo e il contorno ARTEA esterno
 * della prima pagina del PCG 2026. Non viene sostituito da buffer o rettangoli.
 *
 * Importare/disegnare, se disponibili, una FeatureCollection `superfici` con:
 *   - gruppo = "confronto" per appezzamenti circostanti realmente verificati;
 *   - nome = etichetta del poligono.
 *
 * Se `superfici` non esiste, il confronto usa un anello territoriale di
 * contesto. L'interfaccia lo dichiara esplicitamente: non viene attribuita
 * a quell'area una gestione agricola convenzionale.
 *
 * INTERPRETAZIONE
 * ---------------
 * NDMI = proxy spettrale dell'umidita della vegetazione/superficie.
 * Non misura direttamente acqua nel suolo, infiltrazione o runoff.
 * NDVI e Dynamic World = attivita/probabilita di copertura vegetale.
 * LST Landsat = temperatura radiometrica superficiale, non temperatura aria.
 * NBR recovery = recupero spettrale rispetto all'impatto 2024.
 * Le differenze osservate non dimostrano da sole causalita gestionale.
 */

// ============================================================================
// 1. CONFIGURAZIONE
// ============================================================================

var CFG = {
  firstYear: 2019,
  lastYear: 2026,
  today: '2026-10-10',

  // Stessa finestra fenologica per ogni anno.
  seasonStartMonth: 4,
  seasonStartDay: 1,
  seasonEndMonth: 10,
  seasonEndDay: 11, // fine esclusa: include il 10 ottobre

  cloudScoreMin: 0.60,
  landsatCloudDistanceKm: 1.0,

  // Usato soltanto se non esistono poligoni gruppo="confronto".
  contextOuterBufferM: 650,
  contextInnerBufferM: 80,

  // Asset alternativo a un import Code Editor chiamato superfici.
  superficiAsset: ''
};

// Lista client-side usata dai selettori A/B.
var YEAR_VALUES = [];
for (var y = CFG.firstYear; y <= CFG.lastYear; y++) {
  YEAR_VALUES.push(y);
}

// ============================================================================
// 2. PERIMETRO ARTEA 2026 - CONTORNO ESTERNO DELLA PAGINA 1
// ============================================================================

var perimetroArtea = ee.Geometry.Polygon([[
  [11.411338806, 42.780197144],
  [11.410050392, 42.778209686],
  [11.409753799, 42.777603149],
  [11.411003113, 42.777713776],
  [11.411452293, 42.777896881],
  [11.412084579, 42.778011322],
  [11.412475586, 42.777832031],
  [11.412908554, 42.777378082],
  [11.413176537, 42.777271271],
  [11.413589478, 42.777359009],
  [11.413753510, 42.777259827],
  [11.413743019, 42.777381897],
  [11.413978577, 42.777423859],
  [11.415517807, 42.777187347],
  [11.415641785, 42.777076721],
  [11.415846825, 42.777172089],
  [11.416303635, 42.777107239],
  [11.417672157, 42.776527405],
  [11.418298721, 42.776023865],
  [11.418268204, 42.775928497],
  [11.418370247, 42.776023865],
  [11.418953896, 42.776123047],
  [11.419011116, 42.776481628],
  [11.419145584, 42.776653290],
  [11.419154167, 42.777065277],
  [11.418806076, 42.777488708],
  [11.418201447, 42.778671265],
  [11.417822838, 42.779106140],
  [11.416882515, 42.780590057],
  [11.416456223, 42.780647278],
  [11.416162491, 42.780788422],
  [11.414289474, 42.780799866],
  [11.413704872, 42.781318665],
  [11.413500786, 42.781269073],
  [11.413290024, 42.781360626],
  [11.412779808, 42.781055450],
  [11.412706375, 42.780895233],
  [11.412409782, 42.780693054],
  [11.412123680, 42.780620575],
  [11.411733627, 42.780330658],
  [11.411338806, 42.780197144]
]]);

var importedSurfaces = null;
var hasImportedSurfaces = false;

if (CFG.superficiAsset) {
  importedSurfaces = ee.FeatureCollection(CFG.superficiAsset);
  hasImportedSurfaces = true;
} else if (typeof superfici !== 'undefined') {
  importedSurfaces = ee.FeatureCollection(superfici);
  hasImportedSurfaces = true;
}

// Geometria aziendale canonica per clip, statistiche e serie temporali.
var companyGeometry = perimetroArtea;
var comparisonGeometry;
var comparisonLabel;

if (hasImportedSurfaces) {
  var importedCompany = importedSurfaces.filter(
    ee.Filter.eq('gruppo', 'azienda')
  );
  var importedComparison = importedSurfaces.filter(
    ee.Filter.eq('gruppo', 'confronto')
  );

  // Il contorno ARTEA resta la geometria aziendale di riferimento.
  // I poligoni importati gruppo=confronto alimentano il confronto.
  comparisonGeometry = importedComparison.geometry();
  comparisonLabel = 'Plot circostanti verificati';
} else {
  comparisonGeometry = perimetroArtea
    .buffer(CFG.contextOuterBufferM)
    .difference(
      perimetroArtea.buffer(CFG.contextInnerBufferM),
      1
    );
  comparisonLabel = 'Contesto circostante (non classificato)';
}

var regions = ee.FeatureCollection([
  ee.Feature(companyGeometry, {
    nome: 'Azienda',
    gruppo: 'azienda'
  }),
  ee.Feature(comparisonGeometry, {
    nome: comparisonLabel,
    gruppo: 'confronto'
  })
]);

var mapRegion = companyGeometry.buffer(CFG.contextOuterBufferM);

// ============================================================================
// 3. DATE OMOGENEE PER ANNO
// ============================================================================

function seasonStart(year) {
  return ee.Date.fromYMD(
    year,
    CFG.seasonStartMonth,
    CFG.seasonStartDay
  );
}

function seasonEnd(year) {
  var nominal = ee.Date.fromYMD(
    year,
    CFG.seasonEndMonth,
    CFG.seasonEndDay
  );

  if (year === CFG.lastYear) {
    return ee.Date(CFG.today).advance(1, 'day');
  }

  return nominal;
}

// ============================================================================
// 4. SENTINEL-2 SR + CLOUD SCORE+
// ============================================================================

var s2Raw = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(mapRegion)
  .filterDate(
    seasonStart(CFG.firstYear),
    seasonEnd(CFG.lastYear)
  )
  .linkCollection(
    ee.ImageCollection(
      'GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED'
    ),
    ['cs_cdf']
  );

function prepareS2(img) {
  var scl = img.select('SCL');

  var sclClear = scl.neq(1)
    .and(scl.neq(3))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  var clear = img.select('cs_cdf')
    .gte(CFG.cloudScoreMin)
    .and(sclClear);

  var sr = img.select([
    'B2', 'B3', 'B4', 'B8', 'B11', 'B12'
  ]).multiply(0.0001);

  var ndvi = sr.normalizedDifference(['B8', 'B4'])
    .rename('NDVI');

  var ndmi = sr.normalizedDifference(['B8', 'B11'])
    .rename('NDMI');

  var nbr = sr.normalizedDifference(['B8', 'B12'])
    .rename('NBR');

  var mndwi = sr.normalizedDifference(['B3', 'B11'])
    .rename('MNDWI');

  return sr
    .addBands([ndvi, ndmi, nbr, mndwi])
    .updateMask(clear)
    .copyProperties(img, ['system:time_start', 'system:index']);
}

var s2 = s2Raw.map(prepareS2);

// ============================================================================
// 5. DYNAMIC WORLD: PROBABILITA DI COPERTURA VEGETALE
// ============================================================================

var dw = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
  .filterBounds(mapRegion)
  .filterDate(
    seasonStart(CFG.firstYear),
    seasonEnd(CFG.lastYear)
  )
  .map(function(img) {
    var vegetation = img.select([
      'trees',
      'grass',
      'flooded_vegetation',
      'crops',
      'shrub_and_scrub'
    ]).reduce(ee.Reducer.sum()).rename('VEG_PROB');

    return vegetation.copyProperties(
      img,
      ['system:time_start', 'system:index']
    );
  });

// ============================================================================
// 6. LANDSAT 8/9 LEVEL 2: TEMPERATURA SUPERFICIALE
// ============================================================================

function prepareLandsat(img) {
  var qa = img.select('QA_PIXEL');

  // Fill, dilated cloud, cirrus, cloud, cloud shadow, snow.
  var qaClear = qa.bitwiseAnd(63).eq(0)
    .and(img.select('QA_RADSAT').eq(0));

  var farFromCloud = img.select('ST_CDIST')
    .multiply(0.01)
    .gte(CFG.landsatCloudDistanceKm);

  var lstC = img.select('ST_B10')
    .multiply(0.00341802)
    .add(149.0)
    .subtract(273.15)
    .rename('LST_C');

  return lstC
    .updateMask(qaClear.and(farFromCloud))
    .copyProperties(img, [
      'system:time_start',
      'system:index',
      'SPACECRAFT_ID'
    ]);
}

var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2');
var landsat9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_L2');

var landsat = landsat8.merge(landsat9)
  .filterBounds(mapRegion)
  .filterDate(
    seasonStart(CFG.firstYear),
    seasonEnd(CFG.lastYear)
  )
  .filter(ee.Filter.eq('PROCESSING_LEVEL', 'L2SP'))
  .map(prepareLandsat);

// ============================================================================
// 7. CHIRPS: CONTROLLO DELLA PIOGGIA
// ============================================================================

var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY')
  .filterBounds(mapRegion)
  .filterDate(
    seasonStart(CFG.firstYear),
    seasonEnd(CFG.lastYear)
  )
  .select('precipitation');

// ============================================================================
// 8. COMPOSITI ANNUALI OMOGENEI
// ============================================================================

var years = ee.List.sequence(CFG.firstYear, CFG.lastYear);

function annualImage(yearValue) {
  var year = ee.Number(yearValue);
  var start = ee.Date.fromYMD(
    year,
    CFG.seasonStartMonth,
    CFG.seasonStartDay
  );

  var nominalEnd = ee.Date.fromYMD(
    year,
    CFG.seasonEndMonth,
    CFG.seasonEndDay
  );

  var end = ee.Date(ee.Algorithms.If(
    year.eq(CFG.lastYear),
    ee.Date(CFG.today).advance(1, 'day'),
    nominalEnd
  ));

  var s2Year = s2.filterDate(start, end);
  var dwYear = dw.filterDate(start, end);
  var lstYear = landsat.filterDate(start, end);

  var optical = s2Year.select([
    'B2', 'B3', 'B4', 'B8', 'B11', 'B12',
    'NDVI', 'NDMI', 'NBR', 'MNDWI'
  ]).median();

  var vegProbability = dwYear.select('VEG_PROB')
    .mean();

  var lst = lstYear.select('LST_C').median();

  var validS2 = s2Year.select('NDVI')
    .count()
    .rename('S2_VALID_COUNT');

  var validLst = lstYear.select('LST_C')
    .count()
    .rename('LST_VALID_COUNT');

  return optical
    .addBands(vegProbability)
    .addBands(lst)
    .addBands(validS2)
    .addBands(validLst)
    .set({
      year: year,
      start_date: start.format('YYYY-MM-dd'),
      end_date: end.advance(-1, 'day').format('YYYY-MM-dd'),
      s2_scenes: s2Year.size(),
      dw_scenes: dwYear.size(),
      landsat_scenes: lstYear.size(),
      'system:time_start': start.millis()
    });
}

var annual = ee.ImageCollection.fromImages(
  years.map(annualImage)
);

var firstImage = ee.Image(
  annual.filter(ee.Filter.eq('year', CFG.firstYear)).first()
);

var latestImage = ee.Image(
  annual.filter(ee.Filter.eq('year', CFG.lastYear)).first()
);

// ============================================================================
// 9. RECUPERO NBR DOPO L'INCENDIO 2024
// ============================================================================

var preFire = ee.Image(
  annual.filter(ee.Filter.eq('year', 2023)).first()
).select('NBR');

var impact2024 = ee.Image(
  annual.filter(ee.Filter.eq('year', 2024)).first()
).select('NBR');

var currentNBR = latestImage.select('NBR');

var nbrLoss = preFire.subtract(impact2024);

var nbrRecovery = currentNBR
  .subtract(impact2024)
  .divide(nbrLoss.abs().max(0.05))
  .rename('NBR_RECOVERY')
  .clamp(-1, 2);

// La stessa metrica viene calcolata per ogni anno, così il confronto
// 2019-oggi rimane visibile anche nella modalità resilienza.
var recoveryAnnual = annual.map(function(img) {
  return img.select('NBR')
    .subtract(impact2024)
    .divide(nbrLoss.abs().max(0.05))
    .rename('NBR_RECOVERY')
    .clamp(-1, 2)
    .copyProperties(img, [
      'year',
      'system:time_start',
      'start_date',
      'end_date'
    ]);
});

// ============================================================================
// 10. MODALITA DI VISUALIZZAZIONE
// ============================================================================

var MODES = {
  'Umidita vegetazione/superficie | NDMI': {
    band: 'NDMI',
    collection: annual.select('NDMI'),
    scale: 20,
    first: firstImage.select('NDMI'),
    latest: latestImage.select('NDMI'),
    vis: {
      min: -0.45,
      max: 0.55,
      palette: ['8c510a', 'dfc27d', 'f6e8c3', '80cdc1', '01665e']
    },
    diffVis: {
      min: -0.30,
      max: 0.30,
      palette: ['8c2d04', 'f6e8c3', 'ffffff', 'c7eae5', '01665e']
    },
    unit: 'indice',
    better: 'higher',
    note: 'NDMI: proxy spettrale dell’umidita della vegetazione/superficie; non misura direttamente acqua nel suolo o runoff.'
  },

  'Copertura e vigore | NDVI': {
    band: 'NDVI',
    collection: annual.select('NDVI'),
    scale: 10,
    first: firstImage.select('NDVI'),
    latest: latestImage.select('NDVI'),
    vis: {
      min: -0.10,
      max: 0.90,
      palette: ['8c510a', 'dfc27d', 'ffffcc', '78c679', '006837']
    },
    diffVis: {
      min: -0.30,
      max: 0.30,
      palette: ['a50026', 'f46d43', 'ffffff', '66bd63', '006837']
    },
    unit: 'indice',
    better: 'higher',
    note: 'NDVI: attivita e vigore vegetativo relativo; non equivale direttamente a biomassa o percentuale di copertura.'
  },

  'Probabilita di copertura vegetale | Dynamic World': {
    band: 'VEG_PROB',
    collection: annual.select('VEG_PROB'),
    scale: 10,
    first: firstImage.select('VEG_PROB'),
    latest: latestImage.select('VEG_PROB'),
    vis: {
      min: 0,
      max: 1,
      palette: ['6e3b16', 'e5c07b', 'b8de7a', '238b45', '005a32']
    },
    diffVis: {
      min: -0.30,
      max: 0.30,
      palette: ['a50026', 'f46d43', 'ffffff', '66bd63', '006837']
    },
    unit: 'probabilita',
    better: 'higher',
    note: 'Somma delle probabilita Dynamic World per alberi, erba, colture, arbusti e vegetazione allagata. E un output di modello.'
  },

  'Temperatura superficiale | Landsat LST': {
    band: 'LST_C',
    collection: annual.select('LST_C'),
    scale: 30,
    first: firstImage.select('LST_C'),
    latest: latestImage.select('LST_C'),
    vis: {
      min: 16,
      max: 44,
      palette: ['313695', '74add1', 'ffffbf', 'f46d43', 'a50026']
    },
    diffVis: {
      min: -6,
      max: 6,
      palette: ['313695', '74add1', 'ffffff', 'f46d43', 'a50026']
    },
    unit: '°C',
    better: 'lower',
    note: 'LST Landsat: temperatura radiometrica della superficie. Griglia 30 m; il sensore termico nativo e piu grossolano. Non e temperatura dell’aria.'
  },

  'Ricrescita e disturbo | NBR': {
    band: 'NBR',
    collection: annual.select('NBR'),
    scale: 20,
    first: firstImage.select('NBR'),
    latest: latestImage.select('NBR'),
    vis: {
      min: -0.35,
      max: 0.85,
      palette: ['7f0000', 'd7301f', 'fdbb84', 'ffffcc', '78c679', '006837']
    },
    diffVis: {
      min: -0.50,
      max: 0.50,
      palette: ['8c2d04', 'fdae6b', 'ffffff', 'a1d99b', '006d2c']
    },
    unit: 'indice',
    better: 'higher',
    note: 'NBR: indicatore di disturbo e ricrescita. Deve essere letto insieme a stagione, incendio e copertura.'
  },

  'Resilienza post-incendio | riferimento impatto 2024': {
    band: 'NBR_RECOVERY',
    collection: recoveryAnnual,
    scale: 20,
    first: impact2024,
    latest: nbrRecovery,
    vis: {
      min: -1,
      max: 2,
      palette: ['7f0000', 'd7301f', 'ffffbf', '78c679', '006837']
    },
    diffVis: null,
    unit: 'frazione',
    better: 'higher',
    note: 'Per ogni anno: (NBR anno−NBR 2024) / |NBR 2023−NBR 2024|. Il 2024 vale 0; 1 indica una distanza spettrale pari alla perdita osservata. Non e una misura completa della resilienza ecologica.'
  }
};

var MODE_NAMES = Object.keys(MODES);

// ============================================================================
// 11. INTERFACCIA
// ============================================================================

ui.root.clear();
ui.root.setLayout(ui.Panel.Layout.flow('horizontal'));

var panel = ui.Panel({
  style: {
    width: '410px',
    padding: '12px',
    backgroundColor: '#f5f0e4'
  }
});

var mapA = ui.Map();
var mapB = ui.Map();

mapA.setOptions('SATELLITE');
mapB.setOptions('SATELLITE');

// Le due metà sono sincronizzate e formano una sola vista con cursore A/B.
var mapLinker = ui.Map.Linker([mapA, mapB]);

var comparisonMap = ui.SplitPanel({
  firstPanel: mapA,
  secondPanel: mapB,
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

ui.root.add(panel);
ui.root.add(comparisonMap);

panel.add(ui.Label('i prodotti della Natura', {
  fontWeight: 'bold',
  fontSize: '20px',
  color: '#254c32'
}));

panel.add(ui.Label(
  'Acqua, copertura, resilienza e temperatura | 2019-oggi',
  {fontWeight: 'bold', fontSize: '13px'}
));

panel.add(ui.Label(
  'Confronto tra finestre stagionali omologhe: 1 aprile-10 ottobre. ' +
  'Scegli liberamente anno A e anno B tra il 2019 e il 2026, poi trascina ' +
  'il cursore centrale sulla singola mappa comparativa. Il 2026 e aggiornato ' +
  'al 10 ottobre.',
  {fontSize: '11px', color: '#555555'}
));

panel.add(ui.Label(
  'Bordo giallo: perimetro ARTEA esterno, pagina 1 del PCG 2026.',
  {
    fontSize: '11px',
    color: '#7a5a00',
    fontWeight: 'bold'
  }
));

var comparisonNotice = ui.Label(
  hasImportedSurfaces
    ? 'Confronto: poligoni importati con gruppo="confronto".'
    : 'Confronto provvisorio: anello territoriale circostante. Non e classificato come gestione convenzionale.',
  {
    fontSize: '11px',
    color: hasImportedSurfaces ? '#254c32' : '#8a3b12',
    fontWeight: 'bold'
  }
);

panel.add(comparisonNotice);

var status = ui.Label('Preparazione…', {
  color: '#7a4d00',
  fontWeight: 'bold'
});

panel.add(status);

var modeSelect = ui.Select({
  items: MODE_NAMES,
  value: 'Umidita vegetazione/superficie | NDMI',
  style: {stretch: 'horizontal'}
});

var yearItems = YEAR_VALUES.map(function(year) {
  return String(year);
});

var yearASelect = ui.Select({
  items: yearItems,
  value: String(CFG.firstYear),
  style: {stretch: 'horizontal'}
});

var yearBSelect = ui.Select({
  items: yearItems,
  value: String(CFG.lastYear),
  style: {stretch: 'horizontal'}
});

var differenceCheck = ui.Checkbox({
  label: 'Nel lato B mostra la differenza B−A',
  value: false
});

var validCountCheck = ui.Checkbox({
  label: 'Mostra conteggio osservazioni valide',
  value: false
});

panel.add(ui.Label('Indicatore'));
panel.add(modeSelect);
panel.add(ui.Label('Anno A | lato sinistro'));
panel.add(yearASelect);
panel.add(ui.Label('Anno B | lato destro'));
panel.add(yearBSelect);
panel.add(differenceCheck);
panel.add(validCountCheck);

var noteLabel = ui.Label('', {
  fontSize: '11px',
  color: '#4d4d4d'
});

var statsLabel = ui.Label('Calcolo statistiche…', {
  fontSize: '11px'
});

var evidenceLabel = ui.Label('', {
  fontSize: '11px',
  color: '#254c32',
  fontWeight: 'bold'
});

panel.add(noteLabel);
panel.add(statsLabel);
panel.add(evidenceLabel);

var redrawButton = ui.Button({
  label: 'Aggiorna mappe e grafici',
  style: {stretch: 'horizontal'}
});

panel.add(redrawButton);

var chartPanel = ui.Panel();
panel.add(chartPanel);

// ============================================================================
// 12. STILE DEI CONTORNI
// ============================================================================

var companyOutline = ee.FeatureCollection([
  ee.Feature(companyGeometry)
]).style({
  color: 'ffcf24',
  fillColor: '00000000',
  width: 3
});

var comparisonOutline = ee.FeatureCollection([
  ee.Feature(comparisonGeometry)
]).style({
  color: 'b388ff',
  fillColor: '00000000',
  width: 2
});

function addOutlines(map) {
  map.addLayer(
    comparisonOutline,
    {},
    comparisonLabel,
    true
  );

  map.addLayer(
    companyOutline,
    {},
    'Perimetro ARTEA 2026 | pagina 1',
    true
  );
}

function addMapLabel(map, value) {
  map.add(ui.Label(value, {
    position: 'top-center',
    backgroundColor: 'ffffffdd',
    padding: '6px',
    fontWeight: 'bold'
  }));
}

// ============================================================================
// 13. STATISTICHE E VALUTAZIONE COMPARATIVA
// ============================================================================

function meanFor(image, band, geometry, scale) {
  return image.select(band).reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: scale,
    bestEffort: true,
    maxPixels: 1e8,
    tileScale: 2
  }).get(band);
}

function fmt(value, digits) {
  if (value === null || value === undefined || !isFinite(value)) {
    return 'n.d.';
  }
  return Number(value).toFixed(digits);
}

function updateModeStats(mode, yearA, yearB) {
  var band = mode.band;

  var firstForStats = ee.Image(
    mode.collection
      .filter(ee.Filter.eq('year', yearA))
      .first()
  ).rename(band);

  var latestForStats = ee.Image(
    mode.collection
      .filter(ee.Filter.eq('year', yearB))
      .first()
  ).rename(band);

  var values = ee.Dictionary({
    company_first: meanFor(
      firstForStats,
      band,
      companyGeometry,
      mode.scale
    ),
    company_latest: meanFor(
      latestForStats,
      band,
      companyGeometry,
      mode.scale
    ),
    comparison_first: meanFor(
      firstForStats,
      band,
      comparisonGeometry,
      mode.scale
    ),
    comparison_latest: meanFor(
      latestForStats,
      band,
      comparisonGeometry,
      mode.scale
    )
  });

  values.evaluate(function(v, error) {
    if (error || !v) {
      statsLabel.setValue('Statistiche non disponibili: ' + (error || 'errore sconosciuto'));
      return;
    }

    var companyDelta = (
      v.company_first === null || v.company_latest === null
    ) ? null : v.company_latest - v.company_first;

    var comparisonDelta = (
      v.comparison_first === null || v.comparison_latest === null
    ) ? null : v.comparison_latest - v.comparison_first;

    var relative = (
      companyDelta === null || comparisonDelta === null
    ) ? null : companyDelta - comparisonDelta;

    statsLabel.setValue(
      'AZIENDA\n' +
      yearA + ': ' + fmt(v.company_first, 3) + ' ' + mode.unit + '\n' +
      yearB + ': ' + fmt(v.company_latest, 3) + ' ' + mode.unit + '\n' +
      'Delta: ' + fmt(companyDelta, 3) + ' ' + mode.unit + '\n\n' +
      'CONFRONTO\n' +
      yearA + ': ' + fmt(v.comparison_first, 3) + ' ' + mode.unit + '\n' +
      yearB + ': ' + fmt(v.comparison_latest, 3) + ' ' + mode.unit + '\n' +
      'Delta: ' + fmt(comparisonDelta, 3) + ' ' + mode.unit + '\n\n' +
      'Vantaggio relativo del cambiamento aziendale: ' +
      fmt(relative, 3) + ' ' + mode.unit
    );

    if (relative === null) {
      evidenceLabel.setValue('Evidenza relativa: dati insufficienti.');
      return;
    }

    var favorable = mode.better === 'higher'
      ? relative > 0
      : relative < 0;

    evidenceLabel.setValue(
      favorable
        ? 'Il cambiamento osservato e piu favorevole nell’azienda rispetto al confronto.'
        : 'Questo indicatore non mostra un cambiamento aziendale piu favorevole del confronto.'
    );
  });
}

// ============================================================================
// 14. GRAFICI TEMPORALI
// ============================================================================

function addMetricChart(mode) {
  if (mode.band === 'NBR_RECOVERY') {
    chartPanel.add(ui.Label(
      'Per la resilienza: 2024 = 0; gli altri anni indicano la distanza ' +
      'spettrale dall’impatto 2024 rispetto alla perdita 2023-2024.',
      {fontSize: '11px'}
    ));
  }

  chartPanel.add(
    ui.Chart.image.seriesByRegion({
      imageCollection: mode.collection,
      regions: regions,
      reducer: ee.Reducer.mean(),
      band: mode.band,
      scale: mode.scale,
      xProperty: 'system:time_start',
      seriesProperty: 'nome'
    }).setOptions({
      title: mode.band + ' | tutti gli anni 2019-oggi',
      lineWidth: 2,
      pointSize: 4,
      interpolateNulls: false,
      legend: {position: 'bottom'},
      hAxis: {title: 'Anno'},
      vAxis: {title: mode.band + ' (' + mode.unit + ')'}
    })
  );
}

function seasonalRainCollection() {
  return ee.ImageCollection.fromImages(
    years.map(function(yearValue) {
      var year = ee.Number(yearValue);
      var start = ee.Date.fromYMD(
        year,
        CFG.seasonStartMonth,
        CFG.seasonStartDay
      );

      var nominalEnd = ee.Date.fromYMD(
        year,
        CFG.seasonEndMonth,
        CFG.seasonEndDay
      );

      var end = ee.Date(ee.Algorithms.If(
        year.eq(CFG.lastYear),
        ee.Date(CFG.today).advance(1, 'day'),
        nominalEnd
      ));

      return chirps.filterDate(start, end)
        .sum()
        .rename('RAIN_MM')
        .set({
          year: year,
          'system:time_start': start.millis()
        });
    })
  );
}

var seasonalRain = seasonalRainCollection();

function addRainChart() {
  chartPanel.add(
    ui.Chart.image.series({
      imageCollection: seasonalRain,
      region: companyGeometry.centroid(1),
      reducer: ee.Reducer.first(),
      scale: 5566,
      xProperty: 'system:time_start'
    }).setOptions({
      title: 'Pioggia CHIRPS | controllo climatico regionale',
      lineWidth: 1,
      pointSize: 4,
      legend: {position: 'none'},
      hAxis: {title: 'Anno'},
      vAxis: {title: 'mm nella finestra stagionale'}
    })
  );
}

// ============================================================================
// 15. DISEGNO DELLA MAPPA COMPARATIVA A/B
// ============================================================================

function drawDashboard() {
  status.setValue('Caricamento mappe e statistiche…');
  chartPanel.clear();

  var modeName = modeSelect.getValue();
  var mode = MODES[modeName];
  var yearA = parseInt(yearASelect.getValue(), 10);
  var yearB = parseInt(yearBSelect.getValue(), 10);
  var showDifference = differenceCheck.getValue() && mode.diffVis !== null;

  mapA.layers().reset();
  mapB.layers().reset();
  mapA.widgets().reset();
  mapB.widgets().reset();

  var imageA = ee.Image(
    mode.collection
      .filter(ee.Filter.eq('year', yearA))
      .first()
  ).select(mode.band);

  var imageB = ee.Image(
    mode.collection
      .filter(ee.Filter.eq('year', yearB))
      .first()
  ).select(mode.band);

  mapA.addLayer(
    imageA.clip(mapRegion),
    mode.vis,
    modeName + ' | A: ' + yearA
  );

  if (showDifference) {
    mapB.addLayer(
      imageB
        .subtract(imageA)
        .rename(mode.band)
        .clip(mapRegion),
      mode.diffVis,
      modeName + ' | differenza ' + yearB + '-' + yearA
    );
  } else {
    mapB.addLayer(
      imageB.clip(mapRegion),
      mode.vis,
      modeName + ' | B: ' + yearB
    );
  }

  var annualA = ee.Image(
    annual.filter(ee.Filter.eq('year', yearA)).first()
  );

  var annualB = ee.Image(
    annual.filter(ee.Filter.eq('year', yearB)).first()
  );

  if (
    validCountCheck.getValue() &&
    mode.band !== 'NBR_RECOVERY'
  ) {
    var countBand = mode.band === 'LST_C'
      ? 'LST_VALID_COUNT'
      : 'S2_VALID_COUNT';

    var countVis = {
      min: 0,
      max: mode.band === 'LST_C' ? 15 : 45,
      palette: ['ffffff', '9ecae1', '3182bd', '54278f']
    };

    mapA.addLayer(
      annualA.select(countBand).clip(mapRegion),
      countVis,
      'Osservazioni valide ' + yearA,
      false
    );

    mapB.addLayer(
      annualB.select(countBand).clip(mapRegion),
      countVis,
      'Osservazioni valide ' + yearB,
      false
    );
  }

  addOutlines(mapA);
  addOutlines(mapB);

  var labelA = 'A | ' + yearA;
  var labelB = showDifference
    ? 'B−A | ' + yearB + '−' + yearA
    : 'B | ' + yearB;

  if (yearA === CFG.lastYear) {
    labelA += ' | fino al 10 ottobre';
  }

  if (yearB === CFG.lastYear) {
    labelB += ' | fino al 10 ottobre';
  }

  addMapLabel(mapA, labelA);
  addMapLabel(mapB, labelB);

  mapA.centerObject(companyGeometry, 15);
  mapB.centerObject(companyGeometry, 15);

  noteLabel.setValue(
    mode.note + '\n' +
    'Cloud Score+ cs_cdf ≥ ' + CFG.cloudScoreMin.toFixed(2) +
    '; compositi mediani, eccetto Dynamic World (media). ' +
    'I lati A e B usano la stessa scala cromatica.'
  );

  updateModeStats(mode, yearA, yearB);
  addMetricChart(mode);
  addRainChart();

  ee.Dictionary({
    a_s2: annualA.get('s2_scenes'),
    b_s2: annualB.get('s2_scenes'),
    a_landsat: annualA.get('landsat_scenes'),
    b_landsat: annualB.get('landsat_scenes')
  }).evaluate(function(counts, error) {
    if (error || !counts) {
      status.setValue('Mappe pronte; conteggio scene non disponibile.');
      return;
    }

    status.setValue(
      'Pronto | A: ' + yearA + ' | B: ' + yearB +
      ' | S2: ' + counts.a_s2 + ' / ' + counts.b_s2 +
      ' scene | Landsat LST: ' + counts.a_landsat + ' / ' +
      counts.b_landsat + ' scene.'
    );
  });
}

// ============================================================================
// 16. EVENTI E AVVIO
// ============================================================================

redrawButton.onClick(drawDashboard);
modeSelect.onChange(drawDashboard);
yearASelect.onChange(drawDashboard);
yearBSelect.onChange(drawDashboard);
differenceCheck.onChange(drawDashboard);
validCountCheck.onChange(drawDashboard);

drawDashboard();

// ============================================================================
// 17. OUTPUT DI CONTROLLO IN CONSOLE
// ============================================================================

print('Regioni usate nel confronto', regions);
print('Compositi annuali 2019-oggi', annual);
print(
  'Nota metodologica',
  'I risultati sono indicatori satellitari osservazionali. ' +
  'Per attribuire causalita alla gestione servono poligoni di confronto ' +
  'verificati, misure di campo e controllo di pioggia, topografia e disturbo.'
);
