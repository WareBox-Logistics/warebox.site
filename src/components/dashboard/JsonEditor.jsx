import React from 'react';
import { Button, Box } from '@mui/material';
import ReactJson from 'react-json-view';

const JsonEditor = ({ json, isEditing, handleJsonChange, handleOpenReplaceModal, handleOpenViewModal, fieldName }) => (
  <>
    {isEditing ? (
      <>
        <ReactJson
          src={json}
          onEdit={(edit) => handleJsonChange(fieldName, edit)}
          onAdd={(edit) => handleJsonChange(fieldName, edit)}
          onDelete={(edit) => handleJsonChange(fieldName, edit)}
          theme="brewer"
          iconStyle="circle"
          enableClipboard={true}
          displayObjectSize={true}
          displayDataTypes={false}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenReplaceModal(fieldName)}
          sx={{ marginTop: '8px', marginRight: '8px' }}
        >
          Reemplazar JSON
        </Button>
      </>
    ) : (
      <Box component="pre" sx={{ backgroundColor: '#f4f4f4', padding: '16px', borderRadius: '8px' }}>
        <ReactJson
          src={json}
          collapsed={1}
          theme="brewer"
          iconStyle="circle"
          enableClipboard={true}
          displayObjectSize={true}
          displayDataTypes={false}
        />
        <Button onClick={() => handleOpenViewModal(json)}>Ver</Button>
      </Box>
    )}
  </>
);

export default JsonEditor;
