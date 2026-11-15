# F13 — Prove e distribuzione

**Obiettivo**: mostrare con risultati ripetibili che gli agenti di Agentrica producono rilievi utili, e rendere `@agentrica/mcp` trovabile da chi cerca server MCP. Sono le due cose che portano qualcuno a installarlo.

> **Stato: da aprire** (dopo F12). Fase aggiunta dall'utente il 2026-11-15 dopo la revisione del valore di F11–F15.

**Agenzie**: business (Product Manager, Product Marketing Manager) per criteri di successo e messaggi; software (QA, Backend) per i casi di prova; design (UX Writer) per README e sito. Ogni agente provato è anche il revisore del proprio file di ruolo.

## Situazione di partenza

- `@agentrica/mcp` 0.1.0 pubblicato (0.2.0 con F12); nessuna prova che un agente, usato in un progetto vero, dia rilievi sensati.
- Il pacchetto è su npm e il repository è pubblico; non è elencato in registri o liste di server MCP.
- I file di ruolo sono il prodotto: la loro qualità conta più di qualunque funzione del sito.

## Proposte da confermare all'apertura

- **Progetti di esempio**: due o tre piccoli progetti in `examples/` con difetti noti e documentati (per esempio un form senza etichette, una route senza validazione, un dato personale in un log), ciascuno con l'elenco dei difetti attesi.
- **Casi di prova**: per alcuni agenti (es. AISA-09 Application Security, AIWDA-08 Accessibility, AIPCA-02 GDPR Specialist) un caso con progetto, compito e difetti attesi; si esegue con un client reale e si registra quanti difetti trova e quanti rilievi falsi produce. Prima versione manuale e ripetibile (`ponytail:` automatizzare con l'Agent SDK solo se i casi diventano tanti).
- **Correzione dei ruoli**: i difetti mancati o i rilievi inventati diventano modifiche ai file di `agents/`, confermate dall'utente.
- **Risultati pubblici**: un estratto vero di un'esecuzione (compito, rilievi, difetti mancati) nel README e nella sezione MCP del sito, con data e versione; nessun risultato abbellito (CONVENTIONS §1).
- **Distribuzione**: registrazione nel registro MCP ufficiale e nelle liste più usate di server MCP; README in inglese con installazione in un minuto ed esempio reale. Ogni registrazione esterna si conferma con l'utente prima di farla.

## Backlog

Da scrivere all'apertura, dopo la scelta di agenti, progetti di esempio e registri.

## Criteri di accettazione

Da scrivere all'apertura. Minimo: almeno tre casi di prova eseguiti e documentati con i risultati veri, e il pacchetto elencato in almeno un registro MCP.
