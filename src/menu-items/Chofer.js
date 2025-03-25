import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const chofer = {
    id: 'driver',
    title: 'Chofer',
    type: 'group',
    children: [
        {
            id: 'viajes',
            title: 'Viajes',
            type: 'item',
            url: '/driver/viajes',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'mapas',
            title: 'Mapas',
            type: 'item',
            url: '/driver/mapas',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'notificaciones',
            title: 'Notificaciones',
            type: 'item',
            url: '/driver/notificaciones',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'perfil',
            title: 'Perfil',
            type: 'item',
            url: '/driver/perfil',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        }
    ]
};

export default chofer;
