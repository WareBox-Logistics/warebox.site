import React, { createContext, useState, useEffect } from 'react';
import { useLazyQuery, useMutation, useSubscription } from '@apollo/client';
import { CHECK_USER_STATUS, UPDATE_SESSION_STATUS, USER_STATUS_SUBSCRIPTION } from '/src/graphql/queries';
import { initializeWebSocket, closeWebSocket } from '/src/websocket';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [checkUserStatus] = useLazyQuery(CHECK_USER_STATUS);
  const [updateSessionStatus] = useMutation(UPDATE_SESSION_STATUS);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    if (token && userId) {
      checkUserStatus({ variables: { id: userId } }).then(({ data }) => {
        if (data && data.web_services_users_by_pk) {
          if (data.web_services_users_by_pk.is_active) {
            const decoded = jwt_decode(token);
            const userData = {
              id: userId,
              email: decoded['https://hasura.io/jwt/claims']['x-hasura-email'],
              customer_id: decoded['https://hasura.io/jwt/claims']['x-hasura-customer-id'],
              is_admin: decoded['https://hasura.io/jwt/claims']['x-hasura-role'] === 'admin',
            };
            setUser(userData);
            setIsAuthenticated(true);
            setIsAdmin(data.web_services_users_by_pk.is_admin);
            console.log('is_admin_log: ' + data.web_services_users_by_pk.is_admin);
            initializeWebSocket(userId);
          } else {
            logout();
          }
        } else {
          logout();
        }
        setLoadingAuth(false);
        setAuthChecked(true);
      }).catch(error => {
        logout();
        setLoadingAuth(false);
        setAuthChecked(true);
      });
    } else {
      setLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [checkUserStatus]);

  useSubscription(USER_STATUS_SUBSCRIPTION, {
    variables: { id: localStorage.getItem('user_id') },
    skip: !isAuthenticated, // Skip subscription if not authenticated
    onSubscriptionData: ({ subscriptionData }) => {
      const userStatus = subscriptionData.data.web_services_users_by_pk;
      if (!userStatus.is_active) {
        logout();
      }
    },
  });

  const login = (token) => {
    const decoded = jwt_decode(token);
    const userId = decoded['https://hasura.io/jwt/claims']['x-hasura-user-id'];
    const userData = {
      id: userId,
      email: decoded['https://hasura.io/jwt/claims']['x-hasura-email'],
      customer_id: decoded['https://hasura.io/jwt/claims']['x-hasura-customer-id'],
    };
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', userId);
    localStorage.setItem('customer_id', decoded['https://hasura.io/jwt/claims']['x-hasura-customer-id']);
    setIsAuthenticated(true);
    setUser(userData);

    checkUserStatus({ variables: { id: userId } }).then(({ data }) => {
      if (data && data.web_services_users_by_pk) {
        setIsAdmin(data.web_services_users_by_pk.is_admin);
      }
    });

    updateSessionStatus({ variables: { id: userId, is_session_active: true, is_online: true } });
    initializeWebSocket(userId);
  };

  const logout = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    if (token && userId) {
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
