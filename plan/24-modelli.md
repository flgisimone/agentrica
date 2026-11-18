# F24 — Modelli e consumo di token

**Obiettivo**: ogni agente lavora con il modello più adatto al suo compito, così si consumano meno token (e meno dei limiti dell'abbonamento) senza perdere qualità. La scelta si fa misurando sugli stessi casi di prova, non a intuito. I token spesi e risparmiati si vedono, con i grafici, nel pannello di chi usa Agentrica e, in forma anonima, sul sito.

> **Stato: da aprire**. Analisi e decisioni con l'utente il 2026-11-18; backlog da confermare all'apertura. Viene dopo F23 e prima della biblioteca (F25), che aggiungerà testo ai prompt.

**Agenzie**: business (Product Manager per misura e soglie); privacy (GDPR, Data Governance, DPIA, Legal) per l'invio anonimo dei totali e la lettura dei file di Claude Code; cybersecurity (AppSec, Cloud Security) per l'endpoint e per la lettura fuori dalla cartella del progetto; design (Dashboard e Data Visualization, UX Writer, Accessibility) per i grafici del pannello e del sito; software (Architect per dove vive il modello consigliato, QA per casi e conteggi, Backend per catalogo, MCP ed endpoint, Database, Frontend, Code Reviewer).

## Situazione di partenza

- I 56 subagent di `.claude/agents/` hanno tutti `model: inherit`: ognuno gira sul modello della sessione (di solito Opus o Fable), anche per controlli meccanici. `init` li copia così nei progetti nuovi.
- Nei prompt e nei tool del server MCP il modello lo sceglie il client dell'utente; il server dà solo testo e oggi non consiglia nessun modello.
- Il testo di un agente (regole del reparto, file di ruolo, compito) pesa circa 2–3k token; i file più grandi di `agents/` sono sotto i 4 KB (limite 8 KB di SEC-ARCH-01).
- Prove di F13 in `examples/`: progetti con difetti piantati, difetti attesi e regole di conteggio per tre agenti, eseguite con un solo modello (Opus 5.5, ragionamento medio). Sono il punto di partenza per misurare.
- **Dati sui token.** Il server MCP non vede i token: li spende il modello del client. Claude Code salva in `~/.claude/projects/<progetto>/*.jsonl`, per ogni risposta, modello, effort e `usage`: token in ingresso e in uscita, di ragionamento, letti dalla cache e scritti in cache. I subagent hanno file propri con il loro tipo, quindi la spesa si può attribuire a un agente. Gli altri client non danno questi dati. Il pannello oggi legge solo `plan/`, `audit/` e git della cartella del progetto.
- Prezzi API del 2026-11-03, per milione di token in ingresso e in uscita: Opus 5.5 $4 / $20 (effort predefinito medio), Sonnet 5.5 $2 / $10, Haiku 5.5 $0,10 / $0,50. Con l'abbonamento si consumano i limiti di cinque ore e settimanali, più in fretta con i modelli più grandi.

## Decisioni dell'utente (2026-11-18)

| Tema | Decisione |
|---|---|
| Metodo | Prima si misura, poi si assegna: Opus con effort più basso, Sonnet e Haiku sugli stessi casi, per alcuni ruoli rappresentativi. Si assegna `model:` a un ruolo solo dove la qualità regge |
| Prove | I casi di `examples/` restano nel repository come prova interna per confrontare modelli e versioni dei ruoli; in F26 si toglie solo la vetrina «Messi alla prova» |
| Server MCP | Dopo la misura, il server indica il modello consigliato per ciascun agente; la scelta resta all'utente |
| Misure | **Spesi**: misurati. **Risparmiati con la cache**: misurati, come differenza fra il prezzo pieno e quello di lettura della cache. **Risparmiati con il modello**: stima dichiarata come tale, cioè gli stessi token al prezzo di Opus meno quelli al prezzo del modello assegnato. **Previsti**: solo nelle prove di F24 (Opus su tutto contro il modello assegnato, sugli stessi casi), misurati. Nessun numero stimato è presentato come misurato |
| Pannello | Grafici locali per agente, modello, sessione e giorno: token spesi, quota della cache, risparmio della cache, risparmio stimato del modello. Si leggono solo i file di Claude Code di quel progetto e solo i campi dei token, mai i testi delle conversazioni |
| Sito | Totali anonimi inviati dagli utenti con conferma, come le valutazioni: anteprima di ciò che parte (solo totali per agente, modello, effort e versione del pacchetto, per giorno), nessun compito, file, percorso né identificativo. Sul sito i totali sono «dichiarati dagli utenti», con limiti di plausibilità; accanto, i risultati misurati nelle prove di F24 |
| Frase sul sito | Nella forma «Con Agentrica sono stati usati X token; la cache ne ha fatti pagare Y in meno; nelle nostre prove la scelta del modello ha ridotto il consumo del Z%», con i grafici. Ogni numero dice da dove viene |
| Ordine | Dopo F23 e prima della biblioteca (F25) |

## Proposte da confermare all'apertura

- **Tabella di partenza da verificare con la misura**:

  | Modello | Quando | Ruoli candidati |
  |---|---|---|
  | Opus (o `inherit`) | Giudizio, sintesi, decisioni da proporre all'utente; un errore costa caro | Direttori dei cinque reparti, Architect, Security Architect, Code Reviewer, Security Engineer, DPIA, Pentest |
  | Sonnet | Lavoro specialistico di tutti i giorni: analisi, rilievi, stesura | Sviluppatori, ruoli di design, specialisti privacy e cyber, analisti business |
  | Haiku | Tanta lettura, verifiche meccaniche, risultato facile da controllare | QA che esegue test e lint, triage di `npm audit`, controlli di elenchi e formati |

- **Prima lo sforzo, poi il modello**: per ogni ruolo si prova anche Opus con effort più basso, perché a parità di costo può fare meglio di un modello più piccolo, e un modello solo fa funzionare meglio la cache. Il costo si conta sul compito finito: giri in più o un lavoro da rifare cancellano il risparmio.
- **Soglia per scendere di modello**: sugli stessi casi trova almeno i difetti di Opus meno uno, non ha falsi positivi in più e rispetta il formato dei rilievi (JSON, priorità, firma). Ogni caso si esegue almeno due volte per configurazione, perché i risultati variano.
- **Passaggio al modello superiore**: se uno specialista su Sonnet o Haiku trova un rilievo P0 o P1, o dichiara di non essere sicuro, il riesame passa al direttore o al revisore su Opus.
- **Dove vive il modello consigliato**: nel catalogo (`packages/catalog/src/departments.ts`, accanto ai nomi in codice), così subagent, server MCP e sito leggono la stessa fonte. Nel testo dell'agente diventa una riga come «Modello consigliato: Sonnet; se il client lo permette, affida il compito a un subagent con quel modello».
- **Costo della misura**: le esecuzioni consumano i limiti dell'abbonamento. Il piano delle esecuzioni (ruoli, casi, ripetizioni) si conferma con l'utente prima di lanciarle.
- **Invio dei totali**: un tool o un pulsante del pannello (come «Valuta») prepara l'anteprima dei totali dall'ultimo invio, e l'utente conferma. Si può proporre a fine sessione insieme alla valutazione; con `--no-ratings` o un flag apposito non si propone mai.
- **Prezzi**: una tabella dei prezzi con data nel pacchetto, per le stime in dollari equivalenti; con l'abbonamento i grafici mostrano soprattutto i token.

## Requisiti da definire all'apertura

- Privacy: voce di registro, base giuridica, bilanciamento e screening DPIA per i totali anonimi, come per le valutazioni in F20. Note legali e README aggiornati. Conservazione e aggregazione: sul sito solo somme, mai il singolo invio.
- Cybersecurity: il pannello legge solo la cartella di Claude Code del progetto corrente, senza seguire link simbolici che escono e con un limite di dimensione, ed estrae solo i campi numerici. L'endpoint ha validazione stretta, limiti di frequenza come quello delle valutazioni ed esclusione dalle somme degli invii fuori scala, senza cancellarli.
- Design: grafici leggibili e accessibili (tabella equivalente, contrasto, niente informazione affidata solo al colore). Le stime hanno un'etichetta visibile che le distingue dalle misure.

## Backlog

Proposta da confermare all'apertura.

| ID | Attività | Priorità |
|---|---|---|
| F24-01 | `examples/` come prova interna: README con lo scopo (confronto di modelli e versioni), procedura ripetibile, formato dei risultati con data, modello, effort e versione | P1 |
| F24-02 | Casi nuovi per i ruoli rappresentativi senza casi: almeno uno per reparto e uno per i candidati a Haiku | P1 |
| F24-03 | Misura: Opus (effort predefinito e più basso), Sonnet e Haiku sui ruoli rappresentativi, due esecuzioni per caso, con risultati in `examples/risultati/` | P0 |
| F24-04 | Tabella dei modelli per ruolo, decisa con l'utente dai risultati | P0 |
| F24-05 | `model:` nei subagent di `.claude/agents/` (anche quelli copiati da `init`), secondo la tabella | P1 |
| F24-06 | Modello consigliato nel catalogo, in `elenca_agenti` e nel testo dell'agente, con test | P1 |
| F24-07 | Regola di passaggio al modello superiore nelle regole comuni dei reparti | P2 |
| F24-08 | Test sulla dimensione del testo di ogni agente, così la biblioteca (F25) non lo gonfia senza accorgersene | P3 |
| F24-09 | README del pacchetto: modelli consigliati e come si cambiano | P2 |
| F24-10 | Lettura dei token dai file di Claude Code del progetto: spesi, cache, per agente, modello e giorno, risparmio della cache e stima del modello; con test su file finti | P0 |
| F24-11 | Pannello: pagina o sezione «Consumo» con i grafici e la tabella equivalente | P1 |
| F24-12 | Invio anonimo confermato dei totali (tool e pulsante del pannello, anteprima, flag per spegnerlo), con test | P1 |
| F24-13 | Endpoint e tabella dei totali nel sito, somme per agente, modello e mese, limiti di plausibilità; requisiti privacy e cyber | P1 |
| F24-14 | Sito: misure di consumo con la frase, i grafici e i risultati delle prove di F24; nascoste sotto una soglia di invii, come la reputazione | P1 |
| F24-15 | Note legali, README e e2e del sito per le misure | P1 |

## Criteri di accettazione

- Ogni scelta di modello diversa da `inherit` ha un risultato misurato in `examples/risultati/` che supera la soglia.
- `elenca_agenti` e il testo dell'agente mostrano il modello consigliato, che viene dal catalogo; i subagent hanno lo stesso modello.
- Il consumo di token sul compito finito è riportato per ogni configurazione provata (dati di Claude Code), senza stime inventate.
- Il pannello mostra i token spesi e risparmiati della sessione e del progetto, con i grafici. Le somme coincidono con quelle calcolate a mano su un file di Claude Code di prova; le stime sono etichettate come tali.
- Un invio parte solo dopo la conferma e contiene esattamente l'anteprima; con il flag spento non si propone.
- Il sito mostra la frase e i grafici solo sopra la soglia; i totali sono indicati come dichiarati dagli utenti e i risultati delle prove come misurati.
- `npm run verify` verde.
