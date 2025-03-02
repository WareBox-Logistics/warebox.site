import { IconDashboard, IconUser } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser };

const despacho = {
    id: 'despacho',
    title: 'Despacho',
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
        }
    ]
};

export default despacho;
