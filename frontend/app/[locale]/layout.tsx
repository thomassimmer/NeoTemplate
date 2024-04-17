import initTranslations from '@/app/i18n';
import TranslationProvider from '@/app/providers/translation-provider';
import Body from '@/components/ui/body';
import Providers from '../providers';

const i18nNamespaces = ['translation'];

export default async function Layout({ children, params: { locale } }: any) {
  const { resources } = await initTranslations(locale, i18nNamespaces);

  return (
    <TranslationProvider
      locale={locale}
      resources={resources}
      namespaces={i18nNamespaces}
    >
      <Providers>
        <Body>{children}</Body>
      </Providers>
    </TranslationProvider>
  );
}
