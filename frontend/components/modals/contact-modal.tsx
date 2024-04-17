'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { useUserContext } from '@/app/providers/user-provider';
import logo from '@/components/icons/logo.png';
import { axiosPublic } from '@/lib/axios';
import { Dialog, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingDots } from '../icons';
import FormControl from '../inputs/FormControl';
import Button from '../ui/button';

export default function ContactModal() {
  const theme = useTheme();

  const { t } = useTranslation();
  const { showContactModal, setShowContactModal } = useModalContext();
  const { user } = useUserContext();

  const [sendButtonIsClicked, setSendButtonIsClicked] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [email, setEmail] = useState((user && user.email) || '');
  const [message, setMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [messageErrorMessage, setMessageErrorMessage] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setFormSuccess('');
    setFormErrors([]);
    setSendButtonIsClicked(true);
    setEmailErrorMessage('');
    setMessageErrorMessage('');

    const data = new FormData(event.currentTarget);

    try {
      await axiosPublic.post('/api/contact/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('');
      setFormSuccess('Your message has been sent, thank you.');
    } catch (e: any) {
      if (e.response.data) {
        const error = e.response.data;

        if (error.email) setEmailErrorMessage(error.email.join('\n'));
        if (error.message) setMessageErrorMessage(error.message.join('\n'));
        if (error.nonFieldErrors) setFormErrors(error.nonFieldErrors);
        if (error.detail) setFormErrors([error.detail]);
      } else {
        setFormErrors(['An error occured. The mail could not be sent.']);
      }
    } finally {
      setSendButtonIsClicked(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
      sx={{ border: '1px solid gray' }}
      open={showContactModal}
      onClose={() => setShowContactModal(false)}
    >
      <div
        style={{
          width: '100%',
          overflow: 'hidden',
          boxShadow:
            '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px gray',
            background: theme.palette.background.paper,
          }}
          gap={3}
          px={4}
          py={2}
          pt={8}
        >
          <Image src={logo} alt='NeoTemplate Logo' width={80} />
          <Typography
            variant='h3'
            color={theme.palette.primary.main}
            fontSize={25}
            fontWeight={'bold'}
          >
            {t('Contact us')}
          </Typography>
        </Stack>

        <Stack
          spacing={4}
          px={4}
          py={4}
          sx={{ backgroundColor: theme.palette.background.default }}
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
                defaultValue={email}
                name={'email'}
                autoComplete={true}
                errorMessage={emailErrorMessage}
              />

              <FormControl
                id={'message-input'}
                label={t('Message')}
                type={'text'}
                name={'message'}
                autoComplete={false}
                errorMessage={messageErrorMessage}
                multiline={true}
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
                disabled={sendButtonIsClicked}
                sx={{
                  mt: 2,
                }}
              >
                {sendButtonIsClicked ? (
                  <LoadingDots color='#808080' />
                ) : (
                  t('Send')
                )}
              </Button>
            </Stack>
          </form>
        </Stack>
      </div>
    </Dialog>
  );
}
