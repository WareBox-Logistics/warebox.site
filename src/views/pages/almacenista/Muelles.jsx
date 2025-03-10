import React, { useState, useEffect } from "react";
import { IconSearch, IconEdit, IconTrash} from '@tabler/icons-react';
import { getMuelles, saveMuelles } from "/src/api/muelles.js";
import '../almacenista/styles/Muelles.css';

const Muelles = () => {
  const [muelles, setMuelles] = useState(getMuelles());
  const [nuevoMuelle, setNuevoMuelle] = useState({
    estado: "disponible", // o "ocupado"
    warehouseId: "",
    horario: "",
  });
  const [muelleEditando, setMuelleEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos"); // Filtro por estado
  const [warehouseFiltro, setWarehouseFiltro] = useState(""); // Filtro por warehouse

  useEffect(() => {
    setMuelles(getMuelles());
  }, []);

  const handleInputChange = (e) => {
    setNuevoMuelle({
      ...nuevoMuelle,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nuevoMuelle.estado || !nuevoMuelle.warehouseId) {
      alert("Por favor, ingrese todos los campos.");
      return;
    }
    const nuevosMuelles = [...muelles, nuevoMuelle];
    setMuelles(nuevosMuelles);
    saveMuelles(nuevosMuelles);
    setNuevoMuelle({
      estado: "disponible",
      warehouseId: "",
      horario: "",
    });
  };

  const handleEliminarMuelle = (index) => {
    const nuevosMuelles = muelles.filter((_, i) => i !== index);
    setMuelles(nuevosMuelles);
    saveMuelles(nuevosMuelles);
  };

  const handleEditarMuelle = (index) => {
    setMuelleEditando(index);
    setNuevoMuelle(muelles[index]);
  };

  const handleGuardarMuelle = (index, nuevosDatos) => {
    const nuevosMuelles = muelles.map((muelle, i) =>
      i === index ? nuevosDatos : muelle
    );
    setMuelles(nuevosMuelles);
    saveMuelles(nuevosMuelles);
    setMuelleEditando(null);
    setNuevoMuelle({
      estado: "disponible",
      warehouseId: "",
      horario: "",
    });
  };

  const muellesFiltrados = muelles.filter((muelle) => {
    const estadoCoincide = estadoFiltro === "todos" || muelle.estado === estadoFiltro;
    const warehouseCoincide = muelle.warehouseId.toLowerCase().includes(warehouseFiltro.toLowerCase());
    return estadoCoincide && warehouseCoincide && (
      muelle.estado.toLowerCase().includes(busqueda.toLowerCase()) ||
      muelle.warehouseId.toLowerCase().includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="muelles-container">
      <h1>Administrar Muelles</h1>

      {/* Buscador y Filtros */}
      <div className="search-container">
        <IconSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar muelle..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros alineados a la derecha */}
      <div className="filters-container" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="ocupado">Ocupado</option>
        </select>
        <input
          type="text"
          placeholder="Filtrar por Warehouse ID..."
          value={warehouseFiltro}
          onChange={(e) => setWarehouseFiltro(e.target.value)}
          style={{ marginLeft: '10px' }}
        />
      </div>

      {/* Lista de Muelles */}
      <h2>Lista de Muelles</h2>
      <table className="muelles-list">
        <thead>
          <tr>
            <th>Estado</th>
            <th>Warehouse ID</th>
            <th>Hora de Ocupación</th>
            <th>Hora de Desocupación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {muellesFiltrados.length > 0 ? (
            muellesFiltrados.map((muelle, index) => (
              <tr key={index}>
                <td>{muelle.estado}</td>
                <td>{muelle.warehouseId}</td>
                <td>{muelle.horaOcupacion || "N/A"}</td>
                <td>{muelle.horaDesocupacion || "N/A"}</td>
                <td className="muelle-actions">
                  <button onClick={() => handleEditarMuelle(index)} className="action-button">
                    <IconEdit /> Editar
                  </button>
                  <button onClick={() => handleEliminarMuelle(index)} className="action-button delete">
                    <IconTrash /> Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No se encontraron muelles.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Formulario de edición */}
      {muelleEditando !== null && (
        <div className="edit-form-container">
          <h2>Editar Muelle</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleGuardarMuelle(muelleEditando, nuevoMuelle);
          }} className="muelle-form">
            <div className="form-group">
              <label>Estado</label>
              <select name="estado" value={nuevoMuelle.estado} onChange={handleInputChange}>
                <option value="disponible">Disponible</option>
                <option value="ocupado">Ocupado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Warehouse ID</label>
              <input
                type="text"
                name="warehouseId"
                value={nuevoMuelle.warehouseId}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Horario</label>
              <input
                type="text"
                name="horario"
                value={nuevoMuelle.horario}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" className="submit-button">Guardar Cambios</button>
            <button type="button" className="cancel-button" onClick={() => setMuelleEditando(null)}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Muelles;
