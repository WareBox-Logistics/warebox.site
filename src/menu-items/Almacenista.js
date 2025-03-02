import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

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
            icon: icons.IconPaperclip,
            breadcrumbs: false
        }
    ]
};

export default almacenista;
