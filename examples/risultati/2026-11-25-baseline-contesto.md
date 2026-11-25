# Baseline del contesto (2026-11-25)

Il «prima» di F41 e F42: quanto testo restituisce Agentrica, componente per componente. Catalogo e server della 0.13.0 (branch `fase/f40-baseline-contesto`). Per ripetere la misura, dalla root del repository:

```sh
npm run -s agent-text -- --sizes --date 2026-11-25
```

A parità di catalogo e di data i numeri sono gli stessi: i componenti vengono da `agentParts` (`packages/mcp/src/prompt.ts`), la funzione con cui il server compone il testo, e un test controlla che la loro somma sia la lunghezza del testo per ogni agente e lingua. La data serve solo a segnare le schede scadute nell'indice della biblioteca.

## Fonti dei numeri

- **Byte**: misurati, UTF-8, dal testo che il server restituisce.
- **Token (~token)**: stimati, byte / 4. Un conteggio esatto chiederebbe il tokenizer di un provider, con una chiave e un costo: fuori dai confini del Core.
- **Token di sessione**: solo dai file di Claude Code (pannello e `share_usage`); con altri client non sono disponibili. Questa baseline non li usa.

## Componenti

| Componente | Cosa contiene |
|---|---|
| Cornice | titolo, chi è l'agente, gerarchia (direttore o a chi riporta), modello consigliato, frase di presentazione |
| Regole comuni | `00-common-rules.md` del reparto, uguale per tutti gli agenti del reparto |
| Ruolo | il file di ruolo |
| Biblioteca | come usarla e l'indice delle schede del reparto (le schede si leggono con `library`) |
| Compito | il compito passato ad `agent`; nelle misure è vuoto, perché lo scrive il modello |
| Resoconto e valutazione | la richiesta del tool `report` (con il pannello) e la proposta di valutazione (client senza moduli) |

## In sintesi

- **Un agente** pesa da 6,5 KB (AISA-02) a 9,1 KB (AICA-03) in italiano, da 6,4 KB (AISA-06) a 8,9 KB (AIWDA-01) in inglese, con resoconto e valutazione. Le regole comuni sono il componente più grande: dal 49 al 57% del testo, da 3,4 a 5,0 KB per reparto. Il file di ruolo vale in media da 0,6 KB (AISA) a 1,5 KB (AICA). La soglia dei 10 KB regge.
- **Il flusso di `orchestrazione-newsletter`** (la sequenza della prova di F34: AIBPD-01, AIWDA-01, AIPCA-01, AISA-01, AISA-06) restituisce 47,7 KB in italiano (circa 11.900 token stimati): istruzioni 2,7 KB, `list_agents` 8,5 KB, agenti 36,5 KB. Nei testi degli agenti le regole comuni sono 19,7 KB, il 54%.
- **La quota ripetuta** in questo flusso è 4,3 KB (12% del testo degli agenti): regole e indice della biblioteca di AISA, caricati con AISA-01 e di nuovo con AISA-06. Gli altri reparti compaiono una volta sola, perché la prova ha consultato solo i direttori. In un flusso con più specialisti dello stesso reparto la quota cresce di 4–5,7 KB per agente.
- **`list_agents`** pesa 8,5 KB con tutto il catalogo, più di ogni singolo agente; 1,2–1,9 KB con un reparto o una squadra di un reparto. La decisione «Roadmap consolidata» rinvia la selezione con metadati finché `list_agents` non supera una soglia misurata qui: la soglia resta da decidere (rilievo aperto di F40).
- **Istruzioni del server**: 2.625 caratteri su 4096 in italiano con pannello e valutazioni, 2.566 in inglese.
- **Una scheda della biblioteca**: da 0,9 a 2,3 KB, in media 1,1–1,6 KB per reparto.

## Confronto per F41 (deciso il 2026-11-25)

- **Byte**: lo stesso comando, prima e dopo, sul flusso di `orchestrazione-newsletter` e sugli agenti dei casi qui sotto, per componente.
- **Casi di qualità**, uno per reparto: `aibpd-05-requisiti-abbonamenti`, `aica-04-config-deploy`, `aipca-02-prenotazioni-palestra`, `aisa-09-api-fatture`, `aiwda-08-form-iscrizione`, più `orchestrazione-newsletter` per il flusso (criteri C1–C7).
- **Soglia**: quella di F24, sullo stesso modello e con la stessa configurazione prima e dopo: dopo la riduzione l'agente trova almeno i difetti di prima meno uno, non ha falsi in più e rispetta il formato dei rilievi.

Misure del 2026-11-25 con `npm run -s agent-text -- --sizes --date 2026-11-25`. Byte misurati (UTF-8); «~token» è una stima, byte / 4.

## Misure: Italiano

### Per agente (byte; resoconto e valutazione inclusi, senza compito)

| Agente | Totale | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD-01 | 8276 | 2069 | 1329 | 4246 | 1433 | 881 | 0 | 387 |
| AIBPD-02 | 8208 | 2052 | 1270 | 4246 | 1424 | 881 | 0 | 387 |
| AIBPD-03 | 8241 | 2060 | 1288 | 4246 | 1437 | 883 | 0 | 387 |
| AIBPD-04 | 8181 | 2045 | 1240 | 4246 | 1421 | 887 | 0 | 387 |
| AIBPD-05 | 8555 | 2139 | 1586 | 4246 | 1453 | 883 | 0 | 387 |
| AIBPD-06 | 8187 | 2047 | 1282 | 4246 | 1391 | 881 | 0 | 387 |
| AIBPD-07 | 8326 | 2082 | 1288 | 4246 | 1520 | 885 | 0 | 387 |
| AIBPD-08 | 8265 | 2066 | 1273 | 4246 | 1474 | 885 | 0 | 387 |
| AIBPD-09 | 8255 | 2064 | 1285 | 4246 | 1454 | 883 | 0 | 387 |
| AIBPD-10 | 8256 | 2064 | 1294 | 4246 | 1448 | 881 | 0 | 387 |
| AIBPD-11 | 8307 | 2077 | 1315 | 4246 | 1476 | 883 | 0 | 387 |
| AIBPD-12 | 8239 | 2060 | 1309 | 4246 | 1416 | 881 | 0 | 387 |
| AICA-01 | 8848 | 2212 | 1280 | 5041 | 1520 | 622 | 0 | 385 |
| AICA-02 | 8761 | 2190 | 1203 | 5041 | 1508 | 624 | 0 | 385 |
| AICA-03 | 9088 | 2272 | 1510 | 5041 | 1528 | 624 | 0 | 385 |
| AICA-04 | 9045 | 2261 | 1483 | 5041 | 1518 | 618 | 0 | 385 |
| AICA-05 | 9007 | 2252 | 1489 | 5041 | 1474 | 618 | 0 | 385 |
| AICA-06 | 8823 | 2206 | 1266 | 5041 | 1513 | 618 | 0 | 385 |
| AICA-07 | 9051 | 2263 | 1498 | 5041 | 1507 | 620 | 0 | 385 |
| AICA-08 | 8861 | 2215 | 1272 | 5041 | 1543 | 620 | 0 | 385 |
| AICA-09 | 9085 | 2271 | 1506 | 5041 | 1531 | 622 | 0 | 385 |
| AICA-10 | 8804 | 2201 | 1254 | 5041 | 1500 | 624 | 0 | 385 |
| AICA-11 | 8902 | 2226 | 1272 | 5041 | 1580 | 624 | 0 | 385 |
| AICA-12 | 8781 | 2195 | 1230 | 5041 | 1503 | 622 | 0 | 385 |
| AIPCA-01 | 7035 | 1759 | 1312 | 3505 | 1060 | 771 | 0 | 387 |
| AIPCA-02 | 7265 | 1816 | 1535 | 3505 | 1067 | 771 | 0 | 387 |
| AIPCA-03 | 6758 | 1690 | 1246 | 3505 | 849 | 771 | 0 | 387 |
| AIPCA-04 | 6916 | 1729 | 1276 | 3505 | 981 | 767 | 0 | 387 |
| AIPCA-05 | 7178 | 1795 | 1508 | 3505 | 1013 | 765 | 0 | 387 |
| AIPCA-06 | 7140 | 1785 | 1547 | 3505 | 936 | 765 | 0 | 387 |
| AIPCA-07 | 7199 | 1800 | 1559 | 3505 | 979 | 769 | 0 | 387 |
| AIPCA-08 | 7067 | 1767 | 1526 | 3505 | 882 | 767 | 0 | 387 |
| AIPCA-09 | 6974 | 1744 | 1303 | 3505 | 1014 | 765 | 0 | 387 |
| AIPCA-10 | 6812 | 1703 | 1255 | 3505 | 894 | 771 | 0 | 387 |
| AISA-01 | 6619 | 1655 | 1264 | 3643 | 674 | 653 | 0 | 385 |
| AISA-02 | 6509 | 1627 | 1198 | 3643 | 624 | 659 | 0 | 385 |
| AISA-03 | 6604 | 1651 | 1264 | 3643 | 659 | 653 | 0 | 385 |
| AISA-04 | 6536 | 1634 | 1198 | 3643 | 651 | 659 | 0 | 385 |
| AISA-05 | 6767 | 1692 | 1454 | 3643 | 630 | 655 | 0 | 385 |
| AISA-06 | 6510 | 1628 | 1204 | 3643 | 619 | 659 | 0 | 385 |
| AISA-07 | 6811 | 1703 | 1481 | 3643 | 649 | 653 | 0 | 385 |
| AISA-08 | 6820 | 1705 | 1486 | 3643 | 651 | 655 | 0 | 385 |
| AISA-09 | 6826 | 1707 | 1493 | 3643 | 650 | 655 | 0 | 385 |
| AISA-10 | 6822 | 1706 | 1499 | 3643 | 638 | 657 | 0 | 385 |
| AISA-11 | 6838 | 1710 | 1472 | 3643 | 683 | 655 | 0 | 385 |
| AISA-12 | 6617 | 1654 | 1270 | 3643 | 662 | 657 | 0 | 385 |
| AIWDA-01 | 9081 | 2270 | 1316 | 4666 | 2018 | 694 | 0 | 387 |
| AIWDA-02 | 8360 | 2090 | 1201 | 4666 | 1418 | 688 | 0 | 387 |
| AIWDA-03 | 8279 | 2070 | 1186 | 4666 | 1348 | 692 | 0 | 387 |
| AIWDA-04 | 8108 | 2027 | 1216 | 4666 | 1151 | 688 | 0 | 387 |
| AIWDA-05 | 8160 | 2040 | 1189 | 4666 | 1228 | 690 | 0 | 387 |
| AIWDA-06 | 8227 | 2057 | 1228 | 4666 | 1256 | 690 | 0 | 387 |
| AIWDA-07 | 8213 | 2053 | 1273 | 4666 | 1199 | 688 | 0 | 387 |
| AIWDA-08 | 8885 | 2221 | 1228 | 4666 | 1910 | 694 | 0 | 387 |
| AIWDA-09 | 8264 | 2066 | 1207 | 4666 | 1310 | 694 | 0 | 387 |
| AIWDA-10 | 8062 | 2016 | 1180 | 4666 | 1139 | 690 | 0 | 387 |

### Per reparto (media sugli agenti)

| Reparto | Agenti | Totale medio | ~token | Regole comuni | Quota delle regole | Ruolo medio | Biblioteca media |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD | 12 | 8275 | 2069 | 4246 | 51% | 1446 | 883 |
| AICA | 12 | 8921 | 2230 | 5041 | 57% | 1519 | 621 |
| AIPCA | 10 | 7034 | 1759 | 3505 | 50% | 968 | 768 |
| AISA | 12 | 6690 | 1673 | 3643 | 54% | 649 | 656 |
| AIWDA | 10 | 8364 | 2091 | 4666 | 56% | 1398 | 691 |

### Flusso di orchestrazione-newsletter (pannello sì, valutazione con il modulo, senza compito)

| Testo | Byte | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione | Ripetuto |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Istruzioni del server | 2658 | 665 |  |  |  |  |  |  |  |
| list_agents | 8545 | 2136 |  |  |  |  |  |  |  |
| agent AIBPD-01 | 8066 | 2017 | 1329 | 4246 | 1433 | 881 | 0 | 177 | 0 |
| agent AIWDA-01 | 8871 | 2218 | 1316 | 4666 | 2018 | 694 | 0 | 177 | 0 |
| agent AIPCA-01 | 6825 | 1706 | 1312 | 3505 | 1060 | 771 | 0 | 177 | 0 |
| agent AISA-01 | 6410 | 1603 | 1264 | 3643 | 674 | 653 | 0 | 176 | 0 |
| agent AISA-06 | 6301 | 1575 | 1204 | 3643 | 619 | 659 | 0 | 176 | 4302 |
| **Totale** | 47676 | 11919 | 6425 | 19703 | 5804 | 3658 | 0 | 883 | 4302 |

Testo degli agenti nel flusso: 36473 byte, di cui regole comuni 19703 (54%) e ripetuti 4302 (12%: regole e biblioteca di un reparto già caricato). Le schede lette con `library` dipendono dal modello e non sono contate.

### Altri testi del server

| Testo | Byte | ~token | Nota |
| --- | ---: | ---: | ---: |
| Istruzioni, pannello e valutazioni | 2658 | 665 | 2625 caratteri su 4096 |
| Istruzioni, senza pannello né valutazioni | 1867 | 467 | 1838 caratteri su 4096 |
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

## Misure: Inglese

### Per agente (byte; resoconto e valutazione inclusi, senza compito)

| Agente | Totale | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD-01 | 8100 | 2025 | 1347 | 4109 | 1337 | 931 | 0 | 376 |
| AIBPD-02 | 8026 | 2007 | 1279 | 4109 | 1331 | 931 | 0 | 376 |
| AIBPD-03 | 8075 | 2019 | 1297 | 4109 | 1360 | 933 | 0 | 376 |
| AIBPD-04 | 8011 | 2003 | 1249 | 4109 | 1340 | 937 | 0 | 376 |
| AIBPD-05 | 8350 | 2088 | 1580 | 4109 | 1352 | 933 | 0 | 376 |
| AIBPD-06 | 8026 | 2007 | 1291 | 4109 | 1319 | 931 | 0 | 376 |
| AIBPD-07 | 8117 | 2029 | 1297 | 4109 | 1400 | 935 | 0 | 376 |
| AIBPD-08 | 8045 | 2011 | 1282 | 4109 | 1343 | 935 | 0 | 376 |
| AIBPD-09 | 8042 | 2011 | 1294 | 4109 | 1330 | 933 | 0 | 376 |
| AIBPD-10 | 8048 | 2012 | 1303 | 4109 | 1329 | 931 | 0 | 376 |
| AIBPD-11 | 8069 | 2017 | 1324 | 4109 | 1327 | 933 | 0 | 376 |
| AIBPD-12 | 8056 | 2014 | 1318 | 4109 | 1322 | 931 | 0 | 376 |
| AICA-01 | 8466 | 2117 | 1298 | 4762 | 1400 | 632 | 0 | 374 |
| AICA-02 | 8378 | 2095 | 1212 | 4762 | 1396 | 634 | 0 | 374 |
| AICA-03 | 8662 | 2166 | 1504 | 4762 | 1388 | 634 | 0 | 374 |
| AICA-04 | 8626 | 2157 | 1477 | 4762 | 1385 | 628 | 0 | 374 |
| AICA-05 | 8612 | 2153 | 1483 | 4762 | 1365 | 628 | 0 | 374 |
| AICA-06 | 8436 | 2109 | 1275 | 4762 | 1397 | 628 | 0 | 374 |
| AICA-07 | 8633 | 2158 | 1492 | 4762 | 1375 | 630 | 0 | 374 |
| AICA-08 | 8466 | 2117 | 1281 | 4762 | 1419 | 630 | 0 | 374 |
| AICA-09 | 8685 | 2171 | 1500 | 4762 | 1417 | 632 | 0 | 374 |
| AICA-10 | 8422 | 2106 | 1263 | 4762 | 1389 | 634 | 0 | 374 |
| AICA-11 | 8511 | 2128 | 1281 | 4762 | 1460 | 634 | 0 | 374 |
| AICA-12 | 8388 | 2097 | 1239 | 4762 | 1381 | 632 | 0 | 374 |
| AIPCA-01 | 6877 | 1719 | 1330 | 3388 | 1020 | 763 | 0 | 376 |
| AIPCA-02 | 7070 | 1768 | 1529 | 3388 | 1014 | 763 | 0 | 376 |
| AIPCA-03 | 6639 | 1660 | 1255 | 3388 | 857 | 763 | 0 | 376 |
| AIPCA-04 | 6695 | 1674 | 1285 | 3388 | 887 | 759 | 0 | 376 |
| AIPCA-05 | 6984 | 1746 | 1502 | 3388 | 961 | 757 | 0 | 376 |
| AIPCA-06 | 6953 | 1738 | 1541 | 3388 | 891 | 757 | 0 | 376 |
| AIPCA-07 | 7012 | 1753 | 1553 | 3388 | 934 | 761 | 0 | 376 |
| AIPCA-08 | 6902 | 1726 | 1520 | 3388 | 859 | 759 | 0 | 376 |
| AIPCA-09 | 6808 | 1702 | 1312 | 3388 | 975 | 757 | 0 | 376 |
| AIPCA-10 | 6674 | 1669 | 1264 | 3388 | 883 | 763 | 0 | 376 |
| AISA-01 | 6490 | 1623 | 1282 | 3494 | 668 | 672 | 0 | 374 |
| AISA-02 | 6386 | 1597 | 1207 | 3494 | 633 | 678 | 0 | 374 |
| AISA-03 | 6477 | 1619 | 1273 | 3494 | 664 | 672 | 0 | 374 |
| AISA-04 | 6393 | 1598 | 1207 | 3494 | 640 | 678 | 0 | 374 |
| AISA-05 | 6625 | 1656 | 1448 | 3494 | 635 | 674 | 0 | 374 |
| AISA-06 | 6380 | 1595 | 1213 | 3494 | 621 | 678 | 0 | 374 |
| AISA-07 | 6671 | 1668 | 1475 | 3494 | 656 | 672 | 0 | 374 |
| AISA-08 | 6664 | 1666 | 1480 | 3494 | 642 | 674 | 0 | 374 |
| AISA-09 | 6661 | 1665 | 1487 | 3494 | 632 | 674 | 0 | 374 |
| AISA-10 | 6661 | 1665 | 1493 | 3494 | 624 | 676 | 0 | 374 |
| AISA-11 | 6632 | 1658 | 1466 | 3494 | 624 | 674 | 0 | 374 |
| AISA-12 | 6474 | 1619 | 1279 | 3494 | 651 | 676 | 0 | 374 |
| AIWDA-01 | 8879 | 2220 | 1334 | 4476 | 1977 | 716 | 0 | 376 |
| AIWDA-02 | 8109 | 2027 | 1210 | 4476 | 1337 | 710 | 0 | 376 |
| AIWDA-03 | 8034 | 2009 | 1195 | 4476 | 1273 | 714 | 0 | 376 |
| AIWDA-04 | 7911 | 1978 | 1225 | 4476 | 1124 | 710 | 0 | 376 |
| AIWDA-05 | 7967 | 1992 | 1198 | 4476 | 1205 | 712 | 0 | 376 |
| AIWDA-06 | 8000 | 2000 | 1237 | 4476 | 1199 | 712 | 0 | 376 |
| AIWDA-07 | 7997 | 1999 | 1282 | 4476 | 1153 | 710 | 0 | 376 |
| AIWDA-08 | 8608 | 2152 | 1237 | 4476 | 1803 | 716 | 0 | 376 |
| AIWDA-09 | 8029 | 2007 | 1216 | 4476 | 1245 | 716 | 0 | 376 |
| AIWDA-10 | 7834 | 1959 | 1189 | 4476 | 1081 | 712 | 0 | 376 |

### Per reparto (media sugli agenti)

| Reparto | Agenti | Totale medio | ~token | Regole comuni | Quota delle regole | Ruolo medio | Biblioteca media |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| AIBPD | 12 | 8080 | 2020 | 4109 | 51% | 1341 | 933 |
| AICA | 12 | 8524 | 2131 | 4762 | 56% | 1398 | 631 |
| AIPCA | 10 | 6861 | 1715 | 3388 | 49% | 928 | 760 |
| AISA | 12 | 6543 | 1636 | 3494 | 53% | 641 | 675 |
| AIWDA | 10 | 8137 | 2034 | 4476 | 55% | 1340 | 713 |

### Flusso di orchestrazione-newsletter (pannello sì, valutazione con il modulo, senza compito)

| Testo | Byte | ~token | Cornice | Regole comuni | Ruolo | Biblioteca | Compito | Resoconto e valutazione | Ripetuto |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Istruzioni del server | 2590 | 648 |  |  |  |  |  |  |  |
| list_agents | 8676 | 2169 |  |  |  |  |  |  |  |
| agent AIBPD-01 | 7900 | 1975 | 1347 | 4109 | 1337 | 931 | 0 | 176 | 0 |
| agent AIWDA-01 | 8679 | 2170 | 1334 | 4476 | 1977 | 716 | 0 | 176 | 0 |
| agent AIPCA-01 | 6677 | 1669 | 1330 | 3388 | 1020 | 763 | 0 | 176 | 0 |
| agent AISA-01 | 6291 | 1573 | 1282 | 3494 | 668 | 672 | 0 | 175 | 0 |
| agent AISA-06 | 6181 | 1545 | 1213 | 3494 | 621 | 678 | 0 | 175 | 4172 |
| **Totale** | 46994 | 11749 | 6506 | 18961 | 5623 | 3760 | 0 | 878 | 4172 |

Testo degli agenti nel flusso: 35728 byte, di cui regole comuni 18961 (53%) e ripetuti 4172 (12%: regole e biblioteca di un reparto già caricato). Le schede lette con `library` dipendono dal modello e non sono contate.

### Altri testi del server

| Testo | Byte | ~token | Nota |
| --- | ---: | ---: | ---: |
| Istruzioni, pannello e valutazioni | 2590 | 648 | 2566 caratteri su 4096 |
| Istruzioni, senza pannello né valutazioni | 1850 | 463 | 1826 caratteri su 4096 |
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
