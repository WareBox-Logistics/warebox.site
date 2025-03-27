import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Row, Col, Input, Button, Table, message, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_ROLE } from '../../../services/services';

const { Text } = Typography;

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL_ROLE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]); // Set roles to an empty array in case of error
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(API_URL_ROLE,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      setRoles([...roles, response.data.role]);
      message.success("Role added successfully");
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error adding role");
      console.error("Error adding role:", error);
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

  const handleEditRole = (role) => {
    setCurrentRole(role);
    setFormData({
      name: role.name || "",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.put(`${API_URL_ROLE}/${currentRole.id}`,
        formData,
        {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        }
      );
      const updatedRoles = roles.map(role =>
        role.id === currentRole.id ? response.data.role : role
      );
      setRoles(updatedRoles);
      message.success("Role updated successfully");
      setIsEditMode(false);
      resetForm();
      setIsModalVisible(false);
    } catch (error) {
      message.error("Error updating role");
      console.error("Error updating role:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = (role) => {
    setCurrentRole(role);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL_ROLE}/${currentRole.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      setRoles(roles.filter(role => role.id !== currentRole.id));
      message.success("Role deleted successfully");
      setIsDeleteModalVisible(false);
    } catch (error) {
      message.error("Error deleting role");
      console.error("Error deleting role:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
    });
  };

  const filteredRoles = roles.filter((role) =>
    role && role.name ? role.name.toLowerCase().includes(searchText.toLowerCase()) : false
  );

  // Columnas de la tabla
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <span>
          <Button icon={<EditOutlined />} onClick={() => handleEditRole(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteRole(record)} style={{ marginLeft: 8 }}>Delete</Button>
        </span>
      ),
    },
  ];

  return (
    <Paper sx={{ padding: '16px', margin: '16px' }}>
      <MainCard title="Roles">

        {/* Buscador y botón de agregar */}
        <Row justify="space-between" align="middle" style={{ marginTop: 20, marginBottom: 10 }}>
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
              Add Role
            </Button>
          </Col>
        </Row>

        {/* Tabla */}
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredRoles}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
            loading={isLoading}
          />
        </div>

        {/* Modal de registro/edición */}
        <Modal
          title={isEditMode ? "Update Role" : "Add New Role"}
          visible={isModalVisible}
          onCancel={() => { setIsModalVisible(false); resetForm(); }}
          footer={null}
          width={400}
        >
          <form onSubmit={isEditMode ? handleUpdateRole : handleAddRole}>
            <Row gutter={[16, 16]}>
              {isEditMode && (
                <Col xs={24}>
                  <Input
                    name="id"
                    placeholder="ID"
                    value={currentRole.id}
                    disabled
                    style={{ width: '100%' }}
                  />
                </Col>
              )}
              <Col xs={24}>
                <Input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%' }}
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

        {/* Modal de eliminación */}
        <Modal
          title="Delete Role"
          visible={isDeleteModalVisible}
          onCancel={() => setIsDeleteModalVisible(false)}
          onOk={handleConfirmDelete}
          confirmLoading={isSubmitting}
        >
          <p>
            Are you sure you want to delete "<Text strong>{currentRole?.name}</Text>"?
          </p>
        </Modal>
      </MainCard>
    </Paper>
  );
};

export default Roles;