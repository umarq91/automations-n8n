-- Trigger: when a row is inserted into credit_usage_logs, automatically
-- increment the matching _used counter in organization_credits.
-- This keeps the balance table in sync atomically without requiring
-- n8n (or any caller) to make two separate calls.

CREATE OR REPLACE FUNCTION increment_credit_used()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE organization_credits
  SET
    listing_credits_used      = listing_credits_used      + CASE WHEN NEW.credit_type = 'listing'      THEN NEW.amount ELSE 0 END,
    support_credits_used      = support_credits_used      + CASE WHEN NEW.credit_type = 'support'      THEN NEW.amount ELSE 0 END,
    optimization_credits_used = optimization_credits_used + CASE WHEN NEW.credit_type = 'optimization' THEN NEW.amount ELSE 0 END,
    updated_at = now()
  WHERE organization_id = NEW.organization_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_increment_credit_used
AFTER INSERT ON credit_usage_logs
FOR EACH ROW EXECUTE FUNCTION increment_credit_used();
