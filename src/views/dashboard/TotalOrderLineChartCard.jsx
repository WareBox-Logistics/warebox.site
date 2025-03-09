import PropTypes from 'prop-types';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chart from 'react-apexcharts';
import ChartDataMonth from './chart-data/total-order-month-line-chart';
import ChartDataYear from './chart-data/total-order-year-line-chart';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

export default function TotalOrderLineChartCard({ isLoading }) {
  const theme = useTheme();
  const [timeValue, setTimeValue] = React.useState(false);
  const handleChangeTime = (event, newValue) => setTimeValue(newValue);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: 'primary.dark',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&>div': { position: 'relative', zIndex: 5 },
            '&:after, &:before': {
              content: '""',
              position: 'absolute',
              width: '13rem',
              height: '13rem',
              background: theme.palette.primary[800],
              borderRadius: '50%',
              opacity: 0.5,
            },
            '&:after': { top: '-5rem', right: '-6rem' },
            '&:before': { top: '-7rem', right: '-1rem' },
          }}
        >
          <Box sx={{ p: '1rem' }}>
            <Grid container direction="column">
              <Grid container justifyContent="space-between" alignItems="center">
                <Avatar variant="rounded" sx={{ bgcolor: 'primary.800', color: '#fff' }}>
                  <LocalMallOutlinedIcon fontSize="inherit" />
                </Avatar>
                <Box>
                  <Button
                    disableElevation
                    variant={timeValue ? 'contained' : 'text'}
                    size="small"
                    sx={{ color: 'inherit' }}
                    onClick={(e) => handleChangeTime(e, true)}
                  >
                    Month
                  </Button>
                  <Button
                    disableElevation
                    variant={!timeValue ? 'contained' : 'text'}
                    size="small"
                    sx={{ color: 'inherit' }}
                    onClick={(e) => handleChangeTime(e, false)}
                  >
                    Year
                  </Button>
                </Box>
              </Grid>
              <Grid container alignItems="center">
                <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 500, mr: '0.5rem' }}>
                    {timeValue ? '$108' : '$961'}
                  </Typography>
                  <Avatar sx={{ bgcolor: 'primary.200', color: 'primary.dark' }}>
                    <ArrowDownwardIcon fontSize="inherit" sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                  </Avatar>
                </Grid>
                <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Chart {...(timeValue ? ChartDataMonth : ChartDataYear)} />
                </Grid>
              </Grid>
              <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'primary.200' }}>
                Total Order
              </Typography>
            </Grid>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalOrderLineChartCard.propTypes = { isLoading: PropTypes.bool };