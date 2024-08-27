import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Box, Grid, Chip, Divider } from '@mui/material';

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#3f51b5', color: '#fff' }}>
        Detalles de Configuración EDI
      </DialogTitle>
      <DialogContent>
        <Box mt={2} mb={2}>
          <Typography variant="h5" sx={{ color: '#3f51b5', fontWeight: 'bold' }}>
            {customer.name}
          </Typography>

          <Grid container spacing={2} mt={2}>
            {/* Configuración SFTP */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#3f51b5' }}>Configuración SFTP</Typography>
              <Typography variant="body2"><strong>URL:</strong> {sftp_url}</Typography>
              <Typography variant="body2"><strong>Usuario:</strong> {sftp_user}</Typography>
              <Typography variant="body2"><strong>Contraseña:</strong> {sftp_password}</Typography>
              <Typography variant="body2"><strong>Folder Get:</strong> {sftp_folder_get}</Typography>
              <Typography variant="body2"><strong>Folder Send:</strong> {sftp_folder_send}</Typography>
              <Typography variant="body2"><strong>Send History:</strong> {sftp_folder_send_history}</Typography>
              <Typography variant="body2"><strong>Get History:</strong> {sftp_folder_get_history}</Typography>
            </Grid>

            {/* Configuración DO */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ color: '#3f51b5' }}>Configuración DO</Typography>
              <Typography variant="body2"><strong>Unidad:</strong> {unit_type?.shortname || 'N/A'}</Typography>
              <Typography variant="body2"><strong>LB ID:</strong> {lb_id || 'N/A'}</Typography>
              <Typography variant="body2"><strong>HC Equipment Type ID:</strong> {hc_equipment_type_id || 'N/A'}</Typography>
              
              <Box mt={2}>
                <Typography variant="h6" sx={{ color: '#3f51b5' }}>Estados del DO</Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  <Chip label={`Status de DO: ${do_status?.name || 'N/A'}`} color="primary" />
                  <Chip label={`Content Status: ${content_status?.name || 'N/A'}`} color="secondary" />
                  <Chip label={`Load Type: ${load_type?.name || 'N/A'}`} color="default" />
                </Box>
              </Box>
            </Grid>

            <Divider style={{ width: '100%', margin: '20px 0' }} />

            {/* Configuración Templates EDI */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: '#3f51b5' }}>Configuración Templates EDI</Typography>
              <Typography variant="body2"><strong>File Name Patterns:</strong></Typography>
              <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {file_name_patterns || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 2 }}><strong>EDI 990 Accept Template:</strong></Typography>
              <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {edi_990_accept || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 2 }}><strong>EDI 214 Plan Delivery Template:</strong></Typography>
              <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {edi_214_plan_delivery || 'N/A'}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mt: 2 }}><strong>EDI 214 Plan Pickup Template:</strong></Typography>
              <Box p={2} sx={{ backgroundColor: '#f4f6f8', borderRadius: '8px', mt: 1 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {edi_214_plan_pickup || 'N/A'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ViewEDIConfigDetails;
