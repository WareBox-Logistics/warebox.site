import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useLoadScript } from '@react-google-maps/api';
import {Row, Col, Button, Typography } from 'antd'; 
import axios from 'axios';
import { Paper } from '@mui/material';
import MainCard from "ui-component/cards/MainCard";
import { API_URL_WAREHOUSE, API_URL_LOCATION, authToken, GEOAPIFY_BASE_API_URL } from 'services/services';
import warehouseIcon from '../../../assets/images/icons/warehouse.png';
import shopIcon from '../../../assets/images/icons/shops.png';
import RouteInfo from '../../../components/administrador/RouteInfo';
import RouteForm from '../../../components/administrador/RouteForm';

const { Title, Text } = Typography;

const mapContainerStyle = {
  height: '75vh',
  width: '100%',
  borderRadius: '10px',
};

const defaultCenter = { lat: 32.462986, lng: -116.958970 };

const Routes = () => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [points, setPoints] = useState([]);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [polylinePath, setPolylinePath] = useState([]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchLocations();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    extractPoints(locations, warehouses);
  }, [locations, warehouses]);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_LOCATION, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setLocations(response.data.locations || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
      setIsLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_WAREHOUSE, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setWarehouses(response.data.warehouses || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setWarehouses([]);
      setIsLoading(false);
    }
  };

  const extractPoints = (locations, warehouses) => {
    const locationPoints = [];
    const warehousePoints = [];
    locations.forEach((location) => {
      locationPoints.push({
        name: location.name,
        companyName: location.company,
        id: location.id,
        coords: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
      });
    });

    warehouses.forEach((warehouse) => {
      warehousePoints.push({
        name: warehouse.name,
        id: warehouse.id,
        coords: { lat: parseFloat(warehouse.latitude), lng: parseFloat(warehouse.longitude) },
      });
    });

    setPoints([{ warehouses: warehousePoints }, { shops: locationPoints }]);
  };

  const handleMarkerClick = (point, name, id) => {
    setSelectedPoint([point, name, id]);
  };

  const handleCloseInfoWindow = () => {
    setSelectedPoint(null);
  };

  const addWaypoint = (point, name, id) => {
    setWaypoints([...waypoints, { point, name, id }]);
  };

  const removeWaypoint = (point) => {
    setWaypoints(waypoints.filter((waypoint) => waypoint.point !== point));
  };

  const handleRouteGeneration = async () => {
    try {
      const waypointString = `waypoints=${waypoints
        .map((waypoint) => `${waypoint.point.lat},${waypoint.point.lng}`)
        .join('|')}`;

      const response = await axios.get(
        `${GEOAPIFY_BASE_API_URL + waypointString}&format=json&mode=heavy_truck&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
      );
      setRoute(response.data);
      console.log('Route:', response.data);
    } catch (error) {
      console.error('Error generating route:', error);
    }
  };

  useEffect(() => {
    if (route && route.results && route.results[0] && route.results[0].geometry && route.results[0].geometry[0]) {
      const path = route.results[0].geometry[0].map((coord) => ({
        lat: coord.lat,
        lng: coord.lon,
      }));
      setPolylinePath(path);
    } else {
      console.log('path not here');
    }
  }, [route]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Plan a Delivery">
        <Title level={4} style={{ marginTop: '-10px' }}>
          Generate a route
        </Title>

        <Row>
          <Col span={12}>
            <div style={{ height: '75vh', width: '100%', pointerEvents: 'auto', overflow: 'hidden', borderRadius: '10px' }}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={11}
                center={defaultCenter}
                options={{
                  gestureHandling: 'greedy',
                  disableDefaultUI: false,
                }}
              >
                {/* Render Markers */}
                {points.map((category, categoryIndex) =>
                  Object.keys(category).map((type) =>
                    category[type].map((point, index) => (
                      <Marker
                        key={`${categoryIndex}-${index}`}
                        position={{ lat: point.coords.lat, lng: point.coords.lng }}
                        onClick={() => handleMarkerClick({ lat: point.coords.lat, lng: point.coords.lng }, point.name, point.id)}
                        icon={{
                          url: type === 'warehouses' ? warehouseIcon : shopIcon,
                          scaledSize: new window.google.maps.Size(32, 32),
                        }}
                      />
                    ))
                  )
                )}

                {/* Render InfoWindow */}
                {selectedPoint && (
                  <InfoWindow position={selectedPoint[0]} onCloseClick={handleCloseInfoWindow}>
                    <div>
                      <h3>{selectedPoint[1]}</h3>
                      <Button type="primary" onClick={() => addWaypoint(selectedPoint[0], selectedPoint[1], selectedPoint[2])}>
                        Add to route
                      </Button>
                    </div>
                  </InfoWindow>
                )}

                {/* Render Polyline */}
                {polylinePath.length > 0 && (
                  <Polyline
                    path={polylinePath}
                    options={{
                      strokeColor: '#FF0000',
                      strokeOpacity: 1.0,
                      strokeWeight: 3,
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ paddingLeft: '30px', borderRadius: '10px' }}>
              <Row gutter={8}>
                <Title level={4}>Waypoints</Title>
              </Row>

              <Row gutter={8}>
                <div
                  style={{
                    background: '#f0f2f5',
                    padding: '10px',
                    borderRadius: '10px',
                    width: '100%',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                  }}
                >
                  {waypoints.map((point, index) => (
                    <div
                      key={index}
                      style={{
                        width: '100%',
                        height: '5vh',
                        background: '#FFFFFF',
                        borderRadius: '10px',
                        alignContent: 'center',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        padding: '10px',
                        marginBottom: '10px',
                      }}
                    >
                      <Text strong>{point.name}</Text>
                      <Button type="danger" onClick={() => removeWaypoint(point.point)} style={{ marginTop: '-5px' }}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="primary"
                  style={{ marginTop: '10px', width: '100%' }}
                  onClick={handleRouteGeneration}
                  disabled={waypoints.length < 2}
                >
                  Generate Route
                </Button>
              </Row>
            </div>
            <RouteInfo path={route} />
          {route &&
            (  <RouteForm origin={waypoints[0]} destination={waypoints.at(-1)}/>)}
          </Col>
        </Row>
      </MainCard>
    </Paper>
  );
};

export default Routes;