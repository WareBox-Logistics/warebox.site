import {useEffect, useState, useMemo} from 'react';
import { Button, Table, Tag, message, Modal, Input } from 'antd';
import { Paper } from "@mui/material";
import MainCard from "ui-component/cards/MainCard";

import { UserAddOutlined, SearchOutlined, LoadingOutlined, EditOutlined, DeleteOutlined, CloseOutlined } from "@ant-design/icons";

import axios from 'axios';


import { authToken, API_URL_REPORT, API_URL_DRIVER, API_URL_ISSUE, API_URL_REPORT_WITHOUT_ISSUE, API_URL_OPERATOR } from '../../../services/services';
import IssueFormModal from "/src/components/dispatch/Issue/IssueFormModal"


const Issue = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState(null);
  const [issues, setIssues] = useState([]);

  const [reports, setReports] = useState([]);

  const [reportsWithout, setReportsWithout] = useState([]);
  const [operators, setOperators] = useState([]);

  const memoizedreportsWithout = useMemo(() => reportsWithout || [], [reportsWithout]);
  const memoizedoperators = useMemo( () => operators || [], [operators]);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredissues = useMemo(() => {
    if (!searchTerm) return issues;
    
    return issues.filter(report => 
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [issues, searchTerm]);


  const fetchIssues = async () => {
    try{
      const response = await axios.get(API_URL_ISSUE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('issues: ',response.data.issues);
      setIssues(response.data.issues || [])
    }catch(error){
      console.log(error);
      setIssues([]);
    }
  }

  const fetchReportsWithout = async () => {
    try{
      const response = await axios.get(API_URL_REPORT_WITHOUT_ISSUE, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('reportsWithout: ',response.data.reports);
      setReportsWithout(response.data.reports || [])
    }catch(error){
      console.log(error);
      setReportsWithout([]);
    }
  }

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

  const fetchOperators = async () => {
    try{
      const response = await axios.get(API_URL_OPERATOR, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'applications/json'
        }
      });
      console.log('operators: ',response.data.operators);
      setOperators(response.data.operators || [])
    }catch(error){
      console.log(error);
      setOperators([]);
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL_ISSUE}/${reportToDelete.id}`, {
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json'
        }
      });
      
      setIssues(issues.filter(report => report.id !== reportToDelete.id));
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
    fetchIssues();
    fetchReports();
    fetchReportsWithout();
    fetchOperators();
  },[]);

  const handleSubmit = async (values) => {
    if (currentReport) {
      // Lógica de actualización
   
      console.log('currentReport: ', currentReport);
      console.log('los values de crear: ', values);
      try{
        const response = await axios.put(`${API_URL_ISSUE}/${currentReport.id}`, 
          values,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('currentReport: ', currentReport);
        console.log('issues: ', issues);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.issues: ',response.data.issues);

        // setIssues(issues.map(repo => repo.id === currentReport.id ? {...values, id:currentReport.id} : repo));

        const fullReports = reports.find(p => p.id === values.report);
        const fullOperators = operators.find(d => d.id === values.operator);
        
        // 3. Actualizar el estado con los objetos completos
        setIssues(issues.map(report => 
          report.id === currentReport.id 
            ? { 
                ...response.data.issues,  // Lo que devuelve el backend
                report: fullReports.id, // Objeto completo del problema
                operator: fullOperators,   // Objeto completo del driver
                id: currentReport.id
              } 
            : report
        ));
        console.log('issues ==============================', issues);
        console.log('current_id: --------------------------', currentReport.id);
      }catch(error){
        console.log(error);
      }

    } else {
      // Lógica de creación
      console.log('los values de crear: ', values);
      try{
        const response = await axios.post(API_URL_ISSUE, 
          values,
          {
            headers: {
              'Authorization': authToken,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('issues: ', issues);
        console.log('reponse.data: ',response.data);
        console.log('reponse.data.issues: ',response.data.issues);
        // setIssues(previssues => [...previssues, {...response.data.issues}]);

        const fullReportsWithout = reportsWithout.find(p => p.id === values.report);
        const fullOperators = operators.find(d => d.id === values.operator);
        
        // 3. Actualizar el estado con los objetos completos
        setIssues(previssues => [...previssues, {
          ...response.data.issues,
          report: fullReportsWithout.id,
          operator: fullOperators
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
      title: 'Report',
      dataIndex: 'report',
      key: 'report',
    },
    {
      title: 'Operator',
      dataIndex: ['operator','first_name'],
      key: 'operator',
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Support',
      dataIndex: 'support',
      key: 'support',
      render: (text, record) => (
        record.support ?
        <Tag color='green'>Yes</Tag>
        :
        <Tag color='red'>No</Tag>

      )
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
              report: record.report?.id || record.report, // Permite ambos casos
              operator: record.operator?.id || record.operator,
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
        Add Issue
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
        dataSource={filteredissues} 
        columns={columns} 
        rowKey="id" //ver para ke es
        style={{ marginTop: 20 }}
      />

      {/* Listado de usuarios con botón de editar */}
      {/* ... */}

      <IssueFormModal
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setCurrentReport(null);
        }}
        onSubmit={handleSubmit}
        initialValues={currentReport}

        reportsWithout={memoizedreportsWithout}
        operators={memoizedoperators}
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

export default Issue;