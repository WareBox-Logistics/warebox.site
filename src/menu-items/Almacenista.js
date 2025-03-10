import { IconDashboard, IconPackage, IconPaperclip, IconMap2, IconBrandDatabricks, IconTruckLoading } from '@tabler/icons-react';

const icons = { IconDashboard, IconPackage, IconPaperclip, IconMap2, IconBrandDatabricks, IconTruckLoading };

const almacenista = {
    id: 'almacenista',
    title: 'Almacenista',
    type: 'group',
    children: [
        {
            id: 'Gestion-Almacenamiento',
            title: 'Gestion de almacenamiento',
            type: 'item',
            url: '/gestion-racks',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
        {
            id: 'Gestion-Pallets',
            title: 'Localizacion y transferencia de pallets',
            type: 'item',
            url: '/gestion-pallets',
            icon: icons.IconTruckLoading,
            breadcrumbs: false
        },
        {
            id: 'productos',
            title: 'Productos',
            type: 'item',
            url: '/productos',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'edi',
            title: 'Edi Config',
            type: 'item',
            url: '/edi',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
    ]
};

export default almacenista;
