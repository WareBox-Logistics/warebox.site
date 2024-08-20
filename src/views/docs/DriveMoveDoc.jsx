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

const DriveMoveRoutesDoc = () => {
  const routes = [
    {
      name: 'dm_schedule_appointment',
      description: 'Ruta para programar una cita de movimiento de conductor.'
    },
    {
      name: 'dm_app_date',
      description: 'Ruta para obtener o actualizar la fecha de la cita del movimiento.'
    },
    {
      name: 'dm_delivery',
      description: 'Ruta para gestionar la entrega relacionada con el movimiento del conductor.'
    },
    {
      name: 'dm_departure_date',
      description: 'Ruta para establecer o consultar la fecha de salida del conductor.'
    },
  ];

  return (
    <Container fixed style={{padding: 0, paddingTop:"24px"}}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="body1" gutterBottom>
            Las rutas predefinidas para el módulo de movimiento de conductor son las siguientes:
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
        <SyntaxHighlighter language="json" style={atomOneDark} customStyle={{overflowX: 'auto'}} wrapLines={true}>
          {`
{
  "id": "<--- id del movimiento",
  "schedule_date": "<--- fecha programada para el movimiento",
  "departure_date": "<--- fecha de salida del movimiento",
  "arrival_date": "<--- fecha de llegada del movimiento",
  "remarks": "<--- observaciones del movimiento",
  "created_at": "<--- fecha de creación del movimiento",
  "order_type_codename": "<--- código del tipo de orden",
  "workflow_step_codename": "<--- código del paso en el flujo de trabajo",
  "empty_notify": "<--- notificación de vacío",
  "free_empty_return_until": "<--- fecha límite para retorno vacío gratuito",
  "folio_id": "<--- id del folio",
  "folio_prefix": "<--- prefijo del folio",
  "folio": "<--- folio del movimiento",
  "load_type_id": "<--- id del tipo de carga",
  "load_type_code_name": "<--- código del tipo de carga",
  "load_type_name": "<--- nombre del tipo de carga",
  "yard_arrival": "<--- llegada al patio",
  "yard_departure": "<--- salida del patio",
  "parent_routes_code_id": "<--- id del código de rutas padres",
  "parent_routes_code_name": "<--- nombre del código de rutas padres",
  "status_id": "<--- id del estado del movimiento",
  "status_name": "<--- nombre del estado del movimiento",
  "status_color": "<--- color del estado del movimiento",
  "driver_id": "<--- id del conductor",
  "driver_full_name": "<--- nombre completo del conductor",
  "to_zone_id": "<--- id de la zona destino",
  "to_zone_name": "<--- nombre de la zona destino",
  "from_zone_id": "<--- id de la zona de origen",
  "from_zone_name": "<--- nombre de la zona de origen",
  "work_order_id": "<--- id de la orden de trabajo",
  "container": "<--- contenedor asociado a la orden de trabajo",
  "chassis_number": "<--- número del chasis",
  "chassis_plate": "<--- placa del chasis",
  "chassis_plate_state_code_name": "<--- código del estado de la placa del chasis",
  "customer_reference": "<--- referencia del cliente",
  "type_code_name": "<--- código del tipo de trabajo",
  "weight": "<--- peso del trabajo",
  "unit_type_id": "<--- id del tipo de unidad",
  "work_order_free_empty_return_until": "<--- fecha límite de retorno vacío gratuito para la orden de trabajo",
  "chassis_lfd": "<--- número LFD del chasis",
  "work_order_delivery_date": "<--- fecha de entrega de la orden de trabajo",
  "work_order_empty_notify": "<--- notificación de vacío para la orden de trabajo",
  "equipment_id": "<--- id del equipo",
  "equipment_size": "<--- tamaño del equipo",
  "equipment_iso_code": "<--- código ISO del equipo",
  "equipment_name": "<--- nombre del equipo",
  "work_order_folio_id": "<--- id del folio de la orden de trabajo",
  "work_order_folio_prefix": "<--- prefijo del folio de la orden de trabajo",
  "work_order_folio": "<--- folio de la orden de trabajo",
  "work_order_load_type_code_name": "<--- código del tipo de carga de la orden de trabajo"
}
          `}
        </SyntaxHighlighter>

      </Grid>
    </Container>
  );
}

export default DriveMoveRoutesDoc;
