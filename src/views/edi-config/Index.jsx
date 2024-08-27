import React from 'react';
import { Grid, Container, Box } from '@mui/material';
import WebServicesEDIConfigTable from '/src/components/edi-config/EDIConfigTable';

const Index = () => {
  return (
    <Container maxWidth={false}>
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <WebServicesEDIConfigTable />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Index;
