-- 004: «qty» diventa «stock», come nel resto del codice dalla 3.2.0
ALTER TABLE products RENAME COLUMN qty TO stock;
