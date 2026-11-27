AIBPD-11 · KOCHAB — Senior Customer Success & Retention Strategist, reparto AIBPD (AI Business & Product Development)

**Rapporto di revisione in sola lettura: `clienti/fidelizzazione.md` e `clienti/coorti.csv`**

Esito: due metriche sono calcolate male (abbandono e NRR) e una è sbagliata nell'aritmetica (NPS). Il campione delle coorti è distorto e il campione dell'NPS è parziale. Il punteggio di salute e la definizione di attivazione non misurano il rischio principale, cioè i dipendenti che non usano l'app. Tutti i conti sono ricalcolati dai numeri del documento. Non ho modificato nessun file.

Controlli che quadrano:
- Clienti: 330 + 180 − 98 = 412.
- Nuovi nel CSV: la somma delle coorti è 180.
- Motivi di abbandono: le percentuali sommano 100%.

**1. P1, tasso di abbandono (fidelizzazione.md r.14)**
- Problema: 98 / 412 = 23,8% divide per i clienti a fine periodo. Quel denominatore include i 163 clienti nuovi ancora presenti, che non erano esposti al rischio per tutto l'anno. Il tasso è sottostimato.
- Conto corretto: i clienti dell'inizio periodo sono 330 e ne restano 249, quindi ne sono persi 81 (24,5%). Gli altri 17 dei 98 persi erano clienti nuovi.
  - Abbandono sulla base iniziale: 81 / 330 = 24,5%. È il dato confrontabile con NRR e GRR.
  - Abbandono di tutti i persi sulla base iniziale: 98 / 330 = 29,7%.
  - Abbandono sulla base media: 98 / 371 = 26,4%.
- Correzione proposta: riportare 24,5% come abbandono della base iniziale e dichiarare la formula. Mostrare a parte i 17 persi tra i nuovi, che indicano un problema di attivazione.
- Separare anche l'abbandono volontario (disdetta) da quello involontario (mancato pagamento). Oggi sono sommati e hanno rimedi diversi.

**2. P0, NRR (r.18-20)**
- Problema: 15.020 / 13.900 = 108% prende come base solo i 249 sopravvissuti. L'MRR dei 81 clienti persi non compare né al numeratore né al denominatore. Questo è il bias del sopravvissuto. La frase «la base cresce anche senza clienti nuovi» è falsa.
- Conto corretto: la base iniziale è 17.200 €. I persi valevano 17.200 − 13.900 = 3.300 €, cioè 40,7 € a cliente contro 55,8 € per i sopravvissuti.
  - NRR = 15.020 / 17.200 = 87,3%, quindi la base si è ridotta del 12,7%.
  - GRR = 13.900 / 17.200 = 80,8%, al massimo. Se qualche sopravvissuto ha fatto downgrade, la GRR è più bassa e va calcolata cliente per cliente.
  - L'espansione è 15.020 − 13.900 = 1.120 €.
- Correzione proposta: sostituire 108% con NRR 87% e GRR 81%. Togliere la conclusione sulla crescita senza clienti nuovi.

**3. P1, ritenzione a 6 mesi (r.26, `coorti.csv`)**
- Problema: «87% senza la coorte di marzo» esclude il dato peggiore con la motivazione «anomala (promozione di Pasqua)». La coorte da promozione è un canale di acquisizione reale. Escluderla nasconde il rischio.
- Ritenzione a 6 mesi per coorte:

| Coorte | Ritenzione |
|---|---|
| 2025-11 | 12/14 = 85,7% |
| 2025-12 | 10/11 = 90,9% |
| 2026-01 | 13/16 = 81,3% |
| 2026-02 | 13/15 = 86,7% |
| 2026-03 | 14/24 = 58,3% |
| 2026-04 | 16/18 = 88,9% |

- Conto corretto: sulle sei coorti la media semplice è 82,0% e il dato ponderato è 78/98 = 79,6%. L'87% si ottiene solo escludendo marzo (media semplice di cinque coorti, 86,7%).
- Anche a 3 mesi marzo è l'unica coorte con valori molto bassi: 17/24 = 70,8%.
- Correzione proposta: riportare 79,6% ponderato (o 82% semplice) e mostrare marzo a parte come «coorte da promozione: 58%». Se serve un dato pulito, dare entrambi con l'etichetta.
- Domanda aperta: la colonna «attivi» conta clienti ancora abbonati o clienti che usano il prodotto? Il file non lo dice. Con la seconda lettura la ritenzione e l'abbandono non sono confrontabili.

**4. P1, NPS (r.31)**
- Problema aritmetico: 52 promotori, 14 passivi, 8 detrattori su 74 risposte danno (52 − 8) / 74 = 59,5%, cioè NPS 59 o 60, non 61.
- Problema di campione:
  - Il sondaggio è inviato solo ai 268 clienti con più di sei mesi di abbonamento. Restano esclusi i clienti nuovi (la fase in cui si perde) e tutti quelli già usciti, quindi è un campione di sopravvissuti.
  - Il tasso di risposta è 74 / 268 = 27,6%, con rischio di autoselezione.
  - Non è detto chi risponde: titolare o dipendenti? Se i dipendenti non usano l'app (41% degli abbandoni), un NPS dei soli titolari non misura il rischio vero.
- Correzione proposta: correggere in NPS 59 (±) e dichiarare campione e tasso di risposta. Affiancare un indicatore dei clienti nuovi e uno per i dipendenti. Non usarlo come prova di salute della base.

**5. P2, motivi di abbandono (r.35-37)**
- Il questionario di uscita ha «98 risposte» su 98 persi: il 100% di risposta è improbabile, soprattutto per i casi di mancato pagamento. Va verificato come sono state raccolte le risposte (o se sono state compilate dal supporto).
- Le cause sono dichiarate dal cliente. Il 41% («i dipendenti non usano l'app») più il 22% di prezzo suggeriscono un problema di valore percepito, non di prezzo. Non è un dato incrociabile con il mancato pagamento, che non ha un proprio motivo.
- «In media il 22%»: se è la media semplice tra locali, un locale da 3 dipendenti pesa come uno da 30. Servono la media ponderata e la distribuzione.

**6. P1, punteggio di salute (r.41-48)**
- Il segnale più pesante (40%) è l'accesso del titolare o del responsabile al pannello. Non misura l'adozione dei dipendenti, che è la causa principale di abbandono (41%). Un locale con titolare attivo e dipendenti assenti risulta sano.
- Il segnale «ticket aperti, meno è meglio» (20%) premia i clienti silenziosi, che sono spesso quelli disimpegnati.
- Il pagamento puntuale pesa 10%, ma il mancato pagamento è già un abbandono: arriva troppo tardi per essere un segnale di rischio.
- I pesi e la soglia di 40 non sono validati: non c'è alcun confronto con gli abbandoni passati.
- Correzione proposta: aggiungere la quota di dipendenti attivi a settimana (come segnale principale), l'attività dei turni e l'adozione di funzioni chiave. Fare un backtest sui 98 clienti persi e tarare pesi e soglia su quello.

**7. P2, primo utilizzo e attivazione (r.52-53)**
- «Attivazione = account creato ed email confermata» è un passaggio tecnico, non il momento in cui il cliente ottiene valore. Il 97% (obiettivo 95%) dà una falsa sicurezza.
- La conclusione «il primo utilizzo funziona e non richiede interventi nel 2027» è contraddetta dai dati: 17 clienti nuovi persi nell'anno, la coorte di marzo al 58% a 6 mesi e 41% di abbandoni per dipendenti che non usano l'app.
- Correzione proposta: ridefinire l'attivazione come primo turno pubblicato e dipendenti invitati che accedono entro 14 giorni dall'iscrizione (soglie da validare con i dati). Riportarla per coorte.
- Togliere la frase che esclude interventi nel 2027.

**Nota normativa (scheda `funzione-di-recesso`)**
- Fonte: Codice del consumo, art. 54-bis, introdotto dal D.lgs. 209/2025, verificata il 2026-11-19. La scheda è da ricontrollare entro il 2027-05-19.
- La funzione di recesso online vale per i consumatori dal 19 giugno 2026, per i contratti conclusi dopo quella data. Per un prodotto B2B per locali può non applicarsi: serve la revisione legale umana.
- Se le azioni di fidelizzazione includono flussi di disdetta o di «salvataggio», non devono rendere il recesso più difficile della sottoscrizione.

**Domande aperte**
- Che cosa conta «attivi» nel CSV?
- Chi risponde all'NPS (titolari o dipendenti)?
- L'MRR dei persi comprende i casi di mancato pagamento?
- Qualcuno ha fatto downgrade tra i 249 sopravvissuti?

Priorità e correzioni sono proposte: servono la conferma dell'utente. L'analisi non sostituisce una consulenza finanziaria o legale.

— AIBPD-11 · KOCHAB
