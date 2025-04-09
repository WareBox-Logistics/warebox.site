import { useEffect, useState } from "react";

// material-ui
import Grid from "@mui/material/Grid";
import { Paper, Typography } from "@mui/material";

// project imports
import EarningCard from "./EarningCard";
import PopularCard from "./PopularCard";
import TotalOrderLineChartCard from "./TotalOrderLineChartCard";
import TotalIncomeDarkCard from "../../ui-component/cards/TotalIncomeDarkCard";
import TotalIncomeLightCard from "../../ui-component/cards/TotalIncomeLightCard";
import TotalGrowthBarChart from "./TotalGrowthBarChart";
import { DASHBOARD_INFO, GET_EMPLOYES } from "graphql/queries";

import { gridSpacing } from "store/constant";

// assets
import StorefrontTwoToneIcon from "@mui/icons-material/StorefrontTwoTone";
import { useQuery } from "@apollo/client";
import CardStadistics from "./CardStadistics";

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
    tipos_de_reportes: [],
    grafica: [],
  });

  const {
    data,
    loading: loadingStats,
    error,
    refetch,
  } = useQuery(DASHBOARD_INFO, {
    notifyOnNetworkStatusChange: true,
    onCompleted: async (data) => {
      await fetch(
        "https://n8n-11.warebox.pro/webhook/14b88642-28b3-4546-9f96-e7f8b0cc313e"
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((response) => {
          // console.log(response);
          setInfo(prev => ({
            ...prev,
            pendientes_hoy: response.pendientes_hoy
          }));
        })
        .catch((error) => {
          console.error("Error fetching data from webhook:", error);
        });
      await fetch(
        "https://n8n-11.warebox.pro/webhook/8e1fe042-e66a-4d4a-8685-1150459b9bb2"
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((response) => {
          // console.log(response);
          
          setInfo(prev => ({
            ...prev,
            descargados_hoy: response.descagados_hoy,
          }));
        })
        .catch((error) => {
          console.error("Error fetching data from webhook:", error);
        });

      if (data) {
        setInfo( prev => ({
          ...prev,
          vehiculos_en_espera_para_cargar_hoy:
            data.vehiculos_en_espera_para_cargar_hoy.aggregate.count || 0,
          trabajos_fallidos_hoy:
            data.trabajos_fallidos_hoy.aggregate.count || 0, //
          depositos_hoy: data.depositos_hoy.aggregate.count || 0,
          incidencias_hoy: data.incidencias_hoy.aggregate.count || 0, //
          reportes_hoy: data.reportes_hoy.aggregate.count || 0, //
          tipos_de_reportes: data.tipos_de_reportes || [],
          grafica: data.weekly_deliveries || [],
        }));
        setLoading(false);
        
      }
    },
  });

  useEffect(() => {
    refetch();
    // setLoading(false);
  },[]);

  // console.log(info);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CardStadistics />
        <Grid container spacing={3}>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <EarningCard isLoading={isLoading} count={info.descargados_hoy } />
          </Grid>
          <Grid item lg={4} md={6} sm={6} xs={12}>
            <TotalOrderLineChartCard
              isLoading={isLoading}
              issues={info.incidencias_hoy || 0}
              report={info.reportes_hoy || 0}
            />
          </Grid>
          <Grid item lg={4} md={12} sm={12} xs={12}>
            <Grid container spacing={3}>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeDarkCard
                  isLoading={isLoading}
                  count={info.trabajos_fallidos_hoy || 0}
                />
              </Grid>
              <Grid item sm={6} xs={12} md={6} lg={12}>
                <TotalIncomeLightCard
                  {...{
                    isLoading: isLoading,
                    total: info.pendientes_hoy,
                    label: "Pendings delivered today",
                    icon: <StorefrontTwoToneIcon fontSize="inherit" />,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TotalGrowthBarChart isLoading={isLoading}  data={info.grafica}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <PopularCard
              isLoading={isLoading}
              reports={info.tipos_de_reportes || []}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CustomerConfig;
