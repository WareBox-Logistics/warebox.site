import React, { useEffect, useState } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography, Flex, Radio } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_REPORT, API_URL_DRIVER, API_URL_PROBLEM } from '../../../services/services';
import { current } from '@reduxjs/toolkit';
const { Text } = Typography;
const { TextArea } = Input;

  const Report = () => {
   
    const [reports, setReports] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [problems, setProblems] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [formData, setFormData] = useState({
    longitude: "",
    latitude: "",
    problem: null,
    issue: false,
    description: "",
    driver: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentReport, setCurrentReport] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // const formRef = useRef(null); //No se para que porongas es
    


    useEffect(()=>{
        fetchReport();
        fetchDriver();
        fetchProblem();
    }, []);

    const fetchReport = async () => {

        setIsLoading(true);
        try{
            const response = await axios.get(API_URL_REPORT, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'applications/json'
                }
            });
            console.log('fetchReport##################3333: ',response);
            setReports(response.data.reports || []);
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
        }catch(error){
            console.error('Error fetching drivers:', error);
            setDrivers([]);
        }finally{
            setIsLoading(false);
        }
    } 

    const fetchProblem = async () => {
      setIsLoading(true);
      try{
        const response = await axios.get(API_URL_PROBLEM, {
          headers:{
            'Authorization': authToken,
            'Content-Type': 'applications/json'
          }
        });
        setProblems(response.data.problems || []);
      }catch(error){
        console.error('Error fetching problems:', error);
      }finally{
        setIsLoading(false);
      }
    }

    const handleAddReport = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      console.log('formData: ', formData);
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
        

        console.log('reports: ', reports);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.reports: ',response.data.reports);
          
        const selectedDriver = drivers.find(service => service.id === formData.driver);
        // const selectedProblem = problems.find(service => service.id === formData.problem);
        setReports(prevReports => [...prevReports, {...response.data.reports, driver: selectedDriver}]);
        message.success("Reporte agregado correctamente");
        console.log(reports);
        resetForm();
        console.log('formData: ', formData);
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

    const handleRadioChange = (e) => {
      // Verificar si es un evento de Radio.Group
      if (e.target && e.target.type === "radio") {
        // Para Radio.Group, usamos un nombre fijo ya que el nombre generado no es útil
        setFormData({
          ...formData,
          issue: e.target.value // 'issue' es el nombre del campo que quieres actualizar
        });
      } else {
        // Para otros inputs, usar el comportamiento normal
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    };
  
    const handleSelectChange = (value, option, fieldName) => {
      setFormData({
        ...formData,
        [fieldName]: value,
      });
    };
  
    const handleEditReport = (report) => {
      setCurrentReport(report);
      console.log('currentReport: ', {currentReport});
      console.log('formData: ', formData);
      console.log('report: ', report);
      setFormData({
        longitude: report.longitude || "",
        latitude: report.latitude || "",
        problem: report.problem || null,
        issue: report.issue || false,
        description: report.description || "",
        driver: report.driver || null,
      });
      console.log('*****************formData: ', formData);
      setIsEditMode(true);
      setIsModalVisible(true);
    };
  
    const handleUpdateReport = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      console.log('inicio update |||||||||||||||||||||||||||||||||||||');
      try {
        const response = await axios.put(`${API_URL_REPORT}/${currentReport.id}`,
          formData,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('reports: ', reports);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.reports: ',response.data.reports);

        console.log('final update----------------------------------------');
        const updatedCompanies = reports.map(company =>
          company.id === currentReport.id ? { ...response.data.company, service: reports.find(service => service.id === formData.service) } : company
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
        await axios.delete(`${API_URL_REPORT}/${currentReport.id}`, {
          headers: {
            'Authorization': authToken,
            'Content-Type': 'application/json'
          }
        });
        setReports(reports.filter(company => company.id !== currentReport.id));
        message.success("Problema eliminado correctamente");
        setIsDeleteModalVisible(false);
      } catch (error) {
        message.error("Error al eliminar Problema");
        console.error("Error deleting problem:", error);
      }
    };
  
    const resetForm = () => {
      setFormData({
        longitude: "",
        latitude: "",
        problem: null,
        issue: false,
        description: "",
        driver: null,
      });
    };

    const filteredReports = reports.filter((report) =>
      report.description ? 
      report.description.toLowerCase().includes(searchText.toLowerCase()) 
      : false
    );

      const columns = [
        { title: "Longitude", dataIndex: "longitude", key: "longitude" },
        { title: "Latitude", dataIndex: "latitude", key: "latitude" },
        { title: "Problem", dataIndex: ["problem","name"], key: "problem" },
        { title: "Issue", dataIndex: "issue", key: "issue" },
        { title: "Description", dataIndex: "description", key: "description" },
        { title: "Driver", dataIndex: ["driver","first_name"], key: "driver" },
        {
          title: "Actions",
          key: "actions",
          render: (text, record) => (
            <span>
              <Button icon={<EditOutlined />} onClick={() => handleEditReport(record)}>Edit</Button>
              <Button color="danger" icon={<DeleteOutlined />} onClick={() => handleDeleteCompany(record)} style={{ marginLeft: 8 }}>Delete</Button>
            </span>
          ),
        },
      ];

    return (
      <Paper sx={{ padding: '16px' }}>
            <MainCard title="Reportes">
      
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
                    Add Reporte
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
                title={isEditMode ? "Update Report" : "Add New Report"}
                open={isModalVisible}
                onCancel={() => { setIsModalVisible(false); resetForm(); }}
                footer={null}
                width={400}
                // mask={true}
                // maskStyle={{ zIndex: 1000 }}
              >
                <form onSubmit={isEditMode ? handleUpdateReport : handleAddReport}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Input
                        name="longitude"
                        placeholder="Longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24}>
                      <Input
                        name="latitude"
                        placeholder="Latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        style={{ width: '100%' }}
                      />
                    </Col>
                    <Col xs={24}>
                    <Select
                        showSearch
                        name='problem'
                        style={{ width: '100%' }}
                        placeholder="Problem"
                        value={formData.problem}
                        optionFilterProp='label'
                        onChange={(value, option) => handleSelectChange(value, option, 'problem')}
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
                        options={problems.map(pro => ({
                          value: pro.id,
                          label: pro.name,
                        }))}
                      />
                    </Col>
                    <Col xs={24}>
                      Issue: 
                      <Flex vertical gap="middle">
                        <Radio.Group
                          block
                          options={[
                            { label: 'True', value: true },
                            { label: 'False', value: false },
                          ]}
                          defaultValue="false"
                          optionType="button"
                          value={formData.issue}
                          buttonStyle="solid"
                          onChange={handleRadioChange}
                        />
                      </Flex>
                    </Col>
                    <Col xs={24}>
                      <Flex vertical gap={32}>
                        <TextArea 
                            showCount
                            name='description'
                            onChange={handleChange}
                            value={formData.description}
                            maxLength={250}
                            placeholder="Report Description"
                            style={{ height: 120, resize: 'none', marginBottom: '20px'}}
                        />
                      </Flex>

                    </Col>
                    <Col xs={24}>
                    <Select
                        showSearch
                        name='driver'
                        style={{ width: '100%' }}
                        placeholder="Driver"
                        value={formData.driver}
                        optionFilterProp='label'
                        onChange={(value, option) => handleSelectChange(value, option, 'driver')}
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
                        options={drivers.map(pro => ({
                          value: pro.id,
                          label: pro.first_name,
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
                open={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                onOk={handleConfirmDelete}
                confirmLoading={isSubmitting}
              >
                <p>
                  ¿Are you sure you want to delete "<Text strong>{currentReport?.name}</Text>"?
                </p>
              </Modal>
            </MainCard>
          </Paper>
      );
  };

  export default Report;
  