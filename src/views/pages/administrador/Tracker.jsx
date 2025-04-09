import { useEffect, useState, useRef } from 'react';
import {
    Paper,
  } from "@mui/material";
  import { GoogleMap, Marker, InfoWindow, Polyline, useLoadScript } from '@react-google-maps/api';
  import { db } from "../../../firebase.js";
  import {ref, onValue} from 'firebase/database'
  import { Row, Col, Typography, Spin, Card, Tag } from "antd";
  import { authToken, API_URL_DELIVERY, API_URL_DELIVERY_FUTURE } from 'services/services.jsx';
  import {TruckOutlined} from '@ant-design/icons';
  import axios from 'axios';
  import MainCard from "ui-component/cards/MainCard";
  import truck from "../../../assets/images/icons/trailer.png";

  const defaultCenter = { lat: 32.462986, lng: -116.958970 };

  const mapContainerStyle = {
    height: '75vh',
    width: '100%',
    borderRadius: '10px',
  };

  const { Title, Text } = Typography;
  
  const Tracker = () => {
      const [drivers, setDrivers] = useState({});
      const [deliveries, setDeliveries] = useState(null);
      const [loadingDeliveries, setLoadingDeliveries] = useState(false);
      const [selectedDelivery, setSelectedDelivery] = useState(null);
      const [route, setRoute] = useState([]);
      const [origin, setOrigin] = useState(null);
      const [destination, setDestination] = useState(null);
      const [highlightedTrucks, setHighlightedTrucks] = useState([]);

      const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      });

      const ORIGIN_COLOR = "#4285F4";
      const DESTINATION_COLOR = "#EA4335";
      const ROUTE_COLOR = "#34A853"; 

      useEffect(() => {
        const driversRef = ref(db, "drivers");
        onValue(driversRef, (snapshot) => {
          setDrivers(snapshot.val() || {});
        });
      }, []);

      useEffect(() => {
        fetchDeliveries();
      },[]);


      const fetchDeliveries = async () => {
        try{
          setLoadingDeliveries(true);
          const response = await axios.get(API_URL_DELIVERY_FUTURE, {
                  headers: {
                    Authorization: authToken,
                    'Content-Type': 'application/json',
                  },
                });
          
            setDeliveries(response.data);
            console.log(response.data);
        }catch(error){
          console.error('Error at fetching deliveries: ',error);
        }finally{
          setLoadingDeliveries(false);
        }
      }

      const getStatusTag = (status) => {
          switch (status) {
            case "Pending":
              return <Tag color="orange">Pending</Tag>;
            case "Docking":
              return <Tag color="blue">Docking</Tag>;
            case "Delivering":
              return <Tag color="green">Delivering</Tag>;
            case "Loading":
              return <Tag color="cyan">Loading</Tag>;
            case "Emptying":
              return <Tag color="purple">Emptying</Tag>;
            case "Delivered":
              return <Tag color="default">Delivered</Tag>;
            default:
              return <Tag color="default">Unknown</Tag>;
          }
      };
    
      const handleDeliveryToggle = (trip) => {
        // Toggle selection
        if (selectedDelivery?.id === trip.id) {
          setSelectedDelivery(null);
          setRoute([]);
          setHighlightedTrucks([]);
          setOrigin(null);
          setDestination(null);
        } else {
          setSelectedDelivery(trip);
          setRoute(trip.route?.PolylinePath || []);
          
          // Safely set coordinates with fallbacks
          setOrigin({
            lat: Number(trip.origin.latitude) || defaultCenter.lat,
            lng: Number(trip.origin.longitude) || defaultCenter.lng
          });
          
          setDestination({
            lat: Number(trip.destination.latitude) || defaultCenter.lat,
            lng: Number(trip.destination.longitude) || defaultCenter.lng
          });
          const assignedTrucks = Object.keys(drivers).filter(
            driverId => drivers[driverId]?.deliveryId === trip.id
          );
          setHighlightedTrucks(assignedTrucks);
          console.log(assignedTrucks)
          console.log(drivers)
        }
        };

      if (loadError) return <div>Error loading maps</div>;
      if (!isLoaded) return <div>Loading Maps...</div>;

      const renderDeliveryList = () => {
        if (loadingDeliveries) {
          return <Spin tip="Loading deliveries..." />;
        }
        
        if (!deliveries || deliveries.length === 0) {
          return (
            <div style={{ padding: '16px', textAlign: 'center', color: 'gray' }}>
              There are no planned deliveries
            </div>
          );
        }

        const filteredDeliveries = deliveries
        .filter((trip) =>
          ["Delivering", "Docking", "Loading", "Pending"].includes(trip.status)
        )
        .sort((a, b) => {
          if (a.status === "Delivering" && b.status !== "Delivering") return -1;
          return 0;
        });
    
        return filteredDeliveries.map((trip) => (
          <Card
            key={trip.id}
            hoverable
            style={{
              marginBottom: "16px",
              cursor: "pointer",
              border: selectedDelivery?.id === trip.id 
                ? '2px solid #FF731D' 
                : '1px solid #f0f0f0',
              backgroundColor: selectedDelivery?.id === trip.id
                ? '#fff8f5'
                : 'white'
            }}
            onClick={() => handleDeliveryToggle(trip)}
          >
             <Row justify="space-between" align="middle">
                            <Col>
                              <TruckOutlined style={{ fontSize: "36px", color: "#FF731D" }} />
                            </Col>
                            <Col flex="auto" style={{ paddingLeft: 16, marginLeft: 4 }}>
                              <Title level={4} style={{ margin: 0 }}>Trip #{trip.id}</Title>
                              <Text><strong>Origin:</strong> {trip.origin.name}</Text><br />
                              <Text><strong>Destination:</strong> {trip.destination.name}</Text><br />
                              <Text><strong>Company:</strong> {trip.company.name}</Text><br />
                              <Text><strong>Status:</strong> {getStatusTag(trip.status)}</Text>
                            </Col>
                          </Row>
          </Card>
        ));
      };
    

    return (
      <Paper sx={{ padding: '16px', margin: '5px' }}>
        <MainCard title="Trip Tracker">
          <Row >
            <Col span={16}>
            <div style={{ flex: 1, width: '100%', height: '100%' , borderRadius: '10px' }}>
               {/* Symbology Legend */}
               <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1,
                background: 'white',
                padding: '8px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                marginTop: '85px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: ORIGIN_COLOR,
                    marginRight: '8px',
                    borderRadius: '50%'
                  }} />
                  <Text>Origin</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: DESTINATION_COLOR,
                    marginRight: '8px',
                    borderRadius: '50%'
                  }} />
                  <Text>Destination</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: ROUTE_COLOR,
                    marginRight: '8px',
                    borderRadius: '2px'
                  }} />
                  <Text>Route</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={truck} style={{width: '36px',height: '36px',marginRight: '8px'}} alt=''/>
                  <Text>Trucks</Text>
                </div>
              </div>

                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    zoom={11}
                    center={defaultCenter}
                    options={{
                      gestureHandling: 'greedy',
                      disableDefaultUI: false,
                    }}
                  >
                 {Object.entries(drivers).map(([driverId, driverData]) => {
  // Check if this driver is assigned to the selected delivery
  const isAssignedToSelected = selectedDelivery && 
                              driverData.deliveryId === selectedDelivery.id.toString();
  
  return (
    <Marker
      key={driverId}
      position={{ lat: driverData.lat, lng: driverData.lng }}
      icon={{
        url: truck,
        scaledSize: new window.google.maps.Size(
          isAssignedToSelected ? 48 : 36, // Larger if assigned
          isAssignedToSelected ? 48 : 36
        ),
        anchor: new window.google.maps.Point(
          isAssignedToSelected ? 24 : 18,
          isAssignedToSelected ? 24 : 18
        )
      }}
      options={{
        opacity: isAssignedToSelected ? 1 : 0.7 // More visible if assigned
      }}
    >
      {isAssignedToSelected && (
        <InfoWindow>
          <div style={{ padding: '8px' }}>
            <strong>Driver #{driverId}</strong>
            <p>Assigned to Delivery #{selectedDelivery.id}</p>
            <p>Truck ID: {driverData.truckId}</p>
            <small>
              Last update: {new Date(driverData.lastUpdated).toLocaleTimeString()}
            </small>
          </div>
        </InfoWindow>
      )}
    </Marker>
  );
})}
                      {route.length > 0 &&
                                    route.map((path, index) => (
                                      <Polyline
                                        key={index}
                                        path={path} // Pass each segment separately
                                        options={{
                                          strokeColor: ROUTE_COLOR,
                                          strokeOpacity: 1.0,
                                          strokeWeight: 3,
                                        }}
                                      />
                                    ))}

              
                {/* Destination Marker */}
                {destination && (
                  <Marker 
                    position={destination}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: DESTINATION_COLOR,
                      fillOpacity: 1,
                      strokeWeight: 0,
                      scale: 8
                    }}
                  />
                )}

                {/* Origin Marker */}
                {origin && (
                  <Marker 
                    position={origin}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      fillColor: ORIGIN_COLOR,
                      fillOpacity: 1,
                      strokeWeight: 0,
                      scale: 8
                    }}
                  />
                )}

                  </GoogleMap>
                </div>
                </Col>
                <Col span={8}>
                <div style={{ paddingLeft: '30px', borderRadius: '10px' }}>
                  <Title level={4} style={{ marginTop: '-10px' }}>
                    Select a delivery
                  </Title>
                    <div style={{overflowY:'auto',height:'70vh'}}>
                      {renderDeliveryList()}
                    </div>
                </div>
                </Col>
                </Row>
        </MainCard>
      </Paper>
    );
  };
  
  export default Tracker;
  