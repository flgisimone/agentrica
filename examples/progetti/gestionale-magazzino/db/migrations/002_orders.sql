-- 002: ordini, righe e fatture
CREATE TABLE orders (
  id          serial PRIMARY KEY,
  customer_id integer NOT NULL REFERENCES customers(id),
  status      text NOT NULL CHECK (status IN ('pending_payment', 'paid', 'picking', 'shipped', 'cancelled')),
  total       numeric(12,2),
  paid_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_at_idx ON orders (created_at);
CREATE INDEX orders_customer_idx ON orders (customer_id, created_at);

CREATE TABLE order_items (
  id         serial PRIMARY KEY,
  order_id   integer NOT NULL REFERENCES orders(id),
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   integer NOT NULL CHECK (quantity > 0),
  unit_price real NOT NULL
);

CREATE TABLE invoices (
  id       serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id),
  amount   numeric(12,2) NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);
