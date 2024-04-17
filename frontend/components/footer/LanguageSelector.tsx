'use client';

import { availableLanguages, i18nConfig } from '@/app/i18nConfig';
import LanguageIcon from '@mui/icons-material/Language';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const theme = useTheme();

  const { t, i18n } = useTranslation();

  const currentLocale = i18n.language;
  const router = useRouter();
  const currentPathname = usePathname();

  const handleChange = (newLocale: string) => {
    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = '; expires=' + date.toUTCString();
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${expires};path=/`;

    if (currentLocale === i18nConfig.defaultLocale) {
      router.push('/' + newLocale + currentPathname);
    } else {
      router.push(
        currentPathname.replace(`/${currentLocale}`, `/${newLocale}`)
      );
    }

    router.refresh();
  };

  return (
    <FormControl fullWidth size='small'>
      <InputLabel
        id='language-select-label'
        sx={{ color: theme.palette.primary.main }}
      >
        {t('Language')}
      </InputLabel>
      <Select
        labelId='language-select-label'
        id='language-select'
        label={t('Language')}
        value={currentLocale}
        fullWidth
        onChange={(e: any) => handleChange(e.target.value)}
        renderValue={(value: any) => (
          <Stack direction={'row'} spacing={2}>
            <LanguageIcon />
            <p style={{ margin: '0 20px' }}>{availableLanguages[value]}</p>
          </Stack>
        )}
        MenuProps={{
          MenuListProps: {
            sx: { backgroundColor: theme.palette.background.default },
          },
        }}
      >
        {Object.entries(availableLanguages).map(([key, value]) => (
          <MenuItem key={key} value={key}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
