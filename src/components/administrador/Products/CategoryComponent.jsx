import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from 'axios';
import { authToken, API_URL_CATEGORY, API_URL_COMPANY } from '../../../services/services';

const { Text } = Typography;

const CategoryComponent = ({ categories, updateCategories }) => {
  const [category, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchCompanies();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_CATEGORY, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setCategories(response.data.categories || []);
      updateCategories(response.data.categories || []); 
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(API_URL_COMPANY, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_CATEGORY, formData, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      const selectedCompany = companies.find(company => company.id === formData.company);
      const updatedCategories = [...categories, { ...response.data.category, company: selectedCompany }];
      setCategories(updatedCategories);
      updateCategories(updatedCategories);
      message.success("Category added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding category");
      console.error("Error adding category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      company: category.company ? category.company.id : null,
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_CATEGORY}/${currentCategory.id}`, formData, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      const updatedCategories = categories.map(category =>
        category.id === currentCategory.id
          ? { ...response.data.category, company: companies.find(company => company.id === formData.company) }
          : category
      );
      setCategories(updatedCategories);
      updateCategories(updatedCategories);
      message.success("Category updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating category");
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = (category) => {
    setCurrentCategory(category);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL_CATEGORY}/${currentCategory.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      const updatedCategories = categories.filter(category => category.id !== currentCategory.id);
      setCategories(updatedCategories);
      updateCategories(updatedCategories);
      message.success("Category deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting category");
      console.error("Error deleting category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      company: null,
    });
  };

  const filteredCategories = categories.filter((category) =>
    category.name ? category.name.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Company", dataIndex: ["company", "name"], key: "company" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>Edit</Button>
          <Button 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteCategory(record)} 
            style={{ marginLeft: 8 }}
            color='red'
            variant='outlined'
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
            Categories
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
            onClick={() => { setIsModalVisible(true); setIsEditMode(false); }}
          >
            Add Category
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={filteredCategories}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        loading={isLoading}
      />

      <Modal
        title={isEditMode ? "Update Category" : "Add New Category"}
        visible={isModalVisible}
        onCancel={() => { setIsModalVisible(false); resetForm(); }}
        footer={null}
        width={400}
      >
        <form onSubmit={isEditMode ? handleUpdateCategory : handleAddCategory}>
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Input
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24}>
              <Input
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24}>
              <Select
                placeholder="Select Company"
                style={{ width: '100%' }}
                value={formData.company}
                onChange={(value) => setFormData({ ...formData, company: value })}
                options={companies.map(company => ({
                  label: company.name,
                  value: company.id,
                }))}
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
                      indicator={
                        <LoadingOutlined spin style={{ color: "white" }} />
                      }
                    />
                  ) : (
                    <UserAddOutlined />
                  )
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
        title="Delete Category"
        visible={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={handleConfirmDelete}
        confirmLoading={isSubmitting}
      >
        <p>
          Are you sure you want to delete "<Text strong>{currentCategory?.name}</Text>"?
        </p>
      </Modal>
    </div>
  );
};

export default CategoryComponent;