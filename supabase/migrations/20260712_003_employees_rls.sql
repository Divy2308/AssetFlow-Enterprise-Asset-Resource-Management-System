-- ============================================================
-- Migration 003: employees table — RLS policies
-- Branch: divy
-- Author: Divy
-- ============================================================
-- IMPORTANT: This file assumes the auth teammate will add an
-- `auth_user_id UUID REFERENCES auth.users(id)` column to the
-- employees table. Until that column exists, the policies fall
-- back to matching by email (auth.jwt()->>'email').
--
-- The helper function get_my_role() is created here and reused
-- by later migrations for other tables.
-- ============================================================

-- ============================================================
-- HELPER: get the calling user's role from the employees table
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER  -- runs as the function owner, not the caller
AS $$
  SELECT e.role
  FROM employees e
  WHERE
    -- Try auth_user_id first (post-auth-merge); fall back to email
    (
      e.auth_user_id = auth.uid()
      OR e.email = (auth.jwt()->>'email')
    )
  LIMIT 1;
$$;

-- ============================================================
-- HELPER: get the calling user's department_id
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_department_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT e.department_id
  FROM employees e
  WHERE
    (
      e.auth_user_id = auth.uid()
      OR e.email = (auth.jwt()->>'email')
    )
  LIMIT 1;
$$;

-- ============================================================
-- HELPER: get the calling user's employee id
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_employee_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT e.id
  FROM employees e
  WHERE
    (
      e.auth_user_id = auth.uid()
      OR e.email = (auth.jwt()->>'email')
    )
  LIMIT 1;
$$;

-- ============================================================
-- Enable RLS on employees
-- ============================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SELECT Policies
-- ============================================================

-- 1. Any authenticated user can read their own row
CREATE POLICY "employees_select_own"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    auth_user_id = auth.uid()
    OR email = (auth.jwt()->>'email')
  );

-- 2. admin can read all employees
CREATE POLICY "employees_select_admin"
  ON employees
  FOR SELECT
  TO authenticated
  USING (get_my_role() = 'admin');

-- 3. department_head can read employees in their own department
CREATE POLICY "employees_select_dept_head"
  ON employees
  FOR SELECT
  TO authenticated
  USING (
    get_my_role() = 'department_head'
    AND department_id = get_my_department_id()
  );

-- ============================================================
-- UPDATE Policies
-- ============================================================

-- 4. admin can update ANY column on ANY employee row
CREATE POLICY "employees_update_admin_all"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

-- 5. Prevent non-admins from changing the role column.
--    This is enforced via a BEFORE trigger (more reliable than RLS alone
--    because RLS WITH CHECK can't inspect individual column diffs easily).
CREATE OR REPLACE FUNCTION prevent_self_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If the role column is being changed AND the caller is not an admin, abort.
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF get_my_role() <> 'admin' THEN
      RAISE EXCEPTION
        'Permission denied: only admins may change the role column. '
        'Use the promote_employee() RPC instead.'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_prevent_self_role_change
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_role_change();

-- ============================================================
-- DELETE Policies
-- ============================================================

-- 6. Only admin can delete employee rows
CREATE POLICY "employees_delete_admin"
  ON employees
  FOR DELETE
  TO authenticated
  USING (get_my_role() = 'admin');

-- ============================================================
-- INSERT Policies
-- ============================================================

-- 7. Only admin can insert new employees (or service role for auth signup)
--    The auth signup flow uses service_role key (bypasses RLS), so this
--    only affects direct API calls with the anon/user key.
CREATE POLICY "employees_insert_admin_or_signup"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (
    get_my_role() = 'admin'
    -- Allow self-insert only if role is 'employee' (enforced below)
    OR NEW.role = 'employee'
  );

-- 8. Ensure self-inserts cannot set a privileged role
--    Belt-and-suspenders: even if insert policy passes, the role must be 'employee'
--    unless the caller is admin.
CREATE OR REPLACE FUNCTION enforce_default_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If inserting caller is not admin, force role to 'employee'
  IF get_my_role() IS DISTINCT FROM 'admin' THEN
    NEW.role := 'employee';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_enforce_default_role_on_insert
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE FUNCTION enforce_default_role_on_insert();
