import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CUSTOMER_CONFIG, UPDATE_CUSTOMER_CONFIG, CREATE_CUSTOMER_CONFIG } from '/src/graphql/queries';
import { CircularProgress, Paper, Typography, Button, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CustomerConfigForm from '/src/components/dashboard/CustomerConfigForm';
import ConfirmationDialog from '/src/components/dashboard/ConfirmationDialog';
import SnackbarNotification from '/src/components/dashboard/SnackbarNotification';
import ViewModal from '/src/components/dashboard/ViewModal';
import ReplaceModal from '/src/components/dashboard/ReplaceModal';
import { useTranslation } from 'react-i18next';

const Administrador = () => {
  const { t } = useTranslation();
  const customer_id = localStorage.getItem('customer_id');
  const { data, loading, error, refetch } = useQuery(GET_CUSTOMER_CONFIG, {
    variables: { customer_id }
  });
  const [updateCustomerConfig] = useMutation(UPDATE_CUSTOMER_CONFIG);
  const [createCustomerConfig] = useMutation(CREATE_CUSTOMER_CONFIG);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    allow_notifications: false,
    notifications: {},
    required_fields: {},
    needs_authentication: false,
    authentication_type: '',
    authentication_credentials: {}
  });
  const [isAdvancedConfig, setIsAdvancedConfig] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [replaceField, setReplaceField] = useState('');
  const [newJson, setNewJson] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (data && data.web_services_customer_config_by_pk) {
      const { name, allow_notifications, notifications, required_fields, advanced_config, needs_authentication, authentication_type, authentication_credentials } = data.web_services_customer_config_by_pk;
      setIsAdvancedConfig(advanced_config);
      const notificationsWithIds = Object.keys(notifications).reduce((acc, routeName) => {
        const routeData = notifications[routeName];
        const required_fields = Object.keys(routeData.required_fields || {}).map(field => ({
          name: field,
          value: routeData.required_fields[field]
        }));
        return { ...acc, [routeName]: { routeName, ...routeData, required_fields } };
      }, {});
      setFormData({ name, allow_notifications, notifications: notificationsWithIds, required_fields, needs_authentication, authentication_type, authentication_credentials });
    }
  }, [data]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    try {
      const notificationsWithoutIds = Object.keys(formData.notifications).reduce((acc, id) => {
        const { key, routeName, required_fields, ...routeData } = formData.notifications[id];
        const required_fields_obj = required_fields.reduce((fieldsAcc, field) => {
          fieldsAcc[field.name] = field.value;
          return fieldsAcc;
        }, {});
        return { ...acc, [routeName]: { ...routeData, required_fields: required_fields_obj } };
      }, {});

      if (data && data.web_services_customer_config_by_pk) {
        await updateCustomerConfig({
          variables: {
            customer_id,
            allow_notifications: formData.allow_notifications,
            notifications: notificationsWithoutIds,
            required_fields: formData.required_fields,
            needs_authentication: formData.needs_authentication,
            authentication_type: formData.authentication_type,
            authentication_credentials: formData.authentication_credentials
          }
        });
      } else {
        await createCustomerConfig({
          variables: {
            customer_id,
            name: formData.name,
            allow_notifications: formData.allow_notifications,
            notifications: notificationsWithoutIds,
            required_fields: formData.required_fields,
            needs_authentication: formData.needs_authentication,
            authentication_type: formData.authentication_type,
            authentication_credentials: formData.authentication_credentials
          }
        });
      }

      setIsEditing(false);
      setSnackbarMessage(t('customerConfig.changesSaved'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refetch(); // Refresh data from the database
    } catch (error) {
      setSnackbarMessage('Error al guardar los cambios');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error("Error actualizando la configuración del cliente:", error);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (data && data.web_services_customer_config_by_pk) {
      const { name, allow_notifications, notifications, required_fields, needs_authentication, authentication_type, authentication_credentials } = data.web_services_customer_config_by_pk;
      const notificationsWithIds = Object.keys(notifications).reduce((acc, routeName) => {
        const routeData = notifications[routeName];
        const required_fields = Object.keys(routeData.required_fields || {}).map(field => ({
          name: field,
          value: routeData.required_fields[field]
        }));
        return { ...acc, [routeName]: { routeName, ...routeData, required_fields } };
      }, {});
      setFormData({ name, allow_notifications, notifications: notificationsWithIds, required_fields, needs_authentication, authentication_type, authentication_credentials });
    }
  };

  const handleFieldChange = (e) => {
    const { name, checked, type, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleRouteChange = (id, updatedRouteData) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [id]: updatedRouteData
      }
    });
  };

  const handleAddRoute = (routeName, url) => {
    if (!formData.notifications[routeName]) {
      setFormData({
        ...formData,
        notifications: {
          ...formData.notifications,
          [routeName]: {
            routeName,
            url,
            receive_all_data: false,
            allow_multiple_notifications: false,
            required_fields: []
          }
        }
      });
    } else {
      setSnackbarMessage('El nombre de la ruta ya existe');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleRemoveRoute = (id) => {
    const { [id]: _, ...rest } = formData.notifications;
    setFormData({
      ...formData,
      notifications: rest
    });
  };

  const handleRemoveField = (routeId, fieldName) => {
    const updatedRequiredFields = formData.notifications[routeId].required_fields.filter(field => field.name !== fieldName);
    handleRouteChange(routeId, {
      ...formData.notifications[routeId],
      required_fields: updatedRequiredFields
    });
  };

  const handleAddField = (routeId, field) => {
    handleRouteChange(routeId, {
      ...formData.notifications[routeId],
      required_fields: [...formData.notifications[routeId].required_fields, field]
    });
  };

  const handleRenameRoute = (id, newRouteName) => {
    if (!formData.notifications[newRouteName]) {
      const { [id]: routeData, ...rest } = formData.notifications;
      const updatedRouteData = { ...routeData, routeName: newRouteName };
      setFormData({
        ...formData,
        notifications: {
          ...rest,
          [newRouteName]: updatedRouteData
        }
      });
    } else {
      setSnackbarMessage('El nombre de la ruta ya existe');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleJsonChange = (field, edit) => {
    const updatedSrc = edit.updated_src;
    const convertStringToBoolean = (obj) => {
      Object.keys(obj).forEach(key => {
        if (obj[key] === "true") obj[key] = true;
        if (obj[key] === "false") obj[key] = false;
        if (typeof obj[key] === "object" && obj[key] !== null) convertStringToBoolean(obj[key]);
      });
    };
    convertStringToBoolean(updatedSrc);

    setFormData({
      ...formData,
      [field]: updatedSrc
    });
  };

  const handleOpenViewModal = (content) => {
    setModalContent(content);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
  };

  const handleOpenReplaceModal = (field) => {
    setReplaceField(field);
    setNewJson('');
    setReplaceModalOpen(true);
  };

  const handleCloseReplaceModal = () => {
    setReplaceModalOpen(false);
  };

  const handleReplaceJson = () => {
    try {
      const parsedJson = JSON.parse(newJson);
      setFormData({
        ...formData,
        [replaceField]: parsedJson
      });
      setSnackbarMessage(`JSON de ${replaceField} reemplazado exitosamente`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(t('customerConfig.invalidJson'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    setReplaceModalOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (loading || isRefreshing) return <CircularProgress />;
  if (error) return <p>Error cargando la configuración del cliente</p>;

  return (
    <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={isRefreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          onClick={handleRefreshClick}
          disabled={isRefreshing}
        >
          Refresh
        </Button>
      </Stack>
      <CustomerConfigForm
        isEditing={isEditing}
        formData={formData}
        handleFieldChange={handleFieldChange}
        handleRouteChange={handleRouteChange}
        handleAddRoute={handleAddRoute}
        handleRemoveRoute={handleRemoveRoute}
        handleRemoveField={handleRemoveField}
        handleAddField={handleAddField}
        handleRenameRoute={handleRenameRoute}
        handleEditClick={handleEditClick}
        handleSaveClick={handleSaveClick}
        handleCancelClick={handleCancelClick}
        handleOpenViewModal={handleOpenViewModal}
        handleOpenReplaceModal={handleOpenReplaceModal}
        handleJsonChange={handleJsonChange}
        t={t}
        advancedConfig={isAdvancedConfig} // Control de configuración avanzada
      />
      <ViewModal
        open={viewModalOpen}
        handleClose={handleCloseViewModal}
        jsonContent={modalContent}
      />
      <ReplaceModal
        open={replaceModalOpen}
        handleClose={handleCloseReplaceModal}
        field={replaceField}
        newJson={newJson}
        setNewJson={setNewJson}
        handleReplaceJson={handleReplaceJson}
      />
      <ConfirmationDialog
        open={confirmOpen}
        handleClose={() => setConfirmOpen(false)}
        handleConfirm={handleConfirmSave}
      />
      <SnackbarNotification
        open={snackbarOpen}
        handleClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Paper>
  );
};

export default Administrador;
