import { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuildingWarehouse, IconTruckLoading, 
    IconPackageExport, IconPackage, IconBrandDatabricks } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuildingWarehouse, IconTruckLoading, 
    IconPackageExport, IconPackage, IconBrandDatabricks};

const almacenista = {
    id: 'almacenista',
    title: 'Almacenista',
    type: 'group',
    children: [
        {
            id: 'Gestion-Almacenamiento',
            title: 'Gestión de almacenamiento',
            type: 'item',
            url: '/gestion-racks',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
        {
            id: 'Gestion-Pallets',
            title: 'Localización y transferencia de pallets',
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
            title: 'EDI Config',
            type: 'item',
            url: '/edi',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'registrar_cajas',
            title: 'Cajas',
            type: 'item',
            url: '/cajas',
            icon: icons.IconPackageExport,
            breadcrumbs: false
        },
        {
            id: 'registrar_sede',
            title: 'Sedes',
            type: 'item',
            url: '/Sedes',
            icon: icons.IconBuildingWarehouse,
            breadcrumbs: false
        },
        {
            id: 'muelle',
            title: 'Muelles',
            type: 'item',
            url: '/Muelles',
            icon: icons.IconTruckLoading,
            breadcrumbs: false
        }
    ]
};

export default almacenista;

