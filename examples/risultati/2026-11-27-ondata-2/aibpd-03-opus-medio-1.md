AIBPD-03 · ALPHARD — Senior Product Innovation Strategist, reparto AIBPD (AI Business & Product Development)

**Nota di contesto.** Non ho potuto caricare il direttore AIBPD-01 · ALDERAMIN perché in questa sessione non ho il tool `agent`: il rapporto va a lui tramite te. Ho lavorato in sola lettura su `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/f0687997-f7af-486b-b044-88d6cde2c599/scratchpad/copie/aibpd-03-1` e non ho modificato file. Per il contesto strategico ho letto anche `prodotto/`, `finanza/`, `roadmap/`, `partner/`, `crescita/prezzi.md` e `marketing/posizionamento.md`. Non ho letto schede della biblioteca: nessuna riguarda il compito, perché la direttiva 2024/825 tratta le asserzioni ambientali. Non ho verificato sul web i riferimenti normativi qui sotto: sono ipotesi da confermare con un consulente legale o del lavoro. Il progetto dichiara inventati tutti i dati (README:5).

## Esito
La proposta della matrice («dopo A investire su C, poi B», concetti.md:38) poggia su un errore di calcolo. Con i numeri corretti l'ordine è A, B, C. Inoltre il concetto C ha il punteggio di valore più alto senza nessuna evidenza e non considera rischi regolatori potenzialmente bloccanti. Le validazioni di A e B sono deboli e la base dati di `mercato/` ha errori che gonfiano problemi e mercato.

## Rilievi

**R1 · P1 · Errore di calcolo nella matrice (concetti.md:36, 38)**
- C vale 5×0,4 + 2×0,3 + 3×0,3 = **3,5**, non 4,4. A (4,3) e B (3,7) sono corretti.
- La classifica corretta è A 4,3, B 3,7, C 3,5, quindi la proposta è invertita.
- Correzione: totale di C a 3,5 e proposta «dopo A, B; C solo dopo validazione».

**R2 · P1 · A non è un'alternativa da scegliere (concetti.md:3, 34; prd-scambio-turni.md:4)**
- Il documento sceglie «cosa investire dopo lo scambio dei turni», ma mette in matrice lo scambio stesso, già approvato e in sviluppo.
- Correzione: togliere A dalla matrice e confrontare solo B e C, più l'opzione «non fare nulla / rafforzare il prodotto attuale».

**R3 · P1 · Il valore 5 di C non ha evidenze (concetti.md:22, 36)**
- Nessun dato di `mercato/` misura il bisogno di personale extra. Il sondaggio non lo chiede: al massimo rientra in «altro 8%» (sondaggio-2026.md:11).
- A ha il 46% delle risposte e una prova sul campo, eppure prende 4.
- Correzione: dare a C un valore di 2–3 finché non c'è un dato, oppure aggiungere alla matrice un criterio «forza dell'evidenza / confidenza». Con valore 3, C scende a 2,7.

**R4 · P1 · Rischi non considerati in C (concetti.md:24; il concetto non ha una sezione Rischi)**
- «Turnio assume formalmente il lavoratore e lo fattura al locale con un ricarico» è, in sostanza, somministrazione di lavoro. In Italia probabilmente richiede l'autorizzazione come agenzia per il lavoro (D.lgs. 276/2003; da verificare), con requisiti di capitale e garanzie.
- Altri rischi assenti:
  - responsabilità di datore di lavoro: contributi, INAIL, sicurezza e formazione, HACCP;
  - anticipo dei salari prima dell'incasso, cioè cassa;
  - avvio di un mercato a due lati senza lavoratori iscritti;
  - dati personali dei lavoratori (serve la Privacy & Compliance Agency);
  - un 18% di ricarico forse non sufficiente a coprire i contributi;
  - una squadra di 14 persone senza competenze HR o legali.
- Correzione: aggiungere la sezione Rischi, fare una verifica legale preliminare prima di qualunque investimento, valutare un modello alternativo (integrazione con agenzie autorizzate a commissione) e portare la fattibilità a 1.

**R5 · P1 · Ipotesi e validazione di C non verificabili (concetti.md:25–26)**
- «Vorranno usare» non ha né metrica né soglia.
- La validazione «se l'interesse è positivo» con una pagina di presentazione non dice da dove arriva il traffico, cosa conta come interesse né quale soglia lo rende positivo.
- Correzione: un'ipotesi misurabile, per esempio «almeno X% dei locali Pro/Plus pubblica almeno un turno extra al mese pagando il ricarico». Poi un test «fake door» dentro l'app sui clienti attuali, con soglia di click e richieste fissata prima. Infine un MVP «concierge» manuale con un'agenzia partner su 5–10 locali, misurando i turni coperti e il margine reale.

**R6 · P1 · «Nessun rischio rilevante» in B è falso (concetti.md:19)**
- «Usa dati che Turnio ha già» non regge: un cedolino richiede contratto, livello CCNL, dati fiscali, detrazioni e IBAN, che Turnio non gestisce.
- Rischi assenti:
  - attività probabilmente riservata ai consulenti del lavoro (L. 12/1979; da verificare);
  - responsabilità per gli errori nei cedolini;
  - dipendenza dal fornitore esterno (business-case.md:14);
  - dati personali delicati, come le assenze per malattia;
  - aggiornamento normativo continuo.
- Conflitto di canale: il consulente del lavoro è il primo canale di acquisizione (38%, sondaggio-2026.md:15). «Senza passare dal consulente» lo mette contro Turnio, e la roadmap investe invece nell'integrazione con il consulente (roadmap.md:21, 26).
- Correzione: sezione Rischi completa, verifica legale, e valutare la variante «Paghe Light per il consulente» (pre-elaborazione delle presenze) che non cannibalizza il canale. In matrice, coerenza da 4 a 3 o motivata.

**R7 · P2 · Validazione di B debole (concetti.md:17–18)**
- «Compreresti a 15 €?» misura un'intenzione dichiarata, che sovrastima l'acquisto reale.
- 20 interviste con soglia 12 non hanno motivazione e non sono filtrate sul segmento: il modulo è per locali fino a 15 dipendenti, ma il 58% di interesse (sondaggio-2026.md:16) è su tutti i rispondenti.
- Correzione: preordine o lista d'attesa con impegno (sconto prepagato o lettera d'intenti) sui clienti fino a 15 dipendenti, soglia di conversione fissata prima, e controllo che il consulente resti comunque necessario.

**R8 · P2 · Validazione di A debole e incoerente (concetti.md:7, 9–11)**
- Il problema sono le assenze «dell'ultimo minuto», ma l'ipotesi misura solo quelle annunciate con più di 4 ore di anticipo, cioè il caso più facile. Il PRD chiude lo scambio 2 ore prima (R6).
- Un prototipo cliccabile non può coprire assenze reali.
- Il confronto prima/dopo su due settimane non ha gruppo di controllo e non tiene conto della stagionalità.
- «6 locali su 8 sopra il 40%» è un criterio diverso dall'ipotesi (40% delle assenze complessive) e non riporta i valori assoluti, presumibilmente pochi casi per locale.
- Correzione:
  - riformulare l'ipotesi sulle assenze sotto le 4 ore o dichiarare il sottoinsieme;
  - riportare i numeri assoluti;
  - indicare lo stato come «segnale positivo», non «validato»;
  - pilota con funzione reale e controllo, come metriche del PRD.
- Rischi non considerati:
  - tutti i concorrenti con app per i dipendenti (Orarix, Shiftella) hanno già lo scambio (concorrenti.md:7, 9), quindi A è un recupero di parità e non un vantaggio;
  - scambio «libero» senza vincoli di orario (prd:38), con possibili violazioni dei riposi minimi (D.lgs. 66/2003; da verificare);
  - le notifiche push escluse dal perimetro (prd:43) contro R5, e l'App dipendenti 2.0 pianificata nel Q3, dopo lo scambio nel Q2 che ne dipende (roadmap.md:25, 28).

**R9 · P2 · La matrice non ha criteri di costo e rischio, e non motiva i punteggi (concetti.md:30–36)**
- Mancano l'impegno o costo (B ha un business case a −93.884 € nel 2027; C nessuna stima), il rischio regolatorio e la confidenza.
- I pesi e i singoli punteggi non sono motivati.
- La differenza B–C (0,2) cambia con un solo punto.
- Correzione: aggiungere costo e confidenza, una riga di motivazione per punteggio e un'analisi di sensibilità.

**R10 · P2 · Incoerenza fra i documenti (concetti.md:38; portafoglio.md:7–8; roadmap.md:19)**
- Portafoglio e roadmap mettono B nel Q1 2027 e C «da valutare dopo lo scambio», mentre i concetti propongono C prima di B.
- Correzione: allineare dopo la correzione di R1.

**R11 · P2 · Il sondaggio è usato come se rappresentasse il mercato (sondaggio-2026.md:4–5; concetti.md:7, 15; sintesi-mercato.md:21)**
- Ha 74 risposte su 412 clienti (18%), con un buono da 10 € e solo clienti attuali: non dice nulla sui «locali» in generale.
- Margine statistico al 95% circa ±10 punti sul 46%; il 19% di B sono circa 14 risposte.
- Le fasce di prezzo si sovrappongono: 59 € sta sia in «30–59» sia in «59 o più».
- Correzione: scrivere «dei clienti che hanno risposto», riportare n e margine, e correggere le fasce.

**R12 · P2 · Errori in `mercato/` che gonfiano il contesto dei concetti**
- **Mercato totale (TAM) e mercato raggiungibile (SAM) (sintesi:9–10, 13).** Usano il censimento 2019 (198.000 locali) invece del dato 2026 (176.000) e non applicano il segmento: il 31% ha 3–40 dipendenti e il 58% non ne ha (fonti.md:8). Usano poi il prezzo del Plus invece del ricavo medio reale (21.630/412 ≈ 52,5 €). Ricalcolo indicativo: 176.000 × 31% × 60% ≈ 32.700 locali, che a 59 € × 12 fanno circa 23,2 M€ (non 141,1 M€).
- **Crescita (sintesi:17).** Da 0,8 a 1,4 miliardi in 3 anni fanno (1,75)^(1/3) − 1 ≈ **20,5%** l'anno, non 32%. «Il mercato dei turni segue lo stesso andamento» non ha fonte.
- **Quote di mercato (concorrenti.md:14; sintesi:25).** Sommano 18.000 utenti (dipendenti) di Orarix con dei locali. Sui locali (2.300 + 900 + 350 + 412 = 3.962) le quote sono Orarix 58,1%, Planora 22,7%, Shiftella 8,8%, Turnio 10,4%: Turnio è **terzo**, non secondo.

## Domande aperte
1. A deve davvero restare nella matrice, o il confronto riguarda solo B e C?
2. Esiste un parere legale su somministrazione (C) ed elaborazione paghe (B)?
3. Quali sono i numeri assoluti del pilota di A (assenze per locale, coperte e non)?
4. La strategia verso i consulenti del lavoro è collaborare (roadmap) o sostituirli (B)?

Fuori perimetro, solo da segnalare: posizionamento.md:19 dice che Orarix non ha l'app per i dipendenti, mentre concorrenti.md:7 dice che ce l'ha dal 2025. Va dato a chi cura il marketing.

Tutto quanto sopra è una proposta: la scelta del concetto e ogni modifica ai documenti spettano all'utente.

— ALPHARD (AIBPD-03)
