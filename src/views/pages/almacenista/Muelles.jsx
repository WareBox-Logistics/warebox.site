import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Col, Row, Spin, message, Space, Modal, Button, Select, Collapse, Typography, Tag, Calendar, Badge, List, Descriptions } from 'antd';
import moment from 'moment';
import { Paper } from '@mui/material';
import MainCard from "ui-component/cards/MainCard";
import {
    authToken,
    API_URL_DOCK,
    API_URL_WAREHOUSE,
    API_URL_DOCK_ALL_ASS,
    API_URL_FILTERED_DELIVERY,
    API_URL_VEHICLE
} from '../../../services/services';


const { Title, Text } = Typography;

const Muelles = () => {
    const [docks, setDocks] = useState([]);
    const [warehouses, setWarehouses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedDock, setSelectedDock] = useState(null);
    const [warehouseFilter, setWarehouseFilter] = useState('all');
    const [dockReservations, setDockReservations] = useState([]);
    const [reservationsLoading, setReservationsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateReservations, setDateReservations] = useState([]);
    const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [deliveryDetails, setDeliveryDetails] = useState(null);
    const [assignedVehicles, setAssignedVehicles] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchWarehouses();
            await fetchDocks();
            await fetchVehicles();
            setIsLoading(false);
        };
        loadData();
    }, []);

    const fetchVehicles = async() => {
        try {
            const response = await axios.get(API_URL_VEHICLE, {
                headers: { 'Authorization': authToken }
            });
            setVehicles(response.data.vehicles);
        } catch (error) {
            message.error("Error fetching vehicles");
            console.error("Error fetching vehicles:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchReservationDetails = async (reservation) => {
        try {
          setIsLoading(true);
          
          const deliveryResponse = await axios.get(
            `${API_URL_FILTERED_DELIVERY}${reservation.delivery_id}`,
            { headers: { 'Authorization': authToken } }
          );
          
          console.log(reservation)
          
          const deliveryVehicles = vehicles.filter(
            vehicle => vehicle.id === reservation.delivery_details.truck || 
                      vehicle.id === reservation.delivery_details.trailer
          );
      
          setDeliveryDetails(deliveryResponse.data);
          setAssignedVehicles(deliveryVehicles);
          setDeliveryModalVisible(true);
          
        } catch (error) {
          message.error("Error loading details");
          console.error("Error:", error);
        } finally {
          setIsLoading(false);
        }
      };
       

    const fetchDockReservations = async(dock) => {
        try {
            const response = await axios.get(`${API_URL_DOCK_ALL_ASS}${dock}`, {
                headers: { 'Authorization': authToken }
            });
            setDockReservations(response.data.data);
        } catch (error) {
            message.error("Error loading dock reservations");
            console.error("Error:", error);
        } finally {
            setReservationsLoading(false);
        }
    }

    const handleDockSelect = (dock) => {
        setSelectedDock(dock);
        fetchDockReservations(dock.id);
      };

      const handleDateSelect = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        const reservations = dockReservations.filter(res => 
          moment(res.scheduled_time).format('YYYY-MM-DD') === dateStr
        );
        
        setDateReservations(reservations);
        setSelectedDate(value);
      };
    
      const handleReservationClick = async (reservation) => {
        await fetchReservationDetails(reservation);
      };
    
      const dateCellRender = (value) => {
        const dateStr = value.format('YYYY-MM-DD');
        const dayReservations = dockReservations.filter(res => 
          moment(res.scheduled_time).format('YYYY-MM-DD') === dateStr
        );
    
        return (
          <div 
            style={{ 
              height: '100%',
              minHeight: '80px',
              overflow: 'hidden'
            }}
            onClick={() => handleDateSelect(value)}
          >
            {dayReservations.map(res => (
              <div 
                key={res.id}
                style={{
                  margin: '2px',
                  padding: '2px',
                  background: '#f0f0f0',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReservationClick(res);
                }}
              >
                {moment(res.scheduled_time).format('HH:mm')} - {res.delivery_details?.truck || 'N/A'}
              </div>
            ))}
          </div>
        );
      };


    const fetchDocks = async () => {
        try {
          const response = await axios.get(API_URL_DOCK, { 
            headers: { 'Authorization': authToken }
          });
          
          if (!warehouses || Object.keys(warehouses).length === 0) {
            await fetchWarehouses();
          }
      
          const docksWithWHName = response.data.map(dock => ({
            ...dock, 
            warehouseName: warehouses[dock.warehouse] || 'Unknown Warehouse'
          }));
      
          setDocks(docksWithWHName);
        } catch (error) {
          message.error("Error fetching docks");
          console.error("Error fetching docks:", error);
        }
      };

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get(API_URL_WAREHOUSE, { 
                headers: { 'Authorization': authToken }
            });
            const warehouseMap = response.data.warehouses.reduce((map, warehouse) => {
                map[warehouse.id] = warehouse.name;
                return map;
            }, {});
            setWarehouses(warehouseMap);
        } catch (error) {
            message.error("Error fetching warehouses");
            console.error("Error fetching warehouses:", error);
        }
    };


    const handleCloseModal = () => {
        setDeliveryModalVisible(false);
        setSelectedDock(null);
    };

    
    const filteredDocks = docks.filter(dock => {
        const statusMatch = 
          filter === 'all' || 
          (filter === 'available' && dock.status === 'Available') ||
          (filter === 'occupied' && dock.status === 'Occupied');
        
        const warehouseMatch = 
          warehouseFilter === 'all' || 
          dock.warehouse.toString() === warehouseFilter;
        
        return statusMatch && warehouseMatch;
      });



    return (
    <Paper sx={{ padding: '16px' }}>
        <MainCard title="Dock visualization">        
            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p>Loading docks...</p>
                </div>
            ) : (
                <>
                <Col>
                   <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                        <Col>
                            <Select
                            value={warehouseFilter}
                            onChange={setWarehouseFilter}
                            style={{ width: 200 }}
                            >
                            <Select.Option value="all">All warehouses</Select.Option>
                            {Object.entries(warehouses).map(([id, name]) => (
                                <Select.Option key={id} value={id}>
                                {name}
                                </Select.Option>
                            ))}
                            </Select>
                        </Col>
                        <Col>
                        
                            <Select
                            value={filter}
                            onChange={setFilter}
                            style={{ width: 200 }}
                            >
                            <Select.Option value="all">All</Select.Option>
                            <Select.Option value="available">Available</Select.Option>
                            <Select.Option value="occupied">Occupied</Select.Option>
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                    {filteredDocks.map((dock) => (
                                <Col xs={24} sm={12} md={12} lg={6} xl={6} key={dock.id}>
                                <Card
                                    title={`Dock #${dock.number}`}
                                    style={{
                                    cursor: 'pointer',
                                    height: '100%' 
                                    }}
                                    onClick={() => {
                                        handleDockSelect(dock)
                                    }}
                                >
                                    <Space direction="vertical" size="small">
                                    <div>
                                        <strong style={{marginRight:'10px'}}>Status:</strong> 
                                        {dock.status == 'Available' ? (
                                        <Tag color="green">Available</Tag>
                                        ) : (
                                        <Tag color="red">Occupied</Tag>
                                        )}
                                    </div>
                                    {/* Add more dock information as needed */}
                                    <div><strong>Warehouse:</strong> {dock.warehouseName || 'N/A'}</div>
                                    <div><strong>Type:</strong> {dock.type || 'N/A'}</div>
                                    </Space>
                                </Card>
                                </Col>
                    ))}
                    </Row>
                    {selectedDock && (
                        <div style={{ marginTop: 24 }}>
                            <Title level={4} style={{ marginBottom: 16 }}>
                            Reservations for Dock #{selectedDock.number}
                            </Title>
                            <Calendar
                            dateCellRender={dateCellRender}
                            mode="month"
                            style={{
                                border: '1px solid #f0f0f0',
                                borderRadius: '8px',
                                padding: '16px'
                            }}
                            />
                        </div>
                        )}

                        {/* Selected Date Reservations */}
                        {selectedDate && dateReservations.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                            <Title level={5}>
                            Reservations on {selectedDate.format('MMMM D, YYYY')}
                            </Title>
                            <List
                            dataSource={dateReservations}
                            renderItem={res => (
                                <List.Item 
                                onClick={() => handleReservationClick(res)}
                                style={{ cursor: 'pointer' }}
                                >
                                <List.Item.Meta
                                    title={`Truck: ${res.delivery_details?.truck || 'N/A'}`}
                                    description={
                                    <>
                                        <div>{moment(res.scheduled_time).format('h:mm A')} - {moment(res.scheduled_time).add(res.duration_minutes, 'minutes').format('h:mm A')}</div>
                                        <div>Status: <Tag color={res.status === 'completed' ? 'green' : 'orange'}>{res.status}</Tag></div>
                                    </>
                                    }
                                />
                                </List.Item>
                            )}
                            />
                        </div>
                        )}
                    </Col>
                </>
            )}

                <Modal
                title={`Delivery #${deliveryDetails?.delivery_id || ''}`}
                open={deliveryModalVisible}
                onCancel={() => setDeliveryModalVisible(false)}
                width={800}
                footer={null}
                >
                {isLoading ? (
                    <Spin tip="Loading details..." />
                ) : (
                    <div style={{height:'65vh', overflowY:'auto'}}>
                    {/* Delivery Information */}
                    <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
                        <Descriptions.Item label="Status">
                        <Tag color={
                            deliveryDetails?.status === 'Completed' ? 'green' :
                            deliveryDetails?.status === 'Cancelled' ? 'red' : 'orange'
                        }>
                            {deliveryDetails?.status}
                        </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Origin">{deliveryDetails?.origin}</Descriptions.Item>
                        <Descriptions.Item label="Destination">{deliveryDetails?.destination}</Descriptions.Item>
                    </Descriptions>

                    <Title level={5} style={{ marginBottom: 16 }}>Assigned Vehicles</Title>
                    <Row gutter={16}>
                        {assignedVehicles.map(vehicle => (
                        <Col span={12} key={vehicle.id}>
                            <Card size="small">
                            <Descriptions column={1}>
                                <Descriptions.Item label="Type">{vehicle.type}</Descriptions.Item>
                                <Descriptions.Item label="Plates">{vehicle.plates}</Descriptions.Item>
                                <Descriptions.Item label="Model">{vehicle.model?.name}</Descriptions.Item>
                                <Descriptions.Item label="Volume">{vehicle.volume} m³</Descriptions.Item>
                            </Descriptions>
                            </Card>
                        </Col>
                        ))}
                    </Row>

                    <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>Pallets</Title>
                    <Collapse>
                        {deliveryDetails?.pallets?.map(pallet => (
                        <Collapse.Panel 
                            key={pallet.pallet_id} 
                            header={`Pallet #${pallet.pallet_id}`}
                        >
                            <List
                            dataSource={pallet.boxes}
                            renderItem={box => (
                                <List.Item>
                                <List.Item.Meta
                                    title={box.product_name}
                                    description={
                                    <div>
                                        <div>SKU: {box.product_sku}</div>
                                        <div>Quantity: {box.quantity}</div>
                                    </div>
                                    }
                                />
                                </List.Item>
                            )}
                            />
                        </Collapse.Panel>
                        ))}
                    </Collapse>
                    </div>
                )}
                </Modal>
        </MainCard>
        </Paper>
    );
};

export default Muelles;