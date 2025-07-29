
import { getStore, type Store } from '@netlify/blobs';
import { NextResponse } from 'next/server';
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

export async function GET() {
  const store = getBlobStore();
  
  try {
    const { blobs } = await store.list();
    const allUsers: UserProfile[] = [];

    // In production, only serve users from the blob store.
    // In development, merge with mock users for testing.
    if (process.env.NODE_ENV !== 'production') {
        allUsers.push(...mockUsers);
    }

    for (const blob of blobs) {
      try {
        const user: UserProfile = await store.get(blob.key, { type: 'json' });
        // Omit password from the returned user list
        const { password, ...userToReturn } = user;
        
        // Ensure no duplicate users are added if they exist in both mocks and blobs (dev only)
        if (!allUsers.some(u => u.id === user.id)) {
            allUsers.push(userToReturn as UserProfile);
        }
      } catch (e) {
          console.warn(`Could not parse blob ${blob.key} as JSON, or it was a duplicate.`, e);
      }
    }
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Failed to list users:', error);
    return NextResponse.json({ message: 'Failed to list users' }, { status: 500 });
  }
}
