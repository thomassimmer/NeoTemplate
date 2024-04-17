'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Button from '../ui/button';

export default function NotConnectedUserDropdown() {
  const theme = useTheme();

  const { t } = useTranslation();
  const { setShowSignInModal, showSignInForm } = useModalContext();

  return (
    <Button
      sx={{
        backgroundColor: 'black',
        color: 'white',

        '&:hover': {
          color: 'black',
          backgroundColor: 'white',
        },
      }}
      onClick={() => {
        setShowSignInModal(true);
        showSignInForm(true);
      }}
    >
      {t('Sign in')}
    </Button>
  );
}
