AIBPD-05 · ALGIEBA — Senior Business Analyst & Requirements Strategist, reparto AIBPD (AI Business & Product Development)

# Revisione dei requisiti: abbonamento settimanale «Orto in Box» (requisiti.md, v0.3 bozza)

Analizzato: `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/9246e669-5e3d-40d5-8d76-e41f06314a00/scratchpad/runs/aibpd-05-requisiti-abbonamenti-haiku-1/requisiti.md` e il README della stessa cartella (progetto dichiarato di prova: servizio, azienda e numeri inventati). Nessuna fonte esterna consultata.

## Sintesi

Il documento ha un obiettivo e un perimetro di partenza chiari, ma non è pronto per il design. Ci sono due contraddizioni sulle sospensioni e sul momento dell'addebito, prezzi e sconto non sono definiti, US-04 (disdetta) non ha alcun criterio di accettazione, e mancano le regole per pagamenti falliti, fatturazione e notifiche. NF2 non è verificabile. Non ho trovato rilievi P0. I rilievi P1 vanno chiariti prima del design. Prezzi, sconto, scadenze e regole di recesso sono decisioni del management: qui le indico come proposte.

## Contraddizioni

- **C1 · §3 R2 vs R3 · P1.** R2 dice che l'utente può sospendere «in qualsiasi momento»; R3 fissa il giovedì come scadenza per la sospensione. Non è chiaro cosa succede a una richiesta fatta dal lunedì al mercoledì, cioè dopo l'addebito della settimana in corso.
  *Proposta:* distinguere due casi. (a) Sospensione di settimane specifiche (US-02), con scadenza giovedì come in R3. (b) Sospensione dell'intero abbonamento, se prevista, con regola propria da decidere. Scrivere in R2 la scadenza applicata a ciascun caso.

- **C2 · §3 R1, R3, US-02 · P1.** R1 fissa l'addebito al lunedì, ma non dice quale settimana viene addebitata né il giorno di consegna. US-02 dice «non viene addebitato» senza indicare quale lunedì viene saltato.
  *Proposta:* in R1, «Ogni lunedì il sistema addebita la box della settimana in corso (da lunedì a domenica), consegnata il giorno [X]». Definire anche il fuso orario del cutoff.

- **C3 · US-03 vs R3 · P1.** US-03 presuppone un cutoff «prima del giovedì» per il cambio di box, ma R3 lo applica solo alle sospensioni. Il cambio non ha una scadenza dichiarata, né si dice se il cambio vale dal lunedì successivo di addebito.
  *Proposta:* stabilire la scadenza del cambio (uguale a R3 o diversa) e scriverla in R3 o in una nuova regola.

- **C4 · R4 vs R1 · P1.** Lo sconto del 10% vale per gli «abbonamenti lunghi», ma R1 prevede un rinnovo settimanale. Non è chiaro se «lungo» significa durata minima, impegno o pagamento anticipato, né su quale base si applica lo sconto (prezzo della box, totale, prima settimana).
  *Proposta:* definire «abbonamento lungo» (durata in settimane e vincolo) e la base dello sconto, con un esempio numerico. La regola va confermata dal management.

## Ambiguità

- **A1 · §1 Metrica · P2.** «Aumentare la retention» non ha definizione, baseline, obiettivo numerico né periodo di misura. È l'unico KPI dichiarato.
  *Proposta:* «Aumentare la quota di clienti attivi dopo N settimane dall'attivazione, da [baseline] a [obiettivo] entro [data]». I valori li fissa il business; non li stimo io.

- **A2 · §2 Perimetro · P2.** «Indirizzo di consegna a Milano» non dice se si intende il comune o l'area metropolitana, né come si verifica (CAP, indirizzo normalizzato, elenco di vie).
  *Proposta:* definire l'area per CAP o per elenco comuni e il metodo di verifica.

- **A3 · §2 «box piccola e grande» · P2.** Le dimensioni non sono definite: contenuto, peso, numero di porzioni, prezzo.
  *Proposta:* una scheda per dimensione con contenuto indicativo e prezzo (da confermare).

- **A4 · Terminologia · P2.** Sono usati termini diversi per lo stesso concetto: «cliente» (US) e «utente» (R2); «sospendere» (R2), «sospensione» (R3, US-02), «vacanza» (US-02) e «disdire» (US-04); «dimensione» e «box grande/piccola». «Settimana» e «consegna» non sono definite.
  *Proposta:* un glossario con 6–8 termini fissi, da usare in tutto il documento e nei testi della UI (la UX writer lo riprenderà).

- **A5 · R5 e NF2 · P2.** R5 fissa Firebase Cloud Messaging, che è una scelta tecnologica e non un requisito. Non dice quali eventi generano notifiche (conferma, promemoria del cutoff, consegna in arrivo, pagamento fallito) né se la conferma di US-01 via email è un canale diverso. NF2 parla di «app» senza dire se sia nativa, PWA o web.
  *Proposta:* scrivere un requisito funzionale per evento e canale; trattare FCM come vincolo da confermare con la Software Agency.

- **A6 · NF1 · P2.** «Le pagine dell'abbonamento» non sono elencate. Il metodo di misura (strumento, dispositivo, numero di campioni, periodo) non è indicato.
  *Proposta:* elencare le pagine (attivazione, calendario sospensioni, cambio box, disdetta) e definire il metodo di misura.

## Lacune

- **L1 · Prezzi · P1.** Non ci sono prezzi per piccola e grande, né prezzo dell'abbonamento lungo, né regole per il cambio di prezzo. Il prezzo è necessario per US-03 («al prezzo della grande») e per R4. Richiede approvazione umana.

- **L2 · Pagamenti falliti e carta scaduta · P1.** Non c'è nessuna regola per addebito rifiutato o carta scaduta: numero di tentativi, cosa succede a box, abbonamento e notifiche, come il cliente aggiorna la carta.

- **L3 · Fatturazione · P1.** Non sono previste ricevute o fatture per ogni addebito settimanale, né i dati di fatturazione del cliente. Va verificato con il business e un commercialista quali documenti sono obbligatori: non lo stabilisco io.

- **L4 · Disdetta (US-04) · P1.** Non ci sono criteri di accettazione. Restano aperti: effetto immediato o a fine settimana già pagata; sorte dell'addebito in corso; rimborso; sorte delle sospensioni programmate; conferma al cliente. Per contratti a distanza con consumatori può esistere un diritto di recesso: va verificato con consulenza legale.

- **L5 · Privacy preliminare · P1.** Il documento tratta indirizzo, email, carta, token push e storico di sospensioni, e usa un fornitore terzo per le notifiche (FCM). Prima del design serve la valutazione della Privacy & Compliance Agency (base giuridica, conservazione, trasferimenti fuori dallo SEE, delega del pagamento al provider).

- **L6 · Operatività · P2.** Mancano il processo di preparazione e ordine ai fornitori, il cutoff per la preparazione e gli stakeholder interni (staff logistico, amministrazione). Nessuna US copre il lato operativo.

- **L7 · Sospensioni · P2.** Non si dice il numero massimo o minimo di settimane, se si possono sospendere settimane passate, se le settimane sospese si recuperano.

- **L8 · Zona · P2.** Non si dice cosa accade se il cliente cambia indirizzo e passa fuori Milano con un abbonamento già attivo.

- **L9 · Gestione account · P2.** Non ci sono requisiti per cambiare metodo di pagamento, cambiare indirizzo o consultare lo storico.

- **L10 · Accessibilità · P2.** Non ci sono requisiti di accessibilità. Vanno definiti con la Web Design Agency (WCAG 2.2 AA è un riferimento ragionevole da confermare).

- **L11 · Composizione della box · P3.** «Verdura di stagione»: non è detto chi decide il contenuto, come viene comunicato, né se ci sono varianti per allergie o preferenze. Può essere fuori ambito in questa versione.

- **L12 · Tracciabilità · P2.** R1–R5 e NF1–NF2 non sono collegati alle US. Non ci sono KPI oltre alla retention. Il documento non ha un decision log.

## Criteri non verificabili

- **V1 · US-01, criterio 1 · P1.** «La prima consegna è indicata con la data»: non si dice come si calcola la data né da quale orario di conferma. «Riceve un'email di conferma»: entro quanto tempo.
  *Proposta:* «Dato un cliente con indirizzo a Milano e carta valida, quando conferma entro [giorno/ora] la box grande, allora l'abbonamento è attivo, la prima consegna è indicata con la data di [giorno] della settimana successiva e l'email arriva entro [N] minuti.»

- **V2 · US-01, criterio 2 · P2.** «Vede che la consegna non è disponibile nella sua zona»: il messaggio non è specificato, né si dice che non viene creato alcun record.
  *Proposta:* «... il sistema mostra il messaggio [testo approvato], non crea l'abbonamento e non registra alcun addebito.»

- **V3 · US-02 · P2.** «Sceglie le settimane» non dice limiti. «Non viene addebitato» non indica l'importo né il lunedì. Manca un esempio con date.
  *Proposta:* aggiungere un esempio concreto (abbonamento attivo, sospensione confermata giovedì per la settimana successiva, nessun addebito quel lunedì, ripresa il lunedì seguente) e i limiti in L7.

- **V4 · US-03 · P2.** Il criterio copre solo il passaggio da piccola a grande. Manca il passaggio inverso. «Prima del giovedì» non dice se il giovedì è incluso né a che ora. «Al prezzo della grande» non indica l'importo.
  *Proposta:* due criteri (piccola→grande, grande→piccola), con scadenza esplicita e prezzo di riferimento da L1.

- **V5 · US-04 · P1.** Non ha criteri di accettazione. Vedi L4.

- **V6 · R4 · P2.** «Sconto del 10%» è verificabile solo dopo aver definito la base e la durata (C4).

- **V7 · NF1 · P2.** La soglia di 2 secondi al 95° percentile su 4G è misurabile, ma serve definire le pagine e il metodo (A6).

- **V8 · NF2 · P2.** «Veloce e facile da usare» non è verificabile e ripete NF1 sulla velocità. Proposta: «Un nuovo cliente completa US-01 senza assistenza in al più [N] minuti, con successo in almeno [X]% delle prove su [Y] utenti, e il flusso rispetta WCAG 2.2 AA.» I valori li decide il business.

- **V9 · Obiettivo (§1) · P2.** «Aumentare la retention» non è verificabile (A1).

## Decisioni da prendere (non prese da me)

- D1 · Prezzi della box piccola e grande, prezzo dell'abbonamento lungo e sconto del 10% (management).
- D2 · Scadenze: giorno di consegna, cutoff per sospensioni e cambio box, fuso orario (business e logistica).
- D3 · Sospensione dell'intero abbonamento: prevista sì o no (C1).
- D4 · Regole di disdetta e rimborso (L4, con consulenza legale).
- D5 · Canali e eventi di notifica; FCM confermato o no (business, con Software Agency).
- D6 · Obiettivo numerico della retention e baseline (A1).
- D7 · Ambito di questa versione: fatturazione, gestione pagamenti falliti e lato operativo entrano o no (L2, L3, L6).

## Informazioni mancanti

- Dati di vendita attuali: quanti clienti ordinano una box alla volta, frequenza, retention oggi (per la baseline).
- Prezzi attuali delle box singole (per coerenza con l'abbonamento).
- Fornitore di pagamento e fornitore di notifiche previsti.
- Forma dell'app (nativa, PWA, web).
- Processo di preparazione e calendario dei fornitori.

## Handoff proposti

- **Privacy & Compliance Agency:** trattamenti (indirizzo, email, carta, token push, storico sospensioni), fornitori (pagamento, FCM, email), conservazione e base giuridica. Prima del design (L5).
- **Web Design Agency:** flussi di US-01–US-04, messaggio di zona non disponibile, stati di sospensione e disdetta, accessibilità (L10, V8).
- **Software Agency:** FCM, job di addebito e cutoff, gestione dei pagamenti falliti, requisiti della fatturazione (dopo le decisioni D1–D7).
- **Business & Financial Analyst:** prezzi, sconto, margini e scenari di retention (D1, D6).

## Limiti

Ho analizzato solo il testo di requisiti.md e del README. Non ho verificato norme né dati di mercato. I punti legali e fiscali (recesso, fatturazione) vanno confermati da un professionista. Questo rapporto non approva nulla: le decisioni restano all'utente.

— ALGIEBA (AIBPD-05)
