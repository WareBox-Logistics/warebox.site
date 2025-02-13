import { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto
const RolContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const permissions = JSON.parse(localStorage.getItem('permisos') || '[]');
    setUserPermissions(permissions);
  }, []);

  return (
    <RolContext.Provider value={{ userPermissions }}>
      {children}
    </RolContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => useContext(RolContext);
