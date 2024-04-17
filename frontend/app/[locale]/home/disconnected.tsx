'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import Button from '@/components/ui/button';
import { Link, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export default function HomeDisconnected() {
  const theme = useTheme();

  const { t } = useTranslation();
  const { setShowSignInModal, showSignInForm } = useModalContext();

  return (
    <Stack
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
      gap={4}
      py={4}
    >
      <Typography variant='h1' sx={{ fontSize: '5rem' }}>
        <p>
          <span style={{ color: theme.palette.text.primary }}>Neo</span>
          <span style={{ color: theme.palette.primary.main }}>Template</span>
        </p>
      </Typography>

      <Typography
        variant='h2'
        style={{
          fontSize: '3rem',
        }}
      >
        <p>{t('Focus on the essential and launch your idea 🚀')}</p>
      </Typography>

      <Typography variant='h3' style={{ fontSize: '1.5rem' }}>
        {t('If you already have an account,')}&nbsp;
        <Link
          href='#'
          onClick={(event) => {
            event.preventDefault();
            setShowSignInModal(true);
            showSignInForm(true);
          }}
          style={{ color: theme.palette.primary.main }}
          underline='hover'
        >
          {t('click here to login')}
        </Link>
        .
      </Typography>

      <Button
        onClick={() => {
          setShowSignInModal(true);
          showSignInForm(false);
        }}
      >
        {t('Sign up')}
      </Button>
    </Stack>
  );
}
