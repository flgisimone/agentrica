const crypto = require("crypto");
const storage = require("./storage");
const db = require("./db");
const config = require("../config/default.json");

const KEY = Buffer.from(config.documents.encryptionKey, "base64");

// Scansione del documento del genitore, cifrata con AES-256-GCM nello storage.
async function download(req, res) {
  const payer = await db.one("SELECT documento_key FROM payers WHERE id = $1", [req.params.id]);
  if (!payer || !payer.documento_key) return res.sendStatus(404);
  const blob = await storage.get(payer.documento_key);
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", KEY, iv);
  decipher.setAuthTag(tag);
  const data = Buffer.concat([decipher.update(blob.subarray(28)), decipher.final()]);
  await db.query("INSERT INTO audit_log (actor_id, action, target) VALUES ($1, 'document_view', $2)", [req.session.user.id, `payer:${req.params.id}`]);
  res.type("application/pdf").send(data);
}

module.exports = { download };
