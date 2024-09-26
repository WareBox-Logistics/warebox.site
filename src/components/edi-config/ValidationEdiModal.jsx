import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Box, TextField, IconButton } from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';

const ValidationEdiModal = ({ open, onClose, ediString }) => {
  const [formatted, setFormatted] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState('Copiar al Portapapeles');
  const [fontSize, setFontSize] = useState(14);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [searchText, setSearchText] = useState('');

  const escapeHtml = (text) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const formatEDI = (text) => {
    if (!formatted) return escapeHtml(text);

    return text
      .split(/(\*|~)/)
      .map((part) => {
        if (part.match(/{{(.*?)}}/g)) {
          return `<span style="background-color: yellow;">${escapeHtml(part)}</span>`;
        }
        if (part === '*' || part === '~') {
          return `<span style="color: red;">${escapeHtml(part)}</span>`;
        }
        return escapeHtml(part);
      })
      .join('');
  };

  const formatWithLineBreaks = (text) => {
    let formattedText = formatEDI(text);
    if (formatted) {
      formattedText = formattedText.replace(/~/g, '~<br/>');
    }
    return formattedText;
  };

  const highlightedEDI = searchText
    ? formatWithLineBreaks(ediString).replace(
        new RegExp(`(${escapeHtml(searchText)})`, 'gi'),
        '<span style="background-color: lightgreen;">$1</span>'
      )
    : formatWithLineBreaks(ediString);

  const toggleFormat = () => {
    setFormatted(!formatted);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ediString);
    setCopyTooltip('Copiado!');
    setTimeout(() => setCopyTooltip('Copiar al Portapapeles'), 2000);
  };

  const handleFontSizeChange = (event) => {
    setFontSize(event.target.value);
  };

  const handleBackgroundColorChange = (event) => {
    setBackgroundColor(event.target.value);
  };

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        EDI Template
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box mb={2} display="flex" justifyContent="space-between">
          <Tooltip title={formatted ? 'Quitar Formato' : 'Formatear Vista con Saltos'} arrow>
            <IconButton onClick={toggleFormat} color="primary">
              <FormatAlignLeftIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={copyTooltip} arrow>
            <IconButton onClick={copyToClipboard} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box mb={2} display="flex" justifyContent="space-between">
          <TextField
            label="Tamaño de Fuente"
            type="number"
            value={fontSize}
            onChange={handleFontSizeChange}
            variant="outlined"
            size="small"
            style={{ width: '150px' }}
          />
          <TextField
            label="Color de Fondo"
            type="color"
            value={backgroundColor}
            onChange={handleBackgroundColorChange}
            variant="outlined"
            size="small"
            style={{ width: '150px' }}
          />
          <TextField
            label="Buscar"
            value={searchText}
            onChange={handleSearchTextChange}
            variant="outlined"
            size="small"
            style={{ width: '150px' }}
          />
        </Box>
        <Tooltip title="Variables resaltadas en amarillo, delimitadores en rojo">
          <div
            dangerouslySetInnerHTML={{ __html: highlightedEDI }}
            style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: `${fontSize}px`, backgroundColor }}
          />
        </Tooltip>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValidationEdiModal;
