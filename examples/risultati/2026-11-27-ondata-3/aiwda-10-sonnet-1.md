AIWDA-10 · AVIOR — Senior UX Writer, reparto AIWDA (AI Web Design)

Rapporto per AIWDA-01 · CANOPUS. Revisione in sola lettura dei testi del pannello (index.html, dipendenti.html, turni.html, impostazioni.html, js/app.js) rispetto a docs/glossario.md.

LIMITI: non ho guardato le schermate PNG né eseguito il pannello (comportamenti dedotti dal codice); non ho letto le schede della biblioteca (non necessarie per il glossario). Sono un modello più piccolo di Opus: propongo il riesame del direttore per il rilievo P1 (n. 1).

TERMINI FUORI GLOSSARIO
1. P1 js/app.js:19, 46, 68: «Fatto!» unica conferma per pubblicazione, scambio, nuovo dipendente. Non dice cosa è successo né cosa segue. Proposte: r.19 «Turni pubblicati: i dipendenti ora li vedono.»; r.46 «Scambio richiesto: …» (dipende dalla regola di business, domanda 1); r.68 «Dipendente aggiunto.» Il toast dura 1,5 s (r.8), poco per frasi lunghe.
2. P2 dipendenti.html:32 «Aggiungi una risorsa» → «Aggiungi un dipendente» (risorsa vietato).
3. P2 dipendenti.html:20 «Cerca un collaboratore» → «Cerca un dipendente».
4. P2 turni.html:51 «Swap del turno» → «Scambia il turno».
5. P2 turni.html:52 «fascia 18:00–00:30» → «turno 18:00–00:30».
6. P2 impostazioni.html:24 «Nome del negozio» → «Nome del locale» (anche gli id/route /api/store, delete-store usano «store»; non visibili).
7. P2 menu di tutte le pagine (r.14) «Squadra» vs titolo «Personale» (dipendenti.html:19) vs tabella «Dipendenti» (r.23): tre nomi per la stessa pagina → «Dipendenti» ovunque.
8. P2 menu r.12–13 «Settings» e «Dashboard» in inglese (e h1 index.html:19) → «Impostazioni» e «Riepilogo». Ordine del menu anomalo: passo all'information architect.
9. P3 <html lang="en"> in tutte le pagine (r.2) → lang="it" (ipotesi: voce inglese nei lettori di schermo).

ETICHETTE E PULSANTI POCO CHIARI
10. P2 dipendenti.html:50 «Procedi» → «Aggiungi dipendente».
11. P2 turni.html:54 «OK» nel modale → «Chiedi lo scambio» (o «Scambia il turno» se immediato).
12. P2 impostazioni.html:46–48 «OK»/«No» → «Approva»/«Rifiuta», con nome accessibile distinto per riga («Approva lo scambio di Giulia R.»); intestazione vuota r.44 → «Azioni».
13. P2 impostazioni.html:32 link «Clicca qui» → «Scarica le presenze di ottobre 2026» (href="#": non promettere un download che non c'è).
14. P2 turni.html:28 «Elimina settimana» è pulsante primario accanto a «Pubblica i turni»; testo → «Elimina i turni della settimana»; peso visivo a UX/UI.
15. P3 turni.html:29 «Salva» → «Salva i turni».
16. P3 turni.html:45 legenda «● presente ● in ritardo ● assente»: se i pallini non si distinguono, la legenda non distingue nulla (non verificato sulle schermate).
17. P3 pulsanti con sola icona senza nome: ✎ 🗑 (dipendenti.html:26–28) → «Modifica Giulia R.» / «Elimina Giulia R.»; ◀ ▶ (turni.html:21, 23) → «Settimana precedente/successiva»; ⇄ (turni.html:37) → «Scambia il turno»; ✕ (turni.html:50) → «Chiudi».

MESSAGGI DI ERRORE E CONFERMA DA RISCRIVERE
18. P2 js/app.js:58 «Hai sbagliato il numero.» (dà la colpa, non dice cosa fare) → «Il telefono deve avere 10 cifre, senza spazi né prefisso. Controlla il numero e riprova.» Il campo ha solo placeholder (dipendenti.html:37).
19. P2 js/app.js:64 «Errore ${res.status}: payload non valido» (codice tecnico) → «Non siamo riusciti ad aggiungere il dipendente. I dati che hai inserito sono ancora qui: controlla i campi e riprova.» Il form.reset() a r.65 cancella i dati: modifica di codice per gli sviluppatori.
20. P2 js/app.js:86 confirm("Vuoi davvero procedere?") per «Elimina locale» → titolo «Eliminare il locale Trattoria Il Ponte?», testo «Verranno eliminati i turni e i dati dei dipendenti. L'operazione non si può annullare.», pulsanti «Elimina il locale» / «Annulla» (serve un modale: confirm non permette di cambiare i pulsanti). Conseguenza esatta: domanda 2.
21. P2 js/app.js:22–25 «Elimina settimana» senza conferma né messaggio → conferma «Elimina i turni dal 2 all'8 novembre? Non si può annullare.» e dopo «Turni della settimana eliminati.»
22. P2 js/app.js:32–34 e 69–71 errori solo in console.log; i fetch alle r.18, 23, 44, 87, 93 non controllano l'esito → «Non siamo riusciti a salvare. Controlla la connessione e riprova.»
23. P3 js/app.js:93 salvataggio automatico senza segnale (impostazioni.html:20 lo promette) → toast «Modifica salvata».
24. P3 js/app.js:12 uscita dopo 10 minuti senza avviso → avviso prima («Stai per uscire per inattività. Vuoi restare?») e frase sul login («Sei uscito perché non hai usato il pannello per 10 minuti»). Il timer non si azzera mai, diversamente dal commento a r.11 (nota per gli sviluppatori).
25. P3 dipendenti.html:20 + js/app.js:74–79: nessuno stato vuoto per la ricerca → «Nessun dipendente trovato per "mar". Prova con un altro nome.»

FORMATI INCOERENTI
26. P2 impostazioni.html:46–48 date «2026-11-07 18:00–00:30» → «sab 7 nov · 18:00–00:30»; dipendenti.html:46 placeholder «(aaaa-mm-gg)» vs r.40 «(gg/mm/aaaa)»; turni.html:22 «02/11 – 08/11» → «lun 2 nov – dom 8 nov».
27. P3 turni.html:34 giorni «Lun, Mar…» maiuscolo vs «lun, mar…» (index.html:40–46) → minuscolo.
28. P3 index.html:28–30 valori senza unità («461») → «461 ore»; importi «8.000 €» corretti, mantenere il simbolo coerente ovunque.
29. P3 index.html:90 «mercoledì 11 novembre» → «mer 11 nov»; data fissa nel testo, può invecchiare (domanda aperta).
30. P3 dipendenti.html:33, 35–47: segnaposto al posto delle etichette, asterisco nel segnaposto; 13 campi su 14 obbligatori → etichette persistenti e indicare l'unico facoltativo («Note (facoltativo)»).
31. P3 ruoli in minuscolo (dipendenti.html:26–28) vs maiuscolo (index.html:62–69): scegliere una forma.
32. P3 index.html:23 «🔔 3 scambi da approvare»: testo corretto, ma manca il link al luogo dove si approvano (impostazioni.html:41, dentro un <details> chiuso).
33. P3 impostazioni.html:28, 53 «Esporta» → «Esporta i dati»; «Zona pericolosa» → eventualmente «Eliminare il locale» (scelta di tono).
34. P3 grafici di index.html: asse tagliato a 60 non dichiarato nel titolo; due assi in € con scale diverse e legenda solo per colore; unità dei ritardi non indicata. Passo alla specialista dataviz.

DOMANDE APERTE
1. Lo scambio di turno è immediato o richiede approvazione? (rilievi 1 e 11)
2. Cosa si cancella esattamente con «Elimina locale»? (rilievo 20)
3. Il telefono accetta prefissi o spazi? La regola è \d{10}. (rilievo 18)
4. «Dashboard» e «Settings» sono scelte volute? Se sì, vanno nel glossario.

PASSAGGI: menu (8) → information architect; peso di «Elimina settimana» (14) → UX/UI; grafici (34) → dataviz; nomi accessibili e lang (9, 17) → accessibilità.

AIWDA-10 · AVIOR
