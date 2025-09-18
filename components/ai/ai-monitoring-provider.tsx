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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the dashboard based on environment or user preference
    const isDev = process.env.NODE_ENV === 'development';
    const localStorageEnabled = localStorage.getItem('ai-monitoring-enabled') === 'true';
    const urlParamEnabled = new URLSearchParams(window.location.search).get('ai-monitor') === 'true';
    
    console.log('🧠 [AI Monitor] Environment check:', { 
      isDev, 
      localStorageEnabled, 
      urlParamEnabled,
      NODE_ENV: process.env.NODE_ENV 
    });
    
    // Only show in development environment, ignore localStorage and URL params for production
    const shouldShow = isDev;
    
    if (shouldShow) {
      console.log('🧠 [AI Monitor] Dashboard will be shown');
      setIsVisible(true);
    } else {
      console.log('🧠 [AI Monitor] Dashboard will be hidden');
    }

    // Listen for keyboard shortcut to toggle dashboard
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setIsVisible(prev => {
          const newValue = !prev;
          localStorage.setItem('ai-monitoring-enabled', newValue.toString());
          return newValue;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const toggleVisibility = () => {
    setIsVisible(prev => {
      const newValue = !prev;
      localStorage.setItem('ai-monitoring-enabled', newValue.toString());
      return newValue;
    });
  };

  const showDashboard = () => {
    setIsVisible(true);
    localStorage.setItem('ai-monitoring-enabled', 'true');
  };

  const hideDashboard = () => {
    setIsVisible(false);
    localStorage.setItem('ai-monitoring-enabled', 'false');
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
      {isVisible && <AIMonitoringDashboard />}
      <AIMonitoringToggle />
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