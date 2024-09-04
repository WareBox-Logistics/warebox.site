import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Grid, Chip, Divider, Accordion, AccordionSummary, AccordionDetails, Tooltip, Snackbar, Alert } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TestSFTPConnection from './TestSFTPConnection';

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

  // State for Snackbar notifications
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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

              <Box mt={2}>
                <TestSFTPConnection
                  sftp_url={sftp_url}
                  sftp_user={sftp_user}
                  sftp_password={sftp_password}
                  sftp_folders={[sftp_folder_get, sftp_folder_send, sftp_folder_send_history, sftp_folder_get_history]} // Pasar carpetas a verificar
                  setSnackbarMessage={setSnackbarMessage}
                  setSnackbarSeverity={setSnackbarSeverity}
                  setSnackbarOpen={setSnackbarOpen}
                />
              </Box>
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

            <Divider style={{ width: '100%', margin: '20px 0' }} textAlign="center">Templates EDI</Divider>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ color: 'primary.main' }}>File Name Patterns</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {file_name_patterns || 'N/A'}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

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
