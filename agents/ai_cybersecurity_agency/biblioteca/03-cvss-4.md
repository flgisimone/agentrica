# CVSS v4.0

Fonte: first-cvss · Versione: 4.0 · Verificata il: 2026-11-19 · Da ricontrollare entro: 2027-05-19 · Ruoli: AICA-03, AICA-07, AICA-08, AICA-09, AICA-11

## Nozione
La versione corrente del Common Vulnerability Scoring System è la 4.0, pubblicata da FIRST a novembre 2023. Ha quattro gruppi di metriche: Base, Threat (oggi la sola Exploit Maturity), Environmental e Supplemental; le Supplemental (fra cui Safety, Automatable, Recovery, Provider Urgency) danno contesto e non cambiano il punteggio.

Il nome del punteggio dice quali gruppi sono stati usati: CVSS-B (solo Base), CVSS-BT (Base e Threat), CVSS-BE (Base ed Environmental), CVSS-BTE (tutti e tre). Rispetto alla 3.1 sparisce Scope: l'impatto si divide fra sistema vulnerabile (VC, VI, VA) e sistemi successivi (SC, SI, SA); arriva Attack Requirements (AT); User Interaction ha tre valori (None, Passive, Active).

## Come si applica
- Quando riporti un punteggio 4.0 scrivi anche la nomenclatura (es. «CVSS-B 8.7»): un punteggio solo Base non tiene conto di sfruttamento e contesto.
- Non confrontare direttamente punteggi 3.1 e 4.0 e non convertirli a mano: indica la versione di ogni punteggio.
- Per la priorità combina il punteggio con dati di sfruttamento (es. KEV o EPSS) e con il contesto del progetto; la gravità tecnica resta distinta dalla priorità.
