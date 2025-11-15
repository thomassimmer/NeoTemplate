/**
 * Accessible error message list component.
 */

'use client';

import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ErrorMessageListProps {
  errors: string[];
  title?: string;
  id?: string;
  role?: 'alert' | 'status';
}

export default function ErrorMessageList({
  errors,
  title = 'Please correct the following errors:',
  id,
  role = 'alert',
}: ErrorMessageListProps) {
  const theme = useTheme();

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <Alert
      severity='error'
      role={role}
      id={id}
      sx={{
        width: '100%',
        mt: 1,
        '& .MuiAlert-icon': {
          color: theme.palette.error.main,
        },
      }}
    >
      <AlertTitle>{title}</AlertTitle>
      <List dense disablePadding>
        {errors.map((error, index) => (
          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
            <ListItemText
              primary={error}
              primaryTypographyProps={{
                variant: 'body2',
                component: 'span',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
}

