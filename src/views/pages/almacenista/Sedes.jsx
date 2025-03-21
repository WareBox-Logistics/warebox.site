import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { IconSearch, IconBuildingWarehouse, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { getSedes, saveSedes } from "/src/api/sedes.js";
import '../almacenista/styles/Sedes.css';
//import '../almacenista/styles/Listasedes.css';
import {Location} from 'graphql';
//import bodegaImagen from "../images/sedededistribucion2.png";

const Sedes = () => {
  const [sedes, setSedes] = useState(getSedes());
  const [nuevaSede, setNuevaSede] = useState({
    nombre: "",
    ubicacion: "",
    capacidadTotal: 0,
    capacidadDisponible: 0,
    puertosCarga: 0
  });
  const [sedeEditando, setSedeEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setSedes(getSedes());
  }, []);

  const handleInputChange = (e) => {
    setNuevaSede({
      ...nuevaSede,
      [e.target.name]: parseInt(e.target.value) || e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nuevaSede.nombre || !nuevaSede.ubicacion) {
      alert("Por favor, ingrese el nombre y la ubicación de la sede.");
      return;
    }
    const nuevasSedes = [...sedes, nuevaSede];
    setSedes(nuevasSedes);
    saveSedes(nuevasSedes);
    setNuevaSede({
      nombre: "",
      ubicacion: "",
      capacidadTotal: 0,
      capacidadDisponible: 0,
      puertosCarga: 0
    });
  };

  const handleEliminarSede = (index) => {
    const nuevasSedes = sedes.filter((_, i) => i !== index);
    setSedes(nuevasSedes);
    saveSedes(nuevasSedes);
  };

  const handleEditarSede = (index) => {
    setSedeEditando(index);
    setNuevaSede(sedes[index]);
  };

  const handleGuardarSede = (index, nuevosDatos) => {
    const nuevasSedes = sedes.map((sede, i) =>
      i === index ? nuevosDatos : sede
    );
    setSedes(nuevasSedes);
    saveSedes(nuevasSedes);
    setSedeEditando(null);
    setNuevaSede({
      nombre: "",
      ubicacion: "",
      capacidadTotal: 0,
      capacidadDisponible: 0,
      puertosCarga: 0
    });
  };

  const sedesFiltradas = sedes.filter((sede) =>
    sede.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    sede.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="sedes-container">
      <h1>Managing Locations</h1>

      {/* Imagen
      <div className="image-container">
        <img src={bodegaImagen} alt="Bodega" className="bodega-image" />
      </div> */}

      {/* Buscador */}
      <div className="search-container">
        <IconSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar sede..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Formulario */}
      <div className="form-container">
        <h2>Register New Location</h2>
        <form onSubmit={handleSubmit} className="sede-form">
          <div className="form-group">
            <label>Location Name</label>
            <input type="text" name="nombre" value={nuevaSede.nombre} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="ubicacion" value={nuevaSede.ubicacion} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Total Capacity</label>
            <input type="number" name="capacidadTotal" value={nuevaSede.capacidadTotal} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Available Capacity</label>
            <input type="number" name="capacidadDisponible" value={nuevaSede.capacidadDisponible} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Loading Ports</label>
            <input type="number" name="puertosCarga" value={nuevaSede.puertosCarga} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="submit-button"> <IconBuildingWarehouse/> Register</button>
        </form>
      </div>

      {/* Lista de Sedes */}
      <h2>List of Venues</h2>
<table className="sedes-list">
  <thead>
    <tr>
      <th>Name</th>
      <th>Location</th>
      <th>Total Capacity</th>
      <th>Available Capacity</th>
      <th>Loading Ports</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {sedesFiltradas.length > 0 ? (
      sedesFiltradas.map((sede, index) => (
        <tr key={index}>
          <td>{sede.nombre}</td>
          <td>{sede.ubicacion}</td>
          <td>{sede.capacidadTotal}</td>
          <td>{sede.capacidadDisponible}</td>
          <td>{sede.puertosCarga}</td>
          <td className="sede-actions">
            <Link to={`/sedes/${index}`} className="eye">
              <IconEye /> View
            </Link>
            <button onClick={() => handleEditarSede(index)} className="action-button">
              <IconEdit /> Edit
            </button>
            <button onClick={() => handleEliminarSede(index)} className="action-button delete">
              <IconTrash /> Delete
            </button>
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="7">No venue found.</td>
      </tr>
    )}
  </tbody>
</table>

      {/* Formulario de edición */}
      {sedeEditando !== null && (
        <div className="edit-form-container">
          <h2>Edit location</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleGuardarSede(sedeEditando, nuevaSede);
          }} className="sede-form">
            <div className="form-group">
              <label>Location Name</label>
              <input type="text" name="nombre" value={nuevaSede.nombre} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="ubicacion" value={nuevaSede.ubicacion} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Total Capacity</label>
              <input type="number" name="capacidadTotal" value={nuevaSede.capacidadTotal} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Available Capacity</label>
              <input type="number" name="capacidadDisponible" value={nuevaSede.capacidadDisponible} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="submit-button">Save Changes</button>
            <button type="button" className="cancel-button" onClick={() => setSedeEditando(null)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Sedes;
