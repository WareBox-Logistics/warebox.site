// api/muelles.js
export const getMuelles = () => {
    const muelles = JSON.parse(localStorage.getItem("muelles")) || [];
    return muelles.map(muelle => ({
      ...muelle,
      estado: muelle.estado || "disponible", // Inicializa el estado de los muelles si no existe
    }));
  };
  
  export const saveMuelles = (muelles) => {
    localStorage.setItem("muelles", JSON.stringify(muelles));
  };
  
  