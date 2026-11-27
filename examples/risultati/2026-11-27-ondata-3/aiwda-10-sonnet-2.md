AIWDA-10 · AVIOR — Senior UX Writer, reparto AIWDA (AI Web Design)

Revisione in sola lettura dei testi visibili del pannello, confrontati con `docs/glossario.md`. Ho letto i quattro file HTML, `js/app.js` e il glossario. Non ho caricato AIWDA-01, non ho letto le schede della biblioteca e non ho aperto le schermate PNG. Non ho modificato file. Le posizioni sono nella cartella `aiwda-10-3`.

Esito: ci sono 3 rilievi P1, 12 P2 e 6 P3 (più un P3 senza intervento), nessun P0. I P1 riguardano azioni distruttive e messaggi di errore; propongo il riesame del direttore AIWDA-01 perché lavoro su un modello più piccolo di Opus.

## P1

**AVIOR-01 · Conferma di eliminazione del locale (`js/app.js:86`)**
- Testo attuale: «Vuoi davvero procedere?»
- Problema: non dice cosa si perde né che è irreversibile. I pulsanti sono quelli standard del browser (OK/Annulla).
- Proposta: «Eliminare il locale «Trattoria Il Ponte»? Verranno cancellati anche turni e dipendenti e non potrai recuperarli.» Pulsanti «Elimina locale» e «Annulla».
- Domanda aperta: cosa viene cancellato davvero? Non l'ho potuto verificare.

**AVIOR-02 · Elimina settimana senza conferma né messaggio (`js/app.js:22-25`, `turni.html:28`)**
- Testo attuale: nessuna conferma e nessun messaggio; la griglia si svuota in silenzio. Il pulsante è `btn-primary`, come «Pubblica i turni» (aspetto visivo, da girare al UI Designer).
- Proposta: conferma «Eliminare i turni della settimana 2–8 nov? Non potrai recuperarli.» con «Elimina i turni» e «Annulla». Dopo l'azione: «Turni della settimana 2–8 nov eliminati.»

**AVIOR-03 · Errori del modulo dipendenti (`js/app.js:58`, `js/app.js:64`, `js/app.js:32-34`, `js/app.js:69-71`)**
- Testi attuali: «Hai sbagliato il numero.» e «Errore ${res.status}: payload non valido».
- Problemi: il primo dà la colpa all'utente e non dice il formato; il secondo ha un codice tecnico e il termine «payload». `form.reset()` cancella i dati inseriti. Gli errori di rete nei `catch` finiscono solo in console.
- Proposte:
  - Telefono: «Il telefono deve avere 10 cifre, senza spazi (esempio: 3331204455).»
  - Errore del server: «Non siamo riusciti a salvare il dipendente. Controlla i dati e riprova. I dati che hai inserito sono ancora qui.» Senza `form.reset()`.
  - Errore di rete: «Non siamo riusciti a collegarci. Controlla la connessione e riprova.»
- Nota: la regola accetta 10 cifre senza spazi ma i telefoni in tabella sono scritti con gli spazi (vedi AVIOR-17).

## P2: termini fuori glossario
- **AVIOR-04 · «Settings»** (`index.html:12`, `turni.html:12`, `dipendenti.html:12`, `impostazioni.html:12`): menu in inglese, il titolo è «Impostazioni». Proposta: «Impostazioni». L'ordine delle voci di menu non segue quello dei titoli: da segnalare all'Information Architect.
- **AVIOR-05 · «Squadra» / «Personale»** (`dipendenti.html:14` e `dipendenti.html:19`): menu e titolo non coincidono e nessuno dei due è «dipendente». Proposta: «Dipendenti» in entrambi.
- **AVIOR-06 · «collaboratore»** (`dipendenti.html:20`): vietato dal glossario. Proposta: placeholder «Cerca un dipendente», con una label visibile o `aria-label`.
- **AVIOR-07 · «risorsa»** (`dipendenti.html:32`): vietato. Proposta: «Aggiungi un dipendente».
- **AVIOR-08 · «Swap del turno»** (`turni.html:51`): vietato. Proposta: «Scambia il turno».
- **AVIOR-09 · «fascia»** (`turni.html:52`): vietato. Proposta: «Giulia R. · sab 7 nov · turno 18:00–00:30».
- **AVIOR-10 · «negozio»** (`impostazioni.html:24`): vietato. Proposta: «Nome del locale».

## P2: etichette, pulsanti e messaggi
- **AVIOR-11 · «OK» nello scambio** (`turni.html:54`): il glossario chiede un verbo. Proposta: «Scambia il turno» più «Annulla»; messaggio dopo l'azione: «Richiesta di scambio inviata a Marta F. Resta da approvare in Impostazioni.» Domanda aperta: la richiesta va davvero approvata, come suggerisce l'elenco «Scambi da approvare»? Non l'ho verificato.
- **AVIOR-12 · «OK» / «No» negli scambi da approvare** (`impostazioni.html:46-48`): proposta «Approva lo scambio» e «Rifiuta lo scambio», con `aria-label` che include il nome (per esempio «Approva lo scambio di Giulia R.»). Manca un messaggio dopo l'azione: «Scambio approvato. Il turno passa a Marta F.»
- **AVIOR-13 · «Clicca qui»** (`impostazioni.html:32`): proposta «Scarica le presenze di ottobre 2026». Per coerenza «Scarica il report» (`impostazioni.html:36`) diventa «Scarica il report del costo del lavoro».
- **AVIOR-14 · «Procedi»** (`dipendenti.html:50`): proposta «Aggiungi il dipendente».
- **AVIOR-15 · «Fatto!»** (`js/app.js:19`, `js/app.js:46`, `js/app.js:68`): messaggio identico per azioni diverse. Proposte: «Turni pubblicati: ora i dipendenti possono vederli.», un messaggio per lo scambio (vedi AVIOR-11), «Dipendente aggiunto.» La durata di 1,5 secondi (`js/app.js:8`) è breve per un messaggio da leggere: da segnalare al UX Designer.
- **AVIOR-16 · «Salva» dei turni e salvataggio delle impostazioni** (`turni.html:29`, `js/app.js:27-35`, `js/app.js:92-94`, `impostazioni.html:20`): dopo «Salva» la pagina si ricarica senza messaggio, e «Le modifiche si salvano da sole» può far credere che anche i turni si salvino da soli. Proposta: «Salva i turni» con il messaggio «Turni salvati.», senza ricaricare. Le impostazioni non danno nessun segno di salvataggio: serve «Impostazioni salvate.»
- **AVIOR-17 · Formati di date e orari** (varie righe): il glossario prescrive «lun 3 feb» e «18:30». Nel testo compaiono invece «02/11 – 08/11» (`turni.html:22`), «2026-11-07 18:00–00:30» (`impostazioni.html:46-48`), «aaaa-mm-gg» nel placeholder (`dipendenti.html:46`) contro «gg/mm/aaaa» alla riga 40, «Lun» maiuscolo nella griglia (`turni.html:34`) e «mercoledì 11 novembre» (`index.html:90`). Proposta, un solo formato: «lun 2 nov – dom 8 nov», «sab 7 nov 18:00–00:30», date dei campi tutte «gg/mm/aaaa».

## P3
- **AVIOR-18 · Numeri** (`index.html:75-76`): le migliaia sono scritte con il punto, come prescrive il glossario. Nessun intervento.
- **AVIOR-19 · Titolo della pagina** (`<title>Turnio</title>` in tutte e quattro le pagine, riga 6): proposta «Dashboard · Turnio», «Turni · Turnio», ecc.
- **AVIOR-20 · `lang="en"`** (riga 2 di tutte e quattro le pagine): il pannello è in italiano. Proposta `lang="it"`; influisce sui lettori di schermo: da segnalare all'Accessibility Specialist.
- **AVIOR-21 · Pulsanti ✎ e 🗑 e «Zona pericolosa»** (`dipendenti.html:26-28`, `impostazioni.html:53`): le icone non hanno testo accessibile; proposta `aria-label` «Modifica Giulia R.» e «Elimina Giulia R.». «Zona pericolosa» è tono da sviluppatori: proposta «Eliminazione del locale».
- **AVIOR-22 · Legenda dei turni** (`turni.html:45`): «● presente ● in ritardo ● assente» usa caratteri uguali, quindi non spiega nulla senza colore. Proposta: usare gli stessi `dot` colorati delle celle, senza affidare il significato solo al colore. Vale anche per «Rosso: costo del lavoro. Verde: incassi.» (`index.html:81`). Da segnalare al UI Designer.
- **AVIOR-23 · Modulo con placeholder come etichette** (`dipendenti.html:35-48`): i placeholder scompaiono mentre si scrive. Proposta: label visibili. «Livello CCNL» e «Codice fiscale» sono termini di dominio e non vanno cambiati, ma «Livello CCNL» merita un suggerimento breve. Domanda aperta per Privacy: servono davvero IBAN, codice fiscale e indirizzo obbligatori?
- **AVIOR-24 · Stato vuoto della ricerca** (`js/app.js:78`): il commento dice «la tabella resta vuota» e non c'è nessun messaggio. Proposta: «Nessun dipendente corrisponde a «xyz». Controlla l'ortografia o cancella la ricerca.»

## Altri punti per altri specialisti
- Dashboard e Data Visualization Designer: asse dell'istogramma che parte da 60, torta con 8 sfumature dello stesso blu, doppio asse con scale diverse (`index.html:34`, `index.html:51-60`, `index.html:73`).
- Banner «🔔 3 scambi da approvare» (`index.html:23`): non è un link all'elenco. Proposta: «3 scambi da approvare. Vai agli scambi».
- Uscita automatica dopo 10 minuti verso `/login` senza avviso (`js/app.js:12`). Proposta di messaggio: «Sei uscito perché non hai usato il pannello per 10 minuti. Accedi di nuovo.» Il comportamento va deciso dal UX Designer.

## Limiti
- Non ho aperto le schermate PNG, quindi non ho verificato resa, troncamenti o contrasto.
- Non ho letto `docs/mappa.md`, `docs/componenti.md` né `ricerca/`.
- Non ho consultato le schede della biblioteca (WCAG 2.2, EN 301 549, D.lgs. 82/2022): i punti di accessibilità sono segnalazioni, non verifiche di conformità.
- Le conseguenze reali delle azioni (cosa cancella «Elimina locale», se lo scambio va approvato) sono domande aperte, non fatti.
- `requires_human_review: true` per AVIOR-01, 02, 03 (riesame consigliato) e per le domande aperte di AVIOR-11 e AVIOR-23.

— AIWDA-10 · AVIOR, Senior UX Writer
