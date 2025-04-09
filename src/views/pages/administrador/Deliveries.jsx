import React, { useEffect, useState, useMemo } from "react";
import { Table, Modal, Spin, Col, Button, Typography, Tag, message, QRCode, Tooltip, Select } from "antd";
import { EyeOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import axios from "axios";
import { 
  API_URL_ALL_DELIVERIES, 
  API_URL_EMPLOYEE, 
  API_URL_DRIVER, 
  API_URL_COMPANY,
  API_URL_GENERATE_QR,
  API_URL_CONFIRM_QR,
  authToken 
} from "../../../services/services";

const { Text, Title } = Typography;
const { Option } = Select;

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState(undefined);
  const [isQRModalVisible, setIsQRModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deliveriesResponse, employeesResponse, driversResponse, companiesResponse] = await Promise.all([
        axios.get(API_URL_ALL_DELIVERIES, { headers: { Authorization: authToken } }),
        axios.get(API_URL_EMPLOYEE, { headers: { Authorization: authToken } }),
        axios.get(API_URL_DRIVER, { headers: { Authorization: authToken } }),
        axios.get(API_URL_COMPANY, { headers: { Authorization: authToken } }),
      ]);

      const deliveriesData = deliveriesResponse.data.deliveries.sort((a, b) => {
        // Prioritize "Pending" status
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;

        // If both have the same status, sort by ID in descending order
        return b.id - a.id;
      });

      setDeliveries(deliveriesData);
      setEmployees(employeesResponse.data.employee || []);
      setDrivers(driversResponse.data.drivers || []);
      setCompanies(Array.isArray(companiesResponse.data.companies) ? companiesResponse.data.companies : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async (delivery) => {
    try {
      if (delivery.confirmation_code) {
        setSelectedDelivery(delivery);
        setIsQRModalVisible(true);
        return;
      }
  
      const response = await axios.post(
        API_URL_GENERATE_QR.replace('{delivery}', delivery.id),
        {},
        { headers: { Authorization: authToken } }
      );
  
      const { qr_code } = response.data;
  
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
      const response = await axios.post(
        API_URL_CONFIRM_QR,
        { confirmation_code: confirmationCode },
        { headers: { Authorization: authToken } }
      );
  
      if (response.data.status === "Delivered") {
        message.success("Delivery Confirmed successfully");
        setIsQRModalVisible(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      message.error("Failed to confirm delivery");
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((emp) => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown";
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : "N/A";
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setIsModalVisible(true);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleCompanyFilterChange = (value) => {
    setCompanyFilter(value);
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery) => {
      const statusMatch = !statusFilter || delivery.status === statusFilter;
      const companyMatch = !companyFilter || (delivery.company && delivery.company.id === companyFilter);
      return statusMatch && companyMatch;
    });
  }, [deliveries, statusFilter, companyFilter]);

  const formatDateTime = (dateTime, adjustHours = 0) => {
    if (!dateTime) return "N/A";
  
    const date = new Date(dateTime);
  
    if (isNaN(date.getTime())) return "Invalid Date";
  
    // Ajustar horas según el parámetro
    date.setHours(date.getHours() + adjustHours);
  
    // Formatear la fecha y hora
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
      render: (date) => formatDateTime(date, 7),
    },
    {
      title: "Completed Date",
      dataIndex: "completed_date",
      key: "completed_date",
      render: (date) => formatDateTime(date, -7),
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
      title: "Company",
      dataIndex: ["company", "name"],
      key: "company",
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
          {/* {record.status === "Pending" && (
            <Tooltip title="Generate QR">
              <Button
                icon={<QrcodeOutlined />}
                onClick={() => handleGenerateQR(record)}
              />
            </Tooltip>
          )} */}
        </div>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Deliveries">
        <Spin spinning={isLoading} tip="Loading deliveries...">
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
            <Select
              placeholder="Filter by Company"
              style={{ width: 160, marginLeft: "10px" }}
              onChange={handleCompanyFilterChange}
              value={companyFilter}
              allowClear
            >
              {Array.isArray(companies) &&
                companies.map((company) => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                ))}
            </Select>
          </Col>

          <Table
            dataSource={Array.isArray(filteredDeliveries) ? filteredDeliveries : []}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: "max-content" }}
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
              <Text><strong>Created By:</strong> {getEmployeeName(selectedDelivery.created_by)}</Text><br />
              <Text><strong>Truck:</strong> {selectedDelivery.truck?.plates || "N/A"}</Text><br />
              <Text><strong>Trailer:</strong> {selectedDelivery.trailer?.plates || "N/A"}</Text><br />
              <Text><strong>Driver:</strong> {getDriverName(selectedDelivery.truck?.driver_id)}</Text><br />
              <Text><strong>Shipping Date:</strong> {formatDateTime(selectedDelivery.shipping_date, 7)}</Text><br />
              <Text><strong>Completed Date:</strong> {formatDateTime(selectedDelivery.completed_date, -7)}</Text><br />
              <Text><strong>Estimated Arrival:</strong> {formatDateTime(selectedDelivery.estimated_arrival, 7)}</Text><br />
              <Text><strong>Origin:</strong> {selectedDelivery.origin?.name || "N/A"}</Text><br />
              <Text><strong>Destination:</strong> {selectedDelivery.destination?.name || "N/A"}</Text><br />
              <Text><strong>Company:</strong> {selectedDelivery.company?.name}</Text><br />
              <Text><strong>Status:</strong> {selectedDelivery.status || "N/A"}</Text><br />

              <Title level={4} style={{ marginTop: "20px", color: "#FF731D" }}>Pallets</Title>
              {selectedDelivery.delivery_details?.length > 0 ? (
                selectedDelivery.delivery_details.map((detail) => (
                  <div key={detail.id} style={{ marginBottom: "20px" }}>
                    <hr />
                    <Text strong>Pallet ID:</Text> {detail.pallet.id}<br />
                    <Text strong>Weight:</Text> {detail.pallet.weight} kg<br />
                    <Text strong>Volume:</Text> {detail.pallet.volume} m³<br />

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

        {/* QR Code Modal */}
        <Modal
          title="Receive Delivery"
          visible={isQRModalVisible}
          onCancel={() => setIsQRModalVisible(false)}
          footer={null}
          width={400}
        >
          {selectedDelivery && (
            <>
              <Title level={4}>Delivery #{selectedDelivery?.id}</Title>
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

export default Deliveries;