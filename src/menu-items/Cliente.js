import { Icon } from '@mui/material';
import { 
    IconDashboard, 
    IconPackageExport,
    IconChartBar,
    IconSection,
    IconMap2,
    IconLayoutGrid,
    IconPackages,
    IconShoppingBag,
    IconTruckDelivery
} from '@tabler/icons-react';

const icons = { 
    IconDashboard, 
    IconPackageExport,
    IconChartBar,
    IconSection,
    IconMap2,
    IconLayoutGrid,
    IconPackages,
    IconShoppingBag,
    IconTruckDelivery
};

const cliente = {
    id: 'cliente',
    title: 'Client',
    type: 'group',
    children: [
        // {
        //     id: 'dashboard',
        //     title: 'Dashboard',
        //     type: 'item',
        //     url: '/client/client-dashboard',
        //     icon: icons.IconChartBar,
        //     breadcrumbs: false
        // },
        {
            id: 'deliveries',
            title: 'Deliveries',
            type: 'item',
            url: '/client/client-deliveries',
            icon: icons.IconTruckDelivery,
            breadcrumbs: false
        },
        {
            id: 'locations',
            title: 'Locations',
            type: 'item',
            url: '/client/client-locations',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'pallets',
            title: 'Pallets',
            type: 'item',
            url: '/client/client-pallets',
            icon: icons.IconPackages,
            breadcrumbs: false
        },
        {
            id: 'products',
            title: 'Products',
            type: 'item',
            url: '/client/client-products',
            icon: icons.IconShoppingBag,
            breadcrumbs: false
        }
    ]
};

export default cliente;

