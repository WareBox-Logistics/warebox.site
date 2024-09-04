import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box, Typography, Card, CardActionArea, CardContent, Tooltip, TextField, IconButton } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import GetAppIcon from '@mui/icons-material/GetApp';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    if (open) {
      setFileDetails(null);
      setSelectedFile(null);
      setEdiContent(null);
      setShowPreview(false);
      setAlreadyContainsLineBreaks(false);
      setIsLineBreaksEnabled(false);
      setHighlightedSegment(null);
      setDownloadingFile(null);
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
        const fetchedFiles = response.data.files || [];
        const sortedFiles = fetchedFiles.sort((a, b) => b.mtime - a.mtime);
        setFiles(sortedFiles);
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

    const formattedContent = isLineBreaksEnabled
      ? (alreadyContainsLineBreaks ? ediContent : ediContent.replace(/~/g, '~\n'))
      : ediContent.replace(/\n/g, '').replace(/\r/g, '');

    const segments = formattedContent.split('~');

    return segments.map((segment, index) => {
      const style = highlightedSegment && segment.includes(highlightedSegment) && highlightedSegment !== 'N/A'
        ? { backgroundColor: 'yellow', fontWeight: 'bold' }
        : {};
      return (
        <span key={index} style={style}>
          {segment}~
        </span>
      );
    });
  };

  const copyToClipboard = (filename, event) => {
    event.stopPropagation();  // Evita la selección del archivo
    navigator.clipboard.writeText(filename).then(() => {
      console.log('Nombre del archivo copiado al portapapeles:', filename);
    }).catch(err => {
      console.error('Error al copiar el nombre del archivo:', err);
    });
  };

  const downloadFile = (filename, event) => {
    event.stopPropagation();  // Evita la selección del archivo
    setDownloadingFile(filename);  // Indica que este archivo se está descargando

    axios.post(import.meta.env.VITE_SFTP_GET_EDI_CONTENT, {
      sftp_url: sftpUrl,
      sftp_user: sftpUser,
      sftp_password: sftpPassword,
      sftp_file_path: `${sftpFolderSend}/${filename}`,
    }, {
      responseType: 'json'
    }).then(response => {
      const ediContent = response.data.edi_content;
      const blob = new Blob([ediContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }).catch(err => {
      console.error('Error al descargar el archivo:', err);
    }).finally(() => {
      setDownloadingFile(null);
    });
  };



  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ style: { minHeight: '80vh' } }}>
      <DialogTitle>Últimos 10 Archivos en SFTP Folder Send</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="row" gap={4}>
          <Box flex={1} style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <Typography variant="h6">Archivos Disponibles</Typography>
            {!loading && files.length > 0 && (
              <Box style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1, paddingBottom: '8px' }}>
                <TextField
                  fullWidth
                  placeholder="Buscar archivos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  margin="normal"
                />
              </Box>
            )}
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error">{error}</Typography>
            ) : filteredFiles.length > 0 ? (
              <Box display="flex" flexDirection="column" gap={2}>
                {filteredFiles.map((file, index) => (
                  <Card 
                    key={index} 
                    variant="outlined" 
                    onClick={() => handleFileClick(file.filename)} 
                    style={{ 
                      backgroundColor: file.filename === selectedFile ? '#f0f0f0' : 'inherit',
                      border: file.filename === selectedFile ? '2px solid #3f51b5' : '1px solid #ccc',
                      color: file.filename === selectedFile ? '#3f51b5' : 'inherit',
                      position: 'relative'
                    }}
                  >
                    <CardActionArea disabled={downloadingFile === file.filename}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Tooltip title="Clic para ver detalles">
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {file.filename}
                              </Typography>
                            </Tooltip>
                            <Typography variant="body2" color="textSecondary">
                              {new Date(file.mtime * 1000).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Tooltip title="Copiar nombre de archivo">
                              <IconButton onClick={(event) => copyToClipboard(file.filename, event)} disabled={downloadingFile === file.filename}>
                                <FileCopyIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Descargar archivo">
                              <IconButton onClick={(event) => downloadFile(file.filename, event)} disabled={downloadingFile === file.filename}>
                                <GetAppIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        {downloadingFile === file.filename && (
                          <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center" justifyContent="center" bgcolor="rgba(255, 255, 255, 0.8)">
                            <CircularProgress />
                          </Box>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography>No se encontraron archivos.</Typography>
            )}
          </Box>
          <Box flex={1} style={{ maxHeight: '600px', overflowY: 'auto' }}>
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
                    onClick={() => handleDetailClick(key, value)}
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
