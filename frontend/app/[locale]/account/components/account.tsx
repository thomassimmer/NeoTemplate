'use client';

import { useToastContext } from '@/app/providers/toast-provider';
import { useUserContext } from '@/app/providers/user-provider';
import { LoadingDots } from '@/components/icons';
import FormControl from '@/components/inputs/FormControl';
import PictureFormControl from '@/components/inputs/PictureFormControl';
import Button from '@/components/ui/button';
import ErrorMessageList from '@/components/common/ErrorMessageList';
import { UserInterface } from '@/types/types';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserUseCase } from '@/src/presentation/hooks/use-service-container';
import {
  extractFieldErrors,
  extractGeneralErrors,
} from '@/src/presentation/utils/form-errors';
import { ValidationException, UserNotFoundException } from '@/src/domain/exceptions';

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
  const userUseCase = useUserUseCase();

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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) return;

    setFormErrors([]);
    setEmailErrorMessage('');
    setPasswordErrorMessage('');
    setUsernameErrorMessage('');
    setImageErrorMessage('');
    setSaveClicked(true);

    const formData = new FormData(event.currentTarget);

    try {
      // Prepare update data from form
      const updateData: {
        username?: string;
        email?: string;
        password?: string;
        image?: File | null;
      } = {};

      const username = formData.get('username');
      if (username && typeof username === 'string') {
        updateData.username = username;
      }

      const email = formData.get('email');
      if (email && typeof email === 'string') {
        updateData.email = email;
      }

      const password = formData.get('password');
      if (password && typeof password === 'string' && password.trim()) {
        updateData.password = password;
      }

      const imageFile = formData.get('image') as File | null;
      if (imageFile && imageFile.size > 0) {
        updateData.image = imageFile;
      }

      // Update user using use case
      const updatedUser = await userUseCase.updateUser(
        String(user.id),
        updateData
      );

      // Convert domain User to UserInterface for context
      const newUserInfo: UserInterface = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        image: updatedUser.image,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      };

      setUser(newUserInfo);

      setToastCategory('success');
      setToastTitle('Success !');
      setToastDuration(3000);
      setToastMessage(`Your changes are saved.`);
      setShowToast(true);
    } catch (error) {
      if (error instanceof ValidationException) {
        // Extract field-level errors
        const fieldErrors = extractFieldErrors(error);
        if (fieldErrors.email) setEmailErrorMessage(fieldErrors.email);
        if (fieldErrors.image) setImageErrorMessage(fieldErrors.image);
        if (fieldErrors.username) setUsernameErrorMessage(fieldErrors.username);
        if (fieldErrors.password) setPasswordErrorMessage(fieldErrors.password);

        // Extract general errors
        const generalErrors = extractGeneralErrors(error);
        if (generalErrors.length > 0) {
          setFormErrors(generalErrors);
        }
      } else if (error instanceof UserNotFoundException) {
        setFormErrors([error.message]);
      } else {
        setFormErrors(['An error occurred.']);
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
      <form
        style={{ width: '100%' }}
        onSubmit={submit}
        noValidate
        aria-label={t('Account settings form')}
      >
        <Stack spacing={4}>
          <Typography
            variant='h1'
            component='h1'
            fontSize={28}
            fontWeight='bold'
            sx={{ color: theme.palette.text.primary, mb: 2 }}
          >
            {t('Settings')}
          </Typography>

          <Typography
            variant='h2'
            component='h2'
            fontSize={20}
            fontWeight='medium'
            sx={{ color: theme.palette.text.secondary, mb: 1 }}
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

          <ErrorMessageList
            errors={formErrors}
            role='alert'
            id='account-errors'
          />

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
