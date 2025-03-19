import { IconDashboard, IconLayoutDashboard, IconReport, IconTimelineEventExclamation, IconFlag3 } from '@tabler/icons-react';

const icons = { IconDashboard,  IconLayoutDashboard, IconReport, IconTimelineEventExclamation, IconFlag3 };

const despacho = {
    id: 'despacho',
    title: 'Despacho',
    type: 'group',
    children: [
        {
            id: 'Dashboard',
            title: 'Monitoreo de Reportes',
            type: 'item',
            url: '/dashboard-despacho',
            icon: icons.IconLayoutDashboard,
            breadcrumbs: false
        },
        {
            id: 'Reporte',
            title: 'Reportes',
            type: 'item',
            url: '/report-despacho',
            icon: icons.IconReport,
            breadcrumbs: false
        },
        {
            id: 'Issue',
            title: 'Issue',
            type: 'item',
            url: '/issue-despacho',
            icon: icons.IconTimelineEventExclamation,
            breadcrumbs: false
        },
        {
            id: 'Support',
            title: 'Support',
            type: 'item',
            url: '/support-despacho',
            icon: icons.IconFlag3,
            breadcrumbs: false
        }
    ]
};

export default despacho;
