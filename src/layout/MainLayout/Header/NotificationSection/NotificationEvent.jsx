import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box
} from '@mui/material';
import { LocalShipping } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const NotificationEvent = ({ notification, lastViewedNotificationTime, onClick }) => {
  const theme = useTheme();

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        padding: 1,
        bgcolor: new Date(notification.notified_at) > lastViewedNotificationTime
          ? theme.palette.action.hover
          : 'inherit',
        fontWeight: new Date(notification.notified_at) > lastViewedNotificationTime
          ? 'bold'
          : 'normal',
        cursor: 'pointer',
        borderBottom: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          backgroundColor: theme.palette.action.selected,
        }
      }}
      onClick={onClick}
    >
      <ListItemAvatar>
        <Avatar sx={{ backgroundColor: theme.palette.primary.main, width: 32, height: 32 }}>
          <LocalShipping fontSize="small" />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            component="span"
            variant="body1"
            color="textPrimary"
            display="block"
            sx={{ fontWeight: 'bold' }}
          >
            {`Route: ${notification.route}`}
          </Typography>
        }
        secondary={
          <Box>
            <Typography
              component="span"
              variant="body2"
              color="textSecondary"
              display="block"
              sx={{ marginTop: theme.spacing(0.3) }}
            >
              {`${notification.error_message ? 'Fail' : 'OK'} - ${new Date(notification.notified_at).toLocaleString()}`}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="textSecondary"
              display="block"
              sx={{ marginTop: theme.spacing(0.3) }}
            >
              {`Event: ${notification.event_id}`}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
};

export default NotificationEvent;
