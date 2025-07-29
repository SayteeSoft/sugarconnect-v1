
import { getStore, type Store } from '@netlify/blobs';
import { NextResponse } from 'next/server';
import { UserProfile } from '@/lib/users';
import { mockUsers } from '@/lib/mock-data';

const getBlobStore = (): Store => {
    if (process.env.NETLIFY) {
        return getStore('users');
    }
    return getStore({
        name: 'users',
        consistency: 'strong',
        siteID: process.env.NETLIFY_PROJECT_ID || 'studio-mock-site-id',
        token: process.env.NETLIFY_BLOBS_TOKEN || 'studio-mock-token',
    });
};

export async function GET() {
  const store = getBlobStore();
  
  try {
    const { blobs } = await store.list();
    const allUsers: UserProfile[] = [...mockUsers];
    const mockUserEmails = new Set(mockUsers.map(u => u.email));

    for (const blob of blobs) {
      try {
        const user: UserProfile = await store.get(blob.key, { type: 'json' });
        if (user && user.email && !mockUserEmails.has(user.email)) {
            // Omit password from the returned user list
            const { password, ...userToReturn } = user;
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
