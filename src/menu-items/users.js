// assets
import { IconDashboard, IconUser } from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconUser };

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
    }
  ]
};

export default users;
