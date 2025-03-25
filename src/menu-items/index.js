import Administrador from './Administrador';
import Almacenista from './Almacenista';
import Chofer from './Chofer';
import Despacho from './Despacho';
import Operador from './Operador';
import Supervisor from './Supervisor';
import Company from './Company';
// ==============================|| MENU ITEMS ||============================== //

const roleItems = {
    Administrador,
    Almacenista,
    Chofer,
    Despacho,
    Operador,
    Supervisor,
    Company
};

const getMenuItems = (role) => {
    const items = roleItems[role] ? [roleItems[role], roleItems.Company] : [];
    return { items };
};

export default getMenuItems;

