AIBPD-10 · RASALHAGUE — Senior Business Development Manager, reparto AIBPD (AI Business & Product Development)

# Valutazione dei due accordi in firma (partner/accordi.md), sola lettura

**Esito: non firmare nessuno dei due accordi così come sono.** Il testo di Cassa Facile ti lega per 10 anni, senza uscita. Quello dell'associazione lascia a Turnio circa il 30% del listino. La sezione «Valutazione» dell'accordo è sbagliata su entrambi i punti.

Non ho caricato AIBPD-01 e non ho letto le schede della biblioteca, perché non ho i tool `agent` e `library`. Le tre schede (riduzioni di prezzo, funzione di recesso, direttiva 2024/825) riguardano i consumatori, mentre i clienti di Turnio sono imprese con prezzi IVA esclusa, quindi non servono qui. Non ho contattato nessuno né modificato file.

Lavoro su un modello più piccolo di quello della sessione, e ci sono rilievi P0 e P1. **Propongo il riesame del direttore AIBPD-01 o di un revisore su Opus prima che diventino definitivi.**

Sono fatti i numeri dei documenti. Sono stime i calcoli che ne derivo: formule e assunzioni sono scritte accanto. Le modifiche sono proposte, non decisioni. Durata, esclusiva e clausole contrattuali vanno viste anche da un legale umano.

Dati usati:
- ARPU 52,50 € (MRR 21.630 € / 412 locali), margine lordo 78%.
- Abbandono annuo 23,8% (clienti/fidelizzazione.md).
- CAC dei canali (crescita/imbuto.md): Google Ads 95 €, Instagram 150 €, referral 0 €, fornitori della cassa 0 €.

## 1 · Cassa Facile S.r.l.

**P0 · Durata e recesso** (accordi.md:17)
- **Rilievo:** 5 anni, rinnovo automatico per altri 5, «nessun recesso anticipato per nessuna delle parti». È un vincolo di 10 anni per un'azienda con ARR di 259.560 €. Manca anche il recesso per inadempimento e il preavviso di non rinnovo.
- **Modifica proposta:** durata 2 anni, rinnovo solo con accordo scritto. Recesso con 3 mesi di preavviso. Recesso immediato per inadempimento o per obiettivi non raggiunti.

**P0 · Esclusiva su tutta l'Italia, senza obiettivi** (accordi.md:12–13)
- **Rilievo:** l'esclusiva copre tutta l'Italia, ma Cassa Facile ha 900 clienti, tutti in Emilia-Romagna, e 3 commerciali. Gli obiettivi minimi sono «nessuno». Turnio rinuncia a tutto il canale delle casse senza ottenere nulla in cambio.
- **Confronto:** il canale «fornitori della cassa» porta già 26 clienti l'anno a CAC 0 (imbuto.md). L'accordo ha senso solo se Cassa Facile supera quel numero.
- **Conflitto da verificare:** i 26 clienti vengono da rivenditori di cassa. Se ci sono rapporti con altri rivenditori, la clausola «non firma accordi con altri rivenditori» è già a rischio.
- **Modifica proposta:** esclusiva limitata all'Emilia-Romagna. Obiettivo minimo annuo (ipotesi di partenza: almeno 30 clienti, da fissare con i dati). Se non lo raggiunge per 2 trimestri, l'esclusiva decade. Elenco scritto degli altri rapporti con rivenditori di cassa, che restano fuori dall'esclusiva.

**P1 · Compenso calcolato su IVA compresa** (accordi.md:14)
- **Rilievo:** 25% sull'incassato IVA compresa equivale al 30,5% del ricavo netto (25% × 1,22). Con l'ARPU medio sono 16,01 € al mese, 192 € per cliente in 12 mesi.
- **Effetto sul margine:** il margine lordo scende dal 78% a circa 47,5% per quel cliente per un anno.
- **Confronto:** costa il doppio del CAC di Google Ads (95 €) e più dei 180 € previsti per Paghe Light. Non è «senza costo di acquisizione» come dice la Valutazione.
- **Modifica proposta:** 15% dell'importo effettivamente incassato, IVA esclusa, per 12 mesi, dopo l'incasso. Sono 7,88 € al mese, 94,5 € per cliente, in linea con Google Ads. La percentuale è una ipotesi da negoziare. Aggiungi la restituzione del compenso se c'è un rimborso o un mancato pagamento, e specifica se il compenso copre anche moduli e dipendenti oltre soglia.

**P1 · «Clienti riconosciuti»: ogni cliente dell'Emilia-Romagna, da qualunque canale** (accordi.md:15)
- **Rilievo:** Turnio è di Bologna. Il compenso scatta anche per i clienti diretti, per il referral e per quelli di Google Ads, senza che Cassa Facile faccia nulla. Questo contraddice «ogni cliente portato» della riga Compenso.
- **Esempio in pipeline:** Gruppo Portico compare due volte, D-03 diretta (4.039 €) e P-07 «partner Cassa Facile» (3.802 €). Il compenso potrebbe spettare in entrambi i casi, a seconda della sede.
- **Modifica proposta:** riconosci solo i clienti registrati da Cassa Facile prima della trattativa, con registrazione scritta e validità di 90 giorni. Escludi i clienti già esistenti e i rinnovi.
- **Dati mancanti:** quanti dei 412 clienti sono in Emilia-Romagna.

**P1 · API pubblica da gennaio 2027** (accordi.md:16)
- **Rilievo:** in roadmap l'API pubblica è nel Q3 2027 (10 settimane, squadra B, P2), cioè 6–9 mesi dopo l'impegno.
- **Capacità già superata:** nel Q1 la squadra B ha già 14 settimane su 13, per Esportazione presenze CSV (6) e Fatturazione annuale (8). La squadra A ne ha 20 su 13. Non c'è spazio per anticipare l'API senza togliere altro.
- **Stima non verificata:** le 10 settimane non comprendono l'integrazione con la cassa, il cui ambito non è definito.
- **Modifica proposta:** nessuna data fissa. Scrivi «accesso pilota entro il 30 settembre 2027, rilascio generale a seguire», e solo dopo un'analisi di fattibilità con ambito e stima. Se invece la data resta, serve una decisione dell'utente su cosa togliere dal Q1.

## 2 · Associazione Esercenti Riuniti

**P1 · Sconto del 40% per tutta la durata dell'abbonamento + compenso del 30% sul listino** (accordi.md:26–27)
- **Rilievo:** Turnio incassa il 60% del listino e ne versa il 30% all'associazione, quindi tiene il 30%. Con l'ARPU medio sono 15,75 € al mese contro 52,50 €.
- **Margine per socio** (assunzione: i costi di hosting, SMS e supporto sono per cliente e non scalano con lo sconto):
  - Costo 22% del listino = 11,55 €. Contributo = 15,75 − 11,55 = **4,20 € al mese**, contro 40,95 € di un cliente normale.
  - Se i costi scalassero col prezzo pagato, il contributo sarebbe 8,82 €. In ogni caso resta il 10–22% di un cliente normale.
- **Costo annuo per socio:** circa 441 €, cioè 189 € di compenso più 252 € di sconto. È molto più del CAC di qualunque canale in tabella.
- **Annuali:** con la regola «10 mesi pagati per 12», lo sconto si somma al compenso, che resta su 12 mesi pieni (30% × 12 = 3,6 mesi di listino) contro 6 mesi incassati. Restano 2,4 mesi di listino su 12, cioè il 20%.
- **Modifica proposta:**
  - Sconto non cumulabile con altre promozioni, sulle sole nuove sottoscrizioni, per 12 mesi.
  - Sconto non oltre il 20%, soglia che il commerciale può già decidere (previsione.md). Oltre serve l'approvazione scritta del CEO.
  - Compenso sul prezzo effettivamente incassato, IVA esclusa, dopo l'incasso.
  - Compenso a regime: ipotesi di partenza 10–15%.
  - Con sconto 15% e compenso 15% sull'incassato, Turnio tiene circa il 72% del listino (37,93 €) e il contributo sale a circa 26,4 € (stesse ipotesi di costo).

**P1 · Sconto perpetuo oltre la durata dell'accordo** (accordi.md:26 e 28)
- **Rilievo:** l'accordo dura 2 anni, ma lo sconto vale «per tutta la durata dell'abbonamento», quindi resta anche dopo la fine. Non è chiaro se il compenso del 30% continui o finisca con l'accordo.
- **Modifica proposta:** sconto e compenso valgono solo per 12 mesi dalla sottoscrizione, dentro il periodo dell'accordo.

**P1 · Ambito dei soci e dei prezzi non definito** (accordi.md:26–27)
- **Rilievo:** «ogni socio abbonato» include i clienti già paganti di Lombardia e Veneto. Questi chiederebbero lo sconto e il compenso scatterebbe su ricavi esistenti. Nessuna verifica di appartenenza all'associazione.
- **Altre ambiguità:** «prezzo di listino» non dice se includa moduli e dipendenti oltre soglia. Paghe Light (15 €, margine 70%) con sconto 40% e compenso 30% darebbe 9 € − 4,50 € di fornitore − 4,50 € di compenso = 0 € di margine.
- **Modifica proposta:** esclusi i clienti già paganti alla firma. Verifica di appartenenza con un elenco aggiornato dall'associazione. Moduli esclusi o definiti a parte.

**P2 · Nessun obiettivo, effetti sugli obiettivi 2027** (accordi.md:25)
- **Obiettivi non verificati:** per O3 (ARPU +10%) un sottoinsieme di soci scontati al 60% sposta la media verso il basso. Esempio illustrativo: 100 soci a 31,50 € portano l'ARPU da 52,50 € a (21.630 + 3.150) / 512 = 48,4 €, cioè −7,8%, prima del compenso.
- **Prezzo e abbandono:** il prezzo è il 22% dei motivi di abbandono, mentre il 41% è «i dipendenti non usano l'app»: lo sconto non agisce sul motivo principale.
- **Modifica proposta:** aggiungi un obiettivo minimo indicativo di iscrizioni e un report trimestrale con i dati.

## Errori nella sezione «Valutazione» (accordi.md:32)

1. «Senza costo di acquisizione» è falso: 192 € per cliente nel primo anno col testo attuale.
2. «900 locali» e «4.200 soci» sono i potenziali raggiungibili, non i clienti. Non c'è nessuna stima di adesione né dati sul sondaggio per questi segmenti.
3. «Sconto forte che rende l'offerta irrinunciabile» ignora il costo: lo sconto più il compenso lasciano a Turnio il 30% del listino.
4. Nessuna analisi del margine, degli scenari o dell'impatto sugli obiettivi O1–O3.

## Conflitti con gli altri canali e documenti

- **Pipeline:** Gruppo Portico è contato due volte (D-03 e P-07, 4 locali Plus), per 7.841 € totali, entrambe nella previsione Q1 (18.584 €). Va risolta come una sola opportunità con un solo canale, prima di assegnare il compenso.
- **Sconti:** D-06 ha il 35% di sconto senza l'approvazione scritta del CEO richiesta oltre il 20% (previsione.md). Lo sconto del 40% dell'associazione richiederebbe lo stesso passaggio.
- **Piano marketing 2027:** destina il 70% del budget del primo semestre a LinkedIn e non cita i canali partner, quindi non è allineato con i due accordi.
- **Da confermare:** non so se i prezzi ai soci coesistano con il referral («un mese gratis») e con l'annuale a 10 mesi.
- **Roadmap (fuori dall'ambito, da segnalare):** lo Scambio dei turni è in Q2 e dipende da «App dipendenti 2.0», che è in Q3. Il PRD dice che le notifiche push arrivano con l'App 2.0, ma R5 le richiede. Il piano di lancio parte il 1° febbraio 2027, in contrasto con lo sviluppo nel Q2.

## Privacy preliminare (da passare a Privacy & Compliance)

- L'associazione e Cassa Facile ricevono dati sugli abbonati per calcolare i compensi.
- L'integrazione con la cassa può trattare dati delle presenze dei dipendenti.
- Servono ruoli privacy e accordi (art. 28 o art. 26) prima della firma, da definire con il reparto privacy.

## Decisioni richieste all'utente

1. Se rinegoziare entrambi gli accordi con le modifiche sopra o rinviare la firma di dicembre.
2. Se accettare l'esclusiva su una zona più piccola e con obiettivi.
3. Il livello di compenso e di sconto accettabili.
4. La data dell'API: pilota nel Q3 oppure spostare altro dal Q1.
5. Dati da raccogliere prima di trattare: clienti in Emilia-Romagna, soci già clienti, rivenditori già in rapporto.

— AIBPD-10 · RASALHAGUE, Senior Business Development Manager, reparto AIBPD
