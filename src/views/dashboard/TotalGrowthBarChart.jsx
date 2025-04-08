import PropTypes from 'prop-types';
import React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Chart from 'react-apexcharts';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TotalGrowthBarChart({ isLoading, data }) {
  const countByDay = daysOfWeek.map((day) => {
    const found = data.find((item) => item.dia_semana.trim().toLowerCase() === day.toLowerCase());
    return found ? found.entregados : 0;
  });

  const chartData = {
    height: 480,
    type: 'bar',
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: true },
      },
      title: {
        text: 'Delivered closed in the last 7 days',
        align: 'center',
        style: { fontSize: '18px', color: '#333' },
      },
      colors: ['#34c38f'], // solo verde
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded',
          dataLabels: {
            position: 'top', // valores arriba de la barra
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => val,
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },
      xaxis: {
        categories: daysOfWeek,
        axisBorder: { show: true },
        axisTicks: { show: true },
        labels: { style: { colors: '#787878' } },
      },
      yaxis: {
        axisBorder: { show: true },
        axisTicks: { show: true },
        labels: { style: { colors: '#787878' } },
      },
      fill: { opacity: 1 },
      tooltip: {
        y: { formatter: (val) => `${val} delivered` },
      },
      grid: { borderColor: '#f1f1f1' },
    },
    series: [
      {
        name: 'Delivered',
        data: countByDay,
      },
    ],
  };

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
              minHeight: '670px',
              maxHeight: '100%',
              '& .apexcharts-canvas': {
                width: '100% !important',
                height: '100% !important',
              },
            }}
          >
            <Chart {...chartData} height="100%" />
          </Grid>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
};
