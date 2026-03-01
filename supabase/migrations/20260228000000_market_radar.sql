-- ─────────────────────────────────────────────────────────────────────────────
-- Market Radar table: stores daily price data for the curated universe of ~147 tickers
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE market_radar (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker     text        NOT NULL UNIQUE,
  name       text        NOT NULL,
  sector     text        NOT NULL,
  type       text        NOT NULL DEFAULT 'stock',
  price      numeric,
  change_7d  numeric,
  change_30d numeric,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_market_radar_sector ON market_radar(sector);

ALTER TABLE market_radar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read market radar"
  ON market_radar FOR SELECT TO authenticated USING (true);
