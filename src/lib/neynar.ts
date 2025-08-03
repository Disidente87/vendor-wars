import { getNeynarConfig } from '@/config/neynar';

// Configuration to enable/disable real API integration
const USE_REAL_API = false; // Set to true when API is properly configured

export interface NeynarUser {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
  verified_addresses?: string[];
}

// Mock implementation for development
function getMockUser(fid: number): NeynarUser {
  return {
    fid,
    username: `user_${fid}`,
    display_name: `User ${fid}`,
    pfp_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fid}`,
    follower_count: Math.floor(Math.random() * 1000),
    following_count: Math.floor(Math.random() * 500),
    verified_addresses: [],
  };
}

export async function getNeynarUser(fid: number): Promise<NeynarUser | null> {
  if (!USE_REAL_API) {
    // Return mock data for development
    return getMockUser(fid);
  }

  try {
    // TODO: Implement real Neynar API integration
    // This will be implemented once the API methods are properly documented
    console.log('Real API integration not yet implemented');
    return getMockUser(fid);
  } catch (error) {
    console.error('Error fetching Neynar user:', error);
    return null;
  }
}

export async function getNeynarUserByUsername(username: string): Promise<NeynarUser | null> {
  if (!USE_REAL_API) {
    // Return mock data for development
    const mockFid = Math.floor(Math.random() * 10000);
    return getMockUser(mockFid);
  }

  try {
    // TODO: Implement real Neynar API integration
    console.log('Real API integration not yet implemented');
    const mockFid = Math.floor(Math.random() * 10000);
    return getMockUser(mockFid);
  } catch (error) {
    console.error('Error fetching Neynar user by username:', error);
    return null;
  }
}

export async function getNeynarUserFollowers(fid: number, limit: number = 50): Promise<NeynarUser[]> {
  if (!USE_REAL_API) {
    // Return mock data for development
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 1000 + i)
    );
  }

  try {
    // TODO: Implement real Neynar API integration
    console.log('Real API integration not yet implemented');
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 1000 + i)
    );
  } catch (error) {
    console.error('Error fetching Neynar user followers:', error);
    return [];
  }
}

export async function getNeynarUserFollowing(fid: number, limit: number = 50): Promise<NeynarUser[]> {
  if (!USE_REAL_API) {
    // Return mock data for development
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 2000 + i)
    );
  }

  try {
    // TODO: Implement real Neynar API integration
    console.log('Real API integration not yet implemented');
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 2000 + i)
    );
  } catch (error) {
    console.error('Error fetching Neynar user following:', error);
    return [];
  }
}

export async function publishCast(params: {
  text: string;
  embeds?: string[];
  replyTo?: string;
  signerUuid?: string;
}): Promise<{ success: boolean; castHash?: string; error?: string }> {
  if (!USE_REAL_API) {
    // Mock cast publishing
    console.log('Mock cast publishing:', params);
    return {
      success: true,
      castHash: `mock_cast_${Date.now()}`,
    };
  }

  try {
    // TODO: Implement real Neynar API integration
    console.log('Real API integration not yet implemented');
    return {
      success: true,
      castHash: `mock_cast_${Date.now()}`,
    };
  } catch (error) {
    console.error('Error publishing cast:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish cast',
    };
  }
}

export async function sendNeynarMiniAppNotification(params: {
  fid: number;
  title: string;
  body: string;
  url?: string;
}): Promise<{ state: 'success' | 'error' | 'rate_limit'; error?: string }> {
  if (!USE_REAL_API) {
    // Mock notification
    console.log('Mock notification:', params);
    return { state: 'success' };
  }

  try {
    // TODO: Implement real Neynar API integration
    console.log('Real API integration not yet implemented');
    return { state: 'success' };
  } catch (error) {
    return { 
      state: 'error', 
      error: error instanceof Error ? error.message : 'Failed to send notification' 
    };
  }
}

// Utility function to check if a user is verified
export function isUserVerified(user: NeynarUser): boolean {
  return Boolean(user.verified_addresses && user.verified_addresses.length > 0);
}

// Utility function to get user's primary verified address
export function getPrimaryVerifiedAddress(user: NeynarUser): string | null {
  return user.verified_addresses?.[0] || null;
}

// Function to enable real API integration
export function enableRealApi() {
  console.log('To enable real API integration:');
  console.log('1. Set USE_REAL_API = true in src/lib/neynar.ts');
  console.log('2. Ensure NEYNAR_API_KEY and SIGNER_UUID are configured');
  console.log('3. Update the API methods based on the latest Neynar SDK documentation');
} 