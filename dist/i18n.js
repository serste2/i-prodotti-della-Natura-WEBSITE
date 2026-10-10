(() => {
  const path = location.pathname.replace(/\/+$/, "");
  const locale = path === "/en" ? "en" : path === "/ja" ? "ja" : "it";
  if (locale === "it") return;

  const translations = {
    en: {
      "MENU": "MENU", "CHIUDI": "CLOSE", "TERRITORIO": "LAND", "METODO": "METHOD", "CONTATTI": "CONTACT",
      "I PRODOTTI DELLA NATURA": "I PRODOTTI DELLA NATURA", "I PRODOTTI": "I PRODOTTI", "DELLA": "DELLA",
      "Azioni principali": "Main actions", "PRODOTTI": "PRODUCTS", "PROVACI SUL CAMPO": "TRY IT IN THE FIELD",
      "AZIENDA E TERRITORIO · BASELINE 2026": "FARM AND LAND · 2026 BASELINE",
      "STRUTTURA DATI REALE · MAPPA/SPLAT IN PREPARAZIONE": "REAL DATA STRUCTURE · MAP/SPLAT IN PREPARATION",
      "SUPERFICIE AZIENDALE": "FARM AREA", "INULA / CISTUS": "INULA / CISTUS", "OLIVI LECCINO / PENDOLINO": "LECCINO / PENDOLINO OLIVE TREES",
      "FASCIA TORRENTE TRASUBBIE": "TRASUBBIE STREAM BUFFER", "ACQUA": "WATER", "SUOLO": "SOIL", "VEGETAZIONE": "VEGETATION", "BIOMASSA": "BIOMASS",
      "Curve di livelloský · infiltrazione · ristagni": "Contour lines · infiltration · waterlogging",
      "Curve di livello · infiltrazione · ristagni": "Contour lines · infiltration · waterlogging",
      "Copertura · tessitura · sostanza organica": "Cover · texture · organic matter", "Oliveto · Inula · cisto · rigenerazione": "Olive grove · Inula · rockrose · regeneration",
      "Sfalci · potature · restituzione al suolo": "Cuttings · prunings · return to soil",
      "INULA E BIOMASSA MEDITERRANEA: GLI STUDI": "INULA AND MEDITERRANEAN BIOMASS: THE STUDIES",
      "Macero e rizosfera": "Maceration and rhizosphere", "Struttura e scambio": "Structure and exchange", "Copertura e carbonio": "Cover and carbon",
      "Ritorno della sostanza organica": "Returning organic matter", "PROVA SU INULA / AMARANTO ↗": "INULA / AMARANTH TRIAL ↗",
      "STUDIO SU LETTIERA DI CISTO ↗": "ROCKROSE LITTER STUDY ↗", "REVISIONE SU AMMENDANTI ORGANICI ↗": "ORGANIC AMENDMENTS REVIEW ↗",
      "STUDIO SU POTATURE DI OLIVO ↗": "OLIVE PRUNINGS STUDY ↗", "PROVA DI LUNGO PERIODO IN VIGNETO ↗": "LONG-TERM VINEYARD TRIAL ↗",
      "campagne annuali": "annual seasons", "anni di prova": "trial years",
      "CICLI CORTI · MATERIA LOCALE": "SHORT CYCLES · LOCAL MATERIAL", "RACCOGLIERE": "GATHER", "PREPARARE": "PREPARE",
      "TRASFORMARE": "TRANSFORM", "MACERARE": "MACERATE", "RESTITUIRE": "RETURN", "APPLICARE": "APPLY",
      "Potature, sfalci e biomasse selezionate, tracciate per provenienza e qualità.": "Selected prunings, cuttings and biomass, traced by origin and quality.",
      "CÍGNULA: 80% Dittrichia viscosa e 20% Cistus salviifolius, con 5 g di vermicompost bio e un cubetto di zucchero bio Fairtrade.": "CÍGNULA: 80% Dittrichia viscosa and 20% Cistus salviifolius, with 5 g of organic vermicompost and one Fairtrade organic sugar cube.",
      "Biotriturazione, compostaggio o uso fresco come pacciamatura, secondo specie, stato e destinazione.": "Chipping, composting or fresh use as mulch, according to species, condition and destination.",
      "Aggiungi acqua e una manciata del tuo suolo; mescola seguendo la card del kit.": "Add water and a handful of your soil; mix following the kit card.",
      "Copertura del suolo, habitat e fertilità: ogni flusso torna nel ciclo con una funzione.": "Soil cover, habitat and fertility: every flow returns to the cycle with a purpose.",
      "Porta il macerato al terreno, nella zona delle radici, seguendo le istruzioni del kit.": "Apply the macerate to the soil around the roots, following the kit instructions.",
      "Due sequenze fotografiche si alternano. Passa il puntatore o porta il focus qui per fermare la sequenza sul set corrente.": "Two photographic sequences alternate. Hover or focus here to pause on the current set.",
      "LINEA": "RANGE", "INULA DELLE GROTTE.": "INULA DELLE GROTTE.",
      "CÍGNULA Mini e INBRUMA dei Carbonari sono i prodotti di lancio. Per la linea in sviluppo puoi segnalare interesse, senza acquisto né impegno.": "CÍGNULA Mini and INBRUMA dei Carbonari are the launch products. You can register interest in the range in development, with no purchase or commitment.",
      "LANCIO / 01 · 12 € SPEDITA IN ITALIA": "LAUNCH / 01 · €12 DELIVERED IN ITALY", "KIT BOTANICO SECCO + CÍGNULApp": "DRY BOTANICAL KIT + CÍGNULApp",
      "RICHIEDI IL LANCIO ↗": "REQUEST THE LAUNCH ↗", "LANCIO / 02 · OLTRE 1 KG · 56 € SPEDIZIONE INCLUSA": "LAUNCH / 02 · OVER 1 KG · €56 DELIVERY INCLUDED",
      "SUBSTRATO VIVO FRESCO · A BASSA TRASFORMAZIONE": "FRESH LIVING SUBSTRATE · MINIMALLY PROCESSED", "DEI CARBONARI": "DEI CARBONARI",
      "SCOPRI IL PRODOTTO ↓": "DISCOVER THE PRODUCT ↓", "SEGNALA INTERESSE ↗": "REGISTER INTEREST ↗",
      "CÍGNULApp · INCLUSA GIÀ IN CÍGNULA MINI": "CÍGNULApp · ALREADY INCLUDED WITH CÍGNULA MINI", "La card di CÍGNULA Mini contiene il QR per accedere a CÍGNULApp.": "The CÍGNULA Mini card includes the QR code to access CÍGNULApp.",
      "INQUADRA": "FRAME", "FOTOGRAFA": "PHOTOGRAPH", "CONFRONTA": "COMPARE", "Apri CÍGNULApp dal QR nella card di CÍGNULA Mini.": "Open CÍGNULApp from the QR code on the CÍGNULA Mini card.",
      "Seleziona il telefono; l’app guida distanza e uso del flash.": "Select your phone; the app guides distance and flash use.", "Registra il punto, ottieni una stima e confronta le osservazioni nel tempo.": "Record the point, obtain an estimate and compare observations over time.",
      "MATERIA CHE TORNA ALLA TERRA": "MATTER RETURNING TO THE EARTH", "STATO": "STATE", "Bassa trasformazione; sminuzzato e asciugato all’aria": "Minimally processed; shredded and air-dried",
      "Progettato per suoli argillosi disturbati": "Designed for disturbed clay soils", "LOTTO": "BATCH", "Origine, matrici, processo e resa registrati": "Origin, materials, process and yield recorded",
      "IL CAMPO": "THE FIELD", "L’INULA": "INULA", "LA BIOMASSA": "BIOMASS", "SOCIETÀ AGRICOLA SEMPLICE": "AGRICULTURAL PARTNERSHIP",
      "RIAPRI IL CAMPO": "REOPEN THE FIELD", "VEDI COSA È CRESCIUTO ↗": "SEE WHAT HAS GROWN ↗", "Il tuo campo continua a crescere.": "Your field keeps growing.",
      "Modulo dimostrativo: in questa anteprima la richiesta non viene inviata.": "Demo form: this preview does not send your request.", "NOME": "NAME", "MESSAGGIO": "MESSAGE", "NOTA": "NOTE",
      "INVIA RICHIESTA ↗": "SEND REQUEST ↗", "TORNA SU ↑": "BACK TO TOP ↑", "SITO / STATO INIZIALE": "SITE / INITIAL STATE",
      "IL CAMPO È STATO SEMINATO": "THE FIELD HAS BEEN SOWN", "PRIMO ORDINE.": "FIRST ORDER.", "COPIA CODICE ↗": "COPY CODE ↗", "IL TUO RACCOLTO": "YOUR HARVEST",
      "RACCOLTA COMPLETATA": "HARVEST COMPLETE", "COMPLIMENTI.": "CONGRATULATIONS.", "CAMPO RACCOLTO.": "FIELD HARVESTED.", "SCEGLI UN PRODOTTO DI LANCIO": "CHOOSE A LAUNCH PRODUCT",
      "12 € · spedita in Italia": "€12 · delivered in Italy", "oltre 1 kg · 56 € spedizione inclusa": "over 1 kg · €56 delivery included",
      "IL TUO CAMPO · INBRUMA E CÍGNULA": "YOUR FIELD · INBRUMA AND CÍGNULA", "MACERAZIONE AEROBICA": "AEROBIC MACERATION", "5–10 GIORNI REALI": "5–10 REAL DAYS", "COMPRESSI IN 15 SECONDI": "COMPRESSED INTO 15 SECONDS",
      "BRUSH / INBRUMA": "BRUSH / INBRUMA", "SCEGLI E DISTRIBUISCI": "CHOOSE AND SPREAD", "Trascina nel campo per creare i cumuli": "Drag across the field to create piles",
      "SACCO SELEZIONATO": "SELECTED BAG", "distribuito nel campo": "spread across the field", "STUDIO SCIENTIFICO": "SCIENTIFIC STUDY", "CONSULTA IL PAPER ↗": "READ THE PAPER ↗",
      "CLICCA UN SACCO, POI DISTRIBUISCI NEL CAMPO": "CLICK A BAG, THEN SPREAD IT ACROSS THE FIELD", "CLICCA I CONTENITORI DEI SEMI": "CLICK THE SEED CONTAINERS",
      "Scopri gli studi e le connessioni con l’Inula.": "Discover the studies and connections with Inula.", "SEMINA": "SOW", "QUANTITÀ / BRUSH": "AMOUNT / BRUSH",
      "PREPARA CÍGNULA NEL CATINO ↗": "PREPARE CÍGNULA IN THE BASIN ↗", "INTERESSE / SENZA IMPEGNO": "INTEREST / NO COMMITMENT", "SEGNALA INTERESSE ↗": "REGISTER INTEREST ↗",
      "Nessun pagamento. Nessun obbligo di acquisto.": "No payment. No purchase obligation.", "ANTEPRIMA DEL MODULO.": "FORM PREVIEW.", "La richiesta non è stata inviata. Il servizio sarà disponibile alla pubblicazione.": "Your request was not sent. The service will be available at launch.",
      "AMARANTO": "AMARANTH", "LATTUGA": "LETTUCE", "SPINACI": "SPINACH", "POMODORO": "TOMATO", "POMODORI": "TOMATOES",
      "APRI I SEMI ↗": "OPEN THE SEEDS ↗", "SCOPERTA ✓ · RIAPRI": "DISCOVERED ✓ · REOPEN", "SEMINA IL CAMPO ↗": "SOW THE FIELD ↗",
      "DAL CAMPO": "FROM THE FIELD", "SINISTRO: ANNAFFIA": "LEFT: WATER", "DESTRO: SOLLEVA": "RIGHT: LIFT", "CAMPO PREPARATO": "FIELD PREPARED",
      "MACERATO DA DISTRIBUIRE": "MACERATE TO APPLY", "INGREDIENTI MESCOLATI": "INGREDIENTS MIXED", "CÍGNULA / PREPARAZIONE": "CÍGNULA / PREPARATION",
      "MESCOLA GLI INGREDIENTI": "MIX THE INGREDIENTS", "CÍGNULA / MACERAZIONE": "CÍGNULA / MACERATION", "IL TEMPO FA IL SUO LAVORO": "TIME DOES ITS WORK",
      "CÍGNULA / ANNAFFIATOIO": "CÍGNULA / WATERING CAN", "ANNAFFIA TUTTA L’INBRUMA": "WATER ALL THE INBRUMA", "SEMI / RICERCA": "SEEDS / RESEARCH",
      "PRIMA DI SEMINARE, SCOPRI": "DISCOVER BEFORE SOWING", "SEMINA / CAMPO": "SOWING / FIELD", "ORA SI SEMINA": "NOW WE SOW", "RACCOLTA": "HARVEST",
      "Codice copiato.": "Code copied.", "Chiudi": "Close", "Chiudi interazione": "Close interaction", "Chiudi scheda": "Close card", "Chiudi lo sconto": "Close discount", "Chiudi riepilogo": "Close summary", "Chiudi avviso": "Close notice",
      "Lingue": "Languages", "Scheda di ricerca del seme": "Seed research card", "Quattro contenitori di semi": "Four seed containers", "Contatori dei frutti raccolti": "Harvested crop counters",
      "La macerazione in acqua estrae parte dei composti idrosolubili; nel suolo questi incontrano la rizosfera e i microrganismi decompositori. Studi in serra su amaranto, lattuga e spinacio hanno osservato risposte a preparati sperimentali con": "Maceration in water extracts some water-soluble compounds; in the soil they meet the rhizosphere and decomposer microorganisms. Greenhouse studies on amaranth, lettuce and spinach observed responses to experimental preparations with",
      ", alghe e microrganismi. Lo studio converge con il percorso CÍGNULA su tre elementi: Inula, trasformazione in acqua e osservazione della risposta delle colture.": ", algae and microorganisms. The study aligns with the CÍGNULA pathway in three respects: Inula, transformation in water and observation of crop response.",
      "Le prove citate collegano l’impiego di preparati a base di": "The cited trials connect the use of Inula-based preparations",
      "all’osservazione di germinazione, crescita e sviluppo radicale. Gli studi sul cisto indicano dose e trasformazione come variabili centrali da osservare.": "with observations of germination, growth and root development. Studies on rockrose identify dose and transformation as key variables to observe.",
      "Per matrici vegetali ricche di carbonio, la copertura può proteggere la superficie; la decomposizione alimenta i cicli microbici, ma residui freschi con C:N alto possono immobilizzare azoto per un periodo.": "For carbon-rich plant materials, cover can protect the surface; decomposition feeds microbial cycles, though fresh residues with a high C:N ratio can temporarily immobilise nitrogen.",
      "Da seguire nel lotto: carbonio organico, C:N, umidità, stabilità degli aggregati, infiltrazione e azoto minerale.": "Track in the batch: organic carbon, C:N, moisture, aggregate stability, infiltration and mineral nitrogen.",
      "In un oliveto superintensivo spagnolo, l’effetto sull’umidità del suolo si è osservato sopra 7,5 t/ha; 15 t/ha è stata la soglia per aumenti significativi di carbonio organico nei primi 20 cm. Risultato legato a quel sito e a quelle quantità.": "In a Spanish super-intensive olive grove, effects on soil moisture were observed above 7.5 t/ha; 15 t/ha was the threshold for significant increases in organic carbon in the top 20 cm. The result applies to that site and those quantities.",
      "In un vigneto su suolo sabbioso calcareo, 2,1 t/ha/anno di legno di potatura trinciato secco è stato valutato come reintegro delle perdite annuali di humus. Su altri suoli la risposta dipende da matrice, dose, clima e gestione.": "In a vineyard on calcareous sandy soil, 2.1 t/ha/year of dry shredded pruning wood was assessed as replacing annual humus losses. On other soils, the response depends on material, dose, climate and management.",
      "Biomasse aziendali tracciate e trasformate biologicamente. Fresco significa sminuzzato e asciugato all’aria fino a condizioni stabili, non bagnato o appena tagliato.": "Farm biomass, traced and biologically transformed. Fresh means shredded and air-dried to stable conditions, not wet or freshly cut.",
      "80% Dittrichia viscosa e 20% Cistus salviifolius; 5 g di vermicompost bio, cubetto di zucchero bio Fairtrade, guida numerata e QR per CÍGNULApp. Aggiungi acqua e un pugno del tuo suolo. Mescola · macera · applica.": "80% Dittrichia viscosa and 20% Cistus salviifolius; 5 g organic vermicompost, one Fairtrade organic sugar cube, numbered guide and QR code for CÍGNULApp. Add water and a handful of your soil. Mix · macerate · apply.",
      "Substrato vivo fresco della successione rigenerativa mediterranea, prodotto con biomasse aziendali tracciate e trasformate biologicamente.": "A fresh living substrate from Mediterranean regenerative succession, made from traced farm biomass transformed biologically.",
      "Un’impresa agricola che lavora tra pratica, osservazione e trasformazione della materia locale. Per prodotti, collaborazioni e informazioni, scrivici.": "A farm enterprise working through practice, observation and transformation of local materials. Contact us for products, collaborations and information.",
      "Connessioni dalla letteratura sull’Inula: questi studi non sono prove delle nostre formulazioni commerciali.": "Connections from the literature on Inula: these studies are not tests of our commercial formulations.",
      "Continua a esplorare il sito. Cerca «RIAPRI IL CAMPO» per vedere come sta il tuo campo.": "Keep exploring the site. Look for “REOPEN THE FIELD” to see how your field is doing.",
      "Il tuo codice è": "Your code is", ". Comunicalo quando richiedi il primo ordine.": ". Quote it when requesting your first order.",
      "Ora esplora il sito: troverai il bottone per tornare a vedere come sta il tuo campo.": "Now explore the site: you will find the button that takes you back to your field.",
      "Hai trovato un nuovo sconto tra i frutti raccolti. Comunica il codice quando richiedi un ordine.": "You found a new discount among the harvested crops. Quote the code when requesting an order.",
      "Lo sconto rivelato viene riportato nella richiesta. Nessun pagamento immediato.": "The revealed discount is included in the request. No immediate payment.",
      "Clicca un sacco nel pannello sotto il campo e distribuisci la biomassa. Completa tutti e tre al 100%.": "Click a bag in the panel below the field and spread the biomass. Complete all three to 100%.",
      "Afferra il mestolo nel catino e segui il bordo interno con movimenti circolari.": "Take the ladle in the basin and follow the inner rim with circular movements.",
      "5–10 giorni reali, rappresentati qui in 15 secondi.": "5–10 real days, represented here in 15 seconds.",
      "Il livello cala solo quando bagni una nuova area coperta. Continua finché tutto il terreno preparato è annaffiato.": "The level drops only when you water a new covered area. Continue until all prepared soil has been watered.",
      "Apri i quattro contenitori: ogni seme racconta una connessione con la ricerca sull’Inula.": "Open the four containers: each seed reveals a connection with research on Inula.",
      "La farmer distribuisce i semi sul terreno preparato.": "The farmer spreads the seeds across the prepared soil.",
      "Tutti e tre i sacchi sono vuoti. Ora puoi preparare CÍGNULA.": "All three bags are empty. You can now prepare CÍGNULA.", "Sacco vuoto. Puoi distribuire un altro tipo di INBRUMA.": "Bag empty. You can spread another type of INBRUMA.",
      "Questa zona è già bagnata o non contiene INBRUMA. Porta il macerato su una nuova area coperta.": "This area is already wet or contains no INBRUMA. Apply the macerate to a new covered area.",
      "L’annaffiatoio è vuoto. Tutto il macerato è stato distribuito.": "The watering can is empty. All the macerate has been applied.",
      "Ingredienti mescolati. Inizia la macerazione aerobica: da 5 a 10 giorni reali, compressi qui in 15 secondi.": "Ingredients mixed. Aerobic maceration begins: 5 to 10 real days, compressed here into 15 seconds.",
      "Il macerato è pronto. Solleva l’annaffiatoio con il tasto destro, poi annaffia il campo con il sinistro.": "The macerate is ready. Lift the watering can with the right button, then water the field with the left.",
      "Gli ingredienti di CÍGNULA sono nel catino. Mescolali con gesti circolari fino al 100%.": "The CÍGNULA ingredients are in the basin. Mix them in circular movements to 100%.",
      "Il campo è pronto. Apri i quattro contenitori dei semi per scoprire gli studi e sbloccare la semina.": "The field is ready. Open the four seed containers to discover the studies and unlock sowing.",
      "Hai scoperto tutti i semi. Clicca per iniziare.": "You discovered all the seeds. Click to begin.", "INBRUMA, acqua e semi": "INBRUMA, water and seeds",
      "distribuito · completa tutti e tre i sacchi": "spread · complete all three bags", "mescola nel catino fino al 100%": "mix in the basin to 100%",
      "CÍGNULA unisce Inula e cisto; nel kit la card conduce a CÍGNULApp tramite QR.": "CÍGNULA combines Inula and rockrose; the kit card leads to CÍGNULApp via QR code.",
      "L’Inula delle Grotte cresce nel nostro campo a Cana, in Maremma.": "Inula delle Grotte grows in our field in Cana, Maremma.", "INBRUMA nasce dalla trasformazione della biomassa raccolta e tracciata in azienda.": "INBRUMA comes from biomass collected, traced and transformed on the farm.",
      "Nel campo convivono Inula, cisto, olivi e altre piante: osserviamo i loro cicli nel tempo.": "Inula, rockrose, olive trees and other plants coexist in the field; we observe their cycles over time.", "Per INBRUMA Aulivi valorizziamo anche le potature degli olivi.": "For INBRUMA Aulivi we also make use of olive prunings.",
      "Seleziona il codice INULA05 e comunicalo nella richiesta del primo ordine.": "Select the code INULA05 and quote it in your first-order request.", "Codice copiato. Continua a esplorare il sito e cerca «RIAPRI IL CAMPO».": "Code copied. Keep exploring the site and look for “REOPEN THE FIELD”.",
      "Ti resta il codice del primo ordine: INULA05 · sconto 5%.": "Your first-order code remains: INULA05 · 5% discount.", "Il tuo sconto sul prossimo ordine:": "Your discount on the next order:", "· codice": "· code",
      "Fotografie reali di INBRUMA e del campo": "Real photographs of INBRUMA and the field", "Scegli i sacchi di INBRUMA": "Choose the INBRUMA bags", "Tre sacchi di INBRUMA da distribuire": "Three INBRUMA bags to spread", "Semi e ricerca prima della semina": "Seeds and research before sowing",
      "Paesaggio agricolo interattivo: distribuisci INBRUMA, prepara e applica CÍGNULA": "Interactive agricultural landscape: spread INBRUMA, prepare and apply CÍGNULA"
    },
    ja: {
      "MENU": "メニュー", "CHIUDI": "閉じる", "TERRITORIO": "土地", "METODO": "方法", "SHOP": "製品", "CONTATTI": "お問い合わせ",
      "I PRODOTTI DELLA NATURA": "I PRODOTTI DELLA NATURA", "I PRODOTTI": "I PRODOTTI", "DELLA": "DELLA",
      "Azioni principali": "主な操作", "PRODOTTI": "製品", "PROVACI SUL CAMPO": "畑で試す",
      "AZIENDA E TERRITORIO · BASELINE 2026": "農園と土地 · 2026年基準データ", "STRUTTURA DATI REALE · MAPPA/SPLAT IN PREPARAZIONE": "実データ構造 · マップ／SPLAT準備中",
      "SUPERFICIE AZIENDALE": "農園面積", "INULA / CISTUS": "イヌラ／シスタス", "OLIVI LECCINO / PENDOLINO": "レッチーノ／ペンドリーノ オリーブ",
      "FASCIA TORRENTE TRASUBBIE": "トラスッビエ川沿い", "ACQUA": "水", "SUOLO": "土壌", "VEGETAZIONE": "植生", "BIOMASSA": "バイオマス",
      "Curve di livelloský · infiltrazione · ristagni": "等高線 · 浸透 · 滞水", "Curve di livello · infiltrazione · ristagni": "等高線 · 浸透 · 滞水",
      "Copertura · tessitura · sostanza organica": "被覆 · 土性 · 有機物", "Oliveto · Inula · cisto · rigenerazione": "オリーブ園 · イヌラ · シスタス · 再生",
      "Sfalci · potature · restituzione al suolo": "刈草 · 剪定枝 · 土への還元",
      "INULA E BIOMASSA MEDITERRANEA: GLI STUDI": "イヌラと地中海バイオマス：研究", "Macero e rizosfera": "浸漬液と根圏", "Struttura e scambio": "構造と交換",
      "Copertura e carbonio": "被覆と炭素", "Ritorno della sostanza organica": "有機物を土へ戻す", "PROVA SU INULA / AMARANTO ↗": "イヌラ／アマランサス試験 ↗",
      "STUDIO SU LETTIERA DI CISTO ↗": "シスタス落葉研究 ↗", "REVISIONE SU AMMENDANTI ORGANICI ↗": "有機土壌改良材レビュー ↗",
      "STUDIO SU POTATURE DI OLIVO ↗": "オリーブ剪定枝研究 ↗", "PROVA DI LUNGO PERIODO IN VIGNETO ↗": "ブドウ畑の長期試験 ↗", "campagne annuali": "年次調査", "anni di prova": "試験年数",
      "CICLI CORTI · MATERIA LOCALE": "短い循環 · 地域の素材", "RACCOGLIERE": "集める", "PREPARARE": "準備する", "TRASFORMARE": "加工する", "MACERARE": "浸漬する", "RESTITUIRE": "土へ返す", "APPLICARE": "施用する",
      "Potature, sfalci e biomasse selezionate, tracciate per provenienza e qualità.": "剪定枝、刈草、選別したバイオマスを、産地と品質まで記録します。",
      "CÍGNULA: 80% Dittrichia viscosa e 20% Cistus salviifolius, con 5 g di vermicompost bio e un cubetto di zucchero bio Fairtrade.": "CÍGNULA：Dittrichia viscosa 80%、Cistus salviifolius 20%、有機ミミズ堆肥5g、フェアトレード有機角砂糖1個。",
      "Biotriturazione, compostaggio o uso fresco come pacciamatura, secondo specie, stato e destinazione.": "植物種、状態、用途に応じて粉砕、堆肥化、または生のマルチとして利用します。",
      "Aggiungi acqua e una manciata del tuo suolo; mescola seguendo la card del kit.": "水とひと握りの土を加え、キットのカードに従って混ぜます。",
      "Copertura del suolo, habitat e fertilità: ogni flusso torna nel ciclo con una funzione.": "土壌被覆、生息環境、肥沃度。すべての流れが役割をもって循環へ戻ります。",
      "Porta il macerato al terreno, nella zona delle radici, seguendo le istruzioni del kit.": "キットの説明に従い、浸漬液を根の周辺の土へ施します。",
      "Due sequenze fotografiche si alternano. Passa il puntatore o porta il focus qui per fermare la sequenza sul set corrente.": "2つの写真シーケンスが交互に表示されます。ホバーまたはフォーカスすると現在のセットで停止します。",
      "LINEA": "シリーズ", "INULA DELLE GROTTE.": "INULA DELLE GROTTE.",
      "CÍGNULA Mini e INBRUMA dei Carbonari sono i prodotti di lancio. Per la linea in sviluppo puoi segnalare interesse, senza acquisto né impegno.": "CÍGNULA MiniとINBRUMA dei Carbonariが発売製品です。開発中のシリーズには、購入義務なしで関心を登録できます。",
      "LANCIO / 01 · 12 € SPEDITA IN ITALIA": "発売 / 01 · 12ユーロ（イタリア国内送料込）", "KIT BOTANICO SECCO + CÍGNULApp": "乾燥植物キット + CÍGNULApp", "RICHIEDI IL LANCIO ↗": "発売を問い合わせる ↗",
      "LANCIO / 02 · OLTRE 1 KG · 56 € SPEDIZIONE INCLUSA": "発売 / 02 · 1KG超 · 56ユーロ（送料込）", "SUBSTRATO VIVO FRESCO · A BASSA TRASFORMAZIONE": "新鮮な生きた基質 · 低加工",
      "DEI CARBONARI": "DEI CARBONARI", "SCOPRI IL PRODOTTO ↓": "製品を見る ↓", "SEGNALA INTERESSE ↗": "関心を登録 ↗",
      "CÍGNULApp · INCLUSA GIÀ IN CÍGNULA MINI": "CÍGNULApp · CÍGNULA MINIに付属", "La card di CÍGNULA Mini contiene il QR per accedere a CÍGNULApp.": "CÍGNULA MiniのカードにはCÍGNULAppへアクセスするQRコードがあります。",
      "INQUADRA": "画面に収める", "FOTOGRAFA": "撮影する", "CONFRONTA": "比較する", "Apri CÍGNULApp dal QR nella card di CÍGNULA Mini.": "CÍGNULA MiniのカードのQRからCÍGNULAppを開きます。",
      "Seleziona il telefono; l’app guida distanza e uso del flash.": "端末を選ぶと、アプリが距離とフラッシュの使い方を案内します。", "Registra il punto, ottieni una stima e confronta le osservazioni nel tempo.": "地点を記録し、推定値を得て、観察結果を経時比較します。",
      "MATERIA CHE TORNA ALLA TERRA": "土へ戻る素材", "STATO": "状態", "Bassa trasformazione; sminuzzato e asciugato all’aria": "低加工・細断・自然乾燥", "Progettato per suoli argillosi disturbati": "攪乱された粘土質土壌向け",
      "LOTTO": "ロット", "Origine, matrici, processo e resa registrati": "由来、原料、工程、収量を記録", "IL CAMPO": "畑", "L’INULA": "イヌラ", "LA BIOMASSA": "バイオマス",
      "SOCIETÀ AGRICOLA SEMPLICE": "農業法人", "RIAPRI IL CAMPO": "畑をもう一度開く", "VEDI COSA È CRESCIUTO ↗": "育ったものを見る ↗", "Il tuo campo continua a crescere.": "あなたの畑は育ち続けています。",
      "Modulo dimostrativo: in questa anteprima la richiesta non viene inviata.": "デモフォーム：このプレビューでは送信されません。", "NOME": "お名前", "EMAIL": "メール", "MESSAGGIO": "メッセージ", "NOTA": "備考", "INVIA RICHIESTA ↗": "問い合わせを送る ↗",
      "TORNA SU ↑": "ページ上部へ ↑", "SITO / STATO INIZIALE": "サイト / 初期状態", "IL CAMPO È STATO SEMINATO": "畑に種をまきました", "PRIMO ORDINE.": "初回注文。", "COPIA CODICE ↗": "コードをコピー ↗",
      "IL TUO RACCOLTO": "あなたの収穫", "RACCOLTA COMPLETATA": "収穫完了", "COMPLIMENTI.": "おめでとうございます。", "CAMPO RACCOLTO.": "畑の収穫完了。", "SCEGLI UN PRODOTTO DI LANCIO": "発売製品を選ぶ",
      "12 € · spedita in Italia": "12ユーロ · イタリア国内送料込", "oltre 1 kg · 56 € spedizione inclusa": "1kg超 · 56ユーロ（送料込）",
      "IL TUO CAMPO · INBRUMA E CÍGNULA": "あなたの畑 · INBRUMAとCÍGNULA", "MACERAZIONE AEROBICA": "好気性浸漬", "5–10 GIORNI REALI": "実際は5〜10日", "COMPRESSI IN 15 SECONDI": "15秒に短縮",
      "BRUSH / INBRUMA": "ブラシ / INBRUMA", "SCEGLI E DISTRIBUISCI": "選んで散布", "Trascina nel campo per creare i cumuli": "畑をドラッグして山を作る", "SACCO SELEZIONATO": "選択中の袋", "distribuito nel campo": "畑への散布率",
      "STUDIO SCIENTIFICO": "科学研究", "CONSULTA IL PAPER ↗": "論文を読む ↗", "CLICCA UN SACCO, POI DISTRIBUISCI NEL CAMPO": "袋をクリックし、畑に散布してください", "CLICCA I CONTENITORI DEI SEMI": "種の容器をクリック",
      "Scopri gli studi e le connessioni con l’Inula.": "イヌラとの研究上のつながりを発見。", "SEMINA": "種をまく", "QUANTITÀ / BRUSH": "量 / ブラシ", "PREPARA CÍGNULA NEL CATINO ↗": "たらいでCÍGNULAを準備 ↗",
      "INTERESSE / SENZA IMPEGNO": "関心登録 / 購入義務なし", "Nessun pagamento. Nessun obbligo di acquisto.": "支払いも購入義務もありません。", "ANTEPRIMA DEL MODULO.": "フォームのプレビュー。", "La richiesta non è stata inviata. Il servizio sarà disponibile alla pubblicazione.": "問い合わせは送信されていません。サービスは公開時に利用できます。",
      "AMARANTO": "アマランサス", "LATTUGA": "レタス", "SPINACI": "ホウレンソウ", "POMODORO": "トマト", "POMODORI": "トマト", "APRI I SEMI ↗": "種を開く ↗", "SCOPERTA ✓ · RIAPRI": "発見済み ✓ · もう一度開く", "SEMINA IL CAMPO ↗": "畑に種をまく ↗",
      "DAL CAMPO": "畑から", "SINISTRO: ANNAFFIA": "左：水やり", "DESTRO: SOLLEVA": "右：持ち上げる", "CAMPO PREPARATO": "準備済みの畑", "MACERATO DA DISTRIBUIRE": "散布する浸漬液", "INGREDIENTI MESCOLATI": "混合した材料",
      "CÍGNULA / PREPARAZIONE": "CÍGNULA / 準備", "MESCOLA GLI INGREDIENTI": "材料を混ぜる", "CÍGNULA / MACERAZIONE": "CÍGNULA / 浸漬", "IL TEMPO FA IL SUO LAVORO": "時間が働く", "CÍGNULA / ANNAFFIATOIO": "CÍGNULA / じょうろ", "ANNAFFIA TUTTA L’INBRUMA": "INBRUMA全体に水やり",
      "SEMI / RICERCA": "種 / 研究", "PRIMA DI SEMINARE, SCOPRI": "種まき前に発見", "SEMINA / CAMPO": "種まき / 畑", "ORA SI SEMINA": "種をまきます", "RACCOLTA": "収穫", "Codice copiato.": "コードをコピーしました。",
      "Chiudi": "閉じる", "Chiudi interazione": "操作を閉じる", "Chiudi scheda": "カードを閉じる", "Chiudi lo sconto": "割引を閉じる", "Chiudi riepilogo": "まとめを閉じる", "Chiudi avviso": "通知を閉じる", "Lingue": "言語",
      "Scheda di ricerca del seme": "種の研究カード", "Quattro contenitori di semi": "4つの種の容器", "Contatori dei frutti raccolti": "収穫数カウンター",
      "La macerazione in acqua estrae parte dei composti idrosolubili; nel suolo questi incontrano la rizosfera e i microrganismi decompositori. Studi in serra su amaranto, lattuga e spinacio hanno osservato risposte a preparati sperimentali con": "水への浸漬で水溶性成分の一部が抽出され、土中で根圏や分解微生物と出会います。アマランサス、レタス、ホウレンソウの温室試験では、実験的な調製物への反応が観察されました：",
      ", alghe e microrganismi. Lo studio converge con il percorso CÍGNULA su tre elementi: Inula, trasformazione in acqua e osservazione della risposta delle colture.": "、藻類、微生物。この研究は、イヌラ、水中での変換、作物反応の観察という3点でCÍGNULAのプロセスと重なります。",
      "Le prove citate collegano l’impiego di preparati a base di": "引用した試験では、イヌラ由来の調製物の使用を",
      "all’osservazione di germinazione, crescita e sviluppo radicale. Gli studi sul cisto indicano dose e trasformazione come variabili centrali da osservare.": "発芽、生育、根の発達の観察につなげています。シスタス研究では、用量と変換が観察すべき中心的変数です。",
      "Per matrici vegetali ricche di carbonio, la copertura può proteggere la superficie; la decomposizione alimenta i cicli microbici, ma residui freschi con C:N alto possono immobilizzare azoto per un periodo.": "炭素に富む植物資材では、被覆が地表を守り、分解が微生物循環を支えます。一方、C:N比の高い新鮮な残渣は一時的に窒素を固定することがあります。",
      "Da seguire nel lotto: carbonio organico, C:N, umidità, stabilità degli aggregati, infiltrazione e azoto minerale.": "ロットで追跡する項目：有機炭素、C:N、含水率、団粒安定性、浸透、無機態窒素。",
      "In un oliveto superintensivo spagnolo, l’effetto sull’umidità del suolo si è osservato sopra 7,5 t/ha; 15 t/ha è stata la soglia per aumenti significativi di carbonio organico nei primi 20 cm. Risultato legato a quel sito e a quelle quantità.": "スペインの超高密度オリーブ園では、土壌水分への効果は7.5t/ha超で観察され、表層20cmの有機炭素が有意に増える閾値は15t/haでした。これはその場所と施用量に関する結果です。",
      "In un vigneto su suolo sabbioso calcareo, 2,1 t/ha/anno di legno di potatura trinciato secco è stato valutato come reintegro delle perdite annuali di humus. Su altri suoli la risposta dipende da matrice, dose, clima e gestione.": "石灰質砂質土のブドウ畑で、乾燥粉砕した剪定木2.1t/ha/年が腐植の年間損失を補うものとして評価されました。他の土壌では、資材、用量、気候、管理により反応が異なります。",
      "Biomasse aziendali tracciate e trasformate biologicamente. Fresco significa sminuzzato e asciugato all’aria fino a condizioni stabili, non bagnato o appena tagliato.": "農園内で履歴管理され、生物学的に変換されたバイオマス。「新鮮」とは、濡れたまま・刈りたてではなく、細断し安定するまで自然乾燥した状態です。",
      "80% Dittrichia viscosa e 20% Cistus salviifolius; 5 g di vermicompost bio, cubetto di zucchero bio Fairtrade, guida numerata e QR per CÍGNULApp. Aggiungi acqua e un pugno del tuo suolo. Mescola · macera · applica.": "Dittrichia viscosa 80%、Cistus salviifolius 20%、有機ミミズ堆肥5g、フェアトレード有機角砂糖1個、番号付きガイド、CÍGNULApp用QR。水とひと握りの土を加えます。混ぜる · 浸漬する · 施用する。",
      "Substrato vivo fresco della successione rigenerativa mediterranea, prodotto con biomasse aziendali tracciate e trasformate biologicamente.": "地中海の再生的遷移から生まれる新鮮な生きた基質。履歴管理した農園バイオマスを生物学的に変換して作ります。",
      "Un’impresa agricola che lavora tra pratica, osservazione e trasformazione della materia locale. Per prodotti, collaborazioni e informazioni, scrivici.": "地域の素材を実践、観察、変換する農業事業体です。製品、協働、その他のお問い合わせはご連絡ください。",
      "Connessioni dalla letteratura sull’Inula: questi studi non sono prove delle nostre formulazioni commerciali.": "イヌラ文献との接点です。これらの研究は当社製品の処方を検証したものではありません。",
      "Continua a esplorare il sito. Cerca «RIAPRI IL CAMPO» per vedere come sta il tuo campo.": "サイトを探索し続けてください。「畑をもう一度開く」から畑の様子を確認できます。",
      "Il tuo codice è": "あなたのコード：", ". Comunicalo quando richiedi il primo ordine.": "。初回注文のお問い合わせ時にお伝えください。", "Ora esplora il sito: troverai il bottone per tornare a vedere come sta il tuo campo.": "サイトを探索すると、畑の様子に戻るボタンが見つかります。",
      "Hai trovato un nuovo sconto tra i frutti raccolti. Comunica il codice quando richiedi un ordine.": "収穫物の中から新しい割引を見つけました。注文のお問い合わせ時にコードをお伝えください。", "Lo sconto rivelato viene riportato nella richiesta. Nessun pagamento immediato.": "見つけた割引は問い合わせに反映されます。すぐに支払いは発生しません。",
      "Clicca un sacco nel pannello sotto il campo e distribuisci la biomassa. Completa tutti e tre al 100%.": "畑の下のパネルで袋をクリックし、バイオマスを散布します。3袋すべてを100%にしてください。", "Afferra il mestolo nel catino e segui il bordo interno con movimenti circolari.": "たらいの柄杓をつかみ、内側の縁に沿って円を描くように動かします。",
      "5–10 giorni reali, rappresentati qui in 15 secondi.": "実際の5〜10日を、ここでは15秒で表現します。", "Il livello cala solo quando bagni una nuova area coperta. Continua finché tutto il terreno preparato è annaffiato.": "新しい被覆部分に水を与えた時だけ水位が下がります。準備した土全体に水が行き渡るまで続けてください。",
      "Apri i quattro contenitori: ogni seme racconta una connessione con la ricerca sull’Inula.": "4つの容器を開いてください。それぞれの種がイヌラ研究とのつながりを示します。", "La farmer distribuisce i semi sul terreno preparato.": "農作業者が準備した土に種をまきます。",
      "Tutti e tre i sacchi sono vuoti. Ora puoi preparare CÍGNULA.": "3袋すべてが空になりました。CÍGNULAを準備できます。", "Sacco vuoto. Puoi distribuire un altro tipo di INBRUMA.": "袋が空になりました。別のINBRUMAを散布できます。",
      "Questa zona è già bagnata o non contiene INBRUMA. Porta il macerato su una nuova area coperta.": "この部分はすでに濡れているか、INBRUMAがありません。浸漬液を別の被覆部分へ運んでください。", "L’annaffiatoio è vuoto. Tutto il macerato è stato distribuito.": "じょうろが空になりました。浸漬液をすべて散布しました。",
      "Ingredienti mescolati. Inizia la macerazione aerobica: da 5 a 10 giorni reali, compressi qui in 15 secondi.": "材料を混ぜました。好気性浸漬を開始します。実際の5〜10日をここでは15秒に短縮します。", "Il macerato è pronto. Solleva l’annaffiatoio con il tasto destro, poi annaffia il campo con il sinistro.": "浸漬液ができました。右ボタンでじょうろを持ち上げ、左ボタンで畑に水を与えます。",
      "Gli ingredienti di CÍGNULA sono nel catino. Mescolali con gesti circolari fino al 100%.": "CÍGNULAの材料がたらいに入っています。円を描く動きで100%まで混ぜてください。", "Il campo è pronto. Apri i quattro contenitori dei semi per scoprire gli studi e sbloccare la semina.": "畑の準備ができました。4つの種の容器を開き、研究を発見して種まきを解放してください。",
      "Hai scoperto tutti i semi. Clicca per iniziare.": "すべての種を発見しました。クリックして開始。", "INBRUMA, acqua e semi": "INBRUMA、水、種", "distribuito · completa tutti e tre i sacchi": "散布済み · 3袋すべて完了してください", "mescola nel catino fino al 100%": "たらいで100%まで混ぜる",
      "CÍGNULA unisce Inula e cisto; nel kit la card conduce a CÍGNULApp tramite QR.": "CÍGNULAはイヌラとシスタスを組み合わせ、キットのカードからQRでCÍGNULAppへ進めます。", "L’Inula delle Grotte cresce nel nostro campo a Cana, in Maremma.": "Inula delle Grotteはマレンマのカーナにある私たちの畑で育ちます。",
      "INBRUMA nasce dalla trasformazione della biomassa raccolta e tracciata in azienda.": "INBRUMAは農園で収集・履歴管理したバイオマスの変換から生まれます。", "Nel campo convivono Inula, cisto, olivi e altre piante: osserviamo i loro cicli nel tempo.": "畑にはイヌラ、シスタス、オリーブなどが共生し、その循環を長期的に観察しています。", "Per INBRUMA Aulivi valorizziamo anche le potature degli olivi.": "INBRUMA Auliviではオリーブの剪定枝も活用します。",
      "Seleziona il codice INULA05 e comunicalo nella richiesta del primo ordine.": "コードINULA05を選択し、初回注文のお問い合わせ時にお伝えください。", "Codice copiato. Continua a esplorare il sito e cerca «RIAPRI IL CAMPO».": "コードをコピーしました。サイトを探索し、「畑をもう一度開く」を探してください。",
      "Ti resta il codice del primo ordine: INULA05 · sconto 5%.": "初回注文コードは引き続き利用できます：INULA05 · 5%割引。", "Il tuo sconto sul prossimo ordine:": "次回注文の割引：", "· codice": "· コード",
      "Fotografie reali di INBRUMA e del campo": "INBRUMAと畑の実写", "Scegli i sacchi di INBRUMA": "INBRUMAの袋を選ぶ", "Tre sacchi di INBRUMA da distribuire": "散布するINBRUMA 3袋", "Semi e ricerca prima della semina": "種まき前の種と研究", "Paesaggio agricolo interattivo: distribuisci INBRUMA, prepara e applica CÍGNULA": "農業インタラクション：INBRUMAを散布し、CÍGNULAを準備・施用"
    }
  };

  const dict = translations[locale];
  const dynamic = (value) => {
    let m;
    if ((m = value.match(/^(\d+) \/ (\d+) schede scoperte$/))) return locale === "ja" ? `${m[2]}件中${m[1]}件のカードを発見` : `${m[1]} / ${m[2]} cards discovered`;
    if ((m = value.match(/^Semina, (\d+) di quattro schede scoperte$/))) return locale === "ja" ? `種まき：4件中${m[1]}件のカードを発見` : `Sow: ${m[1]} of four cards discovered`;
    if (value === "Semina il campo, tutte le quattro schede scoperte") return locale === "ja" ? "畑に種をまく：4件のカードをすべて発見" : "Sow the field: all four cards discovered";
    if ((m = value.match(/^(\d+) di quattro schede scoperte\.(.*)$/))) return locale === "ja" ? `4件中${m[1]}件のカードを発見。${m[2] ? " 種まきバーの準備ができました。クリックして開始。" : ""}` : `${m[1]} of four cards discovered.${m[2] ? " The sowing bar is ready: click to begin." : ""}`;
    if ((m = value.match(/^(.+), (\d+)% distribuito$/))) return locale === "ja" ? `${m[1]}、${m[2]}%散布済み` : `${m[1]}, ${m[2]}% spread`;
    if ((m = value.match(/^Raccolto: (\d+) piante su (\d+)\.$/))) return locale === "ja" ? `収穫：${m[2]}株中${m[1]}株。` : `Harvested: ${m[1]} of ${m[2]} plants.`;
    if ((m = value.match(/^(\d+) piante vicine raccolte\. Raccolto: (\d+) piante su (\d+)\.$/))) return locale === "ja" ? `近くの${m[1]}株を収穫。収穫：${m[3]}株中${m[2]}株。` : `${m[1]} nearby plants harvested. Harvested: ${m[2]} of ${m[3]} plants.`;
    if ((m = value.match(/^Hai raccolto tutti e (\d+) i frutti del campo\. Complimenti!$/))) return locale === "ja" ? `畑の${m[1]}株をすべて収穫しました。おめでとうございます！` : `You harvested all ${m[1]} crops in the field. Congratulations!`;
    if ((m = value.match(/^Seleziona e comunica il codice (.+)\.$/))) return locale === "ja" ? `コード${m[1]}を選択してお伝えください。` : `Select and quote the code ${m[1]}.`;
    if ((m = value.match(/^(\d+)% DAL$/))) return locale === "ja" ? `収穫から${m[1]}%` : `${m[1]}% FROM THE`;
    if (value.startsWith("DAL CAMPO ·")) return value.replace("DAL CAMPO", locale === "ja" ? "畑から" : "FROM THE FIELD");
    return value;
  };

  const translate = (value) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return value;
    const result = dict[normalized] || dynamic(normalized);
    return result === normalized ? value : result;
  };

  const translateTree = (root) => {
    if (root.nodeType === Node.TEXT_NODE) {
      const parent = root.parentElement;
      if (parent && !parent.closest("script,style,noscript")) root.nodeValue = translate(root.nodeValue);
      return;
    }
    if (!(root instanceof Element || root instanceof Document)) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.parentElement?.closest("script,style,noscript")) node.nodeValue = translate(node.nodeValue);
    });
    const elements = root instanceof Element ? [root, ...root.querySelectorAll("[aria-label],[alt],[title],[placeholder]")] : [...root.querySelectorAll("[aria-label],[alt],[title],[placeholder]")];
    elements.forEach((el) => ["aria-label", "alt", "title", "placeholder"].forEach((name) => {
      if (el.hasAttribute(name)) {
        const current = el.getAttribute(name);
        const translated = translate(current);
        if (translated !== current) el.setAttribute(name, translated);
      }
    }));
  };

  document.documentElement.lang = locale;
  document.title = locale === "ja" ? "i prodotti della Natura｜CÍGNULAとINBRUMA" : "i prodotti della Natura | CÍGNULA and INBRUMA";
  document.querySelector('meta[name="description"]')?.setAttribute("content", locale === "ja"
    ? "i prodotti della Natura — 再生型農業、CÍGNULA Mini、INBRUMA dei Carbonari。"
    : "i prodotti della Natura — regenerative agriculture, CÍGNULA Mini and INBRUMA dei Carbonari.");
  document.querySelectorAll(".language-link").forEach((link) => {
    if (link.getAttribute("lang") === locale) link.setAttribute("aria-current", "page");
  });
  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.dataset.layer = button.dataset.layer.split("|").map((part, index) => index < 2 ? translate(part) : part).join("|");
  });
  translateTree(document);

  const observer = new MutationObserver((records) => records.forEach((record) => {
    if (record.type === "characterData") translateTree(record.target);
    record.addedNodes.forEach(translateTree);
    if (record.type === "attributes") translateTree(record.target);
  }));
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "alt", "title", "placeholder"] });
})();
