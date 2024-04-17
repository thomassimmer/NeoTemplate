'use client';

import { useUserContext } from '@/app/providers/user-provider';
import { LoadingDots } from '@/components/icons';
import FormControl from '@/components/inputs/FormControl';
import Button from '@/components/ui/button';
import useAxiosAuth from '@/lib/hooks/use-axios-auth';
import { ErrorFormPasswordResetInterface } from '@/types/types';
import { Stack } from '@mui/material';
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
  const axiosPublic = useAxiosAuth();
  const router = useRouter();

  const { t } = useTranslation();
  const { user } = useUserContext();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [signInClicked, setSignInClicked] = useState(false);
  const [password1ErrorMessage, setPassword1ErrorMessage] = useState('');
  const [password2ErrorMessage, setPassword2ErrorMessage] = useState('');

  if (user) {
    router.push('/');
  }

  const submit = async (event) => {
    event.preventDefault();
    setSignInClicked(true);
    setFormErrors([]);
    setFormSuccess('');
    setPassword1ErrorMessage('');
    setPassword2ErrorMessage('');

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      await axiosPublic.post(
        '/api/auth/password/reset/confirm/',
        {
          uid: params.uid,
          token: params.token,
          new_password1: data.new_password1,
          new_password2: data.new_password2,
        },
        {
          withCredentials: true, // Necessary to pass csrf token
        }
      );

      router.push('/password-reset/confirm/done/');
    } catch (e: any) {
      if (e.response && e.response.status == 429) {
        setFormErrors([
          'Please wait a few minutes before asking for a new email.',
        ]);
      } else if (e.response.data) {
        const error: ErrorFormPasswordResetInterface = e.response.data;

        let errorMsgs: string[] = [];

        for (let field of [error.uid, error.token]) {
          if (field) {
            for (let e of field) {
              errorMsgs.push(e);
            }
          }
        }
        if (errorMsgs) {
          setFormErrors(errorMsgs);
        }

        if (error.newPassword1)
          setPassword1ErrorMessage(error.newPassword1.join('\n'));
        if (error.newPassword2)
          setPassword2ErrorMessage(error.newPassword2.join('\n'));
      } else {
        setFormErrors(['An error occured.']);
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
      <form style={{ maxWidth: 'md', width: '100%' }} onSubmit={submit}>
        <Stack spacing={4}>
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

          {formErrors &&
            formErrors.map((error, i) => (
              <p key={i} style={{ color: 'red' }}>
                {error}
              </p>
            ))}

          {formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}

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
