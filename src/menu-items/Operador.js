import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const operador = {
    id: 'operator',
    title: 'Operador',
    type: 'group',
    children: [
        {
            id: 'asignar-viajes',
            title: 'Asignar Viajes',
            type: 'item',
            url: '/operator/asignar-viajes',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'productos-viajes',
            title: 'Productos Viajes',
            type: 'item',
            url: '/operator/productos-viajes',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'progreso-viajes',
            title: 'Progreso Viajes',
            type: 'item',
            url: '/operator/progreso-viajes',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
    ]
};

export default operador;
