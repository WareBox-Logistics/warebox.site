import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Typography, Modal, Dropdown, Menu, Spin, Select, message, Checkbox } from "antd";
import { 
  UserAddOutlined, 
  SearchOutlined, 
  LoadingOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined, 
  HomeOutlined,
  EyeOutlined
} from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_LOCATION, API_URL_COMPANY, API_URL_LOCATIONS_COMPANY, API_URL_WAREHOUSE, API_SAKABE_COORDS } from '../../../services/services';
import blueDot from "../../../assets/images/icons/blue-dot.png";
import redDot from "../../../assets/images/icons/red-dot.png";

const { Text, Title } = Typography;

const mapContainerStyle = {
  height: '75vh',
  width: '100%',
  borderRadius: '10px',
};

const defaultCenter = { lat: 32.462986, lng: -116.958970 };

const ClientLocations = () => {
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    company: null,
    id_routing_net: null,
    source: null,
    target: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const [activeLocationId, setActiveLocationId] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showLocations, setShowLocations] = useState(true);
  const [showWarehouses, setShowWarehouses] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [isInfoWindowVisible, setIsInfoWindowVisible] = useState(false);
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [payload, setPayload] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [allLocations, setAllLocations] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const fetchData = async () => {
      await fetchCompanyId();
      await fetchWarehouses();
      await fetchAllLocations();
      if (companyId) {
        await fetchLocations();
      }
    };
    fetchData();
  }, [companyId]);

  const fetchCompanyId = async () => {
    try {
      const firstName = localStorage.getItem('first_name');
      const response = await axios.get(API_URL_COMPANY, {
        headers: { Authorization: authToken }
      });
      
      const company = response.data.companies.find(c => c.name === firstName);
      if (company) {
        setCompanyId(company.id);
        setFormData(prev => ({ ...prev, company: company.id }));
      } else {
        message.error("Company not found");
      }
    } catch (error) {
      console.error("Error fetching company:", error);
    }
  };

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_LOCATIONS_COMPANY, {
        headers: { Authorization: authToken },
        params: { company_id: companyId }
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllLocations = async () => {
    try {
      const response = await axios.get(API_URL_LOCATION, {
        headers: { Authorization: authToken },
      });
      setAllLocations(response.data.locations || []);
    } catch (error) {
      console.error("Error fetching all locations:", error);
      setAllLocations([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get(API_URL_WAREHOUSE, {
        headers: { Authorization: authToken }
      });
      setWarehouses(response.data.warehouses || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setActiveLocationId(null); 
  };

  const handleCardClick = (location) => {
    setSelectedLocation(location);
    setActiveLocationId(null); 

    if (mapRef.current) {
      mapRef.current.panTo({
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude),
      });

      if (isZoomed) {
        mapRef.current.setZoom(11);
        setIsZoomed(false);
      }
    }
  };

  const handleViewLocation = (location) => {
    if (activeLocationId === location.id) {
      mapRef.current.panTo(defaultCenter);
      mapRef.current.setZoom(11);
      setActiveLocationId(null);
    } else {
      setSelectedLocation(location);
      if (mapRef.current) {
        mapRef.current.panTo({
          lat: parseFloat(location.latitude),
          lng: parseFloat(location.longitude),
        });
        mapRef.current.setZoom(15);
        setIsZoomed(true);
      }
      setActiveLocationId(location.id);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const initialPayload = {
      ...formData,
      company: companyId
    };

    const sakabeValues = await getSakabeValues();
    
    if (sakabeValues) {
      initialPayload.id_routing_net = sakabeValues.id_routing_net;
      initialPayload.source = sakabeValues.source;
      initialPayload.target = sakabeValues.target;
      await submitPayload(initialPayload);
    } else {
      setPayload(initialPayload);
      setIsConfirmationModalVisible(true);
    }
  };

  const getSakabeValues = async () => {
    try {
      const payload = {
        escala: 10,
        x: formData.longitude,
        y: formData.latitude,
        type: "json",
        key: import.meta.env.VITE_SAKBE_API_KEY
      };

      const response = await axios.post(API_SAKABE_COORDS, payload, {
        headers: { Authorization: authToken }
      });

      return response.data.response.success ? {
        id_routing_net: response.data.data.id_routing_net,
        source: response.data.data.source,
        target: response.data.data.target
      } : null;
    } catch (error) {
      message.error("Error fetching data from Sakabé");
      return null;
    }
  };

  const handleConfirmation = async (useGeoApify) => {
    setIsConfirmationModalVisible(false);
    if (useGeoApify) {
      await submitPayload({ ...payload, id_routing_net: null, source: null, target: null });
    }
    setIsSubmitting(false);
  };

  const submitPayload = async (payload) => {
    try {
      const response = await axios.post(API_URL_LOCATION, payload, {
        headers: { Authorization: authToken }
      });
      setLocations([...locations, response.data.location]);
      message.success("Location added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding location");
      console.error("Error adding location:", error);
    }
  };

  const handleEditLocation = (location) => {
    setCurrentLocation(location);
    setFormData({
      name: location.name || "",
      latitude: location.latitude || "",
      longitude: location.longitude || "",
      company: companyId,
      id_routing_net: location.id_routing_net || null,
      source: location.source || null,
      target: location.target || null,
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateLocation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_LOCATION}/${currentLocation.id}`, formData, {
        headers: { Authorization: authToken }
      });

      const updatedLocations = locations.map(loc => 
        loc.id === currentLocation.id ? response.data.location : loc
      );
      setLocations(updatedLocations);
      message.success("Location updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating location");
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
        headers: { Authorization: authToken }
      });
      setLocations(locations.filter(loc => loc.id !== currentLocation.id));
      message.success("Location deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting location");
      console.error("Error deleting location:", error);
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
      company: companyId,
      id_routing_net: null,
      source: null,
      target: null,
    });
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    resetForm();
    setShowLocations(false);
    setShowWarehouses(false);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Locations">
        <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
          <Col>
            <Typography.Title level={4} style={{ margin: 0 }}>
              Your Locations
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
              Add Location
            </Button>
          </Col>
        </Row>

        <Row gutter={16}>
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
              {/* Marcadores de Locations */}
              {locations.map((location) => (
              <Marker
                key={`location-${location.id}`}
                position={{
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                }}
                onClick={() => handleMarkerClick(location)}
                icon={{
                  url: selectedLocation?.id === location.id ? blueDot : redDot,
                }}
                onMouseOver={() => handleMouseOver({
                  position: {
                    lat: parseFloat(location.latitude),
                    lng: parseFloat(location.longitude),
                  },
                  name: location.name,
                  type: "Location",
                })}
                onMouseOut={handleMouseOut}
              />
            ))}

              {/* Marcadores de Warehouses */}
              {showWarehouses && warehouses.map((warehouse) => (
                <Marker
                  key={`warehouse-${warehouse.id}`}
                  position={{
                    lat: parseFloat(warehouse.latitude),
                    lng: parseFloat(warehouse.longitude),
                  }}
                  icon={{ url: blueDot }}
                  onMouseOver={() => handleMouseOver({
                    position: {
                      lat: parseFloat(warehouse.latitude),
                      lng: parseFloat(warehouse.longitude),
                    },
                    name: warehouse.name,
                    type: "Warehouse"
                  })}
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
            </GoogleMap>
          </Col>

          <Col span={9} style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <Spin spinning={isLoading} tip="Loading locations..." style={{ marginTop: '30px' }}>
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  hoverable
                  style={{
                    marginBottom: '10px',
                    border: selectedLocation?.id === location.id ? '2px solid #FF731D' : '1px solid #f0f0f0',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  onClick={() => handleCardClick(location)}
                >
                  <Row justify="space-between" align="middle" style={{ gap: '12px' }}>
                    <Col>
                      <HomeOutlined style={{ fontSize: '36px', marginRight: '12px', color: '#FF731D' }} />
                    </Col>
                    <Col flex="auto">
                      <Title level={4} style={{ margin: 0, fontSize: '22px' }}>
                        {location.name}
                      </Title>
                      <Text style={{ fontSize: '16px', display: 'block', marginTop: '8px' }}>
                        <span style={{ color: 'gray' }}>Latitude:</span> {location.latitude || "N/A"}
                      </Text>
                      <Text style={{ fontSize: '16px', display: 'block', marginTop: '4px' }}>
                        <span style={{ color: 'gray' }}>Longitude:</span> {location.longitude || "N/A"}
                      </Text>
                    </Col>
                    <Col style={{ maxWidth: '5%' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <Button 
                          type="default" 
                          icon={<EyeOutlined />} 
                          style={{ 
                            backgroundColor: activeLocationId === location.id ? '#1890ff' : 'transparent',
                            color: activeLocationId === location.id ? '#fff' : 'inherit',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewLocation(location);
                          }} 
                        />
                        <Button 
                          type="default" 
                          icon={<EditOutlined />} 
                          onClick={() => handleEditLocation(location)} 
                        />
                        <Button 
                          type="default" 
                          icon={<DeleteOutlined />} 
                          onClick={() => handleDeleteLocation(location)} 
                        />
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </Spin>
          </Col>
        </Row>

        <Modal
          title={isEditMode ? "Update Location" : "Add Location"}
          visible={isModalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={1000}
        >
          <Row gutter={[16, 16]}>
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
                {/* Mostrar marcadores de Locations */}
                {showLocations &&
                  (isModalVisible ? allLocations : locations).map((location) => (
                    <Marker
                      key={`modal-location-${location.id}`}
                      position={{
                        lat: parseFloat(location.latitude),
                        lng: parseFloat(location.longitude),
                      }}
                      icon={{ url: redDot }}
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

                {/* Mostrar marcadores de Warehouses */}
                {showWarehouses && warehouses.map((warehouse) => (
                  <Marker
                    key={`modal-warehouse-${warehouse.id}`}
                    position={{
                      lat: parseFloat(warehouse.latitude),
                      lng: parseFloat(warehouse.longitude),
                    }}
                    icon={{ url: blueDot }}
                    onMouseOver={() => handleMouseOver({
                      position: {
                        lat: parseFloat(warehouse.latitude),
                        lng: parseFloat(warehouse.longitude),
                      },
                      name: warehouse.name,
                      type: "Warehouse"
                    })}
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

                {/* Marcador para la ubicación seleccionada */}
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

            <Col span={8}>
              <Typography.Title level={5} style={{ marginBottom: '20px' }}>
                Select a place on the map to add a new location:
              </Typography.Title>
              <form onSubmit={isEditMode ? handleUpdateLocation : handleAddLocation}>
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Input
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Col>
                  <Col xs={24}>
                    <Input
                      name="latitude"
                      placeholder="Latitude"
                      value={formData.latitude}
                      readOnly
                    />
                  </Col>
                  <Col xs={24}>
                    <Input
                      name="longitude"
                      placeholder="Longitude"
                      value={formData.longitude}
                      readOnly
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
                      checked={showLocations}
                      onChange={(e) => setShowLocations(e.target.checked)}
                    >
                      Show Locations
                    </Checkbox>
                  </Col>
                  <Col xs={24}>
                    <Checkbox
                      checked={showWarehouses}
                      onChange={(e) => setShowWarehouses(e.target.checked)}
                    >
                      Show Warehouses
                    </Checkbox>
                  </Col>
                </Row>
              </form>
            </Col>
          </Row>
        </Modal>

        <Modal
          title="Delete Location"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>Are you sure you want to delete "<Text strong>{currentLocation?.name}</Text>"?</p>
        </Modal>

        {isConfirmationModalVisible && (
          <Modal
            title="Sakabé Data Not Available"
            visible={isConfirmationModalVisible}
            onOk={() => handleConfirmation(true)}
            onCancel={() => handleConfirmation(false)}
          >
            <p>Sakabé does not have data for this location. Continue with GeoApify?</p>
          </Modal>
        )}
      </MainCard>
    </Paper>
  );
};

export default ClientLocations;