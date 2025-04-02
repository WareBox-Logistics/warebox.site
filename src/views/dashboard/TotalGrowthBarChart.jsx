import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// third party
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// chart data
import chartData from './chart-data/total-growth-bar-chart';

const status = [
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

export default function TotalGrowthBarChart({ isLoading , delivered}) {
  const [value, setValue] = React.useState('today');
  const theme = useTheme();
  const { mode } = useConfig();

  const { primary } = theme.palette.text;
  const darkLight = theme.palette.dark.light;
  const divider = theme.palette.divider;
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  React.useEffect(() => {
    const newChartData = {
      // ...chartData.options,
      // colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      // xaxis: {
      //   labels: {
      //     style: {
      //       style: { colors: primary }
      //     }
      //   }
      // },
      // yaxis: {
      //   labels: {
      //     style: {
      //       style: { colors: primary }
      //     }
      //   }
      // },
      // grid: { borderColor: divider },
      // tooltip: { theme: mode },
      // legend: { labels: { colors: grey500 } }
    };

    // do not load chart when loading
    // if (!isLoading) {
    //   ApexCharts.exec(`bar-chart`, 'updateOptions', newChartData);
    // }
  }, [primary200, primaryDark, secondaryMain, secondaryLight, primary, darkLight, divider, isLoading, grey500]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard height="100%">
          <Grid
            item
            xs={12}
            sx={{
              flexGrow: 1,
              minHeight: '670px', // Asegurar altura mínima
              maxHeight: '100%', // Asegurar altura mínima
              '& .apexcharts-canvas': {
                width: '100% !important',
                height: '100% !important'
              }
            }}
          >
            <Chart {...chartData} height="100%" />
          </Grid>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = { isLoading: PropTypes.bool };
