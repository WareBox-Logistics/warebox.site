import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_ALL_NOTIFICATION_HISTORY, SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER } from '/src/graphql/queries';
import { Card, CardContent, Typography, Box, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, Dialog, DialogTitle, DialogContent, DialogContentText, Tooltip } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import moment from 'moment';

const NotificationHistoryTable = ({ customerId }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState('');
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [totalAggregateCount, setTotalAggregateCount] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  const { data: initialData, loading: initialLoading, error: initialError, refetch } = useQuery(GET_ALL_NOTIFICATION_HISTORY, {
    variables: { limit: rowsPerPage, offset: page * rowsPerPage },
    notifyOnNetworkStatusChange: true,
    onCompleted: (initialData) => {
      setNotificationHistory(initialData.web_services_notification_history);
      setTotalAggregateCount(initialData.web_services_notification_history_aggregate.aggregate.count);
    },
  });

  const { data: subscriptionData, error: subscriptionError } = useSubscription(SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER, {
    variables: customerId ? { customer_id: customerId } : {},
  });

  useEffect(() => {
    if (subscriptionData) {
      setNotificationHistory((prevData) => {
        const newData = subscriptionData.web_services_notification_history;
        const updatedData = [...newData, ...prevData].filter((value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
        );
        return updatedData.slice(0, rowsPerPage); // Ensure only rowsPerPage are displayed initially
      });
    }
  }, [subscriptionData, rowsPerPage]);

  useEffect(() => {
    if (initialError) {
      console.error('Error fetching notification history:', initialError);
      alert('Failed to fetch notification history');
    }
  }, [initialError]);

  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
    }
  }, [subscriptionError]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    refetch({
      limit: rowsPerPage,
      offset: newPage * rowsPerPage,
    }).then(({ data }) => {
      setNotificationHistory(data.web_services_notification_history);
      setTotalAggregateCount(data.web_services_notification_history_aggregate.aggregate.count);
    });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    refetch({
      limit: newRowsPerPage,
      offset: 0,
    }).then(({ data }) => {
      setNotificationHistory(data.web_services_notification_history);
      setTotalAggregateCount(data.web_services_notification_history_aggregate.aggregate.count);
    });
  };

  const handleClickOpen = (title, content) => {
    setDialogTitle(title);
    setDialogContent(content);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1000);
    });
  };

  if (initialLoading) return <CircularProgress />;
  if (initialError) return <Typography color="error">Error :(</Typography>;

  return (
    <Card sx={{ height: '100%', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <EventIcon color="primary" fontSize="medium" />
          <Box ml={1}>
            <Typography variant="h6" component="h2">
              Actividades Recientes
            </Typography>
          </Box>
        </Box>
        <Box sx={{ height: 300, overflowY: 'auto', mt: 1 }}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Ruta</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Work Order</TableCell>
                  <TableCell>Driver Moves</TableCell>
                  <TableCell>Detalles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notificationHistory.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Tooltip title="Copiado!" open={copiedId === event.id} arrow>
                        <Button size="small" onClick={() => handleCopyId(event.id)}>
                          {event.id.substring(0, 8)}
                        </Button>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{event.route}</TableCell>
                    <TableCell>{moment(event.notified_at).format('DD/MM/YYYY HH:mm:ss')}</TableCell>
                    <TableCell>
                      {event.error_message ? (
                        <Typography color="error" variant="body2">Error</Typography>
                      ) : (
                        <Typography color="primary" variant="body2">Éxito</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontSize="small">
                        {event.customer ? `${event.customer.name} (${event.customer.company_type_code_name})` : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleClickOpen(
                        'Work Order Details',
                        `Customer Reference: ${event.work_order?.customer_reference || 'N/A'}
                        \nContainer: ${event.work_order?.container || 'N/A'}
                        \nFrom Zone: ${event.work_order?.from_zone?.zone_name || 'N/A'}
                        \nTo Zone: ${event.work_order?.to_zone?.zone_name || 'N/A'}
                        \nOrder Type: ${event.work_order?.order_type?.name || 'N/A'}
                        \nLoad Type: ${event.work_order?.load_type?.name || 'N/A'}
                        \nFolio: ${event.work_order?.folio?.prefix}-${event.work_order?.folio?.folio}`
                      )}>
                        {event.work_order ? `${event.work_order.folio.prefix}-${event.work_order.folio.folio}` : 'N/A'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {event.driver_move ? (
                        <Button size="small" onClick={() => handleClickOpen(
                          'Driver Move Details',
                          `From Zone: ${event.driver_move?.from_zone?.zone_name || 'N/A'}
                          \nTo Zone: ${event.driver_move?.to_zone?.zone_name || 'N/A'}
                          \nLoad Type: ${event.driver_move?.load_type?.name || 'N/A'}
                          \nFolio: ${event.driver_move?.folio?.prefix}-${event.driver_move?.folio?.folio}`
                        )}>
                          {event.driver_move ? `${event.driver_move.folio.prefix}-${event.driver_move.folio.folio}` : 'N/A'}
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleClickOpen('Response Body', JSON.stringify(event.response_body, null, 2))}>Response</Button>
                      <Button size="small" onClick={() => handleClickOpen('Request Body', JSON.stringify(event.request_body, null, 2))}>Request</Button>
                      {event.error_message && (
                        <Button size="small" color="error" onClick={() => handleClickOpen('Error Message', event.error_message)}>Error</Button>
                      )}
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
          count={totalAggregateCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <pre>{dialogContent}</pre>
            </DialogContentText>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default NotificationHistoryTable;
