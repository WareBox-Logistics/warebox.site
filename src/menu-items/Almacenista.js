import { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuildingWarehouse,IconTruckLoading,IconPackageExport } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2,IconBuildingWarehouse,IconTruckLoading,IconPackageExport };

const almacenista = {
    id: 'almacenista',
    title: 'Almacenista',
    type: 'group',
    children: [
        {
            id: 'ubicaciones_productos',
            title: 'Ubicaciones de productos',
            type: 'item',
            url: '/ubicaciones-productos',
            icon: icons.IconUser,
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
    ]
};

export default almacenista;
