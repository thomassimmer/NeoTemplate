'use client';

import { SessionProvider } from 'next-auth/react';
import ColorModeProvider from './providers/color-mode-provider';
import ModalContextProvider from './providers/modal-provider';
import ToastContextProvider from './providers/toast-provider';
import UserProvider from './providers/user-provider';
import { ServiceContainerProvider } from '@/src/presentation/hooks/use-service-container';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <SessionProvider>
        <ServiceContainerProvider>
          <UserProvider>
            <ModalContextProvider>
              <ToastContextProvider>{children}</ToastContextProvider>
            </ModalContextProvider>
          </UserProvider>
        </ServiceContainerProvider>
      </SessionProvider>
    </ColorModeProvider>
  );
}
