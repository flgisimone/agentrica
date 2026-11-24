const db = require("./db");

// Il token di sessione arriva nell'intestazione Authorization; la tabella sessions è gestita dal login.
async function requireUser(req, res, next) {
  const token = (req.get("authorization") || "").replace(/^Bearer /, "");
  const { rows } = await db.query("SELECT u.id, u.role, u.customer_id FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1 AND s.expires_at > now()", [token]);
  if (!rows[0]) return res.status(401).json({ error: "non autenticato" });
  req.user = rows[0];
  next();
}

const requireRole = (...roles) => (req, res, next) => (roles.includes(req.user.role) ? next() : res.status(403).json({ error: "non permesso" }));

module.exports = { requireUser, requireRole };
