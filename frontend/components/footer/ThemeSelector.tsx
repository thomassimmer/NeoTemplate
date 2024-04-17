'use client';

import { useColorModeContext } from '@/app/providers/color-mode-provider';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const ThemeSelector = () => {
  const theme = useTheme();

  const { t } = useTranslation();

  const { mode, setMode } = useColorModeContext();

  return (
    <FormControl fullWidth size='small'>
      <InputLabel
        id='theme-select-label'
        sx={{ color: theme.palette.primary.main }}
      >
        {t('Theme')}
      </InputLabel>

      <Select
        labelId='theme-select-label'
        id='theme-select'
        label={t('Theme')}
        value={mode}
        fullWidth
        onChange={(e: any) => {
          const newMode = e.target.value;
          setMode(newMode);
          localStorage.setItem('selectedMode', newMode);
        }}
        renderValue={(value: any) => (
          <Stack direction={'row'} spacing={2}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            <p style={{ margin: '0 20px' }}>{t(value)}</p>
          </Stack>
        )}
        MenuProps={{
          MenuListProps: {
            sx: { backgroundColor: theme.palette.background.default },
          },
        }}
      >
        <MenuItem value='light'>{t('light')}</MenuItem>
        <MenuItem value='dark'>{t('dark')}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default ThemeSelector;
