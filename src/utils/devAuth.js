/**
 * devAuth.js
 * ─────────────────────────────────────────────────────────────
 * Development-only authentication module that provides simple
 * credential-based login for each role WITHOUT requiring real
 * Supabase Auth accounts.
 *
 * This enables teammates to test role-based UI gating locally
 * by logging in with predefined credentials.
 *
 * ⚠ This module should NEVER be used in production.
 *   It stores the "session" in localStorage and does not
 *   touch Supabase Auth at all.
 * ─────────────────────────────────────────────────────────────
 */

import { ROLES, ROLE_LABELS } from './permissions';

// ──────────────────────────────────────────────
// Predefined dev accounts — one per role
// ──────────────────────────────────────────────
export const DEV_ACCOUNTS = [
  {
    email:        'admin@assetflow.dev',
    password:     'admin123',
    role:         ROLES.ADMIN,
    name:         'Divy Patel',
    employeeId:   1,
    departmentId: null,      // admin sees all departments
  },
  {
    email:        'manager@assetflow.dev',
    password:     'manager123',
    role:         ROLES.ASSET_MANAGER,
    name:         'Ravi Kumar',
    employeeId:   2,
    departmentId: 1,
  },
  {
    email:        'depthead@assetflow.dev',
    password:     'depthead123',
    role:         ROLES.DEPARTMENT_HEAD,
    name:         'Priya Sharma',
    employeeId:   3,
    departmentId: 2,
  },
  {
    email:        'employee@assetflow.dev',
    password:     'employee123',
    role:         ROLES.EMPLOYEE,
    name:         'Jay Shah',
    employeeId:   4,
    departmentId: 2,
  },
];

const STORAGE_KEY = 'assetflow_dev_session';

// ──────────────────────────────────────────────
// Dev session helpers
// ──────────────────────────────────────────────

/**
 * Attempt to log in with the given credentials.
 * Returns { success: true, user: {...} } or { success: false, error: '...' }
 */
export function devLogin(email, password) {
  const account = DEV_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );

  if (!account) {
    return { success: false, error: 'Invalid email or password. Use one of the dev credentials.' };
  }

  const session = {
    email:        account.email,
    role:         account.role,
    name:         account.name,
    employeeId:   account.employeeId,
    departmentId: account.departmentId,
    loggedInAt:   new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

/**
 * Get the current dev session (if any).
 * Returns the session object or null.
 */
export function getDevSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Clear the dev session (logout).
 */
export function devLogout() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if a dev session is active.
 */
export function hasDevSession() {
  return getDevSession() !== null;
}
