AIWDA-10 · AVIOR, Senior UX Writer, reparto AIWDA (AI Web Design)

Consegna per AIWDA-01 · CANOPUS. Non ho potuto caricare prima CANOPUS: in questa sessione non c'è il tool `agent`. Ho lavorato direttamente sul compito assegnato.

# Revisione dei testi del pannello Turnio rispetto a docs/glossario.md

**Esito:** ho trovato 30 rilievi: 9 P1, 15 P2, 6 P3, nessun P0. I problemi più seri sono tre:
- il menu e il lessico sono in inglese o fuori glossario;
- i pulsanti «OK», «No», «Procedi» e «Clicca qui» non dicono l'azione;
- i messaggi di esito sono generici («Fatto!») e ci sono errori tecnici, colpevolizzanti o del tutto assenti.

**Perimetro e metodo:** ho letto `index.html`, `dipendenti.html`, `turni.html`, `impostazioni.html`, `js/app.js`, `docs/glossario.md`, `docs/mappa.md`, `docs/componenti.md`, `README.md` e `ricerca/sintesi.md`. Ho guardato le schermate `schermate/turni-computer.png` e `schermate/impostazioni-computer.png`. Non ho aperto un browser: i messaggi di `app.js` sono verificati sul codice, non in pagina.

Il percorso dei file è relativo alla copia del progetto: `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/68c857fd-4b52-436c-bf0e-5c657ef1d77d/scratchpad/copie/aiwda-10-2/`.

**Fonti della biblioteca:**
- WCAG 2.2, W3C Recommendation del 5 ottobre 2023, scheda verificata il 2026-11-19.
- D.lgs. 82/2022, Normattiva, scheda verificata il 2026-11-21. Non dichiaro che il decreto si applichi a questo pannello per responsabili: va valutato.

---

## A. Termini fuori glossario e coerenza

**AVIOR-01 · P1 · Menu in inglese e nomi di pagina incoerenti**
- **Dove:** `index.html`, `dipendenti.html`, `turni.html`, `impostazioni.html`, righe 12–14. Poi `index.html:19` e `dipendenti.html:19`.
- **Testo attuale:**
  - menu: «Settings», «Dashboard», «Squadra»;
  - titolo di pagina: «Dashboard» e «Personale»;
  - didascalia della tabella: «Dipendenti del locale».
- **Problema:** il pannello è in italiano (glossario, riga 3). La stessa pagina ha tre nomi diversi (Squadra, Personale, Dipendenti). Il README la chiama «Cruscotto».
- **Proposta:**
  - menu «Impostazioni», «Cruscotto», «Dipendenti», «Turni»;
  - titolo di pagina uguale alla voce di menu: `index.html:19` «Cruscotto», `dipendenti.html:19` «Dipendenti».
- **Motivazione:** un nome per ogni pagina, e il termine del glossario «dipendente».
- L'ordine del menu (Impostazioni per prima) è materia per l'Information Architect.

**AVIOR-02 · P2 · `dipendenti.html:20`, segnaposto della ricerca**
- **Testo attuale:** «Cerca un collaboratore».
- **Problema:** «collaboratore» è vietato dal glossario.
- **Proposta:** «Cerca un dipendente per nome o ruolo».
- Il campo non ha un'etichetta visibile, contro `componenti.md` («il segnaposto non sostituisce l'etichetta»). Proposta di etichetta: «Cerca un dipendente».

**AVIOR-03 · P2 · `dipendenti.html:32`, titolo del modulo**
- **Testo attuale:** «Aggiungi una risorsa».
- **Problema:** «risorsa» è vietato dal glossario.
- **Proposta:** «Aggiungi un dipendente».

**AVIOR-04 · P2 · `turni.html:51–52`, finestra dello scambio**
- **Testo attuale:** «Swap del turno» e «Giulia R. · sab 7 nov · fascia 18:00–00:30».
- **Problema:** «swap» e «fascia» sono vietati dal glossario.
- **Proposta:** titolo «Scambio del turno»; testo «Giulia R. · sab 7 nov, 18:00–00:30».

**AVIOR-05 · P2 · `impostazioni.html:24`, etichetta**
- **Testo attuale:** «Nome del negozio».
- **Problema:** «negozio» è vietato dal glossario.
- **Proposta:** «Nome del locale».

**AVIOR-06 · P2 · Ruoli scritti in modi diversi**
- **Dove:** `dipendenti.html:26–28` e `:47`, `turni.html:36–42`, `index.html:62–69`.
- **Testo attuale:** «sala», «cucina», «bar» in minuscolo nelle tabelle e nel menu a tendina. «Cucina», «Sala» in maiuscolo nella legenda.
- **Problema:** la legenda ha cinque ruoli (Lavapiatti, Pizzeria, Responsabili, Pulizie, Extra) che non si possono scegliere quando si aggiunge un dipendente.
- **Proposta:** una sola forma, con la maiuscola come nelle etichette («Sala»).
- **Domanda aperta:** qual è l'elenco dei ruoli? È configurabile? `mappa.md` cita «ruoli» nelle impostazioni, ma la pagina non li mostra.

**AVIOR-07 · P3 · Termini usati ma assenti dal glossario**
- **Termini:** «Riposo» (`turni.html:37–43`), «ruolo», «presenze», «costo del lavoro», «cruscotto», «report».
- **Proposta:** aggiungerli al glossario, con la decisione dell'utente. Per esempio «report» o «resoconto»: oggi «Report del costo del lavoro» convive con «Esporta» e «Scarica».

## B. Etichette e pulsanti poco chiari

**AVIOR-08 · P1 · `impostazioni.html:44–48`, scambi da approvare (compito 2, più volte a settimana)**
- **Testo attuale:**
  - pulsanti «OK» e «No»;
  - colonne «Da», «A» e una colonna senza intestazione.
- **Problema:** «OK» non è un verbo d'azione (glossario, Regole). «No» non dice cosa succede. Le due colonne non dicono chi cede e chi riceve il turno.
- **Proposta:**
  - pulsanti «Approva» e «Rifiuta», i verbi del README;
  - colonne «Turno», «Cede il turno», «Lo riceve», «Decisione».
- Pulsanti uguali e affiancati: la gerarchia visiva va passata alla UI.

**AVIOR-09 · P1 · `turni.html:54`, conferma dello scambio**
- **Testo attuale:** «OK».
- **Proposta:** «Cedi il turno a Marta F.», con il nome scelto nel menu, oppure «Scambia il turno».
- **Altre etichette della finestra:**
  - `turni.html:53`: «Collega» diventa «Cedi il turno a».
  - `turni.html:50`: la chiusura «✕» è uno `span` senza nome. Proposta: pulsante con nome accessibile «Chiudi».
- **Domanda aperta:** qui il responsabile crea uno scambio o ne approva uno? Il glossario definisce lo scambio come iniziativa del dipendente. Il testo cambia a seconda della risposta.

**AVIOR-10 · P1 · `dipendenti.html:50`, invio del modulo**
- **Testo attuale:** «Procedi».
- **Proposta:** «Aggiungi il dipendente». Se il salvataggio invia anche l'invito all'app (README, compito 3): «Aggiungi e invia l'invito».
- **Domanda aperta:** l'invito parte subito al salvataggio?

**AVIOR-11 · P2 · `impostazioni.html:32` e `:36`, esportazione (compito 4, mensile)**
- **Testo attuale:** «Clicca qui» e «Scarica il report».
- **Problema:** il testo del link non descrive la destinazione (WCAG 2.2, 2.4.4).
- **Proposta:**
  - «Scarica le presenze di ottobre 2026», con il mese preso dal menu a tendina;
  - «Scarica il report del costo del lavoro».
- Il percorso annidato Locale › Esporta › Presenze va all'Information Architect.

**AVIOR-12 · P1 · Pulsanti con sola icona e senza nome accessibile**
- **Dove:** `dipendenti.html:26–28` (✎ 🗑), `turni.html:21` e `:23` (◀ ▶), `turni.html:37` (⇄).
- **Problema:** WCAG 2.2, 4.1.2 (A). L'icona «🗑» elimina un dipendente.
- **Proposta:**
  - «Modifica Giulia R.» e «Elimina Giulia R.»;
  - «Settimana precedente» e «Settimana successiva»;
  - «Scambia il turno di sab 7 nov».
- Va riesaminato dall'Accessibility Specialist.

**AVIOR-13 · P2 · `turni.html:28–29`, pulsanti della settimana**
- **Testo attuale:** «Elimina settimana» e «Salva».
- **Problema:**
  - «Elimina settimana» non dice cosa si elimina. Ha lo stesso stile primario di «Pubblica i turni»: lo stile va passato alla UI.
  - «Salva», accanto a «Pubblica i turni», non dice se i dipendenti vedono le modifiche.
- **Proposta:** «Elimina i turni della settimana» e «Salva la bozza», oppure «Salva senza pubblicare».
- **Domanda aperta:** «Pubblica» salva anche?

**AVIOR-14 · P2 · `impostazioni.html:53–54`, eliminazione del locale**
- **Testo attuale:** «Zona pericolosa» e «Elimina locale».
- **Proposta:** «Eliminazione del locale» e «Elimina il locale».

**AVIOR-15 · P2 · `index.html:23`, avviso sul cruscotto**
- **Testo attuale:** «🔔 3 scambi da approvare».
- **Problema:** l'avviso non porta da nessuna parte. L'emoji viene letta dai lettori di schermo.
- **Proposta:** «3 scambi da approvare · Vedi gli scambi», con un link alla sezione in Impostazioni e senza emoji, oppure con l'emoji nascosta ai lettori di schermo.

**AVIOR-16 · P3 · `dipendenti.html:33–48`, campi obbligatori**
- **Problema:** l'asterisco è dentro il segnaposto e sparisce quando si scrive. 13 campi su 14 sono obbligatori.
- **Proposta:** etichette visibili e solo «Note (facoltativo)» marcato. La frase «I campi con * sono obbligatori» diventa inutile.
- **Fuori dal mio ruolo:** chiedere IBAN, codice fiscale, indirizzo e data di nascita per un invito che, secondo il README, richiede nome e telefono va segnalato alla privacy (minimizzazione).

## C. Messaggi di errore e di conferma

**AVIOR-17 · P1 · `js/app.js:58`, telefono non valido**
- **Testo attuale:** «Hai sbagliato il numero.»
- **Problema:** dà la colpa all'utente e non dice cosa fare, contro la regola del glossario. In più la tabella mostra i numeri con gli spazi («333 120 4455», `dipendenti.html:26`), ma la regola `^\d{10}$` li rifiuta: chi copia quel formato viene bloccato.
- **Proposta:** «Il numero di telefono deve avere 10 cifre, per esempio 333 120 4455.» Il messaggio va mostrato sotto il campo e collegato al campo.
- Accettare gli spazi è un intervento di sviluppo.

**AVIOR-18 · P1 · `js/app.js:64–65`, errore dal server**
- **Testo attuale:** «Errore ${res.status}: payload non valido».
- **Problema:** è un codice tecnico in inglese. Inoltre `form.reset()` cancella tutti i 14 campi.
- **Proposta:** «Non siamo riusciti ad aggiungere il dipendente. Controlla i campi segnalati e riprova: i dati inseriti restano nel modulo.»
- Togliere il reset è un intervento di sviluppo, da segnalare all'Usability Auditor.

**AVIOR-19 · P1 · Errori di rete senza alcun messaggio, e «Fatto!» anche quando l'operazione fallisce**
- **Dove:** `js/app.js:32–34` e `:69–71` registrano l'errore solo nella console (`console.log`). `js/app.js:18–19`, `:44–46`, `:93` non controllano `res.ok`.
- **Problema:** il pannello conferma pubblicazioni e scambi anche se l'operazione non è riuscita.
- **Proposte di testo:**
  - salvataggio: «Non siamo riusciti a salvare i turni. Controlla la connessione e riprova.»
  - pubblicazione: «I turni non sono stati pubblicati: i dipendenti non li vedono ancora. Riprova.»
  - scambio: «Lo scambio non è stato registrato. Riprova.»
  - impostazioni: «Non siamo riusciti a salvare le modifiche. Riprova.»

**AVIOR-20 · P2 · `js/app.js:19`, `:46`, `:68`, conferma generica**
- **Testo attuale:** «Fatto!», visibile per 1,5 s.
- **Proposta:**
  - pubblicazione: «Turni di lun 2 – dom 8 nov pubblicati: i dipendenti li vedono nell'app.»
  - scambio: «Turno di sab 7 nov ceduto a Marta F.»
  - nuovo dipendente: «Giulia R. aggiunta.» Se l'invito parte davvero: «Le abbiamo inviato l'invito all'app.»
- La durata di 1,5 s e l'avviso senza `role="status"` vanno a UX e accessibilità.

**AVIOR-21 · P1 · `js/app.js:86`, conferma dell'eliminazione del locale**
- **Testo attuale:** «Vuoi davvero procedere?»
- **Problema:** non dice cosa si elimina né le conseguenze. La finestra nativa mostra pulsanti generici.
- **Proposta:** titolo «Eliminare Trattoria Il Ponte?», pulsanti «Elimina il locale» e «Annulla». Per il testo serve la regola di business: per esempio «Si eliminano i turni, i dipendenti e le presenze del locale.» Non lo affermo senza conferma.
- **Domanda aperta:** l'eliminazione si può annullare? I dati vengono cancellati?
- Il reindirizzamento a `/addio` non è una pagina del progetto.

**AVIOR-22 · P1 · `js/app.js:22–25`, «Elimina settimana» senza conferma**
- **Problema:** il pulsante svuota la griglia senza conferma e senza messaggio.
- **Proposta di conferma:** «Eliminare i turni di lun 2 – dom 8 nov?» con «Elimina i turni» e «Annulla».
- **Messaggio di esito:** «Turni della settimana eliminati.»
- **Domanda aperta:** se i turni sono già pubblicati, cosa vedono i dipendenti?

**AVIOR-23 · P1 · `js/app.js:11–12`, uscita automatica senza preavviso**
- **Problema:** dopo 10 minuti dall'apertura il pannello reindirizza a `/login`. Il timer non riparte con l'attività, nonostante il commento. Non c'è nessun avviso (WCAG 2.2, 2.2.1, livello A). Rischio concreto: chi prepara i turni la domenica sera perde il lavoro.
- **Proposta di avviso:** «Tra 1 minuto esci dal pannello per sicurezza.» con il pulsante «Resta collegato». Dopo l'uscita: «Sei uscito dopo 10 minuti di inattività. Accedi di nuovo per continuare.»
- Il comportamento va all'Usability Auditor.

**AVIOR-24 · P2 · `impostazioni.html:20` e `js/app.js:92–93`, salvataggio automatico**
- **Testo attuale:** «Le modifiche si salvano da sole.»
- **Problema:** non c'è nessun riscontro del salvataggio.
- **Proposta:** «Le modifiche si salvano da sole», poi un riscontro accanto al campo: «Salvato» oppure l'errore di AVIOR-19.

**AVIOR-25 · P2 · `js/app.js:78`, ricerca senza risultati**
- **Problema:** se la ricerca non trova nessuno, la tabella resta vuota senza messaggio.
- **Proposta:** «Nessun dipendente trovato per «Marco». Controlla il nome o aggiungi un dipendente.»

## D. Formati incoerenti

Il glossario chiede date nella forma «lun 3 feb», orari nella forma «18:30» e il punto per le migliaia.

**AVIOR-26 · P2 · `turni.html:22`, intervallo della settimana**
- **Testo attuale:** «02/11 – 08/11».
- **Proposta:** «lun 2 – dom 8 nov».

**AVIOR-27 · P2 · `impostazioni.html:46–48`, date degli scambi**
- **Testo attuale:** «2026-11-07 18:00–00:30».
- **Proposta:** «sab 7 nov, 18:00–00:30».

**AVIOR-28 · P2 · `dipendenti.html:40` e `:46`, formati di data in contrasto**
- **Testo attuale:** «gg/mm/aaaa» e «aaaa-mm-gg» nello stesso modulo.
- **Proposta:** un solo formato di inserimento, «gg/mm/aaaa», indicato sotto l'etichetta. Oppure un campo data nativo.

**AVIOR-29 · P3 · Date sul cruscotto e intestazioni della griglia**
- **Dove:** `index.html:90` e `turni.html:34`.
- **Testo attuale:** «mercoledì 11 novembre» e «Lun», «Mar»….
- **Proposta:** «Dati aggiornati a mer 11 nov.» e intestazioni con la data: «lun 2», «mar 3»….
- **Domanda aperta:** «settimana corrente» (`index.html:20`) indica quale settimana? I dati sono aggiornati all'11 novembre, mentre Turni mostra la settimana 2–8 novembre. Proposta: scrivere l'intervallo, per esempio «settimana lun 9 – dom 15 nov».

**AVIOR-30 · P2 · Testi del cruscotto ambigui o non verificabili**
- **Dove:** `index.html:28`, `:51`, `:61–70`, `:81`, `:83`.
- **Problemi:**
  - «Costo del lavoro 31%» non dice il riferimento. Proposta: «Costo del lavoro sugli incassi», se è così. **Domanda aperta.**
  - Le percentuali della legenda sommano al 108% (34+29+14+9+8+7+4+3). Un testo visibile è sbagliato: va controllato con il dataviz.
  - La descrizione del grafico «Torta del costo per ruolo» diventa: «Costo del lavoro per ruolo: Cucina 34%, Sala 29%…».
  - La legenda «Rosso: costo del lavoro. Verde: incassi.» si basa solo sul colore. Proposta: etichette con il nome a fine linea.
  - «Ritardi per settimana» non ha l'unità di misura. Proposta: «Numero di ritardi per settimana».

**Di passaggio:** formati corretti altrove: orari «18:30», migliaia «8.000 €», «26.000 €».

## E. Rilievi trasversali

- **P1:** `<html lang="en">` su tutte e quattro le pagine (riga 2), con contenuto in italiano (WCAG 2.2, 3.1.1, livello A). Proposta: `lang="it"`.
- **P2:** `<title>Turnio</title>` è uguale su tutte le pagine (riga 6, WCAG 2.2, 2.4.2). Proposta: «Turni · Turnio», «Dipendenti · Turnio», «Impostazioni · Turnio», «Cruscotto · Turnio».
- **P2:** la legenda di `turni.html:45` («● presente ● in ritardo ● assente») ha i pallini tutti grigi; la schermata lo conferma. I turni nella griglia hanno solo un pallino colorato, senza testo. Proposta: badge con il testo, come in `componenti.md`.

Questi tre rilievi sono da confermare con l'Accessibility Specialist.

## Domande aperte per l'utente

1. Nella finestra di `turni.html` il responsabile crea uno scambio o ne approva uno?
2. Il nuovo dipendente riceve l'invito appena viene aggiunto?
3. Cosa elimina «Elimina il locale», e si può annullare?
4. «Salva» e «Pubblica i turni» sono due passi distinti?
5. Qual è l'elenco ufficiale dei ruoli?
6. Il 31% del costo del lavoro è calcolato su cosa?
7. Le percentuali della torta sono giuste? Oggi sommano al 108%.
8. Volete aggiungere al glossario «Riposo», «presenze», «costo del lavoro», «cruscotto» e «report»?

## Limiti

- È una revisione statica in sola lettura. I messaggi di `app.js` non sono visibili nelle schermate e non li ho visti in pagina.
- Le chiamate a `/api` sono simulate e non ho verificato il comportamento reale.
- Non ho caricato AIWDA-01 per mancanza del tool `agent`.
- La sezione JSON comune non è inclusa per lunghezza. I campi di ogni rilievo corrispondono allo schema: id, testo, posizione, impatto, priorità, proposta. Posso convertirli su richiesta.
- `requires_human_review: true` vale per AVIOR-06, 09, 10, 13, 21, 22, 29 e 30, che dipendono dalle domande aperte.

**Da riesaminare con altri specialisti:**
- Accessibility Specialist: AVIOR-12, 23 e sezione E.
- Usability Auditor: AVIOR-18, 21, 22, 23.
- Data Visualization Designer: AVIOR-30.
- Information Architect: AVIOR-01 (ordine del menu) e AVIOR-11.
- Privacy: AVIOR-16.

Firmato: AIWDA-10 · AVIOR
