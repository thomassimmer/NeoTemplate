'use client';

import { UserInterface } from '@/types/types';
import { createContext, useContext } from 'react';
import { useCurrentUser } from '@/src/presentation/hooks/use-current-user';

interface UserContextInterface {
  user: UserInterface | null;
  setUser: (user: UserInterface | null) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext({} as UserContextInterface);

/**
 * UserProvider - Provides user context to the application.
 * Uses the shared useCurrentUser hook to avoid duplication.
 */
export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, refreshUser, isLoading } = useCurrentUser();

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user context.
 * Use this hook to access the current user state throughout the application.
 */
export const useUserContext = () => {
  return useContext(UserContext);
};
