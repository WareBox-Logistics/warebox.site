import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_SERVICE } from '../../../services/services';
const { Text } = Typography;

const ServiceComponent = ({ updateServices }) => {
  const [services, setServices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_SERVICE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setServices(response.data.services || []);
      updateServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_SERVICE,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedServices = [...services, response.data.service];
      setServices(updatedServices);
      updateServices(updatedServices);
      message.success("Service added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding service");
      console.error("Error adding service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEditService = (service) => {
    setCurrentService(service);
    setFormData({
      type: service.type || "",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_SERVICE}/${currentService.id}`,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedServices = services.map(service =>
        service.id === currentService.id ? response.data.service : service
      );
      setServices(updatedServices);
      updateServices(updatedServices);
      message.success("Service updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating service");
      console.error("Error updating service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = (service) => {
    setCurrentService(service);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL_SERVICE}/${currentService.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      const updatedServices = services.filter((service) => service.id !== currentService.id);
      setServices(updatedServices);
      updateServices(updatedServices);
      message.success("Service deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting service");
      console.error("Error deleting service:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
    });
  };

  const filteredServices = services.filter((service) =>
    service && service.type ? service.type.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  // Columnas de la tabla
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditService(record)}>Edit</Button>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteService(record)}
            style={{ marginLeft: 8 }}
            color='red'
            variant='outlined'
          >
            Delete
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div>
        {/* Buscador y botón de agregar */}
        <Row justify="space-between" align="middle" style={{ marginTop: 20, marginBottom: 10 }}>
            <Col>
              <Typography.Title level={4} style={{ margin: 0 }}>
                Services
              </Typography.Title>
            </Col>
          <Col>
            <Input
              style={{ width: "100%", maxWidth: 300 }}
              prefix={<SearchOutlined />}
              placeholder="Search by type"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col>
            <Button 
              type="primary" 
              onClick={() => { setIsModalVisible(true); setIsEditMode(false); }}
            //   style={{ backgroundColor: '#FF731D', borderColor: '#FF731D' }}
            //   onMouseEnter={(e) => e.target.style.backgroundColor = '#FF4500'}
            //   onMouseLeave={(e) => e.target.style.backgroundColor = '#FF731D' }}
            >
              Add Service
            </Button>
          </Col>
        </Row>

        {/* Tabla */}
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredServices}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            loading={isLoading}
          />
        </div>

        {/* Modal de registro/edición */}
        <Modal
          title={isEditMode ? "Update Service" : "Add New Service"}
          visible={isModalVisible}
          onCancel={() => { setIsModalVisible(false); resetForm(); }}
          footer={null}
          width={400}
        >
          <form onSubmit={isEditMode ? handleUpdateService : handleAddService}>
            <Row gutter={[16, 16]}>
              {isEditMode && (
                <Col xs={24}>
                  <Input
                    name="id"
                    placeholder="ID"
                    value={currentService.id}
                    disabled
                    style={{ width: '100%' }}
                  />
                </Col>
              )}
              <Col xs={24}>
                <Input
                  name="type"
                  placeholder="Type"
                  value={formData.type}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                  icon={
                    isSubmitting ? (
                      <Spin
                        indicator={
                          <LoadingOutlined spin style={{ color: "white" }} />
                        }
                      />
                    ) : (
                      <UserAddOutlined />
                    )
                  }
                  block
                >
                  {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add"}
                </Button>
              </Col>
            </Row>
          </form>
        </Modal>

        {/* Modal de eliminación */}
        <Modal
          title="Delete Service"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>
            ¿Are you sure you want to delete "<Text strong>{currentService?.type}</Text>"?
          </p>
        </Modal>
    </div>
  );
};

export default ServiceComponent;