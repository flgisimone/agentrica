AISA-06 · POLLUX — Senior Full Stack Developer, reparto AISA (AI Software)

Two notes before the review:
- The instructions say I should load AISA-01 · SIRIUS first and report to them. The `agent` tool isn't available in this run, so this report is the hand-off for the director to consolidate. For the library I used `npm run -s agent-text -- aisa-06 --cards nodejs-calendario`, as you told me to.
- This was read-only: I changed no files. I read everything under `funzioni/resi/`, plus `richieste/resi.md`, `README.md`, `server/`, `db/`, `web/`, `Dockerfile` and `ci.yml`. I ran no tests, because the project has none and no database is set up. The folder is not a git repository, so I couldn't check git status.

All paths below are relative to `/private/tmp/claude-501/-Users-flgisimone-Desktop-lavoro-agentrica/1b8e243c-033a-4357-b227-0a46d80b6791/scratchpad/ondata4/copie/aisa-06-2/`.

## Outcome
**The returns feature is not ready to merge.** As written it doesn't work at all: the form always gets a 400 back. Fixing only that field would expose two serious flaws:
- A shop can open returns on other shops' orders, push stock up as high as it likes and set its own refund amount.
- The return note is shown without escaping, so it can inject code into the warehouse staff's page.

The request document itself has requirements that contradict each other. Those need a decision before any fix.

## Findings

### P1
1. **The form always fails.** `funzioni/resi/web/resi.html:19` names the field `name="qty"`. The server reads `req.body.quantity` at `funzioni/resi/server/returns.js:27`, so `Number(undefined)` is NaN and every submit gets "quantità non valida" (`returns.js:28`).
2. **A shop can return goods from someone else's order.** `returns.js:30-33` only checks that the line belongs to `orderId`. It never checks that `orders.customer_id = req.user.customer_id`, and there is no `requireRole` on the POST. Any logged-in user can open returns on any order, which raises stock (and later refunds). The GET (`returns.js:11-14`) filters by shop, the POST doesn't. This breaks R1 ("un suo ordine").
3. **The quantity has no limits.** `returns.js:28` only checks that it is a whole number. So 0 and negative values pass, and a negative quantity lowers stock through `returns.js:44`. A quantity above the ordered `order_items.quantity` also passes, and repeated returns on the same line are never added up. The value read at line 31 is never used.
4. **The refund amount is whatever the shop sends.** `returns.js:26,38` saves `amount` from the body as-is: no number check, no sign check, no ceiling, any type. That goes against R5 and the criterion "Nessun errore nelle fatture". The page also has no `min` on the field (`resi.html:21`).
5. **Stored XSS against the warehouse.** `funzioni/resi/web/resi.js:10-11` builds the list with `innerHTML`, inserting `r.note` written by the shop. The warehouse sees every return, so a shop can run code in an operator's page. The session token is in `sessionStorage` (`resi.js:1`), so the script can steal it.
6. **Bad input or a database error can bring the server down.** The handlers in `returns.js:8,25,50` are `async` with no `try/catch` or `next(err)`. Express 4.21.2 (`package.json:13`) doesn't catch rejected promises, so a non-numeric `orderId` or `id` that makes Postgres fail leaves an unhandled rejection. On Node 22 (`Dockerfile:1`) that can stop the process. That last part is my own knowledge, not a library card (see the notes at the end). `orders.js:46-56` already shows the right pattern.
7. **Opening a return and updating stock are not one atomic step.**
   - `returns.js:37-44` runs the INSERT, then SELECT stock, then UPDATE `stock = stock_letto + quantity`, as separate queries outside a transaction, through the pool (`server/db.js:5`).
   - With two replicas (README:8), returns and orders running at the same time overwrite each other's stock updates.
   - If the UPDATE fails, the return already exists and stock stays wrong.
   - `product[0]` is not checked.
   - A single `UPDATE ... SET stock = stock + $1` inside `BEGIN/COMMIT` with a client from `pool.connect()` would fix this.
8. **Any order in any state can be returned.** There is no check on the order's state or date. Orders that are `cancelled` or `pending_payment`, never shipped, can be returned and still add stock. The "within a few days of delivery" limit in R1 is not implemented. The schema also has no delivery date: `orders` only has `status` up to `shipped` and `paid_at` (`db/migrations/002_orders.sql:5-7`).

### P2
9. **The migration is weak** (`funzioni/resi/db/005_returns.sql`):
   - `order_item_id` has no FK to `order_items(id)` (line 5).
   - `quantity` has no `CHECK (quantity > 0)` (line 6).
   - `amount real` (line 7) uses floating point for money, while `orders.total` and `invoices.amount` are `numeric(12,2)`.
   - `status` has no CHECK on its allowed values and defaults to `'accepted'` (line 8), so there is no state machine.
   - There is no column for the user who opened or corrected the return, and no index on `order_item_id`.
10. **The PATCH that corrects the amount** (`returns.js:50-55`):
    - `Number("")` and `Number(null)` give 0, so an empty field sets the amount to zero.
    - There is no ceiling against the line value.
    - A missing `id` still gets 204 back, with no 404.
    - It doesn't look at the return's state, and doesn't record who changed it or the old value.
    - Amounts that have already been accepted can be changed, with nothing feeding through to the invoice.
11. **R4 and R6 are not implemented.**
    - The page has no correction view for the warehouse (`resi.html`, `resi.js`). The heading "I tuoi resi" (`resi.html:28`) is the same for every role.
    - No code touches `invoices` (R6).
12. **The feature isn't wired into the app or the build.**
    - The router is not mounted in `server/app.js:10-13`.
    - `005_returns.sql` is outside `db/migrations/`, which is the only folder `db/migrate.js:8` reads.
    - The `Dockerfile:11-13` copies only `server`, `web` and `db`, so `funzioni/` isn't in the image.
    - The page is not under `web/`, so it isn't served (`server/app.js:8`). No link reaches it from `web/index.html`.
    - The `../../../server/db` paths (`returns.js:2-3`) will need changing when the files are moved.
13. **No tests.** There are no test files, and `npm test` (`node --test`) finds nothing. The critical paths have no coverage: ownership, quantity limits, stock, amount.
14. **The page doesn't handle errors.**
    - `resi.js:8-12` calls `rows.map` without checking `res.ok`, so a 401 or 500 breaks the list.
    - `resi.js:28` fails if the error body isn't JSON.
    - The submit has no loading state and the button isn't disabled, so a double click can open two returns.
    - The amount isn't formatted in euros, unlike `web/app.js:3`.
15. **The flow isn't "semplice e veloce".** The shop has to type the order ID and the order line ID by hand (`resi.html:15,17`). Nothing on the page tells it those IDs. It should pick from its own orders and lines instead.

### P3
16. GET (`returns.js:16`) doesn't return `order_item_id` or the product, so the list doesn't say what was returned. There is a fixed `LIMIT 200` with no pagination.
17. `resi.html:7` uses `/style.css` (absolute) and `resi.html:31` uses `resi.js` (relative). That works only if both end up in `web/`.

## Problems in the request (`richieste/resi.md`), to settle with the user before any fix
- **R2 and R5 contradict each other.** R2 has the shop state the amount, R5 has it calculated from line price × quantity. The calculated amount is the safer choice; the decision is the user's.
- **R3 and R4 conflict.** R3 accepts the return and puts goods back in stock right away, but R4 lets the warehouse correct it afterwards. There is no review step.
- **Damaged goods go back on sale.** The context mentions "frutta rovinata", and R3 returns it to sellable stock without anyone checking it.
- **R6 needs a decision.** Changing the original invoice clashes with "Nessun errore nelle fatture". Adjustments are usually made with a separate document such as a credit note. This is for the administration or the accountant to decide; I'm not giving a tax opinion.
- **R1's "pochi giorni" is not a number**, and there is no delivery date in the schema to measure it from.
- **The acceptance criteria can't be checked.** "semplice e veloce", "gestiti correttamente" and "nessun errore" need measurable criteria.
- **Nothing says how the money is refunded** (payment provider, credit). The business and functional analysis roles should look at this.

## Open questions for SIRIUS and the user
1. Who decides the amount (R2 or R5)? Should the return have states (open → checked → accepted/rejected)?
2. How many days is "pochi giorni", counted from what, and how is delivery recorded?
3. Do returned goods go back to sellable stock, or are they set aside?
4. Is the invoice adjusted by a credit note or by editing the original?
5. Since the main items are security-related, should the Security Engineer review the fix to the shop ownership check and the XSS?

## Notes on sources
- Card `nodejs-calendario` (Node.js, documentation and releases, v22/v24/v26 LTS, checked 2026-11-19): Node 22 is still LTS, so the version in the `Dockerfile` and CI is supported.
- How Node 22 handles unhandled rejections, and how Express 4 handles errors in async handlers, are not in the library. They come from my own knowledge and I couldn't check them on the web, so they may be out of date.

Signed: AISA-06 · POLLUX
