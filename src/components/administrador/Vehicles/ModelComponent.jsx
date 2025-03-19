import React, { useEffect, useState, useRef } from "react";
import { Table, Button, Modal, Input, Select, Row, Col, message, Spin, Typography, Checkbox } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL_MODEL, API_URL_BRAND, authToken } from "services/services";

const { Text } = Typography;

const ModelComponent = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    brand_id: null,
    name: "",
    is_truck: false,
    is_trailer: false,
    year: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchModels();
    fetchBrands();
  }, []);

  const fetchModels = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_MODEL, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setModels(response.data.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(API_URL_BRAND, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setBrands(response.data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };

  const handleAddModel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_MODEL, formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const selectedBrand = brands.find((brand) => brand.id === formData.brand_id);
      setModels([...models, { ...response.data.model, brand: selectedBrand }]);
      message.success("Model added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding model");
      console.error("Error adding model:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditModel = (model) => {
    setCurrentModel(model);
    setFormData({
      brand_id: model.brand_id || null,
      name: model.name || "",
      is_truck: model.is_truck || false,
      is_trailer: model.is_trailer || false,
      year: model.year || "",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateModel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_MODEL}/${currentModel.id}`, formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const updatedBrand = brands.find((brand) => brand.id === formData.brand_id);
      const updatedModels = models.map((model) =>
        model.id === currentModel.id ? { ...response.data.model, brand: updatedBrand } : model
      );
      setModels(updatedModels);
      message.success("Model updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating model");
      console.error("Error updating model:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModel = (model) => {
    setCurrentModel(model);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL_MODEL}/${currentModel.id}`, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setModels(models.filter((m) => m.id !== currentModel.id));
      message.success("Model deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting model");
      console.error("Error deleting model:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCheckboxChange = (isTrailer) => {
    setFormData({
      ...formData,
      is_trailer: isTrailer,
      is_truck: !isTrailer,
    });
  };

  const resetForm = () => {
    setFormData({
      brand_id: null,
      name: "",
      is_truck: false,
      is_trailer: false,
      year: "",
    });
    setCurrentModel(null);
  };

  const filteredModels = models.filter((model) =>
    model.name ? model.name.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  const columns = [
    // { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Brand",
      dataIndex: "brand_id",
      key: "brand",
      render: (brandId) => brands.find((brand) => brand.id === brandId)?.name || "Unknown Brand",
    },
    { title: "Is Truck", dataIndex: "is_truck", key: "is_truck", render: (value) => (value ? "Yes" : "No") },
    { title: "Is Trailer", dataIndex: "is_trailer", key: "is_trailer", render: (value) => (value ? "Yes" : "No") },
    { title: "Year", dataIndex: "year", key: "year" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditModel(record)}>
            Edit
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDeleteModel(record)} style={{ marginLeft: 8 }}>
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
            Models
          </Typography.Title>
        </Col>
        <Col>
          <Input
            style={{ width: "100%", maxWidth: 300 }}
            prefix={<SearchOutlined />}
            placeholder="Search by name"
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
        <Col>
            <Button
                type="default"
                // icon={<LoadingOutlined />}
                onClick={() => {
                    setIsLoading(true);
                    Promise.all([fetchModels(), fetchBrands()]).finally(() => {
                    setIsLoading(false);
                    });
                }}
                style={{ marginRight: 8 }}
            >
                Refresh
            </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setIsEditMode(false);
            }}
          >
            Add Model
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={filteredModels}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={isLoading}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={isEditMode ? "Update Model" : "Add New Model"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        footer={null}
      >
        <form onSubmit={isEditMode ? handleUpdateModel : handleAddModel}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Input
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24}>
              <Select
                placeholder="Brand"
                style={{ width: "100%" }}
                value={formData.brand_id}
                onChange={(value) => setFormData({ ...formData, brand_id: value })}
                options={brands.map((brand) => ({
                  label: brand.name,
                  value: brand.id,
                }))}
              />
            </Col>
            <Col xs={24}>
              <Input
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleChange}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24}>
              <Typography.Text>Is Trailer?</Typography.Text>
              <Checkbox
                checked={formData.is_trailer}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                style={{ marginLeft: 8 }}
              >
                Yes
              </Checkbox>
              <Checkbox
                checked={formData.is_truck}
                onChange={(e) => handleCheckboxChange(!e.target.checked)}
                style={{ marginLeft: 8 }}
              >
                No
              </Checkbox>
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
        title="Delete Model"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleConfirmDelete}
        confirmLoading={isSubmitting}
      >
        <p>
          Are you sure you want to delete the model "<Text strong>{currentModel?.name}</Text>"?
        </p>
      </Modal>
    </div>
  );
};

export default ModelComponent;