'use client';

import { UserInterface } from '@/types/types';
import { signOut, useSession } from 'next-auth/react';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useUserUseCase } from '@/src/presentation/hooks/use-service-container';
import { UserNotFoundException, AuthenticationException } from '@/src/domain/exceptions';

interface UserContextInterface {
  user: UserInterface | null;
  setUser: Dispatch<SetStateAction<UserInterface | null>>;
}

const UserContext = createContext({} as UserContextInterface);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status, data: session } = useSession();
  const userUseCase = useUserUseCase();

  const [user, setUser] = useState<UserInterface | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchUser = async () => {
        try {
          const currentUser = await userUseCase.getCurrentUser();

          // Convert domain User to UserInterface for context
          const newUserInfo: UserInterface = {
            id: currentUser.id,
            email: currentUser.email,
            username: currentUser.username,
            image: currentUser.image,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
          };

          setUser(newUserInfo);
        } catch (error) {
          if (error instanceof UserNotFoundException) {
            // User not found - sign out
            signOut();
            return;
          }
          if (error instanceof AuthenticationException) {
            // Authentication failed - token might be invalid or expired
            console.error('Authentication failed when fetching user:', error);
            signOut();
            return;
          }
          // For other errors, we might want to log them but not sign out
          console.error('Failed to fetch user:', error);
        }
      };

      if (!user && session?.user) {
        fetchUser();
      }
    } else {
      setUser(null);
    }
  }, [status, user, userUseCase, session]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  return useContext(UserContext);
};
