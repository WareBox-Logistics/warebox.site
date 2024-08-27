import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WEB_SERVICES_EDI_CONFIGS } from '/src/graphql/queries';
import { Card, CardContent, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, Dialog, Snackbar, Alert, Tooltip } from '@mui/material';
import RegisterEDIConfig from './RegisterEDIConfig';
import UpdateEDIConfig from './UpdateEDIConfig';
import ViewEDIConfigDetails from './ViewEDIConfigDetails';

const WebServicesEDIConfigTable = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalRows, setTotalRows] = useState(0); 
  const [ediConfigs, setEdiConfigs] = useState([]);
  const [openDetails, setOpenDetails] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const [openRegister, setOpenRegister] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);  
  const [selectedConfigId, setSelectedConfigId] = useState(null); 

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const { data, loading, error, refetch } = useQuery(GET_WEB_SERVICES_EDI_CONFIGS, {
    variables: { limit: rowsPerPage, offset: page * rowsPerPage },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setEdiConfigs(data.web_services_edi_config);
      setTotalRows(data.web_services_edi_config_aggregate.aggregate.count); 
    },
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching EDI configs:', error);
      alert('Failed to fetch EDI configurations');
    }
  }, [error]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch({
      limit: rowsPerPage,
      offset: newPage * rowsPerPage,
    });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    refetch({
      limit: newRowsPerPage,
      offset: 0,
    });
  };

  const handleOpenRegister = () => {
    setOpenRegister(true);
  };

  const handleCloseRegister = () => {
    setOpenRegister(false);
  };

  const handleSaveConfig = () => {
    refetch(); 
  };

  const handleOpenDetails = (config) => {
    setSelectedConfig(config);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedConfig(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleOpenEdit = (id) => {
    setSelectedConfigId(id);
    setOpenEdit(false);
    setTimeout(() => setOpenEdit(true), 0);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedConfigId(null);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  return (
    <Card sx={{ height: '100%', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" component="h2">
            Configuración de Servicios EDI
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenRegister}>
            Agregar Configuración
          </Button>
        </Box>
        <Box sx={{ height: 300, overflowY: 'auto', mt: 1 }}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>SFTP URL</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell>Status de DO</TableCell>
                  <TableCell>Content Status</TableCell>
                  <TableCell>Load Type</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ediConfigs.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <Tooltip title="Copiado!" open={copiedId === config.id} arrow>
                        <Button size="small" onClick={() => handleCopyId(config.id)}>
                          {config.id.substring(0, 8)}
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{config.customer.name}</TableCell>
                    <TableCell>{config.sftp_url}</TableCell>
                    <TableCell>{config.unit_type?.shortname || 'N/A'}</TableCell>
                    <TableCell>{config.do_status?.name || 'N/A'}</TableCell>
                    <TableCell>{config.content_status?.name || 'N/A'}</TableCell>
                    <TableCell>{config.load_type?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleOpenDetails(config)}>
                        Ver Detalles
                      </Button>
                      <Button size="small" color="primary" onClick={() => handleOpenEdit(config.id)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={totalRows} 
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        
        <RegisterEDIConfig 
          open={openRegister} 
          onClose={handleCloseRegister} 
          onSave={handleSaveConfig}  
          setSnackbarMessage={setSnackbarMessage} 
          setSnackbarSeverity={setSnackbarSeverity} 
          setSnackbarOpen={setSnackbarOpen}
        />

        {selectedConfigId && (
          <UpdateEDIConfig
            open={openEdit}
            onClose={handleCloseEdit}
            onUpdate={handleSaveConfig}
            configId={selectedConfigId}
            setSnackbarMessage={setSnackbarMessage}
            setSnackbarSeverity={setSnackbarSeverity}
            setSnackbarOpen={setSnackbarOpen}
          />
        )}

        {selectedConfig && (
          <ViewEDIConfigDetails
            open={openDetails}
            onClose={handleCloseDetails}
            configData={selectedConfig}
          />
        )}
      </CardContent>

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
    </Card>
  );
};

export default WebServicesEDIConfigTable;
