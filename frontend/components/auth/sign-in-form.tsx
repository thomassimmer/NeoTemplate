'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { axiosPublic } from '@/lib/axios';
import { ErrorFormSignInInterface } from '@/types/types';
import { Divider, Link, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingDots } from '../icons';
import FormControl from '../inputs/FormControl';
import Button from '../ui/button';

export default function SignInForm() {
  const router = useRouter();
  const theme = useTheme();

  const { t } = useTranslation();
  const {
    signInClicked,
    setShowSignInModal,
    showSignInForm,
    setSignInClicked,
    showResetPasswordForm,
  } = useModalContext();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [emailVerificationLinkIsSending, setEmailVerificationLinkIsSending] =
    useState(false);
  const [emailVerificationLinkWasSent, setEmailVerificationLinkWasSent] =
    useState(false);
  const [email, setEmail] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const sendEmailVerificationLink = async () => {
    setEmailVerificationLinkIsSending(true);

    await axiosPublic.post(
      '/api/auth/registration/resend-email/',
      {
        email,
      },
      {
        withCredentials: true, // Necessary to pass csrf token
      }
    );

    setEmailVerificationLinkWasSent(true);
    setEmailVerificationLinkIsSending(false);
  };

  const renderEmailVerificationLink = () => {
    return (
      <>
        {!emailVerificationLinkIsSending && (
          <Link
            href='#'
            onClick={(e) => sendEmailVerificationLink()}
            underline='hover'
          >
            Click here to send another verification email.
          </Link>
        )}

        {!emailVerificationLinkIsSending && emailVerificationLinkWasSent && (
          <p>A new verification email was sent.</p>
        )}
      </>
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    setSignInClicked(true);
    setEmailVerificationLinkWasSent(false);
    setEmailVerificationLinkIsSending(false);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setFormErrors([]);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response: any = await signIn('credentials', {
        email: data.email,
        password: data.password,
        is_registration: false,
        redirect: false,
      });

      if (response.error) {
        const responseError = JSON.parse(response.error);
        const error: ErrorFormSignInInterface = responseError.errors;

        if (error.email) setEmailErrorMessage(error.email.join('\n'));
        if (error.password) setPasswordErrorMessage(error.password.join('\n'));
        if (error.nonFieldErrors) setFormErrors(error.nonFieldErrors);
      } else {
        setShowSignInModal(false);
        router.push('/');
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
      spacing={2}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              <p key={i}>
                {error}
                <br />
                {error == 'E-mail is not verified.' &&
                  renderEmailVerificationLink()}
              </p>
            ))}

          <Link
            href='#'
            onClick={() => {
              showSignInForm(false);
              showResetPasswordForm(true);
            }}
            underline='hover'
            color={theme.palette.secondary.dark}
          >
            {t('Forgot your password ? Ask for a new one here')}
          </Link>

          <Button
            sx={{
              mt: 2,
            }}
            type='submit'
            disabled={signInClicked}
          >
            {signInClicked ? <LoadingDots color='#808080' /> : t('Sign in')}
          </Button>
        </Stack>
      </form>

      <Divider sx={{ my: 2, background: 'gray' }} />

      <Link
        href='#'
        underline='hover'
        my={2}
        color={theme.palette.secondary.dark}
        textAlign={'center'}
        mx={'auto'}
        onClick={() => {
          if (!signInClicked) {
            showSignInForm(false);
          }
        }}
      >
        {t('Not registered yet ? Sign up')}
      </Link>
    </Stack>
  );
}
