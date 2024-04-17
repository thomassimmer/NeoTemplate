'use client';

import { axiosPublic } from 'lib/axios';
import { signOut, useSession } from 'next-auth/react';

export const useRefreshToken = () => {
  const { data: session }: { data: any } = useSession();

  const refresh_token = async () => {
    if (session && session.user && session.user.refresh) {
      const res = await axiosPublic.post('/api/auth/token/refresh/', {
        refresh: session.user.refresh,
      });

      session.user.access = res.data.access;
    } else {
      signOut();
    }
  };
  return refresh_token;
};
