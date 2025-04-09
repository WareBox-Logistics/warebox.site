import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {authToken, API_URL_DASHBOARD_STATS, API_URL_PALLET_FILTER, API_URL_DOCK_FILTER} from "../../../services/services";

import {
  Grid,
  Card as MuiCard,
  CardContent,
  Typography,
  Button,
  Modal,
  Paper,
  Box,
  CircularProgress
} from '@mui/material';
import { Row, Col, Card, Empty } from 'antd';
import { CodepenOutlined } from '@ant-design/icons';

// Function to get the label of a given status
const getStatusLabel = (status) => {
  switch (status) {
    case 'Available':   return 'Available';
    case 'Occupied':    return 'Occupied';
    case 'Maintenance': return 'Maintenance';
    case 'Created':     return 'Created';
    case 'Stored':      return 'Stored';
    case 'In Transit':  return 'In Transit';
    case 'Delivered':   return 'Delivered';
    default:            return status || 'N/A';
  }
};

// Style for the modals using MUI Box
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 1200,
  maxHeight: '80vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  overflowY: 'auto'
};

const DashboardAlmacen = () => {
  // State for loading and dashboard data
  const [loading, setLoading] = useState(true);
  const [palletsUnverified, setPalletsUnverified] = useState(0);
  const [palletsToStore, setPalletsToStore] = useState(0);
  const [palletsStored, setPalletsStored] = useState(0);
  const [reservedDocks, setReservedDocks] = useState(0);

  // State for pallet details modal
  const [openPalletModal, setOpenPalletModal] = useState(false);
  const [palletsDetail, setPalletsDetail] = useState([]);
  const [palletModalTitle, setPalletModalTitle] = useState('');

  // State for dock details modal
  const [openDockModal, setOpenDockModal] = useState(false);
  const [docksDetail, setDocksDetail] = useState([]);
  const [dockModalTitle, setDockModalTitle] = useState('');

  // State to control which pallet card is expanded (to show box details)
  const [expandedPalletId, setExpandedPalletId] = useState(null);

  // Fetch dashboard counts on component mount
  useEffect(() => {
    axios.get(API_URL_DASHBOARD_STATS, {
      headers: {  Authorization: authToken }
    })
    .then((res) => {
      const d = res.data;
      setPalletsUnverified(d.palletsSinVerificar);
      setPalletsToStore(d.palletsPorAlmacenar);
      setPalletsStored(d.palletsAlmacenados);
      setReservedDocks(d.docksReservados);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  // Show a spinner while loading
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Function to retrieve pallet details with given filters
  const handleViewPalletDetails = (status, verified, title) => {
    setPalletModalTitle(title);
    // Reset expanded pallet id every time modal is opened
    setExpandedPalletId(null);

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (typeof verified === 'boolean') params.append('verified', verified.toString());

    axios.get(API_URL_PALLET_FILTER, {
        headers: {  Authorization: authToken },
        // Use conditional spread to include only the defined filters.
        params: {
          ...(status && { status }),
          ...(typeof verified === 'boolean' && { verified: verified.toString() })
        }
      })
      .then(res => {
        setPalletsDetail(res.data.pallets || []);
        setOpenPalletModal(true);
      })
      .catch(console.error);
    };

  const handleClosePalletModal = () => {
    setOpenPalletModal(false);
    setPalletsDetail([]);
    setExpandedPalletId(null);
  };

// Function to retrieve dock details with filters
const handleViewDockDetails = (status, title) => {
    setDockModalTitle(title);
    axios.get(API_URL_DOCK_FILTER, {
      headers: { Authorization: authToken },
      params: {
        ...(status && { status })
      }
    })
    .then(res => {
      setDocksDetail(res.data.docks || []);
      setOpenDockModal(true);
    })
    .catch(console.error);
  };

  const handleCloseDockModal = () => {
    setOpenDockModal(false);
    setDocksDetail([]);
  };

  // Handle click on a pallet card in the modal:
  // - First click: expand to show its box details.
  // - Second click (if already expanded): close the modal.
  const handlePalletCardClick = (pallet) => {
    if (expandedPalletId !== pallet.id) {
      setExpandedPalletId(pallet.id);
    } else {
      setOpenPalletModal(false);
      setExpandedPalletId(null);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">Warehouse Dashboard</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Unverified Pallets Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiCard sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Unverified Pallets
              </Typography>
              <Typography variant="h3" color="error" sx={{ fontWeight: 'bold' }}>
                {palletsUnverified}
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleViewPalletDetails('Created', false, 'Unverified Pallets')}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                View details
              </Button>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Pallets Ready to Store Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiCard sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Pallets Ready to Store
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {palletsToStore}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewPalletDetails('Created', true, 'Pallets Ready to Store')}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                View details
              </Button>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Stored Pallets Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiCard sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Stored Pallets
              </Typography>
              <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold' }}>
                {palletsStored}
              </Typography>
              <Button
                variant="contained"
                onClick={() => handleViewPalletDetails('Stored', true, 'Stored Pallets')}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                View details
              </Button>
            </CardContent>
          </MuiCard>
        </Grid>

        {/* Reserved Docks Card */}
        <Grid item xs={12} sm={6} md={3}>
          <MuiCard sx={{ boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" color="textSecondary">
                Reserved Docks
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                {reservedDocks}
              </Typography>
              <Button
                variant="contained"
                color="info"
                onClick={() => handleViewDockDetails('Available', 'Available Docks')}
                sx={{ mt: 2, textTransform: 'none' }}
              >
                View details
              </Button>
            </CardContent>
          </MuiCard>
        </Grid>
      </Grid>

      {/* Modal for Pallet Details */}
      <Modal open={openPalletModal} onClose={handleClosePalletModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{palletModalTitle}</Typography>
            <Button onClick={handleClosePalletModal} variant="outlined" size="small">
              Close
            </Button>
          </Box>
          <Row gutter={[16, 16]}>
            {palletsDetail.length === 0 && (
              <Col span={24}>
                <Empty description="No pallets found" />
              </Col>
            )}
            {palletsDetail.map(pallet => (
              <Col key={pallet.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  style={{ padding: 16, height: '100%', cursor: 'pointer' }}
                  onClick={() => handlePalletCardClick(pallet)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                    <CodepenOutlined style={{ fontSize: 36, marginRight: 12, color: '#FF731D' }} />
                    <Typography variant="h6">Pallet {pallet.id}</Typography>
                  </div>
                  <Typography><strong>Status:</strong> {getStatusLabel(pallet.status)}</Typography>
                  <Typography><strong>Weight:</strong> {pallet.weight} kg</Typography>
                  <Typography><strong>Volume:</strong> {pallet.volume} m³</Typography>
                  <Typography><strong>Warehouse:</strong> {pallet.warehouse?.name}</Typography>
                  <Typography><strong>Company:</strong> {pallet.company?.name}</Typography>

                  {/* Show box details only when the pallet card is expanded */}
                  {expandedPalletId === pallet.id && pallet.box_inventories && (
                    <Box sx={{ mt: 2, borderTop: '1px solid #eee', pt: 1 }}>
                      {pallet.box_inventories.map(box => (
                        <Box key={box.id} sx={{ mb: 1, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                          <Typography variant="body2"><strong>Product:</strong> {box.product?.name}</Typography>
                          <Typography variant="body2"><strong>Qty:</strong> {box.quantity}</Typography>
                          <Typography variant="body2"><strong>Weight:</strong> {box.weight} kg</Typography>
                          <Typography variant="body2"><strong>Volume:</strong> {box.volume} m³</Typography>
                        </Box>
                      ))}
                      <Typography variant="caption" color="textSecondary">
                        (Click again to close)
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </Box>
      </Modal>

      {/* Modal for Dock Details */}
      <Modal open={openDockModal} onClose={handleCloseDockModal}>
        <Box sx={{ ...modalStyle, maxWidth: 800 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">{dockModalTitle}</Typography>
            <Button onClick={handleCloseDockModal} variant="outlined" size="small">
              Close
            </Button>
          </Box>
          <Row gutter={[16, 16]}>
            {docksDetail.length === 0 && (
              <Col span={24}>
                <Empty description="No docks available" />
              </Col>
            )}
            {docksDetail.map(dock => (
              <Col key={dock.id} xs={24} sm={12} md={8}>
                <Card hoverable style={{ padding: 16 }}>
                  <Typography variant="h6">Dock {dock.number}</Typography>
                  <Typography><strong>Status:</strong> {getStatusLabel(dock.status)}</Typography>
                  <Typography><strong>Type:</strong> {dock.type}</Typography>
                  <Typography><strong>Warehouse:</strong> {dock.warehouse?.name}</Typography>
                </Card>
              </Col>
            ))}
          </Row>
        </Box>
      </Modal>
    </Paper>
  );
};

export default DashboardAlmacen;
