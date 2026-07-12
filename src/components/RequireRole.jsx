/**
 * RequireRole.jsx
 * ─────────────────────────────────────────────────────────────
 * Guard component that conditionally renders its children based
 * on the current user's role.
 *
 * Props:
 *   allow    {string[]}  - Roles that may see the children.
 *                          Use ROLES constants from permissions.js.
 *   fallback {ReactNode} - What to render when access is denied.
 *                          Defaults to null (renders nothing).
 *                          Pass a JSX element for full-page denials.
 *   children {ReactNode} - Content to protect.
 *
 * Examples:
 *   // Hide a button from non-admins (renders nothing if denied)
 *   <RequireRole allow={[ROLES.ADMIN]}>
 *     <button>Delete Department</button>
 *   </RequireRole>
 *
 *   // Show a full "not authorized" page for non-admins
 *   <RequireRole allow={[ROLES.ADMIN]} fallback={<AccessDenied />}>
 *     <OrgSetupPage />
 *   </RequireRole>
 *
 *   // While loading, render nothing (avoids flash of unauthorised content)
 * ─────────────────────────────────────────────────────────────
 */

import React from 'react';
import { useUserRole } from '../context/RoleContext';

// ──────────────────────────────────────────────
// Default "Access Denied" full-page fallback
// Exported so callers can reuse it
// ──────────────────────────────────────────────
export function AccessDeniedBlock({ message }) {
  return (
    <div className="text-center font-bold text-alert-red-text p-10 bg-white border border-border-color rounded-2xl max-w-lg mx-auto mt-10 shadow-sm flex flex-col items-center gap-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-alert-red-text"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span>
        {message || 'Access Denied: You do not have permission to view this page.'}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────
// RequireRole component
// ──────────────────────────────────────────────
export default function RequireRole({ allow, fallback = null, children }) {
  const { role, loading } = useUserRole();

  // While role is loading, render nothing to avoid a flash of unauthorised content
  if (loading) return null;

  // Check if the current role is in the allow list
  if (!role || !allow.includes(role)) {
    return fallback;
  }

  return children;
}
