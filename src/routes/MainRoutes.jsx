// src/routes/MainRoutes.jsx
import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '/src/components/PrivateRoute';
import { element } from 'prop-types';
import Sedes from 'views/pages/almacenista/Sedes';
import Muelles from 'views/pages/almacenista/Muelles';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/CustomerConfig')));
const NotificationHistory = Loadable(lazy(() => import('views/history/NotificationHistory')));
const UsersPage = Loadable(lazy(() => import('views/users/UsersPage')));
const PerformanceDashboard = Loadable(lazy(() => import('views/performance/PerformanceDashboard')));
const Documentation = Loadable(lazy(() => import('views/docs/Index')));
const EdiConfig = Loadable(lazy(() => import('views/edi-config/Index')));
const Administrador = Loadable(lazy(() => import('views/pages/administrador/Index')));
const Almacenista = Loadable(lazy(() => import('views/pages/almacenista/Index')));
const SedesPage = Loadable(lazy(() => import('views/pages/almacenista/Sedes')));
const MuellesPage = Loadable(lazy(() => import('views/pages/almacenista/Muelles')));
const AlmacenistaRacks = Loadable(lazy(()=> import('views/pages/almacenista/GestionRacks')));
const AlmacenistaPallets = Loadable(lazy(()=> import('views/pages/almacenista/GestionPallets')));
const Chofer = Loadable(lazy(() => import('views/pages/chofer/Index')));

const DashboardDis = Loadable(lazy(() => import('views/pages/despacho/DashboardDis')));
const Report = Loadable(lazy(() => import('views/pages/despacho/Report')))
const Issue = Loadable(lazy(() => import('views/pages/despacho/Issue')))
const Support = Loadable(lazy(() => import('views/pages/despacho/Support')))



const Operador = Loadable(lazy(() => import('views/pages/operador/Index')));
const Supervisor = Loadable(lazy(() => import('views/pages/supervisor/Index')));
const Users = Loadable(lazy(() => import('views/pages/administrador/Users')));
const Companies = Loadable(lazy(() => import('views/pages/administrador/Companies')));
const Products = Loadable(lazy(() => import('views/pages/administrador/Products')));
const Routes = Loadable(lazy(() => import('views/pages/administrador/Routes')));
const Services = Loadable(lazy(() => import('views/pages/administrador/Services')));
const Locations = Loadable(lazy(() => import('views/pages/administrador/Locations')));
const Warehouses = Loadable(lazy(() => import('views/pages/administrador/Warehouses')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '/companies',
          element: <Companies />
        },
        {
          path: '/locations',
          element: <Locations />
        },
        {
          path: '/products',
          element: <Products />
        },
        {
          path: '/routes',
          element: <Routes />
        },
        {
          path: '/services',
          element: <Services />
        },
        {
          path: '/usuarios',
          element: <Users />
        },
        {
          path: '/warehouses',
          element: <Warehouses />
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
          path: 'gestion-racks',
          element: <AlmacenistaRacks />
        },
        {
          path: 'gestion-pallets',
          element: <AlmacenistaPallets />
        },
        {
          path: 'Sedes',
          element: <SedesPage />
        },
        {
          path: 'Muelles',
          element: <Muelles />
        },
        {
          path: 'chofer',
          element: <Chofer />
        },
        {
          path: '/dashboard-despacho',
          element: <DashboardDis />
        },
        {
          path: '/report-despacho',
          element: <Report />
        },
        {
          path: '/issue-despacho',
          element: <Issue />
        },
        {
          path: '/support-despacho',
          element: <Support />
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
