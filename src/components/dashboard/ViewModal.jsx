import React from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import ReactJson from 'react-json-view';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: '800px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ViewModal = ({ open, handleClose, jsonContent }) => (
  <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-view-title"
    aria-describedby="modal-view-description"
  >
    <Box sx={style}>
      <Typography id="modal-view-title" variant="h6" component="h2">
        Ver JSON
      </Typography>
      <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto' }}>
        <ReactJson
          src={jsonContent}
          collapsed={false}
          theme="brewer"
          iconStyle="circle"
          enableClipboard={true}
          displayObjectSize={true}
          displayDataTypes={false}
        />
      </Box>
      <Button onClick={handleClose} variant="contained" color="secondary">
        Cerrar
      </Button>
    </Box>
  </Modal>
);

export default ViewModal;
