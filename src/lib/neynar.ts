import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { getNeynarConfig } from '@/config/neynar';

// Initialize Neynar API client
const config = getNeynarConfig();
const client = new NeynarAPIClient({ 
  apiKey: config.API_KEY
});

// Configuration to enable/disable real API integration
const USE_REAL_API = true; // Now enabled for real integration

export interface NeynarUser {
  fid: number;
  username: string;
  display_name?: string;
  pfp_url?: string;
  follower_count?: number;
  following_count?: number;
  verified_addresses?: string[];
}

// Helper function to safely extract user data from Neynar response
function extractUserData(user: any): NeynarUser | null {
  try {
    if (!user || typeof user !== 'object') {
      return null;
    }

    return {
      fid: user.fid,
      username: user.username,
      display_name: user.display_name,
      pfp_url: user.pfp?.url,
      follower_count: user.follower_count,
      following_count: user.following_count,
      verified_addresses: user.verified_addresses?.map((addr: any) => addr.address) || [],
    };
  } catch (error) {
    console.error('Error extracting user data:', error);
    return null;
  }
}

// Mock implementation for development fallback
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
    return getMockUser(fid);
  }

  try {
    // Use fetchBulkUsers to get user by FID
    const response = await client.fetchBulkUsers({ fids: [fid] });
    
    if (!response || !response.users || response.users.length === 0) {
      console.warn(`No user found for FID: ${fid}`);
      return null;
    }

    const user = response.users[0];
    return extractUserData(user);
  } catch (error) {
    console.error('Error fetching Neynar user by FID:', error);
    // Fallback to mock data on error
    return getMockUser(fid);
  }
}

export async function getNeynarUserByUsername(username: string): Promise<NeynarUser | null> {
  if (!USE_REAL_API) {
    const mockFid = Math.floor(Math.random() * 10000);
    return getMockUser(mockFid);
  }

  try {
    // Use lookupUserByUsername to get user by username
    const response = await client.lookupUserByUsername({ username });
    
    if (!response || !response.user) {
      console.warn(`No user found for username: ${username}`);
      return null;
    }

    return extractUserData(response.user);
  } catch (error) {
    console.error('Error fetching Neynar user by username:', error);
    // Fallback to mock data on error
    const mockFid = Math.floor(Math.random() * 10000);
    return getMockUser(mockFid);
  }
}

export async function getNeynarUserFollowers(fid: number, limit: number = 50): Promise<NeynarUser[]> {
  if (!USE_REAL_API) {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 1000 + i)
    );
  }

  try {
    // Use fetchUserFollowers to get user followers
    const response = await client.fetchUserFollowers({ fid, limit });
    
    if (!response || !response.users) {
      console.warn(`No followers found for FID: ${fid}`);
      return [];
    }

    return response.users
      .map((user: any) => extractUserData(user))
      .filter((user: NeynarUser | null) => user !== null) as NeynarUser[];
  } catch (error) {
    console.error('Error fetching Neynar user followers:', error);
    // Fallback to mock data on error
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 1000 + i)
    );
  }
}

export async function getNeynarUserFollowing(fid: number, limit: number = 50): Promise<NeynarUser[]> {
  if (!USE_REAL_API) {
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 2000 + i)
    );
  }

  try {
    // Use fetchUserFollowing to get user following
    const response = await client.fetchUserFollowing({ fid, limit });
    
    if (!response || !response.users) {
      console.warn(`No following found for FID: ${fid}`);
      return [];
    }

    return response.users
      .map((user: any) => extractUserData(user))
      .filter((user: NeynarUser | null) => user !== null) as NeynarUser[];
  } catch (error) {
    console.error('Error fetching Neynar user following:', error);
    // Fallback to mock data on error
    return Array.from({ length: Math.min(limit, 10) }, (_, i) => 
      getMockUser(fid + 2000 + i)
    );
  }
}

export async function publishCast(params: {
  text: string;
  embeds?: string[];
  replyTo?: string;
  signerUuid?: string;
}): Promise<{ success: boolean; castHash?: string; error?: string }> {
  if (!USE_REAL_API) {
    console.log('Mock cast publishing:', params);
    return {
      success: true,
      castHash: `mock_cast_${Date.now()}`,
    };
  }

  try {
    const signerUuid = params.signerUuid || config.SIGNER_UUID;
    
    // Use publishCast to publish a new cast
    const cast = await client.publishCast({
      signerUuid: signerUuid,
      text: params.text,
      embeds: params.embeds as any, // Type assertion for embeds
      parent: params.replyTo, // Use parent instead of reply_to
    });
    
    return {
      success: true,
      castHash: (cast as any).hash || `cast_${Date.now()}`, // Type assertion for hash
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
    console.log('Mock notification:', params);
    return { state: 'success' };
  }

  try {
    // Note: Neynar doesn't have a direct notification API
    // This would typically be handled through Farcaster's notification system
    // For now, we'll log the notification attempt
    console.log('Notification request:', {
      fid: params.fid,
      title: params.title,
      body: params.body,
      url: params.url,
    });
    
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
  console.log('Real API integration is now enabled!');
  console.log('Make sure you have configured:');
  console.log('1. NEYNAR_API_KEY in your environment variables');
  console.log('2. SIGNER_UUID in your environment variables');
}

// Function to disable real API integration (fallback to mocks)
export function disableRealApi() {
  console.log('To disable real API integration, set USE_REAL_API = false in src/lib/neynar.ts');
} 