import React, { useState, useEffect } from "react";
import { IconCubePlus } from "@tabler/icons-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { authToken, API_URL_RACK,API_URL_PALLET, API_URL_STORAGE_RACK_PALLET, API_URL_WAREHOUSE } from '../../../services/services';
import axios from "axios";
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

// ====== Utility: determine color by percentage ======
const getColorByPercentage = (percentage) => {
  if (percentage < 50) {
    return "#f5222d"; // rojo
  } else if (percentage < 90) {
    return "#faad14"; // amarillo
  } else {
    return "#52c41a"; // verde
  }
};
const { Option } = Select;
// ====== Validation Schemas (Yup) ======
const RackSchema = Yup.object().shape({
  warehouse: Yup.number().required("Warehouse is required"),
  section: Yup.string().required("Section is required"),
  levels: Yup.number().required("Levels are required"),
  height: Yup.number()
    .required("Height (m) is required")
    .min(0, "Height must be greater than 0"),
  width: Yup.number()
    .required("Width (m) is required")
    .min(0, "Width must be greater than 0"),
  long: Yup.number()
    .required("Long (m) is required")
    .min(0, "Long must be greater than 0"),
  capacity_weight: Yup.number()
    .required("Weight capacity is required")
    .min(0, "Weight capacity must be greater than 0"),
});

const StorePalletSchema = Yup.object().shape({
  level: Yup.number().required("Level is required"),
  pallet: Yup.string().required("You must select a pallet"),
});

const GestionRacks = () => {
  // ====== States ======
  const [racks, setRacks] = useState([]);
  const [pallets, setPallets] = useState([]);
  const [storageRackPallet, setStorageRackPallet] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // combos

  // Estados para modal
  const [searchText, setSearchText] = useState("");
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedRack, setSelectedRack] = useState(null);


  // ====== useEffect: fetch data ======
  useEffect(() => {
    fetchRacks();
    fetchPallets();
    fetchWarehouses();
  }, []);

  // --- GET racks ---
  const fetchRacks = async () => {
    try {
      const res = await axios.get(API_URL_RACK, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      const sortedRacks = (res.data.data || []).sort((a, b) => b.id - a.id);
      setRacks(sortedRacks);
    } catch (error) {
      console.error("Error fetching racks:", error);
      message.error("Error loading racks");
    }
  };

  // --- GET pallets ---
  const fetchPallets = async () => {
    try {
      const res = await axios.get(API_URL_PALLET, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      console.log("this", res.data.pallets);
      setPallets(res.data.pallets || []);
    } catch (error) {
      console.error("Error fetching pallets:", error);
      message.error("Error loading pallets");
    }
  };
  // --- GET storagerackpallet ---
  const fetchStorageRackPallets = async () => {
    try {
      const res = await axios.get(API_URL_STORAGE_RACK_PALLET, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      setStorageRackPallet(res.data.data || []);
    } catch (error) {
      console.error("Error fetching storage rack pallets:", error);
      message.error("Error loading storage rack pallets");
    }
  };
  
  useEffect(() => {
    fetchStorageRackPallets();
  }, []);
  // --- GET warehouses ---
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(API_URL_WAREHOUSE, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });
      setWarehouses(res.data.warehouses || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      message.error("Error loading warehouses");
    }
  };

  // ====== Modal open/close ======
  const openStoreModal = (rack) => {
    setSelectedRack(rack);
    setIsStoreModalOpen(true);
  };
  const handleCancelModal = () => {
    setSelectedRack(null);
    setIsStoreModalOpen(false);
  };

  // ====== Filtrar racks por ID para la búsqueda ======
  const filteredRacks = racks.filter((rack) =>
    rack.id.toString().toLowerCase().includes(searchText.toLowerCase())
  );
  
  // ====== Columnas para la tabla de racks ======
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Warehouse", dataIndex: "warehouse", key: "warehouse" },
    { title: "Section", dataIndex: "section", key: "section" },
    { title: "Levels", dataIndex: "levels", key: "levels" },
    {
      title: "Height (m)",
      dataIndex: "height",
      key: "height",
      render: (value) => `${Number(value).toFixed(2)} m`,
    },
    {
      title: "Width (m)",
      dataIndex: "width",
      key: "width",
      render: (value) => `${Number(value).toFixed(2)} m`,
    },
    {
      title: "Long (m)",
      dataIndex: "long",
      key: "long",
      render: (value) => `${Number(value).toFixed(2)} m`,
    },
    {
      title: "Volume (m³)",
      dataIndex: "capacity_volume",
      key: "capacity_volume",
      render: (value) => `${Number(value || 0).toFixed(2)} m³`,
    },
    {
      title: "Weight Cap. (kg)",
      dataIndex: "capacity_weight",
      key: "capacity_weight",
    },
    {
      title: "Used Volume (m³)",
      dataIndex: "used_volume",
      key: "used_volume",
      render: (value) => `${Number(value || 0).toFixed(2)} m³`,
    },
    {
      title: "Used Weight (kg)",
      dataIndex: "used_weight",
      key: "used_weight",
      render: (value) => Number(value || 0),
    },
    {
      title: "Available Volume",
      key: "available_volume",
      render: (_, record) => {
        const available = (record.capacity_volume || 0) - (record.used_volume || 0);
        const totalCap = record.capacity_volume || 1;
        const percentage = (available / totalCap) * 100;
        const color = getColorByPercentage(percentage);
        return <span style={{ color }}>{available.toFixed(2)} m³</span>;
      },
    },
    {
      title: "Available Weight",
      key: "available_weight",
      render: (_, record) => {
        const available = (record.capacity_weight || 0) - (record.used_weight || 0);
        const totalCap = record.capacity_weight || 1;
        const percentage = (available / totalCap) * 100;
        const color = getColorByPercentage(percentage);
        return <span style={{ color }}>{available} kg</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button icon={<IconCubePlus />} onClick={() => openStoreModal(record)}>
          Store Pallet
        </Button>
      ),
    },
  ];

  // ====== POST: crear rack ======
  const handleCreateRack = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      // 1) Calcular volumen
      const calcVolume =
        (parseFloat(values.height) || 0) *
        (parseFloat(values.width) || 0) *
        (parseFloat(values.long) || 0);

      // 2) Armar payload
      const now = new Date().toISOString();
      const payload = {
        warehouse: values.warehouse,
        section: values.section,
        levels: Number(values.levels),
        height: Number(values.height),
        width: Number(values.width),
        long: Number(values.long),
        capacity_volume: calcVolume,
        capacity_weight: Number(values.capacity_weight),
        status: "Available",
        used_volume: 0,
        used_weight: 0,
        created_at: now,
        updated_at: now,
      };

      // 3) POST a la API
      const res = await axios.post(API_URL_RACK, payload, {
        headers: {
          'Authorization': authToken,
          "Content-Type": "application/json",
        },
      });

      // 4) Agregamos el nuevo rack al estado
      const newRack = res.data.data;
      if (!newRack.used_volume) newRack.used_volume = 0;
      if (!newRack.used_weight) newRack.used_weight = 0;

      setRacks((prev) => [...prev, newRack]);
      message.success("Rack created successfully.");
      resetForm();
    } catch (err) {
      console.error("Error creating rack:", err);
      message.error("Error creating the rack.");
    } finally {
      setSubmitting(false);
    }
  };

  // Solo pallets status = "Created" y verified = true
  const availablePallets = pallets
    .filter((p) => p.status === "Created" && p.verified === true)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

// ====== POST: almacenar pallet en un rack ======
  const handleStorePalletSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (!selectedRack) return;

      // 1) Validar posición y nivel localmente
      const isOccupied = storageRackPallet.some(
        (srp) =>
          srp.rack === selectedRack.id &&
          srp.level === values.level &&
          srp.position === values.position &&
          srp.status === "Occupied"
      );
      if (isOccupied) {
        message.error(
          `Position ${values.position} at level ${values.level} is already occupied.`
        );
        setSubmitting(false);
        return;
      }

      // 2) Verificar que el pallet esté disponible
      const pallet = availablePallets.find((p) => p.id === values.pallet);
      if (!pallet) {
        message.error("Selected pallet does not exist or is unavailable.");
        setSubmitting(false);
        return;
      }

      // 3) Validar capacidad
      const {
        used_volume = 0,
        used_weight = 0,
        capacity_volume = 0,
        capacity_weight = 0,
      } = selectedRack;
      const newUsedVolume = Number(used_volume) + Number(pallet.volume);
      const newUsedWeight = Number(used_weight) + Number(pallet.weight);
      console.log("Rack used volume:", used_volume, "Pallet volume:", pallet.volume, "New total:", newUsedVolume);
      if (newUsedVolume > capacity_volume || newUsedWeight > capacity_weight) {
        message.error("Pallet exceeds the rack capacity (weight or volume).");
        setSubmitting(false);
        return;
      }

      // 4) POST a la API
      await axios.post(
        API_URL_STORAGE_RACK_PALLET,
        {
          ...values,
          rack: selectedRack.id, 
          status: "Occupied",
          position: values.position.trim(),
        },
        {
          headers: {
            'Authorization': authToken,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchRacks();
      // 5) Actualizamos estado local (registro de "storage")
      const now = new Date().toISOString();
      const newStorageRecord = {
        rack: selectedRack.id,
        position: values.position,
        level: values.level,
        stored_at: now,
        status: "Occupied",
        pallet: pallet.id,
      };
      setStorageRackPallet((prev) => [...prev, newStorageRecord]);

      // 6) Cambiamos el pallet a "Stored"
      setPallets((prev) =>
        prev.map((p) =>
          p.id === pallet.id
            ? {
                ...p,
                status: "Stored",
                warehouse: selectedRack.warehouse,
                updated_at: now,
              }
            : p
        )
      );

      // 7) Actualizamos rack (nuevo used_volume y used_weight)
      setRacks((prev) =>
        prev.map((r) =>
          r.id === selectedRack.id
            ? { ...r, used_volume: newUsedVolume, used_weight: newUsedWeight }
            : r
        )
      );

      message.success(`Pallet ${pallet.id} stored successfully.`);
      resetForm();
      setSubmitting(false);
      setIsStoreModalOpen(false);
      setSelectedRack(null);
    } catch (error) {
      message.error("Error storing the pallet.");
      console.error(error);
      setSubmitting(false);
      console.log("Error capturado:", error);
    }
    
  };

  // ====== RENDER ======
  return (
    <Paper style={{ padding: 16, maxWidth: "100%", overflowX: "hidden" }}>
      <h2>Racks Management</h2>

      {/* FORM: Crear un Rack */}
      <Card title="Register New Rack" style={{ marginTop: 20 }}>
        <Formik
          initialValues={{
            warehouse: "",
            section: "",
            levels: "",
            height: "",
            width: "",
            long: "",
            capacity_weight: "",
          }}
          validationSchema={RackSchema}
          onSubmit={handleCreateRack}
        >
          {({
            values,
            setFieldValue,
            errors,
            touched,
            isSubmitting,
            handleSubmit,
          }) => {
            const recalcVolume = (fieldName, val) => {
              setFieldValue(fieldName, val);
              const h =
                parseFloat(fieldName === "height" ? val : values.height) || 0;
              const w =
                parseFloat(fieldName === "width" ? val : values.width) || 0;
              const lg =
                parseFloat(fieldName === "long" ? val : values.long) || 0;
              const vol = h * w * lg;
              // Guardar internamente el volume si quieres:
              setFieldValue("capacity_volume", vol);
            };

            return (
              <Form onSubmit={handleSubmit}>
                <Row gutter={[16, 16]}>
                  {/* Warehouse (combo) */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="warehouse">
                      {({ field }) => (
                        <Select
                        {...field}
                        placeholder="Select Warehouse"
                        style={{ width: "100%" }}
                        onChange={(val) => setFieldValue("warehouse", val)}
                        value={values.warehouse || ""}
                        options={[
                          {
                            label: "Select warehouse", // texto informativo
                            value: "",
                            disabled: true,
                          },
                          ...warehouses.map((wh) => ({
                            label: wh.name || `WH #${wh.id}`,
                            value: wh.id,
                          })),
                        ]}
                        status={
                          errors.warehouse && touched.warehouse ? "error" : ""
                        }
                      />
                      )}
                    </Field>
                    {errors.warehouse && touched.warehouse && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.warehouse}
                      </div>
                    )}
                  </Col>

                  {/* Section (A-Z) */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="section">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Section"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("section", value)}
                          options={[
                            {
                              label: "Select section",
                              value: "",
                              disabled: true,
                            },
                            ...Array.from({ length: 26 }, (_, i) => {
                              const letter = String.fromCharCode(65 + i);
                              return { label: letter, value: letter };
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

                  {/* Levels (1-6) */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="levels">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Levels"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("levels", value)}
                          options={[
                            {
                              label: "Select levels",
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

                  {/* Height (m) */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="height">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Height (m)"
                          onChange={(e) =>
                            recalcVolume("height", e.target.value)
                          }
                          status={
                            errors.height && touched.height ? "error" : ""
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

                  {/* Width (m) */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="width">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Width (m)"
                          onChange={(e) => recalcVolume("width", e.target.value)}
                          status={errors.width && touched.width ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.width && touched.width && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.width}
                      </div>
                    )}
                  </Col>

                  {/* Long (m) */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="long">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Long (m)"
                          onChange={(e) => recalcVolume("long", e.target.value)}
                          status={errors.long && touched.long ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.long && touched.long && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.long}
                      </div>
                    )}
                  </Col>

                  {/* Weight capacity */}
                  <Col xs={24} sm={12} md={6}>
                    <Field name="capacity_weight">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="Weight Capacity (kg)"
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

                  {/* Botón Submit */}
                  <Col xs={24}>
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
                      {isSubmitting ? "Saving..." : "Save Rack"}
                    </Button>
                  </Col>
                </Row>
              </Form>
            );
          }}
        </Formik>
      </Card>

      {/* LISTADO DE RACKS EXISTENTES */}
      <Card title="Existing Racks" style={{ marginTop: 20 }}>
        {/* Búsqueda por ID */}
        <Input
          style={{ width: "100%", maxWidth: 300, marginBottom: 10 }}
          prefix={<SearchOutlined />}
          placeholder="Search by ID (e.g. 1, 2...)"
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
      </Card>

      {/* MODAL: Store Pallet en Rack */}
      <Modal
        title={`Store Pallet in Rack #${selectedRack?.id || ""}`}
        open={isStoreModalOpen}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnClose
      >
        {selectedRack && (
          <Formik
            initialValues={{
              position: "",
              level: "",
              pallet: "",
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
                  {/* Rack ID (solo lectura) */}
                  <Col span={24}>
                    <label>Rack ID:</label>
                    <Input disabled value={selectedRack.id} />
                  </Col>

                 

                  {/* Level */}
                  <Col span={12}>
                    <Field name="level">
                      {({ field }) => (
                        <Select
                        {...field}
                        placeholder="Select Level"
                        style={{ width: "100%" }}
                        onChange={(val) => setFieldValue("level", val)}
                        options={[
                          { label: "Select level", value: "", disabled: true },
                          ...Array.from({ length: selectedRack.levels }, (_, i) => {
                            const lvl = i + 1;
                            return { label: `Level ${lvl}`, value: lvl };
                          }),
                        ]}
                        value={values.level || ""}
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

                  <Col span={12}>
                    <Field name="position">
                      {({ field }) => {
                        const occupiedPositions = storageRackPallet
                          .filter(
                            (srp) =>
                              srp.rack === selectedRack.id &&
                              srp.level === values.level &&
                              srp.status === "Occupied"
                          )
                          .map((srp) => srp.position);

                        const isLevelSelected = values.level !== "";

                        const positionOptions = [
                          { label: "Select position", value: "", disabled: true },
                          ...["A ", "B ", "C ", "D ", "E ", "F "].map((pos) => {
                            const occupied = occupiedPositions.includes(pos);
                            return {
                              value: pos,
                              disabled: occupied,
                              label: (
                                <span style={{ color: occupied ? "red" : "green" }}>
                                  {pos} {occupied ? "(Occupied)" : "(Available)"}
                                </span>
                              ),
                            };
                          }),
                        ];

                        return (
                          <Select
                            {...field}
                            placeholder="Select Position"
                            style={{ width: "100%" }}
                            onChange={(val) => setFieldValue("position", val)}
                            options={positionOptions}
                            optionLabelProp="label"
                            value={values.position || ""}
                            disabled={!isLevelSelected}
                            status={errors.position && touched.position ? "error" : ""}
                          />
                        );
                      }}
                    </Field>
                    {errors.position && touched.position && (
                      <div style={{ color: "red", fontSize: 12 }}>{errors.position}</div>
                    )}
                  </Col>

                  {/* Pallet combo */}
                  <Col span={24}>
                    <label>Pallet:</label>
                    <Field name="pallet">
                      {({ field }) => (
                        <Select
                        {...field}
                        placeholder="Select Pallet"
                        style={{ width: "100%" }}
                        popupMatchSelectWidth={false}
                        dropdownStyle={{ whiteSpace: "pre-wrap" }}
                        onChange={(val) => setFieldValue("pallet", val)}
                        optionLabelProp="label"
                      >
                        {availablePallets.map((p) => (
                          <Option key={p.id} value={p.id} label={`Pallet #${p.id}`}>
                            <div style={{ display: "flex", flexDirection: "column", padding: "4px 8px" }}>
                              <strong>Pallet #{p.id}</strong>
                              <span>Warehouse Origin: {p.warehouse?.name}</span>
                              <span>Company Pallet: {p.company?.name}</span>
                              <span>Weight: {p.weight} kg</span>
                              <span>Volume: {Number(p.volume)?.toFixed(2)} m³</span>
                            </div>
                          </Option>
                        ))}
                      </Select>
                      )}
                    </Field>
                    {errors.pallet && touched.pallet && (
                      <div style={{ color: "red", fontSize: 12 }}>
                        {errors.pallet}
                      </div>
                    )}
                  </Col>

                  {/* Botón submit */}
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
                      {isSubmitting ? "Storing..." : "Store Pallet"}
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
