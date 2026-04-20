-- Trigger: automatically create a free-plan credits row whenever a new
-- organization is inserted. This makes it impossible to have an org
-- without a corresponding credits record.

CREATE OR REPLACE FUNCTION init_org_credits_on_create()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO organization_credits (
    organization_id,
    listing_credits_total,
    support_credits_total,
    optimization_credits_total,
    period_start,
    period_end
  ) VALUES (
    NEW.id,
    100,  -- free plan listing
    50,   -- free plan support
    30,   -- free plan optimization
    now(),
    now() + interval '30 days'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_init_org_credits
AFTER INSERT ON organizations
FOR EACH ROW EXECUTE FUNCTION init_org_credits_on_create();
