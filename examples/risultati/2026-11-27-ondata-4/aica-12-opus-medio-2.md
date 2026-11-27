AICA-12 · NUNKI — Senior Security Awareness Engineer, reparto AICA (AI Cybersecurity)

# Revisione delle regole per il personale e del piano di formazione (Ferramenta Nord)

Note sul contesto: AICA-01 · VEGA non è stato caricato perché in questa prova non c'è il server MCP. Questo rapporto è quindi la consegna che gli farei. La revisione è stata fatta in sola lettura e senza accesso al web, e non ho modificato nessun file. Ho letto i 13 file .md del progetto, poi `incidente/estratto-2026-11-21.log`, `app/auth.js`, `iam/roles.yaml` e `iam/access-review-2026-11.csv`. Ho consultato anche le schede `nist-csf-2` e `owasp-top-10-2025` con `npm run -s agent-text -- aica-12 --cards ...`.

## Da segnalare subito: P0, il rapporto d'incidente è sbagliato e l'incidente non è chiuso

L'estratto dei log è in UTC, il rapporto in ora italiana (UTC+1). Riallineando gli orari risulta questo:

- **L'attaccante ha fatto l'esportazione.** Alla riga 7 del log c'è `customers_export` alle 08:58:32Z, cioè le 09:58 italiane, dall'IP `203.0.113.77`. Non è l'IP dell'ufficio (`192.0.2.14`, riga 1). L'esportazione contiene 1840 righe con i campi `referente`, `email_referente` e `telefono_referente`.
  - Fatto: sono uscite dati personali di persone fisiche, i referenti dei clienti.
  - Errate quindi due affermazioni di `incidente/rapporto.md`: «nessun dato è uscito» (riga 20) e «non ci sono dati personali né obblighi di notifica» (riga 21).
  - Ipotesi: è un data breach da valutare ai sensi del GDPR. Il termine di 72 ore dalla scoperta (21/11, circa 10:05) sembra già scaduto. Serve subito la Privacy & Compliance Agency e il DPO o il legale.
- **L'accesso anomalo è iniziato prima.** Il primo accesso riuscito dell'attaccante è alle 08:47Z, cioè le 09:47 italiane (riga 5), non alle 10:12 indicate in tabella alla riga 12.
- **C'è un secondo account compromesso.** L'account `r.galli` (auditor) accede dallo stesso IP alle 09:20Z (riga 9) e legge l'elenco utenti, 212 righe (riga 10). Il rapporto dice «solo quello di M. Verdi» (riga 19), e non risulta che la password di r.galli sia stata reimpostata.
- **L'attaccante non era fuori dopo il reset.** Alle 09:31:40Z, dopo il reset delle 09:30:12Z, compare ancora `orders_list` dall'IP dell'attaccante (riga 13). Il reset della password non revoca le sessioni: il JWT dura 8 ore (`app/auth.js:19`) e non c'è un meccanismo di revoca.
- **Non risulta una forza bruta.** Ci sono solo 3 tentativi falliti in 51 secondi (righe 2-4), poi l'accesso riuscito. Ipotesi: la password era già nota all'attaccante, per phishing, riuso o una condivisione come quella della regola 3. Va indagato prima di scrivere la causa.
- **Le evidenze sono state distrutte.** Alle 10:40 è stato cancellato l'archivio locale dei log (`rapporto.md` riga 13). Il SIEM conserva gli eventi per 30 giorni, quindi la copia va esportata e preservata ora.
- **L'incidente è stato chiuso troppo presto.** Risulta chiuso il giorno stesso (riga 31) e l'unica azione prevista è un «promemoria sulle password robuste» (riga 27).

Raccomandazioni (decide il responsabile IT o il responsabile della risposta agli incidenti):
- riaprire l'incidente;
- reimpostare la password di `r.galli` e revocare tutte le sessioni;
- preservare l'export del SIEM;
- avviare la valutazione del breach con la privacy.

Affido questa parte a AICA-01 e all'Incident Response.

## Regole sbagliate, superate o pericolose (`formazione/regole-personale.md`)

Le regole 1, 2, 5 e 6 citano raccomandazioni NIST (SP 800-63B) che non sono nella biblioteca del reparto e che non ho potuto verificare sul web. Vanno ricontrollate sulla fonte prima della pubblicazione, perché i valori citati possono essere superati.

| Regola (riga) | Problema | Priorità | Testo proposto |
|---|---|---|---|
| 1 (r.7) | Superata. 8 caratteri con obblighi di composizione portano a password prevedibili (es. «Estate2026!»). Gli orientamenti NIST recenti puntano sulla lunghezza e sul confronto con le password compromesse, non sulla composizione. | P2 | «La password del portale è una frase lunga, almeno 15 caratteri, usata solo per il portale. Usa il gestore di password aziendale. Il portale rifiuta le password note da violazioni.» |
| 2 (r.8) | Superata. Il cambio ogni 30 giorni spinge a variazioni minime (es. «…1», «…2»). Inoltre lo storico delle 12 password non si vede nel codice: `resetPassword` in `app/auth.js:35-41` non lo controlla. | P2 | «Cambia la password solo se pensi che qualcuno la conosca, o se te lo chiede l'IT. Non riusare password di altri siti.» |
| 3 (r.9) | Pericolosa. Gli account condivisi con la password nel gruppo WhatsApp contraddicono `iam/README.md` regola 1 («Niente account condivisi, nemmeno per i turni»). Mettono le credenziali su un servizio esterno e su telefoni personali, e il fatto è coerente con l'ipotesi di password già nota. Nella revisione accessi c'è anche l'account condiviso `magazzino` (`access-review-2026-11.csv` riga 4). | P1 | Eliminare la regola. Sostituirla con: «Ogni persona ha il suo account. Non condividere mai password o codici, nemmeno con i colleghi di turno o in chat.» Prima azione: togliere le password dal gruppo e cambiarle subito. |
| 4 (r.10) | Corretta ma incompleta: non dice dove tenere la password. | P3 | «Non scrivere password su carta o in file e chat: usa il gestore di password aziendale.» |
| 5 (r.14) | Sbagliata. Contraddice `iam/README.md` regola 2 («MFA obbligatoria … per chiunque possa esportare»). Gli operatori hanno `customers:export` (`iam/roles.yaml:7`) con `mfa: false` (r.8), e i due account compromessi erano un operatore e un revisore. | P1 | «La verifica in due passaggi è obbligatoria per tutti gli account del personale e dei collaboratori esterni.» |
| 6 (r.15) | Sbagliata. Fa dell'SMS l'unico metodo, che è il più debole (SIM swap, codici inoltrati a chi telefona), e vieta le app di autenticazione. Da notare che `app/auth.js` (`login`, r.10-22) non implementa alcun secondo fattore. | P1 | «Il secondo passaggio si fa con l'app di autenticazione o la chiave di sicurezza fornita dall'azienda, anche su un dispositivo aziendale. L'SMS è solo una riserva. Non comunicare mai il codice a nessuno, neanche all'IT.» |
| 7 (r.19) | Pericolosa. Il lucchetto indica solo una connessione cifrata, e i siti di phishing lo hanno quasi tutti. | P1 | «Prima di inserire la password controlla che l'indirizzo sia esattamente `ordini.ferramentanord.example`. Apri il portale dal segnalibro, non dai link nelle email. Se il gestore di password non compila da solo i campi, fermati.» |
| 8 (r.20) | Incompleta. Gli attacchi arrivano anche da caselle conosciute ma compromesse. | P3 | «Non aprire allegati o link inattesi, anche da mittenti conosciuti. Nel dubbio verifica con il mittente per telefono e segnala.» |
| 9 (r.21) | Pericolosa. Rispondere alla stessa email conferma il cambio IBAN all'attaccante: è lo schema classico del BEC. | P1 | «Una richiesta di cambio IBAN si verifica telefonando al fornitore al numero già in anagrafica o nel contratto, mai a contatti presenti nell'email. Il cambio richiede l'approvazione di una seconda persona.» |
| 10 (r.25) | Sbagliata. «Entro la fine della giornata» è troppo tardi: nell'incidente l'attaccante ha esportato in 11 minuti. E l'email può essere il canale compromesso. | P1 | «Se pensi di aver cliccato un link sospetto, dato la password o un codice, o vedi un accesso che non hai fatto, avvisa subito l'IT: telefono [numero] o `it@ferramentanord.example`. Non cancellare email o file e non spegnere il computer. Chi segnala non viene mai sanzionato.» |
| 11 (r.26) | Punitiva. Segnalare chi clicca al suo responsabile scoraggia le segnalazioni, cioè proprio quello che serve. I dati delle simulazioni sono dati personali dei lavoratori: serve la privacy, e per l'uso nel rapporto di lavoro il legale. | P2 | «Le simulazioni di phishing servono a imparare: chi clicca riceve un breve approfondimento. I risultati si usano solo in forma aggregata.» |
| 12 (r.30) | Corretta. | P3 | Aggiungere: «Il blocco automatico scatta dopo 5 minuti di inattività.» (il valore va confermato dall'IT) |
| 13 (r.31) | Corretta. | — | — |

Altri problemi del documento:
- **Lacune nel contenuto (P2).** Mancano regole sulla gestione dei dati esportati: l'export clienti contiene dati personali e va conservato e cancellato secondo regole precise, mai inoltrato o caricato su servizi personali. Manca anche la segnalazione delle richieste di codici o delle notifiche MFA non richieste, e mancano le telefonate di finti tecnici (vishing).
- **L'intestazione non è vera (P2).** La riga 3 dice «dopo l'incidente», ma nessuna regola recepisce l'incidente, e le regole 3, 5 e 6 rendono più probabile il suo ripetersi.

## Problemi del piano (`formazione/piano-formazione.md`)

| Riga | Problema | Priorità | Testo proposto |
|---|---|---|---|
| 5 | Le firme raccolte misurano l'adempimento, non la comprensione. | P3 | «Lettura delle regole con firma e 5 domande di verifica · tutti, esterni inclusi · all'assunzione e a ogni nuova versione · % di firme e % di risposte corrette (aggregate)» |
| 6 | Un'ora l'anno a gennaio è troppo poco ed è lontana dai rischi reali. | P2 | «Moduli brevi (10-15 min) ogni trimestre: password e gestore, MFA, phishing, BEC e IBAN, dati esportati, segnalazione · tutti · più un modulo dopo ogni incidente · completamento e quiz (aggregati)» |
| 7 | Pubblicare in bacheca i nomi di chi clicca è punitivo, gogna pubblica. Crea un trattamento di dati personali dei lavoratori da valutare con la privacy e il legale. Inoltre la sola percentuale di clic non misura la reazione. Le simulazioni richiedono autorizzazione scritta e regole di ingaggio (regole comuni AICA). | P1 | «Simulazione di phishing · operatori, amministrazione, amministratori ed esterni con accesso · ogni trimestre, con autorizzazione scritta della direzione e regole di ingaggio · tasso di segnalazione, tempo medio di segnalazione, tasso di clic, solo aggregati per reparto e mai nominativi; chi clicca riceve un approfondimento.» |
| 9 | «Zero clic» è irrealistico e spinge a nascondere gli errori. | P2 | «Obiettivo 2027: almeno il 60% delle simulazioni segnalato entro 15 minuti, con tasso di clic in calo trimestre su trimestre.» (i valori sono da concordare con la direzione) |
| 11 | Escludere i revisori esterni lascia scoperti account con accesso ai dati: `r.galli`, revisore, è stato compromesso nell'incidente. | P1 | «I collaboratori esterni con un account (revisori, consulenti, fornitori) ricevono le regole e il modulo base all'attivazione dell'account, e accettano le regole nel contratto o nella lettera d'incarico.» |

Mancano poi questi elementi (P2):
- un percorso per gli amministratori e gli account privilegiati;
- un percorso per l'IT sulla risposta agli incidenti: preservare log ed evidenze (l'archivio è stato cancellato), revocare le sessioni, avvisare la privacy;
- un referente del piano e una revisione del piano dopo ogni incidente.

## Osservazioni fuori dal mio ruolo, da girare tramite AICA-01

Non le ho approfondite:
- **Accessi e permessi (IAM).**
  - `g.neri`, cessato il 2026-09-30, è ancora attivo come admin con ultimo accesso il 2026-11-12 (`access-review-2026-11.csv` riga 5). L'ipotesi è P1.
  - `c.ferri`, esterno con ruolo admin, non ha scadenza (riga 7), contro `iam/README.md` regola 4.
  - `customers:export` è assegnato agli operatori, contro la regola 3 di `iam/README.md`.
  - I nomi non tornano: `m.verdi` nel log e `l.verdi` nella revisione accessi; `r.galli` non compare nella revisione.
- **Codice, per AppSec e Software Agency.**
  - `login` non ha limiti di tentativi né blocco dell'account.
  - `requireAdmin` (`app/auth.js:55`) lascia passare qualunque ruolo diverso da `customer`.
  - Il token di reset non viene invalidato dopo l'uso e la sua scadenza non viene controllata (`app/auth.js:36-39`).

## Limiti

- Non ho verificato la configurazione reale né i sistemi in produzione.
- Non ho controllato le fonti NIST SP 800-63B sul web: i valori delle regole 1, 2 e 6 sono da ricontrollare.
- Le soglie proposte (15 caratteri, 5 minuti, 60%/15 minuti) sono da confermare.
- La qualifica di data breach e gli obblighi di notifica spettano a DPO e legale.
- Questa revisione non certifica la conformità delle regole né la sicurezza dell'organizzazione.

Domande aperte per l'utente:
1. Chi è il responsabile IT o della risposta agli incidenti a cui portare il P0?
2. L'azienda può fornire app di autenticazione, chiavi di sicurezza e un gestore di password?
3. Esiste un'autorizzazione scritta per le simulazioni di phishing?

— NUNKI (AICA-12)
