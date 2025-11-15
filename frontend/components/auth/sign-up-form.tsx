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
import SuccessMessage from '../common/SuccessMessage';
import ActionLink from '../common/ActionLink';
import { useAuthUseCase } from '@/src/presentation/hooks/use-service-container';
import {
  extractFieldErrors,
  extractGeneralErrors,
} from '@/src/presentation/utils/form-errors';
import { ValidationException, EmailServiceException } from '@/src/domain/exceptions';

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
  const authUseCase = useAuthUseCase();

  const [formSuccess, setFormSuccess] = useState<string>('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInClicked(true);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setFormErrors([]);
    setFormSuccess('');

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const emailValue = (data.email as string) || '';
    const passwordValue = (data.password as string) || '';
    const passwordConfirmationValue = (data.password as string) || ''; // Assuming password confirmation field is also 'password' in the form

    try {
      const result = await authUseCase.register(
        emailValue,
        passwordValue,
        passwordConfirmationValue
      );

      if (result.requiresEmailVerification) {
        setFormSuccess(
          result.message ||
            'A email was sent to verify your address. You need to open it and click on the link inside to connect to NeoTexto.'
        );
      } else {
        // Registration successful - user is logged in
        setShowSignInModal(false);
        router.refresh();
      }
    } catch (error) {
      if (error instanceof ValidationException) {
        // Extract field-level errors
        const fieldErrors = extractFieldErrors(error);
        if (fieldErrors.email) setEmailErrorMessage(fieldErrors.email);
        if (fieldErrors.password || fieldErrors.password1) {
          setPasswordErrorMessage(
            fieldErrors.password || fieldErrors.password1 || ''
          );
        }

        // Extract general errors
        const generalErrors = extractGeneralErrors(error);
        if (generalErrors.length > 0) {
          setFormErrors(generalErrors);
        }
      } else if (error instanceof EmailServiceException) {
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
      spacing={4}
      px={4}
      py={2}
      sx={{ backgroundColor: theme.palette.background.default }}
      style={{ justifyContent: 'center' }}
    >
      <form onSubmit={submit} noValidate aria-label={t('Sign up form')}>
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

          <ErrorMessageList
            errors={formErrors}
            role='alert'
            id='signup-errors'
          />

          <SuccessMessage
            message={formSuccess}
            role='status'
            id='signup-success'
          />

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

      <Divider sx={{ my: 4, background: theme.palette.divider }} />

      <ActionLink
        onClick={(e) => {
          e.preventDefault();
          if (!signInClicked) {
            showSignInForm(true);
          }
        }}
        disabled={signInClicked}
        color={theme.palette.secondary.dark}
        textAlign='center'
        mx='auto'
        my={1}
      >
        {t('Already registered ? Sign in')}
      </ActionLink>
    </Stack>
  );
}
