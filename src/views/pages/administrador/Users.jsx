import { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { authToken,API_URL_WAREHOUSE } from '../../../services/services';
import * as Yup from "yup";
import {
  Card,
  Col,
  Row,
  Input,
  Button,
  Table,
  message,
  Select,
  Spin,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  LockOutlined,
  UserOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Paper } from "@mui/material";
import MetricCard from "components/administrador/EmployeesMetrics";
import { GET_EMPLOYES } from "graphql/queries";
import { useQuery } from "@apollo/client";
import axios from "axios";


const EmployeeSchema = Yup.object().shape({
  first_name: Yup.string().required("El nombre es obligatorio"),
  last_name: Yup.string().required("El apellido es obligatorio"),
  email: Yup.string()
    .email("Email inválido")
    .required("El email es obligatorio"),
  password: Yup.string()
    .min(6, "Mínimo 6 caracteres")
    .required("La contraseña es obligatoria"),
  role: Yup.string().required("El rol es obligatorio"),


  // Se requiere warehouse SÓLO si role = "2".
  warehouse: Yup.string().when("role", (roleValue, schema) => {
    if (roleValue === "2") {
      return schema.required("Selecciona un warehouse");
    }
    return schema.nullable();
  }),
});

const Employees = () => {
  const [searchText, setSearchText] = useState("");
  const [employees, setEmployees] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const {
    data,
    loading: loadingUsers,
    error,
    refetch,
  } = useQuery(GET_EMPLOYES, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data && data.employee) {
        setEmployees(
          data.employee.map((emp) => ({
            id: emp.id,
            first_name: emp.first_name,
            last_name: emp.last_name,
            email: emp.email,
            role: emp.role_table ? emp.role_table.name : "Sin rol",
          }))
        );
      }
    },
  });

  useEffect(() => {
    refetch();

    const fetchWarehouses = async () => {
      try {
        const response = await axios.get(API_URL_WAREHOUSE, {
          headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        }
        });
        if (response.data.warehouses) {
          setWarehouses(response.data.warehouses);
        }
      } catch (err) {
        message.error("No se pudieron cargar los Warehouses");
      }
    };

    fetchWarehouses();
  }, [refetch]);

  if (error) {
    message.error("Error al cargar empleados");
    return null;
  }


  const filteredEmployees = employees.filter((employee) =>
    `${employee.first_name} ${employee.last_name}`
      .toLowerCase()
      .includes(searchText.toLowerCase())
  );

  // Config de columnas de la tabla
  const columns = [
    { title: "Nombre", dataIndex: "first_name", key: "first_name" },
    { title: "Apellido", dataIndex: "last_name", key: "last_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Rol", dataIndex: "role", key: "role" },
  ];

  return (
    <Paper style={{ padding: 16, maxWidth: "100%", overflowX: "hidden", height: "100%" }}>
      {/* Métricas */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <MetricCard
            title="Total Empleados"
            value={employees.length}
            max={50}
            progress={(employees.length / 50) * 100}
            icon={<UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <MetricCard
            title="Total Empleados"
            value={employees.length}
            max={50}
            progress={(employees.length / 50) * 100}
            icon={<UserOutlined style={{ fontSize: 24, color: "red" }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <MetricCard
            title="Total Empleados"
            value={employees.length}
            max={50}
            progress={(employees.length / 50) * 100}
            icon={<UserOutlined style={{ fontSize: 24, color: "#1890ff" }} />}
          />
        </Col>
      </Row>


      <Card title="Registrar Nuevo Empleado" style={{ marginTop: 20 }}>
        <Formik
          initialValues={{
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role: null,
            warehouse: null, 
          }}
          validationSchema={EmployeeSchema}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
              // Enviamos warehouse solo si rol=2
              await axios.post("https://back.warebox.pro/api/registerEmployee", {
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                password: values.password,
                password_confirmation: values.password,
                role: values.role,
                warehouse:
                  values.role === "2" ? Number(values.warehouse) : undefined,
              });

              setEmployees([...employees, { id: employees.length + 1, ...values }]);
              message.success("Empleado agregado correctamente");
              resetForm();
            } catch (error) {
              message.error("Error al agregar empleado");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, setFieldValue, errors, isSubmitting, touched }) => (
            <Form>
              <Row gutter={[16, 16]}>

                <Col xs={24} sm={12} md={6}>
                  <Field name="first_name">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Nombre"
                        status={
                          errors.first_name && touched.first_name ? "error" : ""
                        }
                      />
                    )}
                  </Field>
                  {errors.first_name && touched.first_name && (
                    <div style={{ color: "red", fontSize: 12 }}>{errors.first_name}</div>
                  )}
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Field name="last_name">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Apellido"
                        status={
                          errors.last_name && touched.last_name ? "error" : ""
                        }
                      />
                    )}
                  </Field>
                  {errors.last_name && touched.last_name && (
                    <div style={{ color: "red", fontSize: 12 }}>{errors.last_name}</div>
                  )}
                </Col>


                <Col xs={24} sm={12} md={6}>
                  <Field name="email">
                    {({ field }) => (
                      <Input
                        {...field}
                        placeholder="Email"
                        status={errors.email && touched.email ? "error" : ""}
                      />
                    )}
                  </Field>
                  {errors.email && touched.email && (
                    <div style={{ color: "red", fontSize: 12 }}>{errors.email}</div>
                  )}
                </Col>


                <Col xs={24} sm={12} md={6}>
                  <Field name="password">
                    {({ field }) => (
                      <Input.Password
                        {...field}
                        placeholder="Contraseña"
                        prefix={<LockOutlined />}
                        status={
                          errors.password && touched.password ? "error" : ""
                        }
                      />
                    )}
                  </Field>
                  {errors.password && touched.password && (
                    <div style={{ color: "red", fontSize: 12 }}>{errors.password}</div>
                  )}
                </Col>

                <Col xs={24} sm={8} md={4}>
                  <Field name="role">
                    {({ field }) => (
                      <Select
                        {...field}
                        placeholder="Selecciona un rol"
                        style={{ width: "100%" }}
                        allowClear
                        onChange={(value) => setFieldValue("role", value || null)}
                        options={[
                          { value: "1", label: "Administrador" },
                          { value: "2", label: "Almacenista" },
                          { value: "3", label: "Chofer" },
                          { value: "4", label: "Monitor (despacho)" },
                          { value: "5", label: "Operador" },
                          { value: "6", label: "Supervisor" },
                          { value: "7", label: "Cliente" },
                        ]}
                      />
                    )}
                  </Field>
                  {errors.role && touched.role && (
                    <div style={{ color: "red", fontSize: 12 }}>{errors.role}</div>
                  )}
                </Col>

                {/* Campo Warehouse (solo visible si role=2) */}
                {values.role === "2" && (
                  <Col xs={24} sm={8} md={4}>
                    <Field name="warehouse">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Selecciona un warehouse"
                          style={{ width: "100%" }}
                          allowClear
                          onChange={(value) => setFieldValue("warehouse", value || null)}
                          options={warehouses.map((wh) => ({
                            value: wh.id.toString(),
                            label: wh.name,
                          }))}
                        />
                      )}
                    </Field>
                    {errors.warehouse && touched.warehouse && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.warehouse}
                      </div>
                    )}
                  </Col>
                )}

                <Col xs={24} sm={8} md={4}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isSubmitting}
                    icon={
                      isSubmitting ? (
                        <Spin
                          indicator={<LoadingOutlined spin style={{ color: "white" }} />}
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
            </Form>
          )}
        </Formik>
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
        placeholder="Buscar por nombre o apellido"
        onChange={(e) => setSearchText(e.target.value)}
      />


      <div style={{ overflowX: "auto" }}>
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
        />
      </div>
    </Paper>
  );
};

export default Employees;
