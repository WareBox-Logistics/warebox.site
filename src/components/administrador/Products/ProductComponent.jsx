import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Row, Col, Input, Button, Table, message, Select, Spin, Modal, Typography, Image } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_PRODUCT, API_URL_COMPANY, API_URL_CATEGORY } from '../../../services/services';

const { Text } = Typography;

const ProductComponent = ({ categories, updateCategories }) => {
  const [products, setProducts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [category, setCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    image: "",
    company: null,
    category: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCompanies();
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_PRODUCT, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(API_URL_COMPANY, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(API_URL_CATEGORY, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      updateCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const generateRandomSKU = (companyName) => {
    const prefix = companyName.slice(0, 4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    return (prefix + randomPart).slice(0, 12);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      const companyName = companies.find(company => company.id === formData.company)?.name || "unknown";
      const sku = generateRandomSKU(companyName);
      // const fileExtension = formData.image?.name.split('.').pop();
      // const fileName = `${formData.name}_${companyName}.${fileExtension}`.replace(/\s+/g, '_');
  
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("sku", sku);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("company", formData.company);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("image", formData.image);
      // if (formData.image) {
      //   formDataToSend.append("image", formData.image, fileName);
      // }
  
      const response = await axios.post(API_URL_PRODUCT, formDataToSend, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const selectedCompany = companies.find(company => company.id === formData.company);
      const selectedCategory = categories.find(category => category.id === formData.category);
      setProducts([...products, { ...response.data.product, company: selectedCompany, category: selectedCategory }]);
      message.success("Product added successfully");
      resetForm();
      setPreviewImage(null);
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding product");
      console.error("Error adding product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      sku: product.sku || "",
      price: product.price || "",
      image: product.image || "",
      company: product.company ? product.company.id : null,
      category: product.category ? product.category.id : null,
    });
    setPreviewImage(product.image);
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      const companyName = companies.find(company => company.id === formData.company)?.name || "unknown";
      // const fileExtension = formData.image?.name?.split('.').pop();
      // const fileName = formData.image && formData.image instanceof File
      //   ? `${formData.name}_${companyName}.${fileExtension}`.replace(/\s+/g, '_')
      //   : null;
  
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("sku", formData.sku);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("company", formData.company);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("image", formData.image);
      // if (formData.image && formData.image instanceof File) {
      //   formDataToSend.append("image", formData.image, fileName);
      // }
  
      const response = await axios.put(`${API_URL_PRODUCT}/${currentProduct.id}`, formDataToSend, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const updatedProducts = products.map(product =>
        product.id === currentProduct.id
          ? {
              ...response.data.product,
              company: companies.find(company => company.id === formData.company),
              category: categories.find(category => category.id === formData.category),
            }
          : product
      );
      setProducts(updatedProducts);
      message.success("Product updated successfully");
      setIsEditMode(false);
      resetForm();
      setPreviewImage(null);
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating product");
      console.error("Error updating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = (product) => {
    setCurrentProduct(product);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await axios.delete(`${API_URL_PRODUCT}/${currentProduct.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });
      setProducts(products.filter(product => product.id !== currentProduct.id));
      message.success("Product deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting product");
      console.error("Error deleting product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      sku: "",
      price: "",
      image: "",
      company: null,
      category: null,
    });
    setPreviewImage(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name ? product.name.toLowerCase().includes(searchText.toLowerCase()) : false;
    const matchesCompany = selectedCompany ? product.company?.id === selectedCompany : true;
    return matchesSearch && matchesCompany;
  });

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img
          src={image || "https://via.placeholder.com/70"}
          alt="Product"
          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "5px" }}
        />
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "SKU", dataIndex: "sku", key: "sku" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => {
        const formattedPrice = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price);
        return `$${formattedPrice}`;
      },
    },
    { title: "Company", dataIndex: ["company", "name"], key: "company" },
    { title: "Category", dataIndex: ["category", "name"], key: "category" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
            <Button
                icon={<EditOutlined />}
                onClick={() => handleEditProduct(record)}
            >
                Edit
            </Button>
            <Button
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteProduct(record)}
                color='red'
                variant='outlined'
            >
                Delete
            </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
        <Row justify="space-between" align="middle" style={{ marginTop: 20, marginBottom: 10 }}>
          <Col>
            <Select
              placeholder="Filter by Company"
              style={{ width: 160 }}
              allowClear
              onChange={(value) => setSelectedCompany(value)}
              options={companies.map((company) => ({
                label: company.name,
                value: company.id,
              }))}
            />
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
            <Button type="primary" onClick={() => { setIsModalVisible(true); setIsEditMode(false); }}>
              Add Product
            </Button>
          </Col>
        </Row>

        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredProducts}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            loading={isLoading}
          />
        </div>

        <Modal
          title={isEditMode ? "Update Product" : "Add New Product"}
          visible={isModalVisible}
          onCancel={() => { setIsModalVisible(false); resetForm(); }}
          footer={null}
          width={400}
        >
          <form onSubmit={isEditMode ? handleUpdateProduct : handleAddProduct}>
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
              {isEditMode ? (
              <Col xs={24}>
                <Input
                  name="sku"
                  placeholder="SKU"
                  value={formData.sku}
                  disabled
                  style={{ width: '100%' }}
                />
              </Col>
              ) : null}
              <Col xs={24}>
                <Input
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setFormData({ ...formData, price: value });
                    }
                  }}
                  onBlur={() => {
                    if (formData.price && !formData.price.includes('.')) {
                      setFormData({ ...formData, price: `${formData.price}.00` });
                    }
                  }}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24}>
                <Select
                  placeholder="Company"
                  style={{ width: '100%' }}
                  value={formData.company}
                  onChange={(value) => {
                    const companyName = companies.find(company => company.id === value)?.name || "unknown";
                    const sku = generateRandomSKU(companyName);
                    setFormData({ ...formData, company: value, category: null, sku });
                  }}
                  options={companies.map(company => ({
                    label: company.name,
                    value: company.id,
                  }))}
                />
              </Col>
              <Col xs={24}>
                <Select
                  placeholder="Category"
                  style={{ width: '100%' }}
                  value={formData.category}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                  options={categories
                    .filter(category => category.company.id === formData.company)
                    .map(category => ({
                      label: category.name,
                      value: category.id,
                    })
                  )}
                />
              </Col>
              <Col xs={24}>
                {/* <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setFormData({ ...formData, image: file });
                    setPreviewImage(URL.createObjectURL(file));
                  }}
                  style={{ width: '100%' }}
                /> */}
                <Input
                  name="image"
                  placeholder="Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  style={{ width: '100%' }}
                />
              </Col>
              {/* {previewImage && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                  />
                </div>
              )} */}
              {formData.image && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                  />
                </div>
              )}

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
          title="Delete Product"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>
            Are you sure you want to delete "<Text strong>{currentProduct?.name}</Text>"?
          </p>
        </Modal>
    </div>
  );
};

export default ProductComponent;