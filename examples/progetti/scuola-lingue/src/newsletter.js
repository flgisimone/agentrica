const db = require("./db");
const mailorbit = require("./vendors/mailorbit");

// Link «disiscriviti» in fondo a ogni newsletter.
async function unsubscribe(req, res) {
  const user = await db.one("SELECT id FROM users WHERE email = $1", [req.query.email]);
  if (user) await db.query("UPDATE users SET newsletter = false WHERE id = $1", [user.id]);
  res.send("Non riceverai più la newsletter.");
}

// Ogni notte: la lista di Mailorbit si allinea al database.
async function nightlySync() {
  const rows = await db.many("SELECT email, nome FROM users u JOIN students s ON s.user_id = u.id WHERE u.marketing_consent AND u.deleted_at IS NULL");
  await mailorbit.upsertList("parla-subito-news", rows);
}

module.exports = { unsubscribe, nightlySync };
