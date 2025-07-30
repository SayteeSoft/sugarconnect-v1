
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
  
  try {
    let allUsers: UserProfile[] = [];

    // In production, only serve users from the blob store.
    if (process.env.NODE_ENV === 'production') {
        const { blobs } = await store.list({ cache: 'no-store' });
        for (const blob of blobs) {
            try {
                const user: UserProfile = await store.get(blob.key, { type: 'json' });
                const { password, ...userToReturn } = user;
                allUsers.push(userToReturn as UserProfile);
            } catch (e) {
                console.warn(`Could not parse blob ${blob.key} as JSON.`, e);
            }
        }
    } else {
        // In development, merge with mock users for testing.
        const userMap = new Map<string, UserProfile>();
        mockUsers.forEach(u => {
            const { password, ...userToReturn } = u;
            userMap.set(userToReturn.id, userToReturn as UserProfile);
        });

        const { blobs } = await store.list({ cache: 'no-store' });
        for (const blob of blobs) {
          try {
            const user: UserProfile = await store.get(blob.key, { type: 'json' });
            // Omit password from the returned user list
            const { password, ...userToReturn } = user;
            userMap.set(user.id, userToReturn as UserProfile);
          } catch (e) {
              console.warn(`Could not parse blob ${blob.key} as JSON, or it was a duplicate.`, e);
          }
        }
        allUsers = Array.from(userMap.values());
    }
    
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ message: 'Failed to list users' }, { status: 500 });
  }
}
