const fs = require("fs/promises");
const path = require("path");
const multipart = require("multipart-lite");
const db = require("./db");

const UPLOAD_DIR = "/srv/uploads";
const ALLOWED = ["application/pdf", "image/png", "image/jpeg"];
const MAX_BYTES = 10 * 1024 * 1024;

async function save(req, res) {
  const file = await multipart.single(req, { maxBytes: MAX_BYTES });
  if (!file) return res.status(400).json({ error: "file mancante" });
  if (!ALLOWED.includes(file.contentType)) return res.status(415).json({ error: "tipo non ammesso" });
  const name = `${req.user.sub}-${Date.now()}-${file.filename}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), file.data);
  await db.query("INSERT INTO files (owner_id, name) VALUES ($1, $2)", [req.user.sub, name]);
  res.status(201).json({ url: `/files/${encodeURIComponent(name)}` });
}

async function download(req, res) {
  const name = req.params.name;
  const row = await db.one("SELECT owner_id FROM files WHERE name = $1", [name]);
  if (!row || (req.user.role === "customer" && row.owner_id !== req.user.sub)) return res.status(404).end();
  res.sendFile(path.join(UPLOAD_DIR, name));
}

module.exports = { save, download };
