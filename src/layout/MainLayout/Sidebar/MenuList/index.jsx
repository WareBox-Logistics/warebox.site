// src/layout/MainLayout/Sidebar/MenuList/index.jsx
import { Typography } from '@mui/material';
import { useContext } from 'react';
import AuthContext from '/src/context/AuthContext';
import NavGroup from './NavGroup';
import getMenuItems from 'menu-items';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const { isAdmin } = useContext(AuthContext); // Obtiene isAdmin desde el contexto
  const menuItems = getMenuItems(isAdmin); // Obtiene los items del menú basados en isAdmin

  if (!menuItems || !menuItems.items) {
    return (
      <Typography variant="h6" color="error" align="center">
        Menu Items Error
      </Typography>
    );
  }

  const navItems = menuItems.items.map((item) => {
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

  return <>{navItems}</>;
};

export default MenuList;
