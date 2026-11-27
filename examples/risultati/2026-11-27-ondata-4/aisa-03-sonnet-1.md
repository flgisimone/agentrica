AISA-03 · ALDEBARAN — Senior Business Analyst / Functional Analyst, reparto AISA (AI Software)

Esito: analisi in sola lettura di richieste/resi.md, README.md e db/migrations/ (001-004) nella copia aisa-03-4. Nulla corretto o scritto. La bozza non è pronta per lo sviluppo: 4 contraddizioni, 6 ambiguità, permessi e casi limite mancanti, 3 criteri di accettazione non verificabili. Schede biblioteca non consultate (MCP, TypeScript, Node non pertinenti). AISA-01 non caricato; funzioni/resi/ non letto (fuori perimetro).

CONTRADDIZIONI
- P1 R2 vs R5 (vs R4): l'importo ha due fonti (negozio lo indica, R5 lo calcola, magazzino lo corregge). Un importo libero permette rimborsi maggiori del pagato. Proposta: R2 il negozio sceglie riga e quantità (1..ordinata meno già resa); R5 importo calcolato dal sistema (prezzo di riga all'ordine x quantità), non modificabile dal negozio.
- P1 R3 vs R4: «viene accettato» impersonale, senza soggetto né stato; la merce rovinata non deve rientrare in giacenza vendibile. Proposta: reso nasce `richiesto`; il magazzino accetta/rifiuta (motivo obbligatorio al rifiuto); la giacenza aumenta solo alla registrazione della merce ricevuta e rivendibile.
- P1 R4 vs R5: «correggere» un importo calcolato senza regola. Proposta: il magazzino può solo ridurre, mai oltre il calcolato, motivo obbligatorio, tracciato; il negozio vede originale, rettificato e motivo.
- P1 R6 vs modello dati/prassi fiscale: «modificare la fattura originale» contraddice la nota di credito. `invoices(id, order_id, amount, issued_at)` ha un solo importo per ordine: niente tipo documento, riferimento alla fattura stornata, numerazione, IVA; modificare `amount` perde lo storico. Scelta fiscale dell'utente/amministrazione. Proposta: nota di credito collegata alla fattura, originale invariata; da confermare col commercialista.

AMBIGUITA'
- P1 R1 «entro pochi giorni dalla consegna»: N non definito; lo schema non ha data di consegna (orders: created_at, paid_at, status in pending_payment/paid/picking/shipped/cancelled; nessun `delivered`/`delivered_at`). Proposta: entro N giorni di calendario da `delivered_at`; decidere chi registra la consegna; reso ammesso solo su ordini consegnati.
- P2 motivo del reso assente (elenco chiuso: rovinata, collo sbagliato, mancante, altro+nota; foto da decidere).
- P2 reso parziale/multiplo: tetto per riga = ordinata meno già resa; un reso può avere più righe.
- P2 stati del reso (R7) non elencati; proposta richiesto -> accettato|rifiutato -> merce ricevuta -> rimborsato|chiuso, annullato finché richiesto.
- P2 «rimborso» non definito (bonifico, storno col fornitore di pagamento/webhook, nota di credito da scalare, credito sul prossimo ordine).
- P3 quantità: order_items.quantity è intero, ma la frutta si vende anche a peso; colli interi o frazionari?

PERMESSI E CASI LIMITE MANCANTI
- P1 permessi per ruolo non definiti. Proposta da confermare: shop crea e vede solo i resi dei propri ordini (users.customer_id = orders.customer_id), annulla finché richiesto, mai accesso ai resi altrui (da testare); warehouse vede tutti, accetta/rifiuta, registra merce ricevuta, rettifica con motivo; admin emette/approva nota di credito e rimborso, rettifiche oltre soglia.
- P1 idempotenza/doppio reso: doppio clic, ritentativo o due operatori devono dare una sola nota di credito, un solo rimborso, un solo aumento di giacenza.
- P2 altri casi: ordine con più fatture o rimborsi parziali; order_items.product_id ha ON DELETE CASCADE (cancellare un prodotto fa sparire la riga e il riferimento del reso); prezzo cambiato dopo l'ordine (R5 deve usare il prezzo di riga); order_items.unit_price è `real` mentre products.price e invoices.amount sono numeric (errori di arrotondamento sul denaro); ordine annullato/non pagato; reso oltre la scadenza (eccezione admin?); rifiuto contestabile?; merce arrivata diversa da quella dichiarata; concorrenza sulla giacenza con due repliche (aggiornamento atomico di products.stock); notifiche; audit trail; dati personali nelle note libere (clienti aziende con vat_number, da confermare).

CRITERI DI ACCETTAZIONE NON VERIFICABILI (P1)
- «semplice e veloce»: soggettivo. Proposta: reso aperto in al massimo 4 passi (ordine, righe e quantità, motivo, conferma) con riepilogo; soglie da confermare.
- «gestiti correttamente dal magazzino»: vago. Proposta: dato un reso `richiesto`, il magazzino accetta/rifiuta con motivo; alla registrazione della merce ricevuta e rivendibile products.stock aumenta della quantità resa, una sola volta.
- «nessun errore nelle fatture»: non dimostrabile. Proposta: per ogni reso accettato esiste una sola nota di credito collegata alla fattura, importo uguale a quello del reso, due decimali, fattura originale invariata; la somma dei resi di una riga non supera l'importo della riga.
- Mancano criteri su permessi, termine massimo, quantità massima, idempotenza; gli esempi Dato/Quando/Allora vanno scritti dopo le decisioni.

DOMANDE APERTE PER L'UTENTE
1 Quanti giorni dalla consegna e quale data conta come consegna. 2 Fattura modificata o nota di credito (conferma amministrazione/commercialista). 3 Chi decide l'importo e con quali limiti. 4 Mezzo del rimborso. 5 La merce rientra sempre in giacenza o dopo controllo. 6 Colli interi o anche peso. 7 Stati e motivi del reso. 8 Permessi di warehouse e admin.

NOTA FUORI PERIMETRO (P2): 003_sku.sql rinomina `stock` in `qty`, ma 001_init.sql crea già `qty`: la 003 fallirebbe; la 004 poi riporta a `stock` come dice il README. Non verificato eseguendo le migrazioni; serve prima di qualsiasi migrazione dei resi (Database Engineer).

LIMITI: nessun comando o test eseguito, solo analisi del testo. Lavoro su modello più piccolo: i rilievi P1 su fattura/nota di credito vanno riesaminati dal direttore AISA-01 o da un revisore su Opus prima di essere definitivi.

— AISA-03 · ALDEBARAN
