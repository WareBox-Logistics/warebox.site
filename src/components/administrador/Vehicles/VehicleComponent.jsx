import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Modal, Input, Select, Row, Col, message, Spin, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL_VEHICLE, API_URL_MODEL, API_URL_BRAND, API_URL_DRIVER, authToken } from "services/services";

const { Text } = Typography;

const VehicleComponent = () => {
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    plates: "",
    vin: "",
    model_id: null,
    volume: "",
    driver_id: null,
    type: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchVehicles();
    fetchModels();
    fetchBrands();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_VEHICLE, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(API_URL_MODEL, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      setModels(response.data.models || []);
  
      // Extraer las marcas únicas de los modelos
      const uniqueBrands = response.data.models
        .map((model) => model.brand)
        .filter((brand, index, self) => brand && self.findIndex((b) => b.id === brand.id) === index);
      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
      setBrands([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(API_URL_BRAND, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      setBrands(response.data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(API_URL_DRIVER, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
  
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_VEHICLE, formData, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
  
      const selectedModel = models.find((model) => model.id === formData.model_id);
      setVehicles([...vehicles, { ...response.data.vehicle, model: selectedModel }]);
      message.success("Vehicle added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding vehicle");
      console.error("Error adding vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setSelectedBrand(vehicle.model?.brand_id || null);
    setFormData({
      plates: vehicle.plates || "",
      vin: vehicle.vin || "",
      model_id: vehicle.model?.id || null,
      volume: vehicle.volume || "",
      driver_id: vehicle.driver_id || null,
      type: vehicle.type || "",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_VEHICLE}/${currentVehicle.id}`, formData, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });

      const updatedModel = models.find((model) => model.id === formData.model_id);
      const updatedVehicles = vehicles.map((vehicle) =>
        vehicle.id === currentVehicle.id ? { ...response.data.vehicle, model: updatedModel } : vehicle
      );
      setVehicles(updatedVehicles);
      message.success("Vehicle updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating vehicle");
      console.error("Error updating vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL_VEHICLE}/${currentVehicle.id}`, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      setVehicles(vehicles.filter((v) => v.id !== currentVehicle.id));
      message.success("Vehicle deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting vehicle");
      console.error("Error deleting vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableDrivers = () => {
    const assignedDriverIds = vehicles.map((vehicle) => vehicle.driver_id);
  
    if (isEditMode && currentVehicle?.driver_id) {
      return drivers.filter(
        (driver) => !assignedDriverIds.includes(driver.id) || driver.id === currentVehicle.driver_id
      );
    }
  
    return drivers.filter((driver) => !assignedDriverIds.includes(driver.id));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (value) => {
    const selectedModel = models.find((model) => model.id === value);
    setFormData({
      ...formData,
      model_id: value,
      type: selectedModel?.is_trailer ? "trailer" : "semi_truck",
    });
  };

  const resetForm = () => {
    setFormData({
      plates: "",
      vin: "",
      model_id: null,
      volume: "",
      driver_id: null,
      type: "",
    });
    setSelectedBrand(null);
  };

  const filteredVehicles = vehicles.filter((vehicle) =>
    vehicle.plates ? vehicle.plates.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  const columns = [
    { title: "Plates", dataIndex: "plates", key: "plates" },
    { title: "VIN", dataIndex: "vin", key: "vin" },
    {
        title: "Brand",
        dataIndex: ["model", "brand_id"],
        key: "brand",
        render: (brandId) => brands.find((brand) => brand.id === brandId)?.name || "Unknown Brand",
    },
    {
      title: "Model",
      dataIndex: ["model", "name"],
      key: "model",
      render: (_, record) => record.model?.name || "Unknown Model",
    },
    { title: "Volume (m³)", dataIndex: "volume", key: "volume" },
    {
      title: "Driver",
      dataIndex: "driver_id",
      key: "driver",
      render: (driverId) => {
        const driver = drivers.find((driver) => driver.id === driverId);
        return driver ? `${driver.first_name} ${driver.last_name}` : "No Driver";
      },
    },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditVehicle(record)}>
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteVehicle(record)} style={{ marginLeft: 8 }}>
            Delete
          </Button>
        </span>
      ),
    },
  ];


  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginTop: 20, marginBottom: 10 }}>
        <Col>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Vehicles
          </Typography.Title>
        </Col>
        <Col>
          <Input
            style={{ width: "100%", maxWidth: 300 }}
            prefix={<SearchOutlined />}
            placeholder="Search by plates"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col>
          {/* <Button
            type="default"
            // icon={<LoadingOutlined />}
            onClick={() => {
                setIsLoading(true);
                Promise.all([fetchVehicles(), fetchModels(), fetchBrands()]).finally(() => {
                setIsLoading(false);
                });
            }}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setIsEditMode(false);
            }}
          >
            Add Vehicle
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={filteredVehicles}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={isLoading}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={isEditMode ? "Update Vehicle" : "Add New Vehicle"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        footer={null}
      >
        <form onSubmit={isEditMode ? handleUpdateVehicle : handleAddVehicle}>
          <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>Plates</Typography.Text>
            <Input
              name="plates"
              placeholder="Plates"
              value={formData.plates}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>VIN</Typography.Text>
            <Input
              name="vin"
              placeholder="VIN"
              value={formData.vin}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>Brand</Typography.Text>
            <Select
              placeholder="Select Brand"
              style={{ width: "100%" }}
              value={selectedBrand}
              onChange={(value) => {
                setSelectedBrand(value);
                setFormData({ ...formData, model_id: null });
              }}
              options={brands.map((brand) => ({
                label: brand.name,
                value: brand.id,
              }))}
            />
          </Col>

          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>Model</Typography.Text>
            <Select
              placeholder="Select Model"
              style={{ width: "100%" }}
              value={formData.model_id}
              onChange={handleSelectChange}
              options={models
                .filter((model) => model.brand_id === selectedBrand)
                .map((model) => ({
                  label: model.name,
                  value: model.id,
                }))}
            />
          </Col>

          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>Driver</Typography.Text>
            <Select
              placeholder="Select Driver"
              style={{ width: "100%" }}
              value={formData.driver_id}
              onChange={(value) => setFormData({ ...formData, driver_id: value })}
              options={getAvailableDrivers().map((driver) => ({
                label: `${driver.first_name} ${driver.last_name}`,
                value: driver.id,
              }))}
            />
          </Col>

          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>Type</Typography.Text>
            <Input
              name="type"
              placeholder="Type"
              value={formData.type ? (formData.type === "trailer" ? "Trailer" : "Semi Truck") : undefined}
              disabled
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24}>
            <Typography.Text style={{ color: "#949494 " }}>Volume</Typography.Text>
            <Input
              name="volume"
              placeholder="Volume"
              value={formData.volume}
              onChange={handleChange}
              style={{ width: "100%" }}
            />
          </Col>
            <Col xs={24}>
              <Button
                type="primary"
                htmlType="submit"
                disabled={isSubmitting}
                icon={
                  isSubmitting ? (
                    <Spin
                      indicator={<LoadingOutlined spin style={{ color: "white" }} />}
                    />
                  ) : null
                }
                block
              >
                {isSubmitting ? "Saving..." : isEditMode ? "Update" : "Add"}
              </Button>
            </Col>
          </Row>
        </form>
      </Modal>

      <Modal
        title="Delete Vehicle"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleConfirmDelete}
        confirmLoading={isSubmitting}
      >
        <p>
          Are you sure you want to delete the vehicle "<Text strong>{currentVehicle?.plates}</Text>"?
        </p>
      </Modal>
    </div>
  );
};

export default VehicleComponent;