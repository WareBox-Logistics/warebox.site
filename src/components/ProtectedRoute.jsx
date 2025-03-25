import { Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import NavigateWhenLogin from 'utils/navigate-when-login';

function ProtectedRoute({ role }) {
  
  const userRole = localStorage.getItem('role')


  if (userRole !== role) {
    return <NavigateWhenLogin typeAuth={userRole} />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  role: PropTypes.string.isRequired,
};

export default ProtectedRoute;