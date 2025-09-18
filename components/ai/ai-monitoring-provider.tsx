"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AIMonitoringDashboard } from './ai-monitoring-dashboard';

interface AIMonitoringContextType {
  isVisible: boolean;
  toggleVisibility: () => void;
  showDashboard: () => void;
  hideDashboard: () => void;
}

const AIMonitoringContext = createContext<AIMonitoringContextType | undefined>(undefined);

export function AIMonitoringProvider({ children }: { children: React.ReactNode }) {
  const isDev = process.env.NODE_ENV === 'development';
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isDev) {
      return;
    }

    console.log('🧠 [AI Monitor] Dashboard active in development mode');
    setIsVisible(true);

    // Listen for keyboard shortcut to toggle dashboard
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isDev]);

  const toggleVisibility = () => {
    if (!isDev) return;
    setIsVisible(prev => !prev);
  };

  const showDashboard = () => {
    if (!isDev) return;
    setIsVisible(true);
  };

  const hideDashboard = () => {
    if (!isDev) return;
    setIsVisible(false);
  };

  const contextValue: AIMonitoringContextType = {
    isVisible,
    toggleVisibility,
    showDashboard,
    hideDashboard
  };

  return (
    <AIMonitoringContext.Provider value={contextValue}>
      {children}
      {isDev && isVisible && <AIMonitoringDashboard />}
      {isDev && <AIMonitoringToggle />}
    </AIMonitoringContext.Provider>
  );
}

export function useAIMonitoring() {
  const context = useContext(AIMonitoringContext);
  if (context === undefined) {
    throw new Error('useAIMonitoring must be used within an AIMonitoringProvider');
  }
  return context;
}

// Optional: Create a toggle button component for easy access
export function AIMonitoringToggle() {
  const { isVisible, toggleVisibility } = useAIMonitoring();
  
  const handleClick = () => {
    console.log('🧠 [AI Monitor] Toggle button clicked, isVisible:', isVisible);
    toggleVisibility();
  };
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-2xl hover:bg-purple-700 transition-all transform hover:scale-110 border-2 border-white"
      title={`${isVisible ? 'Hide' : 'Show'} AI Brain Monitor (Ctrl+Shift+A)`}
      style={{ fontSize: '18px' }}
    >
      🧠
    </button>
  );
}
