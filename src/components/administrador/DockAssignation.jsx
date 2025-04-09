import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Alert, Spin, message, Tag, Space} from 'antd';
import {API_URL_DOCK_ASSIGMNET} from 'services/services';
import axios from 'axios';
import dayjs from 'dayjs'; 
import { 
  API_URL_DOCK_BY_WAREHOUSE,  
  API_URL_DOCK_CHECK_AVA 
} from 'services/services';

const DockReservation = ({ 
    warehouseId, 
    shippingDate, 
    deliveryId,
    authToken,
    onReservation,
    currentReservation,
    resetAll
  }) => {
    const [docks, setDocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [dockAssignments, setDockAssignments] = useState({});
    const [selectedDock, setSelectedDock] = useState(null);
    const [duration, setDuration] = useState(60);
    const [reservationModalVisible, setReservationModalVisible] = useState(false);

    const resetEverything = () => {
      resetAll(); 
    };

    if (!warehouseId || !shippingDate || !authToken) {
        console.error('Missing required props:', {
          warehouseId,
          shippingDate,
          authToken
        });
        return <Alert message="Missing required information" type="warning" />;
      }
    
      // Ensure shippingDate is a Dayjs object
      const normalizedShippingDate = dayjs.isDayjs(shippingDate) 
        ? shippingDate 
        : dayjs(shippingDate);
    
      if (!normalizedShippingDate.isValid()) {
        console.error('Invalid shipping date:', shippingDate);
        return <Alert message="Invalid shipping date" type="error" />;
      }
    

  
    useEffect(() => {
      const fetchDocks = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL_DOCK_BY_WAREHOUSE}${warehouseId}`, {
            headers: { Authorization: authToken }
          });
          setDocks(response.data || []);
          
          const assignments = {};
          response.data.forEach(dock => {
            assignments[dock.id] = { available: true, conflict: null };
          });
          setDockAssignments(assignments);
        } catch (error) {
          console.error('Error fetching docks:', error);
          if (error.response && error.response.status === 404) {
            message.warning("You can't choose a dock in a location, that's not in our hands!");
            setDocks([]);
            resetEverything();
          } else {
            // For other errors, show a generic message
            message.error('Failed to load docks');
            setDocks([]);
          }
        } finally {
          setLoading(false);
        }
      };
  
      if (warehouseId) fetchDocks();
    }, [warehouseId, authToken]);
  
    // Check availability
    useEffect(() => {
      const checkAvailability = async () => {
        if (!shippingDate || docks.length === 0) return;
        
        try {
          setAvailabilityLoading(true);
          const newAssignments = {...dockAssignments};
          
          await Promise.all(docks.map(async (dock) => {
            try {
              const response = await axios.post(API_URL_DOCK_CHECK_AVA, {
                dock_id: dock.id,
                start_time: shippingDate.format('YYYY-MM-DD HH:mm:ss'),
                duration_minutes: 60
              }, {
                headers: { Authorization: authToken }
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
          console.error('Error checking availability:', error);
          message.error('Failed to check dock availability');
        } finally {
          setAvailabilityLoading(false);
        }
      };
  
      checkAvailability();
    }, [shippingDate, docks, authToken]);
  
    const handleReserve = async() => {
      if (!selectedDock) return;
      
      try {
        setLoading(true);
        const payload = {
            delivery_id: deliveryId,
          dock_id: selectedDock.id,
          scheduled_time: shippingDate.format('YYYY-MM-DD HH:mm:ss'),
          duration_minutes: duration
        };

        console.log(payload)
  
         await axios.post(API_URL_DOCK_ASSIGMNET, payload, {
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
        resetEverything();
      } catch (error) {
        console.error('Error reserving dock:', error);
        message.error(error.response?.data?.message || 'Failed to reserve dock');
      } finally {
        setLoading(false);
      }
    };

    const handleDockClick = (dock) => {
        setSelectedDock(dock);
        setReservationModalVisible(true); 
      };
  
    const renderDockCard = (dock) => {
        const assignment = dockAssignments[dock.id] || {};
        console.log(`Dock ${dock.id} availability:`, assignment.available);
      
        const isAvailable = assignment.available !== false; 
        const isSelected = currentReservation?.dockId === dock.id;
  
      return (
        <Card
        key={dock.id}
        title={`Dock #${dock.number}`}
        style={{
          cursor: 'pointer', // Always show pointer
          border: isSelected ? '2px solid #1890ff' : 
                 isAvailable ? '1px solid #d9d9d9' : '1px solid #ff4d4f',
          opacity: isAvailable ? 1 : 0.7,
        }}
        onClick={() => {
          if (isAvailable) {
            console.log('Selecting dock:', dock.id);
            handleDockClick(dock);
          } else {
            console.warn('Dock not available:', dock.id);
          }
        }}
      >
          <Space direction="vertical" size="small">
            <div><strong>Type:</strong> {dock.type}</div>
            <div>
              <strong>Status:</strong> 
              {availabilityLoading ? (
                <Spin size="small" />
              ) : isAvailable ? (
                <Tag color="green">Available</Tag>
              ) : (
                <Tag color="red">Occupied</Tag>
              )}
            </div>
            {assignment?.conflict && (
              <div style={{ fontSize: 12 }}>
                Until: {dayjs(assignment.conflict.end_time).format('HH:mm')}
              </div>
            )}
            {isSelected && (
              <div style={{ marginTop: 8 }}>
                <InputNumber
                  min={15}
                  max={240}
                  value={duration}
                  onChange={setDuration}
                  style={{ width: '100%' }}
                />
                <Button 
                  type="primary" 
                  size="small" 
                  block 
                  style={{ marginTop: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReserve();
                  }}
                >
                  Select
                </Button>
              </div>
            )}
          </Space>
        </Card>
      );
    };
  
    return (
        <>
      <div>
        <h3 style={{ marginBottom: 16 }}>Dock Reservation</h3>
        
        {!shippingDate ? (
          <Alert message="Select shipping date first" type="info" showIcon />
        ) : loading ? (
          <Spin tip="Loading docks..." />
        ) : (
          <>
            {currentReservation?.dockId && (
              <Alert 
                message={`Dock #${docks.find(d => d.id === currentReservation.dockId)?.number} selected`}
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {docks.map(renderDockCard)}
            </div>
          </>
        )}
      </div>
      <Modal
        title={`Reserve Dock #${selectedDock?.number}`}
        visible={reservationModalVisible}
        onOk={handleReserve}
        onCancel={() => setReservationModalVisible(false)}
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
      </>
    );
  };

  export default DockReservation;