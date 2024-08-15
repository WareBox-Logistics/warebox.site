import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '/src/graphql/queries';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';

const TotalClients = () => {
  const { data, loading, error } = useQuery(GET_USERS);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  const totalClients = new Set(data.web_services_users.map(user => user.customer_id)).size;

  return (
    <Card sx={{ minWidth: 275, borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <BusinessIcon color="primary" fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              Total de Clientes
            </Typography>
            <Typography variant="h4" component="p">
              {totalClients}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalClients;
