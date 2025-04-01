import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Typography, Spin, Modal, Tag, Empty } from "antd";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import { HomeOutlined, CodepenOutlined } from "@ant-design/icons";
import axios from 'axios';
import { API_URL_PALLET, API_URL_COMPANY, API_URL_BOX_INVENTORY, authToken } from '../../../services/services';

const { Title, Text } = Typography;

const ClientPallets = () => {
  const [pallets, setPallets] = useState([]);
  const [filteredPallets, setFilteredPallets] = useState([]);
  const [isLoadingPallets, setIsLoadingPallets] = useState(true);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(false);
  const [selectedPallet, setSelectedPallet] = useState(null);
  const [boxInventory, setBoxInventory] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [clientCompany, setClientCompany] = useState(null);
  const [palletsLoaded, setPalletsLoaded] = useState(false);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    fetchClientCompany();
  }, []);

  const fetchClientCompany = async () => {
    try {
      const clientName = localStorage.getItem("first_name");
      console.log("Client Name from localStorage:", clientName); // Log para depurar

      if (!clientName) {
        throw new Error("Client name not found in localStorage");
      }

      const companyResponse = await axios.get(API_URL_COMPANY, {
        headers: { Authorization: authToken },
      });
      // console.log("Companies fetched:", companyResponse.data.companies); // Log para depurar

      const company = companyResponse.data.companies.find(company => company.name === clientName);
      console.log("Client Company found:", company); // Log para depurar

      if (!company) {
        throw new Error("No company found for the client");
      }

      setClientCompany(company);
    } catch (error) {
      console.error("Error fetching client company:", error);
    }
  };

  const fetchClientPallets = async () => {
    if (!clientCompany || palletsLoaded) return;
  
    setIsLoadingPallets(true);
    try {
      const palletResponse = await axios.get(API_URL_PALLET, {
        headers: { Authorization: authToken },
      });
      // console.log("Pallets fetched:", palletResponse.data.pallets); // Log para depurar
  
      const fetchedPallets = palletResponse.data.pallets.filter(pallet => pallet.company?.id === clientCompany.id);
      console.log("Filtered Pallets for Client Company:", fetchedPallets); // Log para depurar
  
      setPallets(fetchedPallets);
      setFilteredPallets(fetchedPallets);
      setPalletsLoaded(true);
    } catch (error) {
      console.error("Error fetching client pallets:", error);
    } finally {
      setIsLoadingPallets(false);
    }
  };

  useEffect(() => {
    if (clientCompany && !palletsLoaded) {
      fetchClientPallets();
    }
  }, [clientCompany, palletsLoaded]);

  const fetchBoxInventory = async (palletId) => {
    setIsLoadingBoxes(true);
    try {
      const response = await axios.get(`${API_URL_BOX_INVENTORY}`, {
        headers: { Authorization: authToken },
        params: { pallet_id: palletId },
      });
  
      const filteredBoxes = response.data.boxes.filter(box => box.pallet && box.pallet.id === palletId);
      console.log("Boxes for selected pallet:", filteredBoxes); // Log para depurar
  
      setBoxInventory(filteredBoxes);
    } catch (error) {
      console.error("Error fetching box inventory:", error);
    } finally {
      setIsLoadingBoxes(false);
    }
  };


  const getStatusTag = (status) => {
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
    return boxInventory.filter(box => box.pallet?.id === palletId).length;
  };

  const handleCardClick = (pallet) => {
    setSelectedPallet(pallet);
    setIsModalVisible(true);
    fetchBoxInventory(pallet.id);
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

  
  const renderPalletCards = () => {
    console.log("Filtered Pallets to Render:", filteredPallets);

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
          <Title level={4} style={{ marginBottom: "16px", paddingLeft: "16px", color: "#FF731D" }}>
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
                        <strong>Weight:</strong> {pallet.weight || "0"} kg
                      </Text>
                      <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Volume:</strong> {pallet.volume || "0"} m³
                      </Text>
                      {/* <Text style={{ display: 'block', fontSize: '16px' }}>
                        <strong>Boxes:</strong> {getBoxCountForPallet(pallet.id)}
                      </Text> */}
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
      <MainCard title="Pallets">
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
              <>
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
                <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                  Total boxes: {boxInventory.length}
                </div>
              </>
            ) : (
              <Text>No boxes found in this pallet</Text>
            )}
          </Spin>
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default ClientPallets;