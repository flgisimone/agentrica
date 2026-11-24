const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("../db");
const { requireRole } = require("../auth");

const router = express.Router();
const LISTINO = path.join(__dirname, "../../data/listino.json");

router.get("/", async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const { rows } = q
    ? await db.query("SELECT id, sku, name, price, stock FROM products WHERE name ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3", [`%${q}%`, limit, offset])
    : await db.query("SELECT id, sku, name, price, stock FROM products ORDER BY name LIMIT $1 OFFSET $2", [limit, offset]);
  res.json(rows);
});

// Prezzo di acquisto dal listino dei fornitori, per la scheda del prodotto.
router.get("/:id/supplier-price", async (req, res) => {
  const { rows } = await db.query("SELECT sku FROM products WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).end();
  const listino = JSON.parse(fs.readFileSync(LISTINO, "utf8"));
  const entry = listino.items.find((i) => i.sku === rows[0].sku);
  res.json({ sku: rows[0].sku, supplierPrice: entry ? entry.price : null });
});

router.patch("/:id", requireRole("warehouse", "admin"), async (req, res) => {
  const fields = {};
  if (req.body.stock !== undefined) {
    if (!Number.isInteger(req.body.stock) || req.body.stock < 0) return res.status(400).json({ error: "giacenza non valida" });
    fields.stock = req.body.stock;
  }
  if (req.body.price !== undefined) {
    if (typeof req.body.price !== "number" || req.body.price <= 0) return res.status(400).json({ error: "prezzo non valido" });
    fields.price = req.body.price;
  }
  const keys = Object.keys(fields);
  if (keys.length === 0) return res.status(400).json({ error: "niente da aggiornare" });
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
  await db.query(`UPDATE products SET ${sets} WHERE id = $1`, [req.params.id, ...keys.map((k) => fields[k])]);
  res.json({ ok: true });
});

router.delete("/:id", requireRole("admin"), async (req, res) => {
  await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

module.exports = router;
