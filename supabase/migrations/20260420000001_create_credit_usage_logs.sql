CREATE TYPE credit_type AS ENUM ('listing', 'support', 'optimization');

CREATE TABLE credit_usage_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  credit_type     credit_type NOT NULL,
  amount          int         NOT NULL DEFAULT 1,
  reference_id    text,
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX credit_usage_logs_org_created
  ON credit_usage_logs (organization_id, created_at DESC);
