/**
 * useCurrentUser.js
 * ─────────────────────────────────────────────────────────────
 * Hook that returns the current logged-in user's employee row.
 *
 * Strategy (in order):
 *   1. Get Supabase auth session
 *   2. If session exists, fetch employee row via auth.uid() join
 *      (uses auth_user_id column — will exist after auth teammate merges)
 *   3. Falls back to email match if auth_user_id column isn't available yet
 *   4. If no session and VITE_DEV_MOCK_ROLE is set, returns a mock user
 *      so you can develop/test without a real login
 *
 * Returns: { role, employeeId, departmentId, name, email, loading, error }
 *
 * ⚠ Do NOT call this hook directly in many components — use
 *   useUserRole() from RoleContext instead, which is a single
 *   subscription shared across the whole app.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { ROLES } from '../utils/permissions';

// ──────────────────────────────────────────────
// Dev mock fallback
// Set VITE_DEV_MOCK_ROLE=admin (or any role) in .env.local
// to develop without a real Supabase session.
// ──────────────────────────────────────────────
const DEV_MOCK_ROLE = import.meta.env.VITE_DEV_MOCK_ROLE || null;

const DEV_MOCK_USER = DEV_MOCK_ROLE
  ? {
      role:         DEV_MOCK_ROLE,
      employeeId:   0,
      departmentId: null,
      name:         `Dev ${DEV_MOCK_ROLE}`,
      email:        `dev_${DEV_MOCK_ROLE}@assetflow.dev`,
      loading:      false,
      error:        null,
      isMock:       true,
    }
  : null;

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────
export function useCurrentUser() {
  const [state, setState] = useState({
    role:         null,
    employeeId:   null,
    departmentId: null,
    name:         null,
    email:        null,
    loading:      true,
    error:        null,
    isMock:       false,
  });

  useEffect(() => {
    let mounted = true;

    const fetchUser = async (session) => {
      if (!session) {
        // No session: use dev mock if configured, else unauthenticated state
        if (mounted) {
          setState(
            DEV_MOCK_USER || {
              role: null, employeeId: null, departmentId: null,
              name: null, email: null, loading: false, error: null, isMock: false,
            }
          );
        }
        return;
      }

      try {
        // First attempt: join via auth_user_id (post-auth-merge preferred path)
        let query = supabase
          .from('employees')
          .select('id, name, email, role, department_id');

        // Try auth_user_id first; Supabase won't error if column doesn't exist
        // until the query runs — we catch the error and fall back.
        let { data, error } = await query
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        // Fall back to email match if auth_user_id column doesn't exist yet
        // or if no row was found with auth_user_id
        if (error || !data) {
          const fallback = await supabase
            .from('employees')
            .select('id, name, email, role, department_id')
            .eq('email', session.user.email)
            .maybeSingle();

          data = fallback.data;
          error = fallback.error;
        }

        if (!mounted) return;

        if (error || !data) {
          // Session exists but no matching employee row — treat as basic employee
          setState({
            role:         ROLES.EMPLOYEE,
            employeeId:   null,
            departmentId: null,
            name:         session.user.email?.split('@')[0] || 'User',
            email:        session.user.email,
            loading:      false,
            error:        error?.message || 'Employee profile not found',
            isMock:       false,
          });
        } else {
          setState({
            role:         data.role || ROLES.EMPLOYEE,
            employeeId:   data.id,
            departmentId: data.department_id,
            name:         data.name,
            email:        data.email,
            loading:      false,
            error:        null,
            isMock:       false,
          });
        }
      } catch (err) {
        if (mounted) {
          setState((prev) => ({ ...prev, loading: false, error: err.message }));
        }
      }
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUser(session);
    });

    // 2. Subscribe to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setState((prev) => ({ ...prev, loading: true }));
          fetchUser(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}
