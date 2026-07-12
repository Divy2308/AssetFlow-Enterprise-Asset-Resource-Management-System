-- ====================================================================
-- AssetFlow AI Features Setup — Supabase Database Schema & RLS
-- ====================================================================
-- Run this script in your Supabase SQL Editor to prepare all tables,
-- indexes, RLS policies, and sample data before starting Phase 1.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Table Definitions for AI Phases 1 - 4
-- --------------------------------------------------------------------

-- Phase 1: AI Maintenance Insights Table
CREATE TABLE IF NOT EXISTS ai_maintenance_insights (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id bigint REFERENCES assets(id) ON DELETE CASCADE,
  maintenance_request_id bigint REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  issue_description text NOT NULL,
  root_cause_suggestion text,
  priority_recommendation text,
  priority_rationale text,
  preventive_tips jsonb,        -- Array of strings: ["tip1", "tip2", "tip3"]
  model_used text DEFAULT 'gemini-2.5-flash',
  created_at timestamptz DEFAULT now(),
  requested_by_id bigint REFERENCES employees(id) ON DELETE SET NULL
);

-- Phase 2: AI Asset Health Scores Table
CREATE TABLE IF NOT EXISTS ai_asset_health_scores (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  asset_id bigint REFERENCES assets(id) ON DELETE CASCADE UNIQUE,
  health_score integer CHECK (health_score BETWEEN 0 AND 100),
  risk_level text,              -- 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors jsonb,                -- e.g., {"age_score": 80, "maintenance_freq": 60}
  last_calculated_at timestamptz DEFAULT now(),
  prediction_text text
);

-- Phase 3: AI Anomaly Detection Logs Table
CREATE TABLE IF NOT EXISTS ai_anomaly_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  anomaly_type text NOT NULL,   -- e.g., 'UNUSUAL_BOOKING_PATTERN' | 'RAPID_DEPRECIATION'
  entity_type text NOT NULL,    -- 'asset' | 'employee' | 'department' | 'booking'
  entity_id bigint NOT NULL,
  description text NOT NULL,
  severity text DEFAULT 'INFO', -- 'INFO' | 'WARNING' | 'CRITICAL'
  ai_recommendation text,
  is_dismissed boolean DEFAULT false,
  detected_at timestamptz DEFAULT now()
);

-- Phase 4: AI Conversational Chat History Table
CREATE TABLE IF NOT EXISTS ai_chat_history (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid DEFAULT gen_random_uuid(),
  user_id bigint REFERENCES employees(id) ON DELETE CASCADE,
  role text NOT NULL,           -- 'user' | 'assistant'
  content text NOT NULL,
  context_data jsonb,           -- e.g., {"page": "maintenance", "asset_id": 42}
  created_at timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------
-- 2. Indexes for Performance
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ai_insights_asset_id ON ai_maintenance_insights(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_request_id ON ai_maintenance_insights(maintenance_request_id);
CREATE INDEX IF NOT EXISTS idx_ai_health_asset_id ON ai_asset_health_scores(asset_id);
CREATE INDEX IF NOT EXISTS idx_ai_anomaly_detected_at ON ai_anomaly_logs(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_session_id ON ai_chat_history(session_id);

-- --------------------------------------------------------------------
-- 3. Row-Level Security (RLS) Policies
-- --------------------------------------------------------------------

-- Enable RLS on newly created AI tables
ALTER TABLE ai_maintenance_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_anomaly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (and service roles) full select/insert access for AI tables
-- (Note: In Supabase Edge Functions, service_role key automatically bypasses RLS,
-- but the frontend requires read permissions for displaying insights and scores).
CREATE POLICY "Enable read access for authenticated users on ai_maintenance_insights"
  ON ai_maintenance_insights FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable insert access for authenticated users on ai_maintenance_insights"
  ON ai_maintenance_insights FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable read access for authenticated users on ai_asset_health_scores"
  ON ai_asset_health_scores FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable read/write access for authenticated users on ai_anomaly_logs"
  ON ai_anomaly_logs FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable read/write access for authenticated users on ai_chat_history"
  ON ai_chat_history FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- --------------------------------------------------------------------
-- 4. Sample Seed Data for Testing AI Maintenance Advisor (Phase 1)
-- --------------------------------------------------------------------
-- Ensure we have sample maintenance requests if not already existing
INSERT INTO maintenance_requests (asset_id, reporter_id, issue_details, priority, status)
SELECT 1, 1, 'Laptop screen flickering intermittently and color distortion when moving hinge', 'HIGH', 'PENDING'
WHERE EXISTS (SELECT 1 FROM assets WHERE id = 1) AND EXISTS (SELECT 1 FROM employees WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE issue_details LIKE '%screen flickering%');

INSERT INTO maintenance_requests (asset_id, reporter_id, issue_details, priority, status)
SELECT 2, 2, 'Projector lamp bulb not turning on when powered up, red warning indicator blinking', 'CRITICAL', 'APPROVED'
WHERE EXISTS (SELECT 1 FROM assets WHERE id = 2) AND EXISTS (SELECT 1 FROM employees WHERE id = 2)
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE issue_details LIKE '%Projector lamp bulb%');
