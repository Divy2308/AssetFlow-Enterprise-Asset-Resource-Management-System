/**
 * permissions.js
 * ─────────────────────────────────────────────────────────────
 * Single source-of-truth for role constants and the permission
 * matrix. Both the UI gating (<RequireRole>) and any client-side
 * checks should import from here instead of scattering
 * `role === 'admin'` literals across the codebase.
 *
 * Keep this file in sync with:
 *   • supabase/migrations/20260712_003_employees_rls.sql
 *   • supabase/migrations/20260712_005_other_tables_rls_stubs.sql
 * ─────────────────────────────────────────────────────────────
 */

// ──────────────────────────────────────────────
// Role constants  (lowercase — matches the DB enum)
// ──────────────────────────────────────────────
export const ROLES = {
  ADMIN:            'admin',
  ASSET_MANAGER:    'asset_manager',
  DEPARTMENT_HEAD:  'department_head',
  EMPLOYEE:         'employee',
};

/** Ordered from most privileged → least privileged */
export const ROLE_ORDER = [
  ROLES.ADMIN,
  ROLES.ASSET_MANAGER,
  ROLES.DEPARTMENT_HEAD,
  ROLES.EMPLOYEE,
];

/** Human-readable display labels for each role */
export const ROLE_LABELS = {
  [ROLES.ADMIN]:           'Admin',
  [ROLES.ASSET_MANAGER]:   'Asset Manager',
  [ROLES.DEPARTMENT_HEAD]: 'Dept. Head',
  [ROLES.EMPLOYEE]:        'Employee',
};

/** Tailwind colour tokens for role badges (bg / text / border) */
export const ROLE_BADGE_STYLES = {
  [ROLES.ADMIN]: {
    bg:     'bg-purple-100',
    text:   'text-purple-700',
    border: 'border-purple-200',
    dot:    'bg-purple-500',
  },
  [ROLES.ASSET_MANAGER]: {
    bg:     'bg-blue-50',
    text:   'text-blue-700',
    border: 'border-blue-200',
    dot:    'bg-blue-500',
  },
  [ROLES.DEPARTMENT_HEAD]: {
    bg:     'bg-orange-50',
    text:   'text-primary-orange',
    border: 'border-primary-orange-border/30',
    dot:    'bg-primary-orange',
  },
  [ROLES.EMPLOYEE]: {
    bg:     'bg-bg-gray',
    text:   'text-text-secondary',
    border: 'border-border-color',
    dot:    'bg-text-muted',
  },
};

// ──────────────────────────────────────────────
// Permission matrix
// Keys map to named actions; values are arrays of allowed roles.
// ──────────────────────────────────────────────
export const PERMISSIONS = {
  // Org Setup
  manage_departments:      [ROLES.ADMIN],
  manage_categories:       [ROLES.ADMIN],
  promote_employees:       [ROLES.ADMIN],

  // Assets
  register_assets:         [ROLES.ADMIN, ROLES.ASSET_MANAGER],
  view_assets:             [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],

  // Allocation & Transfers
  allocate_assets:         [ROLES.ADMIN, ROLES.ASSET_MANAGER],
  approve_transfer:        [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD], // dept_head: own dept only
  approve_return:          [ROLES.ADMIN, ROLES.ASSET_MANAGER],

  // Resource Booking — open to all
  book_resources:          [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],

  // Maintenance
  raise_maintenance:       [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  approve_maintenance:     [ROLES.ADMIN, ROLES.ASSET_MANAGER],

  // Audit
  create_audit_cycle:      [ROLES.ADMIN],
  close_audit_cycle:       [ROLES.ADMIN],
  verify_audit_items:      [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD], // if assigned

  // Analytics / Reports
  view_org_analytics:      [ROLES.ADMIN],
  view_limited_analytics:  [ROLES.ADMIN, ROLES.ASSET_MANAGER],
  view_dept_analytics:     [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD],
  view_personal_analytics: [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],

  // Sidebar nav visibility
  nav_org_setup:           [ROLES.ADMIN],
  nav_assets:              [ROLES.ADMIN, ROLES.ASSET_MANAGER],
  nav_allocation:          [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD],
  nav_booking:             [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  nav_maintenance:         [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
  nav_audit:               [ROLES.ADMIN],
  nav_reports:             [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD],
  nav_notifications:       [ROLES.ADMIN, ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD, ROLES.EMPLOYEE],
};

/**
 * hasPermission(role, action)
 * Returns true if the given role is allowed to perform the named action.
 *
 * @param {string|null} role   - One of the ROLES values (or null/undefined while loading)
 * @param {string}      action - A key from the PERMISSIONS map
 * @returns {boolean}
 */
export function hasPermission(role, action) {
  if (!role || !action) return false;
  const allowed = PERMISSIONS[action];
  if (!allowed) {
    console.warn(`[permissions] Unknown action: "${action}". Check permissions.js.`);
    return false;
  }
  return allowed.includes(role);
}

/**
 * canAny(role, actions)
 * Returns true if the role has permission for ANY of the listed actions.
 *
 * @param {string|null} role
 * @param {string[]}    actions
 * @returns {boolean}
 */
export function canAny(role, actions) {
  return actions.some((a) => hasPermission(role, a));
}
