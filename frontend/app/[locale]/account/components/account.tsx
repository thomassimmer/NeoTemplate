'use client';

import { useToastContext } from '@/app/providers/toast-provider';
import { useUserContext } from '@/app/providers/user-provider';
import { LoadingDots } from '@/components/icons';
import FormControl from '@/components/inputs/FormControl';
import PictureFormControl from '@/components/inputs/PictureFormControl';
import Button from '@/components/ui/button';
import { axiosPublic } from '@/lib/axios';
import { ErrorFormUpdateProfileInterface, UserInterface } from '@/types/types';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Account() {
  const theme = useTheme();

  const { t } = useTranslation();
  const { user, setUser } = useUserContext();
  const {
    setToastCategory,
    setToastMessage,
    setToastTitle,
    setShowToast,
    setToastDuration,
  } = useToastContext();

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saveClicked, setSaveClicked] = useState(false);
  const [image, setImage] = useState((user && user.image) || '');

  const [userNameErrorMessage, setUsernameErrorMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [imageErrorMessage, setImageErrorMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      if (user.image) {
        setImage(user.image);
      }
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      setImage(URL.createObjectURL(file));
    }
  };

  const submit = async (event: any) => {
    event.preventDefault();

    setFormErrors([]);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setUsernameErrorMessage('');
    setImageErrorMessage('');
    setSaveClicked(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await axiosPublic.put(
        `/api/users/${user && user.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newUserInfo = response.data as UserInterface;
      setUser(newUserInfo);

      setToastCategory('success');
      setToastTitle('Success !');
      setToastDuration(3000);
      setToastMessage(`Your changes are saved.`);
      setShowToast(true);
    } catch (e: any) {
      if (e.response.data) {
        const error = e.response.data as ErrorFormUpdateProfileInterface;

        if (error.email) {
          setEmailErrorMessage(error.email.join('\n'));
        }
        if (error.image) {
          setImageErrorMessage(error.image.join('\n'));
        }
        if (error.username) {
          setUsernameErrorMessage(error.username.join('\n'));
        }
        if (error.password) {
          setPasswordErrorMessage(error.password.join('\n'));
        }
      }
    } finally {
      setSaveClicked(false);
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
      <form style={{ width: '100%' }} onSubmit={submit}>
        <Stack spacing={4}>
          <Typography
            variant='h2'
            fontSize={25}
            sx={{ color: theme.palette.text.primary }}
          >
            {t('Settings')}
          </Typography>

          <Typography
            variant='h2'
            fontSize={25}
            sx={{ color: theme.palette.text.primary }}
          >
            {t('Personal Information')}
          </Typography>

          <FormControl
            label={t('Username')}
            type='text'
            name='username'
            id='username'
            autoComplete={false}
            defaultValue={(user && user.username) || ''}
            errorMessage={userNameErrorMessage}
          />

          <PictureFormControl value={image} onChange={handleImageChange} />

          <FormControl
            label={t('Email')}
            type='email'
            name='email'
            id='email'
            autoComplete={false}
            defaultValue={(user && user.email) || ''}
            errorMessage={emailErrorMessage}
          />

          <FormControl
            label={t('New password')}
            type='password'
            name='password'
            id='password'
            autoComplete={false}
            errorMessage={passwordErrorMessage}
          />

          {formErrors &&
            formErrors.map((error, i) => (
              <p key={i} style={{ color: 'red' }}>
                {error}
              </p>
            ))}

          <Button
            type='submit'
            disabled={saveClicked}
            sx={{
              width: 'fit-content',
              height: 'fit-content',
              alignSelf: 'center',
              px: 4,
            }}
          >
            {saveClicked ? <LoadingDots color='#808080' /> : t('Save')}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
