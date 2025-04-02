import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import { Paper, Typography } from "@mui/material";

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../ui-component/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import { DASHBOARD_INFO, GET_EMPLOYES } from "graphql/queries";

import { gridSpacing } from 'store/constant';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';
import { useQuery } from '@apollo/client';

const CustomerConfig = () => {
  const [isLoading, setLoading] = useState(true);
  const [info, setInfo] = useState({
    descargados_hoy: 0,
    pendientes_hoy: 0,
    vehiculos_en_espera_para_cargar_hoy: 0,
    trabajos_fallidos_hoy: 0,
    depositos_hoy: 0,
    incidencias_hoy: 0,
    reportes_hoy: 0,
    tipos_de_reportes: []
  });
  
  const {
    data,
    loading: loadingStats,
    error,
    refetch,
  } = useQuery(DASHBOARD_INFO, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data) {
        setInfo({
          descargados_hoy: data.descargados_hoy.aggregate.count || 0, //
          pendientes_hoy: data.pendientes_hoy.aggregate.count || 0, //
          vehiculos_en_espera_para_cargar_hoy: data.vehiculos_en_espera_para_cargar_hoy.aggregate.count || 0,
          trabajos_fallidos_hoy: data.trabajos_fallidos_hoy.aggregate.count || 0, //
          depositos_hoy: data.depositos_hoy.aggregate.count || 0,
          incidencias_hoy: data.incidencias_hoy.aggregate.count || 0, //
          reportes_hoy: data.reportes_hoy.aggregate.count || 0, //
          tipos_de_reportes : data.tipos_de_reportes || []
        });
      }
    },
  });
  
  useEffect(() => {
    refetch();
    setLoading(false);
  }, []);

  console.log(info);
  

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} count={info.descargados_hoy} />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard isLoading={isLoading} issues={info.incidencias_hoy} report={info.reportes_hoy} />
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard isLoading={isLoading} count={info.trabajos_fallidos_hoy} />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard
                  {...{
                    isLoading: isLoading,
                    total: info.pendientes_hoy,
                    label: 'Pendings delivered today',
                    icon: <StorefrontTwoToneIcon fontSize="inherit" />
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} >
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          <Grid item xs={12} md={4}>
            <PopularCard isLoading={isLoading}  reports={info.tipos_de_reportes}/>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CustomerConfig;
