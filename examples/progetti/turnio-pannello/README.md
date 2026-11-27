# Turnio: pannello web per i responsabili

Il pannello web di Turnio, l'app dei turni per ristoranti, bar e pasticcerie con 3–40 dipendenti per locale. Il titolare o il responsabile di sala prepara i turni della settimana, li pubblica ai dipendenti, approva gli scambi dei turni, gestisce l'elenco dei dipendenti e ogni mese esporta le presenze per il consulente del lavoro. I dipendenti usano l'app sul telefono, non questo pannello.

Progetto di prova: l'azienda, i locali, le persone, le interviste e i numeri sono inventati. Le pagine sono statiche, con dati di esempio scritti nel codice; non c'è un server.

## Utenti

- **Responsabile di sala** (utente principale): prepara i turni, di solito la domenica sera per la settimana dopo, e approva gli scambi durante la settimana.
- **Titolare**: guarda i numeri e le presenze, esporta le ore per il consulente una volta al mese.

## Compiti principali, in ordine di frequenza

1. Preparare e pubblicare i turni della settimana (ogni settimana).
2. Approvare o rifiutare gli scambi dei turni (più volte a settimana).
3. Aggiungere un dipendente nuovo, che riceve l'invito all'app con nome e numero di telefono (qualche volta al mese).
4. Esportare le presenze per il consulente del lavoro (una volta al mese).
5. Cambiare le impostazioni del locale (raramente).

## File

| File | Contenuto |
|---|---|
| [index.html](index.html) | Cruscotto: numeri della settimana e grafici |
| [turni.html](turni.html) | Turni della settimana, pubblicazione, finestra dello scambio |
| [dipendenti.html](dipendenti.html) | Elenco dei dipendenti e modulo per aggiungerne uno |
| [impostazioni.html](impostazioni.html) | Impostazioni del locale, scambi da approvare, esportazione, eliminazione del locale |
| [css/tokens.css](css/tokens.css), [css/app.css](css/app.css) | Token e stili |
| [js/app.js](js/app.js) | Comportamenti delle pagine |
| [docs/mappa.md](docs/mappa.md) | Mappa del pannello |
| [docs/componenti.md](docs/componenti.md) | Componenti del design system |
| [docs/glossario.md](docs/glossario.md) | Termini da usare nei testi |
| [ricerca/](ricerca/) | Protocollo, interviste e sintesi della ricerca di ottobre 2026 |
| [schermate/](schermate/) | Schermate delle quattro pagine su computer (1280 px) e su telefono (390 px), a pagina intera |
