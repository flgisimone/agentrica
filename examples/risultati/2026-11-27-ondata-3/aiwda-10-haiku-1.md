AIWDA-10 · AVIOR — Senior UX Writer, reparto AIWDA (AI Web Design)

Revisione in sola lettura dei testi visibili del pannello Turnio rispetto a docs/glossario.md. Nessun file modificato.
Radice del progetto: /private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-10-5
File letti: index.html, turni.html, dipendenti.html, impostazioni.html, js/app.js, docs/glossario.md, README.md. Le schermate PNG non sono state guardate: la verifica è sul sorgente, quindi l'aspetto visivo (dimensione, contrasto, troncamenti su telefono) non è verificato.

Esito: 27 rilievi (10 P1, 12 P2, 5 P3). Nessun P0, quindi nessun avviso immediato. Diversi rilievi toccano l'accessibilità o un dato: sono marcati «rev. umana: sì».

Nota di processo: AIWDA-01 non è stato caricato perché lo strumento agent non è disponibile in questa sessione. Il rapporto è quindi consegnato direttamente al chiamante.

Riferimenti normativi e di accessibilità: ho letto le schede wcag-2-2 (verificata il 2026-11-19, da ricontrollare entro il 2027-05-19) e accessibilita-prodotti-servizi (verificata il 2026-11-21, da ricontrollare entro il 2027-05-21). I criteri 2.4.2, 2.4.4, 3.1.1, 3.3.2 e 4.1.2 non sono nelle schede: li cito dalla mia conoscenza di WCAG 2.2, senza verifica sulla fonte W3C. Il rilievo sulla lingua (3.1.1) va confermato dall'accessibilità.

## Priorità P1

| ID | Posizione | Testo attuale | Proposta | Motivo |
|---|---|---|---|---|
| AVI-01 | impostazioni.html:46-48 | «OK» / «No» (pulsanti degli scambi) | «Approva» / «Rifiuta» | Il pulsante deve dire l'azione con un verbo (glossario). È il compito più frequente (scambi). Conf. 0.9 |
| AVI-02 | turni.html:51-54 e app.js:46 | «Swap del turno»; «fascia 18:00–00:30»; «Collega»; pulsante «OK»; toast «Fatto!» | Titolo «Scambio del turno»; «turno 18:00–00:30»; etichetta «Collega che prende il turno»; pulsante «Chiedi lo scambio»; toast «Richiesta di scambio inviata.» | «Swap» e «fascia» sono nella colonna «Da non usare» del glossario. Da confermare se il pulsante chiede lo scambio o lo approva direttamente. Conf. 0.9 |
| AVI-03 | impostazioni.html:32 | link «Clicca qui» (esporta le presenze) | «Scarica le presenze di [mese]», con il mese scelto nel menu accanto | Il testo del link non dice cosa succede: il compito 4 (esportazione mensile) dipende da questo link. WCAG 2.4.4 (livello A). Rev. umana: sì. Conf. 0.8 |
| AVI-04 | js/app.js:86 | confirm «Vuoi davvero procedere?» prima di «Elimina locale» | «Eliminare il locale «Trattoria Il Ponte»? [cosa viene cancellato] [se è irreversibile]» | Azione distruttiva senza dire cosa perde l'utente. Le conseguenze non sono nel progetto: vanno definite dal prodotto. Rev. umana: sì. Conf. 0.8 |
| AVI-05 | js/app.js:58; dipendenti.html:37 | errore «Hai sbagliato il numero.»; placeholder «Telefono *» | Errore: «Il telefono deve avere 10 cifre, senza spazi. Esempio: 3331234567.» Placeholder: «Telefono (10 cifre) *» | Dà la colpa all'utente (vietato dal glossario) e non dice cosa correggere. Incoerenza: la tabella mostra i numeri con spazi («333 120 4455», dipendenti.html:26-28) ma il controllo li rifiuta. Conf. 0.9 |
| AVI-06 | js/app.js:64-65 | «Errore 400: payload non valido» e `form.reset()` | «Non siamo riusciti a salvare il dipendente. Controlla i dati e riprova.» | Codice tecnico e gergo («payload»), vietati dal glossario. `form.reset()` cancella tutti i dati inseriti senza avvisare: segnalo al reparto software. Conf. 0.9 |
| AVI-07 | turni.html:21, 23, 37 (⇄), 50 (✕); dipendenti.html:26-28 (✎, 🗑) | pulsanti con solo il simbolo | Nomi accessibili: «Settimana precedente», «Settimana successiva», «Chiedi uno scambio per questo turno», «Chiudi», «Modifica [nome]», «Elimina [nome]» | Senza nome accessibile lo schermo-lettore non dice cosa fa il pulsante. In turni.html:50 la chiusura è uno `span`, quindi non è raggiungibile da tastiera. WCAG 4.1.2 (A). Rev. umana: sì (accessibilità). Conf. 0.8 |
| AVI-08 | `<html lang="en">` in tutte e quattro le pagine (index.html:2, turni.html:2, dipendenti.html:2, impostazioni.html:2) | `lang="en"` su pagine in italiano | `lang="it"` | Lo schermo-lettore legge il testo italiano con voce inglese. WCAG 3.1.1 (A), non nelle schede. Rev. umana: sì. Conf. 0.7 |
| AVI-09 | dipendenti.html:35-48 | i campi del modulo hanno solo il placeholder (nessun `label`) | Etichette visibili sopra o accanto ai campi; il placeholder resta come esempio | Quando l'utente scrive, il placeholder sparisce e il campo non ha più un nome visibile (13 campi). Compito 3. WCAG 3.3.2 (A), non nelle schede. Rev. umana: sì. Conf. 0.7 |
| AVI-10 | index.html:52-59 e 62-69 | torta «Costo del lavoro per ruolo» con legenda 34+29+14+9+8+7+4+3 = 108% | Da correggere nei dati (non nel testo): le quote devono sommare 100% | La legenda somma a 108% e gli archi si sovrappongono (`stroke-dasharray` su `pathLength=100`). Rilievo dato-visivo: passa al ruolo di data visualization e all'utente. Rev. umana: sì. Conf. 0.9 |

## Priorità P2

| ID | Posizione | Testo attuale | Proposta | Motivo |
|---|---|---|---|---|
| AVI-11 | voce di menu su tutte le pagine (index.html:12-13, turni.html:12-13, dipendenti.html:12-13, impostazioni.html:12-13); index.html:19 | «Settings», «Dashboard» | «Impostazioni», «Cruscotto» (nome del README) | Inglese in un pannello italiano. Da confermare dall'utente. Conf. 0.9 |
| AVI-12 | impostazioni.html:24 | etichetta «Nome del negozio» | «Nome del locale» | «negozio» è nella colonna «Da non usare» del glossario (locale). Conf. 1.0 |
| AVI-13 | dipendenti.html:19, 20, 32; voce di menu «Squadra» (riga 14 su tutte le pagine) | h1 «Personale»; placeholder «Cerca un collaboratore»; h2 «Aggiungi una risorsa» | «Dipendenti»; «Cerca un dipendente»; «Aggiungi un dipendente» | «collaboratore» e «risorsa» sono vietati dal glossario. Stesso oggetto con tre nomi diversi («Squadra», «Personale», «Dipendenti»). Il nome della voce di menu è una scelta da confermare. Conf. 0.9 |
| AVI-14 | dipendenti.html:50; turni.html:29 | pulsante «Procedi»; pulsante «Salva» accanto a «Pubblica i turni» | «Aggiungi il dipendente»; per «Salva» serve sapere cosa fa (salva una bozza? non pubblica?) | «Procedi» non dice l'azione. «Salva» e «Pubblica» sono confondibili: chiedere al prodotto cosa salva. Conf. 0.8 |
| AVI-15 | js/app.js:19, 46, 68 | toast «Fatto!» (durata 1,5 s, app.js:8) | «Turni pubblicati: i dipendenti li vedono ora.»; «Dipendente aggiunto.» | «Fatto!» non dice cosa è successo; «pubblicare» nel glossario significa rendere visibili i turni. La durata di 1,5 s è breve per una frase: segnalo a design. Conf. 0.9 |
| AVI-16 | js/app.js:24; js/app.js:76-79 | settimana svuotata senza messaggio; ricerca senza risultati: «la tabella resta vuota» (commento nel codice) | Turni: «Questa settimana non ha turni.» Ricerca: «Nessun dipendente corrisponde a «[testo]».» | Stati vuoti senza spiegazione. Conf. 0.8 |
| AVI-17 | turni.html:22 | «02/11 – 08/11» | «lun 2 nov – dom 8 nov» | Il glossario chiede la forma «lun 3 feb». Conf. 0.9 |
| AVI-18 | index.html:90 | «Dati aggiornati a mercoledì 11 novembre.» | «Dati aggiornati a mer 11 nov.» | Forma data del glossario. Conf. 0.9 |
| AVI-19 | impostazioni.html:46-48 | date «2026-11-07», «2026-11-08», «2026-11-10» nella colonna «Turno» | «sab 7 nov 18:00–00:30»; «dom 8 nov 11:00–15:00»; «mar 10 nov 17:00–23:00» | Forma ISO, diversa da quella del glossario. Giorni verificati: 7 nov 2026 sabato, 8 nov domenica, 10 nov martedì. Conf. 0.9 |
| AVI-20 | impostazioni.html:44 | intestazioni «Da» / «A» | «Cede il turno» / «Lo prende» | Il senso dello scambio non si capisce dalle sole parole «Da» e «A». Conf. 0.8 |
| AVI-21 | index.html:23 | banner «🔔 3 scambi da approvare» | Aggiungere «Vedi gli scambi», con link alla sezione scambi in impostazioni.html | Il banner dice cosa c'è ma non dove agire. Scelta di struttura da confermare. Conf. 0.7 |
| AVI-22 | dipendenti.html:40 e 46 | segnaposto «Data di nascita (gg/mm/aaaa)» e «Data di assunzione (aaaa-mm-gg)» | Un solo formato per le date nello stesso modulo | Due formati diversi nello stesso modulo. Da decidere il formato unico: rev. umana: sì. Conf. 0.7 |
| AVI-23 | index.html:62-69 e 47 di dipendenti.html | legenda: Cucina, Sala, Bar, Lavapiatti, Pizzeria, Responsabili, Pulizie, Extra; menu del modulo: sala, cucina, bar (minuscolo) | Un elenco di ruoli unico, con la stessa maiuscola | Il cruscotto mostra ruoli che il modulo non permette di assegnare. Da chiarire. Conf. 0.8 |
| AVI-24 | `<title>Turnio</title>` su tutte le pagine (index.html:6, turni.html:6, dipendenti.html:6, impostazioni.html:6) | «Turnio» | «Cruscotto · Turnio», «Turni · Turnio», «Dipendenti · Turnio», «Impostazioni · Turnio» | Titolo uguale su tutte le pagine: l'utente non distingue le schede. WCAG 2.4.2 (A), non nelle schede. Rev. umana: sì. Conf. 0.7 |
| AVI-25 | js/app.js:11-12 | uscita automatica dopo 10 minuti, senza avviso | Messaggio di avviso prima dell'uscita (testo da decidere) | Chi lavora perde i dati non salvati senza avviso. Tema di usabilità, segnalato anche a quel ruolo. Rev. umana: sì. Conf. 0.7 |
| AVI-26 | dipendenti.html:44 | «Livello CCNL *» | Aggiungere un aiuto: «Contratto collettivo nazionale di lavoro» | Acronimo non spiegato (il glossario ne chiede la spiegazione per gli acronimi). Conf. 0.7 |

## Priorità P3

| ID | Posizione | Testo attuale | Proposta | Motivo |
|---|---|---|---|---|
| AVI-27 | index.html:48 e 85-88 | valori «lun 62 · mar 63…» senza unità; assi «0» e «12» dei ritardi senza unità | Unità: «62 h» e «ritardi» (da confermare); etichette degli assi con unità | Non è chiaro cosa misurano i numeri. Conf. 0.7 |
| AVI-28 | dipendenti.html:47 | opzione vuota «Ruolo *» | «Scegli il ruolo *» | Più chiaro del nome del campo ripetuto. Conf. 0.6 |
| AVI-29 | impostazioni.html:20 | «Le modifiche si salvano da sole.» | Confermare il salvataggio con un messaggio, oppure lasciare il testo così | Il codice invia la modifica al cambio del campo (app.js:92-93) ma non mostra conferma. Da verificare nel prodotto. Rev. umana: sì. Conf. 0.6 |

## Domande aperte per l'utente

1. Il nome della voce di menu: «Squadra», «Personale» o «Dipendenti»? (AVI-13)
2. «Dashboard» e «Settings»: confermi «Cruscotto» e «Impostazioni»? (AVI-11)
3. Il pulsante degli scambi chiede lo scambio al collega o lo approva subito? (AVI-02)
4. Cosa salva il pulsante «Salva» e che differenza ha da «Pubblica»? (AVI-14)
5. L'eliminazione del locale è irreversibile e cosa cancella? (AVI-04)
6. Qual è il formato unico per le date in input? (AVI-22)
7. I ruoli del cruscotto e quelli del modulo sono gli stessi? (AVI-23)

## Segnalazioni ad altri ruoli (fuori dal mio perimetro)

- Usabilità: «Elimina settimana» (app.js:22) e l'icona 🗑 dei dipendenti non chiedono conferma. Uscita automatica senza avviso (AVI-25).
- Visualizzazione dati: l'asse del grafico «Ore lavorate per giorno» va da 60 a 70 (index.html:34-39), e il commento dice che è voluto per vedere meglio le differenze. Un asse non da zero amplifica le differenze: da valutare.
- Accessibilità: AVI-07, AVI-08, AVI-09, AVI-24, e il grafico con colore come unico codice (legenda «Rosso / Verde», index.html:81).

## Limiti

- Verifica sul sorgente, non visiva. Le schermate non sono state guardate. Il link «Scarica il report» (impostazioni.html:36) e il link di esportazione (`href="#"`) non sono collegati a nulla: il testo è valutato, la funzione no.
- I criteri WCAG citati fuori dalla scheda (2.4.2, 2.4.4, 3.1.1, 3.3.2, 4.1.2) non sono stati verificati sulla fonte W3C: nessun accesso web in questa sessione.
- Non ho valutato se il decreto 82/2022 si applica a questo pannello: è un compito della scheda normativa e dell'accessibilità.

— AIWDA-10 · AVIOR
