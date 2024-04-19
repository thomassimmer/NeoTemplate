'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { useUserContext } from '@/app/providers/user-provider';
import Button from '@/components/ui/button';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function Page() {
  const router = useRouter();
  const theme = useTheme();

  const { t } = useTranslation();
  const { setShowSignInModal } = useModalContext();
  const { user } = useUserContext();

  return (
    <Stack
      maxWidth={'lg'}
      width={'100%'}
      sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
      spacing={6}
    >
      <Typography variant='h2'>
        Your email has been confirmed. Thank you.
      </Typography>

      {user ? (
        <Button
          sx={{
            width: 'fit-content',
            height: 'fit-content',
            alignSelf: 'center',
          }}
          onClick={() => {
            router.push('/');
          }}
        >
          Home
        </Button>
      ) : (
        <Button
          sx={{
            width: 'fit-content',
            height: 'fit-content',
            alignSelf: 'center',
          }}
          onClick={() => {
            setShowSignInModal(true);
          }}
        >
          {t('Sign in')}
        </Button>
      )}
    </Stack>
  );
}
