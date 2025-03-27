import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_REPORT, API_URL_DRIVER } from '../../../services/services';
const { Text } = Typography;


  const Report = () => {
   
    const [reports, setReports] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [formData, setFormData] = useState({
    ubication: "",
    problem: "",
    issue: "",
    description: "",
    driver: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentCompany, setCurrentReport] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // const formRef = useRef(null); //No se para que porongas es
    

    useEffect(()=>{
        fetchReport();
        fetchDriver();
        const res = drivers.map(dri => ({
          value: dri.id,
          label: dri.first_name,
        }))
        console.log(res);
    }, []);

    const fetchReport = async () => {

        setIsLoading(true);
        try{
            const response = await axios.get(API_URL_REPORT, {
                headers: {
                    // 'Authorization': authToken,
                    'Content-Type': 'applications/json'
                }
            });
            setReports(response.data.reports || []);
            console.log(response.data);
        }catch(error){
            console.error('Error fetching companies:', error);
            setReports([]);
        }finally{
            setIsLoading(false);
        }
    } 

    const fetchDriver = async () => {

        setIsLoading(true);
        try{
            const response = await axios.get(API_URL_DRIVER, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'applications/json'
                }
            });
            setDrivers(response.data.drivers || []);
            console.log(response.data);
        }catch(error){
            console.error('Error fetching companies:', error);
            setDrivers([]);
        }finally{
            setIsLoading(false);
        }
    } 

    const handleAddCompany = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const response = await axios.post(API_URL_REPORT,
          formData,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        const selectedDriver = drivers.find(dri => dri.id === formData.driver);

        setReports([...reports, { ...response.data.report, driver: selectedDriver }]);
        message.success("Problema agregado correctamente");

        resetForm();
        setIsModalVisible(false);
      } catch (error) {
        message.error("Error al agregar Problema");
        console.error("Error adding company:", error);
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
        service: value,
      });
    };
  
    const handleEditReport = (report) => {
      setCurrentReport(report);
      setFormData({
        ubication: report.ubication || "",
        problem: report.problem || "",
        issue: report.issue || "",
        description: report.description || "",
        driver: report.driver ? report.driver.id : null,
      });
      setIsEditMode(true);
      setIsModalVisible(true);
    };
  
    const handleUpdateCompany = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const response = await axios.put(`${API_URL_REPORT}/${currentCompany.id}`,
          formData,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        const updatedCompanies = reports.map(company =>
          company.id === currentCompany.id ? { ...response.data.company, service: reports.find(service => service.id === formData.service) } : company
        );
        setReports(updatedCompanies);
        message.success("Problema actualizado correctamente");
        setIsEditMode(false);
        resetForm();
        setIsModalVisible(false);
      } catch (error) {
        message.error("Error al actualizar Problema");
        console.error("Error updating company:", error);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const handleDeleteCompany = (company) => {
      setCurrentReport(company);
      setIsDeleteModalVisible(true);
    };
  
    const handleConfirmDelete = async () => {
      try {
        await axios.delete(`${API_URL_REPORT}/${currentCompany.id}`, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        });
        setReports(reports.filter(company => company.id !== currentCompany.id));
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
        rfc: "",
        email: "",
        phone: "",
        service: null,
      });
    };

    const filteredReports = reports.filter((report) =>
      report.description ? report.description.toLowerCase().includes(searchText.toLowerCase()) : false
    );

      const columns = [
        { title: "Ubication", dataIndex: "ubication", key: "ubication" },
        { title: "Problem", dataIndex: "problem", key: "problem" },
        { title: "Issue", dataIndex: "issue", key: "issue" },
        { title: "Description", dataIndex: "description", key: "description" },
        { title: "driver", dataIndex: "driver", key: "service" },
        {
          title: "Actions",
          key: "actions",
          render: (text, record) => (
            <span>
              <Button icon={<EditOutlined />} onClick={() => handleEditReport(record)}>Edit</Button>
              <Button icon={<DeleteOutlined />} onClick={() => handleDeleteCompany(record)} style={{ marginLeft: 8 }}>Delete</Button>
            </span>
          ),
        },
      ];

    return (
      <Paper sx={{ padding: '16px' }}>
            <MainCard title="Companies">
      
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
                    Add Report
                  </Button>
                </Col>
              </Row>
      
              {/* Tabla */}
              <div style={{ overflowX: "auto" }}>
                <Table
                  dataSource={filteredReports}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  loading={isLoading}
                />
              </div>
      
              {/* Modal de registro/edición */}
              <Modal
                title={isEditMode ? "Update Problem" : "Add New Problem"}
                visible={isModalVisible}
                onCancel={() => { setIsModalVisible(false); resetForm(); }}
                footer={null}
                width={400}
                // mask={true}
                // maskStyle={{ zIndex: 1000 }}
              >
                <form onSubmit={isEditMode ? handleUpdateCompany : handleAddCompany}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Input
                        name="ubications"
                        placeholder="Ubication"
                        value={formData.name}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Input
                        name="problem"
                        placeholder="Problem"
                        value={formData.rfc}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Input
                        name="issue"
                        placeholder="Issue"
                        value={formData.email}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Input
                        name="description"
                        placeholder="Description"
                        value={formData.phone}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Select
                        showSearch
                        style={{ width: '100%' }}
                        placeholder="driver"
                        optionFilterProp='label'
                        onChange={handleSelectChange}
                        filterSort={(optionA, optionB) => {
                          var _a, _b;
                          return (
                            (_a = optionA === null || optionA === void 0 ? void 0 : optionA.label) !== null &&
                            _a !== void 0
                              ? _a
                              : ''
                          )
                            .toLowerCase()
                            .localeCompare(
                              ((_b = optionB === null || optionB === void 0 ? void 0 : optionB.label) !== null &&
                              _b !== void 0
                                ? _b
                                : ''
                              ).toLowerCase(),
                            );
                        }}
                        options={drivers.map(dri => ({
                          value: dri.id,
                          label: dri.first_name,
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
      
              {/* Modal de eliminación */}
              <Modal
                title="Delete Problem"
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onOk={handleConfirmDelete}
                confirmLoading={isSubmitting}
              >
                <p>
                  ¿Are you sure you want to delete "<Text strong>{currentCompany?.name}</Text>"?
                </p>
              </Modal>
            </MainCard>
          </Paper>
      );
  };

  export default Report;
  