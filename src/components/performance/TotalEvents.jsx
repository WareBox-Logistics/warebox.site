import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTIFICATION_HISTORY } from '/src/graphql/queries';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';

const TotalEvents = () => {
  const { data, loading, error } = useQuery(GET_ALL_NOTIFICATION_HISTORY, {
    variables: { limit: 1000, offset: 0 },
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  const totalEvents = data.web_services_notification_history_aggregate.aggregate.count;

  return (
    <Card sx={{ minWidth: 275, borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center">
          <EventNoteIcon color="primary" fontSize="large" />
          <Box ml={2}>
            <Typography variant="h5" component="h2">
              Total de Eventos
            </Typography>
            <Typography variant="h4" component="p">
              {totalEvents}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TotalEvents;
