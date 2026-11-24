# F39 — Promemoria degli agenti e strumenti locali

**Obiettivo**: in una sessione lunga chi usa Agentrica si ricorda di caricare un agente per ogni richiesta nuova, e il pannello segnala quando si lavora in `plan/` senza nessun agente caricato. Per ogni tool del server è scritto se resta sul computer o se manda dati fuori, così in un repository con la regola «non esce niente» non si esita.

> **Stato: da aprire.** Segnalazione ricevuta il 2026-11-24, durante la chiusura di F38. Le «proposte da confermare» si decidono con l'utente all'apertura (sessione nuova).

**Agenzie (proposta)**: business (Product Manager per il valore e la priorità); design (UX Designer e UX Writer per il promemoria e l'avviso nel pannello); privacy (Data Governance per l'elenco «resta in locale / esce»); software (Backend per server e pannello, QA, Code Reviewer).

## Segnalazione (2026-11-24)

> Le istruzioni arrivano una volta sola, all'inizio della sessione. A metà sessione, finito un lavoro con gli agenti, niente ricorda di caricarne uno per la richiesta successiva, e il pannello non segnala quando si scrive in plan/ senza nessun agente caricato. Un promemoria a ogni richiesta, o un avviso nel pannello, avrebbe evitato il secondo caso.
> Non è scritto quali strumenti restano in locale. In un repo con la regola «non esce niente», questo fa esitare. Il primo caso nasce anche da lì.

## Situazione di partenza (da verificare all'apertura)

- Le istruzioni del server (`packages/mcp/src/texts/it.ts` ed `en.ts`, entro 4096 caratteri) arrivano al client una volta, all'avvio della sessione.
- Il README del pacchetto dice che il server gira solo in locale (stdio) e, nella parte sul pannello, che nulla esce tranne valutazioni e totali di token inviati dalla pagina; manca un elenco per tool di cosa resta sul computer e cosa no (`rate_agent`, `share_usage`, `submit_project` mandano dati ad Agentrica dopo l'anteprima e il sì dell'utente; gli altri no).
- Il pannello legge `plan/`, lo stato git e i subagent avviati, e conosce gli agenti caricati con `agent`.

## Proposte da confermare

- **Promemoria a ogni richiesta**: come farlo arrivare (testo nelle risposte dei tool, hook `UserPromptSubmit` scritto da `init`, regola nello starter); quanto spesso, per non diventare rumore.
- **Avviso nel pannello**: quando `plan/` cambia e nella sessione non c'è un agente caricato; dove e con che testo.
- **Strumenti locali**: tabella «resta in locale / esce, cosa e quando» per ogni tool e comando, nel README del pacchetto (due lingue), sul sito (Installa) e in breve nelle istruzioni del server.
- Versione del pacchetto e rilascio insieme al sito.
