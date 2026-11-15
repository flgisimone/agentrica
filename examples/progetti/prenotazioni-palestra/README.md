# prenotazioni-palestra

Modulo per prenotare una lezione di prova in una palestra di quartiere, senza dipendenze (Node 22).

```sh
npm start
```

- `GET /` mostra il modulo (`public/index.html`).
- `POST /prenota` salva la prenotazione in `prenotazioni.jsonl` e manda un evento al servizio di statistiche della palestra.
- Le prenotazioni restano nel file; la reception le legge per preparare le lezioni.
