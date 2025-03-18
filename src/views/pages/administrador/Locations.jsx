import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined, EnvironmentOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_LOCATION, API_URL_COMPANY } from '../../../services/services';
const { Text } = Typography;
const api_key = 'AIzaSyD6ofawtDtTwx0UVN1Xj6Fr7l7drUFLQU4';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    company: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchLocations();
    fetchCompanies();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_LOCATION, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]); // Set locations to an empty array in case of error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
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
      setCompanies([]);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_LOCATION,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const selectedCompany = companies.find(company => company.id === formData.company);
      setLocations([...locations, { ...response.data.location, company: selectedCompany }]);
      message.success("Ubicación agregada correctamente");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error al agregar ubicación");
      console.error("Error adding location:", error);
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
      company: value,
    });
  };

  const handleEditLocation = (location) => {
    setCurrentLocation(location);
    setFormData({
      name: location.name || "",
      latitude: location.latitude || "",
      longitude: location.longitude || "",
      company: location.company ? location.company.id : null,
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_LOCATION}/${currentLocation.id}`,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedLocations = locations.map(location =>
        location.id === currentLocation.id ? { ...response.data.location, company: companies.find(company => company.id === formData.company) } : location
      );
      setLocations(updatedLocations);
      message.success("Ubicación actualizada correctamente");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error al actualizar ubicación");
      console.error("Error updating location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLocation = (location) => {
    setCurrentLocation(location);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL_LOCATION}/${currentLocation.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setLocations(locations.filter(location => location.id !== currentLocation.id));
      message.success("Ubicación eliminada correctamente");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error al eliminar ubicación");
      console.error("Error deleting location:", error);
    }
  };

  const handleViewMap = (location) => {
    setCurrentLocation(location);
    setIsMapModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      latitude: "",
      longitude: "",
      company: null,
    });
  };

  const filteredLocations = locations.filter((location) =>
    location.name ? location.name.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  // Columnas de la tabla
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Latitude", dataIndex: "latitude", key: "latitude" },
    { title: "Longitude", dataIndex: "longitude", key: "longitude" },
    { title: "Company", dataIndex: ["company", "name"], key: "company" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditLocation(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteLocation(record)} style={{ marginLeft: 8 }}>Delete</Button>
          <Button icon={<EnvironmentOutlined />} onClick={() => handleViewMap(record)} style={{ marginLeft: 8 }}>View Map</Button>
        </span>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Locations">

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
              Add Location
            </Button>
          </Col>
        </Row>

        {/* Tabla */}
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredLocations}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            loading={isLoading}
          />
        </div>

        {/* Modal de registro/edición */}
        <Modal
          title={isEditMode ? "Update Location" : "Add New Location"}
          visible={isModalVisible}
          onCancel={() => { setIsModalVisible(false); resetForm(); }}
          footer={null}
          width={400}
        >
          <form onSubmit={isEditMode ? handleUpdateLocation : handleAddLocation}>
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
                  name="latitude"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Input
                  name="longitude"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Select
                  placeholder="Company"
                  style={{ width: '100%' }}
                  value={formData.company}
                  onChange={handleSelectChange}
                  options={companies.map(company => ({
                    label: company.name,
                    value: company.id,
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
          title="Delete Location"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>
            ¿Are you sure you want to delete "<Text strong>{currentLocation?.name}</Text>"?
          </p>
        </Modal>

        {/* Modal de mapa */}
        <Modal
          title="Location Map"
          visible={isMapModalVisible}
          onCancel={() => setIsMapModalVisible(false)}
          footer={null}
          width={800}
        >
          <div style={{ height: '400px' }}>
            {currentLocation && (
              // eslint-disable-next-line jsx-a11y/iframe-has-title
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/view?key=${api_key}&center=${currentLocation.latitude},${currentLocation.longitude}&zoom=14`}
                allowFullScreen
              ></iframe>
            )}
          </div>
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default Locations;