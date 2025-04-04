// src/routes/AuthenticationRoutes.jsx
import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import { patch } from '@mui/system';
import { element } from 'prop-types';
import OfflinePage from 'views/pages/ofline';

const AuthLogin = Loadable(lazy(() => import('views/pages/authentication/auth-forms/AuthLogin')));
const AuthRegister = Loadable(lazy(() => import('views/pages/authentication/auth-forms/AuthRegister')));
const Logout = Loadable(lazy(() => import('views/pages/authentication/auth-forms/Logout')));

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: 'login',
      element: <AuthLogin />
    },
    {
      path: 'register',
      element: <AuthRegister />
    },
    {
      path: 'logout',
      element: <Logout />
    },
    {
      path: 'offline',
      element: <OfflinePage />
    },
  ]
};

export default AuthenticationRoutes;
