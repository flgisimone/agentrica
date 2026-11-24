const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });

async function query(sql, params) {
  return pool.query(sql, params);
}

async function one(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

async function many(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function createOrder(customerId, items) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query("INSERT INTO orders (customer_id, status) VALUES ($1, 'new') RETURNING id", [customerId]);
    for (const item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, sku, qty, unit_price) SELECT $1, sku, $3, price FROM products WHERE sku = $2",
        [rows[0].id, item.sku, item.qty],
      );
    }
    await client.query("UPDATE orders SET total = (SELECT sum(qty * unit_price) FROM order_items WHERE order_id = $1) WHERE id = $1", [rows[0].id]);
    await client.query("COMMIT");
    return rows[0].id;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { query, one, many, createOrder };
