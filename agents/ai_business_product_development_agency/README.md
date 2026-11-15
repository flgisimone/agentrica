# AI Business & Product Development Agency

Pacchetto composto da 12 profili di agenti, e regole comuni.

## Struttura
- `00-common-rules.md`: regole comuni a tutti i ruoli dell'agenzia.
- `01-…` e seguenti: un file per ruolo, nell'ordine del flusso di lavoro, senza frontmatter.
- I subagent eseguibili (con frontmatter, strumenti e modello) sono in `.claude/agents/business-product/` e rimandano a questi file.

## Workflow suggerito
Chief Business & Product Officer riceve l’obiettivo; Market Research analizza mercato e concorrenti; Innovation elabora concept; Product Manager e Business Analyst definiscono outcome e requisiti; Finance valuta il business case; Growth, Marketing, Sales e Customer Success preparano le strategie; Portfolio Manager consolida priorità e roadmap; il Chief presenta la proposta per approvazione umana.

## Collaborazione con le altre agenzie
- Web Design: target, bisogni, journey e brief UX.
- Software: requisiti, priorità, acceptance criteria, business case e vincoli.
- Privacy & Compliance: finalità, flussi dati, categorie di dati, fornitori e modelli di business.

