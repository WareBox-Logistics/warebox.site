import React from "react";
import { Paper } from "@mui/material";
import { Collapse, Typography } from "antd";
import MainCard from "ui-component/cards/MainCard";
import CompanyComponent from "../../../components/administrador/Companies/CompanyComponent";
import ServiceComponent from "../../../components/administrador/Companies/ServiceComponent";

const { Panel } = Collapse;

const Companies = () => {
  return (
    <Paper sx={{ padding: "16px", margin: "16px" }}>
      <MainCard title="Companies">
        
        <CompanyComponent />

        <Collapse defaultActiveKey={[]} style={{ marginTop: "55px" }}>
          <Panel header={<Typography.Text strong>Services Management</Typography.Text>} key="1">
            <ServiceComponent />
          </Panel>
        </Collapse>
      </MainCard>
    </Paper>
  );
};

export default Companies;