'use client';

import { useEffect } from 'react';

/**
 * Adds Mini App embed meta tags to the document head
 * These tags make the app shareable in Farcaster feeds
 */
export function MetaTags() {
  useEffect(() => {
    // Mini App Embed metadata for sharing
    const miniappEmbed = {
      version: "1",
      imageUrl: `${window.location.origin}/og-image.svg`,
      button: {
        title: "🔌 Plug It",
        action: {
          type: "launch_miniapp",
          name: "Plug It",
          url: window.location.origin,
          splashImageUrl: `${window.location.origin}/icon.svg`,
          splashBackgroundColor: "#2563eb"
        }
      }
    };

    // Remove existing meta tags if they exist
    const existingMiniapp = document.querySelector('meta[name="fc:miniapp"]');
    const existingFrame = document.querySelector('meta[name="fc:frame"]');
    
    if (existingMiniapp) existingMiniapp.remove();
    if (existingFrame) existingFrame.remove();

    // Add fc:miniapp meta tag
    const miniappMeta = document.createElement('meta');
    miniappMeta.name = 'fc:miniapp';
    miniappMeta.content = JSON.stringify(miniappEmbed);
    document.head.appendChild(miniappMeta);

    // Add fc:frame meta tag for backward compatibility
    const frameMeta = document.createElement('meta');
    frameMeta.name = 'fc:frame';
    frameMeta.content = JSON.stringify(miniappEmbed);
    document.head.appendChild(frameMeta);

    return () => {
      // Cleanup on unmount
      if (document.querySelector('meta[name="fc:miniapp"]')) {
        document.querySelector('meta[name="fc:miniapp"]')?.remove();
      }
      if (document.querySelector('meta[name="fc:frame"]')) {
        document.querySelector('meta[name="fc:frame"]')?.remove();
      }
    };
  }, []);

  return null;
}

