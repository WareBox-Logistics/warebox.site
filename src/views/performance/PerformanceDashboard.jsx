import React from 'react';
import OverviewCard from '/src/components/performance/OverviewCard';
import NotificationHistoryTable from '/src/components/performance/NotificationHistoryTable';
import { Grid, Container, Box } from '@mui/material';
import './PerformanceDashboard.css';

const PerformanceDashboard = () => {
  return (
    <Container className="performance-dashboard-container" maxWidth={false}>
      <Box className="performance-dashboard-box">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <OverviewCard />
          </Grid>
          <Grid item xs={12}>
            <NotificationHistoryTable />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PerformanceDashboard;
