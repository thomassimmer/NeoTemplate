'use client';

import { CssBaseline, PaletteMode } from '@mui/material';
import { green, grey } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface ColorModeContextInterface {
  mode: PaletteMode;
  setMode: Dispatch<SetStateAction<PaletteMode>>;
}

const ColorModeContext = createContext({} as ColorModeContextInterface);

export default function ColorModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    const storedMode = window.localStorage.getItem('selectedMode');
    if (storedMode) {
      setMode(storedMode as PaletteMode);
    }
  }, []);

  const mainColor = green;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
              // palette values for light mode
              primary: mainColor,
              secondary: grey,
              divider: mainColor[700],
              background: {
                default: mainColor[50],
                paper: `linear-gradient(${mainColor[50]}, ${mainColor[100]})`,
              },
              text: {
                primary: '#000',
                secondary: '#fff',
              },
            }
            : {
              // palette values for dark mode
              primary: mainColor,
              secondary: grey,
              divider: mainColor[700],
              background: {
                default: grey[800],
                paper: `linear-gradient(${grey[800]}, ${grey[900]})`,
              },
              text: {
                primary: '#fff',
                secondary: '#000',
              },
            }),
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(','),
          fontSize: 14,
          fontWeightLight: 500,
          fontWeightRegular: 400,
          fontWeightMedium: 400,
          h1: {
            fontSize: '2.5rem',
            '@media (min-width:600px)': {
              fontSize: '5rem',
            },
          },
          h2: {
            fontSize: '1.5rem',
            '@media (min-width:600px)': {
              fontSize: '3rem',
            },
          },
          h3: {
            fontSize: '1rem',
            '@media (min-width:600px)': {
              fontSize: '1.5rem',
            },
          }
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, setMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export const useColorModeContext = () => {
  return useContext(ColorModeContext);
};
