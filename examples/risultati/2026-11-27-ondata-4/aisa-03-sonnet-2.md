AISA-03 · ALDEBARAN — Senior Business Analyst / Functional Analyst, reparto AISA (AI Software)

Rapporto per AISA-01 · SIRIUS. Ho analizzato in sola lettura `richieste/resi.md`, `README.md` e `db/migrations/001..004` nella copia aisa-03-1. Non ho consultato le schede della biblioteca perché nessuna tocca il tema. Non ho caricato AISA-01: in questa prova il rapporto va direttamente al chiamante. Non ho corretto né scritto nulla.

**Esito:** la bozza non è pronta per lo sviluppo. Ho trovato 4 rilievi P1, 7 P2 e 2 P3, più le domande aperte in fondo.

## Rilievi

**P1 · R6 contraddice lo schema: «modificare la fattura originale»**
- Evidenza: `002_orders.sql` definisce `invoices(order_id, amount, issued_at)` senza stato di emissione, numero fattura, né un collegamento a una nota di credito.
- Problema: modificare l'importo di una fattura già emessa è in genere incompatibile con le regole fiscali. Di solito si emette una nota di credito. Questo è anche il rischio dietro «Nessun errore nelle fatture».
- Il requisito non dice se la fattura sia già emessa, inviata o registrata, né chi la emette.
- Riformulazione proposta di R6: «Accettato il reso, il sistema registra una rettifica a credito collegata alla fattura dell'ordine (importo, motivo, data) senza alterare la fattura originale. Emissione e formato della nota di credito sono da definire con l'amministrazione.»
- Serve una decisione di business e fiscale dell'utente. Non la presumo.

**P1 · R1 «entro pochi giorni dalla consegna» non è verificabile e il dato non esiste**
- Evidenza: `orders.status` ammette `pending_payment, paid, picking, shipped, cancelled`. Non esiste uno stato «consegnato» né una data di consegna (ci sono solo `created_at` e `paid_at`). `shipped` indica la spedizione, non la consegna.
- Problema: «pochi giorni» non ha un valore e non è chiaro da quale evento decorra.
- Riformulazione proposta: «Il negozio può aprire un reso su un ordine in stato `shipped` entro N giorni dalla [data di consegna | data di spedizione]. N e l'evento di partenza sono da confermare.» Se serve la consegna, va aggiunto un dato che oggi manca.
- Aggiungere almeno la regola per gli ordini `cancelled`, `pending_payment`, `paid` e `picking`: non si rendono.

**P1 · R2 e R5 si contraddicono sull'importo, e R4 lo conferma**
- R2 fa indicare l'importo al negozio. R5 lo calcola dal prezzo della riga per la quantità. R4 permette al magazzino di correggerlo.
- Non è chiaro chi decida l'importo: il sistema, il negozio o il magazzino. Il negozio non dovrebbe poter indicare un importo libero.
- Riformulazione proposta di R2: «Il negozio sceglie la riga e la quantità da rendere, più un motivo.» Di R5: «L'importo è calcolato dal sistema come `unit_price` della riga × quantità resa.» Di R4: da riformulare dopo la risposta sulle domande 2 e 3.
- Aspetti non coperti: IVA, sconti di riga o d'ordine, e quale prezzo vale se il listino è cambiato (è nella riga `order_items.unit_price`, da usare).
- Il tipo di `unit_price` è `real` (virgola mobile), mentre `invoices.amount` e `orders.total` sono `numeric`. Il calcolo in R5 accumulerebbe errori di arrotondamento, e «nessun errore nelle fatture» non reggerebbe. Va usata una regola di arrotondamento esplicita, e la scelta del tipo va confermata con l'utente e con AISA-02 o il database engineer.

**P1 · R3 «accettato e la merce torna in giacenza»: manca chi accetta, e il rientro non è sempre corretto**
- «Il reso viene accettato» non dice da chi né con quale criterio. La passiva nasconde l'attore.
- Il rientro automatico in giacenza è sbagliato per la merce rovinata, che è proprio l'esempio del contesto: la frutta rovinata non può tornare vendibile.
- Riformulazione proposta: «Il magazzino esamina il reso e lo accetta, lo accetta in parte o lo rifiuta. Alla ricezione registra la quantità effettivamente tornata e per ciascuna quota decide se rientra in giacenza (`products.stock`, nome della colonna dopo la 004) o è scartata.»
- Manca anche l'ordine delle operazioni: il rimborso (R6) deve avvenire prima o dopo la verifica della merce?

**P2 · Permessi e ruoli non definiti**
- Il README ha tre ruoli (`shop`, `warehouse`, `admin`). La richiesta ne cita solo due.
- Da specificare:
  - chi può aprire un reso: solo `shop`, solo per i propri ordini, con `users.customer_id` come legame;
  - chi può correggere l'importo: `warehouse` (R4) oppure solo `admin`. Oggi «i prezzi li cambia solo `admin`», quindi la correzione dell'importo da parte del magazzino è un'eccezione da esplicitare;
  - chi emette la rettifica contabile (R6): `admin`?
  - chi può vedere i resi di chi: un `shop` vede solo i suoi (R7), `warehouse` e `admin` vedono tutti?
- Riformulazione proposta: aggiungere una matrice ruolo per azione (apri, annulla, accetta, correggi, emetti rettifica, consulta).
- Un utente `shop` con `customer_id` nullo (la colonna è facoltativa) non ha negozio: caso da definire.

**P2 · Casi limite mancanti sulla quantità**
- Nessun limite alla quantità resa: non deve superare quella ordinata (`order_items.quantity`) meno quanto già reso.
- Resi multipli e parziali sulla stessa riga, due resi aperti insieme, o lo stesso reso inviato due volte (doppio clic): non coperti.
- Quantità zero o negativa. Righe con prodotto cancellato (`product_id` ha `ON DELETE CASCADE`: se si elimina un prodotto spariscono le righe, e con loro la base di calcolo di R5; da segnalare).
- Riformulazione proposta: «La somma delle quantità rese su una riga non può superare la quantità ordinata.»

**P2 · Stati del reso e transizioni non definiti (R7)**
- R7 parla di «stato», ma gli stati non sono elencati. Proposta da confermare: `aperto`, `in verifica`, `accettato`, `accettato in parte`, `rifiutato`, `rimborsato`, `annullato`.
- Mancano: chi può passare da uno stato all'altro, se il negozio può annullare un reso aperto, e se un reso rifiutato si può riaprire.
- R7 non indica cosa mostrare oltre allo stato (importo, motivo, motivazione del rifiuto) né ordinamento o filtri. L'elenco deve mostrare solo i resi del proprio negozio.

**P2 · Il rimborso reale non è trattato**
- Il contesto parla di «correggere a mano la fattura», quindi il risultato è una rettifica contabile. Non è detto che il rimborso sia un pagamento: potrebbe essere un credito sulle fatture successive.
- Il README cita i pagamenti online con un fornitore che avvisa via webhook. Per un reso su ordine già pagato mancano le regole: rimborso sul metodo di pagamento originale o credito, e come si gestisce un ordine non ancora pagato (`paid_at` nullo).
- Domanda aperta, vedi sotto. Non propongo una soluzione.

**P2 · Motivo e prove del reso assenti**
- Il contesto cita «frutta rovinata, colli sbagliati» ma nessun requisito registra il motivo. Senza motivo il magazzino non può decidere né l'amministrazione contestare.
- Non è detto se servano foto o note del negozio: da decidere. Se si caricano immagini si apre un tema dati e conservazione da sottoporre a AIPCA (privacy), anche se i dati sono finti nel progetto di prova.
- Riformulazione proposta: «Il reso richiede un motivo scelto da un elenco (rovinata, collo sbagliato, altro) e una nota facoltativa.»

**P2 · Concorrenza e coerenza (due repliche)**
- Il README descrive due repliche dietro un bilanciatore. Due operatori possono accettare o correggere lo stesso reso insieme, oppure la correzione dell'importo (R4) può incrociarsi con l'accettazione.
- Manca una regola: ultima scrittura vince o conflitto segnalato. Va aggiunta ai requisiti di integrità, con la verifica delle transizioni di stato.

**P2 · Tracciabilità e notifiche mancanti**
- Nessun requisito su storico delle correzioni di R4 (chi, quando, valore precedente, perché), né su notifiche al negozio quando il magazzino cambia l'importo o rifiuta.
- Una correzione dell'importo senza che il negozio ne sia informato produce contestazioni.
- Riformulazione proposta: «Ogni cambio di importo o di stato registra utente, data, valore precedente e motivazione obbligatoria. Il negozio vede la correzione e il motivo.»

**P3 · Criteri di accettazione non verificabili**
- «Semplice e veloce»: nessuna misura. Proposta: numero massimo di passaggi o di campi, tempo per aprire un reso (ad esempio «apribile da un ordine in non più di N clic»), da confermare con il responsabile commerciale.
- «Gestiti correttamente dal magazzino»: non si può verificare. Proposta: elencare scenari con esito atteso, per esempio «un reso di 3 su 5 colli accettato in parte produce una rettifica pari a 3 × `unit_price` e rientro in giacenza solo per i colli integri».
- «Nessun errore nelle fatture»: non testabile così. Proposta: «Per ogni reso accettato, l'importo della rettifica è uguale a somma(quantità resa × `unit_price` della riga), arrotondato a due decimali; la somma delle rettifiche di un ordine non supera l'importo dell'ordine.»

**P3 · Priorità e perimetro mancanti**
- La bozza non distingue obbligatorio da desiderabile (MoSCoW o P0-P3) né dichiara cosa resta fuori (cambio merce, resi senza ordine, resi di ordini vecchi, reso totale dell'ordine, rimborso anticipato).
- Nessun volume atteso: i dati dicono 2.500 ordini al giorno ma non quanti resi si prevedono.

## Dati e domande aperte da confermare con l'utente

1. La fattura è già emessa e registrata al momento del reso, o è ancora una bozza? Si emette una nota di credito? Chi la firma?
2. Chi decide l'importo e con quali limiti? Il negozio non lo indica più (R2 va riformulato).
3. Da quando partono i «pochi giorni» (consegna o spedizione) e quanti sono? Se serve la consegna, si aggiunge un dato che oggi non c'è.
4. Rimborso come credito sulle fatture future, come pagamento al fornitore, o solo correzione contabile? Cosa vale per ordini non ancora pagati?
5. Il magazzino può rifiutare un reso o accettarlo in parte? Cosa succede alla merce rovinata?
6. Quali ruoli vedono e possono fare cosa (matrice ruolo per azione)? Un `shop` senza `customer_id` esiste?
7. Servono foto o note del negozio? Se sì, va coinvolta AIPCA prima di implementarle.
8. Il tipo `real` di `order_items.unit_price` va cambiato in `numeric` prima di fare i conti? Decisione da confermare con l'utente.
9. Notifiche al negozio e storico delle modifiche: richiesti?

**Ipotesi (non confermate, da non usare come requisiti):** stati del reso proposti sopra, rinvio del rimborso al magazzino, motivo da elenco chiuso.

**Limiti:** non ho letto `funzioni/resi/` né il codice del server, come da perimetro del compito. Se nella cartella `funzioni/resi/` esiste già una bozza di implementazione, va confrontata con questi rilievi in un secondo passaggio. Non ho eseguito test.

Firmato: AISA-03 · ALDEBARAN
