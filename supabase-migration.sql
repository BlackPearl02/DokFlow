-- Migration: Create analytics_events table for tracking user events
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Optional: Enable Row Level Security (RLS) - only service role can insert
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert (API route uses service key)
CREATE POLICY "Service role can insert analytics events"
  ON analytics_events
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: No one can read directly (use service role for queries)
CREATE POLICY "No public read access"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (false);

-- Optional: Auto-cleanup old events (older than 90 days)
-- Uncomment if you want automatic cleanup
-- CREATE OR REPLACE FUNCTION cleanup_old_analytics()
-- RETURNS void AS $$
-- BEGIN
--   DELETE FROM analytics_events
--   WHERE created_at < NOW() - INTERVAL '90 days';
-- END;
-- $$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics()');

