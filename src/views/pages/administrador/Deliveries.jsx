import React, { useEffect, useState, useMemo } from "react";
import { Table, Modal, Spin, Col, Button, Typography, Tag, Tooltip, Select } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";
import axios from "axios";
import { API_URL_ALL_DELIVERIES, API_URL_EMPLOYEE, API_URL_DRIVER, API_URL_COMPANY, authToken } from "../../../services/services";

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

  useEffect(() => {
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
          const isAPriority = a.status === "Pending";
          const isBPriority = b.status === "Pending";
          return isAPriority && !isBPriority ? -1 : !isAPriority && isBPriority ? 1 : 0;
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

    fetchData();
  }, []);

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
        </div>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: "16px", margin: "5px" }}>
      <MainCard title="Deliveries">
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
              <Text><strong>Shipping Date:</strong> {formatDateTime(selectedDelivery.shipping_date)}</Text><br />
              <Text><strong>Completed Date:</strong> {formatDateTime(selectedDelivery.completed_date)}</Text><br />
              <Text><strong>Estimated Arrival:</strong> {formatDateTime(selectedDelivery.estimated_arrival)}</Text><br />
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
      </MainCard>
    </Paper>
  );
};

export default Deliveries;