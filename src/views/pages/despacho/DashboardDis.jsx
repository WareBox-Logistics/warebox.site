import React, { useEffect, useState } from 'react';
import ChartsComponent from "/src/components/dispatch/Dashboard/ChartsComponent";
import Stack from '@mui/material/Stack';
import MainCard from "ui-component/cards/MainCard";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { Typography, Spin } from "antd";
import axios from 'axios';
import { authToken, API_URL_REPORT } from '../../../services/services';
import DashboardComponent from "/src/components/dispatch/Dashboard/DashboardComponent";

const { Text } = Typography;





// cosas para dashboard
// reportes: top 5 problemas comunes, cuantos son issues pie,
// issue: status pie, cuanto support
// support: status pie


const defaultCenter = { lat: 32.462986, lng: -116.958970 };
const mapContainerStyle = {
  height: '60vh',
  width: '100%',
  borderRadius: '10px',
};

// Different colors for different problem levels
const PROBLEM_COLORS = {
  1: '#FF5733', // High severity
  2: '#FFC300', // Medium severity
  3: '#2ECC71'  // Low severity
};

  const DashboardDis = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const { isLoaded, loadError } = useLoadScript({
      googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    useEffect(() => {
      const fetchReports = async () => {
        try {
          const response = await axios.get(API_URL_REPORT, {
            headers: {
              Authorization: authToken,
              'Content-Type': 'application/json',
            },
          });
          setReports(response.data.reports || []);
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchReports();
    }, []);

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
      <Stack spacing={10}>
      <MainCard title="Incident Map">
        {loading ? (
          <Spin tip="Loading reports..." />
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Legend */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 1,
              background: 'white',
              padding: '8px',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ marginBottom: '4px' }}>
                <Text strong>Problem Severity:</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: PROBLEM_COLORS[1],
                  marginRight: '8px',
                  borderRadius: '50%'
                }} />
                <Text>High</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: PROBLEM_COLORS[2],
                  marginRight: '8px',
                  borderRadius: '50%'
                }} />
                <Text>Medium</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: PROBLEM_COLORS[3],
                  marginRight: '8px',
                  borderRadius: '50%'
                }} />
                <Text>Low</Text>
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
              {reports.map((report) => (
                <Marker
                  key={report.id}
                  position={{ 
                    lat: parseFloat(report.latitude), 
                    lng: parseFloat(report.longitude) 
                  }}
                  onClick={() => setSelectedReport(report)}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: PROBLEM_COLORS[report.problem.level] || '#FF5733',
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 8
                  }}
                />
              ))}

              {selectedReport && (
                <InfoWindow
                  position={{ 
                    lat: parseFloat(selectedReport.latitude), 
                    lng: parseFloat(selectedReport.longitude) 
                  }}
                  onCloseClick={() => setSelectedReport(null)}
                >
                  <div style={{ padding: '8px' }}>
                    <Text strong>{selectedReport.problem.name}</Text>
                    <p>Severity: Level {selectedReport.problem.level}</p>
                    <p>Reported by: {selectedReport.driver.first_name} {selectedReport.driver.last_name}</p>
                    <p>Description: {selectedReport.description}</p>
                    {selectedReport.created_at && (
                      <small>
                        Reported at: {new Date(selectedReport.created_at).toLocaleString()}
                      </small>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        )}
      </MainCard>

      <DashboardComponent/>
    </Stack>
    );
  };
  
  export default DashboardDis;
  