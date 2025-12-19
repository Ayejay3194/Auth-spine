'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export type ModalType = 'createUser' | 'editUser' | 'deleteUser' | 'createRole' | null;

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

export interface AppUIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  activeModal: ModalType;
  filters: Record<string, string | boolean>;
  notifications: Notification[];
}

interface AppContextType {
  ui: AppUIState;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setActiveModal: (modal: ModalType) => void;
  setFilter: (key: string, value: string | boolean) => void;
  clearFilters: () => void;
  addNotification: (message: string, type: NotificationType) => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ui, setUI] = useState<AppUIState>({
    theme: 'system',
    sidebarOpen: true,
    mobileNavOpen: false,
    activeModal: null,
    filters: {},
    notifications: [],
  });

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUI(prev => ({ ...prev, theme }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setUI(prev => ({ ...prev, sidebarOpen: open }));
  }, []);

  const setMobileNavOpen = useCallback((open: boolean) => {
    setUI(prev => ({ ...prev, mobileNavOpen: open }));
  }, []);

  const setActiveModal = useCallback((modal: ModalType) => {
    setUI(prev => ({ ...prev, activeModal: modal }));
  }, []);

  const setFilter = useCallback((key: string, value: string | boolean) => {
    setUI(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setUI(prev => ({ ...prev, filters: {} }));
  }, []);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      message,
      type,
      timestamp: new Date(),
    };
    
    setUI(prev => ({
      ...prev,
      notifications: [...prev.notifications, notification],
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setUI(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== id),
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

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
