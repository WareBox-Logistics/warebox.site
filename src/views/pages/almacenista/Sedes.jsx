import React, { useState, useEffect } from "react"; // Importación de hooks de React
import { Row, Col, Input, Button, message, Spin, Modal, Table } from "antd"; // Componentes de la librería Ant Design
import { SearchOutlined, EyeOutlined } from "@ant-design/icons"; // Íconos de Ant Design
import { getSedes, saveSedes } from "/src/api/sedes.js"; // Métodos importados (actualmente no utilizados)
import axios from 'axios'; // Librería para realizar peticiones HTTP
import { authToken, API_URL_WAREHOUSE, API_URL_DOCK } from '../../../services/services'; // Variables de configuración y servicios


// Componente principal para gestionar las sedes (almacenes)
const Sedes = () => {
  // Definición de los estados utilizados en el componente
  const [sedes, setSedes] = useState([]); // Lista de sedes (almacenes)
  const [newWarehouse, setNewWarehouse] = useState({ // Objeto para el formulario de nuevo warehouse
    name: "",
    address: "",
    totalCapacity: 0,
    availableCapacity: 0,
    loadingPorts: 0,
    latitude: 0,
    longitude: 0,
  });
  const [search, setSearch] = useState(""); // Valor de búsqueda
  const [isLoading, setIsLoading] = useState(true); // Estado que indica si se están cargando datos
  const [addresses, setAddresses] = useState({}); // Objeto para almacenar las direcciones de cada warehouse
  const [docks, setDocks] = useState([]); // Lista de muelles (docks)
  const [currentPage, setCurrentPage] = useState(1); // Página actual de la tabla
  const [pageSize] = useState(8); // Tamaño de la página para la paginación de la tabla
  const [newDock, setNewDock] = useState({
    name: "",
    status: "active",
    warehouse: null
  });

useEffect(() => {
  fetchDocks(); // Obtiene los muelles
  fetchSedes(); // Obtiene las sedes (almacenes)
}, []);

  const fetchDocks = async () => {
    try {
      const response = await axios.get(API_URL_DOCK, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      console.log('Docks fetched:', response.data);
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

      // Modificar los datos con valores ficticios
      const warehousesWithRandomData = warehouses.map(async (sede) => {
        const address = await getAddressFromCoordinates(sede.latitude, sede.longitude);
        const loadingPorts = getLoadingPortsCount(sede.id);
        
        // Generar área base aleatoria entre 1000 y 1500 m²
        const totalCapacity = Math.floor(Math.random() * (1500 - 1000) + 1000);
        const availableCapacity = Math.floor(Math.random() * totalCapacity);
        
        setAddresses(prev => ({ ...prev, [sede.id]: address }));
        
        return {
          ...sede,
          address,
          loadingPorts,
          totalCapacity: `${totalCapacity}m²`,
          availableCapacity: `${availableCapacity}m²`
        };
      });

      const warehousesWithDetails = await Promise.all(warehousesWithRandomData);
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

      if (result.features && result.features.length > 0) {
        const formattedAddress = result.features[0].properties.formatted;
        return formattedAddress;
      } else {
        return "Addresse not found";
      }
    } catch (error) {
      return "Error getting address";
    }
  };

  const getLoadingPortsCount = (warehouseId) => {
    console.log('Warehouse ID:', warehouseId); // Verifica el ID del warehouse
    const loadingPorts = docks.filter(dock => dock.warehouse === warehouseId);
    console.log('Loading Ports:', loadingPorts); // Verifica los muelles filtrados
    return loadingPorts.length;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setNewWarehouse({
      ...newWarehouse,
      [e.target.name]: e.target.value,
    });
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
  ];

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="sedes-container">
      <h1>Warehouse Management</h1>

      {/* Campo de búsqueda y botón */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={18}>
          <Input
            placeholder="Buscar por nombre de warehouse"
            value={search}
            onChange={handleSearchChange}
          />
        </Col>
      </Row>

      {/* Warehouse Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ 
          maxHeight: '1500px', 
          overflowY: '100%', 
          border: '1px solid #ddd', 
          padding: '16px', 
          borderRadius: '4px',
          width: '100%',  // Asegura que use todo el ancho disponible
          margin: '0 auto', // Centra el contenedor
        }}>
          <Table
            dataSource={paginatedSedes}
            columns={columns}
            rowKey="id"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: sedes.length,
              onChange: (page) => setCurrentPage(page),
            }}
            // scroll={{ y: 340, x: 1100 }} // Añadido scroll horizontal
            style={{ width: '100%' }}
          />
        </div>
      )}
    </div>
  );
};

export default Sedes;





