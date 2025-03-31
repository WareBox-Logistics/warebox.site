import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, Row, Col, message, Spin, Typography } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import { API_URL_BRAND, authToken } from "services/services";

const { Text } = Typography;

const BrandComponent = ({ updateBrands }) => {
  const [brands, setBrands] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentBrand, setCurrentBrand] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_BRAND, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setBrands(response.data.brands || []);
      updateBrands(response.data.brands || []);
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_BRAND, formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const updatedBrands = [...brands, response.data.brand];
      setBrands(updatedBrands);
      updateBrands(updatedBrands);
      message.success("Brand added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding brand");
      console.error("Error adding brand:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBrand = (brand) => {
    setCurrentBrand(brand);
    setFormData({
      name: brand.name || "",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateBrand = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_BRAND}/${currentBrand.id}`, formData, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const updatedBrands = brands.map((brand) =>
        brand.id === currentBrand.id ? response.data.brand : brand
      );
      setBrands(updatedBrands);
      updateBrands(updatedBrands);
      message.success("Brand updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating brand");
      console.error("Error updating brand:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = (brand) => {
    setCurrentBrand(brand);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL_BRAND}/${currentBrand.id}`, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      const updatedBrands = brands.filter((b) => b.id !== currentBrand.id);
      setBrands(updatedBrands);
      updateBrands(updatedBrands);
      message.success("Brand deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting brand");
      console.error("Error deleting brand:", error);
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

  const resetForm = () => {
    setFormData({
      name: "",
    });
    setCurrentBrand(null);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name ? brand.name.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditBrand(record)}>
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteBrand(record)}
            style={{ marginLeft: 8 }}
          >
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
            Brands
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
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalVisible(true);
              setIsEditMode(false);
            }}
          >
            Add Brand
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={filteredBrands}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        loading={isLoading}
        scroll={{ x: "max-content" }}
      />

      <Modal
        title={isEditMode ? "Update Brand" : "Add New Brand"}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          resetForm();
        }}
        footer={null}
      >
        <form onSubmit={isEditMode ? handleUpdateBrand : handleAddBrand}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Typography.Text style={{ color: "#949494" }}>Name</Typography.Text>
              <Input
                name="name"
                placeholder="Name"
                value={formData.name}
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
        title="Delete Brand"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleConfirmDelete}
        confirmLoading={isSubmitting}
      >
        <p>
          Are you sure you want to delete the brand "<Text strong>{currentBrand?.name}</Text>"?
        </p>
      </Modal>
    </div>
  );
};

export default BrandComponent;