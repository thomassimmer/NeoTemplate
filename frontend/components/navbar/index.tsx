'use client';

import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import LeftButton from './left-button';

export default function Navbar() {
  const theme = useTheme();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        zIndex: 1,
        width: '100%',
        borderBottom: '1px solid',
        borderColor: theme.palette.primary.light,
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        padding: '0 10px',
      }}
    >
      <Stack
        direction={'row'}
        sx={{
          height: '4rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href='/'
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Typography
            variant='h1'
            style={{
              fontSize: '1.5rem',
              lineHeight: '2rem',
            }}
          >
            <span style={{ color: theme.palette.text.primary }}>Neo</span>
            <span style={{ color: theme.palette.primary.main }}>Template</span>
          </Typography>
        </Link>

        <LeftButton />
      </Stack>
    </header>
  );
}
