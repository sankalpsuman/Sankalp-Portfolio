import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isOffline: boolean;
  showIOSModal: boolean;
  setShowIOSModal: (show: boolean) => void;
  promptInstall: () => Promise<void>;
  dismissIOSModal: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      const isAppMode = isStandaloneMedia || isIOSStandalone || isAndroidApp;
      
      setIsInstalled(isAppMode);
      return isAppMode;
    };

    const alreadyInstalled = checkStandalone();

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPhone|iPad|iPod/.test(ua) && !(window as any).MSStream;
    const isSafariBrowser = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);
    setIsIOS(isIOSDevice);

    // If iOS and not installed yet, mark as installable via iOS instructions
    if (isIOSDevice && !alreadyInstalled) {
      const iosDismissed = localStorage.getItem('pwa_ios_modal_dismissed') === 'true';
      if (!iosDismissed) {
        setIsInstallable(true);
      }
    }

    // Capture beforeinstallprompt event for Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(installEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA App was successfully installed!');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Online / Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const promptInstall = async () => {
    // If running on iOS Safari, show the iOS custom modal
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // If standard Chrome/Android install prompt is ready
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      setDeferredPrompt(null);
    } else {
      // Fallback if prompt is triggered manually
      setShowIOSModal(true);
    }
  };

  const dismissIOSModal = () => {
    setShowIOSModal(false);
    localStorage.setItem('pwa_ios_modal_dismissed', 'true');
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isIOS,
        isOffline,
        showIOSModal,
        setShowIOSModal,
        promptInstall,
        dismissIOSModal
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
