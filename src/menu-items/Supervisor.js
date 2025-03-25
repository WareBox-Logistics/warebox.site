import { IconDashboard, IconUser, IconPaperclip } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip };

const supervisor = {
    id: 'supervisor',
    title: 'Supervisor',
    type: 'group',
    children: [
        {
            id: 'monitorear-viajes',
            title: 'Monitorear Viajes',
            type: 'item',
            url: '/supervisor/viajes-despacho',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'historial-desempeno',
            title: 'Historial Desempeño',
            type: 'item',
            url: '/supervisor/historial-desempeno',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'supervisar-capacidad',
            title: 'Supervisar Capacidad',
            type: 'item',
            url: '/supervisor/supervisar-capacidad',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        }
    ]
};

export default supervisor;
