import { IconDashboard, IconUser, IconPaperclip } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip };

const supervisor = {
    id: 'supervisor',
    title: 'Supervisor',
    type: 'group',
    children: [
        {
            id: 'monitorear_viajes',
            title: 'Monitorear Viajes',
            type: 'item',
            url: '/viajes-despacho',
            icon: icons.IconUser,
            breadcrumbs: false
        },
        {
            id: 'historial_desempeno',
            title: 'Historial Desempeño',
            type: 'item',
            url: '/historial-desempeno',
            icon: icons.IconDashboard,
            breadcrumbs: false
        },
        {
            id: 'supervisar_capacidad',
            title: 'Supervisar Capacidad',
            type: 'item',
            url: '/supervisar-capacidad',
            icon: icons.IconPaperclip,
            breadcrumbs: false
        }
    ]
};

export default supervisor;
