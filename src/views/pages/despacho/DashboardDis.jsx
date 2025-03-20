import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_COMPANY, API_URL_SERVICE } from '../../../services/services';
const { Text } = Typography;



  const DashboardDis = () => {

    return (
      <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
        <MainCard title="Dashboard">
          <Typography variant="body2">
            Lorem ipsum dolor sit amen, consenter nipissing eli, sed do elusion
            tempos incident ut laborers et doolie magna alissa. Ut enif ad minim
            venice, quin nostrum exercitation illampu laborings nisi ut liquid ex
            ea commons construal. Duos aube grue dolor in reprehended in voltage
            veil esse colum doolie eu fujian bulla parian. Exceptive sin ocean
            cuspidate non president, sunk in culpa qui officiate descent molls
            anim id est labours.
          </Typography>
        </MainCard>
      </Paper>
    );
  };
  
  export default DashboardDis;
  