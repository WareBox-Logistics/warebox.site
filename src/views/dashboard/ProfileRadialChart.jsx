import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// third-party
import ReactApexChart from 'react-apexcharts';

// project-import
import useConfig from 'hooks/useConfig';
import { grey } from '@mui/material/colors';

// chart options
const redialBarChartOptions = {
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 0,
        size: '75%'
      },
      track: {
        margin: 0
      },
      dataLabels: {
        name: {
          show: false
        },
        value: {
          offsetY: 5
        }
      }
    }
  },
  labels: ['Vimeo']
};

// ==============================|| TOP CARD - RADIAL BAR CHART ||============================== //

export default function ProfileRadialChart() {
  const theme = useTheme();
  const { mode } = useConfig();

  const textPrimary = theme.palette.text.primary;
  const primary = theme.palette.secondary.light;
  const grey0 = theme.palette.grey[0];
  const grey500 = theme.palette.grey[500];
  const grey200 = theme.palette.grey[200];

  const [series] = useState([30]);
  const [options, setOptions] = useState(redialBarChartOptions);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [primary],
      plotOptions: {
        radialBar: {
          track: {
            background: '#1746A2'
          },
          dataLabels: {
            value: {
              fontSize: '1rem',
              fontWeight: 600,
              offsetY: 5,
              color: grey
            }
          }
        }
      },
    }));
  }, []);

  return (
    <Box id="chart" sx={{ bgcolor: theme.palette.primary[200] }}>
      <ReactApexChart options={options} series={series} type="radialBar" width={136} height={136} />
    </Box>
  );
}
