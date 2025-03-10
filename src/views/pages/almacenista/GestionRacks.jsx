import React, { useState } from "react";
import { IconCubePlus } from "@tabler/icons-react";
import { Formik, Form, Field } from "formik";
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
  Modal,
} from "antd";
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Paper } from "@mui/material";

// ========== Utilidad para determinar color por porcentaje ==========
const getColorByPercentage = (percentage) => {
  if (percentage < 50) {
    return "#f5222d"; // Rojo
  } else if (percentage < 90) {
    return "#faad14"; // Amarillo
  } else {
    return "#52c41a"; // Verde
  }
};

// 1. Esquema de validación para el formulario de racks
//    - Se renombra "depth" → "length" (largo).
//    - Ahora todo se maneja en metros.
const RackSchema = Yup.object().shape({
  warehouse_id: Yup.string().required("El Warehouse ID es obligatorio"),
  section: Yup.string().required("La sección es obligatoria"),
  levels: Yup.number().required("Los niveles son obligatorios"),
  height: Yup.number()
    .required("La altura (m) es obligatoria")
    .min(0, "La altura debe ser mayor a 0"),
  width: Yup.number()
    .required("El ancho (m) es obligatorio")
    .min(0, "El ancho debe ser mayor a 0"),
  length: Yup.number()
    .required("El largo (m) es obligatorio")
    .min(0, "El largo debe ser mayor a 0"),
  // capacity_volume se calcula automáticamente, por lo que no se ingresa
  capacity_weight: Yup.number().required("La capacidad (kg) es obligatoria"),
});

// 2. Esquema de validación para almacenar pallet
//    --- Se ajusta a A-F en lugar de A-Z ---
const StorePalletSchema = Yup.object().shape({
  position: Yup.string()
    .required("La posición (A-F) es obligatoria")
    .matches(/^[A-F]$/, "Debe ser una sola letra A-F"),
  level: Yup.number().required("El nivel es obligatorio"),
  pallet_id: Yup.string().required("Debes seleccionar un pallet"),
});

const GestionRacks = () => {
  // ==================== ESTADOS SIMULADOS ====================
  // A) Racks
  const [racks, setRacks] = useState([
    {
      id: "Rack-1",
      warehouse_id: "tj01",
      section: "A",
      levels: 3,
      height: 1.2,
      width: 0.8,
      length: 1.0,
      capacity_volume: 0.096,
      capacity_weight: 1000,
      status: "available",
      used_volume: 0.0,
      used_weight: 0,
    },
    {
      id: "Rack-2",
      warehouse_id: "tj01",
      section: "B",
      levels: 2,
      height: 1.0,
      width: 0.6,
      length: 0.8,
      capacity_volume: 0.048,
      capacity_weight: 500,
      status: "available",
      used_volume: 0.01,
      used_weight: 300,
    },
  ]);

  // B) Pallets (volumen en m³)
  const [pallets, setPallets] = useState([
    {
      id: "PAL-01",
      warehouse_id: "mx01",
      company_id: "COMP-01",
      weight: 100,
      volume: 0.002,
      verified: true,
      status: "Created",
      created_at: "2025-03-01T10:00:00",
      updated_at: "2025-03-08T09:00:00",
    },
    {
      id: "PAL-02",
      warehouse_id: "mx02",
      company_id: "COMP-02",
      weight: 300,
      volume: 0.008,
      verified: true,
      status: "Created",
      created_at: "2025-03-02T10:00:00",
      updated_at: "2025-03-08T12:00:00",
    },
    {
      id: "PAL-03",
      warehouse_id: "mx03",
      company_id: "COMP-03",
      weight: 400,
      volume: 0.05,
      verified: false,
      status: "Created",
      created_at: "2025-03-04T10:00:00",
      updated_at: "2025-03-08T15:00:00",
    },
  ]);

  // C) storage_rack_pallet (simulando la tabla)
  const [storageRackPallet, setStorageRackPallet] = useState([]);

  // ==================== ESTADOS Y FUNCIONES PARA EL MODAL ====================
  const [searchText, setSearchText] = useState("");
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedRack, setSelectedRack] = useState(null);

  // Función para abrir el modal y almacenar el rack seleccionado
  const openStoreModal = (rack) => {
    setSelectedRack(rack);
    setIsStoreModalOpen(true);
  };

  // Cierra el modal
  const handleCancelModal = () => {
    setIsStoreModalOpen(false);
    setSelectedRack(null);
  };

  // Genera un nuevo ID para racks
  const generateNewId = () => `Rack-${racks.length + 1}`;

  // Filtrado de racks por ID
  const filteredRacks = racks.filter((rack) =>
    rack.id.toLowerCase().includes(searchText.toLowerCase())
  );

  // ==================== TABLA DE RACKS ====================
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Warehouse ID", dataIndex: "warehouse_id", key: "warehouse_id" },
    { title: "Sección", dataIndex: "section", key: "section" },
    { title: "Niveles", dataIndex: "levels", key: "levels" },
    {
      title: "Altura (m)",
      dataIndex: "height",
      key: "height",
      render: (value) => `${value.toFixed(2)} m`,
    },
    {
      title: "Ancho (m)",
      dataIndex: "width",
      key: "width",
      render: (value) => `${value.toFixed(2)} m`,
    },
    {
      title: "Largo (m)",
      dataIndex: "length",
      key: "length",
      render: (value) => `${value.toFixed(2)} m`,
    },
    {
      title: "Volumen (m³)",
      dataIndex: "capacity_volume",
      key: "capacity_volume",
      render: (value) => `${value.toFixed(2)} m³`,
    },
    {
      title: "Cap. Peso (kg)",
      dataIndex: "capacity_weight",
      key: "capacity_weight",
    },
    {
      title: "Used Volume (m³)",
      dataIndex: "used_volume",
      key: "used_volume",
      render: (value) => `${value.toFixed(2)} m³`,
    },
    {
      title: "Used Weight (kg)",
      dataIndex: "used_weight",
      key: "used_weight",
    },
    {
      title: "Volumen Disp. (m³)",
      key: "available_volume",
      render: (_, record) => {
        const available = record.capacity_volume - record.used_volume;
        const percentage = (available / record.capacity_volume) * 100;
        const color = getColorByPercentage(percentage);
        return <span style={{ color }}>{available.toFixed(2)} m³</span>;
      },
    },
    {
      title: "Peso Disp. (kg)",
      key: "available_weight",
      render: (_, record) => {
        const available = record.capacity_weight - record.used_weight;
        const percentage = (available / record.capacity_weight) * 100;
        const color = getColorByPercentage(percentage);
        return <span style={{ color }}>{available} kg</span>;
      },
    },
    {
      title: "Acción",
      key: "action",
      render: (_, record) => (
        <Button icon={<IconCubePlus />} onClick={() => openStoreModal(record)}>
          Almacenar Pallet
        </Button>
      ),
    },
  ];

  // ==================== CÁLCULO DE NIVELES DEL RACK SELECCIONADO ====================
  const getRackLevelsOptions = (rack) => {
    if (!rack) return [];
    return Array.from({ length: rack.levels }, (_, i) => i + 1).map((lvl) => ({
      label: `Nivel ${lvl}`,
      value: lvl,
    }));
  };

  // ==================== FILTRAR PALLETS (status=Created y verified=true) ====================
  const availablePallets = pallets
    .filter((p) => p.status === "Created" && p.verified === true)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  // ==================== FORM DE ALMACENAR PALLET ====================
  const handleStorePalletSubmit = (values, { setSubmitting, resetForm }) => {
    try {
      if (!selectedRack) return;

      // 1. Verificar que la position no esté ocupada en el mismo rack_id + level
      const isOccupied = storageRackPallet.some(
        (srp) =>
          srp.rack_id === selectedRack.id &&
          srp.level === values.level &&
          srp.position === values.position &&
          srp.status === "Occupied"
      );
      if (isOccupied) {
        message.error(
          `La posición ${values.position} en el nivel ${values.level} ya está ocupada.`
        );
        setSubmitting(false);
        return;
      }

      // 2. Verificar que el pallet quepa (peso y volumen)
      const pallet = availablePallets.find((p) => p.id === values.pallet_id);
      if (!pallet) {
        message.error("El pallet seleccionado no existe o no está disponible.");
        setSubmitting(false);
        return;
      }

      const { used_volume, used_weight, capacity_volume, capacity_weight } =
        selectedRack;
      const newUsedVolume = used_volume + pallet.volume;
      const newUsedWeight = used_weight + pallet.weight;

      if (newUsedVolume > capacity_volume || newUsedWeight > capacity_weight) {
        message.error("El pallet excede la capacidad del rack (peso o volumen).");
        setSubmitting(false);
        return;
      }

      // 3. Insertar registro en storage_rack_pallet
      const now = new Date().toISOString();
      const newStorageRecord = {
        rack_id: selectedRack.id,
        position: values.position,
        level: values.level,
        stored_at: now,
        status: "Occupied",
        pallet_id: values.pallet_id,
      };
      setStorageRackPallet((prev) => [...prev, newStorageRecord]);

      // 4. Actualizar pallet (status = Stored, warehouse_id = rack.warehouse_id)
      setPallets((prevPallets) =>
        prevPallets.map((p) => {
          if (p.id === pallet.id) {
            return {
              ...p,
              status: "Stored",
              warehouse_id: selectedRack.warehouse_id,
              updated_at: now,
            };
          }
          return p;
        })
      );

      // 5. Actualizar used_volume y used_weight del rack
      setRacks((prevRacks) =>
        prevRacks.map((r) => {
          if (r.id === selectedRack.id) {
            return {
              ...r,
              used_volume: newUsedVolume,
              used_weight: newUsedWeight,
            };
          }
          return r;
        })
      );

      message.success(
        `Pallet ${pallet.id} almacenado correctamente en ${selectedRack.id}.`
      );
      resetForm();
      setSubmitting(false);
      setIsStoreModalOpen(false);
      setSelectedRack(null);
    } catch (error) {
      message.error("Error al almacenar el pallet.");
      setSubmitting(false);
    }
  };

  // ==================== RENDER DEL COMPONENTE ====================
  return (
    <Paper
      style={{
        padding: 16,
        maxWidth: "100%",
        overflowX: "hidden",
        height: "100%",
      }}
    >
      <h2>Gestión de Racks con Almacenamiento de Pallets</h2>

      {/* FORMULARIO PARA REGISTRAR NUEVO RACK (VALORES EN m, VOLUMEN EN m³) */}
      <Card title="Registrar Nuevo Rack" style={{ marginTop: 20 }}>
        <Formik
          initialValues={{
            warehouse_id: "tj01",
            section: "",
            levels: "",
            height: "",
            width: "",
            length: "",
            // capacity_volume se calculará automáticamente
            capacity_volume: 0,
            capacity_weight: "",
          }}
          validationSchema={RackSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            setSubmitting(true);
            try {
              // Calcular el volumen en m³
              const calculatedVolume =
                (parseFloat(values.height) || 0) *
                (parseFloat(values.width) || 0) *
                (parseFloat(values.length) || 0);

              // Crear un nuevo rack con ID generado automáticamente
              const newRack = {
                id: generateNewId(),
                warehouse_id: values.warehouse_id,
                section: values.section,
                levels: Number(values.levels),
                height: Number(values.height),
                width: Number(values.width),
                length: Number(values.length),
                capacity_volume: Number(calculatedVolume) || 0,
                capacity_weight: Number(values.capacity_weight),
                status: "available",
                used_volume: 0,
                used_weight: 0,
              };

              setRacks((prev) => [...prev, newRack]);
              message.success("Rack agregado correctamente");
              resetForm();
            } catch (error) {
              message.error("Error al agregar rack");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            setFieldValue,
            errors,
            touched,
            isSubmitting,
            handleSubmit,
          }) => {
            // Función auxiliar para recalcular el volumen en tiempo real
            const recalculateVolume = (fieldName, value) => {
              setFieldValue(fieldName, value);
              const h = parseFloat(fieldName === "height" ? value : values.height) || 0;
              const w = parseFloat(fieldName === "width" ? value : values.width) || 0;
              const l = parseFloat(fieldName === "length" ? value : values.length) || 0;
              const vol = h * w * l;
              setFieldValue("capacity_volume", vol);
            };

            return (
              <Form onSubmit={handleSubmit}>
                <Row gutter={[16, 16]}>
                  {/* ID (autogenerado) */}
                  <Col xs={24} sm={8} md={4}>
                    <Input
                      disabled
                      value={generateNewId()}
                      placeholder="ID (autogenerado)"
                    />
                  </Col>

                  {/* Warehouse ID */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="warehouse_id">
                      {({ field }) => (
                        <Input
                          {...field}
                          placeholder="Warehouse ID"
                          status={
                            errors.warehouse_id && touched.warehouse_id
                              ? "error"
                              : ""
                          }
                        />
                      )}
                    </Field>
                    {errors.warehouse_id && touched.warehouse_id && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.warehouse_id}
                      </div>
                    )}
                  </Col>
                  {/* Sección */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="section">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Seccion del almacen"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("section", value)}
                          options={[
                            {
                              label: "Seccion del almacen",
                              value: "",
                              disabled: true,
                            },
                            ...Array.from({ length: 26 }, (_, i) => {
                              const letra = String.fromCharCode(65 + i);
                              return { label: letra, value: letra };
                            }),
                          ]}
                          value={values.section || ""}
                          status={
                            errors.section && touched.section ? "error" : ""
                          }
                        />
                      )}
                    </Field>
                    {errors.section && touched.section && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.section}
                      </div>
                    )}
                  </Col>

                  {/* Niveles */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="levels">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Niveles del rack"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("levels", value)}
                          options={[
                            {
                              label: "Niveles del rack",
                              value: "",
                              disabled: true,
                            },
                            ...[1, 2, 3, 4, 5, 6].map((lvl) => ({
                              label: lvl,
                              value: lvl,
                            })),
                          ]}
                          value={values.levels || ""}
                          status={
                            errors.levels && touched.levels ? "error" : ""
                          }
                        />
                      )}
                    </Field>
                    {errors.levels && touched.levels && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.levels}
                      </div>
                    )}
                  </Col>

                  {/* Altura (m) */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="height">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Altura (m)"
                          status={
                            errors.height && touched.height ? "error" : ""
                          }
                          onChange={(e) =>
                            recalculateVolume("height", e.target.value)
                          }
                        />
                      )}
                    </Field>
                    {errors.height && touched.height && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.height}
                      </div>
                    )}
                  </Col>

                  {/* Ancho (m) */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="width">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Ancho (m)"
                          status={errors.width && touched.width ? "error" : ""}
                          onChange={(e) =>
                            recalculateVolume("width", e.target.value)
                          }
                        />
                      )}
                    </Field>
                    {errors.width && touched.width && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.width}
                      </div>
                    )}
                  </Col>

                  {/* Largo (m) (antes "Profundidad") */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="length">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Largo (m)"
                          status={errors.length && touched.length ? "error" : ""}
                          onChange={(e) =>
                            recalculateVolume("length", e.target.value)
                          }
                        />
                      )}
                    </Field>
                    {errors.length && touched.length && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.length}
                      </div>
                    )}
                  </Col>

                  {/* Volumen (m³) - Se muestra solo como lectura */}
                  <Col xs={24} sm={8} md={4}>
                    <Input
                      value={`${values.capacity_volume.toFixed(2)} m³`}
                      placeholder="Volumen (m³)"
                      disabled
                    />
                  </Col>

                  {/* Cap. Peso (kg) */}
                  <Col xs={24} sm={8} md={4}>
                    <Field name="capacity_weight">
                      {({ field }) => (
                        <Input
                          {...field}
                          placeholder="Capacidad (kg)"
                          type="number"
                          status={
                            errors.capacity_weight && touched.capacity_weight
                              ? "error"
                              : ""
                          }
                        />
                      )}
                    </Field>
                    {errors.capacity_weight && touched.capacity_weight && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.capacity_weight}
                      </div>
                    )}
                  </Col>

                  {/* Botón Agregar Rack */}
                  <Col xs={24} sm={8} md={4}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={isSubmitting}
                      icon={
                        isSubmitting ? (
                          <LoadingOutlined spin style={{ color: "white" }} />
                        ) : (
                          <PlusOutlined />
                        )
                      }
                      block
                    >
                      {isSubmitting ? "Guardando..." : "Guardar"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            );
          }}
        </Formik>
      </Card>

      {/* Buscador de racks por ID */}
      <Input
        style={{
          width: "100%",
          maxWidth: 300,
          marginTop: 20,
          marginBottom: 10,
        }}
        prefix={<SearchOutlined />}
        placeholder="Buscar por ID (ej: Rack-1)"
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* Tabla de racks */}
      <div style={{ overflowX: "auto" }}>
        <Table
          dataSource={filteredRacks}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      {/* MODAL PARA ALMACENAR UN PALLET EN EL RACK */}
      <Modal
        title={`Almacenar Pallet en ${selectedRack?.id || ""}`}
        visible={isStoreModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
      >
        {selectedRack && (
          <Formik
            initialValues={{
              position: "",
              level: "",
              pallet_id: "",
            }}
            validationSchema={StorePalletSchema}
            onSubmit={handleStorePalletSubmit}
          >
            {({
              values,
              setFieldValue,
              errors,
              touched,
              isSubmitting,
              handleSubmit,
            }) => (
              <Form onSubmit={handleSubmit}>
                <Row gutter={[16, 16]}>
                  {/* RACK ID (solo lectura) */}
                  <Col span={24}>
                    <label>Rack ID:</label>
                    <Input disabled value={selectedRack.id} />
                  </Col>

                  {/* Position (A-F) en combo box */}
                  <Col span={12}>
                    <Field name="position">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Posición (A-F)"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("position", value)}
                          options={[
                            { label: "A", value: "A" },
                            { label: "B", value: "B" },
                            { label: "C", value: "C" },
                            { label: "D", value: "D" },
                            { label: "E", value: "E" },
                            { label: "F", value: "F" },
                          ]}
                          status={
                            errors.position && touched.position ? "error" : ""
                          }
                        />
                      )}
                    </Field>
                    {errors.position && touched.position && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.position}
                      </div>
                    )}
                  </Col>

                  {/* Level (combobox basado en los niveles del rack) */}
                  <Col span={12}>
                    <Field name="level">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Selecciona Nivel"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("level", value)}
                          options={getRackLevelsOptions(selectedRack)}
                          status={errors.level && touched.level ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.level && touched.level && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.level}
                      </div>
                    )}
                  </Col>

                  {/* Pallet (solo pallets verificados y status=Created) */}
                  <Col span={24}>
                    <label>Pallet:</label>
                    <Field name="pallet_id">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Selecciona Pallet"
                          style={{ width: "100%" }}
                          popupMatchSelectWidth={false}
                          dropdownStyle={{ whiteSpace: "pre-wrap" }}
                          onChange={(value) => setFieldValue("pallet_id", value)}
                          options={availablePallets.map((p) => ({
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  maxWidth: 300,
                                }}
                              >
                                <strong>{p.id}</strong>
                                <span>Warehouse: {p.warehouse_id}</span>
                                <span>Empresa: {p.company_id}</span>
                                <span>Peso: {p.weight} kg</span>
                                <span>Volumen: {p.volume.toFixed(3)} m³</span>
                              </div>
                            ),
                            value: p.id,
                          }))}
                          status={
                            errors.pallet_id && touched.pallet_id
                              ? "error"
                              : ""
                          }
                        />
                      )}
                    </Field>
                    {errors.pallet_id && touched.pallet_id && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.pallet_id}
                      </div>
                    )}
                  </Col>

                  {/* Botón para Guardar */}
                  <Col span={24}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      disabled={isSubmitting}
                      icon={
                        isSubmitting ? (
                          <LoadingOutlined spin style={{ color: "white" }} />
                        ) : (
                          <IconCubePlus />
                        )
                      }
                      style={{ marginTop: 8 }}
                      block
                    >
                      {isSubmitting ? "Guardando..." : "Almacenar"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        )}
      </Modal>
    </Paper>
  );
};

export default GestionRacks;
