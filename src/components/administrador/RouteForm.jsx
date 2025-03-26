import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, Typography, Spin, Card, DatePicker, message } from 'antd';
import { ProductOutlined } from "@ant-design/icons";
import axios from 'axios';
import { API_URL_COMPANY, API_URL_VEHICLE, API_URL_MODEL, API_URL_BRAND, authToken, API_URL_PALLET_CWS,API_URL_DELIVERY,userID } from 'services/services';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const RouteForm = ({ origin, destination, route }) => {
  const [form] = Form.useForm();
  const [companies, setCompanies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [pallets, setPallets] = useState([]);
  const [selectedPallets, setSelectedPallets] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [loadingPallets, setLoadingPallets] = useState(false);
  const [deliveryType, setDeliveryType] = useState('');
  const [loading, setLoading] = useState(false);

  const options = [
    { value: 'warehouse_to_location', label: 'Warehouse to Location' },
    { value: 'warehouse_to_warehouse', label: 'Warehouse to Warehouse'},
    { value: 'location_to_warehouse', label: 'Location to Warehouse' },
    { value: 'location_to_location', label: 'Location to Location' }
  ];

  // Disable past dates for date picker
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  useEffect(() => {
    fetchCompanies();
    fetchVehicles();
    fetchModels();
    fetchBrands();
    setDeliveryTypeFromOriginAndDestination();
  }, []);

  useEffect(() => {
    if (selectedCompanyId && origin?.id) {
      fetchPallets(origin.id, selectedCompanyId);
    } else {
      setPallets([]); 
    }
  }, [selectedCompanyId, origin]);

  useEffect(() => {
    // Separate trucks and trailers
    const trucks = vehicles.filter(v => v.type === 'semi_truck');
    const trailers = vehicles.filter(v => v.type === 'trailer');
    setTrucks(trucks);
    setTrailers(trailers);
  }, [vehicles]);

  const setDeliveryTypeFromOriginAndDestination = () => {
    if(origin.type == 'warehouse' && destination.type == 'location'){
      setDeliveryType('warehouse_to_location');
    }else if(origin.type == 'location' && destination.type == 'warehouse'){
      setDeliveryType('location_to_warehouse');
    }else if(origin.type == 'location' && destination.type == 'location'){
      setDeliveryType('location_to_location');
    }else{
      setDeliveryType('warehouse_to_warehouse');
    }
  };

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

  const fetchPallets = async (warehouseID, companyID) => {
    setLoadingPallets(true);
    try {
      const payload = {
        warehouseID: warehouseID,
        companyID: companyID
      };

      const response = await axios.post(API_URL_PALLET_CWS, payload, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      
      setPallets(response.data.pallets || []);
      
      if (!response.data.pallets || response.data.pallets.length === 0) {
        message.info('No pallets found for this company in the selected warehouse');
      }
    } catch (error) {
      console.error('Error fetching pallets:', error);
      setPallets([]);
      message.error('Failed to load pallets');
    } finally {
      setLoadingPallets(false);
    }
  };

  const handleCompanyChange = (companyId) => {
    setSelectedCompanyId(companyId);
  };

  const handleTruckChange = (truckId) => {
    const truck = trucks.find((t) => t.id === truckId);
    setSelectedTruck(truck);
  };

  const handleTrailerChange = (trailerId) => {
    const trailer = trailers.find((t) => t.id === trailerId);
    setSelectedTrailer(trailer);
  };

  const getModel = (modelId) => {
    return models.find((model) => model.id === modelId) || {};
  };

  const getBrand = (brandId) => {
    return brands.find((brand) => brand.id === brandId) || {};
  };

  const validateArrivalDate = (_, value) => {
    const shippingDate = form.getFieldValue('shipping_date');
    if (shippingDate && value && value.isBefore(shippingDate)) {
      return Promise.reject('Arrival date must be after shipping date!');
    }
    return Promise.resolve();
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Construct the payload
      const payload = {
        type: deliveryType,
        truck: values.truck,
        trailer: values.trailer || null, // Trailer is optional
        company_id: values.company,
        origin_id: origin.id,
        origin_type: origin.type,
          destination_id: destination.id,
          destination_type: destination.type,
        shipping_date: values.shipping_date.format('YYYY-MM-DDTHH:mm:ssZ'),
        estimated_arrival: values.estimated_arrival.format('YYYY-MM-DDTHH:mm:ssZ'),
        route: route,
        created_by:userID,
        status: 'pending',
        delivery_details: selectedPallets.map(pallet => ({
          pallet_id: pallet.id,
        }))
      };

      console.log('Submitting payload:', payload);
      
    
      const response = await axios.post(API_URL_DELIVERY, payload, {
        headers: {
          Authorization: authToken,
          'Content-Type': 'application/json',
        },
      });
      
      message.success('Delivery created successfully!');
      form.resetFields();
      setSelectedPallets([]);
      
      // For now, just log the payload
      console.log('Delivery payload:', payload);
      
    } catch (error) {
      console.error('Error creating delivery:', error);
      message.error('Failed to create delivery');
    } finally {
      setLoading(false);
    }
  };

  const handlePalletToggle = (pallet) => {
    setSelectedPallets(prev => {
      if (prev.some(p => p.id === pallet.id)) {
        return prev.filter(p => p.id !== pallet.id);
      } else {
        return [...prev, pallet];
      }
    });
  };

  if (!origin || !destination) {
    return null;
  }

  return (
    <>
      <Col span={12}>
        <div style={{ paddingLeft: '30px', borderRadius: '10px'}}>
          <Row gutter={8}>
            <Title level={4}>Delivery Info</Title>
          </Row>
          <Form
            form={form}
            name="delivery"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: '100%' }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Shipping Date */}
            <Form.Item
              label="Shipping Date"
              name="shipping_date"
              rules={[
                { required: true, message: 'Please select shipping date!' },
                () => ({
                  validator(_, value) {
                    if (!value || value >= dayjs().startOf('day')) {
                      return Promise.resolve();
                    }
                    return Promise.reject('Shipping date cannot be in the past!');
                  },
                }),
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                disabledDate={disabledDate}
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Estimated Arrival */}
            <Form.Item
              label="Estimated Arrival"
              name="estimated_arrival"
              rules={[
                { required: true, message: 'Please select estimated arrival!' },
                { validator: validateArrivalDate }
              ]}
              dependencies={['shipping_date']}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                disabledDate={disabledDate}
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Company Select */}
            <Form.Item
              label="Company"
              name="company"
              rules={[{ required: true, message: 'Please select the company!' }]}
            >
              <Select 
                placeholder="Select a company"
                onChange={handleCompanyChange}
              >
                {companies.map((company) => (
                  <Option key={company.id} value={company.id}>
                    {company.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Truck Select */}
            <Form.Item
              label="Truck"
              name="truck"
              rules={[{ required: true, message: 'Please select a truck!' }]}
            >
              <Select
                placeholder="Select a truck"
                onChange={handleTruckChange}
                showSearch
                optionFilterProp="children"
              >
                {trucks.map((truck) => {
                  const model = getModel(truck.model_id);
                  const brand = getBrand(model.brand_id);
                  return (
                    <Option key={truck.id} value={truck.id}>
                      {`${brand.name || 'Unknown Brand'} ${model.name || 'Unknown Model'} - ${truck.plates}`}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Trailer Select (Optional) */}
            <Form.Item
              label="Trailer"
              name="trailer"
              rules={[{ required: true, message: 'Please select a trailer!' }]}
            >
              <Select
                placeholder="Select a trailer"
                onChange={handleTrailerChange}
                showSearch
                optionFilterProp="children"
              >
                {trailers.map((trailer) => {
                  const model = getModel(trailer.model_id);
                  const brand = getBrand(model.brand_id);
                  return (
                    <Option key={trailer.id} value={trailer.id}>
                      {`${brand.name || 'Unknown Brand'} ${model.name || 'Unknown Model'} - ${trailer.plates}`}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            {/* Display selected truck/trailer details */}
            {(selectedTruck || selectedTrailer) && (
              <Row gutter={16}>
                {selectedTruck && (
                  <Col span={12}>
                    <Card size="small" title="Truck Details">
                      <p>Plates: {selectedTruck.plates}</p>
                      <p>Volume: {selectedTruck.volume}</p>
                    </Card>
                  </Col>
                )}
                {selectedTrailer && (
                  <Col span={12}>
                    <Card size="small" title="Trailer Details">
                      <p>Plates: {selectedTrailer.plates}</p>
                      <p>Volume: {selectedTrailer.volume}</p>
                    </Card>
                  </Col>
                )}
              </Row>
            )}

            {/* Origin Input */}
            <Form.Item label="Origin">
              <Input value={origin.name} disabled />
            </Form.Item>

            {/* Destination Input */}
            <Form.Item label="Destination">
              <Input value={destination.name} disabled />
            </Form.Item>

            {/* Delivery Type */}
            <Form.Item label="Delivery Type">
              <Input 
                value={options.find(option => option.value === deliveryType)?.label} 
                disabled 
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Order Delivery
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>  

      {/* Pallets Selection Column */}
      <Col span={12}>
        <div style={{ paddingLeft: '30px', borderRadius: '10px'}}>
          <Row gutter={8}>
            <Title level={4}>Selected Pallets: {selectedPallets.length}</Title>
          </Row>
          <div style={{overflowY:'auto',height:'60vh'}}>
            {loadingPallets ? (
              <Spin tip="Loading pallets..." />
            ) : deliveryType === 'location_to_warehouse' || deliveryType === 'location_to_location' ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'gray' }}>
                Deliveries as location to location or location to warehouse don't send pallets contained within our Warehouses
              </div>
            ): pallets.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'gray' }}>
                No pallets available for selected company within the selected origin warehouse
              </div>
            ) : (
              pallets.map((pallet) => (
                <Card
                  key={pallet.id}
                  hoverable
                  style={{
                    marginBottom: "16px",
                    cursor: "pointer",
                    border: selectedPallets.find(p => p.id === pallet.id) ? '2px solid #FF731D' : '1px solid #f0f0f0',
                  }}
                  onClick={() => handlePalletToggle(pallet)}
                >
                  <Row justify="space-between" align="middle">
                    <Col>
                      <ProductOutlined style={{ fontSize: "36px", color: "#FF731D" }} />
                    </Col>
                    <Col flex="auto" style={{ paddingLeft: 16 }}>
                      <Title level={5} style={{ margin: 0 }}>Pallet #{pallet.id}</Title>
                      <Text>Weight: {pallet.weight} kg</Text><br />
                      <Text>Volume: {pallet.volume} m³</Text>
                    </Col>
                  </Row>
                </Card>
              ))
            )}
          </div>
        </div>
      </Col>
    </>
  );
};

export default RouteForm;