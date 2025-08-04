export const NEYNAR_CONFIG = {
  API_KEY: process.env.NEYNAR_API_KEY || '',
  SIGNER_UUID: process.env.SIGNER_UUID || '',
  HUB_URL: process.env.NEXT_PUBLIC_HUB_URL || 'https://nemes.farcaster.xyz:2283',
} as const;

// Validation function to check if Neynar is properly configured
export function isNeynarConfigured(): boolean {
  return !!(NEYNAR_CONFIG.API_KEY && NEYNAR_CONFIG.SIGNER_UUID);
}

// Get configuration with validation
export function getNeynarConfig() {
  // Only throw error in production
  if (process.env.NODE_ENV === 'production' && !isNeynarConfigured()) {
    throw new Error('Neynar API not properly configured. Please check NEYNAR_API_KEY and SIGNER_UUID in your environment variables.');
  }
  
  return NEYNAR_CONFIG;
} 