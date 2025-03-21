import React, { useEffect, useState, useRef } from 'react';
import { Paper } from "@mui/material";
import { Card, Col, Row, Input, Button, Table, message, Select, Spin, Modal, Typography } from "antd";
import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";
import MainCard from "ui-component/cards/MainCard";
import axios from 'axios';
import { authToken, API_URL_REPORT, API_URL_SERVICE } from '../../../services/services';
const { Text } = Typography;




  const Report = () => {
   
    const [reports, setReports] = useState([]);
    const [services, setServices] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [formData, setFormData] = useState({
    name: "",
    rfc: "",
    email: "",
    phone: "",
    service: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [currentCompany, setCurrentCompany] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    // const formRef = useRef(null); //No se para que porongas es
    

    useEffect(()=>{
        fetchReport();
        console.log(API_URL_REPORT);
    }, []);

    const fetchReport = async () => {
        setIsLoading(true);
        try{
            const response = await axios.get(API_URL_REPORT, {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'applications/json'
                }
            });
            setReports(response.data.reports || []);
            console.log(response.data);
            console.log('vale dick');
        }catch(error){
            console.error('Error fetching companies:', error);
            setReports([]);
        }finally{
            setIsLoading(false);
        }
    } 

    return (
      <Paper elevation={3} sx={{ padding: '16px', margin: '16px' }}>
        
        <MainCard title="Sample Card">
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

  export default Report;
  