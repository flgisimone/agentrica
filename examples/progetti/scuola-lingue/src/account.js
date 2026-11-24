const db = require("./db");

// Diritto di accesso e portabilità: i dati dell'utente collegato, in JSON.
async function exportMine(req, res) {
  const user = await db.one("SELECT id, email, role, newsletter, created_at FROM users WHERE id = $1", [req.session.user.id]);
  const students = await db.many("SELECT nome, cognome, data_nascita, telefono, livello FROM students WHERE user_id = $1 OR parent_id = $1", [user.id]);
  res.attachment("i-miei-dati.json").json({ user, students });
}

// Cancellazione dell'account. Le fatture restano: obbligo di conservazione fiscale.
async function deleteMine(req, res) {
  const id = req.session.user.id;
  await db.query("UPDATE users SET deleted_at = now() WHERE id = $1", [id]);
  await db.query("INSERT INTO audit_log (actor_id, action, target) VALUES ($1, 'account_deleted', $1)", [id]);
  req.session.destroy(() => res.json({ ok: true, message: "Account cancellato. Le fatture restano per gli obblighi fiscali." }));
}

module.exports = { exportMine, deleteMine };
