const db = require("./db");
const retention = require("../config/retention.json");

// Job notturno di conservazione.
async function run() {
  // Registrazioni delle lezioni: 30 giorni
  await db.query("DELETE FROM recordings WHERE created_at < now() - make_interval(days => $1)", [retention.recordings_days]);
  // Log applicativi: 90 giorni
  await db.query("DELETE FROM audit_log WHERE at < now() - make_interval(days => $1)", [retention.audit_log_days]);
  // Messaggi alla segreteria: 12 mesi
  await db.query("DELETE FROM messages WHERE created_at < now() - make_interval(days => $1)", [retention.messages_days]);
}

module.exports = { run };
