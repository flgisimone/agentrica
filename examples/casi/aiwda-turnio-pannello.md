# Caso AIWDA · turnio-pannello (F50, terza ondata)

- **Agenti**: nove specialisti AIWDA, ognuno con il suo compito sulla sua parte del progetto: AIWDA-02 UX Researcher, 03 UX Designer, 04 Information Architect, 05 UI Designer, 06 Design System, 07 Dashboard e Data Visualization, 08 Accessibility, 09 Usability Auditor, 10 UX Writer
- **Progetto**: [`progetti/turnio-pannello`](../progetti/turnio-pannello/), pannello web di Turnio per i responsabili dei locali: quattro pagine HTML (`index.html`, `turni.html`, `dipendenti.html`, `impostazioni.html`), token e stili (`css/`), comportamenti (`js/app.js`), mappa, componenti e glossario (`docs/`), ricerca con le interviste (`ricerca/`)
- **Perché**: ruoli di design che lavorano sui file, su difetti che si vedono solo confrontando la pagina con la ricerca, i token, il glossario o i compiti del README, e su parti corrette che sembrano sospette.
- **Configurazioni**: Opus 5.5 effort medio e Sonnet 5.5, due esecuzioni ciascuna per ruolo; Haiku per AIWDA-10, due esecuzioni (decisione dell'apertura di F50). AIWDA-08 ha qui il secondo caso che aspettava da F30.
- **Browser**: schermate fisse (decisione di F50-03, 2026-11-27): le quattro pagine a 1280 e a 390 px, a pagina intera, generate una volta con Playwright in `schermate/`, uguali per tutte le esecuzioni. I subagent non aprono il browser. I difetti della scheda si vedono tutti anche dai file.

## Compiti (argomento `task`, da copiare così come sono)

| Agente | Compito |
|---|---|
| AIWDA-02 | Rivedi in sola lettura la ricerca in `ricerca/` (protocollo, interviste, sintesi): riporta conclusioni non sostenute dalle interviste, problemi di metodo e di campione, e raccomandazioni in contrasto con i dati, con il punto del documento e la correzione proposta. |
| AIWDA-03 | Esamina in sola lettura i flussi del pannello (le pagine HTML e `js/app.js`) rispetto ai compiti del README: riporta problemi di flusso, di feedback e di stati (caricamento, vuoto, errore), con file, riga e correzione proposta. |
| AIWDA-04 | Valuta in sola lettura l'architettura informativa del pannello (menu delle pagine, `docs/mappa.md`, titoli) rispetto ai compiti del README e alla ricerca: riporta problemi di posizione delle funzioni, di nomi, di profondità e di ordine, con file e correzione proposta. |
| AIWDA-05 | Rivedi in sola lettura l'interfaccia (pagine HTML e `css/app.css`): riporta problemi di gerarchia visiva, spaziature, tipografia, colore e comportamento su telefono, con file, riga e correzione proposta. |
| AIWDA-06 | Verifica in sola lettura il design system (`css/tokens.css`, `css/app.css`, `docs/componenti.md` e l'uso dei componenti nelle pagine): riporta valori fuori dai token, componenti doppi o non documentati, varianti e stati mancanti e differenze fra documentazione e codice, con file, riga e correzione proposta. |
| AIWDA-07 | Rivedi in sola lettura il cruscotto `index.html` (numeri e grafici): riporta grafici che ingannano o non si leggono, indicatori senza contesto e scelte di colore e di forma sbagliate, con la riga e la correzione proposta. |
| AIWDA-08 | Esegui una revisione read-only dell'accessibilità delle pagine HTML, di `css/` e di `js/app.js` rispetto a WCAG 2.2 livello AA: riporta le violazioni con il criterio, file, riga e correzione proposta. |
| AIWDA-09 | Esamina in sola lettura l'usabilità del pannello (pagine HTML e `js/app.js`): riporta azioni rischiose senza protezione, errori che fanno perdere lavoro, validazioni che respingono dati corretti e comportamenti incoerenti, con file, riga e correzione proposta. |
| AIWDA-10 | Rivedi in sola lettura tutti i testi visibili del pannello (pagine HTML e messaggi in `js/app.js`) rispetto a `docs/glossario.md`: riporta termini fuori glossario, etichette e pulsanti poco chiari, messaggi di errore e di conferma da riscrivere e formati incoerenti, con file, riga e testo proposto. |

## AIWDA-02 · UX Researcher

| # | Difetto | Dove |
|---|---|---|
| U1 | «Tutti hanno chiesto più indicatori»: lo chiede solo I3; I1, I2 e I5 dicono che il cruscotto non serve o che i numeri li guarda il commercialista | `sintesi.md`, risultato 1 |
| U2 | «Il pannello si usa ogni giorno»: solo I2 e I3; I1 e I4 una volta a settimana (più gli scambi), I5 due o tre volte | `sintesi.md`, risultato 2 |
| U3 | Citazione rovesciata: I2 ha detto «Il costo lo guarda il commercialista, a me serve sapere chi manca oggi», la sintesi gli fa dire «Mi serve vedere il costo del lavoro» | `sintesi.md`, risultato 3; `interviste.md` I2 |
| U4 | Domande che suggeriscono la risposta (3 e 4: «Quanto le sarebbe utile…», «Non pensa che…»); il «tutti hanno confermato» dello scambio viene dalla domanda 4 | `protocollo.md`; `sintesi.md`, risultato 4 |
| U5 | «L'esportazione funziona e non ha richiesto commenti»: I1 dice che non trova mai il pulsante | `sintesi.md`, risultato 5; `interviste.md` I1 |
| U6 | Persona costruita su una sola intervista (I3), la più lontana dalle altre: computer in ufficio, ama i numeri e la tecnologia | `sintesi.md`, «Persona» |
| U7 | Raccomandazione «pensato per il computer» contro i dati: I1, I2 e I4 preparano i turni dal telefono, I5 a volte | `sintesi.md`, «Raccomandazioni» |
| U8 | Campione sbagliato: solo titolari del piano Plus di Bologna che hanno risposto all'invito; nessun responsabile di sala, che il README indica come utente principale | `protocollo.md`, «Partecipanti»; `README.md` |

## AIWDA-03 · UX Designer

| # | Difetto | Dove |
|---|---|---|
| X1 | L'avviso «3 scambi da approvare» del cruscotto non è un link e non porta all'azione (I4 non trova dove approvarli) | `index.html`, `.banner` |
| X2 | Nessuno stato di caricamento: i pulsanti restano attivi durante le richieste, doppio invio possibile (pubblicazione, scambio, nuovo dipendente) | `js/app.js` |
| X3 | Errori non mostrati: `console.log` nei `catch`, e pubblicazione e scambio mostrano «Fatto!» senza controllare `res.ok` (anche con un errore del server) | `js/app.js` |
| X4 | «Salva» ricarica la pagina, che torna alla settimana corrente: chi lavora alla settimana successiva la perde di vista | `js/app.js`, `save-week` |
| X5 | Il modulo del nuovo dipendente chiede 13 campi obbligatori, mentre l'invito all'app richiede solo nome e telefono (README); il resto può arrivare dopo | `dipendenti.html`, `#new-staff` |
| X6 | Ricerca senza risultati: la tabella resta vuota senza un messaggio | `js/app.js`, `search` |

## AIWDA-04 · Information Architect

| # | Difetto | Dove |
|---|---|---|
| A1 | Gli scambi da approvare, un compito di più volte a settimana, stanno dentro Impostazioni | `impostazioni.html`; `docs/mappa.md` |
| A2 | L'esportazione per il consulente è a quattro livelli (Impostazioni › Locale › Esporta › Presenze) e sotto «Locale», che sono i dati del locale; I1 non la trova | `impostazioni.html`; `docs/mappa.md` |
| A3 | Il report del costo del lavoro sta in due posti (cruscotto ed Esporta) | `docs/mappa.md` |
| A4 | L'ordine del menu segue i file nella cartella, non la frequenza dei compiti: Impostazioni prima, Turni ultima | `docs/mappa.md`; menu delle pagine |
| A5 | Una pagina con tre nomi: «Squadra» nel menu, «Personale» nel titolo, «dipendenti» nel file e nel glossario | `dipendenti.html`; `docs/mappa.md` |
| A6 | La prima pagina è il cruscotto, mentre il compito più frequente sono i turni e la ricerca dice che il cruscotto serve a pochi | `docs/mappa.md`; `README.md` |

## AIWDA-05 · UI Designer

| # | Difetto | Dove |
|---|---|---|
| V1 | Gerarchia rovesciata nei numeri del cruscotto: l'etichetta è a 18 px in grassetto, il valore a 16 px grigio | `css/app.css`, `.kpi-label`, `.kpi-value` |
| V2 | Griglia dei turni larga 1.100 px fissi (e finestra a 420 px): scorrimento orizzontale sul telefono, da cui si preparano i turni | `css/app.css`, `.week`, `.modal-box` |
| V3 | Due pulsanti primari uguali accanto, uno distruttivo: «Pubblica i turni» ed «Elimina settimana» | `turni.html` |
| V4 | Spaziature fuori dalla scala dei token (4, 8, 16, 24): 22, 13 e 7 px | `css/app.css`, `.nav`, `h1`, `h2`, `.cards`, `.week > div` |
| V5 | Dimensioni del testo fuori scala (13, 15, 17, 18 px); `h2` a 17 px si distingue appena dal corpo a 16 | `css/app.css` |
| V6 | L'arancione di «in ritardo» (#e89b3a) e quello di avviso (#e8a33d) non si distinguono | `css/tokens.css`; `css/app.css` |

## AIWDA-06 · Design System

| # | Difetto | Dove |
|---|---|---|
| D1 | Colori scritti a mano invece dei token (#1f6feb, #1a5fd0, #cf222e, #fff), mentre la documentazione dice che tutto viene dai token; `--color-primary` non è mai usato | `css/app.css` |
| D2 | Secondo pulsante `.button` (raggio 20 px, blu #2f81f7) non documentato, usato nella finestra dello scambio | `css/app.css`; `turni.html` |
| D3 | `--color-danger` definito due volte: vince #e5534b, mentre `.btn-danger` usa #cf222e, quindi due rossi diversi | `css/tokens.css`; `css/app.css` |
| D4 | Variante `.badge-orange` e token `--color-late` non documentati, quasi uguali a `warning` | `css/tokens.css`; `css/app.css` |
| D5 | Stati documentati ma assenti: nessun `:focus-visible` né `:disabled` per `.btn`, e `*:focus` toglie il contorno | `css/app.css`; `docs/componenti.md` |
| D6 | Tema scuro dichiarato ma nessun token per il tema scuro | `docs/componenti.md`; `css/tokens.css` |

## AIWDA-07 · Dashboard e Data Visualization

| # | Difetto | Dove |
|---|---|---|
| G1 | Asse delle ore da 60 a 70: sabato sembra cinque volte lunedì, ma è il 13% in più | «Ore lavorate per giorno» |
| G2 | Torta con 8 fette in sfumature di blu quasi uguali: le fette piccole non si leggono né si abbinano alla legenda; meglio barre ordinate | «Costo del lavoro per ruolo» |
| G3 | Le percentuali della torta sommano al 108% | «Costo del lavoro per ruolo» |
| G4 | Due assi con scale diverse (incassi da 20.000 €): le linee si incrociano senza significato; il dato è il rapporto, che sale da circa 23% a 31% | «Costo del lavoro e incassi» |
| G5 | Rosso e verde come unica distinzione fra le linee, con la legenda solo nel testo sotto | «Costo del lavoro e incassi» |
| G6 | L'ultima settimana dei ritardi è incompleta (dati al mercoledì) e appare come un calo, senza segnalarlo | «Ritardi per settimana» |
| G7 | Numeri senza contesto: «Costo del lavoro 31%» non dice di cosa (degli incassi) né il confronto o l'obiettivo; «Assenze 4» senza confronto | «Numeri della settimana» |

## AIWDA-08 · Accessibility

| # | Difetto | Dove | Criterio |
|---|---|---|---|
| Z1 | `lang="en"` su pagine in italiano | tutte le pagine | 3.1.1 |
| Z2 | `*:focus { outline: none }` senza un indicatore sostitutivo | `css/app.css` | 2.4.7 |
| Z3 | Pulsanti con la sola icona senza nome accessibile (◀ ▶ ⇄ ✎ 🗑) | `turni.html`, `dipendenti.html` | 4.1.2 |
| Z4 | Campi del modulo e ricerca senza etichetta, solo il segnaposto; l'errore non è collegato al campo | `dipendenti.html` | 1.3.1, 3.3.2 |
| Z5 | Finestra dello scambio senza `role="dialog"`, focus non spostato né restituito, chiusura con uno `span` che non si raggiunge da tastiera | `turni.html`; `js/app.js` | 2.1.1, 2.4.3, 4.1.2 |
| Z6 | Griglia dei turni fatta di `div`, senza intestazioni di riga e di colonna | `turni.html` | 1.3.1 |
| Z7 | Stato del turno solo con il colore del puntino; la legenda ha tre «●» uguali | `turni.html` | 1.4.1 |
| Z8 | Contrasto insufficiente: `.muted` #9aa0a6 su bianco circa 2,6:1 per testi informativi; testo bianco sul badge di avviso #e8a33d circa 2,2:1 | `css/app.css`, `css/tokens.css` | 1.4.3 |
| Z9 | Messaggio «Fatto!» non annunciato (nessun `role="status"`) e visibile solo 1,5 secondi | `js/app.js`, `toast` | 4.1.3, 2.2.1 |

## AIWDA-09 · Usability Auditor

| # | Difetto | Dove |
|---|---|---|
| Y1 | «Elimina settimana» senza conferma né annullamento, accanto a «Pubblica i turni» e con lo stesso stile | `turni.html`; `js/app.js` |
| Y2 | Un errore del server svuota il modulo del nuovo dipendente (`form.reset()`): 13 campi da riscrivere | `js/app.js` |
| Y3 | Il telefono accetta solo 10 cifre di fila: rifiuta spazi e +39, e anche il formato con cui l'elenco mostra i numeri («333 120 4455») | `js/app.js`; `dipendenti.html` |
| Y4 | Eliminazione del locale con un `confirm` generico, senza dire cosa si perde, senza esportazione né conferma forte, irreversibile | `js/app.js`; `impostazioni.html` |
| Y5 | Salvataggio incoerente: automatico e senza riscontro nelle impostazioni, con «Salva» nei turni, con «Procedi» nel modulo | `js/app.js`; pagine |
| Y6 | Uscita automatica dopo 10 minuti dal caricamento, senza avviso e anche se si sta lavorando: chi prepara i turni perde le modifiche non salvate | `js/app.js` |

## AIWDA-10 · UX Writer

| # | Difetto | Dove |
|---|---|---|
| W1 | Termini fuori dal glossario: «Swap» e «fascia» (finestra dello scambio), «collaboratore» (ricerca), «risorsa» («Aggiungi una risorsa»), «negozio» («Nome del negozio») | `turni.html`, `dipendenti.html`, `impostazioni.html` |
| W2 | Menu e titolo in inglese: «Settings», «Dashboard» | tutte le pagine; `index.html` |
| W3 | Pulsanti senza l'azione: «OK», «No», «Procedi», «Clicca qui» | `turni.html`, `impostazioni.html`, `dipendenti.html` |
| W4 | Errori che danno la colpa o sono tecnici, senza dire cosa fare: «Hai sbagliato il numero.», «Errore 422: payload non valido» | `js/app.js` |
| W5 | «Fatto!» per pubblicazione, scambio e dipendente: non dice cosa è successo | `js/app.js` |
| W6 | Date in formati diversi dalla regola («lun 3 feb»): «02/11 – 08/11», «2026-11-07», «gg/mm/aaaa» e «aaaa-mm-gg» nello stesso modulo | `turni.html`, `impostazioni.html`, `dipendenti.html` |
| W7 | Conferma dell'eliminazione «Vuoi davvero procedere?»: non dice cosa si elimina né che è irreversibile | `js/app.js` |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta | Ruoli |
|---|---|---|---|
| T1 | Collegamento «Vai al contenuto» che compare con il focus | funziona | AIWDA-05, 08 |
| T2 | Tabella dei dipendenti con `caption` e `th scope="col"` | semantica corretta | AIWDA-08 |
| T3 | `role="alert"` sul messaggio d'errore del modulo | annuncio corretto (il difetto è il collegamento al campo) | AIWDA-08 |
| T4 | `prefers-reduced-motion` rispettato | corretto | AIWDA-06, 08 |
| T5 | Blu primario #1f6feb su bianco, e bianco su #1f6feb | contrasto circa 4,6:1, sopra 4,5:1 | AIWDA-05, 06, 08 |
| T6 | `details` e `summary` nativi per le sezioni delle impostazioni | apribili da tastiera e annunciati (il difetto è la profondità) | AIWDA-04, 08 |
| T7 | Scala delle spaziature 4, 8, 16, 24 nei token | scala coerente (il difetto è che `app.css` non la usa) | AIWDA-05, 06 |
| T8 | Barre delle ore con i valori scritti sotto il grafico | alternativa testuale dei valori | AIWDA-07, 08 |
| T9 | Asse dei ritardi da 0 | corretto per i conteggi | AIWDA-07 |
| T10 | «Pubblica i turni», «Scarica il report», «I campi con * sono obbligatori» | verbo d'azione e regola chiara | AIWDA-10 |
| T11 | Interviste dichiarate inventate | progetto di prova | AIWDA-02 |
| T12 | Pannello solo per responsabili e titolari, i dipendenti usano l'app | perimetro voluto | AIWDA-02, 03, 04 |

Un rilievo che presenta una trappola come difetto conta come **falso**; un consiglio di irrobustimento su di essa no.

## Accettabili ma non richiesti

Non contano come falsi né come extra validi.

- **AIWDA-02**: cinque interviste sono poche; buono o compenso non dichiarato; nessuna osservazione sul campo.
- **AIWDA-03**: «Pubblica i turni» senza anteprima di chi riceve la notifica; nessun modo di annullare uno scambio approvato; finestra dello scambio senza i dettagli del collega.
- **AIWDA-04**: route e nomi dei file in inglese o misti; «Zona pericolosa» come etichetta; nessuna navigazione fra le settimane oltre le frecce.
- **AIWDA-05**: legenda della torta con puntini piccoli; nessuno stato attivo visibile oltre il grassetto nel menu; `title` uguale in tutte le pagine.
- **AIWDA-06**: token primitivi (`--blue-500`) accanto ai semantici; `.icon-btn` senza token; `.toast` senza token di colore.
- **AIWDA-07**: grafici SVG senza titolo o descrizione; nessuna data di aggiornamento sui numeri; torta senza etichette sulle fette.
- **AIWDA-08**: grafici SVG senza alternativa testuale (salvo le barre); `title` uguale in tutte le pagine (2.4.2); emoji nell'avviso degli scambi; area dei pulsanti con icona piccola (2.5.8).
- **AIWDA-09**: ricerca che non dice quanti risultati; nessuna esportazione prima dell'eliminazione delle settimane; «No» degli scambi senza motivo.
- **AIWDA-10**: «report» e «Dashboard» come anglicismi d'uso; «Zona pericolosa»; «Le modifiche si salvano da sole» senza dire quando.

## Regole di conteggio

Quelle del [README](../README.md#come-si-conta). Ogni esecuzione si conta solo sulla tabella del suo ruolo: un difetto di un altro ruolo trovato in più non è extra valido ma accettabile. Per AIWDA-08 un criterio WCAG sbagliato (inesistente o che dice altro) conta come falso, come in F30.
