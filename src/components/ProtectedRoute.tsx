import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  hospital_owner: '/dashboard/owner',
  branch_admin: '/dashboard/branch',
  department_admin: '/dashboard/branch',
  doctor: '/dashboard/doctor',
  receptionist: '/dashboard/reception',
  saas_admin: '/dashboard/owner',
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_DEFAULT_ROUTES[user.role]} replace />;
  }

  return <>{children}</>;
}

export function getRoleDefaultRoute(role: UserRole): string {
  return ROLE_DEFAULT_ROUTES[role];
}
