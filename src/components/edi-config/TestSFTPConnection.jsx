import React, { useState } from 'react';
import { CircularProgress, IconButton, Tooltip, Box, Chip, Popover, Typography } from '@mui/material';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import FileCopyIcon from '@mui/icons-material/FileCopy';

const TestSFTPConnection = ({ sftp_url, sftp_user, sftp_password, sftp_folders, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [folderStatuses, setFolderStatuses] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleTestConnection = async (event) => {
    setLoading(true);
    setStatus(null);
    setFolderStatuses({});
    setAnchorEl(event.currentTarget);

    try {
      const response = await axios.post(import.meta.env.VITE_SFTP_TEST_CONNECTION, {
        sftp_url,
        sftp_user,
        sftp_password,
        folders: sftp_folders,
      });

      setSnackbarSeverity(response.data.success ? 'success' : 'error');
      setSnackbarMessage(response.data.message);
      setSnackbarOpen(true);
      setStatus(response.data.success ? 'success' : 'error');
      setFolderStatuses(response.data.folder_statuses || {});
      setShowResults(true);
    } catch (error) {
      setSnackbarSeverity('error');
      const errorMessage = error.response && error.response.data && error.response.data.message 
        ? error.response.data.message 
        : 'Error testing connection';
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      setStatus('error');
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowResults(false);
  };

  const handleCopy = () => {
    const resultsText = Object.entries(folderStatuses)
      .map(([folder, status]) => `${folder}: ${status === 'exists' ? 'Existe' : 'No existe'}`)
      .join('\n');
    navigator.clipboard.writeText(resultsText)
      .then(() => {
        setSnackbarMessage('Resultados copiados al portapapeles');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('No se pudieron copiar los resultados');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  };

  const open = Boolean(anchorEl);

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
              backgroundColor: status === 'success' ? '#4caf50' : status === 'error' ? '#f44336' : '#3f51b5',
              color: '#fff',
              borderRadius: '4px',
              boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
            }}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={open && showResults}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box p={2} display="flex" flexDirection="column" gap={1} maxWidth="300px">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1">SFTP Test Results</Typography>
            <Box>
              <IconButton size="small" onClick={handleCopy} title="Copy Results">
                <FileCopyIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleClose} title="Close">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {Object.entries(folderStatuses).map(([folder, status]) => (
            <Tooltip key={folder} title={status === 'exists' ? 'Existe' : 'No existe'}>
              <Chip
                icon={status === 'exists' ? <CheckIcon /> : <CancelIcon />}
                label={folder}
                color={status === 'exists' ? 'primary' : 'error'}
                variant="outlined"
                style={{ maxWidth: '100%' }}
              />
            </Tooltip>
          ))}
        </Box>
      </Popover>
    </div>
  );
};

export default TestSFTPConnection;
