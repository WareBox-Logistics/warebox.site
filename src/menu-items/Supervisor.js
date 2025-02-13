import { IconDashboard, IconUser, IconPaperclip, IconMap2 } from '@tabler/icons-react';

const icons = { IconDashboard, IconUser, IconPaperclip, IconMap2 };

const userPermissions = JSON.parse(localStorage.getItem('permisos') || '[]'); // Convertir JSON a array
// ==============================|| DASHBOARD MENU ITEMS ||============================== //
const supervisor = {
  id: 'supervisor',
  title: 'Supervisor',
  type: 'group',
  children: []
};

// Agregar elementos según permisos
if (userPermissions.includes('crear_rutas')) {
  supervisor.children.push({
    id: 'rutas',
    title: 'Crear rutas',
    type: 'item',
    url: '/rutas',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('gestionar_usuarios_roles')) {
  supervisor.children.push({
    id: 'usuarios',
    title: 'Usuarios',
    type: 'item',
    url: '/usuarios',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('registrar_editar_almacenes')) {
  supervisor.children.push({
    id: 'almacenes',
    title: 'Almacenes',
    type: 'item',
    url: '/almacenes',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('generar_reportes_globales')) {
  supervisor.children.push({
    id: 'reportes',
    title: 'Generar reportes',
    type: 'item',
    url: '/reportes',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('gestionar_ubicaciones_productos')) {
    supervisor.children.push({
    id: 'ubicaciones_productos',
    title: 'Ubicaciones de productos',
    type: 'item',
    url: '/ubicaciones-productos',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('aumentar_stock_productos')) {
    supervisor.children.push({
    id: 'productos',
    title: 'Productos',
    type: 'item',
    url: '/productos',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('consultar_informacion_productos')) {
    supervisor.children.push({
    id: 'edi',
    title: 'Edi Config',
    type: 'item',
    url: '/edi',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('registrar_cajas')) {
    supervisor.children.push({
    id: 'registrar_cajas',
    title: 'Cajas',
    type: 'item',
    url: '/cajas',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('ver_viajes_asignados')) {
    supervisor.children.push({
    id: 'viajes',
    title: 'Viajes',
    type: 'item',
    url: '/viajes',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('visualizar_mapas_rutas')) {
    supervisor.children.push({
    id: 'mapas',
    title: 'Mapas',
    type: 'item',
    url: '/mapas',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('recibir_notificaciones')) {
    supervisor.children.push({
    id: 'notificaciones',
    title: 'Notificaciones',
    type: 'item',
    url: '/notificaciones',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}

if (userPermissions.includes('ver_perfil_personal')) {
  supervisor.children.push({
    id: 'perfil',
    title: 'Perfil',
    type: 'item',
    url: '/perfil',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('monitorear_viajes_tiempo_real')) {
  supervisor.children.push({
    id: 'monitorear_viajes',
    title: 'Monitorear Viajes',
    type: 'item',
    url: '/viajes-despacho',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('revisar_historial_rutas_desempeno')) {
    supervisor.children.push({
    id: 'historial_desempeno',
    title: 'Historial Desempeño',
    type: 'item',
    url: '/historial-desempeno',

    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('asignar_viajes_choferes')) {
  supervisor.children.push({
    id: 'asignar_viajes',
    title: 'Asignar Viajes',
    type: 'item',
    url: '/asignar-viajes',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('registrar_productos_viajes')) {
    supervisor.children.push({
    id: 'productos_viajes',
    title: 'Productos Viajes',
    type: 'item',
    url: '/productos-viajes',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('monitorear_progreso_viajes')) {
    supervisor.children.push({
    id: 'progreso_viajes',
    title: 'Progreso Viajes',
    type: 'item',
    url: '/progreso-viajes',
    icon: icons.IconMap2,
    breadcrumbs: false
  });
}
if (userPermissions.includes('visualizar_reportes')) {
    supervisor.children.push({
    id: 'documentation',
    title: 'Documentation',
    type: 'item',
    url: '/documentation',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

if (userPermissions.includes('monitorear_viajes_tiempo_real')) {
  supervisor.children.push({
    id: 'monitorear_viajes',
    title: 'Monitorear Viajes',
    type: 'item',
    url: '/viajes-despacho',
    icon: icons.IconUser,
    breadcrumbs: false
  });
}

if (userPermissions.includes('revisar_historial_rutas_desempeno')) {
  supervisor.children.push({
    id: 'historial_desempeno',
    title: 'Historial Desempeño',
    type: 'item',
    url: '/historial-desempeno',
    icon: icons.IconDashboard,
    breadcrumbs: false
  });
}

if (userPermissions.includes('supervisar_capacidad_almacenes')) {
  supervisor.children.push({
    id: 'supervisar_capacidad',
    title: 'Supervisar Capacidad',
    type: 'item',
    url: '/supervisar-capacidad',
    icon: icons.IconPaperclip,
    breadcrumbs: false
  });
}

export default supervisor;
