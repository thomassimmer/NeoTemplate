'use client';

import { FormControl } from '@mui/base/FormControl';
import PersonIcon from '@mui/icons-material/Person';
import { InputBase, InputLabel, Stack, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';
import { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

const Input = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    display: 'block',
    borderRadius: '0.375rem',
  },

  "& .MuiInputBase-input[type='file']": {
    marginRight: '1rem',
    border: '1px solid',
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.main,
    padding: '0.5rem 1rem',
    fontWeight: '600',
    color: theme.palette.text.primary,
  },

  "& .MuiInputBase-input[type='file']:hover": {
    backgroundColor: theme.palette.primary.light,
  },

  '& .MuiInputBase-input::file-selector-button': {
    display: 'none',
  },
}));

export default function PictureFormControl({
  value,
  onChange,
}: {
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
}) {
  const theme = useTheme();

  const { t } = useTranslation();

  return (
    <FormControl style={{ display: 'grid' }}>
      <InputLabel
        htmlFor={'userphoto'}
        sx={{ color: theme.palette.primary.main }}
      >
        {t('Profile Picture')}
      </InputLabel>

      <Stack direction={'row'} sx={{ mt: 2, alignItems: 'center' }} spacing={3}>
        {value ? (
          <Image
            alt={t('Profile Picture')}
            src={value}
            width={64}
            height={64}
            style={{
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.text.primary,
            }}
          />
        ) : (
          <Stack
            sx={{
              height: '64px',
              width: '64px',
              borderRadius: '9999px',
              border: '1px solid',
              borderColor: theme.palette.primary.dark,
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.text.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonIcon
              sx={{
                fontSize: '1.875rem',
              }}
            />
          </Stack>
        )}

        <Input
          id='userphoto'
          name='image'
          type='file'
          onChange={onChange}
        />
      </Stack>
    </FormControl>
  );
}
