import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Select, Typography, Spin, Modal, Tag, Empty } from "antd";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import { HomeOutlined, CodepenOutlined } from "@ant-design/icons";
import axios from 'axios';
import { API_URL_PALLET, API_URL_BOX_INVENTORY, API_URL_COMPANY, API_URL_WAREHOUSE, authToken } from '../../../services/services';

const { Title, Text } = Typography;

const Pallets = () => {
  const [pallets, setPallets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filteredPallets, setFilteredPallets] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoadingPallets, setIsLoadingPallets] = useState(true);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(false);
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [boxInventory, setBoxInventory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    fetchPalletsAndCompanies();
  }, []);

  const fetchPalletsAndCompanies = async () => {
    setIsLoadingPallets(true);
    try {
      const [palletResponse, companyResponse, boxResponse] = await Promise.all([
        axios.get(API_URL_PALLET, { headers: { Authorization: authToken } }),
        axios.get(API_URL_COMPANY, { headers: { Authorization: authToken } }),
        axios.get(API_URL_BOX_INVENTORY, { headers: { Authorization: authToken } }),
      ]);

      const fetchedPallets = palletResponse.data.pallets || [];
      setPallets(fetchedPallets);
      setCompanies(companyResponse.data.companies || []);
      setBoxes(boxResponse.data.boxes || []);

      if (!selectedStatus && !selectedCompany) {
        setFilteredPallets(fetchedPallets);
      }
    } catch (error) {
      console.error("Error fetching pallets or companies:", error);
    } finally {
      setIsLoadingPallets(false);
    }
  };

  const handleFilterByCompany = (companyId) => {
    setSelectedCompany(companyId);
    if (companyId) {
      const filtered = pallets.filter(pallet => pallet.company?.id === companyId);
      setFilteredPallets(filtered);
    } else {
      setFilteredPallets(pallets);
    }
  };

  const getStatusTag = (status) => {
    // console.log("Status received:", status);
    switch (status) {
      case "Created":
        return <Tag color="processing">Created</Tag>;
      case "Stored":
        return <Tag color="default">Stored</Tag>;
      case "In Transit":
        return <Tag color="warning" icon={<CodepenOutlined />}>In Transit</Tag>;
      case "Delivered":
        return <Tag color="success" icon={<CodepenOutlined />}>Delivered</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  const getBoxCountForPallet = (palletId) => {
    return boxes.filter(box => box.pallet?.id === palletId).length;
  };

  const handleCardClick = async (pallet) => {
    setSelectedPallet(pallet);
    setIsLoadingBoxes(true);
    setIsModalVisible(true);

    try {
      const response = await axios.get(`${API_URL_BOX_INVENTORY}`, {
        headers: { Authorization: authToken },
        params: { pallet_id: pallet.id },
      });

      const filteredBoxes = response.data.boxes.filter(box => box.pallet && box.pallet.id === pallet.id);
      setBoxInventory(filteredBoxes);
    } catch (error) {
      console.error("Error fetching box inventory:", error);
    } finally {
      setIsLoadingBoxes(false);
    }
  };

  const getUniqueWarehouses = () => {
    const warehouseMap = new Map();
    filteredPallets.forEach(pallet => {
      if (pallet.warehouse && !warehouseMap.has(pallet.warehouse.id)) {
        warehouseMap.set(pallet.warehouse.id, pallet.warehouse);
      }
    });
    return Array.from(warehouseMap.values());
  };

  const handleFilterByStatus = (status) => {
    setSelectedStatus(status);
    if (status) {
      const filtered = pallets.filter(pallet => pallet.status === status);
      setFilteredPallets(filtered);
    } else {
      setFilteredPallets(pallets);
    }
  };


  const renderPalletCards = () => {
    if (filteredPallets.length === 0) {
      return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Empty description="No Data" />
        </div>
      );
    }
    
    const warehouses = getUniqueWarehouses();

    return warehouses.map(warehouse => {
      const palletsInWarehouse = filteredPallets.filter(pallet =>
        pallet.warehouse && pallet.warehouse.id === warehouse.id
      );

      if (palletsInWarehouse.length === 0) return null;

      return (
        <div key={warehouse.id} style={{ marginBottom: "30px", width: "100%" }}>
          <Title level={4} style={{ marginBottom: "16px", paddingLeft: "16px" }}>
            - {warehouse.name} -
          </Title>

          <Row gutter={[16, 16]} style={{ padding: "0 16px" }}>
            {palletsInWarehouse.map((pallet, index) => (
              <Col key={`${pallet.id}-${index}`} xs={24} sm={12} md={8} lg={8}>
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
                        <strong>Company:</strong> {pallet.company?.name || "N/A"}
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Weight:</strong> {pallet.weight || "0"} kg
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Volume:</strong> {pallet.volume || "0"} m³
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Boxes:</strong> {getBoxCountForPallet(pallet.id)}
                        {/* <Tag color="orange" style={{ marginTop: '8px' }}>
                          {getBoxCountForPallet(pallet.id)}
                        </Tag> */}
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px', marginTop: '18px', marginBottom: '-15px' }}>
                        <strong>Status:</strong> {getStatusTag(pallet.status?.trim() || "N/A")}
                      </Text>
                      {/* <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Verified:</strong> {pallet.verified ? "Yes" : "No"}
                      </Text> */}
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
      <MainCard title="Pallets">
        <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
          <Col>
            <Select
              placeholder="Filter by Company"
              style={{ width: 200 }}
              allowClear
              onChange={handleFilterByCompany}
              options={companies.map(company => ({
                label: company.name,
                value: company.id,
              }))}
            />
          </Col>
          <Col>
            <Select
              placeholder="Sort by Status"
              style={{ width: 150 }}
              allowClear
              onChange={handleFilterByStatus}
              options={[
                { label: "Created", value: "Created" },
                { label: "Stored", value: "Stored" },
                { label: "In Transit", value: "In Transit" },
                { label: "Delivered", value: "Delivered" },
              ]}
            />
          </Col>
        </Row>

        <Spin spinning={isLoadingPallets}>
          {!isLoadingPallets && renderPalletCards()}
        </Spin>

        <Modal
          title={`Boxes in Pallet ${selectedPallet?.id}`}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          <Spin spinning={isLoadingBoxes} tip="Loading boxes...">
            {boxInventory.length > 0 ? (
              <Row gutter={[16, 16]}>
                {boxInventory.map(box => (
                  <Col key={box.id} xs={24} sm={12} md={8}>
                    <Card style={{ marginBottom: '16px' }}>
                      <Text strong>Box ID:</Text> {box.id}<br />
                      <Text strong>Quantity:</Text> {box.qty}<br />
                      <Text strong>Weight:</Text> {box.weight} kg<br />
                      <Text strong>Volume:</Text> {box.volume} m³<br />
                      <Text strong>Product:</Text> {box.product?.name || "N/A"}
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Text>No boxes found in this pallet</Text>
            )}
          </Spin>
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default Pallets;