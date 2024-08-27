import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import axios from 'axios';

const CheckFilesModal = ({ open, onClose, sftpFolderSend, sftpUrl, sftpUser, sftpPassword }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [ediContent, setEdiContent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open) {
      setFileDetails(null);
      setSelectedFile(null);
      setEdiContent(null);
      setShowPreview(false);
      fetchFiles();
    }
  }, [open]);

  const fetchFiles = async () => {
    if (sftpFolderSend && sftpUrl && sftpUser && sftpPassword) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post(import.meta.env.VITE_SFTP_CHECK_FILES, {
          sftp_url: sftpUrl,
          sftp_user: sftpUser,
          sftp_password: sftpPassword,
          sftp_folder_send: sftpFolderSend,
        });
        setFiles(response.data.files || []);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Error fetching files. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileClick = async (filename) => {
    setSelectedFile(filename);
    setLoadingDetails(true);
    setShowPreview(false); // Reset the preview state

    try {
      const contentResponse = await axios.post(import.meta.env.VITE_SFTP_GET_EDI_CONTENT, {
        sftp_url: sftpUrl,
        sftp_user: sftpUser,
        sftp_password: sftpPassword,
        sftp_file_path: `${sftpFolderSend}/${filename}`
      });

      if (contentResponse.data.success) {
        const ediContent = contentResponse.data.edi_content;
        setEdiContent(ediContent);

        const parseResponse = await axios.post(import.meta.env.VITE_SFTP_PARSE_EDI, {
          edi_content: ediContent
        });

        if (parseResponse.data.success) {
          setFileDetails(parseResponse.data.data);
        } else {
          console.error('Error al interpretar el EDI:', parseResponse.data.message);
        }
      } else {
        console.error('Error al obtener el contenido del EDI:', contentResponse.data.message);
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePreviewClick = () => {
    setShowPreview((prev) => !prev);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Últimos 10 Archivos en SFTP Folder Send</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="row" gap={4}>
          <Box flex={1}>
            <Typography variant="h6">Archivos Disponibles</Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : files.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={2}>
                {files.map((file, index) => (
                  <Card 
                    key={index} 
                    variant="outlined" 
                    onClick={() => handleFileClick(file.filename)} 
                    style={{ backgroundColor: file.filename === selectedFile ? '#f0f0f0' : 'inherit' }}
                  >
                    <CardActionArea>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          {file.filename}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {new Date(file.mtime * 1000).toLocaleString()}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography>No se encontraron archivos.</Typography>
            )}
          </Box>
          <Box flex={1}>
            {loadingDetails ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
                <CircularProgress />
              </Box>
            ) : fileDetails ? (
              <Box>
                <Typography variant="h6">Detalles del EDI 204</Typography>
                <Typography><strong>WO:</strong> {fileDetails.work_order_number || 'N/A'}</Typography>
                <Typography><strong>Order Number:</strong> {fileDetails.order_number || 'N/A'}</Typography>
                <Typography><strong>Container Number:</strong> {fileDetails.container_number || 'N/A'}</Typography>
                <Typography><strong>Origin:</strong> {fileDetails.origin || 'N/A'}</Typography>
                <Typography><strong>Destination:</strong> {fileDetails.destination || 'N/A'}</Typography>
                <Typography><strong>Ship Date:</strong> {fileDetails.ship_date || 'N/A'}</Typography>
                <Typography><strong>Estimated Delivery:</strong> {fileDetails.estimated_delivery || 'N/A'}</Typography>
                <Typography><strong>Tracking Number:</strong> {fileDetails.tracking_number || 'N/A'}</Typography>
                <Typography><strong>Shipment Status:</strong> {fileDetails.shipment_status || 'N/A'}</Typography>
                <Typography><strong>Carrier:</strong> {fileDetails.carrier_name || 'N/A'}</Typography>
                <Typography><strong>Sender ID:</strong> {fileDetails.sender_id || 'N/A'}</Typography>
                <Typography><strong>Receiver ID:</strong> {fileDetails.receiver_id || 'N/A'}</Typography>
                <Typography><strong>Consignee Address:</strong> {fileDetails.consignee_address || 'N/A'}</Typography>
                <Box mt={2}>
                  <Button onClick={handlePreviewClick} variant="contained" color="primary" fullWidth>
                    {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa del Contenido EDI'}
                  </Button>
                  {showPreview && (
                    <Box mt={2} p={2} style={{ backgroundColor: '#f7f7f7', borderRadius: '4px', overflowX: 'auto' }}>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                        {ediContent}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography>Selecciona un archivo para ver los detalles.</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CheckFilesModal;
