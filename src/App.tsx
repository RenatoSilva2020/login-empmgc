import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import WelcomeScreen from './components/WelcomeScreen';
import InstructionsScreen from './components/InstructionsScreen';
import InstallingScreen from './components/InstallingScreen';
import { CONFIG } from './config';

export default function App() {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [hasInstalled, setHasInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [useBrowserMode, setUseBrowserMode] = useState(() => {
    return localStorage.getItem('useBrowserMode') === 'true';
  });

  useEffect(() => {
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      setIsStandalone(!!isStandaloneMode);
    };

    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setHasInstalled(true);
      setIsInstalling(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalling(true);
      setTimeout(() => {
        setIsInstalling(false);
        setHasInstalled(true);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 font-sans overflow-hidden bg-slate-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-200/40 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-200/40 blur-[120px] animate-pulse delay-1000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-blue-200/40 blur-[120px] animate-pulse delay-2000" />
      </div>

      {isStandalone || isIOS || useBrowserMode ? (
        <LoginScreen />
      ) : hasInstalled ? (
        <InstructionsScreen />
      ) : isInstalling ? (
        <InstallingScreen />
      ) : (
        <WelcomeScreen 
          onInstall={handleInstall} 
          isIOS={isIOS} 
          canInstall={!!deferredPrompt} 
          onUseInBrowser={() => {
            localStorage.setItem('useBrowserMode', 'true');
            setUseBrowserMode(true);
          }}
        />
      )}
    </div>
  );
}
