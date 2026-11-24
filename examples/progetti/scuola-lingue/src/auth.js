const argon2 = require("argon2");
const db = require("./db");
const analytics = require("./analytics");
const notifications = require("./notifications");

async function login(req, res) {
  const user = await db.one("SELECT id, email, role, password_hash FROM users WHERE email = $1 AND deleted_at IS NULL", [req.body.email]);
  if (!user || !(await argon2.verify(user.password_hash, req.body.password))) return res.status(401).json({ error: "credenziali non valide" });
  req.session.regenerate(() => {
    req.session.user = { id: user.id, role: user.role };
    analytics.track({ userId: user.email, event: "login" });
    res.json({ ok: true });
  });
}

async function signup(req, res) {
  const { email, password, nome, cognome, data_nascita, telefono, note_salute, newsletter } = req.body;
  const hash = await argon2.hash(password, { type: argon2.argon2id });
  const user = await db.one(
    "INSERT INTO users (email, password_hash, role, newsletter, marketing_consent, marketing_consent_at) VALUES ($1, $2, 'student', $3, $3, CASE WHEN $3 THEN now() END) RETURNING id",
    [email, hash, Boolean(newsletter)],
  );
  await db.query(
    "INSERT INTO students (user_id, nome, cognome, data_nascita, telefono, note_salute, school_id) VALUES ($1, $2, $3, $4, $5, $6, 1)",
    [user.id, nome, cognome, data_nascita, telefono, note_salute || null],
  );
  analytics.track({ userId: email, event: "signup", props: { newsletter: Boolean(newsletter) } });
  if (telefono) await notifications.sms(telefono, "Benvenuto in Parla Subito! La tua prima lezione ti aspetta.");
  res.status(201).json({ id: user.id });
}

module.exports = { login, signup };
