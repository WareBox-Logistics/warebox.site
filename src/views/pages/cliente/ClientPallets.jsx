import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Spin, Modal, Tag, Empty, Select } from "antd";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import { CodepenOutlined } from "@ant-design/icons";
import axios from 'axios';
import { API_URL_PALLETS_COMPANY, API_URL_COMPANY, authToken } from '../../../services/services';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientPallets = () => {
  const [pallets, setPallets] = useState([]);
  const [filteredPallets, setFilteredPallets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchPallets();
  }, []);

  const fetchPallets = async () => {
    setIsLoading(true);
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
        throw new Error("Company not found");
      }

      const response = await axios.get(API_URL_PALLETS_COMPANY, {
        headers: { Authorization: authToken },
        params: { company_id: company.id },
      });

      const fetchedPallets = response.data.pallets;
      setPallets(fetchedPallets);
      setFilteredPallets(fetchedPallets);
    } catch (error) {
      console.error("Error fetching pallets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (pallet) => {
    setSelectedPallet(pallet);
    setIsModalVisible(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Created":
        return <Tag color="processing">Created</Tag>;
      case "Stored":
        return <Tag color="default">Stored</Tag>;
      case "In Transit":
        return <Tag color="warning">In Transit</Tag>;
      case "Delivered":
        return <Tag color="success">Delivered</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  useEffect(() => {
    const filtered = pallets.filter((pallet) => {
      if (!statusFilter) return true;
      return pallet.status === statusFilter;
    });
    setFilteredPallets(filtered);
  }, [statusFilter, pallets]);

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const renderPalletCards = () => {
    if (filteredPallets.length === 0) {
      return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Empty description="No Data" />
        </div>
      );
    }

    const warehouses = Array.from(
      new Set(filteredPallets.map((pallet) => pallet.warehouse?.name))
    );

    return warehouses.map((warehouseName) => {
      const palletsInWarehouse = filteredPallets.filter(
        (pallet) => pallet.warehouse?.name === warehouseName
      );

      return (
        <div key={warehouseName} style={{ marginBottom: "30px", width: "100%" }}>
          <Title level={4} style={{ marginBottom: "16px", paddingLeft: "16px", color: "#FF731D" }}>
            - {warehouseName} -
          </Title>

          <Row gutter={[16, 16]} style={{ padding: "0 16px" }}>
            {palletsInWarehouse.map((pallet) => (
              <Col key={pallet.id} xs={24} sm={12} md={8} lg={8}>
                <Card
                  hoverable
                  style={{
                    marginBottom: '16px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '2px',
                    height: '100%',
                  }}
                  onClick={() => handleCardClick(pallet)}
                >
                  <Row gutter={[8, 8]}>
                    <Col>
                      <CodepenOutlined style={{ fontSize: '36px', marginRight: '15px', color: '#FF731D' }} />
                    </Col>
                    <Col flex="auto">
                      <Title level={3} style={{ margin: 0 }}>
                        Pallet {pallet.id}
                      </Title>
                      <Text style={{ display: 'block', marginTop: '8px', fontSize: '16px' }}>
                        <strong>Weight:</strong> {pallet.weight || "0"} kg
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Volume:</strong> {pallet.volume || "0"} m³
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Boxes:</strong> {pallet.box_inventories?.length || 0}
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px', marginTop: '18px', marginBottom: '-15px' }}>
                        <strong>Status:</strong> {getStatusTag(pallet.status?.trim() || "N/A")}
                      </Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      );
    });
  };

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Your Pallets">
        <Spin spinning={isLoading}>
          <Col xs={24} style={{ marginBottom: "20px", textAlign: "right" }}>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150, textAlign: "left" }}
              onChange={handleStatusFilterChange}
              allowClear
            >
              <Option value="Created">Created</Option>
              <Option value="Stored">Stored</Option>
              <Option value="In Transit">In Transit</Option>
              <Option value="Delivered">Delivered</Option>
            </Select>
          </Col>
          {!isLoading && renderPalletCards()}
        </Spin>

        <Modal
          title={`Boxes in Pallet #${selectedPallet?.id}`}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={350}
          style={{ marginTop: "-10px" }}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedPallet?.box_inventories?.length > 0 ? (
            selectedPallet.box_inventories.map((box) => (
              <div key={box.id} style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    padding: "10px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {/* Imagen del producto */}
                  {box.product?.image && (
                    <img
                      src={box.product.image}
                      alt={box.product.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginRight: "15px",
                      }}
                    />
                  )}

                  {/* Información del producto */}
                  <div>
                    <Text strong>Box ID:</Text> {box.id}<br />
                    <Text strong>Weight:</Text> {box.weight} kg<br />
                    <Text strong>Volume:</Text> {box.volume} m³<br />
                    <Text strong>Product:</Text> {box.product?.name || "N/A"}<br />
                    <Text strong>SKU:</Text> {box.product?.sku || "N/A"}<br />
                    <Text strong>Price:</Text> ${box.product?.price || "N/A"}<br />
                    <Text strong>Quantity:</Text> {box.qty}<br />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <Text>No boxes found in this pallet</Text>
          )}
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default ClientPallets;