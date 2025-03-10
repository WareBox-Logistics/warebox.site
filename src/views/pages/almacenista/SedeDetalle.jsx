import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { IconWarehouse } from '@tabler/icons-react';
import "../almacenista/styles/SedeDetalle.css";
import { getSedes, saveSedes } from "../src/api/sedes.js";

const SedeDetalle = () => {
  const { id } = useParams();
  const storedSedes = JSON.parse(localStorage.getItem('sedes'));
  const sede = storedSedes ? storedSedes[id] : null;

  if (!sede) {
    return <div>No se encontró la sede.</div>;
  }

  // Función para alternar estado del muelle (disponible u ocupado)
  const toggleMuelle = (index) => {
    const nuevosMuelles = sede.muelles.map((estado, i) =>
      i === index ? (estado === "disponible" ? "ocupado" : "disponible") : estado
    );

    const nuevasSedes = { ...sede, muelles: nuevosMuelles };
    localStorage.setItem('sedes', JSON.stringify(nuevasSedes));
  };

  return (
    <div className="sede-detalle-container">
      <h1>{sede.nombre}</h1>
      <tr>
      <th><strong>Ubicación:</strong> </th>
      <th><strong>Capacidad Total:</strong> </th>
      <th><strong>Capacidad Disponible:</strong></th>
      </tr>
      <td>{sede.ubicacion}</td>
      <td>{sede.capacidadTotal}</td>
      <td> {sede.capacidadDisponible}</td>
      
      <div className="muelles-container">
      <h1>Muelles</h1>
        {sede.muelles.map((estado, index) => (
          <IconWarehouse
            key={index}
            className={`muelle ${estado}`}
            title={`Muelle ${estado}`}
            size={180} // Ajusta el tamaño aquí
            onClick={() => toggleMuelle(index)} // Alternar estado al hacer clic
          />
        ))}
      </div>

      <Link to="/sedes" className="back-button">← Volver a la lista</Link>
    </div>
  );
};

export default SedeDetalle;