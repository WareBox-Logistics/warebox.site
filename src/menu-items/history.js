// assets
import { IconBrandChrome, IconHelp } from '@tabler/icons-react';

// constant
const icons = { IconBrandChrome, IconHelp };

// ==============================|| SAMPLE PAGE & DOCUMENTATION MENU ITEMS ||============================== //

const history = {
  id: 'history-page',
  type: 'group',
  children: [
    {
      id: 'history',
      title: 'History Events',
      type: 'item',
      url: '/history',
      icon: icons.IconBrandChrome,
      breadcrumbs: false
    }
  ]
};

export default history;
