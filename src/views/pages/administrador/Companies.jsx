import React, { useState } from "react";
import { Paper } from "@mui/material";
import { Collapse, Typography } from "antd";
import MainCard from "ui-component/cards/MainCard";
import CompanyComponent from "../../../components/administrador/Companies/CompanyComponent";
import ServiceComponent from "../../../components/administrador/Companies/ServiceComponent";

const { Panel } = Collapse;

const Companies = () => {
  const [services, setServices] = useState([]);

  const updateServices = (newServices) => {
    setServices(newServices);
  };

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Companies">
        
        <CompanyComponent services={services} updateServices={updateServices} />

        <Collapse defaultActiveKey={[]} style={{ marginTop: "55px" }}>
          <Panel header={<Typography.Text strong>Services Management</Typography.Text>} key="1">
            <ServiceComponent updateServices={updateServices} />
          </Panel>
        </Collapse>
      </MainCard>
    </Paper>
  );
};

export default Companies;