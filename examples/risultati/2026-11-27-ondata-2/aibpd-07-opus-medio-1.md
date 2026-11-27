AIBPD-07 · MENKENT — Senior Growth & Monetization Manager, reparto AIBPD (AI Business & Product Development)

**Perimetro.** Ho letto in sola lettura `crescita/imbuto.md` e `crescita/prezzi.md`. Per i confronti ho letto anche README, `clienti/fidelizzazione.md`, `clienti/coorti.csv`, `partner/accordi.md`, `mercato/fonti.md`, `finanza/business-case.md`, `marketing/lancio.md` e `roadmap/portafoglio.md`. Non ho modificato nessun file. I conti sono rifatti con Python e le formule sono scritte sotto. Le istruzioni chiedevano di caricare prima AIBPD-01 · ALDERAMIN, ma il tool `agent` non c'era: il rapporto va a lui tramite il chiamante.

## Esito

I conti aritmetici dei documenti sono giusti: le percentuali dell'imbuto, i CAC calcolati come spesa diviso clienti e la somma dell'MRR per piano. Sono sbagliati invece le definizioni e le conclusioni: tutte e tre le proposte (cambio della pagina dei prezzi, spostamento del budget, campagna sugli annuali) si basano su metriche sbagliate o su un test non significativo. Non ci sono rilievi P0. I rilievi P1 sono quattro.

## Rilievi

**R1 · P1 · `crescita/imbuto.md` r. 12 e r. 14: la conversione dalla prova al pagamento è 12%, non 20%.**
- Il 20% è 180 / 900, cioè calcolato sulle sole prove *attivate*.
- Calcolata sulle prove avviate è 180 / 1.500 = **12%**, sotto la «media del settore 15%» che il documento cita a confronto.
- Quel 15% non ha una fonte: non compare in `mercato/fonti.md`.
- Anche l'obiettivo 2027 del 25% non dice su quale base si misura.
- **Correzione:** riportare due metriche distinte, «prova avviata → pagante 12%» e «prova attivata → pagante 20%». Togliere il confronto con il 15% finché non c'è una fonte con data. Fissare l'obiettivo 2027 su una base dichiarata.
- Nota sulle coorti: le prove avviate dopo il 1° ottobre non hanno chiuso i 30 giorni, quindi vanno escluse dal denominatore oppure contate per coorte di prova.

**R2 · P1 · `crescita/imbuto.md` r. 18–25: l'esperimento non è affidabile e la decisione non regge.**
- **Calcoli giusti:** 35/412 = 8,5% e 41/405 = 10,1%, cioè +19% relativo (+1,6 punti).
- **Non è significativo.** Il test z a due proporzioni dà z = 0,80 e p = 0,42, lontano dal 95% dichiarato.
- **Arresto anticipato.** Il test si guardava ogni mattina e si è fermato quando il risultato sembrava significativo. Così il rischio di un falso positivo cresce molto.
- **Durata troppo breve.** Sei giorni sono meno di un ciclo settimanale, e un locale ha ritmi diversi fra un giorno e l'altro della settimana.
- **Campione troppo piccolo.** Per vedere un +19% partendo dall'8,5% (α 0,05, potenza 80%) servono circa **5.100 visite per variante**: qui ce ne sono 405–412.
- **Metrica sbagliata.** Tutte le prove sono già su Pro (`prezzi.md` r. 13). Mettere in evidenza Pro può cambiare soprattutto il piano scelto alla fine della prova, che il test non misura.
- **Dato da verificare (P3).** 817 visite alla pagina dei prezzi in 6 giorni fanno circa 136 al giorno. Il sito intero ha in media circa 103 visite al giorno (37.500 / 365).
- **Correzione:** considerare la «Decisione» non provata. Rifare il test con campione e durata fissati prima (almeno due settimane intere), senza fermarlo guardando i risultati a metà. Metrica principale: conversione in pagante e ricavo medio per cliente a fine prova; secondaria: prove avviate.

**R3 · P1 · `crescita/imbuto.md` r. 29–36: lo spostamento di budget segue l'LTV invece del rapporto fra valore e costo, e i dati di Instagram non bastano.**
- **Criterio sbagliato.** Conta il margine per cliente rispetto al CAC, non l'LTV da solo. Con il margine lordo del 78% (README r. 11) e il ricavo medio per cliente di 21.630 / 412 = 52,5 € al mese:

| Canale | LTV × 78% / CAC | Recupero del CAC |
|---|---|---|
| Google Ads | 406 / 95 = **4,3** | 2,3 mesi |
| Instagram | 499 / 150 = **3,3** | 3,7 mesi |

- **Il conto non torna nemmeno con i dati del documento.** Spostare 4.750 € toglie circa 50 clienti da Google (valore circa 20.300 €) e ne porta circa 32 da Instagram (valore circa 15.800 €). Il saldo è circa 18 clienti in meno e circa 4.500 € di valore in meno. E l'ipotesi che il CAC resti uguale salendo di spesa è ottimistica.
- **L'LTV di Instagram è estrapolata.** I 640 € «a 12 mesi» vengono da 3 mesi di dati e 14 clienti. La cifra supera anche 12 × 52,5 € = 630 €: vuol dire nessun abbandono, mentre l'abbandono reale è il 24–30% l'anno.
- **Correzione:** lasciare il budget dov'è. Su Instagram fare un test con un budget limitato e un tetto al CAC, poi decidere con almeno 6 mesi di dati.
- Segnalo anche un'incoerenza: `marketing/lancio.md` r. 12–16 dà il 70% del budget del 2027 a LinkedIn, un canale senza nessun dato in `crescita/`. Va riconciliato con il responsabile marketing.

**R4 · P1 · `crescita/prezzi.md` r. 18: «con più annuali i ricavi del 2027 crescono del 20%» confonde cassa e ricavi.**
- L'annuale incassa prima, ma il ricavo si riconosce mese per mese. Lo dice lo stesso `finanza/business-case.md` r. 27.
- L'annuale ha uno sconto di 2/12 = 16,7%. Portare il 38% dei clienti dal mensile all'annuale riduce il ricavo dei piani di circa **−6%** (0,38 × 16,7%), prima dell'effetto sugli abbandoni.
- Il +20% non ha formula né ipotesi. Anche il 60% come traguardo non è motivato.
- **Correzione:** presentare la campagna come una misura per la *cassa* e per gli *abbandoni*. Mettere a confronto la perdita di ricavo per lo sconto con il guadagno sugli abbandoni. Per questo serve il tasso di abbandono degli annuali rispetto ai mensili, che oggi non è nei documenti.

**R5 · P2 · `crescita/imbuto.md` r. 33 e r. 36: il CAC del referral non è 0 €.**
- Il programma regala un mese a chi invita e a chi è invitato: circa 2 × 52,5 = **circa 105 €** di ricavo rinunciato per ogni cliente, più di Google Ads.
- «Raddoppiare il referral, che non costa nulla» quindi parte da un dato sbagliato. Se «raddoppiare» vuol dire raddoppiare il premio, raddoppia anche il costo.
- **Correzione:** CAC del referral = mesi regalati × ricavo medio per cliente (oppure il costo a margine). Precisare cosa vuol dire «raddoppiare».
- Col costo giusto il referral resta valido (margine / CAC circa 4,5), ma non è gratis.

**R6 · P2 · `crescita/imbuto.md` r. 31–34: CAC e LTV sono definiti in modo incompleto.**
- **CAC.** Conta solo la spesa in pubblicità. Esclude 3 commerciali e 1 persona di marketing (README r. 9), e mette 0 € ai fornitori della cassa.
- **Cassa Facile.** Dall'accordo in firma (`partner/accordi.md` r. 14) il canale costerà il 25% dell'incassato, IVA compresa, per 12 mesi: circa 190 € per cliente con il ricavo medio di oggi.
- **LTV.** «LTV a 12 mesi» è ricavo a 12 mesi, non valore della vita del cliente, e non è al netto del margine.
- **Correzione:**
  - riportare un CAC complessivo, con i costi del personale, accanto al CAC per canale;
  - per Cassa Facile usare il CAC previsto dall'accordo;
  - definire LTV = ricavo medio per cliente × margine lordo / abbandono mensile, oppure chiamare la colonna «ricavo a 12 mesi».
- Il tasso di abbandono da usare va rifatto: `clienti/fidelizzazione.md` r. 14 divide per i clienti di fine periodo (98/412). Sui clienti a inizio periodo è 98/330 = 29,7%; sulla media del periodo è 26,4%.

**R7 · P2 · `crescita/prezzi.md` r. 14 (e README r. 10): l'MRR conta gli annuali a prezzo pieno.**
- 5.510 + 10.030 + 5.148 + 942 = 21.630 € è giusto a listino. Ma l'annuale paga 10 mesi su 12, e il README dice che gli annuali contano per il loro equivalente mensile.
- Con il 22% di annuali distribuiti come gli altri piani (stima), l'MRR dei piani scende di circa 760 €: **MRR circa 20.870 €, ARR circa 250.500 €**, invece di 21.630 € e 259.560 €.
- **Correzione:** ricalcolare l'MRR dall'elenco reale degli abbonamenti, con gli annuali a prezzo × 10/12. Va chiarito anche se il supplemento per i dipendenti oltre soglia vale per gli annuali.

**R8 · P3 · `crescita/prezzi.md` r. 5–11: la soglia dei dipendenti non spinge a cambiare piano.**
- Base con 25 dipendenti costa 29 + 15 × 2 = 59 €, quanto Pro.
- Pro con 40 dipendenti costa 59 + 15 × 2 = 89 €, meno di Plus (99 €).
- Il passaggio di piano dipende quindi solo dalle funzioni, non dalla dimensione del locale.
- Il prezzo è il secondo motivo di abbandono (22%, `clienti/fidelizzazione.md` r. 35).
- **Proposta da validare, non una decisione:** valutare un supplemento a scaglioni o soglie diverse con un test sui prezzi per i clienti nuovi. Nessuna modifica ai prezzi in produzione senza approvazione.

## Note di metodo e norme

- I Clienti paganti dell'imbuto (180) sono uguali ai nuovi clienti di `fidelizzazione.md` e alla somma dei canali. Ma referral e fornitori della cassa (66 clienti) forse non passano dal sito e dalla prova: l'imbuto rischia di mischiare percorsi diversi.
- `fidelizzazione.md` r. 52 definisce l'attivazione come «email confermata», l'imbuto come «almeno un turno pubblicato». Serve una definizione sola.
- **Biblioteca.** Ho letto due schede, entrambe da Normattiva, verificate il 2026-11-19, da ricontrollare entro il 2027-05-19:
  - `riduzioni-di-prezzo`: art. 17-bis del Codice del consumo, testo in vigore dal 2 aprile 2023;
  - `funzione-di-recesso`: art. 54-bis, D.lgs. 209/2025, in vigore dal 19 giugno 2026.
  
  Valgono per i consumatori. Turnio vende a imprese (README r. 12), quindi in linea di massima non si applicano alla campagna «due mesi gratis». Se fra i clienti ci sono consumatori, serve la revisione legale umana.

## Domande aperte

1. Quanti clienti hanno l'annuale, per piano, e come abbandonano rispetto ai mensili? Serve per R4 e R7.
2. Il premio del referral si dà solo se l'invitato diventa pagante? Ci sono limiti di invitati?
3. La «media del settore 15%» da quale fonte viene, e di che data?
4. Quante visite ha avuto la pagina dei prezzi in ottobre? Serve per spiegare le 817 visite in 6 giorni.
5. I 26 clienti dei fornitori della cassa hanno avuto compensi o tempo dei commerciali?

## Decisioni per l'utente

- Sospendere la decisione «B diventa la pagina dei prezzi» e rifare il test.
- Non spostare il budget da Google Ads a Instagram sui dati di oggi.
- Ripresentare la campagna sugli annuali come misura di cassa e di abbandoni, con i conti dello sconto.

Sono proposte: la decisione resta all'utente.

Firmato: AIBPD-07 · MENKENT
