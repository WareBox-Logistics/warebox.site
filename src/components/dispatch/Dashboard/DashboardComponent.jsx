import React, { useEffect, useState } from 'react';
import ChartsComponent from "/src/components/dispatch/Dashboard/ChartsComponent";
import Stack from '@mui/material/Stack';
import MainCard from "ui-component/cards/MainCard";
import { Typography, Spin, Alert} from "antd";
import axios from 'axios';
import { authToken, API_URL_REPORT_TOP5, API_URL_ISSUE_STATS, API_URL_SUPPORT_STATS } from '../../../services/services';

const { Text } = Typography;

// Configuración de APIs
const API_ENDPOINTS = {
  TOP_PROBLEMS: API_URL_REPORT_TOP5,
  ISSUE_STATS: API_URL_ISSUE_STATS,
  SUPPORT_STATS: API_URL_SUPPORT_STATS
};

const DashboardComponent = () => {
  const [data, setData] = useState({
    today: { topProblems: [], issueStats: {}, supportStats: {} },
    week: { topProblems: [], issueStats: {}, supportStats: {} },
    month: { topProblems: [], issueStats: {}, supportStats: {} }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener datos de las APIs
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Configuración de axios con el token de autenticación
      const config = {
        headers: { Authorization: `Bearer ${authToken}` }
      };

      // Obtener todos los datos en paralelo
      const [topProblemsRes, issueStatsRes, supportStatsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.TOP_PROBLEMS, config),
        axios.get(API_ENDPOINTS.ISSUE_STATS, config),
        axios.get(API_ENDPOINTS.SUPPORT_STATS, config)
      ]);

      setData({
        today: {
          topProblems: topProblemsRes.data.today || [],
          issueStats: issueStatsRes.data.today || {},
          supportStats: supportStatsRes.data.today || {}
        },
        week: {
          topProblems: topProblemsRes.data.this_week || [],
          issueStats: issueStatsRes.data.this_week || {},
          supportStats: supportStatsRes.data.this_week || {}
        },
        month: {
          topProblems: topProblemsRes.data.this_month || [],
          issueStats: issueStatsRes.data.this_month || {},
          supportStats: supportStatsRes.data.this_month || {}
        }
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <Stack spacing={4}>
      <MainCard title="Hoy">
        <ChartsComponent 
          topProblems={data.today.topProblems}
          issueStats={data.today.issueStats}
          supportStats={data.today.supportStats}
          period="hoy"
        />
      </MainCard>

      <MainCard title="Esta semana">
        <ChartsComponent 
          topProblems={data.week.topProblems}
          issueStats={data.week.issueStats}
          supportStats={data.week.supportStats}
          period="esta semana"
        />
      </MainCard>

      <MainCard title="Este mes">
        <ChartsComponent 
          topProblems={data.month.topProblems}
          issueStats={data.month.issueStats}
          supportStats={data.month.supportStats}
          period="este mes"
        />
      </MainCard>
    </Stack>
  );
};

export default DashboardComponent;