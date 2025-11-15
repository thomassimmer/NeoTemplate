'use client';

import { FormControl } from '@mui/base/FormControl';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  IconButton,
  InputAdornment,
  InputBase,
  InputLabel,
  alpha,
  styled,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ChangeEventHandler, useState } from 'react';

const Input = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.default,
    border: '1px solid',
    borderColor: theme.palette.secondary.main,
    fontSize: 16,
    padding: '10px 12px',
    transition: theme.transitions.create([
      'border-color',
      'background-color',
      'box-shadow',
    ]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
      borderColor: theme.palette.primary.main,
    },
  },
}));

export default function CustomFormControl({
  id,
  label,
  value,
  defaultValue,
  onChange,
  type,
  name,
  autoComplete,
  errorMessage,
  multiline = false,
}: {
  id: string;
  label: string;
  defaultValue?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  type: string;
  name: string;
  autoComplete: boolean;
  errorMessage: string;
  multiline?: boolean;
}) {
  const theme = useTheme();

  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl required style={{ width: '100%' }}>
      <InputLabel
        error={errorMessage !== ''}
        htmlFor={id}
        sx={{ marginTop: theme.spacing(1), color: theme.palette.primary.main }}
      >
        {label}
      </InputLabel>
      <Input
        fullWidth
        type={type == 'password' ? (showPassword ? 'text' : type) : type}
        multiline={multiline}
        rows={type == 'text' ? 3 : 1}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        id={id}
        autoComplete={autoComplete ? '' : 'new-password'}
        name={name}
        endAdornment={
          type == 'password' && (
            <InputAdornment position='end'>
              <IconButton
                aria-label='toggle password visibility'
                sx={{ color: theme.palette.primary.main }}
                onClick={() => setShowPassword(true)}
                onMouseDown={() => setShowPassword(false)}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )
        }
        error={!!errorMessage}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
      />
      {errorMessage && (
        <p
          id={`${id}-error`}
          role='alert'
          style={{
            color: theme.palette.error.main,
            margin: `${theme.spacing(0.5)} 0 0 0`,
            fontSize: '0.75rem',
          }}
        >
          {errorMessage}
        </p>
      )}
    </FormControl>
  );
}
