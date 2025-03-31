import React, { useState, useEffect } from "react";
import { Skeleton } from "antd";
import {authToken, API_URL_PALLET, API_URL_RACK, API_URL_STORAGE_RACK_PALLET, API_URL_EMPLOYEE} from "../../../services/services";
import { IconCubePlus } from "@tabler/icons-react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
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
  Spin,
} from "antd";
import {
  LoadingOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Paper } from "@mui/material";

const getColorByPercentage = (percentage) => {
  if (percentage < 50) {
    return "#f5222d"; 
  } else if (percentage < 90) {
    return "#faad14"; 
  } else {
    return "#52c41a"; 
  }
};
const { Option } = Select;

// ====== Validation Schemas (Yup) ======
const RackSchema = Yup.object().shape({
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
  // ====== Estados ======
  const [employee, setEmployee] = useState(null);
  const [assignedWarehouse, setAssignedWarehouse] = useState(null);
  const [racks, setRacks] = useState([]);
  const [pallets, setPallets] = useState([]);
  const [storageRackPallet, setStorageRackPallet] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para modal y búsqueda
  const [searchText, setSearchText] = useState("");
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedRack, setSelectedRack] = useState(null);

  // ====== useEffect: Obtener datos del empleado ======
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      axios
        .get(`${API_URL_EMPLOYEE}/${userId}`, {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setEmployee(res.data.employee);
          setAssignedWarehouse(res.data.employee.warehouse);
        })
        .catch((err) => {
          console.error("Error fetching employee data:", err);
          message.error("Error loading employee information");
        });
    }
  }, []);

  // ====== useEffect: Obtener racks filtrados por el warehouse asignado ======
  useEffect(() => {
    if (assignedWarehouse) {
      fetchRacks();
    }
  }, [assignedWarehouse]);

  // --- GET racks (filtrados por warehouse asignado) ---
  const fetchRacks = async () => {
    if (!assignedWarehouse) return;
    setLoading(true);
    try {
      const res = await axios.get(API_URL_RACK, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
        params: {
          warehouse: assignedWarehouse.id,
        },
      });
      const sortedRacks = (res.data.data || []).sort((a, b) => b.id - a.id);
      setRacks(sortedRacks);
    } catch (error) {
      console.error("Error fetching racks:", error);
      message.error("Error loading racks");
    } finally {
      setLoading(false);
    }
  };

  // --- GET pallets ---
  const fetchPallets = async () => {
    try {
      const res = await axios.get(API_URL_PALLET, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
      setPallets(res.data.pallets || []);
    } catch (error) {
      console.error("Error fetching pallets:", error);
      message.error("Error loading pallets");
    }
  };

  // --- GET storage rack pallets ---
  const fetchStorageRackPallets = async () => {
    try {
      const res = await axios.get(API_URL_STORAGE_RACK_PALLET, {
        headers: {
          Authorization: authToken,
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
    fetchPallets();
    fetchStorageRackPallets();
  }, []);

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
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      sorter: (a, b) => a.id - b.id,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Section",
      dataIndex: "section",
      key: "section",
      sorter: (a, b) => (a.section || "").localeCompare(b.section || ""),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Levels",
      dataIndex: "levels",
      key: "levels",
      sorter: (a, b) => a.levels - b.levels,
      sortDirections: ["ascend", "descend"],
    },
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
      sorter: (a, b) => {
        const avA = (a.capacity_volume - a.used_volume) || 0;
        const avB = (b.capacity_volume - b.used_volume) || 0;
        return avA - avB;
      },
      sortDirections: ["ascend", "descend"],
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
      sorter: (a, b) => {
        const awA = (a.capacity_weight - a.used_weight) || 0;
        const awB = (b.capacity_weight - b.used_weight) || 0;
        return awA - awB;
      },
      sortDirections: ["ascend", "descend"],
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
    if (!assignedWarehouse) {
      message.error("No warehouse assigned.");
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    try {
      const calcVolume =
        (parseFloat(values.height) || 0) *
        (parseFloat(values.width) || 0) *
        (parseFloat(values.long) || 0);
      const now = new Date().toISOString();
      const payload = {
        warehouse: assignedWarehouse.id,
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
      const res = await axios.post(API_URL_RACK, payload, {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      });
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

  // Solo pallets con status "Created" y verified true
  const availablePallets = pallets
    .filter((p) => p.status === "Created" && p.verified === true)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  // ====== POST: almacenar pallet en un rack ======
  const handleStorePalletSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (!selectedRack) return;
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
      const pallet = availablePallets.find((p) => p.id === values.pallet);
      if (!pallet) {
        message.error("Selected pallet does not exist or is unavailable.");
        setSubmitting(false);
        return;
      }
      const {
        used_volume = 0,
        used_weight = 0,
        capacity_volume = 0,
        capacity_weight = 0,
      } = selectedRack;
      const newUsedVolume = Number(used_volume) + Number(pallet.volume);
      const newUsedWeight = Number(used_weight) + Number(pallet.weight);
      if (newUsedVolume > capacity_volume || newUsedWeight > capacity_weight) {
        message.error("Pallet exceeds the rack capacity (weight or volume).");
        setSubmitting(false);
        return;
      }
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
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );
      await fetchRacks();
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
    }
  };

  return (
    <Paper style={{ padding: 16, maxWidth: "100%", overflowX: "hidden" }}>
   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h2 style={{ margin: 0 }}>Rack Management in warehouse</h2>
  {assignedWarehouse ? (
    <h2 style={{ margin: 0 }}>{assignedWarehouse.name}</h2>
  ) : (
    <Skeleton.Input active style={{ width: 100 }} />
  )}
</div>
      {/* FORM: Crear un Rack */}
      <Card title="Register New Rack" style={{ marginTop: 20 }}>
        <Formik
          initialValues={{
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
              setFieldValue("capacity_volume", vol);
            };

            return (
              <Form onSubmit={handleSubmit}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Field name="section">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Section"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("section", value)}
                          options={[
                            { label: "Select section", value: "", disabled: true },
                            ...Array.from({ length: 26 }, (_, i) => {
                              const letter = String.fromCharCode(65 + i);
                              return { label: letter, value: letter };
                            }),
                          ]}
                          value={values.section || ""}
                          status={errors.section && touched.section ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.section && touched.section && (
                      <div style={{ color: "red", fontSize: 12 }}>{errors.section}</div>
                    )}
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Field name="levels">
                      {({ field }) => (
                        <Select
                          {...field}
                          placeholder="Levels"
                          style={{ width: "100%" }}
                          onChange={(value) => setFieldValue("levels", value)}
                          options={[
                            { label: "Select levels", value: "", disabled: true },
                            ...[1, 2, 3, 4, 5, 6].map((lvl) => ({
                              label: lvl,
                              value: lvl,
                            })),
                          ]}
                          value={values.levels || ""}
                          status={errors.levels && touched.levels ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.levels && touched.levels && (
                      <div style={{ color: "red", fontSize: 12 }}>{errors.levels}</div>
                    )}
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Field name="height">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="Height (m)"
                          onChange={(e) => recalcVolume("height", e.target.value)}
                          status={errors.height && touched.height ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.height && touched.height && (
                      <div style={{ color: "red", fontSize: 12 }}>{errors.height}</div>
                    )}
                  </Col>

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
                      <div style={{ color: "red", fontSize: 12 }}>{errors.width}</div>
                    )}
                  </Col>

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
                      <div style={{ color: "red", fontSize: 12 }}>{errors.long}</div>
                    )}
                  </Col>

                  <Col xs={24} sm={12} md={6}>
                    <Field name="capacity_weight">
                      {({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          placeholder="Weight Capacity (kg)"
                          status={errors.capacity_weight && touched.capacity_weight ? "error" : ""}
                        />
                      )}
                    </Field>
                    {errors.capacity_weight && touched.capacity_weight && (
                      <div style={{ color: "red", fontSize: 12 }}>{errors.capacity_weight}</div>
                    )}
                  </Col>

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
        <Input
          style={{ width: "100%", maxWidth: 300, marginBottom: 10 }}
          prefix={<SearchOutlined />}
          placeholder="Search by ID (e.g. 1, 2...)"
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div style={{ overflowX: "auto" }}>
          <Spin spinning={loading}>
            <Table
              dataSource={filteredRacks}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Spin>
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
                  <Col span={24}>
                    <label>Rack ID:</label>
                    <Input disabled value={selectedRack.id} />
                  </Col>
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
                      <div style={{ color: "red", fontSize: 12 }}>{errors.level}</div>
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
                      <div style={{ color: "red", fontSize: 12 }}>{errors.pallet}</div>
                    )}
                  </Col>
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
