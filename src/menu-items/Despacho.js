import { IconDashboard, IconLayoutDashboard, IconReport, IconTimelineEventExclamation, IconFlag3 } from '@tabler/icons-react';

const icons = { IconDashboard,  IconLayoutDashboard, IconReport, IconTimelineEventExclamation, IconFlag3 };

const despacho = {
    id: 'despacho',
    title: 'Despacho',
    type: 'group',
    children: [
        {
            id: 'dashboard-despacho',
            title: 'Monitoreo de Reportes',
            type: 'item',
            url: '/dispatch/dashboard-despacho',
            icon: icons.IconLayoutDashboard,
            breadcrumbs: false
        },
        {
            id: 'report-despacho',
            title: 'Reportes',
            type: 'item',
            url: '/dispatch/report-despacho',
            icon: icons.IconReport,
            breadcrumbs: false
        },
        {
            id: 'issue-despacho',
            title: 'Issue',
            type: 'item',
            url: '/dispatch/issue-despacho',
            icon: icons.IconTimelineEventExclamation,
            breadcrumbs: false
        },
        {
            id: 'support-despacho',
            title: 'Support',
            type: 'item',
            url: '/dispatch/support-despacho',
            icon: icons.IconFlag3,
            breadcrumbs: false
        }
    ]
};

export default despacho;
