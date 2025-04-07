import React, { useEffect, useContext, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthContext from "/src/context/AuthContext";
import axios from "axios";
import { useLazyQuery } from "@apollo/client";
import { GET_INFO_USER } from "graphql/queries";
import logo from "/src/assets/images/logo_bali_blue.jpeg"; // Asegúrate de que la ruta sea correcta

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const AuthLogin = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useContext(AuthContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [fetchChatHelper, { loading: chatLoading }] = useLazyQuery(GET_INFO_USER);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    logout();
    try {
      const response = await axios.post(import.meta.env.VITE_JWT_LOGIN, {
        email: values.email,
        password: values.password,
      });

      const { data } = await fetchChatHelper({
        variables: { id: response.data.user.id },
      });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        login(response.data.token, data);
        navigate("/admin/dashboard");
      } else {
        setSnackbarMessage("Invalid credentials");
        setSnackbarOpen(true);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setSnackbarMessage(error.response.data.message);
      } else {
        setSnackbarMessage("Login failed");
      }
      setSnackbarOpen(true);
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FF731D, #FF4500)",
        padding: 2,
      }}
    >
      <Paper
        sx={{
          padding: 4,
          maxWidth: 400,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Box sx={{ textAlign: "center", marginBottom: 3 }}>
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "100%", height: "150px", objectFit: "contain" }}
          />
        </Box>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#333" }}
        >
          Welcome Back
        </Typography>
        <Typography
          variant="body1"
          align="center"
          sx={{ marginBottom: 3, color: "#666" }}
        >
          Please login to your account
        </Typography>
        <Formik
          initialValues={{ email: "", password: "" }}
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
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: "#FF731D",
                    "&:hover": { backgroundColor: "#FF4500" },
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logging in..." : "Login"}
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuthLogin;