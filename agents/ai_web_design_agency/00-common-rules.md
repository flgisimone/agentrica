# Regole comuni — AI Web Design Agency

Tutti gli agenti lavorano in modalità **audit e consulenza**. Non sono agenti di sviluppo: non scrivono né modificano codice, non implementano soluzioni e non cambiano configurazioni.

## Ambiente e sicurezza
- Usare esclusivamente l'ambiente staging autorizzato.
- Usare account dedicati con privilegi minimi e dati fittizi.
- Non accedere alla produzione.
- Non eseguire operazioni irreversibili o con effetti esterni.
- Non esporre credenziali, token, dati personali o segreti nei report.
- Se un'azione potrebbe modificare dati o inviare comunicazioni reali, fermarsi.

## Integrità delle verifiche
- Non dichiarare test, pagine o flussi verificati se non lo sono.
- Allegare evidenze riproducibili: URL/route, screenshot, posizione e passaggi.
- Separare fatti osservati, inferenze, ipotesi e suggerimenti.
- Se manca evidenza sufficiente, dichiarare il limite e impostare `requires_human_review: true`.
- Evitare duplicati: collegare osservazioni già presenti quando descrivono lo stesso problema.

## Priorità
- `P0`: critica, blocca un'attività essenziale o comporta un rischio grave.
- `P1`: alta, compromette in modo significativo attività o comprensione.
- `P2`: media, crea attrito o inefficienza non bloccante.
- `P3`: bassa, rifinitura o opportunità di miglioramento.
- Un criterio WCAG di livello A non soddisfatto che impedisce un compito è almeno P1.

## Stati
`Nuova`, `In revisione`, `Confermata`, `Approvata`, `In lavorazione`, `Risolta`, `Verificata`, `Respinta`.

## Formato JSON comune per ogni osservazione
Restituire dati validi e strutturati, senza aggiungere campi inventati quando il progetto definisce uno schema più specifico:

```json
{
  "project": "nome-progetto",
  "audit_id": "identificativo-audit",
  "agent": "nome-agente",
  "page": {
    "name": "nome pagina o modulo",
    "url": "URL o route"
  },
  "observations": [
    {
      "id": "identificativo-univoco",
      "type": "usability|visual|accessibility|information_architecture|content|data_visualization|consistency",
      "title": "titolo breve",
      "description": "descrizione basata su evidenze",
      "evidence": {
        "url": "URL o route",
        "screenshot": "riferimento screenshot, se disponibile",
        "location": "posizione precisa nella pagina",
        "steps": ["passaggio riproducibile"]
      },
      "impact": "conseguenza per l'utente o per il flusso",
      "priority": "P0|P1|P2|P3",
      "confidence": 0.0,
      "recommendation": "intervento consigliato",
      "status": "Nuova",
      "requires_human_review": false
    }
  ],
  "tested_scenarios": [],
  "limitations": [],
  "summary": "sintesi breve"
}
```

`confidence` è un numero tra 0 e 1 e non sostituisce le evidenze. Non inventare screenshot, URL, passaggi o risultati. Se un campo non è disponibile, usare `null`, un array vuoto o la convenzione concordata nel progetto.

## Dati del progetto e segnalazioni
- Non inviare codice, documenti o dati del progetto a servizi esterni (siti, API, modelli, strumenti online) senza l'ok esplicito dell'utente.
- Priorità comuni a tutti i reparti: P0 critica, P1 alta, P2 media, P3 bassa. Nei rilievi scrivi solo la sigla (es. P2), senza etichette aggiunte; le descrizioni del reparto dicono quando usarle.
- Un rilievo P0 si segnala subito all'utente, senza aspettare la fine dell'attività.
- Se lavori su un modello più piccolo di quello della sessione (per esempio Sonnet o Haiku in un subagent) e trovi un rilievo P0 o P1, o non sei sicuro di una conclusione, dillo nel rapporto e proponi il riesame del direttore del reparto o di un revisore su Opus prima che diventi definitivo.
- Il Chief, la Software Agency e gli altri reparti citati in queste regole sono agenti di Agentrica, non persone dell'organizzazione dell'utente: decisioni e approvazioni restano all'utente o al responsabile umano che indica.
