import React, { useEffect, useState, useRef } from "react";
import { Button, Modal, Input, Select, Row, Col, message, Spin, Typography, Card, Menu, Dropdown } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined, EyeOutlined, MoreOutlined, HomeOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL_VEHICLE, API_URL_MODEL, API_URL_BRAND, API_URL_DRIVER, authToken } from "services/services";
import semiTruckImage from "../../../assets/images/semi_truck2.png";
import trailerImage from "../../../assets/images/trailer2.png";

const { Text, Title } = Typography;

const VehicleComponent = ({ models, brands }) => {
  const [vehicles, setVehicles] = useState([]);
  // const [models, setModels] = useState([]);
  // const [brands, setBrands] = useState([]);
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
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false); // Estado para Add/Edit modal
  const [isViewModalVisible, setIsViewModalVisible] = useState(false); // Estado para View modal
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchVehicles();
    // fetchModels();
    // fetchBrands();
    fetchDrivers();
  }, []);

  useEffect(() => {
    const updatedVehicles = vehicles.map((vehicle) => {
      const updatedModel = models.find((model) => model.id === vehicle.model?.id);
      return updatedModel ? { ...vehicle, model: updatedModel } : vehicle;
    });
    setVehicles(updatedVehicles);
  }, [models]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_VEHICLE, {
        headers: {
          Authorization: authToken,
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

  // const fetchModels = async () => {
  //   try {
  //     const response = await axios.get(API_URL_MODEL, {
  //       headers: {
  //         Authorization: authToken,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     setModels(response.data.models || []);

  //     const uniqueBrands = response.data.models
  //       .map((model) => model.brand)
  //       .filter((brand, index, self) => brand && self.findIndex((b) => b.id === brand.id) === index);
  //     setBrands(uniqueBrands);
  //   } catch (error) {
  //     console.error("Error fetching models:", error);
  //     setModels([]);
  //     setBrands([]);
  //   }
  // };

  // const fetchBrands = async () => {
  //   try {
  //     const response = await axios.get(API_URL_BRAND, {
  //       headers: {
  //         Authorization: authToken,
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     setBrands(response.data.brands || []);
  //   } catch (error) {
  //     console.error("Error fetching brands:", error);
  //     setBrands([]);
  //   }
  // };

  const fetchDrivers = async () => {
    try {
      const response = await axios.get(API_URL_DRIVER, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setDrivers([]);
    }
  };

  const handleViewVehicle = (vehicle) => {
    setCurrentVehicle(vehicle);
    setIsViewModalVisible(true);
  };

  const generateRandomVIN = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let vin = "";
    for (let i = 0; i < 17; i++) {
      vin += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return vin;
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const vin = generateRandomVIN(); 
      const response = await axios.post(API_URL_VEHICLE, { ...formData, vin }, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
  
      const selectedModel = models.find((model) => model.id === formData.model_id);
      setVehicles([...vehicles, { ...response.data.vehicle, model: selectedModel }]);
      message.success("Vehicle added successfully");
      resetForm();
      setIsAddEditModalVisible(false);
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
    setIsAddEditModalVisible(true);
  };

  const handleUpdateVehicle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_VEHICLE}/${currentVehicle.id}`, formData, {
        headers: {
          Authorization: authToken,
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
      setIsAddEditModalVisible(false);
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
          Authorization: authToken,
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

  const getTypeStyle = (type) => {
    if (type === "semi_truck") {
      return { color: "#1D82FF", fontWeight: "bold" };
    } else if (type === "trailer") {
      return { color: "#FF731D", fontWeight: "bold" };
    }
    return {};
  };

  const getVehicleName = (vehicle) => {
    const brand = brands.find((b) => b.id === vehicle.model?.brand_id)?.name || "Unknown Brand";
    const model = vehicle.model?.name || "Unknown Model";
    const type = vehicle.type === "semi_truck" ? "Semi-truck" : "Trailer";
  
    return (
      <>
        <span style={getTypeStyle(vehicle.type)}>{type}</span> {brand} {model}
      </>
    );
  };

  const getDriverName = (driverId) => {
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? `${driver.first_name} ${driver.last_name}` : "No Driver";
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
  
    if (name === "plates") {
      const validValue = value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7);
      setFormData({
        ...formData,
        [name]: validValue,
      });
    } 
    else if (name === "volume") {
      let validValue = value.replace(/[^0-9.]/g, "");
      if (validValue.includes(".")) {
        const [integerPart, decimalPart] = validValue.split(".");
        validValue = integerPart.slice(0, 2) + (decimalPart ? "." + decimalPart.slice(0, 2) : "");
      } 
      else if (validValue.length > 2) {
        validValue = validValue.slice(0, 2) + "." + validValue.slice(2, 4);
      }
      setFormData({
        ...formData,
        [name]: validValue,
      });
    }
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsAddEditModalVisible(true);
              setIsEditMode(false);
            }}
          >
            Add Vehicle
          </Button>
        </Col>
      </Row>

      <Spin spinning={isLoading} tip="Loading vehicles..." style={{ marginTop: 20 }}>
        <Row gutter={[16, 16]}>
          {filteredVehicles.map((vehicle) => (
            <Col key={vehicle.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{
                  position: "relative",
                  borderRadius: "10px",
                  overflow: "hidden",
                  backgroundImage: `url(${vehicle.type === "semi_truck" ? semiTruckImage : trailerImage})`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center 100%",
                  backgroundRepeat: "no-repeat",
                  // border: '1px solid #FF731D'
                  // color: "#fff",
                  // textShadow: "1px 1px 2px rgba(0, 0, 0, 0.8)",
                }}
                bodyStyle={{
                  background: "rgba(255, 255, 255, 0.82)",
                  // borderRadius: "10px",
                  padding: "16px",
                }}
              >
                <Row align="middle" style={{ gap: "12px" }}>
                  {/* <Col>
                    <HomeOutlined style={{ fontSize: "36px", color: "#FF731D" }} />
                  </Col> 
                  <Col flex="auto">
                    <Title level={5} style={{ margin: 0, fontSize: "18px", wordWrap: "break-word", wordBreak: "break-word" }}>
                      {getVehicleName(vehicle)}
                    </Title>
                    <Text style={{ fontSize: "14px", display: "block", marginTop: "8px" }}>
                      <span style={{ color: "gray" }}>Plates:</span> {vehicle.plates || "N/A"}
                    </Text>
                    <Text style={{ fontSize: "14px", display: "block", marginTop: "4px" }}>
                      <span style={{ color: "gray" }}>Driver:</span> {getDriverName(vehicle.driver_id)}
                    </Text>
                  </Col>
                  <Col>
                    <Text style={{ fontSize: "14px", display: "block", marginTop: "8px" }}>
                       AAAAAAA
                    </Text>
                  </Col> */}
                </Row>

                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item
                        key="view"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewVehicle(vehicle)}
                      >
                        Details
                      </Menu.Item>
                      <Menu.Item
                        key="edit"
                        icon={<EditOutlined />}
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        key="delete"
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteVehicle(vehicle)}
                      >
                        Delete
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      color: "black",
                      fontSize: "20px"
                    }}
                  />
                </Dropdown>

                <Title level={4} style={{ marginBottom: 8 }}>
                  {getVehicleName(vehicle)}
                </Title>
                <Text>
                  <strong>Plates:</strong> {vehicle.plates || "N/A"}
                </Text>
                <br />
                <Text>
                  <strong>Driver:</strong> {getDriverName(vehicle.driver_id)}
                </Text>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>

      {/* Modal for viewing vehicle details */}
      <Modal
        title="Vehicle Details"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        style={{ maxWidth: "300px" }}
      >
        {currentVehicle && (
          <div style={{ fontSize: "18px" }}>
            <Text>
              <strong>Plates:</strong> {currentVehicle.plates || "N/A"}
            </Text>
            <br />
            <Text>
              <strong>VIN:</strong> {currentVehicle.vin || "N/A"}
            </Text>
            <br />
            <Text>
              <strong>Brand:</strong>{" "}
              {brands.find((b) => b.id === currentVehicle.model?.brand_id)?.name || "Unknown Brand"}
            </Text>
            <br />
            <Text>
              <strong>Model:</strong> {currentVehicle.model?.name || "Unknown Model"}
            </Text>
            <br />
            <Text>
              <strong>Driver:</strong> {getDriverName(currentVehicle.driver_id)}
            </Text>
            <br />
            <Text>
              <strong>Type:</strong>{" "}
              {currentVehicle.type === "semi_truck" ? "Semi-truck" : "Trailer"}
            </Text>
            <br />
            <Text>
              <strong>Volume:</strong> {currentVehicle.volume || "N/A"} m³
            </Text>
          </div>
        )}
      </Modal>

      <Modal
        title={isEditMode ? "Update Vehicle" : "Add New Vehicle"}
        visible={isAddEditModalVisible}
        onCancel={() => {
          setIsAddEditModalVisible(false);
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

            {isEditMode && (
              <Col xs={24}>
                <Typography.Text style={{ color: "#949494 " }}>VIN</Typography.Text>
                <Input
                  name="vin"
                  placeholder="VIN"
                  value={formData.vin}
                  disabled
                  style={{ width: "100%" }}
                />
              </Col>
            )}

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
              <Typography.Text style={{ color: "#949494 " }}>Volume (m³)</Typography.Text>
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