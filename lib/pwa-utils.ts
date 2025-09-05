/**
 * PWA and Wallet Detection Utilities
 */

export interface PWAInfo {
  isPWA: boolean;
  isStandalone: boolean;
  isMobile: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

/**
 * Detect if the app is running as a PWA
 */
export function detectPWAContext(): PWAInfo {
  if (typeof window === 'undefined') {
    return {
      isPWA: false,
      isStandalone: false,
      isMobile: false,
      platform: 'unknown',
    };
  }

  // Check if running in standalone mode (PWA)
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // Detect mobile devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // Detect platform
  let platform: PWAInfo['platform'] = 'unknown';
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    platform = 'ios';
  } else if (/Android/.test(navigator.userAgent)) {
    platform = 'android';
  } else {
    platform = 'desktop';
  }

  const isPWA =
    isStandalone || window.location.href.includes('mode=standalone');

  return {
    isPWA,
    isStandalone,
    isMobile,
    platform,
  };
}

/**
 * Detect available wallets with PWA context awareness
 */
export function detectWalletsInPWA() {
  const pwaInfo = detectPWAContext();
  const detectedWallets: Array<{
    name: string;
    detected: boolean;
    available: boolean;
    installUrl?: string;
    deepLinkUrl?: string;
    reason?: string;
  }> = [];

  if (typeof window === 'undefined') {
    return { wallets: detectedWallets, pwaInfo };
  }

  // Phantom Wallet Detection
  const phantomDetected = !!(window as any).phantom?.solana;

  if (pwaInfo.isPWA && pwaInfo.isMobile) {
    // In mobile PWA, browser extensions aren't available
    detectedWallets.push({
      name: 'Phantom',
      detected: false,
      available: true,
      deepLinkUrl:
        'https://phantom.app/ul/browse/' +
        encodeURIComponent(window.location.origin),
      installUrl:
        pwaInfo.platform === 'ios'
          ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
          : 'https://play.google.com/store/apps/details?id=app.phantom',
      reason:
        pwaInfo.platform === 'ios'
          ? 'Install Phantom mobile app from App Store'
          : 'Install Phantom mobile app from Play Store',
    });
  } else if (pwaInfo.isPWA && !pwaInfo.isMobile) {
    // Desktop PWA - extensions might not be available
    detectedWallets.push({
      name: 'Phantom',
      detected: phantomDetected,
      available: phantomDetected,
      installUrl: 'https://phantom.app/',
      reason: phantomDetected
        ? 'Phantom extension detected'
        : 'Install Phantom browser extension, then restart the PWA',
    });
  } else {
    // Regular browser context
    detectedWallets.push({
      name: 'Phantom',
      detected: phantomDetected,
      available: true,
      installUrl: 'https://phantom.app/',
      reason: phantomDetected
        ? 'Phantom extension detected'
        : 'Install Phantom browser extension',
    });
  }

  // Solflare Detection
  const solflareDetected = !!(window as any).solflare;
  if (pwaInfo.isPWA && pwaInfo.isMobile) {
    detectedWallets.push({
      name: 'Solflare',
      detected: false,
      available: true,
      deepLinkUrl: 'https://solflare.com/access-wallet',
      installUrl:
        pwaInfo.platform === 'ios'
          ? 'https://apps.apple.com/app/solflare/id1580902717'
          : 'https://play.google.com/store/apps/details?id=com.solflare.mobile',
      reason: 'Use Solflare mobile app',
    });
  } else {
    detectedWallets.push({
      name: 'Solflare',
      detected: solflareDetected,
      available: solflareDetected || !pwaInfo.isPWA,
      installUrl: 'https://solflare.com/',
      reason: solflareDetected
        ? 'Solflare detected'
        : 'Install Solflare extension',
    });
  }

  return { wallets: detectedWallets, pwaInfo };
}

/**
 * Get wallet connection instructions based on PWA context
 */
export function getWalletInstructions(pwaInfo: PWAInfo) {
  if (pwaInfo.isPWA && pwaInfo.isMobile) {
    return {
      title: 'Connect Mobile Wallet',
      instructions: [
        'Install a Solana wallet app on your phone',
        'Open the wallet app',
        "Use the wallet's browser or scan QR codes to connect",
        'Some wallets support deep linking from PWAs',
      ],
      note: 'Mobile PWAs work best with dedicated wallet apps rather than browser extensions.',
    };
  } else if (pwaInfo.isPWA && !pwaInfo.isMobile) {
    return {
      title: 'Connect Desktop Wallet',
      instructions: [
        'Install wallet browser extensions in your main browser',
        'Extensions may not work in PWA mode',
        'Consider using the web version for full wallet support',
        'Or use WalletConnect-compatible wallets',
      ],
      note: 'Desktop PWAs have limited access to browser extensions. Use the web version for full compatibility.',
    };
  } else {
    return {
      title: 'Connect Browser Wallet',
      instructions: [
        'Install a wallet browser extension',
        'Refresh the page after installation',
        'Click connect to authorize the wallet',
        'Approve the connection in your wallet',
      ],
      note: 'Browser extensions work best in regular browser mode.',
    };
  }
}

/**
 * Open wallet app via deep link (mobile PWA)
 */
export function openWalletApp(walletName: string, pwaInfo: PWAInfo) {
  if (!pwaInfo.isMobile) {
    return false;
  }

  const currentUrl = window.location.origin;

  switch (walletName.toLowerCase()) {
    case 'phantom':
      // Phantom deep link
      const phantomUrl = `phantom://browse/${encodeURIComponent(currentUrl)}`;
      window.location.href = phantomUrl;

      // Fallback to app store after a delay
      setTimeout(() => {
        const storeUrl =
          pwaInfo.platform === 'ios'
            ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
            : 'https://play.google.com/store/apps/details?id=app.phantom';
        window.open(storeUrl, '_blank');
      }, 2000);

      return true;

    case 'solflare':
      // Solflare deep link
      const solflareUrl = `solflare://browse/${encodeURIComponent(currentUrl)}`;
      window.location.href = solflareUrl;

      setTimeout(() => {
        const storeUrl =
          pwaInfo.platform === 'ios'
            ? 'https://apps.apple.com/app/solflare/id1580902717'
            : 'https://play.google.com/store/apps/details?id=com.solflare.mobile';
        window.open(storeUrl, '_blank');
      }, 2000);

      return true;

    default:
      return false;
  }
}
