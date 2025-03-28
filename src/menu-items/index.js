import Administrador from './Administrador';
import Almacenista from './Almacenista';
import Chofer from './Chofer';
import Despacho from './Despacho';
import Operador from './Operador';
import Supervisor from './Supervisor';
import Company from './Company';
import Cliente from './Cliente';
// ==============================|| MENU ITEMS ||============================== //

const roleItems = {
    Administrador,
    Almacenista,
    Chofer,
    Despacho,
    Operador,
    Supervisor,
    Company,
    Cliente
};

const getMenuItems = (role) => {
    const items = roleItems[role] ? [roleItems[role]] : [];
    return { items };
};

export default getMenuItems;

