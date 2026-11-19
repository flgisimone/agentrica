# Abbonamento settimanale «Orto in Box»

Versione 0.3 · bozza

## 1. Obiettivo

Lanciare l'abbonamento settimanale alla box di verdura di stagione per i clienti che oggi ordinano una box alla volta.

Metrica di successo: aumentare la retention dei clienti.

## 2. Perimetro

- Dentro: clienti con indirizzo di consegna a Milano, box piccola e grande, pagamento con carta.
- Fuori perimetro in questa versione: consegne fuori Milano, pagamento in contanti, box personalizzate.

## 3. Regole

- R1. L'abbonamento si rinnova ogni settimana e la carta viene addebitata il lunedì.
- R2. L'utente può sospendere l'abbonamento in qualsiasi momento.
- R3. Le sospensioni vanno richieste entro il giovedì per valere dalla consegna della settimana successiva.
- R4. Gli abbonamenti lunghi hanno uno sconto del 10%.
- R5. Le notifiche si inviano con Firebase Cloud Messaging.

## 4. User story

- **US-01** Come cliente voglio attivare l'abbonamento scegliendo la box, così ricevo la verdura ogni settimana senza ordinarla.
  - Dato un cliente con indirizzo a Milano e carta valida, quando sceglie la box grande e conferma, allora l'abbonamento risulta attivo, la prima consegna è indicata con la data e riceve un'email di conferma.
  - Dato un cliente con indirizzo fuori Milano, quando prova ad attivare l'abbonamento, allora vede che la consegna non è disponibile nella sua zona e l'abbonamento non viene creato.
- **US-02** Come cliente voglio sospendere l'abbonamento quando vado in vacanza, così non pago le settimane in cui non ci sono.
  - Dato un abbonamento attivo, quando il cliente sceglie le settimane di sospensione e conferma, allora in quelle settimane non riceve la box e non viene addebitato.
- **US-03** Come cliente voglio cambiare la dimensione della box, così la adatto alla famiglia.
  - Dato un abbonamento attivo, quando il cliente passa dalla box piccola alla grande prima del giovedì, allora dalla settimana successiva riceve la box grande al prezzo della grande.
- **US-04** Come cliente voglio disdire l'abbonamento, così smetto di ricevere le box.

## 5. Requisiti non funzionali

- NF1. Le pagine dell'abbonamento si caricano in meno di 2 secondi al 95° percentile su una connessione 4G.
- NF2. L'app deve essere veloce e facile da usare.
