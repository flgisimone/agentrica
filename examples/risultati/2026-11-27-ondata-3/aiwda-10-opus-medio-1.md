AIWDA-10 · AVIOR — Senior UX Writer, reparto AIWDA (AI Web Design)

Consegna per AIWDA-01 · CANOPUS. Non ho potuto caricare il direttore come chiedevano le istruzioni, perché in questa sessione non ho il tool `agent`, quindi il rapporto va a chi mi ha avviato.

## Esito

Ho rivisto in sola lettura i testi visibili di `index.html`, `turni.html`, `dipendenti.html`, `impostazioni.html` e dei messaggi in `js/app.js`, confrontandoli con `docs/glossario.md`. I rilievi sono 38:
- **6 P1**: lingua della pagina, pulsanti senza nome, conferme di successo anche quando l'azione fallisce, conferma di eliminazione del locale, eliminazione della settimana senza conferma, uscita automatica senza avviso;
- **19 P2**;
- **13 P3**.

Il glossario non viene rispettato:
- nel menu: «Settings», «Dashboard», «Squadra»;
- nella pagina dei dipendenti: «collaboratore», «risorsa»;
- nella finestra dello scambio: «Swap», «fascia»;
- nelle impostazioni: «negozio».

Ci sono quattro pulsanti «OK», «No», «Procedi», «Clicca qui», un messaggio di errore che dà la colpa all'utente e uno con un codice tecnico. Le date compaiono in tre formati diversi da quello del glossario.

**Limiti.** Le pagine sono statiche e non c'è un server. I messaggi di `app.js` (toast, `confirm`, errori) li ho letti nel codice, non li ho visti a schermo. Delle schermate ho guardato solo `schermate/turni-computer.png`. I rilievi di accessibilità e di comportamento sono segnalati in quanto riguardano il testo, ma vanno confermati dagli specialisti indicati (`requires_human_review: true`).

## Rilievi (file:riga · testo attuale → proposta · motivo · priorità)

### A. Termini fuori glossario e terminologia incoerente

1. **Tutte le pagine:12** · «Settings» → «Impostazioni». Il pannello è in italiano e il titolo della pagina è già «Impostazioni» (`impostazioni.html:19`). Aggiornare anche `docs/mappa.md`. **P2**
2. **Tutte le pagine:13 e `index.html:19`** · «Dashboard» → «Cruscotto». Il README e la mappa la chiamano già «cruscotto», e il termine inglese è incoerente con il resto del menu. **P3**
3. **Tutte le pagine:14, `dipendenti.html:19`, `dipendenti.html:23`** · tre nomi per la stessa pagina: «Squadra» nel menu, «Personale» nel titolo, «Dipendenti del locale» nella didascalia → «Dipendenti» sia nel menu sia nel titolo. Il termine del glossario è «dipendente»; tre nomi diversi fanno dubitare di essere nella pagina giusta. **P2**
4. **`dipendenti.html:20`** · «Cerca un collaboratore» è un termine vietato dal glossario → «Cerca un dipendente per nome o ruolo». La ricerca filtra su tutta la riga (`app.js:77`), quindi anche sul ruolo. **P2**
5. **`dipendenti.html:32`** · «Aggiungi una risorsa» è un termine vietato → «Aggiungi un dipendente». **P2**
6. **`turni.html:51`** · «Swap del turno» è un termine vietato → «Scambio del turno». **P2**
7. **`turni.html:52`** · «Giulia R. · sab 7 nov · fascia 18:00–00:30» usa «fascia», vietato → «Turno di Giulia R. · sab 7 nov, 18:00–00:30». **P3**
8. **`impostazioni.html:24`** · «Nome del negozio» è un termine vietato → «Nome del locale», coerente anche con la sezione «Locale» alla riga 23. **P2**
9. **`impostazioni.html:53`** · «Zona pericolosa» è un calco di «Danger zone» → «Eliminazione del locale». **P3**
10. **I ruoli non coincidono.** Nella legenda del cruscotto (`index.html:62-69`) i ruoli sono otto e con la maiuscola (Cucina, Sala, …, Pizzeria, Responsabili, Extra). Nel modulo (`dipendenti.html:47`) e nella griglia sono tre e in minuscolo (sala, cucina, bar). **Domanda:** qual è l'elenco dei ruoli del locale? Va scelta una sola grafia, minuscola come nel resto. **P3**

### B. Etichette e pulsanti poco chiari

11. **`turni.html:54`** · «OK» → «Conferma lo scambio». Il glossario vieta «OK». **Domanda:** questo pulsante esegue subito lo scambio o crea una richiesta da approvare? Nel secondo caso il testo diventa «Proponi lo scambio». **P2**
12. **`impostazioni.html:46-48`** · «OK» / «No» → «Approva» / «Rifiuta», e la colonna senza intestazione (riga 44) diventa «Azioni». «No» è ambiguo, e approvare gli scambi è il secondo compito più frequente (README). **P2**
13. **`dipendenti.html:50`** · «Procedi» → «Aggiungi il dipendente». Il README dice che il nuovo dipendente riceve l'invito all'app. **Domanda:** l'invito parte al salvataggio? Se sì, il testo diventa «Aggiungi e invia l'invito». **P2**
14. **`impostazioni.html:32`** · «Clicca qui» → «Scarica le presenze del mese». È un link che non dice dove porta: va rivisto dall'Accessibility Specialist (WCAG 2.2, 2.4.4, livello A). **P2**
15. **`turni.html:29`** · «Salva»: non si capisce come si rapporti a «Pubblica i turni». **Domanda:** «Salva» conserva una bozza che i dipendenti non vedono? Se sì → «Salva senza pubblicare». **P3**
16. **`turni.html:28`** · «Elimina settimana» → «Elimina i turni della settimana». Il pulsante ha anche lo stile principale, lo stesso di «Pubblica i turni»: da segnalare all'UI Designer e allo Usability Auditor. **P2**
17. **Pulsanti con sola icona, senza nome**, da verificare con l'Accessibility Specialist (WCAG 2.2, 4.1.2, livello A):
    - `turni.html:21` e `turni.html:23`: «◀ ▶» → «Settimana precedente» / «Settimana successiva»;
    - `turni.html:37`: «⇄» → «Scambia il turno di sab 7 nov»;
    - `turni.html:50`: «✕» → «Chiudi»;
    - `dipendenti.html:26-28`: «✎ 🗑» → «Modifica Giulia R.» / «Elimina Giulia R.».

    Con un lettore di schermo non si capisce quale dipendente si modifica o si elimina. **P1**
18. **Tutte le pagine:2** · `lang="en"` su contenuto in italiano → `lang="it"`. Il lettore di schermo pronuncia l'italiano come inglese (WCAG 2.2, 3.1.1, livello A). **P1**
19. **Tutte le pagine:6** · il titolo è sempre «Turnio» → «Turni · Turnio», «Dipendenti · Turnio» e così via. Le schede del browser non si distinguono (WCAG 2.2, 2.4.2). **P2**
20. **`index.html:28`** · «Costo del lavoro 31%»: 31% di che cosa? **Domanda:** se è il rapporto con gli incassi → «Costo del lavoro sugli incassi». **P2**
21. **`dipendenti.html:24`** · «Ore nel mese»: quale mese? → «Ore a novembre». **P3**
22. **`dipendenti.html:35-48`** · i segnaposto fanno da etichetta («Nome *» e così via) → etichette visibili sopra i campi. Lo prevede `docs/componenti.md:22`, e il segnaposto sparisce mentre si scrive. **P2**
23. **`index.html:23`** · «🔔 3 scambi da approvare» non porta da nessuna parte → «3 scambi da approvare · Vedi gli scambi», con un link alla sezione. **P3**

### C. Messaggi di errore e di conferma

24. **`app.js:19`, `app.js:46`, `app.js:68`** · «Fatto!» appare anche quando la richiesta fallisce: `res.ok` non viene controllato alle righe 18 e 44. Proposte di testo:
    - pubblicazione: «Turni pubblicati: i dipendenti li vedono nell'app.»;
    - scambio: «Scambio confermato: sab 7 nov passa a Marta F.»;
    - nuovo dipendente: «Giulia R. aggiunta ai dipendenti.».

    Se la pubblicazione fallisce, il responsabile crede che i turni siano visibili ai dipendenti quando non lo sono. Il controllo dell'esito spetta alla Software Agency. Il toast dura 1,5 secondi (`app.js:8`), troppo poco per leggerlo. **P1**
25. **`app.js:58`** · «Hai sbagliato il numero.» dà la colpa all'utente e non dice cosa fare → «Il numero di telefono deve avere 10 cifre, per esempio 3331204455.». Il controllo rifiuta gli spazi, ma la tabella mostra i numeri con gli spazi («333 120 4455», `dipendenti.html:26`): meglio accettarli (Software). Il messaggio va accanto al campo, come prevede `docs/componenti.md:23`. **P2**
26. **`app.js:64`** · «Errore ${res.status}: payload non valido» mostra un codice tecnico e non indica il passo successivo → «Non è stato possibile aggiungere il dipendente. Controlla i campi segnalati e riprova.». Inoltre `form.reset()` alla riga 65 cancella 14 campi, IBAN compreso: è un problema per lo Usability Auditor, e senza reset il testo può aggiungere «I dati inseriti sono rimasti nel modulo». **P2**
27. **`app.js:32-34` e `app.js:69-71`** · in caso di errore il messaggio finisce solo in `console.log` e l'utente non vede nulla → «Non è stato possibile salvare. Controlla la connessione e riprova.». **P2**
28. **`app.js:86`** · «Vuoi davvero procedere?» non dice cosa si elimina né le conseguenze → «Eliminare il locale Trattoria Il Ponte? L'operazione non si può annullare.», con i pulsanti «Elimina il locale» / «Annulla» invece di OK/Annulla del `confirm` nativo. **Domanda:** cosa viene cancellato (turni, dipendenti, presenze)? Va scritto nella conferma; non lo invento. **P1**
29. **`app.js:22-25`** · «Elimina settimana» svuota la griglia senza conferma e senza messaggio. Conferma proposta: «Eliminare i turni di lun 2 nov – dom 8 nov? I dipendenti non li vedranno più.». Messaggio dopo l'eliminazione: «Turni della settimana eliminati.». **Domanda:** l'eliminazione si può annullare? Da vedere con lo Usability Auditor. **P1**
30. **`app.js:12`** · l'uscita automatica dopo 10 minuti avviene senza avviso. Il timer parte al caricamento della pagina e non si azzera con l'attività, nonostante il commento. Avviso proposto: «Per sicurezza uscirai tra 1 minuto. Resta collegato.», con un pulsante «Resta collegato». Il responsabile prepara i turni la domenica sera e può perdere il lavoro (WCAG 2.2, 2.2.1, livello A; da verificare con l'Accessibility Specialist). **P1**
31. **`impostazioni.html:20`** · «Le modifiche si salvano da sole.» non è seguito da nessuna conferma o errore (`app.js:93`) → «Le modifiche si salvano automaticamente.», più uno stato «Salvato alle 18:30» oppure «Non salvato: riprova». **P3**
32. **`app.js:78`** · quando la ricerca non trova nulla, la tabella resta vuota senza un messaggio → «Nessun dipendente trovato per «…». Controlla il nome o cancella la ricerca.». **P3**

### D. Formati incoerenti (il glossario vuole «lun 3 feb», «18:30» e «1.248»)

33. **`turni.html:22`** · «02/11 – 08/11» → «lun 2 nov – dom 8 nov». **P2**
34. **`turni.html:34`** · le intestazioni «Lun … Dom» non hanno le date → «lun 2 nov», «mar 3 nov» e così via, in minuscolo come nel glossario. **P3**
35. **`impostazioni.html:46-48`** · «2026-11-07 18:00–00:30» → «sab 7 nov, 18:00–00:30». **P2**
36. **`dipendenti.html:40` e `dipendenti.html:46`** · lo stesso modulo chiede «gg/mm/aaaa» e «aaaa-mm-gg» → un solo formato, «gg/mm/aaaa», in entrambi i campi. **P2**
37. **`index.html:90`** · «mercoledì 11 novembre» → «mer 11 nov». Le etichette «12 ott» … «9 nov» alle righe 86-88 indicano settimane → «sett. del 12 ott». **P3**
38. **Testi dei grafici**:
    - `index.html:45` («● presente ● in ritardo ● assente»): nella schermata i pallini della legenda sono grigi, quindi non spiegano i colori;
    - celle senza pallino (sab e dom): **domanda**, cosa significano?
    - `index.html:81` («Rosso: … Verde: …»): legenda affidata solo al colore;
    - `index.html:51` («Torta del costo per ruolo») → «Costo del lavoro per ruolo: cucina 34%, sala 29%, …».

    Da passare al Data Visualization Designer e all'Accessibility Specialist (WCAG 2.2, 1.4.1). **P3**

## Domande aperte per l'utente

1. Lo scambio dalla finestra dei turni è immediato o va approvato? (rilievo 11)
2. L'invito all'app parte quando si aggiunge il dipendente? (rilievo 13)
3. «Salva» crea una bozza non pubblicata? (rilievo 15)
4. Il 31% del costo del lavoro è calcolato sugli incassi? (rilievo 20)
5. Cosa cancella «Elimina locale», e l'eliminazione della settimana si può annullare? (rilievi 28 e 29)
6. Qual è l'elenco ufficiale dei ruoli? (rilievo 10)
7. Cosa indica una cella senza pallino? (rilievo 38)

## JSON (estratto: i P1)

```json
{
  "project": "turnio-pannello",
  "audit_id": null,
  "agent": "AIWDA-10 · AVIOR",
  "page": {"name": "Pannello Turnio (4 pagine + js/app.js)", "url": null},
  "observations": [
    {"id": "AVIOR-17", "type": "content", "title": "Pulsanti con sola icona, senza nome", "description": "◀ ▶ (turni.html:21,23), ⇄ (turni.html:37), ✕ (turni.html:50), ✎ 🗑 (dipendenti.html:26-28) non hanno testo né aria-label", "evidence": {"url": "turni.html, dipendenti.html", "screenshot": "schermate/turni-computer.png", "location": "griglia turni e tabella dipendenti", "steps": ["Leggere il codice alle righe indicate"]}, "impact": "Con un lettore di schermo non si sa quale dipendente si modifica o si elimina", "priority": "P1", "confidence": 0.8, "recommendation": "Settimana precedente/successiva; Scambia il turno di sab 7 nov; Chiudi; Modifica/Elimina <nome> (WCAG 2.2, 4.1.2)", "status": "Nuova", "requires_human_review": true},
    {"id": "AVIOR-18", "type": "accessibility", "title": "Lingua della pagina dichiarata in inglese", "description": "<html lang=\"en\"> con contenuto in italiano", "evidence": {"url": "tutte le pagine", "screenshot": null, "location": "riga 2", "steps": ["Leggere la riga 2 di ogni .html"]}, "impact": "Pronuncia errata da parte del lettore di schermo", "priority": "P1", "confidence": 0.9, "recommendation": "lang=\"it\" (WCAG 2.2, 3.1.1)", "status": "Nuova", "requires_human_review": true},
    {"id": "AVIOR-24", "type": "content", "title": "«Fatto!» anche quando l'azione fallisce", "description": "app.js:19,46,68: il toast è generico e alle righe 18 e 44 non si controlla res.ok", "evidence": {"url": "turni.html, dipendenti.html", "screenshot": null, "location": "js/app.js:18-19, 44-46, 68", "steps": ["Leggere i gestori di publish, swap-ok e submit"]}, "impact": "Il responsabile crede pubblicati turni che non lo sono", "priority": "P1", "confidence": 0.75, "recommendation": "Toast specifici per esito (Turni pubblicati: i dipendenti li vedono nell'app.) e messaggio di errore in caso di fallimento", "status": "Nuova", "requires_human_review": true},
    {"id": "AVIOR-28", "type": "content", "title": "Conferma di eliminazione del locale senza conseguenze", "description": "app.js:86 confirm(\"Vuoi davvero procedere?\")", "evidence": {"url": "impostazioni.html", "screenshot": null, "location": "js/app.js:86", "steps": ["Impostazioni > Elimina locale"]}, "impact": "Azione irreversibile confermata senza sapere cosa si perde", "priority": "P1", "confidence": 0.85, "recommendation": "Eliminare il locale Trattoria Il Ponte? L'operazione non si può annullare. [Elimina il locale] [Annulla]; conseguenze da confermare con l'utente", "status": "Nuova", "requires_human_review": true},
    {"id": "AVIOR-29", "type": "content", "title": "Eliminazione della settimana senza conferma né messaggio", "description": "app.js:22-25 svuota la griglia", "evidence": {"url": "turni.html", "screenshot": "schermate/turni-computer.png", "location": "js/app.js:22-25; turni.html:28", "steps": ["Turni > Elimina settimana"]}, "impact": "Possibile perdita dei turni di una settimana con un solo clic", "priority": "P1", "confidence": 0.8, "recommendation": "Conferma: Eliminare i turni di lun 2 nov – dom 8 nov? I dipendenti non li vedranno più.; poi: Turni della settimana eliminati.", "status": "Nuova", "requires_human_review": true},
    {"id": "AVIOR-30", "type": "content", "title": "Uscita automatica senza avviso", "description": "app.js:12: redirect a /login dopo 10 minuti dal caricamento, senza avviso e senza azzerare il timer con l'attività", "evidence": {"url": "tutte le pagine", "screenshot": null, "location": "js/app.js:11-12", "steps": ["Leggere il codice"]}, "impact": "Perdita dei turni non salvati durante la preparazione", "priority": "P1", "confidence": 0.8, "recommendation": "Avviso: Per sicurezza uscirai tra 1 minuto. [Resta collegato] (WCAG 2.2, 2.2.1)", "status": "Nuova", "requires_human_review": true}
  ],
  "tested_scenarios": ["Lettura del codice delle 4 pagine e di js/app.js", "Confronto con docs/glossario.md e docs/componenti.md", "Schermata turni-computer.png"],
  "limitations": ["Pagine statiche senza server: toast, confirm ed errori non osservati a schermo", "Guardata solo una schermata su otto", "Direttore AIWDA-01 non caricato: tool agent non disponibile"],
  "summary": "38 rilievi (6 P1, 19 P2, 13 P3): termini fuori glossario nel menu e nei moduli, pulsanti OK/No/Procedi/Clicca qui, messaggi generici o che danno la colpa all'utente, tre formati di data diversi dal glossario."
}
```

## Fonti

Scheda della biblioteca wcag-2-2: W3C, WCAG 2.2 (Recommendation del 5 ottobre 2023), verificata il 2026-11-19. Per i criteri citati che non fanno parte dei sei nuovi di WCAG 2.2 (2.4.4, 4.1.2, 3.1.1, 2.4.2, 2.2.1, 1.4.1) uso le mie conoscenze: vanno confermati dall'Accessibility Specialist.

Ho lavorato su Opus. I P1 di accessibilità e di comportamento sono comunque da riesaminare con il direttore e con gli specialisti indicati prima di renderli definitivi.

— AVIOR (AIWDA-10)
