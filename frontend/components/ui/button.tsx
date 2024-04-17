'use client';

import { ButtonProps, Button as MuiButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function Button({ children, ...props }: ButtonProps) {
  const theme = useTheme();

  return (
    <MuiButton
      {...props}
      sx={{
        borderRadius: '9999px',
        border: '1px solid',
        borderColor: theme.palette.primary.dark,
        backgroundColor: theme.palette.primary.main,
        padding: '0.5rem 1rem',
        fontSize: '0.875rem',
        color: theme.palette.text.primary,

        '&:hover': {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.text.secondary,
        },
        ...props.sx,
      }}
    >
      {children}
    </MuiButton>
  );
}
