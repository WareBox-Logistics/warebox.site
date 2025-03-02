import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const administrador = {
    id: 'administrador',
    title: 'Administrador',
    type: 'group',
    children: [
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
