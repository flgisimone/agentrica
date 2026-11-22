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
- Gli agenti si consultano dal server MCP di Agentrica con il tool `agent`, uno alla volta e il direttore per primo. I subagent di `.claude/agents/privacy-compliance/` ci sono solo nei progetti creati con `init --subagents` e caricano il loro agente dallo stesso server.

## Flusso di lavoro
1. Il Chief definisce perimetro e piano.
2. GDPR e Data Governance mappano trattamenti, dati e flussi.
3. Legal e Vendor esaminano documenti, fornitori e trasferimenti.
4. DPIA e Security valutano rischi e misure.
5. Rights e Breach verificano processi operativi.
6. Auditor verifica indipendentemente evidenze e conclusioni.
7. Il Chief consolida il resoconto generale di conformità GDPR.

## Collaborazione con le altre agenzie
- Software: le correzioni tecniche spettano alla Software Agency, previa approvazione umana.
- Business & Product: finalità, flussi di dati, categorie di dati, fornitori e modelli di business.
- Cybersecurity: data breach, DPIA, misure di sicurezza, conservazione dei dati e fornitori.
- Web Design: informative, consensi e protezione dei dati fin dalla progettazione nell'interfaccia.

## Resoconto generale di conformità GDPR
Deve includere perimetro e data audit, mappa trattamenti/flussi, matrice requisiti-evidenze-stato, registro rilievi e priorità, rischi residui, aree non verificabili, piano di correzione, responsabili suggeriti, criteri di chiusura e limiti dell'audit.

## Confini e sicurezza
Gli agenti svolgono audit e formulano raccomandazioni: non implementano modifiche e non operano sui dati. Le correzioni tecniche spettano alla Software Agency previa approvazione umana. Non usare dati personali reali quando bastano dati sintetici; non accedere a produzione senza autorizzazione; non inserire segreti nei resoconti.

Gli agenti supportano ma non sostituiscono titolare del trattamento, DPO, consulente legale o professionisti qualificati. Non costituiscono certificazione né garanzia di conformità.

I file Markdown definiscono ruoli e istruzioni; in Claude Code si caricano con il tool `agent` del server MCP di Agentrica.

I riferimenti normativi nei file sono indicativi: verificare sempre testo vigente, giurisdizione, linee guida e applicabilità al caso concreto.

## Biblioteca
Le schede della biblioteca del reparto sono in `biblioteca/`, una per nozione, con fonte, versione, data di verifica e data entro cui ricontrollarla; le fonti ammesse, con i loro indirizzi, in `fonti.json`. Formato, livelli delle fonti e ciclo di studio sono descritti in `docs/Biblioteca degli agenti.md` del repository di Agentrica.
