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
    IconTruck,
    IconLayoutGrid
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
    IconTruck,
    IconLayoutGrid
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
            url: '/admin/companies',
            icon: icons.IconBuilding,
            breadcrumbs: false
        },
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/admin/dashboard',
            icon: icons.IconChartBar,
            breadcrumbs: true
        },
        {
            id: 'locations',
            title: 'Locations',
            type: 'item',
            url: '/admin/locations',
            icon: icons.IconMap2,
            breadcrumbs: true
        },
        {
            id: 'parking-lots',
            title: 'Parking Lots',
            type: 'item',
            url: '/admin/parking-lots',
            icon: icons.IconLayoutGrid,
            breadcrumbs: false
        },
        {
            id: 'products',
            title: 'Products',
            type: 'item',
            url: '/admin/products',
            icon: icons.IconShoppingCart,
            breadcrumbs: false
        },
        {
            id: 'routes',
            title: 'Routes',
            type: 'item',
            url: '/admin/routes',
            icon: icons.IconRoute,
            breadcrumbs: false
        },
        {
            id: 'services',
            title: 'Services',
            type: 'item',
            url: '/admin/services',
            icon: icons.IconDeviceAirtag,
            breadcrumbs: false
        },
        {
            id: 'users',
            title: 'Users',
            type: 'item',
            url: '/admin/users',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'vehicles',
            title: 'Vehicles',
            type: 'item',
            url: '/admin/vehicles',
            icon: icons.IconTruck,
            breadcrumbs: false
        },
        {
            id: 'warehouses',
            title: 'Warehouses',
            type: 'item',
            url: '/admin/warehouses',
            icon: icons.IconBuildingWarehouse,
            breadcrumbs: false
        },
    ]
};

export default administrador;
