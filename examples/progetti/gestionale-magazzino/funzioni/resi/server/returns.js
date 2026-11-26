const express = require("express");
const db = require("../../../server/db");
const { requireRole } = require("../../../server/auth");

const router = express.Router();

// Elenco dei resi: il negozio vede i suoi, il magazzino tutti.
router.get("/", async (req, res) => {
  const params = [];
  let where = "TRUE";
  if (req.user.role === "shop") {
    params.push(req.user.customer_id);
    where = "o.customer_id = $1";
  }
  const { rows } = await db.query(
    `SELECT r.id, r.order_id, r.quantity, r.amount, r.status, r.note, r.created_at
       FROM returns r JOIN orders o ON o.id = r.order_id
      WHERE ${where} ORDER BY r.created_at DESC LIMIT 200`,
    params,
  );
  res.json(rows);
});

// Apertura di un reso da parte del negozio.
router.post("/", async (req, res) => {
  const { orderId, orderItemId, amount, note } = req.body;
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity)) return res.status(400).json({ error: "quantità non valida" });

  const { rows: items } = await db.query(
    "SELECT id, product_id, quantity FROM order_items WHERE id = $1 AND order_id = $2",
    [orderItemId, orderId],
  );
  if (items.length === 0) return res.status(404).json({ error: "riga non trovata" });
  const item = items[0];

  const { rows: created } = await db.query(
    "INSERT INTO returns (order_id, order_item_id, quantity, amount, note) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [orderId, orderItemId, quantity, amount, note],
  );

  // La merce resa torna in giacenza.
  const { rows: product } = await db.query("SELECT stock FROM products WHERE id = $1", [item.product_id]);
  await db.query("UPDATE products SET stock = $1 WHERE id = $2", [product[0].stock + quantity, item.product_id]);

  res.status(201).json({ id: created[0].id });
});

// Correzione dell'importo da parte del magazzino.
router.patch("/:id", requireRole("warehouse", "admin"), async (req, res) => {
  const amount = Number(req.body.amount);
  if (!(amount >= 0)) return res.status(400).json({ error: "importo non valido" });
  await db.query("UPDATE returns SET amount = $1 WHERE id = $2", [amount, req.params.id]);
  res.status(204).end();
});

module.exports = router;
