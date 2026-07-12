-- ============================================================
-- Migration 001: user_role enum + employees.role column
-- Branch: divy
-- Author: Divy
-- ============================================================
-- This migration:
--   1. Creates the user_role Postgres enum (lowercase values)
--   2. Alters employees.role to use the enum, default 'employee', NOT NULL
--   3. Backfills any existing rows that have the old uppercase string values
-- ============================================================

-- Step 1: Create the enum type (idempotent-safe)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'asset_manager',
    'department_head',
    'employee'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL; -- already exists, skip
END $$;

-- Step 2: Backfill existing rows before altering the column type.
--         The old code inserted uppercase strings ('EMPLOYEE', 'ADMIN', etc.).
--         Normalise them to lowercase enum values first.
UPDATE employees
  SET role = LOWER(role)
  WHERE role IN ('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE');

-- Step 3: Change the column type to use the enum.
--         Using USING to cast the existing text values.
ALTER TABLE employees
  ALTER COLUMN role TYPE user_role USING role::user_role;

-- Step 4: Set default and NOT NULL constraint.
ALTER TABLE employees
  ALTER COLUMN role SET DEFAULT 'employee',
  ALTER COLUMN role SET NOT NULL;

-- Step 5: Add a check constraint as a belt-and-suspenders safety net
--         (the enum itself already restricts values, this is extra insurance).
-- NOTE: Postgres enums already reject invalid values, so this is optional
--       but documents intent clearly.
COMMENT ON COLUMN employees.role IS
  'User role: admin | asset_manager | department_head | employee. '
  'Only admins may change this via the promote_employee() RPC. '
  'Self-elevation is forbidden at the RLS level.';
