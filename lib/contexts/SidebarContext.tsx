'use client';

import { createContext, useContext, ReactNode } from 'react';

interface SidebarContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
  value: SidebarContextType;
}

export function SidebarProvider({ children, value }: SidebarProviderProps) {
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}