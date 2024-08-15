import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Stack,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useMutation, useLazyQuery } from '@apollo/client';
import { UPDATE_USER, GET_ACTIVE_COMPANIES } from '/src/graphql/queries';
import bcrypt from 'bcryptjs';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const EditUserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string(),
  customer_id: Yup.string().required('Required'),
  is_admin: Yup.boolean(),
  is_active: Yup.boolean()
});

const generatePassword = () => {
  const length = 8;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

const UsersEdit = ({ editDialogOpen, handleEditDialogClose, editUser, refetchUsers, setSnackbarOpen, setSnackbarMessage, setSnackbarSeverity }) => {
  const [updateUser] = useMutation(UPDATE_USER);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [companyType, setCompanyType] = useState('CUSTOMER');
  const [fetchCompanies, { data: companyData, loading: companyLoading, error: companyError }] = useLazyQuery(GET_ACTIVE_COMPANIES);

  useEffect(() => {
    if (editUser) {
      setSelectedCompany(editUser.customer);
      setGeneratedPassword(''); // Reset the generated password when a new user is being edited
      setCompanyType(editUser.company_type_code_name || 'CUSTOMER'); // Set initial company type
      fetchCompanies({ variables: { companyType: editUser.company_type_code_name || 'CUSTOMER' } });
    }
  }, [editUser, fetchCompanies]);

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData.companies);
    }
  }, [companyData]);

  const handleEditSubmit = async (values) => {
    try {
      let updatedUser = { ...values };
      if (values.password) {
        updatedUser.password = await bcrypt.hash(values.password, 10);
      } else {
        delete updatedUser.password;
      }

      const input = {
        email: updatedUser.email,
        customer_id: updatedUser.customer_id,
        is_admin: updatedUser.is_admin,
        is_active: updatedUser.is_active,
        ...(updatedUser.password && { password: updatedUser.password })
      };

      await updateUser({ variables: { id: editUser.id, input } });
      setSnackbarMessage('User updated successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      handleEditDialogClose();
      refetchUsers();
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Failed to update user');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setSnackbarMessage('Password copied to clipboard');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleClose = () => {
    handleEditDialogClose();
    setGeneratedPassword(''); // Reset the generated password when the modal is closed
  };

  const handleCompanyTypeChange = (event) => {
    setCompanyType(event.target.value);
    setSelectedCompany(null);
    fetchCompanies({ variables: { companyType: event.target.value } });
  };

  return (
    <Dialog open={editDialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {companyLoading ? (
          <CircularProgress />
        ) : companyError ? (
          <p>Error loading companies</p>
        ) : (
          editUser && (
            <Formik
              initialValues={{ email: editUser.email, password: '', customer_id: editUser.customer_id, is_admin: editUser.is_admin, is_active: editUser.is_active }}
              validationSchema={EditUserSchema}
              onSubmit={handleEditSubmit}
            >
              {({ isSubmitting, errors, touched, handleChange, setFieldValue, values }) => (
                <Form>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Field
                      as={TextField}
                      name="email"
                      type="email"
                      label="Email"
                      fullWidth
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      autoComplete="off"
                    />
                    <Field
                      as={TextField}
                      name="password"
                      type="password"
                      label="Password"
                      fullWidth
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                      autoComplete="new-password"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                const newPassword = generatePassword();
                                setFieldValue('password', newPassword);
                                setGeneratedPassword(newPassword);
                              }}
                              edge="end"
                            >
                              <RefreshIcon />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    {generatedPassword && (
                      <TextField
                        label="Generated Password"
                        value={generatedPassword}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={handleCopyPassword}>
                                <FileCopyIcon />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        fullWidth
                        margin="normal"
                      />
                    )}
                    <FormControl fullWidth>
                      <InputLabel>Company Type</InputLabel>
                      <Select
                        value={companyType}
                        onChange={handleCompanyTypeChange}
                        label="Company Type"
                      >
                        <MenuItem value="CUSTOMER">Customer</MenuItem>
                        <MenuItem value="CONSIGNEE">Consignee</MenuItem>
                      </Select>
                    </FormControl>
                    <Autocomplete
                      options={companies}
                      getOptionLabel={(option) => option.name}
                      onChange={(event, value) => {
                        setFieldValue('customer_id', value?.id || '');
                        setSelectedCompany(value);
                      }}
                      value={selectedCompany}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Customer"
                          error={touched.customer_id && !!errors.customer_id}
                          helperText={touched.customer_id && errors.customer_id}
                          fullWidth
                        />
                      )}
                      renderOption={(props, option) => (
                        <li {...props} key={option.id}>
                          {option.name}
                        </li>
                      )}
                      noOptionsText="No options"
                    />
                    <FormControlLabel
                      control={
                        <Field
                          as={Checkbox}
                          name="is_admin"
                          color="primary"
                          checked={values.is_admin}
                        />
                      }
                      label="Is Admin"
                    />
                    <FormControlLabel
                      control={
                        <Field
                          as={Checkbox}
                          name="is_active"
                          color="primary"
                          checked={values.is_active}
                        />
                      }
                      label="Is Active"
                    />
                    <DialogActions>
                      <Button onClick={handleClose} color="secondary">
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || !selectedCompany}>
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogActions>
                  </Stack>
                </Form>
              )}
            </Formik>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UsersEdit;
