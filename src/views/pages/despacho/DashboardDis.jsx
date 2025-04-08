import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";

import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import Grid from '@mui/material/Grid';

import DashboardComponent from "/src/components/dispatch/Dashboard/DashboardComponent";


import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_COMPANY, API_URL_SERVICE } from '../../../services/services';
const { Text } = Typography;

// cosas para dashboard
// reportes: top 5 problemas comunes, cuantos son issues pie,
// issue: status pie, cuanto support
// support: status pie


  const DashboardDis = () => {

    return (

          <DashboardComponent/>
                  
     
    );
  };
  
  export default DashboardDis;
  