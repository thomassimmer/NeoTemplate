'use client';

import { SnackbarOrigin } from '@mui/material';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

interface ToastContextInterface {
  showToast: boolean;
  toastTitle: string;
  toastCategory: string;
  toastMessage: string;
  toastPosition: SnackbarOrigin;
  toastDuration: number;
  setShowToast: Dispatch<SetStateAction<boolean>>;
  setToastTitle: Dispatch<SetStateAction<string>>;
  setToastCategory: Dispatch<SetStateAction<string>>;
  setToastMessage: Dispatch<SetStateAction<string>>;
  setToastPosition: Dispatch<SetStateAction<SnackbarOrigin>>;
  setToastDuration: Dispatch<SetStateAction<number>>;
}

const ToastContext = createContext({} as ToastContextInterface);

export default function ToastContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showToast, setShowToast] = useState(false);
  const [toastTitle, setToastTitle] = useState('Error');
  const [toastCategory, setToastCategory] = useState('error');
  const [toastMessage, setToastMessage] = useState('Error message');
  const [toastPosition, setToastPosition] = useState({
    vertical: 'top',
    horizontal: 'center',
  } as SnackbarOrigin);
  const [toastDuration, setToastDuration] = useState(3000);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        toastTitle,
        toastCategory,
        toastMessage,
        toastPosition,
        toastDuration,
        setShowToast,
        setToastTitle,
        setToastCategory,
        setToastMessage,
        setToastPosition,
        setToastDuration,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export const useToastContext = () => {
  return useContext(ToastContext);
};
