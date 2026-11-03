import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Role } from '../types/domain';

/**
 * Защита маршрута по роли. Это только удобство интерфейса:
 * настоящую защиту данных делает база (RLS).
 */
export function RequireRole({ role }: { role: Role }) {
  const { profile } = useAuth();
  if (profile?.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
