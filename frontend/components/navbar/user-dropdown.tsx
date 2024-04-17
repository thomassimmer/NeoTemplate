'use client';

import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import { Menu, MenuItem, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/button';
import UserImage from './user-image';

export default function UserDropdown() {
  const router = useRouter();
  const theme = useTheme();

  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Button
        sx={{
          padding: 0,
          width: '40px',
          minWidth: 'unset',
          height: '40px',
        }}
        aria-describedby={'menu'}
        variant='contained'
        onClick={handleClick}
      >
        <UserImage />
      </Button>
      <Menu
        id={'menu'}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        sx={{ mt: 1 }}
        MenuListProps={{ sx: { py: 0 } }}
      >
        <Stack>
          <MenuItem
            sx={{
              px: 2,
              py: 1,
              borderRadius: 0,
              backgroundColor: theme.palette.text.secondary,

              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
            onClick={() => {
              router.push('/account');
              handleClose();
            }}
          >
            <PersonIcon sx={{ mr: 2 }} />
            {t('Account')}
          </MenuItem>

          <MenuItem
            sx={{
              px: 2,
              py: 1,
              borderRadius: 0,
              backgroundColor: theme.palette.text.secondary,

              '&:hover': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
            onClick={() => {
              signOut();
              handleClose();
            }}
          >
            <LogoutIcon sx={{ mr: 2 }} />
            {t('Logout')}
          </MenuItem>
        </Stack>
      </Menu>
    </>
  );
}
