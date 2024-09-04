import React, { useState } from 'react';
import { CircularProgress, IconButton, Tooltip, Box, Chip, Typography } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';

const TestSFTPConnection = ({ sftp_url, sftp_user, sftp_password, sftp_folders, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null: default, 'success': green, 'error': red
  const [folderStatuses, setFolderStatuses] = useState({}); // Estado para almacenar el estado de las carpetas

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus(null);
    setFolderStatuses({}); // Limpiar el estado anterior de las carpetas
    try {
      const response = await axios.post(import.meta.env.VITE_SFTP_TEST_CONNECTION, {
        sftp_url,
        sftp_user,
        sftp_password,
        folders: sftp_folders, // Pasar las carpetas al backend
      });
      
      setSnackbarSeverity(response.data.success ? 'success' : 'error');
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
      setStatus(response.data.success ? 'success' : 'error');
      setFolderStatuses(response.data.folder_statuses || {}); // Actualizar el estado con el estado de las carpetas
    } catch (error) {
      setSnackbarSeverity('error');
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Error testing connection';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Tooltip title="Test SFTP Connection">
        <span>
          <IconButton 
            onClick={handleTestConnection}
            disabled={loading}
            size="small"
            style={{
              padding: '6px',
              marginLeft: '8px',
              backgroundColor: status === 'success' ? '#4caf50' : status === 'error' ? '#f44336' : '#3f51b5', // Verde si es exitoso, rojo si falla, azul por defecto
              color: '#fff',
              borderRadius: '4px',
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          </IconButton>
        </span>
      </Tooltip>

      {/* Mostrar estado de las carpetas */}
      <Box mt={2} display="flex" flexDirection="column" gap={1}>
        {Object.entries(folderStatuses).map(([folder, status]) => (
          <Chip
            key={folder}
            icon={status === 'exists' ? <CheckIcon /> : <CancelIcon />}
            label={`${folder}: ${status === 'exists' ? 'OK' : 'NO'}`}
            color={status === 'exists' ? 'success' : 'error'}
            variant="outlined"
            style={{ maxWidth: '100%' }}
          />
        ))}
      </Box>
    </div>
  );
};

export default TestSFTPConnection;
