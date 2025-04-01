import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Modal, Spin, Empty, Input, Dropdown, Menu, Button } from "antd";
import { Paper } from "@mui/material";
import { SearchOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from "axios";
import { API_URL_PRODUCT, API_URL_COMPANY, API_URL_BOX_INVENTORY, authToken } from "../../../services/services";

const { Title, Text } = Typography;

const ClientProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientCompany, setClientCompany] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isPalletModalVisible, setIsPalletModalVisible] = useState(false);
  const [pallets, setPallets] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoadingPallets, setIsLoadingPallets] = useState(false);


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

  const fetchClientProducts = async () => {
    if (!clientCompany) return;

    setIsLoading(true);
    try {
      const productResponse = await axios.get(API_URL_PRODUCT, {
        headers: { Authorization: authToken },
      });

      const fetchedProducts = productResponse.data.products.filter(
        (product) => product.company?.id === clientCompany.id
      );

      if (JSON.stringify(fetchedProducts) !== JSON.stringify(products)) {
        setProducts(fetchedProducts);
        setFilteredProducts(fetchedProducts);
      }
    } catch (error) {
      console.error("Error fetching client products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPalletsByProduct = async (productId) => {
    setIsLoadingPallets(true);
    try {
      const response = await axios.get(API_URL_BOX_INVENTORY, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
  
      const boxes = response.data.boxes || [];
      const filteredPallets = boxes.filter((box) => box.product.id === productId);
  
      setPallets(filteredPallets);
    } catch (error) {
      console.error("Error fetching pallets:", error);
      setPallets([]);
    } finally {
      setIsLoadingPallets(false);
    }
  };

  useEffect(() => {
    if (clientCompany) {
      fetchClientProducts();
    }
  }, [clientCompany]);

  useEffect(() => {
    const clientName = localStorage.getItem("first_name");
    if (clientName) {
      fetchClientCompany();
    }
  }, []);

  const handleViewPallets = (product) => {
    setSelectedProduct(product);
    setIsPalletModalVisible(true);
    fetchPalletsByProduct(product.id);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value)
    );
    setFilteredProducts(filtered);
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
                    <strong>Description:</strong> {product.description || "N/A"}
                  </Text>
                  <Text style={{ display: "block", marginBottom: "8px" }}>
                    <strong>SKU:</strong> {product.sku || "N/A"}
                  </Text>
                  <Text style={{ display: "block", marginBottom: "8px" }}>
                    <strong>Price:</strong> ${product.price || "0.00"}
                  </Text>
                  <Text style={{ display: "block" }}>
                    <strong>Category:</strong> {product.category?.name || "N/A"}
                  </Text>
                </Col>
              </Row>

              <Dropdown
                overlay={
                    <Menu>
                    <Menu.Item
                        key="viewPallets"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewPallets(product)}
                    >
                        View Pallets
                    </Menu.Item>
                    </Menu>
                }
                trigger={["click"]}
              >
                <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{
                    fontSize: "25px",
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    cursor: "pointer",
                    }}
                />
              </Dropdown>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Products">
        <Row justify="center" style={{ marginBottom: "20px" }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search products by name"
              value={searchText}
              prefix={<SearchOutlined />}
              onChange={handleSearch}
            //   style={{ width: "150px" }}
            />
          </Col>
        </Row>
        <Spin spinning={isLoading} size="default">
          {!isLoading && renderProductCards()}
        </Spin>

        <Modal
            title={`Pallets with product: "${selectedProduct?.name || ""}"`}
            visible={isPalletModalVisible}
            onCancel={() => setIsPalletModalVisible(false)}
            footer={null}
        >
            {isLoadingPallets ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                <Spin size="default" />
                </div>
            ) : pallets.length > 0 ? (
                <ul>
                {pallets.map((pallet) => (
                    <li key={pallet.pallet.id}>
                    Pallet {pallet.pallet.id}
                    </li>
                ))}
                </ul>
            ) : (
                <p>There are no pallets with this product.</p>
            )}
        </Modal>

      </MainCard>
    </Paper>
  );
};

export default ClientProducts;