-- 001: prodotti, clienti, utenti, sessioni
CREATE TABLE customers (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  email      text NOT NULL,
  vat_number text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id         serial PRIMARY KEY,
  name       text NOT NULL,
  price      numeric(10,2) NOT NULL CHECK (price > 0),
  qty        integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_name_idx ON products (name);

CREATE TABLE users (
  id          serial PRIMARY KEY,
  email       text NOT NULL UNIQUE,
  role        text NOT NULL CHECK (role IN ('shop', 'warehouse', 'admin')),
  customer_id integer REFERENCES customers(id)
);

CREATE TABLE sessions (
  token      text PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
