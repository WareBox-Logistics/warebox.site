import React, { createContext, useState, useEffect } from 'react';
import {useMutation } from '@apollo/client';
import { UPDATE_SESSION_STATUS } from '/src/graphql/queries';
import { closeWebSocket } from '/src/websocket';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [updateSessionStatus] = useMutation(UPDATE_SESSION_STATUS);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUser(JSON.parse(localStorage.getItem('userData')));
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    }
    setLoadingAuth(false); 
    setAuthChecked(true);
  }, [isAuthenticated]);
  
  

  
  const login = (token, data) => {
    // console.log("Permisos en la respuesta:", data.employee_by_pk.role_table.permisos);
    const userId = data.employee_by_pk.id;
    const firstName = data.employee_by_pk.first_name;
    // const role = data.employee_by_pk.role_table.name;
    // const permisos = data.employee_by_pk.role_table.permisos.map(p => p.permiso.nombre);
    const userData = {
      id: userId,
      email: data.employee_by_pk.email,
      customer_id: userId,
    };
    const role  = data.employee_by_pk.role_table.name

    localStorage.setItem('token', token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('customer_id', userId);
    localStorage.setItem('first_name', firstName);
    localStorage.setItem('role', role);
    // localStorage.setItem('role', role);
    // localStorage.setItem('permisos', JSON.stringify(permisos));
    localStorage.setItem('userData', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    if (token) {
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('customer_id');
          localStorage.removeItem('first_name');
          localStorage.removeItem('userData');
          localStorage.removeItem('role');
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
          setAuthChecked(true);
    } else {
      closeWebSocket();
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('customer_id');
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      setAuthChecked(true);

    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isAdmin, login, logout, loadingAuth, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
