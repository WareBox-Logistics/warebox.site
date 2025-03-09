import React, { useEffect, useState } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Form, Select, Spin } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    rfc: "",
    email: "",
    phone: "",
    service: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/company`, {
        headers: {
          'Authorization': 'Bearer 73|789z2KxKdtpLEYo5q3dd3pp9UUTV3XaLgfBUvPE6e9bbdf22',
          'Content-Type': 'application/json'
        }
      });
      setCompanies(response.data.companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Submitting form with values:', formData);
    try {
      const response = await axios.post(
        `${BASE_URL}/company`,
        formData,
        {
          headers: {
            'Authorization': 'Bearer 73|789z2KxKdtpLEYo5q3dd3pp9UUTV3XaLgfBUvPE6e9bbdf22',
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('Response from server:', response.data);

      setCompanies([...companies, response.data.company]);
      message.success("Empresa agregada correctamente");
      setFormData({
        name: "",
        rfc: "",
        email: "",
        phone: "",
        service: 1,
      });
    } catch (error) {
      message.error("Error al agregar empresa");
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

  // Filtrar empresas según el texto de búsqueda
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columnas de la tabla
  const columns = [
    { title: "Nombre", dataIndex: "name", key: "name" },
    { title: "RFC", dataIndex: "rfc", key: "rfc" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Teléfono", dataIndex: "phone", key: "phone" },
    { title: "Servicio", dataIndex: "service", key: "service" },
  ];

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Companies">
        {/* Formulario de registro */}
        <Card title="Registrar Nueva Empresa" style={{ marginTop: 20 }}>
          <form onSubmit={handleAddCompany}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Input
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  name="rfc"
                  placeholder="RFC"
                  value={formData.rfc}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Input
                  name="phone"
                  placeholder="Teléfono"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Servicio"
                  style={{ width: "100%" }}
                  value={formData.service}
                  onChange={handleSelectChange}
                  options={[
                    { value: 1, label: "Servicio 1" },
                    { value: 2, label: "Servicio 2" },
                    { value: 3, label: "Servicio 3" },
                  ]}
                />
              </Col>
              <Col xs={24} sm={12} md={6}>
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
                  {isSubmitting ? "Guardando..." : "Agregar"}
                </Button>
              </Col>
            </Row>
          </form>
        </Card>

        {/* Buscador */}
        <Input
          style={{
            width: "100%",
            maxWidth: 300,
            marginTop: 20,
            marginBottom: 10,
          }}
          prefix={<SearchOutlined />}
          placeholder="Buscar por nombre"
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Tabla */}
        <div style={{ overflowX: "auto" }}>
          <Table
            dataSource={filteredCompanies}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        </div>
      </MainCard>
    </Paper>
  );
};

export default Companies;