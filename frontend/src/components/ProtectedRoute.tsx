import React from 'react';
import { Navigate } from 'react-router-dom';
import { userService } from '@/services/userService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    if (!userService.isLoggedIn()) {
        // Redirect to landing page if not logged in
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
