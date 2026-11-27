AIWDA-06 · ADHARA — Senior Design System Specialist, reparto AIWDA (AI Web Design)

# Rapporto: verifica del design system di Turnio (sola lettura)

**Esito.** Il sistema ha una base di token ragionevole, ma il codice lo aggira in più punti e la documentazione non lo descrive più. Ho trovato 16 rilievi: 2 P1, 9 P2, 5 P3.

**Cosa ho esaminato.**
- `css/tokens.css`, `css/app.css`, `docs/componenti.md`, le 4 pagine HTML e `js/app.js`.
- Una sola schermata: `schermate/turni-computer.png`. Le altre non le ho aperte; le affermazioni sul rendering delle altre pagine vengono dal codice.
- Non ho eseguito il sito né verificato hover, focus o altri stati nel browser.
- Come fonte normativa ho usato la scheda wcag-2-2 (WCAG 2.2, verificata il 2026-11-19).
- I rapporti di contrasto sono stime calcolate a mano dai valori esadecimali, da confermare con uno strumento.

## Inventario degli schemi osservati

| Schema | Definizione | Dove si usa |
|---|---|---|
| Pulsante `.btn` (+ `-primary`, `-secondary`, `-danger`) | `app.css` righe 26-30 | turni (righe 27-29), dipendenti (riga 50), impostazioni (righe 32, 36, 46-48, 54) |
| Pulsante `.button` (doppione) | `app.css` riga 33 | solo la finestra di scambio (`turni.html` riga 54) |
| `.icon-btn` | `app.css` riga 35 | turni (righe 21, 23, 37), dipendenti (righe 26-28) |
| `.card`, `.cards`, `.kpi-*`, `.muted` | `app.css` righe 38-42 | dashboard (`.banner` non è definita) |
| `.badge` (+ `-success`, `-warning`, `-danger`, `-orange`) | `app.css` righe 45-49 | solo `impostazioni.html` riga 42; nessun badge di presenza |
| `.dot` (+ `-ok`, `-late`, `-absent`) | `app.css` righe 54-57 | griglia dei turni, legenda della dashboard |
| Tabella | `app.css` righe 60-61 | dipendenti, impostazioni |
| `.field` (input, select, `.error`) | `app.css` righe 64-66 | dipendenti, impostazioni |
| `.modal` | `app.css` righe 69-72 | solo la finestra di scambio |
| `.toast` | `app.css` riga 74 | 3 pagine |
| `.nav` | `app.css` righe 17-19 | 4 pagine, con la voce attiva `aria-current` |
| Grafici SVG | colori in linea | dashboard, 4 grafici, nessuna classe condivisa |

## Rilievi

### P1

**DS-01 · Il focus visibile è rimosso e non sostituito (accessibilità)**
- Evidenza: `app.css` riga 14, `*:focus { outline: none; }`. Nessun `:focus-visible` in tutto il file. La documentazione promette lo stato «con il focus da tastiera» (`componenti.md` riga 9).
- Impatto: nessuna delle 4 pagine mostra la posizione della tastiera su pulsanti, link, campi e riassunti. Riguarda WCAG 2.2, 2.4.7 (livello AA). Il criterio è dedotto dal codice e non provato nel browser; il suo nome viene dalle mie conoscenze, perché la scheda elenca solo i criteri nuovi della 2.2.
- Correzione: eliminare la riga 14 e definire una regola unica `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`. Un solo intervento corregge tutte le pagine.

**DS-02 · I pulsanti distruttivi non rispettano le regole documentate**
- Evidenza: `turni.html` riga 28, «Elimina settimana» è `.btn-primary`. Con «Pubblica i turni» (riga 27) ci sono due azioni principali nella stessa vista. `componenti.md` riga 7 dice «una sola azione principale» e riserva `.btn-danger` alle azioni distruttive. La schermata `turni-computer.png` conferma i due pulsanti blu identici affiancati.
- Correzione: «Elimina settimana» deve usare `.btn-danger`, separata dalle azioni sicure e con conferma, come già fa `delete-store`. Il comportamento della conferma spetta a UX e usabilità.

### P2

**DS-03 · Il pulsante `.button` è un doppione non documentato**
- Evidenza: `app.css` riga 33. Raggio 20 px (nessun token), colore `#2f81f7` diverso da `--color-primary`, padding 10/18 contro 0/16, altezza non garantita a 40 px, nessuno stato hover. Uso: `turni.html` riga 54.
- Correzione: sostituire con `.btn btn-primary` e rimuovere la classe.

**DS-04 · Colori scritti a mano invece dei token**
- `app.css` riga 19: `#1f6feb` invece di `--color-primary`. Riga 27: idem. Riga 28: `#1a5fd0` per l'hover, senza token. Riga 30: `#cf222e` per `.btn-danger`; corrisponde al vecchio `--color-danger`, ora `#e5534b` (vedi DS-06). Riga 33: `#2f81f7`. Righe 12, 45, 74: `#fff` per `.skip-link`, `.badge`, `.btn-primary` e `.toast`; manca un token «testo su colore pieno».
- `index.html` righe 36, 40-46, 52-59, 62-69, 77-78, 85, 87: colori dei grafici e dei pallini della legenda in linea. Ci sono 8 tinte di azzurro, il rosso `#cf222e` e il verde `#1a7f37`, valori dei token copiati a mano.
- Correzione: usare i token. Aggiungere `--color-primary-hover`, `--color-on-fill` e una scala per i grafici (vedi DS-12).

**DS-05 · Valori fuori scala per spaziatura, raggi e tipografia**
- Spaziatura (scala 4/8/16/24): `gap: 22px` e `padding: 13px 24px` (riga 17), `gap: 13px` (38), margini `7px`, `22px` e `13px` (22-23), `padding: 7px` (53), `10px 18px` (33), `6px` (35), `2px 8px` (45), `12px 16px` (74), `bottom/right: 24px` (74). `main { padding: 24px }` (21) vale `--space-4` ma è scritto come valore fisso.
- Corpi dei caratteri: `15px` (18, 33), `17px` (23), `18px` (35, 40), `13px` (42), `14px` (53) a fronte dei token sm/md/lg/xl, che non hanno 13, 15, 17 né 18.
- Raggi: `20px` (33); `50%` per i pallini è giustificato.
- Correzione: portare i valori sulla scala esistente; se servono 12 o 32, aggiungerli come token.

**DS-06 · Token duplicati e in conflitto**
- Evidenza: `tokens.css` righe 12 e 31. `--color-danger` è definito due volte (`#cf222e`, poi `#e5534b`) e il secondo prevale. `.btn-danger` (`#cf222e`) e `.badge-danger` e `.dot-absent` (`#e5534b`) mostrano oggi due rossi diversi per lo stesso significato.
- Correzione: un solo valore per `--color-danger` nel primo blocco; se serve un rosso più chiaro, dargli un nome distinto. Unire il secondo blocco `:root` (righe 29-33) al primo.

**DS-07 · `--color-late` e `.badge-orange` sono un terzo colore di avviso**
- Evidenza: `tokens.css` riga 32 (`#e89b3a`) accanto a `--color-warning` (`#e8a33d`, riga 12): valori quasi uguali, stesso significato («in ritardo»). `.badge-orange` (`app.css` riga 49) non è in `componenti.md` e non è usata nelle pagine.
- Correzione: eliminare `--color-late` e `.badge-orange`; usare `--color-warning` per `.dot-late` (riga 56).

**DS-08 · Contrasto dei colori semantici (stima)**
- `--color-muted` `#9aa0a6` su `#fff` e `#f6f7f9`: circa 2,5:1. È usato per testi da 13-16 px: `.muted`, `.kpi-value`, la legenda, la voce «Azioni» (`dipendenti.html` riga 24).
- `.badge-warning` e `.badge-orange`: bianco su `#e8a33d` e `#e89b3a`, circa 2,2:1.
- `.badge-danger` (`#e5534b`) e `.button` (`#2f81f7`): bianco su questi colori, circa 3,7:1, con testi sotto i 18 px.
- `.badge-success` e `.btn-danger` (`#cf222e`) superano 4,5:1.
- Impatto: testi secondari e badge di avviso poco leggibili. Criterio coinvolto: WCAG 1.4.3 (AA). Misure da confermare con uno strumento.
- Correzione: scurire `--color-muted` (per esempio `#5f6368`) e usare testo scuro sul badge di avviso, oppure scurire il fondo.

**DS-09 · La documentazione descrive il sistema solo in parte**
- Mancano in `componenti.md`: `.icon-btn`, `.dot`, `.nav`, `.toast`, `.kpi-*`, `.muted`, la tabella, i grafici SVG, `.banner`. `.banner` è usata in `index.html` riga 22 ma non è definita nel CSS.
- La pagina dichiara «tutti i componenti supportano il tema scuro» (riga 3), ma nel codice non esiste: nessun `prefers-color-scheme` e nessuna variante dei token. Dice anche che «tutti i colori vengono dai token»: smentito da DS-04.
- Correzione: allineare il testo allo stato reale. Se il tema scuro non è previsto, togliere l'affermazione; se lo è, aggiungere i token.

**DS-10 · La finestra di scambio non rispetta la specifica**
- Evidenza: `turni.html` righe 48-56 e `js/app.js` righe 37-47. La specifica (`componenti.md` riga 27) richiede focus al primo elemento, restituito alla chiusura, chiusura con Esc. Il codice chiude con `✕`, uno `<span>` non raggiungibile da tastiera; mancano `role="dialog"`, `aria-modal`, gestione di Esc e del focus.
- Correzione: vale la specifica, quindi si allinea il codice. Meglio `<dialog>` con un `<button>` per chiudere. Dettagli di accessibilità ad AIWDA-08.

**DS-11 · I campi non hanno stati completi né etichetta visibile**
- Evidenza: `dipendenti.html` righe 35-48, 14 campi `.field` senza `<label>`, con il solo segnaposto. `componenti.md` righe 22-23 dice che l'etichetta è sempre visibile. `impostazioni.html` righe 24-25 mostra il modello corretto con `<label for>`.
- `.field .error` è definita (`app.css` riga 66), ma l'errore è un solo `<p class="error">` fuori da `.field` (`dipendenti.html` riga 49), quindi la regola non si applica. Il campo di ricerca (riga 20) non ha classe né etichetta. La select di `turni.html` riga 53 è dentro `<label>` ma non in `.field`. Mancano gli stati disattivato, errore sul campo e focus.
- Correzione: etichetta sempre visibile, `.field` con `.error` annidato e collegato con `aria-describedby`; ricerca ricondotta a `.field`.

### P3

**DS-12 · I grafici non hanno regole condivise.** `index.html` righe 35-90: colori in linea, font a 12 px senza famiglia, nessun token per asse o griglia. La torta usa 8 tinte dello stesso azzurro, difficili da distinguere (scala e dati: AIWDA-08). Definire token dei grafici (serie, asse, testo) e una classe del contenitore.

**DS-13 · Le azioni iconiche non hanno area o testo uniformi.** `app.css` riga 35: `.icon-btn` ha padding 6 px e corpo 18 px, circa 30 px di lato, sotto i 40 px di `.btn` e vicino al minimo di WCAG 2.2, 2.5.8 (24 px, AA). Le icone ◀ ▶ ⇄ ✎ 🗑 (`turni.html` righe 21, 23, 37; `dipendenti.html` righe 26-28) non hanno `aria-label`. Mancano hover e disattivato. Correzione: area di 40×40 px, `aria-label`, stati nel sistema.

**DS-14 · Il badge è usato in un solo posto e il pallino non ha testo.** `componenti.md` riga 14 dice che il badge ha sempre un testo; nei turni la presenza è un `.dot` colorato (`turni.html` righe 37-43) senza testo accessibile, con rosso e verde poco distinguibili per chi ha carenze nella visione dei colori. La legenda (riga 45) è grigia per tutti e tre i pallini. Correzione: `.badge` con testo (o `.dot` con testo nascosto) e legenda con i colori reali.

**DS-15 · `.toast` senza varianti e larghezze fisse.** `app.css` riga 74: un solo aspetto, e in `js/app.js` lo stesso testo «Fatto!» (righe 19, 46, 68) vale per successi diversi; l'errore usa `<p class="error">`. `.week` ha `width: 1100px` (riga 52) e `.modal-box` `width: 420px` (riga 71): su telefono escono dalla pagina (dedotto dal codice). Correzione: `.toast-success` e `.toast-error`, larghezze con `max-width` o contenitore scorrevole.

**DS-16 · Piccole incoerenze di struttura.** `<html lang="en">` in tutte le pagine con testi in italiano; menu con «Settings» e «Dashboard» in inglese accanto a «Squadra» e «Turni», e «Squadra» porta a una pagina intitolata «Personale» (UX Writing e architettura informativa); `<title>` identico («Turnio») ovunque. Non ho letto `docs/mappa.md` per confrontare l'ordine del menu.

## Ampiezza dell'impatto delle correzioni condivise

Le tre con più effetto: DS-01 (focus, 4 pagine), DS-06 con DS-07 (rosso e arancione unificati, tutti i badge e i pallini), DS-04 con DS-05 (token usati davvero, tutte le pagine). Seguono DS-03 e DS-02, localizzate nei turni, e DS-08 sui testi secondari e sui badge di avviso.

## Differenze documentazione e codice

| Documentazione | Codice |
|---|---|
| Tema scuro per tutti i componenti | Assente |
| Tutti i valori dai token | Molti valori fissi (DS-04, DS-05) |
| Pulsante con stato «focus» | Focus rimosso (DS-01) |
| `.btn-primary`: una sola azione principale | Due nei turni (DS-02) |
| Badge `-success/-warning/-danger` | Esiste anche `.badge-orange`, non documentata (DS-07) |
| Etichetta sempre visibile sui campi | Solo segnaposto in 14 campi (DS-11) |
| Errore sotto il campo, collegato | Un solo errore in fondo al modulo (DS-11) |
| Finestra con focus gestito ed Esc | Non implementato (DS-10) |
| Badge sempre con testo | Pallini senza testo nei turni (DS-14) |

## Limiti e domande aperte

- Il tema scuro è previsto? Il documento dice sì, il codice no.
- Contrasti stimati dal codice; stati hover, focus e disattivato non osservati nel browser. Ho visto una sola schermata.
- Alcuni rilievi toccano specialisti vicini: AIWDA-08 (grafici e accessibilità), AIWDA-09 (testi), AIWDA-07 (interfaccia). Da consolidare con il direttore AIWDA-01 per evitare doppioni. Non ho caricato AIWDA-01 perché non ho il tool `agent`: il rapporto va consegnato a lui.
- Ho lavorato su un modello più piccolo di quello della sessione. Per i due P1 (DS-01, DS-02) propongo il riesame del direttore AIWDA-01 o di un revisore su Opus prima che diventino definitivi.

Tutti i rilievi hanno stato `Nuova`. Priorità e correzioni sono proposte: decide l'utente.

— AIWDA-06 · ADHARA
