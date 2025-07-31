
import { getStore, type Store } from '@netlify/blobs';
import { NextRequest, NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';

const getBlobStore = (): Store => {
    return getStore({
        name: 'users',
        consistency: 'strong',
        siteID: process.env.NETLIFY_SITE_ID || 'studio-mock-site-id',
        token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
    });
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const store = getBlobStore();
  const isProduction = process.env.NETLIFY === 'true';
  
  try {
    const userMap = new Map<string, UserProfile>();

    // Only load mock users in non-production environments
    if (!isProduction) {
        mockUsers.forEach(u => {
            const { password, ...userToReturn } = u;
            userMap.set(userToReturn.id, userToReturn as UserProfile);
        });
    }

    // Overwrite with and add users from the blob store
    const { blobs } = await store.list({ cache: 'no-store' });
    for (const blob of blobs) {
      try {
        const user: UserProfile = await store.get(blob.key, { type: 'json' });
        // Omit password from the returned user list
        const { password, ...userToReturn } = user;
        userMap.set(user.id, userToReturn as UserProfile);
      } catch (e) {
          console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
      }
    }
    
    // Filter out Admin users from the final list
    const allUsers = Array.from(userMap.values()).filter(u => u.role !== 'Admin');
    
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Failed to list users:', error);
    
    if (isProduction) {
      // In production, if blob store fails, return an empty array or handle error
      return NextResponse.json([], { status: 500, statusText: "Failed to retrieve users." });
    }

    // In dev, in case of a blob store error, return at least the mock users (excluding admin)
    const fallbackUsers = mockUsers.filter(u => u.role !== 'Admin');
    return NextResponse.json(fallbackUsers, { status: 500 });
  }
}
