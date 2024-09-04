import React, { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress, Autocomplete, Grid, Tabs, Tab, Badge, Snackbar, Alert, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GET_ACTIVE_COMPANIES, GET_UNIT_TYPE, GET_STATUS, GET_LOAD_TYPE, INSERT_WEB_SERVICES_EDI_CONFIG } from '/src/graphql/queries';
import TestSFTPConnection from './TestSFTPConnection';
import CheckFilesModal from './CheckFilesModal';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

const validationSchema = Yup.object({
  customer_id: Yup.string().required('El cliente es requerido'),
  sftp_url: Yup.string()
    .matches(/^[^\s]+$/, 'La URL no debe contener espacios')
    .matches(/^[a-zA-Z0-9.]+$/, 'Debe contener solo letras, números y puntos')
    .required('La URL de SFTP es requerida'),
  sftp_user: Yup.string().required('El usuario de SFTP es requerido'),
  sftp_password: Yup.string().required('La contraseña de SFTP es requerida'),
  sftp_folder_get: Yup.string()
    .matches(/^\//, 'Debe comenzar con "/"')
    .required('El folder de SFTP Get es requerido'),
  sftp_folder_send: Yup.string()
    .matches(/^\//, 'Debe comenzar con "/"')
    .required('El folder de SFTP Send es requerido'),
  sftp_folder_send_history: Yup.string().matches(/^\//, 'Debe comenzar con "/"'),
  sftp_folder_get_history: Yup.string().matches(/^\//, 'Debe comenzar con "/"'),
  edi_990_accept: Yup.string().required('El template EDI 990 es requerido'),
  edi_214_plan_delivery: Yup.string().required('El template EDI 214 Plan Delivery es requerido'),
  edi_214_plan_pickup: Yup.string().required('El template EDI 214 Plan Pickup es requerido'),
  file_name_patterns: Yup.string()
    .required('Los patrones de nombre de archivo son requeridos')
    .matches(/^\[.*\]$/, 'Debe ser un array de patrones, e.g., ["KEY_204", "IMP"]'),
});

const RegisterEDIConfig = ({ open, onClose, onSave }) => {
  const [tabValue, setTabValue] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalField, setModalField] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenModal = (field) => {
    setModalField(field);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalField('');
  };

  const formik = useFormik({
    initialValues: {
      customer_id: '',
      sftp_url: '',
      sftp_user: '',
      sftp_password: '',
      sftp_folder_get: '',
      sftp_folder_send: '',
      sftp_folder_send_history: '',
      sftp_folder_get_history: '',
      unit_type_id: '',
      load_type_id: '',
      do_status_id: '',
      content_status_id: '',
      edi_990_accept: '',
      edi_214_plan_delivery: '',
      edi_214_plan_pickup: '',
      file_name_patterns: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      insertEDIConfig({ variables: { input: values } });
    },
  });

  const [companyType, setCompanyType] = useState('CUSTOMER');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedUnitType, setSelectedUnitType] = useState(null);
  const [selectedLoadType, setSelectedLoadType] = useState(null);
  const [selectedDoStatus, setSelectedDoStatus] = useState(null);
  const [selectedContentStatus, setSelectedContentStatus] = useState(null);

  const [fetchCompanies, { data: companyData, loading: companyLoading }] = useLazyQuery(GET_ACTIVE_COMPANIES);
  const [fetchUnitTypes, { data: unitTypeData, loading: unitTypeLoading }] = useLazyQuery(GET_UNIT_TYPE);
  const [fetchLoadTypes, { data: loadTypeData, loading: loadTypeLoading }] = useLazyQuery(GET_LOAD_TYPE);
  const [fetchStatus, { data: statusData, loading: statusLoading }] = useLazyQuery(GET_STATUS);

  const [insertEDIConfig, { loading: insertLoading, error: insertError }] = useMutation(INSERT_WEB_SERVICES_EDI_CONFIG, {
    onCompleted: (data) => {
      setSnackbarMessage('Registro exitoso');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onSave(data); // Llama la función onSave en el padre
      onClose();  // Cierra el modal
    },
    onError: (error) => {
      setSnackbarMessage(`Error al registrar: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const handleCompanyTypeChange = (event) => {
    const newCompanyType = event.target.value;
    setCompanyType(newCompanyType);
    fetchCompanies({ variables: { companyType: newCompanyType } });
  };

  useEffect(() => {
    if (open) {
      fetchCompanies({ variables: { companyType } });
      fetchUnitTypes();
      fetchLoadTypes();
      fetchStatus();
    } else {
      formik.resetForm();  // Resetea el formulario cuando se cierra el modal
      setSelectedCompany(null);
      setSelectedUnitType(null);
      setSelectedLoadType(null);
      setSelectedDoStatus(null);
      setSelectedContentStatus(null);
    }
  }, [open, companyType, fetchCompanies, fetchUnitTypes, fetchLoadTypes, fetchStatus]);

  const isSFTPConnectionReady = formik.values.sftp_url && formik.values.sftp_user && formik.values.sftp_password;

  const hasErrorInTab = (fields) => {
    return fields.some(field => formik.touched[field] && formik.errors[field]);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrar Configuración EDI</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
            <Tab label={<Badge color="error" variant="dot" invisible={!hasErrorInTab(['customer_id', 'sftp_url', 'sftp_user', 'sftp_password', 'sftp_folder_get', 'sftp_folder_send', 'sftp_folder_send_history', 'sftp_folder_get_history', 'file_name_patterns'])}>Configuración SFTP</Badge>} />
            <Tab label={<Badge color="error" variant="dot" invisible={!hasErrorInTab(['unit_type_id', 'load_type_id', 'do_status_id', 'content_status_id'])}>Configuración DO</Badge>} />
            <Tab label={<Badge color="error" variant="dot" invisible={!hasErrorInTab(['edi_990_accept', 'edi_214_plan_delivery', 'edi_214_plan_pickup'])}>Configuración de Templates EDI</Badge>} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Empresa</InputLabel>
                  <Select
                    value={companyType}
                    onChange={handleCompanyTypeChange}
                    label="Tipo de Empresa"
                    size="small"
                  >
                    <MenuItem value="CUSTOMER">Cliente</MenuItem>
                    <MenuItem value="CONSIGNEE">Consignatario</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                {companyLoading ? (
                  <CircularProgress />
                ) : (
                  <Autocomplete
                    options={companyData?.companies || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      formik.setFieldValue('customer_id', value?.id || '');
                      setSelectedCompany(value);
                    }}
                    value={selectedCompany}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Cliente"
                        fullWidth
                        size="small"
                        autoComplete="off"
                        error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                        helperText={formik.touched.customer_id && formik.errors.customer_id}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="SFTP URL"
                  name="sftp_url"
                  value={formik.values.sftp_url}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  autoComplete="off"
                  error={formik.touched.sftp_url && Boolean(formik.errors.sftp_url)}
                  helperText={formik.touched.sftp_url && formik.errors.sftp_url}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="SFTP Usuario"
                  name="sftp_user"
                  value={formik.values.sftp_user}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  autoComplete="off"
                  error={formik.touched.sftp_user && Boolean(formik.errors.sftp_user)}
                  helperText={formik.touched.sftp_user && formik.errors.sftp_user}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <TextField
                    label="SFTP Contraseña"
                    name="sftp_password"
                    value={formik.values.sftp_password}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                    autoComplete="off"
                    error={formik.touched.sftp_password && Boolean(formik.errors.sftp_password)}
                    helperText={formik.touched.sftp_password && formik.errors.sftp_password}
                  />
                  {isSFTPConnectionReady && (
                    <Box ml={2}>
                      <TestSFTPConnection
                        sftp_url={formik.values.sftp_url}
                        sftp_user={formik.values.sftp_user}
                        sftp_password={formik.values.sftp_password}
                        sftp_folders={[formik.values.sftp_folder_get, formik.values.sftp_folder_send, formik.values.sftp_folder_send_history, formik.values.sftp_folder_get_history]}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarSeverity={setSnackbarSeverity}
                        setSnackbarOpen={setSnackbarOpen}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <TextField
                  label="SFTP Folder Get"
                  name="sftp_folder_get"
                  value={formik.values.sftp_folder_get}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  autoComplete="off"
                  error={formik.touched.sftp_folder_get && Boolean(formik.errors.sftp_folder_get)}
                  helperText={formik.touched.sftp_folder_get && formik.errors.sftp_folder_get}
                />
                  {formik.values.sftp_folder_get && (
                    <Box ml={2}>
                      <Tooltip title="Ver Archivos">
                        <IconButton
                          onClick={() => handleOpenModal('sftp_folder_get')}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <TextField
                    label="SFTP Folder Send"
                    name="sftp_folder_send"
                    value={formik.values.sftp_folder_send}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                    autoComplete="off"
                    error={formik.touched.sftp_folder_send && Boolean(formik.errors.sftp_folder_send)}
                    helperText={formik.touched.sftp_folder_send && formik.errors.sftp_folder_send}
                  />
                  {formik.values.sftp_folder_send && (
                    <Box ml={2}>
                      <Tooltip title="Ver Archivos">
                        <IconButton
                          onClick={() => handleOpenModal('sftp_folder_send')}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" alignItems="center">
                  <TextField
                    label="SFTP Folder Send History"
                    name="sftp_folder_send_history"
                    value={formik.values.sftp_folder_send_history}
                    onChange={formik.handleChange}
                    fullWidth
                    size="small"
                    autoComplete="off"
                    error={formik.touched.sftp_folder_send_history && Boolean(formik.errors.sftp_folder_send_history)}
                    helperText={formik.touched.sftp_folder_send_history && formik.errors.sftp_folder_send_history}
                  />
                  {formik.values.sftp_folder_send_history && (
                    <Box ml={2}>
                      <Tooltip title="Ver Archivos">
                        <IconButton
                          onClick={() => handleOpenModal('sftp_folder_send_history')}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center">
                <TextField
                  label="SFTP Folder Get History"
                  name="sftp_folder_get_history"
                  value={formik.values.sftp_folder_get_history}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  autoComplete="off"
                  error={formik.touched.sftp_folder_get_history && Boolean(formik.errors.sftp_folder_get_history)}
                  helperText={formik.touched.sftp_folder_get_history && formik.errors.sftp_folder_get_history}
                />
                  {formik.values.sftp_folder_get_history && (
                    <Box ml={2}>
                      <Tooltip title="Ver Archivos">
                        <IconButton
                          onClick={() => handleOpenModal('sftp_folder_get_history')}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="File Name Patterns"
                  name="file_name_patterns"
                  value={formik.values.file_name_patterns}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  autoComplete="off"
                  placeholder='["KEY_204", "IMP"]'
                  error={formik.touched.file_name_patterns && Boolean(formik.errors.file_name_patterns)}
                  helperText={formik.touched.file_name_patterns && formik.errors.file_name_patterns}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                {unitTypeLoading ? (
                  <CircularProgress />
                ) : (
                  <Autocomplete
                    options={unitTypeData?.unit_types || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      formik.setFieldValue('unit_type_id', value?.id || '');
                      setSelectedUnitType(value);
                    }}
                    value={selectedUnitType}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unidad"
                        fullWidth
                        size="small"
                        autoComplete="off"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {loadTypeLoading ? (
                  <CircularProgress />
                ) : (
                  <Autocomplete
                    options={loadTypeData?.load_types || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      formik.setFieldValue('load_type_id', value?.id || '');
                      setSelectedLoadType(value);
                    }}
                    value={selectedLoadType}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tipo de Carga"
                        fullWidth
                        size="small"
                        autoComplete="off"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {statusLoading ? (
                  <CircularProgress />
                ) : (
                  <Autocomplete
                    options={statusData?.status || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      formik.setFieldValue('do_status_id', value?.id || '');
                      setSelectedDoStatus(value);
                    }}
                    value={selectedDoStatus}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Status de DO"
                        fullWidth
                        size="small"
                        autoComplete="off"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                  />
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                {statusLoading ? (
                  <CircularProgress />
                ) : (
                  <Autocomplete
                    options={statusData?.status || []}
                    getOptionLabel={(option) => option.name}
                    onChange={(event, value) => {
                      formik.setFieldValue('content_status_id', value?.id || '');
                      setSelectedContentStatus(value);
                    }}
                    value={selectedContentStatus}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Status de Contenido"
                        fullWidth
                        size="small"
                        autoComplete="off"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                  />
                )}
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="EDI 990 Accept"
                  name="edi_990_accept"
                  value={formik.values.edi_990_accept}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  autoComplete="off"
                  error={formik.touched.edi_990_accept && Boolean(formik.errors.edi_990_accept)}
                  helperText={formik.touched.edi_990_accept && formik.errors.edi_990_accept}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="EDI 214 Plan Delivery"
                  name="edi_214_plan_delivery"
                  value={formik.values.edi_214_plan_delivery}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  autoComplete="off"
                  error={formik.touched.edi_214_plan_delivery && Boolean(formik.errors.edi_214_plan_delivery)}
                  helperText={formik.touched.edi_214_plan_delivery && formik.errors.edi_214_plan_delivery}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="EDI 214 Plan Pickup"
                  name="edi_214_plan_pickup"
                  value={formik.values.edi_214_plan_pickup}
                  onChange={formik.handleChange}
                  fullWidth
                  size="small"
                  multiline
                  rows={4}
                  autoComplete="off"
                  error={formik.touched.edi_214_plan_pickup && Boolean(formik.errors.edi_214_plan_pickup)}
                  helperText={formik.touched.edi_214_plan_pickup && formik.errors.edi_214_plan_pickup}
                />
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={insertLoading}>Cancelar</Button>
          <Button type="submit" color="primary" disabled={insertLoading}>
            {insertLoading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
        {insertError && <p>Error: {insertError.message}</p>}

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </form>
      <CheckFilesModal
        open={isModalOpen}
        onClose={handleCloseModal}
        sftpFolderSend={formik.values[modalField]}
        sftpUrl={formik.values.sftp_url}
        sftpUser={formik.values.sftp_user}
        sftpPassword={formik.values.sftp_password}
      />
    </Dialog>
  );
};

export default RegisterEDIConfig;
