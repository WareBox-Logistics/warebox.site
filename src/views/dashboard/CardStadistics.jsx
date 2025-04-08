import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import BackLeft from './UserProfileBackLeft';
import BackRight from './UserProfileBackRight';
// import MainCard from 'components/MainCard';
import ProfileRadialChart from './ProfileRadialChart';
// import { ThemeDirection } from 'config';
import MainCard from 'ui-component/cards/MainCard';
import { bgcolor } from '@mui/system';

// ==============================|| USER PROFILE - TOP CARD ||============================== //

export default function CardStadistics({ focusInput }) {
  const theme = useTheme();
  const downSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MainCard border={false} content={false} sx={{position: 'relative' ,marginBottom : 3, bgcolor: theme.palette.primary[200]}} >
      <Box
        
        sx={{
          position: 'absolute',
          bottom: -7,
          left: 0,
          zIndex: 1,
          color: 'red',
          ...({ transform: 'rotate(180deg)', top: -7, bottom: 'unset' })
        }}
      >
        {/* <BackLeft /> */}
      </Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ position: 'relative', zIndex: 5 }}>
        <Grid item>
          <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center">
            <Box sx={{ ml: { xs: 0, sm: 1 }  }} >
              {/* <ProfileRadialChart /> */}
              <Grid width={100} height={100} sx={{ bgcolor: theme.palette.primary[200], borderRadius: '50%' }}>
              </Grid>            </Box>
            <Stack spacing={0.75}>
              <Typography variant="h5">Have a nice day</Typography>
              <Typography variant="body2" color="secondary">
                and do a good job
              </Typography>
            </Stack>
          </Stack>
        </Grid>
        <Grid item sx={{ mx: { xs: 2, sm: 3 }, my: { xs: 1, sm: 0 }, mb: { xs: 2, sm: 0 } }} xs={downSM ? 12 : 'auto'}>
          <Button variant="contained" fullWidth={downSM} component={Link} to="/admin/warehouses" onClick={focusInput}>
            Add new warehouse
          </Button>
        </Grid>
      </Grid>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          zIndex: 1,
        //   ...(theme.direction === ThemeDirection.RTL && { transform: 'rotate(180deg)', top: -10, bottom: 'unset' })
        }}
      >
        <BackRight />
      </Box>
    </MainCard>
  );
}

CardStadistics.propTypes = { focusInput: PropTypes.func };
