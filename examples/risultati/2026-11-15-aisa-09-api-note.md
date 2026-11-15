# 2026-11-15 · AISA-09 · REGULUS su api-note

- **Scheda**: [aisa-09-api-note](../casi/aisa-09-api-note.md)
- **Pacchetto**: `@agentrica/mcp@0.2.0 --agents aisa-09`
- **Client**: estensione Claude Code per VS Code, conversazione nuova nella copia del progetto (`~/agentrica-casi/api-note`)
- **Modello**: Opus 5.5, ragionamento Medium
- **Esecuzione**: dall'utente; conteggio nella sessione di sviluppo

## Conteggio

| Esito | Numero | Dettaglio |
|---|---|---|
| Trovati | 6 su 6 | S1 → #1, S2 → #2, S3 → #3, S4 → #4, S5 → #5, S6 → #6 |
| Mancati | 0 | |
| Falsi | 0 | Righe citate tutte corrette (7, 18, 21-24, 38, 44-47, 51, 60-63) |
| Extra validi | 2 | #9 un solo token per tutto il team (nessuna attribuzione né revoca per persona); `204` con corpo `{}` alla riga 46 (non di sicurezza, segnalato a parte) |
| Accettabili segnalati | 2 | #7 confronto del token non a tempo costante; #8 TLS, rate limiting, intestazioni, registro |

Osservazioni:

- L'agente ha avviato il server in locale con dati finti e ha provato i rilievi con curl, dichiarando cosa ha verificato e cosa no (#5 solo statico). Nessun file modificato; ha chiesto l'ok prima di correggere.
- Il primo comando ha usato un percorso sbagliato (`agentrica/casi` invece di `agentrica-casi`) e si è corretto al passo successivo: è del modello, non del ruolo.
- La gravità mescola due scale («P0 · Critica»): non è un errore, ma il reparto non fissa una scala unica.

## Rapporto dell'agente

Testo così come l'ha incollato l'utente (impaginazione delle tabelle del terminale).

```text
⏺ Ho fatto la revisione di server.js, l'unico file sorgente. Ci sono due rilievi
  P0 da sistemare prima di esporre l'API in rete: chiunque può cancellare le
  note senza token, e con il token si può leggere qualsiasi file del server. Ho
  confermato tutti i rilievi principali avviando il server in locale (porta
  38471, poi spento) con note di prova finte.

  #1 · P0 · Critica · server.js:44-47
  DELETE /notes/:id non controlla il token. Chiunque raggiunga il servizio può
  cancellare qualsiasi nota. Gli ID sono UUID, ma GET /notes li espone a ogni
  chiamante autenticato, quindi un ex membro del team o un token trapelato
  bastano. OWASP A01 (controllo accessi).
  Verificato: ✅ senza token risponde 204 e la nota sparisce

  #2 · P0 · Critica · server.js:51
  Path traversal in /attachments. Il parametro name passa a join() senza
  controlli, quindi ?name=../server.js (o ../../…) legge qualsiasi file
  accessibile al processo. Leggendo il sorgente si ottiene anche il token.
  OWASP A01.
  Verificato: ✅ ../server.js restituito con la riga del token

  #3 · Alta · server.js:7
  Token scritto nel codice. Il token è unico e condiviso, sta in chiaro nel
  sorgente e non si può ruotare senza un nuovo rilascio. Insieme al #2,
  chiunque abbia un token valido lo vede, e lo vede anche chi legge il
  repository. OWASP A07.
  Verificato: ✅ (statico)

  #4 · Media · server.js:60-63
  Lo stack trace arriva al client su ogni errore 500. Rivela il percorso
  assoluto del server, la struttura delle cartelle e i dettagli interni. OWASP
  A05.
  Verificato: ✅ un allegato inesistente mostra ENOENT … /Users/…/allegati/nope

  #5 · Media · server.js:21-24, 38-40
  Nessun limite sulla dimensione del body e nessun limite al numero di note,
  che restano tutte in memoria. Un chiamante autenticato può esaurire la RAM
  (DoS).
  Verificato: ⚠️ solo statico, non ho fatto test di carico

  #6 · Media · server.js:24, 38
  Input non validato. JSON malformato o un body vuoto producono un 500 con
  stack trace. title e text accettano qualsiasi tipo (oggetti, numeri) e
  qualsiasi lunghezza. Se un client mostra le note come HTML, c'è un rischio di
  XSS memorizzato lato client.
  Verificato: ✅ {"title":{"a":1},"text":123} accettato; { e body vuoto danno 500

  #7 · Bassa · server.js:18
  Il token si confronta con ===, che non impiega un tempo costante: in teoria
  permette attacchi a tempo. Meglio crypto.timingSafeEqual.
  Verificato: statico

  #8 · Bassa · server.js:59-64
  Mancano HTTPS (il token viaggia in chiaro se non c'è un proxy TLS davanti),
  limitazione dei tentativi contro la forzatura del token, intestazioni di
  sicurezza (X-Content-Type-Options: nosniff, ecc.) e un registro delle
  operazioni.
  Verificato: statico

  #9 · Info · server.js:17-19
  Un solo token per tutto il team: non si sa chi ha fatto cosa, ogni membro può
  cancellare le note di tutti e non c'è un modo di revocare l'accesso a una
  sola persona. È una scelta di progetto da confermare con chi la gestisce.
  Verificato: —

  Correzioni consigliate (non applicate)

  - #1: aggiungere if (!authorized(req)) return send(res, 401, …) all'inizio del
    ramo DELETE. Ancora meglio: un controllo unico prima del router, così
    nessun nuovo endpoint resta scoperto per sbaglio.
  - #2: risolvere il percorso e verificare che resti dentro allegati/, cioè
    path.resolve(ATTACHMENTS, name) deve iniziare con ATTACHMENTS + path.sep. In
    alternativa, accettare solo path.basename(name) oppure tenere un elenco dei
    file ammessi. Rifiutare i nomi vuoti e rispondere 404 senza dettagli.
  - #3: leggere il token da process.env.API_TOKEN e bloccare l'avvio se manca.
    Il token attuale va considerato compromesso e sostituito, perché è già
    scritto nel sorgente.
  - #4: loggare err.stack solo sul server e restituire al client { "error":
    "internal error" }.
  - #5/#6: fissare un tetto al body (per esempio 16 KB, con 413 se lo supera) e
    rispondere 400 al JSON non valido. Verificare che title e text siano
    stringhe e che non superino una lunghezza massima, e porre un limite al
    numero di note.
  - #7: confrontare il token con timingSafeEqual su buffer della stessa
    lunghezza.

  C'è anche un piccolo difetto non di sicurezza alla riga 46: la risposta 204
  viene inviata con un body {}, mentre una 204 dovrebbe essere senza contenuto.

  Note

  - File modificati: nessuno, ho solo letto e testato.
  - Test eseguiti: prove con curl su localhost:38471 con dati finti, riportate
    nella colonna "Verificato". Il token non compare nell'output. Non ho fatto
    test di carico né scansioni automatiche.
  - Limiti: il progetto non è un repository Git e non ha né test né dipendenze,
    quindi non c'era nulla da controllare con npm audit. Non ho informazioni su
    come viene esposto il servizio (proxy, TLS, rete interna), e questo può
    cambiare il peso dei rilievi #8 e #9.
  - Passi successivi: la priorità è correggere #1 e #2 e sostituire il token
    (#3). Posso applicare queste correzioni minime se mi dai l'ok. Il merge e il
    rilascio restano decisioni tue.
```
