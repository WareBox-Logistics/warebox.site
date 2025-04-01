import React, { useState } from "react";
import { Paper } from "@mui/material";
import { Collapse, Typography } from "antd";
import MainCard from "ui-component/cards/MainCard";
import ProductComponent from "../../../components/administrador/Products/ProductComponent";
import CategoryComponent from "../../../components/administrador/Products/CategoryComponent";

const { Panel } = Collapse;

const Products = () => {
  const [categories, setCategories] = useState([]);

  const updateCategories = (newCategories) => {
    setCategories(newCategories);
  };

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Products">

        <ProductComponent categories={categories} updateCategories={updateCategories} />

        <Collapse defaultActiveKey={[]} style={{ marginTop: "55px" }}>
          <Panel header={<Typography.Text strong>Categories Management</Typography.Text>} key="1">
            <CategoryComponent categories={categories} updateCategories={updateCategories} />
          </Panel>
        </Collapse>
      </MainCard>
    </Paper>
  );
};

export default Products;