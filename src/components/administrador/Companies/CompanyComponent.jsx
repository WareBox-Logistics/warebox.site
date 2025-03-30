import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_COMPANY, API_URL_SERVICE } from '../../../services/services';
const { Text } = Typography;

const CompanyComponent = () => {
  const [companies, setCompanies] = useState([]);
  const [services, setServices] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    rfc: "",
    email: "",
    phone: "",
    service: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchCompanies();
    fetchServices();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_COMPANY, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]); // Set companies to an empty array in case of error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(API_URL_SERVICE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_COMPANY,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const selectedService = services.find(service => service.id === formData.service);
      setCompanies([...companies, { ...response.data.company, service: selectedService }]);
      message.success("Empresa agregada correctamente");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error al agregar empresa");
      console.error("Error adding company:", error);
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

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      service: value,
    });
  };

  const handleEditCompany = (company) => {
    setCurrentCompany(company);
    setFormData({
      name: company.name || "",
      rfc: company.rfc || "",
      email: company.email || "",
      phone: company.phone || "",
      service: company.service ? company.service.id : null,
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_COMPANY}/${currentCompany.id}`,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedCompanies = companies.map(company =>
        company.id === currentCompany.id ? { ...response.data.company, service: services.find(service => service.id === formData.service) } : company
      );
      setCompanies(updatedCompanies);
      message.success("Empresa actualizada correctamente");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error al actualizar empresa");
      console.error("Error updating company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = (company) => {
    setCurrentCompany(company);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL_COMPANY}/${currentCompany.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setCompanies(companies.filter(company => company.id !== currentCompany.id));
      message.success("Empresa eliminada correctamente");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error al eliminar empresa");
      console.error("Error deleting company:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      rfc: "",
      email: "",
      phone: "",
      service: null,
    });
  };

  const filteredCompanies = companies.filter((company) =>
    company.name ? company.name.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  // Columnas de la tabla
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "RFC", dataIndex: "rfc", key: "rfc" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "Service", dataIndex: ["service", "type"], key: "service" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditCompany(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteCompany(record)} style={{ marginLeft: 8 }}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <div>
        {/* Buscador y botón de agregar */}
        <Row justify="space-between" align="middle" style={{ marginTop: 20, marginBottom: 10 }}>
          <Col>
            <Input
              style={{ width: "100%", maxWidth: 300 }}
              prefix={<SearchOutlined />}
              placeholder="Search by name"
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col>
            <Button 
              type="primary" 
              onClick={() => { setIsModalVisible(true); setIsEditMode(false); }}
              // style={{ backgroundColor: '#FF731D', borderColor: '#FF731D' }}
              // onMouseEnter={(e) => e.target.style.backgroundColor = '#FF4500'}
              // onMouseLeave={(e) => e.target.style.backgroundColor = '#FF731D' }}
            >
              Add Company
            </Button>
          </Col>
        </Row>

        {/* Tabla */}
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredCompanies}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            loading={isLoading}
          />
        </div>

        {/* Modal de registro/edición */}
        <Modal
          title={isEditMode ? "Update Company" : "Add New Company"}
          visible={isModalVisible}
          onCancel={() => { setIsModalVisible(false); resetForm(); }}
          footer={null}
          width={400}
          // mask={true}
          // maskStyle={{ zIndex: 1000 }}
        >
          <form onSubmit={isEditMode ? handleUpdateCompany : handleAddCompany}>
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Input
                  name="rfc"
                  placeholder="RFC"
                  value={formData.rfc}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Select
                  placeholder="Service"
                  style={{ width: '100%' }}
                  value={formData.service}
                  onChange={handleSelectChange}
                  options={services.map(service => ({
                    label: service.type,
                    value: service.id,
                  }))}
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
          title="Delete Company"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>
            ¿Are you sure you want to delete "<Text strong>{currentCompany?.name}</Text>"?
          </p>
        </Modal>
    </div>
  );
};

export default CompanyComponent;