'use client';

import { useUserContext } from '@/app/providers/user-provider';
import UserDropdown from '@/components/navbar/user-dropdown';
import NotConnectedUserDropdown from './not-connected-user-dropdown';
import { useSession } from 'next-auth/react';

export default function LeftButton() {
  const { user } = useUserContext();
  const { status } = useSession();

  return (
    <>
      {status === 'authenticated' ? (
        <UserDropdown />
      ) : status === 'unauthenticated' ? (
        <NotConnectedUserDropdown />
      ) : (
        <></>
      )}
    </>
  );
}
