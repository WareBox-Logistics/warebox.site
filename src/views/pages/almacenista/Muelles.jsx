import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Col, Row, Spin, message, Radio, Pagination } from 'antd';
import { authToken, API_URL_DOCK, API_URL_DOCK_ASSIGNMENT } from '../../../services/services'; // Ensure these are correctly exported
import { TruckOutlined } from '@ant-design/icons'; // Import Ant Design icons
import { WarehouseOutlined } from "@mui/icons-material";

const Muelles = () => {
  const [docks, setDocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // State for filtering
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [pageSize] = useState(6); // Number of docks per page

  useEffect(() => {
    fetchDocks();
  }, []);

  const fetchDocks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_DOCK, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setDocks(response.data); // Store all docks
    } catch (error) {
      console.error('Error fetching docks:', error);
      message.error("Error fetching docks");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDockStatus = async (dockId, truckId, currentStatus) => {
    const newStatus = currentStatus === 'Available' ? 'Occupied' : 'Available';

    try {
      await axios.put(`${API_URL_DOCK_ASSIGNMENT}/${dockId}/${truckId}`, {
        status: newStatus
      }, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      // Update local state after changing the status in the database
      setDocks(docks.map(dock => (dock.id === dockId ? { ...dock, status: newStatus } : dock)));
    } catch (error) {
      console.error('Error updating dock status:', error);
      message.error("Error updating dock status");
    }
  };

  // Filter docks based on selected status
  const filteredDocks = docks.filter(dock => {
    if (filter === 'occupied') return dock.status === 'Occupied';
    if (filter === 'available') return dock.status === 'Available';
    return true; // 'all'
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocks = filteredDocks.slice(startIndex, startIndex + pageSize);

  return (
    <div>
      <h1>Available Docks</h1>
      <Radio.Group value={filter} onChange={e => setFilter(e.target.value)} style={{ marginBottom: 16 }}>
        <Radio.Button value="all">All</Radio.Button>
        <Radio.Button value="available">Available</Radio.Button>
        <Radio.Button value="occupied">Occupied</Radio.Button>
      </Radio.Group>
      {isLoading ? (
        <Spin />
      ) : (
        <>
          <Row gutter={16}>
            {paginatedDocks.map(dock => (
              <Col span={4} key={dock.id}>
                <Card
                  title={`Dock ${dock.number}`}
                  variant="bordered"
                  style={{ 
                    backgroundColor: dock.status === 'Available' ? '#d4edda' : '#f8d7da',
                    textAlign: 'center'
                  }}
                  onClick={() => toggleDockStatus(dock.id, dock.truckId, dock.status)}
                >
                  {dock.status === 'Available' ? (
                    <WarehouseOutlined style={{ fontSize: '40px', color: 'green' }} />
                  ) : (
                    <TruckOutlined style={{ fontSize: '40px', color: 'red' }} />
                  )}
                  <p>Status: {dock.status}</p>
                  <p>Warehouse: {dock.warehouse.name}</p>
                </Card>
              </Col>
            ))}
          </Row>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredDocks.length}
            onChange={page => setCurrentPage(page)}
            style={{ marginTop: 16, textAlign: 'center' }}
          />
        </>
      )}
    </div>
  );
};

export default Muelles;
