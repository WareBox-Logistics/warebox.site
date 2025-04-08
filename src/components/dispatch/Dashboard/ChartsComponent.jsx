import React, { useEffect, useState, useRef } from 'react';

import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import Stack from '@mui/material/Stack';
import {Typography } from "antd";
import { textAlign } from '@mui/system';
const {Title} = Typography;


// cosas para dashboard
// reportes: top 5 problemas comunes, cuantos son issues pie,
// issue: status pie, cuanto support
// support: status pie



  const DashboardDis = () => {

    return (

    <Stack
        spacing={{ xs: 1, sm: 3 }}
        direction="row"
        useFlexGap
        sx={{ flexWrap: 'wrap' }}
    >
        <div>
            <Title level={4} style={{textAlign:'center'}}>Top 5 problemas comunes</Title>
            <BarChart
                xAxis={[{ scaleType: 'band', data: ['group A'] }]}
                series={
                    [{ data: [4] },
                     { data: [1] },
                     { data: [2] }
                    ]}
                width={500}
                height={300}
            />
        </div>

        <div>
            <Title level={4} style={{textAlign:'center'}}>Issue: status</Title>
            <PieChart
                series={[
                {
                    data: [
                    { id: 0, value: 10, label: 'series A' },
                    { id: 1, value: 15, label: 'series B' },
                    { id: 2, value: 20, label: 'series C' },
                    ],
                },
                ]}
                width={400}
                height={200}
            />
        </div>

        <div>
            <Title level={4} style={{textAlign:'center'}}>Support: status</Title>
            <PieChart
                series={[
                {
                    data: [
                    { id: 0, value: 10, label: 'series A' },
                    { id: 1, value: 15, label: 'series B' },
                    { id: 2, value: 20, label: 'series C' },
                    ],
                },
                ]}
                width={400}
                height={200}
            />
        </div>
    </Stack>

    );
  };
  
  export default DashboardDis;
  