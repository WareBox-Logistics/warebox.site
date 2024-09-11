import React, { useState } from 'react';
import Fab from '@mui/material/Fab';
import HelpIcon from '@mui/icons-material/Help';
import Tooltip from '@mui/material/Tooltip';
import ChatInterface from './ChatInterface';
import { Zoom } from '@mui/material';

const FloatingHelpButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <>
      <Tooltip title="Help" aria-label="help">
        <Fab 
          color="primary" 
          onClick={handleToggleChat}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            transition: 'transform 0.3s',
            transform: isChatOpen ? 'rotate(135deg)' : 'rotate(0deg)',
          }}
        >
          <HelpIcon />
        </Fab>
      </Tooltip>
      <Zoom in={isChatOpen}>
        <div>
          <ChatInterface />
        </div>
      </Zoom>
    </>
  );
};

export default FloatingHelpButton;
