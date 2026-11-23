# F36 — Hero animata e coerenza di sito e documenti

**Obiettivo**: la home del sito ha una hero animata che mostra come lavorano gli agenti (catalogo, attivazione su richiesta, gerarchia, ordine fra reparti, fase, conferma dell'utente), nella palette e con i dati del sito. Il sito dice tutto ciò che il server MCP fa oggi (0.11.0) e niente che non faccia. README e file Markdown dei due repository sono allineati al posizionamento di F28: Agentrica è un progetto, non una società di consulenza.

> **Stato: completata (0.11.1 da pubblicare, pacchetto e sito insieme).**

**Agenzie**: design (UI Designer per palette e layout, Accessibility Specialist per animazione, contrasto e lettori di schermo, UX Writer per i testi della hero e la frase del posizionamento, revisione nell'app); software (Frontend per la hero nel sito, Performance per canvas e peso della pagina, QA, Code Reviewer); business (Product Marketing Manager solo per la frase che sostituisce «società di consulenza fittizia»).

## Situazione di partenza

Verifica del 2026-11-23 su `develop` dei due repository (pacchetto 0.11.0, sito con `@agentrica/mcp` 0.11.0).

### La hero proposta (`agentrica-hero.html`)

Pagina HTML autonoma: canvas con le cinque costellazioni, didascalie in sei capitoli, terminale simulato, domanda `ask_user`, binario dell'ordine fra reparti; loop di circa 50 s, italiano e inglese.

- **Palette: coerente.** Fondo `#070b16`, testo `#e8ebf4`, testo attenuato `#a8b1c7`, superficie `#141d33` e i cinque accenti (`#f5b544`, `#ff7a6b`, `#b49cff`, `#38d6f0`, `#4fe0a8`) sono gli stessi token di `globals.css` del sito. Scarti minori: `--surface` `#0e1527` contro `--card` `#0d1426`, `--line` `rgba(232,235,244,0.14)` contro `--border` `#222d48`.
- **Contrasto: un problema.** `--mute` (`rgba(232,235,244,0.42)`, circa `#656973` sul fondo) ha un rapporto di circa 3,6:1: sotto AA per i testi piccoli in cui è usato (voci non attive del binario, numeri delle opzioni della domanda, prompt del terminale).
- **Dati: coerenti con il catalogo e con il server.** Sigle, nomi dei reparti, stelle e numeri (56; 12, 12, 10, 12, 10) corrispondono a `packages/catalog/src/departments.ts`; gli agenti del copione hanno la stella giusta (AIBPD-05 ALGIEBA, AIWDA-03 HADAR, AISA-12 MIRFAK…); 14 agenti consultati su 56 è il conto giusto. Tool (`list_agents`, `agent`, `ask_user`), pannello locale acceso di predefinito, direttore 01 prima degli specialisti e ordine fra reparti corrispondono alle istruzioni del server (`texts/it.ts`) e al README del pacchetto.
- **Non si può incollare così com'è.** Copia a mano i dati del catalogo (titoli dei ruoli, stelle) e i testi, invece di leggerli da `getCatalog` e `src/i18n/` (decisione «Fonte unica»); incorpora i font in base64 (centinaia di KB) mentre il sito li carica con `next/font`; lo script imposta `font-size` su `<html>` e mette `#app` in `position: fixed` con `overflow: hidden` su `body`, cose che nel sito cambierebbero il `rem` di tutte le pagine e bloccherebbero lo scorrimento; il comando `npx -y @agentrica/mcp install` è senza versione, mentre il sito usa `mcpCommands` (`scripts.ts`) a versione esatta.
- **Già a posto**: etichetta «SIMULAZIONE», pulsante di pausa (WCAG 2.2.2), `prefers-reduced-motion` con un fotogramma fermo, pausa fuori schermo, testo per i lettori di schermo.

### Il sito rispetto al server MCP

- **Coperti**: `install`, `add`, `init` e `init --existing`, `configura`, `valuta`, `progetto`, i flag `--agents`, `--subagents`, `--lang`, `--no-panel`, `--no-ratings`, `--no-update-check`, i tool `list_agents`, `ask_user`, `open_panel`, `rate_agent`, `share_usage`, `submit_project`, i modelli consigliati, l'orchestrazione (`/orchestrazione`), le versioni (`/rilasci` dal CHANGELOG).
- **Mancante: la biblioteca.** Il tool `library`, le schede con fonte e data per reparto e il ciclo di studio (F25) non compaiono in nessuna pagina del sito.
- **Da controllare**: che le pagine reparto e agente dicano cosa arriva al modello (regole comuni, file di ruolo, indice della biblioteca).

### README e Markdown

- **Frase della missione vecchia** («società di consulenza fittizia», «fictional consulting firm», «società fittizia», «fictional company»), contraria al posizionamento deciso in F28: `README.md` e `README.it.md` (riga 7), `CONVENTIONS.md` §1, `plan/README.md` (introduzione e glossario: «Agentrica» (la società)), `packages/mcp/README.md` e `README.it.md` (Licenza), nel sito `note-legali/content-it.tsx` e `content-en.tsx`. Il footer del sito ha già la frase giusta: «Agentrica è un progetto, non una società».
- **README della radice superato**: comando d'installazione alla 0.8.1; «due obiettivi» con il sito come primo obiettivo di questo repository, mentre da F17 il sito è nel repository privato; «oggi Software e Web Design» come agenzie attive, mentre da F5 sono attive anche Privacy e Cybersecurity. Il README inglese (75 righe) e quello italiano (112) sono diversi: va controllato che dicano le stesse cose.
- **CONVENTIONS §1**: «un server MCP renderà gli stessi agenti usabili» (il server c'è dalla 0.1.0).
- **`plan/README.md`**: una riga vuota fra F30 e F31 spezza la tabella «Fasi» in due.
- **Ordine fra reparti**: `AGENTS.md` e lo starter mettono il Code Reviewer prima dell'ultima conferma; le istruzioni del server e il README del pacchetto no.
- Le altre occorrenze di «consulenza» e «fittizi» nei file di ruolo («audit e consulenza», «dati fittizi») descrivono il modo di lavorare degli agenti, non Agentrica: restano.

## Decisioni all'apertura (2026-11-23)

- **Posto della hero**: prima schermata intera della home, con titolo, comando d'installazione e pulsanti sopra la simulazione, in HTML.
- **Frase del posizionamento**: «Agentrica è un server MCP con agenti IA organizzati in reparti, da usare nei tuoi progetti» (inglese: «Agentrica is an MCP server with AI agents organised in departments, for use in your projects»), al posto di «società di consulenza fittizia» e varianti. Nei testi scritti a mano nessun numero di agenti o di reparti (scelta dell'utente, 2026-11-23): cambiano col catalogo; i testi generati dal catalogo, come i capitoli della hero, li calcolano.
- **Biblioteca sul sito**: paragrafo in `/installa` e, nella pagina di ogni reparto, l'elenco delle schede (titolo, fonte, data di verifica) lette dal catalogo.
- **Rilascio e ordine fra reparti**: il Code Reviewer entra nell'ordine delle istruzioni del server e del README del pacchetto, come in `AGENTS.md`; pacchetto e sito alla 0.11.1, pubblicati insieme in un rilascio a parte su richiesta dell'utente.
- La pianificazione e lo sviluppo sono nella stessa sessione, su richiesta dell'utente.

## Backlog

| # | Attività | Priorità |
|---|---|---|
| F36-01 | Hero nel sito come componente client (`src/components/`): canvas e copione dalla pagina proposta; reparti, ruoli e stelle da `getCatalog(lang)`, testi in `src/i18n/it.ts` ed `en.ts`, comando da `mcpCommands`; font del sito, nessun font incorporato; misure relative al contenitore, non a `<html>`; nessun `position: fixed` né `overflow` su `body` | P1 |
| F36-02 | Palette e contrasto: colori della hero dai token di `globals.css` (`--card`, `--border`, accenti dei reparti); testo attenuato almeno 4,5:1 per i testi piccoli; controllo di Accessibility Specialist e UI Designer prima e dopo | P1 |
| F36-03 | Accessibilità e prestazioni: titolo `h1` e comando restano HTML (LCP), pausa, `prefers-reduced-motion`, pausa fuori schermo e testo per i lettori di schermo conservati; versione verticale per i telefoni; misura del peso della pagina e dei fotogrammi prima e dopo (Performance) | P1 |
| F36-04 | Frase del posizionamento al posto di «società di consulenza fittizia» e varianti: `README.md`, `README.it.md`, `CONVENTIONS.md` §1, `plan/README.md` (introduzione e glossario), `packages/mcp/README.md` e `README.it.md`, note legali del sito it/en | P1 |
| F36-05 | README della radice it/en: comando alla versione corrente, scopo del repository dopo F17, agenzie attive come in `AGENTS.md`; le due lingue con lo stesso contenuto | P2 |
| F36-06 | Coerenza degli altri Markdown: CONVENTIONS §1 («renderà»), tabella «Fasi» di `plan/README.md` intera, `docs/README.md`, README dei reparti, `starter/` (it/en); ordine fra reparti uguale in `AGENTS.md`, starter, istruzioni e README del server (decisione sul Code Reviewer) | P2 |
| F36-07 | Biblioteca sul sito secondo la decisione dell'apertura: tool `library`, schede con fonte e data, ciclo di studio; dati dal catalogo, testi it/en | P2 |
| F36-08 | Verifica sito contro server: per ogni comando, flag e tool del README del pacchetto, la pagina del sito che lo dice e il testo giusto; le differenze diventano voci corrette in questa fase o rilievi | P2 |
| F36-09 | Prove: `npm run verify` nei due repository, `verify:e2e` del sito con la home (axe senza violazioni), prova in `next dev` di `/it` ed `/en` su desktop e telefono, con e senza movimento ridotto | P1 |

## Criteri di accettazione

- La home in `/it` ed `/en` mostra la hero animata con i colori dei token del sito; nessun testo della hero sotto 4,5:1 (3:1 per i testi grandi).
- Reparti, ruoli, stelle e comando della hero vengono dal catalogo e da `mcpCommands`: cambiando un ruolo in `agents/` cambia anche la hero.
- Le altre pagine del sito non cambiano misure né scorrimento; nessun font incorporato.
- Con movimento ridotto la hero è ferma; il pulsante di pausa la ferma e la riprende; axe non trova violazioni nella home.
- Nessun file dei due repository descrive Agentrica come società di consulenza o società fittizia.
- Il sito nomina ogni comando, flag e tool del server 0.11.0 (o la versione del rilascio di questa fase), e non ne nomina di inesistenti.
- `npm run verify` passa nei due repository; `npm run verify:e2e` del sito passa.

## Richieste durante la fase (2026-11-23)

- Niente terminale nella hero (c'è già in «Come lavoriamo»); titolo, comando e pulsanti restano sopra la simulazione.
- Nessun numero di agenti o di reparti nei testi scritti a mano, né nella hero; la hero non elenca i reparti.
- Niente «costellazioni» e «stelle» come concetto nei testi del sito: il cielo è solo il disegno. Restano i nomi in codice (dati) e le stelle del voto.
- Hero alta quanto lo schermo sul computer (MacBook 14"), binario su una riga, titolo del reparto staccato dall'orbita, domanda `ask_user` accanto a «TU» e sotto il binario.

## Fatto

- **F36-01** `src/components/hero-sim.tsx` (sito): simulazione su canvas come componente client; reparti, ruoli e nomi in codice da `getCatalog`, testi in `src/i18n` (`heroSim`), titolo e comando in HTML come `children`; nessun font incorporato, misure dal contenitore (`.hs-stage`), `<html>` e `body` intatti. Sostituisce la mappa della home (`SkyMap` tolta; `DepartmentSky` resta nella pagina del reparto).
- **F36-02** Colori letti dai token di `globals.css` (`--foreground`, `--muted-foreground`, `--card`, `--destructive`, accenti dei reparti); testo attenuato portato a `rgb(232 235 244 / 0.6)`, circa 6,3:1 sul fondo.
- **F36-03** Pausa con testo visibile già nell'HTML (axe `button-name`), «riduci movimento» con un fotogramma fermo, pausa fuori schermo, paragrafo `sr-only`. Sul computer la hero è alta `100svh` meno l'header (34 rem al minimo), titolo e didascalia scalano con l'altezza, sotto 44 rem di altezza spariscono il testo introduttivo e la seconda riga della didascalia; in verticale binario sopra la scena.
- **F36-04** Frase «Agentrica è un server MCP con agenti IA organizzati in reparti, da usare nei tuoi progetti» in `README.md`, `README.it.md`, `CONVENTIONS.md` §1, `plan/README.md` (introduzione e glossario), README del pacchetto it/en (anche senza «56 agenti» in apertura e in `--agents`), note legali del sito it/en.
- **F36-05** README della radice it/en: comando alla 0.11.1, il repository contiene server MCP e catalogo (il sito è privato), agenzie attive rimandate ad `AGENTS.md`.
- **F36-06** CONVENTIONS §1 senza «renderà»; tabella «Fasi» di `plan/README.md` intera; Code Reviewer nell'ordine fra reparti delle istruzioni del server (it/en) e del README del pacchetto; CHANGELOG it/en 0.11.1; versione 0.11.1 in `package.json`, `server.json`, `prompt.ts`, `package-lock.json`, README del pacchetto.
- **F36-07** Biblioteca sul sito: sezione «Biblioteca» nella pagina di ogni reparto (titolo, fonte, versione, data di verifica, ruoli) dal catalogo; paragrafo in `/installa` (it/en) su tool `library`, rilevatore e revisione del titolare.
- **F36-08** Confronto sito/server: coperti comandi, flag e tool; mancavano la biblioteca (F36-07) e il tool `report`, ora in `/orchestrazione` (it/en). Testi senza «costellazioni» e «nome in codice di stella»; hero senza numeri.
- **F36-09** Correzione trovata provando: Next scorreva oltre la hero al cambio di lingua o tornando alla home, perché la pagina cominciava sopra lo `scroll-padding-top` (5,5 rem); ora `scroll-padding-top` è l'altezza dell'header e le ancore hanno `scroll-margin-top`.

## Verifiche

- Pacchetto: `npm run verify` passa (173 test).
- Sito: `npm run verify` passa (70 test); Playwright con il solo server di produzione: 113 test passati, axe compreso (home, reparti, installa, orchestrazione, inglese).
- Prova visiva in `next dev` a 1512×790, 1280×720, 1920×960 e 390×844: nessuno scorrimento orizzontale, `font-size` della radice invariato, hero intera nello schermo sul computer, nessun errore in console; cambio di lingua e logo restano in cima.
- Non provati: gli spec e2e con i dati finti (`con progetti`, `con i totali`), perché il loro `next dev` non parte mentre è aperto il `next dev` dell'utente sulla porta 3000 nella stessa cartella.

## Rilievi aperti

- F36-R1 (P3): sul telefono la hero è più alta dello schermo (titolo, scena e didascalia non entrano in 844 px); la richiesta riguardava il computer.
- F36-R2 (P3): `package-lock.json` ha ancora la voce del workspace `apps/site`, uscito in F17.
- F36-R3 (P3): il README della radice ha ancora il numero di agenti per reparto nella tabella dei reparti e `AGENTS.md` «56 in tutto» per i subagent: sono descrizioni del repository, da decidere se togliere.
