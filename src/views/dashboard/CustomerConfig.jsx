import {
  Paper,
  Typography,
} from "@mui/material";
import MainCard from "ui-component/cards/MainCard";

const CustomerConfig = () => {
  return (
    <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
      <MainCard title="Sample Card">
        <Typography variant="body2">
          Lorem ipsum dolor sit amen, consenter nipissing eli, sed do elusion
          tempos incident ut laborers et doolie magna alissa. Ut enif ad minim
          venice, quin nostrum exercitation illampu laborings nisi ut liquid ex
          ea commons construal. Duos aube grue dolor in reprehended in voltage
          veil esse colum doolie eu fujian bulla parian. Exceptive sin ocean
          cuspidate non president, sunk in culpa qui officiate descent molls
          anim id est labours.
        </Typography>
      </MainCard>
    </Paper>
  );
};

export default CustomerConfig;
