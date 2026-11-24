# F24 — Modelli e consumo di token

**Obiettivo**: ogni agente lavora con il modello più adatto al suo compito, così si consumano meno token (e meno dei limiti dell'abbonamento) senza perdere qualità. La scelta si fa misurando sugli stessi casi di prova, non a intuito. I token spesi e risparmiati si vedono, con i grafici, nel pannello di chi usa Agentrica e, in forma anonima, sul sito.

> **Stato: completata** (aperta il 2026-11-18, chiusa il 2026-11-19). Analisi e decisioni con l'utente il 2026-11-18; all'apertura, lo stesso giorno, la fase è divisa: qui misura, modelli per ruolo e consumo nel pannello locale; l'invio anonimo dei totali e le misure sul sito passano a [F27](27-consumo-sito.md). Viene dopo F23 e prima della biblioteca (F25), che aggiungerà testo ai prompt.

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

## Decisioni all'apertura (2026-11-18)

| Tema | Decisione |
|---|---|
| Perimetro | F24-01…F24-11: misura, modelli per ruolo, consumo nel pannello locale, nessuna connessione nuova. Invio anonimo, endpoint e sito (ex F24-12…F24-15) in [F27](27-consumo-sito.md) |
| Esecuzioni | Le esegue la sessione di sviluppo con un subagent per configurazione (Opus effort medio, Opus effort basso, Sonnet, Haiku), con il testo dell'agente dato dal server MCP e il progetto copiato fuori dal repository; token dai file di Claude Code dei subagent |
| Piano delle misure | Completo: i 4 casi esistenti e 3 nuovi (AIBPD, AICA, un QA candidato a Haiku), 4 configurazioni, 2 esecuzioni ciascuna: 56 esecuzioni |
| Proposte | Confermate come scritte qui sotto: tabella di partenza, prima lo sforzo poi il modello, soglia, passaggio al modello superiore, modello nel catalogo, costo della misura, prezzi con data. L'invio dei totali passa a F27 |

## Proposte confermate all'apertura

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
- **Invio dei totali**: passa a [F27](27-consumo-sito.md).
- **Prezzi**: una tabella dei prezzi con data nel pacchetto, per le stime in dollari equivalenti; con l'abbonamento i grafici mostrano soprattutto i token.

## Requisiti da definire all'apertura

- Privacy dei totali anonimi: in [F27](27-consumo-sito.md). Per la lettura locale: solo campi numerici, nessun testo delle conversazioni esce dal pannello.
- Cybersecurity: il pannello legge solo la cartella di Claude Code del progetto corrente, senza seguire link simbolici che escono e con un limite di dimensione, ed estrae solo i campi numerici.
- Design: grafici leggibili e accessibili (tabella equivalente, contrasto, niente informazione affidata solo al colore). Le stime hanno un'etichetta visibile che le distingue dalle misure.

## Backlog

Confermato all'apertura (2026-11-18). Le voci F24-12…F24-15 della proposta sono in [F27](27-consumo-sito.md).

| ID | Attività | Priorità |
|---|---|---|
| F24-01 | `examples/` come prova interna: README con lo scopo (confronto di modelli e versioni), procedura ripetibile, formato dei risultati con data, modello, effort e versione | P1 |
| F24-02 | Casi nuovi per i ruoli rappresentativi senza casi: AIBPD-05 Business Analyst, AICA-04 Cloud Security, AISA-08 QA (candidato a Haiku) | P1 |
| F24-03 | Misura: Opus (effort medio e basso), Sonnet e Haiku sui 7 casi, due esecuzioni per caso, con risultati in `examples/risultati/` | P0 |
| F24-04 | Tabella dei modelli per ruolo, decisa con l'utente dai risultati | P0 |
| F24-05 | `model:` nei subagent di `.claude/agents/` (anche quelli copiati da `init`), secondo la tabella | P1 |
| F24-06 | Modello consigliato nel catalogo, in `elenca_agenti` e nel testo dell'agente, con test | P1 |
| F24-07 | Regola di passaggio al modello superiore nelle regole comuni dei reparti | P2 |
| F24-08 | Test sulla dimensione del testo di ogni agente, così la biblioteca (F25) non lo gonfia senza accorgersene | P3 |
| F24-09 | README del pacchetto: modelli consigliati e come si cambiano | P2 |
| F24-10 | Lettura dei token dai file di Claude Code del progetto: spesi, cache, per agente, modello e giorno, risparmio della cache e stima del modello; con test su file finti | P0 |
| F24-11 | Pannello: pagina o sezione «Consumo» con i grafici e la tabella equivalente | P1 |

## Decisioni dai risultati (2026-11-19)

| Tema | Decisione |
|---|---|
| Modelli per ruolo | Regola prudente: Haiku ad AISA-08 QA (risultato facile da controllare); Sonnet ad AICA-04, AIPCA-02, AISA-09, AIBPD-05; AIWDA-08 resta `inherit`, perché Sonnet non passa la soglia e Haiku su un ruolo di giudizio ha solo due prove |
| Ruoli non misurati | Restano `inherit`; le misure di altri ruoli sono un rilievo aperto |
| Scheda di AIBPD-05 | Chiarita: un affinamento su T1–T3 non è falso; i conteggi del 2026-11-19 restano, annotati |

## Criteri di accettazione

- Ogni scelta di modello diversa da `inherit` ha un risultato misurato in `examples/risultati/` che supera la soglia.
- `elenca_agenti` e il testo dell'agente mostrano il modello consigliato, che viene dal catalogo; i subagent hanno lo stesso modello.
- Il consumo di token sul compito finito è riportato per ogni configurazione provata (dati di Claude Code), senza stime inventate.
- Il pannello mostra i token spesi e risparmiati della sessione e del progetto, con i grafici. Le somme coincidono con quelle calcolate a mano su un file di Claude Code di prova; le stime sono etichettate come tali.
- `npm run verify` verde.

## Fatto

- **F24-01** [`examples/README.md`](../examples/README.md): scopo (prova interna per modelli e versioni), sezione «Confronto di modelli» con la procedura ripetibile (`npm run agent-text`, un subagent per esecuzione, token per `requestId`, valutatore unico) e il formato dei risultati.
- **F24-02** Tre casi nuovi con difetti, trappole e accettabili: [AIBPD-05](../examples/casi/aibpd-05-requisiti-abbonamenti.md), [AICA-04](../examples/casi/aica-04-config-deploy.md), [AISA-08](../examples/casi/aisa-08-calcolo-sconti.md), con i progetti in `examples/progetti/`.
- **F24-03** 56 esecuzioni (7 casi × 4 configurazioni × 2) e 4 conteggi dello stesso valutatore: [`2026-11-19-modelli.md`](../examples/risultati/2026-11-19-modelli.md), con i 56 rapporti. Opus effort medio trova tutto; sul compito finito Opus effort basso costa −23%, Sonnet −52%, Haiku −96%, con più token (+4%, +22%, +64%).
- **F24-04** Tabella dei modelli decisa con l'utente (sopra).
- **F24-05** `model:` nei 56 subagent di `.claude/agents/`: `haiku` per `sw-qa-engineer`, `sonnet` per `sw-security-engineer`, `sec-cloud-security-engineer`, `privacy-gdpr-specialist`, `biz-business-analyst-requirements-strategist`, `inherit` gli altri; `init` li copia così. Test che confronta ogni subagent con il catalogo.
- **F24-06** `Model` e `models` in [`departments.ts`](../packages/catalog/src/departments.ts), `agent.model` nel catalogo; `modelAdvice` nel testo dell'agente e in `elenca_agenti`; test.
- **F24-07** Regola di riesame nelle regole comuni dei cinque reparti (sezione «Dati del progetto e segnalazioni»): su un modello più piccolo, P0/P1 o incertezza → riesame del direttore o di un revisore su Opus.
- **F24-08** Test: nessun testo di agente oltre 8 KB (oggi il più lungo, AIWDA-01, è 7,1 KB).
- **F24-09** README del pacchetto: sezione «Modelli consigliati», `elenca_agenti`, pagina «Consumo» e cosa legge il pannello.
- **F24-10** [`usage.ts`](../packages/mcp/src/usage.ts): legge `~/.claude/projects/<progetto>/` (sessioni e subagent con il tipo dal `.meta.json`), solo numeri, modello, effort e giorno; righe deduplicate per `requestId`; link simbolici e file oltre 64 MB saltati; totali per agente, modello, sessione e giorno, risparmio della cache misurato e del modello stimato; prezzi con data. Test su file finti con le somme fatte a mano.
- **F24-11** Pannello: rotta `/api/usage` (stesso cookie delle altre, letta solo all'apertura della vista) e pagina «Consumo» con riepilogo e quattro tabelle con barra, stime etichettate. Provata in Chromium sui dati di questo progetto: nessun errore in console, nessuno scroll orizzontale a 375 px.

## Verifiche

- `npm run verify` verde: 102 test.
- Pannello «Consumo» provato in Chromium (Playwright del repository del sito) sui file reali di questo progetto: 2564 risposte lette in meno di mezzo secondo, nessun file escluso.
- `npm pack --dry-run`: `usage.js` e la pagina sono nel pacchetto.
- Non fatto: la prova del pannello in un client diverso da Claude Code (senza file di Claude Code la pagina lo dice); il rilascio, che è a parte (CONVENTIONS §13.8) e vuole la voce 0.7.0 in `CHANGELOG.md`.

## Rilievi aperti

- P2 · Misure dei 50 ruoli non provati, in particolare i direttori e gli specialisti simili a quelli passati (altri cyber e privacy su Sonnet): stessi metodo e soglia, con casi nuovi e più difficili (difetti sottili, progetti più realistici: voci di F13 e F15 unite qui in F30). Rinviato in F30 a una fase dedicata (scelta dell'utente, 2026-11-21). In parte chiuso in F37 (prima ondata, [37-misura-modelli.md](37-misura-modelli.md)): 14 specialisti misurati, 12 passano a Sonnet o Haiku; direttori e ruoli di giudizio restano `inherit` per scelta. Restano da misurare 26 ruoli: AIBPD-02, 03, 04, 06–12, AIWDA-02–07, 09, 10, AICA-08, 10, 12, AIPCA-03, 09, 10, AISA-03, 06; e da rimisurare AICA-06 e AISA-04 (sotto la soglia in F37) e AIWDA-08 (un solo caso).
- P2 · AIWDA-08: Sonnet cita criteri WCAG sbagliati (2.4.11/2.4.13, 3.3.7); da valutare un chiarimento nel file di ruolo prima di rimisurare. Chiuso in F30 (F30-05): chiarimento nel file di ruolo, nuova misura su Sonnet 8/8 e 0 falsi; AIWDA-08 resta `inherit` fino a un secondo caso.
- P3 · Nelle esecuzioni che scrivono il rapporto in un file la firma con il nome in codice manca spesso: effetto del metodo, da evitare nelle prossime prove facendo restituire il rapporto. Chiuso in F30 (F30-06): metodo aggiornato in `examples/README.md`.
- P3 · Un'esecuzione Haiku ha usato `pkill -f "node server.js"`: valutare una regola comune («ferma solo i processi che hai avviato tu, per PID»). Chiuso in F30 (F30-06): regola nei cinque `00-common-rules.md`.
- P3 · Il limite delle cinque ore ha fermato 27 esecuzioni (532k token spesi senza risultato): nelle prossime misure, gruppi da 7. Chiuso in F30 (F30-06): gruppi di al più 7 in `examples/README.md`.

