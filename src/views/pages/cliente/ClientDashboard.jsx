import {
    Paper,
    Typography,
  } from "@mui/material";
  import MainCard from "ui-component/cards/MainCard";
  
  const ClientDashboard = () => {
    return (
      <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
        <MainCard title="Sample Card">
          <Typography variant="body2">
            Dashboard Client

            chupo
          </Typography>
        </MainCard>
      </Paper>
    );
  };
  
  export default ClientDashboard;
  