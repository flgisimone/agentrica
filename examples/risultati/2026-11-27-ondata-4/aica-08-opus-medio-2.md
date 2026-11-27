«AICA-08 · ELNATH — Senior Incident Response & Forensics Specialist, reparto AICA (AI Cybersecurity)»

**Nota di metodo.** Questa era una prova senza server MCP, quindi non ho caricato AICA-01 · VEGA prima di cominciare: il rapporto va a lui per il consolidamento. Ho letto le schede `cvss-4` e `nist-csf-2` (FIRST CVSS 4.0 e NIST CSF 2.0, verificate il 2026-11-19, da ricontrollare entro il 2027-05-19) con `npm run -s agent-text`. Per un incidente non serve un punteggio CVSS: le priorità vengono dal contesto. Ho lavorato in sola lettura, senza modificare nulla. Gli orari del log sono in UTC; nel testo li converto in ora italiana (UTC+1), come fa il rapporto.

## Sintesi per la direzione
Il rapporto del 21/11 sbaglia quattro cose:
- **Cronologia:** l'accesso dell'attaccante inizia 25 minuti prima di quanto dichiarato.
- **Perimetro:** gli account compromessi sono due, non uno.
- **Dati:** i dati sono usciti. L'esportazione di 1.840 contatti di referenti (nome, email, telefono) l'ha fatta l'attaccante, non M. Verdi.
- **Contenimento:** l'attaccante ha continuato a lavorare anche dopo il reset della password.

In più, ricreare la VM e cancellare l'archivio locale ha distrutto le prove principali. La causa indicata (forza bruta) non è dimostrata.

Si tratta quasi certamente di una violazione di dati personali. Il termine di 72 ore (art. 33 GDPR) partiva dalle 10:05 del 21/11 ed è scaduto il 24/11 alle 10:05: oggi, 27/11, è già passato. L'incidente non è chiuso.

**Due rilievi P0 da segnalare subito all'utente:** F3/F4 (possibile compromissione ancora attiva) e F7 (obbligo di notifica scaduto).

## Perimetro e risorse esaminate
- `incidente/rapporto.md`
- `incidente/estratto-2026-11-21.log`
- `README.md`
- `iam/roles.yaml`
- per riscontro: `iam/README.md`, `iam/access-review-2026-11.csv`, `app/auth.js`, `app/server.js`, `app/orders.js`, `infra/nginx.conf`, `logging/vector.yaml`

Il lavoro è solo documentale: nessun accesso a sistemi, SIEM o provider.

## Cronologia ricostruita dal log (ora italiana)
| Ora | Riga log | Fatto |
|---|---|---|
| 09:31:04 | L1 | login_ok di m.verdi da 192.0.2.14 |
| 09:40:11–09:41:02 | L2–L4 | 3 login_failed di m.verdi da 203.0.113.77 |
| 09:47:15 | L5 | login_ok di m.verdi da 203.0.113.77: **primo accesso dell'attaccante** |
| 09:49:50 | L6 | orders_list, 500 righe |
| 09:58:32 | L7 | **customers_export, 1.840 righe** (ragione_sociale, referente, email_referente, telefono_referente, indirizzo, fido) da 203.0.113.77 |
| 10:05:00 | L11 | allarme SIEM export_volume (nel file la riga è fuori ordine) |
| 10:12:08 | L8 | secondo login_ok dell'attaccante come m.verdi |
| 10:20:44 | L9 | **login_ok di r.galli (auditor) da 203.0.113.77** |
| 10:21:30 | L10 | users_list, 212 righe |
| 10:30:12 | L12 | password_reset_admin di m.verdi, fatto da admin.ferri da 10.8.0.5 |
| 10:31:40 | L13 | **orders_list da 203.0.113.77 dopo il reset** |
| 10:40 | rapporto | VM ricreata, archivio locale dei log cancellato |

## Rilievi

**F1 — Cronologia: primo accesso anomalo sbagliato — P1**
- Rapporto, riga 11: «10:12 primo accesso anomalo». Il log dice altro: i tentativi falliti iniziano alle 09:40 (L2) e il primo accesso riuscito è delle 09:47 (L5). L'evento delle 10:12 (L8) è il secondo login. Probabilmente l'errore viene dalla conversione UTC/locale.
- Manca anche un dato utile: dall'allarme (10:05) alla prima azione (10:30) passano 25 minuti, e i tentativi falliti non hanno fatto scattare nessun allarme.
- Azione: rifare la cronologia con le prove in UTC, citando la sorgente di ogni evento. Aggiungere ai tempi di rilevamento e di risposta i login falliti, l'allarme e l'accesso di r.galli.

**F2 — Dati: l'esportazione è dell'attaccante — P1**
- Rapporto, riga 20: «l'esportazione delle 09:58 l'ha fatta M. Verdi dall'ufficio… nessun dato è uscito». Il log dice il contrario: L7 è delle 09:58:32 dall'IP 203.0.113.77, undici minuti dopo l'accesso dell'attaccante (L5). È uscita l'anagrafica clienti con i contatti personali dei referenti e i fidi.
- Inoltre l'attaccante non ha visto «solo l'elenco degli ordini»: ha visto anche gli ordini (L6, L13) e l'elenco dei 212 utenti del portale (L10).
- Azione: considerare esfiltrati 1.840 record clienti e 212 record utenti. Con le prove disponibili (log nginx e SIEM) verificare se ci sono state altre esportazioni o download da `/files/`.

**F3 — Perimetro: c'è un secondo account compromesso — P0**
- Rapporto, riga 19: «solo quello di M. Verdi». Il log dice altro: dallo stesso IP dell'attaccante risulta un login di r.galli (auditor, L9), seguito da users_list (L10). Il rapporto non prevede nessuna azione su questo account.
- L'account r.galli non compare nella revisione degli accessi di novembre: in `iam/access-review-2026-11.csv` l'auditor è `revisore.kpmx`. Anche `m.verdi` non c'è, compare `l.verdi` (righe 3 e 8). Va chiarito se sono account non censiti.
- L'impatto si aggrava per `app/auth.js:55`: `requireAdmin` lascia passare ogni ruolo diverso da `customer`. Quindi operator e auditor raggiungono `/api/admin/users/:id/role` e `/api/admin/export/customers` (`app/server.js:32-34`). L'attaccante poteva cambiare ruoli e restare dentro (persistenza).
- Azione, con il responsabile umano e senza perdere le prove:
  - sospendere r.galli e reimpostarne le credenziali;
  - controllare tutti i cambi di ruolo e gli account creati o modificati dalle 09:40 in poi;
  - cercare l'IP 203.0.113.77 e gli user-agent dell'attaccante su tutti gli account;
  - avvisare il referente dello studio di revisione.

**F4 — Contenimento: il reset non ha buttato fuori l'attaccante — P0**
- Rapporto, riga 12: «l'attaccante è fuori». Il log dice altro: alle 10:31:40 (L13) c'è un'altra orders_list da 203.0.113.77, dopo il reset (L12).
- La causa è nel codice:
  - i JWT sono senza stato e durano 8 ore (`app/auth.js:19`) e non si possono revocare, quindi la sessione aperta alle 10:12 restava valida fino alle 18:12 circa;
  - `resetPassword` (`auth.js:35-40`) non invalida né il token di reset né le sessioni.
- Ricreare la VM non revoca nulla, se `JWT_SECRET` è rimasto lo stesso.
- Azione:
  - ruotare `JWT_SECRET`, così tutte le sessioni vengono invalidate;
  - reimpostare le credenziali degli account coinvolti;
  - abilitare l'MFA su operator e auditor;
  - bloccare temporaneamente 203.0.113.77 al confine, sapendo che il blocco ha un valore limitato (vedi F6);
  - controllare nei log nginx che l'attaccante non abbia più accessi dopo il contenimento.

**F5 — Prove: distrutte prima di essere acquisite — P1**
- Rapporto, riga 13: VM ricreata e archivio locale cancellato «per ripartire puliti». Così sono andati persi il disco della VM (container, file caricati, eventuale persistenza) e l'archivio locale.
- Il danno è grave per come è configurata la raccolta dei log (`logging/vector.yaml`):
  - al SIEM arrivano solo i log dell'app di livello warn o superiore (`.level >= 40`, righe 18-21), e i login sono a livello info (`auth.js:15,18`);
  - l'archivio locale (righe 41-45) era quindi **l'unica copia dei log applicativi di autenticazione**.
- In più:
  - l'archivio ruota a 7 giorni contro un requisito di 90 (README, riga 26);
  - il SIEM tiene 30 giorni, per cui le copie nginx dell'incidente scadranno intorno al 21/12.
- Non è nota la provenienza dell'estratto. Il suo formato non coincide con il codice:
  - l'evento è `login_ok`, mentre il codice scrive `login_success` (`auth.js:18`);
  - il campo è `client_ip`, mentre il codice scrive `ip` con l'indirizzo del socket di nginx (`server.js:12`);
  - l'evento è `customers_export`, mentre il codice scrive `admin_export` a livello debug, che con il livello predefinito di pino non viene emesso (`orders.js:53`).
- Va quindi chiarito da dove viene l'estratto e se è integro.
- Azione:
  - esportare subito dal SIEM, con hash e catena di custodia, tutti gli eventi dal 14/11 al 22/11;
  - chiedere al provider se esistono snapshot o dischi della VM precedente e i log del bilanciatore e del flusso di rete;
  - registrare l'origine dell'estratto (chi, quando, da quale sorgente, hash);
  - in futuro, prima di ricreare qualcosa, fare uno snapshot del disco e un hash, e solo dopo ripristinare.

**F6 — IP dei log non attendibili — P1**
- `infra/nginx.conf:9-11` imposta `set_real_ip_from 0.0.0.0/0` con `real_ip_header X-Forwarded-For`. Il bilanciatore però non aggiunge intestazioni (README, riga 8), quindi qualunque client può scegliere l'IP che finisce nel log.
- Questo indebolisce sia l'attribuzione «dall'ufficio» (192.0.2.14) sia l'indirizzo dell'attaccante, e rende fragili i controlli basati sull'IP.
- Azione: nel rapporto trattare gli IP come ipotesi e incrociarli con i log del bilanciatore o del flusso di rete del provider. La correzione della configurazione passa alla Software Agency, con approvazione e rollback.

**F7 — Obblighi: la valutazione è sbagliata e il termine è scaduto — P0**
- Rapporto, riga 21: «i clienti sono aziende… niente dati personali né obblighi». Invece:
  - `referente`, `email_referente` e `telefono_referente` (L7) sono dati personali di persone fisiche;
  - lo sono anche i 212 utenti letti con users_list (L10);
  - anche le ditte individuali sono persone fisiche.
- Va valutata la notifica al Garante (art. 33 GDPR). Se dall'awareness (10:05 del 21/11) è scaduto il termine di 72 ore, la notifica va fatta ora, motivando il ritardo.
- Va valutata la comunicazione agli interessati (art. 34), dato il rischio di phishing mirato verso i referenti con dati veri di ordini e fidi.
- La violazione va annotata nel registro delle violazioni (art. 33.5).
- Vanno verificati gli obblighi contrattuali verso i clienti, per i fidi, e verso lo studio di revisione.
- Questa valutazione non è un parere legale. Azione: passare subito a Privacy & Compliance (breach response), al DPO o al legale; la decisione spetta all'utente o al responsabile incaricato.

**F8 — Causa: non dimostrata e incompleta — P1**
- Rapporto, riga 18: «forza bruta su una password debole». Il log non lo sostiene: ci sono 3 tentativi falliti in 51 secondi e poi un successo (L2-L5). È più compatibile con credenziali già note (phishing, riuso, credential stuffing) che con una forza bruta. Inoltre un secondo account cade allo stesso modo, dallo stesso IP, 33 minuti dopo (L9).
- Hanno contribuito, secondo le evidenze:
  - `login` non ha limiti di frequenza né blocco dell'account (`auth.js:10-22`);
  - operator e auditor sono senza MFA (`iam/roles.yaml:8,11`), contro la regola 2 di `iam/README.md`;
  - l'operator ha `customers:export` (`roles.yaml:7`), contro la regola 3, che lo riserva ad admin;
  - c'è il bypass di `requireAdmin` (`auth.js:55`).
- Azione: indicare la causa come ipotesi da verificare (vettore di furto delle credenziali, sentire M. Verdi e r.galli, controllare la posta) e affiancarle le cause di controllo.
- Le azioni previste (righe 25-27, «promemoria sulle password») non bastano. Servono: MFA per i ruoli che leggono o esportano dati, export riservato ad admin, correzione di `requireAdmin`, revoca delle sessioni al reset, rate limiting, invio dei login al SIEM e conservazione dei log a 90 giorni.

**F9 — Chiusura prematura — P1**
- Rapporto, riga 31: «incidente chiuso il 21 novembre», in un rapporto che dice di sé di essere «preliminare» (riga 3). Restano aperti perimetro, contenimento, prove e obblighi.
- Azione: riaprire l'incidente con un responsabile umano nominato e un registro delle azioni con orari. Chiudere solo dopo la verifica del contenimento, la decisione sulle notifiche e le lezioni apprese.

**F10 — Account e revisione degli accessi — P2** (contesto, non causa provata)
- Il reset è stato fatto da `admin.ferri` (L12). Nella revisione risulta `c.ferri`, consulente esterno admin con contratto annuale e senza scadenza (CSV, riga 7), contro la regola 4 (massimo 90 giorni). Va verificato se sono lo stesso account.
- Altre anomalie della revisione: l'account condiviso `magazzino` (riga 4, contro la regola 1) e `g.neri` ancora attivo da admin dopo la cessazione, con ultimo accesso il 12/11 (riga 5). Sono da escludere come vettori dell'incidente.

## Correzioni nel quadro NIST CSF 2.0
- **Respond:** contenimento reale (F3, F4), raccolta delle prove (F5), notifiche (F7).
- **Recover:** ripristino solo dopo aver acquisito le prove.
- **Detect:** login al SIEM, regole sui login falliti e sui login da nuovo IP.
- **Govern:** responsabile dell'incidente, rispetto delle regole IAM.

## Rischio residuo
L'attaccante potrebbe avere ancora accesso, tramite r.galli o eventuali cambi di ruolo. I dati sono esposti a uso per phishing. Il perimetro non si può ricostruire del tutto, perché le prove sono andate distrutte.

## Limiti
- Ho visto solo l'estratto, senza accesso a SIEM, provider o database. Non so se l'estratto è completo né da dove viene.
- Non ho verificato se `JWT_SECRET` è stato ruotato, se ci sono stati cambi di ruolo, né lo stato attuale di r.galli.
- I riferimenti GDPR sono generali e vanno confermati da Privacy e dal DPO.

## Domande aperte
1. Da quale sorgente viene l'estratto e chi l'ha prodotto?
2. Il provider conserva snapshot della VM o log del bilanciatore?
3. `r.galli` e `m.verdi` sono account censiti? Che rapporto c'è con `l.verdi`, `revisore.kpmx` e `admin.ferri`/`c.ferri`?
4. Chi è il responsabile umano dell'incidente e chi decide sulla notifica?

## Nuova verifica
Dopo le azioni:
- rilettura dei log nginx e SIEM per accessi da 203.0.113.77 o anomali dopo il contenimento;
- prova che un reset invalida le sessioni;
- revisione del rapporto corretto.

— ELNATH (AICA-08), per AICA-01 · VEGA
