import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import history from './history';
import users from './users';

// ==============================|| MENU ITEMS ||============================== //

const getMenuItems = (isAdmin) => {
  const items = [dashboard, history];
  if (isAdmin) {
    items.push(users);
  }
  return { items };
};

export default getMenuItems;
