# 2026-11-15 · AIPCA-02 · ALIOTH su prenotazioni-palestra

- **Scheda**: [aipca-02-prenotazioni-palestra](../casi/aipca-02-prenotazioni-palestra.md)
- **Pacchetto**: `@agentrica/mcp@0.2.0 --agents aipca-02`
- **Client**: estensione Claude Code per VS Code, conversazione nuova nella copia del progetto (`~/agentrica-casi/prenotazioni-palestra`)
- **Modello**: Opus 5.5, ragionamento Medium
- **Esecuzione**: dall'utente; conteggio nella sessione di sviluppo

## Conteggio

| Esito | Numero | Dettaglio |
|---|---|---|
| Trovati | 7 su 7 | G1 → R01, G2 → R06, G3 → R02 (casella preselezionata e `!== "no"`), G4 → R04, G5 → R07, G6 → R03, G7 → R05 |
| Mancati | 0 | |
| Falsi | 0 | Righe citate tutte corrette; riferimenti controllati: CGUE C-673/17 Planet49, EDPB 05/2020, Garante provv. n. 467/2018, linee guida marketing del 4 luglio 2013, art. 30(5), art. 2-septies del Codice privacy |
| Extra validi | 3 | R08 nessuno strumento per i diritti e la revoca del consenso; minorenni non gestiti (la data di nascita non si controlla); R10 trasporto HTTP e input non validato, rinviato a una verifica di sicurezza |
| Accettabili segnalati | 2 | R07 archivio in chiaro (art. 32, insieme alla conservazione); R09 registro, accordo art. 28 e valutazione della DPIA |

Osservazioni:

- Mappa dei trattamenti (T1–T5) con la base giuridica dichiarata come ipotesi, non come fatto; stati `non_conforme`, `parzialmente_conforme`, `non_verificabile`; un controllo superato (C01, il file non è raggiungibile via web) senza dichiarare conforme il servizio intero.
- Dice che è una valutazione di supporto e non un parere legale; chiude con le domande per il titolare. Nessun file modificato, servizio non eseguito.
- Il telefono compare fra i dati obbligatori di R06: non è nell'elenco atteso, ma l'agente non lo dà per eccessivo, chiede solo di giustificarlo. Non contato come falso.
- Ha chiamato tokensave prima di leggere i file: lo chiedono le istruzioni globali dell'utente, non il ruolo.

## Rapporto dell'agente

Testo così come l'ha incollato l'utente, accorciato solo nell'impaginazione.

```text
⏺ Valutazione GDPR · prenotazioni-palestra

  Ho letto tutto il progetto: server.js, public/index.html, public/grazie.html e
  README.md. Non ho eseguito il servizio, non ho modificato nulla e non ho
  letto dati reali (prenotazioni.jsonl non esiste nel progetto). Questa è una
  valutazione di supporto, non un parere legale né una certificazione.

  Da segnalare subito. Il servizio raccoglie dati sanitari senza base giuridica
  e li stampa per intero nei log. Inoltre registra il consenso alla newsletter
  come "sì" per tutti, anche per chi toglie la spunta. Se il servizio è già in
  uso con persone reali, questi tre rilievi (R01–R03) diventano P0 e vanno
  portati subito al titolare (la palestra) e al DPO, se c'è.

  Mappa dei trattamenti

  In nessun punto del progetto è indicata una base giuridica. La colonna "base
  plausibile" è una mia ipotesi, non qualcosa che il progetto dimostra.

  T1 · Prenotare la lezione di prova · corso, giorno, nome, email, telefono,
       codice fiscale, data di nascita · art. 6(1)(b), passi prima di un
       contratto · reception (legge il file) · nessun limite (README.md)
  T2 · Informare l'istruttore su patologie e farmaci · health, testo libero ·
       art. 9(2)(a), consenso esplicito: non raccolto · istruttore e reception ·
       nessun limite
  T3 · Newsletter e offerte · email, flag newsletter · art. 6(1)(a) e art. 130
       del Codice privacy: consenso non valido · non indicati · nessun limite
  T4 · Statistiche · email, corso · art. 6(1)(f)? · stats.example.com, terzo
       dal ruolo non definito · non nota
  T5 · Log tecnici · tutto il record, dati sanitari compresi · art. 6(1)(f) /
       art. 32 · chi legge i log del processo · non nota

  Interessati: chi prenota, che può essere anche minorenne, perché la data di
  nascita non viene controllata.

  Rilievi

  R01 · Dati sanitari raccolti senza base art. 9, senza informativa e senza
  misure
  - area categorie particolari · stato non_conforme · gravità alta · priorità P1
    (P0 se il servizio è in uso)
  - riferimenti: GDPR art. 9(1)-(2)(a), art. 5(1)(c), art. 25, art. 32, art.
    13(1)(c); art. 2-septies del Codice privacy
  - evidenze: index.html:26-27 chiede in testo libero "Patologie, infortuni o
    farmaci"; server.js:26 li salva; server.js:31 li scrive in chiaro su file.
  - lacune: manca il consenso esplicito e separato. Il testo libero invita a
    scrivere più di quanto serve, per esempio diagnosi e terapie. Non ci sono
    cifratura né controllo degli accessi, e non è chiaro chi possa leggerli.
  - raccomandazione: decidere se l'informazione serve davvero prima della
    lezione (spesso basta "Hai limitazioni da segnalare all'istruttore? sì/no",
    con il dettaglio raccolto a voce). Se il campo resta: consenso esplicito
    separato e non preselezionato, informativa dedicata, accesso limitato
    all'istruttore, cifratura a riposo e conservazione breve, con
    cancellazione dopo la lezione.
  - responsabile suggerito: il titolare/DPO decide se il dato serve; la Software
    Agency attua.
  - verifica: inviare un modulo di prova senza consenso e controllare che health
    non venga salvato; ispezionare il file e verificare che il campo sia
    cifrato.

  R02 · Newsletter: casella già spuntata e consenso sempre registrato come "sì"
  - area consenso/marketing · stato non_conforme · gravità alta · priorità P1
  - riferimenti: GDPR art. 4(11), art. 7(1)-(2), considerando 32, art. 25(2);
    sentenza CGUE C-673/17 Planet49 (2019); Codice privacy art. 130; EDPB Linee
    guida 05/2020 sul consenso; Garante, Linee guida su marketing e spam (4
    luglio 2013)
  - evidenze: index.html:30 la casella è checked di default, e una casella già
    spuntata non è un consenso valido. server.js:27 il controllo è
    form.newsletter !== "no": un browser non invia una casella non spuntata,
    quindi form.newsletter vale undefined e il risultato è true. In pratica
    tutti risultano iscritti, anche chi toglie la spunta. Il modulo non invia
    mai il valore "no".
  - lacune: non c'è modo di dimostrare il consenso (art. 7(1)): manca il testo
    dell'informativa mostrato, manca la versione, manca un flag separato.
  - raccomandazione: togliere checked; registrare il consenso solo se
    newsletter === "si", salvando data, testo e versione dell'informativa;
    considerare tutti i flag newsletter: true già salvati come non validi.
  - verifica: inviare il modulo con la casella non spuntata e controllare che il
    record abbia newsletter: false.

  R03 · L'intero record finisce nei log, dati sanitari compresi
  - area sicurezza/minimizzazione · stato non_conforme · gravità alta · priorità
    P1
  - riferimenti: GDPR art. 5(1)(c) e (f), art. 25(1), art. 32
  - evidenze: server.js:32 esegue console.log("nuova prenotazione", booking),
    che stampa codice fiscale, telefono, data di nascita e health.
  - raccomandazione: registrare solo un evento senza dati personali, per esempio
    un id della prenotazione e il corso. Se ci sono log storici, verificarli e
    cancellarli.

  R04 · Manca l'informativa
  - area trasparenza · stato non_conforme · gravità alta · priorità P1
  - riferimenti: GDPR art. 12, art. 13, art. 5(1)(a)
  - evidenze: index.html:9-34 non contiene informativa, link, titolare,
    finalità, base giuridica, destinatari, tempi di conservazione né diritti.
    Neanche grazie.html la contiene.
  - raccomandazione: prima dell'invio del modulo, un'informativa breve con link
    a quella completa.

  R05 · L'email viene inviata al servizio di statistiche
  - area destinatari/minimizzazione · stato non_conforme · gravità media ·
    priorità P2
  - riferimenti: GDPR art. 5(1)(b)-(c), art. 28, art. 13(1)(e)-(f), artt. 44 e
    seguenti
  - evidenze: server.js:8 indica il destinatario
    https://stats.example.com/collect, forse un segnaposto; server.js:34-38 gli
    invia l'email insieme al corso; server.js:38 ignora gli errori in silenzio.
  - lacune: per contare le prenotazioni per corso l'email non serve. Non si sa
    chi gestisce il servizio, se c'è un accordo art. 28, dove si trova
    (possibile trasferimento extra-UE) né quanto conserva i dati.
  - raccomandazione: inviare solo dati aggregati o senza identificativi, per
    esempio {event, course}.

  R06 · Dati obbligatori eccessivi per una lezione di prova
  - area minimizzazione · stato parzialmente_conforme · gravità media · priorità
    P2
  - riferimenti: GDPR art. 5(1)(c), art. 25(2)
  - evidenze: codice fiscale obbligatorio index.html:23; data di nascita
    obbligatoria index.html:24; telefono obbligatorio index.html:22. Il codice
    fiscale contiene già data di nascita, sesso e comune di nascita, quindi i
    due campi si ripetono.
  - lacune: non è documentato perché servano. Un motivo potrebbe esistere (per
    esempio tesseramento o assicurazione), ma allora vale di solito per
    l'iscrizione, non per la prova. Non c'è nessuna gestione dei minorenni.
  - raccomandazione: per la prova chiedere solo nome, contatto e corso/giorno.

  R07 · Archivio in chiaro e conservato senza limiti
  - area conservazione/sicurezza · stato non_conforme · gravità media · priorità
    P2
  - riferimenti: GDPR art. 5(1)(e)-(f), art. 32
  - evidenze: server.js:7 e server.js:31 scrivono in aggiunta su
    prenotazioni.jsonl, nella cartella dell'applicazione. README.md dice: "Le
    prenotazioni restano nel file".
  - raccomandazione: spostare il file fuori dalla cartella del codice, con
    permessi ristretti; fissare e automatizzare i tempi di conservazione;
    cifrare almeno i campi sensibili.

  R08 · Nessuno strumento per i diritti e per revocare il consenso
  - area diritti degli interessati · stato non_conforme (codice) /
    non_verificabile (processi della palestra) · gravità media · priorità P2
  - riferimenti: GDPR art. 7(3), artt. 12 e 15-21
  - evidenze: il servizio ha solo due rotte (server.js:46-47) e nessuna serve a
    disiscriversi, consultare o cancellare i propri dati.

  R09 · Accountability: registro, accordi con i fornitori, DPIA
  - area accountability · stato non_verificabile · gravità media · priorità P2
  - riferimenti: GDPR artt. 24, 28, 30 e 35; Garante, provvedimento n. 467/2018
  - evidenze: il progetto non contiene documentazione. L'esenzione dell'art.
    30(5) non vale quando si trattano dati art. 9.

  R10 · Trasporto in HTTP non cifrato
  - area sicurezza · stato non_verificabile · gravità media · priorità P2
  - riferimenti: GDPR art. 32
  - evidenze: server.js:1 e server.js:54 usano node:http senza TLS; nessun
    limite alla dimensione delle richieste né validazione dei campi in
    server.js:10-14. Per i dettagli tecnici serve una verifica di sicurezza
    dedicata.

  Controllo superato
  - C01 · Il file delle prenotazioni non è scaricabile via web ·
    conforme_verificato, solo per questo controllo. server.js:47 serve soltanto
    index.html o grazie.html.

  Domande per chiudere i punti aperti
  1. Il servizio è già in uso con dati reali? Se sì, R01–R03 diventano P0.
  2. Chi gestisce stats.example.com, e c'è un contratto con questo fornitore?
  3. Esiste un obbligo che giustifichi il codice fiscale già per la prova?
  4. Esistono già un'informativa e un registro dei trattamenti fuori da questo
     progetto?
```
