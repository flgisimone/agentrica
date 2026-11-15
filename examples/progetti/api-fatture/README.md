# api-fatture

API per le fatture di uno studio con più utenti, senza dipendenze (Node 22). Ogni utente vede le sue fatture; l'amministrazione esporta i dati con una chiave a parte.

```sh
ADMIN_KEY=una-chiave-lunga npm start
```

| Metodo | Percorso | Cosa fa |
|---|---|---|
| POST | `/login` | accesso con `{ "email", "password" }`, imposta il cookie di sessione |
| POST | `/logout` | chiude la sessione |
| GET | `/invoices` | elenca le fatture dell'utente |
| POST | `/invoices` | crea una fattura (`{ "customer", "amount", "dueDate" }`) |
| GET | `/invoices/:id` | una fattura |
| PATCH | `/invoices/:id` | modifica una fattura in bozza |
| GET | `/invoices/:id/pdf` | scarica il PDF della fattura da `documenti/` |
| GET | `/admin/export` | tutte le fatture in CSV; intestazione `x-admin-key` |

Il frontend è su `https://app.studio.example` e chiama l'API con `credentials: "include"`. Gli utenti di prova sono in `src/store.js`.
