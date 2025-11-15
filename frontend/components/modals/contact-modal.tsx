'use client';

import { useModalContext } from '@/app/providers/modal-provider';
import { useUserContext } from '@/app/providers/user-provider';
import logo from '@/components/icons/logo.png';
import { Dialog, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingDots } from '../icons';
import FormControl from '../inputs/FormControl';
import Button from '../ui/button';
import ErrorMessageList from '../common/ErrorMessageList';
import SuccessMessage from '../common/SuccessMessage';
import { useContactUseCase } from '@/src/presentation/hooks/use-service-container';
import {
  extractFieldErrors,
  extractGeneralErrors,
  extractDetailError,
} from '@/src/presentation/utils/form-errors';
import { ValidationException, EmailServiceException } from '@/src/domain/exceptions';

export default function ContactModal() {
  const theme = useTheme();

  const { t } = useTranslation();
  const { showContactModal, setShowContactModal } = useModalContext();
  const { user } = useUserContext();
  const contactUseCase = useContactUseCase();

  const [sendButtonIsClicked, setSendButtonIsClicked] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formSuccess, setFormSuccess] = useState('');
  const [email, setEmail] = useState((user && user.email) || '');
  const [message, setMessage] = useState('');
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [messageErrorMessage, setMessageErrorMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSuccess('');
    setFormErrors([]);
    setSendButtonIsClicked(true);
    setEmailErrorMessage('');
    setMessageErrorMessage('');

    const data = new FormData(event.currentTarget);
    const emailValue = (data.get('email') as string) || email || '';
    const messageValue = (data.get('message') as string) || '';

    try {
      const result = await contactUseCase.sendContactMessage(
        emailValue,
        messageValue
      );

      setMessage('');
      setFormSuccess(result.message || 'Your message has been sent, thank you.');
    } catch (error) {
      if (error instanceof ValidationException) {
        // Extract field-level errors
        const fieldErrors = extractFieldErrors(error);
        if (fieldErrors.email) setEmailErrorMessage(fieldErrors.email);
        if (fieldErrors.message) setMessageErrorMessage(fieldErrors.message);

        // Extract general errors
        const generalErrors = extractGeneralErrors(error);
        const detailError = extractDetailError(error);
        const allErrors = detailError
          ? [detailError, ...generalErrors]
          : generalErrors;
        if (allErrors.length > 0) {
          setFormErrors(allErrors);
        }
      } else if (error instanceof EmailServiceException) {
        setFormErrors([error.message]);
      } else {
        setFormErrors(['An error occurred. The mail could not be sent.']);
      }
    } finally {
      setSendButtonIsClicked(false);
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth='sm'
      open={showContactModal}
      onClose={() => setShowContactModal(false)}
      aria-labelledby='contact-modal-title'
      aria-describedby='contact-modal-description'
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
            id='contact-modal-title'
            variant='h3'
            component='h2'
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
          <form onSubmit={submit} noValidate aria-label={t('Contact form')}>
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

              <ErrorMessageList
                errors={formErrors}
                role='alert'
                id='contact-errors'
              />

              <SuccessMessage
                message={formSuccess}
                role='status'
                id='contact-success'
              />

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
