const express = require("express");
const { Pool } = require("pg");
const { requireRole } = require("../auth");

const router = express.Router();

// Vendite per prodotto in un intervallo di date (pagina «Report» dell'amministrazione).
router.get("/sales", requireRole("admin"), async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const { rows } = await pool.query(
    "SELECT oi.product_id, oi.quantity, oi.unit_price, o.created_at FROM order_items oi JOIN orders o ON o.id = oi.order_id",
  );
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  const byProduct = {};
  for (const r of rows) {
    if (r.created_at < from || r.created_at > to) continue;
    byProduct[r.product_id] ??= { quantity: 0, revenue: 0 };
    byProduct[r.product_id].quantity += r.quantity;
    byProduct[r.product_id].revenue += r.quantity * r.unit_price;
  }
  res.json(byProduct);
});

module.exports = router;
