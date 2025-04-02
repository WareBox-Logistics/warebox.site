import {useEffect} from 'react';
import { Form, Input, Modal, Switch, InputNumber, Select } from 'antd';
const {TextArea} = Input;

const ReportFormModal = ({ 
    visible, 
    onCancel, 
    onSubmit, 
    initialValues = null,
    reportsWithout = [], //recibe un state de un fetch con informacion de axios get
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
      console.log('operator ++++++++++++++++++++++++++++==',localStorage.user_id);
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
        <Form form={form} layout="vertical"
        initialValues={{ operator: Number(localStorage.user_id) }} 
        >
        <Form.Item
            name="report"
            label="Report: "
            rules={[
              { required: true, message: 'Campo obligatorio' },
            ]}
          >
            <Select
              // disabled={isEditMode}
              placeholder="selecciona Report"
              options={reportsWithout.map( (pro) => ({
                value: pro.id,
                label: `${pro.id}: ${pro.description}`
              }))}
              
            />
          </Form.Item>

          <Form.Item
            name="operator"
            label="Operator: "
            rules={[
              // { required: true, message: 'Campo obligatorio' },
            ]}
          >
            <InputNumber 
              placeholder="current operator"
              style={{width: '100%'}}
              // value={localStorage.user_id}
              // readOnly
            />
          </Form.Item>
  
          <Form.Item
            name="status"
            label="Status: "
            rules={[
              { required: true, message: 'Campo obligatorio' },
            ]}
          >
            <Select
              placeholder="selecciona problma"
              options={[
                {value:'DONE', label:'DONE'},
                {value:'WIP', label:'WIP'},
                {value:'WAIT', label:'WAIT'}
              ]}
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
            name="support"
            label="Support:"
            valuePropName="checked"
            initialValue={initialValues?.support || false}
          >
            <Switch 
              checkedChildren="Activo" 
              unCheckedChildren="Inactivo" 
            />
          </Form.Item>

        </Form>
      </Modal>
    );
  };

export default ReportFormModal;
  