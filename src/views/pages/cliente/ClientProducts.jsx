import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Modal, Spin, Empty, Input, Tag } from "antd";
import { Paper } from "@mui/material";
import { SearchOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from "axios";
import { API_URL_PRODUCTS_COMPANY, API_URL_COMPANY, authToken } from "../../../services/services";

const { Title, Text } = Typography;

const ClientProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientCompany, setClientCompany] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchClientCompany();
  }, []);

  const fetchClientCompany = async () => {
    try {
      const clientName = localStorage.getItem("first_name");

      if (!clientName) {
        throw new Error("Client name not found in localStorage");
      }

      const companyResponse = await axios.get(API_URL_COMPANY, {
        headers: { Authorization: authToken },
      });

      const company = companyResponse.data.companies.find(
        (company) => company.name === clientName
      );

      if (!company) {
        throw new Error("No company found for the client");
      }

      if (JSON.stringify(company) !== JSON.stringify(clientCompany)) {
        setClientCompany(company);
      }
    } catch (error) {
      console.error("Error fetching client company:", error);
    }
  };

  const fetchProducts = async () => {
    if (!clientCompany || products.length > 0) return;

    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_PRODUCTS_COMPANY, {
        headers: { Authorization: authToken },
        params: { company_id: clientCompany.id },
      });

      const fetchedProducts = response.data.products;
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (clientCompany) {
      fetchProducts();
    }
  }, [clientCompany]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value)
    );
    setFilteredProducts(filtered);
  };

  const handleCardClick = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const renderProductCards = () => {
    if (filteredProducts.length === 0) {
      return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Empty description="No Products Available" />
        </div>
      );
    }

    return (
      <Row gutter={[16, 16]} style={{ padding: "0 16px" }}>
        {filteredProducts.map((product) => (
          <Col key={product.id} xs={24} sm={24} md={8} lg={8}>
            <Card
              hoverable
              style={{
                marginBottom: "6px",
                border: "1px solid #f0f0f0",
                borderRadius: "8px",
                cursor: "pointer",
                padding: "6px",
              }}
              onClick={() => handleCardClick(product)}
            >
              <Row gutter={[16, 16]} align="top">
                <Col xs={8}>
                  <img
                    src={product.image || "https://via.placeholder.com/150"}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      marginLeft: "-18px",
                    }}
                  />
                </Col>
                <Col xs={16} style={{ marginLeft: "-20px", marginTop: "-25px" }}>
                  <Title level={4} style={{ marginBottom: "8px", color: "#FF731D" }}>
                    {product.name}
                  </Title>
                  <Text style={{ display: "block", marginBottom: "8px" }}>
                    <strong>SKU:</strong> <Tag color="blue">{product.sku || "N/A"}</Tag>
                  </Text>
                  <Text style={{ display: "block", marginBottom: "8px" }}>
                    <strong>Description:</strong> {product.description || "N/A"}
                  </Text>
                  <Text style={{ display: "block", marginBottom: "8px" }}>
                    <strong>Price:</strong> ${product.price || "0.00"}
                  </Text>
                  <Text style={{ display: "block" }}>
                    <strong>Category:</strong> {product.category?.name || "N/A"}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Your Products">
        <Row justify="center" style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search products by name"
              value={searchText}
              prefix={<SearchOutlined />}
              onChange={handleSearch}
            />
          </Col>
        </Row>
        <Spin spinning={isLoading} size="default">
          {!isLoading && renderProductCards()}
        </Spin>

        <Modal
          title={`Pallets with product: "${selectedProduct?.name || ""}"`}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={370}
          style={{ marginTop: "-30px" }}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedProduct ? (
            <div>
              <Title level={5} style={{ color: "#FF731D" }}>Pallets:</Title>
              {selectedProduct.pallets?.length > 0 ? (
                selectedProduct.pallets.map((pallet) => (
                  <div key={pallet.id} style={{ marginBottom: "10px" }}>
                    <Text strong>Pallet ID:</Text> {pallet.id}<br />
                    <Text strong>Boxes:</Text>
                    <ul>
                      {pallet.box_inventories?.map((box) => (
                        <>
                          <li key={box.id} style={{ marginTop: "-20px" }}>
                            Box ID: {box.id}
                          </li>
                          <li style={{ marginTop: "-5px" }}>
                            Quantity: {box.qty}
                          </li>
                        </>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <Text>No pallets found for this product.</Text>
              )}
            </div>
          ) : (
            <Text>No details available.</Text>
          )}
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default ClientProducts;