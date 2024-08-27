import React, { useState } from 'react';
import { CircularProgress, IconButton, Tooltip } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TestSFTPConnection = ({ sftp_url, sftp_user, sftp_password, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null: default, 'success': green, 'error': red

  const handleTestConnection = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await axios.post(import.meta.env.VITE_SFTP_TEST_CONNECTION, {
        sftp_url,
        sftp_user,
        sftp_password,
      });
      setSnackbarSeverity(response.data.success ? 'success' : 'error');
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
      setStatus(response.data.success ? 'success' : 'error');
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
    </div>
  );
};

export default TestSFTPConnection;
