/**
 * Hook to access the service container.
 * Provides access to use cases and services.
 */

'use client';

import {
  ServiceContainer,
  createClientServiceContainer,
} from '@/src/application/services/service-container';
import { SessionData } from '@/src/infrastructure/auth/nextauth-auth-service';
import { useSession } from 'next-auth/react';
import React, { createContext, useContext, useMemo } from 'react';

const ServiceContainerContext = createContext<ServiceContainer | null>(null);

/**
 * Provider for service container.
 * Should be placed at the root of the app, inside SessionProvider.
 */
export function ServiceContainerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  // Create service container with session data getter
  const serviceContainer = useMemo(() => {
    const getSessionData = (): SessionData | null => {
      if (!session?.user) {
        return null;
      }
      // Type assertion for NextAuth session user which includes custom fields
      const user = session.user as {
        id?: string | number;
        email?: string | null;
        username?: string;
        image?: string | null;
        firstName?: string;
        first_name?: string;
        lastName?: string;
        last_name?: string;
        access?: string;
        refresh?: string;
      };

      return {
        user: {
          id: String(user.id || ''),
          email: user.email || '',
          username: user.username || user.email || '',
          image: user.image || null,
          firstName: user.firstName || user.first_name,
          lastName: user.lastName || user.last_name,
          access: user.access || '',
          refresh: user.refresh || '',
        },
      };
    };

    const container = createClientServiceContainer(getSessionData);
    
    // Update session getter when session changes (this also updates token getters)
    container.setSessionDataGetter(getSessionData);
    
    return container;
  }, [session]);

  return (
    <ServiceContainerContext.Provider value={serviceContainer}>
      {children}
    </ServiceContainerContext.Provider>
  );
}

/**
 * Hook to access the service container.
 * @throws Error if used outside ServiceContainerProvider
 */
export function useServiceContainer(): ServiceContainer {
  const container = useContext(ServiceContainerContext);
  if (!container) {
    throw new Error(
      'useServiceContainer must be used within ServiceContainerProvider'
    );
  }
  return container;
}

/**
 * Hook to access authentication use case.
 */
export function useAuthUseCase() {
  const container = useServiceContainer();
  return container.getAuthUseCase();
}

/**
 * Hook to access user use case.
 */
export function useUserUseCase() {
  const container = useServiceContainer();
  return container.getUserUseCase();
}

/**
 * Hook to access contact use case.
 */
export function useContactUseCase() {
  const container = useServiceContainer();
  return container.getContactUseCase();
}

