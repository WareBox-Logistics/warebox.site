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

const Company = {
    id: 'company',
    title: 'Company',
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
    ]
};

export default Company;
