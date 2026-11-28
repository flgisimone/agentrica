# Glossario

I termini del percorso «Impara», nell'ordine in cui compaiono nelle lezioni.

## Modello linguistico
Id: language-model

Programma addestrato su grandi quantità di testo che, dato un testo, prevede il seguito un [token](glossario.md#token) alla volta. È il motore di assistenti come Claude.

## Token
Id: token

Il pezzo di testo che il modello legge e scrive: una parola, una parte di parola o un segno. Prezzi, limiti e dimensione del contesto si misurano in token.

## Inferenza
Id: inference

Il calcolo con cui il modello produce una risposta. Ogni token letto o scritto è inferenza, e ha un costo.

## Addestramento
Id: training

La fase, prima dell'uso, in cui il modello impara da grandi quantità di testo regolando i suoi parametri interni. Quello che è successo dopo, il modello non lo sa.

## Allucinazione
Id: hallucination

Un'affermazione falsa ma plausibile prodotta dal modello con sicurezza, come una funzione o una norma che non esistono.

## Prompt
Id: prompt

Il testo che dai al modello: richiesta, materiale e vincoli.

## Istruzioni di sistema
Id: system-prompt

Testo che sta prima della conversazione e la orienta tutta: regole, ruolo, formato delle risposte. In inglese «system prompt».

## Assistente di codice
Id: coding-assistant

Un programma come Claude Code che usa un modello per leggere, modificare e provare il codice del tuo progetto, con il tuo permesso.

## File di ruolo
Id: role-file

In AIgentrica, il file di `agents/` che descrive un agente: missione, modo di lavorare, limiti. Il server lo consegna al modello insieme alle regole comuni del reparto.

## Contesto
Id: context

Tutto il testo che il modello legge per rispondere: istruzioni, conversazione, file, risultati dei [tool](glossario.md#tool).

## Finestra di contesto
Id: context-window

La quantità massima di [contesto](glossario.md#context), in token, che un modello può leggere in una volta.

## Cache
Id: cache

La parte iniziale del contesto che il fornitore tiene pronta fra una richiesta e l'altra, e fa pagare molto meno della prima lettura.

## Agente
Id: agent

Un modello che lavora a ciclo: decide un'azione, la esegue con un tool, guarda il risultato, decide la prossima. In AIgentrica è anche un ruolo di un reparto.

## Subagent
Id: subagent

In Claude Code, un agente avviato da un altro con un contesto suo; restituisce solo il risultato.

## Hook
Id: hook

In Claude Code, un comando che l'assistente esegue da solo in un momento preciso, per esempio a ogni richiesta, senza passare dal modello.

## Controllo deterministico
Id: deterministic-check

Un controllo fatto da un programma, che dà sempre lo stesso esito allo stesso ingresso: un test, un validatore di formato, un typecheck.

## Tool
Id: tool

Un'azione che il modello può chiedere all'assistente di eseguire, descritta da un nome, una spiegazione e i suoi parametri.

## MCP
Id: mcp

Model Context Protocol: standard aperto con cui un programma offre tool, prompt e risorse a qualsiasi assistente compatibile.

## Server MCP
Id: mcp-server

Il programma che offre tool e prompt con [MCP](glossario.md#mcp). Può girare sul tuo computer o in rete.

## Prompt MCP
Id: mcp-prompt

Un testo pronto offerto da un server MCP, che richiami con un nome. In AIgentrica c'è un prompt per ogni agente.

## Orchestrazione
Id: orchestration

Il modo in cui più agenti si dividono un lavoro: chi coordina, in che ordine lavorano, cosa si passano.

## Passaggio di consegne
Id: handover

Ciò che un agente lascia a chi segue: esito, [rilievi](glossario.md#finding) con l'evidenza e domande aperte.

## Direttore
Id: director

In AIgentrica, l'agente che coordina un reparto: sceglie gli specialisti e l'ordine, e consolida i risultati.

## Rilievo
Id: finding

Un problema trovato da un agente, con la sua evidenza (file, riga, comando) e una priorità.

## Livello di ragionamento
Id: reasoning-effort

Quanto il modello ragiona prima di rispondere. Più alto aiuta sui problemi difficili e consuma più token.

## Caso di prova
Id: test-case

Un progetto o un documento con difetti noti, usato per misurare quanti ne trova un agente e quanti ne inventa.

## Rilievo falso
Id: false-finding

Un difetto segnalato che non esiste. Pesa più di uno mancato, perché fa lavorare su un problema che non c'è.

## Limiti dell'abbonamento
Id: subscription-limits

Le quote di uso di un abbonamento a un assistente, che si azzerano dopo alcune ore o ogni settimana. I modelli grandi le consumano più in fretta.

## Prompt injection
Id: prompt-injection

Testo letto dal modello (in un file, una pagina, un'issue) che prova a dargli istruzioni diverse da quelle dell'utente.

## Privilegio minimo
Id: least-privilege

Dare a un agente, un programma o una persona solo i permessi che servono al compito, e nessuno in più.

## Dato personale
Id: personal-data

Qualsiasi informazione su una persona identificata o identificabile: nome, email, indirizzo IP, dati di salute. Nell'Unione europea la tutela il GDPR.

## Fonte
Id: source

Da dove viene un'informazione. Primaria se è l'origine (specifica, testo di legge), con una data di verifica per le cose che cambiano.

## Fase
Id: phase

Un pezzo di lavoro con obiettivo, [backlog](glossario.md#backlog), criteri di accettazione e stato, scritto in un file del piano.

## Backlog
Id: backlog

L'elenco delle attività di una fase, ciascuna con un identificativo e una priorità.

## Criteri di accettazione
Id: acceptance-criteria

Le condizioni verificabili che dicono quando una fase o un'attività è fatta.
