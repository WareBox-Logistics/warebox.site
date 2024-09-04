import React, { useState, useEffect } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { InputAdornment, Tooltip, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress, Autocomplete, Grid, Tabs, Tab, Snackbar, Alert, IconButton } from '@mui/material';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GET_ACTIVE_COMPANIES, GET_UNIT_TYPE, GET_STATUS, GET_LOAD_TYPE, GET_CUSTOMER_WEB_SERVICES_EDI_CONFIGS, UPDATE_WEB_SERVICES_EDI_CONFIG } from '/src/graphql/queries';
import TestSFTPConnection from './TestSFTPConnection';
import CheckFilesModal from './CheckFilesModal';
import VisibilityIcon from '@mui/icons-material/Visibility';

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

const highlightKeys = (text) => {
  const regex = /{{(.*?)}}/g; // Busca las llaves dobles {{ }}
  return text.replace(regex, (match) => `<span style="background-color: yellow;">${match}</span>`);
};

const UpdateEDIConfig = ({ open, onClose, onUpdate, configId, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen }) => {
  const [tabValue, setTabValue] = useState(0);
  const [snackbarMessageLocal, setSnackbarMessageLocal] = useState('');
  const [snackbarSeverityLocal, setSnackbarSeverityLocal] = useState('success');
  const [snackbarOpenLocal, setSnackbarOpenLocal] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [openValidationModal, setOpenValidationModal] = useState(false);
  const [highlightedEDI, setHighlightedEDI] = useState('');
  const [modalField, setModalField] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpenLocal(false);
  };

  const handleOpenModal = (field) => {
    setModalField(field);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalField('');
  };

  // Consulta para obtener los datos de la configuración específica
  const [fetchEdiConfig, { data: configData, loading: configLoading }] = useLazyQuery(GET_CUSTOMER_WEB_SERVICES_EDI_CONFIGS, {
    variables: { id: configId },
    fetchPolicy: 'network-only', // Asegura que se obtengan siempre los datos más recientes
  });

  useEffect(() => {
    if (open && configId) {
      fetchEdiConfig(); // Forza la recarga de los datos cuando el modal se abre
    }
  }, [open, configId, fetchEdiConfig]);

  const formik = useFormik({
    initialValues: {
      customer_id: configData?.web_services_edi_config[0]?.customer.id || '',
      sftp_url: configData?.web_services_edi_config[0]?.sftp_url || '',
      sftp_user: configData?.web_services_edi_config[0]?.sftp_user || '',
      sftp_password: configData?.web_services_edi_config[0]?.sftp_password || '',
      sftp_folder_get: configData?.web_services_edi_config[0]?.sftp_folder_get || '',
      sftp_folder_send: configData?.web_services_edi_config[0]?.sftp_folder_send || '',
      sftp_folder_send_history: configData?.web_services_edi_config[0]?.sftp_folder_send_history || '',
      sftp_folder_get_history: configData?.web_services_edi_config[0]?.sftp_folder_get_history || '',
      unit_type_id: configData?.web_services_edi_config[0]?.unit_type?.id || '',
      load_type_id: configData?.web_services_edi_config[0]?.load_type?.id || '',
      do_status_id: configData?.web_services_edi_config[0]?.do_status?.id || '',
      content_status_id: configData?.web_services_edi_config[0]?.content_status?.id || '',
      edi_990_accept: configData?.web_services_edi_config[0]?.edi_990_accept || '',
      edi_214_plan_delivery: configData?.web_services_edi_config[0]?.edi_214_plan_delivery || '',
      edi_214_plan_pickup: configData?.web_services_edi_config[0]?.edi_214_plan_pickup || '',
      file_name_patterns: configData?.web_services_edi_config[0]?.file_name_patterns || '',
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      updateEDIConfig({ variables: { id: configId, input: values } });
    },
  });
  const highlightKeys = (text) => {
    const regex = /{{(.*?)}}/g; // Resalta las llaves dobles {{ }}
    return text.replace(regex, (match) => `<span style="background-color: yellow;">${match}</span>`);
  };


  const handleValidateEDI = (ediString) => {
    setHighlightedEDI(highlightKeys(ediString));
    setOpenValidationModal(true);
  };

  const handleCloseValidationModal = () => {
    setOpenValidationModal(false);
    setHighlightedEDI('');
  };
  // Consultas para obtener los catálogos
  const [fetchCompanies, { data: companyData, loading: companyLoading }] = useLazyQuery(GET_ACTIVE_COMPANIES);
  const [fetchUnitTypes, { data: unitTypeData, loading: unitTypeLoading }] = useLazyQuery(GET_UNIT_TYPE);
  const [fetchLoadTypes, { data: loadTypeData, loading: loadTypeLoading }] = useLazyQuery(GET_LOAD_TYPE);
  const [fetchStatus, { data: statusData, loading: statusLoading }] = useLazyQuery(GET_STATUS);

  // Mutación para actualizar la configuración
  const [updateEDIConfig, { loading: updateLoading, error: updateError }] = useMutation(UPDATE_WEB_SERVICES_EDI_CONFIG, {
    onCompleted: (data) => {
      setSnackbarMessage('Actualización exitosa');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      onUpdate(data); // Refresca los datos de la tabla
      onClose(); // Cierra el modal
    },
    onError: (error) => {
      setSnackbarMessage(`Error al actualizar: ${error.message}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  // Cargar los catálogos cuando se abre el modal
  useEffect(() => {
    if (open) {
      fetchCompanies();
      fetchUnitTypes();
      fetchLoadTypes();
      fetchStatus();
    }
  }, [open, fetchCompanies, fetchUnitTypes, fetchLoadTypes, fetchStatus]);

  const isSFTPConnectionReady = formik.values.sftp_url && formik.values.sftp_user && formik.values.sftp_password;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Actualizar Configuración EDI</DialogTitle>
      {configLoading ? (
        <CircularProgress />
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
              <Tab label="Configuración SFTP" />
              <Tab label="Configuración DO" />
              <Tab label="Configuración de Templates EDI" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Empresa</InputLabel>
                    <Select
                      value="CUSTOMER"
                      label="Tipo de Empresa"
                      size="small"
                      disabled
                    >
                      <MenuItem value="CUSTOMER">Cliente</MenuItem>
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
                      }}
                      value={companyData?.companies.find(c => c.id === formik.values.customer_id) || null}
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
                          setSnackbarMessage={setSnackbarMessageLocal}
                          setSnackbarSeverity={setSnackbarSeverityLocal}
                          setSnackbarOpen={setSnackbarOpenLocal}
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
                      getOptionLabel={(option) => option.name || ''}
                      onChange={(event, value) => {
                        formik.setFieldValue('unit_type_id', value?.id || '');
                      }}
                      value={unitTypeData?.unit_types.find(u => u.id === formik.values.unit_type_id) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Unidad"
                          fullWidth
                          size="small"
                          autoComplete="off"
                          error={formik.touched.unit_type_id && Boolean(formik.errors.unit_type_id)}
                          helperText={formik.touched.unit_type_id && formik.errors.unit_type_id}
                        />
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
                      }}
                      value={loadTypeData?.load_types.find(l => l.id === formik.values.load_type_id) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tipo de Carga"
                          fullWidth
                          size="small"
                          autoComplete="off"
                        />
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
                      }}
                      value={statusData?.status.find(s => s.id === formik.values.do_status_id) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Status de DO"
                          fullWidth
                          size="small"
                          autoComplete="off"
                        />
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
                      }}
                      value={statusData?.status.find(s => s.id === formik.values.content_status_id) || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Status de Contenido"
                          fullWidth
                          size="small"
                          autoComplete="off"
                        />
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Ver">
                            <IconButton onClick={() => handleValidateEDI(formik.values.edi_990_accept)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Ver">
                            <IconButton onClick={() => handleValidateEDI(formik.values.edi_214_plan_delivery)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Validar EDI">
                            <IconButton onClick={() => handleValidateEDI(formik.values.edi_214_plan_pickup)}>
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Dialog open={openValidationModal} onClose={handleCloseValidationModal}>
                <DialogTitle>EDI</DialogTitle>
                <DialogContent>
                  <div dangerouslySetInnerHTML={{ __html: highlightedEDI }} style={{ whiteSpace: 'pre-wrap' }} />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseValidationModal} color="primary">
                    Cerrar
                  </Button>
                </DialogActions>
              </Dialog>
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} disabled={updateLoading}>Cancelar</Button>
            <Button type="submit" color="primary" disabled={updateLoading}>
              {updateLoading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </DialogActions>
          {updateError && <p>Error: {updateError.message}</p>}

          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={snackbarOpenLocal}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverityLocal}>
              {snackbarMessageLocal}
            </Alert>
          </Snackbar>
        </form>
      )}
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

export default UpdateEDIConfig;
