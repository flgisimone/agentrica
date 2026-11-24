const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const mail = require("./mail");

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_COST = 12;

async function login(req, res) {
  const { email, password } = req.body;
  const user = await db.one("SELECT id, email, role, password_hash FROM users WHERE email = $1 AND active", [email]);
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    req.log.info({ event: "login_failed", user: email }, "login failed");
    return res.status(401).json({ error: "credenziali non valide" });
  }
  req.log.info({ event: "login_success", user: email }, "login ok");
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { algorithm: "HS256", expiresIn: "8h" });
  const next = typeof req.body.next === "string" && req.body.next.startsWith("/") ? req.body.next : "/";
  res.json({ token, redirect: next });
}

async function forgotPassword(req, res) {
  const user = await db.one("SELECT id, email FROM users WHERE email = $1", [req.body.email]);
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await db.query("INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)", [user.id, token, expiresAt]);
    await mail.send(user.email, "Reimposta la password", `https://ordini.ferramentanord.example/reset?token=${token}`);
  }
  res.json({ ok: true });
}

async function resetPassword(req, res) {
  const reset = await db.one("SELECT user_id, expires_at FROM password_resets WHERE token = $1", [req.body.token]);
  if (!reset) return res.status(400).json({ error: "link non valido" });
  const hash = await bcrypt.hash(req.body.password, BCRYPT_COST);
  await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, reset.user_id]);
  res.json({ ok: true });
}

function requireUser(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  try {
    req.user = jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    res.status(401).json({ error: "non autenticato" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "customer") return next();
  res.status(403).json({ error: "riservato agli amministratori" });
}

async function listUsers(req, res) {
  res.json(await db.many("SELECT id, email, role, active, last_login FROM users ORDER BY id"));
}

async function setRole(req, res) {
  const roles = ["customer", "operator", "auditor", "admin"];
  if (!roles.includes(req.body.role)) return res.status(400).json({ error: "ruolo non valido" });
  await db.query("UPDATE users SET role = $1 WHERE id = $2", [req.body.role, req.params.id]);
  res.json({ ok: true });
}

function sameApiKey(given, expected) {
  const a = Buffer.from(given || "");
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { login, forgotPassword, resetPassword, requireUser, requireAdmin, listUsers, setRole, sameApiKey };
