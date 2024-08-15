import React, { useState } from 'react';
import { Grid, TextField, Button, IconButton, Switch, FormControlLabel, Typography, InputAdornment, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const RouteConfig = ({
  id,
  route,
  data,
  isEditing,
  handleRouteChange,
  handleRemoveRoute,
  handleRemoveField,
  handleAddField,
  handleRenameRoute,
  t
}) => {
  const [newRouteName, setNewRouteName] = useState(route);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');
  const [urlError, setUrlError] = useState(false);

  const urlPattern = /^(https?:\/\/)?((([a-zA-Z0-9$_.+!*(),;:@&=~-])|%[0-9a-fA-F]{2})+(:([a-zA-Z0-9$_.+!*(),;:@&=~-]|%[0-9a-fA-F]{2})+)?@)?((([0-9]{1,3}\.){3}[0-9]{1,3})|(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}))(:(\d+))?(\/[-a-zA-Z0-9$_.+!*(),;:@&=~-]*)*(\?[-a-zA-Z0-9$_.+!*(),;:@&=~-]*)?(#[-a-zA-Z0-9$_.+!*(),;:@&=~-]*)?$/;

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    handleRouteChange(id, { ...data, [name]: value });
  };

  const handleUrlChange = (e) => {
    const { value } = e.target;
    setUrlError(!urlPattern.test(value));
    handleRouteChange(id, { ...data, url: value });
  };

  const handleRequiredFieldChange = (index, field, value) => {
    const sanitizedValue = value.replace(/[^a-zA-Z0-9_{}-]/g, ''); // remove special characters except {}
    const updatedRequiredFields = data.required_fields.map((f, i) =>
      i === index ? { ...f, [field]: sanitizedValue } : f
    );
    handleRouteChange(id, {
      ...data,
      required_fields: updatedRequiredFields
    });
  };

  const handleRouteNameChange = (e) => {
    const { value } = e.target;
    setNewRouteName(value.replace(/[^a-zA-Z0-9_]/g, '')); // only allow valid JSON node names
  };

  const handleBlur = () => {
    if (newRouteName && newRouteName !== route) {
      handleRenameRoute(id, newRouteName);
    }
  };

  // Initialize required_fields if it doesn't exist
  const requiredFields = data.required_fields || [];

  return (
    <Grid container spacing={2} sx={{ borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '8px' }}>
      <Grid item xs={12}>
        {isEditing ? (
          <TextField
            label="Route Name"
            name="route_name"
            size="small"
            value={newRouteName}
            onChange={handleRouteNameChange}
            onBlur={handleBlur}
            fullWidth
            error={newRouteName !== route && newRouteName === ''}
          />
        ) : (
          <Typography variant="h6">{route}</Typography>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          label="URL"
          name="url"
          size="small"
          value={data.url}
          onChange={handleUrlChange}
          fullWidth
          disabled={!isEditing}
          error={urlError}
          helperText={urlError ? t('customerConfig.invalidUrl') : ''}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControlLabel
          control={
            <Switch
              checked={data.receive_all_data}
              onChange={(e) => handleRouteChange(id, { ...data, receive_all_data: e.target.checked })}
              name="receive_all_data"
              color="primary"
              disabled={!isEditing}
            />
          }
          label={t('customerConfig.receiveAllData')}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <FormControlLabel
          control={
            <Switch
              checked={data.allow_multiple_notifications}
              onChange={(e) => handleRouteChange(id, { ...data, allow_multiple_notifications: e.target.checked })}
              name="allow_multiple_notifications"
              color="primary"
              disabled={!isEditing}
            />
          }
          label={t('customerConfig.allowMultipleNotifications')}
        />
      </Grid>

      {requiredFields.map((field, index) => (
        <Grid item xs={12} sm={6} md={3} key={index} container alignItems="center">
          <Box sx={{ width: '100%' }}>
            <TextField
              label="Field Name"
              size="small"
              value={field.name}
              onChange={(e) => handleRequiredFieldChange(index, 'name', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              fullWidth
              disabled={!isEditing}
              sx={{ marginBottom: '8px' }}
            />
            <TextField
              label="Field Value"
              size="small"
              value={field.value}
              onChange={(e) => handleRequiredFieldChange(index, 'value', e.target.value)}
              fullWidth
              disabled={!isEditing}
              InputProps={{
                startAdornment: field.value.startsWith('{{') && field.value.endsWith('}}') ? (
                  <InputAdornment position="start">
                    <span style={{ userSelect: 'none' }}>{'{{'}</span>
                  </InputAdornment>
                ) : null,
                endAdornment: field.value.startsWith('{{') && field.value.endsWith('}}') ? (
                  <InputAdornment position="end">
                    <span style={{ userSelect: 'none' }}>{'}}'}</span>
                    {isEditing && (
                      <IconButton onClick={() => handleRemoveField(id, field.name)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ) : isEditing ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleRemoveField(id, field.name)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null
              }}
            />
          </Box>
        </Grid>
      ))}

      {isEditing && (
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            label="New Field Name"
            size="small"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
            fullWidth
            sx={{ marginBottom: '8px' }}
          />
          <TextField
            label="New Field Value"
            size="small"
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value.replace(/[^a-zA-Z0-9_{}]/g, ''))}
            fullWidth
            sx={{ marginBottom: '8px' }}
          />
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              handleAddField(id, { name: newFieldName, value: newFieldValue.startsWith('{{') && newFieldValue.endsWith('}}') ? newFieldValue : `{{${newFieldValue}}}` });
              setNewFieldName('');
              setNewFieldValue('');
            }}
            disabled={!newFieldName || !newFieldValue}
          >
            {t('customerConfig.addField')}
          </Button>
        </Grid>
      )}

      {isEditing && (
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => handleRemoveRoute(id)}
          >
            {t('customerConfig.removeRoute')}
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default RouteConfig;
