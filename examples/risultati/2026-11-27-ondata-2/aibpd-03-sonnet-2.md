AIBPD-03 · ALPHARD — Senior Product Innovation Strategist, reparto AIBPD (AI Business & Product Development)

Nota: il direttore AIBPD-01 non è stato caricato, perché non ho il tool `agent`. Ho lavorato solo in lettura su `innovazione/concetti.md`, `mercato/*` e, per confronto, su `crescita/prezzi.md` e `roadmap/portafoglio.md`. Le schede della biblioteca (riduzioni di prezzo, recesso, direttiva 2024/825) non riguardano questo compito e non le ho lette. Lavoro su un modello piccolo (Sonnet): i rilievi P0/P1 sotto vanno riesaminati dal direttore o da un revisore su Opus prima di diventare definitivi.

## Esito
La proposta «dopo A, investire su C, poi B» poggia su un errore di calcolo nella matrice. Corretta, C non è il secondo concetto. Anche i dati di mercato su cui si basa la scelta hanno più errori. Le validazioni di B e C sono deboli, e per B e C mancano rischi regolatori e di canale.

## Rilievi

**1. P0 · `innovazione/concetti.md` riga 36: il totale di C è sbagliato**
- Fatto: 5×0,4 + 2×0,3 + 3×0,3 = 2,0 + 0,6 + 0,9 = **3,5**, non 4,4. I totali di A (4,3) e B (3,7) sono corretti.
- Con i punteggi attuali la classifica è A 4,3, B 3,7, C 3,5. La proposta della riga 38 si ribalta: dopo A viene B, non C.
- Correzione: totale C a 3,5 e proposta riscritta («dopo A, B; C solo dopo validazione»). Poi ricontrollare i totali con una formula.

**2. P1 · `concetti.md` righe 32–36: i punteggi non hanno evidenze**
- Il valore 5 di C non ha alcun dato. Nel sondaggio il problema del personale extra non compare (al massimo in «altro 8%»).
- La fattibilità 2 di C ignora i vincoli regolatori (rilievo 5). La coerenza 3 non è motivata. Il 4 di B è basato sul 19% del sondaggio (riga 15).
- Mancano il giudizio di chi ha dato i punteggi e un'analisi di sensibilità.
- Correzione: motivare ogni punteggio con la fonte o segnarlo come ipotesi, e mostrare come cambia la classifica variando i pesi. Con pesi uguali A resta primo e B supera C (A 4,33, B 3,67, C 3,33). L'ordine B su C regge, quindi la sensibilità conferma la correzione del rilievo 1.

**3. P1 · `concetti.md` righe 15–19 (B Paghe Light): rischi sottovalutati e validazione debole**
- Riga 19 dice «nessun rischio rilevante; il modulo usa dati che Turnio ha già». È un'ipotesi non verificata. Il cedolino richiede dati che Turnio non ha, come retribuzioni, contratti collettivi, trattenute e IBAN.
- Rischio non considerato, canale di acquisizione: il 38% dei clienti ha conosciuto Turnio dal consulente del lavoro o dal commercialista (`sondaggio-2026.md` riga 15). Un prodotto «senza passare dal consulente» (riga 16) attacca il canale principale. Il Pro include già l'esportazione per il consulente (`prezzi.md`).
- Rischio regolatorio: l'elaborazione delle paghe è un'attività regolata, e va verificata con un legale o un consulente del lavoro (non lo posso confermare io). Servono anche una DPIA preliminare e il coinvolgimento di Privacy & Compliance, perché sono dati retributivi di dipendenti. Resta la responsabilità per errori di calcolo.
- Validazione: 20 interviste ai clienti con «Compreresti a 15 €?» misurano un'intenzione dichiarata, non un acquisto. I clienti sono gli stessi che rispondono per un buono Amazon (rilievo 6) e la soglia 12/20 è arbitraria. Il 58% di interesse («Sì») nel sondaggio non indica una disponibilità a pagare.
- Correzione: riscrivere i rischi, cambiare la validazione con un test di impegno reale (lista d'attesa a pagamento o preordine) e misurare l'effetto sul canale consulenti.

**4. P1 · `concetti.md` righe 21–26 (C Personale extra): validazione non falsificabile e concetto non analizzato**
- «Validato se l'interesse è positivo» (riga 26) non ha soglia, né metrica, né campione, né durata, e una pagina di presentazione misura solo la curiosità. Va fissata la soglia in anticipo (per esempio sulla pagina: x% di clic su «pubblica turno», y locali che lasciano un contatto).
- L'ipotesi «vorranno usare» (riga 25) non è una ipotesi critica: le ipotesi critiche del concetto sono altre. Sono l'offerta di lavoratori (marketplace a due lati, partenza a freddo), la frequenza d'uso (stagionale), l'affidabilità del lavoratore e il rischio di insoluto, perché Turnio fattura al locale.
- Il ricarico del 18% (riga 24) è dato senza nessun calcolo di margine: mancano contributi, assicurazione, costi di incasso e gestione. Con il margine lordo attuale del 78% (`README.md`) non è confrontabile. Serve un modello di costo con formule e scenari.
- Correzione: scrivere ipotesi con soglia, un esperimento a basso costo (per esempio gestione manuale di pochi turni con un solo locale amico, solo con approvazione) e un modello economico.

**5. P1 · `concetti.md` riga 24 (C): rischio legale non considerato**
- «Turnio assume formalmente il lavoratore per la giornata e lo fattura al locale»: è un'attività di intermediazione o somministrazione di lavoro, che di norma richiede un'autorizzazione specifica, oltre agli obblighi di datore di lavoro (contratti, contributi, sicurezza, assicurazione). Io non posso confermarlo: serve un parere legale prima di continuare. La Software Agency non ha niente da fare finché questo non è chiaro, e la fattibilità 2 non lo documenta.
- Anche i dati personali dei lavoratori occasionali richiedono Privacy & Compliance.
- Correzione: aggiungere un campo «Rischi e vincoli» con questo punto e fermare ogni investimento su C fino al parere.

**6. P1 · `concetti.md` riga 11 e righe 9–10 (A Scambio dei turni): «validato» sovrastima la prova**
- 8 locali clienti scelti, 2 settimane, nessun gruppo di controllo e confronto con le due settimane precedenti (stagionalità e novità non isolate). 6 su 8 è il 75%, con un campione che non regge una conclusione («validato» va sostituito con «segnale positivo»).
- Un «prototipo cliccabile» non può misurare le assenze realmente coperte; il testo non dice come sono state misurate.
- Il problema è nato dal sondaggio dei clienti (46%): i 74 rispondenti sono il 18% dei clienti, autoselezionati e incentivati con un buono, e non rappresentano il mercato (`sondaggio-2026.md` righe 3–5).
- Correzione: riscrivere lo stato come «segnale positivo su 8 locali, da confermare con il rilascio graduale» e fissare in anticipo la soglia di decisione.

**7. P1 · `concetti.md` e `concorrenti.md`: la concorrenza non entra nel confronto**
- Orarix e Shiftella hanno già lo scambio dei turni (`concorrenti.md` righe 7 e 9). Lo scambio non è un vantaggio ma un requisito di parità, e il testo (riga 5–11) lo presenta come differenziante. Va aggiunto «cosa ci rende diversi» (per esempio l'integrazione con le paghe di Orarix mostra dove andrebbe B).
- Il piano Pro include lo scambio solo dal 2027: nel frattempo Turnio è indietro.

**8. P1 · `mercato/sintesi-mercato.md` righe 9–13: TAM, SAM e SOM calcolati male**
- Il TAM usa 198.000 locali del 2019 (F1), invece dei 176.000 del 2026 (F2): dato vecchio di sette anni e superato dalla fonte più recente.
- Il TAM conta anche il 58% di locali senza dipendenti (F2), che non hanno bisogno di turni. Il segmento reale di Turnio è il 31% con 3–40 dipendenti (riga 29 della stessa sintesi, incoerente con il TAM): 176.000 × 31% = 54.560 locali.
- Il prezzo è il piano Plus a 99 € (riga 13), ma il mix reale è Base 190, Pro 170, Plus 52 locali: prezzo medio effettivo 21.630 / 412 = circa 52,5 € al mese.
- Stima prudente da rifare: TAM 54.560 × 52,5 × 12 = circa 34,4 milioni di € l'anno. SAM (60% Nord e Centro, ma la quota del 60% è sui locali totali e va verificata sul segmento): 32.736 locali, circa 20,6 milioni di €. SOM al 5%: circa 1,0 milioni di € e circa 1.640 locali. È un ordine di grandezza molto inferiore ai 7,1 milioni di € e ai 5.940 locali dichiarati. Sono mie stime con assunzioni esplicite, da confermare. Il 5% a tre anni è, inoltre, senza fonti (oggi la quota di Turnio sul segmento è circa 0,75%).
- Il 99 € come «prezzo verso cui crescono i clienti» (riga 13) è un'ipotesi non verificata: i Plus sono 52 su 412.
- Correzione: ricalcolare con F2, segmento 3–40, prezzo medio effettivo, e indicare gli intervalli.

**9. P1 · `sintesi-mercato.md` riga 17: crescita sbagliata**
- Da 0,8 a 1,4 miliardi in tre anni (2023–2026) dà un CAGR di (1,4/0,8)^(1/3) − 1 = **20,5%**, non 32%.
- «Il mercato dei turni segue lo stesso andamento» è un'ipotesi senza fonte: F3 riguarda la spesa in software gestionale in generale.
- Correzione: scrivere 20%, o 21% arrotondato, e togliere l'estensione ai turni oppure segnarla come ipotesi.

**10. P1 · `sintesi-mercato.md` riga 21 e `sondaggio-2026.md`: disponibilità a pagare non rappresentativa**
- Il 64% è un dato dei 74 rispondenti, tutti clienti già paganti (il sondaggio è inviato ai 412 clienti), ma la sintesi lo attribuisce al «mercato» e conclude che il Pro è sostenibile «per la maggior parte del mercato, non solo per i clienti attuali». Non è supportato: la domanda era per un locale da 10–25 dipendenti, e chi paga già ha una preferenza rivelata.
- Le fasce del sondaggio si sovrappongono: «30–59 €» e «59 € o più» includono entrambe 59. Il 64% può contenere chi paga esattamente 59 € (il prezzo Pro).
- Il tasso di risposta del 18% con un buono da 10 € introduce un bias di autoselezione.
- Correzione: riformulare in «il 64% dei rispondenti, clienti attuali», e togliere la conclusione sul mercato, e correggere le fasce.

**11. P1 · `sintesi-mercato.md` riga 25 e `concorrenti.md` righe 7 e 14: quote di mercato e posizione**
- Si sommano unità diverse: 18.000 sono utenti (dipendenti) di Orarix, gli altri sono locali. In locali Orarix ha circa 2.300 clienti (stessa riga 7). Il totale diventa 2.300 + 900 + 350 + 412 = 3.962: Orarix 58,1%, Planora 22,7%, Shiftella 8,8%, Turnio 10,4%.
- «Turnio è secondo per numero di locali» (riga 25) è sbagliato: con 412 locali è terzo, dopo Orarix (2.300) e Planora (900), e sopra Shiftella (350). Il testo dice «sopra Planora e Shiftella»: è falso per Planora.
- «Il mercato è concentrato» con Orarix al 91,5% è una conseguenza dell'errore. Va riscritta con i dati corretti. Inoltre le quote si riferiscono ai soli quattro concorrenti elencati, non al mercato (ci sono altri fornitori, e le fonti sono dichiarazioni dei siti, non verificate).
- Correzione: ricalcolare in locali, e correggere la posizione.

**12. P2 · `mercato/fonti.md`: fonti da citare in modo coerente**
- F1 è del 2019 e F2 del 2026 sullo stesso oggetto (locali attivi): il testo usa il dato vecchio, mentre quello nuovo mostra un calo da 198.000 a 176.000.
- F4 e F5 sono fonti interne e non indipendenti. Va indicato il grado di affidabilità. Nessuna fonte è un ente indipendente per la disponibilità a pagare.
- Correzione: aggiungere una colonna affidabilità e limiti.

**13. P2 · `mercato/sondaggio-2026.md`: il 46% è un dato dei clienti**
- Il «primo problema dei locali» (concetti.md riga 7) deriva dal 46% dei rispondenti: gli stessi che già usano Turnio per fare i turni. Cambiando la domanda, i non clienti darebbero altre risposte. Le percentuali sono su 74 persone (per esempio il 19% sono circa 14 risposte).
- Correzione: scrivere i numeri assoluti e l'intervallo di errore.

## Domande aperte
- Chi ha dato i punteggi della matrice e con che criterio? I pesi sono stati scelti prima di vedere i totali?
- Come sono state misurate le assenze coperte nella prova di A (ottobre 2026)?
- C è stato valutato da un legale? Se sì, questo documento non lo riporta.
- Quanti dei 412 clienti sono arrivati da consulenti, e cosa direbbero a Paghe Light?

## Decisioni che spettano all'utente
- Quale classifica adottare dopo la correzione (A, poi B, poi C solo dopo parere legale e validazione).
- Se rifare il dimensionamento del mercato prima di darlo agli investitori.
- Se coinvolgere Privacy & Compliance per B e C e un legale prima di qualunque lavoro su C.

Nessun file modificato. Firmato: AIBPD-03 · ALPHARD.
