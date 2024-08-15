import React from 'react';
import { useSubscription } from '@apollo/client';
import { USER_STATUS_SUBSCRIPTION } from '/src/graphql/subscriptions';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

const UserStatus = () => {
  const { data, loading, error } = useSubscription(USER_STATUS_SUBSCRIPTION);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  const onlineUsers = data.web_services_users.filter(user => user.is_online).length;
  const offlineUsers = data.web_services_users.length - onlineUsers;

  return (
    <Card sx={{ minWidth: 275, borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <PeopleIcon color="primary" fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              Estado de Usuarios
            </Typography>
          </Box>
        </Box>
        <Box mt={2}>
          <Typography variant="h6">En Línea: {onlineUsers}</Typography>
          <Typography variant="h6">Desconectados: {offlineUsers}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UserStatus;
