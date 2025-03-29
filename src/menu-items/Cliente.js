import { 
    IconDashboard, 
    IconUser, 
    IconPaperclip, 
    IconMap2, 
    IconBuildingWarehouse, 
    IconTruckLoading, 
    IconPackageExport, 
    IconPackage, 
    IconBrandDatabricks 
} from '@tabler/icons-react';

const icons = { 
    IconDashboard, 
    IconUser, 
    IconPaperclip, 
    IconMap2, 
    IconBuildingWarehouse, 
    IconTruckLoading, 
    IconPackageExport, 
    IconPackage, 
    IconBrandDatabricks
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
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'pallets',
            title: 'Pallets',
            type: 'item',
            url: '/client/client-pallets',
            icon: icons.IconPackageExport,
            breadcrumbs: false
        }
    ]
};

export default cliente;

