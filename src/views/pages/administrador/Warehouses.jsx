import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Typography, Modal, Spin, Select, message, Checkbox } from "antd";
import { 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  HomeOutlined,
  EyeOutlined
} from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_WAREHOUSE, API_URL_LOCATION } from '../../../services/services';
import blueDot from "../../../assets/images/icons/blue-dot.png";
import redDot from "../../../assets/images/icons/red-dot.png";

const { Text, Title } = Typography;

const mapContainerStyle = {
  height: '75vh',
  width: '100%',
  borderRadius: '10px',
};

const defaultCenter = { lat: 32.462986, lng: -116.958970 };

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    id_routing_net: null,
    source: null,
    target: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const [activeWarehouseId, setActiveWarehouseId] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showWarehouses, setShowWarehouses] = useState(true);
  const [showLocations, setShowLocations] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [isInfoWindowVisible, setIsInfoWindowVisible] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchWarehouses();
    fetchLocations();
  }, []);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_WAREHOUSE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setWarehouses(response.data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setWarehouses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(API_URL_LOCATION, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMarkerClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setActiveWarehouseId(null);
  };

  const handleCardClick = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setActiveWarehouseId(null);

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(warehouse.latitude),
        lng: parseFloat(warehouse.longitude),
      });

      if (isZoomed) {
        mapRef.current.setZoom(11);
        setIsZoomed(false);
      }
    }
  };

  const handleViewWarehouse = (warehouse) => {
    if (activeWarehouseId === warehouse.id) {
      mapRef.current.panTo(defaultCenter);
      mapRef.current.setZoom(11);
      setActiveWarehouseId(null);
    } else {
      setSelectedWarehouse(warehouse);
      if (mapRef.current) {
        mapRef.current.panTo({
          lat: parseFloat(warehouse.latitude),
          lng: parseFloat(warehouse.longitude),
        });
        mapRef.current.setZoom(15);
        setIsZoomed(true);
      }
      setActiveWarehouseId(warehouse.id);
    }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const payload = {
      name: formData.name,
      latitude: formData.latitude,
      longitude: formData.longitude,
      id_routing_net: formData.id_routing_net || null,
      source: formData.source || null,
      target: formData.target || null,
    };

    try {
      const response = await axios.post(API_URL_WAREHOUSE, payload, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      setWarehouses([...warehouses, response.data.warehouse]);
      message.success("Warehouse added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding warehouse");
      console.error("Error adding warehouse:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditWarehouse = (warehouse) => {
    setCurrentWarehouse(warehouse);
    setFormData({
      name: warehouse.name || "",
      latitude: warehouse.latitude || "",
      longitude: warehouse.longitude || "",
      id_routing_net: warehouse.id_routing_net || null,
      source: warehouse.source || null,
      target: warehouse.target || null,
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_WAREHOUSE}/${currentWarehouse.id}`, {
        ...formData,
        id_routing_net: formData.id_routing_net || null,
        source: formData.source || null,
        target: formData.target || null,
      },
      {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      const updatedWarehouses = warehouses.map(warehouse =>
        warehouse.id === currentWarehouse.id
          ? response.data.warehouse
          : warehouse
      );
      setWarehouses(updatedWarehouses);
      message.success("Warehouse updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating warehouse");
      console.error("Error updating warehouse:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarehouse = (warehouse) => {
    setCurrentWarehouse(warehouse);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL_WAREHOUSE}/${currentWarehouse.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setWarehouses(warehouses.filter(warehouse => warehouse.id !== currentWarehouse.id));
      message.success("Warehouse deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting warehouse");
      console.error("Error deleting warehouse:", error);
    }
  };

  const handleMouseOver = (marker) => {
    setHoveredMarker(marker);
    setIsInfoWindowVisible(true);
  };

  const handleMouseOut = () => {
    setTimeout(() => {
      setIsInfoWindowVisible(false);
    }, 50);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      latitude: "",
      longitude: "",
      id_routing_net: null,
      source: null,
      target: null,
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    resetForm();
    setShowWarehouses(false);
    setShowLocations(false);
  };

  const filteredWarehouses = warehouses.filter((warehouse) =>
    warehouse.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;



  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Warehouses">
        {/* Buscador y botón de agregar */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>
              View warehouses
            </Typography.Title>
          </Col>
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
            >
              Add Warehouse
            </Button>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* Mapa */}
          <Col span={15}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={11}
              center={defaultCenter}
              onLoad={(map) => (mapRef.current = map)}
              options={{
                gestureHandling: 'greedy',
                disableDefaultUI: false,
              }}
            >
              {filteredWarehouses.map((warehouse) => (
                <Marker
                  key={warehouse.id}
                  position={{
                    lat: parseFloat(warehouse.latitude),
                    lng: parseFloat(warehouse.longitude),
                  }}
                  onClick={() => handleMarkerClick(warehouse)}
                  icon={{
                    url: selectedWarehouse?.id === warehouse.id
                      ? blueDot
                      : redDot,
                  }}
                />
              ))}
            </GoogleMap>
          </Col>

          {/* Cards */}
          <Col span={9} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <Spin spinning={isLoading} tip="Loading warehouses..." style={{ marginTop: '30px' }}>
              {filteredWarehouses.map((warehouse) => (
                <Card
                  key={warehouse.id}
                  hoverable
                  style={{
                    marginBottom: '10px',
                    border: selectedWarehouse?.id === warehouse.id ? '2px solid #FF731D' : '1px solid #f0f0f0',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  onClick={() => handleCardClick(warehouse)}
                >
                  <Row justify="space-between" align="middle" style={{ gap: '12px' }}>
                    <Col>
                      <HomeOutlined style={{ fontSize: '36px', marginRight: '12px', color: '#FF731D' }} />
                    </Col>
                    <Col flex="auto" style={{ maxWidth: '70%' }}>
                      <Title level={4} style={{ margin: 0, fontSize: '22px', wordWrap: 'break-word', wordBreak: 'break-word' }}>{warehouse.name}</Title>
                      <Text style={{ fontSize: '16px', display: 'block', marginTop: '8px' }}>
                        <span style={{ color: 'gray' }}>Latitude:</span> {warehouse.latitude || "N/A"}
                      </Text>
                      <Text style={{ fontSize: '16px', display: 'block', marginTop: '4px' }}>
                        <span style={{ color: 'gray' }}>Longitude:</span> {warehouse.longitude || "N/A"}
                      </Text>
                    </Col>
                    <Col style={{ maxWidth: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Button 
                          type="default" 
                          icon={<EyeOutlined />} 
                          style={{ 
                            fontSize: '16px', 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            backgroundColor: activeWarehouseId === warehouse.id ? '#1890ff' : 'transparent',
                            color: activeWarehouseId === warehouse.id ? '#fff' : 'inherit',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewWarehouse(warehouse);
                          }} 
                        />
                        <Button 
                          type="default" 
                          icon={<EditOutlined />} 
                          style={{ fontSize: '16px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          onClick={() => handleEditWarehouse(warehouse)} 
                        />
                        <Button 
                          type="default" 
                          icon={<DeleteOutlined />} 
                          style={{ fontSize: '16px', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                          onClick={() => handleDeleteWarehouse(warehouse)} 
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Spin>
          </Col>
        </Row>

        {/* Modal de registro/edición */}
        <Modal
          title={isEditMode ? "Update Warehouse" : "Add Warehouse"}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={1000}
        >
          <Row gutter={[16, 16]}>
            {/* Mapa a la izquierda */}
            <Col span={16}>
              <GoogleMap
                mapContainerStyle={{ height: '500px', width: '100%', borderRadius: '10px' }}
                zoom={isEditMode ? 15 : 11}
                center={
                  isEditMode && formData.latitude && formData.longitude
                    ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
                    : defaultCenter
                }
                options={{
                  gestureHandling: 'greedy',
                  disableDefaultUI: false,
                }}
                onClick={(e) => {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setFormData({
                    ...formData,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                  });
                }}
              >

                {/* Mostrar marcadores de Warehouses */}
                {showWarehouses &&
                  warehouses.map((warehouse) => (
                    <Marker
                      key={`warehouse-${warehouse.id}`}
                      position={{
                        lat: parseFloat(warehouse.latitude),
                        lng: parseFloat(warehouse.longitude),
                      }}
                      icon={{ url: redDot }}
                      onMouseOver={() =>
                        handleMouseOver({
                          position: {
                            lat: parseFloat(warehouse.latitude),
                            lng: parseFloat(warehouse.longitude),
                          },
                          name: warehouse.name,
                          type: "Warehouse",
                        })
                      }
                      onMouseOut={handleMouseOut}
                    />
                  ))}

                {/* Mostrar marcadores de Locations */}
                {showLocations &&
                  locations.map((location) => (
                    <Marker
                      key={`location-${location.id}`}
                      position={{
                        lat: parseFloat(location.latitude),
                        lng: parseFloat(location.longitude),
                      }}
                      icon={{ url: blueDot }}
                      onMouseOver={() =>
                        handleMouseOver({
                          position: {
                            lat: parseFloat(location.latitude),
                            lng: parseFloat(location.longitude),
                          },
                          name: location.name,
                          type: "Location",
                        })
                      }
                      onMouseOut={handleMouseOut}
                    />
                  ))}

                {/* InfoWindow para mostrar información del marcador */}
                {hoveredMarker && isInfoWindowVisible && (
                  <InfoWindow
                    position={hoveredMarker.position}
                    onCloseClick={() => setIsInfoWindowVisible(false)}
                    options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
                  >
                      <div
                        onMouseEnter={() => setIsInfoWindowVisible(true)}
                        onMouseLeave={handleMouseOut}
                      >
                        <strong>{hoveredMarker.name}</strong>
                        <br />
                        <small>{hoveredMarker.type}</small>
                      </div>
                  </InfoWindow>
                )}

                {/* Marker para la ubicación seleccionada */}
                {formData.latitude && formData.longitude && (
                  <Marker
                    position={{
                      lat: parseFloat(formData.latitude),
                      lng: parseFloat(formData.longitude),
                    }}
                  />
                )}
              </GoogleMap>
            </Col>

            {/* Formulario a la derecha */}
            <Col span={8}>
              <Typography.Title level={5} style={{ marginBottom: '20px', marginTop: '-8px' }}>
                Select a place on the map to add a new location:
              </Typography.Title>
              <form onSubmit={isEditMode ? handleUpdateWarehouse : handleAddWarehouse}>
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
                      readOnly
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col xs={24}>
                    <Input
                      name="longitude"
                      placeholder="Longitude"
                      value={formData.longitude}
                      readOnly
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col xs={24}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={isSubmitting}
                      block
                    >
                      {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add"}
                    </Button>
                  </Col>

                  {/* Checkboxes para mostrar Locations y Warehouses */}
                  <Col xs={24} style={{ marginTop: '120px' }}>
                    <Checkbox
                      checked={showWarehouses}
                      onChange={(e) => setShowWarehouses(e.target.checked)}
                    >
                      Show Warehouses
                    </Checkbox>
                  </Col>
                  <Col xs={24}>
                    <Checkbox
                      checked={showLocations}
                      onChange={(e) => setShowLocations(e.target.checked)}
                    >
                      Show Locations
                    </Checkbox>
                  </Col>
                </Row>
              </form>
            </Col>
          </Row>
        </Modal>

        {/* Modal de eliminación */}
        <Modal
          title="Delete Warehouse"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>
            Are you sure you want to delete "<Text strong>{currentWarehouse?.name}</Text>"?
          </p>
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default Warehouses;