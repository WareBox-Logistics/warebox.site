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
            id: 'dashboard-warehouse',
            title: 'Dashboard',
            type: 'item',
            url: '/warehouseman/dashboard-warehouse',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },{
            id: 'gestion-racks',
            title: 'Gestión de almacenamiento',
            type: 'item',
            url: '/warehouseman/gestion-racks',
            icon: icons.IconBrandDatabricks,
            breadcrumbs: false
        },
        {
            id: 'gestion-pallets',
            title: 'Localización y transferencia de pallets',
            type: 'item',
            url: '/warehouseman/gestion-pallets',
            icon: icons.IconTruckLoading,
            breadcrumbs: false
        },
        // {
        //     id: 'productos',
        //     title: 'Productos',
        //     type: 'item',
        //     url: '/warehouseman/productos',
        //     icon: icons.IconDashboard,
        //     breadcrumbs: false
        // },
       
        {
            id: 'sedes',
            title: 'Sedes',
            type: 'item',
            url: '/warehouseman/sedes',
            icon: icons.IconBuildingWarehouse,
            breadcrumbs: false
        },
        {
            id: 'muelles',
            title: 'Muelles',
            type: 'item',
            url: '/warehouseman/muelles',
            icon: icons.IconTruckLoading,
            breadcrumbs: false
        }
    ]
};

export default almacenista;

