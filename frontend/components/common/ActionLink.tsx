/**
 * Accessible link component that acts as a button.
 * Use this for links that perform actions rather than navigation.
 */

'use client';

import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

interface ActionLinkProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  disabled?: boolean;
  underline?: 'hover' | 'always' | 'none';
  color?: string;
  textAlign?: 'center' | 'left' | 'right';
  mx?: string;
  my?: number | string;
}

export default function ActionLink({
  onClick,
  children,
  disabled = false,
  underline = 'hover',
  color,
  textAlign,
  mx,
  my,
}: ActionLinkProps) {
  const theme = useTheme();

  // Use Button styled as a link for better accessibility when performing actions
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant='text'
      sx={{
        textTransform: 'none',
        textDecoration: disabled ? 'none' : 'none',
        textDecorationColor: 'transparent',
        '&:hover': {
          textDecoration:
            disabled || underline === 'none'
              ? 'none'
              : underline === 'always'
              ? 'underline'
              : 'underline',
        },
        color: color || theme.palette.secondary.dark,
        textAlign: textAlign || 'inherit',
        mx: mx || 0,
        my: my || 0,
        minWidth: 'auto',
        padding: 0,
        justifyContent:
          textAlign === 'center'
            ? 'center'
            : textAlign === 'right'
            ? 'flex-end'
            : 'flex-start',
      }}
    >
      {children}
    </Button>
  );
}

