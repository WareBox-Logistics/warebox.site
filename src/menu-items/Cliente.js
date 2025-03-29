import { 
    IconDashboard, 
    IconPackageExport,
    IconChartBar,
    IconSection,
    IconLayoutGrid
} from '@tabler/icons-react';

const icons = { 
    IconDashboard, 
    IconPackageExport,
    IconChartBar,
    IconSection,
    IconLayoutGrid
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
        }
    ]
};

export default cliente;

