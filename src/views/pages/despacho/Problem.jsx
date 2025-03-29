import React, { useEffect, useState } from 'react';
import { Paper } from "@mui/material";
import { Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_PROBLEM } from '../../../services/services';
const { Text } = Typography;


  const Problem = () => {

    const [problems, setProblems] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [formData, setFormData] = useState({
    name: "",
    level: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProblems();
        // console.log('problemas aqui --------------------->');
        // console.log(problems);
    }, []);

    const fetchProblems = async () => {
    setIsLoading(true);
    try {
        const response = await axios.get(API_URL_PROBLEM, {
        headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
        }
        });
        console.log(`aquie el response: ${response.data.problems}`);
        setProblems(response.data.problems || []);
    } catch (error) {
        console.error('Error fetching companies:', error);
        setProblems([]); // Set companies to an empty array in case of error
    } finally {
        setIsLoading(false);
    }
    };

    const handleAddProblem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const response = await axios.post(API_URL_PROBLEM,
        formData,
        {
            headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
            }
        }
        );
        setProblems([...problems, { ...response.data.problems }]);
        message.success("Problema agregado correctamente");
        resetForm();
        setIsModalVisible(false);
    } catch (error) {
        message.error("Error al agregar Problema");
        console.error("Error adding problem:", error);
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

    const handleSelectChange = (value) => {
    setFormData({
        ...formData,
        level: value,
    });
    };

    const handleEditProblem = (problem) => {
    setCurrentProblem(problem);
  console.log('currentProblem: ', {currentProblem});
    setFormData({
        name: problem.name || "",
        level: problem.level || "",
    });
    setIsEditMode(true);
    setIsModalVisible(true);
    };

    const handleUpdateCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const response = await axios.put(`${API_URL_PROBLEM}/${currentProblem.id}`,
        formData,
        {
            headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
            }
        }
        );
        const updatedCompanies = problems.map(problem =>
        problem.id === currentProblem.id ? { ...response.data.problems } : problem );
        setProblems(updatedCompanies);
        message.success("Problema actualizado correctamente");
        setIsEditMode(false);
        resetForm();
        setIsModalVisible(false);
    } catch (error) {
        message.error("Error al actualizar problema");
        console.error("Error updating problem:", error);
    } finally {
        setIsSubmitting(false);
    }
    };

    const handleDeleteProblem = (problem) => {
    setCurrentProblem(problem);
    setIsDeleteModalVisible(true);
    };

    const handleConfirmDelete = async () => {
    try {
        await axios.delete(`${API_URL_PROBLEM}/${currentProblem.id}`, {
        headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
        }
        });
        setProblems(problems.filter(problem => problem.id !== currentProblem.id));
        message.success("Problema eliminado correctamente");
        setIsDeleteModalVisible(false);
    } catch (error) {
        message.error("Error al eliminar Problema");
        console.error("Error deleting problem:", error);
    }
    };

    const resetForm = () => {
    setFormData({
        name: "",
        level: "",
    });
    };

    const filteredProblems = problems.filter((problem) =>
    problem.name ? problem.name.toLowerCase().includes(searchText.toLowerCase()) : false
    );

    // Columnas de la tabla
    const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Level", dataIndex: "level", key: "level" },
    {
        title: "Actions",
        key: "actions",
        render: (text, record) => (
        <span>
            <Button icon={<EditOutlined />} onClick={() => handleEditProblem(record)}>Edit</Button>
            <Button icon={<DeleteOutlined />} onClick={() => handleDeleteProblem(record)} style={{ marginLeft: 8 }}>Delete</Button>
        </span>
        ),
    },
    ];

    return (
      <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
        <MainCard title="Problemas">
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
                        // style={{ backgroundColor: '#FF731D', borderColor: '#FF731D' }}
                        // onMouseEnter={(e) => e.target.style.backgroundColor = '#FF4500'}
                        // onMouseLeave={(e) => e.target.style.backgroundColor = '#FF731D' }}
                      >
                        Add Problem
                      </Button>
                    </Col>
                  </Row>
          
                  {/* Tabla */}
                  <div style={{ overflowX: "auto" }}>
                    <Table
                      dataSource={filteredProblems}
                      columns={columns}
                      rowKey="id"
                      pagination={{ pageSize: 20 }}
                      loading={isLoading}
                    />
                  </div>
          
                  {/* Modal de registro/edición */}
                  <Modal
                    title={isEditMode ? "Update problem" : "Add New Problem"}
                    open={isModalVisible}
                    onCancel={() => { setIsModalVisible(false); resetForm(); }}
                    footer={null}
                    width={400}
                    // mask={true}
                    // maskStyle={{ zIndex: 1000 }}
                  >
                    <form onSubmit={isEditMode ? handleUpdateCompany : handleAddProblem}>
                      <Row gutter={[16, 16]}>
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
                          <Select
                            name="level"
                            placeholder="Level"
                            value={formData.level}
                            onChange={handleSelectChange}
                            style={{ width: '100%' }}
                            options={[
                                {value: 1, label: '1'},
                                {value: 2, label: '2'},
                                {value: 3, label: '3'},
                            ]}
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
                    title="Delete problem"
                    open={isDeleteModalVisible}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    onOk={handleConfirmDelete}
                    confirmLoading={isSubmitting}
                  >
                    <p>
                      ¿Are you sure you want to delete "<Text strong>{currentProblem?.name}</Text>"?
                    </p>
                  </Modal>
        </MainCard>
      </Paper>
    );
  };
  
  export default Problem;
  