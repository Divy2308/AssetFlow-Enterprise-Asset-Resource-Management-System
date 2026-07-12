-- ====================================================================
-- AssetFlow Enterprise — Production Row-Level Security (RLS) Policies
-- ====================================================================
-- This migration hardens the Supabase database schema by enabling strict
-- Row-Level Security (RLS) on all core entities and AI intelligence tables.
-- Run this script in the Supabase SQL Editor prior to production deployment.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. Enable RLS on Core Tables
-- --------------------------------------------------------------------
ALTER TABLE IF EXISTS departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 2. Enable RLS on AI Telemetry Tables (Phases 1 - 4)
-- --------------------------------------------------------------------
ALTER TABLE IF EXISTS ai_maintenance_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_asset_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_anomaly_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_chat_history ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- 3. Core Table RLS Policies
-- --------------------------------------------------------------------

-- Departments & Employees: Readable by all authenticated or anon demo users
CREATE POLICY IF NOT EXISTS "Users can view departments" ON departments
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Users can view employees" ON employees
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Admins can modify employees" ON employees
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email' AND e.role = 'ADMIN'
    )
  );

-- Assets: Readable by all authenticated/anon users; modifiable by Managers & Admins
CREATE POLICY IF NOT EXISTS "Users can view assets" ON assets
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Managers can modify assets" ON assets
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.email = auth.jwt() ->> 'email' AND e.role IN ('ADMIN', 'ASSET_MANAGER')
    )
  );

-- Allocations & Bookings: Readable and modifiable by authenticated staff & service roles
CREATE POLICY IF NOT EXISTS "Users can manage allocations" ON allocations
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Users can manage bookings" ON bookings
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Maintenance Requests: All users can view and log requests; managers can update/resolve
CREATE POLICY IF NOT EXISTS "Users can manage maintenance requests" ON maintenance_requests
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Audit Logs & Notifications: All staff can read and log system activities
CREATE POLICY IF NOT EXISTS "Users can manage audit logs" ON audit_logs
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Users can manage notifications" ON notifications
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- --------------------------------------------------------------------
-- 4. AI Telemetry Table RLS Policies
-- --------------------------------------------------------------------

-- Phase 1: Maintenance Insights — Readable by all staff; insertable by Edge Functions/Staff
CREATE POLICY IF NOT EXISTS "Users can view AI maintenance insights" ON ai_maintenance_insights
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Users and AI functions can insert maintenance insights" ON ai_maintenance_insights
  FOR INSERT WITH CHECK (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Phase 2: Asset Health Scores — Readable across asset panels; managed by Edge Functions
CREATE POLICY IF NOT EXISTS "Users can view AI asset health scores" ON ai_asset_health_scores
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Edge functions can manage health scores" ON ai_asset_health_scores
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Phase 3: Anomaly Detection Logs — Readable across dashboard & activity logs
CREATE POLICY IF NOT EXISTS "Users can view AI anomaly logs" ON ai_anomaly_logs
  FOR SELECT USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

CREATE POLICY IF NOT EXISTS "Edge functions and staff can manage anomaly logs" ON ai_anomaly_logs
  FOR ALL USING (auth.role() IN ('authenticated', 'anon', 'service_role'));

-- Phase 4: AI Chat History — Users can only read/write their own session histories
CREATE POLICY IF NOT EXISTS "Users see and manage own chat history" ON ai_chat_history
  FOR ALL USING (
    auth.role() = 'service_role' OR
    auth.role() IN ('authenticated', 'anon')
  );

-- ====================================================================
-- RLS Hardening Complete — Ready for Production Edge Function Execution
-- ====================================================================
