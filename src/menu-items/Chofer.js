import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const chofer = {
    id: 'chofer',
    title: 'Chofer',
    type: 'group',
    children: [
        {
            id: 'viajes',
            title: 'Viajes',
            type: 'item',
            url: '/viajes',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'mapas',
            title: 'Mapas',
            type: 'item',
            url: '/mapas',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'notificaciones',
            title: 'Notificaciones',
            type: 'item',
            url: '/notificaciones',
            icon: icons.IconMap2,
            breadcrumbs: false
        },
        {
            id: 'perfil',
            title: 'Perfil',
            type: 'item',
            url: '/perfil',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        }
    ]
};

export default chofer;
