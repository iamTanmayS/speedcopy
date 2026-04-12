-- Catalog Hierarchy & SKU Pricing Strict Requirements

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL, -- e.g. printing, gifts, stationery
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS sub_categories (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY,
  sub_category_id UUID REFERENCES sub_categories(id) ON DELETE CASCADE,

  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  customization_mode TEXT NOT NULL, -- none, upload_only, editor_only, upload_or_editor
  primary_cta TEXT NOT NULL, -- edit_and_print, customize

  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,

  sku_code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,

  mrp NUMERIC(10,2) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL,

  delivery_badge TEXT, -- same_day, next_day
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS product_config_options (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL, -- single, multi
  is_required BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS product_config_option_values (
  id UUID PRIMARY KEY,
  option_id UUID REFERENCES product_config_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  price_delta NUMERIC(10,2) DEFAULT 0,
  sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quantity_slabs (
  id UUID PRIMARY KEY,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  min_qty INT NOT NULL,
  max_qty INT,
  unit_price NUMERIC(10,2) NOT NULL
);
