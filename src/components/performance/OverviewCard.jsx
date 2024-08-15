import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTIFICATION_HISTORY } from '/src/graphql/subscriptions';
import { GET_USERS } from '/src/graphql/queries';
import { Card, CardContent, Typography, Box, Grid, CircularProgress } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';

const OverviewCard = () => {
  const { data: notificationData, loading: notificationLoading, error: notificationError } = useQuery(GET_ALL_NOTIFICATION_HISTORY, {
    variables: { limit: 1000, offset: 0 },
  });
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_USERS);

  if (notificationLoading || userLoading) return <CircularProgress />;
  if (notificationError || userError) return <Typography color="error">Error :(</Typography>;

  const totalEvents = notificationData.web_services_notification_history_aggregate.aggregate.count;
  const successEvents = notificationData.web_services_notification_history.filter(event => !event.error_message).length;
  const failureEvents = notificationData.web_services_notification_history.filter(event => event.error_message).length;
  const registeredUsers = userData.web_services_users.length;
  const totalClients = new Set(userData.web_services_users.map(user => user.customer_id)).size;
  const onlineUsers = userData.web_services_users.filter(user => user.is_online).length;
  const offlineUsers = registeredUsers - onlineUsers;

  return (
    <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Información General
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <EventNoteIcon color="primary" fontSize="small" />
              <Box ml={1}>
                <Typography variant="subtitle2">Total de Eventos</Typography>
                <Typography variant="h6">{totalEvents}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <CheckCircleIcon color="primary" fontSize="small" />
              <Box ml={1}>
                <Typography variant="subtitle2">Eventos con Éxitos</Typography>
                <Typography variant="h6">{successEvents}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <ErrorIcon color="error" fontSize="small" />
              <Box ml={1}>
                <Typography variant="subtitle2">Eventos con Fallas</Typography>
                <Typography variant="h6">{failureEvents}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <PersonIcon color="primary" fontSize="small" />
              <Box ml={1}>
                <Typography variant="subtitle2">Total de Usuarios Registrados</Typography>
                <Typography variant="h6">{registeredUsers}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <BusinessIcon color="primary" fontSize="small" />
              <Box ml={1}>
                <Typography variant="subtitle2">Total de Clientes</Typography>
                <Typography variant="h6">{totalClients}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" alignItems="center">
              <PeopleIcon color="primary" fontSize="small" />
              <Box ml={1}>
                <Typography variant="subtitle2">Estado de Usuarios</Typography>
                <Typography variant="h6">En Línea: {onlineUsers}</Typography>
                <Typography variant="h6">Desconectados: {offlineUsers}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
