-- 003: codice articolo obbligatorio e univoco (richiesto dal listino dei fornitori)
ALTER TABLE products ADD COLUMN sku text NOT NULL;
CREATE UNIQUE INDEX products_sku_idx ON products (sku);
