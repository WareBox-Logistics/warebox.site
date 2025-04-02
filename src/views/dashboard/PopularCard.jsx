import PropTypes from 'prop-types';
import React, { useState } from 'react';

// Material UI
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

// Project imports
import BajajAreaChartCard from './BajajAreaChartCard';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

// Icons
import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';

export default function PopularCard({ isLoading, reports }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  // const reports = [
  //   {
  //     issue: true,
  //     id: 1,
  //     problem_table: { name: "Police Checkpoint" },
  //     employee_table: { first_name: "Javier", last_name: "Esparza", id: 20 }
  //   }
  // ];
  const stocks = [];

 // Mapeo y adición de reportes a stocks
reports.forEach(report => {
  stocks.push({
    name: report.problem_table.name,  // Se usa el nombre del problema como "name"
    price: report.id,  // Puedes asignar un valor adecuado
    change: `${report.employee_table.first_name} ${report.employee_table.last_name}`,  // Indica que es un nuevo reporte
    up: false // O puedes establecer una condición lógica
  });
});


  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false} sx={{ p: 2 }}>
          <CardContent>
            <Grid container spacing={gridSpacing} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <Grid item>
                <Typography variant="h4">Type reports per Month</Typography>
              </Grid>
              {/* <Grid item>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreHorizOutlinedIcon fontSize="small" />
                </IconButton>
                <Menu
                  id="menu-popular-card"
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem onClick={handleMenuClose}>Today</MenuItem>
                  <MenuItem onClick={handleMenuClose}>This Month</MenuItem>
                  <MenuItem onClick={handleMenuClose}>This Year</MenuItem>
                </Menu>
              </Grid> */}
            </Grid>

            {/* <Grid item xs={12} sx={{ mt: 2, mb: 3 }}>
              <BajajAreaChartCard />
            </Grid> */}

            {stocks.map((stock, index) => (
              <React.Fragment key={stock.name + index}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
                  <Grid item>
                    <Typography variant="subtitle1">{stock.name}</Typography>
                  </Grid>
                  <Grid item sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1">{stock.price}</Typography>
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '5px',
                        bgcolor: stock.up ? '#d4edda' : '#f8d7da',
                        color: stock.up ? '#155724' : '#721c24'
                      }}
                    >
                      {stock.up ? (
                        <KeyboardArrowUpOutlinedIcon fontSize="small" />
                      ) : (
                        <KeyboardArrowDownOutlinedIcon fontSize="small" />
                      )}
                    </Avatar>
                  </Grid>
                </Grid>
                <Typography variant="subtitle2" sx={{ color: stock.up ? '#155724' : '#721c24' }}>
                  {stock.change}
                </Typography>
                {index !== stocks.length - 1 && <Divider sx={{ my: 1.5 }} />}
              </React.Fragment>
            ))}
          </CardContent>

          <CardActions sx={{ p: 1.25, justifyContent: 'center' }}>
            <Button size="small" disableElevation>
              View All <ChevronRightOutlinedIcon />
            </Button>
          </CardActions>
        </MainCard>
      )}
    </>
  );
}

PopularCard.propTypes = { isLoading: PropTypes.bool };
