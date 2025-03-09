// material-ui
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// table data
const createData = (sales, product, price, colorClass = '') => ({ sales, product, price, colorClass });

const rows = [
  createData('2136', 'Head Phone', '$ 926.23'),
  createData('2546', 'Iphone V', '$ 485.85'),
  createData('2681', 'Jacket', '$ 786.4'),
  createData('2756', 'Head Phone', '$ 563.45'),
  createData('8765', 'Sofa', '$ 769.45'),
  createData('3652', 'Iphone X', '$ 754.45'),
  createData('7456', 'Jacket', '$ 743.23'),
  createData('6502', 'T-Shirt', '$ 642.23')
];

// ===========================|| DATA WIDGET - PRODUCT SALES ||=========================== //

export default function ProductSales() {
  return (
    <MainCard title="Product Sales" content={false}>
      <Grid sx={{ p: 2.5 }} container direction="row" justifyContent="space-around" alignItems="center">
        <Grid item>
          <Grid container direction="column" spacing={1} alignItems="center" justifyContent="center">
            <Grid item>
              <Typography variant="subtitle2" color="secondary">
                Earning
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4">20,569$</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="column" spacing={1} alignItems="center" justifyContent="center">
            <Grid item>
              <Typography variant="subtitle2" color="secondary">
                Yesterday
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4">580$</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="column" spacing={1} alignItems="center" justifyContent="center">
            <Grid item>
              <Typography variant="subtitle2" color="secondary">
                This Week
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="h4">5,789$</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <SimpleBar
        sx={{
          height: 290
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 3 }}>Last Sales</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell align="right" sx={{ pr: 3 }}>
                  Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow hover key={index}>
                  <TableCell sx={{ pl: 3 }}>
                    <span className={row.colorClass}>{row.sales}</span>
                  </TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    <span>{row.price}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </SimpleBar>
    </MainCard>
  );
}
