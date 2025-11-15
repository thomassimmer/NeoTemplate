/**
 * Accessible success message component.
 */

'use client';

import { Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface SuccessMessageProps {
  message: string;
  id?: string;
  role?: 'alert' | 'status';
}

export default function SuccessMessage({
  message,
  id,
  role = 'status',
}: SuccessMessageProps) {
  const theme = useTheme();

  if (!message) {
    return null;
  }

  return (
    <Alert
      severity='success'
      role={role}
      id={id}
      sx={{
        width: '100%',
        mt: 1,
        '& .MuiAlert-icon': {
          color: theme.palette.success.main,
        },
      }}
    >
      {message}
    </Alert>
  );
}

