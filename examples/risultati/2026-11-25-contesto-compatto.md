# Contesto compatto (2026-11-25, F41)

Il «dopo» della baseline di F40 ([2026-11-25-baseline-contesto.md](2026-11-25-baseline-contesto.md)): regole comuni e indice della biblioteca una volta per reparto e per sessione, con `full_rules` per riaverli. Server e catalogo della 0.14.0 (branch `fase/f41-contesto-compatto`). Per ripetere le misure in byte, dalla root del repository:

```sh
npm run -s agent-text -- --sizes --date 2026-11-25
```

Byte misurati (UTF-8); «~token» è una stima, byte / 4. I token delle esecuzioni vengono dai file dei subagent di Claude Code, una volta per `requestId`.

## In sintesi

- **Flusso di `orchestrazione-newsletter`** (stessa sequenza di F40: AIBPD-01, AIWDA-01, AIPCA-01, AISA-01, AISA-06), in italiano: da 47.676 byte (baseline) a 44.395 (−3.281, −6,9%; circa −820 token). AISA-06, l'unico agente di un reparto già caricato, passa da 6.301 a 2.604 byte: regole comuni da 3.643 a 328, biblioteca da 659 a 245. Gli altri quattro agenti restano interi, con circa 40 byte in più nella cornice per il passaggio di consegne. Le istruzioni del server crescono di 244 byte, per la frase su `full_rules` e sui passaggi di consegne (2.869 caratteri su 4096).
- **Per componente**, sul flusso: regole comuni da 19.703 a 16.388 byte, biblioteca da 3.658 a 3.244, cornice da 6.425 a 6.629, ruolo, compito e resoconto invariati. Quota ripetuta da 4.302 a 573 byte (il riferimento).
- **Uno specialista in più di un reparto già caricato** pesa dal 54 al 59% in meno: da 3,7 a 5,1 KB per agente, circa 930–1.280 token. Il risparmio cresce con il numero di specialisti dello stesso reparto; nella sequenza di F40, che carica solo i direttori più AISA-06, si vede una volta sola.
- **Qualità**: nessun peggioramento. In tutti e 5 i casi lo specialista, eseguito dopo il direttore del reparto con il testo compatto, trova tutti i difetti attesi in entrambe le esecuzioni, senza falsi in più rispetto a F24 e con il formato rispettato. La soglia di F40-06 regge.

## Confronto di qualità

**Metodo.** Per ogni caso il subagent riceve il testo intero del direttore del reparto, senza compito, e poi quello compatto dello specialista con il compito della scheda (`npm run -s agent-text -- <id> "<compito>" --after <direttore>`). È il contesto che il modello ha nel flusso reale: le regole comuni stanno nel testo del direttore, quello dello specialista ha solo il riferimento. Le esecuzioni sono due per caso, su una copia nuova del progetto fuori dal repository, in sola lettura e senza i tool di Agentrica (niente `library`). Il modello è quello della misura di F24: Sonnet 5.5 per AIBPD-05, AICA-04, AIPCA-02 e AISA-09, Opus 5.5 con effort medio per AIWDA-08 (ruolo `inherit`). Il client è Claude Code (estensione VS Code), con subagent `general-purpose`. Il conteggio lo fa un valutatore unico (Opus 5.5) con le regole del [README](../README.md#come-si-conta) e le schede di oggi. I rapporti sono in [`2026-11-25-contesto-compatto/`](2026-11-25-contesto-compatto/). Le esecuzioni hanno usato il riferimento prima dell'aggiunta di «o /clear» (9 byte), uguale per il resto.

**Soglia** (F40-06): rispetto alla stessa configurazione di F24, i difetti di prima meno uno, nessun falso in più, formato dei rilievi rispettato. Valori per esecuzione (1 / 2).

| Caso | Configurazione | F24 trovati | F24 falsi | F41 trovati | F41 falsi | F41 extra validi | Formato | Soglia |
|---|---|---|---|---|---|---|---|---|
| aibpd-05-requisiti-abbonamenti | Sonnet | 7 / 7 su 7 | 2 / 2 | 7 / 7 su 7 | 0 / 1 (dubbio) | 7 / 8 | ok | sì |
| aica-04-config-deploy | Sonnet | 7 / 7 su 7 | 0 / 0 | 7 / 7 su 7 | 0 / 0 | 1 / 2 | ok | sì |
| aipca-02-prenotazioni-palestra | Sonnet | 7 / 7 su 7 | 0 / 0 | 7 / 7 su 7 | 0 / 0 | 1 / 3 | ok | sì |
| aisa-09-api-fatture | Sonnet | 9 / 9 su 9 | 0 / 0 | 9 / 9 su 9 | 0 / 0 | 3 / 3 | ok | sì |
| aiwda-08-form-iscrizione | Opus, effort medio | 8 / 8 su 8 | 0 / 0 | 8 / 8 su 8 | 0 / 0 | 4 / 4 | ok | sì |

**Osservazioni.**

- **AIBPD-05**: i due falsi di F24 (T1 e T2) sono stati ridimensionati dopo F24, quando la scheda ha ammesso gli affinamenti su T1–T2. Il calo dei falsi dipende quindi soprattutto dalla scheda, non dal testo compatto. Nell'esecuzione 2 un falso dubbio: dice «non verificabile» il criterio di US-01 sulla data della prima consegna (T1), ma la lacuna sotto, la regola del calendario, è vera.
- **AISA-09**, esecuzione 1: trova S1 (IDOR in lettura sul dettaglio) con la causa giusta ma lo mette a P3 per via degli UUID; l'esecuzione 2 lo mette a P1. Conta come trovato, la gravità è sottostimata.
- **AIPCA-02**, esecuzione 2: la sintesi dice «non rilevo violazioni in corso» e poi classifica 7 rilievi `non_conforme`. È un difetto di coerenza del testo, non dei conteggi.
- **AIWDA-08**: nessuna delle due esecuzioni trova l'extra di F24 (`form { display: grid }` che vince su `hidden`). Non è nei difetti attesi, quindi non conta come mancato.
- **Regole dal riferimento**: tutti i rapporti applicano le regole comuni che stanno solo nel testo del direttore. I quattro su Sonnet propongono il riesame del direttore o di Opus per i P1, che è la regola comune per i modelli più piccoli; AIPCA-02 dà stato, riferimenti e verifica per rilievo; AIWDA-08 dà la confidenza e il backlog JSON. Nessuno chiede di nuovo le regole: le aveva nel contesto.
- **Limiti**: due esecuzioni per caso e un ruolo per reparto. Il «prima» è la misura di F24, sulla 0.6.0 e con le schede di allora; da allora sono cambiati anche il testo degli agenti (biblioteca, gerarchia) e le schede. Il confronto dice che il testo compatto non peggiora i risultati sugli stessi casi, non che li migliora. Il riferimento non è stato provato dopo un vero `/compact` (vedi la prova a mano sotto).

**Token per esecuzione** (dai file dei subagent; «token» è la somma di ingresso, cache letta e scritta e uscita): da 156k a 220k, in media 193k, da 3 a 4 richieste, uscita da 3,9k a 14,1k. Il testo di Agentrica nel contesto di una prova è da 9 a 12,6 KB (direttore intero più specialista compatto), circa 2.300–3.200 token su 190k: il resto è il contesto del client e i file del progetto. Il risparmio in token di sessione di F41 non si vede quindi in una prova di un solo specialista: si misura in byte, sopra.

| Caso | N | Richieste | Token | Uscita | Letti dalla cache |
|---|---|---|---|---|---|
| aibpd-05-requisiti-abbonamenti | 1 | 3 | 162k | 10.6k | 58% |
| aibpd-05-requisiti-abbonamenti | 2 | 3 | 162k | 11.3k | 72% |
| aica-04-config-deploy | 1 | 4 | 212k | 4.7k | 71% |
| aica-04-config-deploy | 2 | 4 | 213k | 5.0k | 81% |
| aipca-02-prenotazioni-palestra | 1 | 4 | 212k | 6.4k | 70% |
| aipca-02-prenotazioni-palestra | 2 | 4 | 219k | 14.1k | 78% |
| aisa-09-api-fatture | 1 | 3 | 156k | 3.9k | 60% |
| aisa-09-api-fatture | 2 | 4 | 213k | 7.4k | 79% |
| aiwda-08-form-iscrizione | 1 | 4 | 220k | 8.0k | 69% |
| aiwda-08-form-iscrizione | 2 | 3 | 162k | 9.6k | 72% |

## Prova a mano del flusso (orchestrazione-newsletter, da fare)

Il caso si prova in una sessione di Claude Code con il server del branch e il pannello; i criteri C1–C7 sono nella [scheda](../casi/orchestrazione-newsletter.md). In più, per F41:

- **C8**: il primo agente di ogni reparto riceve le regole comuni intere, il secondo dello stesso reparto il riferimento («Valgono le regole comuni del reparto…»).
- **C9**: dopo `/compact`, chiedendo di continuare con un agente di un reparto già caricato, il modello richiama `agent` con `full_rules` true se non ha più le regole nel contesto.

Passi, dalla root di questo repository:

```sh
D=$(mktemp -d)/newsletter && node packages/mcp/src/server.ts init "$D" --name Newsletter
cat > "$D/.mcp.json" <<JSON
{ "mcpServers": { "agentrica": { "command": "node", "args": ["$PWD/packages/mcp/src/server.ts"] } } }
JSON
cd "$D" && claude
```

1. Approva il server del progetto e incolla la richiesta del caso: «Aggiungi al progetto una pagina di iscrizione alla newsletter con l'email e il consenso al trattamento dei dati.»
2. Rispondi alle domande dal pannello; quando arriva il software, lascia che carichi AISA-01 e poi uno specialista (C8: il secondo testo AISA ha il riferimento; lo vedi espandendo la chiamata ad `agent`).
3. Lancia `/compact`, poi chiedi «Continua con la revisione del Code Reviewer». C9: la chiamata ad `agent` per AISA-12 ha `full_rules: true`, oppure il modello spiega che ha ancora le regole nel riassunto.
4. Controlla C1–C6 con `npm run -s orchestration -- <sessione.jsonl>` dalla root di questo repository e C7 nel pannello.

Il risultato va aggiunto qui sotto con data, versione e modello.

## Misure in byte

Misure del 2026-11-25 con `npm run -s agent-text -- --sizes --date 2026-11-25`. Byte misurati (UTF-8); «~token» è una stima, byte / 4.

## Italiano

### Per agente (byte; resoconto e valutazione inclusi, senza compito)

| Agente | Totale | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD-01 | 8319 | 2080 | 1372 | 4246 | 1433 | 881 | 0 | 387 |
| AIBPD-02 | 8240 | 2060 | 1302 | 4246 | 1424 | 881 | 0 | 387 |
| AIBPD-03 | 8273 | 2068 | 1320 | 4246 | 1437 | 883 | 0 | 387 |
| AIBPD-04 | 8213 | 2053 | 1272 | 4246 | 1421 | 887 | 0 | 387 |
| AIBPD-05 | 8587 | 2147 | 1618 | 4246 | 1453 | 883 | 0 | 387 |
| AIBPD-06 | 8219 | 2055 | 1314 | 4246 | 1391 | 881 | 0 | 387 |
| AIBPD-07 | 8358 | 2090 | 1320 | 4246 | 1520 | 885 | 0 | 387 |
| AIBPD-08 | 8297 | 2074 | 1305 | 4246 | 1474 | 885 | 0 | 387 |
| AIBPD-09 | 8287 | 2072 | 1317 | 4246 | 1454 | 883 | 0 | 387 |
| AIBPD-10 | 8288 | 2072 | 1326 | 4246 | 1448 | 881 | 0 | 387 |
| AIBPD-11 | 8339 | 2085 | 1347 | 4246 | 1476 | 883 | 0 | 387 |
| AIBPD-12 | 8271 | 2068 | 1341 | 4246 | 1416 | 881 | 0 | 387 |
| AICA-01 | 8891 | 2223 | 1323 | 5041 | 1520 | 622 | 0 | 385 |
| AICA-02 | 8793 | 2198 | 1235 | 5041 | 1508 | 624 | 0 | 385 |
| AICA-03 | 9120 | 2280 | 1542 | 5041 | 1528 | 624 | 0 | 385 |
| AICA-04 | 9077 | 2269 | 1515 | 5041 | 1518 | 618 | 0 | 385 |
| AICA-05 | 9039 | 2260 | 1521 | 5041 | 1474 | 618 | 0 | 385 |
| AICA-06 | 8855 | 2214 | 1298 | 5041 | 1513 | 618 | 0 | 385 |
| AICA-07 | 9083 | 2271 | 1530 | 5041 | 1507 | 620 | 0 | 385 |
| AICA-08 | 8893 | 2223 | 1304 | 5041 | 1543 | 620 | 0 | 385 |
| AICA-09 | 9117 | 2279 | 1538 | 5041 | 1531 | 622 | 0 | 385 |
| AICA-10 | 8836 | 2209 | 1286 | 5041 | 1500 | 624 | 0 | 385 |
| AICA-11 | 8934 | 2234 | 1304 | 5041 | 1580 | 624 | 0 | 385 |
| AICA-12 | 8813 | 2203 | 1262 | 5041 | 1503 | 622 | 0 | 385 |
| AIPCA-01 | 7078 | 1770 | 1355 | 3505 | 1060 | 771 | 0 | 387 |
| AIPCA-02 | 7297 | 1824 | 1567 | 3505 | 1067 | 771 | 0 | 387 |
| AIPCA-03 | 6790 | 1698 | 1278 | 3505 | 849 | 771 | 0 | 387 |
| AIPCA-04 | 6948 | 1737 | 1308 | 3505 | 981 | 767 | 0 | 387 |
| AIPCA-05 | 7210 | 1803 | 1540 | 3505 | 1013 | 765 | 0 | 387 |
| AIPCA-06 | 7172 | 1793 | 1579 | 3505 | 936 | 765 | 0 | 387 |
| AIPCA-07 | 7231 | 1808 | 1591 | 3505 | 979 | 769 | 0 | 387 |
| AIPCA-08 | 7099 | 1775 | 1558 | 3505 | 882 | 767 | 0 | 387 |
| AIPCA-09 | 7006 | 1752 | 1335 | 3505 | 1014 | 765 | 0 | 387 |
| AIPCA-10 | 6844 | 1711 | 1287 | 3505 | 894 | 771 | 0 | 387 |
| AISA-01 | 6662 | 1666 | 1307 | 3643 | 674 | 653 | 0 | 385 |
| AISA-02 | 6541 | 1635 | 1230 | 3643 | 624 | 659 | 0 | 385 |
| AISA-03 | 6636 | 1659 | 1296 | 3643 | 659 | 653 | 0 | 385 |
| AISA-04 | 6568 | 1642 | 1230 | 3643 | 651 | 659 | 0 | 385 |
| AISA-05 | 6799 | 1700 | 1486 | 3643 | 630 | 655 | 0 | 385 |
| AISA-06 | 6542 | 1636 | 1236 | 3643 | 619 | 659 | 0 | 385 |
| AISA-07 | 6843 | 1711 | 1513 | 3643 | 649 | 653 | 0 | 385 |
| AISA-08 | 6852 | 1713 | 1518 | 3643 | 651 | 655 | 0 | 385 |
| AISA-09 | 6858 | 1715 | 1525 | 3643 | 650 | 655 | 0 | 385 |
| AISA-10 | 6854 | 1714 | 1531 | 3643 | 638 | 657 | 0 | 385 |
| AISA-11 | 6870 | 1718 | 1504 | 3643 | 683 | 655 | 0 | 385 |
| AISA-12 | 6649 | 1662 | 1302 | 3643 | 662 | 657 | 0 | 385 |
| AIWDA-01 | 9124 | 2281 | 1359 | 4666 | 2018 | 694 | 0 | 387 |
| AIWDA-02 | 8392 | 2098 | 1233 | 4666 | 1418 | 688 | 0 | 387 |
| AIWDA-03 | 8311 | 2078 | 1218 | 4666 | 1348 | 692 | 0 | 387 |
| AIWDA-04 | 8140 | 2035 | 1248 | 4666 | 1151 | 688 | 0 | 387 |
| AIWDA-05 | 8192 | 2048 | 1221 | 4666 | 1228 | 690 | 0 | 387 |
| AIWDA-06 | 8259 | 2065 | 1260 | 4666 | 1256 | 690 | 0 | 387 |
| AIWDA-07 | 8245 | 2061 | 1305 | 4666 | 1199 | 688 | 0 | 387 |
| AIWDA-08 | 8917 | 2229 | 1260 | 4666 | 1910 | 694 | 0 | 387 |
| AIWDA-09 | 8296 | 2074 | 1239 | 4666 | 1310 | 694 | 0 | 387 |
| AIWDA-10 | 8094 | 2024 | 1212 | 4666 | 1139 | 690 | 0 | 387 |

### Per reparto (media sugli agenti)

| Reparto | Agenti | Totale medio | ~token | Regole comuni | Quota delle regole | Ruolo medio | Biblioteca media |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD | 12 | 8308 | 2077 | 4246 | 51% | 1446 | 883 |
| AICA | 12 | 8954 | 2239 | 5041 | 56% | 1519 | 621 |
| AIPCA | 10 | 7068 | 1767 | 3505 | 50% | 968 | 768 |
| AISA | 12 | 6723 | 1681 | 3643 | 54% | 649 | 656 |
| AIWDA | 10 | 8397 | 2099 | 4666 | 56% | 1398 | 691 |

### Flusso di orchestrazione-newsletter (pannello sì, valutazione con il modulo, senza compito)

| Testo | Byte | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione | Ripetuto |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Istruzioni del server | 2902 | 726 |  |  |  |  |  |  |  |
| list_agents | 8545 | 2136 |  |  |  |  |  |  |  |
| agent AIBPD-01 | 8109 | 2027 | 1372 | 4246 | 1433 | 881 | 0 | 177 | 0 |
| agent AIWDA-01 | 8914 | 2229 | 1359 | 4666 | 2018 | 694 | 0 | 177 | 0 |
| agent AIPCA-01 | 6868 | 1717 | 1355 | 3505 | 1060 | 771 | 0 | 177 | 0 |
| agent AISA-01 | 6453 | 1613 | 1307 | 3643 | 674 | 653 | 0 | 176 | 0 |
| agent AISA-06 | 2604 | 651 | 1236 | 328 | 619 | 245 | 0 | 176 | 573 |
| **Totale** | 44395 | 11099 | 6629 | 16388 | 5804 | 3244 | 0 | 883 | 573 |

Testo degli agenti nel flusso: 32948 byte, di cui regole comuni 16388 (50%) e ripetuti 573 (2%: il riferimento a regole e biblioteca di un reparto già caricato). Le schede lette con `library` dipendono dal modello e non sono contate.

Senza la memoria delle regole (ogni agente con il testo intero, gli altri testi come oggi): agenti 36677 byte, flusso 48124 byte (~12031 token). Differenza: 3729 byte (8% del flusso). Rispetto alla baseline di F40 (0.13.0) le istruzioni del server pesano 244 byte in più, per la frase su full_rules e i passaggi di consegne.

### Uno specialista in più di un reparto già caricato (media sugli specialisti)

| Reparto | Testo intero | Con le regole già inviate | Differenza | ~token risparmiati |
| --- | ---: | ---: | ---: | ---: |
| AIBPD | 8097 | 3523 | 4574 (56%) | 1144 |
| AICA | 8751 | 3641 | 5110 (58%) | 1278 |
| AIPCA | 6856 | 3144 | 3712 (54%) | 928 |
| AISA | 6519 | 2773 | 3746 (57%) | 937 |
| AIWDA | 8106 | 3307 | 4799 (59%) | 1200 |

### Altri testi del server

| Testo | Byte | ~token | Nota |
| --- | ---: | ---: | ---: |
| Istruzioni, pannello e valutazioni | 2902 | 726 | 2869 caratteri su 4096 |
| Istruzioni, senza pannello né valutazioni | 2111 | 528 | 2082 caratteri su 4096 |
| list_agents, tutto il catalogo | 8545 | 2136 | 5 reparti |
| list_agents, AIBPD (o squadra di un reparto) | 1835 | 459 | 12 agenti |
| list_agents, AICA (o squadra di un reparto) | 1881 | 470 | 12 agenti |
| list_agents, AIPCA (o squadra di un reparto) | 1765 | 441 | 10 agenti |
| list_agents, AISA (o squadra di un reparto) | 1845 | 461 | 12 agenti |
| list_agents, AIWDA (o squadra di un reparto) | 1215 | 304 | 10 agenti |

### Schede della biblioteca (tool library, una scheda)

| Reparto | Schede | Minimo | Medio | Massimo | ~token medi |
| --- | ---: | ---: | ---: | ---: | ---: |
| AIBPD | 3 | 941 | 1127 | 1232 | 282 |
| AICA | 4 | 1126 | 1308 | 1551 | 327 |
| AIPCA | 3 | 1597 | 1620 | 1652 | 405 |
| AISA | 3 | 1214 | 1546 | 1713 | 387 |
| AIWDA | 3 | 1209 | 1607 | 2306 | 402 |

## Inglese

### Per agente (byte; resoconto e valutazione inclusi, senza compito)

| Agente | Totale | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD-01 | 8126 | 2032 | 1373 | 4109 | 1337 | 931 | 0 | 376 |
| AIBPD-02 | 8074 | 2019 | 1327 | 4109 | 1331 | 931 | 0 | 376 |
| AIBPD-03 | 8123 | 2031 | 1345 | 4109 | 1360 | 933 | 0 | 376 |
| AIBPD-04 | 8059 | 2015 | 1297 | 4109 | 1340 | 937 | 0 | 376 |
| AIBPD-05 | 8398 | 2100 | 1628 | 4109 | 1352 | 933 | 0 | 376 |
| AIBPD-06 | 8074 | 2019 | 1339 | 4109 | 1319 | 931 | 0 | 376 |
| AIBPD-07 | 8165 | 2041 | 1345 | 4109 | 1400 | 935 | 0 | 376 |
| AIBPD-08 | 8093 | 2023 | 1330 | 4109 | 1343 | 935 | 0 | 376 |
| AIBPD-09 | 8090 | 2023 | 1342 | 4109 | 1330 | 933 | 0 | 376 |
| AIBPD-10 | 8096 | 2024 | 1351 | 4109 | 1329 | 931 | 0 | 376 |
| AIBPD-11 | 8117 | 2029 | 1372 | 4109 | 1327 | 933 | 0 | 376 |
| AIBPD-12 | 8104 | 2026 | 1366 | 4109 | 1322 | 931 | 0 | 376 |
| AICA-01 | 8492 | 2123 | 1324 | 4762 | 1400 | 632 | 0 | 374 |
| AICA-02 | 8426 | 2107 | 1260 | 4762 | 1396 | 634 | 0 | 374 |
| AICA-03 | 8710 | 2178 | 1552 | 4762 | 1388 | 634 | 0 | 374 |
| AICA-04 | 8674 | 2169 | 1525 | 4762 | 1385 | 628 | 0 | 374 |
| AICA-05 | 8660 | 2165 | 1531 | 4762 | 1365 | 628 | 0 | 374 |
| AICA-06 | 8484 | 2121 | 1323 | 4762 | 1397 | 628 | 0 | 374 |
| AICA-07 | 8681 | 2170 | 1540 | 4762 | 1375 | 630 | 0 | 374 |
| AICA-08 | 8514 | 2129 | 1329 | 4762 | 1419 | 630 | 0 | 374 |
| AICA-09 | 8733 | 2183 | 1548 | 4762 | 1417 | 632 | 0 | 374 |
| AICA-10 | 8470 | 2118 | 1311 | 4762 | 1389 | 634 | 0 | 374 |
| AICA-11 | 8559 | 2140 | 1329 | 4762 | 1460 | 634 | 0 | 374 |
| AICA-12 | 8436 | 2109 | 1287 | 4762 | 1381 | 632 | 0 | 374 |
| AIPCA-01 | 6903 | 1726 | 1356 | 3388 | 1020 | 763 | 0 | 376 |
| AIPCA-02 | 7118 | 1780 | 1577 | 3388 | 1014 | 763 | 0 | 376 |
| AIPCA-03 | 6687 | 1672 | 1303 | 3388 | 857 | 763 | 0 | 376 |
| AIPCA-04 | 6743 | 1686 | 1333 | 3388 | 887 | 759 | 0 | 376 |
| AIPCA-05 | 7032 | 1758 | 1550 | 3388 | 961 | 757 | 0 | 376 |
| AIPCA-06 | 7001 | 1750 | 1589 | 3388 | 891 | 757 | 0 | 376 |
| AIPCA-07 | 7060 | 1765 | 1601 | 3388 | 934 | 761 | 0 | 376 |
| AIPCA-08 | 6950 | 1738 | 1568 | 3388 | 859 | 759 | 0 | 376 |
| AIPCA-09 | 6856 | 1714 | 1360 | 3388 | 975 | 757 | 0 | 376 |
| AIPCA-10 | 6722 | 1681 | 1312 | 3388 | 883 | 763 | 0 | 376 |
| AISA-01 | 6516 | 1629 | 1308 | 3494 | 668 | 672 | 0 | 374 |
| AISA-02 | 6434 | 1609 | 1255 | 3494 | 633 | 678 | 0 | 374 |
| AISA-03 | 6525 | 1631 | 1321 | 3494 | 664 | 672 | 0 | 374 |
| AISA-04 | 6441 | 1610 | 1255 | 3494 | 640 | 678 | 0 | 374 |
| AISA-05 | 6673 | 1668 | 1496 | 3494 | 635 | 674 | 0 | 374 |
| AISA-06 | 6428 | 1607 | 1261 | 3494 | 621 | 678 | 0 | 374 |
| AISA-07 | 6719 | 1680 | 1523 | 3494 | 656 | 672 | 0 | 374 |
| AISA-08 | 6712 | 1678 | 1528 | 3494 | 642 | 674 | 0 | 374 |
| AISA-09 | 6709 | 1677 | 1535 | 3494 | 632 | 674 | 0 | 374 |
| AISA-10 | 6709 | 1677 | 1541 | 3494 | 624 | 676 | 0 | 374 |
| AISA-11 | 6680 | 1670 | 1514 | 3494 | 624 | 674 | 0 | 374 |
| AISA-12 | 6522 | 1631 | 1327 | 3494 | 651 | 676 | 0 | 374 |
| AIWDA-01 | 8905 | 2226 | 1360 | 4476 | 1977 | 716 | 0 | 376 |
| AIWDA-02 | 8157 | 2039 | 1258 | 4476 | 1337 | 710 | 0 | 376 |
| AIWDA-03 | 8082 | 2021 | 1243 | 4476 | 1273 | 714 | 0 | 376 |
| AIWDA-04 | 7959 | 1990 | 1273 | 4476 | 1124 | 710 | 0 | 376 |
| AIWDA-05 | 8015 | 2004 | 1246 | 4476 | 1205 | 712 | 0 | 376 |
| AIWDA-06 | 8048 | 2012 | 1285 | 4476 | 1199 | 712 | 0 | 376 |
| AIWDA-07 | 8045 | 2011 | 1330 | 4476 | 1153 | 710 | 0 | 376 |
| AIWDA-08 | 8656 | 2164 | 1285 | 4476 | 1803 | 716 | 0 | 376 |
| AIWDA-09 | 8077 | 2019 | 1264 | 4476 | 1245 | 716 | 0 | 376 |
| AIWDA-10 | 7882 | 1971 | 1237 | 4476 | 1081 | 712 | 0 | 376 |

### Per reparto (media sugli agenti)

| Reparto | Agenti | Totale medio | ~token | Regole comuni | Quota delle regole | Ruolo medio | Biblioteca media |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD | 12 | 8127 | 2032 | 4109 | 51% | 1341 | 933 |
| AICA | 12 | 8570 | 2143 | 4762 | 56% | 1398 | 631 |
| AIPCA | 10 | 6907 | 1727 | 3388 | 49% | 928 | 760 |
| AISA | 12 | 6589 | 1647 | 3494 | 53% | 641 | 675 |
| AIWDA | 10 | 8183 | 2046 | 4476 | 55% | 1340 | 713 |

### Flusso di orchestrazione-newsletter (pannello sì, valutazione con il modulo, senza compito)

| Testo | Byte | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione | Ripetuto |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Istruzioni del server | 2847 | 712 |  |  |  |  |  |  |  |
| list_agents | 8676 | 2169 |  |  |  |  |  |  |  |
| agent AIBPD-01 | 7926 | 1982 | 1373 | 4109 | 1337 | 931 | 0 | 176 | 0 |
| agent AIWDA-01 | 8705 | 2176 | 1360 | 4476 | 1977 | 716 | 0 | 176 | 0 |
| agent AIPCA-01 | 6703 | 1676 | 1356 | 3388 | 1020 | 763 | 0 | 176 | 0 |
| agent AISA-01 | 6317 | 1579 | 1308 | 3494 | 668 | 672 | 0 | 175 | 0 |
| agent AISA-06 | 2627 | 657 | 1261 | 337 | 621 | 233 | 0 | 175 | 570 |
| **Totale** | 43801 | 10950 | 6658 | 15804 | 5623 | 3315 | 0 | 878 | 570 |

Testo degli agenti nel flusso: 32278 byte, di cui regole comuni 15804 (49%) e ripetuti 570 (2%: il riferimento a regole e biblioteca di un reparto già caricato). Le schede lette con `library` dipendono dal modello e non sono contate.

Senza la memoria delle regole (ogni agente con il testo intero, gli altri testi come oggi): agenti 35880 byte, flusso 47403 byte (~11851 token). Differenza: 3602 byte (8% del flusso). Rispetto alla baseline di F40 (0.13.0) le istruzioni del server pesano 257 byte in più, per la frase su full_rules e i passaggi di consegne.

### Uno specialista in più di un reparto già caricato (media sugli specialisti)

| Reparto | Testo intero | Con le regole già inviate | Differenza | ~token risparmiati |
| --- | ---: | ---: | ---: | ---: |
| AIBPD | 7927 | 3434 | 4493 (57%) | 1123 |
| AICA | 8378 | 3532 | 4846 (58%) | 1212 |
| AIPCA | 6708 | 3114 | 3594 (54%) | 899 |
| AISA | 6397 | 2776 | 3621 (57%) | 905 |
| AIWDA | 7902 | 3265 | 4637 (59%) | 1159 |

### Altri testi del server

| Testo | Byte | ~token | Nota |
| --- | ---: | ---: | ---: |
| Istruzioni, pannello e valutazioni | 2847 | 712 | 2823 caratteri su 4096 |
| Istruzioni, senza pannello né valutazioni | 2107 | 527 | 2083 caratteri su 4096 |
| list_agents, tutto il catalogo | 8676 | 2169 | 5 reparti |
| list_agents, AIBPD (o squadra di un reparto) | 1886 | 472 | 12 agenti |
| list_agents, AICA (o squadra di un reparto) | 1899 | 475 | 12 agenti |
| list_agents, AIPCA (o squadra di un reparto) | 1765 | 441 | 10 agenti |
| list_agents, AISA (o squadra di un reparto) | 1859 | 465 | 12 agenti |
| list_agents, AIWDA (o squadra di un reparto) | 1263 | 316 | 10 agenti |

### Schede della biblioteca (tool library, una scheda)

| Reparto | Schede | Minimo | Medio | Massimo | ~token medi |
| --- | ---: | ---: | ---: | ---: | ---: |
| AIBPD | 3 | 911 | 1127 | 1279 | 282 |
| AICA | 4 | 1093 | 1263 | 1483 | 316 |
| AIPCA | 3 | 1509 | 1570 | 1613 | 393 |
| AISA | 3 | 1171 | 1482 | 1653 | 371 |
| AIWDA | 3 | 1179 | 1577 | 2276 | 394 |
