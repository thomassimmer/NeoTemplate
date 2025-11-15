'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { Divider, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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

export default function ResetPasswordForm({}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const {
    signInClicked,
    setSignInClicked,
    showResetPasswordForm,
    showSignInForm,
  } = useModalContext();
  const authUseCase = useAuthUseCase();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInClicked(true);
    setFormErrors([]);
    setEmailErrorMessage('');
    setFormSuccess('');
    
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const emailValue = (data.email as string) || '';

    try {
      await authUseCase.requestPasswordReset(emailValue);
      
      setFormSuccess(
        'If an account with this address exists, an email was sent to it.'
      );
    } catch (error) {
      if (error instanceof ValidationException) {
        // Extract field-level errors
        const fieldErrors = extractFieldErrors(error);
        if (fieldErrors.email) setEmailErrorMessage(fieldErrors.email);
        
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
      py={4}
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      <form onSubmit={submit} noValidate aria-label={t('Password reset form')}>
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

          <ErrorMessageList
            errors={formErrors}
            role='alert'
            id='reset-password-errors'
          />

          <SuccessMessage
            message={formSuccess}
            role='status'
            id='reset-password-success'
          />

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

      <Divider sx={{ my: 2, background: theme.palette.divider }} />

      <ActionLink
        onClick={(e) => {
          e.preventDefault();
          if (!signInClicked) {
            showResetPasswordForm(false);
            showSignInForm(true);
          }
        }}
        disabled={signInClicked}
        color={theme.palette.secondary.dark}
        textAlign='center'
        mx='auto'
        my={2}
      >
        {t('Come back')}
      </ActionLink>
    </Stack>
  );
}
