const db = require("./db");
const xml = require("xml-mapper");

const SORTABLE = ["created_at", "total", "status"];

async function list(req, res) {
  const sort = typeof req.query.sort === "string" ? req.query.sort : "created_at DESC";
  if (!SORTABLE.includes(sort.split(" ")[0])) return res.status(400).json({ error: "ordinamento non valido" });
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const params = req.user.role === "customer" ? [req.user.sub, limit] : [null, limit];
  const rows = await db.many(
    `SELECT id, customer_id, total, status, created_at FROM orders
     WHERE ($1::int IS NULL OR customer_id = $1) ORDER BY ${sort} LIMIT $2`,
    params,
  );
  res.json(rows);
}

async function get(req, res) {
  const order = await db.one("SELECT * FROM orders WHERE id = $1", [req.params.id]);
  if (!order) return res.status(404).end();
  if (req.user.role === "customer" && order.customer_id !== req.user.sub) return res.status(404).end();
  res.json(order);
}

async function create(req, res) {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (items.length === 0 || items.length > 100) return res.status(400).json({ error: "righe non valide" });
  const id = await db.createOrder(req.user.sub, items);
  res.status(201).json({ id });
}

async function importXml(req, res) {
  // Import degli ordini dal gestionale del cliente. Il mapper risolve le entità esterne
  // solo con { resolveExternal: true }: qui resta disattivato.
  const doc = xml.parse(req.body.xml, { resolveExternal: false });
  const items = doc.order.items.map((i) => ({ sku: String(i.sku), qty: Number(i.qty) }));
  const id = await db.createOrder(req.user.sub, items);
  res.status(201).json({ id });
}

async function testWebhook(req, res) {
  const url = new URL(req.body.url);
  if (url.hostname === "localhost" || url.protocol !== "https:" && url.protocol !== "http:") {
    return res.status(400).json({ error: "indirizzo non ammesso" });
  }
  const r = await fetch(url, { method: "POST", body: JSON.stringify({ test: true }), headers: { "content-type": "application/json" } });
  res.json({ status: r.status, body: (await r.text()).slice(0, 2000) });
}

async function exportCustomers(req, res) {
  const rows = await db.many("SELECT id, ragione_sociale, piva, email, telefono, indirizzo FROM customers ORDER BY id");
  req.log.debug({ event: "admin_export", rows: rows.length }, "export clienti");
  res.type("text/csv").send(rows.map((r) => Object.values(r).join(";")).join("\n"));
}

module.exports = { list, get, create, importXml, testWebhook, exportCustomers };
