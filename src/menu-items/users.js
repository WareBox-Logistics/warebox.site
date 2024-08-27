// assets
import { IconDashboard, IconUser , IconPaperclip, IconMap2} from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const users = {
  id: 'users',
  title: 'Admin',
  type: 'group',
  children: [
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: icons.IconUser,
      breadcrumbs: false
    },
    {
      id: 'performance',
      title: 'Performance Dashboard',
      type: 'item',
      url: '/performance',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'documentation',
      title: 'Documentation',
      type: 'item',
      url: '/documentation',
      icon: icons.IconPaperclip,
      breadcrumbs: false
    },
    {
      id: 'edi',
      title: 'Edi Config',
      type: 'item',
      url: '/edi',
      icon: icons.IconMap2,
      breadcrumbs: false
    }
  ]
};

export default users;
