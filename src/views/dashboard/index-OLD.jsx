import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CUSTOMER_CONFIG, UPDATE_CUSTOMER_CONFIG } from '/src/graphql/queries';
import {
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Box,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Modal,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ReactJson from 'react-json-view';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const CustomerConfig = () => {
  const customer_id = localStorage.getItem('customer_id');
  const { data, loading, error } = useQuery(GET_CUSTOMER_CONFIG, {
    variables: { customer_id }
  });
  const [updateCustomerConfig] = useMutation(UPDATE_CUSTOMER_CONFIG);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    allow_notifications: false,
    notifications: {},
    required_fields: {}
  });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [replaceField, setReplaceField] = useState('');
  const [newJson, setNewJson] = useState('');

  useEffect(() => {
    if (data && data.web_services_customer_config_by_pk) {
      const { name, allow_notifications, notifications, required_fields } = data.web_services_customer_config_by_pk;
      setFormData({ name, allow_notifications, notifications, required_fields });
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
      await updateCustomerConfig({
        variables: {
          customer_id,
          allow_notifications: formData.allow_notifications,
          notifications: formData.notifications,
          required_fields: formData.required_fields,
        }
      });
      setIsEditing(false);
      setSnackbarMessage('Changes saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Error saving changes');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      console.error("Error updating customer config:", error);
    }
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    if (data && data.web_services_customer_config_by_pk) {
      const { name, allow_notifications, notifications, required_fields } = data.web_services_customer_config_by_pk;
      setFormData({ name, allow_notifications, notifications, required_fields });
    }
  };

  const handleFieldChange = (e) => {
    const { name, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : e.target.value
    });
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
      setSnackbarMessage(`${replaceField} JSON replaced successfully`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage('Invalid JSON format');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
    setReplaceModalOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  if (loading) return <CircularProgress />;
  if (error) return <p>Error loading customer configuration</p>;

  const { name, allow_notifications, notifications, required_fields } = formData;

  return (
    <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Customer Configuration
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Customer Name:</Typography>
          <Typography variant="body1">{name || 'No data available'}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Allow Notifications:</Typography>
          {isEditing ? (
            <FormControlLabel
              control={
                <Switch
                  checked={allow_notifications}
                  onChange={handleFieldChange}
                  name="allow_notifications"
                  color="primary"
                />
              }
              label={allow_notifications ? 'Yes' : 'No'}
            />
          ) : (
            <Typography variant="body1">
              {allow_notifications ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Notifications:</Typography>
          {isEditing ? (
            <>
              <ReactJson
                src={notifications}
                onEdit={(edit) => handleJsonChange('notifications', edit)}
                onAdd={(edit) => handleJsonChange('notifications', edit)}
                onDelete={(edit) => handleJsonChange('notifications', edit)}
                theme="brewer"
                iconStyle="circle"
                enableClipboard={true}
                displayObjectSize={true}
                displayDataTypes={false}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenReplaceModal('notifications')}
                sx={{ marginTop: '8px', marginRight: '8px' }}
              >
                Replace Notifications JSON
              </Button>
            </>
          ) : (
            <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px' }}>
              <ReactJson
                src={notifications}
                collapsed={1}
                theme="brewer"
                iconStyle="circle"
                enableClipboard={true}
                displayObjectSize={true}
                displayDataTypes={false}
              />
              <Button onClick={() => handleOpenViewModal(notifications)}>View</Button>
            </Box>
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6">Required Fields:</Typography>
          {isEditing ? (
            <>
              <ReactJson
                src={required_fields}
                onEdit={(edit) => handleJsonChange('required_fields', edit)}
                onAdd={(edit) => handleJsonChange('required_fields', edit)}
                onDelete={(edit) => handleJsonChange('required_fields', edit)}
                theme="brewer"
                iconStyle="circle"
                enableClipboard={true}
                displayObjectSize={true}
                displayDataTypes={false}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenReplaceModal('required_fields')}
                sx={{ marginTop: '8px', marginRight: '8px' }}
              >
                Replace Required Fields JSON
              </Button>
            </>
          ) : (
            <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px' }}>
              <ReactJson
                src={required_fields}
                collapsed={1}
                theme="brewer"
                iconStyle="circle"
                enableClipboard={true}
                displayObjectSize={true}
                displayDataTypes={false}
              />
              <Button onClick={() => handleOpenViewModal(required_fields)}>View</Button>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          {isEditing ? (
            <>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                color="primary"
                onClick={handleSaveClick}
                sx={{ marginRight: '8px' }}
              >
                Save
              </Button>
              <Button
                startIcon={<CloseIcon />}
                variant="contained"
                color="secondary"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </>
          ) : (
            <IconButton onClick={handleEditClick}>
              <EditIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>
      <Modal
        open={viewModalOpen}
        onClose={handleCloseViewModal}
        aria-labelledby="modal-view-title"
        aria-describedby="modal-view-description"
      >
        <Box sx={style}>
          <Typography id="modal-view-title" variant="h6" component="h2">
            View JSON
          </Typography>
          <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto' }}>
            <ReactJson
              src={modalContent}
              collapsed={false}
              theme="brewer"
              iconStyle="circle"
              enableClipboard={true}
              displayObjectSize={true}
              displayDataTypes={false}
            />
          </Box>
          <Button onClick={handleCloseViewModal} variant="contained" color="secondary">
            Close
          </Button>
        </Box>
      </Modal>
      <Modal
        open={replaceModalOpen}
        onClose={handleCloseReplaceModal}
        aria-labelledby="modal-replace-title"
        aria-describedby="modal-replace-description"
      >
        <Box sx={style}>
          <Typography id="modal-replace-title" variant="h6" component="h2">
            Replace {replaceField} JSON
          </Typography>
          <TextField
            label={`New ${replaceField} JSON`}
            multiline
            fullWidth
            rows={10}
            variant="outlined"
            value={newJson}
            onChange={(e) => setNewJson(e.target.value)}
            sx={{ marginBottom: '16px' }}
          />
          <Button onClick={handleReplaceJson} variant="contained" color="primary" sx={{ marginRight: '8px' }}>
            Replace JSON
          </Button>
          <Button onClick={handleCloseReplaceModal} variant="contained" color="secondary">
            Cancel
          </Button>
        </Box>
      </Modal>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Confirm Save</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to save these changes?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" autoFocus>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default CustomerConfig;
