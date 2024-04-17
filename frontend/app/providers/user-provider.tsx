'use client';

import useAxiosAuth from '@/lib/hooks/use-axios-auth';
import { UserInterface } from '@/types/types';
import { AxiosError } from 'axios';
import { signOut, useSession } from 'next-auth/react';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  const axiosPublic = useAxiosAuth();

  const { status, data: session }: any = useSession();

  const [user, setUser] = useState<UserInterface | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      const fetchUser = async () => {
        try {
          const response = await axiosPublic.get(`/api/users/?me=1`);
          const newUserInfo: UserInterface = response.data[0];
          setUser(newUserInfo);
        } catch (error: any) {
          if (error instanceof AxiosError) {
            if (
              error.response?.data &&
              error.response.data.code == 'user_not_found'
            ) {
              signOut();
              return;
            }
          }
          throw error;
        }
      };

      if (!user) {
        fetchUser();
      }
    } else {
      setUser(null);
    }
  }, [status, session, user, axiosPublic]);

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
