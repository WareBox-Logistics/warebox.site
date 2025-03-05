// src/routes/MainRoutes.jsx
import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '/src/components/PrivateRoute';
import { element } from 'prop-types';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/CustomerConfig')));
const NotificationHistory = Loadable(lazy(() => import('views/history/NotificationHistory')));
const UsersPage = Loadable(lazy(() => import('views/users/UsersPage')));
const PerformanceDashboard = Loadable(lazy(() => import('views/performance/PerformanceDashboard')));
const Documentation = Loadable(lazy(() => import('views/docs/Index')));
const EdiConfig = Loadable(lazy(() => import('views/edi-config/Index')));
const Administrador = Loadable(lazy(() => import('views/pages/administrador/Index')));
const Almacenista = Loadable(lazy(() => import('views/pages/almacenista/Sedes')));//ruta sedes(alamacenes)
const Chofer = Loadable(lazy(() => import('views/pages/chofer/Index')));
const Despacho = Loadable(lazy(() => import('views/pages/despacho/Index')));
const Operador = Loadable(lazy(() => import('views/pages/operador/Index')));
const Supervisor = Loadable(lazy(() => import('views/pages/supervisor/Index')));
const Users = Loadable(lazy(() => import('views/pages/administrador/Users')));
const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '/usuarios',
          element: <Users />
        },
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
          path: 'administrador',
          element: <Administrador />
        },
        {
          path: 'almacenista',
          element: <Almacenista />
        },
        {
          path: 'chofer',
          element: <Chofer />
        },
        {
          path: 'despacho',
          element: <Despacho />
        },
        {
          path: 'operador',
          element: <Operador />
        },
        {
          path: 'supervisor',
          element: <Supervisor />
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
            },
            {
              path: 'documentation',
              element: <Documentation />
            },
            {
              path: 'edi',
              element: <EdiConfig />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;
