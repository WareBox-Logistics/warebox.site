import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button, message, Spin, Modal, Table } from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import axios from 'axios';
import { authToken, API_URL_WAREHOUSE, API_URL_DOCK } from '../../../services/services';

// Componente principal para gestionar las sedes (almacenes)
const Sedes = () => {
  // Definición de los estados utilizados en el componente
  const [sedes, setSedes] = useState([]); // Lista de sedes (almacenes)
  const [newWarehouse, setNewWarehouse] = useState({
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
    loadAllData();
  }, []);

  // Función para cargar todos los datos necesarios
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // Cargar ambos conjuntos de datos en paralelo para mejorar el rendimiento
      const [docksResponse, warehousesResponse] = await Promise.all([
        axios.get(API_URL_DOCK, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json',
          },
        }),
        axios.get(API_URL_WAREHOUSE, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json',
          },
        })
      ]);
      
      // Guardar los datos de los muelles en el estado
      const docksData = docksResponse.data || [];
      setDocks(docksData);
      console.log('Docks fetched:', docksData);
      
      // Procesar los datos de los almacenes
      const warehousesData = warehousesResponse.data.warehouses || [];
      console.log('Warehouses fetched:', warehousesData);
      
      // Procesar cada almacén para añadir información adicional
      const warehousesWithDetails = await Promise.all(
        warehousesData.map(async (sede) => {
          if (!sede || !sede.id) {
            console.warn('Warehouse without ID detected', sede);
            return sede;
          }
          
          // Obtener la dirección a partir de las coordenadas
          const address = await getAddressFromCoordinates(sede.latitude, sede.longitude);
          
          // Contar los muelles asociados a este almacén usando los datos ya disponibles
          const loadingPorts = Array.isArray(docksData) 
            ? docksData.filter(dock => dock.warehouse === sede.id).length
            : 0;
          
          // Generar datos aleatorios para capacidades
          const totalCapacity = Math.floor(Math.random() * (1500 - 1000) + 1000);
          const availableCapacity = Math.floor(Math.random() * totalCapacity);
          
          // Guardar la dirección en el estado para posible uso posterior
          setAddresses(prev => ({ ...prev, [sede.id]: address }));
          
          // Devolver el objeto almacén enriquecido con datos adicionales
          return {
            ...sede,
            address,
            loadingPorts,
            totalCapacity: `${totalCapacity}m²`,
            availableCapacity: `${availableCapacity}m²`
          };
        })
      );
      
      // Actualizar el estado con los almacenes procesados
      setSedes(warehousesWithDetails);
    } catch (error) {
      console.error('Error loading data:', error);
      message.error("Error al cargar los datos");
      setSedes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener una dirección a partir de coordenadas usando la API de Geoapify
  const getAddressFromCoordinates = async (latitude, longitude) => {
    if (!latitude || !longitude) {
      return "Coordenadas no disponibles";
    }
    
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=1e04d45942e14fc08e027a765556fd59`;
    try {
      const response = await fetch(url);
      const result = await response.json();

      if (result.features && result.features.length > 0) {
        const formattedAddress = result.features[0].properties.formatted;
        return formattedAddress;
      } else {
        return "Dirección no encontrada";
      }
    } catch (error) {
      console.error('Error getting address:', error);
      return "Error al obtener la dirección";
    }
  };

  // Handle input changes para el formulario de nuevo almacén
  const handleInputChange = (e) => {
    setNewWarehouse({
      ...newWarehouse,
      [e.target.name]: e.target.value,
    });
  };

  // Filtrar almacenes basado en la búsqueda
  const filteredWarehouses = Array.isArray(sedes)
    ? sedes.filter((warehouse) =>
        (warehouse.name && warehouse.name.toLowerCase().includes(search.toLowerCase())) ||
        (warehouse.address && warehouse.address.toLowerCase().includes(search.toLowerCase()))
      )
    : [];

  // Paginar los resultados filtrados
  const paginatedSedes = filteredWarehouses.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  // Definición de columnas para la tabla
  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "Dirección", dataIndex: "address", key: "address" },
    { title: "Capacidad Total", dataIndex: "totalCapacity", key: "totalCapacity" },
    { title: "Capacidad Disponible", dataIndex: "availableCapacity", key: "availableCapacity" },
    { title: "Muelles de Carga", dataIndex: "loadingPorts", key: "loadingPorts" },
  ];

  // Manejar cambios en el input de búsqueda
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Resetear a la primera página cuando cambia la búsqueda
  };

  // Manejar el refresco manual de datos
  const handleRefresh = () => {
    loadAllData();
  };

  return (
    <div className="sedes-container">
      <h1>Gestión de Almacenes</h1>

      {/* Campo de búsqueda y botón de refresco */}
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={18}>
          <Input
            placeholder="Buscar por nombre o dirección del almacén"
            value={search}
            onChange={handleSearchChange}
            prefix={<SearchOutlined />}
          />
        </Col>
        <Col span={6}>
          <Button 
            type="primary" 
            onClick={handleRefresh}
            loading={isLoading}
          >
            Actualizar Datos
          </Button>
        </Col>
      </Row>

      {/* Tabla de Almacenes */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p>Cargando datos...</p>
        </div>
      ) : (
        <div style={{ 
          maxHeight: '1500px', 
          overflowY: 'auto', 
          border: '1px solid #ddd', 
          padding: '16px', 
          borderRadius: '4px',
          width: '100%',
          margin: '0 auto', 
        }}>
          {paginatedSedes.length > 0 ? (
            <Table
              dataSource={paginatedSedes}
              columns={columns}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredWarehouses.length,
                onChange: (page) => setCurrentPage(page),
                showSizeChanger: false,
              }}
              style={{ width: '100%' }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              No se encontraron almacenes con los criterios de búsqueda
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sedes;