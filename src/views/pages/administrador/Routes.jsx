import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useLoadScript } from '@react-google-maps/api';
import {Row, Col, Button, Typography, Spin } from 'antd'; 
import axios from 'axios';
import { Paper } from '@mui/material';
import MainCard from "ui-component/cards/MainCard";
import { API_URL_WAREHOUSE, API_URL_LOCATION, authToken, GEOAPIFY_BASE_API_URL, API_TEST_WAREHOUSE, API_TEST_LOCATION } from 'services/services';
import warehouseIcon from '../../../assets/images/icons/warehouse.png';
import shopIcon from '../../../assets/images/icons/shops.png';
import RouteInfo from '../../../components/administrador/RouteInfo';
import RouteForm from '../../../components/administrador/RouteForm';
import {transformGeoapifyResponse} from '../../../utils/routeConversion'

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
  const [polylinePath, setPolylinePath] = useState([]);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeDirections, setRouteDirections] = useState(null);
  const [fullNavigation, setFullNavigation] = useState(null);
  const [transformedRoute, setTransformedRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  

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
    try {
      const response = await axios.get(API_URL_LOCATION, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setLocations([]);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get(API_URL_WAREHOUSE, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setWarehouses(response.data.warehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setWarehouses([]);
    }
  };

  const extractPoints = (locations, warehouses) => {
    const locationPoints = [];
    const warehousePoints = [];

    locations.forEach((location) => {
      locationPoints.push({
        name: location.name,
        companyName: location.company?.name || "Unknown",
        id: location.id,
        coords: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
        id_routing_net: location.id_routing_net,
        source: location.source,
        target: location.target,
        type: 'location'
      });
    });

    warehouses.forEach((warehouse) => {
      warehousePoints.push({
        name: warehouse.name,
        id: warehouse.id,
        coords: { lat: parseFloat(warehouse.latitude), lng: parseFloat(warehouse.longitude) },
        id_routing_net: warehouse.id_routing_net,
        source: warehouse.source,
        target: warehouse.target,
        type:'warehouse'
      });
    });

    setPoints([{ warehouses: warehousePoints }, { shops: locationPoints }]);  };

  const handleMarkerClick = (point, name, id, id_routing_net, source, target, type) => {
    setSelectedPoint([point, name, id, id_routing_net, source, target, type]);
  };

  const handleCloseInfoWindow = () => {
    setSelectedPoint(null);
  };

  const addWaypoint = (point, name, id, id_routing_net, source, target, type) => {
    setWaypoints([...waypoints, { point, name, id, id_routing_net, source, target, type }]);
  };

  const removeWaypoint = (point) => {
    setWaypoints(waypoints.filter((waypoint) => waypoint.point !== point));
  };

  const handleRouteGeneration = async () => {
    try {
      setIsLoading(true);
      const waypointString = `waypoints=${waypoints
        .map((waypoint) => `${waypoint.point.lat},${waypoint.point.lng}`)
        .join('|')}`;
  
      const response = await axios.get(
        `${GEOAPIFY_BASE_API_URL + waypointString}&format=json&mode=heavy_truck&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
      );
  
      setRouteInfo(response.data.results[0])
      const transformedResponse = transformGeoapifyResponse(response.data);
      setTransformedRoute(transformedResponse);
      setPolylinePath(transformedResponse.PolylinePath);
      setIsLoading(false);
      console.log('Transformed Route:', transformedResponse);
    } catch (error) {
      console.error('Error generating route:', error);
    }
  };
  
  const calculateRoute = async () => {
    const url = 'http://127.0.0.1:8000/api/proxy/optima'; // Laravel proxy endpoint (will move it to services once its on the changes are in the server)
    if (
      waypoints[0].id_routing_net == null ||
      waypoints.at(-1).id_routing_net == null
    ) {
      handleRouteGeneration();
      return;
    }
   
    const payload = {
      id_i: waypoints[0].id_routing_net,
      source_i: waypoints[0].source,
      target_i: waypoints[0].target,
      id_f: waypoints.at(-1).id_routing_net,
      source_f: waypoints.at(-1).source,
      target_f: waypoints.at(-1).target,
      v: 8,
      type: 'json',
      proj: 'GRS80',
      key: import.meta.env.VITE_SAKBE_API_KEY,
    };
  
    try {
      setIsLoading(true);
      const response = await axios.post(url, payload);
      setCalculatedRoute(response.data.data);
      getRouteDetails();
      console.log('CalculatedRoute:', response.data.data);
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRouteDetails = async () => {
    const url = 'http://127.0.0.1:8000/api/proxy/optima/details'; // Laravel proxy endpoint
    const payload = {
      id_i: waypoints[0].id_routing_net,
      source_i: waypoints[0].source,
      target_i: waypoints[0].target,
      id_f: waypoints.at(-1).id_routing_net,
      source_f: waypoints.at(-1).source,
      target_f: waypoints.at(-1).target,
      v: 8,
      type: 'json',
      proj: 'GRS80',
      key: import.meta.env.VITE_SAKBE_API_KEY,
    };
  
    try {
      setIsLoading(true);
      const response = await axios.post(url, payload);
      setRouteDetails(response.data.data);
      console.log('RouteDetails:', response.data.data);
    } catch (error) {
      console.error('Error retrieving route details:', error);
      return null;
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeDetails && routeDetails.length > 0) {
      try {
        const transformedDirections = routeDetails.map((route) => {
          if (route.geojson) {
            const geojson = JSON.parse(route.geojson);
    
            if (geojson.type === "Point") {
              const [lng, lat] = geojson.coordinates;
              return { ...route, point: { lat, lng } };
            } else {
              console.error("Invalid GeoJSON type:", geojson.type);
            }
          }
          return route; // Return unchanged if no geojson
        });
    
        setRouteDirections(transformedDirections);
        console.log("RouteDirections:", transformedDirections);
      } catch (error) {
        console.error("Error parsing geojson:", error);
      }
    } else {
      console.log("No valid route found");
    }
  }, [routeDetails]);

  useEffect(() => {
    if (calculatedRoute && calculatedRoute.geojson) {
      try {
        const geojson = JSON.parse(calculatedRoute.geojson);
  
        if (geojson.type === "MultiLineString") {
          const coordinates = geojson.coordinates;
  
          const paths = coordinates.map(segment =>
            segment.map(coord => ({
              lat: parseFloat(coord[1]), 
              lng: parseFloat(coord[0]),
            }))
          );
  
          setPolylinePath(paths);
          console.log("PolylinePath:", paths);
        } else {
          console.error("Invalid GeoJSON type:", geojson.type);
        }
      } catch (error) {
        console.error("Error parsing geojson:", error);
      }
    } else {
      console.log("No valid route found");
    }
  }, [calculatedRoute]);

  useEffect(() => {
    if (polylinePath && routeDirections) {
      handleFullNavigation();
    }
  }, [polylinePath, routeDirections]);
  
  const handleFullNavigation = () => {
    setFullNavigation({
      PolylinePath: polylinePath,
      RouteDirections: routeDirections,
    });
    console.log({
      PolylinePath: polylinePath,
      RouteDirections: routeDirections,
    })
  }

  const cleanRoute = () => {
    setPolylinePath([]);
    setCalculatedRoute(null);
    setRouteDetails(null);
    setRouteInfo(null);
    setRouteDirections([]);
    setFullNavigation(null);
    setWaypoints([]);
  };
  
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Plan a Delivery">
        <Title level={4} style={{ marginTop: '-10px' }}>
          Generate a route
        </Title>

        {isLoading && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1000 }}>
            <Spin size="large" tip="Calculating route..." />
          </div>
        )}

        <Row >
          <Col span={12}>
            <div style={{ flex: 1, width: '100%', height: '100%' , borderRadius: '10px' }}>
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
                        onClick={() => handleMarkerClick({ lat: point.coords.lat, lng: point.coords.lng }, point.name, point.id, point.id_routing_net, point.source, point.target, point.type)}
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
                      <Button type="primary" onClick={() => addWaypoint(selectedPoint[0], selectedPoint[1], selectedPoint[2], selectedPoint[3], selectedPoint[4], selectedPoint[5], selectedPoint[6])}>
                        Add to route
                      </Button>
                    </div>
                  </InfoWindow>
                )}

                {/* Render Polyline */}
                {polylinePath.length > 0 &&
                polylinePath.map((path, index) => (
                  <Polyline
                    key={index}
                    path={path} // Pass each segment separately
                    options={{
                      strokeColor: "#FF0000",
                      strokeOpacity: 1.0,
                      strokeWeight: 3,
                    }}
                  />
                ))}

              </GoogleMap>
            </div>
          </Col>
          <Col span={12} style={{  overflowY: 'auto', height: '75vh', }}>
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
                  onClick={calculateRoute}
                  disabled={waypoints.length != 2 }
                >
                  Generate Route
                </Button>
                <Button
                  type="primary"
                  style={{ marginTop: '10px', width: '100%' }}
                  onClick={cleanRoute}
                  disabled={!polylinePath.length && !calculatedRoute && !routeInfo}
                >
                  Clean Route
                </Button>
              </Row>
            </div>
            {/* For the INGI API */}
            {calculatedRoute &&
              (<RouteInfo path={calculatedRoute} />)}
           
            {/* For the Geopaify API */}
            {routeInfo &&
              (<RouteInfo path={routeInfo} />)}
          </Col>
        </Row>
        <Row>
        {calculatedRoute &&
              (  <RouteForm origin={waypoints[0]} destination={waypoints.at(-1)} route={fullNavigation}/>)}
        
        {routeInfo &&
              (  <RouteForm origin={waypoints[0]} destination={waypoints.at(-1)} route={transformedRoute}/>)}

        </Row>
      </MainCard>
    </Paper>
  );
};

export default Routes;