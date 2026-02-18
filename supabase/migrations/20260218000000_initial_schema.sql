-- ============================================================
-- Trading Spot — Schema Principal (MVP)
-- Migración inicial: tablas, triggers, RLS e índices
-- ============================================================


-- ─── TIPOS PERSONALIZADOS ────────────────────────────────────

CREATE TYPE sector_type AS ENUM ('tech', 'health', 'etf', 'commodities', 'other');
CREATE TYPE language_type AS ENUM ('es', 'en');
CREATE TYPE trading_direction AS ENUM ('up', 'down', 'sideways');
CREATE TYPE confidence_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE trade_status AS ENUM ('open', 'closed');
CREATE TYPE notification_type AS ENUM ('weekly_report', 'email_verification', 'password_reset');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');


-- ─── TABLAS ──────────────────────────────────────────────────

-- Perfil extendido de usuario (1:1 con auth.users)
-- Se crea automáticamente al registrarse via trigger handle_new_user
CREATE TABLE user_profiles (
  user_id               uuid        PRIMARY KEY
                                     REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name             text,
  language              language_type        NOT NULL DEFAULT 'es',
  preferred_sectors     sector_type[]        NOT NULL DEFAULT '{}',
  weekly_goal_pct       numeric(5,2)         NOT NULL DEFAULT 1.5
                                             CHECK (weekly_goal_pct > 0),
  timezone              text                 NOT NULL DEFAULT 'America/Santiago',
  email_notifications   boolean              NOT NULL DEFAULT true,
  weekly_report_time    time                 NOT NULL DEFAULT '20:00:00',
  onboarding_completed  boolean              NOT NULL DEFAULT false,
  created_at            timestamptz          NOT NULL DEFAULT now(),
  updated_at            timestamptz          NOT NULL DEFAULT now()
);

COMMENT ON TABLE  user_profiles IS 'Perfil extendido de usuario. Se sincroniza con auth.users.';
COMMENT ON COLUMN user_profiles.weekly_goal_pct IS 'Meta de rentabilidad semanal en %. Default 1.5%';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'True cuando el usuario finalizó el onboarding inicial.';


-- Instrumentos seguidos por cada usuario
CREATE TABLE watchlist (
  id        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ticker    text        NOT NULL,
  name      text,
  sector    sector_type,
  added_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT watchlist_user_ticker_unique UNIQUE (user_id, ticker)
);

COMMENT ON TABLE watchlist IS 'Máximo 20 instrumentos por usuario (enforced por trigger).';


-- Análisis semanales generados por el sistema (compartidos entre usuarios)
CREATE TABLE weekly_analyses (
  id                  uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker              text           NOT NULL,
  week_start          date           NOT NULL,   -- Lunes de la semana analizada

  -- Datos de mercado en el momento del análisis
  price_current       numeric(12,4),
  price_week_ago      numeric(12,4),
  price_change_pct    numeric(8,4),

  -- Predicción IA
  predicted_direction trading_direction,
  confidence_score    smallint       CHECK (confidence_score BETWEEN 0 AND 100),
  confidence_level    confidence_level,

  -- Contenido del análisis (bilingüe)
  summary_es          text,
  summary_en          text,
  highlights          text[],        -- 3-5 bullets con los factores clave
  reasoning_es        text,          -- Análisis completo en español
  reasoning_en        text,          -- Análisis completo en inglés
  news_sources        jsonb          NOT NULL DEFAULT '[]',
  -- Estructura esperada de news_sources:
  -- [{ "title": "", "url": "", "source": "", "date": "YYYY-MM-DD" }]

  generated_at        timestamptz    NOT NULL DEFAULT now(),

  CONSTRAINT weekly_analyses_ticker_week_unique UNIQUE (ticker, week_start)
);

COMMENT ON TABLE  weekly_analyses IS 'Un registro por (ticker, semana). No es por usuario; es caché compartido.';
COMMENT ON COLUMN weekly_analyses.week_start IS 'Siempre lunes. Usar date_trunc(''week'', now())::date.';


-- Operaciones de trading registradas por el usuario
CREATE TABLE trades (
  id              uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid           NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  ticker          text           NOT NULL,
  analysis_id     uuid           REFERENCES weekly_analyses (id) ON DELETE SET NULL,

  -- ── Compra ──────────────────────────────────────────────
  buy_date        timestamptz,
  buy_price       numeric(12,4)  CHECK (buy_price > 0),
  shares          numeric(12,4)  CHECK (shares > 0),    -- Soporta fracciones
  buy_commission  numeric(10,2)  NOT NULL DEFAULT 0 CHECK (buy_commission >= 0),

  -- ── Venta ───────────────────────────────────────────────
  sell_date       timestamptz,
  sell_price      numeric(12,4)  CHECK (sell_price > 0),
  sell_commission numeric(10,2)  NOT NULL DEFAULT 0 CHECK (sell_commission >= 0),

  -- ── Calculados automáticamente por trigger ───────────────
  investment_gross  numeric(14,4),  -- buy_price × shares
  investment_total  numeric(14,4),  -- investment_gross + buy_commission
  revenue_gross     numeric(14,4),  -- sell_price × shares
  revenue_net       numeric(14,4),  -- revenue_gross − sell_commission
  profit_loss_gross numeric(14,4),  -- revenue_gross − investment_gross
  total_commissions numeric(10,2),  -- buy_commission + sell_commission
  profit_loss_net   numeric(14,4),  -- profit_loss_gross − total_commissions
  roi_gross_pct     numeric(8,4),   -- (profit_loss_gross / investment_gross) × 100
  roi_net_pct       numeric(8,4),   -- (profit_loss_net / investment_total) × 100

  -- ── Estado y validación de predicción ───────────────────
  status              trade_status     NOT NULL DEFAULT 'open',
  predicted_direction trading_direction,          -- Copiado del análisis al registrar
  actual_direction    trading_direction,          -- Calculado al cerrar trade
  prediction_correct  boolean,                    -- predicted = actual

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT trades_sell_requires_buy CHECK (
    sell_price IS NULL OR buy_price IS NOT NULL
  ),
  CONSTRAINT trades_sell_date_after_buy CHECK (
    sell_date IS NULL OR buy_date IS NULL OR sell_date >= buy_date
  )
);

COMMENT ON TABLE  trades IS 'Cada operación de compra/venta. Los campos calculados se mantienen via trigger.';
COMMENT ON COLUMN trades.shares IS 'Soporta fracciones decimales para ETFs.';


-- Notificaciones enviadas (log para debugging y reenvíos)
CREATE TABLE notifications (
  id            uuid               PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid               NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type          notification_type  NOT NULL,
  subject       text,
  recipients    text[],            -- Emails destino
  context       jsonb              NOT NULL DEFAULT '{}',
  status        notification_status NOT NULL DEFAULT 'pending',
  sent_at       timestamptz,
  error_message text,
  created_at    timestamptz        NOT NULL DEFAULT now()
);


-- Historial de generaciones del reporte semanal (para monitoreo y costos)
CREATE TABLE report_generations (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start           date        NOT NULL,
  total_instruments    integer     NOT NULL DEFAULT 0,
  successful_analyses  integer     NOT NULL DEFAULT 0,
  failed_analyses      integer     NOT NULL DEFAULT 0,
  started_at           timestamptz NOT NULL DEFAULT now(),
  completed_at         timestamptz,
  duration_seconds     integer,
  api_calls            integer,
  estimated_cost_usd   numeric(8,4),
  errors               jsonb       NOT NULL DEFAULT '[]'
);


-- ─── FUNCIONES ───────────────────────────────────────────────

-- Actualizar updated_at antes de cualquier UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- Crear perfil automáticamente al registrarse un nuevo usuario en Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;


-- Limitar watchlist a 20 instrumentos por usuario
CREATE OR REPLACE FUNCTION check_watchlist_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM watchlist
    WHERE user_id = NEW.user_id
  ) >= 20 THEN
    RAISE EXCEPTION
      'Watchlist llena: máximo 20 instrumentos por usuario.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;


-- Calcular todos los campos derivados de un trade al insertar o actualizar
CREATE OR REPLACE FUNCTION calculate_trade_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

  -- ── Inversión (siempre que haya precio y acciones) ────────
  IF NEW.buy_price IS NOT NULL AND NEW.shares IS NOT NULL THEN
    NEW.investment_gross := NEW.buy_price * NEW.shares;
    NEW.investment_total := NEW.investment_gross + COALESCE(NEW.buy_commission, 0);
  END IF;

  -- ── Venta (solo si existe precio de venta) ────────────────
  IF NEW.sell_price IS NOT NULL
     AND NEW.shares  IS NOT NULL
     AND NEW.investment_gross IS NOT NULL THEN

    NEW.revenue_gross := NEW.sell_price * NEW.shares;
    NEW.revenue_net   := NEW.revenue_gross - COALESCE(NEW.sell_commission, 0);

    NEW.profit_loss_gross := NEW.revenue_gross - NEW.investment_gross;
    NEW.total_commissions := COALESCE(NEW.buy_commission, 0)
                           + COALESCE(NEW.sell_commission, 0);
    NEW.profit_loss_net   := NEW.profit_loss_gross - NEW.total_commissions;

    -- ROI (evitar división por cero)
    IF NEW.investment_gross > 0 THEN
      NEW.roi_gross_pct := (NEW.profit_loss_gross / NEW.investment_gross) * 100;
    END IF;
    IF NEW.investment_total > 0 THEN
      NEW.roi_net_pct := (NEW.profit_loss_net / NEW.investment_total) * 100;
    END IF;

    -- Dirección real del movimiento
    NEW.actual_direction := CASE
      WHEN NEW.sell_price > NEW.buy_price THEN 'up'::trading_direction
      WHEN NEW.sell_price < NEW.buy_price THEN 'down'::trading_direction
      ELSE                                      'sideways'::trading_direction
    END;

    -- ¿Acertó la predicción?
    IF NEW.predicted_direction IS NOT NULL THEN
      NEW.prediction_correct := (NEW.predicted_direction = NEW.actual_direction);
    END IF;

    NEW.status := 'closed';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- ─── TRIGGERS ────────────────────────────────────────────────

-- Auto-crear perfil al registrar usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- updated_at en user_profiles
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Límite watchlist (20 por usuario)
CREATE TRIGGER trg_watchlist_limit
  BEFORE INSERT ON watchlist
  FOR EACH ROW
  EXECUTE FUNCTION check_watchlist_limit();

-- Calcular métricas de trade automáticamente
CREATE TRIGGER trg_trades_calculate_metrics
  BEFORE INSERT OR UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trade_metrics();


-- ─── ROW LEVEL SECURITY ──────────────────────────────────────

ALTER TABLE user_profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_analyses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_generations ENABLE ROW LEVEL SECURITY;


-- user_profiles ------------------------------------------------
CREATE POLICY "profile_select_own"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profile_update_own"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- watchlist ----------------------------------------------------
CREATE POLICY "watchlist_select_own"
  ON watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own"
  ON watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_update_own"
  ON watchlist FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own"
  ON watchlist FOR DELETE
  USING (auth.uid() = user_id);


-- weekly_analyses (lectura para autenticados, escritura solo service_role)
CREATE POLICY "analyses_select_authenticated"
  ON weekly_analyses FOR SELECT
  TO authenticated
  USING (true);


-- trades -------------------------------------------------------
CREATE POLICY "trades_select_own"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "trades_insert_own"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trades_update_own"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "trades_delete_own"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);


-- notifications (solo lectura propia)
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);


-- report_generations (solo lectura para autenticados)
CREATE POLICY "report_gen_select_authenticated"
  ON report_generations FOR SELECT
  TO authenticated
  USING (true);


-- ─── ÍNDICES ─────────────────────────────────────────────────

-- Trades
CREATE INDEX idx_trades_user_status    ON trades (user_id, status);
CREATE INDEX idx_trades_user_ticker    ON trades (user_id, ticker);
CREATE INDEX idx_trades_user_created   ON trades (user_id, created_at DESC);
CREATE INDEX idx_trades_ticker         ON trades (ticker);
CREATE INDEX idx_trades_analysis       ON trades (analysis_id);

-- Watchlist
CREATE INDEX idx_watchlist_user_id     ON watchlist (user_id);
CREATE INDEX idx_watchlist_ticker      ON watchlist (ticker);

-- Weekly analyses
CREATE INDEX idx_analyses_ticker_week  ON weekly_analyses (ticker, week_start DESC);
CREATE INDEX idx_analyses_week         ON weekly_analyses (week_start DESC);

-- Notifications
CREATE INDEX idx_notif_user_status     ON notifications (user_id, status);
CREATE INDEX idx_notif_user_created    ON notifications (user_id, created_at DESC);

-- Report generations
CREATE INDEX idx_report_gen_week       ON report_generations (week_start DESC);
