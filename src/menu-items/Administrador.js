import { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuilding } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2, IconBuilding };

const administrador = {
    id: 'administrador',
    title: 'Administrador',
    type: 'group',
    children: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            type: 'item',
            url: '/dashboard',
            icon: icons.IconDashboard,
            breadcrumbs: true
        },
        {
            id: 'rutas',
            title: 'Crear rutas',
            type: 'item',
            url: '/administrador',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'usuarios',
            title: 'Usuarios',
            type: 'item',
            url: '/usuarios',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'almacenes',
            title: 'Almacenes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'companies',
            title: 'Companies',
            type: 'item',
            url: '/companies',
            icon: icons.IconBuilding,
            breadcrumbs: false
        },
        {
            id: 'reportes',
            title: 'Generar reportes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        },
        {
            id: 'asignar_viajes',
            title: 'Asignar Viajes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'productos_viajes',
            title: 'Productos Viajes',
            type: 'item',
            url: '/administrador',
            icon: icons.IconDashboard,
            breadcrumbs: false
        }
    ]
};

export default administrador;
