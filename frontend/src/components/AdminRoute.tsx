import { Navigate } from 'react-router-dom';
import { userService } from '@/services/userService';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  if (!userService.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};