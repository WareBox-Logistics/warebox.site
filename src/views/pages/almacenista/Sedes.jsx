import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button, message, Spin, Modal, Table } from "antd";
import { SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getSedes, saveSedes } from "/src/api/sedes.js";
import { WarehouseOutlined } from "@mui/icons-material";
import axios from 'axios';
import { authToken, API_URL_WAREHOUSE, API_URL_DOCK } from '../../../services/services';

const Sedes = () => {
  const [sedes, setSedes] = useState([]);
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    address: "",
    totalCapacity: 0,
    availableCapacity: 0,
    loadingPorts: 0,
    latitude: 0,
    longitude: 0,
    id_routing_net: "",
    source: "",
    target: "",
  });
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingWarehouse, setDeletingWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState({});
  const [docks, setDocks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    fetchDocks();
    fetchSedes();
  }, []);

  const fetchDocks = async () => {
    try {
      const response = await axios.get(API_URL_DOCK, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setDocks(response.data);
    } catch (error) {
      console.error('Error fetching docks:', error);
      message.error("Error fetching docks");
    }
  };

  const fetchSedes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_WAREHOUSE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      const warehouses = response.data.warehouses || [];
      
      // Obtener direcciones y loading ports para cada warehouse
      const warehousesWithDetails = await Promise.all(warehouses.map(async (sede) => {
        const address = await getAddressFromCoordinates(sede.latitude, sede.longitude);
        const loadingPorts = getLoadingPortsCount(sede.id);
        setAddresses(prev => ({ ...prev, [sede.id]: address }));
        return { ...sede, address, loadingPorts };
      }));

      setSedes(warehousesWithDetails);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      message.error("Error fetching warehouses");
      setSedes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=1e04d45942e14fc08e027a765556fd59`;
    try {
      const response = await fetch(url);
      const result = await response.json();
      console.log('Geocoding response:', result);
      if (result.features && result.features.length > 0) {
        const formattedAddress = result.features[0].properties.formatted;
       // console.log('Formatted Address:', formattedAddress);
        return formattedAddress;
      } else {
        console.error("Error fetching address:", result);
        return "Addresse not found";
      }
    } catch (error) {
      //console.error("Error fetching address:", error);
      return "Error getting address";
    }
  };

  const getLoadingPortsCount = (warehouseId) => {
    const loadingPorts = docks.filter(dock => dock.warehouse === warehouseId);
    console.log(`Warehouse ID: ${warehouseId}, Loading Ports Count: ${loadingPorts.length}`);
    return loadingPorts.length;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setNewWarehouse({
      ...newWarehouse,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingWarehouse) {
        // Si estás editando, usa PUT
        await axios.put(`/api/warehouse/${editingWarehouse.id}`, newWarehouse, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json',
          },
        });
        message.success("Warehouse updated successfully");
      } else {
        // Si estás registrando, usa POST
        await axios.post('/api/warehouse', newWarehouse, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json',
          },
        });
        message.success("Warehouse registered successfully");
      }
      fetchSedes(); // Refresca la lista de sedes
      setNewWarehouse({
        name: "",
        address: "",
        totalCapacity: 0,
        availableCapacity: 0,
        loadingPorts: 0,
        latitude: 0,
        longitude: 0,
        id_routing_net: "",
        source: "",
        target: "",
      }); // Resetea el formulario
      setIsModalOpen(false); // Cierra el modal
    } catch (error) {
      console.error('Error saving warehouse:', error);
      message.error("Error saving warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete warehouse
  const handleDeleteWarehouse = () => {
    const updatedSedes = sedes.filter((w) => w.id !== deletingWarehouse.id);
    setSedes(updatedSedes);
    saveSedes(updatedSedes);  // Save after deletion
    setIsDeleteModalOpen(false);
    message.success("Warehouse deleted successfully");
  };

  // Handle edit warehouse
  const handleEditWarehouse = (warehouse) => {
    setEditingWarehouse(warehouse);
    setNewWarehouse(warehouse); // Carga los datos del warehouse en el formulario
    setIsModalOpen(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (warehouse) => {
    setDeletingWarehouse(warehouse);
    setIsDeleteModalOpen(true);
  };

  // Filtered warehouses based on search input
  const filteredWarehouses = Array.isArray(sedes)
    ? sedes.filter((warehouse) =>
        (warehouse.name && warehouse.name.toLowerCase().includes(search.toLowerCase())) ||
        (warehouse.address && warehouse.address.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  const paginatedSedes = filteredWarehouses.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Columns for the table
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Total Capacity", dataIndex: "totalCapacity", key: "totalCapacity" },
    { title: "Available Capacity", dataIndex: "availableCapacity", key: "availableCapacity" },
    { title: "Loading Ports", dataIndex: "loadingPorts", key: "loadingPorts" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEditWarehouse(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleOpenDeleteModal(record)} danger />
        </>
      ),
    },
  ];

  return (
    <div className="sedes-container">
      <h1>Warehouse Management</h1>

      {/* New Warehouse Form */}
      <Row gutter={[16, 16]} style={{ marginBottom: "40px", paddingTop: "20px" }}>
        <Col xs={14} sm={8} md={4}>
          <Input
            placeholder="Warehouse Name"
            name="name"
            value={newWarehouse.name}
            onChange={handleInputChange}
            required
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Input
            placeholder="Address"
            name="address"
            value={newWarehouse.address}
            onChange={handleInputChange}
            required
          />
        </Col>
        <Col xs={14} sm={8} md={4}>
          <Input
            type="number"
            placeholder="Total Capacity"
            name="totalCapacity"
            value={newWarehouse.totalCapacity}
            onChange={handleInputChange}
            required
          />
        </Col>
        <Col xs={14} sm={8} md={4}>
          <Input
            type="number"
            placeholder="Available Capacity"
            name="availableCapacity"
            value={newWarehouse.availableCapacity}
            onChange={handleInputChange}
            required
          />
        </Col>
        <Col xs={14} sm={8} md={4}>
          <Input
            type="number"
            placeholder="Loading Ports"
            name="loadingPorts"
            value={newWarehouse.loadingPorts}
            onChange={handleInputChange}
            required
          />
        </Col>
        <Col xs={14} sm={8} md={4}>
          <Button
            type="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<WarehouseOutlined />}
            block
            size="small"
          >
            Add Warehouse
          </Button>
        </Col>
      </Row>

      {/* Warehouse Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ maxHeight: '800px', overflowY: 'auto', border: '1px solid #ddd', padding: '16px', borderRadius: '4px' }}>
          <Table
            dataSource={paginatedSedes}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filteredWarehouses.length,
              onChange: (page) => setCurrentPage(page),
            }}
            scroll={{ y: 340 }}
          />
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        title={editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
        visible={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input
          name="name"
          placeholder="Warehouse Name"
          value={newWarehouse.name}
          onChange={handleInputChange}
        />
        <Input
          name="address"
          placeholder="Address"
          value={newWarehouse.address}
          onChange={handleInputChange}
        />
        <Input
          type="number"
          placeholder="Total Capacity"
          name="totalCapacity"
          value={newWarehouse.totalCapacity}
          onChange={handleInputChange}
        />
        <Input
          type="number"
          placeholder="Available Capacity"
          name="availableCapacity"
          value={newWarehouse.availableCapacity}
          onChange={handleInputChange}
        />
        <Input
          type="number"
          placeholder="Loading Ports"
          name="loadingPorts"
          value={newWarehouse.loadingPorts}
          onChange={handleInputChange}
        />
        <Input
          name="latitude"
          placeholder="Latitude"
          value={newWarehouse.latitude}
          onChange={handleInputChange}
        />
        <Input
          name="longitude"
          placeholder="Longitude"
          value={newWarehouse.longitude}
          onChange={handleInputChange}
        />
        <Input
          name="id_routing_net"
          placeholder="Routing Net ID"
          value={newWarehouse.id_routing_net}
          onChange={handleInputChange}
        />
        <Input
          name="source"
          placeholder="Source"
          value={newWarehouse.source}
          onChange={handleInputChange}
        />
        <Input
          name="target"
          placeholder="Target"
          value={newWarehouse.target}
          onChange={handleInputChange}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal open={isDeleteModalOpen} onOk={handleDeleteWarehouse} onCancel={() => setIsDeleteModalOpen(false)}>
        <h2>Delete Warehouse</h2>
        <p>Are you sure you want to delete "{deletingWarehouse?.name}"?</p>
      </Modal>
    </div>
  );
};

export default Sedes;





