/**
 * RoleContext.jsx
 * ─────────────────────────────────────────────────────────────
 * React context that makes the current user's role data available
 * to any component in the tree without prop drilling.
 *
 * Usage:
 *   // In App.jsx (or main.jsx):
 *   <RoleProvider>
 *     <App />
 *   </RoleProvider>
 *
 *   // In any component:
 *   const { role, employeeId, loading } = useUserRole();
 * ─────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';

// ──────────────────────────────────────────────
// Context
// ──────────────────────────────────────────────
const RoleContext = createContext({
  role:         null,
  employeeId:   null,
  departmentId: null,
  name:         null,
  email:        null,
  loading:      true,
  error:        null,
  isMock:       false,
});

// ──────────────────────────────────────────────
// Provider — wrap the app root with this
// ──────────────────────────────────────────────
export function RoleProvider({ children }) {
  const user = useCurrentUser();

  return (
    <RoleContext.Provider value={user}>
      {children}
    </RoleContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Consumer hook — use anywhere in the component tree
// ──────────────────────────────────────────────
export function useUserRole() {
  const ctx = useContext(RoleContext);
  if (ctx === undefined) {
    throw new Error('useUserRole() must be used within a <RoleProvider>');
  }
  return ctx;
}

export default RoleContext;
