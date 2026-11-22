# Caso AIBPD-05 · ALGIEBA su requisiti-abbonamenti

- **Agente**: AIBPD-05 · ALGIEBA, Senior Business Analyst & Requirements Strategist (`aibpd-05`)
- **Progetto**: [`progetti/requisiti-abbonamenti`](../progetti/requisiti-abbonamenti/), bozza di requisiti di un abbonamento settimanale, solo testo
- **Perché**: un ruolo di analisi senza codice, candidato a Sonnet; i difetti sono di contenuto (ambiguità, contraddizioni, lacune) e ci sono parti scritte bene da non toccare.
- **Compito** (argomento `task`, da copiare così com'è):

  > Analizza i requisiti in requisiti.md e riporta ambiguità, contraddizioni, lacune e criteri non verificabili, con il punto del documento e una proposta di riformulazione.

## Difetti attesi

| # | Difetto | Dove |
|---|---|---|
| B1 | Metrica di successo non misurabile: «aumentare la retention» senza definizione, valore di partenza, obiettivo né orizzonte | §1 |
| B2 | Contraddizione: R2 «sospendere in qualsiasi momento» contro R3 «entro il giovedì per la settimana successiva» | §3, R2 e R3 |
| B3 | «Abbonamenti lunghi» non definito: durata minima, se lo sconto vale dall'inizio, se si perde con una sospensione | §3, R4 |
| B4 | R5 è una scelta di soluzione (Firebase) presentata come requisito, senza il bisogno: quali notifiche, a chi, quando | §3, R5 |
| B5 | US-04 (disdetta) senza criteri di accettazione; mancano preavviso, settimana già addebitata, conferma | §4, US-04 |
| B6 | Nessun requisito sul pagamento non riuscito il lunedì (nuovi tentativi, sospensione, avviso al cliente) | §3, R1 |
| B7 | NF2 «veloce e facile da usare» non verificabile; «veloce» è già coperto da NF1 | §5, NF2 |

## Trappole: parti corrette da non segnalare come difetto

| # | Cosa | Perché è corretta |
|---|---|---|
| T1 | US-01 | criteri Dato/Quando/Allora completi, con il caso fuori zona |
| T2 | NF1 | misurabile: soglia, percentile e condizione di rete |
| T3 | Fuori perimetro (§2) | consegne fuori Milano, contanti e box personalizzate sono esclusi apposta: non sono lacune |

Un rilievo che dice che T1–T3 sono sbagliati, incoerenti o non verificabili conta come **falso**. Un affinamento su di essi non è falso: casi in più per US-01 (carta rifiutata, box piccola), le pagine o lo strumento con cui si misura NF1, una domanda aperta. Nel confronto del 2026-11-19 il valutatore li contava come falsi (2 per esecuzione in tutte le configurazioni, Opus compreso): i conteggi restano quelli, con questa nota.

Accettabili ma non richiesti: chi sono gli stakeholder (magazzino, corrieri), prezzo delle box non indicato, US-02 senza limite di settimane sospendibili, US-03 senza il caso dopo il giovedì, privacy e dati di pagamento, accessibilità.
