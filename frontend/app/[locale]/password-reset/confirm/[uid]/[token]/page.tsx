'use client';

import { useUserContext } from '@/app/providers/user-provider';
import ErrorMessageList from '@/components/common/ErrorMessageList';
import SuccessMessage from '@/components/common/SuccessMessage';
import { LoadingDots } from '@/components/icons';
import FormControl from '@/components/inputs/FormControl';
import Button from '@/components/ui/button';
import { AuthenticationException, ValidationException } from '@/src/domain/exceptions';
import { useAuthUseCase } from '@/src/presentation/hooks/use-service-container';
import {
  extractFieldErrors,
  extractGeneralErrors,
} from '@/src/presentation/utils/form-errors';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Home({
  params,
}: {
  params: { uid: string; token: string };
}) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useUserContext();
  const authUseCase = useAuthUseCase();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [signInClicked, setSignInClicked] = useState(false);
  const [password1ErrorMessage, setPassword1ErrorMessage] = useState('');
  const [password2ErrorMessage, setPassword2ErrorMessage] = useState('');

  if (user) {
    router.push('/');
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSignInClicked(true);
    setFormErrors([]);
    setFormSuccess('');
    setPassword1ErrorMessage('');
    setPassword2ErrorMessage('');

    const data = Object.fromEntries(new FormData(event.currentTarget));
    const newPassword1 = (data.new_password1 as string) || '';
    const newPassword2 = (data.new_password2 as string) || '';

    try {
      await authUseCase.confirmPasswordReset(
        params.uid,
        params.token,
        newPassword1,
        newPassword2
      );

      router.push('/password-reset/confirm/done/');
    } catch (error) {
      if (error instanceof ValidationException) {
        // Extract field-level errors
        const fieldErrors = extractFieldErrors(error);
        if (fieldErrors.new_password1 || fieldErrors.newPassword1) {
          setPassword1ErrorMessage(
            fieldErrors.new_password1 || fieldErrors.newPassword1 || ''
          );
        }
        if (fieldErrors.new_password2 || fieldErrors.newPassword2) {
          setPassword2ErrorMessage(
            fieldErrors.new_password2 || fieldErrors.newPassword2 || ''
          );
        }

        // Extract general errors (including uid/token errors)
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
      maxWidth={'lg'}
      width={'100%'}
      my={6}
      sx={{
        alignItems: 'center',
        borderRadius: '20px',
        border: '5px solid',
        borderColor: theme.palette.primary.light,
        backgroundColor: theme.palette.background.default,
      }}
      p={6}
    >
      <form
        style={{ maxWidth: 'md', width: '100%' }}
        onSubmit={submit}
        noValidate
        aria-label={t('Set new password form')}
      >
        <Stack spacing={4}>
          <Typography variant='h1' component='h1' sx={{ mb: 2 }}>
            {t('Set New Password')}
          </Typography>

          <FormControl
            type='password'
            id='new_password1'
            label='Password'
            name='new_password1'
            autoComplete={false}
            errorMessage={password1ErrorMessage}
          />

          <FormControl
            type='password'
            id='new_password2'
            label='Confirm password'
            name='new_password2'
            autoComplete={false}
            errorMessage={password2ErrorMessage}
          />

          <ErrorMessageList
            errors={formErrors}
            role='alert'
            id='password-reset-confirm-errors'
          />

          <SuccessMessage
            message={formSuccess}
            role='status'
            id='password-reset-confirm-success'
          />

          <Button
            type='submit'
            disabled={signInClicked}
            sx={{
              width: 'fit-content',
              height: 'fit-content',
              alignSelf: 'center',
              padding: '0 2rem',
            }}
          >
            {signInClicked ? (
              <LoadingDots color='#808080' />
            ) : (
              t('Set New Password')
            )}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
