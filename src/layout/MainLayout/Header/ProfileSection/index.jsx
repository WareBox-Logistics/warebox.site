// src/layout/MainLayout/ProfileSection.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton, Avatar, Box, Typography, Divider } from '@mui/material';
import AuthContext from '/src/context/AuthContext';
import UserIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';

const ProfileSection = () => {
  const { logout, user, isAdmin } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng).then(() => {
      localStorage.setItem('language', lng);
      handleMenuClose();
    });
  };

  const currentLanguage = i18n.language;

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
        <Avatar alt="User Profile" src="/static/images/avatar/1.jpg">
          <UserIcon />
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 4,
          sx: {
            border: '1px solid #d3d4d5',
            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{t('profileSection.greeting', { email: user?.email || t('profileSection.user') })}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {isAdmin ? t('profileSection.admin') : t('profileSection.user')}
          </Typography>
          <Divider />
        </Box>
        {currentLanguage !== 'en' && <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>}
        {currentLanguage !== 'es' && <MenuItem onClick={() => changeLanguage('es')}>Español</MenuItem>}
        <Divider />
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: 'red',
            '&:hover': {
              bgcolor: 'rgba(255, 0, 0, 0.1)',
            },
          }}
        >
          {t('profileSection.logout')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileSection;
