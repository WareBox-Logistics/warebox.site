import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Row,
  Input,
  Checkbox,
  Modal,
  Select,
  Tag,
  message,
} from "antd";
import {
  ExclamationCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Paper } from "@mui/material";

/* ================= DATOS SIMULADOS ================= */
// Ejemplo de almacén del usuario actual
const USER_WAREHOUSE_ID = "WH-01";

// Pallets
const MOCK_PALLETS = [
  {
    id: "PAL-001",
    company_id: "Lenovo",
    warehouse_id: "WH-01",
    weight: 120,
    verified: true,
    status: "Stored",
    updated_at: "2025-04-10T10:15:00",
  },
  {
    id: "PAL-002",
    company_id: "Lenovo",
    warehouse_id: "WH-01",
    weight: 300,
    verified: true,
    status: "Stored",
    updated_at: "2025-04-12T16:00:00",
  },
  {
    id: "PAL-003",
    company_id: "Samsung",
    warehouse_id: "WH-01",
    weight: 200,
    verified: false, // No se mostrará (verified=false)
    status: "Stored",
    updated_at: "2025-04-11T14:30:00",
  },
  {
    id: "PAL-004",
    company_id: "Samsung",
    warehouse_id: "WH-01",
    weight: 150,
    verified: true,
    status: "Created", // No se muestra porque no está "Stored"
    updated_at: "2025-04-09T09:00:00",
  },
  {
    id: "PAL-005",
    company_id: "Samsung",
    warehouse_id: "WH-02", // Otro almacén
    weight: 180,
    verified: true,
    status: "Stored",
    updated_at: "2025-04-01T12:00:00",
  },
];

// Racks (en metros, si manejas esa conversión) y con used_volume, used_weight
const MOCK_RACKS = [
  {
    id: "RACK-A1",
    section: "A",
    warehouse_id: "WH-01",
    levels: 3,
    capacity_weight: 1000,
    used_weight: 200,
    capacity_volume: 1.0,
    used_volume: 0.2,
  },
  {
    id: "RACK-A2",
    section: "A",
    warehouse_id: "WH-01",
    levels: 2,
    capacity_weight: 500,
    used_weight: 300,
    capacity_volume: 0.8,
    used_volume: 0.5,
  },
  {
    id: "RACK-B1",
    section: "B",
    warehouse_id: "WH-02",
    levels: 4,
    capacity_weight: 2000,
    used_weight: 600,
    capacity_volume: 2.5,
    used_volume: 1.5,
  },
];

// Simulación de almacenes
const MOCK_WAREHOUSES = [
  { id: "WH-01", name: "Main Warehouse TJ01" },
  { id: "WH-02", name: "Secondary Warehouse MX02" },
  { id: "WH-03", name: "Extra Warehouse US01" },
];

// Simulación de la tabla storage_rack_pallet
// (inicialmente vacía o con algunos registros de ejemplo)
const INITIAL_STORAGE = [];

/* ========== VALIDACIONES FORM TRANSFERENCIA LOCAL (POSICIÓN / NIVEL) ========== */
const PositionSchema = Yup.object().shape({
  position: Yup.string()
   .required("La posición (A-F) es obligatoria")
    .matches(/^[A-F]$/, "Debe ser una sola letra A-F"),
  level: Yup.number()
    .required("Nivel requerido")
    .min(1, "Nivel inválido"),
});

const GestionPallets = () => {
  /* ================= ESTADOS PRINCIPALES ================= */
  // Pallets del warehouse del usuario
  const [pallets, setPallets] = useState([]);
  // Lista de racks
  const [racks, setRacks] = useState([]);
  // Lista de almacenes
  const [warehouses, setWarehouses] = useState([]);
  // Simulación de storage_rack_pallet
  const [storageRackPallet, setStorageRackPallet] = useState(INITIAL_STORAGE);

  /* ================= FILTRO Y SELECCIÓN DE PALLETS ================= */
  const [searchText, setSearchText] = useState("");
  const [selectedPallets, setSelectedPallets] = useState([]);

  /* ================= MODALES PARA TRANSFERENCIAS ================= */
  // Modal principal: "¿Local o Almacén?"
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);

  // Transferencia a otro Almacén
  const [showWarehouseTransferSection, setShowWarehouseTransferSection] =
    useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isWarehouseConfirmModalOpen, setIsWarehouseConfirmModalOpen] =
    useState(false);

  // Transferencia Local
  const [showLocalRacksSection, setShowLocalRacksSection] = useState(false);
  const [showRackPositionModal, setShowRackPositionModal] = useState(false);
  const [selectedRack, setSelectedRack] = useState(null);

  /* ================= CARGA INICIAL DE DATOS (MOCK) ================= */
  useEffect(() => {
    // Filtrar pallets que pertenecen al warehouse del usuario,
    // con status="Stored" y verified=true
    const filtered = MOCK_PALLETS.filter(
      (p) =>
        p.warehouse_id === USER_WAREHOUSE_ID &&
        p.status === "Stored" &&
        p.verified === true
    );
    setPallets(filtered);

    // Filtrar racks del warehouse del usuario
    const filteredRacks = MOCK_RACKS.filter(
      (r) => r.warehouse_id === USER_WAREHOUSE_ID
    );
    setRacks(filteredRacks);

    // Cargar la lista de almacenes (todos, menos el actual si no se quiere)
    setWarehouses(MOCK_WAREHOUSES);
  }, []);

  /* ================= AGRUPACIÓN POR COMPANY ================= */
  const filteredPallets = pallets.filter((p) =>
    p.id.toLowerCase().includes(searchText.toLowerCase())
  );
  const palletsByCompany = {};
  filteredPallets.forEach((p) => {
    if (!palletsByCompany[p.company_id]) {
      palletsByCompany[p.company_id] = [];
    }
    palletsByCompany[p.company_id].push(p);
  });

  /* ================= MANEJO DE SELECCIÓN ================= */
  const handleSelectPallet = (palletId, checked) => {
    if (checked) {
      setSelectedPallets((prev) => [...prev, palletId]);
    } else {
      setSelectedPallets((prev) => prev.filter((id) => id !== palletId));
    }
  };

  const handleSelectAllInCompany = (company, checked) => {
    const palletsInCompany = palletsByCompany[company].map((p) => p.id);
    if (checked) {
      setSelectedPallets((prev) => Array.from(new Set([...prev, ...palletsInCompany])));
    } else {
      setSelectedPallets((prev) =>
        prev.filter((id) => !palletsInCompany.includes(id))
      );
    }
  };

  /* ================= ACCIÓN "TRANSFERIR" ================= */
  const handleTransfer = () => {
    if (selectedPallets.length === 0) {
      message.warning("No has seleccionado ningún pallet.");
      return;
    }
    setIsChoiceModalVisible(true);
  };

  /* ============= TRANSFERENCIA LOCAL ============= */
  const chooseLocalTransfer = () => {
    setIsChoiceModalVisible(false);
    setShowLocalRacksSection(true);
    setShowWarehouseTransferSection(false);
    setSelectedRack(null);
  };

  // Al confirmar el form de posición/nivel
  const handleDefinePositionSubmit = (values, { setSubmitting }) => {
    try {
      // 1) Calcular peso/volumen total de los pallets seleccionados
      let totalWeight = 0;
      let totalVolume = 0;
      selectedPallets.forEach((pId) => {
        const pal = pallets.find((x) => x.id === pId);
        if (pal) {
          totalWeight += pal.weight;
          // Si no existe pal.volume, lo defines o asumes un valor
          totalVolume += 0.05; // Ejemplo arbitrario
        }
      });

      // 2) Validar capacidad
      const availableWeight =
        selectedRack.capacity_weight - selectedRack.used_weight;
      const availableVolume =
        selectedRack.capacity_volume - (selectedRack.used_volume || 0);

      if (totalWeight > availableWeight || totalVolume > availableVolume) {
        message.error("El pallet(s) excede la capacidad de este rack.");
        setSubmitting(false);
        return;
      }

      // 3) Validar posición libre
      const isOccupied = storageRackPallet.some(
        (srp) =>
          srp.rack_id === selectedRack.id &&
          srp.level === Number(values.level) &&
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

      // 4) Simular la "baja" previa e "insertar" nueva
      const now = new Date().toISOString();

      selectedPallets.forEach((pId) => {
        // Marcar ubicación previa como "Released"
        setStorageRackPallet((prev) =>
          prev.map((srp) =>
            srp.pallet_id === pId ? { ...srp, status: "Released" } : srp
          )
        );

        // Insertar nuevo registro "Occupied"
        const newStorageRecord = {
          rack_id: selectedRack.id,
          position: values.position,
          level: Number(values.level),
          stored_at: now,
          status: "Occupied",
          pallet_id: pId,
        };
        setStorageRackPallet((prev) => [...prev, newStorageRecord]);
      });

      // Actualizar used_weight / used_volume
      setRacks((prevRacks) =>
        prevRacks.map((r) => {
          if (r.id === selectedRack.id) {
            return {
              ...r,
              used_weight: r.used_weight + totalWeight,
              used_volume: (r.used_volume || 0) + totalVolume,
            };
          }
          return r;
        })
      );

      // Éxito + reset
      message.success(
        `Se transfirieron ${selectedPallets.length} pallet(s) al rack ${selectedRack.id} (Pos. ${values.position}, Nivel ${values.level}).`
      );

      setSelectedPallets([]);
      setSelectedRack(null);
      setShowRackPositionModal(false);
      setShowLocalRacksSection(false);
    } catch (error) {
      message.error("Error al transferir el pallet.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ============= TRANSFERENCIA A OTRO ALMACÉN ============= */
  const chooseWarehouseTransfer = () => {
    setIsChoiceModalVisible(false);
    setShowLocalRacksSection(false);
    setShowWarehouseTransferSection(true);
    setSelectedWarehouse(null);
  };

  const handleWarehouseSelection = (warehouseId) => {
    const wh = warehouses.find((w) => w.id === warehouseId);
    if (!wh) {
      message.error("Ese almacén no está disponible.");
      return;
    }
    setSelectedWarehouse(wh);
    setIsWarehouseConfirmModalOpen(true);
  };

  const confirmWarehouseTransfer = () => {
    message.success(
      `Se transfirieron ${selectedPallets.length} pallets al almacén ${selectedWarehouse?.id}.`
    );
    setSelectedPallets([]);
    setShowWarehouseTransferSection(false);
    setIsWarehouseConfirmModalOpen(false);
  };

  /* ============= OBTENER LA UBICACIÓN ACTUAL DE UN PALLET ============= */
  const getCurrentLocation = (palletId) => {
    // Busca un registro en storageRackPallet con status=Occupied
    const location = storageRackPallet.find(
      (srp) => srp.pallet_id === palletId && srp.status === "Occupied"
    );
    if (!location) return null;
    return location; // { rack_id, position, level, ... }
  };

  /* ============= RENDER DEL COMPONENTE ============= */
  return (
    <Paper style={{ padding: 16, maxWidth: "100%", overflowX: "hidden" }}>
      <h2>Localización y Transferencia de Pallets</h2>

      {/* Barra de búsqueda */}
      <Input
        style={{
          width: "100%",
          maxWidth: 300,
          marginBottom: 20,
        }}
        prefix={<SearchOutlined />}
        placeholder="Buscar Pallet por ID"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      {/* Listado de pallets agrupados por compañía */}
      {Object.keys(palletsByCompany).map((company) => {
        const companyPallets = palletsByCompany[company] || [];
        const allSelected = companyPallets.every((p) =>
          selectedPallets.includes(p.id)
        );
        return (
          <Card
            key={company}
            title={`${company} tiene ${companyPallets.length} pallets`}
            style={{ marginBottom: 12 }}
          >
            <Row style={{ marginBottom: 8 }}>
              <Checkbox
                checked={allSelected}
                onChange={(e) =>
                  handleSelectAllInCompany(company, e.target.checked)
                }
              >
                Seleccionar todos en {company}
              </Checkbox>
            </Row>
            {companyPallets.map((pallet) => {
              const isChecked = selectedPallets.includes(pallet.id);
              // Obtener la ubicación actual si está "Occupied"
              const currentLocation = getCurrentLocation(pallet.id);

              return (
                <Row
                  key={pallet.id}
                  style={{
                    border: "1px solid #f0f0f0",
                    borderRadius: 4,
                    padding: 8,
                    marginBottom: 8,
                    alignItems: "center",
                  }}
                  gutter={16}
                >
                  <Col span={1}>
                    <Checkbox
                      checked={isChecked}
                      onChange={(e) =>
                        handleSelectPallet(pallet.id, e.target.checked)
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <strong>{pallet.id}</strong>
                  </Col>
                  <Col span={4}>
                    Peso: {pallet.weight} kg
                  </Col>
                  <Col span={5}>
                    Status: <Tag color="blue">{pallet.status}</Tag>
                  </Col>
                  <Col span={4}>
                    {`Últ. actualización: ${new Date(
                      pallet.updated_at
                    ).toLocaleString()}`}
                  </Col>
                  <Col span={4}>
                    Verificado:{" "}
                    {pallet.verified ? (
                      <Tag color="green">Sí</Tag>
                    ) : (
                      <Tag color="red">No</Tag>
                    )}
                  </Col>

                  {/* NUEVO: Bloque con la ubicación (rack_id, position, level) en 1 sola línea */}
                  <Col span={24} style={{ marginTop: 4 }}>
                    {currentLocation ? (
                      <span style={{ fontSize: "0.9rem", color: "#555" }}>
                        {`Rack: ${currentLocation.rack_id} | Posición: ${currentLocation.position} | Nivel: ${currentLocation.level}`}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.9rem", color: "#888" }}>
                        Sin ubicación asignada
                      </span>
                    )}
                  </Col>
                </Row>
              );
            })}
          </Card>
        );
      })}

      {/* Botón Transferir */}
      <Button
        type="primary"
        onClick={handleTransfer}
        disabled={selectedPallets.length === 0}
      >
        Transferir Pallets Seleccionados
      </Button>

      {/* Modal principal: ¿Local o Almacén? */}
      <Modal
        title="Tipo de Transferencia"
        visible={isChoiceModalVisible}
        onCancel={() => setIsChoiceModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <p>¿Deseas hacer una transferencia local o a otro almacén?</p>
        <Button type="primary" style={{ marginRight: 8 }} onClick={chooseLocalTransfer}>
          Local
        </Button>
        <Button onClick={chooseWarehouseTransfer}>Almacén</Button>
      </Modal>

      {/* NUEVA SECCIÓN DE TRANSFERENCIA LOCAL: LISTA DE RACKS */}
      {showLocalRacksSection && (
        <Card
          title="Transferencia Local - Selecciona un Rack"
          style={{ marginTop: 20, borderColor: "#faad14" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {racks.map((rack) => {
              const availableWeight = rack.capacity_weight - rack.used_weight;
              const availableVolume =
                rack.capacity_volume - (rack.used_volume || 0);

              return (
                <Card
                  key={rack.id}
                  style={{ width: 220, cursor: "pointer" }}
                  onClick={() => {
                    setSelectedRack(rack);
                    setShowRackPositionModal(true);
                  }}
                >
                  <p>
                    <strong>ID Rack:</strong> {rack.id}
                  </p>
                  <p>
                    <strong>Sección:</strong> {rack.section}
                  </p>
                  <p>
                    <strong>Niveles:</strong> {rack.levels}
                  </p>
                  <p>
                    <strong>Cap. Peso:</strong> {rack.capacity_weight} kg
                  </p>
                  <p>
                    <strong>Cap. Volumen:</strong> {rack.capacity_volume} m³
                  </p>
                  <p>
                    <strong>Disp. Peso:</strong> {availableWeight} kg
                  </p>
                  <p>
                    <strong>Disp. Volumen:</strong> {availableVolume} m³
                  </p>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* MODAL PARA DEFINIR POSICIÓN Y NIVEL EN EL RACK SELECCIONADO */}
      <Modal
        title="Definir Posición en el Rack"
        open={showRackPositionModal}
        onCancel={() => setShowRackPositionModal(false)}
        footer={null}
        destroyOnClose
      >
        {selectedRack && (
          <Formik 
            initialValues={{
              position: "",
              level: "",
            }}
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
                  <label>Posición (A-Z): </label>
                  <Field name="position">
                    {({ field }) => (
                     <Select
                     {...field}
                     placeholder="Posición (A-F)"
                     style={{ width: "100%" }}
                     onChange={(value) => setFieldValue("position", value)} // para Formik
                     options={[
                       { label: "A", value: "A" },
                       { label: "B", value: "B" },
                       { label: "C", value: "C" },
                       { label: "D", value: "D" },
                       { label: "E", value: "E" },
                       { label: "F", value: "F" },
                     ]}
                     // Opcional: manejo de error visual
                     status={errors.position && touched.position ? "error" : ""}
                   />
                    )}
                  </Field>
                  {errors.position && touched.position && (
                    <div style={{ color: "red", fontSize: 12 }}>
                      {errors.position}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label>Nivel: </label>
                  <Field name="level">
                    {({ field }) => {
                      const levelOptions = Array.from(
                        { length: selectedRack.levels },
                        (_, i) => i + 1
                      );
                      return (
                        <Select
                          {...field}
                          placeholder="Selecciona Nivel"
                          style={{ width: "100%" }}
                          onChange={(val) => setFieldValue("level", val)}
                          status={errors.level && touched.level ? "error" : ""}
                        >
                          {levelOptions.map((lvl) => (
                            <Select.Option key={lvl} value={lvl}>
                              Nivel {lvl}
                            </Select.Option>
                          ))}
                        </Select>
                      );
                    }}
                  </Field>
                  {errors.level && touched.level && (
                    <div style={{ color: "red", fontSize: 12 }}>{errors.level}</div>
                  )}
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={isSubmitting}
                  style={{ marginTop: 8 }}
                >
                  {isSubmitting ? "Trasladando..." : "Transferir"}
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Modal>

      {/* SECCIÓN DE TRANSFERENCIA A OTRO ALMACÉN */}
      {showWarehouseTransferSection && (
        <Card
          title="Transferir a Otro Almacén"
          style={{ marginTop: 20, borderColor: "#1890ff" }}
        >
          <Row gutter={[16, 16]}>
            {warehouses.map((wh) => {
              if (wh.id === USER_WAREHOUSE_ID) {
                // No mostrar el almacén actual como destino
                return null;
              }
              return (
                <Col key={wh.id} xs={24} sm={8}>
                  <Card style={{ marginBottom: 12 }}>
                    <p>
                      <strong>{wh.name}</strong>
                    </p>
                    <Button onClick={() => handleWarehouseSelection(wh.id)}>
                      Seleccionar
                    </Button>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      )}

      {/* MODAL PARA CONFIRMAR TRANSFERENCIA A OTRO ALMACÉN */}
      <Modal
        title="Confirmar Transferencia a Otro Almacén"
        visible={isWarehouseConfirmModalOpen}
        onCancel={() => setIsWarehouseConfirmModalOpen(false)}
        onOk={confirmWarehouseTransfer}
        okText="Transferir"
        cancelText="Cancelar"
      >
        <ExclamationCircleOutlined style={{ marginRight: 8 }} />
        {selectedWarehouse
          ? `¿Confirmar la transferencia de ${selectedPallets.length} pallets al almacén ${selectedWarehouse.id}?`
          : "No se seleccionó un almacén."}
      </Modal>
    </Paper>
  );
};

export default GestionPallets;
