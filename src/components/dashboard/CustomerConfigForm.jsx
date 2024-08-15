import React, { useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import RouteConfig from './RouteConfig';
import ReactJson from 'react-json-view';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import SearchIcon from '@mui/icons-material/Search';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const useStyles = makeStyles((theme) => ({
  searchBox: {
    marginBottom: theme.spacing(2),
  },
  scrollContainer: {
    maxHeight: '450px',
    overflowY: 'auto',
    padding: theme.spacing(2),
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  routeContainer: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  routeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  routeTitle: {
    fontWeight: 'bold',
  },
  routeUrl: {
    color: theme.palette.text.secondary,
  },
  previewButton: {
    position: 'relative',
    top: theme.spacing(0),
    right: theme.spacing(0),
  },
}));

const CustomerConfigForm = ({
  isEditing,
  formData,
  handleFieldChange,
  handleRouteChange,
  handleAddRoute,
  handleRemoveRoute,
  handleRemoveField,
  handleAddField,
  handleRenameRoute,
  handleEditClick,
  handleSaveClick,
  handleCancelClick,
  handleOpenViewModal,
  handleOpenReplaceModal,
  handleJsonChange,
  t,
  advancedConfig
}) => {
  const classes = useStyles();
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteUrl, setNewRouteUrl] = useState('');
  const [urlError, setUrlError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const urlPattern = /^(https?:\/\/)?((([a-zA-Z0-9$_.+!*(),;:@&=~-])|%[0-9a-fA-F]{2})+(:([a-zA-Z0-9$_.+!*(),;:@&=~-]|%[0-9a-fA-F]{2})+)?@)?((([0-9]{1,3}\.){3}[0-9]{1,3})|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))(:(\d+))?(\/[-a-zA-Z0-9$_.+!*(),;:@&=~-]*)*(\?[-a-zA-Z0-9$_.+!*(),;:@&=~-]*)?(#[-a-zA-Z0-9$_.+!*(),;:@&=~-]*)?$/;

  const toggleAdvanced = () => {
    setIsAdvanced(!isAdvanced);
  };

  const sortedRoutes = Object.keys(formData.notifications)
    .sort((a, b) => {
      const routeA = formData.notifications[a]?.routeName?.toUpperCase() || '';
      const routeB = formData.notifications[b]?.routeName?.toUpperCase() || '';
      if (routeA < routeB) return -1;
      if (routeA > routeB) return 1;
      return 0;
    })
    .filter((route) => route.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddRouteClick = () => {
    if (!urlPattern.test(newRouteUrl)) {
      setSnackbarMessage(t('customerConfig.invalidUrl'));
      setSnackbarOpen(true);
      return;
    }

    if (newRouteName && newRouteUrl) {
      handleAddRoute(newRouteName, newRouteUrl);
      setNewRouteName('');
      setNewRouteUrl('');
    } else {
      setSnackbarMessage('Please provide both route name and URL.');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  const startTutorial = () => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        {
          element: '#route-name',
          popover: {
            title: 'Route Name',
            description: 'Enter the name of the Route here.',
            position: 'bottom',
          },
        },
        {
          element: '#url-field',
          popover: {
            title: 'URL',
            description: 'Enter the URL for the route here.',
            position: 'bottom',
          },
        },
        {
          element: '#auth-switch',
          popover: {
            title: 'Authentication',
            description: 'Toggle this switch if the route requires authentication.',
            position: 'bottom',
          },
        },
      ]
    });

    driverObj.drive();
  };

  const handleEditClickWithTutorial = () => {
    handleEditClick();
    setTimeout(() => {
      startTutorial();
    }, 1000);
  };

  return (
    <Container maxWidth="xl">
      <Paper sx={{ padding: '16px', marginBottom: '16px' }}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom textAlign="center">
              {t('customerConfig.title')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={10}>
            <Grid container spacing={2} alignItems="center" justifyContent="center">
              {advancedConfig && (
                <IconButton
                  className={classes.previewButton}
                  variant="outlined"
                  color="primary"
                  title={t('customerConfig.previewJson')}
                  onClick={handleOpenPreview}
                >
                  <PreviewIcon />
                </IconButton>
              )}
              <Grid item>
                <TextField
                  label={t('customerConfig.customerName')}
                  name="name"
                  size="small"
                  value={formData.name}
                  onChange={handleFieldChange}
                  disabled
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.allow_notifications}
                      onChange={handleFieldChange}
                      name="allow_notifications"
                      color="primary"
                      disabled={!isEditing}
                    />
                  }
                  label={t('customerConfig.allowNotifications')}
                />
              </Grid>
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch
                      id="auth-switch"
                      checked={formData.needs_authentication}
                      onChange={handleFieldChange}
                      name="needs_authentication"
                      color="primary"
                      disabled={!isEditing}
                    />
                  }
                  label={t('customerConfig.needsAuthentication')}
                />
              </Grid>
              {formData.needs_authentication && (
                <>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('customerConfig.authenticationType')}
                      name="authentication_type"
                      size="small"
                      value={formData.authentication_type}
                      onChange={handleFieldChange}
                      disabled={!isEditing}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={t('customerConfig.authenticationCredentials')}
                      name="authentication_credentials"
                      size="small"
                      value={JSON.stringify(formData.authentication_credentials)}
                      onChange={(e) => handleFieldChange({
                        target: {
                          name: 'authentication_credentials',
                          value: JSON.parse(e.target.value)
                        }
                      })}
                      disabled={!isEditing}
                      fullWidth
                      multiline
                      rows={4}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>

          {isEditing && (
            <>
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  id="route-name"
                  label="Route Name"
                  size="small"
                  value={newRouteName}
                  onChange={(e) => setNewRouteName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  id="url-field"
                  label="URL"
                  size="small"
                  value={newRouteUrl}
                  onChange={(e) => {
                    setNewRouteUrl(e.target.value);
                    setUrlError(!urlPattern.test(e.target.value));
                  }}
                  fullWidth
                  error={urlError}
                  helperText={urlError ? t('customerConfig.invalidUrl') : ''}
                />
              </Grid>
              <Grid item xs={12} sm={2} md={2} sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddRouteClick}
                  sx={{ marginTop: '8px' }}
                  disabled={!newRouteName || !newRouteUrl || urlError}
                >
                  {t('customerConfig.addRoute')}
                </Button>
              </Grid>
            </>
          )}

          {!isAdvanced && (
            <>
              <Grid item xs={12}>
                <TextField
                  label={t('customerConfig.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                  size="small"
                  className={classes.searchBox}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12} className={classes.scrollContainer}>
                {sortedRoutes.map((id) => (
                  <Box key={id} className={classes.routeContainer}>
                    <RouteConfig
                      id={id}
                      route={formData.notifications[id].routeName}
                      data={formData.notifications[id]}
                      isEditing={isEditing}
                      handleRouteChange={handleRouteChange}
                      handleRemoveRoute={handleRemoveRoute}
                      handleRemoveField={handleRemoveField}
                      handleAddField={handleAddField}
                      handleRenameRoute={handleRenameRoute}
                      t={t}
                    />
                  </Box>
                ))}
              </Grid>
            </>
          )}

          {isAdvanced && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6">{t('customerConfig.advancedConfig')}</Typography>
                <Typography variant="h6">Notificaciones:</Typography>
                {isEditing ? (
                  <>
                    <Box sx={{ width: '100%' }}>
                      <ReactJson
                        src={formData.notifications}
                        onEdit={(edit) => handleJsonChange('notifications', edit)}
                        onAdd={(edit) => handleJsonChange('notifications', edit)}
                        onDelete={(edit) => handleJsonChange('notifications', edit)}
                        theme="brewer"
                        iconStyle="circle"
                        enableClipboard={true}
                        displayObjectSize={true}
                        displayDataTypes={false}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenReplaceModal('notifications')}
                      sx={{ marginTop: '8px', marginRight: '8px' }}
                    >
                      Reemplazar JSON de Notificaciones
                    </Button>
                  </>
                ) : (
                  <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px', width: '100%' }}>
                    <ReactJson
                      src={formData.notifications}
                      collapsed={1}
                      theme="brewer"
                      iconStyle="circle"
                      enableClipboard={true}
                      displayObjectSize={true}
                      displayDataTypes={false}
                    />
                    <Button onClick={() => handleOpenViewModal(formData.notifications)}>Ver</Button>
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Campos Requeridos:</Typography>
                {isEditing ? (
                  <>
                    <Box sx={{ width: '100%' }}>
                      <ReactJson
                        src={formData.required_fields}
                        onEdit={(edit) => handleJsonChange('required_fields', edit)}
                        onAdd={(edit) => handleJsonChange('required_fields', edit)}
                        onDelete={(edit) => handleJsonChange('required_fields', edit)}
                        theme="brewer"
                        iconStyle="circle"
                        enableClipboard={true}
                        displayObjectSize={true}
                        displayDataTypes={false}
                      />
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenReplaceModal('required_fields')}
                      sx={{ marginTop: '8px', marginRight: '8px' }}
                    >
                      Reemplazar JSON de Campos Requeridos
                    </Button>
                  </>
                ) : (
                  <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px', width: '100%' }}>
                    <ReactJson
                      src={formData.required_fields}
                      collapsed={1}
                      theme="brewer"
                      iconStyle="circle"
                      enableClipboard={true}
                      displayObjectSize={true}
                      displayDataTypes={false}
                    />
                    <Button onClick={() => handleOpenViewModal(formData.required_fields)}>Ver</Button>
                  </Box>
                )}
              </Grid>
            </>
          )}

          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleSaveClick}
                  sx={{ marginRight: '8px' }}
                >
                  {t('customerConfig.save')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={handleCancelClick}
                >
                  {t('customerConfig.cancel')}
                </Button>
              </>
            ) : (
              <Button variant="contained" size="small" color="primary" onClick={handleEditClickWithTutorial}>
                {t('customerConfig.edit')}
              </Button>
            )}
          </Grid>
          {advancedConfig && (
            <Grid item xs={12} sx={{ textAlign: 'center', marginTop: '16px' }}>
              <Button variant="outlined" color="primary" size="small" onClick={toggleAdvanced}>
                {isAdvanced ? t('customerConfig.simpleConfig') : t('customerConfig.advancedConfig')}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>{t('customerConfig.previewJson')}</DialogTitle>
        <DialogContent>
          <ReactJson
            src={formData}
            theme="brewer"
            iconStyle="circle"
            enableClipboard={true}
            displayObjectSize={true}
            displayDataTypes={false}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview} color="primary">
            {t('customerConfig.close')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default CustomerConfigForm;
