// `npm run ratings` (F20-08): media, voti e commenti per agente e per versione, dal database delle valutazioni.
// Usa il ruolo in sola lettura: DATABASE_URL_READONLY nell'ambiente, mai nel repository.
// Le valutazioni sono anonime e restano qui: lo script le stampa nel terminale e non le salva.
import { neon } from "@neondatabase/serverless";
import { formatSummary, summarize, type RatingRow } from "./ratings-lib.ts";

const url = process.env.DATABASE_URL_READONLY;
if (!url) {
  console.error("Manca DATABASE_URL_READONLY: la stringa di connessione del ruolo in sola lettura del database delle valutazioni.");
  process.exit(1);
}

const sql = neon(url);
const rows = (await sql`select agent_id, rating, comment, mcp_version, created_at from ratings`) as {
  agent_id: string;
  rating: number;
  comment: string | null;
  mcp_version: string;
  created_at: Date | string;
}[];

const data: RatingRow[] = rows.map((r) => ({
  ...r,
  comment: r.comment ?? "",
  created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
}));
for (const line of formatSummary(summarize(data))) console.log(line);
