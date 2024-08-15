import React, { useState, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTIFICATION_HISTORY } from '/src/graphql/subscriptions';
import { Card, CardContent, Typography, Box, CircularProgress, Grid } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import InfiniteScroll from 'react-infinite-scroll-component';
import InfoCard from './InfoCard';
import moment from 'moment';

const NotificationHistory = () => {
  const [limit, setLimit] = useState(20);
  const scrollableDivRef = useRef(null);

  const startDate = moment().subtract(1, 'weeks').startOf('day').toISOString();
  const endDate = moment().endOf('day').toISOString();

  const { data, loading, error, fetchMore } = useQuery(GET_ALL_NOTIFICATION_HISTORY, {
    variables: { limit, offset: 0, startDate, endDate },
  });

  const fetchMoreData = () => {
    const currentScrollTop = scrollableDivRef.current.scrollTop;
    fetchMore({
      variables: {
        offset: data.web_services_notification_history.length,
        startDate,
        endDate,
      },
    }).then(() => {
      setLimit(limit + 20);
      setTimeout(() => {
        scrollableDivRef.current.scrollTop = currentScrollTop;
      }, 0);
    });
  };

  if (loading && !data) return <CircularProgress />;
  if (error) return <Typography color="error">Error :(</Typography>;

  const successCount = data.web_services_notification_history.filter(event => !event.error_message).length;
  const errorCount = data.web_services_notification_history.length - successCount;
  const totalCount = data.web_services_notification_history.length;

  const successPercentage = ((successCount / totalCount) * 100).toFixed(2);
  const errorPercentage = ((errorCount / totalCount) * 100).toFixed(2);

  return (
    <Box sx={{ height: '100%' }}>
      <Box display="flex" alignItems="center" mb={3}>
        <EventIcon color="primary" fontSize="large" />
        <Box ml={2}>
          <Typography variant="h5" component="h2">
            Actividades Recientes
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" component="div" mb={3}>
        Última Semana: {successPercentage}% Éxito, {errorPercentage}% Fallas
      </Typography>
      <Box
        id="scrollableDiv"
        ref={scrollableDivRef}
        sx={{ height: 300, overflowY: 'auto', mt: 2, border: '1px solid #ccc', borderRadius: '8px', padding: 2 }}
      >
        <InfiniteScroll
          dataLength={data.web_services_notification_history.length}
          next={fetchMoreData}
          hasMore={data.web_services_notification_history.length < data.web_services_notification_history_aggregate.aggregate.count}
          loader={<CircularProgress />}
          scrollableTarget="scrollableDiv"
          style={{ overflow: 'unset' }}
        >
          {data.web_services_notification_history.map(event => (
            <InfoCard
              key={event.id}
              icon={<EventIcon color={event.error_message ? 'error' : 'success'} />}
              title={event.route}
              value={event.customer.name}
              description={`${event.customer.company_type_code_name} - ${moment(event.notified_at).format('DD/MM/YYYY HH:mm')}`}
            />
          ))}
        </InfiniteScroll>
      </Box>
    </Box>
  );
};

export default NotificationHistory;
