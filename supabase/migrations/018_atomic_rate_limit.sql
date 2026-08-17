-- Migration: 018_atomic_rate_limit.sql
-- Description: Atomic rate limiting function to prevent TOCTOU race conditions.

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_limit INT,
  p_window_ms BIGINT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
  v_last_reset TIMESTAMPTZ;
  v_now TIMESTAMPTZ := now();
  v_window INTERVAL := (p_window_ms || ' milliseconds')::INTERVAL;
BEGIN
  -- Upsert with locking to prevent race conditions
  INSERT INTO rate_limits (key, count, last_reset)
  VALUES (p_key, 0, v_now)
  ON CONFLICT (key) DO NOTHING;

  -- Lock the row and read current values atomically
  SELECT count, last_reset
  INTO v_count, v_last_reset
  FROM rate_limits
  WHERE key = p_key
  FOR UPDATE;

  -- If window has expired, reset the counter
  IF v_now - v_last_reset > v_window THEN
    UPDATE rate_limits
    SET count = 1, last_reset = v_now
    WHERE key = p_key;
    RETURN jsonb_build_object('allowed', true, 'remaining', p_limit - 1);
  END IF;

  -- If under the limit, increment
  IF v_count < p_limit THEN
    UPDATE rate_limits
    SET count = v_count + 1
    WHERE key = p_key;
    RETURN jsonb_build_object('allowed', true, 'remaining', p_limit - v_count - 1);
  END IF;

  -- Over limit
  RETURN jsonb_build_object('allowed', false, 'remaining', 0);
END;
$$;
