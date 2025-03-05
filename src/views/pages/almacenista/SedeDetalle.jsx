import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaWarehouse } from "react-icons/fa";
import "../almacenista/styles/SedeDetalle.css";
import { getSedes, saveSedes } from "../src/api/sedes.js";

const SedeDetalle = () => {
  const { id } = useParams();
  const [sedes, setSedes] = useState(getSedes());
  const sedeIndex = parseInt(id, 10);
  const [sede, setSede] = useState(sedes[sedeIndex]);

  useEffect(() => {
    setSedes(getSedes());
    setSede(getSedes()[sedeIndex]);
  }, [sedeIndex]);

  // Función para alternar estado del muelle (disponible u ocupado)
  const toggleMuelle = (index) => {
    const nuevosMuelles = sede.muelles.map((estado, i) =>
      i === index ? (estado === "disponible" ? "ocupado" : "disponible") : estado
    );

    const nuevasSedes = [...sedes];
    nuevasSedes[sedeIndex] = { ...sede, muelles: nuevosMuelles };

    setSede(nuevasSedes[sedeIndex]);
    setSedes(nuevasSedes);
    saveSedes(nuevasSedes);
  };

  if (!sede) {
    return <p className="error-message">⚠ No se encontró la sede.</p>;
  }

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
          <FaWarehouse
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