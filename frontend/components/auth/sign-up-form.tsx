'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { ErrorFormSignUpInterface } from '@/types/types';
import { Divider, Link, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingDots } from '../icons';
import FormControl from '../inputs/FormControl';
import Button from '../ui/button';

export default function SignUpForm() {
  const router = useRouter();
  const theme = useTheme();

  const { t } = useTranslation();
  const {
    signInClicked,
    setShowSignInModal,
    setSignInClicked,
    showSignInForm,
  } = useModalContext();

  const [formSuccess, setFormSuccess] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setSignInClicked(true);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setFormErrors([]);
    setFormSuccess('');

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response: any = await signIn('credentials', {
        email: data.email,
        password: data.password,
        is_registration: true,
        redirect: false,
      });

      if (response.error) {
        if (response.error == 'verificationEmailSent') {
          setFormSuccess(
            'A email was sent to verify your address. You need to open it and click on the link inside to connect to NeoTexto.'
          );
        } else {
          const responseError = JSON.parse(response.error);
          const error: ErrorFormSignUpInterface = responseError.errors;

          if (error.email) setEmailErrorMessage(error.email.join('\n'));
          if (error.password1)
            setPasswordErrorMessage(error.password1.join('\n'));
          if (error.nonFieldErrors) setFormErrors(error.nonFieldErrors);
        }
      } else {
        setShowSignInModal(false);
        router.refresh();
      }
    } catch (e: any) {
      setFormErrors(['An error occured.']);
    } finally {
      setSignInClicked(false);
    }
  };

  return (
    <Stack
      spacing={4}
      px={4}
      py={2}
      sx={{ backgroundColor: theme.palette.background.default }}
      style={{ justifyContent: 'center' }}
    >
      <form onSubmit={submit}>
        <Stack
          sx={{ alignItems: 'center', justifyContent: 'center' }}
          spacing={2}
        >
          <FormControl
            id={'email-input'}
            label={t('Email')}
            type={'email'}
            name={'email'}
            autoComplete={true}
            errorMessage={emailErrorMessage}
          />

          <FormControl
            id={'password-input'}
            label={t('Password')}
            type={'password'}
            name={'password'}
            autoComplete={true}
            errorMessage={passwordErrorMessage}
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
            {signInClicked ? <LoadingDots color='#808080' /> : t('Sign up')}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: '4rem', background: 'gray' }} />

      <Link
        href='#'
        underline='hover'
        my={1}
        color={theme.palette.secondary.dark}
        mx={'auto'}
        textAlign={'center'}
        onClick={() => {
          if (!signInClicked) {
            showSignInForm(true);
          }
        }}
      >
        {t('Already registered ? Sign in')}
      </Link>
    </Stack>
  );
}
