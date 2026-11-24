AISA-05 · SPICA — Senior Frontend Developer, reparto AISA (AI Software)

# Revisione read-only del frontend `web/`: «Gestionale di magazzino di Ortofrutta Emilia»

Il frontend non controlla mai le risposte dell'API, quindi un ordine rifiutato appare all'operatore come creato. Ci sono anche un punto aperto a XSS e problemi di accessibilità da tastiera. Non ho modificato nulla.

**Contesto verificato.** Ho letto `README.md`, `package.json`, `Dockerfile`, `.github/workflows/ci.yml`, i tre file di `web/` (`index.html`, `app.js`, `style.css`), le rotte che il frontend chiama (`server/app.js`, `server/auth.js`, `server/routes/products.js`, `server/routes/orders.js`) e le migrazioni.
- Il frontend è una pagina statica in JS vanilla (ES module), senza build né framework. L'unica libreria esterna è moment da CDN.
- La copia non è un repository git e non c'è un `CLAUDE.md`.
- Non ci sono test per `web/` né in generale: `npm test` è `node --test` e nel progetto non c'è nessun file di test.

**Segnalazione P0 fuori perimetro (subito).** In `.github/workflows/ci.yml`, righe 39-41 e 47-52, il job `build` scrive `PROD_DATABASE_URL` e `PAYMENTS_WEBHOOK_SECRET` in `.env` e poi carica `.env` come artifact della build. I segreti di produzione diventano così scaricabili da chiunque abbia accesso in lettura alle Actions del repository. Questo rilievo va passato a DevOps e Security tramite il direttore AISA-01 e non è valutato oltre in questa revisione.

## Rilievi (frontend)

| # | Priorità | File:riga | Difetto |
|---|---|---|---|
| F1 | P1 | `web/app.js:60-64` | **L'esito dell'ordine non viene controllato.** Non c'è il controllo `res.ok`. Con 400 (righe non valide, anche col carrello vuoto), 409 (giacenza insufficiente), 401 (token scaduto) o 500 la pagina mostra «Ordine undefined creato: NaN €». Poi svuota comunque il carrello (`ordine.clear()`): l'operatore crede di aver ordinato e perde le righe. |
| F2 | P1 | `web/app.js:18-19`, `71-72` | **XSS da `innerHTML`.** `p.name` (e `o.status`) vengono inseriti nel DOM senza escape. Un nome prodotto con markup (`<img onerror=…>`) esegue script nella pagina di ogni negozio e operatore. Il token di sessione è in `sessionStorage` (riga 1) e uno script iniettato lo può leggere. La correzione proposta è creare i nodi con `textContent`, come fa già `disegnaOrdine`. |
| F3 | P1 | `web/app.js:29`, `web/index.html:29` | **Doppio invio.** Il pulsante «Invia l'ordine» non viene disabilitato durante l'invio. Un doppio clic crea due ordini e scala la giacenza due volte. Non esiste un'alternativa lato client. |
| F4 | P1 | `web/app.js:56-58` + `server/routes/orders.js:29` | **Integrazione per i ruoli `warehouse` e `admin`.** Per questi ruoli il server si aspetta `customerId` nel body, ma la pagina dichiarata per operatori e negozi (README) non ha un campo cliente e non lo invia. L'insert fallisce sul vincolo `NOT NULL`. La rotta async di Express 4 non ha `try/catch`, quindi la risposta non arriva mai e lo stato resta su «Invio in corso…». Lato server il rifiuto non gestito può far cadere il processo su Node 22: va verificato dal Backend. |
| F5 | P2 | `web/app.js:14-17`, `69-71` | **Nessuno stato di errore nelle letture.** Con 401 o 500 la risposta è `{error}` e `lista.map` va in eccezione. Con un errore di rete `fetch` rifiuta senza `catch`. In entrambi i casi «Caricamento…» resta visibile per sempre, la lista resta vuota e l'utente non riceve nessun messaggio. |
| F6 | P2 | `web/app.js:1-2` | **Sessione mancante o scaduta non gestita.** Senza token l'header diventa `Bearer null` e ogni chiamata dà 401 senza messaggio. La pagina non ha un rinvio al login né un'azione di uscita. |
| F7 | P2 | `web/app.js:26` | **Ricerca senza debounce né annullamento.** Parte una richiesta a ogni tasto, senza `AbortController`. Le risposte che arrivano fuori ordine sovrascrivono i risultati più recenti e lo spinner si spegne alla prima risposta, non all'ultima. Con 12.000 prodotti e 300 negozi il carico sul server è inutile. |
| F8 | P2 | `web/app.js:18`, `71`, `36` | **Nessuno stato vuoto.** Una ricerca senza risultati, nessun ordine negli ultimi 7 giorni e il carrello vuoto mostrano tutti un'area bianca. Col carrello vuoto il pulsante d'invio resta attivo e porta a F1. |
| F9 | P2 | `web/app.js:15` + `server/routes/products.js:11` | **Risultati troncati in silenzio.** L'API restituisce al massimo 50 prodotti, ma la pagina non pagina, non ha «Carica altri» e non dice che ci sono altri risultati. Senza una ricerca, 11.950 prodotti non sono raggiungibili. |
| F10 | P2 | `web/app.js:28-33`, `41` | **La quantità si cambia solo a +1 per clic.** Manca un campo quantità e non si può diminuire, solo togliere la riga. Per un ingrosso con ordini da circa 25 righe e quantità alte la pagina è poco usabile. Inoltre non c'è nessun limite lato client sulla giacenza (`p.stock`) e «Aggiungi» resta attivo anche con disponibilità 0: l'errore arriva solo come 409, e oggi non viene mostrato (F1). |
| F11 | P2 | `web/app.js:42-49`, `web/style.css:5` | **Il comando «Togli» non è accessibile.** È uno `<span>` con un listener sul clic: non riceve il focus da tastiera, non ha ruolo e ha come nome solo «✕» più `title`, quindi non è utilizzabile da tastiera né leggibile in modo affidabile dai lettori di schermo (WCAG 2.1.1 e 4.1.2). La correzione proposta è un `<button type="button" aria-label="Togli <nome>">`. |
| F12 | P2 | `web/index.html:8`, `web/app.js:72` | **moment da CDN di terzi.** Lo script è caricato in `<head>` in modo bloccante e senza `integrity`/`crossorigin`, e vale centinaia di KB con tutte le lingue, solo per formattare una data. Se il CDN non risponde, `moment` è indefinito e la lista ordini va in eccezione. Il CDN riceve anche l'IP di ogni utente: va segnalato a Privacy prima di confermarlo. `Intl.DateTimeFormat("it-IT", …)` copre lo stesso uso senza dipendenze. |
| F13 | P2 | `web/app.js:72` + `server/routes/orders.js:31-37` | **Ordini falliti nell'elenco.** Su 400 o 409 il server lascia l'ordine già inserito, con `total` NULL. La pagina lo mostra in «Ultimi ordini» come `pending_payment · 0,00 €` (`euro.format(null)`), cioè come un ordine valido. La causa è lato server (manca una transazione), da passare al Backend. Il frontend non distingue un `total` nullo. |
| F14 | P3 | `web/app.js:19` | Tutti i pulsanti si chiamano «Aggiungi» e non dicono a quale prodotto si riferiscono, né al lettore di schermo né nell'elenco dei controlli. Manca un `aria-label` con il nome del prodotto. |
| F15 | P3 | `web/index.html:20`, `web/app.js:72` | «Caricamento…» non è in una regione live. Gli esiti di errore, una volta aggiunti, andrebbero in `role="alert"`. Lo stato dell'ordine compare come codice inglese (`pending_payment`, `picking`…) anziché come etichetta in italiano. |
| F16 | P3 | `web/app.js:63-65` | Dopo l'invio dell'ordine il catalogo non viene ricaricato e le disponibilità mostrate restano quelle precedenti. Per gli operatori del magazzino l'elenco ordini non indica il cliente. |
| F17 | P3 | `server/app.js:8` | I file statici sono serviti con `maxAge: "1h"` e nomi senza hash. Dopo un deploy un client può tenere un `index.html` vecchio con un `app.js` nuovo, o il contrario, per un'ora. Il rilievo è da passare a DevOps. |

## Note di integrazione (nessun difetto)

- `price` e `total` sono `numeric` e `pg` li restituisce come stringhe. Oggi funziona perché `*` e `Intl.NumberFormat.format` le convertono. È fragile: un `+` scritto in futuro concatenerebbe le stringhe.
- Il totale mostrato lato client è solo indicativo. Il server ricalcola con i prezzi del database, ed è il valore giusto.
- I contrasti di colore che ho controllato superano 4.5:1 (`#52606d` e `#b42318` su bianco). Il focus visibile è definito per pulsanti e input. La ricerca ha una `label` associata e la pagina ha `lang="it"`.

## Riepilogo (SPICA)

- **Sintesi:** 17 rilievi sul frontend (4 P1, 9 P2, 4 P3) e 1 P0 fuori perimetro, sui segreti nell'artifact della CI. I problemi principali sono tre:
  - risposte dell'API mai controllate (F1, F5);
  - XSS via `innerHTML` (F2);
  - doppio invio (F3).
- **File modificati:** nessuno.
- **Test:** nessuno eseguito, perché il compito era in sola lettura e senza processi. Il progetto non ha test.
- **Decisioni tecniche:** nessuna. Le correzioni indicate sono proposte da confermare con l'utente tramite AISA-01.
- **Da passare ad altri ruoli:**
  - Backend: transazione nella creazione dell'ordine, errori async in Express 4, `customerId` per warehouse e admin (F4, F13).
  - DevOps: il P0 della CI e la cache dei file statici (F17).
  - Privacy: il CDN di terzi (F12).
- **Limiti:** la revisione è solo statica. Non ho provato la pagina nel browser né con il server avviato. Non ho potuto leggere la biblioteca del reparto e non ho verificato le nozioni WCAG sulla fonte (niente rete): i criteri citati possono essere superati e vanno riverificati.
- **Riesame:** questa esecuzione gira su Opus e non su un modello più piccolo, quindi i rilievi P0 e P1 non richiedono il riesame su modello superiore previsto dalle regole del reparto. Restano proposte da consolidare con il direttore AISA-01.

— AISA-05 · SPICA
