import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';

export const BranchPrivateRoute: React.FC = () => {
  const { isBranchAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isBranchAuthenticated) {
    return <Navigate to="/branch/login" replace />;
  }

  return <Outlet />;
};

export default BranchPrivateRoute;
