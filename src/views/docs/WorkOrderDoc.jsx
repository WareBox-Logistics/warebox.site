import React from 'react';
import {
  Typography,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Grid,
  Alert,
  FormControlLabel,
  Switch,
  TextField
} from '@mui/material';
import { ArrowRightAlt } from '@mui/icons-material';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';

const WorkOrderDoc = () => {
  const { t } = useTranslation();

  const routes = [
    {
      name: 'wo_close_status',
      description: t("documentationView.tabs.workorder.routes.route1")
    },
    {
      name: 'wo_last_free_day',
      description: t("documentationView.tabs.workorder.routes.route2")
    },
    {
      name: 'wo_empty_notify',
      description: t("documentationView.tabs.workorder.routes.route3")
    },
    {
      name: 'wo_delivery_date',
      description: t("documentationView.tabs.workorder.routes.route4")
    },
    {
      name: 'route1_wo',
      description: t("documentationView.tabs.workorder.routes.route5")
    },
    {
      name: 'route_wo2',
      description: t("documentationView.tabs.workorder.routes.route6")
    }
  ];


  return (
    <Container fixed style={{ padding: 0, paddingTop: "24px" }}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            {t("documentationView.tabs.workorder.title")}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {t("documentationView.tabs.workorder.subtitle")}
          </Typography>
          <List>
            {routes.map((route, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={route.name}
                  secondary={route.description}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{ overflowX: 'auto' }} wrapLines={true}>
          {`
{
  "work_order_id": "<--- id de la orden de trabajo",
  "status_code_name": "<--- código del estado de la orden de trabajo",
  "type_code_name": "<--- código del tipo de trabajo",
  "available_date": "<--- fecha de disponibilidad",
  "do_received": "<--- DO recibido",
  "free_empty_return_until": "<--- fecha límite de retorno vacío gratuito",
  "chassis_lfd": "<--- número LFD del chasis",
  "delivery_date": "<--- fecha de entrega",
  "empty_notify": "<--- notificación de vacío",
  "request_delivery_date": "<--- fecha solicitada de entrega",
  "amount": "<--- monto",
  "move_type_code_name": "<--- código del tipo de movimiento",
  "mxc_dispatch": "<--- despacho MXC",
  "vessel_name": "<--- nombre del buque",
  "from_id": "<--- id de origen",
  "from_zone_id": "<--- id de la zona de origen",
  "customer_id": "<--- id del cliente",
  "chassis_line_code_name": "<--- código de la línea del chasis",
  "chassis_plate_state_iso_name": "<--- nombre ISO del estado de la placa del chasis",
  "chassis_number": "<--- número del chasis",
  "container": "<--- contenedor",
  "created_at": "<--- fecha de creación",
  "created_by": "<--- creado por",
  "customer_name": "<--- nombre del cliente",
  "customer_reference": "<--- referencia del cliente",
  "equipment_id": "<--- id del equipo",
  "equipment_code": "<--- código del equipo",
  "equipment_type_name": "<--- nombre del tipo de equipo",
  "equipment_type_size": "<--- tamaño del tipo de equipo",
  "load_type_code_name": "<--- código del tipo de carga",
  "delivery_required_date": "<--- fecha requerida de entrega",
  "eta": "<--- ETA (Estimated Time of Arrival)",
  "last_free_day": "<--- último día libre",
  "mbl": "<--- MBL (Master Bill of Lading)",
  "remark": "<--- observación",
  "scale": "<--- escala",
  "seal": "<--- sello",
  "shipper_name": "<--- nombre del embarcador",
  "te": "<--- TE (Transportation Equipment)",
  "te_expiration": "<--- fecha de expiración del TE",
  "bill_id": "<--- id de la factura",
  "weight": "<--- peso",
  "inbond_name": "<--- nombre de inbond",
  "from_zone_name": "<--- nombre de la zona de origen",
  "to_zone_name": "<--- nombre de la zona destino",
  "rfd": "<--- RFD (Required Free Date)"
}

          `}
        </SyntaxHighlighter>

      </Grid>
    </Container>
  );
}

export default WorkOrderDoc;
