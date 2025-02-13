// assets
import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

// Obtener permisos desde localStorage
const userPermissions = JSON.parse(localStorage.getItem('permisos') || '[]'); // Convertir JSON a array

// ==============================|| DASHBOARD MENU ITEMS ||============================== //
const users = {
  id: 'users',
  title: 'Admin',
  type: 'group',
  children: []
};

// Agregar elementos según permisos
if (userPermissions.includes('gestionar_usuarios')) {
  users.children.push({
    id: 'users',
    title: 'Users',
    type: 'item',
    url: '/users',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('gestionar_rutas')) {
  users.children.push({
    id: 'performance',
    title: 'Performance Dashboard',
    type: 'item',
    url: '/performance',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('gestionar_almacenes')) {
  users.children.push({
    id: 'edi',
    title: 'Edi Config',
    type: 'item',
    url: '/edi',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('generar_reportes')) {
  users.children.push({
    id: 'documentation',
    title: 'Documentation',
    type: 'item',
    url: '/documentation',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

export default users;
