'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { Divider, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingDots } from '../icons';
import FormControl from '../inputs/FormControl';
import Button from '../ui/button';
import ErrorMessageList from '../common/ErrorMessageList';
import ActionLink from '../common/ActionLink';
import { useAuthUseCase } from '@/src/presentation/hooks/use-service-container';
import {
  extractFieldErrors,
  extractGeneralErrors,
} from '@/src/presentation/utils/form-errors';
import { ValidationException, AuthenticationException } from '@/src/domain/exceptions';

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
  const authUseCase = useAuthUseCase();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [emailVerificationLinkIsSending, setEmailVerificationLinkIsSending] =
    useState(false);
  const [emailVerificationLinkWasSent, setEmailVerificationLinkWasSent] =
    useState(false);
  const [email, setEmail] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const sendEmailVerificationLink = async () => {
    if (!email) return;
    
    setEmailVerificationLinkIsSending(true);
    setEmailVerificationLinkWasSent(false);

    try {
      await authUseCase.resendEmailVerification(email);
      setEmailVerificationLinkWasSent(true);
    } catch (error) {
      setFormErrors(
        extractGeneralErrors(error).length > 0
          ? extractGeneralErrors(error)
          : ['Failed to send verification email.']
      );
    } finally {
      setEmailVerificationLinkIsSending(false);
    }
  };

  const renderEmailVerificationLink = () => {
    return (
      <>
        {!emailVerificationLinkIsSending && !emailVerificationLinkWasSent && (
          <ActionLink
            onClick={(e) => {
              e.preventDefault();
              sendEmailVerificationLink();
            }}
            disabled={emailVerificationLinkIsSending}
          >
            Click here to send another verification email.
          </ActionLink>
        )}

        {!emailVerificationLinkIsSending && emailVerificationLinkWasSent && (
          <p
            role='status'
            style={{
              color: theme.palette.success.main,
              margin: `${theme.spacing(1)} 0`,
            }}
          >
            A new verification email was sent.
          </p>
        )}
      </>
    );
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInClicked(true);
    setEmailVerificationLinkWasSent(false);
    setEmailVerificationLinkIsSending(false);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setFormErrors([]);

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const emailValue = (data.email as string) || '';
    const passwordValue = (data.password as string) || '';

    try {
      await authUseCase.login(emailValue, passwordValue);
      
      // Login successful - redirect
      setShowSignInModal(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      if (error instanceof ValidationException) {
        // Extract field-level errors
        const fieldErrors = extractFieldErrors(error);
        if (fieldErrors.email) setEmailErrorMessage(fieldErrors.email);
        if (fieldErrors.password) setPasswordErrorMessage(fieldErrors.password);
        
        // Extract general errors
        const generalErrors = extractGeneralErrors(error);
        if (generalErrors.length > 0) {
          setFormErrors(generalErrors);
        }
      } else if (error instanceof AuthenticationException) {
        setFormErrors([error.message]);
      } else {
        setFormErrors(['An error occurred.']);
      }
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
      <form onSubmit={submit} noValidate aria-label={t('Sign in form')}>
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

          <ErrorMessageList
            errors={formErrors}
            role='alert'
            id='signin-errors'
          />

          {formErrors.some((error) => error === 'E-mail is not verified.') &&
            renderEmailVerificationLink()}

          <ActionLink
            onClick={(e) => {
              e.preventDefault();
              if (!signInClicked) {
                showSignInForm(false);
                showResetPasswordForm(true);
              }
            }}
            disabled={signInClicked}
            color={theme.palette.secondary.dark}
          >
            {t('Forgot your password ? Ask for a new one here')}
          </ActionLink>

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

      <Divider sx={{ my: 2, background: theme.palette.divider }} />

      <ActionLink
        onClick={(e) => {
          e.preventDefault();
          if (!signInClicked) {
            showSignInForm(false);
          }
        }}
        disabled={signInClicked}
        color={theme.palette.secondary.dark}
        textAlign='center'
        mx='auto'
        my={2}
      >
        {t('Not registered yet ? Sign up')}
      </ActionLink>
    </Stack>
  );
}
