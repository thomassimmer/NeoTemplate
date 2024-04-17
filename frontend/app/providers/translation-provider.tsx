'use client';

import initTranslations from '@/app/i18n';
import { createInstance } from 'i18next';
import React, { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

interface TranslationProviderProps {
  locale: string;
  namespaces: string[];
  resources: any;
}

const TranslationProvider = React.memo<
  PropsWithChildren<TranslationProviderProps>
>(({ children, locale, namespaces, resources }) => {
  const i18n = createInstance();

  initTranslations(locale, namespaces, i18n, resources);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
});

export default TranslationProvider;