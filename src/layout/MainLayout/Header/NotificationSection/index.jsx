/** @jsxImportSource @emotion/react */
import { useEffect, useRef, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSubscription } from '@apollo/client';
import { SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER } from '/src/graphql/queries';
import { keyframes } from '@emotion/react';
import NotificationEvent from './NotificationEvent';
import AuthContext from '/src/context/AuthContext';

// Material-UI components
import { useTheme } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Button,
  CardActions,
  Chip,
  ClickAwayListener,
  Divider,
  Grid,
  Paper,
  Popper,
  Stack,
  Typography,
  useMediaQuery,
  ButtonBase,
  List
} from '@mui/material';
import PerfectScrollbar from 'react-perfect-scrollbar';

import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import { IconBell } from '@tabler/icons-react';

// Animación de vibración para la campana de notificaciones
const bellAnimation = keyframes`
  0% { transform: rotate(0deg); }
  20% { transform: rotate(-10deg); }
  40% { transform: rotate(10deg); }
  60% { transform: rotate(-10deg); }
  80% { transform: rotate(10deg); }
  100% { transform: rotate(0deg); }
`;

const NotificationSection = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { isAuthenticated, authChecked } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [animateBell, setAnimateBell] = useState(false);
  const [filters, setFilters] = useState({
    route: '',
    error_message: '',
    id: '',
    event_id: '',
  });
  const customer_id = localStorage.getItem('customer_id');
  const lastViewedNotificationTime = useRef(new Date(localStorage.getItem('lastViewedNotificationTime') || 0));
  const lastNotificationId = useRef(null);

  const anchorRef = useRef(null);

  const { data: subscriptionData, error: subscriptionError } = useSubscription(SUBSCRIBE_NOTIFICATION_HISTORY_CUSTOMER, {
    variables: { customer_id },
    skip: !isAuthenticated || !authChecked, // Skip subscription if not authenticated or auth not checked
    onSubscriptionData: ({ subscriptionData }) => {
      const newNotifications = subscriptionData?.data?.web_services_notification_history || [];
      if (newNotifications.length > 0 && !initialLoad) {
        const latestNotificationId = newNotifications[0]?.id;
        if (latestNotificationId !== lastNotificationId.current) {
          setHasNewNotification(true);
          setAnimateBell(true);
          setTimeout(() => setAnimateBell(false), 500); // Reset animation after 500ms
          lastNotificationId.current = latestNotificationId;
        }
      }
      setNotifications((prevNotifications) => {
        const allNotifications = [...newNotifications, ...prevNotifications];
        const uniqueNotifications = allNotifications.reduce((acc, current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        return uniqueNotifications.slice(0, 7);
      });
    }
  });

  useEffect(() => {
    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError);
    }
  }, [subscriptionError]);

  useEffect(() => {
    if (subscriptionData && initialLoad) {
      setInitialLoad(false);
      const loadedNotifications = subscriptionData?.web_services_notification_history.slice(0, 7) || [];
      setNotifications(loadedNotifications);
      const hasNew = loadedNotifications.some(
        (notification) => new Date(notification.notified_at) > lastViewedNotificationTime.current
      );
      setHasNewNotification(hasNew);
      if (loadedNotifications.length > 0) {
        lastNotificationId.current = loadedNotifications[0]?.id;
      }
    }
  }, [subscriptionData, initialLoad]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
    if (!open) {
      setHasNewNotification(false); // Clear the new notification flag when opening the list
      setTimeout(() => {
        lastViewedNotificationTime.current = new Date();
        localStorage.setItem('lastViewedNotificationTime', lastViewedNotificationTime.current.toISOString());
      }, 1000); // Retraso de 1 segundo antes de actualizar el tiempo de última visualización
    }
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleViewAll = () => {
    setFilters({
      route: '',
      error_message: '',
      id: '',
      event_id: '',
    });
    navigate('/history');
  };

  const handleNotificationClick = (id) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      id,
    }));
    navigate(`/history?id=${id}`);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <Box
        sx={{
          ml: 2,
          mr: 3,
          [theme.breakpoints.down('md')]: {
            mr: 2
          },
          position: 'relative'
        }}
      >
        <ButtonBase sx={{ borderRadius: '12px' }}>
          <Avatar
            variant="rounded"
            css={animateBell ? { animation: `${bellAnimation} 0.5s` } : {}}
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              background: theme.palette.secondary.light,
              color: theme.palette.secondary.dark,
              '&[aria-controls="menu-list-grow"],&:hover': {
                background: theme.palette.secondary.dark,
                color: theme.palette.secondary.light
              },
              position: 'relative'
            }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
            onClick={handleToggle}
            color="inherit"
          >
            <IconBell stroke={1.5} size="1.3rem" />
            {hasNewNotification && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  bgcolor: 'red',
                  borderRadius: '50%'
                }}
              />
            )}
          </Avatar>
        </ButtonBase>
      </Box>
      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? 5 : 0, 20]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Grid container direction="column" spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center" justifyContent="space-between" sx={{ pt: 2, px: 2 }}>
                        <Grid item>
                          <Stack direction="row" spacing={2}>
                            <Typography variant="subtitle1">Notifications</Typography>
                            <Chip
                              size="small"
                              label={notifications.length > 0 ? notifications.length : "0"}
                              sx={{
                                color: theme.palette.background.default,
                                bgcolor: theme.palette.warning.dark
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item>
                          <Typography component={Link} to="#" variant="subtitle2" color="primary">
                            {/* Mark as all read */}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12}>
                      <PerfectScrollbar style={{ height: '100%', maxHeight: 'calc(100vh - 205px)', overflowX: 'hidden' }}>
                        <List>
                          {notifications.map((notification) => (
                            <NotificationEvent
                              key={notification.id}
                              notification={notification}
                              lastViewedNotificationTime={lastViewedNotificationTime.current}
                              onClick={() => handleNotificationClick(notification.id)}
                            />
                          ))}
                        </List>
                      </PerfectScrollbar>
                    </Grid>
                  </Grid>
                  <Divider />
                  <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
                    <Button size="small" disableElevation onClick={handleViewAll}>
                      View All
                    </Button>
                  </CardActions>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

export default NotificationSection;
