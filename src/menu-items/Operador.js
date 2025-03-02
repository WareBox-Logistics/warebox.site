import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const operador = {
    id: 'operador',
    title: 'Operador',
    type: 'group',
    children: [
        {
            id: 'asignar_viajes',
            title: 'Asignar Viajes',
            type: 'item',
            url: '/asignar-viajes',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'productos_viajes',
            title: 'Productos Viajes',
            type: 'item',
            url: '/productos-viajes',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'progreso_viajes',
            title: 'Progreso Viajes',
            type: 'item',
            url: '/progreso-viajes',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'documentation',
            title: 'Documentation',
            type: 'item',
            url: '/documentation',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        }
    ]
};

export default operador;
