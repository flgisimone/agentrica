**AIPCA-07 · ALCOR — Senior Third-Party & Vendor Compliance Specialist, reparto AIPCA (AI Privacy & Compliance)**

Rapporto in sola lettura sul progetto «Parla Subito» (docs/fornitori.md, codice, configurazioni, script, public/index.html).

**Limiti**
- Direttore AIPCA-01 e biblioteca non disponibili in questa prova. Non ho letto le schede `decisioni-adeguatezza` e `ai-act-date`: adeguatezza, DPF e Singapore sono non verificati e vanno controllati sulle fonti ufficiali (elenco Commissione, elenco DPF).
- Non ho visto contratti, accordi art. 28, certificazioni né l'informativa. `public/privacy.html` e `src/vendors/mailorbit` non sono nella copia.
- Rilievi di supporto, non parere legale né dichiarazione di conformità.
- Lavoro su un modello più piccolo: per i P0 e P1 propongo il riesame del direttore AIPCA-01 o di un revisore su Opus prima che diventino definitivi.

## 1. Registro fornitori e matrice ruoli / luoghi / trasferimenti / garanzie
Il registro (`docs/fornitori.md`, aggiornato il 2026-10-15) elenca 5 fornitori. Nel codice ne compaiono altri 3 non registrati.

| Fornitore | Servizio e dati | Ruolo | Luogo | Art. 28 | Fuori SEE | Garanzie | Stato |
|---|---|---|---|---|---|---|---|
| Nimbus Hosting GmbH | Hosting, DB, storage; tutti i dati (anche prod copiati in staging) | responsabile | Francoforte | firmato 2025-01-10, testo non visto | no | n/a | parzialmente_conforme |
| PagaFacile S.p.A. | Pagamenti: nome, importo, email | titolare autonomo (dichiarato) | Italia | non necessario | no | n/a | non_verificabile |
| LessonCam Inc. | Videolezioni: voce e immagine, anche minori | responsabile | Dati a Dublino, supporto USA | firmato 2025-02-03 | sì (accesso remoto) | DPF e SCC modulo 2 (dichiarate) | parzialmente_conforme |
| Mailorbit LLC | Newsletter: email, nome (solo con consenso) | responsabile | USA | firmato 2024-06-01 | sì | «Privacy Shield» | non_conforme |
| InsightAI Inc. | Trascrizione di voce di minori e adulti | responsabile (dichiarato) | USA | in attesa | sì | nessuna | non_conforme |
| Coldvault Storage (non registrato) | Copia di backup di DB e storage | non definito | Singapore | nessuno | sì | nessuna | non_conforme |
| TextBlast (non registrato) | SMS: telefono e testo | non definito | non noto | nessuno | non noto | non note | non_verificabile |
| ChatNow (non registrato) | Widget chat sulla pagina di iscrizione | non definito | non noto | nessuno | non noto | non note | non_verificabile |
| Statistiche `stats.parlasubito.example` | Eventi con email come identificativo | interno (dichiarato) | «su Nimbus» | n/a | no | n/a | non_verificabile |

## 2. Rilievi

**ALCOR-01 · InsightAI: audio di minori inviato senza accordo, senza garanzie, con riuso per i modelli del fornitore. P0, gravità alta.** Stato non_conforme.
- Evidenze: `src/transcribe.js:8-12` invia l'audio in produzione; `docs/fornitori.md:11` accordo «in attesa», nessuna garanzia, sub-responsabili e certificazioni vuoti; `docs/fornitori.md:15` i termini standard consentono di usare i contenuti «per migliorare i propri modelli».
- Rischio: nessun contratto art. 28(3); trasferimento USA senza strumento e DPF non verificato (artt. 44-46); il riuso per i modelli proprî lo rende titolare per una finalità autonoma (art. 28(10)) senza base giuridica né informativa; dati di minori dagli 8 anni (art. 8) e la lezione può rivelare dati sulla salute.
- Lacune: non risultano base giuridica, informativa per questa finalità né DPIA.
- Raccomandazione: sospendere l'invio finché manca un accordo che escluda il riuso, indichi i sub-responsabili e preveda un trasferimento valido; verificare l'elenco DPF o prevedere SCC; valutare un fornitore nel SEE; il titolare decide la cancellazione di quanto già inviato.
- Responsabile suggerito: titolare, DPO e legale; sospensione tecnica dalla Software Agency previa approvazione umana.
- Verifica: contratto firmato, job disattivato finché manca l'accordo, evidenza di cancellazione dal fornitore.

**ALCOR-02 · Coldvault Singapore: copia fuori SEE non registrata, non cifrata, conservata 10 anni. P1 (possibile P0), gravità alta.** Stato non_conforme.
- Evidenze: `config/backup.yml:10` copia off-site a Singapore «costa meno»; `config/backup.yml:5` `encryption: none`; `config/backup.yml:13` `keep_monthly: 120`; Coldvault assente da `docs/fornitori.md`; `config/backup.yml:14` `last_restore_test: null`.
- Rischio: il backup contiene tutto (documenti d'identità e codici fiscali dei tutori, dati di minori, note di salute); nessun art. 28 visibile; adeguatezza di Singapore non verificata, servirebbero SCC e valutazione del trasferimento (artt. 44-46); mancata cifratura (art. 32); dieci anni di conservazione eccessivi (art. 5(1)(e), da passare alla governance dei dati).
- Raccomandazione: sospendere la copia o limitarla a dati cifrati con chiave del titolare; registrare il fornitore e verificare ruolo, contratto e strumento di trasferimento; in alternativa copia off-site nel SEE.
- Responsabile suggerito: DPO e responsabile sicurezza, poi Software Agency.
- Verifica: registro aggiornato, accordo e SCC firmati o copia spostata, prova di cifratura.

**ALCOR-03 · Mailorbit: garanzia indicata come «Privacy Shield». P1, gravità media.** Stato non_conforme.
- Evidenze: `docs/fornitori.md:10`; accordo del 2024-06-01 ma garanzia citata invalidata dalla Corte di giustizia (Schrems II, 2020); sub-responsabili rimandati a «elenco sul sito» senza meccanismo di autorizzazione (art. 28(2) e (4)); SOC 2 non copre la protezione dei dati personali.
- Rischio: email e nomi (`src/newsletter.js:13-14`) trasferiti senza strumento valido documentato.
- Lacune: contratto non visto, può esserci una SCC non annotata; DPF non verificato; `src/vendors/mailorbit` assente.
- Raccomandazione: verificare DPF o SCC nell'accordo, correggere il registro, definire come si notificano i nuovi sub-responsabili.
- Responsabile suggerito: segreteria con il legale.
- Verifica: copia dell'accordo e voce nell'elenco DPF con data di consultazione.

**ALCOR-04 · TextBlast e ChatNow non registrati. P1, gravità media.** Stato non_verificabile.
- Evidenze: `src/notifications.js:2-9` invio SMS con numero e testo, chiamato da `src/auth.js:28`; `public/index.html:26` script esterno `widget.chatnow.example` sulla pagina di iscrizione.
- Rischio: ruolo, sede e contratto ignoti; il widget carica codice terzo e può raccogliere dati dell'utente (IP, metadati) prima della compilazione del modulo, con tema consenso ePrivacy (art. 122 Codice privacy) da passare al Privacy Legal Specialist; il registro è incompleto.
- Raccomandazione: censire entrambi, definire ruolo, luogo e contratto, verificare l'informativa.
- Responsabile suggerito: segreteria e titolare.
- Verifica: righe nel registro con accordo e luogo.

**ALCOR-05 · LessonCam: ISO scaduta e di ambito limitato. P2, gravità media.** Stato parzialmente_conforme.
- Evidenze: `docs/fornitori.md:9` ISO 27001 scaduta il 2025-12-31 (oggi 2026-11-24), riferita agli uffici di Dublino e non al servizio; DPF e SCC modulo 2 dichiarate, iscrizione DPF non verificata; preavviso di 30 giorni sui sub-responsabili, da confermare con diritto di opposizione.
- Rischio: affidamento su una prova di sicurezza non valida (art. 28(1), art. 32) per voce e immagini di minori.
- Raccomandazione: chiedere certificato aggiornato con ambito sul servizio, verificare il DPF, annotare la procedura di opposizione.
- Responsabile suggerito: segreteria.
- Verifica: certificato con ambito e validità.

**ALCOR-06 · Nimbus, PagaFacile e statistiche: da completare. P3, gravità bassa.**
- Nimbus (`docs/fornitori.md:7`): l'ISO copre il data center, non il servizio gestito; «nessuno» come sub-responsabili da confermare nell'accordo. Lo staging riceve dati veri (`scripts/refresh-staging.sh:3-6`): tema di governance e sicurezza, segnalato ai ruoli pertinenti.
- PagaFacile (`docs/fornitori.md:8`, nota riga 16): ruolo di titolare autonomo plausibile ma da confermare dal contratto; PCI DSS da supportare con l'attestato; i pagatori sono tutori di minori, da riportare nell'informativa.
- Statistiche (`src/analytics.js:1-5`, `src/auth.js:11,27`): dichiarate interne su Nimbus ma inviano l'email come identificativo; non verificabile che il server sia davvero interno; passare al Data Governance.

## 3. Segnalazioni ad altri ruoli (non rilievi miei)
- `config/default.json:8` chiave di cifratura nel repository.
- `src/logger.js:14` con `config/default.json:5` log del corpo della richiesta in caso di errore (password, note di salute, dati di minori nei log).
- `src/export.js:9` esporta le note di salute di tutta la scuola.
- `src/auth.js:20` e `src/newsletter.js:13` consenso marketing e sync.

## 4. Consegna
Il registro aggiornato e la matrice sono la tabella in sezione 1. I tre fornitori non registrati vanno aggiunti a `docs/fornitori.md`, e il registro non deve più dichiararsi completo.

Passo successivo: portare ad AIPCA-01 ARCTURUS i rilievi ALCOR-01 e ALCOR-02 con richiesta di riesame su Opus.

— AIPCA-07 · ALCOR
