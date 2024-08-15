import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ConfirmationDialog = ({ open, handleClose, handleConfirm }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{t('customerConfig.confirmSave')}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {t('customerConfig.confirmSaveMessage')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          {t('customerConfig.cancel')}
        </Button>
        <Button onClick={handleConfirm} color="primary" autoFocus>
          {t('customerConfig.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
