-- 005: resi dei negozi
CREATE TABLE returns (
  id            serial PRIMARY KEY,
  order_id      integer NOT NULL REFERENCES orders(id),
  order_item_id integer NOT NULL,
  quantity      integer NOT NULL,
  amount        real NOT NULL,
  status        text NOT NULL DEFAULT 'accepted',
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX returns_order_idx ON returns (order_id);
