import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function NavigateWhenLogin({ typeAuth }) {
  const navigate = useNavigate();

  useEffect(() => {
    switch (typeAuth) {
      case 'Administrador':
        navigate('/admin/dashboard', { replace: true });
        break;
      case 'Almacenista':
        navigate('/warehouseman/gestion-racks', { replace: true });
        break;
      case 'Chofer':
        navigate('/drivers/viajes', { replace: true });
        break;
      case 'Despacho':
        navigate('/dispatch/dashboard-despacho', { replace: true });
        break;
      case 'Operador':
        navigate('/operator/asignar-viajes', { replace: true });
        break;
      case 'Cliente':
          navigate('/client/client-deliveries');
          break ;
      default:
        navigate('/supervisor/viajes-despacho');
        break 
    }
  }, [typeAuth, navigate]);

  return null;
}

NavigateWhenLogin.propTypes = {
  typeAuth: PropTypes.string,
};