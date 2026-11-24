AISA-05 · SPICA — Senior Frontend Developer, reparto AISA (AI Software)

# Revisione read-only del frontend `web/`

**Perimetro e metodo.** Ho letto il README, `web/index.html`, `web/app.js`, `web/style.css` e, per controllare il contratto dell'API, `server/app.js`, `server/auth.js`, `server/routes/products.js`, `server/routes/orders.js` e le migrazioni in `db/migrations/`. La copia non è un repository Git, quindi lo stato Git non è disponibile. Non ci sono `CLAUDE.md` né convenzioni di progetto. Lo stack verificato è una pagina statica in JavaScript puro (modulo ES), senza framework e senza build, servita da Express 4.

In questa prova non ho caricato il direttore AISA-01 e non ho usato la biblioteca: le istruzioni lo escludevano. Nessuna scheda era comunque pertinente: le schede su TypeScript 7, MCP e Node.js non riguardano questo frontend. Non ho modificato file, non ho avviato processi e non ho eseguito test: tutti i rilievi vengono dalla lettura del codice.

Percorso base: `<cartella di prova>/copie/aisa-05-opus-medio-2/`

## Rilievi

**SPICA-01 · P1 · `web/app.js:60-64`: l'ordine sembra creato anche quando fallisce, e il carrello viene svuotato.**
Il codice non controlla `res.ok`. Con 409 (giacenza insufficiente), 400 (righe o quantità non valide, carrello vuoto), 401 o 500, la risposta è `{error: ...}`. La pagina mostra comunque «Ordine undefined creato: NaN €», poi svuota il carrello con `ordine.clear()`. L'utente crede di aver ordinato e perde le righe inserite, senza un messaggio con il motivo. Servono un ramo di errore con il testo di `body.error` e il carrello lasciato com'è.

**SPICA-02 · P1 · `web/app.js:56-66`, `web/index.html:29`: invio doppio dell'ordine.**
Durante la richiesta il pulsante «Invia l'ordine» resta attivo e non c'è nessun blocco. Un doppio clic o un secondo invio creano due ordini e scalano la giacenza due volte. Il pulsante va disattivato (o il form bloccato) fino alla risposta.

**SPICA-03 · P1 · `web/app.js:59-61`: un errore di rete lascia «Invio in corso…» per sempre.**
Non c'è `try/catch`. Se `fetch` viene rifiutata (rete assente) o `res.json()` fallisce (risposta non JSON, per esempio dal bilanciatore), la promessa rifiutata non viene gestita. Lo stato resta «Invio in corso…» e l'utente non sa se l'ordine è partito.

**SPICA-04 · P2 · `web/app.js:14-17`: la ricerca non ha uno stato di errore e lo spinner resta acceso.**
Anche qui non ci sono controlli su `res.ok` né `try/catch`. Con un 401 o un 500, `lista.map` lancia un'eccezione, `caricamento.hidden = true` non viene mai eseguito e «Caricamento…» resta visibile senza messaggio. Lo stesso succede per una rete assente.

**SPICA-05 · P2 · `web/app.js:68-73`: la lista degli ordini non ha stati di errore, caricamento e vuoto.**
Una risposta non riuscita fa fallire `lista.map` in silenzio e la sezione resta vuota. Manca un indicatore di caricamento. Anche senza ordini negli ultimi 7 giorni la sezione resta vuota, senza un testo come «Nessun ordine negli ultimi 7 giorni». Inoltre la sezione mostra solo gli ultimi 7 giorni e al massimo 200 ordini (limite del server), ma il titolo «Ultimi ordini» non lo dice.

**SPICA-06 · P2 · `web/app.js:1-2`: sessione mancante o scaduta non gestita.**
Se `sessionStorage` non contiene il token, la pagina manda `Bearer null`. Nessuna chiamata gestisce il 401: niente rimando al login, niente messaggio, e scattano i difetti 01, 04 e 05. Ambiguità da chiarire con l'utente: in `web/` non c'è una pagina di login e nel repository non ho trovato chi scriva il token in `sessionStorage`.

**SPICA-07 · P2 · `web/app.js:26`, `web/app.js:13-24`: la ricerca parte a ogni tasto e le risposte possono arrivare in disordine.**
Ogni tasto avvia una richiesta, senza attesa (debounce) e senza `AbortController`. Una risposta lenta di una ricerca precedente può sovrascrivere quella più recente, e così l'elenco non corrisponde al testo cercato. Anche lo spinner si spegne alla prima risposta che arriva, non all'ultima. Con circa 12.000 prodotti e 300 negozi questo vuol dire molte richieste `ILIKE` inutili.

**SPICA-08 · P2 · `web/app.js:18-20`: manca lo stato vuoto della ricerca, e la pagina non dice che i risultati sono troncati.**
Una ricerca senza risultati lascia una lista vuota, senza «Nessun prodotto trovato». L'API restituisce al massimo 50 risultati (`limit` predefinito in `server/routes/products.js:11`). La pagina non lo segnala e non offre «altri risultati» o una paginazione: alla prima apertura si vedono solo i primi 50 prodotti in ordine alfabetico, su circa 12.000.

**SPICA-09 · P2 · `web/app.js:19`, `web/app.js:72`: dati del server inseriti con `innerHTML` senza escape.**
`p.name`, `p.id` e `o.status` entrano nel markup così come arrivano. Un nome di prodotto con markup (per esempio da un import) verrebbe eseguito nella pagina. Lo script iniettato potrebbe leggere il token in `sessionStorage` e usarlo con il ruolo dell'operatore. Nel repository non ho trovato un percorso con cui un utente non `admin` scriva i nomi, per questo la priorità è P2. Correzione suggerita: creare gli elementi con `textContent`, come fa già `disegnaOrdine`. Da passare a AISA Security per conferma.

**SPICA-10 · P2 · `web/app.js:42-46`, `web/style.css:5`: il pulsante per togliere una riga non si usa da tastiera.**
«Togli» è uno `<span>` con un listener di clic: non riceve il focus, non ha ruolo di pulsante e non risponde a Invio o Spazio (WCAG 2.1.1, 4.1.2). Il lettore di schermo legge «✕» e il nome della riga non viene associato al comando. Serve un `<button type="button">` con un nome accessibile, per esempio «Togli <prodotto>». L'unica alternativa oggi è ricaricare la pagina, perdendo tutto l'ordine.

**SPICA-11 · P2 · `web/app.js:28-33`: la quantità si cambia solo con un clic per unità, e la pagina non avvisa quando si supera la giacenza.**
Non c'è un campo per la quantità: ogni clic su «Aggiungi» aggiunge 1, ma gli ordini hanno in media 25 righe. La pagina non confronta la quantità con `stock` e lascia superare la giacenza mostrata; l'errore arriva solo dal server, con il 409, e oggi finisce nel difetto SPICA-01. Dopo un ordine l'elenco dei prodotti non si ricarica, quindi «disponibili N» resta il valore vecchio (`web/app.js:63-65`).

**SPICA-12 · P2 · `web/index.html:8`, `web/app.js:72`: moment.js da CDN esterna.**
Lo script viene da jsDelivr senza `integrity` (SRI) ed è bloccante nell'`<head>`. Pesa diverse centinaia di KB con tutte le lingue, quando `Intl.DateTimeFormat("it-IT", …)` basta per «D MMM, HH:mm». Se la CDN non risponde, `moment` non è definito e la lista degli ordini fallisce in silenzio. In più ogni apertura della pagina manda l'IP degli utenti a un servizio esterno: da verificare con la Privacy.

**SPICA-13 · P3 · `web/app.js:72`: stato dell'ordine in codice interno.**
L'interfaccia mostra `pending_payment`, `picking` e così via invece di etichette in italiano. Per `warehouse` e `admin`, che vedono gli ordini di tutti i negozi, manca anche il cliente.

**SPICA-14 · P3 · `web/index.html:20`, `web/index.html:31`: annunci per i lettori di schermo.**
«Caricamento…» non è in una regione live e la lista dei risultati non annuncia quanti prodotti ha trovato. Gli errori, una volta aggiunti, andrebbero annunciati con `role="alert"` o nella regione `#stato`. Si può valutare anche `aria-busy` sulla lista durante il caricamento.

**SPICA-15 · P3 · `web/index.html:29`, `web/app.js:56-58`: si può inviare un ordine vuoto.**
La pagina non lo impedisce e il server risponde 400, che oggi produce il falso successo descritto in SPICA-01. Il pulsante andrebbe disattivato quando il carrello è vuoto.

**SPICA-16 · P3 · `server/app.js:8`: cache di 1 ora sui file statici.**
`maxAge: "1h"`, senza versione nei nomi dei file. Dopo un deploy i browser possono tenere per un'ora l'`app.js` vecchio insieme a un'API nuova.

## Note per altri ruoli (fuori dal mio perimetro)

- **Backend:** in `POST /api/orders` (`server/routes/orders.js:31-42`) l'ordine viene inserito prima di controllare le righe e non c'è una transazione. Un 400 o un 409 a metà lascia un ordine `pending_payment` con le giacenze già scalate per le righe precedenti. Questo aggrava SPICA-01 e SPICA-02.
- **Backend e Database:** la migrazione `003_sku.sql` rinomina `stock` in `qty` quando la colonna `stock` non esiste ancora (la 001 la chiama `qty`). Potrebbe bloccare le migrazioni e quindi l'avvio, cioè anche il frontend. Va verificato.

## Riepilogo

- **Sintesi:** il frontend gestisce quasi solo il caso riuscito. Mancano gli stati di errore e di vuoto, e non c'è protezione dall'invio doppio. Il difetto più grave è il falso successo dell'ordine, che svuota anche il carrello (SPICA-01).
- **Conteggio:** tre P1 (01, 02, 03), nove P2 (04-12), quattro P3 (13-16).
- **File modificati:** nessuno.
- **Test:** nessuno eseguito. I rilievi vengono dalla lettura del codice e non li ho provati nel browser.
- **Rischi e limiti:**
  - Non ho visto il flusso di login.
  - Non so chi possa scrivere i nomi dei prodotti, e da questo dipende la priorità di SPICA-09.
  - I P1 sono da confermare con il riesame del direttore AISA-01 prima di renderli definitivi.
- **Attività residue proposte, da confermare con l'utente:**
  1. Correggere 01-03 insieme: un piccolo helper `api()` che controlla `res.ok`, gestisce il 401 e gli errori di rete, più il blocco del pulsante durante l'invio.
  2. Gestire gli stati di vuoto e di troncamento, e l'escape dei dati.
  3. Sistemare l'accessibilità di «Togli».
  4. Valutare di sostituire moment con `Intl.DateTimeFormat`.

— SPICA (AISA-05)
