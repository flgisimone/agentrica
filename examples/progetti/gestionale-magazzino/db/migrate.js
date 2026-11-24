// Applica in ordine le migrazioni non ancora applicate (tabella schema_migrations).
const fs = require("fs");
const path = require("path");
const { pool } = require("../server/db");

async function main() {
  await pool.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
  const dir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql")).sort();
  for (const f of files) {
    const { rows } = await pool.query("SELECT 1 FROM schema_migrations WHERE name = $1", [f]);
    if (rows[0]) continue;
    await pool.query(fs.readFileSync(path.join(dir, f), "utf8"));
    await pool.query("INSERT INTO schema_migrations (name) VALUES ($1)", [f]);
    console.log(`applicata ${f}`);
  }
  await pool.end();
}

main();
