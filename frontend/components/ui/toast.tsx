'use client';

import { useToastContext } from '@/app/providers/toast-provider';
import { Alert, AlertColor, Snackbar } from '@mui/material';

export default function ToastMessage() {
  const {
    showToast,
    toastCategory,
    toastPosition,
    toastMessage,
    toastTitle,
    toastDuration,
    setShowToast,
  } = useToastContext();

  const handleClose = () => {
    setShowToast(false);
  };

  return (
    <Snackbar
      autoHideDuration={toastDuration}
      open={showToast}
      onClose={handleClose}
      anchorOrigin={toastPosition}
    >
      <Alert
        onClose={handleClose}
        severity={toastCategory as AlertColor}
        variant='filled'
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p style={{ margin: 0 }}>
          <span>{toastTitle}</span>
          <br />
          <span>{toastMessage}</span>
        </p>
      </Alert>
    </Snackbar>
  );
}
