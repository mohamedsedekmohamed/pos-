import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLoginRedirectPath } from '../utils/authNavigation';
import LoadingSpinner from './ui/LoadingSpinner';

const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={getLoginRedirectPath()} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
