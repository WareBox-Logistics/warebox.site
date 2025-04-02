import React, { useEffect, useState } from "react";
import { Table, Modal, Spin, Button, Typography, Tag } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import axios from "axios";
import {
  API_URL_DELIVERY,
  API_URL_COMPANY,
  API_URL_DELIVERY_DETAIL,
  API_URL_BOX_INVENTORY,
  API_URL_EMPLOYEE,
  API_URL_DRIVER,
  authToken,
} from "../../../services/services";

const { Text, Title } = Typography;

const ClientDeliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryDetails, setDeliveryDetails] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [clientCompany, setClientCompany] = useState(null);

  useEffect(() => {
    fetchClientCompany();
    fetchEmployees();
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (clientCompany) {
      fetchDeliveries();
    }
  }, [clientCompany]);

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

      setClientCompany(company);
    } catch (error) {
      console.error("Error fetching client company:", error);
    }
  };

  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const [deliveryResponse, deliveryDetailResponse] = await Promise.all([
        axios.get(API_URL_DELIVERY, { headers: { Authorization: authToken } }),
        axios.get(API_URL_DELIVERY_DETAIL, { headers: { Authorization: authToken } }),
      ]);

      const deliveriesData = Array.isArray(deliveryResponse.data)
        ? deliveryResponse.data.filter((delivery) => delivery.company?.id === clientCompany.id)
        : deliveryResponse.data.data.filter((delivery) => delivery.company?.id === clientCompany.id);

      setDeliveries(deliveriesData);
      setDeliveryDetails(deliveryDetailResponse.data.details || []);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_URL_EMPLOYEE, {
        headers: { Authorization: authToken },
      });
      setEmployees(response.data.employee || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(API_URL_DRIVER, {
        headers: { Authorization: authToken },
      });
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchBoxesForPallets = async (palletIds) => {
    try {
      const response = await axios.get(API_URL_BOX_INVENTORY, {
        headers: { Authorization: authToken },
      });
      const boxes = response.data.boxes || [];
      return boxes.filter((box) => palletIds.includes(box.pallet.id));
    } catch (error) {
      console.error("Error fetching boxes:", error);
      return [];
    }
  };

  const handleViewDetails = async (delivery) => {
    setSelectedDelivery(null);
    setIsLoadingDetails(true);
    setIsModalVisible(true);

    try {
      const employee = employees.find((emp) => emp.id === delivery.created_by);
      const employeeName = employee ? `${employee.first_name} ${employee.last_name}` : "Unknown";

      const driver = delivery.truck?.driver_id
        ? drivers.find((drv) => drv.id === delivery.truck.driver_id)
        : null;
      const driverName = driver ? `${driver.first_name} ${driver.last_name}` : "Unknown";

      const pallets = deliveryDetails
        .filter((detail) => detail.delivery === delivery.id)
        .map((detail) => detail.pallet);

      const boxes = await fetchBoxesForPallets(pallets);

      setSelectedDelivery({
        ...delivery,
        employeeName: employeeName || "Unknown",
        driverName: driverName || "Unknown",
        pallets: pallets || [],
        boxes: boxes || [],
      });
    } catch (error) {
      console.error("Error fetching delivery details:", error);
      setSelectedDelivery(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "N/A";
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) return "Invalid Date";
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
        } else if (status === "Shipping" || status === "Delivering") {
          color = "green";
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
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          See Details
        </Button>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Deliveries">
        <Spin spinning={isLoading}>
          <Table
            dataSource={Array.isArray(deliveries) ? deliveries : []}
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
        >
          {isLoadingDetails ? (
            <Spin spinning={isLoadingDetails} tip="Loading details..." />
          ) : selectedDelivery ? (
            <div>
              <Title level={4}><span style={{ color: "#FF731D" }}>General Information -</span> Delivery #{selectedDelivery?.id}</Title>
              <Text><strong>Created By:</strong> {selectedDelivery.employeeName || "N/A"}</Text><br />
              <Text><strong>Truck:</strong> {selectedDelivery.truck?.plates || "N/A"}</Text><br />
              <Text><strong>Driver:</strong> {selectedDelivery.driverName || "N/A"}</Text><br />
              <Text><strong>Shipping Date:</strong> {formatDateTime(selectedDelivery.shipping_date)}</Text><br />
              <Text><strong>Completed Date:</strong> {formatDateTime(selectedDelivery.completed_date)}</Text><br />
              <Text><strong>Estimated Arrival:</strong> {formatDateTime(selectedDelivery.estimated_arrival)}</Text><br />
              <Text><strong>Origin:</strong> {selectedDelivery.origin?.name || "N/A"}</Text><br />
              <Text><strong>Destination:</strong> {selectedDelivery.destination?.name || "N/A"}</Text><br />
              <Text><strong>Status:</strong> {selectedDelivery.status || "N/A"}</Text><br />
              <Title level={4} style={{ marginTop: "20px", color: "#FF731D" }}>
                Pallets
              </Title>
              {selectedDelivery.pallets.length > 0 ? (
                selectedDelivery.pallets.map((palletId) => (
                  <div key={palletId}>
                    <Text strong>Pallet ID:</Text> {palletId}
                    <br />
                    <Text strong>Boxes:</Text>
                    <ul>
                      {selectedDelivery.boxes
                        .filter((box) => box.pallet.id === palletId)
                        .map((box) => (
                          <li key={box.id}>
                            <Text>
                              Product: {box.product?.name || "N/A"} - Qty: {box.qty}
                            </Text>
                          </li>
                        ))}
                    </ul>
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
      </MainCard>
    </Paper>
  );
};

export default ClientDeliveries;