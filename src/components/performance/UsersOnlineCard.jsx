import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import UsersOnline from './UsersOnline';

const UsersOnlineCard = () => {
  return (
    <Card sx={{ height: '100%', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', padding: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          Usuarios Online
        </Typography>
        <Box>
          <UsersOnline />
        </Box>
      </CardContent>
    </Card>
  );
};

export default UsersOnlineCard;
