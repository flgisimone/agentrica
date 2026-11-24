AISA-05 · SPICA — Senior Frontend Developer, reparto AISA (AI Software)

**Revisione read-only di `web/` (index.html 42 righe, app.js 77, style.css 7). Nessun file modificato, nessun processo avviato, nessun test eseguito.** Ho letto anche `server/routes/orders.js`, `products.js`, `auth.js` e `app.js` solo per verificare il contratto con l'API. Le citazioni di riga sono mie, dal listato.

Il direttore AISA-01 e la biblioteca non erano disponibili in questa prova. Sono su Sonnet: i rilievi P1 (e il primo P2) andrebbero riesaminati dal direttore o da un revisore su Opus prima di diventare definitivi.

## Rilievi

**P1 · `web/app.js:18-20` e `:71-73`: XSS da HTML iniettato**
`p.name`, `o.status` e gli altri campi dell'API finiscono in `innerHTML` senza escape. Un nome prodotto con markup, inserito da `admin` o `warehouse` (o dal listino), viene eseguito nel browser di chi apre il catalogo, quindi anche nel contesto con il token di sessione. Altrove la pagina usa `textContent` (riga 41), quindi il pattern sicuro c'è già. Va costruito il DOM con `createElement` e `textContent`, oppure vanno escapati i campi.

**P1 · `web/app.js:60-66`: l'invio dell'ordine non gestisce gli errori**
Non si controlla `res.ok`. Il server risponde 400 (righe o quantità non valide), 409 (giacenza insufficiente) e 401. In quei casi `body.id` e `body.total` sono `undefined`, e la pagina scrive "Ordine undefined creato: NaN €" come se fosse un successo. Poi svuota il carrello, quindi l'utente perde le righe. Non c'è `try/catch`, quindi un errore di rete lascia "Invio in corso…" per sempre e produce un rifiuto non gestito. Il messaggio `error` del server (es. "giacenza insufficiente") non viene mai mostrato. Il carrello va svuotato solo con `res.ok`.

**P1 · `web/app.js:56-60`: si può inviare un ordine vuoto, e l'invio è ripetibile**
Con il carrello vuoto parte comunque la POST, che il server rifiuta con 400, e il rifiuto non viene mostrato (vedi sopra). `#invia` non viene disabilitato durante la richiesta, quindi un doppio clic crea due ordini e scala la giacenza due volte. Vanno disabilitati il pulsante e l'invio finché la richiesta è in corso, e anche quando il carrello è vuoto.

**P2 · `web/app.js:13-24`: nessuno stato di errore e di vuoto nel catalogo**
Non c'è `try/catch` e non si controlla `res.ok`. Con un 401 (token assente o scaduto, e `sessionStorage.getItem("token")` vale `null` se manca) la risposta è `{error: ...}`, e `lista.map` genera un'eccezione che lascia lo spinner visibile per sempre. Non c'è uno stato "nessun prodotto trovato" quando la lista è vuota. `#caricamento` viene nascosto solo nel ramo di successo: va messo in un `finally`.

**P2 · `web/app.js:26`: ricerca senza debounce né protezione dalle risposte fuori ordine**
Ogni tasto genera una fetch. Le risposte possono arrivare in ordine diverso dalle richieste, e la lista mostrata può non corrispondere al testo digitato. Servono un debounce e un `AbortController` (o un contatore di richieste).

**P2 · `web/app.js:68-77`: nessuno stato di caricamento, errore o vuoto per "Ultimi ordini"**
Stesso difetto del catalogo: niente `res.ok`, niente `try/catch`. La lista resta vuota senza spiegazione quando non ci sono ordini, e si rompe con un 401 o 500.

**P2 · `web/app.js:1-2` e nessuna pagina di login**
Il token si legge da `sessionStorage` ma nel frontend non viene mai scritto da nessuna parte, e non esiste una pagina di login. Senza token ogni chiamata fallisce con 401, e l'interfaccia non lo comunica né rimanda ad autenticarsi. Serve un'intercettazione del 401 con un messaggio o un reindirizzamento. È un requisito da chiarire con l'utente: non so dove sia previsto il login.

**P2 · `web/app.js:26` e `:46-49`: stock non considerato nell'ordine**
`aggiungi` incrementa la quantità senza limite rispetto a `p.stock`, e i prodotti con `stock` 0 hanno comunque il pulsante "Aggiungi" attivo. L'errore arriva solo dal server (409), che oggi non viene mostrato (vedi sopra). Non ci sono controlli per cambiare la quantità: si può solo aggiungere di uno o togliere la riga intera.

**P2 · `web/index.html:26-30` e `web/app.js:41-50`: accessibilità del form d'ordine**
- Il pulsante di rimozione è uno `<span class="togli">` con solo `click`: non è raggiungibile da tastiera, non ha ruolo né nome accessibile (solo `title`). Deve essere un `<button type="button" aria-label="Togli {nome}">`.
- Il lettore di schermo non annuncia l'aggiunta di una riga all'ordine: `#righe` non è una regione live (lo è solo `#stato`).
- `#caricamento` ha `hidden` ma non è `role="status"`: il caricamento non viene annunciato.
- I pulsanti "Aggiungi" (riga 19) hanno tutti lo stesso nome: manca `aria-label` con il nome del prodotto.

**P2 · `web/index.html:8`: dipendenza da CDN esterna per un solo formato data**
`moment-with-locales` (circa 300 kB) viene caricato in modo bloccante da una CDN senza `integrity` né `crossorigin`: se la CDN non risponde, la pagina non arriva a `app.js` nel punto in cui usa `moment` (riga 72, `ReferenceError`, quindi la lista ordini non si disegna). `Intl.DateTimeFormat("it-IT", …)` fa lo stesso lavoro, quindi la dipendenza si può togliere. Moment è in modalità manutenzione. Anche la rete esterna espone una dipendenza di sicurezza (supply chain) sulla pagina che contiene il token.

**P3 · `web/app.js:22`: confronto `String(p.id) === b.dataset.id` e `lista.find` a ogni clic**
Funziona, ma si può evitare associando il prodotto al pulsante con una closure creando il DOM con `createElement`. Cade da solo con la correzione dell'XSS.

**P3 · `web/app.js:53`: `totale.value`**
Il totale calcolato lato client è solo indicativo (il server ricalcola, `orders.js:40`). Va bene, ma conviene scriverlo nell'interfaccia, per evitare discrepanze. Con prezzi decimali la somma in virgola mobile può dare centesimi sbagliati. Meglio lavorare in centesimi.

**P3 · `web/app.js:72`: stato dell'ordine mostrato grezzo**
`o.status` mostra "pending_payment", "picking" ecc. Vanno tradotti in italiano. Lo `status` si mostra anche senza altra indicazione visiva oltre al testo.

**P3 · `web/index.html:18-19` e `web/style.css`**
- L'`<input type="search">` non ha ruolo di ricerca o `role="search"` sul contenitore, e la lista dei risultati non annuncia il numero di prodotti trovati.
- Lo stile è minimo: nessuno stile per `[hidden]` da cambiare, nessun `:disabled`, nessuna regola per schermi stretti oltre al viewport. Il colore `#52606d` su bianco ha un contrasto di circa 6:1, quindi regge. Non l'ho misurato con uno strumento.
- I listini lunghi non hanno paginazione: l'API restituisce al massimo 50 prodotti (`limit` predefinito, `products.js:11`) e il frontend non permette di vedere gli altri oltre la ricerca. Con circa 12.000 prodotti la ricerca è l'unico modo di arrivare a un prodotto: va detto all'utente nell'interfaccia.

## Cosa regge
`lang="it"`, viewport, `label` associata alla ricerca, sezioni con `aria-labelledby`, `role="status"` su `#stato`, un focus visibile definito, formattazione valuta con `Intl.NumberFormat`, `encodeURIComponent` sulla query.

## Limiti e passi successivi
Non ho eseguito la pagina né test (nessuna prova nel browser): i rilievi vengono dalla lettura del codice. Fuori dal perimetro (non verificati): `server/routes/orders.js` fa gli aggiornamenti di giacenza senza transazione e non filtra `GET /` per paginazione degli `order_items` (un N+1); lo segnalo al direttore AISA-01 e agli specialisti backend. Nessun file è stato modificato.

Priorità proposta di correzione: prima XSS, gestione errori dell'ordine e doppio invio (P1), poi stati di errore, vuoto e caricamento, accessibilità del carrello, login e rimozione di moment (P2). Da confermare con l'utente.

File esaminati: `web/index.html`, `web/app.js`, `web/style.css` (nella copia di prova `aisa-05-sonnet-1`).

AISA-05 · SPICA — Senior Frontend Developer, reparto AISA (AI Software)
