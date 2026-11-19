# AI Privacy & Compliance Agency

10 agenti per audit e consulenza su GDPR, privacy e compliance del prodotto.

## Agenti
1. Chief Privacy & Compliance Officer
2. Senior GDPR & Data Protection Specialist
3. Senior Privacy Legal Specialist
4. Senior DPIA & Risk Assessment Specialist
5. Senior Privacy Security Engineer
6. Senior Data Governance & Retention Specialist
7. Senior Third-Party & Vendor Compliance Specialist
8. Senior Data Subject Rights Specialist
9. Senior Data Breach & Incident Response Specialist
10. Senior Privacy Compliance Auditor

## Struttura
- `00-common-rules.md`: regole comuni a tutti i ruoli dell'agenzia.
- `01-…` e seguenti: un file per ruolo, nell'ordine del flusso di lavoro, senza frontmatter.
- I subagent eseguibili (con frontmatter, strumenti e modello) sono in `.claude/agents/privacy-compliance/` e rimandano a questi file.

## Flusso di lavoro
1. Il Chief definisce perimetro e piano.
2. GDPR e Data Governance mappano trattamenti, dati e flussi.
3. Legal e Vendor esaminano documenti, fornitori e trasferimenti.
4. DPIA e Security valutano rischi e misure.
5. Rights e Breach verificano processi operativi.
6. Auditor verifica indipendentemente evidenze e conclusioni.
7. Il Chief consolida il GDPR Compliance Master Report.

## Collaborazione con le altre agenzie
- Software: le correzioni tecniche spettano alla Software Agency, previa approvazione umana.
- Business & Product: finalità, flussi di dati, categorie di dati, fornitori e modelli di business.
- Cybersecurity: breach, DPIA, misure di sicurezza, retention e fornitori.
- Web Design: informative, consensi e privacy by design nell'interfaccia.

## GDPR Compliance Master Report
Deve includere perimetro e data audit, mappa trattamenti/flussi, matrice requisiti-evidenze-stato, registro rilievi e priorità, rischi residui, aree non verificabili, piano di remediation, responsabili suggeriti, criteri di chiusura e limiti dell'audit.

## Confini e sicurezza
Gli agenti svolgono audit e formulano raccomandazioni: non implementano modifiche e non operano sui dati. Le correzioni tecniche spettano alla Software Agency previa approvazione umana. Non usare dati personali reali quando bastano dati sintetici; non accedere a produzione senza autorizzazione; non inserire segreti nei report.

Gli agenti supportano ma non sostituiscono titolare del trattamento, DPO, consulente legale o professionisti qualificati. Non costituiscono certificazione né garanzia di conformità.

I Markdown definiscono ruoli e istruzioni ma non creano da soli subagent eseguibili. Per Claude Code o altri strumenti occorre configurarli nel formato di agenti supportato.

I riferimenti normativi nei file sono indicativi: verificare sempre testo vigente, giurisdizione, linee guida e applicabilità al caso concreto.

## Biblioteca
Le schede della biblioteca del reparto sono in `biblioteca/`, una per nozione, con fonte, versione, data di verifica e data entro cui ricontrollarla; le fonti ammesse, con i loro indirizzi, in `fonti.json`. Formato, livelli delle fonti e ciclo di studio sono descritti in `docs/Biblioteca degli agenti.md` del repository di Agentrica.
