import {useEffect, useState, useMemo} from 'react';
import { Button, Table, Tag, message, Modal, Input } from 'antd';
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";

import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";

import axios from 'axios';


import { authToken, API_URL_REPORT, API_URL_OPERATOR, API_URL_SUPPORT, API_URL_ISSUE_WITHOUT_SUPPORT } from '../../../services/services';
import SupportFormModal from "/src/components/dispatch/Support/SupportFormModal"

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

  // const [problems, setProblems] = useState([]);
  const [operators, setOperator] = useState([]);
  const [issuesNo, setIssuesNo] = useState([]);

  // const memoizedProblems = useMemo(() => problems || [], [problems]);
  const memoizedDrivers = useMemo( () => operators || [], [operators]);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [supportDelete, setSupportDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = useMemo(() => {
    if (!searchTerm) return reports;
    
    return reports.filter(report => 
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm]);


  const fetchReports = async () => {
    try{
      const response = await axios.get(API_URL_SUPPORT, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('reports: ',response.data.supports);
      setReports(response.data.supports || [])
    }catch(error){
      console.log(error);
      setReports([]);
    }
  }

  const fetchIssueNoSupport = async () => {
    try{
      const response = await axios.get(API_URL_ISSUE_WITHOUT_SUPPORT, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('issuesNoSupport: ',response.data.issues);
      setIssuesNo(response.data.issues || [])
    }catch(error){
      console.log(error);
      setIssuesNo([]);
    }
  }


  const fetchOperator = async () => {
    try{
      const response = await axios.get(API_URL_OPERATOR, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('operators: ',response.data.operators);
      setOperator(response.data.operators || [])
    }catch(error){
      console.log(error);
      setOperator([]);
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL_SUPPORT}/${supportDelete.id}`, {
        headers: {
          // 'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('id del deleeeeeteeee: ', supportDelete.id);
      setReports(reports.filter(report => report.id !== supportDelete.id));
      message.success('Reporte eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      message.error('Error al eliminar el reporte');
    } finally {
      setIsDeleteModalVisible(false);
      setSupportDelete(null);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchIssueNoSupport();
    fetchOperator();
  },[]);

  const handleSubmit = async (values) => {
    if (currentReport) {
      // Lógica de actualización
   
      console.log('los values de crear: ', values);
      try{
        const response = await axios.put(`${API_URL_SUPPORT}/${currentReport.id}`, 
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
        console.log('reponse.data.supports: ',response.data.reports);

        // setReports(reports.map(repo => repo.id === currentReport.id ? {...values, id:currentReport.id} : repo));

        // const fullProblem = problems.find(p => p.id === values.problem);
        const fullDriver = operators.find(d => d.id === values.driver);
        console.log('opeeeeeeeeeeerrrrrrrrraaaaaaaaaaaattttors: ', values);
        
        // 3. Actualizar el estado con los objetos completos
        setReports(reports.map(report => 
          report.id === currentReport.id 
            ? { 
                ...response.data.supports,  // Lo que devuelve el backend
                // problem: fullProblem, // Objeto completo del problema
                operator: fullDriver,   // Objeto completo del driver
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
        const response = await axios.post(API_URL_SUPPORT, 
          values,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('adddddddddddddddddddddddddddddddddddddddddddddddddddd');
        console.log('reports: ', reports);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.supports: ',response.data.reports);
        // setReports(prevReports => [...prevReports, {...response.data.reports}]);

        // const fullProblem = problems.find(p => p.id === values.problem);
        const fullDriver = operators.find(d => d.id === values.driver);
        
        // 3. Actualizar el estado con los objetos completos
        setReports(prevReports => [...prevReports, {
          ...response.data.supports,
          // problem: fullProblem,
          operator: fullDriver
        }]);
        console.log('reportssss',reports);

      }catch(error){
        console.log(error);
      }

    }
    setIsModalVisible(false);
    setCurrentReport(null);
  };

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Issue',
      dataIndex: ['issue','id'],
      key: 'issue'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        record.status === 'WIP' ? 
          <Tag color='yellow'>WIP</Tag> :
        record.status === 'DONE' ? 
          <Tag color='green'>DONE</Tag> :
          record.status === 'wait' ?
          <Tag color='red'>WAIT</Tag> : null

      )
    },
    {
      title: 'Operator',
      dataIndex: ['operator','first_name'],
      key: 'operator',
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
              issue: record.issue?.id,
              operator: record.operator?.id,
            });
            setIsModalVisible(true);
            }}>
            Editar
          </Button>

          <Button 
            onClick={() => {
              setSupportDelete(record);
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

      <SupportFormModal 
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentReport(null);
        }}
        onSubmit={handleSubmit}
        initialValues={currentReport}

        // problems={memoizedProblems}
        operators={memoizedDrivers}
        noIssues={issuesNo}
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
      {supportDelete && (
        <p>
          <strong>ID:</strong> {supportDelete.id}<br />
          <strong>Descripción:</strong> {supportDelete.description}
        </p>
      )}
    </Modal>

    </MainCard>
              </Paper>
  );
};

export default Report