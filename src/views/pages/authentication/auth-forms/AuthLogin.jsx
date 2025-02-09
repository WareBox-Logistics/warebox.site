import React, { useEffect, useContext, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Stack, Typography, Box, Paper, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthContext from '/src/context/AuthContext';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const AuthLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log(import.meta.env.VITE_JWT_LOGIN);

    logout(); // Ensure any existing session is cleared
    try {
      
      const response = await axios.post(import.meta.env.VITE_JWT_LOGIN, {
        input: { email: values.email, password: values.password }
      });

      if (response.data && response.data.token) {
        const decoded = jwt_decode(response.data.token);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('customer_id', decoded['https://hasura.io/jwt/claims']['x-hasura-customer-id']);
        localStorage.setItem('user_id', decoded['https://hasura.io/jwt/claims']['x-hasura-user-id']);
        login(response.data.token);  // Pass the token directly
        navigate('/dashboard');
      } else {
        setSnackbarMessage('Invalid credentials');
        setSnackbarOpen(true);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setSnackbarMessage(error.response.data.message);
      } else {
        setSnackbarMessage('Login failed');
      }
      setSnackbarOpen(true);
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
      }}
    >
      <Paper sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom align="center">
          Login
        </Typography>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form autoComplete="off">
              <Stack spacing={2}>
                <Field
                  as={TextField}
                  name="email"
                  type="email"
                  label="Email"
                  fullWidth
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  id="email"
                  autoComplete="email"
                />
                <Field
                  as={TextField}
                  name="password"
                  type="password"
                  label="Password"
                  fullWidth
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  id="password"
                  autoComplete="current-password"
                />
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthLogin;
