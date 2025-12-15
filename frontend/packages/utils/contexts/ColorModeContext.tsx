'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

type ContextType = {
  colorMode: 'light' | 'dark';
  toggleColorMode: () => void;
};

export const ColorContext = createContext<ContextType>({
  colorMode: 'light',
  toggleColorMode: () => {},
});

export const ColorModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const systemColorScheme = useColorScheme();
  const [colorMode, setColorMode] = useState<'light' | 'dark'>(
    systemColorScheme || 'light'
  );

  // Update color mode when system preference changes
  useEffect(() => {
    if (systemColorScheme) {
      setColorMode(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleColorMode = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ColorContext.Provider value={{ colorMode, toggleColorMode }}>
      {children}
    </ColorContext.Provider>
  );
};

export const useColorMode = () => {
  const context = useContext(ColorContext);

  if (!context) {
    throw new Error('useColorMode must be used within a ColorModeProvider');
  }

  return context;
};
