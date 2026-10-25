import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getKitchenToken } from '../lib/axios';

/**
 * KitchenRoute Guard:
 * Prevents unauthorized access and layout mounting for /kitchen unless a valid kitchen token exists.
 */
const KitchenRoute: React.FC = () => {
  const hasKitchenToken = Boolean(getKitchenToken());

  if (!hasKitchenToken) {
    return <Navigate to="/kitchen/login" replace />;
  }

  return <Outlet />;
};

export default KitchenRoute;
