import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '/src/graphql/queries';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

const UsersOnline = () => {
  const { data, loading, error } = useQuery(GET_USERS);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  const onlineUsers = data.web_services_users.filter(user => user.is_online).length;

  return (
    <Card sx={{ minWidth: 275, borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <PeopleIcon color="primary" fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              Usuarios Online
            </Typography>
            <Typography variant="h4" component="p">
              {onlineUsers}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UsersOnline;
