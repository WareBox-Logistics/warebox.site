import * as React from 'react';
import { useState } from 'react';
import { Button, CircularProgress, Box, Typography, Chip, Snackbar, Alert, Grid, Paper, IconButton, Tooltip } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineDot from '@mui/lab/TimelineDot';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

const TechnicalTestsButton = ({ sftp_url, sftp_user, sftp_password, sftp_folders, file_name_patterns, testResults, setTestResults }) => {
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const toggleFolder = (folder) => {
    setExpandedFolders((prevState) => ({
      ...prevState,
      [folder]: !prevState[folder],
    }));
  };

  const runTechnicalTests = async () => {
    setLoading(true);
    try {
      const response = await axios.post(import.meta.env.VITE_SFTP_TECHNICAL_TESTS, {
        sftp_url,
        sftp_user,
        sftp_password,
        folders: sftp_folders,
        file_name_patterns,
      });
  
      if (response.data.success) {
        setTestResults(response.data.results);
        setSnackbarMessage("Pruebas técnicas completadas con éxito.");
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage(response.data.message);
        setSnackbarSeverity('error');
      }
    } catch (error) {
      if (error.response) {
        const backendMessage = error.response.data.message || 'Error desconocido';
        setSnackbarMessage(`${backendMessage}`);
      } else {
        setSnackbarMessage(error.message);
      }
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const copySummaryToClipboard = () => {
    const connectionStatus = testResults?.connection_status === "Connection successful" ? "Exitosa" : "Fallida";
    const folderStatuses = Object.entries(testResults?.folder_statuses || {})
      .map(([folder, status]) => `${folder}: ${status === "exists" ? "Existe" : "No existe"}`)
      .join('\n');
    const foundFiles = Object.entries(testResults?.search_results || {})
      .filter(([folder, files]) => Array.isArray(files) && files.length > 0)
      .map(([folder, files]) => `${folder}: ${files.length} archivo(s) encontrado(s)`)
      .join('\n');
  
    const summary = `
      Resumen de las Pruebas Técnicas:
      Conexión SFTP: ${connectionStatus}
      URL: ${sftp_url}
      Usuario: ${sftp_user}
  
      Carpetas Verificadas:
      ${folderStatuses}
      
      Archivos Coincidentes (Patrón de Búsqueda: ${file_name_patterns || "No especificado"}):
      ${foundFiles || "No se encontraron archivos."}
    `;
  
    navigator.clipboard.writeText(summary);
    setSnackbarMessage("Resumen copiado al portapapeles.");
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };
  
  

  const renderFolderResults = (folder, files) => (
    <Grid item xs={12} key={folder}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          cursor: 'pointer', 
          '&:hover': {
            backgroundColor: '#e3f2fd',
          },
        }}
        onClick={() => toggleFolder(folder)}
      >
        <Box display="flex" alignItems="center">
          <IconButton size="small" color="primary" sx={{ mr: 1 }}>
            {expandedFolders[folder] ? <FolderOpenIcon /> : <FolderIcon />}
          </IconButton>
          <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
            {folder} 
            <Typography 
              variant="body1" 
              component="span" 
              color="secondary" 
              sx={{ ml: 1 }}
            >
              ({files.length} archivo{files.length !== 1 ? 's' : ''} encontrado{files.length !== 1 ? 's' : ''})
            </Typography>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {expandedFolders[folder] ? "Clic para contraer" : "Clic para expandir"}
          </Typography>
        </Box>

        {expandedFolders[folder] && (
          <Box 
            display="flex" 
            flexWrap="wrap" 
            gap={1} 
            sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 1, 
              backgroundColor: '#f9f9f9', 
              border: '1px solid #e0e0e0' 
            }}
          >
            {files.map((file, index) => (
              <Chip 
                key={index} 
                label={file} 
                color="primary" 
                variant="outlined" 
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que colapse la carpeta al hacer clic en un archivo
                  navigator.clipboard.writeText(file);
                }} 
                icon={<CheckCircleIcon />}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Grid>
  );

  const renderNoMatchFolders = () => {
    const noMatchFolders = Object.entries(testResults?.search_results || {}).filter(([folder, files]) => !(Array.isArray(files) && files.length > 0));

    return noMatchFolders.length > 0 ? (
      <Grid item xs={12}>
        <Typography variant="subtitle1" color="error">
          Carpetas sin coincidencias:
        </Typography>
        {noMatchFolders.map(([folder]) => (
          <Chip key={folder} label={folder} color="error" icon={<ErrorIcon />} sx={{ mr: 1, mt: 1 }} />
        ))}
      </Grid>
    ) : null;
  };

  const renderSummary = () => {
    const connectionStatus = testResults?.connection_status === "Connection successful";
    const folderStatuses = Object.entries(testResults?.folder_statuses || {}).filter(([_, status]) => status === "exists").length;
    const foundFiles = Object.entries(testResults?.search_results || {}).some(([_, files]) => Array.isArray(files) && files.length > 0);

    return (
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: 'primary.main', mb: 4 }}>
            Resumen de las Pruebas Técnicas
          </Typography>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<ContentCopyIcon />} 
            onClick={copySummaryToClipboard}
            sx={{ color: 'primary.main', mb: 4 }}
          >
            Copiar Resumen
          </Button>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Conexión SFTP:</strong> {connectionStatus ? "Exitosa" : "Fallida"}
            </Typography>
            <Typography sx={{ color: connectionStatus ? 'green' : 'red' }}>
              {connectionStatus ? <CheckCircleIcon /> : <ErrorIcon />} {testResults.connection_status}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Carpetas Verificadas:</strong> {folderStatuses} de {Object.keys(testResults?.folder_statuses || {}).length} existen
            </Typography>
            <Typography sx={{ color: folderStatuses > 0 ? 'green' : 'red' }}>
              {folderStatuses > 0 ? <CheckCircleIcon /> : <ErrorIcon />} {folderStatuses > 0 ? "Carpetas encontradas" : "No se encontraron carpetas"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body1">
              <strong>Archivos Coincidentes:</strong> {foundFiles ? "Sí" : "No"}
            </Typography>
            <Typography sx={{ color: foundFiles ? 'green' : 'red' }}>
              {foundFiles ? <CheckCircleIcon /> : <ErrorIcon />} {foundFiles ? "Archivos encontrados" : "No se encontraron archivos"}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={runTechnicalTests} 
        disabled={loading}
        startIcon={
          loading ? (
            <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
          ) : (
            <CheckCircleIcon sx={{ mr: 1 }} />
          )
        }
        sx={{
          minWidth: '200px',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          '&:hover': {
            backgroundColor: '#1976d2',
            boxShadow: '0px 4px 20px rgba(25, 118, 210, 0.3)',
          },
          '&:disabled': {
            backgroundColor: '#b0bec5',
            color: '#ffffff',
          },
        }}
      >
        {loading ? "Ejecutando Pruebas..." : "Realizar Pruebas Técnicas"}
      </Button>


      {/* Mostrar resultados de pruebas */}
      {testResults && (
        <Paper elevation={3} sx={{ mt: 2, p: 3 }}>

          {/* Resumen de las pruebas */}
          {renderSummary()}

          <Timeline
            sx={{
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.2,
              },
            }}
          >
            {/* Prueba 1: Comprobación de Conexión SFTP */}
            <TimelineItem sx={{ mb: 2 }}>
              <TimelineOppositeContent color="text.secondary">
                Prueba 1: Conexión SFTP
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  {testResults.connection_status === "Connection successful" ? <CheckCircleIcon /> : <ErrorIcon />}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 4 }}>
                <Typography variant="h6" component="span" sx={{ color: testResults.connection_status === "Connection successful" ? 'green' : 'red' }}>
                  {testResults.connection_status}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>URL:</strong> {sftp_url}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Usuario:</strong> {sftp_user}
                </Typography>
              </TimelineContent>
            </TimelineItem>

            {/* Prueba 2: Comprobación de Rutas de Carpetas */}
            <TimelineItem sx={{ mb: 2 }}>
              <TimelineOppositeContent color="text.secondary">
                Prueba 2: Comprobación de Carpetas
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color="primary">
                  <CheckCircleIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 4 }}>
                <Grid container spacing={0}>
                  {Object.entries(testResults.folder_statuses || {}).map(([folder, status]) => (
                    <Tooltip 
                      key={folder} 
                      title={status === "exists" ? "La carpeta existe" : "La carpeta no existe"}
                    >
                      <Chip 
                        label={folder} 
                        color={status === "exists" ? "primary" : "error"} 
                        sx={{ mr: 1, mb: 1 }} 
                        icon={status === "exists" ? <CheckCircleIcon /> : <ErrorIcon />}
                        variant="outlined"
                      />
                    </Tooltip>
                  ))}
                </Grid>
              </TimelineContent>
            </TimelineItem>

            {/* Prueba 3: Búsqueda de Archivos */}
            <TimelineItem>
              <TimelineOppositeContent color="text.secondary">
                Prueba 3: Búsqueda de Archivos
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={Object.entries(testResults?.search_results || {}).some(([folder, files]) => Array.isArray(files) && files.length > 0) ? "primary" : "error"}>
                  {Object.entries(testResults?.search_results || {}).some(([folder, files]) => Array.isArray(files) && files.length > 0) ? <CheckCircleIcon /> : <ErrorIcon />}
                </TimelineDot>
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 4 }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Patrones de Nombre de Archivo:</strong> {file_name_patterns || 'N/A'}
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(testResults.search_results || {}).filter(([folder, files]) => Array.isArray(files) && files.length > 0).map(([folder, files]) => (
                    renderFolderResults(folder, files)
                  ))}
                  {renderNoMatchFolders()}
                </Grid>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </Paper>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TechnicalTestsButton;
