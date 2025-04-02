// src/routes/MainRoutes.jsx
import { lazy } from 'react';
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '/src/components/PrivateRoute';
// import { element } from 'prop-types';
// import Sedes from 'views/pages/almacenista/Sedes';
import Muelles from 'views/pages/almacenista/Muelles';
// import { patch } from '@mui/system';
import ProtectedRoute from 'components/ProtectedRoute';
import { Outlet } from 'react-router-dom';

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/CustomerConfig')));
// const NotificationHistory = Loadable(lazy(() => import('views/history/NotificationHistory')));
// const UsersPage = Loadable(lazy(() => import('views/users/UsersPage')));
// const PerformanceDashboard = Loadable(lazy(() => import('views/performance/PerformanceDashboard')));
// const Documentation = Loadable(lazy(() => import('views/docs/Index')));
// const EdiConfig = Loadable(lazy(() => import('views/edi-config/Index')));
// const Administrador = Loadable(lazy(() => import('views/pages/administrador/Index')));
// const Almacenista = Loadable(lazy(() => import('views/pages/almacenista/Index')));
const SedesPage = Loadable(lazy(() => import('views/pages/almacenista/Sedes')));
// const MuellesPage = Loadable(lazy(() => import('views/pages/almacenista/Muelles')));
const AlmacenistaRacks = Loadable(lazy(()=> import('views/pages/almacenista/GestionRacks')));
const AlmacenistaPallets = Loadable(lazy(()=> import('views/pages/almacenista/GestionPallets')));
// const Chofer = Loadable(lazy(() => import('views/pages/chofer/Index')));

const DashboardDis = Loadable(lazy(() => import('views/pages/despacho/DashboardDis')));
const Report = Loadable(lazy(() => import('views/pages/despacho/Report')))
const Issue = Loadable(lazy(() => import('views/pages/despacho/Issue')))
const Support = Loadable(lazy(() => import('views/pages/despacho/Report')))
const Problem = Loadable(lazy(() => import('views/pages/despacho/Problem')))


// const Operador = Loadable(lazy(() => import('views/pages/operador/Index')));
// const Supervisor = Loadable(lazy(() => import('views/pages/supervisor/Index')));
const Users = Loadable(lazy(() => import('views/pages/administrador/Users')));
const Companies = Loadable(lazy(() => import('views/pages/administrador/Companies')));
const Deliveries = Loadable(lazy(() => import('views/pages/administrador/Deliveries')));
const Products = Loadable(lazy(() => import('views/pages/administrador/Products')));
const Pallets = Loadable(lazy(() => import('views/pages/administrador/Pallets')));
const Roles = Loadable(lazy(() => import('views/pages/administrador/Roles')));
const Routes = Loadable(lazy(() => import('views/pages/administrador/Routes')));
const Services = Loadable(lazy(() => import('views/pages/administrador/Services')));
const Locations = Loadable(lazy(() => import('views/pages/administrador/Locations')));
const Warehouses = Loadable(lazy(() => import('views/pages/administrador/Warehouses')));
const Vehicles = Loadable(lazy(() => import('views/pages/administrador/Vehicles')));
const ParkingLots = Loadable(lazy(() => import('views/pages/administrador/ParkingLots')));
const Tracker = Loadable(lazy(() => import('views/pages/administrador/Tracker')));


// const Client = Loadable(lazy(() => import('views/pages/cliente/index')));
const ClientPallets = Loadable(lazy(() => import('views/pages/cliente/ClientPallets')));
const ClientDashboard = Loadable(lazy(() => import('views/pages/cliente/ClientDashboard')));
const ClientProducts = Loadable(lazy(() => import('views/pages/cliente/ClientProducts')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <PrivateRoute />,
      children: [
        {
          path: '/admin',
          element: (
            <ProtectedRoute role="Administrador">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
            {
              path: 'companies',
              element: <Companies />,
            },
            {
              path: 'dashboard',
              element: <DashboardDefault />,
            },
            {
              path: 'deliveries',
              element: <Deliveries />,
            },
            {
              path: 'locations',
              element: <Locations />
            },
            {
              path: 'pallets',
              element: <Pallets />
            },
            {
              path: 'parking-lots',
              element: <ParkingLots />
            },
            {
              path: 'products',
              element: <Products />
            },
            {
              path: 'roles',
              element: <Roles />
            },
            {
              path: 'routes',
              element: <Routes />
            },
            {
              path: 'services',
              element: <Services />
            },
            {
              path: 'tracker',
              element: <Tracker />
            },
            {
              path: 'users',
              element: <Users />
            },
            {
              path: 'vehicles',
              element: <Vehicles />
            },
            {
              path: 'warehouses',
              element: <Warehouses />
            },
          ]
        },
        {
          path: '/warehouseman',
          element: (
            <ProtectedRoute role="Almacenista">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
            {
              path: 'gestion-racks',
              element: <AlmacenistaRacks />
            },
            {
              path: 'gestion-pallets',
              element: <AlmacenistaPallets />
            },
            {
              path: 'sedes',
              element: <SedesPage />
            },
            {
              path: 'muelles',
              element: <Muelles />
            },
          ]
        },
        {
          path: '/driver',
          element: (
            <ProtectedRoute role="Chofer">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
          ]
        },
        {
          path: '/dispatch',
          element: (
            <ProtectedRoute role="Despacho">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
            {
              path: 'dashboard-despacho',
              element: <DashboardDis />
            },
            {
              path: 'problem-despacho',
              element: <Problem />
            },
            {
              path: 'report-despacho',
              element: <Report />
            },
            {
              path: 'issue-despacho',
              element: <Issue />
            },
            {
              path: 'support-despacho',
              element: <Support />
            },
          ]
        },
        {
          path: '/operator',
          element: (
            <ProtectedRoute role="Operador">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
          ]
        },
        {
          path: '/supervisor',
          element: (
            <ProtectedRoute role="Supervisor">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
          ]
        },
        {
          path: '/client',
          element: (
            <ProtectedRoute role="Cliente">
              <Outlet />
            </ProtectedRoute>
          ),
          children : [
            {
              path: 'client-dashboard',
              element: <ClientDashboard />
            },
            {
              path: 'client-pallets',
              element: <ClientPallets />
            },
            {
              path: 'client-products',
              element: <ClientProducts />
            },
          ]
        },
      ]
    }
  ]
};

export default MainRoutes;
