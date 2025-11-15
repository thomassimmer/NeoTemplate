/**
 * Hook to manage current user state and fetching logic.
 * This hook encapsulates the logic for fetching and caching user data.
 */

import { User } from '@/src/domain/entities';
import { AuthenticationException, UserNotFoundException } from '@/src/domain/exceptions';
import { UserInterface } from '@/types/types';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useUserUseCase } from './use-service-container';

/**
 * Converts a domain User entity to UserInterface for presentation layer.
 * This utility function ensures consistent conversion throughout the application.
 */
export function domainUserToInterface(domainUser: User): UserInterface {
  return {
    id: domainUser.id,
    email: domainUser.email,
    username: domainUser.username,
    image: domainUser.image,
    firstName: domainUser.firstName,
    lastName: domainUser.lastName,
  };
}

/**
 * Hook to manage current user state.
 * Handles fetching, caching, and error handling for the current authenticated user.
 *
 * @returns Object containing user state, setUser function, and loading status
 */
export function useCurrentUser() {
  const { status, data: session } = useSession();
  const userUseCase = useUserUseCase();
  const [user, setUser] = useState<UserInterface | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Fetches the current user from the API.
   * Handles authentication errors and signs out if necessary.
   */
  const fetchUser = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      setUser(null);
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await userUseCase.getCurrentUser();
      setUser(domainUserToInterface(currentUser));
    } catch (error) {
      if (error instanceof UserNotFoundException || error instanceof AuthenticationException) {
        // Authentication failed - sign out
        console.error('Authentication failed when fetching user:', error);
        signOut();
        setUser(null);
      } else {
        // For other errors, log but don't sign out
        console.error('Failed to fetch user:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [status, session, userUseCase]);

  /**
   * Updates the user state with new data.
   * Useful for optimistic updates after mutations.
   */
  const updateUser = useCallback((newUser: UserInterface | null) => {
    setUser(newUser);
  }, []);

  /**
   * Refetches the user from the API.
   * Useful when you need to refresh user data.
   */
  const refreshUser = useCallback(() => {
    return fetchUser();
  }, [fetchUser]);

  // Fetch user when authentication status changes
  useEffect(() => {
    if (status === 'authenticated' && !user && session?.user) {
      fetchUser();
    } else if (status !== 'authenticated') {
      setUser(null);
    }
  }, [status, user, session, fetchUser]);

  return {
    user,
    setUser: updateUser,
    refreshUser,
    isLoading,
  };
}
