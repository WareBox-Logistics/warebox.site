import axios from 'axios';

export const getSedes = async () => {
    try {
        const response = await axios.get('/api/warehouse'); // Obtener sedes desde el backend
        console.log(response.data); // Verifica la respuesta aquí
        
        // Asegúrate de que response.data sea un array
        if (!Array.isArray(response.data)) {
            throw new Error("La respuesta no es un array");
        }

        return response.data.map(sede => ({
            ...sede,
            muelles: sede.muelles || Array(sede.puertosCarga).fill("disponible") // Inicializar muelles
        }));
    } catch (error) {
        console.error("Error al obtener sedes:", error);
        throw error; // Lanza el error para manejarlo en el componente
    }
};

export const saveSedes = async (sedes) => {
    try {
        const response = await axios.post('/api/warehouse', sedes); // Guardar sedes en el backend
        return response.data;
    } catch (error) {
        console.error("Error al guardar sedes:", error);
        throw error; // Lanza el error para manejarlo en el componente
    }
};