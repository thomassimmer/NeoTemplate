'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { Divider, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import ThemeSelector from './ThemeSelector';

export default function Footer() {
  const theme = useTheme();

  const { t } = useTranslation();

  const { setShowContactModal } = useModalContext();

  return (
    <footer
      style={{
        position: 'relative',
        top: '4rem',
        width: '100%',
      }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid',
          borderColor: theme.palette.primary.main,
          background: theme.palette.background.default,
          color: theme.palette.text.primary,
          width: '100%',
          px: 3,

          '@media (min-width:900px)': {
            flexDirection: 'row',
            justifyContent: 'space-between'
          },

          '@media (min-width:1100px)': {
            justifyContent: 'center',
          }
        }}
        py={5}
        gap={2}
      >
        <Stack
          direction={'row'}
          gap={3}
          sx={{
            '@media (min-width:1100px)': {
              position: 'absolute', left: '50px'
            }
          }}
        >
          <ThemeSelector />

          <LanguageSelector />
        </Stack>

        <Stack direction={'row'}>
          <Link
            style={{
              margin: '0 1rem',
              textDecoration: 'none',
              color: theme.palette.text.primary,
            }}
            href='/'
          >
            <Typography>NeoTemplate</Typography>
          </Link>

          <Divider flexItem orientation='vertical' />

          <Link
            style={{
              margin: '0 1rem',
              textDecoration: 'none',
              color: theme.palette.text.primary,
            }}
            href='#'
            onClick={(e) => {
              e.preventDefault();
              setShowContactModal(true);
            }}
            rel='noopener noreferrer'
          >
            <Typography>Contact</Typography>
          </Link>

          <Divider flexItem orientation='vertical' />

          <Link
            style={{
              margin: '0 1rem',
              textDecoration: 'none',
              color: theme.palette.text.primary,
            }}
            href='/privacy-policy'
          >
            <Typography>{t('Privacy')}</Typography>
          </Link>
        </Stack>
      </Stack>
    </footer>
  );
}
