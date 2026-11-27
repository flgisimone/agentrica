# Funzione: resi dei negozi

Prima versione della funzione dei resi, da rivedere prima di unirla al gestionale. Segue la [richiesta](../../richieste/resi.md).

- `db/005_returns.sql`: la tabella dei resi, da aggiungere alle migrazioni.
- `server/returns.js`: le rotte, da montare in `server/app.js` su `/api/returns` dopo `requireUser`, come le altre.
- `web/resi.html` e `web/resi.js`: la pagina dei resi per i negozi e per il magazzino.

Le rotte usano `db.query` di `server/db.js` e `requireRole` di `server/auth.js`, come il resto del server.
