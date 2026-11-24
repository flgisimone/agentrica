# Gestionale di magazzino di «Ortofrutta Emilia»

Gestionale interno di un distributore all'ingrosso: prodotti e giacenze, ordini dei negozi clienti, pagamenti online con un fornitore che avvisa con un webhook, report delle vendite. Progetto di prova: nomi e dati sono finti.

- **Server**: Node 22 con Express 4 e `pg` (`server/`), Postgres 16.
- **Web**: pagina statica servita dal server (`web/`), usata dagli operatori del magazzino e dai negozi.
- **Database**: migrazioni SQL in `db/migrations/`, applicate in ordine all'avvio del server (`npm run migrate`).
- **Deploy**: immagine Docker, due repliche dietro il bilanciatore (`deploy/`), CI su GitHub Actions (`.github/workflows/`).

## Ruoli

- `shop`: negozio cliente; vede il catalogo e crea i suoi ordini.
- `warehouse`: operatore del magazzino; aggiorna giacenze e stato degli ordini.
- `admin`: prodotti, prezzi, report.

I prezzi li cambia solo `admin`.

## Dati

- Circa 12.000 prodotti, 300 negozi, 2.500 ordini al giorno nei picchi (righe medie per ordine: 25).
- `data/listino.json` è il listino dei fornitori (circa 30 MB), aggiornato una volta al giorno da un job esterno.
