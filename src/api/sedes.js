export const getSedes = () => {
    const sedes = JSON.parse(localStorage.getItem("sedes")) || [];
    return sedes.map(sede => ({
      ...sede,
      muelles: sede.muelles || Array(sede.puertosCarga).fill("disponible") // Inicializar muelles
    }));
  };
  
  export const saveSedes = (sedes) => {
    localStorage.setItem("sedes", JSON.stringify(sedes));
  };