'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ModalType = 'createUser' | 'editUser' | 'deleteUser' | 'killSwitch' | null;

export interface AppUIState {
  theme: Theme;
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  activeModal: ModalType;
  filters: Record<string, string | boolean>;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
}

export interface AppContextType {
  ui: AppUIState;
  setTheme: (theme: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setActiveModal: (modal: ModalType) => void;
  setFilter: (key: string, value: string | boolean) => void;
  clearFilters: () => void;
  addNotification: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUIState: AppUIState = {
  theme: 'system',
  sidebarOpen: true,
  mobileNavOpen: false,
  activeModal: null,
  filters: {},
  notifications: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [ui, setUI] = useState<AppUIState>(initialUIState);

  const setTheme = useCallback((theme: Theme) => {
    setUI((prev) => ({ ...prev, theme }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setUI((prev) => ({ ...prev, sidebarOpen: open }));
  }, []);

  const setMobileNavOpen = useCallback((open: boolean) => {
    setUI((prev) => ({ ...prev, mobileNavOpen: open }));
  }, []);

  const setActiveModal = useCallback((modal: ModalType) => {
    setUI((prev) => ({ ...prev, activeModal: modal }));
  }, []);

  const setFilter = useCallback((key: string, value: string | boolean) => {
    setUI((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setUI((prev) => ({ ...prev, filters: {} }));
  }, []);

  const addNotification = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
      const id = Date.now().toString();
      setUI((prev) => ({
        ...prev,
        notifications: [...prev.notifications, { id, message, type }],
      }));
      setTimeout(() => removeNotification(id), 5000);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setUI((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const value: AppContextType = {
    ui,
    setTheme,
    setSidebarOpen,
    setMobileNavOpen,
    setActiveModal,
    setFilter,
    clearFilters,
    addNotification,
    removeNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
