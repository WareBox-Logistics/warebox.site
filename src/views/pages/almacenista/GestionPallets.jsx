import React, { useEffect, useState } from "react";
import { Skeleton } from "antd";
import {authToken, API_URL_PALLET, API_URL_RACK, API_URL_STORAGE_RACK_PALLET, API_URL_EMPLOYEE} from "../../../services/services";
import {
  Button,
  Card,
  Col,
  Row,
  Input,
  Modal,
  Select,
  Tag,
  message,
  Table,
  Spin,
} from "antd";
import {
  SearchOutlined,
  CodepenOutlined,
} from "@ant-design/icons";
import { IconArrowRight } from "@tabler/icons-react"; 
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Paper } from "@mui/material";
import axios from "axios";


// ========== VALIDATION ==========
const PositionSchema = Yup.object().shape({
  position: Yup.string().required("Position (A-F) is required"),
  level: Yup.number().required("Level is required").min(1, "Invalid level"),
});

// ========== FUNCIÓN PARA OBTENER COLOR POR PORCENTAJE ==========
const getColorByPercentage = (percentage) => {
  if (percentage < 50) {
    return "#f5222d"; // rojo
  } else if (percentage < 90) {
    return "#faad14"; // amarillo
  } else {
    return "#52c41a"; // verde
  }
};

const GestionPallets = () => {
  // ========== STATES ==========
  const [employee, setEmployee] = useState(null);
  const [assignedWarehouse, setAssignedWarehouse] = useState(null);
  const [pallets, setPallets] = useState([]);
  const [racks, setRacks] = useState([]);
  const [storageRackPallet, setStorageRackPallet] = useState([]);
  // Estado para el spinner de la tabla de racks
  const [loadingRacks, setLoadingRacks] = useState(false);

  // Búsqueda de pallets y racks
  const [searchText, setSearchText] = useState("");
  const [rackSearch, setRackSearch] = useState("");

  // Pallet y Rack elegidos para transferencia
  const [selectedPalletId, setSelectedPalletId] = useState(null);
  const [selectedRack, setSelectedRack] = useState(null);

  // Para mostrar/ocultar secciones
  const [showLocalRacksSection, setShowLocalRacksSection] = useState(false);
  const [showRackPositionModal, setShowRackPositionModal] = useState(false);

  // Posiciones ocupadas al elegir un rack+level
  const [occupiedPositions, setOccupiedPositions] = useState([]);

  // ========== useEffect: Obtener datos del empleado ==========
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
          // Se espera que la respuesta tenga { employee: { ..., warehouse: { id, name, ... } } }
          setEmployee(res.data.employee);
          setAssignedWarehouse(res.data.employee.warehouse);
        })
        .catch((err) => {
          console.error("Error fetching employee data:", err);
          message.error("Error loading employee information");
        });
    }
  }, []);

  // ========== useEffect: Fetch data cuando se tiene el warehouse asignado ==========
  useEffect(() => {
    if (assignedWarehouse) {
      fetchAllData();
    }
  }, [assignedWarehouse]);

  const fetchAllData = async () => {
    try {
      // 1) Pallets: Filtrar solo los que pertenezcan al warehouse asignado
      const palletRes = await axios.get(API_URL_PALLET, {
        headers: {  Authorization: authToken },
      });
      const fetchedPallets = (palletRes.data.pallets || []).filter(
        (p) =>
          p.warehouse.id === assignedWarehouse.id &&
          p.status === "Stored" &&
          p.verified
      );
      setPallets(fetchedPallets);

      // 2) Racks: Se podría filtrar en el back; si no, filtramos en el front
      setLoadingRacks(true);
      const rackRes = await axios.get(API_URL_RACK, {
        headers: { Authorization: authToken },
      });
      setRacks(rackRes.data.data || []);
      setLoadingRacks(false);

      // 3) StorageRackPallet
      const storageRes = await axios.get(API_URL_STORAGE_RACK_PALLET, {
        headers: { Authorization: authToken },
      });
      setStorageRackPallet(storageRes.data.data || []);
    } catch (error) {
      console.error(error);
      message.error("Error loading data.");
      setLoadingRacks(false);
    }
  };

  // ========== FILTRO: Pallets por ID ==========
  const filteredPallets = pallets.filter((p) =>
    p.id.toString().includes(searchText.trim())
  );

  // ========== Agrupar pallets por compañía ==========
  const palletsByCompany = {};
  filteredPallets.forEach((p) => {
    const companyName = p.company?.name || "No Company";
    if (!palletsByCompany[companyName]) {
      palletsByCompany[companyName] = [];
    }
    palletsByCompany[companyName].push(p);
  });

  // ========== Seleccionar Pallet ==========
  const handleSelectPallet = (palletId) => {
    setSelectedPalletId((prev) => (prev === palletId ? null : palletId));
  };

  // ========== Botón Transfer Pallet ==========
  const handleTransfer = () => {
    if (!selectedPalletId) {
      message.warning("No pallet selected");
      return;
    }
    setShowLocalRacksSection(true);
    setSelectedRack(null);
  };

  // ========== Click en una fila de Racks ==========
  const handleRackSelection = (rack) => {
    setSelectedRack(rack);
    setShowRackPositionModal(true);
  };

  // ========== Submit del Form: definir position/level ==========
  const handleDefinePositionSubmit = async (values, { setSubmitting }) => {
    try {
      const pallet = pallets.find((p) => p.id === selectedPalletId);
      if (!pallet) return;

      const currentLocation = getCurrentLocation(selectedPalletId);
      const isSameRack = currentLocation && currentLocation.rack === selectedRack.id;

      if (isSameRack) {
        // ========== UPDATE en el mismo rack ==========
        const url = `${API_URL_STORAGE_RACK_PALLET}/${selectedPalletId}/${currentLocation.rack}`;
        const body = {
          position: values.position,
          level: Number(values.level),
          status: "Occupied",
        };
        await axios.put(url, body, {
          headers: { Authorization: authToken },
        });
        message.success(
          `Pallet ${pallet.id} updated in rack ${selectedRack.id}`
        );
      } else {
        // ========== POST + DELETE si es rack distinto ==========
        // 1) Validar capacidad
        const { weight, volume } = pallet;
        const availableWeight =
          selectedRack.capacity_weight - (selectedRack.used_weight || 0);
        const availableVolume =
          selectedRack.capacity_volume - (selectedRack.used_volume || 0);

        if (weight > availableWeight || volume > availableVolume) {
          message.error("The pallet exceeds capacity of this rack.");
          return;
        }
        // 2) POST a la nueva loc
        const newRecord = {
          rack: selectedRack.id,
          position: values.position,
          level: Number(values.level),
          status: "Occupied",
          pallet: selectedPalletId,
          stored_at: new Date().toISOString(),
        };
        await axios.post(API_URL_STORAGE_RACK_PALLET, newRecord, {
          headers: {  Authorization: authToken },
        });
        // 3) DELETE old loc
        if (currentLocation) {
          const deleteUrl = `${API_URL_STORAGE_RACK_PALLET}/${selectedPalletId}/${currentLocation.rack}`;
          await axios.delete(deleteUrl, {
            headers: {  Authorization: authToken },
          });
        }
      }

      await fetchAllData();

      // Reset
      setSelectedPalletId(null);
      setSelectedRack(null);
      setShowRackPositionModal(false);
      setShowLocalRacksSection(false);
    } catch (error) {
      console.error(error);
      message.error("Error transferring pallet.");
    } finally {
      setSubmitting(false);
    }
  };

  // ========== Ubicación actual ==========
  const getCurrentLocation = (palletId) => {
    const location = storageRackPallet.find(
      (srp) => srp.pallet === palletId && srp.status === "Occupied"
    );
    return location || null;
  };

  // ========== Calcular posiciones ocupadas ==========
  const getOccupiedPositions = (rackId, level) => {
    return storageRackPallet
      .filter(
        (srp) =>
          srp.rack === rackId &&
          srp.level === level &&
          srp.status === "Occupied"
      )
      .map((srp) => srp.position);
  };

  // ========== Columnas de Racks con ordenamiento ==========
  const rackColumns = [
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
      render: (section) => section || "N/A",
      sorter: (a, b) => {
        const secA = (a.section || "").trim();
        const secB = (b.section || "").trim();
        return secA.localeCompare(secB);
      },
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
      title: "Capacity (kg)",
      dataIndex: "capacity_weight",
      key: "capacity_weight",
    },
    {
      title: "Capacity (m³)",
      dataIndex: "capacity_volume",
      key: "capacity_volume",
      render: (val) => (val ? `${val} m³` : "0 m³"),
    },
    {
      title: "Used (kg)",
      dataIndex: "used_weight",
      key: "used_weight",
    },
    {
      title: "Used (m³)",
      dataIndex: "used_volume",
      key: "used_volume",
      render: (val) => (val ? `${val} m³` : "0 m³"),
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
        const usedW = record.used_weight || 0;
        const capacityW = record.capacity_weight || 0;
        const available = capacityW - usedW;
        const percentage = (available / (capacityW || 1)) * 100;
        const color = getColorByPercentage(percentage);
        return <span style={{ color }}>{available} kg</span>;
      },
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
        const usedV = record.used_volume || 0;
        const capacityV = record.capacity_volume || 0;
        const available = capacityV - usedV;
        const percentage = (available / (capacityV || 1)) * 100;
        const color = getColorByPercentage(percentage);
        return <span style={{ color }}>{available.toFixed(2)} m³</span>;
      },
    },
  ];

  return (
    <Paper style={{ padding: 16, maxWidth: "100%", overflowX: "hidden" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" ,marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Location and Pallet Transfer in Warehouse </h2>
        {assignedWarehouse ? (
          <h2 style={{ margin: 0 }}>{assignedWarehouse.name}</h2>
        ) : (
          <Skeleton.Input active style={{ width: 100 }} />
        )}
      </div>

      {/* Búsqueda de Pallets */}
      <Input
        style={{ width: "100%", maxWidth: 300, marginBottom: 20 }}
        prefix={<SearchOutlined />}
        placeholder="Search Pallet by ID"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* Lista de pallets agrupados por Compañía */}
      {Object.keys(palletsByCompany).map((companyName) => {
        const companyPallets = palletsByCompany[companyName] || [];
        return (
          <Card
            key={companyName}
            title={`${companyName} has ${companyPallets.length} pallets`}
            style={{ marginBottom: 12 }}
          >
            <Row gutter={[16, 16]}>
              {companyPallets.map((pallet) => {
                const isSelected = selectedPalletId === pallet.id;
                const currentLocation = getCurrentLocation(pallet.id);
                return (
                  <Col key={pallet.id} xs={24} sm={12} md={8} lg={6}>
                    <Card
                      hoverable
                      onClick={() => handleSelectPallet(pallet.id)}
                      style={{
                        marginBottom: "16px",
                        border: isSelected
                          ? "2px solid #1890ff"
                          : "1px solid #f0f0f0",
                        backgroundColor: isSelected ? "#e6f7ff" : "#fff",
                        borderRadius: "8px",
                        cursor: "pointer",
                        height: "100%",
                      }}
                    >
                      <Row gutter={[8, 8]}>
                        <Col>
                          <CodepenOutlined
                            style={{
                              fontSize: "36px",
                              marginRight: "15px",
                              color: "#FF731D",
                            }}
                          />
                        </Col>
                        <Col flex="auto">
                          <strong style={{ fontSize: "18px" }}>
                            Pallet {pallet.id}
                          </strong>
                          <p style={{ margin: 0 }}>
                            <strong>Weight:</strong> {pallet.weight} kg
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Volume:</strong> {pallet.volume} m³
                          </p>
                          {currentLocation ? (
                            <p style={{ margin: 0 }}>
                              <strong>Actual ubi:</strong>{" "}
                              Rack {currentLocation.rack}, Section{" "}
                              {currentLocation.section}, Level{" "}
                              {currentLocation.level}, Position{" "}
                              {currentLocation.position}
                            </p>
                          ) : (
                            <p style={{ margin: 0 }}>
                              <strong>Actual ubi:</strong> No assigned location
                            </p>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Card>
        );
      })}

      {/* Botón Transfer Selected Pallet */}
      <Button
        type="primary"
        onClick={handleTransfer}
        disabled={!selectedPalletId}
      >
        Transfer Selected Pallet
      </Button>

      {/* Sección de Racks en Tabla */}
      {showLocalRacksSection && (
        <Card
          title="Local Transfer - Select a Rack"
          style={{ marginTop: 20, borderColor: "#faad14" }}
        >
          <Input
            style={{ width: "100%", maxWidth: 300, marginBottom: 10 }}
            prefix={<SearchOutlined />}
            placeholder="Search Racks by ID"
            value={rackSearch}
            onChange={(e) => setRackSearch(e.target.value)}
          />
          <Spin spinning={loadingRacks}>
            <Table
              rowKey="id"
              columns={rackColumns}
              dataSource={
                racks
                  .filter((r) => r.warehouse === assignedWarehouse.id)
                  .filter((r) =>
                    r.id.toString().includes(rackSearch.trim())
                  )
              }
              pagination={{ pageSize: 8 }}
              onRow={(record) => ({
                onClick: () => handleRackSelection(record),
              })}
              style={{ cursor: "pointer" }}
            />
          </Spin>
        </Card>
      )}

      {/* MODAL: Define new position in rack transfer */}
      <Modal
        title="Define new position in rack transfer"
        open={showRackPositionModal}
        onCancel={() => setShowRackPositionModal(false)}
        footer={null}
        destroyOnClose
      >
        {selectedPalletId && selectedRack && (
          <Row
            gutter={[16, 16]}
            style={{ marginBottom: 16 }}
            align="middle"
            justify="space-around"
          >
            <Col xs={24} sm={10}>
              {(() => {
                const palletData = pallets.find(
                  (p) => p.id === selectedPalletId
                );
                if (!palletData) return null;
                const palletLoc = getCurrentLocation(palletData.id);
                return (
                  <Card
                    title={`Pallet ${palletData.id}`}
                    size="small"
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 6,
                    }}
                  >
                    <p>
                      <strong>Company:</strong>{" "}
                      {palletData.company?.name || "N/A"}
                    </p>
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <p>
                          <strong>Weight:</strong> {palletData.weight} kg
                        </p>
                      </Col>
                      <Col span={12}>
                        <p>
                          <strong>Volume:</strong> {palletData.volume} m³
                        </p>
                      </Col>
                    </Row>
                    {palletLoc ? (
                      <p style={{ marginBottom: 0 }}>
                        <strong>Ubi:</strong>{" "}
                        Rack {palletLoc.rack}, Section {palletLoc.section}, Level{" "}
                        {palletLoc.level}, Position {palletLoc.position}
                      </p>
                    ) : (
                      <p style={{ marginBottom: 0 }}>
                        <strong>Ubi:</strong> No assigned location
                      </p>
                    )}
                  </Card>
                );
              })()}
            </Col>
            <Col xs={24} sm={4} style={{ textAlign: "center" }}>
              <IconArrowRight size={40} stroke={1.2} />
            </Col>
            <Col xs={24} sm={10}>
              <Card
                title={`Rack ${selectedRack.id}`}
                size="small"
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: 6,
                }}
              >
                <p>
                  <strong>Section:</strong>{" "}
                  {selectedRack.section || "N/A"}
                </p>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <p>
                      <strong>Cap. Weight:</strong>{" "}
                      {selectedRack.capacity_weight} kg
                    </p>
                  </Col>
                  <Col span={12}>
                    <p>
                      <strong>Cap. Volume:</strong>{" "}
                      {selectedRack.capacity_volume} m³
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        )}
        <Formik
          initialValues={{ position: "", level: "" }}
          validationSchema={PositionSchema}
          onSubmit={handleDefinePositionSubmit}
        >
          {({
            values,
            errors,
            touched,
            isSubmitting,
            handleSubmit,
            setFieldValue,
          }) => (
            <Form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label>Level:</label>
                <Field name="level">
                  {({ field }) => {
                    const levelOptions = Array.from(
                      { length: selectedRack?.levels || 1 },
                      (_, i) => i + 1
                    );
                    return (
                      <Select
                        {...field}
                        placeholder="Select Level"
                        style={{ width: "100%" }}
                        onChange={(val) => {
                          setFieldValue("level", val);
                          const occupied = getOccupiedPositions(
                            selectedRack.id,
                            val
                          );
                          setOccupiedPositions(occupied);
                          setFieldValue("position", "");
                        }}
                        status={
                          errors.level && touched.level ? "error" : ""
                        }
                        options={levelOptions.map((lvl) => ({
                          label: `Level ${lvl}`,
                          value: lvl,
                        }))}
                      />
                    );
                  }}
                </Field>
                {errors.level && touched.level && (
                  <div style={{ color: "red", fontSize: 12 }}>
                    {errors.level}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Position (A-F):</label>
                <Field name="position">
                  {({ field }) => {
                    const positions = ["A ", "B ", "C ", "D ", "E ", "F "];
                    return (
                      <Select
                        {...field}
                        placeholder="Position (A-F)"
                        style={{ width: "100%" }}
                        onChange={(value) => setFieldValue("position", value)}
                        disabled={!values.level}
                        options={positions.map((pos) => ({
                          label: pos.trim(),
                          value: pos,
                          disabled: occupiedPositions.includes(pos),
                          style: {
                            color: occupiedPositions.includes(pos)
                              ? "red"
                              : "green",
                          },
                        }))}
                        status={
                          errors.position && touched.position ? "error" : ""
                        }
                      />
                    );
                  }}
                </Field>
                {errors.position && touched.position && (
                  <div style={{ color: "red", fontSize: 12 }}>
                    {errors.position}
                  </div>
                )}
              </div>
              <Button
                type="primary"
                htmlType="submit"
                disabled={isSubmitting}
                style={{ marginTop: 8 }}
              >
                {isSubmitting ? "Transferring..." : "Transfer"}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </Paper>
  );
};

export default GestionPallets;
