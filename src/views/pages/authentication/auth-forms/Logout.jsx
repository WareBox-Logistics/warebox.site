// src/views/pages/authentication/auth-forms/Logout.jsx
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '/src/context/AuthContext';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return null;
};

export default Logout;
