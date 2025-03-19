import { Icon } from '@mui/material';
import { 
    IconDashboard,
    IconChartBar,
    IconUser, 
    IconPaperclip, 
    IconMap2, 
    IconBuilding, 
    IconShoppingCart, 
    IconDeviceAirtag, 
    IconRoute,
    IconBuildingWarehouse,
    IconTruck
} from '@tabler/icons-react';

const icons = { 
    IconDashboard,
    IconChartBar,
    IconUser, 
    IconPaperclip, 
    IconMap2, 
    IconBuilding, 
    IconShoppingCart, 
    IconDeviceAirtag,
    IconRoute,
    IconBuildingWarehouse,
    IconTruck
};

const administrador = {
    id: 'administrador',
    title: 'Administrador',
    type: 'group',
    children: [
        {
            id: 'companies',
            title: 'Companies',
            type: 'item',
            url: '/companies',
            icon: icons.IconBuilding,
            breadcrumbs: false
        },
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/dashboard',
            icon: icons.IconChartBar,
            breadcrumbs: true
        },
        {
            id: 'locations',
            title: 'Locations',
            type: 'item',
            url: '/locations',
            icon: icons.IconMap2,
            breadcrumbs: true
        },
        {
            id: 'products',
            title: 'Products',
            type: 'item',
            url: '/products',
            icon: icons.IconShoppingCart,
            breadcrumbs: false
        },
        {
            id: 'routes',
            title: 'Routes',
            type: 'item',
            url: '/routes',
            icon: icons.IconRoute,
            breadcrumbs: false
        },
        {
            id: 'services',
            title: 'Services',
            type: 'item',
            url: '/services',
            icon: icons.IconDeviceAirtag,
            breadcrumbs: false
        },
        {
            id: 'users',
            title: 'Users',
            type: 'item',
            url: '/users',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'vehicles',
            title: 'Vehicles',
            type: 'item',
            url: '/vehicles',
            icon: icons.IconTruck,
            breadcrumbs: false
        },
        {
            id: 'warehouses',
            title: 'Warehouses',
            type: 'item',
            url: '/warehouses',
            icon: icons.IconBuildingWarehouse,
            breadcrumbs: false
        },
        {
            id: 'reportes',
            title: 'Generar reportes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        },
        {
            id: 'asignar_viajes',
            title: 'Asignar Viajes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'productos_viajes',
            title: 'Productos Viajes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default administrador;
