-- ============================================================
-- Migration 005: RLS policy stubs for remaining core tables
-- Branch: divy
-- Author: Divy
--
-- ⚠️  COORDINATE WITH AUTH TEAMMATE BEFORE APPLYING  ⚠️
--
-- These policies depend on:
--   1. get_my_role()       — defined in migration 003
--   2. get_my_department_id() — defined in migration 003
--   3. get_my_employee_id()   — defined in migration 003
--   4. The auth_user_id column being present on employees (auth teammate)
--
-- DO NOT run this migration until migration 003 is applied and
-- the auth teammate's auth_user_id column is merged.
--
-- Permission matrix (from product spec):
-- ┌──────────────────────────┬───────┬───────────────┬──────────────────┬──────────┐
-- │ Action                   │ admin │ asset_manager │ department_head  │ employee │
-- ├──────────────────────────┼───────┼───────────────┼──────────────────┼──────────┤
-- │ Manage departments/cats  │  FULL │     NONE      │       NONE       │   NONE   │
-- │ Promote/assign roles     │  FULL │     NONE      │       NONE       │   NONE   │
-- │ Register/allocate assets │  NONE │     FULL      │       NONE       │   NONE   │
-- │ Approve transfer         │  NONE │     FULL      │   own dept only  │   NONE   │
-- │ Approve return           │  NONE │     FULL      │       NONE       │   NONE   │
-- │ Book resources           │  ALL  │     ALL       │       ALL        │   ALL    │
-- │ Raise maintenance        │  ALL  │     ALL       │       ALL        │   ALL    │
-- │ Approve maintenance      │  NONE │     FULL      │       NONE       │   NONE   │
-- │ Create/close audit cycle │  FULL │     NONE      │       NONE       │   NONE   │
-- │ Verify audit items       │assigned│  assigned    │    assigned      │   NONE   │
-- │ View analytics           │org-wide│  limited     │   dept-only      │ personal │
-- └──────────────────────────┴───────┴───────────────┴──────────────────┴──────────┘
-- ============================================================


-- ============================================================
-- TABLE: departments
-- ============================================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view departments (needed for picklists)
CREATE POLICY "departments_select_all_authenticated"
  ON departments FOR SELECT TO authenticated USING (true);

-- Only admin can INSERT / UPDATE / DELETE
CREATE POLICY "departments_insert_admin"
  ON departments FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "departments_update_admin"
  ON departments FOR UPDATE TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "departments_delete_admin"
  ON departments FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- TABLE: asset_categories
-- ============================================================
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "asset_categories_select_all"
  ON asset_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "asset_categories_insert_admin"
  ON asset_categories FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "asset_categories_update_admin"
  ON asset_categories FOR UPDATE TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "asset_categories_delete_admin"
  ON asset_categories FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- TABLE: assets
-- ============================================================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can view assets
CREATE POLICY "assets_select_all"
  ON assets FOR SELECT TO authenticated USING (true);

-- INSERT: admin or asset_manager
CREATE POLICY "assets_insert_admin_or_am"
  ON assets FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'asset_manager'));

-- UPDATE: admin or asset_manager
CREATE POLICY "assets_update_admin_or_am"
  ON assets FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'))
  WITH CHECK (get_my_role() IN ('admin', 'asset_manager'));

-- DELETE: admin only
CREATE POLICY "assets_delete_admin"
  ON assets FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- TABLE: asset_allocations  (may also be referenced as allocation_history)
-- ============================================================
-- ⚠ Confirm table name with auth teammate — code uses 'allocation_history'
ALTER TABLE asset_allocations ENABLE ROW LEVEL SECURITY;

-- SELECT: admin sees all; asset_manager sees all; dept_head sees own dept; employee sees own
CREATE POLICY "allocations_select_admin_or_am"
  ON asset_allocations FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'));

CREATE POLICY "allocations_select_dept_head"
  ON asset_allocations FOR SELECT TO authenticated
  USING (
    get_my_role() = 'department_head'
    -- employee must be in caller's department
    AND EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = asset_allocations.employee_id
        AND e.department_id = get_my_department_id()
    )
  );

CREATE POLICY "allocations_select_own"
  ON asset_allocations FOR SELECT TO authenticated
  USING (employee_id = get_my_employee_id());

-- INSERT: admin or asset_manager
CREATE POLICY "allocations_insert_admin_or_am"
  ON asset_allocations FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'asset_manager'));

-- UPDATE (approve transfers): admin or asset_manager or dept_head for own dept
CREATE POLICY "allocations_update_admin_or_am"
  ON asset_allocations FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'))
  WITH CHECK (get_my_role() IN ('admin', 'asset_manager'));

CREATE POLICY "allocations_update_dept_head_own_dept"
  ON asset_allocations FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'department_head'
    AND EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = asset_allocations.employee_id
        AND e.department_id = get_my_department_id()
    )
  )
  WITH CHECK (
    get_my_role() = 'department_head'
    AND EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = asset_allocations.employee_id
        AND e.department_id = get_my_department_id()
    )
  );


-- ============================================================
-- TABLE: transfer_requests
-- ============================================================
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can raise a transfer request
CREATE POLICY "transfer_requests_insert_any"
  ON transfer_requests FOR INSERT TO authenticated
  WITH CHECK (true);

-- SELECT: admin/asset_manager see all; dept_head sees own dept; employee sees own
CREATE POLICY "transfer_requests_select_admin_or_am"
  ON transfer_requests FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'));

CREATE POLICY "transfer_requests_select_dept_head"
  ON transfer_requests FOR SELECT TO authenticated
  USING (
    get_my_role() = 'department_head'
    AND EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = transfer_requests.requested_by
        AND e.department_id = get_my_department_id()
    )
  );

CREATE POLICY "transfer_requests_select_own"
  ON transfer_requests FOR SELECT TO authenticated
  USING (requested_by = get_my_employee_id());

-- Approve (UPDATE): admin or asset_manager or dept_head for own dept
CREATE POLICY "transfer_requests_update_admin_or_am"
  ON transfer_requests FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'))
  WITH CHECK (get_my_role() IN ('admin', 'asset_manager'));

CREATE POLICY "transfer_requests_update_dept_head"
  ON transfer_requests FOR UPDATE TO authenticated
  USING (
    get_my_role() = 'department_head'
    AND EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = transfer_requests.requested_by
        AND e.department_id = get_my_department_id()
    )
  )
  WITH CHECK (
    get_my_role() = 'department_head'
  );


-- ============================================================
-- TABLE: resource_bookings
-- ============================================================
ALTER TABLE resource_bookings ENABLE ROW LEVEL SECURITY;

-- All roles can book resources and see bookings
CREATE POLICY "resource_bookings_select_all"
  ON resource_bookings FOR SELECT TO authenticated USING (true);

CREATE POLICY "resource_bookings_insert_all"
  ON resource_bookings FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update/cancel their own bookings; admin can update any
CREATE POLICY "resource_bookings_update_own"
  ON resource_bookings FOR UPDATE TO authenticated
  USING (booked_by = get_my_employee_id() OR get_my_role() = 'admin')
  WITH CHECK (booked_by = get_my_employee_id() OR get_my_role() = 'admin');

CREATE POLICY "resource_bookings_delete_own"
  ON resource_bookings FOR DELETE TO authenticated
  USING (booked_by = get_my_employee_id() OR get_my_role() = 'admin');


-- ============================================================
-- TABLE: maintenance_requests
-- ============================================================
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;

-- All roles can raise a maintenance request
CREATE POLICY "maintenance_requests_insert_all"
  ON maintenance_requests FOR INSERT TO authenticated WITH CHECK (true);

-- SELECT: admin/asset_manager see all; others see only their own
CREATE POLICY "maintenance_requests_select_admin_or_am"
  ON maintenance_requests FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'));

CREATE POLICY "maintenance_requests_select_own"
  ON maintenance_requests FOR SELECT TO authenticated
  USING (requested_by = get_my_employee_id());

-- Approve/move status (UPDATE): only admin or asset_manager
CREATE POLICY "maintenance_requests_update_admin_or_am"
  ON maintenance_requests FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'asset_manager'))
  WITH CHECK (get_my_role() IN ('admin', 'asset_manager'));

-- DELETE: admin only
CREATE POLICY "maintenance_requests_delete_admin"
  ON maintenance_requests FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- TABLE: audit_cycles
-- ============================================================
ALTER TABLE audit_cycles ENABLE ROW LEVEL SECURITY;

-- SELECT: all authenticated (cycle metadata is non-sensitive)
CREATE POLICY "audit_cycles_select_all"
  ON audit_cycles FOR SELECT TO authenticated USING (true);

-- Only admin can create / close audit cycles
CREATE POLICY "audit_cycles_insert_admin"
  ON audit_cycles FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "audit_cycles_update_admin"
  ON audit_cycles FOR UPDATE TO authenticated
  USING (get_my_role() = 'admin')
  WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "audit_cycles_delete_admin"
  ON audit_cycles FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');


-- ============================================================
-- TABLE: notifications
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users see only their own notifications (or org-wide ones with recipient = NULL)
CREATE POLICY "notifications_select_own_or_broadcast"
  ON notifications FOR SELECT TO authenticated
  USING (
    recipient_id IS NULL  -- broadcast / org-wide
    OR recipient_id = get_my_employee_id()
    OR get_my_role() = 'admin'
  );

-- System / admins can insert notifications
CREATE POLICY "notifications_insert_admin"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = 'admin');

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated
  USING (recipient_id = get_my_employee_id() OR get_my_role() = 'admin')
  WITH CHECK (recipient_id = get_my_employee_id() OR get_my_role() = 'admin');
