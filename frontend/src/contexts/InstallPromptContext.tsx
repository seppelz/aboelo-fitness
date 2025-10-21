import React, { createContext, useContext, useMemo } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

type InstallPromptContextValue = {
  canInstall: boolean;
  promptInstall: () => Promise<boolean>;
  isInstalled: boolean;
};

const defaultContext: InstallPromptContextValue = {
  canInstall: false,
  promptInstall: async () => false,
  isInstalled: false,
};

const InstallPromptContext = createContext<InstallPromptContextValue>(defaultContext);

export const InstallPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { canInstall, promptInstall, isInstalled } = useInstallPrompt();

  const value = useMemo(
    () => ({ canInstall, promptInstall, isInstalled }),
    [canInstall, promptInstall, isInstalled]
  );

  return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>;
};

export const useInstallPromptContext = () => useContext(InstallPromptContext);
