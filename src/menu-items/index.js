import administrador from './Administrador';
import almacenista from './Almacenista';
import chofer from './Chofer';
import despacho from './Despacho';
import operador from './Operador';
import supervisor from './Supervisor';

// ==============================|| MENU ITEMS ||============================== //

const getMenuItems = () => {
    const items = [
        administrador,
        almacenista,
        chofer,
        despacho,
        operador,
        supervisor
    ];

    return { items };
};

export default getMenuItems;
