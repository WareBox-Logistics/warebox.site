import {useEffect, useState, useMemo} from 'react';
import { Button, Table, Tag, message, Modal, Input } from 'antd';
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";

import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";

import axios from 'axios';


import { authToken, API_URL_REPORT, API_URL_DRIVER, API_URL_PROBLEM } from '../../../services/services';
import ReportFormModal from "/src/components/dispatch/Report/ReportFormModal"

//get, post y put, funconando al 100% segun

//falta delete, por ahi lo hizo el deepseek aguas en el chat no el doc
//agregar la busqueda
//revisar si es que hay problemas con issue

//agregar tal vez mas validaciones, maybe para las cords

//agregar mas drivers

//deepseek god

// Ejemplo de uso en un componente padre
const Report = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [reports, setReports] = useState([]);

  const [problems, setProblems] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const memoizedProblems = useMemo(() => problems || [], [problems]);
  const memoizedDrivers = useMemo( () => drivers || [], [drivers]);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    
    return reports.filter(report => 
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm]);


  const fetchReports = async () => {
    try{
      const response = await axios.get(API_URL_REPORT, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('reports: ',response.data.reports);
      setReports(response.data.reports || [])
    }catch(error){
      console.log(error);
      setReports([]);
    }
  }

  const fetchProblems = async () => {
    try{
      const response = await axios.get(API_URL_PROBLEM, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('problesm: ',response.data.problems);
      setProblems(response.data.problems || [])
    }catch(error){
      console.log(error);
      setProblems([]);
    }
  }

  const fetchDrivers = async () => {
    try{
      const response = await axios.get(API_URL_DRIVER, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('drivers: ',response.data.drivers);
      setDrivers(response.data.drivers || [])
    }catch(error){
      console.log(error);
      setDrivers([]);
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL_REPORT}/${reportToDelete.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      
      setReports(reports.filter(report => report.id !== reportToDelete.id));
      message.success('Reporte eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      message.error('Error al eliminar el reporte');
    } finally {
      setIsDeleteModalVisible(false);
      setReportToDelete(null);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchProblems();
    fetchDrivers();
  },[]);

  const handleSubmit = async (values) => {
    if (currentReport) {
      // Lógica de actualización
   
      console.log('los values de crear: ', values);
      try{
        const response = await axios.put(`${API_URL_REPORT}/${currentReport.id}`, 
          values,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('currentReport: ', currentReport);
        console.log('reports: ', reports);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.reports: ',response.data.reports);

        // setReports(reports.map(repo => repo.id === currentReport.id ? {...values, id:currentReport.id} : repo));

        const fullProblem = problems.find(p => p.id === values.problem);
        const fullDriver = drivers.find(d => d.id === values.driver);
        
        // 3. Actualizar el estado con los objetos completos
        setReports(reports.map(report => 
          report.id === currentReport.id 
            ? { 
                ...response.data.reports,  // Lo que devuelve el backend
                problem: fullProblem, // Objeto completo del problema
                driver: fullDriver,   // Objeto completo del driver
                id: currentReport.id
              } 
            : report
        ));
        
      }catch(error){
        console.log(error);
      }

    } else {
      // Lógica de creación
      console.log('los values de crear: ', values);
      try{
        const response = await axios.post(API_URL_REPORT, 
          values,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('creeeeeeeeeaaaaaaaaaaaaaaaaarrrrrr');
        console.log('reports: ', reports);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.reports: ',response.data.reports);
        // setReports(prevReports => [...prevReports, {...response.data.reports}]);

        const fullProblem = problems.find(p => p.id === values.problem);
        const fullDriver = drivers.find(d => d.id === values.driver);
        
        // 3. Actualizar el estado con los objetos completos
        setReports(prevReports => [...prevReports, {
          ...response.data.reports,
          problem: fullProblem,
          driver: fullDriver
        }]);

      }catch(error){
        console.log(error);
      }

    }
    setIsModalVisible(false);
    setCurrentReport(null);
  };

  const columns = [
    {
      title: 'Longitude',
      dataIndex: 'longitude',
      key: 'longitude',
    },
    {
      title: 'Latitude',
      dataIndex: 'latitude',
      key: 'latitude',
    },
    {
      title: 'Problem',
      dataIndex: ['problem','name'],
      key: 'problem',
    },
    {
      title: 'Issue',
      dataIndex: 'issue',
      key: 'issue',
      render: (text, record) => (
        record.issue ?
        <Tag color='green'>Yes</Tag>
        :
        <Tag color='red'>No</Tag>

      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Driver',
      dataIndex: ['driver','first_name'],
      key: 'driver',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <span>
          <Button 
          icon={<EditOutlined />}
          onClick={() => {
            setCurrentReport({
              ...record,
              problem: record.problem?.id,
              driver: record.driver?.id,
            });
            setIsModalVisible(true);
            }}>
            Editar
          </Button>

          <Button 
            onClick={() => {
              setReportToDelete(record);
              setIsDeleteModalVisible(true);
            }} 
            danger 
            icon={<DeleteOutlined />}
          >
            Eliminar
      </Button>
        </span>
       
      ),
    },
  ];

  return (
    <Paper sx={{ padding: '16px' }}>
      <MainCard title="Reportes">
      <Button 
        type="primary" 
        onClick={() => {
          setCurrentReport(null);
          setIsModalVisible(true);
        }}
      >
        Nuevo Usuario
      </Button>

      <div style={{ marginBottom: 16 }}>
      <Input
        placeholder="Buscar por descripción..."
        allowClear
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 300 }}
        prefix={<SearchOutlined />}
      />
    </div>

      <Table 
        dataSource={filteredReports} 
        columns={columns} 
        rowKey="id" //ver para ke es
        style={{ marginTop: 20 }}
      />

      {/* Listado de usuarios con botón de editar */}
      {/* ... */}

      <ReportFormModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentReport(null);
        }}
        onSubmit={handleSubmit}
        initialValues={currentReport}

        problems={memoizedProblems}
        drivers={memoizedDrivers}
      />

      <Modal
      title="Confirmar Eliminación"
      open={isDeleteModalVisible}
      onOk={handleDelete}
      onCancel={() => setIsDeleteModalVisible(false)}
      okText="Eliminar"
      cancelText="Cancelar"
      okButtonProps={{ danger: true }}
    >
      <p>¿Estás seguro que deseas eliminar el reporte?</p>
      {reportToDelete && (
        <p>
          <strong>ID:</strong> {reportToDelete.id}<br />
          <strong>Descripción:</strong> {reportToDelete.description}
        </p>
      )}
    </Modal>

    </MainCard>
              </Paper>
  );
};

export default Report