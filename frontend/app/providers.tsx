'use client';

import { SessionProvider } from 'next-auth/react';
import ColorModeProvider from './providers/color-mode-provider';
import ModalContextProvider from './providers/modal-provider';
import ToastContextProvider from './providers/toast-provider';
import UserProvider from './providers/user-provider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <SessionProvider>
        <UserProvider>
          <ModalContextProvider>
            <ToastContextProvider>{children}</ToastContextProvider>
          </ModalContextProvider>
        </UserProvider>
      </SessionProvider>
    </ColorModeProvider>
  );
}
