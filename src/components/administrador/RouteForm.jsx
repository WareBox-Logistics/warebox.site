//form to fill the information for the delivery
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Row, Col, message, Typography } from 'antd';

// import axios from 'axios';
// import { API_URL_DELIVERY, API_URL_DELIVERY_DETAIL, API_URL_ROUTES_DELIVERY, authToken } from 'services/services';
const { Title } = Typography;
const RouteForm = ({origin, destination}) => {

    const onFinish = (values) => {
        console.log('Success:', values);
      };
      const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
      };

      if (!origin || !destination) {
        return null;
      }
      console.log(origin, destination);

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
        <Form.Item
          label="Truck"
          name="truck"
          rules={[
            {
              required: true,
              message: 'Please select the truck!',
            },
          ]}
        >
          <Input />
        </Form.Item>
    
        <Form.Item
          label="Trailer"
          name="trailer"
          rules={[
            {
              required: true,
              message: 'Please select the trailer!',
            },
          ]}
        >
          <Input />
        </Form.Item>

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
          <Input />
        </Form.Item>

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
          <Input 
            value={origin.name}
            placeholder={origin.name}
            disabled={true}
          />
        </Form.Item>

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
          <Input 
            value={destination.name}
            placeholder={destination.name}
            disabled={true}
          />
        </Form.Item>

    
    
        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" > {/*Restriccion para solo dejar crear la orden cuando este lista la ruta y el formilario lleno */}
            Create Order Delivery
          </Button>
        </Form.Item>
      </Form>
      </div>
    );


}

export default RouteForm;