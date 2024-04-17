'use client';

import { useRefreshToken } from '@/lib/hooks/use-refresh-token';
import { axiosPublic } from 'lib/axios';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

const useAxiosAuth = () => {
  const refresh_token = useRefreshToken();

  const { data: session }: { data: any } = useSession();

  useEffect(() => {
    const requestIntercept = axiosPublic.interceptors.request.use(
      (config) => {
        if (session?.user?.access && !config.headers['Authorization']) {
          config.headers['Authorization'] = `Bearer ${session?.user?.access}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPublic.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;

        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;

          await refresh_token();

          prevRequest.headers[
            'Authorization'
          ] = `Bearer ${session?.user.access}`;

          return axiosPublic(prevRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosPublic.interceptors.request.eject(requestIntercept);
      axiosPublic.interceptors.response.eject(responseIntercept);
    };
  }, [session, refresh_token]);

  return axiosPublic;
};

export default useAxiosAuth;
