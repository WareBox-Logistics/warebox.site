// src/views/pages/docs/Docs.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from 'i18n'; // Asegúrate de que api esté configurado como se mencionó antes

const Docs = () => {
  const [docs, setDocs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/docs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setDocs(response.data);
      } catch (error) {
        console.error('Error fetching docs:', error);
        navigate('/pages/login/login3');
      }
    };

    fetchDocs();
  }, [navigate]);

  if (!docs) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>API Documentation</h1>
      <pre>{JSON.stringify(docs, null, 2)}</pre>
    </div>
  );
};

export default Docs;
