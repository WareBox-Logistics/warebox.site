import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Grid, Chip, Divider, Tooltip, Snackbar, Alert, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TechnicalTestsButton from './TechnicalTestsButton';

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ViewEDIConfigDetails = ({ open, onClose, configData }) => {
  if (!configData) return null;

  const {
    customer,
    sftp_url,
    sftp_user,
    sftp_password,
    sftp_folder_get,
    sftp_folder_send,
    sftp_folder_send_history,
    sftp_folder_get_history,
    unit_type,
    lb_id,
    hc_equipment_type_id,
    do_status,
    content_status,
    load_type,
    file_name_patterns,
    edi_990_accept,
    edi_214_plan_delivery,
    edi_214_plan_pickup
  } = configData;

  const [tabValue, setTabValue] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Mantenemos el estado de los resultados de las pruebas aquí
  const [testResults, setTestResults] = useState(null);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: 'primary.main', color: '#fff' }}>
        Detalles de Configuración EDI
      </DialogTitle>
      <DialogContent>
        <Box mt={2} mb={2}>
          <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
            {customer.name}
          </Typography>

          <Tabs value={tabValue} onChange={handleTabChange} aria-label="simple tabs example">
            <Tab label="Configuración EDI" />
            <Tab label="Pruebas Técnicas" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2} mt={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>Configuración SFTP</Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2"><strong>URL:</strong> {sftp_url}</Typography>
                  <Tooltip title="Copiar URL" arrow>
                    <ContentCopyIcon sx={{ ml: 1, cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(sftp_url)} />
                  </Tooltip>
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2"><strong>Usuario:</strong> {sftp_user}</Typography>
                  <Tooltip title="Copiar Usuario" arrow>
                    <ContentCopyIcon sx={{ ml: 1, cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(sftp_user)} />
                  </Tooltip>
                </Box>
                <Box display="flex" alignItems="center">
                  <Typography variant="body2"><strong>Contraseña:</strong> {sftp_password}</Typography>
                  <Tooltip title="Copiar Contraseña" arrow>
                    <ContentCopyIcon sx={{ ml: 1, cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(sftp_password)} />
                  </Tooltip>
                </Box>
                <Typography variant="body2"><strong>Folder Get:</strong> {sftp_folder_get}</Typography>
                <Typography variant="body2"><strong>Folder Send:</strong> {sftp_folder_send}</Typography>
                <Typography variant="body2"><strong>Send History:</strong> {sftp_folder_send_history}</Typography>
                <Typography variant="body2"><strong>Get History:</strong> {sftp_folder_get_history}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: 'primary.main' }}>Configuración DO</Typography>
                <Typography variant="body2"><strong>Unidad:</strong> {unit_type?.shortname || 'N/A'}</Typography>
                <Typography variant="body2"><strong>LB ID:</strong> {lb_id || 'N/A'}</Typography>
                <Typography variant="body2"><strong>HC Equipment Type ID:</strong> {hc_equipment_type_id || 'N/A'}</Typography>
                
                <Box mt={2}>
                  <Typography variant="h6" sx={{ color: 'primary.main' }}>Estados del DO</Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    <Chip label={`Status de DO: ${do_status?.name || 'N/A'}`} color="primary" />
                    <Chip label={`Content Status: ${content_status?.name || 'N/A'}`} color="secondary" />
                    <Chip label={`Load Type: ${load_type?.name || 'N/A'}`} color="default" />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={12}>
                <Typography variant="h6" sx={{ color: 'primary.main', mt: 3 }}>File Name Patterns</Typography>
                <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', flexGrow: 1 }}>
                    {file_name_patterns || 'N/A'}
                  </Typography>
                  <Tooltip title="Copiar Patrones de Nombre de Archivo">
                    <IconButton onClick={() => navigator.clipboard.writeText(file_name_patterns)}>
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>

              <Divider style={{ width: '100%', margin: '20px 0' }} textAlign="center">Templates EDI</Divider>

              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ color: 'primary.main' }}>EDI 990 Accept Template</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {edi_990_accept || 'N/A'}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ color: 'primary.main' }}>EDI 214 Plan Delivery Template</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {edi_214_plan_delivery || 'N/A'}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ color: 'primary.main' }}>EDI 214 Plan Pickup Template</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {edi_214_plan_pickup || 'N/A'}
                      </Typography>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <TechnicalTestsButton 
              sftp_url={sftp_url}
              sftp_user={sftp_user}
              sftp_password={sftp_password}
              sftp_folders={[sftp_folder_get, sftp_folder_send, sftp_folder_send_history, sftp_folder_get_history]}
              file_name_patterns={file_name_patterns}
              testResults={testResults}
              setTestResults={setTestResults} // Pasar la función para actualizar los resultados de las pruebas
            />
          </TabPanel>
        </Box>

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
      </DialogContent>
    </Dialog>
  );
};

export default ViewEDIConfigDetails;
