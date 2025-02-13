import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import history from './history';
import users from './users';
import administrador from './Administrador';
import almacenista from './Almacenista';
import chofer from './Chofer';
import despacho from './Despacho';
import operador from './Operador';
import supervisor from './Supervisor';

// ==============================|| MENU ITEMS ||============================== //

const getMenuItems = (isAdmin) => {

  const items = [];
  switch (isAdmin) {
    case "Administrador":
      items.push(administrador);
      break;
    case "Almacenista":
      items.push(almacenista);
      break;
    case "Chofer":
      items.push(chofer);
      break;
    case "Monitor (Despacho)":
      items.push(despacho);
      break;
    case "Operador":
      items.push(operador);
      break;
    case "Supervisor":
      items.push(supervisor);
      break;
    default:
  }

  return { items };
};

export default getMenuItems;
