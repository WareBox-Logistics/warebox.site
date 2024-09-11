import React, { useState } from 'react';
import { Button, CircularProgress, Box, Typography, Card, CardContent, Chip, Divider, Grid, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

const SearchFilesButton = ({ sftp_url, sftp_user, sftp_password, sftp_folders, file_name_patterns }) => {
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearchFiles = async () => {
    setSearching(true);
    try {
      const response = await axios.post(import.meta.env.VITE_SFTP_SEARCH_FILES, {
        sftp_url,
        sftp_user,
        sftp_password,
        folders: sftp_folders,
        file_name_patterns,
      });

      if (response.data.success) {
        setSearchResults(response.data.matches);
      } else {
        setSearchResults({ error: response.data.message });
      }
    } catch (error) {
      setSearchResults({ error: error.message });
    } finally {
      setSearching(false);
    }
  };

  const renderFolderResults = (folder, files) => {
    return (
      <Grid item xs={12} key={folder}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Carpeta: {folder}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {Array.isArray(files) && files.length > 0 ? (
              <Box display="flex" flexWrap="wrap" gap={1}>
                {files.map((file, index) => (
                  <Box key={index} display="flex" alignItems="center" gap={1}>
                    <Chip label={file} color="primary" variant="outlined" />
                    <Tooltip title="Copiar nombre del archivo">
                      <IconButton onClick={() => navigator.clipboard.writeText(file)} size="small">
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography color="error">
                No se encontraron archivos
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const renderNoMatchFolders = () => {
    const noMatchFolders = Object.entries(searchResults).filter(([folder, files]) => !(Array.isArray(files) && files.length > 0));

    return noMatchFolders.length > 0 ? (
      <Grid item xs={12}>
        <Typography variant="subtitle1" color="error" gutterBottom>
          Carpetas sin coincidencias:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {noMatchFolders.map(([folder]) => (
            <Chip key={folder} label={folder} color="error" sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
      </Grid>
    ) : null;
  };

  return (
    <Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleSearchFiles} 
        disabled={searching}
        startIcon={searching ? <CircularProgress size={16} color="inherit" /> : null}
      >
        {searching ? "Buscando..." : "Buscar Archivos"}
      </Button>

      {/* Mostrar resultados de búsqueda de archivos */}
      {searchResults && (
        <Box mt={2}>
          <Grid container spacing={2}>
            {Object.entries(searchResults).filter(([folder, files]) => Array.isArray(files) && files.length > 0).map(([folder, files]) => (
              renderFolderResults(folder, files)
            ))}
            
            {/* Mostrar carpetas sin coincidencias */}
            {renderNoMatchFolders()}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default SearchFilesButton;
