import React, { useState, useEffect } from "react";
import { Paper } from "@mui/material";
import { Collapse, Typography } from "antd";
import MainCard from "ui-component/cards/MainCard";
import VehicleComponent from "components/administrador/Vehicles/VehicleComponent";
import ModelComponent from "components/administrador/Vehicles/ModelComponent";
import BrandComponent from "components/administrador/Vehicles/BrandComponent";
import axios from "axios";
import { API_URL_BRAND, API_URL_MODEL, authToken } from "services/services";

const { Panel } = Collapse;

const Vehicles = () => {
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  const updateBrands = (newBrands) => setBrands(newBrands);
  const updateModels = (newModels) => setModels(newModels);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchBrands();
    fetchModels();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(API_URL_BRAND, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setBrands(response.data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(API_URL_MODEL, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setModels(response.data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Vehicles Management">
        
        <VehicleComponent models={models} brands={brands} />

        <Collapse defaultActiveKey={[]} style={{ marginTop: "55px" }}>

            <Panel header={<Typography.Text strong>Models Management</Typography.Text>} key="1">
                <ModelComponent brands={brands} updateModels={updateModels} />
            </Panel>

            <Panel header={<Typography.Text strong>Brands Management</Typography.Text>} key="2">
                <BrandComponent updateBrands={updateBrands} />
            </Panel>
            
        </Collapse>
      </MainCard>
    </Paper>
  );
};

export default Vehicles;