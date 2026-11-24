# Regole sugli accessi

Approvate dalla direzione il 2026-03-02.

1. Ogni account è personale. Niente account condivisi, nemmeno per i turni.
2. MFA obbligatoria per `admin` e per chiunque possa esportare dati dei clienti.
3. Le esportazioni dei clienti (`customers:export`) sono solo per `admin`.
4. Account esterni (consulenti, revisori, fornitori): scadenza obbligatoria, al massimo 90 giorni, rinnovabile su richiesta del referente interno.
5. Alla cessazione di un dipendente l'account si disattiva lo stesso giorno (procedura HR → IT).
6. Account di emergenza `emergency-admin`: disattivato, credenziali in busta sigillata in cassaforte, MFA hardware; si attiva solo con due persone e si registra l'uso.
7. Account di servizio: solo i permessi del loro compito. La pipeline di deploy si autentica con OIDC, senza chiavi statiche.
8. Revisione degli accessi ogni trimestre (`access-review-*.csv`).
