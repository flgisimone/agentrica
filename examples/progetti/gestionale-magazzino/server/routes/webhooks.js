const express = require("express");
const crypto = require("crypto");
const db = require("../db");

const router = express.Router();

function validSignature(raw, header) {
  const expected = crypto.createHmac("sha256", process.env.PAYMENTS_WEBHOOK_SECRET).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(header || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Il fornitore dei pagamenti ritenta l'invio fino a 5 volte se non riceve 2xx entro 10 secondi.
router.post("/payments", async (req, res) => {
  if (!validSignature(req.body, req.get("x-signature"))) return res.status(400).end();
  const event = JSON.parse(req.body.toString("utf8"));
  if (event.type === "payment.succeeded") {
    const orderId = event.data.metadata.orderId;
    await db.query("UPDATE orders SET status = 'paid', paid_at = now() WHERE id = $1", [orderId]);
    await db.query("INSERT INTO invoices (order_id, amount) VALUES ($1, $2)", [orderId, event.data.amount / 100]);
  }
  res.status(200).end();
});

module.exports = router;
