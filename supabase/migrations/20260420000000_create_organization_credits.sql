-- Plan-based credit defaults:
--   free:       listing=100, support=50,   optimization=30
--   pro:        listing=500, support=200,  optimization=150
--   enterprise: listing=2000, support=1000, optimization=500

CREATE TABLE organization_credits (
  id                         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id            uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  listing_credits_total      int         NOT NULL DEFAULT 0,
  listing_credits_used       int         NOT NULL DEFAULT 0,
  support_credits_total      int         NOT NULL DEFAULT 0,
  support_credits_used       int         NOT NULL DEFAULT 0,
  optimization_credits_total int         NOT NULL DEFAULT 0,
  optimization_credits_used  int         NOT NULL DEFAULT 0,
  period_start               timestamptz NOT NULL DEFAULT now(),
  period_end                 timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id)
);
