import React, { useState, useEffect } from "react";
import axios from "axios";

const apiKey = "94e43ae086b84aa1bb552438253001"; // Clave de prueba
const location = "48.8567,2.3508"; // Coordenadas (París)

export default function WeatherShow() {
    const [data, setData] = useState(null); // Estado para almacenar los datos del clima

    useEffect(() => {
        axios
            .get(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=1`)
            .then((res) => {
                setData(res.data); // Guardamos la respuesta en el estado
            })
            .catch((e) => {
                console.error("Error al obtener los datos del clima:", e);
            });
    }, []); // Se ejecuta solo una vez al montar el componente

    return (
        <div>
            <h2>Datos del Clima</h2>
            {data ? (
                <div>
                    <p>Ubicación: {data.location.name}, {data.location.country}</p>
                    <p>Temperatura: {data.current.temp_c}°C</p>
                    <p>Condición: {data.current.condition.text}</p>
                </div>
            ) : (
                <p>Cargando datos...</p>
            )}
        </div>
    );
}






