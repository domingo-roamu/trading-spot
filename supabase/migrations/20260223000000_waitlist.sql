-- ============================================================
-- Trading Spot — Waitlist
-- ============================================================

CREATE TABLE public.waitlist_requests (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  email      text        NOT NULL,
  message    text,
  status     text        NOT NULL DEFAULT 'pending', -- pending | invited | rejected
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_requests_email_idx ON public.waitlist_requests (lower(email));

ALTER TABLE public.waitlist_requests ENABLE ROW LEVEL SECURITY;

-- Solo el service role puede leer/modificar (admin)
-- No exponemos datos de waitlist al cliente anónimo
