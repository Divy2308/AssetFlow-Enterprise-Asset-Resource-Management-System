-- ============================================================
-- Migration 002: role_change_log table
-- Branch: divy
-- Author: Divy
-- ============================================================
-- Creates an immutable audit trail for every role promotion/demotion.
-- This table is append-only — rows are never updated or deleted.
-- ============================================================

CREATE TABLE IF NOT EXISTS role_change_log (
  id               BIGSERIAL PRIMARY KEY,

  -- The employee whose role was changed
  changed_employee_id  BIGINT NOT NULL
    REFERENCES employees(id) ON DELETE SET NULL,

  -- Role values before and after the change
  old_role  user_role NOT NULL,
  new_role  user_role NOT NULL,

  -- The admin who made the change (auth.uid() at time of RPC call)
  changed_by  UUID NOT NULL,

  -- Timestamp — always stored as UTC
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups by employee
CREATE INDEX IF NOT EXISTS idx_role_change_log_employee
  ON role_change_log (changed_employee_id);

-- Index for admin audit queries sorted by time
CREATE INDEX IF NOT EXISTS idx_role_change_log_changed_at
  ON role_change_log (changed_at DESC);

-- Prevent any UPDATE or DELETE on this table to keep audit trail intact.
-- This is enforced by RLS policies below.
ALTER TABLE role_change_log ENABLE ROW LEVEL SECURITY;

-- Only allow INSERTs (via the promote_employee RPC which runs as SECURITY DEFINER)
-- Nobody can SELECT / UPDATE / DELETE via the public API.
CREATE POLICY "role_change_log_insert_via_rpc_only"
  ON role_change_log
  FOR INSERT
  TO authenticated
  WITH CHECK (false); -- direct inserts blocked; only SECURITY DEFINER RPC may insert

CREATE POLICY "role_change_log_admin_select"
  ON role_change_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id::text = auth.uid()::text  -- will be replaced with auth_user_id join after auth merge
         OR e.email = auth.jwt()->>'email'
        AND e.role = 'admin'
    )
  );

COMMENT ON TABLE role_change_log IS
  'Immutable audit trail of every employee role change. '
  'Rows are inserted exclusively via the promote_employee() RPC (SECURITY DEFINER). '
  'Direct inserts from the API are blocked by RLS.';
