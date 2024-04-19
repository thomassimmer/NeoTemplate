'use client';

import { useUserContext } from '@/app/providers/user-provider';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function HomeConnected() {
  const { t } = useTranslation();

  const { user } = useUserContext();

  return (
    <Stack style={{ alignItems: 'center', justifyContent: 'center' }} py={10}>
      <Typography variant='h2'>
        {t('Welcome')} {user && user.username}!
      </Typography>
    </Stack>
  );
}
