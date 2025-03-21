import React from "react";
import { Paper } from "@mui/material";
import { Collapse, Typography } from "antd";
import MainCard from "ui-component/cards/MainCard";
import VehicleComponent from "components/administrador/Vehicles/VehicleComponent";
import ModelComponent from "components/administrador/Vehicles/ModelComponent";
import BrandComponent from "components/administrador/Vehicles/BrandComponent";

const { Panel } = Collapse;
// const { Text } = Typography;

const Vehicles = () => {
  return (
    <Paper elevation={3} sx={{ padding: "16px", margin: "16px" }}>
      <MainCard title="Vehicles Management">
        
        <VehicleComponent />

        <Collapse defaultActiveKey={[]} style={{ marginTop: "16px" }}>
            <Panel
                header={<Typography.Text strong>Models Management</Typography.Text>}
                key="1"
            >
                <ModelComponent />
            </Panel>
            <Panel
                header={<Typography.Text strong>Brands Management</Typography.Text>}
                key="2"
            >
                <BrandComponent />
            </Panel>
        </Collapse>
      </MainCard>
    </Paper>
  );
};

export default Vehicles;