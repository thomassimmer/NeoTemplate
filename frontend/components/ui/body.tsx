'use client';

import { useTheme } from '@mui/material/styles';
import Footer from '../footer';
import ConnectionModal from '../modals/connection-modal';
import ContactModal from '../modals/contact-modal';
import Navbar from '../navbar';
import ToastMessage from './toast';

export default function Body({ children }) {
  const theme = useTheme();

  return (
    <>
      <ContactModal />
      <ConnectionModal />
      <ToastMessage />
      <Navbar />
      <main
        style={{
          position: 'relative',
          top: '4rem',
          minHeight: 'calc(100vh - 4rem)',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: theme.palette.background.paper,
        }}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
