import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Col, Row, Spin, message, Radio, Pagination, Modal, Button, Select, DatePicker, TimePicker, InputNumber, Form } from 'antd';
import { TruckOutlined } from "@ant-design/icons";
import { WarehouseOutlined } from "@mui/icons-material";
import moment from 'moment';
import {
    authToken,
    API_URL_DOCK,
    API_URL_WAREHOUSE,
    API_URL_FREE_TRUCKS,
    API_URL_FREE_TRAILERS
} from '../../../services/services';

const Muelles = () => {
    const [docks, setDocks] = useState([]);
    const [warehouses, setWarehouses] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(18);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedDock, setSelectedDock] = useState(null);
    const [freeTrucks, setFreeTrucks] = useState([]);
    const [freeTrailers, setFreeTrailers] = useState([]);
    const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
    const [form] = Form.useForm();
    const [isReserving, setIsReserving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            await fetchDocks();
            await fetchWarehouses();
            setIsLoading(false);
        };
        loadData();
    }, []);

    useEffect(() => {
        if (isModalVisible) {
            const loadVehicles = async () => {
                setVehiclesLoaded(false);
                await fetchFreeVehicles();
                setVehiclesLoaded(true);
            };
            loadVehicles();
        }
    }, [isModalVisible]);

    const fetchDocks = async () => {
        try {
            const response = await axios.get(API_URL_DOCK, { 
                headers: { 'Authorization': authToken }
            });
            setDocks(response.data);
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

    const fetchFreeVehicles = async () => {
        try {
            const [truckResponse, trailerResponse] = await Promise.all([
                axios.get(API_URL_FREE_TRUCKS, { headers: { Authorization: authToken } }),
                axios.get(API_URL_FREE_TRAILERS, { headers: { Authorization: authToken } })
            ]);
            
            setFreeTrucks(truckResponse.data.trucks || []);
            setFreeTrailers(trailerResponse.data.trailers || []);
        } catch (error) {
            message.error("Error fetching free vehicles.");
            console.error("Error fetching free vehicles:", error);
        }
    };

    const handleCardClick = (dock) => {
        // Solo permite seleccionar muelles disponibles
        if (dock.status !== 'Available') {
            message.info("Este muelle está ocupado y no puede ser reservado");
            return;
        }
        
        setSelectedDock(dock);
        form.resetFields(); // Reset form fields before showing the modal
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedDock(null);
        form.resetFields();
    };

    const assignVehicleToDock = async () => {
        try {
            setIsReserving(true);
            await form.validateFields();
            const formValues = form.getFieldsValue();

            const scheduledDateTime = moment(formValues.scheduledDate)
                .hour(formValues.scheduledTime.hours())
                .minute(formValues.scheduledTime.minutes())
                .format('YYYY-MM-DD HH:mm:ss');

            const response = await axios.post(
                'http://127.0.0.1:8000/api/docks/reserve',
                {
                    dock_id: selectedDock.id,
                    truck_id: formValues.vehicleId,
                    start_time: scheduledDateTime,
                    duration_minutes: formValues.durationMinutes
                },
                {
                    headers: {
                        'Authorization': authToken,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                message.success("Muelle reservado correctamente.");
                fetchDocks(); // Refresh docks after successful reservation
                handleCloseModal();
            } else {
                message.error("Error al reservar el muelle.");
            }
        } catch (error) {
            console.error("Error completo:", error);
            if (error.response && error.response.status === 409) {
                message.error("El muelle no está disponible en el horario seleccionado.");
                console.error("Conflicto:", error.response.data.conflict);
            } else {
                message.error("Error al reservar el muelle: " + (error.message || 'Unknown error'));
            }
        } finally {
            setIsReserving(false);
        }
    };
    
    const filteredDocks = docks.filter(dock => {
        if (filter === 'occupied') return dock.status === 'Occupied';
        if (filter === 'available') return dock.status === 'Available';
        return true;
    });

    const paginatedDocks = filteredDocks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div>
            <h1>Gestión de Muelles</h1>
            <Radio.Group value={filter} onChange={e => setFilter(e.target.value)} style={{ marginBottom: 16 }}>
                <Radio.Button value="all">Todos</Radio.Button>
                <Radio.Button value="available">Disponibles</Radio.Button>
                <Radio.Button value="occupied">Ocupados</Radio.Button>
            </Radio.Group>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <p>Cargando muelles...</p>
                </div>
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {paginatedDocks.map(dock => (
                            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={dock.id}>
                                <Card
                                    title={`Muelle ${dock.number}`}
                                    style={{ 
                                        backgroundColor: dock.status === 'Available' ? '#d4edda' : '#f8d7da', 
                                        textAlign: 'center',
                                        cursor: dock.status === 'Available' ? 'pointer' : 'default'
                                    }}
                                    onClick={() => handleCardClick(dock)}
                                >
                                    {dock.status === 'Available' ? (
                                        <WarehouseOutlined style={{ fontSize: '40px', color: 'green' }} />
                                    ) : (
                                        <TruckOutlined style={{ fontSize: '40px', color: 'red' }} />
                                    )}
                                    <p>Estado: {dock.status === 'Available' ? 'Disponible' : 'Ocupado'}</p>
                                    <p>Almacén: {warehouses[dock.warehouse] || 'Desconocido'}</p>
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

            <Modal
                title="Reservar Muelle"
                open={isModalVisible}
                onCancel={handleCloseModal}
                destroyOnClose={true}
                footer={[
                    <Button key="cancel" onClick={handleCloseModal}>
                        Cancelar
                    </Button>,
                    <Button 
                        key="assign" 
                        type="primary" 
                        onClick={assignVehicleToDock}
                        loading={isReserving}
                    >
                        Reservar
                    </Button>,
                ]}
            >
                {selectedDock && (
                    <Form
                        form={form}
                        layout="vertical"
                        preserve={false}
                        initialValues={{
                            durationMinutes: 60,
                            scheduledDate: moment(),
                            scheduledTime: moment(),
                        }}
                    >
                        <Form.Item
                            label="Almacén"
                        >
                            <span>{warehouses[selectedDock.warehouse] || 'Desconocido'}</span>
                        </Form.Item>
                        
                        <Form.Item
                            label="Vehículo"
                            name="vehicleId"
                            rules={[{ required: true, message: 'Por favor selecciona un vehículo' }]}
                        >
                            <Select
                                placeholder="Selecciona un vehículo"
                                loading={!vehiclesLoaded}
                                getPopupContainer={trigger => trigger.parentNode}
                            >
                                <Select.OptGroup label="Camiones">
                                    {freeTrucks.map(truck => (
                                        <Select.Option key={truck.id} value={truck.id}>
                                            {truck.plates} - {truck.model}
                                        </Select.Option>
                                    ))}
                                </Select.OptGroup>
                                <Select.OptGroup label="Remolques">
                                    {freeTrailers.map(trailer => (
                                        <Select.Option key={trailer.id} value={trailer.id}>
                                            {trailer.plates} - {trailer.model}
                                        </Select.Option>
                                    ))}
                                </Select.OptGroup>
                            </Select>
                        </Form.Item>
                        
                        <Form.Item
                            label="Fecha programada"
                            name="scheduledDate"
                            rules={[{ required: true, message: 'Por favor selecciona una fecha' }]}
                        >
                            <DatePicker style={{ width: '100%' }} getPopupContainer={trigger => trigger.parentNode} />
                        </Form.Item>
                        
                        <Form.Item
                            label="Hora programada"
                            name="scheduledTime"
                            rules={[{ required: true, message: 'Por favor selecciona una hora' }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: '100%' }} getPopupContainer={trigger => trigger.parentNode} />
                        </Form.Item>
                        <Form.Item
                            label="Duración (minutos)"
                            name="durationMinutes"
                            rules={[
                                { required: true, message: 'Por favor ingresa la duración' },
                                { type: 'number', min: 15, max: 240, message: 'La duración debe estar entre 15 y 240 minutos' }
                            ]}
                        >
                            <InputNumber min={15} max={240} style={{ width: '100%' }} />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default Muelles;