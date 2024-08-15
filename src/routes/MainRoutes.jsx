// src/routes/MainRoutes.jsx
import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '/src/components/PrivateRoute';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/CustomerConfig')));
const NotificationHistory = Loadable(lazy(() => import('views/history/NotificationHistory')));
const UsersPage = Loadable(lazy(() => import('views/users/UsersPage')));
const PerformanceDashboard = Loadable(lazy(() => import('views/performance/PerformanceDashboard')));
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <DashboardDefault />
        },
        {
          path: 'dashboard',
          element: <DashboardDefault />
        },
        {
          path: 'history',
          element: <NotificationHistory />
        },
        {
          path: '',
          element: <PrivateRoute adminOnly />, // Protege la ruta de usuarios
          children: [
            {
              path: 'users',
              element: <UsersPage />
            },
            {
              path: 'performance',
              element: <PerformanceDashboard />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
