'use client';

import { useUserContext } from '@/app/providers/user-provider';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';
import Image from 'next/image';

export default function UserImage() {
  const theme = useTheme();

  const { user }: any = useUserContext();

  return (
    <>
      {user && user.image ? (
        <Image
          alt={'Profile picture'}
          src={user.image}
          width={40}
          height={40}
          style={{
            borderRadius: '9999px',
            border: '1px solid',
            borderColor: theme.palette.background.default,
          }}
        />
      ) : (
        <PersonIcon aria-hidden='true' />
      )}
    </>
  );
}
