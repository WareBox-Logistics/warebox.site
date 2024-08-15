import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const InfoCard = ({ icon, title, value, description }) => {
  return (
    <Card sx={{ minWidth: 275, borderRadius: '12px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', marginBottom: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: icon.props.color === 'error' ? '#ffebee' : '#e8f5e9' }}>
            {icon}
          </Avatar>
          <Box ml={2}>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={1}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
