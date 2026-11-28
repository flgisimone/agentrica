// `npm run ratings` (F20-08, F21-06): riepilogo, anomalie e moderazione delle valutazioni degli agenti.
// Il riepilogo usa il ruolo in sola lettura (DATABASE_URL_READONLY); la moderazione il ruolo ratings_moderator
// (DATABASE_URL_MODERATOR), che legge `ratings` e cambia le righe solo con moderate_rating. Le stringhe stanno
// nell'ambiente, mai nel repository. Le valutazioni sono anonime e restano qui: lo script le stampa e non le salva.
import { createInterface } from "node:readline/promises";
import { neon } from "@neondatabase/serverless";
import {
  findAnomalies,
  formatAnomalies,
  formatSummary,
  parseCommand,
  resultMessage,
  summarize,
  USAGE,
  type RatingRow,
} from "./ratings-lib.ts";

function connect(variable: "DATABASE_URL_READONLY" | "DATABASE_URL_MODERATOR") {
  const url = process.env[variable];
  if (!url) {
    console.error(`Manca ${variable}: la stringa di connessione del ruolo ${variable === "DATABASE_URL_READONLY" ? "in sola lettura" : "ratings_moderator"} (aigentrica-site/db/README.md).`);
    process.exit(1);
  }
  return neon(url);
}

const iso = (value: Date | string) => (value instanceof Date ? value.toISOString() : value);
const command = parseCommand(process.argv.slice(2));

if (command.kind === "usage") {
  for (const line of USAGE) console.error(line);
  process.exit(1);
}

if (command.kind === "summary") {
  const sql = connect("DATABASE_URL_READONLY");
  const rows = (await sql`select usage_id, agent_id, rating, comment, mcp_version, created_at, publish_consent,
    comment_status, excluded from ratings`) as (Omit<RatingRow, "created_at"> & { created_at: Date | string })[];
  const data: RatingRow[] = rows.map((r) => ({ ...r, comment: r.comment ?? "", created_at: iso(r.created_at) }));
  for (const line of [...formatSummary(summarize(data)), ...formatAnomalies(findAnomalies(data))]) console.log(line);
}

if (command.kind === "action") {
  const sql = connect("DATABASE_URL_MODERATOR");
  if (command.action === "delete") {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`Cancellare per sempre la valutazione ${command.usageId}? (s/n) `);
    rl.close();
    if (answer.trim().toLowerCase() !== "s") process.exit(0);
  }
  const [row] = await sql`select moderate_rating(${command.usageId}::uuid, ${command.action}) as result`;
  console.log(resultMessage(row?.result));
}

if (command.kind === "moderate") {
  const sql = connect("DATABASE_URL_MODERATOR");
  const pending = (await sql`select usage_id, agent_id, rating, comment, created_at from ratings
    where publish_consent and comment_status = 'pending' and not excluded and comment <> ''
    order by created_at`) as { usage_id: string; agent_id: string; rating: number; comment: string; created_at: Date | string }[];
  if (pending.length === 0) {
    console.log("Nessun commento in attesa.");
    process.exit(0);
  }
  console.log(`${pending.length} commenti in attesa. Criteri (note legali, #valutazioni): si approva solo se parla dell'agente e del`);
  console.log("suo lavoro; si rifiuta con nomi o dati di persone, codice, percorsi o dettagli di un progetto, link, offese, pubblicità,");
  console.log("o testo che sembra scritto da un file del progetto. Nel dubbio si rifiuta. Il testo non si corregge.");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  for (const [i, r] of pending.entries()) {
    console.log(`\n[${i + 1}/${pending.length}] ${r.agent_id} · ${r.rating}★ · ${iso(r.created_at).slice(0, 10)} · ${r.usage_id}`);
    console.log(r.comment);
    const answer = (await rl.question("a approva · r rifiuta · s salta · q esci: ")).trim().toLowerCase();
    if (answer === "q") break;
    if (answer !== "a" && answer !== "r") continue;
    const [row] = await sql`select moderate_rating(${r.usage_id}::uuid, ${answer === "a" ? "approve" : "reject"}) as result`;
    console.log(resultMessage(row?.result));
  }
  rl.close();
}
