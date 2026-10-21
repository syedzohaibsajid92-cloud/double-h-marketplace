-- Adds a "selling unit" to products (piece, kg, bag, sqft, set, length)
-- so vendors can specify how a product is sold and customers can see it
-- alongside price on the product listing/detail pages.
--
-- Run manually against the production DB, e.g.:
--   psql "$DATABASE_URL" -f migrations/2026_09_add_unit_to_products.sql

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS unit VARCHAR(20) NOT NULL DEFAULT 'piece';

-- Optional: constrain to the known set of units. Comment out if you'd
-- rather keep this open-ended for now.
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_unit_check;

ALTER TABLE products
  ADD CONSTRAINT products_unit_check
  CHECK (unit IN ('piece', 'kg', 'bag', 'sqft', 'set', 'length'));
