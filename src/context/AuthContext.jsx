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
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    }
    setLoadingAuth(false); 
    setAuthChecked(true);
  }, [isAuthenticated]);
  
  

  
  const login = (token, data) => {
    const userId = data.employee_by_pk.id;
    const role = data.employee_by_pk.role_table.name;
    const permisos = data.employee_by_pk.role_table.permisos.map(p => p.permiso.nombre);
    const userData = {
      id: userId,
      email: data.employee_by_pk.email,
      customer_id: userId,
    };

    localStorage.setItem('token', token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('customer_id', userId);
    localStorage.setItem('role', role);
    localStorage.setItem('permisos', JSON.stringify(permisos));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    if (token) {
      updateSessionStatus({ variables: { id: userId, is_session_active: false } })
        .finally(() => {
          closeWebSocket();
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('customer_id');
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
          setAuthChecked(true);
        });
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
