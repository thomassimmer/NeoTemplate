'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import useAxiosAuth from '@/lib/hooks/use-axios-auth';
import { Divider, Link, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingDots } from '../icons';
import FormControl from '../inputs/FormControl';
import Button from '../ui/button';

export default function ResetPasswordForm({}) {
  const axiosPublic = useAxiosAuth();
  const theme = useTheme();

  const { t } = useTranslation();
  const {
    signInClicked,
    setSignInClicked,
    showResetPasswordForm,
    showSignInForm,
  } = useModalContext();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSignInClicked(true);
    setFormErrors([]);
    setEmailErrorMessage('');
    setFormSuccess('');
    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      await axiosPublic.post(
        '/api/auth/password/reset/',
        {
          email: data.email,
        },
        {
          withCredentials: true, // Necessary to pass csrf token
        }
      );

      setFormSuccess(
        'If an account with this address exists, an email was sent to it.'
      );
    } catch (e: any) {
      if (e.response && e.response.status == 429) {
        setFormErrors([
          'Please wait a few minutes before asking for a new email.',
        ]);
      } else if (e.response.data) {
        const error = e.reponse.data;

        if (error.email) setEmailErrorMessage(error.email.join('\n'));
      } else {
        setFormErrors(['An error occured.']);
      }
    } finally {
      setSignInClicked(false);
    }
  };

  return (
    <Stack
      spacing={4}
      px={4}
      py={4}
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <form onSubmit={submit}>
        <Stack
          sx={{ alignItems: 'center', justifyContent: 'center' }}
          spacing={2}
        >
          <p style={{ color: 'black' }}>
            {t(
              'Please, enter your email so we can send you a password reset link.'
            )}
          </p>

          <FormControl
            id={'email-input'}
            label={t('Email')}
            type={'email'}
            name={'email'}
            autoComplete={true}
            errorMessage={emailErrorMessage}
          />

          {formErrors &&
            formErrors.map((error, i) => (
              <p key={i} style={{ color: 'red' }}>
                {error}
              </p>
            ))}

          {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

          <Button
            sx={{
              mt: 2,
            }}
            type='submit'
            disabled={signInClicked}
          >
            {signInClicked ? <LoadingDots color='#808080' /> : t('Send email')}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 2 }} />

      <Link
        href='#'
        underline='hover'
        my={2}
        color={theme.palette.secondary.dark}
        textAlign={'center'}
        mx={'auto'}
        onClick={() => {
          if (!signInClicked) {
            showResetPasswordForm(false);
            showSignInForm(true);
          }
        }}
      >
        {t('Come back')}
      </Link>
    </Stack>
  );
}
