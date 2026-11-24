const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
  const from = req.query.from || new Date(Date.now() - 7 * 864e5).toISOString();
  const params = [from];
  let where = "created_at >= $1";
  if (req.user.role === "shop") {
    params.push(req.user.customer_id);
    where += " AND customer_id = $2";
  }
  const { rows: orders } = await db.query(`SELECT id, customer_id, status, total, created_at FROM orders WHERE ${where} ORDER BY created_at DESC LIMIT 200`, params);
  for (const order of orders) {
    const { rows: items } = await db.query("SELECT product_id, quantity, unit_price FROM order_items WHERE order_id = $1", [order.id]);
    order.items = items;
  }
  res.json(orders);
});

router.post("/", async (req, res) => {
  const lines = Array.isArray(req.body.lines) ? req.body.lines : [];
  if (lines.length === 0 || lines.length > 200) return res.status(400).json({ error: "righe non valide" });
  for (const l of lines) {
    l.quantity = Number(l.quantity);
    if (!(l.quantity > 0)) return res.status(400).json({ error: "quantità non valida" });
  }
  const customerId = req.user.role === "shop" ? req.user.customer_id : req.body.customerId;

  const { rows } = await db.query("INSERT INTO orders (customer_id, status) VALUES ($1, 'pending_payment') RETURNING id", [customerId]);
  const orderId = rows[0].id;
  let total = 0;
  for (const l of lines) {
    const { rows: p } = await db.query("SELECT id, price, stock FROM products WHERE id = $1", [l.productId]);
    if (!p[0]) return res.status(400).json({ error: `prodotto ${l.productId} inesistente` });
    if (p[0].stock < l.quantity) return res.status(409).json({ error: `giacenza insufficiente per ${l.productId}` });
    await db.query("UPDATE products SET stock = $1 WHERE id = $2", [p[0].stock - l.quantity, p[0].id]);
    await db.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)", [orderId, p[0].id, l.quantity, p[0].price]);
    total += p[0].price * l.quantity;
  }
  await db.query("UPDATE orders SET total = $1 WHERE id = $2", [total, orderId]);
  res.status(201).json({ id: orderId, total });
});

router.patch("/:id/status", async (req, res, next) => {
  try {
    const allowed = ["pending_payment", "paid", "picking", "shipped", "cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ error: "stato non valido" });
    if (req.user.role === "shop") return res.status(403).json({ error: "non permesso" });
    await db.query("UPDATE orders SET status = $1 WHERE id = $2", [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
