AIWDA-04 · ACRUX — Senior Information Architect, reparto AIWDA (AI Web Design)

Nota di avvio: le istruzioni dicono di caricare prima il direttore AIWDA-01 · CANOPUS con il tool `agent`, ma in questa sessione quel tool non c'è. Ho lavorato sul compito che mi è stato assegnato e consegno qui il rapporto per CANOPUS. Ho solo letto i file, senza modificarne nessuno. Non ho aperto un browser: ho guardato le schermate PNG.

## Esito
L'architettura del pannello non segue i compiti del README. Le due funzioni ricorrenti più difficili da trovare, approvare gli scambi (compito 2) ed esportare le presenze (compito 4), stanno dentro «Settings», una a 2 livelli e l'altra a 4 livelli di profondità. Il menu va in ordine di cartella, cioè al contrario della frequenza dei compiti. La prima pagina è il cruscotto, che 3 intervistati su 5 dicono di non usare. I nomi cambiano fra menu, titoli e glossario.

C'è anche un problema a monte: `ricerca/sintesi.md` non rispecchia `ricerca/interviste.md`, e le sue raccomandazioni giustificano proprio queste scelte. Le osservazioni sono 9: 4 P1, 4 P2 e 1 P3.

## Mappa della struttura osservata
Il menu è piatto, con 4 voci uguali in tutte le pagine (`*.html` righe 11-16). Ordine: Settings › Dashboard › Squadra › Turni. Dopo l'accesso si arriva su Dashboard (`docs/mappa.md:10`).
- **Settings** (`impostazioni.html`, h1 «Impostazioni»)
  - ▸ Locale: nome del negozio, orari
    - ▸ Esporta
      - ▸ Presenze per il consulente: mese e pulsante «Clicca qui»
      - ▸ Report del costo del lavoro
  - ▸ Scambi da approvare (3): tabella con OK/No
  - Zona pericolosa: Elimina locale
- **Dashboard** (`index.html`, h1 «Dashboard»): banner «3 scambi da approvare» senza link, 3 numeri e 4 grafici.
- **Squadra** (`dipendenti.html`, h1 «Personale»): ricerca, tabella e modulo «Aggiungi una risorsa».
- **Turni** (`turni.html`, h1 «Turni»): navigazione fra le settimane; Pubblica, Elimina settimana e Salva; griglia; pulsante ⇄ che apre la finestra «Swap del turno».

Differenze fra `docs/mappa.md` e le pagine:
- mappa.md:5 mette i «ruoli» nel Locale, ma la pagina non li ha.
- mappa.md:6 mette il «report del costo del lavoro» nella Dashboard, ma il report è solo nelle impostazioni (`impostazioni.html:35-36`).

## Rilievi (JSON)
```json
{
  "project": "Turnio – pannello web per i responsabili",
  "audit_id": null,
  "agent": "AIWDA-04 · ACRUX",
  "page": { "name": "Pannello (menu, mappa, titoli)", "url": "index.html, turni.html, dipendenti.html, impostazioni.html" },
  "observations": [
    {
      "id": "ACRUX-01",
      "type": "information_architecture",
      "title": "Gli scambi da approvare stanno nelle impostazioni, lontano dai turni",
      "description": "Fatto: l'approvazione degli scambi (compito 2, più volte a settimana) è un <details> chiuso dentro Settings (impostazioni.html:41-51). Il banner della Dashboard «3 scambi da approvare» non è un link (index.html:22-24). In Turni il ⇄ apre «Swap del turno» (turni.html:37, 48-56), che crea uno scambio ma non lo approva: le funzioni sullo scambio sono divise fra due pagine. Fatto: I4 dice «Mi arriva la notifica ma poi nel pannello non capisco dove approvarli» (ricerca/interviste.md:32). Inferenza: la raccomandazione «Lo scambio dei turni resta nelle impostazioni, perché si configura una volta sola» (ricerca/sintesi.md:21) scambia la configurazione, che è rara, con l'approvazione, che è ricorrente.",
      "evidence": { "url": "impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "impostazioni.html:41-51; index.html:22-24; turni.html:37,48-56", "steps": ["Aprire index.html: il banner degli scambi non porta da nessuna parte", "Aprire Turni: nessuna richiesta da approvare", "Aprire Settings e poi espandere «Scambi da approvare»"] },
      "impact": "Il secondo compito per frequenza richiede di sapere che si trova in Settings e di aprire una sezione chiusa. L'utente arriva dalla notifica e non trova la richiesta.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Spostare «Scambi da approvare» in Turni, come sezione in cima alla pagina quando ci sono richieste. Mostrare il numero sulla voce di menu (es. «Turni 3») e rendere il banner della Dashboard un link alla sezione. Con la notifica dell'app arrivare direttamente lì. Nelle impostazioni lasciare solo l'eventuale configurazione dello scambio. Aggiornare docs/mappa.md:5 e :8.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "ACRUX-02",
      "type": "information_architecture",
      "title": "L'esportazione delle presenze è a 4 livelli di profondità, dentro «Locale»",
      "description": "Fatto: il percorso è Impostazioni › Locale › Esporta › Presenze per il consulente, con tre <details> annidati (impostazioni.html:22-39). La mappa lo dichiara come struttura voluta (docs/mappa.md:12). «Esporta» non c'entra con «Locale», che contiene nome e orari. Il pulsante dice «Clicca qui» (impostazioni.html:32), quindi non si trova cercando il nome dell'azione. Fatto: I1 dice «non trovo mai dove sta il pulsante» (interviste.md:11), mentre sintesi.md:11 scrive che l'esportazione «funziona e non ha richiesto commenti».",
      "evidence": { "url": "impostazioni.html", "screenshot": "schermate/impostazioni-computer.png", "location": "impostazioni.html:22-39; docs/mappa.md:12", "steps": ["Aprire Settings", "Espandere Locale", "Espandere Esporta", "Espandere Presenze per il consulente"] },
      "impact": "Il compito 4 si fa una volta al mese: è troppo raro per ricordare un percorso nascosto in 4 livelli sotto un'etichetta che non c'entra.",
      "priority": "P1",
      "confidence": 0.9,
      "recommendation": "Creare una voce di primo livello «Presenze» con mese e «Esporta le presenze», al massimo a un livello dal menu. In alternativa, se l'utente vuole restare a 4 voci, metterla come sezione visibile (non chiusa) in Dipendenti. Mettere «Report del costo del lavoro» nello stesso punto oppure nel Cruscotto, ma in un posto solo (vedi ACRUX-07). Aggiornare docs/mappa.md:5 e :12.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "ACRUX-03",
      "type": "information_architecture",
      "title": "Il menu segue l'ordine della cartella, al contrario della frequenza dei compiti",
      "description": "Fatto: l'ordine è Settings, Dashboard, Squadra, Turni (impostazioni.html:11-16 e le altre pagine). La mappa dice «L'ordine del menu segue quello delle pagine nella cartella» (docs/mappa.md:10). Settings, il compito più raro (5), è in prima posizione. Turni, il più frequente (1), è in ultima.",
      "evidence": { "url": "tutte le pagine", "screenshot": "schermate/turni-telefono.png", "location": "<nav class=\"nav\"> righe 11-16 di ogni pagina; docs/mappa.md:3-10", "steps": ["Aprire qualunque pagina e leggere il menu da sinistra"] },
      "impact": "La prima voce che l'utente vede e tocca è quella che serve meno. Su telefono «Settings» sta nella posizione più comoda per il pollice.",
      "priority": "P1",
      "confidence": 0.85,
      "recommendation": "Ordinare le voci per compito: Turni, Dipendenti, Presenze, Cruscotto, Impostazioni (Impostazioni sempre in fondo). Nella mappa sostituire la regola della riga 10 con «ordine per frequenza dei compiti del README».",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "ACRUX-04",
      "type": "information_architecture",
      "title": "Le scelte di struttura vengono da una sintesi della ricerca che non rispecchia le interviste",
      "description": "Fatto: sintesi.md:7 scrive che «Tutti» volevano più indicatori, ma solo I3 lo dice (interviste.md:23). I1, I2 e I5 dicono il contrario (righe 9, 16, 39). Sintesi.md:8 scrive che il pannello si usa ogni giorno, ma I1 lo apre una volta a settimana, I4 la domenica e per gli scambi, I5 due o tre volte. La persona «Marco» coincide con il solo I3 (sintesi.md:15). Il computer come dispositivo principale vale per I3 e in parte per I5: I1, I2 e I4 usano il telefono o il tablet. Le domande 3 e 4 del protocollo sono suggestive (protocollo.md:12-13). Inferenza: da questa sintesi vengono le scelte criticate in ACRUX-01, -05 e -08 (sintesi.md:19-21).",
      "evidence": { "url": "ricerca/", "screenshot": null, "location": "ricerca/sintesi.md:7-21; ricerca/interviste.md; ricerca/protocollo.md:12-13", "steps": ["Confrontare ogni risultato di sintesi.md con le frasi di interviste.md"] },
      "impact": "La struttura del pannello ottimizza il caso minoritario (I3) e penalizza i compiti frequenti degli altri responsabili.",
      "priority": "P1",
      "confidence": 0.8,
      "recommendation": "Riscrivere la sintesi partendo dalle interviste: compiti per frequenza e dispositivo, cruscotto non prioritario per 3 su 5, scambi e assenze come problemi principali. Correggere le domande 3 e 4 per le prossime interviste. Poi rivedere le raccomandazioni di sintesi.md:19-21. Da affidare alla UX Research del reparto, su decisione del direttore.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "ACRUX-05",
      "type": "information_architecture",
      "title": "La prima pagina dopo l'accesso è il cruscotto, non la settimana dei turni",
      "description": "Fatto: «La prima pagina dopo l'accesso è il cruscotto» (docs/mappa.md:10). index.html contiene numeri e 4 grafici. Fatto: I5 dice «Non mi serve, mi serve vedere la settimana» (interviste.md:39). I2 vuole sapere «chi manca oggi» (interviste.md:16). I1 guarda i numeri a fine mese (interviste.md:9).",
      "evidence": { "url": "index.html", "screenshot": "schermate/index-computer.png", "location": "docs/mappa.md:10; index.html:18-91", "steps": ["Accedere al pannello: si arriva su Dashboard", "Per il compito 1 serve un passaggio in più fino a Turni"] },
      "impact": "Ogni sessione per il compito 1 o 2 parte con un passaggio in più, attraverso una pagina che la maggior parte degli utenti non usa.",
      "priority": "P2",
      "confidence": 0.75,
      "recommendation": "Usare Turni (settimana corrente) come prima pagina, con in cima gli scambi da approvare e chi è di turno o assente oggi. Spostare il Cruscotto dopo Presenze nel menu. La decisione spetta all'utente dopo la correzione della sintesi (ACRUX-04).",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "ACRUX-06",
      "type": "consistency",
      "title": "Nomi diversi fra menu, titoli e glossario",
      "description": "Fatto: il menu dice «Settings» e l'h1 «Impostazioni» (impostazioni.html:12, 19). Il menu dice «Dashboard», il README e la mappa «Cruscotto» (README.md:24). Il menu dice «Squadra», l'h1 «Personale» (dipendenti.html:14, 19), il segnaposto «collaboratore» (riga 20), l'h2 «risorsa» (riga 32), la didascalia «Dipendenti». Il glossario prescrive «dipendente» e vieta collaboratore, staff e risorsa (docs/glossario.md:8). La finestra dice «Swap del turno» e «fascia» (turni.html:51-52), mentre il glossario vieta swap e fascia (righe 7, 9). La pagina dice «Nome del negozio» (impostazioni.html:24), mentre il glossario prescrive «locale».",
      "evidence": { "url": "tutte le pagine", "screenshot": "schermate/dipendenti-computer.png", "location": "voci del menu righe 12-15; h1 di ogni pagina; dipendenti.html:20,32; turni.html:51-52; impostazioni.html:24", "steps": ["Cliccare ogni voce di menu e confrontarla con l'h1 della pagina che si apre"] },
      "impact": "Quando voce di menu e titolo non coincidono, l'utente non ha la conferma di essere arrivato dove voleva. I sinonimi fanno pensare a funzioni o insiemi diversi.",
      "priority": "P2",
      "confidence": 0.95,
      "recommendation": "Usare per ogni pagina un solo nome, uguale nel menu, nell'h1, nel <title> e in mappa.md: Turni, Dipendenti, Presenze, Cruscotto, Impostazioni. Sostituire «risorsa/collaboratore» con «dipendente» («Aggiungi un dipendente», «Cerca un dipendente»), «Swap del turno» con «Scambio del turno», «fascia» con «turno» e «negozio» con «locale». Passare alla UX Writer per gli altri testi.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "ACRUX-07",
      "type": "information_architecture",
      "title": "Tutte le pagine hanno lo stesso titolo «Turnio» e la lingua dichiarata è l'inglese",
      "description": "Fatto: <title>Turnio</title> in tutte e quattro le pagine (riga 6) e <html lang=\"en\"> con contenuto in italiano (riga 2). WCAG 2.2, 2.4.2 Page Titled (A) e 3.1.1 Language of Page (A). La scheda wcag-2-2 della biblioteca (W3C, versione 2.2 del 5 ottobre 2023, verificata il 2026-11-19) conferma la versione; il testo dei due criteri non è nella scheda e lo riporto dalle mie conoscenze, da verificare sulla fonte. Ho messo qui anche le differenze fra mappa e pagine: report del costo del lavoro e «ruoli» (mappa.md:5-6).",
      "evidence": { "url": "tutte le pagine", "screenshot": null, "location": "index.html, turni.html, dipendenti.html, impostazioni.html righe 2 e 6; docs/mappa.md:5-6", "steps": ["Aprire due pagine in due schede: hanno lo stesso nome", "Confrontare mappa.md con il contenuto delle pagine"] },
      "impact": "Le pagine non si distinguono nelle schede, nella cronologia e nei lettori di schermo, e la pronuncia è sbagliata. La mappa non si può usare come riferimento.",
      "priority": "P2",
      "confidence": 0.9,
      "recommendation": "<title> nella forma «Turni · Turnio», «Dipendenti · Turnio» ecc., uguale all'h1, e lang=\"it\". Allineare mappa.md alle pagine: il report del costo del lavoro in un solo punto, i ruoli aggiunti al Locale oppure tolti dalla mappa. Passare all'Accessibility Specialist per la verifica.",
      "status": "Nuova",
      "requires_human_review": false
    },
    {
      "id": "ACRUX-08",
      "type": "information_architecture",
      "title": "La vista della settimana non è organizzata per il telefono, il dispositivo dei compiti 1 e 2",
      "description": "Fatto: la schermata di Turni su telefono è larga 1126 px invece di 390 (schermate/turni-telefono.png): la griglia di 7 colonne obbliga a scorrere la pagina in orizzontale. Anche index-telefono.png è larga 584 px. Fatto: I1, I2 e I4 preparano i turni dal telefono, I5 a volte (interviste.md:7, 15, 29, 36). Ipotesi: su telefono serve un'altra organizzazione della settimana, non solo un ridimensionamento.",
      "evidence": { "url": "turni.html", "screenshot": "schermate/turni-telefono.png", "location": "turni.html:33-44 (.week)", "steps": ["Aprire schermate/turni-telefono.png: la larghezza della pagina supera quella dello schermo"] },
      "impact": "Il compito principale, sul dispositivo usato dalla maggior parte degli utenti, richiede di scorrere in due direzioni e si perde di vista il nome del dipendente.",
      "priority": "P1",
      "confidence": 0.7,
      "recommendation": "Su telefono mostrare la settimana per giorno: selettore dei giorni e, sotto, l'elenco dei dipendenti di turno, con «Pubblica i turni» sempre raggiungibile. Su computer tenere la griglia. Verificare con il UI Designer (layout) e su un dispositivo vero.",
      "status": "Nuova",
      "requires_human_review": true
    },
    {
      "id": "ACRUX-09",
      "type": "information_architecture",
      "title": "Le azioni distruttive stanno accanto alle funzioni frequenti",
      "description": "Fatto: «Elimina locale» è sulla stessa pagina e allo stesso livello degli scambi da approvare (impostazioni.html:53-54). «Elimina settimana» è un pulsante primario accanto a «Pubblica i turni» (turni.html:27-28).",
      "evidence": { "url": "impostazioni.html, turni.html", "screenshot": "schermate/turni-telefono.png", "location": "impostazioni.html:53-54; turni.html:27-29", "steps": ["Aprire Turni: Pubblica ed Elimina settimana hanno lo stesso aspetto e stanno vicini"] },
      "impact": "Le visite frequenti passano accanto ad azioni irreversibili e aumenta il rischio di errore.",
      "priority": "P3",
      "confidence": 0.7,
      "recommendation": "Una volta spostati gli scambi (ACRUX-01), Impostazioni contiene solo funzioni rare, con «Elimina il locale» in fondo. In Turni, «Elimina settimana» va in un menu secondario. Lo stile del pulsante e la conferma sono di competenza dell'Usability Auditor.",
      "status": "Nuova",
      "requires_human_review": false
    }
  ],
  "tested_scenarios": [
    "Compito 1: percorso da accesso a Pubblica i turni (lettura del codice e schermate computer/telefono)",
    "Compito 2: percorso da notifica o banner a approvazione degli scambi",
    "Compito 3: percorso a Aggiungi dipendente",
    "Compito 4: percorso a esportazione presenze",
    "Compito 5: percorso a impostazioni del locale",
    "Confronto docs/mappa.md con pagine; confronto ricerca/sintesi.md con interviste.md"
  ],
  "limitations": [
    "Nessun browser: analisi su sorgenti HTML e schermate PNG; comportamento reale dei <details> e del menu su telefono non provato.",
    "Pagine statiche senza server: nessun ruolo o permesso visibile, non dedotto (es. se il dipendente ha accesso al pannello).",
    "AIWDA-01 non caricato: tool agent non disponibile in questa sessione.",
    "I criteri WCAG 2.4.2 e 3.1.1 non sono nella scheda della biblioteca: citati dalle mie conoscenze, da verificare sulla fonte W3C."
  ],
  "summary": "Struttura piatta a 4 voci in ordine di cartella. Gli scambi da approvare (compito 2) e l'esportazione delle presenze (compito 4) sono nascosti in Settings, la seconda a 4 livelli. La prima pagina è il cruscotto, che la ricerca non giustifica, e la sintesi della ricerca non rispecchia le interviste. Proposta: menu Turni (prima pagina, con gli scambi) · Dipendenti · Presenze · Cruscotto · Impostazioni, profondità massima 2, un solo nome per pagina."
}
```

## Struttura proposta (da confermare con l'utente)
| Voce (ordine) | Pagina | Contenuto |
|---|---|---|
| Turni (prima pagina, con il numero degli scambi) | turni.html | in cima gli scambi da approvare quando ci sono, poi chi è di turno o assente oggi, la settimana (per giorno su telefono) e «Pubblica i turni» |
| Dipendenti | dipendenti.html | elenco, «Aggiungi un dipendente» |
| Presenze | nuova sezione | mese ed «Esporta le presenze»; eventualmente il report del costo del lavoro |
| Cruscotto | index.html | numeri e grafici |
| Impostazioni | impostazioni.html | Locale (nome, orari, ruoli), «Elimina il locale» in fondo |

## Domande aperte per CANOPUS e per l'utente
1. Presenze come quinta voce di menu, oppure come sezione visibile in Dipendenti per restare a 4 voci?
2. Il report del costo del lavoro va nel Cruscotto o in Presenze?
3. La prima pagina diventa Turni? Conviene deciderlo dopo la revisione della sintesi (ACRUX-04).

## Segnalazioni per altri specialisti
- **UX Writer**: date nella forma «02/11 – 08/11» e «2026-11-07», diverse dal glossario; «OK/No», «Clicca qui», «Fatto!».
- **Usability Auditor**: «Elimina settimana» senza conferma (js/app.js:22-25).
- **Privacy**: il modulo dei dipendenti chiede 14 campi obbligatori, fra cui IBAN e codice fiscale, mentre il README parla di invito con nome e telefono (dipendenti.html:34-51).
- **Data Visualization**: grafici in index.html (asse che parte da 60, torta a 8 fette, doppio asse).

Ho lavorato sul modello della sessione (Opus), non su un modello più piccolo.

— AIWDA-04 · ACRUX
