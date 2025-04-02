import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Alert, Spin, message, Tag } from 'antd';
import axios from 'axios';
import { 
  API_URL_DOCK_BY_WAREHOUSE, 
  API_URL_DOCK_RESERVE, 
  API_URL_DOCK_CHECK_AVA 
} from 'services/services';

const DockReservation = ({ 
  warehouseId, 
  shippingDate, 
  trailerId, 
  truckId,
  authToken 
}) => {
  const [docks, setDocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedDock, setSelectedDock] = useState(null);
  const [duration, setDuration] = useState(60);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [dockAssignments, setDockAssignments] = useState({});

  console.log(shippingDate)

//   Fetch all docks for the warehouse
  useEffect(() => {
    const fetchDocks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL_DOCK_BY_WAREHOUSE}${warehouseId}`, {
          headers: {
            Authorization: authToken,
            'Content-Type': 'application/json',
          },
        });
        setDocks(response.data || []);
        
        // Initialize assignments state
        const assignments = {};
        response.data.forEach(dock => {
          assignments[dock.id] = {
            available: true,
            conflict: null
          };
        });
        setDockAssignments(assignments);
      } catch (error) {
        console.error('Error fetching docks:', error);
        message.error('Failed to load docks');
      } finally {
        setLoading(false);
      }
    };

    if (warehouseId) {
      fetchDocks();
    }
  }, [warehouseId, authToken]);

  // Check dock availability when shipping date changes
  useEffect(() => {
    const checkDocksAvailability = async () => {
      if (!shippingDate || docks.length === 0) return;
      
      try {
        setAvailabilityLoading(true);
        const newAssignments = {...dockAssignments};
        
        // Check availability for each dock
        await Promise.all(docks.map(async (dock) => {
          try {
            const payload = {
              dock_id: dock.id,
              start_time: shippingDate.format('YYYY-MM-DD HH:mm:ss'),
              duration_minutes: 60 // Default check duration
            };

            const response = await axios.post(API_URL_DOCK_CHECK_AVA, payload, {
              headers: {
                Authorization: authToken,
                'Content-Type': 'application/json',
              },
            });

            newAssignments[dock.id] = {
              available: response.data.available,
              conflict: response.data.conflict
            };
          } catch (error) {
            console.error(`Error checking dock ${dock.id}:`, error);
            newAssignments[dock.id] = {
              available: false,
              conflict: null
            };
          }
        }));

        setDockAssignments(newAssignments);
      } catch (error) {
        console.error('Error checking dock availability:', error);
        message.error('Failed to check dock availability');
      } finally {
        setAvailabilityLoading(false);
      }
    };

    checkDocksAvailability();
  }, [shippingDate, docks, authToken]);

  const handleDockClick = (dock) => {
    if (!dockAssignments[dock.id]?.available) {
      message.warning('This dock is not available at the selected time');
      return;
    }
    
    setSelectedDock(dock);
    setDuration(60); // Reset to default duration
    setReservationModalVisible(true);
  };

  const handleReserveDock = async () => {
    if (!selectedDock || !shippingDate) return;

    try {
      setLoading(true);
      const payload = {
        dock_id: selectedDock.id,
        truck_id: truckId,
        start_time: shippingDate.format('YYYY-MM-DD HH:mm:ss'),
        duration_minutes: duration
      };

      const response = await axios.post(API_URL_DOCK_RESERVE, payload, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });

      // Update the dock's availability status
      setDockAssignments(prev => ({
        ...prev,
        [selectedDock.id]: {
          available: false,
          conflict: null
        }
      }));

      message.success(`Dock ${selectedDock.number} reserved successfully for ${duration} minutes!`);
      setReservationModalVisible(false);
    } catch (error) {
      console.error('Error reserving dock:', error);
      message.error(error.response?.data?.message || 'Failed to reserve dock');
    } finally {
      setLoading(false);
    }
  };

  const renderDockStatus = (dock) => {
    if (availabilityLoading) return <Spin size="small" />;
    
    const assignment = dockAssignments[dock.id];
    if (!assignment) return <Tag color="default">Unknown</Tag>;
    
    if (assignment.available) {
      return <Tag color="green">Available</Tag>;
    } else {
      return (
        <div>
          <Tag color="red">Occupied</Tag>
          {assignment.conflict && (
            <div style={{ fontSize: '0.8em', color: '#666' }}>
              Until: {new Date(assignment.conflict.end_time).toLocaleTimeString()}
            </div>
          )}
        </div>
      );
    }
  };

  if (!warehouseId) return null;

  return (
    <div style={{ padding: '16px' }}>
      <h2>Dock Reservation</h2>
      
      {!shippingDate ? (
        <Alert 
          message="Please select a shipping date first" 
          type="info" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
      ) : (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          width: '100%'
        }}>
          {docks.map(dock => (
            <Card
              key={dock.id}
              title={`Dock #${dock.number}`}
              style={{ 
                cursor: dockAssignments[dock.id]?.available ? 'pointer' : 'not-allowed',
                opacity: dockAssignments[dock.id]?.available ? 1 : 0.7,
                borderColor: dockAssignments[dock.id]?.available ? '#52c41a' : '#ff4d4f',
                height: '100%', // Makes cards same height in row
                display: 'flex',
                flexDirection: 'column'
              }}
              bodyStyle={{
                padding: '12px',
                flexGrow: 1 // Makes content fill space
              }}
              headStyle={{
                padding: '0 12px', // Smaller header padding
                minHeight: '40px' // Smaller header height
              }}
              onClick={() => handleDockClick(dock)}
              hoverable={dockAssignments[dock.id]?.available}
              loading={loading}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '4px', // Reduced gap between items
                fontSize: '13px' // Smaller font size
              }}>
                <div><strong>WH:</strong> {dock.warehouse.name}</div>
                <div><strong>Status:</strong> {renderDockStatus(dock)}</div>
                <div><strong>Type:</strong> {dock.type || 'N/A'}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
  
      {/* Modal remains unchanged */}
      <Modal
        title={`Reserve Dock #${selectedDock?.number}`}
        visible={reservationModalVisible}
        onOk={handleReserveDock}
        onCancel={() => setReservationModalVisible(false)}
        confirmLoading={loading}
        okText="Confirm Reservation"
      >
        {selectedDock && (
          <>
            <p><strong>Warehouse:</strong> {selectedDock.warehouse.name}</p>
            <p><strong>Scheduled Time:</strong> {shippingDate?.format('YYYY-MM-DD HH:mm')}</p>
            
            <div style={{ margin: '16px 0' }}>
              <label><strong>Duration (minutes):</strong></label>
              <InputNumber 
                min={15} 
                max={240} 
                defaultValue={60} 
                value={duration}
                onChange={setDuration}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
            
            <Alert 
              message="Please confirm the reservation details"
              type="info"
              showIcon
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default DockReservation;