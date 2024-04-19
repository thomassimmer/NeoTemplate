'use client';

import Button from '@/components/ui/button';
import { axiosPublic } from '@/lib/axios';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Stack } from '@mui/system';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page({ params }: { params: { key: string } }) {
  const router = useRouter();
  const theme = useTheme();

  const [verifyClicked, setVerifyClicked] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const verifyEmail = async () => {
    setVerifyClicked(true);
    try {
      await axiosPublic.get(`/api/accounts/confirm-email/${params.key}/`);
      router.push('/confirm-email/done/');
    } catch (e: any) {
      setErrors(['An error occured.']);
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
