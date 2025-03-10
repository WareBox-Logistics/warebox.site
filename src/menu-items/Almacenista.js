<<<<<<< HEAD
import { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuildingWarehouse,IconTruckLoading,IconPackageExport } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2,IconBuildingWarehouse,IconTruckLoading,IconPackageExport };
=======
import { IconDashboard, IconPackage, IconPaperclip, IconMap2, IconBrandDatabricks, IconTruckLoading } from '@tabler/icons-react';

const icons = { IconDashboard, IconPackage, IconPaperclip, IconMap2, IconBrandDatabricks, IconTruckLoading };
>>>>>>> origin/desarrollo

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
<<<<<<< HEAD
        {
            id: 'registrar_cajas',
            title: 'Cajas',
            type: 'item',
            url: '/cajas',
            icon: icons.IconPackageExport, //SE AJUSTO EL ICONO
            breadcrumbs: false
        },
        {//SE AJUSTO EN EL MENU
            id: 'registrar_sede',
            title: 'Sedes',
            type: 'item',
            url: '/Sedes',
            icon: icons.IconBuildingWarehouse,
            breadcrumbs: false
        },
        {//SE AJUSTO EN EL MENU
            id: 'muelle',
            title: 'Muelles',
            type: 'item',
            url: '/Muelles',
            icon: icons.IconTruckLoading,
            breadcrumbs: false
        }
=======
>>>>>>> origin/desarrollo
    ]
};

export default almacenista;
