-- ============================================================
-- Migration 004: promote_employee() RPC function
-- Branch: divy
-- Author: Divy
-- ============================================================
-- This function is the ONLY authorised way to change an employee's role.
-- It runs as SECURITY DEFINER (as the function owner/superuser), so it
-- can bypass RLS to do the update + log insert atomically.
--
-- The function itself enforces:
--   1. Caller must be admin
--   2. new_role cannot be 'admin' (admin seeding is done out-of-band)
--   3. UPDATE + INSERT into role_change_log in one transaction
-- ============================================================

CREATE OR REPLACE FUNCTION promote_employee(
  target_employee_id  BIGINT,
  new_role            user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as function owner, bypasses RLS for the write
SET search_path = public  -- pin search path to prevent injection
AS $$
DECLARE
  caller_role   user_role;
  old_role      user_role;
  caller_uid    UUID;
BEGIN
  -- --------------------------------------------------------
  -- 1. Identify the calling user and their current role
  -- --------------------------------------------------------
  caller_uid := auth.uid();

  SELECT get_my_role() INTO caller_role;

  IF caller_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Caller not found in employees table.'
    );
  END IF;

  -- --------------------------------------------------------
  -- 2. Enforce admin-only access
  -- --------------------------------------------------------
  IF caller_role <> 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Permission denied: only admins can promote employees.'
    );
  END IF;

  -- --------------------------------------------------------
  -- 3. Reject attempts to assign the 'admin' role via this RPC.
  --    Admin seeding must be done directly in the DB or via
  --    a separate, more guarded administrative operation.
  -- --------------------------------------------------------
  IF new_role = 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Cannot assign admin role via promote_employee(). '
                 'Admin accounts must be created through direct DB seeding.'
    );
  END IF;

  -- --------------------------------------------------------
  -- 4. Fetch the target employee's current role
  -- --------------------------------------------------------
  SELECT e.role INTO old_role
  FROM employees e
  WHERE e.id = target_employee_id;

  IF old_role IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Target employee not found (id: ' || target_employee_id || ').'
    );
  END IF;

  -- No-op guard: if role is already what we want, return early
  IF old_role = new_role THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Employee already has role: ' || new_role::text
    );
  END IF;

  -- --------------------------------------------------------
  -- 5. Perform the update + audit log atomically.
  --    Both statements run inside an implicit transaction
  --    (plpgsql functions are transactional by default).
  --    If either fails, the whole function rolls back.
  -- --------------------------------------------------------

  -- 5a. Update the employee's role
  UPDATE employees
    SET role = new_role
  WHERE id = target_employee_id;

  -- 5b. Append to audit log
  INSERT INTO role_change_log (
    changed_employee_id,
    old_role,
    new_role,
    changed_by,
    changed_at
  ) VALUES (
    target_employee_id,
    old_role,
    new_role,
    caller_uid,
    NOW()
  );

  -- --------------------------------------------------------
  -- 6. Return success payload
  -- --------------------------------------------------------
  RETURN jsonb_build_object(
    'success',    true,
    'employee_id', target_employee_id,
    'old_role',   old_role::text,
    'new_role',   new_role::text,
    'changed_by', caller_uid::text,
    'changed_at', NOW()::text
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Surface the Postgres error cleanly to the caller
    RETURN jsonb_build_object(
      'success', false,
      'error',   SQLERRM
    );
END;
$$;

-- Grant execute to authenticated users (RPC call from frontend)
-- The function itself enforces admin-only internally.
GRANT EXECUTE ON FUNCTION promote_employee(BIGINT, user_role) TO authenticated;

COMMENT ON FUNCTION promote_employee IS
  'Admin-only RPC to change an employee role. '
  'Rejects new_role = admin. '
  'Atomically updates employees.role and inserts into role_change_log. '
  'Returns a JSONB object with success/error details.';
