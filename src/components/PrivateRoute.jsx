// src/components/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '/src/context/AuthContext';
import { CircularProgress } from '@mui/material';

const PrivateRoute = ({ adminOnly }) => {
  const { isAuthenticated, loadingAuth, authChecked, isAdmin } = useContext(AuthContext);
  const location = useLocation();

  if (loadingAuth || !authChecked) {
    return <CircularProgress />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }
  
  return <Outlet />;
};

export default PrivateRoute;
