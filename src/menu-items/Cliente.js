import { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuildingWarehouse, IconTruckLoading, 
    IconPackageExport, IconPackage, IconBrandDatabricks } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuildingWarehouse, IconTruckLoading, 
    IconPackageExport, IconPackage, IconBrandDatabricks};

const cliente = {
    id: 'cliente',
    title: 'Company',
    type: 'group',
    children: [
        {
            id: 'Ejemplo 1',
            title: 'Ejemplo 1',
            type: 'item',
            url: '/client/company',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
        {
            id: 'Ejemplo 2',
            title: 'Ejemplo2',
            type: 'item',
            url: '/client/<url>',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
        {
            id: 'Ejemplo 3',
            title: 'Ejemplo 3',
            type: 'item',
            url: '/client/<url>',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
        {
            id: 'Ejemplo 4',
            title: 'Ejemplo 4',
            type: 'item',
            url: '/client/<url>',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
    ]
};

export default cliente;

