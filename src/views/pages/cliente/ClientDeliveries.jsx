import React, { useEffect, useState } from "react";
import { Table, Modal, Col, Spin, Button, Typography, Tag, message, QRCode, Tooltip, Select } from "antd";
import { EyeOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import axios from "axios";
import { 
  API_URL_DELIVERY, 
  API_URL_COMPANY, 
  API_URL_DELIVERIES_COMPANY,
  API_URL_DRIVER,
  API_URL_GENERATE_QR,
  API_URL_CONFIRM_QR,
  authToken 
} from "../../../services/services";

const { Text, Title } = Typography;
const { Option } = Select;

const ClientDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchDeliveries();
    fetchDrivers();
  }, []);

  const fetchDeliveries = async () => {
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
  
      const response = await axios.get(API_URL_DELIVERIES_COMPANY, {
        headers: { Authorization: authToken },
        params: { company_id: company.id },
      });
  
      const deliveriesData = response.data.deliveries;
      const sortedDeliveries = deliveriesData.sort((a, b) => {
        const isAPriority =
          a.status === "Pending" &&
          (a.type === "warehouse_to_location" || a.type === "location_to_location");
        const isBPriority =
          b.status === "Pending" &&
          (b.type === "warehouse_to_location" || b.type === "location_to_location");
  
        if (isAPriority && !isBPriority) return -1;
        if (!isAPriority && isBPriority) return 1;
        return 0;
      });
  
      setDeliveries(sortedDeliveries);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(API_URL_DRIVER, {
        headers: { Authorization: authToken },
      });
      setDrivers(response.data.drivers || []);
    } catch (error) {
      message.error("Error fetching drivers");
      console.error("Error fetching drivers:", error);
    }
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : "N/A";
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setIsModalVisible(true);
  };

  const handleGenerateQR = async (delivery) => {
    try {
      if (delivery.confirmation_code) {
        console.log("QR code already exists:", delivery.confirmation_code);
        setSelectedDelivery(delivery);
        setIsQRModalVisible(true);
        return;
      }
  
      console.log("Generating QR code for delivery ID:", delivery.id);
  
      const response = await axios.post(
        API_URL_GENERATE_QR.replace('{delivery}', delivery.id),
        {},
        { headers: { Authorization: authToken } }
      );
  
      const { qr_code } = response.data;
      console.log("QR code generated successfully:", qr_code);
  
      setDeliveries((prevDeliveries) =>
        prevDeliveries.map((d) =>
          d.id === delivery.id ? { ...d, confirmation_code: qr_code } : d
        )
      );
  
      setSelectedDelivery({ ...delivery, confirmation_code: qr_code });
      setIsQRModalVisible(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      message.error("Failed to generate QR code");
    }
  };

  const handleQRScanned = async (confirmationCode) => {
    try {
      console.log("Sending confirmation code:", confirmationCode);
  
      const response = await axios.post(
        API_URL_CONFIRM_QR,
        { confirmation_code: confirmationCode },
        { headers: { Authorization: authToken } }
      );
  
      if (response.data.status === "Delivered") {
        console.log("Delivery confirmed successfully:", response.data);
        message.success("Delivery Confirmed successfully");
        setIsQRModalVisible(false);
        fetchDeliveries();
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      message.error("Failed to confirm delivery");
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    if (!statusFilter) return true;
    return delivery.status === statusFilter;
  });

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
  
    if (isNaN(date.getTime())) return "Invalid Date";
  
    date.setHours(date.getHours() - 7);
  
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "id",
      key: "id",
      render: (id) => `Delivery #${id}`,
    },
    {
      title: "Shipping Date",
      dataIndex: "shipping_date",
      key: "shipping_date",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Completed Date",
      dataIndex: "completed_date",
      key: "completed_date",
      render: (date) => formatDateTime(date),
    },
    {
      title: "Origin",
      dataIndex: ["origin", "name"],
      key: "origin",
    },
    {
      title: "Destination",
      dataIndex: ["destination", "name"],
      key: "destination",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color;
        if (status === "Pending") {
          color = "orange";
        } else if (status === "Docking") {
          color = "blue";
        } else if (status === "Delivering") {
          color = "green";
        } else if (status === "Loading") {
          color = "cyan";
        } else if (status === "Emptying") {
          color = "purple";
        } else {
          color = "default";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="See Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === "Pending" &&
            (record.type === "warehouse_to_location" || record.type === "location_to_location") && (
              <Tooltip title="Generate QR">
                <Button
                  icon={<QrcodeOutlined />}
                  onClick={() => handleGenerateQR(record)}
                />
              </Tooltip>
            )}
        </div>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Your Deliveries">
        <Spin spinning={isLoading}>
          <Col xs={24}>
            <Select
              placeholder="Filter by Status"
              style={{ width: 150, marginBottom: "20px" }}
              onChange={handleStatusFilterChange}
              allowClear
            >
              <Option value="Docking">Docking</Option>
              <Option value="Emptying">Emptying</Option>
              <Option value="Delivered">Delivered</Option>
              <Option value="Delivering">Delivering</Option>
              <Option value="Loading">Loading</Option>
              <Option value="Pending">Pending</Option>
            </Select>
          </Col>
          <Table
            dataSource={Array.isArray(filteredDeliveries) ? filteredDeliveries : []}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>

        <Modal
          title={"Delivery Details"}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={400}
          style={{ marginTop: "-50px" }}
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          {selectedDelivery ? (
            <div>
              <Title level={4}>
                <span style={{ color: "#FF731D" }}>General Information -</span> Delivery #{selectedDelivery?.id}
              </Title>
              {/* <Text><strong>Created By:</strong> {selectedDelivery.created_by || "N/A"}</Text><br /> */}
              <Text><strong>Truck:</strong> {selectedDelivery.truck?.plates || "N/A"}</Text><br />
              <Text><strong>Trailer:</strong> {selectedDelivery.trailer?.plates || "N/A"}</Text><br />
              <Text><strong>Driver:</strong> {getDriverName(selectedDelivery.truck?.driver_id)}</Text><br />
              <Text><strong>Shipping Date:</strong> {formatDateTime(selectedDelivery.shipping_date)}</Text><br />
              <Text><strong>Completed Date:</strong> {formatDateTime(selectedDelivery.completed_date)}</Text><br />
              <Text><strong>Estimated Arrival:</strong> {formatDateTime(selectedDelivery.estimated_arrival)}</Text><br />
              <Text><strong>Origin:</strong> {selectedDelivery.origin?.name || "N/A"}</Text><br />
              <Text><strong>Destination:</strong> {selectedDelivery.destination?.name || "N/A"}</Text><br />
              <Text><strong>Status:</strong> {selectedDelivery.status || "N/A"}</Text><br />

              <Title level={4} style={{ marginTop: "20px", color: "#FF731D" }}>Pallets</Title>
              {selectedDelivery.delivery_details?.length > 0 ? (
                selectedDelivery.delivery_details.map((detail) => (
                  <div key={detail.id} style={{ marginBottom: "20px" }}>
                    <hr />
                    <Text strong>Pallet ID:</Text> {detail.pallet.id}<br />
                    <Text strong>Weight:</Text> {detail.pallet.weight} kg<br />
                    <Text strong>Volume:</Text> {detail.pallet.volume} m³<br />
                    {/* <Text strong>Status:</Text> {detail.pallet.status}<br />
                    <Text strong>Verified:</Text> {detail.pallet.verified ? "Yes" : "No"}<br /> */}

                    <Title level={5} style={{ marginTop: "10px" }}>Boxes:</Title>
                    {detail.pallet.box_inventories?.length > 0 ? (
                      detail.pallet.box_inventories.map((box) => (
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
                      <Text>No boxes found for this pallet.</Text>
                    )}
                  </div>
                ))
              ) : (
                <Text>No pallets found for this delivery.</Text>
              )}
            </div>
          ) : (
            <Text>No details available.</Text>
          )}
        </Modal>

        {/* QR Modal */}
        <Modal
          title="Receive Delivery"
          visible={isQRModalVisible}
          onCancel={() => setIsQRModalVisible(false)}
          footer={null}
          width={400}
        >
          {selectedDelivery && (
            <>
              <Title level={4}>
                {/* <span style={{ color: "#FF731D" }}>Delivery</span> #{selectedDelivery?.id} */}
                Delivery #{selectedDelivery?.id}
              </Title>
              <Text>
                <strong>Origin:</strong> {selectedDelivery.origin?.name || "N/A"}
              </Text>
              <br />
              <Text>
                <strong>Destination:</strong> {selectedDelivery.destination?.name || "N/A"}
              </Text>
              <br />
              <Title level={4} style={{ marginTop: "20px" }}>
                Scan this QR to receive the delivery:
              </Title>
              <QRCode
                value={selectedDelivery.confirmation_code || "N/A"}
                size={250}
                style={{ marginTop: "20px" }}
              />
              <br />
              <Button
                type="primary"
                style={{ marginTop: "20px" }}
                onClick={() => handleQRScanned(selectedDelivery.confirmation_code)}
              >
                Simulate QR Scan
              </Button>
            </>
          )}
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default ClientDeliveries;