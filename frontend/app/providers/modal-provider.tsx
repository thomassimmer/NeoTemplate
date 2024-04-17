'use client';

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useUserContext } from './user-provider';

interface ModalContextInterface {
  signInFormIsVisible: boolean;
  signInClicked: boolean;
  showSignInModal: boolean;
  showContactModal: boolean;
  resetPasswordFormIsVisible: boolean;
  showSignInForm: Dispatch<SetStateAction<boolean>>;
  setShowSignInModal: Dispatch<SetStateAction<boolean>>;
  setShowContactModal: Dispatch<SetStateAction<boolean>>;
  setSignInClicked: Dispatch<SetStateAction<boolean>>;
  showResetPasswordForm: Dispatch<SetStateAction<boolean>>;
}

const ModalContext = createContext({} as ModalContextInterface);

export default function ModalContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUserContext();

  const [signInFormIsVisible, showSignInForm] = useState(true);
  const [signInClicked, setSignInClicked] = useState(false);
  const [resetPasswordFormIsVisible, showResetPasswordForm] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (user) {
      setShowSignInModal(false);
    }
  }, [user]);

  return (
    <ModalContext.Provider
      value={{
        signInFormIsVisible,
        signInClicked,
        resetPasswordFormIsVisible,
        showSignInModal,
        showContactModal,
        showSignInForm,
        setShowSignInModal,
        setShowContactModal,
        setSignInClicked,
        showResetPasswordForm,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModalContext = () => {
  return useContext(ModalContext);
};
