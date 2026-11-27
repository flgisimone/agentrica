**AIWDA-05 · MIMOSA — Senior UI Designer, reparto AIWDA (AI Web Design)**

Revisione in sola lettura di index.html, turni.html, dipendenti.html, impostazioni.html, css/app.css e css/tokens.css, con le quattro schermate *-telefono.png (progetto: .../scratchpad/copie/aiwda-05-2). Non ho modificato file né aperto un browser. Non ho caricato AIWDA-01 né le schede della biblioteca: non cito WCAG con fonte e versione.

**Esito.** 4 rilievi P1, 6 P2, 4 P3. I numeri di contrasto sono stime mie dai valori esadecimali, non misure. Le schermate sono solo a telefono (circa 390 px) e a computer. Le correzioni sono indicazioni per chi sviluppa, non patch.

### P1

**R01 · Griglia turni inutilizzabile su telefono (visual, P1, confidenza 0.95)**
- Evidenza: css/app.css:52 `.week { width: 1100px; grid-template-columns: 160px repeat(7, 1fr) }`, nessun contenitore con scorrimento. In schermate/turni-telefono.png l'immagine è larga 1126 px contro i circa 390 del menu: scorre tutta la pagina in orizzontale, menu e main non coprono la larghezza.
- Impatto: vedere il turno di un collega richiede lo scorrimento dell'intera pagina.
- Correzione: avvolgere `.week` in un div con `overflow-x: auto`, `min-width` ragionevole al posto della larghezza fissa, prima colonna `position: sticky; left: 0` con sfondo; oppure sotto 600 px una vista per giorno.

**R02 · Tabella personale più larga del viewport (visual, P1, confidenza 0.9)**
- Evidenza: dipendenti-telefono.png: tabella a 426 px oltre i 390. «Ore nel mese» va a capo su 3 righe, i nomi su 2, le icone azione si impilano (app.css:61 padding di th/td).
- Correzione: contenitore `overflow-x: auto` oppure sotto 600 px righe a scheda con azioni in fondo.

**R03 · Contrasto basso di testi e badge (accessibility, P1, confidenza 0.8)**
- Evidenza: `--color-muted: #9aa0a6` (tokens.css:6) su #f6f7f9/#fff è circa 2,4–2,6:1; usato da `.muted` (app.css:42: sottotitoli, legenda, ruolo nella griglia, caption) e da `.kpi-value` (app.css:41), il numero principale delle schede. `.badge-warning` bianco su #e8a33d (tokens.css:11) e `.badge-orange` su #e89b3a (tokens.css:32) circa 2,2:1 (badge «3» in impostazioni-telefono.png). `.button` (app.css:33) bianco su #2f81f7 circa 3,9:1. `--color-danger` ridefinito a #e5534b (tokens.css:31, vince su :12): bianco circa 3,7:1; `.btn-danger` usa #cf222e scritto a mano (app.css:30).
- Correzione: muted verso #59636e o più scuro (almeno 4,5:1); testo scuro sui badge ambra o ambra più scuro; eliminare il secondo `:root` che ridefinisce il rosso.

**R04 · Focus visibile rimosso (accessibility, P1, confidenza 0.9)**
- Evidenza: app.css:14 `*:focus { outline: none; }`, nessun `:focus-visible` sostitutivo.
- Impatto: da tastiera non si vede dove si è su menu, pulsanti, campi, summary.
- Correzione: togliere la regola e definire `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }`. Livello AA, quindi probabilmente P1: da confermare con lo specialista accessibilità.

### P2

**R05 · SVG a larghezza fissa (visual, P2, 0.85).** index.html:35,51,74,84 hanno width 560/260 senza `max-width: 100%; height: auto`; a 390 px sono tagliati. Correzione: `svg { max-width: 100%; height: auto }`.

**R06 · Asse troncato nel grafico a barre (data_visualization, P2, 0.9).** index.html:34–46: asse da 60 a 70, sab (70) sembra 5 volte lun (62). Correzione: asse da zero o grafico a punti/linea.

**R07 · Torta con 8 sfumature di un solo blu (data_visualization, P2, 0.85).** index.html:51–70: Pizzeria, Responsabili, Pulizie, Extra quasi indistinguibili, #ddf4ff quasi sparisce su #f6f7f9; valori solo in legenda, che è una `ul` con puntini (nessuna regola `.legend`). Correzione: barre orizzontali ordinate con valore, o 4–5 categorie più «Altro».

**R08 · Due assi con scale diverse (data_visualization, P2, 0.9).** index.html:73–81: costo (0–8.000 €) e incassi (20.000–26.000 €) su assi separati, le linee si incrociano senza significato; colore unico segno distintivo, legenda grigia sotto. Correzione: un grafico per serie o una sola linea del rapporto; etichette dirette.

**R09 · Pulsanti con lo stesso peso per azioni diverse (consistency, P2, 0.9).** turni.html:27–29: «Pubblica i turni» ed «Elimina settimana» entrambi `btn-primary`; su telefono vanno a capo e «Salva» resta staccato (turni-telefono.png); la spaziatura dipende dagli spazi nell'HTML. Correzione: Elimina come danger o secondario separato, un solo primario per vista, contenitore flex con `gap` e `flex-wrap`.

**R10 · «OK» della finestra non coerente (consistency, P2, 0.9).** turni.html:54 usa `.button` (app.css:33): raggio 20 px, #2f81f7, senza altezza minima, mentre gli altri usano `.btn-primary`. `.modal-close` (turni.html:50) è uno span da 14 px senza area di tocco. Correzione: `.btn .btn-primary`, rimuovere `.button`, vero pulsante di chiusura da 44 px.

### P3

**R11 · Scala tipografica e spazi fuori dai token (consistency, P3, 0.9).** app.css: h2 17px (r.23), .nav gap 22 e padding 13/24, .cards gap 13, .kpi 18/16, .muted 13px, nav 15px, td 14px, icone 18px; #1f6feb sparso (app.css:19,27, SVG). Correzione: usare `--font-size-*`, `--space-*` e `--color-primary`, aggiungendo ai token i passi mancanti.

**R12 · Gerarchia debole nelle schede e nel banner (visual, P3, 0.8).** `.kpi-label` 18/700 pesa più del numero (16/400 grigio): ordine invertito. Il banner «3 scambi da approvare» (index-telefono.png) sembra una scheda qualsiasi e non è un link. Emoji e icone ✎ 🗑 ⇄ ◀ ▶ sono caratteri di sistema variabili. Correzione: numero grande e etichetta piccola; banner come link con colore d'avviso; icone SVG con aria-label.

**R13 · Ricerca e modulo (usability, P3, 0.8).** dipendenti.html:20,35–48: la ricerca non ha stile (campo da 177 px attaccato al titolo, caption centrata sopra la tabella); 14 campi solo con placeholder (sparisce alla digitazione), modulo lungo in una colonna. Correzione: label visibili, sezioni (anagrafica, contratto, pagamento), ricerca a larghezza piena con lo stile di `.field input`. Il resto (etichette, errori) spetta a UX e accessibilità.

**R14 · Piccole incoerenze di menu e pagine (consistency, P3, 0.85).** Menu con «Settings» in inglese contro «Dashboard»/«Turni», pagina «Impostazioni»; «Squadra» porta a «Personale»; Settings è la prima voce; `lang="en"` su pagine italiane; link del menu senza area di tocco da 44 px né hover; margini h1/h2 diversi. Nomi e ordine: da girare all'Information Architect.

### Regole visive da rendere coerenti
1. Un solo blu (`--color-primary`) e un solo rosso, da token.
2. Una scala tipografica e una di spazi, senza pixel isolati.
3. Un solo componente pulsante, altezza minima 40 px (44 su tocco).
4. Ciò che supera il viewport sta in un contenitore con scorrimento orizzontale, mai sulla pagina.
5. Colore mai unico segno distintivo (punti dei turni, grafici): aggiungere testo o forma.

### Limiti e domande aperte
- Contrasti stimati a mano: da rimisurare con uno strumento.
- Non visti: stati hover/focus, finestra aperta, errori del modulo, dati reali; js/app.js non letto; nessun viewport oltre telefono e computer.
- R06–R08 da confermare con lo specialista dati e grafici prima di diventare requisiti.
- Per R03 e R04 (P1) lavoro su un modello più piccolo di quello della sessione: propongo il riesame del direttore AIWDA-01 o di un revisore su Opus prima che diventino definitivi.

AIWDA-05 · MIMOSA
