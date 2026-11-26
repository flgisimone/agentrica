# Caso ondata 4 · cyber, privacy e software (F51)

- **Agenti nuovi**: AICA-08 Incident Response e AICA-12 Security Awareness su [`portale-ordini`](../progetti/portale-ordini/); AIPCA-03 Legal e AIPCA-09 Data Breach su [`scuola-lingue`](../progetti/scuola-lingue/); AISA-03 Functional Analyst e AISA-06 Full Stack su [`gestionale-magazzino`](../progetti/gestionale-magazzino/).
- **Agenti di nuovo**: AICA-06 e AISA-04 con gli stessi compiti e difetti di F37, sulle schede chiarite: [aica-portale-ordini](aica-portale-ordini.md) e [aisa-gestionale-magazzino](aisa-gestionale-magazzino.md).
- **Materiali**: solo file nuovi, in cartelle nuove (`incidente/` e `formazione/` nel portale, `legale/` e `violazione/` nella scuola, `richieste/` e `funzioni/resi/` nel gestionale). I file di F37 non cambiano, e i compiti di F37 non toccano le cartelle nuove: le schede della prima ondata restano valide.
- **Configurazioni**: Opus 5.5 effort medio e Sonnet 5.5, due esecuzioni ciascuna per gli otto ruoli; Haiku per AICA-12, due esecuzioni (decisione dell'apertura di F51). In tutto 34 esecuzioni.

## Compiti (argomento `task`, da copiare così come sono)

| Agente | Compito |
|---|---|
| AICA-08 | Rivedi in sola lettura la gestione dell'incidente del 21 novembre (`incidente/rapporto.md` e l'estratto `incidente/estratto-2026-11-21.log`), con il contesto del README e di `iam/roles.yaml`: riporta errori nella cronologia, nel perimetro, nel contenimento, nella conservazione delle prove, nella causa e negli obblighi, con il punto del rapporto, la riga del log e l'azione corretta. |
| AICA-12 | Rivedi in sola lettura le regole per il personale e il piano di formazione in `formazione/`, con il contesto dell'incidente in `incidente/rapporto.md`: riporta le regole sbagliate, superate o pericolose e i problemi del piano, con il numero della regola o la riga e il testo proposto. |
| AIPCA-03 | Rivedi in sola lettura l'informativa, la cookie policy e il banner in `legale/`, con il registro dei fornitori `docs/fornitori.md` e il README: riporta lacune e errori rispetto al GDPR e alla disciplina dei cookie, con il punto del documento, il riferimento normativo e il testo proposto, per la revisione legale. |
| AIPCA-09 | Valuta in sola lettura la gestione della violazione in `violazione/` (scheda dell'evento e registro): riporta errori di classificazione, di valutazione del rischio, di termini, di notifica e comunicazione, di conservazione delle prove e di registrazione, con il punto del documento, il riferimento normativo e l'azione corretta. |
| AISA-03 | Analizza in sola lettura la richiesta `richieste/resi.md` con il README e lo schema in `db/migrations/`: riporta ambiguità, contraddizioni, permessi e casi limite mancanti e criteri di accettazione non verificabili, con il requisito e la riformulazione proposta. |
| AISA-06 | Esegui una revisione read-only della funzione dei resi in `funzioni/resi/` (migrazione, rotte, pagina) da capo a fondo, rispetto alla richiesta `richieste/resi.md` e al resto del progetto: riporta i difetti con priorità, file e riga. Non correggere nulla. |

## AICA-08 · Incident Response

| # | Difetto | Dove |
|---|---|---|
| H1 | Cronologia sbagliata: i log sono in UTC, il rapporto in ora italiana. Il primo accesso dell'attaccante è alle 09:47 (08:47Z, dopo tre tentativi falliti dalle 09:40), non alle 10:12, che è il secondo accesso | «Cronologia»; log, righe 2–5 e 8 |
| H2 | Dati usciti: l'esportazione delle 09:58 (08:58Z) è partita da 203.0.113.77, l'indirizzo dell'attaccante, con 1.840 clienti e i dati dei referenti | «Analisi», «Dati»; log, riga 7 |
| H3 | Perimetro sottostimato: alle 10:20 (09:20Z) dallo stesso indirizzo entra anche l'account `r.galli` (auditor) ed elenca 212 utenti | «Account coinvolti»; log, righe 9–10 |
| H4 | L'attaccante non è fuori: alle 10:31 (09:31Z), dopo il cambio della password, legge ancora gli ordini dallo stesso indirizzo; le sessioni non sono state revocate | «Cronologia» 10:30; log, righe 12–13 |
| H5 | Prove distrutte: VM ricreata e archivio locale dei log cancellato senza una copia (immagine del disco, hash, catena di custodia); l'archivio è il secondo livello dei 90 giorni del README | «Cronologia» 10:40 |
| H6 | «Forza bruta» non sostenuta: tre tentativi in un minuto e poi l'accesso indicano credenziali note (phishing o riuso). La verifica in due passaggi manca per `operator` e `auditor` (`iam/roles.yaml`) e non è citata; il «promemoria sulle password» non basta | «Causa», «Azioni» |
| H7 | «Nessun dato personale»: nome, email e telefono dei referenti sono dati di persone fisiche. Servono la valutazione con la privacy e la notifica al Garante entro 72 ore (art. 33 GDPR), se ne ricorrono le condizioni | «Obblighi» |

## AICA-12 · Security Awareness

| # | Difetto | Dove |
|---|---|---|
| E1 | Cambio ogni 30 giorni e regole di composizione con 8 caratteri: è contro NIST SP 800-63B, che chiede lunghezza, controllo sulle password note e cambio solo se compromessa | regole 1–2 |
| E2 | Password degli account condivisi in un gruppo WhatsApp: credenziali condivise, nessuna responsabilità individuale | regola 3 |
| E3 | Verifica in due passaggi solo consigliata per operatori e revisori, cioè proprio i due account compromessi il 21 novembre | regola 5; `incidente/rapporto.md` |
| E4 | Solo SMS e app di autenticazione vietate: è al contrario, l'SMS è il metodo più debole (SIM swap) | regola 6 |
| E5 | «Il lucchetto garantisce che il sito è quello vero» è falso: anche i siti di phishing hanno HTTPS | regola 7 |
| E6 | Cambio dell'IBAN verificato rispondendo alla stessa email: va verificato con un altro canale (un numero già noto) | regola 9 |
| E7 | Segnalazione «entro la fine della giornata» e solo per email: va fatta subito, con un canale che funziona anche se l'email è compromessa | regola 10 |
| E8 | Chi clicca nelle simulazioni viene segnalato al responsabile e messo in bacheca, con l'obiettivo «zero clic»: scoraggia le segnalazioni; la misura utile è quante persone segnalano | regola 11; `piano-formazione.md` |
| E9 | Revisori esterni esclusi dalla formazione, ma hanno account sul portale (`r.galli` è stato usato nell'incidente) | `piano-formazione.md` |

## AIPCA-03 · Privacy Legal

| # | Difetto | Dove |
|---|---|---|
| L1 | Consenso come base per iscrizione, corsi e registrazioni, con il «senza consenso non ci si iscrive» e la casella obbligatoria del modulo: la base è il contratto (art. 6(1)(b)), e un consenso condizionato non è libero (art. 7(4)) | `informativa.md`, «Perché»; `banner.html` |
| L2 | «I dati restano nell'Unione europea» è falso: LessonCam (supporto dagli USA), Mailorbit e InsightAI sono negli USA; mancano i trasferimenti e le garanzie (art. 13(1)(f)) | `informativa.md`, «A chi»; `docs/fornitori.md` |
| L3 | Le note di salute (anche dei minori) non sono nominate, e manca la base dell'art. 9 | `informativa.md`, «Quali dati»; README |
| L4 | Conservazione «per il tempo necessario»: servono i periodi o i criteri (art. 13(2)(a)), per esempio 30 giorni per le registrazioni e dieci anni per le fatture | `informativa.md`, «Per quanto tempo» |
| L5 | Diritti incompleti: mancano limitazione, portabilità, opposizione al legittimo interesse, revoca del consenso e reclamo al Garante (art. 13(2)(b)–(d)) | `informativa.md`, «I tuoi diritti» |
| L6 | «Mai usati per finalità diverse» è falso: i termini di InsightAI le permettono di usare le registrazioni per migliorare i suoi modelli | `informativa.md`; `docs/fornitori.md`, note |
| L7 | Cookie che richiedono il consenso trattati come esenti: `ps_stats` con un identificativo in chiaro per 24 mesi (non è una statistica anonima) e `chatnow_id`, che fa un profilo del visitatore per il fornitore (art. 122 Codice privacy; linee guida del Garante del 10 giugno 2021) | `cookie-policy.md` |
| L8 | Banner con «continuando la navigazione accetti» e senza un «Rifiuta» di pari evidenza: lo scorrimento non è consenso (linee guida del Garante del 2021) | `banner.html` |
| L9 | Casella della newsletter già spuntata: un consenso pre-selezionato non è valido (art. 4(11), considerando 32) | `banner.html` |

## AIPCA-09 · Data Breach

| # | Difetto | Dove |
|---|---|---|
| B1 | Termine sbagliato: le 72 ore partono dal momento in cui si viene a conoscenza della violazione (18 novembre alle 09:00), non dalla fine dell'analisi; il termine era il 21 novembre, e una notifica tardiva va motivata (art. 33(1)) | «Decisioni», «Notifica al Garante» |
| B2 | «Nessuna violazione di riservatezza»: due scaricamenti da indirizzi esterni sono una perdita di riservatezza (art. 4(12)), anche senza modifiche | «Valutazione», «Tipo» |
| B3 | Rischio «basso perché in produzione i documenti sono cifrati»: la copia di staging era decifrata ed è quella scaricata | «Valutazione», «Rischio»; «Fatti» |
| B4 | La valutazione ignora la gravità: documenti d'identità (furto d'identità), dati di salute (art. 9) e minori; il rischio è elevato | «Valutazione» |
| B5 | Comunicazione agli interessati necessaria con un rischio elevato (art. 34), con cosa fare (per esempio, attenzione all'uso dei documenti) | «Decisioni» |
| B6 | Prove perse: i log di accesso si cancellano dopo 7 giorni e non ne è stata fatta una copia, pur essendo l'unica prova degli scaricamenti | «Fatti» |
| B7 | Registro incompleto: solo data e descrizione, mancano conseguenze e provvedimenti (art. 33(5)), anche per la violazione n. 1 | `registro.md` |
| B8 | Misure che non toccano la causa: lo script che copia in staging i documenti decifrati resta com'è; serve la minimizzazione dei dati di staging (art. 25, art. 32) | «Decisioni», «Misure» |

## AISA-03 · Functional Analyst

| # | Difetto | Dove |
|---|---|---|
| Q1 | «Entro pochi giorni dalla consegna» non è definito; l'ortofrutta è deperibile, e lo schema non ha una data di consegna (solo lo stato `shipped`) | R1; `002_orders.sql` |
| Q2 | Contraddizione sull'importo: R2 lo fa indicare al negozio, R5 lo calcola dal prezzo della riga | R2, R5 |
| Q3 | Approvazione non definita: «il reso viene accettato» non dice da chi né quando; nessuno stato «da approvare» o «rifiutato» | R3 |
| Q4 | Permessi: R4 fa correggere l'importo al magazzino, ma il README dice che i prezzi li cambia solo `admin`; manca chi può aprire un reso per conto di un negozio | R4; README |
| Q5 | La merce resa torna sempre in giacenza, anche rovinata: per la frutta rovinata (il caso principale) non deve tornare vendibile | R3; «Contesto» |
| Q6 | Fattura originale modificata: una fattura emessa non si cambia, si emette una nota di credito (art. 26 del DPR 633/1972) | R6 |
| Q7 | Casi limite mancanti: reso parziale di una riga, più resi sulla stessa riga oltre la quantità ordinata, ordini non spediti o annullati | R1, R2 |
| Q8 | Criteri di accettazione non verificabili («semplice e veloce», «gestiti correttamente», «nessun errore») | «Criteri di accettazione» |

## AISA-06 · Full Stack

| # | Difetto | Dove |
|---|---|---|
| J1 | Nessun controllo di proprietà nella `POST`: un negozio apre un reso su un ordine di un altro negozio (manca `customer_id = req.user.customer_id`) | `server/returns.js`, `POST /` |
| J2 | Contratto rotto fra pagina e server: il modulo manda `qty`, il server legge `quantity`. `Number(undefined)` è `NaN`, quindi ogni reso dà 400 e la funzione non funziona | `web/resi.html`, `#qty`; `server/returns.js` |
| J3 | Quantità accettata se intera, anche zero o negativa, e senza confronto con la quantità ordinata meno quella già resa (`item.quantity` letto e non usato): la giacenza si gonfia | `server/returns.js`, `POST /` |
| J4 | Importo preso dal client (`amount`), contro R5, che lo calcola da `unit_price × quantità` | `server/returns.js`, `POST /`; `web/resi.html` |
| J5 | Inserimento e giacenza fuori da una transazione, e la giacenza aggiornata con un valore assoluto letto prima (`stock = $1`): con due resi insieme se ne perde uno; serve `stock = stock + $1` nella stessa transazione | `server/returns.js`, `POST /` |
| J6 | Nessun controllo sullo stato e sulla data dell'ordine: resi su ordini `pending_payment` o `cancelled` e senza limite di tempo | `server/returns.js`, `POST /` |
| J7 | Migrazione debole: `order_item_id` senza chiave esterna, `amount` in `real` per un importo (gli altri usano `numeric`), `quantity` senza `CHECK > 0`, `status` senza `CHECK` | `db/005_returns.sql` |
| J8 | XSS memorizzato: la nota del negozio finisce in `innerHTML` nell'elenco, che vede anche il magazzino | `web/resi.js`, `loadReturns` |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta | Ruoli |
|---|---|---|---|
| T1 | Nel log la riga del SIEM (09:05Z) non è in ordine di tempo | fonti diverse nello stesso estratto; va solo ordinata | AICA-08 |
| T2 | Cambio della password di `m.verdi` fatto da `admin.ferri` dalla VPN (10.8.0.5) | azione legittima dalla rete prevista | AICA-08 |
| T3 | Accesso di M. Verdi da 192.0.2.14 alle 09:31 | accesso normale dall'ufficio | AICA-08 |
| T4 | Regole 4, 8, 12 e 13 (password sul monitor, allegati, blocco del computer, chiavette USB) | corrette | AICA-12 |
| T5 | Pagamenti e fatture con l'obbligo di legge come base | corretta (art. 6(1)(c)) | AIPCA-03 |
| T6 | Minori: sotto i 14 anni i genitori, dai 14 anni lo studente | coerente con l'art. 2-quinquies del Codice privacy | AIPCA-03 |
| T7 | `ps_session` e `ps_lang` senza consenso | cookie tecnici | AIPCA-03 |
| T8 | Contenitore tornato privato in due ore dalla segnalazione, ricercatore che scrive alla casella privacy | reazione rapida e canale corretto | AIPCA-09 |
| T9 | Notifica con la procedura telematica del Garante | canale corretto (il difetto è il termine) | AIPCA-09 |
| T10 | Violazione n. 1 nel registro e non notificata | 38 indirizzi email in chiaro: rischio improbabile, la registrazione basta (il difetto sono le colonne del registro) | AIPCA-09 |
| T11 | `GET /` dei resi filtrato per `customer_id` per i negozi | corretto | AISA-06 |
| T12 | `PATCH` con `requireRole("warehouse", "admin")` e query con parametri | corretti (il conflitto con i prezzi è dei requisiti, Q4) | AISA-06 |
| T13 | «Contesto» della richiesta (oggi per telefono e a mano) | descrive il problema, non è un requisito | AISA-03 |

Un rilievo che presenta una trappola come difetto conta come **falso**; un consiglio di irrobustimento su di essa no.

## Accettabili ma non richiesti

Non contano come falsi né come extra validi.

- **AICA-08**: incidente chiuso lo stesso giorno senza un periodo di osservazione né le lezioni apprese; nessuna ricerca dell'indirizzo 203.0.113.77 in altri log; account condivisi da controllare; nessun avviso ai clienti per il rischio di phishing mirato.
- **AICA-12**: corso solo annuale; firme come unica misura; nessuna regola sui dispositivi personali; nessun riferimento al gestore delle password.
- **AIPCA-03**: manca il contatto del DPO (se nominato); nessuna informativa per i minori in linguaggio semplice (art. 12(1)); nessuna data di revisione; la policy non elenca i cookie di terze parti dei video.
- **AIPCA-09**: nessuna valutazione del ruolo di Nimbus come responsabile; nessun contatto con il ricercatore per sapere cosa ha scaricato; nessuna verifica di altri contenitori pubblici; registro senza la decisione di non notificare la n. 1.
- **AISA-03**: rimborso del pagamento online non descritto; nessun requisito di notifica al negozio; nessun limite al numero di resi.
- **AISA-06**: nessun test; `note` senza limite di lunghezza; nessuna paginazione oltre 200; pagina senza stato di caricamento; il magazzino vede il modulo di apertura del reso.

## Regole di conteggio

Quelle del [README](../README.md#come-si-conta). Ogni esecuzione si conta solo sulla tabella del suo ruolo: un difetto di un altro ruolo trovato in più non è extra valido ma accettabile. Un riferimento normativo sbagliato (articolo inesistente o che dice altro) conta come falso, come nelle schede di F37.
