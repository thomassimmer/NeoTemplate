'use client';

import Button from '@/components/ui/button';
import { AuthenticationException, ValidationException } from '@/src/domain/exceptions';
import { useAuthUseCase } from '@/src/presentation/hooks/use-service-container';
import { extractGeneralErrors } from '@/src/presentation/utils/form-errors';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page({ params }: { params: { key: string } }) {
  const router = useRouter();
  const theme = useTheme();
  const authUseCase = useAuthUseCase();

  const [verifyClicked, setVerifyClicked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const verifyEmail = async () => {
    setVerifyClicked(true);
    setErrors([]);
    
    try {
      await authUseCase.confirmEmail(params.key);
      router.push('/confirm-email/done/');
    } catch (error) {
      if (error instanceof ValidationException) {
        const generalErrors = extractGeneralErrors(error);
        setErrors(generalErrors.length > 0 ? generalErrors : ['An error occurred.']);
      } else if (error instanceof AuthenticationException) {
        setErrors([error.message]);
      } else {
        setErrors(['An error occurred.']);
      }
    } finally {
      setVerifyClicked(false);
    }
  };

  return (
    <Stack
      maxWidth={'lg'}
      width={'100%'}
      sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
      spacing={6}
    >
      <Typography variant='h2'>
        Please, click on this button to verify your email.
      </Typography>

      <Button
        disabled={verifyClicked}
        sx={{
          width: 'fit-content',
          height: 'fit-content',
          alignSelf: 'center',
        }}
        onClick={() => {
          verifyEmail();
        }}
      >
        Verify
      </Button>

      {errors &&
        errors.map((error, i) => (
          <p key={i} style={{ color: 'red' }}>
            {error}
          </p>
        ))}
    </Stack>
  );
}
