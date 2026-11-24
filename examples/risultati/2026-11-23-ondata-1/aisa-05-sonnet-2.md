AISA-05 · SPICA — Senior Frontend Developer, reparto AISA (AI Software)

Revisione read-only di `web/` (index.html, app.js, style.css; 126 righe in tutto). Ho letto anche `server/routes/*` e `server/auth.js` solo per verificare il contratto dell'API. Non ho eseguito test né avviato processi, e non ho modificato file. Direttore e library non disponibili in questa prova.

## Rilievi

**P1 · XSS: HTML costruito da dati dell'API** — `web/app.js:18-20` e `web/app.js:71-73`
`p.name` (riga 19) e `o.status` (riga 72) vengono inseriti in `innerHTML` senza escape. I nomi prodotto arrivano dal listino dei fornitori e li può cambiare `admin`. Un nome con markup viene eseguito nel browser degli operatori e dei negozi. Il token è in `sessionStorage` (riga 1), quindi può essere letto dallo script iniettato. Rimedio: costruire i nodi con `createElement` e `textContent`, come già fa `disegnaOrdine` alle righe 40-51.

**P1 · Invio ordine senza gestione dell'errore** — `web/app.js:56-66`
`res.ok` non viene controllato. Con 400, 401, 403 o 409 (per esempio «giacenza insufficiente», `server/routes/orders.js:37`) il corpo è `{error}`. Il frontend mostra comunque «Ordine undefined creato: NaN…», svuota il carrello (`ordine.clear()`, riga 63) e perde le righe dell'utente. Non c'è `try/catch`, quindi un errore di rete lascia «Invio in corso…» per sempre. Il messaggio d'errore del server non viene mai mostrato. Un ordine fallito sembra riuscito.

**P2 · Nessuna gestione degli errori nel caricamento di prodotti e ordini** — `web/app.js:13-24` e `web/app.js:68-74`
Mancano `res.ok` e `try/catch`.
- Con 401, per esempio token assente o scaduto, `lista` è un oggetto `{error}` e `lista.map` solleva un'eccezione. La pagina resta vuota senza messaggio.
- In `caricaProdotti` l'indicatore «Caricamento…» (riga 17) non viene mai nascosto se `fetch` o `json()` falliscono. Rimane visibile per sempre.
- Manca anche un redirect o un messaggio di accesso quando il token non c'è: `Bearer null` parte comunque (riga 2).

**P2 · Race condition nella ricerca** — `web/app.js:26`
Ogni `input` lancia una `fetch` senza debounce e senza `AbortController`. Le risposte possono arrivare fuori ordine e la lista finale può non corrispondere al testo nel campo. Con circa 12.000 prodotti il carico sul server è inutile.

**P2 · Stati vuoti assenti** — `web/app.js:18`, `web/app.js:71`, `web/app.js:35-54`
Una ricerca senza risultati, il carrello vuoto e l'elenco ordini vuoto mostrano solo uno spazio bianco, senza testo («Nessun prodotto trovato», «Nessuna riga nell'ordine», «Nessun ordine»).

**P2 · Invio possibile con carrello vuoto e doppio invio** — `web/app.js:56-60`, `web/index.html:29`
Il pulsante «Invia l'ordine» non è disabilitato con carrello vuoto, quindi parte una richiesta destinata al 400 «righe non valide». Non è disabilitato nemmeno durante l'invio, e un doppio clic crea ordini duplicati.

**P2 · Rimozione riga non accessibile da tastiera** — `web/app.js:42-49`, `web/style.css:5`
Il controllo «✕» è uno `<span>` con un click handler, non un `<button>`. Non è raggiungibile con Tab, non risponde a Invio o Spazio e non ha un nome accessibile (solo `title`, che non basta). Va sostituito con `<button type="button" aria-label="Togli {nome}">`.

**P2 · Nessuna regolazione delle quantità** — `web/app.js:28-33`
Si può solo aggiungere 1 alla volta. Non c'è un campo quantità né un «−», e per togliere una unità bisogna rimuovere l'intera riga. Non si tiene conto della giacenza (`p.stock`): si può mettere in carrello più del disponibile e scoprirlo solo dopo, con il 409. Tutto questo è un limite funzionale più che un difetto.

**P2 · Dipendenza esterna da CDN senza SRI** — `web/index.html:8`, `web/app.js:72`
`moment-with-locales` (grande) viene caricato da jsDelivr senza `integrity` né `crossorigin`. Serve solo per una data. Se la CDN non risponde, `moment` non è definito e `caricaOrdini` solleva un'eccezione, con la lista ordini vuota. Basta `Intl.DateTimeFormat("it-IT", {…})`, già usato per `euro`. Il caricamento da terzi espone anche IP e dati di navigazione dei visitatori (da segnalare a Privacy).

**P2 · Le modifiche non vengono annunciate dalle tecnologie assistive** — `web/index.html:20-21`, `web/index.html:27`
I risultati della ricerca, il totale e l'elenco delle righe aggiornati dinamicamente non hanno `aria-live`. Il «Caricamento…» (riga 20) non ha `role="status"`. Solo `#stato` è una regione live.

**P3 · Accessibilità e markup di base**
- `web/index.html:18-19`: il campo di ricerca ha l'etichetta, ma manca un `<h1>` coerente con il titolo della pagina («Magazzino», riga 12 è ok), quindi nulla da correggere qui. Manca invece un messaggio visibile di errore associato a `aria-describedby` quando le chiamate falliscono.
- `web/style.css:7`: lo stile del `:focus-visible` copre solo `button` e `input`. Link e altri controlli futuri restano senza indicatore.
- `web/style.css:3`: il colore `#52606d` su bianco ha contrasto circa 6:1, quindi regge. `#b42318` su bianco è circa 6,5:1, quindi regge. Nessun difetto.
- `web/index.html:28`: `<output id="totale">` è usato correttamente, ma senza `for` e senza `aria-live` il cambio non viene letto.

**P3 · Gestione degli eventi e prestazioni** — `web/app.js:21-23`
Un listener per ogni pulsante e `lista.find` a ogni clic. Meglio un solo listener delegato su `#prodotti`. Nessun impatto reale a questo volume, ma la lista non è paginata e `/api/products` può restituire migliaia di righe in una volta: va verificato lato server quanti ne restituisce (non l'ho approfondito, fuori dal perimetro).

**P3 · Gestione del token** — `web/app.js:1-2`
Il token viene letto da `sessionStorage` senza nessuna pagina di accesso nel repository `web/` (nessun login, nessun logout, nessuna gestione della scadenza). Va chiarito da dove arriva il token e cosa succede alla scadenza.

## Aspetti corretti
- Il formato valuta e i testi usano `it-IT`; `lang="it"` e `viewport` sono presenti.
- `#stato` ha `role="status"` e `aria-live="polite"`.
- `disegnaOrdine` usa `textContent` (nessun XSS in quel punto).
- Etichetta del campo di ricerca e `aria-labelledby` sulle sezioni presenti.

## Limiti e conferme
- Rilievo di lettura statica: nessun test eseguito e nessuna prova nel browser.
- Non ho verificato il comportamento del server oltre al contratto di risposta letto nei file citati.
- Da confermare con l'utente, prima di correggere: se esiste una pagina di accesso esterna a `web/`, e se il server limita il numero di prodotti restituiti.
- Sono su Sonnet: per i due P1 (XSS, errore ordine ignorato) propongo il riesame del direttore AISA-01 o di un revisore su Opus prima che diventino definitivi.

— AISA-05 · SPICA, Senior Frontend Developer, reparto AISA (AI Software)
