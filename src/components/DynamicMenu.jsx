import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '/src/context/AuthContext';
import MenuComponent from './MenuComponent'; 
import { dashboard, history, users, utilities } from '/src/menu-items';

const DynamicMenu = () => {
  const { user } = useContext(AuthContext);
  const [menuItems, setMenuItems] = useState({
    items: [dashboard, history, utilities]
  });

  useEffect(() => {
    const items = [dashboard, history, utilities];
    if (user && user.is_admin) {
      items.push(users);
    }
    setMenuItems({ items });
  }, [user]);

  return <MenuComponent items={menuItems.items} />;
};

export default DynamicMenu;
