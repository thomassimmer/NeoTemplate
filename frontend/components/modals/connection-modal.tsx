'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import SignInForm from '@/components/auth/sign-in-form';
import logo from '@/components/icons/logo.png';
import { Dialog, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import ResetPasswordForm from '../auth/reset-password';
import SignUpForm from '../auth/sign-up-form';

export default function ConnectionModal() {
  const theme = useTheme();

  const { t } = useTranslation();
  const {
    showSignInModal,
    signInFormIsVisible,
    resetPasswordFormIsVisible,
    setShowSignInModal,
  } = useModalContext();

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
      open={showSignInModal}
      onClose={() => setShowSignInModal(false)}
      sx={{ border: '1px solid gray' }}
    >
      <Stack
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px gray',
          background: theme.palette.background.paper,
        }}
        gap={3}
        px={4}
        py={2}
        pt={8}
      >
        <Image src={logo} alt='NeoTemplate Logo' width={80} />
        <Typography
          variant='h3'
          color={theme.palette.primary.main}
          fontSize={25}
          fontWeight={'bold'}
        >
          {t('Welcome')}
        </Typography>
      </Stack>

      {signInFormIsVisible ? (
        <SignInForm />
      ) : resetPasswordFormIsVisible ? (
        <ResetPasswordForm />
      ) : (
        <SignUpForm />
      )}
    </Dialog>
  );
}
