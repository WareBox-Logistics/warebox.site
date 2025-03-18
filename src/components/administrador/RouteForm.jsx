import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, Typography, Spin } from 'antd';
import axios from 'axios';
import { API_URL_COMPANY, API_URL_VEHICLE, API_URL_MODEL, API_URL_BRAND, authToken } from 'services/services';

const { Title } = Typography;
const { Option } = Select;

const RouteForm = ({ origin, destination }) => {
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchCompanies();
    fetchVehicles();
    fetchModels();
    fetchBrands();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(API_URL_COMPANY, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(API_URL_VEHICLE, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setVehicles(response.data.vehicles || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(API_URL_MODEL, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setModels(response.data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(API_URL_BRAND, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      setBrands(response.data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    }
  };

  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    setSelectedVehicle(vehicle);
  };

  const getModel = (modelId) => {
    return models.find((model) => model.id === modelId) || {};
  };

  const getBrand = (brandId) => {
    return brands.find((brand) => brand.id === brandId) || {};
  };

  const onFinish = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  if (!origin || !destination) {
    return null;
  }

  return (
    <div style={{ paddingLeft: '30px', borderRadius: '10px' }}>
      <Row gutter={8}>
        <Title level={4}>Delivery Info</Title>
      </Row>
      <Form
        name="delivery"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: '100%',
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        {/* Company Select */}
        <Form.Item
          label="Company"
          name="company"
          rules={[
            {
              required: true,
              message: 'Please select the company!',
            },
          ]}
        >
          <Select placeholder="Select a company">
            {companies.map((company) => (
              <Option key={company.id} value={company.id}>
                {company.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Vehicle Select */}
        <Form.Item
          label="Vehicle"
          name="vehicle"
          rules={[
            {
              required: true,
              message: 'Please select the vehicle!',
            },
          ]}
        >
          <Select
            placeholder="Select a vehicle"
            onChange={handleVehicleChange}
            showSearch
            optionFilterProp="children"
            notFoundContent={vehicles.length === 0 ? <Spin size="small"/> : null}
          >
            {vehicles.map((vehicle) => {
              const model = getModel(vehicle.model_id);
              const brand = getBrand(model.brand_id);
              return (
                <Option key={vehicle.id} value={vehicle.id}>
                  {`${vehicle.type === 'semi_truck' ? 'Semi-truck' : 'Trailer'} - ${brand.name || 'Unknown Brand'} ${model.name || 'Unknown Model'}`}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        {/* Display Plates, Year, and Volume */}
        {selectedVehicle && (
          <>
          <Form.Item label="Plates">
            <Input value={selectedVehicle.plates} readonly />
          </Form.Item>
          <Row gutter={16} justify="end">
            {/* <Col span={8}>
              <Form.Item label="Plates">
                <Input value={selectedVehicle.plates} disabled />
              </Form.Item>
            </Col> */}
            <Col span={8}>
              <Form.Item label="Year">
                <Input value={getModel(selectedVehicle.model_id)?.year || 'Unknown Year'} readonly />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Volume">
                <Input value={selectedVehicle.volume || 'Unknown Volume'} readonly />
              </Form.Item>
            </Col>
          </Row>
          </>
        )}

        {/* Origin Input */}
        <Form.Item
          label="Origin"
          name="origin"
          rules={[
            {
              required: true,
              message: 'Please select the origin!',
            },
          ]}
        >
          <Input value={origin.name} placeholder={origin.name} disabled />
        </Form.Item>

        {/* Destination Input */}
        <Form.Item
          label="Destination"
          name="destination"
          rules={[
            {
              required: true,
              message: 'Please select the destination!',
            },
          ]}
        >
          <Input value={destination.name} placeholder={destination.name} disabled />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            Create Order Delivery
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RouteForm;