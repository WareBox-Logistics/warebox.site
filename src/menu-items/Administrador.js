import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const userPermissions = JSON.parse(localStorage.getItem('permisos') || '[]'); // Convertir JSON a array
// ==============================|| DASHBOARD MENU ITEMS ||============================== //
const administrador = {
  id: 'administrador',
  title: 'Administrador',
  type: 'group',
  children: []
};

// Agregar elementos según permisos
if (userPermissions.includes('crear_rutas')) {
  administrador.children.push({
    id: 'rutas',
    title: 'Crear rutas',
    type: 'item',
    url: '/administrador',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('gestionar_usuarios_roles')) {
  administrador.children.push({
    id: 'usuarios',
    title: 'Usuarios',
    type: 'item',
    url: '/usuarios',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('registrar_editar_almacenes')) {
  administrador.children.push({
    id: 'almacenes',
    title: 'Almacenes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('generar_reportes_globales')) {
  administrador.children.push({
    id: 'reportes',
    title: 'Generar reportes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('gestionar_ubicaciones_productos')) {
    administrador.children.push({
    id: 'ubicaciones_productos',
    title: 'Ubicaciones de productos',
    type: 'item',
    url: '/administrador',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('aumentar_stock_productos')) {
    administrador.children.push({
    id: 'productos',
    title: 'Productos',
    type: 'item',
    url: '/administrador',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('consultar_informacion_productos')) {
    administrador.children.push({
    id: 'edi',
    title: 'Edi Config',
    type: 'item',
    url: '/administrador',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('registrar_cajas')) {
    administrador.children.push({
    id: 'registrar_cajas',
    title: 'Cajas',
    type: 'item',
    url: '/administrador',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('ver_viajes_asignados')) {
    administrador.children.push({
    id: 'viajes',
    title: 'Viajes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('visualizar_mapas_rutas')) {
    administrador.children.push({
    id: 'mapas',
    title: 'Mapas',
    type: 'item',
    url: '/administrador',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('recibir_notificaciones')) {
    administrador.children.push({
    id: 'notificaciones',
    title: 'Notificaciones',
    type: 'item',
    url: '/administrador',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('ver_perfil_personal')) {
  administrador.children.push({
    id: 'perfil',
    title: 'Perfil',
    type: 'item',
    url: '/administrador',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('monitorear_viajes_tiempo_real')) {
  administrador.children.push({
    id: 'monitorear_viajes',
    title: 'Monitorear Viajes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('revisar_historial_rutas_desempeno')) {
    administrador.children.push({
    id: 'historial_desempeno',
    title: 'Historial Desempeño',
    type: 'item',
    url: '/administrador',

    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('asignar_viajes_choferes')) {
  administrador.children.push({
    id: 'asignar_viajes',
    title: 'Asignar Viajes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('registrar_productos_viajes')) {
    administrador.children.push({
    id: 'productos_viajes',
    title: 'Productos Viajes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('monitorear_progreso_viajes')) {
    administrador.children.push({
    id: 'progreso_viajes',
    title: 'Progreso Viajes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}
if (userPermissions.includes('visualizar_reportes')) {
    administrador.children.push({
    id: 'documentation',
    title: 'Documentation',
    type: 'item',
    url: '/administrador',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('monitorear_viajes_tiempo_real')) {
  administrador.children.push({
    id: 'monitorear_viajes',
    title: 'Monitorear Viajes',
    type: 'item',
    url: '/administrador',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('revisar_historial_rutas_desempeno')) {
  administrador.children.push({
    id: 'historial_desempeno',
    title: 'Historial Desempeño',
    type: 'item',
    url: '/administrador',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('supervisar_capacidad_almacenes')) {
  administrador.children.push({
    id: 'supervisar_capacidad',
    title: 'Supervisar Capacidad',
    type: 'item',
    url: '/administrador',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

export default administrador;
