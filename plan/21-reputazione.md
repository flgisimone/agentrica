# F21 — Reputazione pubblica degli agenti

**Obiettivo**: rendere pubbliche, sul sito, le statistiche dei voti raccolti in F20: media, numero di voti e distribuzione nelle schede degli agenti, classifiche generali e per reparto, commenti pubblicati dopo moderazione.

> **Stato: da decidere.** Si apre solo dopo F20, quando la revisione a 4 settimane dalla 0.5.0 mostra voti sufficienti (soglia di 5 voti validi per agente in classifica). Parte pubblica della bozza «F20 — Community Ratings & Agent Reputation» dell'utente (2026-11-17).

**Agenzie**: business, design (dati e grafici, UX writing), privacy (pubblicazione di contenuti di terzi), cybersecurity, software.

## Dalla bozza dell'utente

- Classifica con media ponderata (es. bayesiana), così pochi voti non danno posizioni alte; almeno 5 valutazioni valide.
- Scheda agente: media, numero di voti, distribuzione delle stelle, commenti approvati, andamento nel tempo; statistiche distinte per versione.
- Commenti pubblici solo dopo approvazione, con segnalazione e rimozione; i voti negativi non si eliminano.
- Pagina «Community Reputation» e API pubbliche aggregate.

## Da decidere all'apertura

- Moderazione: chi, con quale strumento, in quanto tempo; serve un'area di amministrazione (l'area personale è stata eliminata in F16).
- Note legali e privacy per la pubblicazione dei commenti. Il consenso si raccoglie già in F20 (casella `publish_consent`, spenta di default): si pubblicano solo i commenti con il consenso.
- Come il sito, oggi pre-generato, legge le statistiche (rigenerazione periodica o route dinamiche).
- Voti gonfiati: con le medie pubbliche l'interesse a manipolarle cresce. Oltre al limite di F20 (un voto per agente per IP al giorno), valutare proof of work all'invio e segnalazione dei voti anomali (picchi, commenti duplicati), esclusi dalle medie senza cancellarli.
- Coerenza con «nessuna recensione inventata» (Decisioni, Trasparenza): solo voti reali, nessun seed.
