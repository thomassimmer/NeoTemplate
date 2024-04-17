'use client';

import HomeConnected from '@/app/[locale]/home/connected';
import HomeDisconnected from '@/app/[locale]/home/disconnected';
import { CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useToastContext } from '../providers/toast-provider';

export default function Home({ searchParams }) {
  const { status } = useSession();

  const {
    setToastCategory,
    setToastMessage,
    setToastTitle,
    setShowToast,
    setToastDuration,
  } = useToastContext();

  useEffect(() => {
    if (searchParams) {
      if (searchParams.error) {
        setToastMessage(searchParams.error);
        setToastTitle('Error');
        setToastCategory('error');
        setShowToast(true);
        setToastDuration(3000);
      }
    }
  }, [
    searchParams,
    setShowToast,
    setToastMessage,
    setToastTitle,
    setToastCategory,
    setToastDuration,
  ]);

  return (
    <>
      {status === 'authenticated' ? (
        <HomeConnected />
      ) : status === 'unauthenticated' ? (
        <HomeDisconnected />
      ) : status === 'loading' ? (
        <CircularProgress />
      ) : (
        <></>
      )}
    </>
  );
}
