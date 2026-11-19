# Node.js: versioni supportate e nuovo calendario

Fonte: nodejs · Versione: v22, v24, v26 LTS; v27 alpha · Verificata il: 2026-11-19 · Da ricontrollare entro: 2027-02-19 · Ruoli: AISA-02, AISA-04, AISA-06, AISA-10, AISA-11

## Nozione
Al 19 novembre 2026 le versioni di Node.js in LTS sono la 26 (Lithium), la 24 (Krypton) e la 22 (Jod); la 20 e la 25 sono a fine vita; la 27 è in alpha dal 29 ottobre 2026. Le versioni LTS ricevono correzioni critiche per circa trenta mesi in tutto.

Il calendario cambia con la 27: fino alla 26 le versioni dispari uscivano dal supporto dopo sei mesi e le pari diventavano LTS; dalla 27 esce una versione principale all'anno, con sei mesi di alpha e sei di Current, e ognuna diventa LTS.

## Come si applica
- Per la produzione consiglia una versione LTS; per un progetto nuovo la LTS più recente supportata dalle dipendenze.
- Segnala engines, .nvmrc o immagini di CI ancora sulla 20 o su una dispari a fine vita (25).
- Non applicare alla 27 e successive la regola «le dispari non sono LTS»: vale solo fino alla 26.
- Le date di fine supporto delle singole versioni vanno lette sulla fonte quando servono: cambiano con il calendario.
