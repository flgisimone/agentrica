# F16 — Area personale

**Obiettivo**: account per gli utenti di Agentrica con accesso sicuro (Google più secondo fattore) e un pannello del titolare con numeri aggregati. Lo scopo dell'area per gli utenti si decide all'apertura, con dati alla mano.

> **Stato: sospesa** (revisione del valore, 2026-11-15): senza uno scopo per gli utenti account e secondo fattore sono costo e rischio senza beneficio. Si riapre solo con la scelta di un MCP remoto o un altro obiettivo misurabile. Requisiti di accesso e monitoraggio decisi dall'utente il 2026-11-15.

**Agenzie**: business (Product Manager, Business Analyst) per scopo e criteri di successo; privacy (GDPR Specialist, Data Subject Rights, Vendor Compliance, Legal Specialist) prima del design; cybersecurity (IAM Engineer, AppSec, Cloud Security); design (UX Designer, UX Writer, Accessibility); software (Architect, Database Engineer, Fullstack, QA, Security, Code Reviewer).

## Situazione di partenza

- Nessun database né account: analytics in Postgres (F11) e `squad_copies` (F12) sono stati rinviati il 2026-11-15; i download npm si leggono con `npm run stats`. Con gli account serve anche il database.
- Vercel Hobby senza DPA (PRIV-PUB-01): con gli account il sito tratta dati personali, serve Vercel Pro.
- Analisi business di F12 ([12-squadre.md](12-squadre.md)): solo un MCP remoto con chiave personale richiede davvero un account; le altre idee (preferiti, squadre su più dispositivi) sono comodità.

## Requisiti decisi (2026-11-15)

- **Accesso (decisione dell'utente, 2026-11-15)**: Google (OpenID Connect) più secondo fattore TOTP obbligatorio con un'app authenticator, attivato inquadrando un QR code. Auth.js con il provider Google; il TOTP non è in Auth.js e si aggiunge sopra (RFC 6238, libreria da scegliere a versione esatta).
- **Attivazione del TOTP**: al primo accesso, prima di qualunque altra pagina dell'area; QR code dell'URI `otpauth://` generato sul server come SVG (mai un servizio esterno: la CSP resta `'self'`), con la chiave anche in testo per chi non può inquadrare; conferma con un primo codice valido.
- **Codici di recupero**: generati all'attivazione, mostrati una volta, conservati come hash; senza di essi un telefono perso blocca l'account.
- **Sicurezza del TOTP**: segreto cifrato nel DB (AES-GCM, chiave in una variabile d'ambiente solo server); tentativi limitati per account; un codice non si riusa nella stessa finestra; la sessione vale solo dopo il secondo fattore.
- **Dati minimi**: da Google solo lo scope `openid` (l'identificativo `sub`); email solo se serve. Google è titolare autonomo del proprio accesso.
- **Pannello admin (decisione dell'utente, 2026-11-15)**: `/admin` per il titolare, con lo stesso accesso Google + TOTP e un ruolo admin legato al suo `sub` (variabile d'ambiente solo server). Solo dati aggregati: account registrati, accessi al giorno, secondo fattore attivo, pagine viste (F11), agenti più scelti nelle squadre (F12), download npm settimanali (API pubblica di npm). Nessun elenco di persone né attività del singolo. Uso reale degli agenti solo se un giorno ci sarà un MCP remoto; niente telemetria nell'MCP. Fino ad allora i numeri si leggono da terminale.
- **Resto**: `DELETE /api/account` (account, segreto e codici in un passo), sessioni in Postgres con cookie tecnico, revisioni privacy e cybersecurity (IAM Engineer per il flusso MFA), Vercel Pro per il DPA, progetto Google Cloud e schermata di consenso OAuth creati dall'utente.

## Proposte da confermare all'apertura

- **Scopo per gli utenti**: squadre salvate nell'account, MCP remoto con chiave personale, o altro; con l'obiettivo misurabile che giustifica l'account.
- **Piano Vercel**: passaggio a Pro prima del rilascio.

## Backlog

Da scrivere dopo la scelta dello scopo. Fissi: accesso Google + TOTP con codici di recupero, `DELETE /api/account`, pannello `/admin` aggregato, informativa aggiornata, revisioni privacy e cybersecurity.

## Criteri di accettazione

Da scrivere dopo la scelta dello scopo.
