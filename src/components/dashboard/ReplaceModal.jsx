import React from 'react';
import { Box, Button, Typography, TextField, Modal } from '@mui/material';

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

const ReplaceModal = ({ open, handleClose, field, newJson, setNewJson, handleReplaceJson }) => (
  <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-replace-title"
    aria-describedby="modal-replace-description"
  >
    <Box sx={style}>
      <Typography id="modal-replace-title" variant="h6" component="h2">
        Reemplazar JSON de {field}
      </Typography>
      <TextField
        label={`Nuevo JSON de ${field}`}
        multiline
        fullWidth
        rows={10}
        variant="outlined"
        value={newJson}
        onChange={(e) => setNewJson(e.target.value)}
        sx={{ marginBottom: '16px' }}
      />
      <Button onClick={handleReplaceJson} variant="contained" color="primary" sx={{ marginRight: '8px' }}>
        Reemplazar JSON
      </Button>
      <Button onClick={handleClose} variant="contained" color="secondary">
        Cancelar
      </Button>
    </Box>
  </Modal>
);

export default ReplaceModal;
