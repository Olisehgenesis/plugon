'use client';

import { useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

/**
 * MiniAppInit component handles Farcaster MiniApp initialization
 * Must call sdk.actions.ready() to hide splash screen
 */
export function MiniAppInit() {
  useEffect(() => {
    // Call ready() as soon as the app is loaded to hide splash screen
    // This is required for Mini Apps to display properly
    const initMiniApp = async () => {
      try {
        await sdk.actions.ready();
        console.log('Mini App ready');
      } catch (error) {
        console.error('Failed to initialize Mini App:', error);
      }
    };

    initMiniApp();
  }, []);

  return null; // This component doesn't render anything
}

