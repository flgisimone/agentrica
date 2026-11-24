AIPCA-07 · ALCOR — Senior Third-Party & Vendor Compliance Specialist, reparto AIPCA (AI Privacy & Compliance)

Controllo in sola lettura, senza modificare nulla. Il direttore AIPCA-01 e il tool library non erano disponibili in questa prova. Le nozioni su adeguatezza e DPF vengono quindi dalla mia conoscenza e vanno verificate sulle fonti ufficiali (scheda `decisioni-adeguatezza`, al 2026-11-19). Per i rilievi P1 propongo il riesame del direttore o di un revisore su Opus prima che diventino definitivi: il mio modello è più piccolo di quello della sessione. Titolare: Parla Subito S.r.l.

Cartella di lavoro: <cartella di prova>/copie/aipca-07-sonnet-1 (i percorsi sotto sono relativi a questa).

## 1. Registro fornitori

Il registro dichiarato in `docs/fornitori.md` è incompleto. Mancano fornitori che dal codice risultano trattare dati personali.

| Fornitore | Servizio e dati | Ruolo | Luogo | Art. 28 | Fuori SEE | Garanzie | Sub-resp. | Certificazioni | Stato |
|---|---|---|---|---|---|---|---|---|---|
| Nimbus Hosting GmbH | server, Postgres, storage, staging, backup | responsabile | Francoforte (DE) | firmato 2025-01-10, contenuto non esaminato | no | n/a | «nessuno» (dichiarato, da verificare) | ISO 27001 fino al 2027-05, solo data center | parzialmente_conforme |
| PagaFacile S.p.A. | pagamenti: nome, importo, email | titolare autonomo (dichiarato) | IT | non necessario | no | n/a | n/a | PCI DSS 1 | non_verificabile (nessun codice di integrazione nel progetto) |
| LessonCam Inc. | videolezioni: voce e immagine, anche di minori | responsabile | USA, dati a Dublino | firmato 2025-02-03 | sì (supporto dagli USA) | DPF + SCC 2021/914 modulo 2 | elenco con preavviso 30 giorni | ISO 27001 scaduta il 2025-12-31, solo uffici di Dublino | parzialmente_conforme |
| Mailorbit LLC | newsletter: email, nome | responsabile | USA | firmato 2024-06-01 | sì | «Privacy Shield» | elenco solo sul sito del fornitore | SOC 2 Type II (2026) | non_conforme |
| InsightAI Inc. | trascrizione di voci di studenti, anche minori (`src/transcribe.js:8-12`) | responsabile (da accordo) | USA | in attesa | sì | nessuna | nessuno | nessuna | non_conforme |
| TextBlast (non in registro) | SMS: telefono e testo (`src/notifications.js:2,6-8`) | da definire | non noto | non noto | probabile | nessuna | nessuno | nessuna | non_verificabile |
| ChatNow (non in registro) | widget chat sul sito (`public/index.html:26`) | da definire | non noto | non noto | probabile | nessuna | nessuno | nessuna | non_verificabile |
| Coldvault Storage (non in registro) | copia di backup di database e storage (`config/backup.yml:10`) | responsabile (da definire) | Singapore | non noto | sì | nessuna | nessuno | nessuna | non_conforme |

### Matrice trasferimenti fuori SEE

| Fornitore | Luogo | Garanzia dichiarata | Esito |
|---|---|---|---|
| LessonCam | USA | DPF + SCC | Plausibile. Da verificare l'iscrizione DPF attuale e il suo ambito. |
| Mailorbit | USA | Privacy Shield | Non valida: invalidato nel 2020 (Schrems II). Servono DPF verificato o SCC. |
| InsightAI | USA | nessuna | Non valida. |
| Coldvault | Singapore | nessuna | Nessuna adeguatezza per mia conoscenza (da verificare sulla scheda). Servono SCC e valutazione del trasferimento. |
| TextBlast, ChatNow | non noto | nessuna | Non verificabile. |

## 2. Lacune e rilievi

**ALCOR-01 · P1 · InsightAI (non_conforme)**
- `src/transcribe.js:8-12` invia ogni registrazione audio a un fornitore USA. Sono dati di minori e voci identificabili.
- Accordo «in attesa» e nessuna garanzia di trasferimento, ma il flusso è già attivo.
- I termini di servizio consentono l'uso dei contenuti «per migliorare i propri modelli» (nota in `docs/fornitori.md`). È un uso per finalità proprie del fornitore, incompatibile con il ruolo di responsabile (art. 28(3)(a)). Servirebbe una base giuridica che non risulta.
- Riferimenti: GDPR artt. 28, 44-46, 5(1)(b), 12 e 8.
- Raccomandazione: sospendere il flusso fino a un accordo art. 28. L'accordo deve vietare l'uso per l'addestramento e fissare conservazione, sub-responsabili e SCC. Servono anche una DPIA e l'aggiornamento dell'informativa. Il possibile uso per finalità proprie va portato a DPO e legale.
- Responsabile suggerito: titolare con DPO. Verifica: accordo firmato e prova dell'esclusione dall'addestramento.

**ALCOR-02 · P1 · Mailorbit, Privacy Shield (non_conforme)**
- `docs/fornitori.md` (riga Mailorbit) cita come garanzia un meccanismo invalido dal 2020.
- I sub-responsabili sono solo elencati sul sito del fornitore, senza autorizzazione ex art. 28(2).
- `src/newsletter.js:13-14` invia email e nome degli iscritti. `src/vendors/mailorbit` non è presente nel progetto, quindi l'integrazione non è verificabile.
- Riferimenti: artt. 28(2), 44-46.
- Raccomandazione: richiedere il certificato DPF o aggiungere SCC 2021/914, e un elenco vincolante dei sub-responsabili.
- Verifica: documento di garanzia datato.

**ALCOR-03 · P1 · Coldvault, copia di backup a Singapore, fornitore non censito (non_conforme)**
- `config/backup.yml:10` copia database e storage di produzione su un fornitore non nel registro, senza accordo né garanzie. Dentro ci sono anagrafiche, documenti d'identità, note di salute (art. 9) e registrazioni di minori.
- `config/backup.yml:5`: cifratura `none`, con la motivazione «il bucket è privato».
- `config/backup.yml:13`: retention di 120 mesi. I backup mantengono i dati oltre le scadenze dichiarate (per esempio 30 giorni per le registrazioni). Il tema spetta al reparto retention, lo segnalo.
- Riferimenti: artt. 28, 32, 44-46, 5(1)(e).
- Raccomandazione: censire Coldvault. Servono art. 28, SCC, TIA (valutazione d'impatto del trasferimento) e cifratura lato client. In alternativa, eliminare la copia fuori SEE.
- Verifica: documentazione completa o rimozione della riga.

**ALCOR-04 · P1 · TextBlast (SMS) e ChatNow (widget), non censiti (non_verificabile)**
- `src/notifications.js:2,6-8`: telefono e testo a un'API esterna, senza evidenza di accordo, sede o ruolo.
- `public/index.html:26`: script terzo caricato sulla pagina di iscrizione prima di qualunque consenso. Riceve almeno IP e user agent. ChatNow non compare in nessun documento.
- Riferimenti: artt. 28, 13-14, 44-49, e art. 5(3) ePrivacy per il widget.
- Raccomandazione: censire entrambi, verificare ruolo, sede e accordo. Per ChatNow valutare il caricamento solo dopo consenso.
- Priorità P1 per l'assenza di qualsiasi evidenza, P2 se emergessero accordo e sede nello SEE.

**ALCOR-05 · P1 · Staging con dati veri (parzialmente_conforme)**
- `scripts/refresh-staging.sh:4-7` copia database e storage di produzione sullo staging, «così la segreteria prova con dati veri». Include documenti d'identità, note di salute e registrazioni di minori.
- Il registro non descrive gli accessi dello staging. `/tmp/prod.dump` non è protetto.
- Riferimenti: artt. 5(1)(c), 25, 32. Il tema è soprattutto di minimizzazione e sicurezza, da passare ai ruoli competenti.
- Raccomandazione: dati sintetici o anonimizzati in staging. Verifica: lo script non copia più dati reali.

**ALCOR-06 · P2 · Statistiche d'uso (non_verificabile)**
- `src/analytics.js:1-2`: il commento dice «interno su Nimbus», ma l'endpoint è `stats.parlasubito.example`, e il servizio non compare nel registro.
- `src/auth.js:11,27`: `userId` è l'email in chiaro.
- Raccomandazione: confermare dove gira l'endpoint, inserirlo nel registro, usare un identificativo pseudonimo.

**ALCOR-07 · P2 · LessonCam, certificazione scaduta (parzialmente_conforme)**
- ISO 27001 scaduta il 2025-12-31, e copre solo gli uffici di Dublino, non il servizio.
- Il supporto dagli USA è accesso remoto e conta come trasferimento. È coperto da DPF e SCC dichiarati, da verificare.
- Raccomandazione: chiedere il certificato rinnovato e l'ambito esatto, verificare l'iscrizione DPF sulla lista ufficiale.

**ALCOR-08 · P2 · Registro (parzialmente_conforme)**
- Il registro del 2026-10-15 non cita alcun fornitore trovato nel codice (ALCOR-03 e 04).
- Garanzie e certificazioni sono dichiarative. «Nessun sub-responsabile» per Nimbus va verificato sull'accordo.
- Raccomandazione: aggiungere «verificato da» e data, e rivedere il registro a ogni nuova integrazione.

**ALCOR-09 · P3 · PagaFacile (non_verificabile)**
- Nessun codice di integrazione nel progetto: il ruolo di titolare autonomo è dichiarato ma non verificabile. Va confermato sul contratto.

## 3. Limiti

- Non ho visto i contratti, quindi nessun controllo è `conforme_verificato`.
- Nel progetto mancano i moduli `db`, `storage` e `src/vendors/mailorbit`.
- Fuori ruolo, da girare ai colleghi: la chiave di cifratura dei documenti è in chiaro in `config/default.json` (riga 8, valore non riportato), per sicurezza.

— ALCOR
