# Checkout del negozio

Il catalogo lato server contiene CÍGNULA Mini (12 €) e INBRUMA dei Carbonari (56 €). I prezzi includono la spedizione in Italia. Il checkout Stripe accetta carte. PayPal acquisisce l'indirizzo nel proprio flusso e il server controlla che la destinazione sia in Italia prima di acquisire il pagamento. Gli sconti e l'omaggio salvati nel browser si gestiscono tramite la richiesta d'ordine.

## Anteprima Vercel e sviluppo locale

Configurare le variabili in Preview, nella branch da verificare, o nell'ambiente locale. Le credenziali restano lato server.

| Variabile | Anteprima |
| --- | --- |
| CHECKOUT_ENABLED | test |
| CHECKOUT_ORIGIN | Origine esatta che si apre nel browser. Il default è VERCEL_URL su Vercel e http://localhost:4173 in locale. |
| STRIPE_SECRET_KEY | Chiave Stripe test |
| PAYPAL_MODE | sandbox |
| PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET | Credenziali dell'app Sandbox |
| CHECKOUT_SIGNING_SECRET | Stringa casuale di almeno 32 caratteri, distinta dalla produzione |
| PAYPAL_WEBHOOK_ID | ID del webhook Sandbox, se si prova anche il rientro via webhook |

Il webhook PayPal è /api/paypal-webhook, con evento CHECKOUT.ORDER.APPROVED. Il checkout funziona anche tramite il rientro nel browser. Eseguire `npm test` per le verifiche con risposte simulate. In sandbox provare pagamento, annullamento, indirizzo PayPal fuori Italia, e rientro con un pagamento già acquisito.

## Produzione

Usare il progetto Vercel `bottegadiserste/iprodottidellanaturawebsite`. Impostare `CHECKOUT_ENABLED=live` e `CHECKOUT_TERMS_PATH` sul percorso pubblico effettivo delle condizioni di vendita. La funzione impone l'origine https://iprodottidellanatura.com. Inserire la chiave Stripe live, oppure le credenziali dell'app PayPal live, `PAYPAL_MODE=live`, un segreto di firma dedicato e l'ID del webhook live. I due metodi sono attivabili separatamente. Dopo aver modificato le variabili fare redeploy e controllare che /api/checkout esponga solo i metodi attesi.

PayPal live richiede il webhook https://iprodottidellanatura.com/api/paypal-webhook con evento CHECKOUT.ORDER.APPROVED. Il rientro del browser e il webhook verificato condividono la stessa chiave di idempotenza per l’acquisizione.

Gli ordini pagati sono gestiti manualmente dai pannelli dei gestori. Su Stripe controllare i dettagli della sessione Checkout, le righe d’ordine e l’indirizzo di spedizione. Su PayPal verificare la transazione acquisita e i dettagli dell’ordine. Configurare le ricevute/avvisi del gestore e il processo di conferma e spedizione dell’azienda. Il sito non invia email d’ordine e non prenota le giacenze.
