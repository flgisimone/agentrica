// Sessioni con cookie e chiave dell'amministrazione.
import { timingSafeEqual } from "node:crypto";
import { hashPassword, users } from "./store.js";

const sessions = new Map();
const SESSION_MS = 8 * 60 * 60 * 1000;

function newToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function login(email, password) {
  const user = users.find((u) => u.email === email);
  if (!user) return { error: "Utente inesistente" };
  if (user.passwordHash !== hashPassword(password)) return { error: "Password errata" };
  const token = newToken();
  sessions.set(token, { userId: user.id, expires: Date.now() + SESSION_MS });
  return { token, cookie: `sid=${token}; Path=/; Max-Age=${SESSION_MS / 1000}` };
}

export function logout(token) {
  sessions.delete(token);
}

export function currentUser(req) {
  const token = /(?:^|;\s*)sid=([^;]+)/.exec(req.headers.cookie ?? "")?.[1];
  const session = token && sessions.get(token);
  if (!session || session.expires < Date.now()) return null;
  return { token, user: users.find((u) => u.id === session.userId) };
}

export function isAdmin(req) {
  const expected = Buffer.from(process.env.ADMIN_KEY ?? "");
  const given = Buffer.from(String(req.headers["x-admin-key"] ?? ""));
  return expected.length > 0 && given.length === expected.length && timingSafeEqual(given, expected);
}
