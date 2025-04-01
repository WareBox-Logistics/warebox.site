import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, message, Radio, Modal, Select, Button, Typography } from 'antd';
import { TruckOutlined } from '@ant-design/icons';
import { WarehouseOutlined } from "@mui/icons-material";
import { API_URL_DOCK, API_URL_WAREHOUSE, authToken } from '../../../services/services';
import axios from 'axios';

const { Option } = Select;
const { Text } = Typography;

const Muelles = () => {
  const [docks, setDocks] = useState([]);
  const [warehouses, setWarehouses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDock, setSelectedDock] = useState(null);
  const [selectedPlate, setSelectedPlate] = useState('');

  // Lista de placas de ejemplo
  const availablePlates = [
    { id: 1, plate: 'ABC-123' },
    { id: 2, plate: 'XYZ-789' },
    { id: 3, plate: 'DEF-456' },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchDocks();
      await fetchWarehouses();
      loadLocalDockStates();
      setIsLoading(false);
    };
    loadData();
  }, []);

  const fetchDocks = async () => {
    try {
      const response = await axios.get(API_URL_DOCK, {
        headers: { 'Authorization': authToken }
      });
      setDocks(response.data);
    } catch (error) {
      console.error('Error fetching docks:', error);
      message.error("Error fetching docks");
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get(API_URL_WAREHOUSE, {
        headers: { 'Authorization': authToken }
      });
      setWarehouses(response.data.warehouses.reduce((map, warehouse) => {
        map[warehouse.id] = warehouse.name;
        return map;
      }, {}));
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error("Error fetching warehouses");
    }
  };

  const loadLocalDockStates = () => {
    const savedStates = JSON.parse(localStorage.getItem('dockStates') || '{}');
    setDocks(prevDocks => 
      prevDocks.map(dock => ({
        ...dock,
        ...savedStates[dock.id]
      }))
    );
  };

  const handleCardClick = (dock) => {
    setSelectedDock(dock);
    setSelectedPlate('');
    setIsModalVisible(true);
  };

  const handleAssignPlate = () => {
    if (!selectedDock) return;

    const newStatus = selectedDock.status === 'Available' ? 'Occupied' : 'Available';
    const savedStates = JSON.parse(localStorage.getItem('dockStates') || '{}');

    // Actualizar estado local
    const updatedStates = {
      ...savedStates,
      [selectedDock.id]: {
        status: newStatus,
        plate: newStatus === 'Occupied' ? selectedPlate : null
      }
    };

    localStorage.setItem('dockStates', JSON.stringify(updatedStates));

    // Actualizar estado en la aplicación
    setDocks(prevDocks =>
      prevDocks.map(dock =>
        dock.id === selectedDock.id
          ? {
              ...dock,
              status: newStatus,
              plate: newStatus === 'Occupied' ? selectedPlate : null
            }
          : dock
      )
    );

    message.success(`Dock ${selectedDock.number} is now ${newStatus}`);
    setIsModalVisible(false);
    setSelectedPlate('');
  };

  // Filtrar muelles según el estado seleccionado
  const filteredDocks = docks.filter(dock => {
    if (filter === 'occupied') return dock.status === 'Occupied';
    if (filter === 'available') return dock.status === 'Available';
    return true;
  });

  return (
    <div>
      <h1>Available Docks</h1>
      <Radio.Group 
        value={filter} 
        onChange={e => setFilter(e.target.value)}
        style={{ marginBottom: '20px' }}
      >
        <Radio.Button value="all">All</Radio.Button>
        <Radio.Button value="available">Available</Radio.Button>
        <Radio.Button value="occupied">Occupied</Radio.Button>
      </Radio.Group>

      {isLoading ? <Spin /> : (
        <Row gutter={[16, 16]}>
          {filteredDocks.map(dock => (
            <Col span={4} key={dock.id}>
              <Card
                title={`Dock ${dock.number}`}
                style={{ 
                  backgroundColor: dock.status === 'Available' ? '#d4edda' : '#f8d7da',
                  cursor: 'pointer'
                }}
                onClick={() => handleCardClick(dock)}
              >
                {dock.status === 'Available' ? 
                  <WarehouseOutlined style={{ fontSize: '40px', color: 'green' }} /> : 
                  <TruckOutlined style={{ fontSize: '40px', color: 'red' }} />
                }
                <p>Status: {dock.status}</p>
                {dock.plate && <p>Plate: {dock.plate}</p>}
                <p>Warehouse: {warehouses[dock.warehouse] || 'Unknown'}</p>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={selectedDock?.status === 'Available' ? "Assign Truck" : "Release Dock"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleAssignPlate}
          >
            {selectedDock?.status === 'Available' ? 'Assign' : 'Release'}
          </Button>
        ]}
      >
        {selectedDock?.status === 'Available' && (
          <>
            <Text>Select a plate:</Text>
            <Select
              style={{ width: '100%', marginTop: '10px' }}
              value={selectedPlate}
              onChange={setSelectedPlate}
              placeholder="Select a plate"
            >
              {availablePlates.map(vehicle => (
                <Option key={vehicle.id} value={vehicle.plate}>
                  {vehicle.plate}
                </Option>
              ))}
            </Select>
          </>
        )}
        {selectedDock?.status === 'Occupied' && (
          <p>Are you sure you want to release this dock?</p>
        )}
      </Modal>
    </div>
  );
};

export default Muelles;
