import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Verfügbare Schriftgrößen für Senioren
const fontSizes = {
  normal: 16,
  large: 20,
  extraLarge: 24,
};

// Verfügbare Kontraststufen
const contrastLevels = {
  normal: {
    primary: '#1976d2',
    secondary: '#f50057',
    background: '#ffffff',
    text: '#333333',
  },
  high: {
    primary: '#0d47a1',
    secondary: '#c51162',
    background: '#ffffff',
    text: '#000000',
  },
};

interface ThemeContextType {
  fontSize: keyof typeof fontSizes;
  setFontSize: (size: keyof typeof fontSizes) => void;
  contrastLevel: keyof typeof contrastLevels;
  setContrastLevel: (level: keyof typeof contrastLevels) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  fontSize: 'normal',
  setFontSize: () => {},
  contrastLevel: 'normal',
  setContrastLevel: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Gespeicherte Einstellungen abrufen oder Standardwerte verwenden
  const [fontSize, setFontSize] = useState<keyof typeof fontSizes>(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return (savedFontSize as keyof typeof fontSizes) || 'normal';
  });

  const [contrastLevel, setContrastLevel] = useState<keyof typeof contrastLevels>(() => {
    const savedContrastLevel = localStorage.getItem('contrastLevel');
    return (savedContrastLevel as keyof typeof contrastLevels) || 'normal';
  });

  // Einstellungen speichern
  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('contrastLevel', contrastLevel);
  }, [contrastLevel]);

  // Material UI Theme mit den ausgewählten Einstellungen erstellen
  const theme = createTheme({
    palette: {
      primary: {
        main: contrastLevels[contrastLevel].primary,
      },
      secondary: {
        main: contrastLevels[contrastLevel].secondary,
      },
      background: {
        default: contrastLevels[contrastLevel].background,
      },
      text: {
        primary: contrastLevels[contrastLevel].text,
      },
    },
    typography: {
      fontSize: fontSizes[fontSize],
      button: {
        fontSize: fontSizes[fontSize] * 1.1,
      },
      h1: {
        fontSize: fontSizes[fontSize] * 2.5,
      },
      h2: {
        fontSize: fontSizes[fontSize] * 2,
      },
      h3: {
        fontSize: fontSizes[fontSize] * 1.75,
      },
      h4: {
        fontSize: fontSizes[fontSize] * 1.5,
      },
      h5: {
        fontSize: fontSizes[fontSize] * 1.25,
      },
      h6: {
        fontSize: fontSizes[fontSize] * 1.1,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            padding: '12px 20px',
            borderRadius: '8px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              fontSize: fontSizes[fontSize],
              padding: '12px 16px',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        fontSize,
        setFontSize,
        contrastLevel,
        setContrastLevel,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
