import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import Stack from '@mui/material/Stack';
import { Typography } from "antd";

const { Title } = Typography;

const ChartsComponent = ({ topProblems, issueStats, supportStats, period }) => {
  // Datos para la gráfica de barras (top problemas)
  const getBarChartData = () => {
    return topProblems.map((problem, index) => ({
      id: index,
      value: problem.report_count || 0,
      label: problem.problem?.name || `Problema ${index + 1}`
    }));
  };

  // Datos para gráficas de pastel
  const getPieChartData = (stats) => {
    return [
      { id: 0, value: stats.WIP || 0, label: 'WIP' },
      { id: 1, value: stats.DONE || 0, label: 'DONE' },
      { id: 2, value: stats.WAIT || 0, label: 'WAIT' }
    ];
  };

  return (
    <Stack
      spacing={{ xs: 1, sm: 3 }}
      direction="row"
      useFlexGap
      sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
    >
      {/* Gráfica de Top 5 Problemas */}
      <div>
        <Title level={4} style={{ textAlign: 'center' }}>Top 5 problemas ({period})</Title>
        <BarChart
          xAxis={[{ 
            scaleType: 'band', 
            data: getBarChartData().map(item => item.label),
            label: 'Problemas'
          }]}
          yAxis={[{ label: 'Cantidad de reportes' }]}
          series={[{ 
            data: getBarChartData().map(item => item.value),
            color: ['#1976d2', '#ff9800', '#4caf50', '#f44336', '#9c27b0']
          }]}
          width={500}
          height={300}
        />
      </div>

      {/* Gráfica de Status de Issues */}
      <div>
        <Title level={4} style={{ textAlign: 'center' }}>Issue: status ({period})</Title>
        <PieChart
          series={[{
            data: getPieChartData(issueStats),
            innerRadius: 30,
            outerRadius: 100,
            paddingAngle: 5,
            cornerRadius: 5,
            colors: ['#FFCE56', '#36A2EB', '#FF6384']
          }]}
          width={400}
          height={300}
        />
      </div>

      {/* Gráfica de Status de Supports */}
      <div>
        <Title level={4} style={{ textAlign: 'center' }}>Support: status ({period})</Title>
        <PieChart
          series={[{
            data: getPieChartData(supportStats),
            innerRadius: 30,
            outerRadius: 100,
            paddingAngle: 5,
            cornerRadius: 5,
            colors: ['#FF9F40', '#4BC0C0', '#9966FF']
          }]}
          width={400}
          height={300}
        />
      </div>
    </Stack>
  );
};

export default ChartsComponent;