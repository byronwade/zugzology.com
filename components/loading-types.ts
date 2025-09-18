// Global type extension for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export {};