# Audit e rifinitura — 11 ottobre 2026

Metodo: audit manuale secondo Impeccable (audit, polish, craft-floor). Launcher non disponibile; nessun detector automatico eseguito. Il linguaggio esistente — carta, inchiostro, giallo, blu e illustrazioni — è l'autorità visiva.

## Problemi e interventi
- Priorità alta: raccolta e distribuzione non completabili da tastiera. Aggiunti movimento con frecce, selezione delle piante, Invio/Spazio, raccolta combinata con Maiusc e indicatore visibile.
- Priorità alta: focus non uniforme. Aggiunto focus visibile ai controlli, contrastato sul canvas e istruzioni associate accessibili, tradotte.
- Priorità media: musica 40×36 e chiusura 46×46 con bordi adiacenti. Unificati in gruppo, icone SVG centrate, controlli 44×44 e distanza 8 px; adattamento compatto per schermi bassi.
- Priorità media: animazioni decorative ignoravano riduzione movimento. Limitate animazioni e fermato il rendering quando la pagina è nascosta.
- Priorità media: gerarchia e ritmo delle schede. Rifiniti interlinea, titoli e cifre tabulari.
- Priorità media: immagini sotto la prima schermata caricate subito. Aggiunti caricamento differito e decoding asincrono; priorità alta all'immagine iniziale. DPR canvas limitato a 2.

## Evidenze
Contrasti misurati: inchiostro/carta 16,19:1; inchiostro/giallo 12,78:1; blu/carta 6,97:1.
Verifica sintattica JavaScript e test mirato dei controlli tastiera riusciti. Audit desktop effettuato. Regole responsive controllate nel codice; verifica visiva mobile e intero percorso di gioco da completare.

## Valutazione manuale provvisoria (0–4)
| Area | Prima | Dopo |
|---|---:|---:|
| Accessibilità | 2 | 3 |
| Prestazioni | 2 | 3 |
| Responsive | 2 | 2 |
| Coerenza visiva | 3 | 3 |
| Integrità del prodotto | 3 | 3 |

Il risultato conserva il carattere illustrato e non modifica le dimensioni del campo. Non costituisce certificazione WCAG né garanzia di assenza di difetti.
