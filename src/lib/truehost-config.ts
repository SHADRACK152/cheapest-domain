/**
 * TrueHost Kenya Direct Integration Configuration
 * 
 * This file contains URL configurations for redirecting users directly
 * to TrueHost Kenya's website for domain registration.
 */

type UrlType = 'cartRegister' | 'domainSearch' | 'domainRegistration';

export const TRUEHOST_CONFIG = {
  // Base URL for TrueHost Kenya
  baseUrl: 'https://truehost.co.ke',
  
  // Domain registration URL patterns
  // Update these based on actual TrueHost URL structure
  urls: {
    // Option 1: Direct cart registration (most common for hosting providers)
    cartRegister: (domain: string) => 
      `https://truehost.co.ke/cart.php?a=add&domain=register&query=${encodeURIComponent(domain)}`,
    
    // Option 2: Domain search page (if TrueHost has a dedicated search page)
    domainSearch: (domain: string) => 
      `https://truehost.co.ke/domains?search=${encodeURIComponent(domain)}`,
    
    // Option 3: Main domain registration page
    domainRegistration: (domain: string) => 
      `https://truehost.co.ke/domain-registration?domain=${encodeURIComponent(domain)}`,
  },
  
  // Which URL pattern to use (change this to switch between options)
  activeUrl: 'cartRegister' as UrlType,
  
  // Whether to open in new tab or same tab
  openInNewTab: false,
};

/**
 * Get the TrueHost registration URL for a domain
 */
export function getTrueHostUrl(domain: string): string {
  const urlGenerator = TRUEHOST_CONFIG.urls[TRUEHOST_CONFIG.activeUrl];
  return urlGenerator(domain);
}

/**
 * Redirect to TrueHost for domain registration
 */
export function redirectToTrueHost(domain: string): void {
  const url = getTrueHostUrl(domain);
  
  if (TRUEHOST_CONFIG.openInNewTab) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
}
