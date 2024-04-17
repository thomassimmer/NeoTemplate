'use client';

import Account from '@/app/[locale]/account/components/account';
import { CircularProgress } from '@mui/material';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

export default function AccountPage() {
  const { status } = useSession();

  if (status === 'unauthenticated') {
    return redirect('/');
  }

  return (
    <>
      {status === 'loading' ? (
        <CircularProgress sx={{ alignSelf: 'center' }} />
      ) : (
        <Account />
      )}
    </>
  );
}
