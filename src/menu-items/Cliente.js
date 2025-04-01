import { 
    IconDashboard, 
    IconPackageExport,
    IconChartBar,
    IconSection,
    IconLayoutGrid,
    IconShoppingBag
} from '@tabler/icons-react';

const icons = { 
    IconDashboard, 
    IconPackageExport,
    IconChartBar,
    IconSection,
    IconLayoutGrid,
    IconShoppingBag
};

const cliente = {
    id: 'cliente',
    title: 'Client',
    type: 'group',
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/client/client-dashboard',
            icon: icons.IconChartBar,
            breadcrumbs: false
        },
        {
            id: 'pallets',
            title: 'Pallets',
            type: 'item',
            url: '/client/client-pallets',
            icon: icons.IconLayoutGrid,
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

