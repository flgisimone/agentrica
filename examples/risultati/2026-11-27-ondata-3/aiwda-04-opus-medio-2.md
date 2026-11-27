AIWDA-04 · ACRUX, Senior Information Architect, reparto AIWDA (AI Web Design)

Nota di processo: in questa sessione non ho i tool `agent` e `library`, quindi non ho potuto caricare AIWDA-01 · CANOPUS. Consegno il rapporto a chi mi ha avviato, perché lo passi al direttore. La scheda della biblioteca l'ho letta con `npm run -s agent-text -- aiwda-04 --cards wcag-2-2`.

## Esito

Ho lavorato in sola lettura sul progetto `copie/aiwda-04-2` (Turnio, pannello per i responsabili). Ho letto le quattro pagine HTML, `js/app.js`, `docs/mappa.md`, `docs/glossario.md`, il README e i tre file di `ricerca/`. Ho guardato due schermate: `impostazioni-telefono.png` e `index-computer.png`. Non ho modificato nessun file e non ho avviato nessun processo.

L'architettura informativa del pannello è organizzata al contrario rispetto ai compiti del README:
- il secondo compito per frequenza (approvare gli scambi) e il quarto (esportare le presenze) stanno dentro «Settings», in sezioni chiuse;
- il menu mette per prima la voce usata più di rado;
- nomi delle voci e titoli delle pagine non coincidono;
- `docs/mappa.md` non descrive le pagine reali.

La sintesi della ricerca, su cui si basano alcune di queste scelte, non corrisponde alle interviste.

## Mappa della struttura osservata

Menu identico in tutte le pagine (`*.html`, righe 11-16), in quest'ordine:

1. **Settings** → `impostazioni.html`, h1 «Impostazioni» (sezioni `<details>`, tutte chiuse al caricamento)
   - Locale (nome del negozio, orari di apertura)
     - Esporta
       - Presenze per il consulente (mese + «Clicca qui»): livello 4
       - Report del costo del lavoro («Scarica il report»): livello 4
   - Scambi da approvare (badge 3), con tabella OK/No: livello 2
   - Zona pericolosa → Elimina locale
2. **Dashboard** → `index.html`, h1 «Dashboard», pagina iniziale dopo l'accesso (`mappa.md:10`). Contiene il banner «🔔 3 scambi da approvare» (testo semplice, non un link), 3 indicatori e 4 grafici.
3. **Squadra** → `dipendenti.html`, h1 «Personale»: ricerca «Cerca un collaboratore», tabella «Dipendenti del locale», h2 «Aggiungi una risorsa».
4. **Turni** → `turni.html`, h1 «Turni»: settimana, Pubblica/Elimina/Salva, griglia, finestra «Swap del turno».

Il `<title>` è «Turnio» in tutte e quattro le pagine.

## Rilievi

**ACRUX-01 · P1 · Gli scambi da approvare sono nascosti in «Settings»**
- Evidenza:
  - `impostazioni.html:41-51`: la tabella degli scambi sta in un `<details>` chiuso di Impostazioni.
  - `index.html:22-24`: il banner «3 scambi da approvare» è uno `<span>` senza link.
  - `docs/mappa.md:5`.
  - Schermata `impostazioni-telefono.png`.
- Ricerca: I4 dice «Mi arriva la notifica ma poi nel pannello non capisco dove approvarli» (`ricerca/interviste.md:32`). La raccomandazione «Lo scambio dei turni resta nelle impostazioni» (`ricerca/sintesi.md:21`) confonde la configurazione con l'approvazione, che è un compito operativo ripetuto più volte a settimana (README:15).
- Impatto: il secondo compito per frequenza si trova solo per memoria, dentro una voce che chi usa il pannello associa a modifiche rare.
- Correzione: portare «Scambi da approvare» fuori da Impostazioni. Due opzioni, da decidere con l'utente:
  - (a) una voce di menu «Scambi» con il contatore;
  - (b) una sezione in cima a `turni.html`, sopra la griglia.
  
  In entrambi i casi il banner della pagina iniziale diventa un link alla nuova posizione e la notifica dell'app porta lì. Aggiornare `mappa.md`.

**ACRUX-02 · P1 · L'esportazione delle presenze è al quarto livello, sotto «Locale»**
- Evidenza:
  - `impostazioni.html:22-33`: il percorso è Impostazioni › Locale › Esporta › Presenze per il consulente, con tre `<details>` annidati da aprire.
  - `docs/mappa.md:12` dichiara questa annidatura.
  - Il pulsante si chiama «Clicca qui» (`impostazioni.html:32`).
  - I1: «non trovo mai dove sta il pulsante» (`interviste.md:11`). La sintesi invece dice che l'esportazione «funziona» (`sintesi.md:11`).
- Impatto: un compito mensile, quindi difficile da ricordare, è sepolto in una categoria che non c'entra: l'esportazione non è un dato del locale.
- Correzione: una voce di menu «Presenze», oppure una sezione di primo livello in Impostazioni, al massimo a un livello dal menu. Pulsante con verbo e oggetto, per esempio «Esporta le presenze di ottobre». Niente `<details>` annidati.

**ACRUX-03 · P2 · L'ordine del menu e la pagina iniziale non seguono i compiti**
- Evidenza:
  - Il menu è Settings, Dashboard, Squadra, Turni (`*.html:12-15`). Secondo `mappa.md:10` «l'ordine del menu segue quello delle pagine nella cartella».
  - La pagina iniziale è il cruscotto (`mappa.md:10`, `sintesi.md:19`).
  - I compiti del README, per frequenza, sono: turni, scambi, dipendenti, presenze, impostazioni (README:14-18).
- Impatto: la voce più rara è la prima e il compito principale (Turni) è l'ultimo. Il responsabile di sala, che apre il pannello per preparare la settimana, deve fare un passaggio in più a ogni accesso.
- Correzione: ordinare le voci per frequenza e mettere le impostazioni in fondo: Turni · Scambi (se si sceglie l'opzione a di ACRUX-01) · Dipendenti · Presenze · Cruscotto · Impostazioni. Pagina iniziale: Turni sulla settimana corrente. La scelta della pagina iniziale va confermata dall'utente (vedi ACRUX-07).

**ACRUX-04 · P2 · Voci del menu, titoli h1 e glossario non coincidono**
- Evidenza:
  - «Settings» nel menu, «Impostazioni» nell'h1 (`impostazioni.html:12,19`).
  - «Dashboard» (menu e h1, `index.html:13,19`), mentre README:24 e la ricerca dicono «cruscotto».
  - Per la stessa entità: «Squadra» nel menu, «Personale» nell'h1, «Dipendenti» nella didascalia e nel nome del file, «collaboratore» e «risorsa» in `dipendenti.html:14,19,20,23,32`. Il glossario (`docs/glossario.md:8`) prescrive «dipendente» e vieta «collaboratore», «staff» e «risorsa».
- Impatto: la voce cliccata non conferma la pagina d'arrivo e i sinonimi fanno pensare a entità diverse. Il menu mischia italiano e inglese.
- Correzione: un solo nome per pagina, uguale nel menu, nell'h1 e nel `<title>`: «Turni», «Dipendenti», «Cruscotto», «Impostazioni». Per gli altri termini vietati (vedi ACRUX-08) coinvolgere AIWDA UX Writer.

**ACRUX-05 · P2 · Le pagine non hanno un titolo distinto**
- Evidenza: `<title>Turnio</title>` in `index.html:6`, `turni.html:6`, `dipendenti.html:6` e `impostazioni.html:6`. In più, `lang="en"` su pagine in italiano (riga 2 di ogni file).
- Impatto: le schede del browser, la cronologia e i lettori di schermo non dicono dove ci si trova. Non è soddisfatto WCAG 2.2, criterio 2.4.2 Page Titled (livello A). Il criterio non è descritto nella scheda `wcag-2-2` della biblioteca (W3C, 2.2, verificata il 2026-11-19), che copre solo i criteri nuovi: la citazione viene dal testo della norma, non dalla scheda. `lang` va al criterio 3.1.1, da passare all'Accessibility Specialist.
- Correzione: `<title>` nella forma «Turni · Trattoria Il Ponte · Turnio», uguale all'h1, e `lang="it"`.

**ACRUX-06 · P2 · `docs/mappa.md` non descrive il pannello e il report del costo del lavoro ha due posizioni**
- Evidenza:
  - `mappa.md:5` mette i «ruoli» in Settings, ma in `impostazioni.html` non c'è una sezione ruoli.
  - `mappa.md:6` mette il «report del costo del lavoro» nella Dashboard, ma in `index.html` non c'è: esiste solo in Impostazioni › Locale › Esporta (`impostazioni.html:34-37`).
  - `mappa.md:5` lo elenca anche in Settings.
- Impatto: chi progetta o sviluppa basandosi sulla mappa trova funzioni che non esistono o che stanno altrove. Il report del titolare finisce in una categoria di configurazione.
- Correzione: dare al report un'unica posizione (proposta: Cruscotto, la pagina del titolare, oppure Presenze se si crea quella voce). Riscrivere `mappa.md` dalle pagine reali, con route, h1, `<title>` e profondità di ogni funzione. Non elencare i ruoli finché la sezione non esiste.

**ACRUX-07 · P2 · La sintesi della ricerca non riflette le interviste e non giustifica le scelte di struttura** (`requires_human_review: true`)
- Evidenza:
  - `sintesi.md:7` dice «Tutti gli intervistati hanno chiesto più indicatori». Solo I3 lo chiede (`interviste.md:23`); I1, I2 e I5 lo smentiscono (`interviste.md:9,16,39`).
  - `sintesi.md:8` dice «ogni giorno»: solo I2 e I3 aprono il pannello ogni giorno; I1 una volta a settimana, I4 la domenica e per gli scambi, I5 due o tre volte.
  - Quattro intervistati su cinque usano il telefono (`interviste.md:7,15,29,36`), ma la raccomandazione è «pensato per il computer» (`sintesi.md:19`).
  - La persona «Marco» corrisponde al solo I3 (`sintesi.md:15`).
  - Le domande 3 e 4 suggeriscono la risposta (`protocollo.md:11-12`).
  - Il campione è di soli titolari di clienti Plus a Bologna (`protocollo.md:4`), senza il responsabile di sala, che è l'utente principale (README:9).
- Impatto: le scelte di struttura che si appoggiano alla sintesi (cruscotto come pagina iniziale, scambi in Impostazioni, priorità al computer) non hanno basi nei dati.
- Correzione: ricavare la struttura dai compiti del README e dalle note delle interviste. Rivedere la sintesi e intervistare anche i responsabili di sala con domande non suggestive. Da sottoporre all'AIWDA UX Researcher e all'utente.

**ACRUX-08 · P3 · «Scambio» ha due significati e in Turni compaiono termini vietati**
- Evidenza:
  - In `turni.html:37,51-54` il pulsante ⇄ apre «Swap del turno», in cui il responsabile assegna il turno a un collega, con «fascia» e «OK».
  - `mappa.md:8` chiama questa azione «scambio di un turno».
  - Il glossario definisce lo scambio come «un dipendente cede il suo turno a un collega» e vieta «swap» e «fascia» (`glossario.md:7,9`).
  - Anche «Nome del negozio» (`impostazioni.html:24`) usa un termine vietato.
- Impatto: la riassegnazione decisa dal responsabile si confonde con lo scambio chiesto dai dipendenti, che va approvato (ACRUX-01).
- Correzione: chiamare l'azione in Turni «Assegna a un collega» e tenere «scambio» solo per le richieste dei dipendenti. «Nome del locale». Testi da passare all'AIWDA UX Writer.

## Struttura proposta (da confermare con l'utente)

| Ordine | Voce del menu = h1 = title | Pagina | Contenuto | Profondità massima |
|---|---|---|---|---|
| 1 | Turni (pagina iniziale) | turni.html | settimana, pubblicazione, assegnazione a un collega; scambi da approvare se si sceglie l'opzione b | 1 |
| 2 | Scambi (con contatore), solo con l'opzione a | nuova o sezione | richieste dei dipendenti, Approva/Rifiuta | 1 |
| 3 | Dipendenti | dipendenti.html | elenco, ricerca, aggiunta | 1 |
| 4 | Presenze | nuova o sezione | esportazione mensile per il consulente, report del costo del lavoro | 1 |
| 5 | Cruscotto | index.html | numeri e grafici per il titolare; il banner degli scambi diventa un link | 1 |
| 6 | Impostazioni | impostazioni.html | dati del locale, orari, zona pericolosa | 2 |

La logica di business resta la stessa: si spostano posizioni e nomi, non le funzioni.

## Scenari esaminati

- Dalla pagina iniziale, approvare uno scambio.
- Esportare le presenze di ottobre.
- Aggiungere un dipendente.
- Confronto fra menu, h1, `<title>`, `mappa.md` e glossario.

Tutti esaminati sul codice e su due schermate, non in un browser.

## Limiti

- Pagine statiche senza server: non ho osservato notifiche, accesso o permessi, e non ne ho dedotti.
- Le schermate di Turni e Dipendenti non le ho guardate: ho valutato solo il codice.
- Per WCAG 2.4.2 la scheda della biblioteca non contiene il criterio. Non avevo accesso al web per verificarlo sulla fonte, quindi va confermato dall'Accessibility Specialist.

## Domande aperte per l'utente

1. Scambi da approvare: voce di menu propria (a) o sezione nella pagina Turni (b)?
2. Pagina iniziale: Turni oppure Cruscotto? Per esempio Turni per il responsabile e Cruscotto per il titolare, se i ruoli sono distinguibili all'accesso.
3. Il report del costo del lavoro va nel Cruscotto o in Presenze?

## Riepilogo

8 rilievi: 2 P1, 5 P2, 1 P3. La correzione più urgente è riportare scambi ed esportazione delle presenze al primo livello, fuori da Impostazioni, e ordinare il menu per frequenza dei compiti.

— ACRUX (AIWDA-04)
