import {useEffect} from 'react';
import { Form, Input, Modal, Switch, InputNumber, Select } from 'antd';
const {TextArea} = Input;

const ReportFormModal = ({ 
    visible, 
    onCancel, 
    onSubmit, 
    initialValues = null,
    problems = [], //recibe un state de un fetch con informacion de axios get
    drivers =[] //recibe un state de un fetch con informacion de axios get
  }) => {
    const [form] = Form.useForm();
    const isEditMode = !!initialValues;
  
    // Resetear el formulario cuando cambian los valores iniciales
    useEffect(() => {
      if (visible){
        form.resetFields();
        if (initialValues) {
          form.setFieldsValue(initialValues);
        }
      }
    }, [visible, initialValues, form]);
  
    const handleSubmit = async () => {
      try {
        const values = await form.validateFields();
        onSubmit(values);
        form.resetFields();
      } catch (error) {
        console.error('Error de validación:', error);
      }
    };
  
    return (
      <Modal
        title={isEditMode ? "Editar Usuario" : "Nuevo Usuario"}
        open={visible}
        onCancel={onCancel}
        onOk={handleSubmit}
        okText={isEditMode ? "Actualizar" : "Crear"}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
        <Form.Item
    name="longitude"
    label="Longitud"
    rules={[
      { required: true, message: 'La longitud es obligatoria' },
      {
        validator: (_, value) => {
          if (value === null || value === undefined) return Promise.resolve();
          if (isNaN(value)) return Promise.reject('Debe ser un número válido');
          if (value < -180 || value > 180) {
            return Promise.reject('La longitud debe estar entre -180 y 180');
          }
          return Promise.resolve();
        }
      }
    ]}
  >
    <InputNumber 
      placeholder="-180.000 a 180.000"
      step="0.000001"
      precision={6}
      style={{ width: '100%' }}
    />
  </Form.Item>

  <Form.Item
    name="latitude"
    label="Latitud"
    rules={[
      { required: true, message: 'La latitud es obligatoria' },
      {
        validator: (_, value) => {
          if (value === null || value === undefined) return Promise.resolve();
          if (isNaN(value)) return Promise.reject('Debe ser un número válido');
          if (value < -90 || value > 90) {
            return Promise.reject('La latitud debe estar entre -90 y 90');
          }
          return Promise.resolve();
        }
      }
    ]}
  >
    <InputNumber 
      placeholder="-90.000 a 90.000"
      step="0.000001"
      precision={6}
      style={{ width: '100%' }}
    />
  </Form.Item>
  
          <Form.Item
            name="problem"
            label="Problem: "
            rules={[
              { required: true, message: 'Campo obligatorio' },
            ]}
          >
            <Select
              placeholder="selecciona problma"
              options={problems.map( (pro) => ({
                value: pro.id,
                label: pro.name
              }))}
            />
          </Form.Item>
  
          <Form.Item
            name="issue"
            label="Issue:"
            valuePropName="checked"
            initialValue={initialValues?.issue || false}
          >
            <Switch 
              checkedChildren="Activo" 
              unCheckedChildren="Inactivo" 
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              {required: true, message:'descripcion requerida'}
            ]}
          >
            <TextArea
              rows={4}
              placeholder='Descripcion detallada'
              style={{ height: 120, resize: 'none' }}
              showCount
              maxLength={250}
            />
          </Form.Item>

          <Form.Item
            name="driver"
            label="Driver"
            rules={[
              { required: true, message: 'Campo obligatorio' },
            ]}
          >
            <Select
              placeholder="selecciona driver"
              options={drivers.map( (pro) => ({
                value: pro.id,
                label: pro.first_name
              }))}
            />
          </Form.Item>


        </Form>
      </Modal>
    );
  };

export default ReportFormModal;
  