import { useState, useEffect, useMemo } from 'react';
import { Typography, Box, Skeleton } from '@mui/material';
import NavGroup from './NavGroup';
import getMenuItems from 'menu-items';

const MenuList = () => {
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchPermissions = () => {
      const permissions = JSON.parse(localStorage.getItem('permisos') || '[]');
      setUserPermissions(permissions);
      setLoading(false);
    };

    setTimeout(fetchPermissions, 200);
  }, []);

  // 🧠 Memoriza el menú
  const menuItems = useMemo(() => {
    return getMenuItems(role);
  }, [role]);

  // 🧠 Memoriza los elementos del menú
  const navItems = useMemo(() => {
    if (!menuItems || !menuItems.items) return null;

    return menuItems.items.map((item) => {
      switch (item.type) {
        case 'group':
          return <NavGroup key={item.id} item={item} />;
        default:
          return (
            <Typography key={item.id} variant="h6" color="error" align="center">
              Menu Items Error
            </Typography>
          );
      }
    });
  }, [menuItems]);

  // 🌀 Muestra los Skeletons mientras carga
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="80%" height={20} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!navItems) {
    return (
      <Typography variant="h6" color="error" align="center">
        Menu Items Error
      </Typography>
    );
  }

  return <>{navItems}</>;
};

export default MenuList;
