import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_NOTIFICATION_HISTORY, SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER } from '/src/graphql/queries';
import {
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Collapse,
  Box,
  Stack,
  TextField,
  Button,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

const NotificationHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const highlightedId = searchParams.get('id');
  const customer_id = localStorage.getItem('customer_id');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRows, setExpandedRows] = useState({});
  const [isRefetching, setIsRefetching] = useState(false);
  const [filters, setFilters] = useState({
    route: '',
    error_message: '',
    id: isValidUUID(highlightedId) ? highlightedId : '',
    event_id: '',
  });
  const [notificationHistory, setNotificationHistory] = useState([]);

  const validFilters = {};
  if (filters.route) validFilters.route = `%${filters.route}%`;
  if (filters.error_message) validFilters.error_message = `%${filters.error_message}%`;
  if (filters.id && isValidUUID(filters.id)) validFilters.id = filters.id;
  if (filters.event_id && isValidUUID(filters.event_id)) validFilters.event_id = filters.event_id;

  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATION_HISTORY, {
    variables: {
      customer_id,
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      ...validFilters,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setNotificationHistory(data?.web_services_notification_history || []);
    },
  });

  const { data: subscriptionData, error: subscriptionError } = useSubscription(SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER, {
    variables: { customer_id },
  });

  useEffect(() => {
    if (error) {
      console.error('Error fetching notification history:', error);
      alert('Failed to fetch notification history');
    }
  }, [error]);

  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
    }
  }, [subscriptionError]);

  useEffect(() => {
    if (subscriptionData) {
      const filteredData = subscriptionData.web_services_notification_history.filter(item => {
        let matchesFilters = true;
        if (filters.route) {
          matchesFilters = matchesFilters && item.route.includes(filters.route);
        }
        if (filters.error_message) {
          matchesFilters = matchesFilters && item.error_message && item.error_message.includes(filters.error_message);
        }
        if (filters.id) {
          matchesFilters = matchesFilters && item.id === filters.id;
        }
        if (filters.event_id) {
          matchesFilters = matchesFilters && item.event_id === filters.event_id;
        }
        return matchesFilters;
      });
      setNotificationHistory(filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage));
    }
  }, [subscriptionData, rowsPerPage, page, filters]);

  useEffect(() => {
    if (highlightedId && isValidUUID(highlightedId)) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        id: highlightedId,
      }));
      refetch({
        customer_id,
        limit: rowsPerPage,
        offset: 0,
        id: highlightedId,
      }).then(() => {
        setPage(0);
      });
    }
  }, [highlightedId, refetch, customer_id, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setIsRefetching(true);
    setPage(newPage);
    refetch({
      customer_id,
      limit: rowsPerPage,
      offset: newPage * rowsPerPage,
      ...validFilters,
    }).finally(() => setIsRefetching(false));
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setIsRefetching(true);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    refetch({
      customer_id,
      limit: newRowsPerPage,
      offset: 0,
      ...validFilters,
    }).finally(() => setIsRefetching(false));
  };

  const handleExpandClick = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setIsRefetching(true);
    const validFilters = {};
    if (filters.route) validFilters.route = `%${filters.route}%`;
    if (filters.error_message) validFilters.error_message = `%${filters.error_message}%`;
    if (filters.id && isValidUUID(filters.id)) validFilters.id = filters.id;
    if (filters.event_id && isValidUUID(filters.event_id)) validFilters.event_id = filters.event_id;
    refetch({
      customer_id,
      limit: rowsPerPage,
      offset: 0,
      ...validFilters,
    }).finally(() => {
      setPage(0);
      setIsRefetching(false);
    });
  };

  useEffect(() => {
    if (!highlightedId && (filters.id || filters.event_id)) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        id: '',
        event_id: '',
      }));
    }
  }, [location.search]);

  const handleViewAll = () => {
    setFilters({
      route: '',
      error_message: '',
      id: '',
      event_id: '',
    });
    navigate('/history');
    refetch({
      customer_id,
      limit: rowsPerPage,
      offset: 0,
    });
  };

  const totalCount = data?.web_services_notification_history_aggregate?.aggregate?.count || 0;

  return (
    <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
      <Typography variant="h4" gutterBottom>
        Notification History
      </Typography>
      <Stack direction="row" spacing={2} sx={{ marginBottom: 2 }}>
        <TextField label="ID" name="id" value={filters.id} onChange={handleFilterChange} />
        <TextField label="Event ID" name="event_id" value={filters.event_id} onChange={handleFilterChange} />
        <TextField label="Route" name="route" value={filters.route} onChange={handleFilterChange} />
        <TextField label="Error Message" name="error_message" value={filters.error_message} onChange={handleFilterChange} />
        <Button variant="contained" onClick={applyFilters}>Apply Filters</Button>
      </Stack>
      {(loading || isRefetching) && (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
          <CircularProgress />
        </Stack>
      )}
      {!loading && !isRefetching && (
        <>
          <TableContainer component={Paper} sx={{ marginTop: '16px' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Event ID</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Notified At</TableCell>
                  <TableCell>Error Message</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notificationHistory.map((history) => (
                  <React.Fragment key={history.id}>
                    <TableRow selected={history.id === highlightedId}>
                      <TableCell>{history.id}</TableCell>
                      <TableCell>{history.event_id}</TableCell>
                      <TableCell>{history.route}</TableCell>
                      <TableCell>{new Date(history.notified_at).toLocaleString()}</TableCell>
                      <TableCell>{history.error_message}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleExpandClick(history.id)}>
                          {expandedRows[history.id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={6} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                        <Collapse in={expandedRows[history.id]} timeout="auto" unmountOnExit>
                          <Box margin={1}>
                            <Typography variant="subtitle1">Response Body:</Typography>
                            <pre>{JSON.stringify(history.response_body, null, 2)}</pre>
                            <Typography variant="subtitle1">Request Body:</Typography>
                            <pre>{JSON.stringify(history.request_body, null, 2)}</pre>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      <Button variant="contained" onClick={handleViewAll} sx={{ mt: 2 }}>View All</Button>
    </Paper>
  );
};

export default NotificationHistory;
