// ErrorBoundary.jsx
import React, { useState, useEffect } from 'react';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error) => {
      setHasError(true);
      console.error('Error capturado por ErrorBoundary:', error);
      // Forzar la recarga de la página
      window.location.reload();
    };

    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  if (hasError) {
    // Puedes mostrar un mensaje de carga o un indicador mientras se recarga la página
    return <div>Recargando...</div>;
  }

  return children;
};

export default ErrorBoundary;
