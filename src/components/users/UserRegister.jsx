import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Button,
  TextField,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { useMutation, useLazyQuery } from '@apollo/client';
import { REGISTER_USER, GET_ACTIVE_COMPANIES, CHECK_EMAIL_EXISTS } from '/src/graphql/queries';
import bcrypt from 'bcryptjs';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { useTranslation } from 'react-i18next';

const UserSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
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

const UserRegister = ({ refetchUsers, setSnackbarOpen, setSnackbarMessage, setSnackbarSeverity }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [registerUser] = useMutation(REGISTER_USER);
  const [checkEmailExists] = useLazyQuery(CHECK_EMAIL_EXISTS);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [companyType, setCompanyType] = useState('CUSTOMER');
  const [fetchCompanies, { data: companyData, loading: companyLoading, error: companyError }] = useLazyQuery(GET_ACTIVE_COMPANIES);

  useEffect(() => {
    if (companyData) {
      setCompanies(companyData.companies);
    }
  }, [companyData]);

  const handleClickOpen = () => {
    setOpen(true);
    fetchCompanies({ variables: { companyType } });
  };

  const handleClose = () => {
    setOpen(false);
    setGeneratedPassword(''); // Reset the generated password when the modal is closed
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setSnackbarMessage(t('userRegister.passwordCopied'));
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleCompanyTypeChange = (event) => {
    setCompanyType(event.target.value);
    setSelectedCompany(null);
    fetchCompanies({ variables: { companyType: event.target.value } });
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleClickOpen} sx={{ marginBottom: 2 }}>
        {t('userRegister.newUser')}
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" align="center">
            {t('userRegister.title')}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {companyLoading ? (
            <CircularProgress />
          ) : companyError ? (
            <p>{t('userRegister.loadingError')}</p>
          ) : (
            <Formik
              initialValues={{ email: '', password: '', customer_id: '', is_admin: false, is_active: true }}
              validationSchema={UserSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                const hashedPassword = await bcrypt.hash(values.password, 10);

                checkEmailExists({ variables: { email: values.email } })
                  .then(({ data }) => {
                    if (data.web_services_users.length > 0) {
                      setSnackbarMessage(t('userRegister.emailExists'));
                      setSnackbarSeverity('error');
                      setSnackbarOpen(true);
                      setSubmitting(false);
                    } else {
                      registerUser({ variables: { ...values, password: hashedPassword } })
                        .then(() => {
                          setSnackbarMessage(t('userRegister.userRegistered'));
                          setSnackbarSeverity('success');
                          setSnackbarOpen(true);
                          resetForm();
                          setSelectedCompany(null);
                          refetchUsers();
                          handleClose();
                        })
                        .catch((error) => {
                          console.error(error);
                          setSnackbarMessage(t('userRegister.registrationFailed'));
                          setSnackbarSeverity('error');
                          setSnackbarOpen(true);
                        })
                        .finally(() => {
                          setSubmitting(false);
                        });
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                    setSnackbarMessage(t('userRegister.checkEmailFailed'));
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    setSubmitting(false);
                  });
              }}
            >
              {({ isSubmitting, errors, touched, handleChange, setFieldValue }) => (
                <Form>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Field
                      as={TextField}
                      name="email"
                      type="email"
                      label={t('userRegister.email')}
                      fullWidth
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      autoComplete="off"
                    />
                    <Field
                      as={TextField}
                      name="password"
                      type="password"
                      label={t('userRegister.password')}
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
                        label={t('userRegister.generatedPassword')}
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
                      <InputLabel>{t('userRegister.companyType')}</InputLabel>
                      <Select
                        value={companyType}
                        onChange={handleCompanyTypeChange}
                        label={t('userRegister.companyType')}
                      >
                        <MenuItem value="CUSTOMER">{t('userRegister.customer')}</MenuItem>
                        <MenuItem value="CONSIGNEE">{t('userRegister.consignee')}</MenuItem>
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
                          label={t('userRegister.customer')}
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
                    />
                    <FormControlLabel
                      control={<Field as={Checkbox} name="is_admin" color="primary" />}
                      label={t('userRegister.isAdmin')}
                    />
                    <DialogActions>
                      <Button onClick={handleClose} color="secondary">
                        {t('userRegister.cancel')}
                      </Button>
                      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                        {isSubmitting ? t('userRegister.registering') : t('userRegister.register')}
                      </Button>
                    </DialogActions>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserRegister;
