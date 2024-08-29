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
  const [isLineBreaksEnabled, setIsLineBreaksEnabled] = useState(false);
  const [alreadyContainsLineBreaks, setAlreadyContainsLineBreaks] = useState(false);
  const [highlightedSegment, setHighlightedSegment] = useState(null);

  useEffect(() => {
    if (open) {
      setFileDetails(null);
      setSelectedFile(null);
      setEdiContent(null);
      setShowPreview(false);
      setAlreadyContainsLineBreaks(false);
      setIsLineBreaksEnabled(false); // Resetear el estado de saltos de línea
      setHighlightedSegment(null); // Resetear el segmento resaltado cuando se abre el modal
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
    setShowPreview(false);
    setHighlightedSegment(null);

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

        const containsLineBreaks = ediContent.includes('\n') || ediContent.includes('\r');
        setAlreadyContainsLineBreaks(containsLineBreaks);

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

  const handleDetailClick = (key, value) => {
    // Solo establecer el segmento resaltado si el valor es válido, no es null, ni "N/A"
    if (value && value !== 'N/A' && value !== null && value !== '') {
      setHighlightedSegment(value);
    } else {
      setHighlightedSegment(null);
    }
  };

  const handlePreviewClick = () => {
    setShowPreview((prev) => !prev);
  };

  const handleToggleLineBreaks = () => {
    setIsLineBreaksEnabled((prev) => !prev);
  };

  const getHighlightedEdiContent = () => {
    if (!ediContent) return '';

    // Formatear el contenido EDI según los saltos de línea seleccionados
    const formattedContent = isLineBreaksEnabled
      ? (alreadyContainsLineBreaks ? ediContent : ediContent.replace(/~/g, '~\n')) // Control de saltos de línea
      : ediContent.replace(/\n/g, '').replace(/\r/g, ''); // Quitar saltos de línea

    const segments = formattedContent.split('~');

    return segments.map((segment, index) => {
      // Resaltar solo si el segmento contiene el valor seleccionado y no es "N/A"
      const style = highlightedSegment && segment.includes(highlightedSegment) && highlightedSegment !== 'N/A'
        ? { backgroundColor: 'yellow' }
        : {};
      return (
        <span key={index} style={style}>
          {segment}~
        </span>
      );
    });
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
                {Object.entries(fileDetails).map(([key, value]) => (
                  <Typography 
                    key={key}
                    onClick={() => handleDetailClick(key, value)} // Ajuste para manejar el clic en el detalle
                    style={{ cursor: 'pointer', backgroundColor: highlightedSegment === value && value !== 'N/A' && value !== null ? 'yellow' : 'inherit' }}
                  >
                    <strong>{key.replace(/_/g, ' ').toUpperCase()}:</strong> {value !== null && value !== '' ? value : 'N/A'}
                  </Typography>
                ))}
                <Box mt={2}>
                  <Button onClick={handlePreviewClick} variant="contained" color="primary" fullWidth>
                    {showPreview ? 'Ocultar Vista Previa' : 'Vista Previa del Contenido EDI'}
                  </Button>
                  {showPreview && (
                    <Box mt={2} p={2} style={{ backgroundColor: '#f7f7f7', borderRadius: '4px', overflowX: 'auto' }}>
                      <Box position="sticky" top={0} bgcolor="#f7f7f7" zIndex={1} py={1}>
                        <Button onClick={handleToggleLineBreaks} variant="outlined" color="primary" fullWidth>
                          {isLineBreaksEnabled ? 'Quitar Saltos de Línea' : 'Poner Saltos de Línea'}
                        </Button>
                      </Box>
                      <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                        {getHighlightedEdiContent()}
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
