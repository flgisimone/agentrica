AIWDA-04 · ACRUX — Senior Information Architect, reparto AIWDA (AI Web Design)

Non ho caricato AIWDA-01 né le schede della biblioteca (nessuna pertinente: WCAG, EN 301 549 e D.lgs. 82/2022 non sono il tema). Audit in sola lettura su README, docs/mappa.md, docs/glossario.md, le 4 pagine HTML, ricerca/ e le schermate delle pagine. Ho guardato solo la schermata impostazioni-telefono.png; le altre pagine le ho lette dal codice, perciò le osservazioni visive sulle altre schermate non sono verificate. Nessun processo avviato, nessun file modificato.

## Mappa osservata
Menu piatto di 4 voci, identico in tutte le pagine (index.html:12-15 e analoghi): Settings, Dashboard, Squadra, Turni. Ordine alfabetico inverso/di cartella (docs/mappa.md: «L'ordine del menu segue quello delle pagine nella cartella»).
- Settings (impostazioni.html): Locale > Esporta > Presenze per il consulente / Report del costo del lavoro (3 livelli di details annidati); Scambi da approvare (badge 3); Zona pericolosa > Elimina locale.
- Dashboard (index.html): banner «3 scambi da approvare» (solo testo, senza link), KPI, grafici, costo del lavoro.
- Squadra (dipendenti.html): ricerca, tabella, modulo di aggiunta.
- Turni (turni.html): griglia settimanale, Pubblica, finestra «Swap del turno».
Non esplorabile: il pannello non ha ricerca globale, breadcrumb o pagina login/addio (js/app.js:12 e 88 puntano a /login e /addio, che non esistono nel progetto). Non ho dedotto permessi.

## Rilievi

**ACRUX-01 · P1 · Gli scambi da approvare sono nascosti in Impostazioni**
- Evidenza: impostazioni.html:41-50 (details chiuso di default, schermata impostazioni-telefono.png); docs/mappa.md riga Settings; ricerca/sintesi.md raccomandazione 3 («lo scambio resta nelle impostazioni, perché si configura una volta sola»); README: compito 2 «più volte a settimana»; ricerca/interviste.md I4: «nel pannello non capisco dove approvarli».
- Fatto: il secondo compito per frequenza vive nella pagina del compito meno frequente (compito 5, «raramente»). La motivazione della sintesi confonde configurare con approvare: l'approvazione non è una configurazione. Il banner di index.html:21-23 non è un link.
- Correzione: spostare «Scambi da approvare» nella pagina Turni (sezione o scheda sopra la griglia, con badge sulla voce di menu Turni), oppure una voce di menu propria «Scambi». Rendere il banner del cruscotto un link alla sezione. Aggiornare docs/mappa.md e la raccomandazione 3 della sintesi.

**ACRUX-02 · P1 · Esportazione sepolta a 3 livelli nelle Impostazioni, con etichetta del link «Clicca qui»**
- Evidenza: impostazioni.html:22-39 (Locale > Esporta > Presenze per il consulente), docs/mappa.md ultima riga; interviste I1: «non trovo mai dove sta il pulsante»; la sintesi ricerca/sintesi.md punto 5 dice invece «L'esportazione funziona e non ha richiesto commenti» (contraddetta da I1).
- Fatto: l'esportazione non riguarda i dati del locale ma presenze e costi, quindi è sotto la voce sbagliata. Tre details da aprire nell'ordine giusto prima di vedere l'azione. Il pulsante «Clicca qui» (impostazioni.html:32) non dice cosa fa.
- Correzione: portare l'esportazione fuori da Locale, in una voce di primo livello «Presenze e report» (o sezione «Esporta» in Squadra, dove sono le «Ore nel mese»), al massimo un livello di profondità; testo del pulsante «Esporta le presenze di ottobre». Correggere il punto 5 della sintesi.

**ACRUX-03 · P2 · Il report del costo del lavoro compare in due posti diversi**
- Evidenza: docs/mappa.md riga Dashboard («report del costo del lavoro») e riga Settings (Esporta > report del costo del lavoro); impostazioni.html:34-37 e index.html:50 (grafico «Costo del lavoro per ruolo»).
- Fatto: la mappa lo attribuisce a due pagine; nella pagina del cruscotto c'è solo il grafico, il download è solo in Impostazioni. Funzione duplicata o collocazione ambigua.
- Correzione: un solo punto per il download, accanto al grafico del cruscotto (o in «Presenze e report» di ACRUX-02), e il grafico rimanda lì; allineare la mappa.

**ACRUX-04 · P2 · Etichette di menu e titoli di pagina non coincidono, e c'è una voce in inglese**
- Evidenza: voce di menu / h1 / glossario: «Settings» / «Impostazioni» (impostazioni.html:12 e 19); «Squadra» / «Personale» (dipendenti.html:14 e 19; docs/glossario.md: «dipendente», non usare «staff, risorsa»); «Dashboard» / «Dashboard» (inglese, ma il glossario dice che il pannello è in italiano); `<title>Turnio</title>` identico in tutte e 4 le pagine (riga 6).
- Impatto: orientamento debole; chi cerca «Impostazioni» non riconosce «Settings»; la scheda del browser non dice dove si è; il nome «Squadra» non è nel glossario.
- Correzione: voci «Cruscotto» (come nella mappa/README), «Turni», «Dipendenti» (nome del file e del glossario), «Impostazioni», con h1 uguale alla voce; `<title>` «Turni · Turnio» e simili.

**ACRUX-05 · P2 · Nomi incoerenti per la stessa cosa rispetto al glossario**
- Evidenza: turni.html:51 e 54 «Swap del turno», «OK» (glossario: scambio, non swap; pulsanti con verbo); turni.html:52 «fascia 18:00–00:30» (glossario: non fascia); dipendenti.html:21 «Cerca un collaboratore» (non collaboratore); dipendenti.html:32 «Aggiungi una risorsa» (non risorsa); impostazioni.html:25 «Nome del negozio», impostazioni.html:53 «Elimina locale» (non negozio: la stessa pagina usa locale e negozio); dipendenti.html:50 «Procedi»; impostazioni.html:46 «OK» e «No» per approvare/rifiutare.
- Impatto: sinonimi incoerenti per entità centrali, la ricerca nel testo non trova tutto.
- Correzione: «Scambio del turno», «Cedi il turno»/«Approva» e «Rifiuta», «turno», «Cerca un dipendente», «Aggiungi un dipendente», «Nome del locale», «Aggiungi il dipendente» al posto di «Procedi».

**ACRUX-06 · P2 · Ordine del menu non segue i compiti né la frequenza**
- Evidenza: index.html:12-15; docs/mappa.md («L'ordine ... segue quello delle pagine nella cartella»); README compiti 1-5; ricerca/interviste.md (I1: i turni si preparano la domenica; I5: «Non mi serve (il cruscotto), mi serve vedere la settimana»; I2: apre ogni giorno per vedere chi è di turno).
- Fatto: Impostazioni (compito 5, raro) è prima; Turni (compito 1) è ultimo. La prima pagina dopo il login è il cruscotto, anche se il compito principale è Turni.
- Correzione proposta: Turni, Dipendenti, Cruscotto, Impostazioni (impostazioni in fondo o a destra); pagina iniziale da decidere con l'utente (vedi domande aperte).

**ACRUX-07 · P2 · Dashboard e ricerca: la sintesi non è coerente con le interviste, rischio per le scelte di IA**
- Evidenza: ricerca/sintesi.md punti 1-2 («tutti» vogliono più numeri; «il pannello si usa ogni giorno») e persona Marco (45 anni, computer in ufficio) contro interviste.md: solo I3 chiede più numeri (I1: «i numeri li guardo a fine mese», I2: «il costo lo guarda il commercialista», I5: «non mi serve»); apertura quotidiana solo in I2 e I3 (I1 una volta a settimana, I4 la domenica, I5 2-3 volte); 3 su 5 preparano i turni dal telefono (I1, I2, I4), mentre la sintesi raccomanda «pensato per il computer» e il README dice che il pannello non serve ai dipendenti ma non parla di telefono per i responsabili. Il compito 1 del README conferma «domenica sera».
- Impatto: la scelta di avere il cruscotto come prima pagina e un menu orizzontale pensato per il computer poggia su un campione di uno. Ne dipende l'ordine del menu (ACRUX-06). Fatto osservato contro inferenza: la correzione della sintesi spetta a chi l'ha scritta; la riorganizzazione resta una proposta.
- Correzione: rivedere sintesi e raccomandazioni; per la IA: prima pagina Turni (settimana corrente, chi è di turno oggi, scambi da approvare), cruscotto a fine mese. Verificare con altre interviste.

**ACRUX-08 · P2 · Azioni distruttive e azioni primarie nello stesso gruppo in Turni; modulo lungo in Dipendenti**
- Evidenza: turni.html:27-29 («Pubblica i turni» e «Elimina settimana» entrambi `btn-primary`, accanto a «Salva»); dipendenti.html:32-50 (14 campi obbligatori, tra cui codice fiscale e IBAN per un invito all'app; README compito 3: serve nome e numero di telefono).
- Nota: sono rilievi di UX/dati più che di IA, li segnalo per il direttore: l'ordine e il raggruppamento delle azioni in pagina sono aspetti di IA (primario, secondario, distruttivo separato); il modulo non rispetta il compito dichiarato. Eliminazione e dati personali da far valere ai ruoli di design (usabilità) e privacy.
- Correzione: separare «Elimina settimana» e darle l'aspetto distruttivo, lasciare un solo primario; ridurre il modulo a nome, telefono e ruolo, con il resto in un secondo passo.

**ACRUX-09 · P3 · Orientamento e reperibilità**
- Evidenza: griglia turni.html:34-47: stati presente/ritardo/assente con punti colorati e legenda «● presente ● in ritardo ● assente» (riga 48) senza etichetta testuale per ogni cella (colori non nominati); le date della settimana: «02/11 – 08/11» (riga 22) contro il glossario «lun 3 feb»; nell'elenco scambi (impostazioni.html:46-48) date «2026-11-07», formato ISO contro il glossario; ricerca (dipendenti.html:19) solo sui dipendenti, nessuna ricerca globale; impostazioni a livelli annidati senza segnalare dove si è (docs/mappa.md ultima riga parla di percorso «Impostazioni › Locale › Esporta › …» ma nella pagina non c'è breadcrumb); «Zona pericolosa» e «Locale» non sono alla stessa altezza gerarchica (details contro h2).
- Correzione: unificare il formato delle date come da glossario; sezioni di Impostazioni allo stesso livello (h2 con contenuto aperto) invece di details annidati; «Elimina locale» in fondo, già così.

## Limiti
- Letto il codice, non ho eseguito le pagine; schermate esaminate: solo impostazioni-telefono.png. Il comportamento dei details e dei dialoghi è dedotto dal markup.
- Nessun controllo sui contenuti dei grafici di index.html, né sui contrasti (non di mia competenza).
- /login e /addio sono richiamati da js/app.js ma non esistono nel progetto: non esplorabili.

## Domande aperte per l'utente (da portare con AskUserQuestion)
1. Prima pagina dopo l'accesso: Turni o Cruscotto? (dipende da ACRUX-06/07).
2. «Scambi da approvare»: sezione in Turni, voce di menu propria, o entrambe (banner nel cruscotto che porta lì)?
3. Esportazioni: voce «Presenze e report» o sezione in Dipendenti/Cruscotto?
4. Lingua e nomi delle voci di menu (Cruscotto o Dashboard; Dipendenti o Squadra).
5. Il pannello va usato anche da telefono? Le interviste (3 su 5) dicono di sì, il README e la sintesi no.

Priorità proposta: P1 ACRUX-01 e 02; P2 gli altri. Riesame: ho lavorato su Sonnet; propongo il riesame del direttore AIWDA-01 o di un revisore su Opus dei due P1 (ACRUX-01 e 02) prima che diventino definitivi.

— AIWDA-04 · ACRUX
