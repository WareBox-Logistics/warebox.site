import React, { useEffect, useState, useRef } from 'react';
import ChartsComponent from "/src/components/dispatch/Dashboard/ChartsComponent";
import Stack from '@mui/material/Stack';
import MainCard from "ui-component/cards/MainCard";


  const DashboardDis = () => {

    return (
        <Stack spacing={10}>
            <MainCard title="Hoy">
                <ChartsComponent/>
            </MainCard>

            <MainCard title="Esta semana">
                <ChartsComponent/>
            </MainCard>

            <MainCard title="Este mes">
                <ChartsComponent/>
            </MainCard>

        </Stack>
    );
  };
  
  export default DashboardDis;
  