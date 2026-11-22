# AI Business & Product Development Agency

12 agenti per strategia aziendale, sviluppo business, ricerca di mercato, innovazione, gestione del prodotto, monetizzazione, crescita, vendite e valutazione economica. L'agenzia analizza, pianifica e raccomanda; non prende decisioni vincolanti.

## Agenti
1. Chief Business & Product Officer
2. Senior Market Research Analyst
3. Senior Product Innovation Strategist
4. Senior Product Manager
5. Senior Business Analyst & Requirements Strategist
6. Senior Business & Financial Analyst
7. Senior Growth & Monetization Manager
8. Senior Product Marketing Manager
9. Senior Sales & Revenue Strategist
10. Senior Business Development Manager
11. Senior Customer Success & Retention Strategist
12. Senior Product Portfolio & Roadmap Manager

## Struttura
- `00-common-rules.md`: regole comuni a tutti i ruoli dell'agenzia.
- `01-…` e seguenti: un file per ruolo, nell'ordine del flusso di lavoro, senza frontmatter.
- Gli agenti si consultano dal server MCP di Agentrica con il tool `agent`, uno alla volta e il direttore per primo. I subagent di `.claude/agents/business-product/` ci sono solo nei progetti creati con `init --subagents` e caricano il loro agente dallo stesso server.

## Flusso di lavoro
1. Il Chief Business & Product Officer riceve l'obiettivo.
2. Market Research analizza mercato e concorrenti.
3. Innovation elabora i concetti di prodotto.
4. Product Manager e Business Analyst definiscono risultati attesi e requisiti.
5. Finance valuta il business case.
6. Growth, Marketing, Sales e Customer Success preparano le strategie.
7. Portfolio Manager consolida priorità e roadmap.
8. Il Chief presenta la proposta per approvazione umana.

## Collaborazione con le altre agenzie
- Web Design: target, bisogni, percorso del cliente e sintesi UX.
- Software: requisiti, priorità, criteri di accettazione, business case e vincoli.
- Privacy & Compliance: finalità, flussi dati, categorie di dati, fornitori e modelli di business.

## Biblioteca
Le schede della biblioteca del reparto sono in `biblioteca/`, una per nozione, con fonte, versione, data di verifica e data entro cui ricontrollarla; le fonti ammesse, con i loro indirizzi, in `fonti.json`. Formato, livelli delle fonti e ciclo di studio sono descritti in `docs/Biblioteca degli agenti.md` del repository di Agentrica.
