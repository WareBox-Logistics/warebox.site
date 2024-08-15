import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTIFICATION_HISTORY } from '/src/graphql/queries';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const EventSuccessFailures = () => {
  const { data, loading, error } = useQuery(GET_ALL_NOTIFICATION_HISTORY, {
    variables: { limit: 1000, offset: 0 },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  const successEvents = data.web_services_notification_history.filter(event => !event.error_message).length;
  const failureEvents = data.web_services_notification_history.filter(event => event.error_message).length;

  return (
    <Card sx={{ minWidth: 275, borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <CheckCircleIcon color="primary" fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              Eventos con Éxitos
            </Typography>
            <Typography variant="h4" component="p">
              {successEvents}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" mt={2}>
          <ErrorIcon color="error" fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              Eventos con Fallas
            </Typography>
            <Typography variant="h4" component="p">
              {failureEvents}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default EventSuccessFailures;
